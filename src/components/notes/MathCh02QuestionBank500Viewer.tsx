import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Printer,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  Bookmark,
  Play,
  RotateCcw,
  ListOrdered,
  Check,
  Filter,
  Calculator,
  Flame,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Layers,
} from 'lucide-react';
import {
  CLASS_10_MATH_CH02_500_QUESTIONS,
  CLASS_10_MATH_CH02_500_PARTS,
  MathCh02Question500Item,
} from '../../data/class10MathCh02QuestionBank500';
import {
  CLASS_10_MATH_CH03_500_QUESTIONS,
  CLASS_10_MATH_CH03_500_PARTS,
} from '../../data/class10MathCh03QuestionBank500';
import { recordTestResult } from '../../services/progressService';
import { useAuth } from '../../context/AuthContext';

interface MathCh02QuestionBank500ViewerProps {
  onBack?: () => void;
  initialMode?: 'read' | 'solve' | 'test' | 'answerKey' | 'answer-key';
  onOpenFormulaSheet?: () => void;
  chapterNumber?: 2 | 3;
}

type TestPresetId =
  | 'mega-500'
  | 'top-50'
  | 'set-1'
  | 'set-2'
  | 'set-3'
  | 'set-4'
  | 'set-5'
  | 'part-1'
  | 'part-2'
  | 'part-3'
  | 'part-4'
  | 'part-5'
  | 'part-6'
  | 'part-7'
  | 'part-8'
  | 'part-9'
  | 'part-10';

interface TestPreset {
  id: TestPresetId;
  title: string;
  subtitle: string;
  startQ: number;
  endQ: number;
  durationMinutes: number;
  badge: string;
}

const TEST_PRESETS: TestPreset[] = [
  {
    id: 'mega-500',
    title: 'संपूर्ण 500 VVI महा-संग्राम टेस्ट (Full 1–500)',
    subtitle: 'अध्याय 2 के सभी 500 वस्तुनिष्ठ प्रश्नों का अखंड लाइव OMR व कार्ड टेस्ट',
    startQ: 1,
    endQ: 500,
    durationMinutes: 180,
    badge: '🔥 500 Qs • 180 Min',
  },
  {
    id: 'top-50',
    title: 'बोर्ड परीक्षा स्पेशल Top 50 VVI टेस्ट (Q. 1–50)',
    subtitle: 'बिहार बोर्ड 2015–2026 के सबसे महत्वपूर्ण 50 PYQ एवं VVI प्रश्न',
    startQ: 1,
    endQ: 50,
    durationMinutes: 45,
    badge: '⭐ 50 Qs • 45 Min',
  },
  {
    id: 'set-1',
    title: 'सेट 1 (प्रश्न 1–100): बहुपद पहचान, घात एवं शून्यक',
    subtitle: 'खंड 1 और खंड 2 के 100 महत्वपूर्ण वस्तुनिष्ठ प्रश्न',
    startQ: 1,
    endQ: 100,
    durationMinutes: 60,
    badge: '100 Qs • 60 Min',
  },
  {
    id: 'set-2',
    title: 'सेट 2 (प्रश्न 101–200): α + β, α·β एवं 1/α + 1/β',
    subtitle: 'शून्यकों का योग, गुणनफल और व्युत्क्रमों के योग पर 100 प्रश्न',
    startQ: 101,
    endQ: 200,
    durationMinutes: 60,
    badge: '100 Qs • 60 Min',
  },
  {
    id: 'set-3',
    title: 'सेट 3 (प्रश्न 201–300): α² + β², (α - β)² एवं α³ + β³',
    subtitle: 'वर्गों का योग, अंतर और घनों के योग पर आधारित 100 प्रश्न',
    startQ: 201,
    endQ: 300,
    durationMinutes: 60,
    badge: '100 Qs • 60 Min',
  },
  {
    id: 'set-4',
    title: 'सेट 4 (प्रश्न 301–400): बहुपद निर्माण एवं k का मान',
    subtitle: 'x² - (α+β)x + αβ तथा अज्ञात अचर k का मान ज्ञात करना (100 प्रश्न)',
    startQ: 301,
    endQ: 400,
    durationMinutes: 60,
    badge: '100 Qs • 60 Min',
  },
  {
    id: 'set-5',
    title: 'सेट 5 (प्रश्न 401–500): p(k) का मान, विभाजन एवं त्रिघात बहुपद',
    subtitle: 'बहुपद का मान p(k), भागफल का घात एवं त्रिघात बहुपद (α, β, γ) के 100 प्रश्न',
    startQ: 401,
    endQ: 500,
    durationMinutes: 60,
    badge: '100 Qs • 60 Min',
  },
];

const CH03_TEST_PRESETS: TestPreset[] = [
  {
    id: 'mega-500',
    title: 'संपूर्ण 500 VVI महा-संग्राम टेस्ट (Full 1–500)',
    subtitle: 'अध्याय 3 (दो चर वाले रैखिक समीकरण युग्म) के सभी 500 वस्तुनिष्ठ प्रश्नों का अखंड लाइव OMR व कार्ड टेस्ट',
    startQ: 1,
    endQ: 500,
    durationMinutes: 180,
    badge: '🔥 500 Qs • 180 Min',
  },
  {
    id: 'top-50',
    title: 'बोर्ड परीक्षा स्पेशल Top 50 VVI टेस्ट (Q. 1–50)',
    subtitle: 'बिहार बोर्ड 2015–2026 के सबसे महत्वपूर्ण 50 PYQ एवं VVI प्रश्न',
    startQ: 1,
    endQ: 50,
    durationMinutes: 45,
    badge: '⭐ 50 Qs • 45 Min',
  },
  {
    id: 'set-1',
    title: 'सेट 1 (प्रश्न 1–100): मानक रूप एवं अनुपात तुलना (a₁/a₂, b₁/b₂, c₁/c₂)',
    subtitle: 'खंड 1 और खंड 2 के 100 महत्वपूर्ण वस्तुनिष्ठ प्रश्न',
    startQ: 1,
    endQ: 100,
    durationMinutes: 60,
    badge: '100 Qs • 60 Min',
  },
  {
    id: 'set-2',
    title: 'सेट 2 (प्रश्न 101–200): ग्राफीय निरूपण एवं संगत/असंगत युग्म',
    subtitle: 'प्रतिच्छेदी, संपाती, समांतर रेखाएँ तथा अविरोधी/विरोधी/आश्रित युग्म के 100 प्रश्न',
    startQ: 101,
    endQ: 200,
    durationMinutes: 60,
    badge: '100 Qs • 60 Min',
  },
  {
    id: 'set-3',
    title: 'सेट 3 (प्रश्न 201–300): k का मान तथा प्रतिस्थापन व विलोपन विधि',
    subtitle: 'अज्ञात स्थिरांक k का मान और (x, y) के हल पर आधारित 100 प्रश्न',
    startQ: 201,
    endQ: 300,
    durationMinutes: 60,
    badge: '100 Qs • 60 Min',
  },
  {
    id: 'set-4',
    title: 'सेट 4 (प्रश्न 301–400): वज्र-गुणन विधि, संख्या एवं भिन्न प्रश्न',
    subtitle: 'वज्र-गुणन सूत्र, सममित समीकरण, दो अंकों की संख्या (10x+y) व भिन्न के 100 प्रश्न',
    startQ: 301,
    endQ: 400,
    durationMinutes: 60,
    badge: '100 Qs • 60 Min',
  },
  {
    id: 'set-5',
    title: 'सेट 5 (प्रश्न 401–500): आयु, कोण, नाव-धारा एवं बिहार बोर्ड PYQ',
    subtitle: 'पिता-पुत्र आयु, संपूरक कोण, धारा के अनुकूल/प्रतिकूल चाल व PYQ के 100 प्रश्न',
    startQ: 401,
    endQ: 500,
    durationMinutes: 60,
    badge: '100 Qs • 60 Min',
  },
];

export const MathCh02QuestionBank500Viewer: React.FC<MathCh02QuestionBank500ViewerProps> = ({
  onBack,
  initialMode = 'read',
  onOpenFormulaSheet,
  chapterNumber = 2,
}) => {
  const { user } = useAuth();
  const isCh03 = chapterNumber === 3;
  const activePresetsList = isCh03 ? CH03_TEST_PRESETS : TEST_PRESETS;
  const activePartsList = isCh03 ? CLASS_10_MATH_CH03_500_PARTS : CLASS_10_MATH_CH02_500_PARTS;

  // Main View Tab: 'read' (Read Option + Solved Answer), 'test' (Active Live Test), 'answerKey' (500 Answer Table)
  const resolvedInitialMode: 'read' | 'test' | 'answerKey' =
    initialMode === 'test'
      ? 'test'
      : initialMode === 'answerKey' || initialMode === 'answer-key'
      ? 'answerKey'
      : 'read';
  const [activeMode, setActiveMode] = useState<'read' | 'test' | 'answerKey'>(resolvedInitialMode);

  // ==========================================================================
  // READ & SOLVE MODE STATES
  // ==========================================================================
  const [selectedPartId, setSelectedPartId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quickJumpNum, setQuickJumpNum] = useState<string>('');
  const [showAllSolved, setShowAllSolved] = useState<boolean>(initialMode !== 'read');
  const [individualSolvedToggle, setIndividualSolvedToggle] = useState<Record<number, boolean>>({});
  const [readPracticeClicks, setReadPracticeClicks] = useState<Record<number, number>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<number, boolean>>({});
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);
  const [readPage, setReadPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 50;

  // ==========================================================================
  // ACTIVE LIVE TEST MODE STATES
  // ==========================================================================
  const [selectedPresetId, setSelectedPresetId] = useState<TestPresetId>('mega-500');
  const [testPhase, setTestPhase] = useState<'select' | 'running' | 'result'>('select');
  const [testViewStyle, setTestViewStyle] = useState<'card' | 'omr'>('card');
  const [instantFeedbackMode, setInstantFeedbackMode] = useState<boolean>(true);
  const [currentTestIdx, setCurrentTestIdx] = useState<number>(0);
  const [testAnswers, setTestAnswers] = useState<Record<number, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(180 * 60);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'wrong' | 'skipped'>('all');

  const allQuestions = isCh03 ? CLASS_10_MATH_CH03_500_QUESTIONS : CLASS_10_MATH_CH02_500_QUESTIONS;

  // Filtered questions for Read Mode
  const filteredReadQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      if (selectedPartId !== 'all' && q.partId !== selectedPartId) return false;
      if (onlyBookmarked && !bookmarkedIds[q.id]) return false;
      if (searchQuery.trim()) {
        const term = searchQuery.trim().toLowerCase();
        const qNumMatch = String(q.id) === term || `#${q.id}` === term;
        const textMatch =
          q.question.toLowerCase().includes(term) ||
          q.explanation.toLowerCase().includes(term) ||
          q.topic.toLowerCase().includes(term) ||
          q.options.some((o) => o.toLowerCase().includes(term));
        return qNumMatch || textMatch;
      }
      return true;
    });
  }, [allQuestions, selectedPartId, onlyBookmarked, bookmarkedIds, searchQuery]);

  // Reset pagination when filter changes
  useEffect(() => {
    setReadPage(1);
  }, [selectedPartId, onlyBookmarked, searchQuery]);

  const totalReadPages = Math.max(1, Math.ceil(filteredReadQuestions.length / ITEMS_PER_PAGE));
  const paginatedReadQuestions = useMemo(() => {
    const start = (readPage - 1) * ITEMS_PER_PAGE;
    return filteredReadQuestions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredReadQuestions, readPage]);

  // Active Test Questions based on selected preset
  const activePreset = useMemo(
    () => activePresetsList.find((p) => p.id === selectedPresetId) || activePresetsList[0],
    [activePresetsList, selectedPresetId]
  );

  const testQuestions = useMemo(() => {
    return allQuestions.filter((q) => q.id >= activePreset.startQ && q.id <= activePreset.endQ);
  }, [allQuestions, activePreset]);

  // Timer Effect for Active Test
  useEffect(() => {
    if (activeMode !== 'test' || testPhase !== 'running' || isTimerPaused) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTestPhase('result');
          return 0;
        }
        return prev - 1;
      });
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeMode, testPhase, isTimerPaused]);

  const formatTimer = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleStartTest = (preset: TestPreset) => {
    setSelectedPresetId(preset.id);
    setTestAnswers({});
    setCurrentTestIdx(0);
    setTimeLeftSeconds(preset.durationMinutes * 60);
    setTimeSpentSeconds(0);
    setIsTimerPaused(false);
    setTestPhase('running');
    setActiveMode('test');
  };

  const handleSubmitTest = () => {
    setTestPhase('result');
    // Save progress if user is logged in
    let correctCount = 0;
    testQuestions.forEach((q) => {
      if (testAnswers[q.id] === q.correctOptionIndex) {
        correctCount++;
      }
    });
    if (user?.uid) {
      let incorrectCount = 0;
      let unattemptedCount = 0;
      const studentAnsMap: Record<string, number> = {};
      testQuestions.forEach((q) => {
        if (testAnswers[q.id] === undefined) {
          unattemptedCount++;
        } else {
          studentAnsMap[String(q.id)] = testAnswers[q.id];
          if (testAnswers[q.id] !== q.correctOptionIndex) {
            incorrectCount++;
          }
        }
      });
      recordTestResult(
        {
          id: `res-math02-${Date.now().toString(36)}`,
          testId: `math-ch02-${activePreset.id}`,
          studentId: user.uid,
          testTitle: activePreset.title,
          classLevel: 'class-10',
          subjectId: 'c10-math',
          score: correctCount,
          totalMarks: testQuestions.length,
          correctAnswers: correctCount,
          incorrectAnswers: incorrectCount,
          unattempted: unattemptedCount,
          timeTakenMinutes: Math.max(1, Math.round(timeSpentSeconds / 60)),
          completedAt: new Date().toISOString(),
          studentAnswers: studentAnsMap,
          passed: correctCount >= Math.ceil(testQuestions.length * 0.4),
        },
        user.uid
      ).catch(() => {});
    }
  };

  const testScoreStats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    testQuestions.forEach((q) => {
      const chosen = testAnswers[q.id];
      if (chosen === undefined) {
        skipped++;
      } else if (chosen === q.correctOptionIndex) {
        correct++;
      } else {
        wrong++;
      }
    });
    const attempted = correct + wrong;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const percentage = testQuestions.length > 0 ? Math.round((correct / testQuestions.length) * 100) : 0;
    return { correct, wrong, skipped, attempted, accuracy, percentage, total: testQuestions.length };
  }, [testQuestions, testAnswers]);

  const handleQuickJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(quickJumpNum, 10);
    if (!isNaN(num) && num >= 1 && num <= 500) {
      setSelectedPartId('all');
      setOnlyBookmarked(false);
      setSearchQuery('');
      const targetPage = Math.ceil(num / ITEMS_PER_PAGE);
      setReadPage(targetPage);
      setTimeout(() => {
        const el = document.getElementById(`math02-q-${num}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const isQuestionSolvedVisible = (qId: number) => {
    if (individualSolvedToggle[qId] !== undefined) {
      return individualSolvedToggle[qId];
    }
    return showAllSolved;
  };

  const toggleSingleSolved = (qId: number) => {
    setIndividualSolvedToggle((prev) => ({
      ...prev,
      [qId]: !isQuestionSolvedVisible(qId),
    }));
  };

  const toggleAllSolved = () => {
    const next = !showAllSolved;
    setShowAllSolved(next);
    setIndividualSolvedToggle({});
  };

  const currentTestQ: MathCh02Question500Item | undefined = testQuestions[currentTestIdx];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 text-slate-900 pb-20">
      {/* Top Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs print:hidden">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>वापस</span>
              </button>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[11px] font-black tracking-wide uppercase">
                  {isCh03 ? 'CLASS 10 MATHS • CHAPTER 03' : 'CLASS 10 MATHS • CHAPTER 02'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-black">
                  🔥 500 VVI OBJECTIVE + SOLVED ANSWER + LIVE TEST
                </span>
              </div>
              <h1 className="text-base sm:text-xl font-black text-slate-900 mt-0.5">
                {isCh03
                  ? 'अध्याय 3: दो चर वाले रैखिक समीकरण युग्म — 500 VVI वस्तुनिष्ठ प्रश्न बैंक (विकल्प एवं हल सहित)'
                  : 'अध्याय 2: बहुपद (Polynomials) — 500 VVI वस्तुनिष्ठ प्रश्न बैंक (विकल्प एवं हल सहित)'}
              </h1>
            </div>
          </div>

          {/* Main Mode Switcher Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveMode('read')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'read'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>📖 500 प्रश्न पढ़ें (Option + Solved)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('test')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'test'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>⚡ लाइव टेस्ट (Active Test)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('answerKey')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'answerKey'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">उत्तर तालिका (1–500)</span>
              <span className="sm:hidden">Key</span>
            </button>

            {onOpenFormulaSheet && (
              <button
                type="button"
                onClick={onOpenFormulaSheet}
                className="px-3 py-2 rounded-xl text-xs font-black bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition cursor-pointer hidden md:flex items-center gap-1"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>सूत्र नोट्स</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-5">
        {/* ====================================================================
            MODE 1: READ & SOLVE 500 QUESTIONS (OPTION ANSWER + SOLVED ANSWER)
           ==================================================================== */}
        {activeMode === 'read' && (
          <div className="space-y-5">
            {/* Hero Stats & Quick Action Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white p-5 sm:p-6 shadow-xl border border-indigo-700/50">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                    <Flame className="w-3.5 h-3.5 fill-slate-950" />
                    <span>500 VVI OBJECTIVE BANK • OPTION ANSWER + STEP-BY-STEP SOLVED ANSWER</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black">
                    {isCh03
                      ? 'कक्षा 10 गणित — अध्याय 3: दो चर वाले रैखिक समीकरण युग्म (500 VVI वस्तुनिष्ठ प्रश्न एवं हल)'
                      : 'कक्षा 10 गणित — अध्याय 2: बहुपद (500 VVI वस्तुनिष्ठ प्रश्न एवं हल)'}
                  </h2>
                  <p className="text-xs sm:text-sm text-indigo-100 max-w-3xl">
                    यहाँ सभी 500 प्रश्नों के चारों विकल्प (A, B, C, D), सही विकल्प उत्तर (Option Answer) और चरणबद्ध गणितीय हल (Solved Answer) दिए गए हैं। आप किसी भी विकल्प पर क्लिक करके अभ्यास भी कर सकते हैं या सीधे लाइव टेस्ट दे सकते हैं!
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={toggleAllSolved}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer flex items-center gap-2 shadow-md ${
                      showAllSolved
                        ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                        : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                    }`}
                  >
                    {showAllSolved ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{showAllSolved ? 'सभी हल छुपाएँ (Practice)' : 'सभी विकल्प व हल दिखाएँ'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartTest(activePresetsList[0])}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black transition cursor-pointer flex items-center gap-2 shadow-md"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>⚡ 500 प्रश्नों का लाइव टेस्ट शुरू करें</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-white/15"
                  >
                    <Printer className="w-4 h-4" />
                    <span>प्रिंट / PDF</span>
                  </button>
                </div>
              </div>

              {/* 10 Topic Parts Filter Chips */}
              <div className="mt-5 pt-4 border-t border-white/15">
                <div className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>10 टॉपिक खंड (50 प्रश्न प्रति खंड = 500 VVI प्रश्न) — किसी भी खंड को चुनें:</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setSelectedPartId('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
                      selectedPartId === 'all'
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    सभी 500 प्रश्न (1–500)
                  </button>
                  {activePartsList.map((part) => (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => setSelectedPartId(part.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        selectedPartId === part.id
                          ? 'bg-white text-indigo-950 font-black shadow-xs'
                          : 'bg-white/10 text-indigo-100 hover:bg-white/20'
                      }`}
                    >
                      Part {part.partNumber}: {part.rangeLabel}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Search, Quick Jump & Page Selector Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 print:hidden">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="प्रश्न, सूत्र (α+β, 1/α+1/β, α²+β²) या प्रश्न संख्या खोजें..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <form onSubmit={handleQuickJump} className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={quickJumpNum}
                  onChange={(e) => setQuickJumpNum(e.target.value)}
                  placeholder="प्रश्न # (1-500)"
                  className="w-32 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black cursor-pointer transition"
                >
                  जाएँ (Go)
                </button>
              </form>

              <button
                type="button"
                onClick={() => setOnlyBookmarked((prev) => !prev)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-black border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  onlyBookmarked
                    ? 'bg-amber-100 border-amber-400 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>बुकमार्क ({Object.values(bookmarkedIds).filter(Boolean).length})</span>
              </button>
            </div>

            {/* Pagination Range Pills (1-50, 51-100, ..., 451-500) */}
            {totalReadPages > 1 && (
              <div className="bg-white rounded-2xl p-3 border border-slate-200 flex items-center justify-between flex-wrap gap-2 print:hidden">
                <span className="text-xs font-extrabold text-slate-600 px-2">
                  दिखाए जा रहे हैं: कुल <strong className="text-blue-700">{filteredReadQuestions.length}</strong> प्रश्नों में से पेज{' '}
                  <strong className="text-slate-900">{readPage} / {totalReadPages}</strong>
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {Array.from({ length: totalReadPages }, (_, idx) => {
                    const pNum = idx + 1;
                    const startQ = idx * ITEMS_PER_PAGE + 1;
                    const endQ = Math.min((idx + 1) * ITEMS_PER_PAGE, filteredReadQuestions.length);
                    return (
                      <button
                        key={pNum}
                        type="button"
                        onClick={() => {
                          setReadPage(pNum);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                          readPage === pNum
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {startQ}–{endQ}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-4">
              {paginatedReadQuestions.map((q) => {
                const isSolvedShown = isQuestionSolvedVisible(q.id);
                const clickedOpt = readPracticeClicks[q.id];
                const isBookmarked = !!bookmarkedIds[q.id];

                return (
                  <article
                    key={q.id}
                    id={`math02-q-${q.id}`}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition overflow-hidden"
                  >
                    {/* Card Top Metadata Bar */}
                    <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-slate-50 via-blue-50/40 to-purple-50/40 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black shadow-2xs">
                          प्रश्न #{q.id}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-900 text-[11px] font-extrabold border border-purple-200">
                          {q.topic}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 text-[11px] font-black border border-amber-300">
                          ★ {q.boardTag}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSingleSolved(q.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer flex items-center gap-1 ${
                            isSolvedShown
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSolvedShown ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{isSolvedShown ? 'हल छुपाएँ' : 'विकल्प व हल देखें'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setBookmarkedIds((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                          }
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            isBookmarked
                              ? 'bg-amber-100 border-amber-400 text-amber-700'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                          }`}
                          title="बुकमार्क करें"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Question Statement */}
                    <div className="p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-relaxed mb-4">
                        <span className="text-blue-600 mr-1.5">प्र. {q.id}.</span>
                        {q.question}
                      </h3>

                      {/* 4 Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((optText, optIdx) => {
                          const optLetter = ['A', 'B', 'C', 'D'][optIdx];
                          const isCorrect = optIdx === q.correctOptionIndex;
                          const isUserClicked = clickedOpt === optIdx;
                          const showHighlight = isSolvedShown || clickedOpt !== undefined;

                          let btnStyle =
                            'bg-slate-50/90 hover:bg-blue-50/60 border-slate-200 text-slate-800';
                          let badgeStyle = 'bg-white border-slate-300 text-slate-700';

                          if (showHighlight) {
                            if (isCorrect) {
                              btnStyle =
                                'bg-emerald-50/95 border-emerald-500 text-emerald-950 ring-1 ring-emerald-400/50';
                              badgeStyle = 'bg-emerald-600 border-emerald-600 text-white';
                            } else if (isUserClicked && !isCorrect) {
                              btnStyle = 'bg-rose-50 border-rose-400 text-rose-900';
                              badgeStyle = 'bg-rose-600 border-rose-600 text-white';
                            }
                          }

                          return (
                            <button
                              key={optLetter}
                              type="button"
                              onClick={() =>
                                setReadPracticeClicks((prev) => ({ ...prev, [q.id]: optIdx }))
                              }
                              className={`w-full text-left p-3 sm:p-3.5 rounded-2xl border-2 transition flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span
                                  className={`w-7 h-7 rounded-xl border text-xs font-black flex items-center justify-center shrink-0 ${badgeStyle}`}
                                >
                                  {optLetter}
                                </span>
                                <span className="text-sm sm:text-base font-bold break-words">
                                  {optText}
                                </span>
                              </div>
                              {showHighlight && isCorrect && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black shrink-0">
                                  <Check className="w-3 h-3" /> सही उत्तर
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* OPTION ANSWER + STEP-BY-STEP SOLVED ANSWER BOX */}
                      {(isSolvedShown || clickedOpt !== undefined) && (
                        <div className="mt-4 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-purple-50/80 border border-blue-200/90 p-4 sm:p-5">
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-blue-200/70">
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-2xs">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>
                                  सही विकल्प (Option Answer): ({q.correctOption}) {q.answerText}
                                </span>
                              </span>
                            </div>
                            <span className="text-[11px] font-black text-indigo-700 bg-indigo-100/80 px-2.5 py-1 rounded-lg">
                              ✓ चरणबद्ध हल (Solved Answer)
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="text-xs font-black text-blue-900 uppercase tracking-wider mb-1">
                              📝 हल (Step-by-Step Solution):
                            </div>
                            {q.solvedSteps.map((stepLine, sIdx) => (
                              <div
                                key={sIdx}
                                className="flex items-start gap-2 text-xs sm:text-sm font-bold text-slate-800 leading-relaxed"
                              >
                                <span className="w-5 h-5 rounded-full bg-blue-600/15 text-blue-800 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                  {sIdx + 1}
                                </span>
                                <span>{stepLine}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Bottom Page Navigation */}
            {totalReadPages > 1 && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between gap-3 print:hidden">
                <button
                  type="button"
                  disabled={readPage <= 1}
                  onClick={() => {
                    setReadPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xs font-black text-slate-800 cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" /> पिछला पेज
                </button>
                <span className="text-xs sm:text-sm font-black text-slate-700">
                  पेज {readPage} / {totalReadPages} (कुल {filteredReadQuestions.length} प्रश्न)
                </span>
                <button
                  type="button"
                  disabled={readPage >= totalReadPages}
                  onClick={() => {
                    setReadPage((p) => Math.min(totalReadPages, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-xs font-black text-white cursor-pointer flex items-center gap-1.5"
                >
                  अगला पेज <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            MODE 2: ACTIVE LIVE TEST ENGINE (ALL FEATURES ACTIVE)
           ==================================================================== */}
        {activeMode === 'test' && (
          <div className="space-y-5">
            {testPhase === 'select' && (
              <div className="space-y-5">
                <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-950 text-white p-6 shadow-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ALL TEST FEATURES ACTIVE • LIVE TIMER • OMR + INSTANT SOLVED ANSWER</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black">
                    {isCh03
                      ? 'अध्याय 3: दो चर वाले रैखिक समीकरण युग्म — लाइव ऑनलाइन टेस्ट पोर्टल'
                      : 'अध्याय 2: बहुपद (Polynomials) — लाइव ऑनलाइन टेस्ट पोर्टल'}
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-3xl">
                    नीचे दिए गए किसी भी टेस्ट सेट को चुनें। आप संपूर्ण 500 प्रश्नों का महा-संग्राम टेस्ट दे सकते हैं या 100-100 प्रश्नों के सेट और 50-50 प्रश्नों के टॉपिक-वाइज टेस्ट दे सकते हैं!
                  </p>
                </div>

                {/* Main Test Presets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activePresetsList.map((preset) => (
                    <div
                      key={preset.id}
                      className="bg-white rounded-3xl p-5 border-2 border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-md transition flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-black">
                            {preset.badge}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                            ● Active Live Test
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                          {preset.title}
                        </h3>
                        <p className="text-xs text-slate-600 font-medium">{preset.subtitle}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="text-xs font-bold text-slate-500">
                          प्रश्न: <strong className="text-slate-800">{preset.startQ} से {preset.endQ}</strong> • समय:{' '}
                          <strong className="text-slate-800">{preset.durationMinutes} मिनट</strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleStartTest(preset)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>टेस्ट शुरू करें</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 10 Topic-wise 50-Question Mini Tests */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    <span>खंड-वार 50-50 प्रश्नों के टॉपिक स्पेशल लाइव टेस्ट (Part 1 से Part 10):</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {activePartsList.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-2xl p-3.5 bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="text-[11px] font-black text-purple-700 uppercase">
                            Part {p.partNumber} ({p.rangeLabel})
                          </div>
                          <div className="text-xs font-extrabold text-slate-900 mt-1 line-clamp-2">
                            {p.hindiTitle}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleStartTest({
                              id: p.id as TestPresetId,
                              title: p.hindiTitle,
                              subtitle: p.formulaUsed,
                              startQ: p.startQ,
                              endQ: p.endQ,
                              durationMinutes: 40,
                              badge: p.badge,
                            })
                          }
                          className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black cursor-pointer transition flex items-center justify-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-white" /> 50 Q टेस्ट दें
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* RUNNING LIVE TEST */}
            {testPhase === 'running' && currentTestQ && (
              <div className="space-y-4">
                {/* Active Test Top Control Bar */}
                <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-black text-amber-400 uppercase">
                      LIVE TEST ACTIVE • {activePreset.title}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-300 mt-0.5">
                      हल किए गए: <strong className="text-emerald-400">{testScoreStats.attempted}</strong> /{' '}
                      {testQuestions.length} • शेष: {testQuestions.length - testScoreStats.attempted}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Timer Pill */}
                    <button
                      type="button"
                      onClick={() => setIsTimerPaused((p) => !p)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer"
                      title="टाइमर रोकें / चलाएँ"
                    >
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>{formatTimer(timeLeftSeconds)}</span>
                      <span className="text-[10px] text-slate-400">
                        {isTimerPaused ? '(Paused)' : ''}
                      </span>
                    </button>

                    {/* Instant Answer Check Mode Toggle */}
                    <button
                      type="button"
                      onClick={() => setInstantFeedbackMode((p) => !p)}
                      className={`px-3 py-2 rounded-xl text-xs font-black cursor-pointer transition ${
                        instantFeedbackMode
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {instantFeedbackMode ? '✓ तुरंत उत्तर व हल: ON' : 'तुरंत उत्तर व हल: OFF'}
                    </button>

                    {/* Card vs OMR Mode */}
                    <button
                      type="button"
                      onClick={() => setTestViewStyle((s) => (s === 'card' ? 'omr' : 'card'))}
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black cursor-pointer"
                    >
                      {testViewStyle === 'card' ? '📋 OMR शीट मोड' : '🃏 कार्ड मोड'}
                    </button>

                    {/* Submit Test Button */}
                    <button
                      type="button"
                      onClick={handleSubmitTest}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer shadow-md"
                    >
                      टेस्ट सबमिट करें (Submit)
                    </button>
                  </div>
                </div>

                {testViewStyle === 'card' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left 2 Columns: Active Question Card */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-5">
                      <div>
                        <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
                          <span className="px-3 py-1 rounded-xl bg-blue-600 text-white text-xs font-black">
                            प्रश्न {currentTestIdx + 1} / {testQuestions.length} (Bank #{currentTestQ.id})
                          </span>
                          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                            {currentTestQ.topic}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-xl font-extrabold text-slate-900 leading-relaxed mb-5">
                          {currentTestQ.question}
                        </h3>

                        <div className="space-y-3">
                          {currentTestQ.options.map((opt, oIdx) => {
                            const letter = ['A', 'B', 'C', 'D'][oIdx];
                            const chosen = testAnswers[currentTestQ.id];
                            const isSelected = chosen === oIdx;
                            const isCorrect = oIdx === currentTestQ.correctOptionIndex;

                            let cls =
                              'bg-slate-50 hover:bg-blue-50/60 border-slate-200 text-slate-800';
                            if (isSelected && !instantFeedbackMode) {
                              cls = 'bg-blue-50 border-blue-600 text-blue-950 ring-1 ring-blue-500';
                            } else if (instantFeedbackMode && chosen !== undefined) {
                              if (isCorrect) {
                                cls =
                                  'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-400';
                              } else if (isSelected && !isCorrect) {
                                cls = 'bg-rose-50 border-rose-500 text-rose-950';
                              }
                            }

                            return (
                              <button
                                key={letter}
                                type="button"
                                onClick={() =>
                                  setTestAnswers((prev) => ({
                                    ...prev,
                                    [currentTestQ.id]: oIdx,
                                  }))
                                }
                                className={`w-full text-left p-4 rounded-2xl border-2 transition flex items-center justify-between gap-3 cursor-pointer ${cls}`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="w-8 h-8 rounded-xl bg-white border border-slate-300 text-xs font-black flex items-center justify-center shrink-0">
                                    {letter}
                                  </span>
                                  <span className="text-sm sm:text-base font-bold">{opt}</span>
                                </div>
                                {instantFeedbackMode && chosen !== undefined && isCorrect && (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                )}
                                {instantFeedbackMode &&
                                  chosen !== undefined &&
                                  isSelected &&
                                  !isCorrect && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Instant Solved Explanation inside Live Test */}
                        {instantFeedbackMode && testAnswers[currentTestQ.id] !== undefined && (
                          <div className="mt-5 rounded-2xl bg-blue-50/90 border border-blue-200 p-4">
                            <div className="text-xs font-black text-emerald-800 mb-2">
                              ✓ सही विकल्प: ({currentTestQ.correctOption}) {currentTestQ.answerText}
                            </div>
                            <div className="space-y-1">
                              {currentTestQ.solvedSteps.map((st, idx) => (
                                <div key={idx} className="text-xs sm:text-sm font-bold text-slate-800">
                                  • {st}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Prev / Next Navigation */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          disabled={currentTestIdx <= 0}
                          onClick={() => setCurrentTestIdx((i) => Math.max(0, i - 1))}
                          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xs font-black text-slate-800 cursor-pointer flex items-center gap-1"
                        >
                          <ChevronLeft className="w-4 h-4" /> पिछला प्रश्न
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (currentTestIdx + 1 < testQuestions.length) {
                              setCurrentTestIdx((i) => i + 1);
                            } else {
                              handleSubmitTest();
                            }
                          }}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black cursor-pointer flex items-center gap-1"
                        >
                          <span>
                            {currentTestIdx + 1 < testQuestions.length
                              ? 'अगला प्रश्न'
                              : 'टेस्ट सबमिट करें'}
                          </span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Question Palette */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col max-h-[540px]">
                      <div className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
                        <span>प्रश्न पैलेट (Question Palette)</span>
                        <span className="text-blue-600">
                          {testScoreStats.attempted}/{testQuestions.length} हल
                        </span>
                      </div>
                      <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-1.5 overflow-y-auto pr-1">
                        {testQuestions.map((tq, idx) => {
                          const isCurr = idx === currentTestIdx;
                          const chosen = testAnswers[tq.id];
                          let btnCls = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                          if (chosen !== undefined) {
                            if (instantFeedbackMode) {
                              btnCls =
                                chosen === tq.correctOptionIndex
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-rose-600 text-white';
                            } else {
                              btnCls = 'bg-blue-600 text-white';
                            }
                          }
                          if (isCurr) {
                            btnCls += ' ring-2 ring-amber-400 font-black';
                          }
                          return (
                            <button
                              key={tq.id}
                              type="button"
                              onClick={() => setCurrentTestIdx(idx)}
                              className={`h-9 rounded-xl text-xs font-bold transition cursor-pointer ${btnCls}`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* DIGITAL OMR SHEET MODE */
                  <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-3">
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        📋 डिजिटल OMR शीट एवं प्रश्न सूची ({testQuestions.length} प्रश्न)
                      </h3>
                      <span className="text-xs font-bold text-slate-600">
                        गोले (A, B, C, D) को भरें — हल तुरंत नीचे दिखेगा
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
                      {testQuestions.map((tq, idx) => {
                        const chosen = testAnswers[tq.id];
                        return (
                          <div
                            key={tq.id}
                            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                                <span className="text-blue-600 mr-1.5">Q.{idx + 1} (#{tq.id}):</span>
                                {tq.question}
                              </div>

                              {/* 4 OMR Bubbles */}
                              <div className="flex items-center gap-2 shrink-0">
                                {(['A', 'B', 'C', 'D'] as const).map((letter, oIdx) => {
                                  const isSel = chosen === oIdx;
                                  const isCorr = oIdx === tq.correctOptionIndex;
                                  let bubble =
                                    'bg-white border-slate-300 text-slate-700 hover:border-blue-500';
                                  if (isSel) {
                                    bubble = instantFeedbackMode
                                      ? isCorr
                                        ? 'bg-emerald-600 border-emerald-600 text-white'
                                        : 'bg-rose-600 border-rose-600 text-white'
                                      : 'bg-blue-600 border-blue-600 text-white';
                                  }
                                  return (
                                    <button
                                      key={letter}
                                      type="button"
                                      onClick={() =>
                                        setTestAnswers((prev) => ({ ...prev, [tq.id]: oIdx }))
                                      }
                                      className={`w-9 h-9 rounded-full border-2 text-xs font-black transition cursor-pointer ${bubble}`}
                                      title={tq.options[oIdx]}
                                    >
                                      {letter}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold text-slate-700">
                              {tq.options.map((opt, oIdx) => (
                                <div key={oIdx} className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                                  ({['A', 'B', 'C', 'D'][oIdx]}) {opt}
                                </div>
                              ))}
                            </div>

                            {instantFeedbackMode && chosen !== undefined && (
                              <div className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                                <strong>सही उत्तर: ({tq.correctOption}) {tq.answerText}</strong> —{' '}
                                {tq.solvedSteps.join(' | ')}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TEST RESULT & SOLVED REVIEW */}
            {testPhase === 'result' && (
              <div className="space-y-5">
                <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-blue-900 to-purple-950 text-white p-6 sm:p-8 shadow-xl">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase">
                        🏆 TEST RESULT & SCORECARD
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black">{activePreset.title}</h2>
                      <p className="text-xs sm:text-sm text-indigo-200">
                        कुल समय: {formatTimer(timeSpentSeconds)} • सटीकता (Accuracy): {testScoreStats.accuracy}%
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleStartTest(activePreset)}
                        className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-4 h-4" /> पुनः टेस्ट दें (Retake)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTestPhase('select')}
                        className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-black cursor-pointer"
                      >
                        अन्य टेस्ट चुनें
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/15">
                      <div className="text-xs text-indigo-200 font-bold">कुल अंक (Score)</div>
                      <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">
                        {testScoreStats.correct} / {testScoreStats.total}
                      </div>
                    </div>
                    <div className="bg-emerald-500/20 rounded-2xl p-4 border border-emerald-400/30">
                      <div className="text-xs text-emerald-200 font-bold">सही उत्तर (Correct)</div>
                      <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1">
                        {testScoreStats.correct}
                      </div>
                    </div>
                    <div className="bg-rose-500/20 rounded-2xl p-4 border border-rose-400/30">
                      <div className="text-xs text-rose-200 font-bold">गलत उत्तर (Wrong)</div>
                      <div className="text-2xl sm:text-3xl font-black text-rose-300 mt-1">
                        {testScoreStats.wrong}
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/15">
                      <div className="text-xs text-indigo-200 font-bold">छोड़े गए (Skipped)</div>
                      <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                        {testScoreStats.skipped}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Solution Review */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      📝 संपूर्ण प्रश्नों का विकल्प एवं चरणबद्ध हल (Complete Solution Review)
                    </h3>
                    <div className="flex items-center gap-1.5">
                      {(['all', 'correct', 'wrong', 'skipped'] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setReviewFilter(f)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                            reviewFilter === f
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {f === 'all'
                            ? 'सभी'
                            : f === 'correct'
                            ? 'सही'
                            : f === 'wrong'
                            ? 'गलत'
                            : 'छोड़े गए'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {testQuestions
                      .filter((q) => {
                        const c = testAnswers[q.id];
                        if (reviewFilter === 'correct') return c === q.correctOptionIndex;
                        if (reviewFilter === 'wrong') return c !== undefined && c !== q.correctOptionIndex;
                        if (reviewFilter === 'skipped') return c === undefined;
                        return true;
                      })
                      .map((q, idx) => {
                        const userChoice = testAnswers[q.id];
                        const isCorr = userChoice === q.correctOptionIndex;
                        return (
                          <div
                            key={q.id}
                            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-xs font-black text-blue-700">
                                प्रश्न #{q.id} ({q.topic})
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                                  userChoice === undefined
                                    ? 'bg-slate-200 text-slate-700'
                                    : isCorr
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {userChoice === undefined
                                  ? 'Skipped'
                                  : isCorr
                                  ? '✓ सही उत्तर'
                                  : `✗ गलत (आपका उत्तर: ${['A', 'B', 'C', 'D'][userChoice]})`}
                              </span>
                            </div>
                            <div className="text-sm font-extrabold text-slate-900">{q.question}</div>
                            <div className="text-xs font-black text-emerald-700">
                              सही विकल्प: ({q.correctOption}) {q.answerText}
                            </div>
                            <div className="text-xs font-bold text-slate-700 bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                              {q.solvedSteps.map((s, si) => (
                                <div key={si}>• {s}</div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            MODE 3: COMPLETE 1 TO 500 ANSWER KEY TABLE
           ==================================================================== */}
        {activeMode === 'answerKey' && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {isCh03
                    ? '📋 कक्षा 10 गणित (अध्याय 3: दो चर वाले रैखिक समीकरण युग्म) — संपूर्ण 500 प्रश्नों की उत्तर तालिका (1–500)'
                    : '📋 कक्षा 10 गणित (अध्याय 2: बहुपद) — संपूर्ण 500 प्रश्नों की उत्तर तालिका (Answer Key 1–500)'}
                </h2>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  किसी भी प्रश्न संख्या पर क्लिक करके उसका पूरा प्रश्न और चरणबद्ध हल (Solved Answer) देखें:
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> प्रिंट उत्तर कुंजी
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
              {allQuestions.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setActiveMode('read');
                    setSelectedPartId('all');
                    setOnlyBookmarked(false);
                    setSearchQuery('');
                    setReadPage(Math.ceil(q.id / ITEMS_PER_PAGE));
                    setTimeout(() => {
                      const el = document.getElementById(`math02-q-${q.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-400 transition text-left cursor-pointer"
                  title={`${q.question} -> (${q.correctOption}) ${q.answerText}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-500">#{q.id}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-black">
                      {q.correctOption}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 truncate mt-1">
                    {q.answerText}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const MathCh03QuestionBank500Viewer: React.FC<Omit<MathCh02QuestionBank500ViewerProps, 'chapterNumber'>> = (
  props
) => <MathCh02QuestionBank500Viewer {...props} chapterNumber={3} />;

export default MathCh02QuestionBank500Viewer;
