import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  MoveHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Download,
  ExternalLink,
  FileText,
  Maximize2,
  Minimize2,
  Award,
  GraduationCap,
} from 'lucide-react';
import { RKStudyCenterLogo } from './RKStudyCenterLogo';

// Configure PDF.js worker using Vite ?url asset resolution
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export type FitMode = 'fit-page' | 'fit-width' | 'custom';

export const ZOOM_PRESETS = [50, 75, 100, 125, 150, 175, 200];

interface PDFPageCanvasProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  totalPages: number;
  containerWidth: number;
  containerHeight: number;
  fitMode: FitMode;
  zoomPercent: number;
  onPageVisible?: (pageNum: number) => void;
}

const MAX_CANVAS_DIMENSION = 4096;

const PDFPageCanvas: React.FC<PDFPageCanvasProps> = ({
  pdfDoc,
  pageNumber,
  totalPages,
  containerWidth,
  containerHeight,
  fitMode,
  zoomPercent,
  onPageVisible,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  const [isNearViewport, setIsNearViewport] = useState<boolean>(pageNumber <= 4);
  const [isRendered, setIsRendered] = useState<boolean>(false);
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }>({
    width: 595.32,
    height: 841.92,
  });

  // Track visibility for lazy high-DPI rendering and active page indicator
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const nearObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsNearViewport(true);
          }
        });
      },
      { rootMargin: '1600px 0px 1600px 0px', threshold: 0.01 }
    );

    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            onPageVisible?.(pageNumber);
          }
        });
      },
      { threshold: [0.35, 0.65] }
    );

    nearObserver.observe(el);
    activeObserver.observe(el);

    return () => {
      nearObserver.disconnect();
      activeObserver.disconnect();
    };
  }, [pageNumber, onPageVisible]);

  /**
   * Calculate exact target CSS display dimensions preserving original PDF aspect ratio & rotation.
   * Priority:
   * 1. Complete page visible (Zero cropping)
   * 2. Preserved aspect ratio (Zero distortion)
   * 3. Maximum practical readable scale
   */
  const computeDisplayDimensions = useCallback(
    (origWidth: number, origHeight: number) => {
      const safeOrigW = origWidth > 0 ? origWidth : 595.32;
      const safeOrigH = origHeight > 0 ? origHeight : 841.92;

      // Subtract padding (16px horizontal, 38px vertical for compact page bar + margin)
      const availableWidth = Math.max(240, containerWidth - 20);
      const availableHeight = Math.max(280, containerHeight - 38);

      const scaleByWidth = availableWidth / safeOrigW;
      const scaleByHeight = availableHeight / safeOrigH;

      let fitScale: number;
      if (fitMode === 'fit-page') {
        // Fit entire page (top, middle, bottom, left, right) inside available viewport
        fitScale = Math.min(scaleByWidth, scaleByHeight);
      } else {
        // 'fit-width' or 'custom': maximize readable width within container (capped at 1020px at 100% so wide monitors stay comfortable)
        const maxComfortableWidth = Math.min(availableWidth, 1020);
        fitScale = maxComfortableWidth / safeOrigW;
      }

      const finalScale = fitScale * (zoomPercent / 100);
      const cssWidth = Math.max(180, Math.round(safeOrigW * finalScale));
      const cssHeight = Math.max(220, Math.round(safeOrigH * finalScale));

      return {
        cssWidth,
        cssHeight,
        scale: finalScale,
      };
    },
    [containerWidth, containerHeight, fitMode, zoomPercent]
  );

  useEffect(() => {
    if (!isNearViewport || !pdfDoc || containerWidth <= 0) return;

    let isCancelled = false;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        // Respect intrinsic PDF page dimensions & rotation (0, 90, 180, 270)
        const baseViewport = page.getViewport({ scale: 1 });
        setPageDimensions({
          width: baseViewport.width,
          height: baseViewport.height,
        });

        const { cssWidth, cssHeight, scale } = computeDisplayDimensions(
          baseViewport.width,
          baseViewport.height
        );

        const canvas = canvasRef.current;
        if (!canvas || isCancelled) return;

        // Cancel any previous in-flight render on this canvas
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
        }

        // High-DPI Retina calculation with safe memory ceiling
        const rawDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
        const targetDpr = Math.min(Math.max(rawDpr, 1.75), 2.5);
        let renderScale = scale * targetDpr;

        const testViewport = page.getViewport({ scale: renderScale });
        if (
          testViewport.width > MAX_CANVAS_DIMENSION ||
          testViewport.height > MAX_CANVAS_DIMENSION
        ) {
          const clampFactor = Math.min(
            MAX_CANVAS_DIMENSION / testViewport.width,
            MAX_CANVAS_DIMENSION / testViewport.height
          );
          renderScale = renderScale * clampFactor;
        }

        const hiDpiViewport = page.getViewport({ scale: renderScale });

        canvas.width = Math.floor(hiDpiViewport.width);
        canvas.height = Math.floor(hiDpiViewport.height);
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        // Fill clean white page background so transparent PDFs never look dark/blank
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const renderTask = page.render({
          canvasContext: ctx,
          viewport: hiDpiViewport,
          intent: 'display',
        } as any);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        if (!isCancelled) {
          setIsRendered(true);
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn(`[RK PDF Engine] Page ${pageNumber} render notice:`, err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [
    isNearViewport,
    pdfDoc,
    pageNumber,
    containerWidth,
    containerHeight,
    fitMode,
    zoomPercent,
    computeDisplayDimensions,
  ]);

  const { cssWidth, cssHeight } = computeDisplayDimensions(
    pageDimensions.width,
    pageDimensions.height
  );

  return (
    <div
      ref={wrapperRef}
      data-page-number={pageNumber}
      className="mx-auto my-2 bg-white rounded-xl shadow-lg border border-slate-300 dark:border-slate-700 overflow-hidden"
      style={{
        width: `${cssWidth}px`,
      }}
    >
      {/* Compact External Page Ribbon (Strictly outside canvas — never overlaps or cuts PDF content) */}
      <div className="w-full bg-slate-900 text-white px-3 py-1 border-b border-orange-500/80 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-bold select-none">
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          <span className="font-black text-amber-400 tracking-wide">RK STUDY CENTRE</span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-200 hidden sm:inline truncate">
            मूल टॉपर्स नोट्स | Official Study Material
          </span>
        </div>
        <span className="px-2 py-0.2 rounded bg-white/10 text-amber-300 font-mono font-black shrink-0">
          Page {pageNumber} / {totalPages}
        </span>
      </div>

      {/* Complete Uncropped PDF Page Canvas + Subtle Non-Obstructing Watermark */}
      <div
        className="relative bg-white flex items-center justify-center"
        style={{
          width: `${cssWidth}px`,
          height: `${cssHeight}px`,
        }}
      >
        {!isRendered && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white text-slate-500 gap-2 z-10">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-xs font-bold">
              पृष्ठ {pageNumber} / {totalPages} तैयार हो रहा है...
            </span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="block bg-white"
          style={{
            width: `${cssWidth}px`,
            height: `${cssHeight}px`,
          }}
        />

        {/* Subtle Non-Obstructing RK STUDY CENTRE Watermark (3.5% opacity, pointer-events-none) */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden z-10"
        >
          <div className="-rotate-24 text-center opacity-[0.035]">
            <p className="text-lg sm:text-2xl md:text-3xl font-black tracking-widest text-slate-900 uppercase whitespace-nowrap">
              RK STUDY CENTRE
            </p>
            <p className="text-[10px] sm:text-xs font-bold tracking-wider text-slate-800 uppercase mt-0.5">
              PRINCE SIR • OFFICIAL STUDY MATERIAL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface FullPagePDFCanvasViewerProps {
  pdfUrl: string;
  title?: string;
  onDownloadOriginal?: () => void;
  onSwitchToInteractiveNotes?: () => void;
}

export const FullPagePDFCanvasViewer: React.FC<FullPagePDFCanvasViewerProps> = ({
  pdfUrl,
  title,
  onDownloadOriginal,
  onSwitchToInteractiveNotes,
}) => {
  const readerRootRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Dynamic viewport measurement (viewportHeight - headerHeight - footerHeight)
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? Math.min(window.innerWidth - 24, 960) : 820,
    height: typeof window !== 'undefined' ? Math.max(window.innerHeight - 190, 520) : 640,
  });

  // Default to 'fit-width' on desktop/tablet for large readable text, and 'fit-page' on mobile
  // (On mobile portrait, fit-page and fit-width both maximize width while fitting 100% height)
  const [fitMode, setFitMode] = useState<FitMode>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'fit-page';
    }
    return 'fit-width';
  });
  const [zoomPercent, setZoomPercent] = useState<number>(100);

  // Measure available container dimensions dynamically via ResizeObserver
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const updateMeasurements = () => {
      const clientW = el.clientWidth;
      const clientH = el.clientHeight;
      if (clientW > 0 && clientH > 0) {
        setContainerSize((prev) => {
          if (Math.abs(prev.width - clientW) < 2 && Math.abs(prev.height - clientH) < 2) {
            return prev;
          }
          return {
            width: clientW,
            height: clientH,
          };
        });
      }
    };

    updateMeasurements();

    const observer = new ResizeObserver(() => {
      updateMeasurements();
    });
    observer.observe(el);

    window.addEventListener('resize', updateMeasurements);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateMeasurements);
    };
  }, []);

  // Load PDF binary document via PDF.js with full CMap and Standard Font support
  useEffect(() => {
    if (!pdfUrl) return;

    let isCancelled = false;
    let loadedDoc: pdfjsLib.PDFDocumentProxy | null = null;

    setIsLoading(true);
    setLoadError(null);
    setPdfDoc(null);
    setTotalPages(0);
    setCurrentPage(1);

    const pdfVersion = pdfjsLib.version || '5.6.205';
    const cMapUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfVersion}/cmaps/`;
    const standardFontDataUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfVersion}/standard_fonts/`;

    const loadPdfDocument = async () => {
      try {
        let loadingTask: pdfjsLib.PDFDocumentLoadingTask;

        if (pdfUrl.startsWith('data:application/pdf;base64,')) {
          const base64 = pdfUrl.split('base64,')[1];
          const binaryStr = window.atob(base64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          loadingTask = pdfjsLib.getDocument({
            data: bytes,
            cMapUrl,
            cMapPacked: true,
            standardFontDataUrl,
          });
        } else {
          const res = await fetch(pdfUrl);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            throw new Error('PDF file not found on storage server');
          }
          const arrayBuffer = await res.arrayBuffer();
          loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(arrayBuffer),
            cMapUrl,
            cMapPacked: true,
            standardFontDataUrl,
          });
        }

        const doc = await loadingTask.promise;
        if (isCancelled) {
          (doc as any).destroy?.();
          return;
        }

        loadedDoc = doc;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setIsLoading(false);
      } catch (err: any) {
        console.warn('[RK PDF Engine] Failed to load PDF via PDF.js:', err);
        if (!isCancelled) {
          setLoadError(
            'यह PDF लोड करने में समस्या आई। कृपया पुनः प्रयास करें या नीचे दिए गए बटन से सीधे खोलें।'
          );
          setIsLoading(false);
        }
      }
    };

    loadPdfDocument();

    return () => {
      isCancelled = true;
      if (loadedDoc) {
        try {
          (loadedDoc as any).destroy?.();
        } catch {}
      }
    };
  }, [pdfUrl]);

  const scrollToPage = (targetPage: number) => {
    const clamped = Math.max(1, Math.min(totalPages, targetPage));
    setCurrentPage(clamped);
    const container = scrollContainerRef.current;
    if (!container) return;
    const pageEl = container.querySelector(`[data-page-number="${clamped}"]`);
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleZoomIn = () => {
    setZoomPercent((prev) => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoomPercent((prev) => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoomPercent(100);
  };

  const handleFitToWidth = () => {
    setFitMode('fit-width');
    setZoomPercent(100);
  };

  const handleFitToPage = () => {
    setFitMode('fit-page');
    setZoomPercent(100);
  };

  const handleToggleFullscreen = () => {
    const el = readerRootRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={readerRootRef}
      className="flex flex-col w-full h-full flex-1 min-h-0 bg-slate-200 dark:bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-300 dark:border-slate-800 shadow-inner"
    >
      {/* 1. HEADER — RK STUDY CENTRE BRANDING & READER CONTROLS (Strictly above PDF viewport) */}
      <div className="bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#0B192C] text-white px-2.5 sm:px-4 py-2 border-b-2 border-orange-500 flex flex-wrap items-center justify-between gap-2 shrink-0 z-20">
        {/* Left: RK STUDY CENTRE Brand + Page Navigation (← Previous | Page 1 / 19 | Next →) */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden md:flex items-center gap-1.5 pr-2 border-r border-white/20">
            <RKStudyCenterLogo size="sm" variant="mark-only" />
            <div className="leading-tight">
              <span className="text-xs font-black text-amber-400 block tracking-wide">
                RK STUDY CENTRE
              </span>
              <span className="text-[10px] font-bold text-slate-200 block">
                मूल टॉपर्स नोट्स • Study Reader
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollToPage(currentPage - 1)}
              disabled={currentPage <= 1 || totalPages === 0}
              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 cursor-pointer transition-colors flex items-center gap-1 text-xs font-bold"
              title="पिछला पृष्ठ (Previous Page)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {totalPages > 0 ? (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950/80 border border-white/20 text-xs font-black font-mono">
                <span>Page</span>
                <select
                  value={currentPage}
                  onChange={(e) => scrollToPage(Number(e.target.value))}
                  aria-label="Select PDF Page"
                  className="bg-transparent text-amber-400 font-black focus:outline-none cursor-pointer"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num} className="bg-slate-900 text-white">
                      {num}
                    </option>
                  ))}
                </select>
                <span>/ {totalPages}</span>
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-white/20 text-xs font-black font-mono">
                Page 0 / 0
              </div>
            )}

            <button
              type="button"
              onClick={() => scrollToPage(currentPage + 1)}
              disabled={currentPage >= totalPages || totalPages === 0}
              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 cursor-pointer transition-colors flex items-center gap-1 text-xs font-bold"
              title="अगला पृष्ठ (Next Page)"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Fit Page | Fit Width | Zoom Controls (− 100% + & Reset) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={handleFitToPage}
            className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer transition-all ${
              fitMode === 'fit-page' && zoomPercent === 100
                ? 'bg-orange-500 text-slate-950 shadow-xs'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
            title="पूरा पेज एक स्क्रीन में देखें (Fit Page)"
          >
            <Maximize className="w-3.5 h-3.5" />
            <span>Fit Page</span>
          </button>

          <button
            type="button"
            onClick={handleFitToWidth}
            className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer transition-all ${
              fitMode === 'fit-width' && zoomPercent === 100
                ? 'bg-orange-500 text-slate-950 shadow-xs'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
            title="पूरी चौड़ाई में बड़ा और स्पष्ट देखें (Fit Width)"
          >
            <MoveHorizontal className="w-3.5 h-3.5" />
            <span>Fit Width</span>
          </button>

          {/* Zoom Controls (−  100%  +  Reset) */}
          <div className="flex items-center bg-slate-950/80 rounded-lg p-0.5 border border-white/20">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomPercent <= 50}
              className="px-1.5 py-0.5 rounded hover:bg-white/15 disabled:opacity-40 cursor-pointer text-xs font-black"
              title="ज़ूम आउट (Zoom Out −)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <select
              value={zoomPercent}
              onChange={(e) => setZoomPercent(Number(e.target.value))}
              aria-label="Zoom Percentage"
              className="bg-transparent px-1.5 py-0.5 text-xs font-mono font-black text-amber-400 focus:outline-none cursor-pointer"
            >
              {ZOOM_PRESETS.map((preset) => (
                <option key={preset} value={preset} className="bg-slate-900 text-white">
                  {preset}%
                </option>
              ))}
              {!ZOOM_PRESETS.includes(zoomPercent) && (
                <option value={zoomPercent} className="bg-slate-900 text-white">
                  {zoomPercent}%
                </option>
              )}
            </select>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomPercent >= 300}
              className="px-1.5 py-0.5 rounded hover:bg-white/15 disabled:opacity-40 cursor-pointer text-xs font-black"
              title="ज़ूम इन (Zoom In +)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {zoomPercent !== 100 && (
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-1.5 py-0.5 rounded hover:bg-white/15 text-slate-300 hover:text-white cursor-pointer border-l border-white/15 ml-0.5"
                title="100% रीसेट करें (Reset Zoom)"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Fullscreen, Original PDF Download & External Open */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            title="फ़ुलस्क्रीन (Fullscreen)"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          {onDownloadOriginal && (
            <button
              type="button"
              onClick={onDownloadOriginal}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1 cursor-pointer shadow-xs"
              title="मूल अपलोड PDF डाउनलोड करें (Download Original PDF)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">मूल PDF डाउनलोड</span>
            </button>
          )}

          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold flex items-center gap-1"
            title="नई टैब में खोलें"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 2. PDF VIEWER AREA — Exact available height (viewportHeight - headerHeight - footerHeight), block scroll so zoomed pages never clip on left/right */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-auto p-1.5 sm:p-3 bg-slate-200/90 dark:bg-slate-900"
      >
        {isLoading && (
          <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <div className="space-y-1">
              <p className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">
                RK STUDY CENTRE PDF Study Reader लोड हो रहा है...
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {title || 'RK STUDY CENTRE Official Study Material'}
              </p>
            </div>
          </div>
        )}

        {!isLoading && loadError && (
          <div className="my-12 mx-auto max-w-md w-full p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-amber-400 text-center space-y-4 shadow-lg">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{loadError}</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {onSwitchToInteractiveNotes && (
                <button
                  type="button"
                  onClick={onSwitchToInteractiveNotes}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>इन-ऐप HD नोट्स खोलें</span>
                </button>
              )}
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                <span>सीधे ब्राउज़र में खोलें</span>
              </a>
            </div>
          </div>
        )}

        {!isLoading && !loadError && pdfDoc && totalPages > 0 && (
          <div className="w-fit min-w-full pb-4">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNum) => (
              <PDFPageCanvas
                key={pageNum}
                pdfDoc={pdfDoc}
                pageNumber={pageNum}
                totalPages={totalPages}
                containerWidth={containerSize.width}
                containerHeight={containerSize.height}
                fitMode={fitMode}
                zoomPercent={zoomPercent}
                onPageVisible={setCurrentPage}
              />
            ))}
          </div>
        )}
      </div>

      {/* 3. FOOTER — RK STUDY CENTRE BRANDING (Strictly below PDF viewport, never overlaps content) */}
      <div className="bg-slate-950 text-white px-3 sm:px-5 py-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold shrink-0 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-black text-amber-400 tracking-wide">RK STUDY CENTRE</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-200 truncate">
            OFFICIAL STUDY MATERIAL • बिहार बोर्ड (BSEB)
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-300 shrink-0">
          <span className="hidden sm:inline flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />
            प्रिंस सर (Prince Sir) द्वारा प्रमाणित
          </span>
          {totalPages > 0 && (
            <span className="px-2 py-0.5 rounded bg-white/10 text-amber-300 font-mono font-black">
              Page {currentPage} / {totalPages}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
