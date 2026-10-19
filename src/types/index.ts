/**
 * RK STUDY CENTRE - Core Type Definitions & Data Architecture
 * 
 * Strict separation is maintained between Class 9, Class 10, Class 11, and Class 12.
 */

export type ClassLevel = 'class-9' | 'class-10' | 'class-11' | 'class-12';

export interface ClassMetadata {
  id: ClassLevel;
  slug?: string;
  name: string;
  hindiName: string;
  gradeNumber: 9 | 10 | 11 | 12;
  description: string;
  streamSupported?: ('Science' | 'Arts' | 'Commerce')[];
  totalSubjects: number;
}

export interface Subject {
  id: string;
  slug: string;
  classLevel: ClassLevel;
  name: string;
  hindiName: string;
  code: string;
  stream?: 'General' | 'Science' | 'Arts' | 'Commerce';
  icon: string;
  description: string;
  booksCount: number;
  totalChapters: number;
}

export interface Book {
  id: string;
  slug: string;
  subjectId: string;
  classLevel: ClassLevel;
  classId?: ClassLevel;
  stream?: 'General' | 'Science' | 'Arts' | 'Commerce';
  title: string;
  hindiTitle?: string;
  publisher: string;
  edition?: string;
  totalChapters: number;
}

export interface Chapter {
  id: string;
  slug: string;
  bookId: string;
  subjectId: string;
  classLevel: ClassLevel;
  classId?: ClassLevel;
  chapterNumber: number;
  title: string;
  hindiTitle?: string;
  summary?: string;
  notesAvailable: boolean;
  testsAvailable: boolean;
}

export type StudyMaterialType = 
  | 'notes'
  | 'pdf'
  | 'important_questions'
  | 'question_bank'
  | 'pyq'
  | 'model_paper'
  | 'practice_material';

export interface StudyMaterialItem {
  id: string;
  slug?: string;
  classLevel: ClassLevel;
  classId?: ClassLevel; // to support both
  subjectId: string;
  subjectName?: string;
  bookId?: string;
  bookTitle?: string;
  chapterId?: string;
  chapterTitle?: string;
  courseId?: string;
  batchName?: string;
  title: string;
  description?: string;
  type: StudyMaterialType;
  fileFormat?: 'PDF' | 'DOC' | 'INTERACTIVE' | string;
  fileSize?: string;
  fileName?: string;
  fileUrl?: string;
  downloadUrl?: string; // backwards compatibility
  storagePath?: string;
  status?: 'active' | 'inactive' | 'archived';
  year?: number; // for PYQ or Model papers
  previewAvailable?: boolean;
  hasInteractiveNotes?: boolean;
  interactiveNoteId?: string;
  uploadedByEmail?: string;
  createdAt: string;
  updatedAt?: string;
}

export type TestType = 'online_test' | 'chapter_test' | 'subject_test' | 'practice_quiz' | 'objective_test';

export interface TestItem {
  id: string;
  slug?: string;
  classLevel: ClassLevel;
  subjectId: string;
  subjectName?: string;
  bookId: string;
  bookTitle?: string;
  chapterId: string;
  chapterTitle?: string;
  title: string;
  type: TestType;
  totalQuestions: number;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  isNegativeMarking: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  instructions?: string;
  description?: string;
  isPublished?: boolean;
  questions?: TestQuestion[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TestResult {
  id: string;
  testId: string;
  studentId: string;
  score: number;
  totalMarks: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  timeTakenMinutes: number;
  completedAt: string;
}

export interface Course {
  id: string;
  slug?: string;
  classLevel: ClassLevel;
  title: string;
  description: string;
  batchName: string;
  instructorName: string;
  subjectsCovered: string[];
  features: string[];
  totalLectures: number;
  price: number;
  discountedPrice: number;
  enrollmentOpen: boolean;
  startDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  phoneNumber?: string;
  photoURL?: string;
  classLevel?: ClassLevel;
  board: 'Bihar Board' | 'CBSE' | 'Other';
  role: 'student' | 'owner';
  enrolledCourseIds: string[];
  completedTestIds?: string[];
  createdAt: string;
  updatedAt?: string;
}

export type MoreSectionTab = 
  | 'about' 
  | 'faq' 
  | 'contact'
  | 'notices';

export type OwnerSectionTab =
  | 'dashboard'
  | 'students'
  | 'teachers'
  | 'timetable'
  | 'attendance'
  | 'fees'
  | 'exams'
  | 'results'
  | 'courses'
  | 'notices'
  | 'inquiries'
  | 'reports'
  | 'notifications'
  | 'vlogs'
  | 'tests'
  | 'questions-pyq'
  | 'study-material'
  | 'settings';

export type ExamType =
  | 'unit_test'
  | 'monthly'
  | 'quarterly'
  | 'half_yearly'
  | 'annual'
  | 'model_board'
  | 'mock_test'
  | 'other';

export type ExamMode = 'offline' | 'online' | 'hybrid';

export type ExamStatus = 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

export interface ExamSubjectSchedule {
  id: string;
  subjectId: string;
  subjectName: string;
  examDate: string; // YYYY-MM-DD
  startTime: string; // e.g. "09:00 AM" or "09:00"
  endTime: string; // e.g. "12:00 PM" or "12:00"
  durationMinutes?: number;
  maxMarks: number;
  passingMarks: number;
  roomOrHall?: string;
  invigilatorId?: string;
  invigilatorName?: string;
  syllabus?: string;
}

export interface Exam {
  id: string;
  title: string;
  hindiTitle?: string;
  examType: ExamType;
  classLevel: ClassLevel;
  courseId?: string;
  courseName?: string;
  batchName?: string;
  academicYear?: string;
  examMode: ExamMode;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalMarks?: number;
  passingMarks?: number;
  status: ExamStatus;
  schedule: ExamSubjectSchedule[];
  instructions?: string;
  roomHallAllocation?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateExamInput {
  title: string;
  hindiTitle?: string;
  examType: ExamType;
  classLevel: ClassLevel;
  courseId?: string;
  courseName?: string;
  batchName?: string;
  academicYear?: string;
  examMode: ExamMode;
  startDate: string;
  endDate: string;
  totalMarks?: number;
  passingMarks?: number;
  status?: ExamStatus;
  schedule: Omit<ExamSubjectSchedule, 'id'>[] | ExamSubjectSchedule[];
  instructions?: string;
  roomHallAllocation?: string;
  notes?: string;
}

export type PaymentStatus = 'paid' | 'partial' | 'due' | 'overdue';

export type PaymentMethod = 'cash' | 'upi' | 'online' | 'bank_transfer' | 'other';

export interface PaymentInstallment {
  id: string;
  receiptNo: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  paymentDate: string; // YYYY-MM-DD
  source?: 'online' | 'offline';
  isOnlineVerified?: boolean;
  collectedBy?: string;
  collectedByName?: string;
  // Historical snapshot fields for accurate receipt reopening
  finalFeeSnapshot?: number;
  previouslyPaidSnapshot?: number;
  dueAmountAfterSnapshot?: number;
  statusAfterSnapshot?: PaymentStatus;
  studentName?: string;
  studentPhone?: string;
  classLevel?: ClassLevel;
  courseName?: string;
  batchName?: string;
  notes?: string;
  createdAt: string;
}

export interface FeeRecord {
  id: string; // fee_{studentId}_{courseId} or generated id
  studentId: string;
  studentName: string;
  studentPhone?: string;
  studentEmail?: string;
  classLevel: ClassLevel;
  courseId: string;
  courseName: string;
  batchName?: string;
  totalFee: number;
  discount: number;
  finalFee: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  lastPaymentDate?: string;
  dueDate?: string;
  isOnlineVerified?: boolean;
  installments: PaymentInstallment[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RecordPaymentInput {
  feeRecordId?: string;
  studentId: string;
  studentName: string;
  studentPhone?: string;
  studentEmail?: string;
  classLevel: ClassLevel;
  courseId: string;
  courseName: string;
  batchName?: string;
  totalFee: number;
  discount?: number;
  amountPaying: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  paymentDate?: string;
  dueDate?: string;
  notes?: string;
  collectedBy?: string;
  collectedByName?: string;
}

export interface CreateFeeRecordInput {
  id?: string;
  studentId: string;
  studentName: string;
  studentPhone?: string;
  studentEmail?: string;
  classLevel: ClassLevel;
  courseId: string;
  courseName: string;
  batchName?: string;
  totalFee: number;
  discount?: number;
  initialPaidAmount?: number;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  paymentDate?: string;
  dueDate?: string;
  notes?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  studentName: string;
  studentPhone?: string;
  classLevel: ClassLevel;
  courseId: string;
  courseName: string;
  batchName?: string;
  timetableId?: string;
  subjectId?: string;
  subjectName?: string;
  teacherId?: string;
  teacherName?: string;
  status: AttendanceStatus;
  markedBy: string;
  markedByName?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SaveAttendanceItemInput {
  studentId: string;
  studentName: string;
  studentPhone?: string;
  classLevel: ClassLevel;
  courseId: string;
  courseName: string;
  batchName?: string;
  timetableId?: string;
  subjectId?: string;
  subjectName?: string;
  teacherId?: string;
  teacherName?: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface BulkSaveAttendanceInput {
  date: string;
  courseId: string;
  timetableId?: string;
  items: SaveAttendanceItemInput[];
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface TimetableEntry {
  id: string;
  day: DayOfWeek;
  dayHindi: string;
  startTime: string; // e.g. "09:00"
  endTime: string; // e.g. "10:00"
  classLevel: ClassLevel;
  courseId: string;
  courseName: string;
  batchName?: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  roomOrMode?: string;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTimetableInput {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  classLevel: ClassLevel;
  courseId: string;
  courseName?: string;
  batchName?: string;
  teacherId: string;
  teacherName?: string;
  subjectId: string;
  subjectName?: string;
  roomOrMode?: string;
  notes?: string;
  status?: 'active' | 'inactive';
}

export interface Teacher {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
  subjectIds: string[];
  subjectNames: string[];
  classLevels: ClassLevel[];
  assignedCourseIds: string[];
  qualification?: string;
  experienceYears?: number;
  bio?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTeacherInput {
  name: string;
  phone: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
  subjectIds: string[];
  subjectNames?: string[];
  classLevels: ClassLevel[];
  assignedCourseIds?: string[];
  qualification?: string;
  experienceYears?: number;
  bio?: string;
  status?: 'active' | 'inactive';
}

export type VlogCategory = 
  | 'vlog' 
  | 'study_tips' 
  | 'motivation' 
  | 'exam_strategy' 
  | 'topper_talk' 
  | 'class_update' 
  | 'announcement';

export interface VlogComment {
  id: string;
  vlogId: string;
  userId?: string;
  userName: string;
  userRole?: 'student' | 'owner' | 'guest';
  comment: string;
  createdAt: string;
  likes: number;
}

export interface VlogPost {
  id: string;
  slug: string;
  title: string;
  hindiTitle?: string;
  excerpt: string;
  content: string; // Markdown or rich formatted text
  videoUrl?: string; // YouTube / MP4 / Video embed URL
  youtubeId?: string; // Extracted YouTube video ID
  coverImageUrl?: string; // Thumbnail / Hero Banner
  category: VlogCategory;
  classLevel?: ClassLevel | 'all';
  author: string;
  authorRole?: string;
  authorAvatar?: string;
  tags: string[];
  status: 'published' | 'draft';
  readTimeMinutes: number;
  videoDuration?: string;
  viewsCount: number;
  likesCount: number;
  commentsCount?: number;
  isPinned?: boolean;
  isFeatured?: boolean;
  pdfUrl?: string; // Attached study PDF or notes document
  pdfTitle?: string; // Display title for the PDF
  pdfFileName?: string; // Original uploaded file name
  pdfFileSize?: string; // Formatted size e.g. 2.4 MB
  pdfDownloadUrl?: string;
  hasPdfNotes?: boolean;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
}

export type AppTheme = 'light' | 'dark' | 'system';

export interface OwnerSettings {
  theme: AppTheme;
  websiteName?: string;
  logoText?: string;
  defaultLanguage?: 'hi' | 'en';
  instituteName?: string;
  supportPhone?: string;
  supportEmail?: string;
  noticeBanner?: string;
  isNoticeActive?: boolean;
  updatedAt?: string;
}

export type MainNavRoute = 
  | 'home' 
  | 'classes' 
  | 'study-material' 
  | 'tests' 
  | 'courses' 
  | 'vlogs'
  | 'my-progress'
  | 'login' 
  | 'register' 
  | 'more'
  | 'owner'
  | 'about-us'
  | 'faq'
  | 'contact-support'
  | 'terms-and-conditions'
  | 'privacy-policy'
  | 'refund-cancellation'
  | 'data-privacy'
  | 'policies'
  | 'admin-access-check'
  | 'solve-doubt'
  | 'formula-bank'
  | 'study-tracker'
  | 'omr-simulator'
  | 'science-lab';

export interface AppRouteState {
  currentRoute: MainNavRoute;
  selectedClass?: ClassLevel;
  selectedSubjectSlug?: string;
  selectedBookSlug?: string;
  selectedChapterSlug?: string;
  selectedMaterialType?: StudyMaterialType;
  selectedTestType?: TestType;
  moreTab?: MoreSectionTab;
  ownerTab?: OwnerSectionTab;
}

/**
 * Future Owner Portal Architecture Spec
 * (Prepared for server-side verification and security rules in subsequent steps)
 */
export interface OwnerPortalModule {
  id: string;
  slug?: string;
  title: string;
  description: string;
  category: 'content' | 'testing' | 'courses' | 'management';
  readyForStep2: boolean;
}

export interface TestQuestion {
  id: string;
  testId: string;
  classId?: ClassLevel;
  subjectId?: string;
  bookId?: string;
  chapterId?: string;
  question: string;
  options: [string, string, string, string] | string[];
  correctOption: 0 | 1 | 2 | 3 | number;
  explanation?: string;
  marks: number;
  order: number;
}

export interface ChapterProgressRecord {
  chapterId: string;
  chapterNumber?: number;
  chapterTitle: string;
  hindiTitle?: string;
  subjectId: string;
  subjectName?: string;
  classLevel: ClassLevel;
  completedAt: string;
  notesRead?: boolean;
}

export interface StoredTestResult extends TestResult {
  studentAnswers?: Record<string, any>;
  testTitle?: string;
  subjectId?: string;
  subjectName?: string;
  chapterTitle?: string;
  passed?: boolean;
  classLevel?: ClassLevel;
}

export interface StudentProgressStats {
  classLevel: ClassLevel;
  totalChapters: number;
  completedChaptersCount: number;
  chapterCompletionPercent: number;
  totalAvailableTests: number;
  attemptedTestsCount: number;
  passedTestsCount: number;
  testCompletionPercent: number;
  averageScorePercent: number;
  totalQuestionsAnswered: number;
  correctQuestionsCount: number;
  overallAccuracyPercent: number;
  studyStreakDays: number;
}

export type BadgeCategory = 'all' | 'chapters' | 'tests' | 'scores' | 'streaks' | 'special' | 'streak' | 'mastery';

export type BadgeRarity = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface BadgeAchievement {
  id: string;
  title: string;
  hindiTitle: string;
  description: string;
  criteriaText: string;
  category: 'chapters' | 'tests' | 'scores' | 'streaks' | 'special';
  rarity: BadgeRarity;
  points: number;
  iconName: string;
  currentProgress: number;
  targetProgress: number;
  progressPercent: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface StudentBadgeLevel {
  levelNumber: number;
  title: string;
  hindiTitle: string;
  nextLevelPoints: number;
  progressToNextLevelPercent: number;
}

export interface StudentBadgesSummary {
  badges: BadgeAchievement[];
  unlockedCount: number;
  totalCount: number;
  totalPointsEarned: number;
  maxPossiblePoints: number;
  level: StudentBadgeLevel;
}

export interface StudentBadge {
  id: string;
  title: string;
  hindiTitle: string;
  description: string;
  hindiDescription: string;
  category: 'chapters' | 'tests' | 'streak' | 'mastery';
  rarity: BadgeRarity;
  iconName: string;
  requiredCount: number;
  currentCount: number;
  progressPercent: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  rewardPoints: number;
}

export interface StudentLevelInfo {
  level: number;
  titleHindi: string;
  titleEnglish: string;
  currentXp: number;
  nextLevelXp: number;
  progressPercent: number;
  unlockedBadgesCount: number;
  totalBadgesCount: number;
}

export type ResultStatus = 'draft' | 'published';

export type PassFailStatus = 'pass' | 'fail' | 'absent' | 'pending';

export interface ExamSubjectResultRecord {
  id: string; // res_{examId}_{studentId}_{subjectId}
  examId: string;
  studentId: string;
  studentName: string;
  studentPhone?: string;
  courseId?: string;
  batchName?: string;
  classLevel: ClassLevel;
  subjectId: string;
  subjectName: string;
  maxMarks: number;
  passingMarks: number;
  marksObtained?: number | null;
  percentage: number;
  grade: string;
  passFail: PassFailStatus;
  remarks?: string;
  status: ResultStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  publishedAt?: string;
  publishedBy?: string;
}

export type NoticeType =
  | 'general'
  | 'circular'
  | 'holiday'
  | 'exam'
  | 'fee'
  | 'attendance'
  | 'important';

export type NoticeAudience =
  | 'all'
  | 'students'
  | 'teachers'
  | 'specific_class'
  | 'specific_course'
  | 'specific_batch';

export type NoticePriority = 'normal' | 'important' | 'urgent';

export type NoticePublishStatus = 'draft' | 'published' | 'archived';

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  noticeType: NoticeType;
  type?: NoticeType;
  audience: NoticeAudience;
  classLevel?: ClassLevel;
  courseId?: string;
  courseName?: string;
  batchName?: string;
  priority: NoticePriority;
  isUrgent?: boolean;
  publishStatus: NoticePublishStatus;
  status?: NoticePublishStatus;
  publishAt?: string;
  publishedAt?: string;
  expiresAt?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: 'pdf' | 'image' | 'link';
  attachmentSize?: string;
  storagePath?: string;
  createdBy: string;
  createdByEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoticeInput {
  title: string;
  content: string;
  noticeType: NoticeType;
  type?: NoticeType;
  audience: NoticeAudience;
  classLevel?: ClassLevel;
  courseId?: string;
  courseName?: string;
  batchName?: string;
  priority: NoticePriority;
  isUrgent?: boolean;
  publishStatus: NoticePublishStatus;
  status?: NoticePublishStatus;
  publishAt?: string;
  publishedAt?: string;
  expiresAt?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: 'pdf' | 'image' | 'link';
  attachmentSize?: string;
  storagePath?: string;
  createdBy: string;
  createdByEmail?: string;
}

export type InquiryType =
  | 'General'
  | 'Admission'
  | 'Fees'
  | 'Course'
  | 'Class'
  | 'Attendance'
  | 'Exam'
  | 'StudyMaterial'
  | 'Technical'
  | 'Other';

export type InquirySource = 'Website' | 'Student' | 'Parent' | 'Teacher' | 'Manual';

export type InquiryStatus = 'New' | 'InProgress' | 'Replied' | 'Resolved' | 'Archived';

export type InquiryPriority = 'Normal' | 'Important' | 'Urgent';

export interface InquiryItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
  inquiryType: InquiryType;
  source: InquirySource;
  status: InquiryStatus;
  priority: InquiryPriority;
  classLevel?: ClassLevel | string;
  assignedTo?: string;
  assignedToEmail?: string;
  reply?: string;
  repliedAt?: string;
  repliedBy?: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
  userId?: string;
}

export interface CreateInquiryInput {
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
  inquiryType?: InquiryType;
  source?: InquirySource;
  status?: InquiryStatus;
  priority?: InquiryPriority;
  classLevel?: ClassLevel | string;
  assignedTo?: string;
  assignedToEmail?: string;
  userId?: string;
}

export type NotificationType =
  | 'General'
  | 'Notice'
  | 'Fee'
  | 'Attendance'
  | 'Exam'
  | 'Result'
  | 'StudyMaterial'
  | 'Inquiry'
  | 'System';

export type NotificationPriority = 'Normal' | 'Important' | 'Urgent';

export type NotificationRecipientScope = 'All' | 'Role' | 'Class' | 'Batch' | 'Course' | 'Individual';

export type NotificationMetadataValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[];

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  recipientScope: NotificationRecipientScope;
  recipientId?: string;
  recipientRole?: 'all' | 'student' | 'teacher' | 'owner' | 'admin';
  classLevel?: ClassLevel | string;
  courseId?: string;
  batchName?: string;
  sourceType?: 'notice' | 'fee' | 'attendance' | 'exam' | 'result' | 'study_material' | 'inquiry' | 'system' | 'manual';
  sourceId?: string;
  actionRoute?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
  createdBy: string;
  createdByEmail?: string;
  metadata?: Record<string, NotificationMetadataValue>;
}

export interface CreateNotificationInput {
  title: string;
  message: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  recipientScope?: NotificationRecipientScope;
  recipientId?: string;
  recipientRole?: 'all' | 'student' | 'teacher' | 'owner' | 'admin';
  classLevel?: ClassLevel | string;
  courseId?: string;
  batchName?: string;
  sourceType?: 'notice' | 'fee' | 'attendance' | 'exam' | 'result' | 'study_material' | 'inquiry' | 'system' | 'manual';
  sourceId?: string;
  actionRoute?: string;
  expiresAt?: string;
  createdBy?: string;
  createdByEmail?: string;
  metadata?: Record<string, NotificationMetadataValue>;
}

export interface NotificationReadRecord {
  id: string; // `${userId}_${notificationId}`
  notificationId: string;
  userId: string;
  isRead: boolean;
  readAt: string;
  updatedAt?: string;
}


