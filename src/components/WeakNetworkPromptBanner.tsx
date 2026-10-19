import React, { useState } from 'react';
import { Signal, WifiOff, Sparkles, X, ChevronRight, Play } from 'lucide-react';
import { useNetworkQuality } from '../hooks/useNetworkQuality';

interface WeakNetworkPromptBannerProps {
  onOpenQuiz: () => void;
}

export const WeakNetworkPromptBanner: React.FC<WeakNetworkPromptBannerProps> = ({
  onOpenQuiz,
}) => {
  const { isOnline, isWeak, effectiveType, simulatedWeakMode, toggleSimulatedWeakMode } = useNetworkQuality();
  const [dismissed, setDismissed] = useState<boolean>(false);

  // Show if offline or weak network, and not dismissed
  const shouldShow = (!isOnline || isWeak) && !dismissed;

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed top-20 sm:top-24 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in slide-in-from-top-4 duration-300">
      {/* Tricolor Independence Day Festive Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-500 to-emerald-600 text-slate-950 p-3.5 sm:p-4 rounded-3xl shadow-2xl border-2 border-orange-300">
        {/* Tricolor top mini bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-orange-700" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Spinning Ashoka Chakra Badge */}
            <div className="w-10 h-10 rounded-2xl bg-white text-blue-900 flex items-center justify-center shadow-md border-2 border-blue-900 shrink-0 mt-0.5">
              <svg
                className="w-7 h-7 animate-[spin_10s_linear_infinite] text-blue-900"
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <circle cx="50" cy="50" r="45" strokeWidth="4" />
                <circle cx="50" cy="50" r="8" fill="currentColor" />
                {Array.from({ length: 24 }).map((_, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1="50"
                    x2={50 + 44 * Math.cos(((i * 15) * Math.PI) / 180)}
                    y2={50 + 44 * Math.sin(((i * 15) * Math.PI) / 180)}
                    strokeWidth="2"
                  />
                ))}
              </svg>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-sm text-slate-950 flex items-center gap-1">
                  <span>🇮🇳</span> नेटवर्क धीमा / कमजोर है?
                </span>
                <span className="px-2 py-0.5 bg-slate-950 text-amber-300 rounded-full font-bold text-[10px] tracking-wide">
                  {!isOnline ? '📴 ऑफ़लाइन' : '📶 कमजोर सिग्नल'}
                </span>
              </div>

              <p className="text-xs text-slate-900 font-bold leading-relaxed">
                चिंता न करें! स्वतंत्रता दिवस स्पेशल <strong>तिरंगा MCQ क्विज़</strong> खेलें — 100% बिना इंटरनेट चलता है।
              </p>

              {/* Action Button */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  onClick={onOpenQuiz}
                  className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl font-black text-xs shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>🎯 तिरंगा क्विज़ शुरू करें</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-slate-900 hover:text-black hover:bg-black/10 transition-colors cursor-pointer shrink-0"
            aria-label="सूचना बंद करें"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
