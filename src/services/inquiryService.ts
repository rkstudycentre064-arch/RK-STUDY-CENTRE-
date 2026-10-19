/**
 * RK STUDY CENTRE - Messages & Inquiries Service (Task 14)
 * 
 * Manages Firestore persistence and local fallback caching for student/parent/public inquiries.
 * Features:
 * - Public submission from Website Contact form & Dedicated Support Page.
 * - Owner/Admin inbox management: status workflow (New -> InProgress -> Replied -> Resolved -> Archived).
 * - Priority tagging: Normal, Important, Urgent.
 * - Staff assignment and direct response logging.
 * - In-app deletion and updates with zero browser alerts.
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db, withTimeout } from '../lib/firebase';
import type {
  InquiryItem,
  InquiryType,
  InquirySource,
  InquiryStatus,
  InquiryPriority,
  CreateInquiryInput,
} from '../types';

const OWNER_INQUIRIES_STORAGE_KEY = 'rk_owner_inquiries_cache';

/**
 * Read cached inquiries from local storage as offline resilience fallback
 */
function getCachedInquiries(): InquiryItem[] {
  try {
    const raw = localStorage.getItem(OWNER_INQUIRIES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('[inquiryService] Failed to read cached inquiries:', e);
    return [];
  }
}

/**
 * Update cached inquiries in local storage
 */
function setCachedInquiries(inquiries: InquiryItem[]): void {
  try {
    localStorage.setItem(OWNER_INQUIRIES_STORAGE_KEY, JSON.stringify(inquiries));
  } catch (e) {
    console.warn('[inquiryService] Failed to save inquiries cache:', e);
  }
}

/**
 * Convert raw Firestore doc to InquiryItem
 */
function mapDocToInquiry(docId: string, data: any): InquiryItem {
  return {
    id: docId,
    name: data.name || 'अज्ञात प्रेषक',
    phone: data.phone || '',
    email: data.email || '',
    subject: data.subject || '',
    message: data.message || '',
    inquiryType: (data.inquiryType as InquiryType) || 'General',
    source: (data.source as InquirySource) || 'Website',
    status: (data.status as InquiryStatus) || 'New',
    priority: (data.priority as InquiryPriority) || 'Normal',
    classLevel: data.classLevel || undefined,
    assignedTo: data.assignedTo || undefined,
    assignedToEmail: data.assignedToEmail || undefined,
    reply: data.reply || undefined,
    repliedAt: data.repliedAt || undefined,
    repliedBy: data.repliedBy || undefined,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    lastActivityAt: data.lastActivityAt || data.updatedAt || data.createdAt,
    userId: data.userId || undefined,
  };
}

/**
 * Fetch all inquiries for Owner inbox
 */
export async function getAllInquiries(): Promise<InquiryItem[]> {
  try {
    const inquiriesRef = collection(db, 'inquiries');
    const snapshot = await withTimeout(getDocs(inquiriesRef), 7000, null);

    const items: InquiryItem[] = [];
    if (snapshot && typeof snapshot.forEach === 'function') {
      snapshot.forEach((d) => {
        const data = d.data();
        items.push(mapDocToInquiry(d.id, data));
      });
    }

    // Sort by createdAt descending
    items.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return timeB - timeA;
    });

    setCachedInquiries(items);
    return items;
  } catch (err) {
    console.warn('[inquiryService] Firestore load failed, falling back to local cache:', err);
    const cached = getCachedInquiries();
    cached.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return timeB - timeA;
    });
    return cached;
  }
}

/**
 * Validate inquiry input
 */
export function validateInquiryInput(input: CreateInquiryInput): { isValid: boolean; error?: string } {
  const name = (input.name || '').trim();
  const message = (input.message || '').trim();
  const phone = (input.phone || '').trim();
  const email = (input.email || '').trim();

  if (!name) {
    return { isValid: false, error: 'कृपया प्रेषक का नाम दर्ज करें (Name is required)' };
  }
  if (!message) {
    return { isValid: false, error: 'कृपया संदेश या पूछताछ का विवरण दर्ज करें (Message is required)' };
  }
  if (!phone && !email) {
    return { isValid: false, error: 'कृपया संपर्क हेतु मोबाइल नंबर या ईमेल में से कम से कम एक अवश्य दर्ज करें' };
  }
  return { isValid: true };
}

/**
 * Create a new inquiry (Public or Owner manual submission)
 */
export async function createInquiry(input: CreateInquiryInput): Promise<InquiryItem> {
  const validation = validateInquiryInput(input);
  if (!validation.isValid) {
    throw new Error(validation.error || 'अमान्य पूछताछ डेटा');
  }

  const inquiryId = `inq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const item: InquiryItem = {
    id: inquiryId,
    name: input.name.trim(),
    phone: (input.phone || '').trim(),
    email: (input.email || '').trim(),
    subject: (input.subject || '').trim(),
    message: input.message.trim(),
    inquiryType: input.inquiryType || 'General',
    source: input.source || 'Website',
    status: input.status || 'New',
    priority: input.priority || 'Normal',
    classLevel: input.classLevel,
    assignedTo: input.assignedTo?.trim() || undefined,
    assignedToEmail: input.assignedToEmail?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
    userId: input.userId,
  };

  try {
    const docRef = doc(db, 'inquiries', inquiryId);
    const firestorePayload: Record<string, any> = {
      id: inquiryId,
      name: item.name,
      phone: item.phone,
      email: item.email || '',
      subject: item.subject || '',
      message: item.message,
      inquiryType: item.inquiryType,
      source: item.source,
      status: item.status,
      priority: item.priority,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      lastActivityAt: item.lastActivityAt,
      serverTimestamp: serverTimestamp(),
    };

    if (item.classLevel) firestorePayload.classLevel = item.classLevel;
    if (item.userId) firestorePayload.userId = item.userId;
    if (item.assignedTo) firestorePayload.assignedTo = item.assignedTo;
    if (item.assignedToEmail) firestorePayload.assignedToEmail = item.assignedToEmail;

    await withTimeout(
      setDoc(docRef, firestorePayload),
      6000,
      null
    );
  } catch (err) {
    console.warn('[inquiryService] Firestore setDoc failed, saving to local cache:', err);
  }

  // Update local cache
  const cached = getCachedInquiries();
  const updated = [item, ...cached.filter((c) => c.id !== inquiryId)];
  setCachedInquiries(updated);

  return item;
}

/**
 * Update status of an inquiry
 */
export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<void> {
  const now = new Date().toISOString();
  try {
    const docRef = doc(db, 'inquiries', id);
    await withTimeout(
      updateDoc(docRef, {
        status,
        updatedAt: now,
        lastActivityAt: now,
      }),
      6000,
      null
    );
  } catch (err) {
    console.warn('[inquiryService] Firestore updateStatus failed:', err);
  }

  // Local cache update
  const cached = getCachedInquiries();
  const item = cached.find((c) => c.id === id);
  if (item) {
    item.status = status;
    item.updatedAt = now;
    item.lastActivityAt = now;
    setCachedInquiries([...cached]);
  }
}

/**
 * Update priority of an inquiry
 */
export async function updateInquiryPriority(id: string, priority: InquiryPriority): Promise<void> {
  const now = new Date().toISOString();
  try {
    const docRef = doc(db, 'inquiries', id);
    await withTimeout(
      updateDoc(docRef, {
        priority,
        updatedAt: now,
        lastActivityAt: now,
      }),
      6000,
      null
    );
  } catch (err) {
    console.warn('[inquiryService] Firestore updatePriority failed:', err);
  }

  // Local cache update
  const cached = getCachedInquiries();
  const item = cached.find((c) => c.id === id);
  if (item) {
    item.priority = priority;
    item.updatedAt = now;
    item.lastActivityAt = now;
    setCachedInquiries([...cached]);
  }
}

/**
 * Assign an inquiry to a team member
 */
export async function assignInquiry(
  id: string,
  assignedTo: string,
  assignedToEmail?: string
): Promise<void> {
  const now = new Date().toISOString();
  try {
    const docRef = doc(db, 'inquiries', id);
    await withTimeout(
      updateDoc(docRef, {
        assignedTo,
        assignedToEmail: assignedToEmail || null,
        updatedAt: now,
        lastActivityAt: now,
      }),
      6000,
      null
    );
  } catch (err) {
    console.warn('[inquiryService] Firestore assignInquiry failed:', err);
  }

  const cached = getCachedInquiries();
  const item = cached.find((c) => c.id === id);
  if (item) {
    item.assignedTo = assignedTo;
    item.assignedToEmail = assignedToEmail;
    item.updatedAt = now;
    item.lastActivityAt = now;
    setCachedInquiries([...cached]);
  }
}

/**
 * Add a reply to an inquiry
 */
export async function replyToInquiry(
  id: string,
  replyText: string,
  repliedBy: string,
  newStatus: InquiryStatus = 'Replied'
): Promise<void> {
  const now = new Date().toISOString();
  try {
    const docRef = doc(db, 'inquiries', id);
    await withTimeout(
      updateDoc(docRef, {
        reply: replyText.trim(),
        repliedAt: now,
        repliedBy: repliedBy.trim(),
        status: newStatus,
        updatedAt: now,
        lastActivityAt: now,
      }),
      6000,
      null
    );
  } catch (err) {
    console.warn('[inquiryService] Firestore replyToInquiry failed:', err);
  }

  const cached = getCachedInquiries();
  const item = cached.find((c) => c.id === id);
  if (item) {
    item.reply = replyText.trim();
    item.repliedAt = now;
    item.repliedBy = repliedBy.trim();
    item.status = newStatus;
    item.updatedAt = now;
    item.lastActivityAt = now;
    setCachedInquiries([...cached]);
  }
}

/**
 * Delete an inquiry permanently
 */
export async function deleteInquiry(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'inquiries', id);
    await withTimeout(deleteDoc(docRef), 6000, null);
  } catch (err) {
    console.warn('[inquiryService] Firestore deleteDoc failed:', err);
  }

  const cached = getCachedInquiries();
  setCachedInquiries(cached.filter((c) => c.id !== id));
}
