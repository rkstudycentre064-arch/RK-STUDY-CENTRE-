import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Award,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  HelpCircle,
  ArrowRight,
  Trophy,
  Flame,
  WifiOff,
  Signal,
  Share2,
  Star,
  BookOpen,
  ChevronRight,
  HeartHandshake
} from 'lucide-react';
import {
  INDEPENDENCE_DAY_QUESTIONS,
  type PatrioticMcqQuestion,
  type QuizState
} from '../data/independenceDayMcqData';
import { patrioticAudio } from '../utils/patrioticAudio';
import { useNetworkQuality } from '../hooks/useNetworkQuality';

interface IndependenceDayQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IndependenceDayQuizModal: React.FC<IndependenceDayQuizModalProps> = ({
  isOpen,
  onClose
}) => {
  const { isOnline, isWeak, effectiveType } = useNetworkQuality();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [soundMuted, setSoundMuted] = useState<boolean>(() => patrioticAudio.getMuted());
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('rk_tiranga_high_score') || 0);
    } catch {
      return 0;
    }
  });

  // Filter questions based on selected category
  const activeQuestions = React.useMemo(() => {
    if (selectedCategory === 'all') return INDEPENDENCE_DAY_QUESTIONS;
    return INDEPENDENCE_DAY_QUESTIONS.filter((q) => q.category === selectedCategory);
  }, [selectedCategory]);

  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    selectedOption: null,
    isAnswered: false,
    score: 0,
    streak: 0,
    highestStreak: 0,
    correctAnswersCount: 0,
    incorrectAnswersCount: 0,
    lifelines: {
      fiftyFiftyUsed: false,
      hintUsed: false,
      skipUsed: false
    },
    eliminatedOptions: [],
    showHint: false,
    isCompleted: false,
    userAnswers: []
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Trigger tricolor confetti
  const triggerTricolorConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

    const colors = ['#FF671F', '#FFFFFF', '#046A38', '#06038D', '#FFD700'];
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      rotation: number;
      vRot: number;
    }[] = [];

    for (let i = 0; i < 65; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 150,
        y: canvas.height / 3 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 9 - 3,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2
      });
    }

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.rotation += p.vRot;
        p.alpha -= 0.012;

        if (p.alpha > 0) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
          ctx.restore();
        }
      });

      if (frame < 80) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    requestAnimationFrame(animate);
  };

  const handleSoundToggle = () => {
    const isNowMuted = patrioticAudio.toggleMute();
    setSoundMuted(isNowMuted);
  };

  const restartQuiz = () => {
    setQuizState({
      currentQuestionIndex: 0,
      selectedOption: null,
      isAnswered: false,
      score: 0,
      streak: 0,
      highestStreak: 0,
      correctAnswersCount: 0,
      incorrectAnswersCount: 0,
      lifelines: {
        fiftyFiftyUsed: false,
        hintUsed: false,
        skipUsed: false
      },
      eliminatedOptions: [],
      showHint: false,
      isCompleted: false,
      userAnswers: []
    });
  };

  const currentQ: PatrioticMcqQuestion | undefined =
    activeQuestions[quizState.currentQuestionIndex % activeQuestions.length];

  const handleOptionSelect = (optionIndex: number) => {
    if (quizState.isAnswered || !currentQ) return;

    patrioticAudio.playTick();
    const isCorrect = optionIndex === currentQ.correctIndex;

    const basePoints = 100;
    const streakBonus = quizState.streak * 25;
    const pointsGained = isCorrect ? basePoints + streakBonus : 0;
    const nextScore = quizState.score + pointsGained;
    const nextStreak = isCorrect ? quizState.streak + 1 : 0;
    const nextHighestStreak = Math.max(quizState.highestStreak, nextStreak);

    if (isCorrect) {
      patrioticAudio.playCorrect();
      triggerTricolorConfetti();
    } else {
      patrioticAudio.playWrong();
    }

    // Save High Score
    if (nextScore > highScore) {
      setHighScore(nextScore);
      try {
        localStorage.setItem('rk_tiranga_high_score', String(nextScore));
      } catch {
        // ignore
      }
    }

    setQuizState((prev) => ({
      ...prev,
      selectedOption: optionIndex,
      isAnswered: true,
      score: nextScore,
      streak: nextStreak,
      highestStreak: nextHighestStreak,
      correctAnswersCount: isCorrect ? prev.correctAnswersCount + 1 : prev.correctAnswersCount,
      incorrectAnswersCount: !isCorrect ? prev.incorrectAnswersCount + 1 : prev.incorrectAnswersCount,
      userAnswers: [
        ...prev.userAnswers,
        {
          questionId: currentQ.id,
          selectedIdx: optionIndex,
          isCorrect
        }
      ]
    }));
  };

  const handleNextQuestion = () => {
    patrioticAudio.playTick();
    if (quizState.currentQuestionIndex + 1 >= activeQuestions.length) {
      // Completed!
      setQuizState((prev) => ({ ...prev, isCompleted: true }));
      patrioticAudio.playFanfare();
      triggerTricolorConfetti();
    } else {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        selectedOption: null,
        isAnswered: false,
        eliminatedOptions: [],
        showHint: false
      }));
    }
  };

  // 50:50 Lifeline
  const handleFiftyFifty = () => {
    if (quizState.lifelines.fiftyFiftyUsed || quizState.isAnswered || !currentQ) return;
    patrioticAudio.playTick();

    const correct = currentQ.correctIndex;
    const incorrectIndices = [0, 1, 2, 3].filter((idx) => idx !== correct);
    // Shuffle and pick 2 incorrect to eliminate
    const shuffled = incorrectIndices.sort(() => 0.5 - Math.random());
    const eliminated = shuffled.slice(0, 2);

    setQuizState((prev) => ({
      ...prev,
      eliminatedOptions: eliminated,
      lifelines: {
        ...prev.lifelines,
        fiftyFiftyUsed: true
      }
    }));
  };

  // Hint Lifeline
  const handleUseHint = () => {
    if (quizState.lifelines.hintUsed || quizState.isAnswered) return;
    patrioticAudio.playTick();
    setQuizState((prev) => ({
      ...prev,
      showHint: true,
      lifelines: {
        ...prev.lifelines,
        hintUsed: true
      }
    }));
  };

  // Skip Lifeline
  const handleSkip = () => {
    if (quizState.lifelines.skipUsed || quizState.isAnswered) return;
    patrioticAudio.playTick();
    if (quizState.currentQuestionIndex + 1 >= activeQuestions.length) {
      setQuizState((prev) => ({ ...prev, isCompleted: true }));
    } else {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        selectedOption: null,
        isAnswered: false,
        eliminatedOptions: [],
        showHint: false,
        lifelines: {
          ...prev.lifelines,
          skipUsed: true
        }
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tiranga-quiz-title"
    >
      <div className="relative w-full max-w-3xl my-auto bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Canvas for patriotic confetti */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-40 w-full h-full"
        />

        {/* --- Top Tiranga Stripes Banner (Kesariya, White, Green) --- */}
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 px-4 py-3 sm:px-6 sm:py-4 border-b border-orange-400/40 text-white shadow-md">
          {/* Subtle Tricolor Flag background decor */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-orange-500" />
          <div className="absolute top-1.5 left-0 right-0 h-1.5 bg-white" />
          <div className="absolute top-3 left-0 right-0 h-1.5 bg-emerald-600" />

          <div className="flex items-center justify-between gap-3 mt-1.5">
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Spinning 24-spoke Ashoka Chakra Icon */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-blue-900 shrink-0">
                <svg
                  className="w-8 h-8 animate-[spin_12s_linear_infinite] text-blue-900"
                  viewBox="0 0 100 100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <circle cx="50" cy="50" r="45" strokeWidth="4" />
                  <circle cx="50" cy="50" r="8" fill="currentColor" />
                  {/* 24 spokes */}
                  {Array.from({ length: 24 }).map((_, i) => (
                    <line
                      key={i}
                      x1="50"
                      y1="50"
                      x2={50 + 44 * Math.cos(((i * 15) * Math.PI) / 180)}
                      y2={50 + 44 * Math.sin(((i * 15) * Math.PI) / 180)}
                      strokeWidth="1.6"
                    />
                  ))}
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm flex items-center gap-1.5">
                    <span>🇮🇳</span> स्वतंत्रता दिवस ज्ञान बूस्टर
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-orange-100 font-semibold flex items-center gap-1">
                  <span>वंदे मातरम्</span> • <span>कमजोर/ऑफलाइन नेटवर्क स्पेशल क्विज़</span>
                </p>
              </div>
            </div>

            {/* Top Right Controls: Network status, sound, close */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Network Status Pill */}
              <div
                className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-inner ${
                  !isOnline
                    ? 'bg-red-950/80 text-red-200 border border-red-500/50'
                    : isWeak
                    ? 'bg-amber-950/80 text-amber-200 border border-amber-500/50'
                    : 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/50'
                }`}
                title="नेटवर्क स्थिति"
              >
                {!isOnline ? (
                  <>
                    <WifiOff className="w-3 h-3 text-red-400" />
                    <span>ऑफलाइन मोड (100% चालू)</span>
                  </>
                ) : isWeak ? (
                  <>
                    <Signal className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span>धीमा नेटवर्क (बिना रुकावट)</span>
                  </>
                ) : (
                  <>
                    <Signal className="w-3 h-3 text-emerald-400" />
                    <span>ऑनलाइन ({effectiveType})</span>
                  </>
                )}
              </div>

              {/* Sound Toggle */}
              <button
                onClick={handleSoundToggle}
                className="p-2 rounded-xl bg-orange-700/70 hover:bg-orange-800 text-white transition-colors cursor-pointer border border-orange-400/30"
                title={soundMuted ? 'ध्वनि चालू करें' : 'ध्वनि म्यूट करें'}
                aria-label="Sound Toggle"
              >
                {soundMuted ? (
                  <VolumeX className="w-4 h-4 text-orange-200" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>

              {/* Close Modal Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-orange-700/70 hover:bg-red-600 text-white transition-colors cursor-pointer border border-orange-400/30"
                title="क्विज़ बंद करें"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Slogan Banner */}
          <div className="mt-2 text-center bg-black/25 py-0.5 px-3 rounded-lg backdrop-blur-xs text-[11px] font-bold text-amber-100 flex items-center justify-center gap-2">
            <span>🇮🇳</span>
            <span>"ज्ञान ही सबसे बड़ी शक्ति है — हर परिस्थिति में पढ़ाई जारी रखें!"</span>
            <span>🇮🇳</span>
          </div>
        </div>

        {/* --- Category Selector Bar --- */}
        <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            विषय:
          </span>
          {[
            { id: 'all', label: '🌟 सभी प्रश्न (Mix)' },
            { id: 'freedom-struggle', label: '⚔️ स्वतंत्रता संग्राम' },
            { id: 'bihar-veers', label: '🦁 बिहार के वीर सपूत' },
            { id: 'national-symbols', label: '🇮🇳 राष्ट्रीय प्रतीक' },
            { id: 'board-science-gk', label: '🔬 विज्ञान व बोर्ड ज्ञान' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                patrioticAudio.playTick();
                setSelectedCategory(cat.id);
                setQuizState((prev) => ({
                  ...prev,
                  currentQuestionIndex: 0,
                  selectedOption: null,
                  isAnswered: false,
                  eliminatedOptions: [],
                  showHint: false,
                  isCompleted: false
                }));
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-900/30'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* --- Main Quiz Content or Completion Screen --- */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
          {!quizState.isCompleted && currentQ ? (
            <div className="space-y-4">
              {/* Stats Bar (Score, Question Counter, Streak) */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-800/60 rounded-2xl border border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-slate-900 text-amber-400 font-extrabold text-xs rounded-xl border border-amber-500/30 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    प्रश्न {quizState.currentQuestionIndex + 1} / {activeQuestions.length}
                  </span>
                  <span className="px-2.5 py-1 bg-blue-950 text-blue-300 font-bold text-xs rounded-xl border border-blue-600/40">
                    {currentQ.badge}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Streak Multiplier */}
                  {quizState.streak > 1 && (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-orange-950/80 text-orange-300 rounded-xl border border-orange-500/50 font-black text-xs animate-bounce">
                      <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                      {quizState.streak}x स्ट्रीक!
                    </div>
                  )}

                  {/* Score */}
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-950 to-green-950 text-emerald-300 rounded-xl border border-emerald-500/40 font-black text-xs">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>अंक: {quizState.score}</span>
                  </div>
                </div>
              </div>

              {/* Question Text Box */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-800/90 to-slate-850/90 rounded-2xl border-2 border-orange-500/30 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-500 via-white to-emerald-500" />
                <div className="pl-2">
                  <p className="text-base sm:text-lg font-bold text-white leading-snug">
                    {currentQ.questionHindi}
                  </p>
                  {currentQ.questionEnglish && (
                    <p className="text-xs text-slate-400 mt-1 font-medium italic">
                      {currentQ.questionEnglish}
                    </p>
                  )}
                </div>
              </div>

              {/* Lifelines Toolbar */}
              <div className="flex items-center justify-between gap-2 pt-1 pb-1">
                <span className="text-xs font-bold text-slate-400">जीवनरेखा (Lifelines):</span>
                <div className="flex items-center gap-2">
                  {/* 50:50 */}
                  <button
                    onClick={handleFiftyFifty}
                    disabled={quizState.lifelines.fiftyFiftyUsed || quizState.isAnswered}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      quizState.lifelines.fiftyFiftyUsed
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                        : 'bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/40 cursor-pointer shadow-xs'
                    }`}
                    title="दो गलत विकल्प हटाएं"
                  >
                    <span>🛡️ 50:50</span>
                  </button>

                  {/* Hint */}
                  <button
                    onClick={handleUseHint}
                    disabled={quizState.lifelines.hintUsed || quizState.isAnswered}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      quizState.lifelines.hintUsed
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                        : 'bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-500/40 cursor-pointer shadow-xs'
                    }`}
                    title="संकेत देखें"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-300" />
                    <span>संकेत (Hint)</span>
                  </button>

                  {/* Skip */}
                  <button
                    onClick={handleSkip}
                    disabled={quizState.lifelines.skipUsed || quizState.isAnswered}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      quizState.lifelines.skipUsed
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 cursor-pointer'
                    }`}
                    title="यह प्रश्न छोड़ें"
                  >
                    <span>⏩ छोड़ें (Skip)</span>
                  </button>
                </div>
              </div>

              {/* Hint Box (if active) */}
              {quizState.showHint && (
                <div className="p-3 bg-amber-950/70 border border-amber-500/50 rounded-xl text-amber-200 text-xs flex items-start gap-2 animate-in fade-in">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">संकेत (Hint): </span>
                    <span>{currentQ.hint}</span>
                  </div>
                </div>
              )}

              {/* MCQ Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {currentQ.options.map((optText, idx) => {
                  const optionLetters = ['A', 'B', 'C', 'D'];
                  const isEliminated = quizState.eliminatedOptions.includes(idx);
                  const isSelected = quizState.selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;

                  let btnStyle =
                    'bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 border-slate-700 hover:border-orange-500/60';
                  let badgeStyle = 'bg-slate-700 text-slate-300';

                  if (isEliminated) {
                    btnStyle = 'bg-slate-900/40 text-slate-600 border-slate-800/50 opacity-25 cursor-not-allowed';
                    badgeStyle = 'bg-slate-800 text-slate-700';
                  } else if (quizState.isAnswered) {
                    if (isCorrect) {
                      btnStyle =
                        'bg-gradient-to-r from-emerald-900/90 to-green-900/90 text-emerald-100 border-emerald-400 shadow-md shadow-emerald-950';
                      badgeStyle = 'bg-emerald-500 text-white font-black';
                    } else if (isSelected) {
                      btnStyle =
                        'bg-gradient-to-r from-red-950 to-red-900 text-red-100 border-red-500 shadow-md';
                      badgeStyle = 'bg-red-500 text-white font-black';
                    } else {
                      btnStyle = 'bg-slate-850/50 text-slate-500 border-slate-800 opacity-60';
                      badgeStyle = 'bg-slate-800 text-slate-600';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={quizState.isAnswered || isEliminated}
                      onClick={() => handleOptionSelect(idx)}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left font-semibold transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-xs ${badgeStyle}`}
                      >
                        {optionLetters[idx]}
                      </span>
                      <span className="text-xs sm:text-sm leading-relaxed flex-1">
                        {optText}
                      </span>
                      {quizState.isAnswered && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-1" />
                      )}
                      {quizState.isAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-400 shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Detailed Explanation & Patriotic Fact Box (after answering) */}
              {quizState.isAnswered && (
                <div className="space-y-3 pt-2 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="p-4 bg-slate-800/95 border border-slate-700 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        विस्तृत उत्तर व्याख्या (Explanation):
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                      {currentQ.explanation}
                    </p>

                    {/* Patriotic Fact Box */}
                    {currentQ.patrioticFact && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-orange-950/70 via-slate-900 to-emerald-950/70 border border-orange-500/30 rounded-xl text-xs text-orange-200 flex items-start gap-2">
                        <span className="text-base">🇮🇳</span>
                        <div>
                          <strong className="text-amber-300 font-bold">रोचक देशभक्ति तथ्य: </strong>
                          <span>{currentQ.patrioticFact}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Next Question CTA Button */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-500 to-emerald-600 hover:from-orange-500 hover:to-emerald-500 text-slate-950 font-black text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>
                        {quizState.currentQuestionIndex + 1 >= activeQuestions.length
                          ? 'परिणाम व देशभक्ति प्रमाण पत्र देखें'
                          : 'अगला प्रश्न हल करें'}
                      </span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* --- Quiz Completion & Certificate View --- */
            <div className="text-center py-4 sm:py-6 space-y-6 max-w-xl mx-auto animate-in zoom-in-95 duration-300">
              {/* Patriotic Tricolor Certificate Card */}
              <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-3xl shadow-2xl relative overflow-hidden text-center space-y-4">
                {/* Decorative Tiranga Border */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-white to-emerald-500" />

                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-white flex items-center justify-center shadow-xl border-4 border-blue-900">
                  <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500" />
                </div>

                <div>
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-bold text-xs">
                    🇮🇳 स्वतंत्रता दिवस ज्ञान गौरव प्रमाण पत्र 🇮🇳
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
                    जय हिन्द! शानदार प्रदर्शन!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    आपने कमजोर/ऑफलाइन नेटवर्क में भी ज्ञान की मशाल जलाए रखी।
                  </p>
                </div>

                {/* Score & Accuracy Grid */}
                <div className="grid grid-cols-3 gap-3 p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
                  <div className="text-center">
                    <div className="text-xs text-slate-400 font-bold">कुल अंक</div>
                    <div className="text-xl sm:text-2xl font-black text-amber-400">
                      {quizState.score}
                    </div>
                  </div>
                  <div className="text-center border-x border-slate-700">
                    <div className="text-xs text-slate-400 font-bold">सही उत्तर</div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-400">
                      {quizState.correctAnswersCount} / {activeQuestions.length}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-400 font-bold">सर्वोत्तम स्ट्रीक</div>
                    <div className="text-xl sm:text-2xl font-black text-orange-400">
                      🔥 {quizState.highestStreak}x
                    </div>
                  </div>
                </div>

                {/* Patriotic Title Earned */}
                <div className="p-3 bg-gradient-to-r from-orange-950 via-slate-900 to-emerald-950 rounded-xl border border-amber-500/30 text-xs sm:text-sm text-amber-200 font-bold flex items-center justify-center gap-2">
                  <span>🎖️ उपाधि:</span>
                  <span className="text-white font-extrabold text-base">
                    {quizState.score > 800
                      ? '🇮🇳 परमवीर ज्ञान शिल्पी'
                      : quizState.score > 400
                      ? '🌟 देशभक्त विद्यार्थी'
                      : '📖 कर्मठ ज्ञान साधक'}
                  </span>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={restartQuiz}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>पुनः क्विज़ खेलें</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition-colors cursor-pointer border border-slate-600 flex items-center justify-center gap-2"
                  >
                    <span>मुख्य स्क्रीन पर लौटें</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- Footer Stripe --- */}
        <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-slate-400 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-orange-400 font-bold">🇮🇳 RK Study Centre</span>
            <span className="text-slate-600">•</span>
            <span>अखण्ड भारत • सम्पूर्ण शिक्षा</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span>उच्चतम स्कोर: <strong className="text-amber-400">{highScore}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
