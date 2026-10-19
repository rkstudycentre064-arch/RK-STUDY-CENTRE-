import { useState, useMemo } from 'react';
import {
  Award,
  BookOpen,
  Crown,
  Compass,
  Sparkles,
  Layers,
  CheckCircle2,
  Target,
  TrendingUp,
  Zap,
  Flame,
  Lock,
  Trophy,
  Star,
  X,
  Play,
  Share2,
  ChevronRight,
  Filter,
} from 'lucide-react';
import type {
  BadgeAchievement,
  StudentBadgesSummary,
  BadgeCategory,
  BadgeRarity,
  ClassLevel,
} from '../../types';

interface BadgesViewProps {
  badgesSummary: StudentBadgesSummary;
  selectedClass: ClassLevel;
  onNavigateToChapters?: () => void;
  onNavigateToTests?: () => void;
}

// Icon mapper for dynamic badge icons
function renderBadgeIcon(iconName: string, className: string = 'w-6 h-6') {
  switch (iconName) {
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'Award':
      return <Award className={className} />;
    case 'Crown':
      return <Crown className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    case 'CheckCircle2':
      return <CheckCircle2 className={className} />;
    case 'Target':
      return <Target className={className} />;
    case 'TrendingUp':
      return <TrendingUp className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    default:
      return <Trophy className={className} />;
  }
}

// Visual styling tokens per rarity
const RARITY_THEMES: Record<
  BadgeRarity,
  {
    label: string;
    border: string;
    bgUnlocked: string;
    badgeBg: string;
    text: string;
    ring: string;
    glow: string;
  }
> = {
  bronze: {
    label: 'कांस्य (Bronze)',
    border: 'border-amber-700/30',
    bgUnlocked: 'bg-gradient-to-br from-amber-50 to-orange-50/50',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    text: 'text-amber-900',
    ring: 'ring-amber-500/20',
    glow: 'from-amber-500/20 to-orange-500/10',
  },
  silver: {
    label: 'रजत (Silver)',
    border: 'border-slate-300',
    bgUnlocked: 'bg-gradient-to-br from-slate-50 to-blue-50/50',
    badgeBg: 'bg-slate-200 text-slate-800 border-slate-300',
    text: 'text-slate-800',
    ring: 'ring-slate-400/20',
    glow: 'from-slate-400/20 to-blue-400/10',
  },
  gold: {
    label: 'स्वर्ण (Gold)',
    border: 'border-yellow-400/40',
    bgUnlocked: 'bg-gradient-to-br from-yellow-50/80 to-amber-50/60',
    badgeBg: 'bg-yellow-100 text-yellow-950 border-yellow-300',
    text: 'text-yellow-950',
    ring: 'ring-yellow-500/30',
    glow: 'from-yellow-400/20 to-amber-500/15',
  },
  diamond: {
    label: 'हीरक (Diamond)',
    border: 'border-cyan-400/50',
    bgUnlocked: 'bg-gradient-to-br from-cyan-50/80 to-indigo-50/60',
    badgeBg: 'bg-cyan-100 text-cyan-950 border-cyan-300',
    text: 'text-cyan-950',
    ring: 'ring-cyan-500/30',
    glow: 'from-cyan-400/25 to-indigo-500/20',
  },
};

export function BadgesView({
  badgesSummary,
  selectedClass,
  onNavigateToChapters,
  onNavigateToTests,
}: BadgesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [selectedBadgeForModal, setSelectedBadgeForModal] = useState<BadgeAchievement | null>(null);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  const {
    badges = [],
    unlockedCount = 0,
    totalCount = 0,
    totalPointsEarned = 0,
    maxPossiblePoints = 0,
    level = {
      levelNumber: 1,
      title: 'Learner',
      hindiTitle: 'शिक्षार्थी',
      minPoints: 0,
      nextLevelPoints: 150,
      progressToNextLevelPercent: 0,
    },
  } = badgesSummary || {};

  // Filtered badges list
  const filteredBadges = useMemo(() => {
    const list = Array.isArray(badges) ? badges : [];
    return list.filter((b) => {
      const matchCat = selectedCategory === 'all' || b.category === selectedCategory;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'unlocked' && b.unlocked) ||
        (statusFilter === 'locked' && !b.unlocked);
      return matchCat && matchStatus;
    });
  }, [badges, selectedCategory, statusFilter]);

  const handleShareBadge = (badge: BadgeAchievement) => {
    const text = `🎉 मैंने RK Study Centre में "${badge.hindiTitle}" डिजिटल बैज अनलॉक किया! कुल ${badge.points} XP अंक प्राप्त किए।`;
    if (navigator.share) {
      navigator.share({
        title: 'RK Study Centre - मेरी उपलब्धि',
        text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header Level & XP Progress Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-900/50 shadow-xl space-y-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>डिजिटल उपलब्धियां (Achievements Engine)</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-200 border border-blue-500/30">
                {level.hindiTitle}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              विद्यार्थी बैज एवं सम्मान (Student Badges)
            </h2>

            <p className="text-blue-200 text-xs sm:text-sm font-medium leading-relaxed">
              अध्यायों का नियमित अध्ययन पूरा करें और ऑनलाइन टेस्टों में उत्कृष्ट अंक प्राप्त करके नए डिजिटल बैज अनलॉक करें। हर बैज आपकी मेहनत और ज्ञान का प्रमाण है!
            </p>
          </div>

          {/* XP & Level Summary Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 shrink-0 flex flex-col justify-between gap-4 min-w-[260px]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-2xs font-extrabold text-blue-200 uppercase tracking-wider block">
                  कुल अर्जित XP
                </span>
                <span className="text-3xl font-black text-amber-300">
                  {totalPointsEarned} <span className="text-sm font-bold text-white/70">/ {maxPossiblePoints} XP</span>
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                <Crown className="w-6 h-6" />
              </div>
            </div>

            {/* Level progress bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-2xs font-bold text-blue-200">
                <span>अगला स्तर: Level {Math.min(5, level.levelNumber + 1)}</span>
                <span>{level.progressToNextLevelPercent}%</span>
              </div>
              <div className="w-full bg-white/15 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-yellow-300 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${level.progressToNextLevelPercent}%` }}
                />
              </div>
            </div>

            <div className="text-2xs font-semibold text-blue-200/80 text-center">
              🔓 <strong className="text-white font-bold">{unlockedCount}</strong> / {totalCount} बैज अनलॉक हो चुके हैं
            </div>
          </div>
        </div>

        {/* Level Badges Progression Pills */}
        <div className="pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[
            { lvl: 1, name: 'शिक्षार्थी', xp: '0 XP' },
            { lvl: 2, name: 'अभ्यासकर्ता', xp: '150 XP' },
            { lvl: 3, name: 'मेधावी', xp: '400 XP' },
            { lvl: 4, name: 'विशेषज्ञ', xp: '800 XP' },
            { lvl: 5, name: 'टॉपर शिरोमणि', xp: '1400 XP' },
          ].map((item) => {
            const isReached = level.levelNumber >= item.lvl;
            const isCurrent = level.levelNumber === item.lvl;
            return (
              <div
                key={item.lvl}
                className={`rounded-xl p-2.5 text-center transition-all ${
                  isCurrent
                    ? 'bg-amber-400/20 border-2 border-amber-400 text-white'
                    : isReached
                    ? 'bg-white/10 border border-white/20 text-blue-100'
                    : 'bg-white/5 border border-white/5 text-white/40'
                }`}
              >
                <div className="text-2xs font-bold uppercase">Level {item.lvl}</div>
                <div className="text-xs font-black truncate">{item.name}</div>
                <div className="text-3xs opacity-80 mt-0.5">{item.xp}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Category & Status Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-500 uppercase mr-1 shrink-0">
              श्रेणी:
            </span>
            {[
              { id: 'all', label: `सभी बैज (${badges.length})` },
              { id: 'chapters', label: 'अध्याय पूर्णता' },
              { id: 'tests', label: 'ऑनलाइन टेस्ट' },
              { id: 'scores', label: 'उच्च प्राप्तांक' },
              { id: 'streaks', label: 'अध्ययन निरंतरता' },
              { id: 'special', label: 'विशेष महारत' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status filter: All, Unlocked, Locked */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              सभी ({badges.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('unlocked')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
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
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                statusFilter === 'locked'
                  ? 'bg-white text-slate-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              प्रगति पर ({totalCount - unlockedCount})
            </button>
          </div>
        </div>
      </div>

      {/* 3. Badges Grid */}
      {filteredBadges.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border-2 border-slate-200 text-center space-y-3">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-lg font-black text-slate-800">
            इस फिल्टर में कोई बैज नहीं मिला
          </h4>
          <p className="text-xs text-slate-500">
            कृपया दूसरे श्रेणी या स्थिति फिल्टर का चयन करें।
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setStatusFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-blue-700 text-white text-xs font-black cursor-pointer shadow-xs"
          >
            सभी बैज देखें
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredBadges.map((badge) => {
            const theme = RARITY_THEMES[badge.rarity];
            const isUnlocked = badge.unlocked;

            return (
              <div
                key={badge.id}
                onClick={() => setSelectedBadgeForModal(badge)}
                className={`group rounded-3xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  isUnlocked
                    ? `${theme.bgUnlocked} ${theme.border} hover:shadow-md hover:scale-[1.01]`
                    : 'bg-white border-slate-200 opacity-80 hover:opacity-100 hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                {/* Top Badge Info */}
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    {/* Badge Icon Emblem */}
                    <div
                      className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 shadow-xs ${
                        isUnlocked
                          ? `${theme.badgeBg}`
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      {renderBadgeIcon(badge.iconName, 'w-7 h-7 stroke-[2.2]')}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-2xs font-black px-2.5 py-0.5 rounded-full uppercase border ${
                          isUnlocked
                            ? `${theme.badgeBg}`
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        +{badge.points} XP
                      </span>

                      {isUnlocked ? (
                        <span className="text-2xs font-extrabold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>अनलॉक</span>
                        </span>
                      ) : (
                        <span className="text-2xs font-bold text-slate-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>लॉक्ड</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3
                      className={`text-base font-black leading-snug line-clamp-1 ${
                        isUnlocked ? 'text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {badge.hindiTitle}
                    </h3>
                    <div className="text-2xs font-bold text-slate-500 mt-0.5">
                      {theme.label}
                    </div>
                    <p className="text-xs text-slate-600 font-medium line-clamp-2 mt-1.5 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Progress or Unlocked Timestamp */}
                <div className="pt-3.5 mt-3.5 border-t border-slate-200/70 space-y-1.5">
                  {isUnlocked ? (
                    <div className="flex items-center justify-between text-2xs text-emerald-700 font-bold">
                      <span>✓ उपलब्धि हासिल की गई!</span>
                      <span className="text-blue-700 group-hover:underline flex items-center gap-0.5">
                        <span>विवरण</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-2xs font-extrabold text-slate-600">
                        <span>प्रगति: {badge.currentProgress} / {badge.targetProgress}</span>
                        <span>{badge.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${badge.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Badge Details / Celebration Modal */}
      {selectedBadgeForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedBadgeForModal(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer z-10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header Ambient Banner */}
            <div
              className={`p-6 sm:p-8 text-center flex flex-col items-center justify-center relative overflow-hidden ${
                selectedBadgeForModal.unlocked
                  ? `${RARITY_THEMES[selectedBadgeForModal.rarity].bgUnlocked} border-b ${RARITY_THEMES[selectedBadgeForModal.rarity].border}`
                  : 'bg-slate-100 border-b border-slate-200'
              }`}
            >
              {/* Emblem */}
              <div
                className={`w-20 h-20 rounded-3xl border-4 flex items-center justify-center shadow-md mb-3 ${
                  selectedBadgeForModal.unlocked
                    ? `${RARITY_THEMES[selectedBadgeForModal.rarity].badgeBg}`
                    : 'bg-slate-200 text-slate-400 border-slate-300'
                }`}
              >
                {renderBadgeIcon(selectedBadgeForModal.iconName, 'w-10 h-10 stroke-[2.2]')}
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-2xs font-black px-2.5 py-0.5 rounded-full uppercase border ${
                    selectedBadgeForModal.unlocked
                      ? RARITY_THEMES[selectedBadgeForModal.rarity].badgeBg
                      : 'bg-slate-200 text-slate-600 border-slate-300'
                  }`}
                >
                  {RARITY_THEMES[selectedBadgeForModal.rarity].label}
                </span>
                <span className="text-2xs font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  +{selectedBadgeForModal.points} XP
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 leading-snug">
                {selectedBadgeForModal.hindiTitle}
              </h3>
              <p className="text-xs text-slate-500 font-bold mt-0.5">
                {selectedBadgeForModal.title}
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <span className="text-2xs font-extrabold text-slate-500 uppercase tracking-wider block">
                  उपलब्धि विवरण (Description)
                </span>
                <p className="text-sm font-medium text-slate-700 leading-relaxed">
                  {selectedBadgeForModal.description}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2">
                <span className="text-2xs font-extrabold text-slate-500 uppercase tracking-wider block">
                  अनलॉक करने की शर्त (Criteria)
                </span>
                <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{selectedBadgeForModal.criteriaText}</span>
                </div>

                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>वर्तमान स्थिति:</span>
                  <span
                    className={
                      selectedBadgeForModal.unlocked
                        ? 'text-emerald-700 font-black'
                        : 'text-amber-700 font-black'
                    }
                  >
                    {selectedBadgeForModal.unlocked
                      ? '✓ पूर्ण एवं अनलॉक'
                      : `${selectedBadgeForModal.currentProgress} / ${selectedBadgeForModal.targetProgress} पूर्ण (${selectedBadgeForModal.progressPercent}%)`}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center gap-2.5">
                {selectedBadgeForModal.unlocked ? (
                  <button
                    type="button"
                    onClick={() => handleShareBadge(selectedBadgeForModal)}
                    className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{copiedShareLink ? '✓ कॉपी हुआ!' : 'उपलब्धि साझा करें'}</span>
                  </button>
                ) : (
                  <div className="w-full flex items-center gap-2">
                    {selectedBadgeForModal.category === 'chapters' && onNavigateToChapters && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBadgeForModal(null);
                          onNavigateToChapters();
                        }}
                        className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>अध्याय पढ़ें</span>
                      </button>
                    )}
                    {(selectedBadgeForModal.category === 'tests' || selectedBadgeForModal.category === 'scores') && onNavigateToTests && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBadgeForModal(null);
                          onNavigateToTests();
                        }}
                        className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>टेस्ट दें</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
