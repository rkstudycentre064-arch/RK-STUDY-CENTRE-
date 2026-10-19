import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  Award,
  ArrowRight,
  Sparkles,
  Smartphone,
  Zap,
  Target,
  FileCheck,
  WifiOff,
  CheckCircle2,
  TrendingUp,
  GraduationCap,
  DownloadCloud,
  Layers,
  ChevronRight,
  Compass
} from 'lucide-react';
import type { MainNavRoute, ClassLevel } from '../types';
import { getCacheStorageStats } from '../services/offlineStorage';
import { getSWState, subscribeSWState } from '../services/serviceWorkerRegistration';

interface HeroSectionProps {
  onNavigate: (route: MainNavRoute, params?: { 
    classLevel?: ClassLevel; 
    subjectSlug?: string; 
    bookSlug?: string; 
    chapterSlug?: string; 
  }) => void;
  onOpenOfflineHub?: () => void;
  onOpenTirangaQuiz?: () => void;
  onOpenMarathonTest?: () => void;
  onOpenPhysicsMarathon?: () => void;
  onOpenPhysicsCh02Marathon?: () => void;
  onOpenPhysics12Ch01Marathon?: () => void;
  websiteName?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigate,
  onOpenOfflineHub,
  onOpenTirangaQuiz,
  onOpenMarathonTest,
  onOpenPhysicsMarathon,
  onOpenPhysicsCh02Marathon,
  onOpenPhysics12Ch01Marathon,
  websiteName = 'RK STUDY CENTRE',
}) => {
  const [offlineStats, setOfflineStats] = useState(() => getCacheStorageStats());
  const [swState, setSwState] = useState(() => getSWState());
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    // Refresh offline stats
    setOfflineStats(getCacheStorageStats());

    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      setOfflineStats(getCacheStorageStats());
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    const unsubscribe = subscribeSWState((state) => {
      setSwState(state);
    });

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      unsubscribe();
    };
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl sm:rounded-4xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/40 p-6 sm:p-10 lg:p-14 transition-all">
      {/* Background Architectural Accent Grid & Subtle Academic Blueprint Lines */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-60 pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-50/60 rounded-full blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column: Heading, Subheading, CTAs, Class Jump & Trust Badges (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-7 text-left">
          {/* Brand Tagline / Academic Positioning Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-900 text-xs sm:text-sm font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
            <span className="truncate">{websiteName} • विश्वसनीय शैक्षणिक मंच</span>
            <span className="hidden sm:inline text-blue-400">|</span>
            <span className="hidden sm:inline text-slate-600 font-semibold">बिहार बोर्ड स्पेशल</span>
          </div>

          {/* Main Heading */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.12]">
              पढ़ाई आसान,{' '}
              <span className="relative inline-block text-blue-700">
                सफलता आसान
                <svg
                  className="absolute -bottom-2 left-0 w-full h-2.5 text-blue-500/30"
                  viewBox="0 0 200 8"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M0 6C50 1 150 1 200 6" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
          </div>

          {/* Subheading */}
          <p className="text-slate-700 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl">
            <strong className="text-slate-900 font-bold">{websiteName}</strong> के साथ पढ़ें स्मार्ट तरीके से — 
            बेहतर Notes, महत्वपूर्ण प्रश्न, परीक्षा की तैयारी और गुणवत्तापूर्ण अध्ययन सामग्री एक ही जगह।
          </p>

          {/* Primary & Secondary Call to Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
            <button
              id="hero-primary-start-study-btn"
              type="button"
              onClick={() => onNavigate('classes')}
              className="px-7 py-4 rounded-xl font-black bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white shadow-lg shadow-blue-700/25 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-base sm:text-lg group"
            >
              <span>अभी पढ़ाई शुरू करें</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              id="hero-secondary-study-materials-btn"
              type="button"
              onClick={() => onNavigate('study-material')}
              className="px-6 py-4 rounded-xl font-bold bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-900 border border-slate-300/90 shadow-xs flex items-center justify-center gap-2.5 transition-all hover:border-blue-400 cursor-pointer text-base sm:text-lg group"
            >
              <FileText className="w-5 h-5 text-blue-700 stroke-[2.2] group-hover:scale-110 transition-transform" />
              <span>Study Materials देखें</span>
            </button>
          </div>

          {/* Quick Class Selector Bar */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>कक्षा अनुसार अध्ययन सामग्री:</span>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => onNavigate('classes', { classLevel: 'class-9' })}
                className="py-2.5 px-3 rounded-xl font-extrabold text-sm text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-800 border border-slate-200/80 transition-all text-center cursor-pointer shadow-2xs"
              >
                कक्षा 9वीं
              </button>
              <button
                type="button"
                onClick={() => onNavigate('classes', { classLevel: 'class-10' })}
                className="py-2.5 px-3 rounded-xl font-black text-sm text-blue-800 bg-blue-50/90 hover:bg-blue-100 border border-blue-200 transition-all text-center cursor-pointer shadow-2xs"
              >
                कक्षा 10वीं (मैट्रिक)
              </button>
              <button
                type="button"
                onClick={() => onNavigate('classes', { classLevel: 'class-11' })}
                className="py-2.5 px-3 rounded-xl font-extrabold text-sm text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-800 border border-slate-200/80 transition-all text-center cursor-pointer shadow-2xs"
              >
                कक्षा 11वीं
              </button>
              <button
                type="button"
                onClick={() => onNavigate('classes', { classLevel: 'class-12' })}
                className="py-2.5 px-3 rounded-xl font-black text-sm text-blue-800 bg-blue-50/90 hover:bg-blue-100 border border-blue-200 transition-all text-center cursor-pointer shadow-2xs"
              >
                कक्षा 12वीं (इंटर)
              </button>
            </div>
          </div>

          {/* Trust Elements Highlight Row */}
          <div className="pt-2">
            <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2.5">
              प्लेटफ़ॉर्म की मुख्य विशेषताएं:
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs">
                <span>📚</span>
                <span>गुणवत्तापूर्ण Study Materials</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs">
                <span>📝</span>
                <span>Exam-Focused Notes</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs">
                <span>🎯</span>
                <span>महत्वपूर्ण प्रश्न</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs">
                <span>📱</span>
                <span>Mobile Friendly Learning</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs">
                <span>⚡</span>
                <span>Fast & Easy Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Open Book, Digital Learning Mockup, Academic Upward Progress & Offline Feature Card (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Visual Composition: Open Book / Digital Notebook Card */}
          <div className="relative rounded-2xl bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 shadow-xl border border-slate-800 overflow-hidden">
            {/* Ambient Lighting in Card */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top Bar with Topper Badge */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs">
              <div className="flex items-center gap-1.5 text-blue-300 font-bold">
                <BookOpen className="w-4 h-4 text-amber-400 stroke-[2.2]" />
                <span>डिजिटल लर्निंग नोटबुक</span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-2xs border border-emerald-400/30">
                <CheckCircle2 className="w-3 h-3" />
                <span>Topper Verified</span>
              </div>
            </div>

            {/* Simulated Open Handwritten Note Preview */}
            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-2xs text-slate-300 font-bold">
                <span className="px-2 py-0.5 rounded bg-blue-500/30 text-blue-200">
                  भौतिकी • कक्षा 10वीं
                </span>
                <span>अध्याय 4: विद्युत धारा</span>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-slate-200 font-medium">
                <div className="flex items-start gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-amber-400 font-black">★</span>
                  <p className="leading-snug">
                    <strong className="text-white font-bold">ओम का नियम:</strong> $V = IR$ (अचर ताप पर चालक के सिरों का विभवांतर उसमें प्रवाहित धारा के समानुपाती होता है)।
                  </p>
                </div>
                <div className="flex items-start gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-amber-400 font-black">★</span>
                  <p className="leading-snug">
                    <strong className="text-white font-bold">जूल का तापन नियम:</strong> $H = I^2Rt$ (विद्युत हीटर, बल्ब व फ्यूज का कार्य सिद्धांत)।
                  </p>
                </div>
              </div>

              {/* Progress & Test Highlights */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-center text-xs">
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <div className="text-base font-black text-white">114 VVI</div>
                  <div className="text-3xs text-slate-400 uppercase font-bold">वस्तुनिष्ठ प्रश्नोत्तर</div>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                  <div className="text-base font-black text-emerald-400">100%</div>
                  <div className="text-3xs text-slate-400 uppercase font-bold">बोर्ड परीक्षा स्पेशल</div>
                </div>
              </div>
            </div>

            {/* Upward Progress Metric Badge */}
            <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-xl bg-blue-500/15 border border-blue-400/20 text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">मैट्रिक व इंटर परीक्षा सफलता दर</span>
              </div>
              <span className="font-black text-emerald-300">98.4%</span>
            </div>
          </div>

          {/* ⚡ CLASS 12 PHYSICS CH01 - 300 VVI 'इलेक्ट्रो-ब्रह्मास्त्र' MARATHON BANNER */}
          <div 
            onClick={onOpenPhysics12Ch01Marathon || (() => onNavigate('tests', { classLevel: 'class-12', subjectSlug: 'physics' }))}
            className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-950 text-white shadow-lg shadow-purple-800/30 border-2 border-purple-400 hover:border-amber-300 transition-all transform hover:-translate-y-0.5 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-purple-400/20 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-3.5 relative z-10">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-md font-black text-xl group-hover:scale-110 transition-transform text-amber-300">
                ⚡
              </div>
              <div className="space-y-1.5 grow">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <h3 className="font-black text-white text-sm sm:text-base leading-tight flex items-center gap-1.5">
                    <span>12th Physics Ch-01: वैद्युत आवेश तथा क्षेत्र</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-400 text-slate-950 text-[10px] font-black uppercase shadow-2xs animate-pulse">
                      300 VVI
                    </span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-black/40 text-purple-300 text-[10px] font-mono font-bold">
                    ⏱️ 3 घंटे (180 Min)
                  </span>
                </div>

                <p className="text-xs text-purple-100 font-medium leading-relaxed">
                  Electric Charges & Fields: 300 VVI 'इलेक्ट्रो-ब्रह्मास्त्र' लाइव OMR टेस्ट (2016-2026 बोर्ड स्पेशल PYQs & NCERT Exemplar)!
                </p>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-amber-300 flex items-center gap-1">
                    <span>🔥 12th Board Topper Special</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenPhysics12Ch01Marathon) onOpenPhysics12Ch01Marathon();
                      else onNavigate('tests', { classLevel: 'class-12', subjectSlug: 'physics' });
                    }}
                    className="px-4 py-1.5 bg-purple-400 hover:bg-purple-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <span>⚡ ब्रह्मास्त्र टेस्ट शुरू करें (3 Hr)</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 🔍 CLASS 10 PHYSICS CH02 - 300 VVI 'अमोग अपवर्तन-चक्र' MARATHON BANNER */}
          <div 
            onClick={onOpenPhysicsCh02Marathon || (() => onNavigate('tests', { classLevel: 'class-10', subjectSlug: 'physics' }))}
            className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-700 via-teal-800 to-indigo-950 text-white shadow-lg shadow-cyan-700/25 border-2 border-emerald-400 hover:border-amber-300 transition-all transform hover:-translate-y-0.5 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-3.5 relative z-10">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-md font-black text-xl group-hover:scale-110 transition-transform text-emerald-300">
                🔍
              </div>
              <div className="space-y-1.5 grow">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <h3 className="font-black text-white text-sm sm:text-base leading-tight flex items-center gap-1.5">
                    <span>भौतिकी Ch-02: प्रकाश का अपवर्तन</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase shadow-2xs animate-pulse">
                      300 VVI
                    </span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-black/40 text-emerald-300 text-[10px] font-mono font-bold">
                    ⏱️ 3 घंटे (180 Min)
                  </span>
                </div>

                <p className="text-xs text-cyan-100 font-medium leading-relaxed">
                  प्रकाश का अपवर्तन (Refraction): 300 VVI 'अमोग अपवर्तन-चक्र' लाइव टेस्ट (2016-2026 बिहार बोर्ड PYQs & NCERT)!
                </p>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-amber-300 flex items-center gap-1">
                    <span>🔥 'अपवर्तन-चक्र' लाइव OMR</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenPhysicsCh02Marathon) onOpenPhysicsCh02Marathon();
                      else onNavigate('tests', { classLevel: 'class-10', subjectSlug: 'physics' });
                    }}
                    className="px-4 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <span>🎯 टेस्ट शुरू करें (3 Hr)</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ⚡ CLASS 10 PHYSICS CH01 - 300 VVI AKHAND MARATHON BANNER */}
          <div 
            onClick={onOpenPhysicsMarathon || (() => onNavigate('tests', { classLevel: 'class-10', subjectSlug: 'physics' }))}
            className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-900 text-white shadow-lg shadow-blue-700/25 border-2 border-amber-400 hover:border-amber-300 transition-all transform hover:-translate-y-0.5 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-3.5 relative z-10">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-md font-black text-xl group-hover:scale-110 transition-transform text-amber-300">
                ⚡
              </div>
              <div className="space-y-1.5 grow">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <h3 className="font-black text-white text-sm sm:text-base leading-tight flex items-center gap-1.5">
                    <span>भौतिकी Ch-01 अखंड महामैराथन</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase shadow-2xs animate-pulse">
                      300 VVI
                    </span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-black/40 text-amber-300 text-[10px] font-mono font-bold">
                    ⏱️ 3 घंटे (180 Min)
                  </span>
                </div>

                <p className="text-xs text-blue-100 font-medium leading-relaxed">
                  प्रकाश का परावर्तन: 2016-2026 बिहार बोर्ड के 300 सबसे महत्वपूर्ण वस्तुनिष्ठ प्रश्न। 3 घंटे का रियल-टाइम लाइव टेस्ट!
                </p>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-amber-300 flex items-center gap-1">
                    <span>🔥 100% बोर्ड परीक्षा स्पेशल</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenPhysicsMarathon) onOpenPhysicsMarathon();
                      else onNavigate('tests', { classLevel: 'class-10', subjectSlug: 'physics' });
                    }}
                    className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <span>🔥 अखंड टेस्ट शुरू करें</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 🔥 CLASS 10 HISTORY CH01 - 300 VVI MEGA MARATHON BANNER */}
          <div 
            onClick={onOpenMarathonTest || (() => onNavigate('tests', { classLevel: 'class-10', subjectSlug: 'soc' }))}
            className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-lg shadow-red-600/20 border-2 border-red-400 hover:border-amber-300 transition-all transform hover:-translate-y-0.5 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-3.5 relative z-10">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-md font-black text-xl group-hover:scale-110 transition-transform">
                🔥
              </div>
              <div className="space-y-1.5 grow">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <h3 className="font-black text-white text-sm sm:text-base leading-tight flex items-center gap-1.5">
                    <span>इतिहास Ch-01 महामैराथन टेस्ट</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase shadow-2xs animate-pulse">
                      300 VVI
                    </span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-black/30 text-amber-200 text-[10px] font-mono font-bold">
                    ⏱️ 3 घंटे
                  </span>
                </div>

                <p className="text-xs text-rose-100 font-medium leading-relaxed">
                  बिहार बोर्ड मैट्रिक 2016 से 2026 तक के 300 सबसे महत्वपूर्ण वस्तुनिष्ठ प्रश्न। रियल-टाइम टाइमर, OMR मोड व समाधान!
                </p>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-amber-200 flex items-center gap-1">
                    <span>⚡ 2016-2026 PYQs Special</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenMarathonTest) onOpenMarathonTest();
                      else onNavigate('tests', { classLevel: 'class-10', subjectSlug: 'soc' });
                    }}
                    className="px-3.5 py-1.5 bg-white hover:bg-amber-100 text-red-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🎯 टेस्ट शुरू करें</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ⭐ SMART STUDY TOOLS LAUNCHER CARD */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border-2 border-indigo-500/50 shadow-xl space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <h3 className="font-black text-white text-sm sm:text-base leading-tight">
                  स्मार्ट एजुकेशन टूल्स (Smart Study Hub)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-2xs font-extrabold uppercase">
                Free Tools
              </span>
            </div>

            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              सूत्र व प्रमेय बैंक, डिजिटल OMR शीट प्रैक्टिस लैब, वर्चुअल विज्ञान प्रयोगशाला और दैनिक पोमोडोरो टाइमर।
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('formula-bank')}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all cursor-pointer hover:scale-105"
              >
                <div className="text-base">📐</div>
                <div className="text-2xs font-black text-white mt-1">सूत्र बैंक</div>
                <div className="text-3xs text-slate-400">Formula Vault</div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('study-tracker')}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all cursor-pointer hover:scale-105"
              >
                <div className="text-base">🎯</div>
                <div className="text-2xs font-black text-white mt-1">डेली ट्रैकर</div>
                <div className="text-3xs text-slate-400">Focus Timer</div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('omr-simulator')}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all cursor-pointer hover:scale-105"
              >
                <div className="text-base">📝</div>
                <div className="text-2xs font-black text-white mt-1">OMR शीट</div>
                <div className="text-3xs text-slate-400">50-100 Qs</div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('science-lab')}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all cursor-pointer hover:scale-105"
              >
                <div className="text-base">🔬</div>
                <div className="text-2xs font-black text-white mt-1">साइंस लैब</div>
                <div className="text-3xs text-slate-400">Virtual Lab</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
