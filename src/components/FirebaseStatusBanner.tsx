import { useState } from 'react';
import { Database, ShieldCheck, X, CheckCircle2 } from 'lucide-react';
import { getFirebaseStatus } from '../lib/firebase';
import type { MainNavRoute, ClassLevel, MoreSectionTab } from '../types';

interface FirebaseStatusBannerProps {
  onNavigate: (route: MainNavRoute, params?: { classLevel?: ClassLevel; moreTab?: MoreSectionTab }) => void;
}

export function FirebaseStatusBanner({ onNavigate }: FirebaseStatusBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const status = getFirebaseStatus();

  if (dismissed) return null;

  return (
    <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-950 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Firebase प्रमाणीकरण एवं डेटाबेस सक्रिय:</strong>{' '}
            विद्यार्थी Login, नवीन खाता निर्माण, Google Sign-In तथा विद्यार्थी प्रोफाइल सुरक्षित रूप से संचालित हैं।
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <span className="font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] border border-emerald-200 font-mono">
            {status.projectId}
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer p-0.5"
            aria-label="सूचना बंद करें"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
