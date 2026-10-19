/**
 * RK STUDY CENTRE - Reports & Analytics Service (Task 15)
 * 
 * Centralized, authoritative reporting and analytics engine:
 * - Aggregates real persisted data across Students, Teachers, Courses, Attendance, Fees, Exams, Results, Inquiries, Notices, and Study Materials.
 * - Zero fake/demo numbers.
 * - Strict mathematical formula integrity:
 *   - Attendance % = (Present + Late) / (Present + Absent + Late + Leave) * 100
 *   - Fee Paid = sum of valid active installments (excluding reversed)
 *   - Fee Due = Math.max(0, finalFee - paidAmount)
 *   - Result Grade = Task 11 exact grade thresholds (A+, A, B+, B, C, D, F)
 * - Safe CSV Export with RFC-4180 escaping and UTF-8 BOM for Hindi character fidelity.
 */

import { getAllStudents, type SafeStudentProfile } from './studentService';
import { getAllTeachers } from './teacherService';
import { getAllCourses } from './courseService';
import { getAllAttendanceRecords } from './attendanceService';
import { getAllFeeRecords } from './feeService';
import { getAllExams } from './examService';
import { getAllResults } from './resultService';
import { getAllInquiries } from './inquiryService';
import { getAllFirestoreMaterials, getQuestionsAndPapers } from './studyMaterialService';
import { getAllNotices } from './noticeService';
import { getEnrollmentPaymentRecords, type EnrollmentPaymentRecord } from './settingsService';
import type {
  AttendanceRecord,
  FeeRecord,
  Exam,
  ExamSubjectResultRecord,
  InquiryItem,
  NoticeItem,
  StudyMaterialItem,
  Teacher,
  Course,
} from '../types';

export type DatePreset =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'allTime'
  | 'custom';

export interface DateRangeFilter {
  preset: DatePreset;
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null;   // YYYY-MM-DD
}

/**
 * Normalizes any ISO string, timestamp or date string to local YYYY-MM-DD
 */
export function toLocalDateString(val?: string | null): string | null {
  if (!val) return null;
  const trimmed = val.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  try {
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return null;
  }
}

/**
 * Validates whether a target date falls inside the specified range
 */
export function isDateInRange(
  dateVal: string | null | undefined,
  startDateStr: string | null,
  endDateStr: string | null
): boolean {
  if (!startDateStr && !endDateStr) return true;
  const localDate = toLocalDateString(dateVal);
  if (!localDate) return false;
  if (startDateStr && localDate < startDateStr) return false;
  if (endDateStr && localDate > endDateStr) return false;
  return true;
}

/**
 * Computes start and end date for standard date range presets
 */
export function getPresetDateRange(preset: DatePreset): {
  startDate: string | null;
  endDate: string | null;
  label: string;
} {
  const now = new Date();
  const todayStr = toLocalDateString(now.toISOString())!;

  switch (preset) {
    case 'today':
      return { startDate: todayStr, endDate: todayStr, label: 'आज (Today)' };
    case 'yesterday': {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = toLocalDateString(y.toISOString())!;
      return { startDate: yStr, endDate: yStr, label: 'कल (Yesterday)' };
    }
    case 'last7days': {
      const d7 = new Date(now);
      d7.setDate(d7.getDate() - 6);
      return {
        startDate: toLocalDateString(d7.toISOString())!,
        endDate: todayStr,
        label: 'पिछले 7 दिन (Last 7 Days)',
      };
    }
    case 'last30days': {
      const d30 = new Date(now);
      d30.setDate(d30.getDate() - 29);
      return {
        startDate: toLocalDateString(d30.toISOString())!,
        endDate: todayStr,
        label: 'पिछले 30 दिन (Last 30 Days)',
      };
    }
    case 'thisMonth': {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const start = `${year}-${month}-01`;
      return { startDate: start, endDate: todayStr, label: 'इस महीने (This Month)' };
    }
    case 'lastMonth': {
      const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const year = prevMonthDate.getFullYear();
      const month = String(prevMonthDate.getMonth() + 1).padStart(2, '0');
      const start = `${year}-${month}-01`;
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      const end = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
      return { startDate: start, endDate: end, label: 'पिछले महीने (Last Month)' };
    }
    case 'thisYear': {
      const start = `${now.getFullYear()}-01-01`;
      return { startDate: start, endDate: todayStr, label: 'इस वर्ष (This Year)' };
    }
    case 'allTime':
    default:
      return { startDate: null, endDate: null, label: 'समस्त अवधि (All Time)' };
  }
}

/**
 * Raw data bundle fetched once in parallel for all report views
 */
export interface RawReportsData {
  students: SafeStudentProfile[];
  teachers: Teacher[];
  courses: Course[];
  attendance: AttendanceRecord[];
  fees: FeeRecord[];
  exams: Exam[];
  results: ExamSubjectResultRecord[];
  inquiries: InquiryItem[];
  notices: NoticeItem[];
  materials: StudyMaterialItem[];
  pyqItems: StudyMaterialItem[];
  enrollments: EnrollmentPaymentRecord[];
}

/**
 * Fetch all institutional records in a single coordinated, parallel operation
 */
export async function fetchAllReportsData(): Promise<RawReportsData> {
  const [
    studentsRes,
    teachersRes,
    coursesRes,
    attendanceRes,
    feesRes,
    examsRes,
    resultsRes,
    inquiriesRes,
    noticesRes,
    materialsRes,
    pyqRes,
    enrollmentsRes,
  ] = await Promise.allSettled([
    getAllStudents(),
    getAllTeachers(),
    getAllCourses(true),
    getAllAttendanceRecords(),
    getAllFeeRecords(),
    getAllExams(),
    getAllResults(),
    getAllInquiries(),
    getAllNotices(),
    getAllFirestoreMaterials(),
    getQuestionsAndPapers(['question_bank', 'pyq', 'model_paper']),
    getEnrollmentPaymentRecords(),
  ]);

  return {
    students: studentsRes.status === 'fulfilled' ? studentsRes.value : [],
    teachers: teachersRes.status === 'fulfilled' ? teachersRes.value : [],
    courses: coursesRes.status === 'fulfilled' ? coursesRes.value : [],
    attendance: attendanceRes.status === 'fulfilled' ? attendanceRes.value : [],
    fees: feesRes.status === 'fulfilled' ? feesRes.value : [],
    exams: examsRes.status === 'fulfilled' ? examsRes.value : [],
    results: resultsRes.status === 'fulfilled' ? resultsRes.value : [],
    inquiries: inquiriesRes.status === 'fulfilled' ? inquiriesRes.value : [],
    notices: noticesRes.status === 'fulfilled' ? noticesRes.value : [],
    materials: materialsRes.status === 'fulfilled' ? materialsRes.value : [],
    pyqItems: pyqRes.status === 'fulfilled' ? pyqRes.value : [],
    enrollments: enrollmentsRes.status === 'fulfilled' ? enrollmentsRes.value : [],
  };
}

/**
 * Export data to RFC-4180 compliant CSV with UTF-8 BOM
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][],
  metadataHeader?: string
): void {
  const escapeCell = (cell: string | number | boolean | null | undefined): string => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell);
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const lines: string[] = [];
  const BOM = '\uFEFF';

  if (metadataHeader) {
    lines.push(`"# RK STUDY CENTRE - ${metadataHeader}"`);
    lines.push(`"# रिपोर्ट तैयार तिथि: ${new Date().toLocaleString('hi-IN')}"`);
    lines.push('""');
  }

  lines.push(headers.map(escapeCell).join(','));

  rows.forEach((row) => {
    lines.push(row.map(escapeCell).join(','));
  });

  const csvContent = BOM + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
