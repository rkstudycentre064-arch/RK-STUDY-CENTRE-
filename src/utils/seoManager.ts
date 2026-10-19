import {
  CLASSES_METADATA,
  SUBJECTS,
  BOOKS,
  CHAPTERS,
  COURSES,
  STUDY_MATERIALS,
  TESTS,
} from '../lib/constants';
import type { ClassLevel, MainNavRoute } from '../types';

export const DEFAULT_BASE_URL =
  'https://ais-pre-rc6a3dh6aea5krtenpyoim-256353323201.asia-southeast1.run.app';

export interface SeoLandingAliasConfig {
  route: MainNavRoute;
  canonicalPath: string;
  classLevel?: ClassLevel;
  subjectSlug?: string;
  bookSlug?: string;
  chapterSlug?: string;
  title: string;
  h1: string;
  description: string;
  learningResourceType: string;
  educationalLevel: string;
}

/**
 * High-intent search landing routes mapped directly to real application views and curriculum filters.
 * Each alias declares its authoritative hierarchical canonicalPath to prevent duplicate content indexing.
 */
export const SEO_LANDING_ALIASES: Record<string, SeoLandingAliasConfig> = {
  '/class-10-maths-notes': {
    route: 'study-material',
    canonicalPath: '/study-material/class-10/math',
    classLevel: 'class-10',
    subjectSlug: 'math',
    title: 'Class 10 Maths Notes in Hindi & English (BSEB & NCERT) | RK Study Centre',
    h1: 'Class 10 Mathematics (गणित) Chapter-Wise Notes, Formula PDF & VVI Questions',
    description:
      'Download and read Class 10 Maths chapter-wise notes, NCERT solutions, formula sheets, and 500+ VVI objective questions for Bihar Board (BSEB) Matric exams at RK Study Centre.',
    learningResourceType: 'Study Notes & Formula Sheet',
    educationalLevel: 'Class 10 (Matric)',
  },
  '/class-10-science-notes': {
    route: 'study-material',
    canonicalPath: '/study-material/class-10/sci',
    classLevel: 'class-10',
    subjectSlug: 'sci',
    title: 'Class 10 Science Notes (Physics, Chemistry, Biology) | RK Study Centre',
    h1: 'Class 10 Science (विज्ञान) Chapter-Wise Notes, Diagrams & VVI Questions',
    description:
      'Complete Class 10 Science notes in Hindi and English covering Physics, Chemistry, and Biology chapters, board exam PYQs, and VVI questions at RK Study Centre.',
    learningResourceType: 'Study Notes & Chapter Summary',
    educationalLevel: 'Class 10 (Matric)',
  },
  '/class-10-social-science-notes': {
    route: 'study-material',
    canonicalPath: '/study-material/class-10/soc',
    classLevel: 'class-10',
    subjectSlug: 'soc',
    title: 'Class 10 Social Science Notes (History, Geography, Civics) | RK Study Centre',
    h1: 'Class 10 Social Science (सामाजिक विज्ञान) Chapter-Wise Notes & VVI Questions',
    description:
      'Study Class 10 History, Geography, Political Science (Civics), and Economics chapter-wise notes in Hindi with VVI objective questions for Bihar Board Matric exams.',
    learningResourceType: 'Study Notes & PYQ Bank',
    educationalLevel: 'Class 10 (Matric)',
  },
  '/bihar-board-class-10-notes': {
    route: 'study-material',
    canonicalPath: '/study-material/class-10',
    classLevel: 'class-10',
    title: 'Bihar Board Class 10 Notes & PDF Study Material (All Subjects) | RK Study Centre',
    h1: 'Bihar Board Class 10 (बिहार बोर्ड मैट्रिक) All Subjects Notes & PDF Study Material',
    description:
      'Access Bihar Board (BSEB) Class 10 chapter-wise notes, handwritten PDFs, model papers, and VVI questions for Maths, Science, Social Science, Hindi, and Sanskrit.',
    learningResourceType: 'Board Exam Study Material',
    educationalLevel: 'Class 10 (BSEB Matric)',
  },
  '/bseb-matric-notes': {
    route: 'study-material',
    canonicalPath: '/study-material/class-10',
    classLevel: 'class-10',
    title: 'BSEB Matric Notes, Model Papers & Question Bank | RK Study Centre',
    h1: 'BSEB Matric (कक्षा 10वीं) Chapter-Wise Notes, PYQs & Model Papers',
    description:
      'Prepare for BSEB Matric exams with authentic chapter-wise Hindi and English notes, previous year question banks, and free online mock tests at RK Study Centre.',
    learningResourceType: 'Matric Study Notes & Question Bank',
    educationalLevel: 'Class 10 (BSEB Matric)',
  },
  '/class-10-vvi-questions': {
    route: 'tests',
    canonicalPath: '/tests/class-10',
    classLevel: 'class-10',
    title: 'Class 10 VVI Objective Questions & Online Mock Tests | RK Study Centre',
    h1: 'Class 10 VVI Objective Questions, Marathon Quizzes & Live Mock Tests',
    description:
      'Practice Class 10 VVI objective questions, 300+ MCQ marathons, and chapter-wise timed online mock tests for Science, Maths, and Social Science at RK Study Centre.',
    learningResourceType: 'Practice Test & Question Bank',
    educationalLevel: 'Class 10 (Matric)',
  },
  '/class-10-online-study': {
    route: 'classes',
    canonicalPath: '/classes/class-10',
    classLevel: 'class-10',
    title: 'Class 10 Online Study Portal — Subjects, Notes & Tests | RK Study Centre',
    h1: 'Class 10 (कक्षा 10वीं मैट्रिक) Complete Online Study Portal',
    description:
      'Start Class 10 online study with structured subjects, NCERT & Bihar Board books, chapter-wise notes, formula banks, and daily live mock tests at RK Study Centre.',
    learningResourceType: 'Interactive Curriculum Portal',
    educationalLevel: 'Class 10 (Matric)',
  },
  '/class-9-to-12-online-study': {
    route: 'classes',
    canonicalPath: '/classes',
    title: 'Class 9 to 12 Online Study, Notes & Mock Tests | RK Study Centre',
    h1: 'Class 9 to 12 Complete Online Study Portal (Bihar Board & NCERT)',
    description:
      'Comprehensive online study platform for Class 9, Class 10, Class 11, and Class 12 students with Science, Arts, and Commerce notes, VVI questions, and online tests.',
    learningResourceType: 'Academic Curriculum Portal',
    educationalLevel: 'Class 9 to 12',
  },
  '/class-12-physics-notes': {
    route: 'study-material',
    canonicalPath: '/study-material/class-12/phy',
    classLevel: 'class-12',
    subjectSlug: 'phy',
    title: 'Class 12 Physics Notes, Derivations & VVI Questions | RK Study Centre',
    h1: 'Class 12 Physics (भौतिकी) Chapter-Wise Notes, Derivations & Objective Bank',
    description:
      'Read Class 12 Physics chapter-wise notes, electrostatic & optics derivations, formula sheets, and VVI objective questions for Intermediate board exams at RK Study Centre.',
    learningResourceType: 'Study Notes & Derivations',
    educationalLevel: 'Class 12 (Intermediate Science)',
  },
};

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface RouteSeoData {
  statusCode: 200 | 404;
  title: string;
  description: string;
  canonicalUrl: string;
  robots: 'index, follow' | 'noindex, nofollow';
  ogType: 'website' | 'article';
  ogImage: string;
  breadcrumbs: BreadcrumbItem[];
  jsonLdSchemas: Record<string, any>[];
  prerenderHtml: string;
}

export interface FaqDataItem {
  id: number;
  category: 'general' | 'account' | 'study' | 'tests' | 'support';
  question: string;
  answer: string;
}

export const HOMEPAGE_FAQS: { question: string; answer: string }[] = [
  {
    question: 'RK Study Centre पर किन-किन कक्षाओं की ऑनलाइन पढ़ाई और नोट्स उपलब्ध हैं?',
    answer:
      'RK Study Centre पर कक्षा 9वीं, 10वीं (मैट्रिक बोर्ड), 11वीं और 12वीं (इंटरमीडिएट - Science, Arts एवं Commerce) के विद्यार्थियों के लिए अध्याय-वार डिजिटल और हस्तलिखित नोट्स, सूत्र बैंक (Formula Bank), VVI प्रश्न और ऑनलाइन मॉक टेस्ट उपलब्ध हैं।',
  },
  {
    question: 'Class 10 Maths और Science के Chapter-wise Notes और VVI Questions कैसे पढ़ें?',
    answer:
      'आप Study Material या Classes सेक्शन में जाकर Class 10 चुनें, फिर Mathematics या Science विषय पर क्लिक करके प्रत्येक अध्याय के विस्तृत हिंदी व अंग्रेजी नोट्स, सूत्र पीडीएफ और 500+ VVI वस्तुनिष्ठ प्रश्न निःशुल्क पढ़ और हल कर सकते हैं।',
  },
  {
    question: 'क्या बिहार बोर्ड (BSEB) और NCERT पाठ्यक्रम के लिए ऑनलाइन मॉक टेस्ट और OMR प्रैक्टिस उपलब्ध है?',
    answer:
      'हाँ, RK Study Centre पर प्रत्येक विषय और अध्याय के लिए लाइव टाइमर आधारित ऑनलाइन मॉक टेस्ट, 300 प्रश्नों की महा-मैराथन सीरीज़ और डिजिटल OMR शीट सिम्युलेटर उपलब्ध है, जिससे छात्र वास्तविक बोर्ड परीक्षा जैसा अभ्यास कर सकते हैं।',
  },
  {
    question: 'क्या अध्ययन सामग्री को ऑफलाइन (बिना इंटरनेट) पढ़ने के लिए सेव किया जा सकता है?',
    answer:
      'हाँ, RK Study Centre एक PWA (Progressive Web App) सक्षम शैक्षणिक मंच है जहाँ आप महत्वपूर्ण अध्याय के नोट्स को ऑफलाइन हब में पिन (Save Offline) कर सकते हैं और पीडीएफ/नोट्स डाउनलोड कर सकते हैं।',
  },
];

export const FAQ_PAGE_ITEMS: FaqDataItem[] = [
  {
    id: 1,
    category: 'general',
    question: '1. RK STUDY CENTRE क्या है?',
    answer:
      'RK STUDY CENTRE एक स्वतंत्र ऑनलाइन शैक्षणिक शिक्षण मंच (Independent Educational Learning Platform) है, जिसे विशेष रूप से कक्षा 9वीं, 10वीं, 11वीं और 12वीं के विद्यार्थियों के लिए तैयार किया गया है। यहाँ अध्यायवार नोट्स, पाठ्यपुस्तकें, विगत वर्षों के प्रश्न (PYQs) और ऑनलाइन टेस्ट उपलब्ध कराए जाते हैं। महत्वपूर्ण स्पष्टीकरण: यह किसी भी सरकारी विभाग, बिहार विद्यालय परीक्षा समिति (BSEB) अथवा किसी भी सरकारी बोर्ड से आधिकारिक रूप से संबद्ध, मान्यता प्राप्त या सरकारी स्वामित्व वाली संस्था नहीं है।',
  },
  {
    id: 2,
    category: 'account',
    question: '2. विद्यार्थी अपना Account कैसे बनाएँ?',
    answer:
      'विद्यार्थी वेबसाइट के शीर्ष पर स्थित "खाता बनाएं" (Register) बटन पर क्लिक करके अपना नाम, मोबाइल नंबर, कक्षा वर्ग (Class 9, 10, 11 या 12), ईमेल और पासवर्ड भरकर आसानी से नया Account बना सकते हैं। इसके अतिरिक्त आप "Google Sign-In" के माध्यम से एक क्लिक में भी सीधे अपना विद्यार्थी Account बना सकते हैं।',
  },
  {
    id: 3,
    category: 'account',
    question: '3. Login कैसे करें?',
    answer:
      'वेबसाइट के शीर्ष पर "Login" बटन पर क्लिक करें। अपना रजिस्टर्ड ईमेल और पासवर्ड दर्ज करें और "Login करें" बटन दबाएं। यदि आपने Google खाते से पंजीकरण किया है, तो "Google के साथ Login करें" पर क्लिक करें और तुरंत अपने खाते में प्रवेश करें।',
  },
  {
    id: 4,
    category: 'account',
    question: '4. Google Sign-In क्या है?',
    answer:
      'Google Sign-In एक सुरक्षित एवं त्वरित प्रमाणीकरण (Authentication) सुविधा है, जो Google और Firebase के सुरक्षित सिस्टम द्वारा संचालित होती है। इससे आपको अलग से पासवर्ड याद रखने की आवश्यकता नहीं होती; आप अपने व्यक्तिगत Google खाते के माध्यम से एक क्लिक में सुरक्षित रूप से Login कर सकते हैं।',
  },
  {
    id: 5,
    category: 'study',
    question: '5. अपनी Class कैसे चुनें?',
    answer:
      'हेडर में दिए गए "कक्षाएं" (Classes) मेन्यू पर क्लिक करके अथवा होम पेज पर दिए गए त्वरित कक्षा बटन (कक्षा 9वीं, 10वीं, 11वीं, 12वीं) में से अपनी कक्षा का चयन कर सकते हैं। इसके अतिरिक्त अपने विद्यार्थी प्रोफाइल में भी आप अपनी प्राथमिक कक्षा दर्ज कर सकते हैं, जिससे आपको केवल आपकी कक्षा की सामग्री प्राथमिकता से दिखाई देगी।',
  },
  {
    id: 6,
    category: 'study',
    question: '6. Study Material कहाँ मिलेगा?',
    answer:
      'मुख्य नेविगेशन बार में "अध्ययन सामग्री" (Study Material) टैब पर क्लिक करें। वहाँ आप अपनी कक्षा और विषय के अनुसार सभी उपलब्ध नोट्स, PDF गाइड, प्रश्न बैंक और मॉडल पेपर्स देख सकते हैं। प्रत्येक कक्षा के लिए अलग अनुभाग उपलब्ध है।',
  },
  {
    id: 7,
    category: 'study',
    question: '7. Notes और PDF कैसे खोलें?',
    answer:
      'अध्ययन सामग्री अनुभाग में किसी भी नोट्स या PDF कार्ड पर दिए गए "PDF देखें" अथवा "अध्ययन करें" बटन पर क्लिक करें। दस्तावेज़ सीधे आपके ब्राउज़र में उच्च स्पष्टता के साथ खुल जाएगा, जिसे आप अपने मोबाइल या कंप्यूटर पर आसानी से पढ़ सकते हैं।',
  },
  {
    id: 8,
    category: 'study',
    question: '8. Chapter-wise Study Material कैसे देखें?',
    answer:
      '"कक्षाएं" (Classes) या "अध्ययन सामग्री" पृष्ठ पर जाएं। अपनी कक्षा चुनें, इसके बाद संबंधित विषय (जैसे गणित, विज्ञान, सामाजिक विज्ञान) पर क्लिक करें। वहाँ उस विषय के सभी अध्यायों की सूची क्रमवार दिखाई देगी। किसी भी अध्याय पर क्लिक करके आप उसके विशिष्ट नोट्स और प्रश्न प्राप्त कर सकते हैं।',
  },
  {
    id: 9,
    category: 'tests',
    question: '9. Online Test कैसे दें?',
    answer:
      'शीर्ष मेन्यू में "टेस्ट" (Tests) टैब पर क्लिक करें। अपनी कक्षा और विषय का चयन करें। उपलब्ध टेस्ट कार्ड में "टेस्ट शुरू करें" पर क्लिक करें। स्क्रीन पर समय सीमा (Timer) के साथ बहुविकल्पीय प्रश्न (MCQs) आएंगे। सभी प्रश्नों के उत्तर चुनकर अंत में "टेस्ट सबमिट करें" पर क्लिक करें।',
  },
  {
    id: 10,
    category: 'tests',
    question: '10. Practice Quiz क्या है?',
    answer:
      'Practice Quiz एक अध्याय-आधारित अभ्यास प्रश्नोत्तरी है, जिसमें बिना किसी नकारात्मक अंकन (Negative Marking) के विद्यार्थी किसी विशिष्ट अध्याय के मुख्य प्रश्नों का त्वरित अभ्यास कर सकते हैं। यह परीक्षा से पूर्व त्वरित रिवीज़न (Quick Revision) के लिए अत्यंत उपयोगी है।',
  },
  {
    id: 11,
    category: 'tests',
    question: '11. Test Result कैसे देखें?',
    answer:
      'जैसे ही आप ऑनलाइन टेस्ट सबमिट करते हैं, स्क्रीन पर तुरंत आपका विस्तृत परिणाम (Result Card) प्रदर्शित होता है। इसमें आपके कुल प्राप्तांक, सही उत्तर, गलत उत्तर, प्रतिशत और प्रत्येक प्रश्न का सही उत्तर व व्याख्या विस्तार से दिखाई जाती है।',
  },
  {
    id: 12,
    category: 'general',
    question: '12. Courses क्या हैं?',
    answer:
      '"कोर्सेज" (Courses) अनुभाग में बोर्ड परीक्षाओं की संपूर्ण और संगठित तैयारी हेतु विशेष लक्ष्य बैच उपलब्ध हैं। इनमें विस्तृत व्याख्याएं, विशेष टेस्ट श्रृंखला, फॉर्मूला शीट्स और परीक्षा रणनीति सत्र शामिल होते हैं।',
  },
  {
    id: 13,
    category: 'account',
    question: '13. अगर Password भूल जाएँ तो क्या करें?',
    answer:
      'Login पृष्ठ पर "पासवर्ड भूल गए? (Forgot Password)" विकल्प पर क्लिक करें। अपना पंजीकृत ईमेल दर्ज करें; आपके ईमेल पते पर सुरक्षित पासवर्ड रीसेट करने का लिंक भेज दिया जाएगा। अथवा यदि आप Google Sign-In का उपयोग करते हैं, तो बिना पासवर्ड सीधे सुरक्षित Login कर सकते हैं।',
  },
  {
    id: 14,
    category: 'study',
    question: '14. Study Material दिखाई नहीं दे रहा हो तो क्या करें?',
    answer:
      'कृपया सुनिश्चित करें कि आपने सही कक्षा (Class 9, 10, 11 या 12) का चयन किया है। अपने इंटरनेट कनेक्शन की जांच करें और एक बार पेज को रिफ्रेश (Reload) करें। यदि समस्या बनी रहे तो ब्राउज़र का कैश साफ करें या हमारी सहायता टीम से संपर्क करें।',
  },
  {
    id: 15,
    category: 'support',
    question: '15. Website में समस्या आने पर सहायता कैसे लें?',
    answer:
      'यदि आपको वेबसाइट पर किसी भी प्रकार की तकनीकी कठिनाई आ रही है, तो आप वेबसाइट के "संपर्क सहायता" फॉर्म से संदेश भेज सकते हैं अथवा सीधे हमारी आधिकारिक ईमेल rkstudycentre064@gmail.com पर स्क्रीनशॉट के साथ संपर्क कर सकते हैं। हमारी सहायता टीम 24 से 48 घंटे में समाधान करेगी।',
  },
  {
    id: 16,
    category: 'general',
    question: '16. Mobile और Computer दोनों पर website इस्तेमाल कर सकते हैं?',
    answer:
      'हाँ, बिल्कुल! RK STUDY CENTRE एक पूर्णतः रिस्पॉन्सिव (Fully Responsive) वेब प्लेटफॉर्म है। यह Android स्मार्टफोन, iPhone, iPad, टैबलेट, लैपटॉप और डेस्कटॉप कंप्यूटर सभी स्क्रीनों पर समान रूप से सुचारू रूप से कार्य करता है।',
  },
  {
    id: 17,
    category: 'account',
    question: '17. Account की जानकारी कैसे सुरक्षित रखी जाती है?',
    answer:
      'आपका खाता और डेटा Google Firebase के विश्वस्तरीय सुरक्षित क्लाउड इन्फ्रास्ट्रक्चर में एन्क्रिप्टेड रूप में संरक्षित रहता है। आपके पासवर्ड उद्योग-मानक सुरक्षा द्वारा सुरक्षित होते हैं और आपका व्यक्तिगत डेटा किसी तीसरे पक्ष को साझा नहीं किया जाता।',
  },
  {
    id: 18,
    category: 'support',
    question: '18. Privacy Policy कहाँ पढ़ें?',
    answer:
      'वेबसाइट के सबसे निचले भाग (Footer) में "गोपनीयता नीति (Privacy Policy)" लिंक पर क्लिक करके अथवा "अन्य (More)" मेन्यू में जाकर आप हमारी विस्तृत डेटा सुरक्षा एवं गोपनीयता नीति पढ़ सकते हैं।',
  },
  {
    id: 19,
    category: 'support',
    question: '19. Terms & Conditions कहाँ पढ़ें?',
    answer:
      'फुटर में स्थित "नियम एवं शर्तें (Terms & Conditions)" लिंक पर क्लिक करके आप प्लेटफॉर्म के उपयोग से संबंधित सभी नियम, जिम्मेदारियां और सेवा शर्तों को विस्तार से पढ़ सकते हैं।',
  },
  {
    id: 20,
    category: 'support',
    question: '20. Contact Support से सहायता कैसे लें?',
    answer:
      'आप फुटर अथवा हेडर के "अन्य" मेन्यू से "संपर्क सहायता (Contact Support)" टैब खोल सकते हैं। वहाँ अपना नाम, ईमेल, कक्षा और समस्या लिखकर संदेश भेज सकते हैं, या सीधे rkstudycentre064@gmail.com पर ईमेल भेज सकते हैं।',
  },
];

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildBaseSchemas(baseUrl: string): Record<string, any>[] {
  const cleanBase = baseUrl.replace(/\/$/, '');
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      '@id': `${cleanBase}/#organization`,
      name: 'RK Study Centre',
      alternateName: 'RK Study Center',
      url: `${cleanBase}/`,
      logo: {
        '@type': 'ImageObject',
        url: `${cleanBase}/pwa-512x512.svg`,
      },
      image: `${cleanBase}/og-banner.svg`,
      description:
        'RK Study Centre provides Class 9 to 12 online study material, chapter-wise notes, VVI questions, PYQs, model papers, and online mock tests for Bihar Board (BSEB) and NCERT students.',
      sameAs: [`${cleanBase}/`],
      knowsAbout: [
        'Class 10 Maths Notes',
        'Class 10 Science Notes',
        'Bihar Board Class 10 Notes',
        'BSEB Matric Notes',
        'Class 10 VVI Questions',
        'Class 9 to 12 Online Study',
        'NCERT Solutions in Hindi',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${cleanBase}/#website`,
      name: 'RK Study Centre',
      alternateName: 'RK Study Center — Class 9 to 12 Online Study Portal',
      url: `${cleanBase}/`,
      publisher: {
        '@id': `${cleanBase}/#organization`,
      },
      inLanguage: ['hi-IN', 'en-IN'],
    },
  ];
}

function buildBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]): Record<string, any> | null {
  if (!breadcrumbs || breadcrumbs.length <= 1) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((b, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: b.name,
      item: b.url,
    })),
  };
}

function buildFaqSchema(faqs: { question: string; answer: string }[]): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}

function buildLearningResourceSchema(params: {
  name: string;
  description: string;
  url: string;
  cleanBase: string;
  educationalLevel: string;
  learningResourceType: string;
  aboutName?: string;
}): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: params.name,
    description: params.description,
    url: params.url,
    educationalLevel: params.educationalLevel,
    learningResourceType: params.learningResourceType,
    inLanguage: ['hi-IN', 'en-IN'],
    isAccessibleForFree: true,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'RK Study Centre',
      url: `${params.cleanBase}/`,
    },
    ...(params.aboutName
      ? {
          about: {
            '@type': 'Thing',
            name: params.aboutName,
          },
        }
      : {}),
  };
}

function buildPrerenderShell(params: {
  h1: string;
  subtitle: string;
  breadcrumbs: BreadcrumbItem[];
  bodySectionsHtml: string;
}): string {
  const breadcrumbNav =
    params.breadcrumbs.length > 1
      ? `<nav aria-label="Breadcrumb" class="max-w-7xl mx-auto px-4 pt-4 text-xs text-slate-600">
          <ol class="flex flex-wrap items-center gap-1.5">
            ${params.breadcrumbs
              .map(
                (b, i) =>
                  `<li>${
                    i < params.breadcrumbs.length - 1
                      ? `<a href="${escapeHtml(b.url)}" class="hover:underline text-blue-700 font-semibold">${escapeHtml(b.name)}</a> <span aria-hidden="true">/</span>`
                      : `<span class="font-bold text-slate-900" aria-current="page">${escapeHtml(b.name)}</span>`
                  }</li>`
              )
              .join('')}
          </ol>
        </nav>`
      : '';

  return `<div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="bg-white border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
        <a href="/" class="text-xl font-black text-blue-900">RK STUDY CENTRE (आर.के. स्टडी सेंटर)</a>
        <nav aria-label="Primary Navigation" class="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-700">
          <a href="/">Home</a>
          <a href="/classes">Classes (कक्षा 9-12)</a>
          <a href="/study-material">Study Material &amp; Notes</a>
          <a href="/tests">Online Tests &amp; VVI MCQ</a>
          <a href="/courses">Courses</a>
          <a href="/formula-bank">Formula Bank</a>
          <a href="/science-lab">Science Lab</a>
          <a href="/omr-simulator">OMR Practice</a>
          <a href="/about-us">About Us</a>
          <a href="/faq">FAQ</a>
          <a href="/contact-support">Contact</a>
        </nav>
      </div>
    </header>
    ${breadcrumbNav}
    <main class="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <section class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
        <h1 class="text-2xl sm:text-4xl font-black text-slate-900">${escapeHtml(params.h1)}</h1>
        <p class="text-base sm:text-lg text-slate-700 leading-relaxed">${escapeHtml(params.subtitle)}</p>
      </section>
      ${params.bodySectionsHtml}
    </main>
    <footer class="bg-slate-950 text-slate-300 py-8 px-4 border-t border-slate-800 mt-12">
      <div class="max-w-7xl mx-auto space-y-4 text-sm">
        <p class="font-bold text-white">RK Study Centre — Class 9 to 12 Online Study, Bihar Board (BSEB) &amp; NCERT Notes, VVI Questions &amp; Mock Tests</p>
        <nav aria-label="SEO Quick Links" class="flex flex-wrap gap-3 text-xs text-slate-400">
          <a href="/class-10-maths-notes">Class 10 Maths Notes</a>
          <a href="/class-10-science-notes">Class 10 Science Notes</a>
          <a href="/class-10-social-science-notes">Class 10 Social Science Notes</a>
          <a href="/bihar-board-class-10-notes">Bihar Board Class 10 Notes</a>
          <a href="/bseb-matric-notes">BSEB Matric Notes</a>
          <a href="/class-10-vvi-questions">Class 10 VVI Questions</a>
          <a href="/class-10-online-study">Class 10 Online Study</a>
          <a href="/class-9-to-12-online-study">Class 9 to 12 Online Study</a>
          <a href="/class-12-physics-notes">Class 12 Physics Notes</a>
          <a href="/sitemap.xml">XML Sitemap</a>
        </nav>
      </div>
    </footer>
  </div>`;
}

export function normalizeSeoPath(rawPath: string): string {
  const withoutQuery = (rawPath || '/').split('?')[0].split('#')[0];
  if (withoutQuery.length > 1 && withoutQuery.endsWith('/')) {
    return withoutQuery.slice(0, -1).toLowerCase();
  }
  return (withoutQuery || '/').toLowerCase();
}

/**
 * Resolves full SEO metadata, canonical URL, robots policy, Open Graph tags, JSON-LD structured data,
 * semantic prerendered HTML, and HTTP status code for any application route.
 */
export function resolveSeoMetadata(rawPath: string, baseUrl: string = DEFAULT_BASE_URL): RouteSeoData {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const pathname = normalizeSeoPath(rawPath);
  const ogImage = `${cleanBase}/og-banner.svg`;
  const baseSchemas = buildBaseSchemas(cleanBase);

  // 1. PRIVATE / NON-INDEXABLE ROUTES (Owner, Admin, Student Progress, Login, Register)
  if (
    pathname === '/owner' ||
    pathname.startsWith('/owner/') ||
    pathname === '/admin-access-check' ||
    pathname === '/admin-check' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/my-progress' ||
    pathname.startsWith('/my-progress/') ||
    pathname === '/progress'
  ) {
    const titleMap: Record<string, string> = {
      '/owner': 'व्यवस्थापक पोर्टल (Owner Portal) - RK STUDY CENTRE',
      '/admin-access-check': 'Admin Access Check - RK STUDY CENTRE',
      '/login': 'विद्यार्थी लॉगिन (Login) - RK STUDY CENTRE',
      '/register': 'नया पंजीकरण (Register) - RK STUDY CENTRE',
      '/my-progress': 'विद्यार्थी प्रगति रिपोर्ट (My Progress) - RK STUDY CENTRE',
    };
    const matchedTitle = titleMap[pathname] || 'Private Portal - RK STUDY CENTRE';
    return {
      statusCode: 200,
      title: matchedTitle,
      description: 'Protected member and administration area for RK Study Centre.',
      canonicalUrl: `${cleanBase}${pathname}`,
      robots: 'noindex, nofollow',
      ogType: 'website',
      ogImage,
      breadcrumbs: [{ name: 'Home', url: `${cleanBase}/` }],
      jsonLdSchemas: [],
      prerenderHtml: '',
    };
  }

  // 2. HOMEPAGE (/)
  if (pathname === '/' || pathname === '/home') {
    const classCardsHtml = CLASSES_METADATA.map((cls) => {
      const subjects = SUBJECTS.filter((s) => s.classLevel === cls.id);
      return `<article class="p-5 rounded-2xl border border-slate-200 bg-white space-y-2">
        <h3 class="text-lg font-extrabold text-slate-900">
          <a href="/classes/${cls.id}">${escapeHtml(cls.name)} (${escapeHtml(cls.hindiName)})</a>
        </h3>
        <p class="text-sm text-slate-600">${escapeHtml(cls.description)}</p>
        <ul class="flex flex-wrap gap-2 pt-2 text-xs font-semibold text-blue-700">
          ${subjects
            .slice(0, 8)
            .map(
              (sub) =>
                `<li><a href="/classes/${cls.id}/${sub.slug}" class="underline">${escapeHtml(sub.name)} (${escapeHtml(sub.hindiName)})</a></li>`
            )
            .join('')}
        </ul>
      </article>`;
    }).join('\n');

    const faqHtml = HOMEPAGE_FAQS.map(
      (f) => `<div class="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
        <h3 class="font-bold text-slate-900">${escapeHtml(f.question)}</h3>
        <p class="text-sm text-slate-700">${escapeHtml(f.answer)}</p>
      </div>`
    ).join('\n');

    const prerenderHtml = buildPrerenderShell({
      h1: 'RK Study Centre — Class 9 to 12 Online Study, Notes & VVI Questions (Bihar Board & NCERT)',
      subtitle:
        'RK Study Centre (आर.के. स्टडी सेंटर) कक्षा 9वीं से 12वीं के विद्यार्थियों के लिए अध्याय-वार हस्तलिखित व डिजिटल नोट्स, सूत्र बैंक, VVI वस्तुनिष्ठ प्रश्न (PYQs), मॉडल पेपर और लाइव ऑनलाइन मॉक टेस्ट प्रदान करता है।',
      breadcrumbs: [{ name: 'Home', url: `${cleanBase}/` }],
      bodySectionsHtml: `
        <section class="space-y-4">
          <h2 class="text-xl sm:text-2xl font-black text-slate-900">कक्षा 9 से 12 पाठ्यक्रम एवं विषय (Class 9 to 12 Online Study)</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">${classCardsHtml}</div>
        </section>
        <section class="space-y-4 bg-white p-6 rounded-2xl border border-slate-200">
          <h2 class="text-xl sm:text-2xl font-black text-slate-900">लोकप्रिय बोर्ड परीक्षा अध्ययन लिंक (Popular Study &amp; Notes Links)</h2>
          <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm font-bold text-blue-800">
            <li><a href="/class-10-maths-notes">Class 10 Maths Notes &amp; Formula PDF</a></li>
            <li><a href="/class-10-science-notes">Class 10 Science Notes (Physics, Chemistry, Biology)</a></li>
            <li><a href="/class-10-social-science-notes">Class 10 Social Science Notes (History, Geography, Civics)</a></li>
            <li><a href="/bihar-board-class-10-notes">Bihar Board Class 10 Notes (All Subjects)</a></li>
            <li><a href="/bseb-matric-notes">BSEB Matric Notes &amp; Model Papers</a></li>
            <li><a href="/class-10-vvi-questions">Class 10 VVI Objective Questions &amp; Mock Tests</a></li>
            <li><a href="/class-10-online-study">Class 10 Online Study Portal</a></li>
            <li><a href="/class-9-to-12-online-study">Class 9 to 12 Online Study Hub</a></li>
            <li><a href="/class-12-physics-notes">Class 12 Physics Notes &amp; Derivations</a></li>
          </ul>
        </section>
        <section class="space-y-4 bg-white p-6 rounded-2xl border border-slate-200">
          <h2 class="text-xl sm:text-2xl font-black text-slate-900">सामान्य प्रश्न (Frequently Asked Questions)</h2>
          <div class="space-y-3">${faqHtml}</div>
        </section>
      `,
    });

    return {
      statusCode: 200,
      title: 'RK Study Centre | Class 9 to 12 Online Study, Notes & VVI Questions',
      description:
        'RK Study Centre provides Class 9 to 12 online study material, chapter-wise notes, VVI questions, PYQs, model papers, and online mock tests for Bihar Board and NCERT students.',
      canonicalUrl: `${cleanBase}/`,
      robots: 'index, follow',
      ogType: 'website',
      ogImage,
      breadcrumbs: [{ name: 'Home', url: `${cleanBase}/` }],
      jsonLdSchemas: [...baseSchemas, buildFaqSchema(HOMEPAGE_FAQS)],
      prerenderHtml,
    };
  }

  // 3. HIGH-INTENT SEARCH LANDING ALIAS ROUTES (/class-10-maths-notes, /bihar-board-class-10-notes, etc.)
  if (SEO_LANDING_ALIASES[pathname]) {
    const alias = SEO_LANDING_ALIASES[pathname];
    const canonicalUrl = `${cleanBase}${alias.canonicalPath}`;
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Home', url: `${cleanBase}/` },
      { name: alias.h1, url: canonicalUrl },
    ];
    const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);
    const learningSchema = buildLearningResourceSchema({
      name: alias.h1,
      description: alias.description,
      url: canonicalUrl,
      cleanBase,
      educationalLevel: alias.educationalLevel,
      learningResourceType: alias.learningResourceType,
      aboutName: alias.title,
    });

    const targetClass = alias.classLevel
      ? CLASSES_METADATA.find((c) => c.id === alias.classLevel)
      : undefined;
    const subjectsList = targetClass
      ? SUBJECTS.filter((s) => s.classLevel === targetClass.id)
      : SUBJECTS;
    const matchedSubject = alias.subjectSlug
      ? subjectsList.find((s) => s.slug === alias.subjectSlug || s.id === alias.subjectSlug)
      : undefined;
    const chaptersList = matchedSubject
      ? CHAPTERS.filter((ch) => ch.subjectId === matchedSubject.id)
      : targetClass
      ? CHAPTERS.filter((ch) =>
          subjectsList.some((s) => s.id === ch.subjectId)
        ).slice(0, 24)
      : [];

    const chapterLinksHtml =
      chaptersList.length > 0
        ? `<section class="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h2 class="text-xl font-black text-slate-900">अध्याय-वार नोट्स एवं अभ्यास सूची (Chapter-Wise Study Notes &amp; VVI Questions)</h2>
            <ul class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              ${chaptersList
                .map((ch) => {
                  const book = BOOKS.find((b) => b.id === ch.bookId);
                  const sub = SUBJECTS.find((s) => s.id === ch.subjectId);
                  const clsId = sub?.classLevel || alias.classLevel || 'class-10';
                  const subSlug = sub?.slug || alias.subjectSlug || 'math';
                  const bookSlug = book?.slug || 'ncert';
                  return `<li class="p-3 rounded-xl border border-slate-200">
                    <a href="/study-material/${clsId}/${subSlug}/${bookSlug}/${ch.slug}" class="font-bold text-blue-800 hover:underline">
                      Chapter ${ch.chapterNumber}: ${escapeHtml(ch.title)} (${escapeHtml(ch.hindiTitle || '')})
                    </a>
                    ${ch.summary ? `<p class="text-xs text-slate-600 mt-1">${escapeHtml(ch.summary)}</p>` : ''}
                  </li>`;
                })
                .join('\n')}
            </ul>
          </section>`
        : '';

    const subjectLinksHtml = `<section class="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
      <h2 class="text-xl font-black text-slate-900">संबंधित विषय एवं अध्ययन पोर्टल (Subjects &amp; Study Portals)</h2>
      <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm font-bold text-blue-800">
        ${subjectsList
          .slice(0, 12)
          .map(
            (s) =>
              `<li class="p-3 rounded-xl border border-slate-200"><a href="/study-material/${s.classLevel}/${s.slug}">${escapeHtml(s.classLevel.toUpperCase())} - ${escapeHtml(s.name)} (${escapeHtml(s.hindiName)}) Notes</a></li>`
          )
          .join('\n')}
      </ul>
    </section>`;

    return {
      statusCode: 200,
      title: alias.title,
      description: alias.description,
      canonicalUrl,
      robots: 'index, follow',
      ogType: 'article',
      ogImage,
      breadcrumbs,
      jsonLdSchemas: [
        ...baseSchemas,
        ...(breadcrumbSchema ? [breadcrumbSchema] : []),
        learningSchema,
      ],
      prerenderHtml: buildPrerenderShell({
        h1: alias.h1,
        subtitle: alias.description,
        breadcrumbs,
        bodySectionsHtml: `${chapterLinksHtml}\n${subjectLinksHtml}`,
      }),
    };
  }

  // 4. CORE PUBLIC EDUCATIONAL & INFORMATIONAL ROUTES
  const corePublicRoutes: Record<
    string,
    { title: string; h1: string; description: string; resourceType?: string }
  > = {
    '/classes': {
      title: 'Class 9 to 12 Curriculum & Subjects | RK Study Centre',
      h1: 'कक्षा 9 से 12 पाठ्यक्रम एवं विषय सूची (Class 9 to 12 Curriculum)',
      description:
        'Browse Class 9, Class 10, Class 11, and Class 12 subjects, books, and chapter-wise study portals for Bihar Board and NCERT students at RK Study Centre.',
      resourceType: 'Curriculum Structure',
    },
    '/study-material': {
      title: 'Study Material, Notes & VVI Questions (Class 9 to 12) | RK Study Centre',
      h1: 'डिजिटल एवं हस्तलिखित अध्ययन सामग्री (Class 9 to 12 Study Material & PDF Notes)',
      description:
        'Access Class 9 to 12 chapter-wise study material, handwritten and digital notes, PYQs, and model papers in Hindi and English at RK Study Centre.',
      resourceType: 'Study Material & PDF Notes',
    },
    '/tests': {
      title: 'Online Mock Tests & VVI Objective Quizzes (Class 9 to 12) | RK Study Centre',
      h1: 'लाइव ऑनलाइन मॉक टेस्ट एवं VVI वस्तुनिष्ठ प्रश्न (Online Mock Tests)',
      description:
        'Practice live timed online mock tests, 300+ VVI objective marathon quizzes, and board exam test series for Class 9 to 12 at RK Study Centre.',
      resourceType: 'Online Assessment & Mock Test',
    },
    '/courses': {
      title: 'Academic Courses & Board Target Batches (Class 9 to 12) | RK Study Centre',
      h1: 'लक्ष्य बैच एवं शैक्षणिक कोर्सेज (Class 9 to 12 Target Courses)',
      description:
        'Explore structured online courses and board exam target batches for Class 9, 10, 11, and 12 students with complete notes and test series at RK Study Centre.',
    },
    '/formula-bank': {
      title: 'Formula Bank & Theorem Vault (Class 9 to 12) | RK Study Centre',
      h1: 'महत्वपूर्ण सूत्र एवं प्रमेय बैंक (Maths & Science Formula Vault)',
      description:
        'Quick revision mathematical and scientific formulas, equations, and theorems for Class 9 to 12 board exams at RK Study Centre.',
      resourceType: 'Formula & Theorem Reference',
    },
    '/solve-doubt': {
      title: 'Academic Doubt Solver (Maths & Science) | RK Study Centre',
      h1: 'त्वरित शैक्षणिक शंका समाधान (Academic Doubt Solver)',
      description:
        'Get step-by-step academic solutions for Mathematics, Science, and board exam questions in Hindi and English at RK Study Centre.',
      resourceType: 'Academic Problem Solver',
    },
    '/doubt-solve': {
      title: 'Academic Doubt Solver (Maths & Science) | RK Study Centre',
      h1: 'त्वरित शैक्षणिक शंका समाधान (Academic Doubt Solver)',
      description:
        'Get step-by-step academic solutions for Mathematics, Science, and board exam questions in Hindi and English at RK Study Centre.',
      resourceType: 'Academic Problem Solver',
    },
    '/omr-simulator': {
      title: 'Digital OMR Sheet Practice Lab | RK Study Centre',
      h1: 'डिजिटल OMR शीट प्रैक्टिस लैब (Board Exam OMR Simulator)',
      description:
        'Practice Bihar Board Matric and Intermediate objective questions on an interactive digital OMR sheet simulator with instant evaluation at RK Study Centre.',
      resourceType: 'OMR Exam Simulator',
    },
    '/science-lab': {
      title: 'Interactive Virtual Science Lab (Class 9 to 12) | RK Study Centre',
      h1: 'इंटरएक्टिव वर्चुअल विज्ञान प्रयोगशाला (Virtual Science Lab)',
      description:
        'Explore interactive Physics, Chemistry, and Biology practical simulations and experiments in the Virtual Science Lab at RK Study Centre.',
      resourceType: 'Virtual Science Laboratory',
    },
    '/study-tracker': {
      title: 'Daily Study Tracker & Focus Timer | RK Study Centre',
      h1: 'दैनिक अध्ययन लक्ष्य एवं फ़ोकस टाइमर (Daily Study Tracker)',
      description:
        'Track daily revision targets, chapter completion, and board exam study sessions with the RK Study Centre study planner.',
    },
    '/vlogs': {
      title: 'Educational Vlogs & Exam Guidance Videos | RK Study Centre',
      h1: 'शैक्षणिक व्लॉग, विज्ञान प्रयोग एवं परीक्षा मार्गदर्शन (Educational Vlogs)',
      description:
        'Watch classroom updates, science demonstrations, board exam preparation tips, and educational videos from RK Study Centre.',
    },
    '/about-us': {
      title: 'हमारे बारे में (About Us) | RK Study Centre',
      h1: 'हमारे बारे में — RK Study Centre (आर.के. स्टडी सेंटर)',
      description:
        'Learn about RK Study Centre, our academic mission, faculty guidance, and commitment to quality Class 9 to 12 education in Hindi and English.',
    },
    '/faq': {
      title: 'सहायता केंद्र एवं सामान्य प्रश्न (FAQ) | RK Study Centre',
      h1: 'सहायता केंद्र एवं सामान्य प्रश्न (Student Help Center & FAQs)',
      description:
        'Frequently asked questions and student help center for RK Study Centre study material, PDF notes, courses, and online mock tests.',
    },
    '/contact-support': {
      title: 'संपर्क सहायता (Contact Support) | RK Study Centre',
      h1: 'संपर्क एवं विद्यार्थी सहायता केंद्र (Contact & Student Support)',
      description:
        'Contact RK Study Centre for academic inquiries, course batch details, study material guidance, and student technical support.',
    },
    '/policies': {
      title: 'महत्वपूर्ण नीतियाँ (Policies Hub) | RK Study Centre',
      h1: 'संस्थागत नियम एवं नीतियाँ (Official Policies Hub)',
      description:
        'Official institutional policies, terms and conditions, privacy policy, refund policy, and student data rights at RK Study Centre.',
    },
    '/terms-and-conditions': {
      title: 'नियम एवं शर्तें (Terms & Conditions) | RK Study Centre',
      h1: 'नियम एवं शर्तें (Terms & Conditions)',
      description: 'Official Terms and Conditions for using RK Study Centre educational services and study portals.',
    },
    '/privacy-policy': {
      title: 'गोपनीयता नीति (Privacy Policy) | RK Study Centre',
      h1: 'गोपनीयता नीति (Privacy Policy)',
      description: 'Privacy Policy and student personal data protection standards at RK Study Centre.',
    },
    '/refund-cancellation': {
      title: 'रिफंड और रद्दीकरण नीति (Refund Policy) | RK Study Centre',
      h1: 'रिफंड और रद्दीकरण नीति (Refund & Cancellation Policy)',
      description: 'Official refund and course enrollment cancellation policy at RK Study Centre.',
    },
    '/data-privacy': {
      title: 'डेटा गोपनीयता अधिकार (Data Privacy) | RK Study Centre',
      h1: 'डेटा गोपनीयता अधिकार (Student Data Privacy Rights)',
      description: 'Student data privacy rights and account data management guidelines at RK Study Centre.',
    },
    '/more': {
      title: 'अतिरिक्त जानकारी एवं सहायता (More) | RK Study Centre',
      h1: 'संस्थागत जानकारी, सूचनाएं एवं सहायता (More Information)',
      description: 'Institutional information, official notices, FAQs, and student support links at RK Study Centre.',
    },
  };

  if (corePublicRoutes[pathname]) {
    const route = corePublicRoutes[pathname];
    const canonicalPath = pathname === '/doubt-solve' ? '/solve-doubt' : pathname;
    const canonicalUrl = `${cleanBase}${canonicalPath}`;
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Home', url: `${cleanBase}/` },
      { name: route.h1, url: canonicalUrl },
    ];
    const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);
    const schemas: Record<string, any>[] = [
      ...baseSchemas,
      ...(breadcrumbSchema ? [breadcrumbSchema] : []),
    ];

    if (canonicalPath === '/faq') {
      schemas.push(buildFaqSchema(FAQ_PAGE_ITEMS));
    } else if (canonicalPath === '/courses') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'RK Study Centre Academic Courses (Class 9 to 12)',
        itemListElement: COURSES.map((course, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': 'Course',
            name: `${course.title} (${course.batchName})`,
            description: course.description,
            provider: {
              '@type': 'EducationalOrganization',
              name: 'RK Study Centre',
              url: `${cleanBase}/`,
            },
          },
        })),
      });
    } else if (route.resourceType) {
      schemas.push(
        buildLearningResourceSchema({
          name: route.h1,
          description: route.description,
          url: canonicalUrl,
          cleanBase,
          educationalLevel: 'Class 9 to 12',
          learningResourceType: route.resourceType,
        })
      );
    }

    let bodySectionsHtml = '';
    if (canonicalPath === '/faq') {
      bodySectionsHtml = `<section class="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h2 class="text-xl font-black text-slate-900">मुख्य प्रश्न एवं उत्तर (${FAQ_PAGE_ITEMS.length})</h2>
        <div class="space-y-3">
          ${FAQ_PAGE_ITEMS.map(
            (item) => `<article class="p-4 rounded-xl border border-slate-200 space-y-1">
              <h3 class="font-bold text-slate-900">${escapeHtml(item.question)}</h3>
              <p class="text-sm text-slate-700">${escapeHtml(item.answer)}</p>
            </article>`
          ).join('\n')}
        </div>
      </section>`;
    } else if (canonicalPath === '/courses') {
      bodySectionsHtml = `<section class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${COURSES.map(
          (c) => `<article class="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <h2 class="text-lg font-extrabold text-slate-900">${escapeHtml(c.title)} — ${escapeHtml(c.batchName)}</h2>
            <p class="text-sm text-slate-700">${escapeHtml(c.description)}</p>
            <p class="text-xs font-bold text-blue-800">Instructor: ${escapeHtml(c.instructorName)} | Lectures: ${c.totalLectures}</p>
          </article>`
        ).join('\n')}
      </section>`;
    } else {
      bodySectionsHtml = `<section class="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h2 class="text-xl font-black text-slate-900">कक्षा-वार अध्ययन पोर्टल (Select Class Portal)</h2>
        <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm font-bold text-blue-800">
          ${CLASSES_METADATA.map(
            (cls) => `<li class="p-4 rounded-xl border border-slate-200">
              <a href="/classes/${cls.id}">${escapeHtml(cls.name)} (${escapeHtml(cls.hindiName)})</a>
            </li>`
          ).join('\n')}
        </ul>
      </section>`;
    }

    return {
      statusCode: 200,
      title: route.title,
      description: route.description,
      canonicalUrl,
      robots: 'index, follow',
      ogType: 'website',
      ogImage,
      breadcrumbs,
      jsonLdSchemas: schemas,
      prerenderHtml: buildPrerenderShell({
        h1: route.h1,
        subtitle: route.description,
        breadcrumbs,
        bodySectionsHtml,
      }),
    };
  }

  // 5. DYNAMIC PUBLIC HIERARCHY ROUTES (/classes/..., /study-material/..., /tests/...)
  const parts = pathname.replace(/^\//, '').split('/').filter(Boolean);
  const rootSection = parts[0];

  if (
    (rootSection === 'classes' || rootSection === 'study-material' || rootSection === 'tests') &&
    parts.length >= 2
  ) {
    const classSlug = parts[1] as ClassLevel;
    const classMeta = CLASSES_METADATA.find((c) => c.id === classSlug || c.slug === classSlug);
    if (!classMeta) {
      return buildNotFoundSeo(pathname, cleanBase, ogImage);
    }

    const sectionLabelMap: Record<string, string> = {
      classes: 'Classes & Curriculum',
      'study-material': 'Study Material & Notes',
      tests: 'Online Mock Tests',
    };
    const sectionRootLabel = sectionLabelMap[rootSection] || 'Classes';

    const subjectSlugParam = parts[2];
    const bookOrChapterParam = parts[3];
    const chapterSlugParam = parts[4];

    const subjectsForClass = SUBJECTS.filter((s) => s.classLevel === classMeta.id);
    const matchedBookAsSubject = subjectSlugParam
      ? BOOKS.find(
          (b) =>
            b.classLevel === classMeta.id &&
            (b.slug.toLowerCase() === subjectSlugParam.toLowerCase() ||
              b.id.toLowerCase() === subjectSlugParam.toLowerCase())
        )
      : undefined;

    const subjectMeta = subjectSlugParam
      ? subjectsForClass.find(
          (s) =>
            s.slug.toLowerCase() === subjectSlugParam.toLowerCase() ||
            s.id.toLowerCase() === subjectSlugParam.toLowerCase() ||
            s.name.toLowerCase().replace(/\s+/g, '-') === subjectSlugParam.toLowerCase() ||
            (matchedBookAsSubject && s.id === matchedBookAsSubject.subjectId)
        )
      : undefined;

    if (subjectSlugParam && subjectSlugParam !== 'result' && subjectSlugParam !== 'test' && !subjectMeta) {
      return buildNotFoundSeo(pathname, cleanBase, ogImage);
    }

    const booksForSubject = subjectMeta
      ? BOOKS.filter((b) => b.subjectId === subjectMeta.id)
      : [];
    const chaptersForSubject = subjectMeta
      ? CHAPTERS.filter((ch) => ch.subjectId === subjectMeta.id)
      : [];

    let bookMeta = bookOrChapterParam
      ? booksForSubject.find(
          (b) =>
            b.slug.toLowerCase() === bookOrChapterParam.toLowerCase() ||
            b.id.toLowerCase() === bookOrChapterParam.toLowerCase()
        )
      : matchedBookAsSubject;

    let chapterMeta = chapterSlugParam
      ? chaptersForSubject.find(
          (ch) =>
            ch.slug.toLowerCase() === chapterSlugParam.toLowerCase() ||
            ch.id.toLowerCase() === chapterSlugParam.toLowerCase() ||
            ch.slug.toLowerCase() === chapterSlugParam.toLowerCase().replace('chapter-0', 'chapter-') ||
            ch.slug.toLowerCase() === chapterSlugParam.toLowerCase().replace('chapter-', 'chapter-0')
        )
      : undefined;

    if (!bookMeta && bookOrChapterParam && !chapterSlugParam) {
      chapterMeta = chaptersForSubject.find(
        (ch) =>
          ch.slug.toLowerCase() === bookOrChapterParam.toLowerCase() ||
          ch.id.toLowerCase() === bookOrChapterParam.toLowerCase()
      );
      if (chapterMeta) {
        bookMeta = booksForSubject.find((b) => b.id === chapterMeta!.bookId);
      }
    }

    if (
      bookOrChapterParam &&
      !bookMeta &&
      !chapterMeta &&
      subjectSlugParam !== 'result' &&
      subjectSlugParam !== 'test' &&
      bookOrChapterParam !== 'test'
    ) {
      return buildNotFoundSeo(pathname, cleanBase, ogImage);
    }

    // 5A. CHAPTER LEVEL SEO
    if (subjectMeta && chapterMeta) {
      const canonicalBookSlug = bookMeta ? bookMeta.slug : booksForSubject[0]?.slug || 'ncert';
      const canonicalPath = `/${rootSection}/${classMeta.id}/${subjectMeta.slug}/${canonicalBookSlug}/${chapterMeta.slug}`;
      const canonicalUrl = `${cleanBase}${canonicalPath}`;
      const title = `${classMeta.name} ${subjectMeta.name} Ch ${chapterMeta.chapterNumber}: ${chapterMeta.title} Notes & VVI MCQ | RK Study Centre`;
      const description =
        chapterMeta.summary ||
        `Study ${classMeta.name} ${subjectMeta.name} (${subjectMeta.hindiName}) Chapter ${chapterMeta.chapterNumber}: ${chapterMeta.title} (${chapterMeta.hindiTitle || ''}) notes, PDF, VVI questions, and online test at RK Study Centre.`;

      const breadcrumbs: BreadcrumbItem[] = [
        { name: 'Home', url: `${cleanBase}/` },
        { name: sectionRootLabel, url: `${cleanBase}/${rootSection}` },
        { name: classMeta.name, url: `${cleanBase}/${rootSection}/${classMeta.id}` },
        { name: `${subjectMeta.name} (${subjectMeta.hindiName})`, url: `${cleanBase}/${rootSection}/${classMeta.id}/${subjectMeta.slug}` },
        { name: `Ch ${chapterMeta.chapterNumber}: ${chapterMeta.title}`, url: canonicalUrl },
      ];
      const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);
      const learningSchema = buildLearningResourceSchema({
        name: `${classMeta.name} ${subjectMeta.name} Chapter ${chapterMeta.chapterNumber}: ${chapterMeta.title} (${chapterMeta.hindiTitle || ''})`,
        description,
        url: canonicalUrl,
        cleanBase,
        educationalLevel: classMeta.name,
        learningResourceType: rootSection === 'tests' ? 'Chapter Practice Test' : 'Chapter Study Notes',
        aboutName: `${subjectMeta.name} - ${chapterMeta.title}`,
      });

      const materials = STUDY_MATERIALS.filter(
        (m) => m.chapterId === chapterMeta!.id || m.subjectId === subjectMeta.id
      ).slice(0, 8);
      const chapterTests = TESTS.filter((t) => t.chapterId === chapterMeta!.id).slice(0, 6);

      const prerenderHtml = buildPrerenderShell({
        h1: `${classMeta.name} ${subjectMeta.name} — अध्याय ${chapterMeta.chapterNumber}: ${chapterMeta.title} (${chapterMeta.hindiTitle || ''})`,
        subtitle: description,
        breadcrumbs,
        bodySectionsHtml: `
          <section class="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <h2 class="text-xl font-black text-slate-900">अध्ययन सामग्री एवं नोट्स (Chapter Study Material &amp; Notes)</h2>
            ${
              materials.length > 0
                ? `<ul class="space-y-2 text-sm">
                    ${materials
                      .map(
                        (m) => `<li class="p-3 rounded-xl border border-slate-200">
                          <strong class="text-slate-900">${escapeHtml(m.title)} (${escapeHtml(m.fileFormat || m.type)})</strong>
                          ${m.description ? `<p class="text-xs text-slate-600 mt-1">${escapeHtml(m.description)}</p>` : ''}
                        </li>`
                      )
                      .join('\n')}
                  </ul>`
                : `<p class="text-sm text-slate-700">${escapeHtml(classMeta.name)} ${escapeHtml(subjectMeta.name)} के इस अध्याय के विस्तृत नोट्स, मुख्य बिंदु और अभ्यास प्रश्न उपलब्ध हैं।</p>`
            }
            ${
              chapterTests.length > 0
                ? `<h3 class="text-lg font-bold text-slate-900 pt-3">ऑनलाइन मॉक टेस्ट (Chapter Online Tests)</h3>
                  <ul class="space-y-2 text-sm">
                    ${chapterTests
                      .map(
                        (t) => `<li class="p-3 rounded-xl border border-slate-200 font-semibold text-blue-800">${escapeHtml(t.title)} (${t.totalQuestions} Questions, ${t.durationMinutes} Mins)</li>`
                      )
                      .join('\n')}
                  </ul>`
                : ''
            }
          </section>
        `,
      });

      return {
        statusCode: 200,
        title,
        description,
        canonicalUrl,
        robots: 'index, follow',
        ogType: 'article',
        ogImage,
        breadcrumbs,
        jsonLdSchemas: [
          ...baseSchemas,
          ...(breadcrumbSchema ? [breadcrumbSchema] : []),
          learningSchema,
        ],
        prerenderHtml,
      };
    }

    // 5B. SUBJECT LEVEL SEO
    if (subjectMeta) {
      const canonicalPath = `/${rootSection}/${classMeta.id}/${subjectMeta.slug}`;
      const canonicalUrl = `${cleanBase}${canonicalPath}`;
      const title = `${classMeta.name} ${subjectMeta.name} (${subjectMeta.hindiName}) Notes & VVI Questions | RK Study Centre`;
      const description = `${classMeta.name} ${subjectMeta.name} (${subjectMeta.hindiName}) chapter-wise notes, PDF study material, VVI questions, and online mock tests at RK Study Centre. ${subjectMeta.description}`;

      const breadcrumbs: BreadcrumbItem[] = [
        { name: 'Home', url: `${cleanBase}/` },
        { name: sectionRootLabel, url: `${cleanBase}/${rootSection}` },
        { name: classMeta.name, url: `${cleanBase}/${rootSection}/${classMeta.id}` },
        { name: `${subjectMeta.name} (${subjectMeta.hindiName})`, url: canonicalUrl },
      ];
      const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);
      const learningSchema = buildLearningResourceSchema({
        name: `${classMeta.name} ${subjectMeta.name} (${subjectMeta.hindiName}) Complete Study Portal`,
        description,
        url: canonicalUrl,
        cleanBase,
        educationalLevel: classMeta.name,
        learningResourceType: 'Subject Curriculum & Notes',
        aboutName: `${classMeta.name} ${subjectMeta.name}`,
      });

      const chaptersHtml = chaptersForSubject
        .map((ch) => {
          const bk = booksForSubject.find((b) => b.id === ch.bookId) || booksForSubject[0];
          const bkSlug = bk ? bk.slug : 'ncert';
          return `<li class="p-3 rounded-xl border border-slate-200">
            <a href="/${rootSection}/${classMeta.id}/${subjectMeta.slug}/${bkSlug}/${ch.slug}" class="font-bold text-blue-800 hover:underline">
              अध्याय ${ch.chapterNumber}: ${escapeHtml(ch.title)} (${escapeHtml(ch.hindiTitle || '')})
            </a>
            ${ch.summary ? `<p class="text-xs text-slate-600 mt-1">${escapeHtml(ch.summary)}</p>` : ''}
          </li>`;
        })
        .join('\n');

      const prerenderHtml = buildPrerenderShell({
        h1: `${classMeta.name} ${subjectMeta.name} (${subjectMeta.hindiName}) — Chapter-Wise Notes, Books & Online Tests`,
        subtitle: description,
        breadcrumbs,
        bodySectionsHtml: `
          <section class="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h2 class="text-xl font-black text-slate-900">सभी अध्याय (${chaptersForSubject.length} Chapters in ${escapeHtml(subjectMeta.name)})</h2>
            <ul class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">${chaptersHtml}</ul>
          </section>
        `,
      });

      return {
        statusCode: 200,
        title,
        description,
        canonicalUrl,
        robots: 'index, follow',
        ogType: 'website',
        ogImage,
        breadcrumbs,
        jsonLdSchemas: [
          ...baseSchemas,
          ...(breadcrumbSchema ? [breadcrumbSchema] : []),
          learningSchema,
        ],
        prerenderHtml,
      };
    }

    // 5C. CLASS LEVEL SEO
    const canonicalPath = `/${rootSection}/${classMeta.id}`;
    const canonicalUrl = `${cleanBase}${canonicalPath}`;
    const title = `${classMeta.name} (${classMeta.hindiName}) Online Study, Notes & Mock Tests | RK Study Centre`;
    const description = `${classMeta.description} Access ${classMeta.name} subject-wise notes, PDF study material, VVI questions, and online mock tests at RK Study Centre.`;

    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Home', url: `${cleanBase}/` },
      { name: sectionRootLabel, url: `${cleanBase}/${rootSection}` },
      { name: `${classMeta.name} (${classMeta.hindiName})`, url: canonicalUrl },
    ];
    const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);
    const learningSchema = buildLearningResourceSchema({
      name: `${classMeta.name} (${classMeta.hindiName}) Online Study & Notes`,
      description,
      url: canonicalUrl,
      cleanBase,
      educationalLevel: classMeta.name,
      learningResourceType: 'Class Curriculum Portal',
    });

    const subjectsHtml = subjectsForClass
      .map(
        (sub) => `<li class="p-4 rounded-xl border border-slate-200 space-y-1">
          <h3 class="font-bold text-blue-800">
            <a href="/${rootSection}/${classMeta.id}/${sub.slug}" class="hover:underline">${escapeHtml(sub.name)} (${escapeHtml(sub.hindiName)})</a>
          </h3>
          <p class="text-xs text-slate-600">${escapeHtml(sub.description)}</p>
        </li>`
      )
      .join('\n');

    const prerenderHtml = buildPrerenderShell({
      h1: `${classMeta.name} (${classMeta.hindiName}) — सभी विषय, अध्याय-वार नोट्स एवं ऑनलाइन टेस्ट`,
      subtitle: description,
      breadcrumbs,
      bodySectionsHtml: `
        <section class="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <h2 class="text-xl font-black text-slate-900">${escapeHtml(classMeta.name)} के विषय (${subjectsForClass.length} Subjects)</h2>
          <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">${subjectsHtml}</ul>
        </section>
      `,
    });

    return {
      statusCode: 200,
      title,
      description,
      canonicalUrl,
      robots: 'index, follow',
      ogType: 'website',
      ogImage,
      breadcrumbs,
      jsonLdSchemas: [
        ...baseSchemas,
        ...(breadcrumbSchema ? [breadcrumbSchema] : []),
        learningSchema,
      ],
      prerenderHtml,
    };
  }

  // 6. Special Existing Marathon Routes in App.tsx
  if (
    pathname === '/physics12-ch01-marathon' ||
    pathname === '/physics-ch02-marathon' ||
    pathname === '/physics-marathon' ||
    pathname === '/akhand-marathon' ||
    pathname === '/history-marathon' ||
    pathname === '/mahamarathon'
  ) {
    const canonicalUrl = `${cleanBase}${pathname}`;
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Home', url: `${cleanBase}/` },
      { name: 'Live Marathon Objective Test', url: canonicalUrl },
    ];
    return {
      statusCode: 200,
      title: 'Live 300 VVI Objective Marathon Test | RK Study Centre',
      description:
        'Attempt the 300 VVI Objective Questions Live Marathon Test for Bihar Board & NCERT exam preparation on RK Study Centre.',
      canonicalUrl,
      robots: 'index, follow',
      ogType: 'website',
      ogImage,
      breadcrumbs,
      jsonLdSchemas: baseSchemas,
      prerenderHtml: buildPrerenderShell({
        h1: 'Live 300 VVI Objective Questions Marathon Test — RK Study Centre',
        subtitle: 'Attempt the 300 VVI Objective Questions Live Marathon Test for Bihar Board & NCERT exam preparation.',
        breadcrumbs,
        bodySectionsHtml: '',
      }),
    };
  }

  // 7. Unknown / Invalid Public URL -> True 404 Not Found
  return buildNotFoundSeo(pathname, cleanBase, ogImage);
}

function buildNotFoundSeo(pathname: string, cleanBase: string, ogImage: string): RouteSeoData {
  return {
    statusCode: 404,
    title: '404 Page Not Found | RK Study Centre',
    description: 'The requested page could not be found on RK Study Centre.',
    canonicalUrl: `${cleanBase}${pathname}`,
    robots: 'noindex, nofollow',
    ogType: 'website',
    ogImage,
    breadcrumbs: [{ name: 'Home', url: `${cleanBase}/` }],
    jsonLdSchemas: [],
    prerenderHtml: buildPrerenderShell({
      h1: '404 — यह पृष्ठ उपलब्ध नहीं है (Page Not Found)',
      subtitle: 'आपके द्वारा खोजा गया वेब पता (URL) RK Study Centre पर उपलब्ध नहीं है। कृपया मुख्य पृष्ठ या नीचे दिए गए शैक्षणिक लिंक्स का उपयोग करें।',
      breadcrumbs: [{ name: 'Home', url: `${cleanBase}/` }],
      bodySectionsHtml: '',
    }),
  };
}

/**
 * Generates comprehensive XML Sitemap containing ONLY genuine existing public pages,
 * high-intent search landing routes, classes, subjects, and high-value chapters.
 * Automatically stays in sync when new subjects or chapters are added to constants.ts.
 */
export function generateSitemapXml(baseUrl: string = DEFAULT_BASE_URL): string {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const today = new Date().toISOString().split('T')[0];

  const entries: { loc: string; priority: string; changefreq: string }[] = [
    { loc: `${cleanBase}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${cleanBase}/classes`, priority: '0.95', changefreq: 'weekly' },
    { loc: `${cleanBase}/study-material`, priority: '0.95', changefreq: 'daily' },
    { loc: `${cleanBase}/tests`, priority: '0.95', changefreq: 'daily' },
    { loc: `${cleanBase}/courses`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${cleanBase}/formula-bank`, priority: '0.85', changefreq: 'weekly' },
    { loc: `${cleanBase}/solve-doubt`, priority: '0.85', changefreq: 'weekly' },
    { loc: `${cleanBase}/omr-simulator`, priority: '0.85', changefreq: 'weekly' },
    { loc: `${cleanBase}/science-lab`, priority: '0.85', changefreq: 'weekly' },
    { loc: `${cleanBase}/study-tracker`, priority: '0.75', changefreq: 'weekly' },
    { loc: `${cleanBase}/vlogs`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${cleanBase}/about-us`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${cleanBase}/faq`, priority: '0.75', changefreq: 'monthly' },
    { loc: `${cleanBase}/contact-support`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${cleanBase}/policies`, priority: '0.6', changefreq: 'monthly' },
  ];

  // Note: SEO_LANDING_ALIASES are excluded from sitemap.xml because their canonicalUrl points
  // to the authoritative hierarchical routes (/study-material/class-10/math, etc.) included below.

  // Add Class, Subject, and Key Chapter URLs from CLASSES_METADATA, SUBJECTS, BOOKS, CHAPTERS
  for (const cls of CLASSES_METADATA) {
    entries.push({
      loc: `${cleanBase}/classes/${cls.id}`,
      priority: '0.9',
      changefreq: 'weekly',
    });
    entries.push({
      loc: `${cleanBase}/study-material/${cls.id}`,
      priority: '0.9',
      changefreq: 'weekly',
    });
    entries.push({
      loc: `${cleanBase}/tests/${cls.id}`,
      priority: '0.85',
      changefreq: 'weekly',
    });

    const subjects = SUBJECTS.filter((s) => s.classLevel === cls.id);
    for (const sub of subjects) {
      entries.push({
        loc: `${cleanBase}/classes/${cls.id}/${sub.slug}`,
        priority: '0.85',
        changefreq: 'weekly',
      });
      entries.push({
        loc: `${cleanBase}/study-material/${cls.id}/${sub.slug}`,
        priority: '0.85',
        changefreq: 'weekly',
      });

      // Include Class 10 & Class 12 chapters and chapters with direct study material/notes
      const booksForSub = BOOKS.filter((b) => b.subjectId === sub.id);
      const chaptersForSub = CHAPTERS.filter((ch) => ch.subjectId === sub.id);
      if (cls.id === 'class-10' || cls.id === 'class-12') {
        for (const ch of chaptersForSub.slice(0, 15)) {
          const bk = booksForSub.find((b) => b.id === ch.bookId) || booksForSub[0];
          const bkSlug = bk ? bk.slug : 'ncert';
          entries.push({
            loc: `${cleanBase}/study-material/${cls.id}/${sub.slug}/${bkSlug}/${ch.slug}`,
            priority: '0.8',
            changefreq: 'weekly',
          });
        }
      }
    }
  }

  const uniqueMap = new Map<string, { loc: string; priority: string; changefreq: string }>();
  for (const item of entries) {
    if (!uniqueMap.has(item.loc)) {
      uniqueMap.set(item.loc, item);
    }
  }

  const urlNodes = Array.from(uniqueMap.values())
    .map(
      (u) => `  <url>
    <loc>${escapeHtml(u.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlNodes}
</urlset>`;
}

/**
 * Injects route-specific SEO tags, canonical link, Open Graph, Twitter large card, JSON-LD,
 * and semantic prerendered HTML into index.html template for Googlebot and initial render.
 */
export function injectSeoIntoHtml(
  templateHtml: string,
  rawPath: string,
  baseUrl: string = DEFAULT_BASE_URL
): {
  html: string;
  statusCode: 200 | 404;
} {
  const seo = resolveSeoMetadata(rawPath, baseUrl);

  const jsonLdScripts = seo.jsonLdSchemas
    .map(
      (schema) =>
        `<script type="application/ld+json" data-rk-seo="true">${JSON.stringify(schema)}</script>`
    )
    .join('\n    ');

  const seoHeadBlock = `
    <title>${escapeHtml(seo.title)}</title>
    <meta name="description" content="${escapeHtml(seo.description)}" />
    <meta name="robots" content="${seo.robots}" />
    <link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}" />
    <meta property="og:site_name" content="RK Study Centre" />
    <meta property="og:locale" content="hi_IN" />
    <meta property="og:type" content="${seo.ogType}" />
    <meta property="og:title" content="${escapeHtml(seo.title)}" />
    <meta property="og:description" content="${escapeHtml(seo.description)}" />
    <meta property="og:url" content="${escapeHtml(seo.canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtml(seo.ogImage)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(seo.title)}" />
    <meta name="twitter:description" content="${escapeHtml(seo.description)}" />
    <meta name="twitter:image" content="${escapeHtml(seo.ogImage)}" />
    ${jsonLdScripts}
  `.trim();

  let updatedHtml = templateHtml;
  if (
    updatedHtml.includes('<!-- SEO_HEAD_START -->') &&
    updatedHtml.includes('<!-- SEO_HEAD_END -->')
  ) {
    updatedHtml = updatedHtml.replace(
      /<!-- SEO_HEAD_START -->[\s\S]*?<!-- SEO_HEAD_END -->/,
      `<!-- SEO_HEAD_START -->\n    ${seoHeadBlock}\n    <!-- SEO_HEAD_END -->`
    );
  } else {
    updatedHtml = updatedHtml.replace(/<title>[\s\S]*?<\/title>/, seoHeadBlock);
  }

  if (seo.prerenderHtml) {
    updatedHtml = updatedHtml.replace(
      /<div id="root">[\s\S]*?<\/div>/,
      `<div id="root">${seo.prerenderHtml}</div>`
    );
  }

  return {
    html: updatedHtml,
    statusCode: seo.statusCode,
  };
}

/**
 * Client-side DOM updater for SPA route transitions
 */
export function applyClientSeo(rawPath: string): RouteSeoData {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : DEFAULT_BASE_URL;
  const seo = resolveSeoMetadata(rawPath, origin);

  if (typeof document === 'undefined') {
    return seo;
  }

  document.title = seo.title;

  const setMeta = (
    selector: string,
    attrName: 'name' | 'property',
    attrValue: string,
    content: string
  ) => {
    let el = document.head.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('meta[name="description"]', 'name', 'description', seo.description);
  setMeta('meta[name="robots"]', 'name', 'robots', seo.robots);
  setMeta('meta[property="og:title"]', 'property', 'og:title', seo.title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', seo.description);
  setMeta('meta[property="og:url"]', 'property', 'og:url', seo.canonicalUrl);
  setMeta('meta[property="og:type"]', 'property', 'og:type', seo.ogType);
  setMeta('meta[property="og:image"]', 'property', 'og:image', seo.ogImage);
  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', seo.title);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', seo.description);
  setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', seo.ogImage);

  let canonicalEl = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', seo.canonicalUrl);

  const oldScripts = document.head.querySelectorAll('script[data-rk-seo="true"]');
  oldScripts.forEach((s) => s.remove());

  for (const schema of seo.jsonLdSchemas) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-rk-seo', 'true');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  return seo;
}
