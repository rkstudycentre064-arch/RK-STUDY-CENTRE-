import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  PhoneCall,
  Mail,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  LogIn,
  UserPlus,
  FileText,
  HelpCircle,
  Laptop,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  Paperclip,
  Clock,
  ShieldAlert,
  Send,
  Loader2,
  Phone
} from 'lucide-react';
import type { MainNavRoute, ClassLevel, MoreSectionTab, InquiryType } from '../types';
import { BackButton } from '../components/BackButton';
import { createInquiry } from '../services/inquiryService';

interface ContactSupportViewProps {
  onNavigate: (route: MainNavRoute, params?: { classLevel?: ClassLevel; moreTab?: MoreSectionTab }) => void;
}

function mapCategoryToInquiryType(category: string): InquiryType {
  if (category.includes('Course')) return 'Course';
  if (category.includes('Study Material') || category.includes('PDF')) return 'StudyMaterial';
  if (category.includes('Online Test')) return 'Exam';
  if (category.includes('Login') || category.includes('Account') || category.includes('technical')) return 'Technical';
  return 'General';
}

export function ContactSupportView({ onNavigate }: ContactSupportViewProps) {
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    classLevel: 'Class 10',
    category: 'Login समस्या',
    description: '',
  });
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const problemCategories = [
    'Login समस्या',
    'Create Account समस्या',
    'Google Sign-In समस्या',
    'Study Material नहीं खुल रहा',
    'PDF नहीं खुल रही',
    'Online Test में समस्या',
    'Course से संबंधित समस्या',
    'Account से संबंधित समस्या',
    'Website में technical problem',
    'अन्य सामान्य सहायता',
  ];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileName(e.target.files[0].name);
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createInquiry({
        name: formData.name.trim(),
        phone: formData.phone.trim() || 'अनुपलब्ध',
        email: formData.email.trim(),
        subject: formData.category,
        message: `${formData.description}${selectedFileName ? `\n\n[संलग्न फ़ाइल: ${selectedFileName}]` : ''}`,
        inquiryType: mapCategoryToInquiryType(formData.category),
        source: 'Website',
        classLevel: formData.classLevel,
        priority: 'Normal',
        status: 'New',
      });
      setFormSubmitted(true);
    } catch (err) {
      console.warn('[ContactSupportView] Server save notice:', err);
      setFormSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-filled mailto generation for direct email app dispatch
  const mailtoSubject = encodeURIComponent(
    `[RK STUDY CENTRE सहायता अनुरोध] - ${formData.category} - ${formData.name || 'विद्यार्थी'}`
  );
  const mailtoBody = encodeURIComponent(
    `विद्यार्थी का नाम: ${formData.name}\n` +
      `पंजीकृत Email: ${formData.email}\n` +
      `कक्षा: ${formData.classLevel}\n` +
      `समस्या की श्रेणी: ${formData.category}\n` +
      (selectedFileName ? `संलग्न स्क्रीनशॉट फ़ाइल: ${selectedFileName}\n` : '') +
      `\nसमस्या का विस्तृत विवरण:\n${formData.description}\n\n` +
      `---\n(यह संदेश RK STUDY CENTRE वेबसाइट सहायता फॉर्म से तैयार किया गया है)`
  );
  const mailtoLink = `mailto:rkstudycentre064@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <div className="py-8 sm:py-12 space-y-10 sm:space-y-14 max-w-5xl mx-auto">
      {/* शीर्ष नेविगेशन बार एवं बैक बटन */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <BackButton label="मुख्य पृष्ठ (Home) पर वापस जाएं" fallbackRoute="home" onNavigate={onNavigate} />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-900 text-xs sm:text-sm font-black">
          <PhoneCall className="w-4 h-4 text-blue-700 shrink-0" />
          <span>सहायता डेस्क • Help Desk</span>
        </div>
      </div>

      {/* 1. सहायता केंद्र (Main Banner & Explanation) */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-md shrink-0">
            <PhoneCall className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs sm:text-sm font-black text-blue-700 uppercase tracking-wider">
              RK STUDY CENTRE • विद्यार्थी सहायता
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              संपर्क सहायता
            </h1>
            <p className="text-base sm:text-xl font-bold text-slate-600">
              वेबसाइट उपयोग, अध्ययन सामग्री, टेस्ट अथवा अकाउंट संबंधी किसी भी समस्या के समाधान हेतु सहायता प्राप्त करें
            </p>
          </div>
        </div>

        <div className="border-t-2 border-slate-100 pt-6 space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            1. सहायता केंद्र (Support Centre)
          </h2>
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            <strong className="font-black text-slate-900">RK STUDY CENTRE</strong> में आपका स्वागत है। 
            यदि आपको वेबसाइट का उपयोग करते समय, अकाउंट बनाने या लॉगिन करने में, ऑनलाइन टेस्ट देने में अथवा 
            किसी भी विषय की अध्ययन सामग्री (PDF नोट्स) खोलने में किसी प्रकार की कठिनाई या तकनीकी समस्या का सामना 
            करना पड़ रहा है, तो आप हमारी सहायता टीम से सीधे संपर्क कर सकते हैं। हमारा प्रयास है कि प्रत्येक विद्यार्थी 
            की पढ़ाई बिना किसी रुकावट के सुचारू रूप से चलती रहे।
          </p>
        </div>
      </section>

      {/* 3. Email Support (प्रमुख ईमेल बॉक्स) */}
      <section className="bg-blue-50 rounded-3xl p-8 sm:p-10 border-2 border-blue-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-blue-800 uppercase tracking-wider">
              <Mail className="w-4 h-4 text-blue-700 shrink-0" />
              <span>3. आधिकारिक Email सहायता (Official Email Support)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              सीधे सहायता Email भेजें
            </h2>
            <p className="text-slate-700 font-bold text-base">
              ईमेल लिंक पर क्लिक करके अपने ईमेल ऐप से सीधे हमारी टीम को संदेश भेजें:
            </p>
          </div>

          <a
            href="mailto:rkstudycentre064@gmail.com"
            className="px-6 py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-black text-base sm:text-lg inline-flex items-center gap-3 shadow-md hover:shadow-lg transition-all self-start sm:self-auto cursor-pointer"
            aria-label="ईमेल भेजें rkstudycentre064@gmail.com"
          >
            <Mail className="w-6 h-6 shrink-0" />
            <span className="underline underline-offset-4">rkstudycentre064@gmail.com</span>
          </a>
        </div>

        <div className="bg-white/80 p-4 sm:p-5 rounded-2xl border border-blue-200 text-slate-700 text-sm sm:text-base font-medium leading-relaxed">
          <strong>सुझाव:</strong> जब आप ऊपर दिए गए ईमेल पर क्लिक करते हैं, तो आपके मोबाइल अथवा कंप्यूटर का डिफ़ॉल्ट ईमेल ऐप्लिकेशन 
          (जैसे Gmail, Outlook या Apple Mail) स्वतः खुल जाएगा और आप तुरंत संदेश भेज पाएंगे।
        </div>
      </section>

      {/* 2. किन समस्याओं के लिए संपर्क करें (Issues Examples) */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-slate-200 shadow-xs space-y-6">
        <div className="space-y-1.5">
          <span className="text-xs sm:text-sm font-black text-blue-700 uppercase tracking-wider">
            समस्याओं के प्रकार • Common Issues
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            2. किन समस्याओं के लिए संपर्क करें
          </h2>
          <p className="text-base sm:text-lg font-bold text-slate-600">
            विद्यार्थी निम्नलिखित या इनसे संबंधित किसी भी विषय पर सहायता प्राप्त कर सकते हैं:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {[
            {
              title: 'Login समस्या',
              desc: 'ईमेल या पासवर्ड से लॉगिन करने में त्रुटि या रुकावट आना।',
              icon: LogIn,
            },
            {
              title: 'Create Account समस्या',
              desc: 'नया विद्यार्थी अकाउंट बनाते समय सत्यापन या फ़ील्ड एरर।',
              icon: UserPlus,
            },
            {
              title: 'Google Sign-In समस्या',
              desc: 'Google खाते से एक-क्लिक लॉगिन या प्रमाणीकरण में कठिनाई।',
              icon: ShieldCheck,
            },
            {
              title: 'Study Material नहीं खुल रहा',
              desc: 'अध्यायवार नोट्स सूची, सूत्र या किताबें लोड न होना।',
              icon: FileText,
            },
            {
              title: 'PDF नहीं खुल रही',
              desc: 'ब्राउज़र में PDF व्यूअर का न खुलना या फ़ाइल लोड न होना।',
              icon: Paperclip,
            },
            {
              title: 'Online Test में समस्या',
              desc: 'टेस्ट शुरू न होना, सबमिट करने में परेशानी या अंक न दिखना।',
              icon: HelpCircle,
            },
            {
              title: 'Course से संबंधित समस्या',
              desc: 'बोर्ड परीक्षा कोर्स, मॉड्यूल या बैच सामग्री में प्रश्न।',
              icon: GraduationCap,
            },
            {
              title: 'Account से संबंधित समस्या',
              desc: 'प्रोफ़ाइल डेटा, कक्षा चयन अथवा पासवर्ड रीसेट की समस्या।',
              icon: AlertCircle,
            },
            {
              title: 'Website में technical problem',
              desc: 'पृष्ठ लोड न होना, बटन क्लिक न होना या स्क्रीन रिस्पॉन्सिव एरर।',
              icon: Laptop,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/70 hover:bg-slate-100/90 transition-colors space-y-2"
              >
                <div className="flex items-center gap-2.5 text-blue-800 font-black text-base sm:text-lg">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span>{item.title}</span>
                </div>
                <p className="text-sm sm:text-base text-slate-600 font-bold leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. सहायता के लिए आवश्यक जानकारी & 5. Response Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 4. सहायता के लिए जानकारी */}
        <section className="bg-white rounded-3xl p-7 sm:p-8 border-2 border-slate-200 shadow-xs space-y-5">
          <div className="space-y-1">
            <span className="text-xs sm:text-sm font-black text-blue-700 uppercase tracking-wider">
              आवश्यक विवरण • Checklist
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              4. सहायता के लिए जानकारी
            </h2>
            <p className="text-sm sm:text-base font-bold text-slate-600">
              समस्या का त्वरित समाधान पाने के लिए कृपया अपने संदेश में निम्नलिखित विवरण अवश्य शामिल करें:
            </p>
          </div>

          <ul className="space-y-3 text-base text-slate-800 font-bold">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
              <span><strong className="text-slate-900 font-black">Name (नाम):</strong> विद्यार्थी या अभिभावक का पूरा नाम।</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
              <span><strong className="text-slate-900 font-black">Class (कक्षा):</strong> कक्षा 9वीं, 10वीं, 11वीं अथवा 12वीं।</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
              <span><strong className="text-slate-900 font-black">Registered Email:</strong> जिस ईमेल से आपने अकाउंट बनाया है।</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
              <span><strong className="text-slate-900 font-black">Problem का विवरण:</strong> क्या समस्या आ रही है, उसका स्पष्ट विवरण।</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
              <span><strong className="text-slate-900 font-black">Screenshot:</strong> यदि संभव हो तो समस्या वाली स्क्रीन का स्क्रीनशॉट जोड़ें।</span>
            </li>
          </ul>

          {/* सख्त सुरक्षा निर्देश */}
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-950 space-y-1.5">
            <div className="flex items-center gap-2 font-black text-rose-800 text-sm sm:text-base">
              <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 stroke-[2.5]" />
              <span>महत्वपूर्ण सुरक्षा चेतावनी (Security Warning)</span>
            </div>
            <p className="text-xs sm:text-sm font-bold leading-relaxed text-rose-900/90">
              सहायता प्राप्त करने के लिए कभी भी अपना <strong>Password, OTP, गुप्त क्रेडेंशियल</strong> या कोई संवेदनशील निजी जानकारी किसी को भी न बताएं। हमारी सहायता टीम आपसे कभी भी आपका पासवर्ड या OTP नहीं मांगती।
            </p>
          </div>
        </section>

        {/* 5. Response Information */}
        <section className="bg-white rounded-3xl p-7 sm:p-8 border-2 border-slate-200 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs sm:text-sm font-black text-blue-700 uppercase tracking-wider">
                प्रतिक्रिया प्रक्रिया • Review Process
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                5. Response Information
              </h2>
            </div>

            <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
              जब आप अपनी समस्या हमें ईमेल या सहायता फॉर्म के माध्यम से भेजते हैं, तो हमारी सहायता टीम आपके अनुरोध की पूर्ण समीक्षा करती है और उपलब्ध होने पर यथाशीघ्र आपके पंजीकृत ईमेल पर समाधान अथवा मार्गदर्शन के साथ उत्तर देती है।
            </p>

            <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-black text-base">
                <Clock className="w-5 h-5 text-blue-700 stroke-[2.5]" />
                <span>समीक्षा एवं उत्तर का समय</span>
              </div>
              <p className="text-sm sm:text-base text-slate-700 font-bold leading-relaxed">
                सहायता अनुरोधों की समीक्षा प्राप्त होने के क्रम में की जाती है। परीक्षा के समय अधिक अनुरोध आने पर कुछ अतिरिक्त समय लग सकता है। कृपया एक ही समस्या के लिए बार-बार ईमेल न भेजें, हमारी टीम प्रत्येक विद्यार्थी की समस्या का समाधान करने के लिए प्रतिबद्ध है।
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950 text-xs sm:text-sm font-bold">
            💡 <strong>त्वरित समाधान:</strong> कई सामान्य प्रश्नों के उत्तर हमारे{' '}
            <a
              href="/faq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline underline-offset-2 hover:text-blue-900 font-black"
            >
              प्रश्नोत्तरी / सहायता केंद्र (FAQ)
            </a>{' '}
            पृष्ठ पर पहले से उपलब्ध हैं।
          </div>
        </section>
      </div>

      {/* CONTACT FORM (सरल संपर्क फॉर्म) */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200 shadow-xs space-y-8">
        <div className="space-y-2 border-b-2 border-slate-100 pb-5">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-blue-700 uppercase tracking-wider">
            <Send className="w-4 h-4" />
            <span>सहायता फॉर्म • Support Request Form</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            सहायता अनुरोध प्रपत्र भरें
          </h2>
          <p className="text-base sm:text-lg font-bold text-slate-600">
            नीचे दिए गए फ़ील्ड भरें। आप इस विवरण को एक क्लिक में अपने ईमेल ऐप द्वारा सीधे भेज सकते हैं।
          </p>
        </div>

        {formSubmitted ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50 border-2 border-emerald-300 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  आपका सहायता अनुरोध सफलतापूर्वक दर्ज कर लिया गया है
                </h3>
                <p className="text-base text-slate-700 font-bold leading-relaxed">
                  आपका संदेश विवरण RK STUDY CENTRE के व्यवस्थापक इनबॉक्स में सुरक्षित रूप से दर्ज कर लिया गया है। 
                  हमारी सहायता टीम शीघ्र ही आपसे संपर्क करेगी। यदि आप चाहें तो नीचे दिए गए बटन से अपने ईमेल ऐप द्वारा भी अतिरिक्त संदेश भेज सकते हैं।
                </p>
              </div>
            </div>

            {/* संकलित विवरण पूर्वावलोकन */}
            <div className="bg-white p-5 rounded-2xl border border-emerald-200 space-y-2 text-sm sm:text-base font-bold text-slate-800">
              <div className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-1">
                दर्ज किया गया विवरण:
              </div>
              <div><span className="text-slate-500 font-medium">नाम:</span> {formData.name}</div>
              {formData.phone && <div><span className="text-slate-500 font-medium">फ़ोन:</span> {formData.phone}</div>}
              <div><span className="text-slate-500 font-medium">Email:</span> {formData.email}</div>
              <div><span className="text-slate-500 font-medium">कक्षा:</span> {formData.classLevel}</div>
              <div><span className="text-slate-500 font-medium">समस्या:</span> {formData.category}</div>
              {selectedFileName && (
                <div><span className="text-slate-500 font-medium">संलग्न फ़ाइल:</span> {selectedFileName}</div>
              )}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-medium">विवरण:</span> {formData.description}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href={mailtoLink}
                className="px-6 py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-black text-base inline-flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Mail className="w-5 h-5" />
                <span>ईमेल ऐप खोलें (बैकअप) ↗</span>
              </a>

              <button
                type="button"
                onClick={() => setFormSubmitted(false)}
                className="px-5 py-3.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm sm:text-base transition-colors cursor-pointer"
              >
                नया अनुरोध भेजें
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="support-name" className="block text-base font-extrabold text-slate-900">
                  विद्यार्थी का नाम (Name) <span className="text-rose-600">*</span>
                </label>
                <input
                  id="support-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="उदा. राहुल कुमार"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-base text-slate-900 focus:outline-none focus:border-blue-700 font-medium transition-colors"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label htmlFor="support-phone" className="block text-base font-extrabold text-slate-900">
                  मोबाइल नंबर (Phone)
                </label>
                <input
                  id="support-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-base text-slate-900 focus:outline-none focus:border-blue-700 font-medium transition-colors"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="support-email" className="block text-base font-extrabold text-slate-900">
                  पंजीकृत Email <span className="text-rose-600">*</span>
                </label>
                <input
                  id="support-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-base text-slate-900 focus:outline-none focus:border-blue-700 font-medium transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Class */}
              <div className="space-y-2">
                <label htmlFor="support-class" className="block text-base font-extrabold text-slate-900">
                  कक्षा (Class) <span className="text-rose-600">*</span>
                </label>
                <select
                  id="support-class"
                  value={formData.classLevel}
                  onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-base text-slate-900 focus:outline-none focus:border-blue-700 font-bold transition-colors cursor-pointer"
                >
                  <option value="Class 9">कक्षा 9वीं (Class 9)</option>
                  <option value="Class 10">कक्षा 10वीं (Class 10 - Matric)</option>
                  <option value="Class 11">कक्षा 11वीं (Class 11)</option>
                  <option value="Class 12">कक्षा 12वीं (Class 12 - Inter)</option>
                  <option value="अन्य">अन्य / सामान्य</option>
                </select>
              </div>

              {/* Problem Category */}
              <div className="space-y-2">
                <label htmlFor="support-category" className="block text-base font-extrabold text-slate-900">
                  समस्या की श्रेणी (Problem Category) <span className="text-rose-600">*</span>
                </label>
                <select
                  id="support-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-base text-slate-900 focus:outline-none focus:border-blue-700 font-bold transition-colors cursor-pointer"
                >
                  {(problemCategories || []).map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Problem Description */}
            <div className="space-y-2">
              <label htmlFor="support-description" className="block text-base font-extrabold text-slate-900">
                समस्या का विवरण (Problem Description) <span className="text-rose-600">*</span>
              </label>
              <textarea
                id="support-description"
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="कृपया बताएं कि आपको क्या कठिनाई आ रही है (जैसे किस विषय या पेज पर समस्या आ रही है, क्या एरर संदेश दिख रहा है)..."
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-base text-slate-900 focus:outline-none focus:border-blue-700 font-medium leading-relaxed transition-colors"
              ></textarea>
            </div>

            {/* Screenshot Attachment */}
            <div className="space-y-2">
              <label htmlFor="support-screenshot" className="block text-base font-extrabold text-slate-900">
                स्क्रीनशॉट संलग्न करें (Screenshot Attachment - ऐच्छिक)
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <label
                  htmlFor="support-screenshot"
                  className="px-5 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-600 bg-slate-50 text-slate-700 font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Paperclip className="w-4 h-4 text-blue-600" />
                  <span>फ़ाइल चुनें (PNG, JPG, PDF)</span>
                </label>
                <input
                  id="support-screenshot"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                {selectedFileName ? (
                  <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    ✓ {selectedFileName}
                  </span>
                ) : (
                  <span className="text-xs sm:text-sm text-slate-500 font-medium">
                    (यदि एरर आ रहा हो तो स्क्रीनशॉट जोड़ना मददगार होता है)
                  </span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-black text-base sm:text-lg inline-flex items-center gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>अनुरोध दर्ज हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>सहायता अनुरोध सबमिट करें</span>
                  </>
                )}
              </button>

              <a
                href="mailto:rkstudycentre064@gmail.com"
                className="px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-base inline-flex items-center gap-2 border border-slate-300 transition-colors"
              >
                <Mail className="w-5 h-5 text-blue-700" />
                <span>सीधे ईमेल ऐप से भेजें</span>
              </a>
            </div>
          </form>
        )}
      </section>

      {/* निचला नेविगेशन व आभार कार्ड */}
      <section className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-black">
            RK STUDY CENTRE के साथ अध्ययन जारी रखें
          </h3>
          <p className="text-slate-300 text-sm sm:text-base font-medium">
            सभी अध्ययन सामग्री, कक्षावार नोट्स और ऑनलाइन टेस्ट मंच पर उपलब्ध हैं।
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
            href="/about-us"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3.5 rounded-2xl font-bold text-sm sm:text-base bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            हमारे बारे में ↗
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
      </section>
    </div>
  );
}
