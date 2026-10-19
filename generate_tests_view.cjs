const fs = require('fs');

const testsViewCode = `
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
  ListOrdered
} from 'lucide-react';
import type {
  ClassLevel,
  MainNavRoute,
  MoreSectionTab,
  TestItem,
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

interface TestsViewProps {
  initialClass?: ClassLevel;
  initialSubjectSlug?: string;
  initialBookSlug?: string;
  initialChapterSlug?: string;
  urlParts?: string[];
  onNavigate: (route: MainNavRoute, params?: { classLevel?: ClassLevel; subjectSlug?: string; bookSlug?: string; chapterSlug?: string; moreTab?: MoreSectionTab }) => void;
}

export function TestsView({
  initialClass = 'class-10',
  initialSubjectSlug,
  initialBookSlug,
  initialChapterSlug,
  urlParts = [],
  onNavigate
}: TestsViewProps) {
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(initialClass);
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState<string | undefined>(initialSubjectSlug);
  const [selectedBookSlug, setSelectedBookSlug] = useState<string | undefined>(initialBookSlug);
  const [selectedChapterSlug, setSelectedChapterSlug] = useState<string | undefined>(initialChapterSlug);
  
  // Custom routing states inside TestsView
  const [activeTestId, setActiveTestId] = useState<string | undefined>(undefined);
  const [testPhase, setTestPhase] = useState<'instructions' | 'playing' | 'result'>('instructions');
  const [activeResultId, setActiveResultId] = useState<string | undefined>(undefined);

  // Sync state if props change from URL
  useEffect(() => {
    setSelectedClass(initialClass);
    setSelectedSubjectSlug(initialSubjectSlug);
    setSelectedBookSlug(initialBookSlug);
    setSelectedChapterSlug(initialChapterSlug);
    
    // Check if URL has test ID
    // Pattern: tests/class-10/hindi/godhuli/chapter-01/test/test-id
    if (urlParts.length >= 7 && urlParts[5] === 'test') {
      setActiveTestId(urlParts[6]);
      // If we only have test ID, maybe it's fresh load
      if (!testPhase) setTestPhase('instructions');
    } else if (urlParts.length >= 3 && urlParts[1] === 'result') {
      // Pattern: tests/result/result-id
      setActiveResultId(urlParts[2]);
      setActiveTestId(undefined);
      setTestPhase('result');
    } else {
      setActiveTestId(undefined);
      setActiveResultId(undefined);
    }
  }, [initialClass, initialSubjectSlug, initialBookSlug, initialChapterSlug, urlParts]);

  const currentClassMeta = CLASSES_METADATA.find((c) => c.id === selectedClass) || CLASSES_METADATA[1];
  const classSubjects = SUBJECTS.filter((s) => s.classLevel === selectedClass);
  const selectedSubject = selectedSubjectSlug ? classSubjects.find((s) => s.slug === selectedSubjectSlug) : undefined;
  const subjectBooks = selectedSubject ? BOOKS.filter((b) => b.subjectId === selectedSubject.id) : [];
  const selectedBook = selectedBookSlug ? subjectBooks.find((b) => b.slug === selectedBookSlug) : undefined;
  const bookChapters = selectedBook ? CHAPTERS.filter((c) => c.bookId === selectedBook.id) : [];
  const selectedChapter = selectedChapterSlug ? bookChapters.find((c) => c.slug === selectedChapterSlug) : undefined;
  const activeTest = activeTestId ? TESTS.find((t) => t.id === activeTestId) : undefined;

  const [isLoadingTests, setIsLoadingTests] = useState<boolean>(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [chapterTests, setChapterTests] = useState<TestItem[]>([]);

  // Fetch tests for the chapter
  useEffect(() => {
    if (selectedChapter && selectedClass && selectedSubject && selectedBook && !activeTestId && !activeResultId) {
      setIsLoadingTests(true);
      setTestError(null);
      
      const timer = setTimeout(() => {
        try {
          const tests = TESTS.filter(t => 
            t.classLevel === selectedClass && 
            t.subjectId === selectedSubject.id && 
            t.bookId === selectedBook.id && 
            t.chapterId === selectedChapter.id
          );
          setChapterTests(tests);
          setIsLoadingTests(false);
        } catch (err) {
          console.error('Error loading tests:', err);
          setTestError("Test लोड नहीं हो पाया। कृपया कुछ समय बाद फिर प्रयास करें।");
          setIsLoadingTests(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setChapterTests([]);
    }
  }, [selectedChapter, selectedClass, selectedSubject, selectedBook, activeTestId, activeResultId]);

  const navigateToLocal = (path: string) => {
    window.location.hash = path;
  };

  const handleSelectClass = (cls: ClassLevel) => {
    onNavigate('tests', { classLevel: cls });
  };
  const handleSelectSubject = (subjectSlug: string) => {
    onNavigate('tests', { classLevel: selectedClass, subjectSlug });
  };
  const handleSelectBook = (bookSlug: string) => {
    onNavigate('tests', { classLevel: selectedClass, subjectSlug: selectedSubjectSlug, bookSlug });
  };
  const handleSelectChapter = (chapterSlug: string) => {
    onNavigate('tests', { classLevel: selectedClass, subjectSlug: selectedSubjectSlug, bookSlug: selectedBookSlug, chapterSlug });
  };
  const handleStartTest = (testId: string) => {
    navigateToLocal(\`tests/\${selectedClass}/\${selectedSubjectSlug}/\${selectedBookSlug}/\${selectedChapterSlug}/test/\${testId}\`);
  };

  const handleBackToSubjects = () => { onNavigate('tests', { classLevel: selectedClass }); };
  const handleBackToBooks = () => { onNavigate('tests', { classLevel: selectedClass, subjectSlug: selectedSubjectSlug }); };
  const handleBackToChapters = () => { onNavigate('tests', { classLevel: selectedClass, subjectSlug: selectedSubjectSlug, bookSlug: selectedBookSlug }); };
  const handleBackToTestsList = () => { onNavigate('tests', { classLevel: selectedClass, subjectSlug: selectedSubjectSlug, bookSlug: selectedBookSlug, chapterSlug: selectedChapterSlug }); };

  // Sub-components for test player and result
  
  if (activeResultId) {
    return <TestResultView resultId={activeResultId} onBack={() => handleBackToTestsList()} />;
  }

  if (activeTest && testPhase === 'playing') {
    return <TestPlayer test={activeTest} onFinish={(resultId) => navigateToLocal(\`tests/result/\${resultId}\`)} onCancel={handleBackToTestsList} />;
  }

  if (activeTest && testPhase === 'instructions') {
    return (
      <div className="space-y-8 py-6">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handleBackToTestsList}
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
              <span className="bg-slate-100 px-3 py-1 rounded-md">{selectedSubject?.hindiName}</span>
              <span className="bg-slate-100 px-3 py-1 rounded-md">{selectedBook?.hindiTitle || selectedBook?.title}</span>
              <span className="bg-slate-100 px-3 py-1 rounded-md">अध्याय {selectedChapter?.chapterNumber}</span>
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
              <div className="text-xl font-black text-slate-900">{activeTest.durationMinutes > 0 ? \`\${activeTest.durationMinutes} min\` : 'असीमित'}</div>
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
              onClick={() => setTestPhase('playing')}
              className="px-10 py-4 rounded-2xl text-lg font-black bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95 inline-flex items-center gap-3"
            >
              <Play className="w-5 h-5 fill-current" />
              Test शुरू करें
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Selection UI ---
  const isInvalidSubject = selectedSubjectSlug && !selectedSubject;
  const isInvalidBook = selectedBookSlug && selectedSubject && !selectedBook;
  const isInvalidChapter = selectedChapterSlug && selectedBook && !selectedChapter;

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
        <div className="text-sm font-bold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-2xs">
          प्रदर्शित कक्षा: <span className="text-blue-800 font-extrabold">{currentClassMeta.hindiName} ({currentClassMeta.name})</span>
        </div>
      </div>

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
                className={\`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer shadow-xs \${
                  isSelected ? 'border-blue-700 bg-blue-50/90 ring-4 ring-blue-600/15' : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                }\`}
              >
                <div className="flex items-center justify-between">
                  <span className={\`text-lg sm:text-xl font-black \${isSelected ? 'text-blue-900' : 'text-slate-900'}\`}>{cls.hindiName}</span>
                  <span className={\`text-xs font-bold px-2.5 py-1 rounded-md \${isSelected ? 'bg-blue-200 text-blue-900' : 'bg-slate-100 text-slate-700'}\`}>{cls.name}</span>
                </div>
                <div className={\`text-sm mt-1.5 font-bold truncate \${isSelected ? 'text-blue-800' : 'text-slate-600'}\`}>{cls.totalSubjects} मुख्य विषय</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Breadcrumbs */}
      {(selectedSubject || selectedChapter || selectedBook) && (
        <nav className="flex items-center gap-2.5 text-sm sm:text-base text-slate-700 bg-slate-100 px-5 py-3 rounded-2xl flex-wrap font-bold border border-slate-200">
          <button onClick={() => handleBackToSubjects()} className="font-black text-blue-800 hover:underline cursor-pointer">{currentClassMeta.hindiName}</button>
          {selectedSubject && (
            <>
              <ChevronRight className="w-5 h-5 text-slate-400 stroke-[2.5]" />
              <button onClick={() => handleBackToBooks()} className={\`font-bold cursor-pointer \${!selectedBook ? 'text-slate-900 font-black' : 'text-blue-800 hover:underline'}\`}>
                {selectedSubject.hindiName}
              </button>
            </>
          )}
          {selectedBook && (
            <>
              <ChevronRight className="w-5 h-5 text-slate-400 stroke-[2.5]" />
              <button onClick={() => handleBackToChapters()} className={\`font-bold cursor-pointer \${!selectedChapter ? 'text-slate-900 font-black' : 'text-blue-800 hover:underline'}\`}>
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

      {/* Main Content Areas */}
      <div className="space-y-8">
        
        {/* Step 1: Subjects List */}
        {!selectedSubject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">विषय चुनें</h2>
                <p className="text-slate-700 text-sm sm:text-base font-medium mt-1">टेस्ट देखने के लिए विषय का चयन करें।</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {classSubjects.map((sub) => (
                <div key={sub.id} onClick={() => handleSelectSubject(sub.slug)} className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                      <BookOpen className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">{sub.hindiName}</h3>
                      <div className="text-base font-bold text-blue-800">{sub.name}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Books List */}
        {selectedSubject && !selectedBook && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">पुस्तक चुनें</h2>
              </div>
              <button onClick={handleBackToSubjects} className="px-4 py-2 rounded-xl text-sm font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 cursor-pointer shadow-xs">
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">वापस</span>
              </button>
            </div>
            {subjectBooks.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border-2 border-slate-200 text-center"><h4 className="font-black text-slate-900 text-xl">यह सामग्री अभी उपलब्ध नहीं है।</h4></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjectBooks.map((b) => (
                  <div key={b.id} onClick={() => handleSelectBook(b.slug)} className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between">
                    <div className="font-black text-slate-900 text-xl group-hover:text-blue-700">{b.hindiTitle || b.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Chapters List */}
        {selectedBook && !selectedChapter && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">अध्याय चुनें</h2>
              </div>
              <button onClick={handleBackToBooks} className="px-4 py-2 rounded-xl text-sm font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 cursor-pointer">
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">वापस</span>
              </button>
            </div>
            {bookChapters.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border-2 border-slate-200 text-center"><h4 className="font-black text-slate-900 text-xl">यह सामग्री अभी उपलब्ध नहीं है।</h4></div>
            ) : (
              <div className="space-y-4">
                {bookChapters.map((ch) => (
                  <div key={ch.id} onClick={() => handleSelectChapter(ch.slug)} className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <span className="text-xs font-black px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 uppercase">अध्याय {ch.chapterNumber}</span>
                      <h4 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">{ch.hindiTitle || ch.title}</h4>
                    </div>
                  </div>
                ))}
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
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">इस अध्याय के लिए अभी कोई Test उपलब्ध नहीं है।</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {chapterTests.map(test => (
                  <div key={test.id} className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <span className="text-xs font-bold text-blue-800 bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-full inline-block">
                        {test.type === 'chapter_test' ? 'अध्याय Test' : test.type === 'practice_quiz' ? 'Practice Quiz' : 'Objective Test'}
                      </span>
                      <h3 className="text-xl font-black text-slate-900 leading-snug">{test.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-600">
                        <div className="flex items-center gap-1.5"><ListOrdered className="w-4 h-4 text-slate-400" />{test.totalQuestions} प्रश्न</div>
                        <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" />{test.durationMinutes > 0 ? \`\${test.durationMinutes} मिनट\` : 'असीमित'}</div>
                        <div className="flex items-center gap-1.5"><Award className="w-4 h-4 text-slate-400" />{test.totalMarks} अंक</div>
                      </div>
                    </div>
                    <button onClick={() => handleStartTest(test.id)} className="w-full px-5 py-3 rounded-xl text-base font-black bg-slate-900 hover:bg-blue-600 text-white transition-colors shadow-sm inline-flex items-center justify-center gap-2 cursor-pointer">
                      Test देखें <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
           </div>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/views/TestsView.tsx', testsViewCode);
