import type React from 'react';
import type { MainNavRoute, ClassLevel, MoreSectionTab, OwnerSectionTab } from '../types';

export function safeScrollToTop(behavior: ScrollBehavior = 'smooth') {
  try {
    window.scrollTo({ top: 0, left: 0, behavior });
  } catch {
    window.scrollTo(0, 0);
  }
}

/**
 * Returns clean standalone path for institutional/policy/public routes
 */
export function getStandaloneAppUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window === 'undefined') {
    return cleanPath;
  }
  return `${window.location.origin}${cleanPath}`;
}

/**
 * Handles policy/institutional link clicks without triggering blocked window.open popups in iframe
 */
export function openPolicyInNewTab(
  e: React.MouseEvent<HTMLAnchorElement>,
  path: string,
  fallbackNavigate?: () => void
) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
    return;
  }
  e.preventDefault();
  if (fallbackNavigate) {
    fallbackNavigate();
  } else if (typeof window !== 'undefined') {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    window.history.pushState({}, '', cleanPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

/**
 * Builds a clean, crawlable pathname for any MainNavRoute + parameters
 */
export function buildCleanPathForRoute(
  route: MainNavRoute,
  params?: {
    classLevel?: ClassLevel;
    subjectSlug?: string;
    bookSlug?: string;
    chapterSlug?: string;
    testId?: string;
    moreTab?: MoreSectionTab;
    ownerTab?: OwnerSectionTab;
  }
): string {
  if (route === 'home') {
    return '/';
  }
  if (route === 'classes' || route === 'study-material' || route === 'tests') {
    let p = `/${route}`;
    if (params?.classLevel) {
      p += `/${params.classLevel}`;
      if (params.subjectSlug) {
        p += `/${params.subjectSlug}`;
        if (params.bookSlug) {
          p += `/${params.bookSlug}`;
          if (params.chapterSlug) {
            p += `/${params.chapterSlug}`;
          }
        } else if (params.chapterSlug) {
          p += `/${params.chapterSlug}`;
        }
      }
    }
    return p;
  }
  if (route === 'more' && params?.moreTab) {
    if (params.moreTab === 'about') return '/about-us';
    if (params.moreTab === 'faq') return '/faq';
    if (params.moreTab === 'contact') return '/contact-support';
    return `/more/${params.moreTab}`;
  }
  if (route === 'owner' && params?.ownerTab) {
    return `/owner/${params.ownerTab}`;
  }
  return `/${route}`;
}
