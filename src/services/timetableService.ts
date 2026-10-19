/**
 * RK STUDY CENTRE - Timetable & Class Schedule Service (Task 6)
 * 
 * Manages weekly class schedules, batch/course time slots, faculty allocations,
 * and real-time conflict detection (Teacher overlaps, Batch overlaps, Class level overlaps, Room clashes).
 * 
 * Storage Architecture:
 * - Authoritative: Firestore collection 'timetable' (Protected: Owner/Admin read & write only)
 * - Session/Offline Cache: LocalStorage for real user-created records only (No fake seeds)
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
  ClassLevel,
  DayOfWeek,
  TimetableEntry,
  CreateTimetableInput,
  Teacher,
  Course,
} from '../types';
import { getAllTeachers } from './teacherService';
import { getAllCourses } from './courseService';
import { SUBJECTS, CLASSES_METADATA } from '../lib/constants';

// Key for genuine user-created records cache (Zero fabricated demo data)
const LOCAL_STORAGE_KEY = 'rk_timetable_user_records_v2';
const DELETED_TIMETABLE_KEY = 'rk_deleted_timetable_ids_v2';

export interface DayMetadata {
  id: DayOfWeek;
  english: string;
  hindi: string;
  shortHindi: string;
  dayIndex: number; // 0 for Monday ... 6 for Sunday
}

export const DAYS_OF_WEEK: DayMetadata[] = [
  { id: 'Monday', english: 'Monday', hindi: 'सोमवार', shortHindi: 'सोम', dayIndex: 0 },
  { id: 'Tuesday', english: 'Tuesday', hindi: 'मंगलवार', shortHindi: 'मंगल', dayIndex: 1 },
  { id: 'Wednesday', english: 'Wednesday', hindi: 'बुधवार', shortHindi: 'बुध', dayIndex: 2 },
  { id: 'Thursday', english: 'Thursday', hindi: 'गुरुवार', shortHindi: 'गुरु', dayIndex: 3 },
  { id: 'Friday', english: 'Friday', hindi: 'शुक्रवार', shortHindi: 'शुक्र', dayIndex: 4 },
  { id: 'Saturday', english: 'Saturday', hindi: 'शनिवार', shortHindi: 'शनि', dayIndex: 5 },
  { id: 'Sunday', english: 'Sunday', hindi: 'रविवार', shortHindi: 'रवि', dayIndex: 6 },
];

export const CLASS_ROOM_MODES = [
  'मुख्य क्लासरूम - हॉल A (Offline Hall A)',
  'क्लासरूम 101 - प्रथम तल (Classroom 101)',
  'साइंस लैबोरेटरी (Science Lab)',
  'स्मार्ट डिजिटल क्लासरूम (Smart Class)',
  'ऑनलाइन लाइव क्लास (Online Live Stream)',
  'डाउट समाधान कक्ष (Doubt Room)',
];

// Helper Functions for Local Storage Management
function getDeletedTimetableIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_TIMETABLE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr);
      }
    }
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error reading deleted timetable IDs:', e);
  }
  return new Set<string>();
}

function markTimetableDeleted(id: string) {
  try {
    const set = getDeletedTimetableIds();
    set.add(id);
    localStorage.setItem(DELETED_TIMETABLE_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error marking timetable deleted:', e);
  }
}

function unmarkTimetableDeleted(id: string) {
  try {
    const set = getDeletedTimetableIds();
    if (set.has(id)) {
      set.delete(id);
      localStorage.setItem(DELETED_TIMETABLE_KEY, JSON.stringify(Array.from(set)));
    }
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error unmarking timetable deleted:', e);
  }
}

function getLocalTimetable(): TimetableEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error reading local timetable:', e);
  }
  return [];
}

function saveLocalTimetable(entries: TimetableEntry[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error saving local timetable:', e);
  }
}

/**
 * Converts 24-hour time "HH:mm" to minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr || '0', 10);
  const m = parseInt(mStr || '0', 10);
  return h * 60 + m;
}

/**
 * Formats "HH:mm" to 12-hour Hindi/English readable string e.g. "07:30 AM"
 */
export function formatTime12Hour(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr || '0', 10);
  const m = parseInt(mStr || '0', 10);
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const formattedH = h < 10 ? `0${h}` : `${h}`;
  const formattedM = m < 10 ? `0${m}` : `${m}`;
  return `${formattedH}:${formattedM} ${period}`;
}

/**
 * Calculate slot duration in minutes and format in Hindi
 */
export function getDurationText(startTime: string, endTime: string): string {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const diff = endMin - startMin;
  if (diff <= 0) return 'अमान्य समय';
  if (diff < 60) return `${diff} मिनट`;
  const hours = Math.floor(diff / 60);
  const remainingMins = diff % 60;
  if (remainingMins === 0) {
    return `${hours} घंटा`;
  }
  return `${hours} घंटा ${remainingMins} मिनट`;
}

/**
 * Checks if two time intervals [startA, endA] and [startB, endB] overlap.
 * Boundary touching (e.g. 10:00-11:00 and 11:00-12:00) is strictly NOT considered an overlap.
 */
export function doTimeIntervalsOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);

  // Overlaps if and only if sA < eB and sB < eA
  return sA < eB && sB < eA;
}

/**
 * Returns current day of week aligned with client / local time
 */
export function getTodayDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const dayIndex = now.getDay();
  return days[dayIndex];
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictType?: 'teacher' | 'course' | 'class' | 'room' | 'time_order';
  message?: string;
  conflictingEntry?: TimetableEntry;
}

/**
 * Detects schedule collisions with independent rules:
 * 1. Time Order: End Time must be strictly after Start Time.
 * 2. Teacher Conflict: Same teacher + same day + overlapping active time slot.
 * 3. Batch/Course Conflict: Same batch/course + same day + overlapping active time slot.
 * 4. Class/Grade Conflict: Same class/grade (classLevel) + same day + overlapping active time slot.
 * 5. Room Conflict: Same physical room + same day + overlapping active time slot.
 * 
 * Adjacent times (e.g. 10:00-11:00 & 11:00-12:00) -> NO conflict.
 * Different days -> NO conflict.
 * Edit self-exclusion -> NO false collision with own ID.
 */
export function checkTimetableConflict(
  input: CreateTimetableInput,
  allEntries: TimetableEntry[],
  excludeEntryId?: string
): ConflictCheckResult {
  const startMin = timeToMinutes(input.startTime);
  const endMin = timeToMinutes(input.endTime);

  if (startMin >= endMin) {
    return {
      hasConflict: true,
      conflictType: 'time_order',
      message: 'समाप्ति का समय (End Time) प्रारंभ समय (Start Time) के बाद होना अनिवार्य है।',
    };
  }

  // Only active entries on the exact same day (excluding self) are compared
  const relevantEntries = allEntries.filter(
    (e) =>
      e.status === 'active' &&
      e.day === input.day &&
      e.id !== excludeEntryId
  );

  for (const existing of relevantEntries) {
    const isOverlapping = doTimeIntervalsOverlap(
      input.startTime,
      input.endTime,
      existing.startTime,
      existing.endTime
    );

    if (!isOverlapping) {
      continue;
    }

    // 1. Teacher Conflict Check
    if (input.teacherId && existing.teacherId === input.teacherId) {
      return {
        hasConflict: true,
        conflictType: 'teacher',
        conflictingEntry: existing,
        message: `यह शिक्षक (${existing.teacherName || 'शिक्षक'}) इस दिन (${existing.dayHindi}) को ${formatTime12Hour(existing.startTime)} से ${formatTime12Hour(existing.endTime)} के बीच पहले से "${existing.courseName}" (${existing.subjectName}) में निर्धारित हैं।`,
      };
    }

    // 2. Course / Batch Conflict Check
    if (input.courseId && existing.courseId === input.courseId) {
      return {
        hasConflict: true,
        conflictType: 'course',
        conflictingEntry: existing,
        message: `इस कोर्स/बैच ("${existing.courseName}") के लिए इस समय (${formatTime12Hour(existing.startTime)} - ${formatTime12Hour(existing.endTime)}) पर पहले से "${existing.subjectName}" की कक्षा निर्धारित है।`,
      };
    }

    // 3. Class / Grade Level Conflict Check (Same Class + same course or room conflict)
    if (
      input.classLevel &&
      existing.classLevel === input.classLevel &&
      (existing.courseId === input.courseId || (!input.roomOrMode?.toLowerCase().includes('ऑनलाइन') && existing.roomOrMode === input.roomOrMode))
    ) {
      return {
        hasConflict: true,
        conflictType: 'class',
        conflictingEntry: existing,
        message: `कक्षा ${existing.classLevel.toUpperCase().replace('-', ' ')} के लिए इस दिन (${existing.dayHindi}) को ${formatTime12Hour(existing.startTime)} से ${formatTime12Hour(existing.endTime)} के बीच पहले से कक्षा "${existing.courseName}" (${existing.subjectName}) निर्धारित है।`,
      };
    }

    // 4. Physical Room Conflict Check (Physical rooms only, not online stream)
    if (
      input.roomOrMode &&
      existing.roomOrMode === input.roomOrMode &&
      !existing.roomOrMode.toLowerCase().includes('ऑनलाइन')
    ) {
      return {
        hasConflict: true,
        conflictType: 'room',
        conflictingEntry: existing,
        message: `कमरा/स्थान ("${existing.roomOrMode}") इस समय (${formatTime12Hour(existing.startTime)} - ${formatTime12Hour(existing.endTime)}) पर पहले से दूसरी कक्षा के लिए आरक्षित है।`,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Retrieve all genuine Timetable entries.
 * Strictly loads from authoritative Firestore database and local user records.
 * Zero fabricated or hardcoded demo timetable data.
 */
export async function getAllTimetableEntries(): Promise<TimetableEntry[]> {
  const deletedIds = getDeletedTimetableIds();
  const list: TimetableEntry[] = [];
  const seenIds = new Set<string>();

  // 1. Authoritative Firestore Fetch (Protected for Admin/Owner)
  try {
    const colRef = collection(db, 'timetable');
    const snapshot = await withTimeout(getDocs(colRef), 3500, null);

    if (snapshot && !snapshot.empty) {
      snapshot.forEach((docSnap) => {
        const id = docSnap.id;
        if (!deletedIds.has(id)) {
          const data = docSnap.data() as TimetableEntry;
          const entry: TimetableEntry = {
            ...data,
            id,
          };
          seenIds.add(id);
          list.push(entry);
        }
      });
    }
  } catch (error) {
    console.warn('[RK STUDY CENTRE] Error reading Firestore timetable:', error);
  }

  // 2. Real User-Created Local Storage Cache (Offline / Session sync)
  const localItems = getLocalTimetable();
  for (const item of localItems) {
    if (!deletedIds.has(item.id) && !seenIds.has(item.id)) {
      seenIds.add(item.id);
      list.push(item);
    }
  }

  // Sort by Day (Monday -> Sunday) and then by Start Time
  const dayOrder: Record<DayOfWeek, number> = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6,
  };

  list.sort((a, b) => {
    const dayDiff = (dayOrder[a.day] ?? 0) - (dayOrder[b.day] ?? 0);
    if (dayDiff !== 0) return dayDiff;
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });

  // Keep cache synced
  saveLocalTimetable(list);

  return list;
}

/**
 * Create a new Timetable Entry with conflict validation and Firestore persistence
 */
export async function createTimetableEntry(input: CreateTimetableInput): Promise<TimetableEntry> {
  // Required field validations
  if (!input.day) {
    throw new Error('दिन (Day) चुनना अनिवार्य है।');
  }
  if (!input.startTime || !input.endTime) {
    throw new Error('कक्षा का प्रारंभ समय एवं समाप्ति समय दर्ज करना अनिवार्य है।');
  }
  if (!input.classLevel) {
    throw new Error('कक्षा (Class Level 9, 10, 11, 12) चुनना अनिवार्य है।');
  }
  if (!input.courseId) {
    throw new Error('कोर्स या बैच (Course/Batch) चुनना अनिवार्य है।');
  }
  if (!input.teacherId) {
    throw new Error('शिक्षक (Teacher) चुनना अनिवार्य है।');
  }
  if (!input.subjectId) {
    throw new Error('विषय (Subject) चुनना अनिवार्य है।');
  }

  // Conflict detection
  const currentEntries = await getAllTimetableEntries();
  const conflictResult = checkTimetableConflict(input, currentEntries);
  if (conflictResult.hasConflict) {
    throw new Error(conflictResult.message || 'समय-सारणी में टकराव (Conflict) पाया गया है।');
  }

  // Hydrate details from referenced entities
  let dayHindi = 'सोमवार';
  const dayMeta = DAYS_OF_WEEK.find((d) => d.id === input.day);
  if (dayMeta) dayHindi = dayMeta.hindi;

  let teacherName = input.teacherName || '';
  if (!teacherName) {
    const allTeachers = await getAllTeachers();
    const t = allTeachers.find((tch) => tch.id === input.teacherId);
    if (t) teacherName = t.name;
  }

  let courseName = input.courseName || '';
  let batchName = input.batchName || '';
  if (!courseName) {
    const allCourses = await getAllCourses(true);
    const c = allCourses.find((crs) => crs.id === input.courseId);
    if (c) {
      courseName = c.title;
      batchName = c.batchName;
    }
  }

  let subjectName = input.subjectName || '';
  if (!subjectName) {
    const s = SUBJECTS.find((sub) => sub.id === input.subjectId);
    if (s) subjectName = `${s.name} (${s.hindiName})`;
  }

  const newId = `tt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newEntry: TimetableEntry = {
    id: newId,
    day: input.day,
    dayHindi,
    startTime: input.startTime.trim(),
    endTime: input.endTime.trim(),
    classLevel: input.classLevel,
    courseId: input.courseId,
    courseName: courseName.trim() || 'लक्ष्य बैच 2026',
    batchName: batchName.trim() || 'लक्ष्य बैच',
    teacherId: input.teacherId,
    teacherName: teacherName.trim() || 'वरिष्ठ संकाय',
    subjectId: input.subjectId,
    subjectName: subjectName.trim() || 'विषय',
    roomOrMode: input.roomOrMode?.trim() || CLASS_ROOM_MODES[0],
    notes: input.notes?.trim() || '',
    status: input.status || 'active',
    createdAt: now,
    updatedAt: now,
  };

  // Unmark if previously in deleted list
  unmarkTimetableDeleted(newId);

  // Update Local Cache
  const localList = getLocalTimetable();
  localList.push(newEntry);
  saveLocalTimetable(localList);

  // Persist to Firestore
  try {
    const docRef = doc(db, 'timetable', newId);
    await withTimeout(
      setDoc(docRef, {
        ...newEntry,
        timestamp: serverTimestamp(),
      }),
      4000,
      null
    );
  } catch (error) {
    console.warn('[RK STUDY CENTRE] Firestore create timetable error (saved locally):', error);
  }

  return newEntry;
}

/**
 * Update an existing Timetable Entry with conflict verification
 */
export async function updateTimetableEntry(
  id: string,
  input: Partial<CreateTimetableInput>
): Promise<TimetableEntry> {
  if (!id) {
    throw new Error('समय-सारणी प्रविष्टि ID अनिवार्य है।');
  }

  const allEntries = await getAllTimetableEntries();
  const existing = allEntries.find((e) => e.id === id);
  if (!existing) {
    throw new Error('संबंधित समय-सारणी प्रविष्टि नहीं मिली।');
  }

  const mergedInput: CreateTimetableInput = {
    day: input.day || existing.day,
    startTime: input.startTime || existing.startTime,
    endTime: input.endTime || existing.endTime,
    classLevel: input.classLevel || existing.classLevel,
    courseId: input.courseId || existing.courseId,
    courseName: input.courseName || existing.courseName,
    batchName: input.batchName || existing.batchName,
    teacherId: input.teacherId || existing.teacherId,
    teacherName: input.teacherName || existing.teacherName,
    subjectId: input.subjectId || existing.subjectId,
    subjectName: input.subjectName || existing.subjectName,
    roomOrMode: input.roomOrMode !== undefined ? input.roomOrMode : existing.roomOrMode,
    notes: input.notes !== undefined ? input.notes : existing.notes,
    status: input.status || existing.status,
  };

  // Check conflicts (excluding this current record)
  const conflictResult = checkTimetableConflict(mergedInput, allEntries, id);
  if (conflictResult.hasConflict) {
    throw new Error(conflictResult.message || 'समय-सारणी में टकराव पाया गया है।');
  }

  let dayHindi = existing.dayHindi;
  if (input.day) {
    const meta = DAYS_OF_WEEK.find((d) => d.id === input.day);
    if (meta) dayHindi = meta.hindi;
  }

  const now = new Date().toISOString();
  const updatedEntry: TimetableEntry = {
    ...existing,
    ...mergedInput,
    dayHindi,
    updatedAt: now,
  };

  // Update Local Cache
  const localList = getLocalTimetable().map((item) =>
    item.id === id ? updatedEntry : item
  );
  saveLocalTimetable(localList);

  // Update Firestore
  try {
    const docRef = doc(db, 'timetable', id);
    await withTimeout(
      setDoc(
        docRef,
        {
          ...updatedEntry,
          updatedAt: now,
          timestamp: serverTimestamp(),
        },
        { merge: true }
      ),
      4000,
      null
    );
  } catch (error) {
    console.warn('[RK STUDY CENTRE] Firestore update timetable error:', error);
  }

  return updatedEntry;
}

/**
 * Toggle active / inactive status of a timetable slot
 */
export async function setTimetableStatus(
  id: string,
  status: 'active' | 'inactive'
): Promise<void> {
  await updateTimetableEntry(id, { status });
}

/**
 * Delete a timetable entry permanently from Firestore and local cache
 */
export async function deleteTimetableEntry(id: string): Promise<void> {
  if (!id) {
    throw new Error('हटाने के लिए समय-सारणी ID आवश्यक है।');
  }

  markTimetableDeleted(id);

  // Update Local Cache
  const localList = getLocalTimetable().filter((item) => item.id !== id);
  saveLocalTimetable(localList);

  // Delete from Firestore
  try {
    const docRef = doc(db, 'timetable', id);
    await withTimeout(deleteDoc(docRef), 4000, null);
  } catch (error) {
    console.warn('[RK STUDY CENTRE] Firestore delete timetable error:', error);
  }
}
