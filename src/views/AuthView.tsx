import { useState, useEffect, FormEvent } from 'react';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogIn,
  UserPlus,
  KeyRound,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import type { ClassLevel, MainNavRoute, MoreSectionTab } from '../types';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  sendPasswordReset,
  getFirebaseStatus
} from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { BackButton } from '../components/BackButton';

interface AuthViewProps {
  initialMode?: 'login' | 'register';
  redirectTarget?: { route: MainNavRoute; params?: any } | null;
  reasonMessage?: string;
  onNavigate: (route: MainNavRoute, params?: { classLevel?: ClassLevel; subjectSlug?: string; bookSlug?: string; chapterSlug?: string; moreTab?: MoreSectionTab }) => void;
}

export function AuthView({ initialMode = 'login', redirectTarget, reasonMessage, onNavigate }: AuthViewProps) {
  const { user, profile, isOwner, logout } = useAuth();
  const { settings } = useSettings();
  const websiteName = settings.websiteName || 'RK STUDY CENTRE';
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(initialMode);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassLevel>('class-10');

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [initialMode]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const firebaseStatus = getFirebaseStatus();

  // Helper to resume intended destination
  const executeResume = () => {
    let target = redirectTarget;
    if (!target && typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('rk_auth_redirect');
        if (stored) {
          target = JSON.parse(stored);
        }
      } catch {}
    }
    if (target && target.route && target.route !== 'login' && target.route !== 'register') {
      try {
        sessionStorage.removeItem('rk_auth_redirect');
      } catch {}
      onNavigate(target.route as any, target.params);
    } else {
      onNavigate('home');
    }
  };

  // त्रुटि संदेशों को स्पष्ट एवं स्वाभाविक हिंदी में बदलना
  const formatAuthError = (err: unknown): string => {
    if (typeof err === 'object' && err !== null && 'code' in err) {
      const code = (err as { code: string }).code;
      switch (code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          return 'गलत Email या Password दर्ज किया गया है। कृपया पुनः जांचें।';
        case 'auth/email-already-in-use':
          return 'इस Email पते से पहले से एक खाता पंजीकृत है। कृपया Login करें।';
        case 'auth/weak-password':
          return 'Password कम से कम 6 अक्षरों का होना चाहिए।';
        case 'auth/invalid-email':
          return 'कृपया एक मान्य Email पता दर्ज करें।';
        case 'auth/popup-closed-by-user':
          return 'प्रमाणीकरण पूरा होने से पहले Google Sign-In पॉपअप बंद हो गया।';
        case 'auth/too-many-requests':
          return 'बार-बार गलत प्रयासों के कारण सुरक्षा कारणों से पहुंच अस्थायी रूप से रोकी गई है। कृपया कुछ समय बाद प्रयास करें।';
        default:
          return (err as { message?: string }).message || 'प्रमाणीकरण में त्रुटि हुई। कृपया पुनः प्रयास करें।';
      }
    }
    return 'एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें।';
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        setSuccessMsg('सफलतापूर्वक Login हो गया! आपको आपके चुने हुए फीचर पर भेजा जा रहा है...');
        setTimeout(() => {
          executeResume();
        }, 1000);
      } else if (mode === 'register') {
        await registerWithEmail(email, password, name, selectedClass, phone);
        setSuccessMsg(`स्वागत है, ${name}! आपका विद्यार्थी खाता सफलतापूर्वक बन गया है।`);
        setTimeout(() => {
          executeResume();
        }, 1000);
      } else if (mode === 'forgot-password') {
        await sendPasswordReset(email);
        setSuccessMsg(`Password रीसेट लिंक ${email} पर भेज दिया गया है। कृपया अपना इनबॉक्स जांचें।`);
      }
    } catch (err) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSubmit = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const gUser = await loginWithGoogle(selectedClass);
      setSuccessMsg(`स्वागत है, ${gUser.displayName || 'विद्यार्थी'}! Google Sign-In सफल रहा।`);
      setTimeout(() => {
        executeResume();
      }, 1000);
    } catch (err) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // यदि पहले से Login हैं, तो सक्रिय विद्यार्थी प्रोफाइल कार्ड दिखाएं
  if (user) {
    return (
      <div className="py-8 max-w-xl mx-auto space-y-5">
        <BackButton label="मुख्य पृष्ठ पर वापस जाएं" fallbackRoute="home" onNavigate={onNavigate} />
        <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-slate-200 shadow-md space-y-7">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-2xl bg-blue-700 text-white flex items-center justify-center mx-auto shadow-md text-3xl font-black">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'S'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {user.displayName || 'सक्रिय विद्यार्थी'}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-black px-3.5 py-1 rounded-full bg-blue-100 text-blue-900">
                {profile?.classLevel ? profile.classLevel.toUpperCase().replace('-', ' ') : 'BIHAR BOARD'}
              </span>
              {isOwner && (
                <span className="text-xs font-black px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  व्यवस्थापक (Admin)
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-slate-500">
              {user.email}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-200 space-y-3.5 text-sm">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
              <span className="text-slate-600 font-bold">विद्यार्थी UID</span>
              <span className="font-mono text-xs text-slate-800 font-bold truncate max-w-[200px]">{user.uid}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
              <span className="text-slate-600 font-bold">प्रमाणीकरण माध्यम</span>
              <span className="font-extrabold text-slate-900 capitalize">
                {user.providerData[0]?.providerId.replace('.com', '') || 'Firebase Auth'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
              <span className="text-slate-600 font-bold">खाता स्थिति</span>
              <span className="font-black text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[3]" /> सक्रिय एवं सत्यापित
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-600 font-bold">बोर्ड पाठ्यक्रम</span>
              <span className="font-black text-blue-800">बिहार बोर्ड (BSEB)</span>
            </div>
          </div>

          <div className="space-y-3.5 pt-2">
            <button
              onClick={() => onNavigate('classes', { classLevel: profile?.classLevel || 'class-10' })}
              className="w-full py-3.5 rounded-2xl font-black text-base bg-blue-700 hover:bg-blue-800 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>मेरे पाठ्यक्रम पर जाएं</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              onClick={() => onNavigate('tests')}
              className="w-full py-3.5 rounded-2xl font-black text-base bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
            >
              <span>ऑनलाइन टेस्ट दें</span>
            </button>

            <button
              onClick={async () => {
                await logout();
              }}
              className="w-full py-3 rounded-2xl font-extrabold text-sm text-rose-700 hover:bg-rose-50 border-2 border-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4 stroke-[2.5]" />
              <span>खाते से Sign Out करें</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-xl mx-auto space-y-5">
      <BackButton label="मुख्य पृष्ठ पर वापस जाएं" fallbackRoute="home" onNavigate={onNavigate} />
      <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-slate-200 shadow-md space-y-7">
        
        {/* ब्रांड एवं मोड हेडर */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white flex items-center justify-center mx-auto shadow-md">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {mode === 'login' && 'विद्यार्थी Login'}
            {mode === 'register' && 'नया विद्यार्थी खाता बनाएं'}
            {mode === 'forgot-password' && 'Password रीसेट करें'}
          </h2>
          <p className="text-sm text-slate-600 font-bold">
            {websiteName} • बिहार बोर्ड ऑनलाइन लर्निंग पोर्टल
          </p>
        </div>

        {/* मोड टॉगल टैब्स */}
        {mode !== 'forgot-password' && (
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl text-sm font-extrabold text-slate-600 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-3 rounded-xl transition-all cursor-pointer ${
                mode === 'login' ? 'bg-white text-blue-800 shadow-xs font-black' : 'hover:text-slate-900'
              }`}
            >
              Login करें
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-3 rounded-xl transition-all cursor-pointer ${
                mode === 'register' ? 'bg-white text-blue-800 shadow-xs font-black' : 'hover:text-slate-900'
              }`}
            >
              नया खाता बनाएं
            </button>
          </div>
        )}

        {/* Auth Required Notice if user was redirected from a protected feature */}
        {(reasonMessage || redirectTarget) && (
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-1 text-xs sm:text-sm font-bold animate-fade-in">
            <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
              <Lock className="w-4 h-4 text-amber-700 shrink-0 stroke-[2.5]" />
              <span>प्रमाणीकरण अनिवार्य (Login Required)</span>
            </div>
            <p className="text-amber-900/90 font-medium">
              {reasonMessage || 'इस शैक्षणिक सुविधा (डिजिटल नोट्स, ऑनलाइन टेस्ट, पाठ्यक्रम आदि) का उपयोग करने के लिए Login या Sign Up आवश्यक है। Login के तुरंत बाद आपको इसी पेज पर वापस भेजा जाएगा।'}
            </p>
          </div>
        )}

        {/* सूचना व चेतावनी */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-sm font-bold text-rose-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 stroke-[2.5]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-sm font-bold text-emerald-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google Sign-In बटन */}
        {mode !== 'forgot-password' && (
          <div className="space-y-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleGoogleSubmit}
              className="w-full py-3.5 px-5 rounded-2xl border-2 border-slate-300 hover:bg-slate-50 text-slate-800 font-black text-sm sm:text-base flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google Sign-In से जारी रखें</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t-2 border-slate-200"></div>
              <span className="shrink mx-4 text-xs font-black text-slate-400 uppercase tracking-wider">
                अथवा Email द्वारा
              </span>
              <div className="grow border-t-2 border-slate-200"></div>
            </div>
          </div>
        )}

        {/* Email फॉर्म */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-1.5">
                  विद्यार्थी का पूरा नाम
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="उदा. राहुल कुमार"
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl pl-11 pr-4 py-3 text-base font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-1.5">
                  मोबाइल नंबर (वैकल्पिक)
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10 अंकों का मोबाइल नंबर"
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl pl-11 pr-4 py-3 text-base font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-1.5">
                  आपकी कक्षा
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value as ClassLevel)}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold cursor-pointer"
                >
                  <option value="class-9">कक्षा 9वीं (Class 9)</option>
                  <option value="class-10">कक्षा 10वीं (मैट्रिक बोर्ड)</option>
                  <option value="class-11">कक्षा 11वीं (इंटर प्रथम वर्ष)</option>
                  <option value="class-12">कक्षा 12वीं (इंटर बोर्ड)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">
              Email पता
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl pl-11 pr-4 py-3 text-base font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {mode !== 'forgot-password' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-extrabold text-slate-800">
                  Password (पासवर्ड)
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot-password');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                  >
                    Password भूल गए?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="कम से कम 6 अक्षर"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl pl-11 pr-4 py-3 text-base font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl font-black text-base bg-blue-700 hover:bg-blue-800 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>प्रक्रिया जारी है...</span>
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-5 h-5 stroke-[2.5]" />
                <span>खाते में Login करें</span>
              </>
            ) : mode === 'register' ? (
              <>
                <UserPlus className="w-5 h-5 stroke-[2.5]" />
                <span>विद्यार्थी खाता बनाएं</span>
              </>
            ) : (
              <>
                <KeyRound className="w-5 h-5 stroke-[2.5]" />
                <span>Password रीसेट लिंक भेजें</span>
              </>
            )}
          </button>
        </form>

        {mode === 'forgot-password' && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-sm font-extrabold text-blue-700 hover:underline cursor-pointer"
            >
              ← वापस Login पर जाएं
            </button>
          </div>
        )}

        <div className="pt-5 border-t-2 border-slate-100 text-center text-xs sm:text-sm text-slate-500 space-y-1.5">
          <div className="flex items-center justify-center gap-2 font-bold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
            <span>Firebase Authentication सुरक्षित एवं सक्रिय</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            सक्रिय प्रोजेक्ट ID: <code className="font-mono text-slate-600 font-bold">{firebaseStatus.projectId}</code>
          </p>
        </div>

      </div>
    </div>
  );
}
