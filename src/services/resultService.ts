/**
 * RK STUDY CENTRE - Institutional Exam Results & Scorecard Service (Task 11)
 * 
 * Manages institutional exam results, subject-wise marks entry, bulk entry,
 * aggregate percentages, centralized grading, pass/fail status, and publishing workflows.
 * 
 * Storage:
 * - Authoritative: Firestore collection 'results' (Owner/Admin access)
 * - Offline / Session Sync: LocalStorage cache with deleted IDs tracking
 */

import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, withTimeout } from '../lib/firebase';
import type {
  ClassLevel,
  ExamSubjectResultRecord,
  ResultStatus,
  PassFailStatus,
} from '../types';

const LOCAL_STORAGE_KEY = 'rk_institutional_results_cache_v1';
const DELETED_RESULTS_KEY = 'rk_deleted_results_ids_v1';

/**
 * Centralized Grade Calculation Helper
 */
export function calculateGrade(percentage: number, isPassed: boolean): string {
  if (!isPassed || percentage <= 0 || isNaN(percentage)) return 'F';
  if (percentage >= 90) return 'A+';
  if (percentage >= 75) return 'A';
  if (percentage >= 60) return 'B+';
  if (percentage >= 45) return 'B';
  if (percentage >= 33) return 'C';
  return 'D';
}

/**
 * Centralized Pass/Fail Calculation Helper
 */
export function calculatePassFail(
  marksObtained: number | null | undefined,
  passingMarks: number,
  maxMarks: number
): PassFailStatus {
  if (marksObtained === null || marksObtained === undefined || isNaN(Number(marksObtained))) {
    return 'pending';
  }
  const obt = Number(marksObtained);
  if (obt < 0 || obt > maxMarks) return 'fail';
  if (obt >= passingMarks) return 'pass';
  return 'fail';
}

/**
 * Helper to generate unique result record ID
 */
export function generateResultRecordId(examId: string, studentId: string, subjectId: string): string {
  return `res_${examId}_${studentId}_${subjectId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Helper to get deleted result IDs from localStorage
 */
function getDeletedResultIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DELETED_RESULTS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

/**
 * Helper to mark result ID as deleted locally
 */
function markResultAsDeletedLocally(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const deleted = getDeletedResultIds();
    deleted.add(id);
    localStorage.setItem(DELETED_RESULTS_KEY, JSON.stringify(Array.from(deleted)));
  } catch (err) {
    console.warn('[RK STUDY CENTRE] Error persisting deleted result ID:', err);
  }
}

/**
 * Helper to get cached results from localStorage
 */
function getCachedResults(): ExamSubjectResultRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/**
 * Helper to save cached results to localStorage
 */
function setCachedResults(results: ExamSubjectResultRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(results));
  } catch (err) {
    console.warn('[RK STUDY CENTRE] Error setting results cache:', err);
  }
}

/**
 * Fetch all institutional exam results (Firestore + LocalStorage cache)
 * Returns empty array [] if none exist.
 */
export async function getAllResults(): Promise<ExamSubjectResultRecord[]> {
  const deletedIds = getDeletedResultIds();
  const resultMap = new Map<string, ExamSubjectResultRecord>();

  // 1. Load cached results
  const cached = getCachedResults();
  cached.forEach((res) => {
    if (res && res.id && !deletedIds.has(res.id)) {
      resultMap.set(res.id, res);
    }
  });

  // 2. Query Firestore collection 'results'
  try {
    const colRef = collection(db, 'results');
    const snapshot = await withTimeout(getDocs(colRef), 3000, null);
    if (snapshot && !snapshot.empty) {
      snapshot.forEach((docSnap) => {
        const id = docSnap.id;
        if (!deletedIds.has(id)) {
          const data = docSnap.data() as Partial<ExamSubjectResultRecord>;
          const maxMarks = Number(data.maxMarks) || 100;
          const passingMarks = Number(data.passingMarks) || 33;
          const obt = data.marksObtained !== null && data.marksObtained !== undefined ? Number(data.marksObtained) : null;
          const percentage = obt !== null ? Number(((obt / maxMarks) * 100).toFixed(2)) : 0;
          const passFail = calculatePassFail(obt, passingMarks, maxMarks);
          const grade = calculateGrade(percentage, passFail === 'pass');

          const record: ExamSubjectResultRecord = {
            id,
            examId: data.examId || '',
            studentId: data.studentId || '',
            studentName: data.studentName || 'Unknown Student',
            studentPhone: data.studentPhone || '',
            courseId: data.courseId || '',
            batchName: data.batchName || '',
            classLevel: data.classLevel || 'class-10',
            subjectId: data.subjectId || '',
            subjectName: data.subjectName || '',
            maxMarks,
            passingMarks,
            marksObtained: obt,
            percentage,
            grade,
            passFail,
            remarks: data.remarks || '',
            status: data.status || 'draft',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            createdBy: data.createdBy || '',
            updatedBy: data.updatedBy || '',
            publishedAt: data.publishedAt,
            publishedBy: data.publishedBy,
          };
          resultMap.set(id, record);
        }
      });
    }
  } catch (err) {
    console.warn('[RK STUDY CENTRE] Error fetching results from Firestore, using cache:', err);
  }

  const results = Array.from(resultMap.values());
  setCachedResults(results);
  return results;
}

/**
 * Fetch results for a specific exam ID
 */
export async function getResultsByExamId(examId: string): Promise<ExamSubjectResultRecord[]> {
  const all = await getAllResults();
  return all.filter((r) => r.examId === examId);
}

/**
 * Fetch results for a specific student ID
 */
export async function getResultsByStudentId(studentId: string): Promise<ExamSubjectResultRecord[]> {
  const all = await getAllResults();
  return all.filter((r) => r.studentId === studentId);
}

export interface SaveResultInput {
  examId: string;
  studentId: string;
  studentName: string;
  studentPhone?: string;
  courseId?: string;
  batchName?: string;
  classLevel: ClassLevel;
  subjectId: string;
  subjectName: string;
  maxMarks: number;
  passingMarks: number;
  marksObtained?: number | null;
  remarks?: string;
  status?: ResultStatus;
  userId?: string;
}

/**
 * Create or Update a result record with strict validation and duplicate prevention (examId + studentId + subjectId)
 */
export async function saveExamResult(input: SaveResultInput): Promise<ExamSubjectResultRecord> {
  const maxMarks = Number(input.maxMarks) || 100;
  const passingMarks = Number(input.passingMarks) || 33;
  const obt = input.marksObtained !== null && input.marksObtained !== undefined && String(input.marksObtained).trim() !== '' ? Number(input.marksObtained) : null;

  if (obt !== null) {
    if (isNaN(obt)) {
      throw new Error('अंक (Marks) संख्यात्मक होने चाहिए।');
    }
    if (obt < 0) {
      throw new Error('प्राप्तांक (Marks Obtained) 0 से कम नहीं हो सकते।');
    }
    if (obt > maxMarks) {
      throw new Error(`प्राप्तांक (${obt}) अधिकतम अंक (${maxMarks}) से अधिक नहीं हो सकते।`);
    }
  }

  const percentage = obt !== null ? Number(((obt / maxMarks) * 100).toFixed(2)) : 0;
  const passFail = calculatePassFail(obt, passingMarks, maxMarks);
  const grade = calculateGrade(percentage, passFail === 'pass');

  const resultId = generateResultRecordId(input.examId, input.studentId, input.subjectId);
  const now = new Date().toISOString();

  // Check if existing record exists to preserve createdAt
  const existingAll = await getAllResults();
  const existing = existingAll.find((r) => r.id === resultId);

  const record: ExamSubjectResultRecord = {
    id: resultId,
    examId: input.examId,
    studentId: input.studentId,
    studentName: input.studentName,
    studentPhone: input.studentPhone || '',
    courseId: input.courseId || '',
    batchName: input.batchName || '',
    classLevel: input.classLevel,
    subjectId: input.subjectId,
    subjectName: input.subjectName,
    maxMarks,
    passingMarks,
    marksObtained: obt,
    percentage,
    grade,
    passFail,
    remarks: input.remarks?.trim() || existing?.remarks || '',
    status: input.status !== undefined ? input.status : existing?.status || 'draft',
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    createdBy: existing?.createdBy || input.userId || 'owner',
    updatedBy: input.userId || 'owner',
    publishedAt: input.status === 'published' && existing?.status !== 'published' ? now : existing?.publishedAt,
    publishedBy: input.status === 'published' && existing?.status !== 'published' ? (input.userId || 'owner') : existing?.publishedBy,
  };

  // 1. Optimistic Local Cache Update
  const cached = getCachedResults();
  const updatedCache = [record, ...cached.filter((r) => r.id !== resultId)];
  setCachedResults(updatedCache);

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, 'results', resultId);
    await withTimeout(setDoc(docRef, record), 4000, null);
  } catch (err) {
    console.warn('[RK STUDY CENTRE] Firestore saveExamResult sync pending, cached locally:', err);
  }

  return record;
}

/**
 * Bulk save results for an exam
 */
export async function bulkSaveExamResults(inputs: SaveResultInput[]): Promise<ExamSubjectResultRecord[]> {
  const saved: ExamSubjectResultRecord[] = [];
  for (const input of inputs) {
    const res = await saveExamResult(input);
    saved.push(res);
  }
  return saved;
}

/**
 * Publish all results for a given exam ID
 */
export async function publishExamResults(examId: string, userId?: string): Promise<number> {
  const all = await getAllResults();
  const examResults = all.filter((r) => r.examId === examId);
  const now = new Date().toISOString();
  let count = 0;

  for (const res of examResults) {
    if (res.status !== 'published') {
      await saveExamResult({
        examId: res.examId,
        studentId: res.studentId,
        studentName: res.studentName,
        studentPhone: res.studentPhone,
        courseId: res.courseId,
        batchName: res.batchName,
        classLevel: res.classLevel,
        subjectId: res.subjectId,
        subjectName: res.subjectName,
        maxMarks: res.maxMarks,
        passingMarks: res.passingMarks,
        marksObtained: res.marksObtained,
        remarks: res.remarks,
        status: 'published',
        userId,
      });
      count++;
    }
  }
  return count;
}

/**
 * Unpublish / Reopen results for a given exam ID back to draft
 */
export async function unpublishExamResults(examId: string, userId?: string): Promise<number> {
  const all = await getAllResults();
  const examResults = all.filter((r) => r.examId === examId);
  let count = 0;

  for (const res of examResults) {
    if (res.status === 'published') {
      await saveExamResult({
        examId: res.examId,
        studentId: res.studentId,
        studentName: res.studentName,
        studentPhone: res.studentPhone,
        courseId: res.courseId,
        batchName: res.batchName,
        classLevel: res.classLevel,
        subjectId: res.subjectId,
        subjectName: res.subjectName,
        maxMarks: res.maxMarks,
        passingMarks: res.passingMarks,
        marksObtained: res.marksObtained,
        remarks: res.remarks,
        status: 'draft',
        userId,
      });
      count++;
    }
  }
  return count;
}

/**
 * Delete a single result record
 */
export async function deleteExamResult(resultId: string): Promise<boolean> {
  markResultAsDeletedLocally(resultId);
  const cached = getCachedResults().filter((r) => r.id !== resultId);
  setCachedResults(cached);

  try {
    const docRef = doc(db, 'results', resultId);
    await withTimeout(deleteDoc(docRef), 4000, null);
  } catch (err) {
    console.warn('[RK STUDY CENTRE] Firestore deleteExamResult error:', err);
  }
  return true;
}
