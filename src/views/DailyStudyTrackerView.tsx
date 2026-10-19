import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Flame,
  Award,
  Calendar,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Target
} from 'lucide-react';
import type { MainNavRoute } from '../types';

interface StudyTask {
  id: string;
  title: string;
  subject: string;
  targetMinutes: number;
  completed: boolean;
  createdAt: string;
}

const DEFAULT_TASKS: StudyTask[] = [
  {
    id: 'task-1',
    title: 'भौतिकी अध्याय 1 & 2 के सभी सूत्र और नियम दोहराएं',
    subject: 'भौतिकी (Physics)',
    targetMinutes: 30,
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-2',
    title: 'गणित के 20 VVI वस्तुनिष्ठ प्रश्न और 2 दीर्घ उत्तरीय सवाल हल करें',
    subject: 'गणित (Maths)',
    targetMinutes: 45,
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-3',
    title: 'इतिहास/भूगोल के 50 VVI ऑब्जेक्टिव टेस्ट का अभ्यास करें',
    subject: 'सामाजिक विज्ञान (Social Science)',
    targetMinutes: 25,
    completed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-4',
    title: 'शाम को 1 फुल लेंथ मॉडल पेपर OMR शीट पर हल करें',
    subject: 'मॉडल पेपर (Mock Test)',
    targetMinutes: 60,
    completed: false,
    createdAt: new Date().toISOString()
  }
];

// Simple synthesized Web Audio chime
function playChime(type: 'start' | 'finish') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'start') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    }
  } catch (err) {
    // Audio synthesis not supported or blocked
  }
}

interface DailyStudyTrackerViewProps {
  onNavigate: (route: MainNavRoute) => void;
}

export function DailyStudyTrackerView({ onNavigate }: DailyStudyTrackerViewProps) {
  // Exam Countdown (Target: 15 Feb 2027)
  const targetExamDate = useMemo(() => new Date('2027-02-15T09:30:00'), []);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetExamDate.getTime() - now;
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetExamDate]);

  // Pomodoro Focus Timer State
  const [pomodoroMode, setPomodoroMode] = useState<'study' | 'break'>('study');
  const [pomodoroMinutes, setPomodoroMinutes] = useState<number>(25);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('rk_pomodoro_completed') || 0);
    } catch {
      return 0;
    }
  });

  // Daily Tasks State
  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    try {
      const saved = localStorage.getItem('rk_study_tasks');
      return saved ? JSON.parse(saved) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('गणित (Maths)');
  const [newTaskMinutes, setNewTaskMinutes] = useState(30);

  // Save tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rk_study_tasks', JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  // Pomodoro timer tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isTimerRunning && secondsRemaining === 0) {
      if (soundEnabled) playChime('finish');
      if (pomodoroMode === 'study') {
        const nextCount = completedSessionsCount + 1;
        setCompletedSessionsCount(nextCount);
        try {
          localStorage.setItem('rk_pomodoro_completed', String(nextCount));
        } catch {}
        setPomodoroMode('break');
        setSecondsRemaining(5 * 60);
      } else {
        setPomodoroMode('study');
        setSecondsRemaining(pomodoroMinutes * 60);
      }
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, secondsRemaining, pomodoroMode, pomodoroMinutes, completedSessionsCount, soundEnabled]);

  const handleStartTimer = () => {
    if (!isTimerRunning && soundEnabled) playChime('start');
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setSecondsRemaining(pomodoroMode === 'study' ? pomodoroMinutes * 60 : 5 * 60);
  };

  const handleSetStudyDuration = (mins: number) => {
    setIsTimerRunning(false);
    setPomodoroMinutes(mins);
    if (pomodoroMode === 'study') {
      setSecondsRemaining(mins * 60);
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: StudyTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      subject: newTaskSubject,
      targetMinutes: newTaskMinutes,
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Format timer display
  const minutesDisplay = Math.floor(secondsRemaining / 60)
    .toString()
    .padStart(2, '0');
  const secondsDisplay = (secondsRemaining % 60).toString().padStart(2, '0');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 text-left">
      {/* Top Banner & Exam Countdown */}
      <div className="relative rounded-3xl bg-linear-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-6 sm:p-10 shadow-xl border border-blue-900/50 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-black">
              <Target className="w-3.5 h-3.5" />
              <span>स्मार्ट डेली स्टडी ट्रैकर व पोमोडोरो फ़ोकस लैब</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              🎯 दैनिक अध्ययन लक्ष्य व फ़ोकस टाइमर
            </h1>
            <p className="text-slate-300 text-sm sm:text-base font-medium">
              टॉपर बनने का नियम है: 'हर दिन का एक निश्चित लक्ष्य और बिना भटके पढ़ाई'। अपने दैनिक लक्ष्यों को पूरा करें 
              और पोमोडोरो टाइमर के साथ अपनी एकाग्रता को 2 गुना बढ़ाएं।
            </p>
          </div>

          {/* Exam Countdown Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 text-center shrink-0 w-full lg:w-auto shadow-lg">
            <div className="text-xs font-black text-amber-300 uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>बोर्ड परीक्षा 2027 उलटी गिनती (Countdown)</span>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3 text-white">
              <div className="p-2.5 bg-black/40 rounded-xl border border-white/10 min-w-[60px]">
                <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300 tabular-nums">
                  {timeLeft.days}
                </div>
                <div className="text-3xs text-slate-300 font-bold uppercase">दिन (Days)</div>
              </div>
              <div className="p-2.5 bg-black/40 rounded-xl border border-white/10 min-w-[60px]">
                <div className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums">
                  {timeLeft.hours}
                </div>
                <div className="text-3xs text-slate-300 font-bold uppercase">घंटे</div>
              </div>
              <div className="p-2.5 bg-black/40 rounded-xl border border-white/10 min-w-[60px]">
                <div className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums">
                  {timeLeft.minutes}
                </div>
                <div className="text-3xs text-slate-300 font-bold uppercase">मिनट</div>
              </div>
              <div className="p-2.5 bg-black/40 rounded-xl border border-white/10 min-w-[60px]">
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tabular-nums">
                  {timeLeft.seconds}
                </div>
                <div className="text-3xs text-slate-300 font-bold uppercase">सेकंड</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Pomodoro Focus Timer (5 cols) & Daily Goals (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Pomodoro Focus Timer */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-md space-y-6 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-black text-slate-900">पोमोडोरो फ़ोकस टाइमर</h2>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                title={soundEnabled ? 'ध्वनि बंद करें' : 'ध्वनि चालू करें'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </button>
            </div>

            {/* Mode Switch: Study vs Break */}
            <div className="flex items-center justify-center p-1 bg-slate-100 rounded-2xl max-w-xs mx-auto">
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setPomodoroMode('study');
                  setSecondsRemaining(pomodoroMinutes * 60);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  pomodoroMode === 'study' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📚 पढ़ाई मोड (Study)
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setPomodoroMode('break');
                  setSecondsRemaining(5 * 60);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  pomodoroMode === 'break' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ☕ आराम ब्रेक (5 Min)
              </button>
            </div>

            {/* Big Timer Circle */}
            <div className="py-6 flex flex-col items-center justify-center">
              <div
                className={`w-60 h-60 rounded-full flex flex-col items-center justify-center border-8 shadow-inner transition-colors duration-500 ${
                  pomodoroMode === 'study'
                    ? isTimerRunning
                      ? 'border-blue-600 bg-blue-50/50 text-blue-950'
                      : 'border-blue-200 bg-slate-50 text-slate-800'
                    : 'border-emerald-500 bg-emerald-50/60 text-emerald-950'
                }`}
              >
                <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight tabular-nums">
                  {minutesDisplay}:{secondsDisplay}
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase mt-2">
                  {pomodoroMode === 'study' ? (isTimerRunning ? '🔥 पूर्ण ध्यान केंद्रित' : 'तैयार रहें') : '☕ 5 मिनट का ब्रेक लें'}
                </div>
              </div>
            </div>

            {/* Quick Time Selector for Study */}
            {pomodoroMode === 'study' && (
              <div className="flex items-center justify-center gap-2">
                {[15, 25, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleSetStudyDuration(mins)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                      pomodoroMinutes === mins
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {mins} मिनट
                  </button>
                ))}
              </div>
            )}

            {/* Controls: Start / Pause / Reset */}
            <div className="flex items-center justify-center gap-3 pt-2">
              {!isTimerRunning ? (
                <button
                  onClick={handleStartTimer}
                  className="px-8 py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-black text-base shadow-lg shadow-blue-700/25 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>शुरू करें (Start)</span>
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-base shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Pause className="w-5 h-5 fill-current" />
                  <span>रोकें (Pause)</span>
                </button>
              )}

              <button
                onClick={handleResetTimer}
                className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
                title="रीसेट करें"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Streak & Stats */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-around text-xs">
              <div>
                <div className="text-xl font-black text-blue-700 font-mono">{completedSessionsCount}</div>
                <div className="text-3xs text-slate-500 font-bold uppercase">पूर्ण सेशन्स</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <div className="text-xl font-black text-emerald-600 font-mono">{completedSessionsCount * 25} Min</div>
                <div className="text-3xs text-slate-500 font-bold uppercase">कुल अध्ययन समय</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Daily Targets Checklist */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-md space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  आज के अध्ययन लक्ष्य (Daily Goals Checklist)
                </h2>
                <p className="text-xs text-slate-500 font-semibold">
                  {completedCount} of {tasks.length} लक्ष्य पूर्ण ({progressPercent}%)
                </p>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800">
                  {progressPercent === 100 ? '🎉 सभी लक्ष्य पूर्ण!' : '🎯 प्रगति पर'}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Add New Task Form */}
            <form onSubmit={handleAddTask} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-black text-slate-700">नया लक्ष्य जोड़ें:</div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="उदा: भौतिकी Ch-1 के 30 वस्तुनिष्ठ प्रश्न हल करना..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 bg-white focus:outline-hidden focus:border-blue-500"
                />
                <select
                  value={newTaskSubject}
                  onChange={(e) => setNewTaskSubject(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                >
                  <option>गणित (Maths)</option>
                  <option>भौतिकी (Physics)</option>
                  <option>रसायन (Chemistry)</option>
                  <option>जीव विज्ञान (Biology)</option>
                  <option>सामाजिक विज्ञान (Social Science)</option>
                  <option>हिंदी / संस्कृत</option>
                  <option>मॉडल पेपर (Mock Test)</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>जोड़ें</span>
                </button>
              </div>
            </form>

            {/* Tasks List */}
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm font-bold">
                  कोई लक्ष्य नहीं है। ऊपर से आज का नया लक्ष्य जोड़ें!
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`p-4 rounded-2xl border-2 transition-all flex items-start justify-between gap-3 cursor-pointer ${
                      task.completed
                        ? 'bg-emerald-50/50 border-emerald-200 text-slate-500'
                        : 'bg-white border-slate-200 hover:border-blue-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3 grow">
                      <button
                        type="button"
                        className="mt-0.5 shrink-0 text-blue-600 focus:outline-hidden"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400 hover:text-blue-600" />
                        )}
                      </button>
                      <div className="space-y-1">
                        <p
                          className={`text-sm font-bold leading-snug ${
                            task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-2xs font-semibold text-slate-500">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                            {task.subject}
                          </span>
                          <span>• {task.targetMinutes} मिनट लक्ष्य</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Quick Links */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => onNavigate('tests')}
                className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>लाइव टेस्ट सेक्शन में जाएं</span>
              </button>
              <button
                onClick={() => onNavigate('study-material')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>हस्तलिखित नोट्स पढ़ें</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
