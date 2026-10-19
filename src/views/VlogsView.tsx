import { useState, useEffect, useMemo } from 'react';
import type { FormEvent } from 'react';
import {
  Video,
  Play,
  Eye,
  ThumbsUp,
  Share2,
  Clock,
  Calendar,
  Search,
  Filter,
  ArrowRight,
  Pin,
  Sparkles,
  Flame,
  BookOpen,
  CheckCircle2,
  MessageSquare,
  Send,
  User,
  GraduationCap,
  ChevronLeft,
  X,
  ExternalLink,
  Check,
  FileText,
  Download
} from 'lucide-react';
import type { MainNavRoute, ClassLevel, VlogCategory, VlogPost, VlogComment } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  getAllVlogs,
  getVlogByIdOrSlug,
  incrementVlogView,
  toggleVlogLike,
  isVlogLiked,
  getVlogComments,
  addVlogComment,
  extractYouTubeId,
} from '../services/vlogService';
import { InAppPDFViewerModal, PDFDocumentData } from '../components/notes/InAppPDFViewerModal';

const CATEGORIES: { id: VlogCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'सभी व्लॉग & पोस्ट', icon: '🌟' },
  { id: 'vlog', label: 'लाइव व्लॉग (Vlogs)', icon: '🎥' },
  { id: 'topper_talk', label: 'टॉपर रणनीति', icon: '🏆' },
  { id: 'motivation', label: 'मोटिवेशन व मार्गदर्शन', icon: '🔥' },
  { id: 'class_update', label: 'क्लास व्याख्यान', icon: '📚' },
  { id: 'exam_strategy', label: 'परीक्षा टिप्स', icon: '🎯' },
  { id: 'announcement', label: 'महत्वपूर्ण सूचना', icon: '📢' },
];

interface VlogsViewProps {
  initialVlogSlug?: string;
  onNavigate: (route: MainNavRoute, params?: { classLevel?: ClassLevel }) => void;
}

export function VlogsView({ initialVlogSlug, onNavigate }: VlogsViewProps) {
  const { user, isOwner } = useAuth();
  const [vlogs, setVlogs] = useState<VlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<VlogCategory | 'all'>('all');
  const [activeClass, setActiveClass] = useState<ClassLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Single Active Vlog modal
  const [selectedVlog, setSelectedVlog] = useState<VlogPost | null>(null);
  const [comments, setComments] = useState<VlogComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [pdfDocToView, setPdfDocToView] = useState<PDFDocumentData | null>(null);

  // Load published vlogs
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const list = await getAllVlogs(false); // only published
        setVlogs(list);

        if (initialVlogSlug) {
          const matched = list.find((v) => v.slug === initialVlogSlug || v.id === initialVlogSlug);
          if (matched) {
            handleOpenVlog(matched);
          }
        }
      } catch (err) {
        console.error('Failed to load vlogs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initialVlogSlug]);

  const handleOpenVlog = async (vlog: VlogPost) => {
    setSelectedVlog(vlog);
    setIsLiked(isVlogLiked(vlog.id));
    incrementVlogView(vlog.id);

    // Update local views
    setVlogs((prev) =>
      prev.map((v) => (v.id === vlog.id ? { ...v, viewsCount: (v.viewsCount || 0) + 1 } : v))
    );

    const comms = await getVlogComments(vlog.id);
    setComments(comms);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleLike = async () => {
    if (!selectedVlog) return;
    const res = await toggleVlogLike(selectedVlog.id);
    setIsLiked(res.isLiked);
    setSelectedVlog((prev) => (prev ? { ...prev, likesCount: res.newCount } : null));
    setVlogs((prev) =>
      prev.map((v) => (v.id === selectedVlog.id ? { ...v, likesCount: res.newCount } : v))
    );
  };

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedVlog || !newCommentText.trim()) return;

    const authorName = user?.displayName || (isOwner ? 'प्रिंस सर (RK STUDY CENTRE)' : 'विद्यार्थी (छात्र)');
    const role = isOwner ? 'owner' : user ? 'student' : 'guest';

    const newCom = await addVlogComment(
      selectedVlog.id,
      authorName,
      newCommentText,
      role,
      user?.uid
    );

    setComments((prev) => [newCom, ...prev]);
    setNewCommentText('');
    setSelectedVlog((prev) =>
      prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : null
    );
  };

  const handleShareVlog = (vlog: VlogPost) => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/#vlogs/${vlog.slug || vlog.id}` : '';
    if (navigator.share) {
      navigator.share({
        title: vlog.title,
        text: `${vlog.title} - RK STUDY CENTRE व्लॉग एवं टॉपर गाइड By Prince Sir`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  // Filtered Vlogs
  const filteredVlogs = useMemo(() => {
    return vlogs.filter((vlog) => {
      if (activeCategory !== 'all' && vlog.category !== activeCategory) return false;
      if (activeClass !== 'all' && vlog.classLevel !== activeClass && vlog.classLevel !== 'all') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = vlog.title.toLowerCase().includes(q) || (vlog.hindiTitle && vlog.hindiTitle.toLowerCase().includes(q));
        const matchExcerpt = vlog.excerpt.toLowerCase().includes(q);
        const matchTag = vlog.tags && vlog.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchExcerpt && !matchTag) return false;
      }
      return true;
    });
  }, [vlogs, activeCategory, activeClass, searchQuery]);

  // Featured Hero Vlog (First pinned or first item)
  const heroVlog = useMemo(() => {
    return vlogs.find((v) => v.isPinned || v.isFeatured) || vlogs[0] || null;
  }, [vlogs]);

  return (
    <div className="space-y-12 py-4 sm:py-8">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-rose-700 via-pink-800 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs sm:text-sm font-black uppercase tracking-wider text-rose-100 border border-white/20">
            <Video className="w-4 h-4" />
            <span>RK STUDY CENTRE • व्लॉग, वीडियो लेक्चर्स & टॉपर वार्ता</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            प्रिंस सर के व्लॉग, लाइव प्रयोग एवं टॉपर रणनीति
          </h1>

          <p className="text-rose-100 text-base sm:text-lg font-medium leading-relaxed">
            डिजिटल क्लासरूम के नए अपडेट्स, साइंस लैबोरेटरी के जीवंत प्रयोग, मैट्रिक और इंटर परीक्षा में 450+ अंक प्राप्त करने की अचूक तकनीकें और दैनिक मोटिवेशन।
          </p>

          {isOwner && (
            <div className="pt-2">
              <button
                onClick={() => {
                  window.location.hash = 'owner/vlogs';
                  onNavigate('owner');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-rose-900 font-black text-sm hover:bg-rose-50 transition-all shadow-md cursor-pointer"
              >
                <span>व्लॉग लिखें व प्रबंधित करें (Owner Studio) →</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Featured Hero Showcase (When not viewing a specific modal) */}
      {!selectedVlog && heroVlog && (
        <section className="bg-white rounded-3xl border-2 border-rose-100 shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Video / Thumbnail Player */}
            <div className="lg:col-span-7 bg-slate-950 relative aspect-video flex items-center justify-center group overflow-hidden">
              <img
                src={heroVlog.coverImageUrl || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80'}
                alt={heroVlog.title}
                className="w-full h-full object-cover opacity-85 group-hover:opacity-95 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

              <button
                onClick={() => handleOpenVlog(heroVlog)}
                className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform cursor-pointer"
              >
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
              </button>

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-black shadow-md flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-white" />
                  <span>फीचर्ड व्लॉग</span>
                </span>
                {heroVlog.isPinned && (
                  <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-md flex items-center gap-1">
                    <Pin className="w-3.5 h-3.5 fill-white" />
                    <span>पिन किया गया</span>
                  </span>
                )}
              </div>

              {heroVlog.videoDuration && (
                <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-lg bg-black/80 text-white font-mono text-xs font-black backdrop-blur-xs">
                  {heroVlog.videoDuration}
                </div>
              )}
            </div>

            {/* Description & Action */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <span className="text-rose-700 font-extrabold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                    {heroVlog.category === 'vlog' ? '🎥 क्लासरूम व्लॉग' : '🏆 टॉपर गाइड'}
                  </span>
                  <span>•</span>
                  <span>{heroVlog.readTimeMinutes || 4} मिनट पठन</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{heroVlog.viewsCount || 0} व्यूज</span>
                  </span>
                </div>

                <h2
                  onClick={() => handleOpenVlog(heroVlog)}
                  className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight hover:text-rose-700 transition-colors cursor-pointer"
                >
                  {heroVlog.title}
                </h2>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium line-clamp-4">
                  {heroVlog.excerpt}
                </p>

                {heroVlog.tags && heroVlog.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {(heroVlog.tags || []).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-700 text-white flex items-center justify-center font-black text-sm">
                    PS
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">{heroVlog.author}</div>
                    <div className="text-[11px] text-slate-500 font-semibold">RK STUDY CENTRE</div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenVlog(heroVlog)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-black text-sm transition-all shadow-md cursor-pointer"
                >
                  <span>पूरा देखें व पढ़ें</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories & Class Navigation Filters */}
      <section className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {(CATEGORIES || []).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                activeCategory === cat.id
                  ? 'bg-rose-700 text-white border-rose-700 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Class Filter & Search Row */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider pl-1">
              कक्षा:
            </span>
            {(['all', 'class-9', 'class-10', 'class-11', 'class-12'] as const).map((cls) => {
              const label =
                cls === 'all'
                  ? 'सभी'
                  : cls === 'class-9'
                  ? '9वीं'
                  : cls === 'class-10'
                  ? '10वीं मैट्रिक'
                  : cls === 'class-11'
                  ? '11वीं'
                  : '12वीं इंटर';
              return (
                <button
                  key={cls}
                  onClick={() => setActiveClass(cls)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                    activeClass === cls
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="व्लॉग व टॉपिक खोजें..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-rose-600"
            />
          </div>
        </div>
      </section>

      {/* Grid of Vlogs & Blogs */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-bold text-base">व्लॉग एवं वीडियो पोस्ट लोड हो रहे हैं...</p>
        </div>
      ) : filteredVlogs.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-4">
          <Video className="w-14 h-14 text-slate-300 mx-auto" />
          <h3 className="text-xl font-black text-slate-800">कोई व्लॉग या लेख नहीं मिला</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            कृपया अन्य श्रेणी या खोज शब्द चुनें।
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setActiveClass('all');
              setSearchQuery('');
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors cursor-pointer"
          >
            सभी व्लॉग देखें
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {(filteredVlogs || []).map((vlog) => {
            const isYt = !!extractYouTubeId(vlog.videoUrl);
            return (
              <div
                key={vlog.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                onClick={() => handleOpenVlog(vlog)}
              >
                <div>
                  {/* Thumbnail Banner */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={vlog.coverImageUrl || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80'}
                      alt={vlog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />

                    {vlog.videoUrl && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-white ml-0.5" />
                        </div>
                      </div>
                    )}

                    {vlog.isPinned && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-indigo-600/90 text-white text-[11px] font-black backdrop-blur-xs flex items-center gap-1">
                        <Pin className="w-3 h-3 fill-white" />
                        <span>पिन</span>
                      </div>
                    )}

                    {vlog.videoDuration && (
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/80 text-white font-mono text-[11px] font-black">
                        {vlog.videoDuration}
                      </div>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-500">
                      <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full font-extrabold">
                        {vlog.category === 'vlog'
                          ? 'व्लॉग'
                          : vlog.category === 'topper_talk'
                          ? 'टॉपर रणनीति'
                          : vlog.category === 'motivation'
                          ? 'मोटिवेशन'
                          : 'क्लास व्याख्यान'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{vlog.readTimeMinutes || 4} मिनट</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 group-hover:text-rose-700 transition-colors leading-snug line-clamp-2">
                      {vlog.title}
                    </h3>

                    <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed font-medium">
                      {vlog.excerpt}
                    </p>

                    {vlog.tags && vlog.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {(vlog.tags || []).slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vlog.viewsCount || 0}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vlog.likesCount || 0}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPdfDocToView({
                          title: vlog.title,
                          hindiTitle: vlog.hindiTitle,
                          content: vlog.content,
                          fileUrl: vlog.pdfUrl,
                          fileName: vlog.pdfFileName,
                          fileSize: vlog.pdfFileSize,
                          classLevel: vlog.classLevel,
                        });
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-black text-xs transition-colors cursor-pointer border border-blue-200"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>

                    <span className="text-rose-700 font-extrabold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>देखें व पढ़ें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Single Vlog Detail Modal View */}
      {selectedVlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white text-xs font-black">
                  {selectedVlog.category.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400 font-bold hidden sm:inline">
                  RK STUDY CENTRE
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShareVlog(selectedVlog)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer text-slate-200"
                >
                  {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copySuccess ? 'लिंक कॉपी हो गया!' : 'शेयर करें'}</span>
                </button>

                <button
                  onClick={() => setSelectedVlog(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-8">
              {/* Responsive Video Player or Banner */}
              {selectedVlog.youtubeId ? (
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVlog.youtubeId}?autoplay=1&rel=0`}
                    title={selectedVlog.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : selectedVlog.coverImageUrl ? (
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900">
                  <img
                    src={selectedVlog.coverImageUrl}
                    alt={selectedVlog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null}

              {/* Title & Metadata Strip */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedVlog.readTimeMinutes || 4} मिनट पठन</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedVlog.viewsCount || 0} व्यूज</span>
                    </span>
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={handleToggleLike}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all cursor-pointer border ${
                      isLiked
                        ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                    <span>{isLiked ? 'पसंद किया गया' : 'लाइक करें'} ({selectedVlog.likesCount || 0})</span>
                  </button>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
                  {selectedVlog.title}
                </h1>

                {/* Excerpt Box */}
                <div className="p-4 rounded-2xl bg-rose-50 text-rose-950 text-sm sm:text-base font-semibold leading-relaxed border-l-4 border-rose-600">
                  {selectedVlog.excerpt}
                </div>

                {/* PDF Notes & In-App Booklet Reader Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300">
                          PDF स्पेशल नोट्स
                        </span>
                        <span className="text-xs text-slate-500 font-bold">
                          {selectedVlog.pdfFileSize || '1.8 MB'}
                        </span>
                      </div>
                      <h4 className="font-black text-slate-900 text-base mt-0.5">
                        {selectedVlog.pdfTitle || `${selectedVlog.title} - प्रिंटेबल PDF नोट्स`}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        बड़े स्पष्ट अक्षर • प्रिंटेबल बुकलेट • बिना इंटरनेट भी पढ़ने योग्य
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() =>
                        setPdfDocToView({
                          title: selectedVlog.title,
                          hindiTitle: selectedVlog.hindiTitle,
                          content: selectedVlog.content,
                          fileUrl: selectedVlog.pdfUrl,
                          fileName: selectedVlog.pdfFileName || `${selectedVlog.slug || 'notes'}.pdf`,
                          fileSize: selectedVlog.pdfFileSize,
                          classLevel: selectedVlog.classLevel,
                        })
                      }
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm transition-all shadow-md cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>📄 इन-ऐप PDF खोलें</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Formatted Full Content */}
              <div className="prose prose-slate max-w-none text-slate-800 text-base leading-relaxed whitespace-pre-wrap font-sans border-t border-slate-100 pt-6">
                {selectedVlog.content}
              </div>

              {/* Author Card */}
              <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                    PS
                  </div>
                  <div>
                    <h4 className="text-base font-black">{selectedVlog.author}</h4>
                    <p className="text-xs text-rose-200 font-medium">{selectedVlog.authorRole || 'RK STUDY CENTRE'}</p>
                    <p className="text-xs text-slate-400 mt-1">बिहार बोर्ड मैट्रिक एवं इंटर 2026-27 विशेष मेंटरशिप</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedVlog(null);
                    onNavigate('courses');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-black text-xs sm:text-sm transition-colors cursor-pointer shrink-0"
                >
                  टॉपर बैच देखें →
                </button>
              </div>

              {/* Student Comments & Discussion Section */}
              <section className="space-y-6 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-rose-600" />
                    <span>विद्यार्थी संवाद एवं प्रश्नोत्तर ({comments.length})</span>
                  </h3>
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="प्रिंस सर से अपना प्रश्न पूछें या टिप्पणी लिखें..."
                    className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 bg-slate-50 focus:bg-white text-sm font-medium focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
                  />
                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="px-6 py-3 rounded-2xl bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span>भेजें</span>
                  </button>
                </form>

                {/* Comments List */}
                <div className="space-y-3.5">
                  {(comments || []).map((c) => (
                    <div
                      key={c.id}
                      className={`p-4 rounded-2xl border ${
                        c.userRole === 'owner'
                          ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">
                            {c.userName}
                          </span>
                          {c.userRole === 'owner' && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white">
                              शिक्षक / Owner
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {c.createdAt}
                        </span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed">
                        {c.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
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
    </div>
  );
}
