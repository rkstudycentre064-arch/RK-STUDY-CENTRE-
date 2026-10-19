import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  ExternalLink,
  BookOpen,
  FolderOpen,
  Layers,
  FileCheck,
  X,
  Search,
  Filter,
  Edit3,
  Loader2,
  Save,
  Upload,
} from 'lucide-react';
import type { ClassLevel, StudyMaterialItem, StudyMaterialType, Course } from '../../types';
import { CLASSES_METADATA, SUBJECTS, BOOKS, CHAPTERS } from '../../lib/constants';
import {
  uploadStudyMaterial,
  getAllFirestoreMaterials,
  deleteStudyMaterial,
  updateStudyMaterial,
  replaceStudyMaterialFile,
  checkDuplicateMaterial,
  formatBytes,
} from '../../services/studyMaterialService';
import { getAllCourses } from '../../services/courseService';
import { InAppPDFViewerModal, PDFDocumentData } from '../notes/InAppPDFViewerModal';
import { BrandingStatusWidget } from './BrandingStatusWidget';
import { useAuth } from '../../context/AuthContext';
import { ConfirmModal } from '../common/ConfirmModal';

export function OwnerStudyMaterialManager() {
  const { user } = useAuth();
  // Tab State
  const [activeTab, setActiveTab] = useState<'upload' | 'branding'>('upload');
  // Form State
  const [selectedClass, setSelectedClass] = useState<ClassLevel>('class-10');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [materialType, setMaterialType] = useState<StudyMaterialType>('notes');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [batchName, setBatchName] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [externalLink, setExternalLink] = useState<string>('');
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [pdfDocToView, setPdfDocToView] = useState<PDFDocumentData | null>(null);

  // Upload Status State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<StudyMaterialItem | null>(null);

  // Materials List State
  const [materials, setMaterials] = useState<StudyMaterialItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState<boolean>(false);
  
  // Combined Filters State
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterBatch, setFilterBatch] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Edit Modal State
  const [itemToEdit, setItemToEdit] = useState<StudyMaterialItem | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editCourseId, setEditCourseId] = useState<string>('');
  const [editBatchName, setEditBatchName] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive' | 'archived'>('active');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  // File Replacement State
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [isReplacingFile, setIsReplacingFile] = useState<boolean>(false);
  const [replaceProgress, setUploadReplaceProgress] = useState<number>(0);

  // Delete Modal State
  const [materialToDelete, setMaterialToDelete] = useState<StudyMaterialItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Load data on mount
  const loadMaterials = async () => {
    setIsLoadingMaterials(true);
    try {
      const [materialsData, coursesData] = await Promise.all([
        getAllFirestoreMaterials(),
        getAllCourses(true),
      ]);
      setMaterials(materialsData);
      setCourses(coursesData);
    } catch (err) {
      console.error('[RK STUDY CENTRE] Error loading owner data:', err);
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  // Derived filter options
  const availableSubjects = useMemo(() => {
    return SUBJECTS.filter((s) => s.classLevel === selectedClass);
  }, [selectedClass]);

  const availableBooks = useMemo(() => {
    return BOOKS.filter((b) => b.subjectId === selectedSubjectId && b.classLevel === selectedClass);
  }, [selectedSubjectId, selectedClass]);

  const availableChapters = useMemo(() => {
    return CHAPTERS.filter((c) => c.bookId === selectedBookId);
  }, [selectedBookId]);

  const uniqueSubjects = useMemo(() => {
    const ids = new Set(materials.map(m => m.subjectId).filter(id => !!id));
    return SUBJECTS.filter(s => ids.has(s.id));
  }, [materials]);

  const uniqueBatches = useMemo(() => {
    return Array.from(new Set(materials.map(m => m.batchName).filter(b => !!b)));
  }, [materials]);

  // Handlers
  const handleClassChange = (val: ClassLevel) => {
    setSelectedClass(val);
    setSelectedSubjectId('');
    setSelectedBookId('');
    setSelectedChapterId('');
  };

  const handleSubjectChange = (val: string) => {
    setSelectedSubjectId(val);
    setSelectedBookId('');
    setSelectedChapterId('');
  };

  const handleBookChange = (val: string) => {
    setSelectedBookId(val);
    setSelectedChapterId('');
  };

  const handleEditMaterial = (item: StudyMaterialItem) => {
    setItemToEdit(item);
    setEditTitle(item.title);
    setEditDescription(item.description || '');
    setEditCourseId(item.courseId || '');
    setEditBatchName(item.batchName || '');
    setEditStatus(item.status || 'active');
    setEditError(null);
    setReplacementFile(null);
  };

  const handleReplaceFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && itemToEdit) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setEditError('Please select a valid PDF file.');
        return;
      }
      setReplacementFile(file);
      setIsReplacingFile(true);
      setUploadReplaceProgress(0);
      try {
        await replaceStudyMaterialFile(itemToEdit.id, file, (progress) => {
          setUploadReplaceProgress(progress);
        });
        // Success
      } catch (err: any) {
        setEditError(err.message || 'File replacement failed.');
        setReplacementFile(null);
      } finally {
        setIsReplacingFile(false);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!itemToEdit) return;
    setIsSavingEdit(true);
    setEditError(null);
    try {
      await updateStudyMaterial(itemToEdit.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        courseId: editCourseId || undefined,
        batchName: editBatchName.trim() || undefined,
        status: editStatus,
      });
      setItemToEdit(null);
      loadMaterials();
    } catch (err: any) {
      setEditError(err.message || 'Update failed.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle File Pick
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setUploadError('केवल PDF फ़ाइलें ही स्वीकार की जाती हैं (Only PDF files are supported).');
        setSelectedFile(null);
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setUploadError('फ़ाइल का आकार 50 MB से कम होना चाहिए (Max allowed size is 50 MB).');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
      setUploadSuccess(false);

      // Auto-suggest title if empty
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  // Handle Upload Submission
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClass || !selectedSubjectId || !selectedBookId || !selectedChapterId) {
      setUploadError('कृपया Class, Subject, Book और Chapter का चयन पूर्ण करें।');
      return;
    }

    if (!title.trim()) {
      setUploadError('कृपया अध्ययन सामग्री का शीर्षक (Title) दर्ज करें।');
      return;
    }

    if (uploadMode === 'file' && !selectedFile) {
      setUploadError('कृपया अपलोड करने के लिए एक PDF फ़ाइल चुनें।');
      return;
    }

    if (uploadMode === 'link' && !externalLink.trim()) {
      setUploadError('कृपया बाहरी लिंक (External Link) दर्ज करें।');
      return;
    }

    const currentSubject = SUBJECTS.find((s) => s.id === selectedSubjectId);
    const currentBook = BOOKS.find((b) => b.id === selectedBookId);
    const currentChapter = CHAPTERS.find((c) => c.id === selectedChapterId);

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      if (uploadMode === 'file' && selectedFile) {
        await uploadStudyMaterial({
          classLevel: selectedClass,
          subjectId: selectedSubjectId,
          subjectName: currentSubject?.hindiName || currentSubject?.name || '',
          bookId: selectedBookId,
          bookTitle: currentBook?.hindiTitle || currentBook?.title || '',
          chapterId: selectedChapterId,
          chapterTitle: currentChapter?.hindiTitle || currentChapter?.title || '',
          courseId: selectedCourseId || undefined,
          batchName: batchName.trim() || undefined,
          title: title.trim(),
          materialType,
          description: description.trim(),
          file: selectedFile,
          uploadedByEmail: user?.email || 'rkstudycentre064@gmail.com',
          onProgress: (percent) => {
            setUploadProgress(percent);
          },
        });
      } else {
        // Handle External Link
        const materialId = `sm_link_${Date.now().toString(36)}`;
        const newMaterial: StudyMaterialItem = {
          id: materialId,
          slug: materialId,
          classLevel: selectedClass,
          classId: selectedClass,
          subjectId: selectedSubjectId,
          subjectName: currentSubject?.hindiName || currentSubject?.name || '',
          bookId: selectedBookId,
          bookTitle: currentBook?.hindiTitle || currentBook?.title || '',
          chapterId: selectedChapterId,
          chapterTitle: currentChapter?.hindiTitle || currentChapter?.title || '',
          ...(selectedCourseId ? { courseId: selectedCourseId } : {}),
          ...(batchName.trim() ? { batchName: batchName.trim() } : {}),
          title: title.trim(),
          type: materialType,
          description: description.trim(),
          fileUrl: externalLink.trim(),
          downloadUrl: externalLink.trim(),
          fileFormat: 'LINK',
          status: 'active',
          uploadedByEmail: user?.email || 'rkstudycentre064@gmail.com',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await updateStudyMaterial(materialId, newMaterial);
      }

      setUploadSuccess(true);
      setSelectedFile(null);
      setExternalLink('');
      setTitle('');
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Diagnosis Log (Step 5 of request)
      console.log(`[RK STUDY CENTRE] Step 5 SUCCESS: Storage upload confirmed AND Firestore document verified. Mapping applied: ${selectedClass} | ${selectedSubjectId} | ${selectedBookId} | ${selectedChapterId}`);
      
      // Refresh list
      loadMaterials();
    } catch (err: any) {
      console.error('[RK STUDY CENTRE] Upload failure diagnosis:', err);
      setUploadError(err.message || 'फ़ाइल अपलोड और सुरक्षित करने में त्रुटि हुई।');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Delete Confirmation
  const confirmDelete = async () => {
    if (!materialToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteStudyMaterial(materialToDelete);
      setMaterialToDelete(null);
      loadMaterials();
    } catch (err: any) {
      console.error('[RK STUDY CENTRE] Delete error:', err);
      setDeleteError(err.message || 'सामग्री हटाने में त्रुटि हुई।');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter materials for the table
  const filteredMaterials = materials.filter((m) => {
    const matchesClass = filterClass === 'all' || m.classLevel === filterClass || m.classId === filterClass;
    const matchesSubject = filterSubject === 'all' || m.subjectId === filterSubject;
    const matchesCourse = filterCourse === 'all' || m.courseId === filterCourse;
    const matchesBatch = filterBatch === 'all' || m.batchName === filterBatch;
    const matchesType = filterType === 'all' || m.type === filterType;
    const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.fileName && m.fileName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.subjectName && m.subjectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.batchName && m.batchName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesClass && matchesSubject && matchesCourse && matchesBatch && matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-10">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Step 6C • Study Material Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              अध्ययन सामग्री प्रबंधन एवं अपलोड
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              यहाँ से आप Class 9, 10, 11, एवं 12 के विद्यार्थियों के लिए विषय, पुस्तक एवं अध्याय-वार
              PDF नोट्स, प्रश्न बैंक और अध्ययन संसाधन सीधे सुरक्षित Firebase Storage व Firestore में अपलोड कर सकते हैं।
            </p>
          </div>
          <button
            onClick={loadMaterials}
            disabled={isLoadingMaterials}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors cursor-pointer self-start md:self-center shrink-0 border border-white/10"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingMaterials ? 'animate-spin' : ''}`} />
            <span>रिफ्रेश सूची</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm max-w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`px-5 py-3 rounded-xl text-sm font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'upload'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>सामग्री अपलोड एवं प्रबंधन (Upload & Manager)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`px-5 py-3 rounded-xl text-sm font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'branding'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>🛡️ PDF ब्रांडिंग ऑडिट रिपोर्ट (Branding Report)</span>
        </button>
      </div>

      {activeTab === 'branding' ? (
        <BrandingStatusWidget materials={materials} onRefresh={loadMaterials} />
      ) : (
        <>
          {/* Upload Form Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-black">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">
              नई अध्ययन सामग्री अपलोड करें (New PDF Upload)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              अनिवार्य मैपिंग: Class → Subject → Book → Chapter → Material Type
            </p>
          </div>
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          {/* Upload Mode Toggle */}
          <div className="flex items-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                uploadMode === 'file'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
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
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              <span>बाहरी लिंक जोड़ें (External Link)</span>
            </button>
          </div>

          {/* Mapping Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Class Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. कक्षा चुनें (Class) *
              </label>
              <select
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value as ClassLevel)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
              >
                {CLASSES_METADATA.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.hindiName} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. विषय चुनें (Subject) *
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
              >
                <option value="">-- विषय चुनें --</option>
                {availableSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.hindiName} ({s.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Book Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. पुस्तक चुनें (Book) *
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => handleBookChange(e.target.value)}
                disabled={!selectedSubjectId}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {selectedSubjectId ? '-- पुस्तक चुनें --' : '-- पहले विषय चुनें --'}
                </option>
                {availableBooks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.hindiTitle || b.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                4. अध्याय चुनें (Chapter) *
              </label>
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                disabled={!selectedBookId}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {selectedBookId ? '-- अध्याय चुनें --' : '-- पहले पुस्तक चुनें --'}
                </option>
                {availableChapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    अध्याय {c.chapterNumber}: {c.hindiTitle || c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Material Type, Title, Course & Batch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                5. सामग्री प्रकार (Type) *
              </label>
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value as StudyMaterialType)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
              >
                <option value="notes">1. Notes (डिजिटल नोट्स)</option>
                <option value="pdf">2. Study Material PDF</option>
                <option value="important_questions">3. Important Questions</option>
                <option value="question_bank">4. Question Bank</option>
                <option value="pyq">5. PYQ</option>
                <option value="model_paper">6. Model Paper</option>
                <option value="practice_material">7. Practice Material</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                6. शीर्षक (Title) *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="उदा. अध्याय 01 थ्योरी एवं नोट्स"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                7. कोर्स चुनें (Optional Course)
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
              >
                <option value="">-- सामान्य / सभी कोर्स --</option>
                {courses.filter(c => c.classLevel === selectedClass).map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                8. बैच का नाम (Optional Batch)
              </label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="उदा. मॉर्निंग बैच 2026"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              7. संक्षिप्त विवरण (Optional Description)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="उदा. बोर्ड परीक्षा 2026 के लिए विशेष रूप से तैयार किया गया नोट्स।"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            >
            </input>
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
                आप किसी भी स्रोत या ब्रांड की PDF अपलोड करें, इन-ऐप व्यूअर एवं डाउनलोड सिस्टम स्वतः इसे <strong>RK STUDY CENTRE (प्रिंस सर)</strong> के आधिकारिक प्रारूप, हेडर रिबन, वॉटरमार्क एवं सत्यापन मुहर के साथ प्रस्तुत करेगा।
              </p>
            </div>
          </div>

          {/* Duplicate Warning */}
          {duplicateWarning && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <p className="font-bold text-sm">चेतावनी: संभावित डुप्लीकेट सामग्री (Duplicate Warning)</p>
                <p className="mt-0.5">
                  इस अध्याय के लिए "<strong>{duplicateWarning.title}</strong>" नाम की सामग्री पहले से मौजूद है। 
                  कृपया सुनिश्चित करें कि आप एक ही सामग्री दोबारा अपलोड नहीं कर रहे हैं।
                </p>
              </div>
            </div>
          )}

          {/* File or Link Picker */}
          {uploadMode === 'file' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                8. PDF फ़ाइल चुनें (Select PDF File) *
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  selectedFile
                    ? 'border-emerald-400 bg-emerald-50/50'
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30'
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
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900 text-sm break-all">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">
                        आकार (Size): {formatBytes(selectedFile.size)} • PDF फ़ाइल तैयार है
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="sm:ml-4 text-xs font-bold text-rose-600 hover:text-rose-700 underline"
                    >
                      हटाएं / दूसरी चुनें
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      यहाँ क्लिक करें या PDF फ़ाइल ड्रैग करें (Click to select PDF)
                    </p>
                    <p className="text-xs text-slate-500">
                      केवल PDF फ़ॉर्मेट समर्थित है • अधिकतम अनुशंसित आकार: 50 MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                8. बाहरी URL/लिंक दर्ज करें (Enter External Link) *
              </label>
              <div className="relative">
                <ExternalLink className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  placeholder="उदा. https://drive.google.com/file/d/..."
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-2 ml-1">
                गूगल ड्राइव, ड्रॉपबॉक्स या किसी अन्य वेब पोर्टल का सीधा PDF लिंक यहाँ पेस्ट करें।
              </p>
            </div>
          )}

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  Firebase Storage एवं Firestore में अपलोड जारी है...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-3 bg-blue-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-bold">अपलोड विफल रहा (Upload Failed)</p>
                <p className="mt-0.5 text-xs text-rose-700 leading-relaxed">{uploadError}</p>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>पुनः प्रयास करें (Retry)</span>
                </button>
              </div>
            </div>
          )}

          {/* Success Message */}
          {uploadSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-bold">सफलतापूर्वक अपलोड संपन्न!</p>
                <p className="mt-0.5 text-xs text-emerald-700 leading-relaxed">
                  PDF फ़ाइल Firebase Storage में अपलोड हो गई है और इसका मेटाडेटा Firestore में सुरक्षित हो गया है। विद्यार्थी अब इसे अपने स्टडी मटेरियल पोर्टल में देख सकेंगे।
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isUploading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 text-white text-base font-bold hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>अपलोड हो रहा है... ({uploadProgress}%)</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5" />
                  <span>अपलोड एवं प्रकाशित करें (Upload Material)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Materials List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-4 pb-6 border-b border-slate-100 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900">
                अपलोड की गई सामग्री सूची (Uploaded Materials Catalog)
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                कुल अपलोड: {materials.length} सामग्री सुरक्षित • फ़िल्टर किए गए: {filteredMaterials.length}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="शीर्षक, विषय या फाइल नाम खोजें..."
                  className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 w-full sm:w-64"
                />
              </div>
              <button
                onClick={() => {
                  setFilterClass('all');
                  setFilterSubject('all');
                  setFilterCourse('all');
                  setFilterBatch('all');
                  setFilterType('all');
                  setFilterStatus('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-colors cursor-pointer whitespace-nowrap"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Class Filter */}
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white cursor-pointer"
            >
              <option value="all">सभी कक्षाएं (All Classes)</option>
              {CLASSES_METADATA.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Subject Filter */}
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white cursor-pointer"
            >
              <option value="all">सभी विषय (All Subjects)</option>
              {uniqueSubjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            {/* Course Filter */}
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white cursor-pointer"
            >
              <option value="all">सभी कोर्स (All Courses)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>

            {/* Batch Filter */}
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white cursor-pointer"
            >
              <option value="all">सभी बैच (All Batches)</option>
              {uniqueBatches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white cursor-pointer"
            >
              <option value="all">सभी प्रकार (All Types)</option>
              <option value="notes">Notes</option>
              <option value="pdf">PDF Material</option>
              <option value="important_questions">Important Questions</option>
              <option value="question_bank">Question Bank</option>
              <option value="pyq">PYQ</option>
              <option value="model_paper">Model Paper</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white cursor-pointer"
            >
              <option value="all">सभी स्थिति (All Status)</option>
              <option value="active">सक्रिय (Active)</option>
              <option value="inactive">अक्रिय (Inactive)</option>
              <option value="archived">आर्काइव (Archived)</option>
            </select>
          </div>
        </div>

        {/* List Content */}
        {isLoadingMaterials ? (
          <div className="py-12 text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">सामग्री लोड हो रही है...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">
              {materials.length === 0
                ? 'अभी तक कोई नई अध्ययन सामग्री अपलोड नहीं की गई है।'
                : 'चयनित फ़िल्टर के अनुसार कोई सामग्री नहीं मिली।'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              ऊपर दिए गए फ़ॉर्म से PDF नोट्स अपलोड करें। आधारभूत पाठ्यक्रम नोट्स हमेशा विद्यार्थियों के लिए उपलब्ध रहते हैं।
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredMaterials.map((item) => (
              <div
                key={item.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 px-3 rounded-2xl transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-800">
                      {item.classLevel?.toUpperCase() || item.classId?.toUpperCase()}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                      {item.type}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                        !item.status || item.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {!item.status || item.status === 'active' ? 'PUBLISHED (ACTIVE)' : item.status.toUpperCase()}
                    </span>
                    {item.courseId && (
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800">
                        Course: {courses.find((c) => c.id === item.courseId)?.title || item.courseId}
                      </span>
                    )}
                    {item.batchName && (
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-100 text-purple-800">
                        Batch: {item.batchName}
                      </span>
                    )}
                    {item.fileSize && (
                      <span className="text-xs text-slate-500 font-mono">
                        {item.fileSize}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span>
                      मैपिंग: <strong>{item.subjectName || item.subjectId}</strong> →{' '}
                      <strong>{item.bookTitle || item.bookId}</strong> →{' '}
                      <strong>{item.chapterTitle || item.chapterId}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-50/50 p-1 px-2 rounded border border-slate-100 mt-1 font-mono">
                    <span className="font-bold shrink-0">ID Mapping:</span>
                    <span className="truncate">{item.classLevel || item.classId} / {item.subjectId} / {item.bookId} / {item.chapterId}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {item.fileFormat === 'LINK' ? (
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer border border-indigo-200"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>लिंक खोलें</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setPdfDocToView({
                          title: item.title,
                          fileName: item.fileName,
                          fileSize: item.fileSize,
                          fileUrl: item.fileUrl,
                          classLevel: item.classLevel || item.classId,
                          subjectName: item.subjectName || item.subjectId,
                          bookTitle: item.bookTitle || item.bookId,
                          chapterTitle: item.chapterTitle || item.chapterId,
                          content: item.description,
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>इन-ऐप PDF पढ़ें</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={async () => {
                      const nextStatus = !item.status || item.status === 'active' ? 'inactive' : 'active';
                      await updateStudyMaterial(item.id, { status: nextStatus });
                      loadMaterials();
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer border ${
                      !item.status || item.status === 'active'
                        ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200'
                    }`}
                  >
                    <span>{!item.status || item.status === 'active' ? 'Unpublish' : 'Publish'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEditMaterial(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>संपादित करें</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMaterialToDelete(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>हटाएं</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Material Modal */}
      {itemToEdit && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">विवरण संपादित करें</h3>
                  <p className="text-xs text-slate-500 font-medium">ID: {itemToEdit.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setItemToEdit(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  सामग्री शीर्षक (Title) *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  संक्षिप्त विवरण (Description)
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    कोर्स (Course)
                  </label>
                  <select
                    value={editCourseId}
                    onChange={(e) => setEditCourseId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  >
                    <option value="">-- सामान्य / सभी कोर्स --</option>
                    {courses.filter(c => c.classLevel === itemToEdit.classLevel || c.classLevel === itemToEdit.classId).map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    बैच का नाम (Batch)
                  </label>
                  <input
                    type="text"
                    value={editBatchName}
                    onChange={(e) => setEditBatchName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    स्थिति (Status)
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  >
                    <option value="active">Active (सक्रिय)</option>
                    <option value="inactive">Inactive (अक्रिय)</option>
                    <option value="archived">Archived (आर्काइव)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    फाइल रिप्लेसमेंट (Replace PDF File)
                  </label>
                  <button
                    type="button"
                    onClick={() => replaceFileInputRef.current?.click()}
                    disabled={isReplacingFile}
                    className="w-full px-4 py-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 text-blue-700 text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isReplacingFile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>अपलोड हो रहा है... {replaceProgress}%</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>नई PDF फाइल चुनें</span>
                      </>
                    )}
                  </button>
                  <input
                    ref={replaceFileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleReplaceFilePick}
                    className="hidden"
                  />
                  {replacementFile && (
                    <p className="text-[10px] text-emerald-600 font-bold mt-1 text-center">
                      फाइल सफलतापूर्वक बदल दी गई है: {replacementFile.name}
                    </p>
                  )}
                </div>
              </div>

              {editError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setItemToEdit(null)}
                  disabled={isSavingEdit || isReplacingFile}
                  className="flex-1 px-6 py-3 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit || isReplacingFile}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-black bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>सुरक्षित हो रहा है...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>परिवर्तन सुरक्षित करें</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!materialToDelete}
        onClose={() => {
          setMaterialToDelete(null);
          setDeleteError(null);
        }}
        onConfirm={confirmDelete}
        title="अध्ययन सामग्री हटाएं?"
        message={
          materialToDelete ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                क्या आप वाकई निम्नलिखित अध्ययन सामग्री और इसकी PDF फ़ाइल को हमेशा के लिए हटाना चाहते हैं? यह कार्रवाई वापस नहीं की जा सकती।
              </p>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="text-sm font-bold text-slate-900 break-all">
                  {materialToDelete.title}
                </p>
                <p className="text-xs text-slate-500">
                  {materialToDelete.classLevel?.toUpperCase()} • {materialToDelete.fileName || 'PDF फ़ाइल'}
                </p>
              </div>
              {deleteError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {deleteError}
                </div>
              )}
            </div>
          ) : ""
        }
        confirmText="हाँ, सामग्री हटाएं"
        cancelText="रद्द करें"
        variant="danger"
        isLoading={isDeleting}
        loadingText="हटाया जा रहा है..."
      />

        </>
      )}

      {/* In-App PDF Viewer Modal */}
      <InAppPDFViewerModal
        isOpen={!!pdfDocToView}
        document={pdfDocToView}
        onClose={() => setPdfDocToView(null)}
      />
    </div>
  );
}
