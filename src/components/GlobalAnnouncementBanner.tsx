import { useState } from 'react';
import { Megaphone, X, Sparkles } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export function GlobalAnnouncementBanner() {
  const { settings } = useSettings();
  const [isDismissed, setIsDismissed] = useState(false);

  const isActive = settings.isAnnouncementActive ?? settings.isNoticeActive ?? false;
  const message = settings.announcementMessage || settings.noticeBanner || '';

  if (!isActive || !message.trim() || isDismissed) {
    return null;
  }

  return (
    <div
      id="global-announcement-banner"
      className="relative bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-md border-b border-blue-900/50 py-3 px-4 sm:px-6 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 text-amber-300 shadow-xs border border-white/20">
            <Megaphone className="w-4 h-4 animate-bounce" />
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-semibold leading-snug">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 font-black text-[11px] uppercase tracking-wider shrink-0 shadow-xs">
              <Sparkles className="w-3 h-3" />
              सूचना / Announcement
            </span>
            <span className="text-white/95">{message}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
          title="सूचना छुपाएं"
          aria-label="Close Announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
