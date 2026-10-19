/**
 * RK STUDY CENTRE - Classes & Timetable Management (Task 6)
 * 
 * Central command center for the Owner to manage weekly class schedules,
 * teacher allocations, batch time slots, and prevent timetable conflicts.
 * 
 * Features:
 * - Real-time Teacher & Batch Conflict Detection (Overlap prevention)
 * - Weekly Grid View & Detailed List View with Mobile Cards
 * - Day-by-Day Filtering & Multi-Criteria Search (Teacher, Subject, Batch, Class, Status)
 * - Today's Schedule Quick View (IST aligned)
 * - In-App Add/Edit Modal with dynamic duration calculations
 * - In-App Delete & Deactivate Confirmation Modal (Zero native alerts/confirm)
 * - Strictly integrated with real Course, Teacher, and Subject architecture.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  Users,
  BookOpen,
  GraduationCap,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  X,
  Edit2,
  Trash2,
  RefreshCw,
  Eye,
  AlertCircle,
  Loader2,
  Layers,
  ChevronRight,
  Sparkles,
  Info,
  CalendarDays,
  Flame,
  Radio,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import type {
  ClassLevel,
  DayOfWeek,
  TimetableEntry,
  CreateTimetableInput,
  Teacher,
  Course,
} from '../../types';
import {
  getAllTimetableEntries,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  setTimetableStatus,
  checkTimetableConflict,
  DAYS_OF_WEEK,
  CLASS_ROOM_MODES,
  formatTime12Hour,
  getDurationText,
  getTodayDayOfWeek,
  type DayMetadata,
} from '../../services/timetableService';
import { getAllTeachers } from '../../services/teacherService';
import { getAllCourses } from '../../services/courseService';
import { CLASSES_METADATA, SUBJECTS } from '../../lib/constants';

interface FormDataState {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  classLevel: ClassLevel;
  courseId: string;
  teacherId: string;
  subjectId: string;
  roomOrMode: string;
  notes: string;
  status: 'active' | 'inactive';
}

const DEFAULT_FORM_STATE: FormDataState = {
  day: 'Monday',
  startTime: '08:00',
  endTime: '09:15',
  classLevel: 'class-10',
  courseId: '',
  teacherId: '',
  subjectId: '',
  roomOrMode: CLASS_ROOM_MODES[0],
  notes: '',
  status: 'active',
};

export function OwnerTimetableManager() {
  // Main Data States
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // View Mode: 'weekly' | 'list'
  const [viewMode, setViewMode] = useState<'weekly' | 'list'>('weekly');

  // Active Day Filter ('all' or DayOfWeek)
  const [selectedDay, setSelectedDay] = useState<string>('all');

  // Advanced Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterTeacher, setFilterTeacher] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal States
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [formData, setFormData] = useState<FormDataState>(DEFAULT_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Delete & Deactivate Action Modal
  const [actionEntry, setActionEntry] = useState<TimetableEntry | null>(null);
  const [actionType, setActionType] = useState<'delete' | 'toggle_status' | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Selected Detail Modal
  const [inspectEntry, setInspectEntry] = useState<TimetableEntry | null>(null);

  // Today's Day
  const todayDay = useMemo(() => getTodayDayOfWeek(), []);

  // Show Toast Auto-dismiss
  const showToast = useCallback((msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  }, []);

  // Load All Required Data
  const loadAllData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const [timetableRes, teachersRes, coursesRes] = await Promise.allSettled([
        getAllTimetableEntries(),
        getAllTeachers(),
        getAllCourses(true),
      ]);

      if (timetableRes.status === 'fulfilled') {
        setEntries(timetableRes.value);
      } else {
        console.warn('Failed to load timetable entries:', timetableRes.reason);
      }

      if (teachersRes.status === 'fulfilled') {
        setTeachers(teachersRes.value);
      }

      if (coursesRes.status === 'fulfilled') {
        setCourses(coursesRes.value);
      }
    } catch (err: any) {
      console.error('Error loading timetable data:', err);
      setErrorMessage(err?.message || 'समय-सारणी डेटा लोड करने में त्रुटि हुई।');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalScheduled = entries.length;
    const activeEntries = entries.filter((e) => e.status === 'active');
    const todayClasses = activeEntries.filter((e) => e.day === todayDay).length;

    const teacherSet = new Set<string>();
    activeEntries.forEach((e) => {
      if (e.teacherId) teacherSet.add(e.teacherId);
    });

    const batchSet = new Set<string>();
    activeEntries.forEach((e) => {
      if (e.courseId) batchSet.add(e.courseId);
    });

    return {
      totalScheduled,
      activeScheduled: activeEntries.length,
      todayClasses,
      activeTeachersCount: teacherSet.size,
      activeBatchesCount: batchSet.size,
    };
  }, [entries, todayDay]);

  // Subjects available for selection based on Class & Teacher
  const availableSubjects = useMemo(() => {
    return SUBJECTS.filter((sub) => {
      if (formData.classLevel && sub.classLevel !== formData.classLevel) {
        return false;
      }
      return true;
    });
  }, [formData.classLevel]);

  // Handle Course Change in Form -> auto-set classLevel
  const handleCourseChange = (courseId: string) => {
    const matched = courses.find((c) => c.id === courseId);
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        courseId,
        classLevel: matched.classLevel,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        courseId,
      }));
    }
  };

  // Open Add Modal
  const openAddModal = (defaultDay?: DayOfWeek) => {
    const activeTeacher = teachers.find((t) => t.status === 'active') || teachers[0];
    const initialTeacherId = activeTeacher?.id || '';
    const initialCourse = courses[0];
    const initialCourseId = initialCourse?.id || '';
    const initialClass = initialCourse?.classLevel || 'class-10';

    // find first matching subject
    const initialSub = SUBJECTS.find((s) => s.classLevel === initialClass);

    setFormData({
      day: defaultDay || (selectedDay !== 'all' ? (selectedDay as DayOfWeek) : 'Monday'),
      startTime: '08:00',
      endTime: '09:15',
      classLevel: initialClass,
      courseId: initialCourseId,
      teacherId: initialTeacherId,
      subjectId: initialSub?.id || '',
      roomOrMode: CLASS_ROOM_MODES[0],
      notes: '',
      status: 'active',
    });
    setFormError(null);
    setEditingEntry(null);
    setShowAddModal(true);
  };

  // Open Edit Modal
  const openEditModal = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setFormData({
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      classLevel: entry.classLevel,
      courseId: entry.courseId,
      teacherId: entry.teacherId,
      subjectId: entry.subjectId,
      roomOrMode: entry.roomOrMode || CLASS_ROOM_MODES[0],
      notes: entry.notes || '',
      status: entry.status,
    });
    setFormError(null);
    setShowAddModal(true);
  };

  // Real-time Conflict preview in form
  const liveConflictWarning = useMemo(() => {
    if (!formData.startTime || !formData.endTime || !formData.day) return null;
    const inputPayload: CreateTimetableInput = {
      day: formData.day,
      startTime: formData.startTime,
      endTime: formData.endTime,
      classLevel: formData.classLevel,
      courseId: formData.courseId,
      teacherId: formData.teacherId,
      subjectId: formData.subjectId,
      roomOrMode: formData.roomOrMode,
      status: formData.status,
    };
    return checkTimetableConflict(inputPayload, entries, editingEntry?.id);
  }, [formData, entries, editingEntry]);

  // Handle Form Submit (Add / Edit)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.day) {
      setFormError('दिन (Day) चुनना अनिवार्य है।');
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      setFormError('प्रारंभ समय एवं समाप्ति समय दर्ज करना अनिवार्य है।');
      return;
    }
    if (!formData.courseId) {
      setFormError('कोर्स/बैच चुनना अनिवार्य है।');
      return;
    }
    if (!formData.teacherId) {
      setFormError('शिक्षक (Teacher) चुनना अनिवार्य है।');
      return;
    }
    if (!formData.subjectId) {
      setFormError('विषय (Subject) चुनना अनिवार्य है।');
      return;
    }

    // Teacher details
    const selectedTeacher = teachers.find((t) => t.id === formData.teacherId);
    const teacherName = selectedTeacher?.name || 'संकाय शिक्षक';

    // Course details
    const selectedCourse = courses.find((c) => c.id === formData.courseId);
    const courseName = selectedCourse?.title || 'लक्ष्य बैच 2026';
    const batchName = selectedCourse?.batchName || 'लक्ष्य बैच';

    // Subject details
    const selectedSub = SUBJECTS.find((s) => s.id === formData.subjectId);
    const subjectName = selectedSub ? `${selectedSub.name} (${selectedSub.hindiName})` : 'विषय';

    const payload: CreateTimetableInput = {
      day: formData.day,
      startTime: formData.startTime,
      endTime: formData.endTime,
      classLevel: formData.classLevel,
      courseId: formData.courseId,
      courseName,
      batchName,
      teacherId: formData.teacherId,
      teacherName,
      subjectId: formData.subjectId,
      subjectName,
      roomOrMode: formData.roomOrMode,
      notes: formData.notes,
      status: formData.status,
    };

    setIsSubmitting(true);
    try {
      if (editingEntry) {
        const updated = await updateTimetableEntry(editingEntry.id, payload);
        setEntries((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        showToast('समय-सारणी प्रविष्टि सफलतापूर्वक अपडेट कर दी गई!');
      } else {
        const created = await createTimetableEntry(payload);
        setEntries((prev) => [...prev, created]);
        showToast('नई समय-सारणी प्रविष्टि सफलतापूर्वक जोड़ी गई!');
      }
      setShowAddModal(false);
      setEditingEntry(null);
    } catch (err: any) {
      console.error('Submit timetable error:', err);
      setFormError(err?.message || 'समय-सारणी सहेजने में त्रुटि हुई।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle In-App Delete / Status Toggle Action
  const handleConfirmAction = async () => {
    if (!actionEntry || !actionType) return;
    setIsActionLoading(true);
    setActionError(null);

    try {
      if (actionType === 'delete') {
        await deleteTimetableEntry(actionEntry.id);
        setEntries((prev) => prev.filter((item) => item.id !== actionEntry.id));
        showToast('कक्षा समय-सारणी से स्थायी रूप से हटा दी गई।');
      } else if (actionType === 'toggle_status') {
        const newStatus = actionEntry.status === 'active' ? 'inactive' : 'active';
        await setTimetableStatus(actionEntry.id, newStatus);
        setEntries((prev) =>
          prev.map((item) => (item.id === actionEntry.id ? { ...item, status: newStatus } : item))
        );
        showToast(`कक्षा की स्थिति सफलतापूर्वक "${newStatus === 'active' ? 'सक्रिय' : 'निष्क्रिय'}" की गई।`);
      }
      setActionEntry(null);
      setActionType(null);
    } catch (err: any) {
      console.error('Action error:', err);
      setActionError(err?.message || 'कार्रवाई निष्पादित करने में त्रुटि हुई।');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Reset All Filters
  const handleResetFilters = () => {
    setSelectedDay('all');
    setSearchQuery('');
    setFilterClass('all');
    setFilterTeacher('all');
    setFilterSubject('all');
    setFilterCourse('all');
    setFilterStatus('all');
  };

  // Filtered List
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Day filter
      if (selectedDay !== 'all' && entry.day !== selectedDay) {
        return false;
      }
      // Class filter
      if (filterClass !== 'all' && entry.classLevel !== filterClass) {
        return false;
      }
      // Teacher filter
      if (filterTeacher !== 'all' && entry.teacherId !== filterTeacher) {
        return false;
      }
      // Subject filter
      if (filterSubject !== 'all' && entry.subjectId !== filterSubject) {
        return false;
      }
      // Course filter
      if (filterCourse !== 'all' && entry.courseId !== filterCourse) {
        return false;
      }
      // Status filter
      if (filterStatus !== 'all' && entry.status !== filterStatus) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTeacher = entry.teacherName?.toLowerCase().includes(q);
        const matchSubject = entry.subjectName?.toLowerCase().includes(q);
        const matchCourse = entry.courseName?.toLowerCase().includes(q);
        const matchBatch = entry.batchName?.toLowerCase().includes(q);
        const matchRoom = entry.roomOrMode?.toLowerCase().includes(q);
        const matchNotes = entry.notes?.toLowerCase().includes(q);
        const matchDay = entry.dayHindi?.toLowerCase().includes(q) || entry.day?.toLowerCase().includes(q);
        if (
          !matchTeacher &&
          !matchSubject &&
          !matchCourse &&
          !matchBatch &&
          !matchRoom &&
          !matchNotes &&
          !matchDay
        ) {
          return false;
        }
      }
      return true;
    });
  }, [
    entries,
    selectedDay,
    filterClass,
    filterTeacher,
    filterSubject,
    filterCourse,
    filterStatus,
    searchQuery,
  ]);

  // Group filtered entries by Day for Weekly Grid View
  const entriesByDay = useMemo(() => {
    const map: Record<DayOfWeek, TimetableEntry[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };
    filteredEntries.forEach((e) => {
      if (map[e.day]) {
        map[e.day].push(e);
      }
    });
    return map;
  }, [filteredEntries]);

  // Active filter count indicator
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedDay !== 'all') count++;
    if (filterClass !== 'all') count++;
    if (filterTeacher !== 'all') count++;
    if (filterSubject !== 'all') count++;
    if (filterCourse !== 'all') count++;
    if (filterStatus !== 'all') count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [
    selectedDay,
    filterClass,
    filterTeacher,
    filterSubject,
    filterCourse,
    filterStatus,
    searchQuery,
  ]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>RK STUDY CENTRE • कार्य 6: कक्षाएं एवं समय-सारणी प्रबंधन</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>कक्षाएं व साप्ताहिक समय-सारणी</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
              मैट्रिक एवं इंटरमीडिएट बोर्ड के सभी बैचों के लिए साप्ताहिक क्लास शेड्यूल प्रबंधित करें। शिक्षक एवं बैच समय टकराव (Conflict Detection) की स्वचालित सुरक्षा के साथ।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => loadAllData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer backdrop-blur-xs disabled:opacity-50 border border-white/10"
              title="डेटा रीफ्रेश करें"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>रीफ्रेश</span>
            </button>

            <button
              id="add-timetable-entry-btn"
              onClick={() => openAddModal()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/30 transition-all cursor-pointer transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ नई क्लास जोड़ें (Add Class)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Toast Banner */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-900 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-900 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:bg-rose-100 rounded-lg text-rose-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Real Statistics Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3 sm:gap-4 hover:border-indigo-300 transition-all">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
            <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[11px] sm:text-xs text-slate-500 font-bold block leading-tight">
              कुल निर्धारित कक्षाएं
            </span>
            <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              {stats.totalScheduled}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3 sm:gap-4 hover:border-amber-300 transition-all">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[11px] sm:text-xs text-slate-500 font-bold block leading-tight">
              आज की कक्षाएं ({DAYS_OF_WEEK.find((d) => d.id === todayDay)?.hindi || todayDay})
            </span>
            <span className="text-lg sm:text-2xl font-black text-amber-600 tracking-tight">
              {stats.todayClasses}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3 sm:gap-4 hover:border-blue-300 transition-all">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[11px] sm:text-xs text-slate-500 font-bold block leading-tight">
              सक्रिय शिक्षक (Schedule)
            </span>
            <span className="text-lg sm:text-2xl font-black text-blue-700 tracking-tight">
              {stats.activeTeachersCount}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3 sm:gap-4 hover:border-teal-300 transition-all">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[11px] sm:text-xs text-slate-500 font-bold block leading-tight">
              सक्रिय बैच एवं कोर्स
            </span>
            <span className="text-lg sm:text-2xl font-black text-teal-700 tracking-tight">
              {stats.activeBatchesCount}
            </span>
          </div>
        </div>
      </div>

      {/* Today's Quick Highlight Card */}
      <div className="bg-linear-to-r from-amber-500/10 via-indigo-500/5 to-slate-50 border border-amber-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-900 uppercase tracking-wider">
                आज का लाइव सत्र (Today's Live)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 text-[10px] font-black">
                {DAYS_OF_WEEK.find((d) => d.id === todayDay)?.hindi} ({todayDay})
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-bold mt-0.5">
              आज संस्थान में कुल {stats.todayClasses} कक्षाएं निर्धारित हैं।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSelectedDay(todayDay)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer w-full sm:w-auto text-center ${
              selectedDay === todayDay
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-100'
            }`}
          >
            केवल आज की कक्षाएं देखें
          </button>

          <button
            onClick={() => openAddModal(todayDay)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all cursor-pointer shrink-0 shadow-xs"
          >
            + आज में जोड़ें
          </button>
        </div>
      </div>

      {/* Day Selector Ribbon (7 Days Bar) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>दिन अनुसार समय-सारणी (Day-wise Navigation)</span>
          </label>
          <span className="text-xs text-slate-500 font-medium">
            {filteredEntries.length} कक्षाएं उपलब्ध
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setSelectedDay('all')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer min-h-[44px] flex items-center gap-2 ${
              selectedDay === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>सभी 7 दिन</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                selectedDay === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {entries.length}
            </span>
          </button>

          {DAYS_OF_WEEK.map((dayMeta) => {
            const countForDay = entries.filter((e) => e.day === dayMeta.id).length;
            const isToday = dayMeta.id === todayDay;
            const isSelected = selectedDay === dayMeta.id;

            return (
              <button
                key={dayMeta.id}
                onClick={() => setSelectedDay(dayMeta.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer min-h-[44px] flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : isToday
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{dayMeta.hindi}</span>
                <span className="text-[10px] opacity-75 hidden sm:inline">({dayMeta.shortHindi})</span>
                {isToday && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="आज" />
                )}
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {countForDay}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Advanced Filters Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="शिक्षक, विषय, बैच, कमरा या नोट्स खोजें..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'weekly'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>साप्ताहिक ग्रिड (Weekly)</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>विस्तृत सूची (List)</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          {/* Class Filter */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
              कक्षा (Class)
            </label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">सभी कक्षाएं (All)</option>
              {CLASSES_METADATA.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.hindiName} ({c.name})
                </option>
              ))}
            </select>
          </div>

          {/* Teacher Filter */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
              शिक्षक (Teacher)
            </label>
            <select
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">सभी शिक्षक (All)</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
              विषय (Subject)
            </label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">सभी विषय (All)</option>
              {SUBJECTS.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.hindiName})
                </option>
              ))}
            </select>
          </div>

          {/* Course/Batch Filter */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
              कोर्स / बैच (Batch)
            </label>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">सभी बैच (All)</option>
              {courses.map((crs) => (
                <option key={crs.id} value={crs.id}>
                  {crs.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
              स्थिति (Status)
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">सभी स्थितियां (All)</option>
              <option value="active">सक्रिय (Active)</option>
              <option value="inactive">निष्क्रिय (Inactive)</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips & Reset */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-600 font-bold">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
              <span>{activeFiltersCount} फ़िल्टर लागू हैं</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-black text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>सभी फ़िल्टर साफ़ करें (Reset)</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-4 shadow-sm">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <p className="text-slate-600 font-bold text-sm">
            समय-सारणी एवं कक्षा डेटा लोड किया जा रहा है...
          </p>
        </div>
      ) : filteredEntries.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 sm:p-16 border border-slate-200 text-center space-y-4 shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              कोई कक्षा या समय-सारणी नहीं मिली
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
              आपके द्वारा चुने गए फ़िल्टर या खोज क्वेरी से मेल खाती कोई समय-सारणी प्रविष्टि उपलब्ध नहीं है।
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              फ़िल्टर हटाएं
            </button>
            <button
              onClick={() => openAddModal()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-colors cursor-pointer"
            >
              + नई कक्षा जोड़ें
            </button>
          </div>
        </div>
      ) : viewMode === 'weekly' ? (
        /* Weekly Grid View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
            {DAYS_OF_WEEK.filter((d) => selectedDay === 'all' || d.id === selectedDay).map((dayMeta) => {
              const dayClasses = entriesByDay[dayMeta.id] || [];
              const isToday = dayMeta.id === todayDay;

              return (
                <div
                  key={dayMeta.id}
                  className={`bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col transition-all ${
                    isToday
                      ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-md'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Day Column Header */}
                  <div
                    className={`p-4 border-b flex items-center justify-between ${
                      isToday ? 'bg-amber-500 text-white' : 'bg-slate-900 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4" />
                      <div>
                        <h4 className="font-black text-sm sm:text-base leading-tight">
                          {dayMeta.hindi}
                        </h4>
                        <span className="text-[11px] opacity-80 font-medium">
                          {dayMeta.english} {isToday && '• आज'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => openAddModal(dayMeta.id)}
                      className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                      title={`${dayMeta.hindi} को कक्षा जोड़ें`}
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>

                  {/* Classes List for this Day */}
                  <div className="p-3 sm:p-4 space-y-3 flex-1 bg-slate-50/50">
                    {dayClasses.length === 0 ? (
                      <div className="py-8 text-center space-y-2">
                        <Clock className="w-6 h-6 text-slate-300 mx-auto" />
                        <p className="text-xs text-slate-400 font-bold">
                          इस दिन कोई कक्षा नहीं है
                        </p>
                        <button
                          onClick={() => openAddModal(dayMeta.id)}
                          className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                        >
                          + शेड्यूल बनाएं
                        </button>
                      </div>
                    ) : (
                      dayClasses.map((item) => (
                        <div
                          key={item.id}
                          className={`bg-white rounded-2xl p-3.5 border transition-all hover:shadow-md space-y-2.5 ${
                            item.status === 'inactive'
                              ? 'opacity-60 border-slate-200 bg-slate-50'
                              : 'border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          {/* Time & Status Badge */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-950 font-black text-xs">
                              <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>
                                {formatTime12Hour(item.startTime)} - {formatTime12Hour(item.endTime)}
                              </span>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                item.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {item.status === 'active' ? 'सक्रिय' : 'स्थगित'}
                            </span>
                          </div>

                          {/* Subject & Class */}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-black shrink-0">
                                {item.classLevel.toUpperCase().replace('-', ' ')}
                              </span>
                              <h5 className="font-black text-slate-900 text-xs sm:text-sm line-clamp-1">
                                {item.subjectName}
                              </h5>
                            </div>
                            <p className="text-[11px] text-slate-500 font-bold mt-0.5 line-clamp-1">
                              {item.courseName}
                            </p>
                          </div>

                          {/* Teacher & Location */}
                          <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                              <GraduationCap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span className="truncate">{item.teacherName}</span>
                            </div>

                            {item.roomOrMode && (
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{item.roomOrMode}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                            <button
                              onClick={() => setInspectEntry(item)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors cursor-pointer"
                              title="विवरण देखें"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 transition-colors cursor-pointer"
                              title="संपादित करें (Edit)"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setActionEntry(item);
                                setActionType('delete');
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors cursor-pointer"
                              title="हटाएं (Delete)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Detailed List View (Table on desktop / Cards on Mobile) */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs font-black uppercase tracking-wider">
                  <th className="py-4 px-6">दिन व समय (Day & Time)</th>
                  <th className="py-4 px-6">कक्षा व विषय (Class & Subject)</th>
                  <th className="py-4 px-6">कोर्स एवं बैच (Course & Batch)</th>
                  <th className="py-4 px-6">शिक्षक (Faculty)</th>
                  <th className="py-4 px-6">कमरा / मोड (Room / Mode)</th>
                  <th className="py-4 px-6">स्थिति (Status)</th>
                  <th className="py-4 px-6 text-right">कार्रवाई (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredEntries.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      item.status === 'inactive' ? 'bg-slate-50/40 opacity-70' : ''
                    }`}
                  >
                    {/* Day & Time */}
                    <td className="py-4 px-6">
                      <div className="font-black text-slate-900 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-black">
                          {item.dayHindi}
                        </span>
                        {item.day === todayDay && (
                          <span className="w-2 h-2 rounded-full bg-amber-500" title="आज" />
                        )}
                      </div>
                      <div className="text-indigo-700 font-bold text-xs mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                        <span>
                          {formatTime12Hour(item.startTime)} - {formatTime12Hour(item.endTime)}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                        अवधि: {getDurationText(item.startTime, item.endTime)}
                      </span>
                    </td>

                    {/* Class & Subject */}
                    <td className="py-4 px-6 space-y-1">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-blue-700 font-black text-[10px] uppercase">
                        {item.classLevel.toUpperCase().replace('-', ' ')}
                      </span>
                      <div className="font-black text-slate-900 text-sm">{item.subjectName}</div>
                    </td>

                    {/* Course / Batch */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{item.courseName}</div>
                      {item.batchName && (
                        <span className="text-[11px] text-slate-500 font-medium block">
                          बैच: {item.batchName}
                        </span>
                      )}
                    </td>

                    {/* Teacher */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 font-black text-slate-900">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 text-xs">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <span>{item.teacherName}</span>
                      </div>
                    </td>

                    {/* Room / Mode */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.roomOrMode || 'क्लासरूम'}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => {
                          setActionEntry(item);
                          setActionType('toggle_status');
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                          item.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                        title="स्थिति बदलने के लिए क्लिक करें"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        <span>{item.status === 'active' ? 'सक्रिय (Active)' : 'निष्क्रिय'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setInspectEntry(item)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors cursor-pointer"
                          title="विवरण देखें"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 transition-colors cursor-pointer"
                          title="संपादित करें (Edit)"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setActionEntry(item);
                            setActionType('delete');
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 transition-colors cursor-pointer"
                          title="हटाएं (Delete)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="lg:hidden p-4 space-y-3 divide-y divide-slate-100">
            {filteredEntries.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-xs font-black">
                        {item.dayHindi}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-black">
                        {item.classLevel.toUpperCase().replace('-', ' ')}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-slate-900 mt-1">
                      {item.subjectName}
                    </h4>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                      item.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.status === 'active' ? 'सक्रिय' : 'स्थगित'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">समय:</span>
                    <span className="font-black text-indigo-700">
                      {formatTime12Hour(item.startTime)} - {formatTime12Hour(item.endTime)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">शिक्षक:</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {item.teacherName}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 block">कोर्स / बैच:</span>
                    <span className="font-medium text-slate-700">{item.courseName}</span>
                  </div>
                  {item.roomOrMode && (
                    <div className="col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 block">कमरा / स्थान:</span>
                      <span className="font-medium text-slate-700">{item.roomOrMode}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setInspectEntry(item)}
                    className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    विवरण
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    className="px-3 py-2 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    संपादित करें
                  </button>
                  <button
                    onClick={() => {
                      setActionEntry(item);
                      setActionType('delete');
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    हटाएं
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Timetable Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border-2 border-slate-200 shadow-2xl space-y-6 my-8 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    {editingEntry ? 'समय-सारणी संपादित करें (Edit Schedule)' : 'नई कक्षा समय-सारणी जोड़ें (Add Class)'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {editingEntry ? 'विद्यमान कक्षा की समय, बैच व शिक्षक जानकारी अपडेट करें।' : 'साप्ताहिक कैलेंडर में नया क्लास स्लॉट निर्धारित करें।'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In-Form Error Alert */}
            {formError && (
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-xs sm:text-sm font-bold text-rose-800 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Real-time Conflict Warning in Form */}
            {liveConflictWarning?.hasConflict && (
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-xs sm:text-sm font-bold text-amber-900 space-y-1">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="font-black uppercase tracking-wider">
                    समय टकराव चेतावनी (Schedule Conflict Detected):
                  </span>
                </div>
                <p className="pl-7 font-medium text-amber-950">
                  {liveConflictWarning.message}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-5">
              {/* Day Selection */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                  दिन (Day of Week) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, day: d.id }))}
                      className={`p-2.5 rounded-xl text-xs font-black text-center transition-all cursor-pointer border ${
                        formData.day === d.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block">{d.hindi}</span>
                      <span className="text-[10px] opacity-75">{d.shortHindi}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots (Start Time & End Time) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                    प्रारंभ समय (Start Time) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[11px] text-slate-500 font-bold block mt-1">
                    {formatTime12Hour(formData.startTime)}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                    समाप्ति समय (End Time) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[11px] text-indigo-600 font-bold block mt-1">
                    {formatTime12Hour(formData.endTime)} • (अवधि: {getDurationText(formData.startTime, formData.endTime)})
                  </span>
                </div>
              </div>

              {/* Course & Batch Selection */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                  कोर्स एवं बैच (Course / Batch) <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- कोर्स व बैच चुनें --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} • ({c.classLevel.toUpperCase()}) - बैच: {c.batchName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class Level & Teacher Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Class Level */}
                <div>
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                    कक्षा (Class Level) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.classLevel}
                    onChange={(e) => setFormData((prev) => ({ ...prev, classLevel: e.target.value as ClassLevel }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {CLASSES_METADATA.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.hindiName} ({cls.name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Teacher Selection */}
                <div>
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                    शिक्षक (Faculty / Teacher) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.teacherId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, teacherId: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- शिक्षक चुनें --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} {t.status === 'inactive' ? '(निष्क्रिय)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Selection & Room / Mode Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Subject Selection */}
                <div>
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                    विषय (Subject) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.subjectId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subjectId: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- विषय चुनें --</option>
                    {availableSubjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.hindiName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room / Mode */}
                <div>
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                    कमरा / क्लास मोड (Room / Mode)
                  </label>
                  <select
                    value={formData.roomOrMode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, roomOrMode: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {CLASS_ROOM_MODES.map((rm) => (
                      <option key={rm} value={rm}>
                        {rm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes / Topic */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                  अध्याय या टॉपिक विवरण (Lesson / Topic Notes - Optional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="उदा. त्रिकोणमिति परिचय, रासायनिक अभिक्रियाएं या डाउट स्पेशल..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Status Selector */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                  क्लास स्थिति (Class Status)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={() => setFormData((prev) => ({ ...prev, status: 'active' }))}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>सक्रिय (Active Schedule)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={() => setFormData((prev) => ({ ...prev, status: 'inactive' }))}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>निष्क्रिय / स्थगित (Inactive)</span>
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  रद्द करें (Cancel)
                </button>

                <button
                  type="submit"
                  id="save-timetable-submit-btn"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>सहेजा जा रहा है...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingEntry ? 'अपडेट करें (Save Changes)' : 'शेड्यूल जोड़ें (Save Class)'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Delete & Deactivate Confirmation Modal (Zero native confirms) */}
      {actionEntry && actionType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border-2 border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  actionType === 'delete'
                    ? 'bg-rose-100 text-rose-600 border-rose-200'
                    : 'bg-amber-100 text-amber-700 border-amber-200'
                }`}
              >
                {actionType === 'delete' ? (
                  <Trash2 className="w-6 h-6" />
                ) : (
                  <Clock className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  {actionType === 'delete'
                    ? 'कक्षा हटाने की पुष्टि करें (Delete Class)'
                    : 'कक्षा स्थिति बदलने की पुष्टि करें'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {actionType === 'delete'
                    ? 'क्या आप इस समय-सारणी प्रविष्टि को डेटाबेस से स्थायी रूप से हटाना चाहते हैं?'
                    : 'क्या आप इस कक्षा को सक्रिय या निष्क्रिय करना चाहते हैं?'}
                </p>
              </div>
            </div>

            {/* Targeted Schedule Details Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">दिन एवं समय:</span>
                <span className="font-black text-slate-900">
                  {actionEntry.dayHindi} • {formatTime12Hour(actionEntry.startTime)} - {formatTime12Hour(actionEntry.endTime)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">विषय:</span>
                <span className="font-black text-blue-700">{actionEntry.subjectName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">कोर्स / बैच:</span>
                <span className="font-medium text-slate-900">{actionEntry.courseName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">शिक्षक:</span>
                <span className="font-bold text-slate-900">{actionEntry.teacherName}</span>
              </div>
              {actionEntry.roomOrMode && (
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">कमरा / स्थान:</span>
                  <span className="font-medium text-slate-700">{actionEntry.roomOrMode}</span>
                </div>
              )}
            </div>

            {/* In-Modal Error */}
            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Confirmation Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!isActionLoading) {
                    setActionEntry(null);
                    setActionType(null);
                  }
                }}
                disabled={isActionLoading}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>

              <button
                type="button"
                id="confirm-timetable-action-btn"
                onClick={handleConfirmAction}
                disabled={isActionLoading}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-black transition-colors cursor-pointer shadow-md disabled:opacity-50 ${
                  actionType === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {isActionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>प्रक्रिया जारी है...</span>
                  </>
                ) : (
                  <>
                    {actionType === 'delete' ? <Trash2 className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>{actionType === 'delete' ? 'हाँ, स्थायी रूप से हटाएं' : 'हाँ, स्थिति बदलें'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Detail Modal */}
      {inspectEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">
                    कक्षा समय-सारणी विवरण
                  </h4>
                  <span className="text-[11px] text-slate-500 font-bold">
                    {inspectEntry.dayHindi} ({inspectEntry.day})
                  </span>
                </div>
              </div>

              <button
                onClick={() => setInspectEntry(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                    समय स्लॉट
                  </span>
                  <span className="text-sm font-black text-indigo-950">
                    {formatTime12Hour(inspectEntry.startTime)} - {formatTime12Hour(inspectEntry.endTime)}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-black text-xs">
                  {getDurationText(inspectEntry.startTime, inspectEntry.endTime)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">कक्षा (Class)</span>
                  <span className="font-black text-slate-900">
                    {inspectEntry.classLevel.toUpperCase().replace('-', ' ')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">स्थिति (Status)</span>
                  <span
                    className={`font-black ${
                      inspectEntry.status === 'active' ? 'text-emerald-700' : 'text-slate-500'
                    }`}
                  >
                    {inspectEntry.status === 'active' ? 'सक्रिय (Active)' : 'निष्क्रिय'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">विषय (Subject)</span>
                <span className="font-black text-slate-900 text-sm">{inspectEntry.subjectName}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">कोर्स एवं बैच</span>
                <span className="font-bold text-slate-800">{inspectEntry.courseName}</span>
                {inspectEntry.batchName && (
                  <span className="text-slate-500 text-[11px] block">बैच: {inspectEntry.batchName}</span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">शिक्षक (Teacher)</span>
                <span className="font-black text-slate-900">{inspectEntry.teacherName}</span>
              </div>

              {inspectEntry.roomOrMode && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block">कमरा / स्थान</span>
                  <span className="font-bold text-slate-800">{inspectEntry.roomOrMode}</span>
                </div>
              )}

              {inspectEntry.notes && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">
                    अध्याय / विशेष नोट्स
                  </span>
                  <span className="font-medium">{inspectEntry.notes}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setInspectEntry(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                बंद करें
              </button>
              <button
                onClick={() => {
                  const entry = inspectEntry;
                  setInspectEntry(null);
                  openEditModal(entry);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs cursor-pointer shadow-md"
              >
                संपादित करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
