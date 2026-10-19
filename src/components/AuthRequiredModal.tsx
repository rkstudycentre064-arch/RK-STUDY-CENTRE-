import { useState, useEffect, FormEvent } from 'react';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogIn,
  UserPlus,
  X,
  GraduationCap,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import type { ClassLevel, MainNavRoute } from '../types';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  sendPasswordReset,
} from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetFeatureName?: string;
  onAuthSuccess?: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthRequiredModal({
  isOpen,
  onClose,
  targetFeatureName,
  onAuthSuccess,
  initialMode = 'login',
}: AuthRequiredModalProps) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const websiteName = settings.websiteName || 'RK STUDY CENTRE';

  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassLevel>('class-10');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

  // If user becomes authenticated while modal is open, trigger success
  useEffect(() => {
    if (isOpen && user) {
      if (onAuthSuccess) {
        onAuthSuccess();
      }
      onClose();
    }
  }, [user, isOpen, onAuthSuccess, onClose]);

  if (!isOpen) return null;

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
          return 'सुरक्षा कारणों से पहुंच अस्थायी रूप से रोकी गई है। कृपया कुछ समय बाद प्रयास करें।';
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
          if (onAuthSuccess) onAuthSuccess();
          onClose();
        }, 1000);
      } else if (mode === 'register') {
        await registerWithEmail(email, password, name, selectedClass, phone);
        setSuccessMsg(`स्वागत है, ${name}! आपका विद्यार्थी खाता बन गया है।`);
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess();
          onClose();
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
      setSuccessMsg(`स्वागत है, ${gUser.displayName || 'विद्यार्थी'}! Google Login सफल रहा।`);
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-sm shrink-0">
              <Lock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                सुरक्षित शैक्षणिक मंच
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                Login / Sign Up आवश्यक है
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-medium">
            {targetFeatureName ? (
              <>
                <strong className="text-amber-300 font-bold">"{targetFeatureName}"</strong> का उपयोग करने के लिए Login या नया खाता बनाना अनिवार्य है।
              </>
            ) : (
              'डिजिटल नोट्स, ऑनलाइन टेस्ट, कोर्सेज और अध्ययन सामग्री का उपयोग करने के लिए कृपया Login या Sign Up करें।'
            )}
          </p>
        </div>

        {/* Tab Switcher */}
        {mode !== 'forgot-password' && (
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-sm font-black">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>विद्यार्थी Login</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>नया Sign Up</span>
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-5 sm:p-7 space-y-4">
          {/* Status Banners */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-xs sm:text-sm font-bold flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-start gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick 1-Click Google Sign In Button */}
          {mode !== 'forgot-password' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSubmit}
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-2xl border-2 border-slate-300 hover:border-blue-600 hover:bg-blue-50/50 bg-white text-slate-800 font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span>Google खाते से तुरंत Login / Sign Up करें</span>
              </button>

              <div className="flex items-center gap-3 text-xs font-bold text-slate-600 uppercase">
                <div className="grow border-t border-slate-200" />
                <span>या Email द्वारा जारी रखें</span>
                <div className="grow border-t border-slate-200" />
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">विद्यार्थी का पूरा नाम</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="उदा. राहुल कुमार"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:ring-0 text-sm font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">कक्षा (Class)</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value as ClassLevel)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:ring-0 text-xs font-bold text-slate-900 bg-white"
                      >
                        <option value="class-9">कक्षा 9वीं</option>
                        <option value="class-10">कक्षा 10वीं (मैट्रिक)</option>
                        <option value="class-11">कक्षा 11वीं</option>
                        <option value="class-12">कक्षा 12वीं (इंटर)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">मोबाइल नंबर</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10 अंकों का नंबर"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:ring-0 text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">Email पता</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:ring-0 text-sm font-bold text-slate-900"
                />
              </div>
            </div>

            {mode !== 'forgot-password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-slate-700">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot-password'); setErrorMsg(null); setSuccessMsg(null); }}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                    >
                      Password भूल गए?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="कम से कम 6 अक्षर"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:ring-0 text-sm font-bold text-slate-900"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>प्रमाणीकरण जारी है...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Login करें और फीचर खोलें</span>
                </>
              ) : mode === 'register' ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>खाता बनाएं और फीचर खोलें</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5" />
                  <span>Password रीसेट लिंक भेजें</span>
                </>
              )}
            </button>

            {mode === 'forgot-password' && (
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
                className="w-full text-center text-xs font-bold text-blue-700 hover:underline cursor-pointer py-1"
              >
                ← वापस Login स्क्रीन पर जाएं
              </button>
            )}
          </form>

          {/* Auto-redirect note */}
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/60 text-xs font-bold text-blue-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Login होने के बाद आप बिना किसी रुकावट के तुरंत अपनी सामग्री देख सकेंगे।</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            100% सुरक्षित छात्र डेटा
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-800 cursor-pointer font-bold"
          >
            केवल होम पेज देखें
          </button>
        </div>

      </div>
    </div>
  );
}
