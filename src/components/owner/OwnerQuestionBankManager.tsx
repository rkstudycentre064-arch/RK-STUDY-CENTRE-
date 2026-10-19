/**
 * RK STUDY CENTRE - Question Bank, PYQ Bank & Model Papers Manager (Step 6D)
 * 
 * Owner-only management module for:
 * 1. Question Bank (प्रश्न बैंक)
 * 2. PYQ Bank (पिछले वर्षों के प्रश्न)
 * 3. Model Papers (मॉडल पेपर)
 * 
 * Enforces mandatory 4-tier content mapping: Class -> Subject -> Book -> Chapter.
 * Never saves content using only chapterId or subjectId.
 * Reuses the existing 'studyMaterials' Firestore collection and Storage infrastructure.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  FileQuestion,
  FileText,
  Plus,
  Upload,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  ExternalLink,
  X,
  Calendar,
  GraduationCap,
  BookOpen,
  BookMarked,
  Bookmark,
  Layers,
  Save,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  CLASSES_METADATA,
  SUBJECTS,
  BOOKS,
  CHAPTERS,
} from '../../lib/constants';
import type { ClassLevel, StudyMaterialItem, StudyMaterialType } from '../../types';
import {
  uploadStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,
  replaceStudyMaterialFile,
  checkDuplicateMaterial,
  getQuestionsAndPapers,
  formatBytes,
} from '../../services/studyMaterialService';

type SectionFilterType = 'all' | 'question_bank' | 'pyq' | 'model_paper';

export function OwnerQuestionBankManager() {
  const { isOwner, user } = useAuth();

  // Selected hierarchy for new resource upload
  const [selectedClass, setSelectedClass] = useState<ClassLevel>('class-10');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');

  // Form fields
  const [resourceType, setResourceType] = useState<StudyMaterialType>('question_bank');
  const [title, setTitle] = useState<string>('');
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [description, setDescription] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [externalLink, setExternalLink] = useState<string>('');
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');

  // Upload status states
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<StudyMaterialItem | null>(null);

  // List of existing resources
  const [resources, setResources] = useState<StudyMaterialItem[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState<boolean>(true);
  const [listErrorMessage, setListErrorMessage] = useState<string | null>(null);

  // Filter & Search states
  const [typeFilter, setTypeFilter] = useState<SectionFilterType>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Delete Confirmation Modal state
  const [itemToDelete, setItemToDelete] = useState<StudyMaterialItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Edit Modal state
  const [itemToEdit, setItemToEdit] = useState<StudyMaterialItem | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editYear, setEditYear] = useState<string>('');
  const [editType, setEditType] = useState<StudyMaterialType>('question_bank');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive' | 'archived'>('active');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  // File Replacement State
  const [isReplacingFile, setIsReplacingFile] = useState<boolean>(false);
  const [replaceProgress, setReplaceProgress] = useState<number>(0);
  const [replacementSuccess, setReplacementSuccess] = useState<boolean>(false);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Derive dependent hierarchy based on selections
  const availableSubjects = SUBJECTS.filter((s) => s.classLevel === selectedClass);
  const availableBooks = selectedSubjectId
    ? BOOKS.filter((b) => b.subjectId === selectedSubjectId)
    : [];
  const availableChapters = selectedBookId
    ? CHAPTERS.filter((c) => c.bookId === selectedBookId)
    : [];

  // Auto-select first subject when class changes
  useEffect(() => {
    if (availableSubjects.length > 0) {
      setSelectedSubjectId(availableSubjects[0].id);
    } else {
      setSelectedSubjectId('');
    }
  }, [selectedClass]);

  // Auto-select first book when subject changes
  useEffect(() => {
    if (availableBooks.length > 0) {
      setSelectedBookId(availableBooks[0].id);
    } else {
      setSelectedBookId('');
    }
  }, [selectedSubjectId]);

  // Auto-select first chapter when book changes
  useEffect(() => {
    if (availableChapters.length > 0) {
      setSelectedChapterId(availableChapters[0].id);
    } else {
      setSelectedChapterId('');
    }
  }, [selectedBookId]);

  // Load existing Question Banks, PYQs, and Model Papers
  const loadResources = async () => {
    setIsLoadingResources(true);
    setListErrorMessage(null);
    try {
      const items = await getQuestionsAndPapers(['question_bank', 'pyq', 'model_paper']);
      setResources(items);
    } catch (err: any) {
      console.error('[RK STUDY CENTRE] Error fetching questions & papers:', err);
      setListErrorMessage('संसाधन सूची लोड करने में समस्या हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsLoadingResources(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadSuccessMessage(null);
    setUploadErrorMessage(null);
    setDuplicateWarning(null);

    const files = e.target.files;
    if (!files || files.length === 0) {
      setSelectedFile(null);
      return;
    }

    const file = files[0];
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadErrorMessage('कृपया केवल PDF (.pdf) प्रारूप की फाइल ही चुनें।');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 50MB max limit
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadErrorMessage('फाइल का आकार 50 MB से कम होना चाहिए।');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    let titleToUse = title;
    if (!titleToUse) {
      const cleanName = file.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ');
      titleToUse = cleanName;
      setTitle(cleanName);
    }

    // Duplicate check
    if (selectedClass && selectedSubjectId && selectedBookId && selectedChapterId) {
      const dup = await checkDuplicateMaterial(
        selectedClass,
        selectedSubjectId,
        selectedBookId,
        selectedChapterId,
        titleToUse
      );
      if (dup) {
        setDuplicateWarning(dup);
      }
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadSuccessMessage(null);
    setUploadErrorMessage(null);
    setDuplicateWarning(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setUploadErrorMessage('कृपया केवल PDF (.pdf) प्रारूप की फाइल ही चुनें।');
        return;
      }
      setSelectedFile(file);
      let titleToUse = title;
      if (!titleToUse) {
        const cleanName = file.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ');
        titleToUse = cleanName;
        setTitle(cleanName);
      }

      // Duplicate check
      if (selectedClass && selectedSubjectId && selectedBookId && selectedChapterId) {
        const dup = await checkDuplicateMaterial(
          selectedClass,
          selectedSubjectId,
          selectedBookId,
          selectedChapterId,
          titleToUse
        );
        if (dup) {
          setDuplicateWarning(dup);
        }
      }
    }
  };

  // Submit Upload Form
  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadSuccessMessage(null);
    setUploadErrorMessage(null);

    if (!isOwner) {
      setUploadErrorMessage('केवल अधिकृत Owner ही सामग्री अपलोड कर सकते हैं।');
      return;
    }

    // Validation
    if (!selectedClass || !selectedSubjectId || !selectedBookId || !selectedChapterId) {
      setUploadErrorMessage('कृपया Class, Subject, Book और Chapter चारों का चयन अनिवार्य रूप से करें।');
      return;
    }

    if (!title.trim()) {
      setUploadErrorMessage('कृपया सामग्री का शीर्षक (Title) दर्ज करें।');
      return;
    }

    if (uploadMode === 'file' && !selectedFile) {
      setUploadErrorMessage('कृपया अपलोड करने के लिए एक PDF फाइल चुनें।');
      return;
    }

    if (uploadMode === 'link' && !externalLink.trim()) {
      setUploadErrorMessage('कृपया बाहरी लिंक (External Link) दर्ज करें।');
      return;
    }

    const currentSubject = availableSubjects.find((s) => s.id === selectedSubjectId);
    const currentBook = availableBooks.find((b) => b.id === selectedBookId);
    const currentChapter = availableChapters.find((c) => c.id === selectedChapterId);

    if (!currentSubject || !currentBook || !currentChapter) {
      setUploadErrorMessage('चयनित पदानुक्रम अमान्य है। कृपया पुनः चुनें।');
      return;
    }

    const parsedYear = year ? parseInt(year, 10) : undefined;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (uploadMode === 'file' && selectedFile) {
        const result = await uploadStudyMaterial({
          classLevel: selectedClass,
          subjectId: selectedSubjectId,
          subjectName: currentSubject.name,
          bookId: selectedBookId,
          bookTitle: currentBook.title,
          chapterId: selectedChapterId,
          chapterTitle: currentChapter.title,
          title: title.trim(),
          materialType: resourceType,
          year: parsedYear,
          description: description.trim(),
          file: selectedFile,
          uploadedByEmail: user?.email || undefined,
          onProgress: (pct) => setUploadProgress(pct),
        });

        setUploadSuccessMessage(
          `संसाधन "${result.title}" सफलतापूर्वक अपलोड एवं डेटाबेस में सुरक्षित कर दिया गया है!`
        );
      } else {
        // Handle External Link
        const materialId = `sm_q_link_${Date.now().toString(36)}`;
        const newMaterial: StudyMaterialItem = {
          id: materialId,
          classLevel: selectedClass,
          subjectId: selectedSubjectId,
          subjectName: currentSubject.name,
          bookId: selectedBookId,
          bookTitle: currentBook.title,
          chapterId: selectedChapterId,
          chapterTitle: currentChapter.title,
          title: title.trim(),
          type: resourceType,
          year: parsedYear,
          description: description.trim(),
          fileUrl: externalLink.trim(),
          downloadUrl: externalLink.trim(),
          fileFormat: 'LINK',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await updateStudyMaterial(materialId, newMaterial);
        setUploadSuccessMessage(`लिंक संसाधन "${title}" सफलतापूर्वक सुरक्षित कर दिया गया है!`);
      }

      // Reset form
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setExternalLink('');
      setDuplicateWarning(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Reload list
      await loadResources();
    } catch (err: any) {
      console.error('[RK STUDY CENTRE] Resource upload error:', err);
      setUploadErrorMessage(err.message || 'अपलोड विफल रहा। कृपया पुनः प्रयास करें।');
    } finally {
      setIsUploading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: StudyMaterialItem) => {
    setItemToEdit(item);
    setEditTitle(item.title);
    setEditYear(item.year ? item.year.toString() : '');
    setEditType(item.type);
    setEditDescription(item.description || '');
    setEditStatus(item.status || 'active');
    setEditError(null);
    setReplacementSuccess(false);
  };

  // Submit Edit Form
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToEdit) return;

    if (!editTitle.trim()) {
      setEditError('शीर्षक खाली नहीं हो सकता।');
      return;
    }

    setIsSavingEdit(true);
    setEditError(null);

    try {
      const parsedYear = editYear ? parseInt(editYear, 10) : undefined;
      await updateStudyMaterial(itemToEdit.id, {
        title: editTitle.trim(),
        type: editType,
        year: parsedYear,
        description: editDescription.trim(),
        status: editStatus,
      });

      // Update local state
      setResources((prev) =>
        prev.map((r) =>
          r.id === itemToEdit.id
            ? {
                ...r,
                title: editTitle.trim(),
                type: editType,
                year: parsedYear,
                description: editDescription.trim(),
                status: editStatus,
                updatedAt: new Date().toISOString(),
              }
            : r
        )
      );

      setItemToEdit(null);
    } catch (err: any) {
      console.error('[RK STUDY CENTRE] Error updating resource:', err);
      setEditError(err.message || 'परिवर्तन सुरक्षित करने में विफल।');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle Replace File
  const handleReplaceFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && itemToEdit) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setEditError('कृपया केवल PDF फाइल चुनें।');
        return;
      }

      setIsReplacingFile(true);
      setReplaceProgress(0);
      setReplacementSuccess(false);

      try {
        await replaceStudyMaterialFile(itemToEdit.id, file, (pct) => {
          setReplaceProgress(pct);
        });
        setReplacementSuccess(true);
        setEditError(null);
        // Refresh resources after a small delay
        setTimeout(loadResources, 1000);
      } catch (err: any) {
        setEditError(err.message || 'फाइल बदलने में त्रुटि हुई।');
      } finally {
        setIsReplacingFile(false);
      }
    }
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteStudyMaterial(itemToDelete);
      // Remove from local list
      setResources((prev) => prev.filter((m) => m.id !== itemToDelete.id));
      setItemToDelete(null);
    } catch (err: any) {
      console.error('[RK STUDY CENTRE] Error deleting resource:', err);
      setDeleteError(err.message || 'सामग्री हटाने में समस्या आई।');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper label for resource types
  const getResourceTypeBadge = (type: StudyMaterialType, itemYear?: number) => {
    switch (type) {
      case 'question_bank':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <FileQuestion className="w-3.5 h-3.5 text-amber-700" />
            प्रश्न बैंक (Question Bank)
          </span>
        );
      case 'pyq':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-700" />
            PYQ Bank {itemYear ? `(${itemYear})` : ''}
          </span>
        );
      case 'model_paper':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
            <Bookmark className="w-3.5 h-3.5 text-rose-700" />
            मॉडल पेपर {itemYear ? `(${itemYear})` : ''}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            {type}
          </span>
        );
    }
  };

  // Filtered resources
  const filteredResources = resources.filter((item) => {
    // Type filter
    if (typeFilter !== 'all' && item.type !== typeFilter) {
      return false;
    }
    // Class filter
    if (classFilter !== 'all') {
      const itemClass = item.classLevel || item.classId;
      if (itemClass !== classFilter) return false;
    }
    // Subject filter
    if (subjectFilter !== 'all' && item.subjectId !== subjectFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubject = (item.subjectName || item.subjectId || '').toLowerCase().includes(q);
      const matchBook = (item.bookTitle || item.bookId || '').toLowerCase().includes(q);
      const matchChapter = (item.chapterTitle || item.chapterId || '').toLowerCase().includes(q);
      const matchYear = item.year ? item.year.toString().includes(q) : false;
      return matchTitle || matchSubject || matchBook || matchChapter || matchYear;
    }
    return true;
  });

  return (
    <div className="space-y-10">
      {/* Section Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Question Bank, PYQ Bank & Model Papers प्रबंधन
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                चरण 6D: कक्षा, विषय, पुस्तक एवं अध्याय से जुड़े प्रश्न बैंक, पिछले वर्षों के प्रश्न तथा मॉडल पेपर का नियंत्रण केंद्र
              </p>
            </div>
          </div>
          <button
            onClick={loadResources}
            disabled={isLoadingResources}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingResources ? 'animate-spin' : ''}`} />
            <span>रिफ्रेश सूची</span>
          </button>
        </div>

        {/* Informational Alert Box */}
        <div className="mt-4 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 text-xs sm:text-sm leading-relaxed">
          <p className="font-semibold flex items-center gap-2 mb-1">
            <GraduationCap className="w-4 h-4 text-indigo-700 shrink-0" />
            <span>अनिवार्य 4-स्तरीय मैपिंग नियम (Mandatory 4-Tier Mapping):</span>
          </p>
          प्रत्येक प्रश्न बैंक, PYQ तथा मॉडल पेपर को अनिवार्य रूप से <strong>कक्षा → विषय → पुस्तक → अध्याय</strong> से जोड़ा जाता है।
          छात्रों को सामग्री केवल तभी प्रदर्शित होगी जब चारों आईडी सटीक रूप से मेल खाएंगी।
        </div>
      </div>

      {/* 1. Upload Form Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-black">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              नया संसाधन अपलोड करें (Add Question Bank / PYQ / Model Paper)
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              चारों स्तरों का चयन करें, शीर्षक व वर्ष भरें और PDF फाइल अपलोड करें।
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {uploadSuccessMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm font-bold leading-relaxed">{uploadSuccessMessage}</div>
          </div>
        )}

        {/* Error Alert with Retry */}
        {uploadErrorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-sm font-bold leading-relaxed">{uploadErrorMessage}</div>
            </div>
            <button
              onClick={() => setUploadErrorMessage(null)}
              className="text-rose-700 hover:text-rose-900 text-xs font-black underline cursor-pointer shrink-0"
            >
              हटाएं
            </button>
          </div>
        )}

        <form onSubmit={handleSubmitUpload} className="space-y-6">
          {/* Upload Mode Toggle */}
          <div className="flex items-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                uploadMode === 'file'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>PDF फ़ाइल अपलोड करें</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('link')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                uploadMode === 'link'
                  ? 'border-purple-600 bg-purple-50 text-purple-700'
                  : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              <span>बाहरी लिंक जोड़ें (External Link)</span>
            </button>
          </div>

          {/* Resource Type Selector */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
              संसाधन प्रकार चुनें (Select Resource Type) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setResourceType('question_bank')}
                className={`p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all cursor-pointer ${
                  resourceType === 'question_bank'
                    ? 'border-amber-600 bg-amber-50 text-amber-950 font-black shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${resourceType === 'question_bank' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <FileQuestion className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm">प्रश्न बैंक (Question Bank)</div>
                  <div className="text-xs opacity-75 font-normal">महत्वपूर्ण प्रश्न संग्रह</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setResourceType('pyq')}
                className={`p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all cursor-pointer ${
                  resourceType === 'pyq'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-black shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${resourceType === 'pyq' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm">PYQ Bank</div>
                  <div className="text-xs opacity-75 font-normal">पिछले वर्षों के प्रश्न पत्र</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setResourceType('model_paper')}
                className={`p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all cursor-pointer ${
                  resourceType === 'model_paper'
                    ? 'border-rose-600 bg-rose-50 text-rose-950 font-black shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${resourceType === 'model_paper' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm">मॉडल पेपर (Model Papers)</div>
                  <div className="text-xs opacity-75 font-normal">बोर्ड परीक्षा अभ्यास पत्र</div>
                </div>
              </button>
            </div>
          </div>

          {/* 4-Tier Hierarchical Dropdowns */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>अनिवार्य पदानुक्रम चयन (Mandatory Hierarchy Selection)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Class */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  1. कक्षा (Class) *
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value as ClassLevel)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CLASSES_METADATA.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.hindiName} ({cls.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  2. विषय (Subject) *
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={availableSubjects.length === 0}
                >
                  {availableSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.hindiName} ({sub.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Book */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  3. पुस्तक (Book) *
                </label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={availableBooks.length === 0}
                >
                  {availableBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.hindiTitle || b.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Chapter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  4. अध्याय (Chapter) *
                </label>
                <select
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={availableChapters.length === 0}
                >
                  {availableChapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      अध्याय {c.chapterNumber}: {c.hindiTitle || c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Title & Year Input Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                संसाधन शीर्षक (Resource Title) *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="उदा. 2024 बोर्ड परीक्षा साल्व्ड प्रश्न पत्र (Official Solved Paper)"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                वर्ष / Year (वैकल्पिक)
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="उदा. 2024 या 2025"
                min="2010"
                max="2035"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              संक्षिप्त विवरण (Description / Notes - Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="उदा. बिहार बोर्ड 2024 का आधिकारिक प्रश्न पत्र समाधान सहित।"
              rows={2}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Automatic RK STUDY CENTRE Branding Feature Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-950 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black text-sm shadow-xs">
              ✨
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-slate-900 text-sm">
                ऑटोमैटिक RK STUDY CENTRE ब्रांडिंग व वॉटरमार्क इंजन सक्रिय (Auto-Branding Active)
              </p>
              <p className="text-slate-600 leading-relaxed">
                अपलोड की गई कोई भी PDF (प्रश्न बैंक, मॉडल पेपर, आदि) स्वतः <strong>RK STUDY CENTRE (प्रिंस सर)</strong> के आधिकारिक वॉटरमार्क, हेडर रिबन एवं प्रिंट-रेडी लेआउट में बदल जाएगी।
              </p>
            </div>
          </div>

          {/* Duplicate Warning */}
          {duplicateWarning && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <p className="font-bold text-sm">सावधानी: संभावित डुप्लीकेट संसाधन (Duplicate Warning)</p>
                <p className="mt-0.5">
                  इस अध्याय के लिए "<strong>{duplicateWarning.title}</strong>" नाम का संसाधन पहले से मौजूद है। 
                  कृपया सुनिश्चित करें कि आप वही फाइल दोबारा अपलोड नहीं कर रहे हैं।
                </p>
              </div>
            </div>
          )}

          {/* File or Link Picker */}
          {uploadMode === 'file' ? (
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
                PDF फाइल चुनें (Select PDF File) *
              </label>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                  selectedFile
                    ? 'border-emerald-400 bg-emerald-50/50'
                    : 'border-slate-300 bg-slate-50 hover:bg-indigo-50/40 hover:border-indigo-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-black text-slate-900 break-all">
                        {selectedFile.name}
                      </div>
                      <div className="text-xs text-slate-500 font-bold">
                        आकार: {formatBytes(selectedFile.size)} • PDF प्रारूप
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="ml-4 p-1.5 rounded-lg bg-slate-200 hover:bg-rose-100 text-slate-600 hover:text-rose-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-indigo-600 mx-auto" />
                    <div className="text-sm font-black text-slate-800">
                      PDF फाइल चुनने के लिए यहां क्लिक करें या ड्रैग-एंड-ड्रॉप करें
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      अधिकतम आकार: 50 MB (केवल PDF समर्थित)
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
                बाहरी URL/लिंक दर्ज करें (Enter External Link) *
              </label>
              <div className="relative">
                <ExternalLink className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  placeholder="उदा. https://drive.google.com/file/d/..."
                  required
                  className="w-full bg-white border border-slate-300 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-2 ml-1">
                गूगल ड्राइव, ड्रॉपबॉक्स या किसी अन्य वेब पोर्टल का सीधा PDF लिंक यहाँ पेस्ट करें।
              </p>
            </div>
          )}

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  फाइल Firebase Storage पर अपलोड हो रही है...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-200 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isUploading || !selectedFile || !title.trim()}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>अपलोड एवं सुरक्षित हो रहा है...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>संसाधन अपलोड करें (Upload & Save)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Existing Resources List Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              उपलब्ध प्रश्न बैंक, PYQ एवं मॉडल पेपर सूची ({filteredResources.length})
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              यहां से आप किसी भी संसाधन का विवरण संपादित कर सकते हैं अथवा आवश्यकता पड़ने पर सुरक्षित रूप से हटा सकते हैं।
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="खोजें (शीर्षक, विषय, वर्ष)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Section Filter: All / Question Bank / PYQ / Model Paper */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
              प्रकार:
            </span>
            {(['all', 'question_bank', 'pyq', 'model_paper'] as SectionFilterType[]).map((tab) => {
              const labels: Record<SectionFilterType, string> = {
                all: 'सभी',
                question_bank: 'प्रश्न बैंक',
                pyq: 'PYQ',
                model_paper: 'मॉडल पेपर',
              };
              const isSelected = typeFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setTypeFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Class Filter */}
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">सभी कक्षाएं</option>
              {CLASSES_METADATA.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.hindiName}</option>
              ))}
            </select>

            {/* Subject Filter */}
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">सभी विषय</option>
              {Array.from(new Set(resources.map(r => r.subjectId))).map(sid => {
                const s = SUBJECTS.find(sub => sub.id === sid);
                return <option key={sid} value={sid}>{s?.hindiName || s?.name || sid}</option>;
              })}
            </select>

            {(typeFilter !== 'all' || classFilter !== 'all' || subjectFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setTypeFilter('all');
                  setClassFilter('all');
                  setSubjectFilter('all');
                  setSearchQuery('');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        {listErrorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-sm font-bold flex items-center justify-between">
            <span>{listErrorMessage}</span>
            <button
              onClick={loadResources}
              className="text-xs underline font-black hover:text-rose-950 cursor-pointer"
            >
              पुनः प्रयास करें
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoadingResources ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-600">संसाधन लोड हो रहे हैं...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="py-14 text-center space-y-3 border-2 border-dashed border-slate-200 rounded-2xl">
            <FileQuestion className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-base font-black text-slate-800">
              कोई संसाधन नहीं मिला
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              इस फिल्टर के अनुसार कोई सामग्री उपलब्ध नहीं है। ऊपर दिए गए फॉर्म से नई सामग्री जोड़ें।
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {filteredResources.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getResourceTypeBadge(item.type, item.year)}
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-blue-100 text-blue-900">
                      {CLASSES_METADATA.find((c) => c.id === (item.classLevel || item.classId))?.hindiName || item.classLevel}
                    </span>
                    {item.fileSize && (
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-600">
                        {item.fileSize}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-black text-slate-900 leading-snug">
                    {item.title}
                  </h4>

                  {/* 4-tier Breadcrumb Trail */}
                  <div className="text-xs text-slate-600 font-semibold flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-800">
                      {item.subjectName || item.subjectId}
                    </span>
                    <span>→</span>
                    <span className="text-slate-600">
                      {item.bookTitle || item.bookId}
                    </span>
                    <span>→</span>
                    <span className="text-slate-600">
                      {item.chapterTitle || item.chapterId}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-500 italic max-w-2xl">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Actions: View PDF, Edit, Delete */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {(item.fileUrl || item.downloadUrl) && (
                    <a
                      href={item.fileUrl || item.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>PDF देखें</span>
                    </a>
                  )}

                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700 transition-colors cursor-pointer"
                    title="संपादित करें"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>संपादित करें</span>
                  </button>

                  <button
                    onClick={() => {
                      setItemToDelete(item);
                      setDeleteError(null);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 transition-colors cursor-pointer"
                    title="हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>हटाएं</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {itemToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  संसाधन संपादित करें (Edit Resource)
                </h3>
              </div>
              <button
                onClick={() => setItemToEdit(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  प्रकार (Resource Type) *
                </label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as StudyMaterialType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="question_bank">प्रश्न बैंक (Question Bank)</option>
                  <option value="pyq">PYQ Bank (पिछले वर्षों के प्रश्न)</option>
                  <option value="model_paper">मॉडल पेपर (Model Papers)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  शीर्षक (Title) *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  वर्ष / Year (वैकल्पिक)
                </label>
                <input
                  type="number"
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                  placeholder="उदा. 2024"
                  min="2010"
                  max="2035"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  विवरण (Description - Optional)
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <span className="font-bold">संबद्ध पदानुक्रम:</span>{' '}
                {itemToEdit.classLevel || itemToEdit.classId} → {itemToEdit.subjectName || itemToEdit.subjectId} → {itemToEdit.chapterTitle || itemToEdit.chapterId}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setItemToEdit(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit || !editTitle.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingEdit ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>परिवर्तन सुरक्षित करें</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Explicit Delete Safety Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  हटाने की पुष्टि करें (Confirm Delete)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  यह क्रिया अपरिवर्तनीय है।
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
              <div className="font-bold text-sm text-slate-900 break-all">
                {itemToDelete.title}
              </div>
              <div>
                <span className="font-bold text-slate-500">प्रकार:</span> {itemToDelete.type}
              </div>
              <div>
                <span className="font-bold text-slate-500">पदानुक्रम:</span> {itemToDelete.classLevel || itemToDelete.classId} → {itemToDelete.subjectName || itemToDelete.subjectId} → {itemToDelete.chapterTitle || itemToDelete.chapterId}
              </div>
              {itemToDelete.fileSize && (
                <div>
                  <span className="font-bold text-slate-500">फाइल आकार:</span> {itemToDelete.fileSize}
                </div>
              )}
            </div>

            {deleteError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold leading-relaxed">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setItemToDelete(null);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>हटाया जा रहा है...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>हाँ, हटाएं (Confirm Delete)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
