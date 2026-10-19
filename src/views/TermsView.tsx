import { useState } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  UserCheck,
  BookOpen,
  HelpCircle,
  GraduationCap,
  AlertTriangle,
  Lock,
  Server,
  CloudOff,
  CheckCircle2,
  FileSpreadsheet,
  Mail,
  ArrowLeft,
  Scale,
  Info,
  ExternalLink
} from 'lucide-react';
import type { MainNavRoute, ClassLevel, MoreSectionTab } from '../types';
import { BackButton } from '../components/BackButton';
import { getStandaloneAppUrl, openPolicyInNewTab } from '../utils/navigationUtils';

interface TermsViewProps {
  onNavigate: (route: MainNavRoute, params?: { classLevel?: ClassLevel; moreTab?: MoreSectionTab }) => void;
}

export function TermsView({ onNavigate }: TermsViewProps) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const sections = [
    { id: 'sec-1', number: '1', title: 'परिचय (Introduction)', icon: Info },
    { id: 'sec-2', number: '2', title: 'Account और Registration', icon: UserCheck },
    { id: 'sec-3', number: '3', title: 'Website का उपयोग (Acceptable Use)', icon: BookOpen },
    { id: 'sec-4', number: '4', title: 'Study Material एवं सामग्री अधिकार', icon: FileSpreadsheet },
    { id: 'sec-5', number: '5', title: 'Online Tests और Practice Quiz', icon: HelpCircle },
    { id: 'sec-6', number: '6', title: 'Courses एवं नामांकन', icon: GraduationCap },
    { id: 'sec-7', number: '7', title: 'उपयोगकर्ता आचरण (User Conduct)', icon: AlertTriangle },
    { id: 'sec-8', number: '8', title: 'Account Suspension (निलंबन नीति)', icon: Lock },
    { id: 'sec-9', number: '9', title: 'Third-Party Services (तृतीय-पक्ष सेवाएं)', icon: Server },
    { id: 'sec-10', number: '10', title: 'Website Availability (वेबसाइट उपलब्धता)', icon: CloudOff },
    { id: 'sec-11', number: '11', title: 'Content Accuracy (सामग्री की सटीकता)', icon: CheckCircle2 },
    { id: 'sec-12', number: '12', title: 'Intellectual Property (बौद्धिक संपदा)', icon: Scale },
    { id: 'sec-13', number: '13', title: 'Privacy (गोपनीयता नीति)', icon: ShieldCheck },
    { id: 'sec-14', number: '14', title: 'Changes to Terms (शर्तों में बदलाव)', icon: FileCheck2 },
    { id: 'sec-15', number: '15', title: 'संपर्क (Contact Information)', icon: Mail },
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
            href={getStandaloneAppUrl('/terms-and-conditions')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => openPolicyInNewTab(e, '/terms-and-conditions', () => onNavigate('terms-and-conditions'))}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>नए टैब में खोलें</span>
          </a>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-900 text-xs sm:text-sm font-black">
            <FileCheck2 className="w-4 h-4 text-blue-700 shrink-0" />
            <span>कानूनी दस्तावेज़ • Terms & Conditions</span>
          </div>
        </div>
      </div>

      {/* मुख्य शीर्षक कार्ड (Document Header) */}
      <header className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-md shrink-0">
            <FileCheck2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs sm:text-sm font-black text-blue-700 uppercase tracking-wider">
              RK STUDY CENTRE • सेवा एवं उपयोग शर्तें
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              नियम एवं शर्तें
            </h1>
            <p className="text-base sm:text-xl font-bold text-slate-600">
              RK STUDY CENTRE वेबसाइट एवं सेवाओं के उपयोग हेतु आवश्यक दिशा-निर्देश एवं कानूनी नियम
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-bold text-slate-500 pt-2 border-t-2 border-slate-100">
          <span>📅 अंतिम अद्यतन: सितंबर 2026</span>
          <span>•</span>
          <span>लागू क्षेत्र: RK STUDY CENTRE वेबसाइट एवं सभी संबद्ध डिजिटल सेवाएं</span>
        </div>

        {/* स्पष्ट अस्वीकरण एवं स्वतंत्र पहचान सूचना */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-200 text-amber-950 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-900 font-black text-sm sm:text-base">
            <Info className="w-5 h-5 text-amber-700 shrink-0 stroke-[2.5]" />
            <span>महत्वपूर्ण अस्वीकरण (Disclaimer of Non-Affiliation)</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-amber-900 leading-relaxed">
            <strong>RK STUDY CENTRE</strong> एक स्वतंत्र निजी शैक्षणिक अधिगम मंच (Independent Educational Learning Platform) है। 
            यह मंच किसी भी सरकारी विभाग, सरकारी बोर्ड, अथवा बिहार विद्यालय परीक्षा समिति (BSEB) से आधिकारिक रूप से संबद्ध, 
            अनुमोदित या प्रमाणित होने का कोई दावा नहीं करता है। यहाँ उपलब्ध कराई गई सामग्री केवल छात्रों के स्वाध्याय एवं अभ्यास हेतु है।
          </p>
        </div>
      </header>

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

      {/* 15 मुख्य अनुभाग (The 15 Comprehensive Sections) */}
      <div className="space-y-8">
        {/* 1. परिचय */}
        <section
          id="sec-1"
          className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">
              1
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              1. परिचय (Introduction)
            </h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            <strong className="font-black text-slate-900">RK STUDY CENTRE</strong> एक समर्पित शैक्षणिक मंच है, 
            जो विशेष रूप से कक्षा 9वीं, 10वीं (मैट्रिक), 11वीं और 12वीं (इंटरमीडिएट) के विद्यार्थियों के लिए डिजिटल 
            अध्ययन सामग्री, अध्यायवार PDF नोट्स, मॉडल पेपर्स, ऑनलाइन टेस्ट और मार्गदर्शन प्रदान करता है।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            जब आप इस वेबसाइट (<span className="font-mono text-blue-700 font-bold">RK STUDY CENTRE</span>) पर आते हैं, 
            अकाउंट बनाते हैं या किसी भी शैक्षणिक सामग्री अथवा ऑनलाइन टेस्ट का उपयोग करते हैं, तो आप इन नियमों एवं शर्तों 
            (Terms & Conditions) का पूर्णतः पालन करने के लिए अपनी सहमति व्यक्त करते हैं। यदि आप इन शर्तों के किसी भी भाग से 
            सहमत नहीं हैं, तो आपको इस वेबसाइट की सेवाओं का उपयोग बंद कर देना चाहिए।
          </p>
        </section>

        {/* 2. Account और Registration */}
        <section
          id="sec-2"
          className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">
              2
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              2. Account और Registration
            </h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            वेबसाइट की कुछ विशेष सुविधाओं (जैसे ऑनलाइन टेस्ट के परिणाम सुरक्षित रखना, व्यक्तिगत डैशबोर्ड और टेस्ट स्कोर ट्रैकिंग) 
            का उपयोग करने के लिए विद्यार्थियों को अपना Account बनाना पड़ सकता है। खाता पंजीकरण हेतु निम्नलिखित नियम लागू होते हैं:
          </p>
          <ul className="space-y-3 text-base sm:text-lg text-slate-800 font-medium pl-2">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
              <span>
                <strong className="font-black text-slate-900">सटीक जानकारी (Accurate Information):</strong> पंजीकरण करते समय 
                विद्यार्थी को अपना सही नाम, वैध ईमेल पता (Email) और सही कक्षा (Class) का विवरण देना अनिवार्य है। गलत या भ्रामक 
                जानकारी से खाता निर्माण प्रतिबंधित है।
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
              <span>
                <strong className="font-black text-slate-900">खाते की व्यक्तिगत ज़िम्मेदारी (Account Responsibility):</strong> आप 
                अपने खाते के माध्यम से होने वाली प्रत्येक गतिविधि के लिए स्वयं ज़िम्मेदार होंगे।
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
              <span>
                <strong className="font-black text-slate-900">पासवर्ड की गोपनीयता (Confidentiality):</strong> विद्यार्थियों को 
                अपना पासवर्ड (Password) पूरी तरह गोपनीय रखना चाहिए। पासवर्ड किसी अन्य व्यक्ति के साथ साझा न करें।
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
              <span>
                <strong className="font-black text-slate-900">क्रेडेंशियल साझा न करना (No Credential Sharing):</strong> एक छात्र 
                का खाता केवल उसी छात्र के व्यक्तिगत उपयोग के लिए है। एक खाते को कई छात्रों में साझा करना या अनाधिकृत रूप से बेचना 
                सख्ती से वर्जित है।
              </span>
            </li>
          </ul>
        </section>

        {/* 3. Website का उपयोग */}
        <section
          id="sec-3"
          className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">
              3
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              3. Website का उपयोग (Acceptable Use of Educational Features)
            </h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            RK STUDY CENTRE पर उपलब्ध सभी शैक्षणिक सुविधाएं केवल वैध एवं सकारात्मक अध्ययन उद्देश्यों के लिए प्रदान की गई हैं:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              { title: 'Study Material व Notes', desc: 'कक्षा 9 से 12 तक के मुख्य विषयों के संक्षिप्त एवं विस्तृत नोट्स केवल व्यक्तिगत अध्ययन हेतु हैं।' },
              { title: 'PDF दर्शक (PDF Viewer)', desc: 'ब्राउज़र में PDF सामग्री को सुगमता से पढ़ने और सूत्रों को दोहराने की सुविधा।' },
              { title: 'Online Tests', desc: 'बोर्ड परीक्षा पैटर्न के वस्तुनिष्ठ प्रश्नों के वास्तविक समय अभ्यास हेतु।' },
              { title: 'Practice Quiz', desc: 'बिना किसी नकारात्मक दबाव के त्वरित ज्ञान परीक्षण एवं रिवीज़न।' },
              { title: 'Courses व रणनीतियां', desc: 'कक्षावार रणनीतिक योजना एवं विषयवार अध्ययन मार्गदर्शन।' },
              { title: 'अन्य शैक्षणिक सुविधाएं', desc: 'फॉर्मूले, महत्वपूर्ण प्रश्न बैंक और परीक्षा टिप्स का समुचित उपयोग।' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <h3 className="font-black text-slate-900 text-base">{item.title}</h3>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Study Material */}
        <section
          id="sec-4"
          className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">
              4
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              4. Study Material (अध्ययन सामग्री नियम)
            </h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            मंच पर उपलब्ध समस्त शैक्षिक सामग्री (Study Material, प्रश्नोत्तर, अध्याय सारांश एवं PDF नोट्स) केवल 
            छात्रों के व्यक्तिगत अधिगम एवं परीक्षा की तैयारी के लिए उपलब्ध कराई गई है।
          </p>
          <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-950 space-y-2">
            <div className="flex items-center gap-2 font-black text-rose-900 text-base">
              <AlertTriangle className="w-5 h-5 text-rose-700 stroke-[2.5]" />
              <span>सख्त प्रतिबंध (Prohibited Exploitation)</span>
            </div>
            <p className="text-sm sm:text-base font-medium leading-relaxed text-rose-900">
              उपयोगकर्ताओं द्वारा किसी भी सामग्री का अनधिकृत दुरुपयोग, कॉपी करना (Mass Copying), किसी अन्य वेबसाइट या ऐप पर पुनः 
              प्रकाशित करना, बेचना (Selling), अथवा किसी भी रूप में व्यावसायिक लाभ (Commercial Exploitation) के लिए उपयोग करना 
              सख्ती से निषिद्ध है, जब तक कि इसके लिए लिखित अनुमति प्राप्त न हो।
            </p>
          </div>
        </section>

        {/* 5. Online Tests और Quiz */}
        <section
          id="sec-5"
          className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">
              5
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              5. Online Tests और Practice Quiz
            </h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            मंच पर उपलब्ध ऑनलाइन टेस्ट और क्विज छात्रों के आत्म-मूल्यांकन एवं परीक्षा अभ्यास के लिए एक शैक्षणिक साधन हैं। 
            इन टेस्टों में प्राप्त स्कोर और प्रतिशत का उपयोग छात्र अपनी तैयारी का विश्लेषण करने तथा प्रगति ट्रैक करने के लिए 
            कर सकते हैं।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            कृपया ध्यान दें कि ये टेस्ट केवल अभ्यास हेतु हैं और यह किसी वास्तविक बोर्ड परीक्षा के परिणाम अथवा सरकारी प्रमाण-पत्र 
            का प्रतिनिधित्व नहीं करते हैं।
          </p>
        </section>

        {/* 6. Courses */}
        <section
          id="sec-6"
          className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">
              6
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              6. Courses (पाठ्यक्रम एवं नामांकन)
            </h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            RK STUDY CENTRE पर प्रदर्शित विभिन्न कोर्सेस और बैच (जैसे मैट्रिक लक्ष्य बैच, इंटरमीडिएट स्पेशल बैच) की पहुंच 
            संबंधित कोर्स के विन्यास (Configuration), उपलब्धता और विद्यार्थी के सक्रिय नामांकन (Enrollment) पर निर्भर करती है।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            प्रबंधन किसी भी कोर्स की रूपरेखा, विषय-सूची अथवा मॉड्यूल में शैक्षणिक गुणवत्ता सुधार हेतु समय-समय पर संशोधन करने 
            का अधिकार सुरक्षित रखता है।
          </p>
        </section>

        {/* 7. User Conduct */}
        <section
          id="sec-7"
          className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">
              7
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              7. उपयोगकर्ता आचरण (User Conduct & Prohibited Acts)
            </h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            मंच की अखंडता और सभी विद्यार्थियों के सुरक्षित अनुभव को बनाए रखने के लिए, उपयोगकर्ता निम्नलिखित में से 
            किसी भी गतिविधि में संलग्न नहीं होंगे:
          </p>
          <ul className="space-y-3 text-base sm:text-lg text-slate-800 font-medium pl-2">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-rose-600 mt-2.5 shrink-0" />
              <span>
                <strong className="font-black text-slate-900">अनधिकृत पहुंच का प्रयास (Unauthorized Access):</strong> सर्वर, 
                डेटाबेस, अन्य उपयोगकर्ताओं के खातों अथवा प्रशासनिक प्रणालियों में अनाधिकृत रूप से प्रवेश करने का प्रयास करना।
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-rose-600 mt-2.5 shrink-0" />
              <span>
                <strong className="font-black text-slate-900">वेबसाइट को बाधित या क्षतिग्रस्त करना (Disruption & Damage):</strong> वेबसाइट 
                पर अत्यधिक लोड डालना (DDoS), स्पैमिंग, दुर्भावनापूर्ण स्क्रिप्ट्स या वायरस का प्रसार करना।
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-rose-600 mt-2.5 shrink-0" />
              <span>
                <strong className="font-black text-slate-900">हानिकारक या अवैध सामग्री (Harmful Content):</strong> किसी भी प्रकार की 
                अवैध, अश्लील, भड़काऊ या कॉपीराइट का उल्लंघन करने वाली सामग्री अपलोड अथवा साझा करना।
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-rose-600 mt-2.5 shrink-0" />
              <span>
                <strong className="font-black text-slate-900">अन्य उपयोगकर्ताओं का उत्पीड़न (Abuse & Harassment):</strong> साथी 
                विद्यार्थियों अथवा सहायता दल के सदस्यों के साथ किसी भी प्रकार का दुर्व्यवहार या अपमानजनक भाषा का प्रयोग करना।
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-rose-600 mt-2.5 shrink-0" />
              <span>
                <strong className="font-black text-slate-900">सुरक्षा प्रतिबंधों को बायपास करना (Bypassing Controls):</strong> सुरक्षा 
                प्रोटोकॉल, टेस्ट टाइमर अथवा सामग्री सुरक्षा उपायों को निष्प्रभावी या बायपास करने का प्रयास करना।
              </span>
            </li>
          </ul>
        </section>

        {/* 8. Account Suspension */}
        <section
          id="sec-8"
          className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">
              8
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              8. Account Suspension (खाता निलंबन व प्रतिबंध)
            </h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            मंच की सुरक्षा, दुरुपयोग की रोकथाम अथवा इन नियमों व शर्तों के गंभीर उल्लंघन की स्थिति में, 
            RK STUDY CENTRE प्रबंधन को किसी भी उपयोगकर्ता खाते की पहुंच को अस्थायी अथवा स्थायी रूप से निलंबित 
            (Suspend) या समाप्त (Terminate) करने का वैध अधिकार है।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            यदि किसी विद्यार्थी का खाता गलती से प्रभावित हुआ हो, तो वे अपना पक्ष रखने हेतु आधिकारिक सहायता ईमेल पर 
            संपर्क कर सकते हैं।
          </p>
        </section>

        {/* 9. Third-Party Services */}
        <section
          id="sec-9"
          className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">
              9
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              9. Third-Party Services (तृतीय-पक्ष तकनीकी सेवाएं)
            </h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            RK STUDY CENTRE वेबसाइट को विश्वसनीय और उच्च प्रदर्शन युक्त बनाए रखने के लिए मानक तृतीय-पक्ष तकनीकी अवसंरचना का उपयोग किया जाता है:
          </p>
          <ul className="space-y-2.5 text-base sm:text-lg text-slate-800 font-medium pl-2">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
              <span><strong className="font-black text-slate-900">Firebase & Google Cloud:</strong> सुरक्षित प्रमाणीकरण (Authentication), होस्टिंग और डेटाबेस प्रबंधन हेतु।</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
              <span><strong className="font-black text-slate-900">Google Sign-In:</strong> उपयोगकर्ताओं को सुरक्षित एवं त्वरित लॉगिन सुविधा उपलब्ध कराने हेतु।</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
              <span><strong className="font-black text-slate-900">Email & Hosting Services:</strong> संचार एवं वेब सामग्री के निरंतर संचालन हेतु।</span>
            </li>
          </ul>
          <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed">
            इन तृतीय-पक्ष सेवाओं का संचालन उनकी अपनी संबंधित नीतियों एवं सेवा शर्तों के अधीन होता है।
          </p>
        </section>

        {/* 10. Website Availability */}
        <section
          id="sec-10"
          className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">
              10
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              10. Website Availability (वेबसाइट उपलब्धता)
            </h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            हमारा निरंतर प्रयास रहता है कि वेबसाइट 24 घंटे सातों दिन निर्बाध रूप से उपलब्ध रहे। तथापि, नियमित रखरखाव 
            (Scheduled Maintenance), तकनीकी उन्नयन, नेटवर्क अथवा सर्वर की विफलता, अथवा अप्रत्याशित तकनीकी समस्याओं के 
            कारण वेबसाइट अस्थायी रूप से अनुपलब्ध हो सकती है।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            ऐसी किसी भी सामयिक अनुपलब्धता से उत्पन्न होने वाली असुविधा के लिए हम किसी क्षतिपूर्ति के उत्तरदायी नहीं होंगे।
          </p>
        </section>

        {/* 11. Content Accuracy */}
        <section
          id="sec-11"
          className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">
              11
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              11. Content Accuracy (सामग्री की सटीकता व शैक्षणिक सत्यापन)
            </h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            RK STUDY CENTRE पर प्रकाशित सभी नोट्स, मॉडल पेपर और टेस्ट प्रश्नों को उपयोगी, प्रासंगिक और त्रुटिरहित रखने 
            के लिए पूरी सावधानी एवं उचित प्रयास किए जाते हैं।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            तथापि, पाठ्यक्रम में बोर्ड द्वारा समय-समय पर किए जाने वाले परिवर्तनों, मुद्रण संबंधी गलतियों अथवा व्याख्यात्मक 
            भिन्नताओं के कारण विद्यार्थियों को सलाह दी जाती है कि वे किसी भी महत्वपूर्ण शैक्षणिक निर्णय, परीक्षा तिथि अथवा 
            आधिकारिक पाठ्यक्रम हेतु अपने विद्यालय, कॉलेज अथवा आधिकारिक बोर्ड दिशा-निर्देशों से भी सत्यापन अवश्य कर लें।
          </p>
        </section>

        {/* 12. Intellectual Property */}
        <section
          id="sec-12"
          className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">
              12
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              12. Intellectual Property (बौद्धिक संपदा अधिकार)
            </h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            RK STUDY CENTRE का नाम, लोगो, ग्राफ़िक्स, यूज़र इंटरफ़ेस डिज़ाइन, मूल रूप से संकलित नोट्स, 
            और वेबसाइट का संपूर्ण कोड लागू बौद्धिक संपदा (Intellectual Property) और कॉपीराइट कानूनों द्वारा संरक्षित हैं।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            इनका उपयोग केवल अधिकृत शैक्षणिक संदर्भों में ही किया जा सकता है। किसी भी प्रकार का अनधिकृत क्लोनिंग, लोगो का दुरुपयोग 
            अथवा ट्रेडमार्क का अनुचित उपयोग वैधानिक कार्रवाई का आधार हो सकता है।
          </p>
        </section>

        {/* 13. Privacy */}
        <section
          id="sec-13"
          className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">
              13
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              13. Privacy (डेटा एवं व्यक्तिगत जानकारी की सुरक्षा)
            </h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            विद्यार्थियों की व्यक्तिगत जानकारी (जैसे नाम, ईमेल, कक्षा आदि) को हमारे मंच द्वारा अत्यधिक संवेदनशीलता और 
            सुरक्षा के साथ प्रबंधित किया जाता है। व्यक्तिगत डेटा का संकलन और उपयोग हमारी{' '}
            <strong className="font-black text-slate-900">गोपनीयता नीति (Privacy Policy)</strong> के अनुसार ही किया जाता है।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            हम कभी भी विद्यार्थियों की निजी जानकारी को किसी अवांछित तृतीय पक्ष को बिक्री अथवा अनैतिक प्रचार हेतु साझा नहीं करते हैं।
          </p>
        </section>

        {/* 14. Changes to Terms */}
        <section
          id="sec-14"
          className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">
              14
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              14. Changes to Terms (शर्तों में संशोधन)
            </h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            RK STUDY CENTRE को आवश्यकतानुसार इन नियमों एवं शर्तों को किसी भी समय संशोधित, अद्यतन अथवा परिवर्तित 
            करने का पूरा अधिकार है। जब भी कोई संशोधन किया जाएगा, उसका अद्यतन संस्करण इसी पृष्ठ पर प्रकाशित किया जाएगा 
            और शीर्ष पर अद्यतन तिथि प्रदर्शित की जाएगी।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            संशोधन के पश्चात वेबसाइट का निरंतर उपयोग यह सिद्ध करेगा कि आप नई एवं अद्यतन शर्तों से सहमत हैं।
          </p>
        </section>

        {/* 15. Contact */}
        <section
          id="sec-15"
          className="bg-blue-50 rounded-3xl p-8 sm:p-10 border-2 border-blue-200 space-y-5 scroll-mt-6"
        >
          <div className="flex items-center gap-3 border-b-2 border-blue-200 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-lg shrink-0">
              15
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              15. संपर्क (Contact for Legal & Terms Inquiries)
            </h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
            यदि इन नियमों एवं शर्तों (Terms & Conditions) के संबंध में आपका कोई प्रश्न, सुझाव अथवा स्पष्टीकरण की आवश्यकता हो, 
            तो आप हमारी सहायता टीम से निम्नलिखित आधिकारिक ईमेल पर संपर्क कर सकते हैं:
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-blue-200">
            <div className="space-y-1">
              <span className="text-xs font-black text-blue-700 uppercase tracking-wider">
                आधिकारिक सहायता ईमेल
              </span>
              <div className="text-lg sm:text-xl font-black text-slate-900">
                <a
                  href="mailto:rkstudycentre064@gmail.com"
                  className="text-blue-700 hover:text-blue-900 underline underline-offset-4"
                >
                  rkstudycentre064@gmail.com
                </a>
              </div>
            </div>

            <a
              href="mailto:rkstudycentre064@gmail.com"
              className="px-6 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-base inline-flex items-center gap-2.5 shadow-xs transition-all self-start sm:self-auto cursor-pointer"
            >
              <Mail className="w-5 h-5" />
              <span>ईमेल भेजें ↗</span>
            </a>
          </div>
        </section>
      </div>

      {/* निचला नेविगेशन व आभार कार्ड */}
      <footer className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-black">
            RK STUDY CENTRE के साथ सुरक्षित एवं अनुशासित अध्ययन
          </h3>
          <p className="text-slate-300 text-sm sm:text-base font-medium">
            नियमों का पालन करके आप एक सुरक्षित और प्रेरणादायक शिक्षण वातावरण का निर्माण करते हैं।
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
            href="/contact-support"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3.5 rounded-2xl font-bold text-sm sm:text-base bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            संपर्क सहायता ↗
          </a>

          <a
            href="/faq"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3.5 rounded-2xl font-bold text-sm sm:text-base bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            प्रश्नोत्तरी (FAQ) ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
