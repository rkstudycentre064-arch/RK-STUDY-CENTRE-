import { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  RefreshCw, 
  Key, 
  User as UserIcon, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  LogIn, 
  ArrowLeft,
  Lock,
  ExternalLink
} from 'lucide-react';
import { auth, db, type FirebaseUser } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { MainNavRoute, UserProfile } from '../types';

interface AdminAccessCheckViewProps {
  onNavigate: (route: MainNavRoute) => void;
}

type CheckStatus = 'APPROVED' | 'NOT APPROVED' | 'UNABLE TO VERIFY';
type ClaimStatus = 'APPROVED' | 'NOT APPROVED' | 'UNKNOWN';
type AuthStatus = 'PASS' | 'NOT LOGGED IN';

interface DiagnosticResult {
  currentUserDetected: boolean;
  uid: string | null;
  email: string | null;
  emailVerified: boolean;
  authStatus: AuthStatus;
  adminClaim: ClaimStatus;
  ownerClaim: ClaimStatus;
  customClaimsRaw: Record<string, any> | null;
  firestoreRecordFound: 'YES' | 'NO' | 'N/A';
  firestoreRole: string | null;
  firestoreDataRaw: Partial<UserProfile> | null;
  securityRulesProbe: 'ALLOWED' | 'DENIED' | 'ERROR' | 'N/A';
  securityRulesProbeMsg: string;
  adminAccessStatus: CheckStatus;
  reason: string;
  hindiMessage: string;
  lastCheckedTime: string;
}

export function AdminAccessCheckView({ onNavigate }: AdminAccessCheckViewProps) {
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const runAccessCheck = useCallback(async () => {
    setIsChecking(true);
    const now = new Date().toLocaleString('hi-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const currentUser: FirebaseUser | null = auth.currentUser;

    // 1. CASE: User is not logged in
    if (!currentUser) {
      setResult({
        currentUserDetected: false,
        uid: null,
        email: null,
        emailVerified: false,
        authStatus: 'NOT LOGGED IN',
        adminClaim: 'NOT APPROVED',
        ownerClaim: 'NOT APPROVED',
        customClaimsRaw: null,
        firestoreRecordFound: 'N/A',
        firestoreRole: null,
        firestoreDataRaw: null,
        securityRulesProbe: 'N/A',
        securityRulesProbeMsg: 'उपयोगकर्ता लॉगिन नहीं है (Authentication session missing)',
        adminAccessStatus: 'NOT APPROVED',
        reason: 'Login missing (उपयोगकर्ता लॉगिन नहीं है)',
        hindiMessage: 'आपके खाते को अभी Admin Access Approval नहीं मिला है। (Login आवश्यक है)',
        lastCheckedTime: now,
      });
      setIsChecking(false);
      return;
    }

    // 2. CASE: User is logged in — Perform deep read-only inspection
    const uid = currentUser.uid;
    const email = currentUser.email || null;
    const emailVerified = currentUser.emailVerified;

    let adminClaim: ClaimStatus = 'NOT APPROVED';
    let ownerClaim: ClaimStatus = 'NOT APPROVED';
    let customClaimsRaw: Record<string, any> | null = null;
    let claimsFetchError: string | null = null;

    // Step A: Read Custom Claims via getIdTokenResult (force refresh = true)
    try {
      const idTokenResult = await currentUser.getIdTokenResult(true);
      customClaimsRaw = idTokenResult.claims || {};

      // Inspect admin claim
      if (customClaimsRaw.admin === true || customClaimsRaw.role === 'admin') {
        adminClaim = 'APPROVED';
      } else {
        adminClaim = 'NOT APPROVED';
      }

      // Inspect owner claim
      if (customClaimsRaw.owner === true || customClaimsRaw.role === 'owner') {
        ownerClaim = 'APPROVED';
      } else {
        ownerClaim = 'NOT APPROVED';
      }
    } catch (err: any) {
      console.warn('[AdminAccessCheck] getIdTokenResult error:', err);
      claimsFetchError = err.message || 'Failed to read token claims';
      adminClaim = 'UNKNOWN';
      ownerClaim = 'UNKNOWN';
    }

    // Step B: Read Firestore User Profile (Approval Record)
    let firestoreRecordFound: 'YES' | 'NO' | 'N/A' = 'NO';
    let firestoreRole: string | null = null;
    let firestoreDataRaw: Partial<UserProfile> | null = null;
    let firestoreReadError: string | null = null;

    try {
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        firestoreRecordFound = 'YES';
        const data = userDocSnap.data() as UserProfile;
        firestoreDataRaw = data;
        firestoreRole = data.role || null;
      } else {
        firestoreRecordFound = 'NO';
      }
    } catch (err: any) {
      console.warn('[AdminAccessCheck] Firestore read error:', err);
      firestoreReadError = err.message || 'Firestore user profile read failed';
      firestoreRecordFound = 'NO';
    }

    // Step C: Security Rules Probe (Read-only check on owner-guarded document)
    // In firestore.rules: match /settings/{settingId} { allow read, write: if isOwner(); }
    // where isOwner() = request.auth.token.email == 'rkstudycentre064@gmail.com' || request.auth.token.role == 'owner'
    let securityRulesProbe: 'ALLOWED' | 'DENIED' | 'ERROR' | 'N/A' = 'N/A';
    let securityRulesProbeMsg = '';

    try {
      const settingsDocRef = doc(db, 'settings', 'general');
      await getDoc(settingsDocRef);
      securityRulesProbe = 'ALLOWED';
      securityRulesProbeMsg = 'Firestore Security Rules ने Owner/Admin एक्सेस को अनुमति दी (Security Rules Verified: ALLOWED)';
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes('permission-denied') || errMsg.includes('Missing or insufficient permissions')) {
        securityRulesProbe = 'DENIED';
        securityRulesProbeMsg = 'Firestore Security Rules द्वारा अनुमति अस्वीकृत (Permission Denied for Non-Owner)';
      } else {
        securityRulesProbe = 'ERROR';
        securityRulesProbeMsg = `नियम सत्यापन में त्रुटि: ${errMsg}`;
      }
    }

    // Step D: Calculate final Admin Access Approval status strictly from verified facts
    let finalStatus: CheckStatus = 'NOT APPROVED';
    let reason = '';
    let hindiMessage = '';

    const isAuthorizedOwnerEmail = email === 'rkstudycentre064@gmail.com';
    const hasAdminCustomClaim = adminClaim === 'APPROVED';
    const hasOwnerCustomClaim = ownerClaim === 'APPROVED';
    const isOwnerRoleInFirestore = firestoreRole === 'owner';
    const isAdminRoleInFirestore = firestoreRole === 'admin';
    const isSecurityRulesAllowed = securityRulesProbe === 'ALLOWED';

    if (claimsFetchError && firestoreReadError) {
      finalStatus = 'UNABLE TO VERIFY';
      reason = 'Firebase configuration problem / Unable to read current user access status';
      hindiMessage = 'Admin Access Approval: UNABLE TO VERIFY (सत्यापन में असमर्थ - नेटवर्क/कॉन्फ़िग जांचें)';
    } else if (
      isAuthorizedOwnerEmail || 
      hasAdminCustomClaim || 
      hasOwnerCustomClaim || 
      isOwnerRoleInFirestore || 
      isAdminRoleInFirestore ||
      isSecurityRulesAllowed
    ) {
      finalStatus = 'APPROVED';
      const reasonsList: string[] = [];
      if (isAuthorizedOwnerEmail) reasonsList.push('अधिकृत व्यवस्थापक ईमेल (rkstudycentre064@gmail.com)');
      if (hasOwnerCustomClaim) reasonsList.push('Owner Token Claim सक्रिय');
      if (hasAdminCustomClaim) reasonsList.push('Admin Token Claim सक्रिय');
      if (isOwnerRoleInFirestore) reasonsList.push('Firestore Profile Role: owner');
      if (isAdminRoleInFirestore) reasonsList.push('Firestore Profile Role: admin');
      if (isSecurityRulesAllowed) reasonsList.push('Firestore Security Rules Verified');
      
      reason = reasonsList.join(' • ');
      hindiMessage = 'आपके खाते को Admin Access Approval मिला है।';
    } else {
      finalStatus = 'NOT APPROVED';
      const missingReasons: string[] = [];
      if (!hasAdminCustomClaim && !hasOwnerCustomClaim) missingReasons.push('Admin/Owner custom claim missing');
      if (firestoreRecordFound === 'NO') {
        missingReasons.push('Approval record missing');
      } else if (firestoreRole === 'student') {
        missingReasons.push('खाता भूमिका सामान्य विद्यार्थी (Role: student) है');
      }
      if (securityRulesProbe === 'DENIED') missingReasons.push('Security Rules: Permission denied');
      
      reason = missingReasons.join(' • ') || 'Admin approval record missing';
      hindiMessage = 'आपके खाते को अभी Admin Access Approval नहीं मिला है।';
    }

    setResult({
      currentUserDetected: true,
      uid,
      email,
      emailVerified,
      authStatus: 'PASS',
      adminClaim,
      ownerClaim,
      customClaimsRaw,
      firestoreRecordFound,
      firestoreRole,
      firestoreDataRaw,
      securityRulesProbe,
      securityRulesProbeMsg,
      adminAccessStatus: finalStatus,
      reason,
      hindiMessage,
      lastCheckedTime: now,
    });

    setIsChecking(false);
  }, []);

  useEffect(() => {
    runAccessCheck();
  }, [runAccessCheck]);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      {/* Top Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>मुख्य पृष्ठ (Home)</span>
        </button>

        <div className="flex items-center gap-2">
          {result?.adminAccessStatus === 'APPROVED' && (
            <button
              type="button"
              onClick={() => onNavigate('owner')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <span>व्यवस्थापक पोर्टल (Owner Portal)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={runAccessCheck}
            disabled={isChecking}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-black transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>CHECK ACCESS AGAIN</span>
          </button>
        </div>
      </div>

      {/* Main Centered Diagnostic Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Card Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-blue-400">
              Firebase Authorization Diagnostics (Read-Only)
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 flex items-center gap-2.5">
              <Key className="w-6 h-6 text-amber-400" />
              <span>ADMIN ACCESS CHECK</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
              वर्तमान में लॉगिन Firebase उपयोगकर्ता के लिए Admin / Owner एक्सेस स्वीकृति की स्थिति की निष्पक्ष जांच।
            </p>
          </div>

          <div className="shrink-0 flex items-center">
            {isChecking ? (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                जांच जारी है...
              </span>
            ) : result?.adminAccessStatus === 'APPROVED' ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                APPROVED
              </span>
            ) : result?.adminAccessStatus === 'UNABLE TO VERIFY' ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                UNABLE TO VERIFY
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black">
                <ShieldX className="w-4 h-4 text-rose-400" />
                NOT APPROVED
              </span>
            )}
          </div>
        </div>

        {/* Primary Status Strip */}
        <div 
          className={`p-4 sm:p-5 border-b transition-colors flex items-start gap-3.5 ${
            result?.adminAccessStatus === 'APPROVED'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : result?.adminAccessStatus === 'UNABLE TO VERIFY'
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {result?.adminAccessStatus === 'APPROVED' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : result?.adminAccessStatus === 'UNABLE TO VERIFY' ? (
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600" />
            )}
          </div>
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black leading-tight">
              {result?.hindiMessage || 'जांच प्रक्रिया जारी है...'}
            </h2>
            <p className="text-xs font-semibold opacity-90">
              <strong className="font-bold">कारण (Reason): </strong>
              {result?.reason || 'सत्यापन हो रहा है...'}
            </p>
          </div>
        </div>

        {/* Standard Verification Checklist (Exact Required Format) */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>User (उपयोगकर्ता ईमेल)</span>
              </span>
              <div className="text-sm font-black text-slate-900 break-all">
                {result?.email || (result?.authStatus === 'NOT LOGGED IN' ? 'कोई खाता लॉगिन नहीं है' : 'Email उपलब्ध नहीं')}
              </div>
            </div>

            {/* UID */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-600" />
                <span>UID (Firebase Auth Identifier)</span>
              </span>
              <div className="text-xs font-mono font-bold text-slate-800 break-all">
                {result?.uid || 'उपलब्ध नहीं (Not logged in)'}
              </div>
            </div>

            {/* Authentication */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Authentication
              </span>
              <div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-black ${
                    result?.authStatus === 'PASS'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {result?.authStatus === 'PASS' ? '✓ PASS' : '✕ NOT LOGGED IN'}
                </span>
              </div>
            </div>

            {/* Admin Claim */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Admin Claim (Custom Claims)
              </span>
              <div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-black ${
                    result?.adminClaim === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : result?.adminClaim === 'UNKNOWN'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {result?.adminClaim === 'APPROVED'
                    ? '✓ APPROVED'
                    : result?.adminClaim === 'UNKNOWN'
                    ? '? UNKNOWN'
                    : '✕ NOT APPROVED'}
                </span>
              </div>
            </div>

            {/* Owner Claim */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Owner Claim (Custom Claims)
              </span>
              <div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-black ${
                    result?.ownerClaim === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : result?.ownerClaim === 'UNKNOWN'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {result?.ownerClaim === 'APPROVED'
                    ? '✓ APPROVED'
                    : result?.ownerClaim === 'UNKNOWN'
                    ? '? UNKNOWN'
                    : '✕ NOT APPROVED'}
                </span>
              </div>
            </div>

            {/* Admin Access (Final Evaluation) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Admin Access
              </span>
              <div>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-black ${
                    result?.adminAccessStatus === 'APPROVED'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : result?.adminAccessStatus === 'UNABLE TO VERIFY'
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
                      : 'bg-rose-600 text-white shadow-xs'
                  }`}
                >
                  {result?.adminAccessStatus === 'APPROVED'
                    ? '✓ APPROVED'
                    : result?.adminAccessStatus === 'UNABLE TO VERIFY'
                    ? '⚠ UNABLE TO VERIFY'
                    : '✕ NOT APPROVED'}
                </span>
              </div>
            </div>
          </div>

          {/* Last Checked and Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 text-xs text-slate-500 font-medium">
            <div>
              <span className="font-bold text-slate-700">Last Checked: </span>
              <span>{result?.lastCheckedTime || 'जांच प्रक्रियाधीन...'}</span>
            </div>

            <div className="flex items-center gap-3">
              {result?.authStatus === 'NOT LOGGED IN' ? (
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>लॉगिन करें (Go to Login)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={runAccessCheck}
                  disabled={isChecking}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>CHECK ACCESS AGAIN</span>
                </button>
              )}
            </div>
          </div>

          {/* Deep Technical Evidence Breakdown (Read-Only Proofs) */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>तकनीकी साक्ष्य विवरण (Technical Verification Breakdown)</span>
            </h3>

            <div className="space-y-3 text-xs">
              {/* Evidence 1: Firestore User Profile Record */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                  <span>1. Firestore Profile Record (users/{result?.uid || 'uid'})</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      result?.firestoreRecordFound === 'YES'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Found: {result?.firestoreRecordFound}
                  </span>
                </div>
                <div className="text-slate-600 font-medium">
                  {result?.firestoreRecordFound === 'YES' ? (
                    <span>
                      दस्तावेज़ में निर्धारित भूमिका (Role):{' '}
                      <strong className="text-slate-900 font-bold">
                        {result?.firestoreRole || 'Not specified'}
                      </strong>
                      {result?.firestoreDataRaw?.displayName && ` | नाम: ${result.firestoreDataRaw.displayName}`}
                    </span>
                  ) : (
                    <span>उपयोगकर्ता का कोई Firestore प्रोफ़ाइल रिकॉर्ड नहीं मिला या उपयोगकर्ता लॉगिन नहीं है।</span>
                  )}
                </div>
              </div>

              {/* Evidence 2: Security Rules Probe */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                  <span>2. Firestore Security Rules Probe (/settings/general)</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      result?.securityRulesProbe === 'ALLOWED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : result?.securityRulesProbe === 'DENIED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Rules Status: {result?.securityRulesProbe}
                  </span>
                </div>
                <div className="text-slate-600 font-medium">
                  {result?.securityRulesProbeMsg}
                </div>
              </div>

              {/* Evidence 3: Security Constraints Note */}
              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-2.5 text-slate-700">
                <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-bold text-slate-900">सुरक्षा प्रतिबंध (Read-Only Constraint): </strong>
                  यह जांच विशुद्ध रूप से पठनीय (Read-Only) है। फ्रंटएंड से कोई भी Custom Claim या Firestore Role संशोधित नहीं किया जा सकता। Admin/Owner अधिकार केवल Firebase बैकएंड और अधिकृत ईमेल द्वारा निर्धारित होते हैं।
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
