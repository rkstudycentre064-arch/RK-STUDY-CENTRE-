
import { useState, useEffect } from 'react';
import {
  BookOpen,
  ChevronRight,
  ArrowLeft,
  FolderOpen,
  Loader2,
  AlertCircle,
  FileText,
  Download,
  Eye,
  Sparkles,
  Award,
  CheckCircle2,
  Share2
} from 'lucide-react';
import type {
  ClassLevel,
  MainNavRoute,
  MoreSectionTab,
  Chapter
} from '../types';
import {
  CLASSES_METADATA,
  SUBJECTS,
  BOOKS,
  CHAPTERS,
  STUDY_MATERIALS,
  TESTS
} from '../lib/constants';
import { BackButton } from '../components/BackButton';
import { BigLetterPhysicsNotesViewer } from '../components/notes/BigLetterPhysicsNotesViewer';
import { InAppPDFViewerModal, PDFDocumentData } from '../components/notes/InAppPDFViewerModal';
import { ShareNotesModal } from '../components/notes/ShareNotesModal';
import { DownloadNotesModal } from '../components/notes/DownloadNotesModal';
import { resolveUniversalNotesData } from '../utils/materialNotesMapper';
import { toggleChapterCompletion, PROGRESS_UPDATED_EVENT } from '../services/progressService';

interface ClassesViewProps {
  initialClass?: ClassLevel;
  initialSubjectSlug?: string;
  initialBookSlug?: string;
  initialChapterSlug?: string;
  onNavigate: (route: MainNavRoute, params?: { classLevel?: ClassLevel; subjectSlug?: string; bookSlug?: string; chapterSlug?: string; testId?: string; moreTab?: MoreSectionTab }) => void;
}

export function ClassesView({
  initialClass = 'class-10',
  initialSubjectSlug,
  initialBookSlug,
  initialChapterSlug,
  onNavigate
}: ClassesViewProps) {
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(initialClass);
  const [selectedStream, setSelectedStream] = useState<'all' | 'Science' | 'Arts' | 'Commerce'>('all');
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState<string | undefined>(initialSubjectSlug);
  const [selectedBookSlug, setSelectedBookSlug] = useState<string | undefined>(initialBookSlug);
  const [selectedChapterSlug, setSelectedChapterSlug] = useState<string | undefined>(initialChapterSlug);
  const [showPhysicsNotesModal, setShowPhysicsNotesModal] = useState<boolean>(false);
  const [showChapterShareModal, setShowChapterShareModal] = useState<boolean>(false);
  const [downloadNotesData, setDownloadNotesData] = useState<any>(null);
  const [pdfViewerData, setPdfViewerData] = useState<PDFDocumentData | null>(null);
  const [completedChapterIds, setCompletedChapterIds] = useState<string[]>([]);

  const refreshCompletedChapters = () => {
    try {
      const raw = localStorage.getItem('rk_completed_chapters_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCompletedChapterIds(parsed.map((c: any) => c.chapterId));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshCompletedChapters();
    window.addEventListener(PROGRESS_UPDATED_EVENT, refreshCompletedChapters);
    return () => window.removeEventListener(PROGRESS_UPDATED_EVENT, refreshCompletedChapters);
  }, []);

  const handleToggleChapter = async (chapter: Chapter) => {
    await toggleChapterCompletion(chapter, selectedClass, selectedSubject);
    refreshCompletedChapters();
  };

  // Sync state if props change from URL
  useEffect(() => {
    setSelectedClass(initialClass);
    setSelectedSubjectSlug(initialSubjectSlug);
    setSelectedBookSlug(initialBookSlug);
    setSelectedChapterSlug(initialChapterSlug);
  }, [initialClass, initialSubjectSlug, initialBookSlug, initialChapterSlug]);

  const currentClassMeta = CLASSES_METADATA.find((c) => c.id === selectedClass) || CLASSES_METADATA[1];

  const classSubjects = SUBJECTS.filter((s) => s.classLevel === selectedClass);
  const visibleSubjects = classSubjects.filter((s) => {
    if (!currentClassMeta.streamSupported || selectedStream === 'all') return true;
    if (selectedStream === 'Science') return s.stream === 'Science' || s.stream === 'General';
    if (selectedStream === 'Arts') return s.stream === 'Arts' || s.stream === 'General';
    if (selectedStream === 'Commerce') return s.stream === 'Commerce' || s.stream === 'General';
    return true;
  });

  const selectedSubject = selectedSubjectSlug
    ? classSubjects.find(
        (s) =>
          s.slug.toLowerCase() === selectedSubjectSlug.toLowerCase() ||
          s.id.toLowerCase() === selectedSubjectSlug.toLowerCase() ||
          s.name.toLowerCase().replace(/\s+/g, '-') === selectedSubjectSlug.toLowerCase()
      )
    : undefined;
  
  const subjectBooks = selectedSubject ? BOOKS.filter((b) => b.subjectId === selectedSubject.id) : [];
  const selectedBook = selectedBookSlug 
    ? subjectBooks.find((b) => b.slug === selectedBookSlug) 
    : (subjectBooks.length === 1 ? subjectBooks[0] : undefined);
  
  // All chapters for the selected subject across all its books
  const allSubjectChapters = selectedSubject 
    ? CHAPTERS.filter((c) => c.subjectId === selectedSubject.id) 
    : [];

  // Visible chapters based on active book filter (or all subject chapters if 'all' is selected)
  const visibleChapters = selectedBookSlug 
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

  const handleSelectClass = (cls: ClassLevel) => {
    onNavigate('classes', { classLevel: cls });
  };

  const handleSelectSubject = (subjectSlug: string) => {
    onNavigate('classes', { classLevel: selectedClass, subjectSlug });
  };

  const handleSelectBook = (bookSlug: string) => {
    onNavigate('classes', { 
      classLevel: selectedClass, 
      subjectSlug: selectedSubjectSlug, 
      bookSlug: bookSlug || undefined 
    });
  };

  const handleSelectChapter = (chapterSlug: string, bookSlug?: string) => {
    const resolvedBookSlug = bookSlug || selectedBookSlug || selectedBook?.slug;
    onNavigate('classes', { 
      classLevel: selectedClass, 
      subjectSlug: selectedSubjectSlug, 
      bookSlug: resolvedBookSlug, 
      chapterSlug 
    });
  };

  const handleBackToSubjects = () => {
    onNavigate('classes', { classLevel: selectedClass });
  };

  const handleBackToBooks = () => {
    onNavigate('classes', { classLevel: selectedClass, subjectSlug: selectedSubjectSlug });
  };

  const handleBackToChapters = () => {
    onNavigate('classes', { 
      classLevel: selectedClass, 
      subjectSlug: selectedSubjectSlug, 
      bookSlug: selectedBookSlug 
    });
  };

  // Validations for bad URLs
  const isInvalidSubject = selectedSubjectSlug && !selectedSubject;
  const isInvalidBook = selectedBookSlug && selectedSubject && !selectedBook;
  const isInvalidChapter = selectedChapterSlug && selectedSubject && !selectedChapter;

  if (isInvalidSubject || isInvalidBook || isInvalidChapter) {
    return (
      <div className="space-y-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <BackButton
            label="मुख्य पृष्ठ पर वापस जाएं"
            fallbackRoute="home"
            onNavigate={onNavigate}
          />
        </div>
        <div className="bg-white rounded-3xl p-10 sm:p-16 border-2 border-slate-200 text-center space-y-5 shadow-sm">
          <FolderOpen className="w-16 h-16 text-slate-400 mx-auto" />
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
            यह सामग्री अभी उपलब्ध नहीं है।
          </h3>
          <p className="text-slate-600 text-base sm:text-lg font-medium max-w-lg mx-auto leading-relaxed">
            आपके द्वारा खोजी गई कक्षा, विषय, पुस्तक या अध्याय इस समय सिस्टम में मौजूद नहीं है। कृपया सही विकल्प चुनें।
          </p>
          <button
            onClick={() => onNavigate('classes', { classLevel: selectedClass })}
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
        <BackButton
          label="मुख्य पृष्ठ पर वापस जाएं"
          fallbackRoute="home"
          onNavigate={onNavigate}
        />
        <div className="text-sm font-bold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-2xs">
          प्रदर्शित कक्षा: <span className="text-blue-800 font-extrabold">{currentClassMeta.hindiName} ({currentClassMeta.name})</span>
        </div>
      </div>

      {/* Class Selection Tabs */}
      <div className="bg-white rounded-3xl p-7 sm:p-8 border-2 border-slate-200 shadow-sm space-y-7">
        <div className="space-y-2">
          <span className="text-sm font-black text-blue-700 uppercase tracking-widest">
            पाठ्यक्रम संरचना
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900">
            कक्षाएं (Classes)
          </h1>
          <p className="text-slate-700 text-base sm:text-lg font-medium max-w-3xl leading-relaxed">
            प्रत्येक कक्षा के लिए अलग-अलग विषय, पाठ्यपुस्तकें, अध्याय, अध्ययन सामग्री और टेस्ट पूर्णतः अलग रखे गए हैं।
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
                  isSelected
                    ? 'border-blue-700 bg-blue-50/90 ring-4 ring-blue-600/15'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-lg sm:text-xl font-black ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                    {cls.hindiName}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${isSelected ? 'bg-blue-200 text-blue-900' : 'bg-slate-100 text-slate-700'}`}>
                    {cls.name}
                  </span>
                </div>
                <div className={`text-sm mt-1.5 font-bold truncate ${isSelected ? 'text-blue-800' : 'text-slate-600'}`}>
                  {cls.totalSubjects} मुख्य विषय
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Breadcrumbs */}
      {(selectedSubject || selectedChapter || selectedBook) && (
        <nav className="flex items-center gap-2.5 text-sm sm:text-base text-slate-700 bg-slate-100 px-5 py-3 rounded-2xl flex-wrap font-bold border border-slate-200">
          <button
            onClick={() => handleBackToSubjects()}
            className="font-black text-blue-800 hover:underline cursor-pointer"
          >
            {currentClassMeta.hindiName}
          </button>
          
          {selectedSubject && (
            <>
              <ChevronRight className="w-5 h-5 text-slate-400 stroke-[2.5]" />
              <button
                onClick={() => handleBackToBooks()}
                className={`font-bold cursor-pointer ${
                  !selectedBook ? 'text-slate-900 font-black' : 'text-blue-800 hover:underline'
                }`}
              >
                {selectedSubject.hindiName}
              </button>
            </>
          )}

          {selectedBook && (
            <>
              <ChevronRight className="w-5 h-5 text-slate-400 stroke-[2.5]" />
              <button
                onClick={() => handleBackToChapters()}
                className={`font-bold cursor-pointer ${
                  !selectedChapter ? 'text-slate-900 font-black' : 'text-blue-800 hover:underline'
                }`}
              >
                {selectedBook.hindiTitle || selectedBook.title}
              </button>
            </>
          )}

          {selectedChapter && (
            <>
              <ChevronRight className="w-5 h-5 text-slate-400 stroke-[2.5]" />
              <span className="font-black text-slate-900 truncate">
                अध्याय {selectedChapter.chapterNumber}
              </span>
            </>
          )}
        </nav>
      )}

      {/* Main Content Areas */}
      <div className="space-y-8">
        
        {/* Step 1: Subjects List */}
        {!selectedSubject && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {currentClassMeta.hindiName} के विषय ({currentClassMeta.name})
                </h2>
                <p className="text-slate-700 text-sm sm:text-base font-medium mt-1">
                  पुस्तकों और अध्यायों को देखने के लिए किसी भी विषय पर क्लिक करें।
                </p>
              </div>
              <span className="text-sm font-extrabold text-blue-900 bg-blue-100 border border-blue-200 px-4 py-1.5 rounded-full self-start sm:self-auto">
                {visibleSubjects.length} विषय उपलब्ध
              </span>
            </div>

            {/* Stream Filter Bar for Classes with Stream Support (Class 11 & Class 12) */}
            {currentClassMeta.streamSupported && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedStream('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                    selectedStream === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  सभी विषय (All)
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
                  Science (विज्ञान संकाय)
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
                  Arts (कला संकाय)
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
                  Commerce (वाणिज्य संकाय)
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(visibleSubjects || []).map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => handleSelectSubject(sub.slug)}
                  className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
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
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                        {sub.hindiName}
                      </h3>
                      <div className="text-base font-bold text-blue-800">
                        {sub.name}
                      </div>
                      <p className="text-slate-700 text-sm sm:text-base font-medium pt-1 line-clamp-2 leading-relaxed">
                        {sub.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600 font-semibold">
                    <span>{sub.totalChapters} अध्याय</span>
                    <span className="font-extrabold text-blue-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      विषय का अध्ययन करें →
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
                  {selectedSubject.hindiName} ({selectedSubject.name}) के अध्याय
                </h2>
                <p className="text-slate-700 text-sm sm:text-base font-medium mt-1">
                  अध्ययन सामग्री एवं टेस्ट देखने के लिए किसी भी अध्याय पर क्लिक करें।
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

            {/* Book Filter Tabs for Multi-Book Subjects (e.g. Physics, Chemistry, Geography, etc.) */}
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
                          {completedChapterIds.includes(ch.id) && (
                            <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>पूर्ण (Completed)</span>
                            </span>
                          )}
                          {parentBook && subjectBooks.length > 1 && (
                            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                              {parentBook.hindiTitle || parentBook.title}
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
                      <div className="shrink-0 flex items-center gap-2">
                        <span className="px-4 py-2 rounded-xl text-sm font-extrabold bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">
                          सामग्री एवं टेस्ट देखें →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Chapter Options */}
        {selectedChapter && (
           <div className="space-y-6">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 uppercase">
                    अध्याय {selectedChapter.chapterNumber}
                  </span>
                  {(() => {
                    const chapterBook = BOOKS.find((b) => b.id === selectedChapter.bookId);
                    return chapterBook ? (
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                        {chapterBook.hindiTitle || chapterBook.title}
                      </span>
                    ) : null;
                  })()}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {selectedChapter.hindiTitle || selectedChapter.title}
                </h2>
                <div className="text-sm sm:text-base font-bold text-slate-600">
                  {selectedChapter.title}
                </div>
                <p className="text-slate-700 text-sm sm:text-base font-medium mt-1">
                  आप इस अध्याय के लिए क्या देखना चाहते हैं?
                </p>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-center">
                <button
                  onClick={() => handleToggleChapter(selectedChapter)}
                  className={`px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 cursor-pointer shadow-xs transition-all ${
                    completedChapterIds.includes(selectedChapter.id)
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  }`}
                  title="अपनी अध्ययन प्रगति में यह अध्याय मार्क करें"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {completedChapterIds.includes(selectedChapter.id)
                      ? '✓ अध्याय पूर्ण है'
                      : 'अध्याय पूर्ण चिह्नित करें'}
                  </span>
                </button>

                <button
                  onClick={handleBackToChapters}
                  className="px-4 py-2 rounded-xl text-sm font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                  <span>अध्यायों पर वापस</span>
                </button>
              </div>
            </div>
            
            {/* Highlighted Big Letter Notes Banner for Class 10 Physics, Biology, Geography and Civics Chapters */}
            {(selectedChapter.id === 'ch-c10-sci-phy-01' ||
              selectedChapter.id === 'ch-c10-sci-phy-02' ||
              selectedChapter.id === 'ch-c10-sci-phy-03' ||
              selectedChapter.id === 'ch-c10-sci-phy-04' ||
              selectedChapter.id === 'ch-c10-sci-phy-05' ||
              selectedChapter.id === 'ch-c10-sci-bio-01' ||
              selectedChapter.id === 'ch-c10-soc-geo-02' ||
              selectedChapter.id === 'ch-c10-soc-geo-03' ||
              selectedChapter.id === 'ch-c10-soc-geo-04' ||
              selectedChapter.id === 'ch-c10-soc-civ-01') && (
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border-2 border-blue-400/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      बड़े अक्षर शैली (Big Letter Style)
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-700/80 text-blue-100 border border-blue-400/30">
                      टॉपर हस्तलिखित नोट्स • {
                        selectedChapter.id === 'ch-c10-sci-bio-01'
                          ? '16 पृष्ठ • 15 VVI MCQs • By Prince Sir'
                          : selectedChapter.id === 'ch-c10-sci-phy-01'
                          ? '18 पृष्ठ • 66 VVI MCQs • By Prince Sir'
                          : selectedChapter.id === 'ch-c10-sci-phy-02'
                          ? '14 पृष्ठ • 94 VVI MCQs • By Prince Sir'
                          : selectedChapter.id === 'ch-c10-sci-phy-03'
                          ? '8 पृष्ठ • 63 VVI MCQs • By Prince Sir'
                          : selectedChapter.id === 'ch-c10-sci-phy-04'
                          ? '14 पृष्ठ • 114 VVI MCQs • By Prince Sir'
                          : selectedChapter.id === 'ch-c10-sci-phy-05'
                          ? '10 पृष्ठ • 63 VVI MCQs • By Prince Sir'
                          : selectedChapter.id === 'ch-c10-soc-geo-02'
                          ? '11 पृष्ठ • 73 VVI MCQs • Target Board'
                          : selectedChapter.id === 'ch-c10-soc-geo-03'
                          ? '8 पृष्ठ • 31 VVI MCQs • Target Board'
                          : selectedChapter.id === 'ch-c10-soc-civ-01'
                          ? 'Owner Verified PDF + 50 VVI MCQs • By Prince Sir'
                          : '5 पृष्ठ • 35 VVI MCQs • Target Board'
                      }
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {selectedChapter.id === 'ch-c10-sci-bio-01'
                      ? 'जैव प्रक्रम (Life Processes) - संपूर्ण हस्तलिखित नोट्स व 15 वस्तुनिष्ठ प्रश्न'
                      : selectedChapter.id === 'ch-c10-sci-phy-01'
                      ? 'प्रकाश का परावर्तन - संपूर्ण हस्तलिखित नोट्स व 66 वस्तुनिष्ठ प्रश्न'
                      : selectedChapter.id === 'ch-c10-sci-phy-02'
                      ? 'प्रकाश का अपवर्तन - संपूर्ण हस्तलिखित नोट्स व 94 वस्तुनिष्ठ प्रश्न'
                      : selectedChapter.id === 'ch-c10-sci-phy-03'
                      ? 'मानव नेत्र तथा रंगबिरंगा संसार - संपूर्ण हस्तलिखित नोट्स व 63 वस्तुनिष्ठ प्रश्न'
                      : selectedChapter.id === 'ch-c10-sci-phy-04'
                      ? 'विद्युत धारा (Electricity) - संपूर्ण हस्तलिखित नोट्स व 114 वस्तुनिष्ठ प्रश्न'
                      : selectedChapter.id === 'ch-c10-sci-phy-05'
                      ? 'विद्युत धारा के चुंबकीय प्रभाव - संपूर्ण हस्तलिखित नोट्स व 63 वस्तुनिष्ठ प्रश्न'
                      : selectedChapter.id === 'ch-c10-soc-geo-02'
                      ? 'कृषि (Agriculture) - संपूर्ण हस्तलिखित नोट्स व 73 वस्तुनिष्ठ प्रश्न'
                      : selectedChapter.id === 'ch-c10-soc-geo-03'
                      ? 'निर्माण उद्योग एवं विनिर्माण - संपूर्ण हस्तलिखित नोट्स व 31 वस्तुनिष्ठ प्रश्न'
                      : selectedChapter.id === 'ch-c10-soc-civ-01'
                      ? 'लोकतंत्र में सत्ता की साझेदारी - Owner द्वारा अपलोड की गई मूल PDF व 50 VVI वस्तुनिष्ठ प्रश्न'
                      : 'परिवहन, संचार एवं व्यापार - संपूर्ण हस्तलिखित नोट्स व 35 वस्तुनिष्ठ प्रश्न'}
                  </h3>
                  <p className="text-blue-100 text-sm sm:text-base font-medium max-w-3xl leading-relaxed">
                    {selectedChapter.id === 'ch-c10-sci-bio-01'
                      ? 'मोबाइल व टैबलेट पर आसानी से पढ़ने के लिए विशेष बड़े अक्षर (Big Letters), पोषण, प्रकाश-संश्लेषण, श्वसन, परिवहन (हृदय) एवं उत्सर्जन (नेफ्रॉन) की विस्तृत व्याख्या तथा 15 महत्वपूर्ण Objective प्रश्न।'
                      : selectedChapter.id === 'ch-c10-sci-phy-01'
                      ? 'मोबाइल व टैबलेट पर आसानी से पढ़ने के लिए विशेष बड़े अक्षर (Big Letters), स्पष्ट परिभाषाएं, किरण आरेख, f = R/2 व दर्पण सूत्र निगमन, आंकिक प्रश्न एवं 66 महत्वपूर्ण Objective प्रश्न।'
                      : selectedChapter.id === 'ch-c10-sci-phy-02'
                      ? 'मोबाइल व टैबलेट पर आसानी से पढ़ने के लिए विशेष बड़े अक्षर, अपवर्तनांक सारणी, स्नेल का नियम, लेंस के प्रकार, किरण आरेख, चिन्ह परिपाटी, लेंस की क्षमता (P=1/f), लेंस सूत्र एवं 94 महत्वपूर्ण Objective प्रश्न।'
                      : selectedChapter.id === 'ch-c10-sci-phy-03'
                      ? 'मोबाइल व टैबलेट पर आसानी से पढ़ने के लिए विशेष बड़े अक्षर, मानव नेत्र की 10 अंग संरचना, समंजन क्षमता, दृष्टि दोष (निकट, दूर, जरा, अबिंदुकता), वायुमंडलीय अपवर्तन, इंद्रधनुष, प्रकीर्णन एवं 63 महत्वपूर्ण Objective प्रश्न।'
                      : selectedChapter.id === 'ch-c10-sci-phy-04'
                      ? 'मोबाइल व टैबलेट पर आसानी से पढ़ने के लिए विशेष बड़े अक्षर, विद्युत धारा, आवेश, विभव-विभवांतर, ओम का नियम प्रायोगिक सत्यापन, प्रतिरोधकता, श्रेणीक्रम व समांतर क्रम निगमन, जूल का तापन नियम एवं 114 महत्वपूर्ण Objective प्रश्न।'
                      : selectedChapter.id === 'ch-c10-sci-phy-05'
                      ? 'मोबाइल व टैबलेट पर आसानी से पढ़ने के लिए विशेष बड़े अक्षर, चुंबकीय क्षेत्र रेखाएं, ऑयर्स्टेड प्रयोग, दक्षिण-हस्त अंगुष्ठ नियम, परिनालिका, फ्लेमिंग का वाम-हस्त व दक्षिण-हस्त नियम, विद्युत मोटर, फैराडे नियम, AC/DC एवं 63 महत्वपूर्ण Objective प्रश्न।'
                      : selectedChapter.id === 'ch-c10-soc-geo-02'
                      ? 'मोबाइल व टैबलेट पर आसानी से पढ़ने के लिए विशेष बड़े अक्षर, रबी-खरीफ-जायद फसलें, हरित क्रांति, श्वेत क्रांति, नकदी व व्यापारिक फसलें, प्रमुख कृषि राज्य एवं 73 महत्वपूर्ण Objective प्रश्न।'
                      : selectedChapter.id === 'ch-c10-soc-geo-03'
                      ? 'मोबाइल व टैबलेट पर आसानी से पढ़ने के लिए विशेष बड़े अक्षर, विनिर्माण उद्योग, स्थानीयकरण के कारक, सूती व जूट वस्त्र, लौह-इस्पात (TISCO, भिलाई, राउरकेला, बोकारो), सीमेंट व IT उद्योग एवं 31 VVI Objective प्रश्न।'
                      : selectedChapter.id === 'ch-c10-soc-civ-01'
                      ? 'Owner (प्रिंस सर) द्वारा अपलोड की गई मूल PDF के साथ-साथ विशेष बड़े अक्षर (Big Letters) इंटरएक्टिव नोट्स, बेल्जियम एवं श्रीलंका मॉडल, जाति-धर्म-लिंग भेद, क्षेत्रवाद, पंचायती राज एवं 50 VVI Objective प्रश्न व ऑनलाइन टेस्ट।'
                      : 'मोबाइल व टैबलेट पर आसानी से पढ़ने के लिए विशेष बड़े अक्षर, सड़क प्रकार (नागपुर योजना), स्वर्णिम चतुर्भुज, 16 रेलवे जोन मुख्यालय, आंतरिक 5 राष्ट्रीय जलमार्ग, डाक चैनल, विदेशी व्यापार एवं 35 VVI Objective प्रश्न।'}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
                  {selectedChapter.id === 'ch-c10-soc-civ-01' && (
                    <button
                      type="button"
                      onClick={() => {
                        const exportData = resolveUniversalNotesData(selectedChapter);
                        setPdfViewerData({
                          id: 'sm_mat_murp0z3j_hlwov',
                          title: 'अध्याय 01: लोकतंत्र में सत्ता की साझेदारी — संपूर्ण नोट्स PDF (Civics Chapter 01)',
                          fileName: 'Civics_Chapter_1_NOTES.pdf',
                          fileUrl: '/api/storage/pdf/sm_mat_murp0z3j_hlwov_Civics_Chapter_1_NOTES_1790872900868.pdf',
                          classLevel: 'Class 10',
                          subjectName: 'नागरिक शास्त्र (Civics)',
                          bookTitle: 'लोकतांत्रिक राजनीति - भाग 2',
                          chapterTitle: selectedChapter.hindiTitle,
                          chapterNumber: selectedChapter.chapterNumber,
                          exportData,
                        });
                      }}
                      className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                    >
                      <FileText className="w-5 h-5 stroke-[2.5]" />
                      <span>अपलोड की गई मूल PDF देखें</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedChapter.id === 'ch-c10-sci-bio-01') {
                        const exportData = resolveUniversalNotesData(selectedChapter);
                        setPdfViewerData({
                          title: selectedChapter.hindiTitle || selectedChapter.title,
                          fileName: 'Bihar_Board_Class_10_Biology_Chapter_01_Jaiv_Prakram_Notes.pdf',
                          classLevel: 'Class 10',
                          subjectName: 'जीव विज्ञान (Biology)',
                          bookTitle: 'जीव विज्ञान (Biology Class 10)',
                          chapterTitle: selectedChapter.hindiTitle,
                          chapterNumber: selectedChapter.chapterNumber,
                          exportData
                        });
                      } else {
                        setShowPhysicsNotesModal(true);
                      }
                    }}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                  >
                    <BookOpen className="w-5 h-5 stroke-[2.5]" />
                    <span>मूल बुकलेट नोट्स पढ़ें (RK Toppers Design)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const data = resolveUniversalNotesData(selectedChapter);
                      setDownloadNotesData(data);
                    }}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-sm sm:text-base transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                  >
                    <Download className="w-5 h-5" />
                    <span>डाउनलोड (File Manager / PDF)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowChapterShareModal(true)}
                    className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/30 font-black text-sm sm:text-base transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2"
                    title="Share Chapter Notes via WhatsApp, Instagram, Facebook"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>शेयर नोट्स</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const resolvedBook = BOOKS.find((b) => b.id === selectedChapter.bookId);
                      const primaryTest = TESTS.find((t) => t.chapterId === selectedChapter.id && t.isPublished);
                      onNavigate('tests', { 
                        classLevel: selectedClass, 
                        subjectSlug: selectedSubjectSlug, 
                        bookSlug: resolvedBook?.slug || selectedBookSlug, 
                        chapterSlug: selectedChapter.slug,
                        testId: primaryTest?.id,
                      });
                    }}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white hover:bg-blue-50 text-blue-900 font-black text-sm sm:text-base transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Award className="w-5 h-5 text-blue-700 stroke-[2.5]" />
                    <span>🎯 ऑनलाइन टेस्ट दें</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div 
                onClick={() => {
                  const resolvedBook = BOOKS.find((b) => b.id === selectedChapter.bookId);
                  onNavigate('study-material', { 
                    classLevel: selectedClass, 
                    subjectSlug: selectedSubjectSlug, 
                    bookSlug: resolvedBook?.slug || selectedBookSlug, 
                    chapterSlug: selectedChapter.slug 
                  });
                }}
                className="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group text-center space-y-4"
              >
                <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                  अध्ययन सामग्री (Study Material)
                </h3>
                <p className="text-slate-600 font-medium">
                  नोट्स, PDF, मॉडल पेपर, प्रश्न बैंक एवं अन्य महत्वपूर्ण अध्ययन सामग्री देखें।
                </p>
              </div>

              <div 
                onClick={() => { 
                  const resolvedBook = BOOKS.find((b) => b.id === selectedChapter.bookId);
                  const primaryTest = TESTS.find((t) => t.chapterId === selectedChapter.id && t.isPublished);
                  onNavigate('tests', { 
                    classLevel: selectedClass, 
                    subjectSlug: selectedSubjectSlug, 
                    bookSlug: resolvedBook?.slug || selectedBookSlug, 
                    chapterSlug: selectedChapter.slug,
                    testId: primaryTest?.id,
                  });
                }}
                className="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-green-500 hover:shadow-lg transition-all cursor-pointer group text-center space-y-4"
              >
                <div className="w-16 h-16 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <FolderOpen className="w-8 h-8 stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-green-700 transition-colors">
                  ऑनलाइन टेस्ट (Online Tests)
                </h3>
                <p className="text-slate-600 font-medium">
                  इस अध्याय के लिए विषयवार ऑब्जेक्टिव (MCQ) एवं सब्जेक्टिव टेस्ट दें।
                </p>
              </div>
            </div>
           </div>
        )}

        {/* Big Letter Notes Viewer Modal */}
        {showPhysicsNotesModal && (
          <BigLetterPhysicsNotesViewer
            initialChapterId={selectedChapter?.id}
            isModal
            onClose={() => setShowPhysicsNotesModal(false)}
          />
        )}

        {/* Share Notes Modal */}
        {selectedChapter && (
          <ShareNotesModal
            isOpen={showChapterShareModal}
            onClose={() => setShowChapterShareModal(false)}
            data={{
              title: selectedChapter.hindiTitle,
              subjectName: selectedSubject?.hindiName || selectedSubject?.name,
              chapterTitle: `${selectedChapter.hindiTitle} (${selectedChapter.title})`,
              classLevel: CLASSES_METADATA.find((c) => c.id === selectedClass)?.name || 'कक्षा 10',
              noteId: selectedChapter.id,
              chapterSlug: selectedChapter.slug,
              subjectSlug: selectedSubject?.slug,
              bookSlug: selectedBookSlug,
              description: `RK STUDY CENTRE • बिहार बोर्ड टॉपर हस्तलिखित नोट्स व VVI प्रश्नोत्तर। By Prince Sir`,
            }}
          />
        )}

        {/* Universal Download Notes Modal */}
        {downloadNotesData && (
          <DownloadNotesModal
            isOpen={Boolean(downloadNotesData)}
            onClose={() => setDownloadNotesData(null)}
            data={downloadNotesData}
          />
        )}

        {/* In-App PDF Viewer Modal */}
        {pdfViewerData && (
          <InAppPDFViewerModal
            isOpen={Boolean(pdfViewerData)}
            onClose={() => setPdfViewerData(null)}
            document={pdfViewerData}
          />
        )}
      </div>
    </div>
  );
}
