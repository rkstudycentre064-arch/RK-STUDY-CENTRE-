/**
 * RK STUDY CENTRE - Institutional Exams & Date Sheet Manager (Task 10)
 * 
 * Provides comprehensive exam scheduling, multi-subject date sheets,
 * invigilation allocation, status transitions, and class-wise filtering.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  Loader2,
  GraduationCap,
  CalendarClock,
  PlayCircle,
  XCircle,
  FileEdit,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowUpDown,
  FileText,
  ShieldCheck,
  Award,
} from 'lucide-react';
import type {
  ClassLevel,
  Exam,
  ExamStatus,
  ExamType,
  ExamMode,
  ExamSubjectSchedule,
  CreateExamInput,
  Course,
  Teacher,
  Subject,
} from '../../types';
import {
  getAllExams,
  createExam,
  updateExam,
  deleteExam,
  updateExamStatus,
  getExamTypeLabel,
  getExamStatusMeta,
  generateScheduleSlotId,
} from '../../services/examService';
import { getAllCourses } from '../../services/courseService';
import { getAllTeachers } from '../../services/teacherService';
import { SUBJECTS, CLASSES_METADATA } from '../../lib/constants';

export function OwnerExamManager() {
  // Data state
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassLevel | 'all'>('all');
  const [selectedType, setSelectedType] = useState<ExamType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ExamStatus | 'all'>('all');
  const [selectedMode, setSelectedMode] = useState<ExamMode | 'all'>('all');

  // Expanded card state
  const [expandedExamIds, setExpandedExamIds] = useState<Set<string>>(new Set());

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [viewingDateSheetExam, setViewingDateSheetExam] = useState<Exam | null>(null);
  const [deletingExam, setDeletingExam] = useState<Exam | null>(null);

  // Form State for Create / Edit
  const [formData, setFormData] = useState<{
    title: string;
    hindiTitle: string;
    examType: ExamType;
    classLevel: ClassLevel;
    courseId: string;
    academicYear: string;
    examMode: ExamMode;
    startDate: string;
    endDate: string;
    roomHallAllocation: string;
    instructions: string;
    notes: string;
    status: ExamStatus;
    schedule: ExamSubjectSchedule[];
  }>({
    title: '',
    hindiTitle: '',
    examType: 'unit_test',
    classLevel: 'class-10',
    courseId: '',
    academicYear: '2025-2026',
    examMode: 'offline',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    roomHallAllocation: '',
    instructions: '',
    notes: '',
    status: 'scheduled',
    schedule: [],
  });

  // Load all initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [examsData, coursesData, teachersData] = await Promise.all([
        getAllExams(),
        getAllCourses(),
        getAllTeachers(),
      ]);
      setExams(examsData);
      setCourses(coursesData);
      setTeachers(teachersData);
      // Auto expand first exam if available
      if (examsData.length > 0) {
        setExpandedExamIds(new Set([examsData[0].id]));
      }
    } catch (err: any) {
      console.error('[RK STUDY CENTRE] Error loading exam data:', err);
      setFeedback({
        type: 'error',
        message: 'डेटा लोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto clear feedback after 5 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Available subjects for the currently selected class in form
  const classSubjects = useMemo(() => {
    return SUBJECTS.filter((s) => s.classLevel === formData.classLevel);
  }, [formData.classLevel]);

  // Available courses for the currently selected class in form
  const classCourses = useMemo(() => {
    return courses.filter((c) => c.classLevel === formData.classLevel);
  }, [courses, formData.classLevel]);

  // Filtered Exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      // Class Level Filter
      if (selectedClass !== 'all' && exam.classLevel !== selectedClass) return false;
      // Exam Type Filter
      if (selectedType !== 'all' && exam.examType !== selectedType) return false;
      // Status Filter
      if (selectedStatus !== 'all' && exam.status !== selectedStatus) return false;
      // Mode Filter
      if (selectedMode !== 'all' && exam.examMode !== selectedMode) return false;
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesTitle = exam.title.toLowerCase().includes(query) || (exam.hindiTitle?.toLowerCase().includes(query) ?? false);
        const matchesCourse = exam.courseName?.toLowerCase().includes(query) || exam.batchName?.toLowerCase().includes(query);
        const matchesRoom = exam.roomHallAllocation?.toLowerCase().includes(query);
        const matchesSubject = exam.schedule.some((s) => s.subjectName.toLowerCase().includes(query));
        const matchesInvigilator = exam.schedule.some((s) => s.invigilatorName?.toLowerCase().includes(query));
        if (!matchesTitle && !matchesCourse && !matchesRoom && !matchesSubject && !matchesInvigilator) {
          return false;
        }
      }
      return true;
    });
  }, [exams, selectedClass, selectedType, selectedStatus, selectedMode, searchTerm]);

  // Metrics
  const metrics = useMemo(() => {
    const total = exams.length;
    const scheduled = exams.filter((e) => e.status === 'scheduled').length;
    const ongoing = exams.filter((e) => e.status === 'ongoing').length;
    const completed = exams.filter((e) => e.status === 'completed').length;
    const drafts = exams.filter((e) => e.status === 'draft').length;
    return { total, scheduled, ongoing, completed, drafts };
  }, [exams]);

  // Toggle card expansion
  const toggleExpand = (id: string) => {
    setExpandedExamIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Open Create Modal (Clean empty state)
  const handleOpenCreateModal = () => {
    const defaultClass: ClassLevel = selectedClass !== 'all' ? selectedClass : 'class-10';
    const defaultCourse = courses.find((c) => c.classLevel === defaultClass);
    const firstSubject = SUBJECTS.find((s) => s.classLevel === defaultClass);
    const todayStr = new Date().toISOString().split('T')[0];

    const initialSchedule: ExamSubjectSchedule[] = firstSubject
      ? [
          {
            id: generateScheduleSlotId(),
            subjectId: firstSubject.id,
            subjectName: `${firstSubject.hindiName} (${firstSubject.name})`,
            examDate: todayStr,
            startTime: '09:30 AM',
            endTime: '12:30 PM',
            durationMinutes: 180,
            maxMarks: 100,
            passingMarks: 33,
            roomOrHall: 'कमरा सं. 101',
            invigilatorId: teachers[0]?.id || '',
            invigilatorName: teachers[0]?.name || '',
            syllabus: '',
          },
        ]
      : [];

    setFormData({
      title: '',
      hindiTitle: '',
      examType: 'unit_test',
      classLevel: defaultClass,
      courseId: defaultCourse?.id || '',
      academicYear: '2025-2026',
      examMode: 'offline',
      startDate: todayStr,
      endDate: todayStr,
      roomHallAllocation: 'कमरा सं. 101',
      instructions: '1. परीक्षा प्रारंभ होने से 15 मिनट पूर्व परीक्षा कक्ष में उपस्थित हों।\n2. प्रवेश पत्र व आवश्यक लेखन सामग्री साथ लाएं।\n3. इलेक्ट्रॉनिक उपकरण पूर्णतः वर्जित हैं।',
      notes: '',
      status: 'scheduled',
      schedule: initialSchedule,
    });
    setEditingExam(null);
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      hindiTitle: exam.hindiTitle || '',
      examType: exam.examType,
      classLevel: exam.classLevel,
      courseId: exam.courseId || '',
      academicYear: exam.academicYear || '2025-2026',
      examMode: exam.examMode,
      startDate: exam.startDate,
      endDate: exam.endDate,
      roomHallAllocation: exam.roomHallAllocation || '',
      instructions: exam.instructions || '',
      notes: exam.notes || '',
      status: exam.status,
      schedule: exam.schedule.map((s) => ({ ...s })),
    });
    setIsCreateModalOpen(true);
  };

  // Subject schedule management in form
  const handleAddSubjectSlot = () => {
    const availableSubject = classSubjects.find(
      (cs) => !formData.schedule.some((slot) => slot.subjectId === cs.id)
    ) || classSubjects[0];

    const newSlot: ExamSubjectSchedule = {
      id: generateScheduleSlotId(),
      subjectId: availableSubject?.id || 'gen_sub',
      subjectName: availableSubject ? `${availableSubject.hindiName} (${availableSubject.name})` : 'सामान्य विषय',
      examDate: formData.startDate,
      startTime: '09:30 AM',
      endTime: '12:30 PM',
      durationMinutes: 180,
      maxMarks: 100,
      passingMarks: 33,
      roomOrHall: formData.roomHallAllocation || 'कमरा सं. 101',
      invigilatorId: teachers[0]?.id || '',
      invigilatorName: teachers[0]?.name || '',
      syllabus: 'सम्पूर्ण पाठ्यक्रम',
    };

    setFormData((prev) => ({
      ...prev,
      schedule: [...prev.schedule, newSlot],
    }));
  };

  const handleRemoveSubjectSlot = (slotId: string) => {
    if (formData.schedule.length <= 1) {
      setFeedback({ type: 'error', message: 'कम से कम एक विषय की परीक्षा अनुसूची अनिवार्य है।' });
      return;
    }
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((s) => s.id !== slotId),
    }));
  };

  const handleUpdateSubjectSlot = (slotId: string, updates: Partial<ExamSubjectSchedule>) => {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.map((slot) => {
        if (slot.id === slotId) {
          const updated = { ...slot, ...updates };
          // If subjectId changed, auto-update subjectName
          if (updates.subjectId) {
            const matched = classSubjects.find((cs) => cs.id === updates.subjectId);
            if (matched) {
              updated.subjectName = `${matched.hindiName} (${matched.name})`;
            }
          }
          // If invigilatorId changed, auto-update invigilatorName
          if (updates.invigilatorId) {
            const matchedT = teachers.find((t) => t.id === updates.invigilatorId);
            if (matchedT) {
              updated.invigilatorName = matchedT.name;
            }
          }
          return updated;
        }
        return slot;
      }),
    }));
  };

  // Class Change handler in Form
  const handleFormClassChange = (newClass: ClassLevel) => {
    const newClassSubjects = SUBJECTS.filter((s) => s.classLevel === newClass);
    const newClassCourses = courses.filter((c) => c.classLevel === newClass);
    const defaultCourse = newClassCourses[0];
    const firstSubject = newClassSubjects[0];

    const newSchedule: ExamSubjectSchedule[] = firstSubject
      ? [
          {
            id: generateScheduleSlotId(),
            subjectId: firstSubject.id,
            subjectName: `${firstSubject.hindiName} (${firstSubject.name})`,
            examDate: formData.startDate || new Date().toISOString().split('T')[0],
            startTime: '09:30 AM',
            endTime: '12:30 PM',
            durationMinutes: 180,
            maxMarks: 100,
            passingMarks: 33,
            roomOrHall: formData.roomHallAllocation || 'कमरा सं. 101',
            invigilatorId: teachers[0]?.id || '',
            invigilatorName: teachers[0]?.name || '',
            syllabus: '',
          },
        ]
      : [];

    setFormData((prev) => ({
      ...prev,
      classLevel: newClass,
      courseId: defaultCourse?.id || '',
      schedule: newSchedule,
    }));
  };

  // Submit Create / Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setFeedback({ type: 'error', message: 'कृपया परीक्षा का नाम / शीर्षक दर्ज करें।' });
      return;
    }
    if (formData.schedule.length === 0) {
      setFeedback({ type: 'error', message: 'कम से कम एक विषय की परीक्षा अनुसूची जोड़ें।' });
      return;
    }

    const matchedCourse = courses.find((c) => c.id === formData.courseId);

    // Auto calculate start & end dates from schedule if available
    const scheduleDates = formData.schedule
      .map((s) => s.examDate)
      .filter(Boolean)
      .sort();
    const effectiveStartDate = scheduleDates.length > 0 ? scheduleDates[0] : formData.startDate;
    const effectiveEndDate = scheduleDates.length > 0 ? scheduleDates[scheduleDates.length - 1] : formData.endDate;

    const totalCalculatedMarks = formData.schedule.reduce((acc, curr) => acc + (Number(curr.maxMarks) || 0), 0);
    const totalPassingMarks = formData.schedule.reduce((acc, curr) => acc + (Number(curr.passingMarks) || 0), 0);

    const payload: CreateExamInput = {
      title: formData.title.trim(),
      hindiTitle: formData.hindiTitle.trim() || undefined,
      examType: formData.examType,
      classLevel: formData.classLevel,
      courseId: formData.courseId || undefined,
      courseName: matchedCourse ? matchedCourse.title : undefined,
      batchName: matchedCourse ? matchedCourse.batchName : undefined,
      academicYear: formData.academicYear || '2025-2026',
      examMode: formData.examMode,
      startDate: effectiveStartDate,
      endDate: effectiveEndDate,
      totalMarks: totalCalculatedMarks,
      passingMarks: totalPassingMarks,
      status: formData.status,
      schedule: formData.schedule,
      roomHallAllocation: formData.roomHallAllocation.trim() || undefined,
      instructions: formData.instructions.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    };

    setActionLoading(true);
    try {
      if (editingExam) {
        await updateExam(editingExam.id, payload);
        setFeedback({
          type: 'success',
          message: `परीक्षा "${payload.title}" की जानकारी सफलतापूर्वक अपडेट की गई।`,
        });
      } else {
        await createExam(payload);
        setFeedback({
          type: 'success',
          message: `नई परीक्षा "${payload.title}" सफलतापूर्वक शेड्यूल की गई।`,
        });
      }
      setIsCreateModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error('[RK STUDY CENTRE] Save exam error:', err);
      setFeedback({
        type: 'error',
        message: err?.message || 'परीक्षा सहेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Status Change
  const handleQuickStatusChange = async (examId: string, newStatus: ExamStatus) => {
    setActionLoading(true);
    try {
      await updateExamStatus(examId, newStatus);
      setExams((prev) =>
        prev.map((e) => (e.id === examId ? { ...e, status: newStatus, updatedAt: new Date().toISOString() } : e))
      );
      setFeedback({
        type: 'success',
        message: 'परीक्षा की स्थिति सफलतापूर्वक अपडेट की गई।',
      });
    } catch (err: any) {
      console.error('[RK STUDY CENTRE] Error updating exam status:', err);
      setFeedback({
        type: 'error',
        message: 'स्थिति अपडेट करने में त्रुटि हुई।',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Exam
  const handleConfirmDelete = async () => {
    if (!deletingExam) return;
    setActionLoading(true);
    try {
      await deleteExam(deletingExam.id);
      setExams((prev) => prev.filter((e) => e.id !== deletingExam.id));
      setFeedback({
        type: 'success',
        message: `परीक्षा "${deletingExam.title}" को सफलतापूर्वक हटाया गया।`,
      });
      setDeletingExam(null);
    } catch (err: any) {
      console.error('[RK STUDY CENTRE] Error deleting exam:', err);
      setFeedback({
        type: 'error',
        message: 'परीक्षा हटाने में त्रुटि हुई।',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* शीर्ष शीर्षक एवं मुख्य क्रिया बटन (Header & Main Action) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Task 10 • Institutional Exams & Date Sheet</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            संस्थान परीक्षा व समय सारणी प्रबंधन (Exams Management)
          </h1>
          <p className="text-slate-600 text-sm font-medium">
            कक्षा 9वीं से 12वीं तक की त्रैमासिक, अर्द्धवार्षिक, मासिक टेस्ट, प्री-बोर्ड परीक्षा अनुसूची व डेट शीट का केंद्रीकृत प्रबंधन।
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadData}
            disabled={loading || actionLoading}
            className="p-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            title="रिफ्रेश करें"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black transition-all shadow-md hover:shadow-indigo-200 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>नई परीक्षा शेड्यूल करें (New Exam)</span>
          </button>
        </div>
      </div>

      {/* अलर्ट संदेश (Feedback Notification) */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <p className="text-sm font-bold">{feedback.message}</p>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* मेट्रिक्स सारांश कार्ड (Summary Metric Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">कुल परीक्षाएं</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics.total}</span>
            <span className="text-xs font-bold text-slate-500">कुल रिकॉर्ड</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">प्रस्तावित / आगामी</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">{metrics.scheduled}</span>
            <span className="text-xs font-bold text-slate-500">शेड्यूल</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">वर्तमान में जारी</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{metrics.ongoing}</span>
            <span className="text-xs font-bold text-slate-500">सक्रिय</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">सम्पन्न परीक्षाएं</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{metrics.completed}</span>
            <span className="text-xs font-bold text-slate-500">पूर्ण</span>
          </div>
        </div>
      </div>

      {/* खोज एवं फ़िल्टर बार (Search & Filters Bar) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="परीक्षा नाम, विषय, कक्ष, शिक्षक या बैच से खोजें..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm font-medium outline-hidden"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* कक्षा फ़िल्टर */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold bg-white text-slate-700 outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">सभी कक्षाएं (All Classes)</option>
              <option value="class-9">कक्षा 9वीं</option>
              <option value="class-10">कक्षा 10वीं (मैट्रिक)</option>
              <option value="class-11">कक्षा 11वीं</option>
              <option value="class-12">कक्षा 12वीं (इंटर)</option>
            </select>

            {/* प्रकार फ़िल्टर */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold bg-white text-slate-700 outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">सभी प्रकार (All Types)</option>
              <option value="unit_test">इकाई परीक्षा (Unit Test)</option>
              <option value="monthly">मासिक टेस्ट (Monthly Test)</option>
              <option value="quarterly">त्रैमासिक परीक्षा (Quarterly)</option>
              <option value="half_yearly">अर्द्धवार्षिक परीक्षा (Half-Yearly)</option>
              <option value="annual">वार्षिक परीक्षा (Annual)</option>
              <option value="model_board">बोर्ड मॉडल / प्री-बोर्ड</option>
              <option value="mock_test">मॉक टेस्ट (Mock Test)</option>
            </select>

            {/* स्थिति फ़िल्टर */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold bg-white text-slate-700 outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">सभी स्थिति (All Status)</option>
              <option value="scheduled">शेड्यूल (Scheduled)</option>
              <option value="ongoing">वर्तमान में जारी (Ongoing)</option>
              <option value="completed">सम्पन्न (Completed)</option>
              <option value="draft">प्रारूप (Draft)</option>
              <option value="cancelled">रद्द (Cancelled)</option>
            </select>

            {/* मोड फ़िल्टर */}
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold bg-white text-slate-700 outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">सभी मोड (All Modes)</option>
              <option value="offline">ऑफलाइन (Pen-Paper)</option>
              <option value="online">ऑनलाइन (CBT)</option>
              <option value="hybrid">हाइब्रिड (Hybrid)</option>
            </select>

            {(selectedClass !== 'all' || selectedType !== 'all' || selectedStatus !== 'all' || selectedMode !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedClass('all');
                  setSelectedType('all');
                  setSelectedStatus('all');
                  setSelectedMode('all');
                  setSearchTerm('');
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                रीसेट करें
              </button>
            )}
          </div>
        </div>
      </div>

      {/* परीक्षा सूची (Exam List & Multi-Subject Date Sheets) */}
      {loading ? (
        <div className="py-20 bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
          <p className="text-slate-600 font-bold text-sm">परीक्षा रिकॉर्ड लोड हो रहे हैं...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="py-16 bg-white rounded-3xl border border-slate-200 text-center p-8 space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">अभी कोई परीक्षा निर्धारित नहीं है।</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">
              संस्थान में कक्षा 9वीं से 12वीं तक के लिए पहली परीक्षा और डेट शीट शेड्यूल करें।
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black transition-all cursor-pointer shadow-md hover:shadow-indigo-200"
          >
            <Plus className="w-4 h-4" />
            <span>+ पहली परीक्षा जोड़ें</span>
          </button>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="py-16 bg-white rounded-3xl border border-slate-200 text-center p-8 space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">कोई matching exam नहीं मिला।</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">
              वर्तमान खोज या फ़िल्टर मानदंडों के अनुसार कोई परीक्षा रिकॉर्ड उपलब्ध नहीं है। कृपया फ़िल्टर रीसेट करें।
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedClass('all');
              setSelectedType('all');
              setSelectedStatus('all');
              setSelectedMode('all');
              setSearchTerm('');
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            <span>फ़िल्टर रीसेट करें (Reset Filters)</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExams.map((exam) => {
            const isExpanded = expandedExamIds.has(exam.id);
            const statusMeta = getExamStatusMeta(exam.status);
            const typeLabel = getExamTypeLabel(exam.examType);
            const classMeta = CLASSES_METADATA.find((c) => c.id === exam.classLevel);

            return (
              <div
                key={exam.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
              >
                {/* कार्ड मुख्य भाग (Card Main Header) */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-black">
                          {classMeta ? classMeta.hindiName : exam.classLevel}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
                          {typeLabel.hi}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold capitalize">
                          मोड: {exam.examMode === 'offline' ? 'ऑफलाइन (Pen-Paper)' : exam.examMode === 'online' ? 'ऑनलाइन (CBT)' : 'हाइब्रिड'}
                        </span>
                        {exam.academicYear && (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold">
                            सत्र: {exam.academicYear}
                          </span>
                        )}
                      </div>

                      <div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                          {exam.hindiTitle ? `${exam.hindiTitle} • ${exam.title}` : exam.title}
                        </h2>
                        {exam.courseName && (
                          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
                            संबद्ध बैच: <span className="text-indigo-600 font-bold">{exam.courseName}</span>
                            {exam.batchName && ` (${exam.batchName})`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* स्थिति एवं मुख्य क्रियाएँ */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* स्थिति चयनकर्ता */}
                      <select
                        value={exam.status}
                        onChange={(e) => handleQuickStatusChange(exam.id, e.target.value as ExamStatus)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-black cursor-pointer outline-hidden transition-colors ${statusMeta.badgeBg} ${statusMeta.badgeText} ${statusMeta.badgeBorder}`}
                      >
                        <option value="scheduled">शेड्यूल (Scheduled)</option>
                        <option value="ongoing">वर्तमान में जारी (Ongoing)</option>
                        <option value="completed">सम्पन्न (Completed)</option>
                        <option value="draft">प्रारूप (Draft)</option>
                        <option value="cancelled">रद्द (Cancelled)</option>
                      </select>

                      <button
                        onClick={() => setViewingDateSheetExam(exam)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-black transition-colors cursor-pointer"
                        title="समय सारणी देखें / प्रिंट करें"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>डेट शीट (Date Sheet)</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(exam)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        title="संपादित करें"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeletingExam(exam)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                        title="हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* त्वरित विवरण पट्टी (Quick Info Strip) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                      <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>
                        {exam.startDate} से {exam.endDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                      <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>{exam.schedule.length} विषय सम्मिलित</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                      <Award className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>
                        कुल पूर्णांक: <strong className="text-slate-900">{exam.totalMarks || 100}</strong> (उत्तीर्णांक: {exam.passingMarks || 33})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold truncate">
                      <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="truncate">{exam.roomHallAllocation || 'संस्थान परीक्षा कक्ष'}</span>
                    </div>
                  </div>
                </div>

                {/* संक्षिप्त विषय सारणी टॉगल बटन (Expand / Collapse Toggle) */}
                <button
                  onClick={() => toggleExpand(exam.id)}
                  className="w-full px-5 sm:px-6 py-2.5 bg-slate-50 hover:bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>विषयवार परीक्षा अनुसूची ({exam.schedule.length} पेपर्स)</span>
                  </span>
                  <span className="flex items-center gap-1 text-indigo-600">
                    {isExpanded ? (
                      <>
                        <span>संक्षिप्त करें</span>
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>विस्तृत अनुसूची देखें</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </span>
                </button>

                {/* विस्तृत विषयवार सारणी (Expanded Schedule Table) */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 bg-slate-50/70 border-t border-slate-200 space-y-4 animate-in fade-in duration-150">
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-black">
                            <th className="py-3 px-4">दिनांक व वार</th>
                            <th className="py-3 px-4">समय (Shift)</th>
                            <th className="py-3 px-4">विषय (Subject)</th>
                            <th className="py-3 px-4 text-center">पूर्णांक / उत्तीर्णांक</th>
                            <th className="py-3 px-4">कक्ष / हॉल</th>
                            <th className="py-3 px-4">वीक्षक (Invigilator)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {exam.schedule.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-4 text-center text-slate-400 font-bold">
                                कोई विषय अनुसूची दर्ज नहीं है।
                              </td>
                            </tr>
                          ) : (
                            exam.schedule.map((slot, sIdx) => {
                              const examDateObj = new Date(slot.examDate);
                              const dayNames = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
                              const dayName = !isNaN(examDateObj.getTime()) ? dayNames[examDateObj.getDay()] : '';

                              return (
                                <tr key={slot.id || sIdx} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="py-3 px-4">
                                    <div className="font-bold text-slate-900">{slot.examDate}</div>
                                    <div className="text-xs text-indigo-600 font-bold">{dayName}</div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="font-bold text-slate-800">
                                      {slot.startTime} - {slot.endTime}
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium">({slot.durationMinutes || 180} मिनट)</div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="font-bold text-slate-900">{slot.subjectName}</div>
                                    {slot.syllabus && (
                                      <div className="text-xs text-slate-500 line-clamp-1" title={slot.syllabus}>
                                        पाठ्यक्रम: {slot.syllabus}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="font-bold text-slate-900">{slot.maxMarks}</span>
                                    <span className="text-slate-400"> / </span>
                                    <span className="font-bold text-emerald-600">{slot.passingMarks}</span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                                      {slot.roomOrHall || exam.roomHallAllocation || 'कमरा सं. 101'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-1.5">
                                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <span className="font-semibold text-slate-800 text-xs">
                                        {slot.invigilatorName || 'निर्धारित नहीं'}
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* निर्देश एवं टिप्पणियाँ */}
                    {(exam.instructions || exam.notes) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {exam.instructions && (
                          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-900 space-y-1">
                            <span className="font-black flex items-center gap-1.5 text-amber-800">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              परीक्षार्थियों हेतु आवश्यक निर्देश
                            </span>
                            <p className="whitespace-pre-line text-slate-700 leading-relaxed font-medium">
                              {exam.instructions}
                            </p>
                          </div>
                        )}
                        {exam.notes && (
                          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-900 space-y-1">
                            <span className="font-black flex items-center gap-1.5 text-blue-800">
                              <FileText className="w-3.5 h-3.5" />
                              व्यवस्थापक टिप्पणी / आंतरिक विवरण
                            </span>
                            <p className="whitespace-pre-line text-slate-700 leading-relaxed font-medium">
                              {exam.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. परीक्षा निर्माण / संपादन मोडल (Create / Edit Exam Modal) */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col border-2 border-slate-200 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    {editingExam ? 'परीक्षा अनुसूची संपादित करें (Edit Exam)' : 'नई परीक्षा अनुसूची जोड़ें (New Exam Schedule)'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    परीक्षा का शीर्षक, कक्षा, विषयवार डेट शीट व वीक्षक आवंटन निर्धारित करें।
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* प्राथमिक जानकारी खंड (Primary Info Section) */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>1. मूल परीक्षा विवरण (Basic Exam Details)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      परीक्षा का नाम (English Title) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Class 10 Matric Pre-Board Exam 2026"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm font-medium outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      हिंदी शीर्षक (Hindi Title)
                    </label>
                    <input
                      type="text"
                      value={formData.hindiTitle}
                      onChange={(e) => setFormData((prev) => ({ ...prev, hindiTitle: e.target.value }))}
                      placeholder="e.g. कक्षा 10वीं मैट्रिक प्री-बोर्ड मॉडल परीक्षा 2026"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm font-medium outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      कक्षा (Class Level) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.classLevel}
                      onChange={(e) => handleFormClassChange(e.target.value as ClassLevel)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm font-bold bg-white outline-hidden cursor-pointer"
                    >
                      <option value="class-9">कक्षा 9वीं (Class 9)</option>
                      <option value="class-10">कक्षा 10वीं (Class 10 - Matric)</option>
                      <option value="class-11">कक्षा 11वीं (Class 11 - Inter 1st)</option>
                      <option value="class-12">कक्षा 12वीं (Class 12 - Inter Final)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      संबद्ध बैच / कोर्स (Linked Course / Batch)
                    </label>
                    <select
                      value={formData.courseId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, courseId: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm font-medium bg-white outline-hidden cursor-pointer"
                    >
                      <option value="">-- सामान्य संस्थान परीक्षा (All Students) --</option>
                      {classCourses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({c.batchName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      परीक्षा का प्रकार (Exam Type) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.examType}
                      onChange={(e) => setFormData((prev) => ({ ...prev, examType: e.target.value as ExamType }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm font-bold bg-white outline-hidden cursor-pointer"
                    >
                      <option value="unit_test">इकाई परीक्षा (Unit Test)</option>
                      <option value="monthly">मासिक टेस्ट (Monthly Assessment)</option>
                      <option value="quarterly">त्रैमासिक परीक्षा (Quarterly Exam)</option>
                      <option value="half_yearly">अर्द्धवार्षिक परीक्षा (Half-Yearly Exam)</option>
                      <option value="annual">वार्षिक परीक्षा (Annual Exam)</option>
                      <option value="model_board">बोर्ड मॉडल / प्री-बोर्ड परीक्षा</option>
                      <option value="mock_test">संस्थान मॉक टेस्ट (Mock Test)</option>
                      <option value="other">अन्य विशेष परीक्षा</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      परीक्षा का माध्यम (Exam Mode)
                    </label>
                    <select
                      value={formData.examMode}
                      onChange={(e) => setFormData((prev) => ({ ...prev, examMode: e.target.value as ExamMode }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm font-bold bg-white outline-hidden cursor-pointer"
                    >
                      <option value="offline">ऑफलाइन (Pen & Paper / OMR)</option>
                      <option value="online">ऑनलाइन (Computer Based)</option>
                      <option value="hybrid">हाइब्रिड (Hybrid / Mixed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      शैक्षणिक सत्र (Academic Year)
                    </label>
                    <input
                      type="text"
                      value={formData.academicYear}
                      onChange={(e) => setFormData((prev) => ({ ...prev, academicYear: e.target.value }))}
                      placeholder="2025-2026"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 text-sm font-medium outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      प्रारंभिक स्थिति (Status)
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as ExamStatus }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 text-sm font-bold bg-white outline-hidden cursor-pointer"
                    >
                      <option value="scheduled">शेड्यूल किया गया (Scheduled)</option>
                      <option value="ongoing">वर्तमान में जारी (Ongoing)</option>
                      <option value="completed">सम्पन्न (Completed)</option>
                      <option value="draft">प्रारूप (Draft)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      परीक्षा भवन / कक्ष आवंटन (Room & Hall Allocation)
                    </label>
                    <input
                      type="text"
                      value={formData.roomHallAllocation}
                      onChange={(e) => setFormData((prev) => ({ ...prev, roomHallAllocation: e.target.value }))}
                      placeholder="e.g. परीक्षा भवन - कमरा सं. 101, 102 एवं मेन हॉल"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 text-sm font-medium outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* विषयवार समय सारणी शेड्यूलर (Multi-Subject Schedule Builder) */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>2. विषयवार डेट शीट व समय सारणी ({formData.schedule.length} विषय)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddSubjectSlot}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-black transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ विषय जोड़ें</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.schedule.map((slot, index) => (
                    <div
                      key={slot.id || index}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                            {index + 1}
                          </span>
                          <span className="text-xs font-black text-slate-800">पेपर #{index + 1}</span>
                        </div>
                        {formData.schedule.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSubjectSlot(slot.id)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                            title="विषय हटाएं"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                        {/* विषय */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">विषय (Subject)</label>
                          <select
                            value={slot.subjectId}
                            onChange={(e) => handleUpdateSubjectSlot(slot.id, { subjectId: e.target.value })}
                            className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white outline-hidden focus:border-indigo-500 cursor-pointer"
                          >
                            {classSubjects.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.hindiName} ({s.name})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* परीक्षा दिनांक */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">परीक्षा दिनांक</label>
                          <input
                            type="date"
                            required
                            value={slot.examDate}
                            onChange={(e) => handleUpdateSubjectSlot(slot.id, { examDate: e.target.value })}
                            className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white outline-hidden focus:border-indigo-500"
                          />
                        </div>

                        {/* समय */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">प्रारंभ समय</label>
                          <input
                            type="text"
                            value={slot.startTime}
                            onChange={(e) => handleUpdateSubjectSlot(slot.id, { startTime: e.target.value })}
                            placeholder="09:30 AM"
                            className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">समाप्ति समय</label>
                          <input
                            type="text"
                            value={slot.endTime}
                            onChange={(e) => handleUpdateSubjectSlot(slot.id, { endTime: e.target.value })}
                            placeholder="12:30 PM"
                            className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white outline-hidden"
                          />
                        </div>

                        {/* पूर्णांक / उत्तीर्णांक */}
                        <div className="flex gap-1.5">
                          <div className="flex-1">
                            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">पूर्णांक</label>
                            <input
                              type="number"
                              value={slot.maxMarks}
                              onChange={(e) => handleUpdateSubjectSlot(slot.id, { maxMarks: Number(e.target.value) || 0 })}
                              className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs font-bold text-center bg-white outline-hidden"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">उत्तीर्णांक</label>
                            <input
                              type="number"
                              value={slot.passingMarks}
                              onChange={(e) => handleUpdateSubjectSlot(slot.id, { passingMarks: Number(e.target.value) || 0 })}
                              className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs font-bold text-center bg-white outline-hidden"
                            />
                          </div>
                        </div>

                        {/* वीक्षक शिक्षक */}
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">वीक्षक / परीक्षक (Invigilator)</label>
                          <select
                            value={slot.invigilatorId}
                            onChange={(e) => handleUpdateSubjectSlot(slot.id, { invigilatorId: e.target.value })}
                            className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-hidden cursor-pointer"
                          >
                            <option value="">-- वीक्षक शिक्षक चुनें --</option>
                            {teachers.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* पाठ्यक्रम / टॉपिक्स */}
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">पाठ्यक्रम / टॉपिक्स विवरण</label>
                          <input
                            type="text"
                            value={slot.syllabus || ''}
                            onChange={(e) => handleUpdateSubjectSlot(slot.id, { syllabus: e.target.value })}
                            placeholder="e.g. अध्याय 1 से 5 या सम्पूर्ण पाठ्यक्रम"
                            className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* निर्देश व अतिरिक्त विवरण (Instructions & Guidelines) */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>3. परीक्षा निर्देश व नियम (Rules & Instructions)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      परीक्षार्थियों हेतु निर्देश (Student Instructions)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.instructions}
                      onChange={(e) => setFormData((prev) => ({ ...prev, instructions: e.target.value }))}
                      placeholder="1. परीक्षा प्रारंभ से 15 मिनट पूर्व कक्ष में उपस्थित हों...&#10;2. प्रवेश पत्र व बॉल पेन आवश्यक है..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs font-medium outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      आंतरिक व्यवस्थापक नोट्स (Admin Notes)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="ओएमआर मूल्यांकन या संस्थान आंतरिक संदर्भ..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs font-medium outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Action Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors cursor-pointer"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{editingExam ? 'परिवर्तन सहेजें (Save Changes)' : 'परीक्षा शेड्यूल करें (Schedule Exam)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. विस्तृत डेट शीट दर्शक मोडल (Institutional Date Sheet Viewer Modal) */}
      {/* ========================================================================= */}
      {viewingDateSheetExam && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col border-2 border-slate-200 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
                  आर.के. स्टडी सेंटर • RK STUDY CENTRE
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  आधिकारिक परीक्षा समय सारणी (Official Date Sheet)
                </h2>
              </div>
              <button
                onClick={() => setViewingDateSheetExam(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Date Sheet Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
              {/* Institution Card Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto font-black">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {viewingDateSheetExam.hindiTitle || viewingDateSheetExam.title}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-slate-600">
                  {CLASSES_METADATA.find((c) => c.id === viewingDateSheetExam.classLevel)?.hindiName || viewingDateSheetExam.classLevel}
                  {viewingDateSheetExam.courseName && ` • ${viewingDateSheetExam.courseName}`}
                  {viewingDateSheetExam.academicYear && ` • सत्र: ${viewingDateSheetExam.academicYear}`}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mt-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    परीक्षा अवधि: {viewingDateSheetExam.startDate} से {viewingDateSheetExam.endDate}
                  </span>
                </div>
              </div>

              {/* Schedule Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-black">
                      <th className="py-3.5 px-4">दिनांक व दिन</th>
                      <th className="py-3.5 px-4">परीक्षा समय</th>
                      <th className="py-3.5 px-4">विषय (Subject)</th>
                      <th className="py-3.5 px-4 text-center">पूर्णांक</th>
                      <th className="py-3.5 px-4">कक्ष / हॉल</th>
                      <th className="py-3.5 px-4">वीक्षक</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {viewingDateSheetExam.schedule.map((slot, sIdx) => {
                      const examDateObj = new Date(slot.examDate);
                      const dayNames = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
                      const dayName = !isNaN(examDateObj.getTime()) ? dayNames[examDateObj.getDay()] : '';

                      return (
                        <tr key={slot.id || sIdx} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-black text-slate-900">{slot.examDate}</div>
                            <div className="text-xs font-bold text-indigo-600">{dayName}</div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {slot.startTime} - {slot.endTime}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{slot.subjectName}</div>
                            {slot.syllabus && (
                              <div className="text-xs text-slate-500 font-medium mt-0.5">
                                सिलेबस: {slot.syllabus}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-black text-slate-900">
                            {slot.maxMarks}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700">
                            {slot.roomOrHall || viewingDateSheetExam.roomHallAllocation || 'कक्ष 101'}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-semibold text-slate-800">
                            {slot.invigilatorName || 'संस्थान संकाय'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Rules & Guidelines */}
              {viewingDateSheetExam.instructions && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-indigo-700">
                    <ShieldCheck className="w-4 h-4" />
                    <span>परीक्षार्थियों हेतु अनिवार्य परीक्षा दिशा-निर्देश</span>
                  </h4>
                  <p className="text-xs text-slate-700 font-medium whitespace-pre-line leading-relaxed">
                    {viewingDateSheetExam.instructions}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-500 font-medium">
                आर.के. स्टडी सेंटर • परीक्षा नियंत्रण प्रकोष्ठ
              </div>
              <button
                type="button"
                onClick={() => setViewingDateSheetExam(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                बंद करें (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. परीक्षा हटाने की पुष्टि मोडल (Delete Exam Confirmation Modal) */}
      {/* ========================================================================= */}
      {deletingExam && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border-2 border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">परीक्षा अनुसूची हटाएं</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  क्या आप सचमुच परीक्षा <strong>"{deletingExam.title}"</strong> को स्थायी रूप से हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingExam(null)}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-black transition-colors cursor-pointer shadow-md disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>हटाएं (Delete)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
