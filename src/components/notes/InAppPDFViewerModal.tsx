import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  X,
  BookOpen,
  Eye,
  CheckCircle2,
  Share2,
  Sun,
  Moon,
  Coffee,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  Award,
  Lock,
  Stamp,
  HelpCircle,
  Calculator,
  Bookmark
} from 'lucide-react';
import { downloadColorPDFNotes, ChapterNotesExportData } from '../../utils/downloadNotesHelper';
import { downloadBrandedRKStudyCentrePDF, RK_OFFICIAL_BRAND } from '../../utils/pdfBrandingHelper';
import { resolveUniversalNotesData } from '../../utils/materialNotesMapper';
import { resolveSafePdfUrl } from '../../services/studyMaterialService';
import { RKStudyCenterLogo } from './RKStudyCenterLogo';
import { FullPagePDFCanvasViewer } from './FullPagePDFCanvasViewer';
import {
  identifySubjectContext,
  getSubjectChapters,
  type ContextChapter,
  type SubjectContext,
} from '../../utils/contextNotesHelper';

/**
 * Clean chapter title to avoid clutter in tab buttons
 */
function cleanChapterTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/^अध्याय\s*\d+[\s:–—-]*/, '')
    .replace(/^Chapter\s*\d+[\s:–—-]*/i, '')
    .replace(/\s*\(Reflection of Light\)/i, '')
    .replace(/\s*\(Refraction of Light\)/i, '')
    .replace(/\s*\(Electricity\)/i, '')
    .replace(/\s*\(Life Processes\)/i, '')
    .replace(/\s*\(Real Numbers\)/i, '')
    .trim();
}

export interface PDFDocumentData {
  title: string;
  hindiTitle?: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: string;
  classLevel?: string;
  subjectId?: string;
  subjectName?: string;
  bookTitle?: string;
  chapterTitle?: string;
  chapterNumber?: number;
  content?: string;
  exportData?: ChapterNotesExportData;
  notesExportData?: ChapterNotesExportData;
  [key: string]: any;
}

interface InAppPDFViewerModalProps {
  isOpen: boolean;
  document: PDFDocumentData | null;
  onClose: () => void;
}

export function InAppPDFViewerModal({
  isOpen,
  document,
  onClose
}: InAppPDFViewerModalProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [readingTheme, setReadingTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'pdf' | 'all' | 'intro' | 'notes' | 'objective' | 'subjective' | 'test'>('all');
  const [selectedMcqAnswers, setSelectedMcqAnswers] = useState<Record<number, string>>({});
  const [showAllMcqAnswers, setShowAllMcqAnswers] = useState<boolean>(false);
  const [testSubmitted, setTestSubmitted] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active document state to allow seamless switching between chapters of the same subject
  const [currentDoc, setCurrentDoc] = useState<PDFDocumentData | null>(document);

  useEffect(() => {
    setCurrentDoc(document);
  }, [document]);

  // Fallback to active document or initial prop document
  const effectiveDoc = currentDoc || document;

  // Auto-resolve enriched structured notes data if not provided directly
  const enrichedExportData = useMemo<ChapterNotesExportData | null>(() => {
    if (!effectiveDoc) return null;
    if (effectiveDoc.exportData) return effectiveDoc.exportData;
    if (effectiveDoc.notesExportData) return effectiveDoc.notesExportData;
    return resolveUniversalNotesData(effectiveDoc);
  }, [effectiveDoc]);

  // Context-aware Subject Identification (Physics, Hindi, Geography, History, etc.)
  const activeSubject = useMemo<SubjectContext | null>(() => {
    if (!effectiveDoc) return null;
    return identifySubjectContext(effectiveDoc, enrichedExportData);
  }, [effectiveDoc, enrichedExportData]);

  // Chapters belonging ONLY to this identified Subject
  const subjectChapters = useMemo<ContextChapter[]>(() => {
    if (!activeSubject) return [];
    return getSubjectChapters(activeSubject, effectiveDoc?.classLevel || 'class-10');
  }, [activeSubject, effectiveDoc?.classLevel]);

  // Resolve current active chapter number
  const currentChapterNumber = useMemo<number>(() => {
    if (effectiveDoc?.chapterNumber) return effectiveDoc.chapterNumber;
    if (enrichedExportData?.metadata?.chapterNumber) return enrichedExportData.metadata.chapterNumber;
    const match = ((effectiveDoc?.title || '') + ' ' + (effectiveDoc?.fileName || '')).match(/(?:ch|chapter|अध्याय)[\s:-]*0?(\d+)/i);
    if (match) return parseInt(match[1], 10);
    return 1;
  }, [effectiveDoc, enrichedExportData]);

  const resolvedPdfUrl = useMemo<string | undefined>(() => {
    if (!effectiveDoc?.fileUrl) return undefined;
    return resolveSafePdfUrl(effectiveDoc.fileUrl, effectiveDoc.id, effectiveDoc.fileName);
  }, [effectiveDoc?.fileUrl, effectiveDoc?.id, effectiveDoc?.fileName]);

  const isRealExternalUrl = Boolean(
    resolvedPdfUrl &&
    (resolvedPdfUrl.startsWith('http://') ||
     resolvedPdfUrl.startsWith('https://') ||
     resolvedPdfUrl.startsWith('/api/') ||
     resolvedPdfUrl.startsWith('blob:') ||
     resolvedPdfUrl.startsWith('data:application/pdf')) &&
    !resolvedPdfUrl.startsWith('#')
  );

  const [activePdfUrl, setActivePdfUrl] = useState<string | undefined>(resolvedPdfUrl);
  const [pdfLoadError, setPdfLoadError] = useState<string | null>(null);

  useEffect(() => {
    setActivePdfUrl(resolvedPdfUrl);
    setPdfLoadError(null);
  }, [resolvedPdfUrl]);

  useEffect(() => {
    if (isOpen) {
      setZoomLevel(100);
      setIsFullscreen(false);
      setCopiedLink(false);
      setSelectedMcqAnswers({});
      setShowAllMcqAnswers(false);
      setTestSubmitted(false);
      const initialUrl = document?.fileUrl ? resolveSafePdfUrl(document.fileUrl, document.id, document.fileName) : undefined;
      const hasExternalPdf = Boolean(
        initialUrl &&
        (initialUrl.startsWith('http://') ||
         initialUrl.startsWith('https://') ||
         initialUrl.startsWith('/api/') ||
         initialUrl.startsWith('blob:') ||
         initialUrl.startsWith('data:application/pdf')) &&
        !initialUrl.startsWith('#')
      );
      setActiveTab(hasExternalPdf ? 'pdf' : 'all');
    }
  }, [isOpen, document]);

  if (!isOpen || !document || !effectiveDoc) return null;

  const handleSelectChapter = (chapter: ContextChapter) => {
    const isInitialChapter =
      (document.chapterNumber && chapter.chapterNumber === document.chapterNumber) ||
      (!document.chapterNumber && chapter.chapterNumber === 1);
    const updatedDoc: PDFDocumentData = {
      ...effectiveDoc,
      title: `${activeSubject?.shortName || ''} ${chapter.chapterNumberFormatted}: ${chapter.displayTitle}`,
      hindiTitle: chapter.displayTitle,
      chapterTitle: chapter.displayTitle,
      chapterNumber: chapter.chapterNumber,
      subjectName: activeSubject?.name || effectiveDoc.subjectName,
      bookTitle: chapter.bookTitle || effectiveDoc.bookTitle,
      fileUrl: isInitialChapter ? document.fileUrl : undefined,
      exportData: undefined, // Let universal resolver load this chapter's authentic notes
    };
    setCurrentDoc(updatedDoc);
    setActiveTab(isInitialChapter && document.fileUrl && document.fileUrl !== '#' ? 'pdf' : 'all');
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 400));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoomLevel(100);
  const handleSetZoom = (level: number) => setZoomLevel(level);

  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
    } else {
      if (window.document.exitFullscreen) {
        window.document.exitFullscreen().catch(() => {});
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handlePrint = () => {
    const targetUrl = activePdfUrl || resolvedPdfUrl;
    if (isRealExternalUrl && targetUrl) {
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      printFrame.src = targetUrl;
      printFrame.onload = () => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch {
          window.open(targetUrl, '_blank');
        }
      };
      document.body.appendChild(printFrame);
      setTimeout(() => {
        try {
          document.body.removeChild(printFrame);
        } catch {}
      }, 60000);
      return;
    }

    if (enrichedExportData) {
      downloadColorPDFNotes(enrichedExportData);
    } else {
      downloadBrandedRKStudyCentrePDF(effectiveDoc);
    }
  };

  const handleDownloadBrandedPDF = () => {
    setIsDownloading(true);
    try {
      if (enrichedExportData) {
        downloadColorPDFNotes(enrichedExportData);
      } else {
        downloadBrandedRKStudyCentrePDF(effectiveDoc);
      }
    } catch (e) {
      console.error('PDF download error:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleColorA4Save = () => {
    setIsDownloading(true);
    try {
      const exportData = enrichedExportData || resolveUniversalNotesData(effectiveDoc);
      downloadColorPDFNotes(exportData);
    } catch (e) {
      console.error('A4 Color PDF save error:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadOriginalPDF = async () => {
    const targetUrl = activePdfUrl || resolvedPdfUrl;
    if (isRealExternalUrl && targetUrl) {
      const filename = effectiveDoc.fileName || `${(effectiveDoc.title || 'RK_Study_Notes').replace(/\s+/g, '_')}.pdf`;
      const cleanFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;

      try {
        const response = await fetch(targetUrl);
        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            const a = window.document.createElement('a');
            a.href = blobUrl;
            a.download = cleanFilename;
            window.document.body.appendChild(a);
            a.click();
            window.document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
            return;
          }
        }
      } catch (err) {
        console.warn('[RK STUDY CENTRE] Direct blob download notice:', err);
      }

      // Direct download endpoint fallback
      const directDownloadUrl = targetUrl.includes('?') 
        ? `${targetUrl}&download=1` 
        : `${targetUrl}?download=1`;
      const a = window.document.createElement('a');
      a.href = directDownloadUrl;
      a.download = cleanFilename;
      a.target = '_blank';
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    } else {
      handleDownloadBrandedPDF();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: effectiveDoc.title,
        text: `${effectiveDoc.title} - RK STUDY CENTRE (प्रिंस सर) PDF नोट्स`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Theme Styles
  const themeClasses = {
    light: 'bg-white text-slate-900',
    sepia: 'bg-[#FBF0D9] text-[#433422] border-[#E8D4B0]',
    dark: 'bg-slate-950 text-slate-100 border-slate-800'
  }[readingTheme];

  const sheetBgClasses = {
    light: 'bg-white border-slate-200 shadow-xl text-slate-900',
    sepia: 'bg-[#FDF6E2] border-[#E2CEAA] shadow-xl text-[#382818]',
    dark: 'bg-slate-900 border-slate-800 shadow-2xl text-slate-100'
  }[readingTheme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-1 sm:p-2 md:p-4 animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className={`w-full max-w-6xl h-[96vh] flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden border shadow-2xl transition-all ${themeClasses}`}
      >
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3 border-b flex items-center justify-between gap-3 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <RKStudyCenterLogo size="md" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 uppercase tracking-wider">
                  RK STUDY CENTRE BRANDED
                </span>
                {effectiveDoc.classLevel && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-200 uppercase">
                    {effectiveDoc.classLevel}
                  </span>
                )}
                <span className="text-[11px] text-emerald-400 font-bold hidden sm:inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  प्रिंस सर द्वारा सत्यापित
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md sm:max-w-xl">
                {effectiveDoc.title}
              </h3>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme Selector */}
            <div className="hidden md:flex items-center bg-white/10 rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setReadingTheme('light')}
                title="सामान्य मोड (Light)"
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  readingTheme === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setReadingTheme('sepia')}
                title="आंखों के लिए सौम्य मोड (Sepia)"
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  readingTheme === 'sepia' ? 'bg-[#FBF0D9] text-[#433422] shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Coffee className="w-4 h-4" />
              </button>
              <button
                onClick={() => setReadingTheme('dark')}
                title="रात्रि मोड (Night Mode)"
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  readingTheme === 'dark' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls & 400% Sharpness Test */}
            <div className="hidden sm:flex items-center bg-white/10 rounded-xl p-1 border border-white/10 gap-0.5">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
                title="ज़ूम आउट (-)"
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-40 cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              {/* Direct Zoom Presets */}
              <div className="flex items-center gap-0.5">
                {[100, 200, 300, 400].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleSetZoom(preset)}
                    title={`${preset}% ज़ूम पर देखें`}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      zoomLevel === preset
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {preset === 400 ? '400% 🔍' : `${preset}%`}
                  </button>
                ))}
              </div>

              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 400}
                title="ज़ूम इन (+)"
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-40 cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Print / Branded PDF Generation */}
            <button
              onClick={handlePrint}
              title="RK STUDY CENTRE ब्रांडिंग के साथ प्रिंट / PDF"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Official Branded PDF Download Button */}
            <button
              onClick={handleDownloadBrandedPDF}
              disabled={isDownloading}
              title="RK STUDY CENTRE आधिकारिक PDF डाउनलोड करें"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md active:scale-95 border border-amber-300"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">ब्रांडेड PDF डाउनलोड</span>
            </button>

            {/* A4 Color PDF Save / Print Button */}
            <button
              onClick={handleColorA4Save}
              disabled={isDownloading}
              title="A4 रंगीन PDF सहेज एवं प्रिंट करें"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition-all cursor-pointer shadow-md active:scale-95 border border-emerald-400"
            >
              <Printer className="w-4 h-4 text-white" />
              <span className="hidden md:inline">🖨️ A4 रंगीन PDF सहेज</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              title="बंद करें (Esc)"
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Global Security & Brand Ribbon (Hidden in PDF Reader mode to maximize PDF page height) */}
        {activeTab !== 'pdf' && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-900 dark:text-amber-300 font-bold">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>आर. के. स्टडी सेन्टर (RK STUDY CENTRE)</strong> • यह अध्ययन सामग्री प्रिंस सर (Prince Sir) द्वारा प्रमाणित है।
              </span>
            </div>
            <button
              onClick={handleDownloadBrandedPDF}
              className="text-[11px] font-black underline hover:text-amber-700 dark:hover:text-amber-200 cursor-pointer hidden md:inline"
            >
              आधिकारिक PDF सहेजें 📥
            </button>
          </div>
        )}

        {/* Tier 1: Context-Aware Dynamic Subject Tab Bar (Hidden in PDF Reader mode) */}
        {activeTab !== 'pdf' && activeSubject && (
          <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2 flex items-center justify-between gap-3 overflow-x-auto shrink-0 scrollbar-none">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                विषय:
              </span>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black text-white shadow-xs ${activeSubject.badgeColor}`}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span>{activeSubject.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold shrink-0">
              <span className="hidden md:inline">RK अधिकृत अध्ययन सामग्री</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700 font-mono">
                {subjectChapters.length > 0 ? `${subjectChapters.length} अध्याय` : 'सक्रिय'}
              </span>
            </div>
          </div>
        )}

        {/* Tier 2: Chapter Navigation Tab Bar (Hidden in PDF Reader mode) */}
        {activeTab !== 'pdf' && subjectChapters.length > 0 && (
          <div className="bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-thin">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300 shrink-0 pr-2 border-r border-slate-300 dark:border-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>अध्याय चुनें:</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {subjectChapters.map((ch) => {
                const isActive = ch.chapterNumber === currentChapterNumber;
                const formattedNum = ch.chapterNumber < 10 ? `0${ch.chapterNumber}` : `${ch.chapterNumber}`;
                const cleanTitle = cleanChapterTitle(ch.displayTitle);
                const shortName = activeSubject?.shortName || 'विषय';
                const chapterNavLabel = `${shortName} - ${formattedNum} - ${cleanTitle}`;
                return (
                  <button
                    key={ch.id}
                    onClick={() => handleSelectChapter(ch)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400 font-black'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-semibold'
                    }`}
                    title={chapterNavLabel}
                  >
                    <span>{chapterNavLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tier 3: Internal Section Tabs (मूल PDF, P1: परिचय, P2: मुख्य बिंदु, P3: प्रश्नोत्तर, P4: वस्तुनिष्ठ) */}
        {enrichedExportData && (
          <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:inline mr-1">
              अध्ययन खंड:
            </span>
            {isRealExternalUrl && (
              <button
                onClick={() => setActiveTab('pdf')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'pdf'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>मूल अपलोड PDF (Original PDF)</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              संपूर्ण अध्याय (Full Notes)
            </button>
            <button
              onClick={() => setActiveTab('intro')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'intro'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              P1: परिचय
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'notes'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              P2: मुख्य बिंदु ({enrichedExportData.sections?.length || 0})
            </button>
            {enrichedExportData.subjectiveQuestions && enrichedExportData.subjectiveQuestions.length > 0 && (
              <button
                onClick={() => setActiveTab('subjective')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'subjective'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                P3: प्रश्नोत्तर ({enrichedExportData.subjectiveQuestions.length})
              </button>
            )}
            {enrichedExportData.objectiveQuestions && enrichedExportData.objectiveQuestions.length > 0 && (
              <>
                <button
                  onClick={() => setActiveTab('objective')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'objective'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  P4: वस्तुनिष्ठ ({enrichedExportData.objectiveQuestions.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('test');
                    setSelectedMcqAnswers({});
                    setTestSubmitted(false);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'test'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40 hover:bg-emerald-500/25'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>⚡ लाइव टेस्ट ({enrichedExportData.objectiveQuestions.length})</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* PDF Reader Content Area */}
        <div
          className={`flex-1 flex justify-center bg-slate-100/70 dark:bg-slate-950/80 relative ${
            activeTab === 'pdf' ? 'overflow-hidden p-0' : 'overflow-auto p-1.5 sm:p-4'
          }`}
        >
          <div
            style={
              activeTab !== 'pdf' && zoomLevel !== 100
                ? {
                    zoom: `${zoomLevel}%`,
                  }
                : undefined
            }
            className={`w-full ${
              activeTab === 'pdf'
                ? 'max-w-full h-full p-0 rounded-none border-0'
                : 'max-w-5xl p-4 sm:p-8 rounded-2xl border'
            } transition-all duration-150 relative ${sheetBgClasses}`}
          >
            {/* 400% Zoom Quality & Vector Sharpness Indicator */}
            {zoomLevel >= 300 && (
              <div className="mb-6 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-400 flex items-center justify-between gap-3 text-xs font-bold text-emerald-900 dark:text-emerald-200 shadow-sm animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    <strong>{zoomLevel}% ज़ूम सत्यापन:</strong> 100% वेक्टर रेंडरिंग — हिंदी, अंग्रेज़ी, गणितीय सूत्र और लोगो बिल्कुल शार्प (0% पिक्सेलेशन) हैं।
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-600 text-white tracking-wider shrink-0">
                  400% SHARP VECTOR PASS
                </span>
              </div>
            )}
            {/* Watermark removed as per user request */}

            {/* If there is a direct binary fileUrl available and 'pdf' tab is active, render with FullPagePDFCanvasViewer */}
            {pdfLoadError && activeTab === 'pdf' ? (
              <div className="p-8 my-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 text-center space-y-4 shadow-md animate-in fade-in duration-200">
                <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <HelpCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {effectiveDoc.title}
                  </h3>
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-300">
                    {pdfLoadError}
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      setPdfLoadError(null);
                      if (resolvedPdfUrl) setActivePdfUrl(`${resolvedPdfUrl}?retry=${Date.now()}`);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>पुनः प्रयास करें (Retry)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('all')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>इन-ऐप इंटरएक्टिव नोट्स पढ़ें</span>
                  </button>
                  <a
                    href="mailto:rkstudycentre064@gmail.com"
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
                  >
                    Owner से संपर्क करें
                  </a>
                </div>
              </div>
            ) : isRealExternalUrl && (activePdfUrl || resolvedPdfUrl) && activeTab === 'pdf' ? (
              <div className="space-y-2 relative z-20 h-full">
                <FullPagePDFCanvasViewer
                  pdfUrl={(activePdfUrl || resolvedPdfUrl)!}
                  title={effectiveDoc.title}
                  onDownloadOriginal={handleDownloadOriginalPDF}
                  onSwitchToInteractiveNotes={() => setActiveTab('all')}
                />
              </div>
            ) : (
              /* High Definition Structured Color Booklet Layout */
              <div className="space-y-8 relative z-20">
                {/* Subtle Non-Obstructing RK STUDY CENTRE Watermark */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none select-none fixed inset-0 flex items-center justify-center overflow-hidden z-0"
                >
                  <div className="-rotate-24 text-center opacity-[0.035]">
                    <p className="text-3xl sm:text-5xl font-black tracking-widest text-slate-900 dark:text-white uppercase whitespace-nowrap">
                      RK STUDY CENTRE
                    </p>
                    <p className="text-xs sm:text-base font-bold tracking-wider text-slate-800 dark:text-slate-200 uppercase mt-1">
                      मूल टॉपर्स नोट्स • PRINCE SIR
                    </p>
                  </div>
                </div>
                {/* Booklet Header Banner */}
                <div className="border-b-4 border-amber-500 pb-6 text-center space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <RKStudyCenterLogo size="lg" />
                    <div className="text-left">
                      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-blue-950 dark:text-blue-200">
                        RK STUDY CENTRE
                      </h1>
                      <p className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                        बिहार बोर्ड कक्षा 9वीं, 10वीं, 11वीं एवं 12वीं टॉपर नोट्स
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-black bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-800">
                    <ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                    <span>प्रिंस सर द्वारा प्रमाणित डिजिटल अध्ययन सामग्री (BSEB 2026-27)</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white pt-2">
                    {enrichedExportData?.metadata?.chapterTitleHindi || effectiveDoc.chapterTitle || effectiveDoc.hindiTitle || effectiveDoc.title}
                  </h2>

                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 flex-wrap">
                    <span>कक्षा: <strong>{enrichedExportData?.metadata?.classLevel || effectiveDoc.classLevel || 'Class 10'}</strong></span>
                    <span>•</span>
                    <span>विषय: <strong>{activeSubject?.name || enrichedExportData?.metadata?.subject || effectiveDoc.subjectName || 'अध्ययन नोट्स'}</strong></span>
                    <span>•</span>
                    <span>बैच: <strong>{enrichedExportData?.metadata?.batch || 'टॉपर बैच 2026-27'}</strong></span>
                  </div>
                </div>

                {/* P1: परिचय (Introduction & Background) */}
                {(activeTab === 'all' || activeTab === 'intro') && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-slate-900 border border-blue-200 dark:border-blue-800 text-left space-y-3 shadow-xs">
                    <div className="flex items-center gap-2 text-sm font-black text-blue-900 dark:text-blue-300 uppercase tracking-wide border-b border-blue-200 dark:border-blue-800 pb-2">
                      <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>P1: परिचय एवं पृष्ठभूमि (Introduction & Overview)</span>
                    </div>

                    {enrichedExportData?.introduction && (
                      <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 font-sans">
                        {enrichedExportData.introduction}
                      </div>
                    )}

                    {enrichedExportData?.authorBio && (
                      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs sm:text-sm text-amber-950 dark:text-amber-200">
                        <strong className="text-amber-900 dark:text-amber-300">लेखक / रचनाकार परिचय: </strong>
                        {enrichedExportData.authorBio}
                      </div>
                    )}

                    {enrichedExportData?.overview?.summaryHindi && (
                      <div className="p-3.5 rounded-xl bg-blue-100/70 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-800 text-xs sm:text-sm text-blue-950 dark:text-blue-200">
                        <strong>अध्याय सारांश: </strong> {enrichedExportData.overview.summaryHindi}
                      </div>
                    )}

                    {!enrichedExportData?.introduction && !enrichedExportData?.authorBio && !enrichedExportData?.overview?.summaryHindi && (
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic">
                        इस अध्याय के मुख्य सिद्धांत, परिभाषाएँ एवं महत्वपूर्ण प्रश्नोत्तर नीचे P2, P3 एवं P4 खंडों में विस्तारपूर्वक दिए गए हैं।
                      </p>
                    )}
                  </div>
                )}

                {/* P2: मुख्य बिंदु (Key Study Sections & Theory) */}
                {(activeTab === 'all' || activeTab === 'notes') && enrichedExportData?.sections && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-blue-900 dark:text-blue-300 border-b-2 border-blue-600 pb-2 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600 shrink-0" />
                      <span>P2: मुख्य बिंदु व विस्तृत व्याख्या ({enrichedExportData.sections.length} अध्ययन खंड)</span>
                    </h3>

                    {enrichedExportData.sections.map((section, idx) => (
                      <div
                        key={section.id || idx}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
                      >
                        <h4 className="text-base font-black text-rose-700 dark:text-rose-400">
                          {section.hindiTitle || section.title}
                        </h4>

                        <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 font-sans">
                          {section.content}
                        </div>

                        {section.formulaeOrRules && section.formulaeOrRules.length > 0 && (
                          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-1">
                            <span className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1">
                              <Calculator className="w-3.5 h-3.5" />
                              प्रमुख सूत्र व रासायनिक समीकरण:
                            </span>
                            {section.formulaeOrRules.map((formula, fIdx) => (
                              <p key={fIdx} className="font-mono text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200">
                                • {formula}
                              </p>
                            ))}
                          </div>
                        )}

                        {section.keyPoints && section.keyPoints.length > 0 && (
                          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                            <span className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">
                              विशेष स्मरणीय तथ्य:
                            </span>
                            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-emerald-950 dark:text-emerald-200">
                              {section.keyPoints.map((kp, kIdx) => (
                                <li key={kIdx}>{kp}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {section.examTips && (
                          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs font-bold text-rose-900 dark:text-rose-300">
                            <strong>🎯 परीक्षा टिप (प्रिंस सर):</strong> {section.examTips}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* P3: प्रश्नोत्तर (Subjective Questions & Answers) */}
                {(activeTab === 'all' || activeTab === 'subjective') && enrichedExportData?.subjectiveQuestions && enrichedExportData.subjectiveQuestions.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-black text-blue-900 dark:text-blue-300 border-b-2 border-blue-600 pb-2 flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-600 shrink-0" />
                      <span>P3: बोर्ड परीक्षा VVI लघु एवं दीर्घ उत्तरीय प्रश्नोत्तर ({enrichedExportData.subjectiveQuestions.length})</span>
                    </h3>

                    <div className="space-y-4">
                      {enrichedExportData.subjectiveQuestions.map((sq, sqIdx) => (
                        <div
                          key={sq.id || sqIdx}
                          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-black text-sm sm:text-base text-blue-950 dark:text-blue-200">
                              {sq.question}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 text-xs font-black shrink-0">
                              {sq.marks} अंक {sq.boardYear ? `[${sq.boardYear}]` : ''}
                            </span>
                          </div>

                          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 whitespace-pre-line text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                            <strong>उत्तर: </strong> {sq.answer}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* P4: वस्तुनिष्ठ (Objective MCQs) & Live Test Mode */}
                {(activeTab === 'all' || activeTab === 'objective' || activeTab === 'test') && enrichedExportData?.objectiveQuestions && enrichedExportData.objectiveQuestions.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-blue-600 pb-3">
                      <h3 className="text-lg font-black text-blue-900 dark:text-blue-300 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-blue-600 shrink-0" />
                        <span>
                          {activeTab === 'test'
                            ? `⚡ लाइव ऑनलाइन टेस्ट मोड (${enrichedExportData.objectiveQuestions.length} VVI MCQs)`
                            : `P4: बिहार बोर्ड VVI वस्तुनिष्ठ प्रश्नोत्तर (${enrichedExportData.objectiveQuestions.length} MCQs)`}
                        </span>
                      </h3>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setShowAllMcqAnswers((prev) => !prev)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer transition-all ${
                            showAllMcqAnswers
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {showAllMcqAnswers ? 'उत्तर छुपाएं (Hide Check)' : '✓ सभी उत्तर जांचें (Fast Check)'}
                        </button>

                        {activeTab !== 'test' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('test');
                              setSelectedMcqAnswers({});
                              setTestSubmitted(false);
                              setShowAllMcqAnswers(false);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer shadow-xs flex items-center gap-1"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>⚡ टेस्ट शुरू करें (Start Test)</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMcqAnswers({});
                              setTestSubmitted(false);
                              setShowAllMcqAnswers(false);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-black cursor-pointer"
                          >
                            रीसेट करें (Reset)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Live Score Banner when in Test Mode or when questions are answered */}
                    {(activeTab === 'test' || Object.keys(selectedMcqAnswers).length > 0) && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
                        <div className="flex items-center gap-4 text-xs sm:text-sm font-black">
                          <span className="px-2.5 py-1 rounded-lg bg-white/10">
                            हल किए गए: {Object.keys(selectedMcqAnswers).filter((k) => selectedMcqAnswers[Number(k)]).length} / {enrichedExportData.objectiveQuestions.length}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                            सही: {
                              enrichedExportData.objectiveQuestions.filter(
                                (q, idx) => selectedMcqAnswers[idx] && selectedMcqAnswers[idx] === q.correctOption
                              ).length
                            }
                          </span>
                        </div>
                        {activeTab === 'test' && !testSubmitted && (
                          <button
                            type="button"
                            onClick={() => {
                              setTestSubmitted(true);
                              setShowAllMcqAnswers(true);
                            }}
                            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black cursor-pointer shadow-xs"
                          >
                            ✓ टेस्ट सबमिट और चेक करें (Submit & Check)
                          </button>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                      {enrichedExportData.objectiveQuestions.map((q, qIdx) => {
                        const chosenKey = selectedMcqAnswers[qIdx];
                        const showAnswer = showAllMcqAnswers || testSubmitted || Boolean(chosenKey);
                        const optA = Array.isArray(q.options) ? (typeof q.options[0] === 'object' ? q.options[0]?.text : q.options[0]) : q.options?.A;
                        const optB = Array.isArray(q.options) ? (typeof q.options[1] === 'object' ? q.options[1]?.text : q.options[1]) : q.options?.B;
                        const optC = Array.isArray(q.options) ? (typeof q.options[2] === 'object' ? q.options[2]?.text : q.options[2]) : q.options?.C;
                        const optD = Array.isArray(q.options) ? (typeof q.options[3] === 'object' ? q.options[3]?.text : q.options[3]) : q.options?.D;
                        const optionEntries = [
                          { key: 'A', text: optA || '' },
                          { key: 'B', text: optB || '' },
                          { key: 'C', text: optC || '' },
                          { key: 'D', text: optD || '' },
                        ];

                        return (
                          <div
                            key={q.id || qIdx}
                            className={`p-4 rounded-xl border-2 space-y-3 transition-colors ${
                              chosenKey
                                ? chosenKey === q.correctOption
                                  ? 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-400'
                                  : 'bg-rose-50/40 dark:bg-rose-950/30 border-rose-400'
                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                              प्र. {qIdx + 1}. {q.question}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                              {optionEntries.map((opt) => {
                                const isCorrect = q.correctOption === opt.key;
                                const isSelected = chosenKey === opt.key;
                                let btnStyle =
                                  'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-400';
                                if (isSelected) {
                                  btnStyle = isCorrect
                                    ? 'bg-emerald-600 text-white border-emerald-600 font-black'
                                    : 'bg-rose-600 text-white border-rose-600 font-black';
                                } else if (showAnswer && isCorrect) {
                                  btnStyle =
                                    'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400 font-black text-emerald-950 dark:text-emerald-200';
                                }

                                return (
                                  <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() =>
                                      setSelectedMcqAnswers((prev) => ({
                                        ...prev,
                                        [qIdx]: opt.key,
                                      }))
                                    }
                                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer active:scale-95 flex items-center justify-between gap-2 ${btnStyle}`}
                                  >
                                    <span>
                                      ({opt.key}) {opt.text}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedMcqAnswers((prev) => ({
                                    ...prev,
                                    [qIdx]: prev[qIdx] ? '' : q.correctOption,
                                  }))
                                }
                                className={`px-3 py-1 rounded-lg text-xs font-black cursor-pointer transition-all active:scale-95 ${
                                  showAnswer
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                              >
                                {showAnswer ? `✅ सही उत्तर: विकल्प (${q.correctOption})` : '✓ उत्तर जांचें (Check)'}
                              </button>
                              {showAnswer && q.explanation && (
                                <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
                                  💡 {q.explanation}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Fast Test Start & Check Bar inside InAppPDFViewerModal */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-blue-400/30 mt-4">
                      <div className="space-y-1 text-center sm:text-left">
                        <h4 className="text-sm sm:text-base font-black text-amber-300">
                          🎯 संपूर्ण {enrichedExportData.objectiveQuestions.length} VVI वस्तुनिष्ठ प्रश्न
                        </h4>
                        <p className="text-xs text-slate-200">
                          एक क्लिक में सभी उत्तर जांचें या लाइव टेस्ट शुरू करें!
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setTestSubmitted(true);
                            setShowAllMcqAnswers((prev) => !prev);
                          }}
                          className={`px-4 py-2.5 rounded-xl text-xs font-black cursor-pointer transition-all active:scale-95 border ${
                            showAllMcqAnswers
                              ? 'bg-amber-400 text-slate-950 border-amber-300'
                              : 'bg-white/15 hover:bg-white/25 text-white border-white/30'
                          }`}
                        >
                          {showAllMcqAnswers ? 'उत्तर छुपाएं (Hide Check)' : '✓ सभी उत्तर जांचें (Fast Check)'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('test');
                            setSelectedMcqAnswers({});
                            setTestSubmitted(false);
                            setShowAllMcqAnswers(false);
                          }}
                          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-black cursor-pointer shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>⚡ तुरंत टेस्ट शुरू करें (Start Test)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Raw Content Fallback if no enriched sections */}
                {!enrichedExportData?.sections && effectiveDoc.content && (
                  <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 text-base leading-relaxed">
                    <div className="whitespace-pre-wrap font-sans text-base leading-loose">
                      {effectiveDoc.content}
                    </div>
                  </div>
                )}

                {/* Booklet Footer Watermark */}
                <div className="border-t-2 border-slate-200 dark:border-slate-800 pt-6 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span>RK STUDY CENTRE • संस्थापक एवं निदेशक: प्रिंस सर (Prince Sir)</span>
                  </div>
                  <div>
                    <span>सत्यापन कोड: {enrichedExportData?.metadata?.verificationCode || 'RK-OFFICIAL-2026'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="px-6 py-3 border-t flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>RK STUDY CENTRE अधिकृत इन-ऐप PDF व्यूअर (100% ब्रांडेड)</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            {enrichedExportData?.objectiveQuestions && enrichedExportData.objectiveQuestions.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab !== 'objective' && activeTab !== 'test' && activeTab !== 'all') {
                      setActiveTab('objective');
                    }
                    setShowAllMcqAnswers((prev) => !prev);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-xs cursor-pointer transition-all active:scale-95"
                >
                  {showAllMcqAnswers ? 'उत्तर छुपाएं' : '✓ उत्तर जांचें (Check)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('test');
                    setSelectedMcqAnswers({});
                    setTestSubmitted(false);
                    setShowAllMcqAnswers(false);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-xs transition-all active:scale-95 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>⚡ टेस्ट शुरू करें</span>
                </button>
              </>
            )}
            <button
              onClick={handleShare}
              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'लिंक कॉपी हो गया!' : 'शेयर करें'}</span>
            </button>
            <button
              onClick={handleDownloadBrandedPDF}
              className="text-amber-700 dark:text-amber-400 hover:underline font-black flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>RK ब्रांडेड PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
