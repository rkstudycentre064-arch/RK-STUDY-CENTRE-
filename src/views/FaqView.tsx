import { useState, useMemo } from 'react';
import {
  HelpCircle,
  ChevronDown,
  Search,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  ArrowLeft,
  Mail,
  UserCheck,
  FileText,
  Award,
  Lock,
  PhoneCall,
  Sparkles,
  X
} from 'lucide-react';
import type { MainNavRoute, ClassLevel, MoreSectionTab } from '../types';
import { BackButton } from '../components/BackButton';
import { FAQ_PAGE_ITEMS as FAQ_DATA } from '../utils/seoManager';

interface FaqViewProps {
  onNavigate: (route: MainNavRoute, params?: { classLevel?: ClassLevel; moreTab?: MoreSectionTab }) => void;
}

type CategoryFilter = 'all' | 'general' | 'account' | 'study' | 'tests' | 'support';

export function FaqView({ onNavigate }: FaqViewProps) {
  // Accordion state: Set of open question IDs for multi-expansion or single toggle
  const [openIds, setOpenIds] = useState<Set<number>>(new Set([1, 2]));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  const toggleAccordion = (id: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setOpenIds(new Set((FAQ_DATA || []).map((item) => item.id)));
  };

  const collapseAll = () => {
    setOpenIds(new Set());
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.category === activeCategory;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="py-8 sm:py-12 space-y-10 sm:space-y-14 max-w-5xl mx-auto">
      {/* शीर्ष नेविगेशन बार एवं बैक बटन */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <BackButton label="मुख्य पृष्ठ (Home) पर वापस जाएं" fallbackRoute="home" onNavigate={onNavigate} />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-900 text-xs sm:text-sm font-black">
          <HelpCircle className="w-4 h-4 text-blue-700 shrink-0" />
          <span>सहायता एवं प्रश्नोत्तरी केंद्र</span>
        </div>
      </div>

      {/* मुख्य बैनर एवं परिचय */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-md shrink-0">
            <HelpCircle className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs sm:text-sm font-black text-blue-700 uppercase tracking-wider">
              FAQ & HELP CENTER • प्रश्नोत्तरी
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              प्रश्नोत्तरी / सहायता केंद्र
            </h1>
            <p className="text-base sm:text-xl font-bold text-slate-600">
              RK STUDY CENTRE पोर्टल के उपयोग, अकाउंट, नोट्स, टेस्ट और सहायता से जुड़े मुख्य प्रश्नों के उत्तर
            </p>
          </div>
        </div>

        <div className="border-t-2 border-slate-100 pt-6">
          <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
            विद्यार्थियों और अभिभावकों की सुविधा के लिए यहाँ सभी सामान्य प्रश्नों के विस्तृत और सरल उत्तर दिए गए हैं। 
            किसी भी प्रश्न पर क्लिक करके आप उसका उत्तर देख या छुपा सकते हैं।
          </p>
        </div>

        {/* सर्च एवं त्वरित श्रेणी फ़िल्टर */}
        <div className="space-y-4 pt-2">
          {/* सर्च बार */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="प्रश्न या विषय खोजें (उदा. Login, Password, Test, PDF, Class)..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-blue-700 focus:outline-none text-base font-semibold text-slate-800 placeholder:text-slate-400 bg-slate-50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                aria-label="खोज साफ़ करें"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* श्रेणी टैब्स */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2 text-sm sm:text-base">
              {[
                { id: 'all', label: 'सभी 20 प्रश्न' },
                { id: 'general', label: 'सामान्य' },
                { id: 'account', label: 'Account व Login' },
                { id: 'study', label: 'अध्ययन सामग्री' },
                { id: 'tests', label: 'टेस्ट व क्विज' },
                { id: 'support', label: 'सहायता व नीतियां' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as CategoryFilter)}
                  className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600">
              <button
                onClick={expandAll}
                className="hover:text-blue-700 underline underline-offset-2 cursor-pointer"
              >
                सभी खोलें
              </button>
              <span>•</span>
              <button
                onClick={collapseAll}
                className="hover:text-blue-700 underline underline-offset-2 cursor-pointer"
              >
                सभी बंद करें
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* अस्वीकरण / स्पष्टीकरण बॉक्स */}
      <section className="p-6 rounded-2xl bg-amber-50/90 border-2 border-amber-200 space-y-2 text-amber-950">
        <div className="flex items-center gap-2.5 font-black text-base sm:text-lg text-amber-900">
          <ShieldCheck className="w-5 h-5 text-amber-700 stroke-[2.5] shrink-0" />
          <span>पारदर्शिता एवं महत्वपूर्ण सूचना (Important Disclaimer)</span>
        </div>
        <p className="text-sm sm:text-base font-bold text-amber-900/90 leading-relaxed">
          <strong>RK STUDY CENTRE</strong> एक स्वतंत्र निजी शैक्षणिक अधिगम मंच (Independent Educational Learning Platform) है। 
          यह किसी भी सरकारी विभाग, बिहार विद्यालय परीक्षा समिति (BSEB) अथवा किसी भी सरकारी बोर्ड से आधिकारिक रूप से संबद्ध, 
          मान्यता प्राप्त या सरकारी स्वामित्व वाली संस्था नहीं है।
        </p>
      </section>

      {/* Accordion FAQ सूची */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            मुख्य प्रश्न एवं उत्तर ({filteredFaqs.length})
          </h2>
          {searchQuery && (
            <span className="text-xs sm:text-sm font-bold text-slate-500">
              "{searchQuery}" के परिणाम
            </span>
          )}
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border-2 border-slate-200 space-y-3">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg sm:text-xl font-bold text-slate-800">
              आपके द्वारा खोजे गए शब्द से संबंधित कोई प्रश्न नहीं मिला
            </h3>
            <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto">
              कृपया अन्य शब्द लिखकर खोजें अथवा नीचे "सभी 20 प्रश्न" टैब पर क्लिक करें।
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-700 text-white font-bold text-sm hover:bg-blue-800 transition-colors"
            >
              सभी प्रश्न पुनः देखें
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {(filteredFaqs || []).map((faq) => {
              const isOpen = openIds.has(faq.id);
              return (
                <div
                  key={faq.id}
                  id={`faq-item-${faq.id}`}
                  className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden transition-all shadow-2xs hover:border-slate-300"
                >
                  {/* प्रश्न बटन */}
                  <button
                    type="button"
                    onClick={() => toggleAccordion(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 cursor-pointer select-none transition-colors hover:bg-slate-50/80"
                  >
                    <span className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                      {faq.question}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? 'bg-blue-700 text-white rotate-180'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <ChevronDown className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  </button>

                  {/* उत्तर कार्ड */}
                  <div
                    className={
                      isOpen
                        ? 'px-5 sm:px-6 pb-6 pt-1 text-slate-700 border-t border-slate-100 bg-slate-50/50'
                        : 'hidden'
                    }
                  >
                    <p className="text-base sm:text-lg font-medium leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* अन्य सहायता एवं संपर्क कार्ड (Contact Support CTA) */}
      <section className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-md space-y-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-blue-300 uppercase tracking-wider">
            <Mail className="w-4 h-4" />
            <span>व्यक्तिगत सहायता</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            क्या आपका प्रश्न यहाँ नहीं मिला?
          </h3>
          <p className="text-slate-300 text-base sm:text-lg font-medium leading-relaxed">
            हमारी सहायता टीम हमेशा आपकी सहायता के लिए तैयार है। आप हमें ईमेल कर सकते हैं या संपर्क सहायता फॉर्म भर सकते हैं।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
            className="px-6 py-3.5 rounded-2xl font-black text-base bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-2.5 cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            <span>मुख्य पृष्ठ (Home) पर जाएं</span>
          </a>

          <a
            href="mailto:rkstudycentre064@gmail.com"
            className="px-6 py-3.5 rounded-2xl font-black text-base bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-2.5 cursor-pointer"
          >
            <Mail className="w-4 h-4 text-blue-300" />
            <span>rkstudycentre064@gmail.com</span>
          </a>

          <a
            href="/contact-support"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-2xl font-black text-base bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-2"
          >
            <span>संपर्क सहायता (Contact Support) ↗</span>
          </a>

          <a
            href="/about-us"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-2xl font-bold text-sm sm:text-base bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center gap-2"
          >
            <span>हमारे बारे में पढ़ें ↗</span>
          </a>
        </div>
      </section>
    </div>
  );
}
