/**
 * RK STUDY CENTRE - Student Management Module (Step 6F & Task 4)
 * 
 * Comprehensive Owner Student Directory & Lifecycle Manager:
 * - View registered students with live search and class/status filters
 * - Manually Add Student with strict validation and duplicate checking
 * - Edit existing Student details with pre-filled inputs
 * - Safe Deactivate & Permanent Delete with 100% In-App Confirmation Modal (NO window.confirm)
 * - In-App Course Enrollment & Unenrollment without native browser alerts
 * - Instant list refresh without stale data
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  X,
  ChevronRight,
  UserPlus,
  Pencil,
  Trash2,
  Power,
  UserX,
  AlertCircle,
  PlusCircle,
  MinusCircle,
  HelpCircle,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CLASSES_METADATA } from '../../lib/constants';
import type { ClassLevel, Course } from '../../types';
import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  setStudentStatus,
  enrollStudentInCourse,
  unenrollStudentFromCourse,
  updateStudentClass,
  type SafeStudentProfile,
  type CreateStudentInput,
  isValidMobileNumber,
} from '../../services/studentService';
import { getAllCourses } from '../../services/courseService';
import { ConfirmModal } from '../common/ConfirmModal';

export function OwnerStudentManager() {
  const { isOwner } = useAuth();

  const [students, setStudents] = useState<SafeStudentProfile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'registered' | 'inactive'>('all');

  // Modal 1: Student Detail & Course Management Modal
  const [selectedStudent, setSelectedStudent] = useState<SafeStudentProfile | null>(null);
  const [courseToEnroll, setCourseToEnroll] = useState<string>('');
  const [isProcessingEnrollment, setIsProcessingEnrollment] = useState(false);
  const [editingStudentClass, setEditingStudentClass] = useState<ClassLevel | ''>('');

  // Course Unenrollment Confirmation State (in-app modal)
  const [unenrollConfirmData, setUnenrollConfirmData] = useState<{
    studentUid: string;
    courseId: string;
    courseTitle: string;
  } | null>(null);

  // Modal 2: Add Student Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState<boolean>(false);
  const [addFormError, setAddFormError] = useState<string | null>(null);
  const [addForm, setAddForm] = useState<{
    displayName: string;
    phoneNumber: string;
    email: string;
    classLevel: ClassLevel;
    board: string;
    courseId: string;
    status: 'active' | 'registered';
  }>({
    displayName: '',
    phoneNumber: '',
    email: '',
    classLevel: 'class-10',
    board: 'Bihar Board (BSEB)',
    courseId: '',
    status: 'active',
  });

  // Modal 3: Edit Student Modal State
  const [editingStudent, setEditingStudent] = useState<SafeStudentProfile | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    displayName: string;
    phoneNumber: string;
    email: string;
    classLevel: ClassLevel;
    board: string;
    status: 'active' | 'registered' | 'inactive';
  }>({
    displayName: '',
    phoneNumber: '',
    email: '',
    classLevel: 'class-10',
    board: 'Bihar Board (BSEB)',
    status: 'active',
  });

  // Modal 4: Delete / Deactivate Confirmation Modal State (Zero window.confirm)
  const [actionStudent, setActionStudent] = useState<SafeStudentProfile | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [studentsData, coursesData] = await Promise.all([
        getAllStudents(),
        getAllCourses(true),
      ]);
      setStudents(studentsData);
      setCourses(coursesData);
    } catch (error: any) {
      setErrorMessage(error.message || 'डेटा लोड करने में असमर्थ।');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick auto-dismiss for success toast
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle Add Student Submit
  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError(null);

    // Form validations
    if (!addForm.displayName.trim() || addForm.displayName.trim().length < 2) {
      setAddFormError('विद्यार्थी का नाम दर्ज करना अनिवार्य है (कम से कम 2 अक्षर)।');
      return;
    }

    if (!addForm.phoneNumber.trim()) {
      setAddFormError('मोबाइल नंबर दर्ज करना अनिवार्य है।');
      return;
    }

    if (!isValidMobileNumber(addForm.phoneNumber)) {
      setAddFormError('कृपया एक वैध 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें (उदा. 9876543210)।');
      return;
    }

    if (addForm.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(addForm.email.trim())) {
        setAddFormError('कृपया सही ईमेल प्रारूप दर्ज करें (उदा. student@example.com)।');
        return;
      }
    }

    setIsSubmittingAdd(true);
    try {
      const input: CreateStudentInput = {
        displayName: addForm.displayName.trim(),
        phoneNumber: addForm.phoneNumber.trim(),
        email: addForm.email.trim() || undefined,
        classLevel: addForm.classLevel,
        board: addForm.board,
        enrolledCourseIds: addForm.courseId ? [addForm.courseId] : [],
        status: addForm.status,
      };

      const newStudent = await createStudent(input);
      setSuccessMessage(`विद्यार्थी "${newStudent.displayName}" को सफलतापूर्वक जोड़ा गया!`);

      // Reset form & close modal
      setAddForm({
        displayName: '',
        phoneNumber: '',
        email: '',
        classLevel: 'class-10',
        board: 'Bihar Board (BSEB)',
        courseId: '',
        status: 'active',
      });
      setShowAddModal(false);

      // Refresh data
      await loadData();
    } catch (err: any) {
      setAddFormError(err.message || 'विद्यार्थी जोड़ने में विफल।');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Open Edit Modal with Pre-filled Student Data
  const openEditModal = (student: SafeStudentProfile) => {
    setEditingStudent(student);
    setEditFormError(null);
    const isAutoEmail = student.email?.startsWith('student_') && student.email?.endsWith('@rkstudy.in');
    setEditForm({
      displayName: student.displayName || '',
      phoneNumber: student.phoneNumber ? student.phoneNumber.replace('+91 ', '').replace(/\s/g, '') : '',
      email: isAutoEmail ? '' : (student.email || ''),
      classLevel: student.classLevel || 'class-10',
      board: student.board || 'Bihar Board (BSEB)',
      status: student.status || 'active',
    });
  };

  // Handle Edit Student Submit
  const handleEditStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setEditFormError(null);

    if (!editForm.displayName.trim() || editForm.displayName.trim().length < 2) {
      setEditFormError('विद्यार्थी का नाम दर्ज करना अनिवार्य है (कम से कम 2 अक्षर)।');
      return;
    }

    if (!editForm.phoneNumber.trim() || !isValidMobileNumber(editForm.phoneNumber)) {
      setEditFormError('कृपया एक वैध 10 अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }

    if (editForm.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email.trim())) {
        setEditFormError('कृपया सही ईमेल प्रारूप दर्ज करें।');
        return;
      }
    }

    setIsSubmittingEdit(true);
    try {
      await updateStudent(editingStudent.uid, {
        displayName: editForm.displayName.trim(),
        phoneNumber: editForm.phoneNumber.trim(),
        email: editForm.email.trim(),
        classLevel: editForm.classLevel,
        board: editForm.board,
        status: editForm.status,
      });

      setSuccessMessage(`विद्यार्थी "${editForm.displayName}" का विवरण सफलतापूर्वक अपडेट किया गया!`);
      setEditingStudent(null);

      // If selected in detail modal, update it too
      if (selectedStudent && selectedStudent.uid === editingStudent.uid) {
        setSelectedStudent({
          ...selectedStudent,
          displayName: editForm.displayName.trim(),
          phoneNumber: editForm.phoneNumber.trim(),
          email: editForm.email.trim(),
          classLevel: editForm.classLevel,
          board: editForm.board,
          status: editForm.status,
        });
      }

      await loadData();
    } catch (err: any) {
      setEditFormError(err.message || 'अपडेट करने में विफल।');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle Deactivate Student (Toggle between Active and Inactive)
  const handleToggleDeactivate = async (student: SafeStudentProfile, targetStatus: 'active' | 'inactive') => {
    setIsProcessingAction(true);
    setActionError(null);
    try {
      await setStudentStatus(student.uid, targetStatus);
      setSuccessMessage(
        targetStatus === 'inactive'
          ? `विद्यार्थी "${student.displayName}" को सफलतापूर्वक अक्रिय (Deactivate) किया गया।`
          : `विद्यार्थी "${student.displayName}" को पुनः सक्रिय (Reactivate) किया गया।`
      );
      setActionStudent(null);
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'स्थिति बदलने में विफल।');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Handle Permanent Delete Student
  const handleConfirmPermanentDelete = async (student: SafeStudentProfile) => {
    setIsProcessingAction(true);
    setActionError(null);
    try {
      await deleteStudent(student.uid);
      setSuccessMessage(`विद्यार्थी "${student.displayName}" को स्थायी रूप से हटा दिया गया।`);
      setActionStudent(null);
      if (selectedStudent && selectedStudent.uid === student.uid) {
        setSelectedStudent(null);
      }
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'विद्यार्थी हटाने में विफल।');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Course Enrollment in Detail Modal
  const handleEnrollInCourse = async (studentUid: string, courseId: string) => {
    if (!courseId) return;
    setIsProcessingEnrollment(true);
    try {
      await enrollStudentInCourse(studentUid, courseId);
      setSuccessMessage('विद्यार्थी का नामांकन सफलतापूर्वक दर्ज किया गया!');
      
      // Update local state
      setStudents((prev) =>
        prev.map((s) => {
          if (s.uid === studentUid) {
            const currentEnrolled = s.enrolledCourseIds || [];
            const updatedEnrolled = currentEnrolled.includes(courseId)
              ? currentEnrolled
              : [...currentEnrolled, courseId];
            return {
              ...s,
              enrolledCourseIds: updatedEnrolled,
              status: 'active',
            };
          }
          return s;
        })
      );
      if (selectedStudent && selectedStudent.uid === studentUid) {
        const currentEnrolled = selectedStudent.enrolledCourseIds || [];
        const updatedEnrolled = currentEnrolled.includes(courseId)
          ? currentEnrolled
          : [...currentEnrolled, courseId];
        setSelectedStudent({
          ...selectedStudent,
          enrolledCourseIds: updatedEnrolled,
          status: 'active',
        });
      }
      setCourseToEnroll('');
    } catch (err: any) {
      setErrorMessage('नामांकन में त्रुटि: ' + (err.message || 'अज्ञात त्रुटि'));
    } finally {
      setIsProcessingEnrollment(false);
    }
  };

  // In-app Course Unenrollment Confirmation
  const executeUnenrollCourse = async () => {
    if (!unenrollConfirmData) return;
    const { studentUid, courseId } = unenrollConfirmData;
    setIsProcessingEnrollment(true);
    try {
      await unenrollStudentFromCourse(studentUid, courseId);
      setSuccessMessage('विद्यार्थी को कोर्स से सफलतापूर्वक हटाया गया।');
      setStudents((prev) =>
        prev.map((s) => {
          if (s.uid === studentUid) {
            const currentEnrolled = s.enrolledCourseIds || [];
            const updatedEnrolled = currentEnrolled.filter((id) => id !== courseId);
            return {
              ...s,
              enrolledCourseIds: updatedEnrolled,
              status: updatedEnrolled.length > 0 ? 'active' : 'registered',
            };
          }
          return s;
        })
      );
      if (selectedStudent && selectedStudent.uid === studentUid) {
        const currentEnrolled = selectedStudent.enrolledCourseIds || [];
        const updatedEnrolled = currentEnrolled.filter((id) => id !== courseId);
        setSelectedStudent({
          ...selectedStudent,
          enrolledCourseIds: updatedEnrolled,
          status: updatedEnrolled.length > 0 ? 'active' : 'registered',
        });
      }
      setUnenrollConfirmData(null);
    } catch (err: any) {
      setErrorMessage('कोर्स हटाने में त्रुटि: ' + (err.message || 'अज्ञात त्रुटि'));
    } finally {
      setIsProcessingEnrollment(false);
    }
  };

  // Class update from Detail Modal
  const handleUpdateClass = async (studentUid: string, newClass: ClassLevel) => {
    try {
      await updateStudentClass(studentUid, newClass);
      setSuccessMessage('कक्षा सफलतापूर्वक अपडेट की गई!');
      setStudents((prev) =>
        prev.map((s) => (s.uid === studentUid ? { ...s, classLevel: newClass } : s))
      );
      if (selectedStudent && selectedStudent.uid === studentUid) {
        setSelectedStudent({ ...selectedStudent, classLevel: newClass });
      }
    } catch (err: any) {
      setErrorMessage('कक्षा अपडेट में त्रुटि: ' + (err.message || 'अज्ञात त्रुटि'));
    }
  };

  // Filtered Students
  const filteredStudents = students.filter((student) => {
    if (filterClass !== 'all' && student.classLevel !== filterClass) {
      return false;
    }
    if (filterCourse !== 'all') {
      const studentCourses = student.enrolledCourseIds || [];
      if (!studentCourses.includes(filterCourse)) {
        return false;
      }
    }
    if (filterStatus !== 'all' && student.status !== filterStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = student.displayName.toLowerCase().includes(q);
      const matchEmail = student.email.toLowerCase().includes(q);
      const matchPhone = student.phoneNumber?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'उपलब्ध नहीं';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Control Area */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>संचालक नियंत्रण केंद्र • छात्र प्रबंधन (Task 4)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              छात्र प्रबंधन (Student Management)
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium max-w-3xl leading-relaxed">
              आरके स्टडी सेंटर पोर्टल के विद्यार्थियों को जोड़ें, उनका विवरण संपादित करें, कोर्स नामांकन प्रबंधित करें
              अथवा सुरक्षित रूप से अक्रिय/हटाएं।
            </p>
          </div>

          {/* Action Buttons: Add Student & Refresh */}
          <div className="shrink-0 flex items-center gap-3 flex-wrap">
            <button
              onClick={() => {
                setAddFormError(null);
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>नया छात्र जोड़ें (Add Student)</span>
            </button>

            <button
              onClick={loadData}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors border border-slate-200 cursor-pointer disabled:opacity-50"
              title="डेटा रिफ्रेश करें"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
              <span>रिफ्रेश</span>
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-50 text-rose-900 border border-rose-200 flex items-center justify-between gap-3 text-sm font-bold animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 rounded-lg hover:bg-black/5 text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Global Success Banner */}
        {successMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center justify-between gap-3 text-sm font-bold animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="p-1 rounded-lg hover:bg-black/5 text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="text-2xl font-black text-slate-900">{students.length}</div>
            <div className="text-xs font-bold text-slate-500 mt-1">कुल पंजीकृत छात्र</div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
            <div className="text-2xl font-black text-emerald-800">
              {students.filter((s) => s.status === 'active').length}
            </div>
            <div className="text-xs font-bold text-emerald-600 mt-1">सक्रिय (Active)</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <div className="text-2xl font-black text-blue-800">
              {students.filter((s) => s.classLevel === 'class-10').length}
            </div>
            <div className="text-xs font-bold text-blue-600 mt-1">मैट्रिक (कक्षा 10वीं)</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
            <div className="text-2xl font-black text-purple-800">
              {students.filter((s) => s.classLevel === 'class-12').length}
            </div>
            <div className="text-xs font-bold text-purple-600 mt-1">इंटरमीडिएट (12वीं)</div>
          </div>
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 col-span-2 sm:col-span-1">
            <div className="text-2xl font-black text-amber-800">
              {students.filter((s) => s.status === 'inactive').length}
            </div>
            <div className="text-xs font-bold text-amber-600 mt-1">अक्रिय (Inactive)</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="विद्यार्थी का नाम, ईमेल अथवा मोबाइल नंबर खोजें..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Class Filter */}
          <div className="shrink-0">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">सभी कक्षाएं (Class 9-12)</option>
              {CLASSES_METADATA.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.hindiName})
                </option>
              ))}
            </select>
          </div>

          {/* Course / Batch Filter */}
          <div className="shrink-0">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">सभी कोर्स व बैच (All Courses)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.batchName})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl shrink-0 overflow-x-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              सभी ({students.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              सक्रिय
            </button>
            <button
              onClick={() => setFilterStatus('registered')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'registered'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              पंजीकृत
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'inactive'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              अक्रिय
            </button>
          </div>
        </div>
      </div>

      {/* Students Directory List / Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span>विद्यार्थी सूची</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              {filteredStudents.length} छात्र प्रदर्शित
            </span>
          </h3>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
            <p className="text-slate-600 font-bold text-sm">विद्यार्थी सूची लोड हो रही है...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border-2 border-dashed border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Users className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-800">कोई विद्यार्थी नहीं मिला</h4>
            <p className="text-slate-500 text-sm max-w-md mx-auto font-medium">
              {searchQuery
                ? `खोज क्वेरी "${searchQuery}" के लिए कोई परिणाम नहीं मिला।`
                : 'वर्तमान में इस फ़िल्टर के अनुसार कोई छात्र पंजीकृत नहीं है।'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterClass('all');
                setFilterCourse('all');
                setFilterStatus('all');
              }}
              className="px-4 py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-100 transition-colors"
            >
              सभी फ़िल्टर साफ़ करें
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-700 uppercase tracking-wider">
                    <th className="py-4 px-6">विद्यार्थी का नाम (Student)</th>
                    <th className="py-4 px-6">संपर्क विवरण (Contact)</th>
                    <th className="py-4 px-6">कक्षा (Class Level)</th>
                    <th className="py-4 px-6">नामांकित कोर्स</th>
                    <th className="py-4 px-6">स्थिति (Status)</th>
                    <th className="py-4 px-6">पंजीकरण तिथि</th>
                    <th className="py-4 px-6 text-right">कार्रवाई (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-semibold">
                  {filteredStudents.map((student) => {
                    const classMeta = CLASSES_METADATA.find((c) => c.id === student.classLevel);

                    return (
                      <tr key={student.uid} className="hover:bg-slate-50/80 transition-colors">
                        {/* Name & Board */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-sm shrink-0 border border-blue-200">
                              {student.displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-black text-slate-900 flex items-center gap-2">
                                <span>{student.displayName}</span>
                                {student.role === 'owner' && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                                    संचालक (Owner)
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 font-normal">
                                बोर्ड: {student.board || 'Bihar Board (BSEB)'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email & Phone */}
                        <td className="py-4 px-6 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {student.email?.startsWith('student_') && student.email?.endsWith('@rkstudy.in') ? (
                              <span className="text-slate-400 italic">ईमेल दर्ज नहीं (वैकल्पिक)</span>
                            ) : (
                              <span>{student.email || 'उपलब्ध नहीं'}</span>
                            )}
                          </div>
                          {student.phoneNumber && (
                            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{student.phoneNumber}</span>
                            </div>
                          )}
                        </td>

                        {/* Class */}
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                            <span>{classMeta ? `${classMeta.name} (${classMeta.hindiName})` : student.classLevel || 'अनिधारित'}</span>
                          </span>
                        </td>

                        {/* Enrolled Courses */}
                        <td className="py-4 px-6">
                          {(student.enrolledCourseIds || []).length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs font-bold">
                              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{(student.enrolledCourseIds || []).length} कोर्स</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">कोई नहीं</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                              student.status === 'active'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : student.status === 'inactive'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                student.status === 'active'
                                  ? 'bg-emerald-600'
                                  : student.status === 'inactive'
                                  ? 'bg-rose-600'
                                  : 'bg-blue-600'
                              }`}
                            />
                            <span>
                              {student.status === 'active'
                                ? 'सक्रिय (Active)'
                                : student.status === 'inactive'
                                ? 'अक्रिय (Inactive)'
                                : 'पंजीकृत (Registered)'}
                            </span>
                          </span>
                        </td>

                        {/* Registration Date */}
                        <td className="py-4 px-6 text-xs text-slate-600 font-medium whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{formatDate(student.createdAt)}</span>
                          </div>
                        </td>

                        {/* Action Buttons: Details, Edit, Delete/Deactivate */}
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {/* Course / Details Button */}
                            <button
                              onClick={() => {
                                setSelectedStudent(student);
                                setEditingStudentClass(student.classLevel || '');
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
                              title="कोर्स व विवरण प्रबंधन"
                            >
                              <span>प्रबंधन</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => openEditModal(student)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                              title="संपादित करें (Edit)"
                            >
                              <Pencil className="w-4 h-4 text-slate-600" />
                            </button>

                            {/* Delete / Deactivate Trigger */}
                            <button
                              onClick={() => {
                                setActionError(null);
                                setActionStudent(student);
                              }}
                              className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                              title="अक्रिय अथवा हटाएं"
                            >
                              <Trash2 className="w-4 h-4 text-rose-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD STUDENT MODAL                                                */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border-2 border-slate-200 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">नया छात्र जोड़ें (Add Student)</h3>
                  <p className="text-xs text-slate-500 font-medium">पोर्टल में नया विद्यार्थी मैन्युअली पंजीकृत करें</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message inside modal */}
            {addFormError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{addFormError}</span>
              </div>
            )}

            {/* Add Student Form */}
            <form onSubmit={handleAddStudentSubmit} className="space-y-4">
              {/* Student Name */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  विद्यार्थी का नाम (Student Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addForm.displayName}
                  onChange={(e) => setAddForm({ ...addForm, displayName: e.target.value })}
                  placeholder="उदा. राहुल कुमार (Rahul Kumar)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  मोबाइल नंबर (Mobile Number - 10 अंक) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={addForm.phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setAddForm({ ...addForm, phoneNumber: val });
                    }}
                    placeholder="9876543210"
                    className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">10 अंकों का सक्रिय मोबाइल नंबर दर्ज करें।</p>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  ईमेल पता (Email Address) <span className="text-slate-400 font-normal">(वैकल्पिक)</span>
                </label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="student@example.com (खाली छोड़ने पर स्वचालित ईमेल बनेगा)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Class & Board Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    कक्षा (Class Level) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={addForm.classLevel}
                    onChange={(e) => setAddForm({ ...addForm, classLevel: e.target.value as ClassLevel })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {CLASSES_METADATA.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.hindiName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    बोर्ड (Board)
                  </label>
                  <select
                    value={addForm.board}
                    onChange={(e) => setAddForm({ ...addForm, board: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Bihar Board (BSEB)">बिहार बोर्ड (BSEB)</option>
                    <option value="CBSE">सीबीएसई (CBSE)</option>
                    <option value="Other">अन्य (Other)</option>
                  </select>
                </div>
              </div>

              {/* Initial Course / Batch Assignment */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  कोर्स / बैच नामांकन <span className="text-slate-400 font-normal">(वैकल्पिक)</span>
                </label>
                <select
                  value={addForm.courseId}
                  onChange={(e) => setAddForm({ ...addForm, courseId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">कोई कोर्स नहीं (बाद में जोड़ें)</option>
                  {courses
                    .filter((c) => c.classLevel === addForm.classLevel || !addForm.classLevel)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.batchName}) - ₹{c.discountedPrice}
                      </option>
                    ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  आरंभिक स्थिति (Status)
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer flex-1 text-xs font-bold text-slate-800">
                    <input
                      type="radio"
                      name="add_status"
                      checked={addForm.status === 'active'}
                      onChange={() => setAddForm({ ...addForm, status: 'active' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>सक्रिय (Active)</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer flex-1 text-xs font-bold text-slate-800">
                    <input
                      type="radio"
                      name="add_status"
                      checked={addForm.status === 'registered'}
                      onChange={() => setAddForm({ ...addForm, status: 'registered' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>पंजीकृत (Registered)</span>
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmittingAdd}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black transition-colors cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {isSubmittingAdd ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>सहेज रहे हैं...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>छात्र जोड़ें</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT STUDENT MODAL                                               */}
      {/* ========================================================================= */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border-2 border-slate-200 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">छात्र विवरण संपादित करें (Edit Student)</h3>
                  <p className="text-xs text-slate-500 font-medium">UID: {editingStudent.uid}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner */}
            {editFormError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{editFormError}</span>
              </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleEditStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  विद्यार्थी का नाम <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  मोबाइल नंबर (10 अंक) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={editForm.phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setEditForm({ ...editForm, phoneNumber: val });
                    }}
                    className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  ईमेल पता (Email)
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    कक्षा स्तर
                  </label>
                  <select
                    value={editForm.classLevel}
                    onChange={(e) => setEditForm({ ...editForm, classLevel: e.target.value as ClassLevel })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {CLASSES_METADATA.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.hindiName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    बोर्ड (Board)
                  </label>
                  <select
                    value={editForm.board}
                    onChange={(e) => setEditForm({ ...editForm, board: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Bihar Board (BSEB)">बिहार बोर्ड (BSEB)</option>
                    <option value="CBSE">सीबीएसई (CBSE)</option>
                    <option value="Other">अन्य (Other)</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  स्थिति (Account Status)
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, status: 'active' })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      editForm.status === 'active'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    सक्रिय (Active)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, status: 'registered' })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      editForm.status === 'registered'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    पंजीकृत
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, status: 'inactive' })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      editForm.status === 'inactive'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    अक्रिय (Inactive)
                  </button>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  disabled={isSubmittingEdit}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black transition-colors cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {isSubmittingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>अपडेट हो रहा है...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>अपडेट सहेजें</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DELETE / DEACTIVATE CONFIRMATION MODAL (NO window.confirm!)       */}
      {/* ========================================================================= */}
      {actionStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-slate-200 shadow-2xl space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200 shadow-xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  विद्यार्थी निष्कासन या अक्रियकरण
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  विद्यार्थी: <span className="font-bold text-slate-800">{actionStudent.displayName}</span> ({actionStudent.phoneNumber || actionStudent.email})
                </p>
              </div>
            </div>

            {/* Error banner */}
            {actionError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Explanation of the two safe choices */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <Power className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 block">विकल्प 1: अक्रिय करें (Deactivate / Soft Delete)</strong>
                  <span>विद्यार्थी का खाता अक्रिय हो जाएगा और वह पोर्टल में सक्रिय नहीं रहेगा, परंतु उसके पिछले टेस्ट रिकॉर्ड व प्रोग्रेस सुरक्षित रहेंगे। (अनुशंसित)</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200/80">
                <Trash2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-rose-800 block">विकल्प 2: स्थायी रूप से हटाएं (Permanent Delete)</strong>
                  <span>यह छात्र डायरेक्टरी और डेटाबेस से पूरी तरह हटा दिया जाएगा। यह प्रक्रिया वापस नहीं ली जा सकती।</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              {actionStudent.status !== 'inactive' ? (
                <button
                  type="button"
                  disabled={isProcessingAction}
                  onClick={() => handleToggleDeactivate(actionStudent, 'inactive')}
                  className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {isProcessingAction ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserX className="w-4 h-4" />
                  )}
                  <span>अक्रिय करें (Deactivate Student)</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isProcessingAction}
                  onClick={() => handleToggleDeactivate(actionStudent, 'active')}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {isProcessingAction ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Power className="w-4 h-4" />
                  )}
                  <span>पुनः सक्रिय करें (Reactivate Student)</span>
                </button>
              )}

              <button
                type="button"
                disabled={isProcessingAction}
                onClick={() => handleConfirmPermanentDelete(actionStudent)}
                className="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>स्थायी रूप से हटाएं (Delete Permanently)</span>
              </button>

              <button
                type="button"
                disabled={isProcessingAction}
                onClick={() => setActionStudent(null)}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: IN-APP COURSE UNENROLL CONFIRMATION (Replaces window.confirm)    */}
      {/* ========================================================================= */}
      <ConfirmModal
        isOpen={!!unenrollConfirmData}
        onClose={() => setUnenrollConfirmData(null)}
        onConfirm={executeUnenrollCourse}
        title="कोर्स से हटाएं"
        message={
          unenrollConfirmData ? (
            <span>
              क्या आप सचमुच विद्यार्थी को <strong className="text-slate-900">{unenrollConfirmData.courseTitle}</strong> से हटाना चाहते हैं?
            </span>
          ) : ""
        }
        confirmText="हटाने की पुष्टि करें"
        cancelText="रद्द करें"
        variant="danger"
        isLoading={isProcessingEnrollment}
        loadingText="हटा रहे हैं..."
      />

      {/* ========================================================================= */}
      {/* MODAL 5: STUDENT DETAILS & COURSE ENROLLMENT MODAL                        */}
      {/* ========================================================================= */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border-2 border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white font-black flex items-center justify-center text-xl shadow-md">
                  {selectedStudent.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      {selectedStudent.displayName}
                    </h3>
                    {selectedStudent.role === 'owner' && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-black">
                        संचालक
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    UID: <span className="font-mono">{selectedStudent.uid}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(selectedStudent)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                  title="संपादित करें"
                >
                  <Pencil className="w-5 h-5 text-slate-600" />
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Profile Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm">
              <div>
                <span className="text-slate-500 font-bold block">ईमेल (Email):</span>
                <span className="text-slate-900 font-bold">
                  {selectedStudent.email?.startsWith('student_') && selectedStudent.email?.endsWith('@rkstudy.in')
                    ? 'दर्ज नहीं (वैकल्पिक)'
                    : (selectedStudent.email || 'उपलब्ध नहीं')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">फोन नंबर:</span>
                <span className="text-slate-900 font-bold">{selectedStudent.phoneNumber || 'उपलब्ध नहीं'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">बोर्ड:</span>
                <span className="text-slate-900 font-bold">{selectedStudent.board || 'Bihar Board'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">स्थिति (Status):</span>
                <span className="text-slate-900 font-bold">
                  {selectedStudent.status === 'active'
                    ? 'सक्रिय (Active)'
                    : selectedStudent.status === 'inactive'
                    ? 'अक्रिय (Inactive)'
                    : 'पंजीकृत (Registered)'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">पंजीकरण तिथि:</span>
                <span className="text-slate-900 font-bold">{formatDate(selectedStudent.createdAt)}</span>
              </div>
            </div>

            {/* Class Assignment */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-800">कक्षा स्तर निर्धारण (Class Level)</span>
                {editingStudentClass && editingStudentClass !== selectedStudent.classLevel && (
                  <button
                    onClick={() => handleUpdateClass(selectedStudent.uid, editingStudentClass as ClassLevel)}
                    className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    अपडेट करें
                  </button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {CLASSES_METADATA.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setEditingStudentClass(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      editingStudentClass === c.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {c.hindiName} ({c.name})
                  </button>
                ))}
              </div>
            </div>

            {/* Enrolled Courses Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>वर्तमान नामांकित कोर्सेज ({(selectedStudent.enrolledCourseIds || []).length})</span>
                </h4>
              </div>

              {(selectedStudent.enrolledCourseIds || []).length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs sm:text-sm text-slate-500 font-medium">
                  विद्यार्थी वर्तमान में किसी भी कोर्स में नामांकित नहीं है।
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(selectedStudent.enrolledCourseIds || []).map((cId) => {
                    const matchedCourse = courses.find((c) => c.id === cId);
                    return (
                      <div
                        key={cId}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="text-sm font-black text-slate-900">
                            {matchedCourse ? matchedCourse.title : `कोर्स ID: ${cId}`}
                          </div>
                          {matchedCourse && (
                            <div className="text-xs text-slate-600 font-medium">
                              बैच: {matchedCourse.batchName} • शुल्क: ₹{matchedCourse.discountedPrice}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setUnenrollConfirmData({
                              studentUid: selectedStudent.uid,
                              courseId: cId,
                              courseTitle: matchedCourse ? matchedCourse.title : cId,
                            });
                          }}
                          disabled={isProcessingEnrollment}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          <MinusCircle className="w-3.5 h-3.5" />
                          <span>हटाएं</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Enroll into a New Course */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
              <h4 className="text-sm font-black text-indigo-950 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-700" />
                <span>नया कोर्स नामांकन जोड़ें</span>
              </h4>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <select
                  value={courseToEnroll}
                  onChange={(e) => setCourseToEnroll(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white border border-indigo-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">कोर्स का चयन करें...</option>
                  {courses
                    .filter((c) => !(selectedStudent.enrolledCourseIds || []).includes(c.id))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.batchName}) - ₹{c.discountedPrice}
                      </option>
                    ))}
                </select>
                <button
                  onClick={() => handleEnrollInCourse(selectedStudent.uid, courseToEnroll)}
                  disabled={!courseToEnroll || isProcessingEnrollment}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isProcessingEnrollment ? 'प्रक्रियाधीन...' : 'नामांकन जोड़ें'}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => {
                  setActionStudent(selectedStudent);
                  setSelectedStudent(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>अक्रिय / हटाएं</span>
              </button>

              <button
                onClick={() => setSelectedStudent(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold cursor-pointer transition-colors"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
