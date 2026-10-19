import { useState } from 'react';
import {
  RotateCcw,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  HelpCircle,
  Mail,
  AlertTriangle,
  CreditCard,
  FileText,
  Clock,
  ArrowLeft,
  Info,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ExternalLink
} from 'lucide-react';
import type { MainNavRoute, ClassLevel, MoreSectionTab } from '../types';
import { BackButton } from '../components/BackButton';
import { getStandaloneAppUrl, openPolicyInNewTab } from '../utils/navigationUtils';

interface RefundCancellationViewProps {
  onNavigate: (route: MainNavRoute, params?: { classLevel?: ClassLevel; moreTab?: MoreSectionTab }) => void;
}

export function RefundCancellationView({ onNavigate }: RefundCancellationViewProps) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const sections = [
    { id: 'sec-1', number: '1', title: 'परिचय (Introduction)', icon: Info },
    { id: 'sec-2', number: '2', title: 'Course / Paid Service Cancellation', icon: GraduationCap },
    { id: 'sec-3', number: '3', title: 'Refund Eligibility (रिफंड पात्रता)', icon: CheckCircle2 },
    { id: 'sec-4', number: '4', title: 'Refund Request (रिफंड अनुरोध प्रक्रिया)', icon: Mail },
    { id: 'sec-5', number: '5', title: 'Cancellation Request (रद्दीकरण प्रक्रिया)', icon: RotateCcw },
    { id: 'sec-6', number: '6', title: 'Refund Processing (रिफंड प्रक्रमण)', icon: CreditCard },
    { id: 'sec-7', number: '7', title: 'Non-Refundable Situations (गैर-रिफंडेबल स्थितियां)', icon: XCircle },
    { id: 'sec-8', number: '8', title: 'Duplicate / Incorrect Payment (दोहरा या त्रुटिपूर्ण भुगतान)', icon: Clock },
    { id: 'sec-9', number: '9', title: 'Changes to This Policy (नीति में संशोधन)', icon: FileText },
    { id: 'sec-10', number: '10', title: 'संपर्क (Contact Support)', icon: HelpCircle },
  ];

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="py-8 sm:py-12 space-y-10 sm:space-y-12 max-w-4xl mx-auto">
      {/* शीर्ष नेविगेशन बार एवं बैक बटन */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <BackButton label="मुख्य पृष्ठ (Home) पर वापस जाएं" fallbackRoute="home" onNavigate={onNavigate} />
        <div className="flex items-center gap-3">
          <a
            href={getStandaloneAppUrl('/refund-cancellation')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => openPolicyInNewTab(e, '/refund-cancellation', () => onNavigate('refund-cancellation'))}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>नए टैब में खोलें</span>
          </a>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-900 text-xs sm:text-sm font-black">
            <RotateCcw className="w-4 h-4 text-blue-700 shrink-0" />
            <span>पारदर्शी नीति • Refund & Cancellation Policy</span>
          </div>
        </div>
      </div>

      {/* मुख्य शीर्षक कार्ड (Document Header) */}
      <header className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-md shrink-0">
            <RotateCcw className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs sm:text-sm font-black text-blue-700 uppercase tracking-wider">
              RK STUDY CENTRE • छात्र हित एवं पारदर्शी सेवा
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              रिफंड और रद्दीकरण नीति
            </h1>
            <p className="text-base sm:text-xl font-bold text-slate-600">
              हमारी रिफंड और रद्दीकरण नीति से संबंधित नियम, पात्रता शर्तें एवं अनुरोध प्रक्रिया की संपूर्ण जानकारी।
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-bold text-slate-500 pt-2 border-t-2 border-slate-100">
          <span>📅 अंतिम अद्यतन: सितंबर 2026</span>
          <span>•</span>
          <span>लागू क्षेत्र: RK STUDY CENTRE वेबसाइट एवं सशुल्क शैक्षणिक सेवाएं</span>
        </div>
      </header>

      {/* सुरक्षा चेतावनी बॉक्स (Security Precaution Banner) */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-3 text-amber-900 font-black text-lg sm:text-xl">
          <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0" />
          <span>महत्वपूर्ण सुरक्षा चेतावनी (Security Warning)</span>
        </div>
        <p className="text-base sm:text-lg font-medium text-amber-900 leading-relaxed">
          <strong className="font-black">RK STUDY CENTRE</strong> कभी भी आपसे आपके खाते का <strong className="font-black">Password</strong>, <strong className="font-black">OTP</strong>, <strong className="font-black">UPI PIN</strong>, <strong className="font-black">Card PIN</strong> या अन्य गोपनीय क्रेडेंशियल नहीं मांगता है। 
          रिफंड या रद्दीकरण सहायता के समय कृपया किसी के साथ भी अपनी संवेदनशील वित्तीय जानकारी साझा न करें।
        </p>
      </div>

      {/* त्वरित विषय-सूची (Quick Table of Contents) */}
      <nav aria-label="विषय सूची" className="bg-slate-50 rounded-3xl p-6 sm:p-8 border-2 border-slate-200 space-y-4">
        <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
          <span>विषय-सूची (Quick Navigation)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm sm:text-base">
          {(sections || []).map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className={`text-left px-3.5 py-2 rounded-xl font-bold transition-colors flex items-center gap-2.5 cursor-pointer ${
                activeSectionId === sec.id
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-blue-100/70 hover:text-blue-900'
              }`}
            >
              <span className="w-6 h-6 rounded-md bg-slate-200 text-slate-800 text-xs font-black flex items-center justify-center shrink-0">
                {sec.number}
              </span>
              <span className="truncate">{sec.title}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* 10 मुख्य अनुभाग (The 10 Comprehensive Sections) */}
      <div className="space-y-8">
        
        {/* 1. परिचय */}
        <section id="sec-1" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">1</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">1. परिचय (Introduction)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            इस <strong className="font-black text-slate-900">रिफंड और रद्दीकरण नीति (Refund & Cancellation Policy)</strong> का उद्देश्य 
            <strong className="font-black text-slate-900"> RK STUDY CENTRE</strong> के विद्यार्थियों और अभिभावकों को हमारे पाठ्यक्रमों एवं सशुल्क सेवाओं के संबंध में स्पष्ट, पारदर्शी और न्यायसंगत नियम प्रदान करना है।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            हमारा लक्ष्य यह सुनिश्चित करना है कि प्रत्येक विद्यार्थी को गुणवत्तापूर्ण अध्ययन सामग्री और शैक्षणिक मार्गदर्शन मिले। 
            वेबसाइट पर किसी भी सशुल्क सेवा या कोर्स में नामांकन करने से पहले कृपया इस नीति को ध्यानपूर्वक पढ़ें।
          </p>
        </section>

        {/* 2. Course / Paid Service Cancellation */}
        <section id="sec-2" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">2</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">2. Course / Paid Service Cancellation</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            किसी भी कोर्स (Course) या सशुल्क सेवा (Paid Service) के रद्दीकरण (Cancellation) से संबंधित नियम उस विशिष्ट कोर्स या सेवा के लिए निर्धारित एवं उल्लिखित शर्तों पर निर्भर करते हैं।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            कुछ शैक्षणिक सामग्री या बैच ऐसे हो सकते हैं जहाँ नामांकन के बाद तत्काल रद्दीकरण की सुविधा उपलब्ध होती है, 
            जबकि कुछ विशेष सत्रों या डिजिटल डाउनलोड्स में सेवा की प्रकृति के अनुसार रद्दीकरण की शर्तें भिन्न हो सकती हैं। 
            संबंधित कोर्स की खरीद के समय प्रदर्शित विवरण को ही उस कोर्स के लिए प्राथमिक माना जाएगा।
          </p>
        </section>

        {/* 3. Refund Eligibility */}
        <section id="sec-3" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">3</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">3. Refund Eligibility (रिफंड पात्रता)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            जहाँ भी रिफंड की सुविधा प्रदान की जाती है, वहाँ रिफंड की पात्रता (Refund Eligibility) निम्नलिखित कारकों पर निर्भर करती है:
          </p>
          <ul className="space-y-3 text-base sm:text-lg text-slate-800 font-medium pl-2">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
              <span>संबंधित कोर्स अथवा सशुल्क सेवा की विशिष्ट नियम व शर्तें।</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
              <span>अनुरोध की वास्तविक परिस्थितियाँ (जैसे तकनीकी समस्या, अनधिकृत दोहरा लेनदेन, अथवा सामग्री तक पहुँच न मिल पाना)।</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
              <span>अनुरोध का वैध विवरण एवं सत्यापन योग्य प्रमाण।</span>
            </li>
          </ul>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed mt-2">
            प्रत्येक रिफंड अनुरोध की समीक्षा व्यक्तिगत आधार पर और निष्पक्षता के साथ की जाती है।
          </p>
        </section>

        {/* 4. Refund Request */}
        <section id="sec-4" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">4</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">4. Refund Request (रिफंड अनुरोध प्रक्रिया)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            यदि कोई विद्यार्थी या ग्राहक रिफंड के लिए अनुरोध करना चाहता है, तो वह हमारी आधिकारिक सहायता ईमेल पर सीधे संपर्क कर सकता है:
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 sm:p-6 space-y-2">
            <span className="text-xs font-black text-blue-700 uppercase tracking-wider">
              आधिकारिक सहायता ईमेल
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900">
              <a href="mailto:rkstudycentre064@gmail.com" className="text-blue-700 hover:text-blue-900 underline underline-offset-4">
                rkstudycentre064@gmail.com
              </a>
            </div>
          </div>

          <p className="text-base sm:text-lg font-black text-slate-900 pt-2">
            अनुरोध भेजते समय कृपया निम्नलिखित जानकारी अनिवार्य रूप से संलग्न करें:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Name (पूरा नाम)', desc: 'विद्यार्थी या भुगतानकर्ता का नाम' },
              { label: 'Registered Email', desc: 'वेबसाइट पर पंजीकृत ईमेल पता' },
              { label: 'Course / Service Name', desc: 'संबधित कोर्स या सेवा का सटीक नाम' },
              { label: 'Order / Transaction Details', desc: 'भुगतान रसीद या लेनदेन विवरण (यदि उपलब्ध हो)' },
              { label: 'Reason for Request', desc: 'रिफंड अनुरोध का स्पष्ट एवं उचित कारण' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <h3 className="font-black text-slate-900 text-base">{item.label}</h3>
                <p className="text-sm font-medium text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-2 text-rose-900">
            <h4 className="font-black text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0" />
              <span>सावधानी: कभी भी गोपनीय जानकारी न भेजें</span>
            </h4>
            <p className="text-sm sm:text-base font-medium leading-relaxed">
              अनुरोध करते समय कभी भी अपना Password, OTP, Firebase credentials, Card PIN, UPI PIN या कोई अन्य संवेदनशील पासवर्ड ईमेल में न लिखें। हमारी टीम सत्यापन के लिए आपसे केवल लेन-देन संदर्भ और बुनियादी संपर्क विवरण ही मांगती है।
            </p>
          </div>
        </section>

        {/* 5. Cancellation Request */}
        <section id="sec-5" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">5</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">5. Cancellation Request (रद्दीकरण प्रक्रिया)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            जहाँ किसी कोर्स अथवा सशुल्क सेवा में रद्दीकरण का विकल्प उपलब्ध है, उपयोगकर्ता अपनी सेवा को रद्द करने के लिए हमारी आधिकारिक सहायता टीम (<a href="mailto:rkstudycentre064@gmail.com" className="text-blue-700 font-bold underline">rkstudycentre064@gmail.com</a>) से संपर्क कर सकते हैं।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            रद्दीकरण का अनुरोध प्राप्त होने के पश्चात, हमारी टीम उस कोर्स की विशिष्ट शर्तों के अनुसार आपके अनुरोध की समीक्षा करेगी और आपको ईमेल के माध्यम से स्थिति से अवगत कराया जाएगा।
          </p>
        </section>

        {/* 6. Refund Processing */}
        <section id="sec-6" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">6</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">6. Refund Processing (रिफंड प्रक्रमण)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            जब कोई रिफंड अनुरोध औपचारिक रूप से स्वीकृत हो जाता है, तो उसे लागू भुगतान विधि (Applicable Payment Method) और सेवा शर्तों के अनुसार संसाधित (Process) किया जाता है।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            स्वीकृत राशि को सामान्यतः उसी मूल भुगतान माध्यम (जैसे बैंक खाता, यूपीआई अथवा कार्ड) में लौटाया जाता है जिससे भुगतान किया गया था। बैंकिंग प्रणाली और मध्यस्थ भुगतान नेटवर्क के संचालन के आधार पर खाते में राशि दिखने में उचित समय लग सकता है।
          </p>
        </section>

        {/* 7. Non-Refundable Situations */}
        <section id="sec-7" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">7</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">7. Non-Refundable Situations (गैर-रिफंडेबल स्थितियां)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            हम सभी सेवाओं पर कोई सामान्य "कोई रिफंड नहीं" (Blanket No-Refund) नियम लागू नहीं करते हैं। 
            हालाँकि, कुछ विशिष्ट उत्पादों या सेवाओं में ऐसी गैर-रिफंडेबल शर्तें हो सकती हैं जो सेवा की प्रकृति (जैसे पूर्णतः उपभोग की गई डिजिटल अध्ययन सामग्री या पूर्ण किए जा चुके टेस्ट सत्र) के अनुसार तय होती हैं।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            ऐसी किसी भी स्थिति में, गैर-रिफंडेबल होने की स्पष्ट जानकारी खरीद अथवा नामांकन से पहले स्पष्ट रूप से प्रदर्शित की जाएगी ताकि विद्यार्थी पूरी जानकारी के साथ निर्णय ले सकें।
          </p>
        </section>

        {/* 8. Duplicate / Incorrect Payment */}
        <section id="sec-8" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">8</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">8. Duplicate / Incorrect Payment (दोहरा या त्रुटिपूर्ण भुगतान)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            यदि किसी तकनीकी त्रुटि, इंटरनेट कनेक्शन में रुकावट या सिस्टम में देरी के कारण आपके खाते से किसी एक ही सेवा के लिए एक से अधिक बार (Duplicate Payment) राशि कट गई है, अथवा गलत राशि का भुगतान हो गया है:
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-2 text-emerald-900">
            <p className="text-base font-medium leading-relaxed">
              कृपया तुरंत हमारी सहायता टीम (<a href="mailto:rkstudycentre064@gmail.com" className="text-emerald-800 font-black underline">rkstudycentre064@gmail.com</a>) से दोनों लेन-देन का विवरण, बैंक संदर्भ संख्या या स्क्रीनशॉट के साथ संपर्क करें। 
              सत्यापन के उपरांत अतिरिक्त कटी हुई राशि को शीघ्रता से वापस करने की प्रक्रिया शुरू कर दी जाएगी।
            </p>
          </div>
        </section>

        {/* 9. Changes to This Policy */}
        <section id="sec-9" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">9</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">9. Changes to This Policy (नीति में संशोधन)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            <strong className="font-black text-slate-900">RK STUDY CENTRE</strong> के पास यह अधिकार सुरक्षित है कि वह अपनी सेवाओं, पाठ्यक्रमों, कानूनी आवश्यकताओं अथवा भुगतान प्रक्रियाओं में बदलाव होने पर इस रिफंड और रद्दीकरण नीति को अद्यतन (Update) कर सके।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            संशोधित नीति को इस पृष्ठ पर अद्यतन तिथि के साथ प्रकाशित किया जाएगा। किसी भी परिवर्तन के पश्चात वेबसाइट का निरंतर उपयोग संशोधित नियमों की स्वीकृति माना जाएगा।
          </p>
        </section>

        {/* 10. Contact */}
        <section id="sec-10" className="bg-blue-50 rounded-3xl p-8 sm:p-10 border-2 border-blue-200 space-y-5 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-blue-200 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-lg shrink-0">10</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">10. संपर्क (Contact Support)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
            रिफंड, रद्दीकरण अथवा भुगतान संबंधी किसी भी प्रश्न, सहायता या अनुरोध के लिए आप हमारी आधिकारिक सहायता टीम को ईमेल भेज सकते हैं:
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-blue-200">
            <div className="space-y-1">
              <span className="text-xs font-black text-blue-700 uppercase tracking-wider">
                Refund & Cancellation Helpdesk
              </span>
              <div className="text-lg sm:text-xl font-black text-slate-900">
                <a href="mailto:rkstudycentre064@gmail.com" className="text-blue-700 hover:text-blue-900 underline underline-offset-4">
                  rkstudycentre064@gmail.com
                </a>
              </div>
            </div>

            <a href="mailto:rkstudycentre064@gmail.com" className="px-6 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-base inline-flex items-center gap-2.5 shadow-xs transition-all self-start sm:self-auto cursor-pointer">
              <Mail className="w-5 h-5" />
              <span>ईमेल भेजें ↗</span>
            </a>
          </div>
        </section>
      </div>

      {/* निचला नेविगेशन कार्ड */}
      <footer className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-black">
            विश्वसनीय एवं पारदर्शी शिक्षा मंच
          </h3>
          <p className="text-slate-300 text-sm sm:text-base font-medium">
            RK STUDY CENTRE में विद्यार्थियों का विश्वास एवं संतुष्टि हमारी सर्वोच्च प्राथमिकता है।
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
            className="px-6 py-3.5 rounded-2xl font-black text-base bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            <span>मुख्य पृष्ठ (Home)</span>
          </a>
          <a
            href="/terms-and-conditions"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3.5 rounded-2xl font-bold text-sm sm:text-base bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            नियम एवं शर्तें ↗
          </a>
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3.5 rounded-2xl font-bold text-sm sm:text-base bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            गोपनीयता नीति ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
