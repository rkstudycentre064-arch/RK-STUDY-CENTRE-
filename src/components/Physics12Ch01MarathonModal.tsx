import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  CLASS_12_PHYSICS_CH01_MARATHON_TEST,
  CLASS_12_PHYSICS_CH01_MARATHON_QUESTIONS,
} from '../data/class12PhysicsCh01Marathon300Data';
import { recordTestResult } from '../services/progressService';
import { useAuth } from '../context/AuthContext';
import { WatermarkWrapper } from './WatermarkWrapper';

interface Physics12Ch01MarathonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToNotes?: () => void;
}

export const Physics12Ch01MarathonModal: React.FC<Physics12Ch01MarathonModalProps> = ({
  isOpen,
  onClose,
  onNavigateToNotes,
}) => {
  const { user } = useAuth();
  const test = CLASS_12_PHYSICS_CH01_MARATHON_TEST;
  const questions = CLASS_12_PHYSICS_CH01_MARATHON_QUESTIONS;

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
  const [filterMode, setFilterMode] = useState<'all' | 'unanswered' | 'answered' | 'bookmarked'>('all');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect' | 'skipped'>('all');

  // True Full Desktop Site states - Enabled by default across all devices
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
        const savedDraft = localStorage.getItem('rk_physics12_marathon_ch01_draft');
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
    if (isTimerRunning && phase === 'active') {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, phase]);

  // Draft autosave during test
  useEffect(() => {
    if (phase === 'active' && Object.keys(userAnswers).length > 0) {
      try {
        localStorage.setItem(
          'rk_physics12_marathon_ch01_draft',
          JSON.stringify({
            answers: userAnswers,
            timeLeft,
            timeSpent,
            updatedAt: new Date().toISOString(),
          })
        );
      } catch {
        // ignore
      }
    }
  }, [userAnswers, timeLeft, timeSpent, phase]);

  const handleStartTest = () => {
    setPhase('active');
    setIsTimerRunning(true);
  };

  const handleSelectOption = (questionIndex: number, optionIdx: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIdx,
    }));
  };

  const handleClearOption = (questionIndex: number) => {
    setUserAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionIndex];
      return copy;
    });
  };

  const handleToggleBookmark = (questionIndex: number) => {
    setBookmarked((prev) => ({
      ...prev,
      [questionIndex]: !prev[questionIndex],
    }));
  };

  const handleSubmitTest = () => {
    setIsTimerRunning(false);
    setPhase('result');
    try {
      localStorage.removeItem('rk_physics12_marathon_ch01_draft');
    } catch {
      // ignore
    }

    // Record result in progress tracker
    let calculatedScore = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctOption) {
        calculatedScore += 1;
      }
    });

    recordTestResult({
      id: `physics12-ch01-marathon-${Date.now()}`,
      testId: test.id,
      studentId: user?.uid || 'guest-student',
      score: calculatedScore,
      totalMarks: questions.length,
      correctAnswers: calculatedScore,
      incorrectAnswers: answeredCount - calculatedScore,
      unattempted: unansweredCount,
      timeTakenMinutes: Math.max(1, Math.round(timeSpent / 60)),
      completedAt: new Date().toISOString(),
      testTitle: test.title,
      subjectId: test.subjectId,
      subjectName: test.subjectName,
      classLevel: test.classLevel,
      passed: calculatedScore >= 180,
    });
  };

  const handleResetTest = () => {
    setPhase('intro');
    setCurrentIdx(0);
    setUserAnswers({});
    setBookmarked({});
    setTimeLeft(initialSeconds);
    setTimeSpent(0);
    setIsTimerRunning(false);
  };

  // Calculations
  const answeredCount = Object.keys(userAnswers).length;
  const unansweredCount = questions.length - answeredCount;
  const bookmarkedCount = Object.values(bookmarked).filter(Boolean).length;

  let totalScore = 0;
  questions.forEach((q, idx) => {
    if (userAnswers[idx] === q.correctOption) {
      totalScore += 1;
    }
  });

  const percentage = Math.round((totalScore / questions.length) * 100);
  let division = 'उत्तीर्ण (Pass)';
  let gradeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';

  if (percentage >= 80) {
    division = '🥇 टॉपर ग्रेड (Topper Rank)';
    gradeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  } else if (percentage >= 60) {
    division = '🥈 प्रथम श्रेणी (First Division)';
    gradeColor = 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  } else if (percentage >= 45) {
    division = '🥉 द्वितीय श्रेणी (Second Division)';
    gradeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  } else if (percentage >= 30) {
    division = '📜 तृतीय श्रेणी (Third Division)';
    gradeColor = 'text-orange-400 bg-orange-500/10 border-orange-500/30';
  } else {
    division = '❌ अनुत्तीर्ण (Needs Practice)';
    gradeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  }

  // Time formatter
  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Filtered Questions Palette indices
  const filteredIndices = useMemo(() => {
    return questions
      .map((_, idx) => idx)
      .filter((idx) => {
        if (filterMode === 'answered') return userAnswers[idx] !== undefined;
        if (filterMode === 'unanswered') return userAnswers[idx] === undefined;
        if (filterMode === 'bookmarked') return !!bookmarked[idx];
        return true;
      });
  }, [questions, filterMode, userAnswers, bookmarked]);

  const currentQ = questions[currentIdx];

  const handleQuickJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(quickJumpVal, 10);
    if (!isNaN(num) && num >= 1 && num <= questions.length) {
      setCurrentIdx(num - 1);
      setQuickJumpVal('');
      setIsMobilePaletteOpen(false);
    }
  };

  const handleShareResult = () => {
    const shareText = `⚡ मैंने RK STUDY CENTRE पर कक्षा 12वीं भौतिकी अध्याय 1 (वैद्युत आवेश तथा क्षेत्र) 300 VVI 'इलेक्ट्रो-ब्रह्मास्त्र' महामैराथन लाइव टेस्ट पूरा किया!
📊 मेरा स्कोर: ${totalScore}/300 (${percentage}%)
🏆 परिणाम: ${division}
⏱️ लिया गया समय: ${formatTime(timeSpent)}

आप भी अपना टेस्ट देकर 12वीं बोर्ड 2026 टॉपर लिस्ट में नाम बनाएँ! 🚀`;

    if (navigator.share) {
      navigator.share({ title: test.title, text: shareText, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 overflow-hidden flex flex-col bg-slate-950 text-slate-100 font-sans select-none ${
        isDesktopSiteMode ? 'w-full h-full min-h-[100dvh]' : 'w-full h-full'
      }`}
    >
      <WatermarkWrapper text="RK STUDY CENTRE • 12th PHYSICS CH-01 TEST">
        {/* TOP HEADER BAR */}
        <header className="shrink-0 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 py-2 sm:px-6 sm:py-3 flex items-center justify-between gap-2 z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  300 VVI • 12th Physics Ch-01
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 2016-2026 Special
                </span>
              </div>
              <h1 className="text-xs sm:text-sm md:text-base font-extrabold text-white truncate max-w-[200px] sm:max-w-md md:max-w-xl">
                कक्षा 12वीं भौतिकी Ch-01: वैद्युत आवेश तथा क्षेत्र - 300 VVI 'इलेक्ट्रो-ब्रह्मास्त्र' महामैराथन
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop Site Toggle Button */}
            <button
              onClick={() => setIsDesktopSiteMode(!isDesktopSiteMode)}
              title={isDesktopSiteMode ? 'फुल डेस्कटॉप मोड एक्टिव है (Click for Mobile)' : 'डेस्कटॉप साइट मोड ऑन करें'}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                isDesktopSiteMode
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-300/40'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isDesktopSiteMode ? 'Full Desktop Site ON' : 'Desktop Mode'}
              </span>
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1"
              title="फुल स्क्रीन मोड"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors"
              title="बंद करें"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {/* PHASE 1: INTRO SCREEN */}
          {phase === 'intro' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
              <div className="max-w-3xl w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-8 shadow-2xl space-y-6">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
                    ⚡ 3 Hours Live Akhand Marathon • 300 Class 12 Objective Questions
                  </div>
                  <h2 className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-200 to-pink-300">
                    कक्षा 12वीं भौतिकी अध्याय 1: वैद्युत आवेश तथा क्षेत्र
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
                    300 VVI 'इलेक्ट्रो-ब्रह्मास्त्र' ऑनलाइन महामैराथन लाइव टेस्ट (2016-2026 बोर्ड स्पेशल PYQs & NCERT Exemplar)
                  </p>
                </div>

                {/* Info Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <p className="text-xs text-slate-400 font-medium">कुल प्रश्न</p>
                    <p className="text-lg sm:text-2xl font-black text-purple-400">300 MCQ</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <p className="text-xs text-slate-400 font-medium">समय सीमा</p>
                    <p className="text-lg sm:text-2xl font-black text-emerald-400">3 घंटे (180m)</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <p className="text-xs text-slate-400 font-medium">कुल अंक</p>
                    <p className="text-lg sm:text-2xl font-black text-indigo-400">300 अंक</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <p className="text-xs text-slate-400 font-medium">प्रथम श्रेणी cutoff</p>
                    <p className="text-lg sm:text-2xl font-black text-amber-400">180 अंक (60%)</p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2 text-xs sm:text-sm text-slate-300">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    महत्वपूर्ण दिशा-निर्देश (Test Rules):
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
                    <li>सभी 300 प्रश्न वस्तुनिष्ठ बहुविकल्पीय (MCQ) हैं। प्रत्येक सही उत्तर का 1 अंक है।</li>
                    <li>कोई नकारात्मक अंकन (No Negative Marking) नहीं है।</li>
                    <li>आप कभी भी प्रश्न पैलेट से किसी भी प्रश्न पर सीधा जंप कर सकते हैं।</li>
                    <li>'Full Desktop Site' मोड ऑन करके आप OMR बोर्ड व पैलेट को एक स्क्रीन पर देख सकते हैं।</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleStartTest}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-black text-sm sm:text-base text-white shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 group"
                  >
                    <Zap className="w-5 h-5 text-amber-300 group-hover:scale-125 transition-transform" />
                    ⚡ इलेक्ट्रो-ब्रह्मास्त्र टेस्ट शुरू करें (3 Hr)
                  </button>
                  {onNavigateToNotes && (
                    <button
                      onClick={onNavigateToNotes}
                      className="py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      12th Physics Notes पढ़ें
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PHASE 2: ACTIVE TEST PHASE */}
          {phase === 'active' && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
              {/* LEFT / CENTER: QUESTION CARDS WORKSPACE */}
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
                {/* ACTIVE TEST SUB-HEADER WITH TIMER & STATUS */}
                <div className="shrink-0 bg-slate-900/80 border-b border-slate-800 px-3 py-2 sm:px-5 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-300">
                      प्रश्न <span className="text-purple-400 font-extrabold">{currentIdx + 1}</span> / {questions.length}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-xs text-emerald-400 font-medium hidden sm:inline">
                      हल किया: {answeredCount}
                    </span>
                    <span className="text-xs text-amber-400 font-medium hidden sm:inline">
                      शेष: {unansweredCount}
                    </span>
                  </div>

                  {/* TIMER DISPLAY */}
                  <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                    <span className="font-mono text-sm sm:text-base font-black text-amber-300">
                      {formatTime(timeLeft)}
                    </span>
                  </div>

                  {/* MOBILE PALETTE BUTTON */}
                  <button
                    onClick={() => setIsMobilePaletteOpen(true)}
                    className="md:hidden px-2.5 py-1 rounded-lg bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                    300 पैलेट
                  </button>
                </div>

                {/* QUESTION AREA */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5">
                  <div className="max-w-3xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
                    {/* Question Header & Bookmark */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="inline-block px-2.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-bold">
                          Q{currentIdx + 1} • {test.chapterTitle}
                        </span>
                        <h2 className="text-base sm:text-xl font-bold text-white leading-relaxed pt-1">
                          {currentQ.question}
                        </h2>
                      </div>
                      <button
                        onClick={() => handleToggleBookmark(currentIdx)}
                        className={`p-2 rounded-xl border transition-colors shrink-0 ${
                          bookmarked[currentIdx]
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                        }`}
                        title="प्रश्न बुकमार्क करें"
                      >
                        <Bookmark className="w-5 h-5 fill-current" />
                      </button>
                    </div>

                    {/* Options Grid */}
                    <div className="space-y-3 pt-2">
                      {currentQ.options.map((opt, oIdx) => {
                        const isSelected = userAnswers[currentIdx] === oIdx;
                        const optionLabels = ['(A)', '(B)', '(C)', '(D)'];

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectOption(currentIdx, oIdx)}
                            className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3 text-xs sm:text-base ${
                              isSelected
                                ? 'bg-purple-600/20 border-purple-500 text-white shadow-md shadow-purple-600/10 ring-1 ring-purple-500/50'
                                : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/80 text-slate-200'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                                isSelected
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {optionLabels[oIdx]}
                            </span>
                            <span className="flex-1 pt-0.5 font-medium leading-normal">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* BOTTOM ACTION NAVIGATION BAR */}
                <div className="shrink-0 bg-slate-900 border-t border-slate-800 p-3 sm:px-6 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                      disabled={currentIdx === 0}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-1 border border-slate-700"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      पिछला (Prev)
                    </button>
                    {userAnswers[currentIdx] !== undefined && (
                      <button
                        onClick={() => handleClearOption(currentIdx)}
                        className="px-2.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-rose-300 text-xs font-semibold border border-slate-700/60"
                      >
                        उत्तर मिटाएँ
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {currentIdx < questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1 shadow-md shadow-purple-600/20"
                      >
                        अगला (Next)
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitTest}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-black flex items-center gap-1 shadow-lg shadow-emerald-600/20"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        सबमिट करें (Submit)
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT SIDEBAR: QUESTION PALETTE MATRIX (DESKTOP / TABLET) */}
              <aside className="hidden md:flex flex-col w-72 lg:w-80 xl:w-96 bg-slate-900 border-l border-slate-800 shrink-0">
                <div className="p-3 border-b border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ListOrdered className="w-4 h-4 text-purple-400" />
                      300 प्रश्न पैलेट
                    </span>
                    <button
                      onClick={handleSubmitTest}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold"
                    >
                      सबमिट टेस्ट
                    </button>
                  </div>

                  {/* Filter Tabs */}
                  <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-medium text-center">
                    <button
                      onClick={() => setFilterMode('all')}
                      className={`py-1 rounded ${filterMode === 'all' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      सभी
                    </button>
                    <button
                      onClick={() => setFilterMode('answered')}
                      className={`py-1 rounded ${filterMode === 'answered' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      हल ({answeredCount})
                    </button>
                    <button
                      onClick={() => setFilterMode('unanswered')}
                      className={`py-1 rounded ${filterMode === 'unanswered' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      शेष ({unansweredCount})
                    </button>
                    <button
                      onClick={() => setFilterMode('bookmarked')}
                      className={`py-1 rounded ${filterMode === 'bookmarked' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      ⭐ ({bookmarkedCount})
                    </button>
                  </div>

                  {/* Quick Jump Input */}
                  <form onSubmit={handleQuickJump} className="flex gap-1.5">
                    <input
                      type="number"
                      placeholder="Q.1 - 300 पर जाएँ..."
                      min={1}
                      max={300}
                      value={quickJumpVal}
                      onChange={(e) => setQuickJumpVal(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                    >
                      जंप
                    </button>
                  </form>
                </div>

                {/* 300 Grid Buttons */}
                <div className="flex-1 overflow-y-auto p-3 grid grid-cols-5 gap-2 content-start">
                  {filteredIndices.map((qIdx) => {
                    const isAnswered = userAnswers[qIdx] !== undefined;
                    const isCurrent = qIdx === currentIdx;
                    const isMarked = !!bookmarked[qIdx];

                    let btnStyle = 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700';
                    if (isAnswered) {
                      btnStyle = 'bg-emerald-600 text-white border-emerald-500';
                    }
                    if (isCurrent) {
                      btnStyle += ' ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900';
                    }

                    return (
                      <button
                        key={qIdx}
                        onClick={() => setCurrentIdx(qIdx)}
                        className={`h-9 rounded-lg border font-bold text-xs flex items-center justify-center relative transition-all ${btnStyle}`}
                      >
                        {qIdx + 1}
                        {isMarked && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </aside>
            </div>
          )}

          {/* PHASE 3: RESULT & OFFICIAL SCORECARD */}
          {phase === 'result' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* TOP SCORECARD BANNER */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-2xl relative overflow-hidden">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-2 ${gradeColor}`}>
                    <Award className="w-4 h-4" />
                    {division}
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-white">
                    आपका महामैराथन परिणाम: <span className="text-purple-400">{totalScore}</span> / 300
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300">
                    कक्षा 12वीं भौतिकी Ch-01 • प्राप्तांक: <span className="font-bold text-white">{percentage}%</span> • समय: <span className="font-bold text-white">{formatTime(timeSpent)}</span>
                  </p>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleShareResult}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-600/20"
                    >
                      <Share2 className="w-4 h-4" />
                      {copySuccess ? 'स्कोर कॉपी हो गया!' : 'स्कोर शेयर करें'}
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      स्कोरकार्ड प्रिंट / PDF
                    </button>
                    <button
                      onClick={handleResetTest}
                      className="px-5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs sm:text-sm flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      पुनः टेस्ट दें
                    </button>
                  </div>
                </div>

                {/* DETAILED EXPLANATION REVIEW */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                      सभी 300 प्रश्नों का हल एवं व्याख्या उत्तर कुंजी:
                    </h3>
                    <div className="flex gap-1 text-xs">
                      <button
                        onClick={() => setReviewFilter('all')}
                        className={`px-2.5 py-1 rounded-lg border ${reviewFilter === 'all' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                      >
                        सभी
                      </button>
                      <button
                        onClick={() => setReviewFilter('correct')}
                        className={`px-2.5 py-1 rounded-lg border ${reviewFilter === 'correct' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                      >
                        सही
                      </button>
                      <button
                        onClick={() => setReviewFilter('incorrect')}
                        className={`px-2.5 py-1 rounded-lg border ${reviewFilter === 'incorrect' ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                      >
                        गलत
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {questions
                      .filter((q, idx) => {
                        const userAns = userAnswers[idx];
                        const isCorrect = userAns === q.correctOption;
                        if (reviewFilter === 'correct') return isCorrect;
                        if (reviewFilter === 'incorrect') return userAns !== undefined && !isCorrect;
                        if (reviewFilter === 'skipped') return userAns === undefined;
                        return true;
                      })
                      .map((q) => {
                        const originalIdx = q.order - 1;
                        const userAns = userAnswers[originalIdx];
                        const isCorrect = userAns === q.correctOption;

                        return (
                          <div
                            key={q.id}
                            className={`p-4 rounded-xl border space-y-2 ${
                              isCorrect
                                ? 'bg-emerald-950/20 border-emerald-800/40'
                                : userAns !== undefined
                                ? 'bg-rose-950/20 border-rose-800/40'
                                : 'bg-slate-950/60 border-slate-800'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs sm:text-sm font-bold text-white">
                                Q{q.order}. {q.question}
                              </p>
                              <span className="shrink-0 text-xs font-bold">
                                {isCorrect ? (
                                  <span className="text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" /> सही
                                  </span>
                                ) : userAns !== undefined ? (
                                  <span className="text-rose-400 flex items-center gap-1">
                                    <XCircle className="w-4 h-4" /> गलत
                                  </span>
                                ) : (
                                  <span className="text-amber-400">अनुत्तरित</span>
                                )}
                              </span>
                            </div>

                            <div className="text-xs space-y-1 pt-1 text-slate-300">
                              <p>
                                <span className="font-semibold text-emerald-300">सही उत्तर: </span>
                                {q.options[q.correctOption]}
                              </p>
                              {userAns !== undefined && !isCorrect && (
                                <p>
                                  <span className="font-semibold text-rose-300">आपका उत्तर: </span>
                                  {q.options[userAns]}
                                </p>
                              )}
                              <p className="text-slate-400 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 mt-1 italic">
                                💡 व्याख्या: {q.explanation}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MOBILE PALETTE SLIDE-UP DRAWER */}
        {isMobilePaletteOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end">
            <div className="bg-slate-900 border-t border-slate-800 rounded-t-2xl p-4 max-h-[80vh] flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-purple-400" />
                  300 प्रश्न पैलेट बोर्ड
                </span>
                <button
                  onClick={() => setIsMobilePaletteOpen(false)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Jump Form */}
              <form onSubmit={handleQuickJump} className="flex gap-2">
                <input
                  type="number"
                  placeholder="प्रश्न सं. (1-300)"
                  min={1}
                  max={300}
                  value={quickJumpVal}
                  onChange={(e) => setQuickJumpVal(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs">
                  जंप
                </button>
              </form>

              {/* Grid buttons */}
              <div className="flex-1 overflow-y-auto grid grid-cols-6 gap-2 p-1">
                {questions.map((_, qIdx) => {
                  const isAnswered = userAnswers[qIdx] !== undefined;
                  const isCurrent = qIdx === currentIdx;

                  return (
                    <button
                      key={qIdx}
                      onClick={() => {
                        setCurrentIdx(qIdx);
                        setIsMobilePaletteOpen(false);
                      }}
                      className={`h-9 rounded-lg font-bold text-xs flex items-center justify-center border ${
                        isCurrent
                          ? 'bg-purple-600 text-white border-purple-400 ring-2 ring-purple-400'
                          : isAnswered
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {qIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </WatermarkWrapper>
    </div>
  );
};
