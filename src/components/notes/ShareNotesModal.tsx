import { useState, useMemo } from 'react';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  X,
  Sparkles,
  QrCode,
  MessageCircle,
  Smartphone,
  BookOpen,
} from 'lucide-react';

export interface ShareNotesData {
  title: string;
  subjectName?: string;
  chapterTitle?: string;
  classLevel?: string;
  noteId?: string;
  chapterSlug?: string;
  subjectSlug?: string;
  bookSlug?: string;
  customShareUrl?: string;
  description?: string;
  highlights?: string[];
}

interface ShareNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareNotesData;
}

export function ShareNotesModal({ isOpen, onClose, data }: ShareNotesModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedForInstagram, setCopiedForInstagram] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  // Compute shareable URL
  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    if (data.customShareUrl) return data.customShareUrl;

    const origin = window.location.origin;
    const pathname = window.location.pathname.replace(/\/$/, '');

    // Form friendly hash deep-link
    if (data.noteId) {
      return `${origin}${pathname}/#notes/${data.noteId}`;
    }
    if (data.chapterSlug) {
      const cls = data.classLevel?.toLowerCase().includes('10')
        ? 'class-10'
        : data.classLevel?.toLowerCase().includes('12')
        ? 'class-12'
        : data.classLevel?.toLowerCase().includes('11')
        ? 'class-11'
        : 'class-9';
      const sub = data.subjectSlug || 'c10-sci';
      const book = data.bookSlug || 'b-c10-sci-physics';
      return `${origin}${pathname}/#classes/${cls}/${sub}/${book}/${data.chapterSlug}`;
    }

    // Default to current window url
    return window.location.href;
  }, [data]);

  // Formatted share message for WhatsApp & Facebook
  const shareMessage = useMemo(() => {
    const subject = data.subjectName || 'विज्ञान (Science)';
    const chapter = data.chapterTitle || data.title;
    const classLevel = data.classLevel || 'कक्षा 10 (Class 10)';

    return `📚 *RK STUDY CENTRE - बिहार बोर्ड टॉपर हस्तलिखित नोट्स* 🎓

📖 *कक्षा एवं विषय:* ${classLevel} • ${subject}
📝 *अध्याय:* ${chapter}

✨ *नोट्स की प्रमुख विशेषताएं:*
✅ बड़े अक्षर शैली (Mobile Friendly Big Letter Reading)
✅ 100% सिलेबस कवर हस्तलिखित थ्योरी नोट्स (By Prince Sir)
✅ VVI वस्तुनिष्ठ एवं दीर्घ उत्तरीय महत्वपूर्ण प्रश्नोत्तर
✅ फ्री लाइव ऑनलाइन टेस्ट, क्विज़ एवं तुरंत स्कोरकार्ड

👇 *अभी तुरंत नोट्स पढ़ें और टेस्ट दें:*
${shareUrl}

🚀 *अपने सभी दोस्तों और सहपाठियों के साथ शेयर करें!* 📖🎯`;
  }, [data, shareUrl]);

  // Short message for Instagram / Direct Messages
  const instagramCaption = useMemo(() => {
    const chapter = data.chapterTitle || data.title;
    const subject = data.subjectName || 'Science';
    return `🔥 Bihar Board Topper Handwritten Notes: ${chapter} (${subject}) 📖✨\n\nRead full Big-Letter notes & practice online MCQs here:\n🔗 ${shareUrl}\n\n#BiharBoard #Matric2026 #RKStudyCentre #TopperNotes #${subject.replace(/\s+/g, '')}`;
  }, [data, shareUrl]);

  if (!isOpen) return null;

  // Handlers
  const handleCopyLinkOnly = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleCopyFullMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch (e) {
      console.error('Failed to copy message', e);
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleInstagramShare = async () => {
    // Copy caption with link to clipboard
    try {
      await navigator.clipboard.writeText(instagramCaption);
      setCopiedForInstagram(true);
      setTimeout(() => setCopiedForInstagram(false), 3000);
    } catch (e) {
      console.error('Instagram copy failed', e);
    }

    // If Web Share API is available (especially on mobile), trigger native share which allows Instagram Stories/DMs directly
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: instagramCaption,
          url: shareUrl,
        });
      } catch (err) {
        // Fallback open Instagram in new tab
        window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
      }
    } else {
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    }
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleNativeDeviceShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `RK Study Centre - ${data.title}`,
          text: shareMessage,
          url: shareUrl,
        });
      } catch (e) {
        console.log('Share canceled or error', e);
      }
    } else {
      handleCopyLinkOnly();
    }
  };

  return (
    <div
      id="share-notes-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="share-notes-modal-container"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white p-5 sm:p-6 shrink-0 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-slate-950 fill-slate-950" />
                  शेयर नोट्स (Share Notes)
                </span>
                {data.classLevel && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white/90 border border-white/20">
                    {data.classLevel}
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {data.title}
              </h3>
              <p className="text-blue-200 text-xs sm:text-sm font-medium">
                {data.subjectName ? `${data.subjectName} • ` : ''}व्हाट्सएप, इंस्टाग्राम, फेसबुक या डायरेक्ट लिंक द्वारा सहपाठियों के साथ साझा करें।
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Main 4 Social Share Buttons Grid */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-blue-600" />
              <span>सोशल मीडिया पर शेयर करें (Social Share):</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* WhatsApp Button */}
              <button
                type="button"
                id="btn-share-whatsapp"
                onClick={handleWhatsAppShare}
                className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-sm shadow-md transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  {/* WhatsApp SVG Icon */}
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086.159.058 1.011.477 1.184.564.173.087.289.13.332.203.043.072.043.419-.101.824z" />
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.977-1.398A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.182a8.13 8.13 0 01-4.398-1.282l-.315-.192-2.956.83.844-2.879-.209-.332A8.139 8.139 0 013.818 12c0-4.512 3.67-8.182 8.182-8.182 4.511 0 8.182 3.67 8.182 8.182 0 4.511-3.671 8.182-8.182 8.182z" />
                  </svg>
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xs opacity-90 font-medium">व्हाट्सएप पर भेजें</div>
                  <div className="text-sm font-black">WhatsApp Share</div>
                </div>
              </button>

              {/* Instagram Button */}
              <button
                type="button"
                id="btn-share-instagram"
                onClick={handleInstagramShare}
                className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 active:scale-95 text-white font-black text-sm shadow-md transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  {/* Instagram SVG Icon */}
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xs opacity-90 font-medium">
                    {copiedForInstagram ? 'कैप्शन कॉपी हुआ!' : 'स्टोरी / DM'}
                  </div>
                  <div className="text-sm font-black">Instagram</div>
                </div>
              </button>

              {/* Facebook Button */}
              <button
                type="button"
                id="btn-share-facebook"
                onClick={handleFacebookShare}
                className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-sm shadow-md transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  {/* Facebook SVG Icon */}
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.7 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z" />
                  </svg>
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xs opacity-90 font-medium">फेसबुक पर पोस्ट</div>
                  <div className="text-sm font-black">Facebook Share</div>
                </div>
              </button>

              {/* Telegram / More Options */}
              <button
                type="button"
                id="btn-share-telegram"
                onClick={handleTelegramShare}
                className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-black text-sm shadow-md transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  {/* Telegram SVG Icon */}
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.196 1.006.128.832.942z" />
                  </svg>
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xs opacity-90 font-medium">टेलीग्राम पर भेजें</div>
                  <div className="text-sm font-black">Telegram Share</div>
                </div>
              </button>
            </div>

            {/* Native Device Share Sheet Button (if available) */}
            {typeof navigator !== 'undefined' && (
              <button
                type="button"
                onClick={handleNativeDeviceShare}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-300 shadow-xs"
              >
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>फोन के अन्य ऐप्स (All Apps Share Menu) में भेजें</span>
              </button>
            )}
          </div>

          {/* Direct Share Link Section (Active Link Creator) */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5 text-blue-600" />
                नोट्स का डायरेक्ट शेयर लिंक (Notes Share Link):
              </span>
              {copiedLink && (
                <span className="text-emerald-600 font-black text-xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> लिंक कॉपी हो गया!
                </span>
              )}
            </label>

            <div className="flex items-stretch gap-2 bg-slate-50 p-1.5 rounded-2xl border-2 border-slate-200 focus-within:border-blue-500 transition-colors">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm font-mono text-slate-800 focus:outline-hidden select-all"
              />
              <button
                type="button"
                id="btn-copy-share-link"
                onClick={handleCopyLinkOnly}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                }`}
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'कॉपी हो गया' : 'लिंक कॉपी करें'}</span>
              </button>
            </div>
          </div>

          {/* Formatted Message Preview & 1-Click Copy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                तैयार किया गया शेयर संदेश (Share Message Preview):
              </label>
              <button
                type="button"
                onClick={handleCopyFullMessage}
                className="text-xs font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMessage ? 'पूरा संदेश कॉपी हुआ!' : 'पूरा संदेश कॉपी करें'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto font-sans">
              {shareMessage}
            </div>
          </div>

          {/* QR Code Toggle for In-Person / Classroom Sharing */}
          <div className="border-t border-slate-200 pt-4 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setShowQrCode(!showQrCode)}
              className="text-xs font-black text-slate-600 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer py-1 px-3 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>{showQrCode ? 'QR कोड छिपाएं' : 'क्लासरूम / ऑफलाइन स्कैन के लिए QR कोड देखें'}</span>
            </button>

            {showQrCode && (
              <div className="mt-4 p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-48 h-48 mx-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center">
                  {/* Google Chart API QR Generator using dynamic share URL */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}&format=svg`}
                    alt="Notes Share QR Code"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-800">
                    अपने फोन कैमरे से QR कोड स्कैन करें
                  </p>
                  <p className="text-2xs text-slate-500">
                    स्कैन करते ही यह नोट्स सीधे मोबाइल में खुल जाएंगे।
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">बिहार बोर्ड के सभी छात्रों के लिए 100% फ्री अध्ययन मंच</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs sm:text-sm font-black transition-colors cursor-pointer"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
}
