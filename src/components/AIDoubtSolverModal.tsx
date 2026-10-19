/**
 * RK STUDY CENTRE - AI Doubt Solver & Personal Tutor (Class 9 - Class 12)
 * Fast, accurate, student-friendly AI tutor supporting Board, Class, Stream, Subject, Chapter, and Question Type context.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Camera,
  X,
  BookOpen,
  GraduationCap,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  RefreshCcw,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AIDoubtSolverModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const BOARDS = ['BSEB (बिहार बोर्ड)', 'CBSE', 'ICSE / ISC', 'Other Board'];
const CLASSES = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];
const STREAMS = ['Science', 'Commerce', 'Arts', 'General / Middle'];
const SUBJECTS = [
  'Auto Detect',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Science',
  'Social Science',
  'History',
  'Geography',
  'Civics / Political Science',
  'Economics',
  'Sanskrit',
  'Computer Science',
  'E-Commerce',
  'Hindi',
  'English'
];

const QUESTION_TYPES = [
  'Auto Detect',
  'MCQ',
  'Very Short Answer',
  'Short Answer',
  'Long Answer',
  'Numerical',
  'Concept',
  'Definition',
  'Formula',
  'Derivation',
  'Diagram',
  'Assertion-Reason',
  'HOTS',
  'Case-Based',
  'Translation',
  'Grammar',
  'Coding/Programming'
];

export const AIDoubtSolverModal: React.FC<AIDoubtSolverModalProps> = ({
  isOpen,
  onClose,
  initialQuestion = ''
}) => {
  const { user } = useAuth();
  const [question, setQuestion] = useState(initialQuestion);
  const [selectedBoard, setSelectedBoard] = useState('BSEB (बिहार बोर्ड)');
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedStream, setSelectedStream] = useState('Science');
  const [selectedSubject, setSelectedSubject] = useState('Auto Detect');
  const [chapterName, setChapterName] = useState('प्रकाश का परावर्तन (Light)');
  const [selectedQuestionType, setSelectedQuestionType] = useState('Auto Detect');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'नमस्ते! मैं **AI Doubt** हूँ। बोर्ड, कक्षा, विषय, अध्याय और प्रश्न के प्रकार (Question Type) के अनुसार सटीक और परीक्षा-उपयोगी उत्तर प्राप्त करने के लिए अपना प्रश्न पूछें।\n\n**फॉर्मेट:**\nBoard: BSEB | Class: 10 | Stream: Science | Subject: Physics | Chapter: Light | Question Type: Numerical | Question: ...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion);
    }
  }, [initialQuestion]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setImagePreview(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!question.trim() && !imagePreview) || isLoading) return;

    const userText = question.trim();
    const currentImg = imagePreview;

    const compactQuery = `Board: ${selectedBoard} | Class: ${selectedClass} | Stream: ${selectedStream} | Subject: ${selectedSubject} | Chapter: ${chapterName} | Question Type: ${selectedQuestionType} | Question: ${userText}`;

    const userMsg: Message = {
      role: 'user',
      content: compactQuery + (currentImg ? ' [🖼️ प्रश्न की तस्वीर संलग्न]' : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setImagePreview(null);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const token = user ? await user.getIdToken() : '';
      const response = await fetch('/api/solve-doubt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          question: userText,
          image: currentImg,
          boardName: selectedBoard,
          classLevel: selectedClass,
          streamName: selectedStream,
          subject: selectedSubject,
          chapterName: chapterName,
          questionType: selectedQuestionType,
          syllabusName: '2026-27 Academic Year',
          mediumName: 'Hindi / English',
          languagePreference: 'auto',
          isTestMode: !user
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'शंका समाधान में त्रुटि हुई। कृपया पुनः प्रयास करें।');
      }

      const aiMsg: Message = {
        role: 'assistant',
        content: data.solution || 'उत्तर प्राप्त हुआ।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setErrorMsg(err.message || 'नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col border-2 border-indigo-500/30 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-700 via-blue-800 to-slate-900 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg font-black text-xl">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-2xs font-black bg-amber-400 text-slate-950 uppercase">
                  AI Doubt Assistant
                </span>
                <span className="text-2xs bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                  Compact Template Active (2026-27)
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black">AI शंका समाधान (Class 9–12)</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compact Student Input Template Bar with 6 grid items on desktop */}
        <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-6 gap-2 shrink-0 text-xs font-bold">
          <div>
            <label className="block text-3xs text-slate-500 dark:text-slate-400 uppercase font-black mb-1">Board</label>
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-semibold shadow-xs cursor-pointer focus:ring-2 focus:ring-indigo-500"
            >
              {BOARDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-3xs text-slate-500 dark:text-slate-400 uppercase font-black mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-semibold shadow-xs cursor-pointer focus:ring-2 focus:ring-indigo-500"
            >
              {CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-3xs text-slate-500 dark:text-slate-400 uppercase font-black mb-1">Stream</label>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-semibold shadow-xs cursor-pointer focus:ring-2 focus:ring-indigo-500"
            >
              {STREAMS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-3xs text-slate-500 dark:text-slate-400 uppercase font-black mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-semibold shadow-xs cursor-pointer focus:ring-2 focus:ring-indigo-500"
            >
              {SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-3xs text-slate-500 dark:text-slate-400 uppercase font-black mb-1">Chapter</label>
            <input
              type="text"
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
              placeholder="अध्याय..."
              className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-semibold shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-3xs text-slate-500 dark:text-slate-400 uppercase font-black mb-1">Question Type</label>
            <select
              value={selectedQuestionType}
              onChange={(e) => setSelectedQuestionType(e.target.value)}
              className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-semibold shadow-xs cursor-pointer focus:ring-2 focus:ring-indigo-500"
            >
              {QUESTION_TYPES.map((qt) => (
                <option key={qt} value={qt}>{qt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50 dark:bg-slate-950/50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs font-medium'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs'
                }`}
              >
                {msg.content}
              </div>
              <span className="text-3xs text-slate-400 dark:text-slate-500 mt-1 px-1 font-semibold">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xs shadow-sm">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                AI Doubt उत्तर तैयार कर रहा है...
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 space-y-3">
          {imagePreview && (
            <div className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 w-fit">
              <img src={imagePreview} alt="Upload preview" className="w-12 h-12 object-cover rounded-lg" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">तस्वीर संलग्न है</span>
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="p-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="प्रश्न की तस्वीर अपलोड करें"
            >
              <Camera className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="अपना प्रश्न यहाँ पूछें (जैसे: Mirror formula क्या है?)..."
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-indigo-500 shadow-inner"
            />

            <button
              type="submit"
              disabled={isLoading || (!question.trim() && !imagePreview)}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 text-white font-black text-sm transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">पूछें</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
