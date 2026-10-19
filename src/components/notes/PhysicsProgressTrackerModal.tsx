/**
 * RK STUDY CENTRE - Bihar Board Class 10 Physics 15 Chapters Progress Tracker
 * 
 * Allows students to track and check off completed Physics chapters (1-15)
 * from their 500-question syllabus, syncing completion status to Firestore & LocalStorage.
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Trophy,
  Sparkles,
  X,
  BookOpen,
  Award,
  BarChart3,
  Flame,
  Check
} from 'lucide-react';
import {
  getCompletedChapters,
  toggleChapterCompletion,
  PROGRESS_UPDATED_EVENT
} from '../../services/progressService';
import type { ChapterProgressRecord } from '../../types';

interface PhysicsProgressTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PHYSICS_CHAPTERS_LIST = [
  { id: 'phy_ch_1', chapterNumber: 1, title: 'प्रकाश का परावर्तन', titleEn: 'Reflection of Light', questionsCount: 35 },
  { id: 'phy_ch_2', chapterNumber: 2, title: 'प्रकाश का अपवर्तन', titleEn: 'Refraction of Light', questionsCount: 35 },
  { id: 'phy_ch_3', chapterNumber: 3, title: 'मानव नेत्र तथा रंगबिरंगा संसार', titleEn: 'Human Eye & Colourful World', questionsCount: 35 },
  { id: 'phy_ch_4', chapterNumber: 4, title: 'विद्युत धारा', titleEn: 'Electric Current', questionsCount: 35 },
  { id: 'phy_ch_5', chapterNumber: 5, title: 'विद्युत धारा के चुंबकीय प्रभाव', titleEn: 'Magnetic Effects of Current', questionsCount: 35 },
  { id: 'phy_ch_6', chapterNumber: 6, title: 'ऊर्जा के स्रोत', titleEn: 'Sources of Energy', questionsCount: 30 },
  { id: 'phy_ch_7', chapterNumber: 7, title: 'प्रकाश परावर्तन - विशिष्ट प्रश्न', titleEn: 'Light Reflection Advanced', questionsCount: 35 },
  { id: 'phy_ch_8', chapterNumber: 8, title: 'प्रकाश अपवर्तन - लेंस व प्रिज्म', titleEn: 'Lenses & Prism', questionsCount: 35 },
  { id: 'phy_ch_9', chapterNumber: 9, title: 'मानव नेत्र दृष्टि दोष व निवारण', titleEn: 'Vision Defects & Correction', questionsCount: 30 },
  { id: 'phy_ch_10', chapterNumber: 10, title: 'विद्युत विभव एवं ओम का नियम', titleEn: 'Electric Potential & Ohm\'s Law', questionsCount: 35 },
  { id: 'phy_ch_11', chapterNumber: 11, title: 'प्रतिरोधों का संयोजन एवं परिपथ', titleEn: 'Resistors & Circuits', questionsCount: 35 },
  { id: 'phy_ch_12', chapterNumber: 12, title: 'विद्युत शक्ति एवं ऊष्मीय प्रभाव', titleEn: 'Electric Power & Heating Effect', questionsCount: 35 },
  { id: 'phy_ch_13', chapterNumber: 13, title: 'चुंबकीय क्षेत्र एवं फ्लेमिंग नियम', titleEn: 'Magnetic Field & Rules', questionsCount: 30 },
  { id: 'phy_ch_14', chapterNumber: 14, title: 'विद्युत मोटर और विद्युत जनित्र', titleEn: 'Electric Motor & Generator', questionsCount: 30 },
  { id: 'phy_ch_15', chapterNumber: 15, title: 'पर्यावरण एवं ऊर्जा के वैकल्पिक स्रोत', titleEn: 'Environment & Alternate Energy', questionsCount: 30 },
];

export const PhysicsProgressTrackerModal: React.FC<PhysicsProgressTrackerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [completedList, setCompletedList] = useState<ChapterProgressRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadProgress = async () => {
    setIsLoading(true);
    const records = await getCompletedChapters('class-10');
    setCompletedList(records);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadProgress();
    }
    const handleUpdate = () => loadProgress();
    window.addEventListener(PROGRESS_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(PROGRESS_UPDATED_EVENT, handleUpdate);
  }, [isOpen]);

  const handleToggle = async (ch: typeof PHYSICS_CHAPTERS_LIST[0]) => {
    const chapterObj = {
      id: ch.id,
      slug: `physics-ch-${ch.chapterNumber}`,
      chapterNumber: ch.chapterNumber,
      title: ch.title,
      hindiTitle: ch.title,
      subjectId: 'physics',
      bookId: 'physics-book',
      classLevel: 'class-10' as const,
      notesAvailable: true,
      testsAvailable: true,
    };

    await toggleChapterCompletion(chapterObj, 'class-10', {
      id: 'physics',
      name: 'Physics',
      hindiName: 'भौतिकी (Physics)',
      slug: 'physics',
      classLevel: 'class-10',
      code: 'PHY',
      icon: 'Zap',
      description: 'Physics',
      booksCount: 1,
      totalChapters: 15
    } as any);
    await loadProgress();
  };

  const completedCount = PHYSICS_CHAPTERS_LIST.filter((ch) =>
    completedList.some((item) => item.chapterId === ch.id)
  ).length;

  const completionPercentage = Math.round((completedCount / PHYSICS_CHAPTERS_LIST.length) * 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                बिहार बोर्ड कक्षा 10 भौतिकी — प्रगति ट्रैकर
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
                500 प्रश्न बैंक सिलेबस
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">अध्याय प्रगति ट्रैकर (Chapter Progress Tracker)</h2>
            <p className="text-xs sm:text-sm text-blue-100">
              भौतिकी के सभी 15 अध्यायों की अध्ययन प्रगति मार्क करें और फ़ायरबेस क्लाउड प्रोफाइल पर सुरक्षित रखें।
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Banner */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 shrink-0 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                संपूर्ण भौतिकी पाठ्यक्रम प्रगति
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {completedCount} / {PHYSICS_CHAPTERS_LIST.length} अध्याय पूर्ण ({completionPercentage}%)
              </h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-600/20">
              {completionPercentage}%
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Chapters Checklist */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {PHYSICS_CHAPTERS_LIST.map((ch) => {
            const isDone = completedList.some((item) => item.chapterId === ch.id);
            return (
              <div
                key={ch.id}
                onClick={() => handleToggle(ch)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 shadow-xs ${
                  isDone
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                    : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-800 dark:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {ch.chapterNumber}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black leading-snug">
                      अध्याय {ch.chapterNumber}: {ch.title}
                    </h4>
                    <p className="text-xs opacity-75 font-semibold mt-0.5">
                      {ch.titleEn} • लगभग {ch.questionsCount} प्रश्न
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 ${
                    isDone
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {isDone ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>पूर्ण (Completed)</span>
                      </>
                    ) : (
                      <span>अपूर्ण (Pending)</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>ऑटो-सिंक फ़ायरबेस क्लाउड डेटाबेस</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-black text-white font-extrabold text-xs sm:text-sm transition-all cursor-pointer"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
