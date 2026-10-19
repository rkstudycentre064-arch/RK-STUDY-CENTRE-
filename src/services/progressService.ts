/**
 * RK STUDY CENTRE - Student Progress & Performance Analytics Service
 * 
 * Manages tracking for:
 * 1. Completed Chapters (with one-click toggle and review shortcuts)
 * 2. Pending & Available Tests (matching class and subject hierarchy)
 * 3. Overall Performance Statistics (scores, accuracy, streaks, subject breakdown)
 * 
 * Supports offline-first LocalStorage caching with Firestore cloud synchronization.
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, withTimeout, auth } from '../lib/firebase';
import type {
  ClassLevel,
  Chapter,
  Subject,
  TestItem,
  StoredTestResult,
  ChapterProgressRecord,
  StudentProgressStats,
} from '../types';
import { CHAPTERS, SUBJECTS, TESTS, CLASSES_METADATA } from '../lib/constants';
import { getAllInstitutionTests } from './testService';

const COMPLETED_CHAPTERS_KEY = 'rk_completed_chapters_v1';
const TEST_RESULTS_KEY = 'rk_test_results_list_v1';
const STREAK_KEY = 'rk_study_streak_v1';

// Custom event to notify components across the app when progress updates
export const PROGRESS_UPDATED_EVENT = 'rk_progress_updated';

function triggerProgressUpdateEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PROGRESS_UPDATED_EVENT));
  }
}

/**
 * Update daily active study streak (guaranteed safe against future dates)
 */
export function touchActiveStreak(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(STREAK_KEY);
    if (!saved) {
      const data = { lastActiveDate: today, streakCount: 1 };
      localStorage.setItem(STREAK_KEY, JSON.stringify(data));
      return 1;
    }
    let { lastActiveDate, streakCount } = JSON.parse(saved);
    // Sanity check: Ensure date is not in the future
    if (!lastActiveDate || lastActiveDate > today) {
      lastActiveDate = today;
    }
    if (lastActiveDate === today) {
      return streakCount || 1;
    }
    const lastDate = new Date(lastActiveDate);
    const currentDate = new Date(today);
    const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    let newStreak = 1;
    if (diffDays === 1) {
      newStreak = (streakCount || 0) + 1;
    }
    localStorage.setItem(STREAK_KEY, JSON.stringify({ lastActiveDate: today, streakCount: newStreak }));
    return newStreak;
  } catch {
    return 1;
  }
}

export function getStudyStreak(): { streakCount: number; lastActiveDate: string } {
  const today = new Date().toISOString().split('T')[0];
  if (typeof window === 'undefined') return { streakCount: 1, lastActiveDate: today };
  try {
    const saved = localStorage.getItem(STREAK_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      let lastActiveDate = parsed.lastActiveDate || today;
      let streakCount = parsed.streakCount || 1;
      // Guard against future dates: clamp to today if lastActiveDate is in the future
      if (lastActiveDate > today) {
        lastActiveDate = today;
      }
      // If student missed more than 1 day, streak is broken
      const lastDate = new Date(lastActiveDate);
      const currentDate = new Date(today);
      const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 1) {
        streakCount = 0;
      }
      return { streakCount, lastActiveDate };
    }
  } catch {}
  return { streakCount: 1, lastActiveDate: today };
}

/**
 * Get all completed chapter records from localStorage and/or Firestore
 */
export function getLocalCompletedChapters(): ChapterProgressRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(COMPLETED_CHAPTERS_KEY);
    if (saved) {
      const parsed: ChapterProgressRecord[] = JSON.parse(saved);
      const nowTime = Date.now();
      // Ensure no record has a future timestamp
      return parsed.map((item) => {
        if (item.completedAt && new Date(item.completedAt).getTime() > nowTime) {
          return { ...item, completedAt: new Date().toISOString() };
        }
        return item;
      });
    }
  } catch (e) {
    console.warn('[ProgressService] Error reading completed chapters from localStorage:', e);
  }
  return [];
}

/**
 * Save completed chapters array to localStorage
 */
function setLocalCompletedChapters(records: ChapterProgressRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COMPLETED_CHAPTERS_KEY, JSON.stringify(records));
    triggerProgressUpdateEvent();
  } catch (e) {
    console.warn('[ProgressService] Error saving completed chapters to localStorage:', e);
  }
}

/**
 * Synchronize completed chapters with Firestore for signed-in student
 */
export async function getCompletedChapters(classLevel?: ClassLevel): Promise<ChapterProgressRecord[]> {
  const localList = getLocalCompletedChapters();

  // If student is signed in, attempt to fetch from Firestore
  if (auth.currentUser) {
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await withTimeout(getDoc(userDocRef), 3000, null);
      if (userDoc && userDoc.exists()) {
        const data = userDoc.data();
        if (Array.isArray(data.completedChapters)) {
          // Merge local and remote
          const mergedMap = new Map<string, ChapterProgressRecord>();
          localList.forEach((item) => mergedMap.set(item.chapterId, item));
          data.completedChapters.forEach((item: ChapterProgressRecord) => {
            if (item && item.chapterId) mergedMap.set(item.chapterId, item);
          });
          const merged = Array.from(mergedMap.values());
          setLocalCompletedChapters(merged);
          return classLevel ? merged.filter((c) => c.classLevel === classLevel) : merged;
        }
      }
    } catch (err) {
      console.warn('[ProgressService] Could not sync with Firestore, using local data:', err);
    }
  }

  return classLevel ? localList.filter((c) => c.classLevel === classLevel) : localList;
}

/**
 * Check if a specific chapter is marked completed
 */
export function isChapterCompleted(chapterId: string): boolean {
  const list = getLocalCompletedChapters();
  return list.some((item) => item.chapterId === chapterId);
}

/**
 * Toggle chapter completion status
 */
export async function toggleChapterCompletion(
  chapter: Chapter,
  classLevel: ClassLevel,
  subject?: Subject
): Promise<{ isCompleted: boolean; updatedList: ChapterProgressRecord[] }> {
  touchActiveStreak();
  const currentList = getLocalCompletedChapters();
  const index = currentList.findIndex((item) => item.chapterId === chapter.id);
  let isNowCompleted = false;
  let newList: ChapterProgressRecord[] = [];

  if (index >= 0) {
    // Remove from completed
    newList = currentList.filter((item) => item.chapterId !== chapter.id);
    isNowCompleted = false;
  } else {
    // Add to completed
    const record: ChapterProgressRecord = {
      chapterId: chapter.id,
      chapterNumber: chapter.chapterNumber,
      chapterTitle: chapter.title,
      hindiTitle: chapter.hindiTitle || chapter.title,
      subjectId: chapter.subjectId,
      subjectName: subject ? (subject.hindiName || subject.name) : chapter.subjectId,
      classLevel: classLevel || chapter.classLevel,
      completedAt: new Date().toISOString(),
      notesRead: true,
    };
    newList = [record, ...currentList];
    isNowCompleted = true;
  }

  setLocalCompletedChapters(newList);

  // Sync to Firestore if signed in
  if (auth.currentUser) {
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(
        userDocRef,
        {
          completedChapters: newList,
          completedChapterIds: newList.map((c) => c.chapterId),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('[ProgressService] Firestore sync error for chapter toggle:', err);
    }
  }

  return { isCompleted: isNowCompleted, updatedList: newList };
}

/**
 * Get all stored test results (LocalStorage + Firestore fallback)
 */
export async function getAllTestResults(studentId?: string): Promise<StoredTestResult[]> {
  const results: StoredTestResult[] = [];
  const seenIds = new Set<string>();

  // 1. Read from LocalStorage list
  if (typeof window !== 'undefined') {
    try {
      const savedList = localStorage.getItem(TEST_RESULTS_KEY);
      if (savedList) {
        const parsed: StoredTestResult[] = JSON.parse(savedList);
        parsed.forEach((r) => {
          if (!seenIds.has(r.id)) {
            seenIds.add(r.id);
            results.push(r);
          }
        });
      }

      // Also scan for individual result keys like `rk_test_result_res-*`
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('rk_test_result_')) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const item = JSON.parse(raw);
              if (item && item.id && !seenIds.has(item.id)) {
                seenIds.add(item.id);
                // Enrich with test metadata if missing
                const matchedTest = TESTS.find((t) => t.id === item.testId);
                const enriched: StoredTestResult = {
                  ...item,
                  testTitle: item.testTitle || matchedTest?.title || 'ऑनलाइन टेस्ट',
                  classLevel: item.classLevel || matchedTest?.classLevel || 'class-10',
                  passed: item.passed !== undefined ? item.passed : (item.score >= (matchedTest?.passingMarks || item.totalMarks * 0.4)),
                };
                results.push(enriched);
              }
            }
          } catch {}
        }
      }
    } catch (e) {
      console.warn('[ProgressService] LocalStorage read error:', e);
    }
  }

  // 2. Query Firestore if student is logged in
  const targetUid = studentId || auth.currentUser?.uid;
  if (targetUid) {
    try {
      const q = query(collection(db, 'testResults'), where('studentId', '==', targetUid));
      const snapshot = await withTimeout(getDocs(q), 3000, null);
      if (snapshot) {
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as StoredTestResult;
          if (!seenIds.has(docSnap.id)) {
            seenIds.add(docSnap.id);
            results.push({ ...data, id: docSnap.id });
          }
        });
      }
    } catch (err) {
      console.warn('[ProgressService] Firestore test results fetch error:', err);
    }
  }

  // Ensure completedAt is not in the future for any stored result
  const nowTime = Date.now();
  const nowIso = new Date().toISOString();
  results.forEach((r) => {
    if (r.completedAt && new Date(r.completedAt).getTime() > nowTime) {
      r.completedAt = nowIso;
    }
  });

  // Sort by completedAt descending
  results.sort((a, b) => {
    const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return timeB - timeA;
  });

  return results;
}

/**
 * Record a student test result to both LocalStorage and Firestore
 */
export async function recordTestResult(result: StoredTestResult, uid?: string): Promise<void> {
  touchActiveStreak();

  const matchedTest = TESTS.find((t) => t.id === result.testId);
  const matchedSubject = SUBJECTS.find((s) => s.id === matchedTest?.subjectId);
  const matchedChapter = CHAPTERS.find((c) => c.id === matchedTest?.chapterId);

  const passingMarks = matchedTest ? matchedTest.passingMarks : Math.ceil(result.totalMarks * 0.4);
  const isPassed = result.score >= passingMarks;

  const nowIso = new Date().toISOString();
  let sanitizedCompletedAt = result.completedAt || nowIso;
  // Guard against future timestamps
  if (new Date(sanitizedCompletedAt).getTime() > Date.now()) {
    sanitizedCompletedAt = nowIso;
  }

  const enrichedResult: StoredTestResult = {
    ...result,
    completedAt: sanitizedCompletedAt,
    testTitle: result.testTitle || matchedTest?.title || 'ऑनलाइन टेस्ट',
    subjectName: matchedSubject?.hindiName || matchedSubject?.name || matchedTest?.subjectId || '',
    chapterTitle: matchedChapter?.hindiTitle || matchedChapter?.title || '',
    classLevel: result.classLevel || matchedTest?.classLevel || 'class-10',
    passed: isPassed,
  };

  // 1. Save single key for backward compatibility
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`rk_test_result_${result.id}`, JSON.stringify(enrichedResult));

      // Append to the consolidated list
      const savedList = localStorage.getItem(TEST_RESULTS_KEY);
      let list: StoredTestResult[] = savedList ? JSON.parse(savedList) : [];
      list = list.filter((r) => r.id !== result.id);
      list.unshift(enrichedResult);
      localStorage.setItem(TEST_RESULTS_KEY, JSON.stringify(list));
      triggerProgressUpdateEvent();
    } catch (e) {
      console.warn('[ProgressService] LocalStorage save error:', e);
    }
  }

  // 2. Save to Firestore if user is signed in
  const targetUid = uid || auth.currentUser?.uid;
  if (targetUid) {
    try {
      const docRef = doc(db, 'testResults', result.id);
      await setDoc(docRef, {
        ...enrichedResult,
        studentId: targetUid,
        serverTimestamp: serverTimestamp(),
      });

      // Update user document's completedTestIds
      const userRef = doc(db, 'users', targetUid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentCompletedTests = Array.isArray(userData.completedTestIds) ? userData.completedTestIds : [];
        if (!currentCompletedTests.includes(result.testId)) {
          await setDoc(
            userRef,
            {
              completedTestIds: [...currentCompletedTests, result.testId],
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      }
    } catch (err) {
      console.warn('[ProgressService] Firestore test result save error:', err);
    }
  }
}

/**
 * Get pending tests for a class
 * A test is pending if the student hasn't completed it, or if they failed and need revision
 */
export async function getPendingTests(classLevel: ClassLevel): Promise<{
  pendingTests: TestItem[];
  attemptedTests: StoredTestResult[];
  allTests: TestItem[];
}> {
  // Fetch all institution tests (both static constants and live Firestore tests)
  const allTests = await getAllInstitutionTests();
  const classTests = allTests.filter((t) => t.classLevel === classLevel && t.isPublished !== false);

  const completedResults = await getAllTestResults();
  const attemptedTestIdSet = new Set<string>();
  const passedTestIdSet = new Set<string>();

  completedResults.forEach((r) => {
    attemptedTestIdSet.add(r.testId);
    if (r.passed) {
      passedTestIdSet.add(r.testId);
    }
  });

  // Pending tests: either never attempted OR attempted but not passed
  const pendingTests = classTests.filter((t) => !passedTestIdSet.has(t.id));

  return {
    pendingTests,
    attemptedTests: completedResults.filter((r) => r.classLevel === classLevel),
    allTests: classTests,
  };
}

/**
 * Compute student overall performance statistics
 */
export async function getOverallPerformanceStats(classLevel: ClassLevel): Promise<{
  stats: StudentProgressStats;
  subjectBreakdown: Array<{
    subject: Subject;
    totalChapters: number;
    completedChapters: number;
    totalTests: number;
    passedTests: number;
    averageScore: number;
    completionPercent: number;
  }>;
}> {
  // 1. Chapters stats
  const classChapters = CHAPTERS.filter((c) => c.classLevel === classLevel);
  const completedChapters = await getCompletedChapters(classLevel);
  const completedChapterIds = new Set(completedChapters.map((c) => c.chapterId));

  // 2. Tests stats
  const allTests = await getAllInstitutionTests();
  const classTests = allTests.filter((t) => t.classLevel === classLevel && t.isPublished !== false);
  const allResults = await getAllTestResults();
  const classResults = allResults.filter((r) => {
    if (r.classLevel && r.classLevel === classLevel) return true;
    const matched = classTests.find((t) => t.id === r.testId);
    return Boolean(matched);
  });

  // Calculate unique tests attempted & passed
  const attemptedTestIds = new Set(classResults.map((r) => r.testId));
  const passedTestIds = new Set(classResults.filter((r) => r.passed).map((r) => r.testId));

  let totalScoreEarned = 0;
  let totalMaxMarks = 0;
  let totalQuestionsAnswered = 0;
  let correctQuestionsCount = 0;

  classResults.forEach((r) => {
    totalScoreEarned += (r.score || 0);
    totalMaxMarks += (r.totalMarks || 0);
    totalQuestionsAnswered += ((r.correctAnswers || 0) + (r.incorrectAnswers || 0));
    correctQuestionsCount += (r.correctAnswers || 0);
  });

  const averageScorePercent = totalMaxMarks > 0 ? Math.round((totalScoreEarned / totalMaxMarks) * 100) : 0;
  const overallAccuracyPercent = totalQuestionsAnswered > 0 ? Math.round((correctQuestionsCount / totalQuestionsAnswered) * 100) : 0;

  const totalChapters = classChapters.length || 1;
  const completedChaptersCount = completedChapters.length;
  const chapterCompletionPercent = Math.min(100, Math.round((completedChaptersCount / totalChapters) * 100));

  const totalAvailableTests = classTests.length;
  const attemptedTestsCount = attemptedTestIds.size;
  const passedTestsCount = passedTestIds.size;
  const testCompletionPercent = totalAvailableTests > 0 ? Math.min(100, Math.round((passedTestsCount / totalAvailableTests) * 100)) : 0;

  const streak = getStudyStreak();

  const stats: StudentProgressStats = {
    classLevel,
    totalChapters: classChapters.length,
    completedChaptersCount,
    chapterCompletionPercent,
    totalAvailableTests,
    attemptedTestsCount,
    passedTestsCount,
    testCompletionPercent,
    averageScorePercent,
    totalQuestionsAnswered,
    correctQuestionsCount,
    overallAccuracyPercent,
    studyStreakDays: streak.streakCount || 1,
  };

  // 3. Subject-wise breakdown
  const classSubjects = SUBJECTS.filter((s) => s.classLevel === classLevel);
  const subjectBreakdown = classSubjects.map((sub) => {
    const subChapters = classChapters.filter((c) => c.subjectId === sub.id);
    const subCompleted = subChapters.filter((c) => completedChapterIds.has(c.id)).length;
    const subTests = classTests.filter((t) => t.subjectId === sub.id);
    const subTestIds = new Set(subTests.map((t) => t.id));

    const subResults = classResults.filter((r) => subTestIds.has(r.testId) || r.subjectName?.includes(sub.name) || r.subjectName?.includes(sub.hindiName));
    const subPassed = new Set(subResults.filter((r) => r.passed).map((r) => r.testId)).size;

    let subScore = 0;
    let subMax = 0;
    subResults.forEach((r) => {
      subScore += (r.score || 0);
      subMax += (r.totalMarks || 0);
    });
    const subAvg = subMax > 0 ? Math.round((subScore / subMax) * 100) : 0;

    const chapterWeight = subChapters.length > 0 ? (subCompleted / subChapters.length) * 60 : 0;
    const testWeight = subTests.length > 0 ? (subPassed / subTests.length) * 40 : 0;
    const compPercent = Math.min(100, Math.round(chapterWeight + testWeight));

    return {
      subject: sub,
      totalChapters: subChapters.length,
      completedChapters: subCompleted,
      totalTests: subTests.length,
      passedTests: subPassed,
      averageScore: subAvg,
      completionPercent: compPercent,
    };
  });

  return { stats, subjectBreakdown };
}
