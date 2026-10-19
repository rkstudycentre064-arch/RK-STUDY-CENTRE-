/**
 * RK STUDY CENTRE - Institutional Exams & Date Sheet Management Service (Task 10)
 * 
 * Strict Production Architecture:
 * - 0% fake/baseline/demo exams (Fresh empty state by default)
 * - Authoritative persistence in Firestore collection 'exams' (Owner/Admin access)
 * - Conflict detection: Batch conflicts, Teacher/Invigilator conflicts, Room/Hall conflicts
 * - Strict interval time overlap math (Adjacent boundaries allowed, same-date overlaps blocked)
 * - Full CRUD lifecycle (Draft, Scheduled, Ongoing, Completed, Cancelled)
 */

import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, withTimeout } from '../lib/firebase';
import type {
  ClassLevel,
  Exam,
  ExamStatus,
  ExamType,
  ExamMode,
  ExamSubjectSchedule,
  CreateExamInput,
} from '../types';

const LOCAL_STORAGE_KEY = 'rk_institutional_exams_cache_v2';
const DELETED_EXAMS_KEY = 'rk_deleted_exams_ids_v2';

// Known legacy demo IDs to purge automatically from previous builds
const LEGACY_BASELINE_EXAM_IDS = new Set([
  'exam_c10_matric_preboard_2026',
  'exam_c12_half_yearly_2026',
  'exam_c9_monthly_test_aug_2026',
]);

/**
 * Unique ID generator for institutional exams
 */
export function generateExamId(): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 7);
  return `exam_${ts}_${rand}`;
}

/**
 * Unique ID generator for exam schedule slots
 */
export function generateScheduleSlotId(): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 6);
  return `sch_${ts}_${rand}`;
}

/**
 * Helper to parse time strings (e.g. "09:30 AM", "09:30", "1:30 PM", "14:00") into minutes from midnight (0-1439).
 */
export function parseTimeToMinutes(timeStr?: string): number {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const trimmed = timeStr.trim().toUpperCase();

  // Match 12-hour format: "09:30 AM" or "9:30AM" or "1:30 PM"
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const period = ampmMatch[3];
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  // Match 24-hour format: "09:30" or "14:45"
  const militaryMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (militaryMatch) {
    const hours = parseInt(militaryMatch[1], 10);
    const minutes = parseInt(militaryMatch[2], 10);
    return hours * 60 + minutes;
  }

  // Fallback
  return 0;
}

/**
 * Check if two time intervals on the same day overlap.
 * [startA, endA) and [startB, endB)
 * Overlap occurs if and only if: max(startA, startB) < min(endA, endB)
 * Adjacent intervals (e.g. 10:00-11:00 and 11:00-12:00) where endA === startB do NOT overlap (ALLOWED).
 */
export function doTimeIntervalsOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  if (startA >= endA || startB >= endB) return false;
  return Math.max(startA, startB) < Math.min(endA, endB);
}

export interface ConflictValidationResult {
  hasConflict: boolean;
  conflictType?: 'batch' | 'teacher' | 'room' | 'invalid_time' | 'intra_schedule';
  message?: string;
  conflictingExamTitle?: string;
  conflictingSlotDetails?: string;
}

/**
 * Comprehensive Conflict Detection Engine
 * 
 * Validates:
 * 1. Slot Time Validity: end time > start time (duration > 0)
 * 2. Intra-Schedule Conflicts: Same exam date with overlapping times for batch/room/invigilator
 * 3. Inter-Exam Conflicts across existing exams:
 *    - Batch Conflict: Same course/batch + same date + overlapping time
 *    - Teacher Conflict: Same invigilator + same date + overlapping time
 *    - Room Conflict: Same room/hall + same date + overlapping time
 */
export function validateExamScheduleConflicts(
  newSchedule: ExamSubjectSchedule[],
  existingExams: Exam[],
  options: {
    currentExamId?: string;
    classLevel: ClassLevel;
    courseId?: string;
    batchName?: string;
    defaultRoom?: string;
  }
): ConflictValidationResult {
  const { currentExamId, courseId, batchName, defaultRoom } = options;

  // 1. Validate internal slot timings & intra-exam conflicts
  for (let i = 0; i < newSchedule.length; i++) {
    const slotA = newSchedule[i];
    const startA = parseTimeToMinutes(slotA.startTime);
    const endA = parseTimeToMinutes(slotA.endTime);

    if (endA <= startA) {
      return {
        hasConflict: true,
        conflictType: 'invalid_time',
        message: `विषय "${slotA.subjectName}" का समाप्ति समय (${slotA.endTime}) प्रारंभ समय (${slotA.startTime}) से बाद का होना चाहिए।`,
      };
    }

    if (slotA.maxMarks <= 0) {
      return {
        hasConflict: true,
        conflictType: 'invalid_time',
        message: `विषय "${slotA.subjectName}" का पूर्णांक (Max Marks) 0 से अधिक होना चाहिए।`,
      };
    }

    if (slotA.passingMarks <= 0 || slotA.passingMarks > slotA.maxMarks) {
      return {
        hasConflict: true,
        conflictType: 'invalid_time',
        message: `विषय "${slotA.subjectName}" का उत्तीर्णांक 1 और पूर्णांक (${slotA.maxMarks}) के बीच होना चाहिए।`,
      };
    }

    // Check with other slots in the same schedule
    for (let j = i + 1; j < newSchedule.length; j++) {
      const slotB = newSchedule[j];
      // Check only if same date
      if (slotA.examDate === slotB.examDate) {
        const startB = parseTimeToMinutes(slotB.startTime);
        const endB = parseTimeToMinutes(slotB.endTime);

        if (doTimeIntervalsOverlap(startA, endA, startB, endB)) {
          // Intra-schedule overlap: A class/batch cannot have 2 exams simultaneously
          return {
            hasConflict: true,
            conflictType: 'intra_schedule',
            message: `समय टकराव (Internal Overlap): एक ही दिनांक (${slotA.examDate}) पर "${slotA.subjectName}" (${slotA.startTime}-${slotA.endTime}) और "${slotB.subjectName}" (${slotB.startTime}-${slotB.endTime}) का समय ओवरलैप हो रहा है।`,
          };
        }
      }
    }
  }

  // 2. Inter-Exam Conflict Checking against all other active/scheduled/ongoing exams
  const otherExams = existingExams.filter(
    (e) => e.id !== currentExamId && e.status !== 'cancelled' && e.status !== 'completed'
  );

  for (const newSlot of newSchedule) {
    const newStart = parseTimeToMinutes(newSlot.startTime);
    const newEnd = parseTimeToMinutes(newSlot.endTime);
    const newRoom = (newSlot.roomOrHall || defaultRoom || '').trim().toLowerCase();
    const newTeacherId = (newSlot.invigilatorId || '').trim();

    for (const existing of otherExams) {
      // Check each slot of existing exam
      for (const exSlot of existing.schedule) {
        // Must be on the exact same date
        if (exSlot.examDate !== newSlot.examDate) {
          continue;
        }

        const exStart = parseTimeToMinutes(exSlot.startTime);
        const exEnd = parseTimeToMinutes(exSlot.endTime);

        // Check time interval overlap
        if (!doTimeIntervalsOverlap(newStart, newEnd, exStart, exEnd)) {
          continue; // Adjacent times or non-overlapping times are ALLOWED
        }

        // 2a. Batch Conflict Check: Same course or batch cannot have two exams overlapping
        const isSameBatch =
          courseId &&
          existing.courseId &&
          courseId === existing.courseId;

        if (isSameBatch) {
          return {
            hasConflict: true,
            conflictType: 'batch',
            conflictingExamTitle: existing.title,
            conflictingSlotDetails: `${exSlot.subjectName} (${exSlot.examDate}, ${exSlot.startTime}-${exSlot.endTime})`,
            message: `बैच टकराव (Batch Conflict): बैच "${existing.batchName || existing.courseName}" के लिए दिनांक ${newSlot.examDate} को समय ${exSlot.startTime}-${exSlot.endTime} पर पहले से "${existing.title} - ${exSlot.subjectName}" निर्धारित है।`,
          };
        }

        // 2b. Room Conflict Check: Same room cannot hold two exams simultaneously
        const exRoom = (exSlot.roomOrHall || existing.roomHallAllocation || '').trim().toLowerCase();
        if (newRoom && exRoom && newRoom === exRoom) {
          return {
            hasConflict: true,
            conflictType: 'room',
            conflictingExamTitle: existing.title,
            conflictingSlotDetails: `कक्ष: ${exSlot.roomOrHall || existing.roomHallAllocation} (${exSlot.examDate}, ${exSlot.startTime}-${exSlot.endTime})`,
            message: `कक्ष टकराव (Room Conflict): कमरा/हॉल "${newSlot.roomOrHall || defaultRoom}" दिनांक ${newSlot.examDate} को समय ${exSlot.startTime}-${exSlot.endTime} पर पहले से "${existing.title}" हेतु आरक्षित है।`,
          };
        }

        // 2c. Teacher / Invigilator Conflict Check: Same teacher cannot invigilate two exams simultaneously
        const exTeacherId = (exSlot.invigilatorId || '').trim();
        if (newTeacherId && exTeacherId && newTeacherId === exTeacherId) {
          return {
            hasConflict: true,
            conflictType: 'teacher',
            conflictingExamTitle: existing.title,
            conflictingSlotDetails: `वीक्षक: ${newSlot.invigilatorName} (${exSlot.examDate}, ${exSlot.startTime}-${exSlot.endTime})`,
            message: `शिक्षक/वीक्षक टकराव (Teacher Conflict): शिक्षक "${newSlot.invigilatorName}" दिनांक ${newSlot.examDate} को समय ${exSlot.startTime}-${exSlot.endTime} पर परीक्षा "${existing.title} (${exSlot.subjectName})" में पहले से नियुक्त हैं।`,
          };
        }
      }
    }
  }

  return { hasConflict: false };
}

/**
 * Helper to get deleted IDs from localStorage
 */
function getDeletedExamIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DELETED_EXAMS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

/**
 * Helper to mark an exam as deleted locally
 */
function markExamAsDeletedLocally(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const deleted = getDeletedExamIds();
    deleted.add(id);
    localStorage.setItem(DELETED_EXAMS_KEY, JSON.stringify(Array.from(deleted)));
  } catch (err) {
    console.warn('[RK STUDY CENTRE] Error persisting deleted exam ID:', err);
  }
}

/**
 * Helper to get cached exams from localStorage (filters out legacy fake baseline records)
 */
function getCachedExams(): Exam[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    // Strict filter: Remove any legacy demo exams
    return arr.filter((e) => e && e.id && !LEGACY_BASELINE_EXAM_IDS.has(e.id));
  } catch {
    return [];
  }
}

/**
 * Helper to save cached exams to localStorage
 */
function setCachedExams(exams: Exam[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Purge fake baseline records before saving
    const cleanExams = exams.filter((e) => e && e.id && !LEGACY_BASELINE_EXAM_IDS.has(e.id));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanExams));
  } catch (err) {
    console.warn('[RK STUDY CENTRE] Error setting exams cache:', err);
  }
}

/**
 * Fetch all real institutional exams.
 * Pure real data only: Firestore collection 'exams' + local owner cache.
 * Returns empty array [] on a fresh database.
 */
export async function getAllExams(): Promise<Exam[]> {
  const deletedIds = getDeletedExamIds();
  const examMap = new Map<string, Exam>();

  // 1. Load clean cached exams (Owner-created only)
  const cached = getCachedExams();
  cached.forEach((exam) => {
    if (!deletedIds.has(exam.id) && !LEGACY_BASELINE_EXAM_IDS.has(exam.id)) {
      examMap.set(exam.id, exam);
    }
  });

  // 2. Query Firestore for authoritative real exams
  try {
    const colRef = collection(db, 'exams');
    const snapshot = await withTimeout(getDocs(colRef), 3000, null);
    if (snapshot && !snapshot.empty) {
      snapshot.forEach((docSnap) => {
        const id = docSnap.id;
        // Ignore deleted IDs and legacy demo IDs
        if (!deletedIds.has(id) && !LEGACY_BASELINE_EXAM_IDS.has(id)) {
          const data = docSnap.data() as Partial<Exam>;
          const exam: Exam = {
            id,
            title: data.title || 'Untitled Exam',
            hindiTitle: data.hindiTitle,
            examType: data.examType || 'unit_test',
            classLevel: data.classLevel || 'class-10',
            courseId: data.courseId,
            courseName: data.courseName,
            batchName: data.batchName,
            academicYear: data.academicYear || '2025-2026',
            examMode: data.examMode || 'offline',
            startDate: data.startDate || new Date().toISOString().split('T')[0],
            endDate: data.endDate || new Date().toISOString().split('T')[0],
            totalMarks: data.totalMarks,
            passingMarks: data.passingMarks,
            status: data.status || 'scheduled',
            schedule: Array.isArray(data.schedule) ? data.schedule : [],
            instructions: data.instructions,
            roomHallAllocation: data.roomHallAllocation,
            notes: data.notes,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          };
          examMap.set(id, exam);
        }
      });
    }
  } catch (error) {
    console.warn('[RK STUDY CENTRE] Error fetching exams from Firestore, using clean cache:', error);
  }

  const result = Array.from(examMap.values());
  // Sort by startDate descending, then title
  result.sort((a, b) => {
    const dateDiff = new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    if (dateDiff !== 0) return dateDiff;
    return a.title.localeCompare(b.title);
  });

  // Update local storage cache
  setCachedExams(result);
  return result;
}

/**
 * Fetch a single exam by ID
 */
export async function getExamById(id: string): Promise<Exam | null> {
  const all = await getAllExams();
  return all.find((e) => e.id === id) || null;
}

/**
 * Fetch exams filtered by class level
 */
export async function getExamsByClass(classLevel: ClassLevel): Promise<Exam[]> {
  const all = await getAllExams();
  return all.filter((e) => e.classLevel === classLevel);
}

/**
 * Create a new real institutional exam record with full conflict validation
 */
export async function createExam(input: CreateExamInput): Promise<Exam> {
  // 1. Strict Validation
  if (!input.title || !input.title.trim()) {
    throw new Error('परीक्षा का नाम (Title) अनिवार्य है।');
  }

  if (!input.classLevel) {
    throw new Error('कक्षा (Class Level) चयन अनिवार्य है।');
  }

  if (!input.startDate || !input.endDate) {
    throw new Error('परीक्षा प्रारंभ व समाप्ति दिनांक अनिवार्य है।');
  }

  if (new Date(input.endDate).getTime() < new Date(input.startDate).getTime()) {
    throw new Error('समाप्ति दिनांक प्रारंभ दिनांक से पूर्व की नहीं हो सकती।');
  }

  if (!input.schedule || input.schedule.length === 0) {
    throw new Error('कम से कम एक विषय की परीक्षा अनुसूची जोड़ना अनिवार्य है।');
  }

  // Ensure schedule slots have IDs & valid numbers
  const formattedSchedule: ExamSubjectSchedule[] = (input.schedule || []).map((slot) => {
    if (!slot.subjectId || !slot.subjectName) {
      throw new Error('प्रत्येक परीक्षा स्लॉट में विषय का चयन अनिवार्य है।');
    }
    if (!slot.examDate) {
      throw new Error(`विषय "${slot.subjectName}" की परीक्षा दिनांक अनिवार्य है।`);
    }
    if (!slot.startTime || !slot.endTime) {
      throw new Error(`विषय "${slot.subjectName}" का प्रारंभ एवं समाप्ति समय अनिवार्य है।`);
    }
    return {
      id: (slot as any).id || generateScheduleSlotId(),
      subjectId: slot.subjectId,
      subjectName: slot.subjectName,
      examDate: slot.examDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      durationMinutes: slot.durationMinutes || 180,
      maxMarks: Number(slot.maxMarks) || 100,
      passingMarks: Number(slot.passingMarks) || 33,
      roomOrHall: slot.roomOrHall,
      invigilatorId: slot.invigilatorId,
      invigilatorName: slot.invigilatorName,
      syllabus: slot.syllabus,
    };
  });

  // 2. Conflict Validation (Batch, Teacher, Room, Intra-Schedule)
  const existingExams = await getAllExams();
  const conflictCheck = validateExamScheduleConflicts(formattedSchedule, existingExams, {
    classLevel: input.classLevel,
    courseId: input.courseId,
    batchName: input.batchName,
    defaultRoom: input.roomHallAllocation,
  });

  if (conflictCheck.hasConflict) {
    throw new Error(conflictCheck.message || 'समय अथवा संसाधन टकराव पाया गया।');
  }

  // Auto calculate total and passing marks if not explicitly passed
  let calculatedTotal = input.totalMarks;
  let calculatedPassing = input.passingMarks;
  if (!calculatedTotal && formattedSchedule.length > 0) {
    calculatedTotal = formattedSchedule.reduce((acc, curr) => acc + curr.maxMarks, 0);
  }
  if (!calculatedPassing && formattedSchedule.length > 0) {
    calculatedPassing = formattedSchedule.reduce((acc, curr) => acc + curr.passingMarks, 0);
  }

  const newId = generateExamId();
  const now = new Date().toISOString();

  const newExam: Exam = {
    id: newId,
    title: input.title.trim(),
    hindiTitle: input.hindiTitle?.trim(),
    examType: input.examType,
    classLevel: input.classLevel,
    courseId: input.courseId,
    courseName: input.courseName,
    batchName: input.batchName,
    academicYear: input.academicYear || '2025-2026',
    examMode: input.examMode || 'offline',
    startDate: input.startDate,
    endDate: input.endDate,
    totalMarks: calculatedTotal,
    passingMarks: calculatedPassing,
    status: input.status || 'scheduled',
    schedule: formattedSchedule,
    instructions: input.instructions?.trim(),
    roomHallAllocation: input.roomHallAllocation?.trim(),
    notes: input.notes?.trim(),
    createdAt: now,
    updatedAt: now,
  };

  // 3. Optimistic Local Cache Update
  const current = getCachedExams();
  const updated = [newExam, ...current.filter((e) => e.id !== newId)];
  setCachedExams(updated);

  // 4. Persist to Firestore
  try {
    const docRef = doc(db, 'exams', newId);
    await withTimeout(setDoc(docRef, newExam), 4000, null);
  } catch (err) {
    console.warn('[RK STUDY CENTRE] Firestore createExam sync pending, cached locally:', err);
  }

  return newExam;
}

/**
 * Update an existing exam record with conflict validation (excluding self)
 */
export async function updateExam(
  id: string,
  updates: Partial<Exam> | Partial<CreateExamInput>
): Promise<Exam> {
  const current = await getExamById(id);
  if (!current) {
    throw new Error('परीक्षा रिकॉर्ड नहीं मिला (Exam not found)');
  }

  const now = new Date().toISOString();

  // If schedule is updated, ensure slots have IDs and recount marks
  let formattedSchedule = current.schedule;
  if (updates.schedule) {
    formattedSchedule = (updates.schedule as any[]).map((slot) => ({
      id: slot.id || generateScheduleSlotId(),
      subjectId: slot.subjectId,
      subjectName: slot.subjectName,
      examDate: slot.examDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      durationMinutes: slot.durationMinutes || 180,
      maxMarks: Number(slot.maxMarks) || 100,
      passingMarks: Number(slot.passingMarks) || 33,
      roomOrHall: slot.roomOrHall,
      invigilatorId: slot.invigilatorId,
      invigilatorName: slot.invigilatorName,
      syllabus: slot.syllabus,
    }));

    // Conflict Validation (excluding this currentExamId)
    const existingExams = await getAllExams();
    const conflictCheck = validateExamScheduleConflicts(formattedSchedule, existingExams, {
      currentExamId: id,
      classLevel: (updates.classLevel || current.classLevel) as ClassLevel,
      courseId: updates.courseId !== undefined ? updates.courseId : current.courseId,
      batchName: updates.batchName !== undefined ? updates.batchName : current.batchName,
      defaultRoom: updates.roomHallAllocation !== undefined ? updates.roomHallAllocation : current.roomHallAllocation,
    });

    if (conflictCheck.hasConflict) {
      throw new Error(conflictCheck.message || 'समय अथवा संसाधन टकराव पाया गया।');
    }
  }

  let totalMarks = updates.totalMarks !== undefined ? updates.totalMarks : current.totalMarks;
  let passingMarks = updates.passingMarks !== undefined ? updates.passingMarks : current.passingMarks;

  if (updates.schedule && !updates.totalMarks && formattedSchedule.length > 0) {
    totalMarks = formattedSchedule.reduce((acc, curr) => acc + curr.maxMarks, 0);
    passingMarks = formattedSchedule.reduce((acc, curr) => acc + curr.passingMarks, 0);
  }

  const updatedExam: Exam = {
    ...current,
    ...updates,
    id,
    schedule: formattedSchedule,
    totalMarks,
    passingMarks,
    updatedAt: now,
  };

  // 1. Optimistic Local Cache Update
  const cached = getCachedExams();
  const newCached = cached.map((e) => (e.id === id ? updatedExam : e));
  if (!cached.some((e) => e.id === id)) {
    newCached.push(updatedExam);
  }
  setCachedExams(newCached);

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, 'exams', id);
    await withTimeout(setDoc(docRef, updatedExam, { merge: true }), 4000, null);
  } catch (err) {
    console.warn('[RK STUDY CENTRE] Firestore updateExam sync pending, cached locally:', err);
  }

  return updatedExam;
}

/**
 * Update the status of an exam (draft, scheduled, ongoing, completed, cancelled)
 */
export async function updateExamStatus(id: string, status: ExamStatus): Promise<Exam> {
  return updateExam(id, { status });
}

/**
 * Permanently delete an institutional exam record
 */
export async function deleteExam(id: string): Promise<boolean> {
  // 1. Mark as deleted locally
  markExamAsDeletedLocally(id);
  const cached = getCachedExams().filter((e) => e.id !== id);
  setCachedExams(cached);

  // 2. Remove from Firestore
  try {
    const docRef = doc(db, 'exams', id);
    await withTimeout(deleteDoc(docRef), 4000, null);
  } catch (err) {
    console.warn('[RK STUDY CENTRE] Firestore deleteExam error, marked locally:', err);
  }

  return true;
}

/**
 * Helper to get label for exam types
 */
export function getExamTypeLabel(type: ExamType): { en: string; hi: string } {
  switch (type) {
    case 'unit_test':
      return { en: 'Unit Test', hi: 'इकाई परीक्षा (Unit Test)' };
    case 'monthly':
      return { en: 'Monthly Assessment', hi: 'मासिक मूल्यांकन टेस्ट (Monthly Test)' };
    case 'quarterly':
      return { en: 'Quarterly Exam', hi: 'त्रैमासिक परीक्षा (Quarterly Exam)' };
    case 'half_yearly':
      return { en: 'Half-Yearly Exam', hi: 'अर्द्धवार्षिक परीक्षा (Half-Yearly Exam)' };
    case 'annual':
      return { en: 'Annual Exam', hi: 'वार्षिक परीक्षा (Annual Exam)' };
    case 'model_board':
      return { en: 'Board Model / Pre-Board', hi: 'बोर्ड मॉडल / प्री-बोर्ड परीक्षा' };
    case 'mock_test':
      return { en: 'Institutional Mock Test', hi: 'संस्थान मॉक टेस्ट (Mock Test)' };
    case 'other':
    default:
      return { en: 'Special Assessment', hi: 'विशेष परीक्षा (Special Assessment)' };
  }
}

/**
 * Helper to get label and styling for exam status
 */
export function getExamStatusMeta(status: ExamStatus): {
  labelHi: string;
  labelEn: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconName: string;
} {
  switch (status) {
    case 'draft':
      return {
        labelHi: 'प्रारूप (Draft)',
        labelEn: 'Draft',
        badgeBg: 'bg-slate-100',
        badgeText: 'text-slate-700',
        badgeBorder: 'border-slate-300',
        iconName: 'FileEdit',
      };
    case 'scheduled':
      return {
        labelHi: 'शेड्यूल किया गया (Scheduled)',
        labelEn: 'Scheduled',
        badgeBg: 'bg-blue-50',
        badgeText: 'text-blue-700',
        badgeBorder: 'border-blue-200',
        iconName: 'CalendarClock',
      };
    case 'ongoing':
      return {
        labelHi: 'वर्तमान में जारी (Ongoing)',
        labelEn: 'Ongoing',
        badgeBg: 'bg-amber-50',
        badgeText: 'text-amber-700',
        badgeBorder: 'border-amber-300',
        iconName: 'PlayCircle',
      };
    case 'completed':
      return {
        labelHi: 'सम्पन्न (Completed)',
        labelEn: 'Completed',
        badgeBg: 'bg-emerald-50',
        badgeText: 'text-emerald-700',
        badgeBorder: 'border-emerald-200',
        iconName: 'CheckCircle2',
      };
    case 'cancelled':
      return {
        labelHi: 'रद्द (Cancelled)',
        labelEn: 'Cancelled',
        badgeBg: 'bg-rose-50',
        badgeText: 'text-rose-700',
        badgeBorder: 'border-rose-200',
        iconName: 'XCircle',
      };
  }
}
