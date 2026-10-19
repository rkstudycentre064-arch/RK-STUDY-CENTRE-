import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sparkles,
  Search,
  BookOpen,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  Trash2,
  MessageSquare,
  Copy,
  Check,
  ChevronRight,
  X,
  HelpCircle,
  AlertCircle,
  Clock,
  RotateCcw,
  Sliders,
  GraduationCap,
  Lightbulb,
  CheckSquare,
  Zap,
  Layers,
  FileQuestion,
  Plus,
  Edit3,
  Archive,
  Send,
  Menu,
  ChevronLeft
} from 'lucide-react';
import type { MainNavRoute } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  fetchUserConversations,
  fetchConversationMessages,
  createConversation,
  appendMessageToConversation,
  renameConversation,
  deleteConversation,
  toggleArchiveConversation,
  detectTopicFromText,
  type DoubtConversation,
  type DoubtMessage,
} from '../services/doubtConversationService';
import { DoubtConversationsSidebar } from '../components/doubt/DoubtConversationsSidebar';
import { DoubtChatThread } from '../components/doubt/DoubtChatThread';

interface DoubtSolveAIViewProps {
  onNavigate: (route: MainNavRoute, params?: any) => void;
  initialClassLevel?: string;
}

interface SavedDoubt {
  id: string;
  question: string;
  subject: string;
  classLevel: string;
  difficulty: string;
  solution: string;
  timestamp: string;
  image?: string;
}

// All academic and competitive levels supported per requirement
export const ACADEMIC_CLASSES = [
  { id: 'auto', name: '✨ ऑटो डिटेक्ट (Auto Detect)', label: '✨ ऑटो डिटेक्ट (Auto Detect)', level: 'auto' },
  { id: 'class-1', name: 'Class 1', label: 'कक्षा 1 (प्राथमिक स्तर)', level: 'primary' },
  { id: 'class-2', name: 'Class 2', label: 'कक्षा 2 (प्राथमिक स्तर)', level: 'primary' },
  { id: 'class-3', name: 'Class 3', label: 'कक्षा 3 (प्राथमिक स्तर)', level: 'primary' },
  { id: 'class-4', name: 'Class 4', label: 'कक्षा 4 (प्राथमिक स्तर)', level: 'primary' },
  { id: 'class-5', name: 'Class 5', label: 'कक्षा 5 (प्राथमिक स्तर)', level: 'primary' },
  { id: 'class-6', name: 'Class 6', label: 'कक्षा 6 (मिडिल स्कूल)', level: 'middle' },
  { id: 'class-7', name: 'Class 7', label: 'कक्षा 7 (मिडिल स्कूल)', level: 'middle' },
  { id: 'class-8', name: 'Class 8', label: 'कक्षा 8 (मिडिल स्कूल)', level: 'middle' },
  { id: 'class-9', name: 'Class 9', label: 'कक्षा 9वीं (माध्यमिक)', level: 'secondary' },
  { id: 'class-10', name: 'Class 10', label: 'कक्षा 10वीं (मैट्रिक बोर्ड)', level: 'secondary' },
  { id: 'class-11', name: 'Class 11', label: 'कक्षा 11वीं (इंटर प्रथम वर्ष)', level: 'senior' },
  { id: 'class-12', name: 'Class 12', label: 'कक्षा 12वीं (इंटर बोर्ड)', level: 'senior' },
  { id: 'graduation', name: 'Graduation / Higher Ed', label: 'उच्च शिक्षा (Graduation / B.Sc / B.A / B.Com / Engineering)', level: 'higher' },
  { id: 'polytechnic', name: 'Polytechnic / Diploma', label: 'पॉलीटेक्निक एवं डिप्लोमा (Polytechnic / Diploma)', level: 'vocational' },
  { id: 'neet', name: 'NEET Exam Prep', label: 'नीट प्रवेश परीक्षा (NEET Medical Prep)', level: 'competitive' },
  { id: 'jee', name: 'JEE Main & Advanced', label: 'जी प्रवेश परीक्षा (JEE Main & Advanced Prep)', level: 'competitive' },
  { id: 'upsc', name: 'UPSC Civil Services', label: 'यूपीएससी सिविल सेवा (UPSC Civil Services Prep)', level: 'competitive' },
  { id: 'bpsc', name: 'BPSC State PCS', label: 'बीपीएससी राज्य लोक सेवा (BPSC State PCS Prep)', level: 'competitive' },
  { id: 'ssc', name: 'SSC / CGL / CHSL', label: 'कर्मचारी चयन आयोग (SSC / CGL / CHSL Prep)', level: 'competitive' },
  { id: 'banking', name: 'Banking / IBPS / SBI', label: 'बैंकिंग भर्ती परीक्षा (IBPS / SBI Clerk & PO Prep)', level: 'competitive' },
  { id: 'railway', name: 'Railway Recruitment (RRB)', label: 'रेलवे भर्ती बोर्ड परीक्षा (RRB NTPC & Group D)', level: 'competitive' },
];

export const DIFFICULTY_OPTIONS = [
  { id: 'easy', label: 'सरल (Easy)', hint: 'सीधी परिभाषा व सरल उत्तर' },
  { id: 'medium', label: 'मध्यम (Medium)', hint: 'मानक पाठ्यपुस्तक व बोर्ड स्तर (डिफ़ॉल्ट)' },
  { id: 'hard', label: 'कठिन (Hard)', hint: 'गहन विश्लेषण, सूत्र, चरणबद्ध गणना सत्यापन' },
  { id: 'very_hard', label: 'अत्यंत कठिन / प्रतियोगी (Advanced)', hint: 'जटिल आंकिक, उपपत्ति व वैकल्पिक विधि' },
];

// Helper to get dynamically filtered subjects based on class level or competitive exam
export function getSubjectsForClass(classId: string) {
  if (classId === 'graduation') {
    return [
      { id: 'auto', name: '✨ ऑटो डिटेक्ट (Auto Detect)' },
      { id: 'Mathematics', name: 'गणित (Calculus, Linear Algebra, Real Analysis)' },
      { id: 'Physics', name: 'भौतिकी (Thermodynamics, Quantum, Electrodynamics)' },
      { id: 'Chemistry', name: 'रसायन शास्त्र (Organic, Inorganic, Physical)' },
      { id: 'Engineering / CS', name: 'इंजीनियरिंग व कंप्यूटर साइंस (Engineering / CS)' },
      { id: 'Literature', name: 'साहित्य व भाषाएँ (Literature & Languages)' },
      { id: 'Arts & Humanities', name: 'कला एवं मानविकी (Arts & Humanities)' },
      { id: 'Commerce', name: 'वाणिज्य व प्रबंधन (Commerce & Management)' },
    ];
  }

  if (classId === 'polytechnic') {
    return [
      { id: 'auto', name: '✨ ऑटो डिटेक्ट (Auto Detect)' },
      { id: 'Applied Mathematics', name: 'अनुप्रयुक्त गणित (Applied Mathematics)' },
      { id: 'Applied Physics', name: 'अनुप्रयुक्त भौतिकी (Applied Physics)' },
      { id: 'Applied Chemistry', name: 'अनुप्रयुक्त रसायन (Applied Chemistry)' },
      { id: 'Mechanical Engineering', name: 'मैकेनिकल इंजीनियरिंग (Mechanical)' },
      { id: 'Electrical Engineering', name: 'इलेक्ट्रिकल इंजीनियरिंग (Electrical)' },
      { id: 'Civil Engineering', name: 'सिविल इंजीनियरिंग (Civil)' },
      { id: 'Computer / Electronics', name: 'कंप्यूटर एवं इलेक्ट्रॉनिक्स (CS / Electronics)' },
    ];
  }

  if (['neet', 'jee', 'upsc', 'bpsc', 'ssc', 'banking', 'railway'].includes(classId)) {
    return [
      { id: 'auto', name: '✨ ऑटो डिटेक्ट (Auto Detect)' },
      { id: 'Quantitative Aptitude', name: 'गणितीय अभियोग्यता (Quantitative Aptitude)' },
      { id: 'Reasoning Ability', name: 'तर्कशक्ति परीक्षण (Logical Reasoning)' },
      { id: 'General Science', name: 'सामान्य विज्ञान (NEET Biology, JEE Physics, Chemistry)' },
      { id: 'General Studies / GK', name: 'सामान्य ज्ञान एवं समसामयिकी (GS / GK / Current Affairs)' },
      { id: 'History & Culture', name: 'इतिहास एवं संस्कृति (UPSC/BPSC History)' },
      { id: 'Geography & Environment', name: 'भूगोल एवं पर्यावरण (Geography & Ecology)' },
      { id: 'Polity & Constitution', name: 'भारतीय राजव्यवस्था (Polity & Constitution)' },
      { id: 'Indian Economy', name: 'भारतीय अर्थव्यवस्था (Economics)' },
      { id: 'English Language', name: 'अंग्रेजी भाषा व व्याकरण (English Verbal Ability)' },
    ];
  }

  const classNum = parseInt(classId.replace(/\D/g, ''), 10) || 10;

  if (classNum <= 5) {
    return [
      { id: 'auto', name: '✨ ऑटो डिटेक्ट (Auto Detect)' },
      { id: 'Mathematics', name: 'गणित (बुनियादी अंकगणित)' },
      { id: 'Science', name: 'पर्यावरण एवं विज्ञान (EVS / General Science)' },
      { id: 'Social Studies', name: 'सामाजिक अध्ययन व परिवेश (Social Studies)' },
      { id: 'Hindi', name: 'हिंदी (Hindi)' },
      { id: 'English', name: 'अंग्रेजी (English)' },
    ];
  }

  if (classNum <= 8) {
    return [
      { id: 'auto', name: '✨ ऑटो डिटेक्ट (Auto Detect)' },
      { id: 'Mathematics', name: 'गणित (अंकगणित, बीजगणित, रेखागणित)' },
      { id: 'Science', name: 'विज्ञान (Science)' },
      { id: 'Social Science', name: 'सामाजिक विज्ञान (इतिहास, भूगोल, नागरिक शास्त्र)' },
      { id: 'Hindi', name: 'हिंदी (Hindi)' },
      { id: 'Sanskrit', name: 'संस्कृत (Sanskrit)' },
      { id: 'English', name: 'अंग्रेजी (English)' },
    ];
  }

  if (classNum <= 10) {
    return [
      { id: 'auto', name: '✨ ऑटो डिटेक्ट (Auto Detect)' },
      { id: 'Mathematics', name: 'गणित (त्रिकोणमिति, बीजगणित, ज्यामिति, सांख्यिकी)' },
      { id: 'Science', name: 'विज्ञान (General Science)' },
      { id: 'Physics', name: 'भौतिकी (Physics)' },
      { id: 'Chemistry', name: 'रसायन विज्ञान (Chemistry)' },
      { id: 'Biology', name: 'जीव विज्ञान (Biology)' },
      { id: 'Social Science', name: 'सामाजिक विज्ञान (Social Science)' },
      { id: 'History', name: 'इतिहास (History)' },
      { id: 'Geography', name: 'भूगोल (Geography)' },
      { id: 'Civics', name: 'नागरिक शास्त्र / राजनीति विज्ञान (Civics / Pol. Sci)' },
      { id: 'Economics', name: 'अर्थशास्त्र (Economics)' },
      { id: 'Hindi', name: 'हिंदी (Hindi)' },
      { id: 'Sanskrit', name: 'संस्कृत (Sanskrit)' },
      { id: 'English', name: 'अंग्रेजी (English)' },
    ];
  }

  // Class 11 & 12
  return [
    { id: 'auto', name: '✨ ऑटो डिटेक्ट (Auto Detect)' },
    { id: 'Mathematics', name: 'गणित (कैलकुलस, सदिश, 3D, आव्यूह, प्रायिकता)' },
    { id: 'Physics', name: 'भौतिकी (स्थिरवैद्युतिकी, प्रकाशिकी, आधुनिक भौतिकी)' },
    { id: 'Chemistry', name: 'रसायन शास्त्र (विलयन, विद्युत रसायन, कार्बनिक)' },
    { id: 'Biology', name: 'जीव विज्ञान (आनुवंशिकी, पारिस्थितिकी, जनन)' },
    { id: 'History', name: 'इतिहास (History)' },
    { id: 'Geography', name: 'भूगोल (Geography)' },
    { id: 'Political Science', name: 'राजनीति विज्ञान (Political Science)' },
    { id: 'Economics', name: 'अर्थशास्त्र (Economics)' },
    { id: 'Accountancy', name: 'लेखाशास्त्र (Accountancy)' },
    { id: 'Business Studies', name: 'व्यवसाय अध्ययन (Business Studies)' },
    { id: 'Computer Science', name: 'कंप्यूटर साइंस (Computer Science)' },
    { id: 'Hindi', name: 'हिंदी (Hindi)' },
    { id: 'English', name: 'अंग्रेजी (English)' },
  ];
}

/**
 * Solution Renderer: Converts raw output into clean, structured textbook typography
 */
/**
 * Helper to format algebraic variables, stacked fractions, powers, roots, set theory, geometry, chemistry and calculus natively in HTML/CSS
 */
function formatMathNotation(text: string): string {
  if (!text) return '';

  let processed = text;

  // Protect standard classes / levels from being parsed as fractions (e.g. Class 10/12)
  const classPlaceholder12 = '___CLASS_12_HINT___';
  const classPlaceholder10 = '___CLASS_10_HINT___';
  processed = processed
    .replace(/\b10\/12\b/g, classPlaceholder10)
    .replace(/\b12\/10\b/g, classPlaceholder12);

  // 1. Math limits / Integration with bounds
  // Support: ∫₀¹ or ∫_0^1
  processed = processed.replace(/∫\s*₀\s*¹/g, '<span class="inline-flex flex-col items-center align-middle mx-1"><sup class="text-3xs font-black text-blue-900">1</sup><span class="text-xl font-bold text-slate-900">∫</span><sub class="text-3xs font-black text-blue-900" style="margin-top: -0.2em;">0</sub></span>');
  processed = processed.replace(/∫_\{?([a-zA-Z0-9]+)\}?\^\{?([a-zA-Z0-9]+)\}?/g, '<span class="inline-flex flex-col items-center align-middle mx-1"><sup class="text-3xs font-black text-blue-900">$2</sup><span class="text-xl font-bold text-slate-900">∫</span><sub class="text-3xs font-black text-blue-900" style="margin-top: -0.2em;">$1</sub></span>');
  processed = processed.replace(/∫_([a-zA-Z0-9])\^([a-zA-Z0-9])/g, '<span class="inline-flex flex-col items-center align-middle mx-1"><sup class="text-3xs font-black text-blue-900">$2</sup><span class="text-xl font-bold text-slate-900">∫</span><sub class="text-3xs font-black text-blue-900" style="margin-top: -0.2em;">$1</sub></span>');

  // 2. Summation limits
  // Support: Σₙ₌₁ⁿ or Σ_{i=1}^n
  processed = processed.replace(/Σₙ₌₁ⁿ/g, '<span class="inline-flex flex-col items-center align-middle mx-1"><sup class="text-3xs font-black text-blue-900">n</sup><span class="text-xl font-bold text-slate-900">Σ</span><sub class="text-3xs font-black text-blue-900" style="margin-top: -0.2em;">n=1</sub></span>');
  processed = processed.replace(/Σ_\{?([a-zA-Z0-9=]+)\}?\^\{?([a-zA-Z0-9]+)\}?/g, '<span class="inline-flex flex-col items-center align-middle mx-1"><sup class="text-3xs font-black text-blue-900">$2</sup><span class="text-xl font-bold text-slate-900">Σ</span><sub class="text-3xs font-black text-blue-900" style="margin-top: -0.2em;">$1</sub></span>');

  // 3. Limits limit notation
  // Support: lim x→a
  processed = processed.replace(/lim\s+([a-zA-Z0-9]+)→([a-zA-Z0-9]+)/g, '<span class="inline-flex flex-col items-center align-middle mx-1"><span class="text-sm font-black text-slate-900 leading-none">lim</span><sub class="text-4xs font-black text-blue-900 leading-none" style="margin-top: 0.1em;">$1→$2</sub></span>');

  // 4. Powers & Exponents (superscripts)
  // E.g. x^2, sin^2 x, e^-x, 10^-2
  processed = processed.replace(/\b([a-zA-Z0-9xXθπ]+)\^\{?([0-9a-zA-Zθπ+\-xX]+)\}?/g, '$1<sup class="text-xs font-black text-blue-900">$2</sup>');
  processed = processed.replace(/([()a-zA-Z0-9xXθπ]+)\^\{?([0-9a-zA-Zθπ+\-xX]+)\}?/g, '$1<sup class="text-xs font-black text-blue-900">$2</sup>');

  // Unicode superscripts
  processed = processed.replace(/²/g, '<sup class="text-xs font-black text-blue-900">2</sup>');
  processed = processed.replace(/³/g, '<sup class="text-xs font-black text-blue-900">3</sup>');
  processed = processed.replace(/ⁿ/g, '<sup class="text-xs font-black text-blue-900">n</sup>');

  // 5. Algebraic Subscripts
  // Support: x_1, x_2, a_n or x₁, x₂, aₙ
  processed = processed.replace(/\b([a-zA-Z0-9θπ]+)_\{?([a-zA-Z0-9=+\-]+)\}?\b/g, '$1<sub class="text-4xs font-black text-blue-900">$2</sub>');
  processed = processed.replace(/([a-zA-Z0-9θπ]+)₁/g, '$1<sub class="text-4xs font-black text-blue-900">1</sub>');
  processed = processed.replace(/([a-zA-Z0-9θπ]+)₂/g, '$1<sub class="text-4xs font-black text-blue-900">2</sub>');
  processed = processed.replace(/([a-zA-Z0-9θπ]+)₃/g, '$1<sub class="text-4xs font-black text-blue-900">3</sub>');
  processed = processed.replace(/([a-zA-Z0-9θπ]+)ₙ/g, '$1<sub class="text-4xs font-black text-blue-900">n</sub>');
  processed = processed.replace(/log_([a-zA-Z0-9]+)/g, 'log<sub class="text-4xs font-black text-blue-900">$1</sub>');
  processed = processed.replace(/logₐ/g, 'log<sub class="text-4xs font-black text-blue-900">a</sub>');

  // 6. Radicals / Roots
  // Support: ∛x, ∜x, √x, √(a+b)
  processed = processed.replace(/∛\(([^)]+)\)/g, '<span class="inline-flex items-center"><sup class="text-4xs font-black text-slate-800" style="margin-right: -0.3em; margin-top: -0.4em;">3</sup><span class="font-sans font-bold text-slate-900 text-lg">√</span><span class="border-t-2 border-slate-900 px-1 font-bold font-sans" style="margin-left: -0.05em; padding-top: 1px;">$1</span></span>');
  processed = processed.replace(/∛([a-zA-Z0-9θπ+\-]+)/g, '<span class="inline-flex items-center"><sup class="text-4xs font-black text-slate-800" style="margin-right: -0.3em; margin-top: -0.4em;">3</sup><span class="font-sans font-bold text-slate-900 text-lg">√</span><span class="border-t-2 border-slate-900 px-1 font-bold font-sans" style="margin-left: -0.05em; padding-top: 1px;">$1</span></span>');
  processed = processed.replace(/∜\(([^)]+)\)/g, '<span class="inline-flex items-center"><sup class="text-4xs font-black text-slate-800" style="margin-right: -0.3em; margin-top: -0.4em;">4</sup><span class="font-sans font-bold text-slate-900 text-lg">√</span><span class="border-t-2 border-slate-900 px-1 font-bold font-sans" style="margin-left: -0.05em; padding-top: 1px;">$1</span></span>');
  processed = processed.replace(/∜([a-zA-Z0-9θπ+\-]+)/g, '<span class="inline-flex items-center"><sup class="text-4xs font-black text-slate-800" style="margin-right: -0.3em; margin-top: -0.4em;">4</sup><span class="font-sans font-bold text-slate-900 text-lg">√</span><span class="border-t-2 border-slate-900 px-1 font-bold font-sans" style="margin-left: -0.05em; padding-top: 1px;">$1</span></span>');
  processed = processed.replace(/√\(([^)]+)\)/g, '<span class="inline-flex items-center"><span class="font-sans font-bold text-slate-900 text-lg">√</span><span class="border-t-2 border-slate-900 px-1 font-bold font-sans" style="margin-left: -0.05em; padding-top: 1px;">$1</span></span>');
  processed = processed.replace(/√([a-zA-Z0-9θπ+\-]+)/g, '<span class="inline-flex items-center"><span class="font-sans font-bold text-slate-900 text-lg">√</span><span class="border-t-2 border-slate-900 px-1 font-bold font-sans" style="margin-left: -0.05em; padding-top: 1px;">$1</span></span>');

  // 7. Stacked Mixed Fractions
  // E.g. 1 1/2 or 2 3/4
  processed = processed.replace(/\b(\d+)\s+(\d+)\/(\d+)\b/g, (m, whole, num, den) => {
    return `<span class="inline-flex items-center align-middle"><span class="text-base font-black mr-0.5 text-blue-950">${whole}</span><span class="inline-flex flex-col items-center align-middle mx-1" style="vertical-align: -0.4em;"><span class="border-b-2 border-slate-700 text-3xs px-1 pb-0.5 font-black font-sans text-blue-950">${num}</span><span class="text-3xs px-1 pt-0.5 font-black font-sans text-blue-950">${den}</span></span></span>`;
  });

  // 8. Normal Stacked Fractions
  // 1. (expr)/(expr)
  processed = processed.replace(/\(([^)]+)\)\/\(([^)]+)\)/g, (m, num, den) => {
    return `<span class="inline-flex flex-col items-center align-middle mx-1.5" style="vertical-align: -0.4em;"><span class="border-b-2 border-slate-700 text-xs px-2 pb-0.5 font-black font-sans text-blue-950">${num}</span><span class="text-xs px-2 pt-0.5 font-black font-sans text-blue-950">${den}</span></span>`;
  });
  // 2. (expr)/var
  processed = processed.replace(/\(([^)]+)\)\/([a-zA-Z0-9θπ+\-×\*]+)/g, (m, num, den) => {
    return `<span class="inline-flex flex-col items-center align-middle mx-1.5" style="vertical-align: -0.4em;"><span class="border-b-2 border-slate-700 text-xs px-2 pb-0.5 font-black font-sans text-blue-950">${num}</span><span class="text-xs px-2 pt-0.5 font-black font-sans text-blue-950">${den}</span></span>`;
  });
  // 3. var/(expr)
  processed = processed.replace(/\b([a-zA-Z0-9θπ+\-×\*]+)\/\(([^)]+)\)/g, (m, num, den) => {
    return `<span class="inline-flex flex-col items-center align-middle mx-1.5" style="vertical-align: -0.4em;"><span class="border-b-2 border-slate-700 text-xs px-2 pb-0.5 font-black font-sans text-blue-950">${num}</span><span class="text-xs px-2 pt-0.5 font-black font-sans text-blue-950">${den}</span></span>`;
  });
  // 4. isolated fractions like 2/3, a/b, dy/dx, etc.
  processed = processed.replace(/\b([a-zA-Z0-9θπ⁺⁻\*×\+]+)\/([a-zA-Z0-9θπ⁺⁻\*×\+]+)\b/g, (m, num, den) => {
    return `<span class="inline-flex flex-col items-center align-middle mx-1.5" style="vertical-align: -0.4em;"><span class="border-b-2 border-slate-700 text-xs px-2 pb-0.5 font-black font-sans text-blue-950">${num}</span><span class="text-xs px-2 pt-0.5 font-black font-sans text-blue-950">${den}</span></span>`;
  });

  // 9. Vectors
  // Support: →a
  processed = processed.replace(/→([a-zA-Z])/g, '<span class="inline-flex flex-col items-center align-middle" style="line-height: 1;"><span class="text-4xs font-bold leading-none text-slate-800" style="margin-bottom: -0.1em;">→</span><span class="font-sans font-bold text-slate-900">$1</span></span>');

  // 10. Chemical formula subscripts
  // Support: H₂O, CO₂, H₂SO₄, CaCO₃, NaCl
  processed = processed.replace(/\b(H|C|O|S|N|Na|Ca|Cl|Mg|Fe)_([234])\b/g, '$1<sub class="text-4xs font-black text-slate-900">$2</sub>');
  processed = processed.replace(/(H|C|O|S|N|Na|Ca|Cl|Mg|Fe)₂/g, '$1<sub class="text-4xs font-black text-slate-900">2</sub>');
  processed = processed.replace(/(H|C|O|S|N|Na|Ca|Cl|Mg|Fe)₃/g, '$1<sub class="text-4xs font-black text-slate-900">3</sub>');
  processed = processed.replace(/(H|C|O|S|N|Na|Ca|Cl|Mg|Fe)₄/g, '$1<sub class="text-4xs font-black text-slate-900">4</sub>');

  // Restore protected class text
  processed = processed
    .replace(new RegExp(classPlaceholder10, 'g'), '10/12')
    .replace(new RegExp(classPlaceholder12, 'g'), '12/10');

  // Always use multiplication symbol "×" instead of "*"
  processed = processed.replace(/\*/g, ' × ');

  return processed;
}

/**
 * Solution Renderer: Converts raw output into clean, structured textbook typography
 */
function SolutionRenderer({ text }: { text: string }) {
  if (!text) return null;

  // Clean raw LaTeX or broken markers
  const processedText = text
    .replace(/\$\$/g, '')
    .replace(/\$/g, '')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 / $2')
    .replace(/\\sqrt\{([^}]+)\}/g, '√$1')
    .replace(/\\theta/g, 'θ')
    .replace(/\\pi/g, 'π')
    .replace(/\\times/g, ' × ')
    .replace(/\\div/g, ' ÷ ')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\deg/g, '°')
    .replace(/#/g, '')
    .replace(/__(.*?)__/g, '$1') // Strip markdown double underscores safely
    .replace(/\s_(.*?)\s/g, ' $1 ') // Strip markdown single underscores safely, preserving subscript_underscores
    .replace(/`/g, '')
    .replace(/\\\[|\\\]|\\\(|\\\)/g, '');

  const lines = processedText.split('\n');

  return (
    <div className="space-y-4 text-slate-900 text-base sm:text-lg font-medium leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;

        // Header detection
        const isHeader =
          /^\[.+\]$/.test(trimmed) ||
          /^(📌 समझिए|🧠 मुख्य सिद्धांत|🧠 Concept|📝 चरण-दर-चरण समाधान|📝 Solution|✅ अंतिम उत्तर|✅ Final Answer|💡 याद रखने योग्य बात|💡 परीक्षा टिप्स|दिया है|ज्ञात करना है|सूत्र|मान रखने पर|निष्कर्ष|Step \d|चरण \d):/i.test(trimmed) ||
          (trimmed.length < 50 &&
            (trimmed.startsWith('चरण') || trimmed.startsWith('Step') || trimmed.startsWith('विधि') || trimmed.startsWith('वैकल्पिक विधि')));

        if (isHeader) {
          const headerText = trimmed.replace(/^[#\s*\[\]_]+/, '').replace(/[\[\]_]+$/, '');
          return (
            <div
              key={idx}
              className="text-lg sm:text-xl font-black text-blue-900 mt-5 mb-2 pb-1 border-b-2 border-blue-200 flex items-center gap-2"
            >
              <span>{headerText}</span>
            </div>
          );
        }

        // Equation or Final Result highlight line
        const isFinalAnswer =
          trimmed.startsWith('✅') ||
          trimmed.includes('अंतिम उत्तर') ||
          trimmed.includes('Final Answer') ||
          trimmed.includes('अतः उत्तर');

        if (isFinalAnswer) {
          const formattedContent = formatMathNotation(
            trimmed.replace(/^✅\s*/, '')
              .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-black text-slate-950">$1</strong>')
          );
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 font-black text-lg my-3 shadow-xs flex items-start gap-2"
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
            </div>
          );
        }

        // Mathematical calculation step line (contains '=' and algebraic tokens)
        const isMathStep = trimmed.includes('=') && (
          trimmed.includes('x') ||
          trimmed.includes('y') ||
          trimmed.includes('a') ||
          trimmed.includes('b') ||
          trimmed.includes('c') ||
          trimmed.includes('cm') ||
          trimmed.includes('+') ||
          trimmed.includes('-') ||
          trimmed.includes('²') ||
          trimmed.includes('³') ||
          trimmed.includes('/') ||
          trimmed.includes('√')
        );

        if (isMathStep) {
          const formattedContent = formatMathNotation(
            trimmed.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-black text-blue-950">$1</strong>')
          );
          return (
            <div
              key={idx}
              className="p-3.5 sm:p-4 bg-blue-50/70 rounded-xl border border-blue-100 font-sans font-bold text-blue-950 my-1 overflow-x-auto select-all leading-normal"
              style={{ minHeight: '3.5rem' }}
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          );
        }

        // Regular paragraph with bolding and math notation formatting
        const formattedLine = formatMathNotation(
          trimmed
            .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-black text-slate-950">$1</strong>')
            .replace(/^\s*[\*\-]\s+/, '• ')
        );

        return (
          <p
            key={idx}
            className="text-slate-800"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        );
      })}
    </div>
  );
}

export function DoubtSolveAIView({ onNavigate, initialClassLevel }: DoubtSolveAIViewProps) {
  const { user } = useAuth();
  
  // State
  const [classLevel, setClassLevel] = useState<string>(initialClassLevel || 'class-10');
  const [subject, setSubject] = useState<string>('auto');
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [languagePreference, setLanguagePreference] = useState<string>('auto');
  const [question, setQuestion] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // In-flight locking & feedback
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [solution, setSolution] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedDoubts, setSavedDoubts] = useState<SavedDoubt[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Topic-wise Persistent Conversation State (ChatGPT-style multi-turn)
  const [conversations, setConversations] = useState<DoubtConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DoubtMessage[]>([]);
  const [loadingChatMessages, setLoadingChatMessages] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Live streaming chunk for assistant message
  const [streamingContent, setStreamingContent] = useState<string | null>(null);

  // Per-message TTS tracker
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const chatScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const currentUserId = user?.uid || 'guest';

  // Active Conversation computed
  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
    return conversations.find((c) => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recStatus, setRecStatus] = useState<'idle' | 'listening' | 'transcribing' | 'error' | 'unsupported'>('idle');
  const [micError, setMicError] = useState<string | null>(null);

  // TTS Voice Output state
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [isPausedSpeech, setIsPausedSpeech] = useState(false);

  const recognitionRef = useRef<any>(null);
  const speechUtteranceRef = useRef<any>(null);

  // Stop TTS if component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startRecording = async () => {
    setMicError(null);

    // 1. Check Web Speech API support
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (!SpeechRecognition) {
      setRecStatus('unsupported');
      setMicError('इस browser में voice input supported नहीं है। कृपया supported browser में प्रयास करें।');
      return;
    }

    // 2. Verify / request microphone permission via getUserMedia
    if (
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    ) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately release tracks so SpeechRecognition can acquire the audio input cleanly
        stream.getTracks().forEach((track) => track.stop());
      } catch (err: any) {
        const errorName = err?.name || '';
        console.warn('[Microphone] getUserMedia check error:', errorName, err?.message);
        setIsRecording(false);
        setRecStatus('error');

        if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError' || errorName === 'SecurityError') {
          setMicError('माइक्रोफोन की अनुमति बंद है। Browser Site Settings में Microphone को Allow करें और फिर पुनः प्रयास करें।');
        } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
          setMicError('माइक्रोफोन उपलब्ध नहीं है। कृपया अपने device/browser की microphone settings जांचें।');
        } else if (errorName === 'NotSupportedError') {
          setMicError('इस browser में voice input supported नहीं है। कृपया supported browser में प्रयास करें।');
        } else {
          setMicError('माइक्रोफोन शुरू नहीं हो सका। कृपया फिर से प्रयास करें।');
        }
        return;
      }
    }

    // 3. Initialize and start SpeechRecognition
    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const rec = new SpeechRecognition();
      recognitionRef.current = rec;

      rec.continuous = false;
      rec.interimResults = false;

      // Select language
      let lang = 'hi-IN'; // default
      if (languagePreference === 'english') {
        lang = 'en-US';
      } else if (languagePreference === 'urdu') {
        lang = 'ur-PK';
      } else if (languagePreference === 'hinglish') {
        lang = 'hi-IN'; // Best transcription match for mixed words
      } else {
        lang = 'hi-IN';
      }
      rec.lang = lang;

      rec.onstart = () => {
        setIsRecording(true);
        setRecStatus('listening');
        setMicError(null);
      };

      rec.onerror = (event: any) => {
        setIsRecording(false);
        const errType = event?.error;

        if (errType === 'aborted') {
          setRecStatus('idle');
          setMicError(null);
          return;
        }

        setRecStatus('error');

        if (errType === 'not-allowed' || errType === 'service-not-allowed') {
          setMicError('माइक्रोफोन की अनुमति बंद है। Browser Site Settings में Microphone को Allow करें और फिर पुनः प्रयास करें।');
        } else if (errType === 'audio-capture') {
          setMicError('माइक्रोफोन उपलब्ध नहीं है। कृपया अपने device/browser की microphone settings जांचें।');
        } else if (errType === 'no-speech') {
          setMicError('कोई आवाज़ सुनाई नहीं दी। कृपया माइक्रोफ़ोन के पास आकर स्पष्ट बोलें।');
        } else if (errType === 'network') {
          setMicError('इंटरनेट कनेक्शन धीमा होने के कारण वॉइस पहचान पूरी नहीं हो सकी। कृपया पुनः प्रयास करें।');
        } else {
          setMicError('माइक्रोफोन शुरू नहीं हो सका। कृपया फिर से प्रयास करें।');
        }
      };

      rec.onend = () => {
        setIsRecording(false);
        if (recStatus === 'listening') {
          setRecStatus('idle');
        }
      };

      rec.onresult = (event: any) => {
        setRecStatus('transcribing');
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript && transcript.trim()) {
          // Format standard spoken math patterns to clean math
          let cleanedText = transcript;

          cleanedText = cleanedText
            .replace(/दो\s+एक्स\s+प्लस\s+पाँच\s+बराबर\s+पंद्रह/gi, '2x + 5 = 15')
            .replace(/एक्स\s+का\s+वर्ग/gi, 'x²')
            .replace(/ए\s+का\s+वर्ग\s+प्लस\s+बी\s+का\s+वर्ग/gi, 'a² + b²')
            .replace(/एक्स\s+का\s+वर्गमूल/gi, '√x')
            .replace(/(\d+)\s+का\s+वर्गमूल/g, '√$1')
            .replace(/(\d+)\s+का\s+वर्ग/g, '$1²')
            .replace(/(\d+)\s+का\s+घन/g, '$1³');

          setQuestion(cleanedText);
          setRecStatus('idle');
          setMicError(null);
        } else {
          setMicError('कोई आवाज़ सुनाई नहीं दी। कृपया माइक्रोफ़ोन के पास आकर स्पष्ट बोलें।');
          setRecStatus('idle');
        }
      };

      rec.start();
    } catch (e: any) {
      console.warn('[SpeechRecognition] Initialization failed or not permitted:', e);
      setRecStatus('error');
      setMicError('माइक्रोफोन शुरू नहीं हो सका। कृपया फिर से प्रयास करें।');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setRecStatus('idle');
  };

  const cancelRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsRecording(false);
    setRecStatus('idle');
    setMicError(null);
  };

  const playSpeechAnswer = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !solution) {
      setMicError('आपके डिवाइस में आवाज संश्लेषण (Text-to-Speech) उपलब्ध नहीं है।');
      return;
    }

    if (isPausedSpeech) {
      window.speechSynthesis.resume();
      setIsPausedSpeech(false);
      setIsPlayingSpeech(true);
      return;
    }

    window.speechSynthesis.cancel();

    // Strips out HTML formatting tags, brackets, and math notation markers for clean natural speech
    const cleanTextToSpeak = solution
      .replace(/<[^>]+>/g, '') // remove HTML tags
      .replace(/\[ERROR\]:/g, '')
      .replace(/📌 समझिए/g, 'समझिए:')
      .replace(/🧠 मुख्य सिद्धांत/g, 'मुख्य सिद्धांत:')
      .replace(/📝 चरण-दर-चरण समाधान/g, 'चरण-दर-चरण समाधान:')
      .replace(/✅ अंतिम उत्तर/g, 'अंतिम उत्तर:')
      .replace(/💡 याद रखने योग्य बात/g, 'याद रखने योग्य बात:')
      .replace(/x²/g, 'एक्स स्क्वायर')
      .replace(/a²/g, 'ए स्क्वायर')
      .replace(/b²/g, 'बी स्क्वायर')
      .replace(/√x/g, 'एक्स का वर्गमूल')
      .replace(/dy\/dx/g, 'डी वाय बाय डी एक्स')
      .replace(/∫/g, 'समाकलन')
      .replace(/π/g, 'पाई')
      .replace(/°/g, 'डिग्री')
      .replace(/×/g, 'गुणा')
      .replace(/÷/g, 'भाग')
      .replace(/=/g, 'बराबर है')
      .trim();

    if (!cleanTextToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(cleanTextToSpeak);
    speechUtteranceRef.current = utterance;

    // Detect language of the solution
    let lang = 'hi-IN'; // default
    if (languagePreference === 'english') {
      lang = 'en-US';
    } else {
      const englishCount = (solution.match(/[a-zA-Z]/g) || []).length;
      const hindiCount = (solution.match(/[\u0900-\u097F]/g) || []).length;
      if (englishCount > hindiCount * 1.5) {
        lang = 'en-US';
      }
    }
    utterance.lang = lang;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(lang.slice(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setIsPlayingSpeech(true);
      setIsPausedSpeech(false);
    };

    utterance.onend = () => {
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
    };

    utterance.onerror = (e: any) => {
      // "canceled" or "interrupted" are normal browser lifecycle events when speech is stopped or switched
      if (e?.error !== 'canceled' && e?.error !== 'interrupted') {
        console.warn('[SpeechSynthesis] Synthesis ended or interrupted:', e?.error || e);
      }
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeechAnswer = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPausedSpeech(true);
      setIsPlayingSpeech(false);
    }
  };

  const stopSpeechAnswer = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
    }
  };

  const abortControllerRef = useRef<AbortController | null>(null);

  const loadingMessages = [
    'प्रश्न की शैक्षणिक संरचना का विश्लेषण हो रहा है...',
    'उपयुक्त सिद्धांत व सूत्र का चयन किया जा रहा है...',
    'चरण-दर-चरण समाधान और गणना की जांच हो रही है...',
    'अंतिम उत्तर व परीक्षा टिप्स जोड़े जा रहे हैं...',
    'समाधान तैयार हो रहा है...',
  ];

  // Dynamic subjects based on selected class
  const availableSubjects = useMemo(() => {
    return getSubjectsForClass(classLevel);
  }, [classLevel]);

  // Reset subject if not in available list
  useEffect(() => {
    const exists = availableSubjects.some((s) => s.id === subject);
    if (!exists) {
      setSubject('auto');
    }
  }, [classLevel, availableSubjects, subject]);

  // Load conversation list
  useEffect(() => {
    let isMounted = true;
    async function loadConvs() {
      try {
        const list = await fetchUserConversations(currentUserId);
        if (isMounted) {
          setConversations(list);
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      }
    }
    loadConvs();
    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  // Load messages when activeConversationId changes
  useEffect(() => {
    let isMounted = true;
    async function loadMsgs() {
      if (!activeConversationId) {
        setMessages([]);
        return;
      }
      setLoadingChatMessages(true);
      try {
        const msgs = await fetchConversationMessages(activeConversationId, currentUserId);
        if (isMounted) {
          setMessages(msgs);
        }
      } catch (err) {
        console.error('Failed to load conversation messages:', err);
      } finally {
        if (isMounted) {
          setLoadingChatMessages(false);
        }
      }
    }
    loadMsgs();
    return () => {
      isMounted = false;
    };
  }, [activeConversationId, currentUserId]);

  // Smooth auto-scroll for chat thread
  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  // Conversation Action Handlers
  const startNewChat = () => {
    if (loading) return;
    setActiveConversationId(null);
    setMessages([]);
    setSolution(null);
    setStreamingContent(null);
    setQuestion('');
    setImage(null);
    setImagePreview(null);
    setShowMobileSidebar(false);
    setError(null);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
    }
  };

  const selectConversation = async (convId: string) => {
    if (loading || convId === activeConversationId) return;
    const target = conversations.find((c) => c.id === convId);
    if (target) {
      if (target.classLevel) setClassLevel(target.classLevel);
      if (target.subject) setSubject(target.subject);
    }
    setActiveConversationId(convId);
    setSolution(null);
    setStreamingContent(null);
    setQuestion('');
    setImage(null);
    setImagePreview(null);
    setShowMobileSidebar(false);
    setError(null);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
    }
  };

  const handleRename = async (convId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    const cleanTitle = newTitle.trim();
    await renameConversation(convId, currentUserId, cleanTitle);
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, title: cleanTitle, topic: cleanTitle } : c))
    );
  };

  const handleDeleteConv = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteConversation(convId, currentUserId);
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (activeConversationId === convId) {
      startNewChat();
    }
  };

  const handleToggleArchive = async (convId: string, currentArchived: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleArchiveConversation(convId, currentUserId, !currentArchived);
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, isArchived: !currentArchived } : c))
    );
  };

  const playSpeechForMessage = (msgId: string, content: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !content) {
      setMicError('आपके डिवाइस में आवाज संश्लेषण (Text-to-Speech) उपलब्ध नहीं है।');
      return;
    }

    if (speakingMessageId === msgId) {
      if (isPausedSpeech) {
        window.speechSynthesis.resume();
        setIsPausedSpeech(false);
        setIsPlayingSpeech(true);
        return;
      }
      if (isPlayingSpeech) {
        window.speechSynthesis.pause();
        setIsPausedSpeech(true);
        setIsPlayingSpeech(false);
        return;
      }
    }

    window.speechSynthesis.cancel();

    const cleanTextToSpeak = content
      .replace(/<[^>]+>/g, '')
      .replace(/\[ERROR\]:/g, '')
      .replace(/📌 समझिए/g, 'समझिए:')
      .replace(/🧠 मुख्य सिद्धांत/g, 'मुख्य सिद्धांत:')
      .replace(/📝 चरण-दर-चरण समाधान/g, 'चरण-दर-चरण समाधान:')
      .replace(/✅ अंतिम उत्तर/g, 'अंतिम उत्तर:')
      .replace(/💡 याद रखने योग्य बात/g, 'याद रखने योग्य बात:')
      .replace(/x²/g, 'एक्स स्क्वायर')
      .replace(/a²/g, 'ए स्क्वायर')
      .replace(/b²/g, 'बी स्क्वायर')
      .replace(/√x/g, 'एक्स का वर्गमूल')
      .replace(/dy\/dx/g, 'डी वाय बाय डी एक्स')
      .replace(/∫/g, 'समाकलन')
      .replace(/π/g, 'पाई')
      .replace(/°/g, 'डिग्री')
      .replace(/×/g, 'गुणा')
      .replace(/÷/g, 'भाग')
      .replace(/=/g, 'बराबर है')
      .trim();

    if (!cleanTextToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(cleanTextToSpeak);
    speechUtteranceRef.current = utterance;

    let lang = 'hi-IN';
    if (languagePreference === 'english') {
      lang = 'en-US';
    } else {
      const englishCount = (content.match(/[a-zA-Z]/g) || []).length;
      const hindiCount = (content.match(/[\u0900-\u097F]/g) || []).length;
      if (englishCount > hindiCount * 1.5) {
        lang = 'en-US';
      }
    }
    utterance.lang = lang;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setSpeakingMessageId(msgId);
      setIsPlayingSpeech(true);
      setIsPausedSpeech(false);
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
    };

    utterance.onerror = (e: any) => {
      // "canceled" or "interrupted" are normal browser lifecycle events when speech is stopped or switched
      if (e?.error !== 'canceled' && e?.error !== 'interrupted') {
        console.warn('[SpeechSynthesis] Synthesis ended or interrupted:', e?.error || e);
      }
      setSpeakingMessageId(null);
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopCurrentSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
    }
  };

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rk_solved_doubts');
      if (stored) {
        setSavedDoubts(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved doubts:', e);
    }
  }, []);

  // Loading animation step switcher
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 12 * 1024 * 1024) {
        setError('तस्वीर का आकार 12MB से कम होना चाहिए।');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        setImagePreview(base64);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  // Submit Doubt solver request with Topic-wise Conversation & History support
  const solveDoubt = async (e?: React.FormEvent, customQuestion?: string, customSubject?: string, customDifficulty?: string) => {
    if (e) e.preventDefault();

    // Prevent duplicate triggers
    if (loading) return;

    const queryText = (customQuestion !== undefined ? customQuestion : question).trim();
    const querySubject = customSubject || subject;
    const queryDifficulty = customDifficulty || difficulty;

    if (!queryText && !image) {
      setError('कृपया अपना प्रश्न लिखें या एक प्रश्न की तस्वीर अपलोड करें।');
      return;
    }

    // Check offline status
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setError('Internet connection check करें और फिर प्रयास करें।');
      return;
    }

    setLoading(true);
    setError(null);
    setSolution(null);
    setStreamingContent('');

    // Cancel any active TTS
    stopCurrentSpeech();

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Setup 35s timeout to abort slow/stuck network requests
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }, 35000);

    try {
      let targetConvId = activeConversationId;
      let targetTopic = activeConversation?.topic || activeConversation?.title;

      // 1. If starting a new conversation (New Chat)
      if (!targetConvId) {
        const detectedTopic = detectTopicFromText(queryText, querySubject);
        targetTopic = detectedTopic;
        const newConvId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        const newConv = await createConversation({
          id: newConvId,
          userId: currentUserId,
          title: detectedTopic,
          topic: detectedTopic,
          subject: querySubject,
          classLevel,
        });
        targetConvId = newConvId;
        setActiveConversationId(newConvId);
        setConversations((prev) => [newConv, ...prev.filter((c) => c.id !== newConvId)]);
      }

      // 2. Append User message immediately to the conversation
      const userMsg = await appendMessageToConversation(targetConvId, {
        userId: currentUserId,
        role: 'user',
        content: queryText || 'फोटो आधारित प्रश्न',
        contentType: image ? 'image' : (recStatus === 'transcribing' ? 'voice' : 'text'),
        image: imagePreview || undefined,
      });

      setMessages((prev) => [...prev, userMsg]);

      // 3. Prepare previous conversation context (last 8 turns)
      const recentHistory = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const idToken = user ? await user.getIdToken() : '';
      const response = await fetch('/api/solve-doubt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          question: queryText,
          image,
          classLevel,
          subject: querySubject,
          difficulty: queryDifficulty,
          languagePreference,
          stream: true,
          conversationHistory: recentHistory,
          topic: targetTopic,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        let errMsg = 'अभी समाधान तैयार नहीं हो पाया। कृपया कुछ सेकंड बाद फिर प्रयास करें।';
        try {
          const data = await response.json();
          errMsg = data.error || errMsg;
        } catch {
          // fallback
        }
        throw new Error(errMsg);
      }

      if (!response.body) {
        throw new Error('प्रतिक्रिया स्ट्रीम उपलब्ध नहीं है।');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedSolution = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamedSolution += chunk;
        setStreamingContent(streamedSolution);
        setSolution(streamedSolution);
      }

      // Handle custom internal stream error messages
      if (streamedSolution.includes('[ERROR]:')) {
        const parts = streamedSolution.split('[ERROR]:');
        const finalSol = parts[0].trim();
        const errSol = parts[1].trim();
        setSolution(finalSol || null);
        throw new Error(errSol || 'स्ट्रीमिंग के दौरान त्रुटि आई।');
      }

      if (!streamedSolution.trim()) {
        throw new Error('खाली समाधान प्राप्त हुआ। कृपया फिर प्रयास करें।');
      }

      // 4. Append Assistant message to conversation
      const nowIso = new Date().toISOString();
      const assistantMsg = await appendMessageToConversation(
        targetConvId,
        {
          userId: currentUserId,
          role: 'assistant',
          content: streamedSolution,
          contentType: 'text',
        },
        {
          lastMessageAt: nowIso,
          updatedAt: nowIso,
          lastSnippet: streamedSolution.slice(0, 90).replace(/\n/g, ' '),
        }
      );

      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingContent(null);

      // Update conversations list in state
      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? {
                ...c,
                lastMessageAt: nowIso,
                updatedAt: nowIso,
                messageCount: (c.messageCount || 0) + 2,
                lastSnippet: streamedSolution.slice(0, 90).replace(/\n/g, ' '),
              }
            : c
        )
      );

      // Save to local history upon successful full delivery (backward compatibility)
      const newDoubt: SavedDoubt = {
        id: 'doubt-' + Date.now(),
        question: queryText || 'फोटो आधारित प्रश्न',
        subject: querySubject,
        classLevel,
        difficulty: queryDifficulty,
        solution: streamedSolution,
        timestamp: new Date().toLocaleDateString('hi-IN', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        image: imagePreview || undefined,
      };

      const updated = [newDoubt, ...savedDoubts.filter((d) => d.question !== queryText)].slice(0, 20);
      setSavedDoubts(updated);
      localStorage.setItem('rk_solved_doubts', JSON.stringify(updated));

      // Clear input fields ONLY after successful fully-received response
      if (!customQuestion) {
        setQuestion('');
        removeImage();
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('अनुरोध का समय समाप्त (Timeout) या निरस्त। कृपया इंटरनेट कनेक्शन चेक करें और फिर प्रयास करें।');
        return;
      }
      console.error('Solve doubt error:', err);
      if (err.message && err.message.includes('Internet')) {
        setError('Internet connection check करें और फिर प्रयास करें।');
      } else {
        setError(err.message || 'अभी समाधान तैयार नहीं हो पाया। कृपया कुछ सेकंड बाद फिर प्रयास करें।');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (solution) {
      navigator.clipboard.writeText(solution);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const deleteDoubt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedDoubts.filter((d) => d.id !== id);
    setSavedDoubts(filtered);
    localStorage.setItem('rk_solved_doubts', JSON.stringify(filtered));
  };

  // Curated Popular / Practice Doubts covering Math, Science & Social Science
  const popularDoubts = [
    {
      label: 'द्विघात समीकरण हल',
      text: 'समीकरण 2x² - 7x + 3 = 0 को द्विघाती सूत्र से हल करें और मूलों की प्रकृति बताएं।',
      subject: 'Mathematics',
      classLevel: 'class-10',
      difficulty: 'hard',
      badge: 'गणित • Hard',
    },
    {
      label: 'ओम का नियम सत्यापन',
      text: 'ओम का नियम क्या है? V = IR का सत्यापन और परिपथ आरेख का विवरण दें।',
      subject: 'Physics',
      classLevel: 'class-10',
      difficulty: 'medium',
      badge: 'भौतिकी • Board VVI',
    },
    {
      label: 'प्रकाश संश्लेषण समीकरण',
      text: 'प्रकाश संश्लेषण की परिभाषा, संतुलित रासायनिक समीकरण और इसके दो चरणों का वर्णन करें।',
      subject: 'Biology',
      classLevel: 'class-10',
      difficulty: 'medium',
      badge: 'जीव विज्ञान',
    },
    {
      label: '1857 क्रांति व कुंवर सिंह',
      text: '1857 के प्रथम स्वतंत्रता संग्राम के कारण और बिहार में बाबू वीर कुंवर सिंह की भूमिका पर प्रकाश डालें।',
      subject: 'History',
      classLevel: 'class-10',
      difficulty: 'medium',
      badge: 'इतिहास',
    },
    {
      label: 'कैलकुलस अवकलन (Class 12)',
      text: 'फलन y = (sin x)^(cos x) का x के सापेक्ष अवकलन ज्ञात कीजिए।',
      subject: 'Mathematics',
      classLevel: 'class-12',
      difficulty: 'hard',
      badge: '12th गणित • Hard',
    },
    {
      label: 'जल संसाधन संरक्षण',
      text: 'जल संसाधन के अत्यधिक दोहन से उत्पन्न समस्याएं और संरक्षण के 4 प्रमुख उपाय लिखिए।',
      subject: 'Geography',
      classLevel: 'class-10',
      difficulty: 'easy',
      badge: 'भूगोल',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-blue-800/40 text-left space-y-4">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>प्रिंस सर शैक्षणिक प्रणाली • AI शंका समाधान</span>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                कक्षा 1 से 12 तक पूर्ण सक्रिय
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowMobileSidebar(true)}
              className="lg:hidden px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer border border-white/20 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-300" />
              <span>विषय चैट्स ({conversations.length})</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            पूछें और सीखें — तुरंत AI शंका समाधान!
          </h1>
          <p className="text-sm sm:text-base text-indigo-100 max-w-3xl leading-relaxed font-medium">
            गणित, विज्ञान, सामाजिक विज्ञान या किसी भी विषय का कोई भी सवाल हो — अपनी कक्षा व कठिनाई स्तर चुनें, सवाल लिखें या फोटो अपलोड करें। AI आपको चरणबद्ध एवं सटीक उत्तर देगा।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Solved Result (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6">
          {activeConversation && messages.length > 0 ? (
            <DoubtChatThread
              conversation={activeConversation}
              messages={messages}
              loading={loading}
              loadingMessages={loadingMessages}
              loadingStep={loadingStep}
              streamingContent={streamingContent}
              onSendMessage={solveDoubt}
              question={question}
              setQuestion={setQuestion}
              image={image}
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              onRemoveImage={removeImage}
              isRecording={isRecording}
              recStatus={recStatus}
              micError={micError}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onCancelRecording={cancelRecording}
              error={error}
              onNewChat={startNewChat}
              onOpenMobileDrawer={() => setShowMobileSidebar(true)}
              onRenameTopic={async (newTitle) => {
                await renameConversation(activeConversation.id, currentUserId, newTitle);
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === activeConversation.id ? { ...c, title: newTitle, topic: newTitle } : c
                  )
                );
              }}
              speakingMessageId={speakingMessageId}
              isPlayingSpeech={isPlayingSpeech}
              isPausedSpeech={isPausedSpeech}
              onPlaySpeech={playSpeechForMessage}
              onStopSpeech={stopCurrentSpeech}
              SolutionRendererComponent={SolutionRenderer}
            />
          ) : (
            <>
              {/* Main Question Input Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xs space-y-6 text-left">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>अपनी शंका दर्ज करें</span>
              </h2>

              <span className="text-2xs font-extrabold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                शत-प्रतिशत प्रामाणिक बोर्ड पाठ्यक्रम
              </span>
            </div>

            <form onSubmit={(e) => solveDoubt(e)} className="space-y-5">
              {/* Selectors Grid: Class, Subject, Difficulty, Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Class Selector (Classes 1 to 12) */}
                <div className="space-y-1.5">
                  <label className="text-2xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    <span>कक्षा (Class)</span>
                  </label>
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border-2 border-slate-200 hover:border-blue-300 focus:border-blue-600 focus:outline-hidden font-bold text-xs sm:text-sm text-slate-800 bg-slate-50/70 transition-colors"
                  >
                    {ACADEMIC_CLASSES.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Subject Selector (Dynamic per Class) */}
                <div className="space-y-1.5">
                  <label className="text-2xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>विषय (Subject)</span>
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border-2 border-slate-200 hover:border-blue-300 focus:border-blue-600 focus:outline-hidden font-bold text-xs sm:text-sm text-slate-800 bg-slate-50/70 transition-colors"
                  >
                    {availableSubjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Difficulty Level Selector */}
                <div className="space-y-1.5">
                  <label className="text-2xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-amber-600" />
                    <span>कठिनाई (Difficulty)</span>
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border-2 border-slate-200 hover:border-blue-300 focus:border-blue-600 focus:outline-hidden font-bold text-xs sm:text-sm text-slate-800 bg-slate-50/70 transition-colors"
                  >
                    {DIFFICULTY_OPTIONS.map((diff) => (
                      <option key={diff.id} value={diff.id}>
                        {diff.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Language Selector */}
                <div className="space-y-1.5">
                  <label className="text-2xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>उत्तर भाषा</span>
                  </label>
                  <select
                    value={languagePreference}
                    onChange={(e) => setLanguagePreference(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border-2 border-slate-200 hover:border-blue-300 focus:border-blue-600 focus:outline-hidden font-bold text-xs sm:text-sm text-slate-800 bg-slate-50/70 transition-colors"
                  >
                    <option value="auto">✨ ऑटो डिटेक्ट (Auto)</option>
                    <option value="hindi">हिंदी (Hindi)</option>
                    <option value="english">English (अंग्रेजी)</option>
                    <option value="hinglish">हिंग्लिश (Hinglish)</option>
                  </select>
                </div>
              </div>

              {/* Question Textarea with Voice Recognition integration */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-2xs font-black text-slate-600 uppercase tracking-wider">
                    अपना सवाल लिखें (Type Doubt)
                  </label>
                  
                  {/* Microphone Action Buttons */}
                  <div className="flex items-center gap-2">
                    {isRecording ? (
                      <div className="flex items-center gap-1.5 animate-pulse bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                        <span className="text-rose-700 text-3xs font-extrabold uppercase">
                          {recStatus === 'listening' ? '🔴 Recording...' : 'Transcribing...'}
                        </span>
                        <button
                          type="button"
                          onClick={cancelRecording}
                          className="p-1 hover:bg-rose-100 rounded-md text-rose-700 font-bold text-3xs flex items-center gap-0.5 ml-1.5 cursor-pointer"
                          title="रिकॉर्डिंग रद्द करें"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="px-2 py-0.5 bg-rose-600 text-white rounded-md font-bold text-3xs uppercase tracking-wider hover:bg-rose-700 cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={startRecording}
                        className="py-1.5 px-3 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-800 text-3xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-102 transition-transform"
                        style={{ minHeight: '44px' }}
                        aria-label="बोलकर पूछें"
                      >
                        <span className="text-base">🎤</span>
                        <span>बोलकर पूछें (Voice Input)</span>
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  value={question}
                  onChange={(e) => {
                    setQuestion(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={
                    recStatus === 'listening'
                      ? 'सुन रहा हूँ... कृपया अपना सवाल स्पष्ट बोलें।'
                      : recStatus === 'transcribing'
                      ? 'आवाज़ को टेक्स्ट में बदला जा रहा है...'
                      : 'यहाँ अपना प्रश्न विस्तार से लिखें... (उदा: यदि किसी वृत्त की त्रिज्या 7 सेमी हो तो उसका क्षेत्रफल और परिधि ज्ञात कीजिए?)'
                  }
                  rows={4}
                  className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-blue-600 focus:outline-hidden font-medium text-slate-800 placeholder-slate-400 bg-slate-50/60 text-sm sm:text-base leading-relaxed transition-colors"
                  disabled={isRecording}
                />

                {/* Inline Microphone error / permission alerts */}
                {micError && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-3xs font-bold flex items-center gap-2 animate-fadeIn">
                    <span>⚠️</span>
                    <span>{micError}</span>
                  </div>
                )}
              </div>

              {/* Image Upload Area */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-2xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>या प्रश्न की फोटो अपलोड करें (Upload Image)</span>
                  </label>
                  <span className="text-3xs text-slate-400 font-bold">हस्तलिखित / मुद्रित फोटो</span>
                </div>

                {!imagePreview ? (
                  <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-800">
                      फोटो चुनने या खींचने के लिए यहाँ क्लिक करें
                    </span>
                    <span className="text-2xs text-slate-500 font-medium">
                      JPG, PNG, JPEG समर्थित (अधिकतम 12MB)
                    </span>
                  </label>
                ) : (
                  <div className="relative rounded-2xl border-2 border-slate-200 bg-slate-50 p-2.5 flex items-center justify-between gap-3 max-w-md">
                    <div className="flex items-center gap-3">
                      <img
                        src={imagePreview}
                        alt="Question Preview"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-300 shrink-0"
                      />
                      <div className="text-left">
                        <span className="text-xs font-bold text-slate-800 block truncate max-w-[180px]">
                          प्रश्न पत्र की तस्वीर
                        </span>
                        <span className="text-2xs text-emerald-600 font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          सफलतापूर्वक संलग्न
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                      title="तस्वीर हटाएं"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button with in-flight lock */}
              <button
                type="submit"
                disabled={loading || (!question.trim() && !image)}
                className="w-full py-4 px-6 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-black text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md shadow-blue-700/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>समाधान तैयार हो रहा है…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 fill-white" />
                    <span>समाधान प्राप्त करें (Solve Doubt AI)</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* Error Message & Retry Banner */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-900 text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-extrabold">{error}</p>
                    <p className="text-2xs text-slate-500 font-medium">
                      कृपया पुनः प्रयास करें या प्रश्न को स्पष्ट रूप से लिखें।
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => solveDoubt()}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider cursor-pointer transition-colors shadow-xs shrink-0 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>फिर प्रयास करें</span>
                </button>
              </div>
            )}
          </div>

          {/* AI Loader Card */}
          {loading && (
            <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center text-center space-y-5 animate-pulse border border-slate-800">
              <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-black">AI शंका निवारक सक्रिय है</h3>
                <p className="text-blue-200 text-sm sm:text-base font-semibold max-w-md leading-relaxed">
                  {loadingMessages[loadingStep]}
                </p>
              </div>
              <div className="w-44 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full animate-pulse" style={{ width: '80%' }} />
              </div>
            </div>
          )}

          {/* Solution Display Area */}
          {solution && (
            <div className="bg-white rounded-3xl border-2 border-blue-500 shadow-md p-6 sm:p-8 text-left space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-700 text-white font-black flex items-center justify-center text-sm shadow-md">
                    RK
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      प्रिंस सर (RK STUDY CENTRE)
                    </h3>
                    <div className="text-2xs text-blue-700 font-black uppercase flex items-center gap-1">
                      <span>सत्यापित शैक्षणिक समाधान पत्र</span>
                      <span>•</span>
                      <span>{classLevel.replace('class-', 'Class ')}</span>
                      {difficulty !== 'medium' && <span>• {difficulty.toUpperCase()}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Text-To-Speech Reader Controls */}
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl">
                    {isPlayingSpeech ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={pauseSpeechAnswer}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-3xs flex items-center gap-1 cursor-pointer transition-colors"
                          title="बोलना रोकें (Pause)"
                        >
                          ⏸️ विराम
                        </button>
                        <button
                          type="button"
                          onClick={stopSpeechAnswer}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-3xs flex items-center gap-1 cursor-pointer transition-colors"
                          title="बोलना बंद करें (Stop)"
                        >
                          ⏹️ बंद करें
                        </button>
                      </div>
                    ) : isPausedSpeech ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={playSpeechAnswer}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-3xs flex items-center gap-1 cursor-pointer transition-colors"
                          title="बोलना फिर शुरू करें (Resume)"
                        >
                          ▶️ पुनः सुनें
                        </button>
                        <button
                          type="button"
                          onClick={stopSpeechAnswer}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-3xs flex items-center gap-1 cursor-pointer transition-colors"
                          title="बोलना बंद करें (Stop)"
                        >
                          ⏹️ बंद करें
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={playSpeechAnswer}
                        className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-black text-3xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-102"
                        title="समाधान सुनें"
                        aria-label="समाधान सुनें"
                      >
                        <span>🔊</span>
                        <span>सुनें (Listen Answer)</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-bold"
                    title="उत्तर कॉपी करें"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-black">कॉपी हो गया!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>कॉपी करें</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Solution Box */}
              <div className="bg-slate-50/80 p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs">
                <SolutionRenderer text={solution} />
              </div>

              {/* Action buttons after solution */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSolution(null);
                      setQuestion('');
                      removeImage();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Sparkles className="w-4 h-4 fill-white" />
                    <span>नई शंका पूछें</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const followUpPrefix = 'इस उत्तर के संदर्भ में मेरा अगला प्रश्न यह है: ';
                      setQuestion(followUpPrefix);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-colors border border-slate-200"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-700" />
                    <span>फॉलो-अप प्रश्न पूछें</span>
                  </button>
                </div>

                <span className="text-2xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  ✓ शत-प्रतिशत प्रामाणिक बोर्ड पद्धति
                </span>
              </div>
            </div>
          )}

          {/* Popular / Practice Doubts Grid */}
          <div className="bg-slate-50 rounded-3xl p-6 sm:p-7 border-2 border-slate-200 text-left space-y-4">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>अक्सर पूछे जाने वाले महत्वपूर्ण प्रश्न (1-Click Practice)</span>
              </h3>
              <p className="text-slate-600 text-xs font-semibold">
                AI डाउट सॉल्वर की कार्यप्रणाली का तुरंत परीक्षण करने के लिए किसी भी प्रश्न पर क्लिक करें:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {popularDoubts.map((doubt, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuestion(doubt.text);
                    setSubject(doubt.subject);
                    setClassLevel(doubt.classLevel);
                    setDifficulty(doubt.difficulty);
                    solveDoubt(undefined, doubt.text, doubt.subject, doubt.difficulty);
                  }}
                  className="p-3.5 bg-white hover:bg-blue-50 hover:border-blue-300 rounded-2xl border border-slate-200 transition-all text-left flex items-start justify-between gap-3 cursor-pointer text-xs sm:text-sm font-bold text-slate-800 shadow-xs group"
                >
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-3xs font-black uppercase">
                      {doubt.badge}
                    </span>
                    <p className="leading-snug text-slate-800 group-hover:text-blue-900">{doubt.text}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0 mt-1" />
                </button>
              ))}
            </div>
          </div>
            </>
          )}
        </div>

        {/* Right Column: Topic Conversations Hub (ChatGPT-Style) */}
        <div className="hidden lg:block lg:col-span-4">
          <DoubtConversationsSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={selectConversation}
            onNewChat={startNewChat}
            onRename={handleRename}
            onDelete={handleDeleteConv}
            onToggleArchive={handleToggleArchive}
            savedDoubtsCount={savedDoubts.length}
            onOpenSavedHistory={() => setShowHistoryModal(true)}
          />
        </div>
      </div>

      {/* Mobile Drawer for Conversations Hub */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMobileSidebar(false)}
          />
          <div className="relative ml-auto w-full max-w-sm bg-slate-100 h-full p-4 overflow-y-auto shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>विषय चैट्स</span>
              </span>
              <button
                type="button"
                onClick={() => setShowMobileSidebar(false)}
                className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <DoubtConversationsSidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={selectConversation}
              onNewChat={startNewChat}
              onRename={handleRename}
              onDelete={handleDeleteConv}
              onToggleArchive={handleToggleArchive}
              savedDoubtsCount={savedDoubts.length}
              onOpenSavedHistory={() => setShowHistoryModal(true)}
              onCloseMobileDrawer={() => setShowMobileSidebar(false)}
            />
          </div>
        </div>
      )}

      {/* History Modal for Full View */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[80vh] flex flex-col text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>संपूर्ण हल इतिहास ({savedDoubts.length})</span>
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {savedDoubts.map((doubt) => (
                <div
                  key={doubt.id}
                  onClick={() => {
                    setSolution(doubt.solution);
                    setShowHistoryModal(false);
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                  className="p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-2xl cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        {doubt.subject}
                      </span>
                      <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                        {doubt.classLevel.replace('class-', 'Class ')}
                      </span>
                    </div>
                    <span className="text-3xs text-slate-400 font-semibold">{doubt.timestamp}</span>
                  </div>
                  <p className="text-slate-800 text-sm font-bold">{doubt.question}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setSavedDoubts([]);
                  localStorage.removeItem('rk_solved_doubts');
                  setShowHistoryModal(false);
                }}
                className="text-xs font-extrabold text-rose-600 hover:text-rose-800 cursor-pointer"
              >
                पूरा इतिहास हटाएं
              </button>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-xs cursor-pointer"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
