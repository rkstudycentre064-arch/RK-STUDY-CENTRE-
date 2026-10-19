/**
 * RK STUDY CENTRE - Owner Teacher Management Module (Task 5)
 * 
 * Provides centralized faculty directory, manual teacher onboarding,
 * subject assignments, class-level assignments, course/batch mappings,
 * live multi-filter searching, status toggling (Active/Inactive),
 * and dependency-safe permanent deletion.
 * 
 * Strictly adheres to Zero Native alert() and Zero window.confirm().
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Pencil,
  Trash2,
  Phone,
  Mail,
  UserCheck,
  UserX,
  Power,
  BookOpen,
  Layers,
  Award,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Teacher, CreateTeacherInput, Course, ClassLevel } from '../../types';
import { CLASSES_METADATA, SUBJECTS } from '../../lib/constants';
import { getAllCourses } from '../../services/courseService';
import {
  getAllTeachers,
  createTeacher,
  updateTeacher,
  setTeacherStatus,
  deleteTeacher,
  checkTeacherDependencies,
  isValidMobileNumber,
  normalizePhone,
} from '../../services/teacherService';

export function OwnerTeacherManager() {
  const { isOwner } = useAuth();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal 1: Add Teacher Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState<boolean>(false);
  const [addFormError, setAddFormError] = useState<string | null>(null);
  const [addForm, setAddForm] = useState<CreateTeacherInput>({
    name: '',
    phone: '',
    email: '',
    gender: 'male',
    subjectIds: [],
    subjectNames: [],
    classLevels: ['class-10'],
    assignedCourseIds: [],
    qualification: '',
    experienceYears: undefined,
    bio: '',
    status: 'active',
  });

  // Modal 2: Edit Teacher Modal State
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CreateTeacherInput>({
    name: '',
    phone: '',
    email: '',
    gender: 'male',
    subjectIds: [],
    subjectNames: [],
    classLevels: [],
    assignedCourseIds: [],
    qualification: '',
    experienceYears: undefined,
    bio: '',
    status: 'active',
  });

  // Modal 3: Deactivate / Reactivate Confirmation Modal
  const [actionTeacher, setActionTeacher] = useState<Teacher | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modal 4: Permanent Delete & Dependency Analysis Modal
  const [deleteCandidate, setDeleteCandidate] = useState<Teacher | null>(null);
  const [deleteDependencies, setDeleteDependencies] = useState<{
    hasDependencies: boolean;
    assignedCourses: Course[];
    assignedCourseTitles: string[];
  } | null>(null);
  const [isCheckingDeps, setIsCheckingDeps] = useState<boolean>(false);
  const [isProcessingDelete, setIsProcessingDelete] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch real teachers & courses
  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [teachersData, coursesData] = await Promise.all([
        getAllTeachers(),
        getAllCourses(true),
      ]);
      setTeachers(teachersData);
      setCourses(coursesData);
    } catch (err: any) {
      setErrorMessage(err?.message || 'शिक्षक सूची लोड करने में विफल।');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute distinct subjects from existing SUBJECTS list for filter dropdown
  const uniqueSubjects = useMemo(() => {
    const map = new Map<string, string>();
    SUBJECTS.forEach((s) => {
      if (!map.has(s.name)) {
        map.set(s.name, s.hindiName ? `${s.name} (${s.hindiName})` : s.name);
      }
    });
    return Array.from(map.entries()).map(([name, label]) => ({ name, label }));
  }, []);

  // Multi-filter matching
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      // 1. Status Filter
      if (filterStatus !== 'all' && teacher.status !== filterStatus) {
        return false;
      }

      // 2. Class Filter
      if (filterClass !== 'all' && !teacher.classLevels.includes(filterClass as ClassLevel)) {
        return false;
      }

      // 3. Subject Filter
      if (filterSubject !== 'all') {
        const matchesSubject =
          (teacher.subjectNames || []).some((s) => s.toLowerCase().includes(filterSubject.toLowerCase())) ||
          (teacher.subjectIds || []).includes(filterSubject);
        if (!matchesSubject) {
          return false;
        }
      }

      // 4. Course/Batch Filter
      if (filterCourse !== 'all') {
        if (!teacher.assignedCourseIds.includes(filterCourse)) {
          return false;
        }
      }

      // 5. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = teacher.name.toLowerCase().includes(q);
        const matchPhone = teacher.phone.toLowerCase().includes(q);
        const matchEmail = (teacher.email || '').toLowerCase().includes(q);
        const matchSubject = (teacher.subjectNames || []).some((s) => s.toLowerCase().includes(q));
        const matchQualification = (teacher.qualification || '').toLowerCase().includes(q);

        if (!matchName && !matchPhone && !matchEmail && !matchSubject && !matchQualification) {
          return false;
        }
      }

      return true;
    });
  }, [teachers, filterStatus, filterClass, filterSubject, filterCourse, searchQuery]);

  // Statistics calculation (strictly verified from actual state)
  const stats = useMemo(() => {
    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter((t) => t.status === 'active').length;
    const inactiveTeachers = teachers.filter((t) => t.status === 'inactive').length;
    const allAssignedCourses = new Set(teachers.flatMap((t) => t.assignedCourseIds)).size;

    return {
      totalTeachers,
      activeTeachers,
      inactiveTeachers,
      allAssignedCourses,
    };
  }, [teachers]);

  // Handle Add Teacher Submission
  const handleAddTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError(null);

    if (!addForm.name.trim() || addForm.name.trim().length < 2) {
      setAddFormError('शिक्षक का पूरा नाम दर्ज करना अनिवार्य है (कम से कम 2 अक्षर)।');
      return;
    }

    if (!addForm.phone.trim()) {
      setAddFormError('मोबाइल नंबर दर्ज करना अनिवार्य है।');
      return;
    }

    if (!isValidMobileNumber(addForm.phone)) {
      setAddFormError('कृपया एक वैध 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें (उदा. 9876543210)।');
      return;
    }

    if (addForm.email && addForm.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(addForm.email.trim())) {
        setAddFormError('कृपया सही ईमेल प्रारूप दर्ज करें (उदा. teacher@rkstudy.in)।');
        return;
      }
    }

    if (addForm.subjectIds.length === 0) {
      setAddFormError('कम से कम एक विषय (Subject) चुनना अनिवार्य है।');
      return;
    }

    if (addForm.classLevels.length === 0) {
      setAddFormError('कम से कम एक कक्षा स्तर (Class Level) चुनना अनिवार्य है।');
      return;
    }

    setIsSubmittingAdd(true);
    try {
      // Derive subject names for searchability
      const resolvedSubjectNames = addForm.subjectIds.map((sId) => {
        const found = SUBJECTS.find((sub) => sub.id === sId || sub.name === sId);
        return found ? `${found.name} (${found.hindiName})` : sId;
      });

      const newTeacher = await createTeacher({
        ...addForm,
        subjectNames: resolvedSubjectNames,
      });

      setSuccessMessage(`शिक्षक "${newTeacher.name}" को सफलतापूर्वक पंजीकृत किया गया!`);
      setShowAddModal(false);

      // Reset form
      setAddForm({
        name: '',
        phone: '',
        email: '',
        gender: 'male',
        subjectIds: [],
        subjectNames: [],
        classLevels: ['class-10'],
        assignedCourseIds: [],
        qualification: '',
        experienceYears: undefined,
        bio: '',
        status: 'active',
      });

      await loadData();
    } catch (err: any) {
      setAddFormError(err.message || 'शिक्षक जोड़ने में विफल।');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Open Edit Modal with Pre-filled Data
  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setEditFormError(null);
    setEditForm({
      name: teacher.name,
      phone: normalizePhone(teacher.phone),
      email: teacher.email || '',
      gender: teacher.gender || 'male',
      subjectIds: teacher.subjectIds || [],
      subjectNames: teacher.subjectNames || [],
      classLevels: teacher.classLevels || [],
      assignedCourseIds: teacher.assignedCourseIds || [],
      qualification: teacher.qualification || '',
      experienceYears: teacher.experienceYears,
      bio: teacher.bio || '',
      status: teacher.status,
    });
  };

  // Handle Edit Submit
  const handleEditTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    setEditFormError(null);

    if (!editForm.name.trim() || editForm.name.trim().length < 2) {
      setEditFormError('शिक्षक का पूरा नाम दर्ज करना अनिवार्य है (कम से कम 2 अक्षर)।');
      return;
    }

    if (!editForm.phone.trim() || !isValidMobileNumber(editForm.phone)) {
      setEditFormError('कृपया एक वैध 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें।');
      return;
    }

    if (editForm.email && editForm.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email.trim())) {
        setEditFormError('कृपया सही ईमेल प्रारूप दर्ज करें।');
        return;
      }
    }

    if (editForm.subjectIds.length === 0) {
      setEditFormError('कम से कम एक विषय चुनना अनिवार्य है।');
      return;
    }

    if (editForm.classLevels.length === 0) {
      setEditFormError('कम से कम एक कक्षा स्तर चुनना अनिवार्य है।');
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const resolvedSubjectNames = editForm.subjectIds.map((sId) => {
        const found = SUBJECTS.find((sub) => sub.id === sId || sub.name === sId);
        return found ? `${found.name} (${found.hindiName})` : sId;
      });

      await updateTeacher(editingTeacher.id, {
        ...editForm,
        subjectNames: resolvedSubjectNames,
      });

      setSuccessMessage(`शिक्षक "${editForm.name}" का विवरण सफलतापूर्वक अपडेट किया गया!`);
      setEditingTeacher(null);
      await loadData();
    } catch (err: any) {
      setEditFormError(err.message || 'विवरण अपडेट करने में विफल।');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Toggle Deactivate / Reactivate
  const handleToggleStatus = async (teacher: Teacher, targetStatus: 'active' | 'inactive') => {
    setIsProcessingAction(true);
    setActionError(null);
    try {
      await setTeacherStatus(teacher.id, targetStatus);
      setSuccessMessage(
        targetStatus === 'inactive'
          ? `शिक्षक "${teacher.name}" को अक्रिय (Deactivate) किया गया।`
          : `शिक्षक "${teacher.name}" को पुनः सक्रिय (Reactivate) किया गया।`
      );
      setActionTeacher(null);
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'स्थिति बदलने में विफल।');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Open Delete Candidate with Dependency Analysis
  const openDeleteModal = async (teacher: Teacher) => {
    setDeleteCandidate(teacher);
    setDeleteError(null);
    setIsCheckingDeps(true);
    try {
      const deps = await checkTeacherDependencies(teacher.id);
      setDeleteDependencies(deps);
    } catch (err) {
      console.warn('[RK STUDY CENTRE] Error analyzing teacher dependencies:', err);
      setDeleteDependencies({
        hasDependencies: (teacher.assignedCourseIds || []).length > 0,
        assignedCourses: [],
        assignedCourseTitles: [],
      });
    } finally {
      setIsCheckingDeps(false);
    }
  };

  // Execute Permanent Delete
  const handleConfirmPermanentDelete = async () => {
    if (!deleteCandidate) return;
    setIsProcessingDelete(true);
    setDeleteError(null);
    try {
      await deleteTeacher(deleteCandidate.id);
      setSuccessMessage(`शिक्षक "${deleteCandidate.name}" को स्थायी रूप से हटा दिया गया।`);
      setDeleteCandidate(null);
      setDeleteDependencies(null);
      await loadData();
    } catch (err: any) {
      setDeleteError(err.message || 'शिक्षक हटाने में विफल।');
    } finally {
      setIsProcessingDelete(false);
    }
  };

  // Subject multi-select toggle helper
  const toggleSubjectSelection = (subjectId: string, isEditing: boolean) => {
    if (isEditing) {
      setEditForm((prev) => {
        const exists = prev.subjectIds.includes(subjectId);
        const newIds = exists ? prev.subjectIds.filter((id) => id !== subjectId) : [...prev.subjectIds, subjectId];
        return { ...prev, subjectIds: newIds };
      });
    } else {
      setAddForm((prev) => {
        const exists = prev.subjectIds.includes(subjectId);
        const newIds = exists ? prev.subjectIds.filter((id) => id !== subjectId) : [...prev.subjectIds, subjectId];
        return { ...prev, subjectIds: newIds };
      });
    }
  };

  // Class multi-select toggle helper
  const toggleClassSelection = (classId: ClassLevel, isEditing: boolean) => {
    if (isEditing) {
      setEditForm((prev) => {
        const exists = prev.classLevels.includes(classId);
        const newClasses = exists ? prev.classLevels.filter((c) => c !== classId) : [...prev.classLevels, classId];
        return { ...prev, classLevels: newClasses };
      });
    } else {
      setAddForm((prev) => {
        const exists = prev.classLevels.includes(classId);
        const newClasses = exists ? prev.classLevels.filter((c) => c !== classId) : [...prev.classLevels, classId];
        return { ...prev, classLevels: newClasses };
      });
    }
  };

  // Course multi-select toggle helper
  const toggleCourseSelection = (courseId: string, isEditing: boolean) => {
    if (isEditing) {
      setEditForm((prev) => {
        const exists = prev.assignedCourseIds?.includes(courseId);
        const newCourses = exists
          ? (prev.assignedCourseIds || []).filter((id) => id !== courseId)
          : [...(prev.assignedCourseIds || []), courseId];
        return { ...prev, assignedCourseIds: newCourses };
      });
    } else {
      setAddForm((prev) => {
        const exists = prev.assignedCourseIds?.includes(courseId);
        const newCourses = exists
          ? (prev.assignedCourseIds || []).filter((id) => id !== courseId)
          : [...(prev.assignedCourseIds || []), courseId];
        return { ...prev, assignedCourseIds: newCourses };
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-3 border border-amber-200">
              <GraduationCap className="w-3.5 h-3.5 text-amber-700" />
              <span>शिक्षक एवं संकाय प्रबंधन (Step 6H)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              शिक्षक प्रबंधन (Teachers)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              आर.के. स्टडी सेंटर के सभी शिक्षकों की डायरेक्टरी, विषय विशेषज्ञता, एवं बैच असाइनमेंट।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
              title="रीलोड करें"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
            </button>
            <button
              onClick={() => {
                setAddFormError(null);
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-98"
            >
              <PlusCircle className="w-5 h-5" />
              <span>नया शिक्षक जोड़ें</span>
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 flex items-center justify-between gap-3 text-sm font-bold">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="text-2xl font-black text-slate-900">{stats.totalTeachers}</div>
            <div className="text-xs font-bold text-slate-500 mt-1">कुल शिक्षक (Faculty)</div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
            <div className="text-2xl font-black text-emerald-800">{stats.activeTeachers}</div>
            <div className="text-xs font-bold text-emerald-600 mt-1">सक्रिय शिक्षक (Active)</div>
          </div>
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
            <div className="text-2xl font-black text-amber-800">{stats.inactiveTeachers}</div>
            <div className="text-xs font-bold text-amber-600 mt-1">अक्रिय शिक्षक (Inactive)</div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 col-span-2 sm:col-span-1">
            <div className="text-2xl font-black text-indigo-800">{stats.allAssignedCourses}</div>
            <div className="text-xs font-bold text-indigo-600 mt-1">सक्रिय बैच आवंटन (Batches)</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 flex-wrap">
          {/* Live Search Box */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="शिक्षक का नाम, विषय, फोन अथवा ईमेल खोजें..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
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

          {/* Subject Filter */}
          <div className="shrink-0 min-w-[160px]">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">सभी विषय (All Subjects)</option>
              {uniqueSubjects.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div className="shrink-0 min-w-[150px]">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">सभी कक्षाएं (Class 9-12)</option>
              {CLASSES_METADATA.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.hindiName})
                </option>
              ))}
            </select>
          </div>

          {/* Course/Batch Filter */}
          <div className="shrink-0 min-w-[160px]">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">सभी बैच (All Batches)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.batchName})
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl shrink-0 overflow-x-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              सभी ({teachers.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              सक्रिय ({stats.activeTeachers})
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'inactive'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              अक्रिय ({stats.inactiveTeachers})
            </button>
          </div>
        </div>
      </div>

      {/* Teacher List / Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-600" />
            <span>शिक्षक संकाय सूची</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              {filteredTeachers.length} शिक्षक प्रदर्शित
            </span>
          </h3>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-amber-600 animate-spin mx-auto" />
            <p className="text-slate-600 font-bold text-sm">शिक्षक संकाय डेटा लोड हो रहा है...</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border-2 border-dashed border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-800">कोई शिक्षक नहीं मिला</h4>
            <p className="text-slate-500 text-sm max-w-md mx-auto font-medium">
              {searchQuery
                ? `खोज क्वेरी "${searchQuery}" के लिए कोई परिणाम नहीं मिला।`
                : 'वर्तमान में इस फ़िल्टर के अनुसार कोई शिक्षक पंजीकृत नहीं है।'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterSubject('all');
                setFilterClass('all');
                setFilterCourse('all');
                setFilterStatus('all');
              }}
              className="px-4 py-2 bg-amber-50 text-amber-800 font-bold text-xs rounded-xl hover:bg-amber-100 transition-colors cursor-pointer"
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
                    <th className="py-4 px-6">शिक्षक का नाम (Teacher)</th>
                    <th className="py-4 px-6">संपर्क विवरण (Contact)</th>
                    <th className="py-4 px-6">विशेषज्ञ विषय (Subjects)</th>
                    <th className="py-4 px-6">कक्षाएं (Classes)</th>
                    <th className="py-4 px-6">आवंटित बैच (Assigned Courses)</th>
                    <th className="py-4 px-6">स्थिति (Status)</th>
                    <th className="py-4 px-6 text-right">कार्रवाई (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-semibold">
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Qualification */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 font-black flex items-center justify-center text-sm shrink-0 border border-amber-200">
                            {teacher.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-black text-slate-900">{teacher.name}</div>
                            {teacher.qualification && (
                              <div className="text-xs text-slate-500 font-normal">
                                {teacher.qualification}
                                {teacher.experienceYears ? ` • ${teacher.experienceYears} वर्ष अनुभव` : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-6 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{teacher.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {teacher.email ? (
                            <span>{teacher.email}</span>
                          ) : (
                            <span className="text-slate-400 italic">ईमेल दर्ज नहीं (वैकल्पिक)</span>
                          )}
                        </div>
                      </td>

                      {/* Subjects */}
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {(teacher.subjectNames || []).length > 0 ? (
                            teacher.subjectNames.map((sName, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-100"
                              >
                                {sName}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs">कोई विषय नहीं</span>
                          )}
                        </div>
                      </td>

                      {/* Classes */}
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {(teacher.classLevels || []).map((cId) => {
                            const cMeta = CLASSES_METADATA.find((c) => c.id === cId);
                            return (
                              <span
                                key={cId}
                                className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200"
                              >
                                {cMeta ? cMeta.name : cId}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Assigned Batches */}
                      <td className="py-4 px-6">
                        {(teacher.assignedCourseIds || []).length > 0 ? (
                          <div className="space-y-1">
                            {teacher.assignedCourseIds.map((cId) => {
                              const foundCourse = courses.find((c) => c.id === cId);
                              return (
                                <div
                                  key={cId}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 block truncate max-w-xs"
                                >
                                  <BookOpen className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>{foundCourse ? `${foundCourse.title} (${foundCourse.batchName})` : cId}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">कोई बैच नहीं</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                            teacher.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              teacher.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <span>{teacher.status === 'active' ? 'सक्रिय (Active)' : 'अक्रिय (Inactive)'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(teacher)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                            title="संपादित करें (Edit)"
                          >
                            <Pencil className="w-4 h-4 text-slate-600" />
                          </button>

                          {/* Toggle Active / Inactive Button */}
                          <button
                            onClick={() => {
                              setActionError(null);
                              setActionTeacher(teacher);
                            }}
                            className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                              teacher.status === 'active'
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                            }`}
                            title={teacher.status === 'active' ? 'अक्रिय करें (Deactivate)' : 'सक्रिय करें (Reactivate)'}
                          >
                            {teacher.status === 'active' ? (
                              <UserX className="w-4 h-4 text-amber-600" />
                            ) : (
                              <UserCheck className="w-4 h-4 text-emerald-600" />
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => openDeleteModal(teacher)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                            title="हटाएं (Delete with Dependency Check)"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD TEACHER MODAL                                                */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border-2 border-slate-200 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">नया शिक्षक जोड़ें (Add Teacher)</h3>
                  <p className="text-xs text-slate-500 font-medium">पोर्टल में नया संकाय सदस्य एवं विषय विशेषज्ञ पंजीकृत करें</p>
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

            <form onSubmit={handleAddTeacherSubmit} className="space-y-5">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">मूलभूत जानकारी (Basic Information)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      शिक्षक का नाम (Teacher Name) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={addForm.name}
                      onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                      placeholder="उदा. प्रो. आर. के. वर्मा (Er. R.K. Verma)"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      मोबाइल नंबर (10-Digit Mobile) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={addForm.phone}
                        onChange={(e) => setAddForm({ ...addForm, phone: e.target.value.replace(/\D/g, '') })}
                        placeholder="9876543210"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      ईमेल पता (Email - <span className="text-slate-400">वैकल्पिक</span>)
                    </label>
                    <input
                      type="email"
                      value={addForm.email || ''}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      placeholder="teacher@rkstudy.in"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                  </div>

                  {/* Qualification */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">योग्यता (Qualification)</label>
                    <input
                      type="text"
                      value={addForm.qualification || ''}
                      onChange={(e) => setAddForm({ ...addForm, qualification: e.target.value })}
                      placeholder="उदा. M.Sc. Mathematics, B.Ed"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                  </div>

                  {/* Experience in Years */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">अनुभव (Teaching Experience in Years)</label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={addForm.experienceYears ?? ''}
                      onChange={(e) => setAddForm({ ...addForm, experienceYears: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                      placeholder="उदा. 8"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Teaching Information: Classes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>कक्षाएं (Taught Classes) <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] text-slate-400 font-normal">कम से कम एक कक्षा चुनें</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CLASSES_METADATA.map((c) => {
                    const isSelected = addForm.classLevels.includes(c.id);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => toggleClassSelection(c.id, false)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {c.name} ({c.hindiName})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Teaching Information: Subjects */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>विषय विशेषज्ञता (Subjects) <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] text-slate-400 font-normal">एक या अधिक विषय चुनें</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200">
                  {uniqueSubjects.map((s) => {
                    const isSelected = addForm.subjectIds.includes(s.name);
                    return (
                      <button
                        type="button"
                        key={s.name}
                        onClick={() => toggleSubjectSelection(s.name, false)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer truncate ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Teaching Information: Courses / Batches */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>कोर्स एवं बैच आवंटन (Course / Batch Assignments)</span>
                  <span className="text-[11px] text-slate-400 font-normal">वैकल्पिक</span>
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200">
                  {courses.map((c) => {
                    const isSelected = (addForm.assignedCourseIds || []).includes(c.id);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => toggleCourseSelection(c.id, false)}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{c.title} ({c.batchName})</span>
                        <span className="text-[10px] opacity-80 shrink-0 ml-2">₹{c.discountedPrice}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Radio */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">प्रारंभिक स्थिति (Initial Status)</label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={addForm.status === 'active'}
                      onChange={() => setAddForm({ ...addForm, status: 'active' })}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>सक्रिय (Active - अध्यापन के लिए उपलब्ध)</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={addForm.status === 'inactive'}
                      onChange={() => setAddForm({ ...addForm, status: 'inactive' })}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>अक्रिय (Inactive)</span>
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAdd ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>सुरक्षित किया जा रहा है...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>शिक्षक जोड़ें (Save Teacher)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT TEACHER MODAL                                               */}
      {/* ========================================================================= */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border-2 border-slate-200 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">शिक्षक विवरण संपादित करें (Edit Teacher)</h3>
                  <p className="text-xs text-slate-500 font-medium">शिक्षक का नाम, फोन, विषय एवं बैच आवंटन अपडेट करें</p>
                </div>
              </div>
              <button
                onClick={() => setEditingTeacher(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message inside modal */}
            {editFormError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{editFormError}</span>
              </div>
            )}

            <form onSubmit={handleEditTeacherSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">
                    शिक्षक का नाम <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Mobile */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    मोबाइल नंबर <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">+91</span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value.replace(/\D/g, '') })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    ईमेल पता (<span className="text-slate-400">वैकल्पिक</span>)
                  </label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="teacher@rkstudy.in"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Qualification */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">योग्यता (Qualification)</label>
                  <input
                    type="text"
                    value={editForm.qualification || ''}
                    onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Experience in Years */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">अनुभव (Years)</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={editForm.experienceYears ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, experienceYears: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Classes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700">कक्षाएं (Taught Classes) *</label>
                <div className="flex flex-wrap gap-2">
                  {CLASSES_METADATA.map((c) => {
                    const isSelected = editForm.classLevels.includes(c.id);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => toggleClassSelection(c.id, true)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {c.name} ({c.hindiName})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subjects */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700">विषय विशेषज्ञता (Subjects) *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200">
                  {uniqueSubjects.map((s) => {
                    const isSelected = editForm.subjectIds.includes(s.name);
                    return (
                      <button
                        type="button"
                        key={s.name}
                        onClick={() => toggleSubjectSelection(s.name, true)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer truncate ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Courses */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700">कोर्स एवं बैच आवंटन (Course Assignments)</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200">
                  {courses.map((c) => {
                    const isSelected = (editForm.assignedCourseIds || []).includes(c.id);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => toggleCourseSelection(c.id, true)}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{c.title} ({c.batchName})</span>
                        <span className="text-[10px] opacity-80 shrink-0 ml-2">₹{c.discountedPrice}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">स्थिति (Status)</label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="radio"
                      name="editStatus"
                      value="active"
                      checked={editForm.status === 'active'}
                      onChange={() => setEditForm({ ...editForm, status: 'active' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>सक्रिय (Active)</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="radio"
                      name="editStatus"
                      value="inactive"
                      checked={editForm.status === 'inactive'}
                      onChange={() => setEditForm({ ...editForm, status: 'inactive' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>अक्रिय (Inactive)</span>
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>अपडेट हो रहा है...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>विवरण अपडेट करें (Update)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: IN-APP DEACTIVATE / REACTIVATE CONFIRMATION MODAL                 */}
      {/* ========================================================================= */}
      {actionTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border-2 border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                  actionTeacher.status === 'active' ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
              >
                {actionTeacher.status === 'active' ? (
                  <UserX className="w-6 h-6" />
                ) : (
                  <UserCheck className="w-6 h-6" />
                )}
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900">
                  {actionTeacher.status === 'active' ? 'शिक्षक को अक्रिय करें?' : 'शिक्षक को पुनः सक्रिय करें?'}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  शिक्षक: <strong className="text-slate-800">{actionTeacher.name}</strong>
                </p>
              </div>
            </div>

            {/* Error in action modal */}
            {actionError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <p>
                {actionTeacher.status === 'active'
                  ? 'अक्रिय करने पर शिक्षक को नए कोर्स बैच में नहीं जोड़ा जा सकेगा, परंतु उनके पिछले अध्यापन व बैच रिकॉर्ड सुरक्षित रहेंगे।'
                  : 'पुनः सक्रिय करने पर शिक्षक सक्रिय सूची में दिखाई देंगे और नए बैच में अध्यापन के लिए उपलब्ध होंगे।'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={() => setActionTeacher(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={() =>
                  handleToggleStatus(actionTeacher, actionTeacher.status === 'active' ? 'inactive' : 'active')
                }
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-black transition-colors cursor-pointer disabled:opacity-50 ${
                  actionTeacher.status === 'active'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isProcessingAction ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>प्रक्रिया जारी है...</span>
                  </>
                ) : actionTeacher.status === 'active' ? (
                  <span>अक्रिय करें (Confirm Deactivate)</span>
                ) : (
                  <span>पुनः सक्रिय करें (Confirm Reactivate)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DEPENDENCY CHECK & PERMANENT DELETE CONFIRMATION MODAL            */}
      {/* ========================================================================= */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900">शिक्षक हटाने की पुष्टि</h4>
                <p className="text-xs text-slate-500 font-medium">
                  शिक्षक: <strong className="text-slate-800">{deleteCandidate.name}</strong>
                </p>
              </div>
            </div>

            {/* Error banner */}
            {deleteError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            {/* Dependency Analysis Notice */}
            {isCheckingDeps ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500">कोर्स व बैच निर्भरता की जांच हो रही है...</p>
              </div>
            ) : deleteDependencies?.hasDependencies ? (
              <div className="space-y-3 bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs">
                <div className="flex items-start gap-2.5 text-amber-900 font-black">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>सक्रिय बैच निर्भरता पाई गई (Active Course Dependencies):</span>
                </div>
                <p className="text-amber-800 font-medium">
                  यह शिक्षक वर्तमान में निम्नलिखित सक्रिय बैचों में नियुक्त हैं:
                </p>
                <ul className="list-disc pl-5 text-amber-900 space-y-1 font-bold">
                  {deleteDependencies.assignedCourseTitles.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
                <div className="p-2.5 rounded-xl bg-white/80 border border-amber-300 text-amber-950 font-bold">
                  ⚠️ अनुशंसित कदम: शिक्षक को हटाने के बजाय <strong>"अक्रिय (Deactivate)"</strong> करें ताकि छात्रों के बैच विवरण अप्रभावित रहें।
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <p>
                  यह शिक्षक किसी भी वर्तमान सक्रिय बैच से नहीं जुड़े हैं। इन्हें डेटाबेस से स्थायी रूप से हटाया जा सकता है।
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              {/* Option 1: Deactivate (Always recommended) */}
              <button
                type="button"
                disabled={isProcessingDelete}
                onClick={async () => {
                  await handleToggleStatus(deleteCandidate, 'inactive');
                  setDeleteCandidate(null);
                  setDeleteDependencies(null);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <Power className="w-4 h-4" />
                <span>अक्रिय करें (Deactivate Instead - अनुशंसित)</span>
              </button>

              {/* Option 2: Delete Permanently */}
              <button
                type="button"
                disabled={isProcessingDelete}
                onClick={handleConfirmPermanentDelete}
                className="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isProcessingDelete ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>हटाया जा रहा है...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>स्थायी रूप से हटाएं (Confirm Permanent Delete)</span>
                  </>
                )}
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                disabled={isProcessingDelete}
                onClick={() => {
                  setDeleteCandidate(null);
                  setDeleteDependencies(null);
                }}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
