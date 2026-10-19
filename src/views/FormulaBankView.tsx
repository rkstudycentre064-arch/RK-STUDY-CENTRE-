import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Calculator,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  ChevronRight,
  GraduationCap,
  Atom,
  FlaskConical,
  Flame,
  Sigma,
  Dna,
  RotateCcw,
  SlidersHorizontal,
  Lightbulb,
  Zap,
  ArrowLeft,
  Share2
} from 'lucide-react';
import type { ClassLevel, MainNavRoute } from '../types';
import {
  FORMULA_CLASSES,
  FORMULA_SUBJECTS,
  FORMULA_ITEMS,
  FormulaClassId,
  FormulaSubject,
  FormulaChapter,
  FormulaItem
} from '../data/formulaVaultData';
import { Class10MathCh02FormulaNotesPage } from '../components/notes/Class10MathCh02FormulaNotesPage';

interface FormulaBankViewProps {
  onNavigate: (route: MainNavRoute, params?: { classLevel?: ClassLevel; subjectSlug?: string }) => void;
  initialClassId?: FormulaClassId;
}

export function FormulaBankView({ onNavigate, initialClassId }: FormulaBankViewProps) {
  // Navigation State
  const [selectedClassId, setSelectedClassId] = useState<FormulaClassId | null>(initialClassId || null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  
  // Search & Calculator state
  const [searchQuery, setSearchQuery] = useState('');
  const [showCalculators, setShowCalculators] = useState(false);
  const [activeCalculator, setActiveCalculator] = useState<'ohms_law' | 'coulombs_law' | 'quadratic' | 'lens_formula' | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [vviOnly, setVviOnly] = useState(false);
  const [showCh02FormulaSheet, setShowCh02FormulaSheet] = useState(false);

  // 1. Ohm's Law state
  const [ohmsV, setOhmsV] = useState<number>(12);
  const [ohmsR, setOhmsR] = useState<number>(4);
  const ohmsCurrent = useMemo(() => {
    if (ohmsR <= 0) return 0;
    return Number((ohmsV / ohmsR).toFixed(2));
  }, [ohmsV, ohmsR]);

  // 2. Coulomb's Law state
  const [coulombQ1, setCoulombQ1] = useState<number>(2); // in microCoulomb
  const [coulombQ2, setCoulombQ2] = useState<number>(3); // in microCoulomb
  const [coulombR, setCoulombR] = useState<number>(0.1); // in meters
  const coulombForce = useMemo(() => {
    if (coulombR <= 0) return 0;
    const k = 9e9;
    const q1 = coulombQ1 * 1e-6;
    const q2 = coulombQ2 * 1e-6;
    const f = (k * Math.abs(q1 * q2)) / (coulombR * coulombR);
    return f.toExponential(3);
  }, [coulombQ1, coulombQ2, coulombR]);

  // 3. Quadratic equation solver
  const [quadA, setQuadA] = useState<number>(1);
  const [quadB, setQuadB] = useState<number>(-5);
  const [quadC, setQuadC] = useState<number>(6);
  const quadResult = useMemo(() => {
    if (quadA === 0) return { d: 0, roots: 'a ≠ 0 होना चाहिए (रैखिक समीकरण नहीं)' };
    const d = quadB * quadB - 4 * quadA * quadC;
    if (d > 0) {
      const r1 = ((-quadB + Math.sqrt(d)) / (2 * quadA)).toFixed(2);
      const r2 = ((-quadB - Math.sqrt(d)) / (2 * quadA)).toFixed(2);
      return { d, roots: `दो भिन्न वास्तविक मूल: x₁ = ${r1}, x₂ = ${r2}` };
    } else if (d === 0) {
      const r = (-quadB / (2 * quadA)).toFixed(2);
      return { d, roots: `दो समान वास्तविक मूल: x₁ = x₂ = ${r}` };
    } else {
      return { d, roots: `D < 0 (काल्पनिक/अवास्तविक मूल)` };
    }
  }, [quadA, quadB, quadC]);

  // 4. Lens formula solver
  const [lensU, setLensU] = useState<number>(-30); // in cm
  const [lensF, setLensF] = useState<number>(20); // in cm
  const lensResult = useMemo(() => {
    if (lensU === 0 || lensF === 0) return { v: '0', m: '0', nature: 'मान अमान्य' };
    const invV = 1 / lensF + 1 / lensU;
    if (invV === 0) return { v: 'अनंत (∞)', m: 'अनंत', nature: 'प्रतिबिंब अनंत पर बनेगा' };
    const v = Number((1 / invV).toFixed(2));
    const m = Number((v / lensU).toFixed(2));
    const nature = v > 0 ? 'वास्तविक एवं उल्टा' : 'आभासी एवं सीधा';
    return { v: `${v} cm`, m: `${m}x`, nature };
  }, [lensU, lensF]);

  // Copy formula text
  const handleCopyFormula = (item: FormulaItem) => {
    const textToCopy = `${item.title}\nसूत्र: ${item.formula}\nविवरण: ${item.explanation}\nRK STUDY CENTRE Formula Vault`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Helper to get Subject details
  const currentSubject = useMemo(() => {
    if (!selectedSubjectId) return null;
    return FORMULA_SUBJECTS.find((s) => s.id === selectedSubjectId) || null;
  }, [selectedSubjectId]);

  // Helper to get Chapter details
  const currentChapter = useMemo(() => {
    if (!currentSubject || !selectedChapterId) return null;
    return currentSubject.chapters.find((c) => c.id === selectedChapterId) || null;
  }, [currentSubject, selectedChapterId]);

  // Subjects available for selected Class
  const availableSubjects = useMemo(() => {
    if (!selectedClassId) return [];
    return FORMULA_SUBJECTS.filter((s) => s.classId === selectedClassId);
  }, [selectedClassId]);

  // Chapters available for selected Subject
  const availableChapters = useMemo(() => {
    if (!currentSubject) return [];
    return currentSubject.chapters;
  }, [currentSubject]);

  // Filter formulas based on selection and search
  const displayedFormulas = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return FORMULA_ITEMS.filter((item) => {
      // If searching globally, we match query across all items (or within selected scope)
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.formula.toLowerCase().includes(query) ||
        item.explanation.toLowerCase().includes(query) ||
        item.chapterName.toLowerCase().includes(query) ||
        item.subjectName.toLowerCase().includes(query) ||
        item.variables.some((v) => v.symbol.toLowerCase().includes(query) || v.meaning.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // Filter by VVI if active
      if (vviOnly && !item.isVVI) return false;

      // If search query is provided and user has not reached chapter, allow global matching
      if (query && !selectedChapterId && !selectedSubjectId && !selectedClassId) {
        return true;
      }

      // Hierarchy filters
      if (selectedClassId && item.classId !== selectedClassId) return false;
      if (selectedSubjectId && item.subjectId !== selectedSubjectId) return false;
      if (selectedChapterId && item.chapterId !== selectedChapterId) return false;

      return true;
    });
  }, [selectedClassId, selectedSubjectId, selectedChapterId, searchQuery, vviOnly]);

  // Total stats for badges
  const totalStats = useMemo(() => {
    const totalCount = FORMULA_ITEMS.length;
    const vviCount = FORMULA_ITEMS.filter((f) => f.isVVI).length;
    const class10Count = FORMULA_ITEMS.filter((f) => f.classId === 'class-10').length;
    const class12Count = FORMULA_ITEMS.filter((f) => f.classId === 'class-12').length;
    return { totalCount, vviCount, class10Count, class12Count };
  }, []);

  // Subject icon helper
  const renderSubjectIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Calculator':
        return <Calculator className={className} />;
      case 'FlaskConical':
        return <FlaskConical className={className} />;
      case 'Atom':
        return <Atom className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Sigma':
        return <Sigma className={className} />;
      case 'Dna':
        return <Dna className={className} />;
      default:
        return <BookOpen className={className} />;
    }
  };

  // Reset helpers
  const handleResetToClasses = () => {
    setSelectedClassId(null);
    setSelectedSubjectId(null);
    setSelectedChapterId(null);
    setSearchQuery('');
  };

  const handleResetToSubjects = () => {
    setSelectedSubjectId(null);
    setSelectedChapterId(null);
  };

  const handleResetToChapters = () => {
    setSelectedChapterId(null);
  };

  if (showCh02FormulaSheet) {
    return (
      <Class10MathCh02FormulaNotesPage
        onBack={() => setShowCh02FormulaSheet(false)}
        onOpenFullChapterNotes={() => {
          setShowCh02FormulaSheet(false);
          onNavigate('study-material', {
            classLevel: 'class-10',
            subjectSlug: 'math',
          });
        }}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* 1. Header Banner & Title */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-indigo-900/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>RK STUDY CENTRE • प्रामाणिक सूत्र बैंक</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowCh02FormulaSheet(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>Ch 02 बहुपद Formula Sheet (LaTeX)</span>
              </button>
              <button
                onClick={() => setShowCalculators(!showCalculators)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showCalculators
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>{showCalculators ? 'कैलकुलेटर छिपाएं' : 'इंटरएक्टिव कैलकुलेटर'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>सूत्र एवं प्रमेय बैंक (Formula Vault)</span>
            </h1>
            <p className="text-sm sm:text-base text-indigo-200 max-w-3xl leading-relaxed">
              बिहार बोर्ड कक्षा 10वीं एवं 12वीं के संपूर्ण विषयों के प्रामाणिक सूत्र, गणितीय प्रमेय, भौतिकी एवं रसायन के नियम — व्यवस्थित श्रेणी क्रम में।
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-300">
            <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10">
              📚 कुल {totalStats.totalCount} सूत्र संकलित
            </span>
            <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              🔥 {totalStats.vviCount} VVI बोर्ड प्रश्न सूत्र
            </span>
            <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
              🎯 क्लास 10: {totalStats.class10Count} सूत्र | क्लास 12: {totalStats.class12Count} सूत्र
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-slate-600">
        <button
          onClick={handleResetToClasses}
          className="text-slate-500 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <GraduationCap className="w-4 h-4 text-blue-600" />
          <span>कक्षा चयन</span>
        </button>

        {selectedClassId && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            <button
              onClick={handleResetToSubjects}
              className={`hover:text-blue-700 cursor-pointer transition-colors ${
                !selectedSubjectId ? 'text-blue-800 font-black' : 'text-slate-600'
              }`}
            >
              {selectedClassId === 'class-10' ? 'कक्षा 10वीं' : 'कक्षा 12वीं'}
            </button>
          </>
        )}

        {currentSubject && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            <button
              onClick={handleResetToChapters}
              className={`hover:text-blue-700 cursor-pointer transition-colors flex items-center gap-1 ${
                !selectedChapterId ? 'text-blue-800 font-black' : 'text-slate-600'
              }`}
            >
              <span>{currentSubject.name}</span>
            </button>
          </>
        )}

        {currentChapter && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-blue-900 font-black truncate max-w-xs sm:max-w-md">
              {currentChapter.name}
            </span>
          </>
        )}

        {/* Clear/Reset button when deep inside */}
        {(selectedClassId || selectedSubjectId || selectedChapterId || searchQuery) && (
          <button
            onClick={handleResetToClasses}
            className="ml-auto text-2xs font-extrabold text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded bg-slate-100 hover:bg-rose-50"
          >
            <RotateCcw className="w-3 h-3" />
            <span>शुरुआत से देखें</span>
          </button>
        )}
      </nav>

      {/* 3. Search and Quick Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="सूत्र, नियम या सिद्धांत खोजें (उदा: ओम का नियम, द्विघाती सूत्र, कूलॉम, लेंस, sin²θ)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setVviOnly(!vviOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors ${
                vviOnly
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>🔥 केवल VVI सूत्र</span>
            </button>
          </div>
        </div>

        {/* Search Context Notice */}
        {searchQuery && (
          <div className="text-2xs font-bold text-slate-500 flex items-center justify-between">
            <span>
              "{searchQuery}" के लिए {displayedFormulas.length} सूत्र मिले
              {selectedClassId && ` (${selectedClassId === 'class-10' ? 'कक्षा 10वीं' : 'कक्षा 12वीं'})`}
              {currentSubject && ` • ${currentSubject.name}`}
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
              }}
              className="text-blue-700 hover:underline cursor-pointer"
            >
              सर्च हटाएं
            </button>
          </div>
        )}
      </div>

      {/* 4. Interactive Calculators Section (Collapsible Drawer / Cards) */}
      {showCalculators && (
        <div className="bg-gradient-to-br from-amber-50/70 via-white to-blue-50/70 rounded-3xl p-5 sm:p-6 border-2 border-amber-200/80 shadow-md space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-amber-500 text-white">
                  <Zap className="w-4 h-4 fill-white" />
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  इंटरएक्टिव गणना एवं सूत्र प्रयोगशाला (4 Live Calculators)
                </h3>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                मान बदलकर तुरंत परिणाम जांचें और बोर्ड परीक्षा के आंकिक प्रश्नों (Numericals) का अभ्यास करें।
              </p>
            </div>
            <button
              onClick={() => setShowCalculators(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded bg-slate-100 cursor-pointer"
            >
              बंद करें
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Calc 1: Ohm's Law */}
            <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-2xs font-black">
                    ओम का नियम (Ohm's Law)
                  </span>
                  <span className="text-2xs font-mono font-bold text-slate-500">I = V / R</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-2xs font-bold text-slate-600 block">विभवांतर V: {ohmsV} V</label>
                    <input
                      type="range"
                      min="1"
                      max="240"
                      value={ohmsV}
                      onChange={(e) => setOhmsV(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-2xs font-bold text-slate-600 block">प्रतिरोध R: {ohmsR} Ω</label>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={ohmsR}
                      onChange={(e) => setOhmsR(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-center">
                <div className="text-2xs font-bold text-slate-600">प्रवाहित धारा (Current):</div>
                <div className="text-base font-black text-blue-900 font-mono mt-0.5">{ohmsCurrent} A (एम्पीयर)</div>
              </div>
            </div>

            {/* Calc 2: Coulomb's Law */}
            <div className="bg-white rounded-2xl p-4 border border-indigo-200 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-2xs font-black">
                    कूलॉम नियम (Coulomb)
                  </span>
                  <span className="text-2xs font-mono font-bold text-slate-500">F = kq₁q₂/r²</span>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-3xs font-bold text-slate-500 block">q₁ (μC)</label>
                      <input
                        type="number"
                        value={coulombQ1}
                        onChange={(e) => setCoulombQ1(Number(e.target.value))}
                        className="w-full p-1 rounded border border-slate-200 text-xs font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="text-3xs font-bold text-slate-500 block">q₂ (μC)</label>
                      <input
                        type="number"
                        value={coulombQ2}
                        onChange={(e) => setCoulombQ2(Number(e.target.value))}
                        className="w-full p-1 rounded border border-slate-200 text-xs font-bold text-center"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-2xs font-bold text-slate-600 block">दूरी r: {coulombR} m</label>
                    <input
                      type="range"
                      min="0.01"
                      max="1.0"
                      step="0.01"
                      value={coulombR}
                      onChange={(e) => setCoulombR(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-200 text-center">
                <div className="text-2xs font-bold text-slate-600">वैद्युत बल (Force):</div>
                <div className="text-sm font-black text-indigo-900 font-mono mt-0.5">{coulombForce} N</div>
              </div>
            </div>

            {/* Calc 3: Quadratic Formula */}
            <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-2xs font-black">
                    द्विघाती सूत्र (ax²+bx+c)
                  </span>
                  <span className="text-2xs font-mono font-bold text-slate-500">D = b² - 4ac</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <div>
                    <label className="text-3xs font-bold text-slate-500 block text-center">a</label>
                    <input
                      type="number"
                      value={quadA}
                      onChange={(e) => setQuadA(Number(e.target.value))}
                      className="w-full p-1 rounded border border-slate-200 text-xs font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-3xs font-bold text-slate-500 block text-center">b</label>
                    <input
                      type="number"
                      value={quadB}
                      onChange={(e) => setQuadB(Number(e.target.value))}
                      className="w-full p-1 rounded border border-slate-200 text-xs font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-3xs font-bold text-slate-500 block text-center">c</label>
                    <input
                      type="number"
                      value={quadC}
                      onChange={(e) => setQuadC(Number(e.target.value))}
                      className="w-full p-1 rounded border border-slate-200 text-xs font-bold text-center"
                    />
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-center">
                <div className="text-3xs font-bold text-slate-600">विविक्तकर D = {quadResult.d}</div>
                <div className="text-2xs font-black text-amber-900 font-mono mt-0.5 leading-snug">{quadResult.roots}</div>
              </div>
            </div>

            {/* Calc 4: Lens Formula */}
            <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-2xs font-black">
                    लेंस सूत्र (Optics)
                  </span>
                  <span className="text-2xs font-mono font-bold text-slate-500">1/f = 1/v - 1/u</span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <label className="text-3xs font-bold text-slate-500 block">वस्तु u: {lensU} cm</label>
                    <input
                      type="number"
                      value={lensU}
                      onChange={(e) => setLensU(Number(e.target.value))}
                      className="w-full p-1 rounded border border-slate-200 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-3xs font-bold text-slate-500 block">फोकस f: {lensF} cm</label>
                    <input
                      type="number"
                      value={lensF}
                      onChange={(e) => setLensF(Number(e.target.value))}
                      className="w-full p-1 rounded border border-slate-200 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <div className="text-3xs font-bold text-slate-600">v = {lensResult.v} | m = {lensResult.m}</div>
                <div className="text-2xs font-black text-emerald-900 mt-0.5">{lensResult.nature}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MAIN HIERARCHY PRESENTATION                                            */}
      {/* Principle: Class Selection -> Subject Selection -> Chapter Selection -> Formula */}
      {/* ========================================================================= */}

      {/* IF USER HAS ENTERED A SEARCH QUERY, SHOW MATCHING RESULTS IMMEDIATELY WITH CONTEXT */}
      {searchQuery ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              सर्च परिणाम ({displayedFormulas.length})
            </h2>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
            >
              सर्च बंद करें और श्रेणी क्रम देखें
            </button>
          </div>

          {displayedFormulas.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
              <Search className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">कोई सूत्र नहीं मिला</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                कृपया दूसरे कीवर्ड का उपयोग करें या नीचे दी गई कक्षा व विषय सूची से ब्राउज़ करें।
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                सभी सूत्र देखें
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {displayedFormulas.map((item) => (
                <FormulaCard
                  key={item.id}
                  item={item}
                  copiedId={copiedId}
                  onCopy={handleCopyFormula}
                  onAskAi={() => onNavigate('solve-doubt', { classLevel: item.classId })}
                  onOpenCalc={() => {
                    setShowCalculators(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : !selectedClassId ? (
        /* ========================================================================= */
        /* LEVEL 1: CLASS SELECTION                                                 */
        /* ========================================================================= */
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              <span>चरण 1: अपनी कक्षा चुनें (Select Class)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              केवल वही कक्षाएं प्रदर्शित हैं जिनके लिए प्रामाणिक बिहार बोर्ड सूत्र संकलित हैं:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FORMULA_CLASSES.map((cls) => {
              const classSubjects = FORMULA_SUBJECTS.filter((s) => s.classId === cls.id);
              const classFormulas = FORMULA_ITEMS.filter((f) => f.classId === cls.id);
              const vviCount = classFormulas.filter((f) => f.isVVI).length;

              return (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className="group bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-200">
                        {cls.badge}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-2xs font-extrabold border border-amber-200">
                        🔥 {vviCount} VVI सूत्र
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                        {cls.hindiName}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        {cls.tagline}
                      </p>
                    </div>

                    {/* Subject Tags preview */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                        उपलब्ध विषय ({classSubjects.length}):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {classSubjects.map((sub) => (
                          <span
                            key={sub.id}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5"
                          >
                            {renderSubjectIcon(sub.iconName, 'w-3.5 h-3.5 text-blue-600')}
                            <span>{sub.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-500">
                      कुल {classFormulas.length} प्रामाणिक सूत्र
                    </span>
                    <span className="px-4 py-2 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white text-xs font-black flex items-center gap-1.5 transition-all">
                      <span>अध्याय व सूत्र देखें</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : !selectedSubjectId ? (
        /* ========================================================================= */
        /* LEVEL 2: SUBJECT SELECTION                                               */
        /* ========================================================================= */
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <span>
                  {selectedClassId === 'class-10' ? 'कक्षा 10वीं' : 'कक्षा 12वीं'} • विषय चयन (Step 2)
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                जिस विषय के सूत्र पढ़ना चाहते हैं, उस पर क्लिक करें:
              </p>
            </div>

            <button
              onClick={handleResetToClasses}
              className="text-xs font-bold text-slate-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>कक्षा बदलें</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableSubjects.map((sub) => {
              const subFormulas = FORMULA_ITEMS.filter(
                (f) => f.classId === selectedClassId && f.subjectId === sub.id
              );
              const vviCount = subFormulas.filter((f) => f.isVVI).length;

              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className="group bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {renderSubjectIcon(sub.iconName, 'w-6 h-6')}
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-2xs font-extrabold">
                        {sub.chapters.length} अध्याय
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                        {sub.name}
                      </h3>
                      <div className="text-xs font-bold text-slate-500">
                        {sub.englishName}
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 line-clamp-2">
                      {sub.chapters.map((c) => c.name).slice(0, 3).join(', ')}...
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-2xs font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      🔥 {vviCount} VVI सूत्र
                    </span>
                    <span className="text-xs font-black text-blue-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>अध्याय सूची</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : !selectedChapterId ? (
        /* ========================================================================= */
        /* LEVEL 3: CHAPTER SELECTION                                               */
        /* ========================================================================= */
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-black">
                  {currentSubject?.name}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {selectedClassId === 'class-10' ? 'कक्षा 10वीं' : 'कक्षा 12वीं'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                अध्याय चुनें (Select Chapter - Step 3)
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetToSubjects}
                className="text-xs font-bold text-slate-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>विषय बदलें</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableChapters.map((chap) => {
              const chapFormulas = FORMULA_ITEMS.filter(
                (f) =>
                  f.classId === selectedClassId &&
                  f.subjectId === selectedSubjectId &&
                  f.chapterId === chap.id
              );
              const vviCount = chapFormulas.filter((f) => f.isVVI).length;

              return (
                <div
                  key={chap.id}
                  onClick={() => setSelectedChapterId(chap.id)}
                  className="group bg-white rounded-2xl p-5 border-2 border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-2xs font-extrabold">
                        अध्याय {chap.chapterNumber < 10 ? `0${chap.chapterNumber}` : chap.chapterNumber}
                      </span>
                      {vviCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-3xs font-black">
                          🔥 VVI
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                      {chap.name}
                    </h3>
                    <div className="text-2xs font-bold text-slate-500">{chap.englishName}</div>

                    <p className="text-xs text-slate-600 font-medium line-clamp-2">
                      {chap.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                    <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-2xs font-black">
                      {chapFormulas.length} सूत्र
                    </span>
                    <span className="p-2 rounded-xl bg-slate-50 group-hover:bg-blue-600 text-slate-400 group-hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* LEVEL 4: FORMULA LEVEL (INSIDE SELECTED CHAPTER)                         */
        /* ========================================================================= */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-black">
                    {selectedClassId === 'class-10' ? 'कक्षा 10वीं' : 'कक्षा 12वीं'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                    {currentSubject?.name}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-2xs font-black">
                    अध्याय {currentChapter?.chapterNumber}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {currentChapter?.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {currentChapter?.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetToChapters}
                  className="text-xs font-bold text-slate-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>अध्याय बदलें</span>
                </button>
              </div>
            </div>
          </div>

          {/* Formula Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                अध्याय के प्रमुख सूत्र ({displayedFormulas.length})
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                कॉपी, दोहराव व AI सहायता उपलब्ध
              </span>
            </div>

            {displayedFormulas.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-2">
                <p className="text-sm font-bold text-slate-700">इस अध्याय में कोई सूत्र मेल नहीं खाया।</p>
                <button
                  onClick={() => {
                    setVviOnly(false);
                    setSearchQuery('');
                  }}
                  className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  फिल्टर हटाएं
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {displayedFormulas.map((item) => (
                  <FormulaCard
                    key={item.id}
                    item={item}
                    copiedId={copiedId}
                    onCopy={handleCopyFormula}
                    onAskAi={() => onNavigate('solve-doubt', { classLevel: item.classId })}
                    onOpenCalc={() => {
                      setShowCalculators(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// REUSABLE SUB-COMPONENT: FormulaCard
// =========================================================================
interface FormulaCardProps {
  item: FormulaItem;
  copiedId: string | null;
  onCopy: (item: FormulaItem) => void;
  onAskAi: () => void;
  onOpenCalc: () => void;
}

function FormulaCard({ item, copiedId, onCopy, onAskAi, onOpenCalc }: FormulaCardProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md p-5 sm:p-6 space-y-4 transition-all flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-2xs font-extrabold">
              {item.classId === 'class-12' ? 'कक्षा 12वीं' : 'कक्षा 10वीं'}
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-2xs font-extrabold">
              {item.subjectName}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-500 text-2xs font-bold">
              अध्याय {item.chapterNumber}
            </span>
          </div>

          {item.isVVI && (
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-3xs font-black uppercase tracking-wider">
              🔥 VVI Board
            </span>
          )}
        </div>

        {/* Chapter Title & Concept Title */}
        <div>
          <div className="text-2xs font-bold text-slate-400">{item.chapterName}</div>
          <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug mt-0.5">
            {item.title}
          </h4>
        </div>

        {/* Formula Presentation Box */}
        <div className="p-3.5 rounded-xl bg-slate-950 text-amber-300 font-mono font-bold text-sm sm:text-base text-center tracking-wide border border-slate-800 shadow-inner select-all overflow-x-auto">
          {item.formula}
        </div>

        {/* Description / Explanation */}
        <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
          {item.explanation}
        </p>

        {/* Variables Breakdown */}
        {item.variables && item.variables.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <div className="text-3xs font-black text-slate-400 uppercase tracking-wider mb-1.5">
              संकेत, पद एवं मात्रक (Symbols & Units):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
              {item.variables.map((v, i) => (
                <div key={i} className="flex items-start gap-1">
                  <strong className="font-mono text-slate-900 shrink-0">{v.symbol}:</strong>
                  <span>
                    {v.meaning} {v.unit ? <span className="text-slate-500 font-medium">({v.unit})</span> : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Derivation / Board Hint */}
        {item.derivationSummary && (
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-2xs text-slate-700 font-medium">
            <strong className="text-slate-900">📌 उपपत्ति सारांश:</strong> {item.derivationSummary}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={() => onCopy(item)}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          {copiedId === item.id ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">कॉपी हो गया!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>सूत्र कॉपी करें</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1.5">
          {item.calculatorType && (
            <button
              onClick={onOpenCalc}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>कैलकुलेटर</span>
            </button>
          )}

          <button
            onClick={onAskAi}
            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>AI से पूछें</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
