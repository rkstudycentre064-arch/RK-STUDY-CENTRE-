const fs = require('fs');

const code = `
import { useState, useEffect } from 'react';
import {
  BookOpen,
  ChevronRight,
  ArrowLeft,
  FolderOpen,
  Loader2,
  AlertCircle,
  FileText,
  Download,
  Eye,
  Search
} from 'lucide-react';
import type {
  ClassLevel,
  MainNavRoute,
  MoreSectionTab,
} from '../types';
import {
  CLASSES_METADATA,
  SUBJECTS,
  BOOKS,
  CHAPTERS,
  STUDY_MATERIALS
} from '../lib/constants';
import { BackButton } from '../components/BackButton';

interface StudyMaterialViewProps {
  initialClass?: ClassLevel;
  initialSubjectSlug?: string;
  initialBookSlug?: string;
  initialChapterSlug?: string;
  onNavigate: (route: MainNavRoute, params?: { classLevel?: ClassLevel; subjectSlug?: string; bookSlug?: string; chapterSlug?: string; moreTab?: MoreSectionTab }) => void;
}

export function StudyMaterialView({
  initialClass = 'class-10',
  initialSubjectSlug,
  initialBookSlug,
  initialChapterSlug,
  onNavigate
}: StudyMaterialViewProps) {
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(initialClass);
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState<string | undefined>(initialSubjectSlug);
  const [selectedBookSlug, setSelectedBookSlug] = useState<string | undefined>(initialBookSlug);
  const [selectedChapterSlug, setSelectedChapterSlug] = useState<string | undefined>(initialChapterSlug);
  
  const [isLoadingMaterials, setIsLoadingMaterials] = useState<boolean>(false);
  const [materialError, setMaterialError] = useState<string | null>(null);
  const [chapterMaterials, setChapterMaterials] = useState<any[]>([]);

  // Sync state if props change from URL
  useEffect(() => {
    setSelectedClass(initialClass);
    setSelectedSubjectSlug(initialSubjectSlug);
    setSelectedBookSlug(initialBookSlug);
    setSelectedChapterSlug(initialChapterSlug);
  }, [initialClass, initialSubjectSlug, initialBookSlug, initialChapterSlug]);

  const currentClassMeta = CLASSES_METADATA.find((c) => c.id === selectedClass) || CLASSES_METADATA[1];

  const classSubjects = SUBJECTS.filter((s) => s.classLevel === selectedClass);
  const selectedSubject = selectedSubjectSlug ? classSubjects.find((s) => s.slug === selectedSubjectSlug) : undefined;
  
  const subjectBooks = selectedSubject ? BOOKS.filter((b) => b.subjectId === selectedSubject.id) : [];
  const selectedBook = selectedBookSlug ? subjectBooks.find((b) => b.slug === selectedBookSlug) : undefined;
  
  const bookChapters = selectedBook ? CHAPTERS.filter((c) => c.bookId === selectedBook.id) : [];
  const selectedChapter = selectedChapterSlug ? bookChapters.find((c) => c.slug === selectedChapterSlug) : undefined;

  // Simulate fetching study materials for the chapter
  useEffect(() => {
    if (selectedChapter && selectedClass && selectedSubject && selectedBook) {
      setIsLoadingMaterials(true);
      setMaterialError(null);
      
      // Simulate network request for future Firestore integration
      const timer = setTimeout(() => {
        try {
          const materials = STUDY_MATERIALS.filter(m => 
            m.classId === selectedClass && 
            m.subjectId === selectedSubject.id && 
            m.bookId === selectedBook.id && 
            m.chapterId === selectedChapter.id
          );
          setChapterMaterials(materials);
          setIsLoadingMaterials(false);
        } catch (err) {
          console.error('[RK STUDY CENTRE] Error loading materials:', err);
          setMaterialError("अध्ययन सामग्री लोड नहीं हो सकी। कृपया कुछ समय बाद फिर प्रयास करें।");
          setIsLoadingMaterials(false);
        }
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setChapterMaterials([]);
    }
  }, [selectedChapter, selectedClass, selectedSubject, selectedBook]);

  const handleSelectClass = (cls: ClassLevel) => {
    onNavigate('study-material', { classLevel: cls });
  };

  const handleSelectSubject = (subjectSlug: string) => {
    onNavigate('study-material', { classLevel: selectedClass, subjectSlug });
  };

  const handleSelectBook = (bookSlug: string) => {
    onNavigate('study-material', { classLevel: selectedClass, subjectSlug: selectedSubjectSlug, bookSlug });
  };

  const handleSelectChapter = (chapterSlug: string) => {
    onNavigate('study-material', { classLevel: selectedClass, subjectSlug: selectedSubjectSlug, bookSlug: selectedBookSlug, chapterSlug });
  };

  const handleBackToSubjects = () => {
    onNavigate('study-material', { classLevel: selectedClass });
  };

  const handleBackToBooks = () => {
    onNavigate('study-material', { classLevel: selectedClass, subjectSlug: selectedSubjectSlug });
  };

  const handleBackToChapters = () => {
    onNavigate('study-material', { classLevel: selectedClass, subjectSlug: selectedSubjectSlug, bookSlug: selectedBookSlug });
  };

  // Validations for bad URLs
  const isInvalidSubject = selectedSubjectSlug && !selectedSubject;
  const isInvalidBook = selectedBookSlug && selectedSubject && !selectedBook;
  const isInvalidChapter = selectedChapterSlug && selectedBook && !selectedChapter;

  if (isInvalidSubject || isInvalidBook || isInvalidChapter) {
    return (
      <div className="space-y-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <BackButton
            label="मुख्य पृष्ठ पर वापस जाएं"
            fallbackRoute="home"
            onNavigate={onNavigate}
          />
        </div>
        <div className="bg-white rounded-3xl p-10 sm:p-16 border-2 border-slate-200 text-center space-y-5 shadow-sm">
          <FolderOpen className="w-16 h-16 text-slate-400 mx-auto" />
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
            यह सामग्री अभी उपलब्ध नहीं है।
          </h3>
          <p className="text-slate-600 text-base sm:text-lg font-medium max-w-lg mx-auto leading-relaxed">
            आपके द्वारा खोजी गई कक्षा, विषय, पुस्तक या अध्याय इस समय सिस्टम में मौजूद नहीं है। कृपया सही विकल्प चुनें।
          </p>
          <button
            onClick={() => onNavigate('study-material', { classLevel: selectedClass })}
            className="mt-4 px-6 py-3 rounded-xl text-base font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md inline-flex items-center gap-2 cursor-pointer transition-colors"
          >
            कक्षा {currentClassMeta.gradeNumber} के विषयों पर वापस जाएं
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      {/* Top Nav & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <BackButton
          label="मुख्य पृष्ठ पर वापस जाएं"
          fallbackRoute="home"
          onNavigate={onNavigate}
        />
        <div className="text-sm font-bold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-2xs">
          प्रदर्शित कक्षा: <span className="text-blue-800 font-extrabold">{currentClassMeta.hindiName} ({currentClassMeta.name})</span>
        </div>
      </div>

      {/* Class Selection Tabs */}
      <div className="bg-white rounded-3xl p-7 sm:p-8 border-2 border-slate-200 shadow-sm space-y-7">
        <div className="space-y-2">
          <span className="text-sm font-black text-blue-700 uppercase tracking-widest">
            अध्ययन सामग्री
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900">
            कक्षा चुनें
          </h1>
          <p className="text-slate-700 text-base sm:text-lg font-medium max-w-3xl leading-relaxed">
            कृपया अपनी कक्षा का चयन करें। आपको केवल उसी कक्षा की सामग्री दिखाई देगी।
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {CLASSES_METADATA.map((cls) => {
            const isSelected = selectedClass === cls.id;
            return (
              <button
                key={cls.id}
                onClick={() => handleSelectClass(cls.id)}
                className={\`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer shadow-xs \${
                  isSelected
                    ? 'border-blue-700 bg-blue-50/90 ring-4 ring-blue-600/15'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                }\`}
              >
                <div className="flex items-center justify-between">
                  <span className={\`text-lg sm:text-xl font-black \${isSelected ? 'text-blue-900' : 'text-slate-900'}\`}>
                    {cls.hindiName}
                  </span>
                  <span className={\`text-xs font-bold px-2.5 py-1 rounded-md \${isSelected ? 'bg-blue-200 text-blue-900' : 'bg-slate-100 text-slate-700'}\`}>
                    {cls.name}
                  </span>
                </div>
                <div className={\`text-sm mt-1.5 font-bold truncate \${isSelected ? 'text-blue-800' : 'text-slate-600'}\`}>
                  {cls.totalSubjects} मुख्य विषय
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Breadcrumbs */}
      {(selectedSubject || selectedChapter || selectedBook) && (
        <nav className="flex items-center gap-2.5 text-sm sm:text-base text-slate-700 bg-slate-100 px-5 py-3 rounded-2xl flex-wrap font-bold border border-slate-200">
          <button
            onClick={() => handleBackToSubjects()}
            className="font-black text-blue-800 hover:underline cursor-pointer"
          >
            {currentClassMeta.hindiName}
          </button>
          
          {selectedSubject && (
            <>
              <ChevronRight className="w-5 h-5 text-slate-400 stroke-[2.5]" />
              <button
                onClick={() => handleBackToBooks()}
                className={\`font-bold cursor-pointer \${
                  !selectedBook ? 'text-slate-900 font-black' : 'text-blue-800 hover:underline'
                }\`}
              >
                {selectedSubject.hindiName}
              </button>
            </>
          )}

          {selectedBook && (
            <>
              <ChevronRight className="w-5 h-5 text-slate-400 stroke-[2.5]" />
              <button
                onClick={() => handleBackToChapters()}
                className={\`font-bold cursor-pointer \${
                  !selectedChapter ? 'text-slate-900 font-black' : 'text-blue-800 hover:underline'
                }\`}
              >
                {selectedBook.hindiTitle || selectedBook.title}
              </button>
            </>
          )}

          {selectedChapter && (
            <>
              <ChevronRight className="w-5 h-5 text-slate-400 stroke-[2.5]" />
              <span className="font-black text-slate-900 truncate">
                अध्याय {selectedChapter.chapterNumber}
              </span>
            </>
          )}
        </nav>
      )}

      {/* Main Content Areas */}
      <div className="space-y-8">
        
        {/* Step 1: Subjects List */}
        {!selectedSubject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  विषय चुनें
                </h2>
                <p className="text-slate-700 text-sm sm:text-base font-medium mt-1">
                  सामग्री देखने के लिए विषय का चयन करें।
                </p>
              </div>
              <span className="text-sm font-extrabold text-blue-900 bg-blue-100 border border-blue-200 px-4 py-1.5 rounded-full">
                {classSubjects.length} विषय
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {classSubjects.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => handleSelectSubject(sub.slug)}
                  className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                        <BookOpen className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                        {sub.code}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                        {sub.hindiName}
                      </h3>
                      <div className="text-base font-bold text-blue-800">
                        {sub.name}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600 font-semibold">
                    <span>{sub.totalChapters} अध्याय</span>
                    <span className="font-extrabold text-blue-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      पुस्तकें देखें →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Books List */}
        {selectedSubject && !selectedBook && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  पुस्तक चुनें
                </h2>
                <p className="text-slate-700 text-sm sm:text-base font-medium mt-1">
                  किस पुस्तक की सामग्री आप देखना चाहते हैं?
                </p>
              </div>
              <button
                onClick={handleBackToSubjects}
                className="px-4 py-2 rounded-xl text-sm font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">वापस</span>
              </button>
            </div>

            {subjectBooks.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border-2 border-slate-200 text-center space-y-4">
                 <h4 className="font-black text-slate-900 text-xl">यह सामग्री अभी उपलब्ध नहीं है।</h4>
                 <p className="text-slate-600 text-base font-medium max-w-md mx-auto">
                    इस विषय के लिए अभी कोई पुस्तक उपलब्ध नहीं है।
                 </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjectBooks.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBook(b.slug)}
                    className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="font-black text-slate-900 text-xl group-hover:text-blue-700 transition-colors">
                        {b.hindiTitle || b.title}
                      </div>
                      <div className="text-sm text-blue-800 font-bold">{b.title}</div>
                      <div className="text-xs text-slate-500 font-semibold">{b.publisher}</div>
                    </div>
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600 font-semibold">
                      <span className="bg-slate-100 px-3 py-1 rounded-md">{b.totalChapters} अध्याय</span>
                      <span className="font-extrabold text-blue-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        अध्याय चुनें →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Chapters List */}
        {selectedBook && !selectedChapter && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  अध्याय चुनें
                </h2>
                <p className="text-slate-700 text-sm sm:text-base font-medium mt-1">
                  अध्ययन सामग्री देखने के लिए अध्याय पर क्लिक करें।
                </p>
              </div>
              <button
                onClick={handleBackToBooks}
                className="px-4 py-2 rounded-xl text-sm font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">वापस</span>
              </button>
            </div>

            {bookChapters.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border-2 border-slate-200 text-center space-y-4">
                 <h4 className="font-black text-slate-900 text-xl">यह सामग्री अभी उपलब्ध नहीं है।</h4>
                 <p className="text-slate-600 text-base font-medium max-w-md mx-auto">
                    इस पुस्तक के लिए अभी कोई अध्याय उपलब्ध नहीं है।
                 </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookChapters.map((ch) => (
                  <div
                    key={ch.id}
                    onClick={() => handleSelectChapter(ch.slug)}
                    className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-black px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 uppercase">
                          अध्याय {ch.chapterNumber}
                        </span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                        {ch.hindiTitle || ch.title}
                      </h4>
                      <div className="text-sm font-bold text-slate-500">
                        {ch.title}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="px-4 py-2 rounded-xl text-sm font-extrabold bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">
                        सामग्री देखें →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Chapter Content (Study Material) */}
        {selectedChapter && (
           <div className="space-y-6">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  अध्याय {selectedChapter.chapterNumber}: {selectedChapter.hindiTitle || selectedChapter.title}
                </h2>
                <p className="text-slate-700 text-sm sm:text-base font-medium mt-1">
                  अध्ययन सामग्री (Study Material)
                </p>
              </div>
              <button
                onClick={handleBackToChapters}
                className="px-4 py-2 rounded-xl text-sm font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-center"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">वापस</span>
              </button>
            </div>
            
            {(() => {
              if (isLoadingMaterials) {
                return (
                  <div className="bg-white rounded-3xl p-16 border-2 border-slate-200 text-center space-y-5 shadow-sm">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                    <h3 className="text-xl font-bold text-slate-800">
                      अध्ययन सामग्री लोड हो रही है...
                    </h3>
                  </div>
                );
              }

              if (materialError) {
                return (
                  <div className="bg-white rounded-3xl p-16 border-2 border-red-200 text-center space-y-5 shadow-sm bg-red-50">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                    <h3 className="text-xl font-bold text-red-800">
                      {materialError}
                    </h3>
                  </div>
                );
              }

              if (chapterMaterials.length === 0) {
                return (
                  <div className="bg-white rounded-3xl p-10 sm:p-16 border-2 border-slate-200 text-center space-y-5 shadow-sm">
                    <FolderOpen className="w-16 h-16 text-slate-300 mx-auto" />
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      इस अध्याय के लिए अध्ययन सामग्री अभी उपलब्ध नहीं है।
                    </h3>
                  </div>
                );
              }

              const materialTypes = [
                { id: 'notes', label: 'नोट्स' },
                { id: 'pdf', label: 'PDF' },
                { id: 'important_questions', label: 'महत्वपूर्ण प्रश्न' },
                { id: 'question_bank', label: 'प्रश्न बैंक' },
                { id: 'pyq', label: 'पिछले वर्ष के प्रश्न (PYQ)' },
                { id: 'model_paper', label: 'मॉडल पेपर' },
                { id: 'practice_material', label: 'अभ्यास सामग्री' },
              ];

              return (
                <div className="space-y-10">
                  {materialTypes.map(typeDef => {
                    const materialsOfType = chapterMaterials.filter(m => m.type === typeDef.id);
                    
                    if (materialsOfType.length === 0) return null;

                    return (
                      <div key={typeDef.id} className="space-y-4">
                        <h3 className="text-xl font-black text-slate-900 border-b-2 border-slate-100 pb-2">
                          {typeDef.label}
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {materialsOfType.map(material => (
                            <div key={material.id} className="bg-white border-2 border-slate-200 rounded-2xl p-5 hover:border-blue-400 transition-colors shadow-sm flex flex-col sm:flex-row gap-5">
                              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                <FileText className="w-6 h-6 stroke-[2.5]" />
                              </div>
                              <div className="flex-1 space-y-3">
                                <div>
                                  <h4 className="text-lg font-black text-slate-900">{material.title}</h4>
                                  {material.description && (
                                    <p className="text-sm text-slate-600 font-medium mt-1 leading-relaxed">{material.description}</p>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-3 pt-2">
                                  {material.fileUrl && material.fileUrl !== '#' ? (
                                    <a
                                      href={material.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-extrabold transition-colors shadow-sm"
                                    >
                                      <Eye className="w-4 h-4" />
                                      देखें
                                    </a>
                                  ) : (
                                    <button
                                      disabled
                                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-400 text-sm font-extrabold cursor-not-allowed"
                                    >
                                      <Eye className="w-4 h-4" />
                                      उपलब्ध नहीं
                                    </button>
                                  )}
                                  
                                  {material.fileUrl && material.fileUrl !== '#' && (
                                    <a
                                      href={material.fileUrl}
                                      download={material.fileName || 'document.pdf'}
                                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-extrabold transition-colors"
                                    >
                                      <Download className="w-4 h-4" />
                                      डाउनलोड करें
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
           </div>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/views/StudyMaterialView.tsx', code);
