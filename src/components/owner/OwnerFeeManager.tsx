/**
 * RK STUDY CENTRE - Owner Fee Management & Offline Payment Receipt Component (Task 9)
 * 
 * Core Features:
 * - Offline Payment Entry (Cash, UPI with UTR, Bank Transfer, Other)
 * - Single authoritative calculation & live Ledger update
 * - Multi-criteria search & combined filters
 * - Live Overpayment Protection (Blocks payment > remaining due)
 * - Future date blocking (paymentDate <= today)
 * - Duplicate UTR/Reference ID validation
 * - Official Offline Fee Payment Receipt Modal with clean print/PDF layout (window.print)
 * - Receipt Reopening from Payment History with historical snapshot data
 * - Safe Offline Installment Reversal / In-app confirmation dialog
 * - Online verified payment immutability
 * - Double-submit prevention
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CreditCard,
  IndianRupee,
  Search,
  Filter,
  PlusCircle,
  Receipt,
  History,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  FileText,
  Layers,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Lock,
  Printer,
  RotateCcw
} from 'lucide-react';
import {
  getAllFeeRecords,
  recordPayment,
  createOrUpdateFeeRecord,
  deleteFeeRecord,
  reverseOfflineInstallment,
  calculateFeeMetrics,
  generatePaymentReference,
  formatCurrency,
  formatDisplayDate,
  getTodayDateString,
  type FeeMetrics,
} from '../../services/feeService';
import { getAllStudents, type SafeStudentProfile } from '../../services/studentService';
import { getAllCourses } from '../../services/courseService';
import type {
  FeeRecord,
  PaymentInstallment,
  PaymentMethod,
  PaymentStatus,
  RecordPaymentInput,
  CreateFeeRecordInput,
  ClassLevel,
  Course,
} from '../../types';
import { CLASSES_METADATA } from '../../lib/constants';
import { ConfirmModal } from '../common/ConfirmModal';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'cash', label: 'नकद (Cash)', icon: '💵' },
  { id: 'upi', label: 'UPI (PhonePe / GPay / Paytm)', icon: '📱' },
  { id: 'bank_transfer', label: 'बैंक ट्रांसफर (NEFT/IMPS)', icon: '🏦' },
  { id: 'other', label: 'अन्य (Other)', icon: '📝' },
];

export function OwnerFeeManager() {
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [students, setStudents] = useState<SafeStudentProfile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterStudent, setFilterStudent] = useState<string>('all');

  // Modals State
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showNewFeeModal, setShowNewFeeModal] = useState<boolean>(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
  const [showReverseConfirmModal, setShowReverseConfirmModal] = useState<boolean>(false);

  // Selected Target Records for Modals
  const [selectedRecord, setSelectedRecord] = useState<FeeRecord | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState<PaymentInstallment | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<FeeRecord | null>(null);
  const [installmentToReverse, setInstallmentToReverse] = useState<{ feeId: string; installment: PaymentInstallment } | null>(null);

  // Payment Form State (with Student/Course selector support)
  const [paymentStudentId, setPaymentStudentId] = useState<string>('');
  const [paymentCourseId, setPaymentCourseId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [transactionId, setTransactionId] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(getTodayDateString());
  const [dueDate, setDueDate] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState<boolean>(false);
  const [isReversing, setIsReversing] = useState<boolean>(false);

  // New Fee Record Form State
  const [newFeeStudentId, setNewFeeStudentId] = useState<string>('');
  const [newFeeCourseId, setNewFeeCourseId] = useState<string>('');
  const [newFeeTotal, setNewFeeTotal] = useState<number>(1999);
  const [newFeeDiscount, setNewFeeDiscount] = useState<number>(0);
  const [newFeeInitialPaid, setNewFeeInitialPaid] = useState<number>(0);
  const [newFeePaymentMethod, setNewFeePaymentMethod] = useState<PaymentMethod>('cash');
  const [newFeeTxnId, setNewFeeTxnId] = useState<string>('');
  const [newFeeDueDate, setNewFeeDueDate] = useState<string>('');
  const [newFeeNotes, setNewFeeNotes] = useState<string>('');
  const [isSubmittingNewFee, setIsSubmittingNewFee] = useState<boolean>(false);

  // Load Data
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [recordsRes, studentsRes, coursesRes] = await Promise.all([
        getAllFeeRecords(),
        getAllStudents(),
        getAllCourses(true),
      ]);
      setFeeRecords(recordsRes);
      setStudents(studentsRes);
      setCourses(coursesRes);
    } catch (err: any) {
      console.error('[OwnerFeeManager] Error loading fee data:', err);
      setFeedbackMessage({
        type: 'error',
        text: 'शुल्क डेटा लोड करने में समस्या आई। स्थानीय कैश लोड किया जा रहा है।',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Financial Metrics
  const metrics: FeeMetrics = useMemo(() => {
    return calculateFeeMetrics(feeRecords);
  }, [feeRecords]);

  // Filtered Records (Combining 6 filter criteria)
  const filteredRecords = useMemo(() => {
    return feeRecords.filter((rec) => {
      // 1. Class filter
      if (filterClass !== 'all' && rec.classLevel !== filterClass) return false;

      // 2. Course filter
      if (filterCourse !== 'all' && rec.courseId !== filterCourse) return false;

      // 3. Status filter
      if (filterStatus !== 'all' && rec.paymentStatus !== filterStatus) return false;

      // 4. Method filter
      if (filterMethod !== 'all' && rec.paymentMethod !== filterMethod) return false;

      // 5. Student filter
      if (filterStudent !== 'all' && rec.studentId !== filterStudent) return false;

      // 6. Search query (Student Name, Mobile, Course Name, Batch, Txn ID, Ref No)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (rec.studentName || '').toLowerCase().includes(q);
        const matchPhone = (rec.studentPhone || '').toLowerCase().includes(q);
        const matchCourse = (rec.courseName || '').toLowerCase().includes(q);
        const matchBatch = (rec.batchName || '').toLowerCase().includes(q);
        const matchTxn = (rec.transactionId || '').toLowerCase().includes(q);
        const matchReceipt = (rec.installments || []).some(
          (inst) => (inst.receiptNo || '').toLowerCase().includes(q) || (inst.transactionId || '').toLowerCase().includes(q)
        );
        if (!matchName && !matchPhone && !matchCourse && !matchBatch && !matchTxn && !matchReceipt) {
          return false;
        }
      }

      return true;
    });
  }, [feeRecords, filterClass, filterCourse, filterStatus, filterMethod, filterStudent, searchQuery]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterClass('all');
    setFilterCourse('all');
    setFilterStatus('all');
    setFilterMethod('all');
    setFilterStudent('all');
  };

  // Active target fee record in payment modal (either pre-selected or looked up dynamically)
  const currentModalTargetFeeRecord = useMemo(() => {
    if (selectedRecord) return selectedRecord;
    if (!paymentStudentId || !paymentCourseId) return null;
    return feeRecords.find((r) => r.studentId === paymentStudentId && r.courseId === paymentCourseId) || null;
  }, [selectedRecord, paymentStudentId, paymentCourseId, feeRecords]);

  // Open Record Payment Modal (standalone or for a specific row)
  const handleOpenPaymentModal = (record?: FeeRecord) => {
    if (record) {
      setSelectedRecord(record);
      setPaymentStudentId(record.studentId);
      setPaymentCourseId(record.courseId);
      const remaining = Number(record.dueAmount) || 0;
      setPaymentAmount(remaining > 0 ? remaining : 0);
      setDueDate(record.dueDate || '');
    } else {
      setSelectedRecord(null);
      const firstStudent = students[0]?.uid || '';
      setPaymentStudentId(firstStudent);
      const firstCourse = courses[0]?.id || '';
      setPaymentCourseId(firstCourse);
      
      const found = feeRecords.find((r) => r.studentId === firstStudent && r.courseId === firstCourse);
      const remaining = found ? Number(found.dueAmount) || 0 : 1999;
      setPaymentAmount(remaining > 0 ? remaining : 0);
      setDueDate(found?.dueDate || '');
    }
    setPaymentMethod('cash');
    setTransactionId('');
    setPaymentDate(getTodayDateString());
    setPaymentNotes('');
    setShowPaymentModal(true);
  };

  // When student or course changes inside payment modal
  const handleModalStudentChange = (sId: string) => {
    setPaymentStudentId(sId);
    const targetStudent = students.find((s) => s.uid === sId);
    const enrolled = targetStudent?.enrolledCourseIds || [];
    const targetCourseId = enrolled.length > 0 ? enrolled[0] : (courses[0]?.id || '');
    setPaymentCourseId(targetCourseId);

    const found = feeRecords.find((r) => r.studentId === sId && r.courseId === targetCourseId);
    const remaining = found ? Number(found.dueAmount) || 0 : (courses.find((c) => c.id === targetCourseId)?.price || 1999);
    setPaymentAmount(remaining > 0 ? remaining : 0);
    setDueDate(found?.dueDate || '');
  };

  const handleModalCourseChange = (cId: string) => {
    setPaymentCourseId(cId);
    const found = feeRecords.find((r) => r.studentId === paymentStudentId && r.courseId === cId);
    const remaining = found ? Number(found.dueAmount) || 0 : (courses.find((c) => c.id === cId)?.price || 1999);
    setPaymentAmount(remaining > 0 ? remaining : 0);
    setDueDate(found?.dueDate || '');
  };

  // Submit Payment
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetRecord = currentModalTargetFeeRecord;
    const targetStudent = students.find((s) => s.uid === paymentStudentId);
    const targetCourse = courses.find((c) => c.id === paymentCourseId);

    if (!targetStudent || !targetCourse) {
      setFeedbackMessage({
        type: 'error',
        text: 'कृपया वैध विद्यार्थी एवं कोर्स का चयन करें।',
      });
      return;
    }

    const currentDue = targetRecord ? targetRecord.dueAmount : (targetCourse.discountedPrice || targetCourse.price || 1999);

    if (paymentAmount <= 0) {
      setFeedbackMessage({
        type: 'error',
        text: 'कृपया शून्य से अधिक वैध भुगतान राशि दर्ज करें।',
      });
      return;
    }

    if (paymentAmount > currentDue) {
      setFeedbackMessage({
        type: 'error',
        text: `भुगतान राशि (${formatCurrency(paymentAmount)}) शेष बकाया राशि (${formatCurrency(currentDue)}) से अधिक नहीं हो सकती।`,
      });
      return;
    }

    const todayStr = getTodayDateString();
    if (paymentDate > todayStr) {
      setFeedbackMessage({
        type: 'error',
        text: 'भविष्य की तिथि में भुगतान दर्ज नहीं किया जा सकता।',
      });
      return;
    }

    if ((paymentMethod === 'upi' || paymentMethod === 'bank_transfer') && !transactionId.trim()) {
      setFeedbackMessage({
        type: 'error',
        text: `${paymentMethod === 'upi' ? 'UPI' : 'बैंक ट्रांसफर'} हेतु UTR / Transaction ID दर्ज करना अनिवार्य है।`,
      });
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const input: RecordPaymentInput = {
        feeRecordId: targetRecord?.id,
        studentId: targetStudent.uid,
        studentName: targetStudent.displayName,
        studentPhone: targetStudent.phoneNumber,
        studentEmail: targetStudent.email,
        classLevel: (targetCourse.classLevel || targetStudent.classLevel || 'class-10') as ClassLevel,
        courseId: targetCourse.id,
        courseName: targetCourse.title,
        batchName: targetCourse.batchName,
        totalFee: targetRecord ? targetRecord.totalFee : (targetCourse.price || 1999),
        discount: targetRecord ? targetRecord.discount : (targetCourse.price && targetCourse.discountedPrice ? targetCourse.price - targetCourse.discountedPrice : 0),
        amountPaying: paymentAmount,
        paymentMethod,
        transactionId: transactionId.trim() || undefined,
        paymentDate,
        dueDate: dueDate || undefined,
        notes: paymentNotes,
      };

      const result = await recordPayment(input);
      setShowPaymentModal(false);

      // Refresh data
      await loadData();

      // Open Receipt for this newly generated payment
      setSelectedRecord(result.feeRecord);
      setSelectedInstallment(result.newInstallment);
      setShowReceiptModal(true);

      setFeedbackMessage({
        type: 'success',
        text: `₹${paymentAmount.toLocaleString('en-IN')} का ऑफलाइन भुगतान सफलतापूर्वक दर्ज किया गया! रसीद संख्या: ${result.newInstallment.receiptNo}`,
      });
    } catch (err: any) {
      console.error('[OwnerFeeManager] Error recording payment:', err);
      setFeedbackMessage({
        type: 'error',
        text: err?.message || 'भुगतान दर्ज करने में त्रुटि हुई। कृपया पुनः प्रयास करें।',
      });
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Open Receipt Modal
  const handleOpenReceipt = (record: FeeRecord, installment?: PaymentInstallment) => {
    setSelectedRecord(record);
    const chosenInst = installment || (record.installments && record.installments.length > 0 ? record.installments[record.installments.length - 1] : null);
    setSelectedInstallment(chosenInst);
    setShowReceiptModal(true);
  };

  // Open History Modal
  const handleOpenHistory = (record: FeeRecord) => {
    setSelectedRecord(record);
    setShowHistoryModal(true);
  };

  // Trigger browser print
  const handlePrintReceipt = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Reverse Offline Installment
  const handleConfirmReverse = async () => {
    if (!installmentToReverse) return;
    setIsReversing(true);
    try {
      const updated = await reverseOfflineInstallment(installmentToReverse.feeId, installmentToReverse.installment.id);
      setShowReverseConfirmModal(false);
      setInstallmentToReverse(null);
      await loadData();
      
      // Update selected record in history modal if open
      if (selectedRecord && selectedRecord.id === updated.id) {
        setSelectedRecord(updated);
      }

      setFeedbackMessage({
        type: 'success',
        text: `किस्त (${installmentToReverse.installment.receiptNo} - ₹${installmentToReverse.installment.amount}) सफलतापूर्वक रिवर्ट कर दी गई।`,
      });
    } catch (err: any) {
      console.error('[OwnerFeeManager] Error reversing installment:', err);
      setFeedbackMessage({
        type: 'error',
        text: err?.message || 'किस्त रिवर्ट करने में समस्या आई।',
      });
    } finally {
      setIsReversing(false);
    }
  };

  // Handle New Fee Assignment Submit
  const handleSubmitNewFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeeStudentId || !newFeeCourseId) {
      setFeedbackMessage({
        type: 'error',
        text: 'विद्यार्थी और कोर्स का चयन करना अनिवार्य है।',
      });
      return;
    }

    if (newFeeDiscount > newFeeTotal) {
      setFeedbackMessage({
        type: 'error',
        text: 'छूट की राशि कुल कोर्स फीस से अधिक नहीं हो सकती।',
      });
      return;
    }

    const finalPayable = Math.max(0, newFeeTotal - newFeeDiscount);
    if (newFeeInitialPaid > finalPayable) {
      setFeedbackMessage({
        type: 'error',
        text: 'प्रारंभिक जमा राशि शुद्ध देय फीस से अधिक नहीं हो सकती।',
      });
      return;
    }

    const targetStudent = students.find((s) => s.uid === newFeeStudentId);
    const targetCourse = courses.find((c) => c.id === newFeeCourseId);

    if (!targetStudent || !targetCourse) {
      setFeedbackMessage({
        type: 'error',
        text: 'चयनित विद्यार्थी या कोर्स अमान्य है।',
      });
      return;
    }

    setIsSubmittingNewFee(true);
    try {
      const input: CreateFeeRecordInput = {
        studentId: targetStudent.uid,
        studentName: targetStudent.displayName,
        studentPhone: targetStudent.phoneNumber,
        studentEmail: targetStudent.email,
        classLevel: (targetCourse.classLevel || targetStudent.classLevel || 'class-10') as ClassLevel,
        courseId: targetCourse.id,
        courseName: targetCourse.title,
        batchName: targetCourse.batchName,
        totalFee: newFeeTotal,
        discount: newFeeDiscount,
        initialPaidAmount: newFeeInitialPaid,
        paymentMethod: newFeeInitialPaid > 0 ? newFeePaymentMethod : undefined,
        transactionId: newFeeTxnId.trim() || undefined,
        paymentDate: getTodayDateString(),
        dueDate: newFeeDueDate || undefined,
        notes: newFeeNotes,
      };

      await createOrUpdateFeeRecord(input);
      setShowNewFeeModal(false);
      await loadData();

      setFeedbackMessage({
        type: 'success',
        text: `${targetStudent.displayName} के लिए ${targetCourse.title} का शुल्क विवरण सुरक्षित किया गया।`,
      });
    } catch (err: any) {
      console.error('[OwnerFeeManager] Error creating fee record:', err);
      setFeedbackMessage({
        type: 'error',
        text: err?.message || 'शुल्क रिकॉर्ड बनाने में त्रुटि हुई।',
      });
    } finally {
      setIsSubmittingNewFee(false);
    }
  };

  // When course selected in New Fee modal, auto-fill prices
  const handleSelectNewFeeCourse = (courseId: string) => {
    setNewFeeCourseId(courseId);
    const found = courses.find((c) => c.id === courseId);
    if (found) {
      const base = found.price || 1999;
      const disc = found.discountedPrice ? Math.max(0, base - found.discountedPrice) : 0;
      setNewFeeTotal(base);
      setNewFeeDiscount(disc);
    }
  };

  // Delete Fee Record
  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    try {
      await deleteFeeRecord(recordToDelete.id);
      setShowDeleteConfirmModal(false);
      setRecordToDelete(null);
      await loadData();
      setFeedbackMessage({
        type: 'success',
        text: 'शुल्क रिकॉर्ड सफलतापूर्वक हटा दिया गया।',
      });
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err?.message || 'रिकॉर्ड हटाने में त्रुटि हुई।',
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Feedback Notification */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-bold border transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="p-1 rounded-lg hover:bg-black/5 cursor-pointer text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Action Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-indigo-700 text-white flex items-center justify-center shadow-md shrink-0">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  ऑफलाइन भुगतान एवं शुल्क रसीद (Offline Payment & Receipt)
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                  कार्य 9 सक्रिय
                </span>
              </div>
              <p className="text-sm text-slate-600 font-medium mt-1">
                नकद, UPI, बैंक ट्रांसफर ऑफलाइन भुगतान प्रविष्टि, रसीद निर्माण, प्रिंट एवं किस्त प्रबंधन
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => handleOpenPaymentModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-black transition-colors shadow-xs cursor-pointer min-h-[44px]"
            >
              <CreditCard className="w-4 h-4" />
              <span>ऑफलाइन भुगतान दर्ज करें</span>
            </button>

            <button
              onClick={() => {
                setNewFeeStudentId(students[0]?.uid || '');
                if (courses.length > 0) {
                  handleSelectNewFeeCourse(courses[0].id);
                }
                setNewFeeInitialPaid(0);
                setNewFeeNotes('');
                setShowNewFeeModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-black transition-colors shadow-xs cursor-pointer min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>नया शुल्क आवंटन</span>
            </button>

            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
              title="डेटा रीफ्रेश करें"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
              <span className="hidden sm:inline">रीफ्रेश</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assessed Fee */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              कुल निर्धारित फीस
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {formatCurrency(metrics.totalAssessed)}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              सक्रिय नामांकनों पर शुद्ध देय शुल्क
            </div>
          </div>
        </div>

        {/* Total Collected Fee */}
        <div className="bg-white rounded-3xl border border-emerald-200 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-emerald-500" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              कुल प्राप्त राशि (जमा)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">
              {formatCurrency(metrics.totalCollected)}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-emerald-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.collectionPercentage}%` }}
                />
              </div>
              <span className="text-xs font-black text-emerald-800">
                {metrics.collectionPercentage}% प्राप्त
              </span>
            </div>
          </div>
        </div>

        {/* Total Due / Outstanding */}
        <div className="bg-white rounded-3xl border border-rose-200 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-rose-500" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              कुल बकाया राशि (शेष)
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-rose-700">
              {formatCurrency(metrics.totalDue)}
            </div>
            <div className="text-xs font-semibold text-rose-600 mt-1 flex items-center gap-1">
              <span>{metrics.dueCount + metrics.partialCount + metrics.overdueCount} विद्यार्थियों का शुल्क बकाया</span>
            </div>
          </div>
        </div>

        {/* Students Payment Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              भुगतान स्थिति विभाजन
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 text-center">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="text-lg font-black text-emerald-800">{metrics.paidCount}</div>
              <div className="text-[10px] font-bold text-emerald-700">पूर्ण (Paid)</div>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
              <div className="text-lg font-black text-amber-800">{metrics.partialCount}</div>
              <div className="text-[10px] font-bold text-amber-700">आंशिक</div>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-100">
              <div className="text-lg font-black text-rose-800">{metrics.dueCount + metrics.overdueCount}</div>
              <div className="text-[10px] font-bold text-rose-700">बकाया / अतिदेय</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>सर्च एवं फ़िल्टर (Search & Filter Records)</span>
          </div>

          {(searchQuery || filterClass !== 'all' || filterCourse !== 'all' || filterStatus !== 'all' || filterMethod !== 'all' || filterStudent !== 'all') && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>सभी फ़िल्टर साफ़ करें (Clear All)</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="विद्यार्थी का नाम, मोबाइल नंबर, कोर्स, बैच, रसीद संख्या या Transaction ID खोजें..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
          />
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Class Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">कक्षा (Class)</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50 cursor-pointer min-h-[40px]"
            >
              <option value="all">सभी कक्षाएं (All Classes)</option>
              {CLASSES_METADATA.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.hindiName})
                </option>
              ))}
            </select>
          </div>

          {/* Course / Batch Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">कोर्स / बैच (Course)</label>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50 cursor-pointer min-h-[40px]"
            >
              <option value="all">सभी कोर्सेज (All Courses)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.batchName})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">भुगतान स्थिति (Status)</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50 cursor-pointer min-h-[40px]"
            >
              <option value="all">सभी स्थितियां (All Status)</option>
              <option value="paid">पूर्ण भुगतान (Paid)</option>
              <option value="partial">आंशिक भुगतान (Partial)</option>
              <option value="due">बकाया (Due)</option>
              <option value="overdue">अतिदेय (Overdue)</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">भुगतान माध्यम (Method)</label>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50 cursor-pointer min-h-[40px]"
            >
              <option value="all">सभी माध्यम (All Methods)</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Student Specific Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">विद्यार्थी (Student)</label>
            <select
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50 cursor-pointer min-h-[40px]"
            >
              <option value="all">सभी विद्यार्थी (All Students)</option>
              {students.map((s) => (
                <option key={s.uid} value={s.uid}>
                  {s.displayName} ({s.phoneNumber || s.email})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fee Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-black text-base text-slate-900">
            विद्यार्थी शुल्क लेजर ({filteredRecords.length} रिकॉर्ड्स)
          </h3>
        </div>

        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-slate-600 font-bold text-sm">शुल्क रिकॉर्ड्स लोड हो रहे हैं...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800">कोई शुल्क रिकॉर्ड नहीं मिला</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              वर्तमान फ़िल्टर के अनुसार कोई रिकॉर्ड उपलब्ध नहीं है। कृपया फ़िल्टर बदलें या नया शुल्क आवंटन करें।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 px-4">विद्यार्थी (Student)</th>
                  <th className="py-3.5 px-4">कोर्स व बैच (Course)</th>
                  <th className="py-3.5 px-4">निर्धारित फीस</th>
                  <th className="py-3.5 px-4">जमा राशि (Paid)</th>
                  <th className="py-3.5 px-4">बकाया (Due)</th>
                  <th className="py-3.5 px-4">स्थिति (Status)</th>
                  <th className="py-3.5 px-4">अंतिम भुगतान</th>
                  <th className="py-3.5 px-4 text-right">कार्य (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredRecords.map((record) => {
                  const isPaid = record.paymentStatus === 'paid';
                  const isPartial = record.paymentStatus === 'partial';
                  const isOverdue = record.paymentStatus === 'overdue';

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{record.studentName}</span>
                          {record.isOnlineVerified && (
                            <span title="सत्यापित ऑनलाइन भुगतान" className="text-indigo-600">
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{record.studentPhone || 'फ़ोन उपलब्ध नहीं'}</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                            {record.classLevel.replace('class-', 'कक्षा ')}
                          </span>
                        </div>
                      </td>

                      {/* Course Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-indigo-950">{record.courseName}</div>
                        <div className="text-[11px] text-slate-500">{record.batchName || 'नियमित बैच'}</div>
                      </td>

                      {/* Total Fee & Discount */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{formatCurrency(record.finalFee)}</div>
                        {record.discount > 0 && (
                          <div className="text-[10px] text-emerald-600">
                            छूट: {formatCurrency(record.discount)}
                          </div>
                        )}
                      </td>

                      {/* Paid Amount */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-emerald-700">{formatCurrency(record.paidAmount)}</div>
                        <div className="text-[10px] text-slate-500">
                          {record.installments?.length || 0} किस्त(ें)
                        </div>
                      </td>

                      {/* Due Amount */}
                      <td className="py-3.5 px-4">
                        <div className={`font-black ${record.dueAmount > 0 ? (isOverdue ? 'text-purple-700' : 'text-rose-600') : 'text-emerald-600'}`}>
                          {formatCurrency(record.dueAmount)}
                        </div>
                        {record.dueDate && record.dueAmount > 0 && (
                          <div className="text-[10px] text-slate-500 font-medium">
                            देय तिथि: {formatDisplayDate(record.dueDate)}
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            पूर्ण (Paid)
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-purple-100 text-purple-800 border border-purple-300">
                            <AlertCircle className="w-3 h-3" />
                            अतिदेय (Overdue)
                          </span>
                        ) : isPartial ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3" />
                            आंशिक (Partial)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                            <AlertCircle className="w-3 h-3" />
                            बकाया (Due)
                          </span>
                        )}
                      </td>

                      {/* Last Payment Details */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">
                          {formatDisplayDate(record.lastPaymentDate)}
                        </div>
                        {record.paymentMethod && (
                          <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                            {record.paymentMethod}
                          </div>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Record Payment Button */}
                          {record.dueAmount > 0 && (
                            <button
                              onClick={() => handleOpenPaymentModal(record)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors cursor-pointer min-h-[32px]"
                              title="ऑफलाइन भुगतान दर्ज करें"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                              <span>भुगतान लें</span>
                            </button>
                          )}

                          {/* View Latest Receipt Button */}
                          <button
                            onClick={() => handleOpenReceipt(record)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs border border-indigo-200 transition-colors cursor-pointer min-h-[32px]"
                            title="रसीद देखें व प्रिंट करें"
                          >
                            <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                            <span>रसीद</span>
                          </button>

                          {/* Payment History Button */}
                          <button
                            onClick={() => handleOpenHistory(record)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                            title="किस्त इतिहास देखें"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Record Button (Disabled for online verified payments) */}
                          {!record.isOnlineVerified && (
                            <button
                              onClick={() => {
                                setRecordToDelete(record);
                                setShowDeleteConfirmModal(true);
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                              title="शुल्क रिकॉर्ड हटाएं"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: OFFLINE PAYMENT ENTRY MODAL (ऑफलाइन भुगतान प्रविष्टि) */}
      {/* ========================================================================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border-2 border-slate-200 shadow-2xl space-y-5 my-8">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">ऑफलाइन फीस भुगतान दर्ज करें</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    नकद, UPI, या बैंक ट्रांसफर से प्राप्त शुल्क की सुरक्षित प्रविष्टि
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-4">
              {/* Student Selection (Dropdown if not preselected) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">विद्यार्थी चुनें *</label>
                <select
                  value={paymentStudentId}
                  onChange={(e) => handleModalStudentChange(e.target.value)}
                  required
                  disabled={Boolean(selectedRecord)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white min-h-[44px] disabled:bg-slate-100"
                >
                  <option value="">-- विद्यार्थी चुनें --</option>
                  {students.map((s) => (
                    <option key={s.uid} value={s.uid}>
                      {s.displayName} ({s.phoneNumber || s.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">कोर्स / बैच चुनें *</label>
                <select
                  value={paymentCourseId}
                  onChange={(e) => handleModalCourseChange(e.target.value)}
                  required
                  disabled={Boolean(selectedRecord)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white min-h-[44px] disabled:bg-slate-100"
                >
                  <option value="">-- कोर्स चुनें --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.batchName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Financial Status Breakdown Box */}
              {currentModalTargetFeeRecord ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-slate-500 font-bold block">कुल फीस</span>
                    <span className="text-sm font-black text-slate-900">
                      {formatCurrency(currentModalTargetFeeRecord.finalFee)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">पहले से जमा</span>
                    <span className="text-sm font-black text-emerald-700">
                      {formatCurrency(currentModalTargetFeeRecord.paidAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">शेष बकाया</span>
                    <span className="text-sm font-black text-rose-600">
                      {formatCurrency(currentModalTargetFeeRecord.dueAmount)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-semibold">
                  कोर्स मूल शुल्क: {formatCurrency(courses.find((c) => c.id === paymentCourseId)?.price || 1999)}
                </div>
              )}

              {/* Amount to Pay */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">जमा की जा रही राशि (₹) *</label>
                  {currentModalTargetFeeRecord && currentModalTargetFeeRecord.dueAmount > 0 && (
                    <button
                      type="button"
                      onClick={() => setPaymentAmount(currentModalTargetFeeRecord.dueAmount)}
                      className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                    >
                      पूरा बकाया भरें ({formatCurrency(currentModalTargetFeeRecord.dueAmount)})
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  min="1"
                  max={currentModalTargetFeeRecord ? currentModalTargetFeeRecord.dueAmount : 100000}
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(Number(e.target.value) || 0)}
                  required
                  placeholder="उदा. 1500"
                  className={`w-full px-4 py-2.5 rounded-xl border text-base font-black text-slate-900 focus:outline-hidden focus:ring-2 min-h-[44px] ${
                    currentModalTargetFeeRecord && paymentAmount > currentModalTargetFeeRecord.dueAmount
                      ? 'border-rose-500 focus:ring-rose-500 bg-rose-50/50'
                      : 'border-slate-300 focus:ring-emerald-500'
                  }`}
                />
                {currentModalTargetFeeRecord && paymentAmount > currentModalTargetFeeRecord.dueAmount && (
                  <p className="text-xs font-bold text-rose-600 mt-1">
                    भुगतान राशि शेष बकाया ({formatCurrency(currentModalTargetFeeRecord.dueAmount)}) से अधिक नहीं हो सकती।
                  </p>
                )}
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">भुगतान माध्यम (Payment Method) *</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-2.5 rounded-xl text-left border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer min-h-[44px] ${
                        paymentMethod === m.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction ID / UTR */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ट्रांजेक्शन ID / UPI UTR / संदर्भ ID {(paymentMethod === 'upi' || paymentMethod === 'bank_transfer') ? '*' : '(वैकल्पिक)'}
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required={paymentMethod === 'upi' || paymentMethod === 'bank_transfer'}
                  placeholder={
                    paymentMethod === 'upi'
                      ? 'उदा. UPI1234567890 (अनिवार्य)'
                      : paymentMethod === 'bank_transfer'
                      ? 'उदा. NEFT-REF-987654 (अनिवार्य)'
                      : 'उदा. Cash-Slip-01'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-xs font-medium min-h-[40px]"
                />
              </div>

              {/* Payment Date & Next Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">भुगतान तिथि *</label>
                  <input
                    type="date"
                    value={paymentDate}
                    max={getTodayDateString()}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">अगली देय तिथि (यदि शेष हो)</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 min-h-[40px]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">टिप्पणी / विवरण (Notes)</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="उदा. ऑफलाइन नकद प्राप्त"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-xs font-medium min-h-[40px]"
                />
              </div>

              {/* Real-time Resulting Balance Preview */}
              {currentModalTargetFeeRecord && (
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs font-bold">
                  <span className="text-emerald-950">इस भुगतान के बाद शेष बकाया:</span>
                  <span className={`text-sm font-black ${currentModalTargetFeeRecord.dueAmount - paymentAmount <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {formatCurrency(Math.max(0, currentModalTargetFeeRecord.dueAmount - paymentAmount))}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isSubmittingPayment}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer min-h-[44px]"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmittingPayment ||
                    (currentModalTargetFeeRecord && paymentAmount > currentModalTargetFeeRecord.dueAmount) ||
                    paymentAmount <= 0
                  }
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-md transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
                >
                  {isSubmittingPayment ? (
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>सहेजा जा रहा है...</span>
                    </span>
                  ) : (
                    <span>भुगतान दर्ज करें व रसीद बनाएं</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: OFFICIAL OFFLINE FEE PAYMENT RECEIPT (प्रिंट योग्य रसीद) */}
      {/* ========================================================================= */}
      {showReceiptModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border-2 border-slate-200 shadow-2xl space-y-6 my-8 print:border-none print:shadow-none print:p-2 print:my-0">
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2 text-indigo-950 font-black text-sm">
                <Receipt className="w-5 h-5 text-indigo-700" />
                <span>ऑफलाइन शुल्क भुगतान रसीद</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-xs transition-colors cursor-pointer min-h-[38px]"
                >
                  <Printer className="w-4 h-4" />
                  <span>प्रिंट / PDF सेव करें</span>
                </button>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE RECEIPT CONTAINER */}
            <div
              id="offline-fee-receipt"
              className="border-2 border-slate-900 rounded-2xl p-6 sm:p-7 space-y-5 bg-white text-slate-900 print:border-2 print:border-black print:p-6"
            >
              {/* Receipt Header */}
              <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
                <div className="inline-block px-3 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest mb-1">
                  ऑफलाइन शुल्क भुगतान रसीद
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  RK STUDY CENTRE
                </h1>
                <p className="text-xs font-bold text-slate-700">
                  अध्ययन एवं मार्गदर्शन केंद्र — गुणवत्तापूर्ण शिक्षा का संकल्प
                </p>
                <p className="text-[11px] text-slate-600">
                  हेल्पलाइन: +91 91234 56789 | ईमेल: rkstudycentre064@gmail.com
                </p>
              </div>

              {/* Student Details Section */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">विद्यार्थी का नाम (Student)</div>
                  <div className="text-sm font-black text-slate-900">
                    {selectedInstallment?.studentName || selectedRecord.studentName}
                  </div>
                  <div className="text-slate-600">
                    मोबाइल: {selectedInstallment?.studentPhone || selectedRecord.studentPhone || '—'}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">कोर्स व कक्षा (Enrolled Course)</div>
                  <div className="text-sm font-black text-indigo-950">
                    {selectedInstallment?.courseName || selectedRecord.courseName}
                  </div>
                  <div className="text-slate-600">
                    {selectedInstallment?.batchName || selectedRecord.batchName || 'नियमित बैच'} •{' '}
                    {(selectedInstallment?.classLevel || selectedRecord.classLevel).replace('class-', 'कक्षा ')}वीं
                  </div>
                </div>
              </div>

              {/* Payment Details Section */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">रसीद सं. (Receipt No)</span>
                  <span className="font-mono font-black text-slate-900 text-xs">
                    {selectedInstallment?.receiptNo || 'RK-PAY-REF'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">भुगतान तिथि (Date)</span>
                  <span className="font-black text-slate-900">
                    {formatDisplayDate(selectedInstallment?.paymentDate || selectedRecord.lastPaymentDate)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">माध्यम (Method)</span>
                  <span className="font-black text-slate-900 uppercase">
                    {selectedInstallment?.paymentMethod || selectedRecord.paymentMethod || 'नकद'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">जमा राशि (Paid)</span>
                  <span className="font-black text-emerald-800 text-sm">
                    {formatCurrency(selectedInstallment?.amount || selectedRecord.paidAmount)}
                  </span>
                </div>
              </div>

              {selectedInstallment?.transactionId && (
                <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Transaction / UTR ID:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedInstallment.transactionId}</span>
                </div>
              )}

              {/* Fee Summary Ledger Breakdown */}
              <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-800 font-black border-b border-slate-300">
                    <tr>
                      <th className="p-2.5">शुल्क विवरण (Fee Summary)</th>
                      <th className="p-2.5 text-right">राशि (Amount)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2.5 font-medium text-slate-700">अंतिम शुद्ध देय फीस (Final Fee):</td>
                      <td className="p-2.5 text-right font-black text-slate-900">
                        {formatCurrency(selectedInstallment?.finalFeeSnapshot || selectedRecord.finalFee)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-700">पूर्व में जमा राशि (Previously Paid):</td>
                      <td className="p-2.5 text-right font-bold text-slate-800">
                        {formatCurrency(selectedInstallment?.previouslyPaidSnapshot ?? (selectedRecord.paidAmount - (selectedInstallment?.amount || 0)))}
                      </td>
                    </tr>
                    <tr className="bg-emerald-50 font-black text-emerald-900 border-t-2 border-emerald-300">
                      <td className="p-2.5">वर्तमान में जमा राशि (Current Payment):</td>
                      <td className="p-2.5 text-right text-sm">
                        {formatCurrency(selectedInstallment?.amount || selectedRecord.paidAmount)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-800">कुल जमा राशि (Total Paid to Date):</td>
                      <td className="p-2.5 text-right font-black text-emerald-700">
                        {formatCurrency(
                          selectedInstallment?.previouslyPaidSnapshot !== undefined
                            ? selectedInstallment.previouslyPaidSnapshot + selectedInstallment.amount
                            : selectedRecord.paidAmount
                        )}
                      </td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2.5 font-black text-rose-700">शेष बकाया राशि (Remaining Due):</td>
                      <td className="p-2.5 text-right font-black text-rose-700 text-sm">
                        {formatCurrency(
                          selectedInstallment?.dueAmountAfterSnapshot !== undefined
                            ? selectedInstallment.dueAmountAfterSnapshot
                            : selectedRecord.dueAmount
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer Section */}
              <div className="pt-4 grid grid-cols-2 gap-4 items-end text-xs">
                <div className="space-y-1 text-[11px] text-slate-500">
                  <p>• Payment Source: Offline (ऑफलाइन संग्रह)</p>
                  <p>• यह संस्थान द्वारा जारी आधिकारिक शुल्क रसीद है।</p>
                </div>

                <div className="text-right space-y-8">
                  <div className="text-[11px] font-bold text-slate-400">अधिकृत मुहर एवं हस्ताक्षर</div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-800 text-xs">
                    {selectedInstallment?.collectedByName || 'RK STUDY CENTRE (अधिकृत व्यवस्थापक)'}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer min-h-[44px]"
              >
                बंद करें
              </button>
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-md cursor-pointer min-h-[44px]"
              >
                <Printer className="w-4 h-4" />
                <span>प्रिंट निकालें (Print Receipt)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: INSTALLMENT HISTORY (किस्त इतिहास व रसीद री-ओपन) */}
      {/* ========================================================================= */}
      {showHistoryModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 border-2 border-slate-200 shadow-2xl space-y-5 my-8">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">किस्त भुगतान इतिहास (Payment History)</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedRecord.studentName} — {selectedRecord.courseName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Installments Table */}
            {(!selectedRecord.installments || selectedRecord.installments.length === 0) ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500">कोई किस्त दर्ज नहीं है।</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {selectedRecord.installments.map((inst, index) => (
                  <div
                    key={inst.id || index}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-indigo-900">{inst.receiptNo}</span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase">
                          {inst.paymentMethod}
                        </span>
                        {inst.isOnlineVerified && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            ऑनलाइन सत्यापित
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        तिथि: {formatDisplayDate(inst.paymentDate)}
                        {inst.transactionId && ` | Ref: ${inst.transactionId}`}
                      </div>
                      {inst.notes && <div className="text-[11px] text-slate-600 italic">{inst.notes}</div>}
                    </div>

                    <div className="text-right space-y-1.5">
                      <div className="text-base font-black text-emerald-700">{formatCurrency(inst.amount)}</div>
                      <div className="flex items-center justify-end gap-2">
                        {/* View Historical Receipt Action */}
                        <button
                          onClick={() => {
                            setShowHistoryModal(false);
                            handleOpenReceipt(selectedRecord, inst);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-black text-indigo-600 hover:text-indigo-800 cursor-pointer min-h-[28px]"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>रसीद देखें</span>
                        </button>

                        {/* Reverse Offline Installment Action */}
                        {!inst.isOnlineVerified && inst.source !== 'online' && (
                          <button
                            onClick={() => {
                              setInstallmentToReverse({ feeId: selectedRecord.id, installment: inst });
                              setShowReverseConfirmModal(true);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer ml-1"
                            title="किस्त रिवर्ट करें"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>रिवर्ट</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer min-h-[44px]"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: NEW FEE ASSIGNMENT (नया शुल्क आवंटन) */}
      {/* ========================================================================= */}
      {showNewFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border-2 border-slate-200 shadow-2xl space-y-5 my-8">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">नया शुल्क आवंटन (Assign Fee)</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    विद्यार्थी के लिए कोर्स शुल्क, छात्रवृत्ति छूट व प्रारंभिक जमा निर्धारित करें
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewFeeModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewFee} className="space-y-4">
              {/* Select Student */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">विद्यार्थी चुनें *</label>
                <select
                  value={newFeeStudentId}
                  onChange={(e) => setNewFeeStudentId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white min-h-[44px]"
                >
                  <option value="">-- विद्यार्थी चुनें --</option>
                  {students.map((s) => (
                    <option key={s.uid} value={s.uid}>
                      {s.displayName} ({s.phoneNumber || s.email}) — {s.classLevel ? s.classLevel.replace('class-', 'कक्षा ') : 'कक्षा 10'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Course */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">कोर्स / बैच चुनें *</label>
                <select
                  value={newFeeCourseId}
                  onChange={(e) => handleSelectNewFeeCourse(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white min-h-[44px]"
                >
                  <option value="">-- कोर्स चुनें --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.batchName}) — {formatCurrency(c.price || 1999)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Total Fee & Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">मूल कोर्स फीस (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    value={newFeeTotal}
                    onChange={(e) => setNewFeeTotal(Number(e.target.value) || 0)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">छूट / छात्रवृत्ति (₹)</label>
                  <input
                    type="number"
                    min="0"
                    max={newFeeTotal}
                    value={newFeeDiscount}
                    onChange={(e) => setNewFeeDiscount(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-emerald-700 min-h-[40px]"
                  />
                </div>
              </div>

              {/* Net Payable Summary */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">शुद्ध देय फीस (Net Fee):</span>
                <span className="text-sm font-black text-slate-900">
                  {formatCurrency(Math.max(0, newFeeTotal - newFeeDiscount))}
                </span>
              </div>

              {/* Initial Paid Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  प्रारंभिक जमा राशि (₹) (यदि तुरंत भुगतान किया गया हो)
                </label>
                <input
                  type="number"
                  min="0"
                  max={Math.max(0, newFeeTotal - newFeeDiscount)}
                  value={newFeeInitialPaid}
                  onChange={(e) => setNewFeeInitialPaid(Number(e.target.value) || 0)}
                  placeholder="उदा. 500"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-black text-slate-900 min-h-[40px]"
                />
              </div>

              {newFeeInitialPaid > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">भुगतान माध्यम</label>
                    <select
                      value={newFeePaymentMethod}
                      onChange={(e) => setNewFeePaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 min-h-[40px]"
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Txn ID / Ref</label>
                    <input
                      type="text"
                      value={newFeeTxnId}
                      onChange={(e) => setNewFeeTxnId(e.target.value)}
                      placeholder="उदा. UPI-1234"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium min-h-[40px]"
                    />
                  </div>
                </div>
              )}

              {/* Next Due Date & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">बकाया भुगतान अंतिम तिथि</label>
                  <input
                    type="date"
                    value={newFeeDueDate}
                    onChange={(e) => setNewFeeDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">टिप्पणी (Notes)</label>
                  <input
                    type="text"
                    value={newFeeNotes}
                    onChange={(e) => setNewFeeNotes(e.target.value)}
                    placeholder="उदा. छात्रवृत्ति स्वीकृत"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium min-h-[40px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFeeModal(false)}
                  disabled={isSubmittingNewFee}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer min-h-[44px]"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewFee}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50 min-h-[44px]"
                >
                  {isSubmittingNewFee ? 'आवंटित हो रहा है...' : 'शुल्क आवंटित करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DELETE RECORD CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal && !!recordToDelete}
        onClose={() => {
          setShowDeleteConfirmModal(false);
          setRecordToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="शुल्क रिकॉर्ड हटाएं"
        message={
          recordToDelete ? (
            <span>
              क्या आप <strong>{recordToDelete.studentName}</strong> का <strong>{recordToDelete.courseName}</strong> शुल्क रिकॉर्ड हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकेगी।
            </span>
          ) : ""
        }
        confirmText="हाँ, हटाएं"
        cancelText="रद्द करें"
        variant="danger"
      />

      {/* ========================================================================= */}
      {/* MODAL 6: REVERSE INSTALLMENT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      <ConfirmModal
        isOpen={showReverseConfirmModal && !!installmentToReverse}
        onClose={() => {
          setShowReverseConfirmModal(false);
          setInstallmentToReverse(null);
        }}
        onConfirm={handleConfirmReverse}
        title="ऑफलाइन किस्त रिवर्ट करें"
        message={
          installmentToReverse ? (
            <span>
              क्या आप रसीद सं. <strong>{installmentToReverse.installment.receiptNo}</strong> (राशि: {formatCurrency(installmentToReverse.installment.amount)}) को रिवर्ट करना चाहते हैं? छात्र का कुल जमा व शेष बकाया शुल्क तुरंत स्वतः पुनर्गणित होगा।
            </span>
          ) : ""
        }
        confirmText="हाँ, रिवर्ट करें"
        cancelText="रद्द करें"
        variant="warning"
        isLoading={isReversing}
        loadingText="रिवर्ट हो रहा है..."
      />
    </div>
  );
}
