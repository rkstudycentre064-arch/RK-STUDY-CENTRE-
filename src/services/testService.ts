/**
 * RK STUDY CENTRE - Test Service
 * 
 * Manages Firestore persistence and retrieval for Practice Quizzes and Online Tests.
 * Enforces strict 4-tier hierarchy: Class -> Subject -> Book -> Chapter.
 * Integrates seamlessly with existing Step 5 static test definitions.
 */

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, withTimeout } from '../lib/firebase';
import type { ClassLevel, TestItem, TestQuestion, TestType } from '../types';
import { TESTS, TEST_QUESTIONS } from '../lib/constants';

/**
 * Unique ID generator for tests and questions
 */
export function generateTestId(): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 7);
  return `test_${ts}_${rand}`;
}

export function generateQuestionId(): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 6);
  return `q_${ts}_${rand}`;
}

export function getStaticTestsForChapter(
  classLevel: ClassLevel,
  subjectId: string,
  bookId: string,
  chapterId: string
): TestItem[] {
  return TESTS.filter(
    (t) =>
      t.classLevel === classLevel &&
      t.subjectId === subjectId &&
      t.bookId === bookId &&
      t.chapterId === chapterId
  ).map((t) => ({
    ...t,
    questions:
      t.questions && t.questions.length > 0
        ? t.questions
        : (TEST_QUESTIONS.filter((q) => q.testId === t.id) as TestQuestion[]),
  }));
}

export function getStaticTestById(testId: string): TestItem | null {
  const staticTest = TESTS.find((t) => t.id === testId);
  if (!staticTest) return null;
  const questions =
    staticTest.questions && staticTest.questions.length > 0
      ? staticTest.questions
      : (TEST_QUESTIONS.filter((q) => q.testId === testId) as TestQuestion[]);
  return {
    ...staticTest,
    questions,
    isPublished: true,
  };
}

/**
 * Fetch tests matching strict 4-tier hierarchy:
 * classLevel + subjectId + bookId + chapterId
 * 
 * Merges live Firestore tests with baseline static tests from Step 5.
 */
export async function getTestsForChapter(
  classLevel: ClassLevel,
  subjectId: string,
  bookId: string,
  chapterId: string,
  includeUnpublished = false
): Promise<TestItem[]> {
  // 1. Static base tests from constants.ts matching all 4 keys
  const staticMatches = getStaticTestsForChapter(classLevel, subjectId, bookId, chapterId);

  const combinedTests: TestItem[] = [...staticMatches];
  const seenIds = new Set(staticMatches.map((t) => t.id));

  // 2. Fetch live tests from Firestore with fast timeout
  try {
    const colRef = collection(db, 'tests');
    const q = query(
      colRef,
      where('classLevel', '==', classLevel),
      where('subjectId', '==', subjectId),
      where('bookId', '==', bookId),
      where('chapterId', '==', chapterId)
    );

    const snapshot = await withTimeout(getDocs(q), 2000, null);
    if (snapshot) {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as TestItem;
        const testItem: TestItem = {
          ...data,
          id: docSnap.id,
        };

        if (!seenIds.has(testItem.id)) {
          // If not includeUnpublished, skip unpublished tests for students
          if (!includeUnpublished && testItem.isPublished === false) {
            return;
          }
          seenIds.add(testItem.id);
          combinedTests.push(testItem);
        }
      });
    }
  } catch (error) {
    console.warn('[RK STUDY CENTRE] Error fetching Firestore tests:', error);
  }

  return combinedTests;
}

/**
 * Get all tests across the entire institution for Owner Portal management.
 */
export async function getAllInstitutionTests(): Promise<TestItem[]> {
  const tests: TestItem[] = [];
  const seenIds = new Set<string>();

  // 1. Baseline Step 5 tests
  TESTS.forEach((t) => {
    seenIds.add(t.id);
    const questions = TEST_QUESTIONS.filter((q) => q.testId === t.id);
    tests.push({
      ...t,
      isPublished: true,
      questions: questions as TestQuestion[],
    });
  });

  // 2. Live Firestore tests
  try {
    const colRef = collection(db, 'tests');
    const snapshot = await withTimeout(getDocs(colRef), 3000, null);
    if (snapshot) {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as TestItem;
        const testItem: TestItem = {
          ...data,
          id: docSnap.id,
        };

        if (!seenIds.has(testItem.id)) {
          seenIds.add(testItem.id);
          tests.push(testItem);
        } else {
          // If live doc overrides static baseline, update it
          const index = tests.findIndex((t) => t.id === testItem.id);
          if (index !== -1) {
            tests[index] = testItem;
          }
        }
      });
    }
  } catch (error) {
    console.warn('[RK STUDY CENTRE] Error fetching all institution tests:', error);
  }

  // Sort by created date descending if available
  tests.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  return tests;
}

/**
 * Fetch a single test by ID along with its questions.
 */
export async function getTestById(testId: string): Promise<TestItem | null> {
  // 1. Fast path: if it is a built-in static test (not a dynamic timestamped test_17... ID), return immediately in 0ms
  const staticFound = getStaticTestById(testId);
  if (staticFound && !/^test_\d+_/.test(testId)) {
    return staticFound;
  }

  // 2. Check live Firestore with fast timeout
  try {
    const docRef = doc(db, 'tests', testId);
    const docSnap = await withTimeout(getDoc(docRef), 2000, null);
    if (docSnap && docSnap.exists()) {
      const data = docSnap.data() as TestItem;
      let questions = data.questions;
      if (!questions || questions.length === 0) {
        questions = TEST_QUESTIONS.filter((q) => q.testId === testId) as TestQuestion[];
      }
      return {
        ...data,
        id: docSnap.id,
        questions,
      };
    }
  } catch (error) {
    console.warn(`[RK STUDY CENTRE] Error fetching test ${testId} from Firestore:`, error);
  }

  // 3. Fallback to static baseline tests
  return staticFound;
}

export interface SaveTestPayload {
  id?: string;
  classLevel: ClassLevel;
  subjectId: string;
  subjectName?: string;
  bookId: string;
  bookTitle?: string;
  chapterId: string;
  chapterTitle?: string;
  title: string;
  type: TestType;
  durationMinutes: number;
  passingMarks: number;
  isNegativeMarking: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  instructions?: string;
  isPublished?: boolean;
  questions: TestQuestion[];
}

/**
 * Create or update a test in Firestore.
 * Ensures questions are validated, counts/marks are synchronized,
 * and all 4 hierarchical IDs are preserved.
 */
export async function saveTest(payload: SaveTestPayload): Promise<TestItem> {
  const {
    id,
    classLevel,
    subjectId,
    subjectName,
    bookId,
    bookTitle,
    chapterId,
    chapterTitle,
    title,
    type,
    durationMinutes,
    passingMarks,
    isNegativeMarking,
    difficulty,
    instructions,
    isPublished = true,
    questions,
  } = payload;

  if (!classLevel || !subjectId || !bookId || !chapterId) {
    throw new Error('कक्षा, विषय, पुस्तक एवं अध्याय (सभी 4 स्तर) चुनना अनिवार्य है।');
  }

  if (!title.trim()) {
    throw new Error('कृपया टेस्ट का शीर्षक (Title) दर्ज करें।');
  }

  if (!questions || questions.length === 0) {
    throw new Error('टेस्ट में कम से कम 1 प्रश्न होना अनिवार्य है।');
  }

  const testId = id || generateTestId();
  const totalQuestions = questions.length;
  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);

  // Synchronize questions with correct test and hierarchy references
  const normalizedQuestions: TestQuestion[] = questions.map((q, idx) => ({
    id: q.id || generateQuestionId(),
    testId,
    classId: classLevel,
    subjectId,
    bookId,
    chapterId,
    question: q.question.trim(),
    options: [
      q.options[0].trim(),
      q.options[1].trim(),
      q.options[2].trim(),
      q.options[3].trim(),
    ] as [string, string, string, string],
    correctOption: q.correctOption,
    explanation: q.explanation?.trim() || '',
    marks: Number(q.marks) || 1,
    order: idx + 1,
  }));

  const now = new Date().toISOString();
  const testDoc: TestItem = {
    id: testId,
    classLevel,
    subjectId,
    subjectName: subjectName || '',
    bookId,
    bookTitle: bookTitle || '',
    chapterId,
    chapterTitle: chapterTitle || '',
    title: title.trim(),
    type,
    totalQuestions,
    durationMinutes: type === 'practice_quiz' ? 0 : Math.max(0, durationMinutes),
    totalMarks,
    passingMarks: Math.min(totalMarks, Math.max(0, passingMarks)),
    isNegativeMarking: Boolean(isNegativeMarking),
    difficulty,
    instructions: instructions?.trim() || '',
    isPublished,
    questions: normalizedQuestions,
    createdAt: payload.id ? (payload as any).createdAt || now : now,
    updatedAt: now,
  };

  const docRef = doc(db, 'tests', testId);
  await setDoc(docRef, {
    ...testDoc,
    serverTimestamp: serverTimestamp(),
  });

  return testDoc;
}

/**
 * Toggle test publication status (Publish / Unpublish)
 */
export async function toggleTestPublishStatus(
  testId: string,
  newStatus: boolean
): Promise<void> {
  const isStatic = TESTS.some((t) => t.id === testId);
  if (isStatic) {
    // For static baseline tests, create or update a shadow record in Firestore
    const staticTest = TESTS.find((t) => t.id === testId)!;
    const questions = TEST_QUESTIONS.filter((q) => q.testId === testId);
    const docRef = doc(db, 'tests', testId);
    await setDoc(
      docRef,
      {
        ...staticTest,
        questions,
        isPublished: newStatus,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return;
  }

  const docRef = doc(db, 'tests', testId);
  await updateDoc(docRef, {
    isPublished: newStatus,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a test.
 * Safeguards baseline static tests from deletion.
 */
export async function deleteTest(testId: string): Promise<void> {
  const isStatic = TESTS.some((t) => t.id === testId);
  if (isStatic) {
    throw new Error('सिस्टम द्वारा पूर्व-प्रदत्त बेसलाइन टेस्ट को हटाया नहीं जा सकता है। आप इसे Unpublish कर सकते हैं।');
  }

  const docRef = doc(db, 'tests', testId);
  await deleteDoc(docRef);
}
