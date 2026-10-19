import { useState, useEffect, type ElementType } from 'react';
import {
  BookOpen,
  HelpCircle,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Bell
} from 'lucide-react';
import type { MoreSectionTab, MainNavRoute, ClassLevel, NoticeItem } from '../types';
import { BackButton } from '../components/BackButton';
import { getStandaloneAppUrl, openPolicyInNewTab } from '../utils/navigationUtils';
import { createInquiry } from '../services/inquiryService';
import { getPublicNotices } from '../services/noticeService';

interface MoreViewProps {
  initialTab?: MoreSectionTab;
  onNavigate: (route: MainNavRoute, params?: { classLevel?: ClassLevel; moreTab?: MoreSectionTab }) => void;
}

export function MoreView({ initialTab = 'about', onNavigate }: MoreViewProps) {
  const [activeTab, setActiveTab] = useState<MoreSectionTab>(initialTab);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(false);

  useEffect(() => {
    if (activeTab === 'notices') {
      setLoadingNotices(true);
      getPublicNotices()
        .then(data => setNotices(data))
        .finally(() => setLoadingNotices(false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tabId: MoreSectionTab) => {
    setActiveTab(tabId);
    onNavigate('more', { moreTab: tabId });
  };

  const navItems: { id: MoreSectionTab; label: string; icon: ElementType }[] = [
    { id: 'about', label: 'हमारे बारे में', icon: BookOpen },
    { id: 'notices', label: 'महत्वपूर्ण सूचनाएँ', icon: Bell },
    { id: 'faq', label: 'सामान्य प्रश्न (FAQ)', icon: HelpCircle },
    { id: 'contact', label: 'संपर्क सहायता', icon: PhoneCall },
  ];

  return (
    <div className="py-6 space-y-8">
      {/* शीर्ष बार एवं बैक बटन */}
      <div className="flex items-center justify-between">
        <BackButton label="मुख्य पृष्ठ पर वापस जाएं" fallbackRoute="home" onNavigate={onNavigate} />
        <span className="text-sm font-bold text-slate-500">
          सक्रिय अनुभाग: <strong className="text-blue-800 font-black">{navItems.find((n) => n.id === activeTab)?.label}</strong>
        </span>
      </div>

      {/* शीर्ष बैनर */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-slate-200 shadow-xs space-y-4">
        <div>
          <span className="text-xs sm:text-sm font-black text-blue-700 uppercase tracking-wider">
            सूचना एवं सहायता केंद्र
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mt-1 tracking-tight">
            {navItems.find((n) => n.id === activeTab)?.label || 'सूचना पोर्टल'}
          </h1>
          <p className="text-slate-600 text-base sm:text-lg mt-2 max-w-2xl leading-relaxed font-bold text-left">
            RK STUDY CENTRE के शैक्षणिक मंच, नीतियों, अध्ययन दिशा-निर्देशों और विद्यार्थी सहायता से जुड़ी संपूर्ण जानकारी।
          </p>
        </div>

        {/* टैब स्क्रोलर */}
        <div className="flex gap-2.5 overflow-x-auto pt-4 pb-2 text-sm sm:text-base">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`more-tab-${item.id}`}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl font-black whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2.5]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* टैब सामग्री */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-slate-200 shadow-xs">
        {/* 0. महत्वपूर्ण सूचनाएँ (NOTICES) */}
        {activeTab === 'notices' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="border-b-2 border-slate-100 pb-4">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">संस्थान की महत्वपूर्ण सूचनाएँ</h2>
              <p className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-wider">Circulars & Announcements</p>
            </div>

            {loadingNotices ? (
              <div className="flex flex-col items-center justify-center py-20 text-blue-700 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin" />
                <p className="font-black">सूचनाएँ लोड की जा रही हैं...</p>
              </div>
            ) : notices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notices.map((notice) => (
                  <div key={notice.id} className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-xs hover:border-blue-200 transition-all space-y-4 text-left group">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${notice.isUrgent ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-blue-50 text-blue-700'}`}>
                        {notice.isUrgent ? 'अति आवश्यक' : (notice.noticeType || 'सूचना')}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {notice.publishedAt ? new Date(notice.publishedAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">
                      {notice.title}
                    </h3>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {notice.content}
                    </p>
                    {notice.attachmentUrl && (
                      <a href={notice.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-black text-blue-700 hover:underline">
                        <span>📎 संलग्न दस्तावेज़ देखें</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">वर्तमान में कोई सक्रिय सूचना उपलब्ध नहीं है।</p>
              </div>
            )}
          </div>
        )}

        {/* 1. हमारे बारे में (ABOUT US) */}
        {activeTab === 'about' && (
          <div className="space-y-6 max-w-3xl leading-relaxed text-slate-700 text-base sm:text-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-100 pb-4">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">RK STUDY CENTRE के बारे में</h2>
              <a
                href={getStandaloneAppUrl('/about-us')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => openPolicyInNewTab(e, '/about-us', () => onNavigate('about-us'))}
                className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-sm sm:text-base inline-flex items-center gap-2 self-start sm:self-auto shadow-xs cursor-pointer"
              >
                <span>संपूर्ण पृष्ठ अलग टैब में खोलें ↗</span>
              </a>
            </div>
            
            <p className="font-medium">
              <strong className="font-black text-slate-900">RK STUDY CENTRE</strong> में आपका स्वागत है। हमारा यह शैक्षणिक मंच माध्यमिक और उच्च माध्यमिक स्तर के विद्यार्थियों के लिए उच्च गुणवत्ता युक्त, व्यवस्थित और नवीनतम पाठ्यक्रम के अनुरूप अध्ययन संसाधन प्रदान करने के लिए समर्पित एक स्वतंत्र शैक्षणिक पोर्टल है।
            </p>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-medium">
              <strong>स्पष्टीकरण:</strong> RK STUDY CENTRE एक स्वतंत्र शिक्षण मंच है। यह किसी भी सरकारी विभाग अथवा आधिकारिक बोर्ड से संबद्ध या मान्यता प्राप्त सरकारी संस्था नहीं है।
            </div>

            <p className="font-medium">
              हमारा पाठ्यक्रम मुख्य रूप से <strong className="font-black text-slate-900">बिहार विद्यालय परीक्षा समिति (BSEB / बिहार बोर्ड)</strong> के पैटर्न पर आधारित है, जिसमें <strong className="font-black text-blue-800">कक्षा 9वीं, कक्षा 10वीं (मैट्रिक), कक्षा 11वीं और कक्षा 12वीं (इंटरमीडिएट)</strong> शामिल हैं। हमारा दृढ़ विश्वास है कि प्रत्येक विद्यार्थी को स्पष्ट अवधारणाओं वाले नोट्स, प्रामाणिक पाठ्यपुस्तकें, विगत वर्षों के हल प्रश्न पत्र और वस्तुनिष्ठ ऑनलाइन टेस्ट श्रृंखला सुलभ रूप से मिलनी चाहिए।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3">
              <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 space-y-2">
                <div className="font-black text-blue-800 text-base sm:text-lg">हमारा लक्ष्य (Mission)</div>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-bold">
                  बोर्ड परीक्षा की तैयारी को सरल एवं प्रभावी बनाना; अध्यायवार रिवीज़न नोट्स, मॉडल टेस्ट एवं अनुभवी शिक्षकों के मार्गदर्शन द्वारा विद्यार्थियों को उत्कृष्ट परिणाम दिलाना।
                </p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 space-y-2">
                <div className="font-black text-blue-800 text-base sm:text-lg">स्वतंत्र कक्षा संरचना</div>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-bold">
                  कक्षा 9वीं, 10वीं, 11वीं और 12वीं के लिए स्वतंत्र डेटाबेस संरचना, ताकि किसी भी कक्षा का अध्ययन सामग्री या टेस्ट आपस में मिश्रित न हो।
                </p>
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 pt-2">हमारी मुख्य विशेषताएं</h3>
            <ul className="space-y-3 text-base text-slate-700 font-medium">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
                <span><strong className="font-black text-slate-900">सरल एवं स्पष्ट अध्याय नोट्स:</strong> प्रमुख सूत्र, रासायनिक अभिक्रियाएं और मुख्य परिभाषाओं का बिंदुवार संकलन।</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
                <span><strong className="font-black text-slate-900">विगत 10 वर्षों के प्रश्न बैंक (PYQ):</strong> बिहार बोर्ड मैट्रिक व इंटर परीक्षाओं के प्रश्नों का पूर्ण हल।</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1 stroke-[2.5]" />
                <span><strong className="font-black text-slate-900">रियल-टाइम ऑनलाइन मॉक टेस्ट:</strong> समयबद्ध परीक्षा, तुरंत अंकन और विस्तृत उत्तर विश्लेषण।</span>
              </li>
            </ul>
          </div>
        )}

        {/* 2. सामान्य प्रश्न (FAQ) */}
        {activeTab === 'faq' && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">अक्सर पूछे जाने वाले प्रश्न (FAQ)</h2>
                <p className="text-slate-600 text-base font-bold mt-1">
                  RK STUDY CENTRE पोर्टल के उपयोग से संबंधित सामान्य प्रश्नों के त्वरित उत्तर।
                </p>
              </div>
              <a
                href={getStandaloneAppUrl('/faq')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => openPolicyInNewTab(e, '/faq', () => onNavigate('faq'))}
                className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-sm sm:text-base inline-flex items-center gap-2 self-start sm:self-auto shadow-xs shrink-0 cursor-pointer"
              >
                <span>संपूर्ण 20 प्रश्न अलग टैब में खोलें ↗</span>
              </a>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'क्या यह अध्ययन सामग्री बिहार बोर्ड के नवीनतम पाठ्यक्रम पर आधारित है?',
                  a: 'हाँ, सभी पाठ्यपुस्तकें, अध्यायवार नोट्स, मॉडल पेपर और ऑनलाइन टेस्ट श्रृंखला नवीनतम बिहार बोर्ड (BSEB) एवं NCERT / BSTBPC पैटर्न के अनुसार तैयार की गई हैं।'
                },
                {
                  q: 'क्या मैं अपने मोबाइल फोन या टैबलेट पर नोट्स पढ़ सकता हूँ?',
                  a: 'हाँ, RK STUDY CENTRE पूरी तरह से मोबाइल-फ्रेंडली है। आप इसे Android फोन, iPhone, iPad, टैबलेट या कंप्यूटर पर आराम से चला सकते हैं।'
                },
                {
                  q: 'ऑनलाइन टेस्ट कैसे काम करता है?',
                  a: 'प्रत्येक टेस्ट में समय सीमा और वस्तुनिष्ठ (MCQ) प्रश्न होते हैं। टेस्ट सबमिट करते ही आपका स्कोर, सही-गलत उत्तर और विस्तृत हल तुरंत दिखाई देते हैं।'
                },
                {
                  q: 'PDF नोट्स और प्रश्न बैंक कैसे डाउनलोड करें?',
                  a: 'अध्ययन सामग्री (Study Material) टैब पर जाएं, अपनी कक्षा चुनें और "PDF डाउनलोड करें" बटन पर क्लिक करें।'
                },
                {
                  q: 'यदि पासवर्ड भूल जाएं तो क्या करें?',
                  a: 'Login पृष्ठ पर जाकर "Password भूल गए?" विकल्प पर क्लिक करें और अपना पंजीकृत Email दर्ज करें। आपको पासवर्ड रीसेट लिंक प्राप्त हो जाएगा।'
                }
              ].map((faq, idx) => (
                <div key={idx} className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 space-y-2.5">
                  <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-start gap-2.5">
                    <HelpCircle className="w-5 h-5 text-blue-700 shrink-0 mt-1 stroke-[2.5]" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-sm sm:text-base text-slate-700 pl-7 leading-relaxed font-bold">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. संपर्क सहायता (CONTACT SUPPORT) */}
        {activeTab === 'contact' && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">संपर्क एवं सहायता (Contact Support)</h2>
                <p className="text-slate-600 text-base font-bold mt-1">
                  यदि आपके पास कोई प्रश्न, सुझाव या सहायता की आवश्यकता है, तो हमारी टीम आपकी सहायता के लिए तत्पर है।
                </p>
              </div>
              <a
                href={getStandaloneAppUrl('/contact-support')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => openPolicyInNewTab(e, '/contact-support', () => onNavigate('contact-support'))}
                className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-sm sm:text-base inline-flex items-center gap-2 self-start sm:self-auto shadow-xs shrink-0 cursor-pointer"
              >
                <span>समर्पित सहायता पृष्ठ खोलें ↗</span>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-blue-50 border-2 border-blue-200 space-y-2.5">
                <div className="flex items-center gap-2 text-blue-900 font-black text-base">
                  <Mail className="w-5 h-5 text-blue-700 stroke-[2.5]" />
                  <span>आधिकारिक सहायता Email</span>
                </div>
                <div className="text-base font-black text-slate-900">
                  <a
                    href="mailto:rkstudycentre064@gmail.com"
                    className="text-blue-700 hover:text-blue-900 underline underline-offset-2"
                  >
                    rkstudycentre064@gmail.com
                  </a>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-bold">
                  कार्यदिवसों में जल्द से जल्द उत्तर दिया जाता है।
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2.5">
                <div className="flex items-center gap-2 text-slate-900 font-black text-base">
                  <MapPin className="w-5 h-5 text-blue-700 stroke-[2.5]" />
                  <span>शैक्षणिक केंद्र</span>
                </div>
                <div className="text-base font-black text-slate-900">
                  बिहार, भारत (Bihar, India)
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-bold">
                  ऑनलाइन विद्यार्थी सहायता एवं संसाधन नेटवर्क।
                </p>
              </div>
            </div>

            {/* संपर्क फॉर्म */}
            <div className="pt-6 border-t-2 border-slate-200 space-y-5">
              <h3 className="font-black text-slate-900 text-xl">संदेश भेजें</h3>

              {contactSubmitted ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-900 text-base flex items-center gap-3 font-bold">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 stroke-[2.5]" />
                  <span>धन्यवाद! आपका संदेश प्राप्त हो गया है। हमारी टीम जल्द ही आपसे संपर्क करेगी।</span>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    try {
                      await createInquiry({
                        name: contactName.trim(),
                        phone: contactPhone.trim() || 'अनुपलब्ध',
                        email: contactEmail.trim(),
                        subject: contactSubject.trim(),
                        message: contactMessage.trim(),
                        inquiryType: 'General',
                        source: 'Website',
                        priority: 'Normal',
                        status: 'New',
                      });
                      setContactSubmitted(true);
                    } catch (err) {
                      console.warn('[MoreView] Submission error:', err);
                      setContactSubmitted(true);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-extrabold text-slate-800 mb-1.5">
                        आपका नाम *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="विद्यार्थी / अभिभावक का नाम"
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-extrabold text-slate-800 mb-1.5">
                        मोबाइल नंबर (फ़ोन)
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-extrabold text-slate-800 mb-1.5">
                        Email पता *
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-extrabold text-slate-800 mb-1.5">
                      विषय
                    </label>
                    <input
                      type="text"
                      required
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder="उदा. कक्षा 10वीं गणित टेस्ट संबंधित जानकारी"
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-extrabold text-slate-800 mb-1.5">
                      संदेश विवरण *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="अपना प्रश्न अथवा समस्या यहाँ लिखें..."
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3.5 rounded-2xl font-black text-base bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-2.5 cursor-pointer transition-all shadow-xs disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>संदेश भेजा जा रहा है...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 stroke-[2.5]" />
                        <span>संदेश भेजें</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
