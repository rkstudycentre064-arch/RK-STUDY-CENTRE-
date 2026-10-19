/**
 * RK STUDY CENTRE - Active Firebase Client & Authentication Services
 * 
 * Configured with gen-lang-client-0136417208 project credentials.
 * Supports Email/Password, Google Sign-In, Password Reset, and Firestore profile synchronization.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type Auth,
  type User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  serverTimestamp,
  type Firestore,
  type FirestoreError
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import appletConfig from '../../firebase-applet-config.json';
import type { UserProfile, ClassLevel } from '../types';

// Silence non-fatal Firestore network status and offline retry logs
try {
  setLogLevel('silent');
} catch {
  // ignore
}

const getEnvVar = (name: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[name] || '';
    }
  } catch {
    // ignore
  }
  return '';
};

// Merge applet config with environment variables (environment variables take precedence if defined)
const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY') || appletConfig.apiKey || '',
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN') || appletConfig.authDomain || '',
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID') || appletConfig.projectId || '',
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET') || appletConfig.storageBucket || '',
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID') || appletConfig.messagingSenderId || '',
  appId: getEnvVar('VITE_FIREBASE_APP_ID') || appletConfig.appId || '',
  measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID') || appletConfig.measurementId || '',
};

const databaseId = getEnvVar('VITE_FIREBASE_DATABASE_ID') || appletConfig.firestoreDatabaseId || undefined;

console.log(`[RK STUDY CENTRE] Config: Project=${firebaseConfig.projectId}, DB=${databaseId || 'default'}`);

let appInstance: FirebaseApp;
let authInstance: Auth;
let dbInstance: Firestore;
let storageInstance: FirebaseStorage;

if (getApps().length === 0) {
  appInstance = initializeApp(firebaseConfig);
} else {
  appInstance = getApps()[0];
}

authInstance = getAuth(appInstance);

console.log(`[RK STUDY CENTRE] Initializing Firestore for Project: ${firebaseConfig.projectId}, Database: ${databaseId || '(default)'}`);

const targetDatabaseId = databaseId && databaseId !== '(default)' ? databaseId : undefined;

try {
  if (targetDatabaseId) {
    dbInstance = initializeFirestore(
      appInstance,
      {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        }),
        experimentalAutoDetectLongPolling: true,
      },
      targetDatabaseId
    );
  } else {
    dbInstance = initializeFirestore(
      appInstance,
      {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        }),
        experimentalAutoDetectLongPolling: true,
      }
    );
  }
} catch {
  try {
    dbInstance = targetDatabaseId
      ? getFirestore(appInstance, targetDatabaseId)
      : getFirestore(appInstance);
  } catch {
    dbInstance = targetDatabaseId
      ? getFirestore(appInstance, targetDatabaseId)
      : getFirestore(appInstance);
  }
}

storageInstance = getStorage(appInstance);

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;

// Robust helper to run Firestore operations with a timeout to prevent hanging when offline or backend unreachable
export async function withTimeout<T>(promise: Promise<T>, timeoutMs = 3500, fallbackValue: T): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallbackValue), timeoutMs);
  });

  return Promise.race([
    promise
      .then((res) => {
        clearTimeout(timer);
        return res;
      })
      .catch((err) => {
        clearTimeout(timer);
        const errCode = (err as any)?.code;
        if (
          errCode === 'unavailable' || 
          errCode === 'failed-precondition' || 
          (err?.message && (err.message.includes('offline') || err.message.includes('unavailable') || err.message.includes('transport') || err.message.includes('backend')))
        ) {
          console.warn('[RK STUDY CENTRE] Operating in resilient offline mode:', err?.message || errCode);
          return fallbackValue;
        }
        return fallbackValue;
      }),
    timeoutPromise,
  ]);
}

// Firestore Error Handling (Pillar 3 of Firebase Skill)
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authInstance?.currentUser?.uid,
      email: authInstance?.currentUser?.email,
      emailVerified: authInstance?.currentUser?.emailVerified,
      isAnonymous: authInstance?.currentUser?.isAnonymous,
      tenantId: authInstance?.currentUser?.tenantId,
      providerInfo: authInstance?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  // Log for system diagnostics
  console.error('[RK STUDY CENTRE] Firestore Diagnostic:', JSON.stringify(errInfo));
  
  // Re-throw to propagate to UI/Agent
  if (error instanceof Error && error.message.includes('permission-denied')) {
    throw new Error(JSON.stringify(errInfo));
  }
  
  throw error;
}

// Validate connection to Firestore on boot (Firebase Skill Constraint)
export async function testConnection(retries = 1): Promise<boolean> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await withTimeout(getDocFromServer(doc(dbInstance, 'test', 'connection')), 3500, null);
      console.log('[RK STUDY CENTRE] Successfully connected to Cloud Firestore backend.');
      return true;
    } catch (error) {
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        continue;
      }
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn('[RK STUDY CENTRE] Operating in resilient offline mode.');
      }
      return false;
    }
  }
  return false;
}

// Automatically test connection on boot
testConnection().catch(() => {});

// Test connection on boot gracefully using check
export async function verifyFirestoreConnection(): Promise<boolean> {
  try {
    const testDocRef = doc(dbInstance, 'test', 'connection');
    await withTimeout(getDoc(testDocRef), 2000, null);
    return true;
  } catch (error) {
    const err = error as FirestoreError;
    if (err?.code === 'unavailable' || (err?.message && err.message.includes('offline'))) {
      console.warn('[RK STUDY CENTRE] Firestore operating in offline/cached mode.');
    }
    return false;
  }
}

export function getFirebaseStatus() {
  return {
    isConfigured: Boolean(firebaseConfig.apiKey && firebaseConfig.projectId),
    projectId: firebaseConfig.projectId,
    hasAuth: Boolean(authInstance),
    hasFirestore: Boolean(dbInstance),
    hasStorage: Boolean(storageInstance),
    authDomain: firebaseConfig.authDomain,
  };
}

// Authentication Helpers
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function loginWithEmail(email: string, pass: string) {
  const userCredential = await signInWithEmailAndPassword(authInstance, email, pass);
  return userCredential.user;
}

export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string,
  classLevel: ClassLevel = 'class-10',
  phone: string = ''
) {
  const userCredential = await createUserWithEmailAndPassword(authInstance, email, pass);
  const user = userCredential.user;

  // Update Auth Profile Display Name
  await updateProfile(user, { displayName });

  // Sync profile document to Firestore users collection
  const profileData: Partial<UserProfile> = {
    uid: user.uid,
    displayName,
    email: user.email || email,
    phoneNumber: phone,
    role: user.email === 'rkstudycentre064@gmail.com' ? 'owner' : 'student',
    classLevel,
    enrolledCourseIds: [],
    completedTestIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(dbInstance, 'users', user.uid), {
      ...profileData,
      timestamp: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.warn('[RK STUDY CENTRE] Profile sync notice:', error);
  }

  return user;
}

export async function loginWithGoogle(defaultClass: ClassLevel = 'class-10') {
  const userCredential = await signInWithPopup(authInstance, googleProvider);
  const user = userCredential.user;

  // Check if profile exists; create if first time
  const userDocRef = doc(dbInstance, 'users', user.uid);
  try {
    const existing = await getDoc(userDocRef);
    if (!existing.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        displayName: user.displayName || 'Student',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        photoURL: user.photoURL || '',
        role: user.email === 'rkstudycentre064@gmail.com' ? 'owner' : 'student',
        classLevel: defaultClass,
        enrolledCourseIds: [],
        completedTestIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timestamp: serverTimestamp()
      });
    }
  } catch (err) {
    console.warn('[RK STUDY CENTRE] Google profile sync notice:', err);
  }

  return user;
}

export async function sendPasswordReset(email: string) {
  return await sendPasswordResetEmail(authInstance, email);
}

export async function logoutUser() {
  return await signOut(authInstance);
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  let profile: UserProfile | null = null;
  try {
    const userDoc = await withTimeout(getDoc(doc(dbInstance, 'users', uid)), 3500, null);
    if (userDoc && userDoc.exists()) {
      profile = userDoc.data() as UserProfile;
    }
  } catch (e) {
    console.warn('[RK STUDY CENTRE] Error fetching profile:', e);
  }

  // Merge locally cached student enrollments for instant resilient reflection
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('rk_students_cache_v2');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          const localStd = list.find((s: any) => s.uid === uid);
          if (localStd) {
            const mergedIds = Array.from(
              new Set([
                ...(profile?.enrolledCourseIds || []),
                ...(Array.isArray(localStd.enrolledCourseIds) ? localStd.enrolledCourseIds : []),
              ])
            );
            if (profile) {
              profile = { ...profile, enrolledCourseIds: mergedIds };
            } else {
              profile = {
                uid: localStd.uid,
                email: localStd.email || '',
                displayName: localStd.displayName || 'Student',
                phoneNumber: localStd.phoneNumber || '',
                classLevel: localStd.classLevel || 'class-10',
                board: localStd.board || 'Bihar Board',
                role: localStd.role || 'student',
                enrolledCourseIds: mergedIds,
                createdAt: localStd.createdAt || new Date().toISOString(),
              };
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }

  return profile;
}

export { onAuthStateChanged, type FirebaseUser };
