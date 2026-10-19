import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, ShieldCheck, ArrowLeft, LogIn, Lock, BookOpen, Layers, Award, Users, Settings, Video, LogOut, Loader2, AlertCircle, X, LayoutDashboard, GraduationCap, Calendar, UserCheck, CreditCard, FileSpreadsheet, Bell, MessageSquare, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { MainNavRoute } from '../types';
import { OwnerDashboard } from '../components/owner/OwnerDashboard';
import { OwnerStudyMaterialManager } from '../components/owner/OwnerStudyMaterialManager';
import { OwnerQuestionBankManager } from '../components/owner/OwnerQuestionBankManager';
import { OwnerTestManager } from '../components/owner/OwnerTestManager';
import { OwnerStudentManager } from '../components/owner/OwnerStudentManager';
import { OwnerTeacherManager } from '../components/owner/OwnerTeacherManager';
import { OwnerTimetableManager } from '../components/owner/OwnerTimetableManager';
import { OwnerAttendanceManager } from '../components/owner/OwnerAttendanceManager';
import { OwnerFeeManager } from '../components/owner/OwnerFeeManager';
import { OwnerExamManager } from '../components/owner/OwnerExamManager';
import { OwnerResultManager } from '../components/owner/OwnerResultManager';
import { OwnerCourseManager } from '../components/owner/OwnerCourseManager';
import { OwnerNoticeManager } from '../components/owner/OwnerNoticeManager';
import { OwnerInquiryManager } from '../components/owner/OwnerInquiryManager';
import { OwnerReportsManager } from '../components/owner/OwnerReportsManager';
import { OwnerNotificationManager } from '../components/owner/OwnerNotificationManager';
import { NotificationBellPopover } from '../components/owner/NotificationBellPopover';
import { OwnerSettingsManager } from '../components/owner/OwnerSettingsManager';
import { OwnerVlogManager } from '../components/owner/OwnerVlogManager';

export type OwnerTabType = 'dashboard' | 'students' | 'teachers' | 'timetable' | 'attendance' | 'fees' | 'exams' | 'results' | 'courses' | 'notices' | 'inquiries' | 'reports' | 'notifications' | 'vlogs' | 'tests' | 'questions-pyq' | 'study-material' | 'settings';

interface OwnerViewProps {
  onNavigate: (route: MainNavRoute) => void;
  initialTab?: OwnerTabType;
}

export function OwnerView({ onNavigate, initialTab }: OwnerViewProps) {
  const { user, isOwner, loading, hasCustomClaim, logout } = useAuth();
  
  // Logout flow states
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      await logout();
      if (typeof window !== 'undefined') {
        window.location.hash = '';
        if (window.location.pathname.toLowerCase().includes('owner')) {
          window.history.pushState({}, '', '/');
        }
      }
      setShowLogoutModal(false);
      onNavigate('login');
    } catch (err: any) {
      console.error('[RK STUDY CENTRE] Owner logout error:', err);
      setLogoutError(err?.message || 'लॉगआउट करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  const getDetectedTab = (): OwnerTabType => {
    if (initialTab) return initialTab;
    const hash = typeof window !== 'undefined' ? window.location.hash.toLowerCase() : '';
    const path = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
    if (hash.includes('setting') || path.includes('/owner/settings') || path.includes('/owner/setting')) return 'settings';
    if (hash.includes('student') || path.includes('/owner/students') || path.includes('/owner/student')) return 'students';
    if (hash.includes('teacher') || path.includes('/owner/teachers') || path.includes('/owner/teacher')) return 'teachers';
    if (hash.includes('timetable') || hash.includes('schedule') || path.includes('/owner/timetable') || path.includes('/owner/schedule')) return 'timetable';
    if (hash.includes('attendance') || hash.includes('present') || path.includes('/owner/attendance')) return 'attendance';
    if (hash.includes('fee') || hash.includes('payment') || path.includes('/owner/fees') || path.includes('/owner/fee')) return 'fees';
    if (hash.includes('result') || path.includes('/owner/results') || path.includes('/owner/result')) return 'results';
    if (hash.includes('exam') || hash.includes('schedule') || path.includes('/owner/exams') || path.includes('/owner/exam')) return 'exams';
    if (hash.includes('course') || path.includes('/owner/courses') || path.includes('/owner/course')) return 'courses';
    if (hash.includes('notice') || hash.includes('circular') || path.includes('/owner/notices') || path.includes('/owner/circulars')) return 'notices';
    if (hash.includes('inquir') || hash.includes('message') || path.includes('/owner/inquiries') || path.includes('/owner/messages')) return 'inquiries';
    if (hash.includes('report') || hash.includes('analytic') || path.includes('/owner/reports') || path.includes('/owner/analytics')) return 'reports';
    if (hash.includes('notif') || hash.includes('alert') || path.includes('/owner/notifications') || path.includes('/owner/alerts')) return 'notifications';
    if (hash.includes('vlog') || hash.includes('blog') || path.includes('/owner/vlogs') || path.includes('/owner/vlog')) return 'vlogs';
    if (hash.includes('test') || path.includes('/owner/tests')) return 'tests';
    if (hash.includes('question') || hash.includes('pyq')) return 'questions-pyq';
    if (hash.includes('study-material') || path.includes('/owner/study-material')) return 'study-material';
    if (hash.includes('dashboard') || path.includes('/owner/dashboard')) return 'dashboard';
    return 'dashboard';
  };

  const [activeOwnerTab, setActiveOwnerTab] = useState<OwnerTabType>(getDetectedTab());
  const activeTabRef = useRef<HTMLButtonElement | null>(null);
  const navContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveOwnerTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeOwnerTab]);

  const handleTabChange = (tab: OwnerTabType) => {
    setActiveOwnerTab(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = `owner/${tab}`;
    }
  };

  // जब प्रमाणीकरण स्थिति लोड हो रही हो
  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-semibold text-base">
          सुरक्षा एवं प्राधिकार सत्यापन प्रक्रिया जारी है...
        </p>
      </div>
    );
  }

  // यदि उपयोगकर्ता लॉग-इन नहीं है या उसके पास Owner का अधिकार नहीं है
  if (!user || !isOwner) {
    return (
      <div className="py-16 sm:py-24 max-w-xl mx-auto px-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-100">
            <ShieldAlert className="w-8 h-8" />
          </div>

          {/* अनिवार्य आधिकारिक अस्वीकृति संदेश */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">
            पहुंच अस्वीकृत
          </h1>

          <div className="py-3 px-4 rounded-xl bg-rose-50 text-rose-800 font-bold text-lg mb-6 border border-rose-200">
            आपको Owner Portal का access नहीं है।
          </div>

          <p className="text-slate-600 text-sm leading-relaxed mb-8">
            यह अनुभाग केवल RK STUDY CENTRE के अधिकृत व्यवस्थापक (Owner) के लिए सुरक्षित है।
            यदि आप विद्यार्थी हैं, तो कृपया मुख्य पोर्टल की अध्ययन सामग्री एवं टेस्ट का उपयोग करें।
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-base font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>गृह पृष्ठ पर जाएं</span>
            </button>

            {!user ? (
              <button
                onClick={() => onNavigate('login')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-base font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200"
              >
                <LogIn className="w-4 h-4" />
                <span>लॉगिन करें</span>
              </button>
            ) : (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-base font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer border border-rose-200 disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                    <span>लॉगआउट हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>दूसरे खाते से लॉगिन (लॉगआउट)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // जब उपयोगकर्ता सफलतापूर्वक अधिकृत Owner के रूप में सत्यापित हो
  return (
    <div className="py-12 max-w-6xl mx-auto px-4 sm:px-6">
      {/* शीर्ष शीर्षक एवं प्राधिकार स्थिति */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-md shrink-0">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Owner Portal
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  अधिकृत संचालक (Verified Owner)
                </span>
              </div>
              <p className="text-sm text-slate-600 font-medium mt-1">
                RK STUDY CENTRE व्यवस्थापक एवं नियंत्रण केंद्र
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
            <NotificationBellPopover onNavigateTab={handleTabChange} />

            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>वेबसाइट</span>
            </button>

            <button
              id="owner-logout-btn"
              onClick={() => setShowLogoutModal(true)}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
              title="सुरक्षित लॉगआउट करें"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                  <span>लॉगआउट हो रहा है...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>लॉगआउट (Logout)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Logout Error Message if any */}
        {logoutError && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between gap-3 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{logoutError}</span>
            </div>
            <button
              onClick={() => setLogoutError(null)}
              className="p-1 rounded-lg hover:bg-rose-100 text-rose-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* प्राधिकार विवरण कार्ड */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              सत्यापित खाता (Authenticated Account)
            </div>
            <div className="text-base font-bold text-slate-900 font-mono break-all">
              {user.email}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              UID: <span className="font-mono">{user.uid}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              सुरक्षा एवं भूमिका स्थिति (Role Status)
            </div>
            <div className="text-base font-bold text-amber-700">
              भूमिका (Role): <span className="font-mono font-black">owner</span>
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Custom Claims:&nbsp;
              <span className={hasCustomClaim ? 'text-emerald-700 font-bold' : 'text-slate-600 font-medium'}>
                {hasCustomClaim ? 'सक्रिय (Configured on Token)' : 'अनुपलब्ध (Direct Secure Email Verification Active)'}
              </span>
            </div>
          </div>
        </div>

        {/* चरण 6A/6C/6D/6E/6F स्थिति पुष्टि */}
        <div className="mt-6 p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950">
          <h2 className="text-base font-bold mb-1 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-700" />
            <span>चरण 6F — My Students + Courses Management सक्रिय</span>
          </h2>
          <p className="text-sm leading-relaxed text-indigo-900">
            संचालक नियंत्रण केंद्र में अब आप <strong>पंजीकृत विद्यार्थियों (My Students)</strong> की सुरक्षित समीक्षा तथा{' '}
            <strong>कक्षा 9वीं से 12वीं तक कोर्सेज एवं लक्ष्य बैचों (Courses)</strong> का निर्माण, संपादन, शुल्क प्रबंधन व प्रवेश नियंत्रण कर सकते हैं।
          </p>
        </div>
      </div>

      {/* व्यवस्थापक मॉड्यूल नेविगेशन टैब्स (Mobile Swipeable Single-Row + Desktop Responsive) */}
      <div className="mb-8">
        <div className="sm:hidden flex items-center justify-between text-[11px] text-slate-500 font-bold px-1 mb-2">
          <span>मॉड्यूल चुनें:</span>
          <span className="flex items-center gap-1 text-slate-400">
            <span>दाएं-बाएं स्वाइप करें</span>
            <span>→</span>
          </span>
        </div>

        <div
          ref={navContainerRef}
          role="tablist"
          aria-label="व्यवस्थापक मॉड्यूल नेविगेशन"
          className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto scroll-smooth flex-nowrap md:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <button
            ref={activeOwnerTab === 'dashboard' ? activeTabRef : null}
            role="tab"
            aria-selected={activeOwnerTab === 'dashboard'}
            tabIndex={activeOwnerTab === 'dashboard' ? 0 : -1}
            onClick={() => handleTabChange('dashboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[44px] ${
              activeOwnerTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-md ring-1 ring-slate-800'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>डैशबोर्ड (Dashboard)</span>
          </button>

          <button
            ref={activeOwnerTab === 'students' ? activeTabRef : null}
            role="tab"
            aria-selected={activeOwnerTab === 'students'}
            tabIndex={activeOwnerTab === 'students' ? 0 : -1}
            onClick={() => handleTabChange('students')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[44px] ${
              activeOwnerTab === 'students'
                ? 'bg-blue-700 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>मेरे छात्र (My Students)</span>
          </button>

          <button
            ref={activeOwnerTab === 'teachers' ? activeTabRef : null}
            role="tab"
            aria-selected={activeOwnerTab === 'teachers'}
            tabIndex={activeOwnerTab === 'teachers' ? 0 : -1}
            onClick={() => handleTabChange('teachers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[44px] ${
              activeOwnerTab === 'teachers'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-amber-500'
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>शिक्षक (Teachers)</span>
          </button>

          <button
            ref={activeOwnerTab === 'timetable' ? activeTabRef : null}
            role="tab"
            aria-selected={activeOwnerTab === 'timetable'}
            tabIndex={activeOwnerTab === 'timetable' ? 0 : -1}
            onClick={() => handleTabChange('timetable')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[44px] ${
              activeOwnerTab === 'timetable'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-emerald-500'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span>समय-सारणी (Timetable)</span>
          </button>

          <button
            ref={activeOwnerTab === 'attendance' ? activeTabRef : null}
            role="tab"
            aria-selected={activeOwnerTab === 'attendance'}
            tabIndex={activeOwnerTab === 'attendance' ? 0 : -1}
            onClick={() => handleTabChange('attendance')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[44px] ${
              activeOwnerTab === 'attendance'
                ? 'bg-teal-700 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-teal-500'
            }`}
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>उपस्थिति (Attendance)</span>
          </button>

          <button
            ref={activeOwnerTab === 'fees' ? activeTabRef : null}
            role="tab"
            aria-selected={activeOwnerTab === 'fees'}
            tabIndex={activeOwnerTab === 'fees' ? 0 : -1}
            onClick={() => handleTabChange('fees')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[44px] ${
              activeOwnerTab === 'fees'
                ? 'bg-indigo-700 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500'
            }`}
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>फीस एवं शुल्क (Fees)</span>
          </button>

          <button
            ref={activeOwnerTab === 'exams' ? activeTabRef : null}
            role="tab"
            aria-selected={activeOwnerTab === 'exams'}
            tabIndex={activeOwnerTab === 'exams' ? 0 : -1}
            onClick={() => handleTabChange('exams')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[44px] ${
              activeOwnerTab === 'exams'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>परीक्षाएं व डेट शीट (Exams)</span>
          </button>

          <button
            ref={activeOwnerTab === 'results' ? activeTabRef : null}
            role="tab"
            aria-selected={activeOwnerTab === 'results'}
            tabIndex={activeOwnerTab === 'results' ? 0 : -1}
            onClick={() => handleTabChange('results')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[44px] ${
              activeOwnerTab === 'results'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-emerald-500'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>परीक्षा परिणाम (Results)</span>
          </button>

          <button
            ref={activeOwnerTab === 'courses' ? activeTabRef : null}
            role="tab"
            aria-selected={activeOwnerTab === 'courses'}
            tabIndex={activeOwnerTab === 'courses' ? 0 : -1}
            onClick={() => handleTabChange('courses')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[44px] ${
              activeOwnerTab === 'courses'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>कोर्सेज एवं बैच (Courses)</span>
          </button>

          <button
            ref={activeOwnerTab === 'notices' ? activeTabRef : null}
            role="tab"
            aria-selected={activeOwnerTab === 'notices'}
            tabIndex={activeOwnerTab === 'notices' ? 0 : -1}
            onClick={() => handleTabChange('notices')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[44px] ${
              activeOwnerTab === 'notices'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-rose-500'
            }`}
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span>सूचना व परिपत्र (Notices & Circulars)</span>
          </button>

          <button
            ref={activeOwnerTab === 'inquiries' ? activeTabRef : null}
            role="tab"
            aria-selected={activeOwnerTab === 'inquiries'}
            tabIndex={activeOwnerTab === 'inquiries' ? 0 : -1}
            onClick={() => handleTabChange('inquiries')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[44px] ${
              activeOwnerTab === 'inquiries'
                ? 'bg-blue-700 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>पूछताछ व संदेश (Inquiries)</span>
          </button>

          <button
            ref={activeOwnerTab === 'reports' ? activeTabRef : null}
            role="tab"
            aria-selected={activeOwnerTab === 'reports'}
            tabIndex={activeOwnerTab === 'reports' ? 0 : -1}
            onClick={() => handleTabChange('reports')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[44px] ${
              activeOwnerTab === 'reports'
                ? 'bg-blue-700 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span>रिपोर्ट्स व एनालिटिक्स (Reports)</span>
          </button>

          <button
            ref={activeOwnerTab === 'notifications' ? activeTabRef : null}
            role="tab"
            aria-selected={activeOwnerTab === 'notifications'}
            tabIndex={activeOwnerTab === 'notifications' ? 0 : -1}
            onClick={() => handleTabChange('notifications')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[44px] ${
              activeOwnerTab === 'notifications'
                ? 'bg-blue-700 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500'
            }`}
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span>सूचनाएं व अलर्ट (Alerts)</span>
          </button>

          <button
            ref={activeOwnerTab === 'vlogs' ? activeTabRef : null}
            role="tab"
            aria-selected={activeOwnerTab === 'vlogs'}
            tabIndex={activeOwnerTab === 'vlogs' ? 0 : -1}
            onClick={() => handleTabChange('vlogs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[44px] ${
              activeOwnerTab === 'vlogs'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-rose-500'
            }`}
          >
            <Video className="w-4 h-4 shrink-0" />
            <span>व्लॉग व वीडियो ब्लॉग (Vlogs & Blogs)</span>
          </button>

          <button
            ref={activeOwnerTab === 'tests' ? activeTabRef : null}
            role="tab"
            aria-selected={activeOwnerTab === 'tests'}
            tabIndex={activeOwnerTab === 'tests' ? 0 : -1}
            onClick={() => handleTabChange('tests')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[44px] ${
              activeOwnerTab === 'tests'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-amber-500'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>प्रैक्टिस क्विज़ व टेस्ट (Step 6E)</span>
          </button>

          <button
            ref={activeOwnerTab === 'questions-pyq' ? activeTabRef : null}
            role="tab"
            aria-selected={activeOwnerTab === 'questions-pyq'}
            tabIndex={activeOwnerTab === 'questions-pyq' ? 0 : -1}
            onClick={() => handleTabChange('questions-pyq')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[44px] ${
              activeOwnerTab === 'questions-pyq'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-purple-500'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>प्रश्न बैंक, PYQ व मॉडल पेपर (Step 6D)</span>
          </button>

          <button
            ref={activeOwnerTab === 'study-material' ? activeTabRef : null}
            role="tab"
            aria-selected={activeOwnerTab === 'study-material'}
            tabIndex={activeOwnerTab === 'study-material' ? 0 : -1}
            onClick={() => handleTabChange('study-material')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[44px] ${
              activeOwnerTab === 'study-material'
                ? 'bg-teal-700 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-teal-500'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>अध्ययन सामग्री व नोट्स (Step 6C)</span>
          </button>

          <button
            ref={activeOwnerTab === 'settings' ? activeTabRef : null}
            role="tab"
            aria-selected={activeOwnerTab === 'settings'}
            tabIndex={activeOwnerTab === 'settings' ? 0 : -1}
            onClick={() => handleTabChange('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[44px] ${
              activeOwnerTab === 'settings'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-500'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>व्यवस्थापक सेटिंग्स (Step 6G)</span>
          </button>
        </div>
      </div>

      {/* सक्रिय प्रबंधन घटक (Active Manager Component) */}
      {activeOwnerTab === 'dashboard' ? (
        <OwnerDashboard onNavigateTab={handleTabChange} />
      ) : activeOwnerTab === 'students' ? (
        <OwnerStudentManager />
      ) : activeOwnerTab === 'teachers' ? (
        <OwnerTeacherManager />
      ) : activeOwnerTab === 'timetable' ? (
        <OwnerTimetableManager />
      ) : activeOwnerTab === 'attendance' ? (
        <OwnerAttendanceManager />
      ) : activeOwnerTab === 'fees' ? (
        <OwnerFeeManager />
      ) : activeOwnerTab === 'exams' ? (
        <OwnerExamManager />
      ) : activeOwnerTab === 'results' ? (
        <OwnerResultManager />
      ) : activeOwnerTab === 'courses' ? (
        <OwnerCourseManager />
      ) : activeOwnerTab === 'notices' ? (
        <OwnerNoticeManager />
      ) : activeOwnerTab === 'inquiries' ? (
        <OwnerInquiryManager />
      ) : activeOwnerTab === 'reports' ? (
        <OwnerReportsManager onNavigateTab={handleTabChange} />
      ) : activeOwnerTab === 'notifications' ? (
        <OwnerNotificationManager onNavigateTab={handleTabChange} />
      ) : activeOwnerTab === 'vlogs' ? (
        <OwnerVlogManager />
      ) : activeOwnerTab === 'tests' ? (
        <OwnerTestManager />
      ) : activeOwnerTab === 'questions-pyq' ? (
        <OwnerQuestionBankManager />
      ) : activeOwnerTab === 'study-material' ? (
        <OwnerStudyMaterialManager />
      ) : (
        <OwnerSettingsManager />
      )}

      {/* इन-ऐप सुरक्षित लॉगआउट पुष्टि मोडल (In-App Logout Confirmation Modal) */}
      {showLogoutModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-modal-title"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border-2 border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <LogOut className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 id="logout-modal-title" className="text-lg font-black text-slate-900">
                  लॉगआउट की पुष्टि करें (Confirm Logout)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  क्या आप सचमुच RK STUDY CENTRE के Owner Portal से लॉगआउट करना चाहते हैं? आपका व्यवस्थापक सत्र सुरक्षित रूप से समाप्त हो जाएगा।
                </p>
              </div>
            </div>

            {logoutError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{logoutError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!isLoggingOut) {
                    setShowLogoutModal(false);
                    setLogoutError(null);
                  }
                }}
                disabled={isLoggingOut}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                id="confirm-logout-action-btn"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-black transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>लॉगआउट हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>हाँ, लॉगआउट करें</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
