import React from 'react';

interface RKLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'mark-only' | 'badge';
  className?: string;
  inverted?: boolean;
}

export const RKStudyCenterLogo: React.FC<RKLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  inverted = false,
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-sm', sub: 'text-[9px]' },
    md: { icon: 38, text: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 48, text: 'text-xl', sub: 'text-xs' },
    xl: { icon: 64, text: 'text-2xl', sub: 'text-sm' },
  };

  const dim = sizeMap[size || 'md'] || sizeMap.md;

  // Pure vector SVG combining geometric "RK" monogram, open book pages, and ascending learning arrow
  const logoMark = (
    <svg
      width={dim.icon}
      height={dim.icon}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-sm transition-transform hover:scale-105 duration-200"
      aria-label="RK STUDY CENTER Emblem"
    >
      <defs>
        {/* Navy to Indigo gradient for left book wing / R stem */}
        <linearGradient id="rkNavyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B192C" />
          <stop offset="100%" stopColor="#1E3E62" />
        </linearGradient>

        {/* Vibrant Orange to Amber gradient for upward learning progress element */}
        <linearGradient id="rkOrangeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E65100" />
          <stop offset="50%" stopColor="#FF6D00" />
          <stop offset="100%" stopColor="#FFA000" />
        </linearGradient>

        {/* Golden Sun Accent */}
        <linearGradient id="rkGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#FF8F00" />
        </linearGradient>

        {/* Soft shadow for depth */}
        <filter id="rkGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Outer Hexagonal Shield Foundation */}
      <polygon
        points="50,4 92,25 92,75 50,96 8,75 8,25"
        fill={inverted ? '#FFFFFF' : '#0E1726'}
        stroke={inverted ? '#F59E0B' : '#FF6500'}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Inner subtle glow boundary */}
      <polygon
        points="50,9 86,28 86,72 50,91 14,72 14,28"
        fill={inverted ? '#F8FAFC' : '#172554'}
        opacity="0.4"
      />

      {/* --- OPEN BOOK BASE (Left & Right Pages) --- */}
      {/* Left Book Page (Curves from center spine (50, 78) to left (24, 70)) */}
      <path
        d="M50 78 C 38 74, 28 75, 22 70 C 22 55, 26 42, 34 32 L 50 48 Z"
        fill="url(#rkNavyGrad)"
        opacity="0.95"
      />
      
      {/* Right Book Page (Curves from center spine (50, 78) to right (76, 70)) */}
      <path
        d="M50 78 C 62 74, 72 75, 78 70 C 78 55, 74 42, 66 32 L 50 48 Z"
        fill="url(#rkNavyGrad)"
        opacity="0.95"
      />

      {/* Book Center Ribbon / Spine Landmark */}
      <path
        d="M48 48 L52 48 L51 84 L49 84 Z"
        fill="#FFFFFF"
        opacity="0.8"
      />

      {/* --- "R" MONOGRAM (Left & Top Loop) --- */}
      {/* R Vertical Pillar / Spine */}
      <rect
        x="32"
        y="26"
        width="9"
        height="46"
        rx="2"
        fill={inverted ? '#0F172A' : '#FFFFFF'}
      />

      {/* R Upper Loop (Distinctive geometric semi-circle arc) */}
      <path
        d="M38 26 H 55 C 63 26, 63 46, 55 46 H 38 Z"
        fill="url(#rkOrangeGrad)"
        stroke={inverted ? '#0F172A' : '#FFFFFF'}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* R Counter (Inner cutout) */}
      <circle cx="48" cy="36" r="4.5" fill={inverted ? '#FFFFFF' : '#0E1726'} />

      {/* --- "K" MONOGRAM & UPWARD LEARNING ELEMENT --- */}
      {/* K Lower Right Support Leg */}
      <path
        d="M48 48 L 68 72 H 58 L 41 53 Z"
        fill={inverted ? '#0F172A' : '#FFFFFF'}
      />

      {/* K Upper Ascending Progress Arrow (Soaring to top right) */}
      <path
        d="M44 48 L 74 18 L 78 22 L 52 52 Z"
        fill="url(#rkOrangeGrad)"
        filter="url(#rkGlow)"
      />
      
      {/* Arrowhead / Star of Excellence at Top Right */}
      <polygon
        points="76,14 84,18 78,26 77,20 71,19"
        fill="url(#rkGoldGrad)"
      />

      {/* Book Bookmark Tail */}
      <polygon
        points="50,78 45,88 50,85 55,88"
        fill="#FF6D00"
      />
    </svg>
  );

  if (variant === 'mark-only') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{logoMark}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {logoMark}
      <div className="flex flex-col leading-none select-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-wider uppercase font-sans ${dim.text} ${
              inverted ? 'text-slate-950' : 'text-white'
            }`}
            style={{ letterSpacing: '0.04em' }}
          >
            RK STUDY CENTER
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`font-bold tracking-widest uppercase ${dim.sub} ${
              inverted ? 'text-orange-600' : 'text-amber-400'
            }`}
          >
            पढ़ाई • तैयारी • सफलता
          </span>
          <span
            className={`text-[8px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
              inverted
                ? 'bg-slate-900 text-white'
                : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
            }`}
          >
            ESTD. 2026
          </span>
        </div>
      </div>
    </div>
  );
};
