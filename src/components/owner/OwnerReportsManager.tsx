/**
 * RK STUDY CENTRE - Executive Reports & Analytics Manager (Task 15)
 * 
 * Comprehensive, multi-dimensional institutional reporting system:
 * - Direct real-data aggregations across all previous tasks.
 * - Zero fake/synthetic numbers; empty states when records are missing.
 * - Strict adherence to institutional calculation formulas:
 *   - Attendance % = (Present + Late) / (Present + Absent + Late + Leave) * 100
 *   - Fee Paid = sum(valid active installments)
 *   - Fee Due = Math.max(0, finalFee - paidAmount)
 *   - Academic Grades = Task 11 exact thresholds (A+, A, B+, B, C, D, F)
 * - Preset & Custom Date Range filtering with range integrity.
 * - In-app CSV Export with RFC-4180 escaping and UTF-8 BOM.
 * - Fully accessible, mobile-first responsive design (320px to desktop).
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  RefreshCw,
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  CreditCard,
  FileSpreadsheet,
  MessageSquare,
  Bell,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import type { OwnerTabType } from '../../views/OwnerView';
import {
  fetchAllReportsData,
  exportToCsv,
  getPresetDateRange,
  isDateInRange,
  toLocalDateString,
  type DatePreset,
  type RawReportsData,
} from '../../services/reportService';
import type { SafeStudentProfile } from '../../services/studentService';
import { calculateGrade } from '../../services/resultService';
import type {
  PaymentInstallment,
} from '../../types';

interface OwnerReportsManagerProps {
  onNavigateTab?: (tab: OwnerTabType) => void;
}

type ReportSubTab =
  | 'overview'
  | 'students'
  | 'attendance'
  | 'fees'
  | 'academics'
  | 'courses'
  | 'teachers'
  | 'inquiries'
  | 'content';

export function OwnerReportsManager({ onNavigateTab }: OwnerReportsManagerProps) {
  // Global State
  const [data, setData] = useState<RawReportsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Active Sub-tab
  const [activeSubTab, setActiveSubTab] = useState<ReportSubTab>('overview');

  // Date Range State
  const [datePreset, setDatePreset] = useState<DatePreset>('last30days');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [dateRangeError, setDateRangeError] = useState<string | null>(null);

  // Computed Date Range
  const activeDateRange = useMemo(() => {
    if (datePreset === 'custom') {
      return {
        startDate: customStartDate || null,
        endDate: customEndDate || null,
        label: customStartDate && customEndDate ? `${customStartDate} से ${customEndDate}` : 'कस्टम सीमा',
      };
    }
    return getPresetDateRange(datePreset);
  }, [datePreset, customStartDate, customEndDate]);

  // Load all institutional data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await fetchAllReportsData();
      setData(result);
    } catch (err: any) {
      console.error('[OwnerReportsManager] Failed to load data:', err);
      setErrorMessage(err?.message || 'डेटा लोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Date Range Presets Change Handler
  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    setDateRangeError(null);
    if (preset !== 'custom') {
      const range = getPresetDateRange(preset);
      if (range.startDate) setCustomStartDate(range.startDate);
      if (range.endDate) setCustomEndDate(range.endDate);
    }
  };

  // Custom Date Change Handler with Strict Validation
  const handleCustomDateApply = () => {
    setDateRangeError(null);
    if (!customStartDate || !customEndDate) {
      setDateRangeError('प्रारंभ तिथि और अंतिम तिथि दोनों अनिवार्य हैं।');
      return;
    }
    if (customStartDate > customEndDate) {
      setDateRangeError('प्रारंभ तिथि (Start Date), अंतिम तिथि (End Date) से बाद की नहीं हो सकती।');
      return;
    }
    setDatePreset('custom');
  };

  // =========================================================================
  // 1. FILTERED DATASETS ACCORDING TO ACTIVE DATE RANGE
  // =========================================================================
  const { startDate, endDate } = activeDateRange;

  // Filtered Students (filtered by registration createdAt)
  const filteredStudents = useMemo(() => {
    if (!data?.students) return [];
    return data.students.filter((s: SafeStudentProfile) => isDateInRange(s.createdAt, startDate, endDate));
  }, [data?.students, startDate, endDate]);

  // Filtered Teachers (filtered by join/creation date)
  const filteredTeachers = useMemo(() => {
    if (!data?.teachers) return [];
    return data.teachers.filter((t) => isDateInRange(t.createdAt, startDate, endDate));
  }, [data?.teachers, startDate, endDate]);

  // Filtered Attendance (filtered strictly by attendance record `date`)
  const filteredAttendance = useMemo(() => {
    if (!data?.attendance) return [];
    return data.attendance.filter((a) => isDateInRange(a.date, startDate, endDate));
  }, [data?.attendance, startDate, endDate]);

  // Filtered Fees & Installments
  const filteredFees = useMemo(() => {
    if (!data?.fees) return [];
    return data.fees.filter((f) => isDateInRange(f.createdAt, startDate, endDate));
  }, [data?.fees, startDate, endDate]);

  // Filtered Individual Payment Installments across all fee records
  const filteredInstallments = useMemo(() => {
    if (!data?.fees) return [];
    const list: (PaymentInstallment & {
      studentName: string;
      courseName: string;
      studentId: string;
    })[] = [];

    data.fees.forEach((fee) => {
      (fee.installments || []).forEach((inst) => {
        const pDate = inst.paymentDate || inst.createdAt;
        if (isDateInRange(pDate, startDate, endDate)) {
          list.push({
            ...inst,
            studentName: fee.studentName || 'विद्यार्थी',
            courseName: fee.courseName || 'कोर्स',
            studentId: fee.studentId,
          });
        }
      });
    });

    // Sort by payment date descending
    list.sort((a, b) => {
      const tA = new Date(a.paymentDate || a.createdAt).getTime() || 0;
      const tB = new Date(b.paymentDate || b.createdAt).getTime() || 0;
      return tB - tA;
    });

    return list;
  }, [data?.fees, startDate, endDate]);

  // Filtered Exams (filtered by startDate or createdAt)
  const filteredExams = useMemo(() => {
    if (!data?.exams) return [];
    return data.exams.filter((e) => isDateInRange(e.startDate || e.createdAt, startDate, endDate));
  }, [data?.exams, startDate, endDate]);

  // Filtered Results (filtered by publishedAt or createdAt)
  const filteredResults = useMemo(() => {
    if (!data?.results) return [];
    return data.results.filter((r) => isDateInRange(r.publishedAt || r.createdAt, startDate, endDate));
  }, [data?.results, startDate, endDate]);

  // Filtered Inquiries (filtered by createdAt)
  const filteredInquiries = useMemo(() => {
    if (!data?.inquiries) return [];
    return data.inquiries.filter((inq) => isDateInRange(inq.createdAt, startDate, endDate));
  }, [data?.inquiries, startDate, endDate]);

  // Filtered Notices (filtered by publishedAt or createdAt)
  const filteredNotices = useMemo(() => {
    if (!data?.notices) return [];
    return data.notices.filter((n) => isDateInRange(n.publishedAt || n.createdAt, startDate, endDate));
  }, [data?.notices, startDate, endDate]);

  // Filtered Study Materials
  const filteredMaterials = useMemo(() => {
    if (!data?.materials) return [];
    return data.materials.filter((m) => isDateInRange(m.createdAt, startDate, endDate));
  }, [data?.materials, startDate, endDate]);

  // =========================================================================
  // 2. MATHEMATICAL FORMULAS & METRICS COMPUTATIONS
  // =========================================================================

  // A. Attendance Metrics (Strict Task 7 Formula)
  const attendanceMetrics = useMemo(() => {
    let present = 0;
    let late = 0;
    let absent = 0;
    let leave = 0;

    filteredAttendance.forEach((a) => {
      if (a.status === 'present') present++;
      else if (a.status === 'late') late++;
      else if (a.status === 'absent') absent++;
      else if (a.status === 'leave') leave++;
    });

    const totalMarked = present + late + absent + leave;
    // Task 7 Formula: (Present + Late) / Total * 100
    const attendancePercentage = totalMarked > 0
      ? Math.round(((present + late) / totalMarked) * 100)
      : 0;

    return {
      totalMarked,
      present,
      late,
      absent,
      leave,
      attendancePercentage,
    };
  }, [filteredAttendance]);

  // B. Financial Metrics (Strict Task 8/9 Ledger Rules)
  const feeMetrics = useMemo(() => {
    let totalAssessed = 0;
    let totalPaid = 0;
    let totalDue = 0;
    let paidCount = 0;
    let partialCount = 0;
    let overdueCount = 0;
    let dueCount = 0;

    filteredFees.forEach((f) => {
      const finalFee = Number(f.finalFee) || 0;
      const paidAmt = Number(f.paidAmount) || 0;
      const dueAmt = Math.max(0, finalFee - paidAmt);

      totalAssessed += finalFee;
      totalPaid += paidAmt;
      totalDue += dueAmt;

      if (f.paymentStatus === 'paid') paidCount++;
      else if (f.paymentStatus === 'partial') partialCount++;
      else if (f.paymentStatus === 'overdue') overdueCount++;
      else dueCount++;
    });

    // Breakdown from actual individual installments in period
    let onlineCollected = 0;
    let offlineCollected = 0;
    let cashCount = 0;
    let upiCount = 0;
    let bankCount = 0;
    let onlineCount = 0;

    filteredInstallments.forEach((inst) => {
      const amt = Number(inst.amount) || 0;
      if (inst.isOnlineVerified || inst.paymentMethod === 'online' || inst.source === 'online') {
        onlineCollected += amt;
        onlineCount++;
      } else {
        offlineCollected += amt;
        if (inst.paymentMethod === 'cash') cashCount++;
        else if (inst.paymentMethod === 'upi') upiCount++;
        else if (inst.paymentMethod === 'bank_transfer') bankCount++;
        else offlineCollected += amt;
      }
    });

    const collectionPercentage = totalAssessed > 0
      ? Math.min(100, Math.round((totalPaid / totalAssessed) * 100))
      : 0;

    return {
      totalAssessed,
      totalPaid,
      totalDue,
      collectionPercentage,
      paidCount,
      partialCount,
      dueCount,
      overdueCount,
      totalRecords: filteredFees.length,
      onlineCollected,
      offlineCollected,
      cashCount,
      upiCount,
      bankCount,
      onlineCount,
      totalTransactions: filteredInstallments.length,
    };
  }, [filteredFees, filteredInstallments]);

  // C. Academic & Result Metrics (Strict Task 11 Grade Rules)
  const resultMetrics = useMemo(() => {
    let appeared = 0;
    let passed = 0;
    let failed = 0;
    let pending = 0;
    let totalPercentageSum = 0;

    const grades: Record<string, number> = {
      'A+': 0,
      'A': 0,
      'B+': 0,
      'B': 0,
      'C': 0,
      'D': 0,
      'F': 0,
    };

    filteredResults.forEach((r) => {
      if (r.passFail === 'pending') {
        pending++;
        return;
      }
      appeared++;
      const isPassed = r.passFail === 'pass';
      if (isPassed) passed++;
      else failed++;

      const pct = Number(r.percentage) || 0;
      totalPercentageSum += pct;

      // Exact Task 11 centralized grade logic
      const calculatedGrade = r.grade || calculateGrade(pct, isPassed);
      if (grades[calculatedGrade] !== undefined) {
        grades[calculatedGrade]++;
      } else {
        grades['F']++;
      }
    });

    const averagePercentage = appeared > 0 ? Math.round((totalPercentageSum / appeared) * 10) / 10 : 0;
    const passPercentage = appeared > 0 ? Math.round((passed / appeared) * 100) : 0;

    return {
      totalExams: filteredExams.length,
      appeared,
      passed,
      failed,
      pending,
      averagePercentage,
      passPercentage,
      grades,
    };
  }, [filteredExams, filteredResults]);

  // D. Student Breakdown Metrics
  const studentMetrics = useMemo(() => {
    const total = (data?.students || []).length;
    const active = (data?.students || []).filter((s) => s.status === 'active').length;
    const inactive = total - active;
    const newInPeriod = filteredStudents.length;

    // Breakdown by Class
    const byClass: Record<string, number> = {};
    (data?.students || []).forEach((s) => {
      const cls = s.classLevel ? s.classLevel.replace('class-', 'कक्षा ') : 'कक्षा अनिर्दिष्ट';
      byClass[cls] = (byClass[cls] || 0) + 1;
    });

    // Breakdown by Board
    const byBoard: Record<string, number> = {};
    (data?.students || []).forEach((s) => {
      const b = s.board || 'BSEB';
      byBoard[b] = (byBoard[b] || 0) + 1;
    });

    return {
      total,
      active,
      inactive,
      newInPeriod,
      byClass,
      byBoard,
    };
  }, [data?.students, filteredStudents]);

  // E. Inquiries Breakdown Metrics
  const inquiryMetrics = useMemo(() => {
    let total = filteredInquiries.length;
    let newCount = 0;
    let inProgress = 0;
    let replied = 0;
    let resolved = 0;
    let archived = 0;
    let urgent = 0;

    const byType: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    filteredInquiries.forEach((inq) => {
      if (inq.status === 'New') newCount++;
      else if (inq.status === 'InProgress') inProgress++;
      else if (inq.status === 'Replied') replied++;
      else if (inq.status === 'Resolved') resolved++;
      else if (inq.status === 'Archived') archived++;

      if (inq.priority === 'Urgent') urgent++;

      const type = inq.inquiryType || 'General';
      byType[type] = (byType[type] || 0) + 1;

      const src = inq.source || 'Website';
      bySource[src] = (bySource[src] || 0) + 1;
    });

    return {
      total,
      newCount,
      inProgress,
      replied,
      resolved,
      archived,
      urgent,
      byType,
      bySource,
    };
  }, [filteredInquiries]);

  // =========================================================================
  // 3. CSV EXPORT DISPATCHERS
  // =========================================================================
  const handleExportCsv = (section: ReportSubTab) => {
    if (isExporting) return;
    setIsExporting(true);
    const dateLabel = activeDateRange.label.replace(/[^a-zA-Z0-9_\u0900-\u097F]/g, '_');
    const todayStr = toLocalDateString(new Date().toISOString()) || 'export';

    try {
      if (section === 'attendance') {
        const headers = ['तारीख (Date)', 'विद्यार्थी नाम', 'फ़ोन', 'कक्षा', 'कोर्स/बैच', 'स्थिति (Status)', 'टिप्पणी'];
        const rows = filteredAttendance.map((a) => [
          a.date,
          a.studentName,
          a.studentPhone || '',
          a.classLevel || '',
          a.courseName || '',
          a.status,
          a.notes || '',
        ]);
        exportToCsv(`RK_Attendance_Report_${dateLabel}_${todayStr}`, headers, rows, `उपस्थिति रिपोर्ट (${activeDateRange.label})`);
      } else if (section === 'fees') {
        const headers = ['तारीख (Date)', 'विद्यार्थी नाम', 'कोर्स/बैच', 'राशि (₹)', 'भुगतान माध्यम', 'रसीद संख्या', 'ट्रांजैक्शन ID'];
        const rows = filteredInstallments.map((i) => [
          i.paymentDate || i.createdAt,
          i.studentName,
          i.courseName,
          i.amount,
          i.paymentMethod,
          i.receiptNo || '',
          i.transactionId || '',
        ]);
        exportToCsv(`RK_Financial_Payments_Report_${dateLabel}_${todayStr}`, headers, rows, `वित्तीय भुगतान रिपोर्ट (${activeDateRange.label})`);
      } else if (section === 'students') {
        const headers = ['UID', 'नाम', 'Email', 'फ़ोन', 'कक्षा', 'बोर्ड', 'नामांकित कोर्सेज', 'स्थिति', 'पंजीकरण तिथि'];
        const rows = filteredStudents.map((s) => [
          s.uid,
          s.displayName,
          s.email,
          s.phoneNumber || '',
          s.classLevel || '',
          s.board || '',
          (s.enrolledCourseIds || []).length,
          s.status,
          s.createdAt,
        ]);
        exportToCsv(`RK_Students_Report_${dateLabel}_${todayStr}`, headers, rows, `छात्र रिपोर्ट (${activeDateRange.label})`);
      } else if (section === 'academics') {
        const headers = ['विषय', 'कक्षा', 'विद्यार्थी नाम', 'प्राप्तांक', 'पूर्णांक', 'प्रतिशत (%)', 'ग्रेड', 'स्थिति'];
        const rows = filteredResults.map((r) => [
          r.subjectName || '',
          r.classLevel || '',
          r.studentName || '',
          r.marksObtained ?? '-',
          r.maxMarks,
          r.percentage,
          r.grade,
          r.passFail === 'pass' ? 'उत्तीर्ण (PASS)' : 'अनुत्तीर्ण (FAIL)',
        ]);
        exportToCsv(`RK_Academic_Results_${dateLabel}_${todayStr}`, headers, rows, `परीक्षा परिणाम रिपोर्ट (${activeDateRange.label})`);
      } else if (section === 'inquiries') {
        const headers = ['ID', 'प्रेषक नाम', 'फ़ोन', 'Email', 'विषय', 'संदेश', 'श्रेणी', 'प्राथमिकता', 'स्थिति', 'तारीख'];
        const rows = filteredInquiries.map((inq) => [
          inq.id,
          inq.name,
          inq.phone,
          inq.email || '',
          inq.subject || '',
          inq.message,
          inq.inquiryType,
          inq.priority,
          inq.status,
          inq.createdAt,
        ]);
        exportToCsv(`RK_Inquiries_Report_${dateLabel}_${todayStr}`, headers, rows, `पूछताछ व संदेश रिपोर्ट (${activeDateRange.label})`);
      } else {
        // Overview Summary Export
        const headers = ['मेट्रिक नाम', 'अवधि मान (Selected Period)', 'कुल मान (Overall Total)'];
        const rows = [
          ['कुल छात्र (Total Students)', filteredStudents.length, studentMetrics.total],
          ['सक्रिय छात्र (Active Students)', '-', studentMetrics.active],
          ['उपस्थिति प्रतिशत (Attendance %)', `${attendanceMetrics.attendancePercentage}%`, `${attendanceMetrics.attendancePercentage}%`],
          ['कुल उपस्थिति रिकॉर्ड', attendanceMetrics.totalMarked, attendanceMetrics.totalMarked],
          ['कुल फीस वसूली (Fees Paid)', `₹${feeMetrics.totalPaid.toLocaleString('en-IN')}`, `₹${feeMetrics.totalPaid.toLocaleString('en-IN')}`],
          ['कुल फीस बकाया (Fees Due)', `₹${feeMetrics.totalDue.toLocaleString('en-IN')}`, `₹${feeMetrics.totalDue.toLocaleString('en-IN')}`],
          ['परीक्षाएं (Exams)', resultMetrics.totalExams, (data?.exams || []).length],
          ['औसत परिणाम (Avg Result %)', `${resultMetrics.averagePercentage}%`, `${resultMetrics.averagePercentage}%`],
          ['पूछताछ (Inquiries)', inquiryMetrics.total, (data?.inquiries || []).length],
        ];
        exportToCsv(`RK_Executive_Overview_${dateLabel}_${todayStr}`, headers, rows, `संस्थान मुख्य रिपोर्ट सारांश (${activeDateRange.label})`);
      }
    } catch (e) {
      console.warn('[OwnerReportsManager] Export error:', e);
    } finally {
      setIsExporting(false);
    }
  };

  // Sub-navigation tabs
  const subNavItems: { id: ReportSubTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'ओवरव्यू व KPI', icon: TrendingUp },
    { id: 'attendance', label: 'उपस्थिति रिपोर्ट', icon: UserCheck },
    { id: 'fees', label: 'वित्तीय व फीस', icon: CreditCard },
    { id: 'academics', label: 'परीक्षा व परिणाम', icon: FileSpreadsheet },
    { id: 'students', label: 'छात्र विश्लेषण', icon: Users },
    { id: 'courses', label: 'कोर्सेज व बैच', icon: BookOpen },
    { id: 'teachers', label: 'संकाय शिक्षक', icon: GraduationCap },
    { id: 'inquiries', label: 'पूछताछ व संदेश', icon: MessageSquare },
    { id: 'content', label: 'सामग्री व नोटिस', icon: Bell },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & GLOBAL CONTROLS                                           */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Executive Institutional Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              संस्थान रिपोर्ट्स व एनालिटिक्स (Reports)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              वास्तविक पर्सिस्टेड डेटा से प्रमाणित उपस्थिति, वित्तीय वसूली, परीक्षा परिणाम और नामांकन रिपोर्ट
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
              <span>रिफ्रेश</span>
            </button>

            <button
              onClick={() => handleExportCsv(activeSubTab)}
              disabled={isExporting || isLoading}
              className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'एक्सपोर्ट हो रहा है...' : 'CSV एक्सपोर्ट'}</span>
            </button>
          </div>
        </div>

        {/* Global Date Range Selector */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span>अवधि फ़िल्टर (Global Date Range):</span>
              <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold">
                {activeDateRange.label}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-semibold">
              * मॉड्यूल-विशिष्ट टाइमस्टैम्प फ़ील्ड पर लागू
            </div>
          </div>

          {/* Date Range Presets Buttons */}
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'today', label: 'आज' },
                { id: 'yesterday', label: 'कल' },
                { id: 'last7days', label: '7 दिन' },
                { id: 'last30days', label: '30 दिन' },
                { id: 'thisMonth', label: 'इस महीने' },
                { id: 'lastMonth', label: 'पिछले महीने' },
                { id: 'thisYear', label: 'इस वर्ष' },
                { id: 'allTime', label: 'समस्त अवधि' },
                { id: 'custom', label: 'कस्टम रेंज' },
              ] as { id: DatePreset; label: string }[]
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => handlePresetChange(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                  datePreset === p.id
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs (when 'custom' preset is selected) */}
          {datePreset === 'custom' && (
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-end gap-3 animate-in fade-in duration-150">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">प्रारंभ तिथि (Start Date)</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">अंतिम तिथि (End Date)</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="button"
                onClick={handleCustomDateApply}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer min-h-[38px]"
              >
                लागू करें
              </button>
            </div>
          )}

          {dateRangeError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{dateRangeError}</span>
            </div>
          )}
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-100 pb-2">
          {subNavItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black shrink-0 whitespace-nowrap transition-all cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LOADING / ERROR STATES                                                 */}
      {/* ========================================================================= */}
      {isLoading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-black text-slate-800">
            वास्तविक संस्थान डेटा संकलित किया जा रहा है...
          </div>
          <p className="text-xs text-slate-500">उपस्थिति, वित्तीय व परिणाम गणना जारी है</p>
        </div>
      ) : errorMessage ? (
        <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
          <h3 className="text-lg font-black text-rose-900">डेटा लोड करने में त्रुटि</h3>
          <p className="text-xs sm:text-sm text-rose-700 font-medium">{errorMessage}</p>
          <button
            onClick={loadData}
            className="px-5 py-2.5 bg-rose-700 text-white rounded-xl font-bold text-xs hover:bg-rose-800 transition-colors"
          >
            पुनः प्रयास करें
          </button>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 3. SECTION CONTENT SWITCHER                                               */}
          {/* ========================================================================= */}

          {/* TAB 1: OVERVIEW & KEY KPI CARDS */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              {/* 8 Core KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* 1. Students KPI */}
                <div
                  onClick={() => setActiveSubTab('students')}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                      <Users className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">छात्र</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-slate-900">
                      {studentMetrics.total}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">
                      कुल पंजीकृत छात्र
                    </div>
                    <div className="text-xs text-blue-700 font-semibold mt-1">
                      {studentMetrics.active} सक्रिय • {studentMetrics.newInPeriod} अवधि में नए
                    </div>
                  </div>
                </div>

                {/* 2. Attendance KPI (Task 7 formula) */}
                <div
                  onClick={() => setActiveSubTab('attendance')}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">उपस्थिति</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-slate-900">
                      {attendanceMetrics.attendancePercentage}%
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">
                      औसत उपस्थिति दर
                    </div>
                    <div className="text-xs text-emerald-700 font-semibold mt-1">
                      {attendanceMetrics.present + attendanceMetrics.late} उपस्थित • {attendanceMetrics.absent} अनुपस्थित
                    </div>
                  </div>
                </div>

                {/* 3. Fees Collected KPI */}
                <div
                  onClick={() => setActiveSubTab('fees')}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">वित्तीय</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-slate-900">
                      ₹{feeMetrics.totalPaid.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">
                      कुल फीस वसूली
                    </div>
                    <div className="text-xs text-amber-700 font-semibold mt-1">
                      ₹{feeMetrics.totalDue.toLocaleString('en-IN')} कुल शेष बकाया
                    </div>
                  </div>
                </div>

                {/* 4. Results & Academic KPI */}
                <div
                  onClick={() => setActiveSubTab('academics')}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">परीक्षा</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-slate-900">
                      {resultMetrics.averagePercentage}%
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">
                      औसत परीक्षा स्कोर
                    </div>
                    <div className="text-xs text-indigo-700 font-semibold mt-1">
                      {resultMetrics.passPercentage}% उत्तीर्ण दर • {resultMetrics.appeared} छात्र उपस्थित
                    </div>
                  </div>
                </div>

                {/* 5. Courses & Batches KPI */}
                <div
                  onClick={() => setActiveSubTab('courses')}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">पाठ्यक्रम</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-slate-900">
                      {(data?.courses || []).length}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">
                      संस्थान कोर्सेज
                    </div>
                    <div className="text-xs text-purple-700 font-semibold mt-1">
                      {(data?.courses || []).filter((c) => c.enrollmentOpen !== false).length} में प्रवेश सक्रिय
                    </div>
                  </div>
                </div>

                {/* 6. Teachers KPI */}
                <div
                  onClick={() => setActiveSubTab('teachers')}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 group-hover:scale-105 transition-transform">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">संकाय</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-slate-900">
                      {(data?.teachers || []).length}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">
                      संकाय शिक्षक
                    </div>
                    <div className="text-xs text-teal-700 font-semibold mt-1">
                      {(data?.teachers || []).filter((t) => t.status === 'active').length} सक्रिय शिक्षक
                    </div>
                  </div>
                </div>

                {/* 7. Inquiries KPI */}
                <div
                  onClick={() => setActiveSubTab('inquiries')}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">पूछताछ</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-slate-900">
                      {inquiryMetrics.total}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">
                      कुल पूछताछ संदेश
                    </div>
                    <div className="text-xs text-blue-700 font-semibold mt-1">
                      {inquiryMetrics.newCount} नई / लंबित • {inquiryMetrics.urgent} तत्काल
                    </div>
                  </div>
                </div>

                {/* 8. Content & Notices KPI */}
                <div
                  onClick={() => setActiveSubTab('content')}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100 group-hover:scale-105 transition-transform">
                      <Bell className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">सामग्री</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-slate-900">
                      {(data?.materials || []).length + (data?.pyqItems || []).length}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">
                      अध्ययन सामग्री व PYQ
                    </div>
                    <div className="text-xs text-rose-700 font-semibold mt-1">
                      {(data?.notices || []).length} संस्थान परिपत्र व सूचनाएं
                    </div>
                  </div>
                </div>
              </div>

              {/* Overview Visual Summaries */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visual Track 1: Financial Health Progress */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span>फीस वसूली स्थिति (Financial Collection)</span>
                    </h3>
                    <span className="text-xs font-bold text-blue-700">
                      {feeMetrics.collectionPercentage}% वसूली
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${feeMetrics.collectionPercentage}%` }}
                      className="bg-emerald-500 h-full transition-all duration-500"
                    />
                    <div
                      style={{ width: `${100 - feeMetrics.collectionPercentage}%` }}
                      className="bg-amber-400 h-full transition-all duration-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                      <div className="font-semibold text-emerald-700">प्राप्त राशि (Paid)</div>
                      <div className="text-lg font-black mt-0.5">₹{feeMetrics.totalPaid.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900">
                      <div className="font-semibold text-amber-700">शेष बकाया (Due)</div>
                      <div className="text-lg font-black mt-0.5">₹{feeMetrics.totalDue.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                </div>

                {/* Visual Track 2: Attendance Distribution */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>उपस्थिति वितरण (Attendance Breakdown)</span>
                    </h3>
                    <span className="text-xs font-bold text-emerald-700">
                      {attendanceMetrics.totalMarked} कुल दर्ज रिकॉर्ड
                    </span>
                  </div>

                  {attendanceMetrics.totalMarked === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 font-bold bg-slate-50 rounded-2xl">
                      इस अवधि में कोई उपस्थिति रिकॉर्ड नहीं है।
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
                        <div
                          style={{
                            width: `${(attendanceMetrics.present / attendanceMetrics.totalMarked) * 100}%`,
                          }}
                          className="bg-emerald-500 h-full"
                          title="Present"
                        />
                        <div
                          style={{
                            width: `${(attendanceMetrics.late / attendanceMetrics.totalMarked) * 100}%`,
                          }}
                          className="bg-amber-400 h-full"
                          title="Late"
                        />
                        <div
                          style={{
                            width: `${(attendanceMetrics.absent / attendanceMetrics.totalMarked) * 100}%`,
                          }}
                          className="bg-rose-500 h-full"
                          title="Absent"
                        />
                        <div
                          style={{
                            width: `${(attendanceMetrics.leave / attendanceMetrics.totalMarked) * 100}%`,
                          }}
                          className="bg-blue-400 h-full"
                          title="Leave"
                        />
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold">
                          <div>{attendanceMetrics.present}</div>
                          <div className="text-[10px] text-emerald-600 font-semibold">उपस्थित</div>
                        </div>
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-800 font-bold">
                          <div>{attendanceMetrics.late}</div>
                          <div className="text-[10px] text-amber-600 font-semibold">विलंब</div>
                        </div>
                        <div className="p-2 rounded-xl bg-rose-50 text-rose-800 font-bold">
                          <div>{attendanceMetrics.absent}</div>
                          <div className="text-[10px] text-rose-600 font-semibold">अनुपस्थित</div>
                        </div>
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-800 font-bold">
                          <div>{attendanceMetrics.leave}</div>
                          <div className="text-[10px] text-blue-600 font-semibold">अवकाश</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE DETAILED REPORT */}
          {activeSubTab === 'attendance' && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    उपस्थिति विस्तृत रिपोर्ट (Attendance Records)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    सूत्र: (उपस्थित + विलंब) ÷ कुल दर्ज उपस्थिति × 100 • अवधि: {activeDateRange.label}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-black text-xs border border-emerald-200">
                    दर: {attendanceMetrics.attendancePercentage}%
                  </span>
                </div>
              </div>

              {filteredAttendance.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-bold text-sm bg-slate-50 rounded-2xl">
                  चयनित अवधि ({activeDateRange.label}) में कोई उपस्थिति डेटा उपलब्ध नहीं है।
                </div>
              ) : (
                <div className="overflow-x-auto no-scrollbar rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                    <thead className="bg-slate-50 text-slate-900 font-black border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">तारीख (Date)</th>
                        <th className="py-3 px-4">विद्यार्थी का नाम</th>
                        <th className="py-3 px-4">कक्षा</th>
                        <th className="py-3 px-4">कोर्स / बैच</th>
                        <th className="py-3 px-4">स्थिति</th>
                        <th className="py-3 px-4">टिप्पणी</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAttendance.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">{a.date}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{a.studentName}</td>
                          <td className="py-3 px-4 font-semibold text-slate-600">{a.classLevel || 'सामान्य'}</td>
                          <td className="py-3 px-4 text-slate-600">{a.courseName || '-'}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                a.status === 'present'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : a.status === 'late'
                                  ? 'bg-amber-100 text-amber-800'
                                  : a.status === 'absent'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {a.status === 'present'
                                ? 'उपस्थित'
                                : a.status === 'late'
                                ? 'विलंब'
                                : a.status === 'absent'
                                ? 'अनुपस्थित'
                                : 'अवकाश'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-xs">{a.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FEES & FINANCIAL DETAILED REPORT */}
          {activeSubTab === 'fees' && (
            <div className="space-y-6">
              {/* Financial Quick Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-bold">कुल अपेक्षित फीस</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    ₹{feeMetrics.totalAssessed.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-emerald-700 font-bold">कुल प्राप्त राशि</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">
                    ₹{feeMetrics.totalPaid.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-amber-700 font-bold">कुल बकाया राशि</div>
                  <div className="text-2xl font-black text-amber-700 mt-1">
                    ₹{feeMetrics.totalDue.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-blue-700 font-bold">वसूली दर</div>
                  <div className="text-2xl font-black text-blue-700 mt-1">
                    {feeMetrics.collectionPercentage}%
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-black text-slate-900">
                    भुगतान किश्तें व रसीदें (Payment Transactions)
                  </h3>
                  <span className="text-xs text-slate-500 font-bold">
                    {filteredInstallments.length} ट्रांजैक्शन
                  </span>
                </div>

                {filteredInstallments.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-bold text-sm bg-slate-50 rounded-2xl">
                    चयनित अवधि में कोई भुगतान लेन-देन दर्ज नहीं है।
                  </div>
                ) : (
                  <div className="overflow-x-auto no-scrollbar rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                      <thead className="bg-slate-50 text-slate-900 font-black border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">तारीख (Date)</th>
                          <th className="py-3 px-4">विद्यार्थी का नाम</th>
                          <th className="py-3 px-4">कोर्स / बैच</th>
                          <th className="py-3 px-4">राशि (Amount)</th>
                          <th className="py-3 px-4">माध्यम</th>
                          <th className="py-3 px-4">रसीद सं.</th>
                          <th className="py-3 px-4">ट्रांजैक्शन ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredInstallments.map((inst) => (
                          <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900">
                              {inst.paymentDate || toLocalDateString(inst.createdAt)}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900">{inst.studentName}</td>
                            <td className="py-3 px-4 text-slate-600">{inst.courseName}</td>
                            <td className="py-3 px-4 font-black text-emerald-700">
                              ₹{inst.amount.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-4 capitalize font-semibold text-slate-700">
                              {inst.isOnlineVerified ? 'ऑनलाइन (सत्यापित)' : inst.paymentMethod}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-800 text-xs">
                              {inst.receiptNo || '-'}
                            </td>
                            <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                              {inst.transactionId || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ACADEMICS & EXAM RESULTS */}
          {activeSubTab === 'academics' && (
            <div className="space-y-6">
              {/* Grade Distribution Display */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      ग्रेड वितरण (Grade Distribution)
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      मानक: A+ (≥90%), A (≥75%), B+ (≥60%), B (≥45%), C (≥33%), D (&lt;33%), F (अनुत्तीर्ण)
                    </p>
                  </div>
                  <div className="text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
                    औसत: {resultMetrics.averagePercentage}%
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 pt-2">
                  {Object.entries(resultMetrics.grades).map(([grade, count]) => (
                    <div
                      key={grade}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1"
                    >
                      <div className="text-xs font-black text-slate-500">ग्रेड {grade}</div>
                      <div className="text-2xl font-black text-slate-900">{count}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">विद्यार्थी</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Results Scorecard Table */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-black text-slate-900">
                    अंकतालिका विवरण (Exam Results Ledger)
                  </h3>
                  <span className="text-xs text-slate-500 font-bold">
                    {filteredResults.length} परिणाम दर्ज
                  </span>
                </div>

                {filteredResults.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-bold text-sm bg-slate-50 rounded-2xl">
                    चयनित अवधि में कोई परीक्षा परिणाम उपलब्ध नहीं है।
                  </div>
                ) : (
                  <div className="overflow-x-auto no-scrollbar rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                      <thead className="bg-slate-50 text-slate-900 font-black border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">विषय</th>
                          <th className="py-3 px-4">कक्षा</th>
                          <th className="py-3 px-4">विद्यार्थी का नाम</th>
                          <th className="py-3 px-4">प्राप्तांक / पूर्णांक</th>
                          <th className="py-3 px-4">प्रतिशत (%)</th>
                          <th className="py-3 px-4">ग्रेड</th>
                          <th className="py-3 px-4">स्थिति</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredResults.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900">{r.subjectName}</td>
                            <td className="py-3 px-4 font-semibold text-slate-600">{r.classLevel || 'सामान्य'}</td>
                            <td className="py-3 px-4 font-bold text-slate-900">{r.studentName}</td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-800">
                              {r.marksObtained ?? '-'} / {r.maxMarks}
                            </td>
                            <td className="py-3 px-4 font-black text-indigo-700">
                              {r.percentage}%
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-black text-xs">
                                {r.grade}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                                  r.passFail === 'pass'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {r.passFail === 'pass' ? 'उत्तीर्ण' : 'अनुत्तीर्ण'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: STUDENTS ANALYTICS */}
          {activeSubTab === 'students' && (
            <div className="space-y-6">
              {/* Class Breakdown Grid */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                  कक्षावार छात्र वितरण (Class-wise Students)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(studentMetrics.byClass).map(([cls, count]) => (
                    <div key={cls} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-xs font-bold text-slate-500">{cls}</div>
                      <div className="text-2xl font-black text-blue-700 mt-1">{count}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">छात्र</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Students Ledger Table */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-black text-slate-900">
                    छात्र पंजी (Registered Students Ledger)
                  </h3>
                  <span className="text-xs text-slate-500 font-bold">
                    {filteredStudents.length} छात्र
                  </span>
                </div>

                {filteredStudents.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-bold text-sm bg-slate-50 rounded-2xl">
                    चयनित अवधि में कोई छात्र पंजीकरण नहीं हुआ है।
                  </div>
                ) : (
                  <div className="overflow-x-auto no-scrollbar rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                      <thead className="bg-slate-50 text-slate-900 font-black border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">नाम</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">फ़ोन</th>
                          <th className="py-3 px-4">कक्षा</th>
                          <th className="py-3 px-4">बोर्ड</th>
                          <th className="py-3 px-4">स्थिति</th>
                          <th className="py-3 px-4">पंजीकरण तिथि</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStudents.map((s) => (
                          <tr key={s.uid} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900">{s.displayName}</td>
                            <td className="py-3 px-4 text-slate-600">{s.email}</td>
                            <td className="py-3 px-4 text-slate-600">{s.phoneNumber || '-'}</td>
                            <td className="py-3 px-4 font-semibold text-slate-700">
                              {s.classLevel ? s.classLevel.replace('class-', 'कक्षा ') : 'सामान्य'}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-700">{s.board || 'BSEB'}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                                  s.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {s.status === 'active' ? 'सक्रिय' : 'अक्रिय'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-xs">
                              {toLocalDateString(s.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: COURSES & BATCHES ANALYTICS */}
          {activeSubTab === 'courses' && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900">
                  कोर्सेज व बैच रिपोर्ट (Courses & Target Batches)
                </h3>
                <span className="text-xs text-slate-500 font-bold">
                  {(data?.courses || []).length} कोर्सेज
                </span>
              </div>

              {(data?.courses || []).length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-bold text-sm bg-slate-50 rounded-2xl">
                  कोई कोर्स उपलब्ध नहीं है।
                </div>
              ) : (
                <div className="overflow-x-auto no-scrollbar rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                    <thead className="bg-slate-50 text-slate-900 font-black border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">कोर्स शीर्षक</th>
                        <th className="py-3 px-4">बैच नाम</th>
                        <th className="py-3 px-4">लक्षित कक्षा</th>
                        <th className="py-3 px-4">शुल्क (Fee)</th>
                        <th className="py-3 px-4">नामांकन स्थिति</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data?.courses || []).map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">{c.title}</td>
                          <td className="py-3 px-4 font-semibold text-slate-700">{c.batchName || 'लक्ष्य बैच'}</td>
                          <td className="py-3 px-4 text-slate-600">{c.classLevel || 'कक्षा 10वीं'}</td>
                          <td className="py-3 px-4 font-black text-emerald-700">₹{c.discountedPrice || c.price || 0}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                                c.enrollmentOpen !== false
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {c.enrollmentOpen !== false ? 'नामांकन खुला है' : 'बंद'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: TEACHERS ANALYTICS */}
          {activeSubTab === 'teachers' && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900">
                  संकाय शिक्षक रिपोर्ट (Faculty Directory)
                </h3>
                <span className="text-xs text-slate-500 font-bold">
                  {(data?.teachers || []).length} शिक्षक
                </span>
              </div>

              {(data?.teachers || []).length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-bold text-sm bg-slate-50 rounded-2xl">
                  कोई शिक्षक रिकॉर्ड दर्ज नहीं है।
                </div>
              ) : (
                <div className="overflow-x-auto no-scrollbar rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                    <thead className="bg-slate-50 text-slate-900 font-black border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">शिक्षक का नाम</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">फ़ोन</th>
                        <th className="py-3 px-4">अध्यापन विषय</th>
                        <th className="py-3 px-4">स्थिति</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data?.teachers || []).map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">{t.name}</td>
                          <td className="py-3 px-4 text-slate-600">{t.email}</td>
                          <td className="py-3 px-4 text-slate-600">{t.phone || '-'}</td>
                          <td className="py-3 px-4 text-slate-700 font-semibold">
                            {(t.subjectNames || []).join(', ') || 'सामान्य'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                                t.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {t.status === 'active' ? 'सक्रिय' : 'अक्रिय'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: INQUIRIES ANALYTICS */}
          {activeSubTab === 'inquiries' && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900">
                  पूछताछ व संदेश रिपोर्ट (Inquiries & Messages)
                </h3>
                <span className="text-xs text-slate-500 font-bold">
                  {filteredInquiries.length} संदेश दर्ज
                </span>
              </div>

              {filteredInquiries.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-bold text-sm bg-slate-50 rounded-2xl">
                  चयनित अवधि में कोई पूछताछ संदेश प्राप्त नहीं हुआ है।
                </div>
              ) : (
                <div className="overflow-x-auto no-scrollbar rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                    <thead className="bg-slate-50 text-slate-900 font-black border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">प्रेषक नाम</th>
                        <th className="py-3 px-4">फ़ोन</th>
                        <th className="py-3 px-4">विषय</th>
                        <th className="py-3 px-4">श्रेणी</th>
                        <th className="py-3 px-4">प्राथमिकता</th>
                        <th className="py-3 px-4">स्थिति</th>
                        <th className="py-3 px-4">तारीख</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredInquiries.map((inq) => (
                        <tr key={inq.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">{inq.name}</td>
                          <td className="py-3 px-4 text-slate-600">{inq.phone}</td>
                          <td className="py-3 px-4 text-slate-800 font-semibold">{inq.subject || '-'}</td>
                          <td className="py-3 px-4 capitalize text-slate-600">{inq.inquiryType}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                                inq.priority === 'Urgent'
                                  ? 'bg-rose-100 text-rose-800'
                                  : inq.priority === 'Important'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {inq.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                                inq.status === 'New'
                                  ? 'bg-blue-100 text-blue-800'
                                  : inq.status === 'Resolved' || inq.status === 'Replied'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {inq.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-xs">
                            {toLocalDateString(inq.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: CONTENT & NOTICES */}
          {activeSubTab === 'content' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Study Materials Summary */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                  अध्ययन सामग्री सारांश (Study Materials & Notes)
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs font-bold text-slate-700">
                    <span>कुल नोट्स व अध्ययन सामग्री</span>
                    <span className="text-blue-700 font-black">{(data?.materials || []).length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs font-bold text-slate-700">
                    <span>प्रश्न बैंक, मॉडल पेपर्स व PYQ</span>
                    <span className="text-purple-700 font-black">{(data?.pyqItems || []).length}</span>
                  </div>
                </div>
              </div>

              {/* Institutional Notices Summary */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                  संस्थान सूचनाएं व परिपत्र (Notices & Circulars)
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs font-bold text-slate-700">
                    <span>कुल सूचनाएं</span>
                    <span className="text-slate-900 font-black">{(data?.notices || []).length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs font-bold text-slate-700">
                    <span>लाइव प्रकाशित सूचनाएं</span>
                    <span className="text-emerald-700 font-black">
                      {(data?.notices || []).filter((n) => n.status === 'published' || n.publishStatus === 'published').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
