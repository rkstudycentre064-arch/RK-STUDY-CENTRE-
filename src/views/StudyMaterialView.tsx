
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
  Search,
  Sparkles,
  Printer,
  Play,
  X,
  CheckCircle2,
  WifiOff,
  HardDrive,
  Share2,
  Bookmark,
  Pin,
  Check,
} from 'lucide-react';
import type {
  ClassLevel,
  MainNavRoute,
  MoreSectionTab,
} from '../types';
import {
  CLASSES_METADATA,
  SUBJECTS,
  BOOKS,
  CHAPTERS,
  STUDY_MATERIALS,
  TESTS
} from '../lib/constants';
import { getMaterialsForChapter } from '../services/studyMaterialService';
import { normalizeCourseId } from '../services/courseService';
import { useAuth } from '../context/AuthContext';
import { BackButton } from '../components/BackButton';
import { BigLetterPhysicsNotesViewer } from '../components/notes/BigLetterPhysicsNotesViewer';
import { ShareNotesModal, ShareNotesData } from '../components/notes/ShareNotesModal';
import { DownloadNotesModal } from '../components/notes/DownloadNotesModal';
import { resolveUniversalNotesData } from '../utils/materialNotesMapper';
import { downloadNotesAsHTMLFile, downloadColorPDFNotes, ChapterNotesExportData } from '../utils/downloadNotesHelper';
import { OfflineStudyHubModal } from '../components/OfflineStudyHubModal';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  getCacheStorageStats,
  isMaterialCachedOffline,
  isMaterialPinnedOffline,
  togglePinMaterialOffline,
  isChapterPinnedOffline,
  togglePinChapterOffline,
  OFFLINE_STORAGE_UPDATED_EVENT
} from '../services/offlineStorage';
import { InAppPDFViewerModal, PDFDocumentData } from '../components/notes/InAppPDFViewerModal';
import { FullPagePDFCanvasViewer } from '../components/notes/FullPagePDFCanvasViewer';
import { identifySubjectAndChaptersForPDF, IdentifiedPDFSubjectResult } from '../utils/pdfSubjectIdentifier';
import { ChapterNavigation, OpenFileInfo } from '../components/studyMaterial/ChapterNavigation';
import { Class10MathCh02FormulaNotesPage } from '../components/notes/Class10MathCh02FormulaNotesPage';
import { MathCh02QuestionBank500Viewer } from '../components/notes/MathCh02QuestionBank500Viewer';

interface StudyMaterialViewProps {
  initialClass?: ClassLevel;
  initialSubjectSlug?: string;
  initialBookSlug?: string;
  initialChapterSlug?: string;
  onNavigate: (route: MainNavRoute, params?: { classLevel?: ClassLevel; subjectSlug?: string; bookSlug?: string; chapterSlug?: string; testId?: string; moreTab?: MoreSectionTab }) => void;
}

function resolveNoteId(mat: any): string {
  if (mat.interactiveNoteId) return mat.interactiveNoteId;
  const sub = String(mat.subjectId || '');
  const book = String(mat.bookId || '');
  const chap = String(mat.chapterId || '');
  const cls = String(mat.classId || mat.classLevel || '');

  if (
    cls === 'class-12' ||
    sub.includes('c12-phy') ||
    book.includes('c12-phy') ||
    chap.includes('c12-p') ||
    chap.includes('c12-sci-phy') ||
    String(mat.title || '').toLowerCase().includes('12th physics') ||
    String(mat.title || '').toLowerCase().includes('electric charges')
  ) {
    return 'c12-phy-ch01';
  }

  if (sub === 'c10-hin' || book.includes('hin') || chap.includes('hin')) {
    if (chap.includes('v-02') || chap.includes('v02')) return 'ch-c10-hin-v-02';
    if (chap.includes('v-01') || chap.includes('v01')) return 'ch-c10-hin-v-01';
    if (chap.includes('03') || chap.includes('g-03')) return 'ch-c10-hin-g-03';
    return 'ch-c10-hin-g-01';
  }

  if (sub.includes('geo') || book.includes('geo') || chap.includes('geo')) {
    if (chap.includes('05')) return 'c10-geo-ch05';
    if (chap.includes('04')) return 'c10-geo-ch04';
    if (chap.includes('03')) return 'c10-geo-ch03';
    return 'c10-geo-ch02';
  }

  if (
    sub.includes('his') ||
    book.includes('his') ||
    chap.includes('his') ||
    chap.includes('राष्ट्रवाद') ||
    chap.includes('साम्यवाद') ||
    chap.includes('समाजवाद') ||
    chap.includes('हिन्द-चीन') ||
    chap.includes('भारत') ||
    chap.includes('शहरीकरण') ||
    String(mat.title || '').toLowerCase().includes('history') ||
    String(mat.title || '').includes('इतिहास') ||
    String(mat.title || '').includes('राष्ट्रवाद') ||
    String(mat.title || '').includes('साम्यवाद') ||
    String(mat.title || '').includes('समाजवाद') ||
    String(mat.title || '').includes('हिन्द-चीन') ||
    String(mat.title || '').includes('भारत में राष्ट्रवाद') ||
    String(mat.title || '').includes('शहरीकरण') ||
    String(mat.interactiveNoteId || '').includes('his')
  ) {
    if (
      chap.includes('06') ||
      chap.includes('ch06') ||
      chap.includes('ch-06') ||
      chap.includes('chapter-6') ||
      String(mat.title || '').includes('शहरीकरण') ||
      String(mat.title || '').includes('Urbanisation') ||
      String(mat.title || '').includes('Chapter 06') ||
      String(mat.title || '').includes('Chapter 6') ||
      String(mat.title || '').includes('अध्याय 6')
    ) {
      return 'c10-his-ch06';
    }
    if (
      chap.includes('05') ||
      chap.includes('ch05') ||
      chap.includes('ch-05') ||
      chap.includes('chapter-5') ||
      String(mat.title || '').includes('अर्थव्यवस्था') ||
      String(mat.title || '').includes('Chapter 05') ||
      String(mat.title || '').includes('Chapter 5') ||
      String(mat.title || '').includes('अध्याय 5')
    ) {
      return 'c10-his-ch05';
    }
    if (
      chap.includes('04') ||
      chap.includes('ch04') ||
      chap.includes('ch-04') ||
      chap.includes('chapter-4') ||
      String(mat.title || '').includes('भारत में राष्ट्रवाद') ||
      String(mat.title || '').includes('Nationalism in India') ||
      String(mat.title || '').includes('Chapter 04') ||
      String(mat.title || '').includes('Chapter 4') ||
      String(mat.title || '').includes('अध्याय 4')
    ) {
      return 'c10-his-ch04';
    }
    if (
      chap.includes('03') ||
      chap.includes('ch03') ||
      chap.includes('हिन्द-चीन') ||
      String(mat.title || '').includes('हिन्द-चीन') ||
      String(mat.title || '').includes('Indo-China') ||
      String(mat.title || '').includes('Chapter 03') ||
      String(mat.title || '').includes('Chapter 3') ||
      String(mat.title || '').includes('अध्याय 3')
    ) {
      return 'c10-his-ch03';
    }
    if (
      chap.includes('02') ||
      chap.includes('ch02') ||
      chap.includes('साम्यवाद') ||
      chap.includes('समाजवाद') ||
      String(mat.title || '').includes('साम्यवाद') ||
      String(mat.title || '').includes('समाजवाद') ||
      String(mat.title || '').includes('Chapter 02') ||
      String(mat.title || '').includes('Chapter 2') ||
      String(mat.title || '').includes('अध्याय 2')
    ) {
      return 'c10-his-ch02';
    }
    return 'c10-his-ch01';
  }

  if (
    sub.includes('bio') ||
    book.includes('bio') ||
    chap.includes('bio') ||
    chap.includes('जैव') ||
    String(mat.title || '').toLowerCase().includes('biology') ||
    String(mat.title || '').includes('जैव')
  ) {
    return 'c10-bio-ch01';
  }

  if (
    sub.includes('civ') ||
    book.includes('civ') ||
    chap.includes('civ') ||
    chap.includes('नागरिक') ||
    chap.includes('सत्ता') ||
    String(mat.title || '').toLowerCase().includes('civics') ||
    String(mat.title || '').toLowerCase().includes('power sharing') ||
    String(mat.title || '').includes('नागरिक') ||
    String(mat.title || '').includes('सत्ता') ||
    String(mat.title || '').includes('लोकतंत्र')
  ) {
    return 'c10-civ-ch01';
  }

  if (
    sub.includes('math') ||
    book.includes('math') ||
    chap.includes('math') ||
    chap.includes('c10-m-1') ||
    chap.includes('c10-math') ||
    chap.includes('वास्तविक') ||
    chap.includes('बहुपद') ||
    String(mat.title || '').toLowerCase().includes('math') ||
    String(mat.title || '').toLowerCase().includes('real numbers') ||
    String(mat.title || '').toLowerCase().includes('polynomial') ||
    String(mat.title || '').includes('गणित') ||
    String(mat.title || '').includes('वास्तविक संख्याएँ') ||
    String(mat.title || '').includes('बहुपद') ||
    String(mat.interactiveNoteId || '').includes('math')
  ) {
    if (
      chap.includes('02') ||
      chap.includes('ch02') ||
      chap.includes('chapter-2') ||
      chap.includes('बहुपद') ||
      String(mat.title || '').includes('बहुपद') ||
      String(mat.title || '').toLowerCase().includes('polynomial') ||
      String(mat.interactiveNoteId || '').includes('02')
    ) {
      return 'c10-math-ch02';
    }
    return 'c10-math-ch01';
  }

  return 'c10-phy-ch01';
}

export function StudyMaterialView({
  initialClass = 'class-10',
  initialSubjectSlug,
  initialBookSlug,
  initialChapterSlug,
  onNavigate
}: StudyMaterialViewProps) {
  const { profile, isOwner } = useAuth();
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(initialClass);
  const [selectedStream, setSelectedStream] = useState<'all' | 'Science' | 'Arts' | 'Commerce'>('all');
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState<string | undefined>(initialSubjectSlug);
  const [selectedBookSlug, setSelectedBookSlug] = useState<string | undefined>(initialBookSlug);
  const [selectedChapterSlug, setSelectedChapterSlug] = useState<string | undefined>(initialChapterSlug);
  
  const [isLoadingMaterials, setIsLoadingMaterials] = useState<boolean>(false);
  const [materialError, setMaterialError] = useState<string | null>(null);
  const [chapterMaterials, setChapterMaterials] = useState<any[]>([]);
  const [viewingInteractiveNoteId, setViewingInteractiveNoteId] = useState<string | null>(null);
  const [previewDocumentModal, setPreviewDocumentModal] = useState<any | null>(null);
  const [downloadModalData, setDownloadModalData] = useState<ChapterNotesExportData | null>(null);
  const [shareModalData, setShareModalData] = useState<ShareNotesData | null>(null);
  const [showOfflineHubModal, setShowOfflineHubModal] = useState<boolean>(false);
  const [pdfDocToView, setPdfDocToView] = useState<PDFDocumentData | null>(null);
  const [activeOpenFile, setActiveOpenFile] = useState<OpenFileInfo | null>(null);
  const [pdfInputQuery, setPdfInputQuery] = useState<string>('');
  const [pdfIdentifiedResult, setPdfIdentifiedResult] = useState<IdentifiedPDFSubjectResult | null>(null);
  const [showMathCh02Bank500Modal, setShowMathCh02Bank500Modal] = useState<{ open: boolean; mode: 'read' | 'solve' | 'test' | 'answer-key' }>({ open: false, mode: 'solve' });
  const isOnline = useOnlineStatus();
  const [offlineTick, setOfflineTick] = useState<number>(0);
  const cacheStats = getCacheStorageStats();

  useEffect(() => {
    const handleStorageUpdate = () => {
      setOfflineTick((prev) => prev + 1);
    };
    window.addEventListener(OFFLINE_STORAGE_UPDATED_EVENT, handleStorageUpdate);
    return () => window.removeEventListener(OFFLINE_STORAGE_UPDATED_EVENT, handleStorageUpdate);
  }, []);

  const handleIdentifyPdfQuery = (queryText: string) => {
    if (!queryText.trim()) return;
    const result = identifySubjectAndChaptersForPDF({ title: queryText }, selectedClass);
    setPdfIdentifiedResult(result);
    if (result && result.subjectSlug) {
      setActiveOpenFile({
        title: queryText,
        fileName: queryText.toLowerCase().endsWith('.pdf') ? queryText : `${queryText}.pdf`,
        chapterId: result.matchedChapterId,
        chapterNumber: result.matchedChapterNumber,
        subjectId: result.subjectId,
        subjectName: result.subjectHindiName,
      });
      onNavigate('study-material', {
        classLevel: selectedClass,
        subjectSlug: result.subjectSlug,
        bookSlug: result.matchedBookId ? BOOKS.find(b => b.id === result.matchedBookId)?.slug : undefined,
        chapterSlug: result.matchedChapterId ? result.chapters.find(c => c.id === result.matchedChapterId)?.slug : undefined
      });
    }
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

  // Resolve current active book for the chapter (if chapter selected directly without book in URL)
  const activeChapterBook = selectedChapter 
    ? BOOKS.find((b) => b.id === selectedChapter.bookId) 
    : selectedBook;

  // Fetch study materials strictly matching classId + subjectId + bookId + chapterId
  useEffect(() => {
    let isMounted = true;
    
    // Safety guard: Ensure all hierarchical parents exist before querying
    if (selectedChapter && selectedClass && selectedSubject && activeChapterBook) {
      const subjectId = selectedSubject.id;
      const bookId = activeChapterBook.id;
      const chapterId = selectedChapter.id;
      
      console.log(`[RK STUDY CENTRE] Fetching materials for: ${selectedClass} | Subject: ${subjectId} | Book: ${bookId} | Chapter: ${chapterId}`);
      setIsLoadingMaterials(true);
      setMaterialError(null);

      getMaterialsForChapter(selectedClass, subjectId, bookId, chapterId)
        .then((materials) => {
          if (isMounted) {
            const visibleForStudent = materials.filter((m) => {
              if (m.status && m.status !== 'active') return false;
              if (isOwner) return true;
              if (!m.courseId) return true;
              const enrolled = (profile?.enrolledCourseIds || []).map((id) => normalizeCourseId(id));
              return enrolled.includes(normalizeCourseId(m.courseId));
            });
            setChapterMaterials(visibleForStudent.length > 0 ? visibleForStudent : materials);
            setIsLoadingMaterials(false);
          }
        })
        .catch((err) => {
          console.error('[RK STUDY CENTRE] Error loading materials:', err);
          if (isMounted) {
            // Fallback to static materials if Firestore request encounters an issue
            const fallback = STUDY_MATERIALS.filter(
              (m) =>
                (m.classId === selectedClass || m.classLevel === selectedClass) &&
                m.subjectId === subjectId &&
                (m.bookId === bookId ||
                  (m.bookId === 'b-c12-hin-digant2' && bookId === 'b-c12-hin-digant') ||
                  (m.bookId === 'b-c10-math' && bookId === 'b-c10-math-ncert')) &&
                (m.chapterId === chapterId ||
                  (m.chapterId === 'ch-c10-m-1' && chapterId === 'ch-c10-math-01'))
            );
            setChapterMaterials(fallback);
            setIsLoadingMaterials(false);
          }
        });

      return () => {
        isMounted = false;
      };
    } else {
      // Clear materials if hierarchy is incomplete
      if (isMounted) {
        setChapterMaterials([]);
        setIsLoadingMaterials(false);
      }
    }
  }, [selectedChapter, selectedClass, selectedSubject, activeChapterBook, isOwner, profile?.enrolledCourseIds]);

  // Sync activeOpenFile when open file modal or selected chapter changes
  useEffect(() => {
    if (pdfDocToView) {
      setActiveOpenFile({
        title: pdfDocToView.title,
        fileName: pdfDocToView.fileName,
        fileUrl: pdfDocToView.fileUrl,
        chapterId: pdfDocToView.chapterId || selectedChapter?.id,
        chapterNumber: pdfDocToView.chapterNumber || selectedChapter?.chapterNumber,
        subjectId: selectedSubject?.id,
        subjectName: pdfDocToView.subjectName || selectedSubject?.hindiName,
        bookId: activeChapterBook?.id,
      });
    } else if (previewDocumentModal) {
      setActiveOpenFile({
        title: previewDocumentModal.title,
        fileName: previewDocumentModal.fileName,
        fileUrl: previewDocumentModal.fileUrl,
        chapterId: previewDocumentModal.chapterId || selectedChapter?.id,
        chapterNumber: selectedChapter?.chapterNumber,
        subjectId: selectedSubject?.id,
      });
    } else if (selectedChapter && selectedSubject) {
      setActiveOpenFile({
        title: selectedChapter.hindiTitle || selectedChapter.title,
        fileName: `${selectedChapter.title}.pdf`,
        chapterId: selectedChapter.id,
        chapterNumber: selectedChapter.chapterNumber,
        subjectId: selectedSubject.id,
        bookId: activeChapterBook?.id,
      });
    }
  }, [pdfDocToView, previewDocumentModal, selectedChapter, selectedSubject, activeChapterBook]);

  const handleSelectClass = (cls: ClassLevel) => {
    onNavigate('study-material', { classLevel: cls });
  };

  const handleSelectSubject = (subjectSlug: string) => {
    onNavigate('study-material', { classLevel: selectedClass, subjectSlug });
  };

  const handleSelectBook = (bookSlug: string) => {
    onNavigate('study-material', { 
      classLevel: selectedClass, 
      subjectSlug: selectedSubjectSlug, 
      bookSlug: bookSlug || undefined 
    });
  };

  const handleSelectChapter = (chapterSlug: string, bookSlug?: string) => {
    const resolvedBookSlug = bookSlug || selectedBookSlug || activeChapterBook?.slug;
    onNavigate('study-material', { 
      classLevel: selectedClass, 
      subjectSlug: selectedSubjectSlug, 
      bookSlug: resolvedBookSlug, 
      chapterSlug 
    });
  };

  const handleBackToSubjects = () => {
    onNavigate('study-material', { classLevel: selectedClass });
  };

  const handleBackToBooks = () => {
    onNavigate('study-material', { classLevel: selectedClass, subjectSlug: selectedSubjectSlug });
  };

  const handleBackToChapters = () => {
    onNavigate('study-material', { 
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
            onClick={() => onNavigate('study-material', { classLevel: selectedClass })}
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
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setShowOfflineHubModal(true)}
            className="text-xs sm:text-sm font-black text-slate-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3.5 py-2 rounded-xl shadow-2xs flex items-center gap-2 cursor-pointer transition-all"
            title="सहेजे गए ऑफ़लाइन नोट्स देखें"
          >
            <HardDrive className="w-4 h-4 text-amber-700" />
            <span>ऑफ़लाइन नोट्स ({cacheStats.totalItems})</span>
          </button>
          <div className="text-sm font-bold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-2xs">
            प्रदर्शित कक्षा: <span className="text-blue-800 font-extrabold">{currentClassMeta.hindiName} ({currentClassMeta.name})</span>
          </div>
        </div>
      </div>

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="p-4 rounded-2xl bg-amber-400 text-slate-950 font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border-2 border-amber-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-950 text-amber-400 shrink-0">
              <WifiOff className="w-5 h-5 stroke-[2.5]" />
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-950 font-bold">
              <strong className="font-black text-slate-950">ऑफ़लाइन मोड सक्रिय:</strong> इंटरनेट कनेक्शन उपलब्ध नहीं है। पहले से लोड किए गए सभी नोट्स व अध्ययन सामग्री स्थानीय मेमोरी (Local Storage & Service Worker Cache) से उपलब्ध हैं।
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowOfflineHubModal(true)}
            className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-black text-white font-extrabold text-xs shrink-0 cursor-pointer transition-colors shadow-xs"
          >
            ऑफ़लाइन हब खोलें
          </button>
        </div>
      )}

      {/* Featured Class 10 Math Chapter 01 & Chapter 02 Remember Notes & Big-Letter Clean Notes Quick Launch */}
      {selectedClass === 'class-10' && !viewingInteractiveNoteId && (
        <div className="bg-gradient-to-r from-indigo-950 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border-2 border-amber-400/50 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-white/15">
            <div className="space-y-2.5 max-w-3xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-xs">
                  📐 NEW REMEMBER NOTES • BIG LETTERS
                </span>
                <span className="px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-extrabold">
                  Class X Mathematics • Chapter 02
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold">
                  Active Features & Clean Notes
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                अध्याय 02: बहुपद (Polynomials) — Remember Notes & Clean Big-Letter Notes
              </h2>
              <p className="text-sm sm:text-base text-slate-200 font-bold leading-relaxed">
                बड़े और बिल्कुल साफ़ अक्षरों (Big Letters) में संपूर्ण <strong className="text-amber-300">Remember Notes</strong>: बहुपद की पहचान, रैखिक/द्विघात/त्रिघात बहुपद, शून्यकों और गुणांकों में संबंध (<code className="text-amber-300 font-black">α + β = -b/a</code>, <code className="text-amber-300 font-black">α·β = c/a</code>, <code className="text-amber-300 font-black">1/α + 1/β = -b/c</code>), विभाजन एल्गोरिथ्म एवं 30 VVI बोर्ड प्रश्नोत्तर।
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowMathCh02Bank500Modal({ open: true, mode: 'solve' })}
                className="px-5 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base shadow-lg flex items-center gap-2 cursor-pointer transition-all"
              >
                <BookOpen className="w-5 h-5 stroke-[2.5]" />
                <span>🔥 500 VVI पढ़ें (Option + Solved Answer)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMathCh02Bank500Modal({ open: true, mode: 'test' })}
                className="px-5 py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm sm:text-base shadow-lg flex items-center gap-2 cursor-pointer transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>⚡ 500 VVI Live Test</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingInteractiveNoteId('c10-math-ch02')}
                className="px-5 py-3.5 rounded-2xl bg-white hover:bg-blue-50 text-indigo-950 font-black text-sm sm:text-base shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>अध्याय 02 संपूर्ण नोट्स खोलें</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onNavigate('study-material', {
                    classLevel: 'class-10',
                    subjectSlug: 'math',
                    bookSlug: 'math-ncert',
                    chapterSlug: 'chapter-2',
                  })
                }
                className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/25 font-black text-sm sm:text-base shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <FileText className="w-4 h-4 text-amber-300" />
                <span>अध्याय 02 पेज</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-black">
                  Class X Mathematics • Chapter 01
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  अध्याय 01: वास्तविक संख्याएँ (Real Numbers) — Remember Notes
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-bold">
                यूक्लिड विभाजन प्रमेयिका (<code className="text-amber-300">a = bq + r</code>), <code className="text-amber-300">HCF × LCM = a × b</code>, अपरिमेयता प्रमाण एवं सांत/असांत दशमलव प्रसार।
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setViewingInteractiveNoteId('c10-math-ch01')}
                className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-amber-300 border border-amber-400/40 font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>अध्याय 01 Remember Notes खोलें</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onNavigate('study-material', {
                    classLevel: 'class-10',
                    subjectSlug: 'math',
                    bookSlug: 'math-ncert',
                    chapterSlug: 'chapter-1',
                  })
                }
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all"
              >
                <FileText className="w-4 h-4 text-amber-300" />
                <span>गणित अध्याय 01 पेज</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart PDF Subject & Chapter Auto-Matcher Card */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border-2 border-blue-500/30 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
              AI PDF ऑटो-मैचर (RK STUDY CENTRE)
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Current PDF से विषय और अध्याय की स्वचालित पहचान
            </h2>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-300 font-medium">
          किसी भी PDF का नाम या शीर्षक दर्ज करें। सिस्टम स्वचालित रूप से <strong className="text-amber-400">Subject Identify</strong> करेगा, <strong className="text-amber-400">Subject Tab</strong> पर ले जाएगा, और <strong className="text-amber-400">Chapter Number + Chapter Name</strong> लोड कर देगा।
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={pdfInputQuery}
              onChange={(e) => setPdfInputQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleIdentifyPdfQuery(pdfInputQuery); }}
              placeholder="उदा. 'कक्षा 10 भौतिकी अध्याय 1 प्रकाश का परावर्तन.pdf'"
              className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-slate-400 text-sm sm:text-base font-bold focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => handleIdentifyPdfQuery(pdfInputQuery)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm sm:text-base transition-all cursor-pointer shadow-md shrink-0 flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-slate-950" />
            <span>पहचानें और लोड करें</span>
          </button>
        </div>

        {/* Quick Sample Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-2">
          <span className="text-xs font-bold text-slate-400">त्वरित नमूना (Quick Test):</span>
          {[
            'भौतिकी अध्याय 1 प्रकाश का परावर्तन',
            'रसायन शास्त्र अम्ल, क्षार एवं लवण',
            'गणित वास्तविक संख्याएँ',
            'इतिहास यूरोप में राष्ट्रवाद'
          ].map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPdfInputQuery(sample);
                handleIdentifyPdfQuery(sample);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 border border-white/10 cursor-pointer transition-colors"
            >
              📄 {sample}
            </button>
          ))}
        </div>

        {pdfIdentifiedResult && (
          <div className="bg-emerald-950/80 border-2 border-emerald-500/50 rounded-2xl p-4 mt-4 text-emerald-100 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-black text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>सफलतापूर्वक पहचाना गया विषय और अध्याय:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm pt-1">
              <div className="bg-emerald-900/50 p-3 rounded-xl border border-emerald-700/50">
                <span className="text-emerald-400 block text-2xs uppercase font-extrabold">पहचाना गया विषय (Identified Subject)</span>
                <strong className="text-white text-base">{pdfIdentifiedResult.subjectHindiName} ({pdfIdentifiedResult.subjectName})</strong>
              </div>
              <div className="bg-emerald-900/50 p-3 rounded-xl border border-emerald-700/50">
                <span className="text-emerald-400 block text-2xs uppercase font-extrabold">अध्याय (Chapter Number + Name)</span>
                <strong className="text-amber-300 text-base">अध्याय {pdfIdentifiedResult.matchedChapterNumber || 1}: {pdfIdentifiedResult.matchedChapterName || 'मुख्य पाठ'}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Class Selection Tabs */}
      <div className="bg-white rounded-3xl p-7 sm:p-8 border-2 border-slate-200 shadow-sm space-y-7">
        <div className="space-y-2">
          <span className="text-sm font-black text-blue-700 uppercase tracking-widest">
            अध्ययन सामग्री
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900">
            कक्षा चुनें
          </h1>
          <p className="text-slate-700 text-base sm:text-lg font-medium max-w-3xl leading-relaxed">
            कृपया अपनी कक्षा का चयन करें। आपको केवल उसी कक्षा की सामग्री दिखाई देगी।
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

      {/* Chapter Navigation Component (Subject Short Name - Chapter Number - Title) */}
      {selectedSubject && (
        <ChapterNavigation
          chapters={visibleChapters.length > 0 ? visibleChapters : allSubjectChapters}
          activeChapterSlug={selectedChapterSlug}
          activeChapterId={selectedChapter?.id}
          activeChapterNumber={selectedChapter?.chapterNumber}
          openFile={activeOpenFile || (selectedChapter ? {
            title: selectedChapter.hindiTitle || selectedChapter.title,
            chapterId: selectedChapter.id,
            chapterNumber: selectedChapter.chapterNumber,
            subjectId: selectedSubject.id,
          } : null)}
          subject={selectedSubject}
          book={activeChapterBook || selectedBook}
          onSelectChapter={(ch, bSlug) => {
            const parentBook = BOOKS.find((b) => b.id === ch.bookId);
            handleSelectChapter(ch.slug, bSlug || parentBook?.slug);
          }}
          className="my-3"
        />
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
                  सामग्री देखने के लिए विषय का चयन करें।
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
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600 font-semibold">
                    <span>{sub.totalChapters} अध्याय</span>
                    <span className="font-extrabold text-blue-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      पुस्तकें देखें →
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
                  अध्ययन सामग्री (Study Material) देखने के लिए अध्याय पर क्लिक करें।
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
                          सामग्री देखें →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Chapter Content (Study Material) */}
        {selectedChapter && (
           <div className="space-y-6">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  अध्याय {selectedChapter.chapterNumber}: {selectedChapter.hindiTitle || selectedChapter.title}
                </h2>
                <p className="text-slate-700 text-sm sm:text-base font-medium mt-1">
                  अध्ययन सामग्री (Study Material)
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const compiledData = resolveUniversalNotesData({
                      id: selectedChapter.id,
                      chapterId: selectedChapter.id,
                      chapterNumber: selectedChapter.chapterNumber,
                      title: selectedChapter.hindiTitle || selectedChapter.title,
                      subjectId: selectedSubject?.id,
                      bookId: activeChapterBook?.id,
                      classLevel: selectedClass,
                    });
                    setDownloadModalData(compiledData);
                  }}
                  className="px-4 py-2.5 rounded-xl text-sm font-black bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white flex items-center gap-2 cursor-pointer shadow-md shadow-orange-600/25 transition-all shrink-0 active:scale-95"
                  title="अध्याय के संपूर्ण नोट्स को प्रिंटर-फ्रेंडली PDF लेआउट में डाउनलोड करें"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Download PDF (प्रिंटर-फ्रेंडली नोट्स)</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('tests', {
                      classLevel: selectedClass,
                      subjectSlug: selectedSubjectSlug,
                      bookSlug: selectedBookSlug,
                      chapterSlug: selectedChapterSlug
                    });
                  }}
                  className="px-4 py-2.5 rounded-xl text-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>ऑनलाइन टेस्ट दें (Take Online Test)</span>
                </button>
                <button
                  onClick={handleBackToChapters}
                  className="px-4 py-2 rounded-xl text-sm font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                  <span className="hidden sm:inline">वापस</span>
                </button>
              </div>
            </div>
            
            {(() => {
              if (isLoadingMaterials) {
                return (
                  <div className="bg-white rounded-3xl p-16 border-2 border-slate-200 text-center space-y-5 shadow-sm">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                    <h3 className="text-xl font-bold text-slate-800">
                      अध्ययन सामग्री लोड हो रही है...
                    </h3>
                  </div>
                );
              }

              if (materialError) {
                return (
                  <div className="bg-white rounded-3xl p-16 border-2 border-red-200 text-center space-y-5 shadow-sm bg-red-50">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                    <h3 className="text-xl font-bold text-red-800">
                      {materialError}
                    </h3>
                  </div>
                );
              }

              const materialTypes = [
                { id: 'notes', label: 'नोट्स' },
                { id: 'pdf', label: 'PDF' },
                { id: 'important_questions', label: 'महत्वपूर्ण प्रश्न' },
                { id: 'question_bank', label: 'प्रश्न बैंक' },
                { id: 'pyq', label: 'पिछले वर्ष के प्रश्न (PYQ)' },
                { id: 'model_paper', label: 'मॉडल पेपर' },
                { id: 'practice_material', label: 'अभ्यास सामग्री' },
              ];

              return (
                <div className="space-y-10">
                  {/* 📄 संपूर्ण अध्याय प्रिंटर-फ्रेंडली PDF कंपाइलेशन कार्ड (Consistent RK STUDY CENTRE Theme) */}
                  <div className="bg-gradient-to-br from-[#0B192C] via-[#1E3E62] to-[#0B192C] text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-orange-500/40 relative overflow-hidden space-y-5">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                      <div className="space-y-3 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-xs">
                            संपूर्ण डिजिटल नोट्स बुकलेट (Full Chapter Compilation)
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-orange-200 text-xs font-bold border border-white/15">
                            A4 प्रिंटर-फ्रेंडली लेआउट
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                            100% बोर्ड परीक्षा 2026-27
                          </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
                          अध्याय {selectedChapter.chapterNumber}: {selectedChapter.hindiTitle || selectedChapter.title} — संपूर्ण नोट्स PDF
                        </h3>

                        <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
                          इस अध्याय के सभी मुख्य सिद्धांत, विस्तृत परिभाषाएं, महत्वपूर्ण सूत्र, वस्तुनिष्ठ प्रश्नोत्तर (MCQs) और दीर्घ-लघु उत्तरीय प्रश्नोत्तर (Subjective Answers) को सिग्नेचर <strong>Hindi Chapter 01 कलर व प्रिंटेबल लेआउट</strong> में संकलित किया गया है।
                        </p>

                        <div className="flex flex-wrap gap-2 pt-1 text-xs font-bold text-slate-200">
                          <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">
                            📝 साफ एवं बड़े देवनागरी अक्षर
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">
                            🖨️ A4 प्रिंटेबल एवं PDF सेवेबल
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">
                            📱 ऑफ़लाइन File Manager कंपैटिबल
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto relative z-10">
                        <button
                          type="button"
                          onClick={() => {
                            const compiledData = resolveUniversalNotesData({
                              id: selectedChapter.id,
                              chapterId: selectedChapter.id,
                              chapterNumber: selectedChapter.chapterNumber,
                              title: selectedChapter.hindiTitle || selectedChapter.title,
                              subjectId: selectedSubject?.id,
                              bookId: activeChapterBook?.id,
                              classLevel: selectedClass,
                            });
                            downloadColorPDFNotes(compiledData);
                          }}
                          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
                        >
                          <Download className="w-5 h-5 stroke-[2.5]" />
                          <span>Download PDF (डाउनलोड / सेव)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const compiledData = resolveUniversalNotesData({
                              id: selectedChapter.id,
                              chapterId: selectedChapter.id,
                              chapterNumber: selectedChapter.chapterNumber,
                              title: selectedChapter.hindiTitle || selectedChapter.title,
                              subjectId: selectedSubject?.id,
                              bookId: activeChapterBook?.id,
                              classLevel: selectedClass,
                            });
                            setDownloadModalData(compiledData);
                          }}
                          className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Printer className="w-4 h-4 text-amber-300" />
                          <span>प्रिंटर-फ्रेंडली विकल्प देखें</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const noteId = resolveNoteId({
                              chapterId: selectedChapter.id,
                              subjectId: selectedSubject?.id,
                              bookId: activeChapterBook?.id,
                              classLevel: selectedClass,
                              title: selectedChapter.hindiTitle || selectedChapter.title,
                            });
                            setViewingInteractiveNoteId(noteId);
                          }}
                          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          <Eye className="w-4 h-4" />
                          <span>📖 बड़े अक्षर रिमेंबर नोट्स (Big-Letter View)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const exportData = resolveUniversalNotesData({
                              id: selectedChapter.id,
                              chapterId: selectedChapter.id,
                              chapterNumber: selectedChapter.chapterNumber,
                              title: selectedChapter.hindiTitle || selectedChapter.title,
                              subjectId: selectedSubject?.id,
                              bookId: activeChapterBook?.id,
                              classLevel: selectedClass,
                            });
                            const pdfDoc = {
                              title: exportData.metadata?.chapterTitle || selectedChapter.hindiTitle || selectedChapter.title,
                              hindiTitle: exportData.metadata?.chapterHindiTitle || selectedChapter.hindiTitle,
                              subjectName: exportData.metadata?.subjectName || selectedSubject?.hindiName,
                              classLevel: exportData.metadata?.className || selectedClass,
                              fileName: `RK_Study_Centre_Ch${selectedChapter.chapterNumber}_Notes.pdf`,
                              chapterId: selectedChapter.id,
                              chapterNumber: selectedChapter.chapterNumber,
                              notesExportData: exportData,
                              exportData: exportData,
                            };
                            setPdfDocToView(pdfDoc);
                            setActiveOpenFile(pdfDoc);
                          }}
                          className="px-5 py-2.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                          <span>इन-ऐप HD बुकलेट पढ़ें</span>
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
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>🎯 ऑनलाइन टेस्ट दें ({selectedChapter.id === 'ch-c10-soc-civ-01' ? '50 VVI MCQs' : 'Live Test'})</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dedicated Digital Formula & Quick Revision Notes Sheet for Class 10 Maths Chapter 2 */}
                  {(selectedChapter.id === 'ch-c10-math-02' ||
                    (selectedSubject?.slug === 'math' &&
                      (selectedChapter.slug === 'chapter-2' || selectedChapter.chapterNumber === 2))) && (
                    <div className="rounded-3xl overflow-hidden border-2 border-indigo-200 shadow-lg bg-[#F8FAFC]">
                      <Class10MathCh02FormulaNotesPage
                        isEmbedded={true}
                        onOpenFullChapterNotes={() => setViewingInteractiveNoteId('c10-math-ch02')}
                      />
                    </div>
                  )}

                  {(materialTypes || []).map(typeDef => {
                    const materialsOfType = chapterMaterials.filter(m => m.type === typeDef.id);
                    
                    if (materialsOfType.length === 0) return null;

                    return (
                      <div key={typeDef.id} className="space-y-4">
                        <h3 className="text-xl font-black text-slate-900 border-b-2 border-slate-100 pb-2">
                          {typeDef.label}
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {(materialsOfType || []).map(material => (
                            <div key={material.id} className="bg-white border-2 border-slate-200 rounded-2xl p-5 hover:border-blue-400 transition-colors shadow-sm flex flex-col sm:flex-row gap-5">
                              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                <FileText className="w-6 h-6 stroke-[2.5]" />
                              </div>
                              <div className="flex-1 space-y-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-lg font-black text-slate-900">{material.title}</h4>
                                    {material.year && (
                                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-900 border border-indigo-200">
                                        वर्ष {material.year}
                                      </span>
                                    )}
                                    {material.hasInteractiveNotes && (
                                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                        बड़े अक्षर शैली (Big Letter Style)
                                      </span>
                                    )}
                                    {material.fileUrl && material.fileUrl.startsWith('/api/storage/pdf/') && (
                                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        Owner Verified PDF (अपलोड सक्रिय)
                                      </span>
                                    )}
                                  </div>
                                  {material.description && (
                                    <p className="text-sm sm:text-base text-slate-700 font-medium mt-1 leading-relaxed">{material.description}</p>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const exportData = resolveUniversalNotesData(material);
                                      const pdfDoc = {
                                        id: material.id,
                                        title: material.title || exportData.metadata?.chapterTitle,
                                        hindiTitle: exportData.metadata?.chapterHindiTitle,
                                        subjectName: exportData.metadata?.subjectName || selectedSubject?.hindiName,
                                        classLevel: exportData.metadata?.className || selectedClass,
                                        fileUrl: material.fileUrl && material.fileUrl !== '#' ? material.fileUrl : undefined,
                                        fileName: material.fileName || `${material.title || 'notes'}.pdf`,
                                        chapterId: material.chapterId || selectedChapter?.id,
                                        chapterNumber: selectedChapter?.chapterNumber,
                                        notesExportData: exportData,
                                        exportData: exportData,
                                      };
                                      setPdfDocToView(pdfDoc);
                                      setActiveOpenFile(pdfDoc);
                                    }}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-black transition-all shadow-md cursor-pointer hover:shadow-lg active:scale-95"
                                  >
                                    <FileText className="w-4 h-4" />
                                    <span>📄 इन-ऐप PDF पढ़ें (HD Booklet)</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveOpenFile({
                                        title: material.title,
                                        fileName: material.fileName || `${material.title}.pdf`,
                                        fileUrl: material.fileUrl,
                                        chapterId: material.chapterId || selectedChapter?.id,
                                        chapterNumber: selectedChapter?.chapterNumber,
                                        subjectId: selectedSubject?.id,
                                      });
                                      setViewingInteractiveNoteId(resolveNoteId(material));
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-sm font-extrabold transition-colors cursor-pointer"
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span>वेब पूर्वावलोकन (Interactive)</span>
                                  </button>
                                  {material.fileUrl && material.fileUrl.startsWith('/api/storage/pdf/') && (
                                    <a
                                      href={`${material.fileUrl}?download=1`}
                                      download={material.fileName || `${material.title}.pdf`}
                                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black transition-all shadow-sm cursor-pointer active:scale-95"
                                    >
                                      <Download className="w-4 h-4" />
                                      <span>मूल अपलोड PDF डाउनलोड</span>
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveOpenFile({
                                        title: material.title,
                                        fileName: material.fileName || `${material.title}.pdf`,
                                        fileUrl: material.fileUrl,
                                        chapterId: material.chapterId || selectedChapter?.id,
                                        chapterNumber: selectedChapter?.chapterNumber,
                                        subjectId: selectedSubject?.id,
                                      });
                                      setDownloadModalData(resolveUniversalNotesData(material));
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-black transition-all shadow-sm cursor-pointer active:scale-95"
                                  >
                                    <Download className="w-4 h-4" />
                                    <span>डाउनलोड (File Manager / PDF)</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => downloadColorPDFNotes(resolveUniversalNotesData(material))}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-extrabold transition-colors cursor-pointer"
                                  >
                                    <Printer className="w-4 h-4" />
                                    <span>प्रिंट / PDF</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const resolvedBook = BOOKS.find((b) => b.id === (material.bookId || selectedChapter?.bookId));
                                      const primaryTest = TESTS.find((t) => t.chapterId === (material.chapterId || selectedChapter?.id) && t.isPublished);
                                      onNavigate('tests', {
                                        classLevel: selectedClass,
                                        subjectSlug: selectedSubjectSlug,
                                        bookSlug: resolvedBook?.slug || selectedBookSlug,
                                        chapterSlug: selectedChapter?.slug || selectedChapterSlug,
                                        testId: primaryTest?.id,
                                      });
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-black transition-all shadow-xs cursor-pointer active:scale-95"
                                  >
                                    <Play className="w-4 h-4 fill-current" />
                                    <span>🎯 ऑनलाइन टेस्ट दें</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShareModalData({
                                        title: material.title,
                                        subjectName: selectedSubject?.hindiName || selectedSubject?.name,
                                        chapterTitle: selectedChapter?.hindiTitle || selectedChapter?.title || material.title,
                                        classLevel: CLASSES_METADATA.find((c) => c.id === selectedClass)?.name || 'कक्षा 10',
                                        noteId: resolveNoteId(material),
                                        chapterSlug: selectedChapter?.slug,
                                        subjectSlug: selectedSubject?.slug,
                                        bookSlug: selectedBookSlug,
                                        description: material.description,
                                        customShareUrl: material.fileUrl && material.fileUrl !== '#' ? material.fileUrl : undefined,
                                      })
                                    }
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-black transition-all shadow-xs cursor-pointer active:scale-95"
                                    title="WhatsApp / Social Media Par Share Karein"
                                  >
                                    <Share2 className="w-4 h-4" />
                                    <span>शेयर नोट्स</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
           </div>
        )}

        {/* Modal for Big Letter Interactive Notes Viewer */}
        {viewingInteractiveNoteId && (
          <BigLetterPhysicsNotesViewer
            key={viewingInteractiveNoteId}
            initialChapterId={viewingInteractiveNoteId}
            isModal
            onClose={() => setViewingInteractiveNoteId(null)}
          />
        )}

        {/* Universal Document Preview Modal */}
        {previewDocumentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-black uppercase">
                      {previewDocumentModal.format || 'PDF'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                      {previewDocumentModal.fileSize || '2.4 MB'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      सत्यापित अध्ययन सामग्री
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                    {previewDocumentModal.title}
                  </h3>
                  {previewDocumentModal.description && (
                    <p className="text-sm text-slate-600 font-medium">
                      {previewDocumentModal.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewDocumentModal(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
                  title="बंद करें"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {previewDocumentModal.fileUrl &&
              (previewDocumentModal.fileUrl.startsWith('http') ||
                previewDocumentModal.fileUrl.startsWith('/api/')) ? (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 min-h-[560px]">
                  <FullPagePDFCanvasViewer
                    pdfUrl={previewDocumentModal.fileUrl}
                    title={previewDocumentModal.title}
                  />
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                  <div className="flex items-center gap-3 text-slate-800 font-black text-base">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span>बिहार बोर्ड मैट्रिक परीक्षा 2025-26 विशेष सामग्री</span>
                  </div>
                  <div className="text-sm text-slate-600 leading-relaxed space-y-2">
                    <p>
                      यह अध्ययन सामग्री RK STUDY CENTRE द्वारा नवीनतम NCERT/BSTBPC पाठ्यक्रम के आधार पर तैयार की गई है।
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700 pt-2">
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-2xs uppercase">कक्षा</span>
                        {previewDocumentModal.classLevel === 'class-10' ? '10वीं (Matric)' : previewDocumentModal.classLevel}
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-2xs uppercase">प्रारूप</span>
                        {previewDocumentModal.type || 'Study Material'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                {selectedChapter && (
                  <button
                    type="button"
                    onClick={() => {
                      const resolvedBook = BOOKS.find((b) => b.id === selectedChapter.bookId);
                      const primaryTest = TESTS.find((t) => t.chapterId === selectedChapter.id && t.isPublished);
                      setPreviewDocumentModal(null);
                      onNavigate('tests', {
                        classLevel: selectedClass,
                        subjectSlug: selectedSubjectSlug,
                        bookSlug: resolvedBook?.slug || selectedBookSlug,
                        chapterSlug: selectedChapter.slug || selectedChapterSlug,
                        testId: primaryTest?.id,
                      });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>ऑनलाइन टेस्ट दें</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const id = resolveNoteId(previewDocumentModal);
                    setPreviewDocumentModal(null);
                    setViewingInteractiveNoteId(id);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-black transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>मूल बुकलेट में खोलें (Hindi Ch 01 Design)</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadNotesAsHTMLFile(resolveUniversalNotesData(previewDocumentModal))}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-black transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>डाउनलोड (File Manager)</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadColorPDFNotes(resolveUniversalNotesData(previewDocumentModal))}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-black transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>प्रिंट / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDocumentModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-extrabold transition-colors cursor-pointer"
                >
                  बंद करें
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Offline Study Hub Modal */}
        <OfflineStudyHubModal
          isOpen={showOfflineHubModal}
          onClose={() => setShowOfflineHubModal(false)}
          onOpenInteractiveNote={(noteId) => setViewingInteractiveNoteId(noteId)}
        />

        {/* Share Notes & Material Modal */}
        {shareModalData && (
          <ShareNotesModal
            isOpen={Boolean(shareModalData)}
            onClose={() => setShareModalData(null)}
            data={shareModalData}
          />
        )}

        {/* Universal Download Notes Modal */}
        {downloadModalData && (
          <DownloadNotesModal
            isOpen={Boolean(downloadModalData)}
            onClose={() => setDownloadModalData(null)}
            data={downloadModalData}
          />
        )}

        {/* In-App PDF Viewer Modal */}
        <InAppPDFViewerModal
          isOpen={Boolean(pdfDocToView)}
          document={pdfDocToView}
          onClose={() => setPdfDocToView(null)}
        />

        {/* Class 10 Math Chapter 02 — 500 VVI Objective Question Bank & Live Test Modal */}
        {showMathCh02Bank500Modal.open && (
          <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md overflow-y-auto p-2 sm:p-4 md:p-6 animate-fade-in">
            <div className="max-w-6xl mx-auto">
              <MathCh02QuestionBank500Viewer
                initialMode={showMathCh02Bank500Modal.mode}
                onBack={() => setShowMathCh02Bank500Modal({ open: false, mode: 'solve' })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
