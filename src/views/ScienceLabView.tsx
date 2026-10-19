import React, { useState, useMemo, useEffect } from 'react';
import {
  Atom,
  Zap,
  TestTube,
  Microscope,
  Wrench,
  Play,
  RotateCcw,
  CheckCircle2,
  Sliders,
  BookOpen,
  Search,
  Bookmark,
  History,
  HelpCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Clock,
  AlertTriangle,
  Lightbulb,
  Plus,
  Trash2,
  Check,
  Target,
  Calculator,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';
import type { MainNavRoute } from '../types';
import { LabApparatusDiagram } from '../components/LabApparatusDiagram';
import {
  LAB_EXPERIMENTS,
  type DifficultyLevel,
  type LabClassLevel,
  type LabExperimentConfig,
  type LabSubject,
  type QuestionType,
} from '../data/virtualLabExperimentsData';
import {
  VIRTUAL_LAB_1000_QUESTIONS,
  getQuestionBankValidationSummary,
} from '../data/virtualLab1000Questions';

interface AttemptHistoryEntry {
  id: string;
  questionId: string;
  experiment: string;
  subject: LabSubject;
  classLevel: LabClassLevel;
  selectedOption: string;
  isCorrect: boolean;
  attemptsUsed: number;
  timestamp: string;
}

interface ExperimentProgressState {
  started: boolean;
  equipmentViewed: string[];
  connectedSteps: number; // 0 to connectionSteps.length
  switchOn: boolean;
  observations: Record<string, string | number>[];
  calculationInput: string;
  calculationVerified: boolean;
  calculationAttempts: number;
  resultGenerated: boolean;
}

const STORAGE_KEY_BOOKMARKS = 'rk_vlab_bookmarks_v1';
const STORAGE_KEY_HISTORY = 'rk_vlab_attempt_history_v1';
const STORAGE_KEY_SOLVED = 'rk_vlab_solved_questions_v1';

export function ScienceLabView({ onNavigate: _onNavigate }: { onNavigate?: (route: MainNavRoute) => void }) {
  // Top-level mode: 'workbench' ("प्रयोग करो" Interactive Experiment) | 'question_bank' (1000 Questions Explorer) | 'history' (Attempt History & Progress)
  const [viewMode, setViewMode] = useState<'workbench' | 'question_bank' | 'history'>('workbench');

  // Dashboard Filters for "प्रयोग करो"
  const [selectedSubject, setSelectedSubject] = useState<LabSubject | 'All'>('Physics');
  const [selectedClass, setSelectedClass] = useState<LabClassLevel | 'All'>('10');
  const [activeExperimentId, setActiveExperimentId] = useState<string>('exp-phy-10-ohms-law');

  // Active Experiment Lookup
  const activeExperiment: LabExperimentConfig = useMemo(() => {
    return (
      LAB_EXPERIMENTS.find((e) => e.id === activeExperimentId) || LAB_EXPERIMENTS[0]
    );
  }, [activeExperimentId]);

  // Filtered Experiments in Dashboard
  const filteredExperiments = useMemo(() => {
    return LAB_EXPERIMENTS.filter((exp) => {
      const matchSub = selectedSubject === 'All' || exp.subject === selectedSubject;
      const matchCls = selectedClass === 'All' || exp.class === selectedClass;
      return matchSub && matchCls;
    });
  }, [selectedSubject, selectedClass]);

  // Per-Experiment Interactive Progress State
  const [expStates, setExpStates] = useState<Record<string, ExperimentProgressState>>(() => {
    const init: Record<string, ExperimentProgressState> = {};
    for (const exp of LAB_EXPERIMENTS) {
      init[exp.id] = {
        started: exp.id === 'exp-phy-10-ohms-law',
        equipmentViewed: exp.id === 'exp-phy-10-ohms-law' ? exp.equipment.map((eq) => eq.id) : [],
        connectedSteps: exp.id === 'exp-phy-10-ohms-law' ? exp.connectionSteps.length : 0,
        switchOn: exp.id === 'exp-phy-10-ohms-law',
        observations: exp.id === 'exp-phy-10-ohms-law' ? [...exp.defaultReferenceRows] : [],
        calculationInput: '',
        calculationVerified: false,
        calculationAttempts: 0,
        resultGenerated: false,
      };
    }
    return init;
  });

  // Dynamic Slider Control Values per Experiment
  const [controlValues, setControlValues] = useState<Record<string, Record<string, number>>>(() => {
    const init: Record<string, Record<string, number>> = {};
    for (const exp of LAB_EXPERIMENTS) {
      init[exp.id] = {};
      for (const ctrl of exp.controls) {
        init[exp.id][ctrl.id] = ctrl.defaultValue;
      }
    }
    return init;
  });

  const currentExpState = expStates[activeExperiment.id] || {
    started: true,
    equipmentViewed: [],
    connectedSteps: 0,
    switchOn: false,
    observations: [],
    calculationInput: '',
    calculationVerified: false,
    calculationAttempts: 0,
    resultGenerated: false,
  };

  const currentControls = controlValues[activeExperiment.id] || {};

  // Update helper for current experiment state
  const updateExpState = (patch: Partial<ExperimentProgressState>) => {
    setExpStates((prev) => ({
      ...prev,
      [activeExperiment.id]: {
        ...prev[activeExperiment.id],
        ...patch,
      },
    }));
  };

  const handleControlChange = (ctrlId: string, val: number) => {
    setControlValues((prev) => ({
      ...prev,
      [activeExperiment.id]: {
        ...(prev[activeExperiment.id] || {}),
        [ctrlId]: val,
      },
    }));
  };

  // ============================================================================
  // QUESTION ATTEMPT, TRY-AGAIN (1st Wrong) & HINT (2nd Wrong) ENGINE
  // ============================================================================
  const [questionAttempts, setQuestionAttempts] = useState<
    Record<
      string,
      {
        selectedOption: string;
        wrongCount: number;
        isSolved: boolean;
        status: 'unattempted' | 'try_again' | 'hint_unlocked' | 'correct';
      }
    >
  >(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOLVED);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [attemptHistory, setAttemptHistory] = useState<AttemptHistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SOLVED, JSON.stringify(questionAttempts));
    } catch {
      // ignore storage quota errors
    }
  }, [questionAttempts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(bookmarks));
    } catch {
      // ignore
    }
  }, [bookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(attemptHistory.slice(0, 250)));
    } catch {
      // ignore
    }
  }, [attemptHistory]);

  const toggleBookmark = (qId: string) => {
    setBookmarks((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  // Pedagogical Verification Rule:
  // 1st wrong answer -> "Try Again" (do NOT reveal answer)
  // 2nd+ wrong answer -> Unlock "Hint" (do NOT reveal answer until solved or explicitly requested after 2 wrong tries)
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});

  const handleSelectQuestionOption = (
    qId: string,
    optionText: string,
    correctAnswer: string,
    expName: string,
    subject: LabSubject,
    classLevel: LabClassLevel
  ) => {
    const existing = questionAttempts[qId] || {
      selectedOption: '',
      wrongCount: 0,
      isSolved: false,
      status: 'unattempted',
    };

    const isCorrect = optionText.trim() === correctAnswer.trim();
    const newWrongCount = isCorrect ? existing.wrongCount : existing.wrongCount + 1;
    const nextStatus = isCorrect
      ? 'correct'
      : newWrongCount === 1
      ? 'try_again'
      : 'hint_unlocked';

    setQuestionAttempts((prev) => ({
      ...prev,
      [qId]: {
        selectedOption: optionText,
        wrongCount: newWrongCount,
        isSolved: isCorrect || existing.isSolved,
        status: nextStatus,
      },
    }));

    setAttemptHistory((prev) => [
      {
        id: `${qId}-${Date.now()}`,
        questionId: qId,
        experiment: expName,
        subject,
        classLevel,
        selectedOption: optionText,
        isCorrect,
        attemptsUsed: newWrongCount + (isCorrect ? 1 : 0),
        timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev,
    ]);
  };

  const handleRetryQuestion = (qId: string) => {
    setQuestionAttempts((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
    setRevealedExplanations((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  };

  // ============================================================================
  // LIVE SIMULATOR PHYSICS / CHEMISTRY / BIOLOGY / PRACTICAL COMPUTATIONS
  // ============================================================================
  const isCircuitComplete =
    currentExpState.connectedSteps >= activeExperiment.connectionSteps.length;
  const isRunning = isCircuitComplete && currentExpState.switchOn;

  const liveSimulationMetrics = useMemo(() => {
    const sim = activeExperiment.simulatorType;
    if (sim === 'ohms_law') {
      const v = currentControls.voltage ?? 1;
      const r = currentControls.resistance ?? 10;
      const i = isRunning ? Number((v / r).toFixed(2)) : 0;
      const ratio = isRunning && i > 0 ? (v / i).toFixed(1) : '—';
      return {
        primaryLabel: 'Ammeter Reading (I)',
        primaryValue: `${i.toFixed(2)} A`,
        secondaryLabel: 'Voltmeter Reading (V)',
        secondaryValue: `${isRunning ? v.toFixed(1) : '0.0'} V`,
        tertiaryLabel: 'Resistance (R = V/I)',
        tertiaryValue: `${r} Ω`,
        observationRow: {
          voltage: `${v} V`,
          resistance: `${r} Ω`,
          current: `${(v / r).toFixed(2)} A`,
          calculatedR: `${r.toFixed(1)} Ω`,
        },
      };
    }

    if (sim === 'archimedes') {
      const w1 = currentControls.massAir ?? 250;
      const vol = currentControls.volumeSubmerged ?? 50;
      const w2 = isRunning ? w1 - vol : w1;
      return {
        primaryLabel: 'Spring Balance in Water (W₂)',
        primaryValue: `${w2} gwt`,
        secondaryLabel: 'Displaced Water (V)',
        secondaryValue: `${isRunning ? vol : 0} mL`,
        tertiaryLabel: 'Buoyant Loss (W₁ - W₂)',
        tertiaryValue: `${isRunning ? vol : 0} gwt`,
        observationRow: {
          w1: `${w1} gwt`,
          volume: `${vol} mL`,
          w2: `${w1 - vol} gwt`,
          loss: `${vol} gwt`,
        },
      };
    }

    if (sim === 'pendulum') {
      const lengthCm = currentControls.lengthCm ?? 100;
      const g = currentControls.gravity ?? 9.8;
      const periodT = 2 * Math.PI * Math.sqrt(lengthCm / 100 / g);
      const time20 = periodT * 20;
      return {
        primaryLabel: 'Stopwatch (20 Oscillations)',
        primaryValue: `${isRunning ? time20.toFixed(1) : '0.0'} s`,
        secondaryLabel: 'Time Period (T = t/20)',
        secondaryValue: `${isRunning ? periodT.toFixed(2) : '0.00'} s`,
        tertiaryLabel: 'Measured g (4π²L/T²)',
        tertiaryValue: `9.80 m/s²`,
        observationRow: {
          length: `${lengthCm} cm`,
          time20: `${time20.toFixed(1)} s`,
          periodT: `${periodT.toFixed(2)} s`,
          calcG: `9.80 m/s²`,
        },
      };
    }

    if (sim === 'wheatstone') {
      const r = currentControls.knownR ?? 6;
      const l = currentControls.balanceL ?? 50;
      const rem = 100 - l;
      const x = (r * rem) / l;
      const deflection = l === 50 ? '0.0 mA (Null Point)' : `${((l - 50) * 0.4).toFixed(1)} mA`;
      return {
        primaryLabel: 'Galvanometer Deflection (Ig)',
        primaryValue: isRunning ? deflection : 'OFF',
        secondaryLabel: 'Balance Length (l)',
        secondaryValue: `${l} cm`,
        tertiaryLabel: 'Unknown X = R(100-l)/l',
        tertiaryValue: `${x.toFixed(2)} Ω`,
        observationRow: {
          knownR: `${r} Ω`,
          lengthL: `${l} cm`,
          remLength: `${rem} cm`,
          unknownX: `${x.toFixed(2)} Ω`,
        },
      };
    }

    if (sim === 'ph_scale') {
      const ph = currentControls.phValue ?? 2;
      const colorName =
        ph < 3
          ? 'गहरा लाल (Red)'
          : ph < 7
          ? 'नारंगी-पीला (Orange/Yellow)'
          : ph === 7
          ? 'हरा (Emerald Green)'
          : ph < 11
          ? 'नीला (Blue)'
          : 'गहरा बैंगनी (Violet)';
      const nature =
        ph < 7 ? 'अम्लीय (Acidic)' : ph === 7 ? 'उदासीन (Neutral)' : 'क्षारीय (Alkaline)';
      return {
        primaryLabel: 'Digital pH Meter Reading',
        primaryValue: `pH ${ph.toFixed(1)}`,
        secondaryLabel: 'Universal Indicator Colour',
        secondaryValue: colorName,
        tertiaryLabel: 'pOH (14 - pH)',
        tertiaryValue: `${(14 - ph).toFixed(1)}`,
        observationRow: {
          sample: `Sample (pH ${ph})`,
          ph: ph.toFixed(1),
          color: colorName,
          nature,
        },
      };
    }

    if (sim === 'matter_state') {
      const tMin = currentControls.heatingTime ?? 4;
      const flame = currentControls.flameLevel ?? 2;
      const rawTemp = Math.min(100, 20 + tMin * flame * 10);
      const tempK = rawTemp + 273;
      const phase =
        rawTemp >= 100 ? 'उबलता जल + भाप (100°C Boiling)' : 'गर्म होता द्रव जल (Liquid)';
      return {
        primaryLabel: 'Thermometer Reading (°C)',
        primaryValue: `${rawTemp} °C`,
        secondaryLabel: 'Kelvin Scale (K)',
        secondaryValue: `${tempK} K`,
        tertiaryLabel: 'Phase State',
        tertiaryValue: rawTemp >= 100 ? 'Boiling (Latent Heat)' : 'Liquid Heating',
        observationRow: {
          time: `${tMin} min`,
          tempC: `${rawTemp} °C`,
          tempK: `${tempK} K`,
          phase,
        },
      };
    }

    if (sim === 'titration') {
      const m1 = currentControls.acidMolarity ?? 0.1;
      const v2 = currentControls.buretteVol ?? 10;
      const v1 = 10;
      const m2 = (m1 * v1) / v2;
      const status =
        v2 < 10
          ? 'रंगहीन (Acidic)'
          : v2 === 10
          ? 'हल्का गुलाबी (End Point ✓)'
          : 'गहरा गुलाबी (Excess Base)';
      return {
        primaryLabel: 'Burette Reading (V₂)',
        primaryValue: `${v2.toFixed(1)} mL`,
        secondaryLabel: 'Calculated NaOH (M₂)',
        secondaryValue: `${m2.toFixed(3)} M`,
        tertiaryLabel: 'Phenolphthalein Status',
        tertiaryValue: status,
        observationRow: {
          acidVol: `${v1.toFixed(1)} mL`,
          acidM: `${m1.toFixed(2)} M`,
          baseVol: `${v2.toFixed(1)} mL`,
          status,
        },
      };
    }

    if (sim === 'kinetics') {
      const c = currentControls.concM ?? 0.04;
      const temp = currentControls.tempKinetics ?? 25;
      const baseTime = Math.round(2 / c);
      const tempFactor = Math.pow(0.8, (temp - 25) / 10);
      const timeSec = Math.max(8, Math.round(baseTime * tempFactor));
      const rateInv = (1 / timeSec).toFixed(3);
      return {
        primaryLabel: 'Time for Cross (X) to Vanish',
        primaryValue: `${timeSec} s`,
        secondaryLabel: 'Relative Rate (1/t)',
        secondaryValue: `${rateInv} s⁻¹`,
        tertiaryLabel: 'Reaction Temp',
        tertiaryValue: `${temp} °C`,
        observationRow: {
          conc: `${c.toFixed(2)} M`,
          temp: `${temp} °C`,
          timeSec: `${timeSec} s`,
          rateInv: `${rateInv} s⁻¹`,
        },
      };
    }

    if (sim === 'osmosis') {
      const w1 = currentControls.initialWeight ?? 5;
      const hrs = currentControls.soakHours ?? 2;
      const gainRatio = hrs === 1 ? 0.3 : hrs === 2 ? 0.6 : hrs === 3 ? 0.7 : 0.8;
      const w2 = Number((w1 * (1 + gainRatio)).toFixed(2));
      const pct = (((w2 - w1) / w1) * 100).toFixed(1);
      return {
        primaryLabel: 'Final Swollen Weight (W₂)',
        primaryValue: `${w2} g`,
        secondaryLabel: 'Water Absorbed (W₂ - W₁)',
        secondaryValue: `${(w2 - w1).toFixed(2)} g`,
        tertiaryLabel: 'Absorption Percentage',
        tertiaryValue: `${pct}%`,
        observationRow: {
          w1: `${w1.toFixed(1)} g`,
          time: `${hrs} hr`,
          w2: `${w2.toFixed(2)} g`,
          percent: `${pct}%`,
        },
      };
    }

    if (sim === 'stomata_photosynthesis') {
      const dist = currentControls.lampDistance ?? 20;
      const t = currentControls.timeMinutes ?? 3;
      const ratePerMin = dist === 10 ? 30 : dist === 20 ? 20 : dist === 30 ? 15 : dist === 40 ? 10 : 6;
      const totalBubbles = ratePerMin * t;
      return {
        primaryLabel: 'Total O₂ Bubbles (N)',
        primaryValue: `${isRunning ? totalBubbles : 0} bubbles`,
        secondaryLabel: 'Photosynthesis Rate (N/t)',
        secondaryValue: `${isRunning ? ratePerMin : 0} bubbles/min`,
        tertiaryLabel: 'Stomatal Aperture',
        tertiaryValue: dist <= 20 ? 'Wide Open (पूर्ण खुला)' : 'Partially Open',
        observationRow: {
          distance: `${dist} cm`,
          time: `${t} min`,
          bubbles: `${totalBubbles}`,
          rate: `${ratePerMin} bubbles/min`,
        },
      };
    }

    if (sim === 'transpiration') {
      const wind = currentControls.windSpeed ?? 2;
      const t = currentControls.timePotometer ?? 5;
      const rate = wind * 3;
      const dist = rate * t;
      return {
        primaryLabel: 'Capillary Bubble Shift (d)',
        primaryValue: `${isRunning ? dist : 0} mm`,
        secondaryLabel: 'Transpiration Rate (d/t)',
        secondaryValue: `${rate.toFixed(1)} mm/min`,
        tertiaryLabel: 'Wind/Light Level',
        tertiaryValue: `Level ${wind}`,
        observationRow: {
          condition: `Level ${wind}`,
          time: `${t} min`,
          distance: `${dist} mm`,
          rate: `${rate.toFixed(1)} mm/min`,
        },
      };
    }

    if (sim === 'mitosis_dna') {
      const div = currentControls.dividingCells ?? 25;
      const tot = currentControls.totalCells ?? 100;
      const mi = ((div / tot) * 100).toFixed(1);
      return {
        primaryLabel: 'Mitotic Index (MI)',
        primaryValue: `${mi}%`,
        secondaryLabel: 'Dividing Cells (P+M+A+T)',
        secondaryValue: `${div} cells`,
        tertiaryLabel: 'Interphase Cells',
        tertiaryValue: `${tot - div} cells`,
        observationRow: {
          total: `${tot}`,
          interphase: `${tot - div}`,
          dividing: `${div}`,
          mi: `${mi}%`,
        },
      };
    }

    // Default: vernier_screw
    const msr = currentControls.msr ?? 2.0;
    const vsc = currentControls.vsc ?? 4;
    const vcVal = vsc * 0.01;
    const totalD = (msr + vcVal).toFixed(2);
    return {
      primaryLabel: 'Total Vernier Reading (D)',
      primaryValue: `${totalD} cm`,
      secondaryLabel: 'Main Scale (MSR)',
      secondaryValue: `${msr.toFixed(1)} cm`,
      tertiaryLabel: 'Vernier Coincidence (n×LC)',
      tertiaryValue: `${vcVal.toFixed(2)} cm`,
      observationRow: {
        msr: `${msr.toFixed(1)} cm`,
        vsc: `${vsc} div`,
        vcValue: `${vcVal.toFixed(2)} cm`,
        totalD: `${totalD} cm`,
      },
    };
  }, [activeExperiment, currentControls, isRunning]);

  // Record current reading to Observation Table
  const handleRecordObservation = () => {
    const newRow = liveSimulationMetrics.observationRow;
    updateExpState({
      observations: [...currentExpState.observations, newRow],
    });
  };

  const handleLoadStandardObservations = () => {
    updateExpState({
      observations: [...activeExperiment.defaultReferenceRows],
    });
  };

  // Verify Student's Formula Calculation Challenge
  const [calcFeedback, setCalcFeedback] = useState<{
    status: 'idle' | 'try_again' | 'hint' | 'correct';
    message: string;
  }>({ status: 'idle', message: '' });

  const handleVerifyCalculation = () => {
    const raw = currentExpState.calculationInput.replace(/[^\d.-]/g, '');
    const numericVal = parseFloat(raw);
    const challenge = activeExperiment.calculationChallenge;

    if (isNaN(numericVal)) {
      setCalcFeedback({
        status: 'try_again',
        message: 'कृपया संख्यात्मक मान (जैसे 0.5) दर्ज करें।',
      });
      return;
    }

    const isMatch =
      Math.abs(numericVal - challenge.expectedNumericAnswer) <= challenge.tolerance;

    if (isMatch) {
      updateExpState({
        calculationVerified: true,
        resultGenerated: true,
        calculationAttempts: currentExpState.calculationAttempts + 1,
      });
      setCalcFeedback({
        status: 'correct',
        message: `सही गणना! ${challenge.stepByStepSolution}`,
      });
    } else {
      const nextAttempts = currentExpState.calculationAttempts + 1;
      updateExpState({
        calculationAttempts: nextAttempts,
      });
      if (nextAttempts === 1) {
        setCalcFeedback({
          status: 'try_again',
          message: 'उत्तर सही नहीं है। Try Again (पुनः प्रयास करें) — दिए गए मानों की जाँच करें।',
        });
      } else {
        setCalcFeedback({
          status: 'hint',
          message: `Hint (संकेत): सूत्र ${challenge.formulaUsed} में (${challenge.givenValues}) रखकर गणना करें।`,
        });
      }
    }
  };

  // Questions linked to the active experiment (for the Workbench Questions section)
  const activeExperimentQuestions = useMemo(() => {
    const exactMatch = VIRTUAL_LAB_1000_QUESTIONS.filter(
      (q) =>
        q.experiment.toLowerCase() === activeExperiment.name.toLowerCase() ||
        (q.subject === activeExperiment.subject && q.class === activeExperiment.class)
    );
    return exactMatch.slice(0, 10);
  }, [activeExperiment]);

  const solvedInActiveExpCount = useMemo(() => {
    return activeExperimentQuestions.filter((q) => questionAttempts[q.id]?.isSolved).length;
  }, [activeExperimentQuestions, questionAttempts]);

  // ============================================================================
  // 8-STEP PROGRESS & 25-MARK SCORING SYSTEM FOR ACTIVE EXPERIMENT
  // ============================================================================
  // Marks breakdown:
  // - Experiment completion (Setup & Equipment & Connection): 5 marks
  // - Observation: 5 marks
  // - Calculation: 5 marks
  // - Questions (10 questions × 1 mark): 10 marks
  // Total = 25 marks
  const experimentMarks = useMemo(() => {
    const equipDone = currentExpState.equipmentViewed.length > 0;
    const setupDone = currentExpState.connectedSteps >= activeExperiment.connectionSteps.length;
    const setupMarks =
      (currentExpState.started ? 1 : 0) +
      (equipDone ? 2 : 0) +
      (setupDone ? 2 : 0); // max 5
    const obsMarks = Math.min(5, currentExpState.observations.length); // 5 marks for observations
    const calcMarks = currentExpState.calculationVerified ? 5 : 0; // 5 marks for calculation
    const qMarks = Math.min(10, solvedInActiveExpCount); // 10 marks for questions
    const total = setupMarks + obsMarks + calcMarks + qMarks;

    const steps = [
      { id: 1, label: 'Experiment Started', hindi: 'प्रयोग प्रारंभ', done: currentExpState.started },
      {
        id: 2,
        label: 'Equipment Viewed',
        hindi: 'उपकरण देखे गए',
        done: currentExpState.equipmentViewed.length >= Math.min(2, activeExperiment.equipment.length),
      },
      {
        id: 3,
        label: 'Circuit/Setup Completed',
        hindi: 'परिपथ/सेटअप पूर्ण',
        done: setupDone && currentExpState.switchOn,
      },
      {
        id: 4,
        label: 'Observation Taken',
        hindi: 'प्रेक्षण लिया गया',
        done: currentExpState.observations.length >= 1,
      },
      {
        id: 5,
        label: 'Calculation Completed',
        hindi: 'गणना पूर्ण',
        done: currentExpState.calculationVerified,
      },
      {
        id: 6,
        label: 'Result Obtained',
        hindi: 'परिणाम प्राप्त',
        done: currentExpState.resultGenerated || currentExpState.calculationVerified,
      },
      {
        id: 7,
        label: 'Questions Attempted',
        hindi: 'प्रश्न हल किए गए',
        done: solvedInActiveExpCount >= 1,
      },
      {
        id: 8,
        label: 'Experiment Completed',
        hindi: 'प्रयोग पूर्ण',
        done:
          setupDone &&
          currentExpState.observations.length >= 1 &&
          currentExpState.calculationVerified &&
          solvedInActiveExpCount >= 1,
      },
    ];

    const completedStepsCount = steps.filter((s) => s.done).length;
    return {
      setupMarks,
      obsMarks,
      calcMarks,
      qMarks,
      total,
      steps,
      completedStepsCount,
      isFullyCompleted: steps[7].done,
    };
  }, [currentExpState, activeExperiment, solvedInActiveExpCount]);

  // Reset Active Experiment
  const handleResetExperiment = () => {
    updateExpState({
      started: true,
      equipmentViewed: [],
      connectedSteps: 0,
      switchOn: false,
      observations: [],
      calculationInput: '',
      calculationVerified: false,
      calculationAttempts: 0,
      resultGenerated: false,
    });
    setCalcFeedback({ status: 'idle', message: '' });
  };

  // ============================================================================
  // 1000 QUESTIONS EXPLORER FILTERS, PRACTICE MODE & TEST MODE
  // ============================================================================
  const [qSearch, setQSearch] = useState<string>('');
  const [qSubjectFilter, setQSubjectFilter] = useState<LabSubject | 'All'>('All');
  const [qClassFilter, setQClassFilter] = useState<LabClassLevel | 'All'>('All');
  const [qChapterFilter, setQChapterFilter] = useState<string>('All');
  const [qExperimentFilter, setQExperimentFilter] = useState<string>('All');
  const [qDifficultyFilter, setQDifficultyFilter] = useState<DifficultyLevel | 'All'>('All');
  const [qTypeFilter, setQTypeFilter] = useState<QuestionType | 'All'>('All');
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);
  const [randomSeedIds, setRandomSeedIds] = useState<string[] | null>(null);
  const [practiceOrTestMode, setPracticeOrTestMode] = useState<'practice' | 'test'>('practice');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [focusedQuestionIndex, setFocusedQuestionIndex] = useState<number | null>(null);

  // Test Mode State
  const [testTimeLeftSec, setTestTimeLeftSec] = useState<number>(600); // 10 mins
  const [testSubmitted, setTestSubmitted] = useState<boolean>(false);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (viewMode !== 'question_bank' || practiceOrTestMode !== 'test' || testSubmitted) return;
    const timer = setInterval(() => {
      setTestTimeLeftSec((prev) => {
        if (prev <= 1) {
          setTestSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [viewMode, practiceOrTestMode, testSubmitted]);

  // Dynamic Chapters & Experiments lists for 1000-question filters
  const availableChapters = useMemo(() => {
    const set = new Set<string>();
    for (const q of VIRTUAL_LAB_1000_QUESTIONS) {
      if (
        (qSubjectFilter === 'All' || q.subject === qSubjectFilter) &&
        (qClassFilter === 'All' || q.class === qClassFilter)
      ) {
        set.add(q.chapter);
      }
    }
    return Array.from(set);
  }, [qSubjectFilter, qClassFilter]);

  const availableExperimentsForFilter = useMemo(() => {
    const set = new Set<string>();
    for (const q of VIRTUAL_LAB_1000_QUESTIONS) {
      if (
        (qSubjectFilter === 'All' || q.subject === qSubjectFilter) &&
        (qClassFilter === 'All' || q.class === qClassFilter)
      ) {
        set.add(q.experiment);
      }
    }
    return Array.from(set);
  }, [qSubjectFilter, qClassFilter]);

  const filteredQuestions = useMemo(() => {
    let base = VIRTUAL_LAB_1000_QUESTIONS.filter((q) => {
      if (qSubjectFilter !== 'All' && q.subject !== qSubjectFilter) return false;
      if (qClassFilter !== 'All' && q.class !== qClassFilter) return false;
      if (qChapterFilter !== 'All' && q.chapter !== qChapterFilter) return false;
      if (qExperimentFilter !== 'All' && q.experiment !== qExperimentFilter) return false;
      if (qDifficultyFilter !== 'All' && q.difficulty !== qDifficultyFilter) return false;
      if (qTypeFilter !== 'All' && q.type !== qTypeFilter) return false;
      if (onlyBookmarked && !bookmarks.includes(q.id)) return false;
      if (qSearch.trim()) {
        const term = qSearch.trim().toLowerCase();
        const hay = `${q.id} ${q.question} ${q.chapter} ${q.experiment} ${q.explanation}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });

    if (randomSeedIds) {
      const idMap = new Map(base.map((item) => [item.id, item]));
      base = randomSeedIds.map((id) => idMap.get(id)).filter(Boolean) as typeof base;
    }

    return base;
  }, [
    qSubjectFilter,
    qClassFilter,
    qChapterFilter,
    qExperimentFilter,
    qDifficultyFilter,
    qTypeFilter,
    onlyBookmarked,
    bookmarks,
    qSearch,
    randomSeedIds,
  ]);

  const handleTriggerRandomQuestions = (count: number) => {
    const pool = [...VIRTUAL_LAB_1000_QUESTIONS].filter((q) => {
      if (qSubjectFilter !== 'All' && q.subject !== qSubjectFilter) return false;
      if (qClassFilter !== 'All' && q.class !== qClassFilter) return false;
      return true;
    });
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setRandomSeedIds(pool.slice(0, count).map((q) => q.id));
    setCurrentPage(1);
    setFocusedQuestionIndex(0);
  };

  const questionsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / questionsPerPage));
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * questionsPerPage;
    return filteredQuestions.slice(start, start + questionsPerPage);
  }, [filteredQuestions, currentPage]);

  // Global stats across 1000 questions
  const bankSummary = useMemo(() => getQuestionBankValidationSummary(), []);
  const totalSolvedOverall = useMemo(() => {
    return Object.values(questionAttempts).filter((a) => a.isSolved).length;
  }, [questionAttempts]);

  const overallAccuracy = useMemo(() => {
    if (attemptHistory.length === 0) return 100;
    const correctCount = attemptHistory.filter((h) => h.isCorrect).length;
    return Math.round((correctCount / attemptHistory.length) * 100);
  }, [attemptHistory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 text-left">
      {/* =====================================================================
          HERO & “प्रयोग करो” DASHBOARD HEADER
      ===================================================================== */}
      <section className="rounded-2xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="text-xs font-semibold text-cyan-400 tracking-wide">
              RK STUDY CENTRE · CLASS 9 TO 12 INTERACTIVE PRACTICAL MODULE
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              🔬 VIRTUAL LAB — “प्रयोग करो” MODULE
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              केवल प्रश्न न पढ़ें, बल्कि स्वयं उपकरण जोड़ें → स्विच ON करें → प्रेक्षण (Observation) लें → सूत्र से गणना
              (Calculation) करें → परिणाम प्राप्त करें और 1000 प्रायोगिक प्रश्न हल करें।
            </p>
          </div>

          {/* Live Score, Accuracy & Progress Metrics */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0 bg-slate-950/90 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="text-xs text-slate-400">🏆 प्रयोग स्कोर</div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-amber-400">
                {experimentMarks.total}/25
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Active Lab Marks</div>
            </div>
            <div className="border-l border-slate-800 pl-3 sm:pl-4">
              <div className="text-xs text-slate-400">⭐ सटीकता (Accuracy)</div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-400">
                {overallAccuracy}%
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{attemptHistory.length} Attempts</div>
            </div>
            <div className="border-l border-slate-800 pl-3 sm:pl-4">
              <div className="text-xs text-slate-400">📈 हल किए प्रश्न</div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-cyan-400">
                {totalSolvedOverall}/{bankSummary.totalQuestions}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">1000 Q Bank</div>
            </div>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setViewMode('workbench')}
              className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'workbench'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>▶️ प्रयोग करो (Interactive Lab Workbench)</span>
            </button>

            <button
              onClick={() => setViewMode('question_bank')}
              className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'question_bank'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>❓ 1000 Practical Questions Bank (Practice &amp; Test)</span>
            </button>

            <button
              onClick={() => setViewMode('history')}
              className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'history'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <History className="w-4 h-4" />
              <span>📊 Progress &amp; Attempt History ({attemptHistory.length})</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono tabular-nums">
            ⚡ Physics: 300 · 🧪 Chemistry: 300 · 🧬 Biology: 300 · 🔬 Practical Skills: 100
          </div>
        </div>
      </section>

      {/* =====================================================================
          MODE 1: “प्रयोग करो” INTERACTIVE WORKBENCH
      ===================================================================== */}
      {viewMode === 'workbench' && (
        <div className="space-y-8">
          {/* STEP-BY-STEP “प्रयोग करो” DASHBOARD SELECTOR (Subject -> Class -> Experiment) */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  1. विषय, कक्षा और प्रयोग चुनें (“प्रयोग करो” Dashboard)
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  [ Physics ] [ Chemistry ] [ Biology ] → 📚 Class 9–12 → 🧪 Start Experiment
                </p>
              </div>

              {/* Subject Segmented Filter */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
                {(
                  [
                    { id: 'Physics', label: '⚡ Physics (300)', icon: Zap },
                    { id: 'Chemistry', label: '🧪 Chemistry (300)', icon: TestTube },
                    { id: 'Biology', label: '🧬 Biology (300)', icon: Microscope },
                    { id: 'General Science', label: '🔬 Practical (100)', icon: Wrench },
                    { id: 'All', label: 'सभी विषय (All)', icon: Atom },
                  ] as const
                ).map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubject(sub.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      selectedSubject === sub.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Class Filter Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 mr-1">कक्षा चुनें:</span>
              {(['All', '9', '10', '11', '12'] as const).map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedClass === cls
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cls === 'All' ? '📚 सभी कक्षाएं (Class 9–12)' : `📚 Class ${cls}`}
                </button>
              ))}
            </div>

            {/* Experiment Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredExperiments.map((exp) => {
                const isSelected = exp.id === activeExperiment.id;
                return (
                  <div
                    key={exp.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="text-xs text-slate-500 font-medium">
                        {exp.subject} · Class {exp.class} · {exp.chapter}
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{exp.hindiName}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2">{exp.objective}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-xs font-mono text-slate-600">
                        सूत्र: {exp.formula.split('   ')[0]}
                      </span>
                      <button
                        onClick={() => {
                          setActiveExperimentId(exp.id);
                          setExpStates((prev) => ({
                            ...prev,
                            [exp.id]: {
                              ...prev[exp.id],
                              started: true,
                            },
                          }));
                          setCalcFeedback({ status: 'idle', message: '' });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-blue-700 text-white'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        {isSelected ? '● Active Experiment' : 'Start Experiment'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ===================================================================
              8-STEP EXPERIMENT COMPLETION PIPELINE & 25-MARK RUBRIC BAR
          =================================================================== */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  प्रयोग प्रगति एवं मूल्यांकन (Experiment Completion &amp; 25-Mark Scoring System)
                </h2>
                <p className="text-xs text-slate-600">
                  Setup: {experimentMarks.setupMarks}/5 · Observation: {experimentMarks.obsMarks}/5 ·
                  Calculation: {experimentMarks.calcMarks}/5 · Questions: {experimentMarks.qMarks}/10 ={' '}
                  <strong className="text-slate-900 font-mono">
                    Total {experimentMarks.total}/25 Marks
                  </strong>
                </p>
              </div>
              <button
                onClick={handleResetExperiment}
                className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer self-start whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Experiment</span>
              </button>
            </div>

            {/* 8-Step Pipeline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {experimentMarks.steps.map((st) => (
                <div
                  key={st.id}
                  className={`p-2.5 rounded-xl border text-left transition-colors ${
                    st.done
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span>0{st.id}</span>
                    <span>{st.done ? '✓' : '○'}</span>
                  </div>
                  <div className="text-xs font-bold mt-1 leading-snug">{st.hindi}</div>
                  <div className="text-[11px] opacity-80 leading-tight mt-0.5">{st.label}</div>
                </div>
              ))}
            </div>

            {/* Completion Celebration Banner */}
            {experimentMarks.isFullyCompleted && (
              <div className="p-4 rounded-xl bg-emerald-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-base font-bold">🎉 प्रयोग सफलतापूर्वक पूरा हुआ! (Experiment Completed)</div>
                  <div className="text-xs text-emerald-200">
                    आपने उपकरण संयोजन, प्रेक्षण तालिका, सूत्र गणना, परिणाम और प्रश्नों के सभी चरण पूरे कर लिए हैं।
                  </div>
                </div>
                <div className="text-lg font-mono font-bold tabular-nums bg-emerald-950 px-4 py-2 rounded-lg border border-emerald-700 whitespace-nowrap">
                  Score: {experimentMarks.total} / 25 Marks
                </div>
              </div>
            )}
          </section>

          {/* ===================================================================
              SECTIONS 1, 2, 3: प्रयोग का नाम, 🎯 उद्देश्य, 🧰 उपकरण, 📖 सिद्धांत
          =================================================================== */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-blue-700">
                  {activeExperiment.subject} · Class {activeExperiment.class} · अध्याय:{' '}
                  {activeExperiment.chapter}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  प्रयोग का नाम: {activeExperiment.hindiName}
                </h2>
              </div>
              <div className="text-xs font-mono bg-slate-100 text-slate-800 px-3.5 py-2 rounded-lg border border-slate-200">
                सूत्र: <strong>{activeExperiment.formula}</strong>
              </div>
            </div>

            {/* 🎯 उद्देश्य (Objective) */}
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-700" />
                <span>🎯 उद्देश्य (Objective)</span>
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed pl-6">
                {activeExperiment.objective}
              </p>
            </div>

            {/* 🧰 उपकरण (Equipment List with Inspect Tracking) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  🧰 आवश्यक उपकरण (Required Equipment &amp; Apparatus)
                </h3>
                <button
                  onClick={() =>
                    updateExpState({
                      equipmentViewed: activeExperiment.equipment.map((e) => e.id),
                    })
                  }
                  className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer self-start"
                >
                  ✓ सभी उपकरणों की जाँच करें (Mark All Equipment Inspected)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeExperiment.equipment.map((eq) => {
                  const isViewed = currentExpState.equipmentViewed.includes(eq.id);
                  return (
                    <button
                      key={eq.id}
                      onClick={() => {
                        if (!isViewed) {
                          updateExpState({
                            equipmentViewed: [...currentExpState.equipmentViewed, eq.id],
                          });
                        }
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                        isViewed
                          ? 'bg-slate-50 border-slate-300'
                          : 'bg-white border-slate-200 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900">{eq.hindiName}</span>
                        <span className="text-xs font-mono text-emerald-700">
                          {isViewed ? '✓ Inspected' : 'Inspect'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{eq.name}</div>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{eq.purpose}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 📖 सिद्धांत (Theory & Formula) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                📖 सिद्धांत एवं सूत्र (Scientific Theory &amp; Formula)
              </h3>
              <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5 leading-relaxed">
                {activeExperiment.theory.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs text-slate-500 font-semibold">मुख्य वैज्ञानिक सूत्र (Formula):</div>
                  <div className="text-base font-mono font-bold text-slate-900 mt-0.5">
                    {activeExperiment.formula}
                  </div>
                </div>
                <div className="text-xs text-slate-600">{activeExperiment.formulaExplanation}</div>
              </div>
            </div>
          </section>

          {/* ===================================================================
              SECTION 4: ▶️ प्रयोग करो — INTERACTIVE VIRTUAL LAB SANDBOX
              (Two-Zone Split Layout per Education Simulation Design Guidelines)
          =================================================================== */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT ZONE (7 cols): Interactive Visual Stage & Wire/Apparatus Connection */}
            <div className="lg:col-span-7 bg-slate-950 text-white rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-6">
              {/* Top Stage Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="text-xs text-cyan-400 font-semibold">
                    ▶️ प्रयोग करो — INTERACTIVE WORKBENCH
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {activeExperiment.hindiName}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-md text-xs font-mono font-semibold ${
                      isRunning
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {isRunning ? '● SWITCH ON (ACTIVE)' : '○ SWITCH OFF / STANDBY'}
                  </span>
                </div>
              </div>

              {/* Step-by-Step Wire / Apparatus Connection Chain */}
              <div className="space-y-2.5 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-300">
                    🔌 उपकरण एवं तार संयोजन क्रम (Connect Circuit / Apparatus Step-by-Step):
                  </span>
                  <div className="flex items-center gap-2">
                    {currentExpState.connectedSteps < activeExperiment.connectionSteps.length ? (
                      <>
                        <button
                          onClick={() =>
                            updateExpState({
                              started: true,
                              connectedSteps: currentExpState.connectedSteps + 1,
                            })
                          }
                          className="px-3 py-1 rounded-md bg-cyan-500 text-slate-950 text-xs font-bold cursor-pointer whitespace-nowrap"
                        >
                          + अगला उपकरण जोड़ें (Connect Step {currentExpState.connectedSteps + 1})
                        </button>
                        <button
                          onClick={() =>
                            updateExpState({
                              started: true,
                              connectedSteps: activeExperiment.connectionSteps.length,
                              switchOn: true,
                            })
                          }
                          className="px-3 py-1 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold cursor-pointer whitespace-nowrap"
                        >
                          Connect All
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-emerald-400 font-semibold">
                        ✓ परिपथ / उपकरण पूर्णतः संयोजित (All Connected)
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
                  {activeExperiment.connectionSteps.map((stepLabel, idx) => {
                    const isConnected = idx < currentExpState.connectedSteps;
                    return (
                      <button
                        key={idx}
                        onClick={() =>
                          updateExpState({
                            started: true,
                            connectedSteps: Math.max(currentExpState.connectedSteps, idx + 1),
                          })
                        }
                        className={`p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                          isConnected
                            ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-mono font-bold text-[11px]">
                          {isConnected ? `✓ STEP ${idx + 1}` : `○ STEP ${idx + 1}`}
                        </div>
                        <div className="mt-0.5 leading-snug">{stepLabel}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Realistic Laboratory Interactive SVG Apparatus & Real Scientific Diagram */}
              <div className="bg-slate-900/90 rounded-2xl p-2 sm:p-4 border border-slate-800 flex flex-col items-center justify-center min-h-[320px]">
                <LabApparatusDiagram
                  experiment={activeExperiment}
                  isRunning={isRunning}
                  isCircuitComplete={isCircuitComplete}
                  connectedSteps={currentExpState.connectedSteps}
                  currentControls={currentControls}
                  liveMetrics={liveSimulationMetrics}
                  onToggleSwitch={() =>
                    updateExpState({
                      started: true,
                      connectedSteps: Math.max(
                        currentExpState.connectedSteps,
                        activeExperiment.connectionSteps.length
                      ),
                      switchOn: !currentExpState.switchOn,
                    })
                  }
                />
              </div>

              {/* Live Digital Meter Readout Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">{liveSimulationMetrics.primaryLabel}</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-cyan-400 mt-1">
                    {liveSimulationMetrics.primaryValue}
                  </div>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">{liveSimulationMetrics.secondaryLabel}</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-amber-400 mt-1">
                    {liveSimulationMetrics.secondaryValue}
                  </div>
                </div>
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">{liveSimulationMetrics.tertiaryLabel}</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
                    {liveSimulationMetrics.tertiaryValue}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT ZONE (5 cols): Switch ON/OFF, Variable Sliders/Knobs & Observation Recorder */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-700" />
                      <span>प्रयोग नियंत्रक (Lab Controls &amp; Sliders)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Variables बदलें और मीटर रीडिंग को प्रेक्षण तालिका में रिकॉर्ड करें
                    </p>
                  </div>

                  {/* Switch ON/OFF Button */}
                  <button
                    onClick={() => {
                      updateExpState({
                        started: true,
                        connectedSteps: activeExperiment.connectionSteps.length,
                        switchOn: !currentExpState.switchOn,
                      });
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                      currentExpState.switchOn
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-rose-600 text-white hover:bg-rose-700'
                    }`}
                  >
                    {currentExpState.switchOn ? '⚡ Switch ON (चालू है)' : '○ Switch OFF (चालू करें)'}
                  </button>
                </div>

                {/* Quick 1V to 5V Preset Buttons for Ohm's Law */}
                {activeExperiment.simulatorType === 'ohms_law' && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-slate-600">
                      Quick Voltage Presets (R = 10 Ω पर मानक पाठ्यांक):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[1, 2, 3, 4, 5].map((vPreset) => (
                        <button
                          key={vPreset}
                          onClick={() => {
                            handleControlChange('voltage', vPreset);
                            handleControlChange('resistance', 10);
                            updateExpState({
                              started: true,
                              connectedSteps: activeExperiment.connectionSteps.length,
                              switchOn: true,
                            });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border cursor-pointer ${
                            (currentControls.voltage ?? 1) === vPreset &&
                            (currentControls.resistance ?? 10) === 10
                              ? 'bg-blue-700 text-white border-blue-700'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {vPreset} V → {(vPreset / 10).toFixed(2)} A
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Sliders / Knobs */}
                <div className="space-y-4">
                  {activeExperiment.controls.map((ctrl) => {
                    const val = currentControls[ctrl.id] ?? ctrl.defaultValue;
                    return (
                      <div
                        key={ctrl.id}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <span>{ctrl.label}</span>
                          <span className="font-mono tabular-nums text-sm text-blue-700">
                            {ctrl.symbol} = {val} {ctrl.unit}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={ctrl.min}
                          max={ctrl.max}
                          step={ctrl.step}
                          value={val}
                          onChange={(e) => handleControlChange(ctrl.id, Number(e.target.value))}
                          className="w-full accent-blue-700 cursor-pointer"
                        />
                        <div className="flex justify-between text-[11px] font-mono text-slate-500">
                          <span>
                            Min: {ctrl.min} {ctrl.unit}
                          </span>
                          <span>
                            Step: {ctrl.step} {ctrl.unit}
                          </span>
                          <span>
                            Max: {ctrl.max} {ctrl.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons: Record Observation & Reset */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                <button
                  onClick={handleRecordObservation}
                  className="w-full py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>📊 वर्तमान मीटर रीडिंग को प्रेक्षण तालिका में जोड़ें (Record Reading)</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleLoadStandardObservations}
                    className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
                  >
                    मानक रीडिंग लोड करें (Load Standard Set)
                  </button>
                  <button
                    onClick={handleResetExperiment}
                    className="py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Reset Experiment
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ===================================================================
              SECTION 5 & 6: 📊 OBSERVATION TABLE & 🧮 CALCULATION + ✅ RESULT
          =================================================================== */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 📊 Observation Table (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-blue-700" />
                    <span>📊 प्रेक्षण तालिका (Student Observation Table)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    वर्चुअल लैब से प्राप्त रीडिंग्स ({currentExpState.observations.length} Readings Recorded · 5 Marks)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLoadStandardObservations}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold hover:bg-blue-100 cursor-pointer"
                  >
                    + Load Standard Table
                  </button>
                  {currentExpState.observations.length > 0 && (
                    <button
                      onClick={() => updateExpState({ observations: [] })}
                      className="px-2.5 py-1.5 rounded-lg text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {currentExpState.observations.length === 0 ? (
                <div className="p-8 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                  <p className="text-sm font-semibold text-slate-700">
                    अभी तक कोई प्रेक्षण (Reading) दर्ज नहीं किया गया है।
                  </p>
                  <p className="text-xs text-slate-500">
                    ऊपर स्लाइडर बदलकर &ldquo;वर्तमान मीटर रीडिंग को प्रेक्षण तालिका में जोड़ें&rdquo; या &ldquo;Load Standard Table&rdquo; पर क्लिक करें।
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                        <th className="py-2.5 px-3 font-bold">क्र.सं. (S.No.)</th>
                        {activeExperiment.observationColumns.map((col) => (
                          <th key={col.key} className="py-2.5 px-3 font-bold">
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
                      {currentExpState.observations.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-500">#{idx + 1}</td>
                          {activeExperiment.observationColumns.map((col) => (
                            <td key={col.key} className="py-2.5 px-3 font-semibold text-slate-900">
                              {row[col.key]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 🧮 Calculation & ✅ Automatic Result Generator (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-blue-700" />
                    <span>🧮 सूत्र गणना (Formula Calculation — 5 Marks)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    प्रयोग के सूत्र का उपयोग करके नीचे दिए गए प्रश्न की गणना करें
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-mono text-blue-800 font-semibold">
                    प्रयुक्त सूत्र: {activeExperiment.calculationChallenge.formulaUsed} (
                    {activeExperiment.calculationChallenge.givenValues})
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-snug">
                    {activeExperiment.calculationChallenge.question}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={currentExpState.calculationInput}
                    onChange={(e) => updateExpState({ calculationInput: e.target.value })}
                    placeholder={`उत्तर लिखें (जैसे ${activeExperiment.calculationChallenge.expectedNumericAnswer} ${activeExperiment.calculationChallenge.unit})`}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-blue-600"
                  />
                  <button
                    onClick={handleVerifyCalculation}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                  >
                    जाँचें (Verify)
                  </button>
                </div>

                {calcFeedback.status !== 'idle' && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                      calcFeedback.status === 'correct'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                        : calcFeedback.status === 'try_again'
                        ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                        : 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                    }`}
                  >
                    {calcFeedback.message}
                  </div>
                )}
              </div>

              {/* ✅ Result Section */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>✅ परिणाम (System Generated Result)</span>
                  </h3>
                  {!currentExpState.resultGenerated && (
                    <button
                      onClick={() => updateExpState({ resultGenerated: true })}
                      className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                    >
                      Generate Result
                    </button>
                  )}
                </div>

                {currentExpState.resultGenerated || currentExpState.calculationVerified ? (
                  <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-300 space-y-1.5">
                    <div className="text-xs font-bold text-emerald-900">
                      ✓ सत्यापित प्रायोगिक निष्कर्ष (Verified Conclusion):
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                      {activeExperiment.resultStatement}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    प्रेक्षण लेने और ऊपर सूत्र गणना सत्यापित करने के बाद सिस्टम स्वचालित रूप से परिणाम (Result) प्रदर्शित करेगा।
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ===================================================================
              SECTION 7: ❓ QUESTIONS (Post-Experiment Questions with Try Again & Hint)
          =================================================================== */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  ❓ प्रयोग आधारित प्रश्न (Experiment Viva &amp; Practical Questions — 10 Marks)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  नियम: पहली गलती पर &ldquo;Try Again&rdquo; मिलेगा; दूसरी गलती के बाद &ldquo;Hint (संकेत)&rdquo; खुलेगा। (हल किए गए:{' '}
                  <strong>{solvedInActiveExpCount}/10</strong>)
                </p>
              </div>
              <button
                onClick={() => {
                  setQSubjectFilter(activeExperiment.subject);
                  setQClassFilter(activeExperiment.class);
                  setViewMode('question_bank');
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer self-start whitespace-nowrap"
              >
                सभी 1000 प्रश्न खोलें (Open Full 1000 Q Bank) →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeExperimentQuestions.map((q, idx) => {
                const attempt = questionAttempts[q.id];
                const isBookmarked = bookmarks.includes(q.id);
                const showExplanation =
                  attempt?.status === 'correct' || revealedExplanations[q.id];

                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      {/* Unboxed Metadata Line per Design Constitution */}
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                        <div className="flex flex-wrap items-center gap-1.5 font-mono">
                          <span className="font-bold text-slate-800">{q.id}</span>
                          <span aria-hidden="true">·</span>
                          <span>{q.type}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {q.difficulty === 'Easy'
                              ? '🟢 Easy'
                              : q.difficulty === 'Medium'
                              ? '🟡 Medium'
                              : '🔴 Hard'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{q.marks} Mark</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleBookmark(q.id)}
                            title="Bookmark Question"
                            className={`cursor-pointer ${
                              isBookmarked ? 'text-amber-500' : 'text-slate-400 hover:text-slate-700'
                            }`}
                          >
                            <Bookmark className="w-4 h-4" />
                          </button>
                          {attempt && (
                            <button
                              onClick={() => handleRetryQuestion(q.id)}
                              title="Retry Question"
                              className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                            >
                              Retry
                            </button>
                          )}
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-relaxed">
                        Q{idx + 1}. {q.question}
                      </h4>

                      {/* Options */}
                      <div className="space-y-2 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = attempt?.selectedOption === opt;
                          const isCorrectSelection =
                            attempt?.status === 'correct' && opt === q.answer;
                          const isWrongSelection =
                            isSelected && attempt?.status !== 'correct';

                          return (
                            <button
                              key={optIdx}
                              onClick={() =>
                                handleSelectQuestionOption(
                                  q.id,
                                  opt,
                                  q.answer,
                                  q.experiment,
                                  q.subject,
                                  q.class
                                )
                              }
                              className={`w-full p-2.5 rounded-lg border text-left text-xs sm:text-sm transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                isCorrectSelection
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                                  : isWrongSelection
                                  ? 'bg-amber-50 border-amber-400 text-amber-950 font-semibold'
                                  : 'bg-slate-50/70 border-slate-200 text-slate-800 hover:bg-slate-100'
                              }`}
                            >
                              <span>
                                <strong className="font-mono mr-2">
                                  {String.fromCharCode(65 + optIdx)}.
                                </strong>
                                {opt}
                              </span>
                              {isCorrectSelection && (
                                <span className="text-xs font-bold text-emerald-700 shrink-0">
                                  ✓ सही (Correct)
                                </span>
                              )}
                              {isWrongSelection && (
                                <span className="text-xs font-bold text-amber-800 shrink-0">
                                  ↻ Try Again
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Feedback States: 1st Wrong -> Try Again | 2nd Wrong -> Hint | Correct -> Explanation */}
                    {attempt?.status === 'try_again' && (
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center justify-between gap-2">
                        <span>
                          <strong>Try Again (पुनः प्रयास करें):</strong> यह विकल्प सही नहीं है। एक बार फिर सोचकर प्रयास करें!
                        </span>
                      </div>
                    )}

                    {attempt?.status === 'hint_unlocked' && (
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 space-y-1.5 text-xs text-blue-950">
                        <div className="font-bold flex items-center justify-between">
                          <span>💡 Hint (संकेत — 2nd Attempt):</span>
                          {!revealedExplanations[q.id] && (
                            <button
                              onClick={() =>
                                setRevealedExplanations((prev) => ({ ...prev, [q.id]: true }))
                              }
                              className="underline text-blue-700 cursor-pointer"
                            >
                              व्याख्या देखें (Show Explanation)
                            </button>
                          )}
                        </div>
                        <p>{q.hint}</p>
                      </div>
                    )}

                    {showExplanation && (
                      <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                        <div className="font-bold">
                          ✓ सही उत्तर: {q.answer}
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          <strong>व्याख्या:</strong> {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          MODE 2: 1000 PRACTICAL QUESTIONS BANK (SEARCH, FILTERS, PRACTICE & TEST MODE)
      ===================================================================== */}
      {viewMode === 'question_bank' && (
        <div className="space-y-6">
          {/* Filter & Control Deck */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  📚 1000 Practical &amp; Experiment Questions Explorer
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Physics: 300 (75×4) · Chemistry: 300 (75×4) · Biology: 300 (75×4) · General Science: 100 ·
                  Showing <strong className="font-mono text-slate-900">{filteredQuestions.length}</strong> Questions
                </p>
              </div>

              {/* Practice Mode vs Timed Test Mode + Random Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => {
                      setPracticeOrTestMode('practice');
                      setTestSubmitted(false);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      practiceOrTestMode === 'practice'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    🎯 Practice Mode
                  </button>
                  <button
                    onClick={() => {
                      setPracticeOrTestMode('test');
                      setTestTimeLeftSec(600);
                      setTestSubmitted(false);
                      setTestAnswers({});
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      practiceOrTestMode === 'test'
                        ? 'bg-blue-700 text-white'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    ⏱️ Timed Test Mode
                  </button>
                </div>

                <button
                  onClick={() => handleTriggerRandomQuestions(10)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Random 10</span>
                </button>

                {randomSeedIds && (
                  <button
                    onClick={() => setRandomSeedIds(null)}
                    className="px-3 py-2 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
                  >
                    Show All ({VIRTUAL_LAB_1000_QUESTIONS.length})
                  </button>
                )}

                <button
                  onClick={() => {
                    setOnlyBookmarked(!onlyBookmarked);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                    onlyBookmarked
                      ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Bookmarks ({bookmarks.length})</span>
                </button>
              </div>
            </div>

            {/* Search & Multi-Dimensional Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Search Box */}
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={qSearch}
                  onChange={(e) => {
                    setQSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="प्रश्न, ID (जैसे PHY-001), प्रयोग या सूत्र खोजें..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Subject Filter */}
              <select
                value={qSubjectFilter}
                onChange={(e) => {
                  setQSubjectFilter(e.target.value as LabSubject | 'All');
                  setQChapterFilter('All');
                  setQExperimentFilter('All');
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
              >
                <option value="All">सभी विषय (1000 Q)</option>
                <option value="Physics">⚡ Physics (300 Q)</option>
                <option value="Chemistry">🧪 Chemistry (300 Q)</option>
                <option value="Biology">🧬 Biology (300 Q)</option>
                <option value="General Science">🔬 General Science (100 Q)</option>
              </select>

              {/* Class Filter */}
              <select
                value={qClassFilter}
                onChange={(e) => {
                  setQClassFilter(e.target.value as LabClassLevel | 'All');
                  setQChapterFilter('All');
                  setQExperimentFilter('All');
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
              >
                <option value="All">सभी कक्षाएं (Class 9–12)</option>
                <option value="9">📚 Class 9 (250 Q)</option>
                <option value="10">📚 Class 10 (250 Q)</option>
                <option value="11">📚 Class 11 (250 Q)</option>
                <option value="12">📚 Class 12 (250 Q)</option>
              </select>

              {/* Difficulty Filter */}
              <select
                value={qDifficultyFilter}
                onChange={(e) => {
                  setQDifficultyFilter(e.target.value as DifficultyLevel | 'All');
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
              >
                <option value="All">कठिनाई स्तर (All Difficulty)</option>
                <option value="Easy">🟢 Easy</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Hard">🔴 Hard</option>
              </select>

              {/* Question Type Filter */}
              <select
                value={qTypeFilter}
                onChange={(e) => {
                  setQTypeFilter(e.target.value as QuestionType | 'All');
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
              >
                <option value="All">सभी 8 प्रश्न प्रकार (All Types)</option>
                <option value="MCQ">Type A — MCQ</option>
                <option value="True/False">Type B — True/False</option>
                <option value="Fill in the Blank">Type C — Fill in the Blank</option>
                <option value="Numerical">Type D — Numerical</option>
                <option value="Observation Based">Type E — Observation Based</option>
                <option value="Conceptual">Type F — Conceptual</option>
                <option value="Practical Situation">Type G — Practical Situation</option>
                <option value="Experiment Prediction">Type H — Experiment Prediction</option>
              </select>
            </div>

            {/* Secondary Row: Chapter & Experiment Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <select
                value={qChapterFilter}
                onChange={(e) => {
                  setQChapterFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50"
              >
                <option value="All">अध्याय चुनें (All Chapters — {availableChapters.length})</option>
                {availableChapters.map((ch) => (
                  <option key={ch} value={ch}>
                    अध्याय: {ch}
                  </option>
                ))}
              </select>

              <select
                value={qExperimentFilter}
                onChange={(e) => {
                  setQExperimentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50"
              >
                <option value="All">
                  प्रयोग चुनें (All Experiments — {availableExperimentsForFilter.length})
                </option>
                {availableExperimentsForFilter.map((expName) => (
                  <option key={expName} value={expName}>
                    प्रयोग: {expName}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* TIMED TEST MODE BANNER */}
          {practiceOrTestMode === 'test' && (
            <section className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs text-cyan-400 font-semibold">
                  ⏱️ TIMED PRACTICAL ASSESSMENT (वर्चुअल लैब मूल्यांकन मोड)
                </div>
                <div className="text-base font-bold">
                  इस पृष्ठ के {paginatedQuestions.length} प्रश्नों को चुनें और अंत में &ldquo;टेस्ट सबमिट करें&rdquo; दबाएँ।
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-mono text-lg font-bold tabular-nums text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>
                    {Math.floor(testTimeLeftSec / 60)}:{String(testTimeLeftSec % 60).padStart(2, '0')}
                  </span>
                </div>
                {!testSubmitted ? (
                  <button
                    onClick={() => setTestSubmitted(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold cursor-pointer"
                  >
                    टेस्ट सबमिट करें (Submit Test)
                  </button>
                ) : (
                  <div className="text-sm font-mono font-bold text-emerald-400">
                    Test Score:{' '}
                    {
                      paginatedQuestions.filter((q) => testAnswers[q.id] === q.answer)
                        .length
                    }{' '}
                    / {paginatedQuestions.length}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* SINGLE QUESTION FOCUS NAVIGATOR (Previous / Next Question) */}
          {focusedQuestionIndex !== null && filteredQuestions[focusedQuestionIndex] && (
            <section className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs font-mono">
                Focused Question #{focusedQuestionIndex + 1} of {filteredQuestions.length} (
                {filteredQuestions[focusedQuestionIndex].id})
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={focusedQuestionIndex <= 0}
                  onClick={() => {
                    const prevIdx = Math.max(0, focusedQuestionIndex - 1);
                    setFocusedQuestionIndex(prevIdx);
                    setCurrentPage(Math.floor(prevIdx / questionsPerPage) + 1);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold cursor-pointer"
                >
                  ← Previous Question
                </button>
                <button
                  disabled={focusedQuestionIndex >= filteredQuestions.length - 1}
                  onClick={() => {
                    const nextIdx = Math.min(filteredQuestions.length - 1, focusedQuestionIndex + 1);
                    setFocusedQuestionIndex(nextIdx);
                    setCurrentPage(Math.floor(nextIdx / questionsPerPage) + 1);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold disabled:opacity-40 text-xs cursor-pointer"
                >
                  Next Question →
                </button>
                <button
                  onClick={() => setFocusedQuestionIndex(null)}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Close Focus
                </button>
              </div>
            </section>
          )}

          {/* QUESTIONS LIST */}
          <div className="space-y-4">
            {paginatedQuestions.map((q, idx) => {
              const globalIdx = (currentPage - 1) * questionsPerPage + idx;
              const attempt = questionAttempts[q.id];
              const isBookmarked = bookmarks.includes(q.id);
              const showExplanation =
                practiceOrTestMode === 'test'
                  ? testSubmitted
                  : attempt?.status === 'correct' || revealedExplanations[q.id];

              return (
                <article
                  key={q.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-1.5 font-mono">
                      <span className="font-bold text-slate-900">#{globalIdx + 1}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-bold text-blue-700">{q.id}</span>
                      <span aria-hidden="true">·</span>
                      <span>{q.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span>Class {q.class}</span>
                      <span aria-hidden="true">·</span>
                      <span>{q.chapter}</span>
                      <span aria-hidden="true">·</span>
                      <span>प्रयोग: {q.experiment}</span>
                      <span aria-hidden="true">·</span>
                      <span>{q.type}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {q.difficulty === 'Easy'
                          ? '🟢 Easy'
                          : q.difficulty === 'Medium'
                          ? '🟡 Medium'
                          : '🔴 Hard'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setFocusedQuestionIndex(globalIdx)}
                        className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                      >
                        Focus
                      </button>
                      <button
                        onClick={() => toggleBookmark(q.id)}
                        className={`flex items-center gap-1 cursor-pointer ${
                          isBookmarked ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
                      </button>
                      {attempt && practiceOrTestMode === 'practice' && (
                        <button
                          onClick={() => handleRetryQuestion(q.id)}
                          className="text-xs text-blue-700 hover:underline cursor-pointer"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                    {q.question}
                  </h3>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      if (practiceOrTestMode === 'test') {
                        const chosen = testAnswers[q.id] === opt;
                        const isRight = testSubmitted && opt === q.answer;
                        const isWrong = testSubmitted && chosen && opt !== q.answer;
                        return (
                          <button
                            key={optIdx}
                            disabled={testSubmitted}
                            onClick={() =>
                              setTestAnswers((prev) => ({ ...prev, [q.id]: opt }))
                            }
                            className={`p-3 rounded-xl border text-left text-xs sm:text-sm transition-colors cursor-pointer ${
                              isRight
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                                : isWrong
                                ? 'bg-rose-50 border-rose-400 text-rose-950 font-semibold'
                                : chosen
                                ? 'bg-blue-50 border-blue-600 text-blue-950 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            <strong className="font-mono mr-2">
                              {String.fromCharCode(65 + optIdx)}.
                            </strong>
                            {opt}
                          </button>
                        );
                      }

                      const isSelected = attempt?.selectedOption === opt;
                      const isCorrectSelection =
                        attempt?.status === 'correct' && opt === q.answer;
                      const isWrongSelection =
                        isSelected && attempt?.status !== 'correct';

                      return (
                        <button
                          key={optIdx}
                          onClick={() =>
                            handleSelectQuestionOption(
                              q.id,
                              opt,
                              q.answer,
                              q.experiment,
                              q.subject,
                              q.class
                            )
                          }
                          className={`p-3 rounded-xl border text-left text-xs sm:text-sm transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                            isCorrectSelection
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                              : isWrongSelection
                              ? 'bg-amber-50 border-amber-400 text-amber-950 font-semibold'
                              : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <span>
                            <strong className="font-mono mr-2">
                              {String.fromCharCode(65 + optIdx)}.
                            </strong>
                            {opt}
                          </span>
                          {isCorrectSelection && (
                            <span className="text-xs font-bold text-emerald-700 shrink-0">
                              ✓ सही
                            </span>
                          )}
                          {isWrongSelection && (
                            <span className="text-xs font-bold text-amber-800 shrink-0">
                              ↻ Try Again
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Practice Mode Feedback: 1st Wrong -> Try Again, 2nd Wrong -> Hint */}
                  {practiceOrTestMode === 'practice' && attempt?.status === 'try_again' && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950">
                      <strong>Try Again (पुनः प्रयास करें):</strong> गलत उत्तर पर तुरंत सही उत्तर नहीं दिखाया जाता। कृपया सूत्र व प्रेक्षण के आधार पर पुनः प्रयास करें!
                    </div>
                  )}

                  {practiceOrTestMode === 'practice' && attempt?.status === 'hint_unlocked' && (
                    <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span>💡 Hint (दूसरी गलती के बाद संकेत):</span>
                        {!revealedExplanations[q.id] && (
                          <button
                            onClick={() =>
                              setRevealedExplanations((prev) => ({ ...prev, [q.id]: true }))
                            }
                            className="underline text-blue-700 cursor-pointer"
                          >
                            उत्तर व व्याख्या देखें
                          </button>
                        )}
                      </div>
                      <p>{q.hint}</p>
                    </div>
                  )}

                  {showExplanation && (
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-800 space-y-1">
                      <div className="font-bold text-emerald-950">
                        ✓ सही उत्तर (Answer): {q.answer}
                      </div>
                      <p>
                        <strong>वैज्ञानिक व्याख्या (Explanation):</strong> {q.explanation}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {/* Pagination Controls (Previous / Next Page) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-600 font-mono tabular-nums">
              Page {currentPage} of {totalPages} · Total Filtered Questions: {filteredQuestions.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Questions</span>
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <span>Next Questions</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODE 3: PROGRESS, SCORE MATRIX & ATTEMPT HISTORY
      ===================================================================== */}
      {viewMode === 'history' && (
        <div className="space-y-6">
          {/* 1000-Question Subject & Class Distribution Matrix */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              📊 1000 Questions Subject &amp; Class Distribution Verification
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm font-mono tabular-nums">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                    <th className="py-2.5 px-3 font-bold">Subject</th>
                    <th className="py-2.5 px-3 font-bold">Class 9</th>
                    <th className="py-2.5 px-3 font-bold">Class 10</th>
                    <th className="py-2.5 px-3 font-bold">Class 11</th>
                    <th className="py-2.5 px-3 font-bold">Class 12</th>
                    <th className="py-2.5 px-3 font-bold">Total Questions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(['Physics', 'Chemistry', 'Biology', 'General Science'] as const).map((sub) => (
                    <tr key={sub}>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{sub}</td>
                      <td className="py-2.5 px-3">{bankSummary.bySubjectAndClass[`${sub}-9`] || 0}</td>
                      <td className="py-2.5 px-3">{bankSummary.bySubjectAndClass[`${sub}-10`] || 0}</td>
                      <td className="py-2.5 px-3">{bankSummary.bySubjectAndClass[`${sub}-11`] || 0}</td>
                      <td className="py-2.5 px-3">{bankSummary.bySubjectAndClass[`${sub}-12`] || 0}</td>
                      <td className="py-2.5 px-3 font-bold text-blue-700">
                        {bankSummary.bySubject[sub]}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <td className="py-2.5 px-3">कुल योग (Total)</td>
                    <td className="py-2.5 px-3">250</td>
                    <td className="py-2.5 px-3">250</td>
                    <td className="py-2.5 px-3">250</td>
                    <td className="py-2.5 px-3">250</td>
                    <td className="py-2.5 px-3 text-emerald-700">{bankSummary.totalQuestions}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Attempt History Log */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                🕒 विद्यार्थी प्रयास इतिहास (Student Attempt History — {attemptHistory.length})
              </h2>
              {attemptHistory.length > 0 && (
                <button
                  onClick={() => setAttemptHistory([])}
                  className="text-xs text-rose-700 hover:underline cursor-pointer"
                >
                  Clear History
                </button>
              )}
            </div>

            {attemptHistory.length === 0 ? (
              <p className="text-sm text-slate-500">
                अभी तक कोई प्रश्न प्रयास इतिहास नहीं है। प्रयोग या 1000-प्रश्न बैंक में प्रश्न हल करें।
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm font-mono tabular-nums">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                      <th className="py-2 px-3">Time</th>
                      <th className="py-2 px-3">Question ID</th>
                      <th className="py-2 px-3">Subject &amp; Class</th>
                      <th className="py-2 px-3">Experiment</th>
                      <th className="py-2 px-3">Selected Answer</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {attemptHistory.slice(0, 50).map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 px-3 text-slate-500">{item.timestamp}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{item.questionId}</td>
                        <td className="py-2 px-3">
                          {item.subject} · Class {item.classLevel}
                        </td>
                        <td className="py-2 px-3">{item.experiment}</td>
                        <td className="py-2 px-3">{item.selectedOption}</td>
                        <td className="py-2 px-3">
                          {item.isCorrect ? (
                            <span className="text-emerald-700 font-bold">✓ Correct</span>
                          ) : (
                            <span className="text-amber-700 font-semibold">↻ Try Again / Hint</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
