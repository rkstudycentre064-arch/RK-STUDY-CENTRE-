/**
 * RK STUDY CENTRE - Courses & Target Batches Manager (Step 6F)
 * 
 * Owner-only management module for:
 * 1. Viewing all courses & batches
 * 2. Creating a new course
 * 3. Editing existing course metadata & pricing
 * 4. Deleting a selected course with explicit confirmation protection
 * 5. Toggling enrollment status (Open / Closed)
 * 
 * Strictly preserves Class isolation: Class 9, Class 10, Class 11, Class 12.
 */

import React, { useState, useEffect } from 'react';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  X,
  Calendar,
  GraduationCap,
  Users,
  ShieldCheck,
  Save,
  Check,
  Sparkles,
  DollarSign,
  Layers,
  Lock,
  Unlock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CLASSES_METADATA } from '../../lib/constants';
import type { ClassLevel, Course } from '../../types';
import {
  getAllCourses,
  saveCourse,
  toggleCourseEnrollment,
  deleteCourse,
  type SaveCoursePayload,
} from '../../services/courseService';
import {
  getAllStudents,
  unenrollStudentFromCourse,
  type SafeStudentProfile,
} from '../../services/studentService';

export function OwnerCourseManager() {
  const { isOwner } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<SafeStudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterEnrollment, setFilterEnrollment] = useState<'all' | 'open' | 'closed'>('all');

  // Modal / Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Enrolled Students Viewer Modal
  const [viewingEnrolledCourse, setViewingEnrolledCourse] = useState<Course | null>(null);
  const [isUnenrolling, setIsUnenrolling] = useState(false);

  // Form Fields
  const [selectedClass, setSelectedClass] = useState<ClassLevel>('class-10');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [batchName, setBatchName] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [subjectsCoveredText, setSubjectsCoveredText] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [totalLectures, setTotalLectures] = useState(120);
  const [price, setPrice] = useState(1999);
  const [discountedPrice, setDiscountedPrice] = useState(799);
  const [enrollmentOpen, setEnrollmentOpen] = useState(true);
  const [startDate, setStartDate] = useState('');

  // Delete Modal State
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const [coursesData, studentsData] = await Promise.all([
        getAllCourses(true),
        getAllStudents().catch(() => []),
      ]);
      setCourses(coursesData);
      setStudents(studentsData);
    } catch (error: any) {
      setStatusMessage({
        type: 'error',
        text: 'कोर्सेज लोड करने में समस्या: ' + (error.message || 'त्रुटि'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [studentToUnenroll, setStudentToUnenroll] = useState<{ studentUid: string; courseId: string } | null>(null);

  const handleUnenrollStudentFromCourseModal = (studentUid: string, courseId: string) => {
    setStudentToUnenroll({ studentUid, courseId });
  };

  const handleConfirmUnenrollStudent = async () => {
    if (!studentToUnenroll) return;
    const { studentUid, courseId } = studentToUnenroll;
    setIsUnenrolling(true);
    try {
      await unenrollStudentFromCourse(studentUid, courseId);
      setStudents((prev) =>
        prev.map((s) => {
          if (s.uid === studentUid) {
            return {
              ...s,
              enrolledCourseIds: s.enrolledCourseIds.filter((id) => id !== courseId),
            };
          }
          return s;
        })
      );
      setStatusMessage({
        type: 'success',
        text: 'विद्यार्थी को कोर्स से सफलतापूर्वक हटाया गया।',
      });
      setStudentToUnenroll(null);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: 'कोर्स हटाने में त्रुटि: ' + (err.message || 'अज्ञात त्रुटि'),
      });
    } finally {
      setIsUnenrolling(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCourseId(null);
    setSelectedClass('class-10');
    setTitle('');
    setDescription('');
    setBatchName('प्रतिज्ञा बैच 2026-27');
    setInstructorName('RK STUDY CENTRE विशेषज्ञ शिक्षक दल');
    setSubjectsCoveredText('गणित, विज्ञान, सामाजिक विज्ञान, हिंदी, संस्कृत');
    setFeaturesText('दैनिक लाइव एवं रिकॉर्डेड कक्षाएं\nअध्यायवार हस्तलिखित नोट्स\nसाप्ताहिक ऑनलाइन टेस्ट\nशंका समाधान सत्र');
    setTotalLectures(120);
    setPrice(1999);
    setDiscountedPrice(799);
    setEnrollmentOpen(true);
    setStartDate('1 अक्टूबर 2026');
    setIsEditorOpen(true);
  };

  const handleOpenEditModal = (course: Course) => {
    setEditingCourseId(course.id);
    setSelectedClass(course.classLevel);
    setTitle(course.title);
    setDescription(course.description);
    setBatchName(course.batchName || '');
    setInstructorName(course.instructorName || '');
    setSubjectsCoveredText(course.subjectsCovered ? course.subjectsCovered.join(', ') : '');
    setFeaturesText(course.features ? course.features.join('\n') : '');
    setTotalLectures(course.totalLectures || 0);
    setPrice(course.price || 0);
    setDiscountedPrice(course.discountedPrice || 0);
    setEnrollmentOpen(course.enrollmentOpen !== false);
    setStartDate(course.startDate || '');
    setIsEditorOpen(true);
  };

  const handleSaveCourse = async () => {
    if (!selectedClass) {
      setStatusMessage({ type: 'error', text: 'कक्षा चुनना अनिवार्य है।' });
      return;
    }
    if (!title.trim()) {
      setStatusMessage({ type: 'error', text: 'कोर्स का शीर्षक दर्ज करें।' });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const subjects = subjectsCoveredText
        .split(/[,،\n]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const features = featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const payload: SaveCoursePayload = {
        id: editingCourseId || undefined,
        classLevel: selectedClass,
        title: title.trim(),
        description: description.trim(),
        batchName: batchName.trim(),
        instructorName: instructorName.trim(),
        subjectsCovered: subjects,
        features: features,
        totalLectures: Number(totalLectures) || 0,
        price: Number(price) || 0,
        discountedPrice: Number(discountedPrice) || 0,
        enrollmentOpen: Boolean(enrollmentOpen),
        startDate: startDate.trim(),
      };

      await saveCourse(payload);

      setStatusMessage({
        type: 'success',
        text: `कोर्स "${title}" सफलतापूर्वक सहेजा गया!`,
      });

      setIsEditorOpen(false);
      await loadCourses();
    } catch (error: any) {
      setStatusMessage({
        type: 'error',
        text: 'कोर्स सहेजने में त्रुटि: ' + (error.message || 'त्रुटि'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEnrollment = async (course: Course) => {
    const newStatus = !(course.enrollmentOpen !== false);
    try {
      await toggleCourseEnrollment(course.id, newStatus);
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, enrollmentOpen: newStatus } : c))
      );
      setStatusMessage({
        type: 'success',
        text: `कोर्स "${course.title}" का प्रवेश: ${newStatus ? 'खुला (Open)' : 'बंद (Closed)'}`,
      });
    } catch (error: any) {
      setStatusMessage({
        type: 'error',
        text: 'प्रवेश स्थिति बदलने में त्रुटि: ' + (error.message || 'त्रुटि'),
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    setStatusMessage(null);

    try {
      await deleteCourse(courseToDelete.id);
      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      setStatusMessage({
        type: 'success',
        text: `कोर्स "${courseToDelete.title}" सफलतापूर्वक हटा दिया गया।`,
      });
      setCourseToDelete(null);
    } catch (error: any) {
      setStatusMessage({
        type: 'error',
        text: error.message || 'कोर्स हटाने में त्रुटि उत्पन्न हुई।',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered courses
  const filteredCourses = courses.filter((course) => {
    if (filterClass !== 'all' && course.classLevel !== filterClass) return false;
    if (filterEnrollment === 'open' && course.enrollmentOpen === false) return false;
    if (filterEnrollment === 'closed' && course.enrollmentOpen !== false) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = course.title.toLowerCase().includes(q);
      const matchBatch = course.batchName?.toLowerCase().includes(q);
      const matchInstructor = course.instructorName?.toLowerCase().includes(q);
      if (!matchTitle && !matchBatch && !matchInstructor) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>संचालक नियंत्रण केंद्र • Step 6F</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              कोर्सेज एवं लक्ष्य बैच प्रबंधन (Courses)
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium max-w-3xl leading-relaxed">
              कक्षा 9वीं से 12वीं तक बोर्ड परीक्षा हेतु विशेष लक्ष्य बैचों का निर्माण, शुल्क निर्धारण, पाठ्यक्रम
              विवरण, शिक्षक आवंटन एवं प्रवेश स्थिति (Open / Closed) का सीधा प्रबंधन करें।
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>नया कोर्स जोड़ें</span>
            </button>
            <button
              onClick={loadCourses}
              title="रिफ्रेश करें"
              className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Status Message */}
        {statusMessage && (
          <div
            className={`mt-6 p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-bold border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="p-1 rounded-lg hover:bg-black/5 text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Catalog Search & Filters */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="कोर्स का शीर्षक, बैच या शिक्षक खोजें..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Class Filter */}
          <div className="shrink-0">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">सभी कक्षाएं (Class 9-12)</option>
              {CLASSES_METADATA.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.hindiName})
                </option>
              ))}
            </select>
          </div>

          {/* Enrollment Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl shrink-0">
            <button
              onClick={() => setFilterEnrollment('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filterEnrollment === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              सभी ({courses.length})
            </button>
            <button
              onClick={() => setFilterEnrollment('open')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filterEnrollment === 'open'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              प्रवेश चालू (Open)
            </button>
            <button
              onClick={() => setFilterEnrollment('closed')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filterEnrollment === 'closed'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              प्रवेश बंद
            </button>
          </div>
        </div>
      </div>

      {/* Courses List / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span>उपलब्ध कोर्सेज एवं बैच सूची</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              {filteredCourses.length} बैच
            </span>
          </h3>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
            <p className="text-slate-600 font-bold text-sm">कोर्स सूची लोड हो रही है...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border-2 border-dashed border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-800">कोई कोर्स नहीं मिला</h4>
            <p className="text-slate-500 text-sm max-w-md mx-auto font-medium">
              चुने गए फ़िल्टर के अनुसार कोई कोर्स उपलब्ध नहीं है। ऊपर दिए गए बटन से नया कोर्स बनाएं।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const classMeta = CLASSES_METADATA.find((c) => c.id === course.classLevel);
              const isOpen = course.enrollmentOpen !== false;

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl border-2 border-slate-200 hover:border-indigo-400 transition-all shadow-xs hover:shadow-md p-6 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3.5">
                    {/* Header Tags */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-black border border-blue-200">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                        <span>{classMeta?.name || course.classLevel}</span>
                      </span>

                      {/* Enrollment status badge toggle */}
                      <button
                        onClick={() => handleToggleEnrollment(course)}
                        title="प्रवेश स्थिति बदलें (Toggle Enrollment)"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                          isOpen
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {isOpen ? (
                          <>
                            <Unlock className="w-3 h-3 text-emerald-600" />
                            <span>प्रवेश चालू</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span>प्रवेश बंद</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Batch Name & Title */}
                    <div>
                      <div className="text-xs font-black text-indigo-600 uppercase tracking-wider mb-1">
                        {course.batchName || 'लक्ष्य बैच'}
                      </div>
                      <h4 className="text-lg font-black text-slate-900 leading-snug">
                        {course.title}
                      </h4>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 font-medium">
                      {course.description}
                    </p>

                    {/* Subjects covered */}
                    {course.subjectsCovered && course.subjectsCovered.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {course.subjectsCovered.slice(0, 4).map((sub, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold"
                          >
                            {sub}
                          </span>
                        ))}
                        {course.subjectsCovered.length > 4 && (
                          <span className="px-1.5 py-0.5 text-[11px] font-bold text-slate-500">
                            +{course.subjectsCovered.length - 4} और
                          </span>
                        )}
                      </div>
                    )}

                    {/* Pricing & Lectures */}
                    <div className="bg-slate-50 rounded-2xl p-3 flex items-center justify-between border border-slate-100">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-black text-slate-900">
                            ₹{course.discountedPrice || course.price}
                          </span>
                          {course.discountedPrice && course.price > course.discountedPrice && (
                            <span className="text-xs text-slate-400 line-through font-bold">
                              ₹{course.price}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">प्रवेश शुल्क</div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-black text-slate-800">
                          {course.totalLectures || 0}+
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">कुल लेक्चर्स</div>
                      </div>
                    </div>

                    {/* Enrolled Students Summary */}
                    {(() => {
                      const enrolledStudents = students.filter((s) => s.enrolledCourseIds.includes(course.id));
                      return (
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-blue-600" />
                            <span>नामांकित छात्र: <strong className="text-slate-900">{enrolledStudents.length}</strong></span>
                          </span>
                          {enrolledStudents.length > 0 && (
                            <button
                              onClick={() => setViewingEnrolledCourse(course)}
                              className="text-blue-700 hover:text-blue-900 font-extrabold cursor-pointer hover:underline text-[11px]"
                            >
                              सूची देखें ({enrolledStudents.length}) →
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenEditModal(course)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>संपादित करें</span>
                    </button>

                    <button
                      onClick={() => setCourseToDelete(course)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                      title="कोर्स हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>हटाएं</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* COURSE CREATE / EDIT MODAL                                               */}
      {/* ========================================================================= */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl my-8 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black">
                    {editingCourseId ? 'कोर्स विवरण संपादित करें' : 'नया लक्ष्य बैच / कोर्स बनाएं'}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    कक्षा, बैच नाम, शुल्क, शिक्षक एवं पाठ्यक्रम विवरण दर्ज करें
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Class */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    <span>कक्षा चुनें (Target Class) *</span>
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value as ClassLevel)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {CLASSES_METADATA.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.hindiName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Batch Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">बैच का नाम (Batch Name)</label>
                  <input
                    type="text"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    placeholder="उदा: प्रतिज्ञा बैच 2026-27"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">कोर्स का शीर्षक (Course Title) *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="उदा: Matric Board 2027: Mission 450+ Target Batch"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">कोर्स विवरण (Description)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="कोर्स के मुख्य उद्देश्य, पाठ्यक्रम और तैयारी रणनीति का संक्षिप्त विवरण..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white"
                />
              </div>

              {/* Instructor & Start Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">मार्गदर्शक शिक्षक / फैकल्टी</label>
                  <input
                    type="text"
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    placeholder="उदा: RK STUDY CENTRE Expert Faculty Panel"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">प्रारंभ तिथि / शेड्यूल</label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="उदा: 1 अक्टूबर 2026"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Subjects Covered */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">
                  शामिल विषय (Subjects Covered — अल्पविराम या कॉमा से अलग करें)
                </label>
                <input
                  type="text"
                  value={subjectsCoveredText}
                  onChange={(e) => setSubjectsCoveredText(e.target.value)}
                  placeholder="उदा: गणित, भौतिकी, रसायन विज्ञान, जीव विज्ञान, हिंदी"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              {/* Pricing & Total Lectures */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">मूल शुल्क (List Price ₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-emerald-800">ऑफर शुल्क (Discounted ₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={discountedPrice}
                    onChange={(e) => setDiscountedPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-emerald-300 text-emerald-900 rounded-xl text-xs font-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">कुल अनुमानित लेक्चर्स</label>
                  <input
                    type="number"
                    min="0"
                    value={totalLectures}
                    onChange={(e) => setTotalLectures(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Features list */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">
                  कोर्स की मुख्य सुविधाएं / विशेषताएं (प्रत्येक लाइन एक विशेषता)
                </label>
                <textarea
                  rows={3}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="दैनिक 2 घंटे इंटरएक्टिव लाइव कक्षाएं&#10;अध्यायवार हस्तलिखित नोट्स&#10;साप्ताहिक संडे मॉक टेस्ट"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>

              {/* Enrollment toggle */}
              <div className="pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enrollmentOpen}
                    onChange={(e) => setEnrollmentOpen(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-black text-slate-800">
                    प्रवेश खुला रखें (Enrollment is currently Open for students)
                  </span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={handleSaveCourse}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>सहेजा जा रहा है...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{editingCourseId ? 'परिवर्तन सहेजें' : 'कोर्स सहेजें'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                                 */}
      {/* ========================================================================= */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900">Are you sure you want to delete this course?</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                क्या आप वाकई इस कोर्स को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1 font-semibold text-slate-700">
              <div><strong className="text-slate-900">शीर्षक:</strong> {courseToDelete.title}</div>
              <div><strong className="text-slate-900">कक्षा:</strong> {courseToDelete.classLevel}</div>
              <div><strong className="text-slate-900">बैच:</strong> {courseToDelete.batchName}</div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel (रद्द करें)
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'हटाया जा रहा है...' : 'हाँ, कोर्स हटाएं'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ENROLLED STUDENTS VIEWER MODAL                                            */}
      {/* ========================================================================= */}
      {viewingEnrolledCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 shrink-0">
              <div>
                <span className="text-xs font-black px-2.5 py-1 rounded bg-blue-100 text-blue-900 uppercase">
                  बैच के नामांकित छात्र
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {viewingEnrolledCourse.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  बैच: {viewingEnrolledCourse.batchName} • कक्षा: {viewingEnrolledCourse.classLevel}
                </p>
              </div>
              <button
                onClick={() => setViewingEnrolledCourse(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {(() => {
                const enrolled = students.filter((s) =>
                  s.enrolledCourseIds.includes(viewingEnrolledCourse.id)
                );

                if (enrolled.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-500 font-medium bg-slate-50 rounded-2xl border border-slate-200">
                      इस कोर्स में अभी तक कोई विद्यार्थी नामांकित नहीं है।
                    </div>
                  );
                }

                return enrolled.map((student) => (
                  <div
                    key={student.uid}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <span>{student.displayName}</span>
                        {student.role === 'owner' && (
                          <span className="px-2 py-0.2 rounded bg-amber-100 text-amber-900 text-[10px] font-black">
                            संचालक
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        {student.email} {student.phoneNumber ? `• ${student.phoneNumber}` : ''}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        UID: {student.uid}
                      </div>
                    </div>

                    <button
                      onClick={() => handleUnenrollStudentFromCourseModal(student.uid, viewingEnrolledCourse.id)}
                      disabled={isUnenrolling}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      नामांकन हटाएं
                    </button>
                  </div>
                ));
              })()}
            </div>

            <div className="pt-2 flex justify-end shrink-0 border-t border-slate-100">
              <button
                onClick={() => setViewingEnrolledCourse(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-colors"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Unenrollment Modal */}
      <ConfirmModal
        isOpen={!!studentToUnenroll}
        onClose={() => setStudentToUnenroll(null)}
        onConfirm={handleConfirmUnenrollStudent}
        title="नामांकन हटाएँ (Unenroll Student)"
        message="क्या आप सचमुच विद्यार्थी को इस कोर्स से हटाना चाहते हैं?"
        confirmText="हाँ, हटाएँ (Unenroll)"
        cancelText="रद्द करें"
        variant="warning"
        isLoading={isUnenrolling}
        loadingText="हटाया जा रहा है..."
      />
    </div>
  );
}
