import React, { useState, useEffect } from 'react';
import { ConfirmModal } from './common/ConfirmModal';
import { 
  WifiOff, 
  BookOpen, 
  Trash2, 
  X, 
  Sparkles, 
  CheckCircle2, 
  HardDrive, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  getOfflineMaterialsList, 
  getCacheStorageStats, 
  clearAllStudyMaterialsCache,
  OfflineIndexItem
} from '../services/offlineStorage';

interface OfflineStudyHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInteractiveNote?: (noteId: string) => void;
}

export const OfflineStudyHubModal: React.FC<OfflineStudyHubModalProps> = ({
  isOpen,
  onClose,
  onOpenInteractiveNote,
}) => {
  const [items, setItems] = useState<OfflineIndexItem[]>([]);
  const [stats, setStats] = useState({ totalItems: 0, totalSizeKB: 0, lastUpdated: null as string | null });

  const loadData = () => {
    setItems(getOfflineMaterialsList());
    setStats(getCacheStorageStats());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearCache = () => {
    setShowClearConfirm(true);
  };

  const handleConfirmClear = () => {
    clearAllStudyMaterialsCache();
    loadData();
    setShowClearConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase flex items-center gap-1">
                <WifiOff className="w-3.5 h-3.5" />
                ऑफलाइन स्टडी हब (Offline Hub)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-700 text-blue-100">
                {stats.totalItems} सामग्री सहेजी गई
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">ऑफ़लाइन अध्ययन सामग्री व नोट्स</h2>
            <p className="text-xs sm:text-sm text-blue-100">
              इंटरनेट न होने पर भी आप इन सभी नोट्स और अध्ययन सामग्री को पढ़ सकते हैं।
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Storage Stats Banner */}
        <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
            <HardDrive className="w-4 h-4 text-amber-600" />
            <span>कैश स्टोरेज उपयोग: {stats.totalSizeKB} KB</span>
          </div>
          {stats.totalItems > 0 && (
            <button
              onClick={handleClearCache}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>कैश साफ़ करें</span>
            </button>
          )}
        </div>

        {/* Content List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {items.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                  अभी कोई ऑफ़लाइन नोट्स सुरक्षित नहीं हैं
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  जब आप किसी भी अध्याय के नोट्स खोलेंगे, वह स्वचालित रूप से आपके डिवाइस में ऑफ़लाइन पढ़ने के लिए सहेज लिए जाएंगे।
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {(items || []).map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-extrabold text-[11px] uppercase">
                        {item.type || 'नोट्स'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                        {item.classLevel}
                      </span>
                      {item.subjectName && (
                        <span className="text-[11px] text-slate-500 font-semibold">
                          • {item.subjectName}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>
                        कैश्ड: {new Date(item.savedAt).toLocaleDateString('hi-IN', { month: 'short', day: 'numeric' })}
                      </span>
                      {item.fileSize && <span>• {item.fileSize}</span>}
                    </div>
                  </div>

                  {item.isInteractiveNote && onOpenInteractiveNote && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenInteractiveNote(item.id.replace('note_', ''));
                      }}
                      className="w-full sm:w-auto shrink-0 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>पढ़ें (Read)</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Educational Note on Offline Capability */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-black text-slate-800 dark:text-slate-200">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>स्मार्ट ऑफ़लाइन कैशिंग प्रणाली (Smart Caching System)</span>
            </div>
            <p className="leading-relaxed">
              RK STUDY CENTRE में सेवा कार्यकर्ता (Service Worker) और लोकल स्टोरेज तकनीक द्वारा एक बार खोले गए नोट्स अपने आप सुरक्षित हो जाते हैं, ताकि ग्रामीण या कमजोर नेटवर्क वाले क्षेत्रों में भी छात्र बिना किसी रुकावट के रिवीजन कर सकें।
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-black text-white font-extrabold text-xs sm:text-sm transition-all cursor-pointer"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>

      {/* Confirm Clear Cache Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleConfirmClear}
        title="ऑफ़लाइन कैश साफ़ करें (Clear Offline Cache)"
        message="क्या आप सभी ऑफ़लाइन सहेजे गए नोट्स व अध्ययन सामग्री को हटाना चाहते हैं? इन्हें दोबारा ऑनलाइन होने पर लोड किया जा सकेगा।"
        confirmText="हाँ, साफ़ करें (Clear All)"
        cancelText="रद्द करें"
        variant="warning"
      />
    </div>
  );
};
