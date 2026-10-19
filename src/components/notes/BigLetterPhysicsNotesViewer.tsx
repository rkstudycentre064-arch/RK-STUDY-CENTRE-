import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Search,
  Printer,
  ChevronRight,
  Sparkles,
  Award,
  Maximize2,
  X,
  FileText,
  Calculator,
  ArrowRight,
  Share2,
  Check,
  Bookmark,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Layers,
  HardDrive,
  Download,
  BarChart3,
} from 'lucide-react';
import { ShareNotesModal } from './ShareNotesModal';
import { DownloadNotesModal } from './DownloadNotesModal';
import { AnnotationsDrawerModal } from './AnnotationsDrawerModal';
import { saveAnnotation } from '../../services/annotationService';
import { WatermarkWrapper } from '../WatermarkWrapper';
import { CLASS_10_PHYSICS_CH01_NOTES, ObjectiveQuestionItem } from '../../data/class10PhysicsNotes';
import { CLASS_10_HINDI_CH01_NOTES } from '../../data/class10HindiCh01Notes';
import { CLASS_10_HINDI_CH02_NOTES } from '../../data/class10HindiCh02Notes';
import { CLASS_10_HINDI_CH03_NOTES } from '../../data/class10HindiCh03Notes';
import { CLASS_10_HINDI_CHV01_NOTES } from '../../data/class10HindiChV01Notes';
import { CLASS_10_HINDI_KAVYA_CH03_NOTES } from '../../data/class10HindiKavyaCh03Notes';
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
import { CLASS_12_PHYSICS_CH01_NOTES } from '../../data/class12PhysicsCh01Notes';
import { resolveUniversalNotesData } from '../../utils/materialNotesMapper';
import { CHAPTERS, SUBJECTS } from '../../lib/constants';
import { toggleChapterCompletion, PROGRESS_UPDATED_EVENT, recordTestResult } from '../../services/progressService';
import { cacheInteractiveNote } from '../../services/offlineStorage';
import type { StoredTestResult } from '../../types';

import { RKStudyCenterHindiNotesPage } from './RKStudyCenterHindiNotesPage';
import { RKStudyCenterLogo } from './RKStudyCenterLogo';
import { HistoryCh01QuestionBank500Viewer } from './HistoryCh01QuestionBank500Viewer';
import { Physics500QuestionBankViewer } from './Physics500QuestionBankViewer';
import { PhysicsProgressTrackerModal } from './PhysicsProgressTrackerModal';
import { AIDoubtSolverModal } from '../AIDoubtSolverModal';
import { PhysicsCh01MarathonModal } from '../PhysicsCh01MarathonModal';

export type FontSizeLevel = 'normal' | 'big' | 'extra-big';

interface BigLetterPhysicsNotesViewerProps {
  key?: React.Key;
  initialChapterId?: string;
  initialChapterNumber?: number;
  onClose?: () => void;
  isModal?: boolean;
}

export function BigLetterPhysicsNotesViewer({
  initialChapterId = 'ch-c10-sci-phy-02',
  initialChapterNumber = 2,
  onClose,
  isModal = false,
}: BigLetterPhysicsNotesViewerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Check if viewing Class 12 Physics Chapter
  const isPhysics12 = Boolean(
    initialChapterId?.includes('c12-phy') ||
    initialChapterId?.includes('c12_physics') ||
    initialChapterId === 'ch-c12-p-1' ||
    initialChapterId === 'ch-c12-sci-phy-01' ||
    initialChapterId === 'sm-c12-phy-ch01-notes' ||
    initialChapterId === 'c12-phy-ch01' ||
    initialChapterId?.includes('electric charges') ||
    initialChapterId?.includes('वैद्युत आवेश') ||
    ((initialChapterId?.includes('c12') || initialChapterId?.includes('12th')) && (initialChapterId?.includes('phy') || initialChapterId?.includes('भौतिक')))
  );

  // Check if viewing History Chapter
  const isHistory = Boolean(
    initialChapterId?.includes('his') ||
    initialChapterId?.includes('c10-his') ||
    initialChapterId === 'ch-c10-soc-his-01' ||
    initialChapterId === 'ch-c10-soc-his-02' ||
    initialChapterId === 'ch-c10-soc-his-03' ||
    initialChapterId === 'ch-c10-soc-his-04' ||
    initialChapterId === 'ch-c10-soc-his-05' ||
    initialChapterId === 'ch-c10-soc-his-06' ||
    initialChapterId === 'ch-c10-soc-his-07' ||
    initialChapterId === 'ch-c10-soc-his-08' ||
    initialChapterId?.includes('राष्ट्रवाद') ||
    initialChapterId?.includes('साम्यवाद') ||
    initialChapterId?.includes('समाजवाद') ||
    initialChapterId?.includes('शहरीकरण') ||
    initialChapterId?.includes('व्यापार') ||
    initialChapterId?.includes('भूमंडलीकरण') ||
    initialChapterId?.includes('प्रेस') ||
    initialChapterId?.includes('संस्कृति') ||
    initialChapterId?.includes('गुटेनबर्ग') ||
    initialChapterId?.includes('इतिहास')
  );

  // Check if viewing Biology Chapter
  const isBiology = Boolean(
    initialChapterId?.includes('bio') ||
    initialChapterId?.includes('c10-bio') ||
    initialChapterId === 'ch-c10-sci-bio-01' ||
    initialChapterId?.includes('जैव')
  );

  // Check if viewing Geography Chapter
  const isGeography = Boolean(
    initialChapterId?.includes('geo') || 
    initialChapterId?.includes('c10-geo') ||
    initialChapterId === 'ch-c10-soc-geo-02' ||
    initialChapterId === 'ch-c10-soc-geo-03' ||
    initialChapterId === 'ch-c10-soc-geo-04' ||
    initialChapterId === 'ch-c10-soc-geo-05'
  );

  // Check if viewing Hindi Chapter
  const isHindi = Boolean(
    initialChapterId?.includes('hin') ||
    initialChapterId?.includes('c10-hin') ||
    initialChapterId === 'ch-c10-hin-g-01'
  );

  // Check if viewing Civics Chapter
  const isCivics = Boolean(
    initialChapterId?.includes('civ') ||
    initialChapterId?.includes('c10-soc-civ') ||
    initialChapterId === 'ch-c10-soc-civ-01' ||
    initialChapterId?.includes('नागरिक') ||
    initialChapterId?.includes('सत्ता')
  );

  // Check if viewing Class 10 Mathematics Chapter
  const isMath = Boolean(
    initialChapterId?.includes('math') ||
    initialChapterId?.includes('c10-math') ||
    initialChapterId === 'ch-c10-math-01' ||
    initialChapterId === 'ch-c10-math-02' ||
    initialChapterId?.includes('गणित') ||
    initialChapterId?.includes('वास्तविक') ||
    initialChapterId?.includes('बहुपद') ||
    initialChapterId?.includes('polynomial') ||
    initialChapterId?.includes('real numbers')
  );

  const customChapterData = Boolean(isMath || isHistory || isCivics || isBiology || isHindi || isGeography);

  // Default to RK Study Center Original Notes Book view (Hindi Chapter 01 Design) for ALL notes
  const [showRKNotesView, setShowRKNotesView] = useState<boolean>(true);
  const [showCh01QuestionBank500, setShowCh01QuestionBank500] = useState<boolean>(false);

  // Active History chapter (1, 2, 3, 4, 5 or 6)
  const [selectedHistoryChapterNumber, setSelectedHistoryChapterNumber] = useState<number>(() => {
    if (
      initialChapterId?.includes('06') ||
      initialChapterId?.includes('ch06') ||
      initialChapterId === 'ch-c10-soc-his-06' ||
      initialChapterId?.includes('शहरीकरण') ||
      initialChapterNumber === 6
    ) {
      return 6;
    }
    if (
      initialChapterId?.includes('05') ||
      initialChapterId?.includes('ch05') ||
      initialChapterId === 'ch-c10-soc-his-05' ||
      initialChapterId?.includes('अर्थव्यवस्था') ||
      initialChapterId?.includes('औद्योगीकरण') ||
      initialChapterNumber === 5
    ) {
      return 5;
    }
    if (
      initialChapterId?.includes('04') ||
      initialChapterId?.includes('ch04') ||
      initialChapterId === 'ch-c10-soc-his-04' ||
      initialChapterId?.includes('भारत में राष्ट्रवाद') ||
      initialChapterNumber === 4
    ) {
      return 4;
    }
    if (
      initialChapterId?.includes('03') ||
      initialChapterId?.includes('ch03') ||
      initialChapterId === 'ch-c10-soc-his-03' ||
      initialChapterId?.includes('हिन्द-चीन') ||
      initialChapterNumber === 3
    ) {
      return 3;
    }
    if (
      initialChapterId?.includes('02') ||
      initialChapterId?.includes('ch02') ||
      initialChapterId === 'ch-c10-soc-his-02' ||
      initialChapterId?.includes('साम्यवाद') ||
      initialChapterId?.includes('समाजवाद') ||
      initialChapterNumber === 2
    ) {
      return 2;
    }
    return 1;
  });

  // Active Hindi chapter (1, 2, 3 or 101 for poetry ch 1)
  const [selectedHindiChapterNumber, setSelectedHindiChapterNumber] = useState<number>(() => {
    if (initialChapterId?.includes('v-02') || initialChapterId === 'ch-c10-hin-v-02') return 102;
    if (initialChapterId?.includes('v-01') || initialChapterId === 'ch-c10-hin-v-01') return 101;
    if (initialChapterId?.includes('03') || initialChapterId?.includes('ch03') || initialChapterId === 'ch-c10-hin-g-03' || initialChapterNumber === 3) return 3;
    return 1;
  });

  // Active geography chapter (2, 3, 4 or 5)
  const [selectedGeoChapterNumber, setSelectedGeoChapterNumber] = useState<number>(() => {
    if (initialChapterId?.includes('05') || initialChapterId?.includes('ch05') || initialChapterNumber === 5) return 5;
    if (initialChapterId?.includes('04') || initialChapterId?.includes('ch04') || initialChapterNumber === 4) return 4;
    if (initialChapterId?.includes('03') || initialChapterId?.includes('ch03') || initialChapterNumber === 3) return 3;
    return 2;
  });

  // Select active math chapter (1 or 2)
  const [selectedMathChapterNumber, setSelectedMathChapterNumber] = useState<number>(() => {
    if (
      initialChapterId?.includes('02') ||
      initialChapterId?.includes('ch02') ||
      initialChapterId === 'ch-c10-math-02' ||
      initialChapterId?.includes('बहुपद') ||
      initialChapterNumber === 2
    ) {
      return 2;
    }
    return 1;
  });

  // Select active physics chapter (1, 2, 3, 4, 5 or 6)
  const [selectedChapterNumber, setSelectedChapterNumber] = useState<number>(() => {
    if (initialChapterId?.includes('06') || initialChapterId?.includes('ch06') || initialChapterNumber === 6) return 6;
    if (initialChapterId?.includes('05') || initialChapterId?.includes('ch05') || initialChapterNumber === 5) return 5;
    if (initialChapterId?.includes('04') || initialChapterId?.includes('ch04') || initialChapterNumber === 4) return 4;
    if (initialChapterId?.includes('03') || initialChapterId?.includes('ch03') || initialChapterNumber === 3) return 3;
    if (initialChapterId?.includes('01') || initialChapterNumber === 1) return 1;
    return 2;
  });

  // Keep state synchronized whenever initialChapterId or initialChapterNumber changes
  useEffect(() => {
    if (initialChapterId) {
      if (
        initialChapterId.includes('his') ||
        initialChapterId.includes('c10-his') ||
        initialChapterId.includes('इतिहास') ||
        initialChapterId.includes('साम्यवाद') ||
        initialChapterId.includes('समाजवाद') ||
        initialChapterId.includes('राष्ट्रवाद') ||
        initialChapterId.includes('हिन्द-चीन') ||
        initialChapterId.includes('भारत में राष्ट्रवाद') ||
        initialChapterId.includes('अर्थव्यवस्था') ||
        initialChapterId.includes('औद्योगीकरण') ||
        initialChapterId.includes('व्यापार') ||
        initialChapterId.includes('भूमंडलीकरण') ||
        initialChapterId.includes('प्रेस') ||
        initialChapterId.includes('संस्कृति') ||
        initialChapterId.includes('गुटेनबर्ग')
      ) {
        if (
          initialChapterId.includes('08') ||
          initialChapterId.includes('ch08') ||
          initialChapterId === 'ch-c10-soc-his-08' ||
          initialChapterId.includes('प्रेस') ||
          initialChapterId.includes('संस्कृति') ||
          initialChapterId.includes('गुटेनबर्ग') ||
          initialChapterNumber === 8
        ) {
          setSelectedHistoryChapterNumber(8);
        } else if (
          initialChapterId.includes('07') ||
          initialChapterId.includes('ch07') ||
          initialChapterId === 'ch-c10-soc-his-07' ||
          initialChapterId.includes('व्यापार') ||
          initialChapterId.includes('भूमंडलीकरण') ||
          initialChapterNumber === 7
        ) {
          setSelectedHistoryChapterNumber(7);
        } else if (
          initialChapterId.includes('06') ||
          initialChapterId.includes('ch06') ||
          initialChapterId === 'ch-c10-soc-his-06' ||
          initialChapterId.includes('शहरीकरण') ||
          initialChapterNumber === 6
        ) {
          setSelectedHistoryChapterNumber(6);
        } else if (
          initialChapterId.includes('05') ||
          initialChapterId.includes('ch05') ||
          initialChapterId === 'ch-c10-soc-his-05' ||
          initialChapterId.includes('अर्थव्यवस्था') ||
          initialChapterId.includes('औद्योगीकरण') ||
          initialChapterNumber === 5
        ) {
          setSelectedHistoryChapterNumber(5);
        } else if (
          initialChapterId.includes('04') ||
          initialChapterId.includes('ch04') ||
          initialChapterId === 'ch-c10-soc-his-04' ||
          initialChapterId.includes('भारत में राष्ट्रवाद') ||
          initialChapterNumber === 4
        ) {
          setSelectedHistoryChapterNumber(4);
        } else if (
          initialChapterId.includes('03') ||
          initialChapterId.includes('ch03') ||
          initialChapterId.includes('हिन्द-चीन') ||
          initialChapterNumber === 3
        ) {
          setSelectedHistoryChapterNumber(3);
        } else if (
          initialChapterId.includes('02') ||
          initialChapterId.includes('ch02') ||
          initialChapterId === 'ch-c10-soc-his-02' ||
          initialChapterId?.includes('साम्यवाद') ||
          initialChapterId?.includes('समाजवाद') ||
          initialChapterNumber === 2
        ) {
          setSelectedHistoryChapterNumber(2);
        } else {
          setSelectedHistoryChapterNumber(1);
        }
      }

      if (
        initialChapterId.includes('v-03') ||
        initialChapterId.includes('k-03') ||
        initialChapterId.includes('padya-03') ||
        initialChapterId.includes('g-15') ||
        initialChapterId.includes('chapter-15') ||
        initialChapterId.includes('घनानंद') ||
        initialChapterId.includes('सनेह')
      ) {
        setSelectedHindiChapterNumber(103);
      } else if (initialChapterId.includes('v-02') || initialChapterId === 'ch-c10-hin-v-02') {
        setSelectedHindiChapterNumber(102);
      } else if (initialChapterId.includes('v-01') || initialChapterId === 'ch-c10-hin-v-01') {
        setSelectedHindiChapterNumber(101);
      } else if (initialChapterId.includes('03') || initialChapterId.includes('ch03') || initialChapterId === 'ch-c10-hin-g-03') {
        setSelectedHindiChapterNumber(3);
      } else if (initialChapterId.includes('hin') || initialChapterId.includes('c10-hin')) {
        setSelectedHindiChapterNumber(1);
      }

      if (initialChapterId.includes('math') || initialChapterId.includes('c10-math') || initialChapterId.includes('गणित') || initialChapterId.includes('बहुपद')) {
        if (
          initialChapterId.includes('02') ||
          initialChapterId.includes('ch02') ||
          initialChapterId === 'ch-c10-math-02' ||
          initialChapterId.includes('बहुपद') ||
          initialChapterNumber === 2
        ) {
          setSelectedMathChapterNumber(2);
        } else {
          setSelectedMathChapterNumber(1);
        }
      }

      if (initialChapterId.includes('geo') || initialChapterId.includes('c10-geo')) {
        if (initialChapterId.includes('05') || initialChapterId.includes('ch05')) setSelectedGeoChapterNumber(5);
        else if (initialChapterId.includes('04') || initialChapterId.includes('ch04')) setSelectedGeoChapterNumber(4);
        else if (initialChapterId.includes('03') || initialChapterId.includes('ch03')) setSelectedGeoChapterNumber(3);
        else setSelectedGeoChapterNumber(2);
      }

      if (!initialChapterId.includes('hin') && !initialChapterId.includes('geo') && !initialChapterId.includes('his') && !initialChapterId.includes('c10-his')) {
        if (initialChapterId.includes('06') || initialChapterId.includes('ch06')) setSelectedChapterNumber(6);
        else if (initialChapterId.includes('05') || initialChapterId.includes('ch05')) setSelectedChapterNumber(5);
        else if (initialChapterId.includes('04') || initialChapterId.includes('ch04')) setSelectedChapterNumber(4);
        else if (initialChapterId.includes('03') || initialChapterId.includes('ch03')) setSelectedChapterNumber(3);
        else if (initialChapterId.includes('01')) setSelectedChapterNumber(1);
        else setSelectedChapterNumber(2);
      }
    }
  }, [initialChapterId, initialChapterNumber]);

  // Active notes data object based on selected chapter - fully normalized
  const currentChapterData = useMemo(() => {
    let raw: any;
    if (isPhysics12) {
      raw = CLASS_12_PHYSICS_CH01_NOTES;
    } else if (isHistory) {
      if (selectedHistoryChapterNumber === 8) raw = CLASS_10_HISTORY_CH08_NOTES;
      else if (selectedHistoryChapterNumber === 7) raw = CLASS_10_HISTORY_CH07_NOTES;
      else if (selectedHistoryChapterNumber === 6) raw = CLASS_10_HISTORY_CH06_NOTES;
      else if (selectedHistoryChapterNumber === 5) raw = CLASS_10_HISTORY_CH05_NOTES;
      else if (selectedHistoryChapterNumber === 4) raw = CLASS_10_HISTORY_CH04_NOTES;
      else if (selectedHistoryChapterNumber === 3) raw = CLASS_10_HISTORY_CH03_NOTES;
      else if (selectedHistoryChapterNumber === 2) raw = CLASS_10_HISTORY_CH02_NOTES;
      else raw = CLASS_10_HISTORY_CH01_NOTES;
    } else if (isBiology) {
      raw = CLASS_10_BIOLOGY_CH01_NOTES;
    } else if (isHindi) {
      if (selectedHindiChapterNumber === 103) raw = CLASS_10_HINDI_KAVYA_CH03_NOTES;
      else if (selectedHindiChapterNumber === 102) raw = CLASS_10_HINDI_CH02_NOTES;
      else if (selectedHindiChapterNumber === 101) raw = CLASS_10_HINDI_CHV01_NOTES;
      else if (selectedHindiChapterNumber === 3) raw = CLASS_10_HINDI_CH03_NOTES;
      else raw = CLASS_10_HINDI_CH01_NOTES;
    } else if (isGeography) {
      if (selectedGeoChapterNumber === 5) raw = CLASS_10_GEOGRAPHY_CH05_NOTES;
      else if (selectedGeoChapterNumber === 4) raw = CLASS_10_GEOGRAPHY_CH04_NOTES;
      else if (selectedGeoChapterNumber === 3) raw = CLASS_10_GEOGRAPHY_CH03_NOTES;
      else raw = CLASS_10_GEOGRAPHY_CH02_NOTES;
    } else if (isCivics) {
      raw = CLASS_10_CIVICS_CH01_NOTES;
    } else if (isMath) {
      raw = selectedMathChapterNumber === 2 ? CLASS_10_MATH_CH02_NOTES : CLASS_10_MATH_CH01_NOTES;
    } else {
      if (selectedChapterNumber === 6) raw = CLASS_10_PHYSICS_CH06_NOTES;
      else if (selectedChapterNumber === 5) raw = CLASS_10_PHYSICS_CH05_NOTES;
      else if (selectedChapterNumber === 4) raw = CLASS_10_PHYSICS_CH04_NOTES;
      else if (selectedChapterNumber === 3) raw = CLASS_10_PHYSICS_CH03_NOTES;
      else raw = selectedChapterNumber === 1 ? CLASS_10_PHYSICS_CH01_NOTES : CLASS_10_PHYSICS_CH02_NOTES;
    }

    const safeData = raw || CLASS_10_HINDI_CH01_NOTES;

    // Normalize objectives array
    const rawObjectives = Array.isArray(safeData.objectives)
      ? safeData.objectives
      : Array.isArray(safeData.objectiveQuestions)
      ? safeData.objectiveQuestions
      : [];

    const normalizedObjectives = rawObjectives.map((obj: any, idx: number) => {
      let optionsArray: Array<{ key: string; text: string }> = [];
      if (Array.isArray(obj.options)) {
        optionsArray = obj.options.map((opt: any, oIdx: number) =>
          typeof opt === 'string'
            ? { key: String.fromCharCode(65 + oIdx), text: opt }
            : { key: opt.key || String.fromCharCode(65 + oIdx), text: opt.text || String(opt) }
        );
      } else if (obj.options && typeof obj.options === 'object') {
        optionsArray = Object.entries(obj.options).map(([k, v]) => ({
          key: k,
          text: String(v),
        }));
      }

      return {
        id: typeof obj.id === 'number' ? obj.id : idx + 1,
        question: obj.question || '',
        options: optionsArray,
        correctOption: obj.correctOption || 'A',
        explanation: obj.explanation || '',
        yearAsked: obj.yearAsked || obj.boardYear,
      };
    });

    // Normalize sections
    const normalizedSections = Array.isArray(safeData.sections) ? safeData.sections : [];

    // Normalize keyFormulas
    const rawFormulas = Array.isArray(safeData.keyFormulas)
      ? safeData.keyFormulas
      : Array.isArray(safeData.formulae)
      ? safeData.formulae
      : [];

    const normalizedKeyFormulas =
      rawFormulas.length > 0
        ? rawFormulas
        : normalizedSections.length > 0 && Array.isArray(normalizedSections[0]?.keyPoints)
        ? (normalizedSections[0].keyPoints || []).slice(0, 6).map((pt: string, idx: number) => ({
            name: `महत्वपूर्ण बिंदु ${idx + 1}`,
            formula: pt,
            note: 'बिहार बोर्ड परीक्षा उपयोगी तथ्य',
          }))
        : [];

    // Normalize subjectiveQuestions
    const rawSubjectives = Array.isArray(safeData.subjectiveQuestions)
      ? safeData.subjectiveQuestions
      : Array.isArray(safeData.shortQuestions)
      ? safeData.shortQuestions
      : Array.isArray(safeData.subjectives)
      ? safeData.subjectives
      : [];

    const normalizedSubjectives =
      rawSubjectives.length > 0
        ? rawSubjectives.map((sub: any, idx: number) => ({
            id: sub.id || `sub-${idx + 1}`,
            question: sub.question || '',
            answer: sub.answer || '',
            marks: sub.marks || 5,
            boardYear: sub.boardYear,
            isVVI: sub.isVVI ?? true,
          }))
        : normalizedSections.slice(0, 4).map((sec: any, idx: number) => ({
            id: `sub-${idx + 1}`,
            question: `${idx + 1}. ${sec.hindiTitle || sec.title} के मुख्य सिद्धांतों एवं अवधारणा को समझाइए।`,
            answer: sec.content ? sec.content.slice(0, 180) + '...' : 'पाठ्यपुस्तक NCERT एवं BSEB अनुसार आदर्श उत्तर।',
            marks: 5,
            boardYear: '2025-26 VVI',
            isVVI: true,
          }));

    return {
      ...safeData,
      metadata: {
        className: 'Class 10 (कक्षा 10वीं)',
        classLevel: 'class-10',
        subjectName: isMath
          ? 'गणित (Mathematics)'
          : isHistory
          ? 'सामाजिक विज्ञान (इतिहास)'
          : isCivics
          ? 'सामाजिक विज्ञान (लोकतांत्रिक राजनीति)'
          : isBiology
          ? 'विज्ञान (जीव विज्ञान)'
          : isHindi
          ? 'हिंदी'
          : isGeography
          ? 'भूगोल'
          : 'विज्ञान (भौतिकी)',
        bookTitle: isMath
          ? 'गणित (NCERT / बिहार बोर्ड कक्षा 10)'
          : isHistory
          ? 'इतिहास की दुनिया (भाग-2)'
          : isCivics
          ? 'लोकतांत्रिक राजनीति (भाग-2)'
          : isBiology
          ? 'जीव विज्ञान (Biology Class 10)'
          : isHindi
          ? 'गोधूलि भाग-2'
          : isGeography
          ? 'भूगोल भाग-2'
          : 'भौतिकी',
        chapterNumber: isMath
          ? selectedMathChapterNumber
          : isHistory
          ? selectedHistoryChapterNumber
          : isCivics
          ? 1
          : isBiology
          ? 1
          : isHindi
          ? selectedHindiChapterNumber
          : isGeography
          ? selectedGeoChapterNumber
          : selectedChapterNumber,
        chapterHindiTitle: 'अध्याय नोट्स',
        chapterTitle: 'Chapter Notes',
        author: isPhysics12 ? 'RK STUDY CENTRE Physics Faculty' : 'टॉपर संकलन By Prince Sir',
        batch: isPhysics12 ? 'संकल्प बैच 2026-27' : 'टॉपर बैच 2026-27',
        totalPages: 4,
        totalObjectives: normalizedObjectives.length,
        ...(safeData.metadata || {}),
      },
      sections: normalizedSections,
      objectives: normalizedObjectives,
      objectiveQuestions: normalizedObjectives,
      keyFormulas: normalizedKeyFormulas,
      formulae: normalizedKeyFormulas,
      subjectiveQuestions: normalizedSubjectives,
    };
  }, [isPhysics12, isMath, isHistory, isCivics, isBiology, isHindi, isGeography, selectedHistoryChapterNumber, selectedHindiChapterNumber, selectedGeoChapterNumber, selectedChapterNumber]);

  // Letter Text style Big Letter state - default is 'big' (बड़े अक्षर) as requested!
  const [fontSize, setFontSize] = useState<FontSizeLevel>('big');
  const [activeTab, setActiveTab] = useState<'notes' | 'objectives' | 'formulas' | 'tests' | 'subjective'>('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedObjectiveAnswers, setSelectedObjectiveAnswers] = useState<Record<number, string>>({});
  const [showAllAnswers, setShowAllAnswers] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showAnnotationsModal, setShowAnnotationsModal] = useState(false);
  const [showPhysics500Modal, setShowPhysics500Modal] = useState(false);
  const [showPhysicsProgressModal, setShowPhysicsProgressModal] = useState(false);
  const [showPhysicsMarathonModal, setShowPhysicsMarathonModal] = useState(false);
  const [showDoubtSolverModal, setShowDoubtSolverModal] = useState(false);
  const [selectedTextToHighlight, setSelectedTextToHighlight] = useState<string>('');
  const [highlightPopupPosition, setHighlightPopupPosition] = useState<{ x: number; y: number } | null>(null);

  // Interactive in-viewer live quiz state
  const [interactiveQuizMode, setInteractiveQuizMode] = useState<boolean>(false);
  const [quizFilter, setQuizFilter] = useState<'all' | '30-vvi' | '15-rapid'>('30-vvi');
  const [quizUserAnswers, setQuizUserAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizTimerSeconds, setQuizTimerSeconds] = useState<number>(0);
  const [completedChapterIds, setCompletedChapterIds] = useState<string[]>([]);

  const refreshCompleted = () => {
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
    refreshCompleted();
    window.addEventListener(PROGRESS_UPDATED_EVENT, refreshCompleted);
    return () => window.removeEventListener(PROGRESS_UPDATED_EVENT, refreshCompleted);
  }, []);

  // Auto-cache active interactive note into offline storage
  useEffect(() => {
    if (currentChapterData?.metadata) {
      const noteId = currentChapterData.metadata.chapterId;
      cacheInteractiveNote(noteId, currentChapterData.metadata.chapterHindiTitle, {
        chapterId: currentChapterData.metadata.chapterId,
        chapterTitle: currentChapterData.metadata.chapterHindiTitle,
        author: currentChapterData.metadata.author,
        totalPages: currentChapterData.metadata.totalPages,
        totalObjectives: currentChapterData.metadata.totalObjectives,
      });
    }
  }, [currentChapterData]);

  const isCurrentChapterCompleted = useMemo(() => {
    const chapId = currentChapterData.metadata.chapterId;
    return completedChapterIds.includes(chapId);
  }, [completedChapterIds, currentChapterData]);

  const handleToggleCurrentChapterCompletion = async () => {
    const chapId = currentChapterData.metadata.chapterId;
    const matched = CHAPTERS.find((c) => c.id === chapId);
    if (matched) {
      const sub = SUBJECTS.find((s) => s.id === matched.subjectId);
      await toggleChapterCompletion(matched, isPhysics12 ? 'class-12' : 'class-10', sub);
      refreshCompleted();
    }
  };

  const handleFinalizeQuiz = () => {
    setQuizSubmitted(true);
    let correct = 0;
    let incorrect = 0;
    activeQuizQuestions.forEach((q) => {
      const userAns = quizUserAnswers[q.id];
      if (userAns) {
        if (userAns === q.correctOption) correct++;
        else incorrect++;
      }
    });
    const unattempted = activeQuizQuestions.length - (correct + incorrect);
    const score = correct;
    const totalMarks = activeQuizQuestions.length;

    const resultId = 'res-' + Math.random().toString(36).substring(2, 11);
    const resultObj: StoredTestResult = {
      id: resultId,
      testId: `quiz-${currentChapterData.metadata.chapterId}-${quizFilter}`,
      testTitle: `${currentChapterData.metadata.chapterHindiTitle} (${quizFilter.toUpperCase()} अभ्यास टेस्ट)`,
      studentId: 'current-student',
      score,
      totalMarks,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      unattempted,
      timeTakenMinutes: Math.max(1, Math.round(quizTimerSeconds / 60)),
      completedAt: new Date().toISOString(),
      studentAnswers: quizUserAnswers as any,
      classLevel: 'class-10',
      subjectId: isGeography ? 'sub-c10-social-science' : 'sub-c10-science',
      passed: score >= Math.ceil(totalMarks * 0.4),
    };
    recordTestResult(resultObj);
  };

  // Reset objective selection & quiz on chapter switch and scroll to top
  useEffect(() => {
    setSelectedObjectiveAnswers({});
    setQuizUserAnswers({});
    setQuizSubmitted(false);
    setQuizTimerSeconds(0);
    const el = document.getElementById('notes-scroll-container');
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedChapterNumber, selectedGeoChapterNumber, selectedHindiChapterNumber]);

  // Timer for in-viewer test mode
  useEffect(() => {
    let interval: any;
    if (interactiveQuizMode && !quizSubmitted) {
      interval = setInterval(() => {
        setQuizTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [interactiveQuizMode, quizSubmitted]);

  // Dynamic CSS classes based on Big Letter font size selection
  const fontClasses = useMemo(() => {
    switch (fontSize) {
      case 'extra-big':
        return {
          body: 'text-xl sm:text-2xl md:text-3xl leading-relaxed text-slate-900',
          heading: 'text-2xl sm:text-3xl md:text-4xl font-black text-slate-950',
          subheading: 'text-xl sm:text-2xl font-bold text-blue-900',
          badge: 'text-base font-extrabold px-3 py-1',
          cardPadding: 'p-6 sm:p-8 md:p-10',
          formula: 'text-2xl sm:text-3xl font-black',
        };
      case 'normal':
        return {
          body: 'text-base sm:text-lg leading-relaxed text-slate-800',
          heading: 'text-xl sm:text-2xl font-black text-slate-900',
          subheading: 'text-lg font-bold text-blue-900',
          badge: 'text-xs font-extrabold px-2.5 py-0.5',
          cardPadding: 'p-4 sm:p-6',
          formula: 'text-lg sm:text-xl font-black',
        };
      case 'big':
      default:
        // Default: Big Letter Style (बड़े अक्षर)
        return {
          body: 'text-lg sm:text-xl md:text-2xl leading-relaxed text-slate-900 font-medium',
          heading: 'text-2xl sm:text-3xl font-black text-slate-950',
          subheading: 'text-xl sm:text-2xl font-bold text-blue-900',
          badge: 'text-sm font-extrabold px-3 py-1',
          cardPadding: 'p-5 sm:p-8',
          formula: 'text-xl sm:text-2xl md:text-3xl font-black',
        };
    }
  }, [fontSize]);

  // Filtered notes sections based on search query
  const filteredSections = useMemo(() => {
    const list = currentChapterData?.sections || [];
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(
      (sec) =>
        sec.title?.toLowerCase().includes(query) ||
        sec.hindiTitle?.toLowerCase().includes(query) ||
        sec.content?.toLowerCase().includes(query) ||
        (Array.isArray(sec.keyPoints) && sec.keyPoints.some((kp: string) => kp?.toLowerCase().includes(query)))
    );
  }, [searchQuery, currentChapterData]);

  // Filtered objective questions
  const filteredObjectives = useMemo(() => {
    const list = currentChapterData?.objectives || [];
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(
      (obj) =>
        obj.question?.toLowerCase().includes(query) ||
        (Array.isArray(obj.options) && obj.options.some((opt: any) => opt.text?.toLowerCase().includes(query))) ||
        (obj.explanation && obj.explanation.toLowerCase().includes(query))
    );
  }, [searchQuery, currentChapterData]);

  // Questions for interactive quiz mode
  const activeQuizQuestions = useMemo(() => {
    const list = currentChapterData?.objectives || [];
    if (quizFilter === '15-rapid') return list.slice(0, 15);
    if (quizFilter === '30-vvi') return list.slice(0, 30);
    return list;
  }, [quizFilter, currentChapterData]);

  const quizScore = useMemo(() => {
    let score = 0;
    activeQuizQuestions.forEach((q) => {
      if (quizUserAnswers[q.id] === q.correctOption) {
        score += 1;
      }
    });
    return score;
  }, [activeQuizQuestions, quizUserAnswers]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleAnswerClick = (questionId: number, optionKey: string) => {
    setSelectedObjectiveAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (showRKNotesView) {
    const isCivicsChapter = Boolean(
      isCivics ||
      currentChapterData?.metadata?.chapterId?.includes('civ') ||
      currentChapterData?.metadata?.subjectName?.includes('नागरिक') ||
      currentChapterData?.metadata?.subjectName?.toLowerCase().includes('civics')
    );
    const isMathChapter = Boolean(
      isMath ||
      currentChapterData?.metadata?.chapterId?.includes('math') ||
      currentChapterData?.metadata?.subjectName?.includes('गणित') ||
      currentChapterData?.metadata?.subjectName?.toLowerCase().includes('math')
    );
    const chapterKey: string = isMathChapter
      ? selectedMathChapterNumber === 2
        ? 'math-02'
        : 'math-01'
      : isCivicsChapter
      ? 'civ-01'
      : isPhysics12
      ? 'c12-phy-01'
      : isHistory
      ? selectedHistoryChapterNumber === 8
        ? 'his-08'
        : selectedHistoryChapterNumber === 7
        ? 'his-07'
        : selectedHistoryChapterNumber === 6
        ? 'his-06'
        : selectedHistoryChapterNumber === 5
        ? 'his-05'
        : selectedHistoryChapterNumber === 4
        ? 'his-04'
        : selectedHistoryChapterNumber === 3
        ? 'his-03'
        : selectedHistoryChapterNumber === 2
        ? 'his-02'
        : 'his-01'
      : isBiology
      ? 'bio-01'
      : isHindi
      ? selectedHindiChapterNumber === 103
        ? 'v-03'
        : selectedHindiChapterNumber === 102
        ? 'v-02'
        : selectedHindiChapterNumber === 101
        ? 'v-01'
        : selectedHindiChapterNumber === 3
        ? 'g-03'
        : 'g-01'
      : isGeography
      ? `geo-0${selectedGeoChapterNumber}`
      : `phy-0${selectedChapterNumber}`;

    if (showCh01QuestionBank500) {
      return <HistoryCh01QuestionBank500Viewer onBack={() => setShowCh01QuestionBank500(false)} />;
    }

    return (
      <div
        className={`w-full ${
          isModal ? 'fixed inset-0 z-50 overflow-y-auto bg-slate-900' : 'relative min-h-screen'
        }`}
      >
        <RKStudyCenterHindiNotesPage
          initialChapter={chapterKey}
          customChapterData={currentChapterData}
          onOpenCh01QuestionBank={() => setShowCh01QuestionBank500(true)}
          fontSize={fontSize}
          subjectType={
            isMathChapter
              ? 'math'
              : isCivicsChapter
              ? 'civics'
              : isPhysics12
              ? 'physics'
              : isHistory
              ? 'history'
              : isBiology
              ? 'biology'
              : isHindi
              ? 'hindi'
              : isGeography
              ? 'geography'
              : 'physics'
          }
          onChapterChange={(key) => {
            if (isPhysics12 || isCivics) {
              return;
            }
            if (isMath) {
              if (key === 'math-02') setSelectedMathChapterNumber(2);
              else setSelectedMathChapterNumber(1);
              return;
            }
            if (isHistory) {
              if (key === 'his-08') setSelectedHistoryChapterNumber(8);
              else if (key === 'his-07') setSelectedHistoryChapterNumber(7);
              else if (key === 'his-06') setSelectedHistoryChapterNumber(6);
              else if (key === 'his-05') setSelectedHistoryChapterNumber(5);
              else if (key === 'his-04') setSelectedHistoryChapterNumber(4);
              else if (key === 'his-03') setSelectedHistoryChapterNumber(3);
              else if (key === 'his-02') setSelectedHistoryChapterNumber(2);
              else setSelectedHistoryChapterNumber(1);
            } else if (key === 'bio-01') {
              // Biology Chapter 01
            } else if (isHindi) {
              if (key === 'v-03') setSelectedHindiChapterNumber(103);
              else if (key === 'v-02') setSelectedHindiChapterNumber(102);
              else if (key === 'v-01') setSelectedHindiChapterNumber(101);
              else if (key === 'g-03') setSelectedHindiChapterNumber(3);
              else setSelectedHindiChapterNumber(1);
            } else if (isGeography) {
              const num = parseInt(String(key).replace(/\D/g, ''), 10) || 2;
              setSelectedGeoChapterNumber(num);
            } else {
              const num = parseInt(String(key).replace(/\D/g, ''), 10) || 1;
              setSelectedChapterNumber(num);
            }
          }}
          onClose={onClose}
          onOpenInteractive={() => setShowRKNotesView(false)}
          onStartTest={() => {
            setShowRKNotesView(false);
            setActiveTab('tests');
            setQuizFilter('all');
            setInteractiveQuizMode(true);
            setQuizSubmitted(false);
            setQuizUserAnswers({});
            setQuizTimerSeconds(0);
          }}
        />
      </div>
    );
  }

  return (
    <div
      id="physics-notes-big-letter-viewer"
      className={`w-full ${
        isModal
          ? 'fixed inset-0 z-50 overflow-hidden bg-white flex flex-col h-full'
          : 'bg-slate-50 min-h-screen flex flex-col'
      }`}
    >
      <div
        className={`w-full bg-white flex flex-col overflow-hidden ${
          isModal ? 'h-full flex-1' : 'min-h-screen'
        }`}
      >
        {/* Top Header & Breadcrumbs Proof of Correct Mapping */}
        <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-6 shrink-0 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              {/* Strict 4-tier Hierarchy Breadcrumbs */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs sm:text-sm font-black text-blue-200">
                <span className="bg-blue-600 text-white px-2.5 py-1 rounded-md uppercase tracking-wider shadow-xs">
                  {currentChapterData.metadata.className}
                </span>
                <ChevronRight className="w-4 h-4 text-blue-300 shrink-0" />
                <span className="bg-indigo-700/80 text-white px-2.5 py-1 rounded-md shadow-xs">
                  {currentChapterData.metadata.subjectName}
                </span>
                <ChevronRight className="w-4 h-4 text-blue-300 shrink-0" />
                <span className="bg-blue-800/80 text-white px-2.5 py-1 rounded-md shadow-xs">
                  {currentChapterData.metadata.bookTitle}
                </span>
                <ChevronRight className="w-4 h-4 text-blue-300 shrink-0" />
                <span className="bg-amber-400 text-slate-950 font-black px-2.5 py-1 rounded-md shadow-xs">
                  अध्याय {currentChapterData.metadata.chapterNumber.toString().padStart(2, '0')}
                </span>
              </div>

              {/* Title & Author Info */}
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {currentChapterData.metadata.chapterHindiTitle}
              </h1>

              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-blue-100 flex-wrap">
                <span className="flex items-center gap-1 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  {currentChapterData.metadata.author}
                </span>
                <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                  {currentChapterData.metadata.batch}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-extrabold">
                  {currentChapterData.metadata.totalPages} पृष्ठ नोट्स • {currentChapterData.metadata.totalObjectives} VVI MCQs
                </span>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-amber-300" />
                  ऑफ़लाइन सुरक्षित
                </span>
              </div>
            </div>

            {/* Quick Actions & Close */}
            <div className="flex items-center gap-2 flex-wrap lg:justify-end">
              {/* Return to RK Study Center Original Notes Button */}
              <button
                type="button"
                onClick={() => setShowRKNotesView(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-md transition-all cursor-pointer border border-amber-300/40"
              >
                <RKStudyCenterLogo size="sm" variant="mark-only" />
                <span>RK STUDY CENTER मूल बुकलेट (Hindi Ch 01 Design)</span>
              </button>

              {/* Chapter Switcher Buttons */}
              {isHistory ? (
                <div className="flex items-center p-1 bg-white/10 rounded-xl border border-white/20 text-xs font-black flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedHistoryChapterNumber(1)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedHistoryChapterNumber === 1
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Ch 01: यूरोप में राष्ट्रवाद
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedHistoryChapterNumber(2)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedHistoryChapterNumber === 2
                        ? 'bg-rose-400 text-slate-950 shadow-md font-black'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Ch 02: समाजवाद एवं साम्यवाद
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedHistoryChapterNumber(3)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedHistoryChapterNumber === 3
                        ? 'bg-emerald-400 text-slate-950 shadow-md font-black'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Ch 03: हिन्द-चीन में राष्ट्रवाद
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedHistoryChapterNumber(4)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedHistoryChapterNumber === 4
                        ? 'bg-orange-400 text-slate-950 shadow-md font-black'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Ch 04: भारत में राष्ट्रवाद
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedHistoryChapterNumber(5)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedHistoryChapterNumber === 5
                        ? 'bg-indigo-400 text-slate-950 shadow-md font-black'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Ch 05: अर्थव्यवस्था एवं आजीविका
                  </button>
                </div>
              ) : isBiology ? (
                <div className="flex items-center p-1 bg-white/10 rounded-xl border border-white/20 text-xs font-black flex-wrap gap-1">
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-400 text-slate-950 shadow-md font-black">
                    Ch 01: जैव प्रक्रम
                  </span>
                </div>
              ) : isHindi ? (
                <div className="flex items-center p-1 bg-white/10 rounded-xl border border-white/20 text-xs font-black flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedHindiChapterNumber(1)}
                    className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedHindiChapterNumber === 1
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Ch 01 (गद्य): श्रम विभाजन
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedHindiChapterNumber(101)}
                    className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedHindiChapterNumber === 101
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Ch 01 (पद्य): राम नाम बिनु...
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedHindiChapterNumber(102)}
                    className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedHindiChapterNumber === 102
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Ch 02 (पद्य): प्रेम-अयनि श्री राधिका
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedHindiChapterNumber(3)}
                    className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedHindiChapterNumber === 3
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Ch 03 (गद्य): भारत से हम क्या सीखें
                  </button>
                </div>
              ) : isGeography ? (
                <div className="flex items-center p-1 bg-white/10 rounded-xl border border-white/20 text-xs font-black flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedGeoChapterNumber(2)}
                    className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedGeoChapterNumber === 2
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Ch 02: कृषि
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGeoChapterNumber(3)}
                    className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedGeoChapterNumber === 3
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Ch 03: निर्माण उद्योग
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGeoChapterNumber(4)}
                    className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedGeoChapterNumber === 4
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Ch 04: परिवहन
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGeoChapterNumber(5)}
                    className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedGeoChapterNumber === 5
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Ch 05: बिहार कृषि व संसाधन
                  </button>
                </div>
              ) : (
                <div className="flex items-center p-1 bg-white/10 rounded-xl border border-white/20 text-xs font-black flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedChapterNumber(1)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedChapterNumber === 1
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Ch 1: परावर्तन
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChapterNumber(2)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedChapterNumber === 2
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Ch 2: अपवर्तन
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChapterNumber(3)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedChapterNumber === 3
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Ch 3: मानव नेत्र
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChapterNumber(4)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedChapterNumber === 4
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Ch 4: विद्युत धारा
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChapterNumber(5)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedChapterNumber === 5
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Ch 5: चुंबकीय प्रभाव
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChapterNumber(6)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedChapterNumber === 6
                        ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Ch 6: ऊर्जा के स्रोत
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowRKNotesView(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-95 text-white text-xs font-black transition-all border border-orange-400 shadow-md cursor-pointer"
                title="RK STUDY CENTER मूल बुकलेट (Hindi Ch 01 Design)"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>मूल बुकलेट (Hindi Ch 01 Design)</span>
              </button>

              {!isHistory && !isBiology && !isHindi && !isGeography && selectedChapterNumber === 1 && (
                <button
                  type="button"
                  onClick={() => setShowPhysicsMarathonModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-95 text-white text-xs font-black transition-all border border-amber-300 shadow-lg cursor-pointer animate-pulse"
                  title="अध्याय 1: 300 VVI वस्तुनिष्ठ अखंड महामैराथन टेस्ट (3 Hours)"
                >
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span>🔥 अखंड 300 VVI टेस्ट (3 Hr)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowPhysics500Modal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-black transition-all border border-purple-400 shadow-md cursor-pointer animate-pulse"
                title="Bihar Board Physics 500 Question Bank"
              >
                <Award className="w-4 h-4 text-yellow-300" />
                <span>🎯 भौतिकी 500 प्रश्न बैंक</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPhysicsProgressModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-black transition-all border border-blue-400 shadow-md cursor-pointer"
                title="Physics Chapter Progress Tracker (1-15)"
              >
                <BarChart3 className="w-4 h-4 text-amber-300" />
                <span>📊 प्रगति ट्रैकर (Progress)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDoubtSolverModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-black transition-all border border-indigo-400 shadow-md cursor-pointer animate-pulse"
                title="AI Doubt Solver & Personal Tutor"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>🤖 AI शंका समाधान</span>
              </button>



              <button
                type="button"
                id="btn-header-download-notes"
                onClick={() => setShowDownloadModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-black transition-all border border-red-400 shadow-md cursor-pointer"
                title="PDF के रूप में प्रिंट व सहेजें"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>PDF सहेजें / प्रिंट</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border border-white/20 cursor-pointer"
                title="Print Notes"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">प्रिंट / PDF</span>
              </button>

              <button
                type="button"
                id="btn-header-share-notes"
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 text-xs font-black transition-all border border-amber-300 shadow-md cursor-pointer"
                title="Share Notes via WhatsApp, Instagram, Facebook, Link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>शेयर नोट्स</span>
              </button>

              {isModal && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl bg-red-600/90 hover:bg-red-700 text-white transition-colors cursor-pointer ml-1"
                  title="Close Viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar: Tabs & Font Size Control */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 py-3 shrink-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Main Content Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setActiveTab('notes');
                setInteractiveQuizMode(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all shrink-0 cursor-pointer ${
                activeTab === 'notes' && !interactiveQuizMode
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>हस्तलिखित नोट्स ({currentChapterData.sections.length} खंड)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('objectives');
                setInteractiveQuizMode(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all shrink-0 cursor-pointer ${
                activeTab === 'objectives' && !interactiveQuizMode
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>VVI वस्तुनिष्ठ प्रश्न ({currentChapterData.objectives.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('formulas');
                setInteractiveQuizMode(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all shrink-0 cursor-pointer ${
                activeTab === 'formulas' && !interactiveQuizMode
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>{isGeography ? 'मुख्य तथ्य एवं सूत्र' : 'मुख्य सूत्र'} ({currentChapterData.keyFormulas.length})</span>
            </button>

            {currentChapterData.subjectiveQuestions && currentChapterData.subjectiveQuestions.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('subjective');
                  setInteractiveQuizMode(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all shrink-0 cursor-pointer ${
                  activeTab === 'subjective' && !interactiveQuizMode
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>लघु/दीर्घ उत्तरीय प्रश्न ({currentChapterData.subjectiveQuestions.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('tests')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all shrink-0 cursor-pointer ${
                activeTab === 'tests'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>🎯 ऑनलाइन टेस्ट (Online Tests)</span>
            </button>
          </div>

          {/* Big Letter Font Size Toggle & Search */}
          <div className="flex items-center gap-2 shrink-0 justify-between md:justify-end">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="नोट्स या प्रश्न खोजें..."
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Font Size Selector (बड़े अक्षर) */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-2xs font-bold text-slate-400 px-1.5 uppercase hidden xl:inline">
                अक्षर आकार:
              </span>
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  fontSize === 'normal'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Normal Font Size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('big')}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  fontSize === 'big'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Big Letter Style (बड़े अक्षर - Default)"
              >
                A+ बड़े अक्षर
              </button>
              <button
                type="button"
                onClick={() => setFontSize('extra-big')}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  fontSize === 'extra-big'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Extra Big Letter Style (अति विशाल अक्षर)"
              >
                A++
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area using WatermarkWrapper */}
        <WatermarkWrapper id="notes-scroll-container" className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 bg-slate-50 space-y-6">
          {/* Class X Physics Chapter 01 Special Banner with "Click to Open Physics Chapter 01 Material" and "300 VVI Akhand Marathon Test" */}
          {!isHistory && !isBiology && !isHindi && !isGeography && selectedChapterNumber === 1 && (
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="bg-gradient-to-r from-red-900 via-rose-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border-2 border-amber-400/80 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="absolute -left-10 -top-10 w-48 h-48 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
                
                <div className="space-y-3 text-center md:text-left z-10">
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                    <span className="px-3.5 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase flex items-center gap-1.5 shadow-md animate-pulse">
                      <Clock className="w-4 h-4 text-slate-950" />
                      3 Hours • 300 VVI अखंड महामैराथन लाइव टेस्ट
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/35 border border-emerald-400/40 text-emerald-200">
                      अध्याय 01: प्रकाश का परावर्तन (2016-2026 स्पेशल)
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-amber-300 leading-tight">
                    🔥 भौतिकी 300 VVI अखंड महामैराथन टेस्ट (3 घंटे / 180 मिनट)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 max-w-2xl font-medium">
                    बिहार बोर्ड मैट्रिक परीक्षा 2016 से 2026 के विगत 10 वर्षों के 300 सबसे महत्वपूर्ण वस्तुनिष्ठ प्रश्नों का लाइव टेस्ट। रियल-टाइम 3-घंटे का टाइमर, OMR शीट मोड व रैंक कार्ड सहित।
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 z-10 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowPhysicsMarathonModal(true)}
                    className="px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-sm transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 border-2 border-white/60 animate-bounce"
                  >
                    <Clock className="w-5 h-5 text-slate-950" />
                    <span>🔥 अखंड 300 VVI टेस्ट शुरू करें (3 Hours)</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRKNotesView(true)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-4 h-4 text-amber-300" />
                      <span>Chapter 01 Material</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPhysics500Modal(true)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Award className="w-4 h-4 text-yellow-300" />
                      <span>500 Q-Bank</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Quick Access Banner for Physics 500 Q Bank & Progress Tracker */}
          {!isHistory && !isBiology && !isHindi && !isGeography && (
            <div className="max-w-5xl mx-auto">
              <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 rounded-2xl p-5 sm:p-6 text-white shadow-xl border-2 border-indigo-400/40 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-2 text-center md:text-left z-10">
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                    <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase flex items-center gap-1 shadow-sm">
                      <Award className="w-3.5 h-3.5" />
                      बिहार बोर्ड कक्षा 10 भौतिकी 2026-27
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
                      15 अध्याय • 500 प्रश्न बैंक
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black">
                    🎯 सम्पूर्ण भौतिकी 500 प्रश्न बैंक और प्रगति ट्रैकर
                  </h3>
                  <p className="text-xs sm:text-sm text-indigo-100 max-w-2xl font-medium">
                    बिहार बोर्ड परीक्षा पैटर्न पर आधारित सभी 15 अध्यायों के वस्तुनिष्ठ, लघु, दीर्घ और आंकिक प्रश्नों का अभ्यास करें तथा अपनी अध्ययन प्रगति को लाइव ट्रैक करें।
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 z-10 w-full md:w-auto justify-center">
                  <button
                    type="button"
                    onClick={() => setShowPhysics500Modal(true)}
                    className="flex-1 md:flex-none px-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Award className="w-4 h-4 text-slate-950" />
                    <span>500 प्रश्न बैंक खोलें</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPhysicsProgressModal(true)}
                    className="flex-1 md:flex-none px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4 text-amber-300" />
                    <span>प्रगति ट्रैकर</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Detailed Notes Sections */}
          {activeTab === 'notes' && (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Quick Summary Alert / Banner */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-blue-600 text-white rounded-xl shrink-0">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-base sm:text-lg font-black text-blue-950">
                      {currentChapterData.metadata.chapterHindiTitle} • टॉपर हस्तलिखित नोट्स
                    </h2>
                    <p className="text-xs sm:text-sm text-blue-800 font-medium leading-relaxed">
                      यह नोट्स <strong>{currentChapterData.metadata.author}</strong> द्वारा विशेष रूप से बिहार बोर्ड मैट्रिक परीक्षा के लिए बड़े अक्षरों (Big Letter) में तैयार किया गया है।
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDownloadModal(true)}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shrink-0 shadow-sm transition-all active:scale-95 cursor-pointer border border-red-500"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>PDF के रूप में सहेजें (Save as PDF)</span>
                </button>
              </div>

              {/* Sections List */}
              {filteredSections.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
                  <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-lg font-bold text-slate-700">कोई खंड नहीं मिला</p>
                  <p className="text-sm text-slate-500">कृपया अपना खोज शब्द बदलें</p>
                </div>
              ) : (
                filteredSections.map((sec, idx) => (
                  <div
                    key={sec.id || idx}
                    className={`bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-200 shadow-sm hover:border-blue-400 transition-all ${fontClasses.cardPadding} space-y-4`}
                  >
                    {/* Section Number & Title */}
                    <div className="border-b border-slate-100 pb-3 sm:pb-4 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`bg-blue-100 text-blue-800 rounded-lg ${fontClasses.badge}`}>
                            खंड {sec.sectionNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Topic {idx + 1}
                          </span>
                        </div>
                        <h2 className={`${fontClasses.heading} leading-snug`}>
                          {sec.hindiTitle}
                        </h2>
                        <h3 className={`${fontClasses.subheading}`}>
                          {sec.title}
                        </h3>
                      </div>
                    </div>

                    {/* Section Content */}
                    <div className={`${fontClasses.body} whitespace-pre-line text-slate-900 font-medium`}>
                      {Array.isArray(sec.content) ? sec.content.join('\n\n') : sec.content}
                    </div>

                    {/* Subsections if available */}
                    {(sec as any).subsections && (sec as any).subsections.length > 0 && (
                      <div className="space-y-3 pt-2">
                        {(sec as any).subsections.map((sub: any, sIdx: number) => (
                          <div key={sIdx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                            <h4 className="text-base sm:text-lg font-black text-blue-950">{sub.subtitle}</h4>
                            <p className={`${fontClasses.body} text-slate-800 font-medium leading-relaxed`}>{sub.description}</p>
                            {sub.points && sub.points.length > 0 && (
                              <ul className="space-y-1.5 pl-4 list-disc text-slate-700">
                                {sub.points.map((pt: string, ptIdx: number) => (
                                  <li key={ptIdx} className={`${fontClasses.body} text-slate-900 font-medium`}>{pt}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Key Points Bullet List with High Contrast */}
                    {sec.keyPoints && sec.keyPoints.length > 0 && (
                      <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-6 border border-slate-200/80 space-y-3">
                        <div className="text-xs sm:text-sm font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>महत्वपूर्ण बिंदु एवं परीक्षा तथ्य:</span>
                        </div>
                        <ul className="space-y-2.5">
                          {sec.keyPoints.map((point, pIdx) => (
                            <li
                              key={pIdx}
                              className={`flex items-start gap-3 ${fontClasses.body} text-slate-900 font-medium`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-2.5 shadow-xs" />
                              <span className="flex-1 leading-relaxed">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Formulae callout if available */}
                    {sec.formulae && sec.formulae.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {sec.formulae.map((f, fIdx) => (
                          <div
                            key={fIdx}
                            className="bg-amber-50/70 border-2 border-amber-200 rounded-2xl p-4 space-y-1 shadow-xs"
                          >
                            <div className="text-xs font-bold text-amber-800">{f.name}</div>
                            <div className={`text-blue-950 ${fontClasses.formula}`}>{f.formula}</div>
                            {f.note && <div className="text-xs text-amber-900 font-medium">{f.note}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Board Exam Short & Long Questions with Years */}
              {(currentChapterData as any).shortQuestions && (currentChapterData as any).shortQuestions.length > 0 && (
                <div className="bg-white rounded-3xl border-2 border-indigo-200 p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="border-b border-indigo-100 pb-4">
                    <div className="flex items-center gap-2 text-indigo-700 font-black text-xs sm:text-sm uppercase tracking-wider">
                      <Award className="w-5 h-5 text-amber-500" />
                      <span>बिहार बोर्ड मैट्रिक परीक्षा स्पेशल (Previous Years Q&A)</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                      अति-लघु एवं लघु उत्तरीय प्रश्नोत्तर ({(currentChapterData as any).shortQuestions.length} प्रश्न)
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {(currentChapterData as any).shortQuestions.map((sq: any) => (
                      <div key={sq.id} className="p-4 sm:p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-base sm:text-lg font-black text-slate-900 flex items-start gap-2">
                            <span className="w-6 h-6 rounded-md bg-indigo-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                              {sq.id}
                            </span>
                            <span>{sq.question}</span>
                          </h4>
                          {sq.boardYear && (
                            <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-black shrink-0 border border-amber-300">
                              BSEB {sq.boardYear}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-800 text-sm sm:text-base font-medium leading-relaxed pl-8 whitespace-pre-line">
                          {sq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chapter Completion Card */}
              <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase">
                      अध्याय अध्ययन पूर्णता (Study Progress)
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      क्या आपने {currentChapterData.metadata.chapterHindiTitle} का अध्ययन पूरा कर लिया है?
                    </h3>
                    <p className="text-emerald-200 text-xs sm:text-sm font-medium">
                      अपनी प्रगति में यह अध्याय मार्क करें ताकि आपका 'My Progress' डैशबोर्ड हमेशा सटीक और अद्यतन रहे।
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                    <button
                      type="button"
                      onClick={handleToggleCurrentChapterCompletion}
                      className={`px-5 py-3 rounded-2xl font-black text-sm transition-all shadow-md cursor-pointer flex items-center gap-2 ${
                        isCurrentChapterCompleted
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : 'bg-white text-emerald-950 hover:bg-emerald-50'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isCurrentChapterCompleted ? '✓ अध्याय पूर्ण है' : '✓ पूर्ण चिह्नित करें'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowShareModal(true)}
                      className="px-5 py-3 rounded-2xl font-black text-sm bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all shadow-md cursor-pointer flex items-center gap-2 active:scale-95"
                      title="Share Notes via WhatsApp, Instagram, Facebook"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>नोट्स शेयर करें (WhatsApp / Social)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('tests');
                        setQuizFilter('all');
                        setInteractiveQuizMode(true);
                        setQuizSubmitted(false);
                        setQuizUserAnswers({});
                        setQuizTimerSeconds(0);
                        if (scrollContainerRef.current) {
                          scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="px-5 py-3 rounded-2xl font-black text-sm bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-600 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Award className="w-4 h-4" />
                      <span>⚡ तुरंत टेस्ट शुरू करें</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Objective Questions (MCQ) */}
          {activeTab === 'objectives' && (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Top Controls for Objectives */}
              <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {currentChapterData.metadata.chapterHindiTitle} : VVI वस्तुनिष्ठ प्रश्न
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-slate-600">
                    कुल {currentChapterData.objectives.length} प्रश्न • बिहार बोर्ड मैट्रिक 2025-26 स्पेशल
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAllAnswers(!showAllAnswers)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                      showAllAnswers
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {showAllAnswers ? 'उत्तर एवं व्याख्या छिपाएं' : '✓ सभी सही उत्तर देखें'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('tests');
                      setQuizFilter('all');
                      setInteractiveQuizMode(true);
                      setQuizSubmitted(false);
                      setQuizUserAnswers({});
                      setQuizTimerSeconds(0);
                      if (scrollContainerRef.current) {
                        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    <span>⚡ ऑनलाइन टेस्ट शुरू करें</span>
                  </button>
                </div>
              </div>

              {/* Objectives List */}
              <div className="space-y-4">
                {filteredObjectives.map((obj) => {
                  const isSelected = selectedObjectiveAnswers[obj.id];
                  const isCorrect = isSelected === obj.correctOption;

                  return (
                    <div
                      key={obj.id}
                      className={`bg-white rounded-2xl sm:rounded-3xl border-2 transition-all ${
                        isSelected
                          ? isCorrect
                            ? 'border-emerald-500 bg-emerald-50/20'
                            : 'border-red-400 bg-red-50/20'
                          : 'border-slate-200 hover:border-blue-400'
                      } ${fontClasses.cardPadding} space-y-4`}
                    >
                      {/* Question Header */}
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-xl bg-blue-600 text-white text-sm font-black flex items-center justify-center shrink-0 shadow-xs">
                          {obj.id}
                        </span>
                        <div className="space-y-1 flex-1">
                          <div className={`${fontClasses.body} font-bold text-slate-950`}>
                            {obj.question}
                          </div>
                          {obj.yearAsked && (
                            <span className="inline-block text-2xs font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                              BSEB Asked {obj.yearAsked}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {(obj.options || []).map((opt) => {
                          const optionChosen = isSelected === opt.key;
                          const isTheCorrectOption = opt.key === obj.correctOption;

                          let btnClasses =
                            'bg-slate-50 hover:bg-blue-50 border-slate-200 text-slate-800';

                          if (optionChosen) {
                            btnClasses = isCorrect
                              ? 'bg-emerald-600 text-white border-emerald-600 font-black'
                              : 'bg-red-600 text-white border-red-600 font-black';
                          } else if (showAllAnswers && isTheCorrectOption) {
                            btnClasses =
                              'bg-emerald-50 text-emerald-900 border-emerald-400 font-black';
                          }

                          return (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => handleAnswerClick(obj.id, opt.key)}
                              className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all flex items-center gap-3 cursor-pointer ${btnClasses}`}
                            >
                              <span
                                className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                                  optionChosen
                                    ? 'bg-white text-slate-900'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {opt.key}
                              </span>
                              <span className={`${fontClasses.body} font-semibold flex-1 leading-snug`}>
                                {opt.text}
                              </span>
                              {showAllAnswers && isTheCorrectOption && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Callout */}
                      {(showAllAnswers || isSelected) && (
                        <div className="bg-slate-100 rounded-xl p-3 sm:p-4 border border-slate-200 text-xs sm:text-sm text-slate-800 space-y-1">
                          <div className="font-black text-blue-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>सही उत्तर: विकल्प ({obj.correctOption})</span>
                          </div>
                          {obj.explanation && (
                            <p className="text-slate-700 font-medium">{obj.explanation}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Fast Action Bar for Objectives Tab */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border-2 border-blue-400/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="px-3 py-0.5 rounded-full text-2xs font-black bg-amber-400 text-slate-950 uppercase tracking-wider">
                    अभ्यास पूर्ण • कुल {currentChapterData.objectives.length} VVI प्रश्न
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {currentChapterData.metadata.chapterHindiTitle} — अपनी तैयारी की तुरंत जाँच करें!
                  </h3>
                  <p className="text-xs text-blue-200 font-medium">
                    एक क्लिक में सभी उत्तर जाँचें या समयबद्ध लाइव ऑनलाइन टेस्ट शुरू करें
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAllAnswers((prev) => !prev)}
                    className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 border-2 ${
                      showAllAnswers
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{showAllAnswers ? 'उत्तर छुपाएं (Hide Check)' : '✓ सभी उत्तर जाँचें (Fast Check)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('tests');
                      setQuizFilter('all');
                      setInteractiveQuizMode(true);
                      setQuizSubmitted(false);
                      setQuizUserAnswers({});
                      setQuizTimerSeconds(0);
                      if (scrollContainerRef.current) {
                        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm transition-all cursor-pointer shadow-lg flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    <span>⚡ तुरंत ऑनलाइन टेस्ट शुरू करें (Start Test)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Formulae & Key Points */}
          {activeTab === 'formulas' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {currentChapterData.metadata.chapterHindiTitle} : महत्वपूर्ण सूत्र एवं नियम
                  </h2>
                  <p className="text-sm font-bold text-slate-600">
                    परीक्षा में न्यूमेरिकल (आंकिक प्रश्न) व ऑब्जेक्टिव हल करने के लिए प्रमुख सूत्र
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentChapterData.keyFormulas.map((f, idx) => (
                    <div
                      key={idx}
                      className="bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5 sm:p-6 space-y-3 shadow-xs"
                    >
                      <div className="text-xs sm:text-sm font-extrabold text-blue-900 uppercase tracking-wider">
                        {f.name}
                      </div>
                      <div className={`text-blue-950 font-black ${fontClasses.formula} tracking-wide`}>
                        {f.formula}
                      </div>
                      {f.note && (
                        <div className="text-xs sm:text-sm font-medium text-slate-700 border-t border-blue-100 pt-2">
                          💡 {f.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Subjective Q&A */}
          {activeTab === 'subjective' && currentChapterData.subjectiveQuestions && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {currentChapterData.metadata.chapterHindiTitle} : लघु एवं दीर्घ उत्तरीय प्रश्नोत्तर
                  </h2>
                  <p className="text-sm font-bold text-slate-600">
                    बिहार बोर्ड मैट्रिक परीक्षा के लिए अति महत्वपूर्ण सब्जेक्टिव प्रश्न (Subjective Question & Answers)
                  </p>
                </div>

                <div className="space-y-6">
                  {currentChapterData.subjectiveQuestions.map((sub, idx) => (
                    <div
                      key={sub.id || idx}
                      className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xs hover:border-blue-400 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white text-sm font-black flex items-center justify-center shrink-0 shadow-xs">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className="text-base sm:text-lg font-black text-slate-950 leading-snug">
                            {sub.question}
                          </h3>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 text-slate-800 font-medium text-sm sm:text-base leading-relaxed space-y-2">
                        <div className="font-extrabold text-blue-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>उत्तर / Explanation:</span>
                        </div>
                        <p className="whitespace-pre-line text-slate-900 font-semibold">
                          {sub.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Online Tests / Interactive Practice */}
          {activeTab === 'tests' && (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* If user started in-viewer interactive quiz */}
              {interactiveQuizMode ? (
                <div className="bg-white rounded-3xl border-2 border-blue-200 p-5 sm:p-8 space-y-6 shadow-md">
                  {/* Quiz Header with Timer and Score */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-100 text-blue-800 uppercase">
                        🔴 लाइव टेस्ट मोड • Live Practice
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                        {currentChapterData.metadata.chapterHindiTitle} ({activeQuizQuestions.length} प्रश्न)
                      </h2>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-slate-900 text-amber-300 font-mono font-black text-base px-3.5 py-1.5 rounded-xl">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimer(quizTimerSeconds)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setInteractiveQuizMode(false);
                          setQuizSubmitted(false);
                        }}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                      >
                        टेस्ट से बाहर निकलें
                      </button>
                    </div>
                  </div>

                  {/* Submission Result Score Card */}
                  {quizSubmitted && (
                    <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 text-center space-y-3">
                      <Award className="w-12 h-12 text-amber-400 mx-auto" />
                      <h3 className="text-2xl sm:text-3xl font-black">
                        टेस्ट परिणाम: {quizScore} / {activeQuizQuestions.length} अंक
                      </h3>
                      <p className="text-sm font-medium text-blue-100">
                        प्रतिशत:{' '}
                        <strong>
                          {((quizScore / activeQuizQuestions.length) * 100).toFixed(1)}%
                        </strong>{' '}
                        • समय: <strong>{formatTimer(quizTimerSeconds)}</strong>
                      </p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setQuizUserAnswers({});
                            setQuizSubmitted(false);
                            setQuizTimerSeconds(0);
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm cursor-pointer"
                        >
                          पुनः टेस्ट दें (Retake)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Questions in Quiz */}
                  <div className="space-y-6">
                    {activeQuizQuestions.map((q, qIndex) => {
                      const userChoice = quizUserAnswers[q.id];
                      const isCorrect = userChoice === q.correctOption;

                      return (
                        <div
                          key={q.id}
                          className={`p-4 sm:p-6 rounded-2xl border-2 transition-all ${
                            quizSubmitted
                              ? userChoice === q.correctOption
                                ? 'border-emerald-500 bg-emerald-50/20'
                                : 'border-red-400 bg-red-50/20'
                              : userChoice
                              ? 'border-blue-400 bg-blue-50/20'
                              : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                              {qIndex + 1}
                            </span>
                            <div className="flex-1 space-y-3">
                              <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                                {q.question}
                              </h4>

                              {/* Options */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {(q.options || []).map((opt) => {
                                  const isThisChosen = userChoice === opt.key;
                                  const isThisCorrect = opt.key === q.correctOption;

                                  let optClass = 'bg-slate-50 border-slate-200 text-slate-800';

                                  if (quizSubmitted) {
                                    if (isThisCorrect) {
                                      optClass = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                                    } else if (isThisChosen && !isThisCorrect) {
                                      optClass = 'bg-red-600 text-white border-red-600 font-bold';
                                    }
                                  } else if (isThisChosen) {
                                    optClass = 'bg-blue-600 text-white border-blue-600 font-bold';
                                  }

                                  return (
                                    <button
                                      key={opt.key}
                                      type="button"
                                      disabled={quizSubmitted}
                                      onClick={() => {
                                        setQuizUserAnswers((prev) => ({
                                          ...prev,
                                          [q.id]: opt.key,
                                        }));
                                      }}
                                      className={`text-left p-3 rounded-xl border-2 transition-all flex items-center gap-2 cursor-pointer ${optClass}`}
                                    >
                                      <span className="w-5 h-5 rounded-md text-xs font-black flex items-center justify-center shrink-0 bg-white/20">
                                        {opt.key}
                                      </span>
                                      <span className="text-xs sm:text-sm font-medium flex-1">
                                        {opt.text}
                                      </span>
                                      {quizSubmitted && isThisCorrect && (
                                        <CheckCircle className="w-4 h-4 text-white" />
                                      )}
                                      {quizSubmitted && isThisChosen && !isThisCorrect && (
                                        <XCircle className="w-4 h-4 text-white" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {quizSubmitted && q.explanation && (
                                <p className="text-xs text-slate-600 bg-slate-100 p-2.5 rounded-lg">
                                  <strong>व्याख्या:</strong> {q.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!quizSubmitted && (
                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">
                        कुल हल किए गए: {Object.keys(quizUserAnswers).length} / {activeQuizQuestions.length}
                      </span>
                      <button
                        type="button"
                        onClick={handleFinalizeQuiz}
                        className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm cursor-pointer shadow-md"
                      >
                        टेस्ट सबमिट करें (Submit Test)
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Online Test Selection Cards */
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                          {currentChapterData.metadata.chapterHindiTitle} : ऑनलाइन टेस्ट पोर्टल
                        </h2>
                        <p className="text-xs sm:text-sm font-bold text-slate-600">
                          बिहार बोर्ड मैट्रिक 2025-26 परीक्षा के लिए लाइव ऑनलाइन टेस्ट एवं अभ्यास क्विज़
                        </p>
                      </div>

                      {/* Start In-Viewer Test Mode Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setQuizFilter('30-vvi');
                          setInteractiveQuizMode(true);
                          setQuizSubmitted(false);
                          setQuizUserAnswers({});
                          setQuizTimerSeconds(0);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black cursor-pointer shadow-md flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>लाइव इन-ऐप टेस्ट शुरू करें</span>
                      </button>
                    </div>

                    {/* 300 VVI Akhand Marathon Top Card for Physics Chapter 01 */}
                    {!isHistory && !isBiology && !isHindi && !isGeography && selectedChapterNumber === 1 && (
                      <div className="bg-gradient-to-r from-red-900 via-rose-950 to-indigo-950 rounded-3xl p-6 text-white border-2 border-amber-400 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden mb-6">
                        <div className="space-y-2 text-center md:text-left z-10">
                          <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                            <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-950" />
                              3 Hours • 300 VVI अखंड महामैराथन
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
                              2016-2026 बिहार बोर्ड स्पेशल
                            </span>
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black text-amber-300">
                            भौतिकी अध्याय 1: प्रकाश का परावर्तन - 300 VVI वस्तुनिष्ठ अखंड टेस्ट
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-2xl">
                            300 वस्तुनिष्ठ प्रश्नों का 3 घंटे (180 मिनट) का लाइव टेस्ट। वास्तविक OMR शीट मोड, रैंक कार्ड व संपूर्ण विस्तृत समाधान।
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPhysicsMarathonModal(true)}
                          className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer shrink-0 flex items-center justify-center gap-2 border-2 border-white/60"
                        >
                          <Clock className="w-5 h-5 text-slate-950" />
                          <span>🔥 3 घंटे का टेस्ट शुरू करें</span>
                        </button>
                      </div>
                    )}

                    {/* Test Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                      {/* 1. 30 VVI Chapter Test */}
                      <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all p-5 sm:p-6 flex flex-col justify-between space-y-5 group">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 uppercase tracking-wider">
                              बोर्ड स्पेशल
                            </span>
                            <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                              Medium
                            </span>
                          </div>

                          <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                            {customChapterData
                              ? `${currentChapterData.metadata.chapterHindiTitle} - टॉप ${Math.min(30, currentChapterData.objectives.length)} VVI टेस्ट`
                              : isGeography
                              ? selectedGeoChapterNumber === 5
                                ? 'बिहार: कृषि एवं संसाधन - 45 VVI टेस्ट'
                                : selectedGeoChapterNumber === 4
                                ? 'परिवहन, संचार एवं व्यापार - 35 VVI टेस्ट'
                                : selectedGeoChapterNumber === 3
                                ? 'निर्माण उद्योग एवं विनिर्माण - 31 VVI टेस्ट'
                                : selectedGeoChapterNumber === 1
                                ? 'भारत: संसाधन एवं उपयोग - 30 VVI टेस्ट'
                                : 'कृषि (Agriculture) - टॉप 30 VVI टेस्ट'
                              : selectedChapterNumber === 5
                              ? 'विद्युत धारा के चुंबकीय प्रभाव - टॉप 30 VVI टेस्ट'
                              : selectedChapterNumber === 4
                              ? 'विद्युत धारा (Electricity) - टॉप 30 VVI टेस्ट'
                              : selectedChapterNumber === 3
                              ? 'मानव नेत्र तथा रंगबिरंगा संसार - टॉप 30 VVI टेस्ट'
                              : selectedChapterNumber === 1
                              ? 'प्रकाश का परावर्तन - टॉप 30 VVI टेस्ट'
                              : 'प्रकाश का अपवर्तन - टॉप 30 VVI टेस्ट'}
                          </h3>

                          <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                            {customChapterData
                              ? `बिहार बोर्ड परीक्षा में बार-बार पूछे जाने वाले '${currentChapterData.metadata.chapterHindiTitle}' के ${Math.min(30, currentChapterData.objectives.length)} सबसे महत्वपूर्ण वस्तुनिष्ठ प्रश्नों का लाइव टेस्ट।`
                              : isGeography
                              ? selectedGeoChapterNumber === 5
                                ? 'बिहार बोर्ड परीक्षा में पूछे जाने वाले बिहार: कृषि, संसाधन, उद्योग एवं परिवहन के सभी 45 सबसे महत्वपूर्ण वस्तुनिष्ठ प्रश्नों का लाइव टेस्ट।'
                                : selectedGeoChapterNumber === 4
                                ? 'बिहार बोर्ड परीक्षा में पूछे जाने वाले परिवहन, संचार एवं व्यापार के सभी 35 सबसे महत्वपूर्ण वस्तुनिष्ठ प्रश्नों का लाइव टेस्ट।'
                                : selectedGeoChapterNumber === 3
                                ? 'बिहार बोर्ड परीक्षा में पूछे जाने वाले निर्माण उद्योग के सभी 31 सबसे महत्वपूर्ण वस्तुनिष्ठ प्रश्नों का लाइव टेस्ट।'
                                : selectedGeoChapterNumber === 1
                                ? 'बिहार बोर्ड परीक्षा के लिए भारत: संसाधन एवं उपयोग के संपूर्ण 30 महत्वपूर्ण वस्तुनिष्ठ प्रश्नों का लाइव टेस्ट।'
                                : 'बिहार बोर्ड परीक्षा में बार-बार पूछे जाने वाले 30 सबसे महत्वपूर्ण कृषि ऑब्जेक्टिव प्रश्नों का टेस्ट।'
                              : selectedChapterNumber === 5
                              ? 'बिहार बोर्ड परीक्षा में बार-बार पूछे जाने वाले चुंबकीय प्रभाव के 30 सबसे महत्वपूर्ण ऑब्जेक्टिव प्रश्नों का लाइव टेस्ट।'
                              : selectedChapterNumber === 4
                              ? 'बिहार बोर्ड परीक्षा में बार-बार पूछे जाने वाले विद्युत धारा के 30 सबसे महत्वपूर्ण ऑब्जेक्टिव प्रश्नों का लाइव टेस्ट।'
                              : 'बोर्ड परीक्षा में बार-बार पूछे जाने वाले 30 सबसे महत्वपूर्ण ऑब्जेक्टिव प्रश्नों का टेस्ट।'}
                          </p>

                          <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-3 rounded-2xl border border-slate-100 font-black">
                            <div>
                              <div className="text-lg text-slate-900">
                                {customChapterData
                                  ? Math.min(30, currentChapterData.objectives.length)
                                  : isGeography 
                                  ? (selectedGeoChapterNumber === 5 ? '45' : selectedGeoChapterNumber === 4 ? '35' : selectedGeoChapterNumber === 3 ? '31' : '30') 
                                  : '30'}
                              </div>
                              <div className="text-2xs text-slate-400 uppercase">प्रश्न</div>
                            </div>
                            <div className="border-x border-slate-200">
                              <div className="text-lg text-slate-900">25m</div>
                              <div className="text-2xs text-slate-400 uppercase">समय</div>
                            </div>
                            <div>
                              <div className="text-lg text-slate-900">
                                {customChapterData
                                  ? Math.min(30, currentChapterData.objectives.length)
                                  : isGeography 
                                  ? (selectedGeoChapterNumber === 5 ? '45' : selectedGeoChapterNumber === 4 ? '35' : selectedGeoChapterNumber === 3 ? '31' : '30') 
                                  : '30'}
                              </div>
                              <div className="text-2xs text-slate-400 uppercase">अंक</div>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setQuizFilter('30-vvi');
                            setInteractiveQuizMode(true);
                            setQuizSubmitted(false);
                            setQuizUserAnswers({});
                            setQuizTimerSeconds(0);
                            if (scrollContainerRef.current) {
                              scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                          className="w-full px-5 py-3.5 rounded-xl text-sm font-black bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>⚡ टेस्ट शुरू करें</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 2. 15 Questions Rapid Practice Quiz */}
                      <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all p-5 sm:p-6 flex flex-col justify-between space-y-5 group">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                              रैपिड क्विज़
                            </span>
                            <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                              Easy
                            </span>
                          </div>

                          <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                            {customChapterData
                              ? `${currentChapterData.metadata.chapterHindiTitle} - 10 मिनट रैपिड क्विज़`
                              : isGeography
                              ? selectedGeoChapterNumber === 5
                                ? 'बिहार: कृषि एवं संसाधन - 10 मिनट रैपिड क्विज़'
                                : selectedGeoChapterNumber === 4
                                ? 'परिवहन, संचार एवं व्यापार - 10 मिनट रैपिड क्विज़'
                                : selectedGeoChapterNumber === 3
                                ? 'निर्माण उद्योग - 10 मिनट रैपिड क्विज़'
                                : 'कृषि (Agriculture) - 10 मिनट रैपिड क्विज़'
                              : selectedChapterNumber === 5
                              ? 'विद्युत धारा के चुंबकीय प्रभाव - 10 मिनट रैपिड क्विज़'
                              : selectedChapterNumber === 4
                              ? 'विद्युत धारा (Electricity) - 10 मिनट रैपिड क्विज़'
                              : selectedChapterNumber === 3
                              ? 'मानव नेत्र तथा रंगबिरंगा संसार - 10 मिनट रैपिड क्विज़'
                              : selectedChapterNumber === 1
                              ? 'प्रकाश का परावर्तन - 10 मिनट रैपिड क्विज़'
                              : 'प्रकाश का अपवर्तन - 10 मिनट रैपिड क्विज़'}
                          </h3>

                          <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                            {customChapterData
                              ? `त्वरित 10 मिनट अभ्यास क्विज़। '${currentChapterData.metadata.chapterHindiTitle}' के 15 प्रमुख वस्तुनिष्ठ प्रश्नों की तुरंत जाँच करें।`
                              : isGeography
                              ? selectedGeoChapterNumber === 5
                                ? 'त्वरित 10 मिनट अभ्यास क्विज़। बिहार की फसलों, नहरों, ताप विद्युत, उद्योग, रेल व जनसंख्या की तुरंत जाँच करें।'
                                : selectedGeoChapterNumber === 4
                                ? 'त्वरित 10 मिनट अभ्यास क्विज़। सड़क, रेल, जल, वायु व डाक संचार की तुरंत जाँच करें।'
                                : selectedGeoChapterNumber === 3
                                ? 'त्वरित 10 मिनट अभ्यास क्विज़। विनिर्माण, लौह-इस्पात, सीमेंट, वस्त्र व IT उद्योग की तुरंत जाँच करें।'
                                : 'त्वरित 10 मिनट अभ्यास क्विज़। खरीफ, रबी, जायद फसलों व भौगोलिक दशाओं की तुरंत जाँच करें।'
                              : 'त्वरित 10 मिनट अभ्यास क्विज़। बुनियादी सूत्रों एवं परिभाषाओं की तुरंत जाँच करें।'}
                          </p>

                          <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-3 rounded-2xl border border-slate-100 font-black">
                            <div>
                              <div className="text-lg text-slate-900">15</div>
                              <div className="text-2xs text-slate-400 uppercase">प्रश्न</div>
                            </div>
                            <div className="border-x border-slate-200">
                              <div className="text-lg text-slate-900">10m</div>
                              <div className="text-2xs text-slate-400 uppercase">समय</div>
                            </div>
                            <div>
                              <div className="text-lg text-slate-900">15</div>
                              <div className="text-2xs text-slate-400 uppercase">अंक</div>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setQuizFilter('15-rapid');
                            setInteractiveQuizMode(true);
                            setQuizSubmitted(false);
                            setQuizUserAnswers({});
                            setQuizTimerSeconds(0);
                            if (scrollContainerRef.current) {
                              scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                          className="w-full px-5 py-3.5 rounded-xl text-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>⚡ क्विज़ शुरू करें</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 3. Mega Challenge Full Test */}
                      <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-200 hover:border-purple-500 hover:shadow-xl transition-all p-5 sm:p-6 flex flex-col justify-between space-y-5 group">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 uppercase tracking-wider">
                              महा-संग्राम टेस्ट
                            </span>
                            <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800">
                              Hard / Topper
                            </span>
                          </div>

                          <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug group-hover:text-purple-700 transition-colors">
                            {customChapterData
                              ? `${currentChapterData.metadata.chapterHindiTitle} - संपूर्ण ${currentChapterData.objectives.length} प्रश्न महा-संग्राम`
                              : isGeography
                              ? selectedGeoChapterNumber === 5
                                ? 'बिहार: कृषि, खनिज, उद्योग एवं जनसंख्या - संपूर्ण 45 प्रश्न महा-संग्राम'
                                : selectedGeoChapterNumber === 4
                                ? 'परिवहन, संचार एवं व्यापार - संपूर्ण 35 प्रश्न महा-संग्राम'
                                : selectedGeoChapterNumber === 3
                                ? 'निर्माण उद्योग - संपूर्ण 31 प्रश्न महा-संग्राम'
                                : selectedGeoChapterNumber === 1
                                ? 'भारत: संसाधन एवं उपयोग - संपूर्ण 30 प्रश्न महा-संग्राम'
                                : 'कृषि (Agriculture) - संपूर्ण 73 प्रश्न महा-संग्राम'
                              : selectedChapterNumber === 5
                              ? 'विद्युत धारा के चुंबकीय प्रभाव - संपूर्ण 63 प्रश्न महा-संग्राम'
                              : selectedChapterNumber === 4
                              ? 'विद्युत धारा (Electricity) - संपूर्ण 114 प्रश्न महा-संग्राम'
                              : selectedChapterNumber === 3
                              ? 'मानव नेत्र तथा रंगबिरंगा संसार - संपूर्ण 63 प्रश्न महा-संग्राम'
                              : selectedChapterNumber === 1
                              ? 'प्रकाश का परावर्तन - संपूर्ण 66 प्रश्न महा-संग्राम'
                              : 'प्रकाश का अपवर्तन - संपूर्ण 94 प्रश्न महा-संग्राम'}
                          </h3>

                          <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                            {customChapterData
                              ? `इस अध्याय के सभी ${currentChapterData.objectives.length} VVI ऑब्जेक्टिव प्रश्नों का संपूर्ण लाइव टेस्ट। 100% अंक लाने वाले छात्रों के लिए।`
                              : isGeography
                              ? selectedGeoChapterNumber === 5
                                ? 'इस अध्याय के सभी 45 ऑब्जेक्टिव प्रश्नों का संपूर्ण लाइव टेस्ट। 100% अंक लाने वाले छात्रों के लिए।'
                                : selectedGeoChapterNumber === 4
                                ? 'इस अध्याय के सभी 35 ऑब्जेक्टिव प्रश्नों का संपूर्ण लाइव टेस्ट। 100% अंक लाने वाले छात्रों के लिए।'
                                : selectedGeoChapterNumber === 3
                                ? 'इस अध्याय के सभी 31 ऑब्जेक्टिव प्रश्नों का संपूर्ण लाइव टेस्ट। 100% अंक लाने वाले छात्रों के लिए।'
                                : selectedGeoChapterNumber === 1
                                ? 'इस अध्याय के सभी 30 ऑब्जेक्टिव प्रश्नों का संपूर्ण लाइव टेस्ट। 100% अंक लाने वाले छात्रों के लिए।'
                                : 'इस अध्याय के सभी 73 ऑब्जेक्टिव प्रश्नों का फुल-लेंथ टेस्ट। 100% अंक लाने वाले छात्रों के लिए।'
                              : `इस अध्याय के सभी ${selectedChapterNumber === 5 ? '63' : selectedChapterNumber === 4 ? '114' : selectedChapterNumber === 3 ? '63' : selectedChapterNumber === 1 ? '66' : '94'} ऑब्जेक्टिव प्रश्नों का फुल-लेंथ टेस्ट। 100% अंक लाने वाले छात्रों के लिए।`}
                          </p>

                          <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-3 rounded-2xl border border-slate-100 font-black">
                            <div>
                              <div className="text-lg text-slate-900">
                                {customChapterData
                                  ? currentChapterData.objectives.length
                                  : isGeography 
                                  ? (selectedGeoChapterNumber === 5 ? '45' : selectedGeoChapterNumber === 4 ? '35' : selectedGeoChapterNumber === 3 ? '31' : selectedGeoChapterNumber === 1 ? '30' : '73') 
                                  : selectedChapterNumber === 5 ? '63' : selectedChapterNumber === 4 ? '114' : selectedChapterNumber === 3 ? '63' : selectedChapterNumber === 1 ? '66' : '94'}
                              </div>
                              <div className="text-2xs text-slate-400 uppercase">प्रश्न</div>
                            </div>
                            <div className="border-x border-slate-200">
                              <div className="text-lg text-slate-900">
                                {customChapterData
                                  ? `${Math.max(25, Math.round(currentChapterData.objectives.length * 0.6))}m`
                                  : isGeography 
                                  ? (selectedGeoChapterNumber === 5 ? '35m' : selectedGeoChapterNumber === 4 ? '30m' : selectedGeoChapterNumber === 3 ? '30m' : selectedGeoChapterNumber === 1 ? '25m' : '45m') 
                                  : selectedChapterNumber === 5 ? '60m' : selectedChapterNumber === 4 ? '90m' : selectedChapterNumber === 3 ? '60m' : selectedChapterNumber === 1 ? '60m' : '90m'}
                              </div>
                              <div className="text-2xs text-slate-400 uppercase">समय</div>
                            </div>
                            <div>
                              <div className="text-lg text-slate-900">
                                {customChapterData
                                  ? currentChapterData.objectives.length
                                  : isGeography 
                                  ? (selectedGeoChapterNumber === 5 ? '45' : selectedGeoChapterNumber === 4 ? '35' : selectedGeoChapterNumber === 3 ? '31' : selectedGeoChapterNumber === 1 ? '30' : '73') 
                                  : selectedChapterNumber === 5 ? '63' : selectedChapterNumber === 4 ? '114' : selectedChapterNumber === 3 ? '63' : selectedChapterNumber === 1 ? '66' : '94'}
                              </div>
                              <div className="text-2xs text-slate-400 uppercase">अंक</div>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setQuizFilter('all');
                            setInteractiveQuizMode(true);
                            setQuizSubmitted(false);
                            setQuizUserAnswers({});
                            setQuizTimerSeconds(0);
                            if (scrollContainerRef.current) {
                              scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                          className="w-full px-5 py-3.5 rounded-xl text-sm font-black bg-purple-700 hover:bg-purple-800 text-white transition-all shadow-md shadow-purple-700/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>⚡ महा-संग्राम शुरू करें</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </WatermarkWrapper>

        {/* Footer info & close button */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs sm:text-sm text-slate-600 font-bold">
          <div>
            RK STUDY CENTRE • बिहार बोर्ड मैट्रिक परीक्षा 2025-26 • {isHindi ? `हिंदी नोट्स (${currentChapterData.metadata.chapterHindiTitle})` : isGeography ? `भूगोल नोट्स (${currentChapterData.metadata.chapterHindiTitle})` : 'भौतिकी नोट्स'} (बड़े अक्षर शैली)
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={() => {
                setActiveTab('objectives');
                setShowAllAnswers(true);
                if (scrollContainerRef.current) {
                  scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>✓ उत्तर जाँचें (Check)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('tests');
                setQuizFilter('all');
                setInteractiveQuizMode(true);
                setQuizSubmitted(false);
                setQuizUserAnswers({});
                setQuizTimerSeconds(0);
                if (scrollContainerRef.current) {
                  scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>⚡ तुरंत टेस्ट शुरू करें</span>
            </button>
            <button
              type="button"
              onClick={() => setFontSize('big')}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-200 text-slate-800 text-xs font-black cursor-pointer"
            >
              बड़े अक्षर रीसेट करें
            </button>
            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-black cursor-pointer hover:bg-blue-700"
              >
                बंद करें
              </button>
            )}
          </div>
        </div>

        {/* Download Notes Modal */}
        <DownloadNotesModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          data={{
            metadata: currentChapterData.metadata,
            keyFormulas: currentChapterData.keyFormulas,
            sections: currentChapterData.sections,
            objectiveQuestions: currentChapterData.objectives,
            subjectiveQuestions: currentChapterData.subjectiveQuestions,
          }}
        />

        {/* Share Notes Modal (WhatsApp, Instagram, Facebook, Link Creator) */}
        <ShareNotesModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          data={{
            title: currentChapterData.metadata.chapterHindiTitle,
            subjectName: isHindi ? 'हिंदी (गोधूलि भाग-2)' : isGeography ? 'सामाजिक विज्ञान (भूगोल)' : 'विज्ञान (भौतिकी)',
            chapterTitle: `${currentChapterData.metadata.chapterHindiTitle} (${currentChapterData.metadata.chapterEnglishTitle})`,
            classLevel: 'कक्षा 10 (Class 10)',
            noteId: currentChapterData.metadata.chapterId,
            chapterSlug: currentChapterData.metadata.chapterId,
            subjectSlug: isHindi ? 'hin' : isGeography ? 'c10-soc' : 'c10-sci',
            bookSlug: isHindi ? 'b-c10-hin-godhuli' : isGeography ? 'b-c10-soc-geography' : 'b-c10-sci-physics',
            description: `संपूर्ण ${currentChapterData.metadata.totalPages} पृष्ठ हस्तलिखित नोट्स व ${currentChapterData.metadata.totalObjectives} VVI वस्तुनिष्ठ प्रश्नोत्तर। By Prince Sir`,
          }}
        />

        {/* Annotations & Highlights Modal */}
        <AnnotationsDrawerModal
          isOpen={showAnnotationsModal}
          onClose={() => setShowAnnotationsModal(false)}
        />

        {/* Bihar Board Class 10 Physics 500 Question Bank Modal */}
        <Physics500QuestionBankViewer
          isOpen={showPhysics500Modal}
          onClose={() => setShowPhysics500Modal(false)}
        />

        {/* Physics Chapter Progress Tracker Modal */}
        <PhysicsProgressTrackerModal
          isOpen={showPhysicsProgressModal}
          onClose={() => setShowPhysicsProgressModal(false)}
        />

        {/* AI Doubt Solver & Personal Tutor Modal */}
        <AIDoubtSolverModal
          isOpen={showDoubtSolverModal}
          onClose={() => setShowDoubtSolverModal(false)}
        />

        {/* Physics Chapter 01 300 VVI Akhand Marathon Modal */}
        <PhysicsCh01MarathonModal
          isOpen={showPhysicsMarathonModal}
          onClose={() => setShowPhysicsMarathonModal(false)}
          onNavigateToNotes={() => {
            setShowPhysicsMarathonModal(false);
            setActiveTab('notes');
          }}
        />
      </div>
    </div>
  );
}
