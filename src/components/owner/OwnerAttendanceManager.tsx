/**
 * RK STUDY CENTRE - Attendance Management (Task 7)
 * 
 * Central attendance command center for the Owner to:
 * - Mark daily batch & timetable-linked attendance for students
 * - Bulk attendance marking (All Present, All Absent, Reset) with individual overrides
 * - Individual note annotations (e.g. Late by 15 mins, Sick leave)
 * - Real-time calculation of Attendance Percentage (Present + Late / Total Marked * 100)
 * - Duplicate attendance prevention for same Student + Date + Course/Session
 * - Full historical audit logs, multi-filter search, and student-wise analytics
 * - Zero native alert/confirm - 100% In-app modals and toast alerts.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Users,
  BookOpen,
  Filter,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Eye,
  AlertCircle,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  UserCheck,
  UserX,
  FileText,
  CalendarDays,
  Percent,
  Check,
  X,
  HelpCircle,
  ShieldCheck,
  Info,
} from 'lucide-react';
import type {
  ClassLevel,
  DayOfWeek,
  Course,
  AttendanceRecord,
  AttendanceStatus,
  SaveAttendanceItemInput,
  BulkSaveAttendanceInput,
  TimetableEntry,
} from '../../types';
import {
  getAllAttendanceRecords,
  saveBulkAttendance,
  saveIndividualAttendance,
  updateAttendanceStatus,
  deleteAttendanceRecord,
  getTodayDateString,
  isValidAttendanceDate,
  formatDisplayDate,
  getStudentAttendanceSummary,
  type StudentAttendanceStats,
} from '../../services/attendanceService';
import { getAllStudents, type SafeStudentProfile } from '../../services/studentService';
import { getAllCourses } from '../../services/courseService';
import { getAllTimetableEntries } from '../../services/timetableService';
import { CLASSES_METADATA } from '../../lib/constants';

type ManagerViewMode = 'mark' | 'history' | 'analytics';

interface StudentRosterItem {
  student: SafeStudentProfile;
  status: AttendanceStatus | 'unmarked';
  notes: string;
  existingRecordId?: string;
}

export function OwnerAttendanceManager() {
  // Main Navigation View: 'mark' | 'history' | 'analytics'
  const [activeView, setActiveView] = useState<ManagerViewMode>('mark');

  // Master Data States
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<SafeStudentProfile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Daily Marking States
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedTimetableId, setSelectedTimetableId] = useState<string>('');
  const [roster, setRoster] = useState<StudentRosterItem[]>([]);
  const [isSavingAttendance, setIsSavingAttendance] = useState<boolean>(false);
  const [dateValidationError, setDateValidationError] = useState<string | null>(null);

  // History & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterStudent, setFilterStudent] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Student Analytics View State
  const [selectedStudentForAnalytics, setSelectedStudentForAnalytics] = useState<SafeStudentProfile | null>(null);
  const [studentStats, setStudentStats] = useState<StudentAttendanceStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(false);

  // In-App Edit Modal State
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceStatus>('present');
  const [editNotes, setEditNotes] = useState<string>('');
  const [isUpdatingRecord, setIsUpdatingRecord] = useState<boolean>(false);
  const [editModalError, setEditModalError] = useState<string | null>(null);

  // In-App Delete Confirmation Modal State
  const [deletingRecord, setDeletingRecord] = useState<AttendanceRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Toast Notification helper
  const showToast = useCallback((msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  }, []);

  // Load All System Data
  const loadAllData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);
    setGlobalError(null);

    try {
      const [attRes, stdRes, crsRes, ttRes] = await Promise.allSettled([
        getAllAttendanceRecords(),
        getAllStudents(),
        getAllCourses(true),
        getAllTimetableEntries(),
      ]);

      if (attRes.status === 'fulfilled') setRecords(attRes.value);
      if (stdRes.status === 'fulfilled') setStudents(stdRes.value);
      if (crsRes.status === 'fulfilled') {
        setCourses(crsRes.value);
        if (!selectedCourseId && crsRes.value.length > 0) {
          setSelectedCourseId(crsRes.value[0].id);
        }
      }
      if (ttRes.status === 'fulfilled') setTimetableEntries(ttRes.value);
    } catch (err: any) {
      console.error('Error loading attendance data:', err);
      setGlobalError(err?.message || 'उपस्थिति डेटाबेस लोड करने में त्रुटि हुई।');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle Date Input Change
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const dateCheck = isValidAttendanceDate(newDate);
    if (!dateCheck.isValid) {
      setDateValidationError(dateCheck.error || 'अमान्य तिथि।');
    } else {
      setDateValidationError(null);
    }
  };

  // Find Day of Week for Selected Date
  const selectedDateDayOfWeek = useMemo((): DayOfWeek => {
    if (!selectedDate) return 'Monday';
    const d = new Date(selectedDate + 'T00:00:00');
    const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[d.getDay()] || 'Monday';
  }, [selectedDate]);

  // Matching Timetable Sessions for Selected Date & Course
  const matchingTimetableSessions = useMemo(() => {
    return timetableEntries.filter(
      (tt) =>
        tt.status === 'active' &&
        tt.day === selectedDateDayOfWeek &&
        (!selectedCourseId || tt.courseId === selectedCourseId)
    );
  }, [timetableEntries, selectedDateDayOfWeek, selectedCourseId]);

  // Build Roster for Daily Marking
  useEffect(() => {
    if (!selectedCourseId || students.length === 0) {
      setRoster([]);
      return;
    }

    const selectedCourse = courses.find((c) => c.id === selectedCourseId);
    const targetClass = selectedCourse?.classLevel;

    // Filter students enrolled in course OR matching classLevel
    const eligibleStudents = students.filter((std) => {
      if (std.status === 'inactive') return false;
      const isEnrolled = std.enrolledCourseIds && std.enrolledCourseIds.includes(selectedCourseId);
      const isClassMatch = targetClass && std.classLevel === targetClass;
      return isEnrolled || isClassMatch;
    });

    // Match with existing records for this (Date + Student + Course + TimetableSession)
    const newRoster: StudentRosterItem[] = eligibleStudents.map((std) => {
      const existing = records.find(
        (r) =>
          r.date === selectedDate &&
          r.studentId === std.uid &&
          r.courseId === selectedCourseId &&
          (!selectedTimetableId || r.timetableId === selectedTimetableId)
      );

      return {
        student: std,
        status: existing ? existing.status : 'unmarked',
        notes: existing ? existing.notes || '' : '',
        existingRecordId: existing?.id,
      };
    });

    setRoster(newRoster);
  }, [selectedDate, selectedCourseId, selectedTimetableId, students, courses, records]);

  // Daily Marking Stats
  const markingStats = useMemo(() => {
    const total = roster.length;
    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;
    let unmarked = 0;

    roster.forEach((item) => {
      if (item.status === 'present') present++;
      else if (item.status === 'absent') absent++;
      else if (item.status === 'late') late++;
      else if (item.status === 'leave') leave++;
      else unmarked++;
    });

    const totalMarked = present + absent + late + leave;
    const rate = totalMarked > 0 ? Math.round(((present + late) / totalMarked) * 100) : 0;

    return { total, present, absent, late, leave, unmarked, totalMarked, rate };
  }, [roster]);

  // System Overall Stats
  const systemMetrics = useMemo(() => {
    const todayStr = getTodayDateString();
    const todayRecords = records.filter((r) => r.date === todayStr);

    let todayPresent = 0;
    let todayAbsent = 0;
    let todayLate = 0;
    let todayLeave = 0;

    todayRecords.forEach((r) => {
      if (r.status === 'present') todayPresent++;
      else if (r.status === 'absent') todayAbsent++;
      else if (r.status === 'late') todayLate++;
      else if (r.status === 'leave') todayLeave++;
    });

    const todayMarked = todayPresent + todayAbsent + todayLate + todayLeave;
    const todayRate = todayMarked > 0 ? Math.round(((todayPresent + todayLate) / todayMarked) * 100) : 0;

    return {
      totalRecordsCount: records.length,
      todayMarked,
      todayPresent,
      todayAbsent,
      todayLate,
      todayLeave,
      todayRate,
    };
  }, [records]);

  // Bulk Status Updaters
  const handleMarkAll = (status: AttendanceStatus) => {
    setRoster((prev) =>
      prev.map((item) => ({
        ...item,
        status,
      }))
    );
  };

  const handleResetRoster = () => {
    setRoster((prev) =>
      prev.map((item) => ({
        ...item,
        status: 'unmarked',
        notes: '',
      }))
    );
  };

  // Individual Student Status Updater
  const handleStudentStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRoster((prev) =>
      prev.map((item) => (item.student.uid === studentId ? { ...item, status } : item))
    );
  };

  // Individual Student Note Updater
  const handleStudentNoteChange = (studentId: string, notes: string) => {
    setRoster((prev) =>
      prev.map((item) => (item.student.uid === studentId ? { ...item, notes } : item))
    );
  };

  // Save Bulk Daily Attendance
  const handleSaveDailyAttendance = async () => {
    const dateCheck = isValidAttendanceDate(selectedDate);
    if (!dateCheck.isValid) {
      setGlobalError(dateCheck.error || 'भविष्य की तिथि के लिए उपस्थिति दर्ज नहीं की जा सकती।');
      return;
    }

    if (!selectedCourseId) {
      setGlobalError('कृपया कोर्स व बैच का चयन करें।');
      return;
    }

    const markedItems = roster.filter((item) => item.status !== 'unmarked');
    if (markedItems.length === 0) {
      setGlobalError('कृपया कम से कम एक विद्यार्थी की उपस्थिति (Present / Absent / Late / Leave) चिह्नित करें।');
      return;
    }

    const currentCourse = courses.find((c) => c.id === selectedCourseId);
    const courseName = currentCourse?.title || 'लक्ष्य बैच';
    const batchName = currentCourse?.batchName || 'लक्ष्य बैच';
    const classLevel = currentCourse?.classLevel || 'class-10';

    const selectedSession = timetableEntries.find((tt) => tt.id === selectedTimetableId);

    const payloadItems: SaveAttendanceItemInput[] = markedItems.map((item) => ({
      studentId: item.student.uid,
      studentName: item.student.displayName,
      studentPhone: item.student.phoneNumber || '',
      classLevel: (item.student.classLevel as ClassLevel) || classLevel,
      courseId: selectedCourseId,
      courseName,
      batchName,
      timetableId: selectedTimetableId || undefined,
      subjectId: selectedSession?.subjectId || undefined,
      subjectName: selectedSession?.subjectName || undefined,
      teacherId: selectedSession?.teacherId || undefined,
      teacherName: selectedSession?.teacherName || undefined,
      status: item.status as AttendanceStatus,
      notes: item.notes,
    }));

    const bulkPayload: BulkSaveAttendanceInput = {
      date: selectedDate,
      courseId: selectedCourseId,
      timetableId: selectedTimetableId || undefined,
      items: payloadItems,
    };

    setIsSavingAttendance(true);
    setGlobalError(null);

    try {
      const saved = await saveBulkAttendance(bulkPayload, 'owner', 'इंजीनियर आर.के. सिंह (Owner)');
      
      // Update local state smoothly
      setRecords((prev) => {
        const savedMap = new Map(saved.map((s) => [s.id, s]));
        const unchanged = prev.filter((r) => !savedMap.has(r.id));
        return [...saved, ...unchanged];
      });

      showToast(`${saved.length} विद्यार्थियों की उपस्थिति सफलतापूर्वक सहेजी गई!`);
    } catch (err: any) {
      console.error('Save attendance error:', err);
      setGlobalError(err?.message || 'उपस्थिति सहेजने में त्रुटि हुई।');
    } finally {
      setIsSavingAttendance(false);
    }
  };

  // Open Student Analytics
  const handleOpenStudentAnalytics = async (student: SafeStudentProfile) => {
    setSelectedStudentForAnalytics(student);
    setIsStatsLoading(true);
    try {
      const stats = await getStudentAttendanceSummary(student.uid);
      setStudentStats(stats);
    } catch (err) {
      console.warn('Error fetching student stats:', err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setEditStatus(rec.status);
    setEditNotes(rec.notes || '');
    setEditModalError(null);
  };

  // Submit Edit Status
  const handleSaveEditedStatus = async () => {
    if (!editingRecord) return;
    setIsUpdatingRecord(true);
    setEditModalError(null);

    try {
      const updated = await updateAttendanceStatus(editingRecord.id, editStatus, editNotes);
      setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      showToast(`${updated.studentName} की उपस्थिति स्थिति अपडेट हो गई!`);
      setEditingRecord(null);
    } catch (err: any) {
      setEditModalError(err?.message || 'स्थिति अपडेट करने में त्रुटि हुई।');
    } finally {
      setIsUpdatingRecord(false);
    }
  };

  // Confirm In-App Delete
  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteAttendanceRecord(deletingRecord.id);
      setRecords((prev) => prev.filter((r) => r.id !== deletingRecord.id));
      showToast('उपस्थिति रिकॉर्ड सफलतापूर्वक हटा दिया गया।');
      setDeletingRecord(null);
    } catch (err: any) {
      setDeleteError(err?.message || 'रिकॉर्ड हटाने में त्रुटि हुई।');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered History Records
  const filteredHistoryRecords = useMemo(() => {
    return records.filter((r) => {
      if (filterDate && r.date !== filterDate) return false;
      if (filterCourse !== 'all' && r.courseId !== filterCourse) return false;
      if (filterClass !== 'all' && r.classLevel !== filterClass) return false;
      if (filterStudent !== 'all' && r.studentId !== filterStudent) return false;
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = r.studentName?.toLowerCase().includes(q);
        const matchPhone = r.studentPhone?.includes(q);
        const matchCourse = r.courseName?.toLowerCase().includes(q);
        const matchBatch = r.batchName?.toLowerCase().includes(q);
        const matchNotes = r.notes?.toLowerCase().includes(q);
        const matchSubject = r.subjectName?.toLowerCase().includes(q);
        const matchTeacher = r.teacherName?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchCourse && !matchBatch && !matchNotes && !matchSubject && !matchTeacher) {
          return false;
        }
      }

      return true;
    });
  }, [records, filterDate, filterCourse, filterClass, filterStudent, filterStatus, searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <UserCheck className="w-3.5 h-3.5" />
              <span>RK STUDY CENTRE • कार्य 7: उपस्थिति प्रबंधन (Attendance Management)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>छात्र उपस्थिति एवं सत्र ट्रैकर</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
              मैट्रिक एवं इंटरमीडिएट कक्षाओं की दैनिक व बैच-वार उपस्थिति दर्ज करें। रीयल-टाइम उपस्थिति दर (Attendance %), डुप्लीकेट रोकथाम एवं इतिहास लॉग के साथ।
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
          </div>
        </div>
      </div>

      {/* Success Toast */}
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

      {/* Global Error Alert */}
      {globalError && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-900 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{globalError}</span>
          </div>
          <button
            onClick={() => setGlobalError(null)}
            className="p-1 hover:bg-rose-100 rounded-lg text-rose-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Real Statistics Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3 sm:gap-4 hover:border-emerald-300 transition-all">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[11px] sm:text-xs text-slate-500 font-bold block leading-tight">
              आज उपस्थित छात्र
            </span>
            <span className="text-lg sm:text-2xl font-black text-emerald-700 tracking-tight">
              {systemMetrics.todayPresent}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3 sm:gap-4 hover:border-rose-300 transition-all">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <UserX className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[11px] sm:text-xs text-slate-500 font-bold block leading-tight">
              आज अनुपस्थित छात्र
            </span>
            <span className="text-lg sm:text-2xl font-black text-rose-600 tracking-tight">
              {systemMetrics.todayAbsent}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3 sm:gap-4 hover:border-amber-300 transition-all">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[11px] sm:text-xs text-slate-500 font-bold block leading-tight">
              आज विलंबित (Late) / अवकाश
            </span>
            <span className="text-lg sm:text-2xl font-black text-amber-600 tracking-tight">
              {systemMetrics.todayLate + systemMetrics.todayLeave}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3 sm:gap-4 hover:border-blue-300 transition-all">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <Percent className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[11px] sm:text-xs text-slate-500 font-bold block leading-tight">
              आज की उपस्थिति दर (%)
            </span>
            <span className="text-lg sm:text-2xl font-black text-blue-700 tracking-tight">
              {systemMetrics.todayRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Mode Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveView('mark')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 min-h-[44px] ${
            activeView === 'mark'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>दैनिक उपस्थिति दर्ज करें (Mark Attendance)</span>
        </button>

        <button
          onClick={() => setActiveView('history')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 min-h-[44px] ${
            activeView === 'history'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>उपस्थिति इतिहास व लॉग (History)</span>
        </button>
      </div>

      {/* View 1: Mark Daily Attendance */}
      {activeView === 'mark' && (
        <div className="space-y-6">
          {/* Controls Bar: Date, Course/Batch, Session Selector */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Picker */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                  उपस्थिति तिथि (Date) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    max={getTodayDateString()}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {dateValidationError ? (
                  <span className="text-[11px] font-bold text-rose-600 block mt-1">
                    {dateValidationError}
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-500 block mt-1">
                    {formatDisplayDate(selectedDate)} ({selectedDateDayOfWeek})
                  </span>
                )}
              </div>

              {/* Course / Batch Selector */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                  कोर्स एवं लक्ष्य बैच (Course / Batch) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    setSelectedTimetableId('');
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {courses.map((crs) => (
                    <option key={crs.id} value={crs.id}>
                      {crs.title} • ({crs.classLevel.toUpperCase()}) - बैच: {crs.batchName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Timetable Session Link (Optional) */}
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                  समय-सारणी सत्र (Scheduled Session - Optional)
                </label>
                <select
                  value={selectedTimetableId}
                  onChange={(e) => setSelectedTimetableId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- सामान्य दैनिक उपस्थिति (General Batch) --</option>
                  {matchingTimetableSessions.map((tt) => (
                    <option key={tt.id} value={tt.id}>
                      {tt.startTime} - {tt.endTime} | {tt.subjectName} ({tt.teacherName})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">
                  {matchingTimetableSessions.length > 0
                    ? `इस दिन के लिए ${matchingTimetableSessions.length} कक्षाएं उपलब्ध हैं`
                    : 'इस दिन कोई समय-सारणी स्लॉट नहीं है'}
                </span>
              </div>
            </div>

            {/* Bulk Actions & Tally Toolbar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black text-slate-600 uppercase tracking-wider mr-1">
                  त्वरित कार्रवाई:
                </span>
                <button
                  type="button"
                  onClick={() => handleMarkAll('present')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span>सभी उपस्थित (All Present)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll('absent')}
                  className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5 text-rose-700" />
                  <span>सभी अनुपस्थित (All Absent)</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetRoster}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                  <span>रीसेट</span>
                </button>
              </div>

              {/* Tally Pill */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-black">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                  कुल: {markingStats.total}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                  उपस्थित: {markingStats.present}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800">
                  अनुपस्थित: {markingStats.absent}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800">
                  देर: {markingStats.late}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800">
                  अवकाश: {markingStats.leave}
                </span>
                {markingStats.unmarked > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-600">
                    शेष: {markingStats.unmarked}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Student Roster Table / Mobile Cards */}
          {isLoading ? (
            <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-4 shadow-sm">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
              <p className="text-slate-700 font-bold text-sm">विद्यार्थी सूची लोड हो रही है...</p>
            </div>
          ) : roster.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 sm:p-16 border border-slate-200 text-center space-y-3 shadow-sm max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">इस बैच में कोई सक्रिय छात्र नहीं मिला</h3>
              <p className="text-xs text-slate-500 font-medium">
                चयनित कोर्स या कक्षा के लिए अभी कोई विद्यार्थी पंजीकृत नहीं है। कृपया दूसरा बैच चुनें।
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Desktop Roster Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-xs font-black uppercase tracking-wider">
                      <th className="py-4 px-6">क्र.सं.</th>
                      <th className="py-4 px-6">विद्यार्थी का नाम व संपर्क</th>
                      <th className="py-4 px-6">कक्षा (Class Level)</th>
                      <th className="py-4 px-6">उपस्थिति स्थिति (Status)</th>
                      <th className="py-4 px-6">विशेष नोट्स (Optional Notes)</th>
                      <th className="py-4 px-6 text-right">प्रोफ़ाइल</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {roster.map((item, idx) => (
                      <tr
                        key={item.student.uid}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          item.status === 'present'
                            ? 'bg-emerald-50/20'
                            : item.status === 'absent'
                            ? 'bg-rose-50/20'
                            : item.status === 'late'
                            ? 'bg-amber-50/20'
                            : item.status === 'leave'
                            ? 'bg-blue-50/20'
                            : ''
                        }`}
                      >
                        {/* Index */}
                        <td className="py-4 px-6 font-bold text-slate-400">{idx + 1}</td>

                        {/* Student Name & Phone */}
                        <td className="py-4 px-6">
                          <div className="font-black text-slate-900 text-sm">
                            {item.student.displayName}
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {item.student.phoneNumber || 'मोबाइल नंबर उपलब्ध नहीं'}
                          </span>
                        </td>

                        {/* Class */}
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 text-blue-700 font-black text-[10px] uppercase">
                            {item.student.classLevel ? item.student.classLevel.toUpperCase() : 'CLASS 10'}
                          </span>
                        </td>

                        {/* Status Buttons */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStudentStatusChange(item.student.uid, 'present')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                                item.status === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>उपस्थित</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStudentStatusChange(item.student.uid, 'absent')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                                item.status === 'absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700'
                              }`}
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>अनुपस्थित</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStudentStatusChange(item.student.uid, 'late')}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                                item.status === 'late'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700'
                              }`}
                              title="विलंबित / देर से आया"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>देर से</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStudentStatusChange(item.student.uid, 'leave')}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                                item.status === 'leave'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700'
                              }`}
                              title="स्वीकृत अवकाश / Leave"
                            >
                              <span>छुट्टी</span>
                            </button>
                          </div>
                        </td>

                        {/* Notes Input */}
                        <td className="py-4 px-6">
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) => handleStudentNoteChange(item.student.uid, e.target.value)}
                            placeholder="नोट्स (उदा. 15 मिनट देर, अस्वस्थ...)"
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>

                        {/* Analytics Action */}
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenStudentAnalytics(item.student)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-colors cursor-pointer"
                            title="उपस्थिति इतिहास देखें"
                          >
                            <Percent className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Roster Cards */}
              <div className="md:hidden p-4 space-y-4 divide-y divide-slate-100">
                {roster.map((item, idx) => (
                  <div key={item.student.uid} className="pt-4 first:pt-0 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-400">#{idx + 1}</span>
                          <h4 className="text-base font-black text-slate-900">
                            {item.student.displayName}
                          </h4>
                        </div>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {item.student.phoneNumber || 'मोबाइल नंबर नहीं'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenStudentAnalytics(item.student)}
                        className="p-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                      >
                        <Percent className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Mobile Status Selector (Large Touch Targets >= 44px) */}
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStudentStatusChange(item.student.uid, 'present')}
                        className={`py-2.5 rounded-xl text-xs font-black text-center min-h-[44px] transition-all ${
                          item.status === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        उपस्थित
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStudentStatusChange(item.student.uid, 'absent')}
                        className={`py-2.5 rounded-xl text-xs font-black text-center min-h-[44px] transition-all ${
                          item.status === 'absent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        अनुपस्थित
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStudentStatusChange(item.student.uid, 'late')}
                        className={`py-2.5 rounded-xl text-xs font-black text-center min-h-[44px] transition-all ${
                          item.status === 'late'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        देर से
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStudentStatusChange(item.student.uid, 'leave')}
                        className={`py-2.5 rounded-xl text-xs font-black text-center min-h-[44px] transition-all ${
                          item.status === 'leave'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        छुट्टी
                      </button>
                    </div>

                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => handleStudentNoteChange(item.student.uid, e.target.value)}
                      placeholder="विशेष टिप्पणी (Notes)..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                ))}
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs sm:text-sm font-medium">
                  चिह्नित उपस्थिति: <span className="font-black text-emerald-400">{markingStats.totalMarked}</span> / {markingStats.total} विद्यार्थी
                </div>

                <button
                  type="button"
                  id="save-daily-attendance-btn"
                  onClick={handleSaveDailyAttendance}
                  disabled={isSavingAttendance || markingStats.totalMarked === 0}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingAttendance ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>उपस्थिति सहेजी जा रही है...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-slate-950" />
                      <span>उपस्थिति सुरक्षित करें (Save Attendance)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View 2: Attendance History & Log */}
      {activeView === 'history' && (
        <div className="space-y-6">
          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="विद्यार्थी नाम, मोबाइल, बैच, शिक्षक या विषय खोजें..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
              {/* Date Filter */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  तिथि (Date)
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              {/* Course Filter */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  कोर्स / बैच (Batch)
                </label>
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="all">सभी कोर्स व बैच (All)</option>
                  {courses.map((crs) => (
                    <option key={crs.id} value={crs.id}>
                      {crs.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class Filter */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  कक्षा (Class)
                </label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="all">सभी कक्षाएं (All)</option>
                  {CLASSES_METADATA.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.hindiName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Filter */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  विद्यार्थी (Student)
                </label>
                <select
                  value={filterStudent}
                  onChange={(e) => setFilterStudent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="all">सभी विद्यार्थी (All)</option>
                  {students.map((s) => (
                    <option key={s.uid} value={s.uid}>
                      {s.displayName} {s.phoneNumber ? `(${s.phoneNumber})` : ''}
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="all">सभी स्थितियां (All)</option>
                  <option value="present">उपस्थित (Present)</option>
                  <option value="absent">अनुपस्थित (Absent)</option>
                  <option value="late">विलंबित (Late)</option>
                  <option value="leave">अवकाश (Leave)</option>
                </select>
              </div>
            </div>

            {(searchQuery || filterDate || filterCourse !== 'all' || filterClass !== 'all' || filterStudent !== 'all' || filterStatus !== 'all') && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">
                  {filteredHistoryRecords.length} रिकॉर्ड्स मिले
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterDate('');
                    setFilterCourse('all');
                    setFilterClass('all');
                    setFilterStudent('all');
                    setFilterStatus('all');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-black text-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>फ़िल्टर साफ़ करें</span>
                </button>
              </div>
            )}
          </div>

          {/* History Records Table / Cards */}
          {filteredHistoryRecords.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 sm:p-16 border border-slate-200 text-center space-y-3 shadow-sm max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">कोई उपस्थिति रिकॉर्ड नहीं मिला</h3>
              <p className="text-xs text-slate-500 font-medium">
                चयनित फ़िल्टर या तिथि के लिए कोई उपस्थिति प्रविष्टि उपलब्ध नहीं है।
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-xs font-black uppercase tracking-wider">
                      <th className="py-4 px-6">दिनांक (Date)</th>
                      <th className="py-4 px-6">विद्यार्थी का नाम व संपर्क</th>
                      <th className="py-4 px-6">कोर्स एवं बैच</th>
                      <th className="py-4 px-6">सत्र / विषय</th>
                      <th className="py-4 px-6">उपस्थिति स्थिति</th>
                      <th className="py-4 px-6">टिप्पणी (Notes)</th>
                      <th className="py-4 px-6 text-right">कार्रवाई</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {filteredHistoryRecords.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Date */}
                        <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                          {formatDisplayDate(item.date)}
                        </td>

                        {/* Student */}
                        <td className="py-4 px-6">
                          <div className="font-black text-slate-900 text-sm">
                            {item.studentName}
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            {item.studentPhone || 'मोबाइल उपलब्ध नहीं'}
                          </span>
                        </td>

                        {/* Course */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">{item.courseName}</div>
                          {item.batchName && (
                            <span className="text-[11px] text-slate-400 block">बैच: {item.batchName}</span>
                          )}
                        </td>

                        {/* Session / Subject */}
                        <td className="py-4 px-6">
                          {item.subjectName ? (
                            <div>
                              <span className="font-bold text-indigo-700">{item.subjectName}</span>
                              {item.teacherName && (
                                <span className="text-[11px] text-slate-500 block">
                                  शिक्षक: {item.teacherName}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">दैनिक सत्र</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                              item.status === 'present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'absent'
                                ? 'bg-rose-100 text-rose-800'
                                : item.status === 'late'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                item.status === 'present'
                                  ? 'bg-emerald-500'
                                  : item.status === 'absent'
                                  ? 'bg-rose-500'
                                  : item.status === 'late'
                                  ? 'bg-amber-500'
                                  : 'bg-blue-500'
                              }`}
                            />
                            <span>
                              {item.status === 'present'
                                ? 'उपस्थित'
                                : item.status === 'absent'
                                ? 'अनुपस्थित'
                                : item.status === 'late'
                                ? 'विलंबित'
                                : 'अवकाश'}
                            </span>
                          </span>
                        </td>

                        {/* Notes */}
                        <td className="py-4 px-6">
                          <span className="text-slate-600 italic">
                            {item.notes || '—'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 transition-colors cursor-pointer"
                              title="स्थिति बदलें"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeletingRecord(item)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors cursor-pointer"
                              title="रिकॉर्ड हटाएं"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile History Cards */}
              <div className="lg:hidden p-4 space-y-3 divide-y divide-slate-100">
                {filteredHistoryRecords.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 block">
                          {formatDisplayDate(item.date)}
                        </span>
                        <h4 className="text-base font-black text-slate-900 mt-0.5">
                          {item.studentName}
                        </h4>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          item.status === 'present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'absent'
                            ? 'bg-rose-100 text-rose-800'
                            : item.status === 'late'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.status === 'present'
                          ? 'उपस्थित'
                          : item.status === 'absent'
                          ? 'अनुपस्थित'
                          : item.status === 'late'
                          ? 'देर से'
                          : 'छुट्टी'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl space-y-1">
                      <div>
                        <span className="text-slate-400 font-bold">कोर्स: </span>
                        <span className="font-medium text-slate-800">{item.courseName}</span>
                      </div>
                      {item.notes && (
                        <div>
                          <span className="text-slate-400 font-bold">टिप्पणी: </span>
                          <span className="font-medium text-slate-700 italic">{item.notes}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold"
                      >
                        संपादित करें
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingRecord(item)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold"
                      >
                        हटाएं
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Student Attendance Analytics Modal */}
      {selectedStudentForAnalytics && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-slate-200 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">
                    विद्यार्थी उपस्थिति विश्लेषण
                  </h4>
                  <span className="text-xs text-slate-500 font-bold">
                    {selectedStudentForAnalytics.displayName}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedStudentForAnalytics(null);
                  setStudentStats(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isStatsLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500 mt-2">आंकड़े संकलित किए जा रहे हैं...</p>
              </div>
            ) : studentStats ? (
              <div className="space-y-5">
                {/* Score / Percentage Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      कुल उपस्थिति दर (Attendance Rate)
                    </span>
                    <span className="text-2xl font-black text-emerald-400">
                      {studentStats.attendancePercentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${studentStats.attendancePercentage}%` }}
                    />
                  </div>

                  <span className="text-[11px] text-slate-300 font-medium block">
                    सूत्र: (उपस्थित + विलंबित) ÷ कुल चिह्नित सत्र × 100
                  </span>
                </div>

                {/* Grid Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 font-bold block text-[10px]">कुल सत्र</span>
                    <span className="font-black text-slate-900 text-base">{studentStats.totalMarked}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                    <span className="text-emerald-700 font-bold block text-[10px]">उपस्थित</span>
                    <span className="font-black text-base">{studentStats.presentCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-900">
                    <span className="text-rose-700 font-bold block text-[10px]">अनुपस्थित</span>
                    <span className="font-black text-base">{studentStats.absentCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-900">
                    <span className="text-amber-700 font-bold block text-[10px]">देर / छुट्टी</span>
                    <span className="font-black text-base">{studentStats.lateCount + studentStats.leaveCount}</span>
                  </div>
                </div>

                {/* Recent History List */}
                <div className="space-y-2">
                  <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    हाल के उपस्थिति सत्र (Recent Sessions)
                  </h5>
                  {studentStats.records.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">कोई सत्र रिकॉर्ड नहीं है।</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs border border-slate-100 rounded-xl">
                      {studentStats.records.map((r) => (
                        <div key={r.id} className="p-2.5 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 block">{formatDisplayDate(r.date)}</span>
                            <span className="text-[10px] text-slate-400">{r.courseName}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                              r.status === 'present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'absent'
                                ? 'bg-rose-100 text-rose-800'
                                : r.status === 'late'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {r.status === 'present'
                              ? 'उपस्थित'
                              : r.status === 'absent'
                              ? 'अनुपस्थित'
                              : r.status === 'late'
                              ? 'विलंबित'
                              : 'अवकाश'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedStudentForAnalytics(null);
                  setStudentStats(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Edit Status Modal */}
      {editingRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border-2 border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-black text-slate-900 text-base">
                उपस्थिति स्थिति संपादित करें
              </h4>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editModalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{editModalError}</span>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-black text-slate-900 text-sm">{editingRecord.studentName}</div>
              <div className="text-slate-500 font-medium">दिनांक: {formatDisplayDate(editingRecord.date)}</div>
              <div className="text-slate-500 font-medium">कोर्स: {editingRecord.courseName}</div>
            </div>

            {/* Status Selection Buttons */}
            <div>
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                नई स्थिति (New Status)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEditStatus('present')}
                  className={`p-2.5 rounded-xl text-xs font-black text-center border cursor-pointer ${
                    editStatus === 'present'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  उपस्थित (Present)
                </button>
                <button
                  type="button"
                  onClick={() => setEditStatus('absent')}
                  className={`p-2.5 rounded-xl text-xs font-black text-center border cursor-pointer ${
                    editStatus === 'absent'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  अनुपस्थित (Absent)
                </button>
                <button
                  type="button"
                  onClick={() => setEditStatus('late')}
                  className={`p-2.5 rounded-xl text-xs font-black text-center border cursor-pointer ${
                    editStatus === 'late'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  विलंबित (Late)
                </button>
                <button
                  type="button"
                  onClick={() => setEditStatus('leave')}
                  className={`p-2.5 rounded-xl text-xs font-black text-center border cursor-pointer ${
                    editStatus === 'leave'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  अवकाश (Leave)
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1">
                टिप्पणी (Optional Notes)
              </label>
              <input
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="कारण या टिप्पणी दर्ज करें..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                disabled={isUpdatingRecord}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={handleSaveEditedStatus}
                disabled={isUpdatingRecord}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
              >
                {isUpdatingRecord ? 'अपडेट हो रहा है...' : 'सुरक्षित करें'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal (Zero Native Alerts) */}
      {deletingRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border-2 border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-slate-900">
                  उपस्थिति रिकॉर्ड हटाएं
                </h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  क्या आप निम्नलिखित उपस्थिति प्रविष्टि को डेटाबेस से स्थायी रूप से हटाना चाहते हैं?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-black text-slate-900">{deletingRecord.studentName}</div>
              <div className="text-slate-500 font-medium">दिनांक: {formatDisplayDate(deletingRecord.date)}</div>
              <div className="text-slate-500 font-medium">कोर्स: {deletingRecord.courseName}</div>
              <div className="font-bold text-slate-700">स्थिति: {deletingRecord.status.toUpperCase()}</div>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingRecord(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'हटाया जा रहा है...' : 'हाँ, हटाएं'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
