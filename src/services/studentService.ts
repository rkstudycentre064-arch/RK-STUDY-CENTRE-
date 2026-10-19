/**
 * RK STUDY CENTRE - Student Service (Step 6F & Task 4)
 * 
 * Manages registered student directory, manual student addition,
 * student profile editing, course/batch enrollment, and activation/deletion.
 * Uses existing Firestore 'users' collection with strict safety guarantees:
 * - Never returns or handles passwords, tokens, or security credentials.
 * - Enforces Owner-only access (governed by Firestore Rules).
 */

import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db, withTimeout } from '../lib/firebase';
import type { ClassLevel } from '../types';
import { normalizeCourseId } from './courseService';

export interface SafeStudentProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  classLevel?: ClassLevel;
  board: string;
  role: 'student' | 'owner';
  enrolledCourseIds: string[];
  completedTestCount: number;
  createdAt: string;
  updatedAt?: string;
  status: 'active' | 'registered' | 'inactive';
}

export interface CreateStudentInput {
  displayName: string;
  phoneNumber: string;
  email?: string;
  classLevel?: ClassLevel;
  board?: string;
  enrolledCourseIds?: string[];
  status?: 'active' | 'registered' | 'inactive';
}

const LOCAL_STORAGE_KEY = 'rk_students_cache_v2';
const DELETED_STUDENTS_KEY = 'rk_deleted_student_ids_v1';

const INITIAL_DEMO_STUDENTS: SafeStudentProfile[] = [
  {
    uid: 'std_demo_1',
    displayName: 'रोहित कुमार (Rohit Kumar)',
    email: 'rohit.biharboard@gmail.com',
    phoneNumber: '+91 98765 43210',
    classLevel: 'class-10',
    board: 'Bihar Board (BSEB)',
    role: 'student',
    enrolledCourseIds: ['course-c10-target'],
    completedTestCount: 14,
    createdAt: '2026-09-01T10:00:00.000Z',
    status: 'active',
  },
  {
    uid: 'std_demo_2',
    displayName: 'अंजलि शर्मा (Anjali Sharma)',
    email: 'anjali.topper26@gmail.com',
    phoneNumber: '+91 91234 56789',
    classLevel: 'class-12',
    board: 'Bihar Board (BSEB)',
    role: 'student',
    enrolledCourseIds: ['course-c12-science'],
    completedTestCount: 22,
    createdAt: '2026-09-05T14:30:00.000Z',
    status: 'active',
  },
  {
    uid: 'std_demo_3',
    displayName: 'अमित कुमार (Amit Kumar)',
    email: 'amit.rkstudent@gmail.com',
    phoneNumber: '+91 94567 89012',
    classLevel: 'class-10',
    board: 'Bihar Board (BSEB)',
    role: 'student',
    enrolledCourseIds: ['course-c10-target'],
    completedTestCount: 9,
    createdAt: '2026-09-10T09:15:00.000Z',
    status: 'active',
  },
];

function getDeletedStudentIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_STUDENTS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr);
      }
    }
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error reading deleted student IDs:', e);
  }
  return new Set<string>();
}

function markStudentDeleted(uid: string) {
  try {
    const set = getDeletedStudentIds();
    set.add(uid);
    localStorage.setItem(DELETED_STUDENTS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error saving deleted student ID:', e);
  }
}

function unmarkStudentDeleted(uid: string) {
  try {
    const set = getDeletedStudentIds();
    if (set.has(uid)) {
      set.delete(uid);
      localStorage.setItem(DELETED_STUDENTS_KEY, JSON.stringify(Array.from(set)));
    }
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error unmarking deleted student ID:', e);
  }
}

function getLocalStudents(): SafeStudentProfile[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed: SafeStudentProfile[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((s) => ({
          ...s,
          enrolledCourseIds: Array.isArray(s.enrolledCourseIds)
            ? Array.from(new Set(s.enrolledCourseIds.map(normalizeCourseId)))
            : [],
        }));
      }
    }
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error reading local students cache:', e);
  }
  return [];
}

function saveLocalStudents(students: SafeStudentProfile[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(students));
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error saving local students cache:', e);
  }
}

/**
 * Fetch registered students from Firestore 'users' collection.
 * Sanitizes output to strictly safe profile information.
 * Excludes owner/admin account and deleted accounts.
 */
export async function getAllStudents(): Promise<SafeStudentProfile[]> {
  const students: SafeStudentProfile[] = [];
  const deletedUids = getDeletedStudentIds();
  let hasRealFirestoreDocs = false;

  try {
    const usersCol = collection(db, 'users');
    const snapshot = await withTimeout(getDocs(usersCol), 3500, null);

    if (snapshot && !snapshot.empty) {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();

        // Strictly exclude Owner / Admin accounts from student counts & directory
        if (
          data.role === 'owner' ||
          data.email === 'rkstudycentre064@gmail.com' ||
          docSnap.id === 'rkstudycentre064'
        ) {
          return;
        }

        // Exclude permanently deleted students
        if (deletedUids.has(docSnap.id)) {
          return;
        }

        hasRealFirestoreDocs = true;

        // Safely extract profile
        const profile: SafeStudentProfile = {
          uid: docSnap.id,
          displayName: data.displayName || 'विद्यार्थी',
          email: data.email || '',
          phoneNumber: data.phoneNumber || data.phone || '',
          classLevel: data.classLevel as ClassLevel | undefined,
          board: data.board || 'Bihar Board (BSEB)',
          role: 'student',
          enrolledCourseIds: Array.isArray(data.enrolledCourseIds)
            ? Array.from(new Set(data.enrolledCourseIds.map(normalizeCourseId)))
            : [],
          completedTestCount: Array.isArray(data.completedTestIds) ? data.completedTestIds.length : 0,
          createdAt: data.createdAt || (data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : ''),
          updatedAt: data.updatedAt || '',
          status: (data.status as 'active' | 'registered' | 'inactive') ||
            (data.enrolledCourseIds && data.enrolledCourseIds.length > 0 ? 'active' : 'registered'),
        };

        students.push(profile);
      });
    }
  } catch (error: any) {
    console.warn('[RK STUDY CENTRE] Error fetching students from Firestore, using local fallback:', error);
  }

  // Merge with locally stored students (for newly added students in this session/browser)
  const localStudents = getLocalStudents().filter((s) => !deletedUids.has(s.uid));

  if (hasRealFirestoreDocs) {
    // When real Firestore records exist, only merge non-demo offline-created students
    for (const localStd of localStudents) {
      if (localStd.uid.startsWith('std_demo_')) {
        continue; // drop demo items when real Firestore students exist
      }
      const existingIdx = students.findIndex((s) => s.uid === localStd.uid);
      if (existingIdx >= 0) {
        // Prefer newest data
        students[existingIdx] = { ...students[existingIdx], ...localStd };
      } else {
        students.push(localStd);
      }
    }
  } else if (localStudents.length > 0) {
    for (const localStd of localStudents) {
      const existingIdx = students.findIndex((s) => s.uid === localStd.uid);
      if (existingIdx >= 0) {
        students[existingIdx] = { ...students[existingIdx], ...localStd };
      } else {
        students.push(localStd);
      }
    }
  }

  // If absolutely no students returned (fresh DB/offline without local entries), load initial list
  if (students.length === 0 && deletedUids.size === 0) {
    const initialList = [...INITIAL_DEMO_STUDENTS];
    saveLocalStudents(initialList);
    return initialList;
  }

  // Sync to local cache
  saveLocalStudents(students);

  // Sort by createdAt descending (newest first)
  students.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  return students;
}

/**
 * Normalizes phone number to digits only (e.g. "+91 98765 43210" -> "9876543210")
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.substring(2);
  }
  return digits;
}

/**
 * Validates Indian 10-digit mobile number
 */
export function isValidMobileNumber(phone: string): boolean {
  const cleaned = normalizePhone(phone);
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Create a new Student in Firestore and cache
 */
export async function createStudent(input: CreateStudentInput): Promise<SafeStudentProfile> {
  const trimmedName = input.displayName.trim();
  if (!trimmedName || trimmedName.length < 2) {
    throw new Error('कृपया विद्यार्थी का पूरा नाम दर्ज करें (कम से कम 2 अक्षर)।');
  }

  const rawPhone = input.phoneNumber.trim();
  if (!rawPhone) {
    throw new Error('मोबाइल नंबर दर्ज करना अनिवार्य है।');
  }

  if (!isValidMobileNumber(rawPhone)) {
    throw new Error('कृपया एक वैध 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें (6, 7, 8 या 9 से प्रारंभ)।');
  }

  const cleanedPhone = normalizePhone(rawPhone);
  const formattedPhone = `+91 ${cleanedPhone.slice(0, 5)} ${cleanedPhone.slice(5)}`;

  // Email validation & fallback
  let emailToUse = (input.email || '').trim().toLowerCase();
  if (emailToUse) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToUse)) {
      throw new Error('कृपया एक वैध ईमेल पता दर्ज करें (उदा. student@rkstudy.com)।');
    }
  } else {
    // Generate valid placeholder email
    emailToUse = `student_${cleanedPhone}@rkstudy.in`;
  }

  // Duplicate Check against existing students
  const allCurrent = await getAllStudents();
  const duplicatePhone = allCurrent.find((s) => {
    const sPhone = normalizePhone(s.phoneNumber || '');
    return sPhone === cleanedPhone;
  });

  if (duplicatePhone) {
    throw new Error(`मोबाइल नंबर ${formattedPhone} से "${duplicatePhone.displayName}" पहले से पंजीकृत हैं।`);
  }

  const duplicateEmail = allCurrent.find((s) => s.email.toLowerCase() === emailToUse);
  if (duplicateEmail) {
    throw new Error(`ईमेल ${emailToUse} से "${duplicateEmail.displayName}" पहले से पंजीकृत हैं।`);
  }

  // Generate safe UID matching ^[a-zA-Z0-9_\-]+$
  const newUid = `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  unmarkStudentDeleted(newUid);
  const nowIso = new Date().toISOString();

  const newProfile: SafeStudentProfile = {
    uid: newUid,
    displayName: trimmedName,
    email: emailToUse,
    phoneNumber: formattedPhone,
    classLevel: input.classLevel,
    board: input.board || 'Bihar Board (BSEB)',
    role: 'student',
    enrolledCourseIds: input.enrolledCourseIds || [],
    completedTestCount: 0,
    createdAt: nowIso,
    updatedAt: nowIso,
    status: input.status || (input.enrolledCourseIds && input.enrolledCourseIds.length > 0 ? 'active' : 'registered'),
  };

  // Attempt Firestore Write
  try {
    const userDocRef = doc(db, 'users', newUid);
    await withTimeout(
      setDoc(userDocRef, {
        uid: newProfile.uid,
        displayName: newProfile.displayName,
        email: newProfile.email,
        phoneNumber: newProfile.phoneNumber,
        phone: newProfile.phoneNumber,
        classLevel: newProfile.classLevel || null,
        board: newProfile.board,
        role: 'student',
        enrolledCourseIds: newProfile.enrolledCourseIds,
        completedTestIds: [],
        status: newProfile.status,
        createdAt: newProfile.createdAt,
        updatedAt: newProfile.updatedAt,
      }),
      4000,
      null
    );
  } catch (fsError: any) {
    console.warn('[RK STUDY CENTRE] Firestore create error (caching locally):', fsError);
  }

  // Update local storage
  const currentList = getLocalStudents();
  currentList.unshift(newProfile);
  saveLocalStudents(currentList);

  return newProfile;
}

/**
 * Update an existing Student Profile
 */
export async function updateStudent(
  studentUid: string,
  input: Partial<CreateStudentInput>
): Promise<void> {
  if (!studentUid) {
    throw new Error('विद्यार्थी ID अनिवार्य है।');
  }

  const updates: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  };

  if (input.displayName !== undefined) {
    const name = input.displayName.trim();
    if (!name || name.length < 2) {
      throw new Error('कृपया एक वैध विद्यार्थी नाम दर्ज करें।');
    }
    updates.displayName = name;
  }

  if (input.phoneNumber !== undefined) {
    const raw = input.phoneNumber.trim();
    if (!isValidMobileNumber(raw)) {
      throw new Error('कृपया एक वैध 10 अंकों का मोबाइल नंबर दर्ज करें।');
    }
    const cleaned = normalizePhone(raw);
    updates.phoneNumber = `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    updates.phone = updates.phoneNumber;
  }

  if (input.email !== undefined) {
    const email = input.email.trim().toLowerCase();
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('कृपया एक वैध ईमेल पता दर्ज करें।');
      }
      updates.email = email;
    } else if (input.phoneNumber) {
      const cleaned = normalizePhone(input.phoneNumber);
      if (cleaned) {
        updates.email = `student_${cleaned}@rkstudy.in`;
      }
    }
  }

  if (input.classLevel !== undefined) {
    updates.classLevel = input.classLevel;
  }

  if (input.board !== undefined) {
    updates.board = input.board;
  }

  if (input.status !== undefined) {
    updates.status = input.status;
  }

  if (input.enrolledCourseIds !== undefined) {
    updates.enrolledCourseIds = input.enrolledCourseIds;
  }

  // Attempt Firestore update
  try {
    const userDocRef = doc(db, 'users', studentUid);
    await withTimeout(updateDoc(userDocRef, updates), 4000, null);
  } catch (fsErr) {
    console.warn('[RK STUDY CENTRE] Firestore update error (updating local cache):', fsErr);
  }

  // Update local cache
  const localList = getLocalStudents();
  const updatedList = localList.map((s) => {
    if (s.uid === studentUid) {
      return {
        ...s,
        ...updates,
      };
    }
    return s;
  });
  saveLocalStudents(updatedList);
}

/**
 * Delete a Student permanently from Firestore and cache
 */
export async function deleteStudent(studentUid: string): Promise<void> {
  if (!studentUid) {
    throw new Error('विद्यार्थी ID अनिवार्य है।');
  }

  // Mark as deleted immediately to prevent resurrection
  markStudentDeleted(studentUid);

  try {
    const userDocRef = doc(db, 'users', studentUid);
    await withTimeout(deleteDoc(userDocRef), 4000, null);
  } catch (fsErr) {
    console.warn('[RK STUDY CENTRE] Firestore delete error (updating local cache):', fsErr);
  }

  // Remove from local cache
  const localList = getLocalStudents();
  const filtered = localList.filter((s) => s.uid !== studentUid);
  saveLocalStudents(filtered);
}

/**
 * Deactivate or change a student's status (Soft delete / active toggle)
 */
export async function setStudentStatus(
  studentUid: string,
  newStatus: 'active' | 'registered' | 'inactive'
): Promise<void> {
  await updateStudent(studentUid, { status: newStatus });
}

/**
 * Enroll a student in a course (updates 'enrolledCourseIds' in Firestore)
 */
export async function enrollStudentInCourse(studentUid: string, courseId: string): Promise<void> {
  if (!studentUid || !courseId) {
    throw new Error('विद्यार्थी ID एवं कोर्स ID अनिवार्य है।');
  }

  try {
    const userDocRef = doc(db, 'users', studentUid);
    await withTimeout(
      updateDoc(userDocRef, {
        enrolledCourseIds: arrayUnion(courseId),
        status: 'active',
        updatedAt: new Date().toISOString(),
      }),
      4000,
      null
    );
  } catch (fsErr) {
    console.warn('[RK STUDY CENTRE] Firestore enroll error, updating cache:', fsErr);
  }

  // Update local cache
  const localList = getLocalStudents();
  const updatedList = localList.map((s) => {
    if (s.uid === studentUid) {
      const current = s.enrolledCourseIds || [];
      const updated = current.includes(courseId) ? current : [...current, courseId];
      return {
        ...s,
        enrolledCourseIds: updated,
        status: 'active' as const,
        updatedAt: new Date().toISOString(),
      };
    }
    return s;
  });
  saveLocalStudents(updatedList);
}

/**
 * Unenroll a student from a course
 */
export async function unenrollStudentFromCourse(studentUid: string, courseId: string): Promise<void> {
  if (!studentUid || !courseId) {
    throw new Error('विद्यार्थी ID एवं कोर्स ID अनिवार्य है।');
  }

  try {
    const userDocRef = doc(db, 'users', studentUid);
    await withTimeout(
      updateDoc(userDocRef, {
        enrolledCourseIds: arrayRemove(courseId),
        updatedAt: new Date().toISOString(),
      }),
      4000,
      null
    );
  } catch (fsErr) {
    console.warn('[RK STUDY CENTRE] Firestore unenroll error, updating cache:', fsErr);
  }

  // Update local cache
  const localList = getLocalStudents();
  const updatedList = localList.map((s) => {
    if (s.uid === studentUid) {
      const current = s.enrolledCourseIds || [];
      const updated = current.filter((id) => id !== courseId);
      return {
        ...s,
        enrolledCourseIds: updated,
        status: updated.length > 0 ? ('active' as const) : ('registered' as const),
        updatedAt: new Date().toISOString(),
      };
    }
    return s;
  });
  saveLocalStudents(updatedList);
}

/**
 * Update a student's class level by Owner
 */
export async function updateStudentClass(studentUid: string, classLevel: ClassLevel): Promise<void> {
  if (!studentUid || !classLevel) {
    throw new Error('विद्यार्थी ID एवं कक्षा अनिवार्य है।');
  }

  await updateStudent(studentUid, { classLevel });
}

/**
 * Get students enrolled in a specific course
 */
export async function getStudentsForCourse(courseId: string): Promise<SafeStudentProfile[]> {
  const allStudents = await getAllStudents();
  return allStudents.filter((s) => s.enrolledCourseIds.includes(courseId));
}
