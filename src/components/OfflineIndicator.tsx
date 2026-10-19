import React, { useState } from 'react';
import { WifiOff, CheckCircle2, X } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { getCacheStorageStats } from '../services/offlineStorage';

interface OfflineIndicatorProps {
  onOpenOfflineHub?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  onOpenOfflineHub,
}) => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);
  const stats = getCacheStorageStats();

  if (isOnline) {
    return null;
  }

  if (dismissed) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setDismissed(false)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-full shadow-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          title="ऑफ़लाइन मोड सक्रिय"
        >
          <WifiOff className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
          <span>ऑफलाइन</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 p-3.5 rounded-2xl shadow-2xl border-2 border-amber-300 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 bg-slate-950 text-amber-400 rounded-xl shrink-0 mt-0.5">
            <WifiOff className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-slate-950">ऑफलाइन मोड सक्रिय</span>
              <span className="px-2 py-0.5 bg-slate-950 text-amber-300 rounded-full font-bold text-[10px]">
                स्थानीय कैश
              </span>
            </div>
            <p className="text-slate-900 font-semibold leading-relaxed">
              इंटरनेट कनेक्शन उपलब्ध नहीं है। पहले से खोले गए नोट्स और सामग्री बिना रुकावट उपलब्ध हैं।
            </p>

            {stats.totalItems > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 font-bold text-slate-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
                  {stats.totalItems} नोट्स/सामग्री सहेजे गए ({stats.totalSizeKB} KB)
                </span>
                {onOpenOfflineHub && (
                  <button
                    onClick={onOpenOfflineHub}
                    className="underline text-slate-950 font-extrabold hover:text-black cursor-pointer"
                  >
                    सहेजे नोट्स देखें
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-slate-900 hover:text-black hover:bg-amber-300 rounded-lg cursor-pointer transition-colors shrink-0"
          aria-label="सूचना बंद करें"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
