/**
 * RK STUDY CENTRE - Teacher Service (Task 5)
 * 
 * Manages faculty records, teacher addition, editing, course/batch assignments,
 * subject assignments, class level assignments, status toggle (Active/Inactive),
 * and dependency-safe permanent deletion.
 * 
 * Storage:
 * - Authoritative: Firestore collection 'teachers' (Owner/Admin only)
 * - Offline / Session sync: LocalStorage cache with deleted IDs tracking
 */

import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, withTimeout } from '../lib/firebase';
import type { Teacher, CreateTeacherInput, Course } from '../types';
import { getAllCourses, normalizeCourseId } from './courseService';

const LOCAL_STORAGE_KEY = 'rk_teachers_cache_v1';
const DELETED_TEACHERS_KEY = 'rk_deleted_teacher_ids_v1';

const INITIAL_FACULTY_MEMBERS: Teacher[] = [
  {
    id: 'teacher_rk_singh',
    name: 'इंजीनियर आर.के. सिंह (Er. R.K. Singh)',
    phone: '+91 98765 00001',
    email: 'rksingh.director@rkstudy.in',
    gender: 'male',
    qualification: 'B.Tech (Civil), 12+ Years Teaching Experience',
    experienceYears: 12,
    bio: 'संस्थान के निदेशक एवं वरिष्ठ गणित व भौतिकी विशेषज्ञ। बिहार बोर्ड टॉपर मेंटॉर।',
    subjectIds: ['c10-math', 'c10-sci', 'c9-math', 'c9-sci'],
    subjectNames: ['गणित (Mathematics)', 'विज्ञान (Science)'],
    classLevels: ['class-9', 'class-10', 'class-11', 'class-12'],
    assignedCourseIds: ['course-c10-target', 'course-c9-foundation'],
    status: 'active',
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'teacher_pk_mishra',
    name: 'प्रो. पी.के. मिश्रा (Prof. P.K. Mishra)',
    phone: '+91 98765 00002',
    email: 'pkmishra.chem@rkstudy.in',
    gender: 'male',
    qualification: 'M.Sc. Chemistry, B.Ed',
    experienceYears: 9,
    bio: 'वरिष्ठ रसायन विज्ञान एवं जीव विज्ञान व्याख्याता। प्रायोगिक विज्ञान के विशेषज्ञ।',
    subjectIds: ['c10-sci'],
    subjectNames: ['रसायन शास्त्र (Chemistry)', 'विज्ञान (Science)'],
    classLevels: ['class-10', 'class-11', 'class-12'],
    assignedCourseIds: ['course-c12-science', 'course-c11-science'],
    status: 'active',
    createdAt: '2026-08-10T11:30:00.000Z',
    updatedAt: '2026-08-10T11:30:00.000Z',
  },
  {
    id: 'teacher_amit_verma',
    name: 'श्री अमित वर्मा (Shri Amit Verma)',
    phone: '+91 98765 00003',
    email: 'amitverma.math@rkstudy.in',
    gender: 'male',
    qualification: 'M.Sc. Mathematics (Gold Medalist)',
    experienceYears: 7,
    bio: 'मैट्रिक एवं इंटरमीडिएट उच्च गणित विशेषज्ञ, शॉर्टकट तकनीक व OMR ट्रिक विशेषज्ञ।',
    subjectIds: ['c10-math', 'c9-math'],
    subjectNames: ['गणित (Mathematics)'],
    classLevels: ['class-9', 'class-10'],
    assignedCourseIds: ['course-c10-target'],
    status: 'active',
    createdAt: '2026-08-15T09:00:00.000Z',
    updatedAt: '2026-08-15T09:00:00.000Z',
  },
];

function getDeletedTeacherIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_TEACHERS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr);
      }
    }
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error reading deleted teachers:', e);
  }
  return new Set<string>();
}

function markTeacherDeleted(id: string) {
  try {
    const set = getDeletedTeacherIds();
    set.add(id);
    localStorage.setItem(DELETED_TEACHERS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error marking teacher deleted:', e);
  }
}

function unmarkTeacherDeleted(id: string) {
  try {
    const set = getDeletedTeacherIds();
    if (set.has(id)) {
      set.delete(id);
      localStorage.setItem(DELETED_TEACHERS_KEY, JSON.stringify(Array.from(set)));
    }
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error unmarking teacher deleted:', e);
  }
}

function getLocalTeachers(): Teacher[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error reading local teachers:', e);
  }
  return [];
}

function saveLocalTeachers(teachers: Teacher[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(teachers));
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error saving local teachers:', e);
  }
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.substring(2);
  }
  return digits;
}

export function isValidMobileNumber(phone: string): boolean {
  const cleaned = normalizePhone(phone);
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Fetch all registered teachers from Firestore and cache.
 */
export async function getAllTeachers(): Promise<Teacher[]> {
  const teachers: Teacher[] = [];
  const deletedIds = getDeletedTeacherIds();
  let hasRealFirestoreDocs = false;

  try {
    const colRef = collection(db, 'teachers');
    const snapshot = await withTimeout(getDocs(colRef), 3500, null);

    if (snapshot && !snapshot.empty) {
      snapshot.forEach((docSnap) => {
        if (deletedIds.has(docSnap.id)) {
          return;
        }

        const data = docSnap.data();
        hasRealFirestoreDocs = true;

        teachers.push({
          id: docSnap.id,
          name: data.name || 'अज्ञात शिक्षक',
          phone: data.phone || '',
          email: data.email || undefined,
          gender: data.gender as any,
          subjectIds: Array.isArray(data.subjectIds) ? data.subjectIds : [],
          subjectNames: Array.isArray(data.subjectNames) ? data.subjectNames : [],
          classLevels: Array.isArray(data.classLevels) ? data.classLevels : [],
          assignedCourseIds: Array.isArray(data.assignedCourseIds) ? data.assignedCourseIds : [],
          qualification: data.qualification || undefined,
          experienceYears: typeof data.experienceYears === 'number' ? data.experienceYears : undefined,
          bio: data.bio || undefined,
          status: data.status === 'inactive' ? 'inactive' : 'active',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || undefined,
        });
      });
    }
  } catch (error) {
    console.warn('[RK STUDY CENTRE] Firestore fetch teachers error, falling back to local:', error);
  }

  // Merge with locally stored teachers
  const localTeachers = getLocalTeachers().filter((t) => !deletedIds.has(t.id));

  if (hasRealFirestoreDocs) {
    for (const localT of localTeachers) {
      if (localT.id.startsWith('teacher_rk_') || localT.id.startsWith('teacher_pk_') || localT.id.startsWith('teacher_amit_')) {
        continue; // drop demo items when real Firestore items exist
      }
      const existingIdx = teachers.findIndex((t) => t.id === localT.id);
      if (existingIdx >= 0) {
        teachers[existingIdx] = { ...teachers[existingIdx], ...localT };
      } else {
        teachers.push(localT);
      }
    }
  } else if (localTeachers.length > 0) {
    for (const localT of localTeachers) {
      const existingIdx = teachers.findIndex((t) => t.id === localT.id);
      if (existingIdx >= 0) {
        teachers[existingIdx] = { ...teachers[existingIdx], ...localT };
      } else {
        teachers.push(localT);
      }
    }
  }

  // If completely empty and nothing deleted, load baseline faculty
  if (teachers.length === 0 && deletedIds.size === 0) {
    const initialList = [...INITIAL_FACULTY_MEMBERS];
    saveLocalTeachers(initialList);
    return initialList;
  }

  saveLocalTeachers(teachers);

  // Sort: Active first, then newest
  teachers.sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'active' ? -1 : 1;
    }
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  return teachers;
}

/**
 * Get teacher by ID
 */
export async function getTeacherById(id: string): Promise<Teacher | null> {
  const all = await getAllTeachers();
  return all.find((t) => t.id === id) || null;
}

/**
 * Create a new Teacher record
 */
export async function createTeacher(input: CreateTeacherInput): Promise<Teacher> {
  const trimmedName = input.name.trim();
  if (!trimmedName || trimmedName.length < 2) {
    throw new Error('कृपया शिक्षक का पूरा नाम दर्ज करें (कम से कम 2 अक्षर)।');
  }

  const rawPhone = input.phone.trim();
  if (!rawPhone) {
    throw new Error('मोबाइल नंबर दर्ज करना अनिवार्य है।');
  }

  if (!isValidMobileNumber(rawPhone)) {
    throw new Error('कृपया एक वैध 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें (6, 7, 8 या 9 से प्रारंभ)।');
  }

  const cleanedPhone = normalizePhone(rawPhone);
  const formattedPhone = `+91 ${cleanedPhone.slice(0, 5)} ${cleanedPhone.slice(5)}`;

  // Email format validation (if provided)
  const trimmedEmail = (input.email || '').trim().toLowerCase();
  if (trimmedEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      throw new Error('कृपया एक वैध ईमेल प्रारूप दर्ज करें (उदा. teacher@rkstudy.in)।');
    }
  }

  // Subject requirement
  if (!input.subjectIds || input.subjectIds.length === 0) {
    throw new Error('कम से कम एक विषय (Subject) चुनना अनिवार्य है।');
  }

  // Class requirement
  if (!input.classLevels || input.classLevels.length === 0) {
    throw new Error('कम से कम एक कक्षा स्तर (Class Level) चुनना अनिवार्य है।');
  }

  // Duplicate checks against existing teachers
  const allCurrent = await getAllTeachers();
  const duplicatePhone = allCurrent.find((t) => {
    const tPhone = normalizePhone(t.phone);
    return tPhone === cleanedPhone;
  });

  if (duplicatePhone) {
    throw new Error(`मोबाइल नंबर ${formattedPhone} से शिक्षक "${duplicatePhone.name}" पहले से पंजीकृत हैं।`);
  }

  if (trimmedEmail) {
    const duplicateEmail = allCurrent.find((t) => t.email && t.email.toLowerCase() === trimmedEmail);
    if (duplicateEmail) {
      throw new Error(`ईमेल ${trimmedEmail} से शिक्षक "${duplicateEmail.name}" पहले से पंजीकृत हैं।`);
    }
  }

  const newId = `teacher_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  unmarkTeacherDeleted(newId);
  const nowIso = new Date().toISOString();

  const newTeacher: Teacher = {
    id: newId,
    name: trimmedName,
    phone: formattedPhone,
    email: trimmedEmail || undefined,
    gender: input.gender,
    subjectIds: input.subjectIds,
    subjectNames: input.subjectNames || [],
    classLevels: input.classLevels,
    assignedCourseIds: input.assignedCourseIds || [],
    qualification: input.qualification?.trim() || undefined,
    experienceYears: typeof input.experienceYears === 'number' ? input.experienceYears : undefined,
    bio: input.bio?.trim() || undefined,
    status: input.status || 'active',
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // Firestore Write
  try {
    const docRef = doc(db, 'teachers', newId);
    await withTimeout(
      setDoc(docRef, {
        ...newTeacher,
      }),
      4000,
      null
    );
  } catch (fsErr) {
    console.warn('[RK STUDY CENTRE] Firestore teacher create error (saved locally):', fsErr);
  }

  // Local storage update
  const localList = getLocalTeachers();
  localList.unshift(newTeacher);
  saveLocalTeachers(localList);

  return newTeacher;
}

/**
 * Update an existing Teacher record
 */
export async function updateTeacher(
  id: string,
  input: Partial<CreateTeacherInput>
): Promise<void> {
  if (!id) {
    throw new Error('शिक्षक ID अनिवार्य है।');
  }

  const updates: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  };

  if (input.name !== undefined) {
    const trimmed = input.name.trim();
    if (!trimmed || trimmed.length < 2) {
      throw new Error('कृपया एक वैध शिक्षक नाम दर्ज करें (कम से कम 2 अक्षर)।');
    }
    updates.name = trimmed;
  }

  if (input.phone !== undefined) {
    const raw = input.phone.trim();
    if (!isValidMobileNumber(raw)) {
      throw new Error('कृपया एक वैध 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें।');
    }
    const cleaned = normalizePhone(raw);
    updates.phone = `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }

  if (input.email !== undefined) {
    const trimmedEmail = input.email.trim().toLowerCase();
    if (trimmedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        throw new Error('कृपया एक वैध ईमेल पता दर्ज करें।');
      }
      updates.email = trimmedEmail;
    } else {
      updates.email = null;
    }
  }

  if (input.gender !== undefined) {
    updates.gender = input.gender;
  }

  if (input.subjectIds !== undefined) {
    if (input.subjectIds.length === 0) {
      throw new Error('कम से कम एक विषय चुनना अनिवार्य है।');
    }
    updates.subjectIds = input.subjectIds;
  }

  if (input.subjectNames !== undefined) {
    updates.subjectNames = input.subjectNames;
  }

  if (input.classLevels !== undefined) {
    if (input.classLevels.length === 0) {
      throw new Error('कम से कम एक कक्षा चुनना अनिवार्य है।');
    }
    updates.classLevels = input.classLevels;
  }

  if (input.assignedCourseIds !== undefined) {
    updates.assignedCourseIds = input.assignedCourseIds;
  }

  if (input.qualification !== undefined) {
    updates.qualification = input.qualification.trim() || null;
  }

  if (input.experienceYears !== undefined) {
    updates.experienceYears = typeof input.experienceYears === 'number' ? input.experienceYears : null;
  }

  if (input.bio !== undefined) {
    updates.bio = input.bio.trim() || null;
  }

  if (input.status !== undefined) {
    updates.status = input.status;
  }

  // Firestore update
  try {
    const docRef = doc(db, 'teachers', id);
    await withTimeout(updateDoc(docRef, updates), 4000, null);
  } catch (fsErr) {
    console.warn('[RK STUDY CENTRE] Firestore teacher update error (caching locally):', fsErr);
  }

  // Local storage update
  const localList = getLocalTeachers();
  const updatedList = localList.map((t) => {
    if (t.id === id) {
      return {
        ...t,
        ...updates,
      };
    }
    return t;
  });
  saveLocalTeachers(updatedList);
}

/**
 * Toggle teacher active/inactive status
 */
export async function setTeacherStatus(id: string, status: 'active' | 'inactive'): Promise<void> {
  await updateTeacher(id, { status });
}

/**
 * Check teacher dependencies (assigned courses/batches) before deletion
 */
export async function checkTeacherDependencies(
  id: string
): Promise<{
  hasDependencies: boolean;
  assignedCourses: Course[];
  assignedCourseTitles: string[];
}> {
  const teacher = await getTeacherById(id);
  if (!teacher) {
    return { hasDependencies: false, assignedCourses: [], assignedCourseTitles: [] };
  }

  const allCourses = await getAllCourses(true);
  const matchingCourses = allCourses.filter((c) => {
    // Direct assignment via assignedCourseIds
    const isDirectlyAssigned = (teacher.assignedCourseIds || []).includes(c.id);
    // Or instructor name matching
    const isNameMatched =
      c.instructorName &&
      (c.instructorName.includes(teacher.name) || teacher.name.includes(c.instructorName));
    return isDirectlyAssigned || isNameMatched;
  });

  return {
    hasDependencies: matchingCourses.length > 0,
    assignedCourses: matchingCourses,
    assignedCourseTitles: matchingCourses.map((c) => `${c.title} (${c.batchName})`),
  };
}

/**
 * Delete teacher record permanently with dependency safety
 */
export async function deleteTeacher(id: string): Promise<void> {
  if (!id) {
    throw new Error('शिक्षक ID अनिवार्य है।');
  }

  // Mark deleted to prevent ghost reload
  markTeacherDeleted(id);

  // Firestore delete
  try {
    const docRef = doc(db, 'teachers', id);
    await withTimeout(deleteDoc(docRef), 4000, null);
  } catch (fsErr) {
    console.warn('[RK STUDY CENTRE] Firestore teacher delete error (cache cleaned):', fsErr);
  }

  // Local cache remove
  const localList = getLocalTeachers();
  const filtered = localList.filter((t) => t.id !== id);
  saveLocalTeachers(filtered);
}
