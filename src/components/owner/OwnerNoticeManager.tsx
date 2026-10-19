/**
 * RK STUDY CENTRE - Notices & Circulars Manager (Task 13)
 * 
 * Production-ready management interface for:
 * 1. General Notices & Announcements
 * 2. Administrative Circulars
 * 3. Holiday Notices
 * 4. Exam & Timetable Announcements
 * 5. Fee & Payment Notifications
 * 6. Attendance & Discipline Notices
 * 
 * Features:
 * - Audience targeting (All, Students, Teachers, Class, Course, Batch).
 * - Priority tagging (Normal, Important, Urgent).
 * - Lifecycle: Draft -> Published -> Archived.
 * - In-app modals for Create, Edit, Preview, and Delete (NO native alert/confirm).
 * - Combined Search & Multi-Filters.
 * - Storage file attachment & External URL support.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Bell,
  Plus,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2,
  Edit3,
  Eye,
  Send,
  Archive,
  RotateCcw,
  X,
  Upload,
  Layers,
  Paperclip,
  Users,
  GraduationCap,
  Sparkles,
  Loader2,
  FileCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import type {
  ClassLevel,
  Course,
  NoticeItem,
  NoticeType,
  NoticeAudience,
  NoticePriority,
  NoticePublishStatus,
} from '../../types';
import { CLASSES_METADATA } from '../../lib/constants';
import { getAllCourses } from '../../services/courseService';
import {
  getAllNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  toggleNoticeStatus,
  uploadNoticeAttachment,
  deleteNoticeAttachmentFile,
  formatNoticeBytes,
} from '../../services/noticeService';
import { useAuth } from '../../context/AuthContext';

export function OwnerNoticeManager() {
  const { user } = useAuth();

  // Data states
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // In-app Alert / Feedback state
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAudience, setFilterAudience] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [previewNotice, setPreviewNotice] = useState<NoticeItem | null>(null);
  const [noticeToDelete, setNoticeToDelete] = useState<NoticeItem | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState<string>('');
  const [formContent, setFormContent] = useState<string>('');
  const [formType, setFormType] = useState<NoticeType>('general');
  const [formAudience, setFormAudience] = useState<NoticeAudience>('all');
  const [formClassLevel, setFormClassLevel] = useState<ClassLevel>('class-10');
  const [formCourseId, setFormCourseId] = useState<string>('');
  const [formBatchName, setFormBatchName] = useState<string>('');
  const [formPriority, setFormPriority] = useState<NoticePriority>('normal');
  const [formStatus, setFormStatus] = useState<NoticePublishStatus>('published');
  const [formPublishAt, setFormPublishAt] = useState<string>('');
  const [formExpiresAt, setFormExpiresAt] = useState<string>('');

  // Attachment states
  const [attachmentMode, setAttachmentMode] = useState<'none' | 'file' | 'link'>('none');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentExternalUrl, setAttachmentExternalUrl] = useState<string>('');
  const [existingAttachmentUrl, setExistingAttachmentUrl] = useState<string>('');
  const [existingAttachmentName, setExistingAttachmentName] = useState<string>('');
  const [existingStoragePath, setExistingStoragePath] = useState<string>('');

  // Form action status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto clear feedback after 5 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Load real notices and courses
  const loadData = async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      const [noticesData, coursesData] = await Promise.all([
        getAllNotices(true),
        getAllCourses(true),
      ]);
      setNotices(noticesData);
      setCourses(coursesData);
    } catch (err: any) {
      console.error('[RK STUDY CENTRE] Error loading notices:', err);
      setFeedback({
        type: 'error',
        message: 'सूचना सूची लोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format date helper for input type="datetime-local"
  const getIsoForInput = (dateInput?: string): string => {
    if (!dateInput) return '';
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return '';
      // Return YYYY-MM-DDTHH:mm
      const pad = (n: number) => (n < 10 ? '0' + n : n);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingNotice(null);
    setFormTitle('');
    setFormContent('');
    setFormType('general');
    setFormAudience('all');
    setFormClassLevel('class-10');
    setFormCourseId('');
    setFormBatchName('');
    setFormPriority('normal');
    setFormStatus('published');

    // Default publishAt to current local time
    const now = new Date();
    setFormPublishAt(getIsoForInput(now.toISOString()));
    setFormExpiresAt('');

    setAttachmentMode('none');
    setAttachmentFile(null);
    setAttachmentExternalUrl('');
    setExistingAttachmentUrl('');
    setExistingAttachmentName('');
    setExistingStoragePath('');
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (notice: NoticeItem) => {
    setEditingNotice(notice);
    setFormTitle(notice.title);
    setFormContent(notice.content);
    setFormType(notice.noticeType);
    setFormAudience(notice.audience);
    setFormClassLevel(notice.classLevel || 'class-10');
    setFormCourseId(notice.courseId || '');
    setFormBatchName(notice.batchName || '');
    setFormPriority(notice.priority || 'normal');
    setFormStatus(notice.publishStatus || 'published');
    setFormPublishAt(getIsoForInput(notice.publishAt));
    setFormExpiresAt(getIsoForInput(notice.expiresAt));

    // Attachment
    if (notice.attachmentUrl) {
      if (notice.attachmentType === 'link') {
        setAttachmentMode('link');
        setAttachmentExternalUrl(notice.attachmentUrl);
        setExistingAttachmentUrl('');
        setExistingAttachmentName('');
        setExistingStoragePath('');
      } else {
        setAttachmentMode('file');
        setExistingAttachmentUrl(notice.attachmentUrl);
        setExistingAttachmentName(notice.attachmentName || 'संलग्नक फ़ाइल');
        setExistingStoragePath(notice.storagePath || '');
        setAttachmentExternalUrl('');
      }
    } else {
      setAttachmentMode('none');
      setExistingAttachmentUrl('');
      setExistingAttachmentName('');
      setExistingStoragePath('');
      setAttachmentExternalUrl('');
    }

    setAttachmentFile(null);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Submit Notice Form (Create or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanTitle = formTitle.trim();
    const cleanContent = formContent.trim();

    if (!cleanTitle) {
      setFormError('कृपया सूचना का शीर्षक (Title) दर्ज करें।');
      return;
    }

    if (cleanTitle.length > 250) {
      setFormError('शीर्षक अधिकतम 250 अक्षरों का होना चाहिए।');
      return;
    }

    if (!cleanContent) {
      setFormError('कृपया सूचना का विस्तृत विवरण (Content) दर्ज करें।');
      return;
    }

    // Audience targeting validations
    if (formAudience === 'specific_class' && !formClassLevel) {
      setFormError('विशिष्ट कक्षा के लिए कक्षा (Class) का चयन अनिवार्य है।');
      return;
    }

    if (formAudience === 'specific_course' && !formCourseId) {
      setFormError('विशिष्ट कोर्स के लिए कोर्स (Course) का चयन अनिवार्य है।');
      return;
    }

    if (formAudience === 'specific_batch' && !formBatchName.trim()) {
      setFormError('विशिष्ट बैच के लिए बैच का नाम (Batch Name) अनिवार्य है।');
      return;
    }

    // Date validations
    let publishAtIso: string | undefined = undefined;
    let expiresAtIso: string | undefined = undefined;

    if (formPublishAt) {
      const pubDate = new Date(formPublishAt);
      if (isNaN(pubDate.getTime())) {
        setFormError('प्रकाशन तिथि अमान्य है।');
        return;
      }
      publishAtIso = pubDate.toISOString();
    } else {
      publishAtIso = new Date().toISOString();
    }

    if (formExpiresAt) {
      const expDate = new Date(formExpiresAt);
      if (isNaN(expDate.getTime())) {
        setFormError('समाप्ति तिथि अमान्य है।');
        return;
      }
      expiresAtIso = expDate.toISOString();

      if (publishAtIso && expDate.getTime() < new Date(publishAtIso).getTime()) {
        setFormError('समाप्ति तिथि (Expiry Date) प्रकाशन तिथि (Publish Date) से पहले नहीं हो सकती।');
        return;
      }
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    let newUploadedStoragePath: string | null = null;
    let oldStoragePathToClean: string | null = null;

    try {
      let finalAttachmentUrl = existingAttachmentUrl;
      let finalAttachmentName = existingAttachmentName;
      let finalAttachmentType: 'pdf' | 'image' | 'link' | undefined = undefined;
      let finalAttachmentSize: string | undefined = undefined;
      let finalStoragePath = existingStoragePath;

      const targetCourse = courses.find((c) => c.id === formCourseId);

      // Handle Attachment
      if (attachmentMode === 'link') {
        const cleanLink = attachmentExternalUrl.trim();
        if (!cleanLink) {
          setFormError('कृपया बाहरी वेब लिंक (URL) दर्ज करें।');
          setIsSubmitting(false);
          return;
        }
        finalAttachmentUrl = cleanLink;
        finalAttachmentName = cleanLink;
        finalAttachmentType = 'link';
        finalStoragePath = '';
        if (editingNotice && existingStoragePath) {
          oldStoragePathToClean = existingStoragePath;
        }
      } else if (attachmentMode === 'file' && attachmentFile) {
        // Upload new file attachment
        const tempNoticeId = editingNotice ? editingNotice.id : `notice_${Date.now().toString(36)}`;
        const uploaded = await uploadNoticeAttachment(attachmentFile, tempNoticeId, (pct) => {
          setUploadProgress(pct);
        });

        newUploadedStoragePath = uploaded.path;
        finalAttachmentUrl = uploaded.url;
        finalAttachmentName = uploaded.name;
        finalAttachmentType = uploaded.type;
        finalAttachmentSize = uploaded.size;
        finalStoragePath = uploaded.path;

        // If replacing an existing storage file, queue the old one for cleanup after successful Firestore update
        if (editingNotice && existingStoragePath && existingStoragePath !== uploaded.path) {
          oldStoragePathToClean = existingStoragePath;
        }
      } else if (attachmentMode === 'none') {
        finalAttachmentUrl = '';
        finalAttachmentName = '';
        finalAttachmentType = undefined;
        finalAttachmentSize = undefined;
        finalStoragePath = '';
        if (editingNotice && existingStoragePath) {
          oldStoragePathToClean = existingStoragePath;
        }
      }

      if (editingNotice) {
        // Update existing notice in Firestore
        await updateNotice(editingNotice.id, {
          title: cleanTitle,
          content: cleanContent,
          noticeType: formType,
          audience: formAudience,
          classLevel: formAudience === 'specific_class' ? formClassLevel : undefined,
          courseId: formAudience === 'specific_course' ? formCourseId : undefined,
          courseName: formAudience === 'specific_course' ? targetCourse?.title : undefined,
          batchName: formAudience === 'specific_batch' ? formBatchName.trim() : undefined,
          priority: formPriority,
          publishStatus: formStatus,
          publishAt: publishAtIso,
          expiresAt: expiresAtIso,
          attachmentUrl: finalAttachmentUrl || undefined,
          attachmentName: finalAttachmentName || undefined,
          attachmentType: finalAttachmentType,
          attachmentSize: finalAttachmentSize,
          storagePath: finalStoragePath || undefined,
        });

        // SUCCESS: Clean up old storage file if replacement succeeded
        if (oldStoragePathToClean) {
          deleteNoticeAttachmentFile(oldStoragePathToClean).catch((err) => {
            console.warn('[RK STUDY CENTRE] Old attachment cleanup non-fatal notice:', err);
          });
        }

        setFeedback({
          type: 'success',
          message: `सूचना "${cleanTitle}" का विवरण सफलतापूर्वक अद्यतित किया गया।`,
        });
      } else {
        // Create new notice in Firestore
        await createNotice({
          title: cleanTitle,
          content: cleanContent,
          noticeType: formType,
          audience: formAudience,
          classLevel: formAudience === 'specific_class' ? formClassLevel : undefined,
          courseId: formAudience === 'specific_course' ? formCourseId : undefined,
          courseName: formAudience === 'specific_course' ? targetCourse?.title : undefined,
          batchName: formAudience === 'specific_batch' ? formBatchName.trim() : undefined,
          priority: formPriority,
          publishStatus: formStatus,
          publishAt: publishAtIso,
          expiresAt: expiresAtIso,
          attachmentUrl: finalAttachmentUrl || undefined,
          attachmentName: finalAttachmentName || undefined,
          attachmentType: finalAttachmentType,
          attachmentSize: finalAttachmentSize,
          storagePath: finalStoragePath || undefined,
          createdBy: user?.uid || 'owner',
          createdByEmail: user?.email || 'rkstudycentre064@gmail.com',
        });

        setFeedback({
          type: 'success',
          message: `नई सूचना "${cleanTitle}" सफलतापूर्वक सृजित की गई।`,
        });
      }

      setIsFormModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error('[RK STUDY CENTRE] Error saving notice:', err);

      // FIRESTORE / SAVE FAILURE ROLLBACK:
      // If a new storage file was uploaded during this attempt, clean it up so orphan files are not left behind
      if (newUploadedStoragePath) {
        deleteNoticeAttachmentFile(newUploadedStoragePath).catch((cleanupErr) => {
          console.warn('[RK STUDY CENTRE] Rollback newly uploaded file cleanup notice:', cleanupErr);
        });
      }

      setFormError(err?.message || 'सूचना सहेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Toggle Status (Publish, Unpublish, Archive)
  const handleQuickStatusChange = async (
    notice: NoticeItem,
    newStatus: NoticePublishStatus
  ) => {
    try {
      await toggleNoticeStatus(notice.id, newStatus);
      const statusLabel =
        newStatus === 'published'
          ? 'प्रकाशित (Published)'
          : newStatus === 'archived'
          ? 'संग्रहीत (Archived)'
          : 'ड्राफ्ट (Draft)';

      setFeedback({
        type: 'success',
        message: `सूचना "${notice.title}" की स्थिति को "${statusLabel}" में बदला गया।`,
      });
      await loadData();
    } catch (err: any) {
      console.error('[RK STUDY CENTRE] Error toggling status:', err);
      setFeedback({
        type: 'error',
        message: err?.message || 'स्थिति बदलने में समस्या हुई।',
      });
    }
  };

  // Delete Notice
  const handleConfirmDelete = async () => {
    if (!noticeToDelete) return;
    setIsDeleting(true);
    try {
      await deleteNotice(noticeToDelete);
      setFeedback({
        type: 'success',
        message: `सूचना "${noticeToDelete.title}" सफलतापूर्वक हटा दी गई।`,
      });
      setNoticeToDelete(null);
      await loadData();
    } catch (err: any) {
      console.error('[RK STUDY CENTRE] Error deleting notice:', err);
      setFeedback({
        type: 'error',
        message: err?.message || 'सूचना हटाने में त्रुटि हुई।',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Derived filtered notices
  const filteredNotices = useMemo(() => {
    return notices.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesContent = item.content.toLowerCase().includes(q);
        const matchesType = item.noticeType.toLowerCase().includes(q);
        const matchesAudience = item.audience.toLowerCase().includes(q);
        const matchesClass = item.classLevel ? item.classLevel.toLowerCase().includes(q) : false;
        const matchesCourse = item.courseName ? item.courseName.toLowerCase().includes(q) : false;
        const matchesBatch = item.batchName ? item.batchName.toLowerCase().includes(q) : false;

        if (
          !matchesTitle &&
          !matchesContent &&
          !matchesType &&
          !matchesAudience &&
          !matchesClass &&
          !matchesCourse &&
          !matchesBatch
        ) {
          return false;
        }
      }

      // 2. Type Filter
      if (filterType !== 'all' && item.noticeType !== filterType) {
        return false;
      }

      // 3. Audience Filter
      if (filterAudience !== 'all' && item.audience !== filterAudience) {
        return false;
      }

      // 4. Class Filter
      if (filterClass !== 'all' && item.classLevel !== filterClass) {
        return false;
      }

      // 5. Priority Filter
      if (filterPriority !== 'all' && item.priority !== filterPriority) {
        return false;
      }

      // 6. Status Filter
      if (filterStatus !== 'all' && item.publishStatus !== filterStatus) {
        return false;
      }

      return true;
    });
  }, [notices, searchQuery, filterType, filterAudience, filterClass, filterPriority, filterStatus]);

  // Metrics summary
  const metrics = useMemo(() => {
    const total = notices.length;
    const published = notices.filter((n) => n.publishStatus === 'published').length;
    const draft = notices.filter((n) => n.publishStatus === 'draft').length;
    const archived = notices.filter((n) => n.publishStatus === 'archived').length;
    return { total, published, draft, archived };
  }, [notices]);

  // Priority Badge Helper
  const getPriorityBadge = (priority: NoticePriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            अति आवश्यक (Urgent)
          </span>
        );
      case 'important':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            महत्वपूर्ण (Important)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            सामान्य (Normal)
          </span>
        );
    }
  };

  // Notice Type Badge Helper
  const getTypeBadge = (type: NoticeType) => {
    switch (type) {
      case 'circular':
        return <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg">📜 परिपत्र (Circular)</span>;
      case 'holiday':
        return <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">🏖️ अवकाश (Holiday)</span>;
      case 'exam':
        return <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-lg">📝 परीक्षा (Exam)</span>;
      case 'fee':
        return <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">💳 शुल्क (Fee)</span>;
      case 'attendance':
        return <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-lg">⏱️ उपस्थिति (Attendance)</span>;
      case 'important':
        return <span className="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg">⚡ विशेष (Important)</span>;
      default:
        return <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">📢 सामान्य सूचना (General)</span>;
    }
  };

  // Audience Label Helper
  const getAudienceLabel = (notice: NoticeItem) => {
    switch (notice.audience) {
      case 'students':
        return 'केवल विद्यार्थी (Students)';
      case 'teachers':
        return 'केवल शिक्षक (Teachers)';
      case 'specific_class':
        const clsMeta = CLASSES_METADATA.find((c) => c.id === notice.classLevel);
        return `कक्षा: ${clsMeta?.hindiName || notice.classLevel}`;
      case 'specific_course':
        return `कोर्स: ${notice.courseName || 'विशिष्ट कोर्स'}`;
      case 'specific_batch':
        return `बैच: ${notice.batchName}`;
      default:
        return 'सभी (All: छात्र व शिक्षक)';
    }
  };

  // Format date helper for UI display
  const formatDateDisplay = (isoStr?: string) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black uppercase tracking-wider border border-indigo-400/30">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>कार्य 13 • Institutional Notices & Circulars</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              सूचना एवं आधिकारिक परिपत्र प्रबंधन
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl leading-relaxed">
              छात्रों, शिक्षकों, विशिष्ट कक्षाओं एवं बैचों के लिए आधिकारिक नोटिस, अवकाश घोषणाएं, परीक्षा परिपत्र तथा आवश्यक निर्देश जारी व प्रबंधित करें।
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 flex-wrap">
            <button
              onClick={() => loadData(true)}
              disabled={isLoading || isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors border border-white/15 cursor-pointer disabled:opacity-50"
              title="डेटा रिफ्रेश करें"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'रिफ्रेश...' : 'रिफ्रेश'}</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm transition-all shadow-md cursor-pointer hover:scale-105 active:scale-100"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>नया नोटिस बनाएं (New Notice)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. In-App Feedback Banner (Toast / Alert) */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-semibold transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : feedback.type === 'error'
              ? 'bg-rose-50 text-rose-900 border border-rose-200'
              : 'bg-blue-50 text-blue-900 border border-blue-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {feedback.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
            {feedback.type === 'info' && <Bell className="w-5 h-5 text-blue-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">कुल सूचनाएं (Total Notices)</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{metrics.total}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">अभिलेखबद्ध सभी सूचनाएं</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">सक्रिय प्रकाशित (Published)</div>
          <div className="text-3xl font-black text-emerald-700 mt-2">{metrics.published}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">लाइव दर्शनीय सूचनाएं</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">प्रारूप (Drafts)</div>
          <div className="text-3xl font-black text-slate-700 mt-2">{metrics.draft}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">अप्रकाशित निजी नोटिस</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">संग्रहीत (Archived)</div>
          <div className="text-3xl font-black text-zinc-700 mt-2">{metrics.archived}</div>
          <div className="text-xs text-zinc-500 font-medium mt-1">पुराने या समाप्त नोटिस</div>
        </div>
      </div>

      {/* 4. Search and Combined Filters */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="शीर्षक, विवरण, प्रकार, दर्शक, कक्षा या बैच द्वारा खोजें..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
              setFilterAudience('all');
              setFilterClass('all');
              setFilterPriority('all');
              setFilterStatus('all');
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-colors cursor-pointer self-start lg:self-auto shrink-0"
          >
            फ़िल्टर साफ़ करें (Clear All)
          </button>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          {/* Type Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">प्रकार (Type)</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white cursor-pointer"
            >
              <option value="all">सभी प्रकार (All Types)</option>
              <option value="general">सामान्य सूचना (General)</option>
              <option value="circular">आधिकारिक परिपत्र (Circular)</option>
              <option value="holiday">अवकाश घोषणा (Holiday)</option>
              <option value="exam">परीक्षा सम्बन्धी (Exam)</option>
              <option value="fee">शुल्क सम्बन्धी (Fee)</option>
              <option value="attendance">उपस्थिति / अनुशासन (Attendance)</option>
              <option value="important">विशेष तात्कालिक (Important)</option>
            </select>
          </div>

          {/* Audience Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">लक्षित दर्शक (Audience)</label>
            <select
              value={filterAudience}
              onChange={(e) => setFilterAudience(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white cursor-pointer"
            >
              <option value="all">सभी दर्शक (All)</option>
              <option value="students">केवल विद्यार्थी (Students)</option>
              <option value="teachers">केवल शिक्षक (Teachers)</option>
              <option value="specific_class">विशिष्ट कक्षा (Class)</option>
              <option value="specific_course">विशिष्ट कोर्स (Course)</option>
              <option value="specific_batch">विशिष्ट बैच (Batch)</option>
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">कक्षा (Class)</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white cursor-pointer"
            >
              <option value="all">सभी कक्षाएं (All Classes)</option>
              {CLASSES_METADATA.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.hindiName}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">प्राथमिकता (Priority)</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white cursor-pointer"
            >
              <option value="all">सभी प्राथमिकताएं</option>
              <option value="normal">सामान्य (Normal)</option>
              <option value="important">महत्वपूर्ण (Important)</option>
              <option value="urgent">अति आवश्यक (Urgent)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">स्थिति (Status)</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white cursor-pointer"
            >
              <option value="all">सभी स्थितियां (All Status)</option>
              <option value="published">प्रकाशित (Published)</option>
              <option value="draft">ड्राफ्ट (Draft)</option>
              <option value="archived">संग्रहीत (Archived)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Notice List & Cards View */}
      {isLoading ? (
        <div className="py-20 bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-800 font-bold text-sm">सूचनाएं लोड हो रही हैं...</p>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Bell className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-800">कोई सूचना नहीं मिली (No Notices Found)</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              वर्तमान फ़िल्टर या खोज के अनुरूप कोई नोटिस रिकॉर्ड मौजूद नहीं है। आप नया नोटिस सृजित कर सकते हैं।
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>पहला नोटिस बनाएं</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredNotices.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-3xl border transition-all p-5 sm:p-6 shadow-sm hover:shadow-md flex flex-col justify-between gap-4 ${
                item.priority === 'urgent'
                  ? 'border-rose-300 bg-rose-50/20'
                  : item.priority === 'important'
                  ? 'border-amber-200 bg-amber-50/15'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                {/* Badges Bar */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getTypeBadge(item.noticeType)}
                    {getPriorityBadge(item.priority)}
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{getAudienceLabel(item)}</span>
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {item.publishStatus === 'published' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        प्रकाशित (Published)
                      </span>
                    ) : item.publishStatus === 'draft' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-200 text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        ड्राफ्ट (Draft)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-zinc-200 text-zinc-700">
                        <Archive className="w-3.5 h-3.5 text-zinc-500" />
                        संग्रहीत (Archived)
                      </span>
                    )}
                  </div>
                </div>

                {/* Notice Title & Content Snippet */}
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed mt-1 line-clamp-2">
                    {item.content}
                  </p>
                </div>

                {/* Metadata Row: Dates & Attachment */}
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 flex-wrap pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>प्रकाशन: {formatDateDisplay(item.publishAt)}</span>
                  </span>

                  {item.expiresAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>समाप्ति: {formatDateDisplay(item.expiresAt)}</span>
                    </span>
                  )}

                  {item.attachmentUrl && (
                    <span className="flex items-center gap-1 text-blue-700 font-bold">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>संलग्नक मौजूद ({item.attachmentType === 'link' ? 'वेब लिंक' : item.attachmentSize || 'फाइल'})</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewNotice(item)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>देखें (Preview)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(item)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer border border-blue-200"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>संपादित करें (Edit)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Toggle Buttons */}
                  {item.publishStatus === 'draft' && (
                    <button
                      type="button"
                      onClick={() => handleQuickStatusChange(item, 'published')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                      title="अभी प्रकाशित करें"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>प्रकाशित करें</span>
                    </button>
                  )}

                  {item.publishStatus === 'published' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(item, 'draft')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                        title="ड्राफ्ट बनाएं"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>ड्राफ्ट</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(item, 'archived')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition-colors cursor-pointer"
                        title="आर्काइव करें"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>आर्काइव</span>
                      </button>
                    </>
                  )}

                  {item.publishStatus === 'archived' && (
                    <button
                      type="button"
                      onClick={() => handleQuickStatusChange(item, 'published')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 transition-colors cursor-pointer"
                      title="पुनः प्रकाशित करें"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>पुनः प्रकाशित करें</span>
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setNoticeToDelete(item)}
                    className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                    title="सूचना हटाएं"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. In-App Create / Edit Modal */}
      {isFormModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border-2 border-slate-200 shadow-2xl space-y-6 my-8 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  {editingNotice ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {editingNotice ? 'सूचना संपादित करें (Edit Notice)' : 'नई सूचना जारी करें (New Notice)'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    शीर्षक, लक्षित दर्शक, प्राथमिकता तथा संलग्नक विवरण भरें
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In-Modal Error Banner */}
            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-5">
              {/* Notice Title */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  1. सूचना शीर्षक (Notice Title) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={250}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="उदा. होली अवकाश की आधिकारिक घोषणा / मासिक परीक्षा डेट शीट जारी..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Notice Content */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  2. विस्तृत विवरण (Content / Message) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="यहाँ सूचना का संपूर्ण विवरण लिखें..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Type & Priority Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    3. सूचना का प्रकार (Notice Type) *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as NoticeType)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 bg-white cursor-pointer"
                  >
                    <option value="general">📢 सामान्य सूचना (General)</option>
                    <option value="circular">📜 आधिकारिक परिपत्र (Circular)</option>
                    <option value="holiday">🏖️ अवकाश घोषणा (Holiday)</option>
                    <option value="exam">📝 परीक्षा सम्बन्धी (Exam)</option>
                    <option value="fee">💳 शुल्क सम्बन्धी (Fee)</option>
                    <option value="attendance">⏱️ उपस्थिति / अनुशासन (Attendance)</option>
                    <option value="important">⚡ विशेष तात्कालिक (Important)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    4. प्राथमिकता (Priority) *
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as NoticePriority)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 bg-white cursor-pointer"
                  >
                    <option value="normal">सामान्य (Normal)</option>
                    <option value="important">महत्वपूर्ण (Important)</option>
                    <option value="urgent">अति आवश्यक (Urgent)</option>
                  </select>
                </div>
              </div>

              {/* Target Audience Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  5. लक्षित दर्शक (Target Audience) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'सभी (All)' },
                    { id: 'students', label: 'विद्यार्थी (Students)' },
                    { id: 'teachers', label: 'शिक्षक (Teachers)' },
                    { id: 'specific_class', label: 'विशिष्ट कक्षा (Class)' },
                    { id: 'specific_course', label: 'विशिष्ट कोर्स (Course)' },
                    { id: 'specific_batch', label: 'विशिष्ट बैच (Batch)' },
                  ].map((aud) => (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => setFormAudience(aud.id as NoticeAudience)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        formAudience === aud.id
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {aud.label}
                    </button>
                  ))}
                </div>

                {/* Conditional Audience Options */}
                {formAudience === 'specific_class' && (
                  <div className="pt-2 animate-in fade-in">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">कक्षा चुनें (Select Class) *</label>
                    <select
                      value={formClassLevel}
                      onChange={(e) => setFormClassLevel(e.target.value as ClassLevel)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                    >
                      {CLASSES_METADATA.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.hindiName} ({c.name})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formAudience === 'specific_course' && (
                  <div className="pt-2 animate-in fade-in">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">कोर्स चुनें (Select Course) *</label>
                    <select
                      value={formCourseId}
                      onChange={(e) => setFormCourseId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                    >
                      <option value="">-- कोर्स चुनें --</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({c.classLevel})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formAudience === 'specific_batch' && (
                  <div className="pt-2 animate-in fade-in">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">बैच का नाम दर्ज करें (Batch Name) *</label>
                    <input
                      type="text"
                      value={formBatchName}
                      onChange={(e) => setFormBatchName(e.target.value)}
                      placeholder="उदा. मॉर्निंग लक्ष्य 2026 बैच..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Status & Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    6. स्थिति (Status) *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as NoticePublishStatus)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white cursor-pointer"
                  >
                    <option value="published">प्रकाशित (Published)</option>
                    <option value="draft">ड्राफ्ट (Draft)</option>
                    <option value="archived">संग्रहीत (Archived)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    7. प्रकाशन तिथि (Publish At)
                  </label>
                  <input
                    type="datetime-local"
                    value={formPublishAt}
                    onChange={(e) => setFormPublishAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    8. समाप्ति तिथि (Expires At - Opt)
                  </label>
                  <input
                    type="datetime-local"
                    value={formExpiresAt}
                    onChange={(e) => setFormExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                  />
                </div>
              </div>

              {/* Attachment Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    9. संलग्नक (Attachment - Optional)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAttachmentMode('none')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                        attachmentMode === 'none' ? 'bg-slate-300 text-slate-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      कोई नहीं
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttachmentMode('file')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                        attachmentMode === 'file' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      PDF / इमेज फ़ाइल
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttachmentMode('link')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                        attachmentMode === 'link' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      वेब URL लिंक
                    </button>
                  </div>
                </div>

                {attachmentMode === 'file' && (
                  <div className="space-y-2 pt-2 animate-in fade-in">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-blue-400 p-4 rounded-xl text-center cursor-pointer bg-white transition-colors"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf,image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setAttachmentFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      {attachmentFile ? (
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700">
                          <Paperclip className="w-4 h-4" />
                          <span>{attachmentFile.name} ({formatNoticeBytes(attachmentFile.size)})</span>
                        </div>
                      ) : existingAttachmentName ? (
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700">
                          <Paperclip className="w-4 h-4 text-blue-600" />
                          <span>वर्तमान फ़ाइल: {existingAttachmentName} (बदलने के लिए क्लिक करें)</span>
                        </div>
                      ) : (
                        <div className="space-y-1 text-slate-500">
                          <Upload className="w-5 h-5 mx-auto text-blue-600" />
                          <div className="text-xs font-bold text-slate-700">यहाँ क्लिक कर फ़ाइल चुनें (PDF या Image, max 25MB)</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {attachmentMode === 'link' && (
                  <div className="pt-2 animate-in fade-in">
                    <input
                      type="url"
                      value={attachmentExternalUrl}
                      onChange={(e) => setAttachmentExternalUrl(e.target.value)}
                      placeholder="उदा. https://drive.google.com/file/... या कोई अन्य लिंक"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-black transition-colors cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>सहेजा जा रहा है...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>{editingNotice ? 'अपडेट करें (Save Changes)' : 'सूचना जारी करें (Publish)'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. In-App Preview Modal */}
      {previewNotice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border-2 border-slate-200 shadow-2xl space-y-6 my-8 animate-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {getTypeBadge(previewNotice.noticeType)}
                  {getPriorityBadge(previewNotice.priority)}
                </div>
                <h3 className="text-xl font-black text-slate-900 pt-1 leading-snug">
                  {previewNotice.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewNotice(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Audience and Target Row */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 space-y-1">
              <div>
                🎯 लक्षित दर्शक:&nbsp;
                <span className="text-blue-700 font-black">{getAudienceLabel(previewNotice)}</span>
              </div>
              <div>
                📅 प्रकाशन तिथि: {formatDateDisplay(previewNotice.publishAt)}
                {previewNotice.expiresAt && ` • समाप्ति: ${formatDateDisplay(previewNotice.expiresAt)}`}
              </div>
            </div>

            {/* Notice Full Content */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">सूचना विवरण</h4>
              <div className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-wrap p-4 rounded-2xl bg-slate-50 border border-slate-100">
                {previewNotice.content}
              </div>
            </div>

            {/* Attachment preview if any */}
            {previewNotice.attachmentUrl && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <Paperclip className="w-4 h-4 text-blue-600" />
                  <span>संलग्नक फ़ाइल: {previewNotice.attachmentName || 'संलग्नक'}</span>
                </div>
                <a
                  href={previewNotice.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>खोलें / डाउनलोड करें</span>
                </a>
              </div>
            )}

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewNotice(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors cursor-pointer"
              >
                बंद करें (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. In-App Delete Confirmation Modal */}
      {noticeToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border-2 border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  सूचना हटाने की पुष्टि करें (Confirm Delete)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  क्या आप सचमुच सूचना <strong className="text-slate-900">"{noticeToDelete.title}"</strong> को स्थायी रूप से हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setNoticeToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-black transition-colors cursor-pointer disabled:opacity-60 shadow-md"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>हटाया जा रहा है...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>हाँ, स्थायी रूप से हटाएं</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
