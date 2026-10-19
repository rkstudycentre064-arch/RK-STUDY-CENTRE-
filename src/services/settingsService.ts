/**
 * RK STUDY CENTRE - Settings & Payment Status Service (Step 6G)
 * 
 * Safe Owner-Only Firestore persistence for system settings and payment records.
 * - Stores settings in 'settings/general' document.
 * - Enforces Owner authorization (governed by Firestore Rules).
 * - Reads real student enrollment and payment status without fake data.
 * - Never handles passwords, private keys, or third-party payment gateway stubs.
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db, withTimeout } from '../lib/firebase';
import type { AppTheme } from '../types';
import { getAllCourses } from './courseService';

export interface OwnerSettingsData {
  theme: AppTheme;
  websiteName: string;
  logoText: string;
  defaultLanguage: 'hi' | 'en';
  instituteName: string;
  supportPhone: string;
  supportEmail: string;
  // Global Announcement
  announcementMessage: string;
  isAnnouncementActive: boolean;
  // Maintenance Mode
  isMaintenanceActive: boolean;
  maintenanceMessage: string;
  // Institution Address Information
  instituteAddress?: string;
  instituteCity?: string;
  instituteState?: string;
  institutePin?: string;
  instituteLogoUrl?: string;
  // Legacy / Notice banner compatibility
  noticeBanner?: string;
  isNoticeActive?: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface EnrollmentPaymentRecord {
  id: string; // studentUid_courseId
  studentUid: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  courseId: string;
  courseTitle: string;
  batchName: string;
  classLevel: string;
  amount: number;
  paymentStatus: 'successful' | 'pending';
  enrolledAt: string;
  updatedAt?: string;
}

export const DEFAULT_SETTINGS: OwnerSettingsData = {
  theme: 'light',
  websiteName: 'RK STUDY CENTRE',
  logoText: 'RK STUDY CENTRE',
  defaultLanguage: 'hi',
  instituteName: 'RK STUDY CENTRE',
  supportPhone: '+91 91234 56789',
  supportEmail: 'rkstudycentre064@gmail.com',
  announcementMessage: 'सत्र 2025-26 के लिए नए लक्ष्य बैचों में नामांकन प्रारंभ हैं। सभी अध्ययन सामग्री, नोट्स एवं ऑनलाइन टेस्ट उपलब्ध हैं।',
  isAnnouncementActive: true,
  isMaintenanceActive: false,
  maintenanceMessage: 'वेबसाइट पर वर्तमान में आवश्यक तकनीकी सुधार (Maintenance) कार्य चल रहा है। शीघ्र ही सभी सेवाएं सामान्य रूप से उपलब्ध होंगी। किसी भी सहायता हेतु संपर्क करें: rkstudycentre064@gmail.com',
  noticeBanner: 'सत्र 2025-26 के लिए नए लक्ष्य बैचों में नामांकन प्रारंभ हैं।',
  isNoticeActive: true,
  instituteAddress: 'शास्त्री नगर, ब्लॉक बी',
  instituteCity: 'पटना',
  instituteState: 'बिहार',
  institutePin: '800001',
  instituteLogoUrl: '',
};

export function applyThemeToDOM(theme: AppTheme): void {
  if (typeof window === 'undefined') return;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * Fetch owner settings from Firestore 'settings/general' with safe fallback.
 */
export async function getOwnerSettings(): Promise<OwnerSettingsData> {
  try {
    const docRef = doc(db, 'settings', 'general');
    const snap = await withTimeout(getDoc(docRef), 2500, null);

    if (snap && snap.exists()) {
      const data = snap.data();
      const cachedTheme = (typeof window !== 'undefined' ? localStorage.getItem('rk_theme') : null) as AppTheme | null;
      const finalTheme = (cachedTheme || data.theme || 'light') as AppTheme;
      applyThemeToDOM(finalTheme);
      return {
        ...DEFAULT_SETTINGS,
        ...data,
        theme: finalTheme,
      };
    }
  } catch (error) {
    console.warn('[settingsService] Could not fetch settings from Firestore, using defaults:', error);
  }

  // Fallback to local storage or defaults
  const localTheme = (typeof window !== 'undefined' ? localStorage.getItem('rk_theme') : 'light') as AppTheme;
  const safeTheme: AppTheme = localTheme === 'dark' || localTheme === 'system' ? localTheme : 'light';
  applyThemeToDOM(safeTheme);
  return {
    ...DEFAULT_SETTINGS,
    theme: safeTheme,
  };
}

/**
 * Save owner settings to Firestore 'settings/general' and synchronize theme.
 */
export async function saveOwnerSettings(
  settings: Partial<OwnerSettingsData>,
  ownerEmail?: string
): Promise<void> {
  const current = await getOwnerSettings();
  const updated: OwnerSettingsData = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString(),
    updatedBy: ownerEmail || 'rkstudycentre064@gmail.com',
  };

  // Sync theme locally
  if (settings.theme) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rk_theme', settings.theme);
      applyThemeToDOM(settings.theme);
    }
  }

  const docRef = doc(db, 'settings', 'general');
  await setDoc(docRef, {
    ...updated,
    timestamp: serverTimestamp(),
  }, { merge: true });
}

/**
 * Fetch real enrollment and payment status records across all registered students.
 * Reads actual Firestore 'users' collection and maps to real 'courses'.
 * No mock data or fake gateway responses.
 */
export async function getEnrollmentPaymentRecords(): Promise<EnrollmentPaymentRecord[]> {
  const records: EnrollmentPaymentRecord[] = [];

  try {
    // 1. Load courses to map course titles and prices
    const courses = await getAllCourses(true);
    const courseMap = new Map(courses.map((c) => [c.id, c]));

    // 2. Load all users from Firestore
    const usersCol = collection(db, 'users');
    const usersSnap = await withTimeout(getDocs(usersCol), 3000, null);

    if (usersSnap) {
      usersSnap.forEach((userDoc) => {
        const userData = userDoc.data();
        const studentUid = userDoc.id;
        const studentName = userData.displayName || 'नाम उपलब्ध नहीं';
        const studentEmail = userData.email || 'ईमेल उपलब्ध नहीं';
        const studentPhone = userData.phoneNumber || userData.phone || '—';
        const enrolledCourseIds = Array.isArray(userData.enrolledCourseIds) ? userData.enrolledCourseIds : [];
        const userPaymentStatusMap = userData.coursePaymentStatuses || {};

        enrolledCourseIds.forEach((courseId) => {
          const course = courseMap.get(courseId);
          const courseTitle = course ? course.title : `कोर्स ID: ${courseId}`;
          const batchName = course ? course.batchName : 'नियमित बैच';
          const classLevel = course ? course.classLevel : (userData.classLevel || 'सामान्य');
          const amount = course ? (course.discountedPrice || course.price || 0) : 0;

          // Check if there is an explicit recorded status for this course or general payment status
          let status: 'successful' | 'pending' = 'pending';
          if (userPaymentStatusMap[courseId] === 'successful' || userPaymentStatusMap[courseId] === 'pending') {
            status = userPaymentStatusMap[courseId];
          } else if (userData.paymentStatus === 'successful') {
            status = 'successful';
          }

          records.push({
            id: `${studentUid}_${courseId}`,
            studentUid,
            studentName,
            studentEmail,
            studentPhone,
            courseId,
            courseTitle,
            batchName,
            classLevel,
            amount,
            paymentStatus: status,
            enrolledAt: userData.createdAt || 'उपलब्ध नहीं',
            updatedAt: userData.paymentUpdatedAt || '',
          });
        });
      });
    }
  } catch (error: any) {
    console.warn('[settingsService] Error fetching payment records, returning empty or available records:', error);
  }

  // Sort: Pending first, then by date
  records.sort((a, b) => {
    if (a.paymentStatus === 'pending' && b.paymentStatus === 'successful') return -1;
    if (a.paymentStatus === 'successful' && b.paymentStatus === 'pending') return 1;
    return b.enrolledAt.localeCompare(a.enrolledAt);
  });

  return records;
}

/**
 * Update a student's payment status for a specific course enrollment.
 * Safely persists to the student's Firestore user document.
 */
export async function updateStudentCoursePaymentStatus(
  studentUid: string,
  courseId: string,
  newStatus: 'successful' | 'pending'
): Promise<void> {
  const userDocRef = doc(db, 'users', studentUid);
  const snap = await getDoc(userDocRef);

  if (!snap.exists()) {
    throw new Error('विद्यार्थी का रिकॉर्ड उपलब्ध नहीं है।');
  }

  const existingData = snap.data();
  const existingMap = existingData.coursePaymentStatuses || {};

  await updateDoc(userDocRef, {
    coursePaymentStatuses: {
      ...existingMap,
      [courseId]: newStatus,
    },
    paymentStatus: newStatus, // general backwards-compatibility
    paymentUpdatedAt: new Date().toISOString(),
  });
}
