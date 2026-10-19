/**
 * RK STUDY CENTRE - Course Service (Step 6F)
 * 
 * Manages Firestore persistence and retrieval for Courses and Target Batches.
 * Strictly respects Class-level isolation: Class 9, Class 10, Class 11, Class 12.
 * Integrates seamlessly with existing static baseline courses.
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
import type { ClassLevel, Course } from '../types';
import { COURSES } from '../lib/constants';

export function generateCourseId(): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 7);
  return `course_${ts}_${rand}`;
}

const LEGACY_COURSE_ID_MAP: Record<string, string> = {
  'course-c10-matric-target-2026': 'course-c10-target',
  'course-c12-inter-science-2026': 'course-c12-science',
  'course-c9-foundation-2026': 'course-c9-foundation',
};

export function normalizeCourseId(courseId: string): string {
  if (!courseId) return courseId;
  return LEGACY_COURSE_ID_MAP[courseId] || courseId;
}

const LOCAL_COURSES_CACHE_KEY = 'rk_courses_cache_v1';

function getLocalCoursesCache(): Course[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_COURSES_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalCoursesCache(courses: Course[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_COURSES_CACHE_KEY, JSON.stringify(courses));
  } catch {
    // ignore
  }
}

/**
 * Get all courses across the institution for Owner Management or Student Catalog.
 * Merges baseline static courses with live Firestore records.
 */
export async function getAllCourses(includeClosed = true): Promise<Course[]> {
  const coursesMap = new Map<string, Course>();

  // 1. Baseline static courses from constants.ts
  COURSES.forEach((c) => {
    coursesMap.set(c.id, { ...c });
  });

  // 2. Merge locally cached course updates/creations
  getLocalCoursesCache().forEach((c) => {
    const normId = normalizeCourseId(c.id);
    coursesMap.set(normId, { ...c, id: normId });
  });

  // 3. Live Firestore courses (authoritative override)
  try {
    const colRef = collection(db, 'courses');
    const snapshot = await withTimeout(getDocs(colRef), 3000, null);
    if (snapshot) {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Course;
        const normId = normalizeCourseId(docSnap.id);
        const item: Course = {
          ...data,
          id: normId,
        };
        coursesMap.set(normId, item);
      });
    }
  } catch (error: any) {
    console.warn('[RK STUDY CENTRE] Error fetching Firestore courses:', error);
  }

  const allMerged = Array.from(coursesMap.values());
  saveLocalCoursesCache(allMerged);

  // 4. Strictly enforce includeClosed filter across BOTH baseline and custom courses
  const courses = includeClosed
    ? allMerged
    : allMerged.filter((c) => c.enrollmentOpen !== false);

  // Sort by createdAt descending if present
  courses.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  return courses;
}

/**
 * Get courses strictly filtered by Class Level (Class 9, 10, 11, 12).
 */
export async function getCoursesForClass(
  classLevel: ClassLevel,
  includeClosed = false
): Promise<Course[]> {
  const all = await getAllCourses(includeClosed);
  return all.filter((c) => c.classLevel === classLevel);
}

export interface SaveCoursePayload {
  id?: string;
  classLevel: ClassLevel;
  title: string;
  description: string;
  batchName: string;
  instructorName: string;
  subjectsCovered: string[];
  features: string[];
  totalLectures: number;
  price: number;
  discountedPrice: number;
  enrollmentOpen: boolean;
  startDate: string;
}

/**
 * Create or update a course in Firestore.
 */
export async function saveCourse(payload: SaveCoursePayload): Promise<Course> {
  const {
    id,
    classLevel,
    title,
    description,
    batchName,
    instructorName,
    subjectsCovered,
    features,
    totalLectures,
    price,
    discountedPrice,
    enrollmentOpen,
    startDate,
  } = payload;

  if (!classLevel) {
    throw new Error('कक्षा (Class 9, 10, 11, 12) चुनना अनिवार्य है।');
  }

  if (!title.trim()) {
    throw new Error('कोर्स का शीर्षक (Course Title) दर्ज करना अनिवार्य है।');
  }

  const courseId = id || generateCourseId();
  const now = new Date().toISOString();

  const courseDoc: Course = {
    id: courseId,
    classLevel,
    title: title.trim(),
    description: description.trim(),
    batchName: batchName.trim() || 'लक्ष्य बैच',
    instructorName: instructorName.trim() || 'RK STUDY CENTRE विशेषज्ञ शिक्षक दल',
    subjectsCovered: subjectsCovered && subjectsCovered.length > 0 ? subjectsCovered : ['सामान्य'],
    features: features && features.length > 0 ? features : ['नियमित कक्षाएं एवं नोट्स'],
    totalLectures: Math.max(0, Number(totalLectures) || 0),
    price: Math.max(0, Number(price) || 0),
    discountedPrice: Math.max(0, Number(discountedPrice) || 0),
    enrollmentOpen: Boolean(enrollmentOpen),
    startDate: startDate.trim() || 'प्रारंभिक प्रवेश जारी',
    createdAt: id ? (payload as any).createdAt || now : now,
    updatedAt: now,
  };

  // Update local cache immediately
  const cached = getLocalCoursesCache().filter((c) => c.id !== courseId);
  saveLocalCoursesCache([courseDoc, ...cached]);

  try {
    const docRef = doc(db, 'courses', courseId);
    await withTimeout(
      setDoc(docRef, {
        ...courseDoc,
        timestamp: serverTimestamp(),
      }),
      4000,
      null
    );
  } catch (err) {
    console.warn('[RK STUDY CENTRE] Course save notice (cached locally):', err);
  }

  return courseDoc;
}

/**
 * Toggle enrollment status for a course.
 */
export async function toggleCourseEnrollment(
  courseId: string,
  newEnrollmentStatus: boolean
): Promise<void> {
  const nowIso = new Date().toISOString();
  const cached = getLocalCoursesCache();
  const existingIdx = cached.findIndex((c) => c.id === courseId);
  if (existingIdx !== -1) {
    cached[existingIdx] = {
      ...cached[existingIdx],
      enrollmentOpen: newEnrollmentStatus,
      updatedAt: nowIso,
    };
    saveLocalCoursesCache(cached);
  } else {
    const staticCourse = COURSES.find((c) => c.id === courseId);
    if (staticCourse) {
      saveLocalCoursesCache([
        ...cached,
        { ...staticCourse, enrollmentOpen: newEnrollmentStatus, updatedAt: nowIso },
      ]);
    }
  }

  const isStatic = COURSES.some((c) => c.id === courseId);
  if (isStatic) {
    const staticCourse = COURSES.find((c) => c.id === courseId)!;
    const docRef = doc(db, 'courses', courseId);
    try {
      await withTimeout(
        setDoc(
          docRef,
          {
            ...staticCourse,
            enrollmentOpen: newEnrollmentStatus,
            updatedAt: nowIso,
          },
          { merge: true }
        ),
        4000,
        null
      );
    } catch (err) {
      console.warn('[RK STUDY CENTRE] Course toggle notice (cached locally):', err);
    }
    return;
  }

  const docRef = doc(db, 'courses', courseId);
  try {
    await withTimeout(
      updateDoc(docRef, {
        enrollmentOpen: newEnrollmentStatus,
        updatedAt: nowIso,
      }),
      4000,
      null
    );
  } catch (err) {
    console.warn('[RK STUDY CENTRE] Course toggle notice (cached locally):', err);
  }
}

/**
 * Delete a course document from Firestore.
 * Prevents deleting baseline static courses from code.
 */
export async function deleteCourse(courseId: string): Promise<void> {
  const isStatic = COURSES.some((c) => c.id === courseId);
  if (isStatic) {
    throw new Error('सिस्टम द्वारा पूर्व-प्रदत्त बेसलाइन कोर्स को हटाया नहीं जा सकता। आप इसका प्रवेश (Enrollment) बंद कर सकते हैं।');
  }

  const cached = getLocalCoursesCache().filter((c) => c.id !== courseId);
  saveLocalCoursesCache(cached);

  try {
    const docRef = doc(db, 'courses', courseId);
    await withTimeout(deleteDoc(docRef), 4000, null);
  } catch (err) {
    console.warn('[RK STUDY CENTRE] Course delete notice:', err);
  }
}
