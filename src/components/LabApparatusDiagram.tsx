import React from 'react';
import type { LabExperimentConfig } from '../data/virtualLabExperimentsData';

interface LabApparatusDiagramProps {
  experiment: LabExperimentConfig;
  isRunning: boolean;
  isCircuitComplete: boolean;
  connectedSteps: number;
  currentControls: Record<string, number>;
  liveMetrics: {
    primaryLabel: string;
    primaryValue: string;
    secondaryLabel: string;
    secondaryValue: string;
    tertiaryLabel: string;
    tertiaryValue: string;
  };
  onToggleSwitch?: () => void;
}

export const LabApparatusDiagram: React.FC<LabApparatusDiagramProps> = ({
  experiment,
  isRunning,
  isCircuitComplete,
  connectedSteps,
  currentControls,
  liveMetrics,
  onToggleSwitch,
}) => {
  const sim = experiment.simulatorType;

  // 1. OHM'S LAW: Realistic Laboratory Circuit Bench
  if (sim === 'ohms_law') {
    const v = currentControls.voltage ?? 1;
    const r = currentControls.resistance ?? 10;
    const currentAmp = isRunning ? (v / r).toFixed(2) : '0.00';
    // Pointer angles
    // Ammeter 0 to 2A -> 0A is -45deg, 1A is 0deg, 2A is +45deg
    const iVal = isRunning ? Math.min(2, v / r) : 0;
    const ammeterAngle = -45 + (iVal / 2) * 90;
    // Voltmeter 0 to 10V -> 0V is -45deg, 5V is 0deg, 10V is +45deg
    const vVal = isRunning ? Math.min(10, v) : 0;
    const voltAngle = -45 + (vVal / 10) * 90;

    return (
      <svg viewBox="0 0 720 400" className="w-full h-auto max-h-[460px] drop-shadow-md select-none">
        <defs>
          <linearGradient id="benchBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="batteryGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="meterGlass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <radialGradient id="indicatorGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isRunning ? '#4ade80' : '#f87171'} stopOpacity="0.8" />
            <stop offset="100%" stopColor={isRunning ? '#22c55e' : '#ef4444'} stopOpacity="0" />
          </radialGradient>
          <filter id="wireGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Workbench Lab Table Surface */}
        <rect x="10" y="10" width="700" height="380" rx="16" fill="url(#benchBg)" stroke="#334155" strokeWidth="2" />
        <line x1="30" y1="360" x2="690" y2="360" stroke="#1e293b" strokeWidth="2" strokeDasharray="6 6" />

        {/* ================= CONNECTING WIRES ================= */}
        {/* Main Circuit Loop Wires (Red Positive Wire from Battery to Rheostat/Resistor) */}
        <path
          d="M 120 180 L 120 70 L 260 70"
          fill="none"
          stroke={connectedSteps >= 1 ? '#ef4444' : '#475569'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={connectedSteps >= 1 ? 'none' : '6 6'}
          filter={isRunning ? 'url(#wireGlow)' : undefined}
        />
        {/* Resistor to Ammeter wire */}
        <path
          d="M 380 70 L 490 70 L 490 120"
          fill="none"
          stroke={connectedSteps >= 3 ? '#ef4444' : '#475569'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={connectedSteps >= 3 ? 'none' : '6 6'}
          filter={isRunning ? 'url(#wireGlow)' : undefined}
        />
        {/* Ammeter to Key wire */}
        <path
          d="M 490 230 L 490 320 L 390 320"
          fill="none"
          stroke={connectedSteps >= 4 ? '#38bdf8' : '#475569'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={connectedSteps >= 4 ? 'none' : '6 6'}
          filter={isRunning ? 'url(#wireGlow)' : undefined}
        />
        {/* Key to Negative Battery wire */}
        <path
          d="M 290 320 L 120 320 L 120 250"
          fill="none"
          stroke={connectedSteps >= 2 ? '#38bdf8' : '#475569'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={connectedSteps >= 2 ? 'none' : '6 6'}
          filter={isRunning ? 'url(#wireGlow)' : undefined}
        />

        {/* Voltmeter Parallel Wires Across Resistor */}
        <path
          d="M 270 90 L 270 170 L 290 170"
          fill="none"
          stroke={connectedSteps >= 5 ? '#a855f7' : '#475569'}
          strokeWidth="3"
          strokeDasharray="4 4"
        />
        <path
          d="M 370 90 L 370 170 L 350 170"
          fill="none"
          stroke={connectedSteps >= 5 ? '#a855f7' : '#475569'}
          strokeWidth="3"
          strokeDasharray="4 4"
        />

        {/* Animated electron flow / current arrows if running */}
        {isRunning && (
          <g fill="#38bdf8">
            <polygon points="120,110 115,120 125,120" transform="rotate(0 120 115)" />
            <polygon points="430,70 420,65 420,75" />
            <polygon points="490,270 485,260 495,260" transform="rotate(180 490 265)" />
            <polygon points="210,320 220,315 220,325" />
          </g>
        )}

        {/* ================= 1. BATTERY ELIMINATOR (Real Box) ================= */}
        <g transform="translate(60, 160)">
          <rect x="0" y="0" width="120" height="110" rx="10" fill="url(#batteryGrad)" stroke="#64748b" strokeWidth="2" />
          <rect x="10" y="8" width="100" height="20" rx="4" fill="#090d16" />
          <text x="60" y="22" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
            BATTERY ELIMINATOR
          </text>
          {/* LED indicator */}
          <circle cx="25" cy="45" r="5" fill={isRunning ? '#22c55e' : '#ef4444'} />
          <circle cx="25" cy="45" r="10" fill="url(#indicatorGlow)" />
          <text x="36" y="48" fill="#cbd5e1" fontSize="9">
            {isRunning ? 'POWER ON' : 'STANDBY'}
          </text>
          {/* Voltage Knob */}
          <circle cx="60" cy="78" r="18" fill="#0f172a" stroke="#94a3b8" strokeWidth="2" />
          <line x1="60" y1="78" x2="60" y2="64" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          <text x="60" y="82" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
            {v}V
          </text>
          {/* Terminals (+ Red, - Black) */}
          <circle cx="105" cy="45" r="7" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
          <text x="105" y="48" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">+</text>
          <circle cx="105" cy="75" r="7" fill="#1e293b" stroke="#000000" strokeWidth="2" />
          <text x="105" y="78" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">-</text>
        </g>

        {/* ================= 2. STANDARD RESISTOR (Ceramic Wire Wound) ================= */}
        <g transform="translate(250, 40)">
          <rect x="0" y="10" width="140" height="42" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          {/* Ceramic core and wire windings */}
          <rect x="25" y="14" width="90" height="34" rx="4" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
          {[35, 45, 55, 65, 75, 85, 95, 105].map((xPos) => (
            <line key={xPos} x1={xPos} y1="14" x2={xPos} y2="48" stroke="#854d0e" strokeWidth="2.5" />
          ))}
          {/* Terminals on both ends */}
          <circle cx="12" cy="31" r="6" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
          <circle cx="128" cy="31" r="6" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
          {/* Label Plate */}
          <rect x="30" y="56" width="80" height="18" rx="4" fill="#0f172a" stroke="#ca8a04" />
          <text x="70" y="69" fill="#fef08a" fontSize="10" fontWeight="bold" textAnchor="middle">
            R = {r} Ω (Nichrome)
          </text>
        </g>

        {/* ================= 3. ANALOG VOLTMETER (Parallel) ================= */}
        <g transform="translate(270, 150)">
          <rect x="0" y="0" width="100" height="110" rx="12" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
          {/* Dial Face */}
          <rect x="10" y="10" width="80" height="70" rx="8" fill="url(#meterGlass)" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Scale Arc & Ticks */}
          <path d="M 22 55 A 40 40 0 0 1 78 55" fill="none" stroke="#334155" strokeWidth="1.5" />
          <line x1="25" y1="50" x2="28" y2="46" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="50" y1="38" x2="50" y2="34" stroke="#0f172a" strokeWidth="2" />
          <line x1="75" y1="50" x2="72" y2="46" stroke="#0f172a" strokeWidth="1.5" />
          <text x="24" y="62" fill="#0f172a" fontSize="7" fontWeight="bold">0</text>
          <text x="50" y="47" fill="#0f172a" fontSize="7" fontWeight="bold" textAnchor="middle">5</text>
          <text x="76" y="62" fill="#0f172a" fontSize="7" fontWeight="bold" textAnchor="end">10</text>
          <text x="50" y="60" fill="#7c3aed" fontSize="12" fontWeight="bold" textAnchor="middle">V</text>
          {/* Needle pivot and pointer */}
          <circle cx="50" cy="72" r="4" fill="#0f172a" />
          <g transform={`rotate(${voltAngle} 50 72)`}>
            <line x1="50" y1="72" x2="50" y2="32" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
          </g>
          {/* Digital sub-readout */}
          <rect x="18" y="86" width="64" height="18" rx="4" fill="#090d16" />
          <text x="50" y="99" fill="#c084fc" fontSize="11" fontWeight="bold" font-family="monospace" textAnchor="middle">
            {isRunning ? `${v.toFixed(1)} V` : '0.0 V'}
          </text>
          <text x="50" y="125" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle">
            VOLTMETER (Parallel)
          </text>
        </g>

        {/* ================= 4. ANALOG AMMETER (Series) ================= */}
        <g transform="translate(440, 100)">
          <rect x="0" y="0" width="100" height="120" rx="12" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
          {/* Dial Face */}
          <rect x="10" y="10" width="80" height="75" rx="8" fill="url(#meterGlass)" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Scale Arc & Ticks */}
          <path d="M 22 58 A 40 40 0 0 1 78 58" fill="none" stroke="#334155" strokeWidth="1.5" />
          <line x1="25" y1="52" x2="28" y2="48" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="50" y1="40" x2="50" y2="35" stroke="#0f172a" strokeWidth="2" />
          <line x1="75" y1="52" x2="72" y2="48" stroke="#0f172a" strokeWidth="1.5" />
          <text x="24" y="65" fill="#0f172a" fontSize="7" fontWeight="bold">0</text>
          <text x="50" y="49" fill="#0f172a" fontSize="7" fontWeight="bold" textAnchor="middle">1.0</text>
          <text x="76" y="65" fill="#0f172a" fontSize="7" fontWeight="bold" textAnchor="end">2.0</text>
          <text x="50" y="63" fill="#0284c7" fontSize="12" fontWeight="bold" textAnchor="middle">A</text>
          {/* Needle pivot and pointer */}
          <circle cx="50" cy="76" r="4" fill="#0f172a" />
          <g transform={`rotate(${ammeterAngle} 50 76)`}>
            <line x1="50" y1="76" x2="50" y2="34" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
          </g>
          {/* Digital sub-readout */}
          <rect x="18" y="92" width="64" height="20" rx="4" fill="#090d16" />
          <text x="50" y="106" fill="#38bdf8" fontSize="12" fontWeight="bold" font-family="monospace" textAnchor="middle">
            {currentAmp} A
          </text>
          <text x="50" y="136" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle">
            AMMETER (Series)
          </text>
        </g>

        {/* ================= 5. PLUG KEY / SWITCH (Realistic Brass Block) ================= */}
        <g
          transform="translate(290, 290)"
          onClick={onToggleSwitch}
          className="cursor-pointer"
        >
          {/* Wooden/Bakelite Base */}
          <rect x="0" y="0" width="100" height="55" rx="8" fill="#78350f" stroke="#451a03" strokeWidth="2" />
          {/* Brass blocks */}
          <rect x="15" y="10" width="28" height="35" rx="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
          <rect x="57" y="10" width="28" height="35" rx="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
          {/* Plug Pin inserted or removed */}
          {isRunning ? (
            <g>
              {/* Plug is inserted into gap */}
              <circle cx="50" cy="27" r="11" fill="#1e293b" stroke="#d97706" strokeWidth="2" />
              <rect x="47" y="5" width="6" height="22" rx="3" fill="#0f172a" />
              <circle cx="50" cy="10" r="7" fill="#0f172a" />
              <text x="50" y="50" fill="#4ade80" fontSize="8" fontWeight="bold" textAnchor="middle">
                KEY INSERTED (ON)
              </text>
            </g>
          ) : (
            <g>
              {/* Gap is open */}
              <rect x="44" y="15" width="12" height="25" fill="#451a03" />
              {/* Plug placed aside */}
              <circle cx="85" cy="5" r="7" fill="#0f172a" stroke="#d97706" strokeWidth="1.5" />
              <text x="50" y="50" fill="#f87171" fontSize="8" fontWeight="bold" textAnchor="middle">
                KEY OUT (OFF)
              </text>
            </g>
          )}
        </g>

        {/* Formula & Live Calculation overlay */}
        <g transform="translate(420, 260)">
          <rect x="0" y="0" width="270" height="85" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          <text x="15" y="24" fill="#38bdf8" fontSize="12" fontWeight="bold">
            ⚡ ओम का नियम (Ohm&apos;s Law Verification)
          </text>
          <text x="15" y="45" fill="#f8fafc" fontSize="11" font-family="monospace">
            V = I × R ⟹ I = V / R
          </text>
          <text x="15" y="68" fill="#4ade80" fontSize="13" fontWeight="bold" font-family="monospace">
            I = {v} V / {r} Ω = {currentAmp} A
          </text>
        </g>
      </svg>
    );
  }

  // 2. ARCHIMEDES' PRINCIPLE (Eureka Can, Spring Balance, Graduated Cylinder)
  if (sim === 'archimedes') {
    const w1 = currentControls.massAir ?? 250;
    const vol = currentControls.volumeSubmerged ?? 50;
    const w2 = isRunning ? w1 - vol : w1;
    const waterHeightCan = 140;
    const waterLevelCylinder = isRunning ? 20 + vol * 1.3 : 20;

    return (
      <svg viewBox="0 0 720 400" className="w-full h-auto max-h-[460px] drop-shadow-md select-none">
        <defs>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
        </defs>

        {/* Background & Lab Bench */}
        <rect x="10" y="10" width="700" height="380" rx="16" fill="#0b1120" stroke="#334155" strokeWidth="2" />
        <rect x="30" y="340" width="660" height="20" rx="4" fill="#1e293b" />

        {/* Retort Stand (Left) */}
        <rect x="60" y="325" width="100" height="15" rx="3" fill="#475569" />
        <rect x="105" y="30" width="10" height="300" fill="#64748b" />
        <rect x="105" y="45" width="120" height="10" rx="2" fill="#475569" />

        {/* SPRING BALANCE HANGING FROM CLAMP */}
        <g transform="translate(190, 55)">
          {/* Top Hook */}
          <path d="M 25 0 L 25 15" stroke="#94a3b8" strokeWidth="3" />
          {/* Brass Casing */}
          <rect x="10" y="15" width="30" height="130" rx="4" fill="#ca8a04" stroke="#a16207" strokeWidth="2" />
          <rect x="18" y="25" width="14" height="100" fill="#fef08a" />
          {/* Scale marks */}
          {[35, 55, 75, 95, 115].map((y) => (
            <line key={y} x1="18" y1={y} x2="26" y2={y} stroke="#854d0e" strokeWidth="1.5" />
          ))}
          {/* Indicator pointer */}
          {/* 0 gwt is top, 400 gwt is bottom */}
          <line
            x1="18"
            y1={35 + (w2 / 400) * 80}
            x2="32"
            y2={35 + (w2 / 400) * 80}
            stroke="#dc2626"
            strokeWidth="3"
          />
          {/* Spring Balance Reading Tag */}
          <rect x="50" y="30" width="100" height="38" rx="6" fill="#0f172a" stroke="#ca8a04" />
          <text x="100" y="46" fill="#fef08a" fontSize="10" fontWeight="bold" textAnchor="middle">
            SPRING BALANCE
          </text>
          <text x="100" y="62" fill="#ffffff" fontSize="13" fontWeight="bold" font-family="monospace" textAnchor="middle">
            {w2} gwt
          </text>

          {/* Lower Thread and Metal Bob */}
          <line x1="25" y1="145" x2="25" y2={isRunning ? 190 : 160} stroke="#cbd5e1" strokeWidth="2" />
          {/* Metallic Solid Block */}
          <rect
            x="10"
            y={isRunning ? 190 : 160}
            width="30"
            height="40"
            rx="4"
            fill="url(#metalGrad)"
            stroke="#334155"
            strokeWidth="2"
          />
          <text x="25" y={isRunning ? 215 : 185} fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">
            {w1}g
          </text>
        </g>

        {/* EUREKA CAN (Overflow Vessel with Spout) */}
        <g transform="translate(170, 200)">
          {/* Glass Beaker Body */}
          <path
            d="M 15 20 L 15 140 Q 15 145 20 145 L 85 145 Q 90 145 90 140 L 90 60 L 125 90 L 130 90 L 90 45 L 90 20 Z"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2.5"
          />
          {/* Water inside Eureka Can */}
          <path
            d="M 17 50 L 17 143 L 88 143 L 88 55 L 122 88 L 122 90 L 88 50 Z"
            fill="url(#waterGrad)"
          />
          {/* Overflow Spout Droplets if Running */}
          {isRunning && (
            <g fill="#38bdf8">
              <circle cx="127" cy="100" r="3" />
              <circle cx="132" cy="115" r="3" />
              <circle cx="135" cy="130" r="3" />
            </g>
          )}
          <text x="52" y="130" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
            यूरेका कैन (Eureka Can)
          </text>
        </g>

        {/* MEASURING CYLINDER RECEIVING OVERFLOW WATER */}
        <g transform="translate(320, 210)">
          <rect x="15" y="10" width="40" height="130" rx="3" fill="none" stroke="#94a3b8" strokeWidth="2" />
          {/* Water level in cylinder */}
          <rect
            x="17"
            y={138 - waterLevelCylinder}
            width="36"
            height={waterLevelCylinder}
            fill="url(#waterGrad)"
          />
          {/* Milliliter graduation lines */}
          {[30, 50, 70, 90, 110].map((y) => (
            <line key={y} x1="45" y1={y} x2="55" y2={y} stroke="#64748b" strokeWidth="1" />
          ))}
          {/* Readout */}
          <rect x="70" y="40" width="110" height="42" rx="6" fill="#0f172a" stroke="#38bdf8" />
          <text x="125" y="56" fill="#93c5fd" fontSize="9" fontWeight="bold" textAnchor="middle">
            मापक बेलन (Cylinder)
          </text>
          <text x="125" y="75" fill="#38bdf8" fontSize="13" fontWeight="bold" font-family="monospace" textAnchor="middle">
            {isRunning ? vol : 0} mL
          </text>
        </g>

        {/* Right Info Box with Archimedes Formula Verification */}
        <g transform="translate(470, 60)">
          <rect x="0" y="0" width="230" height="260" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          <text x="15" y="30" fill="#38bdf8" fontSize="13" fontWeight="bold">
            आर्किमिडीज का सिद्धांत
          </text>
          <line x1="15" y1="42" x2="215" y2="42" stroke="#1e293b" strokeWidth="1.5" />
          <text x="15" y="65" fill="#cbd5e1" fontSize="11">
            वायु में भार (W₁): <tspan fill="#f8fafc" fontWeight="bold">{w1} gwt</tspan>
          </text>
          <text x="15" y="95" fill="#cbd5e1" fontSize="11">
            जल में भार (W₂): <tspan fill="#f8fafc" fontWeight="bold">{w2} gwt</tspan>
          </text>
          <text x="15" y="125" fill="#facc15" fontSize="11" fontWeight="bold">
            भार में कमी (W₁ - W₂): {w1 - w2} gwt
          </text>
          <text x="15" y="155" fill="#38bdf8" fontSize="11" fontWeight="bold">
            विस्थापित जल (V): {isRunning ? vol : 0} mL (= {isRunning ? vol : 0} gwt)
          </text>
          <rect x="15" y="180" width="200" height="60" rx="8" fill="#1e293b" />
          <text x="25" y="202" fill="#4ade80" fontSize="11" fontWeight="bold">
            ✓ उत्प्लावन बल = विस्थापित द्रव
          </text>
          <text x="25" y="224" fill="#94a3b8" fontSize="10">
            F_buoyant = ΔW = {isRunning ? vol : 0} gwt
          </text>
        </g>
      </svg>
    );
  }

  // 3. SIMPLE PENDULUM (Retort Stand, Thread, Brass Bob, Digital Stopwatch)
  if (sim === 'pendulum') {
    const len = currentControls.lengthCm ?? 100;
    const period = (2 * Math.PI * Math.sqrt(len / 100 / 9.8)).toFixed(2);
    const time20 = (parseFloat(period) * 20).toFixed(1);
    const bobAngle = isRunning ? 8 : 0;

    return (
      <svg viewBox="0 0 720 400" className="w-full h-auto max-h-[460px] drop-shadow-md select-none">
        <defs>
          <radialGradient id="brassGlow" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#713f12" />
          </radialGradient>
        </defs>

        {/* Workbench */}
        <rect x="10" y="10" width="700" height="380" rx="16" fill="#0b1120" stroke="#334155" strokeWidth="2" />
        <rect x="40" y="350" width="640" height="15" rx="3" fill="#1e293b" />

        {/* Rigid Stand & Split Cork */}
        <rect x="60" y="335" width="120" height="15" rx="3" fill="#475569" />
        <rect x="110" y="30" width="12" height="305" fill="#64748b" />
        <rect x="110" y="45" width="160" height="12" rx="2" fill="#475569" />
        {/* Split Cork clamp */}
        <rect x="250" y="42" width="25" height="18" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
        <circle cx="262" cy="51" r="2" fill="#0f172a" />

        {/* Pendulum Thread & Brass Bob */}
        {/* Pivot at (262, 51) */}
        <g transform={`rotate(${bobAngle} 262 51)`}>
          {/* Thread */}
          <line x1="262" y1="51" x2="262" y2="280" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="1 1" />
          {/* Oscillation Arc guide */}
          <path d="M 230 280 A 230 230 0 0 1 294 280" fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Brass Bob */}
          <circle cx="262" cy="280" r="16" fill="url(#brassGlow)" stroke="#a16207" strokeWidth="2" />
          <circle cx="262" cy="280" r="3" fill="#713f12" />
        </g>

        {/* Meter scale next to thread */}
        <g transform="translate(180, 70)">
          <rect x="0" y="0" width="22" height="210" rx="2" fill="#fef08a" stroke="#ca8a04" />
          {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200].map((y, idx) => (
            <line key={y} x1="10" y1={y} x2="22" y2={y} stroke="#78350f" strokeWidth={idx % 2 === 0 ? 1.5 : 1} />
          ))}
          <text x="-8" y="105" fill="#fde047" fontSize="10" fontWeight="bold" transform="rotate(-90 -8 105)" textAnchor="middle">
            L = {len} cm
          </text>
        </g>

        {/* DIGITAL STOPWATCH APPARATUS */}
        <g transform="translate(360, 80)">
          <rect x="0" y="0" width="130" height="170" rx="24" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
          {/* Crown Button */}
          <rect x="52" y="-10" width="26" height="10" rx="3" fill="#94a3b8" />
          {/* LCD Screen */}
          <rect x="15" y="30" width="100" height="60" rx="8" fill="#022c22" stroke="#059669" strokeWidth="2" />
          <text x="65" y="55" fill="#34d399" fontSize="10" fontWeight="bold" textAnchor="middle">
            20 OSCILLATIONS
          </text>
          <text x="65" y="78" fill="#a7f3d0" fontSize="18" fontWeight="bold" font-family="monospace" textAnchor="middle">
            {isRunning ? `${time20} s` : '00.00 s'}
          </text>
          <text x="65" y="125" fill="#cbd5e1" fontSize="10" fontWeight="bold" textAnchor="middle">
            T = {isRunning ? `${period} s` : '—'}
          </text>
          <text x="65" y="145" fill="#38bdf8" fontSize="9" textAnchor="middle">
            STOPWATCH (0.01 s)
          </text>
        </g>

        {/* Calculation Card (Right) */}
        <g transform="translate(515, 60)">
          <rect x="0" y="0" width="185" height="260" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          <text x="15" y="30" fill="#38bdf8" fontSize="13" fontWeight="bold">
            गुरुत्वीय त्वरण (g)
          </text>
          <line x1="15" y1="42" x2="170" y2="42" stroke="#1e293b" strokeWidth="1.5" />
          <text x="15" y="68" fill="#cbd5e1" fontSize="11">
            प्रभावी लंबाई (L): <tspan fill="#f8fafc" fontWeight="bold">{len} cm</tspan>
          </text>
          <text x="15" y="98" fill="#cbd5e1" fontSize="11">
            20 दोलन समय (t): <tspan fill="#f8fafc" fontWeight="bold">{isRunning ? time20 : '0'} s</tspan>
          </text>
          <text x="15" y="128" fill="#facc15" fontSize="11" fontWeight="bold">
            आवर्तकाल T: {isRunning ? period : '0.00'} s
          </text>
          <rect x="15" y="155" width="155" height="85" rx="8" fill="#1e293b" />
          <text x="25" y="178" fill="#38bdf8" fontSize="11" fontWeight="bold">
            सूत्र: g = 4π²(L / T²)
          </text>
          <text x="25" y="202" fill="#4ade80" fontSize="13" fontWeight="bold" font-family="monospace">
            g ≈ 9.80 m/s²
          </text>
          <text x="25" y="224" fill="#94a3b8" fontSize="9">
            त्रुटि &lt; 0.5% (सत्यापित)
          </text>
        </g>
      </svg>
    );
  }

  // 4. METER BRIDGE / WHEATSTONE BRIDGE
  if (sim === 'wheatstone') {
    const knownR = currentControls.knownR ?? 6;
    const l = currentControls.balanceL ?? 50;
    const unknownX = ((knownR * (100 - l)) / l).toFixed(2);
    const galvAngle = (l - 50) * 0.9; // 0 at 50cm

    return (
      <svg viewBox="0 0 720 400" className="w-full h-auto max-h-[460px] drop-shadow-md select-none">
        {/* Table */}
        <rect x="10" y="10" width="700" height="380" rx="16" fill="#0b1120" stroke="#334155" strokeWidth="2" />

        {/* 1-Meter Wooden Bridge Base Board */}
        <rect x="50" y="130" width="620" height="150" rx="10" fill="#78350f" stroke="#451a03" strokeWidth="3" />

        {/* Thick Copper Strips (L-shaped ends and central strip) */}
        {/* Left L-Strip */}
        <path d="M 70 150 L 150 150 L 150 180 L 100 180 L 100 250 L 70 250 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
        {/* Central Strip */}
        <rect x="220" y="150" width="280" height="30" rx="2" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
        {/* Right L-Strip */}
        <path d="M 650 150 L 570 150 L 570 180 L 620 180 L 620 250 L 650 250 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />

        {/* Left Gap Component: Known Resistance Box R */}
        <rect x="155" y="145" width="60" height="40" rx="6" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
        <text x="185" y="170" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle">
          R={knownR}Ω
        </text>

        {/* Right Gap Component: Unknown Resistor Wire X */}
        <path d="M 505 165 Q 535 145 565 165" fill="none" stroke="#ef4444" strokeWidth="3" />
        <text x="535" y="185" fill="#f87171" fontSize="11" fontWeight="bold" textAnchor="middle">
          X = {unknownX}Ω
        </text>

        {/* 1-Meter Wire on Meter Scale */}
        <rect x="85" y="240" width="550" height="24" rx="2" fill="#fef08a" stroke="#ca8a04" />
        {/* Wire */}
        <line x1="85" y1="242" x2="635" y2="242" stroke="#475569" strokeWidth="3" />
        {/* Millimeter Ticks */}
        {[0, 100, 200, 300, 400, 500].map((pos, idx) => (
          <text key={pos} x={85 + pos * 1.1} y="260" fill="#713f12" fontSize="9" fontWeight="bold">
            {idx * 20}cm
          </text>
        ))}

        {/* Galvanometer on central terminal */}
        <g transform="translate(325, 40)">
          <circle cx="35" cy="35" r="32" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
          <circle cx="35" cy="35" r="26" fill="#f8fafc" />
          <line x1="35" y1="35" x2="35" y2="15" stroke="#0f172a" strokeWidth="1.5" />
          {/* Galvanometer Needle */}
          <g transform={`rotate(${galvAngle} 35 35)`}>
            <line x1="35" y1="35" x2="35" y2="15" stroke="#dc2626" strokeWidth="2" />
          </g>
          <text x="35" y="47" fill="#0284c7" fontSize="10" fontWeight="bold" textAnchor="middle">G</text>
          <text x="35" y="85" fill="#e2e8f0" fontSize="9" fontWeight="bold" textAnchor="middle">
            {l === 50 ? '0.0 mA (Null Point ✓)' : `${((l - 50) * 0.4).toFixed(1)} mA`}
          </text>
        </g>

        {/* Jockey Wire from Galvanometer to Meter Wire */}
        {/* Jockey position on wire: scale is 85 + l * 5.5 */}
        <path
          d={`M 360 80 L 360 110 L ${85 + l * 5.5} 110 L ${85 + l * 5.5} 242`}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeDasharray="4 4"
        />
        {/* Jockey Handle */}
        <polygon
          points={`${85 + l * 5.5 - 6},225 ${85 + l * 5.5 + 6},225 ${85 + l * 5.5},242`}
          fill="#38bdf8"
        />
        <text x={85 + l * 5.5} y="220" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
          Jockey (l={l}cm)
        </text>

        {/* Summary Footer */}
        <g transform="translate(50, 310)">
          <rect x="0" y="0" width="620" height="50" rx="8" fill="#1e293b" stroke="#334155" />
          <text x="20" y="30" fill="#fef08a" fontSize="12" fontWeight="bold">
            व्हीटस्टोन संतुलन सिद्धांत: P / Q = R / X ⟹ X = R × (100 - l) / l
          </text>
          <text x="440" y="30" fill="#4ade80" fontSize="13" fontWeight="bold" font-family="monospace">
            X = {knownR} × ({100 - l} / {l}) = {unknownX} Ω
          </text>
        </g>
      </svg>
    );
  }

  // 5. pH SCALE LAB (Universal Indicator Test Tubes Rack & pH Spectrum Chart)
  if (sim === 'ph_scale') {
    const ph = currentControls.phValue ?? 2;
    // Color mapping based on pH value
    const phColors: Record<number, string> = {
      1: '#dc2626',
      2: '#ea580c',
      3: '#f97316',
      4: '#f59e0b',
      5: '#eab308',
      6: '#84cc16',
      7: '#22c55e',
      8: '#10b981',
      9: '#06b6d4',
      10: '#0284c7',
      11: '#3b82f6',
      12: '#6366f1',
      13: '#8b5cf6',
      14: '#581c87',
    };
    const activeColor = phColors[ph] || '#22c55e';

    return (
      <svg viewBox="0 0 720 400" className="w-full h-auto max-h-[460px] drop-shadow-md select-none">
        <rect x="10" y="10" width="700" height="380" rx="16" fill="#0b1120" stroke="#334155" strokeWidth="2" />
        <rect x="40" y="340" width="640" height="20" rx="4" fill="#1e293b" />

        {/* Wooden Test Tube Stand */}
        <rect x="70" y="240" width="300" height="15" rx="3" fill="#78350f" />
        <rect x="70" y="325" width="300" height="15" rx="3" fill="#78350f" />
        <rect x="80" y="240" width="15" height="100" fill="#451a03" />
        <rect x="345" y="240" width="15" height="100" fill="#451a03" />

        {/* 4 Test Tubes in the Stand */}
        {[
          { x: 120, label: 'HCl', val: 1, c: '#dc2626' },
          { x: 180, label: 'Lemon', val: 3, c: '#f97316' },
          { x: 240, label: 'Water', val: 7, c: '#22c55e' },
          { x: 300, label: 'Active', val: ph, c: activeColor, active: true },
        ].map((tt) => (
          <g key={tt.x}>
            {/* Glass Tube */}
            <path
              d={`M ${tt.x} 140 L ${tt.x} 290 Q ${tt.x} 305 ${tt.x + 15} 305 Q ${tt.x + 30} 305 ${tt.x + 30} 290 L ${tt.x + 30} 140 Z`}
              fill="none"
              stroke={tt.active ? '#38bdf8' : '#94a3b8'}
              strokeWidth={tt.active ? 3 : 2}
            />
            {/* Liquid inside */}
            <path
              d={`M ${tt.x + 2} 210 L ${tt.x + 2} 290 Q ${tt.x + 2} 303 ${tt.x + 15} 303 Q ${tt.x + 28} 303 ${tt.x + 28} 290 L ${tt.x + 28} 210 Z`}
              fill={tt.c}
              opacity="0.85"
            />
            <text x={tt.x + 15} y="325" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">
              {tt.label}
            </text>
            <text x={tt.x + 15} y="130" fill={tt.c} fontSize="10" fontWeight="bold" textAnchor="middle">
              pH {tt.val}
            </text>
          </g>
        ))}

        {/* Dropper adding Indicator to the Active Tube */}
        <g transform="translate(305, 50)">
          <rect x="8" y="0" width="14" height="25" rx="5" fill="#ef4444" />
          <path d="M 12 25 L 12 65 L 15 80 L 18 65 L 18 25 Z" fill="#e2e8f0" stroke="#94a3b8" />
          {/* Droplet */}
          <circle cx="15" cy="100" r="4" fill={activeColor} />
          <text x="45" y="45" fill="#f87171" fontSize="10" fontWeight="bold">
            Universal Indicator
          </text>
        </g>

        {/* STANDARD pH SPECTRUM CHART (Right) */}
        <g transform="translate(420, 50)">
          <rect x="0" y="0" width="260" height="270" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          <text x="15" y="28" fill="#38bdf8" fontSize="12" fontWeight="bold">
            मानक सार्वत्रिक सूचक pH चार्ट (0–14)
          </text>

          {/* 14 Color Bands */}
          <g transform="translate(15, 45)">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((p, idx) => (
              <g key={p} transform={`translate(0, ${idx * 14})`}>
                <rect
                  x="0"
                  y="0"
                  width="70"
                  height="12"
                  rx="2"
                  fill={phColors[p]}
                  stroke={ph === p ? '#ffffff' : 'none'}
                  strokeWidth={ph === p ? 2 : 0}
                />
                <text x="78" y="10" fill="#cbd5e1" fontSize="9" fontWeight="bold">
                  pH {p}
                </text>
                <text x="115" y="10" fill="#94a3b8" fontSize="8">
                  {p < 7 ? 'अम्लीय (Acidic)' : p === 7 ? 'उदासीन (Neutral)' : 'क्षारीय (Basic)'}
                </text>
              </g>
            ))}
          </g>

          {/* Active indicator box */}
          <rect x="15" y="245" width="230" height="60" rx="6" fill="#1e293b" />
          <text x="25" y="265" fill="#f8fafc" fontSize="11" fontWeight="bold">
            वर्तमान विलयन: <tspan fill={activeColor}>pH {ph}</tspan> ({ph < 7 ? 'अम्ल' : ph === 7 ? 'उदासीन' : 'क्षार'})
          </text>
        </g>
      </svg>
    );
  }

  // 6. STATES OF MATTER & HEATING CURVE (Bunsen Burner, Beaker, Boiling Water, Thermometer)
  if (sim === 'matter_state') {
    const tMin = currentControls.heatingTime ?? 4;
    const flame = currentControls.flameLevel ?? 2;
    const temp = Math.min(100, 20 + tMin * flame * 10);
    const isBoiling = temp >= 100;

    return (
      <svg viewBox="0 0 720 400" className="w-full h-auto max-h-[460px] drop-shadow-md select-none">
        <defs>
          <linearGradient id="flameGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <rect x="10" y="10" width="700" height="380" rx="16" fill="#0b1120" stroke="#334155" strokeWidth="2" />
        <rect x="40" y="340" width="640" height="20" rx="4" fill="#1e293b" />

        {/* Tripod Stand and Wire Gauze */}
        <polygon points="120,340 140,240 150,240 130,340" fill="#475569" />
        <polygon points="280,340 260,240 250,240 270,340" fill="#475569" />
        <rect x="135" y="235" width="130" height="8" rx="2" fill="#64748b" />
        {/* Wire gauze */}
        <rect x="140" y="232" width="120" height="4" fill="#cbd5e1" stroke="#334155" strokeDasharray="2 2" />

        {/* Bunsen Burner (Under Tripod) */}
        <rect x="185" y="280" width="30" height="60" rx="2" fill="#94a3b8" />
        <rect x="175" y="335" width="50" height="8" rx="2" fill="#475569" />
        {/* Flame if Running */}
        {isRunning && (
          <path
            d="M 190 280 Q 200 230 200 220 Q 200 230 210 280 Z"
            fill="url(#flameGrad)"
            opacity="0.9"
          />
        )}

        {/* Glass Beaker with Water on Gauze */}
        <rect x="150" y="110" width="100" height="122" rx="4" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
        {/* Water Level */}
        <rect x="152" y="160" width="96" height="70" fill="#0284c7" opacity="0.6" />
        {/* Steam / Boiling Bubbles */}
        {isBoiling && isRunning && (
          <g fill="#bae6fd">
            <circle cx="170" cy="180" r="4" />
            <circle cx="190" cy="170" r="5" />
            <circle cx="210" cy="190" r="4" />
            <circle cx="230" cy="175" r="3" />
            {/* Steam trails above beaker */}
            <path d="M 175 100 Q 185 80 180 60" fill="none" stroke="#e0f2fe" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M 215 100 Q 225 80 220 60" fill="none" stroke="#e0f2fe" strokeWidth="2" strokeDasharray="3 3" />
          </g>
        )}

        {/* Laboratory Thermometer in Beaker */}
        <rect x="195" y="40" width="10" height="180" rx="4" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />
        {/* Mercury Column */}
        {/* 0C is bottom 210, 100C is top 70 */}
        <rect
          x="198"
          y={210 - (temp / 100) * 130}
          width="4"
          height={(temp / 100) * 130 + 5}
          fill="#dc2626"
        />
        <circle cx="200" cy="215" r="6" fill="#dc2626" />
        <text x="215" y="60" fill="#f87171" fontSize="12" fontWeight="bold">
          {temp} °C
        </text>

        {/* HEATING CURVE GRAPH (Right) */}
        <g transform="translate(380, 50)">
          <rect x="0" y="0" width="300" height="260" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          <text x="20" y="28" fill="#38bdf8" fontSize="12" fontWeight="bold">
            पदार्थ की अवस्था परिवर्तन व गुप्त ऊष्मा (Latent Heat)
          </text>
          {/* Axis */}
          <line x1="40" y1="210" x2="270" y2="210" stroke="#64748b" strokeWidth="1.5" />
          <line x1="40" y1="210" x2="40" y2="50" stroke="#64748b" strokeWidth="1.5" />
          <text x="260" y="225" fill="#94a3b8" fontSize="9">समय t (min)</text>
          <text x="15" y="55" fill="#94a3b8" fontSize="9">ताप T (°C)</text>

          {/* Heating Curve Line: rise then horizontal plateau at 100C */}
          <path
            d="M 40 200 L 130 90 L 260 90"
            fill="none"
            stroke="#facc15"
            strokeWidth="3"
          />
          <line x1="40" y1="90" x2="270" y2="90" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
          <text x="45" y="85" fill="#ef4444" fontSize="9" fontWeight="bold">100 °C (क्वथनांक Boiling Point)</text>

          {/* Current progress dot */}
          <circle
            cx={temp < 100 ? 40 + (temp / 100) * 90 : 130 + (tMin - 8) * 15}
            cy={temp < 100 ? 200 - (temp / 100) * 110 : 90}
            r="6"
            fill="#38bdf8"
            stroke="#ffffff"
            strokeWidth="2"
          />
          <text x="30" y="245" fill="#4ade80" fontSize="11" fontWeight="bold">
            {temp >= 100 ? '✓ 100°C पर स्थिर (वाष्पीकरण की गुप्त ऊष्मा)' : 'जल गर्म हो रहा है (द्रव अवस्था)'}
          </text>
        </g>
      </svg>
    );
  }

  // 7. ACID-BASE TITRATION (Burette, Conical Flask, Phenolphthalein Pink End Point)
  if (sim === 'titration') {
    const v2 = currentControls.buretteVol ?? 10;
    const isPink = v2 >= 10;

    return (
      <svg viewBox="0 0 720 400" className="w-full h-auto max-h-[460px] drop-shadow-md select-none">
        <rect x="10" y="10" width="700" height="380" rx="16" fill="#0b1120" stroke="#334155" strokeWidth="2" />
        <rect x="40" y="340" width="640" height="20" rx="4" fill="#1e293b" />

        {/* Retort Stand with Burette Clamp */}
        <rect x="70" y="325" width="120" height="15" rx="3" fill="#475569" />
        <rect x="120" y="30" width="10" height="300" fill="#64748b" />
        <rect x="120" y="90" width="90" height="8" fill="#475569" />
        <rect x="120" y="170" width="90" height="8" fill="#475569" />

        {/* 50 mL Glass Burette */}
        <g transform="translate(195, 40)">
          <rect x="0" y="0" width="18" height="200" rx="2" fill="none" stroke="#94a3b8" strokeWidth="2" />
          {/* Liquid Column */}
          <rect x="2" y={v2 * 3} width="14" height={200 - v2 * 3} fill="#e0f2fe" opacity="0.6" />
          {/* Ticks */}
          {[10, 20, 30, 40, 50].map((ml) => (
            <line key={ml} x1="10" y1={ml * 3.5} x2="18" y2={ml * 3.5} stroke="#64748b" strokeWidth="1" />
          ))}
          {/* Stopcock Key */}
          <rect x="-6" y="200" width="30" height="8" rx="2" fill="#ef4444" />
          {/* Dropping Tip */}
          <polygon points="5,208 13,208 9,225" fill="#94a3b8" />
          {/* Falling Droplet if Running */}
          {isRunning && <circle cx="9" cy="240" r="3" fill={isPink ? '#f472b6' : '#e0f2fe'} />}
          {/* Burette Reading Tag */}
          <rect x="30" y="60" width="90" height="34" rx="6" fill="#0f172a" stroke="#38bdf8" />
          <text x="75" y="75" fill="#93c5fd" fontSize="9" fontWeight="bold" textAnchor="middle">
            BURETTE (NaOH)
          </text>
          <text x="75" y="90" fill="#ffffff" fontSize="12" fontWeight="bold" font-family="monospace" textAnchor="middle">
            {v2.toFixed(1)} mL
          </text>
        </g>

        {/* Conical Flask on Lab Bench */}
        <g transform="translate(160, 250)">
          {/* Flask Body */}
          <path
            d="M 35 0 L 35 25 L 10 85 Q 5 95 20 95 L 80 95 Q 95 95 90 85 L 65 25 L 65 0 Z"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2.5"
          />
          {/* Liquid in flask (Phenolphthalein color change) */}
          <path
            d="M 12 85 Q 7 93 20 93 L 80 93 Q 93 93 88 85 L 75 55 L 25 55 Z"
            fill={isPink ? '#ec4899' : '#f8fafc'}
            opacity={isPink ? '0.85' : '0.4'}
          />
          <text x="50" y="80" fill={isPink ? '#ffffff' : '#0f172a'} fontSize="10" fontWeight="bold" textAnchor="middle">
            {isPink ? 'गुलाबी (Pink ✓)' : 'रंगहीन (Acid)'}
          </text>
        </g>

        {/* Titration Formula & Results (Right) */}
        <g transform="translate(380, 50)">
          <rect x="0" y="0" width="300" height="260" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          <text x="20" y="28" fill="#38bdf8" fontSize="12" fontWeight="bold">
            अम्ल-क्षार उदासीनीकरण अनुमापन (Titration)
          </text>
          <line x1="20" y1="40" x2="280" y2="40" stroke="#1e293b" strokeWidth="1.5" />
          <text x="20" y="65" fill="#cbd5e1" fontSize="11">
            HCl आयतन (V₁): <tspan fill="#f8fafc" fontWeight="bold">10.0 mL</tspan>
          </text>
          <text x="20" y="95" fill="#cbd5e1" fontSize="11">
            NaOH आयतन (V₂): <tspan fill="#f8fafc" fontWeight="bold">{v2.toFixed(1)} mL</tspan>
          </text>
          <rect x="20" y="120" width="260" height="110" rx="8" fill="#1e293b" />
          <text x="30" y="145" fill="#facc15" fontSize="11" fontWeight="bold">
            सूत्र: M₁V₁ = M₂V₂
          </text>
          <text x="30" y="172" fill="#4ade80" fontSize="13" fontWeight="bold" font-family="monospace">
            M₂ = (0.1 × 10) / {v2} = {((0.1 * 10) / v2).toFixed(3)} M
          </text>
          <text x="30" y="205" fill={isPink ? '#ec4899' : '#94a3b8'} fontSize="11" fontWeight="bold">
            {v2 === 10
              ? '✓ सटीक अंतिम बिंदु (End Point): स्थायी हल्का गुलाबी!'
              : v2 > 10
              ? 'अत्यधिक क्षार (Dark Pink)'
              : 'उदासीनीकरण अपूर्ण (रंगहीन)'}
          </text>
        </g>
      </svg>
    );
  }

  // 8. CHEMICAL KINETICS (Disappearing Cross X Experiment)
  if (sim === 'kinetics') {
    const c = currentControls.concM ?? 0.04;
    const temp = currentControls.tempKinetics ?? 25;
    const baseTime = Math.round(2 / c);
    const tempFactor = Math.pow(0.8, (temp - 25) / 10);
    const timeSec = Math.max(8, Math.round(baseTime * tempFactor));

    return (
      <svg viewBox="0 0 720 400" className="w-full h-auto max-h-[460px] drop-shadow-md select-none">
        <rect x="10" y="10" width="700" height="380" rx="16" fill="#0b1120" stroke="#334155" strokeWidth="2" />
        <rect x="40" y="340" width="640" height="20" rx="4" fill="#1e293b" />

        {/* Top View of Beaker on White Tile with Black Cross (X) */}
        <g transform="translate(180, 180)">
          {/* White Glazed Tile */}
          <rect x="-90" y="-90" width="180" height="180" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
          {/* Black Cross Mark (X) underneath beaker */}
          <line x1="-40" y1="-40" x2="40" y2="40" stroke="#000000" strokeWidth="8" strokeLinecap="round" />
          <line x1="40" y1="-40" x2="-40" y2="40" stroke="#000000" strokeWidth="8" strokeLinecap="round" />
          {/* Beaker circular rim */}
          <circle cx="0" cy="0" r="70" fill="#fef08a" opacity={isRunning ? 0.95 : 0.3} stroke="#94a3b8" strokeWidth="3" />
          <text x="0" y="105" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
            {isRunning ? 'सल्फर अवक्षेप द्वारा क्रॉस (X) अदृश्य' : 'क्रॉस (X) स्पष्ट दिखाई दे रहा है'}
          </text>
        </g>

        {/* Digital Stopwatch & Kinetics Graph (Right) */}
        <g transform="translate(400, 50)">
          <rect x="0" y="0" width="280" height="260" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          <text x="20" y="28" fill="#38bdf8" fontSize="12" fontWeight="bold">
            रासायनिक बलगतिकी (Chemical Kinetics)
          </text>
          <line x1="20" y1="40" x2="260" y2="40" stroke="#1e293b" strokeWidth="1.5" />
          <text x="20" y="70" fill="#cbd5e1" fontSize="11">
            सांद्रता [Na₂S₂O₃]: <tspan fill="#f8fafc" fontWeight="bold">{c.toFixed(2)} M</tspan>
          </text>
          <text x="20" y="100" fill="#cbd5e1" fontSize="11">
            तापमान (Temperature): <tspan fill="#f8fafc" fontWeight="bold">{temp} °C</tspan>
          </text>
          <rect x="20" y="125" width="240" height="100" rx="8" fill="#1e293b" />
          <text x="30" y="150" fill="#facc15" fontSize="11" fontWeight="bold">
            क्रॉस छिपने का समय (t):
          </text>
          <text x="30" y="180" fill="#4ade80" fontSize="20" fontWeight="bold" font-family="monospace">
            t = {isRunning ? `${timeSec} s` : '—'}
          </text>
          <text x="30" y="208" fill="#38bdf8" fontSize="11">
            अभिक्रिया दर (Rate ∝ 1/t) = {(1 / timeSec).toFixed(3)} s⁻¹
          </text>
        </g>
      </svg>
    );
  }

  // 9. OSMOSIS (Swollen Raisins in Petri Dish & Balance)
  if (sim === 'osmosis') {
    const w1 = currentControls.initialWeight ?? 5;
    const hrs = currentControls.soakHours ?? 2;
    const gainRatio = hrs === 1 ? 0.3 : hrs === 2 ? 0.6 : hrs === 3 ? 0.7 : 0.8;
    const w2 = (w1 * (1 + gainRatio)).toFixed(2);
    const raisinRadius = isRunning ? 16 + hrs * 2 : 12;

    return (
      <svg viewBox="0 0 720 400" className="w-full h-auto max-h-[460px] drop-shadow-md select-none">
        <rect x="10" y="10" width="700" height="380" rx="16" fill="#0b1120" stroke="#334155" strokeWidth="2" />
        <rect x="40" y="340" width="640" height="20" rx="4" fill="#1e293b" />

        {/* Petri Dish with Water and Raisins */}
        <g transform="translate(180, 180)">
          {/* Glass Petri Dish */}
          <circle cx="0" cy="0" r="100" fill="#0284c7" opacity="0.3" stroke="#94a3b8" strokeWidth="3" />
          <circle cx="0" cy="0" r="90" fill="#38bdf8" opacity="0.2" />

          {/* Raisins (Kishmish) swollen by endosmosis */}
          {[-40, 0, 40].map((xOffset, idx) => (
            <ellipse
              key={idx}
              cx={xOffset}
              cy={idx === 1 ? -20 : 20}
              rx={raisinRadius}
              ry={raisinRadius * 0.85}
              fill="#78350f"
              stroke="#451a03"
              strokeWidth="2"
            />
          ))}
          <text x="0" y="125" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
            {isRunning ? `जल अवशोषण के बाद फूली हुई किशमिश (${hrs} घंटे)` : 'सूखी किशमिश (शुद्ध जल में)'}
          </text>
        </g>

        {/* Digital Balance Readout & Percentage Formula (Right) */}
        <g transform="translate(400, 60)">
          <rect x="0" y="0" width="280" height="250" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          <text x="20" y="28" fill="#38bdf8" fontSize="12" fontWeight="bold">
            अंतःपरासरण (Endosmosis Verification)
          </text>
          <line x1="20" y1="40" x2="260" y2="40" stroke="#1e293b" strokeWidth="1.5" />
          <text x="20" y="70" fill="#cbd5e1" fontSize="11">
            प्रारंभिक भार (W₁): <tspan fill="#f8fafc" fontWeight="bold">{w1} g</tspan>
          </text>
          <text x="20" y="100" fill="#cbd5e1" fontSize="11">
            जल में भिगोने का समय: <tspan fill="#f8fafc" fontWeight="bold">{hrs} घंटे</tspan>
          </text>
          <rect x="20" y="120" width="240" height="110" rx="8" fill="#1e293b" />
          <text x="30" y="145" fill="#facc15" fontSize="11" fontWeight="bold">
            फूला हुआ भार (W₂): {isRunning ? `${w2} g` : `${w1} g`}
          </text>
          <text x="30" y="175" fill="#4ade80" fontSize="13" fontWeight="bold">
            अवशोषित जल % = {isRunning ? `${(((parseFloat(w2) - w1) / w1) * 100).toFixed(1)}%` : '0%'}
          </text>
          <text x="30" y="205" fill="#94a3b8" fontSize="10">
            सूत्र: [(W₂ - W₁) / W₁] × 100
          </text>
        </g>
      </svg>
    );
  }

  // 10. PHOTOSYNTHESIS & OXYGEN EVOLUTION (Hydrilla Twig, Inverted Funnel, Test Tube, Lamp)
  if (sim === 'stomata_photosynthesis') {
    const dist = currentControls.lampDistance ?? 20;
    const t = currentControls.timeMinutes ?? 3;
    const rate = dist === 10 ? 30 : dist === 20 ? 20 : dist === 30 ? 15 : dist === 40 ? 10 : 6;
    const totalBubbles = rate * t;

    return (
      <svg viewBox="0 0 720 400" className="w-full h-auto max-h-[460px] drop-shadow-md select-none">
        <defs>
          <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="10" y="10" width="700" height="380" rx="16" fill="#0b1120" stroke="#334155" strokeWidth="2" />
        <rect x="40" y="340" width="640" height="20" rx="4" fill="#1e293b" />

        {/* Lamp on Left at Variable Distance */}
        <g transform={`translate(${50 + (40 - dist) * 2}, 160)`}>
          <rect x="0" y="20" width="20" height="60" rx="4" fill="#475569" />
          <polygon points="20,10 60,-20 60,120 20,90" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
          <circle cx="60" cy="50" r="40" fill="url(#lampGlow)" />
          <text x="30" y="135" fill="#fde047" fontSize="10" fontWeight="bold">
            {dist} cm
          </text>
        </g>

        {/* Large Beaker with Hydrilla Plant and Inverted Glass Funnel */}
        <g transform="translate(240, 100)">
          {/* Beaker */}
          <rect x="0" y="20" width="160" height="220" rx="8" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
          <rect x="2" y="40" width="156" height="198" fill="#0284c7" opacity="0.35" />

          {/* Inverted Funnel */}
          <polygon points="20,220 140,220 86,110 74,110" fill="none" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="74" y="50" width="12" height="60" fill="none" stroke="#cbd5e1" strokeWidth="2" />

          {/* Hydrilla Green Twigs inside funnel */}
          <path d="M 35 220 Q 50 180 80 180 Q 110 180 125 220" fill="none" stroke="#22c55e" strokeWidth="5" />
          <path d="M 50 220 Q 80 160 110 220" fill="none" stroke="#16a34a" strokeWidth="4" />

          {/* Inverted Test Tube Over Funnel Stem Collecting O2 Gas */}
          <rect x="70" y="20" width="20" height="80" rx="4" fill="none" stroke="#94a3b8" strokeWidth="2" />
          {/* Gas Pocket at top */}
          <rect x="72" y="22" width="16" height={isRunning ? 25 : 5} fill="#f8fafc" opacity="0.8" />
          <text x="80" y="35" fill="#0284c7" fontSize="8" fontWeight="bold" textAnchor="middle">O₂</text>

          {/* Rising Oxygen Bubbles */}
          {isRunning && (
            <g fill="#e0f2fe">
              <circle cx="80" cy="60" r="3" />
              <circle cx="80" cy="85" r="4" />
              <circle cx="78" cy="115" r="3" />
              <circle cx="82" cy="140" r="3.5" />
            </g>
          )}
        </g>

        {/* Results Card (Right) */}
        <g transform="translate(440, 60)">
          <rect x="0" y="0" width="240" height="250" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          <text x="20" y="28" fill="#38bdf8" fontSize="12" fontWeight="bold">
            प्रकाश-संश्लेषण में O₂ निष्कासन
          </text>
          <line x1="20" y1="40" x2="220" y2="40" stroke="#1e293b" strokeWidth="1.5" />
          <text x="20" y="70" fill="#cbd5e1" fontSize="11">
            प्रकाश स्रोत दूरी: <tspan fill="#f8fafc" fontWeight="bold">{dist} cm</tspan>
          </text>
          <text x="20" y="100" fill="#cbd5e1" fontSize="11">
            समय (Time): <tspan fill="#f8fafc" fontWeight="bold">{t} मिनट</tspan>
          </text>
          <rect x="20" y="125" width="200" height="100" rx="8" fill="#1e293b" />
          <text x="30" y="150" fill="#facc15" fontSize="11" fontWeight="bold">
            उत्सर्जित O₂ बुलबुले (N):
          </text>
          <text x="30" y="180" fill="#4ade80" fontSize="22" fontWeight="bold" font-family="monospace">
            {isRunning ? totalBubbles : 0} बुलबुले
          </text>
          <text x="30" y="208" fill="#38bdf8" fontSize="11">
            दर = {isRunning ? rate : 0} बुलबुले/मिनट
          </text>
        </g>
      </svg>
    );
  }

  // 11. TRANSPIRATION (Ganong's Potometer with Graduated Capillary & Air Bubble)
  if (sim === 'transpiration') {
    const wind = currentControls.windSpeed ?? 2;
    const t = currentControls.timePotometer ?? 5;
    const rate = wind * 3;
    const dist = rate * t;
    // Capillary bubble position along horizontal tube
    const bubbleX = 170 + Math.min(180, dist * 3.5);

    return (
      <svg viewBox="0 0 720 400" className="w-full h-auto max-h-[460px] drop-shadow-md select-none">
        <rect x="10" y="10" width="700" height="380" rx="16" fill="#0b1120" stroke="#334155" strokeWidth="2" />
        <rect x="40" y="340" width="640" height="20" rx="4" fill="#1e293b" />

        {/* Ganong's Potometer Glass Assembly */}
        {/* Vertical tube holding leafy twig */}
        <g transform="translate(130, 80)">
          {/* Fresh Cut Leafy Twig */}
          <path d="M 30 50 Q 10 20 0 0" stroke="#15803d" strokeWidth="4" />
          <path d="M 30 50 Q 50 15 60 -10" stroke="#15803d" strokeWidth="4" />
          <ellipse cx="0" cy="0" rx="16" ry="8" fill="#22c55e" transform="rotate(-30 0 0)" />
          <ellipse cx="60" cy="-10" rx="18" ry="9" fill="#22c55e" transform="rotate(25 60 -10)" />
          {/* Rubber Cork */}
          <rect x="20" y="50" width="20" height="15" rx="2" fill="#78350f" />
          {/* Glass tube */}
          <rect x="24" y="65" width="12" height="160" fill="none" stroke="#94a3b8" strokeWidth="2" />
          <rect x="26" y="65" width="8" height="160" fill="#0284c7" opacity="0.4" />
        </g>

        {/* Water Reservoir with Stopcock */}
        <g transform="translate(200, 120)">
          <path d="M 10 0 L 30 0 L 35 60 L 5 60 Z" fill="#0284c7" opacity="0.4" stroke="#94a3b8" strokeWidth="2" />
          <rect x="15" y="60" width="10" height="30" fill="none" stroke="#94a3b8" strokeWidth="2" />
          <rect x="8" y="75" width="24" height="6" fill="#ef4444" rx="2" />
          <text x="20" y="-10" fill="#cbd5e1" fontSize="9" textAnchor="middle">Water Reservoir</text>
        </g>

        {/* Horizontal Graduated Capillary Tube */}
        <g transform="translate(160, 225)">
          <rect x="0" y="0" width="220" height="12" rx="2" fill="none" stroke="#94a3b8" strokeWidth="2" />
          <rect x="2" y="2" width="216" height="8" fill="#38bdf8" opacity="0.4" />
          {/* Scale millimeters */}
          {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="12" stroke="#64748b" strokeWidth="1" />
          ))}
          {/* Beaker with coloured water at far right */}
          <rect x="220" y="-20" width="40" height="50" rx="3" fill="#f43f5e" opacity="0.6" stroke="#94a3b8" strokeWidth="2" />

          {/* Air Bubble Marker */}
          <ellipse cx={bubbleX - 160} cy="6" rx="6" ry="4" fill="#ffffff" stroke="#ef4444" strokeWidth="1.5" />
          <polygon points={`${bubbleX - 160}, -8 ${bubbleX - 164}, -18 ${bubbleX - 156}, -18`} fill="#ef4444" />
          <text x={bubbleX - 160} y="-22" fill="#f87171" fontSize="10" fontWeight="bold" textAnchor="middle">
            वायु बुलबुला ({dist} mm)
          </text>
        </g>

        {/* Transpiration Rate Summary (Right) */}
        <g transform="translate(460, 60)">
          <rect x="0" y="0" width="220" height="250" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          <text x="15" y="28" fill="#38bdf8" fontSize="12" fontWeight="bold">
            गैनोंग पोटोमीटर (Potometer)
          </text>
          <line x1="15" y1="40" x2="205" y2="40" stroke="#1e293b" strokeWidth="1.5" />
          <text x="15" y="70" fill="#cbd5e1" fontSize="11">
            पर्यावरण: <tspan fill="#f8fafc" fontWeight="bold">Level {wind} ({wind === 3 ? 'तेज धूप/हवा' : 'सामान्य'})</tspan>
          </text>
          <text x="15" y="100" fill="#cbd5e1" fontSize="11">
            समय t: <tspan fill="#f8fafc" fontWeight="bold">{t} मिनट</tspan>
          </text>
          <rect x="15" y="125" width="190" height="100" rx="8" fill="#1e293b" />
          <text x="25" y="150" fill="#facc15" fontSize="11" fontWeight="bold">
            बुलबुले का विस्थापन (d):
          </text>
          <text x="25" y="180" fill="#4ade80" fontSize="20" fontWeight="bold" font-family="monospace">
            {isRunning ? dist : 0} mm
          </text>
          <text x="25" y="208" fill="#38bdf8" fontSize="11">
            वाष्पोत्सर्जन दर = {isRunning ? rate.toFixed(1) : '0.0'} mm/min
          </text>
        </g>
      </svg>
    );
  }

  // 12. MITOSIS IN ONION ROOT TIP (Microscope Field View of Dividing Chromosomes)
  if (sim === 'mitosis_dna') {
    const div = currentControls.dividingCells ?? 25;
    const tot = currentControls.totalCells ?? 100;
    const mi = ((div / tot) * 100).toFixed(1);

    return (
      <svg viewBox="0 0 720 400" className="w-full h-auto max-h-[460px] drop-shadow-md select-none">
        <rect x="10" y="10" width="700" height="380" rx="16" fill="#0b1120" stroke="#334155" strokeWidth="2" />
        <rect x="40" y="340" width="640" height="20" rx="4" fill="#1e293b" />

        {/* Circular Microscope 450X Field of View */}
        <g transform="translate(200, 190)">
          <circle cx="0" cy="0" r="130" fill="#020617" stroke="#64748b" strokeWidth="8" />
          <circle cx="0" cy="0" r="122" fill="#4a044e" opacity="0.3" />

          {/* Plant Cells Grid (Onion Root Tip Cells with Pink Acetocarmine stained nuclei) */}
          {[-70, -35, 0, 35, 70].map((x) =>
            [-70, -35, 0, 35, 70].map((y) => {
              const isDividingCell = Math.abs(x + y) % 3 === 0;
              return (
                <g key={`${x}-${y}`} transform={`translate(${x}, ${y})`}>
                  {/* Hexagonal/Rectangular Plant Cell Wall */}
                  <rect x="-16" y="-16" width="32" height="32" rx="3" fill="none" stroke="#ec4899" strokeWidth="1" opacity="0.7" />
                  {isDividingCell ? (
                    // Dividing chromosomes in anaphase/metaphase
                    <g>
                      <line x1="-8" y1="-4" x2="8" y2="-4" stroke="#f43f5e" strokeWidth="3" />
                      <line x1="-8" y1="4" x2="8" y2="4" stroke="#f43f5e" strokeWidth="3" />
                    </g>
                  ) : (
                    // Resting Interphase nucleus
                    <circle cx="0" cy="0" r="6" fill="#be185d" />
                  )}
                </g>
              );
            })
          )}
          <circle cx="0" cy="0" r="122" fill="none" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="4 4" />
          <text x="0" y="150" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
            संयुक्त सूक्ष्मदर्शी दृश्य क्षेत्र (450X आवर्धन)
          </text>
        </g>

        {/* Mitotic Index Card (Right) */}
        <g transform="translate(420, 60)">
          <rect x="0" y="0" width="260" height="250" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          <text x="20" y="28" fill="#38bdf8" fontSize="12" fontWeight="bold">
            माइटोटिक इंडेक्स (Mitotic Index)
          </text>
          <line x1="20" y1="40" x2="240" y2="40" stroke="#1e293b" strokeWidth="1.5" />
          <text x="20" y="70" fill="#cbd5e1" fontSize="11">
            कुल कोशिकाएँ (N_total): <tspan fill="#f8fafc" fontWeight="bold">{tot}</tspan>
          </text>
          <text x="20" y="100" fill="#cbd5e1" fontSize="11">
            विभाजित कोशिकाएँ (N_div): <tspan fill="#f8fafc" fontWeight="bold">{div}</tspan>
          </text>
          <rect x="20" y="125" width="220" height="100" rx="8" fill="#1e293b" />
          <text x="30" y="150" fill="#facc15" fontSize="11" fontWeight="bold">
            सूत्र: MI = (N_div / N_total) × 100
          </text>
          <text x="30" y="182" fill="#4ade80" fontSize="24" fontWeight="bold" font-family="monospace">
            MI = {mi}%
          </text>
          <text x="30" y="210" fill="#94a3b8" fontSize="10">
            विभज्योतक ऊतक (Meristem) सक्रिय विभाजन
          </text>
        </g>
      </svg>
    );
  }

  // 13. VERNIER CALLIPERS & PRECISION MEASUREMENT (Metallic Sphere clamped between jaws)
  const msr = currentControls.msr ?? 2.0;
  const vsc = currentControls.vsc ?? 4;
  const totalD = (msr + vsc * 0.01).toFixed(2);

  return (
    <svg viewBox="0 0 720 400" className="w-full h-auto max-h-[460px] drop-shadow-md select-none">
      <rect x="10" y="10" width="700" height="380" rx="16" fill="#0b1120" stroke="#334155" strokeWidth="2" />
      <rect x="40" y="340" width="640" height="20" rx="4" fill="#1e293b" />

      {/* Main Steel Beam Scale of Vernier Callipers */}
      <g transform="translate(60, 100)">
        {/* Fixed Frame and Lower Jaw J1 */}
        <rect x="0" y="40" width="560" height="50" rx="4" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
        <path d="M 0 40 L 0 200 L 35 200 L 35 90 L 560 90 L 560 40 Z" fill="#64748b" stroke="#334155" strokeWidth="2" />

        {/* Main Scale cm and mm Ticks */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cm) => (
          <g key={cm} transform={`translate(${45 + cm * 45}, 40)`}>
            <line x1="0" y1="0" x2="0" y2="25" stroke="#0f172a" strokeWidth="2" />
            <text x="0" y="38" fill="#0f172a" fontSize="10" fontWeight="bold" textAnchor="middle">
              {cm}
            </text>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((mm) => (
              <line key={mm} x1={mm * 4.5} y1="0" x2={mm * 4.5} y2={mm === 5 ? 18 : 12} stroke="#334155" strokeWidth="1" />
            ))}
          </g>
        ))}

        {/* Specimen Sphere Clamped Between Jaws */}
        {/* Radius proportional to measured diameter */}
        <circle cx={35 + (msr * 45) / 2} cy="150" r={Math.max(15, (msr * 45) / 2)} fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
        <text x={35 + (msr * 45) / 2} y="154" fill="#78350f" fontSize="10" fontWeight="bold" textAnchor="middle">
          {totalD} cm
        </text>

        {/* Sliding Vernier Vernier Jaw J2 */}
        <g transform={`translate(${35 + msr * 45}, 20)`}>
          {/* Vernier Window and Jaw J2 */}
          <path d="M 0 20 L 70 20 L 70 70 L 35 70 L 35 180 L 0 180 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
          {/* Vernier scale 10 divisions */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((vDiv) => (
            <line
              key={vDiv}
              x1={vDiv * 4.05}
              y1="40"
              x2={vDiv * 4.05}
              y2={vDiv === vsc ? 65 : 55}
              stroke={vDiv === vsc ? '#dc2626' : '#0f172a'}
              strokeWidth={vDiv === vsc ? 2.5 : 1}
            />
          ))}
          <text x="25" y="15" fill="#1e293b" fontSize="8" fontWeight="bold">
            VERNIER (LC=0.01cm)
          </text>
        </g>
      </g>

      {/* Magnified Vernier Coincidence Readout (Bottom Right) */}
      <g transform="translate(420, 220)">
        <rect x="0" y="0" width="260" height="130" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="2" />
        <text x="15" y="24" fill="#38bdf8" fontSize="12" fontWeight="bold">
          वर्नियर संपाती चिह्न (Coincidence)
        </text>
        <line x1="15" y1="34" x2="245" y2="34" stroke="#1e293b" strokeWidth="1" />
        <text x="15" y="55" fill="#cbd5e1" fontSize="11">
          मुख्य स्केल (MSR): <tspan fill="#f8fafc" fontWeight="bold">{msr.toFixed(1)} cm</tspan>
        </text>
        <text x="15" y="78" fill="#facc15" fontSize="11" fontWeight="bold">
          संपाती भाग (VSC n): {vsc} वाँ चिह्न
        </text>
        <text x="15" y="105" fill="#4ade80" fontSize="14" fontWeight="bold" font-family="monospace">
          कुल व्यास D = {msr.toFixed(1)} + ({vsc} × 0.01) = {totalD} cm
        </text>
      </g>
    </svg>
  );
};
