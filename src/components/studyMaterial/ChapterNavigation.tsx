import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileCheck2,
  FileText,
  Search,
  CheckCircle2,
  ListFilter,
} from 'lucide-react';
import type { Chapter, Subject, Book } from '../../types';

export interface OpenFileInfo {
  title?: string;
  fileName?: string;
  fileUrl?: string;
  chapterId?: string;
  chapterNumber?: number;
  subjectId?: string;
  subjectName?: string;
  bookId?: string;
  bookTitle?: string;
  [key: string]: any;
}

export interface ChapterNavigationProps {
  /** List of chapters to navigate through */
  chapters: Chapter[] | any[];
  /** Currently selected or active chapter slug/id/number */
  activeChapterSlug?: string;
  activeChapterId?: string;
  activeChapterNumber?: number;
  /** Currently opened file/document (used to automatically highlight active chapter) */
  openFile?: OpenFileInfo | null;
  /** Current Subject */
  subject?: Subject | { id?: string; name?: string; hindiName?: string; code?: string; slug?: string };
  /** Explicit subject short name override (e.g. 'भौतिकी', 'रसायन', 'गणित') */
  subjectShortName?: string;
  /** Current Book if applicable */
  book?: Book | { id?: string; title?: string; hindiTitle?: string; slug?: string };
  /** Callback when user selects a chapter */
  onSelectChapter: (chapter: any, bookSlug?: string) => void;
  /** Callback if user wants to directly open the primary file for this chapter */
  onOpenFileForChapter?: (chapter: any) => void;
  /** Layout variant */
  variant?: 'horizontal' | 'grid' | 'compact';
  /** Extra CSS classes */
  className?: string;
  /** Show the open file status banner */
  showOpenFileBanner?: boolean;
}

/**
 * Derives a clean, consistent Subject Short Name
 * Examples: 'भौतिकी', 'रसायन', 'जीव विज्ञान', 'गणित', 'इतिहास', 'भूगोल', 'हिंदी', 'संस्कृत', 'अंग्रेजी'
 */
export function resolveSubjectShortName(
  subject?: { id?: string; name?: string; hindiName?: string; code?: string },
  book?: { id?: string; title?: string; hindiTitle?: string },
  chapter?: { id?: string; bookId?: string; title?: string }
): string {
  // Check book title/ID first (essential for combined subjects like Science & Social Science)
  const bookText = `${book?.id || ''} ${book?.title || ''} ${book?.hindiTitle || ''} ${chapter?.id || ''} ${chapter?.bookId || ''}`.toLowerCase();
  
  if (bookText.includes('phy') || bookText.includes('भौतिकी')) return 'भौतिकी';
  if (bookText.includes('chem') || bookText.includes('रसायन')) return 'रसायन';
  if (bookText.includes('bio') || bookText.includes('जीव')) return 'जीव विज्ञान';
  if (bookText.includes('his') || bookText.includes('इतिहास')) return 'इतिहास';
  if (bookText.includes('geo') || bookText.includes('भूगोल')) return 'भूगोल';
  if (bookText.includes('civ') || bookText.includes('राजनीति') || bookText.includes('नागरिक')) return 'राजनीति';
  if (bookText.includes('eco') || bookText.includes('अर्थशास्त्र')) return 'अर्थशास्त्र';
  if (bookText.includes('godhuli') || bookText.includes('varnika') || bookText.includes('गोधूलि')) return 'हिंदी';
  if (bookText.includes('sanskrit') || bookText.includes('संस्कृत') || bookText.includes('piyusham')) return 'संस्कृत';

  // Check subject fields
  const subText = `${subject?.id || ''} ${subject?.name || ''} ${subject?.hindiName || ''} ${subject?.code || ''}`.toLowerCase();
  if (subText.includes('phy') || subText.includes('भौतिक')) return 'भौतिकी';
  if (subText.includes('chem') || subText.includes('रसायन')) return 'रसायन';
  if (subText.includes('bio') || subText.includes('जीव')) return 'जीव विज्ञान';
  if (subText.includes('math') || subText.includes('गणित')) return 'गणित';
  if (subText.includes('his') || subText.includes('इतिहास')) return 'इतिहास';
  if (subText.includes('geo') || subText.includes('भूगोल')) return 'भूगोल';
  if (subText.includes('civ') || subText.includes('नागरिक') || subText.includes('राजनीति')) return 'राजनीति';
  if (subText.includes('eco') || subText.includes('अर्थशास्त्र')) return 'अर्थशास्त्र';
  if (subText.includes('hin') || subText.includes('हिंदी') || subText.includes('हिन्दी')) return 'हिंदी';
  if (subText.includes('san') || subText.includes('संस्कृत')) return 'संस्कृत';
  if (subText.includes('eng') || subText.includes('अंग्रेजी') || subText.includes('english')) return 'अंग्रेजी';
  if (subText.includes('urdu') || subText.includes('उर्दू')) return 'उर्दू';

  if (subject?.hindiName) {
    return subject.hindiName.split(' ')[0].replace(/[()]/g, '');
  }
  if (subject?.name) {
    return subject.name.split(' ')[0];
  }
  return 'विषय';
}

/**
 * Formats the chapter navigation label strictly in the format:
 * 'Subject Short Name - Chapter Number - Title'
 */
export function formatChapterNavigationLabel(
  subjectShortName: string,
  chapterNumber: number | string,
  title: string
): string {
  const formattedNumber = typeof chapterNumber === 'number'
    ? (chapterNumber < 10 ? `0${chapterNumber}` : `${chapterNumber}`)
    : chapterNumber;

  const cleanTitle = (title || '')
    .replace(/^अध्याय\s*\d+[\s:–—-]*/i, '')
    .replace(/^Chapter\s*\d+[\s:–—-]*/i, '')
    .replace(/^Ch\s*\d+[\s:–—-]*/i, '')
    .trim();

  return `${subjectShortName} - ${formattedNumber} - ${cleanTitle}`;
}

/**
 * Automatically identifies and resolves the active chapter matching the open file
 */
export function resolveActiveChapterFromFile(
  openFile: OpenFileInfo | null | undefined,
  chapters: any[],
  fallbackChapterSlug?: string,
  fallbackChapterId?: string,
  fallbackChapterNumber?: number
): any | undefined {
  if (!chapters || chapters.length === 0) return undefined;

  // If openFile is provided, attempt multi-layered fuzzy & exact matching
  if (openFile) {
    // 1. Direct match by chapterId
    if (openFile.chapterId) {
      const match = chapters.find((c) => c.id === openFile.chapterId);
      if (match) return match;
    }

    // 2. Direct match by chapterNumber
    if (typeof openFile.chapterNumber === 'number') {
      const match = chapters.find((c) => c.chapterNumber === openFile.chapterNumber);
      if (match) return match;
    }

    // 3. Match from file title, fileName, or content text
    const text = `${openFile.title || ''} ${openFile.fileName || ''} ${openFile.fileUrl || ''} ${openFile.description || ''} ${openFile.name || ''}`.toLowerCase();

    // Regex extract chapter numbers: e.g. "ch 01", "chapter 1", "अध्याय 2", "ch-02", "ch03", "ch-c10-sci-phy-01"
    const numMatch = text.match(/(?:अध्याय|chapter|ch\.?)[_\s:-]*0?(\d+)/i) ||
                     text.match(/[-_]ch0?(\d+)/i) ||
                     text.match(/-(?:0)?(\d+)(?:\.pdf|$)/i);

    if (numMatch && numMatch[1]) {
      const parsedNum = parseInt(numMatch[1], 10);
      const match = chapters.find((c) => c.chapterNumber === parsedNum);
      if (match) return match;
    }

    // 4. Keyword matching against chapter titles
    for (const chapter of chapters) {
      const chapTitle = (chapter.hindiTitle || chapter.title || '').toLowerCase().trim();
      const cleanTitle = chapTitle.replace(/^अध्याय\s*\d+[\s:–—-]*/i, '').trim();
      if (cleanTitle.length > 3 && text.includes(cleanTitle)) {
        return chapter;
      }
      // Check significant keywords
      const words = cleanTitle.split(/[\s,–—:-]+/).filter((w) => w.length >= 4);
      if (words.length > 0 && words.some((w) => text.includes(w))) {
        return chapter;
      }
    }
  }

  // Fallbacks based on props
  if (fallbackChapterId) {
    const match = chapters.find((c) => c.id === fallbackChapterId);
    if (match) return match;
  }
  if (fallbackChapterSlug) {
    const match = chapters.find((c) => c.slug === fallbackChapterSlug);
    if (match) return match;
  }
  if (typeof fallbackChapterNumber === 'number') {
    const match = chapters.find((c) => c.chapterNumber === fallbackChapterNumber);
    if (match) return match;
  }

  return chapters[0];
}

export function ChapterNavigation({
  chapters,
  activeChapterSlug,
  activeChapterId,
  activeChapterNumber,
  openFile,
  subject,
  subjectShortName: propSubjectShortName,
  book,
  onSelectChapter,
  onOpenFileForChapter,
  variant = 'horizontal',
  className = '',
  showOpenFileBanner = true,
}: ChapterNavigationProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Automatically determine the active chapter based on the open file (or active props)
  const activeChapter = useMemo(() => {
    return resolveActiveChapterFromFile(
      openFile,
      chapters,
      activeChapterSlug,
      activeChapterId,
      activeChapterNumber
    );
  }, [openFile, chapters, activeChapterSlug, activeChapterId, activeChapterNumber]);

  // Derive the subject short name
  const effectiveSubjectShortName = useMemo(() => {
    if (propSubjectShortName) return propSubjectShortName;
    return resolveSubjectShortName(subject, book, activeChapter);
  }, [propSubjectShortName, subject, book, activeChapter]);

  // Auto-scroll the active highlighted chapter into view
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeChapter?.id, activeChapter?.chapterNumber]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Filtered chapters if search is used
  const filteredChapters = useMemo(() => {
    const list = Array.isArray(chapters) ? chapters : [];
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase().trim();
    return list.filter((ch) => {
      const title = (ch.hindiTitle || ch.title || '').toLowerCase();
      const num = String(ch.chapterNumber);
      return title.includes(query) || num.includes(query);
    });
  }, [chapters, searchQuery]);

  if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
    return null;
  }

  // Compute active chapter's formatted label for display
  const activeChapterLabel = activeChapter
    ? formatChapterNavigationLabel(
        effectiveSubjectShortName,
        activeChapter.chapterNumber,
        activeChapter.hindiTitle || activeChapter.title
      )
    : '';

  return (
    <div className={`space-y-3 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-4 sm:p-5 border-2 border-blue-500/40 shadow-xl text-white ${className}`}>
      {/* Top Bar: Subject Badge + Open File Active Status + Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-blue-600/90 text-white px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm shadow-md border border-blue-400/40">
            <BookOpen className="w-4 h-4 text-amber-300 stroke-[2.5]" />
            <span>{effectiveSubjectShortName} अध्याय नेविगेशन</span>
          </div>
          <span className="text-xs font-bold text-slate-300 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
            कुल {chapters.length} अध्याय
          </span>
        </div>

        {/* Action Controls: Search & Left/Right Scroll Arrows */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {showSearch ? (
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="अध्याय खोजें..."
                className="bg-white/15 border border-white/30 rounded-xl px-3 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 w-36 sm:w-48 font-bold"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                }}
                className="ml-1 text-xs text-slate-400 hover:text-white px-1 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowSearch(true)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="अध्याय खोजें"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {variant === 'horizontal' && (
            <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1 border border-white/10">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="पिछला अध्याय (Scroll Left)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="अगला अध्याय (Scroll Right)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Open File Banner: Explicitly displays 'Subject Short Name - Chapter Number - Title' */}
      {showOpenFileBanner && openFile && activeChapter && (
        <div className="bg-amber-500/15 border border-amber-400/40 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                खुली फ़ाइल के आधार पर स्वचालित रूप से सक्रिय अध्याय (Active Chapter):
              </div>
              <div className="font-extrabold text-white text-xs sm:text-sm truncate">
                📄 {activeChapterLabel}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-black text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>सक्रिय हाइलाइटेड</span>
            </span>
            {openFile.fileName && (
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px] hidden md:inline">
                {openFile.fileName}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Chapter Navigation Items */}
      {variant === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
          {filteredChapters.map((ch) => {
            const isActive = activeChapter && (ch.id === activeChapter.id || ch.chapterNumber === activeChapter.chapterNumber);
            const label = formatChapterNavigationLabel(
              effectiveSubjectShortName,
              ch.chapterNumber,
              ch.hindiTitle || ch.title
            );

            return (
              <button
                key={ch.id}
                ref={isActive ? activeItemRef : undefined}
                type="button"
                onClick={() => onSelectChapter(ch, ch.bookSlug)}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-2 shadow-sm ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white border-amber-400 ring-2 ring-amber-400/60 shadow-lg scale-[1.01]'
                    : 'bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border-white/15 hover:border-blue-400/50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wide">
                    अध्याय {ch.chapterNumber}
                  </div>
                  <div className="text-xs sm:text-sm font-black truncate text-white">
                    {label}
                  </div>
                </div>
                {isActive && (
                  <span className="shrink-0 p-1.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        /* Horizontal Scrolling Chapter Pill Bar */
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-transparent scroll-smooth focus:outline-none"
          tabIndex={0}
          role="region"
          aria-label="Chapter Navigation"
        >
          {filteredChapters.map((ch) => {
            const isActive = activeChapter && (ch.id === activeChapter.id || ch.chapterNumber === activeChapter.chapterNumber);
            const label = formatChapterNavigationLabel(
              effectiveSubjectShortName,
              ch.chapterNumber,
              ch.hindiTitle || ch.title
            );

            return (
              <button
                key={ch.id}
                ref={isActive ? activeItemRef : undefined}
                type="button"
                onClick={() => onSelectChapter(ch, ch.bookSlug)}
                className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shrink-0 border select-none group ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 border-amber-300 shadow-lg ring-2 ring-amber-300 font-black scale-[1.02]'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border-white/15 hover:border-amber-400/50'
                }`}
                title={`अध्याय चुनें: ${label}`}
              >
                {isActive ? (
                  <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse" />
                ) : (
                  <span className="text-[10px] font-mono opacity-60">
                    {ch.chapterNumber < 10 ? `0${ch.chapterNumber}` : ch.chapterNumber}
                  </span>
                )}

                {/* The required display: 'Subject Short Name - Chapter Number - Title' */}
                <span className="tracking-tight">{label}</span>

                {isActive && (
                  <span className="ml-1 text-[10px] font-black bg-slate-950 text-amber-300 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    सक्रिय
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
