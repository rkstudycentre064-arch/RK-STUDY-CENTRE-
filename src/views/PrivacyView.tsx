import { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  UserCheck,
  BookOpen,
  Database,
  Cloud,
  CheckCircle2,
  Mail,
  ArrowLeft,
  Info,
  Server,
  EyeOff,
  UserPlus,
  ExternalLink
} from 'lucide-react';
import type { MainNavRoute, ClassLevel, MoreSectionTab } from '../types';
import { BackButton } from '../components/BackButton';
import { getStandaloneAppUrl, openPolicyInNewTab } from '../utils/navigationUtils';

interface PrivacyViewProps {
  onNavigate: (route: MainNavRoute, params?: { classLevel?: ClassLevel; moreTab?: MoreSectionTab }) => void;
}

export function PrivacyView({ onNavigate }: PrivacyViewProps) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const sections = [
    { id: 'sec-1', number: '1', title: 'परिचय (Introduction)', icon: Info },
    { id: 'sec-2', number: '2', title: 'कौन-सी जानकारी ली जा सकती है', icon: UserCheck },
    { id: 'sec-3', number: '3', title: 'जानकारी का उपयोग', icon: BookOpen },
    { id: 'sec-4', number: '4', title: 'Google Sign-In', icon: UserPlus },
    { id: 'sec-5', number: '5', title: 'Firebase Services', icon: Cloud },
    { id: 'sec-6', number: '6', title: 'Study Material और Course Access', icon: Database },
    { id: 'sec-7', number: '7', title: 'Data Security (डेटा सुरक्षा)', icon: Lock },
    { id: 'sec-8', number: '8', title: 'Data Sharing (डेटा साझाकरण)', icon: Server },
    { id: 'sec-9', number: '9', title: 'Cookies / Technical Data', icon: EyeOff },
    { id: 'sec-10', number: '10', title: 'Data Retention (डेटा प्रतिधारण)', icon: Database },
    { id: 'sec-11', number: '11', title: 'User Privacy Rights (अधिकार)', icon: ShieldCheck },
    { id: 'sec-12', number: '12', title: "Children's Privacy (छात्र गोपनीयता)", icon: CheckCircle2 },
    { id: 'sec-13', number: '13', title: 'Policy Updates (नीति में बदलाव)', icon: Info },
    { id: 'sec-14', number: '14', title: 'संपर्क (Contact)', icon: Mail },
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
            href={getStandaloneAppUrl('/privacy-policy')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => openPolicyInNewTab(e, '/privacy-policy', () => onNavigate('privacy-policy'))}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>नए टैब में खोलें</span>
          </a>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-900 text-xs sm:text-sm font-black">
            <Lock className="w-4 h-4 text-blue-700 shrink-0" />
            <span>कानूनी दस्तावेज़ • Privacy Policy</span>
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
              RK STUDY CENTRE • व्यक्तिगत डेटा एवं गोपनीयता
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              गोपनीयता नीति
            </h1>
            <p className="text-base sm:text-xl font-bold text-slate-600">
              यह दस्तावेज़ स्पष्ट करता है कि जब आप हमारी वेबसाइट का उपयोग करते हैं, तो आपकी जानकारी को कैसे सुरक्षित एवं प्रबंधित किया जाता है।
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-bold text-slate-500 pt-2 border-t-2 border-slate-100">
          <span>📅 अंतिम अद्यतन: सितंबर 2026</span>
          <span>•</span>
          <span>लागू क्षेत्र: RK STUDY CENTRE वेबसाइट एवं इसकी सभी सेवाएँ</span>
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

      {/* 14 मुख्य अनुभाग (The 14 Comprehensive Sections) */}
      <div className="space-y-8">
        
        {/* 1. परिचय */}
        <section id="sec-1" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">1</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">1. परिचय (Introduction)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            <strong className="font-black text-slate-900">RK STUDY CENTRE</strong> में हम आपके व्यक्तिगत डेटा और गोपनीयता का सम्मान करते हैं। 
            जब विद्यार्थी हमारी वेबसाइट का उपयोग अध्ययन, टेस्ट देने या कोर्सेस तक पहुँचने के लिए करते हैं, तो हम उनके द्वारा प्रदान की गई जानकारी को सुरक्षित रखने के लिए प्रतिबद्ध हैं।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            यह गोपनीयता नीति स्पष्ट करती है कि हम कौन-सी जानकारी लेते हैं, उसका उपयोग कैसे करते हैं, और आपके अधिकार क्या हैं। 
            इस मंच का उपयोग करके, आप इस नीति में वर्णित जानकारी के संग्रह और उपयोग के लिए अपनी सहमति देते हैं।
          </p>
        </section>

        {/* 2. कौन-सी जानकारी ली जा सकती है */}
        <section id="sec-2" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">2</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">2. कौन-सी जानकारी ली जा सकती है</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            वेबसाइट की सुविधाओं (जैसे Account बनाना, टेस्ट देना) का सुचारू उपयोग सुनिश्चित करने के लिए, हम केवल वही जानकारी एकत्र करते हैं जो आवश्यक है। सक्षम सुविधाओं के आधार पर, यह जानकारी निम्नलिखित हो सकती है:
          </p>
          <ul className="space-y-3 text-base sm:text-lg text-slate-800 font-medium pl-2">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
              <span><strong className="font-black text-slate-900">व्यक्तिगत जानकारी:</strong> आपका Name (नाम) और Email address (ईमेल पता)।</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
              <span><strong className="font-black text-slate-900">शैक्षणिक विवरण:</strong> आपकी चयनित Class (कक्षा) और Course/Enrollment से संबंधित जानकारी।</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
              <span><strong className="font-black text-slate-900">प्रमाणीकरण डेटा:</strong> आपके Login / Authentication से जुड़ी आवश्यक तकनीकी जानकारी।</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
              <span><strong className="font-black text-slate-900">अध्ययन रिकॉर्ड:</strong> आपके द्वारा दिए गए ऑनलाइन टेस्ट के परिणाम और संबंधित डेटा।</span>
            </li>
          </ul>
          <p className="text-base sm:text-lg font-bold text-slate-600 mt-4 leading-relaxed">
            हम कभी भी ऐसी जानकारी एकत्र करने का दावा या प्रयास नहीं करते हैं जिसकी इस वेबसाइट पर कोई शैक्षणिक आवश्यकता नहीं है।
          </p>
        </section>

        {/* 3. जानकारी का उपयोग */}
        <section id="sec-3" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">3</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">3. जानकारी का उपयोग (How We Use Information)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            हमारे द्वारा एकत्र की गई जानकारी का उपयोग पूरी तरह से आपके शैक्षणिक अनुभव को बेहतर बनाने के लिए किया जाता है:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              { title: 'Account Management', desc: 'आपके खाते को सुरक्षित रूप से प्रबंधित करने हेतु।' },
              { title: 'Login & Authentication', desc: 'वेबसाइट पर आपके सुरक्षित प्रवेश के लिए।' },
              { title: 'Study Material', desc: 'आपकी कक्षा के अनुरूप सही नोट्स और PDF उपलब्ध कराने हेतु।' },
              { title: 'Providing Courses', desc: 'आपको नामांकित कोर्सेस तक सही पहुंच देने हेतु।' },
              { title: 'Test & Results', desc: 'आपके ऑनलाइन अभ्यास स्कोर को ट्रैक करने हेतु।' },
              { title: 'Security', desc: 'किसी भी अनधिकृत उपयोग या स्पैम को रोकने हेतु।' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <h3 className="font-black text-slate-900 text-base">{item.title}</h3>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Google Sign-In */}
        <section id="sec-4" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">4</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">4. Google Sign-In</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            यदि वेबसाइट पर <strong className="font-black text-slate-900">Google Sign-In</strong> की सुविधा सक्षम है, 
            तो उपयोगकर्ता अपने Google खाते के माध्यम से तेज़ी से Login कर सकते हैं। 
            इस प्रक्रिया में आपका प्रमाणीकरण (Authentication) Google और Firebase सेवाओं के माध्यम से सुरक्षित रूप से संभाला जाता है। 
            हम केवल आपका नाम और Email प्राप्त करते हैं, हमें आपके Google खाते के पासवर्ड तक कोई पहुँच नहीं होती।
          </p>
        </section>

        {/* 5. Firebase Services */}
        <section id="sec-5" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">5</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">5. Firebase Services</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            RK STUDY CENTRE अपनी वेबसाइट के तकनीकी संचालन के लिए <strong className="font-black text-slate-900">Firebase</strong> (जो कि Google की एक सेवा है) का उपयोग करता है। 
            जब वेबसाइट की आवश्यकता होती है, तो Firebase सेवाओं का उपयोग प्रमाणीकरण (Authentication), डेटाबेस संग्रहण (Database), PDF स्टोरेज (Storage) और सुरक्षा (Security) प्रबंधन के लिए किया जाता है।
          </p>
        </section>

        {/* 6. Study Material और Course Access */}
        <section id="sec-6" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">6</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">6. Study Material और Course Access</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            हम आपकी कक्षा (Class) और कोर्स (Course) संबंधी जानकारी का उपयोग यह सुनिश्चित करने के लिए करते हैं कि 
            जब आप अपने Account में Login करें, तो आपको केवल आपकी कक्षा के लिए प्रासंगिक और उपयुक्त शैक्षणिक सामग्री ही दिखाई दे।
          </p>
        </section>

        {/* 7. Data Security */}
        <section id="sec-7" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">7</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">7. Data Security (डेटा सुरक्षा)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            हम उपयोगकर्ताओं की जानकारी को अनधिकृत पहुंच या डेटा रिसाव से बचाने के लिए उचित तकनीकी (Technical) और 
            संगठनात्मक (Organizational) सुरक्षा उपायों का उपयोग करते हैं।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            यद्यपि हम आपकी व्यक्तिगत जानकारी की रक्षा करने का पूरा प्रयास करते हैं, लेकिन कृपया ध्यान दें कि 
            इंटरनेट या किसी भी इलेक्ट्रॉनिक स्टोरेज सिस्टम पर डेटा ट्रांसमिशन की 100% सुरक्षा की गारंटी कोई भी नहीं दे सकता है।
          </p>
        </section>

        {/* 8. Data Sharing */}
        <section id="sec-8" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">8</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">8. Data Sharing (डेटा साझाकरण)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            हम आपकी व्यक्तिगत जानकारी (जैसे Name, Email) को <strong className="font-black text-rose-700">कभी भी किसी तीसरे पक्ष को विज्ञापन या व्यावसायिक लाभ के लिए नहीं बेचते हैं</strong>।
          </p>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            तकनीकी सेवाओं के संचालन के लिए (जहाँ आवश्यक हो), हमारी सेवा प्रदाता कंपनियाँ (जैसे Firebase/Google) केवल बुनियादी अवसंरचना 
            और सुरक्षा कार्यक्षमता प्रदान करने हेतु इस डेटा को प्रोसेस कर सकती हैं।
          </p>
        </section>

        {/* 9. Cookies / Technical Data */}
        <section id="sec-9" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">9</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">9. Cookies / Technical Data</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            वेबसाइट के सुचारू संचालन के लिए हम केवल आवश्यक कुकीज़ (Cookies) या तकनीकी जानकारी (जैसे सुरक्षित Login सेशन बनाए रखना) का ही उपयोग करते हैं। 
            हम अनावश्यक रूप से आपकी गतिविधियों को ट्रैक करने के लिए किसी छिपे हुए थर्ड-पार्टी ट्रैकिंग सिस्टम का उपयोग नहीं करते हैं।
          </p>
        </section>

        {/* 10. Data Retention */}
        <section id="sec-10" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">10</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">10. Data Retention (डेटा प्रतिधारण)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            हम आपकी व्यक्तिगत जानकारी को केवल तब तक अपने पास सुरक्षित रखते हैं जब तक कि आपके Account को सक्रिय रखने, 
            हमारी सेवाएँ प्रदान करने, तकनीकी सुरक्षा सुनिश्चित करने, या लागू कानूनी आवश्यकताओं को पूरा करने के लिए यह आवश्यक हो। 
            यदि आप अपना खाता हटाते हैं, तो आपकी जानकारी को हमारे सक्रिय सिस्टम से हटा दिया जाएगा।
          </p>
        </section>

        {/* 11. User Privacy Rights */}
        <section id="sec-11" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">11</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">11. User Privacy Rights (उपयोगकर्ता के अधिकार)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            उपयोगकर्ताओं को यह अधिकार है कि वे वेबसाइट पर उपलब्ध अपनी व्यक्तिगत जानकारी के संबंध में चिंता व्यक्त करें या स्पष्टीकरण मांगें। 
            यदि आपको अपनी जानकारी, खाते की स्थिति या गोपनीयता नीति से जुड़ा कोई भी प्रश्न पूछना हो, तो आप हमारे आधिकारिक संपर्क माध्यम से हमसे जुड़ सकते हैं।
          </p>
        </section>

        {/* 12. Children's / Student Privacy */}
        <section id="sec-12" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">12</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">12. Children's / Student Privacy</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            चूंकि यह मंच विशेष रूप से स्कूली विद्यार्थियों (कक्षा 9 से 12 तक) के शैक्षणिक उपयोग हेतु डिज़ाइन किया गया है, 
            हम छात्रों की सुरक्षा और गोपनीयता को सर्वोपरि मानते हैं। 
            हम छात्रों से केवल वही बुनियादी जानकारी मांगते हैं जो उनकी पढ़ाई और टेस्ट के लिए अनिवार्य हो। 
            हम माता-पिता और अभिभावकों को भी प्रोत्साहित करते हैं कि वे बच्चों की ऑनलाइन गतिविधियों का मार्गदर्शन करें।
          </p>
        </section>

        {/* 13. Policy Updates */}
        <section id="sec-13" className="bg-white rounded-3xl p-7 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">13</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">13. Policy Updates (नीति में बदलाव)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            जब भी वेबसाइट की सुविधाओं या तकनीकी आवश्यकताओं में कोई बदलाव होगा, तो हम इस गोपनीयता नीति को अद्यतन (Update) कर सकते हैं। 
            सभी महत्वपूर्ण बदलावों को इसी पृष्ठ पर प्रकाशित किया जाएगा। हम आपको समय-समय पर इस पृष्ठ की समीक्षा करने की सलाह देते हैं।
          </p>
        </section>

        {/* 14. Contact */}
        <section id="sec-14" className="bg-blue-50 rounded-3xl p-8 sm:p-10 border-2 border-blue-200 space-y-5 scroll-mt-6">
          <div className="flex items-center gap-3 border-b-2 border-blue-200 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-lg shrink-0">14</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">14. संपर्क (Contact)</h2>
          </div>
          <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
            इस गोपनीयता नीति (Privacy Policy) या आपके व्यक्तिगत डेटा के संबंध में यदि आपका कोई भी प्रश्न, संदेह या अनुरोध हो, 
            तो आप बेझिझक हमारी आधिकारिक सहायता टीम को ईमेल कर सकते हैं:
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-blue-200">
            <div className="space-y-1">
              <span className="text-xs font-black text-blue-700 uppercase tracking-wider">
                Privacy Inquiries
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
            डेटा सुरक्षा हमारी प्राथमिकता
          </h3>
          <p className="text-slate-300 text-sm sm:text-base font-medium">
            RK STUDY CENTRE में हम आपके विश्वास को महत्व देते हैं और आपकी जानकारी सुरक्षित रखने के लिए प्रतिबद्ध हैं।
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
        </div>
      </footer>
    </div>
  );
}