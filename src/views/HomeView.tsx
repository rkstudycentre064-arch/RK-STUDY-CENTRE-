import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  BookOpen,
  FileText,
  Award,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  LogIn,
  UserPlus,
  Clock,
  TrendingUp,
  Search,
  Bell,
  MessageSquare,
  ExternalLink,
  Paperclip,
  IndianRupee,
  CreditCard,
  BarChart3,
  ShieldCheck,
  UserCheck,
  Lock,
  RotateCcw,
  Scale,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Mail,
  CheckSquare
} from 'lucide-react';
import type { MainNavRoute, ClassLevel, MoreSectionTab, NoticeItem } from '../types';
import { CLASSES_METADATA, SUBJECTS, BOOKS, CHAPTERS, STUDY_MATERIALS, TESTS } from '../lib/constants';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { getPublicNotices } from '../services/noticeService';
import { getStandaloneAppUrl, openPolicyInNewTab } from '../utils/navigationUtils';
import { Class10MathCh02FormulaNotesPage } from '../components/notes/Class10MathCh02FormulaNotesPage';
import { MathCh02QuestionBank500Viewer } from '../components/notes/MathCh02QuestionBank500Viewer';
import { HOMEPAGE_FAQS } from '../utils/seoManager';

interface HomeViewProps {
  onNavigate: (route: MainNavRoute, params?: { 
    classLevel?: ClassLevel; 
    moreTab?: MoreSectionTab;
    subjectSlug?: string;
    chapterSlug?: string;
    bookSlug?: string;
    testId?: string;
    ownerTab?: any;
  }) => void;
  onOpenOfflineHub?: () => void;
  onOpenMarathonTest?: () => void;
  onOpenPhysicsMarathon?: () => void;
  onOpenPhysicsCh02Marathon?: () => void;
  onOpenPhysics12Ch01Marathon?: () => void;
}

export function HomeView({ 
  onNavigate, 
  onOpenOfflineHub, 
  onOpenMarathonTest, 
  onOpenPhysicsMarathon, 
  onOpenPhysicsCh02Marathon, 
  onOpenPhysics12Ch01Marathon 
}: HomeViewProps) {
  const { settings } = useSettings();
  const { user, isOwner } = useAuth();
  const websiteName = settings.websiteName || 'RK STUDY CENTRE';

  const [searchQuery, setSearchQuery] = useState('');
  const [publicNotices, setPublicNotices] = useState<NoticeItem[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [activeHighlightIndex, setActiveHighlightIndex] = useState(0);
  const [selectedNoticeDetail, setSelectedNoticeDetail] = useState<NoticeItem | null>(null);
  const [showMathCh02FormulaModal, setShowMathCh02FormulaModal] = useState(false);
  const [mathCh02ModalMode, setMathCh02ModalMode] = useState<'read' | 'test' | null>(null);

  // Load real data (dynamic notices)
  useEffect(() => {
    let isMounted = true;
    setLoadingNotices(true);
    getPublicNotices()
      .then((notices) => {
        if (isMounted && notices && notices.length > 0) {
          setPublicNotices(notices.slice(0, 3));
        }
      })
      .catch((err) => {
        console.error('[RK STUDY CENTRE] Error loading public notices in HomeView:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingNotices(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // 1-click Quick Search Resources
  const searchResources = [
    { name: "कक्षा 10 भौतिकी नोट्स (Class 10 Physics Notes)", route: "study-material", params: { classLevel: "class-10" as ClassLevel, subjectSlug: "physics" } },
    { name: "कक्षा 10 भूगोल नोट्स (Class 10 Geography Notes)", route: "study-material", params: { classLevel: "class-10" as ClassLevel, subjectSlug: "geography" } },
    { name: "कक्षा 10 इतिहास नोट्स (Class 10 History Notes)", route: "study-material", params: { classLevel: "class-10" as ClassLevel, subjectSlug: "history" } },
    { name: "इतिहास अध्याय 2: समाजवाद एवं साम्यवाद नोट्स", route: "study-material", params: { classLevel: "class-10" as ClassLevel, subjectSlug: "history", chapterSlug: "chapter-2" } },
    { name: "इतिहास अध्याय 3: हिन्द-चीन में राष्ट्रवादी आंदोलन नोट्स", route: "study-material", params: { classLevel: "class-10" as ClassLevel, subjectSlug: "history", chapterSlug: "chapter-3" } },
    { name: "इतिहास अध्याय 4: भारत में राष्ट्रवाद नोट्स", route: "study-material", params: { classLevel: "class-10" as ClassLevel, subjectSlug: "history", chapterSlug: "chapter-4" } },
    { name: "कक्षा 10 हिंदी नोट्स (Class 10 Hindi Notes)", route: "study-material", params: { classLevel: "class-10" as ClassLevel, subjectSlug: "hindi" } },
    { name: "ऑनलाइन मॉक टेस्ट सीरीज (Online Mock Tests)", route: "tests" },
    { name: "परीक्षा परिणाम व स्कोरकार्ड (Results)", route: "tests" },
    { name: "प्रिंस सर स्पेशल कोर्सेज (Courses & Classes)", route: "courses" },
    { name: "AI डाउट सॉल्व शंका समाधान (Doubt Solve AI)", route: "solve-doubt" },
    { name: "सूत्र एवं प्रमेय बैंक (Formula Vault)", route: "formula-bank" },
    { name: "दैनिक अध्ययन लक्ष्य व पोमोडोरो टाइमर (Study Tracker)", route: "study-tracker" },
    { name: "डिजिटल OMR शीट प्रैक्टिस लैब (OMR Simulator)", route: "omr-simulator" },
    { name: "वर्चुअल विज्ञान प्रयोगशाला (Virtual Science Lab)", route: "science-lab" },
    { name: "महत्वपूर्ण नीतियाँ (Policies Hub)", route: "policies" }
  ];

  const filteredSuggestions = searchQuery.trim() === "" 
    ? [] 
    : searchResources.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.route.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Compile active high-yield highlights
  const activeHighlights = [
    {
      id: 'highlight-math-ch02-500',
      title: "Class 10 Maths Ch-02 (बहुपद): 500 VVI Objective Question Bank + Solved Answer + Live Test",
      description: "कक्षा 10 गणित अध्याय 2 (बहुपद) के संपूर्ण 500 VVI वस्तुनिष्ठ प्रश्न (विकल्प उत्तर + चरणबद्ध हल सहित) पढ़ें और लाइव OMR टेस्ट दें!",
      badge: "Class 10 • Maths • 500 VVI Active",
      action: () => setMathCh02ModalMode('read'),
    },
    {
      id: 'highlight-civics-01',
      title: "Class 10 Civics Ch-01: लोकतंत्र में सत्ता की साझेदारी (50 VVI ऑनलाइन टेस्ट)",
      description: "बिहार बोर्ड मैट्रिक परीक्षा के लिए नागरिक शास्त्र अध्याय 1 के 50 सबसे महत्वपूर्ण VVI वस्तुनिष्ठ प्रश्नों का लाइव टेस्ट!",
      badge: "Class 10 • Civics • 50 VVI Live",
      action: () => onNavigate('tests', {
        classLevel: 'class-10',
        subjectSlug: 'soc',
        bookSlug: 'soc-c10-civ',
        chapterSlug: 'c10-soc-civ-ch01',
        testId: 'test-c10-soc-civ-01',
      })
    },
    {
      id: 'highlight-1',
      title: "Class 12 Physics Ch-01: 'इलेक्ट्रो-ब्रह्मास्त्र' महामैराथन लाइव टेस्ट",
      description: "बिहार बोर्ड कक्षा 12वीं भौतिकी अध्याय 1 के 300 VVI वस्तुनिष्ठ प्रश्नों का 3 घंटे का अखंड लाइव OMR टेस्ट!",
      badge: "Class 12 • Physics • MCQ",
      action: onOpenPhysics12Ch01Marathon || (() => onNavigate('tests', { classLevel: 'class-12', subjectSlug: 'physics' }))
    },
    {
      id: 'highlight-2',
      title: "Class 10 Physics Ch-02: 'अमोग अपवर्तन-चक्र' महामैराथन लाइव टेस्ट",
      description: "मैट्रिक परीक्षा 2016 से 2026 के 300 सबसे महत्वपूर्ण वस्तुनिष्ठ प्रश्नों का 3 घंटे का लाइव परीक्षा!",
      badge: "Class 10 • Physics • Active",
      action: onOpenPhysicsCh02Marathon || (() => onNavigate('tests', { classLevel: 'class-10', subjectSlug: 'physics' }))
    },
    {
      id: 'highlight-3',
      title: "Class 10 Physics Ch-01: 300 VVI अखंड महामैराथन लाइव OMR टेस्ट",
      description: "बिहार बोर्ड परीक्षा 2016-2026 के प्रकाश परावर्तन अध्याय के 300 VVI वस्तुनिष्ठ प्रश्नों का लाइव टेस्ट!",
      badge: "Class 10 • Physics • Active",
      action: onOpenPhysicsMarathon || (() => onNavigate('tests', { classLevel: 'class-10', subjectSlug: 'physics' }))
    },
    {
      id: 'highlight-4',
      title: "Class 10 History Ch-01: 300 VVI महामैराथन लाइव टेस्ट",
      description: "यूरोप में राष्ट्रवाद अध्याय के 300 VVI ऑब्जेक्टिव प्रश्नों का 3 घंटे का अखंड अभ्यास!",
      badge: "Class 10 • History • Active",
      action: onOpenMarathonTest || (() => onNavigate('tests', { classLevel: 'class-10', subjectSlug: 'soc' }))
    }
  ];

  // Rotate highlights
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHighlightIndex(prev => (prev + 1) % activeHighlights.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeHighlights.length]);

  // Extract actual Latest Study Material items from constants
  const latestStudyMaterials = (STUDY_MATERIALS || []).slice(0, 3);

  // Extract actual Featured Test items from constants (prioritizing Civics Ch 01 50 VVI & top board tests)
  const civicsFeatured = (TESTS || []).filter((t) => t.id === 'test-c10-soc-civ-01');
  const otherPublishedTests = (TESTS || []).filter((t) => t.isPublished && t.id !== 'test-c10-soc-civ-01');
  const featuredTests = [...civicsFeatured, ...otherPublishedTests].slice(0, 3);

  return (
    <div className="space-y-16 sm:space-y-24 py-4 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-slate-800">
      
      {/* ====================================================
           SECTION 2 — HERO SECTION (PROFESSIONAL & ACADEMIC)
           ==================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white border border-blue-800 shadow-2xl p-6 sm:p-12 lg:p-16 transition-all duration-300">
        {/* Subtle grid and accent blur lights */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" aria-hidden="true" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-800/80 border border-blue-400/30 text-blue-200 text-xs sm:text-sm font-extrabold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Bihar Board Class 10 & 12 Specialized Learning Centre</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-sm">
              {websiteName}
            </h1>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-200">
              Bihar Board Class 10 & Class 12 की बेहतर तैयारी
            </h2>
            
            <p className="text-blue-100/90 text-base sm:text-lg font-medium leading-relaxed max-w-xl">
              Study Material, Notes, PYQs, Online Tests और परीक्षा तैयारी के resources एक ही जगह। प्रिंस सर के टॉपर हस्तलिखित नोट्स के साथ अपनी पढ़ाई को दें एक नई दिशा।
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('classes')}
                className="px-7 py-4 rounded-xl font-black bg-white hover:bg-blue-50 text-blue-950 shadow-xl transition-all flex items-center justify-center gap-2.5 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-base sm:text-lg"
              >
                <span>📚 पढ़ाई शुरू करें</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
              
              <button
                onClick={() => onNavigate('tests')}
                className="px-6 py-4 rounded-xl font-bold bg-blue-800/70 hover:bg-blue-800 text-white border border-blue-600/50 shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-base sm:text-lg"
              >
                <span>📝 Online Test</span>
              </button>
            </div>
          </div>

          {/* Right Hero Column: Abstract Academic Clean Card Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-6 sm:p-8 space-y-4 text-left text-white">
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <span className="text-xs font-bold text-blue-200 uppercase tracking-wider flex items-center gap-1">
                  <span>📖</span>
                  <span>RK Board Prep Focus</span>
                </span>
                <span className="text-[10px] font-extrabold text-emerald-950 bg-emerald-300 px-2.5 py-0.5 rounded-full">
                  Topper Choice
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-blue-900/50 border border-blue-700/50 space-y-1">
                  <div className="text-xs font-bold text-blue-300">Class 10 Board Exam Spec</div>
                  <div className="text-sm font-black text-white">विज्ञान, गणित एवं सामाजिक विज्ञान नोट्स</div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-900/50 border border-blue-700/50 space-y-1">
                  <div className="text-xs font-bold text-blue-300">Class 12 Board Exam Spec</div>
                  <div className="text-sm font-black text-white">भौतिकी, रसायन शास्त्र एवं गणित फॉर्मूला बैंक</div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-blue-200 font-bold border-t border-white/15">
                <span>सफलता दर (Syllabus Success):</span>
                <span className="text-emerald-300 font-black">100% प्रामाणिक सामग्री</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ====================================================
          SECTION 2A — COMPACT GLOBAL SEARCH UNDER HERO
          ==================================================== */}
      <div className="relative max-w-3xl mx-auto -mt-10 sm:-mt-14 z-20 px-2">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-2 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Search className="w-5 h-5 stroke-[2.5]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="विषय, नोट्स, ऑनलाइन टेस्ट या सूचना को खोजें..."
            className="w-full text-base font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden py-1 px-1"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 px-3 text-xs font-black uppercase cursor-pointer min-h-[44px]"
            >
              साफ़ करें
            </button>
          )}
        </div>

        {/* Suggestion list */}
        {filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-30 divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {filteredSuggestions.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  onNavigate(item.route as any, item.params);
                  setSearchQuery('');
                }}
                className="w-full text-left px-5 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between text-sm font-bold text-slate-800 cursor-pointer min-h-[44px]"
              >
                <span>⚡ {item.name}</span>
                <span className="text-2xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">खोलें</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ====================================================
          SECTION 2B — FEATURED CLASS 10 MATHS CH 2: 500 VVI OBJECTIVE + SOLVED + LIVE TEST + FORMULA NOTES
          ==================================================== */}
      <section className="rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-950 to-purple-950 text-white p-6 sm:p-8 shadow-xl border border-indigo-800/80 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-3xl text-left">
          <div className="flex items-center gap-2.5 flex-wrap text-xs font-extrabold tracking-wider text-blue-300 uppercase">
            <span>CLASS 10 MATHS</span>
            <span aria-hidden="true">·</span>
            <span>CHAPTER 2 — बहुपद (POLYNOMIALS)</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-300">500 VVI • OPTION + SOLVED ANSWER • LIVE TEST</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            CHAPTER 2 — बहुपद: 500 VVI Objective Bank (Solved) &amp; Live Test
          </h2>
          <p className="text-sm sm:text-base text-blue-100/90 font-semibold leading-relaxed">
            संपूर्ण 500 VVI वस्तुनिष्ठ प्रश्न (विकल्प उत्तर + चरणबद्ध हल सहित), 10 टॉपिक-वाइज लाइव टेस्ट सेट, डिजिटल OMR शीट तथा 11 LaTeX फॉर्मूला कार्ड्स — सभी फीचर्स सक्रिय!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMathCh02ModalMode('read')}
            className="px-5 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base shadow-lg flex items-center gap-2 cursor-pointer transition-all"
          >
            <BookOpen className="w-5 h-5 stroke-[2.5]" />
            <span>🎯 500 VVI पढ़ें (Option + Solved)</span>
          </button>
          <button
            type="button"
            onClick={() => setMathCh02ModalMode('test')}
            className="px-5 py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm sm:text-base shadow-lg flex items-center gap-2 cursor-pointer transition-all"
          >
            <Sparkles className="w-5 h-5 stroke-[2.5]" />
            <span>⚡ 500 VVI लाइव टेस्ट</span>
          </button>
          <button
            type="button"
            onClick={() => setShowMathCh02FormulaModal(true)}
            className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer transition-all"
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>✨ Formula Sheet</span>
          </button>
        </div>
      </section>

      {/* ====================================================
          SECTION 3 — TODAY'S HIGHLIGHT (CLEAN DYNAMIC BANNER)
          ==================================================== */}
      <section className="space-y-4">
        <div className="text-left border-l-4 border-blue-700 pl-3">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">आज का Highlight</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">महत्वपूर्ण नवीनतम गतिविधियाँ एवं लाइव टेस्ट</p>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden transition-all duration-500 border border-slate-800">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10 text-left">
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-1 rounded bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-extrabold uppercase">
                {activeHighlights[activeHighlightIndex].badge}
              </span>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-white leading-snug">
                {activeHighlights[activeHighlightIndex].title}
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm max-w-3xl">
                {activeHighlights[activeHighlightIndex].description}
              </p>
            </div>

            <button
              onClick={activeHighlights[activeHighlightIndex].action}
              className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all shrink-0 cursor-pointer hover:scale-105 active:scale-100"
            >
              शुरू करें →
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 4 — QUICK STUDY ACTIONS
          ==================================================== */}
      <section className="space-y-6">
        <div className="text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">आज क्या पढ़ना है?</h2>
          <p className="text-slate-500 text-sm font-medium">अपनी आवश्यकतानुसार त्वरित टूल्स चुनें</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1: Study Material */}
          <div
            onClick={() => onNavigate('study-material')}
            className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between text-left h-44"
          >
            <div className="space-y-2">
              <div className="text-2xl">📚</div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors">Study Material</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">प्रिंस सर के हस्तलिखित प्रीमियम नोट्स और अध्याय PDF गाइड</p>
            </div>
            <span className="text-2xs font-extrabold text-blue-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">नोट्स पढ़ें →</span>
          </div>

          {/* Card 2: Online Test */}
          <div
            onClick={() => onNavigate('tests')}
            className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between text-left h-44"
          >
            <div className="space-y-2">
              <div className="text-2xl">📝</div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors">Online Test</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">चैप्टरवार मॉक टेस्ट दें और वास्तविक OMR रैंकिंग जांचें</p>
            </div>
            <span className="text-2xs font-extrabold text-blue-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">टेस्ट दें →</span>
          </div>

          {/* Card 3: PYQ */}
          <div
            onClick={() => onNavigate('study-material')}
            className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between text-left h-44"
          >
            <div className="space-y-2">
              <div className="text-2xl">📄</div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors">PYQ</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">विगत 10 वर्षों के हल सहित बिहार बोर्ड प्रश्न पत्र</p>
            </div>
            <span className="text-2xs font-extrabold text-blue-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">प्रश्न पत्र देखें →</span>
          </div>

          {/* Card 4: Results */}
          <div
            onClick={() => onNavigate('my-progress')}
            className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between text-left h-44"
          >
            <div className="space-y-2">
              <div className="text-2xl">📊</div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors">Results</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">अपने ऑनलाइन टेस्ट स्कोर व परफॉरमेंस की समीक्षा करें</p>
            </div>
            <span className="text-2xs font-extrabold text-blue-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">परिणाम देखें →</span>
          </div>

        </div>
      </section>

      {/* ====================================================
          SECTION 5 — CLASS 10 / CLASS 12 SELECTION
          ==================================================== */}
      <section className="space-y-6">
        <div className="text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">अपनी कक्षा चुनें</h2>
          <p className="text-slate-500 text-sm font-medium">कक्षा अनुसार पृथक अध्ययन पथ और टेस्ट सीरीज</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Class 10 Card */}
          <div
            onClick={() => onNavigate('classes', { classLevel: 'class-10' })}
            className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-400 p-6 sm:p-8 cursor-pointer text-left transition-all duration-300 flex flex-col justify-between h-48"
          >
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-blue-50 text-blue-700 border border-blue-100">Class 10</span>
              <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">📘 Class 10</h3>
              <p className="text-sm text-slate-500 font-medium">बिहार बोर्ड मैट्रिक परीक्षा की संपूर्ण विषय-वार अध्ययन सामग्री व टेस्ट।</p>
            </div>
            <div className="text-xs font-bold text-blue-700 flex items-center gap-1 pt-4 group-hover:translate-x-1 transition-transform">
              <span>पाठ्यक्रम व नोट्स देखें</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Class 12 Card */}
          <div
            onClick={() => onNavigate('classes', { classLevel: 'class-12' })}
            className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-400 p-6 sm:p-8 cursor-pointer text-left transition-all duration-300 flex flex-col justify-between h-48"
          >
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-blue-50 text-blue-700 border border-blue-100">Class 12</span>
              <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">📗 Class 12</h3>
              <p className="text-sm text-slate-500 font-medium">विज्ञान, कला एवं वाणिज्य संकाय हेतु विशेष कोर्सेज, नोट्स व मॉक टेस्ट।</p>
            </div>
            <div className="text-xs font-bold text-blue-700 flex items-center gap-1 pt-4 group-hover:translate-x-1 transition-transform">
              <span>विषय एवं टेस्ट देखें</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

        </div>
      </section>

      {/* ====================================================
          SECTION 6 — LATEST STUDY MATERIAL (MAX 3-4 ITEMS)
          ==================================================== */}
      <section className="space-y-6">
        <div className="flex items-end justify-between text-left">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Latest Study Material</h2>
            <p className="text-slate-500 text-sm font-medium">हाल ही में प्रकाशित टॉपर हस्तलिखित नोट्स</p>
          </div>
          <button
            onClick={() => onNavigate('study-material')}
            className="text-xs sm:text-sm font-black text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
          >
            <span>सभी Study Material देखें</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {latestStudyMaterials.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                {/* Zero-Pill metadata with separator */}
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 tracking-wide uppercase">
                  <span>{item.classLevel === 'class-10' ? 'Class 10' : 'Class 12'}</span>
                  <span>·</span>
                  <span>{item.subjectName}</span>
                </div>
                
                <h3 className="text-sm sm:text-base font-black text-slate-900 line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
                <span>{item.fileSize || 'PDF File'}</span>
                <button
                  type="button"
                  onClick={() => {
                    const sub = SUBJECTS.find((s) => s.id === item.subjectId);
                    const book = BOOKS.find((b) => b.id === item.bookId);
                    const ch = CHAPTERS.find((c) => c.id === item.chapterId);
                    onNavigate('study-material', {
                      classLevel: item.classLevel as any,
                      subjectSlug: sub?.slug || item.subjectId,
                      bookSlug: book?.slug || item.bookId,
                      chapterSlug: ch?.slug || item.chapterId,
                    });
                  }}
                  className="text-blue-700 hover:underline cursor-pointer font-extrabold"
                >
                  खोलें
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================
          SECTION 7 — UPCOMING / FEATURED TEST
          ==================================================== */}
      <section className="space-y-6">
        <div className="flex items-end justify-between text-left">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Featured Tests</h2>
            <p className="text-slate-500 text-sm font-medium">नवीनतम और लोकप्रिय लाइव ओएमआर टेस्ट श्रृंखला</p>
          </div>
          <button
            onClick={() => onNavigate('tests')}
            className="text-xs sm:text-sm font-black text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
          >
            <span>सभी टेस्ट देखें</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {featuredTests.length > 0 ? (
            featuredTests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase">
                    <span>{test.classLevel === 'class-10' ? 'कक्षा 10वीं' : 'कक्षा 12वीं'}</span>
                    <span>·</span>
                    <span>{test.totalQuestions} Questions</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-slate-900 line-clamp-2 leading-snug">
                    {test.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {test.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-2xs text-slate-400 font-extrabold">{test.durationMinutes} मिनट</span>
                  <button
                    type="button"
                    onClick={() => {
                      const sub = SUBJECTS.find((s) => s.id === test.subjectId);
                      const book = BOOKS.find((b) => b.id === test.bookId);
                      const ch = CHAPTERS.find((c) => c.id === test.chapterId);
                      const subSlug = sub?.slug || test.subjectId;
                      const bookSlug = book?.slug || test.bookId;
                      const chSlug = ch?.slug || test.chapterId;
                      onNavigate('tests', {
                        classLevel: test.classLevel as any,
                        subjectSlug: subSlug,
                        bookSlug: bookSlug,
                        chapterSlug: chSlug,
                        testId: test.id,
                      });
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-extrabold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    ⚡ टेस्ट शुरू करें
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-8 text-center text-slate-500 font-bold text-sm bg-slate-50 rounded-2xl border border-slate-200">
              वर्तमान में कोई टेस्ट श्रृंखला उपलब्ध नहीं है।
            </div>
          )}
        </div>
      </section>

      {/* ====================================================
          SECTION 8 — IMPORTANT NOTICE (DYNAMIC DATABASES)
          ==================================================== */}
      <section className="space-y-6">
        <div className="flex items-end justify-between text-left">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">📢 महत्वपूर्ण सूचना</h2>
            <p className="text-slate-500 text-sm font-medium">संस्थान एवं बिहार बोर्ड से जुड़े नवीनतम समाचार</p>
          </div>
          <button
            onClick={() => onNavigate('more', { moreTab: 'notices' })}
            className="text-xs sm:text-sm font-black text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
          >
            <span>सभी सूचनाएँ देखें</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {loadingNotices ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-4 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-3 w-20 bg-slate-100 rounded-full" />
                  <div className="h-3 w-12 bg-slate-50 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-100 rounded-lg" />
                  <div className="h-4 w-3/4 bg-slate-100 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-slate-50 rounded-lg" />
                  <div className="h-3 w-full bg-slate-50 rounded-lg" />
                  <div className="h-3 w-1/2 bg-slate-50 rounded-lg" />
                </div>
                <div className="pt-2 border-t border-slate-50">
                  <div className="h-3 w-24 bg-slate-100 rounded-full" />
                </div>
              </div>
            ))
          ) : publicNotices.length > 0 ? (
            publicNotices.map((notice, i) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedNoticeDetail(notice)}
                className={`p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer ${
                  notice.isUrgent
                    ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
                    : 'bg-white border-slate-200 hover:border-blue-300'
                } flex flex-col justify-between space-y-3 shadow-2xs`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-2xs text-slate-400 font-bold">
                    <span>{notice.publishedAt ? new Date(notice.publishedAt).toLocaleDateString('hi-IN') : 'ताजा सूचना'}</span>
                    {notice.isUrgent && (
                      <span className="text-[10px] font-black px-2 py-0.5 bg-rose-600 text-white rounded-full animate-pulse">अति आवश्यक</span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-slate-900 line-clamp-2 leading-snug">
                    {notice.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-3">
                    {notice.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <span className="text-2xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    विस्तार से पढ़ें 🔍
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">टैप करें</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 py-10 text-center text-slate-400 font-bold text-sm bg-slate-50 border border-slate-200 rounded-2xl">
              📢 वर्तमान में कोई नया सूचना सर्कुलर उपलब्ध नहीं है।
            </div>
          )}
        </div>
      </section>

      {/* ====================================================
          SECTION 9 — STUDENT LEARNING TOOLS (COMPACT GRID)
          ==================================================== */}
      <section className="space-y-6">
        <div className="text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">और भी Learning Tools</h2>
          <p className="text-slate-500 text-sm font-medium">आपकी सुगम तैयारी के लिए विशेष डिजिटल उपकरण</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          
          {/* Formula Vault */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            onClick={() => onNavigate('formula-bank')}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs hover:border-indigo-400 text-left transition-all cursor-pointer space-y-2 h-32 flex flex-col justify-between"
          >
            <div>
              <div className="text-xl">📐</div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 mt-1 leading-tight">Formula Vault</h4>
            </div>
            <p className="text-[10px] text-slate-400 font-bold leading-none">सूत्र एवं प्रमेय बैंक</p>
          </motion.div>

          {/* Daily Study Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            onClick={() => onNavigate('study-tracker')}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs hover:border-indigo-400 text-left transition-all cursor-pointer space-y-2 h-32 flex flex-col justify-between"
          >
            <div>
              <div className="text-xl">⏱️</div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 mt-1 leading-tight">Daily Tracker</h4>
            </div>
            <p className="text-[10px] text-slate-400 font-bold leading-none">लक्ष्य व पोमोडोरो टाइमर</p>
          </motion.div>

          {/* Digital OMR Sheet Practice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            onClick={() => onNavigate('omr-simulator')}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs hover:border-indigo-400 text-left transition-all cursor-pointer space-y-2 h-32 flex flex-col justify-between"
          >
            <div>
              <div className="text-xl">🎯</div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 mt-1 leading-tight">OMR Simulator</h4>
            </div>
            <p className="text-[10px] text-slate-400 font-bold leading-none">डिजिटल OMR शीट अभ्यास</p>
          </motion.div>

          {/* Virtual Science Lab */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            onClick={() => onNavigate('science-lab')}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs hover:border-indigo-400 text-left transition-all cursor-pointer space-y-2 h-32 flex flex-col justify-between"
          >
            <div>
              <div className="text-xl">🔬</div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 mt-1 leading-tight">Virtual Lab</h4>
            </div>
            <p className="text-[10px] text-slate-400 font-bold leading-none">इंटरएक्टिव प्रयोग शाला</p>
          </motion.div>

          {/* AI Doubt Solver */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            onClick={() => onNavigate('solve-doubt')}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs hover:border-indigo-400 text-left transition-all cursor-pointer space-y-2 h-32 flex flex-col justify-between"
          >
            <div>
              <div className="text-xl">🤖</div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 mt-1 leading-tight">Doubt Solver</h4>
            </div>
            <p className="text-[10px] text-slate-400 font-bold leading-none">AI शंका समाधान</p>
          </motion.div>

        </div>
      </section>

      {/* ====================================================
          SECTION 10 — WHY RK STUDY CENTRE
          ==================================================== */}
      <section className="space-y-6 py-6 border-t border-slate-200/60">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Why RK STUDY CENTRE?</h2>
          <p className="text-slate-500 text-sm font-medium">बिहार बोर्ड छात्रों के लिए विश्वसनीय एवं वैज्ञानिक पद्धति आधारित शिक्षण केंद्र</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left pt-4">
          
          <div className="space-y-2 p-4">
            <div className="text-blue-700 text-xl font-bold">📚 एक जगह पढ़ाई</div>
            <h4 className="text-sm font-black text-slate-900">Comprehensive Resources</h4>
            <p className="text-xs text-slate-500 leading-relaxed">सभी विषयों के लिए हस्तलिखित नोट्स, अध्यायवार सारांश, तथा आधिकारिक पाठ्यक्रम सामग्री उपलब्ध।</p>
          </div>

          <div className="space-y-2 p-4">
            <div className="text-blue-700 text-xl font-bold">📝 परीक्षा अभ्यास</div>
            <h4 className="text-sm font-black text-slate-900">Rigorous Testing</h4>
            <p className="text-xs text-slate-500 leading-relaxed">पिछले 10 वर्षों के बोर्ड प्रश्न पत्र (PYQs) और चैप्टरवार लाइव मॉक टेस्ट श्रृंखला।</p>
          </div>

          <div className="space-y-2 p-4">
            <div className="text-blue-700 text-xl font-bold">📊 अपनी Progress देखें</div>
            <h4 className="text-sm font-black text-slate-900">Performance Tracking</h4>
            <p className="text-xs text-slate-500 leading-relaxed">टेस्ट परिणामों, डिजिटल OMR प्रतिक्रियाओं और स्कोरकार्ड के माध्यम से दैनिक प्रदर्शन का विश्लेषण।</p>
          </div>

          <div className="space-y-2 p-4">
            <div className="text-blue-700 text-xl font-bold">🎯 Board Prep Focus</div>
            <h4 className="text-sm font-black text-slate-900">Targeted Excellence</h4>
            <p className="text-xs text-slate-500 leading-relaxed">कक्षा 10वीं (मैट्रिक) तथा 12वीं (इंटरमीडिएट) बोर्ड परीक्षाओं के प्रश्नों पर विशेष बल।</p>
          </div>

        </div>
      </section>

      {/* ====================================================
          SECTION 11 — FINAL CALL-TO-ACTION (CTA)
          ==================================================== */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            आज की पढ़ाई शुरू करें।
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-semibold">
            RK STUDY CENTRE के उत्कृष्ट हस्तलिखित नोट्स, लाइव ऑनलाइन टेस्ट और प्रिंस सर के शैक्षणिक संसाधनों के साथ बोर्ड परीक्षा में सफलता सुनिश्चित करें।
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('study-material')}
              className="w-full sm:w-auto px-7 py-3.5 bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-sm sm:text-base rounded-xl transition-all cursor-pointer shadow-md"
            >
              📚 Study Material देखें
            </button>
            <button
              onClick={() => onNavigate('tests')}
              className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 border border-blue-500 text-white font-extrabold text-sm sm:text-base rounded-xl transition-all cursor-pointer shadow-md"
            >
              📝 Test दें
            </button>
          </div>
        </div>
      </section>

      {/* Notice Full Detail Modal */}
      {selectedNoticeDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 text-left relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {selectedNoticeDetail.noticeType || 'सूचना'}
                  </span>
                  {selectedNoticeDetail.isUrgent && (
                    <span className="text-xs font-black text-white bg-rose-600 px-2.5 py-0.5 rounded-full animate-pulse">
                      अति आवश्यक
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-bold block pt-1">
                  दिनांक: {selectedNoticeDetail.publishedAt ? new Date(selectedNoticeDetail.publishedAt).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'ताजा सूचना'}
                </span>
              </div>
              <button
                onClick={() => setSelectedNoticeDetail(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-lg cursor-pointer transition-colors shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {selectedNoticeDetail.title}
              </h3>

              <div className="text-slate-700 text-sm sm:text-base font-medium leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {selectedNoticeDetail.content}
              </div>

              {selectedNoticeDetail.attachmentUrl && (
                <div className="pt-2">
                  <a
                    href={selectedNoticeDetail.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs sm:text-sm border border-blue-200 transition-all cursor-pointer"
                  >
                    <span>📎 संलग्न दस्तावेज़ देखें (Attachment)</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedNoticeDetail(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs cursor-pointer shadow-md transition-all hover:scale-105"
              >
                बंद करें (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEO Academic Knowledge Hub & Board Exam FAQs (Crawlable Internal Links + Semantic Content) */}
      <section
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-8"
        aria-label="Bihar Board & NCERT Class 9 to 12 Online Study Hub and FAQs"
      >
        <div className="space-y-3 border-b border-slate-100 pb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-extrabold uppercase tracking-wider border border-blue-200">
            Bihar Board (BSEB) &amp; NCERT Online Study Hub
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            RK Study Centre — Class 9 to 12 Notes, VVI Questions &amp; Online Study
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-4xl">
            RK Study Centre (आर.के. स्टडी सेंटर) बिहार बोर्ड (BSEB Matric &amp; Inter) तथा NCERT पाठ्यक्रम के कक्षा 9वीं से 12वीं के विद्यार्थियों को अध्याय-वार हस्तलिखित एवं डिजिटल नोट्स, सूत्र बैंक (Formula Vault), पिछले वर्षों के प्रश्न-पत्र (PYQs), मॉडल पेपर और लाइव टाइमर आधारित ऑनलाइन मॉक टेस्ट प्रदान करता है।
          </p>
        </div>

        {/* Direct Crawlable Search-Intent Quick Links */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
            लोकप्रिय अध्ययन एवं नोट्स लिंक्स (Direct Subject &amp; Board Exam Links)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <a
              href="/class-10-maths-notes"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/class-10-maths-notes');
                onNavigate('study-material', { classLevel: 'class-10', subjectSlug: 'math' });
              }}
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex items-center justify-between gap-2 group"
            >
              <div>
                <div className="text-sm font-black text-slate-900 group-hover:text-blue-800">
                  Class 10 Maths Notes (गणित नोट्स)
                </div>
                <div className="text-xs text-slate-500">NCERT Solutions, Formulas &amp; 500+ VVI MCQ</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0" />
            </a>

            <a
              href="/class-10-science-notes"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/class-10-science-notes');
                onNavigate('study-material', { classLevel: 'class-10', subjectSlug: 'sci' });
              }}
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex items-center justify-between gap-2 group"
            >
              <div>
                <div className="text-sm font-black text-slate-900 group-hover:text-blue-800">
                  Class 10 Science Notes (विज्ञान नोट्स)
                </div>
                <div className="text-xs text-slate-500">Physics, Chemistry &amp; Biology PDF Notes</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0" />
            </a>

            <a
              href="/class-10-social-science-notes"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/class-10-social-science-notes');
                onNavigate('study-material', { classLevel: 'class-10', subjectSlug: 'soc' });
              }}
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex items-center justify-between gap-2 group"
            >
              <div>
                <div className="text-sm font-black text-slate-900 group-hover:text-blue-800">
                  Class 10 Social Science Notes
                </div>
                <div className="text-xs text-slate-500">इतिहास, भूगोल, राजनीति विज्ञान एवं अर्थशास्त्र</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0" />
            </a>

            <a
              href="/bihar-board-class-10-notes"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/bihar-board-class-10-notes');
                onNavigate('study-material', { classLevel: 'class-10' });
              }}
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex items-center justify-between gap-2 group"
            >
              <div>
                <div className="text-sm font-black text-slate-900 group-hover:text-blue-800">
                  Bihar Board Class 10 Notes (BSEB Matric)
                </div>
                <div className="text-xs text-slate-500">सभी विषयों के अध्याय-वार नोट्स व मॉडल पेपर</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0" />
            </a>

            <a
              href="/class-10-vvi-questions"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/class-10-vvi-questions');
                onNavigate('tests', { classLevel: 'class-10' });
              }}
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex items-center justify-between gap-2 group"
            >
              <div>
                <div className="text-sm font-black text-slate-900 group-hover:text-blue-800">
                  Class 10 VVI Questions &amp; Mock Tests
                </div>
                <div className="text-xs text-slate-500">300+ MCQ Marathon &amp; Chapter Quizzes</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0" />
            </a>

            <a
              href="/class-12-physics-notes"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/class-12-physics-notes');
                onNavigate('study-material', { classLevel: 'class-12', subjectSlug: 'phy' });
              }}
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex items-center justify-between gap-2 group"
            >
              <div>
                <div className="text-sm font-black text-slate-900 group-hover:text-blue-800">
                  Class 12 Physics Notes (इंटर भौतिकी)
                </div>
                <div className="text-xs text-slate-500">Derivations, Formula Bank &amp; 100 MCQ Test</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0" />
            </a>
          </div>
        </div>

        {/* Board Exam Student FAQs */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
            विद्यार्थियों द्वारा पूछे जाने वाले सामान्य प्रश्न (Board Exam &amp; Study FAQs)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HOMEPAGE_FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5"
              >
                <h4 className="text-sm font-black text-slate-900">{faq.question}</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Class 10 Maths Ch 2 Formula Notes Full-Screen Modal */}
      {showMathCh02FormulaModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC]">
          <Class10MathCh02FormulaNotesPage
            onBack={() => setShowMathCh02FormulaModal(false)}
            onOpenFullChapterNotes={() => {
              setShowMathCh02FormulaModal(false);
              setMathCh02ModalMode('read');
            }}
          />
        </div>
      )}

      {/* Class 10 Maths Ch 2 500 VVI Objective Question Bank & Live Test Full-Screen Modal */}
      {mathCh02ModalMode && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F8FAFC]">
          <MathCh02QuestionBank500Viewer
            initialMode={mathCh02ModalMode}
            onBack={() => setMathCh02ModalMode(null)}
            onOpenFormulaSheet={() => {
              setMathCh02ModalMode(null);
              setShowMathCh02FormulaModal(true);
            }}
          />
        </div>
      )}

    </div>
  );
}
