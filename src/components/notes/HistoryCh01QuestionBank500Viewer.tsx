import React, { useState, useMemo } from 'react';
import { CLASS_10_HISTORY_CH01_QUESTION_BANK_500, QuestionItem } from '../../data/class10HistoryCh01QuestionBank500';
import { 
  BookOpen, 
  Award, 
  CheckCircle2, 
  FileText, 
  ArrowLeft, 
  Search, 
  Bookmark, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Filter,
  Layers,
  HelpCircle,
  Zap,
  Check
} from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const HistoryCh01QuestionBank500Viewer: React.FC<Props> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sections' | 'answerKey' | 'pyq' | 'vvi'>('sections');
  const [activeSection, setActiveSection] = useState<string>('sectionA');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sectionA: true,
    sectionB: true,
    sectionC: true,
    sectionD: true,
    sectionE: true,
    sectionF: true,
    sectionG: true,
    sectionH: true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});
  const [allAnswersExpanded, setAllAnswersExpanded] = useState<boolean>(true);
  const [pyqOnly, setPyqOnly] = useState<boolean>(false);
  const [answerKeySection, setAnswerKeySection] = useState<'sectionA' | 'sectionB' | 'sectionC' | 'sectionD' | 'sectionE' | 'sectionF' | 'sectionG' | 'sectionH'>('sectionA');

  const qb = CLASS_10_HISTORY_CH01_QUESTION_BANK_500;

  // Determine which section a question ID belongs to
  const getSectionKeyForQuestion = (id: number): string => {
    if (id >= 1 && id <= 100) return 'sectionA';
    if (id >= 101 && id <= 200) return 'sectionB';
    if (id >= 201 && id <= 250) return 'sectionC';
    if (id >= 251 && id <= 300) return 'sectionD';
    if (id >= 301 && id <= 375) return 'sectionE';
    if (id >= 376 && id <= 435) return 'sectionF';
    if (id >= 436 && id <= 480) return 'sectionG';
    if (id >= 481 && id <= 500) return 'sectionH';
    return 'sectionA';
  };

  // Toggle individual question answer visibility
  const toggleExpand = (id: number) => {
    setExpandedIds(prev => ({ 
      ...prev, 
      [id]: prev[id] !== undefined ? !prev[id] : !allAnswersExpanded 
    }));
  };

  // Global toggle for all questions' answers
  const handleToggleExpandAllAnswers = () => {
    const nextState = !allAnswersExpanded;
    setAllAnswersExpanded(nextState);
    const updated: Record<number, boolean> = {};
    qb.questions.forEach(q => {
      updated[q.id] = nextState;
    });
    setExpandedIds(updated);
  };

  // Toggle expand / collapse for a single section header
  const handleToggleSectionHeader = (secKey: string) => {
    setExpandedSections(prev => {
      const currentState = isSectionExpanded(secKey);
      const willBeOpen = !currentState;
      if (willBeOpen) {
        setActiveSection(secKey);
      }
      return {
        ...prev,
        [secKey]: willBeOpen
      };
    });
  };

  // Select and scroll to a section, ensuring it remains open on mobile
  const handleSelectSection = (secKey: string) => {
    setActiveSection(secKey);
    setExpandedSections(prev => ({
      ...prev,
      [secKey]: true // Ensure active section is open
    }));

    setTimeout(() => {
      const el = document.getElementById(`section-card-${secKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  // Expand all sections
  const handleExpandAllSections = () => {
    const updated: Record<string, boolean> = {};
    Object.keys(qb.sections).forEach(key => {
      updated[key] = true;
    });
    setExpandedSections(updated);
  };

  // Collapse non-active sections, keeping the active section open on mobile
  const handleCollapseOtherSections = () => {
    const updated: Record<string, boolean> = {};
    Object.keys(qb.sections).forEach(key => {
      // Ensure active section remains open for mobile user experience
      updated[key] = key === activeSection;
    });
    setExpandedSections(updated);
  };

  // Jump from PYQ/VVI list directly to question card
  const handleJumpToQuestion = (questionText: string) => {
    const query = questionText.split('?')[0].split('की')[0].trim();
    const matched = qb.questions.find(q => q.question.includes(query) || questionText.includes(q.question.slice(0, 15)));
    if (matched) {
      const secKey = getSectionKeyForQuestion(matched.id);
      setActiveTab('sections');
      setActiveSection(secKey);
      setExpandedSections(prev => ({ ...prev, [secKey]: true }));
      setExpandedIds(prev => ({ ...prev, [matched.id]: true }));
      setTimeout(() => {
        const el = document.getElementById(`q-${matched.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      setSearchTerm(query);
      setActiveTab('sections');
    }
  };

  // Filtered and grouped sections
  const sectionDataList = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    
    return Object.entries(qb.sections).map(([key, sec]) => {
      const allSecQuestions = qb.questions.filter(q => getSectionKeyForQuestion(q.id) === key);
      
      const filtered = allSecQuestions.filter(q => {
        if (pyqOnly && !q.isPyq) return false;
        if (term !== '') {
          return q.question.toLowerCase().includes(term) ||
            (q.answer && q.answer.toLowerCase().includes(term)) ||
            (q.pyqYear && q.pyqYear.toLowerCase().includes(term)) ||
            (q.explanation && q.explanation.toLowerCase().includes(term));
        }
        return true;
      });

      return {
        key,
        ...sec,
        allQuestions: allSecQuestions,
        matchingQuestions: filtered,
        hasMatches: filtered.length > 0,
      };
    });
  }, [qb.sections, qb.questions, searchTerm, pyqOnly]);

  // Determine if a section should be open:
  // 1. If searching, auto-expand any section that contains matching questions.
  // 2. Otherwise respect expandedSections state, guaranteeing active section remains open when focused.
  const isSectionExpanded = (key: string): boolean => {
    if (searchTerm.trim() !== '') {
      const secData = sectionDataList.find(s => s.key === key);
      return (secData?.matchingQuestions.length || 0) > 0;
    }
    if (key === activeSection) {
      // Ensure the active section is open by default
      return expandedSections[key] !== false;
    }
    return !!expandedSections[key];
  };

  // Toggle all question answers inside a single section
  const toggleSectionAnswers = (questions: QuestionItem[]) => {
    setExpandedIds(prev => {
      const updated = { ...prev };
      const areAllCurrentlyOpen = questions.every(q => {
        const isOpen = prev[q.id] !== undefined ? prev[q.id] : allAnswersExpanded;
        return isOpen;
      });
      const newState = !areAllCurrentlyOpen;
      questions.forEach(q => {
        updated[q.id] = newState;
      });
      return updated;
    });
  };

  // Total matching questions across all sections
  const totalMatchingCount = useMemo(() => {
    return sectionDataList.reduce((acc, s) => acc + s.matchingQuestions.length, 0);
  }, [sectionDataList]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> पीछे लौटें (Back)
          </button>
          <div className="text-right flex items-center gap-2">
            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Section A to H (1-500 संपूर्ण प्रश्न) 100% Active
            </span>
            <span className="hidden sm:inline-block text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full font-semibold">
              BSEB Class 10 Board Exam Expert Bank
            </span>
          </div>
        </div>

        {/* Title Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-8 h-8 text-yellow-300 animate-pulse" />
            <span className="text-yellow-300 font-bold uppercase tracking-wider text-xs sm:text-sm">
              विशेषज्ञ शिक्षक द्वारा तैयार • 500 प्रश्नों का मास्टर क्वेश्चन बैंक (Clickable Sections & Q&A)
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold mb-3 leading-tight">
            {qb.title}
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base max-w-3xl">
            कक्षा 10वीं इतिहास अध्याय 01 (यूरोप में राष्ट्रवाद) के सभी 500 प्रश्न और PYQs पूर्ण उत्तर, व्याख्या और विकल्पों के साथ उपलब्ध हैं। <strong>प्रत्येक खंड (Section Header) पर क्लिक करके उसके प्रश्नों की सूची को खोलें या समेटें।</strong>
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setActiveTab('sections');
                handleSelectSection('sectionA');
                setSearchTerm('');
              }}
              className={`px-3 py-1.5 font-black rounded-lg text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'sectionA' && activeTab === 'sections'
                  ? 'bg-yellow-400 text-slate-950 ring-2 ring-white scale-105'
                  : 'bg-yellow-400/90 hover:bg-yellow-300 text-slate-950'
              }`}
            >
              <span>⚡ Section A (1-100 MCQ) [100 Qs]</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('sections');
                handleSelectSection('sectionB');
                setSearchTerm('');
              }}
              className={`px-3 py-1.5 font-black rounded-lg text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'sectionB' && activeTab === 'sections'
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-white scale-105'
                  : 'bg-amber-400/90 hover:bg-amber-300 text-slate-950'
              }`}
            >
              <span>🔥 Section B (101-200 रिक्त स्थान) [100 Qs]</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('sections');
                handleSelectSection('sectionC');
                setSearchTerm('');
              }}
              className={`px-3 py-1.5 font-black rounded-lg text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'sectionC' && activeTab === 'sections'
                  ? 'bg-teal-300 text-slate-950 ring-2 ring-white scale-105'
                  : 'bg-teal-300/90 hover:bg-teal-200 text-slate-950'
              }`}
            >
              <span>✅ Section C (201-250 सही/गलत) [50 Qs]</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('sections');
                handleSelectSection('sectionD');
                setSearchTerm('');
              }}
              className={`px-3 py-1.5 font-black rounded-lg text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'sectionD' && activeTab === 'sections'
                  ? 'bg-purple-300 text-slate-950 ring-2 ring-white scale-105'
                  : 'bg-purple-300/90 hover:bg-purple-200 text-slate-950'
              }`}
            >
              <span>🔗 Section D (251-300 सुमेलित करें) [50 Qs]</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('sections');
                handleSelectSection('sectionE');
                setSearchTerm('');
              }}
              className={`px-3 py-1.5 font-black rounded-lg text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'sectionE' && activeTab === 'sections'
                  ? 'bg-rose-400 text-slate-950 ring-2 ring-white scale-105'
                  : 'bg-rose-400/90 hover:bg-rose-300 text-slate-950'
              }`}
            >
              <span>📝 Section E (301-375 अति लघु) [75 Qs]</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('sections');
                handleSelectSection('sectionF');
                setSearchTerm('');
              }}
              className={`px-3 py-1.5 font-black rounded-lg text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'sectionF' && activeTab === 'sections'
                  ? 'bg-sky-300 text-slate-950 ring-2 ring-white scale-105'
                  : 'bg-sky-400/90 hover:bg-sky-300 text-slate-950'
              }`}
            >
              <span>📘 Section F (376-435 लघु उत्तरीय) [60 Qs]</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('sections');
                handleSelectSection('sectionG');
                setSearchTerm('');
              }}
              className={`px-3 py-1.5 font-black rounded-lg text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'sectionG' && activeTab === 'sections'
                  ? 'bg-amber-300 text-slate-950 ring-2 ring-white scale-105'
                  : 'bg-amber-400/90 hover:bg-amber-300 text-slate-950'
              }`}
            >
              <span>📜 Section G (436-480 दीर्घ उत्तरीय) [45 Qs]</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('sections');
                handleSelectSection('sectionH');
                setSearchTerm('');
              }}
              className={`px-3 py-1.5 font-black rounded-lg text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'sectionH' && activeTab === 'sections'
                  ? 'bg-rose-300 text-slate-950 ring-2 ring-white scale-105'
                  : 'bg-rose-400/90 hover:bg-rose-300 text-slate-950'
              }`}
            >
              <span>💡 Section H (481-500 कारण बताएँ) [20 Qs]</span>
            </button>
            <span className="px-3 py-1.5 bg-white/20 backdrop-blur rounded-lg text-xs font-semibold">
              कुल प्रश्न: 500
            </span>
            <span className="px-3 py-1.5 bg-white/20 backdrop-blur rounded-lg text-xs font-semibold">
              8 खंड (Sections A - H)
            </span>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('sections')}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'sections'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" /> प्रश्न बैंक (500 Questions)
          </button>
          <button
            onClick={() => setActiveTab('answerKey')}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'answerKey'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> Answer Key (1-500 उत्तर कुंजी)
          </button>
          <button
            onClick={() => setActiveTab('pyq')}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'pyq'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Award className="w-4 h-4" /> Important PYQ List
          </button>
          <button
            onClick={() => setActiveTab('vvi')}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'vvi'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Bookmark className="w-4 h-4" /> Top VVI Questions
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" /> अवलोकन (Overview)
          </button>
        </div>

        {/* Tab Content: Sections / Question Bank */}
        {activeTab === 'sections' && (
          <div className="space-y-6">
            {/* Quick Section Switcher & Controls Toolbar */}
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
              
              {/* Mobile and Desktop Quick Jump Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-500" /> त्वरित नेविगेशन (Quick Jump to Section):
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    सक्रिय खंड: <strong className="text-indigo-600 dark:text-indigo-400">{qb.sections[activeSection as keyof typeof qb.sections]?.title.split('—')[0]}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {Object.entries(qb.sections).map(([key, sec]) => {
                    const isActive = activeSection === key;
                    const isOpen = isSectionExpanded(key);
                    const isFullyActive = key === 'sectionA' || key === 'sectionB' || key === 'sectionC' || key === 'sectionD' || key === 'sectionE' || key === 'sectionF' || key === 'sectionG' || key === 'sectionH';
                    return (
                      <button
                        key={key}
                        onClick={() => handleSelectSection(key)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          isActive
                            ? key === 'sectionB'
                              ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
                              : key === 'sectionC'
                              ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300'
                              : key === 'sectionD'
                              ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-300'
                              : key === 'sectionE'
                              ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-300'
                              : key === 'sectionF'
                              ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-300'
                              : key === 'sectionG'
                              ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-300'
                              : key === 'sectionH'
                              ? 'bg-rose-700 text-white shadow-md ring-2 ring-rose-400'
                              : 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300'
                            : 'bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        <span>{sec.title.split('—')[0]}</span>
                        <span className="text-[10px] opacity-80">({sec.range.replace('प्रश्न ', '')})</span>
                        {isFullyActive && (
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                            isActive 
                              ? 'bg-slate-900 text-white' 
                              : key === 'sectionB' 
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-200' 
                              : key === 'sectionC' 
                              ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200' 
                              : key === 'sectionD' 
                              ? 'bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-200' 
                              : key === 'sectionE' 
                              ? 'bg-rose-100 text-rose-900 dark:bg-rose-900 dark:text-rose-200' 
                              : key === 'sectionF' 
                              ? 'bg-sky-100 text-sky-900 dark:bg-sky-900 dark:text-sky-200' 
                              : key === 'sectionG'
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-200'
                              : key === 'sectionH'
                              ? 'bg-rose-100 text-rose-900 dark:bg-rose-900 dark:text-rose-200'
                              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                          }`}>
                            {key === 'sectionH' ? '20 Qs' : key === 'sectionG' ? '45 Qs' : key === 'sectionF' ? '60 Qs' : key === 'sectionE' ? '75 Qs' : key === 'sectionC' || key === 'sectionD' ? '50 Qs' : '100 Qs'}
                          </span>
                        )}
                        {isOpen ? (
                          <ChevronUp className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section Controls and Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleExpandAllSections}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
                    <span>सभी सेक्शन खोलें (Expand All)</span>
                  </button>

                  <button
                    onClick={handleCollapseOtherSections}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ChevronUp className="w-3.5 h-3.5 text-rose-500" />
                    <span>केवल सक्रिय रखें (Focus Active)</span>
                  </button>

                  <button
                    onClick={handleToggleExpandAllAnswers}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {allAnswersExpanded ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                    <span>{allAnswersExpanded ? 'सभी उत्तर छिपाएँ' : 'सभी उत्तर देखें'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPyqOnly(!pyqOnly)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      pyqOnly
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>केवल PYQ ({pyqOnly ? 'चालू' : 'बंद'})</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="किसी भी प्रश्न, विकल्प, वर्ष या व्याख्या से खोजें (जैसे: नेपोलियन, बिस्मार्क, 1871, सेडान, मेजिनी)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-16 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded cursor-pointer transition font-medium"
                  >
                    हटाएँ
                  </button>
                )}
              </div>

              {/* Status and Active Info */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span>
                  दिखाए जा रहे प्रश्न: <strong>{totalMatchingCount}</strong>
                  {searchTerm && ` (सर्च परिणाम: "${searchTerm}")`}
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> मोबाइल फ्रेंडली: सक्रिय सेक्शन हमेशा खुला रहता है
                </span>
              </div>
            </div>

            {/* Collapsible Sections List */}
            <div className="space-y-6">
              {sectionDataList.map((sec) => {
                const isSecActive = activeSection === sec.key;
                const isExpanded = isSectionExpanded(sec.key);
                const isSectionA = sec.key === 'sectionA';
                const isSectionB = sec.key === 'sectionB';
                const isSectionC = sec.key === 'sectionC';
                const isSectionD = sec.key === 'sectionD';
                const isSectionE = sec.key === 'sectionE';
                const isSectionF = sec.key === 'sectionF';
                const isSectionG = sec.key === 'sectionG';
                const isSectionH = sec.key === 'sectionH';
                const isFullyActive = isSectionA || isSectionB || isSectionC || isSectionD || isSectionE || isSectionF || isSectionG || isSectionH;

                return (
                  <div
                    key={sec.key}
                    id={`section-card-${sec.key}`}
                    className={`rounded-2xl transition duration-200 shadow-sm border ${
                      isSecActive
                        ? isSectionB
                          ? 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-300/40 dark:ring-amber-500/20 bg-white dark:bg-slate-800'
                          : isSectionC
                          ? 'border-emerald-400 dark:border-emerald-500 ring-2 ring-emerald-300/40 dark:ring-emerald-500/20 bg-white dark:bg-slate-800'
                          : isSectionD
                          ? 'border-purple-400 dark:border-purple-500 ring-2 ring-purple-300/40 dark:ring-purple-500/20 bg-white dark:bg-slate-800'
                          : isSectionE
                          ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-300/40 dark:ring-rose-500/20 bg-white dark:bg-slate-800'
                          : isSectionF
                          ? 'border-sky-400 dark:border-sky-500 ring-2 ring-sky-300/40 dark:ring-sky-500/20 bg-white dark:bg-slate-800'
                          : isSectionG
                          ? 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-300/40 dark:ring-amber-500/20 bg-white dark:bg-slate-800'
                          : isSectionH
                          ? 'border-rose-500 dark:border-rose-600 ring-2 ring-rose-300/50 dark:ring-rose-500/30 bg-white dark:bg-slate-800'
                          : 'border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-300/40 dark:ring-indigo-500/20 bg-white dark:bg-slate-800'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {/* Clickable Section Header */}
                    <div
                      onClick={() => handleToggleSectionHeader(sec.key)}
                      role="button"
                      tabIndex={0}
                      className={`w-full p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer select-none rounded-2xl transition ${
                        isSecActive
                          ? isSectionB
                            ? 'bg-gradient-to-r from-amber-50/70 via-orange-50/50 to-transparent dark:from-amber-950/20 dark:via-orange-950/10 dark:to-transparent'
                            : isSectionC
                            ? 'bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-transparent dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-transparent'
                            : isSectionD
                            ? 'bg-gradient-to-r from-purple-50/70 via-fuchsia-50/50 to-transparent dark:from-purple-950/20 dark:via-fuchsia-950/10 dark:to-transparent'
                            : isSectionE
                            ? 'bg-gradient-to-r from-rose-50/70 via-pink-50/50 to-transparent dark:from-rose-950/20 dark:via-pink-950/10 dark:to-transparent'
                            : isSectionF
                            ? 'bg-gradient-to-r from-sky-50/70 via-blue-50/50 to-transparent dark:from-sky-950/20 dark:via-blue-950/10 dark:to-transparent'
                            : isSectionG
                            ? 'bg-gradient-to-r from-amber-50/70 via-orange-50/50 to-transparent dark:from-amber-950/20 dark:via-orange-950/10 dark:to-transparent'
                            : isSectionH
                            ? 'bg-gradient-to-r from-rose-50/70 via-red-50/50 to-transparent dark:from-rose-950/20 dark:via-red-950/10 dark:to-transparent'
                            : 'bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-transparent dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-transparent'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      {/* Left: Section Titles & Badges */}
                      <div className="flex items-start gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm shadow-sm ${
                          isSectionA
                            ? 'bg-indigo-600 text-white'
                            : isSectionB
                            ? 'bg-amber-500 text-slate-950'
                            : isSectionC
                            ? 'bg-emerald-600 text-white'
                            : isSectionD
                            ? 'bg-purple-600 text-white'
                            : isSectionE
                            ? 'bg-rose-600 text-white'
                            : isSectionF
                            ? 'bg-sky-600 text-white'
                            : isSectionG
                            ? 'bg-amber-600 text-white'
                            : isSectionH
                            ? 'bg-rose-700 text-white'
                            : 'bg-slate-700 text-white dark:bg-slate-700'
                        }`}>
                          {sec.key.replace('section', '')}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                              {sec.title}
                            </h2>

                            {isFullyActive && (
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                isSectionB
                                  ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                                  : isSectionC
                                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                                  : isSectionD
                                  ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-700'
                                  : isSectionE
                                  ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-700'
                                  : isSectionF
                                  ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-900 dark:text-sky-200 border border-sky-300 dark:border-sky-700'
                                  : isSectionG
                                  ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                                  : isSectionH
                                  ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-700'
                                  : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700'
                              }`}>
                                {isSectionH ? 'पूर्ण 20 कारण प्रश्न ACTIVE' : isSectionG ? 'पूर्ण 45 दीर्घ प्रश्न ACTIVE' : isSectionF ? 'पूर्ण 60 प्रश्न ACTIVE' : isSectionE ? 'पूर्ण 75 प्रश्न ACTIVE' : isSectionC || isSectionD ? 'पूर्ण 50 प्रश्न ACTIVE' : 'पूर्ण 100 प्रश्न ACTIVE'}
                              </span>
                            )}

                            {isSecActive && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                सक्रिय (Active)
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{sec.range}</span>
                            <span>•</span>
                            <span>{sec.description}</span>
                            {searchTerm && (
                              <>
                                <span>•</span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                  {sec.matchingQuestions.length} मेल खाते प्रश्न
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Right: Expand/Collapse Button & Question Count */}
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700">
                        <div className="text-left sm:text-right">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                            {sec.matchingQuestions.length} / {sec.count} प्रश्न
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {isExpanded ? 'क्लिक करके समेटें' : `क्लिक करके ${sec.count} प्रश्न देखें`}
                          </span>
                        </div>

                        <div className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                          isExpanded
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                        }`}>
                          <span>{isExpanded ? 'समेटें (Collapse)' : 'खोलें (Expand)'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section Body (Visible when Expanded) */}
                    {isExpanded && (
                      <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/30 rounded-b-2xl space-y-4">
                        
                        {/* Section Sub-toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span>
                              {sec.title} — कुल <strong>{sec.matchingQuestions.length}</strong> प्रश्न उपलब्ध हैं
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSectionAnswers(sec.matchingQuestions);
                              }}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5 text-indigo-500" />
                              <span>इस खंड के उत्तर टॉगल करें</span>
                            </button>
                          </div>
                        </div>

                        {/* Questions List for this Section */}
                        {sec.matchingQuestions.length === 0 ? (
                          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                            इस खंड में आपकी खोज से मेल खाता कोई प्रश्न नहीं मिला।
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {sec.matchingQuestions.map((item) => {
                              const isQuestionOpen = expandedIds[item.id] !== undefined ? expandedIds[item.id] : allAnswersExpanded;
                              const isFillInTheBlank = item.type === 'FillInTheBlank';
                              const isMCQ = item.type === 'MCQ';
                              const isMatch = item.type === 'Match';
                              const isTrueFalse = item.type === 'TrueFalse';
                              const isVeryShort = item.type === 'VeryShort';
                              const isShort = item.type === 'Short';
                              const isLong = item.type === 'Long';
                              const isReason = item.type === 'Reason';

                              return (
                                <div
                                  key={item.id}
                                  id={`q-${item.id}`}
                                  className={`bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm border transition ${
                                    isFillInTheBlank
                                      ? 'border-amber-200 dark:border-amber-800/60 hover:border-amber-400'
                                      : isMatch
                                      ? 'border-purple-200 dark:border-purple-800/60 hover:border-purple-400'
                                      : isTrueFalse
                                      ? 'border-teal-200 dark:border-teal-800/60 hover:border-teal-400'
                                      : isVeryShort
                                      ? 'border-rose-300 dark:border-rose-800/70 hover:border-rose-500 shadow-rose-100/30'
                                      : isShort
                                      ? 'border-sky-300 dark:border-sky-800/70 hover:border-sky-500 shadow-sky-100/30'
                                      : isLong
                                      ? 'border-amber-300 dark:border-amber-800/70 hover:border-amber-500 shadow-amber-100/30 ring-1 ring-amber-400/20'
                                      : isReason
                                      ? 'border-rose-300 dark:border-rose-800/80 hover:border-rose-500 shadow-rose-100/30 ring-1 ring-rose-400/30'
                                      : isMCQ
                                      ? 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500'
                                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                                  }`}
                                >
                                  {/* Question Card Header */}
                                  <div
                                    onClick={() => toggleExpand(item.id)}
                                    className="flex items-center justify-between cursor-pointer select-none"
                                  >
                                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                      <span className={`text-xs font-black px-2.5 py-1 rounded-md ${
                                        item.id >= 101 && item.id <= 200
                                          ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200'
                                          : item.id >= 201 && item.id <= 250
                                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                                          : item.id >= 251 && item.id <= 300
                                          ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200'
                                          : item.id >= 301 && item.id <= 375
                                          ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200 font-extrabold'
                                          : item.id >= 376 && item.id <= 435
                                          ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-900 dark:text-sky-200 font-extrabold'
                                          : item.id >= 436 && item.id <= 480
                                          ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-extrabold ring-1 ring-amber-400/40'
                                          : item.id >= 481 && item.id <= 500
                                          ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200 font-extrabold ring-1 ring-rose-400/40'
                                          : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                                      }`}>
                                        Q.{item.id}
                                      </span>
                                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                        isVeryShort
                                          ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 font-bold'
                                          : isShort
                                          ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200 font-bold'
                                          : isLong
                                          ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 font-bold'
                                          : isReason
                                          ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 font-bold'
                                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                      }`}>
                                        {isFillInTheBlank 
                                          ? 'रिक्त स्थान भरें' 
                                          : isTrueFalse 
                                          ? 'सही / गलत (T/F)' 
                                          : isMatch 
                                          ? 'सुमेलित करें (Match)' 
                                          : isVeryShort 
                                          ? 'अति लघु उत्तरीय (Very Short)' 
                                          : isShort 
                                          ? 'लघु उत्तरीय (Short Answer)' 
                                          : isLong
                                          ? 'दीर्घ उत्तरीय (Long Answer)'
                                          : isReason
                                          ? 'कारण बताएँ (Give Reason • आसान भाषा)'
                                          : item.type}
                                      </span>
                                      {item.topic && (
                                        <span className="text-[11px] px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-full font-semibold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                                          📌 {item.topic}
                                        </span>
                                      )}
                                      {item.source && (
                                        <span className="text-[11px] px-2.5 py-0.5 bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 rounded-full font-medium border border-slate-300 dark:border-slate-600 flex items-center gap-1">
                                          📖 {item.source}
                                        </span>
                                      )}
                                      {item.isPyq && (
                                        <span className="text-xs px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 rounded-full font-bold flex items-center gap-1">
                                          <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                          PYQ {item.pyqYear}
                                        </span>
                                      )}
                                      {item.isExpected && (
                                        <span className="text-xs px-2.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full font-semibold">
                                          Expected
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                                        item.difficulty === 'Easy' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' :
                                        item.difficulty === 'Medium' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200' :
                                        'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200'
                                      }`}>
                                        {item.difficulty}
                                      </span>
                                      {isQuestionOpen ? (
                                        <ChevronUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                      ) : (
                                        <ChevronDown className="w-5 h-5 text-slate-400" />
                                      )}
                                    </div>
                                  </div>

                                  {/* Question Text */}
                                  <p
                                    onClick={() => toggleExpand(item.id)}
                                    className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-2.5 mb-3 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                                  >
                                    {item.question}
                                  </p>

                                  {/* Options Grid (For MCQs) */}
                                  {item.options && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                      {Object.entries(item.options).map(([key, val]) => {
                                        const isCorrect = item.answer === key;
                                        return (
                                          <div
                                            key={key}
                                            className={`p-2.5 rounded-xl border text-sm transition flex items-start gap-2 ${
                                              isQuestionOpen && isCorrect
                                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 text-emerald-900 dark:text-emerald-100 font-bold shadow-sm'
                                                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                            }`}
                                          >
                                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-extrabold shrink-0 ${
                                              isQuestionOpen && isCorrect
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                            }`}>
                                              {key}
                                            </span>
                                            <span>{val}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* Expandable Explanation / Answer box */}
                                  {isQuestionOpen && (
                                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
                                      <div className={`p-3.5 sm:p-4 rounded-xl border text-sm ${
                                        isFillInTheBlank
                                          ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                                          : isMatch
                                          ? 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800'
                                          : isTrueFalse
                                          ? 'bg-teal-50/80 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800'
                                          : isVeryShort
                                          ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                                          : isShort
                                          ? 'bg-sky-50/80 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800'
                                          : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                                      }`}>
                                        <div className="flex items-center gap-2 font-extrabold mb-1.5 flex-wrap">
                                          <CheckCircle2 className={`w-4 h-4 shrink-0 ${
                                            isMatch 
                                              ? 'text-purple-600 dark:text-purple-400' 
                                              : isVeryShort 
                                              ? 'text-rose-600 dark:text-rose-400' 
                                              : isShort
                                              ? 'text-sky-600 dark:text-sky-400'
                                              : 'text-emerald-600 dark:text-emerald-400'
                                          }`} />
                                          {isMCQ ? (
                                            <span className="text-emerald-800 dark:text-emerald-300">
                                              सही उत्तर: विकल्प ({item.answer}) {item.options?.[item.answer as keyof typeof item.options] || ''}
                                            </span>
                                          ) : isFillInTheBlank ? (
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="text-slate-800 dark:text-slate-200">रिक्त स्थान का सही उत्तर:</span>
                                              <span className="px-3 py-1 bg-amber-400 dark:bg-amber-500 text-slate-950 font-black rounded-lg text-sm shadow-sm">
                                                {item.answer}
                                              </span>
                                            </div>
                                          ) : isMatch ? (
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="text-slate-800 dark:text-slate-200">सुमेलित सही जोड़ा (Match):</span>
                                              <span className="px-3 py-1 bg-purple-600 dark:bg-purple-500 text-white font-black rounded-lg text-sm shadow-sm flex items-center gap-1.5">
                                                <span>🔗</span> {item.answer}
                                              </span>
                                            </div>
                                          ) : isTrueFalse ? (
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="text-slate-800 dark:text-slate-200">कथन की सत्यता:</span>
                                              <span className={`px-3 py-1 font-black rounded-lg text-sm shadow-sm ${
                                                item.answer === 'सत्य' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                                              }`}>
                                                {item.answer === 'सत्य' ? '✓ सत्य (True)' : '✗ असत्य (False)'}
                                              </span>
                                            </div>
                                          ) : isVeryShort ? (
                                            <div className="w-full space-y-2">
                                              <div className="flex items-center justify-between flex-wrap gap-2 text-rose-800 dark:text-rose-300">
                                                <span className="text-xs uppercase tracking-wide font-extrabold flex items-center gap-1.5">
                                                  📝 मानक उत्तर (Standard Board Answer):
                                                </span>
                                                {item.topic && (
                                                  <span className="text-xs font-semibold bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-700">
                                                    विषय: {item.topic}
                                                  </span>
                                                )}
                                              </div>
                                              {/* Big text style Hindi language answer */}
                                              <div className="p-4 sm:p-5 bg-white/90 dark:bg-slate-900/80 rounded-2xl border-l-4 border-rose-500 shadow-sm">
                                                <p className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-rose-50 leading-relaxed font-sans select-text">
                                                  {item.answer}
                                                </p>
                                              </div>
                                            </div>
                                          ) : isShort ? (
                                            <div className="w-full space-y-2">
                                              <div className="flex items-center justify-between flex-wrap gap-2 text-sky-800 dark:text-sky-300">
                                                <span className="text-xs uppercase tracking-wide font-extrabold flex items-center gap-1.5">
                                                  📘 आदर्श बोर्ड उत्तर (Model Short Answer):
                                                </span>
                                                {item.topic && (
                                                  <span className="text-xs font-semibold bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-700">
                                                    विषय: {item.topic}
                                                  </span>
                                                )}
                                              </div>
                                              {/* Big text style Hindi language answer */}
                                              <div className="p-4 sm:p-5 bg-white/90 dark:bg-slate-900/80 rounded-2xl border-l-4 border-sky-500 shadow-sm">
                                                <div className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-sky-50 leading-relaxed font-sans select-text whitespace-pre-line">
                                                  {item.answer}
                                                </div>
                                              </div>
                                            </div>
                                          ) : isLong ? (
                                            <div className="w-full space-y-3">
                                              <div className="flex items-center justify-between flex-wrap gap-2 text-amber-900 dark:text-amber-200">
                                                <span className="text-xs uppercase tracking-wide font-black flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/70 text-amber-900 dark:text-amber-200 px-3 py-1 rounded-lg border border-amber-300 dark:border-amber-700">
                                                  📜 आदर्श बोर्ड दीर्घ उत्तरीय उत्तर (Model Long Answer • 5 अंक • आसान भाषा):
                                                </span>
                                                {item.topic && (
                                                  <span className="text-xs font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-700 shadow-xs">
                                                    विषय: {item.topic}
                                                  </span>
                                                )}
                                              </div>
                                              {/* Big text style Hindi language answer */}
                                              <div className="p-5 sm:p-6 bg-amber-50/50 dark:bg-slate-900/90 rounded-2xl border-l-4 border-amber-500 shadow-md">
                                                <div className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-amber-50 leading-relaxed font-sans select-text whitespace-pre-line tracking-wide">
                                                  {item.answer}
                                                </div>
                                              </div>
                                            </div>
                                          ) : isReason ? (
                                            <div className="w-full space-y-3">
                                              <div className="flex items-center justify-between flex-wrap gap-2 text-rose-900 dark:text-rose-200">
                                                <span className="text-xs uppercase tracking-wide font-black flex items-center gap-1.5 bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 px-3 py-1 rounded-lg border border-rose-300 dark:border-rose-700">
                                                  💡 ऐतिहासिक कारण व तार्किक विश्लेषण (Reason & Analysis • आसान भाषा में उत्तर):
                                                </span>
                                                {item.topic && (
                                                  <span className="text-xs font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 px-3 py-1 rounded-full border border-rose-300 dark:border-rose-700 shadow-xs">
                                                    विषय: {item.topic}
                                                  </span>
                                                )}
                                              </div>
                                              {/* Big text style Hindi language answer */}
                                              <div className="p-5 sm:p-6 bg-rose-50/40 dark:bg-slate-900/90 rounded-2xl border-l-4 border-rose-500 shadow-md">
                                                <div className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-rose-50 leading-relaxed font-sans select-text whitespace-pre-line tracking-wide">
                                                  {item.answer}
                                                </div>
                                              </div>
                                            </div>
                                          ) : (
                                            <span className="text-emerald-800 dark:text-emerald-300">
                                              सही उत्तर: {item.answer}
                                            </span>
                                          )}
                                        </div>
                                        {item.explanation && (
                                          <div className={`mt-2 p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                                            isVeryShort 
                                              ? 'bg-rose-100/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-slate-800 dark:text-slate-200' 
                                              : isShort
                                              ? 'bg-sky-100/50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/50 text-slate-800 dark:text-slate-200'
                                              : isLong
                                              ? 'bg-amber-100/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/70 text-slate-800 dark:text-slate-200'
                                              : isReason
                                              ? 'bg-rose-100/60 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/70 text-slate-800 dark:text-slate-200'
                                              : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                          }`}>
                                            <strong className="text-rose-700 dark:text-rose-400 font-bold">🎯 परीक्षा सारांश व मुख्य कारण:</strong> {item.explanation}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Content: Answer Key (Section A, Section B & Section C) */}
        {activeTab === 'answerKey' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-700 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <CheckCircle2 className="w-6 h-6" /> आधिकारिक उत्तर कुंजी (Answer Key 1-500 Master Key)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  बिहार बोर्ड मैट्रिक परीक्षा हेतु कक्षा 10 इतिहास अध्याय 01 — किसी भी प्रश्न पर क्लिक करके तुरंत उत्तर देखें
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setAnswerKeySection('sectionA')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    answerKeySection === 'sectionA'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Section A (1-100 MCQ)
                </button>
                <button
                  onClick={() => setAnswerKeySection('sectionB')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    answerKeySection === 'sectionB'
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ⚡ Section B (101-200 रिक्त स्थान)
                </button>
                <button
                  onClick={() => setAnswerKeySection('sectionC')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    answerKeySection === 'sectionC'
                      ? 'bg-emerald-600 text-white font-bold shadow'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ⚡ Section C (201-250 सही/गलत)
                </button>
                <button
                  onClick={() => setAnswerKeySection('sectionD')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    answerKeySection === 'sectionD'
                      ? 'bg-purple-600 text-white font-bold shadow'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ⚡ Section D (251-300 सुमेलित करें)
                </button>
                <button
                  onClick={() => setAnswerKeySection('sectionE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    answerKeySection === 'sectionE'
                      ? 'bg-rose-600 text-white font-bold shadow'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ⚡ Section E (301-375 अति लघु उत्तरीय)
                </button>
                <button
                  onClick={() => setAnswerKeySection('sectionF')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    answerKeySection === 'sectionF'
                      ? 'bg-sky-600 text-white font-bold shadow'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ⚡ Section F (376-435 लघु उत्तरीय)
                </button>
                <button
                  onClick={() => setAnswerKeySection('sectionG')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    answerKeySection === 'sectionG'
                      ? 'bg-amber-600 text-white font-black shadow'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ⚡ Section G (436-480 दीर्घ उत्तरीय)
                </button>
                <button
                  onClick={() => setAnswerKeySection('sectionH')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    answerKeySection === 'sectionH'
                      ? 'bg-rose-600 text-white font-black shadow'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ⚡ Section H (481-500 कारण बताएँ)
                </button>
              </div>
            </div>

            {answerKeySection === 'sectionA' ? (
              <div>
                <div className="flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>Section A: वस्तुनिष्ठ प्रश्न 1 से 100 की उत्तर तालिका (क्लिक करके प्रश्न खोलें)</span>
                  <button
                    onClick={() => {
                      setActiveTab('sections');
                      handleSelectSection('sectionA');
                    }}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                  >
                    Section A प्रश्न बैंक खोलें ➔
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
                  {qb.answerKey.map((ans) => (
                    <div 
                      key={ans.qNo} 
                      onClick={() => {
                        setActiveTab('sections');
                        handleSelectSection('sectionA');
                        setSearchTerm('');
                        setExpandedIds(prev => ({ ...prev, [ans.qNo]: true }));
                        setTimeout(() => {
                          const el = document.getElementById(`q-${ans.qNo}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      }}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center transition cursor-pointer group"
                    >
                      <div className="text-[11px] text-slate-500 group-hover:text-indigo-600 font-semibold">Q.{ans.qNo}</div>
                      <div className="font-extrabold text-indigo-600 dark:text-indigo-400 text-base">{ans.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : answerKeySection === 'sectionB' ? (
              <div>
                <div className="flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>Section B: रिक्त स्थान प्रश्न 101 से 200 की उत्तर तालिका (क्लिक करके सीधे प्रश्न पर पहुँचें)</span>
                  <button
                    onClick={() => {
                      setActiveTab('sections');
                      handleSelectSection('sectionB');
                    }}
                    className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    Section B प्रश्न बैंक खोलें ➔
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                  {(qb.sectionBAnswerKey || []).map((ans) => (
                    <div 
                      key={ans.qNo} 
                      onClick={() => {
                        setActiveTab('sections');
                        handleSelectSection('sectionB');
                        setSearchTerm('');
                        setExpandedIds(prev => ({ ...prev, [ans.qNo]: true }));
                        setTimeout(() => {
                          const el = document.getElementById(`q-${ans.qNo}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      }}
                      className="p-3 bg-amber-50/50 dark:bg-slate-900 hover:bg-amber-100 dark:hover:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-slate-700 transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span className="font-bold text-amber-700 dark:text-amber-400">Q.{ans.qNo}</span>
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">रिक्त स्थान</span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
                        {ans.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : answerKeySection === 'sectionC' ? (
              <div>
                <div className="flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>Section C: सही / गलत प्रश्न 201 से 250 की उत्तर तालिका (क्लिक करके सीधे प्रश्न पर पहुँचें)</span>
                  <button
                    onClick={() => {
                      setActiveTab('sections');
                      handleSelectSection('sectionC');
                    }}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    Section C प्रश्न बैंक खोलें ➔
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
                  {(qb.sectionCAnswerKey || []).map((ans) => (
                    <div 
                      key={ans.qNo} 
                      onClick={() => {
                        setActiveTab('sections');
                        handleSelectSection('sectionC');
                        setSearchTerm('');
                        setExpandedIds(prev => ({ ...prev, [ans.qNo]: true }));
                        setTimeout(() => {
                          const el = document.getElementById(`q-${ans.qNo}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer group ${
                        ans.answer === 'सत्य'
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/30 hover:bg-emerald-100 border-emerald-300 dark:border-emerald-800'
                          : 'bg-rose-50/80 dark:bg-rose-950/30 hover:bg-rose-100 border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      <div className="text-[11px] text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200 font-semibold">Q.{ans.qNo}</div>
                      <div className={`font-black text-sm ${
                        ans.answer === 'सत्य' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                      }`}>
                        {ans.answer === 'सत्य' ? '✓ सत्य' : '✗ असत्य'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : answerKeySection === 'sectionD' ? (
              <div>
                <div className="flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>Section D: सुमेलित करने वाले प्रश्न 251 से 300 की उत्तर तालिका (क्लिक करके सीधे प्रश्न पर पहुँचें)</span>
                  <button
                    onClick={() => {
                      setActiveTab('sections');
                      handleSelectSection('sectionD');
                    }}
                    className="text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
                  >
                    Section D प्रश्न बैंक खोलें ➔
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {(qb.sectionDAnswerKey || []).map((ans) => (
                    <div 
                      key={ans.qNo} 
                      onClick={() => {
                        setActiveTab('sections');
                        handleSelectSection('sectionD');
                        setSearchTerm('');
                        setExpandedIds(prev => ({ ...prev, [ans.qNo]: true }));
                        setTimeout(() => {
                          const el = document.getElementById(`q-${ans.qNo}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      }}
                      className="p-3 bg-purple-50/60 dark:bg-purple-950/30 hover:bg-purple-100/80 dark:hover:bg-purple-950/50 rounded-xl border border-purple-200 dark:border-purple-800 transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span className="font-bold text-purple-700 dark:text-purple-400">Q.{ans.qNo}</span>
                        <span className="text-[10px] bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 font-semibold px-1.5 py-0.5 rounded">सुमेलित</span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        🔗 {ans.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : answerKeySection === 'sectionE' ? (
              <div>
                <div className="flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>Section E: अति लघु उत्तरीय प्रश्न 301 से 375 की उत्तर तालिका (क्लिक करके सीधे प्रश्न पर पहुँचें)</span>
                  <button
                    onClick={() => {
                      setActiveTab('sections');
                      handleSelectSection('sectionE');
                    }}
                    className="text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
                  >
                    Section E प्रश्न बैंक खोलें ➔
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(qb.sectionEAnswerKey || []).map((ans) => (
                    <div 
                      key={ans.qNo} 
                      onClick={() => {
                        setActiveTab('sections');
                        handleSelectSection('sectionE');
                        setSearchTerm('');
                        setExpandedIds(prev => ({ ...prev, [ans.qNo]: true }));
                        setTimeout(() => {
                          const el = document.getElementById(`q-${ans.qNo}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      }}
                      className="p-3.5 bg-rose-50/60 dark:bg-rose-950/25 hover:bg-rose-100/80 dark:hover:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-900/60 transition cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span className="font-bold text-rose-700 dark:text-rose-400">Q.{ans.qNo}</span>
                        {ans.topic && (
                          <span className="text-[10px] bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 font-semibold px-2 py-0.5 rounded-full">
                            {ans.topic}
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-2 leading-snug">
                        📝 {ans.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : answerKeySection === 'sectionF' ? (
              <div>
                <div className="flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>Section F: लघु उत्तरीय प्रश्न 376 से 435 की उत्तर तालिका (क्लिक करके सीधे प्रश्न पर पहुँचें)</span>
                  <button
                    onClick={() => {
                      setActiveTab('sections');
                      handleSelectSection('sectionF');
                    }}
                    className="text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
                  >
                    Section F प्रश्न बैंक खोलें ➔
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(qb.sectionFAnswerKey || []).map((ans) => (
                    <div 
                      key={ans.qNo} 
                      onClick={() => {
                        setActiveTab('sections');
                        handleSelectSection('sectionF');
                        setSearchTerm('');
                        setExpandedIds(prev => ({ ...prev, [ans.qNo]: true }));
                        setTimeout(() => {
                          const el = document.getElementById(`q-${ans.qNo}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      }}
                      className="p-3.5 bg-sky-50/60 dark:bg-sky-950/25 hover:bg-sky-100/80 dark:hover:bg-sky-950/50 rounded-xl border border-sky-200 dark:border-sky-900/60 transition cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span className="font-bold text-sky-700 dark:text-sky-400">Q.{ans.qNo}</span>
                        {ans.topic && (
                          <span className="text-[10px] bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 font-semibold px-2 py-0.5 rounded-full">
                            {ans.topic}
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-2 leading-snug">
                        📘 {ans.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : answerKeySection === 'sectionG' ? (
              <div>
                <div className="flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>Section G: दीर्घ उत्तरीय प्रश्न 436 से 480 की उत्तर कुंजी (क्लिक करके 5-अंक विस्तृत उत्तर देखें)</span>
                  <button
                    onClick={() => {
                      setActiveTab('sections');
                      handleSelectSection('sectionG');
                    }}
                    className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    Section G प्रश्न बैंक खोलें ➔
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(qb.sectionGAnswerKey || []).map((ans) => (
                    <div 
                      key={ans.qNo} 
                      onClick={() => {
                        setActiveTab('sections');
                        handleSelectSection('sectionG');
                        setSearchTerm('');
                        setExpandedIds(prev => ({ ...prev, [ans.qNo]: true }));
                        setTimeout(() => {
                          const el = document.getElementById(`q-${ans.qNo}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      }}
                      className="p-3.5 bg-amber-50/70 dark:bg-amber-950/25 hover:bg-amber-100/90 dark:hover:bg-amber-950/50 rounded-xl border border-amber-300 dark:border-amber-900/70 transition cursor-pointer group shadow-2xs hover:shadow-md"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span className="font-extrabold text-amber-700 dark:text-amber-400">Q.{ans.qNo}</span>
                        {ans.topic && (
                          <span className="text-[10px] bg-amber-200/80 dark:bg-amber-900/70 text-amber-900 dark:text-amber-200 font-bold px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                            {ans.topic}
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-3 leading-snug">
                        📜 {ans.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>Section H: कारण बताएँ (Give Reasons) प्रश्न 481 से 500 की उत्तर कुंजी (क्लिक करके विस्तृत तार्किक उत्तर देखें)</span>
                  <button
                    onClick={() => {
                      setActiveTab('sections');
                      handleSelectSection('sectionH');
                    }}
                    className="text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
                  >
                    Section H प्रश्न बैंक खोलें ➔
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(qb.sectionHAnswerKey || []).map((ans) => (
                    <div 
                      key={ans.qNo} 
                      onClick={() => {
                        setActiveTab('sections');
                        handleSelectSection('sectionH');
                        setSearchTerm('');
                        setExpandedIds(prev => ({ ...prev, [ans.qNo]: true }));
                        setTimeout(() => {
                          const el = document.getElementById(`q-${ans.qNo}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      }}
                      className="p-3.5 bg-rose-50/70 dark:bg-rose-950/25 hover:bg-rose-100/90 dark:hover:bg-rose-950/50 rounded-xl border border-rose-300 dark:border-rose-900/70 transition cursor-pointer group shadow-2xs hover:shadow-md"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span className="font-extrabold text-rose-700 dark:text-rose-400">Q.{ans.qNo}</span>
                        {ans.topic && (
                          <span className="text-[10px] bg-rose-200/80 dark:bg-rose-900/70 text-rose-900 dark:text-rose-200 font-bold px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-800">
                            {ans.topic}
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-3 leading-snug">
                        💡 {ans.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Important PYQ List */}
        {activeTab === 'pyq' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Award className="w-6 h-6" /> Chapter 01 Important PYQ List (क्लिक करके खोलें)
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              किसी भी PYQ पर क्लिक करें — यह तुरंत संबंधित खंड को खोलकर प्रश्न, विकल्प और उत्तर प्रदर्शित कर देगा:
            </p>
            <div className="space-y-3">
              {qb.importantPyqList.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleJumpToQuestion(item.question)}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                      {item.question}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full whitespace-nowrap">
                      {item.boardAndYear}
                    </span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Top VVI Questions */}
        {activeTab === 'vvi' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Bookmark className="w-6 h-6" /> Top VVI Questions (सर्वाधिक महत्वपूर्ण प्रश्न)
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              चयन का आधार: PYQ में दोहराव, सिलेबस रीलेवेंस और बोर्ड परीक्षा पैटर्न। (क्लिक करके सीधे प्रश्न देखें)
            </p>
            <div className="space-y-4">
              {qb.topVviQuestions.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleJumpToQuestion(item.question)}
                  className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 cursor-pointer transition"
                >
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1 hover:text-indigo-600 flex items-center justify-between">
                    <span>{idx + 1}. {item.question}</span>
                    <ExternalLink className="w-4 h-4 text-indigo-400 shrink-0" />
                  </h4>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300">
                    <span className="font-semibold">चयन का कारण:</span> {item.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-6 h-6" /> 500 प्रश्नों का खंड-वार वितरण (Section Distribution)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(qb.sections).map(([key, sec]) => (
                  <div key={key} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{sec.title}</span>
                        {(key === 'sectionA' || key === 'sectionB' || key === 'sectionC') && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                            {key === 'sectionC' ? '50/50 Complete' : '100/100 Complete'}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{sec.range} ({sec.count} प्रश्न) • {sec.description}</p>
                    </div>
                    <button
                      onClick={() => { 
                        setActiveTab('sections'); 
                        handleSelectSection(key); 
                        setSearchTerm(''); 
                      }}
                      className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition cursor-pointer"
                    >
                      देखें (Open)
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold mb-3">महत्वपूर्ण निर्देश एवं इंटरैक्टिव विशेषताएँ:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li><strong>इंटरैक्टिव सेक्शन हेडर:</strong> प्रत्येक सेक्शन हेडर (उदा. 'Section A - MCQ', 'Section B - रिक्त स्थान') पर क्लिक करके उसके 100 प्रश्नों की सूची को आसानी से खोला या समेटा जा सकता है।</li>
                <li><strong>मोबाइल फ्रेंडली:</strong> चयनित सक्रिय सेक्शन हमेशा खुला रहता है जिससे मोबाइल पर स्क्रॉलिंग और पढ़ाई अत्यंत सुगम होती है।</li>
                <li><strong>त्वरित नेविगेशन:</strong> ऊपर दिए गए सेक्शन बटनों से किसी भी खंड पर एक क्लिक में सीधे पहुँचा जा सकता है।</li>
                <li><strong>क्लिक-टू-ओपन उत्तर:</strong> प्रत्येक प्रश्न पर क्लिक करके उसका उत्तर एवं विस्तृत व्याख्या देखी जा सकती है।</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
