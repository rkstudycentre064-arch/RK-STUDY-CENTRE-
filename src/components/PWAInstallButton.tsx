import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'nav' | 'hero' | 'minimal';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'nav',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already installed in standalone mode, show subtle confirmed status or hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    try {
      setIsInstalling(true);
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  // Chromium / Android / Desktop Install Flow
  if (isInstallable) {
    if (variant === 'minimal') {
      return (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-xs cursor-pointer ${className}`}
          title="RK Study Centre ऐप इंस्टॉल करें"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>ऐप इंस्टॉल करें</span>
        </button>
      );
    }

    return (
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 ${className}`}
      >
        <Smartphone className="w-4 h-4 text-slate-950 stroke-[2.5]" />
        <span>ऐप इंस्टॉल करें (PWA)</span>
      </button>
    );
  }

  // iOS Safari Flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 hover:border-amber-400 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-extrabold text-xs transition-all cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />
          <span>iPhone में इंस्टॉल करें</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border-2 border-slate-200 text-slate-900 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">iPhone / iPad पर इंस्टॉल करें</h3>
                    <p className="text-xs text-slate-500">बिना इंटरनेट पढ़ने के लिए होम स्क्रीन पर जोड़ें</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm font-medium text-slate-700">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 font-black shrink-0">1</div>
                  <p>
                    सफारी (Safari) ब्राउज़र के नीचे स्थित <Share2 className="w-4 h-4 inline-block text-blue-600 mx-1" /> <strong>शेयर (Share)</strong> बटन दबाएं।
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 font-black shrink-0">2</div>
                  <p>
                    नीचे स्क्रॉल करें और <PlusSquare className="w-4 h-4 inline-block text-blue-600 mx-1" /> <strong>"Add to Home Screen" (होम स्क्रीन पर जोड़ें)</strong> चुनें।
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold">
                    अब RK STUDY CENTRE आपके फोन पर एक ऐप की तरह खुलेगा और सभी सहेजे गए नोट्स बिना इंटरनेट के काम करेंगे!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-extrabold text-sm transition-all cursor-pointer"
              >
                समझ गया (Close)
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
