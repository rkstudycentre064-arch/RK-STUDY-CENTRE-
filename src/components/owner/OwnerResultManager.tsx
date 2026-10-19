/**
 * RK STUDY CENTRE - Owner Results & Scorecard Management Component (Task 11)
 * 
 * Manages institutional exam results, subject-wise marks entry, bulk entry,
 * aggregate percentages, centralized grading, pass/fail status, publishing workflows,
 * and detailed student scorecards.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Award,
  Search,
  Plus,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Printer,
  Trash2,
  RefreshCw,
  Loader2,
  Check,
  X,
  Filter,
  BookOpen,
  User,
  ShieldCheck,
  Send,
  Unlock,
  ChevronRight,
  Info
} from 'lucide-react';
import type { Exam, ExamSubjectResultRecord, ClassLevel, ResultStatus, PassFailStatus, Course } from '../../types';
import { getAllExams } from '../../services/examService';
import { getAllStudents, type SafeStudentProfile } from '../../services/studentService';
import { getAllCourses } from '../../services/courseService';
import {
  getAllResults,
  saveExamResult,
  bulkSaveExamResults,
  publishExamResults,
  unpublishExamResults,
  deleteExamResult,
  calculateGrade,
  calculatePassFail,
} from '../../services/resultService';
import { CLASSES_METADATA } from '../../lib/constants';

interface OwnerResultManagerProps {
  onNavigateTab?: (tab: string) => void;
}

export function OwnerResultManager({}: OwnerResultManagerProps) {
  // Data states
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<SafeStudentProfile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [results, setResults] = useState<ExamSubjectResultRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Selection & filter states
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterBatch, setFilterBatch] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all'); // all, draft, published
  const [filterPassFail, setFilterPassFail] = useState<string>('all'); // all, pass, fail

  // Modals
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editMarksForm, setEditMarksForm] = useState<Record<string, { marks: string; remarks: string }>>({});
  const [viewingScorecardStudent, setViewingScorecardStudent] = useState<SafeStudentProfile | null>(null);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [showUnpublishModal, setShowUnpublishModal] = useState<boolean>(false);

  // Load initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const [examsData, studentsData, coursesData, resultsData] = await Promise.all([
        getAllExams(),
        getAllStudents(),
        getAllCourses(true),
        getAllResults(),
      ]);
      setExams(examsData);
      setStudents(studentsData);
      setCourses(coursesData);
      setResults(resultsData);

      // Auto-select first active exam if none selected
      if (!selectedExamId && examsData.length > 0) {
        const activeExam = examsData.find((e) => e.status !== 'cancelled') || examsData[0];
        setSelectedExamId(activeExam.id);
      }
    } catch (err: any) {
      console.error('[RK STUDY CENTRE] Error loading results data:', err);
      setFeedback({ type: 'error', message: 'डेटा लोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।' });
    } finally {
      setLoading(false);
    }
  }, [selectedExamId]);

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

  // Currently selected exam object
  const selectedExam = useMemo(() => {
    return exams.find((e) => e.id === selectedExamId) || null;
  }, [exams, selectedExamId]);

  // Applicable students for selected exam (STRICT AND matching on classLevel, courseId, and batchName)
  const applicableStudents = useMemo(() => {
    if (!selectedExam) return students;
    return students.filter((s) => {
      // 1. Class Level constraint: If exam specifies classLevel, student's classLevel MUST match.
      if (selectedExam.classLevel && s.classLevel !== selectedExam.classLevel) {
        return false;
      }

      // 2. Course constraint: If exam specifies a specific Course, student MUST be enrolled in it.
      if (selectedExam.courseId) {
        if (!s.enrolledCourseIds || !s.enrolledCourseIds.includes(selectedExam.courseId)) {
          return false;
        }
      }

      // 3. Batch constraint: If exam specifies a Batch name, student MUST be enrolled in at least one course in that batch.
      if (selectedExam.batchName && selectedExam.batchName.trim() !== '') {
        const targetBatch = selectedExam.batchName.trim().toLowerCase();
        const studentHasMatchingBatch = (s.enrolledCourseIds || []).some(cid => {
          const course = courses.find(c => c.id === cid);
          return course?.batchName?.trim().toLowerCase() === targetBatch;
        });

        if (!studentHasMatchingBatch) {
          return false;
        }
      }

      return true;
    });
  }, [students, selectedExam, courses]);

  // Results map for selected exam (key: studentId_subjectId)
  const examResultsMap = useMemo(() => {
    const map = new Map<string, ExamSubjectResultRecord>();
    results
      .filter((r) => r.examId === selectedExamId)
      .forEach((r) => {
        map.set(`${r.studentId}_${r.subjectId}`, r);
      });
    return map;
  }, [results, selectedExamId]);

  // Exam-wise summary metrics
  const examSummaryMetrics = useMemo(() => {
    if (!selectedExam) return { totalStudents: 0, entered: 0, pending: 0, published: 0, draft: 0, passed: 0, failed: 0, avgPercentage: 0 };
    const totalStudents = applicableStudents.length;
    let entered = 0;
    let pending = 0;
    let publishedCount = 0;
    let draftCount = 0;
    let passCount = 0;
    let failCount = 0;
    let totalPctSum = 0;
    let pctCount = 0;

    applicableStudents.forEach((st) => {
      let studentHasAllMarks = true;
      let studentTotalPct = 0;
      let studentSubjectCount = 0;

      selectedExam.schedule.forEach((sch) => {
        const rec = examResultsMap.get(`${st.uid}_${sch.subjectId}`);
        if (rec && rec.marksObtained !== null && rec.marksObtained !== undefined) {
          entered++;
          studentTotalPct += rec.percentage;
          studentSubjectCount++;
          if (rec.status === 'published') publishedCount++;
          else draftCount++;
          if (rec.passFail === 'pass') passCount++;
          else if (rec.passFail === 'fail') failCount++;
        } else {
          studentHasAllMarks = false;
          pending++;
        }
      });

      if (studentSubjectCount > 0) {
        totalPctSum += studentTotalPct / studentSubjectCount;
        pctCount++;
      }
    });

    const avgPercentage = pctCount > 0 ? Number((totalPctSum / pctCount).toFixed(1)) : 0;

    return {
      totalStudents,
      entered,
      pending,
      published: publishedCount > 0 ? publishedCount : 0,
      draft: draftCount,
      passed: passCount,
      failed: failCount,
      avgPercentage,
    };
  }, [selectedExam, applicableStudents, examResultsMap]);

  // Filtered students for display in results table
  const filteredStudents = useMemo(() => {
    return applicableStudents.filter((st) => {
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const nameMatch = st.displayName?.toLowerCase().includes(q);
        const phoneMatch = st.phoneNumber?.toLowerCase().includes(q);
        const idMatch = st.uid?.toLowerCase().includes(q);
        if (!nameMatch && !phoneMatch && !idMatch) return false;
      }
      // Class Filter
      if (filterClass !== 'all' && st.classLevel !== filterClass) return false;
      // Course Filter
      if (filterCourse !== 'all' && !st.enrolledCourseIds?.includes(filterCourse)) return false;
      // Batch Filter: Checks if student is in the selected batch
      if (filterBatch !== 'all') {
        const targetBatch = filterBatch.trim().toLowerCase();
        const studentHasMatchingBatch = (st.enrolledCourseIds || []).some(cid => {
          const course = courses.find(c => c.id === cid);
          return course?.batchName?.trim().toLowerCase() === targetBatch;
        });
        if (!studentHasMatchingBatch) return false;
      }

      // Subject, Status & PassFail Filters across subjects
      if (filterSubject !== 'all' || filterStatus !== 'all' || filterPassFail !== 'all') {
        let matchesCriteria = false;
        selectedExam?.schedule.forEach((sch) => {
          if (filterSubject !== 'all' && sch.subjectId !== filterSubject) return;
          const rec = examResultsMap.get(`${st.uid}_${sch.subjectId}`);
          if (filterStatus !== 'all' && rec?.status !== filterStatus) return;
          if (filterPassFail !== 'all' && rec?.passFail !== filterPassFail) return;
          matchesCriteria = true;
        });
        if (!matchesCriteria && selectedExam && selectedExam.schedule.length > 0) return false;
      }

      return true;
    });
  }, [applicableStudents, searchTerm, filterClass, filterCourse, filterBatch, filterSubject, filterStatus, filterPassFail, selectedExam, examResultsMap]);

  // Handle opening edit marks for a student
  const handleOpenEditStudent = (student: SafeStudentProfile) => {
    if (selectedExam?.status === 'cancelled') {
      setFeedback({ type: 'error', message: 'रद्द की गई परीक्षा के लिए अंक दर्ज नहीं किए जा सकते।' });
      return;
    }
    setEditingStudentId(student.uid);
    const initialForm: Record<string, { marks: string; remarks: string }> = {};
    selectedExam?.schedule.forEach((sch) => {
      const rec = examResultsMap.get(`${student.uid}_${sch.subjectId}`);
      initialForm[sch.subjectId] = {
        marks: rec && rec.marksObtained !== null && rec.marksObtained !== undefined ? String(rec.marksObtained) : '',
        remarks: rec?.remarks || '',
      };
    });
    setEditMarksForm(initialForm);
  };

  // Save marks for student
  const handleSaveStudentMarks = async (student: SafeStudentProfile) => {
    if (!selectedExam) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const inputs = selectedExam.schedule.map((sch) => {
        const entry = editMarksForm[sch.subjectId];
        const rawMarks = entry?.marks !== undefined ? entry.marks.trim() : '';
        const marksObtained = rawMarks !== '' ? Number(rawMarks) : null;
        if (marksObtained !== null) {
          if (isNaN(marksObtained)) {
            throw new Error(`विषय "${sch.subjectName}" के अंक अमान्य हैं।`);
          }
          if (marksObtained < 0) {
            throw new Error(`विषय "${sch.subjectName}" के अंक 0 से कम नहीं हो सकते।`);
          }
          if (marksObtained > sch.maxMarks) {
            throw new Error(`विषय "${sch.subjectName}" के प्राप्तांक (${marksObtained}) अधिकतम अंक (${sch.maxMarks}) से अधिक नहीं हो सकते।`);
          }
        }

        return {
          examId: selectedExam.id,
          studentId: student.uid,
          studentName: student.displayName,
          studentPhone: student.phoneNumber,
          courseId: selectedExam.courseId,
          batchName: selectedExam.batchName,
          classLevel: selectedExam.classLevel,
          subjectId: sch.subjectId,
          subjectName: sch.subjectName,
          maxMarks: sch.maxMarks,
          passingMarks: sch.passingMarks,
          marksObtained,
          remarks: entry?.remarks || '',
          status: 'draft' as ResultStatus,
        };
      });

      await bulkSaveExamResults(inputs);
      const updatedResults = await getAllResults();
      setResults(updatedResults);
      setEditingStudentId(null);
      setFeedback({ type: 'success', message: `छात्र "${student.displayName}" के अंक सफलतापूर्वक सहेजे गए।` });
    } catch (err: any) {
      console.error('[RK STUDY CENTRE] Error saving student marks:', err);
      setFeedback({ type: 'error', message: err?.message || 'अंक सहेजने में त्रुटि हुई।' });
    } finally {
      setActionLoading(false);
    }
  };

  // Publish exam results handler
  const handleConfirmPublish = async () => {
    if (!selectedExam) return;
    setActionLoading(true);
    try {
      const count = await publishExamResults(selectedExam.id);
      const updated = await getAllResults();
      setResults(updated);
      setShowPublishModal(false);
      setFeedback({ type: 'success', message: `परीक्षा "${selectedExam.title}" के ${count} परिणाम सफलतापूर्वक प्रकाशित (Publish) कर दिए गए।` });
    } catch (err: any) {
      console.error('[RK STUDY CENTRE] Error publishing results:', err);
      setFeedback({ type: 'error', message: 'परिणाम प्रकाशित करने में त्रुटि हुई।' });
    } finally {
      setActionLoading(false);
    }
  };

  // Unpublish exam results handler
  const handleConfirmUnpublish = async () => {
    if (!selectedExam) return;
    setActionLoading(true);
    try {
      const count = await unpublishExamResults(selectedExam.id);
      const updated = await getAllResults();
      setResults(updated);
      setShowUnpublishModal(false);
      setFeedback({ type: 'success', message: `परीक्षा "${selectedExam.title}" के परिणाम पुनः Draft में बदल दिए गए हैं।` });
    } catch (err: any) {
      console.error('[RK STUDY CENTRE] Error unpublishing results:', err);
      setFeedback({ type: 'error', message: 'परिणाम रीओपन करने में त्रुटि हुई।' });
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate Student Aggregate for Scorecard
  const getStudentAggregate = (student: SafeStudentProfile) => {
    if (!selectedExam) return null;
    let totalMax = 0;
    let totalObt = 0;
    let allEntered = true;
    let allPassed = true;
    const subjectsList: any[] = [];

    selectedExam.schedule.forEach((sch) => {
      totalMax += sch.maxMarks;
      const rec = examResultsMap.get(`${student.uid}_${sch.subjectId}`);
      const obt = rec?.marksObtained !== null && rec?.marksObtained !== undefined ? rec.marksObtained : null;
      if (obt === null) allEntered = false;
      else totalObt += obt;

      const pct = obt !== null ? Number(((obt / sch.maxMarks) * 100).toFixed(2)) : 0;
      const pf = calculatePassFail(obt, sch.passingMarks, sch.maxMarks);
      if (pf === 'fail') allPassed = false;
      const grade = calculateGrade(pct, pf === 'pass');

      subjectsList.push({
        ...sch,
        marksObtained: obt,
        percentage: pct,
        grade,
        passFail: pf,
        remarks: rec?.remarks || '',
      });
    });

    const overallPct = totalMax > 0 ? Number(((totalObt / totalMax) * 100).toFixed(2)) : 0;
    const overallPassFail = !allEntered ? 'pending' : allPassed ? 'pass' : 'fail';
    const overallGrade = calculateGrade(overallPct, overallPassFail === 'pass');

    return {
      studentId: student.uid,
      studentName: student.displayName,
      studentPhone: student.phoneNumber,
      classLevel: student.classLevel || selectedExam.classLevel,
      batchName: selectedExam.batchName || selectedExam.courseName,
      subjects: subjectsList,
      totalMaxMarks: totalMax,
      totalObtainedMarks: totalObt,
      overallPercentage: overallPct,
      overallGrade,
      overallPassFail,
      allEntered,
    };
  };

  return (
    <div className="space-y-6">
      {/* शीर्ष शीर्षक (Header) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black">
            <Award className="w-3.5 h-3.5" />
            <span>Task 11 • Results & Scorecard Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            परीक्षा परिणाम एवं स्कोरकार्ड प्रबंधन (Results Portal)
          </h1>
          <p className="text-slate-600 text-sm font-medium">
            कक्षा 9वीं से 12वीं तक की परीक्षाओं के विषयवार अंक प्रविष्टि, प्रतिशत गणना, ग्रेडिंग तथा स्कोरकार्ड प्रबंधन।
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
          <div className="flex items-center gap-3 font-bold text-sm">
            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 rounded-lg hover:bg-black/5 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* परीक्षा चयन अनुभाग (Exam Selection Bar) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              1. परीक्षा चुनें (Select Institutional Exam)
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold text-slate-900 bg-slate-50 focus:bg-white outline-hidden focus:border-emerald-500 cursor-pointer text-sm sm:text-base"
            >
              {exams.length === 0 ? (
                <option value="">कोई परीक्षा उपलब्ध नहीं है (पहले Exams टैब से परीक्षा बनाएं)</option>
              ) : (
                exams.map((ex) => {
                  const classMeta = CLASSES_METADATA.find((c) => c.id === ex.classLevel);
                  return (
                    <option key={ex.id} value={ex.id}>
                      {ex.title} [{classMeta?.hindiName || ex.classLevel}] ({ex.startDate} {ex.status === 'cancelled' ? '• [रद्द]' : ''})
                    </option>
                  );
                })
              )}
            </select>
          </div>

          {selectedExam && (
            <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-6">
              {examSummaryMetrics.published > 0 ? (
                <button
                  onClick={() => setShowUnpublishModal(true)}
                  disabled={actionLoading || selectedExam.status === 'cancelled'}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs sm:text-sm font-black transition-colors border border-amber-200 cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>रीओपन / अनपब्लिश करें</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowPublishModal(true)}
                  disabled={actionLoading || selectedExam.status === 'cancelled' || examSummaryMetrics.entered === 0}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black transition-all shadow-md hover:shadow-emerald-200 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>परिणाम प्रकाशित करें (Publish)</span>
                </button>
              )}
            </div>
          )}
        </div>

        {selectedExam?.status === 'cancelled' && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 text-sm font-bold">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>चेतावनी: यह परीक्षा रद्द (Cancelled) घोषित की जा चुकी है। इस परीक्षा हेतु अंक प्रविष्टि और संपादन अवरुद्ध है।</span>
          </div>
        )}
      </div>

      {/* परीक्षा सारांश मेट्रिक्स (Exam Summary Dashboard Cards) */}
      {selectedExam && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase">कुल छात्र</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{examSummaryMetrics.totalStudents}</div>
            <div className="text-xs text-slate-600 font-semibold">applicable in batch/class</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-xs font-bold text-emerald-600 uppercase">अंक दर्ज किए गए</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">{examSummaryMetrics.entered}</div>
            <div className="text-xs text-emerald-600 font-semibold">{examSummaryMetrics.pending} लंबित</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-xs font-bold text-blue-600 uppercase">उत्तीर्ण / अनुत्तीर्ण</div>
            <div className="text-2xl sm:text-3xl font-black text-blue-700">{examSummaryMetrics.passed} / <span className="text-rose-600">{examSummaryMetrics.failed}</span></div>
            <div className="text-xs text-blue-600 font-semibold">Pass / Fail status</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-xs font-bold text-indigo-600 uppercase">औसत प्रतिशत</div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-700">{examSummaryMetrics.avgPercentage}%</div>
            <div className="text-xs text-indigo-600 font-semibold">Overall average score</div>
          </div>
        </div>
      )}

      {/* खोज एवं फ़िल्टर (Search & Combined Filters Bar) */}
      {selectedExam && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="छात्र के नाम, मोबाइल नंबर या ID से खोजें..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 bg-slate-50 focus:bg-white outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Class Filter */}
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 outline-hidden focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">सभी कक्षाएं (All Classes)</option>
                {CLASSES_METADATA.map((c) => (
                  <option key={c.id} value={c.id}>{c.hindiName}</option>
                ))}
              </select>

              {/* Course Filter */}
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 outline-hidden focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">सभी कोर्सेज (All Courses)</option>
                {courses.map((co) => (
                  <option key={co.id} value={co.id}>{co.title}</option>
                ))}
              </select>

              {/* Batch Filter Dropdown */}
              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 outline-hidden focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">सभी बैच (All Batches)</option>
                {Array.from(new Set(courses.map(c => c.batchName).filter(b => !!b))).map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              {/* Subject Filter */}
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 outline-hidden focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">सभी विषय (All Subjects)</option>
                {selectedExam.schedule.map((sch) => (
                  <option key={sch.subjectId} value={sch.subjectId}>{sch.subjectName}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 outline-hidden focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">स्थिति: सभी (All Status)</option>
                <option value="draft">प्रारूप (Draft)</option>
                <option value="published">प्रकाशित (Published)</option>
              </select>

              {/* Pass/Fail Filter */}
              <select
                value={filterPassFail}
                onChange={(e) => setFilterPassFail(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 outline-hidden focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">परिणाम: सभी (All Pass/Fail)</option>
                <option value="pass">उत्तीर्ण (Pass)</option>
                <option value="fail">अनुत्तीर्ण (Fail)</option>
              </select>

              {(searchTerm || filterClass !== 'all' || filterCourse !== 'all' || filterBatch !== 'all' || filterSubject !== 'all' || filterStatus !== 'all' || filterPassFail !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterClass('all');
                    setFilterCourse('all');
                    setFilterBatch('all');
                    setFilterSubject('all');
                    setFilterStatus('all');
                    setFilterPassFail('all');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* मुख्य परिणाम तालिका (Results Table & Marks Entry) */}
      {loading ? (
        <div className="py-20 bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
          <p className="text-slate-600 font-bold text-sm">परिणाम लोड हो रहे हैं...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="py-16 bg-white rounded-3xl border border-slate-200 text-center p-8 space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">अभी कोई परीक्षा उपलब्ध नहीं है।</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">
              परिणाम दर्ज करने के लिए कृपया पहले 'Exams' टैब से कोई परीक्षा और डेट शीट शेड्यूल करें।
            </p>
          </div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="py-16 bg-white rounded-3xl border border-slate-200 text-center p-8 space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">कोई Result या छात्र नहीं मिला।</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">
              आपके खोज मानदंडों के अनुसार कोई छात्र रिकॉर्ड उपलब्ध नहीं है।
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-600 uppercase tracking-wider">
                  <th className="p-4 sm:px-6">छात्र का नाम (Student Name)</th>
                  <th className="p-4 sm:px-6">कक्षा / बैच</th>
                  {selectedExam?.schedule.map((sch) => (
                    <th key={sch.subjectId} className="p-4 sm:px-6 text-center">
                      {sch.subjectName}
                      <span className="block text-[10px] font-normal text-slate-400">Max: {sch.maxMarks}</span>
                    </th>
                  ))}
                  <th className="p-4 sm:px-6 text-center">कुल प्राप्तांक</th>
                  <th className="p-4 sm:px-6 text-center">प्रतिशत व ग्रेड</th>
                  <th className="p-4 sm:px-6 text-center">स्थिति (Status)</th>
                  <th className="p-4 sm:px-6 text-right">क्रियाएं (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-800">
                {filteredStudents.map((st) => {
                  const aggregate = getStudentAggregate(st);
                  const isEditing = editingStudentId === st.uid;
                  const classMeta = CLASSES_METADATA.find((c) => c.id === st.classLevel);

                  return (
                    <tr key={st.uid} className="hover:bg-slate-50/80 transition-colors">
                      {/* Student Name */}
                      <td className="p-4 sm:px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black shrink-0">
                            {st.displayName.charAt(0)}
                          </div>
                          <div>
                            <div>{st.displayName}</div>
                            <div className="text-xs text-slate-500 font-normal">{st.phoneNumber || st.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Class / Batch */}
                      <td className="p-4 sm:px-6 text-slate-600">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                          {classMeta ? classMeta.hindiName : st.classLevel || 'N/A'}
                        </span>
                      </td>

                      {/* Subject Marks Columns */}
                      {selectedExam?.schedule.map((sch) => {
                        const rec = examResultsMap.get(`${st.uid}_${sch.subjectId}`);
                        const formEntry = editMarksForm[sch.subjectId];

                        if (isEditing) {
                          return (
                            <td key={sch.subjectId} className="p-3 text-center">
                              <input
                                type="number"
                                min="0"
                                max={sch.maxMarks}
                                placeholder="अंक"
                                value={formEntry?.marks !== undefined ? formEntry.marks : ''}
                                onChange={(e) =>
                                  setEditMarksForm((prev) => ({
                                    ...prev,
                                    [sch.subjectId]: { ...prev[sch.subjectId], marks: e.target.value },
                                  }))
                                }
                                className="w-20 px-2.5 py-1.5 rounded-xl border border-emerald-400 text-center font-bold text-slate-900 bg-white shadow-xs outline-hidden focus:ring-2 focus:ring-emerald-500"
                              />
                            </td>
                          );
                        }

                        return (
                          <td key={sch.subjectId} className="p-4 sm:px-6 text-center">
                            {rec && rec.marksObtained !== null && rec.marksObtained !== undefined ? (
                              <div>
                                <span className={`font-black ${rec.passFail === 'pass' ? 'text-emerald-700' : 'text-rose-600'}`}>
                                  {rec.marksObtained}
                                </span>
                                <span className="text-slate-400 text-xs"> / {sch.maxMarks}</span>
                                <div className="text-[10px] text-slate-500 uppercase font-bold">{rec.passFail} ({rec.grade})</div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">— लंबित</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Total Marks */}
                      <td className="p-4 sm:px-6 text-center font-bold">
                        {aggregate?.allEntered ? (
                          <span>
                            {aggregate.totalObtainedMarks} / {aggregate.totalMaxMarks}
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600 font-semibold">अपूर्ण</span>
                        )}
                      </td>

                      {/* Percentage & Grade */}
                      <td className="p-4 sm:px-6 text-center">
                        {aggregate?.allEntered ? (
                          <div>
                            <span className="font-black text-slate-900">{aggregate.overallPercentage}%</span>
                            <span className="ml-1.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-black border border-indigo-200">
                              {aggregate.overallGrade}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4 sm:px-6 text-center">
                        {aggregate?.allEntered ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                              aggregate.overallPassFail === 'pass'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {aggregate.overallPassFail === 'pass' ? 'उत्तीर्ण (PASS)' : 'अनुत्तीर्ण (FAIL)'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                            लंबित (Pending)
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 sm:px-6 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSaveStudentMarks(st)}
                              disabled={actionLoading}
                              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm"
                              title="सहेजें"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingStudentId(null)}
                              className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                              title="रद्द करें"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditStudent(st)}
                              disabled={selectedExam?.status === 'cancelled'}
                              className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
                              title="अंक दर्ज/संपादित करें"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {aggregate?.allEntered && (
                              <button
                                onClick={() => setViewingScorecardStudent(st)}
                                className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-colors cursor-pointer"
                                title="स्कोरकार्ड देखें"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PUBLISH CONFIRMATION MODAL */}
      {showPublishModal && selectedExam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
              <Send className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900">परीक्षा परिणाम प्रकाशित करें?</h3>
              <p className="text-sm text-slate-600 font-medium">
                आप परीक्षा <span className="font-bold text-slate-900">"{selectedExam.title}"</span> के परिणामों को प्रकाशित करने जा रहे हैं।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-bold text-slate-700">
              <div className="flex justify-between">
                <span>कुल छात्र:</span>
                <span className="font-black text-slate-900">{examSummaryMetrics.totalStudents}</span>
              </div>
              <div className="flex justify-between">
                <span>अंक दर्ज किए गए:</span>
                <span className="font-black text-emerald-700">{examSummaryMetrics.entered}</span>
              </div>
              <div className="flex justify-between">
                <span>लंबित अंक:</span>
                <span className="font-black text-amber-600">{examSummaryMetrics.pending}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowPublishModal(false)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer transition-colors"
              >
                रद्द करें
              </button>
              <button
                onClick={handleConfirmPublish}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm cursor-pointer shadow-md transition-all"
              >
                {actionLoading ? 'प्रकाशित हो रहा है...' : 'हाँ, प्रकाशित करें'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNPUBLISH / REOPEN MODAL */}
      {showUnpublishModal && selectedExam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
              <Unlock className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900">परिणाम रीओपन / अनपब्लिश करें?</h3>
              <p className="text-sm text-slate-600 font-medium">
                आप इस परीक्षा के परिणामों को पुनः Draft स्थिति में बदल रहे हैं जिससे संचालक द्वारा अंकों में संशोधन किया जा सके।
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowUnpublishModal(false)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer transition-colors"
              >
                रद्द करें
              </button>
              <button
                onClick={handleConfirmUnpublish}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm cursor-pointer shadow-md transition-all"
              >
                {actionLoading ? 'प्रक्रिया जारी है...' : 'हाँ, Draft में बदलें'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT SCORECARD VIEW MODAL */}
      {viewingScorecardStudent && selectedExam && (() => {
        const aggr = getStudentAggregate(viewingScorecardStudent);
        const classMeta = CLASSES_METADATA.find((c) => c.id === viewingScorecardStudent.classLevel);

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-auto">
              {/* Scorecard Header */}
              <div className="text-center pb-6 border-b-2 border-slate-900 space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">बिहार बोर्ड एवं प्रतियोगी परीक्षाओं हेतु अग्रणी शिक्षण संस्थान</div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">RK STUDY CENTRE</h2>
                <div className="text-xs font-bold text-indigo-700">विद्यार्थी प्रगति रिपोर्ट एवं स्कोरकार्ड (Student Progress Scorecard)</div>
              </div>

              {/* Student Metadata Box */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium">
                <div>
                  <span className="text-slate-500 block">छात्र का नाम:</span>
                  <span className="font-bold text-slate-900 text-base">{aggr?.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">कक्षा:</span>
                  <span className="font-bold text-slate-900">{classMeta ? classMeta.hindiName : viewingScorecardStudent.classLevel}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">बैच / कोर्स:</span>
                  <span className="font-bold text-slate-900">{aggr?.batchName || 'सामान्य बैच'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">परीक्षा का नाम:</span>
                  <span className="font-bold text-slate-900">{selectedExam.title}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">परीक्षा दिनांक:</span>
                  <span className="font-bold text-slate-900">{selectedExam.startDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">परिणाम स्थिति:</span>
                  <span className={`font-black uppercase ${aggr?.overallPassFail === 'pass' ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {aggr?.overallPassFail === 'pass' ? 'उत्तीर्ण (PASS)' : 'अनुत्तीर्ण (FAIL)'}
                  </span>
                </div>
              </div>

              {/* Subject Wise Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-900 text-white text-xs font-black uppercase tracking-wider">
                      <th className="p-3.5 rounded-l-xl">विषय (Subject)</th>
                      <th className="p-3.5 text-center">अधिकतम अंक</th>
                      <th className="p-3.5 text-center">प्राप्तांक</th>
                      <th className="p-3.5 text-center">प्रतिशत (%)</th>
                      <th className="p-3.5 text-center">ग्रेड</th>
                      <th className="p-3.5 text-center rounded-r-xl">परिणाम</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {aggr?.subjects.map((sub: any) => (
                      <tr key={sub.subjectId} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-slate-900">{sub.subjectName}</td>
                        <td className="p-3.5 text-center font-bold">{sub.maxMarks}</td>
                        <td className="p-3.5 text-center font-bold text-emerald-700">{sub.marksObtained !== null ? sub.marksObtained : '—'}</td>
                        <td className="p-3.5 text-center">{sub.marksObtained !== null ? `${sub.percentage}%` : '—'}</td>
                        <td className="p-3.5 text-center font-black">{sub.grade}</td>
                        <td className="p-3.5 text-center font-bold">
                          <span className={`px-2 py-0.5 rounded text-xs ${sub.passFail === 'pass' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {sub.passFail.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Aggregate Summary Box */}
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-emerald-950">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">कुल योग एवं प्रदर्शन</div>
                  <div className="text-2xl font-black">
                    {aggr?.totalObtainedMarks} / {aggr?.totalMaxMarks} <span className="text-base font-bold ml-2">({aggr?.overallPercentage}%)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-center shadow-xs">
                    <span className="text-[10px] text-slate-500 font-bold block">समग्र ग्रेड</span>
                    <span className="text-xl font-black text-emerald-700">{aggr?.overallGrade}</span>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-center shadow-xs">
                    <span className="text-[10px] text-slate-500 font-bold block">अंतिम परिणाम</span>
                    <span className={`text-xl font-black ${aggr?.overallPassFail === 'pass' ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {aggr?.overallPassFail.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>प्रिंट / सेव PDF</span>
                </button>
                <button
                  onClick={() => setViewingScorecardStudent(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
                >
                  बंद करें
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
