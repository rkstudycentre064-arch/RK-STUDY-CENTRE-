/**
 * RK STUDY CENTRE - Attendance Service (Task 7)
 * 
 * Manages daily student attendance, session-based attendance marking,
 * bulk actions, duplicate prevention, and student attendance percentage analytics.
 * 
 * Storage Architecture:
 * - Authoritative: Firestore collection 'attendance' (Protected: Owner/Admin read & write only)
 * - Session/Offline: LocalStorage cache with deleted IDs tracking
 */

import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, withTimeout } from '../lib/firebase';
import type {
  AttendanceRecord,
  AttendanceStatus,
  SaveAttendanceItemInput,
  BulkSaveAttendanceInput,
  ClassLevel,
} from '../types';

const LOCAL_STORAGE_KEY = 'rk_attendance_records_v1';
const DELETED_ATTENDANCE_KEY = 'rk_deleted_attendance_ids_v1';

/**
 * Returns current date in local YYYY-MM-DD format (no UTC day-shift bugs)
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validates date to prevent silently marking future attendance
 */
export function isValidAttendanceDate(dateStr: string): { isValid: boolean; error?: string } {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { isValid: false, error: 'अमान्य तिथि प्रारूप (कृपया YYYY-MM-DD चुनें)।' };
  }
  const todayStr = getTodayDateString();
  if (dateStr > todayStr) {
    return {
      isValid: false,
      error: 'भविष्य की तिथि (Future Date) के लिए उपस्थिति दर्ज नहीं की जा सकती।',
    };
  }
  return { isValid: true };
}

/**
 * Formats "YYYY-MM-DD" into Hindi/English readable display
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
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
 * Deterministic ID generation to strictly prevent duplicate attendance
 * for the same Student + Date + Course/Session.
 */
export function generateAttendanceId(
  date: string,
  studentId: string,
  courseId: string,
  timetableId?: string
): string {
  const raw = `att_${date}_${studentId}_${courseId}${timetableId ? `_${timetableId}` : ''}`;
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_');
}

// Local Storage helpers
function getDeletedAttendanceIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_ATTENDANCE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr);
      }
    }
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error reading deleted attendance IDs:', e);
  }
  return new Set<string>();
}

function markAttendanceDeleted(id: string) {
  try {
    const set = getDeletedAttendanceIds();
    set.add(id);
    localStorage.setItem(DELETED_ATTENDANCE_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error marking attendance deleted:', e);
  }
}

function unmarkAttendanceDeleted(id: string) {
  try {
    const set = getDeletedAttendanceIds();
    if (set.has(id)) {
      set.delete(id);
      localStorage.setItem(DELETED_ATTENDANCE_KEY, JSON.stringify(Array.from(set)));
    }
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error unmarking attendance deleted:', e);
  }
}

function getLocalAttendance(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error reading local attendance:', e);
  }
  return [];
}

function saveLocalAttendance(records: AttendanceRecord[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error saving local attendance:', e);
  }
}

/**
 * Retrieve all Attendance records (Sorted by Date descending, then Student Name).
 */
export async function getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
  const deletedIds = getDeletedAttendanceIds();
  const list: AttendanceRecord[] = [];
  const seenIds = new Set<string>();

  // 1. Authoritative Firestore Fetch
  try {
    const colRef = collection(db, 'attendance');
    const snapshot = await withTimeout(getDocs(colRef), 3500, null);

    if (snapshot && !snapshot.empty) {
      snapshot.forEach((docSnap) => {
        const id = docSnap.id;
        if (!deletedIds.has(id)) {
          const data = docSnap.data() as AttendanceRecord;
          const entry: AttendanceRecord = {
            ...data,
            id,
          };
          seenIds.add(id);
          list.push(entry);
        }
      });
    }
  } catch (error) {
    console.warn('[RK STUDY CENTRE] Error reading Firestore attendance:', error);
  }

  // 2. LocalStorage Cache Fetch
  const localItems = getLocalAttendance();
  for (const item of localItems) {
    if (!deletedIds.has(item.id) && !seenIds.has(item.id)) {
      seenIds.add(item.id);
      list.push(item);
    }
  }

  // Sort descending by Date (newest first), then by studentName
  list.sort((a, b) => {
    const dateDiff = b.date.localeCompare(a.date);
    if (dateDiff !== 0) return dateDiff;
    return a.studentName.localeCompare(b.studentName);
  });

  saveLocalAttendance(list);
  return list;
}

/**
 * Get attendance records for a specific Date and Course/Batch
 */
export async function getAttendanceByDateAndCourse(
  date: string,
  courseId: string,
  timetableId?: string
): Promise<AttendanceRecord[]> {
  const all = await getAllAttendanceRecords();
  return all.filter((r) => {
    if (r.date !== date) return false;
    if (courseId && r.courseId !== courseId) return false;
    if (timetableId && r.timetableId !== timetableId) return false;
    return true;
  });
}

export interface StudentAttendanceStats {
  studentId: string;
  totalMarked: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  leaveCount: number;
  attendancePercentage: number;
  records: AttendanceRecord[];
}

/**
 * Calculate Student Attendance Statistics & Percentage
 * Formula: (Present + Late) / Total Marked * 100
 * Denominator includes all marked records (Present, Absent, Late, Leave).
 */
export async function getStudentAttendanceSummary(
  studentId: string
): Promise<StudentAttendanceStats> {
  const all = await getAllAttendanceRecords();
  const studentRecords = all.filter((r) => r.studentId === studentId);

  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let leaveCount = 0;

  studentRecords.forEach((r) => {
    if (r.status === 'present') presentCount++;
    else if (r.status === 'absent') absentCount++;
    else if (r.status === 'late') lateCount++;
    else if (r.status === 'leave') leaveCount++;
  });

  const totalMarked = presentCount + absentCount + lateCount + leaveCount;
  const attendancePercentage =
    totalMarked > 0 ? Math.round(((presentCount + lateCount) / totalMarked) * 100) : 0;

  return {
    studentId,
    totalMarked,
    presentCount,
    absentCount,
    lateCount,
    leaveCount,
    attendancePercentage,
    records: studentRecords,
  };
}

/**
 * Save or Update a single student's attendance record
 */
export async function saveIndividualAttendance(
  date: string,
  input: SaveAttendanceItemInput,
  markedBy = 'owner',
  markedByName = 'व्यवस्थापक'
): Promise<AttendanceRecord> {
  const dateCheck = isValidAttendanceDate(date);
  if (!dateCheck.isValid) {
    throw new Error(dateCheck.error || 'अमान्य तिथि।');
  }

  if (!input.studentId) {
    throw new Error('विद्यार्थी ID अनिवार्य है।');
  }
  if (!input.courseId) {
    throw new Error('कोर्स / बैच चुनना अनिवार्य है।');
  }
  if (!input.status) {
    throw new Error('उपस्थिति स्थिति (Status) चुनना अनिवार्य है।');
  }

  const recordId = generateAttendanceId(date, input.studentId, input.courseId, input.timetableId);
  const now = new Date().toISOString();

  const record: AttendanceRecord = {
    id: recordId,
    date,
    studentId: input.studentId,
    studentName: input.studentName || 'विद्यार्थी',
    studentPhone: input.studentPhone || '',
    classLevel: input.classLevel,
    courseId: input.courseId,
    courseName: input.courseName || 'लक्ष्य बैच',
    batchName: input.batchName || '',
    timetableId: input.timetableId || '',
    subjectId: input.subjectId || '',
    subjectName: input.subjectName || '',
    teacherId: input.teacherId || '',
    teacherName: input.teacherName || '',
    status: input.status,
    markedBy,
    markedByName,
    notes: input.notes?.trim() || '',
    createdAt: now,
    updatedAt: now,
  };

  unmarkAttendanceDeleted(recordId);

  // Update Local Cache
  const localList = getLocalAttendance();
  const existingIndex = localList.findIndex((r) => r.id === recordId);
  if (existingIndex >= 0) {
    localList[existingIndex] = {
      ...localList[existingIndex],
      ...record,
      createdAt: localList[existingIndex].createdAt || now,
      updatedAt: now,
    };
  } else {
    localList.unshift(record);
  }
  saveLocalAttendance(localList);

  // Persist to Firestore
  try {
    const docRef = doc(db, 'attendance', recordId);
    await withTimeout(
      setDoc(
        docRef,
        {
          ...record,
          timestamp: serverTimestamp(),
        },
        { merge: true }
      ),
      4000,
      null
    );
  } catch (error) {
    console.warn('[RK STUDY CENTRE] Firestore attendance save error (cached locally):', error);
  }

  return record;
}

/**
 * Bulk Save/Update Attendance for a whole batch of students
 */
export async function saveBulkAttendance(
  input: BulkSaveAttendanceInput,
  markedBy = 'owner',
  markedByName = 'व्यवस्थापक'
): Promise<AttendanceRecord[]> {
  const dateCheck = isValidAttendanceDate(input.date);
  if (!dateCheck.isValid) {
    throw new Error(dateCheck.error || 'अमान्य तिथि।');
  }

  if (!input.items || input.items.length === 0) {
    throw new Error('उपस्थिति दर्ज करने के लिए कम-से-कम एक विद्यार्थी आवश्यक है।');
  }

  const savedRecords: AttendanceRecord[] = [];
  const localList = getLocalAttendance();
  const now = new Date().toISOString();

  for (const item of input.items) {
    const recordId = generateAttendanceId(
      input.date,
      item.studentId,
      item.courseId,
      input.timetableId || item.timetableId
    );

    const record: AttendanceRecord = {
      id: recordId,
      date: input.date,
      studentId: item.studentId,
      studentName: item.studentName || 'विद्यार्थी',
      studentPhone: item.studentPhone || '',
      classLevel: item.classLevel,
      courseId: item.courseId,
      courseName: item.courseName || 'लक्ष्य बैच',
      batchName: item.batchName || '',
      timetableId: input.timetableId || item.timetableId || '',
      subjectId: item.subjectId || '',
      subjectName: item.subjectName || '',
      teacherId: item.teacherId || '',
      teacherName: item.teacherName || '',
      status: item.status,
      markedBy,
      markedByName,
      notes: item.notes?.trim() || '',
      createdAt: now,
      updatedAt: now,
    };

    unmarkAttendanceDeleted(recordId);

    const existingIndex = localList.findIndex((r) => r.id === recordId);
    if (existingIndex >= 0) {
      localList[existingIndex] = {
        ...localList[existingIndex],
        ...record,
        createdAt: localList[existingIndex].createdAt || now,
        updatedAt: now,
      };
      savedRecords.push(localList[existingIndex]);
    } else {
      localList.unshift(record);
      savedRecords.push(record);
    }

    // Persist individually with Firestore setDoc merge
    try {
      const docRef = doc(db, 'attendance', recordId);
      await withTimeout(
        setDoc(
          docRef,
          {
            ...record,
            timestamp: serverTimestamp(),
          },
          { merge: true }
        ),
        3500,
        null
      );
    } catch (e) {
      console.warn(`[RK STUDY CENTRE] Error persisting record ${recordId}:`, e);
    }
  }

  saveLocalAttendance(localList);
  return savedRecords;
}

/**
 * Edit/Update attendance status for an existing record
 */
export async function updateAttendanceStatus(
  id: string,
  status: AttendanceStatus,
  notes?: string
): Promise<AttendanceRecord> {
  if (!id) {
    throw new Error('उपस्थिति रिकॉर्ड ID अनिवार्य है।');
  }

  const all = await getAllAttendanceRecords();
  const existing = all.find((r) => r.id === id);
  if (!existing) {
    throw new Error('संबंधित उपस्थिति रिकॉर्ड नहीं मिला।');
  }

  const now = new Date().toISOString();
  const updatedRecord: AttendanceRecord = {
    ...existing,
    status,
    notes: notes !== undefined ? notes.trim() : existing.notes,
    updatedAt: now,
  };

  // Update Local Cache
  const localList = getLocalAttendance().map((r) => (r.id === id ? updatedRecord : r));
  saveLocalAttendance(localList);

  // Update Firestore
  try {
    const docRef = doc(db, 'attendance', id);
    await withTimeout(
      setDoc(
        docRef,
        {
          status,
          notes: updatedRecord.notes,
          updatedAt: now,
          timestamp: serverTimestamp(),
        },
        { merge: true }
      ),
      4000,
      null
    );
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error updating attendance in Firestore:', e);
  }

  return updatedRecord;
}

/**
 * Delete an attendance record permanently
 */
export async function deleteAttendanceRecord(id: string): Promise<void> {
  if (!id) {
    throw new Error('हटाने के लिए उपस्थिति ID आवश्यक है।');
  }

  markAttendanceDeleted(id);

  // Update Local Cache
  const localList = getLocalAttendance().filter((r) => r.id !== id);
  saveLocalAttendance(localList);

  // Delete from Firestore
  try {
    const docRef = doc(db, 'attendance', id);
    await withTimeout(deleteDoc(docRef), 4000, null);
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error deleting attendance from Firestore:', e);
  }
}
