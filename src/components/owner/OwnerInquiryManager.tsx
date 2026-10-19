import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  Mail,
  User,
  ExternalLink,
  ChevronDown,
  X,
  Send,
  Calendar,
  Tag,
  ShieldAlert,
  Loader2,
  Copy,
  Check,
  UserCheck,
  HelpCircle,
  FileText,
  AlertTriangle,
  CornerDownRight,
  Sparkles,
  Inbox
} from 'lucide-react';
import {
  getAllInquiries,
  createInquiry,
  updateInquiryStatus,
  updateInquiryPriority,
  assignInquiry,
  replyToInquiry,
  deleteInquiry,
} from '../../services/inquiryService';
import { getAllTeachers } from '../../services/teacherService';
import { useAuth } from '../../context/AuthContext';
import type {
  InquiryItem,
  InquiryType,
  InquirySource,
  InquiryStatus,
  InquiryPriority,
  Teacher,
} from '../../types';

export function OwnerInquiryManager() {
  const { user } = useAuth();

  // Data state
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | InquiryStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | InquiryPriority>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | InquiryType>('All');
  const [sourceFilter, setSourceFilter] = useState<'All' | InquirySource>('All');

  // Modals state
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [showReplyModal, setShowReplyModal] = useState<InquiryItem | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<InquiryItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<InquiryItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [replyText, setReplyText] = useState('');
  const [replyStatusChoice, setReplyStatusChoice] = useState<InquiryStatus>('Replied');
  const [assigneeName, setAssigneeName] = useState('');
  const [assigneeEmail, setAssigneeEmail] = useState('');

  // Manual create form
  const [newInquiry, setNewInquiry] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: 'General' as InquiryType,
    source: 'Manual' as InquirySource,
    priority: 'Normal' as InquiryPriority,
    status: 'New' as InquiryStatus,
  });

  // Toast / feedback message
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Fetch inquiries and teachers
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [inqData, teacherData] = await Promise.all([
        getAllInquiries(),
        getAllTeachers().catch(() => []),
      ]);
      setInquiries(inqData);
      setTeachers(teacherData);
    } catch (err: any) {
      console.error('[OwnerInquiryManager] Failed to load data:', err);
      showToast('error', 'डेटा लोड करने में समस्या आई।');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered inquiries calculation
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      // Status filter
      if (statusFilter !== 'All' && inq.status !== statusFilter) return false;
      // Priority filter
      if (priorityFilter !== 'All' && inq.priority !== priorityFilter) return false;
      // Type filter
      if (typeFilter !== 'All' && inq.inquiryType !== typeFilter) return false;
      // Source filter
      if (sourceFilter !== 'All' && inq.source !== sourceFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = inq.name.toLowerCase().includes(q);
        const matchesPhone = inq.phone.toLowerCase().includes(q);
        const matchesEmail = inq.email?.toLowerCase().includes(q) || false;
        const matchesSubject = inq.subject?.toLowerCase().includes(q) || false;
        const matchesMessage = inq.message.toLowerCase().includes(q);
        const matchesAssigned = inq.assignedTo?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesPhone && !matchesEmail && !matchesSubject && !matchesMessage && !matchesAssigned) {
          return false;
        }
      }
      return true;
    });
  }, [inquiries, statusFilter, priorityFilter, typeFilter, sourceFilter, searchQuery]);

  // Counts for status tabs
  const statusCounts = useMemo(() => {
    const counts = {
      All: inquiries.length,
      New: 0,
      InProgress: 0,
      Replied: 0,
      Resolved: 0,
      Archived: 0,
    };
    inquiries.forEach((inq) => {
      if (counts[inq.status] !== undefined) {
        counts[inq.status]++;
      }
    });
    return counts;
  }, [inquiries]);

  // Handle status update
  const handleQuickStatusChange = async (inqId: string, newStatus: InquiryStatus) => {
    setActionLoading(true);
    try {
      await updateInquiryStatus(inqId, newStatus);
      setInquiries((prev) =>
        prev.map((i) => (i.id === inqId ? { ...i, status: newStatus, updatedAt: new Date().toISOString() } : i))
      );
      if (selectedInquiry?.id === inqId) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast('success', `स्थिति बदलकर "${getStatusBadgeText(newStatus)}" कर दी गई।`);
    } catch (err: any) {
      showToast('error', 'स्थिति बदलने में त्रुटि हुई।');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle priority update
  const handleQuickPriorityChange = async (inqId: string, newPriority: InquiryPriority) => {
    setActionLoading(true);
    try {
      await updateInquiryPriority(inqId, newPriority);
      setInquiries((prev) =>
        prev.map((i) => (i.id === inqId ? { ...i, priority: newPriority, updatedAt: new Date().toISOString() } : i))
      );
      if (selectedInquiry?.id === inqId) {
        setSelectedInquiry((prev) => (prev ? { ...prev, priority: newPriority } : null));
      }
      showToast('success', `प्राथमिकता बदलकर "${getPriorityBadgeText(newPriority)}" कर दी गई।`);
    } catch (err: any) {
      showToast('error', 'प्राथमिकता बदलने में त्रुटि हुई।');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reply submission
  const handleSendReply = async () => {
    if (!showReplyModal || !replyText.trim()) {
      showToast('error', 'कृपया उत्तर संदेश दर्ज करें।');
      return;
    }
    setActionLoading(true);
    try {
      const replier = user?.displayName || user?.email || 'व्यवस्थापक (RK STUDY CENTRE)';
      await replyToInquiry(showReplyModal.id, replyText.trim(), replier, replyStatusChoice);
      const now = new Date().toISOString();
      setInquiries((prev) =>
        prev.map((i) =>
          i.id === showReplyModal.id
            ? {
                ...i,
                reply: replyText.trim(),
                repliedBy: replier,
                repliedAt: now,
                status: replyStatusChoice,
                updatedAt: now,
              }
            : i
        )
      );
      if (selectedInquiry?.id === showReplyModal.id) {
        setSelectedInquiry((prev) =>
          prev
            ? {
                ...prev,
                reply: replyText.trim(),
                repliedBy: replier,
                repliedAt: now,
                status: replyStatusChoice,
              }
            : null
        );
      }
      showToast('success', 'उत्तर सफलतापूर्वक दर्ज एवं सेव कर दिया गया।');
      setShowReplyModal(null);
      setReplyText('');
    } catch (err: any) {
      showToast('error', 'उत्तर सेव करने में त्रुटि हुई।');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle assignment
  const handleAssign = async () => {
    if (!showAssignModal || !assigneeName.trim()) {
      showToast('error', 'कृपया स्टाफ सदस्य या शिक्षक चुनें या नाम लिखें।');
      return;
    }
    setActionLoading(true);
    try {
      await assignInquiry(showAssignModal.id, assigneeName.trim(), assigneeEmail.trim());
      setInquiries((prev) =>
        prev.map((i) =>
          i.id === showAssignModal.id
            ? { ...i, assignedTo: assigneeName.trim(), assignedToEmail: assigneeEmail.trim(), updatedAt: new Date().toISOString() }
            : i
        )
      );
      if (selectedInquiry?.id === showAssignModal.id) {
        setSelectedInquiry((prev) =>
          prev ? { ...prev, assignedTo: assigneeName.trim(), assignedToEmail: assigneeEmail.trim() } : null
        );
      }
      showToast('success', `पूछताछ "${assigneeName.trim()}" को आवंटित कर दी गई।`);
      setShowAssignModal(null);
    } catch (err: any) {
      showToast('error', 'आवंटन में त्रुटि हुई।');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!showDeleteModal) return;
    setActionLoading(true);
    try {
      await deleteInquiry(showDeleteModal.id);
      setInquiries((prev) => prev.filter((i) => i.id !== showDeleteModal.id));
      if (selectedInquiry?.id === showDeleteModal.id) {
        setSelectedInquiry(null);
      }
      showToast('success', 'पूछताछ रिकॉर्ड सुरक्षित रूप से हटा दिया गया।');
      setShowDeleteModal(null);
    } catch (err: any) {
      showToast('error', 'रिकॉर्ड हटाने में त्रुटि हुई।');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle manual create
  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInquiry.name.trim() || !newInquiry.message.trim()) {
      showToast('error', 'कृपया नाम और संदेश विवरण अवश्य भरें।');
      return;
    }
    if (!newInquiry.phone.trim() && !newInquiry.email.trim()) {
      showToast('error', 'कृपया मोबाइल नंबर या ईमेल में से कम से कम एक संपर्क विवरण अवश्य दर्ज करें।');
      return;
    }

    setActionLoading(true);
    try {
      const created = await createInquiry({
        name: newInquiry.name.trim(),
        phone: newInquiry.phone.trim(),
        email: newInquiry.email.trim(),
        subject: newInquiry.subject.trim(),
        message: newInquiry.message.trim(),
        inquiryType: newInquiry.inquiryType,
        source: newInquiry.source,
        priority: newInquiry.priority,
        status: newInquiry.status,
      });

      setInquiries((prev) => [created, ...prev]);
      showToast('success', 'मैनुअल पूछताछ सफलतापूर्वक पंजीकृत कर ली गई।');
      setShowCreateModal(false);
      setNewInquiry({
        name: '',
        phone: '',
        email: '',
        subject: '',
        message: '',
        inquiryType: 'General',
        source: 'Manual',
        priority: 'Normal',
        status: 'New',
      });
    } catch (err: any) {
      showToast('error', err?.message || 'पूछताछ जोड़ने में त्रुटि हुई।');
    } finally {
      setActionLoading(false);
    }
  };

  // Copy inquiry details to clipboard
  const handleCopyDetails = (inq: InquiryItem) => {
    const text = `[RK STUDY CENTRE पूछताछ विवरण]
प्रेषक: ${inq.name}
फ़ोन: ${inq.phone || 'अनुपलब्ध'}
ईमेल: ${inq.email || 'अनुपलब्ध'}
विषय: ${inq.subject || 'सामान्य पूछताछ'}
श्रेणी: ${getInquiryTypeHindi(inq.inquiryType)}
प्राथमिकता: ${getPriorityBadgeText(inq.priority)}
स्थिति: ${getStatusBadgeText(inq.status)}
तारीख: ${formatDateTime(inq.createdAt)}
संदेश:
${inq.message}
${inq.reply ? `\nउत्तर (${inq.repliedBy || 'स्टाफ'}): ${inq.reply}` : ''}`;

    navigator.clipboard.writeText(text);
    setCopiedId(inq.id);
    showToast('success', 'पूछताछ विवरण क्लिपबोर्ड पर कॉपी हो गया!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Badges & styling helpers
  function getStatusBadge(status: InquiryStatus) {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'InProgress':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Replied':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Archived':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  function getStatusBadgeText(status: InquiryStatus) {
    switch (status) {
      case 'New':
        return 'नई (New)';
      case 'InProgress':
        return 'प्रक्रियाधीन (In Progress)';
      case 'Replied':
        return 'उत्तरित (Replied)';
      case 'Resolved':
        return 'समाधानित (Resolved)';
      case 'Archived':
        return 'संग्रहीत (Archived)';
      default:
        return status;
    }
  }

  function getPriorityBadge(priority: InquiryPriority) {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-black';
      case 'Important':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case 'Normal':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
    }
  }

  function getPriorityBadgeText(priority: InquiryPriority) {
    switch (priority) {
      case 'Urgent':
        return 'अति आवश्यक (Urgent)';
      case 'Important':
        return 'महत्वपूर्ण (Important)';
      case 'Normal':
      default:
        return 'सामान्य (Normal)';
    }
  }

  function getInquiryTypeHindi(type: InquiryType) {
    switch (type) {
      case 'Admission':
        return 'नामांकन (Admission)';
      case 'Fees':
        return 'फीस / शुल्क (Fees)';
      case 'Course':
        return 'कोर्स (Course)';
      case 'Class':
        return 'कक्षा (Class)';
      case 'Attendance':
        return 'उपस्थिति (Attendance)';
      case 'Exam':
        return 'परीक्षा (Exam)';
      case 'StudyMaterial':
        return 'नोट्स / PDF (Study Material)';
      case 'Technical':
        return 'तकनीकी समस्या (Technical)';
      case 'General':
        return 'सामान्य (General)';
      case 'Other':
      default:
        return 'अन्य (Other)';
    }
  }

  function formatDateTime(isoString: string) {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('hi-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header & Quick Action Row */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-black">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>कार्य 14 • संदेश व पूछताछ प्रबंधन</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            पूछताछ व संदेश इनबॉक्स (Inquiries & Messages)
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            वेबसाइट संपर्क पृष्ठ, विद्यार्थियों और अभिभावकों से प्राप्त संदेशों का त्वरित समाधान एवं रिकॉर्ड प्रबंधन
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm inline-flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>रीफ्रेश</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-sm inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>मैनुअल पूछताछ दर्ज करें</span>
          </button>
        </div>
      </div>

      {/* Status Counters Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setStatusFilter('All')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'All'
              ? 'bg-blue-700 text-white border-blue-700 shadow-md ring-2 ring-blue-500/20'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="text-xs font-bold opacity-80">कुल संदेश</div>
          <div className="text-2xl font-black mt-1">{statusCounts.All}</div>
        </button>

        <button
          onClick={() => setStatusFilter('New')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'New'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/20'
              : 'bg-white hover:bg-blue-50/50 border-blue-200 text-blue-900'
          }`}
        >
          <div className="text-xs font-bold text-blue-600">नई (New)</div>
          <div className="text-2xl font-black mt-1">{statusCounts.New}</div>
        </button>

        <button
          onClick={() => setStatusFilter('InProgress')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'InProgress'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-400/20'
              : 'bg-white hover:bg-amber-50/50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="text-xs font-bold text-amber-600">प्रक्रियाधीन</div>
          <div className="text-2xl font-black mt-1">{statusCounts.InProgress}</div>
        </button>

        <button
          onClick={() => setStatusFilter('Replied')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'Replied'
              ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-400/20'
              : 'bg-white hover:bg-purple-50/50 border-purple-200 text-purple-900'
          }`}
        >
          <div className="text-xs font-bold text-purple-600">उत्तरित (Replied)</div>
          <div className="text-2xl font-black mt-1">{statusCounts.Replied}</div>
        </button>

        <button
          onClick={() => setStatusFilter('Resolved')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'Resolved'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/20'
              : 'bg-white hover:bg-emerald-50/50 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="text-xs font-bold text-emerald-600">समाधानित</div>
          <div className="text-2xl font-black mt-1">{statusCounts.Resolved}</div>
        </button>

        <button
          onClick={() => setStatusFilter('Archived')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'Archived'
              ? 'bg-slate-700 text-white border-slate-700 shadow-md ring-2 ring-slate-400/20'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div className="text-xs font-bold text-slate-500">संग्रहीत</div>
          <div className="text-2xl font-black mt-1">{statusCounts.Archived}</div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="नाम, फ़ोन नंबर, ईमेल, विषय या संदेश से खोजें..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="All">प्राथमिकता: सभी</option>
              <option value="Urgent">🚨 अति आवश्यक (Urgent)</option>
              <option value="Important">⚠️ महत्वपूर्ण (Important)</option>
              <option value="Normal">सामान्य (Normal)</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="All">श्रेणी: सभी</option>
              <option value="Admission">नामांकन (Admission)</option>
              <option value="Fees">फीस / शुल्क (Fees)</option>
              <option value="Course">कोर्स (Course)</option>
              <option value="Class">कक्षा (Class)</option>
              <option value="Attendance">उपस्थिति (Attendance)</option>
              <option value="Exam">परीक्षा (Exam)</option>
              <option value="StudyMaterial">नोट्स / PDF (Study Material)</option>
              <option value="Technical">तकनीकी समस्या (Technical)</option>
              <option value="General">सामान्य (General)</option>
              <option value="Other">अन्य (Other)</option>
            </select>

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              className="px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="All">स्रोत: सभी</option>
              <option value="Website">वेबसाइट (Website)</option>
              <option value="Student">विद्यार्थी (Student)</option>
              <option value="Parent">अभिभावक (Parent)</option>
              <option value="Teacher">शिक्षक (Teacher)</option>
              <option value="Manual">मैनुअल / ऑफलाइन</option>
            </select>

            {/* Clear All Filters */}
            {(searchQuery || statusFilter !== 'All' || priorityFilter !== 'All' || typeFilter !== 'All' || sourceFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                  setPriorityFilter('All');
                  setTypeFilter('All');
                  setSourceFilter('All');
                }}
                className="px-3 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                फ़िल्टर हटाएं
              </button>
            )}
          </div>
        </div>

        {/* Results summary bar */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-2 border-t border-slate-100">
          <div>
            कुल {filteredInquiries.length} पूछताछ प्रदर्शित
            {inquiries.length !== filteredInquiries.length && ` (कुल ${inquiries.length} में से)`}
          </div>
          <div>
            अंतिम अपडेट: {new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Inquiries List View */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-slate-600 font-bold text-sm">पूछताछ व संदेश डेटा लोड हो रहा है...</p>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">कोई पूछताछ या संदेश नहीं मिला</h3>
            <p className="text-slate-500 text-sm font-medium max-w-md mx-auto">
              {inquiries.length === 0
                ? 'वर्तमान में कोई नई पूछताछ प्राप्त नहीं हुई है। वेबसाइट संपर्क फॉर्म या ऑफलाइन से प्राप्त संदेश यहाँ दिखाई देंगे।'
                : 'चयनित खोज एवं फ़िल्टर के अनुसार कोई परिणाम नहीं मिला। कृपया फ़िल्टर बदलें।'}
            </p>
          </div>
          {inquiries.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm inline-flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>मैनुअल पूछताछ दर्ज करें</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInquiries.map((inq) => (
            <div
              key={inq.id}
              className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all hover:shadow-md ${
                inq.status === 'New'
                  ? 'border-blue-300 ring-1 ring-blue-100'
                  : inq.priority === 'Urgent'
                  ? 'border-rose-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Left: Info & Content */}
                <div className="space-y-3 flex-1">
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black border ${getStatusBadge(
                        inq.status
                      )}`}
                    >
                      {getStatusBadgeText(inq.status)}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs border ${getPriorityBadge(
                        inq.priority
                      )}`}
                    >
                      {getPriorityBadgeText(inq.priority)}
                    </span>

                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">
                      {getInquiryTypeHindi(inq.inquiryType)}
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200 text-xs font-medium">
                      स्रोत: {inq.source}
                    </span>

                    {inq.classLevel && (
                      <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
                        {inq.classLevel}
                      </span>
                    )}
                  </div>

                  {/* Sender & Subject Header */}
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 flex-wrap">
                      <span>{inq.name}</span>
                      {inq.subject && (
                        <span className="text-slate-500 font-bold text-base">
                          — {inq.subject}
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 mt-1">
                      {inq.phone && (
                        <a
                          href={`tel:${inq.phone}`}
                          className="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{inq.phone}</span>
                        </a>
                      )}
                      {inq.email && (
                        <a
                          href={`mailto:${inq.email}`}
                          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:underline"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>{inq.email}</span>
                        </a>
                      )}
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDateTime(inq.createdAt)}</span>
                      </div>
                      {inq.assignedTo && (
                        <div className="flex items-center gap-1 text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 font-bold">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>आवंटित: {inq.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message body snippet */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150 text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {inq.message}
                  </div>

                  {/* Reply snippet if present */}
                  {inq.reply && (
                    <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 text-sm space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                        <span className="flex items-center gap-1.5">
                          <CornerDownRight className="w-4 h-4 text-purple-700" />
                          <span>उत्तर (द्वारा: {inq.repliedBy || 'स्टाफ'})</span>
                        </span>
                        {inq.repliedAt && (
                          <span className="text-purple-600">{formatDateTime(inq.repliedAt)}</span>
                        )}
                      </div>
                      <p className="text-purple-950 font-medium whitespace-pre-wrap leading-relaxed">
                        {inq.reply}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 shrink-0">
                  {/* View Details */}
                  <button
                    onClick={() => setSelectedInquiry(inq)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>विवरण</span>
                  </button>

                  {/* Reply Button */}
                  <button
                    onClick={() => {
                      setShowReplyModal(inq);
                      setReplyText(inq.reply || '');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-black text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{inq.reply ? 'उत्तर बदलें' : 'उत्तर दें'}</span>
                  </button>

                  {/* Assign Button */}
                  <button
                    onClick={() => {
                      setShowAssignModal(inq);
                      setAssigneeName(inq.assignedTo || '');
                      setAssigneeEmail(inq.assignedToEmail || '');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>आवंटन</span>
                  </button>

                  {/* Status Dropdown */}
                  <div className="relative inline-block text-left">
                    <select
                      value={inq.status}
                      disabled={actionLoading}
                      onChange={(e) => handleQuickStatusChange(inq.id, e.target.value as InquiryStatus)}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                    >
                      <option value="New">नई</option>
                      <option value="InProgress">प्रक्रियाधीन</option>
                      <option value="Replied">उत्तरित</option>
                      <option value="Resolved">समाधानित</option>
                      <option value="Archived">संग्रहीत</option>
                    </select>
                  </div>

                  {/* Copy & Delete row */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyDetails(inq)}
                      title="पूछताछ विवरण कॉपी करें"
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {copiedId === inq.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => setShowDeleteModal(inq)}
                      title="पूछताछ हटाएं"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. VIEW / DETAILS MODAL                                                   */}
      {/* ========================================================================= */}
      {selectedInquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-slate-150 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-3 py-0.5 rounded-full text-xs font-black border ${getStatusBadge(selectedInquiry.status)}`}>
                    {getStatusBadgeText(selectedInquiry.status)}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs border ${getPriorityBadge(selectedInquiry.priority)}`}>
                    {getPriorityBadgeText(selectedInquiry.priority)}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {selectedInquiry.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-bold">
                  {selectedInquiry.subject || 'सामान्य विषय'} • {getInquiryTypeHindi(selectedInquiry.inquiryType)}
                </p>
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm">
              <div className="space-y-1">
                <div className="text-slate-500 font-bold">मोबाइल नंबर:</div>
                {selectedInquiry.phone ? (
                  <a
                    href={`tel:${selectedInquiry.phone}`}
                    className="font-black text-blue-700 hover:underline flex items-center gap-1.5"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{selectedInquiry.phone}</span>
                  </a>
                ) : (
                  <span className="text-slate-400">अनुपलब्ध</span>
                )}
              </div>

              <div className="space-y-1">
                <div className="text-slate-500 font-bold">ईमेल पता:</div>
                {selectedInquiry.email ? (
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="font-black text-blue-700 hover:underline flex items-center gap-1.5"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{selectedInquiry.email}</span>
                  </a>
                ) : (
                  <span className="text-slate-400">अनुपलब्ध</span>
                )}
              </div>

              <div className="space-y-1">
                <div className="text-slate-500 font-bold">प्राप्ति तिथि:</div>
                <div className="font-bold text-slate-800">{formatDateTime(selectedInquiry.createdAt)}</div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-500 font-bold">स्रोत (Source):</div>
                <div className="font-bold text-slate-800">{selectedInquiry.source}</div>
              </div>

              {selectedInquiry.assignedTo && (
                <div className="space-y-1 sm:col-span-2">
                  <div className="text-slate-500 font-bold">आवंटित व्यक्ति:</div>
                  <div className="font-black text-teal-800 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-teal-600" />
                    <span>{selectedInquiry.assignedTo}</span>
                    {selectedInquiry.assignedToEmail && (
                      <span className="text-slate-500 text-xs font-normal">({selectedInquiry.assignedToEmail})</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Message Full View */}
            <div className="space-y-2">
              <div className="text-xs font-black text-slate-500 uppercase tracking-wider">
                पूछताछ / संदेश विवरण:
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-slate-900 font-medium text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Reply if available */}
            {selectedInquiry.reply && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-purple-900 uppercase tracking-wider">
                  <span>दर्ज किया गया उत्तर:</span>
                  {selectedInquiry.repliedAt && <span>{formatDateTime(selectedInquiry.repliedAt)}</span>}
                </div>
                <div className="bg-purple-50 p-5 rounded-2xl border border-purple-200 text-purple-950 font-medium text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {selectedInquiry.reply}
                  <div className="text-xs text-purple-700 font-bold mt-3 pt-2 border-t border-purple-200">
                    उत्तरकर्ता: {selectedInquiry.repliedBy || 'स्टाफ'}
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-150">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyDetails(selectedInquiry)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>विवरण कॉपी करें</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const inq = selectedInquiry;
                    setSelectedInquiry(null);
                    setShowReplyModal(inq);
                    setReplyText(inq.reply || '');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{selectedInquiry.reply ? 'उत्तर संशोधित करें' : 'उत्तर लिखें'}</span>
                </button>

                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
                >
                  बंद करें
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REPLY MODAL                                                            */}
      {/* ========================================================================= */}
      {showReplyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-150 pb-3">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-purple-700" />
                  <span>उत्तर दर्ज करें (Reply to Inquiry)</span>
                </h3>
                <p className="text-xs font-bold text-slate-500 mt-1">
                  प्रेषक: {showReplyModal.name} {showReplyModal.phone && `(${showReplyModal.phone})`}
                </p>
              </div>
              <button
                onClick={() => setShowReplyModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original question snippet */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-700 max-h-28 overflow-y-auto">
              <span className="font-bold text-slate-900">पूछताछ:</span> {showReplyModal.message}
            </div>

            {/* Quick Templates */}
            <div className="space-y-1.5">
              <div className="text-xs font-black text-slate-600">त्वरित उत्तर टेम्पलेट:</div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setReplyText(
                      `नमस्ते ${showReplyModal.name}, RK STUDY CENTRE में संपर्क करने के लिए धन्यवाद। आपकी पूछताछ प्राप्त हो गई है। हमारी टीम शीघ्र ही आपसे संपर्क करेगी। अधिक जानकारी हेतु हेल्पलाइन नंबर पर कॉल कर सकते हैं।`
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 text-xs font-medium transition-colors cursor-pointer"
                >
                  सामान्य आभार
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setReplyText(
                      `नमस्ते ${showReplyModal.name}, नए सत्र में नामांकन संबंधी जानकारी वेबसाइट के कोर्सेज सेक्शन में उपलब्ध है अथवा आप केंद्र पर आकर सीधे संपर्क कर सकते हैं।`
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 text-xs font-medium transition-colors cursor-pointer"
                >
                  नामांकन जानकारी
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setReplyText(
                      `नमस्ते, तकनीकी समस्या का समाधान कर दिया गया है। कृपया अपने अकाउंट में पुनः लॉगिन करके जांच करें।`
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 text-xs font-medium transition-colors cursor-pointer"
                >
                  तकनीकी समाधान
                </button>
              </div>
            </div>

            {/* Reply Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 block">
                उत्तर संदेश (Reply Content) *
              </label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="यहाँ अपना उत्तर लिखें जिसे सिस्टम में सहेजा जाएगा..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
              />
            </div>

            {/* Change status upon reply */}
            <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700">
              <span>उत्तर दर्ज होने के बाद स्थिति रखें:</span>
              <select
                value={replyStatusChoice}
                onChange={(e) => setReplyStatusChoice(e.target.value as InquiryStatus)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                <option value="Replied">उत्तरित (Replied)</option>
                <option value="Resolved">समाधानित (Resolved)</option>
                <option value="InProgress">प्रक्रियाधीन (InProgress)</option>
              </select>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-150">
              <button
                type="button"
                onClick={() => setShowReplyModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                disabled={actionLoading || !replyText.trim()}
                onClick={handleSendReply}
                className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>उत्तर सहेजें व अपडेट करें</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ASSIGN MODAL                                                           */}
      {/* ========================================================================= */}
      {showAssignModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-150 pb-3">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-teal-700" />
                  <span>पूछताछ आवंटित करें (Assign)</span>
                </h3>
                <p className="text-xs font-bold text-slate-500 mt-1">
                  जांच एवं समाधान हेतु स्टाफ सदस्य या शिक्षक को सौंपें
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Select from existing faculty */}
            {teachers.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 block">
                  संस्थान के शिक्षक में से चुनें:
                </label>
                <select
                  onChange={(e) => {
                    const t = teachers.find((tch) => tch.id === e.target.value);
                    if (t) {
                      setAssigneeName(t.name);
                      setAssigneeEmail(t.email || '');
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                >
                  <option value="">-- शिक्षक चुनें --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.qualification || 'शिक्षक'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Name / Role input */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 block">
                आवंटित व्यक्ति का नाम / पदनाम *
              </label>
              <input
                type="text"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                placeholder="उदा. Er. R.K. Singh या रिसेप्शन डेस्क"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 block">
                ईमेल पता (वैकल्पिक)
              </label>
              <input
                type="email"
                value={assigneeEmail}
                onChange={(e) => setAssigneeEmail(e.target.value)}
                placeholder="staff@rkstudy.in"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-150">
              <button
                type="button"
                onClick={() => setShowAssignModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                disabled={actionLoading || !assigneeName.trim()}
                onClick={handleAssign}
                className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-black text-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>आवंटन सहेजें</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MANUAL CREATE INQUIRY MODAL                                            */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-150 pb-3">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-700 stroke-[3]" />
                  <span>मैनुअल पूछताछ दर्ज करें (New Intake)</span>
                </h3>
                <p className="text-xs font-bold text-slate-500 mt-1">
                  फ़ोन कॉल, अभिभावक विज़िट या ऑफलाइन रिसेप्शन पूछताछ का रिकॉर्ड
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">
                    प्रेषक का नाम (Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newInquiry.name}
                    onChange={(e) => setNewInquiry({ ...newInquiry, name: e.target.value })}
                    placeholder="विद्यार्थी या अभिभावक का नाम"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">
                    मोबाइल नंबर (Phone) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newInquiry.phone}
                    onChange={(e) => setNewInquiry({ ...newInquiry, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">
                    ईमेल पता (वैकल्पिक)
                  </label>
                  <input
                    type="email"
                    value={newInquiry.email}
                    onChange={(e) => setNewInquiry({ ...newInquiry, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">
                    पूछताछ श्रेणी (Inquiry Type)
                  </label>
                  <select
                    value={newInquiry.inquiryType}
                    onChange={(e) => setNewInquiry({ ...newInquiry, inquiryType: e.target.value as InquiryType })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800"
                  >
                    <option value="Admission">नामांकन (Admission)</option>
                    <option value="Fees">फीस / शुल्क (Fees)</option>
                    <option value="Course">कोर्स (Course)</option>
                    <option value="Class">कक्षा (Class)</option>
                    <option value="Attendance">उपस्थिति (Attendance)</option>
                    <option value="Exam">परीक्षा (Exam)</option>
                    <option value="StudyMaterial">नोट्स / PDF (Study Material)</option>
                    <option value="Technical">तकनीकी समस्या (Technical)</option>
                    <option value="General">सामान्य (General)</option>
                    <option value="Other">अन्य (Other)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">स्रोत (Source)</label>
                  <select
                    value={newInquiry.source}
                    onChange={(e) => setNewInquiry({ ...newInquiry, source: e.target.value as InquirySource })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <option value="Manual">मैनुअल / ऑफलाइन</option>
                    <option value="Student">विद्यार्थी (Student)</option>
                    <option value="Parent">अभिभावक (Parent)</option>
                    <option value="Website">वेबसाइट (Website)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">प्राथमिकता</label>
                  <select
                    value={newInquiry.priority}
                    onChange={(e) => setNewInquiry({ ...newInquiry, priority: e.target.value as InquiryPriority })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <option value="Normal">सामान्य (Normal)</option>
                    <option value="Important">महत्वपूर्ण (Important)</option>
                    <option value="Urgent">अति आवश्यक (Urgent)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-800 block">प्रारंभिक स्थिति</label>
                  <select
                    value={newInquiry.status}
                    onChange={(e) => setNewInquiry({ ...newInquiry, status: e.target.value as InquiryStatus })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <option value="New">नई (New)</option>
                    <option value="InProgress">प्रक्रियाधीन (InProgress)</option>
                    <option value="Replied">उत्तरित (Replied)</option>
                    <option value="Resolved">समाधानित (Resolved)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 block">विषय (Subject / Title)</label>
                <input
                  type="text"
                  value={newInquiry.subject}
                  onChange={(e) => setNewInquiry({ ...newInquiry, subject: e.target.value })}
                  placeholder="उदा. क्लास 10 बोर्ड बैच फीस जानकारी"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 block">
                  संदेश / पूछताछ का विवरण (Message) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newInquiry.message}
                  onChange={(e) => setNewInquiry({ ...newInquiry, message: e.target.value })}
                  placeholder="विद्यार्थी या अभिभावक द्वारा पूछी गई मुख्य बात यहाँ दर्ज करें..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>पूछताछ दर्ज करें</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DELETE CONFIRMATION MODAL                                              */}
      {/* ========================================================================= */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border-2 border-rose-150 shadow-2xl space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  पूछताछ रिकॉर्ड हटाएं?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  क्या आप सचमुच <strong className="text-slate-900">{showDeleteModal.name}</strong> की इस पूछताछ को हमेशा के लिए हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकेगी।
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1 font-medium">
              <div><strong className="text-slate-900">विषय:</strong> {showDeleteModal.subject || 'सामान्य विषय'}</div>
              <div><strong className="text-slate-900">तारीख:</strong> {formatDateTime(showDeleteModal.createdAt)}</div>
              <div><strong className="text-slate-900">संदेश अंश:</strong> {showDeleteModal.message.substring(0, 75)}...</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-150">
              <button
                type="button"
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>हाँ, हटाएं (Permanent Delete)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
