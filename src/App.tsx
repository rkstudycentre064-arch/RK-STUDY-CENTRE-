import { useState, useEffect } from 'react';
import type { MainNavRoute, ClassLevel, MoreSectionTab, OwnerSectionTab, AppTheme } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { applyThemeToDOM } from './services/settingsService';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FirebaseStatusBanner } from './components/FirebaseStatusBanner';
import { GlobalAnnouncementBanner } from './components/GlobalAnnouncementBanner';
import { MaintenanceScreen, OwnerMaintenanceWarningBanner } from './components/MaintenanceScreen';
import { HomeView } from './views/HomeView';
import { ClassesView } from './views/ClassesView';
import { StudyMaterialView } from './views/StudyMaterialView';
import { TestsView } from './views/TestsView';
import { CoursesView } from './views/CoursesView';
import { MyProgressView } from './views/MyProgressView';
import { AuthView } from './views/AuthView';
import { MoreView } from './views/MoreView';
import { AboutUsView } from './views/AboutUsView';
import { PoliciesHubView } from './views/PoliciesHubView';
import { FaqView } from './views/FaqView';
import { ContactSupportView } from './views/ContactSupportView';
import { TermsView } from './views/TermsView';
import { PrivacyView } from './views/PrivacyView';
import { RefundCancellationView } from './views/RefundCancellationView';
import { DataPrivacyRightsView } from './views/DataPrivacyRightsView';
import { OwnerView } from './views/OwnerView';
import { AdminAccessCheckView } from './views/AdminAccessCheckView';
import { VlogsView } from './views/VlogsView';
import { DoubtSolveAIView } from './views/DoubtSolveAIView';
import { FormulaBankView } from './views/FormulaBankView';
import { DailyStudyTrackerView } from './views/DailyStudyTrackerView';
import { OmrSimulatorView } from './views/OmrSimulatorView';
import { ScienceLabView } from './views/ScienceLabView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OfflineStudyHubModal } from './components/OfflineStudyHubModal';
import { SplashScreen } from './components/SplashScreen';
import { IndependenceDayQuizModal } from './components/IndependenceDayQuizModal';
import { HistoryCh01MarathonModal } from './components/HistoryCh01MarathonModal';
import { PhysicsCh01MarathonModal } from './components/PhysicsCh01MarathonModal';
import { PhysicsCh02MarathonModal } from './components/PhysicsCh02MarathonModal';
import { Physics12Ch01MarathonModal } from './components/Physics12Ch01MarathonModal';
import { WeakNetworkPromptBanner } from './components/WeakNetworkPromptBanner';
import { AuthRequiredModal } from './components/AuthRequiredModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Loader2 } from 'lucide-react';
import { applyClientSeo, SEO_LANDING_ALIASES } from './utils/seoManager';
import { buildCleanPathForRoute } from './utils/navigationUtils';

const PROTECTED_ROUTES: MainNavRoute[] = [
  'owner'
];

const FEATURE_NAMES: Record<string, string> = {
  'classes': 'कक्षा पाठ्यक्रम एवं विषय सूची',
  'study-material': 'डिजिटल एवं हस्तलिखित नोट्स',
  'tests': 'लाइव ऑनलाइन टेस्ट व क्विज़',
  'courses': 'लक्ष्य बैच एवं विशेष कोर्सेज',
  'my-progress': 'विद्यार्थी प्रगति रिपोर्ट',
  'vlogs': 'वीडियो व्लॉग एवं साइंस प्रयोग',
  'solve-doubt': 'AI शंका समाधान (Doubt Solver)',
  'formula-bank': 'सूत्र एवं प्रमेय बैंक (Formula Vault)',
  'study-tracker': 'दैनिक अध्ययन लक्ष्य व फ़ोकस टाइमर',
  'omr-simulator': 'डिजिटल OMR शीट प्रैक्टिस लैब',
  'science-lab': 'इंटरएक्टिव विज्ञान प्रयोगशाला (Virtual Lab)',
  'policies': 'महत्वपूर्ण नीतियाँ (Policies Hub)',
  'owner': 'व्यवस्थापक पोर्टल (Owner Portal)'
};

function AppContent() {
  const { user, loading: authLoading, isOwner } = useAuth();
  const { settings } = useSettings();
  const [currentRoute, setCurrentRoute] = useState<MainNavRoute>('home');
  const [selectedClass, setSelectedClass] = useState<ClassLevel | undefined>();
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState<string | undefined>();
  const [selectedBookSlug, setSelectedBookSlug] = useState<string | undefined>();
  const [selectedChapterSlug, setSelectedChapterSlug] = useState<string | undefined>();
  const [activeHash, setActiveHash] = useState<string>(() => (typeof window !== 'undefined' && window.location.hash ? window.location.hash.substring(1) : ''));
  const [moreTab, setMoreTab] = useState<MoreSectionTab>('about');
  const [selectedOwnerTab, setSelectedOwnerTab] = useState<OwnerSectionTab | undefined>();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showOfflineHubModal, setShowOfflineHubModal] = useState<boolean>(false);
  const [showTirangaQuiz, setShowTirangaQuiz] = useState<boolean>(false);
  const [showHistoryCh01MarathonModal, setShowHistoryCh01MarathonModal] = useState<boolean>(false);
  const [showPhysicsCh01MarathonModal, setShowPhysicsCh01MarathonModal] = useState<boolean>(false);
  const [showPhysicsCh02MarathonModal, setShowPhysicsCh02MarathonModal] = useState<boolean>(false);
  const [showPhysics12Ch01MarathonModal, setShowPhysics12Ch01MarathonModal] = useState<boolean>(false);
  const [authRequiredModalOpen, setAuthRequiredModalOpen] = useState<boolean>(false);
  const [authRequiredFeatureName, setAuthRequiredFeatureName] = useState<string>('अध्ययन सामग्री');
  const [pendingActionAfterAuth, setPendingActionAfterAuth] = useState<'offline-hub' | 'tiranga-quiz' | null>(null);

  const [authRedirectTarget, setAuthRedirectTarget] = useState<{
    route: MainNavRoute;
    params?: any;
    featureName?: string;
  } | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = sessionStorage.getItem('rk_auth_redirect');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isNotFoundRoute, setIsNotFoundRoute] = useState<boolean>(false);

  const [showSplash, setShowSplash] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const ua = navigator.userAgent || '';
      if (/bot|crawl|spider|slurp|lighthouse|inspect|headless/i.test(ua)) {
        return false;
      }
      if (window.location.pathname && window.location.pathname !== '/') {
        return false;
      }
      return !sessionStorage.getItem('rk_splash_seen');
    } catch {
      return false;
    }
  });

  // Theme initialization from localStorage & system settings
  useEffect(() => {
    try {
      const savedTheme = (typeof window !== 'undefined' ? localStorage.getItem('rk_theme') || 'light' : 'light') as AppTheme;
      applyThemeToDOM(savedTheme);
    } catch {
      applyThemeToDOM('light');
    }
  }, []);

  // Parse initial route from URL Pathname, Hash and Query
  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = (window.location.pathname.replace(/\/+$/, '') || '/').toLowerCase();
      const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);
      const queryPage = (
        searchParams.get('page') ||
        searchParams.get('route') ||
        searchParams.get('tab') ||
        ''
      ).toLowerCase();

      setIsNotFoundRoute(false);

      // Handle High-Intent Search Landing Alias Routes (/class-10-maths-notes, /bihar-board-class-10-notes, etc.)
      if (!hash && SEO_LANDING_ALIASES[pathname]) {
        const alias = SEO_LANDING_ALIASES[pathname];
        setCurrentRoute(alias.route);
        setSelectedClass(alias.classLevel);
        setSelectedSubjectSlug(alias.subjectSlug);
        setSelectedBookSlug(alias.bookSlug);
        setSelectedChapterSlug(alias.chapterSlug);
        applyClientSeo(pathname);
        return;
      }

      // Check if user requested the dedicated Policies Hub page via URL path, hash, or query
      if (
        pathname === '/policies' ||
        pathname.endsWith('/policies') ||
        pathname === '/legal-policies' ||
        pathname.endsWith('/legal-policies') ||
        pathname === '/policy' ||
        pathname.endsWith('/policy') ||
        hash === 'policies' ||
        hash === 'legal-policies' ||
        hash === 'policy' ||
        queryPage === 'policies' ||
        queryPage === 'legal-policies' ||
        queryPage === 'policy'
      ) {
        setCurrentRoute('policies');
        applyClientSeo('/policies');
        return;
      }

      // Check if user requested the dedicated About Us page via URL path, hash, or query
      if (
        pathname === '/about-us' ||
        pathname.endsWith('/about-us') ||
        hash === 'about-us' ||
        queryPage === 'about-us' ||
        queryPage === 'about'
      ) {
        setCurrentRoute('about-us');
        applyClientSeo('/about-us');
        return;
      }

      // Check if user requested the dedicated FAQ / Help Center page via URL path, hash, or query
      if (
        pathname === '/faq' ||
        pathname.endsWith('/faq') ||
        hash === 'faq' ||
        queryPage === 'faq' ||
        queryPage === 'help'
      ) {
        setCurrentRoute('faq');
        applyClientSeo('/faq');
        return;
      }

      // Check if user requested the dedicated Contact Support page via URL path, hash, or query
      if (
        pathname === '/contact-support' ||
        pathname.endsWith('/contact-support') ||
        hash === 'contact-support' ||
        queryPage === 'contact-support' ||
        queryPage === 'contact'
      ) {
        setCurrentRoute('contact-support');
        applyClientSeo('/contact-support');
        return;
      }

      // Check if user requested the dedicated Terms & Conditions page via URL path, hash, or query
      if (
        pathname === '/terms-and-conditions' ||
        pathname.endsWith('/terms-and-conditions') ||
        pathname === '/terms' ||
        pathname.endsWith('/terms') ||
        hash === 'terms-and-conditions' ||
        hash === 'terms' ||
        queryPage === 'terms-and-conditions' ||
        queryPage === 'terms'
      ) {
        setCurrentRoute('terms-and-conditions');
        applyClientSeo('/terms-and-conditions');
        return;
      }

      // Check if user requested the dedicated Privacy Policy page via URL path, hash, or query
      if (
        pathname === '/privacy-policy' ||
        pathname.endsWith('/privacy-policy') ||
        pathname === '/privacy' ||
        pathname.endsWith('/privacy') ||
        hash === 'privacy-policy' ||
        hash === 'privacy' ||
        queryPage === 'privacy-policy' ||
        queryPage === 'privacy'
      ) {
        setCurrentRoute('privacy-policy');
        applyClientSeo('/privacy-policy');
        return;
      }

      // Check if user requested the dedicated Refund & Cancellation Policy page via URL path, hash, or query
      if (
        pathname === '/refund-cancellation' ||
        pathname.endsWith('/refund-cancellation') ||
        pathname === '/refund' ||
        pathname.endsWith('/refund') ||
        hash === 'refund-cancellation' ||
        hash === 'refund' ||
        queryPage === 'refund-cancellation' ||
        queryPage === 'refund'
      ) {
        setCurrentRoute('refund-cancellation');
        applyClientSeo('/refund-cancellation');
        return;
      }

      // Check if user requested the dedicated Data Privacy Rights page via URL path, hash, or query
      if (
        pathname === '/data-privacy' ||
        pathname.endsWith('/data-privacy') ||
        pathname === '/privacy-rights' ||
        pathname.endsWith('/privacy-rights') ||
        hash === 'data-privacy' ||
        hash === 'privacy-rights' ||
        queryPage === 'data-privacy' ||
        queryPage === 'privacy-rights'
      ) {
        setCurrentRoute('data-privacy');
        applyClientSeo('/data-privacy');
        return;
      }

      // Check if user requested the dedicated Owner Portal page via URL path or hash
      if (
        pathname === '/owner' ||
        pathname.endsWith('/owner') ||
        pathname.startsWith('/owner/') ||
        hash === 'owner' ||
        hash.startsWith('owner/')
      ) {
        setCurrentRoute('owner');
        if (pathname.includes('/dashboard') || hash.includes('dashboard')) {
          setSelectedOwnerTab('dashboard');
        } else if (pathname.includes('/students') || hash.includes('students')) {
          setSelectedOwnerTab('students');
        } else if (pathname.includes('/teachers') || hash.includes('teachers')) {
          setSelectedOwnerTab('teachers');
        } else if (pathname.includes('/timetable') || hash.includes('timetable')) {
          setSelectedOwnerTab('timetable');
        } else if (pathname.includes('/attendance') || hash.includes('attendance')) {
          setSelectedOwnerTab('attendance');
        } else if (pathname.includes('/fees') || hash.includes('fees') || hash.includes('fee')) {
          setSelectedOwnerTab('fees');
        } else if (pathname.includes('/exams') || hash.includes('exams') || hash.includes('exam')) {
          setSelectedOwnerTab('exams');
        } else if (pathname.includes('/results') || hash.includes('results') || hash.includes('result')) {
          setSelectedOwnerTab('results');
        } else if (pathname.includes('/courses') || hash.includes('courses')) {
          setSelectedOwnerTab('courses');
        } else if (pathname.includes('/notices') || hash.includes('notices') || hash.includes('notice')) {
          setSelectedOwnerTab('notices');
        } else if (pathname.includes('/inquiries') || hash.includes('inquiries') || hash.includes('inquiry')) {
          setSelectedOwnerTab('inquiries');
        } else if (pathname.includes('/reports') || hash.includes('reports') || hash.includes('report')) {
          setSelectedOwnerTab('reports');
        } else if (pathname.includes('/notifications') || hash.includes('notifications') || hash.includes('notification')) {
          setSelectedOwnerTab('notifications');
        } else if (pathname.includes('/vlogs') || hash.includes('vlogs') || hash.includes('vlog')) {
          setSelectedOwnerTab('vlogs');
        } else if (pathname.includes('/tests') || hash.includes('tests')) {
          setSelectedOwnerTab('tests');
        } else if (pathname.includes('/questions-pyq') || hash.includes('questions-pyq')) {
          setSelectedOwnerTab('questions-pyq');
        } else if (pathname.includes('/study-material') || hash.includes('study-material')) {
          setSelectedOwnerTab('study-material');
        } else if (pathname.includes('/settings') || hash.includes('settings') || hash.includes('setting')) {
          setSelectedOwnerTab('settings');
        } else {
          setSelectedOwnerTab('dashboard');
        }
        applyClientSeo('/owner');
        return;
      }

      // Check if user requested the Admin Access Approval Checker page via URL path or hash
      if (
        pathname === '/admin-access-check' ||
        pathname.endsWith('/admin-access-check') ||
        pathname === '/admin-check' ||
        pathname.endsWith('/admin-check') ||
        hash === 'admin-access-check' ||
        hash === 'admin-check'
      ) {
        setCurrentRoute('admin-access-check');
        applyClientSeo('/admin-access-check');
        return;
      }

      const cleanPathnameSource = pathname !== '/' ? pathname.substring(1) : '';
      const pathSource = hash || cleanPathnameSource || queryPage;
      setActiveHash(pathSource);

      if (!pathSource || pathSource === 'home') {
        setCurrentRoute('home');
      } else if (pathSource.startsWith('classes')) {
        setCurrentRoute('classes');
        const parts = pathSource.split('/');
        if (parts[1] && ['class-9', 'class-10', 'class-11', 'class-12'].includes(parts[1])) {
          setSelectedClass(parts[1] as ClassLevel);
        }
        setSelectedSubjectSlug(parts[2] || undefined);
        setSelectedBookSlug(parts[3] || undefined);
        setSelectedChapterSlug(parts[4] || undefined);
      } else if (pathSource.startsWith('study-material')) {
        setCurrentRoute('study-material');
        const parts = pathSource.split('/');
        if (parts[1] && ['class-9', 'class-10', 'class-11', 'class-12'].includes(parts[1])) {
          setSelectedClass(parts[1] as ClassLevel);
        }
        setSelectedSubjectSlug(parts[2] || undefined);
        setSelectedBookSlug(parts[3] || undefined);
        setSelectedChapterSlug(parts[4] || undefined);
      } else if (pathSource.startsWith('tests')) {
        setCurrentRoute('tests');
        const parts = pathSource.split('/');
        if (parts[1] === 'result') {
          // Result route handled in TestsView - do not overwrite subject/book/chapter slugs
        } else {
          if (parts[1] && ['class-9', 'class-10', 'class-11', 'class-12'].includes(parts[1])) {
            setSelectedClass(parts[1] as ClassLevel);
          } else {
            setSelectedClass(undefined);
          }
          setSelectedSubjectSlug(parts[2] || undefined);
          setSelectedBookSlug(parts[3] || undefined);
          setSelectedChapterSlug(parts[4] || undefined);
        }
      } else if (pathSource === 'courses') {
        setCurrentRoute('courses');
      } else if (pathSource === 'formula-bank') {
        setCurrentRoute('formula-bank');
      } else if (pathSource === 'study-tracker') {
        setCurrentRoute('study-tracker');
      } else if (pathSource === 'omr-simulator') {
        setCurrentRoute('omr-simulator');
      } else if (pathSource === 'science-lab') {
        setCurrentRoute('science-lab');
      } else if (pathSource === 'vlogs' || pathSource.startsWith('vlogs') || pathSource === 'vlog' || pathSource.startsWith('vlog/')) {
        setCurrentRoute('vlogs');
      } else if (pathSource === 'my-progress' || pathSource.startsWith('my-progress') || pathSource === 'progress') {
        setCurrentRoute('my-progress');
        const parts = pathSource.split('/');
        if (parts[1] && ['class-9', 'class-10', 'class-11', 'class-12'].includes(parts[1])) {
          setSelectedClass(parts[1] as ClassLevel);
        }
      } else if (pathSource === 'login' || pathSource === 'auth') {
        setCurrentRoute('login');
        setAuthMode('login');
      } else if (pathSource === 'register') {
        setCurrentRoute('register');
        setAuthMode('register');
      } else if (pathSource.startsWith('more')) {
        setCurrentRoute('more');
        const parts = pathSource.split('/');
        if (
          parts[1] &&
          ['about', 'faq', 'contact', 'notices', 'terms', 'privacy', 'refund', 'data-privacy'].includes(parts[1])
        ) {
          setMoreTab(parts[1] as MoreSectionTab);
        }
      } else if (pathSource === 'solve-doubt' || pathSource === 'doubt' || pathSource === 'doubt-solve') {
        setCurrentRoute('solve-doubt');
      } else {
        setIsNotFoundRoute(true);
      }

      const effectiveSeoPath = hash ? `/${hash}` : pathname;
      const seoResult = applyClientSeo(effectiveSeoPath);
      if (seoResult.statusCode === 404 && !hash) {
        setIsNotFoundRoute(true);
      }

      if (
        hash === 'physics12-ch01-marathon' || 
        hash === 'physics12-1' || 
        hash === 'physics12-300' || 
        hash === 'electro-marathon' ||
        pathname === '/physics12-ch01-marathon'
      ) {
        setShowPhysics12Ch01MarathonModal(true);
      } else if (
        hash === 'physics-ch02-marathon' || 
        hash === 'physics-2' || 
        hash === 'physics-ch2-300' || 
        hash === 'refraction-marathon' ||
        pathname === '/physics-ch02-marathon'
      ) {
        setShowPhysicsCh02MarathonModal(true);
      } else if (
        hash === 'physics-marathon' || 
        hash === 'akhand-marathon' || 
        hash === 'physics-300' || 
        pathname === '/physics-marathon' ||
        pathname === '/akhand-marathon'
      ) {
        setShowPhysicsCh01MarathonModal(true);
      } else if (
        hash === 'history-marathon' || 
        hash === 'mahamarathon' || 
        hash === 'history-300' || 
        pathname === '/history-marathon' ||
        pathname === '/mahamarathon'
      ) {
        setShowHistoryCh01MarathonModal(true);
      }
    };

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Check direct deep-link protection for unauthenticated users once auth finishes loading
  useEffect(() => {
    if (!authLoading && !user && PROTECTED_ROUTES.includes(currentRoute)) {
      const featureName = FEATURE_NAMES[currentRoute] || 'अध्ययन सामग्री';
      const target = {
        route: currentRoute,
        params: {
          classLevel: selectedClass,
          subjectSlug: selectedSubjectSlug,
          bookSlug: selectedBookSlug,
          chapterSlug: selectedChapterSlug,
          moreTab: moreTab,
        },
        featureName,
      };
      setAuthRedirectTarget(target);
      try {
        sessionStorage.setItem('rk_auth_redirect', JSON.stringify(target));
      } catch {}

      // Prompt authentication
      setAuthRequiredFeatureName(featureName);
      setAuthRequiredModalOpen(true);
    }
  }, [authLoading, user, currentRoute, selectedClass, selectedSubjectSlug, selectedBookSlug, selectedChapterSlug, moreTab]);

  const navigateTo = (
    route: MainNavRoute,
    params?: { 
      classLevel?: ClassLevel; 
      subjectSlug?: string; 
      bookSlug?: string; 
      chapterSlug?: string; 
      testId?: string;
      moreTab?: MoreSectionTab;
      ownerTab?: OwnerSectionTab;
    },
    forceAuthBypass = false
  ) => {
    // 🔒 Enforce Authentication for all protected features if user is not logged in
    if (!forceAuthBypass && !user && PROTECTED_ROUTES.includes(route)) {
      const featureName = FEATURE_NAMES[route] || 'अध्ययन सामग्री';
      const target = { route, params, featureName };
      setAuthRedirectTarget(target);
      try {
        sessionStorage.setItem('rk_auth_redirect', JSON.stringify(target));
      } catch {}

      setAuthRequiredFeatureName(featureName);
      setAuthRequiredModalOpen(true);
      return;
    }

    // Standalone institutional pages mapping
    const standaloneMap: Record<string, string> = {
      'policies': '/policies',
      'about-us': '/about-us',
      'faq': '/faq',
      'contact-support': '/contact-support',
      'terms-and-conditions': '/terms-and-conditions',
      'privacy-policy': '/privacy-policy',
      'refund-cancellation': '/refund-cancellation',
      'data-privacy': '/data-privacy',
      'admin-access-check': '/admin-access-check',
    };

    setIsNotFoundRoute(false);

    if (standaloneMap[route]) {
      setCurrentRoute(route);
      const targetStandalonePath = standaloneMap[route];
      window.history.pushState({}, '', targetStandalonePath);
      applyClientSeo(targetStandalonePath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentRoute(route);
    if (params?.classLevel) {
      setSelectedClass(params.classLevel);
    }
    if (route === 'owner' && params?.ownerTab) {
      setSelectedOwnerTab(params.ownerTab);
    }
    
    if (route === 'classes' || route === 'study-material' || route === 'tests') {
      setSelectedSubjectSlug(params?.subjectSlug);
      setSelectedBookSlug(params?.bookSlug);
      setSelectedChapterSlug(params?.chapterSlug);
    }

    if (params?.moreTab) {
      setMoreTab(params.moreTab);
    }
    if (route === 'login') {
      setAuthMode('login');
    }
    if (route === 'register') {
      setAuthMode('register');
    }

    // Update clean crawlable URL path for Googlebot & browser history
    let newHash: string = route;
    if ((route === 'classes' || route === 'study-material' || route === 'tests') && params?.classLevel) {
      newHash = `${route}/${params.classLevel}`;
      if (params.subjectSlug) {
        newHash += `/${params.subjectSlug}`;
        if (params.bookSlug) {
          newHash += `/${params.bookSlug}`;
          if (params.chapterSlug) {
            newHash += `/${params.chapterSlug}`;
            if (route === 'tests' && params.testId) {
              newHash += `/test/${params.testId}`;
            }
          }
        }
      }
    } else if (route === 'tests' && !params?.classLevel) {
      setSelectedClass(undefined);
      newHash = 'tests';
    } else if (route === 'owner' && params?.ownerTab) {
      newHash = `owner/${params.ownerTab}`;
    } else if (route === 'more' && params?.moreTab) {
      newHash = `more/${params.moreTab}`;
    }
    setActiveHash(newHash);

    const cleanPath = buildCleanPathForRoute(route, params);
    try {
      window.history.pushState({}, '', cleanPath);
      applyClientSeo(cleanPath);
    } catch {
      window.location.hash = newHash;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Callback when authentication succeeds from AuthRequiredModal
  const handleAuthModalSuccess = () => {
    setAuthRequiredModalOpen(false);

    if (pendingActionAfterAuth === 'offline-hub') {
      setPendingActionAfterAuth(null);
      setShowOfflineHubModal(true);
      return;
    }
    if (pendingActionAfterAuth === 'tiranga-quiz') {
      setPendingActionAfterAuth(null);
      setShowTirangaQuiz(true);
      return;
    }

    let target = authRedirectTarget;
    if (!target && typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('rk_auth_redirect');
        if (stored) target = JSON.parse(stored);
      } catch {}
    }

    if (target && target.route && target.route !== 'login' && target.route !== 'register') {
      setAuthRedirectTarget(null);
      try {
        sessionStorage.removeItem('rk_auth_redirect');
      } catch {}
      navigateTo(target.route, target.params, true);
    }
  };

  // Handlers for Home feature modals with auth protection
  const handleOpenOfflineHubProtected = () => {
    if (!user) {
      setPendingActionAfterAuth('offline-hub');
      setAuthRequiredFeatureName('ऑफ़लाइन स्टडी हब');
      setAuthRequiredModalOpen(true);
      return;
    }
    setShowOfflineHubModal(true);
  };

  const handleOpenTirangaQuizProtected = () => {
    if (!user) {
      setPendingActionAfterAuth('tiranga-quiz');
      setAuthRequiredFeatureName('स्वतंत्रता दिवस तिरंगा MCQ क्विज़');
      setAuthRequiredModalOpen(true);
      return;
    }
    setShowTirangaQuiz(true);
  };

  // If Maintenance Mode is enabled and user is not owner
  if (
    settings.isMaintenanceActive &&
    !isOwner &&
    currentRoute !== 'login' &&
    currentRoute !== 'register' &&
    currentRoute !== 'admin-access-check'
  ) {
    return <MaintenanceScreen onNavigate={navigateTo} />;
  }

  // Loading state for protected routes when auth is still initializing
  if (authLoading && PROTECTED_ROUTES.includes(currentRoute)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4 p-8">
          <Loader2 className="w-10 h-10 animate-spin text-blue-700 mx-auto" />
          <p className="text-slate-800 font-black text-lg">विद्यार्थी प्रमाणीकरण जांच जारी है...</p>
          <p className="text-slate-500 font-bold text-xs">RK STUDY CENTRE • सुरक्षित शैक्षणिक पोर्टल</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Animated Opening Splash Screen for initial load */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Owner Maintenance Notification (when Owner is logged in during Maintenance) */}
      {isOwner && settings.isMaintenanceActive && (
        <OwnerMaintenanceWarningBanner
          onOpenSettings={() => {
            setCurrentRoute('owner');
            setSelectedOwnerTab('settings');
            window.location.hash = 'owner/settings';
          }}
        />
      )}

      {/* Platform Status Strip */}
      <FirebaseStatusBanner onNavigate={navigateTo} />

      {/* Main Header */}
      <Header
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        selectedClass={selectedClass}
        moreTab={moreTab}
        onOpenHistoryMarathon={() => setShowHistoryCh01MarathonModal(true)}
        onOpenPhysicsMarathon={() => setShowPhysicsCh01MarathonModal(true)}
        onOpenPhysicsCh02Marathon={() => setShowPhysicsCh02MarathonModal(true)}
        onOpenPhysics12Ch01Marathon={() => setShowPhysics12Ch01MarathonModal(true)}
      />

      {/* Global Announcement Banner for Students & Visitors */}
      <GlobalAnnouncementBanner />

      {/* Primary Content View Area - Optimized for Android, Desktop, and Ultra-wide */}
      <main className="grow max-w-7xl 2xl:max-w-[1400px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-6">
        {isNotFoundRoute ? (
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-slate-200">
              <span className="inline-block px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-extrabold uppercase tracking-wider mb-4">
                HTTP 404 • Page Not Found
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mb-3">
                404 — यह पृष्ठ उपलब्ध नहीं है (Page Not Found)
              </h1>
              <p className="text-slate-600 max-w-xl mx-auto mb-8 font-medium">
                आप जिस लिंक या पेज को खोज रहे हैं वह स्थानांतरित हो गया है या मौजूद नहीं है। नीचे दिए गए प्रमुख अध्ययन पोर्टल (Study Portals) में से चुनें:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('home');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm transition-colors"
                >
                  मुख्य पृष्ठ (Home)
                </a>
                <a
                  href="/study-material"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('study-material');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-sm transition-colors"
                >
                  Study Material &amp; Notes PDF
                </a>
                <a
                  href="/classes/class-10/math"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('classes', { classLevel: 'class-10', subjectSlug: 'math' });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors"
                >
                  Class 10 Maths Notes
                </a>
                <a
                  href="/classes/class-10/sci"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('classes', { classLevel: 'class-10', subjectSlug: 'sci' });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors"
                >
                  Class 10 Science Notes
                </a>
                <a
                  href="/tests"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('tests');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors"
                >
                  Online Mock Tests
                </a>
              </div>
            </div>
          </div>
        ) : (
          <>
        {currentRoute === 'home' && (
          <HomeView
            onNavigate={navigateTo}
            onOpenOfflineHub={handleOpenOfflineHubProtected}
            onOpenMarathonTest={() => setShowHistoryCh01MarathonModal(true)}
            onOpenPhysicsMarathon={() => setShowPhysicsCh01MarathonModal(true)}
            onOpenPhysicsCh02Marathon={() => setShowPhysicsCh02MarathonModal(true)}
            onOpenPhysics12Ch01Marathon={() => setShowPhysics12Ch01MarathonModal(true)}
          />
        )}

        {currentRoute === 'classes' && (
          <ClassesView
            initialClass={selectedClass}
            initialSubjectSlug={selectedSubjectSlug}
            initialBookSlug={selectedBookSlug}
            initialChapterSlug={selectedChapterSlug}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute === 'study-material' && (
          <StudyMaterialView 
            initialClass={selectedClass}
            initialSubjectSlug={selectedSubjectSlug}
            initialBookSlug={selectedBookSlug}
            initialChapterSlug={selectedChapterSlug}
            onNavigate={navigateTo} 
          />
        )}

        {currentRoute === 'tests' && (
          <TestsView 
            initialClass={selectedClass}
            initialSubjectSlug={selectedSubjectSlug}
            initialBookSlug={selectedBookSlug}
            initialChapterSlug={selectedChapterSlug}
            urlParts={activeHash ? activeHash.split('/') : (window.location.hash ? window.location.hash.substring(1).split('/') : [])}
            onNavigate={navigateTo} 
            onOpenHistoryMarathon={() => setShowHistoryCh01MarathonModal(true)}
            onOpenPhysicsMarathon={() => setShowPhysicsCh01MarathonModal(true)}
            onOpenPhysicsCh02Marathon={() => setShowPhysicsCh02MarathonModal(true)}
            onOpenPhysics12Ch01Marathon={() => setShowPhysics12Ch01MarathonModal(true)}
          />
        )}

        {currentRoute === 'courses' && <CoursesView onNavigate={navigateTo} />}

        {currentRoute === 'vlogs' && (
          <VlogsView 
            initialVlogSlug={window.location.hash ? window.location.hash.replace(/^#\/?(vlogs?\/)?/, '') : undefined} 
            onNavigate={navigateTo} 
          />
        )}

        {currentRoute === 'my-progress' && (
          <MyProgressView initialClass={selectedClass} onNavigate={navigateTo} />
        )}

        {currentRoute === 'solve-doubt' && (
          <DoubtSolveAIView onNavigate={navigateTo} />
        )}

        {currentRoute === 'formula-bank' && (
          <FormulaBankView onNavigate={navigateTo} />
        )}

        {currentRoute === 'study-tracker' && (
          <DailyStudyTrackerView onNavigate={navigateTo} />
        )}

        {currentRoute === 'omr-simulator' && (
          <OmrSimulatorView onNavigate={navigateTo} />
        )}

        {currentRoute === 'science-lab' && (
          <ScienceLabView onNavigate={navigateTo} />
        )}

        {(currentRoute === 'login' || currentRoute === 'register') && (
          <AuthView 
            initialMode={authMode} 
            redirectTarget={authRedirectTarget}
            reasonMessage={authRedirectTarget ? `"${authRedirectTarget.featureName || 'अध्ययन सामग्री'}" का उपयोग करने के लिए कृपया Login या Sign Up करें।` : undefined}
            onNavigate={navigateTo} 
          />
        )}

        {currentRoute === 'more' && (
          <MoreView initialTab={moreTab} onNavigate={navigateTo} />
        )}

        {currentRoute === 'policies' && (
          <PoliciesHubView onNavigate={navigateTo} />
        )}

        {currentRoute === 'about-us' && (
          <AboutUsView onNavigate={navigateTo} />
        )}

        {currentRoute === 'faq' && (
          <FaqView onNavigate={navigateTo} />
        )}

        {currentRoute === 'contact-support' && (
          <ContactSupportView onNavigate={navigateTo} />
        )}

        {currentRoute === 'terms-and-conditions' && (
          <TermsView onNavigate={navigateTo} />
        )}

        {currentRoute === 'privacy-policy' && (
          <PrivacyView onNavigate={navigateTo} />
        )}

        {currentRoute === 'refund-cancellation' && (
          <RefundCancellationView onNavigate={navigateTo} />
        )}

        {currentRoute === 'data-privacy' && (
          <DataPrivacyRightsView onNavigate={navigateTo} />
        )}

        {currentRoute === 'owner' && (isOwner ? (
          <OwnerView onNavigate={navigateTo} initialTab={selectedOwnerTab} />
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-slate-200">
            <h2 className="text-2xl font-black text-red-600">Access Denied (अधिकार नहीं है)</h2>
            <p className="text-slate-600 mt-2">आप इस अनुभाग को देखने के लिए अधिकृत नहीं हैं।</p>
            <button onClick={() => navigateTo('home')} className="mt-4 px-6 py-2 bg-blue-700 text-white rounded-xl font-bold cursor-pointer">मुख्य पृष्ठ पर जाएँ</button>
          </div>
        ))}

        {currentRoute === 'admin-access-check' && (
          <AdminAccessCheckView onNavigate={navigateTo} />
        )}
          </>
        )}
      </main>

      {/* Persistent Offline Floating Indicator */}
      <OfflineIndicator 
        onOpenOfflineHub={handleOpenOfflineHubProtected} 
      />

      {/* Global Offline Study Materials Hub Modal */}
      <OfflineStudyHubModal
        isOpen={showOfflineHubModal}
        onClose={() => setShowOfflineHubModal(false)}
        onOpenInteractiveNote={(noteId) => {
          setShowOfflineHubModal(false);
          // Navigate to class 10 study materials or notes view
          navigateTo('study-material', {
            classLevel: 'class-10',
            subjectSlug: noteId.includes('geo') ? 'geography' : 'physics',
            chapterSlug: noteId.includes('ch03') ? 'human-eye-colourful-world' : noteId.includes('ch02') ? 'refraction-of-light' : 'reflection-of-light',
          });
        }}
      />

      {/* Independence Day Patriotic Tiranga MCQ Quiz Modal (100% Offline & Weak Network Resilient) */}
      <IndependenceDayQuizModal
        isOpen={showTirangaQuiz}
        onClose={() => setShowTirangaQuiz(false)}
      />

      {/* 🔥 Class 10 History Chapter 01 - 300 VVI 3-Hour Mega Marathon Testing Modal */}
      <HistoryCh01MarathonModal
        isOpen={showHistoryCh01MarathonModal}
        onClose={() => setShowHistoryCh01MarathonModal(false)}
        onNavigateToNotes={() => {
          setShowHistoryCh01MarathonModal(false);
          navigateTo('study-material', {
            classLevel: 'class-10',
            subjectSlug: 'history',
            chapterSlug: 'chapter-1',
          });
        }}
      />

      {/* ⚡ Class 10 Physics Chapter 01 - 300 VVI 3-Hour Akhand Marathon Testing Modal */}
      <PhysicsCh01MarathonModal
        isOpen={showPhysicsCh01MarathonModal}
        onClose={() => setShowPhysicsCh01MarathonModal(false)}
        onNavigateToNotes={() => {
          setShowPhysicsCh01MarathonModal(false);
          navigateTo('study-material', {
            classLevel: 'class-10',
            subjectSlug: 'physics',
            chapterSlug: 'reflection-of-light',
          });
        }}
      />

      {/* 🔍 Class 10 Physics Chapter 02 - 300 VVI 3-Hour Amog Marathon Testing Modal */}
      <PhysicsCh02MarathonModal
        isOpen={showPhysicsCh02MarathonModal}
        onClose={() => setShowPhysicsCh02MarathonModal(false)}
        onNavigateToNotes={() => {
          setShowPhysicsCh02MarathonModal(false);
          navigateTo('study-material', {
            classLevel: 'class-10',
            subjectSlug: 'physics',
            chapterSlug: 'refraction-of-light',
          });
        }}
      />

      {/* ⚡ Class 12 Physics Chapter 01 - 300 VVI 3-Hour Electro-Brahmastra Marathon Testing Modal */}
      <Physics12Ch01MarathonModal
        isOpen={showPhysics12Ch01MarathonModal}
        onClose={() => setShowPhysics12Ch01MarathonModal(false)}
        onNavigateToNotes={() => {
          setShowPhysics12Ch01MarathonModal(false);
          navigateTo('study-material', {
            classLevel: 'class-12',
            subjectSlug: 'physics',
            chapterSlug: 'electric-charges-and-fields',
          });
        }}
      />

      {/* 🔒 Intercept Modal: Auth Required for Feature Usage with Auto-Resume */}
      <AuthRequiredModal
        isOpen={authRequiredModalOpen}
        onClose={() => setAuthRequiredModalOpen(false)}
        targetFeatureName={authRequiredFeatureName}
        onAuthSuccess={handleAuthModalSuccess}
      />

      {/* Main Footer */}
      <div className="pb-16 lg:pb-0">
        <Footer onNavigate={navigateTo} />
      </div>

      {/* 📱 Mobile Fixed Bottom Navigation Bar (All Bottom Buttons Active) */}
      <MobileBottomNav currentRoute={currentRoute} onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
