import {
  GraduationCap,
  Target,
  BookOpen,
  Award,
  Layers,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  FileText,
  Clock,
  HelpCircle,
  Mail,
  Info
} from 'lucide-react';
import type { MainNavRoute, ClassLevel, MoreSectionTab } from '../types';
import { BackButton } from '../components/BackButton';

interface AboutUsViewProps {
  onNavigate: (route: MainNavRoute, params?: { classLevel?: ClassLevel; moreTab?: MoreSectionTab }) => void;
}

export function AboutUsView({ onNavigate }: AboutUsViewProps) {
  return (
    <div className="py-8 sm:py-12 space-y-12 sm:space-y-16 max-w-5xl mx-auto">
      {/* शीर्ष नेविगेशन बार एवं बैक बटन */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <BackButton label="मुख्य पृष्ठ (Home) पर वापस जाएं" fallbackRoute="home" onNavigate={onNavigate} />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-900 text-xs sm:text-sm font-black">
          <Info className="w-4 h-4 text-blue-700 shrink-0" />
          <span>स्वतंत्र डिजिटल शैक्षणिक मंच</span>
        </div>
      </div>

      {/* मुख्य बैनर एवं परिचय (Header Hero) */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-md shrink-0">
            <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs sm:text-sm font-black text-blue-700 uppercase tracking-wider">
              आधिकारिक परिचय • ABOUT US
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              हमारे बारे में (About Us)
            </h1>
            <p className="text-base sm:text-xl font-bold text-slate-600">
              RK STUDY CENTRE — माध्यमिक एवं उच्च माध्यमिक विद्यार्थियों के लिए सुव्यवस्थित अध्ययन पोर्टल
            </p>
          </div>
        </div>

        <div className="border-t-2 border-slate-100 pt-6">
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            <strong className="font-black text-slate-900">RK STUDY CENTRE</strong> में आपका स्वागत है। 
            यह मंच विशेष रूप से माध्यमिक और उच्च माध्यमिक स्तर (कक्षा 9वीं, 10वीं, 11वीं और 12वीं) के 
            विद्यार्थियों को उनकी पढ़ाई, स्वाध्याय और परीक्षा की तैयारी को व्यवस्थित, प्रभावी और सुलभ बनाने के लिए विकसित किया गया है।
          </p>
        </div>
      </section>

      {/* 1. RK STUDY CENTRE क्या है */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 border-2 border-blue-200 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            1. RK STUDY CENTRE क्या है
          </h2>
        </div>

        <div className="space-y-4 text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
          <p>
            <strong className="font-black text-slate-900">RK STUDY CENTRE</strong> एक स्वतंत्र ऑनलाइन शैक्षणिक शिक्षण मंच 
            (Independent Educational Learning Platform) है। हमारा प्राथमिक कार्य कक्षा 9वीं से 12वीं तक के विद्यार्थियों को 
            गुणवत्तापूर्ण अध्ययन सामग्री, अध्यायवार हस्तलिखित एवं डिजिटल नोट्स, पिछले वर्षों के प्रश्न पत्र (PYQs) और वस्तुनिष्ठ 
            ऑनलाइन टेस्ट श्रृंखला एक ही स्थान पर उपलब्ध कराना है।
          </p>
          <p>
            हमारा लक्ष्य यह सुनिश्चित करना है कि किसी भी विद्यार्थी की पढ़ाई संसाधनों की अनुपलब्धता या जटिलता के कारण बाधित न हो। 
            विद्यार्थी अपनी कक्षा के अनुसार सही पाठ्यक्रम सामग्री आसानी से ढूंढ सकें और समयबद्ध अभ्यास कर सकें।
          </p>

          {/* कानूनी व पारदर्शी स्पष्टीकरण (Mandatory Disclaimer) */}
          <div className="p-6 rounded-2xl bg-amber-50/80 border-2 border-amber-200 space-y-2.5 text-amber-950 mt-4">
            <div className="flex items-center gap-2.5 font-black text-base sm:text-lg text-amber-900">
              <ShieldCheck className="w-5 h-5 text-amber-700 stroke-[2.5] shrink-0" />
              <span>महत्वपूर्ण सूचना एवं अस्वीकरण (Transparency & Disclaimer)</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-amber-900/90 leading-relaxed">
              <strong>RK STUDY CENTRE</strong> एक निजी और स्वतंत्र शैक्षणिक शिक्षण मंच है। यह किसी भी सरकारी विभाग, 
              बिहार विद्यालय परीक्षा समिति (BSEB), अथवा किसी भी सरकारी बोर्ड से आधिकारिक रूप से संबद्ध, मान्यता प्राप्त, 
              प्रमाणित या सरकारी स्वामित्व वाली संस्था नहीं है। हमारा उद्देश्य केवल विद्यार्थियों के व्यक्तिगत स्वाध्याय, 
              अभ्यास और शैक्षणिक मार्गदर्शन के लिए उपयोगी सामग्री प्रदान करना है।
            </p>
          </div>
        </div>
      </section>

      {/* 2. हमारा उद्देश्य */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-800 border-2 border-indigo-200 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            2. हमारा उद्देश्य
          </h2>
        </div>

        <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
          हमारा मुख्य उद्देश्य प्रत्येक विद्यार्थी तक सरल, स्पष्ट और परीक्षा-उपयोगी अध्ययन संसाधन पहुंचाना है। 
          हमारा प्रयास है कि ग्रामीण एवं शहरी दोनों क्षेत्रों के विद्यार्थियों को समान रूप से उत्कृष्ट अध्ययन सामग्री मिले।
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2.5">
            <h3 className="text-lg sm:text-xl font-black text-blue-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.5] shrink-0" />
              <span>सरल और स्पष्ट भाषा</span>
            </h3>
            <p className="text-base font-medium text-slate-700 leading-relaxed">
              कठिन और जटिल अवधारणाओं को आसान हिंदी भाषा और मुख्य सूत्रों के माध्यम से प्रस्तुत करना, ताकि हर छात्र आसानी से याद रख सके।
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2.5">
            <h3 className="text-lg sm:text-xl font-black text-blue-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.5] shrink-0" />
              <span>परीक्षा का भय दूर करना</span>
            </h3>
            <p className="text-base font-medium text-slate-700 leading-relaxed">
              समयबद्ध मॉक टेस्ट और बहुविकल्पीय प्रश्नोत्तरी के माध्यम से विद्यार्थियों में परीक्षा के प्रति आत्मविश्वास जगाना।
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2.5">
            <h3 className="text-lg sm:text-xl font-black text-blue-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.5] shrink-0" />
              <span>स्वाध्याय (Self-Study) का सशक्तिकरण</span>
            </h3>
            <p className="text-base font-medium text-slate-700 leading-relaxed">
              अध्यायवार सारांश और महत्वपूर्ण प्रश्नों द्वारा विद्यार्थियों को स्वयं पढ़ने और अपने समय का सही सदुपयोग करने में सक्षम बनाना।
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2.5">
            <h3 className="text-lg sm:text-xl font-black text-blue-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.5] shrink-0" />
              <span>समय एवं ऊर्जा की बचत</span>
            </h3>
            <p className="text-base font-medium text-slate-700 leading-relaxed">
              इंटरनेट पर इधर-उधर भटकने के बजाय सभी आवश्यक नोट्स, गाइड और टेस्ट एक ही सुव्यवस्थित प्लेटफॉर्म पर उपलब्ध कराना।
            </p>
          </div>
        </div>
      </section>

      {/* 3. विद्यार्थियों के लिए सुविधाएँ */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 border-2 border-emerald-200 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            3. विद्यार्थियों के लिए सुविधाएँ
          </h2>
        </div>

        <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
          RK STUDY CENTRE विद्यार्थियों की दैनिक अध्ययन आवश्यकताओं को ध्यान में रखकर तैयार किया गया है। 
          यहाँ निम्नलिखित प्रमुख सुविधाएँ दी गई हैं:
        </p>

        <div className="space-y-4 pt-2">
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-base shrink-0">
              01
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                कक्षावार स्वतंत्र पोर्टल व्यवस्था
              </h3>
              <p className="text-base font-medium text-slate-700 leading-relaxed">
                कक्षा 9वीं, 10वीं, 11वीं और 12वीं के लिए स्वतंत्र अनुभाग हैं। प्रत्येक कक्षा का पाठ्यक्रम, 
                विषय सूची, नोट्स और टेस्ट पूरी तरह अलग हैं, जिससे विद्यार्थियों को किसी प्रकार की उलझन नहीं होती।
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-base shrink-0">
              02
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                तुरंत ऑनलाइन टेस्ट और परिणाम विश्लेषण
              </h3>
              <p className="text-base font-medium text-slate-700 leading-relaxed">
                विद्यार्थी कभी भी अध्यायवार अथवा विषयवार ऑनलाइन टेस्ट दे सकते हैं। टेस्ट समाप्त होते ही प्राप्तांक, 
                सही उत्तर और गलत उत्तरों का विस्तृत विवरण तुरंत स्क्रीन पर दिखाई देता है।
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-base shrink-0">
              03
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                हस्तलिखित नोट्स एवं मुद्रित अध्ययन सामग्री
              </h3>
              <p className="text-base font-medium text-slate-700 leading-relaxed">
                अनुभवी शिक्षकों के मार्गदर्शन में तैयार किए गए संक्षिप्त, सटीक और परीक्षा केंद्रित हस्तलिखित नोट्स 
                विद्यार्थियों के त्वरित रिवीज़न के लिए उपलब्ध हैं।
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-base shrink-0">
              04
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                सभी उपकरणों (Mobile, Tablet, Laptop) पर सुचारू कार्य
              </h3>
              <p className="text-base font-medium text-slate-700 leading-relaxed">
                यह मंच मोबाइल फोन, टैबलेट, आईपैड, लैपटॉप और डेस्कटॉप कंप्यूटर सभी स्क्रीन आकारों पर सहजता से खुलता है 
                और तीव्र गति से काम करता है।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. अध्ययन सामग्री */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 border-2 border-amber-200 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            4. अध्ययन सामग्री
          </h2>
        </div>

        <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
          RK STUDY CENTRE पर अध्ययन सामग्री को विद्यार्थियों की सुविधा के लिए चार मुख्य श्रेणियों में वर्गीकृत किया गया है:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3">
            <div className="flex items-center gap-2.5 text-blue-800 font-black text-lg">
              <BookOpen className="w-5 h-5 text-blue-700 stroke-[2.5]" />
              <span>अध्यायवार विस्तृत नोट्स</span>
            </div>
            <p className="text-base font-medium text-slate-700 leading-relaxed">
              प्रत्येक पाठ की मुख्य परिभाषाएं, सिद्धांत, गणितीय सूत्र, विज्ञान के प्रयोग, और सामाजिक विज्ञान की 
              महत्वपूर्ण ऐतिहासिक तिथियों का व्यवस्थित संकलन।
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3">
            <div className="flex items-center gap-2.5 text-blue-800 font-black text-lg">
              <FileText className="w-5 h-5 text-blue-700 stroke-[2.5]" />
              <span>पाठ्यपुस्तकें एवं PDF गाइड</span>
            </div>
            <p className="text-base font-medium text-slate-700 leading-relaxed">
              NCERT और राज्य शिक्षा बोर्ड के नवीनतम पाठ्यक्रम के अनुरूप स्वीकृत पाठ्यपुस्तकों के अध्यायवार 
              प्रश्न-उत्तर और विस्तृत समाधान।
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3">
            <div className="flex items-center gap-2.5 text-blue-800 font-black text-lg">
              <Award className="w-5 h-5 text-blue-700 stroke-[2.5]" />
              <span>विगत वर्षों के प्रश्न बैंक (PYQ)</span>
            </div>
            <p className="text-base font-medium text-slate-700 leading-relaxed">
              पिछले 10 वर्षों में बोर्ड परीक्षाओं में पूछे गए वस्तुनिष्ठ एवं विषयनिष्ठ प्रश्नों का संग्रह, 
              जिससे विद्यार्थियों को परीक्षा के स्तर का सटीक ज्ञान होता है।
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3">
            <div className="flex items-center gap-2.5 text-blue-800 font-black text-lg">
              <Sparkles className="w-5 h-5 text-blue-700 stroke-[2.5]" />
              <span>मॉडल प्रश्न पत्र एवं अभ्यास सेट</span>
            </div>
            <p className="text-base font-medium text-slate-700 leading-relaxed">
              आगामी बोर्ड परीक्षाओं के नवीनतम पैटर्न के अनुसार तैयार किए गए मॉडल पेपर्स, जिससे विद्यार्थी 
              समय प्रबंधन और उत्तर लेखन का अभ्यास कर सकें।
            </p>
          </div>
        </div>
      </section>

      {/* 5. ऑनलाइन टेस्ट और प्रश्नोत्तरी */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-800 border-2 border-purple-200 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            5. ऑनलाइन टेस्ट और प्रश्नोत्तरी
          </h2>
        </div>

        <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
          स्व-मूल्यांकन (Self-Assessment) परीक्षा में अच्छे अंक लाने की सबसे महत्वपूर्ण कुंजी है। 
          RK STUDY CENTRE पर आधुनिक ऑनलाइन टेस्टिंग प्रणाली उपलब्ध है:
        </p>

        <div className="space-y-4 pt-2">
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-700 stroke-[2.5]" />
              <span>समयबद्ध वस्तुनिष्ठ टेस्ट (Timed Objective Tests)</span>
            </h3>
            <p className="text-base font-medium text-slate-700 leading-relaxed">
              प्रत्येक टेस्ट में प्रश्नों की संख्या के अनुसार समय सीमा निर्धारित रहती है। इससे विद्यार्थी 
              वास्तविक परीक्षा जैसा माहौल अनुभव करते हैं और अपनी गति सुधारते हैं।
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
              <span>तुरंत स्कोर और प्राप्तांक विश्लेषण</span>
            </h3>
            <p className="text-base font-medium text-slate-700 leading-relaxed">
              टेस्ट सबमिट करते ही विद्यार्थी को उसका कुल प्राप्तांक, सही प्रश्नों की संख्या, गलत प्रश्नों की संख्या 
              और पास/फेल की स्थिति स्पष्ट रूप से दिखाई देती है।
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-700 stroke-[2.5]" />
              <span>उत्तर समीक्षा (Review Answers)</span>
            </h3>
            <p className="text-base font-medium text-slate-700 leading-relaxed">
              विद्यार्थी टेस्ट समाप्त होने के बाद यह देख सकते हैं कि किस प्रश्न का क्या सही उत्तर था और उनसे 
              कहाँ चूक हुई। इससे दोबारा वही गलती नहीं होती।
            </p>
          </div>
        </div>
      </section>

      {/* 6. पाठ्यक्रम और कक्षा-आधारित सामग्री */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-800 border-2 border-cyan-200 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            6. पाठ्यक्रम और कक्षा-आधारित सामग्री
          </h2>
        </div>

        <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
          प्रत्येक कक्षा का शैक्षणिक स्तर और परीक्षा का प्रारूप अलग होता है। इसी कारण हमने प्रत्येक कक्षा 
          के लिए अलग-अलग विशिष्ट पाठ्यक्रम व्यवस्था की है:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          {/* कक्षा 9वीं */}
          <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-100 text-blue-900">
                CLASS 9
              </span>
              <span className="text-xs font-bold text-slate-500">माध्यमिक आधार</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">
              कक्षा 9वीं (Class 9)
            </h3>
            <p className="text-base font-medium text-slate-700 leading-relaxed">
              गणित, विज्ञान, सामाजिक विज्ञान, हिंदी, संस्कृत और अंग्रेजी की आधारभूत समझ को सुदृढ़ करने 
              हेतु बुनियादी पाठ्य सामग्री एवं अभ्यास प्रश्न।
            </p>
          </div>

          {/* कक्षा 10वीं */}
          <div className="p-6 rounded-2xl bg-blue-50/70 border-2 border-blue-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-700 text-white">
                CLASS 10 • मैट्रिक बोर्ड
              </span>
              <span className="text-xs font-extrabold text-blue-800">मुख्य बोर्ड परीक्षा</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">
              कक्षा 10वीं (मैट्रिक बोर्ड)
            </h3>
            <p className="text-base font-medium text-slate-700 leading-relaxed">
              मैट्रिक बोर्ड परीक्षा में शत-प्रतिशत सफलता के लिए अध्यायवार वस्तुनिष्ठ प्रश्न बैंक, 
              दीर्घ उत्तरीय प्रश्न, 10 वर्षों के हल प्रश्न पत्र और विशेष मॉडल टेस्ट।
            </p>
          </div>

          {/* कक्षा 11वीं */}
          <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-200 text-slate-900">
                CLASS 11
              </span>
              <span className="text-xs font-bold text-slate-500">उच्च माध्यमिक प्रथम वर्ष</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">
              कक्षा 11वीं (इंटर प्रथम वर्ष)
            </h3>
            <p className="text-base font-medium text-slate-700 leading-relaxed">
              विज्ञान (भौतिकी, रसायन, गणित, जीवविज्ञान), कला और वाणिज्य संकाय की उच्च अवधारणाओं 
              को समझने हेतु विस्तृत नोट्स और विषयवार अभ्यास।
            </p>
          </div>

          {/* कक्षा 12वीं */}
          <div className="p-6 rounded-2xl bg-blue-50/70 border-2 border-blue-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-700 text-white">
                CLASS 12 • इंटर बोर्ड
              </span>
              <span className="text-xs font-extrabold text-blue-800">उच्च माध्यमिक बोर्ड</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">
              कक्षा 12वीं (इंटर बोर्ड)
            </h3>
            <p className="text-base font-medium text-slate-700 leading-relaxed">
              इंटरमीडिएट बोर्ड परीक्षा में सर्वोच्च अंक प्राप्त करने के लिए संकायवार फॉर्मूला बैंक, 
              अति-महत्वपूर्ण प्रश्नों के नोट्स, और गहन अभ्यास श्रृंखला।
            </p>
          </div>
        </div>
      </section>

      {/* 7. विद्यार्थियों के लिए हमारा लक्ष्य */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-800 border-2 border-rose-200 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            7. विद्यार्थियों के लिए हमारा लक्ष्य
          </h2>
        </div>

        <div className="space-y-4 text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
          <p>
            हमारा अंतिम लक्ष्य प्रत्येक विद्यार्थी को सफलता के शीर्ष तक पहुंचाना है। हम केवल नोट्स या टेस्ट 
            प्रदान करने तक सीमित नहीं हैं, बल्कि विद्यार्थी में अध्ययन के प्रति एक अनुशासित और सकारात्मक 
            दृष्टिकोण विकसित करना चाहते हैं।
          </p>
          <p>
            हमारा विश्वास है कि निरंतर अभ्यास और सही मार्गदर्शन से कोई भी सामान्य विद्यार्थी असाधारण 
            परिणाम प्राप्त कर सकता है। RK STUDY CENTRE विद्यार्थियों, अभिभावकों और शिक्षकों के बीच 
            एक विश्वसनीय सेतु के रूप में निरंतर कार्य करता रहेगा।
          </p>
        </div>

        {/* मुख्य प्रतिज्ञाएं */}
        <div className="border-t-2 border-slate-100 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-black text-2xl text-blue-700">100%</div>
            <div className="text-sm sm:text-base font-bold text-slate-800">पाठ्यक्रम अनुरूप सामग्री</div>
            <p className="text-xs sm:text-sm text-slate-500">नवीनतम परीक्षा पैटर्न पर आधारित</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-black text-2xl text-emerald-700">सुलभ</div>
            <div className="text-sm sm:text-base font-bold text-slate-800">आसान हिंदी माध्यम</div>
            <p className="text-xs sm:text-sm text-slate-500">सरल एवं स्पष्ट शब्दावली</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-black text-2xl text-indigo-700">विश्वसनीय</div>
            <div className="text-sm sm:text-base font-bold text-slate-800">सुरक्षित एवं पारदर्शी</div>
            <p className="text-xs sm:text-sm text-slate-500">विद्यार्थी सहायता हेतु समर्पित</p>
          </div>
        </div>
      </section>

      {/* संपर्क एवं त्वरित नेविगेशन कार्ड (Bottom CTA Card) */}
      <section className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-md space-y-6">
        <div className="space-y-3 max-w-2xl">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            RK STUDY CENTRE के साथ अपनी पढ़ाई आज ही शुरू करें
          </h3>
          <p className="text-slate-300 text-base sm:text-lg font-medium leading-relaxed">
            कक्षावार अध्ययन सामग्री देखें, ऑनलाइन टेस्ट देकर अपनी तैयारी परखें, अथवा सहायता हेतु हमारी टीम से संपर्क करें।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <a
            href="/"
            onClick={(e) => {
              // यदि इसी विंडो में नेविगेट करना चाहे
              e.preventDefault();
              onNavigate('home');
            }}
            className="px-6 py-3.5 rounded-2xl font-black text-base bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-2.5 cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            <span>मुख्य पृष्ठ (Home) पर जाएं</span>
          </a>

          <a
            href="/#classes"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('classes');
            }}
            className="px-6 py-3.5 rounded-2xl font-black text-base bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-2.5 cursor-pointer"
          >
            <span>कक्षावार सामग्री देखें</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </a>

          <a
            href="mailto:rkstudycentre064@gmail.com"
            className="px-6 py-3.5 rounded-2xl font-bold text-sm sm:text-base bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-blue-400" />
            <span>rkstudycentre064@gmail.com</span>
          </a>
        </div>
      </section>
    </div>
  );
}
