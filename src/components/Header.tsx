import { useState, useEffect } from 'react';
import {
  GraduationCap,
  Menu,
  X,
  BookOpen,
  FileText,
  Award,
  BookMarked,
  MoreHorizontal,
  LogIn,
  UserPlus,
  ChevronDown,
  ShieldCheck,
  PhoneCall,
  HelpCircle,
  FileCheck2,
  Lock,
  RotateCcw,
  LogOut,
  User,
  Settings,
  Key,
  TrendingUp,
  Video,
  Sun,
  Moon,
  Sparkles,
  Search
} from 'lucide-react';
import type { MainNavRoute, ClassLevel, MoreSectionTab, AppTheme } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { getStandaloneAppUrl, openPolicyInNewTab } from '../utils/navigationUtils';
import { PWAInstallButton } from './PWAInstallButton';
import { HeaderSearchModal } from './HeaderSearchModal';

interface HeaderProps {
  currentRoute: MainNavRoute;
  onNavigate: (route: MainNavRoute, params?: { classLevel?: ClassLevel; moreTab?: MoreSectionTab }) => void;
  selectedClass?: ClassLevel;
  moreTab?: MoreSectionTab;
  onOpenHistoryMarathon?: () => void;
  onOpenPhysicsMarathon?: () => void;
  onOpenPhysicsCh02Marathon?: () => void;
  onOpenPhysics12Ch01Marathon?: () => void;
}

export function Header({
  currentRoute,
  onNavigate,
  selectedClass,
  moreTab,
  onOpenHistoryMarathon,
  onOpenPhysicsMarathon,
  onOpenPhysicsCh02Marathon,
  onOpenPhysics12Ch01Marathon,
}: HeaderProps) {
  const { user, profile, logout, isOwner } = useAuth();
  const { settings, setTheme } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [classesDropdownOpen, setClassesDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Global Keyboard Listener for Search Modal (Ctrl+K, Cmd+K, or '/')
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut when user is typing inside an input/textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      } else if (e.key === '/' && !searchModalOpen) {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [searchModalOpen]);

  const isDarkMode = settings.theme === 'dark';

  const toggleTheme = () => {
    const nextTheme: AppTheme = isDarkMode ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const handleRouteClick = (route: MainNavRoute, params?: { classLevel?: ClassLevel; moreTab?: MoreSectionTab }) => {
    onNavigate(route, params);
    setMobileMenuOpen(false);
    setClassesDropdownOpen(false);
    setToolsDropdownOpen(false);
    setMoreDropdownOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
      {/* शीर्ष सूचना पट्टी (Top Notification Strip) */}
      <div className="bg-slate-900 text-slate-100 text-xs sm:text-sm py-2.5 px-4 font-semibold">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              सक्रिय Firebase सिस्टम
            </span>
            <span className="hidden md:inline text-slate-200 font-medium">
              बिहार बोर्ड कक्षा 9वीं, 10वीं, 11वीं एवं 12वीं शैक्षणिक मंच
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5 text-slate-300 text-xs sm:text-sm font-medium">
            <PWAInstallButton variant="minimal" />
            <span className="hidden sm:inline">आधिकारिक हेल्पलाइन: <strong className="text-white font-mono">{settings.supportEmail || 'rkstudycentre064@gmail.com'}</strong></span>
            <button
              onClick={() => handleRouteClick('more', { moreTab: 'contact' })}
              className="text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer underline underline-offset-2"
            >
              सहायता संपर्क
            </button>
          </div>
        </div>
      </div>

      {/* मुख्य नेविगेशन बार (Main Navigation Bar) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-22">
          {/* ब्रांड लोगो */}
          <a
            href="/"
            id="brand-logo-btn"
            onClick={(e) => {
              e.preventDefault();
              handleRouteClick('home');
            }}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="w-13 h-13 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-md group-hover:bg-blue-800 transition-colors shrink-0">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  {settings.websiteName || 'RK STUDY CENTRE'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-bold tracking-wide">
                माध्यमिक एवं उच्च माध्यमिक शिक्षा में उत्कृष्टता
              </p>
            </div>
          </a>

          {/* डेस्कटॉप मेन्यू (Desktop Nav Items) */}
          <nav className="hidden lg:flex items-center space-x-1.5" aria-label="Main Navigation">
            <a
              href="/"
              id="nav-home"
              onClick={(e) => {
                e.preventDefault();
                handleRouteClick('home');
              }}
              className={`px-4 py-2.5 rounded-xl text-base font-bold transition-colors cursor-pointer ${
                currentRoute === 'home'
                  ? 'text-blue-700 bg-blue-50/90 shadow-2xs'
                  : 'text-slate-800 hover:text-blue-700 hover:bg-slate-100'
              }`}
            >
              गृह (Home)
            </a>

            {/* कक्षाएं ड्रॉपडाउन (Classes Dropdown) */}
            <div className="relative">
              <button
                id="nav-classes-dropdown"
                onClick={() => {
                  setClassesDropdownOpen(!classesDropdownOpen);
                  setMoreDropdownOpen(false);
                  setUserDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-base font-bold transition-colors cursor-pointer ${
                  currentRoute === 'classes'
                    ? 'text-blue-700 bg-blue-50/90 shadow-2xs'
                    : 'text-slate-800 hover:text-blue-700 hover:bg-slate-100'
                }`}
              >
                <span>कक्षाएं</span>
                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
              </button>

              {classesDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white shadow-xl border border-slate-200 py-3 z-50">
                  <div className="px-4 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    अलग-अलग कक्षा वर्ग
                  </div>
                  {(['class-9', 'class-10', 'class-11', 'class-12'] as ClassLevel[]).map((cls) => {
                    const label = cls === 'class-9' ? 'कक्षा 9वीं (Class 9)' :
                                  cls === 'class-10' ? 'कक्षा 10वीं (मैट्रिक बोर्ड)' :
                                  cls === 'class-11' ? 'कक्षा 11वीं (इंटरमीडिएट)' : 'कक्षा 12वीं (इंटर बोर्ड)';
                    return (
                      <button
                        key={cls}
                        id={`nav-class-${cls}`}
                        onClick={() => handleRouteClick('classes', { classLevel: cls })}
                        className={`w-full text-left px-4 py-3 text-sm sm:text-base flex items-center justify-between hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer ${
                          currentRoute === 'classes' && selectedClass === cls ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800 font-semibold'
                        }`}
                      >
                        <span>{label}</span>
                        <span className="text-xs text-slate-500 font-medium">पाठ्यक्रम</span>
                      </button>
                    );
                  })}
                  <div className="border-t border-slate-100 mt-2 pt-2">
                    <button
                      onClick={() => handleRouteClick('classes')}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      सभी 4 कक्षाओं का विवरण देखें →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <a
              href="/study-material"
              id="nav-study-material"
              onClick={(e) => {
                e.preventDefault();
                handleRouteClick('study-material');
              }}
              className={`px-4 py-2.5 rounded-xl text-base font-bold transition-colors cursor-pointer ${
                currentRoute === 'study-material'
                  ? 'text-blue-700 bg-blue-50/90 shadow-2xs'
                  : 'text-slate-800 hover:text-blue-700 hover:bg-slate-100'
              }`}
            >
              अध्ययन सामग्री
            </a>

            <a
              href="/tests"
              id="nav-tests"
              onClick={(e) => {
                e.preventDefault();
                handleRouteClick('tests');
              }}
              className={`px-4 py-2.5 rounded-xl text-base font-bold transition-colors cursor-pointer ${
                currentRoute === 'tests'
                  ? 'text-blue-700 bg-blue-50/90 shadow-2xs'
                  : 'text-slate-800 hover:text-blue-700 hover:bg-slate-100'
              }`}
            >
              टेस्ट
            </a>

            <a
              href="/courses"
              id="nav-courses"
              onClick={(e) => {
                e.preventDefault();
                handleRouteClick('courses');
              }}
              className={`px-4 py-2.5 rounded-xl text-base font-bold transition-colors cursor-pointer ${
                currentRoute === 'courses'
                  ? 'text-blue-700 bg-blue-50/90 shadow-2xs'
                  : 'text-slate-800 hover:text-blue-700 hover:bg-slate-100'
              }`}
            >
              कोर्सेज
            </a>

            <a
              href="/vlogs"
              id="nav-vlogs"
              onClick={(e) => {
                e.preventDefault();
                handleRouteClick('vlogs');
              }}
              className={`px-4 py-2.5 rounded-xl text-base font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentRoute === 'vlogs'
                  ? 'text-rose-700 bg-rose-50/90 shadow-2xs font-black'
                  : 'text-slate-800 hover:text-rose-700 hover:bg-rose-50/50'
              }`}
            >
              <Video className="w-4 h-4 text-rose-600 shrink-0" />
              <span>व्लॉग & वीडियो</span>
            </a>

            <a
              href="/my-progress"
              id="nav-my-progress"
              onClick={(e) => {
                e.preventDefault();
                handleRouteClick('my-progress');
              }}
              className={`px-4 py-2.5 rounded-xl text-base font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                currentRoute === 'my-progress'
                  ? 'text-blue-700 bg-blue-50/90 shadow-2xs'
                  : 'text-slate-800 hover:text-blue-700 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>मेरी प्रगति</span>
            </a>

            <a
              href="/solve-doubt"
              id="nav-solve-doubt"
              onClick={(e) => {
                e.preventDefault();
                handleRouteClick('solve-doubt');
              }}
              className={`px-4 py-2.5 rounded-xl text-base font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentRoute === 'solve-doubt'
                  ? 'text-amber-700 bg-amber-50 shadow-2xs font-black'
                  : 'text-slate-800 hover:text-amber-700 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 fill-amber-500 animate-pulse" />
              <span>AI डाउट सॉल्व</span>
            </a>

            {/* स्मार्ट स्टडी टूल्स ड्रॉपडाउन (Smart Study Tools Dropdown) */}
            <div className="relative">
              <button
                id="nav-tools-dropdown"
                onClick={() => {
                  setToolsDropdownOpen(!toolsDropdownOpen);
                  setClassesDropdownOpen(false);
                  setMoreDropdownOpen(false);
                  setUserDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-base font-bold transition-colors cursor-pointer ${
                  currentRoute === 'formula-bank' ||
                  currentRoute === 'study-tracker' ||
                  currentRoute === 'omr-simulator' ||
                  currentRoute === 'science-lab'
                    ? 'text-indigo-700 bg-indigo-50 font-black shadow-2xs'
                    : 'text-slate-800 hover:text-indigo-700 hover:bg-slate-100'
                }`}
              >
                <span>स्मार्ट टूल्स</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-100 text-indigo-800 font-extrabold">NEW</span>
                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
              </button>

              {toolsDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white shadow-2xl border border-slate-200 py-3 z-50 divide-y divide-slate-100">
                  <div className="px-4 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    विद्यार्थी उपयोगी टूल्स
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => handleRouteClick('formula-bank')}
                      className={`w-full text-left px-4 py-2.5 flex items-start gap-3 hover:bg-indigo-50 transition-colors cursor-pointer ${
                        currentRoute === 'formula-bank' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-800'
                      }`}
                    >
                      <span className="text-lg">📐</span>
                      <div>
                        <div className="text-sm font-bold text-slate-900">सूत्र एवं प्रमेय बैंक (Formula Vault)</div>
                        <div className="text-2xs text-slate-500">9वीं-12वीं फॉर्मूला शीट्स व लाइव कैलकुलेटर</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleRouteClick('study-tracker')}
                      className={`w-full text-left px-4 py-2.5 flex items-start gap-3 hover:bg-blue-50 transition-colors cursor-pointer ${
                        currentRoute === 'study-tracker' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-800'
                      }`}
                    >
                      <span className="text-lg">🎯</span>
                      <div>
                        <div className="text-sm font-bold text-slate-900">दैनिक अध्ययन लक्ष्य व टाइमर</div>
                        <div className="text-2xs text-slate-500">बोर्ड एग्जाम उलटी गिनती व पोमोडोरो फ़ोकस</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleRouteClick('omr-simulator')}
                      className={`w-full text-left px-4 py-2.5 flex items-start gap-3 hover:bg-amber-50 transition-colors cursor-pointer ${
                        currentRoute === 'omr-simulator' ? 'bg-amber-50 font-bold text-amber-700' : 'text-slate-800'
                      }`}
                    >
                      <span className="text-lg">📝</span>
                      <div>
                        <div className="text-sm font-bold text-slate-900">डिजिटल OMR शीट प्रैक्टिस लैब</div>
                        <div className="text-2xs text-slate-500">50-100 प्रश्न OMR सिमुलेशन व तुरंत परिणाम</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleRouteClick('science-lab')}
                      className={`w-full text-left px-4 py-2.5 flex items-start gap-3 hover:bg-purple-50 transition-colors cursor-pointer ${
                        currentRoute === 'science-lab' ? 'bg-purple-50 font-bold text-purple-700' : 'text-slate-800'
                      }`}
                    >
                      <span className="text-lg">🔬</span>
                      <div>
                        <div className="text-sm font-bold text-slate-900">वर्चुअल विज्ञान प्रयोगशाला (Virtual Lab)</div>
                        <div className="text-2xs text-slate-500">ओम नियम परिपथ, किरण आरेख व pH स्केल</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* अन्य ड्रॉपडाउन (More Dropdown) */}
            <div className="relative">
              <button
                id="nav-more-dropdown"
                onClick={() => {
                  setMoreDropdownOpen(!moreDropdownOpen);
                  setClassesDropdownOpen(false);
                  setUserDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-base font-bold transition-colors cursor-pointer ${
                  currentRoute === 'more'
                    ? 'text-blue-700 bg-blue-50/90 shadow-2xs'
                    : 'text-slate-800 hover:text-blue-700 hover:bg-slate-100'
                }`}
              >
                <span>अन्य (More)</span>
                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
              </button>

              {moreDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-xl border border-slate-200 py-3 z-50">
                  <div className="px-4 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    सूचना एवं सहायता
                  </div>
                  <a
                    href="/about-us"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMoreDropdownOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-base font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between gap-3 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>हमारे बारे में (About Us)</span>
                    </div>
                    <span className="text-xs font-black text-blue-700 bg-blue-100 group-hover:bg-blue-200 px-2 py-0.5 rounded-md">
                      नया टैब ↗
                    </span>
                  </a>
                  <a
                    href="/faq"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMoreDropdownOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-base font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between gap-3 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>प्रश्नोत्तरी / सहायता केंद्र (FAQ)</span>
                    </div>
                    <span className="text-xs font-black text-blue-700 bg-blue-100 group-hover:bg-blue-200 px-2 py-0.5 rounded-md">
                      नया टैब ↗
                    </span>
                  </a>
                  <a
                    href="/contact-support"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMoreDropdownOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-base font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between gap-3 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <PhoneCall className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>संपर्क सहायता (Contact Support)</span>
                    </div>
                    <span className="text-xs font-black text-blue-700 bg-blue-100 group-hover:bg-blue-200 px-2 py-0.5 rounded-md">
                      नया टैब ↗
                    </span>
                  </a>
                  <div className="border-t border-slate-100 my-2"></div>
                  <div className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    कानूनी एवं नीतियां
                  </div>
                  <a
                    href={getStandaloneAppUrl('/terms-and-conditions')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      setMoreDropdownOpen(false);
                      openPolicyInNewTab(e, '/terms-and-conditions', () => onNavigate('terms-and-conditions'));
                    }}
                    className="w-full text-left px-4 py-2.5 text-base font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between gap-3 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileCheck2 className="w-4 h-4 text-slate-500" />
                      <span>नियम एवं शर्तें (Terms & Conditions)</span>
                    </div>
                    <span className="text-xs font-black text-blue-700 bg-blue-100 group-hover:bg-blue-200 px-2 py-0.5 rounded-md">
                      नया टैब ↗
                    </span>
                  </a>
                  <a
                    href={getStandaloneAppUrl('/privacy-policy')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      setMoreDropdownOpen(false);
                      openPolicyInNewTab(e, '/privacy-policy', () => onNavigate('privacy-policy'));
                    }}
                    className="w-full text-left px-4 py-2.5 text-base font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between gap-3 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-slate-500" />
                      <span>गोपनीयता नीति (Privacy Policy)</span>
                    </div>
                    <span className="text-xs font-black text-blue-700 bg-blue-100 group-hover:bg-blue-200 px-2 py-0.5 rounded-md">
                      नया टैब ↗
                    </span>
                  </a>
                  <a
                    href={getStandaloneAppUrl('/refund-cancellation')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      setMoreDropdownOpen(false);
                      openPolicyInNewTab(e, '/refund-cancellation', () => onNavigate('refund-cancellation'));
                    }}
                    className="w-full text-left px-4 py-2.5 text-base font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between gap-3 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <RotateCcw className="w-4 h-4 text-slate-500" />
                      <span>रिफंड और रद्दीकरण (Refund Policy)</span>
                    </div>
                    <span className="text-xs font-black text-blue-700 bg-blue-100 group-hover:bg-blue-200 px-2 py-0.5 rounded-md">
                      नया टैब ↗
                    </span>
                  </a>
                  <a
                    href={getStandaloneAppUrl('/data-privacy')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      setMoreDropdownOpen(false);
                      openPolicyInNewTab(e, '/data-privacy', () => onNavigate('data-privacy'));
                    }}
                    className="w-full text-left px-4 py-2.5 text-base font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between gap-3 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-slate-500" />
                      <span>डेटा गोपनीयता अधिकार (Data Privacy)</span>
                    </div>
                    <span className="text-xs font-black text-blue-700 bg-blue-100 group-hover:bg-blue-200 px-2 py-0.5 rounded-md">
                      नया टैब ↗
                    </span>
                  </a>
                </div>
              )}
            </div>
          </nav>

          {/* 🔥 300 VVI History & Physics Marathon Desktop Buttons */}
          {onOpenHistoryMarathon && (
            <button
              type="button"
              onClick={onOpenHistoryMarathon}
              className="hidden xl:flex items-center gap-1 px-2.5 py-2 rounded-xl bg-gradient-to-r from-red-700 via-rose-700 to-amber-700 hover:from-red-600 hover:to-amber-600 text-white font-black text-xs shadow-md transition-all cursor-pointer border border-amber-300"
              title="कक्षा 10 इतिहास अध्याय 1: 300 VVI महामैराथन टेस्ट (3 Hours)"
            >
              <span>🔥 इतिहास 300 VVI</span>
              <span className="px-1 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase">
                3H
              </span>
            </button>
          )}

          {onOpenPhysicsMarathon && (
            <button
              type="button"
              onClick={onOpenPhysicsMarathon}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-600 hover:from-blue-600 hover:to-amber-500 text-white font-black text-xs shadow-md transition-all cursor-pointer animate-pulse border border-amber-300"
              title="कक्षा 10 भौतिकी अध्याय 1: 300 VVI अखंड महामैराथन टेस्ट (3 Hours)"
            >
              <span>⚡ भौतिकी 300 VVI अखंड</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase">
                3 Hr
              </span>
            </button>
          )}

          {/* खोजें (Search Trigger Button - Desktop) */}
          <button
            id="header-search-btn-desktop"
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer shadow-xs group"
            title="खोजें: विषय, अध्याय, नोट्स या टेस्ट (Ctrl + K)"
          >
            <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 stroke-[2.5] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 hidden md:inline">
              खोजें (Search)
            </span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 shadow-2xs">
              Ctrl K
            </kbd>
          </button>

          {/* लॉगिन / प्रोफाइल बटन्स (User Auth Buttons / Profile Indicator) */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setClassesDropdownOpen(false);
                    setMoreDropdownOpen(false);
                  }}
                  className="flex items-center gap-2.5 py-2 px-3.5 rounded-xl border border-slate-300 hover:border-blue-600 bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-sm">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'वि'}
                  </div>
                  <div className="text-left leading-tight hidden md:block">
                    <div className="text-sm font-bold text-slate-900 max-w-[130px] truncate">
                      {user.displayName || 'विद्यार्थी'}
                    </div>
                    <div className="text-xs text-blue-700 font-bold uppercase">
                      {profile?.classLevel ? profile.classLevel.replace('-', ' ') : 'सक्रिय विद्यार्थी'}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 stroke-[2.5]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-2xl border border-slate-200 py-3.5 px-4 z-50 space-y-3">
                    <div className="border-b border-slate-100 pb-2.5">
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {user.displayName || 'विद्यार्थी'}
                      </div>
                      <div className="text-xs text-slate-500 truncate font-mono">
                        {user.email}
                      </div>
                      {isOwner && (
                        <span className="inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded bg-amber-100 text-amber-900">
                          संचालक / व्यवस्थापक
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-sm">
                      {isOwner && (
                        <>
                          <button
                            onClick={() => handleRouteClick('owner')}
                            className="w-full text-left py-2 px-2.5 rounded-lg hover:bg-amber-100 font-bold text-amber-900 bg-amber-50/80 flex items-center gap-2.5 cursor-pointer border border-amber-200 mb-1"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                            <span>Owner Portal (संचालक)</span>
                          </button>
                          <button
                            onClick={() => {
                              window.location.hash = 'owner/settings';
                              handleRouteClick('owner');
                            }}
                            className="w-full text-left py-2 px-2.5 rounded-lg hover:bg-slate-100 font-bold text-slate-800 flex items-center gap-2.5 cursor-pointer border border-slate-200 mb-1"
                          >
                            <Settings className="w-4 h-4 text-slate-700 shrink-0" />
                            <span>व्यवस्थापक सेटिंग्स (Step 6G)</span>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleRouteClick('my-progress')}
                        className="w-full text-left py-2 px-2.5 rounded-lg hover:bg-emerald-50 font-bold text-emerald-950 flex items-center gap-2.5 cursor-pointer bg-emerald-50/60 border border-emerald-200/70"
                      >
                        <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>मेरी प्रगति (My Progress)</span>
                      </button>
                      <button
                        onClick={() => handleRouteClick('solve-doubt')}
                        className="w-full text-left py-2 px-2.5 rounded-lg hover:bg-amber-50 font-bold text-amber-950 flex items-center gap-2.5 cursor-pointer bg-amber-50/60 border border-amber-200/70"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse shrink-0" />
                        <span>AI डाउट सॉल्व (Doubt Solve)</span>
                      </button>
                      <button
                        onClick={() => handleRouteClick('login')}
                        className="w-full text-left py-2 px-2.5 rounded-lg hover:bg-slate-100 font-semibold text-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-blue-600" />
                        <span>विद्यार्थी प्रोफाइल देखें</span>
                      </button>
                      <button
                        onClick={() => handleRouteClick('classes', { classLevel: profile?.classLevel || 'class-10' })}
                        className="w-full text-left py-2 px-2.5 rounded-lg hover:bg-slate-100 font-semibold text-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span>मेरी कक्षा का पाठ्यक्रम</span>
                      </button>
                      <button
                        onClick={() => handleRouteClick('tests')}
                        className="w-full text-left py-2 px-2.5 rounded-lg hover:bg-slate-100 font-semibold text-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <Award className="w-4 h-4 text-blue-600" />
                        <span>ऑनलाइन टेस्ट पोर्टल</span>
                      </button>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleRouteClick('admin-access-check');
                        }}
                        className="w-full text-left py-2 px-2.5 rounded-lg hover:bg-slate-100 font-semibold text-purple-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <Key className="w-4 h-4 text-purple-600" />
                        <span>Admin Access Check (अनुमति जांच)</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-2">
                      <button
                        onClick={async () => {
                          await logout();
                          setUserDropdownOpen(false);
                          handleRouteClick('home');
                        }}
                        className="w-full py-2.5 px-3 rounded-xl font-bold text-sm text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>लॉगआउट (Sign Out)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  id="header-btn-login"
                  onClick={() => handleRouteClick('login')}
                  className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-base font-bold border transition-all cursor-pointer ${
                    currentRoute === 'login'
                      ? 'border-blue-700 text-blue-700 bg-blue-50 shadow-2xs'
                      : 'border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-slate-400'
                  }`}
                >
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>Login</span>
                </button>
                <button
                  id="header-btn-register"
                  onClick={() => handleRouteClick('register')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-base font-bold bg-blue-700 text-white hover:bg-blue-800 transition-all shadow-sm cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                  <span>खाता बनाएं</span>
                </button>
              </>
            )}

            {/* Theme Toggle Button (Desktop: visible on lg screens and wider) */}
            <button
              id="theme-toggle-btn-desktop"
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-all cursor-pointer hidden lg:flex items-center justify-center shadow-xs active:scale-95"
              title={isDarkMode ? 'लाइट मोड चालू करें (Switch to Light Mode)' : 'डार्क मोड चालू करें (Switch to Dark Mode)'}
              aria-label={isDarkMode ? 'लाइट मोड चालू करें' : 'डार्क मोड चालू करें'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-400 fill-amber-400/20" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-700 dark:text-blue-400" />
              )}
            </button>
          </div>

          {/* मोबाइल मेन्यू एवं खोज बटन */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Search Trigger Button (Mobile) */}
            <button
              id="header-search-btn-mobile"
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-blue-50/80 dark:bg-slate-800 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center shadow-xs active:scale-95"
              title="खोजें (Search)"
              aria-label="खोजें (Search)"
            >
              <Search className="w-5 h-5 stroke-[2.5]" />
            </button>
            {/* Theme Toggle Button (Mobile & Tablet: visible on screens below lg) */}
            <button
              id="theme-toggle-btn-mobile"
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-all cursor-pointer flex items-center justify-center shadow-xs active:scale-95"
              title={isDarkMode ? 'लाइट मोड चालू करें (Switch to Light Mode)' : 'डार्क मोड चालू करें (Switch to Dark Mode)'}
              aria-label={isDarkMode ? 'लाइट मोड चालू करें' : 'डार्क मोड चालू करें'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-400 fill-amber-400/20" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-700 dark:text-blue-400" />
              )}
            </button>

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="मेन्यू खोलें"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* मोबाइल मेन्यू पैनल (Mobile Menu Panel) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-5 pt-4 pb-8 space-y-5">
          <div className="pt-1 pb-3 border-b border-slate-200">
            {user ? (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-sm">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'वि'}
                    </div>
                    <div>
                      <div className="text-base font-bold text-slate-900">{user.displayName || 'विद्यार्थी'}</div>
                      <div className="text-xs text-slate-500 font-mono">{user.email}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 uppercase">
                    {profile?.classLevel ? profile.classLevel.replace('-', ' ') : 'कक्षा'}
                  </span>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  {isOwner && (
                    <button
                      onClick={() => handleRouteClick('owner')}
                      className="w-full py-2.5 px-3 text-sm font-bold text-amber-900 bg-amber-50 border border-amber-300 rounded-xl text-center cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>Owner Portal (संचालक पोर्टल)</span>
                    </button>
                  )}
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => handleRouteClick('login')}
                      className="flex-1 py-2.5 text-sm font-bold bg-white border border-slate-300 rounded-xl text-slate-800 text-center cursor-pointer shadow-xs"
                    >
                      प्रोफाइल देखें
                    </button>
                    <button
                      onClick={async () => {
                        await logout();
                        setMobileMenuOpen(false);
                        handleRouteClick('home');
                      }}
                      className="py-2.5 px-4 text-sm font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl text-center cursor-pointer"
                    >
                      लॉगआउट
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleRouteClick('login')}
                  className="w-full py-3 px-3 rounded-xl text-base font-bold text-center border border-slate-300 text-slate-800 bg-white hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => handleRouteClick('register')}
                  className="w-full py-3 px-3 rounded-xl text-base font-bold text-center bg-blue-700 text-white hover:bg-blue-800 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                  <span>खाता बनाएं</span>
                </button>
              </div>
            )}
          </div>

          {/* PWA Install Button Mobile & Marathon Tests */}
          <div className="py-1 space-y-2">
            {onOpenHistoryMarathon && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenHistoryMarathon();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-red-700 via-rose-700 to-amber-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer border border-amber-300"
              >
                <span>🔥</span>
                <span>इतिहास Ch-01 महामैराथन 300 VVI (3 Hr)</span>
                <span>🎯</span>
              </button>
            )}
            {onOpenPhysicsMarathon && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPhysicsMarathon();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer border border-amber-300 animate-pulse"
              >
                <span>⚡</span>
                <span>भौतिकी Ch-01 अखंड 300 VVI टेस्ट (3 Hr)</span>
                <span>🔥</span>
              </button>
            )}
            <PWAInstallButton className="w-full justify-center py-2.5" />
          </div>

          {/* Smart Study Tools Mobile Section */}
          <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 space-y-2">
            <div className="text-xs font-black text-slate-600 uppercase tracking-wider px-1">
              ⭐ स्मार्ट एजुकेशन टूल्स (Smart Tools)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleRouteClick('formula-bank')}
                className="p-2.5 bg-white rounded-xl border border-slate-200 text-left cursor-pointer hover:border-indigo-400 transition-colors"
              >
                <div className="text-base">📐</div>
                <div className="text-xs font-bold text-slate-900 mt-1">सूत्र व प्रमेय बैंक</div>
                <div className="text-3xs text-slate-500">Formula Vault</div>
              </button>

              <button
                onClick={() => handleRouteClick('study-tracker')}
                className="p-2.5 bg-white rounded-xl border border-slate-200 text-left cursor-pointer hover:border-blue-400 transition-colors"
              >
                <div className="text-base">🎯</div>
                <div className="text-xs font-bold text-slate-900 mt-1">स्टडी ट्रैकर व टाइमर</div>
                <div className="text-3xs text-slate-500">Pomodoro Focus</div>
              </button>

              <button
                onClick={() => handleRouteClick('omr-simulator')}
                className="p-2.5 bg-white rounded-xl border border-slate-200 text-left cursor-pointer hover:border-amber-400 transition-colors"
              >
                <div className="text-base">📝</div>
                <div className="text-xs font-bold text-slate-900 mt-1">OMR शीट प्रैक्टिस</div>
                <div className="text-3xs text-slate-500">Board Exam OMR</div>
              </button>

              <button
                onClick={() => handleRouteClick('science-lab')}
                className="p-2.5 bg-white rounded-xl border border-slate-200 text-left cursor-pointer hover:border-purple-400 transition-colors"
              >
                <div className="text-base">🔬</div>
                <div className="text-xs font-bold text-slate-900 mt-1">वर्चुअल साइंस लैब</div>
                <div className="text-3xs text-slate-500">Live Experiments</div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleRouteClick('home')}
              className={`w-full text-left px-4 py-3 rounded-xl text-lg font-bold cursor-pointer transition-colors ${
                currentRoute === 'home' ? 'bg-blue-50 text-blue-800 shadow-2xs' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              गृह (Home)
            </button>

            <div className="pt-3 pb-2">
              <div className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                कक्षाएं (Classes)
              </div>
              <div className="grid grid-cols-2 gap-2 px-1">
                {(['class-9', 'class-10', 'class-11', 'class-12'] as ClassLevel[]).map((cls) => {
                  const label = cls === 'class-9' ? 'कक्षा 9वीं' :
                                cls === 'class-10' ? 'कक्षा 10वीं' :
                                cls === 'class-11' ? 'कक्षा 11वीं' : 'कक्षा 12वीं';
                  return (
                    <button
                      key={cls}
                      onClick={() => handleRouteClick('classes', { classLevel: cls })}
                      className={`text-left px-3.5 py-2.5 rounded-xl text-base font-bold border cursor-pointer transition-colors ${
                        currentRoute === 'classes' && selectedClass === cls
                          ? 'border-blue-700 bg-blue-50 text-blue-800 ring-2 ring-blue-600/20'
                          : 'border-slate-200 text-slate-800 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => handleRouteClick('study-material')}
              className={`w-full text-left px-4 py-3 rounded-xl text-lg font-bold cursor-pointer transition-colors ${
                currentRoute === 'study-material' ? 'bg-blue-50 text-blue-800 shadow-2xs' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              अध्ययन सामग्री (Study Material)
            </button>

            <button
              onClick={() => handleRouteClick('tests')}
              className={`w-full text-left px-4 py-3 rounded-xl text-lg font-bold cursor-pointer transition-colors ${
                currentRoute === 'tests' ? 'bg-blue-50 text-blue-800 shadow-2xs' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              टेस्ट (Tests)
            </button>

            <button
              onClick={() => handleRouteClick('courses')}
              className={`w-full text-left px-4 py-3 rounded-xl text-lg font-bold cursor-pointer transition-colors ${
                currentRoute === 'courses' ? 'bg-blue-50 text-blue-800 shadow-2xs' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              कोर्सेज (Courses)
            </button>

            <button
              onClick={() => handleRouteClick('vlogs')}
              className={`w-full text-left px-4 py-3 rounded-xl text-lg font-bold cursor-pointer transition-colors flex items-center justify-between ${
                currentRoute === 'vlogs' ? 'bg-rose-50 text-rose-800 font-black shadow-2xs' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Video className="w-5 h-5 text-rose-600" />
                <span>व्लॉग व वीडियो (Vlogs)</span>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                न्यू
              </span>
            </button>

            <button
              onClick={() => handleRouteClick('my-progress')}
              className={`w-full text-left px-4 py-3 rounded-xl text-lg font-bold cursor-pointer transition-colors flex items-center justify-between ${
                currentRoute === 'my-progress' ? 'bg-blue-50 text-blue-800 shadow-2xs' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>मेरी प्रगति (My Progress)</span>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                डैशबोर्ड
              </span>
            </button>

            <button
              onClick={() => handleRouteClick('solve-doubt')}
              className={`w-full text-left px-4 py-3 rounded-xl text-lg font-bold cursor-pointer transition-colors flex items-center justify-between ${
                currentRoute === 'solve-doubt' ? 'bg-amber-50 text-amber-800 shadow-2xs font-black' : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse shrink-0" />
                <span>AI डाउट सॉल्व (Doubt Solve AI)</span>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                AI सॉल्वर
              </span>
            </button>

            <div className="pt-4 border-t border-slate-200">
              <div className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                अन्य अनुभाग (More)
              </div>
              <div className="space-y-1">
                {/* हमारे बारे में - अलग ब्राउज़र टैब में खोलें */}
                <a
                  href="/about-us"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-left px-4 py-2.5 text-base rounded-xl font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-800 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>हमारे बारे में (About Us)</span>
                  <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    नया टैब ↗
                  </span>
                </a>

                {/* प्रश्नोत्तरी / सहायता केंद्र - अलग ब्राउज़र टैब में खोलें */}
                <a
                  href="/faq"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-left px-4 py-2.5 text-base rounded-xl font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-800 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>प्रश्नोत्तरी / सहायता केंद्र (FAQ)</span>
                  <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    नया टैब ↗
                  </span>
                </a>

                {/* संपर्क सहायता - अलग ब्राउज़र टैब में खोलें */}
                <a
                  href={getStandaloneAppUrl('/contact-support')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    openPolicyInNewTab(e, '/contact-support', () => onNavigate('contact-support'));
                  }}
                  className="w-full text-left px-4 py-2.5 text-base rounded-xl font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-800 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>संपर्क सहायता (Contact Support)</span>
                  <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    नया टैब ↗
                  </span>
                </a>

                <a
                  href={getStandaloneAppUrl('/terms-and-conditions')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    openPolicyInNewTab(e, '/terms-and-conditions', () => onNavigate('terms-and-conditions'));
                  }}
                  className="w-full text-left px-4 py-2.5 text-base rounded-xl font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-800 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>नियम एवं शर्तें (Terms & Conditions)</span>
                  <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    नया टैब ↗
                  </span>
                </a>

                <a
                  href={getStandaloneAppUrl('/privacy-policy')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    openPolicyInNewTab(e, '/privacy-policy', () => onNavigate('privacy-policy'));
                  }}
                  className="w-full text-left px-4 py-2.5 text-base rounded-xl font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-800 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>गोपनीयता नीति (Privacy Policy)</span>
                  <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    नया टैब ↗
                  </span>
                </a>

                <a
                  href={getStandaloneAppUrl('/refund-cancellation')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    openPolicyInNewTab(e, '/refund-cancellation', () => onNavigate('refund-cancellation'));
                  }}
                  className="w-full text-left px-4 py-2.5 text-base rounded-xl font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-800 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>रिफंड और रद्दीकरण (Refund Policy)</span>
                  <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    नया टैब ↗
                  </span>
                </a>

                <a
                  href={getStandaloneAppUrl('/data-privacy')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    openPolicyInNewTab(e, '/data-privacy', () => onNavigate('data-privacy'));
                  }}
                  className="w-full text-left px-4 py-2.5 text-base rounded-xl font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-800 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>डेटा गोपनीयता अधिकार (Data Privacy)</span>
                  <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    नया टैब ↗
                  </span>
                </a>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleRouteClick('admin-access-check');
                  }}
                  className="w-full text-left px-4 py-2.5 text-base rounded-xl font-bold text-purple-700 hover:bg-purple-50 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-purple-600" />
                    <span>Admin Access Check (अनुमति जांच)</span>
                  </span>
                </button>
              </div>
            </div>

            {/* खोजें त्वरित बटन (Mobile Drawer Search Bar) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchModalOpen(true);
                }}
                className="w-full p-3 rounded-2xl bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-800 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-between cursor-pointer shadow-2xs hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 stroke-[2.5]" />
                  <span>विषय, अध्याय या टेस्ट खोजें...</span>
                </div>
                <span className="text-xs font-black bg-blue-200/80 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                  Search 🔍
                </span>
              </button>
            </div>

            {/* थीम टॉगल विकल्प (Mobile Drawer Theme Switcher) */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 shadow-2xs">
                    {isDarkMode ? <Sun className="w-5 h-5 text-amber-400 fill-amber-400/20" /> : <Moon className="w-5 h-5 text-indigo-600" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {isDarkMode ? 'डार्क मोड (Dark Mode) सक्रिय' : 'लाइट मोड (Light Mode) सक्रिय'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      थीम प्राथमिकता डिवाइस में सुरक्षित रहेगी
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  {isDarkMode ? 'लाइट मोड' : 'डार्क मोड'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* सर्च मोडल overlay */}
      <HeaderSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigate={onNavigate}
      />
    </header>
  );
}
