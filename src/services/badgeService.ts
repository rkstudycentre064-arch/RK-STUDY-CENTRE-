/**
 * RK STUDY CENTRE - Student Badges & Digital Achievements Service
 * 
 * Computes badges, levels, and achievement progress for:
 * 1. Chapter Completion Milestones
 * 2. Test Passing & High Score Achievements (Century, 90%+, 1st Division)
 * 3. Daily Study Streaks
 * 4. Overall Accuracy and Subject Mastery
 */

import type {
  BadgeAchievement,
  StudentBadgesSummary,
  ChapterProgressRecord,
  StoredTestResult,
  StudentProgressStats,
  ClassLevel,
} from '../types';

const UNLOCKED_BADGES_KEY = 'rk_unlocked_badges_v1';

// Internal list of badge definitions
interface BadgeDefinition {
  id: string;
  title: string;
  hindiTitle: string;
  description: string;
  criteriaText: string;
  category: 'chapters' | 'tests' | 'scores' | 'streaks' | 'special';
  rarity: 'bronze' | 'silver' | 'gold' | 'diamond';
  points: number;
  iconName: string;
  calculateProgress: (data: {
    chapters: ChapterProgressRecord[];
    tests: StoredTestResult[];
    stats: StudentProgressStats | null;
    streakDays: number;
  }) => { current: number; target: number; unlocked: boolean };
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // --- CHAPTERS ---
  {
    id: 'badge-ch-1',
    title: 'First Step',
    hindiTitle: 'पहला कदम (First Step)',
    description: 'Completed your first study chapter successfully.',
    criteriaText: 'कम से कम 1 अध्याय पूर्ण करें',
    category: 'chapters',
    rarity: 'bronze',
    points: 50,
    iconName: 'BookOpen',
    calculateProgress: ({ chapters }) => ({
      current: Math.min(chapters.length, 1),
      target: 1,
      unlocked: chapters.length >= 1,
    }),
  },
  {
    id: 'badge-ch-3',
    title: 'Chapter Explorer',
    hindiTitle: 'अध्याय अन्वेषक (Chapter Explorer)',
    description: 'Completed 3 chapters in the syllabus.',
    criteriaText: '3 अध्याय पूर्ण करें',
    category: 'chapters',
    rarity: 'bronze',
    points: 100,
    iconName: 'Compass',
    calculateProgress: ({ chapters }) => ({
      current: Math.min(chapters.length, 3),
      target: 3,
      unlocked: chapters.length >= 3,
    }),
  },
  {
    id: 'badge-ch-5',
    title: 'Dedicated Reader',
    hindiTitle: 'मेधावी पाठक (Dedicated Reader)',
    description: 'Completed 5 chapters across subjects.',
    criteriaText: '5 अध्याय पूर्ण करें',
    category: 'chapters',
    rarity: 'silver',
    points: 200,
    iconName: 'Award',
    calculateProgress: ({ chapters }) => ({
      current: Math.min(chapters.length, 5),
      target: 5,
      unlocked: chapters.length >= 5,
    }),
  },
  {
    id: 'badge-ch-10',
    title: 'Chapter Champion',
    hindiTitle: 'अध्याय महारथी (Chapter Champion)',
    description: 'Deeply completed 10 chapters in your course.',
    criteriaText: '10 अध्याय पूर्ण करें',
    category: 'chapters',
    rarity: 'gold',
    points: 350,
    iconName: 'Crown',
    calculateProgress: ({ chapters }) => ({
      current: Math.min(chapters.length, 10),
      target: 10,
      unlocked: chapters.length >= 10,
    }),
  },
  {
    id: 'badge-ch-science',
    title: 'Science Explorer',
    hindiTitle: 'विज्ञान खोजी (Science Explorer)',
    description: 'Completed at least 2 Science chapters.',
    criteriaText: 'विज्ञान के 2 अध्याय पूर्ण करें',
    category: 'chapters',
    rarity: 'silver',
    points: 150,
    iconName: 'Sparkles',
    calculateProgress: ({ chapters }) => {
      const sciCount = chapters.filter(
        (c) =>
          c.subjectId?.includes('science') ||
          c.subjectName?.toLowerCase().includes('विज्ञान') ||
          c.subjectName?.toLowerCase().includes('science')
      ).length;
      return {
        current: Math.min(sciCount, 2),
        target: 2,
        unlocked: sciCount >= 2,
      };
    },
  },
  {
    id: 'badge-ch-social',
    title: 'Social Science Scholar',
    hindiTitle: 'सामाजिक विज्ञान प्रवीण (Social Scholar)',
    description: 'Completed at least 2 Social Science chapters.',
    criteriaText: 'सामाजिक विज्ञान के 2 अध्याय पूर्ण करें',
    category: 'chapters',
    rarity: 'silver',
    points: 150,
    iconName: 'Layers',
    calculateProgress: ({ chapters }) => {
      const sstCount = chapters.filter(
        (c) =>
          c.subjectId?.includes('social') ||
          c.subjectName?.toLowerCase().includes('सामाजिक') ||
          c.subjectName?.toLowerCase().includes('social')
      ).length;
      return {
        current: Math.min(sstCount, 2),
        target: 2,
        unlocked: sstCount >= 2,
      };
    },
  },

  // --- TESTS ---
  {
    id: 'badge-test-1',
    title: 'Test Initiate',
    hindiTitle: 'पहला टेस्ट पास (First Test Pass)',
    description: 'Successfully attempted and passed your first online test.',
    criteriaText: 'कम से कम 1 ऑनलाइन टेस्ट पास करें',
    category: 'tests',
    rarity: 'bronze',
    points: 50,
    iconName: 'CheckCircle2',
    calculateProgress: ({ tests }) => {
      const passed = tests.filter((t) => {
        const pct = t.totalMarks > 0 ? (t.score / t.totalMarks) * 100 : 0;
        return t.passed !== undefined ? t.passed : pct >= 40;
      }).length;
      return {
        current: Math.min(passed, 1),
        target: 1,
        unlocked: passed >= 1,
      };
    },
  },
  {
    id: 'badge-test-3',
    title: 'Test Warrior',
    hindiTitle: 'टेस्ट योद्धा (Test Warrior)',
    description: 'Successfully passed 3 online tests.',
    criteriaText: '3 ऑनलाइन टेस्ट पास करें',
    category: 'tests',
    rarity: 'silver',
    points: 150,
    iconName: 'Target',
    calculateProgress: ({ tests }) => {
      const passed = tests.filter((t) => {
        const pct = t.totalMarks > 0 ? (t.score / t.totalMarks) * 100 : 0;
        return t.passed !== undefined ? t.passed : pct >= 40;
      }).length;
      return {
        current: Math.min(passed, 3),
        target: 3,
        unlocked: passed >= 3,
      };
    },
  },
  {
    id: 'badge-test-5',
    title: 'Test Veteran',
    hindiTitle: 'परीक्षा निष्णात (Test Veteran)',
    description: 'Successfully passed 5 online tests.',
    criteriaText: '5 ऑनलाइन टेस्ट पास करें',
    category: 'tests',
    rarity: 'gold',
    points: 300,
    iconName: 'Award',
    calculateProgress: ({ tests }) => {
      const passed = tests.filter((t) => {
        const pct = t.totalMarks > 0 ? (t.score / t.totalMarks) * 100 : 0;
        return t.passed !== undefined ? t.passed : pct >= 40;
      }).length;
      return {
        current: Math.min(passed, 5),
        target: 5,
        unlocked: passed >= 5,
      };
    },
  },

  // --- SCORES ---
  {
    id: 'badge-score-60',
    title: 'First Division',
    hindiTitle: 'प्रथम श्रेणी (1st Division - 60%+)',
    description: 'Scored 60% or above in any online test.',
    criteriaText: 'किसी टेस्ट में 60%+ अंक लाएं',
    category: 'scores',
    rarity: 'bronze',
    points: 75,
    iconName: 'TrendingUp',
    calculateProgress: ({ tests }) => {
      const has60 = tests.some((t) => {
        const pct = t.totalMarks > 0 ? (t.score / t.totalMarks) * 100 : 0;
        return pct >= 60;
      });
      return {
        current: has60 ? 1 : 0,
        target: 1,
        unlocked: has60,
      };
    },
  },
  {
    id: 'badge-score-90',
    title: 'High Achiever (90%+)',
    hindiTitle: 'शिखर स्कोरर (Top Scorer - 90%+)',
    description: 'Scored 90% or above on an online test.',
    criteriaText: 'किसी टेस्ट में 90%+ अंक लाएं',
    category: 'scores',
    rarity: 'gold',
    points: 250,
    iconName: 'Award',
    calculateProgress: ({ tests }) => {
      const has90 = tests.some((t) => {
        const pct = t.totalMarks > 0 ? (t.score / t.totalMarks) * 100 : 0;
        return pct >= 90;
      });
      return {
        current: has90 ? 1 : 0,
        target: 1,
        unlocked: has90,
      };
    },
  },
  {
    id: 'badge-score-100',
    title: 'Century Club (100%)',
    hindiTitle: 'शतकवीर (Century Club - 100%)',
    description: 'Achieved a perfect 100% score on a test with zero errors!',
    criteriaText: 'किसी टेस्ट में शत-प्रतिशत (100%) अंक प्राप्त करें',
    category: 'scores',
    rarity: 'diamond',
    points: 500,
    iconName: 'Crown',
    calculateProgress: ({ tests }) => {
      const has100 = tests.some((t) => {
        const pct = t.totalMarks > 0 ? (t.score / t.totalMarks) * 100 : 0;
        return pct === 100;
      });
      return {
        current: has100 ? 1 : 0,
        target: 1,
        unlocked: has100,
      };
    },
  },
  {
    id: 'badge-score-accuracy-80',
    title: 'Bullseye Accuracy',
    hindiTitle: 'सटीक निशानेबाज (Bullseye 80%+ Accuracy)',
    description: 'Maintained 80% or higher overall test answer accuracy.',
    criteriaText: 'समग्र सटीकता दर 80%+ हासिल करें (कम से कम 10 प्रश्न हल)',
    category: 'scores',
    rarity: 'silver',
    points: 200,
    iconName: 'Target',
    calculateProgress: ({ stats }) => {
      const acc = stats?.overallAccuracyPercent || 0;
      const totalQ = stats?.totalQuestionsAnswered || 0;
      const unlocked = totalQ >= 10 && acc >= 80;
      return {
        current: unlocked ? 1 : 0,
        target: 1,
        unlocked,
      };
    },
  },

  // --- STREAKS ---
  {
    id: 'badge-streak-2',
    title: 'Active Learner',
    hindiTitle: 'नियमित अभ्यासी (2-Day Streak)',
    description: 'Maintained a daily study streak for 2 consecutive days.',
    criteriaText: 'लगातार 2 दिन अध्ययन जारी रखें',
    category: 'streaks',
    rarity: 'bronze',
    points: 50,
    iconName: 'Zap',
    calculateProgress: ({ streakDays }) => ({
      current: Math.min(streakDays, 2),
      target: 2,
      unlocked: streakDays >= 2,
    }),
  },
  {
    id: 'badge-streak-3',
    title: 'Focus Master',
    hindiTitle: 'लगनशील विद्यार्थी (3-Day Streak)',
    description: 'Maintained a daily study streak for 3 consecutive days.',
    criteriaText: 'लगातार 3 दिन अध्ययन जारी रखें',
    category: 'streaks',
    rarity: 'silver',
    points: 150,
    iconName: 'Zap',
    calculateProgress: ({ streakDays }) => ({
      current: Math.min(streakDays, 3),
      target: 3,
      unlocked: streakDays >= 3,
    }),
  },
  {
    id: 'badge-streak-7',
    title: 'Unstoppable Habit',
    hindiTitle: 'अटल तपस्वी (7-Day Streak Master)',
    description: 'Maintained an unbroken 7-day daily study streak!',
    criteriaText: 'लगातार 7 दिन अध्ययन जारी रखें',
    category: 'streaks',
    rarity: 'diamond',
    points: 400,
    iconName: 'Flame',
    calculateProgress: ({ streakDays }) => ({
      current: Math.min(streakDays, 7),
      target: 7,
      unlocked: streakDays >= 7,
    }),
  },

  // --- SPECIAL / MASTERY ---
  {
    id: 'badge-special-allrounder',
    title: 'All-Rounder Scholar',
    hindiTitle: 'सर्वगुण संपन्न (All-Rounder)',
    description: 'Completed at least 3 chapters and passed 2 tests.',
    criteriaText: 'कम से कम 3 अध्याय और 2 टेस्ट पास करें',
    category: 'special',
    rarity: 'gold',
    points: 300,
    iconName: 'Award',
    calculateProgress: ({ chapters, tests }) => {
      const chOk = chapters.length >= 3;
      const passed = tests.filter((t) => {
        const pct = t.totalMarks > 0 ? (t.score / t.totalMarks) * 100 : 0;
        return t.passed !== undefined ? t.passed : pct >= 40;
      }).length >= 2;
      const unlocked = chOk && passed;
      return {
        current: (chOk ? 1 : 0) + (passed ? 1 : 0),
        target: 2,
        unlocked,
      };
    },
  },
];

/**
 * Get previously unlocked badges from localStorage
 */
function getSavedUnlockedTimestamps(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(UNLOCKED_BADGES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

/**
 * Persist newly unlocked badges with current timestamp
 */
function saveUnlockedTimestamps(map: Record<string, string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(UNLOCKED_BADGES_KEY, JSON.stringify(map));
  } catch {}
}

/**
 * Compute student level information based on total earned points
 */
function calculateLevel(totalPoints: number) {
  if (totalPoints < 150) {
    return {
      levelNumber: 1,
      title: 'Novice Student',
      hindiTitle: 'नवागंतुक शिक्षार्थी (Level 1)',
      nextLevelPoints: 150,
      progressToNextLevelPercent: Math.min(100, Math.round((totalPoints / 150) * 100)),
    };
  } else if (totalPoints < 400) {
    return {
      levelNumber: 2,
      title: 'Diligent Scholar',
      hindiTitle: 'लगनशील अभ्यासकर्ता (Level 2)',
      nextLevelPoints: 400,
      progressToNextLevelPercent: Math.min(100, Math.round(((totalPoints - 150) / 250) * 100)),
    };
  } else if (totalPoints < 800) {
    return {
      levelNumber: 3,
      title: 'Bright Scholar',
      hindiTitle: 'मेधावी विद्यार्थी (Level 3)',
      nextLevelPoints: 800,
      progressToNextLevelPercent: Math.min(100, Math.round(((totalPoints - 400) / 400) * 100)),
    };
  } else if (totalPoints < 1400) {
    return {
      levelNumber: 4,
      title: 'Exam Champion',
      hindiTitle: 'परीक्षा विजेता (Level 4)',
      nextLevelPoints: 1400,
      progressToNextLevelPercent: Math.min(100, Math.round(((totalPoints - 800) / 600) * 100)),
    };
  } else {
    return {
      levelNumber: 5,
      title: 'Master Rank Achiever',
      hindiTitle: 'टॉपर शिरोमणि (Level 5)',
      nextLevelPoints: 2000,
      progressToNextLevelPercent: 100,
    };
  }
}

/**
 * Computes all badges and summary for the student
 */
export function calculateStudentBadges(
  paramsOrChapters:
    | {
        completedChapters: ChapterProgressRecord[];
        testResults: StoredTestResult[];
        stats?: StudentProgressStats | null;
        streakDays?: number;
        classLevel?: ClassLevel;
      }
    | ChapterProgressRecord[],
  testResultsArg?: StoredTestResult[],
  streakDaysArg?: number,
  statsArg?: StudentProgressStats | null,
  classLevelArg?: ClassLevel
): StudentBadgesSummary {
  let completedChapters: ChapterProgressRecord[];
  let testResults: StoredTestResult[];
  let stats: StudentProgressStats | null = null;
  let streakDays = 1;
  let classLevel: ClassLevel | undefined;

  if (!paramsOrChapters) {
    completedChapters = [];
    testResults = testResultsArg || [];
    streakDays = streakDaysArg !== undefined ? streakDaysArg : 1;
    stats = statsArg !== undefined ? statsArg : null;
    classLevel = classLevelArg;
  } else if (Array.isArray(paramsOrChapters)) {
    completedChapters = paramsOrChapters;
    testResults = testResultsArg || [];
    streakDays = streakDaysArg !== undefined ? streakDaysArg : 1;
    stats = statsArg !== undefined ? statsArg : null;
    classLevel = classLevelArg;
  } else {
    completedChapters = paramsOrChapters.completedChapters || [];
    testResults = paramsOrChapters.testResults || [];
    stats = paramsOrChapters.stats || null;
    streakDays = paramsOrChapters.streakDays !== undefined ? paramsOrChapters.streakDays : 1;
    classLevel = paramsOrChapters.classLevel;
  }

  // Filter if classLevel is specified
  const filteredChapters = classLevel
    ? completedChapters.filter((c) => c.classLevel === classLevel)
    : completedChapters;

  const filteredTests = classLevel
    ? testResults.filter((t) => !t.classLevel || t.classLevel === classLevel)
    : testResults;

  const savedTimestamps = getSavedUnlockedTimestamps();
  let updatedTimestamps = { ...savedTimestamps };
  let timestampsChanged = false;

  let unlockedCount = 0;
  let totalPointsEarned = 0;
  let maxPossiblePoints = 0;

  const badges: BadgeAchievement[] = BADGE_DEFINITIONS.map((def) => {
    maxPossiblePoints += def.points;

    const { current, target, unlocked } = def.calculateProgress({
      chapters: filteredChapters,
      tests: filteredTests,
      stats,
      streakDays,
    });

    const progressPercent = Math.min(100, Math.round((current / target) * 100));

    let unlockedAt = savedTimestamps[def.id];
    if (unlocked) {
      unlockedCount++;
      totalPointsEarned += def.points;
      if (!unlockedAt || new Date(unlockedAt).getTime() > Date.now()) {
        unlockedAt = new Date().toISOString();
        updatedTimestamps[def.id] = unlockedAt;
        timestampsChanged = true;
      }
    }

    return {
      id: def.id,
      title: def.title,
      hindiTitle: def.hindiTitle,
      description: def.description,
      criteriaText: def.criteriaText,
      category: def.category,
      rarity: def.rarity,
      points: def.points,
      iconName: def.iconName,
      currentProgress: current,
      targetProgress: target,
      progressPercent,
      unlocked,
      unlockedAt,
    };
  });

  if (timestampsChanged) {
    saveUnlockedTimestamps(updatedTimestamps);
  }

  const level = calculateLevel(totalPointsEarned);

  return {
    badges,
    unlockedCount,
    totalCount: BADGE_DEFINITIONS.length,
    totalPointsEarned,
    maxPossiblePoints,
    level,
  };
}
