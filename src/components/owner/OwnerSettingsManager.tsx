/**
 * RK STUDY CENTRE - Owner Settings Manager (Step 6G)
 * 
 * Safe Owner-Only Module for:
 * 1. Bright / Light Mode vs Dark Mode Theme Management
 * 2. Payment Status Overview & Real Enrollment Verification
 * 3. Owner Account & Security Status Information
 * 4. Institution Metadata & Support Configuration
 */

import { useState, useEffect, type FormEvent } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Laptop,
  Globe,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  User,
  Mail,
  Phone,
  Building,
  Check,
  Sparkles,
  Lock,
  Filter,
  Megaphone,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { AppTheme } from '../../types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  getOwnerSettings,
  saveOwnerSettings,
  getEnrollmentPaymentRecords,
  updateStudentCoursePaymentStatus,
  type OwnerSettingsData,
  type EnrollmentPaymentRecord,
  DEFAULT_SETTINGS
} from '../../services/settingsService';

type SettingsTab = 'global' | 'theme' | 'payment' | 'account' | 'institution';

export function OwnerSettingsManager() {
  const { user, isOwner, hasCustomClaim } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>('global');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Settings State
  const [settings, setSettings] = useState<OwnerSettingsData>(DEFAULT_SETTINGS);
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>('light');

  // Profile Editor State (MANDATORY HARDENING & RECOVERY)
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [profileName, setProfileName] = useState<string>('');
  const [profilePhone, setProfilePhone] = useState<string>('');
  const [profilePhotoURL, setProfilePhotoURL] = useState<string>('');
  
  // Validation Errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Upload States
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Confirm delete states (reuses ConfirmModal)
  const [showDeleteAvatarConfirm, setShowDeleteAvatarConfirm] = useState<boolean>(false);
  const [showDeleteLogoConfirm, setShowDeleteLogoConfirm] = useState<boolean>(false);

  // Payment Records State
  const [paymentRecords, setPaymentRecords] = useState<EnrollmentPaymentRecord[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState<boolean>(false);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'successful'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);

  // Load Settings and Payment Records
  const loadData = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const currentSettings = await getOwnerSettings();
      setSettings(currentSettings);
      setSelectedTheme(currentSettings.theme);

      // Load payments
      setIsLoadingPayments(true);
      const records = await getEnrollmentPaymentRecords();
      setPaymentRecords(records);

      // Load current user profile from users collection explicitly for the Owner Profile Editor
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const uData = userSnap.data();
          setProfileName(uData.displayName || '');
          // Strip any +91 leading spaces for clean Indian formatting
          const phoneVal = uData.phoneNumber || uData.phone || '';
          setProfilePhone(phoneVal.replace('+91 ', '').trim());
          setProfilePhotoURL(uData.photoURL || '');
        } else {
          setProfileName(user.displayName || '');
          setProfilePhone('');
          setProfilePhotoURL(user.photoURL || '');
        }
      }
    } catch (error: any) {
      console.error('[OwnerSettingsManager] Error loading data:', error);
      setStatusMessage({
        type: 'error',
        text: 'सेटिंग्स या भुगतान रिकॉर्ड लोड करने में त्रुटि: ' + (error.message || 'नेटवर्क समस्या'),
      });
    } finally {
      setIsLoading(false);
      setIsLoadingPayments(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Owner Profile & Validate Fields (Task 23 Constraint)
  const handleSaveOwnerProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // 1. Validation Checks (Zero Native Dialogs, 100% Inline Feedback)
    const errors: Record<string, string> = {};
    if (!profileName.trim()) {
      errors.name = 'नाम दर्ज करना अनिवार्य है।';
    } else if (profileName.trim().length > 128) {
      errors.name = 'नाम बहुत लंबा है (अधिकतम 128 अक्षर)।';
    }

    const cleanPhone = profilePhone.replace(/\s+/g, '');
    const indianMobileRegex = /^[6789]\d{9}$/;
    if (!cleanPhone) {
      errors.phone = 'मोबाइल नंबर दर्ज करना अनिवार्य है।';
    } else if (!indianMobileRegex.test(cleanPhone)) {
      errors.phone = 'कृपया एक मान्य 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें (उदा. 9876543210)।';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Focus on first failing field
      const firstErrorKey = Object.keys(errors)[0];
      const el = document.getElementById(`profile-${firstErrorKey}`);
      el?.focus();
      return;
    }

    setValidationErrors({});
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const formattedPhone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
      
      await updateDoc(userDocRef, {
        displayName: profileName.trim(),
        phoneNumber: formattedPhone,
        phone: formattedPhone,
        updatedAt: new Date().toISOString(),
      });

      setIsEditingProfile(false);
      setStatusMessage({
        type: 'success',
        text: 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई (Profile successfully updated)।',
      });
    } catch (err: any) {
      console.error('[OwnerSettingsManager] Profile update error:', err);
      setStatusMessage({
        type: 'error',
        text: 'प्रोफ़ाइल अपडेट करने में समस्या आई। कृपया पुनः प्रयास करें।',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Safe predictable path file upload to Storage
  const handleFileUpload = async (file: File, type: 'avatar' | 'logo') => {
    if (!user) return;

    // 1. Client-side Validation Checks
    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'केवल चित्र फ़ाइलें (Images) ही अपलोड की जा सकती हैं।' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'अपलोड आकार सीमा 5MB है। आपकी फ़ाइल बहुत बड़ी है।' });
      return;
    }

    const setUploading = type === 'avatar' ? setIsUploadingAvatar : setIsUploadingLogo;
    setUploading(true);
    setUploadProgress(0);
    setStatusMessage(null);

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const storagePath = `owner-profile/${user.uid}/${type}_${Date.now()}_${sanitizedName}`;
      const fileRef = storageRef(storage, storagePath);

      const uploadTask = uploadBytesResumable(fileRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setUploadProgress(pct);
          },
          (err) => reject(err),
          () => resolve()
        );
      });

      const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

      if (type === 'avatar') {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          photoURL: downloadUrl,
          updatedAt: new Date().toISOString(),
        });
        setProfilePhotoURL(downloadUrl);
        setStatusMessage({ type: 'success', text: 'प्रोफ़ाइल फ़ोटो सफलतापूर्वक अपलोड की गई।' });
      } else {
        await saveOwnerSettings({ instituteLogoUrl: downloadUrl }, user.email || undefined);
        setSettings((prev) => ({ ...prev, instituteLogoUrl: downloadUrl }));
        setStatusMessage({ type: 'success', text: 'संस्थान लोगो सफलतापूर्वक अपलोड किया गया।' });
      }
    } catch (err: any) {
      console.error('[OwnerSettingsManager] Upload error:', err);
      setStatusMessage({
        type: 'error',
        text: 'फ़ाइल अपलोड करने में त्रुटि: ' + (err.message || 'सुरक्षा प्रतिबंध या नेटवर्क समस्या'),
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const executeDeleteAvatar = async () => {
    if (!user) return;
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        photoURL: '',
        updatedAt: new Date().toISOString(),
      });
      setProfilePhotoURL('');
      setStatusMessage({ type: 'success', text: 'प्रोफ़ाइल फ़ोटो हटा दी गई।' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'हटाने में विफलता: ' + err.message });
    } finally {
      setIsSaving(false);
      setShowDeleteAvatarConfirm(false);
    }
  };

  const executeDeleteLogo = async () => {
    if (!user) return;
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await saveOwnerSettings({ instituteLogoUrl: '' }, user.email || undefined);
      setSettings((prev) => ({ ...prev, instituteLogoUrl: '' }));
      setStatusMessage({ type: 'success', text: 'संस्थान लोगो हटा दिया गया।' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'हटाने में विफलता: ' + err.message });
    } finally {
      setIsSaving(false);
      setShowDeleteLogoConfirm(false);
    }
  };

  // Handle Theme Selection & Immediate Preview
  const handleSelectTheme = async (theme: AppTheme) => {
    setSelectedTheme(theme);
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await saveOwnerSettings({ theme }, user?.email || undefined);
      setSettings((prev) => ({ ...prev, theme }));
      const label =
        theme === 'dark'
          ? 'डार्क मोड (Dark Mode)'
          : theme === 'system'
          ? 'सिस्टम डिफ़ॉल्ट (System Theme)'
          : 'ब्राइट / लाइट मोड (Light Mode)';
      setStatusMessage({
        type: 'success',
        text: `थीम को सफलतापूर्वक "${label}" पर सेट किया गया।`,
      });
    } catch (error: any) {
      setStatusMessage({
        type: 'error',
        text: 'थीम सहेजने में त्रुटि: ' + (error.message || 'त्रुटि'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Global Website Settings Save
  const handleSaveGlobalSettings = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await saveOwnerSettings(
        {
          websiteName: settings.websiteName,
          logoText: settings.logoText,
          defaultLanguage: settings.defaultLanguage,
          supportEmail: settings.supportEmail,
          supportPhone: settings.supportPhone,
          theme: selectedTheme,
          announcementMessage: settings.announcementMessage,
          isAnnouncementActive: settings.isAnnouncementActive,
          maintenanceMessage: settings.maintenanceMessage,
          isMaintenanceActive: settings.isMaintenanceActive,
        },
        user?.email || undefined
      );
      setStatusMessage({
        type: 'success',
        text: 'वैश्विक सेटिंग्स, घोषणा एवं रखरखाव सेटिंग्स सफलतापूर्वक सहेजी गईं।',
      });
    } catch (error: any) {
      setStatusMessage({
        type: 'error',
        text: 'सेटिंग्स सहेजने में विफल: ' + (error.message || 'अज्ञात त्रुटि'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Toggle Announcement Status
  const handleToggleAnnouncement = async (newActive: boolean) => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await saveOwnerSettings(
        {
          isAnnouncementActive: newActive,
          announcementMessage: settings.announcementMessage,
        },
        user?.email || undefined
      );
      setSettings((prev) => ({ ...prev, isAnnouncementActive: newActive }));
      setStatusMessage({
        type: 'success',
        text: `सार्वजनिक घोषणा (Global Announcement) को ${newActive ? 'चालू (ON)' : 'बंद (OFF)'} कर दिया गया।`,
      });
    } catch (error: any) {
      setStatusMessage({
        type: 'error',
        text: 'घोषणा स्थिति बदलने में त्रुटि: ' + (error.message || 'त्रुटि'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Toggle Maintenance Mode Status
  const handleToggleMaintenance = async (newActive: boolean) => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await saveOwnerSettings(
        {
          isMaintenanceActive: newActive,
          maintenanceMessage: settings.maintenanceMessage,
        },
        user?.email || undefined
      );
      setSettings((prev) => ({ ...prev, isMaintenanceActive: newActive }));
      setStatusMessage({
        type: 'success',
        text: `रखरखाव मोड (Maintenance Mode) को ${newActive ? 'चालू (ON - केवल Owner पहुंच)' : 'बंद (OFF - सामान्य वेबसाइट सक्रिय)'} कर दिया गया।`,
      });
    } catch (error: any) {
      setStatusMessage({
        type: 'error',
        text: 'रखरखाव स्थिति बदलने में त्रुटि: ' + (error.message || 'त्रुटि'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Institution Metadata Save
  const handleSaveInstitutionSettings = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await saveOwnerSettings(
        {
          instituteName: settings.instituteName,
          supportPhone: settings.supportPhone,
          supportEmail: settings.supportEmail,
          noticeBanner: settings.noticeBanner,
          isNoticeActive: settings.isNoticeActive,
        },
        user?.email || undefined
      );
      setStatusMessage({
        type: 'success',
        text: 'संस्थान विवरण एवं सहायता सेटिंग्स सफलतापूर्वक सहेजी गईं।',
      });
    } catch (error: any) {
      setStatusMessage({
        type: 'error',
        text: 'सेटिंग्स सहेजने में विफल: ' + (error.message || 'अज्ञात त्रुटि'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Manual Payment Status Update
  const handleTogglePaymentStatus = async (
    record: EnrollmentPaymentRecord,
    newStatus: 'successful' | 'pending'
  ) => {
    setUpdatingPaymentId(record.id);
    setStatusMessage(null);
    try {
      await updateStudentCoursePaymentStatus(record.studentUid, record.courseId, newStatus);
      setPaymentRecords((prev) =>
        prev.map((r) => (r.id === record.id ? { ...r, paymentStatus: newStatus } : r))
      );
      setStatusMessage({
        type: 'success',
        text: `विद्यार्थी ${record.studentName} का भुगतान स्थिति बदलकर "${
          newStatus === 'successful' ? 'भुगतान सफल (Payment Successful)' : 'भुगतान लंबित (Payment Pending)'
        }" कर दिया गया।`,
      });
    } catch (error: any) {
      setStatusMessage({
        type: 'error',
        text: 'भुगतान स्थिति बदलने में त्रुटि: ' + (error.message || 'त्रुटि'),
      });
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  // Filtered Payments
  const filteredPayments = paymentRecords.filter((record) => {
    if (paymentFilter !== 'all' && record.paymentStatus !== paymentFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = record.studentName.toLowerCase().includes(q);
      const matchEmail = record.studentEmail.toLowerCase().includes(q);
      const matchCourse = record.courseTitle.toLowerCase().includes(q);
      const matchPhone = record.studentPhone.toLowerCase().includes(q);
      return matchName || matchEmail || matchCourse || matchPhone;
    }
    return true;
  });

  const totalEnrollments = paymentRecords.length;
  const successfulPayments = paymentRecords.filter((r) => r.paymentStatus === 'successful').length;
  const pendingPayments = paymentRecords.filter((r) => r.paymentStatus === 'pending').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* शीर्ष शीर्षक एवं सारांश कार्ड */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-md shrink-0">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black px-2.5 py-1 rounded bg-slate-100 text-slate-800 uppercase tracking-wide">
                  Step 6G
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  व्यवस्थापक सेटिंग्स (Owner Settings)
                </h2>
              </div>
              <p className="text-slate-600 text-sm font-medium mt-1">
                वेबसाइट थीम (लाइट / डार्क), वास्तविक नामांकन भुगतान स्थिति समीक्षा एवं व्यवस्थापक सुरक्षा नियंत्रण।
              </p>
            </div>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer shadow-2xs self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>रिफ्रेश करें</span>
          </button>
        </div>

        {/* स्टेटस मैसेज बैनर (Success / Error) */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="text-sm font-bold flex-1">{statusMessage.text}</div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs font-bold opacity-70 hover:opacity-100 cursor-pointer"
            >
              हटाएं
            </button>
          </div>
        )}
      </div>

      {/* सेटिंग्स टैब्स नेविगेशन */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex-wrap">
        <button
          onClick={() => setActiveTab('global')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            activeTab === 'global'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>वैश्विक सेटिंग्स (Global Settings)</span>
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            activeTab === 'theme'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>थीम सेटिंग्स (Theme Mode)</span>
        </button>

        <button
          onClick={() => setActiveTab('payment')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            activeTab === 'payment'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>भुगतान स्थिति (Payment Status)</span>
          {pendingPayments > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[11px] font-black">
              {pendingPayments} लंबित
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            activeTab === 'account'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>संचालक खाता (Owner Account)</span>
        </button>

        <button
          onClick={() => setActiveTab('institution')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            activeTab === 'institution'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>संस्थान विवरण (Institute Info)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 0. GLOBAL WEBSITE SETTINGS (वैश्विक वेबसाइट सेटिंग्स)                      */}
      {/* ========================================================================= */}
      {activeTab === 'global' && (
        <form
          onSubmit={handleSaveGlobalSettings}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-7"
        >
          <div>
            <span className="text-xs font-black text-blue-700 uppercase tracking-widest">
              Global Platform Configuration
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              वैश्विक वेबसाइट सेटिंग्स (Global Website Settings)
            </h3>
            <p className="text-slate-600 text-sm font-medium mt-1.5 leading-relaxed max-w-3xl">
              यहाँ से पूरी वेबसाइट का नाम, ब्रांड लोगो, डिफ़ॉल्ट हिंदी भाषा, थीम मोड और आधिकारिक सहायता संपर्क प्रबंधित करें।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Website Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>वेबसाइट का नाम (Website Name)</span>
              </label>
              <input
                type="text"
                required
                value={settings.websiteName}
                onChange={(e) => setSettings({ ...settings, websiteName: e.target.value })}
                placeholder="RK STUDY CENTRE"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <p className="text-[11px] text-slate-500">सभी पृष्ठों के शीर्ष हेडर और शीर्षक में दिखाई देगा।</p>
            </div>

            {/* Brand Logo Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>लोगो एवं ब्रांड टेक्स्ट (Logo / Brand Text)</span>
              </label>
              <input
                type="text"
                required
                value={settings.logoText}
                onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
                placeholder="RK STUDY CENTRE"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <p className="text-[11px] text-slate-500">हेडर लोगो बैज के साथ प्रदर्शित ब्रांड नाम।</p>
            </div>

            {/* Default Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-teal-600" />
                <span>डिफ़ॉल्ट भाषा (Default Language)</span>
              </label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) =>
                  setSettings({ ...settings, defaultLanguage: e.target.value as 'hi' | 'en' })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="hi">हिंदी (Hindi - Default)</option>
                <option value="en">English (अंग्रेजी)</option>
              </select>
              <p className="text-[11px] text-emerald-700 font-bold">
                ✓ हिंदी (Hindi) को डिफ़ॉल्ट प्राथमिक भाषा के रूप में निर्धारित किया गया है।
              </p>
            </div>

            {/* Support Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <span>सहायता ईमेल (Support Email)</span>
              </label>
              <input
                type="email"
                required
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                placeholder="rkstudycentre064@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <p className="text-[11px] text-slate-500">विद्यार्थियों को सहायता एवं संपर्क हेतु उपलब्ध ईमेल।</p>
            </div>
          </div>

          {/* Theme Selector Inside Global Tab */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>थीम मोड (Light / Dark / System Theme)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">वेबसाइट के लिए प्राथमिक रंग प्रारूप चुनें:</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleSelectTheme('light')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedTheme === 'light'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-200'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">लाइट मोड (Light)</div>
                    <div className="text-[11px] text-slate-500">उज्ज्वल व स्पष्ट</div>
                  </div>
                </div>
                {selectedTheme === 'light' && <Check className="w-4 h-4 text-blue-600 stroke-[3]" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectTheme('dark')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedTheme === 'dark'
                    ? 'border-indigo-600 bg-slate-900 text-white shadow-xs ring-1 ring-indigo-300'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-900 text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black">डार्क मोड (Dark)</div>
                    <div className="text-[11px] text-slate-400">नेवी डार्क इंटरफ़ेस</div>
                  </div>
                </div>
                {selectedTheme === 'dark' && <Check className="w-4 h-4 text-indigo-400 stroke-[3]" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectTheme('system')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedTheme === 'system'
                    ? 'border-purple-600 bg-purple-50/50 shadow-xs ring-1 ring-purple-200'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">सिस्टम डिफ़ॉल्ट (System)</div>
                    <div className="text-[11px] text-slate-500">डिवाइस अनुसार</div>
                  </div>
                </div>
                {selectedTheme === 'system' && <Check className="w-4 h-4 text-purple-600 stroke-[3]" />}
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 1. GLOBAL ANNOUNCEMENT (सार्वजनिक घोषणा)                                   */}
          {/* ========================================================================= */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/70 p-4 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>1. सार्वजनिक घोषणा (Global Announcement)</span>
                    <span
                      className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                        settings.isAnnouncementActive
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {settings.isAnnouncementActive ? '🟢 सक्रिय (ON)' : '⚪ बंद (OFF)'}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    यह संदेश सभी विद्यार्थियों को वेबसाइट के शीर्ष पर प्रमुखता से दिखाई देगा।
                  </p>
                </div>
              </div>

              {/* Instant ON/OFF Toggle */}
              <button
                type="button"
                onClick={() => handleToggleAnnouncement(!settings.isAnnouncementActive)}
                disabled={isSaving}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs disabled:opacity-50 ${
                  settings.isAnnouncementActive
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-800 hover:bg-slate-900 text-white'
                }`}
              >
                {settings.isAnnouncementActive ? 'घोषणा बंद करें (Turn OFF)' : 'घोषणा चालू करें (Turn ON)'}
              </button>
            </div>

            {/* Announcement Message Input */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>घोषणा संदेश (Announcement Message)</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  {settings.announcementMessage?.length || 0} अक्षर
                </span>
              </label>
              <textarea
                rows={3}
                value={settings.announcementMessage}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcementMessage: e.target.value,
                    noticeBanner: e.target.value,
                  })
                }
                placeholder="उदा. सत्र 2025-26 के लिए नए लक्ष्य बैचों में नामांकन प्रारंभ हैं। सभी अध्ययन सामग्री एवं ऑनलाइन टेस्ट उपलब्ध हैं।"
                className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
              />
            </div>

            {/* Live Student Announcement Preview */}
            {settings.isAnnouncementActive && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  विद्यार्थी पृष्ठ पर ऐसा दिखेगा (Live Student Preview):
                </div>
                <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-xs sm:text-sm font-semibold p-3 rounded-xl shadow-xs flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-amber-950 text-[10px] font-black uppercase">
                    सूचना
                  </span>
                  <span className="truncate">
                    {settings.announcementMessage || 'सत्र 2025-26 के लिए नए लक्ष्य बैचों में नामांकन प्रारंभ हैं।'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 2. MAINTENANCE MODE (रखरखाव मोड)                                          */}
          {/* ========================================================================= */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border transition-colors ${
                settings.isMaintenanceActive
                  ? 'bg-amber-500/10 border-amber-300'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                    settings.isMaintenanceActive
                      ? 'bg-amber-500 text-slate-950 animate-pulse'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>2. रखरखाव मोड (Maintenance Mode)</span>
                    <span
                      className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                        settings.isMaintenanceActive
                          ? 'bg-amber-400 text-amber-950 border border-amber-500 font-extrabold'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {settings.isMaintenanceActive ? '⚠️ रखरखाव चालू (Active)' : '✅ सामान्य मोड (Normal)'}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    रखरखाव मोड ऑन होने पर सामान्य विद्यार्थी रखरखाव स्क्रीन देखेंगे, जबकि{' '}
                    <strong className="text-slate-900 font-bold">व्यवस्थापक (Owner Portal) हमेशा सुलभ रहेगा।</strong>
                  </p>
                </div>
              </div>

              {/* Instant ON/OFF Toggle */}
              <button
                type="button"
                onClick={() => handleToggleMaintenance(!settings.isMaintenanceActive)}
                disabled={isSaving}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs disabled:opacity-50 ${
                  settings.isMaintenanceActive
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 ring-2 ring-amber-400'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {settings.isMaintenanceActive ? 'रखरखाव बंद करें (Turn Normal)' : 'रखरखाव चालू करें (Enable Maintenance)'}
              </button>
            </div>

            {/* Maintenance Message Input */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>रखरखाव संदेश (Maintenance Message)</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  {settings.maintenanceMessage?.length || 0} अक्षर
                </span>
              </label>
              <textarea
                rows={3}
                value={settings.maintenanceMessage}
                onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                placeholder="वेबसाइट पर वर्तमान में आवश्यक तकनीकी सुधार (Maintenance) कार्य चल रहा है। शीघ्र ही सभी सेवाएं सामान्य रूप से उपलब्ध होंगी। किसी भी सहायता हेतु संपर्क करें: rkstudycentre064@gmail.com"
                className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
              />
            </div>

            {/* Security Guarantee Note */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-slate-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-slate-900">व्यवस्थापक सुरक्षा गारंटी:</strong> रखरखाव मोड सक्रिय होने पर भी आप (Owner) कभी भी लॉग आउट नहीं होंगे तथा Owner Portal एवं सेटिंग्स में आपकी पूरी पहुंच बनी रहेगी।
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-sm flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>सहेजा जा रहा है...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>वैश्विक सेटिंग्स सहेजें (Save Global Settings)</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 1. THEME SETTINGS (थीम सेटिंग्स)                                         */}
      {/* ========================================================================= */}
      {activeTab === 'theme' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-7">
          <div>
            <span className="text-xs font-black text-blue-700 uppercase tracking-widest">
              Visual Appearance
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              वेबसाइट थीम चयन (Light, Dark एवं System Mode)
            </h3>
            <p className="text-slate-600 text-sm font-medium mt-1.5 leading-relaxed max-w-3xl">
              थीम चयन करने पर संपूर्ण वेबसाइट (लॉगिन, कक्षाएं 9-12, अध्ययन सामग्री, टेस्ट, कोर्सेज एवं व्यवस्थापक डैशबोर्ड) तुरंत उसी रंग प्रारूप में अनुकूलित हो जाती है।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ब्राइट / लाइट मोड कार्ड */}
            <div
              onClick={() => handleSelectTheme('light')}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between space-y-5 ${
                selectedTheme === 'light'
                  ? 'border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-100'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center border border-amber-200">
                    <Sun className="w-6 h-6" />
                  </div>
                  {selectedTheme === 'light' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      सक्रिय (Active)
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    उज्ज्वल / लाइट मोड (Light Mode)
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-relaxed">
                    दिन के समय एवं सामान्य अध्ययन के लिए उपयुक्त। उच्च पठनीयता और स्पष्ट कंट्रास्ट।
                  </p>
                </div>
              </div>

              {/* मिनी प्रीव्यू */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="h-3 w-1/3 bg-blue-600 rounded-md" />
                <div className="h-2 w-3/4 bg-slate-300 rounded-md" />
                <div className="h-2 w-1/2 bg-slate-200 rounded-md" />
              </div>

              <button
                type="button"
                disabled={isSaving}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  selectedTheme === 'light'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {selectedTheme === 'light' ? 'लाइट मोड सक्रिय है' : 'लाइट मोड चुनें'}
              </button>
            </div>

            {/* डार्क मोड कार्ड */}
            <div
              onClick={() => handleSelectTheme('dark')}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between space-y-5 ${
                selectedTheme === 'dark'
                  ? 'border-indigo-600 bg-slate-900 text-white shadow-md ring-2 ring-indigo-200'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-900 text-slate-100'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <Moon className="w-6 h-6" />
                  </div>
                  {selectedTheme === 'dark' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-indigo-600 text-white">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      सक्रिय (Active)
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-lg font-black text-white">
                    डार्क मोड (Dark Mode)
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1 leading-relaxed">
                    रात के समय आंखों पर तनाव कम करने वाला डार्क नेवी एवं स्लेट इंटरफ़ेस।
                  </p>
                </div>
              </div>

              {/* मिनी प्रीव्यू */}
              <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
                <div className="h-3 w-1/3 bg-indigo-400 rounded-md" />
                <div className="h-2 w-3/4 bg-slate-600 rounded-md" />
                <div className="h-2 w-1/2 bg-slate-700 rounded-md" />
              </div>

              <button
                type="button"
                disabled={isSaving}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  selectedTheme === 'dark'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                {selectedTheme === 'dark' ? 'डार्क मोड सक्रिय है' : 'डार्क मोड चुनें'}
              </button>
            </div>

            {/* सिस्टम डिफ़ॉल्ट कार्ड */}
            <div
              onClick={() => handleSelectTheme('system')}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between space-y-5 ${
                selectedTheme === 'system'
                  ? 'border-purple-600 bg-purple-50/40 shadow-md ring-2 ring-purple-100'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center border border-purple-200">
                    <Laptop className="w-6 h-6" />
                  </div>
                  {selectedTheme === 'system' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-purple-600 text-white">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      सक्रिय (Active)
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    सिस्टम डिफ़ॉल्ट (System Theme)
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-relaxed">
                    उपयोगकर्ता के डिवाइस (Windows, Mac, Android, iOS) के डार्क/लाइट मोड के अनुसार स्वचालित रूप से बदलता है।
                  </p>
                </div>
              </div>

              {/* मिनी प्रीव्यू */}
              <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 space-y-2">
                <div className="h-3 w-1/3 bg-purple-600 rounded-md" />
                <div className="h-2 w-3/4 bg-slate-400 rounded-md" />
                <div className="h-2 w-1/2 bg-slate-300 rounded-md" />
              </div>

              <button
                type="button"
                disabled={isSaving}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  selectedTheme === 'system'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {selectedTheme === 'system' ? 'सिस्टम थीम सक्रिय है' : 'सिस्टम थीम चुनें'}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium leading-relaxed">
            💡 <strong>नोट:</strong> थीम सेटिंग फ़ायरस्टोर डेटाबेस के <code>settings/general</code> में सुरक्षित रूप से संरक्षित रहती है और स्थानीय ब्राउज़र में तुरंत कैश हो जाती है।
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PAYMENT STATUS & ENROLLMENT RECORDS (भुगतान स्थिति समीक्षा)            */}
      {/* ========================================================================= */}
      {activeTab === 'payment' && (
        <div className="space-y-6">
          {/* सारांश सांख्यिकी कार्ड्स */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
              <div className="text-xs font-black text-slate-500 uppercase tracking-wider">
                कुल कोर्स नामांकन
              </div>
              <div className="text-3xl font-black text-slate-900">{totalEnrollments}</div>
              <div className="text-xs text-slate-500 font-medium">पंजीकृत विद्यार्थियों द्वारा लिए गए बैच</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-2xs space-y-1">
              <div className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>सफल भुगतान (Payment Successful)</span>
              </div>
              <div className="text-3xl font-black text-emerald-700">{successfulPayments}</div>
              <div className="text-xs text-emerald-800 font-medium">पुष्टि किए गए सक्रिय नामांकन</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-2xs space-y-1">
              <div className="text-xs font-black text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>लंबित भुगतान (Payment Pending)</span>
              </div>
              <div className="text-3xl font-black text-amber-700">{pendingPayments}</div>
              <div className="text-xs text-amber-800 font-medium">सत्यापन अथवा शुल्क पुष्टि हेतु प्रतीक्षारत</div>
            </div>
          </div>

          {/* फ़िल्टर एवं खोज बार */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setPaymentFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                    paymentFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  सभी ({totalEnrollments})
                </button>
                <button
                  onClick={() => setPaymentFilter('pending')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                    paymentFilter === 'pending'
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  केवल लंबित ({pendingPayments})
                </button>
                <button
                  onClick={() => setPaymentFilter('successful')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                    paymentFilter === 'successful'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  केवल सफल ({successfulPayments})
                </button>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="छात्र नाम, ईमेल या कोर्स से खोजें..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* भुगतान रिकॉर्ड सूची */}
            {isLoadingPayments ? (
              <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-xs font-bold">नामांकन एवं भुगतान रिकॉर्ड लोड हो रहे हैं...</span>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                <CreditCard className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <div className="text-sm font-bold text-slate-700">कोई भुगतान रिकॉर्ड नहीं मिला</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {searchQuery || paymentFilter !== 'all'
                    ? 'दिए गए फ़िल्टर के अनुसार कोई परिणाम उपलब्ध नहीं है।'
                    : 'वर्तमान में किसी विद्यार्थी द्वारा कोई कोर्स नामांकन दर्ज नहीं है।'}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-3">विद्यार्थी (Student)</th>
                      <th className="py-3 px-3">कोर्स एवं लक्ष्य बैच (Course)</th>
                      <th className="py-3 px-3">शुल्क (Amount)</th>
                      <th className="py-3 px-3">भुगतान स्थिति (Status)</th>
                      <th className="py-3 px-3 text-right">संचालक कार्रवाई (Action)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium">
                    {filteredPayments.map((record) => {
                      const isUpdating = updatingPaymentId === record.id;
                      const isSuccess = record.paymentStatus === 'successful';

                      return (
                        <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-3">
                            <div className="font-black text-slate-900">{record.studentName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{record.studentEmail}</div>
                            {record.studentPhone && record.studentPhone !== '—' && (
                              <div className="text-[11px] text-slate-500">{record.studentPhone}</div>
                            )}
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="font-bold text-slate-800">{record.courseTitle}</div>
                            <div className="text-[11px] text-blue-700 font-semibold">{record.batchName}</div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="font-black text-slate-900">₹{record.amount}</span>
                          </td>

                          <td className="py-3.5 px-3">
                            {isSuccess ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Payment Successful</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Payment Pending</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-3 text-right">
                            {isSuccess ? (
                              <button
                                onClick={() => handleTogglePaymentStatus(record, 'pending')}
                                disabled={isUpdating}
                                className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {isUpdating ? 'अद्यतन...' : 'लंबित चिह्नित करें'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleTogglePaymentStatus(record, 'successful')}
                                disabled={isUpdating}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                              >
                                {isUpdating ? 'अद्यतन...' : 'सफल चिह्नित करें'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* सुरक्षा एवं विनियामक सूचना */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="font-black text-slate-800 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-700" />
              <span>भुगतान स्थिति सुरक्षा एवं सत्यनिष्ठा गारंटी (Payment Integrity)</span>
            </div>
            <p className="leading-relaxed font-medium">
              यह प्रणाली वास्तविक फ़ायरस्टोर डेटा के आधार पर कार्य करती है। यहाँ कोई बाहरी पेमेंट गेटवे (UPI/Card processing) नहीं जोड़ा गया है। संस्थान द्वारा प्रत्यक्ष या ऑफलाइन प्राप्त शुल्कों की पुष्टि संचालक यहाँ सुरक्षित रूप से कर सकते हैं। किसी भी अपुष्ट भुगतान को स्वतः सफल नहीं माना जाता।
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. OWNER ACCOUNT / PROFILE (संचालक खाता एवं प्रोफ़ाइल)                    */}
      {/* ========================================================================= */}
      {activeTab === 'account' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black text-amber-700 uppercase tracking-widest">
                Owner Profile & Credentials
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                संचालक प्रोफ़ाइल एवं खाता विवरण
              </h3>
              <p className="text-slate-600 text-sm font-medium mt-1 leading-relaxed">
                यह जानकारी आपके व्यक्तिगत विवरण, मोबाइल नंबर तथा प्रोफ़ाइल चित्र को प्रबंधित व सुरक्षित रखती है।
              </p>
            </div>

            {!isEditingProfile && (
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl transition-colors cursor-pointer shadow-xs self-start sm:self-auto min-h-[44px]"
              >
                प्रोफ़ाइल संपादित करें (Edit Profile)
              </button>
            )}
          </div>

          {/* Profile Photo / Avatar Upload Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative">
              {profilePhotoURL ? (
                <img src={profilePhotoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-slate-300" />
              )}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="space-y-2 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <label className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-xs min-h-[44px] inline-flex items-center">
                  {isUploadingAvatar ? `अपलोड हो रहा है (${uploadProgress}%)` : 'फ़ोटो बदलें (Change Photo)'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingAvatar}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'avatar');
                    }}
                  />
                </label>
                {profilePhotoURL && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteAvatarConfirm(true)}
                    className="px-4 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all cursor-pointer min-h-[44px]"
                  >
                    फ़ोटो हटाएं (Remove)
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">केवल चित्र फ़ाइलें (JPG, PNG), अधिकतम सीमा: 5MB</p>
            </div>
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleSaveOwnerProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Editable: Owner Name */}
                <div className="space-y-1.5">
                  <label htmlFor="profile-name" className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                    संचालक का नाम (Owner Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 ${
                      validationErrors.name ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-amber-500'
                    }`}
                  />
                  {validationErrors.name && (
                    <p className="text-xs font-bold text-rose-600 flex items-center gap-1.5 mt-1" role="alert">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{validationErrors.name}</span>
                    </p>
                  )}
                </div>

                {/* Editable: Mobile Number */}
                <div className="space-y-1.5">
                  <label htmlFor="profile-phone" className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                    मोबाइल नंबर (Mobile Number) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold font-mono">
                      +91
                    </span>
                    <input
                      id="profile-phone"
                      type="text"
                      required
                      placeholder="9876543210"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className={`w-full pl-12 pr-4 py-2.5 rounded-xl border text-sm font-bold text-slate-900 font-mono focus:outline-none focus:ring-2 ${
                        validationErrors.phone ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-amber-500'
                      }`}
                    />
                  </div>
                  {validationErrors.phone ? (
                    <p className="text-xs font-bold text-rose-600 flex items-center gap-1.5 mt-1" role="alert">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{validationErrors.phone}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500">बिना देश कोड के केवल 10 अंकों का मोबाइल नंबर दर्ज करें।</p>
                  )}
                </div>

                {/* READ ONLY Auth Email (Security Hardening Constraint) */}
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200 opacity-80">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>अधिकृत ईमेल (Auth Email - Read Only)</span>
                  </span>
                  <div className="text-sm font-black text-slate-800 font-mono break-all mt-1">
                    {user?.email || 'rkstudycentre064@gmail.com'}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">सुरक्षित फ़ायरबेस प्रमाणीकरण द्वारा प्रबंधित।</p>
                </div>

                {/* READ ONLY Authority Role (Prevention of Escalation) */}
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200 opacity-80">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>सिस्टम भूमिका (Assigned Role - Read Only)</span>
                  </span>
                  <div className="text-sm font-black text-amber-700 font-mono mt-1">
                    owner (मुख्य व्यवस्थापक)
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">क्लाउड सुरक्षा नियमों में पूर्णतः संरक्षित।</p>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setValidationErrors({});
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer min-h-[44px]"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 min-h-[44px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>सहेजा जा रहा है...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>सहेजें (Save Changes)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  संचालक का नाम (Owner Name)
                </div>
                <div className="text-lg font-black text-slate-900">
                  {profileName || 'जानकारी उपलब्ध नहीं है।'}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  सत्यापित मोबाइल नंबर
                </div>
                <div className="text-lg font-black text-slate-900 font-mono">
                  {profilePhone ? `+91 ${profilePhone.slice(0, 5)} ${profilePhone.slice(5)}` : 'जानकारी उपलब्ध नहीं है।'}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>अधिकृत ईमेल</span>
                </div>
                <div className="text-base font-black text-slate-900 font-mono break-all">
                  {user?.email || 'rkstudycentre064@gmail.com'}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>सिस्टम भूमिका</span>
                </div>
                <div className="text-base font-black text-amber-700 font-mono">
                  owner (मुख्य व्यवस्थापक)
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  खाता स्थिति (Account Status)
                </div>
                <div className="text-base font-black text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>सक्रिय एवं सुरक्षित (Active & Protected)</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  UID: <span className="font-mono">{user?.uid || '—'}</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  प्रमाणीकरण टोकन स्थिति (Custom Claims)
                </div>
                <div className="text-sm font-bold text-slate-800">
                  {hasCustomClaim ? (
                    <span className="text-emerald-700 font-black">कस्टम क्लेम सक्रिय (Role: owner)</span>
                  ) : (
                    <span className="text-blue-700 font-black">सुरक्षित ईमेल सत्यापन सक्रिय</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-2 text-xs leading-relaxed font-medium">
            <div className="font-black text-sm flex items-center gap-1.5 text-amber-900">
              <Lock className="w-4 h-4 text-amber-700" />
              <span>सुरक्षा एवं गोपनीयता मानक अनुपालन</span>
            </div>
            <p>
              इस पृष्ठ पर कोई भी गोपनीय पासवर्ड, फ़ायरबेस निजी टोकन, अथवा संवेदनशील भूमिका क्रेडेंशियल प्रदर्शित या एडिट नहीं किए जा सकते।
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. INSTITUTION & SUPPORT DETAILS (संस्थान विवरण)                          */}
      {/* ========================================================================= */}
      {activeTab === 'institution' && (
        <form
          onSubmit={handleSaveInstitutionSettings}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
        >
          <div>
            <span className="text-xs font-black text-teal-700 uppercase tracking-widest">
              Institutional Profile
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              संस्थान विवरण एवं सहायता सेटिंग्स
            </h3>
            <p className="text-slate-600 text-sm font-medium mt-1 leading-relaxed">
              वेबसाइट पर प्रदर्शित होने वाले संस्थान का नाम, सहायता हेल्पलाइन, पता, राज्य, पिनकोड और ब्रांडिंग लोगो प्रबंधित करें।
            </p>
          </div>

          {/* Logo Upload Section inside Institution Tab */}
          <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              संस्थान लोगो (Institute Logo / Branding Logo)
            </span>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative">
                {settings.instituteLogoUrl ? (
                  <img src={settings.instituteLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building className="w-10 h-10 text-slate-300" />
                )}
                {isUploadingLogo && (
                  <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="space-y-2 flex-1 text-center sm:text-left">
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <label className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-xs min-h-[44px] inline-flex items-center">
                    {isUploadingLogo ? `अपलोड हो रहा है (${uploadProgress}%)` : 'लोगो बदलें / अपलोड करें'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingLogo}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'logo');
                      }}
                    />
                  </label>
                  {settings.instituteLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteLogoConfirm(true)}
                      className="px-4 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all cursor-pointer min-h-[44px]"
                    >
                      लोगो हटाएं (Remove)
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">केवल चित्र फ़ाइलें (JPG, PNG), अधिकतम सीमा: 5MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Institute Name */}
            <div className="space-y-1.5">
              <label htmlFor="institute-name" className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                संस्थान का आधिकारिक नाम <span className="text-rose-500">*</span>
              </label>
              <input
                id="institute-name"
                type="text"
                required
                value={settings.instituteName}
                onChange={(e) => setSettings({ ...settings, instituteName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            {/* Support Phone */}
            <div className="space-y-1.5">
              <label htmlFor="support-phone" className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                सहायता फोन नंबर (Helpline) <span className="text-rose-500">*</span>
              </label>
              <input
                id="support-phone"
                type="text"
                required
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            {/* Support Email */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="support-email" className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                आधिकारिक सहायता ईमेल <span className="text-rose-500">*</span>
              </label>
              <input
                id="support-email"
                type="email"
                required
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            {/* Editable Address details in Settings collection */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="institute-address" className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                संस्थान का पता (Address)
              </label>
              <input
                id="institute-address"
                type="text"
                value={settings.instituteAddress || ''}
                onChange={(e) => setSettings({ ...settings, instituteAddress: e.target.value })}
                placeholder="शास्त्री नगर, ब्लॉक बी"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            {/* Editable City */}
            <div className="space-y-1.5">
              <label htmlFor="institute-city" className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                शहर (City)
              </label>
              <input
                id="institute-city"
                type="text"
                value={settings.instituteCity || ''}
                onChange={(e) => setSettings({ ...settings, instituteCity: e.target.value })}
                placeholder="पटना"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            {/* Editable State */}
            <div className="space-y-1.5">
              <label htmlFor="institute-state" className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                राज्य (State)
              </label>
              <input
                id="institute-state"
                type="text"
                value={settings.instituteState || ''}
                onChange={(e) => setSettings({ ...settings, instituteState: e.target.value })}
                placeholder="बिहार"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            {/* Editable Pin */}
            <div className="space-y-1.5">
              <label htmlFor="institute-pin" className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                पिनकोड (PIN Code)
              </label>
              <input
                id="institute-pin"
                type="text"
                value={settings.institutePin || ''}
                onChange={(e) => setSettings({ ...settings, institutePin: e.target.value })}
                placeholder="800001"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
              />
            </div>

            {/* Special Notice Banner */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>विशेष सूचना बैनर (Notice Announcement)</span>
                <label className="flex items-center gap-2 cursor-pointer font-bold normal-case text-slate-600 text-xs">
                  <input
                    type="checkbox"
                    checked={settings.isNoticeActive}
                    onChange={(e) => setSettings({ ...settings, isNoticeActive: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>बैनर सक्रिय रखें</span>
                </label>
              </label>
              <textarea
                rows={2}
                value={settings.noticeBanner}
                onChange={(e) => setSettings({ ...settings, noticeBanner: e.target.value })}
                placeholder="उदा. नए लक्ष्य बैचों में प्रवेश प्रारंभ है..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-black text-sm flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 min-h-[44px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>सहेजा जा रहा है...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>सेटिंग्स सहेजें (Save Settings)</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Confirm Deletion Modals (MANDATORY ACCESSIBILITY & SECURITY RULES) */}
      <ConfirmModal
        isOpen={showDeleteAvatarConfirm}
        onClose={() => setShowDeleteAvatarConfirm(false)}
        onConfirm={executeDeleteAvatar}
        title="प्रोफ़ाइल फ़ोटो हटाएं?"
        message="क्या आप वाकई अपनी प्रोफ़ाइल फ़ोटो हटाना चाहते हैं? आपकी फ़ोटो डिफ़ॉल्ट प्लेसहोल्डर से बदल दी जाएगी।"
        confirmText="हाँ, फ़ोटो हटाएं"
        cancelText="रद्द करें"
        variant="danger"
        isLoading={isSaving}
      />

      <ConfirmModal
        isOpen={showDeleteLogoConfirm}
        onClose={() => setShowDeleteLogoConfirm(false)}
        onConfirm={executeDeleteLogo}
        title="संस्थान लोगो हटाएं?"
        message="क्या आप वाकई संस्थान का ब्रांडिंग लोगो हटाना चाहते हैं?"
        confirmText="हाँ, लोगो हटाएं"
        cancelText="रद्द करें"
        variant="danger"
        isLoading={isSaving}
      />
    </div>
  );
}
