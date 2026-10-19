import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ConfirmModal } from './common/ConfirmModal';
import {
  Clock,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Share2,
  BarChart2,
  Bookmark,
  Sparkles,
  HelpCircle,
  Flag,
  ListOrdered,
  X,
  Printer,
  Maximize2,
  Minimize2,
  Monitor,
  Smartphone,
  Tablet,
  Search,
  Check,
  Zap,
  SlidersHorizontal,
  User,
  ShieldCheck
} from 'lucide-react';
import {
  CLASS_10_PHYSICS_CH01_MARATHON_TEST,
  CLASS_10_PHYSICS_CH01_MARATHON_QUESTIONS,
} from '../data/class10PhysicsCh01Marathon300Data';
import { recordTestResult } from '../services/progressService';
import { useAuth } from '../context/AuthContext';
import { WatermarkWrapper } from './WatermarkWrapper';

interface PhysicsCh01MarathonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToNotes?: () => void;
}

export const PhysicsCh01MarathonModal: React.FC<PhysicsCh01MarathonModalProps> = ({
  isOpen,
  onClose,
  onNavigateToNotes,
}) => {
  const { user } = useAuth();
  const test = CLASS_10_PHYSICS_CH01_MARATHON_TEST;
  const questions = CLASS_10_PHYSICS_CH01_MARATHON_QUESTIONS;

  // Test Phases: 'intro' | 'active' | 'result'
  const [phase, setPhase] = useState<'intro' | 'active' | 'result'>('intro');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [bookmarked, setBookmarked] = useState<Record<number, boolean>>({});
  
  // Timer state (180 minutes = 10800 seconds)
  const initialSeconds = 180 * 60;
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'card' | 'omr'>('card');
  const [filterMode, setFilterMode] = useState<'all' | 'unanswered' | 'answered' | 'bookmarked'>('all');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect' | 'skipped'>('all');

  // True Full Desktop Site states - Enabled by default across all devices (Desktop, Android, iPad, iPhone)
  const [isDesktopSiteMode, setIsDesktopSiteMode] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState<boolean>(false);
  const [quickJumpVal, setQuickJumpVal] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load draft if available
  useEffect(() => {
    if (isOpen) {
      try {
        const savedDraft = localStorage.getItem('rk_physics_marathon_ch01_draft');
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed && typeof parsed.answers === 'object') {
            setUserAnswers(parsed.answers);
            if (parsed.timeLeft) setTimeLeft(parsed.timeLeft);
            if (parsed.timeSpent) setTimeSpent(parsed.timeSpent);
          }
        }
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (phase === 'active' && isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase, isTimerRunning, timeLeft]);

  // Autosave draft
  useEffect(() => {
    if (phase === 'active') {
      try {
        localStorage.setItem(
          'rk_physics_marathon_ch01_draft',
          JSON.stringify({
            answers: userAnswers,
            timeLeft,
            timeSpent,
            updatedAt: new Date().toISOString(),
          })
        );
      } catch {
        // ignore storage errors
      }
    }
  }, [userAnswers, timeLeft, timeSpent, phase]);

  // Desktop Keyboard Shortcuts (Arrow Left/Right, 1-4, A-D, B for Bookmark)
  useEffect(() => {
    if (!isOpen || phase !== 'active') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setCurrentIdx((prev) => Math.min(299, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setCurrentIdx((prev) => Math.max(0, prev - 1));
      } else if (e.key === '1' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (questions[currentIdx]) handleSelectOption(questions[currentIdx].order, 0);
      } else if (e.key === '2' || e.key === 'b' || e.key === 'B') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          if (questions[currentIdx]) handleSelectOption(questions[currentIdx].order, 1);
        }
      } else if (e.key === '3' || e.key === 'c' || e.key === 'C') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          if (questions[currentIdx]) handleSelectOption(questions[currentIdx].order, 2);
        }
      } else if (e.key === '4' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        if (questions[currentIdx]) handleSelectOption(questions[currentIdx].order, 3);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        if (questions[currentIdx]) handleToggleBookmark(questions[currentIdx].order);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, phase, currentIdx, questions]);

  // Format seconds to HH:MM:SS
  const formatTimer = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Start Test Action
  const handleStartTest = () => {
    setPhase('active');
    setIsTimerRunning(true);
    setCurrentIdx(0);
  };

  // Option selection
  const handleSelectOption = (questionOrder: number, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionOrder]: optionIndex,
    }));
  };

  // Clear answer
  const handleClearAnswer = (questionOrder: number) => {
    setUserAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionOrder];
      return copy;
    });
  };

  // Toggle Bookmark
  const handleToggleBookmark = (questionOrder: number) => {
    setBookmarked((prev) => ({
      ...prev,
      [questionOrder]: !prev[questionOrder],
    }));
  };

  // Jump by input
  const handleQuickJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(quickJumpVal, 10);
    if (!isNaN(target) && target >= 1 && target <= 300) {
      setCurrentIdx(target - 1);
      setViewMode('card');
      setIsMobilePaletteOpen(false);
      setQuickJumpVal('');
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Auto-submit when time expires
  const handleAutoSubmit = () => {
    setIsTimerRunning(false);
    calculateAndFinish();
  };

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Manual Submit confirmation
  const handleSubmitTest = () => {
    setShowSubmitConfirm(true);
  };

  const handleConfirmSubmit = () => {
    setShowSubmitConfirm(false);
    setIsTimerRunning(false);
    calculateAndFinish();
  };

  // Calculate results and store progress
  const calculateAndFinish = () => {
    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    questions.forEach((q) => {
      const chosen = userAnswers[q.order];
      if (chosen === undefined) {
        unattemptedCount++;
      } else if (chosen === q.correctOption) {
        score += 1;
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    const percentage = Math.round((score / 300) * 100);
    const isPassed = percentage >= 45;
    let division = '3rd Division';
    if (percentage >= 80) division = 'Top Rank Topper 🌟';
    else if (percentage >= 60) division = '1st Division (प्रथम श्रेणी)';
    else if (percentage >= 45) division = '2nd Division (द्वितीय श्रेणी)';

    const resultRecord = {
      id: `physics-marathon-300-${Date.now()}`,
      testId: 'class-10-physics-ch01-marathon-300',
      testTitle: 'कक्षा 10 भौतिकी अध्याय 01: 300 VVI अखंड महामैराथन लाइव टेस्ट (3 Hours)',
      subjectId: 'c10-sci',
      subjectName: 'भौतिकी (Physics)',
      chapterTitle: 'प्रकाश का परावर्तन (Reflection of Light)',
      classLevel: 'class-10' as const,
      studentId: user?.uid || 'guest-student',
      score,
      totalMarks: 300,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      unattempted: unattemptedCount,
      timeTakenMinutes: Math.round(timeSpent / 60) || 1,
      completedAt: new Date().toISOString(),
      studentAnswers: userAnswers,
      passed: isPassed,
      division,
      percentage,
    };

    recordTestResult(resultRecord);
    setPhase('result');
    localStorage.removeItem('rk_physics_marathon_ch01_draft');
  };

  // Reset test
  const handleResetTest = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmResetTest = () => {
    setUserAnswers({});
    setBookmarked({});
    setTimeLeft(initialSeconds);
    setTimeSpent(0);
    setPhase('intro');
    setIsTimerRunning(false);
    localStorage.removeItem('rk_physics_marathon_ch01_draft');
    setShowResetConfirm(false);
  };

  // Share score
  const handleShareResult = async (score: number, pct: number, div: string) => {
    const text = `🔥 मैंने RK STUDY CENTRE पर कक्षा 10 भौतिकी अध्याय 1 के "300 VVI अखंड महामैराथन टेस्ट (3 घंटे)" में 300 में से ${score} अंक (${pct}%) प्राप्त कर ${div} स्थान पाया! आप भी अपनी तैयारी परखें: https://ais-pre-rc6a3dh6aea5krtenpyoim-256353323201.asia-southeast1.run.app/#physics-marathon`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'RK Study Centre Physics Marathon', text });
        return;
      } catch {}
    }
    navigator.clipboard?.writeText?.(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  // Calculated results memo
  const calculatedResult = useMemo(() => {
    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    questions.forEach((q) => {
      const chosen = userAnswers[q.order];
      if (chosen === undefined) unattemptedCount++;
      else if (chosen === q.correctOption) {
        score++;
        correctCount++;
      } else incorrectCount++;
    });

    const percentage = Math.round((score / 300) * 100);
    const isPassed = percentage >= 45;
    let division = '3rd Division';
    if (percentage >= 80) division = 'Top Rank Topper 🌟';
    else if (percentage >= 60) division = '1st Division (प्रथम श्रेणी)';
    else if (percentage >= 45) division = '2nd Division (द्वितीय श्रेणी)';

    return {
      totalScore: score,
      correctCount,
      incorrectCount,
      unattemptedCount,
      percentage,
      isPassed,
      division,
      timeTaken: Math.round(timeSpent / 60) || 1,
    };
  }, [questions, userAnswers, timeSpent]);

  // Current Question
  const currentQ = questions[currentIdx];

  // Filtered Question Grid
  const filteredIndices = useMemo(() => {
    return questions
      .map((q, idx) => ({ q, idx }))
      .filter(({ q }) => {
        if (filterMode === 'all') return true;
        if (filterMode === 'answered') return userAnswers[q.order] !== undefined;
        if (filterMode === 'unanswered') return userAnswers[q.order] === undefined;
        if (filterMode === 'bookmarked') return Boolean(bookmarked[q.order]);
        return true;
      })
      .map((item) => item.idx);
  }, [questions, userAnswers, bookmarked, filterMode]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 w-full h-full min-h-[100dvh] max-w-none max-h-none p-0 m-0 rounded-none border-0 overflow-hidden bg-slate-950 flex flex-col font-sans select-none"
    >
      {/* Dynamic Shell: 100% Edge-to-Edge Desktop Web Application */}
      <div className="relative w-full h-full flex flex-col bg-slate-100 overflow-hidden">
        
        {/* ======================================================== */}
        {/* OFFICIAL CBT DESKTOP EXAM HEADER (Edge-to-Edge) */}
        {/* ======================================================== */}
        <header className="px-3 sm:px-6 py-2.5 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 text-white flex items-center justify-between shadow-lg shrink-0 z-30 border-b border-indigo-900/60">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg sm:text-xl shadow-md shrink-0">
              ⚡
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  BSEB CBT PORTAL
                </span>
                <span className="text-[11px] sm:text-xs text-blue-200 font-bold truncate hidden xs:inline">
                  बिहार विद्यालय परीक्षा समिति • 100% Full Desktop Site
                </span>
              </div>
              <h1 className="text-xs sm:text-base font-black text-white tracking-tight truncate max-w-[200px] xs:max-w-xs sm:max-w-xl">
                कक्षा 10 भौतिकी अध्याय 1: 300 VVI अखंड महामैराथन (3 घंटे)
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Live Countdown Timer */}
            {phase === 'active' && (
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs sm:text-base shadow-md border-2 border-amber-300">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 animate-pulse" />
                <span className="font-mono tracking-wider">{formatTimer(timeLeft)}</span>
              </div>
            )}

            {/* Desktop Site Mode Indicator / Toggle */}
            <button
              type="button"
              onClick={() => setIsDesktopSiteMode(!isDesktopSiteMode)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                isDesktopSiteMode
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-300/40'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
              title="फुल डेस्कटॉप साइट मोड: Android, iPad, iPhone, एवं Desktop पर सक्रिय"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isDesktopSiteMode ? '🖥️ Full Desktop Site: सक्रिय' : '📱 Mobile Layout'}</span>
              <span className="sm:hidden">{isDesktopSiteMode ? '🖥️ Desktop' : '📱 Mobile'}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden sm:flex w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-colors cursor-pointer"
              title={isFullscreen ? 'सामान्य दृश्य (Exit Fullscreen)' : 'फुलस्क्रीन परीक्षा हॉल मोड (Fullscreen)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Modal */}
            <button
              type="button"
              onClick={() => {
                if (phase === 'active') {
                  setShowExitConfirm(true);
                } else {
                  onClose();
                }
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
              title="बंद करें (Exit Exam)"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </header>

        {/* ======================================================== */}
        {/* DESKTOP STATUS & CANDIDATE STRIP */}
        {/* ======================================================== */}
        {phase === 'active' && (
          <div className="bg-slate-800 text-slate-200 px-4 sm:px-6 py-1.5 border-b border-slate-700 text-xs flex items-center justify-between flex-wrap gap-2 shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-bold flex items-center gap-1.5 text-slate-300">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>परीक्षार्थी:</span>
                <strong className="text-white font-black">{user?.displayName || 'कक्षा 10वीं विद्यार्थी (BSEB)'}</strong>
              </span>
              <span className="text-slate-500">|</span>
              <span className="font-semibold text-slate-300">
                विषय: <strong className="text-blue-300">भौतिक विज्ञान (प्रकाश का परावर्तन)</strong>
              </span>
            </div>

            <div className="flex items-center gap-4 text-2xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>हल किए: <strong>{Object.keys(userAnswers).length}</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>शेष: <strong>{300 - Object.keys(userAnswers).length}</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>चिह्नित: <strong>{Object.values(bookmarked).filter(Boolean).length}</strong></span>
              </span>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CONTENT WORKSPACE */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          
          {/* ======================================================== */}
          {/* PHASE 1: INTRO / INSTRUCTIONS (FULL DESKTOP VIEW) */}
          {/* ======================================================== */}
          {phase === 'intro' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 flex flex-col justify-center items-center bg-slate-100">
              <div className="w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-blue-700 via-indigo-800 to-amber-500 text-white flex items-center justify-center text-4xl shadow-xl border-4 border-white">
                  ⚡
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-black uppercase border border-blue-200">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <span>बिहार बोर्ड मैट्रिक परीक्षा 2016-2026 स्पेशल • अखंड महामैराथन</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    कक्षा 10 भौतिकी अध्याय 1: प्रकाश का परावर्तन
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto">
                    संपूर्ण 300 VVI वस्तुनिष्ठ प्रश्नों का लाइव ऑनलाइन टेस्ट (3 घंटे / 180 मिनट)। रियल-टाइम टाइमर, डिजिटल OMR बबल शीट और संपूर्ण व्याख्या!
                  </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-2xs text-slate-500 font-bold uppercase">कुल प्रश्न</div>
                    <div className="text-2xl font-black text-blue-700">300 MCQs</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-2xs text-slate-500 font-bold uppercase">कुल समय</div>
                    <div className="text-2xl font-black text-indigo-700">3 Hours</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-2xs text-slate-500 font-bold uppercase">पूर्णांक (Marks)</div>
                    <div className="text-2xl font-black text-emerald-700">300 अंक</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-2xs text-slate-500 font-bold uppercase">नेगेटिव मार्किंग</div>
                    <div className="text-2xl font-black text-purple-700">नहीं (0.0)</div>
                  </div>
                </div>

                {/* Instructions Box */}
                <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-200 text-left space-y-2.5 text-xs sm:text-sm text-amber-950 font-medium">
                  <div className="font-black text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>परीक्षार्थियों के लिए महत्वपूर्ण नियम एवं निर्देश:</span>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside text-xs leading-relaxed text-amber-900">
                    <li>यह टेस्ट <strong>100% Full Desktop Site</strong>, Android Phone, iPad, एवं iPhone पर रियल-टाइम चलता है।</li>
                    <li>प्रत्येक सही उत्तर के लिए 1 अंक निर्धारित है। कोई ऋणात्मक अंकन (Negative Marking) नहीं है।</li>
                    <li>आप किसी भी समय <strong>OMR ग्रिड मोड</strong> में स्विच करके सीधे ओएमआर बबल भर सकते हैं।</li>
                    <li>टेस्ट सबमिट होते ही आपकी रैंक, कुल प्राप्तांक और 300 प्रश्नों की आधिकारिक व्याख्यात्मक उत्तरमाला उपलब्ध होगी।</li>
                  </ul>
                </div>

                {/* Device Compatibility / Full Desktop Site Callout */}
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 text-xs font-bold flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>यह टेस्ट फुल डेस्कटॉप साइट (Full Desktop Site) मोड में पूरी स्क्रीन पर स्वतः लोड होता है।</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-blue-300 text-blue-900 text-[10px] font-black">
                      🖥️ Desktop PC
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-blue-300 text-blue-900 text-[10px] font-black">
                      📱 Android
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-blue-300 text-blue-900 text-[10px] font-black">
                      📱 iPad / Tablet
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-blue-300 text-blue-900 text-[10px] font-black">
                      🍏 iPhone
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleStartTest}
                    className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-600 hover:from-blue-600 hover:to-amber-500 text-white font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-white/40"
                  >
                    <span>🔥 अखंड टेस्ट शुरू करें (3 घंटे)</span>
                    <ChevronRight className="w-5 h-5 stroke-[3]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('omr');
                      handleStartTest();
                    }}
                    className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ListOrdered className="w-4 h-4 text-amber-400" />
                    <span>🎯 डिजिटल OMR शीट मोड में शुरू करें</span>
                  </button>
                  {onNavigateToNotes && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToNotes();
                      }}
                      className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                      <BookOpen className="w-4 h-4 text-blue-700" />
                      <span>पहले चैप्टर नोट्स पढ़ें</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PHASE 2: ACTIVE TEST (FULL DESKTOP 2-COLUMN CBT LAYOUT) */}
          {/* ======================================================== */}
          {phase === 'active' && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative w-full h-full">
              
              {/* LEFT COLUMN: QUESTION CARD / OMR AREA (70% on Desktop / iPad) */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-7 flex flex-col justify-between space-y-4 bg-slate-50 min-w-0">
                
                {/* Top Question Strip */}
                <div className="flex items-center justify-between gap-2.5 border-b border-slate-200 pb-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3.5 py-1.5 rounded-xl bg-blue-700 text-white font-black text-sm shadow-xs">
                      प्रश्न {currentQ.order} / 300
                    </span>
                    <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                      विषय: {(currentQ as any).topic || 'प्रकाश का परावर्तन'}
                    </span>
                    {/* Mobile 300 Palette Trigger Pill */}
                    <button
                      type="button"
                      onClick={() => setIsMobilePaletteOpen(true)}
                      className="md:hidden px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 border border-slate-700"
                    >
                      <ListOrdered className="w-3.5 h-3.5 text-amber-400" />
                      <span>300 ग्रिड ({Object.keys(userAnswers).length}/300)</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewMode(viewMode === 'card' ? 'omr' : 'card')}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-black hover:bg-slate-50 shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ListOrdered className="w-4 h-4 text-blue-600" />
                      <span>{viewMode === 'card' ? 'OMR शीट मोड देखें' : 'कार्ड व्यू (1 प्रश्न)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(currentQ.order)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                        bookmarked[currentQ.order]
                          ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${bookmarked[currentQ.order] ? 'fill-amber-600 text-amber-600' : ''}`} />
                      <span>{bookmarked[currentQ.order] ? 'चिह्नित है' : 'चिह्नित करें (Flag)'}</span>
                    </button>
                  </div>
                </div>

                {/* VIEW 1: SINGLE QUESTION CARD */}
                {viewMode === 'card' && currentQ && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6 max-w-5xl w-full mx-auto my-auto">
                    
                    {/* Question Statement */}
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 leading-relaxed">
                      <span className="text-blue-700 font-black mr-2">Q{currentQ.order}.</span>
                      {currentQ.question}
                    </div>

                    {/* Options (A, B, C, D) */}
                    <div className="grid grid-cols-1 gap-3 pt-2">
                      {currentQ.options.map((opt, optIdx) => {
                        const letter = ['A', 'B', 'C', 'D'][optIdx];
                        const isSelected = userAnswers[currentQ.order] === optIdx;

                        return (
                          <button
                            key={letter}
                            type="button"
                            onClick={() => handleSelectOption(currentQ.order, optIdx)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left flex items-center gap-4 text-base sm:text-lg min-h-[58px] active:scale-[0.99] ${
                              isSelected
                                ? 'bg-blue-50 border-blue-600 text-blue-950 font-bold shadow-md ring-2 ring-blue-400/20'
                                : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-800'
                            }`}
                          >
                            <span
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-blue-700 text-white shadow-xs'
                                  : 'bg-white border-2 border-slate-300 text-slate-700'
                              }`}
                            >
                              {letter}
                            </span>
                            <span className="grow font-medium leading-relaxed">{opt}</span>
                            {isSelected && (
                              <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Desktop & Mobile Bottom CBT Action Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-slate-100">
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                        <button
                          type="button"
                          disabled={userAnswers[currentQ.order] === undefined}
                          onClick={() => handleClearAnswer(currentQ.order)}
                          className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-500 hover:text-rose-600 disabled:opacity-30 cursor-pointer transition-colors"
                        >
                          उत्तर हटाएं (Clear)
                        </button>

                        {/* Mobile Quick Action for 300 Palette */}
                        <button
                          type="button"
                          onClick={() => setIsMobilePaletteOpen(true)}
                          className="md:hidden px-3.5 py-2 rounded-xl text-xs font-black bg-slate-900 text-white flex items-center gap-1.5 shadow-sm active:scale-95"
                        >
                          <ListOrdered className="w-3.5 h-3.5 text-amber-400" />
                          <span>300 पैलेट ({Object.keys(userAnswers).length}/300)</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          disabled={currentIdx === 0}
                          onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                          className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 font-bold text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>पिछला</span>
                        </button>
                        <button
                          type="button"
                          disabled={currentIdx === 299}
                          onClick={() => setCurrentIdx((prev) => Math.min(299, prev + 1))}
                          className="flex-1 sm:flex-initial px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white font-black text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 shadow-md transition-colors"
                        >
                          <span>अगला (Save & Next)</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIEW 2: FULL DIGITAL OMR BUBBLE GRID MODE */}
                {viewMode === 'omr' && (
                  <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4 max-w-6xl w-full mx-auto">
                    <div className="flex items-center justify-between border-b pb-3 flex-wrap gap-2">
                      <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <span>🎯 डिजिटल OMR शीट (प्रश्न 1 से 300 तक संपूर्ण)</span>
                      </h4>
                      <span className="text-xs text-slate-500 font-bold">
                        A, B, C, D बबल पर क्लिक करके उत्तर भरें • प्रश्न देखने के लिए क्रमांक पर क्लिक करें
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[64vh] overflow-y-auto pr-2">
                      {questions.map((q, idx) => {
                        const isAnswered = userAnswers[q.order] !== undefined;
                        const isCurrent = currentIdx === idx;
                        const selectedOpt = userAnswers[q.order];

                        return (
                          <div
                            key={q.order}
                            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                              isCurrent
                                ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300'
                                : isAnswered
                                ? 'bg-emerald-50/70 border-emerald-300'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentIdx(idx);
                                setViewMode('card');
                              }}
                              className="font-black text-slate-800 hover:text-blue-700 cursor-pointer flex items-center gap-1"
                            >
                              <span>Q.{q.order}</span>
                              {bookmarked[q.order] && <Bookmark className="w-3 h-3 fill-amber-500 text-amber-500" />}
                            </button>

                            <div className="flex items-center gap-1">
                              {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                                const isSelected = selectedOpt === optIdx;
                                return (
                                  <button
                                    key={letter}
                                    type="button"
                                    onClick={() => handleSelectOption(q.order, optIdx)}
                                    className={`w-6 h-6 rounded-full border text-[10px] font-black flex items-center justify-center transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-blue-700 text-white border-blue-700 ring-2 ring-blue-300'
                                        : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                                    }`}
                                  >
                                    {letter}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: 300 QUESTIONS PALETTE SIDEBAR (Desktop & iPad Dual-Column) */}
              <aside className="hidden md:flex w-72 lg:w-80 xl:w-96 bg-white border-l border-slate-200 p-4 lg:p-5 flex-col shrink-0 space-y-3.5 overflow-hidden shadow-sm">
                
                {/* Palette Title & Progress */}
                <div className="space-y-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-800 uppercase tracking-wider">
                      300 प्रश्न पैलेट (Status Matrix)
                    </span>
                    <span className="text-2xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {Math.round((Object.keys(userAnswers).length / 300) * 100)}% पूर्ण
                    </span>
                  </div>

                  {/* Quick Jump Search Box */}
                  <form onSubmit={handleQuickJumpSubmit} className="flex items-center gap-2">
                    <div className="relative grow">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="1"
                        max="300"
                        value={quickJumpVal}
                        onChange={(e) => setQuickJumpVal(e.target.value)}
                        placeholder="प्रश्न संख्या (1-300)..."
                        className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-black cursor-pointer hover:bg-slate-800"
                    >
                      जाएं
                    </button>
                  </form>

                  {/* Filter tabs */}
                  <div className="grid grid-cols-2 gap-1 text-2xs font-bold">
                    <button
                      type="button"
                      onClick={() => setFilterMode('all')}
                      className={`p-1.5 rounded-lg text-center cursor-pointer transition-colors ${
                        filterMode === 'all' ? 'bg-slate-900 text-white font-black' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      सभी (300)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode('answered')}
                      className={`p-1.5 rounded-lg text-center cursor-pointer transition-colors ${
                        filterMode === 'answered' ? 'bg-emerald-600 text-white font-black' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      हल किए ({Object.keys(userAnswers).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode('unanswered')}
                      className={`p-1.5 rounded-lg text-center cursor-pointer transition-colors ${
                        filterMode === 'unanswered' ? 'bg-slate-500 text-white font-black' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      शेष ({300 - Object.keys(userAnswers).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode('bookmarked')}
                      className={`p-1.5 rounded-lg text-center cursor-pointer transition-colors ${
                        filterMode === 'bookmarked' ? 'bg-amber-500 text-white font-black' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      चिह्नित ({Object.values(bookmarked).filter(Boolean).length})
                    </button>
                  </div>
                </div>

                {/* 300 Numbers Matrix */}
                <div className="flex-1 overflow-y-auto pr-1">
                  <div className="grid grid-cols-6 gap-1.5">
                    {filteredIndices.map((idx) => {
                      const qNum = idx + 1;
                      const isAnswered = userAnswers[qNum] !== undefined;
                      const isBookmarked = Boolean(bookmarked[qNum]);
                      const isCurrent = currentIdx === idx && viewMode === 'card';

                      let btnStyle = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
                      if (isAnswered) {
                        btnStyle = 'bg-emerald-600 text-white font-black border-emerald-700 shadow-xs';
                      }
                      if (isBookmarked) {
                        btnStyle = 'bg-amber-400 text-slate-950 font-black border-amber-500';
                      }
                      if (isCurrent) {
                        btnStyle = 'ring-2 ring-blue-700 ring-offset-1 font-black';
                      }

                      return (
                        <button
                          key={qNum}
                          type="button"
                          onClick={() => {
                            setCurrentIdx(idx);
                            setViewMode('card');
                          }}
                          className={`h-8 rounded-lg text-xs font-bold border transition-all flex items-center justify-center cursor-pointer ${btnStyle}`}
                        >
                          {qNum}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Final Submit Button */}
                <div className="pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleSubmitTest}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-emerald-400/50"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>महामैराथन सबमिट करें</span>
                  </button>
                </div>
              </aside>
            </div>
          )}

          {/* ======================================================== */}
          {/* MOBILE & TABLET SLIDE-UP 300 QUESTIONS PALETTE DRAWER */}
          {/* ======================================================== */}
          {phase === 'active' && isMobilePaletteOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in duration-200">
              <div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border-t-2 border-slate-300">
                {/* Drawer Header */}
                <div className="px-5 py-3.5 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 text-white flex items-center justify-between border-b border-indigo-900">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm">
                      300
                    </span>
                    <div>
                      <h4 className="font-black text-sm text-white">300 प्रश्न पैलेट (CBT Matrix)</h4>
                      <p className="text-[11px] text-blue-200 font-semibold">
                        हल किए: <strong className="text-emerald-400">{Object.keys(userAnswers).length}</strong> / 300 • शेष: <strong className="text-white">{300 - Object.keys(userAnswers).length}</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobilePaletteOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Jump & Filter Tabs inside Mobile Drawer */}
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-2.5">
                  <form onSubmit={handleQuickJumpSubmit} className="flex items-center gap-2">
                    <div className="relative grow">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="1"
                        max="300"
                        value={quickJumpVal}
                        onChange={(e) => setQuickJumpVal(e.target.value)}
                        placeholder="प्रश्न संख्या (1-300)..."
                        className="w-full pl-8 pr-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-black cursor-pointer"
                    >
                      जाएं
                    </button>
                  </form>

                  <div className="grid grid-cols-4 gap-1 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setFilterMode('all')}
                      className={`p-1.5 rounded-lg text-center cursor-pointer transition-colors ${
                        filterMode === 'all' ? 'bg-slate-900 text-white font-black' : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      सभी (300)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode('answered')}
                      className={`p-1.5 rounded-lg text-center cursor-pointer transition-colors ${
                        filterMode === 'answered' ? 'bg-emerald-600 text-white font-black' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      हल ({Object.keys(userAnswers).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode('unanswered')}
                      className={`p-1.5 rounded-lg text-center cursor-pointer transition-colors ${
                        filterMode === 'unanswered' ? 'bg-slate-600 text-white font-black' : 'bg-white border border-slate-200 text-slate-600'
                      }`}
                    >
                      शेष ({300 - Object.keys(userAnswers).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode('bookmarked')}
                      className={`p-1.5 rounded-lg text-center cursor-pointer transition-colors ${
                        filterMode === 'bookmarked' ? 'bg-amber-500 text-white font-black' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      चिह्नित ({Object.values(bookmarked).filter(Boolean).length})
                    </button>
                  </div>
                </div>

                {/* 300 Grid Numbers */}
                <div className="p-3.5 overflow-y-auto max-h-[46vh] grow">
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                    {filteredIndices.map((idx) => {
                      const qNum = idx + 1;
                      const isAnswered = userAnswers[qNum] !== undefined;
                      const isBookmarked = Boolean(bookmarked[qNum]);
                      const isCurrent = currentIdx === idx && viewMode === 'card';

                      let btnStyle = 'bg-slate-100 text-slate-700 border-slate-200';
                      if (isAnswered) {
                        btnStyle = 'bg-emerald-600 text-white font-black border-emerald-700 shadow-xs';
                      }
                      if (isBookmarked) {
                        btnStyle = 'bg-amber-400 text-slate-950 font-black border-amber-500';
                      }
                      if (isCurrent) {
                        btnStyle = 'ring-2 ring-blue-700 ring-offset-1 font-black';
                      }

                      return (
                        <button
                          key={qNum}
                          type="button"
                          onClick={() => {
                            setCurrentIdx(idx);
                            setViewMode('card');
                            setIsMobilePaletteOpen(false);
                          }}
                          className={`h-9 rounded-xl text-xs font-bold border transition-all flex items-center justify-center cursor-pointer ${btnStyle}`}
                        >
                          {qNum}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit button in drawer */}
                <div className="p-3.5 bg-slate-50 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobilePaletteOpen(false);
                      handleSubmitTest();
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>अखंड टेस्ट सबमिट करें</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PHASE 3: RESULT & SCORECARD (FULL DESKTOP VIEW) */}
          {/* ======================================================== */}
          {phase === 'result' && (
            <WatermarkWrapper className="p-4 sm:p-8 lg:p-12 flex-1 overflow-y-auto space-y-8 bg-slate-100">
              <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Full Desktop Result Banner */}
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden text-center space-y-5 border border-indigo-900">
                  <div className="absolute top-0 right-0 p-8 opacity-10 font-black text-9xl pointer-events-none">
                    300
                  </div>

                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-black uppercase">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>आधिकारिक स्कोरकार्ड • बिहार विद्यालय परीक्षा समिति 2026-27</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-white">
                    {calculatedResult.isPassed ? 'शानदार प्रदर्शन! 🌟 Topper Division' : 'सराहनीय प्रयास! 🎯'}
                  </h2>

                  <div className="flex items-center justify-center gap-2">
                    <span className="px-5 py-2 rounded-full bg-amber-400 text-slate-950 text-base font-black shadow-md">
                      {calculatedResult.division}
                    </span>
                  </div>

                  {/* Big Score Box */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 max-w-3xl mx-auto">
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                      <div className="text-xs uppercase font-bold text-slate-300">प्राप्तांक (Score)</div>
                      <div className="text-2xl sm:text-4xl font-black text-amber-400 mt-1">
                        {calculatedResult.totalScore} <span className="text-sm text-white/70">/ 300</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                      <div className="text-xs uppercase font-bold text-slate-300">प्रतिशत (Percentage)</div>
                      <div className="text-2xl sm:text-4xl font-black text-emerald-400 mt-1">
                        {calculatedResult.percentage}%
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                      <div className="text-xs uppercase font-bold text-slate-300">सही उत्तर (Correct)</div>
                      <div className="text-2xl sm:text-4xl font-black text-emerald-300 mt-1">
                        {calculatedResult.correctCount}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                      <div className="text-xs uppercase font-bold text-slate-300">गलत / छूटे (Mistakes)</div>
                      <div className="text-2xl sm:text-4xl font-black text-rose-400 mt-1">
                        {calculatedResult.incorrectCount + calculatedResult.unattemptedCount}
                      </div>
                    </div>
                  </div>

                  {/* Actions inside result */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => handleShareResult(calculatedResult.totalScore, calculatedResult.percentage, calculatedResult.division)}
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all cursor-pointer flex items-center gap-2 shadow-md"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{copySuccess ? 'लिंक कॉपी हो गया! ✓' : 'स्कोर शेयर करें'}</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      <span>प्रिंट / A4 PDF सहेजें</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetTest}
                      className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all cursor-pointer flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4 text-amber-300" />
                      <span>पुनः नए सिरे से टेस्ट दें</span>
                    </button>

                    {onNavigateToNotes && (
                      <button
                        type="button"
                        onClick={onNavigateToNotes}
                        className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition-all cursor-pointer flex items-center gap-2 shadow-md"
                      >
                        <BookOpen className="w-4 h-4 text-slate-950" />
                        <span>भौतिकी अध्याय 1 नोट्स पढ़ें</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* DETAILED ANSWER REVIEW & EXPLANATIONS */}
                <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-md border border-slate-200 space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">
                        📋 300 प्रश्नों का संपूर्ण उत्तर एवं विस्तृत व्याख्या
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        प्रत्येक प्रश्न के साथ उसका सही उत्तर, आपकी प्रतिक्रिया व NCERT/बोर्ड संदर्भ देखें।
                      </p>
                    </div>

                    {/* Filter buttons for review */}
                    <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold flex-wrap">
                      <button
                        type="button"
                        onClick={() => setReviewFilter('all')}
                        className={`px-4 py-2 rounded-xl cursor-pointer ${
                          reviewFilter === 'all' ? 'bg-white text-blue-700 shadow-xs font-black' : 'text-slate-600'
                        }`}
                      >
                        सभी (300)
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewFilter('incorrect')}
                        className={`px-4 py-2 rounded-xl cursor-pointer ${
                          reviewFilter === 'incorrect' ? 'bg-rose-600 text-white font-black' : 'text-rose-700'
                        }`}
                      >
                        गलत ({calculatedResult.incorrectCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewFilter('correct')}
                        className={`px-4 py-2 rounded-xl cursor-pointer ${
                          reviewFilter === 'correct' ? 'bg-emerald-600 text-white font-black' : 'text-emerald-700'
                        }`}
                      >
                        सही ({calculatedResult.correctCount})
                      </button>
                    </div>
                  </div>

                  {/* Review Questions Grid */}
                  <div className="space-y-4">
                    {questions
                      .filter((q) => {
                        const chosen = userAnswers[q.order];
                        const isCorrect = chosen === q.correctOption;
                        const isSkipped = chosen === undefined;

                        if (reviewFilter === 'correct') return isCorrect;
                        if (reviewFilter === 'incorrect') return !isCorrect && !isSkipped;
                        if (reviewFilter === 'skipped') return isSkipped;
                        return true;
                      })
                      .map((q) => {
                        const chosen = userAnswers[q.order];
                        const isCorrect = chosen === q.correctOption;
                        const isSkipped = chosen === undefined;

                        return (
                          <div
                            key={q.id}
                            className={`p-5 rounded-2xl border space-y-3 ${
                              isCorrect
                                ? 'bg-emerald-50/40 border-emerald-200'
                                : isSkipped
                                ? 'bg-slate-50 border-slate-200'
                                : 'bg-rose-50/40 border-rose-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="font-bold text-base text-slate-900 leading-relaxed">
                                <span className="font-black text-blue-700 mr-2">Q{q.order}.</span>
                                {q.question}
                              </div>

                              <span
                                className={`px-3 py-1 rounded-full text-xs font-black shrink-0 ${
                                  isCorrect
                                    ? 'bg-emerald-200 text-emerald-900'
                                    : isSkipped
                                    ? 'bg-slate-200 text-slate-800'
                                    : 'bg-rose-200 text-rose-900'
                                }`}
                              >
                                {isCorrect ? 'सही (+1)' : isSkipped ? 'छोड़ा गया (0)' : 'गलत (0)'}
                              </span>
                            </div>

                            {/* Options Breakdown */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                              {q.options.map((opt, optIdx) => {
                                const letter = ['A', 'B', 'C', 'D'][optIdx];
                                const isRightOpt = optIdx === q.correctOption;
                                const isChosenOpt = optIdx === chosen;

                                let optStyle = 'bg-white border-slate-200 text-slate-700';
                                if (isRightOpt) {
                                  optStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                                } else if (isChosenOpt && !isRightOpt) {
                                  optStyle = 'bg-rose-100 border-rose-400 text-rose-950 line-through';
                                }

                                return (
                                  <div
                                    key={letter}
                                    className={`p-3 rounded-xl border flex items-center gap-2.5 ${optStyle}`}
                                  >
                                    <span className="font-black text-2xs w-6 h-6 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                                      {letter}
                                    </span>
                                    <span className="grow text-xs sm:text-sm">{opt}</span>
                                    {isRightOpt && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                                    {isChosenOpt && !isRightOpt && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Explanation Box */}
                            {q.explanation && (
                              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-medium flex items-start gap-2">
                                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="font-bold text-amber-900">विस्तृत व्याख्या: </strong>
                                  <span>{q.explanation}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </WatermarkWrapper>
          )}

        </div>
      </div>

      {/* Confirm Submit Modal */}
      <ConfirmModal
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={handleConfirmSubmit}
        title="300 VVI महामैराथन टेस्ट सबमिट करें"
        message={`क्या आप टेस्ट सबमिट करना चाहते हैं? हल किए गए प्रश्न: ${Object.keys(userAnswers).length}/300। सबमिट करने के बाद परिणाम व ऑल-बिहार रैंकिंग प्रदर्शित होगी।`}
        confirmText="हाँ, सबमिट करें (Submit)"
        cancelText="अभी जारी रखें"
        variant="primary"
      />

      {/* Confirm Reset Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleConfirmResetTest}
        title="टेस्ट रीसेट करें (Reset Test)"
        message="क्या आप पुनः नए सिरे से टेस्ट शुरू करना चाहते हैं? आपकी वर्तमान प्रगति रीसेट हो जाएगी।"
        confirmText="हाँ, रीसेट करें"
        cancelText="रद्द करें"
        variant="warning"
      />

      {/* Confirm Exit Modal */}
      <ConfirmModal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={() => {
          setShowExitConfirm(false);
          onClose();
        }}
        title="परीक्षा कक्ष से बाहर निकलें (Exit Exam)"
        message="क्या आप सच में टेस्ट से बाहर निकलना चाहते हैं? आपकी प्रगति स्थानीय ड्राफ्ट में सुरक्षित रहेगी।"
        confirmText="हाँ, बाहर निकलें (Exit)"
        cancelText="परीक्षा जारी रखें"
        variant="danger"
      />
    </div>
  );
};
