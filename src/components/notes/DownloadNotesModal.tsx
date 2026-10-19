import React from 'react';
import {
  Printer,
  X,
  HardDrive,
  Smartphone,
  Download,
  Palette,
  FileCode,
  Sparkles,
} from 'lucide-react';
import {
  ChapterNotesExportData,
  downloadColorPDFNotes,
  downloadNotesAsHTMLFile,
} from '../../utils/downloadNotesHelper';

interface DownloadNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ChapterNotesExportData;
}

export function DownloadNotesModal({ isOpen, onClose, data }: DownloadNotesModalProps) {
  if (!isOpen) return null;

  const meta = data.metadata || {};
  const chapterNum = meta.chapterNumber || 1;
  const chapterTitle = meta.chapterHindiTitle || meta.chapterTitle || 'नोट्स';
  const subject = meta.subjectName || 'विज्ञान / हिंदी';

  const handleDownloadOfflineFile = () => {
    downloadNotesAsHTMLFile(data);
  };

  const handleSaveAsPDF = () => {
    downloadColorPDFNotes(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Navy & Orange styling */}
        <div className="bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#0B192C] p-6 text-white relative border-b-4 border-orange-500">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-400 text-slate-950 rounded-2xl shadow-md">
              <Download className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-300">
                RK STUDY CENTRE • डाउनलोड केंद्र
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                नोट्स डाउनलोड करें
              </h2>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-orange-200 font-bold flex-wrap gap-2">
            <span>अध्याय {chapterNum}: {chapterTitle}</span>
            <span className="bg-orange-600/80 px-2.5 py-1 rounded-full text-white font-extrabold border border-orange-400/40">
              {subject}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 bg-slate-50">
          {/* Card 1: Vector PDF (Save as PDF • 400% Sharp) */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-white border-2 border-blue-400 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600 shrink-0" />
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  वेक्टर PDF के रूप में सहेजें (A4 Print / Save as PDF)
                </h3>
              </div>
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                400% ज़ूम शार्प
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              100% <strong>वेक्टर टेक्स्ट</strong>, सेलेक्टेबल एवं सर्च योग्य हिंदी-अंग्रेज़ी फॉन्ट, गणितीय सूत्र और आधिकारिक <strong>RK STUDY CENTRE</strong> लोगो। 400% ज़ूम पर भी बिल्कुल क्रिस्टल क्लियर!
            </p>

            <button
              type="button"
              id="btn-save-pdf-main"
              onClick={handleSaveAsPDF}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 hover:from-blue-800 hover:to-black active:scale-[0.98] text-white rounded-xl text-sm font-black flex items-center justify-center gap-2.5 shadow-md shadow-blue-900/20 transition-all cursor-pointer border border-blue-700/40"
            >
              <Printer className="w-5 h-5 text-amber-400" />
              <span>A4 वेक्टर PDF सहेजें (Print / Save as PDF)</span>
            </button>
          </div>

          {/* Card 2: Direct File Manager Offline Download */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-white border-2 border-orange-300 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-orange-600 shrink-0" />
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  फ़ोन के File Manager में ऑफ़लाइन सेव करें
                </h3>
              </div>
              <span className="bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                ऑफ़लाइन बैकअप
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              यह फ़ाइल सीधे आपके मोबाइल के <strong>Downloads / File Manager</strong> में सेव हो जाएगी। इसे बिना इंटरनेट के कभी भी खोलें — संपूर्ण रंगीन बुकलेट के साथ खुलेगी!
            </p>

            <button
              type="button"
              id="btn-download-filemanager"
              onClick={handleDownloadOfflineFile}
              className="w-full py-3 px-5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 active:scale-[0.98] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>फ़ाइल डाउनलोड करें (File Manager में सेव)</span>
            </button>
          </div>

          {/* Offline Tip */}
          <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
            <Smartphone className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <span>
              <strong>टिप:</strong> डाउनलोड होने के बाद अपने मोबाइल का <strong>File Manager</strong> खोलें और <strong>Downloads</strong> फ़ोल्डर में जाकर फ़ाइल पर टैप करें। यह पूरी रंगीन बुकलेट के साथ खुलेगी!
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-white p-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-slate-400" />
            <span>RK STUDY CENTRE • ऑफ़लाइन सुरक्षित</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-black cursor-pointer transition-colors"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
}
