import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  BookOpen,
  FileText,
  Award,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Clock,
  ChevronRight,
  CheckCircle2,
  Filter,
  CornerDownLeft,
  ExternalLink,
} from 'lucide-react';
import { CHAPTERS, STUDY_MATERIALS, TESTS, COURSES, SUBJECTS, CLASSES_METADATA } from '../lib/constants';
import type { ClassLevel, MainNavRoute } from '../types';

interface HeaderSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (
    route: MainNavRoute,
    params?: {
      classLevel?: ClassLevel;
      subjectSlug?: string;
      bookSlug?: string;
      chapterSlug?: string;
    }
  ) => void;
}

type SearchCategory = 'all' | 'chapters' | 'notes' | 'tests' | 'courses';

interface SearchResultItem {
  id: string;
  category: 'chapter' | 'note' | 'test' | 'course';
  title: string;
  hindiTitle?: string;
  subtitle: string;
  description?: string;
  classLevel: ClassLevel;
  classNameFormatted: string;
  subjectName: string;
  badgeLabel: string;
  badgeColor: string;
  actionText: string;
  route: MainNavRoute;
  params: {
    classLevel?: ClassLevel;
    subjectSlug?: string;
    bookSlug?: string;
    chapterSlug?: string;
  };
  hashUrl?: string;
}

const POPULAR_SEARCH_TAGS = [
  'व्यापार और भूमंडलीकरण',
  'शहरीकरण एवं शहरी जीवन',
  'यूरोप में राष्ट्रवाद',
  'प्रकाश का परावर्तन',
  'जैव प्रक्रम',
  'द्विघात समीकरण',
  'श्रम विभाजन और जाति प्रथा',
  'बिहार: कृषि व संसाधन',
];

const LOCAL_STORAGE_RECENT_KEY = 'rk_recent_searches_v1';

export const HeaderSearchModal: React.FC<HeaderSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<ClassLevel | 'all'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_RECENT_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 6));
      }
    } catch {
      // Ignore fallback
    }
  }, []);

  // Save new search query to recent searches
  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed || trimmed.length < 2) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem(LOCAL_STORAGE_RECENT_KEY, JSON.stringify(updated));
    } catch {
      // Ignore fallback
    }
  };

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle ESC key and Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Format Class Names cleanly
  const getClassLabel = (cls: ClassLevel): string => {
    switch (cls) {
      case 'class-9':
        return 'कक्षा 9वीं';
      case 'class-10':
        return 'कक्षा 10वीं (मैट्रिक)';
      case 'class-11':
        return 'कक्षा 11वीं';
      case 'class-12':
        return 'कक्षा 12वीं (इंटर)';
      default:
        return 'कक्षा';
    }
  };

  // Helper for finding subject title
  const getSubjectName = (subjectId: string): string => {
    const found = SUBJECTS.find((s) => s.id === subjectId || s.slug === subjectId);
    if (found) return found.hindiName || found.name;
    if (subjectId.includes('his')) return 'इतिहास (History)';
    if (subjectId.includes('geo')) return 'भूगोल (Geography)';
    if (subjectId.includes('phy')) return 'भौतिकी (Physics)';
    if (subjectId.includes('che')) return 'रसायन शास्त्र (Chemistry)';
    if (subjectId.includes('bio')) return 'जीव विज्ञान (Biology)';
    if (subjectId.includes('mat')) return 'गणित (Mathematics)';
    if (subjectId.includes('hin')) return 'हिंदी (Hindi)';
    return 'सामान्य विषय';
  };

  // Construct Search Database
  const searchDatabase = useMemo<SearchResultItem[]>(() => {
    const items: SearchResultItem[] = [];

    // 1. Chapters
    CHAPTERS.forEach((ch) => {
      const subjName = getSubjectName(ch.subjectId);
      items.push({
        id: `ch-${ch.id}`,
        category: 'chapter',
        title: ch.hindiTitle ? `${ch.hindiTitle} (${ch.title})` : ch.title,
        hindiTitle: ch.hindiTitle,
        subtitle: `${getClassLabel(ch.classLevel)} • ${subjName} • अध्याय ${ch.chapterNumber}`,
        description: ch.summary || `कक्षा ${ch.chapterNumber} अध्याय पाठ्यक्रम नोट्स एवं ऑनलाइन टेस्ट।`,
        classLevel: ch.classLevel,
        classNameFormatted: getClassLabel(ch.classLevel),
        subjectName: subjName,
        badgeLabel: 'अध्याय (Chapter)',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700/50',
        actionText: 'अध्याय देखें',
        route: 'study-material',
        params: {
          classLevel: ch.classLevel,
          subjectSlug: ch.subjectId,
          bookSlug: ch.bookId,
          chapterSlug: ch.slug || `chapter-${ch.chapterNumber}`,
        },
        hashUrl: `#study-material/${ch.classLevel}/${ch.subjectId}/${ch.bookId}/${ch.slug || `chapter-${ch.chapterNumber}`}`,
      });
    });

    // 2. Study Materials (Notes)
    STUDY_MATERIALS.forEach((sm) => {
      const subjName = sm.subjectName || getSubjectName(sm.subjectId);
      items.push({
        id: `sm-${sm.id}`,
        category: 'note',
        title: sm.title,
        hindiTitle: sm.chapterTitle,
        subtitle: `${getClassLabel(sm.classLevel)} • ${subjName} • हस्तलिखित डिजिटल नोट्स`,
        description: sm.description || 'बिहार बोर्ड मैट्रिक व इंटर परीक्षा हेतु संपूर्ण टॉपर नोट्स पीडीएफ।',
        classLevel: sm.classLevel,
        classNameFormatted: getClassLabel(sm.classLevel),
        subjectName: subjName,
        badgeLabel: sm.fileFormat === 'PDF' ? 'PDF नोट्स' : 'हस्तलिखित नोट्स',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700/50',
        actionText: 'नोट्स पढ़ें',
        route: 'study-material',
        params: {
          classLevel: sm.classLevel,
          subjectSlug: sm.subjectId,
          bookSlug: sm.bookId,
          chapterSlug: sm.chapterId,
        },
        hashUrl: sm.fileUrl || `#study-material/${sm.classLevel}/${sm.subjectId}/${sm.bookId || ''}/${sm.chapterId || ''}`,
      });
    });

    // 3. Tests
    TESTS.forEach((test) => {
      const subjName = getSubjectName(test.subjectId);
      items.push({
        id: `test-${test.id}`,
        category: 'test',
        title: test.title,
        subtitle: `${getClassLabel(test.classLevel)} • ${subjName} • ${test.totalQuestions || 15} प्रश्न • ${test.durationMinutes || 15} मिनट`,
        description: test.description || 'बिहार बोर्ड आधारित लाइव ऑब्जेक्टिव एमसीक्यू टेस्ट व तुरंत परिणाम विश्लेषण।',
        classLevel: test.classLevel,
        classNameFormatted: getClassLabel(test.classLevel),
        subjectName: subjName,
        badgeLabel: 'ऑनलाइन टेस्ट',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700/50',
        actionText: 'टेस्ट शुरू करें',
        route: 'tests',
        params: {
          classLevel: test.classLevel,
          subjectSlug: test.subjectId,
          bookSlug: test.bookId,
          chapterSlug: test.chapterId,
        },
        hashUrl: `#tests/${test.classLevel}/${test.subjectId}/${test.bookId || ''}/${test.chapterId || ''}`,
      });
    });

    // 4. Courses
    COURSES.forEach((course) => {
      items.push({
        id: `course-${course.id}`,
        category: 'course',
        title: course.title,
        subtitle: `${getClassLabel(course.classLevel)} • स्पेशल टॉपर बैच`,
        description: course.description,
        classLevel: course.classLevel,
        classNameFormatted: getClassLabel(course.classLevel),
        subjectName: 'सभी प्रमुख विषय',
        badgeLabel: 'कोर्स / Topper Batch',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700/50',
        actionText: 'कोर्स विवरण',
        route: 'courses',
        params: {
          classLevel: course.classLevel,
        },
        hashUrl: '#courses',
      });
    });

    return items;
  }, []);

  // Filtered Results based on Query, Category, and Class Level
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    // Term splits
    const queryTerms = q.split(/\s+/).filter(Boolean);

    return searchDatabase.filter((item) => {
      // Category filter
      if (selectedCategory === 'chapters' && item.category !== 'chapter') return false;
      if (selectedCategory === 'notes' && item.category !== 'note') return false;
      if (selectedCategory === 'tests' && item.category !== 'test') return false;
      if (selectedCategory === 'courses' && item.category !== 'course') return false;

      // Class filter
      if (selectedClassFilter !== 'all' && item.classLevel !== selectedClassFilter) return false;

      // Match query terms
      const textToSearch = `${item.title} ${item.hindiTitle || ''} ${item.subtitle} ${item.description || ''} ${item.subjectName} ${item.classNameFormatted}`.toLowerCase();

      // Ensure every token matches
      return queryTerms.every((term) => textToSearch.includes(term));
    });
  }, [query, selectedCategory, selectedClassFilter, searchDatabase]);

  // Handle Result Select Action
  const handleSelectResult = (item: SearchResultItem) => {
    saveRecentSearch(query || item.title);
    onClose();

    if (item.hashUrl) {
      window.location.hash = item.hashUrl.replace(/^#/, '');
    }

    onNavigate(item.route, item.params);
  };

  // Key navigation logic
  const handleKeyDownInResults = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelectResult(searchResults[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-4 sm:pt-16 px-3 sm:px-4 bg-slate-950/75 backdrop-blur-md transition-all animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] transition-all"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownInResults}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/80 dark:bg-slate-900/90">
          <Search className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 stroke-[2.5]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="खोजें: कक्षा, विषय, अध्याय, हस्तलिखित नोट्स, या ऑनलाइन टेस्ट..."
            className="w-full bg-transparent text-slate-900 dark:text-white text-base sm:text-xl font-bold placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              title="साफ़ करें"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-xs font-black bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0 hidden sm:inline-block"
          >
            ESC बंद करें
          </button>
        </div>

        {/* Filters Bar */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center gap-2 text-xs font-semibold">
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mr-1 shrink-0 font-bold">
            <Filter className="w-3.5 h-3.5" />
            <span>श्रेणी:</span>
          </div>

          {/* Category Tabs */}
          {(
            [
              { id: 'all', label: 'सभी' },
              { id: 'chapters', label: 'अध्याय (Chapters)' },
              { id: 'notes', label: 'नोट्स (Notes)' },
              { id: 'tests', label: 'ऑनलाइन टेस्ट' },
              { id: 'courses', label: 'कोर्सेज' },
            ] as { id: SearchCategory; label: string }[]
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}

          {/* Class Filter Dropdown/Pills */}
          <div className="ml-auto flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            <span className="text-slate-400 dark:text-slate-500 text-[11px] font-bold">कक्षा:</span>
            {(
              [
                { id: 'all', label: 'सभी' },
                { id: 'class-9', label: '9वीं' },
                { id: 'class-10', label: '10वीं' },
                { id: 'class-11', label: '11वीं' },
                { id: 'class-12', label: '12वीं' },
              ] as { id: ClassLevel | 'all'; label: string }[]
            ).map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassFilter(cls.id)}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                  selectedClassFilter === cls.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cls.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content & Search Results */}
        <div ref={resultsContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
          {!query.trim() ? (
            /* Empty Query State: Popular Suggestions & Recent Searches */
            <div className="py-4 space-y-6">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      हाल ही में खोजे गए विषय
                    </span>
                    <button
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem(LOCAL_STORAGE_RECENT_KEY);
                      }}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer lowercase font-normal"
                    >
                      हिस्ट्री साफ़ करें
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(term)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                      >
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  विद्यार्थियों द्वारा सर्वाधिक खोजे गए ट्रेंडिंग टॉपिक्स
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCH_TAGS.map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(tag)}
                      className="px-3.5 py-2 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200/80 dark:border-blue-800/50 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Search className="w-3 h-3 text-blue-500" />
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  💡 <strong>टिप:</strong> कक्षा 9वीं से 12वीं के किसी भी अध्याय, विषय या टेस्ट का नाम लिखकर तुरंत खोजें।
                </p>
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            /* No Results Found State */
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                "{query}" के लिए कोई परिणाम नहीं मिला
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                कृपया दूसरे शब्दों से खोजें (जैसे: इतिहास, नोट्स, टेस्ट, कक्षा 10, प्रकाश, रासायनिक अभिक्रियाएं)।
              </p>
            </div>
          ) : (
            /* Search Results List */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 px-1 pb-1">
                <span>कुल {searchResults.length} परिणाम मिले</span>
                <span className="hidden sm:inline">नैविगेट करने के लिए ↑↓ और Enter दबाएं</span>
              </div>

              {searchResults.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/90 dark:bg-slate-800 border-blue-500 dark:border-blue-500 shadow-md ring-1 ring-blue-500/30'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border ${item.badgeColor}`}
                        >
                          {item.badgeLabel}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {item.subtitle}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
                        {item.title}
                      </h4>

                      {item.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectResult(item);
                        }}
                        className={`w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                          isSelected
                            ? 'bg-blue-700 text-white hover:bg-blue-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-blue-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{item.actionText}</span>
                        <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-3 px-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">RK STUDY CENTRE</span>
            <span>• बिहार बोर्ड 9वीं, 10वीं, 11वीं, 12वीं डिजिटल स्टडी हब</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px]">
            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">Ctrl + K</span>
            <span>दबाकर कभी भी खोजें</span>
          </div>
        </div>
      </div>
    </div>
  );
};
