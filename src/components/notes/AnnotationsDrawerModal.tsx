/**
 * RK STUDY CENTRE - Student Highlights & Annotations Drawer Modal
 * 
 * Displays all student highlights, color tags, and personal revision notes
 * saved across study material chapters and notes.
 */

import React, { useState, useEffect } from 'react';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Bookmark,
  Trash2,
  X,
  Sparkles,
  Search,
  FileText,
  Calendar,
  CheckCircle2,
  Edit3,
  Copy,
  Check
} from 'lucide-react';
import {
  getSavedAnnotations,
  deleteAnnotation,
  AnnotationItem,
  ANNOTATION_UPDATED_EVENT
} from '../../services/annotationService';

interface AnnotationsDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNote?: (noteId: string) => void;
}

export const AnnotationsDrawerModal: React.FC<AnnotationsDrawerModalProps> = ({
  isOpen,
  onClose,
  onOpenNote,
}) => {
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadAnnotations = () => {
    setAnnotations(getSavedAnnotations());
  };

  useEffect(() => {
    if (isOpen) {
      loadAnnotations();
    }
    const handleUpdate = () => loadAnnotations();
    window.addEventListener(ANNOTATION_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(ANNOTATION_UPDATED_EVENT, handleUpdate);
  }, [isOpen]);

  const [annotationToDelete, setAnnotationToDelete] = useState<string | null>(null);
  const [isDeletingAnnotation, setIsDeletingAnnotation] = useState(false);

  const handleDelete = (id: string) => {
    setAnnotationToDelete(id);
  };

  const handleConfirmDeleteAnnotation = async () => {
    if (!annotationToDelete) return;
    setIsDeletingAnnotation(true);
    try {
      await deleteAnnotation(annotationToDelete);
      loadAnnotations();
      setAnnotationToDelete(null);
    } catch (err) {
      console.error('Error deleting annotation:', err);
    } finally {
      setIsDeletingAnnotation(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAnnotations = annotations.filter(
    (item) =>
      item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.chapterTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.personalNote?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200 accent-emerald-500';
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 text-blue-900 dark:text-blue-200 accent-blue-500';
      case 'rose':
        return 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-900 dark:text-rose-200 accent-rose-500';
      case 'amber':
        return 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-200 accent-amber-500';
      case 'yellow':
      default:
        return 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-300 text-yellow-900 dark:text-yellow-200 accent-yellow-500';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-600 via-orange-600 to-slate-900 text-white flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-300 text-slate-950 uppercase flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 fill-current" />
                मेरी हाइलाइट्स व नोट्स एनोटेशन (Highlights)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
                {annotations.length} सहेजे गए
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">अध्ययन हाइलाइट्स संग्रह</h2>
            <p className="text-xs sm:text-sm text-amber-100">
              नोट्स पढ़ते समय आपके द्वारा हाइलाइट किए गए महत्वपूर्ण बिंदु और व्यक्तिगत रिवीज़न नोट्स।
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

        {/* Search Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="हाइलाइट किए गए पाठ या अध्याय में खोजें..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Content List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredAnnotations.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <Bookmark className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                  कोई हाइलाइट नहीं मिला
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  जब आप नोट्स पढ़ते समय किसी भी महत्वपूर्ण वाक्य या अनुच्छेद को हाइलाइट करेंगे, वह यहाँ सुरक्षित हो जाएगा।
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {(filteredAnnotations || []).map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border-2 transition-all shadow-xs space-y-3 ${getColorClasses(item.color)}`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-white/60 dark:bg-slate-900/40 font-extrabold text-[11px] uppercase">
                        {item.subjectName || 'विज्ञान'}
                      </span>
                      <span className="text-xs font-black opacity-80">
                        • {item.chapterTitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] opacity-75">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.createdAt).toLocaleDateString('hi-IN', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Highlighted Quote Text */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-current/20 font-bold text-sm sm:text-base leading-relaxed text-slate-900 dark:text-slate-100">
                    "{item.text}"
                  </div>

                  {item.personalNote && (
                    <div className="text-xs font-semibold opacity-90 flex items-center gap-1.5 bg-white/40 dark:bg-slate-900/30 p-2.5 rounded-lg">
                      <Edit3 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span><strong>रिवीज़न नोट्स:</strong> {item.personalNote}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopyText(item.text, item.id)}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 text-xs font-extrabold flex items-center gap-1 shadow-xs cursor-pointer border border-current/20"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>कॉपी हो गया!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>कॉपी पाठ</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-950/50 hover:bg-red-200 text-red-700 dark:text-red-300 text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>हटाएं</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>फायरबेस क्लाउड प्रोफाइल के साथ सिंक</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-black text-white font-extrabold text-xs sm:text-sm transition-all cursor-pointer"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>

      {/* Delete Annotation Confirmation Modal */}
      <ConfirmModal
        isOpen={!!annotationToDelete}
        onClose={() => setAnnotationToDelete(null)}
        onConfirm={handleConfirmDeleteAnnotation}
        title="हाइलाइट हटाएँ (Delete Highlight)"
        message="क्या आप इस सहेजी गई हाइलाइट / टिप्पणी को हटाना चाहते हैं?"
        confirmText="हाँ, हटाएँ (Delete)"
        cancelText="रद्द करें"
        variant="danger"
        isLoading={isDeletingAnnotation}
        loadingText="हटाया जा रहा है..."
      />
    </div>
  );
};
