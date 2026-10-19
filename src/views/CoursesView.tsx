import { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle,
  Users,
  Calendar,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowRight,
  X,
  GraduationCap,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type {
  ClassLevel,
  MainNavRoute,
  MoreSectionTab,
  Course,
} from '../types';
import { COURSES as FALLBACK_COURSES, CLASSES_METADATA } from '../lib/constants';
import { BackButton } from '../components/BackButton';
import { getAllCourses } from '../services/courseService';
import { enrollStudentInCourse } from '../services/studentService';
import { useAuth } from '../context/AuthContext';

interface CoursesViewProps {
  onNavigate: (route: MainNavRoute, params?: { classLevel?: ClassLevel; moreTab?: MoreSectionTab }) => void;
}

export function CoursesView({ onNavigate }: CoursesViewProps) {
  const { user, profile, refreshProfile } = useAuth();

  const [courses, setCourses] = useState<Course[]>(FALLBACK_COURSES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedClass, setSelectedClass] = useState<ClassLevel | 'all'>('all');
  const [enrollingCourse, setEnrollingCourse] = useState<Course | null>(null);
  const [isSubmittingEnrollment, setIsSubmittingEnrollment] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState<string | null>(null);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);

  // Load live courses from Firestore
  useEffect(() => {
    let isMounted = true;
    async function loadLiveCourses() {
      try {
        const liveCourses = await getAllCourses(false);
        if (isMounted && liveCourses.length > 0) {
          setCourses(liveCourses);
        }
      } catch (err) {
        console.warn('[CoursesView] Using fallback courses:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadLiveCourses();
    return () => {
      isMounted = false;
    };
  }, []);

  const enrolledCourseIds = profile?.enrolledCourseIds || [];

  const filteredCourses = courses.filter((c) => {
    if (selectedClass !== 'all' && c.classLevel !== selectedClass) return false;
    return true;
  });

  const handleConfirmEnrollment = async (course: Course) => {
    if (!user) {
      setEnrollingCourse(null);
      onNavigate('login');
      return;
    }

    setIsSubmittingEnrollment(true);
    setEnrollmentError(null);
    try {
      await enrollStudentInCourse(user.uid, course.id);
      await refreshProfile();
      setEnrollmentSuccess(`बधाई! आपका ${course.batchName} (${course.title}) में नामांकन सफलतापूर्वक संपन्न हुआ।`);
    } catch (err: any) {
      setEnrollmentError(err.message || 'नामांकन दर्ज करने में समस्या हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmittingEnrollment(false);
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* शीर्ष पट्टी एवं बैक बटन */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <BackButton label="मुख्य पृष्ठ पर वापस जाएं" fallbackRoute="home" onNavigate={onNavigate} />
        <div className="flex items-center gap-3">
          {isLoading && (
            <div className="flex items-center gap-1.5 text-xs text-blue-700 font-bold bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>कोर्सेज लोड हो रहे हैं...</span>
            </div>
          )}
          <div className="text-sm font-bold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-2xs">
            कुल <span className="text-blue-800 font-extrabold">{filteredCourses.length}</span> लक्ष्य बैच उपलब्ध
          </div>
        </div>
      </div>

      {/* सफलता संदेश बैनर */}
      {enrollmentSuccess && (
        <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-950 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-base font-black">नामांकन सफल!</h4>
              <p className="text-sm font-medium text-emerald-800 mt-0.5">{enrollmentSuccess}</p>
            </div>
          </div>
          <button
            onClick={() => setEnrollmentSuccess(null)}
            className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* हेडर बैनर */}
      <div className="bg-white rounded-3xl p-7 sm:p-8 border-2 border-slate-200 shadow-sm space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-black text-blue-700 uppercase tracking-widest">
            व्यवस्थित शैक्षणिक बैच
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900">
            बोर्ड परीक्षा तैयारी कोर्सेज एवं बैच (Courses)
          </h1>
          <p className="text-slate-700 text-base sm:text-lg font-medium max-w-3xl leading-relaxed">
            बिहार बोर्ड कक्षा 9वीं, 10वीं, 11वीं और 12वीं के लिए विशेष लक्ष्य बैच। नियमित लाइव एवं रिकॉर्डेड कक्षाएं, विस्तृत हस्तलिखित नोट्स, साप्ताहिक टेस्ट सीरीज और शंका समाधान।
          </p>
        </div>

        {/* फ़िल्टर बार */}
        <div className="pt-2 flex flex-wrap gap-2.5">
          <button
            onClick={() => setSelectedClass('all')}
            className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer shadow-2xs ${
              selectedClass === 'all'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
          >
            सभी बैच
          </button>
          <button
            onClick={() => setSelectedClass('class-9')}
            className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer shadow-2xs ${
              selectedClass === 'class-9'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
          >
            कक्षा 9वीं फाउंडेशन
          </button>
          <button
            onClick={() => setSelectedClass('class-10')}
            className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer shadow-2xs ${
              selectedClass === 'class-10'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
          >
            कक्षा 10वीं मैट्रिक टारगेट
          </button>
          <button
            onClick={() => setSelectedClass('class-11')}
            className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer shadow-2xs ${
              selectedClass === 'class-11'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
          >
            कक्षा 11वीं इंटरमीडिएट
          </button>
          <button
            onClick={() => setSelectedClass('class-12')}
            className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer shadow-2xs ${
              selectedClass === 'class-12'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
          >
            कक्षा 12वीं इंटर टारगेट
          </button>
        </div>
      </div>

      {/* कोर्सेज सूची */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {(filteredCourses || []).map((course) => {
          const classObj = (CLASSES_METADATA || []).find((c) => c.id === course.classLevel);
          const isEnrolled = enrolledCourseIds.includes(course.id);
          const isOpen = course.enrollmentOpen !== false;

          return (
            <div
              key={course.id}
              className={`bg-white rounded-3xl p-7 sm:p-8 border-2 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-7 ${
                isEnrolled ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-3.5 py-1.5 rounded-lg bg-blue-100 text-blue-900 uppercase">
                    {classObj ? classObj.hindiName : course.classLevel}
                  </span>
                  {isEnrolled ? (
                    <span className="text-xs font-black text-emerald-900 bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-300 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>आप नामांकित हैं</span>
                    </span>
                  ) : isOpen ? (
                    <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200">
                      प्रवेश खुला है
                    </span>
                  ) : (
                    <span className="text-xs font-black text-rose-800 bg-rose-100 px-3 py-1 rounded-lg border border-rose-200">
                      प्रवेश बंद है
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    {course.batchName}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {course.title}
                  </h3>
                  <p className="text-slate-700 text-sm sm:text-base mt-2 leading-relaxed font-medium">
                    {course.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(course.subjectsCovered || []).map((sub) => (
                    <span
                      key={sub}
                      className="text-xs sm:text-sm font-extrabold bg-slate-100 text-slate-800 px-3 py-1 rounded-lg border border-slate-200"
                    >
                      {sub}
                    </span>
                  ))}
                </div>

                <div className="space-y-2.5 border-t border-slate-100 pt-4">
                  <div className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    बैच में शामिल विशेषताएं:
                  </div>
                  <div className="space-y-2">
                    {(course.features || []).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-slate-700">
                        <CheckCircle className="w-4 h-4 text-emerald-600 stroke-[2.5] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-slate-100 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-black text-slate-900">₹{course.discountedPrice}</span>
                    <span className="text-base text-slate-400 font-bold line-through">₹{course.price}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-semibold mt-0.5">
                    प्रारंभ: {course.startDate} • कुल {course.totalLectures} कक्षाएं
                  </div>
                </div>

                {isEnrolled ? (
                  <button
                    onClick={() => onNavigate('classes', { classLevel: course.classLevel })}
                    className="px-6 py-3 rounded-xl font-black text-sm sm:text-base bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    <span>कक्षा सामग्री देखें</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEnrollmentError(null);
                      setEnrollingCourse(course);
                    }}
                    disabled={!isOpen}
                    className={`px-6 py-3 rounded-xl font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs ${
                      isOpen
                        ? 'bg-blue-700 hover:bg-blue-800 text-white'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>{isOpen ? 'बैच में नामांकन लें' : 'प्रवेश बंद'}</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* विद्यार्थी पहुंच सुरक्षा सूचना */}
      <div className="bg-slate-50 rounded-3xl p-7 border-2 border-slate-200 space-y-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Lock className="w-5 h-5 text-blue-700 stroke-[2.5]" />
          <h4 className="font-black text-slate-900 text-base sm:text-lg">
            प्रमाणीकृत विद्यार्थी अध्ययन नियंत्रण
          </h4>
        </div>
        <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-3xl font-medium">
          नामांकन लेने के पश्चात विद्यार्थी के खाते में विशेष वीडियो व्याख्यान, प्रीमियम अध्याय नोट्स और टेस्ट सीरीज तुरंत सक्रिय हो जाती हैं। विद्यार्थी कभी भी किसी भी डिवाइस से अपनी सामग्री पढ़ सकते हैं।
        </p>
      </div>

      {/* नामांकन मोडल */}
      {enrollingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-7 border-2 border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-black px-2.5 py-1 rounded bg-blue-100 text-blue-900 uppercase">
                  बैच नामांकन पोर्टल
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  {enrollingCourse.title}
                </h3>
              </div>
              <button
                onClick={() => setEnrollingCourse(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-sm text-slate-700">
              <div className="flex justify-between font-bold">
                <span>बैच नाम:</span>
                <span className="text-slate-900 font-extrabold">{enrollingCourse.batchName}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>सत्र प्रारंभ तिथि:</span>
                <span className="text-slate-900 font-extrabold">{enrollingCourse.startDate}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>कुल कक्षाएं:</span>
                <span className="text-slate-900 font-extrabold">{enrollingCourse.totalLectures} लेक्चर्स</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1 border-t border-slate-200">
                <span>नामांकन शुल्क:</span>
                <span className="text-emerald-700 font-black">₹{enrollingCourse.discountedPrice}</span>
              </div>
            </div>

            {/* Error in modal */}
            {enrollmentError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{enrollmentError}</span>
              </div>
            )}

            {user ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-medium">
                  आप <strong>{user.email || profile?.displayName}</strong> के रूप में लॉगिन हैं। पुष्टि करने पर यह कोर्स आपके खाते में तुरंत जुड़ जाएगा।
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setEnrollingCourse(null)}
                    disabled={isSubmittingEnrollment}
                    className="flex-1 py-3 rounded-xl border-2 border-slate-300 font-extrabold text-slate-700 hover:bg-slate-50 cursor-pointer text-sm disabled:opacity-50"
                  >
                    रद्द करें
                  </button>
                  <button
                    onClick={() => handleConfirmEnrollment(enrollingCourse)}
                    disabled={isSubmittingEnrollment}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-extrabold text-white cursor-pointer text-sm shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingEnrollment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>नामांकन हो रहा है...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>नामांकन की पुष्टि करें</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  नामांकन के लिए विद्यार्थी का पंजीकृत खाता होना आवश्यक है। यदि आपके पास खाता नहीं है तो पहले नया खाता बनाएं या लॉगिन करें।
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setEnrollingCourse(null)}
                    className="flex-1 py-3 rounded-xl border-2 border-slate-300 font-extrabold text-slate-700 hover:bg-slate-50 cursor-pointer text-sm"
                  >
                    बंद करें
                  </button>
                  <button
                    onClick={() => {
                      setEnrollingCourse(null);
                      onNavigate('login');
                    }}
                    className="flex-1 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 font-extrabold text-white cursor-pointer text-sm shadow-xs"
                  >
                    लॉगिन कर नामांकन लें
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

