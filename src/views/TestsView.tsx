
import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  ChevronRight,
  ArrowLeft,
  FolderOpen,
  Loader2,
  AlertCircle,
  FileText,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ListOrdered,
  ArrowRight
} from 'lucide-react';
import type {
  ClassLevel,
  MainNavRoute,
  MoreSectionTab,
  TestItem,
  TestQuestion,
} from '../types';
import {
  CLASSES_METADATA,
  SUBJECTS,
  BOOKS,
  CHAPTERS,
  TESTS,
  TEST_QUESTIONS
} from '../lib/constants';
import { BackButton } from '../components/BackButton';
import { getTestsForChapter, getTestById, getStaticTestsForChapter, getStaticTestById } from '../services/testService';
import { recordTestResult } from '../services/progressService';
import { useAuth } from '../context/AuthContext';
import { MathCh02QuestionBank500Viewer } from '../components/notes/MathCh02QuestionBank500Viewer';

interface TestsViewProps {
  initialClass?: ClassLevel;
  initialSubjectSlug?: string;
  initialBookSlug?: string;
  initialChapterSlug?: string;
  urlParts?: string[];
  onNavigate: (route: MainNavRoute, params?: { classLevel?: ClassLevel; subjectSlug?: string; bookSlug?: string; chapterSlug?: string; testId?: string; moreTab?: MoreSectionTab }) => void;
  onOpenHistoryMarathon?: () => void;
  onOpenPhysicsMarathon?: () => void;
  onOpenPhysicsCh02Marathon?: () => void;
  onOpenPhysics12Ch01Marathon?: () => void;
}

export function TestsView({
  initialClass,
  initialSubjectSlug,
  initialBookSlug,
  initialChapterSlug,
  urlParts = [],
  onNavigate,
  onOpenHistoryMarathon,
  onOpenPhysicsMarathon,
  onOpenPhysicsCh02Marathon,
  onOpenPhysics12Ch01Marathon,
}: TestsViewProps) {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<ClassLevel | undefined>(initialClass);
  const [showMathCh02Bank500Modal, setShowMathCh02Bank500Modal] = useState<{ open: boolean; mode: 'read' | 'solve' | 'test' | 'answer-key' }>({ open: false, mode: 'test' });
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState<string | undefined>(initialSubjectSlug);
  const [selectedBookSlug, setSelectedBookSlug] = useState<string | undefined>(initialBookSlug);
  const [selectedChapterSlug, setSelectedChapterSlug] = useState<string | undefined>(initialChapterSlug);
  const [selectedStream, setSelectedStream] = useState<'all' | 'Science' | 'Arts' | 'Commerce' | undefined>(undefined);
  
  // Custom routing states inside TestsView
  const [activeTestId, setActiveTestId] = useState<string | undefined>(undefined);
  const [testPhase, setTestPhase] = useState<'instructions' | 'playing' | 'result'>('playing');
  const [activeResultId, setActiveResultId] = useState<string | undefined>(undefined);

  const urlPartsKey = (urlParts || []).join('/');

  // Sync state if props change from URL or hash changes
  useEffect(() => {
    setSelectedClass(initialClass);
    setSelectedSubjectSlug(initialSubjectSlug);
    setSelectedBookSlug(initialBookSlug);
    setSelectedChapterSlug(initialChapterSlug);

    const syncFromHashOrParts = (partsToParse: string[]) => {
      const testMarkerIdx = partsToParse.indexOf('test');
      if (testMarkerIdx !== -1 && partsToParse[testMarkerIdx + 1]) {
        const tid = partsToParse[testMarkerIdx + 1];
        setActiveResultId(undefined);
        setActiveTestId(tid);
        if (!partsToParse.includes('instructions')) {
          setTestPhase('playing');
        }
        const fastStatic = getStaticTestById(tid);
        if (fastStatic) {
          setActiveTest(fastStatic);
        }
      } else if (partsToParse.length >= 3 && partsToParse[1] === 'result') {
        setActiveResultId(partsToParse[2]);
        setActiveTestId(undefined);
        setTestPhase('result');
      } else {
        setActiveTestId(undefined);
        setActiveResultId(undefined);
      }
    };

    const currentParts =
      urlParts && urlParts.length > 0
        ? urlParts
        : window.location.hash
        ? window.location.hash.substring(1).split('/')
        : [];
    syncFromHashOrParts(currentParts);
  }, [initialClass, initialSubjectSlug, initialBookSlug, initialChapterSlug, urlPartsKey]);

  // Direct hashchange listener inside TestsView so sub-routes (/test/:id and /result/:id) always trigger instant state updates
  useEffect(() => {
    const handleInternalHashChange = () => {
      const rawHash = window.location.hash ? window.location.hash.substring(1) : '';
      if (!rawHash.startsWith('tests')) return;
      const parts = rawHash.split('/');
      const testIdx = parts.indexOf('test');
      if (testIdx !== -1 && parts[testIdx + 1]) {
        const tid = parts[testIdx + 1];
        setActiveResultId(undefined);
        setActiveTestId(tid);
        const fastStatic = getStaticTestById(tid);
        if (fastStatic) {
          setActiveTest(fastStatic);
        }
      } else if (parts.length >= 3 && parts[1] === 'result') {
        setActiveResultId(parts[2]);
        setActiveTestId(undefined);
        setTestPhase('result');
      } else {
        setActiveTestId(undefined);
        setActiveResultId(undefined);
      }
    };

    window.addEventListener('hashchange', handleInternalHashChange);
    return () => window.removeEventListener('hashchange', handleInternalHashChange);
  }, []);

  const currentClassMeta = CLASSES_METADATA.find((c) => c.id === selectedClass) || CLASSES_METADATA[1];
  const classSubjects = SUBJECTS.filter((s) => s.classLevel === selectedClass);
  const visibleSubjects = classSubjects.filter((s) => {
    if (!currentClassMeta.streamSupported || selectedStream === 'all' || selectedStream === undefined) return true;
    if (selectedStream === 'Science') return s.stream === 'Science' || s.stream === 'General';
    if (selectedStream === 'Arts') return s.stream === 'Arts' || s.stream === 'General';
    if (selectedStream === 'Commerce') return s.stream === 'Commerce' || s.stream === 'General';
    return true;
  });

  const matchedBookFromSubjectSlug = selectedSubjectSlug
    ? BOOKS.find((b) => (b.slug === selectedSubjectSlug || b.id === selectedSubjectSlug) && b.classLevel === selectedClass)
    : undefined;

  const selectedSubject = selectedSubjectSlug 
    ? classSubjects.find(
        (s) =>
          s.slug.toLowerCase() === selectedSubjectSlug.toLowerCase() ||
          s.id.toLowerCase() === selectedSubjectSlug.toLowerCase() ||
          s.name.toLowerCase().replace(/\s+/g, '-') === selectedSubjectSlug.toLowerCase() ||
          (matchedBookFromSubjectSlug && s.id === matchedBookFromSubjectSlug.subjectId)
      ) 
    : undefined;
  
  const effectiveBookSlug = selectedBookSlug || (matchedBookFromSubjectSlug ? matchedBookFromSubjectSlug.slug : undefined);

  const subjectBooks = selectedSubject ? BOOKS.filter((b) => b.subjectId === selectedSubject.id) : [];
  const selectedBook = effectiveBookSlug 
    ? subjectBooks.find((b) => b.slug === effectiveBookSlug || b.id === effectiveBookSlug) 
    : (subjectBooks.length === 1 ? subjectBooks[0] : undefined);
  
  // All chapters for the selected subject across all its books
  const allSubjectChapters = selectedSubject 
    ? CHAPTERS.filter((c) => c.subjectId === selectedSubject.id) 
    : [];

  // Visible chapters based on active book filter (or all subject chapters if 'all' is selected)
  const visibleChapters = effectiveBookSlug 
    ? (selectedBook ? CHAPTERS.filter((c) => c.bookId === selectedBook.id) : [])
    : allSubjectChapters;

  const selectedChapter = selectedChapterSlug 
    ? (selectedBook 
        ? CHAPTERS.find((c) => c.bookId === selectedBook.id && (
            c.slug === selectedChapterSlug || 
            c.id === selectedChapterSlug ||
            c.slug === selectedChapterSlug.replace('chapter-0', 'chapter-') ||
            c.slug === selectedChapterSlug.replace('chapter-', 'chapter-0') ||
            selectedChapterSlug.toLowerCase().includes(`ch0${c.chapterNumber}`) ||
            selectedChapterSlug.toLowerCase().includes(`ch-${c.chapterNumber}`)
          )) 
        : allSubjectChapters.find((c) => (
            c.slug === selectedChapterSlug || 
            c.id === selectedChapterSlug ||
            c.slug === selectedChapterSlug.replace('chapter-0', 'chapter-') ||
            c.slug === selectedChapterSlug.replace('chapter-', 'chapter-0')
          )))
    : undefined;

  const activeChapterBook = selectedChapter 
    ? BOOKS.find((b) => b.id === selectedChapter.bookId) 
    : selectedBook;

  const resolvedSubject = selectedSubject || (activeChapterBook ? classSubjects.find((s) => s.id === activeChapterBook.subjectId) : undefined);
  
  const [activeTest, setActiveTest] = useState<TestItem | undefined>(
    activeTestId ? getStaticTestById(activeTestId) || TESTS.find((t) => t.id === activeTestId) : undefined
  );

  useEffect(() => {
    if (activeTestId) {
      // Immediately set static test in 0ms if available
      const immediateTest =
        getStaticTestById(activeTestId) ||
        chapterTests.find((t) => t.id === activeTestId);
      if (immediateTest) {
        setActiveTest(immediateTest);
      }
      // Also resolve from service in case it's a custom Firestore test
      getTestById(activeTestId).then((t) => {
        if (t) setActiveTest(t);
      });
    } else {
      setActiveTest(undefined);
    }
  }, [activeTestId]);

  const [isLoadingTests, setIsLoadingTests] = useState<boolean>(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [chapterTests, setChapterTests] = useState<TestItem[]>([]);

  // Fetch tests for the chapter (instant 0ms static load + background Firestore merge)
  useEffect(() => {
    let isMounted = true;
    if (selectedChapter && selectedClass && selectedSubject && activeChapterBook && !activeTestId && !activeResultId) {
      const subjectId = selectedSubject.id;
      const bookId = activeChapterBook.id;
      const chapterId = selectedChapter.id;

      // 1. Instant 0ms static load — no spinner needed if static tests exist!
      const instantStatic = getStaticTestsForChapter(selectedClass, subjectId, bookId, chapterId);
      setChapterTests(instantStatic);
      setIsLoadingTests(instantStatic.length === 0);
      setTestError(null);
      
      // 2. Merge any live Firestore tests in background
      getTestsForChapter(selectedClass, subjectId, bookId, chapterId, false)
        .then((tests) => {
          if (isMounted) {
            setChapterTests(tests);
            setIsLoadingTests(false);
          }
        })
        .catch((err) => {
          console.error('[RK STUDY CENTRE] Error loading tests:', err);
          if (isMounted) {
            setChapterTests(instantStatic);
            setIsLoadingTests(false);
          }
        });

      return () => {
        isMounted = false;
      };
    } else {
      if (isMounted && !activeTestId && !activeResultId) {
        setChapterTests([]);
        setIsLoadingTests(false);
      }
    }
  }, [selectedChapter, selectedClass, selectedSubject, activeChapterBook, activeTestId, activeResultId]);

  const navigateToLocal = (path: string) => {
    window.location.hash = path;
  };

  const handleSelectClass = (cls: ClassLevel) => {
    setSelectedClass(cls);
    setSelectedSubjectSlug(undefined);
    setSelectedBookSlug(undefined);
    setSelectedChapterSlug(undefined);
    setActiveTestId(undefined);
    setActiveResultId(undefined);
    setActiveTest(undefined);
    setSelectedStream(undefined);
    onNavigate('tests', { classLevel: cls });
  };
  const handleSelectSubject = (subjectSlug: string) => {
    setSelectedSubjectSlug(subjectSlug);
    setSelectedBookSlug(undefined);
    setSelectedChapterSlug(undefined);
    setActiveTestId(undefined);
    setActiveResultId(undefined);
    setActiveTest(undefined);
    onNavigate('tests', { classLevel: selectedClass, subjectSlug });
  };
  const handleSelectBook = (bookSlug: string) => {
    setSelectedBookSlug(bookSlug || undefined);
    setSelectedChapterSlug(undefined);
    setActiveTestId(undefined);
    setActiveResultId(undefined);
    setActiveTest(undefined);
    onNavigate('tests', { 
      classLevel: selectedClass, 
      subjectSlug: selectedSubjectSlug, 
      bookSlug: bookSlug || undefined 
    });
  };
  const handleSelectChapter = (chapterSlug: string, bookSlug?: string) => {
    const resolvedBookSlug = bookSlug || selectedBookSlug || activeChapterBook?.slug;
    setSelectedBookSlug(resolvedBookSlug);
    setSelectedChapterSlug(chapterSlug);
    setActiveTestId(undefined);
    setActiveResultId(undefined);
    setActiveTest(undefined);
    onNavigate('tests', { 
      classLevel: selectedClass, 
      subjectSlug: selectedSubjectSlug, 
      bookSlug: resolvedBookSlug, 
      chapterSlug 
    });
  };

  const handleStartTest = (testId: string, directPlay = true) => {
    const resolvedTest =
      getStaticTestById(testId) ||
      chapterTests.find((t) => t.id === testId) ||
      TESTS.find((t) => t.id === testId);

    if (resolvedTest) {
      const questions =
        resolvedTest.questions && resolvedTest.questions.length > 0
          ? resolvedTest.questions
          : (TEST_QUESTIONS.filter((q) => q.testId === testId) as TestQuestion[]);
      setActiveTest({
        ...resolvedTest,
        questions,
      });
    }

    setActiveResultId(undefined);
    setActiveTestId(testId);
    setTestPhase(directPlay ? 'playing' : 'instructions');

    const subSlug = resolvedSubject?.slug || selectedSubjectSlug || resolvedTest?.subjectId || 'subject';
    const resolvedBookSlug = selectedBook?.slug || activeChapterBook?.slug || selectedBookSlug || resolvedTest?.bookId || 'book';
    const chSlug = selectedChapter?.slug || selectedChapterSlug || resolvedTest?.chapterId || 'chapter';
    const cls = selectedClass || resolvedTest?.classLevel || 'class-10';
    navigateToLocal(`tests/${cls}/${subSlug}/${resolvedBookSlug}/${chSlug}/test/${testId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToSubjects = () => {
    setSelectedSubjectSlug(undefined);
    setSelectedBookSlug(undefined);
    setSelectedChapterSlug(undefined);
    setActiveTestId(undefined);
    setActiveResultId(undefined);
    setActiveTest(undefined);
    onNavigate('tests', { classLevel: selectedClass });
  };
  const handleBackToBooks = () => {
    setSelectedBookSlug(undefined);
    setSelectedChapterSlug(undefined);
    setActiveTestId(undefined);
    setActiveResultId(undefined);
    setActiveTest(undefined);
    onNavigate('tests', { classLevel: selectedClass, subjectSlug: selectedSubjectSlug });
  };
  const handleBackToChapters = () => {
    setSelectedChapterSlug(undefined);
    setActiveTestId(undefined);
    setActiveResultId(undefined);
    setActiveTest(undefined);
    onNavigate('tests', { classLevel: selectedClass, subjectSlug: selectedSubjectSlug, bookSlug: selectedBookSlug });
  };
  const handleBackToTestsList = (fallbackTest?: TestItem) => {
    const target = fallbackTest || activeTest;
    const targetClass = selectedClass || target?.classLevel || 'class-10';
    const targetSub = selectedSubject || (target ? SUBJECTS.find(s => s.id === target.subjectId) : undefined);
    const targetBook = selectedBook || (target ? BOOKS.find(b => b.id === target.bookId) : undefined);
    const targetCh = selectedChapter || (target ? CHAPTERS.find(c => c.id === target.chapterId) : undefined);

    setActiveTestId(undefined);
    setActiveResultId(undefined);
    setActiveTest(undefined);
    setTestPhase('instructions');

    onNavigate('tests', { 
      classLevel: targetClass, 
      subjectSlug: targetSub?.slug, 
      bookSlug: targetBook?.slug, 
      chapterSlug: targetCh?.slug 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Validations for bad URLs (only when not in an active test/result)
  const isInvalidSubject = Boolean(selectedSubjectSlug && !selectedSubject && !activeTestId && !activeResultId);
  const isInvalidBook = Boolean(selectedBookSlug && selectedSubject && !selectedBook && !activeTestId && !activeResultId);
  const isInvalidChapter = Boolean(selectedChapterSlug && selectedSubject && !selectedChapter && !activeTestId && !activeResultId);

  // Sub-components for test player and result
  
  if (activeResultId) {
    return (
      <TestResultView
        resultId={activeResultId}
        onBack={(targetTest?: TestItem) => handleBackToTestsList(targetTest)}
        onRetake={(targetTest: TestItem) => {
          handleStartTest(targetTest.id, true);
        }}
      />
    );
  }

  if (activeTest && testPhase === 'playing') {
    return (
      <TestPlayer
        test={activeTest}
        studentId={user?.uid}
        onFinish={(resultId) => {
          setActiveResultId(resultId);
          setActiveTestId(undefined);
          setTestPhase('result');
          navigateToLocal(`tests/result/${resultId}`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onCancel={() => handleBackToTestsList()}
      />
    );
  }

  if (activeTest && testPhase === 'instructions') {
    const displaySubject = resolvedSubject || SUBJECTS.find(s => s.id === activeTest.subjectId);
    const displayBook = selectedBook || activeChapterBook || BOOKS.find(b => b.id === activeTest.bookId);
    const displayChapter = selectedChapter || CHAPTERS.find(c => c.id === activeTest.chapterId);

    return (
      <div className="space-y-8 py-6">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => handleBackToTestsList()}
            className="px-4 py-2 rounded-xl text-sm font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>वापस</span>
          </button>
        </div>
        
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200 shadow-sm max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h2 className="text-3xl font-black text-slate-900">{activeTest.title}</h2>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-bold text-slate-600">
              {displaySubject && <span className="bg-slate-100 px-3 py-1 rounded-md">{displaySubject.hindiName || displaySubject.name}</span>}
              {displayBook && <span className="bg-slate-100 px-3 py-1 rounded-md">{displayBook.hindiTitle || displayBook.title}</span>}
              {displayChapter && <span className="bg-slate-100 px-3 py-1 rounded-md">अध्याय {displayChapter.chapterNumber}</span>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
              <ListOrdered className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <div className="text-xl font-black text-slate-900">{activeTest.totalQuestions}</div>
              <div className="text-xs font-bold text-slate-500 uppercase mt-1">कुल प्रश्न</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
              <Award className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <div className="text-xl font-black text-slate-900">{activeTest.totalMarks}</div>
              <div className="text-xs font-bold text-slate-500 uppercase mt-1">कुल अंक</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
              <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <div className="text-xl font-black text-slate-900">{activeTest.durationMinutes > 0 ? `${activeTest.durationMinutes} min` : 'असीमित'}</div>
              <div className="text-xs font-bold text-slate-500 uppercase mt-1">समय (Time)</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
              <CheckCircle2 className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <div className="text-xl font-black text-slate-900">{activeTest.passingMarks}</div>
              <div className="text-xs font-bold text-slate-500 uppercase mt-1">उत्तीर्ण अंक</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900">निर्देश (Instructions):</h3>
            <ul className="space-y-3 text-slate-700 font-medium list-disc list-inside">
              <li>सभी प्रश्न अनिवार्य हैं।</li>
              <li>प्रत्येक प्रश्न के 4 विकल्प हैं, जिनमें से केवल एक ही सही है।</li>
              {activeTest.isNegativeMarking && <li className="text-red-600 font-bold">इस टेस्ट में नेगेटिव मार्किंग (Negative Marking) है।</li>}
              {activeTest.durationMinutes > 0 && <li>निर्धारित समय समाप्त होने पर टेस्ट अपने आप जमा (Submit) हो जाएगा।</li>}
              <li>टेस्ट शुरू करने के बाद पेज को रिफ्रेश (Refresh) न करें, अन्यथा आपका टेस्ट रद्द हो सकता है।</li>
            </ul>
          </div>
          
          <div className="pt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setTestPhase('playing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-10 py-4 rounded-2xl text-lg font-black bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95 inline-flex items-center gap-3 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Test शुरू करें</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Selection UI ---
  if (isInvalidSubject || isInvalidBook || isInvalidChapter) {
    return (
      <div className="space-y-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <BackButton label="मुख्य पृष्ठ पर वापस जाएं" fallbackRoute="home" onNavigate={onNavigate} />
        </div>
        <div className="bg-white rounded-3xl p-10 sm:p-16 border-2 border-slate-200 text-center space-y-5 shadow-sm">
          <FolderOpen className="w-16 h-16 text-slate-400 mx-auto" />
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">यह सामग्री अभी उपलब्ध नहीं है।</h3>
          <p className="text-slate-600 text-base sm:text-lg font-medium max-w-lg mx-auto leading-relaxed">
            आपके द्वारा खोजी गई कक्षा, विषय, पुस्तक या अध्याय इस समय सिस्टम में मौजूद नहीं है। कृपया सही विकल्प चुनें।
          </p>
          <button
            onClick={() => onNavigate('tests', { classLevel: selectedClass })}
            className="mt-4 px-6 py-3 rounded-xl text-base font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md inline-flex items-center gap-2 cursor-pointer transition-colors"
          >
            कक्षा {currentClassMeta.gradeNumber} के विषयों पर वापस जाएं
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      {/* Top Nav & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <BackButton label="मुख्य पृष्ठ पर वापस जाएं" fallbackRoute="home" onNavigate={onNavigate} />
        {selectedClass && (
          <div className="text-sm font-bold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-2xs">
            प्रदर्शित कक्षा: <span className="text-blue-800 font-extrabold">{currentClassMeta.hindiName} ({currentClassMeta.name})</span>
          </div>
        )}
      </div>

      {!selectedClass ? (
        <div className="space-y-12 py-10">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
              अपनी कक्षा का <span className="text-blue-700">चयन करें</span>
            </h1>
            <p className="text-slate-600 text-lg sm:text-xl font-medium leading-relaxed">
              ऑनलाइन टेस्ट देने के लिए कृपया नीचे दी गई कक्षाओं में से अपनी कक्षा चुनें। 
              प्रत्येक कक्षा के टेस्ट और प्रश्न पूर्णतः अलग हैं।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
            {CLASSES_METADATA.map((cls) => (
              <button
                key={cls.id}
                onClick={() => handleSelectClass(cls.id)}
                className="group relative bg-white rounded-[32px] p-8 border-2 border-slate-200 hover:border-blue-600 hover:shadow-2xl transition-all cursor-pointer flex flex-col items-center text-center space-y-6 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-100 transition-colors" />
                
                <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform relative">
                  <span className="text-3xl font-black">{cls.gradeNumber}</span>
                </div>

                <div className="space-y-2 relative">
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                    {cls.hindiName}
                  </h3>
                  <div className="text-lg font-bold text-slate-500">
                    Class {cls.gradeNumber}
                  </div>
                </div>

                <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-blue-700 font-extrabold group-hover:gap-3 transition-all relative">
                  <span>टेस्ट शुरू करें</span>
                  <ChevronRight className="w-5 h-5 stroke-[3]" />
                </div>
              </button>
            ))}
          </div>

          {/* 1-Click Direct Start Featured Tests on Root Tests Page */}
          <div className="max-w-6xl mx-auto px-4 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase">
                  ⚡ 1-Click Instant Test Start
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  लोकप्रिय लाइव ऑनलाइन टेस्ट (सीधे शुरू करें)
                </h2>
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-500">
                बिना रुके 1 क्लिक में तुरंत टेस्ट शुरू करें
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                ...TESTS.filter((t) => t.id === 'test-c10-soc-civ-01' || t.id === 'test-c10-soc-civ-01-rapid'),
                ...TESTS.filter((t) => t.isPublished && t.id !== 'test-c10-soc-civ-01' && t.id !== 'test-c10-soc-civ-01-rapid').slice(0, 4),
              ].map((quickTest) => (
                <div
                  key={quickTest.id}
                  className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black px-2.5 py-1 rounded-md bg-blue-100 text-blue-900">
                        {quickTest.classLevel === 'class-10' ? 'कक्षा 10वीं' : 'कक्षा 12वीं'} • {quickTest.totalQuestions} प्रश्न
                      </span>
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        {quickTest.durationMinutes} मिनट
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug line-clamp-2">
                      {quickTest.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2">
                      {quickTest.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartTest(quickTest.id, true)}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>⚡ तुरंत Test शुरू करें</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
              <Award className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1 text-center md:text-left space-y-1">
              <h4 className="text-xl font-black text-blue-900">निःशुल्क ऑनलाइन टेस्ट सीरीज</h4>
              <p className="text-blue-800/80 font-medium leading-relaxed">
                सभी विषयों के लिए चैप्टर-वाइज ऑनलाइन टेस्ट उपलब्ध हैं। अपनी तैयारी को बेहतर बनाने के लिए नियमित रूप से टेस्ट दें।
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Class Selection Tabs */}
          <div className="bg-white rounded-3xl p-7 sm:p-8 border-2 border-slate-200 shadow-sm space-y-7">
            <div className="space-y-2">
              <span className="text-sm font-black text-blue-700 uppercase tracking-widest">ऑनलाइन टेस्ट</span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900">कक्षा चुनें</h1>
              <p className="text-slate-700 text-base sm:text-lg font-medium max-w-3xl leading-relaxed">
                कृपया अपनी कक्षा का चयन करें। आपको केवल उसी कक्षा के टेस्ट दिखाई देंगे।
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {CLASSES_METADATA.map((cls) => {
                const isSelected = selectedClass === cls.id;
                return (
                  <button
                    key={cls.id}
                    onClick={() => handleSelectClass(cls.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer shadow-xs ${
                      isSelected ? 'border-blue-700 bg-blue-50/90 ring-4 ring-blue-600/15' : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-lg sm:text-xl font-black ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{cls.hindiName}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${isSelected ? 'bg-blue-200 text-blue-900' : 'bg-slate-100 text-slate-700'}`}>{cls.name}</span>
                    </div>
                    <div className={`text-sm mt-1.5 font-bold truncate ${isSelected ? 'text-blue-800' : 'text-slate-600'}`}>{cls.totalSubjects} मुख्य विषय</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Breadcrumbs */}
          {(selectedStream || selectedSubject || selectedChapter || selectedBook) && (
            <nav className="flex items-center gap-2.5 text-sm sm:text-base text-slate-700 bg-slate-100 px-5 py-3 rounded-2xl flex-wrap font-bold border border-slate-200">
              <button onClick={() => {
                setSelectedSubjectSlug(undefined);
                setSelectedBookSlug(undefined);
                setSelectedChapterSlug(undefined);
                setSelectedStream(undefined);
              }} className="font-black text-blue-800 hover:underline cursor-pointer">{currentClassMeta.hindiName}</button>
              
              {selectedStream && (
                <>
                  <ChevronRight className="w-5 h-5 text-slate-400 stroke-[2.5]" />
                  <button 
                    onClick={() => {
                      setSelectedSubjectSlug(undefined);
                      setSelectedBookSlug(undefined);
                      setSelectedChapterSlug(undefined);
                    }} 
                    className={`font-bold cursor-pointer ${!selectedSubject ? 'text-slate-900 font-black' : 'text-blue-800 hover:underline'}`}
                  >
                    {selectedStream === 'all' ? 'सभी विषय' : selectedStream}
                  </button>
                </>
              )}

              {selectedSubject && (
                <>
                  <ChevronRight className="w-5 h-5 text-slate-400 stroke-[2.5]" />
                  <button onClick={() => handleBackToBooks()} className={`font-bold cursor-pointer ${!selectedBook ? 'text-slate-900 font-black' : 'text-blue-800 hover:underline'}`}>
                    {selectedSubject.hindiName}
                  </button>
                </>
              )}
              {selectedBook && (
                <>
                  <ChevronRight className="w-5 h-5 text-slate-400 stroke-[2.5]" />
                  <button onClick={() => handleBackToChapters()} className={`font-bold cursor-pointer ${!selectedChapter ? 'text-slate-900 font-black' : 'text-blue-800 hover:underline'}`}>
                    {selectedBook.hindiTitle || selectedBook.title}
                  </button>
                </>
              )}
              {selectedChapter && (
                <>
                  <ChevronRight className="w-5 h-5 text-slate-400 stroke-[2.5]" />
                  <span className="font-black text-slate-900 truncate">अध्याय {selectedChapter.chapterNumber}</span>
                </>
              )}
            </nav>
          )}

          <div className="space-y-8">
            {/* Step 0: Stream Selection (for Class 11/12) */}
            {currentClassMeta.streamSupported && !selectedStream && !selectedSubject && (
              <div className="space-y-12 py-10">
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                    अपना <span className="text-blue-700">संकाय (Stream)</span> चुनें
                  </h2>
                  <p className="text-slate-600 text-lg font-medium leading-relaxed">
                    {currentClassMeta.hindiName} के टेस्ट देखने के लिए अपने संकाय का चयन करें।
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
                  {[
                    { id: 'Science', name: 'Science', hindi: 'विज्ञान (Science)', icon: 'Atom', color: 'emerald' },
                    { id: 'Arts', name: 'Arts', hindi: 'कला (Arts)', icon: 'Landmark', color: 'amber' },
                    { id: 'Commerce', name: 'Commerce', hindi: 'वाणिज्य (Commerce)', icon: 'Briefcase', color: 'purple' },
                  ].map((stream) => (
                    <button
                      key={stream.id}
                      onClick={() => setSelectedStream(stream.id as any)}
                      className="group bg-white rounded-[32px] p-8 border-2 border-slate-200 hover:border-blue-600 hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center space-y-6"
                    >
                      <div className={`w-16 h-16 rounded-2xl bg-${stream.color}-100 text-${stream.color}-700 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <FolderOpen className="w-8 h-8 stroke-[2.5]" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">{stream.hindi}</h3>
                        <p className="text-sm font-bold text-slate-500">सभी मुख्य विषय एवं टेस्ट</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="text-center">
                  <button 
                    onClick={() => setSelectedStream('all')}
                    className="text-slate-500 hover:text-blue-700 font-black text-sm uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    सभी विषय देखें (Show All Subjects)
                  </button>
                </div>
              </div>
            )}

            {/* 🔥 MEGA MARATHON TESTS PROMINENT CARDS FOR CLASS 10 */}
            {selectedClass === 'class-10' && !selectedSubject && (
              <div className="space-y-4">
                {/* Featured Class 10 Math Ch 02 500 VVI Objective Question Bank & Live Test */}
                <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-blue-950 rounded-3xl p-6 text-white border-2 border-amber-400 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase animate-pulse">
                        🔥 500 VVI ACTIVE • READ + SOLVED + LIVE TEST
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
                        कक्षा 10 गणित • अध्याय 02 (बहुपद)
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-300">
                      📐 बहुपद (Polynomials): 500 VVI वस्तुनिष्ठ प्रश्न बैंक एवं महा-टेस्ट
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200">
                      सभी 500 प्रश्नों के चारों विकल्प (A, B, C, D), सही उत्तर और विस्तृत Step-by-Step हल (Solved Answer) पढ़ें या लाइव टाइमर व OMR शीट के साथ टेस्ट दें!
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowMathCh02Bank500Modal({ open: true, mode: 'solve' })}
                      className="flex-1 lg:flex-initial py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>📖 500 प्रश्न पढ़ें (Option + हल)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMathCh02Bank500Modal({ open: true, mode: 'test' })}
                      className="flex-1 lg:flex-initial py-3 px-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>⚡ 500 VVI Live Test</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubjectSlug('mathematics');
                        setSelectedBookSlug('b-c10-math-ncert');
                        setSelectedChapterSlug('polynomials');
                      }}
                      className="flex-1 lg:flex-initial py-3 px-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/30 font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>अध्याय 02 के 7 सेट्स</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Physics Ch-02 300 VVI Amog Marathon */}
                <div className="bg-gradient-to-r from-cyan-900 via-teal-950 to-indigo-950 rounded-3xl p-6 text-white border-2 border-emerald-400 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-0.5 rounded-full text-xs font-black bg-emerald-400 text-slate-950 uppercase animate-pulse">
                        ⚡ 3 Hours Live • 300 VVI
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
                        भौतिकी अध्याय 02
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-emerald-300">
                      🔍 प्रकाश का अपवर्तन: 300 VVI 'अमोग अपवर्तन-चक्र'
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200">
                      2016-2026 बिहार बोर्ड के 300 VVI वस्तुनिष्ठ प्रश्न। रियल-टाइम OMR, 3 Hr टाइमर व संपूर्ण व्याख्या!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenPhysicsCh02Marathon || (() => {
                      setSelectedSubjectSlug('physics');
                      setSelectedChapterSlug('refraction-of-light');
                    })}
                    className="w-full py-3.5 px-5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-102 active:scale-95 border-2 border-white/60"
                  >
                    <span>🎯 अमोग टेस्ट शुरू करें (3 Hours)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Physics Ch-01 300 VVI Akhand Marathon */}
                <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-purple-950 rounded-3xl p-6 text-white border-2 border-amber-400 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase animate-pulse">
                        🔥 3 Hours Live • 300 VVI
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
                        भौतिकी अध्याय 01
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-300">
                      ⚡ प्रकाश का परावर्तन: 300 VVI अखंड महामैराथन
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200">
                      2016-2026 बिहार बोर्ड के 300 सबसे महत्वपूर्ण वस्तुनिष्ठ प्रश्न। 3 घंटे का रियल-टाइम OMR टेस्ट!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenPhysicsMarathon || (() => {
                      setSelectedSubjectSlug('physics');
                      setSelectedChapterSlug('reflection-of-light');
                    })}
                    className="w-full py-3.5 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-102 active:scale-95 border-2 border-white/60"
                  >
                    <span>🔥 अखंड टेस्ट शुरू करें (3 Hours)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* History Ch-01 300 VVI Marathon */}
                <div className="bg-gradient-to-r from-red-900 via-rose-950 to-amber-950 rounded-3xl p-6 text-white border-2 border-red-400 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase">
                        ⚡ 3 Hours Live • 300 VVI
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
                        इतिहास अध्याय 01
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-300">
                      🔥 यूरोप में राष्ट्रवाद: 300 VVI महामैराथन
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200">
                      विगत 10 वर्षों के 300 वस्तुनिष्ठ प्रश्न। रियल-टाइम टाइमर, OMR शीट व सम्पूर्ण व्याख्या!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenHistoryMarathon) {
                        onOpenHistoryMarathon();
                      } else {
                        window.location.hash = '#history-marathon';
                      }
                    }}
                    className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-102 active:scale-95"
                  >
                    <span>🎯 इतिहास महामैराथन शुरू करें</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                </div>
              </div>
            )}

            {/* 🔥 MEGA MARATHON TESTS PROMINENT CARDS FOR CLASS 12 */}
            {selectedClass === 'class-12' && !selectedSubject && (
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 rounded-3xl p-6 text-white border-2 border-purple-400 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-0.5 rounded-full text-xs font-black bg-purple-400 text-slate-950 uppercase animate-pulse">
                        ⚡ 3 Hours Live • 300 VVI
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
                        कक्षा 12वीं भौतिकी अध्याय 01
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-300">
                      ⚡ वैद्युत आवेश तथा क्षेत्र: 300 VVI 'इलेक्ट्रो-ब्रह्मास्त्र' महामैराथन
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200">
                      12th Physics Chapter 01: 2016-2026 बोर्ड परीक्षा के 300 VVI वस्तुनिष्ठ प्रश्न। रियल-टाइम OMR, 3 Hr टाइमर व संपूर्ण समाधान!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenPhysics12Ch01Marathon || (() => {
                      setSelectedSubjectSlug('physics');
                      setSelectedChapterSlug('electric-charges-and-fields');
                    })}
                    className="w-full py-3.5 px-5 rounded-2xl bg-purple-400 hover:bg-purple-300 text-slate-950 font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-102 active:scale-95 border-2 border-white/60"
                  >
                    <span>⚡ ब्रह्मास्त्र टेस्ट शुरू करें (3 Hours)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Subjects List */}
            {!selectedSubject && (!currentClassMeta.streamSupported || selectedStream) && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">विषय चुनें</h2>
                <p className="text-slate-700 text-sm sm:text-base font-medium mt-1">टेस्ट देखने के लिए विषय का चयन करें।</p>
              </div>

              {currentClassMeta.streamSupported && (
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border-2 border-slate-200 overflow-x-auto shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setSelectedStream('all')}
                    className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                      selectedStream === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    सभी संकाय
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStream('Science')}
                    className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                      selectedStream === 'Science'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Science (विज्ञान)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStream('Arts')}
                    className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                      selectedStream === 'Arts'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Arts (कला)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStream('Commerce')}
                    className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                      selectedStream === 'Commerce'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Commerce (वाणिज्य)
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(visibleSubjects || []).map((sub) => (
                <div key={sub.id} onClick={() => handleSelectSubject(sub.slug)} className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                        <BookOpen className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {sub.stream && (
                          <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md ${
                            sub.stream === 'Science'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : sub.stream === 'Arts'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : sub.stream === 'Commerce'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-sky-100 text-sky-800 border border-sky-200'
                          }`}>
                            {sub.stream === 'General' ? 'अनिवार्य भाषा' : sub.stream}
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                          {sub.code}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">{sub.hindiName}</h3>
                      <div className="text-base font-bold text-blue-800">{sub.name}</div>
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-extrabold text-blue-700">
                    <span>अध्याय एवं टेस्ट चुनें</span>
                    <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-800 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      टेस्ट शुरू करें →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Direct 1-Click Chapter Tests for the Selected Class */}
            {TESTS.filter((t) => t.classLevel === selectedClass && t.isPublished).length > 0 && (
              <div className="pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase">
                      ⚡ Direct Test Start • {currentClassMeta.hindiName}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      प्रमुख चैप्टर-वाइज VVI ऑनलाइन टेस्ट (सीधे शुरू करें)
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[
                    ...TESTS.filter((t) => t.classLevel === selectedClass && (t.id === 'test-c10-soc-civ-01' || t.id === 'test-c10-soc-civ-01-rapid')),
                    ...TESTS.filter((t) => t.classLevel === selectedClass && t.isPublished && t.id !== 'test-c10-soc-civ-01' && t.id !== 'test-c10-soc-civ-01-rapid'),
                  ]
                    .slice(0, 6)
                    .map((directTest) => (
                      <div
                        key={directTest.id}
                        className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black px-2.5 py-1 rounded-md bg-blue-100 text-blue-900">
                              {directTest.totalQuestions} प्रश्न • {directTest.totalMarks} अंक
                            </span>
                            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                              {directTest.durationMinutes > 0 ? `${directTest.durationMinutes} मिनट` : 'असीमित'}
                            </span>
                          </div>
                          <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug line-clamp-2">
                            {directTest.title}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium line-clamp-2">
                            {directTest.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleStartTest(directTest.id, true)}
                          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>⚡ तुरंत Test शुरू करें</span>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Subject Chapters & Books List */}
        {selectedSubject && !selectedChapter && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 uppercase">
                    {selectedSubject.code}
                  </span>
                  {selectedSubject.stream && (
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {selectedSubject.stream === 'General' ? 'अनिवार्य' : selectedSubject.stream}
                    </span>
                  )}
                  {subjectBooks.length === 1 && (
                    <span className="text-xs font-extrabold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                      {subjectBooks[0].hindiTitle || subjectBooks[0].title}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {selectedSubject.hindiName} ({selectedSubject.name}) के टेस्ट
                </h2>
                <p className="text-slate-700 text-sm sm:text-base font-medium mt-1">
                  ऑनलाइन टेस्ट देने के लिए अध्याय का चयन करें।
                </p>
              </div>
              <button
                onClick={handleBackToSubjects}
                className="px-4 py-2.5 rounded-xl text-sm font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-center"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span>विषयों की सूची पर वापस</span>
              </button>
            </div>

            {/* Book Filter Tabs for Multi-Book Subjects */}
            {subjectBooks.length > 1 && (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">
                  पुस्तक अनुसार फ़िल्टर करें (Books Filter):
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => handleSelectBook('')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer shrink-0 ${
                      !selectedBookSlug
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    सभी पुस्तकें (All {allSubjectChapters.length} Chapters)
                  </button>
                  {(subjectBooks || []).map((b) => {
                    const isBookActive = selectedBookSlug === b.slug;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleSelectBook(b.slug)}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer shrink-0 ${
                          isBookActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {b.hindiTitle || b.title} ({b.totalChapters} अध्याय)
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {visibleChapters.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border-2 border-slate-200 text-center space-y-4">
                 <h4 className="font-black text-slate-900 text-xl">यह सामग्री अभी उपलब्ध नहीं है।</h4>
                 <p className="text-slate-600 text-base font-medium max-w-md mx-auto">
                    इस विषय या पुस्तक के लिए अभी कोई अध्याय उपलब्ध नहीं है।
                 </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(visibleChapters || []).map((ch) => {
                  const parentBook = BOOKS.find((b) => b.id === ch.bookId);
                  const chStaticTests = TESTS.filter((t) => t.chapterId === ch.id && t.isPublished);
                  const primaryChapterTest = chStaticTests[0];
                  return (
                    <div
                      key={ch.id}
                      onClick={() => handleSelectChapter(ch.slug, parentBook?.slug)}
                      className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-black px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 uppercase">
                            अध्याय {ch.chapterNumber}
                          </span>
                          {parentBook && subjectBooks.length > 1 && (
                            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                              {parentBook.hindiTitle || parentBook.title}
                            </span>
                          )}
                          {chStaticTests.length > 0 && (
                            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {chStaticTests.length} लाइव टेस्ट उपलब्ध
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                          {ch.hindiTitle || ch.title}
                        </h4>
                        <div className="text-sm font-bold text-slate-500">
                          {ch.title}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-2.5 flex-wrap">
                        {primaryChapterTest && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartTest(primaryChapterTest.id, true);
                            }}
                            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>⚡ तुरंत Test शुरू करें</span>
                          </button>
                        )}
                        <span className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">
                          सभी टेस्ट देखें →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Available Tests */}
        {selectedChapter && !activeTestId && !activeResultId && (
           <div className="space-y-6">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">उपलब्ध Test</h2>
                <p className="text-slate-700 text-sm sm:text-base font-medium mt-1">अध्याय {selectedChapter.chapterNumber} के लिए उपलब्ध टेस्ट</p>
              </div>
              <button onClick={handleBackToChapters} className="px-4 py-2 rounded-xl text-sm font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-center">
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">वापस</span>
              </button>
            </div>
            
            {isLoadingTests ? (
              <div className="bg-white rounded-3xl p-16 border-2 border-slate-200 text-center space-y-5 shadow-sm">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                <h3 className="text-xl font-bold text-slate-800">Test लोड हो रहा है...</h3>
              </div>
            ) : testError ? (
              <div className="bg-white rounded-3xl p-16 border-2 border-red-200 text-center space-y-5 shadow-sm bg-red-50">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <h3 className="text-xl font-bold text-red-800">{testError}</h3>
              </div>
            ) : chapterTests.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 sm:p-16 border-2 border-slate-200 text-center space-y-5 shadow-sm">
                <FolderOpen className="w-16 h-16 text-slate-300 mx-auto" />
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">इस अध्याय के लिए अभी कोई Online Test उपलब्ध नहीं है।</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(chapterTests || []).map(test => {
                  const isMarathon = test.id.includes('marathon') || test.totalQuestions >= 300;
                  return (
                    <div 
                      key={test.id} 
                      className={`rounded-3xl p-6 sm:p-7 border-2 transition-all flex flex-col justify-between space-y-6 group ${
                        isMarathon 
                          ? 'bg-gradient-to-br from-red-50 via-rose-50 to-amber-50 border-red-400 shadow-lg shadow-red-500/10 hover:border-red-600' 
                          : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-xl'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className={`text-xs font-black px-3 py-1 rounded-full inline-block ${
                            isMarathon 
                              ? 'bg-red-600 text-white shadow-xs' 
                              : 'text-blue-800 bg-blue-100 border border-blue-200'
                          }`}>
                            {isMarathon ? '🔥 300 VVI महामैराथन (3 Hours)' : test.type === 'chapter_test' ? 'अध्याय टेस्ट' : test.type === 'practice_quiz' ? 'अभ्यास क्विज़' : 'ऑब्जेक्टिव टेस्ट'}
                          </span>
                          {test.difficulty && (
                            <span className={`text-xs font-black px-2.5 py-0.5 rounded-md ${
                              test.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                              test.difficulty === 'Hard' ? 'bg-purple-100 text-purple-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {test.difficulty}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug group-hover:text-red-700 transition-colors">{test.title}</h3>
                        <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm font-bold text-slate-600 bg-white/80 p-3 rounded-2xl border border-slate-200">
                          <div className="text-center">
                            <div className="font-black text-slate-900 text-sm sm:text-base">{test.totalQuestions}</div>
                            <div className="text-slate-400 text-2xs uppercase">प्रश्न</div>
                          </div>
                          <div className="text-center border-x border-slate-200">
                            <div className="font-black text-slate-900 text-sm sm:text-base">{test.durationMinutes > 0 ? `${test.durationMinutes}m` : 'असीमित'}</div>
                            <div className="text-slate-400 text-2xs uppercase">समय {test.durationMinutes > 0 ? `(${Math.floor(test.durationMinutes / 60)}h ${test.durationMinutes % 60}m)`.replace(' 0m', '') : ''}</div>
                          </div>
                          <div className="text-center">
                            <div className="font-black text-slate-900 text-sm sm:text-base">{test.totalMarks}</div>
                            <div className="text-slate-400 text-2xs uppercase">अंक</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2.5 pt-2">
                        <button 
                          type="button"
                          onClick={() => handleStartTest(test.id, true)} 
                          className={`w-full px-5 py-3.5 rounded-xl text-base font-black transition-all shadow-md active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer ${
                            isMarathon 
                              ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white shadow-red-600/25' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                          }`}
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>{isMarathon ? '🔥 महामैराथन Test शुरू करें' : '⚡ Test शुरू करें (Start Now)'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartTest(test.id, false)}
                          className="w-full px-4 py-2 rounded-xl text-xs font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>निर्देश देखें (View Instructions)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </div>
          )}
        </div>
      </>
    )}

    {/* Class 10 Math Chapter 02 — 500 VVI Question Bank & Live Test Modal */}
    {showMathCh02Bank500Modal.open && (
      <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md overflow-y-auto p-2 sm:p-4 md:p-6 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <MathCh02QuestionBank500Viewer
            initialMode={showMathCh02Bank500Modal.mode}
            onBack={() => setShowMathCh02Bank500Modal({ open: false, mode: 'test' })}
          />
        </div>
      </div>
    )}
  </div>
);
}

// --- Test Player Component ---
function TestPlayer({ test, studentId, onFinish, onCancel }: { test: TestItem, studentId?: string, onFinish: (resultId: string) => void, onCancel: () => void }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(test.durationMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showMobilePalette, setShowMobilePalette] = useState(false);
  const [checkedQuestionIds, setCheckedQuestionIds] = useState<Record<string, boolean>>({});

  const questions = useMemo(() => {
    let list: TestQuestion[] = [];
    if (test.questions && test.questions.length > 0) {
      list = [...test.questions];
    } else {
      list = TEST_QUESTIONS.filter((q) => q.testId === test.id) as unknown as TestQuestion[];
    }
    // Strict isolation: ensure questions strictly belong to this test / chapter
    if (test.chapterId) {
      list = list.filter((q) => !q.chapterId || q.chapterId === test.chapterId);
    }
    return list.sort((a, b) => a.order - b.order);
  }, [test]);
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (test.durationMinutes <= 0 || isSubmitting) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [test.durationMinutes, isSubmitting]);

  const handleAutoSubmit = () => {
    if (!isSubmitting) submitTest(selectedAnswers);
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleClearAnswer = (questionId: string) => {
    setSelectedAnswers(prev => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowMobilePalette(false);
  };

  const confirmSubmit = () => {
    setShowConfirmSubmit(true);
  };

  const submitTest = (answersToSubmit: Record<string, number>) => {
    setIsSubmitting(true);
    setShowConfirmSubmit(false);
    
    // Calculate result
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    let score = 0;

    questions.forEach(q => {
      const selected = answersToSubmit[q.id];
      if (selected === undefined) {
        unattempted++;
      } else if (selected === q.correctOption) {
        correct++;
        score += q.marks;
      } else {
        incorrect++;
        if (test.isNegativeMarking) score -= (q.marks * 0.25);
      }
    });

    const resultId = 'res-' + Math.random().toString(36).substring(2, 11);
    
    const resultObj = {
      id: resultId,
      testId: test.id,
      studentId: studentId || 'current-student',
      score,
      totalMarks: test.totalMarks,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      unattempted,
      timeTakenMinutes: test.durationMinutes > 0 ? (test.durationMinutes * 60 - timeLeft) / 60 : 0,
      completedAt: new Date().toISOString(),
      studentAnswers: answersToSubmit,
      testTitle: test.title,
      classLevel: test.classLevel,
      subjectId: test.subjectId,
      passed: score >= test.passingMarks
    };
    
    recordTestResult(resultObj, studentId);
    onFinish(resultId);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = questions.length - answeredCount;

  if (!currentQuestion) {
    return (
      <div className="bg-white rounded-3xl p-10 sm:p-16 border-2 border-slate-200 text-center space-y-5 shadow-sm max-w-3xl mx-auto mt-6">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-xl font-bold text-slate-800">इस टेस्ट में कोई प्रश्न उपलब्ध नहीं है।</h3>
        <button onClick={onCancel} className="px-6 py-3 rounded-xl bg-slate-100 font-bold hover:bg-slate-200 transition-colors">वापस जाएं</button>
      </div>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-6 py-4 sm:py-6 max-w-7xl mx-auto w-full px-2 sm:px-4 lg:px-6">
      {/* Top Bar - Fully Responsive for Android & Desktop */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-200 shadow-sm flex items-center justify-between gap-3 sticky top-2 sm:top-4 z-20">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
              {test.type === 'practice_quiz' ? 'अभ्यास क्विज़' : 'ऑनलाइन टेस्ट'}
            </span>
            <span className="hidden sm:inline text-xs font-bold text-slate-500">
              प्रश्न {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 truncate mt-0.5">{test.title}</h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {test.durationMinutes > 0 && (
            <div className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold border-2 ${
              timeLeft < 180 ? 'bg-red-50 text-red-700 border-red-300 animate-pulse' : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="text-sm sm:text-base tabular-nums font-black">{formatTime(timeLeft)}</span>
            </div>
          )}

          {/* Mobile Palette Toggle Button */}
          <button
            type="button"
            onClick={() => setShowMobilePalette(prev => !prev)}
            className="lg:hidden px-3 py-2 rounded-xl text-xs sm:text-sm font-black bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 flex items-center gap-1.5"
            title="सभी प्रश्न देखें"
          >
            <ListOrdered className="w-4 h-4" />
            <span className="hidden xs:inline">ग्रिड ({answeredCount}/{questions.length})</span>
          </button>

          <button
            onClick={confirmSubmit}
            className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-black text-sm sm:text-base bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95 shrink-0"
          >
            जमा करें
          </button>
        </div>
      </div>

      {/* Main Layout: 2 Columns on Desktop & Wide Screens, 1 Column on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active Question & Interactive Options (8 Cols on Desktop) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-8 md:p-10 border-2 border-slate-200 shadow-sm space-y-6 sm:space-y-8 relative overflow-hidden">
            {isSubmitting && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-30 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <div className="text-lg font-black text-slate-900">टेस्ट सुरक्षित जमा किया जा रहा है...</div>
              </div>
            )}

            {/* Question Sub-header */}
            <div className="flex items-center justify-between gap-4 border-b-2 border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base sm:text-lg shadow-sm">
                  {currentQuestionIndex + 1}
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase">प्रश्न क्रमांक</div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-800">
                    {questions.length} में से {currentQuestionIndex + 1}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-xs font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg">
                  +{currentQuestion.marks} अंक
                </div>
                {selectedAnswers[currentQuestion.id] !== undefined && (
                  <button
                    type="button"
                    onClick={() => handleClearAnswer(currentQuestion.id)}
                    className="text-xs font-bold text-slate-500 hover:text-red-600 px-2.5 py-1 rounded-lg hover:bg-red-50 border border-slate-200 transition-colors"
                  >
                    उत्तर साफ करें
                  </button>
                )}
              </div>
            </div>

            {/* Question Text (Large, High Contrast Hindi Typography) */}
            <div className="text-lg sm:text-2xl font-black text-slate-900 leading-snug tracking-tight">
              {currentQuestion.question}
            </div>

            {/* 4 Interactive Options (Large Touch Targets for Android) */}
            <div className="space-y-3">
              {(currentQuestion.options || []).map((option, idx) => {
                const isSelected = selectedAnswers[currentQuestion.id] === idx;
                const isChecked = Boolean(checkedQuestionIds[currentQuestion.id]);
                const isCorrectOpt = currentQuestion.correctOption === idx;
                const letter = optionLetters[idx] || `${idx + 1}`;

                let cardStyle = 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/80 bg-white';
                let badgeStyle = 'border-slate-300 text-slate-600 group-hover:border-blue-500 group-hover:text-blue-700 bg-slate-50';
                let textStyle = 'text-slate-800';

                if (isChecked) {
                  if (isCorrectOpt) {
                    cardStyle = 'border-emerald-600 bg-emerald-50/95 shadow-xs ring-2 ring-emerald-500/20';
                    badgeStyle = 'border-emerald-700 bg-emerald-700 text-white';
                    textStyle = 'text-emerald-950 font-black';
                  } else if (isSelected) {
                    cardStyle = 'border-red-500 bg-red-50/95 shadow-xs ring-2 ring-red-500/20';
                    badgeStyle = 'border-red-600 bg-red-600 text-white';
                    textStyle = 'text-red-950 font-black';
                  }
                } else if (isSelected) {
                  cardStyle = 'border-blue-600 bg-blue-50/90 shadow-xs ring-2 ring-blue-500/20';
                  badgeStyle = 'border-blue-700 bg-blue-700 text-white';
                  textStyle = 'text-blue-950 font-black';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAnswerSelect(currentQuestion.id, idx)}
                    className={`w-full text-left p-3.5 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 sm:gap-4 group active:scale-[0.99] min-h-[56px] ${cardStyle}`}
                  >
                    {/* Option Letter Badge */}
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border-2 flex items-center justify-center shrink-0 font-black text-sm sm:text-base transition-colors ${badgeStyle}`}>
                      {letter}
                    </div>

                    {/* Option Text */}
                    <span className={`text-base sm:text-xl font-bold flex-1 leading-normal ${textStyle}`}>
                      {option}
                    </span>

                    {/* Radio Check Circle */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isChecked && isCorrectOpt
                        ? 'border-emerald-600 bg-emerald-600'
                        : isChecked && isSelected && !isCorrectOpt
                        ? 'border-red-600 bg-red-600'
                        : isSelected
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-slate-300'
                    }`}>
                      {(isSelected || (isChecked && isCorrectOpt)) && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Instant Check Callout if Checked */}
            {checkedQuestionIds[currentQuestion.id] && (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-1.5 text-sm animate-in fade-in duration-150">
                <div className="font-black text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    सही उत्तर: विकल्प ({optionLetters[currentQuestion.correctOption] || 'A'}) —{' '}
                    {currentQuestion.options?.[currentQuestion.correctOption] || ''}
                  </span>
                </div>
                {currentQuestion.explanation && (
                  <p className="text-slate-700 font-semibold text-xs sm:text-sm pl-6">
                    💡 व्याख्या: {currentQuestion.explanation}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Bottom Navigation & Fast Check Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="px-4 sm:px-5 py-3 rounded-xl font-black text-xs sm:text-sm bg-slate-100 text-slate-800 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>पिछला</span>
            </button>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                type="button"
                onClick={() =>
                  setCheckedQuestionIds((prev) => ({
                    ...prev,
                    [currentQuestion.id]: !prev[currentQuestion.id],
                  }))
                }
                className={`px-4 py-3 rounded-xl font-black text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  checkedQuestionIds[currentQuestion.id]
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{checkedQuestionIds[currentQuestion.id] ? 'उत्तर छुपाएं' : '✓ उत्तर जांचें (Check)'}</span>
              </button>

              <button
                type="button"
                onClick={() => submitTest(selectedAnswers)}
                className="px-4 py-3 rounded-xl font-black text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>⚡ सबमिट और चेक करें ({answeredCount}/{questions.length})</span>
              </button>
            </div>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                type="button"
                onClick={() => submitTest(selectedAnswers)}
                className="px-5 sm:px-6 py-3 rounded-xl font-black text-xs sm:text-sm bg-emerald-700 hover:bg-emerald-800 text-white transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <span>अंतिम सबमिट</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 sm:px-6 py-3 rounded-xl font-black text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <span>अगला प्रश्न</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column / Desktop Sidebar: Question Palette & Test Status (4 Cols on Desktop) */}
        <div className={`lg:col-span-4 space-y-5 ${showMobilePalette ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-blue-700" />
                <span>प्रश्न ग्रिड (Question Palette)</span>
              </h3>
              <span className="text-xs font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                कुल: {questions.length}
              </span>
            </div>

            {/* Status Indicators */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-200">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                <span>उत्तर दिया: {answeredCount}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 text-slate-800 p-2.5 rounded-xl border border-slate-200">
                <div className="w-3.5 h-3.5 rounded-full bg-slate-400" />
                <span>बाकी: {unansweredCount}</span>
              </div>
            </div>

            {/* Clickable Question Palette Grid */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                सीधे किसी भी प्रश्न पर जाएं:
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2 max-h-[280px] overflow-y-auto p-1 pr-2">
                {(questions || []).map((q, idx) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isCurrent = currentQuestionIndex === idx;

                  let btnStyle = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
                  if (isCurrent) {
                    btnStyle = 'bg-blue-600 text-white font-black ring-4 ring-blue-500/20 shadow-sm';
                  } else if (isAnswered) {
                    btnStyle = 'bg-emerald-600 text-white font-bold shadow-xs';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleJumpToQuestion(idx)}
                      className={`h-10 rounded-xl font-black text-sm flex items-center justify-center transition-all cursor-pointer border ${btnStyle}`}
                      title={`प्रश्न ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Big Submit Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={confirmSubmit}
                className="w-full py-3.5 rounded-xl font-black text-base bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Test समाप्त और जमा करें</span>
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full mt-2 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                टेस्ट रद्द करें और बाहर निकलें
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-900">क्या आप Test जमा करना चाहते हैं?</h3>
              <p className="text-slate-600 font-bold text-base">
                आपने <span className="text-emerald-700 font-black">{answeredCount}</span> / {questions.length} प्रश्नों के उत्तर दिए हैं।
                {unansweredCount > 0 && (
                  <span className="text-amber-700 block text-sm mt-1">
                    ⚠️ {unansweredCount} प्रश्न अभी बिना उत्तर दिए बाकी हैं।
                  </span>
                )}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 py-3 rounded-xl font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
              >
                और हल करें
              </button>
              <button
                type="button"
                onClick={() => submitTest(selectedAnswers)}
                className="flex-1 py-3 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition-all active:scale-95"
              >
                हाँ, जमा करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Test Result Component ---
function TestResultView({
  resultId,
  onBack,
  onRetake,
}: {
  resultId: string;
  onBack: (targetTest?: TestItem) => void;
  onRetake?: (targetTest: TestItem) => void;
}) {
  const [result, setResult] = useState<any>(null);
  const [test, setTest] = useState<TestItem | null>(null);

  useEffect(() => {
    const data = localStorage.getItem(`rk_test_result_${resultId}`);
    if (data) {
      const parsed = JSON.parse(data);
      setResult(parsed);
      const staticTest = getStaticTestById(parsed.testId) || TESTS.find((t) => t.id === parsed.testId);
      if (staticTest) {
        setTest(staticTest);
      } else {
        getTestById(parsed.testId).then((t) => {
          if (t) setTest(t);
        });
      }
    }
  }, [resultId]);

  if (!result) return <div className="p-10 text-center text-lg font-bold">परिणाम लोड हो रहा है...</div>;

  if (!test) return <div className="p-10 text-center text-lg font-bold">टेस्ट लोड हो रहा है...</div>;

  const questions = test.questions && test.questions.length > 0
    ? [...test.questions].sort((a, b) => a.order - b.order)
    : TEST_QUESTIONS.filter((q) => q.testId === test.id).sort((a, b) => a.order - b.order);
  const percentage = (result.score / result.totalMarks) * 100;
  const isPassed = result.score >= test.passingMarks;

  const handleRetake = () => {
    if (onRetake) {
      onRetake(test);
      return;
    }
    const sub = SUBJECTS.find(s => s.id === test.subjectId);
    const book = BOOKS.find(b => b.id === test.bookId);
    const ch = CHAPTERS.find(c => c.id === test.chapterId);
    const subSlug = sub?.slug || test.subjectId;
    const bookSlug = book?.slug || test.bookId;
    const chSlug = ch?.slug || test.chapterId;
    window.location.hash = `tests/${test.classLevel}/${subSlug}/${bookSlug}/${chSlug}/test/${test.id}`;
  };

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto w-full px-3 sm:px-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={() => onBack(test)}
          className="px-4 py-2.5 rounded-xl text-sm font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>टेस्ट सूची पर वापस जाएं</span>
        </button>

        <div className="flex items-center gap-2">
          <a
            href="#my-progress"
            className="px-4 py-2.5 rounded-xl text-sm font-black bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>📊 मेरी प्रगति देखें</span>
          </a>

          <button
            onClick={handleRetake}
            className="px-4 py-2.5 rounded-xl text-sm font-black bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>पुनः टेस्ट दें</span>
          </button>
        </div>
      </div>

      {/* Result Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-slate-200 shadow-sm text-center space-y-6">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-sm ${
          isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        }`}>
          {isPassed ? <Award className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
        </div>
        
        <div className="space-y-2">
          <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
            isPassed ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {isPassed ? '🎉 उत्तीर्ण (Passed) - शानदार प्रदर्शन!' : 'अभ्यास की आवश्यकता (Needs Practice)'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{test.title}</h2>
          <p className="text-slate-600 font-bold text-sm sm:text-base">RK STUDY CENTRE ऑनलाइन टेस्ट रिपोर्ट</p>
        </div>

        {/* Score and Percentage Display */}
        <div className="flex items-center justify-center gap-8 py-6 border-y-2 border-slate-100">
          <div className="text-center">
            <div className={`text-3xl sm:text-5xl font-black tabular-nums ${isPassed ? 'text-emerald-700' : 'text-red-700'}`}>
              {result.score} <span className="text-xl sm:text-2xl text-slate-400 font-bold">/ {result.totalMarks}</span>
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-500 uppercase mt-1">कुल प्राप्त अंक</div>
          </div>
          <div className="w-px h-16 bg-slate-200" />
          <div className="text-center">
            <div className="text-3xl sm:text-5xl font-black text-slate-900 tabular-nums">{percentage.toFixed(0)}%</div>
            <div className="text-xs sm:text-sm font-black text-slate-500 uppercase mt-1">सफलता प्रतिशत</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-xl mx-auto">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-black text-emerald-700">{result.correctAnswers}</div>
            <div className="text-xs font-black text-emerald-600 uppercase mt-0.5">सही उत्तर</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-black text-red-700">{result.incorrectAnswers}</div>
            <div className="text-xs font-black text-red-600 uppercase mt-0.5">गलत उत्तर</div>
          </div>
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-black text-slate-700">{result.unattempted}</div>
            <div className="text-xs font-black text-slate-500 uppercase mt-0.5">छोड़े गए</div>
          </div>
        </div>
      </div>

      {/* Detailed Question and Explanation Review */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            विस्तृत उत्तर एवं व्याख्या समीक्षा ({questions.length} प्रश्न)
          </h3>
        </div>

        <div className="space-y-5">
          {(questions || []).map((q, i) => {
            const studentAns = result.studentAnswers[q.id];
            const isCorrect = studentAns === q.correctOption;
            const isUnattempted = studentAns === undefined;

            return (
              <div key={q.id} className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-200 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-black text-sm">
                      {i + 1}
                    </span>
                    <span className={`text-xs font-black px-3 py-1 rounded-md uppercase ${
                      isCorrect ? 'bg-emerald-100 text-emerald-800' : isUnattempted ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-800'
                    }`}>
                      {isCorrect ? '✓ सही उत्तर' : isUnattempted ? 'छोड़ा गया' : '✗ गलत उत्तर'}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-400">
                    अंक: {q.marks}
                  </div>
                </div>
                
                <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">{q.question}</h4>
                
                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(q.options || []).map((opt, optIdx) => {
                    const isStudentChoice = studentAns === optIdx;
                    const isActualCorrect = q.correctOption === optIdx;
                    
                    let bgClass = "bg-slate-50 border-slate-200 text-slate-700";
                    if (isActualCorrect) bgClass = "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 font-black";
                    else if (isStudentChoice && !isActualCorrect) bgClass = "bg-red-50 border-red-400 text-red-950 font-bold";

                    return (
                      <div key={optIdx} className={`p-3.5 rounded-xl border-2 text-sm sm:text-base ${bgClass} flex items-center justify-between gap-2`}>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-black/5 flex items-center justify-center font-bold text-xs">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isStudentChoice && isActualCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                        {isStudentChoice && !isActualCorrect && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
                        {!isStudentChoice && isActualCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 opacity-60 shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {(q as any).explanation && (
                  <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm text-amber-950 font-medium space-y-1">
                    <span className="font-black text-amber-900 block flex items-center gap-1.5">
                      💡 विस्तृत व्याख्या (Explanation):
                    </span>
                    <p className="leading-relaxed">{(q as any).explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

