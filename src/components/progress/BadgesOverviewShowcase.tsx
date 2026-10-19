import {
  Trophy,
  Crown,
  ChevronRight,
  Lock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import type { StudentBadgesSummary } from '../../types';

interface BadgesOverviewShowcaseProps {
  summary: StudentBadgesSummary;
  onViewAllBadges: () => void;
}

export function BadgesOverviewShowcase({
  summary,
  onViewAllBadges,
}: BadgesOverviewShowcaseProps) {
  const safeBadges = Array.isArray(summary?.badges) ? summary.badges : [];
  const levelNumber = summary?.level?.levelNumber ?? 1;
  const totalPoints = summary?.totalPointsEarned ?? 0;
  const totalBadgesCount = summary?.totalCount ?? safeBadges.length;

  // Show top unlocked badges first, followed by next in-progress badges
  const previewBadges = [
    ...safeBadges.filter((b) => b.unlocked),
    ...safeBadges.filter((b) => !b.unlocked),
  ].slice(0, 4);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-2xs space-y-5">
      {/* Header with Level & View All Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 fill-current" />
              <span>उपलब्धियां एवं बैज (Badges)</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
              स्तर {levelNumber} • {totalPoints} XP
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            डिजिटल पदक एवं पुरस्कार (Unlocked Badges)
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-600">
            अध्याय पूर्ण करने और टेस्टों में उत्कृष्ट अंक लाने पर स्वतः अनलॉक होने वाले सम्मान।
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAllBadges}
          className="text-xs sm:text-sm font-black text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-xl flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
        >
          <span>सभी {totalBadgesCount} बैज देखें</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Mini Badges Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {previewBadges.map((badge) => {
          return (
            <div
              key={badge.id}
              onClick={onViewAllBadges}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                badge.unlocked
                  ? 'bg-gradient-to-b from-amber-50/60 to-white border-amber-300/80 shadow-2xs hover:shadow-xs hover:-translate-y-0.5'
                  : 'bg-slate-50 border-slate-200 opacity-75 hover:opacity-100'
              } flex flex-col justify-between space-y-2`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    badge.unlocked
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {badge.unlocked ? (
                    <Trophy className="w-5 h-5 fill-amber-500 text-amber-700" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                <span
                  className={`text-2xs font-extrabold px-2 py-0.5 rounded-full ${
                    badge.unlocked
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {badge.unlocked ? '✓ अर्जित' : `${badge.progressPercent}%`}
                </span>
              </div>

              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1">
                  {badge.hindiTitle}
                </h4>
                <p className="text-2xs text-slate-500 line-clamp-1 mt-0.5">
                  {badge.criteriaText}
                </p>
              </div>

              <div className="text-2xs font-black text-amber-700 pt-1">
                +{badge.points} XP
              </div>
            </div>
          );
        })}
      </div>

      {/* Level XP Bar footer */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-600 fill-current shrink-0" />
          <span className="font-bold text-slate-700">
            वर्तमान स्तर: <strong className="text-slate-950 font-black">{summary.level.hindiTitle}</strong>
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">
            अगला स्तर: {summary.level.nextLevelPoints} XP
          </span>
        </div>

        <div className="w-full sm:w-48 bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-amber-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${summary.level.progressToNextLevelPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
