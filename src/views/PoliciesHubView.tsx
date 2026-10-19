import {
  ShieldCheck,
  FileText,
  Lock,
  RotateCcw,
  UserCheck,
  HelpCircle,
  PhoneCall,
  Scale,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  GraduationCap,
  AlertCircle,
  Info,
  BookOpen,
  CalendarCheck,
  CreditCard,
  FileCheck2,
  ClipboardList,
  Clock,
  Sparkles
} from 'lucide-react';
import type { MainNavRoute, ClassLevel, MoreSectionTab } from '../types';
import { BackButton } from '../components/BackButton';
import { useSettings } from '../context/SettingsContext';
import { getStandaloneAppUrl, openPolicyInNewTab } from '../utils/navigationUtils';

interface PoliciesHubViewProps {
  onNavigate: (route: MainNavRoute, params?: { classLevel?: ClassLevel; moreTab?: MoreSectionTab }) => void;
}

export function PoliciesHubView({ onNavigate }: PoliciesHubViewProps) {
  const { settings } = useSettings();
  const websiteName = settings.websiteName || 'RK STUDY CENTRE';
  const supportEmail = settings.supportEmail || 'rkstudycentre064@gmail.com';

  const institutionalPolicies = [
    {
      id: 'privacy',
      title: 'गोपनीयता नीति (Privacy Policy)',
      route: '/privacy-policy',
      navKey: 'privacy-policy' as MainNavRoute,
      icon: Lock,
      badge: 'डेटा सुरक्षा एवं सुरक्षा',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
      description:
        'विद्यार्थियों की व्यक्तिगत जानकारी, टेस्ट स्कोर और अध्ययन रिकॉर्ड के पारदर्शी संग्रह, सुरक्षा व शून्य विज्ञापन प्रतिबद्धता।',
      points: [
        'व्यक्तिगत डेटा का पारदर्शी संग्रह',
        'Google Auth एवं सुरक्षित Firebase संग्रहण',
        'तृतीय-पक्ष कंपनियों को नो डेटा शेयरिंग',
      ],
    },
    {
      id: 'terms',
      title: 'नियम एवं शर्तें (Terms & Conditions)',
      route: '/terms-and-conditions',
      navKey: 'terms-and-conditions' as MainNavRoute,
      icon: FileText,
      badge: 'अनिवार्य सेवा शर्तें',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
      description:
        'वेबसाइट, ऑनलाइन टेस्ट, नोट्स, कोर्सेज और उपयोगकर्ता खाते के संचालन से जुड़े सभी वैध नियम व मंच उपयोग निर्देश।',
      points: [
        'खाता पंजीकरण व सुरक्षा नियम',
        'अध्ययन सामग्री का उपयोग व बौद्धिक संपदा',
        'खाता निलंबन एवं दुरुपयोग रोकथाम',
      ],
    },
    {
      id: 'code-of-conduct',
      title: 'विद्यार्थी आचरण संहिता (Student Code of Conduct)',
      route: '/terms-and-conditions#sec-7',
      navKey: 'terms-and-conditions' as MainNavRoute,
      icon: UserCheck,
      badge: 'अनुशासन एवं मर्यादा',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300',
      description:
        'ऑनलाइन टेस्ट, लाइव सेशन्स व संस्थान के मंच पर विद्यार्थियों के लिए मर्यादा, निष्पक्षता और सम्मानजनक व्यवहार के मानक।',
      points: [
        'सद्भावपूर्ण संवाद व अनुशासित आचरण',
        'अध्ययन सामग्री का अनधिकृत पुनर्विक्रय निषेध',
        'मंच सुरक्षा से छेड़छाड़ पर शून्य सहिष्णुता',
      ],
    },
    {
      id: 'fee-policy',
      title: 'शुल्क एवं भुगतान नीति (Fee & Payment Policy)',
      route: '/refund-cancellation#sec-2',
      navKey: 'refund-cancellation' as MainNavRoute,
      icon: CreditCard,
      badge: 'पारदर्शी वित्तीय नियम',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
      description:
        'लक्ष्य बैच, विशेष क्रैश कोर्स व ऑनलाइन टेस्ट सीरीज के लिए सुरक्षित भुगतान माध्यम, रसीद आवंटन व शुल्क नियम।',
      points: [
        '100% सुरक्षित UPI व बैंकिंग भुगतान',
        'प्रत्येक भुगतान पर तत्काल डिजिटल रसीद',
        'दोहरे भुगतान पर त्वरित समाधान सहायता',
      ],
    },
    {
      id: 'exam-policy',
      title: 'परीक्षा एवं टेस्ट नीति (Examination & Test Policy)',
      route: '/terms-and-conditions#sec-5',
      navKey: 'terms-and-conditions' as MainNavRoute,
      icon: ClipboardList,
      badge: 'निष्पक्ष मूल्यांकन',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
      description:
        'ऑनलाइन OMR टेस्ट, 3-घंटे के अखंड महामैराथन और चैप्टरवार क्विज़ के निष्पक्ष मूल्यांकन, स्कोरिंग व टाइमर नियम।',
      points: [
        'BSEB मॉडल प्रारूप पर आधारित प्रश्न',
        'रियल-टाइम टाइमर व OMR शीट स्व-मूल्यांकन',
        'निष्पक्ष स्कोरकार्ड एवं लाइव रैंक जनरेशन',
      ],
    },
    {
      id: 'attendance-policy',
      title: 'उपस्थिति एवं अध्ययन नियम (Attendance & Study Guidelines)',
      route: '/terms-and-conditions#sec-3',
      navKey: 'terms-and-conditions' as MainNavRoute,
      icon: CalendarCheck,
      badge: 'नियमितता एवं प्रगति',
      badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300',
      description:
        'दैनिक अध्ययन ट्रैकर, लक्ष्य बैच उपस्थिति, पोमोडोरो टाइमर और निरंतर अध्ययन के माध्यम से 450+ स्कोर लक्ष्य।',
      points: [
        'दैनिक लाइव/रिकॉर्डेड क्लास उपस्थिति',
        'दैनिक अध्ययन ट्रैकर चेकलिस्ट का पालन',
        'समय पर असाइनमेंट व टेस्ट पूर्ण करना',
      ],
    },
    {
      id: 'refund',
      title: 'रिफंड और रद्दीकरण नीति (Refund & Cancellation)',
      route: '/refund-cancellation',
      navKey: 'refund-cancellation' as MainNavRoute,
      icon: RotateCcw,
      badge: 'पारदर्शी रिफंड नियम',
      badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300',
      description:
        'डिजिटल पाठ्यक्रमों, प्रीमियम टेस्ट सीरीज और सशुल्क अध्ययन सामग्री के लिए स्पष्ट और पारदर्शी रिफंड व रद्दीकरण नियम।',
      points: [
        'पात्रता मानदंड व आवेदन प्रक्रिया',
        'रद्दीकरण की स्पष्ट समयसीमा',
        'सत्यापन व राशि वापसी विधि (5-7 कार्यदिवस)',
      ],
    },
    {
      id: 'data-privacy',
      title: 'डेटा गोपनीयता अधिकार (Data Privacy Rights)',
      route: '/data-privacy',
      navKey: 'data-privacy' as MainNavRoute,
      icon: ShieldCheck,
      badge: 'DPDP Act 2023 अनुपालन',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
      description:
        'भारतीय डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम (DPDP) के तहत विद्यार्थियों के कानूनी अधिकार और नियंत्रण विकल्प।',
      points: [
        'डेटा देखने, सुधारने व हटाने का अधिकार',
        'डेटा पोर्टेबिलिटी और सहमति वापसी',
        'अभिभावक/संरक्षक सहमति अधिकार',
      ],
    },
  ];

  const helpCards = [
    {
      title: 'हमारे बारे में (About Us)',
      route: '/about-us',
      navKey: 'about-us' as MainNavRoute,
      icon: BookOpen,
      desc: 'RK STUDY CENTRE का मिशन, विज़न और बिहार बोर्ड विद्यार्थियों के लिए हमारी शैक्षिक प्रतिबद्धता।',
    },
    {
      title: 'प्रश्नोत्तरी / सहायता केंद्र (FAQ)',
      route: '/faq',
      navKey: 'faq' as MainNavRoute,
      icon: HelpCircle,
      desc: 'टेस्ट, नोट्स, लॉगिन, प्रगति रिपोर्ट व पासवर्ड से जुड़े सामान्य प्रश्नों के त्वरित उत्तर।',
    },
    {
      title: 'संपर्क सहायता (Contact Support)',
      route: '/contact-support',
      navKey: 'contact-support' as MainNavRoute,
      icon: PhoneCall,
      desc: 'किसी भी तकनीकी समस्या या शंका के त्वरित समाधान हेतु हमारे सपोर्ट डेस्क से संपर्क करें।',
    },
  ];

  return (
    <div className="py-8 sm:py-12 space-y-10 sm:space-y-12 max-w-6xl mx-auto px-4 sm:px-6 text-left">
      {/* शीर्ष नेविगेशन बार एवं बैक बटन */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <BackButton label="मुख्य पृष्ठ (Home) पर वापस जाएं" fallbackRoute="home" onNavigate={onNavigate} />
        <div className="flex items-center gap-3">
          <a
            href={getStandaloneAppUrl('/policies')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => openPolicyInNewTab(e, '/policies', () => onNavigate('policies'))}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>नए टैब में खोलें</span>
          </a>
          <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
            अंतिम अद्यतन: <strong className="text-slate-800 dark:text-slate-200">सितंबर 2026</strong> • आधिकारिक नीति केंद्र
          </span>
        </div>
      </div>

      {/* मुख्य शीर्ष बैनर */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-300 text-xs sm:text-sm font-bold">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>वैधानिक एवं संस्थागत नीतियाँ (Institutional Policies Hub)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            महत्वपूर्ण नीतियाँ एवं छात्र दिशा-निर्देश
          </h1>

          <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-medium">
            <strong className="text-white font-bold">{websiteName}</strong> बिहार बोर्ड (कक्षा 9वीं से 12वीं) के विद्यार्थियों को सुरक्षित, पारदर्शी एवं उच्च गुणवत्तायुक्त डिजिटल शिक्षा प्रदान करने के लिए प्रतिबद्ध है। हमारे सभी नियम, नीतियां और सुरक्षा प्रावधान नीचे व्यवस्थित रूप से उपलब्ध हैं।
          </p>

          <div className="flex flex-wrap gap-3 pt-2 text-xs sm:text-sm text-slate-300 font-semibold">
            <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              100% छात्र हितैषी नीतियाँ
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              डेटा गोपनीयता संरक्षण
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              BSEB पाठ्यक्रम अनुरूप
            </span>
          </div>
        </div>
      </div>

      {/* सभी 8 प्रमुख वैधानिक एवं छात्र नीतियां (Grid Cards) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <Scale className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span>सभी महत्वपूर्ण संस्थागत नीतियाँ ({institutionalPolicies.length})</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              वेबसाइट उपयोग, गोपनीयता, रिफंड, छात्र आचरण एवं परीक्षा दिशा-निर्देश
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg self-start sm:self-auto">
            इन-ऐप एवं नए टैब दोनों विकल्प उपलब्ध
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {institutionalPolicies.map((policy) => {
            const Icon = policy.icon;
            return (
              <div
                key={policy.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${policy.badgeColor}`}>
                      {policy.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {policy.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-normal">
                      {policy.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    {policy.points.map((pt, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate(policy.navKey)}
                    className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs sm:text-sm transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>यहाँ खोलें</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={getStandaloneAppUrl(policy.route)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => openPolicyInNewTab(e, policy.route, () => onNavigate(policy.navKey))}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span>नए टैब में खोलें</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* सहायता एवं संस्थागत जानकारी अनुभाग */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>विद्यार्थी सहायता एवं संस्थागत जानकारी</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {helpCards.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onNavigate(item.navKey)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    यहाँ देखें →
                  </button>

                  <a
                    href={getStandaloneAppUrl(item.route)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => openPolicyInNewTab(e, item.route, () => onNavigate(item.navKey))}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600"
                  >
                    <span>New Tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* मुख्य नीतिगत मार्गदर्शक सिद्धांत (Key Institutional Principles) */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>RK STUDY CENTRE के 4 मुख्य नीतिगत सिद्धांत</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              1. निःशुल्क एवं सुलभ शिक्षा
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
              बिहार बोर्ड के हर विद्यार्थी तक गुणवत्तापूर्ण नोट्स, पिछले वर्षों के प्रश्नपत्र और ऑनलाइन टेस्ट बिना किसी भेदभाव के निःशुल्क पहुँचाना हमारा प्राथमिक संकल्प है।
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              2. पूर्ण गोपनीयता एवं शून्य विज्ञापन
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
              हम कभी भी विद्यार्थियों के फोन नंबर या ईमेल को किसी भी तीसरे पक्ष या विपणन कंपनी के साथ साझा या विक्रय नहीं करते हैं।
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              3. निष्पक्ष ऑनलाइन मूल्यांकन
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
              सभी ऑनलाइन टेस्ट बिहार विद्यालय परीक्षा समिति (BSEB) के नवीनतम मॉडल प्रश्न प्रारूप एवं वास्तविक परीक्षा अंकन पद्धति पर आधारित हैं।
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              4. त्वरित सहायता एवं शिकायत निवारण
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
              विद्यार्थियों द्वारा भेजी गई किसी भी तकनीकी, शैक्षणिक या रिफंड संबंधी शिकायत का समाधान 24 से 48 घंटे के भीतर सुनिश्चित किया जाता है।
            </p>
          </div>
        </div>
      </div>

      {/* संपर्क एवं शिकायत अधिकारी */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">
            किसी नीति के संबंध में प्रश्न या सहायता चाहिए?
          </h4>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
            नोडल अधिकारी: <strong className="text-slate-800 dark:text-slate-200">शिकायत निवारण प्रकोष्ठ, {websiteName}</strong> • ईमेल:{' '}
            <a
              href={`mailto:${supportEmail}`}
              className="text-blue-600 dark:text-blue-400 underline font-mono"
            >
              {supportEmail}
            </a>
          </p>
        </div>

        <a
          href={getStandaloneAppUrl('/contact-support')}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => openPolicyInNewTab(e, '/contact-support', () => onNavigate('contact-support'))}
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shrink-0 inline-flex items-center gap-2 text-xs sm:text-sm shadow-xs"
        >
          <span>सपोर्ट डेस्क से संपर्क करें</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
