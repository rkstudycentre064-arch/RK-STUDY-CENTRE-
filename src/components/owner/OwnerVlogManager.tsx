import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { FormEvent } from 'react';
import {
  Video,
  Plus,
  Edit3,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  ThumbsUp,
  Share2,
  ExternalLink,
  Sparkles,
  Search,
  Filter,
  Layers,
  Save,
  X,
  Play,
  FileText,
  Tag,
  Pin,
  Flame,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Tv,
  Image as ImageIcon,
  Download,
  UploadCloud,
  FileCheck
} from 'lucide-react';
import type { ClassLevel, VlogCategory, VlogPost } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  getAllVlogs,
  createVlog,
  updateVlog,
  deleteVlog,
  toggleVlogPublishStatus,
  extractYouTubeId,
  getYouTubeThumbnailUrl,
  uploadVlogPdfFile,
  formatBytes,
} from '../../services/vlogService';
import { InAppPDFViewerModal, PDFDocumentData } from '../notes/InAppPDFViewerModal';

const CATEGORY_MAP: Record<VlogCategory, { label: string; hindi: string; color: string }> = {
  vlog: { label: 'Vlog (व्लॉग)', hindi: 'लाइव व्लॉग', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  study_tips: { label: 'Study Tips', hindi: 'स्टडी टिप्स व नियम', color: 'bg-teal-50 text-teal-900 border-teal-200' },
  topper_talk: { label: 'Topper Strategy', hindi: 'टॉपर रणनीति', color: 'bg-amber-50 text-amber-900 border-amber-200' },
  motivation: { label: 'Motivation', hindi: 'प्रेरणा व मार्गदर्शन', color: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
  class_update: { label: 'Class Lecture', hindi: 'क्लास व्याख्यान', color: 'bg-blue-50 text-blue-900 border-blue-200' },
  exam_strategy: { label: 'Exam Tips', hindi: 'परीक्षा टिप्स', color: 'bg-purple-50 text-purple-900 border-purple-200' },
  announcement: { label: 'Announcement', hindi: 'महत्वपूर्ण सूचना', color: 'bg-slate-100 text-slate-900 border-slate-300' },
};

const PRESET_BANNER_IMAGES = [
  { label: 'डिजिटल क्लासरूम', url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80' },
  { label: 'स्टडी डेस्क व बुक्स', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80' },
  { label: 'साइंस लैब प्रैक्टिकल', url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80' },
  { label: 'मॉर्निंग स्टडी मोटिवेशन', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80' },
  { label: 'गणित व सूत्र बोर्ड', url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80' },
];

const QUICK_TAG_PRESETS = [
  'BiharBoard2026',
  'MatricTopper',
  'PrinceSirSpecial',
  'Class10Physics',
  'InterScience',
  'StudyRoutine',
  'RapidQuiz',
  'SmartClassVlog',
];

export function OwnerVlogManager() {
  const [vlogs, setVlogs] = useState<VlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [pdfDocToView, setPdfDocToView] = useState<PDFDocumentData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    id: '',
    slug: '',
    title: '',
    hindiTitle: '',
    excerpt: '',
    content: '',
    videoUrl: '',
    coverImageUrl: '',
    category: 'vlog' as VlogCategory,
    classLevel: 'all' as ClassLevel | 'all',
    author: 'Prince Sir (प्रिंस सर)',
    authorRole: 'Founder & Head Educator, RK STUDY CENTRE',
    tagsInput: 'BiharBoard2026, PrinceSir, TopperTips',
    status: 'published' as 'published' | 'draft',
    readTimeMinutes: 5,
    videoDuration: '15:00',
    isPinned: false,
    isFeatured: false,
    // PDF Notes Attachment
    pdfFile: null as File | null,
    pdfUrl: '',
    pdfTitle: '',
    pdfFileName: '',
    pdfFileSize: '',
    hasPdfNotes: false,
  });

  // Load vlogs
  const loadVlogsList = async () => {
    setLoading(true);
    try {
      const list = await getAllVlogs(true); // include drafts
      setVlogs(list);
    } catch (err) {
      console.error('Error fetching vlogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVlogsList();
  }, []);

  const openNewVlogModal = () => {
    setFormData({
      id: '',
      slug: '',
      title: '',
      hindiTitle: '',
      excerpt: '',
      content: `## नए व्लॉग / लेख का शीर्षक 🎥✨\n\nप्रिय विद्यार्थियों,\n\nयहाँ आपका मुख्य संदेश, व्याख्यान अथवा व्लॉग का विवरण विस्तार से लिखें।\n\n### 📌 मुख्य बिंदु:\n* **बिंदु 1**: महत्वपूर्ण नियम अथवा प्रयोग\n* **बिंदु 2**: परीक्षा में पूछे जाने वाले VVI प्रश्न\n* **बिंदु 3**: टॉपर का टाइम टेबल\n\n> "कठिन परिश्रम का कोई विकल्प नहीं होता।" — प्रिंस सर\n\nऑल द बेस्ट! 👍`,
      videoUrl: '',
      coverImageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
      category: 'vlog',
      classLevel: 'all',
      author: 'Prince Sir (प्रिंस सर)',
      authorRole: 'Founder & Head Educator, RK STUDY CENTRE',
      tagsInput: 'BiharBoard2026, PrinceSir, TopperTips',
      status: 'published',
      readTimeMinutes: 5,
      videoDuration: '12:30',
      isPinned: false,
      isFeatured: true,
      pdfFile: null,
      pdfUrl: '',
      pdfTitle: '',
      pdfFileName: '',
      pdfFileSize: '',
      hasPdfNotes: false,
    });
    setIsEditing(false);
    setEditorTab('write');
    setIsModalOpen(true);
  };

  const openEditModal = (vlog: VlogPost) => {
    setFormData({
      id: vlog.id,
      slug: vlog.slug || vlog.id,
      title: vlog.title,
      hindiTitle: vlog.hindiTitle || '',
      excerpt: vlog.excerpt,
      content: vlog.content,
      videoUrl: vlog.videoUrl || '',
      coverImageUrl: vlog.coverImageUrl || '',
      category: vlog.category || 'vlog',
      classLevel: vlog.classLevel || 'all',
      author: vlog.author || 'Prince Sir (प्रिंस सर)',
      authorRole: vlog.authorRole || 'Founder & Head Educator, RK STUDY CENTRE',
      tagsInput: Array.isArray(vlog.tags) ? vlog.tags.join(', ') : '',
      status: vlog.status || 'published',
      readTimeMinutes: vlog.readTimeMinutes || 5,
      videoDuration: vlog.videoDuration || '15:00',
      isPinned: !!vlog.isPinned,
      isFeatured: !!vlog.isFeatured,
      pdfFile: null,
      pdfUrl: vlog.pdfUrl || '',
      pdfTitle: vlog.pdfTitle || '',
      pdfFileName: vlog.pdfFileName || '',
      pdfFileSize: vlog.pdfFileSize || '',
      hasPdfNotes: !!vlog.hasPdfNotes || !!vlog.pdfUrl,
    });
    setIsEditing(true);
    setEditorTab('write');
    setIsModalOpen(true);
  };

  const handlePdfFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        setFeedbackMsg({ text: 'कृपया केवल PDF फ़ाइल ही चुनें (.pdf format only)', type: 'error' });
        return;
      }
      setFormData((prev) => ({
        ...prev,
        pdfFile: file,
        pdfFileName: file.name,
        pdfFileSize: formatBytes(file.size),
        pdfTitle: prev.pdfTitle || `${prev.title || 'अध्ययन'} - PDF नोट्स`,
        hasPdfNotes: true,
      }));
    }
  };

  const handleSaveVlog = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) {
      setFeedbackMsg({ text: 'कृपया व्लॉग/ब्लॉग का शीर्षक अवश्य दर्ज करें।', type: 'error' });
      return;
    }
    if (!formData.excerpt.trim()) {
      setFeedbackMsg({ text: 'कृपया संक्षिप्त सारांश (Excerpt) दर्ज करें।', type: 'error' });
      return;
    }

    setSaving(true);
    setFeedbackMsg(null);

    const tags = formData.tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const detectedYoutubeId = extractYouTubeId(formData.videoUrl);
    let finalCoverImage = formData.coverImageUrl.trim();
    if (!finalCoverImage && detectedYoutubeId) {
      finalCoverImage = getYouTubeThumbnailUrl(detectedYoutubeId, 'maxres');
    }

    // Process PDF file if selected
    let finalPdfUrl = formData.pdfUrl;
    let finalPdfFileName = formData.pdfFileName;
    let finalPdfFileSize = formData.pdfFileSize;
    let finalPdfTitle = formData.pdfTitle.trim() || `${formData.title} - PDF नोट्स`;

    if (formData.pdfFile) {
      try {
        const uploaded = await uploadVlogPdfFile(formData.pdfFile, formData.title);
        finalPdfUrl = uploaded.pdfUrl;
        finalPdfFileName = uploaded.fileName;
        finalPdfFileSize = uploaded.fileSize;
        finalPdfTitle = uploaded.pdfTitle;
      } catch (pdfErr: any) {
        console.warn('PDF upload warning:', pdfErr);
      }
    }

    const hasAttachedPdf = !!(finalPdfUrl || formData.pdfFile || formData.content);

    try {
      if (isEditing && formData.id) {
        await updateVlog(formData.id, {
          title: formData.title.trim(),
          hindiTitle: formData.hindiTitle.trim(),
          excerpt: formData.excerpt.trim(),
          content: formData.content,
          videoUrl: formData.videoUrl.trim(),
          coverImageUrl: finalCoverImage,
          category: formData.category,
          classLevel: formData.classLevel,
          author: formData.author.trim(),
          authorRole: formData.authorRole.trim(),
          tags,
          status: formData.status,
          readTimeMinutes: Number(formData.readTimeMinutes) || 5,
          videoDuration: formData.videoDuration.trim() || undefined,
          isPinned: formData.isPinned,
          isFeatured: formData.isFeatured,
          pdfUrl: finalPdfUrl,
          pdfTitle: finalPdfTitle,
          pdfFileName: finalPdfFileName,
          pdfFileSize: finalPdfFileSize,
          hasPdfNotes: hasAttachedPdf,
        });
        setFeedbackMsg({ text: 'व्लॉग व PDF नोट्स सफलतापूर्वक अपडेट कर दिए गए हैं!', type: 'success' });
      } else {
        await createVlog({
          slug: formData.slug.trim() || undefined,
          title: formData.title.trim(),
          hindiTitle: formData.hindiTitle.trim(),
          excerpt: formData.excerpt.trim(),
          content: formData.content,
          videoUrl: formData.videoUrl.trim(),
          coverImageUrl: finalCoverImage,
          category: formData.category,
          classLevel: formData.classLevel,
          author: formData.author.trim(),
          authorRole: formData.authorRole.trim(),
          tags,
          status: formData.status,
          readTimeMinutes: Number(formData.readTimeMinutes) || 5,
          videoDuration: formData.videoDuration.trim() || undefined,
          isPinned: formData.isPinned,
          isFeatured: formData.isFeatured,
          pdfUrl: finalPdfUrl,
          pdfTitle: finalPdfTitle,
          pdfFileName: finalPdfFileName,
          pdfFileSize: finalPdfFileSize,
          hasPdfNotes: hasAttachedPdf,
        });
        setFeedbackMsg({ text: 'नया व्लॉग व PDF नोट्स सफलतापूर्वक प्रकाशित कर दिए गए हैं!', type: 'success' });
      }

      await loadVlogsList();
      setTimeout(() => {
        setIsModalOpen(false);
        setFeedbackMsg(null);
      }, 1000);
    } catch (err: any) {
      console.error('Error saving vlog:', err);
      setFeedbackMsg({ text: 'सहेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (vlog: VlogPost) => {
    try {
      const nextStatus = await toggleVlogPublishStatus(vlog.id, vlog.status);
      setVlogs((prev) =>
        prev.map((item) => (item.id === vlog.id ? { ...item, status: nextStatus } : item))
      );
    } catch (err) {
      console.error('Error toggling publish status:', err);
    }
  };

  const handleTogglePin = async (vlog: VlogPost) => {
    try {
      const nextPin = !vlog.isPinned;
      await updateVlog(vlog.id, { isPinned: nextPin });
      setVlogs((prev) =>
        prev.map((item) => (item.id === vlog.id ? { ...item, isPinned: nextPin } : item))
      );
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  const [vlogToDelete, setVlogToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeletingVlog, setIsDeletingVlog] = useState(false);

  const handleDelete = (id: string, title: string) => {
    setVlogToDelete({ id, title });
  };

  const handleConfirmDeleteVlog = async () => {
    if (!vlogToDelete) return;
    setIsDeletingVlog(true);
    try {
      await deleteVlog(vlogToDelete.id);
      setVlogs((prev) => prev.filter((item) => item.id !== vlogToDelete.id));
      setVlogToDelete(null);
    } catch (err) {
      console.error('Error deleting vlog:', err);
    } finally {
      setIsDeletingVlog(false);
    }
  };

  // Insert markdown helpers
  const insertFormatting = (prefix: string, suffix = '') => {
    const textarea = document.getElementById('vlog-content-editor') as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end) || 'यहाँ टेक्स्ट लिखें';
    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setFormData((prev) => ({ ...prev, content: newContent }));
  };

  // Filtered vlogs list
  const filteredVlogs = useMemo(() => {
    return vlogs.filter((vlog) => {
      if (statusFilter !== 'all' && vlog.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && vlog.category !== categoryFilter) return false;
      if (classFilter !== 'all' && vlog.classLevel !== classFilter && vlog.classLevel !== 'all') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = vlog.title.toLowerCase().includes(q) || (vlog.hindiTitle && vlog.hindiTitle.toLowerCase().includes(q));
        const matchTag = vlog.tags && vlog.tags.some((t) => t.toLowerCase().includes(q));
        const matchAuthor = vlog.author.toLowerCase().includes(q);
        if (!matchTitle && !matchTag && !matchAuthor) return false;
      }
      return true;
    });
  }, [vlogs, statusFilter, categoryFilter, classFilter, searchQuery]);

  const activeVideoPreviewId = extractYouTubeId(formData.videoUrl);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-pink-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider text-rose-100 border border-white/20">
              <Video className="w-3.5 h-3.5" />
              <span>Owner Media Studio • व्लॉग एवं ब्लॉग प्रकाशन केंद्र</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              व्लॉग, वीडियो लेक्चर्स एवं टॉपर ब्लॉग प्रबंधन
            </h2>
            <p className="text-rose-100 text-sm sm:text-base font-medium leading-relaxed">
              प्रिंस सर द्वारा सीधे नए व्लॉग, यूट्यूब वीडियो लेक्चर्स, मोटिवेशनल पोस्ट और बोर्ड परीक्षा रणनीतियां आसानी से लिखें, थंबनेल सेट करें और 1-क्लिक में प्रकाशित करें।
            </p>
          </div>

          <button
            onClick={openNewVlogModal}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-rose-900 hover:bg-rose-50 font-black text-base shadow-md hover:shadow-xl transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>नया व्लॉग / ब्लॉग लिखें</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-2xl sm:text-3xl font-black text-white">{vlogs.length}</div>
            <div className="text-xs font-bold text-rose-200 mt-0.5">कुल व्लॉग / ब्लॉग</div>
          </div>
          <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-2xl sm:text-3xl font-black text-emerald-300">
              {vlogs.filter((v) => v.status === 'published').length}
            </div>
            <div className="text-xs font-bold text-rose-200 mt-0.5">सक्रिय प्रकाशित</div>
          </div>
          <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              {vlogs.filter((v) => v.status === 'draft').length}
            </div>
            <div className="text-xs font-bold text-rose-200 mt-0.5">ड्राफ्ट (Drafts)</div>
          </div>
          <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-2xl sm:text-3xl font-black text-cyan-300">
              {vlogs.reduce((acc, v) => acc + (v.viewsCount || 0), 0).toLocaleString('en-IN')}
            </div>
            <div className="text-xs font-bold text-rose-200 mt-0.5">कुल दर्शक (Views)</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="शीर्षक, विषय, टैग (#BiharBoard) या लेखक द्वारा खोजें..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-rose-600 focus:ring-2 focus:ring-rose-100 text-sm font-medium transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer focus:border-rose-600 focus:bg-white"
            >
              <option value="all">सभी स्थिति (All Status)</option>
              <option value="published">✅ केवल प्रकाशित (Published)</option>
              <option value="draft">📝 केवल ड्राफ्ट (Draft)</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer focus:border-rose-600 focus:bg-white"
            >
              <option value="all">सभी श्रेणियां (All Categories)</option>
              <option value="vlog">🎥 लाइव व्लॉग (Vlog)</option>
              <option value="topper_talk">🏆 टॉपर रणनीति (Topper Talk)</option>
              <option value="motivation">🔥 मोटिवेशन (Motivation)</option>
              <option value="class_update">📚 क्लास व्याख्यान (Class Lecture)</option>
              <option value="exam_strategy">🎯 परीक्षा रणनीति (Exam Strategy)</option>
              <option value="announcement">📢 महत्वपूर्ण सूचना (Announcement)</option>
            </select>

            {/* Class Filter */}
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer focus:border-rose-600 focus:bg-white"
            >
              <option value="all">सभी कक्षाएं (All Classes)</option>
              <option value="class-9">कक्षा 9वीं</option>
              <option value="class-10">कक्षा 10वीं (मैट्रिक)</option>
              <option value="class-11">कक्षा 11वीं</option>
              <option value="class-12">कक्षा 12वीं (इंटर)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vlogs List */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 font-bold text-sm">व्लॉग एवं वीडियो पोस्ट लोड हो रहे हैं...</p>
        </div>
      ) : filteredVlogs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
          <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-black text-slate-800 mb-1">कोई व्लॉग या पोस्ट नहीं मिला</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
            आपके चुने गए फ़िल्टर के अनुसार कोई परिणाम उपलब्ध नहीं है या अभी तक कोई व्लॉग नहीं लिखा गया है।
          </p>
          <button
            onClick={openNewVlogModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-700 text-white font-bold text-sm hover:bg-rose-800 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>पहला व्लॉग प्रकाशित करें</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVlogs.map((vlog) => {
            const cat = CATEGORY_MAP[vlog.category] || CATEGORY_MAP.vlog;
            return (
              <div
                key={vlog.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail Banner with Video Badge */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={vlog.coverImageUrl || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80'}
                      alt={vlog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                    />

                    {vlog.videoUrl && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-white ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Status & Pin Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-lg backdrop-blur-md border ${
                          vlog.status === 'published'
                            ? 'bg-emerald-600/90 text-white border-emerald-400'
                            : 'bg-amber-500/90 text-slate-950 border-amber-300'
                        }`}
                      >
                        {vlog.status === 'published' ? '✅ प्रकाशित' : '📝 ड्राफ्ट'}
                      </span>
                      {vlog.isPinned && (
                        <span className="text-xs font-black px-2 py-1 rounded-lg bg-indigo-600/90 text-white backdrop-blur-md border border-indigo-400 flex items-center gap-1">
                          <Pin className="w-3 h-3 fill-white" />
                          <span>पिन किया</span>
                        </span>
                      )}
                    </div>

                    {/* Duration / Class Badge */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                      {vlog.videoDuration && (
                        <span className="text-xs font-mono font-black px-2 py-0.5 rounded-md bg-black/80 text-white backdrop-blur-xs">
                          {vlog.videoDuration}
                        </span>
                      )}
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/90 text-slate-900 backdrop-blur-xs">
                        {vlog.classLevel === 'all' || !vlog.classLevel
                          ? 'सभी कक्षाएं'
                          : vlog.classLevel === 'class-10'
                          ? '10वीं मैट्रिक'
                          : vlog.classLevel === 'class-12'
                          ? '12वीं इंटर'
                          : vlog.classLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${cat.color}`}>
                        {cat.hindi}
                      </span>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{vlog.readTimeMinutes || 4} मिनट पठन</span>
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-rose-700 transition-colors">
                      {vlog.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed font-medium">
                      {vlog.excerpt}
                    </p>

                    {/* Tags */}
                    {vlog.tags && vlog.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {vlog.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-bold">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vlog.viewsCount || 0}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vlog.likesCount || 0}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Toggle Pin */}
                    <button
                      onClick={() => handleTogglePin(vlog)}
                      title={vlog.isPinned ? 'पिन हटाएं' : 'शीर्ष पर पिन करें'}
                      className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        vlog.isPinned
                          ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Pin className={`w-3.5 h-3.5 ${vlog.isPinned ? 'fill-indigo-700' : ''}`} />
                    </button>

                    {/* Toggle Publish / Draft */}
                    <button
                      onClick={() => handleTogglePublish(vlog)}
                      title={vlog.status === 'published' ? 'ड्राफ्ट में बदलें' : 'प्रकाशित करें'}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                        vlog.status === 'published'
                          ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      {vlog.status === 'published' ? 'प्रकाशित' : 'ड्राफ्ट'}
                    </button>

                    {/* In-App PDF Viewer Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setPdfDocToView({
                          title: vlog.title,
                          hindiTitle: vlog.hindiTitle,
                          content: vlog.content,
                          fileUrl: vlog.pdfUrl,
                          fileName: vlog.pdfFileName,
                          fileSize: vlog.pdfFileSize,
                          classLevel: vlog.classLevel,
                        })
                      }
                      title="इन-ऐप PDF नोट्स देखें"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-black transition-colors cursor-pointer border border-blue-200"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => openEditModal(vlog)}
                      className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                      title="संपादित करें"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(vlog.id, vlog.title)}
                      className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                      title="हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor & Creator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black">
                    {isEditing ? 'व्लॉग / ब्लॉग संपादित करें' : 'नया व्लॉग / वीडियो ब्लॉग लिखें'}
                  </h3>
                  <p className="text-xs text-rose-200 font-medium">
                    RK STUDY CENTRE • प्रिंस सर पब्लिशिंग डैशबोर्ड
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Editor Tab Switcher */}
                <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setEditorTab('write')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      editorTab === 'write' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    लेखन (Write)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('preview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      editorTab === 'preview' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    लाइव प्रीव्यू (Preview)
                  </button>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {feedbackMsg && (
                <div
                  className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2.5 ${
                    feedbackMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  {feedbackMsg.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span>{feedbackMsg.text}</span>
                </div>
              )}

              {editorTab === 'write' ? (
                <form onSubmit={handleSaveVlog} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                        मुख्य शीर्षक (Title) <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="उदा. RK STUDY CENTRE का नया स्मार्ट डिजिटल क्लासरूम टूर & प्रिंस सर का संदेश"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-rose-600 focus:ring-2 focus:ring-rose-100 font-bold text-base text-slate-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        श्रेणी (Category)
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold text-sm text-slate-800 focus:bg-white focus:border-rose-600"
                      >
                        <option value="vlog">🎥 लाइव व्लॉग (Vlog)</option>
                        <option value="topper_talk">🏆 टॉपर रणनीति (Topper Strategy)</option>
                        <option value="motivation">🔥 मोटिवेशन व प्रेरणा (Motivation)</option>
                        <option value="class_update">📚 क्लास व्याख्यान (Class Lecture)</option>
                        <option value="exam_strategy">🎯 परीक्षा रणनीति व टिप्स (Exam Strategy)</option>
                        <option value="announcement">📢 महत्वपूर्ण सूचना (Announcement)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        लक्षित कक्षा (Target Class)
                      </label>
                      <select
                        value={formData.classLevel}
                        onChange={(e) => setFormData({ ...formData, classLevel: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold text-sm text-slate-800 focus:bg-white focus:border-rose-600"
                      >
                        <option value="all">🌟 सभी कक्षाएं (All Classes)</option>
                        <option value="class-9">कक्षा 9वीं (Class 9)</option>
                        <option value="class-10">कक्षा 10वीं (मैट्रिक बोर्ड)</option>
                        <option value="class-11">कक्षा 11वीं (इंटर 1st Year)</option>
                        <option value="class-12">कक्षा 12वीं (इंटर बोर्ड)</option>
                      </select>
                    </div>
                  </div>

                  {/* PDF Notes Attachment Section */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 space-y-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 text-blue-950 font-black text-sm">
                        <FileText className="w-5 h-5 text-blue-700" />
                        <span>📄 PDF नोट्स एवं अध्ययन सामग्री संलग्न करें (PDF Notes Attachment)</span>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
                        100% ऑफ़लाइन व इन-ऐप डाउनलोड समर्थित
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* PDF File Picker */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          PDF फ़ाइल अपलोड करें (Select PDF Document)
                        </label>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                            formData.pdfFile || formData.pdfFileName
                              ? 'border-emerald-400 bg-emerald-50/60'
                              : 'border-blue-300 hover:border-blue-500 bg-white hover:bg-blue-50/40'
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handlePdfFileSelect}
                            className="hidden"
                          />
                          {formData.pdfFile || formData.pdfFileName ? (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-black">
                                  <FileCheck className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                  <p className="font-bold text-slate-900 text-sm break-all">
                                    {formData.pdfFile?.name || formData.pdfFileName}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    आकार: {formData.pdfFileSize || (formData.pdfFile ? formatBytes(formData.pdfFile.size) : 'PDF Document')} • तैयार है
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPdfDocToView({
                                      title: formData.title || 'PDF नोट्स',
                                      content: formData.content,
                                      fileName: formData.pdfFileName,
                                      fileSize: formData.pdfFileSize,
                                      classLevel: formData.classLevel,
                                    });
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
                                >
                                  जांचें (Preview)
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFormData((prev) => ({
                                      ...prev,
                                      pdfFile: null,
                                      pdfUrl: '',
                                      pdfFileName: '',
                                      pdfFileSize: '',
                                      hasPdfNotes: false,
                                    }));
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                  }}
                                  className="text-xs font-bold text-rose-600 hover:text-rose-700 underline px-2 py-1"
                                >
                                  हटाएं
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5 py-2">
                              <UploadCloud className="w-8 h-8 text-blue-600 mx-auto" />
                              <p className="text-sm font-bold text-slate-800">
                                डिवाइस से PDF फ़ाइल चुनें (Click to browse PDF)
                              </p>
                              <p className="text-xs text-slate-500">
                                हस्तलिखित नोट्स, चैप्टर असाइनमेंट या फॉर्मूला शीट संलग्न करें
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* PDF Custom Display Title */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          PDF नोट्स का शीर्षक (PDF Display Title)
                        </label>
                        <input
                          type="text"
                          value={formData.pdfTitle}
                          onChange={(e) => setFormData({ ...formData, pdfTitle: e.target.value })}
                          placeholder="उदा. क्लास 10 भौतिकी चैप्टर 1 विस्तृत नोट्स (PDF)"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-800 focus:border-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Video & Media Info (Optional) */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
                        <Tv className="w-4 h-4 text-slate-600" />
                        <span>वैकल्पिक वीडियो लिंक (Optional Video / YouTube Link)</span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">(यदि वीडियो नहीं है तो खाली छोड़ें)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700">
                          यूट्यूब / वीडियो URL (वैकल्पिक)
                        </label>
                        <input
                          type="text"
                          value={formData.videoUrl}
                          onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                          placeholder="उदा. https://www.youtube.com/watch?v=... (वैकल्पिक)"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-sm text-slate-800 focus:border-rose-600"
                        />
                        {activeVideoPreviewId && (
                          <div className="text-xs text-emerald-800 font-bold flex items-center gap-1.5 mt-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>YouTube Video ID सत्यापित: {activeVideoPreviewId}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          वीडियो अवधि (Video Duration)
                        </label>
                        <input
                          type="text"
                          value={formData.videoDuration}
                          onChange={(e) => setFormData({ ...formData, videoDuration: e.target.value })}
                          placeholder="उदा. 14:20 या 8 मिनट"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                          पठन समय (Read Time Minutes)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={formData.readTimeMinutes}
                          onChange={(e) => setFormData({ ...formData, readTimeMinutes: Number(e.target.value) })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail / Cover Image Presets */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                      कवर / थंबनेल इमेज (Cover Image URL)
                    </label>
                    <input
                      type="text"
                      value={formData.coverImageUrl}
                      onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/... या यूट्यूब थंबनेल स्वचालित उपयोग होगा"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-mono text-sm text-slate-800 focus:bg-white"
                    />

                    {/* Presets Chips */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>सुझाए गए बैनर:</span>
                      </span>
                      {PRESET_BANNER_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, coverImageUrl: preset.url })}
                          className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                      संक्षिप्त सारांश (Excerpt) <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="व्लॉग अथवा लेख का 2 पंक्तियों में मुख्य आकर्षण जो विद्यार्थियों को आकर्षित करे..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-sm font-medium text-slate-800"
                    />
                  </div>

                  {/* Rich Content Editor with Formatting Helpers */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                        संपूर्ण लेख / व्लॉग विवरण (Detailed Content & Notes)
                      </label>
                      <span className="text-xs text-slate-400 font-medium">मार्कडाउन व टेक्स्ट समर्थित</span>
                    </div>

                    {/* Formatting Toolbar */}
                    <div className="flex items-center gap-1.5 p-2 bg-slate-100 rounded-xl border border-slate-200 flex-wrap">
                      <button
                        type="button"
                        onClick={() => insertFormatting('### ')}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-200 text-xs font-black text-slate-800 border border-slate-300 cursor-pointer"
                      >
                        H3 शीर्षक
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('**', '**')}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-200 text-xs font-black text-slate-800 border border-slate-300 cursor-pointer"
                      >
                        B बोल्ड
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('* ')}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-200 text-xs font-black text-slate-800 border border-slate-300 cursor-pointer"
                      >
                        • बुलेट बिंदु
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('> ')}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-200 text-xs font-black text-slate-800 border border-slate-300 cursor-pointer"
                      >
                        ❝ कोटेशन
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('1. ')}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-200 text-xs font-black text-slate-800 border border-slate-300 cursor-pointer"
                      >
                        1. संख्या सूची
                      </button>
                    </div>

                    <textarea
                      id="vlog-content-editor"
                      rows={9}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="यहाँ अपना संपूर्ण ब्लॉग, व्लॉग की मुख्य बातें, फॉर्मूला या संदेश विस्तार से लिखें..."
                      className="w-full p-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-sm font-mono text-slate-900 leading-relaxed"
                    />
                  </div>

                  {/* Tags & Author */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        टैग्स (Tags - अल्पविराम द्वारा अलग करें)
                      </label>
                      <input
                        type="text"
                        value={formData.tagsInput}
                        onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                        placeholder="BiharBoard, Matric2026, PrinceSir"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-medium"
                      />
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {QUICK_TAG_PRESETS.slice(0, 4).map((tag, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              const curr = formData.tagsInput ? formData.tagsInput + ', ' + tag : tag;
                              setFormData({ ...formData, tagsInput: curr });
                            }}
                            className="text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded cursor-pointer"
                          >
                            +{tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        लेखक / वक्ता (Author)
                      </label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Publication Settings */}
                  <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.isPinned}
                          onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                        />
                        <span className="text-xs font-bold text-slate-800">📌 शीर्ष पर पिन करें</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                        />
                        <span className="text-xs font-bold text-slate-800">🔥 फीचर्ड हीरो व्लॉग</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-600">स्थिति:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            status: formData.status === 'published' ? 'draft' : 'published',
                          })
                        }
                        className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          formData.status === 'published'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-amber-400 text-slate-950 shadow-xs'
                        }`}
                      >
                        {formData.status === 'published' ? '✅ प्रकाशित होगा' : '📝 ड्राफ्ट रहेगा'}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* Live Preview Tab */
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium">
                    🔍 यह प्रीव्यू प्रदर्शित करता है कि विद्यार्थी आपके व्लॉग को वेबसाइट पर कैसा देखेंगे:
                  </div>

                  {/* Video Player Preview */}
                  {activeVideoPreviewId ? (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${activeVideoPreviewId}?autoplay=0&rel=0`}
                        title={formData.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-900 relative">
                      <img
                        src={formData.coverImageUrl || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80'}
                        alt={formData.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Title & Metadata */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-rose-100 text-rose-800">
                        {CATEGORY_MAP[formData.category]?.hindi || 'व्लॉग'}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        कक्षा: {formData.classLevel === 'all' ? 'सभी कक्षाएं' : formData.classLevel}
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                      {formData.title || 'व्लॉग का शीर्षक'}
                    </h1>

                    <div className="p-4 rounded-2xl bg-slate-100 text-slate-700 text-sm font-medium leading-relaxed border-l-4 border-rose-600">
                      {formData.excerpt || 'संक्षिप्त विवरण यहाँ प्रदर्शित होगा।'}
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="prose prose-slate max-w-none p-5 bg-white rounded-2xl border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {formData.content}
                  </div>

                  {/* Author Card */}
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-lg">
                      PS
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{formData.author}</h4>
                      <p className="text-xs text-rose-800 font-medium">{formData.authorRole}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                रद्द करें
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, status: 'draft' });
                    setTimeout(() => handleSaveVlog(), 50);
                  }}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  ड्राफ्ट सहेजें
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, status: 'published' });
                    setTimeout(() => handleSaveVlog(), 50);
                  }}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-sm font-black bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'सहेजा जा रहा है...' : 'तुरंत प्रकाशित करें'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App PDF Viewer Modal */}
      <InAppPDFViewerModal
        isOpen={!!pdfDocToView}
        document={pdfDocToView}
        onClose={() => setPdfDocToView(null)}
      />

      {/* Delete Vlog Confirmation Modal */}
      <ConfirmModal
        isOpen={!!vlogToDelete}
        onClose={() => setVlogToDelete(null)}
        onConfirm={handleConfirmDeleteVlog}
        title="व्लॉग/ब्लॉग हटाएँ (Delete Post)"
        message={`क्या आप वाकई "${vlogToDelete?.title}" को हटाना चाहते हैं? यह पोस्ट पोर्टल से हटा दी जाएगी।`}
        confirmText="हाँ, हटाएँ (Delete)"
        cancelText="रद्द करें"
        variant="danger"
        isLoading={isDeletingVlog}
        loadingText="हटाया जा रहा है..."
      />
    </div>
  );
}
