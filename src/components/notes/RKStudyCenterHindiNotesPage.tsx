import React, { useState, useMemo } from 'react';
import {
  Printer,
  Share2,
  Download,
  BookOpen,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Copy,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { RKStudyCenterLogo } from './RKStudyCenterLogo';
import { ShareNotesModal } from './ShareNotesModal';
import { DownloadNotesModal } from './DownloadNotesModal';
import { getEnrichedNotesData } from '../../utils/materialNotesMapper';
import { CLASS_10_HINDI_CH01_NOTES } from '../../data/class10HindiCh01Notes';
import { CLASS_10_HINDI_CH02_NOTES } from '../../data/class10HindiCh02Notes';
import { CLASS_10_HINDI_CH03_NOTES } from '../../data/class10HindiCh03Notes';
import { CLASS_10_HINDI_CHV01_NOTES } from '../../data/class10HindiChV01Notes';
import { CLASS_10_HINDI_KAVYA_CH03_NOTES } from '../../data/class10HindiKavyaCh03Notes';
import { CLASS_10_PHYSICS_CH01_NOTES } from '../../data/class10PhysicsNotes';
import { CLASS_10_PHYSICS_CH02_NOTES } from '../../data/class10PhysicsCh02Notes';
import { CLASS_10_PHYSICS_CH03_NOTES } from '../../data/class10PhysicsCh03Notes';
import { CLASS_10_PHYSICS_CH04_NOTES } from '../../data/class10PhysicsCh04Notes';
import { CLASS_10_PHYSICS_CH05_NOTES } from '../../data/class10PhysicsCh05Notes';
import { CLASS_10_PHYSICS_CH06_NOTES } from '../../data/class10PhysicsCh06Notes';
import { CLASS_10_GEOGRAPHY_CH02_NOTES } from '../../data/class10GeographyCh02Notes';
import { CLASS_10_GEOGRAPHY_CH03_NOTES } from '../../data/class10GeographyCh03Notes';
import { CLASS_10_GEOGRAPHY_CH04_NOTES } from '../../data/class10GeographyCh04Notes';
import { CLASS_10_GEOGRAPHY_CH05_NOTES } from '../../data/class10GeographyCh05Notes';
import { CLASS_10_HISTORY_CH01_NOTES } from '../../data/class10HistoryCh01Notes';
import { CLASS_10_HISTORY_CH02_NOTES } from '../../data/class10HistoryCh02Notes';
import { CLASS_10_HISTORY_CH03_NOTES } from '../../data/class10HistoryCh03Notes';
import { CLASS_10_HISTORY_CH04_NOTES } from '../../data/class10HistoryCh04Notes';
import { CLASS_10_HISTORY_CH05_NOTES } from '../../data/class10HistoryCh05Notes';
import { CLASS_10_HISTORY_CH06_NOTES } from '../../data/class10HistoryCh06Notes';
import { CLASS_10_HISTORY_CH07_NOTES } from '../../data/class10HistoryCh07Notes';
import { CLASS_10_HISTORY_CH08_NOTES } from '../../data/class10HistoryCh08Notes';
import { CLASS_10_BIOLOGY_CH01_NOTES } from '../../data/class10BiologyCh01Notes';
import { CLASS_10_CIVICS_CH01_NOTES } from '../../data/class10CivicsCh01Notes';
import { CLASS_10_MATH_CH01_NOTES } from '../../data/class10MathCh01Notes';
import { CLASS_10_MATH_CH02_NOTES } from '../../data/class10MathCh02Notes';
import { CLASS_10_MATH_CH03_NOTES } from '../../data/class10MathCh03Notes';
import { CLASS_12_PHYSICS_CH01_NOTES } from '../../data/class12PhysicsCh01Notes';
import { Class10MathCh02FormulaNotesPage } from './Class10MathCh02FormulaNotesPage';
import { MathCh02QuestionBank500Viewer } from './MathCh02QuestionBank500Viewer';

interface RKNotesPageProps {
  initialChapter?: string;
  onClose?: () => void;
  onOpenInteractive?: () => void;
  onStartTest?: () => void;
  onChapterChange?: (chapterKey: string) => void;
  isStandalone?: boolean;
  customChapterData?: any;
  subjectType?: 'hindi' | 'physics' | 'geography' | 'history' | 'biology' | 'civics' | 'math' | 'all';
  onOpenCh01QuestionBank?: () => void;
  fontSize?: 'normal' | 'big' | 'extra-big';
}

export const RKStudyCenterHindiNotesPage: React.FC<RKNotesPageProps> = ({
  initialChapter = 'g-01',
  onClose,
  onOpenInteractive,
  onStartTest,
  onChapterChange,
  isStandalone = false,
  customChapterData,
  subjectType = 'hindi',
  onOpenCh01QuestionBank,
  fontSize = 'big',
}) => {
  const [activeSubject, setActiveSubject] = useState<'hindi' | 'physics' | 'geography' | 'history' | 'biology' | 'civics' | 'math'>(
    subjectType === 'math'
      ? 'math'
      : subjectType === 'history'
      ? 'history'
      : subjectType === 'civics'
      ? 'civics'
      : subjectType === 'biology'
      ? 'biology'
      : subjectType === 'physics'
      ? 'physics'
      : subjectType === 'geography'
      ? 'geography'
      : 'hindi'
  );
  const [selectedChapterKey, setSelectedChapterKey] = useState<string>(initialChapter);
  const [viewPage, setViewPage] = useState<'all' | 'p1' | 'p2' | 'p3' | 'p4'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showAllAnswerKeys, setShowAllAnswerKeys] = useState<boolean>(false);
  const [activeFontSize, setActiveFontSize] = useState<'normal' | 'big' | 'extra-big'>(fontSize || 'big');
  const [rememberOnlyMode, setRememberOnlyMode] = useState<boolean>(false);
  const [formulaQuizMode, setFormulaQuizMode] = useState<boolean>(false);
  const [revealedFormulas, setRevealedFormulas] = useState<Record<number, boolean>>({});
  const [learnedFormulas, setLearnedFormulas] = useState<Record<number, boolean>>({});
  const [showMathCh02FormulaSheet, setShowMathCh02FormulaSheet] = useState<boolean>(false);
  const [mathCh02SubMode, setMathCh02SubMode] = useState<'500-read' | '500-test' | 'formula' | 'full-notes'>('500-read');

  React.useEffect(() => {
    if (fontSize) {
      setActiveFontSize(fontSize);
    }
  }, [fontSize]);

  // Sync state if initialChapter prop changes
  React.useEffect(() => {
    if (initialChapter) {
      setSelectedChapterKey(initialChapter);
    }
  }, [initialChapter]);

  // Sync activeSubject if subjectType changes
  React.useEffect(() => {
    if (subjectType && subjectType !== 'all') {
      setActiveSubject(subjectType);
    }
  }, [subjectType]);

  // Scroll to top whenever chapter changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedChapterKey]);

  // Chapters directory for Hindi
  const hindiChaptersList = [
    {
      key: 'g-01',
      section: 'गद्य खंड',
      sectionNumber: '01',
      title: 'श्रम विभाजन और जाति प्रथा',
      author: 'डॉ. भीमराव अंबेडकर',
      type: 'निबंध',
      data: CLASS_10_HINDI_CH01_NOTES,
      tagColor: 'bg-orange-500 text-white',
    },
    {
      key: 'v-01',
      section: 'काव्य खंड',
      sectionNumber: '01',
      title: 'राम नाम बिनु बिरथे जग जन्मा',
      author: 'गुरु नानक देव',
      type: 'पद',
      data: CLASS_10_HINDI_CHV01_NOTES,
      tagColor: 'bg-emerald-600 text-white',
    },
    {
      key: 'v-02',
      section: 'काव्य खंड',
      sectionNumber: '02',
      title: 'प्रेम-अयनि श्री राधिका / करील के कुंजन',
      author: 'रसखान',
      type: 'सवैया एवं दोहे',
      data: CLASS_10_HINDI_CH02_NOTES,
      tagColor: 'bg-purple-600 text-white',
    },
    {
      key: 'v-03',
      section: 'पद्य खंड',
      sectionNumber: '03',
      title: 'अति सूधो सनेह को मारग है / मो अँसुवानिहिं लै बरसौ',
      author: 'घनानंद (रीतिकाल)',
      type: 'सवैया एवं कवित्त',
      data: CLASS_10_HINDI_KAVYA_CH03_NOTES,
      tagColor: 'bg-amber-600 text-white',
    },
    {
      key: 'g-03',
      section: 'गद्य खंड',
      sectionNumber: '03',
      title: 'भारत से हम क्या सीखें',
      author: 'फ्रेडरिक मैक्समूलर',
      type: 'भाषण',
      data: CLASS_10_HINDI_CH03_NOTES,
      tagColor: 'bg-blue-600 text-white',
    },
  ];

  // Chapters directory for Physics
  const physicsChaptersList = [
    {
      key: 'c12-phy-01',
      section: 'भौतिकी (12th)',
      sectionNumber: '01',
      title: 'वैद्युत आवेश तथा क्षेत्र',
      author: 'RK STUDY CENTRE Physics Faculty',
      type: 'भौतिक विज्ञान (12th)',
      data: CLASS_12_PHYSICS_CH01_NOTES,
      tagColor: 'bg-indigo-600 text-white',
    },
    {
      key: 'phy-01',
      section: 'भौतिकी',
      sectionNumber: '01',
      title: 'प्रकाश - परावर्तन',
      author: 'By Prince Sir (Target Board)',
      type: 'भौतिक विज्ञान',
      data: CLASS_10_PHYSICS_CH01_NOTES,
      tagColor: 'bg-blue-600 text-white',
    },
    {
      key: 'phy-02',
      section: 'भौतिकी',
      sectionNumber: '02',
      title: 'प्रकाश - अपवर्तन',
      author: 'By Prince Sir (Target Board)',
      type: 'भौतिक विज्ञान',
      data: CLASS_10_PHYSICS_CH02_NOTES,
      tagColor: 'bg-cyan-600 text-white',
    },
    {
      key: 'phy-03',
      section: 'भौतिकी',
      sectionNumber: '03',
      title: 'मानव नेत्र एवं रंगबिरंगा संसार',
      author: 'By Prince Sir (Target Board)',
      type: 'भौतिक विज्ञान',
      data: CLASS_10_PHYSICS_CH03_NOTES,
      tagColor: 'bg-indigo-600 text-white',
    },
    {
      key: 'phy-04',
      section: 'भौतिकी',
      sectionNumber: '04',
      title: 'विद्युत (Electricity)',
      author: 'By Prince Sir (Target Board)',
      type: 'भौतिक विज्ञान',
      data: CLASS_10_PHYSICS_CH04_NOTES,
      tagColor: 'bg-amber-600 text-white',
    },
    {
      key: 'phy-05',
      section: 'भौतिकी',
      sectionNumber: '05',
      title: 'विद्युत धारा के चुंबकीय प्रभाव',
      author: 'By Prince Sir (Target Board)',
      type: 'भौतिक विज्ञान',
      data: CLASS_10_PHYSICS_CH05_NOTES,
      tagColor: 'bg-rose-600 text-white',
    },
    {
      key: 'phy-06',
      section: 'भौतिकी',
      sectionNumber: '06',
      title: 'ऊर्जा के स्रोत',
      author: 'By Prince Sir (Target Board)',
      type: 'भौतिक विज्ञान',
      data: CLASS_10_PHYSICS_CH06_NOTES,
      tagColor: 'bg-emerald-600 text-white',
    },
  ];

  // Chapters directory for Geography
  const geographyChaptersList = [
    {
      key: 'geo-02',
      section: 'भूगोल',
      sectionNumber: '02',
      title: 'कृषि (Agriculture)',
      author: 'टॉपर बैच (Target Board)',
      type: 'सामाजिक विज्ञान',
      data: CLASS_10_GEOGRAPHY_CH02_NOTES,
      tagColor: 'bg-emerald-600 text-white',
    },
    {
      key: 'geo-03',
      section: 'भूगोल',
      sectionNumber: '03',
      title: 'निर्माण उद्योग',
      author: 'टॉपर बैच (Target Board)',
      type: 'सामाजिक विज्ञान',
      data: CLASS_10_GEOGRAPHY_CH03_NOTES,
      tagColor: 'bg-purple-600 text-white',
    },
    {
      key: 'geo-04',
      section: 'भूगोल',
      sectionNumber: '04',
      title: 'परिवहन, संचार एवं व्यापार',
      author: 'टॉपर बैच (Target Board)',
      type: 'सामाजिक विज्ञान',
      data: CLASS_10_GEOGRAPHY_CH04_NOTES,
      tagColor: 'bg-blue-600 text-white',
    },
    {
      key: 'geo-05',
      section: 'भूगोल',
      sectionNumber: '05',
      title: 'बिहार: कृषि एवं वन संसाधन',
      author: 'टॉपर बैच (Target Board)',
      type: 'सामाजिक विज्ञान',
      data: CLASS_10_GEOGRAPHY_CH05_NOTES,
      tagColor: 'bg-amber-600 text-white',
    },
  ];

  // Chapters directory for History
  const historyChaptersList = [
    {
      key: 'his-01',
      section: 'इतिहास',
      sectionNumber: '01',
      title: 'यूरोप में राष्ट्रवाद',
      author: 'प्रिंस सर (Target Board / RK Study Centre)',
      type: 'सामाजिक विज्ञान (इतिहास)',
      data: CLASS_10_HISTORY_CH01_NOTES,
      tagColor: 'bg-amber-600 text-white',
    },
    {
      key: 'his-02',
      section: 'इतिहास',
      sectionNumber: '02',
      title: 'समाजवाद एवं साम्यवाद',
      author: 'प्रिंस सर (Target Board / RK Study Centre)',
      type: 'सामाजिक विज्ञान (इतिहास)',
      data: CLASS_10_HISTORY_CH02_NOTES,
      tagColor: 'bg-rose-600 text-white',
    },
    {
      key: 'his-03',
      section: 'इतिहास',
      sectionNumber: '03',
      title: 'हिन्द-चीन में राष्ट्रवाद',
      author: 'प्रिंस सर (Target Board / RK Study Centre)',
      type: 'सामाजिक विज्ञान (इतिहास)',
      data: CLASS_10_HISTORY_CH03_NOTES,
      tagColor: 'bg-emerald-600 text-white',
    },
    {
      key: 'his-04',
      section: 'इतिहास',
      sectionNumber: '04',
      title: 'भारत में राष्ट्रवाद',
      author: 'प्रिंस सर (Target Board / RK Study Centre)',
      type: 'सामाजिक विज्ञान (इतिहास)',
      data: CLASS_10_HISTORY_CH04_NOTES,
      tagColor: 'bg-orange-600 text-white',
    },
    {
      key: 'his-05',
      section: 'इतिहास',
      sectionNumber: '05',
      title: 'अर्थव्यवस्था एवं आजीविका',
      author: 'प्रिंस सर (Target Board / RK Study Centre)',
      type: 'सामाजिक विज्ञान (इतिहास)',
      data: CLASS_10_HISTORY_CH05_NOTES,
      tagColor: 'bg-indigo-600 text-white',
    },
    {
      key: 'his-06',
      section: 'इतिहास',
      sectionNumber: '06',
      title: 'शहरीकरण एवं शहरी जीवन',
      author: 'प्रिंस सर (Target Board / RK Study Centre)',
      type: 'सामाजिक विज्ञान (इतिहास)',
      data: CLASS_10_HISTORY_CH06_NOTES,
      tagColor: 'bg-teal-600 text-white',
    },
    {
      key: 'his-07',
      section: 'इतिहास',
      sectionNumber: '07',
      title: 'व्यापार और भूमंडलीकरण',
      author: 'प्रिंस सर (Target Board / RK Study Centre)',
      type: 'सामाजिक विज्ञान (इतिहास)',
      data: CLASS_10_HISTORY_CH07_NOTES,
      tagColor: 'bg-purple-600 text-white',
    },
    {
      key: 'his-08',
      section: 'इतिहास',
      sectionNumber: '08',
      title: 'प्रेस-संस्कृति एवं राष्ट्रवाद',
      author: 'प्रिंस सर (Target Board / RK Study Centre)',
      type: 'सामाजिक विज्ञान (इतिहास)',
      data: CLASS_10_HISTORY_CH08_NOTES,
      tagColor: 'bg-emerald-600 text-white',
    },
  ];

  // Chapters directory for Biology
  const biologyChaptersList = [
    {
      key: 'bio-01',
      section: 'जीव विज्ञान',
      sectionNumber: '01',
      title: 'जैव प्रक्रम (Life Processes)',
      author: 'प्रिंस सर (Target Board / RK Study Centre)',
      type: 'विज्ञान (जीव विज्ञान)',
      data: CLASS_10_BIOLOGY_CH01_NOTES,
      tagColor: 'bg-green-600 text-white',
    },
  ];

  // Chapters directory for Civics
  const civicsChaptersList = [
    {
      key: 'civ-01',
      section: 'नागरिक शास्त्र',
      sectionNumber: '01',
      title: 'लोकतंत्र में सत्ता की साझेदारी (Power Sharing)',
      author: 'प्रिंस सर (Target Board / RK Study Centre)',
      type: 'लोकतांत्रिक राजनीति - 2',
      data: CLASS_10_CIVICS_CH01_NOTES,
      tagColor: 'bg-indigo-600 text-white',
    },
  ];

  // Chapters directory for Mathematics (Class 10)
  const mathChaptersList = [
    {
      key: 'math-01',
      section: 'गणित (Math)',
      sectionNumber: '01',
      title: 'वास्तविक संख्याएँ (Real Numbers) — रिमेंबर नोट्स',
      author: 'प्रिंस सर (RK Study Centre)',
      type: 'गणित (रिमेंबर नोट्स एवं सूत्र)',
      data: CLASS_10_MATH_CH01_NOTES,
      tagColor: 'bg-rose-600 text-white',
    },
    {
      key: 'math-02',
      section: 'गणित (Math)',
      sectionNumber: '02',
      title: 'बहुपद (Polynomials) — रिमेंबर नोट्स',
      author: 'प्रिंस सर (RK Study Centre)',
      type: 'गणित (रिमेंबर नोट्स एवं सूत्र)',
      data: CLASS_10_MATH_CH02_NOTES,
      tagColor: 'bg-rose-600 text-white',
    },
    {
      key: 'math-03',
      section: 'गणित (Math)',
      sectionNumber: '03',
      title: 'दो चर वाले रैखिक समीकरण युग्म — रिमेंबर नोट्स एवं 500 VVI',
      author: 'प्रिंस सर (RK Study Centre)',
      type: 'गणित (रिमेंबर नोट्स, सूत्र एवं 500 प्रश्न बैंक)',
      data: CLASS_10_MATH_CH03_NOTES,
      tagColor: 'bg-rose-600 text-white',
    },
  ];

  // Active directory list according to activeSubject
  const chaptersList = useMemo(() => {
    if (activeSubject === 'math') return mathChaptersList;
    if (activeSubject === 'history') return historyChaptersList;
    if (activeSubject === 'civics') return civicsChaptersList;
    if (activeSubject === 'biology') return biologyChaptersList;
    if (activeSubject === 'physics') return physicsChaptersList;
    if (activeSubject === 'geography') return geographyChaptersList;
    return hindiChaptersList;
  }, [activeSubject]);

  const currentChapter = useMemo(() => {
    return chaptersList.find((c) => c.key === selectedChapterKey) || chaptersList[0];
  }, [chaptersList, selectedChapterKey]);

  // Final notes data to display: prefer customChapterData if provided, otherwise currentChapter.data
  const notesData = useMemo(() => {
    const raw = customChapterData || currentChapter?.data || CLASS_10_HINDI_CH01_NOTES;
    return getEnrichedNotesData(raw);
  }, [currentChapter, customChapterData]);

  // Normalized key formulas / facts
  const displayFormulas = useMemo(() => {
    if (Array.isArray(notesData?.keyFormulas) && notesData.keyFormulas.length > 0) {
      return notesData.keyFormulas;
    }
    if (Array.isArray(notesData?.formulae) && notesData.formulae.length > 0) {
      return notesData.formulae;
    }
    if (Array.isArray(notesData?.sections?.[0]?.keyPoints)) {
      return notesData.sections[0].keyPoints.slice(0, 6).map((pt: string, idx: number) => ({
        name: `मुख्य बिंदु ${idx + 1}`,
        formula: pt,
        note: 'बिहार बोर्ड परीक्षा हेतु अत्यंत महत्वपूर्ण',
      }));
    }
    return [];
  }, [notesData]);

  // Normalized subjective questions
  const displaySubjectives = useMemo(() => {
    const raw = notesData?.subjectiveQuestions || notesData?.shortQuestions || notesData?.subjectives || [];
    return raw.map((item: any, idx: number) => ({
      id: item.id || `q-${idx + 1}`,
      question: item.question,
      answer: item.answer,
      marks: item.marks || 5,
      boardYear: item.boardYear,
      isVVI: item.isVVI,
    }));
  }, [notesData]);

  // Normalized objective questions
  const displayObjectives = useMemo(() => {
    const raw = notesData?.objectiveQuestions || notesData?.objectives || [];
    return raw.map((q: any, idx: number) => {
      let optionsArray: Array<{ key: string; text: string }> = [];
      if (Array.isArray(q.options)) {
        optionsArray = q.options;
      } else if (q.options && typeof q.options === 'object') {
        optionsArray = Object.entries(q.options).map(([k, v]) => ({
          key: k,
          text: String(v),
        }));
      }
      return {
        id: q.id || idx + 1,
        question: q.question,
        options: optionsArray,
        correctOption: q.correctOption,
        explanation: q.explanation,
        yearAsked: q.yearAsked || q.boardYear,
      };
    });
  }, [notesData]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16 print:bg-white print:p-0 print:m-0">
      {/* ========================================================================= */}
      {/* WEB CONTROL TOOLBAR (Hidden in Print) */}
      {/* ========================================================================= */}
      <div className="sticky top-0 z-40 bg-slate-900 text-white shadow-xl border-b border-slate-800 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Status */}
          <div className="flex items-center gap-3">
            <RKStudyCenterLogo size="sm" variant="full" />
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-700">
              <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black text-xs">
                मूल अध्ययन नोट्स
              </span>
              <span className="text-xs text-slate-300 font-medium">
                कक्षा 10वीं • बिहार बोर्ड परीक्षा 2026–27
              </span>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Page Selector */}
            <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewPage('all')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  viewPage === 'all' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                संपूर्ण बुकलेट
              </button>
              <button
                type="button"
                onClick={() => setViewPage('p1')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  viewPage === 'p1' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                P1: परिचय
              </button>
              <button
                type="button"
                onClick={() => setViewPage('p2')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  viewPage === 'p2' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                P2: मुख्य बिंदु
              </button>
              <button
                type="button"
                onClick={() => setViewPage('p3')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  viewPage === 'p3' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                P3: प्रश्नोत्तर
              </button>
              <button
                type="button"
                onClick={() => setViewPage('p4')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  viewPage === 'p4' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                P4: वस्तुनिष्ठ
              </button>
            </div>

            {/* Active Big-Letter Size & Remember Mode Controls */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() =>
                  setActiveFontSize((prev) => (prev === 'extra-big' ? 'big' : 'extra-big'))
                }
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeFontSize === 'extra-big'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                    : 'text-amber-300 hover:text-white'
                }`}
                title="अक्षरों का आकार बड़ा या अति-बड़ा करें"
              >
                {activeFontSize === 'extra-big' ? 'अति-बड़े अक्षर (Extra Big)' : 'बड़े अक्षर (Big Letters)'}
              </button>
              <button
                type="button"
                onClick={() => setRememberOnlyMode((prev) => !prev)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  rememberOnlyMode
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                    : 'text-emerald-300 hover:text-white'
                }`}
                title="केवल रिमेंबर बॉक्स और सूत्र देखें"
              >
                {rememberOnlyMode ? 'संपूर्ण नोट्स दिखाएँ' : '⚡ केवल रिमेंबर मोड'}
              </button>
            </div>

            {/* Print A4 */}
            <div className="hidden md:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
                className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                title="ज़ूम आउट (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="px-2 py-0.5 text-amber-400 font-mono font-black cursor-pointer"
                title="100% रीसेट करें"
              >
                {zoomLevel}%
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
                className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                title="ज़ूम इन (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              title="A4 प्रिंट अथवा PDF के रूप में सेव करें"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट / PDF</span>
            </button>

            {/* Download Modal Button */}
            <button
              type="button"
              id="rk-notes-download-btn"
              onClick={() => setShowDownloadModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
              title="नोट्स फ़ाइल डाउनलोड करें"
            >
              <Download className="w-3.5 h-3.5 text-orange-400" />
              <span>डाउनलोड</span>
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
              title="व्हाट्सएप अथवा सोशल मीडिया पर शेयर करें"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>शेयर</span>
            </button>

            {/* Direct Start Online Test Button */}
            {(onStartTest || onOpenInteractive) && (
              <button
                type="button"
                onClick={() => (onStartTest ? onStartTest() : onOpenInteractive?.())}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-95"
                title="इस अध्याय का लाइव ऑनलाइन टेस्ट शुरू करें"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>⚡ टेस्ट शुरू करें</span>
              </button>
            )}

            {/* Switch to Interactive Mode */}
            {onOpenInteractive && (
              <button
                type="button"
                onClick={onOpenInteractive}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 font-bold text-xs transition-all cursor-pointer"
                title="बिग लेटर एवं इंटरैक्टिव टेस्ट मोड में खोलें"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden md:inline">इंटरैक्टिव मोड</span>
              </button>
            )}

            {/* Close Button if Modal */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-white transition-colors cursor-pointer ml-1"
                aria-label="बंद करें"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Subject and Chapter Selection Bar */}
        <div className="bg-slate-950/90 border-t border-slate-800 px-4 py-2 space-y-2">
          {/* Subject Switcher */}
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-black text-slate-400 shrink-0 uppercase tracking-wider">
              विषय:
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveSubject('hindi');
                setSelectedChapterKey(hindiChaptersList[0].key);
                onChapterChange?.(hindiChaptersList[0].key);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all shrink-0 cursor-pointer ${
                activeSubject === 'hindi'
                  ? 'bg-orange-600 text-white shadow-sm ring-1 ring-orange-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              📖 हिंदी (गोधूलि / वर्णिका)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSubject('physics');
                setSelectedChapterKey(physicsChaptersList[0].key);
                onChapterChange?.(physicsChaptersList[0].key);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all shrink-0 cursor-pointer ${
                activeSubject === 'physics'
                  ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              ⚡ भौतिक विज्ञान (Physics)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSubject('geography');
                setSelectedChapterKey(geographyChaptersList[0].key);
                onChapterChange?.(geographyChaptersList[0].key);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all shrink-0 cursor-pointer ${
                activeSubject === 'geography'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              🌍 भूगोल (Geography)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSubject('history');
                setSelectedChapterKey(historyChaptersList[0].key);
                onChapterChange?.(historyChaptersList[0].key);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all shrink-0 cursor-pointer ${
                activeSubject === 'history'
                  ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              🏛️ इतिहास (History)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSubject('biology');
                setSelectedChapterKey(biologyChaptersList[0].key);
                onChapterChange?.(biologyChaptersList[0].key);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all shrink-0 cursor-pointer ${
                activeSubject === 'biology'
                  ? 'bg-green-600 text-white shadow-sm ring-1 ring-green-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              🧬 जीव विज्ञान (Biology)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSubject('math');
                setSelectedChapterKey(mathChaptersList[0].key);
                onChapterChange?.(mathChaptersList[0].key);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all shrink-0 cursor-pointer ${
                activeSubject === 'math'
                  ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              🧮 गणित (Math)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSubject('civics');
                setSelectedChapterKey(civicsChaptersList[0].key);
                onChapterChange?.(civicsChaptersList[0].key);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all shrink-0 cursor-pointer ${
                activeSubject === 'civics'
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              ⚖️ नागरिक शास्त्र (Civics)
            </button>
          </div>

          {/* Chapter Selector */}
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-slate-800/60">
            <span className="text-xs font-black text-amber-400 shrink-0 uppercase tracking-wide">
              अध्याय चुनें:
            </span>
            {chaptersList.map((chap) => (
              <button
                key={chap.key}
                type="button"
                onClick={() => {
                  setSelectedChapterKey(chap.key);
                  onChapterChange?.(chap.key);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedChapterKey === chap.key
                    ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className="opacity-80 text-[10px] bg-black/30 px-1 rounded">
                  {chap.section} Ch {chap.sectionNumber}
                </span>
                <span>{chap.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRINT-READY A4 PORTRAIT CONTAINER */}
      {/* ========================================================================= */}
      <main
        style={zoomLevel !== 100 ? { zoom: `${zoomLevel}%` } : undefined}
        className="max-w-5xl mx-auto mt-3 sm:mt-5 px-2 sm:px-4 space-y-8 print:max-w-none print:w-full print:m-0 print:p-0 print:space-y-0"
      >
        
        {/* Chapter 01 500 Question Bank Banner */}
        {selectedChapterKey === 'his-01' && (
          <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-pink-700 text-white rounded-2xl p-5 shadow-2xl border-2 border-yellow-300 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse print:hidden">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <div>
                <h2 className="text-base sm:text-lg font-black">कक्षा 10वीं इतिहास — अध्याय 01 (यूरोप में राष्ट्रवाद)</h2>
                <p className="text-xs sm:text-sm text-yellow-200 font-semibold">500 Mapped PYQs, Board Exam Questions & Answer Key उपलब्ध है!</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenCh01QuestionBank?.()}
              className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-sm shadow-lg transition transform hover:scale-105 shrink-0 cursor-pointer"
            >
              📂 500 प्रश्न बैंक खोलें (Open QB)
            </button>
          </div>
        )}

        {/* Class 10 Maths Chapter 2 & Chapter 3 Mode Switcher: 500 Objective Bank vs Live Test vs Formula Sheet vs Full Notes */}
        {(selectedChapterKey === 'math-02' ||
          selectedChapterKey === 'math-03' ||
          notesData?.metadata?.chapterId === 'ch-c10-math-02' ||
          notesData?.metadata?.chapterId === 'ch-c10-math-03') && (
          <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-purple-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-indigo-700/70 flex flex-col lg:flex-row items-center justify-between gap-4 print:hidden">
            <div className="space-y-0.5 text-center lg:text-left">
              <div className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                {selectedChapterKey === 'math-03' || notesData?.metadata?.chapterId === 'ch-c10-math-03'
                  ? 'CLASS 10 MATHS • CHAPTER 3 — दो चर वाले रैखिक समीकरण युग्म • ALL FEATURES ACTIVE'
                  : 'CLASS 10 MATHS • CHAPTER 2 — बहुपद (POLYNOMIALS) • ALL FEATURES ACTIVE'}
              </div>
              <div className="text-sm sm:text-base font-black text-white">
                {mathCh02SubMode === '500-read'
                  ? 'प्रदर्शित: 500 VVI Objective Question Bank (Option Answer + Solved Step-by-Step Answer)'
                  : mathCh02SubMode === '500-test'
                  ? 'प्रदर्शित: 500 VVI Active Live Test Portal (Timer + OMR + Instant Solution)'
                  : mathCh02SubMode === 'formula'
                  ? 'प्रदर्शित: Formula & Quick Revision Notes (11 LaTeX Cards + Trick + VVI)'
                  : 'प्रदर्शित: संपूर्ण अध्याय थ्योरी + 20 VVI दीर्घ उत्तरीय प्रश्न + 500 वस्तुनिष्ठ'}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 bg-white/10 p-1.5 rounded-xl border border-white/20 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setMathCh02SubMode('500-read');
                  setShowMathCh02FormulaSheet(false);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  mathCh02SubMode === '500-read'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                🎯 500 VVI पढ़ें (Option + Solved)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMathCh02SubMode('500-test');
                  setShowMathCh02FormulaSheet(false);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  mathCh02SubMode === '500-test'
                    ? 'bg-emerald-400 text-slate-950 shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                ⚡ 500 VVI लाइव टेस्ट
              </button>
              <button
                type="button"
                onClick={() => {
                  setMathCh02SubMode('formula');
                  setShowMathCh02FormulaSheet(true);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  mathCh02SubMode === 'formula'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                ✨ Formula Sheet
              </button>
              <button
                type="button"
                onClick={() => {
                  setMathCh02SubMode('full-notes');
                  setShowMathCh02FormulaSheet(false);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  mathCh02SubMode === 'full-notes'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                📖 संपूर्ण नोट्स + 20 Long Q&amp;A
              </button>
            </div>
          </div>
        )}

        {(selectedChapterKey === 'math-02' ||
          selectedChapterKey === 'math-03' ||
          notesData?.metadata?.chapterId === 'ch-c10-math-02' ||
          notesData?.metadata?.chapterId === 'ch-c10-math-03') &&
        (mathCh02SubMode === '500-read' || mathCh02SubMode === '500-test') ? (
          <MathCh02QuestionBank500Viewer
            key={`${selectedChapterKey}-${mathCh02SubMode}`}
            chapterNumber={
              selectedChapterKey === 'math-03' || notesData?.metadata?.chapterId === 'ch-c10-math-03'
                ? 3
                : 2
            }
            initialMode={mathCh02SubMode === '500-test' ? 'test' : 'read'}
            onOpenFormulaSheet={() => {
              setMathCh02SubMode('formula');
              setShowMathCh02FormulaSheet(true);
            }}
          />
        ) : (selectedChapterKey === 'math-02' ||
            selectedChapterKey === 'math-03' ||
            notesData?.metadata?.chapterId === 'ch-c10-math-02' ||
            notesData?.metadata?.chapterId === 'ch-c10-math-03') &&
          mathCh02SubMode === 'formula' ? (
          <Class10MathCh02FormulaNotesPage
            key={`formula-${selectedChapterKey}`}
            chapterNumber={
              selectedChapterKey === 'math-03' || notesData?.metadata?.chapterId === 'ch-c10-math-03'
                ? 3
                : 2
            }
            isEmbedded={false}
            onOpenFullChapterNotes={() => setMathCh02SubMode('full-notes')}
          />
        ) : (
          <>
        
        {/* ========================================================================= */}
        {/* SHEET 1: HEADER, AUTHOR PROFILE & CORE THEORY / CONCEPTS */}
        {/* ========================================================================= */}
        {(viewPage === 'all' || viewPage === 'p1') && (
          <article className="relative bg-white rounded-2xl shadow-xl border border-slate-200 print:shadow-none print:border-0 print:rounded-none mb-8 print:mb-4">
            {/* Subtle Non-Obstructing RK STUDY CENTRE Watermark */}
            <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden z-0">
              <div className="-rotate-24 text-center opacity-[0.04]">
                <p className="text-3xl sm:text-5xl font-black tracking-widest text-slate-900 uppercase whitespace-nowrap">
                  RK STUDY CENTRE
                </p>
                <p className="text-xs sm:text-sm font-bold tracking-wider text-slate-800 uppercase mt-1">
                  मूल टॉपर्स नोट्स • PRINCE SIR
                </p>
              </div>
            </div>
            {/* --- PREMIUM RK STUDY CENTER DISTINCTIVE HEADER --- */}
            <header className="relative bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#0B192C] text-white p-4 sm:p-6 overflow-hidden border-b-4 border-orange-500">
              {/* Background highlights removed as per user request */}

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Brand Identity & Custom Monogram Logo */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <RKStudyCenterLogo size="lg" variant="badge" inverted={false} />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white font-sans">
                        RK STUDY CENTER
                      </span>
                      <span className="bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                        मूल टॉपर्स नोट्स
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-amber-200/90 font-semibold tracking-wide mt-0.5">
                      {notesData.metadata?.className || (notesData.metadata?.classLevel === 'class-12' ? 'कक्षा 12वीं (इंटर बोर्ड)' : 'कक्षा 10वीं (मैट्रिक बोर्ड)')} • संपूर्ण परीक्षा तैयारी संकलन
                    </p>
                  </div>
                </div>

                {/* Right: Academic Badge & Subject Classification */}
                <div className="flex flex-row md:flex-col items-start md:items-end justify-between gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-white/10">
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1 rounded-lg border border-white/20 text-xs font-black text-white">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{notesData.metadata?.classLevel === 'class-12' ? 'CLASS 12 • INTER EXAM' : 'CLASS 10 • BOARD EXAM'} 2026–27</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-orange-300 font-black">
                    <span>विषय: {notesData.metadata?.subjectName || currentChapter.section}</span>
                    <span className="text-white/40">•</span>
                    <span className="text-white bg-orange-600 px-2 py-0.5 rounded text-[11px]">
                      {currentChapter.section}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lower Chapter Banner Ribbon */}
              <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="bg-amber-400 text-slate-950 font-black text-sm sm:text-base px-3 py-1 rounded-lg shadow-sm">
                    अध्याय {(notesData.metadata?.chapterNumber || 1).toString().padStart(2, '0')}
                  </span>
                  <div>
                    <h1 className="text-lg sm:text-2xl font-black text-white leading-tight">
                      {notesData.metadata?.chapterHindiTitle || notesData.metadata?.chapterTitle || currentChapter.title}
                    </h1>
                    <p className="text-xs text-slate-200 font-medium">
                      विधा/प्रकार: <span className="text-amber-300 font-bold">{currentChapter.type}</span> | 
                      मार्गदर्शक / रचनाकार: <span className="text-amber-300 font-bold">{notesData.metadata?.author || currentChapter.author}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <span className="bg-white/10 px-2.5 py-1 rounded-md border border-white/15">
                    {notesData.sections?.length || 0} मुख्य खंड
                  </span>
                  <span className="bg-orange-500/20 text-orange-300 border border-orange-400/40 px-2.5 py-1 rounded-md">
                    {displayObjectives.length} VVI वस्तुनिष्ठ
                  </span>
                </div>
              </div>
            </header>

            {/* --- BODY CONTENT: SECTION 1 (Author/Facts, Formulas) --- */}
            <div className="p-4 sm:p-7 space-y-6">
              
              {/* Highlighted Author / Formula & Quick Remember Card with Clean Big-Letter Contrast */}
              {displayFormulas.length > 0 && (
                <section className="bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white rounded-2xl border-2 border-orange-300 p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-orange-200 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black text-base shadow-xs">
                        1
                      </div>
                      <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 flex-wrap">
                        <span>स्मरणीय सूत्र, महत्वपूर्ण नियम एवं त्वरित रिमेंबर नोट्स (Remember Box)</span>
                        <span className="text-xs sm:text-sm bg-orange-600 text-white font-black px-2.5 py-0.5 rounded-full">
                          VVI REMEMBER NOTES
                        </span>
                      </h2>
                    </div>

                    {/* Active Recall & Progress Toolbar for Formulas */}
                    <div className="flex items-center gap-2 flex-wrap print:hidden">
                      <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs sm:text-sm font-black">
                        याद किए गए सूत्र: {Object.values(learnedFormulas).filter(Boolean).length} / {displayFormulas.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormulaQuizMode((prev) => !prev);
                          setRevealedFormulas({});
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black cursor-pointer transition-all shadow-2xs ${
                          formulaQuizMode
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-900 text-amber-300 hover:bg-slate-800'
                        }`}
                      >
                        {formulaQuizMode ? 'सभी सूत्र दिखाएँ (Show All)' : '🧠 सूत्र याददाश्त टेस्ट (Hide Formulas)'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayFormulas.map((kf: any, idx: number) => {
                      const isFormulaVisible = !formulaQuizMode || Boolean(revealedFormulas[idx]);
                      const isLearned = Boolean(learnedFormulas[idx]);
                      return (
                        <div
                          key={idx}
                          className={`bg-white rounded-xl p-4 sm:p-5 border-2 shadow-xs transition-all ${
                            isLearned
                              ? 'border-emerald-500 bg-emerald-50/30'
                              : 'border-slate-200 hover:border-orange-400'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 text-base sm:text-lg font-black text-orange-900">
                              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                              <span>{kf.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setLearnedFormulas((prev) => ({ ...prev, [idx]: !prev[idx] }))
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-black shrink-0 cursor-pointer transition-all print:hidden ${
                                isLearned
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-900'
                              }`}
                            >
                              {isLearned ? '✓ याद हो गया' : 'याद करें'}
                            </button>
                          </div>

                          {isFormulaVisible ? (
                            <div
                              className={`${
                                activeFontSize === 'extra-big'
                                  ? 'text-xl sm:text-2xl md:text-3xl'
                                  : 'text-lg sm:text-xl md:text-2xl'
                              } font-black text-slate-950 mt-2.5 leading-snug bg-amber-50/90 px-4 py-3 rounded-xl border-l-4 border-orange-500`}
                            >
                              {kf.formula}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setRevealedFormulas((prev) => ({ ...prev, [idx]: true }))
                              }
                              className="w-full mt-2.5 px-4 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border-2 border-dashed border-indigo-300 text-indigo-900 font-black text-base sm:text-lg text-center cursor-pointer transition-all"
                            >
                              👁️ सूत्र देखने के लिए यहाँ क्लिक करें (Click to Reveal)
                            </button>
                          )}

                          {kf.note && (
                            <p className="text-base sm:text-lg text-slate-800 font-bold mt-2.5 leading-relaxed border-t border-slate-100 pt-2">
                              {kf.note}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Theory Content: Section 1 & 2 */}
              <div className="space-y-5">
                {(notesData.sections || []).slice(0, 2).map((sec: any, sIdx: number) => (
                  <section
                    key={sIdx}
                    className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 font-black text-xs">
                          भाग {sec.sectionNumber || (sIdx + 1).toString().padStart(2, '0')}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                          {sec.hindiTitle || sec.title}
                        </h3>
                      </div>
                      <span className="text-xs text-slate-500 font-bold hidden sm:inline">
                        RK STUDY CENTER • मूल टॉपर्स नोट्स
                      </span>
                    </div>

                    {/* Formatted Content with subtle highlights - Extra Large Text for readability */}
                    {!rememberOnlyMode && (
                      <div className={`text-slate-900 ${
                        activeFontSize === 'extra-big' 
                          ? 'text-2xl sm:text-3xl md:text-4xl' 
                          : activeFontSize === 'big'
                          ? 'text-xl sm:text-2xl md:text-3xl'
                          : 'text-lg sm:text-xl md:text-2xl'
                      } leading-relaxed font-semibold space-y-5`}>
                        {(sec.content || '').split('\n\n').map((paragraph: string, pIdx: number) => (
                          <p key={pIdx} className="text-justify whitespace-pre-line">
                            {(paragraph || '').split('**').map((chunk: string, cIdx: number) =>
                              cIdx % 2 === 1 ? (
                                <mark
                                  key={cIdx}
                                  className="bg-amber-100 text-slate-950 font-bold px-1.5 py-0.2 rounded border-b-2 border-amber-400"
                                >
                                  {chunk}
                                </mark>
                              ) : (
                                chunk
                              )
                            )}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Quick Remember Points Box in Sheet 1 */}
                    {sec.keyPoints && sec.keyPoints.length > 0 && (
                      <div className="mt-5 bg-emerald-50/85 border-2 border-emerald-300 rounded-xl p-4 sm:p-5 space-y-2.5">
                        <span className="text-sm sm:text-base font-black text-emerald-900 uppercase tracking-wide flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span>⚡ त्वरित रिमेंबर बिंदु (Quick Remember Points):</span>
                        </span>
                        <ul className="text-base sm:text-lg md:text-xl text-emerald-950 space-y-2 pl-5 list-disc font-bold leading-relaxed">
                          {(sec.keyPoints || []).map((kp: string, kpIdx: number) => (
                            <li key={kpIdx}>{kp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </div>

            {/* Sheet Footer */}
            <footer className="bg-slate-50 border-t-2 border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between text-xs font-bold text-slate-600 gap-2">
              <div className="flex items-center gap-2">
                <RKStudyCenterLogo size="sm" variant="mark-only" />
                <span className="font-black text-slate-900">RK STUDY CENTER</span>
                <span className="text-slate-300">•</span>
                <span className="text-orange-600">पढ़ाई • तैयारी • सफलता</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-slate-500">{notesData.metadata?.classLevel === 'class-12' ? 'CLASS 12' : 'CLASS 10'} • BOARD EXAM 2026–27</span>
                <span className="bg-slate-900 text-white px-2.5 py-0.5 rounded font-black text-xs">
                  खंड 01 / 04 • सैद्धांतिक भाग 1
                </span>
              </div>
            </footer>
          </article>
        )}

        {/* ========================================================================= */}
        {/* SHEET 2: EXTENDED THEORY, KEY POINTS & SUMMARY */}
        {/* ========================================================================= */}
        {(viewPage === 'all' || viewPage === 'p2') && (notesData.sections || []).length > 2 && (
          <article className="relative bg-white rounded-2xl shadow-xl border border-slate-200 print:shadow-none print:border-0 print:rounded-none mb-8 print:mb-4">
            <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden z-0">
              <div className="-rotate-24 text-center opacity-[0.04]">
                <p className="text-3xl sm:text-5xl font-black tracking-widest text-slate-900 uppercase whitespace-nowrap">
                  RK STUDY CENTRE
                </p>
              </div>
            </div>
            {/* Header Mini Ribbon */}
            <header className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b-2 border-orange-500">
              <div className="flex items-center gap-2">
                <RKStudyCenterLogo size="sm" variant="mark-only" />
                <span className="text-xs sm:text-sm font-bold text-slate-300">
                  अध्याय {(notesData.metadata?.chapterNumber || 1).toString().padStart(2, '0')}: {notesData.metadata?.chapterHindiTitle || currentChapter.title}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-black">
                <span className="bg-orange-600 text-white px-2 py-0.5 rounded">
                  अवधारणा विश्लेषण
                </span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-amber-300">
                  पृष्ठ 02
                </span>
              </div>
            </header>

            <div className="p-4 sm:p-7 space-y-6">
              {/* Theory Sections 3, 4, etc. */}
              <div className="space-y-5">
                {(notesData.sections || []).slice(2).map((sec: any, sIdx: number) => (
                  <section
                    key={sIdx}
                    className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 font-black text-xs">
                          भाग {sec.sectionNumber || (sIdx + 3).toString().padStart(2, '0')}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                          {sec.hindiTitle || sec.title}
                        </h3>
                      </div>
                    </div>

                    {!rememberOnlyMode && (
                      <div className={`text-slate-900 ${
                        activeFontSize === 'extra-big'
                          ? 'text-2xl sm:text-3xl md:text-4xl'
                          : activeFontSize === 'big'
                          ? 'text-xl sm:text-2xl md:text-3xl'
                          : 'text-lg sm:text-xl md:text-2xl'
                      } leading-relaxed font-semibold space-y-4`}>
                        {sec.content.split('\n\n').map((paragraph: string, pIdx: number) => (
                          <p key={pIdx} className="text-justify whitespace-pre-line">
                            {paragraph.split('**').map((chunk: string, cIdx: number) =>
                              cIdx % 2 === 1 ? (
                                <mark
                                  key={cIdx}
                                  className="bg-amber-100 text-slate-950 font-bold px-1.5 py-0.2 rounded border-b-2 border-amber-400"
                                >
                                  {chunk}
                                </mark>
                              ) : (
                                chunk
                              )
                            )}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Key takeaways bullet box */}
                    {sec.keyPoints && sec.keyPoints.length > 0 && (
                      <div className="mt-5 bg-emerald-50/85 border-2 border-emerald-300 rounded-xl p-4 sm:p-5 space-y-2.5">
                        <span className="text-sm sm:text-base font-black text-emerald-900 uppercase tracking-wide flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span>⚡ परीक्षा उपयोगी रिमेंबर तथ्य (Key Remember Points):</span>
                        </span>
                        <ul className="text-base sm:text-lg md:text-xl text-emerald-950 space-y-2 pl-5 list-disc font-bold leading-relaxed">
                          {(sec.keyPoints || []).map((kp: string, kpIdx: number) => (
                            <li key={kpIdx}>{kp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </div>

            {/* Footer */}
            <footer className="bg-slate-50 border-t-2 border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between text-xs font-bold text-slate-600 gap-2">
              <div className="flex items-center gap-2">
                <RKStudyCenterLogo size="sm" variant="mark-only" />
                <span className="font-black text-slate-900">RK STUDY CENTER</span>
                <span className="text-slate-300">•</span>
                <span className="text-orange-600">पढ़ाई • तैयारी • सफलता</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-slate-500">{notesData.metadata?.classLevel === 'class-12' ? 'CLASS 12' : 'CLASS 10'} • BOARD EXAM 2026–27</span>
                <span className="bg-slate-900 text-white px-2.5 py-0.5 rounded font-black text-xs">
                  खंड 02 / 04 • अवधारणा विश्लेषण
                </span>
              </div>
            </footer>
          </article>
        )}

        {/* ========================================================================= */}
        {/* SHEET 3: SUBJECTIVE QUESTIONS & MODEL ANSWERS */}
        {/* ========================================================================= */}
        {(viewPage === 'all' || viewPage === 'p3') && displaySubjectives.length > 0 && (
          <article className="relative bg-white rounded-2xl shadow-xl border border-slate-200 print:shadow-none print:border-0 print:rounded-none mb-8 print:mb-4">
            <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden z-0">
              <div className="-rotate-24 text-center opacity-[0.04]">
                <p className="text-3xl sm:text-5xl font-black tracking-widest text-slate-900 uppercase whitespace-nowrap">
                  RK STUDY CENTRE
                </p>
              </div>
            </div>
            <header className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b-2 border-orange-500">
              <div className="flex items-center gap-2">
                <RKStudyCenterLogo size="sm" variant="mark-only" />
                <span className="text-xs sm:text-sm font-bold text-slate-300">
                  अध्याय {(notesData.metadata?.chapterNumber || 1).toString().padStart(2, '0')}: {notesData.metadata?.chapterHindiTitle || currentChapter.title}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-black">
                <span className="bg-orange-600 text-white px-2 py-0.5 rounded">
                  सब्जेक्टिव प्रश्नोत्तर
                </span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-amber-300">
                  पृष्ठ 03
                </span>
              </div>
            </header>

            <div className="p-4 sm:p-7 space-y-5">
              <div className="border-b-2 border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>बोर्ड परीक्षा स्पेशल सब्जेक्टिव प्रश्नोत्तर</span>
                    <span className="bg-orange-100 text-orange-800 text-xs font-black px-2 py-0.5 rounded-full">
                      VVI Questions
                    </span>
                  </h2>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    मैट्रिक बोर्ड परीक्षा में सीधे पूछे जाने वाले सटीक एवं आदर्श उत्तर
                  </p>
                </div>
                <span className="text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-md">
                  कुल {displaySubjectives.length} प्रश्न
                </span>
              </div>

              {/* Grid of Subjective Cards */}
              <div className="space-y-4">
                {displaySubjectives.map((sq: any, qIdx: number) => (
                  <div
                    key={sq.id || qIdx}
                    className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 hover:border-orange-300 transition-colors shadow-xs"
                  >
                    {/* Question Head */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-start gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm shrink-0 mt-0.5">
                          {qIdx + 1}
                        </span>
                        <h4 className="text-base sm:text-xl md:text-2xl font-black text-slate-900 leading-snug">
                          {sq.question}
                        </h4>
                      </div>
                      <span className="bg-orange-100 text-orange-900 text-xs font-black px-2.5 py-1 rounded shrink-0">
                        {sq.marks || 5} अंक {sq.boardYear ? `• BSEB ${sq.boardYear}` : ''}
                      </span>
                    </div>

                    {/* Answer Block */}
                    <div className="pl-8 text-base sm:text-xl md:text-2xl text-slate-800 leading-relaxed font-medium border-l-4 border-orange-400 ml-3 pt-1">
                      <span className="font-black text-orange-700 block mb-1">आदर्श उत्तर:</span>
                      <p className="text-justify whitespace-pre-line">{sq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <footer className="bg-slate-50 border-t-2 border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between text-xs font-bold text-slate-600 gap-2">
              <div className="flex items-center gap-2">
                <RKStudyCenterLogo size="sm" variant="mark-only" />
                <span className="font-black text-slate-900">RK STUDY CENTER</span>
                <span className="text-slate-300">•</span>
                <span className="text-orange-600">पढ़ाई • तैयारी • सफलता</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-slate-500">{notesData.metadata?.classLevel === 'class-12' ? 'CLASS 12' : 'CLASS 10'} • BOARD EXAM 2026–27</span>
                <span className="bg-slate-900 text-white px-2.5 py-0.5 rounded font-black text-xs">
                  खंड 03 / 04 • सब्जेक्टिव प्रश्नोत्तर
                </span>
              </div>
            </footer>
          </article>
        )}

        {/* ========================================================================= */}
        {/* SHEET 4: OBJECTIVES MCQS & ANSWER KEYS */}
        {/* ========================================================================= */}
        {(viewPage === 'all' || viewPage === 'p4') && displayObjectives.length > 0 && (
          <article className="relative bg-white rounded-2xl shadow-xl border border-slate-200 print:shadow-none print:border-0 print:rounded-none mb-8 print:mb-4">
            <div aria-hidden="true" className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden z-0">
              <div className="-rotate-24 text-center opacity-[0.04]">
                <p className="text-3xl sm:text-5xl font-black tracking-widest text-slate-900 uppercase whitespace-nowrap">
                  RK STUDY CENTRE
                </p>
              </div>
            </div>
            <header className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b-2 border-orange-500">
              <div className="flex items-center gap-2">
                <RKStudyCenterLogo size="sm" variant="mark-only" />
                <span className="text-xs sm:text-sm font-bold text-slate-300">
                  अध्याय {(notesData.metadata?.chapterNumber || 1).toString().padStart(2, '0')}: {notesData.metadata?.chapterHindiTitle || currentChapter.title}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-black">
                <span className="bg-orange-600 text-white px-2 py-0.5 rounded">
                  VVI वस्तुनिष्ठ
                </span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-amber-300">
                  पृष्ठ 04
                </span>
              </div>
            </header>

            <div className="p-4 sm:p-7 space-y-6">
              <div className="border-b-2 border-slate-200 pb-3 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>वस्तुनिष्ठ प्रश्नोत्तर (Objective MCQs)</span>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2 py-0.5 rounded-full">
                      100% सटीक उत्तर
                    </span>
                  </h2>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    किसी भी विकल्प पर क्लिक करके तुरंत अपना उत्तर जांचें या लाइव टेस्ट शुरू करें
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowAllAnswerKeys(!showAllAnswerKeys)}
                    className={`px-3 py-1.5 rounded-lg font-black text-xs cursor-pointer transition-colors ${
                      showAllAnswerKeys
                        ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {showAllAnswerKeys ? 'उत्तर छिपाएं (Practice Mode)' : 'सभी सही उत्तर दिखाएं'}
                  </button>
                  {(onStartTest || onOpenInteractive) && (
                    <button
                      type="button"
                      onClick={() => (onStartTest ? onStartTest() : onOpenInteractive?.())}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg font-black text-xs cursor-pointer shadow-xs transition-all active:scale-95 flex items-center gap-1"
                    >
                      <span>⚡ लाइव टेस्ट शुरू करें ({displayObjectives.length} MCQs)</span>
                    </button>
                  )}
                  <span className="bg-orange-500 text-white px-3 py-1.5 rounded-lg font-black text-xs">
                    कुल {displayObjectives.length} वस्तुनिष्ठ
                  </span>
                </div>
              </div>

              {/* Two-Column Clean Grid of MCQs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayObjectives.map((q: any, idx: number) => {
                  const chosenKey = selectedAnswers[idx];
                  const isAnsweredCorrect = chosenKey === q.correctOption;
                  return (
                    <div
                      key={q.id || idx}
                      className={`bg-white rounded-xl border-2 p-3.5 shadow-xs transition-colors flex flex-col justify-between ${
                        chosenKey
                          ? isAnsweredCorrect
                            ? 'border-emerald-500 bg-emerald-50/20'
                            : 'border-red-400 bg-red-50/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        {/* Question Number & Text */}
                        <div className="flex items-start gap-2 mb-2.5">
                          <span className="w-5 h-5 rounded bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                            {q.question}
                          </p>
                        </div>

                        {/* Interactive Options A, B, C, D */}
                        <div className="grid grid-cols-2 gap-2 text-sm sm:text-base text-slate-700 pl-7 font-bold mb-3">
                          {(q.options || []).map((opt: any) => {
                            const isCorrect = opt.key === q.correctOption;
                            const isSelected = chosenKey === opt.key;
                            let optStyle = 'text-slate-700 bg-slate-50 hover:bg-blue-50 border border-slate-200';
                            if (isSelected) {
                              optStyle = isCorrect
                                ? 'bg-emerald-600 text-white font-black border border-emerald-600'
                                : 'bg-red-600 text-white font-black border border-red-600';
                            } else if ((showAllAnswerKeys || chosenKey) && isCorrect) {
                              optStyle = 'bg-amber-50 text-slate-950 font-black border border-amber-300';
                            }
                            return (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => setSelectedAnswers((prev) => ({ ...prev, [idx]: opt.key }))}
                                className={`flex items-center gap-2 p-2 rounded-lg text-left cursor-pointer transition-all active:scale-95 ${optStyle}`}
                              >
                                <span
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                                    isSelected
                                      ? 'bg-white text-slate-950 font-black'
                                      : (showAllAnswerKeys || chosenKey) && isCorrect
                                      ? 'bg-amber-500 text-slate-950 font-black'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {opt.key}
                                </span>
                                <span className="break-words leading-snug">{opt.text}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation if exists */}
                        {(showAllAnswerKeys || chosenKey) && q.explanation && (
                          <div className="pl-7 mb-3">
                            <div className="bg-slate-50 rounded-lg p-2.5 border-l-4 border-emerald-500 text-sm sm:text-base font-bold text-slate-700 italic">
                              व्याख्या: {q.explanation}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Answer Bar with Fast Check Button */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedAnswers((prev) => ({
                                ...prev,
                                [idx]: prev[idx] ? '' : q.correctOption,
                              }))
                            }
                            className={`font-black px-2.5 py-1 rounded-md text-[11px] cursor-pointer transition-all active:scale-95 flex items-center gap-1 ${
                              showAllAnswerKeys || chosenKey
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                            }`}
                          >
                            <span>
                              {showAllAnswerKeys || chosenKey
                                ? `✓ सही उत्तर: (${q.correctOption})`
                                : '✓ उत्तर जांचें (Check)'}
                            </span>
                          </button>
                        </div>
                        {q.yearAsked && (
                          <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                            BSEB {q.yearAsked}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Fast Test Start & Check Bar inside Sheet 4 */}
              <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-lg print:hidden">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-base sm:text-lg font-black text-amber-300">
                    🎯 क्या आपने सभी {displayObjectives.length} वस्तुनिष्ठ प्रश्न हल कर लिए?
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium">
                    एक क्लिक में सभी उत्तर जांचें या टाइमर के साथ लाइव ऑनलाइन टेस्ट शुरू करें!
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAllAnswerKeys((prev) => !prev)}
                    className={`w-full sm:w-auto px-5 py-3.5 rounded-xl font-black text-xs sm:text-sm shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 border-2 ${
                      showAllAnswerKeys
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'bg-white/15 hover:bg-white/25 text-white border-white/30'
                    }`}
                  >
                    <span>{showAllAnswerKeys ? 'उत्तर छुपाएं (Hide Check)' : '✓ सभी उत्तर जांचें (Fast Check)'}</span>
                  </button>
                  {(onStartTest || onOpenInteractive) && (
                    <button
                      type="button"
                      onClick={() => (onStartTest ? onStartTest() : onOpenInteractive?.())}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base shadow-lg transition-all active:scale-95 cursor-pointer shrink-0 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>⚡ तुरंत ऑनलाइन टेस्ट शुरू करें (Start Test)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="bg-slate-50 border-t-2 border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between text-xs font-bold text-slate-600 gap-2">
              <div className="flex items-center gap-2">
                <RKStudyCenterLogo size="sm" variant="mark-only" />
                <span className="font-black text-slate-900">RK STUDY CENTER</span>
                <span className="text-slate-300">•</span>
                <span className="text-orange-600">पढ़ाई • तैयारी • सफलता</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-slate-500">{notesData.metadata?.classLevel === 'class-12' ? 'CLASS 12' : 'CLASS 10'} • BOARD EXAM 2026–27</span>
                <span className="bg-slate-900 text-white px-2.5 py-0.5 rounded font-black text-xs">
                  खंड 04 / 04 • VVI वस्तुनिष्ठ MCQs
                </span>
              </div>
            </footer>
          </article>
        )}
          </>
        )}

      </main>

      {/* Sticky Bottom Fast Action Bar (hidden when Math Ch02 Formula Sheet is active, as it has its own Quick Revision bar) */}
      {!((selectedChapterKey === 'math-02' || notesData?.metadata?.chapterId === 'ch-c10-math-02') && showMathCh02FormulaSheet) && (
      <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 px-4 py-2.5 print:hidden shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="truncate max-w-[200px] sm:max-w-none">
              {notesData.metadata?.chapterHindiTitle || currentChapter.title} ({displayObjectives.length} VVI MCQs)
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => {
                setViewPage('p4');
                setShowAllAnswerKeys((prev) => !prev);
              }}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 ${
                showAllAnswerKeys
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <span>{showAllAnswerKeys ? 'उत्तर छुपाएं' : '✓ उत्तर जांचें (Check)'}</span>
            </button>
            {(onStartTest || onOpenInteractive) && (
              <button
                type="button"
                onClick={() => (onStartTest ? onStartTest() : onOpenInteractive?.())}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>⚡ टेस्ट शुरू करें (Start Test)</span>
              </button>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareNotesModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          data={{
            title: notesData.metadata?.chapterHindiTitle || currentChapter.title,
            chapterTitle: notesData.metadata?.chapterHindiTitle || currentChapter.title,
            subjectName: notesData.metadata?.subjectName || currentChapter.section,
            classLevel: notesData.metadata?.className || 'कक्षा 10',
            description: `RK STUDY CENTER द्वारा तैयार ${notesData.metadata?.className || 'क्लास 10th'} ${notesData.metadata?.subjectName || ''} के संपूर्ण प्रीमियम परीक्षा नोट्स`,
          }}
        />
      )}

      {/* Download Modal */}
      {showDownloadModal && (
        <DownloadNotesModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          data={notesData}
        />
      )}
    </div>
  );
};
