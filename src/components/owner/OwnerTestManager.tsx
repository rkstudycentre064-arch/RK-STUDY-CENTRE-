/**
 * RK STUDY CENTRE - Practice Quiz & Online Test Manager (Step 6E)
 * 
 * Owner-only management module for:
 * 1. Practice Quiz (अभ्यास क्विज़)
 * 2. Online Test (ऑनलाइन परीक्षा / टेस्ट)
 * 
 * Enforces mandatory 4-tier content mapping: Class -> Subject -> Book -> Chapter.
 * Every question is linked directly to the test.
 * Preserves existing Step 5 student test system as the source of truth.
 */

import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Edit3,
  FileQuestion,
  GraduationCap,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  AlertTriangle,
  Eye,
  EyeOff,
  BookOpen,
  BookMarked,
  Bookmark,
  Check,
  HelpCircle,
  Sparkles,
  Save,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  CLASSES_METADATA,
  SUBJECTS,
  BOOKS,
  CHAPTERS,
} from '../../lib/constants';
import type { ClassLevel, TestItem, TestQuestion, TestType } from '../../types';
import {
  getAllInstitutionTests,
  saveTest,
  toggleTestPublishStatus,
  deleteTest,
  generateQuestionId,
} from '../../services/testService';

interface QuestionFormState {
  id?: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 0 | 1 | 2 | 3;
  explanation: string;
  marks: number;
}

const DEFAULT_QUESTION_STATE: QuestionFormState = {
  question: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOption: 0,
  explanation: '',
  marks: 1,
};

export function OwnerTestManager() {
  const { isOwner } = useAuth();

  // Tests catalog state
  const [tests, setTests] = useState<TestItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'online_test' | 'practice_quiz'>('all');
  const [filterClass, setFilterClass] = useState<string>('all');

  // Modal / Editor States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form: Test Metadata
  const [selectedClass, setSelectedClass] = useState<ClassLevel>('class-10');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [testType, setTestType] = useState<TestType>('online_test');
  const [testTitle, setTestTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [passingMarks, setPassingMarks] = useState(4);
  const [isNegativeMarking, setIsNegativeMarking] = useState(false);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [instructions, setInstructions] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  // Form: Questions List
  const [questionsList, setQuestionsList] = useState<TestQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionFormState>(DEFAULT_QUESTION_STATE);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  // Delete Modals
  const [testToDelete, setTestToDelete] = useState<TestItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [questionToDeleteIndex, setQuestionToDeleteIndex] = useState<number | null>(null);

  // Hierarchy calculations based on current selection
  const classSubjects = SUBJECTS.filter((s) => s.classLevel === selectedClass);
  const subjectBooks = selectedSubjectId ? BOOKS.filter((b) => b.subjectId === selectedSubjectId) : [];
  const bookChapters = selectedBookId ? CHAPTERS.filter((c) => c.bookId === selectedBookId) : [];

  // Auto-select first available options when parent tier changes
  useEffect(() => {
    if (classSubjects.length > 0 && (!selectedSubjectId || !classSubjects.some((s) => s.id === selectedSubjectId))) {
      setSelectedSubjectId(classSubjects[0].id);
    }
  }, [selectedClass, classSubjects, selectedSubjectId]);

  useEffect(() => {
    if (subjectBooks.length > 0 && (!selectedBookId || !subjectBooks.some((b) => b.id === selectedBookId))) {
      setSelectedBookId(subjectBooks[0].id);
    } else if (subjectBooks.length === 0) {
      setSelectedBookId('');
    }
  }, [selectedSubjectId, subjectBooks, selectedBookId]);

  useEffect(() => {
    if (bookChapters.length > 0 && (!selectedChapterId || !bookChapters.some((c) => c.id === selectedChapterId))) {
      setSelectedChapterId(bookChapters[0].id);
    } else if (bookChapters.length === 0) {
      setSelectedChapterId('');
    }
  }, [selectedBookId, bookChapters, selectedChapterId]);

  // Load tests on mount
  const loadTests = async () => {
    setIsLoading(true);
    try {
      const data = await getAllInstitutionTests();
      setTests(data);
    } catch (error: any) {
      setStatusMessage({
        type: 'error',
        text: 'टेस्ट लोड करने में समस्या उत्पन्न हुई: ' + (error.message || 'त्रुटि'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  // Open Create Test Editor
  const handleOpenCreateEditor = () => {
    setEditingTestId(null);
    setSelectedClass('class-10');
    setTestType('online_test');
    setTestTitle('');
    setDurationMinutes(15);
    setPassingMarks(4);
    setIsNegativeMarking(false);
    setDifficulty('Medium');
    setInstructions('प्रत्येक प्रश्न का एक ही सही उत्तर है। टेस्ट पूर्ण होने के बाद सबमिट बटन दबाएं।');
    setIsPublished(true);
    setQuestionsList([]);
    setCurrentQuestion(DEFAULT_QUESTION_STATE);
    setEditingQuestionIndex(null);
    setIsEditorOpen(true);
  };

  // Open Edit Test Editor
  const handleOpenEditEditor = (test: TestItem) => {
    setEditingTestId(test.id);
    setSelectedClass(test.classLevel);
    setSelectedSubjectId(test.subjectId);
    setSelectedBookId(test.bookId);
    setSelectedChapterId(test.chapterId);
    setTestType(test.type);
    setTestTitle(test.title);
    setDurationMinutes(test.durationMinutes || 0);
    setPassingMarks(test.passingMarks || 0);
    setIsNegativeMarking(Boolean(test.isNegativeMarking));
    setDifficulty(test.difficulty || 'Medium');
    setInstructions(test.instructions || '');
    setIsPublished(test.isPublished !== false);
    setQuestionsList(test.questions ? [...test.questions] : []);
    setCurrentQuestion(DEFAULT_QUESTION_STATE);
    setEditingQuestionIndex(null);
    setIsEditorOpen(true);
  };

  // Add or Update Question in current test
  const handleSaveQuestion = () => {
    if (!currentQuestion.question.trim()) {
      setStatusMessage({ type: 'error', text: 'कृपया प्रश्न का विवरण (Question text) दर्ज करें।' });
      return;
    }
    if (
      !currentQuestion.optionA.trim() ||
      !currentQuestion.optionB.trim() ||
      !currentQuestion.optionC.trim() ||
      !currentQuestion.optionD.trim()
    ) {
      setStatusMessage({ type: 'error', text: 'सभी 4 विकल्प (A, B, C, D) भरना अनिवार्य है।' });
      return;
    }

    const newQuestion: TestQuestion = {
      id: currentQuestion.id || generateQuestionId(),
      testId: editingTestId || 'temp_test',
      classId: selectedClass,
      subjectId: selectedSubjectId,
      bookId: selectedBookId,
      chapterId: selectedChapterId,
      question: currentQuestion.question.trim(),
      options: [
        currentQuestion.optionA.trim(),
        currentQuestion.optionB.trim(),
        currentQuestion.optionC.trim(),
        currentQuestion.optionD.trim(),
      ],
      correctOption: currentQuestion.correctOption,
      explanation: currentQuestion.explanation.trim(),
      marks: Math.max(1, Number(currentQuestion.marks) || 1),
      order: editingQuestionIndex !== null ? editingQuestionIndex + 1 : questionsList.length + 1,
    };

    if (editingQuestionIndex !== null) {
      // Update existing question
      const updatedList = [...questionsList];
      updatedList[editingQuestionIndex] = newQuestion;
      setQuestionsList(updatedList);
      setEditingQuestionIndex(null);
    } else {
      // Add new question
      setQuestionsList([...questionsList, newQuestion]);
    }

    setCurrentQuestion(DEFAULT_QUESTION_STATE);
  };

  // Start editing a specific question from the list
  const handleEditQuestionInList = (index: number) => {
    const q = questionsList[index];
    setCurrentQuestion({
      id: q.id,
      question: q.question,
      optionA: q.options[0],
      optionB: q.options[1],
      optionC: q.options[2],
      optionD: q.options[3],
      correctOption: (q.correctOption >= 0 && q.correctOption <= 3 ? (q.correctOption as 0 | 1 | 2 | 3) : 0),
      explanation: q.explanation || '',
      marks: q.marks || 1,
    });
    setEditingQuestionIndex(index);
  };

  // Remove question from test
  const handleConfirmDeleteQuestion = () => {
    if (questionToDeleteIndex === null) return;
    const updated = questionsList.filter((_, idx) => idx !== questionToDeleteIndex);
    // Re-index orders
    const reordered = updated.map((q, idx) => ({ ...q, order: idx + 1 }));
    setQuestionsList(reordered);
    setQuestionToDeleteIndex(null);
    if (editingQuestionIndex === questionToDeleteIndex) {
      setCurrentQuestion(DEFAULT_QUESTION_STATE);
      setEditingQuestionIndex(null);
    }
  };

  // Save full test to Firestore
  const handleSaveFullTest = async () => {
    if (!selectedClass || !selectedSubjectId || !selectedBookId || !selectedChapterId) {
      setStatusMessage({ type: 'error', text: 'कक्षा, विषय, पुस्तक एवं अध्याय (सभी 4 स्तर) चुनना अनिवार्य है।' });
      return;
    }
    if (!testTitle.trim()) {
      setStatusMessage({ type: 'error', text: 'कृपया टेस्ट का शीर्षक दर्ज करें।' });
      return;
    }
    if (questionsList.length === 0) {
      setStatusMessage({ type: 'error', text: 'टेस्ट में कम से कम 1 प्रश्न जोड़ना अनिवार्य है।' });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const subjectObj = SUBJECTS.find((s) => s.id === selectedSubjectId);
      const bookObj = BOOKS.find((b) => b.id === selectedBookId);
      const chapterObj = CHAPTERS.find((c) => c.id === selectedChapterId);

      await saveTest({
        id: editingTestId || undefined,
        classLevel: selectedClass,
        subjectId: selectedSubjectId,
        subjectName: subjectObj?.name || selectedSubjectId,
        bookId: selectedBookId,
        bookTitle: bookObj?.title || selectedBookId,
        chapterId: selectedChapterId,
        chapterTitle: chapterObj?.title || selectedChapterId,
        title: testTitle.trim(),
        type: testType,
        durationMinutes: testType === 'practice_quiz' ? 0 : Number(durationMinutes),
        passingMarks: Number(passingMarks),
        isNegativeMarking,
        difficulty,
        instructions,
        isPublished,
        questions: questionsList,
      });

      setStatusMessage({
        type: 'success',
        text: `टेस्ट "${testTitle}" सफलतापूर्वक सहेजा गया!`,
      });

      setIsEditorOpen(false);
      await loadTests();
    } catch (error: any) {
      setStatusMessage({
        type: 'error',
        text: 'टेस्ट सहेजने में त्रुटि: ' + (error.message || 'अज्ञात त्रुटि'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Publish Status
  const handleTogglePublish = async (test: TestItem) => {
    const newStatus = !(test.isPublished !== false);
    try {
      await toggleTestPublishStatus(test.id, newStatus);
      setTests((prev) =>
        prev.map((t) => (t.id === test.id ? { ...t, isPublished: newStatus } : t))
      );
      setStatusMessage({
        type: 'success',
        text: `टेस्ट स्थिति अद्यतन: ${newStatus ? 'प्रकाशित (Published)' : 'अप्रकाशित (Unpublished)'}`,
      });
    } catch (error: any) {
      setStatusMessage({
        type: 'error',
        text: 'स्थिति बदलने में त्रुटि: ' + (error.message || 'त्रुटि'),
      });
    }
  };

  // Delete Test
  const handleConfirmDeleteTest = async () => {
    if (!testToDelete) return;
    setIsDeleting(true);
    setStatusMessage(null);

    try {
      await deleteTest(testToDelete.id);
      setTests((prev) => prev.filter((t) => t.id !== testToDelete.id));
      setStatusMessage({
        type: 'success',
        text: `टेस्ट "${testToDelete.title}" सफलतापूर्वक हटा दिया गया।`,
      });
      setTestToDelete(null);
    } catch (error: any) {
      setStatusMessage({
        type: 'error',
        text: error.message || 'हटाने में त्रुटि उत्पन्न हुई।',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered tests calculation
  const filteredTests = tests.filter((t) => {
    if (filterType !== 'all') {
      if (filterType === 'practice_quiz' && t.type !== 'practice_quiz') return false;
      if (filterType === 'online_test' && t.type === 'practice_quiz') return false;
    }
    if (filterClass !== 'all' && t.classLevel !== filterClass) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchSubject = (t.subjectName || t.subjectId).toLowerCase().includes(q);
      const matchChapter = (t.chapterTitle || t.chapterId).toLowerCase().includes(q);
      if (!matchTitle && !matchSubject && !matchChapter) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner / Introduction */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>संचालक नियंत्रण केंद्र • Step 6E</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              प्रैक्टिस क्विज़ एवं ऑनलाइन टेस्ट प्रबंधन
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium max-w-3xl leading-relaxed">
              कक्षा 9वीं से 12वीं तक <strong>कक्षा → विषय → पुस्तक → अध्याय</strong> की 4-स्तरीय श्रृंखला
              के अनुसार वस्तुनिष्ठ प्रश्न (4 विकल्प) जोड़कर ऑनलाइन टेस्ट एवं प्रैक्टिस क्विज़ का सृजन व संपादन करें।
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={handleOpenCreateEditor}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>नया टेस्ट / क्विज़ जोड़ें</span>
            </button>
            <button
              onClick={loadTests}
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
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="टेस्ट का शीर्षक, विषय या अध्याय खोजें..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Type filter tabs */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl shrink-0 overflow-x-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              सभी ({tests.length})
            </button>
            <button
              onClick={() => setFilterType('online_test')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'online_test'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ऑनलाइन टेस्ट ({tests.filter((t) => t.type !== 'practice_quiz').length})
            </button>
            <button
              onClick={() => setFilterType('practice_quiz')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'practice_quiz'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              प्रैक्टिस क्विज़ ({tests.filter((t) => t.type === 'practice_quiz').length})
            </button>
          </div>

          {/* Class Filter */}
          <div className="shrink-0">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">सभी कक्षाएं (Class 9-12)</option>
              {CLASSES_METADATA.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.hindiName})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tests Catalog Table / Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span>उपलब्ध टेस्ट एवं क्विज़ सूची</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              {filteredTests.length} परिणाम
            </span>
          </h3>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
            <p className="text-slate-600 font-bold text-sm">टेस्ट सूची लोड हो रही है...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border-2 border-dashed border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <FileQuestion className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-800">कोई टेस्ट या क्विज़ नहीं मिला</h4>
            <p className="text-slate-500 text-sm max-w-md mx-auto font-medium">
              चुने गए फ़िल्टर के अनुसार कोई टेस्ट उपलब्ध नहीं है। ऊपर दिए गए बटन से नया टेस्ट जोड़ें।
            </p>
            <button
              onClick={handleOpenCreateEditor}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>नया टेस्ट बनाएं</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTests.map((test) => {
              const isQuiz = test.type === 'practice_quiz';
              const classMeta = CLASSES_METADATA.find((c) => c.id === test.classLevel);
              const questionCount = test.questions ? test.questions.length : test.totalQuestions;

              return (
                <div
                  key={test.id}
                  className="bg-white rounded-3xl border-2 border-slate-200 hover:border-indigo-400 transition-all shadow-xs hover:shadow-md p-6 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    {/* Header Tags */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                          isQuiz
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        {isQuiz ? <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> : <Award className="w-3.5 h-3.5 text-indigo-600" />}
                        <span>{isQuiz ? 'अभ्यास क्विज़' : 'ऑनलाइन टेस्ट'}</span>
                      </span>

                      {/* Publication Status Badge */}
                      <button
                        onClick={() => handleTogglePublish(test)}
                        title="प्रकाशन स्थिति बदलें (Toggle Publish)"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                          test.isPublished !== false
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {test.isPublished !== false ? (
                          <>
                            <Eye className="w-3 h-3 text-green-600" />
                            <span>प्रकाशित</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-amber-600" />
                            <span>ड्राफ्ट</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Test Title */}
                    <h4 className="text-lg font-black text-slate-900 leading-snug">
                      {test.title}
                    </h4>

                    {/* Hierarchy Path */}
                    <div className="space-y-1.5 pt-1 text-xs text-slate-600 font-semibold border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{classMeta?.name || test.classLevel}</span>
                        <span>•</span>
                        <span>{test.subjectName || test.subjectId}</span>
                      </div>
                      <div className="truncate text-slate-500">
                        अध्याय: {test.chapterTitle || test.chapterId}
                      </div>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-3 gap-2 py-2 bg-slate-50 rounded-2xl p-2.5 text-center text-xs">
                      <div>
                        <div className="font-black text-slate-900 text-sm">{questionCount}</div>
                        <div className="text-slate-500 font-bold">प्रश्न</div>
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-sm">{test.totalMarks}</div>
                        <div className="text-slate-500 font-bold">कुल अंक</div>
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-sm">
                          {isQuiz ? 'समयमुक्त' : `${test.durationMinutes}m`}
                        </div>
                        <div className="text-slate-500 font-bold">समय</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenEditEditor(test)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>संपादित करें</span>
                    </button>

                    <button
                      onClick={() => setTestToDelete(test)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                      title="हटाएं"
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
      {/* FULL TEST CREATION / EDITING MODAL                                        */}
      {/* ========================================================================= */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl my-8 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold">
                  <FileQuestion className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black">
                    {editingTestId ? 'टेस्ट का संपादन करें' : 'नया टेस्ट / क्विज़ बनाएं'}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    कक्षा, विषय, पुस्तक एवं अध्याय की 4-स्तरीय श्रृंखला के साथ प्रश्न तैयार करें
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

            {/* Modal Body - Scrollable */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
              {/* Section 1: Hierarchy Mapping */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-base font-black text-slate-900">
                    1. शैक्षणिक पदानुक्रम (Mandatory 4-Tier Hierarchy)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Class Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                      <span>कक्षा चुनें (Class) *</span>
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value as ClassLevel)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    >
                      {CLASSES_METADATA.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.hindiName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subject Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      <span>विषय चुनें (Subject) *</span>
                    </label>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    >
                      {classSubjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.hindiName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Book Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 flex items-center gap-1">
                      <BookMarked className="w-3.5 h-3.5 text-indigo-600" />
                      <span>पुस्तक चुनें (Book) *</span>
                    </label>
                    <select
                      value={selectedBookId}
                      onChange={(e) => setSelectedBookId(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    >
                      {subjectBooks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Chapter Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 flex items-center gap-1">
                      <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
                      <span>अध्याय चुनें (Chapter) *</span>
                    </label>
                    <select
                      value={selectedChapterId}
                      onChange={(e) => setSelectedChapterId(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    >
                      {bookChapters.map((c) => (
                        <option key={c.id} value={c.id}>
                          Ch {c.chapterNumber}: {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Test Details & Settings */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-base font-black text-slate-900">
                    2. टेस्ट का प्रकार एवं विवरण (Test Details & Rules)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Test Type selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700">टेस्ट का प्रकार (Type) *</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setTestType('online_test')}
                        className={`p-3.5 rounded-2xl border-2 text-left font-bold text-xs transition-all cursor-pointer ${
                          testType === 'online_test'
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="font-black text-sm mb-1 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-indigo-600" />
                          <span>ऑनलाइन टेस्ट</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block leading-tight">
                          निर्धारित समय सीमा, वास्तविक परीक्षा अनुभव
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTestType('practice_quiz')}
                        className={`p-3.5 rounded-2xl border-2 text-left font-bold text-xs transition-all cursor-pointer ${
                          testType === 'practice_quiz'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="font-black text-sm mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <span>प्रैक्टिस क्विज़</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block leading-tight">
                          समयमुक्त अभ्यास, त्वरित तैयारी
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700">टेस्ट का शीर्षक (Title) *</label>
                    <input
                      type="text"
                      value={testTitle}
                      onChange={(e) => setTestTitle(e.target.value)}
                      placeholder="उदा: रासायनिक अभिक्रियाएं - बहुविकल्पीय टेस्ट"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Duration */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>समय सीमा (मिनट)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      disabled={testType === 'practice_quiz'}
                      value={testType === 'practice_quiz' ? 0 : durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 disabled:opacity-50"
                    />
                  </div>

                  {/* Passing Marks */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                      <span>उत्तीर्ण अंक (Passing)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={passingMarks}
                      onChange={(e) => setPassingMarks(Number(e.target.value))}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700">कठिनाई (Difficulty)</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    >
                      <option value="Easy">आसान (Easy)</option>
                      <option value="Medium">मध्यम (Medium)</option>
                      <option value="Hard">कठिन (Hard)</option>
                    </select>
                  </div>

                  {/* Negative Marking */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700">नकारात्मक अंकन</label>
                    <div className="flex items-center h-10">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isNegativeMarking}
                          onChange={(e) => setIsNegativeMarking(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-bold text-slate-700">नेगेटिव मार्किंग (0.25)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">छात्रों हेतु निर्देश (Instructions)</label>
                  <textarea
                    rows={2}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="उदा: सभी प्रश्न अनिवार्य हैं। टेस्ट सबमिट करने से पहले उत्तरों की समीक्षा करें।"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white"
                  />
                </div>
              </div>

              {/* Section 3: Question Builder (Add/Edit Objective Questions) */}
              <div className="space-y-6 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-600" />
                    <h4 className="text-base font-black text-slate-900">
                      3. वस्तुनिष्ठ प्रश्न निर्माता (Objective Questions Builder)
                    </h4>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 text-xs font-black border border-indigo-200">
                    {questionsList.length} प्रश्न जोड़े गए
                  </span>
                </div>

                {/* Question Input Sub-Card */}
                <div className="bg-slate-50 p-6 rounded-3xl border-2 border-indigo-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                    <span className="text-xs font-black text-indigo-900 uppercase">
                      {editingQuestionIndex !== null
                        ? `प्रश्न #${editingQuestionIndex + 1} संपादित करें`
                        : `नया प्रश्न #${questionsList.length + 1} जोड़ें`}
                    </span>
                    {editingQuestionIndex !== null && (
                      <button
                        onClick={() => {
                          setEditingQuestionIndex(null);
                          setCurrentQuestion(DEFAULT_QUESTION_STATE);
                        }}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        संपादक रद्द करें
                      </button>
                    )}
                  </div>

                  {/* Question Text */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700">प्रश्न का पाठ (Question) *</label>
                    <textarea
                      rows={2}
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                      placeholder="उदा: 'श्रम विभाजन और जाति प्रथा' पाठ के लेखक कौन हैं?"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* 4 Options Grid */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700">
                      4 विकल्प एवं सही उत्तर का चयन करें (Select the correct option radio) *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Option A */}
                      <div
                        className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-colors ${
                          currentQuestion.correctOption === 0
                            ? 'border-emerald-500 bg-emerald-50/60'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="correctOptionRadio"
                          checked={currentQuestion.correctOption === 0}
                          onChange={() => setCurrentQuestion({ ...currentQuestion, correctOption: 0 })}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="font-black text-xs text-slate-500 w-5">A:</span>
                        <input
                          type="text"
                          value={currentQuestion.optionA}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, optionA: e.target.value })}
                          placeholder="विकल्प A का विवरण"
                          className="flex-1 bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
                        />
                      </div>

                      {/* Option B */}
                      <div
                        className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-colors ${
                          currentQuestion.correctOption === 1
                            ? 'border-emerald-500 bg-emerald-50/60'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="correctOptionRadio"
                          checked={currentQuestion.correctOption === 1}
                          onChange={() => setCurrentQuestion({ ...currentQuestion, correctOption: 1 })}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="font-black text-xs text-slate-500 w-5">B:</span>
                        <input
                          type="text"
                          value={currentQuestion.optionB}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, optionB: e.target.value })}
                          placeholder="विकल्प B का विवरण"
                          className="flex-1 bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
                        />
                      </div>

                      {/* Option C */}
                      <div
                        className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-colors ${
                          currentQuestion.correctOption === 2
                            ? 'border-emerald-500 bg-emerald-50/60'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="correctOptionRadio"
                          checked={currentQuestion.correctOption === 2}
                          onChange={() => setCurrentQuestion({ ...currentQuestion, correctOption: 2 })}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="font-black text-xs text-slate-500 w-5">C:</span>
                        <input
                          type="text"
                          value={currentQuestion.optionC}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, optionC: e.target.value })}
                          placeholder="विकल्प C का विवरण"
                          className="flex-1 bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
                        />
                      </div>

                      {/* Option D */}
                      <div
                        className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-colors ${
                          currentQuestion.correctOption === 3
                            ? 'border-emerald-500 bg-emerald-50/60'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="correctOptionRadio"
                          checked={currentQuestion.correctOption === 3}
                          onChange={() => setCurrentQuestion({ ...currentQuestion, correctOption: 3 })}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="font-black text-xs text-slate-500 w-5">D:</span>
                        <input
                          type="text"
                          value={currentQuestion.optionD}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, optionD: e.target.value })}
                          placeholder="विकल्प D का विवरण"
                          className="flex-1 bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Marks & Explanation */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-700">अंक (Marks)</label>
                      <input
                        type="number"
                        min="1"
                        value={currentQuestion.marks}
                        onChange={(e) =>
                          setCurrentQuestion({ ...currentQuestion, marks: Math.max(1, Number(e.target.value)) })
                        }
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-xs font-black text-slate-700">उत्तर की व्याख्या / हल (वैकल्पिक)</label>
                      <input
                        type="text"
                        value={currentQuestion.explanation}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                        placeholder="उदा: डॉ. भीमराव अंबेडकर ने 1936 में जाति प्रथा पर ऐतिहासिक व्याख्यान तैयार किया था।"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveQuestion}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm cursor-pointer transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        {editingQuestionIndex !== null ? 'प्रश्न में सुधार सहेजें' : 'प्रश्न सूची में जोड़ें'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Added Questions List Accordion / Review */}
                {questionsList.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-xs font-black text-slate-600 uppercase tracking-wider">
                      वर्तमान में जोड़े गए प्रश्न ({questionsList.length}):
                    </div>

                    <div className="space-y-2.5">
                      {questionsList.map((q, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start justify-between gap-4 hover:border-slate-300 transition-colors"
                        >
                          <div className="space-y-2 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-900 font-black text-xs flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-sm font-black text-slate-900">{q.question}</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                              {(q.options || []).map((opt, optIdx) => (
                                <div
                                  key={optIdx}
                                  className={`p-2 rounded-xl truncate ${
                                    optIdx === q.correctOption
                                      ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                                      : 'bg-slate-50 text-slate-600'
                                  }`}
                                >
                                  <span className="font-black mr-1">{['A', 'B', 'C', 'D'][optIdx]}:</span>
                                  {opt}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditQuestionInList(idx)}
                              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                              title="प्रश्न संपादित करें"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuestionToDeleteIndex(idx)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                              title="प्रश्न हटाएं"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    सहेजने के बाद तुरंत प्रकाशित करें (Publish immediately for students)
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleSaveFullTest}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>सहेजा जा रहा है...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingTestId ? 'परिवर्तन सहेजें' : 'टेस्ट सहेजें एवं पूर्ण करें'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEST DELETE CONFIRMATION MODAL                                            */}
      {/* ========================================================================= */}
      {testToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900">टेस्ट हटाने की पुष्टि करें</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                क्या आप वाकई इस टेस्ट को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1 font-semibold text-slate-700">
              <div><strong className="text-slate-900">शीर्षक:</strong> {testToDelete.title}</div>
              <div><strong className="text-slate-900">प्रकार:</strong> {testToDelete.type === 'practice_quiz' ? 'अभ्यास क्विज़' : 'ऑनलाइन टेस्ट'}</div>
              <div><strong className="text-slate-900">कक्षा:</strong> {testToDelete.classLevel}</div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTestToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTest}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'हटाया जा रहा है...' : 'हाँ, टेस्ट हटाएं'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUESTION DELETE CONFIRMATION MODAL                                        */}
      {/* ========================================================================= */}
      {questionToDeleteIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900">प्रश्न हटाएं?</h3>
              <p className="text-xs text-slate-500">
                क्या आप प्रश्न #{questionToDeleteIndex + 1} को हटाना चाहते हैं?
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuestionToDeleteIndex(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                नहीं
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteQuestion}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer"
              >
                हाँ, हटाएं
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
