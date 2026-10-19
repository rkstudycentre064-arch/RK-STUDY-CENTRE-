import React, { useState, useMemo } from 'react';
import {
  Award,
  Trophy,
  BookOpen,
  Crown,
  CheckCircle2,
  ShieldCheck,
  Medal,
  TrendingUp,
  Star,
  Sparkles,
  Target,
  Zap,
  Flame,
  GraduationCap,
  Compass,
  Lock,
  Check,
  ChevronRight,
  Filter,
  X,
  Share2,
} from 'lucide-react';
import type { BadgeAchievement, BadgeCategory, BadgeRarity, StudentBadgesSummary } from '../../types';

interface BadgesViewSectionProps {
  summary: StudentBadgesSummary;
  onExploreChapters?: () => void;
  onTakeTest?: () => void;
}

// Icon mapper
function renderBadgeIcon(iconName: string, className = 'w-6 h-6') {
  switch (iconName) {
    case 'BookOpen': return <BookOpen className={className} />;
    case 'Compass': return <Compass className={className} />;
    case 'Award': return <Award className={className} />;
    case 'Crown': return <Crown className={className} />;
    case 'CheckCircle2': return <CheckCircle2 className={className} />;
    case 'ShieldCheck': return <ShieldCheck className={className} />;
    case 'Medal': return <Medal className={className} />;
    case 'TrendingUp': return <TrendingUp className={className} />;
    case 'Star': return <Star className={className} />;
    case 'Trophy': return <Trophy className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Target': return <Target className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'GraduationCap': return <GraduationCap className={className} />;
    default: return <Award className={className} />;
  }
}

// Visual styling configurations based on rarity
const RARITY_CONFIG: Record<
  BadgeRarity,
  {
    nameHindi: string;
    border: string;
    bgGradient: string;
    iconBg: string;
    iconColor: string;
    textPill: string;
  }
> = {
  bronze: {
    nameHindi: 'कांस्य (Bronze)',
    border: 'border-amber-700/40 hover:border-amber-700',
    bgGradient: 'from-amber-50/70 via-white to-amber-50/30',
    iconBg: 'bg-amber-100 text-amber-900 border-amber-300',
    iconColor: 'text-amber-800',
    textPill: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  silver: {
    nameHindi: 'रजत (Silver)',
    border: 'border-slate-300 hover:border-slate-400',
    bgGradient: 'from-slate-100/70 via-white to-slate-50',
    iconBg: 'bg-slate-200 text-slate-800 border-slate-300',
    iconColor: 'text-slate-700',
    textPill: 'bg-slate-100 text-slate-800 border-slate-300',
  },
  gold: {
    nameHindi: 'स्वर्ण (Gold)',
    border: 'border-yellow-400/80 hover:border-yellow-500 shadow-yellow-100',
    bgGradient: 'from-amber-50 via-yellow-50/40 to-white',
    iconBg: 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 border-yellow-300',
    iconColor: 'text-amber-600',
    textPill: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  },
  diamond: {
    nameHindi: 'हीरक (Diamond)',
    border: 'border-indigo-400/80 hover:border-indigo-500 shadow-indigo-100',
    bgGradient: 'from-indigo-50/80 via-blue-50/30 to-purple-50/40',
    iconBg: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white border-indigo-300',
    iconColor: 'text-indigo-600',
    textPill: 'bg-indigo-100 text-indigo-900 border-indigo-300',
  },
};

export function BadgesViewSection({
  summary,
  onExploreChapters,
  onTakeTest,
}: BadgesViewSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [activeModalBadge, setActiveModalBadge] = useState<BadgeAchievement | null>(null);

  const safeBadges = Array.isArray(summary?.badges) ? summary.badges : [];
  const unlockedCount = summary?.unlockedCount ?? safeBadges.filter((b) => b.unlocked).length;
  const totalCount = summary?.totalCount ?? safeBadges.length;
  const totalPointsEarned = summary?.totalPointsEarned ?? 0;
  const level = summary?.level || {
    levelNumber: 1,
    hindiTitle: 'शिक्षार्थी',
    nextLevelPoints: 150,
    progressToNextLevelPercent: 0,
  };

  // Filtered badges
  const filteredBadges = useMemo(() => {
    return safeBadges.filter((b) => {
      const matchCat = selectedCategory === 'all' || b.category === selectedCategory;
      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'unlocked'
          ? b.unlocked
          : !b.unlocked;
      return matchCat && matchStatus;
    });
  }, [safeBadges, selectedCategory, statusFilter]);

  const categories: Array<{ id: string; label: string; count: number }> = [
    { id: 'all', label: 'सभी उपलब्धियां', count: totalCount },
    {
      id: 'chapters',
      label: 'अध्याय महारत',
      count: safeBadges.filter((b) => b.category === 'chapters').length,
    },
    {
      id: 'tests',
      label: 'टेस्ट विजय',
      count: safeBadges.filter((b) => b.category === 'tests').length,
    },
    {
      id: 'scores',
      label: 'उच्च स्कोर',
      count: safeBadges.filter((b) => b.category === 'scores').length,
    },
    {
      id: 'streaks',
      label: 'निरंतरता',
      count: safeBadges.filter((b) => b.category === 'streaks' || b.category === 'special').length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Gamification Hero Card: Level & XP Progress */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-800/40 shadow-xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-sm">
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>स्तर {level.levelNumber} (Level {level.levelNumber})</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-blue-200 border border-white/15">
                {unlockedCount} / {totalCount} बैज अनलॉक
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {level.hindiTitle}
              </h2>
              <p className="text-indigo-200 text-xs sm:text-sm font-medium mt-1 leading-relaxed">
                अध्याय पूर्ण करके और टेस्टों में उत्कृष्ट अंक अर्जित कर आप नए डिजिटल बैज और अनुभव अंक (XP) अनलॉक करते हैं।
              </p>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-200">
                <span>
                  कुल अर्जित XP: <strong className="text-amber-300 font-black">{totalPointsEarned} XP</strong>
                </span>
                <span>
                  अगले स्तर का लक्ष्य: <strong className="text-white font-black">{level.nextLevelPoints} XP</strong>
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden p-0.5 border border-white/15">
                <div
                  className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${level.progressToNextLevelPercent}%` }}
                />
              </div>
              <div className="text-right text-2xs text-indigo-300 font-semibold">
                अगले स्तर के लिए {Math.max(0, level.nextLevelPoints - totalPointsEarned)} XP और चाहिए ({level.progressToNextLevelPercent}% पूर्ण)
              </div>
            </div>
          </div>

          {/* Quick Trophy Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 flex items-center gap-5 shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 fill-current" />
            </div>
            <div>
              <div className="text-3xl font-black text-amber-300">
                {totalPointsEarned}
              </div>
              <div className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                उपलब्धि अंक (Total XP)
              </div>
              <div className="text-2xs text-indigo-300 mt-0.5">
                {unlockedCount} पदक सुरक्षित
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Status Switchers */}
      <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Status Pill Toggle */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            सभी ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('unlocked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              statusFilter === 'unlocked'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            अनलॉक ({unlockedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('locked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              statusFilter === 'locked'
                ? 'bg-white text-slate-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            लॉक ({Math.max(0, totalCount - unlockedCount)})
          </button>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredBadges.map((badge) => {
          const cfg = RARITY_CONFIG[badge.rarity];
          const isUnlocked = badge.unlocked;

          return (
            <div
              key={badge.id}
              onClick={() => setActiveModalBadge(badge)}
              className={`rounded-3xl p-5 border-2 transition-all cursor-pointer bg-gradient-to-br ${cfg.bgGradient} ${
                isUnlocked
                  ? `${cfg.border} shadow-2xs hover:shadow-md hover:-translate-y-0.5`
                  : 'border-slate-200/80 opacity-85 hover:opacity-100'
              } flex flex-col justify-between space-y-4 relative overflow-hidden`}
            >
              {/* Top Banner inside card */}
              <div className="flex items-start justify-between gap-3">
                {/* Badge Icon Emblem */}
                <div
                  className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
                    isUnlocked ? cfg.iconBg : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}
                >
                  {isUnlocked ? (
                    renderBadgeIcon(badge.iconName, 'w-7 h-7')
                  ) : (
                    <Lock className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-2xs font-black px-2.5 py-0.5 rounded-full border uppercase ${
                      isUnlocked ? cfg.textPill : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {cfg.nameHindi.split(' ')[0]}
                  </span>

                  <span className="text-xs font-black text-amber-700 bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-md">
                    +{badge.points} XP
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {badge.hindiTitle}
                  </h4>
                  {isUnlocked && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>

                <div className="text-2xs font-bold text-slate-400">
                  {badge.title}
                </div>

                <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed pt-1">
                  {badge.description}
                </p>
              </div>

              {/* Progress & Status Bottom Bar */}
              <div className="pt-2 border-t border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between text-2xs font-bold text-slate-500">
                  <span>शर्त: {badge.criteriaText}</span>
                  {isUnlocked ? (
                    <span className="text-emerald-700 font-black">✓ अनलॉक</span>
                  ) : (
                    <span>
                      {badge.currentProgress} / {badge.targetProgress}
                    </span>
                  )}
                </div>

                {/* Progress bar if locked */}
                {!isUnlocked && (
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${badge.progressPercent}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div className="bg-white rounded-3xl p-10 text-center space-y-3 border-2 border-slate-200">
          <Award className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="text-lg font-black text-slate-800">
            इस श्रेणी में कोई बैज नहीं मिला
          </h4>
          <p className="text-xs text-slate-500">
            कृपया अन्य फ़िल्टर चुनें।
          </p>
        </div>
      )}

      {/* BADGE DETAIL MODAL */}
      {activeModalBadge && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-slate-200 space-y-5 relative">
            <button
              type="button"
              onClick={() => setActiveModalBadge(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Icon Emblem */}
            <div className="text-center space-y-3">
              <div
                className={`w-20 h-20 rounded-3xl mx-auto border-4 flex items-center justify-center shadow-lg ${
                  activeModalBadge.unlocked
                    ? RARITY_CONFIG[activeModalBadge.rarity].iconBg
                    : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}
              >
                {activeModalBadge.unlocked ? (
                  renderBadgeIcon(activeModalBadge.iconName, 'w-10 h-10')
                ) : (
                  <Lock className="w-8 h-8 text-slate-400" />
                )}
              </div>

              <div>
                <span
                  className={`text-2xs font-black px-3 py-1 rounded-full border uppercase ${
                    activeModalBadge.unlocked
                      ? RARITY_CONFIG[activeModalBadge.rarity].textPill
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {RARITY_CONFIG[activeModalBadge.rarity].nameHindi}
                </span>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  {activeModalBadge.hindiTitle}
                </h3>
                <div className="text-xs font-bold text-slate-400">
                  {activeModalBadge.title} • {activeModalBadge.points} XP
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-2">
              <p className="font-medium leading-relaxed">
                {activeModalBadge.description}
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">अनलॉक करने की शर्त:</span>
                <span className="text-slate-900">{activeModalBadge.criteriaText}</span>
              </div>
            </div>

            {/* Unlock Status / Timestamp */}
            <div className="text-center">
              {activeModalBadge.unlocked ? (
                <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>सफलतापूर्वक अर्जित एवं सुरक्षित!</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>प्रगति (Progress):</span>
                    <span>
                      {activeModalBadge.currentProgress} / {activeModalBadge.targetProgress} ({activeModalBadge.progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${activeModalBadge.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Shortcut */}
            <div className="pt-2 flex items-center justify-center gap-3">
              {activeModalBadge.category === 'chapters' && onExploreChapters && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalBadge(null);
                    onExploreChapters();
                  }}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm cursor-pointer shadow-md"
                >
                  अध्याय नोट्स पढ़ें
                </button>
              )}

              {(activeModalBadge.category === 'tests' || activeModalBadge.category === 'scores') && onTakeTest && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalBadge(null);
                    onTakeTest();
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm cursor-pointer shadow-md"
                >
                  ऑनलाइन टेस्ट दें
                </button>
              )}

              {activeModalBadge.unlocked && (
                <button
                  type="button"
                  onClick={() => setActiveModalBadge(null)}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs sm:text-sm cursor-pointer"
                >
                  बंद करें
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
