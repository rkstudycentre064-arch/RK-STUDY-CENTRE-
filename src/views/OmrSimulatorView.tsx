import React, { useState, useEffect, useMemo } from 'react';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Award,
  Download,
  Printer,
  Key,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import type { MainNavRoute } from '../types';

interface OmrSimulatorViewProps {
  onNavigate: (route: MainNavRoute) => void;
}

export function OmrSimulatorView({ onNavigate }: OmrSimulatorViewProps) {
  const [totalQuestionsCount, setTotalQuestionsCount] = useState<50 | 75 | 100>(50);
  const [selectedSetCode, setSelectedSetCode] = useState<string>('Set-A');
  const [studentName, setStudentName] = useState<string>('');
  const [rollCode, setRollCode] = useState<string>('12045');
  const [rollNumber, setRollNumber] = useState<string>('2600101');

  // User answers map: { [questionNumber: number]: 'A' | 'B' | 'C' | 'D' }
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  
  // Timer state (seconds elapsed)
  const [timerRunning, setTimerRunning] = useState<boolean>(true);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  // Evaluation & Results
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [customKeyMode, setCustomKeyMode] = useState<boolean>(false);
  const [negativeMarking, setNegativeMarking] = useState<boolean>(false);

  // Generate deterministic Answer Key for practice (or customized)
  const answerKey = useMemo(() => {
    const key: Record<number, 'A' | 'B' | 'C' | 'D'> = {};
    const options: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    for (let i = 1; i <= 100; i++) {
      // Deterministic cycle for practice testing
      key[i] = options[(i * 7 + 3) % 4];
    }
    return key;
  }, []);

  // Timer tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerRunning && !isSubmitted) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, isSubmitted]);

  const handleSelectBubble = (qNum: number, opt: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted) return;
    setAnswers((prev) => {
      if (prev[qNum] === opt) {
        // Unselect if clicked again
        const copy = { ...prev };
        delete copy[qNum];
        return copy;
      }
      return { ...prev, [qNum]: opt };
    });
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetOMR = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    setAnswers({});
    setSecondsElapsed(0);
    setIsSubmitted(false);
    setTimerRunning(true);
    setShowResetConfirm(false);
  };

  const handleSubmitOMR = () => {
    setTimerRunning(false);
    setIsSubmitted(true);
  };

  // Evaluation calculation
  const evaluation = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let attempted = 0;

    for (let i = 1; i <= totalQuestionsCount; i++) {
      const userAns = answers[i];
      if (userAns) {
        attempted++;
        if (userAns === answerKey[i]) {
          correct++;
        } else {
          incorrect++;
        }
      }
    }

    const unattempted = totalQuestionsCount - attempted;
    const marksPerCorrect = 1;
    const penalty = negativeMarking ? incorrect * 0.25 : 0;
    const finalScore = Math.max(0, correct * marksPerCorrect - penalty);
    const percentage = ((finalScore / totalQuestionsCount) * 100).toFixed(1);
    const accuracy = attempted > 0 ? ((correct / attempted) * 100).toFixed(1) : '0';
    const timePerQ = attempted > 0 ? (secondsElapsed / attempted).toFixed(1) : '0';

    return {
      attempted,
      unattempted,
      correct,
      incorrect,
      finalScore,
      percentage,
      accuracy,
      timePerQ
    };
  }, [answers, answerKey, totalQuestionsCount, negativeMarking, secondsElapsed]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 text-left">
      {/* Top Banner */}
      <div className="relative rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 shadow-xl border border-indigo-900/50 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-black">
              <FileText className="w-3.5 h-3.5" />
              <span>डिजिटल बोर्ड परीक्षा OMR शीट सिम्युलेटर</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              📝 डिजिटल OMR शीट प्रैक्टिस लैब (OMR Simulator)
            </h1>
            <p className="text-slate-300 text-sm sm:text-base font-medium">
              बिहार विद्यालय परीक्षा समिति (BSEB) एवं CBSE बोर्ड परीक्षा के वास्तविक पैटर्न पर आधारित 4-गोले (A, B, C, D) 
              वाली OMR शीट। समय प्रबंधन, सटीक बबल फिलिंग और तुरंत मूल्यांकन का अभ्यास करें!
            </p>
          </div>

          {/* Quick Header Config Controls */}
          <div className="flex flex-wrap items-center gap-2.5 bg-white/10 p-3 rounded-2xl border border-white/20">
            <div>
              <span className="text-2xs font-bold text-slate-300 block mb-1">प्रश्नों की संख्या:</span>
              <div className="flex gap-1">
                {[50, 75, 100].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      if (!isSubmitted) setTotalQuestionsCount(num as any);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      totalQuestionsCount === num
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-black/30 text-white hover:bg-black/50'
                    }`}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-2xs font-bold text-slate-300 block mb-1">प्रश्न पत्र सेट:</span>
              <select
                value={selectedSetCode}
                onChange={(e) => setSelectedSetCode(e.target.value)}
                className="bg-black/40 text-white text-xs font-bold px-2 py-1 rounded-lg border border-white/20"
              >
                {['Set-A', 'Set-B', 'Set-C', 'Set-D', 'Set-E', 'Set-F', 'Set-G', 'Set-H', 'Set-I', 'Set-J'].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar: Timer, Negative marking, Submit & Reset */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-slate-200 shadow-md p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-600">समय:</span>
            <span className="font-mono font-black text-sm text-blue-900 tabular-nums">
              {formatTimer(secondsElapsed)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span>हल किए गए:</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono font-black">
              {Object.keys(answers).length} / {totalQuestionsCount}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={negativeMarking}
              onChange={(e) => setNegativeMarking(e.target.checked)}
              className="accent-blue-600 rounded"
            />
            <span>नेगेटिव मार्किंग (0.25)</span>
          </label>

          <button
            onClick={handleResetOMR}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>रीसेट</span>
          </button>

          {!isSubmitted ? (
            <button
              onClick={handleSubmitOMR}
              className="px-6 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue-700/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>OMR शीट जमा करें (Evaluate)</span>
            </button>
          ) : (
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>रिजल्ट प्रिंट करें</span>
            </button>
          )}
        </div>
      </div>

      {/* Result Card if Submitted */}
      {isSubmitted && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-400 shadow-xl space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl">
                🏆
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  OMR मूल्यांकन स्कोरकार्ड (OMR Evaluation Result)
                </h2>
                <p className="text-xs text-slate-500 font-bold">
                  {selectedSetCode} • कुल {totalQuestionsCount} प्रश्न • समय: {formatTimer(secondsElapsed)}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-black text-emerald-600 font-mono">
                {evaluation.finalScore} / {totalQuestionsCount}
              </div>
              <div className="text-xs font-bold text-slate-500">
                प्राप्तांक ({evaluation.percentage}%)
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="text-2xl font-black text-emerald-700 font-mono">{evaluation.correct}</div>
              <div className="text-xs font-bold text-emerald-800 uppercase mt-1">सही उत्तर (Correct)</div>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
              <div className="text-2xl font-black text-rose-700 font-mono">{evaluation.incorrect}</div>
              <div className="text-xs font-bold text-rose-800 uppercase mt-1">गलत उत्तर (Wrong)</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-2xl font-black text-slate-700 font-mono">{evaluation.unattempted}</div>
              <div className="text-xs font-bold text-slate-600 uppercase mt-1">अनुत्तरित (Unattempted)</div>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <div className="text-2xl font-black text-blue-700 font-mono">{evaluation.accuracy}%</div>
              <div className="text-xs font-bold text-blue-800 uppercase mt-1">सटीकता (Accuracy)</div>
            </div>
          </div>
        </div>
      )}

      {/* Realistic OMR Sheet Container */}
      <div className="bg-amber-50/40 rounded-3xl p-6 sm:p-10 border-2 border-amber-300 shadow-xl space-y-6">
        {/* OMR Sheet Official Header */}
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-300 space-y-4 text-center">
          <div className="text-xs font-black text-slate-500 uppercase tracking-widest">
            BIHAR SCHOOL EXAMINATION BOARD / CBSE BOARD SIMULATION
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            वस्तुनिष्ठ प्रश्न उत्तर पत्रक (OBJECTIVE RESPONSE SHEET)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
              <span className="font-bold text-slate-500 block text-2xs">छात्र का नाम (Name):</span>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="अपना नाम लिखें..."
                className="w-full font-bold text-slate-800 bg-transparent focus:outline-hidden"
              />
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
              <span className="font-bold text-slate-500 block text-2xs">रोल कोड (Roll Code):</span>
              <input
                type="text"
                value={rollCode}
                onChange={(e) => setRollCode(e.target.value)}
                className="w-full font-bold font-mono text-slate-800 bg-transparent focus:outline-hidden"
              />
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
              <span className="font-bold text-slate-500 block text-2xs">रोल नंबर (Roll No.):</span>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full font-bold font-mono text-slate-800 bg-transparent focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Instructions Note */}
        <div className="text-2xs sm:text-xs text-slate-600 bg-white/80 p-3 rounded-xl border border-amber-200 flex items-center justify-between gap-2">
          <span>📌 निर्देश: प्रत्येक प्रश्न के सही विकल्प वाले गोले (Bubble) पर क्लिक करके उसे पूरी तरह भरें।</span>
          <span className="font-bold text-slate-800 shrink-0">सेट कोड: {selectedSetCode}</span>
        </div>

        {/* 4-Column Bubble Matrix Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: Math.ceil(totalQuestionsCount / 25) }).map((_, colIdx) => {
            const startQ = colIdx * 25 + 1;
            const endQ = Math.min((colIdx + 1) * 25, totalQuestionsCount);
            const questionNumbers = [];
            for (let q = startQ; q <= endQ; q++) {
              questionNumbers.push(q);
            }

            return (
              <div
                key={colIdx}
                className="bg-white rounded-2xl p-4 border border-slate-300 shadow-xs divide-y divide-slate-100"
              >
                <div className="pb-2 text-center text-xs font-black text-slate-500 uppercase">
                  प्रश्न {startQ} से {endQ}
                </div>
                {questionNumbers.map((qNum) => {
                  const selectedOpt = answers[qNum];
                  const correctOpt = answerKey[qNum];
                  const isCorrect = isSubmitted && selectedOpt === correctOpt;
                  const isWrong = isSubmitted && selectedOpt && selectedOpt !== correctOpt;

                  return (
                    <div
                      key={qNum}
                      className={`py-2 px-1 flex items-center justify-between gap-1 transition-colors ${
                        isSubmitted
                          ? isCorrect
                            ? 'bg-emerald-50/70'
                            : isWrong
                            ? 'bg-rose-50/70'
                            : ''
                          : selectedOpt
                          ? 'bg-blue-50/40'
                          : ''
                      }`}
                    >
                      <span className="w-7 text-xs font-black font-mono text-slate-700 text-right pr-1">
                        {qNum.toString().padStart(2, '0')}.
                      </span>

                      <div className="flex items-center gap-1.5 grow justify-center">
                        {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                          const isFilled = selectedOpt === opt;
                          const isThisCorrect = isSubmitted && correctOpt === opt;

                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleSelectBubble(qNum, opt)}
                              disabled={isSubmitted}
                              className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center border-2 transition-all cursor-pointer ${
                                isFilled
                                  ? isSubmitted
                                    ? isCorrect
                                      ? 'bg-emerald-700 border-emerald-800 text-white shadow-inner scale-105'
                                      : 'bg-rose-700 border-rose-800 text-white shadow-inner scale-105'
                                    : 'bg-slate-900 border-slate-950 text-white shadow-inner scale-105 ring-2 ring-blue-400'
                                  : isThisCorrect
                                  ? 'bg-emerald-100 border-emerald-500 text-emerald-800 ring-2 ring-emerald-400 animate-pulse'
                                  : 'bg-white border-slate-400 text-slate-700 hover:border-slate-800 hover:bg-slate-50'
                              }`}
                              title={`Question ${qNum} Option ${opt}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {/* Status indicator on submit */}
                      {isSubmitted && (
                        <span className="w-5 text-center text-xs">
                          {isCorrect ? (
                            <span className="text-emerald-600 font-bold">✓</span>
                          ) : isWrong ? (
                            <span className="text-rose-600 font-bold">✗</span>
                          ) : (
                            <span className="text-slate-300 font-bold">-</span>
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset OMR Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleConfirmReset}
        title="OMR शीट रीसेट करें (Reset OMR)"
        message="क्या आप OMR शीट को पूरी तरह रीसेट करना चाहते हैं? भरे गए सभी गोले एवं टाइमर रीसेट हो जाएंगे।"
        confirmText="हाँ, रीसेट करें (Reset)"
        cancelText="रद्द करें"
        variant="warning"
      />
    </div>
  );
}
