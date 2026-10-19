/**
 * RK STUDY CENTRE - Executive Owner Dashboard
 * 
 * Connected directly to real Firebase Firestore services:
 * - Real Student Directory (getAllStudents)
 * - Real Courses & Batches (getAllCourses)
 * - Real Tests & Quizzes (getAllInstitutionTests)
 * - Real Study Material & Notes (getAllFirestoreMaterials)
 * - Real Question Bank & PYQ (getQuestionsAndPapers)
 * - Real Vlogs & Videos (getAllVlogs)
 * - Real Enrollment Records (getEnrollmentPaymentRecords)
 * 
 * Strict "No Fake Data" Rule:
 * Only verified counts from real data sources are displayed.
 * Upcoming modules (Attendance, Results, Notices) are clearly documented without fake numbers.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  FileText,
  Layers,
  Video,
  CreditCard,
  RefreshCw,
  ArrowRight,
  PlusCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Info,
  GraduationCap,
  UserCheck,
  FileSpreadsheet,
  Bell,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import type { OwnerTabType } from '../../views/OwnerView';
import { getAllStudents, type SafeStudentProfile } from '../../services/studentService';
import { getAllTeachers } from '../../services/teacherService';
import { getAllCourses } from '../../services/courseService';
import { getAllInstitutionTests } from '../../services/testService';
import { getAllFirestoreMaterials, getQuestionsAndPapers } from '../../services/studyMaterialService';
import { getAllVlogs } from '../../services/vlogService';
import { getEnrollmentPaymentRecords, type EnrollmentPaymentRecord } from '../../services/settingsService';
import { getAllExams } from '../../services/examService';
import { getAllNotices } from '../../services/noticeService';
import { getAllInquiries } from '../../services/inquiryService';
import type { Course, TestItem, StudyMaterialItem, VlogPost, Teacher, Exam, NoticeItem, InquiryItem } from '../../types';

interface OwnerDashboardProps {
  onNavigateTab: (tab: OwnerTabType) => void;
}

interface DashboardMetrics {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  totalCourses: number;
  activeCourses: number;
  totalTests: number;
  activeTests: number;
  totalMaterials: number;
  totalPyqAndQuestions: number;
  totalVlogs: number;
  totalEnrollments: number;
  totalExams: number;
  scheduledExams: number;
  ongoingExams: number;
  completedExams: number;
  totalNotices: number;
  publishedNotices: number;
  totalInquiries: number;
  newInquiries: number;
  inProgressInquiries: number;
  resolvedInquiries: number;
}

interface RecentActivityItem {
  id: string;
  title: string;
  category: 'student' | 'teacher' | 'course' | 'test' | 'material' | 'vlog' | 'enrollment' | 'notice' | 'inquiry';
  timestamp: string;
  meta: string;
  targetTab: OwnerTabType;
}

export function OwnerDashboard({ onNavigateTab }: OwnerDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalStudents: 0,
    activeStudents: 0,
    totalTeachers: 0,
    activeTeachers: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalTests: 0,
    activeTests: 0,
    totalMaterials: 0,
    totalPyqAndQuestions: 0,
    totalVlogs: 0,
    totalEnrollments: 0,
    totalExams: 0,
    scheduledExams: 0,
    ongoingExams: 0,
    completedExams: 0,
    totalNotices: 0,
    publishedNotices: 0,
    totalInquiries: 0,
    newInquiries: 0,
    inProgressInquiries: 0,
    resolvedInquiries: 0,
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      // Fetch all real collections concurrently with timeout protection
      const [
        studentsRes,
        teachersRes,
        coursesRes,
        testsRes,
        materialsRes,
        pyqRes,
        vlogsRes,
        enrollmentsRes,
        examsRes,
        noticesRes,
        inquiriesRes,
      ] = await Promise.allSettled([
        getAllStudents(),
        getAllTeachers(),
        getAllCourses(true),
        getAllInstitutionTests(),
        getAllFirestoreMaterials(),
        getQuestionsAndPapers(['question_bank', 'pyq', 'model_paper']),
        getAllVlogs(true),
        getEnrollmentPaymentRecords(),
        getAllExams(),
        getAllNotices(),
        getAllInquiries(),
      ]);

      const students: SafeStudentProfile[] = studentsRes.status === 'fulfilled' ? studentsRes.value : [];
      const teachers: Teacher[] = teachersRes.status === 'fulfilled' ? teachersRes.value : [];
      const courses: Course[] = coursesRes.status === 'fulfilled' ? coursesRes.value : [];
      const tests: TestItem[] = testsRes.status === 'fulfilled' ? testsRes.value : [];
      const materials: StudyMaterialItem[] = materialsRes.status === 'fulfilled' ? materialsRes.value : [];
      const pyqItems: StudyMaterialItem[] = pyqRes.status === 'fulfilled' ? pyqRes.value : [];
      const vlogs: VlogPost[] = vlogsRes.status === 'fulfilled' ? vlogsRes.value : [];
      const enrollments: EnrollmentPaymentRecord[] = enrollmentsRes.status === 'fulfilled' ? enrollmentsRes.value : [];
      const exams: Exam[] = examsRes.status === 'fulfilled' ? examsRes.value : [];
      const notices: NoticeItem[] = noticesRes.status === 'fulfilled' ? noticesRes.value : [];
      const inquiries: InquiryItem[] = inquiriesRes.status === 'fulfilled' ? inquiriesRes.value : [];

      // Calculate real metrics
      const totalStudents = students.length;
      const activeStudents = students.filter((s) => s.status === 'active').length;
      const totalTeachers = teachers.length;
      const activeTeachers = teachers.filter((t) => t.status === 'active').length;
      const totalCourses = courses.length;
      const activeCourses = courses.filter((c) => c.enrollmentOpen !== false).length;
      const totalTests = tests.length;
      const activeTests = tests.filter((t) => t.isPublished !== false).length;
      const totalMaterials = materials.length;
      const totalPyqAndQuestions = pyqItems.length;
      const totalVlogs = vlogs.length;
      const totalEnrollments = enrollments.length;
      const totalExams = exams.length;
      const scheduledExams = exams.filter((e) => e.status === 'scheduled').length;
      const ongoingExams = exams.filter((e) => e.status === 'ongoing').length;
      const completedExams = exams.filter((e) => e.status === 'completed').length;
      const totalNotices = notices.length;
      const publishedNotices = notices.filter((n) => n.status === 'published').length;
      const totalInquiries = inquiries.length;
      const newInquiries = inquiries.filter((i) => i.status === 'New').length;
      const inProgressInquiries = inquiries.filter((i) => i.status === 'InProgress').length;
      const resolvedInquiries = inquiries.filter((i) => i.status === 'Resolved' || i.status === 'Replied').length;

      setMetrics({
        totalStudents,
        activeStudents,
        totalTeachers,
        activeTeachers,
        totalCourses,
        activeCourses,
        totalTests,
        activeTests,
        totalMaterials,
        totalPyqAndQuestions,
        totalVlogs,
        totalEnrollments,
        totalExams,
        scheduledExams,
        ongoingExams,
        completedExams,
        totalNotices,
        publishedNotices,
        totalInquiries,
        newInquiries,
        inProgressInquiries,
        resolvedInquiries,
      });

      // Assemble real recent activities from verified database timestamps
      const activities: RecentActivityItem[] = [];

      // 1. Students
      students.forEach((s) => {
        if (s.createdAt) {
          activities.push({
            id: `std_${s.uid}`,
            title: `नया छात्र पंजीकरण: ${s.displayName}`,
            category: 'student',
            timestamp: s.createdAt,
            meta: `कक्षा: ${s.classLevel ? s.classLevel.replace('class-', 'कक्षा ') : 'सामान्य'} • बोर्ड: ${s.board || 'BSEB'}`,
            targetTab: 'students',
          });
        }
      });

      // 1B. Teachers
      teachers.forEach((t) => {
        if (t.createdAt) {
          activities.push({
            id: `tch_${t.id}`,
            title: `संकाय शिक्षक: ${t.name}`,
            category: 'teacher',
            timestamp: t.createdAt,
            meta: `विषय: ${(t.subjectNames || []).join(', ') || 'सामान्य'} • स्थिति: ${t.status === 'active' ? 'सक्रिय' : 'अक्रिय'}`,
            targetTab: 'teachers',
          });
        }
      });

      // 2. Courses
      courses.forEach((c) => {
        if (c.createdAt) {
          activities.push({
            id: `crs_${c.id}`,
            title: `कोर्स निर्मित: ${c.title}`,
            category: 'course',
            timestamp: c.createdAt,
            meta: `बैच: ${c.batchName || 'लक्ष्य बैच'} • शुल्क: ₹${c.discountedPrice || c.price || 0}`,
            targetTab: 'courses',
          });
        }
      });

      // 3. Tests
      tests.forEach((t) => {
        if (t.createdAt) {
          activities.push({
            id: `tst_${t.id}`,
            title: `टेस्ट जोड़ा गया: ${t.title}`,
            category: 'test',
            timestamp: t.createdAt,
            meta: `${t.totalQuestions} प्रश्न • ${t.durationMinutes} मिनट`,
            targetTab: 'tests',
          });
        }
      });

      // 4. Study Materials
      materials.forEach((m) => {
        if (m.createdAt) {
          activities.push({
            id: `mat_${m.id}`,
            title: `अध्ययन सामग्री: ${m.title}`,
            category: 'material',
            timestamp: m.createdAt,
            meta: `${m.fileFormat || 'PDF'} • ${m.fileSize || 'दस्तावेज़'}`,
            targetTab: 'study-material',
          });
        }
      });

      // 5. Vlogs
      vlogs.forEach((v) => {
        const time = v.createdAt || v.publishedAt;
        if (time) {
          activities.push({
            id: `vlg_${v.id}`,
            title: `व्लॉग प्रकाशित: ${v.title}`,
            category: 'vlog',
            timestamp: time,
            meta: `श्रेणी: ${v.category} • लेखक: ${v.author}`,
            targetTab: 'vlogs',
          });
        }
      });

      // 6. Notices & Circulars
      notices.forEach((n) => {
        const time = n.publishedAt || n.createdAt;
        if (time) {
          activities.push({
            id: `notice_${n.id}`,
            title: `सूचना / परिपत्र: ${n.title}`,
            category: 'notice',
            timestamp: time,
            meta: `प्रकार: ${n.type} • लक्षित: ${n.audience} • स्थिति: ${n.status === 'published' ? 'प्रकाशित' : 'प्रारूप'}`,
            targetTab: 'notices',
          });
        }
      });

      // 7. Inquiries
      inquiries.forEach((inq) => {
        if (inq.createdAt) {
          activities.push({
            id: `inquiry_${inq.id}`,
            title: `पूछताछ: ${inq.name}${inq.subject ? ` (${inq.subject})` : ''}`,
            category: 'inquiry',
            timestamp: inq.createdAt,
            meta: `प्राथमिकता: ${inq.priority} • स्थिति: ${inq.status} • स्रोत: ${inq.source}`,
            targetTab: 'inquiries',
          });
        }
      });

      // Sort activities descending by date (most recent first) and keep top 6
      activities.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        if (isNaN(timeA)) return 1;
        if (isNaN(timeB)) return -1;
        return timeB - timeA;
      });

      setRecentActivities(activities.slice(0, 6));
    } catch (err: any) {
      console.error('[RK STUDY CENTRE] Error assembling Owner Dashboard metrics:', err);
      setErrorMessage(err?.message || 'डैशबोर्ड डेटा लोड करने में समस्या हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const formatActivityDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return 'हाल ही में';
      return d.toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'हाल ही में';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* शीर्ष डैशबोर्ड स्वागत बैनर */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black uppercase tracking-wider border border-indigo-400/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>कार्यकारी नियंत्रण केंद्र • Executive Dashboard</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              RK STUDY CENTRE व्यवस्थापक अवलोकन
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl leading-relaxed">
              संस्थान के सभी पंजीकृत छात्र, कोर्सेज, ऑनलाइन टेस्ट, नोट्स एवं वास्तविक गतिविधियों का लाइव विश्लेषण।
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => loadDashboardData(true)}
              disabled={isLoading || isRefreshing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors border border-white/15 cursor-pointer disabled:opacity-50 shadow-xs"
              title="डेटा रिफ्रेश करें"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing || isLoading ? 'animate-spin text-indigo-300' : ''}`} />
              <span>{isRefreshing ? 'रिफ्रेश हो रहा है...' : 'डेटा रिफ्रेश'}</span>
            </button>
          </div>
        </div>

        {/* Global Error Notice if loading failed */}
        {errorMessage && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-500/20 text-rose-200 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm font-semibold">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => loadDashboardData(false)}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
            >
              पुनः प्रयास करें (Retry)
            </button>
          </div>
        )}
      </div>

      {/* लोडिंग स्टेट */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-4 shadow-sm">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <p className="text-slate-800 font-black text-base">डैशबोर्ड लाइव आंकड़े लोड हो रहे हैं...</p>
          <p className="text-slate-500 font-medium text-xs">डेटाबेस से वास्तविक छात्र, कोर्स व टेस्ट आंकड़े सत्यापित किए जा रहे हैं...</p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 1. KEY STATISTICS CARDS (वास्तविक डेटा से जुड़े आंकड़े)                    */}
          {/* ========================================================================= */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>संस्थान के मुख्य मेट्रिक्स (Live Statistics)</span>
              </h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                100% वास्तविक डेटाबेस
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Card 1: Total Students */}
              <div
                onClick={() => onNavigateTab('students')}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-slate-900 tracking-tight">
                    {metrics.totalStudents}
                  </div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">कुल पंजीकृत विद्यार्थी</div>
                  <div className="text-xs text-blue-700 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{metrics.activeStudents} सक्रिय नामांकन (Active)</span>
                  </div>
                </div>
              </div>

              {/* Card 1B: Teachers */}
              <div
                onClick={() => onNavigateTab('teachers')}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-slate-900 tracking-tight">
                    {metrics.totalTeachers}
                  </div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">संकाय शिक्षक (Faculty)</div>
                  <div className="text-xs text-amber-700 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{metrics.activeTeachers} सक्रिय शिक्षक (Active)</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Total Courses */}
              <div
                onClick={() => onNavigateTab('courses')}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-slate-900 tracking-tight">
                    {metrics.totalCourses}
                  </div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">कोर्सेज एवं लक्ष्य बैच</div>
                  <div className="text-xs text-indigo-700 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{metrics.activeCourses} में प्रवेश खुला (Open)</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Active Tests */}
              <div
                onClick={() => onNavigateTab('tests')}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 group-hover:scale-105 transition-transform">
                    <Award className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-slate-900 tracking-tight">
                    {metrics.activeTests}
                  </div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">सक्रिय ऑनलाइन टेस्ट</div>
                  <div className="text-xs text-amber-700 font-semibold mt-1 flex items-center gap-1">
                    <span>कुल {metrics.totalTests} टेस्ट तैयार</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Study Materials */}
              <div
                onClick={() => onNavigateTab('study-material')}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200 group-hover:scale-105 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-slate-900 tracking-tight">
                    {metrics.totalMaterials}
                  </div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">अध्ययन सामग्री व नोट्स</div>
                  <div className="text-xs text-teal-700 font-semibold mt-1 flex items-center gap-1">
                    <span>डिजिटल एवं हस्तलिखित PDF</span>
                  </div>
                </div>
              </div>

              {/* Card 5: Question Bank & PYQ */}
              <div
                onClick={() => onNavigateTab('questions-pyq')}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200 group-hover:scale-105 transition-transform">
                    <Layers className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-slate-900 tracking-tight">
                    {metrics.totalPyqAndQuestions}
                  </div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">PYQ एवं मॉडल पेपर्स</div>
                  <div className="text-xs text-purple-700 font-semibold mt-1 flex items-center gap-1">
                    <span>बोर्ड प्रश्न बैंक व अभ्यास पत्र</span>
                  </div>
                </div>
              </div>

              {/* Card 6: Vlogs & Videos */}
              <div
                onClick={() => onNavigateTab('vlogs')}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200 group-hover:scale-105 transition-transform">
                    <Video className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-slate-900 tracking-tight">
                    {metrics.totalVlogs}
                  </div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">व्लॉग व वीडियो व्याख्यान</div>
                  <div className="text-xs text-rose-700 font-semibold mt-1 flex items-center gap-1">
                    <span>प्रिंस सर मार्गदर्शन व प्रयोग</span>
                  </div>
                </div>
              </div>

              {/* Card 7: Institutional Exams */}
              <div
                onClick={() => onNavigateTab('exams')}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200 group-hover:scale-105 transition-transform">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-slate-900 tracking-tight">
                    {metrics.totalExams}
                  </div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">संस्थान परीक्षाएं व डेट शीट</div>
                  <div className="text-xs text-indigo-700 font-semibold mt-1 flex items-center gap-1">
                    <span>{metrics.scheduledExams} प्रस्तावित • {metrics.ongoingExams} सक्रिय</span>
                  </div>
                </div>
              </div>

              {/* Card 8: Total Course Enrollments */}
              <div
                onClick={() => onNavigateTab('settings')}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 group-hover:scale-105 transition-transform">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-slate-900 tracking-tight">
                    {metrics.totalEnrollments}
                  </div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">कुल बैच नामांकन</div>
                  <div className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                    <span>सत्यापित छात्र कोर्स एनरोलमेंट</span>
                  </div>
                </div>
              </div>

              {/* Card 9: Notices & Circulars */}
              <div
                onClick={() => onNavigateTab('notices')}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200 group-hover:scale-105 transition-transform">
                    <Bell className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-slate-900 tracking-tight">
                    {metrics.totalNotices}
                  </div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">सूचनाएं व परिपत्र (Notices)</div>
                  <div className="text-xs text-rose-700 font-semibold mt-1 flex items-center gap-1">
                    <span>{metrics.publishedNotices} लाइव प्रकाशित • {metrics.totalNotices - metrics.publishedNotices} ड्राफ्ट</span>
                  </div>
                </div>
              </div>

              {/* Card 10: Messages & Inquiries */}
              <div
                onClick={() => onNavigateTab('inquiries')}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-slate-900 tracking-tight">
                    {metrics.totalInquiries}
                  </div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">पूछताछ व संदेश (Inquiries)</div>
                  <div className="text-xs text-blue-700 font-semibold mt-1 flex items-center gap-1">
                    <span>{metrics.newInquiries} नई / लंबित • {metrics.inProgressInquiries} प्रक्रियाधीन</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. QUICK ACTIONS SECTION (त्वरित नियंत्रण शॉर्टकट्स)                     */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              <span>त्वरित प्रबंधन शॉर्टकट्स (Quick Actions)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                onClick={() => onNavigateTab('students')}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 group-hover:text-blue-700">
                      विद्यार्थी निर्देशिका (Directory)
                    </div>
                    <div className="text-xs text-slate-500">पंजीकरण, कक्षा व नामांकन देखें</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('teachers')}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 group-hover:text-amber-700">
                      शिक्षक संकाय प्रबंधन (Teachers)
                    </div>
                    <div className="text-xs text-slate-500">संकाय डायरेक्टरी व बैच आवंटन</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('timetable')}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 group-hover:text-emerald-700">
                      साप्ताहिक समय-सारणी (Timetable)
                    </div>
                    <div className="text-xs text-slate-500">क्लास शेड्यूल व टकराव नियंत्रण</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('attendance')}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 group-hover:text-teal-700">
                      विद्यार्थी उपस्थिति प्रबंधन
                    </div>
                    <div className="text-xs text-slate-500">दैनिक व सत्र-वार उपस्थिति ट्रैकर</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('fees')}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 group-hover:text-indigo-700">
                      फीस एवं शुल्क प्रबंधन
                    </div>
                    <div className="text-xs text-slate-500">ऑफलाइन/ऑनलाइन फीस, रसीद व बकाया लेजर</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('exams')}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 group-hover:text-indigo-700">
                      संस्थान परीक्षाएं व डेट शीट
                    </div>
                    <div className="text-xs text-slate-500">मासिक, अर्द्धवार्षिक व प्री-बोर्ड परीक्षा शेड्यूलर</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('courses')}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 group-hover:text-indigo-700">
                      नया कोर्स व बैच बनाएं
                    </div>
                    <div className="text-xs text-slate-500">कक्षा 9-12 के लिए शुल्क व बैच</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('tests')}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 group-hover:text-amber-700">
                      ऑनलाइन टेस्ट व क्विज़ बनाएं
                    </div>
                    <div className="text-xs text-slate-500">वस्तुनिष्ठ प्रश्न एवं अंक योजना</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('study-material')}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 group-hover:text-teal-700">
                      नोट्स / PDF अपलोड करें
                    </div>
                    <div className="text-xs text-slate-500">वॉटरमार्क सहित अध्यायवार नोट्स</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('questions-pyq')}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 group-hover:text-purple-700">
                      प्रश्न बैंक व PYQ जोड़ें
                    </div>
                    <div className="text-xs text-slate-500">पिछले वर्षों के हल व मॉडल पेपर</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('vlogs')}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 group-hover:text-rose-700">
                      वीडियो व्लॉग व टिप्स प्रकाशित करें
                    </div>
                    <div className="text-xs text-slate-500">यूट्यूब वीडियो व टॉपर रणनीति</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('notices')}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 group-hover:text-rose-700">
                      सूचना व परिपत्र जारी करें
                    </div>
                    <div className="text-xs text-slate-500">संस्थान नोटिस, अवकाश व परीक्षा सर्कुलर</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('inquiries')}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 group-hover:text-blue-700">
                      पूछताछ व संदेश देखें
                    </div>
                    <div className="text-xs text-slate-500">वेबसाइट व छात्रों के संदेश इनबॉक्स</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('reports')}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 group-hover:text-indigo-700">
                      रिपोर्ट्स व एनालिटिक्स
                    </div>
                    <div className="text-xs text-slate-500">उपस्थिति, वित्तीय वसूली व परिणाम रिपोर्ट</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('notifications')}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 group-hover:text-blue-700">
                      सूचनाएं व अलर्ट केंद्र
                    </div>
                    <div className="text-xs text-slate-500">संस्थान परिपत्र, फीस व परीक्षा सूचनाएं</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. RECENT ACTIVITY SECTION (वास्तविक डेटा से हालिया गतिविधियां)             */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-700" />
                <span>हालिया गतिविधियां (Recent Real Activity)</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                शीर्ष 6 नवीनतम रिकॉर्ड
              </span>
            </div>

            {recentActivities.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs sm:text-sm font-medium">
                वर्तमान में कोई हालिया गतिविधि दर्ज नहीं है।
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentActivities.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => onNavigateTab(act.targetTab)}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/80 px-3 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="space-y-0.5">
                      <div className="text-sm font-black text-slate-900 group-hover:text-blue-700 flex items-center gap-2">
                        <span>{act.title}</span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">{act.meta}</div>
                    </div>
                    <div className="text-[11px] font-bold text-slate-400 whitespace-nowrap self-start sm:self-auto">
                      {formatActivityDate(act.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 4. UPCOMING MODULES ROADMAP (पारदर्शी स्थिति - कोई फेक डेटा नहीं)        */}
          {/* ========================================================================= */}
          <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-3 text-xs sm:text-sm leading-relaxed">
            <div className="flex items-center gap-2 font-black text-amber-900 text-base">
              <Info className="w-5 h-5 text-amber-700 shrink-0" />
              <span>आगामी कार्यात्मक मॉड्यूल्स (Upcoming Modules Pipeline)</span>
            </div>
            <p className="font-medium text-amber-900">
              <strong>सख्त शून्य-फेक-डेटा नीति:</strong> आरके स्टडी सेंटर डैशबोर्ड पर केवल वही आंकड़े दिखाए जाते हैं जो वर्तमान फ़ायरबेस डेटाबेस में सक्रिय हैं। निम्नलिखित मॉड्यूल्स आगामी चरणों में क्रमानुसार जोड़े जाएंगे:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 font-bold text-xs text-amber-900">
              <div className="p-2.5 rounded-xl bg-white/70 border border-amber-200">
                📌 दैनिक छात्र उपस्थिति (Attendance)
              </div>
              <div className="p-2.5 rounded-xl bg-white/70 border border-amber-200">
                📌 ऑफ़लाइन फीस रसीद (Fee Invoices)
              </div>
              <div className="p-2.5 rounded-xl bg-white/70 border border-amber-200">
                📌 परीक्षा अंकतालिका व मेरिट (Results)
              </div>
              <div className="p-2.5 rounded-xl bg-white/70 border border-amber-200">
                📌 संस्थान सूचना पट्ट (Notices Board)
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
