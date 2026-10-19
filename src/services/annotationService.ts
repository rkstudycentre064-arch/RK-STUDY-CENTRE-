/**
 * RK STUDY CENTRE - Student Highlights & Notes Annotation Service
 * 
 * Allows students to highlight specific text segments within study material notes,
 * attach personal revision notes, and save them locally with Firestore user profile sync.
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

const ANNOTATIONS_LOCAL_KEY = 'rk_student_annotations_v1';
export const ANNOTATION_UPDATED_EVENT = 'rk_annotation_updated';

export interface AnnotationItem {
  id: string;
  text: string;
  noteId: string;
  chapterTitle?: string;
  subjectName?: string;
  color: 'yellow' | 'emerald' | 'blue' | 'rose' | 'amber';
  personalNote?: string;
  createdAt: string;
  userId?: string;
}

function notifyAnnotationUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ANNOTATION_UPDATED_EVENT));
  }
}

/**
 * Get all saved highlights and annotations
 */
export function getSavedAnnotations(noteId?: string): AnnotationItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ANNOTATIONS_LOCAL_KEY);
    if (!raw) return [];
    const items: AnnotationItem[] = JSON.parse(raw);
    if (noteId) {
      return items.filter((item) => item.noteId === noteId);
    }
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

/**
 * Save a new highlight / annotation
 */
export async function saveAnnotation(data: {
  text: string;
  noteId: string;
  chapterTitle?: string;
  subjectName?: string;
  color?: 'yellow' | 'emerald' | 'blue' | 'rose' | 'amber';
  personalNote?: string;
}): Promise<AnnotationItem> {
  const newAnnotation: AnnotationItem = {
    id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    text: data.text.trim(),
    noteId: data.noteId,
    chapterTitle: data.chapterTitle || 'अध्याय नोट्स',
    subjectName: data.subjectName || 'विज्ञान / सामान्य',
    color: data.color || 'yellow',
    personalNote: data.personalNote || '',
    createdAt: new Date().toISOString(),
    userId: auth?.currentUser?.uid || 'guest_student',
  };

  try {
    const current = getSavedAnnotations();
    const updated = [newAnnotation, ...current];
    localStorage.setItem(ANNOTATIONS_LOCAL_KEY, JSON.stringify(updated));
    notifyAnnotationUpdate();

    // Sync to Firestore if user is authenticated
    if (db && auth?.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid, 'annotations', newAnnotation.id);
      await setDoc(userDocRef, {
        ...newAnnotation,
        serverTime: serverTimestamp(),
      });
    }
  } catch (err) {
    console.warn('[Annotation Service] Cloud sync deferred (saved locally):', err);
  }

  return newAnnotation;
}

/**
 * Delete an annotation
 */
export async function deleteAnnotation(id: string): Promise<void> {
  try {
    const current = getSavedAnnotations();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(ANNOTATIONS_LOCAL_KEY, JSON.stringify(updated));
    notifyAnnotationUpdate();

    if (db && auth?.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid, 'annotations', id);
      await deleteDoc(userDocRef);
    }
  } catch (err) {
    console.warn('[Annotation Service] Delete cloud sync error:', err);
  }
}
