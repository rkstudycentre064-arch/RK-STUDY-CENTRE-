/**
 * RK STUDY CENTRE - Bihar Board Class 10 Physics 500 Question Bank Viewer
 * Interactive browser, filter by Part (A-H), search, answer key display, and print/download.
 */

import React, { useState, useMemo } from 'react';
import {
  Award,
  Search,
  BookOpen,
  Printer,
  Download,
  X,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Filter
} from 'lucide-react';
import { PHYSICS_500_QUESTIONS, QItem } from '../../data/physics500QuestionBankData';
import { RKStudyCenterLogo } from './RKStudyCenterLogo';

interface Physics500QuestionBankViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Physics500QuestionBankViewer: React.FC<Physics500QuestionBankViewerProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedPart, setSelectedPart] = useState<string>('Part A');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAnswersMap, setShowAnswersMap] = useState<Record<number, boolean>>({});

  const partsList = [
    { id: 'all', label: 'सभी 500 प्रश्न (All)' },
    { id: 'Part A', label: 'Part A: Objective (1-150)' },
    { id: 'Part B', label: 'Part B: Fill Blanks (151-200)' },
    { id: 'Part C', label: 'Part C: True/False (201-250)' },
    { id: 'Part D', label: 'Part D: Match (251-300)' },
    { id: 'Part E', label: 'Part E: V.Short (301-375)' },
    { id: 'Part F', label: 'Part F: Short (376-450)' },
    { id: 'Part G', label: 'Part G: Long (451-475)' },
    { id: 'Part H', label: 'Part H: Numerical (476-500)' },
  ];

  const filteredQuestions = useMemo(() => {
    return PHYSICS_500_QUESTIONS.filter((q) => {
      const matchPart = selectedPart === 'all' || q.part === selectedPart;
      const matchQuery =
        !searchQuery.trim() ||
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.chapter.toLowerCase().includes(searchQuery.toLowerCase());
      return matchPart && matchQuery;
    });
  }, [selectedPart, searchQuery]);

  const toggleAnswer = (id: number) => {
    setShowAnswersMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const revealAllAnswers = () => {
    const map: Record<number, boolean> = {};
    filteredQuestions.forEach((q) => {
      map[q.id] = true;
    });
    setShowAnswersMap(map);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                बिहार बोर्ड कक्षा 10 भौतिकी — 500 प्रश्न बैंक
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
                BSEB 2026-27 सम्पूर्ण सेट
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">500 Physics Ultimate Question Bank</h2>
            <p className="text-xs sm:text-sm text-indigo-100">
              संपूर्ण भौतिकी पाठ्यक्रम पर आधारित वस्तुनिष्ठ, लघु, दीर्घ और आंकिक प्रश्नों का महासंग्रह (उत्तर सहित)।
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="प्रिंट / PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">प्रिंट</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="बंद करें"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="प्रश्नों, उत्तरों या अध्यायों में खोजें..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={revealAllAnswers}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
            >
              सभी उत्तर देखें (Reveal All)
            </button>
          </div>
        </div>

        {/* Part Selector Pills */}
        <div className="px-6 py-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          {partsList.map((part) => (
            <button
              key={part.id}
              onClick={() => setSelectedPart(part.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                selectedPart === part.id
                  ? 'bg-indigo-900 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {part.label}
            </button>
          ))}
        </div>

        {/* Questions List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                कोई प्रश्न नहीं मिला
              </h3>
            </div>
          ) : (
            <div className="space-y-4">
              {(filteredQuestions || []).map((q) => {
                const isAnswerShown = showAnswersMap[q.id];
                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-all shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-black text-xs">
                          प्रश्न #{q.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs">
                          {q.part}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">• {q.chapter}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                        q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                        q.difficulty === 'Moderate' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-relaxed">
                      {q.question}
                    </h4>

                    {q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                              q.correctAnswer === opt
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between gap-2 flex-wrap border-t border-slate-100 dark:border-slate-700/60">
                      <button
                        onClick={() => toggleAnswer(q.id)}
                        className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isAnswerShown ? 'उत्तर छुपाएं' : 'उत्तर देखें (Show Answer)'}</span>
                      </button>

                      <span className="text-xs text-slate-400 font-semibold">RK STUDY CENTRE - BSEB 2026</span>
                    </div>

                    {isAnswerShown && (
                      <div className="mt-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-1.5 animate-in fade-in duration-150">
                        <div className="text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          आदर्श उत्तर व व्याख्या:
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {q.answer}
                        </p>
                        {q.explanation && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>कुल {PHYSICS_500_QUESTIONS.length} प्रश्न उपलब्ध</span>
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
