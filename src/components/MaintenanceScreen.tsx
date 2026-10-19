import { Wrench, ShieldCheck, Mail, Phone, Lock, Sparkles, AlertTriangle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import type { MainNavRoute } from '../types';

interface MaintenanceScreenProps {
  onNavigate: (route: MainNavRoute) => void;
}

export function MaintenanceScreen({ onNavigate }: MaintenanceScreenProps) {
  const { settings } = useSettings();
  const websiteName = settings.websiteName || 'RK STUDY CENTRE';
  const supportEmail = settings.supportEmail || 'rkstudycentre064@gmail.com';
  const supportPhone = settings.supportPhone || '+91 91234 56789';
  const message =
    settings.maintenanceMessage ||
    'वेबसाइट पर वर्तमान में आवश्यक तकनीकी सुधार (Maintenance) कार्य चल रहा है। शीघ्र ही सभी सेवाएं सामान्य रूप से उपलब्ध होंगी।';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* शीर्ष पट्टी */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
            <Wrench className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {websiteName}
          </span>
        </div>

        <button
          onClick={() => onNavigate('login')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>व्यवस्थापक लॉगिन (Owner Login)</span>
        </button>
      </div>

      {/* मुख्य रखरखाव कार्ड */}
      <div className="max-w-2xl w-full mx-auto my-auto py-10 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs sm:text-sm font-black uppercase tracking-wider animate-pulse">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>अस्थायी तकनीकी रखरखाव • Under Maintenance</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            हम वेबसाइट को और बेहतर बना रहे हैं
          </h1>
          <p className="text-slate-300 text-base sm:text-xl font-medium leading-relaxed max-w-xl mx-auto">
            {message}
          </p>
        </div>

        {/* सूचना व सहायता बॉक्स */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-4 max-w-lg mx-auto text-left shadow-lg">
          <div className="flex items-center gap-3 text-white font-extrabold text-sm sm:text-base border-b border-slate-700 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>सहायता एवं पूछताछ (Support & Inquiries)</span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                ईमेल:{' '}
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-white hover:text-blue-300 underline underline-offset-2 font-mono"
                >
                  {supportEmail}
                </a>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                हेल्पलाइन:{' '}
                <a
                  href={`tel:${supportPhone}`}
                  className="text-white hover:text-emerald-300 font-mono"
                >
                  {supportPhone}
                </a>
              </span>
            </div>
          </div>
        </div>

        {/* व्यवस्थापक पहुंच विकल्प */}
        <div className="pt-4 text-xs sm:text-sm text-slate-400">
          यदि आप व्यवस्थापक (Owner) हैं, तो ऊपर दिए गए{' '}
          <strong className="text-slate-200 font-bold">व्यवस्थापक लॉगिन</strong> बटन का उपयोग करके Owner Portal एक्सेस कर सकते हैं।
        </div>
      </div>

      {/* निचली पट्टी */}
      <div className="max-w-4xl w-full mx-auto text-center py-4 border-t border-slate-800 text-xs text-slate-500 font-medium">
        © {new Date().getFullYear()} {websiteName} • सर्वाधिकार सुरक्षित
      </div>
    </div>
  );
}

/**
 * Top Owner-Only Banner when Maintenance Mode is ON
 */
export function OwnerMaintenanceWarningBanner({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { settings } = useSettings();

  if (!settings.isMaintenanceActive) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2.5 font-bold text-xs sm:text-sm shadow-md border-b border-amber-600">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-slate-950" />
          <span>
            <strong>⚠️ रखरखाव मोड (Maintenance Mode) सक्रिय है:</strong> सामान्य विद्यार्थी वर्तमान में वेबसाइट नहीं देख सकते। केवल अधिकृत व्यवस्थापक (Owner) पहुंच सक्रिय है।
          </span>
        </div>
        <button
          onClick={onOpenSettings}
          className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-white rounded-lg text-xs font-black transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          सेटिंग्स में बंद करें →
        </button>
      </div>
    </div>
  );
}
