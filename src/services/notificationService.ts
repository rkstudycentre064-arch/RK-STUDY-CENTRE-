/**
 * RK STUDY CENTRE - In-App Notifications & Alerts Service (Task 16)
 * 
 * Authoritative Notification Engine:
 * - Deterministic event-based ID generation for strict duplicate prevention
 * - Single source of truth in Firestore collection 'notifications'
 * - Isolated per-user read/unread state in collection 'notificationReads' (/notificationReads/{userId}_{notificationId})
 * - Role & recipient-scoped targeting (All, Role, Class, Batch, Individual)
 * - Safe optimistic read/unread state synchronization per user
 * - Event generators for Notices, Fees, Exams, Results, Study Materials, Inquiries
 * - Zero fake/demo numbers or counts
 */

import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, withTimeout } from '../lib/firebase';
import type {
  NotificationItem,
  CreateNotificationInput,
  NotificationReadRecord,
  NoticeItem,
  FeeRecord,
  PaymentInstallment,
  Exam,
  ExamSubjectResultRecord,
  StudyMaterialItem,
  InquiryItem,
} from '../types';

const LOCAL_STORAGE_KEY = 'rk_notifications_cache_v1';
const DELETED_NOTIFICATIONS_KEY = 'rk_deleted_notification_ids_v1';

/**
 * Deterministic Notification ID for strict duplicate prevention
 */
export function generateNotificationId(
  sourceType: string,
  sourceId: string,
  recipientId: string,
  eventType: string
): string {
  const cleanSource = (sourceType || 'gen').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanId = (sourceId || 'id').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanRecip = (recipientId || 'all').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanEvent = (eventType || 'event').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `notif_${cleanSource}_${cleanId}_${cleanRecip}_${cleanEvent}`.substring(0, 120);
}

// Local Storage helpers
function getDeletedNotificationIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_NOTIFICATIONS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr);
      }
    }
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error reading deleted notification IDs:', e);
  }
  return new Set<string>();
}

function markNotificationDeleted(id: string) {
  try {
    const set = getDeletedNotificationIds();
    set.add(id);
    localStorage.setItem(DELETED_NOTIFICATIONS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error marking notification deleted:', e);
  }
}

function getLocalNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error reading local notifications:', e);
  }
  return [];
}

function saveLocalNotifications(records: NotificationItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error saving local notifications:', e);
  }
}

// Per-user local read state helpers
function getLocalUserReadMap(userId: string): Map<string, boolean> {
  const map = new Map<string, boolean>();
  try {
    const raw = localStorage.getItem(`rk_user_reads_${userId}`);
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object') {
        Object.entries(obj).forEach(([k, v]) => {
          map.set(k, Boolean(v));
        });
      }
    }
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error reading user read map:', e);
  }
  return map;
}

function saveLocalUserReadMap(userId: string, map: Map<string, boolean>) {
  try {
    const obj: Record<string, boolean> = {};
    map.forEach((v, k) => {
      obj[k] = v;
    });
    localStorage.setItem(`rk_user_reads_${userId}`, JSON.stringify(obj));
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error saving user read map:', e);
  }
}

/**
 * Fetch personal read states for a specific user from Firestore / local cache (Secured by filter query)
 */
export async function getUserReadMap(userId: string): Promise<Map<string, boolean>> {
  const map = getLocalUserReadMap(userId);

  try {
    const colRef = collection(db, 'notificationReads');
    // SECURE FIREWALL: strictly filter by userId to obey firestore security rules
    const q = query(colRef, where('userId', '==', userId));
    const snapshot = await withTimeout(getDocs(q), 3000, null);
    if (snapshot && !snapshot.empty) {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as NotificationReadRecord;
        if (data && data.userId === userId && data.notificationId) {
          map.set(data.notificationId, Boolean(data.isRead));
        }
      });
      saveLocalUserReadMap(userId, map);
    }
  } catch (err) {
    console.warn('[notificationService] Failed to load notificationReads from Firestore, using local cache:', err);
  }

  return map;
}

/**
 * Fetch all notifications (Owner/Admin view) with Owner's per-user read state merged
 */
export async function getAllNotifications(ownerUserId = 'owner'): Promise<NotificationItem[]> {
  const deletedIds = getDeletedNotificationIds();
  const list: NotificationItem[] = [];
  const seenIds = new Set<string>();

  // 1. Fetch from Firestore with timeout
  try {
    const colRef = collection(db, 'notifications');
    const snapshot = await withTimeout(getDocs(colRef), 4000, null);
    if (snapshot && !snapshot.empty) {
      snapshot.forEach((docSnap) => {
        const id = docSnap.id;
        if (!deletedIds.has(id)) {
          seenIds.add(id);
          const data = docSnap.data() as NotificationItem;
          list.push({
            ...data,
            id,
          });
        }
      });
    }
  } catch (err) {
    console.warn('[notificationService] Firestore getDocs failed, using local cache:', err);
  }

  // 2. Fallback to local storage for any missing records
  const localList = getLocalNotifications();
  localList.forEach((localItem) => {
    if (!deletedIds.has(localItem.id) && !seenIds.has(localItem.id)) {
      seenIds.add(localItem.id);
      list.push(localItem);
    }
  });

  // 3. Merge Owner's isolated read state
  const ownerReads = await getUserReadMap(ownerUserId);
  list.forEach((n) => {
    if (ownerReads.has(n.id)) {
      n.isRead = Boolean(ownerReads.get(n.id));
    }
  });

  // Sort by createdAt descending
  list.sort((a, b) => {
    const tA = new Date(a.createdAt || 0).getTime();
    const tB = new Date(b.createdAt || 0).getTime();
    return tB - tA;
  });

  saveLocalNotifications(list);
  return list;
}

/**
 * Fetch notifications applicable to a specific recipient user with isolated per-user read state
 * Enforces precise targeted Firestore queries to avoid PERMISSION_DENIED on non-admin reads
 */
export async function getNotificationsForRecipient(
  recipientId: string,
  recipientRole: 'student' | 'teacher' | 'owner' | 'admin' = 'student',
  classLevel?: string,
  enrolledCourseIds?: string[]
): Promise<NotificationItem[]> {
  const nowStr = new Date().toISOString();
  const deletedIds = getDeletedNotificationIds();
  const mergedList: NotificationItem[] = [];
  const seenIds = new Set<string>();

  // If user is Owner or Admin, they can read all notifications unfiltered
  if (recipientRole === 'owner' || recipientRole === 'admin') {
    const all = await getAllNotifications(recipientId);
    return all.filter((n) => {
      if (n.expiresAt && n.expiresAt < nowStr) return false;
      return true;
    });
  }

  // Non-admin user: Executing parallel, highly-targeted rules-compatible queries
  try {
    const colRef = collection(db, 'notifications');
    const queries = [
      // A. All Broadcast Query
      query(colRef, where('recipientScope', '==', 'All')),
      
      // B. Individual Scope Query
      query(colRef, where('recipientScope', '==', 'Individual'), where('recipientId', '==', recipientId)),
      
      // C. Role Scope Query
      query(colRef, where('recipientScope', '==', 'Role'), where('recipientRole', '==', recipientRole))
    ];

    // D. Optional Class Scope Query
    if (classLevel) {
      queries.push(query(colRef, where('recipientScope', '==', 'Class'), where('classLevel', '==', classLevel)));
    }

    // E. Optional Course Scope Query
    if (enrolledCourseIds && enrolledCourseIds.length > 0) {
      // Chunk course ID list to respect Firestore IN operator limits
      const courseChunks: string[][] = [];
      for (let i = 0; i < enrolledCourseIds.length; i += 10) {
        courseChunks.push(enrolledCourseIds.slice(i, i + 10));
      }
      courseChunks.forEach((chunk) => {
        queries.push(query(colRef, where('recipientScope', '==', 'Course'), where('courseId', 'in', chunk)));
      });
    }

    // Load matching targeted scopes
    const snapshots = await Promise.all(
      queries.map((q) => withTimeout(getDocs(q), 3000, null))
    );

    snapshots.forEach((snapshot) => {
      if (snapshot && !snapshot.empty) {
        snapshot.forEach((docSnap) => {
          const id = docSnap.id;
          if (!deletedIds.has(id) && !seenIds.has(id)) {
            const data = docSnap.data() as NotificationItem;
            // Strict security filter matching firestore.rules
            const isOwnerPrivate = data.recipientRole === 'owner' || data.recipientRole === 'admin';
            if (!isOwnerPrivate) {
              seenIds.add(id);
              mergedList.push({
                ...data,
                id,
              });
            }
          }
        });
      }
    });

  } catch (err) {
    console.warn('[notificationService] Firestore targeted queries failed, falling back to offline cache:', err);
  }

  // Merge from offline local cache as fallback
  const localList = getLocalNotifications();
  localList.forEach((localItem) => {
    if (!deletedIds.has(localItem.id) && !seenIds.has(localItem.id)) {
      const isOwnerPrivate = localItem.recipientRole === 'owner' || localItem.recipientRole === 'admin';
      const matchesAll = localItem.recipientScope === 'All';
      const matchesIndiv = localItem.recipientScope === 'Individual' && localItem.recipientId === recipientId;
      const matchesRole = localItem.recipientScope === 'Role' && localItem.recipientRole === recipientRole;
      const matchesClass = localItem.recipientScope === 'Class' && classLevel && localItem.classLevel === classLevel;
      const matchesCourse = localItem.recipientScope === 'Course' && localItem.courseId && enrolledCourseIds && enrolledCourseIds.includes(localItem.courseId);

      if (!isOwnerPrivate && (matchesAll || matchesIndiv || matchesRole || matchesClass || matchesCourse)) {
        seenIds.add(localItem.id);
        mergedList.push(localItem);
      }
    }
  });

  // Sort by date descending
  mergedList.sort((a, b) => {
    const tA = new Date(a.createdAt || 0).getTime();
    const tB = new Date(b.createdAt || 0).getTime();
    return tB - tA;
  });

  // Merge personal user read state map
  const userReads = await getUserReadMap(recipientId);
  const finalWithReads = mergedList.map((item) => ({
    ...item,
    isRead: userReads.has(item.id) ? Boolean(userReads.get(item.id)) : false,
  }));

  // Expiry filter
  return finalWithReads.filter((n) => {
    if (n.expiresAt && n.expiresAt < nowStr) return false;
    return true;
  });
}

/**
 * Get real-time unread count for recipient
 */
export async function getUnreadNotificationsCount(
  recipientId = 'owner',
  recipientRole: 'student' | 'teacher' | 'owner' | 'admin' = 'owner',
  classLevel?: string,
  enrolledCourseIds?: string[]
): Promise<number> {
  const list = await getNotificationsForRecipient(
    recipientId,
    recipientRole,
    classLevel,
    enrolledCourseIds
  );
  return list.filter((n) => !n.isRead).length;
}

/**
 * Mark a single notification as read for a specific user (Isolated in /notificationReads)
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId = 'owner'
): Promise<void> {
  const now = new Date().toISOString();
  const readId = `${userId}_${notificationId}`;

  // 1. Update per-user local cache
  const map = getLocalUserReadMap(userId);
  map.set(notificationId, true);
  saveLocalUserReadMap(userId, map);

  // 2. If current user is owner, also update the local notification cache for immediate UI responsiveness
  if (userId === 'owner') {
    const current = getLocalNotifications();
    const updated = current.map((n) =>
      n.id === notificationId ? { ...n, isRead: true, readAt: now } : n
    );
    saveLocalNotifications(updated);
  }

  // 3. Write isolated read record to /notificationReads/{userId}_{notificationId}
  try {
    const docRef = doc(db, 'notificationReads', readId);
    await withTimeout(
      setDoc(
        docRef,
        {
          id: readId,
          notificationId,
          userId,
          isRead: true,
          readAt: now,
          updatedAt: now,
          serverTimestamp: serverTimestamp(),
        },
        { merge: true }
      ),
      4000,
      null
    );
  } catch (err) {
    console.warn('[notificationService] Failed to record user read state in Firestore:', err);
  }
}

/**
 * Mark all visible notifications as read for a specific user (Isolated in /notificationReads)
 */
export async function markAllNotificationsAsRead(
  recipientId = 'owner',
  recipientRole: 'student' | 'teacher' | 'owner' | 'admin' = 'owner',
  classLevel?: string,
  enrolledCourseIds?: string[]
): Promise<void> {
  const now = new Date().toISOString();
  const visible = await getNotificationsForRecipient(
    recipientId,
    recipientRole,
    classLevel,
    enrolledCourseIds
  );
  const unreadItems = visible.filter((n) => !n.isRead);

  // 1. Update local cache
  const map = getLocalUserReadMap(recipientId);
  unreadItems.forEach((n) => {
    map.set(n.id, true);
  });
  saveLocalUserReadMap(recipientId, map);

  if (recipientId === 'owner') {
    const current = getLocalNotifications();
    const updated = current.map((n) => ({ ...n, isRead: true, readAt: now }));
    saveLocalNotifications(updated);
  }

  // 2. Parallel write to /notificationReads
  await Promise.allSettled(
    unreadItems.map((n) => {
      const readId = `${recipientId}_${n.id}`;
      const docRef = doc(db, 'notificationReads', readId);
      return withTimeout(
        setDoc(
          docRef,
          {
            id: readId,
            notificationId: n.id,
            userId: recipientId,
            isRead: true,
            readAt: now,
            updatedAt: now,
            serverTimestamp: serverTimestamp(),
          },
          { merge: true }
        ),
        3000,
        null
      );
    })
  );
}

/**
 * Delete a notification (Owner/Admin only)
 */
export async function deleteNotification(id: string): Promise<void> {
  markNotificationDeleted(id);
  const current = getLocalNotifications();
  const filtered = current.filter((n) => n.id !== id);
  saveLocalNotifications(filtered);

  try {
    const docRef = doc(db, 'notifications', id);
    await withTimeout(deleteDoc(docRef), 4000, null);
  } catch (err) {
    console.warn('[notificationService] Failed to delete from Firestore:', err);
  }
}

/**
 * Create or Update a Notification with deterministic duplicate prevention
 */
export async function createNotification(
  input: CreateNotificationInput,
  explicitId?: string
): Promise<NotificationItem> {
  if (!input.title?.trim()) {
    throw new Error('सूचना शीर्षक (Title) अनिवार्य है।');
  }
  if (!input.message?.trim()) {
    throw new Error('सूचना संदेश (Message) अनिवार्य है।');
  }

  const now = new Date().toISOString();
  const id =
    explicitId ||
    (input.sourceType && input.sourceId
      ? generateNotificationId(
          input.sourceType,
          input.sourceId,
          input.recipientId || input.recipientRole || 'all',
          input.type || 'gen'
        )
      : `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);

  const item: NotificationItem = {
    id,
    title: input.title.trim(),
    message: input.message.trim(),
    type: input.type || 'General',
    priority: input.priority || 'Normal',
    recipientScope: input.recipientScope || 'All',
    recipientId: input.recipientId,
    recipientRole: input.recipientRole || 'all',
    classLevel: input.classLevel,
    courseId: input.courseId,
    batchName: input.batchName,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    actionRoute: input.actionRoute,
    isRead: false,
    createdAt: now,
    expiresAt: input.expiresAt,
    createdBy: input.createdBy || 'owner',
    createdByEmail: input.createdByEmail || 'rkstudycentre064@gmail.com',
    metadata: input.metadata || {},
  };

  try {
    const docRef = doc(db, 'notifications', id);
    await withTimeout(
      setDoc(docRef, {
        ...item,
        serverTimestamp: serverTimestamp(),
      }),
      5000,
      null
    );
  } catch (err) {
    console.warn('[notificationService] Failed to setDoc in Firestore, saved locally:', err);
  }

  const current = getLocalNotifications();
  const updated = [item, ...current.filter((n) => n.id !== id)];
  saveLocalNotifications(updated);

  return item;
}

// =========================================================================
// EVENT-DRIVEN NOTIFICATION GENERATORS (Tasks 7, 8, 9, 10, 11, 12, 13, 14)
// =========================================================================

/**
 * Task 13: Generate notification when a Notice is published
 */
export async function createNoticeNotification(notice: NoticeItem): Promise<NotificationItem | null> {
  if (notice.publishStatus !== 'published' && notice.status !== 'published') {
    return null; // Do not notify for drafts
  }

  const id = generateNotificationId('notice', notice.id, 'all', 'published');
  return createNotification(
    {
      title: `सूचना: ${notice.title}`,
      message: notice.content.substring(0, 240) + (notice.content.length > 240 ? '...' : ''),
      type: 'Notice',
      priority: notice.priority === 'urgent' ? 'Urgent' : notice.priority === 'important' ? 'Important' : 'Normal',
      recipientScope: 'All',
      recipientRole: 'all',
      sourceType: 'notice',
      sourceId: notice.id,
      actionRoute: 'notices',
      classLevel: notice.classLevel,
      courseId: notice.courseId,
      batchName: notice.batchName,
      createdBy: notice.createdBy || 'owner',
      createdByEmail: notice.createdByEmail || 'rkstudycentre064@gmail.com',
    },
    id
  );
}

/**
 * Tasks 8/9: Generate notification when a Fee Payment is recorded
 */
export async function createFeePaymentNotification(
  fee: FeeRecord,
  installment: PaymentInstallment
): Promise<NotificationItem> {
  const id = generateNotificationId('fee', fee.id, installment.id || 'inst', 'payment');
  return createNotification(
    {
      title: `फीस भुगतान प्राप्त: ₹${Number(installment.amount).toLocaleString('en-IN')}`,
      message: `${fee.studentName} (${fee.courseName}) द्वारा ₹${installment.amount} का भुगतान (${installment.paymentMethod}) दर्ज किया गया। रसीद सं.: ${installment.receiptNo || '-'}`,
      type: 'Fee',
      priority: 'Normal',
      recipientScope: 'Individual',
      recipientId: fee.studentId,
      recipientRole: 'student',
      sourceType: 'fee',
      sourceId: fee.id,
      actionRoute: 'fees',
      classLevel: fee.classLevel,
      courseId: fee.courseId,
      batchName: fee.batchName,
    },
    id
  );
}

/**
 * Task 8: Generate notification for Fee Due Alert
 */
export async function createFeeDueNotification(fee: FeeRecord): Promise<NotificationItem> {
  const id = generateNotificationId('fee', fee.id, fee.studentId, 'due');
  return createNotification(
    {
      title: `फीस बकाया सूचना: ₹${Number(fee.dueAmount).toLocaleString('en-IN')}`,
      message: `${fee.studentName} के ${fee.courseName} कोर्स की शेष बकाया फीस ₹${fee.dueAmount} है। कृपया समय पर जमा करें।`,
      type: 'Fee',
      priority: fee.paymentStatus === 'overdue' ? 'Urgent' : 'Important',
      recipientScope: 'Individual',
      recipientId: fee.studentId,
      recipientRole: 'student',
      sourceType: 'fee',
      sourceId: fee.id,
      actionRoute: 'fees',
      classLevel: fee.classLevel,
      courseId: fee.courseId,
      batchName: fee.batchName,
    },
    id
  );
}

/**
 * Task 10: Generate notification when an Exam is created or schedule updated
 */
export async function createExamNotification(
  exam: Exam,
  eventType: 'created' | 'schedule_updated' | 'cancelled' = 'created'
): Promise<NotificationItem> {
  const id = generateNotificationId('exam', exam.id, 'all', eventType);
  const eventHindi =
    eventType === 'created'
      ? 'नया परीक्षा कार्यक्रम'
      : eventType === 'schedule_updated'
      ? 'परीक्षा समय-सारणी में बदलाव'
      : 'परीक्षा निरस्त';

  return createNotification(
    {
      title: `${eventHindi}: ${exam.title}`,
      message: `कक्षा ${exam.classLevel?.replace('class-', '') || 'सभी'} के लिए ${exam.title} (${exam.startDate} से ${exam.endDate}) घोषित की गई है।`,
      type: 'Exam',
      priority: 'Important',
      recipientScope: 'Class',
      classLevel: exam.classLevel,
      courseId: exam.courseId,
      batchName: exam.batchName,
      sourceType: 'exam',
      sourceId: exam.id,
      actionRoute: 'exams',
    },
    id
  );
}

/**
 * Task 11: Generate notification when Exam Results are published
 */
export async function createResultNotification(
  result: ExamSubjectResultRecord
): Promise<NotificationItem> {
  const id = generateNotificationId('result', result.id, result.studentId, 'published');
  return createNotification(
    {
      title: `परीक्षा परिणाम घोषित: ${result.subjectName}`,
      message: `${result.studentName} का ${result.subjectName} में परिणाम घोषित हुआ: प्राप्तांक ${result.marksObtained}/${result.maxMarks} (${result.percentage}%, ग्रेड ${result.grade})।`,
      type: 'Result',
      priority: 'Important',
      recipientScope: 'Individual',
      recipientId: result.studentId,
      recipientRole: 'student',
      sourceType: 'result',
      sourceId: result.id,
      actionRoute: 'results',
      classLevel: result.classLevel,
    },
    id
  );
}

/**
 * Task 12: Generate notification when new Study Material is published
 */
export async function createStudyMaterialNotification(
  material: StudyMaterialItem
): Promise<NotificationItem> {
  const id = generateNotificationId('study_material', material.id, 'all', 'uploaded');
  return createNotification(
    {
      title: `नई अध्ययन सामग्री: ${material.title}`,
      message: `कक्षा ${material.classLevel?.replace('class-', '') || 'सामान्य'} के लिए नई अध्ययन सामग्री (${material.subjectName || material.type}) अपलोड की गई है।`,
      type: 'StudyMaterial',
      priority: 'Normal',
      recipientScope: 'Class',
      classLevel: material.classLevel,
      sourceType: 'study_material',
      sourceId: material.id,
      actionRoute: 'study-material',
    },
    id
  );
}

/**
 * Task 14: Generate notification for Owner when a new Inquiry is received
 */
export async function createInquiryNotification(
  inquiry: InquiryItem
): Promise<NotificationItem> {
  const id = generateNotificationId('inquiry', inquiry.id, 'owner', 'new');
  return createNotification(
    {
      title: `नई पूछताछ प्राप्त: ${inquiry.name}`,
      message: `${inquiry.name} (${inquiry.phone}) ने "${inquiry.subject || inquiry.inquiryType}" विषय पर पूछताछ भेजी है।`,
      type: 'Inquiry',
      priority: inquiry.priority === 'Urgent' ? 'Urgent' : inquiry.priority === 'Important' ? 'Important' : 'Normal',
      recipientScope: 'Role',
      recipientRole: 'owner',
      sourceType: 'inquiry',
      sourceId: inquiry.id,
      actionRoute: 'inquiries',
    },
    id
  );
}
