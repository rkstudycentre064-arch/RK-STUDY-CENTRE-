/**
 * RK STUDY CENTRE - Institutional Notices & Circulars Service (Task 13)
 * 
 * Manages Firestore persistence and Firebase Storage uploads for Notices and Circulars.
 * Features:
 * - Audience targeting: All, Students, Teachers, Specific Class, Specific Course, Specific Batch.
 * - Notice Types: General, Circular, Holiday, Exam, Fee, Attendance, Important.
 * - Priorities: Normal, Important, Urgent.
 * - Lifecycle: Draft, Published, Archived.
 * - Local-first fallback caching to prevent data loss.
 * - Storage attachment support (PDF / Images) with safe cleanup.
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage, withTimeout } from '../lib/firebase';
import type {
  ClassLevel,
  NoticeItem,
  NoticeType,
  NoticeAudience,
  NoticePriority,
  NoticePublishStatus,
  CreateNoticeInput,
} from '../types';

const OWNER_NOTICES_STORAGE_KEY = 'rk_owner_custom_notices';

/**
 * Format bytes to readable size string
 */
export function formatNoticeBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Sanitize filename for safe storage upload
 */
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

/**
 * Delete a specific attachment file from Firebase Storage
 */
export async function deleteNoticeAttachmentFile(storagePath?: string | null): Promise<void> {
  if (!storagePath || storagePath.startsWith('local')) return;
  try {
    const fileRef = storageRef(storage, storagePath);
    await deleteObject(fileRef);
    console.log(`[RK STUDY CENTRE] Notice attachment deleted from storage: ${storagePath}`);
  } catch (err) {
    console.warn('[noticeService] Failed to delete storage file (handled safely):', err);
  }
}

/**
 * Read custom notices stored in local storage
 */
function getLocalCustomNotices(): NoticeItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OWNER_NOTICES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[noticeService] Failed to read local custom notices:', err);
    return [];
  }
}

/**
 * Save custom notices to local storage
 */
function saveLocalCustomNotices(notices: NoticeItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(OWNER_NOTICES_STORAGE_KEY, JSON.stringify(notices));
  } catch (err) {
    console.warn('[noticeService] Failed to save local custom notices:', err);
  }
}

/**
 * Fetch all notices for Owner Portal management
 */
export async function getAllNotices(includeArchived = true): Promise<NoticeItem[]> {
  const noticesMap = new Map<string, NoticeItem>();

  // 1. Load local custom notices first
  const localList = getLocalCustomNotices();
  localList.forEach((n) => {
    noticesMap.set(n.id, n);
  });

  // 2. Fetch from Firestore collection 'notices'
  try {
    const colRef = collection(db, 'notices');
    const snapshot = await withTimeout(getDocs(colRef), 3500, null);
    if (snapshot) {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as NoticeItem;
        noticesMap.set(docSnap.id, {
          ...data,
          id: docSnap.id,
        });
      });
    }
  } catch (error) {
    console.warn('[noticeService] Error fetching notices from Firestore:', error);
  }

  const notices = Array.from(noticesMap.values());

  // Filter archived if requested
  const filtered = includeArchived ? notices : notices.filter((n) => n.publishStatus !== 'archived');

  // Sort descending by createdAt or publishAt
  filtered.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  return filtered;
}

/**
 * Public/Student/Teacher visible notices query
 * Enforces:
 * - Only published notices
 * - Not expired (expiresAt >= now)
 * - Already published (publishAt <= now)
 * - Matching audience targeting
 */
export async function getPublicNotices(options?: {
  audience?: NoticeAudience;
  classLevel?: ClassLevel;
  courseId?: string;
  batchName?: string;
}): Promise<NoticeItem[]> {
  const all = await getAllNotices(false);
  const now = new Date();

  return all.filter((notice) => {
    // 1. Must be published
    if (notice.publishStatus !== 'published') {
      return false;
    }

    // 2. Check future publishAt
    if (notice.publishAt) {
      const pubDate = new Date(notice.publishAt);
      if (!isNaN(pubDate.getTime()) && pubDate > now) {
        return false;
      }
    }

    // 3. Check expiration
    if (notice.expiresAt) {
      const expDate = new Date(notice.expiresAt);
      if (!isNaN(expDate.getTime()) && expDate < now) {
        return false;
      }
    }

    // 4. Audience filtering
    if (!options || !options.audience) {
      return true;
    }

    if (notice.audience === 'all') {
      return true;
    }

    if (notice.audience === options.audience) {
      return true;
    }

    if (notice.audience === 'students' && options.audience === 'students') {
      return true;
    }

    if (notice.audience === 'teachers' && options.audience === 'teachers') {
      return true;
    }

    if (notice.audience === 'specific_class') {
      return options.classLevel && notice.classLevel === options.classLevel;
    }

    if (notice.audience === 'specific_course') {
      return options.courseId && notice.courseId === options.courseId;
    }

    if (notice.audience === 'specific_batch') {
      return (
        options.batchName &&
        notice.batchName &&
        options.batchName.trim().toLowerCase() === notice.batchName.trim().toLowerCase()
      );
    }

    return false;
  });
}

/**
 * Create a new notice or circular
 */
export async function createNotice(input: CreateNoticeInput): Promise<NoticeItem> {
  const title = input.title ? input.title.trim() : '';
  const content = input.content ? input.content.trim() : '';

  if (!title) {
    throw new Error('कृपया सूचना का शीर्षक (Notice Title) दर्ज करें।');
  }

  if (title.length > 250) {
    throw new Error('शीर्षक अधिकतम 250 अक्षरों का होना चाहिए।');
  }

  if (!content) {
    throw new Error('कृपया सूचना का विस्तृत विवरण (Content) दर्ज करें।');
  }

  if (!input.noticeType) {
    throw new Error('कृपया सूचना का प्रकार (Notice Type) चुनें।');
  }

  if (!input.audience) {
    throw new Error('कृपया लक्षित दर्शक (Target Audience) चुनें।');
  }

  // Audience targeting validations
  if (input.audience === 'specific_class' && !input.classLevel) {
    throw new Error('विशिष्ट कक्षा के लिए कक्षा (Class) का चयन अनिवार्य है।');
  }

  if (input.audience === 'specific_course' && !input.courseId) {
    throw new Error('विशिष्ट कोर्स के लिए कोर्स (Course) का चयन अनिवार्य है।');
  }

  if (input.audience === 'specific_batch' && !input.batchName?.trim()) {
    throw new Error('विशिष्ट बैच के लिए बैच का नाम (Batch Name) दर्ज करना अनिवार्य है।');
  }

  // Date validations
  if (input.publishAt && input.expiresAt) {
    const pub = new Date(input.publishAt).getTime();
    const exp = new Date(input.expiresAt).getTime();
    if (!isNaN(pub) && !isNaN(exp) && exp < pub) {
      throw new Error('समाप्ति तिथि (Expiry Date) प्रकाशन तिथि (Publish Date) से पहले नहीं हो सकती।');
    }
  }

  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  const noticeId = `notice_${timestamp}_${randomStr}`;
  const nowIso = new Date().toISOString();

  const newNotice: NoticeItem = {
    id: noticeId,
    title,
    content,
    noticeType: input.noticeType,
    audience: input.audience,
    classLevel: input.classLevel,
    courseId: input.courseId,
    courseName: input.courseName,
    batchName: input.batchName ? input.batchName.trim() : undefined,
    priority: input.priority || 'normal',
    publishStatus: input.publishStatus || 'draft',
    publishAt: input.publishAt || nowIso,
    expiresAt: input.expiresAt || undefined,
    attachmentUrl: input.attachmentUrl,
    attachmentName: input.attachmentName,
    attachmentType: input.attachmentType,
    attachmentSize: input.attachmentSize,
    storagePath: input.storagePath,
    createdBy: input.createdBy || 'owner',
    createdByEmail: input.createdByEmail || 'rkstudycentre064@gmail.com',
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // 1. Save to local cache first for resilience
  const localList = getLocalCustomNotices();
  saveLocalCustomNotices([newNotice, ...localList.filter((n) => n.id !== noticeId)]);

  // 2. Persist to Firestore 'notices'
  try {
    const docRef = doc(db, 'notices', noticeId);
    await setDoc(docRef, {
      ...newNotice,
      serverTime: serverTimestamp(),
    });
    console.log(`[RK STUDY CENTRE] Notice saved to Firestore: ${noticeId}`);
  } catch (firestoreErr) {
    console.warn('[RK STUDY CENTRE] Notice Firestore save notice (saved in local resilient storage):', firestoreErr);
  }

  return newNotice;
}

/**
 * Update an existing notice
 */
export async function updateNotice(
  id: string,
  updates: Partial<NoticeItem>
): Promise<NoticeItem> {
  const existingList = await getAllNotices(true);
  const existing = existingList.find((n) => n.id === id);

  if (!existing) {
    throw new Error('संबंधित सूचना नहीं मिली (Notice not found).');
  }

  // Audience targeting validations if updated
  const targetAudience = updates.audience !== undefined ? updates.audience : existing.audience;
  const targetClass = updates.classLevel !== undefined ? updates.classLevel : existing.classLevel;
  const targetCourse = updates.courseId !== undefined ? updates.courseId : existing.courseId;
  const targetBatch = updates.batchName !== undefined ? updates.batchName : existing.batchName;

  if (targetAudience === 'specific_class' && !targetClass) {
    throw new Error('विशिष्ट कक्षा के लिए कक्षा (Class) का चयन अनिवार्य है।');
  }

  if (targetAudience === 'specific_course' && !targetCourse) {
    throw new Error('विशिष्ट कोर्स के लिए कोर्स (Course) का चयन अनिवार्य है।');
  }

  if (targetAudience === 'specific_batch' && (!targetBatch || !targetBatch.trim())) {
    throw new Error('विशिष्ट बैच के लिए बैच का नाम (Batch Name) दर्ज करना अनिवार्य है।');
  }

  // Date validations if updated
  const pubDateStr = updates.publishAt !== undefined ? updates.publishAt : existing.publishAt;
  const expDateStr = updates.expiresAt !== undefined ? updates.expiresAt : existing.expiresAt;

  if (pubDateStr && expDateStr) {
    const pub = new Date(pubDateStr).getTime();
    const exp = new Date(expDateStr).getTime();
    if (!isNaN(pub) && !isNaN(exp) && exp < pub) {
      throw new Error('समाप्ति तिथि (Expiry Date) प्रकाशन तिथि (Publish Date) से पहले नहीं हो सकती।');
    }
  }

  const nowIso = new Date().toISOString();
  const updatedNotice: NoticeItem = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt, // Preserve original creation timestamp
    updatedAt: nowIso,
  };

  // 1. Update local cache
  const localList = getLocalCustomNotices();
  const updatedLocal = localList.map((n) => (n.id === id ? updatedNotice : n));
  saveLocalCustomNotices(updatedLocal);

  // 2. Update Firestore
  try {
    const docRef = doc(db, 'notices', id);
    const cleanUpdates: Record<string, any> = {
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: nowIso,
      serverTime: serverTimestamp(),
    };

    // Clean undefined fields
    Object.keys(cleanUpdates).forEach((k) => {
      if (cleanUpdates[k] === undefined) {
        delete cleanUpdates[k];
      }
    });

    await updateDoc(docRef, cleanUpdates);
    console.log(`[RK STUDY CENTRE] Notice updated in Firestore: ${id}`);
  } catch (firestoreErr) {
    console.warn('[RK STUDY CENTRE] Notice Firestore update notice (saved in local resilient storage):', firestoreErr);
  }

  return updatedNotice;
}

/**
 * Quick toggle status for notice (Draft / Published / Archived)
 */
export async function toggleNoticeStatus(
  id: string,
  newStatus: NoticePublishStatus
): Promise<void> {
  await updateNotice(id, {
    publishStatus: newStatus,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a notice and clean up associated storage attachment
 */
export async function deleteNotice(notice: NoticeItem): Promise<void> {
  // 1. Remove from local cache
  const localList = getLocalCustomNotices();
  saveLocalCustomNotices(localList.filter((n) => n.id !== notice.id));

  // 2. Delete storage file if attachment exists
  if (notice.storagePath && !notice.storagePath.startsWith('local')) {
    try {
      const fileRef = storageRef(storage, notice.storagePath);
      await deleteObject(fileRef);
    } catch (storageErr) {
      console.warn('[RK STUDY CENTRE] Notice attachment storage deletion notice:', storageErr);
    }
  }

  // 3. Delete from Firestore
  try {
    const docRef = doc(db, 'notices', notice.id);
    await deleteDoc(docRef);
    console.log(`[RK STUDY CENTRE] Notice deleted from Firestore: ${notice.id}`);
  } catch (firestoreErr) {
    console.warn('[RK STUDY CENTRE] Notice Firestore delete notice:', firestoreErr);
  }
}

/**
 * Upload notice attachment (PDF or Image)
 */
export async function uploadNoticeAttachment(
  file: File,
  noticeId: string,
  onProgress?: (percent: number) => void
): Promise<{
  url: string;
  path: string;
  name: string;
  size: string;
  type: 'pdf' | 'image';
}> {
  if (!file) {
    throw new Error('कृपया अपलोड करने के लिए एक फ़ाइल चुनें।');
  }

  // Allowed formats: PDF or Image
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isImage =
    file.type.startsWith('image/') ||
    /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);

  if (!isPdf && !isImage) {
    throw new Error('केवल PDF या छवि (Image: JPG, PNG, WEBP) प्रारूप समर्थित है।');
  }

  // 25MB max size limit
  const MAX_SIZE = 25 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error('संलग्नक का आकार 25 MB से कम होना चाहिए।');
  }

  if (onProgress) onProgress(10);

  const safeName = sanitizeFileName(file.name);
  const storagePath = `notices/${noticeId}/${Date.now()}_${safeName}`;

  try {
    const fileStorageRef = storageRef(storage, storagePath);
    const uploadTask = uploadBytesResumable(fileStorageRef, file, {
      contentType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
      customMetadata: {
        noticeId,
        fileName: file.name,
      },
    });

    const downloadUrl = await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = 10 + Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 85);
          if (onProgress) onProgress(Math.min(95, progress));
        },
        (error) => {
          reject(new Error(`स्टोरेज अपलोड विफल: ${error.message}`));
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (e: any) {
            reject(new Error(`डाउनलोड URL प्राप्त करने में त्रुटि: ${e?.message}`));
          }
        }
      );
    });

    if (onProgress) onProgress(100);

    return {
      url: downloadUrl,
      path: storagePath,
      name: file.name,
      size: formatNoticeBytes(file.size),
      type: isPdf ? 'pdf' : 'image',
    };
  } catch (err: any) {
    console.error('[RK STUDY CENTRE] Storage upload error:', err);
    throw new Error(`फ़ाइल अपलोड विफल रही (Storage upload failed): ${err?.message || 'अज्ञात त्रुटि'}`);
  }
}
