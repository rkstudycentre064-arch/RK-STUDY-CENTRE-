/**
 * RK STUDY CENTRE - My Progress Dashboard (मेरी प्रगति)
 * 
 * Displays:
 * 1. Completed Chapters (with direct read/review and test shortcuts)
 * 2. Pending & Recommended Tests (with 1-click test launcher)
 * 3. Overall Performance Statistics (scores, accuracy, subject meters, streak)
 * 4. Recent Test Submissions History with detailed scorecards
 */

import { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  ChevronRight,
  RotateCcw,
  Printer,
  Compass,
  Check,
  Play,
  Zap,
  Target,
  Trophy,
  Crown,
} from 'lucide-react';
import type {
  ClassLevel,
  MainNavRoute,
  Subject,
  Chapter,
  TestItem,
  ChapterProgressRecord,
  StoredTestResult,
  StudentProgressStats,
} from '../types';
import { useAuth } from '../context/AuthContext';
import {
  CLASSES_METADATA,
  SUBJECTS,
  CHAPTERS,
} from '../lib/constants';
import {
  getCompletedChapters,
  toggleChapterCompletion,
  getAllTestResults,
  getPendingTests,
  getOverallPerformanceStats,
  PROGRESS_UPDATED_EVENT,
  getStudyStreak,
} from '../services/progressService';
import { calculateStudentBadges } from '../services/badgeService';
import { BackButton } from '../components/BackButton';
import { PerformanceSummaryGraph } from '../components/progress/PerformanceSummaryGraph';
import { D3SubjectScoreLineChart } from '../components/progress/D3SubjectScoreLineChart';
import { BadgesViewSection } from '../components/progress/BadgesViewSection';
import { BadgesOverviewShowcase } from '../components/progress/BadgesOverviewShowcase';

interface MyProgressViewProps {
  onNavigate: (
    route: MainNavRoute,
    params?: {
      classLevel?: ClassLevel;
      subjectSlug?: string;
      bookSlug?: string;
      chapterSlug?: string;
    }
  ) => void;
  initialClass?: ClassLevel;
}

type ActiveTab = 'overview' | 'completed-chapters' | 'pending-tests' | 'history' | 'badges';

export function MyProgressView({ onNavigate, initialClass }: MyProgressViewProps) {
  const { user, profile } = useAuth();

  // Selected class (defaults to student's profile class or Class 10)
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(
    initialClass || profile?.classLevel || 'class-10'
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Core data states
  const [completedChapters, setCompletedChapters] = useState<ChapterProgressRecord[]>([]);
  const [pendingTests, setPendingTests] = useState<TestItem[]>([]);
  const [allClassTests, setAllClassTests] = useState<TestItem[]>([]);
  const [testResults, setTestResults] = useState<StoredTestResult[]>([]);
  const [stats, setStats] = useState<StudentProgressStats | null>(null);
  const [subjectBreakdown, setSubjectBreakdown] = useState<
    Array<{
      subject: Subject;
      totalChapters: number;
      completedChapters: number;
      totalTests: number;
      passedTests: number;
      averageScore: number;
      completionPercent: number;
    }>
  >([]);

  // Filters
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickChecklistOpen, setIsQuickChecklistOpen] = useState(false);

  const currentClassMeta = useMemo(() => {
    return CLASSES_METADATA.find((c) => c.id === selectedClass) || CLASSES_METADATA[1];
  }, [selectedClass]);

  const classSubjects = useMemo(() => {
    return SUBJECTS.filter((s) => s.classLevel === selectedClass);
  }, [selectedClass]);

  const classChapters = useMemo(() => {
    return CHAPTERS.filter((c) => c.classLevel === selectedClass);
  }, [selectedClass]);

  // Load progress data for selected class
  const loadData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    try {
      const [completed, pendingData, analytics, results] = await Promise.all([
        getCompletedChapters(selectedClass),
        getPendingTests(selectedClass),
        getOverallPerformanceStats(selectedClass),
        getAllTestResults(),
      ]);

      setCompletedChapters(completed);
      setPendingTests(pendingData.pendingTests);
      setAllClassTests(pendingData.allTests);
      setStats(analytics.stats);
      setSubjectBreakdown(analytics.subjectBreakdown);
      setTestResults(results.filter((r) => r.classLevel === selectedClass || !r.classLevel));
    } catch (err) {
      console.error('[MyProgressView] Error loading data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to real-time updates triggered when chapters or tests change
    const handleProgressEvent = () => {
      loadData();
    };

    window.addEventListener(PROGRESS_UPDATED_EVENT, handleProgressEvent);
    return () => {
      window.removeEventListener(PROGRESS_UPDATED_EVENT, handleProgressEvent);
    };
  }, [selectedClass]);

  // Handle toggling chapter completion
  const handleToggleChapter = async (chapter: Chapter) => {
    const subject = SUBJECTS.find((s) => s.id === chapter.subjectId);
    const { updatedList } = await toggleChapterCompletion(chapter, selectedClass, subject);
    setCompletedChapters(updatedList.filter((c) => c.classLevel === selectedClass));
    // refresh stats
    const analytics = await getOverallPerformanceStats(selectedClass);
    setStats(analytics.stats);
    setSubjectBreakdown(analytics.subjectBreakdown);
  };

  // Filtered completed chapters
  const filteredCompletedChapters = useMemo(() => {
    return completedChapters.filter((c) => {
      const matchesSubject = selectedSubjectFilter === 'all' || c.subjectId === selectedSubjectFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        c.chapterTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.hindiTitle && c.hindiTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.subjectName && c.subjectName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSubject && matchesSearch;
    });
  }, [completedChapters, selectedSubjectFilter, searchQuery]);

  // Filtered pending tests
  const filteredPendingTests = useMemo(() => {
    return pendingTests.filter((t) => {
      const matchesSubject = selectedSubjectFilter === 'all' || t.subjectId === selectedSubjectFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.subjectName && t.subjectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.chapterTitle && t.chapterTitle.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSubject && matchesSearch;
    });
  }, [pendingTests, selectedSubjectFilter, searchQuery]);

  // Launch test directly
  const handleStartTest = (test: TestItem) => {
    window.location.hash = `tests/${test.classLevel}/${test.subjectId}/${test.bookId}/${test.chapterId}/test/${test.id}`;
    onNavigate('tests', {
      classLevel: test.classLevel,
      subjectSlug: test.subjectId,
      bookSlug: test.bookId,
      chapterSlug: test.chapterId,
    });
  };

  // Launch chapter study notes directly
  const handleOpenChapter = (chapterId: string) => {
    const matched = CHAPTERS.find((c) => c.id === chapterId);
    if (matched) {
      onNavigate('classes', {
        classLevel: matched.classLevel,
        subjectSlug: matched.subjectId,
        bookSlug: matched.bookId,
        chapterSlug: matched.slug,
      });
    } else {
      onNavigate('classes', { classLevel: selectedClass });
    }
  };

  const streak = getStudyStreak();

  // Dynamic Badges & Digital Achievements calculation
  const badgesSummary = useMemo(() => {
    return calculateStudentBadges(completedChapters, testResults, streak.streakCount);
  }, [completedChapters, testResults, streak.streakCount]);

  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6">
      {/* Top Bar with Back Button & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <BackButton
          label="मुख्य पृष्ठ पर वापस जाएं"
          fallbackRoute="home"
          onNavigate={onNavigate}
        />

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>डेटा रिफ्रेश</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-2xs transition-colors"
            title="प्रगति रिपोर्ट प्रिंट करें"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>प्रिंट रिपोर्ट</span>
          </button>
        </div>
      </div>

      {/* Main Student Header Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-blue-900/40 shadow-xl space-y-6 relative overflow-hidden">
        {/* Subtle background ambient graphic */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>व्यक्तिगत अध्ययन ट्रैकर (Student Tracker)</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{streak.streakCount} दिन निरंतर अध्ययन (Daily Streak)</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('badges')}
                className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5 cursor-pointer hover:bg-amber-400/30 transition-colors"
                title="सभी डिजिटल बैज देखें"
              >
                <Trophy className="w-3.5 h-3.5 fill-current" />
                <span>स्तर {badgesSummary.level.levelNumber} • {badgesSummary.unlockedCount} बैज अनलॉक ({badgesSummary.totalPointsEarned} XP)</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              मेरी प्रगति (My Progress Dashboard)
            </h1>

            <p className="text-blue-200 text-sm sm:text-base font-medium leading-relaxed">
              {user ? (
                <>नमस्ते, <strong className="text-white font-bold">{user.displayName || 'विद्यार्थी'}</strong>! अपने पूर्ण किए गए अध्यायों, आगामी टेस्टों और तैयारी के समग्र प्रदर्शन की दैनिक समीक्षा करें।</>
              ) : (
                <>कक्षावार पूर्ण किए गए अध्याय, शेष टेस्ट और अपने प्रदर्शन का संपूर्ण रिपोर्ट कार्ड देखें।</>
              )}
            </p>
          </div>

          {/* Quick Summary Pill on Header */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 shrink-0 flex items-center gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-300">
                {stats ? stats.completedChaptersCount : completedChapters.length}
              </div>
              <div className="text-2xs sm:text-xs font-bold text-blue-200 uppercase tracking-wider mt-0.5">
                अध्याय पूर्ण
              </div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-300">
                {stats ? stats.passedTestsCount : 0}
              </div>
              <div className="text-2xs sm:text-xs font-bold text-blue-200 uppercase tracking-wider mt-0.5">
                टेस्ट उत्तीर्ण
              </div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-blue-300">
                {stats ? `${stats.averageScorePercent}%` : '0%'}
              </div>
              <div className="text-2xs sm:text-xs font-bold text-blue-200 uppercase tracking-wider mt-0.5">
                औसत अंक
              </div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <button
              type="button"
              onClick={() => setActiveTab('badges')}
              className="text-center group cursor-pointer"
              title="सभी डिजिटल बैज देखें"
            >
              <div className="text-2xl sm:text-3xl font-black text-amber-300 group-hover:scale-110 transition-transform flex items-center justify-center gap-1">
                <span>{badgesSummary.unlockedCount}</span>
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-current" />
              </div>
              <div className="text-2xs sm:text-xs font-bold text-amber-200 uppercase tracking-wider mt-0.5">
                बैज अनलॉक
              </div>
            </button>
          </div>
        </div>

        {/* Class Selection Tabs */}
        <div className="pt-4 border-t border-white/15 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-bold text-blue-200 uppercase mr-1 hidden sm:inline">
              कक्षा चुनें:
            </span>
            {(['class-9', 'class-10', 'class-11', 'class-12'] as ClassLevel[]).map((cls) => {
              const meta = CLASSES_METADATA.find((c) => c.id === cls);
              const isSelected = selectedClass === cls;
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'bg-white/10 text-blue-200 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {meta?.hindiName || cls}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-blue-300 font-semibold">
            बोर्ड: <span className="text-white font-bold">{profile?.board || 'बिहार बोर्ड (BSEB)'}</span>
          </div>
        </div>
      </div>

      {/* 4 Primary Bento Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Chapter Completion */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-700 uppercase tracking-wider">
                पाठ्यक्रम प्रगति
              </span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900">
                {stats.completedChaptersCount}{' '}
                <span className="text-lg font-bold text-slate-400">/ {stats.totalChapters}</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-600 mt-0.5">
                अध्याय पूर्ण ({stats.chapterCompletionPercent}%)
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.chapterCompletionPercent}%` }}
              />
            </div>
          </div>

          {/* Card 2: Tests Completion */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">
                ऑनलाइन टेस्ट
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900">
                {stats.passedTestsCount}{' '}
                <span className="text-lg font-bold text-slate-400">/ {stats.totalAvailableTests}</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-600 mt-0.5">
                टेस्ट उत्तीर्ण ({stats.testCompletionPercent}%)
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.testCompletionPercent}%` }}
              />
            </div>
          </div>

          {/* Card 3: Average Score */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-700 uppercase tracking-wider">
                औसत प्रदर्शन
              </span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900">
                {stats.averageScorePercent}%
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-600 mt-0.5">
                औसत अंक प्रतिशत
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.averageScorePercent}%` }}
              />
            </div>
          </div>

          {/* Card 4: Accuracy & Questions */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
                सटीकता (Accuracy)
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900">
                {stats.overallAccuracyPercent}%
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-600 mt-0.5">
                {stats.correctQuestionsCount} / {stats.totalQuestionsAnswered} सही प्रश्न
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.overallAccuracyPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-sm sm:text-base font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-blue-50 text-blue-800 border-2 border-blue-600/30 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>समग्र अवलोकन (Overview)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed-chapters')}
          className={`px-4 py-2.5 rounded-xl text-sm sm:text-base font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'completed-chapters'
              ? 'bg-blue-50 text-blue-800 border-2 border-blue-600/30 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>पूर्ण किए गए अध्याय ({completedChapters.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending-tests')}
          className={`px-4 py-2.5 rounded-xl text-sm sm:text-base font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'pending-tests'
              ? 'bg-blue-50 text-blue-800 border-2 border-blue-600/30 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          <span>लंबित टेस्ट ({pendingTests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 rounded-xl text-sm sm:text-base font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-blue-50 text-blue-800 border-2 border-blue-600/30 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <RotateCcw className="w-4 h-4 text-indigo-600" />
          <span>टेस्ट परिणाम इतिहास ({testResults.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2.5 rounded-xl text-sm sm:text-base font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'badges'
              ? 'bg-blue-50 text-blue-800 border-2 border-blue-600/30 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500 fill-current" />
          <span>उपलब्धियां एवं बैज ({badgesSummary.unlockedCount}/{badgesSummary.totalCount})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & SUBJECT PERFORMANCE METERS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Interactive D3.js Subject Score & Improvement Trajectory Line Chart */}
          <D3SubjectScoreLineChart
            testResults={testResults}
            selectedClass={selectedClass}
            subjects={classSubjects}
            onTakeTest={() => {
              if (pendingTests[0]) {
                handleStartTest(pendingTests[0]);
              } else {
                onNavigate('tests', { classLevel: selectedClass });
              }
            }}
          />

          {/* Visual Performance Summary Graph (Recharts) */}
          <PerformanceSummaryGraph
            testResults={testResults}
            selectedClass={selectedClass}
            subjects={classSubjects}
            onTakeTest={() => {
              if (pendingTests[0]) {
                handleStartTest(pendingTests[0]);
              } else {
                onNavigate('tests', { classLevel: selectedClass });
              }
            }}
          />

          {/* Digital Badges & Achievements Overview Widget */}
          <BadgesOverviewShowcase
            summary={badgesSummary}
            onViewAllBadges={() => setActiveTab('badges')}
          />

          {/* Subject-Wise Mastery Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  विषयवार प्रगति एवं महारत (Subject-Wise Performance)
                </h2>
                <p className="text-slate-600 text-sm font-medium mt-0.5">
                  प्रत्येक विषय के पूर्ण अध्याय, टेस्ट स्कोर और समग्र तैयारी का प्रतिशत
                </p>
              </div>

              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                {currentClassMeta.hindiName} : कुल {subjectBreakdown.length} मुख्य विषय
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {(subjectBreakdown || []).map(({ subject, totalChapters, completedChapters, totalTests, passedTests, averageScore, completionPercent }) => (
                <div
                  key={subject.id}
                  className="p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        {subject.hindiName} ({subject.name})
                      </h3>
                      <div className="text-xs font-bold text-slate-500 mt-0.5">
                        {completedChapters} / {totalChapters} अध्याय पूर्ण • {passedTests} / {totalTests} टेस्ट उत्तीर्ण
                      </div>
                    </div>
                    <span className="text-sm font-black px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900">
                      {completionPercent}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 pt-1">
                    <span>औसत टेस्ट प्राप्तांक: <strong className="text-slate-900 font-bold">{averageScore}%</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate('classes', {
                          classLevel: selectedClass,
                          subjectSlug: subject.slug,
                        });
                      }}
                      className="text-blue-700 hover:text-blue-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>पाठ्यक्रम देखें</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Bento: Next Pending Test & Recent Chapter */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Action 1: Next Recommended Test */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-7 shadow-md space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-amber-400 text-slate-950 uppercase">
                    अनुशंसित टेस्ट
                  </span>
                  <span className="text-xs text-blue-200 font-bold">
                    {pendingTests.length} टेस्ट शेष
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">
                  {pendingTests[0] ? pendingTests[0].title : 'सभी उपलब्ध टेस्ट पूर्ण हो चुके हैं!'}
                </h3>
                <p className="text-blue-200 text-xs sm:text-sm font-medium">
                  {pendingTests[0]
                    ? `समय: ${pendingTests[0].durationMinutes} मिनट • कुल प्रश्न: ${pendingTests[0].totalQuestions} • उत्तीर्णांक: ${pendingTests[0].passingMarks} अंक`
                    : 'शानदार! आपने इस कक्षा के सभी टेस्ट सफलतापूर्वक पूरे कर लिए हैं।'}
                </p>
              </div>

              {pendingTests[0] ? (
                <button
                  type="button"
                  onClick={() => handleStartTest(pendingTests[0])}
                  className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 self-start"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>यह टेस्ट अभी शुरू करें</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className="px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-sm transition-all cursor-pointer flex items-center justify-center gap-2 self-start"
                >
                  <span>पिछले परिणाम देखें</span>
                </button>
              )}
            </div>

            {/* Action 2: Quick Checklist of All Chapters */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-emerald-100 text-emerald-800 uppercase">
                    त्वरित अध्याय चेकलिस्ट
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    {completedChapters.length} / {classChapters.length} पूर्ण
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  क्या आपने कोई नया अध्याय पढ़ लिया है?
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">
                  अपनी चेकलिस्ट खोलकर सीधे अध्याय को "पूर्ण" चिह्नित करें ताकि आपका प्रोग्रेस प्रतिशत हमेशा सटीक रहे।
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsQuickChecklistOpen(true)}
                className="px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 self-start"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>अध्याय चेकलिस्ट खोलें</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPLETED CHAPTERS */}
      {activeTab === 'completed-chapters' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-slate-500 uppercase shrink-0">
                विषय चुनें:
              </span>
              <button
                type="button"
                onClick={() => setSelectedSubjectFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedSubjectFilter === 'all'
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                सभी विषय ({completedChapters.length})
              </button>
              {(classSubjects || []).map((sub) => {
                const count = completedChapters.filter((c) => c.subjectId === sub.id).length;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedSubjectFilter(sub.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                      selectedSubjectFilter === sub.id
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {sub.hindiName} ({count})
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsQuickChecklistOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ नए अध्याय जोड़ें</span>
            </button>
          </div>

          {/* Chapters List */}
          {filteredCompletedChapters.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-14 border-2 border-slate-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {selectedSubjectFilter === 'all'
                  ? 'अभी तक कोई अध्याय पूर्ण चिह्नित नहीं है'
                  : 'इस विषय में कोई पूर्ण अध्याय नहीं है'}
              </h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                जब आप किसी अध्याय के नोट्स पढ़ते हैं, तो उसे यहाँ "पूर्ण" चिह्नित करें। इससे आपकी प्रगति हमेशा सुरक्षित रहेगी।
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickChecklistOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-black cursor-pointer shadow-md"
                >
                  चेकलिस्ट से चिह्नित करें
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('classes', { classLevel: selectedClass })}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold cursor-pointer"
                >
                  पाठ्यक्रम खोलें
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(filteredCompletedChapters || []).map((record) => {
                const matchedChapter = CHAPTERS.find((c) => c.id === record.chapterId);
                return (
                  <div
                    key={record.chapterId}
                    className="bg-white rounded-2xl p-5 border-2 border-slate-200 hover:border-blue-400 shadow-2xs transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 uppercase">
                          {record.subjectName || 'विषय'}
                        </span>
                        <span className="text-2xs font-semibold text-slate-400">
                          {record.completedAt ? new Date(record.completedAt).toLocaleDateString('hi-IN') : 'पूर्ण'}
                        </span>
                      </div>

                      <h4 className="text-lg font-black text-slate-900">
                        {record.hindiTitle || record.chapterTitle}
                      </h4>
                      <p className="text-xs font-bold text-slate-500">
                        {record.chapterTitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenChapter(record.chapterId)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-black transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>नोट्स पढ़ें</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (matchedChapter) {
                              onNavigate('tests', {
                                classLevel: matchedChapter.classLevel,
                                subjectSlug: matchedChapter.subjectId,
                                bookSlug: matchedChapter.bookId,
                                chapterSlug: matchedChapter.slug,
                              });
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-black transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>टेस्ट दें</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (matchedChapter) handleToggleChapter(matchedChapter);
                        }}
                        className="text-xs text-slate-400 hover:text-rose-600 font-bold hover:underline cursor-pointer"
                        title="अपूर्ण चिह्नित करें"
                      >
                        हटाएं
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PENDING TESTS */}
      {activeTab === 'pending-tests' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-slate-500 uppercase shrink-0">
                विषय चुनें:
              </span>
              <button
                type="button"
                onClick={() => setSelectedSubjectFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedSubjectFilter === 'all'
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                सभी लंबित टेस्ट ({pendingTests.length})
              </button>
              {(classSubjects || []).map((sub) => {
                const count = pendingTests.filter((t) => t.subjectId === sub.id).length;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedSubjectFilter(sub.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                      selectedSubjectFilter === sub.id
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {sub.hindiName} ({count})
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-bold text-slate-500">
              कुल शेष टेस्ट: <strong className="text-slate-900">{filteredPendingTests.length}</strong>
            </div>
          </div>

          {/* Pending Tests Grid */}
          {filteredPendingTests.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-14 border-2 border-slate-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                🎉 बधाई हो! सभी टेस्ट पूर्ण हैं!
              </h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                आपने इस चयनित वर्ग के सभी उपलब्ध टेस्ट सफलतापूर्वक उत्तीर्ण कर लिए हैं।
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-black cursor-pointer shadow-md"
              >
                सभी परिणाम देखें
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {(filteredPendingTests || []).map((test) => (
                <div
                  key={test.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-slate-200 hover:border-blue-400 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 uppercase">
                        लंबित (Pending)
                      </span>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800">
                        {test.subjectName || test.subjectId}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {test.durationMinutes > 0 ? `${test.durationMinutes} मिनट` : 'नो टाइम लिमिट'}
                      </span>
                    </div>

                    <h4 className="text-lg font-black text-slate-900 leading-snug">
                      {test.title}
                    </h4>

                    {test.description && (
                      <p className="text-xs text-slate-600 font-medium line-clamp-2">
                        {test.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-600 font-bold">
                      <span>{test.totalQuestions} प्रश्न</span> • <span>{test.totalMarks} कुल अंक</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartTest(test)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>टेस्ट शुरू करें</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TEST RESULTS HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-2xs flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              पूर्व में दिए गए टेस्टों का इतिहास ({testResults.length})
            </h3>
            <span className="text-xs font-bold text-slate-500">
              नवीनतम टेस्ट शीर्ष पर
            </span>
          </div>

          {testResults.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-14 border-2 border-slate-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <RotateCcw className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                अभी कोई टेस्ट इतिहास उपलब्ध नहीं है
              </h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                जब आप कोई ऑनलाइन टेस्ट पूरा करेंगे, उसका विस्तृत परिणाम कार्ड यहाँ स्वतः सहेजा जाएगा।
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('pending-tests')}
                className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-black cursor-pointer shadow-md"
              >
                लंबित टेस्ट देखें
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <PerformanceSummaryGraph
                testResults={testResults}
                selectedClass={selectedClass}
                subjects={classSubjects}
                onTakeTest={() => {
                  if (pendingTests[0]) {
                    handleStartTest(pendingTests[0]);
                  } else {
                    onNavigate('tests', { classLevel: selectedClass });
                  }
                }}
              />

              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider px-1">
                  व्यक्तिगत टेस्ट कार्ड विवरण ({testResults.length})
                </h4>
                {(testResults || []).map((result) => {
                const percent = result.totalMarks > 0 ? Math.round((result.score / result.totalMarks) * 100) : 0;
                const isPassed = result.passed !== undefined ? result.passed : percent >= 40;

                return (
                  <div
                    key={result.id}
                    className="bg-white rounded-2xl p-5 border-2 border-slate-200 hover:border-slate-300 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-black px-2.5 py-0.5 rounded-md ${
                            isPassed ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {isPassed ? '✓ उत्तीर्ण (Passed)' : '✗ पुनः प्रयास आवश्यक'}
                        </span>
                        {result.subjectName && (
                          <span className="text-xs font-bold text-slate-500">
                            {result.subjectName}
                          </span>
                        )}
                        <span className="text-2xs text-slate-400">
                          {result.completedAt ? new Date(result.completedAt).toLocaleString('hi-IN') : ''}
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-black text-slate-900">
                        {result.testTitle || 'ऑनलाइन टेस्ट'}
                      </h4>

                      <div className="flex items-center gap-3 text-xs font-bold text-slate-600 flex-wrap">
                        <span>सही उत्तर: <strong className="text-emerald-700">{result.correctAnswers}</strong></span>
                        <span>गलत उत्तर: <strong className="text-rose-700">{result.incorrectAnswers}</strong></span>
                        <span>अनुत्तरित: <strong className="text-slate-500">{result.unattempted}</strong></span>
                        {result.timeTakenMinutes > 0 && (
                          <span>समय: <strong className="text-slate-800">{Math.round(result.timeTakenMinutes)} मिनट</strong></span>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <div className="text-right">
                        <div className={`text-2xl font-black ${isPassed ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {result.score} <span className="text-sm font-bold text-slate-400">/ {result.totalMarks}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-500">
                          प्राप्तांक: {percent}%
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          window.location.hash = `tests/result/${result.id}`;
                          onNavigate('tests');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                      >
                        परिणाम कार्ड देखें →
                      </button>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: DIGITAL ACHIEVEMENTS & BADGES */}
      {activeTab === 'badges' && (
        <BadgesViewSection
          summary={badgesSummary}
          onExploreChapters={() => setActiveTab('completed-chapters')}
          onTakeTest={() => {
            if (pendingTests[0]) {
              handleStartTest(pendingTests[0]);
            } else {
              setActiveTab('pending-tests');
            }
          }}
        />
      )}

      {/* QUICK CHECKLIST MODAL (To easily mark chapters as completed) */}
      {isQuickChecklistOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border-2 border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {currentClassMeta.hindiName} : त्वरित अध्याय चेकलिस्ट
                </h3>
                <p className="text-xs sm:text-sm font-bold text-slate-500">
                  जिन अध्यायों का अध्ययन पूर्ण हो चुका है, उन पर क्लिक करके टिक करें
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickChecklistOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Chapter Checklist by Subject */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
              {(classSubjects || []).map((sub) => {
                const subChapters = (classChapters || []).filter((c) => c.subjectId === sub.id);
                if (subChapters.length === 0) return null;

                return (
                  <div key={sub.id} className="space-y-2.5">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <span className="text-xs font-black text-blue-800 uppercase">
                        {sub.hindiName} ({sub.name})
                      </span>
                      <span className="text-2xs font-bold text-slate-400">
                        {subChapters.length} अध्याय
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {(subChapters || []).map((ch) => {
                        const isDone = completedChapters.some((c) => c.chapterId === ch.id);
                        return (
                          <div
                            key={ch.id}
                            onClick={() => handleToggleChapter(ch)}
                            className={`p-3 rounded-xl border-2 cursor-pointer flex items-center justify-between gap-3 transition-all ${
                              isDone
                                ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-bold'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                                  isDone ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300'
                                }`}
                              >
                                {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                              </div>
                              <div>
                                <div className="text-sm font-black leading-snug">
                                  अध्याय {ch.chapterNumber}: {ch.hindiTitle || ch.title}
                                </div>
                                <div className="text-2xs text-slate-500">
                                  {ch.title}
                                </div>
                              </div>
                            </div>

                            <span className="text-2xs font-bold uppercase shrink-0">
                              {isDone ? (
                                <span className="text-emerald-700">पूर्ण ✓</span>
                              ) : (
                                <span className="text-slate-400">अपूर्ण</span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                कुल पूर्ण: <strong className="text-emerald-700">{completedChapters.length}</strong> / {classChapters.length}
              </span>
              <button
                type="button"
                onClick={() => setIsQuickChecklistOpen(false)}
                className="px-6 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-sm cursor-pointer shadow-md"
              >
                पूर्ण करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
