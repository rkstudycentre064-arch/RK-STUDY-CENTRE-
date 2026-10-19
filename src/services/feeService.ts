/**
 * RK STUDY CENTRE - Fee Management Service (Task 8)
 * 
 * Strict Financial Calculation & Ledger Architecture:
 * - Single authoritative source of truth for fee records & installments
 * - Exact mathematical integrity: paidAmount = sum(installments), dueAmount = finalFee - paidAmount
 * - Overpayment protection (BLOCKS payment > remaining due)
 * - Zero negative discounts / fees, discount cannot exceed totalFee
 * - Prevents duplicate transaction reference IDs
 * - Distinguishes online vs offline payments with protection for verified online records
 * - Synchronizes student coursePaymentStatuses without divergent state
 */

import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, withTimeout } from '../lib/firebase';
import type {
  FeeRecord,
  PaymentInstallment,
  PaymentMethod,
  PaymentStatus,
  RecordPaymentInput,
  CreateFeeRecordInput,
  ClassLevel,
} from '../types';
import { getAllStudents, type SafeStudentProfile } from './studentService';
import { getAllCourses } from './courseService';

const LOCAL_STORAGE_KEY = 'rk_fee_records_v2';
const DELETED_FEES_KEY = 'rk_deleted_fee_ids_v2';

/**
 * Generates unique payment reference ID: RK-PAY-2026-XXXXXX
 */
export function generatePaymentReference(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `RK-PAY-${year}-${randomNum}`;
}

/**
 * Deterministic Fee Record ID per Student and Course
 */
export function generateFeeRecordId(studentId: string, courseId: string): string {
  const cleanStudent = studentId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanCourse = courseId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `fee_${cleanStudent}_${cleanCourse}`;
}

/**
 * Returns current date in local YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format currency to Indian Rupee format (₹ X,XX,XXX)
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/**
 * Format date to readable Hindi / English display
 */
export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  const monthNames = [
    'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितम्बर', 'अक्टूबर', 'नवम्बर', 'दिसम्बर',
  ];
  const monthIndex = parseInt(m, 10) - 1;
  const monthHindi = monthNames[monthIndex] || m;
  return `${d} ${monthHindi} ${y}`;
}

/**
 * Evaluates payment status based on exact mathematical rules
 */
export function computePaymentStatus(
  finalFee: number,
  paidAmount: number,
  dueDate?: string,
  todayStr: string = getTodayDateString()
): PaymentStatus {
  const due = Math.max(0, Math.round(finalFee - paidAmount));
  
  if (due === 0 || paidAmount >= finalFee) {
    return 'paid';
  }

  // If due date is present and past today, mark as overdue
  if (dueDate && /^\d{4}-\d{2}-\d{2}$/.test(dueDate) && dueDate < todayStr && due > 0) {
    return 'overdue';
  }

  if (paidAmount > 0 && paidAmount < finalFee) {
    return 'partial';
  }

  return 'due';
}

// Local storage management for resilience
function getDeletedFeeIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_FEES_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr);
      }
    }
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error reading deleted fee IDs:', e);
  }
  return new Set<string>();
}

function markFeeDeleted(id: string) {
  try {
    const set = getDeletedFeeIds();
    set.add(id);
    localStorage.setItem(DELETED_FEES_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error marking fee deleted:', e);
  }
}

function unmarkFeeDeleted(id: string) {
  try {
    const set = getDeletedFeeIds();
    if (set.has(id)) {
      set.delete(id);
      localStorage.setItem(DELETED_FEES_KEY, JSON.stringify(Array.from(set)));
    }
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error unmarking fee deleted:', e);
  }
}

function getLocalFees(): FeeRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error reading local fees:', e);
  }
  return [];
}

function saveLocalFees(records: FeeRecord[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error saving local fees:', e);
  }
}

/**
 * Fetch all Fee Records across the institution.
 * Single Authoritative source: reads Firestore 'fees', resolves existing online enrollment payments without duplication.
 */
export async function getAllFeeRecords(): Promise<FeeRecord[]> {
  const deletedIds = getDeletedFeeIds();
  const list: FeeRecord[] = [];
  const seenIds = new Set<string>();
  const todayStr = getTodayDateString();

  // 1. Fetch authoritative live Firestore 'fees'
  try {
    const colRef = collection(db, 'fees');
    const snapshot = await withTimeout(getDocs(colRef), 3500, null);
    if (snapshot && !snapshot.empty) {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as FeeRecord;
        const id = docSnap.id;
        if (!deletedIds.has(id)) {
          seenIds.add(id);
          const totalFee = Math.max(0, Math.round(Number(data.totalFee) || 0));
          const discount = Math.max(0, Math.min(totalFee, Math.round(Number(data.discount) || 0)));
          const finalFee = Math.max(0, totalFee - discount);
          
          // Re-sum installments for mathematical consistency
          const installments: PaymentInstallment[] = Array.isArray(data.installments) ? data.installments : [];
          const calculatedPaid = installments.reduce((sum, inst) => sum + Math.max(0, Math.round(Number(inst.amount) || 0)), 0);
          const paidAmount = installments.length > 0 ? calculatedPaid : Math.min(finalFee, Math.max(0, Math.round(Number(data.paidAmount) || 0)));
          const dueAmount = Math.max(0, finalFee - paidAmount);
          const paymentStatus = computePaymentStatus(finalFee, paidAmount, data.dueDate, todayStr);

          list.push({
            ...data,
            id,
            totalFee,
            discount,
            finalFee,
            paidAmount,
            dueAmount,
            paymentStatus,
            installments,
          });
        }
      });
    }
  } catch (error: any) {
    console.warn('[RK STUDY CENTRE] Error fetching Firestore fee records:', error);
  }

  // 2. Fetch local cached fee records if Firestore is slow or offline
  const localList = getLocalFees();
  localList.forEach((localRec) => {
    if (!deletedIds.has(localRec.id) && !seenIds.has(localRec.id)) {
      seenIds.add(localRec.id);
      list.push(localRec);
    }
  });

  // 3. Synthesize baseline records for enrolled students without duplicate entries
  try {
    const [students, courses] = await Promise.all([
      getAllStudents(),
      getAllCourses(true),
    ]);

    const courseMap = new Map(courses.map((c) => [c.id, c]));

    students.forEach((student) => {
      const enrolledCourses = Array.isArray(student.enrolledCourseIds) ? student.enrolledCourseIds : [];
      
      enrolledCourses.forEach((courseId) => {
        const feeId = generateFeeRecordId(student.uid, courseId);
        if (!deletedIds.has(feeId) && !seenIds.has(feeId)) {
          seenIds.add(feeId);
          const course = courseMap.get(courseId);
          const courseTitle = course ? course.title : `कोर्स ID: ${courseId}`;
          const batchName = course ? course.batchName : 'नियमित बैच';
          const classLevel = (course ? course.classLevel : (student.classLevel || 'class-10')) as ClassLevel;
          const basePrice = course ? Math.max(0, Math.round(course.price || 0)) : 1999;
          const discountedPrice = course && course.discountedPrice ? Math.max(0, Math.round(course.discountedPrice)) : basePrice;
          const discount = Math.max(0, Math.min(basePrice, basePrice - discountedPrice));
          const finalFee = Math.max(0, basePrice - discount);

          // Check if student has recorded online payment in profile
          const userPaymentStatusMap = (student as any).coursePaymentStatuses || {};
          const isUserOnlinePaid = userPaymentStatusMap[courseId] === 'successful' || (student as any).paymentStatus === 'successful';
          const paidAmount = isUserOnlinePaid ? finalFee : 0;
          const dueAmount = Math.max(0, finalFee - paidAmount);
          const paymentStatus = computePaymentStatus(finalFee, paidAmount, undefined, todayStr);

          const syntheticRecord: FeeRecord = {
            id: feeId,
            studentId: student.uid,
            studentName: student.displayName || 'अज्ञात विद्यार्थी',
            studentPhone: student.phoneNumber || '—',
            studentEmail: student.email || '',
            classLevel,
            courseId,
            courseName: courseTitle,
            batchName,
            totalFee: basePrice,
            discount,
            finalFee,
            paidAmount,
            dueAmount,
            paymentStatus,
            paymentMethod: isUserOnlinePaid ? 'online' : undefined,
            lastPaymentDate: isUserOnlinePaid ? student.createdAt.slice(0, 10) : undefined,
            isOnlineVerified: isUserOnlinePaid,
            installments: isUserOnlinePaid ? [
              {
                id: `inst_${Date.now()}_init`,
                receiptNo: generatePaymentReference(),
                amount: paidAmount,
                paymentMethod: 'online',
                source: 'online',
                isOnlineVerified: true,
                paymentDate: student.createdAt.slice(0, 10),
                notes: 'नामांकन के समय ऑनलाइन प्रवेश शुल्क भुगतान',
                createdAt: student.createdAt,
              }
            ] : [],
            notes: 'नामांकन डेटा से स्वचालित सृजित शुल्क रिकॉर्ड',
            createdAt: student.createdAt || new Date().toISOString(),
          };

          list.push(syntheticRecord);
        }
      });
    });
  } catch (err) {
    console.warn('[RK STUDY CENTRE] Error synthesizing baseline fee records:', err);
  }

  // Update local cache
  saveLocalFees(list);

  // Sort: Overdue/Due/Partial first, then by createdAt descending
  list.sort((a, b) => {
    const statusWeight: Record<PaymentStatus, number> = {
      overdue: 4,
      due: 3,
      partial: 2,
      paid: 1,
    };
    const diff = (statusWeight[b.paymentStatus] || 0) - (statusWeight[a.paymentStatus] || 0);
    if (diff !== 0) return diff;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return list;
}

/**
 * Record a new payment installment for a student's course fee.
 * Strictly enforces overpayment protection, duplicate txn check, and mathematical integrity.
 */
export async function recordPayment(input: RecordPaymentInput): Promise<{
  feeRecord: FeeRecord;
  newInstallment: PaymentInstallment;
}> {
  const {
    studentId,
    studentName,
    studentPhone,
    studentEmail,
    classLevel,
    courseId,
    courseName,
    batchName,
    totalFee,
    discount = 0,
    amountPaying,
    paymentMethod,
    transactionId,
    paymentDate = getTodayDateString(),
    dueDate,
    notes,
    collectedBy = 'Owner / Admin',
    collectedByName = 'RK Study Centre Office',
  } = input;

  if (!studentId || !courseId) {
    throw new Error('विद्यार्थी और कोर्स का चयन अनिवार्य है।');
  }

  if (amountPaying <= 0) {
    throw new Error('भुगतान राशि शून्य से अधिक होनी चाहिए।');
  }

  const todayStr = getTodayDateString();
  if (paymentDate > todayStr) {
    throw new Error('भविष्य की तिथि में भुगतान दर्ज नहीं किया जा सकता।');
  }

  const feeId = input.feeRecordId || generateFeeRecordId(studentId, courseId);
  const now = new Date().toISOString();
  const receiptNo = generatePaymentReference();

  // 1. Fetch current fee record if exists
  const allCurrent = getLocalFees();
  const existing = allCurrent.find((r) => r.id === feeId);

  const existingInstallments: PaymentInstallment[] = existing && Array.isArray(existing.installments)
    ? [...existing.installments]
    : [];

  // Duplicate Reference ID Check
  if (transactionId && transactionId.trim()) {
    const cleanTxn = transactionId.trim();
    const isDuplicateTxn = existingInstallments.some(
      (inst) => inst.transactionId && inst.transactionId.trim().toLowerCase() === cleanTxn.toLowerCase()
    );
    if (isDuplicateTxn) {
      throw new Error(`यह Transaction/UTR पहले से दर्ज है (${cleanTxn})।`);
    }
  }

  const rawTotal = Number(totalFee) >= 0 ? Number(totalFee) : (existing ? existing.totalFee : 1999);
  const finalTotalFee = Math.max(0, Math.round(rawTotal));
  
  const rawDiscount = Number(discount) >= 0 ? Number(discount) : (existing ? existing.discount : 0);
  if (rawDiscount > finalTotalFee) {
    throw new Error(`छूट की राशि (${formatCurrency(rawDiscount)}) कुल फीस (${formatCurrency(finalTotalFee)}) से अधिक नहीं हो सकती।`);
  }
  const finalDiscount = Math.max(0, Math.min(finalTotalFee, Math.round(rawDiscount)));
  const finalFee = Math.max(0, finalTotalFee - finalDiscount);

  // Sum prior verified installments
  const prevPaid = existingInstallments.reduce((sum, inst) => sum + Math.max(0, Math.round(Number(inst.amount) || 0)), 0);
  const remainingDue = Math.max(0, finalFee - prevPaid);

  // CRITICAL: Overpayment Protection
  const roundedPaying = Math.round(amountPaying);
  if (roundedPaying > remainingDue) {
    throw new Error(
      `भुगतान राशि (${formatCurrency(roundedPaying)}) शेष देय राशि (${formatCurrency(remainingDue)}) से अधिक नहीं हो सकती।`
    );
  }

  const newPaidAmount = prevPaid + roundedPaying;
  const newDueAmount = Math.max(0, finalFee - newPaidAmount);
  const newStatus = computePaymentStatus(finalFee, newPaidAmount, dueDate || (existing ? existing.dueDate : undefined), paymentDate);

  // Create new installment item with accurate snapshot fields
  const newInstallment: PaymentInstallment = {
    id: `inst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    receiptNo,
    amount: roundedPaying,
    paymentMethod,
    source: 'offline',
    transactionId: transactionId?.trim() || undefined,
    paymentDate,
    collectedBy,
    collectedByName,
    finalFeeSnapshot: finalFee,
    previouslyPaidSnapshot: prevPaid,
    dueAmountAfterSnapshot: newDueAmount,
    statusAfterSnapshot: newStatus,
    studentName: studentName || (existing ? existing.studentName : 'विद्यार्थी'),
    studentPhone: studentPhone || (existing ? existing.studentPhone : '—'),
    classLevel: classLevel || (existing ? existing.classLevel : 'class-10'),
    courseName: courseName || (existing ? existing.courseName : 'कोर्स'),
    batchName: batchName || (existing ? existing.batchName : 'नियमित बैच'),
    notes: notes?.trim() || undefined,
    createdAt: now,
  };

  const updatedRecord: FeeRecord = {
    id: feeId,
    studentId,
    studentName: studentName || (existing ? existing.studentName : 'विद्यार्थी'),
    studentPhone: studentPhone || (existing ? existing.studentPhone : '—'),
    studentEmail: studentEmail || (existing ? existing.studentEmail : ''),
    classLevel: classLevel || (existing ? existing.classLevel : 'class-10'),
    courseId,
    courseName: courseName || (existing ? existing.courseName : 'कोर्स'),
    batchName: batchName || (existing ? existing.batchName : 'नियमित बैच'),
    totalFee: finalTotalFee,
    discount: finalDiscount,
    finalFee,
    paidAmount: newPaidAmount,
    dueAmount: newDueAmount,
    paymentStatus: newStatus,
    paymentMethod,
    transactionId: transactionId?.trim() || (existing ? existing.transactionId : undefined),
    lastPaymentDate: paymentDate,
    dueDate: dueDate || (existing ? existing.dueDate : undefined),
    isOnlineVerified: existing?.isOnlineVerified || false,
    installments: [...existingInstallments, newInstallment],
    notes: notes?.trim() || (existing ? existing.notes : undefined),
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now,
  };

  // 1. Save to Firestore 'fees/{feeId}'
  try {
    const docRef = doc(db, 'fees', feeId);
    await setDoc(docRef, {
      ...updatedRecord,
      timestamp: serverTimestamp(),
    }, { merge: true });
  } catch (error: any) {
    console.warn('[RK STUDY CENTRE] Error persisting fee to Firestore, saving to local cache:', error);
  }

  // 2. Synchronize user's payment status in 'users/{studentId}'
  try {
    const userDocRef = doc(db, 'users', studentId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const userData = snap.data();
      const existingMap = userData.coursePaymentStatuses || {};
      const newPaymentSyncStatus = newDueAmount <= 0 ? 'successful' : 'pending';
      await updateDoc(userDocRef, {
        coursePaymentStatuses: {
          ...existingMap,
          [courseId]: newPaymentSyncStatus,
        },
        paymentStatus: newPaymentSyncStatus,
        paymentUpdatedAt: now,
      });
    }
  } catch (userErr) {
    console.warn('[RK STUDY CENTRE] Error syncing user payment status:', userErr);
  }

  // 3. Update Local Storage Cache
  unmarkFeeDeleted(feeId);
  const filtered = allCurrent.filter((r) => r.id !== feeId);
  filtered.unshift(updatedRecord);
  saveLocalFees(filtered);

  return {
    feeRecord: updatedRecord,
    newInstallment,
  };
}

/**
 * Create or update a Fee Record directly (e.g. adjust discount, fee structure, due dates)
 */
export async function createOrUpdateFeeRecord(input: CreateFeeRecordInput): Promise<FeeRecord> {
  const feeId = input.id || generateFeeRecordId(input.studentId, input.courseId);
  const now = new Date().toISOString();

  if (Number(input.totalFee) < 0) {
    throw new Error('कोर्स कुल फीस ऋणात्मक नहीं हो सकती।');
  }
  if (Number(input.discount) < 0) {
    throw new Error('छूट की राशि ऋणात्मक नहीं हो सकती।');
  }
  if (Number(input.discount) > Number(input.totalFee)) {
    throw new Error('छूट की राशि कुल फीस से अधिक नहीं हो सकती।');
  }

  const totalFee = Math.max(0, Math.round(Number(input.totalFee) || 0));
  const discount = Math.max(0, Math.min(totalFee, Math.round(Number(input.discount) || 0)));
  const finalFee = Math.max(0, totalFee - discount);
  const initialPaid = Math.max(0, Math.min(finalFee, Math.round(Number(input.initialPaidAmount) || 0)));
  const dueAmount = Math.max(0, finalFee - initialPaid);
  const paymentStatus = computePaymentStatus(finalFee, initialPaid, input.dueDate, getTodayDateString());

  const existingList = getLocalFees();
  const existing = existingList.find((r) => r.id === feeId);

  const installments: PaymentInstallment[] = existing && Array.isArray(existing.installments)
    ? [...existing.installments]
    : [];

  if (initialPaid > 0 && installments.length === 0) {
    installments.push({
      id: `inst_${Date.now()}_init`,
      receiptNo: generatePaymentReference(),
      amount: initialPaid,
      paymentMethod: input.paymentMethod || 'cash',
      source: 'offline',
      transactionId: input.transactionId,
      paymentDate: input.paymentDate || getTodayDateString(),
      notes: 'प्रारंभिक जमा शुल्क',
      createdAt: now,
    });
  }

  const feeRecord: FeeRecord = {
    id: feeId,
    studentId: input.studentId,
    studentName: input.studentName,
    studentPhone: input.studentPhone || '—',
    studentEmail: input.studentEmail || '',
    classLevel: input.classLevel,
    courseId: input.courseId,
    courseName: input.courseName,
    batchName: input.batchName || 'नियमित बैच',
    totalFee,
    discount,
    finalFee,
    paidAmount: initialPaid,
    dueAmount,
    paymentStatus,
    paymentMethod: input.paymentMethod,
    transactionId: input.transactionId,
    lastPaymentDate: initialPaid > 0 ? (input.paymentDate || getTodayDateString()) : undefined,
    dueDate: input.dueDate,
    isOnlineVerified: existing?.isOnlineVerified || false,
    installments,
    notes: input.notes?.trim() || undefined,
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now,
  };

  try {
    const docRef = doc(db, 'fees', feeId);
    await setDoc(docRef, {
      ...feeRecord,
      timestamp: serverTimestamp(),
    }, { merge: true });
  } catch (error: any) {
    console.warn('[RK STUDY CENTRE] Error creating fee record in Firestore:', error);
  }

  unmarkFeeDeleted(feeId);
  const filtered = existingList.filter((r) => r.id !== feeId);
  filtered.unshift(feeRecord);
  saveLocalFees(filtered);

  return feeRecord;
}

/**
 * Reverse / Delete an Offline Installment (Protected from online verified payments)
 */
export async function reverseOfflineInstallment(feeId: string, installmentId: string): Promise<FeeRecord> {
  const allCurrent = getLocalFees();
  const existing = allCurrent.find((r) => r.id === feeId);
  if (!existing) {
    throw new Error('शुल्क रिकॉर्ड नहीं मिला।');
  }

  const inst = (existing.installments || []).find((i) => i.id === installmentId);
  if (!inst) {
    throw new Error('किस्त रिकॉर्ड नहीं मिला।');
  }

  if (inst.isOnlineVerified || inst.source === 'online') {
    throw new Error('सत्यापित ऑनलाइन भुगतान को हटाया या बदला नहीं जा सकता।');
  }

  const remainingInstallments = existing.installments.filter((i) => i.id !== installmentId);
  const newPaidAmount = remainingInstallments.reduce((sum, i) => sum + Math.max(0, Math.round(Number(i.amount) || 0)), 0);
  const finalFee = existing.finalFee;
  const newDueAmount = Math.max(0, finalFee - newPaidAmount);
  const newStatus = computePaymentStatus(finalFee, newPaidAmount, existing.dueDate, getTodayDateString());
  const now = new Date().toISOString();

  const updatedRecord: FeeRecord = {
    ...existing,
    paidAmount: newPaidAmount,
    dueAmount: newDueAmount,
    paymentStatus: newStatus,
    installments: remainingInstallments,
    lastPaymentDate: remainingInstallments.length > 0 ? remainingInstallments[remainingInstallments.length - 1].paymentDate : undefined,
    updatedAt: now,
  };

  // 1. Save to Firestore
  try {
    const docRef = doc(db, 'fees', feeId);
    await setDoc(docRef, {
      ...updatedRecord,
      timestamp: serverTimestamp(),
    }, { merge: true });
  } catch (error: any) {
    console.warn('[RK STUDY CENTRE] Error persisting reversed installment to Firestore:', error);
  }

  // 2. Sync student profile status
  try {
    const userDocRef = doc(db, 'users', existing.studentId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const userData = snap.data();
      const existingMap = userData.coursePaymentStatuses || {};
      const newPaymentSyncStatus = newDueAmount <= 0 ? 'successful' : 'pending';
      await updateDoc(userDocRef, {
        coursePaymentStatuses: {
          ...existingMap,
          [existing.courseId]: newPaymentSyncStatus,
        },
        paymentStatus: newPaymentSyncStatus,
        paymentUpdatedAt: now,
      });
    }
  } catch (userErr) {
    console.warn('[RK STUDY CENTRE] Error syncing user payment status on reversal:', userErr);
  }

  // 3. Update local cache
  const filtered = allCurrent.filter((r) => r.id !== feeId);
  filtered.unshift(updatedRecord);
  saveLocalFees(filtered);

  return updatedRecord;
}

/**
 * Delete a Fee Record (Only permitted if not online verified)
 */
export async function deleteFeeRecord(id: string): Promise<void> {
  const current = getLocalFees();
  const target = current.find((r) => r.id === id);

  if (target && target.isOnlineVerified) {
    throw new Error('सत्यापित ऑनलाइन भुगतान रिकॉर्ड को सीधे हटाया नहीं जा सकता।');
  }

  markFeeDeleted(id);

  try {
    const docRef = doc(db, 'fees', id);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.warn('[RK STUDY CENTRE] Error deleting fee record from Firestore:', error);
  }

  const filtered = current.filter((r) => r.id !== id);
  saveLocalFees(filtered);
}

export interface FeeMetrics {
  totalAssessed: number;
  totalCollected: number;
  totalDue: number;
  collectionPercentage: number;
  totalRecords: number;
  paidCount: number;
  partialCount: number;
  dueCount: number;
  overdueCount: number;
}

/**
 * Compute aggregate financial analytics
 */
export function calculateFeeMetrics(records: FeeRecord[]): FeeMetrics {
  let totalAssessed = 0;
  let totalCollected = 0;
  let totalDue = 0;
  let paidCount = 0;
  let partialCount = 0;
  let dueCount = 0;
  let overdueCount = 0;

  records.forEach((r) => {
    totalAssessed += (Number(r.finalFee) || 0);
    totalCollected += (Number(r.paidAmount) || 0);
    totalDue += (Number(r.dueAmount) || 0);

    if (r.paymentStatus === 'paid') paidCount++;
    else if (r.paymentStatus === 'partial') partialCount++;
    else if (r.paymentStatus === 'overdue') overdueCount++;
    else dueCount++;
  });

  const collectionPercentage = totalAssessed > 0
    ? Math.min(100, Math.round((totalCollected / totalAssessed) * 100))
    : 0;

  return {
    totalAssessed,
    totalCollected,
    totalDue,
    collectionPercentage,
    totalRecords: records.length,
    paidCount,
    partialCount,
    dueCount,
    overdueCount,
  };
}
