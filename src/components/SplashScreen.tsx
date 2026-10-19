import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { cinematicAudio } from '../utils/cinematicAudio';

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { settings } = useSettings();
  const [isVisible, setIsVisible] = useState<boolean>(true);
  
  // High-precision timeline step flags
  const [timelinePhase, setTimelinePhase] = useState<{
    ambient: boolean;      // 0.00s
    logo: boolean;         // 0.40s
    brandName: boolean;    // 1.20s
    tagline: boolean;      // 1.90s
    finalHighlight: boolean; // 2.45s
    transitionOut: boolean;  // 2.75s
  }>({
    ambient: false,
    logo: false,
    brandName: false,
    tagline: false,
    finalHighlight: false,
    transitionOut: false,
  });

  const websiteName = settings.websiteName || 'RK STUDY CENTRE';
  const audioStartedRef = useRef<boolean>(false);

  useEffect(() => {
    // 1. Respect "prefers-reduced-motion" safely
    try {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)')?.matches;

      if (prefersReducedMotion) {
        setIsVisible(false);
        onFinish?.();
        return;
      }
    } catch {
      // Ignore matchMedia errors
    }

    // Absolute failsafe timer to guarantee splash screen dismisses and never blocks UI
    const failsafeTimer = setTimeout(() => {
      setIsVisible(false);
      try {
        sessionStorage.setItem('rk_splash_seen', 'true');
      } catch {
        // Fallback for private browsing
      }
      onFinish?.();
      cinematicAudio.dispose();
    }, 3400);

    // 0.00s - 0.40s: Cinematic Start
    setTimelinePhase((p) => ({ ...p, ambient: true }));
    if (!audioStartedRef.current) {
      audioStartedRef.current = true;
      cinematicAudio.playAmbientSwell();
    }

    // 0.40s - 1.20s: Logo Reveal + soft whoosh
    const tLogo = setTimeout(() => {
      setTimelinePhase((p) => ({ ...p, logo: true }));
      cinematicAudio.playLogoWhoosh();
    }, 400);

    // 1.20s - 1.90s: Brand Name + warm harmonic chime
    const tBrand = setTimeout(() => {
      setTimelinePhase((p) => ({ ...p, brandName: true }));
      cinematicAudio.playBrandChime();
    }, 1200);

    // 1.90s - 2.45s: Tagline Reveal + Knowledge → Learning → Progress → Success
    const tTagline = setTimeout(() => {
      setTimelinePhase((p) => ({ ...p, tagline: true }));
    }, 1900);

    // 2.45s - 2.75s: Final Brand Highlight + light sweep + resolution chime
    const tFinal = setTimeout(() => {
      setTimelinePhase((p) => ({ ...p, finalHighlight: true }));
      cinematicAudio.playResolutionChime();
    }, 2450);

    // 2.75s - 3.00s: Transition Out to Website
    const tTransition = setTimeout(() => {
      setTimelinePhase((p) => ({ ...p, transitionOut: true }));
      setIsVisible(false);
    }, 2750);

    // Complete transition and cleanup
    const tFinish = setTimeout(() => {
      try {
        sessionStorage.setItem('rk_splash_seen', 'true');
      } catch {
        // Fallback for private browsing
      }
      onFinish?.();
      cinematicAudio.dispose();
    }, 3100);

    // Keyboard escape listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVisible(false);
        onFinish?.();
        cinematicAudio.dispose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(failsafeTimer);
      clearTimeout(tLogo);
      clearTimeout(tBrand);
      clearTimeout(tTagline);
      clearTimeout(tFinal);
      clearTimeout(tTransition);
      clearTimeout(tFinish);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onFinish]);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem('rk_splash_seen', 'true');
    } catch {
      // Ignore
    }
    onFinish?.();
    cinematicAudio.dispose();
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.aside
          key="rk-cinematic-splash"
          onClick={handleDismiss}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.015 }}
          transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden select-none cursor-pointer"
          role="region"
          aria-label="RK STUDY CENTRE Opening Intro"
        >
          {/* Top Skip Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-300 border border-white/15 backdrop-blur-sm cursor-pointer transition-all"
          >
            छोड़ें (Skip) ✕
          </button>
          {/* 0.00s - 0.40s: Clean, premium background with subtle dark-to-light reveal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute inset-0 bg-radial from-blue-900/35 via-slate-950 to-slate-950 pointer-events-none"
          />

          {/* Very subtle background light movement */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ 
              scale: timelinePhase.logo ? 1.05 : 0.85, 
              opacity: timelinePhase.logo ? (timelinePhase.finalHighlight ? 0.35 : 0.2) : 0.05 
            }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-600/20 via-indigo-500/10 to-transparent blur-3xl pointer-events-none"
          />

          {/* Delicate architectural blueprint grid */}
          <div 
            className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" 
            aria-hidden="true" 
          />

          {/* Main Centered Content */}
          <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-lg mx-auto">
            {/* 0.40s - 1.20s: Logo Reveal (subtle scale-up, fade-in, slight upward movement, soft light sweep) */}
            <motion.div
              initial={{ scale: 0.82, opacity: 0, y: 16 }}
              animate={
                timelinePhase.logo
                  ? { scale: 1, opacity: 1, y: 0 }
                  : { scale: 0.82, opacity: 0, y: 16 }
              }
              transition={{
                duration: 0.75,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative mb-5"
            >
              {/* Logo Ambient Halo */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/35 via-amber-400/20 to-blue-400/35 rounded-3xl blur-xl pointer-events-none" />

              {/* Official RK STUDY CENTRE Logo Emblem */}
              <div className="relative w-22 h-22 sm:w-26 sm:h-26 rounded-3xl bg-linear-to-b from-blue-600 via-blue-800 to-slate-900 border border-blue-400/40 p-1 shadow-2xl shadow-blue-950/80 flex items-center justify-center overflow-hidden">
                <img
                  src="/icon.svg"
                  alt="RK STUDY CENTRE Logo"
                  className="w-full h-full object-cover rounded-2xl"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />

                {/* Fallback emblem icon */}
                <div className="absolute inset-0 flex items-center justify-center -z-10 text-white">
                  <GraduationCap className="w-11 h-11 text-amber-400" />
                </div>

                {/* 2.45s - 2.75s: Final Brand Highlight light sweep across the logo */}
                {timelinePhase.finalHighlight && (
                  <motion.div
                    initial={{ x: '-150%', y: '150%', opacity: 0 }}
                    animate={{ x: '150%', y: '-150%', opacity: [0, 0.9, 0] }}
                    transition={{ duration: 0.55, ease: 'easeInOut' }}
                    className="absolute inset-0 w-full h-full bg-linear-to-tr from-transparent via-white/50 to-transparent rotate-45 pointer-events-none"
                  />
                )}
              </div>
            </motion.div>

            {/* 1.20s - 1.90s: Brand Name Animation (fade-in, slight letter-spacing expansion) */}
            <motion.div
              initial={{ opacity: 0, y: 10, letterSpacing: '0.04em' }}
              animate={
                timelinePhase.brandName
                  ? { opacity: 1, y: 0, letterSpacing: '0.08em' }
                  : { opacity: 0, y: 10, letterSpacing: '0.04em' }
              }
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2"
            >
              <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-white font-sans uppercase">
                {websiteName}
              </h1>
            </motion.div>

            {/* 1.90s - 2.45s: Tagline Reveal + Upward-motion path (Knowledge → Learning → Progress → Success) */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={
                timelinePhase.tagline
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 8 }
              }
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="mt-2.5 flex items-center justify-center gap-2"
            >
              <span className="text-base sm:text-lg font-bold text-blue-300 tracking-wide">
                पढ़ाई आसान
              </span>
              <span className="text-amber-400 font-black">•</span>
              <span className="text-base sm:text-lg font-bold text-amber-300 tracking-wide">
                सफलता आसान
              </span>
            </motion.div>

            {/* Subtle Upward-Motion Path (Knowledge → Learning → Progress → Success) */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={
                timelinePhase.tagline
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 8, scale: 0.96 }
              }
              transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
              className="mt-5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-2xs font-semibold text-slate-300 backdrop-blur-xs"
            >
              <span className="text-slate-400">Knowledge</span>
              <span className="text-blue-400 font-bold">→</span>
              <span className="text-slate-300">Learning</span>
              <span className="text-amber-400 font-bold">→</span>
              <span className="text-amber-300">Progress</span>
              <span className="text-emerald-400 font-bold">→</span>
              <span className="text-emerald-300 font-bold">Success</span>
            </motion.div>
          </div>

          {/* Subtle Bottom Academic Category Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: timelinePhase.brandName ? 0.5 : 0 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-6 text-center text-3xs font-semibold text-slate-400 tracking-widest uppercase"
          >
            बिहार बोर्ड माध्यमिक एवं उच्च माध्यमिक शैक्षणिक मंच
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
