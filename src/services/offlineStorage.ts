/**
 * RK STUDY CENTRE - Offline Storage & Caching Strategy
 * 
 * Manages local storage caching and student pinning for study materials and notes so students
 * can read pinned notes, handwritten topper material, and practice tests
 * completely offline without an active internet connection.
 */

import type { StudyMaterialItem, ClassLevel } from '../types';

const MATERIALS_CACHE_PREFIX = 'rk_offline_mat_';
const INTERACTIVE_NOTE_PREFIX = 'rk_offline_note_';
const PINNED_ITEMS_PREFIX = 'rk_offline_pinned_';
const OFFLINE_INDEX_KEY = 'rk_offline_materials_index_v1';
const PINNED_INDEX_KEY = 'rk_offline_pinned_index_v1';

export const OFFLINE_STORAGE_UPDATED_EVENT = 'rk_offline_storage_updated';

export interface CachedChapterPayload {
  key: string;
  classLevel: ClassLevel;
  subjectId: string;
  bookId: string;
  chapterId: string;
  materials: StudyMaterialItem[];
  savedAt: string;
  totalItems: number;
}

export interface OfflineIndexItem {
  id: string;
  cacheKey: string;
  title: string;
  type: string;
  classLevel: string;
  subjectName?: string;
  chapterTitle?: string;
  fileSize?: string;
  savedAt: string;
  isInteractiveNote?: boolean;
  isPinned?: boolean;
}

function dispatchOfflineStorageUpdatedEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OFFLINE_STORAGE_UPDATED_EVENT));
  }
}

/**
 * Generate cache key for chapter materials
 */
export function getChapterCacheKey(
  classLevel: string,
  subjectId: string,
  bookId: string,
  chapterId: string
): string {
  return `${MATERIALS_CACHE_PREFIX}${classLevel}_${subjectId}_${bookId}_${chapterId}`;
}

/**
 * Save fetched chapter study materials into LocalStorage cache
 */
export function saveChapterMaterialsToCache(
  classLevel: ClassLevel,
  subjectId: string,
  bookId: string,
  chapterId: string,
  materials: StudyMaterialItem[]
): void {
  if (!materials || materials.length === 0) return;
  try {
    const key = getChapterCacheKey(classLevel, subjectId, bookId, chapterId);
    const payload: CachedChapterPayload = {
      key,
      classLevel,
      subjectId,
      bookId,
      chapterId,
      materials,
      savedAt: new Date().toISOString(),
      totalItems: materials.length,
    };

    localStorage.setItem(key, JSON.stringify(payload));

    // Update global offline index
    updateOfflineIndex(payload);
    dispatchOfflineStorageUpdatedEvent();
  } catch (error) {
    console.warn('[Offline Storage] Failed to cache chapter materials:', error);
  }
}

/**
 * Retrieve cached materials for a chapter when offline or network fails
 */
export function getCachedChapterMaterials(
  classLevel: ClassLevel,
  subjectId: string,
  bookId: string,
  chapterId: string
): StudyMaterialItem[] | null {
  try {
    const key = getChapterCacheKey(classLevel, subjectId, bookId, chapterId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: CachedChapterPayload = JSON.parse(raw);
    return parsed.materials || null;
  } catch (error) {
    console.warn('[Offline Storage] Failed to read cached chapter materials:', error);
    return null;
  }
}

/**
 * Update offline index to track all locally available study resources
 */
function updateOfflineIndex(payload: CachedChapterPayload) {
  try {
    const rawIndex = localStorage.getItem(OFFLINE_INDEX_KEY);
    const index: Record<string, OfflineIndexItem> = rawIndex ? JSON.parse(rawIndex) : {};

    for (const mat of payload.materials) {
      index[mat.id] = {
        id: mat.id,
        cacheKey: payload.key,
        title: mat.title,
        type: mat.type,
        classLevel: String(mat.classLevel || mat.classId || payload.classLevel),
        subjectName: mat.subjectName || payload.subjectId,
        chapterTitle: mat.chapterTitle || payload.chapterId,
        fileSize: mat.fileSize,
        savedAt: payload.savedAt,
        isInteractiveNote: !!mat.interactiveNoteId,
        isPinned: isMaterialPinnedOffline(mat.id),
      };
    }

    localStorage.setItem(OFFLINE_INDEX_KEY, JSON.stringify(index));
  } catch (e) {
    console.warn('[Offline Storage] Index update error:', e);
  }
}

/**
 * Get full list of all offline cached items
 */
export function getOfflineMaterialsList(): OfflineIndexItem[] {
  try {
    const rawIndex = localStorage.getItem(OFFLINE_INDEX_KEY);
    const index: Record<string, OfflineIndexItem> = rawIndex ? JSON.parse(rawIndex) : {};
    
    // Also include pinned items
    const rawPinned = localStorage.getItem(PINNED_INDEX_KEY);
    const pinnedMap: Record<string, OfflineIndexItem> = rawPinned ? JSON.parse(rawPinned) : {};
    
    const mergedMap = { ...index, ...pinnedMap };
    return Object.values(mergedMap).sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  } catch {
    return [];
  }
}

/**
 * Check if a specific material ID is saved in offline cache
 */
export function isMaterialCachedOffline(materialId: string): boolean {
  try {
    const rawIndex = localStorage.getItem(OFFLINE_INDEX_KEY);
    if (!rawIndex) return isMaterialPinnedOffline(materialId);
    const index: Record<string, OfflineIndexItem> = JSON.parse(rawIndex);
    return !!index[materialId] || isMaterialPinnedOffline(materialId);
  } catch {
    return isMaterialPinnedOffline(materialId);
  }
}

/**
 * =================================================================
 * 📌 EXPLICIT STUDENT PINNING / "SAVE FOR OFFLINE" TOGGLE SYSTEM
 * =================================================================
 */

export function isMaterialPinnedOffline(materialId: string): boolean {
  try {
    const raw = localStorage.getItem(PINNED_INDEX_KEY);
    if (!raw) return false;
    const pinned: Record<string, OfflineIndexItem> = JSON.parse(raw);
    return !!pinned[materialId];
  } catch {
    return false;
  }
}

export function isChapterPinnedOffline(chapterId: string): boolean {
  return isMaterialPinnedOffline(`chap_${chapterId}`);
}

export function togglePinMaterialOffline(
  material: StudyMaterialItem,
  metadata?: {
    classLevel?: string;
    subjectName?: string;
    chapterTitle?: string;
    exportData?: any;
  }
): boolean {
  try {
    const rawPinned = localStorage.getItem(PINNED_INDEX_KEY);
    const pinned: Record<string, OfflineIndexItem> = rawPinned ? JSON.parse(rawPinned) : {};
    const isCurrentlyPinned = !!pinned[material.id];

    if (isCurrentlyPinned) {
      // Unpin / Remove from local storage
      delete pinned[material.id];
      localStorage.removeItem(`${PINNED_ITEMS_PREFIX}${material.id}`);
      localStorage.setItem(PINNED_INDEX_KEY, JSON.stringify(pinned));
      dispatchOfflineStorageUpdatedEvent();
      return false;
    } else {
      // Pin / Save into local storage
      const itemKey = `${PINNED_ITEMS_PREFIX}${material.id}`;
      const now = new Date().toISOString();
      const payload = {
        material,
        metadata,
        pinnedAt: now,
      };
      localStorage.setItem(itemKey, JSON.stringify(payload));

      pinned[material.id] = {
        id: material.id,
        cacheKey: itemKey,
        title: material.title,
        type: material.type || 'notes',
        classLevel: String(metadata?.classLevel || material.classLevel || material.classId || 'Class 10'),
        subjectName: metadata?.subjectName || material.subjectName,
        chapterTitle: metadata?.chapterTitle || material.chapterTitle,
        fileSize: material.fileSize || 'Pinned Notes',
        savedAt: now,
        isInteractiveNote: !!material.interactiveNoteId,
        isPinned: true,
      };
      localStorage.setItem(PINNED_INDEX_KEY, JSON.stringify(pinned));
      dispatchOfflineStorageUpdatedEvent();
      return true;
    }
  } catch (err) {
    console.warn('[Offline Storage] Failed to toggle pin material:', err);
    return false;
  }
}

export function togglePinChapterOffline(payload: {
  chapterId: string;
  chapterTitle: string;
  chapterNumber?: number;
  classLevel: string;
  subjectId: string;
  subjectName?: string;
  compiledData?: any;
}): boolean {
  const pinId = `chap_${payload.chapterId}`;
  try {
    const rawPinned = localStorage.getItem(PINNED_INDEX_KEY);
    const pinned: Record<string, OfflineIndexItem> = rawPinned ? JSON.parse(rawPinned) : {};
    const isCurrentlyPinned = !!pinned[pinId];

    if (isCurrentlyPinned) {
      delete pinned[pinId];
      localStorage.removeItem(`${PINNED_ITEMS_PREFIX}${pinId}`);
      localStorage.setItem(PINNED_INDEX_KEY, JSON.stringify(pinned));
      dispatchOfflineStorageUpdatedEvent();
      return false;
    } else {
      const itemKey = `${PINNED_ITEMS_PREFIX}${pinId}`;
      const now = new Date().toISOString();
      localStorage.setItem(itemKey, JSON.stringify({
        ...payload,
        pinnedAt: now,
      }));

      pinned[pinId] = {
        id: pinId,
        cacheKey: itemKey,
        title: `अध्याय ${payload.chapterNumber || ''}: ${payload.chapterTitle} (संपूर्ण नोट्स)`,
        type: 'notes',
        classLevel: payload.classLevel || 'Class 10',
        subjectName: payload.subjectName || payload.subjectId,
        chapterTitle: payload.chapterTitle,
        fileSize: 'Full Chapter',
        savedAt: now,
        isInteractiveNote: true,
        isPinned: true,
      };
      localStorage.setItem(PINNED_INDEX_KEY, JSON.stringify(pinned));
      dispatchOfflineStorageUpdatedEvent();
      return true;
    }
  } catch (err) {
    console.warn('[Offline Storage] Failed to toggle pin chapter:', err);
    return false;
  }
}

export function getPinnedOfflineMaterials(): OfflineIndexItem[] {
  try {
    const rawPinned = localStorage.getItem(PINNED_INDEX_KEY);
    if (!rawPinned) return [];
    const pinned: Record<string, OfflineIndexItem> = JSON.parse(rawPinned);
    return Object.values(pinned).sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  } catch {
    return [];
  }
}

/**
 * Save full interactive note into offline storage
 */
export function cacheInteractiveNote(
  noteId: string,
  title: string,
  data: any
): void {
  try {
    const key = `${INTERACTIVE_NOTE_PREFIX}${noteId}`;
    localStorage.setItem(key, JSON.stringify({
      noteId,
      title,
      data,
      cachedAt: new Date().toISOString(),
    }));

    // Register in index
    const rawIndex = localStorage.getItem(OFFLINE_INDEX_KEY);
    const index: Record<string, OfflineIndexItem> = rawIndex ? JSON.parse(rawIndex) : {};
    index[`note_${noteId}`] = {
      id: `note_${noteId}`,
      cacheKey: key,
      title,
      type: 'notes',
      classLevel: 'Class 10',
      subjectName: 'Science / Social Science / Hindi',
      savedAt: new Date().toISOString(),
      isInteractiveNote: true,
      isPinned: isMaterialPinnedOffline(`note_${noteId}`),
    };
    localStorage.setItem(OFFLINE_INDEX_KEY, JSON.stringify(index));
  } catch (error) {
    console.warn('[Offline Storage] Failed to cache interactive note:', error);
  }
}

/**
 * Read cached interactive note
 */
export function getCachedInteractiveNote(noteId: string): any | null {
  try {
    const key = `${INTERACTIVE_NOTE_PREFIX}${noteId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.data || null;
  } catch {
    return null;
  }
}

/**
 * Clear all study material cache
 */
export function clearAllStudyMaterialsCache(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith(MATERIALS_CACHE_PREFIX) ||
          key.startsWith(INTERACTIVE_NOTE_PREFIX) ||
          key.startsWith(PINNED_ITEMS_PREFIX) ||
          key === OFFLINE_INDEX_KEY ||
          key === PINNED_INDEX_KEY)
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    dispatchOfflineStorageUpdatedEvent();
  } catch (error) {
    console.error('[Offline Storage] Clear cache error:', error);
  }
}

/**
 * Get approximate cache storage size in KB/MB
 */
export function getCacheStorageStats(): {
  totalItems: number;
  totalSizeKB: number;
  lastUpdated: string | null;
} {
  let totalChars = 0;
  let totalItems = 0;
  let latestTimestamp: string | null = null;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith(MATERIALS_CACHE_PREFIX) ||
          key.startsWith(INTERACTIVE_NOTE_PREFIX) ||
          key.startsWith(PINNED_ITEMS_PREFIX))
      ) {
        totalItems++;
        const val = localStorage.getItem(key) || '';
        totalChars += key.length + val.length;
      }
    }

    const items = getOfflineMaterialsList();
    if (items.length > 0) {
      latestTimestamp = items[0].savedAt;
    }
  } catch (e) {
    console.warn('[Offline Storage] Stats computation error:', e);
  }

  // 1 char ≈ 2 bytes in UTF-16
  const totalSizeBytes = totalChars * 2;
  const totalSizeKB = Math.round(totalSizeBytes / 1024);

  return {
    totalItems,
    totalSizeKB,
    lastUpdated: latestTimestamp,
  };
}
