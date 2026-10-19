import { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  FileEdit,
  Trash2,
  UserX,
  HelpCircle,
  Mail,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Info,
  ShieldAlert,
  ExternalLink,
  Lock
} from 'lucide-react';
import type { MainNavRoute, ClassLevel, MoreSectionTab } from '../types';
import { BackButton } from '../components/BackButton';
import { getStandaloneAppUrl, openPolicyInNewTab } from '../utils/navigationUtils';

interface DataPrivacyRightsViewProps {
  onNavigate: (route: MainNavRoute, params?: { classLevel?: ClassLevel; moreTab?: MoreSectionTab }) => void;
}

export function DataPrivacyRightsView({ onNavigate }: DataPrivacyRightsViewProps) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const sections = [
    { id: 'sec-1', number: '1', title: 'डेटा गोपनीयता अधिकार क्या हैं', icon: Info },
    { id: 'sec-2', number: '2', title: 'अपनी जानकारी के बारे में जानकारी प्राप्त करना', icon: UserCheck },
    { id: 'sec-3', number: '3', title: 'जानकारी में सुधार (Correction of Information)', icon: FileEdit },
    { id: 'sec-4', number: '4', title: 'डेटा हटाने का अनुरोध (Data Deletion)', icon: Trash2 },
    { id: 'sec-5', number: '5', title: 'Account बंद करने का अनुरोध (Account Closure)', icon: UserX },
    { id: 'sec-6', number: '6', title: 'डेटा के उपयोग के बारे में प्रश्न', icon: HelpCircle },
    { id: 'sec-7', number: '7', title: 'Privacy Request कैसे भेजें', icon: Mail },
    { id: 'sec-8', number: '8', title: 'अनुरोध की जाँच एवं सत्यापन', icon: CheckCircle2 },
    { id: 'sec-9', number: '9', title: 'गोपनीयता नीति (Privacy Policy)', icon: FileText },
    { id: 'sec-10', number: '10', title: 'संपर्क (Contact Information)', icon: Lock },
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
            href={getStandaloneAppUrl('/data-privacy')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => openPolicyInNewTab(e, '/data-privacy', () => onNavigate('data-privacy'))}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>नए टैब में खोलें</span>
          </a>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-900 text-xs sm:text-sm font-black">
            <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
            <span>उपयोगकर्ता अधिकार • Data Privacy Rights</span>
          </div>
        </div>
      </div>

      {/* मुख्य शीर्षक कार्ड (Document Header) */}
      <header className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-md shrink-0">
            <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs sm:text-sm font-black text-blue-700 uppercase tracking-wider">
              RK STUDY CENTRE • डेटा सुरक्षा एवं छात्र अधिकार
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              डेटा गोपनीयता अधिकार
            </h1>
            <p className="text-base sm:text-xl font-bold text-slate-600">
              अपनी व्यक्तिगत जानकारी, खाते के नियंत्रण, सुधार, हटाने तथा गोपनीयता विकल्पों से संबंधित अधिकारों की संपूर्ण जानकारी।
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-bold text-slate-500 pt-2 border-t-2 border-slate-100">
          <span>📅 अंतिम अद्यतन: सितंबर 2026</span>
          <span>•</span>
          <span>लागू क्षेत्र: RK STUDY CENTRE वेबसाइट एवं डिजिटल छात्र सेवाएं</span>
        </div>
      </header>

      {/* सुरक्षा चेतावनी बॉक्स (Security Precaution Banner) */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-3 text-amber-900 font-black text-lg sm:text-xl">
          <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0" />
          <span>अति-महत्वपूर्ण सुरक्षा निर्देश (Security Reminder)</span>
        </div>
        <p className="text-base sm:text-lg font-medium text-amber-900 leading-relaxed">
          गोपनीयता अनुरोध या सहायता के समय <strong className="font-black">RK STUDY CENTRE</strong> कभी भी आपसे आपके खाते का <strong className="font-black">Password</strong>, <strong className="font-black">OTP</strong>, <strong className="font-black">Firebase credentials</strong>, <strong className="font-black">Card PIN</strong>, <strong className="font-black">UPI PIN</strong> या कोई अन्य गोपनीय ऑथेंटिकेशन कोड नहीं मांगता है। कृपया किसी भी ईमेल या संदेश में ये संवेदनशील विवरण कभी न भेजें।
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
        
        {/* 1. डेटा गोपनीयता अधिकार क्या हैं */}
        <section id="sec-1" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">1</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">1. डेटा गोपनीयता अधिकार क्या हैं</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            <strong className="font-black text-slate-900">RK STUDY CENTRE</strong> पर हम यह मानते हैं कि प्रत्येक विद्यार्थी और उपयोगकर्ता को अपनी व्यक्तिगत जानकारी (Personal Information) पर नियंत्रण रखने का पूरा अवसर मिलना चाहिए।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            लागू कानूनों और आपके द्वारा उपयोग की जाने वाली वेबसाइट सेवाओं के आधार पर, आपके पास अपने व्यक्तिगत डेटा के संबंध में विभिन्न अधिकार हो सकते हैं—जैसे कि अपनी जानकारी देखना, उसमें सुधार करवाना, अनावश्यक डेटा हटाना अथवा खाते को बंद करना। यह पृष्ठ उन सभी विकल्पों और अनुरोध प्रक्रियाओं को सरल शब्दों में स्पष्ट करता है।
          </p>
        </section>

        {/* 2. अपनी जानकारी के बारे में जानकारी प्राप्त करना */}
        <section id="sec-2" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">2</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">2. अपनी जानकारी के बारे में जानकारी प्राप्त करना</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            यदि आपके पास RK STUDY CENTRE पर एक पंजीकृत Account है (जैसे Email या Google Sign-In के माध्यम से), तो आप यह जानने के लिए हमारी सहायता टीम से संपर्क कर सकते हैं कि आपके खाते से कौन-सी व्यक्तिगत जानकारी संबद्ध है।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            जहाँ लागू हो, हमारी टीम आपके द्वारा सबमिट किए गए प्रोफ़ाइल विवरण (जैसे नाम, ईमेल, चयनित कक्षा एवं अध्ययन प्रगति रिकॉर्ड) के बारे में जानकारी प्रदान करेगी ताकि आपको यह पूरी तरह स्पष्ट रहे कि आपका कौन-सा डेटा सुरक्षित रखा गया है।
          </p>
        </section>

        {/* 3. जानकारी में सुधार */}
        <section id="sec-3" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">3</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">3. जानकारी में सुधार (Correction of Information)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            यदि आपको लगता है कि आपके खाते में मौजूद कोई व्यक्तिगत जानकारी अधूरी, गलत या पुरानी है (उदाहरण के लिए गलत स्पेलिंग वाला नाम, अद्यतन फोन नंबर या बदली हुई कक्षा):
          </p>
          <ul className="space-y-3 text-base sm:text-lg text-slate-800 font-medium pl-2">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
              <span>आप उस गलत अथवा अधूरी जानकारी में सुधार (Correction / Rectification) के लिए संपर्क कर सकते हैं।</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
              <span>उचित सत्यापन के बाद हमारी टीम आपके रिकॉर्ड को सही और अद्यतन करने में सहायता करेगी।</span>
            </li>
          </ul>
        </section>

        {/* 4. डेटा हटाने का अनुरोध */}
        <section id="sec-4" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">4</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">4. डेटा हटाने का अनुरोध (Request for Data Deletion)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            उपयोगकर्ता अपनी व्यक्तिगत जानकारी को हटाने (Data Deletion / Erasure) का अनुरोध करने के लिए RK STUDY CENTRE से संपर्क कर सकते हैं।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            कृपया ध्यान दें कि डेटा हटाने का अनुरोध लागू कानूनी आवश्यकताओं (Legal Requirements), सुरक्षा मानकों (Security Protocols), अनसुलझे लेनदेन अथवा अनिवार्य सेवा रिकॉर्डों के अधीन होता है। कानूनी या सुरक्षा दायित्वों के तहत सुरक्षित रखने योग्य न्यूनतम तकनीकी डेटा के अतिरिक्त, शेष व्यक्तिगत डेटा को हटा दिया जाता है।
          </p>
        </section>

        {/* 5. Account बंद करने का अनुरोध */}
        <section id="sec-5" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">5</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">5. Account बंद करने का अनुरोध (Account Closure)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            यदि आप भविष्य में RK STUDY CENTRE की सेवाओं का उपयोग नहीं करना चाहते हैं और अपना उपयोगकर्ता खाता पूरी तरह बंद (Close / Deactivate) करवाना चाहते हैं, तो आप सहायता टीम को ईमेल भेजकर खाता बंद करने का अनुरोध कर सकते हैं।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            खाता बंद होने के पश्चात आप उस खाते से लॉगिन (Login) नहीं कर सकेंगे तथा उससे संबद्ध सक्रिय अध्ययन प्रगति और सहेजे गए अभ्यास परीक्षण निष्क्रिय कर दिए जाएंगे।
          </p>
        </section>

        {/* 6. डेटा के उपयोग के बारे में प्रश्न */}
        <section id="sec-6" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">6</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">6. डेटा के उपयोग के बारे में प्रश्न</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            यदि आपके मन में इस बात को लेकर कोई भी प्रश्न या शंका है कि आपकी जानकारी का उपयोग कैसे किया जाता है, वह कहाँ संग्रहीत होती है (जैसे Google Firebase इंफ्रास्ट्रक्चर), या किन तृतीय-पक्ष सेवाओं के साथ बातचीत होती है, तो आप निसंकोच सहायता टीम से संपर्क कर सकते हैं।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            हमारी टीम विद्यार्थियों और अभिभावकों को पारदर्शी, स्पष्ट और संतोषजनक उत्तर प्रदान करने के लिए प्रतिबद्ध है।
          </p>
        </section>

        {/* 7. Privacy Request कैसे भेजें */}
        <section id="sec-7" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-5 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">7</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">7. Privacy Request कैसे भेजें</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            गोपनीयता या डेटा से संबंधित किसी भी अनुरोध (जैसे जानकारी देखना, सुधार, हटाना या खाता बंद करना) के लिए कृपया हमारे आधिकारिक ईमेल पते पर संदेश भेजें:
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 sm:p-6 space-y-2">
            <span className="text-xs font-black text-blue-700 uppercase tracking-wider">
              आधिकारिक Privacy Support ईमेल
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900">
              <a href="mailto:rkstudycentre064@gmail.com" className="text-blue-700 hover:text-blue-900 underline underline-offset-4">
                rkstudycentre064@gmail.com
              </a>
            </div>
          </div>

          <p className="text-base sm:text-lg font-black text-slate-900 pt-1">
            अपने ईमेल में कृपया निम्नलिखित बुनियादी विवरण अवश्य शामिल करें:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Name (पूरा नाम)', desc: 'आपका पंजीकृत नाम' },
              { label: 'Registered Email', desc: 'वेबसाइट खाते से जुड़ा पंजीकृत ईमेल' },
              { label: 'Class (यदि प्रासंगिक हो)', desc: 'आपकी चयनित कक्षा (Class 9, 10, 11 या 12)' },
              { label: 'Privacy Request का विवरण', desc: 'आप क्या अनुरोध करना चाहते हैं (सुधार, हटाना, प्रश्न आदि)' },
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
              <span>चेतावनी: संवेदनशील ऑथेंटिकेशन रहस्य कभी न भेजें</span>
            </h4>
            <p className="text-sm sm:text-base font-medium leading-relaxed">
              अनुरोध करते समय कभी भी अपना <strong className="font-black">Password</strong>, <strong className="font-black">OTP</strong>, <strong className="font-black">Firebase credentials</strong>, <strong className="font-black">Card PIN</strong>, <strong className="font-black">UPI PIN</strong> या कोई अन्य गुप्त सुरक्षा कोड न भेजें। हमारी टीम को आपके अनुरोध की प्रक्रिया के लिए इन गोपनीय विवरणों की कतई आवश्यकता नहीं होती है।
            </p>
          </div>
        </section>

        {/* 8. अनुरोध की जाँच */}
        <section id="sec-8" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">8</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">8. अनुरोध की जाँच एवं सत्यापन</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            उपयोगकर्ता के खाते और व्यक्तिगत डेटा की सुरक्षा सुनिश्चित करने के लिए, किसी भी गोपनीयता अनुरोध पर कार्रवाई करने से पूर्व उचित सत्यापन (Reasonable Verification) की आवश्यकता हो सकती है। यह सत्यापन इसलिए आवश्यक है ताकि कोई अनधिकृत व्यक्ति किसी अन्य के डेटा को देखने, बदलने या हटाने का प्रयास न कर सके।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            कृपया ध्यान दें कि हम यह गारंटी नहीं देते कि हर अनुरोध हर परिस्थिति में बिना शर्त स्वीकार ही कर लिया जाएगा। यदि कोई कानूनी, सुरक्षात्मक, विनियामक या तकनीकी अपवाद लागू होता है, तो संबंधित स्थिति की सूचना आपको स्पष्ट रूप से दी जाएगी।
          </p>
        </section>

        {/* 9. Privacy Policy */}
        <section id="sec-9" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">9</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">9. गोपनीयता नीति (Privacy Policy)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            हमारे डेटा संग्रह, सुरक्षा उपायों, तृतीय-पक्ष सेवाओं और कुकीज़ के संबंध में अधिक विस्तृत जानकारी प्राप्त करने के लिए कृपया हमारी मुख्य गोपनीयता नीति का अवलोकन करें।
          </p>

          <div className="pt-2">
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-black text-base shadow-xs transition-all cursor-pointer group"
            >
              <FileText className="w-5 h-5" />
              <span>गोपनीयता नीति (Privacy Policy) पढ़ें</span>
              <ExternalLink className="w-4 h-4 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </section>

        {/* 10. Contact */}
        <section id="sec-10" className="bg-blue-50 rounded-3xl p-8 sm:p-10 border-2 border-blue-200 space-y-5 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-blue-200 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-lg shrink-0">10</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">10. संपर्क (Contact Information)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
            गोपनीयता अधिकारों, डेटा सुधार, डेटा हटाने अथवा किसी भी प्राइवेसी प्रश्न के लिए आप सीधे हमारी आधिकारिक सहायता टीम को ईमेल लिख सकते हैं:
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-blue-200">
            <div className="space-y-1">
              <span className="text-xs font-black text-blue-700 uppercase tracking-wider">
                Data Privacy Desk • RK STUDY CENTRE
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
            विश्वसनीय एवं सुरक्षित शिक्षा मंच
          </h3>
          <p className="text-slate-300 text-sm sm:text-base font-medium">
            RK STUDY CENTRE में विद्यार्थियों का विश्वास एवं डेटा गोपनीयता हमारी सर्वोच्च प्राथमिकता है।
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
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3.5 rounded-2xl font-bold text-sm sm:text-base bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            गोपनीयता नीति ↗
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
            href="/refund-cancellation"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3.5 rounded-2xl font-bold text-sm sm:text-base bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            रिफंड नीति ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
