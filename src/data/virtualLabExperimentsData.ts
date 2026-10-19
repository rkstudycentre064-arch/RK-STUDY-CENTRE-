export type LabSubject = 'Physics' | 'Chemistry' | 'Biology' | 'General Science';
export type LabClassLevel = '9' | '10' | '11' | '12';

export type QuestionType =
  | 'MCQ'
  | 'True/False'
  | 'Fill in the Blank'
  | 'Numerical'
  | 'Observation Based'
  | 'Conceptual'
  | 'Practical Situation'
  | 'Experiment Prediction';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface VirtualLabQuestion {
  id: string;
  subject: LabSubject;
  class: LabClassLevel;
  chapter: string;
  experiment: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  hint: string;
  marks: number;
}

export interface LabControlConfig {
  id: string;
  label: string;
  symbol: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export interface LabEquipmentItem {
  id: string;
  name: string;
  hindiName: string;
  purpose: string;
}

export interface LabCalculationChallenge {
  question: string;
  formulaUsed: string;
  givenValues: string;
  expectedNumericAnswer: number;
  tolerance: number;
  unit: string;
  stepByStepSolution: string;
}

export interface LabExperimentConfig {
  id: string;
  name: string;
  hindiName: string;
  subject: LabSubject;
  class: LabClassLevel;
  chapter: string;
  simulatorType:
    | 'ohms_law'
    | 'archimedes'
    | 'pendulum'
    | 'wheatstone'
    | 'ph_scale'
    | 'matter_state'
    | 'titration'
    | 'kinetics'
    | 'osmosis'
    | 'stomata_photosynthesis'
    | 'transpiration'
    | 'mitosis_dna'
    | 'vernier_screw';
  objective: string;
  equipment: LabEquipmentItem[];
  theory: string[];
  formula: string;
  formulaExplanation: string;
  connectionSteps: string[];
  controls: LabControlConfig[];
  observationColumns: { key: string; label: string; unit: string }[];
  defaultReferenceRows: Record<string, string | number>[];
  calculationChallenge: LabCalculationChallenge;
  resultStatement: string;
  precautions: string[];
}

export const LAB_EXPERIMENTS: LabExperimentConfig[] = [
  // ============================================================================
  // 1. PHYSICS - CLASS 10: OHM'S LAW (FLAGSHIP EXPERIMENT)
  // ============================================================================
  {
    id: 'exp-phy-10-ohms-law',
    name: "Ohm's Law",
    hindiName: "Ohm's Law — ओम का नियम",
    subject: 'Physics',
    class: '10',
    chapter: 'Electricity',
    simulatorType: 'ohms_law',
    objective:
      'किसी प्रतिरोधक तार के सिरों के बीच विभवांतर (V) और उसमें प्रवाहित विद्युत धारा (I) के बीच संबंध का अध्ययन करना तथा प्रतिरोध (R = V/I) ज्ञात करना।',
    equipment: [
      {
        id: 'eq-battery',
        name: 'DC Battery Eliminator (0–10 V)',
        hindiName: 'डीसी बैटरी (Battery 0–10 V)',
        purpose: 'परिपथ में नियंत्रित विद्युत वाहक बल (Voltage) प्रदान करने के लिए।',
      },
      {
        id: 'eq-switch',
        name: 'Plug Key / Switch',
        hindiName: 'प्लग कुंजी / स्विच (Switch)',
        purpose: 'परिपथ को चालू (ON) या बंद (OFF) करने के लिए।',
      },
      {
        id: 'eq-resistor',
        name: 'Resistance Wire (Nichrome)',
        hindiName: 'प्रतिरोधक तार (Resistor)',
        purpose: 'ज्ञात या अज्ञात प्रतिरोध जिस पर V और I का परीक्षण किया जाता है।',
      },
      {
        id: 'eq-ammeter',
        name: 'DC Ammeter (0–2 A)',
        hindiName: 'एमीटर (Ammeter - श्रेणीक्रम)',
        purpose: 'परिपथ में प्रवाहित विद्युत धारा (I) को एम्पियर (A) में मापने के लिए।',
      },
      {
        id: 'eq-voltmeter',
        name: 'DC Voltmeter (0–10 V)',
        hindiName: 'वोल्टमीटर (Voltmeter - समांतर क्रम)',
        purpose: 'प्रतिरोधक के सिरों के बीच विभवांतर (V) को वोल्ट (V) में मापने के लिए।',
      },
      {
        id: 'eq-rheostat',
        name: 'Connecting Copper Wires & Rheostat',
        hindiName: 'संयोजक तार एवं धारा नियंत्रक',
        purpose: 'सभी उपकरणों को जोड़ने और वोल्टेज/धारा नियंत्रित करने के लिए।',
      },
    ],
    theory: [
      'ओम के नियम (Ohm’s Law) के अनुसार, यदि ताप एवं अन्य भौतिक अवस्थाएँ नियत रहें, तो किसी चालक के सिरों के बीच उत्पन्न विभवांतर (V) उसमें प्रवाहित होने वाली विद्युत धारा (I) के समानुपाती होता है।',
      'गणितीय रूप में: V ∝ I या V = I × R, जहाँ R चालक का प्रतिरोध (Resistance) है। प्रतिरोध का SI मात्रक ओम (Ω) है।',
      'जब V और I के बीच ग्राफ खींचा जाता है, तो मूल बिंदु से गुजरती हुई एक सरल रेखा (Straight Line) प्राप्त होती है, जो दर्शाती है कि अनुपात V/I सदैव नियत रहता है।',
    ],
    formula: 'V = I × R   अथवा   I = V / R   अथवा   R = V / I',
    formulaExplanation: 'V = विभवांतर (Volts में), I = विद्युत धारा (Amperes में), R = प्रतिरोध (Ohms Ω में)',
    connectionSteps: [
      'Battery (बैटरी सोर्स जोड़ें)',
      'Switch (कुंजी/स्विच जोड़ें)',
      'Resistor (प्रतिरोधक तार जोड़ें)',
      'Ammeter (एमीटर श्रेणीक्रम में जोड़ें)',
      'Circuit & Voltmeter (वोल्टमीटर समांतर क्रम में जोड़कर परिपथ पूर्ण करें)',
    ],
    controls: [
      {
        id: 'voltage',
        label: 'Voltage Slider (विभवांतर V)',
        symbol: 'V',
        unit: 'V',
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 1,
      },
      {
        id: 'resistance',
        label: 'Resistance Knob (प्रतिरोध R)',
        symbol: 'R',
        unit: 'Ω',
        min: 5,
        max: 25,
        step: 5,
        defaultValue: 10,
      },
    ],
    observationColumns: [
      { key: 'voltage', label: 'Voltage (V)', unit: 'V' },
      { key: 'resistance', label: 'Resistance (R)', unit: 'Ω' },
      { key: 'current', label: 'Current (I = V/R)', unit: 'A' },
      { key: 'calculatedR', label: 'Ratio V/I', unit: 'Ω' },
    ],
    defaultReferenceRows: [
      { voltage: '1 V', resistance: '10 Ω', current: '0.10 A', calculatedR: '10.0 Ω' },
      { voltage: '2 V', resistance: '10 Ω', current: '0.20 A', calculatedR: '10.0 Ω' },
      { voltage: '3 V', resistance: '10 Ω', current: '0.30 A', calculatedR: '10.0 Ω' },
      { voltage: '4 V', resistance: '10 Ω', current: '0.40 A', calculatedR: '10.0 Ω' },
      { voltage: '5 V', resistance: '10 Ω', current: '0.50 A', calculatedR: '10.0 Ω' },
    ],
    calculationChallenge: {
      question: 'प्रश्न: यदि resistance 10 Ω और voltage 5 V है, तो current कितना होगा?',
      formulaUsed: 'I = V / R',
      givenValues: 'V = 5 V, R = 10 Ω',
      expectedNumericAnswer: 0.5,
      tolerance: 0.02,
      unit: 'A',
      stepByStepSolution: 'ओम के नियम से: I = V / R = 5 V / 10 Ω = 0.5 A (एम्पियर)।',
    },
    resultStatement:
      'प्रयोग से सत्यापित हुआ कि प्रत्येक प्रेक्षण में विभवांतर (V) और विद्युत धारा (I) का अनुपात (R = V/I = 10 Ω) नियत रहता है तथा V = 5 V, R = 10 Ω पर विद्युत धारा I = 0.50 A प्राप्त होती है।',
    precautions: [
      'एमीटर को सदैव श्रेणीक्रम (Series) और वोल्टमीटर को समांतर क्रम (Parallel) में ही जोड़ें।',
      'प्रेक्षण लेने के तुरंत बाद स्विच बंद (OFF) कर दें ताकि तार गर्म न हो और प्रतिरोध न बदले।',
    ],
  },

  // ============================================================================
  // 2. PHYSICS - CLASS 9: ARCHIMEDES' PRINCIPLE & DENSITY
  // ============================================================================
  {
    id: 'exp-phy-9-archimedes',
    name: "Archimedes' Principle",
    hindiName: "Archimedes' Principle — आर्किमिडीज का सिद्धांत",
    subject: 'Physics',
    class: '9',
    chapter: 'Floatation & Gravitation',
    simulatorType: 'archimedes',
    objective:
      'किसी ठोस वस्तु को जल में पूर्णतः डुबोने पर उसके भार में होने वाली आभासी कमी और विस्थापित जल के भार के बीच संबंध स्थापित करना।',
    equipment: [
      {
        id: 'eq-spring',
        name: 'Spring Balance (0–500 gwt)',
        hindiName: 'कमानीदार तुला (Spring Balance)',
        purpose: 'वायु और जल में ठोस गुटके का भार मापने के लिए।',
      },
      {
        id: 'eq-eureka',
        name: 'Overflow / Eureka Can',
        hindiName: 'यूरेका बर्तन (Overflow Can)',
        purpose: 'वस्तु को डुबोने पर विस्थापित जल को बाहर निकालने के लिए।',
      },
      {
        id: 'eq-cylinder',
        name: 'Measuring Cylinder (250 mL)',
        hindiName: 'मापक बेलन (Measuring Cylinder)',
        purpose: 'विस्थापित जल का आयतन और भार मापने के लिए।',
      },
      {
        id: 'eq-block',
        name: 'Metallic Solid Bob / Block',
        hindiName: 'धातु का ठोस गुटका',
        purpose: 'द्रव में डुबोकर उत्प्लावन बल का परीक्षण करने के लिए।',
      },
    ],
    theory: [
      'आर्किमिडीज के सिद्धांत के अनुसार, जब किसी वस्तु को किसी द्रव में पूर्ण या आंशिक रूप से डुबोया जाता है, तो उसके भार में आभासी कमी आ जाती है।',
      'भार में यह आभासी कमी वस्तु द्वारा हटाए गए (विस्थापित) द्रव के भार के बराबर होती है: उत्प्लावन बल (Buoyant Force F_b) = W_air - W_water = V × ρ × g।',
    ],
    formula: 'ΔW = W₁ - W₂ = V × ρ_liquid',
    formulaExplanation: 'W₁ = वायु में भार (gwt), W₂ = द्रव में आभासी भार (gwt), V = विस्थापित आयतन (mL)',
    connectionSteps: [
      'Iron Stand (लोहे के स्टैंड पर कमानीदार तुला लटकाएं)',
      'Solid Block (धातु के गुटके को तुला के हुक से जोड़ें)',
      'Eureka Can (यूरेका कैन में टोंटी के स्तर तक जल भरें)',
      'Measuring Beaker (टोंटी के नीचे मापक बीकर रखें)',
      'Immersion Setup (गुटके को जल में डुबोने के लिए सेटअप तैयार करें)',
    ],
    controls: [
      {
        id: 'massAir',
        label: 'Weight in Air W₁ (वायु में भार)',
        symbol: 'W₁',
        unit: 'gwt',
        min: 100,
        max: 400,
        step: 50,
        defaultValue: 250,
      },
      {
        id: 'volumeSubmerged',
        label: 'Submerged Volume V (डूबा आयतन)',
        symbol: 'V',
        unit: 'mL',
        min: 20,
        max: 100,
        step: 10,
        defaultValue: 50,
      },
    ],
    observationColumns: [
      { key: 'w1', label: 'Weight in Air (W₁)', unit: 'gwt' },
      { key: 'volume', label: 'Displaced Water (V)', unit: 'mL' },
      { key: 'w2', label: 'Weight in Water (W₂)', unit: 'gwt' },
      { key: 'loss', label: 'Apparent Loss (W₁ - W₂)', unit: 'gwt' },
    ],
    defaultReferenceRows: [
      { w1: '200 gwt', volume: '40 mL', w2: '160 gwt', loss: '40 gwt' },
      { w1: '250 gwt', volume: '50 mL', w2: '200 gwt', loss: '50 gwt' },
      { w1: '300 gwt', volume: '60 mL', w2: '240 gwt', loss: '60 gwt' },
    ],
    calculationChallenge: {
      question:
        'प्रश्न: यदि किसी धातु के गुटके का वायु में भार W₁ = 250 gwt है और जल में डुबोने पर वह 50 gwt जल विस्थापित करता है, तो जल में उसका आभासी भार (W₂) कितना होगा?',
      formulaUsed: 'W₂ = W₁ - उत्प्लावन बल (ΔW)',
      givenValues: 'W₁ = 250 gwt, विस्थापित जल का भार ΔW = 50 gwt',
      expectedNumericAnswer: 200,
      tolerance: 1,
      unit: 'gwt',
      stepByStepSolution: 'W₂ = W₁ - ΔW = 250 gwt - 50 gwt = 200 gwt।',
    },
    resultStatement:
      'प्रयोग द्वारा सत्यापित हुआ कि वस्तु के भार में आभासी कमी (W₁ - W₂ = 50 gwt) वस्तु द्वारा विस्थापित जल के भार (50 gwt) के ठीक बराबर है।',
    precautions: [
      'गुटके को जल में डुबोते समय वह बर्तन की दीवारों या तली को स्पर्श नहीं करना चाहिए।',
      'कमानीदार तुला का शून्यांक त्रुटि (Zero Error) पहले ही नोट कर लें।',
    ],
  },

  // ============================================================================
  // 3. PHYSICS - CLASS 11: SIMPLE PENDULUM & ACCELERATION DUE TO GRAVITY (g)
  // ============================================================================
  {
    id: 'exp-phy-11-pendulum',
    name: 'Simple Pendulum (L-T² Graph)',
    hindiName: 'Simple Pendulum — सरल लोलक द्वारा g का मान',
    subject: 'Physics',
    class: '11',
    chapter: 'Oscillations',
    simulatorType: 'pendulum',
    objective:
      'सरल लोलक की प्रभावी लंबाई (L) और आवर्तकाल (T) के बीच संबंध का अध्ययन करना तथा पृथ्वी के गुरुत्वीय त्वरण (g) का मान ज्ञात करना।',
    equipment: [
      {
        id: 'eq-bob',
        name: 'Metallic Spherical Bob',
        hindiName: 'धातु का गोलक (Pendulum Bob)',
        purpose: 'दोलन करने वाले द्रव्यमान केंद्र के रूप में।',
      },
      {
        id: 'eq-thread',
        name: 'Inextensible Cotton Thread & Split Cork',
        hindiName: 'अवितान्य धागा एवं चीरा कॉर्क',
        purpose: 'प्रभावी लंबाई (L) को समायोजित करने के लिए।',
      },
      {
        id: 'eq-stopwatch',
        name: 'Digital Stopwatch (0.01 s Least Count)',
        hindiName: 'डिजिटल स्टॉपवॉच (Stopwatch)',
        purpose: '20 दोलनों का कुल समय सटीकता से मापने के लिए।',
      },
      {
        id: 'eq-meter-scale',
        name: 'Meter Scale & Vernier Callipers',
        hindiName: 'मीटर स्केल एवं वर्नियर कैलिपर्स',
        purpose: 'धागे की लंबाई और गोलक की त्रिज्या मापने के लिए।',
      },
    ],
    theory: [
      'सरल लोलक का आवर्तकाल (T) उसकी प्रभावी लंबाई (L) के वर्गमूल के समानुपाती होता है: T = 2π √(L / g)।',
      'दोनों पक्षों का वर्ग करने पर: g = 4π² × (L / T²)। चूँकि 4π² ≈ 39.48 नियत है, इसलिए L/T² का अनुपात नियत रहता है।',
    ],
    formula: 'T = 2π √(L / g)   अथवा   g = 4π² L / T²',
    formulaExplanation: 'L = प्रभावी लंबाई (m में), T = एक दोलन का आवर्तकाल (s में), g = 9.8 m/s²',
    connectionSteps: [
      'Retort Stand (स्टैंड के क्लैंप में चीरा लगा कॉर्क कसें)',
      'Thread & Bob (धागे के सिरे पर पीतल का गोलक बाँधें)',
      'Length Adjustment (प्रभावी लंबाई L मीटर स्केल से सेट करें)',
      'Stopwatch Reset (डिजिटल स्टॉपवॉच को 0.00 s पर रीसेट करें)',
      'Small Amplitude Release (गोलक को < 5° के छोटे कोण से मुक्त करें)',
    ],
    controls: [
      {
        id: 'lengthCm',
        label: 'Effective Length L (प्रभावी लंबाई)',
        symbol: 'L',
        unit: 'cm',
        min: 50,
        max: 150,
        step: 25,
        defaultValue: 100,
      },
      {
        id: 'gravity',
        label: 'Gravity Environment g (गुरुत्वीय त्वरण)',
        symbol: 'g',
        unit: 'm/s²',
        min: 9.8,
        max: 9.8,
        step: 0.1,
        defaultValue: 9.8,
      },
    ],
    observationColumns: [
      { key: 'length', label: 'Length (L)', unit: 'cm' },
      { key: 'time20', label: 'Time for 20 Osc (t)', unit: 's' },
      { key: 'periodT', label: 'Time Period (T = t/20)', unit: 's' },
      { key: 'calcG', label: 'Calculated g', unit: 'm/s²' },
    ],
    defaultReferenceRows: [
      { length: '50 cm', time20: '28.4 s', periodT: '1.42 s', calcG: '9.79 m/s²' },
      { length: '100 cm', time20: '40.1 s', periodT: '2.01 s', calcG: '9.80 m/s²' },
      { length: '125 cm', time20: '44.9 s', periodT: '2.24 s', calcG: '9.81 m/s²' },
    ],
    calculationChallenge: {
      question:
        'प्रश्न: यदि सरल लोलक द्वारा 20 दोलन पूरे करने में लगा समय t = 40 s है, तो लोलक का आवर्तकाल (T = t / 20) कितने सेकंड होगा?',
      formulaUsed: 'T = t / N',
      givenValues: 't = 40 s, दोलनों की संख्या N = 20',
      expectedNumericAnswer: 2,
      tolerance: 0.05,
      unit: 's',
      stepByStepSolution: 'आवर्तकाल T = कुल समय (t) / दोलनों की संख्या (N) = 40 s / 20 = 2.0 s।',
    },
    resultStatement:
      'प्रयोग द्वारा L = 100 cm (1 m) पर सरल लोलक का आवर्तकाल T ≈ 2.01 s तथा पृथ्वी का गुरुत्वीय त्वरण g = 9.8 m/s² प्राप्त हुआ।',
    precautions: [
      'दोलन का कोण (आयाम) बहुत छोटा (5° से कम) होना चाहिए ताकि गति सरल आवर्त गति (SHM) बनी रहे।',
      'गोलक बिना घूमे एक ही ऊर्ध्वाधर तल में दोलन करना चाहिए।',
    ],
  },

  // ============================================================================
  // 4. PHYSICS - CLASS 12: METER BRIDGE / WHEATSTONE BRIDGE
  // ============================================================================
  {
    id: 'exp-phy-12-wheatstone',
    name: 'Meter Bridge (Wheatstone Principle)',
    hindiName: 'Meter Bridge — मीटर सेतु द्वारा अज्ञात प्रतिरोध',
    subject: 'Physics',
    class: '12',
    chapter: 'Current Electricity',
    simulatorType: 'wheatstone',
    objective:
      'मीटर सेतु (व्हीटस्टोन सेतु सिद्धांत) की सहायता से दिए गए तार का अज्ञात प्रतिरोध (X) और विशिष्ट प्रतिरोध (Resistivity) ज्ञात करना।',
    equipment: [
      {
        id: 'eq-meterbridge',
        name: 'Meter Bridge with 1m Constantan Wire',
        hindiName: 'मीटर सेतु (100 cm तार युक्त)',
        purpose: 'संतुलन लंबाई (l) ज्ञात करने के लिए।',
      },
      {
        id: 'eq-resbox',
        name: 'Resistance Box (R)',
        hindiName: 'प्रतिरोध बॉक्स (Resistance Box)',
        purpose: 'बाएँ अंतराल में ज्ञात प्रतिरोध (R) लगाने के लिए।',
      },
      {
        id: 'eq-galvano',
        name: 'Sensitive Galvanometer & Jockey',
        hindiName: 'गैल्वेनोमीटर एवं जॉकी (Jockey)',
        purpose: 'शून्य विक्षेप (Null Point: I_g = 0) की स्थिति खोजने के लिए।',
      },
      {
        id: 'eq-leclanche',
        name: 'Leclanche Cell & Plug Key',
        hindiName: 'लेक्लांशी सेल एवं प्लग कुंजी',
        purpose: 'सेतु परिपथ में स्थिर धारा प्रवाहित करने के लिए।',
      },
    ],
    theory: [
      'मीटर सेतु व्हीटस्टोन सेतु (Wheatstone Bridge) के संतुलन सिद्धांत P / Q = R / X पर कार्य करता है।',
      'जब गैल्वेनोमीटर में शून्य विक्षेप (Null Deflection) प्राप्त होता है, यदि संतुलन लंबाई l cm है, तो अज्ञात प्रतिरोध X = R × (100 - l) / l होता है।',
    ],
    formula: 'X = R × (100 - l) / l',
    formulaExplanation: 'R = ज्ञात प्रतिरोध (Ω), l = संतुलन लंबाई (cm), X = अज्ञात प्रतिरोध (Ω)',
    connectionSteps: [
      'Resistance Box (बाएँ गैप में प्रतिरोध बॉक्स R जोड़ें)',
      'Unknown Wire (दाएँ गैप में अज्ञात प्रतिरोध तार X जोड़ें)',
      'Galvanometer & Jockey (मध्य टर्मिनल से गैल्वेनोमीटर व जॉकी जोड़ें)',
      'Cell & Key (सिरों A और C के बीच सेल व कुंजी जोड़ें)',
      'Null Point Check (जॉकी को तार पर स्पर्श कराकर संतुलन बिंदु जाँचें)',
    ],
    controls: [
      {
        id: 'knownR',
        label: 'Known Resistance R (ज्ञात प्रतिरोध)',
        symbol: 'R',
        unit: 'Ω',
        min: 2,
        max: 12,
        step: 2,
        defaultValue: 6,
      },
      {
        id: 'balanceL',
        label: 'Jockey Position / Balance Length l',
        symbol: 'l',
        unit: 'cm',
        min: 25,
        max: 75,
        step: 5,
        defaultValue: 50,
      },
    ],
    observationColumns: [
      { key: 'knownR', label: 'Known Resistance (R)', unit: 'Ω' },
      { key: 'lengthL', label: 'Balance Length (l)', unit: 'cm' },
      { key: 'remLength', label: '100 - l', unit: 'cm' },
      { key: 'unknownX', label: 'Unknown X = R(100-l)/l', unit: 'Ω' },
    ],
    defaultReferenceRows: [
      { knownR: '4 Ω', lengthL: '40 cm', remLength: '60 cm', unknownX: '6.0 Ω' },
      { knownR: '6 Ω', lengthL: '50 cm', remLength: '50 cm', unknownX: '6.0 Ω' },
      { knownR: '9 Ω', lengthL: '60 cm', remLength: '40 cm', unknownX: '6.0 Ω' },
    ],
    calculationChallenge: {
      question:
        'प्रश्न: मीटर सेतु प्रयोग में यदि ज्ञात प्रतिरोध R = 6 Ω और शून्य विक्षेप की संतुलन लंबाई l = 50 cm है, तो अज्ञात प्रतिरोध X का मान कितना होगा?',
      formulaUsed: 'X = R × (100 - l) / l',
      givenValues: 'R = 6 Ω, l = 50 cm, (100 - l) = 50 cm',
      expectedNumericAnswer: 6,
      tolerance: 0.1,
      unit: 'Ω',
      stepByStepSolution: 'X = R × (100 - l) / l = 6 × (100 - 50) / 50 = 6 × (50 / 50) = 6 Ω।',
    },
    resultStatement:
      'मीटर सेतु के संतुलन बिंदु (Null Point) द्वारा दिए गए तार का अज्ञात प्रतिरोध X = 6.0 Ω प्राप्त हुआ।',
    precautions: [
      'जॉकी को तार के ऊपर रगड़कर न चलाएँ, बल्कि हल्के से स्पर्श (Tap) कराएँ ताकि तार की अनुप्रस्थ काट समान रहे।',
      'संतुलन बिंदु तार के मध्य भाग (30 cm से 70 cm के बीच) में प्राप्त करना सबसे सटीक होता है।',
    ],
  },

  // ============================================================================
  // 5. CHEMISTRY - CLASS 10: pH SCALE & ACID-BASE UNIVERSAL INDICATOR
  // ============================================================================
  {
    id: 'exp-che-10-ph-scale',
    name: 'pH Determination by Universal Indicator',
    hindiName: 'pH Scale Lab — pH पत्र द्वारा अम्ल-क्षार परीक्षण',
    subject: 'Chemistry',
    class: '10',
    chapter: 'Acids, Bases and Salts',
    simulatorType: 'ph_scale',
    objective:
      'सार्वत्रिक सूचक (Universal Indicator) और pH पत्र की सहायता से विभिन्न जलीय विलयनों (HCl, नींबू रस, शुद्ध जल, NaOH आदि) का pH मान ज्ञात करना और उनकी अम्लीय/क्षारीय प्रकृति पहचानना।',
    equipment: [
      {
        id: 'eq-testtubes',
        name: 'Borosilicate Test Tubes & Rack',
        hindiName: 'परखनली एवं स्टैंड (Test Tubes)',
        purpose: 'विभिन्न नमूना विलयनों को सुरक्षित रूप से रखने के लिए।',
      },
      {
        id: 'eq-phpaper',
        name: 'pH Paper Strips & Standard Colour Chart',
        hindiName: 'pH पत्र एवं मानक रंग चार्ट',
        purpose: 'रंग परिवर्तन से pH मान (0 से 14) का मिलान करने के लिए।',
      },
      {
        id: 'eq-dropper',
        name: 'Glass Dropper & Universal Indicator',
        hindiName: 'ड्रॉपर एवं सार्वत्रिक सूचक विलयन',
        purpose: 'नमूने की बूँद pH पत्र पर डालने के लिए।',
      },
      {
        id: 'eq-phmeter',
        name: 'Digital pH Meter Electrode',
        hindiName: 'डिजिटल pH मीटर',
        purpose: 'हाइड्रोजन आयन सांद्रता से सटीक pH रीडिंग प्राप्त करने के लिए।',
      },
    ],
    theory: [
      'किसी विलयन का pH मान उसमें उपस्थित हाइड्रोजन आयन सांद्रता [H⁺] के ऋणात्मक लघुगणक (Negative Logarithm) के बराबर होता है: pH = -log₁₀[H⁺]।',
      '25°C पर शुद्ध जल उदासीन होता है और उसका pH = 7 होता है। यदि pH < 7 हो तो विलयन अम्लीय (Acidic) होता है, और यदि pH > 7 हो तो विलयन क्षारीय (Basic/Alkaline) होता है।',
    ],
    formula: 'pH = -log₁₀[H⁺]   तथा   pH + pOH = 14',
    formulaExplanation: '[H⁺] = हाइड्रोजन आयन सांद्रता (mol/L में), pH < 7 अम्लीय, pH = 7 उदासीन, pH > 7 क्षारीय',
    connectionSteps: [
      'Clean Test Tubes (साफ परखनलियों को आसुत जल से धोकर स्टैंड में रखें)',
      'Pour Sample Solution (परखनली में परीक्षण विलयन की 5 mL मात्रा लें)',
      'Universal Indicator Dropper (ड्रॉपर से सार्वत्रिक सूचक की 2 बूँदें मिलाएँ)',
      'Insert pH Electrode (डिजिटल pH प्रोब व pH स्ट्रिप विलयन में डुबोएँ)',
      'Match Colour Chart (मानक pH स्पेक्ट्रम से रंग और रीडिंग का मिलान करें)',
    ],
    controls: [
      {
        id: 'phValue',
        label: 'Solution pH Slider (विलयन का pH मान)',
        symbol: 'pH',
        unit: 'pH',
        min: 1,
        max: 14,
        step: 1,
        defaultValue: 2,
      },
      {
        id: 'drops',
        label: 'Indicator Drops (सूचक की बूँदें)',
        symbol: 'D',
        unit: 'drops',
        min: 1,
        max: 5,
        step: 1,
        defaultValue: 2,
      },
    ],
    observationColumns: [
      { key: 'sample', label: 'Sample Type', unit: '' },
      { key: 'ph', label: 'Observed pH', unit: '' },
      { key: 'color', label: 'Indicator Colour', unit: '' },
      { key: 'nature', label: 'Chemical Nature', unit: '' },
    ],
    defaultReferenceRows: [
      { sample: 'Dilute HCl / Lemon', ph: '2.0', color: 'गहरा लाल/नारंगी (Red)', nature: 'प्रबल अम्ल (Acidic)' },
      { sample: 'Pure Distilled Water', ph: '7.0', color: 'हरा (Emerald Green)', nature: 'उदासीन (Neutral)' },
      { sample: 'Baking Soda (NaHCO₃)', ph: '9.0', color: 'नीला (Cyan Blue)', nature: 'दुर्बल क्षार (Weak Base)' },
      { sample: 'Dilute NaOH Solution', ph: '13.0', color: 'बैंगनी (Deep Violet)', nature: 'प्रबल क्षार (Strong Base)' },
    ],
    calculationChallenge: {
      question:
        'प्रश्न: 25°C पर यदि किसी जलीय विलयन का pH मान 3 है, तो सूत्र pH + pOH = 14 के अनुसार उसका pOH मान कितना होगा?',
      formulaUsed: 'pOH = 14 - pH',
      givenValues: 'pH = 3, ताप = 25°C (जहाँ pK_w = 14)',
      expectedNumericAnswer: 11,
      tolerance: 0.1,
      unit: '',
      stepByStepSolution: 'सूत्र pH + pOH = 14 से: pOH = 14 - 3 = 11।',
    },
    resultStatement:
      'प्रयोग द्वारा सत्यापित हुआ कि अम्लीय विलयनों का pH 7 से कम (लाल/नारंगी रंग), शुद्ध जल का pH 7.0 (हरा रंग) तथा क्षारीय विलयनों का pH 7 से अधिक (नीला/बैंगनी रंग) होता है।',
    precautions: [
      'प्रत्येक नए विलयन का परीक्षण करने से पहले ड्रॉपर को आसुत जल (Distilled Water) से अवश्य धोएँ।',
      'अम्ल या क्षार को कभी भी सीधे हाथ से स्पर्श न करें।',
    ],
  },

  // ============================================================================
  // 6. CHEMISTRY - CLASS 9: MELTING POINT OF ICE & BOILING POINT OF WATER
  // ============================================================================
  {
    id: 'exp-che-9-matter-state',
    name: 'Latent Heat & Boiling Point of Water',
    hindiName: 'Boiling Point & Latent Heat — जल का क्वथनांक एवं गुप्त ऊष्मा',
    subject: 'Chemistry',
    class: '9',
    chapter: 'Matter in Our Surroundings',
    simulatorType: 'matter_state',
    objective:
      'बर्फ के गलनांक (Melting Point) और शुद्ध जल के क्वथनांक (Boiling Point) का निर्धारण करना तथा अवस्था परिवर्तन के दौरान गुप्त ऊष्मा (Latent Heat) के प्रभाव का अध्ययन करना।',
    equipment: [
      {
        id: 'eq-beaker',
        name: 'Borosilicate Beaker (250 mL) & Wire Gauze',
        hindiName: 'बीकर एवं तार की जाली',
        purpose: 'बर्फ/जल को समान रूप से गर्म करने के लिए।',
      },
      {
        id: 'eq-thermometer',
        name: 'Laboratory Thermometer (-10°C to 110°C)',
        hindiName: 'प्रयोगशाला तापमापी (Thermometer)',
        purpose: 'तापमान में होने वाले परिवर्तन को सेल्सियस व केल्विन में मापने के लिए।',
      },
      {
        id: 'eq-burner',
        name: 'Bunsen Burner & Tripod Stand',
        hindiName: 'बुन्सन बर्नर एवं त्रिपाद स्टैंड',
        purpose: 'नियंत्रित ऊष्मा प्रदान करने के लिए।',
      },
      {
        id: 'eq-stirrer',
        name: 'Glass Stirrer & Pumice Stone Pieces',
        hindiName: 'काँच की विलोडक छड़ एवं प्यूमिस पत्थर',
        purpose: 'समान तापमान बनाए रखने और उछाल (Bumping) रोकने के लिए।',
      },
    ],
    theory: [
      'वायुमंडलीय दाब (1 atm) पर वह स्थिर तापमान जिस पर ठोस बर्फ पिघलकर द्रव जल बनती है, उसका गलनांक (0°C या 273.15 K) कहलाता है।',
      'वह तापमान जिस पर जल उबलकर तेजी से वाष्प (भाप) में परिवर्तित होता है, जल का क्वथनांक (100°C या 373.15 K) कहलाता है। अवस्था परिवर्तन के समय तापमान स्थिर रहता है क्योंकि दी गई ऊष्मा गुप्त ऊष्मा (Latent Heat) के रूप में खर्च होती है।',
    ],
    formula: 'T (K) = T (°C) + 273   तथा   Q = m × L',
    formulaExplanation: 'T(K) = केल्विन में तापमान, T(°C) = सेल्सियस में तापमान, L = गुप्त ऊष्मा',
    connectionSteps: [
      'Tripod & Wire Gauze (त्रिपाद स्टैंड पर तार की जाली रखें)',
      'Beaker with Pure Water (बीकर में शुद्ध जल व प्यूमिस के टुकड़े रखें)',
      'Suspend Thermometer (क्लैंप स्टैंड से तापमापी को जल में लटकाएं)',
      'Bunsen Burner Setup (नीचे बुन्सन बर्नर सेट करें)',
      'Heat & Observe (बर्नर जलाकर तापमान वृद्धि का प्रेक्षण करें)',
    ],
    controls: [
      {
        id: 'heatingTime',
        label: 'Heating Time t (गर्म करने का समय)',
        symbol: 't',
        unit: 'min',
        min: 0,
        max: 10,
        step: 2,
        defaultValue: 4,
      },
      {
        id: 'flameLevel',
        label: 'Burner Flame Power (बर्नर ज्वाला शक्ति)',
        symbol: 'P',
        unit: 'level',
        min: 1,
        max: 3,
        step: 1,
        defaultValue: 2,
      },
    ],
    observationColumns: [
      { key: 'time', label: 'Time (t)', unit: 'min' },
      { key: 'tempC', label: 'Temperature (°C)', unit: '°C' },
      { key: 'tempK', label: 'Temperature (K = °C + 273)', unit: 'K' },
      { key: 'phase', label: 'Physical State', unit: '' },
    ],
    defaultReferenceRows: [
      { time: '0 min', tempC: '20 °C', tempK: '293 K', phase: 'द्रव जल (Liquid Water)' },
      { time: '4 min', tempC: '68 °C', tempK: '341 K', phase: 'गर्म जल (Warming Liquid)' },
      { time: '8 min', tempC: '100 °C', tempK: '373 K', phase: 'उबलता जल + भाप (Boiling Equilibrium)' },
      { time: '10 min', tempC: '100 °C', tempK: '373 K', phase: 'स्थिर क्वथनांक (Constant Boiling Point)' },
    ],
    calculationChallenge: {
      question:
        'प्रश्न: प्रयोगशाला में शुद्ध जल का क्वथनांक 100°C प्राप्त हुआ। सूत्र K = °C + 273 के अनुसार केल्विन (K) पैमाने पर यह मान कितना होगा?',
      formulaUsed: 'T(K) = T(°C) + 273',
      givenValues: 'T(°C) = 100°C',
      expectedNumericAnswer: 373,
      tolerance: 0.5,
      unit: 'K',
      stepByStepSolution: 'T(K) = 100 + 273 = 373 K।',
    },
    resultStatement:
      'प्रयोग से सत्यापित हुआ कि मानक वायुमंडलीय दाब पर शुद्ध जल का क्वथनांक 100°C (373 K) होता है और उबलते समय गुप्त ऊष्मा के कारण तापमान 100°C पर स्थिर रहता है।',
    precautions: [
      'थर्मामीटर का बल्ब बीकर की तली या दीवारों को स्पर्श नहीं करना चाहिए।',
      'जल के उबलते समय भाप से हाथ और चेहरे को सुरक्षित दूरी पर रखें।',
    ],
  },

  // ============================================================================
  // 7. CHEMISTRY - CLASS 11: ACID-BASE TITRATION (MOLARITY DETERMINATION)
  // ============================================================================
  {
    id: 'exp-che-11-titration',
    name: 'Acid-Base Titration (NaOH vs Oxalic Acid)',
    hindiName: 'Volumetric Titration — अम्ल-क्षार अनुमापन (M₁V₁ = M₂V₂)',
    subject: 'Chemistry',
    class: '11',
    chapter: 'Some Basic Concepts of Chemistry & Equilibrium',
    simulatorType: 'titration',
    objective:
      'मानक ऑक्सैलिक अम्ल ( या HCl) विलयन की सहायता से फेनोल्फथैलिन सूचक का उपयोग करके सोडियम हाइड्रॉक्साइड (NaOH) विलयन की मोलरता (Molarity) और सांद्रता ज्ञात करना।',
    equipment: [
      {
        id: 'eq-burette',
        name: 'Graduated Burette (50 mL) & Stand',
        hindiName: 'ब्यूरेट (Burette 50 mL) एवं स्टैंड',
        purpose: 'NaOH विलयन को बूँद-बूँद करके शंक्वाकार फ्लास्क में डालने के लिए।',
      },
      {
        id: 'eq-pipette',
        name: 'Bulb Pipette (10 mL / 20 mL)',
        hindiName: 'पिपेट (Pipette)',
        purpose: 'अम्ल विलयन का निश्चित आयतन फ्लास्क में मापने के लिए।',
      },
      {
        id: 'eq-flask',
        name: 'Conical Titration Flask (250 mL)',
        hindiName: 'शंक्वाकार फ्लास्क (Conical Flask)',
        purpose: 'अनुमापन अभिक्रिया और रंग परिवर्तन देखने के लिए।',
      },
      {
        id: 'eq-phenol',
        name: 'Phenolphthalein Indicator Bottle',
        hindiName: 'फेनोल्फथैलिन सूचक (Phenolphthalein)',
        purpose: 'अंतिम बिंदु (End Point) पर हल्का गुलाबी रंग दर्शाने के लिए।',
      },
    ],
    theory: [
      'अनुमापन (Titration) में ज्ञात मोलरता के मानक अम्ल विलयन के निश्चित आयतन को अज्ञात मोलरता के क्षार से उदासीन किया जाता है।',
      'एकक्षारीय अम्ल और एकअम्लीय क्षार के लिए मोलरता समीकरण M₁V₁ = M₂V₂ होता है। फेनोल्फथैलिन अम्लीय माध्यम में रंगहीन और उदासीनता के ठीक बाद हल्का गुलाबी (faint pink) रंग देता है।',
    ],
    formula: 'M₁ × V₁ = M₂ × V₂   अथवा   M₂ = (M₁ × V₁) / V₂',
    formulaExplanation: 'M₁, V₁ = अम्ल की मोलरता व आयतन; M₂, V₂ = क्षार (NaOH) की मोलरता व ब्यूरेट आयतन',
    connectionSteps: [
      'Rinse & Fill Burette (ब्यूरेट को NaOH विलयन से शून्य निशान तक भरें)',
      'Pipette Acid in Flask (पिपेट से 10 mL मानक अम्ल कोनिकल फ्लास्क में लें)',
      'Add Phenolphthalein (फ्लास्क में फेनोल्फथैलिन सूचक की 2 बूँदें डालें)',
      'Place White Tile (रंग परिवर्तन स्पष्ट देखने हेतु फ्लास्क के नीचे सफेद टाइल रखें)',
      'Dropwise Titration (ब्यूरेट स्टॉपकॉक खोलकर हल्का गुलाबी रंग आने तक अनुमापन करें)',
    ],
    controls: [
      {
        id: 'acidMolarity',
        label: 'Standard Acid Molarity M₁ (अम्ल मोलरता)',
        symbol: 'M₁',
        unit: 'M',
        min: 0.05,
        max: 0.2,
        step: 0.05,
        defaultValue: 0.1,
      },
      {
        id: 'buretteVol',
        label: 'Added NaOH Volume V₂ (ब्यूरेट पाठ्यांक)',
        symbol: 'V₂',
        unit: 'mL',
        min: 5,
        max: 20,
        step: 2.5,
        defaultValue: 10,
      },
    ],
    observationColumns: [
      { key: 'acidVol', label: 'Acid Volume (V₁)', unit: 'mL' },
      { key: 'acidM', label: 'Acid Molarity (M₁)', unit: 'M' },
      { key: 'baseVol', label: 'Burette Volume (V₂)', unit: 'mL' },
      { key: 'status', label: 'Flask Indicator Colour', unit: '' },
    ],
    defaultReferenceRows: [
      { acidVol: '10.0 mL', acidM: '0.10 M', baseVol: '7.5 mL', status: 'रंगहीन (Under-titrated)' },
      { acidVol: '10.0 mL', acidM: '0.10 M', baseVol: '10.0 mL', status: 'हल्का गुलाबी (End Point: M₂ = 0.10 M)' },
      { acidVol: '10.0 mL', acidM: '0.10 M', baseVol: '12.5 mL', status: 'गहरा गुलाबी (Over-titrated)' },
    ],
    calculationChallenge: {
      question:
        'प्रश्न: यदि 0.1 M मोलरता वाले 10 mL अम्ल को पूर्णतः उदासीन करने के लिए 10 mL NaOH विलयन लगता है (M₁V₁ = M₂V₂), तो NaOH की मोलरता (M₂) कितनी होगी?',
      formulaUsed: 'M₂ = (M₁ × V₁) / V₂',
      givenValues: 'M₁ = 0.1 M, V₁ = 10 mL, V₂ = 10 mL',
      expectedNumericAnswer: 0.1,
      tolerance: 0.01,
      unit: 'M',
      stepByStepSolution: 'M₂ = (M₁ × V₁) / V₂ = (0.1 × 10) / 10 = 0.1 M।',
    },
    resultStatement:
      'अनुमापन के सुसंगत पाठ्यांक (Concordant Volume V₂ = 10.0 mL) से दिए गए NaOH विलयन की मोलरता M₂ = 0.10 M (सांद्रता = 4.0 g/L) प्राप्त हुई।',
    precautions: [
      'ब्यूरेट की नोक (Nozzle) में हवा का बुलबुला नहीं होना चाहिए और पाठ्यांक निचले मेनिस्कस (Lower Meniscus) से लें।',
      'अंतिम बिंदु आने से ठीक पहले ब्यूरेट से विलयन एक-एक बूँद करके ही मिलाएँ।',
    ],
  },

  // ============================================================================
  // 8. CHEMISTRY - CLASS 12: CHEMICAL KINETICS (EFFECT OF CONCENTRATION & TEMP)
  // ============================================================================
  {
    id: 'exp-che-12-kinetics',
    name: 'Chemical Kinetics (Thiosulphate + HCl Rate)',
    hindiName: 'Chemical Kinetics — अभिक्रिया वेग पर सांद्रता का प्रभाव',
    subject: 'Chemistry',
    class: '12',
    chapter: 'Chemical Kinetics',
    simulatorType: 'kinetics',
    objective:
      'सोडियम थायोसल्फेट (Na₂S₂O₃) और हाइड्रोक्लोरिक अम्ल (HCl) के बीच अभिक्रिया के वेग पर सांद्रता और तापमान के प्रभाव का अध्ययन करना।',
    equipment: [
      {
        id: 'eq-cross-flask',
        name: 'Conical Flask on Cross-Marked White Paper',
        hindiName: 'क्रॉस (X) चिह्नित कागज व फ्लास्क',
        purpose: 'कोलॉइडी सल्फर बनने से क्रॉस (X) के अदृश्य होने का समय नोट करने के लिए।',
      },
      {
        id: 'eq-thio',
        name: '0.1 M Sodium Thiosulphate (Na₂S₂O₃)',
        hindiName: 'सोडियम थायोसल्फेट विलयन',
        purpose: 'मुख्य अभिकारक जिसकी सांद्रता बदली जाती है।',
      },
      {
        id: 'eq-hcl',
        name: '1.0 M Hydrochloric Acid (HCl)',
        hindiName: '1M हाइड्रोक्लोरिक अम्ल',
        purpose: 'अवक्षेपण अभिक्रिया प्रारंभ करने के लिए।',
      },
      {
        id: 'eq-timer',
        name: 'Precision Stopwatch',
        hindiName: 'स्टॉपवॉच',
        purpose: 'अभिक्रिया समय (t) और वेग (1/t) ज्ञात करने के लिए।',
      },
    ],
    theory: [
      'रासायनिक अभिक्रिया: Na₂S₂O₃(aq) + 2HCl(aq) → 2NaCl(aq) + SO₂(g) + H₂O(l) + S(s)↓ (पीला-दूधिया सल्फर अवक्षेप)।',
      'द्रव्य अनुपाती क्रिया के नियम के अनुसार, अभिक्रिया का वेग अभिकारक की सांद्रता के समानुपाती होता है (Rate ∝ [Na₂S₂O₃])। सांद्रता बढ़ाने पर क्रॉस (X) कम समय (t) में अदृश्य हो जाता है, अर्थात् 1/t बढ़ता है।',
    ],
    formula: 'Rate ∝ 1 / t   तथा   Rate = k [Na₂S₂O₃]',
    formulaExplanation: 't = क्रॉस (X) चिह्न के अदृश्य होने में लगा समय (सेकंड में), 1/t = अभिक्रिया की सापेक्ष दर',
    connectionSteps: [
      'Place Cross Tile (सफेद कागज पर काले रंग का क्रॉस X बनाकर मेज पर रखें)',
      'Measure Na₂S₂O₃ (फ्लास्क में सोडियम थायोसल्फेट की निर्धारित मात्रा डालें)',
      'Add Distilled Water (कुल आयतन 50 mL रखने के लिए आसुत जल मिलाएँ)',
      'Add HCl & Start Timer (5 mL HCl डालते ही स्टॉपवॉच चालू करें)',
      'Observe Cross Vanish (ऊपर से देखते हुए X चिह्न के गायब होने पर समय नोट करें)',
    ],
    controls: [
      {
        id: 'concM',
        label: 'Na₂S₂O₃ Concentration C (सांद्रता)',
        symbol: 'C',
        unit: 'M',
        min: 0.02,
        max: 0.1,
        step: 0.02,
        defaultValue: 0.04,
      },
      {
        id: 'tempKinetics',
        label: 'Reaction Temperature T (तापमान)',
        symbol: 'T',
        unit: '°C',
        min: 25,
        max: 55,
        step: 10,
        defaultValue: 25,
      },
    ],
    observationColumns: [
      { key: 'conc', label: 'Concentration (C)', unit: 'M' },
      { key: 'temp', label: 'Temperature', unit: '°C' },
      { key: 'timeSec', label: 'Time for X to Vanish (t)', unit: 's' },
      { key: 'rateInv', label: 'Relative Rate (1/t)', unit: 's⁻¹' },
    ],
    defaultReferenceRows: [
      { conc: '0.02 M', temp: '25 °C', timeSec: '100 s', rateInv: '0.010 s⁻¹' },
      { conc: '0.04 M', temp: '25 °C', timeSec: '50 s', rateInv: '0.020 s⁻¹' },
      { conc: '0.08 M', temp: '25 °C', timeSec: '25 s', rateInv: '0.040 s⁻¹' },
    ],
    calculationChallenge: {
      question:
        'प्रश्न: यदि किसी सांद्रता पर क्रॉस (X) के अदृश्य होने में लगा समय t = 50 s है, तो सापेक्ष अभिक्रिया वेग (1 / t) का मान कितना s⁻¹ होगा?',
      formulaUsed: 'Relative Rate = 1 / t',
      givenValues: 't = 50 s',
      expectedNumericAnswer: 0.02,
      tolerance: 0.002,
      unit: 's⁻¹',
      stepByStepSolution: 'सापेक्ष अभिक्रिया वेग = 1 / t = 1 / 50 = 0.02 s⁻¹।',
    },
    resultStatement:
      'प्रयोग द्वारा सत्यापित हुआ कि सोडियम थायोसल्फेट की सांद्रता दोगुनी करने पर अभिक्रिया समय (t) आधा हो जाता है और अभिक्रिया वेग (1/t) सीधा बढ़ता है।',
    precautions: [
      'प्रत्येक प्रेक्षण में एक ही मोटाई और आकार वाले शंक्वाकार फ्लास्क व क्रॉस चिह्न का उपयोग करें।',
      'HCl मिलाते ही तुरंत स्टॉपवॉच चालू करें और फ्लास्क को एक बार हल्का हिलाएँ।',
    ],
  },

  // ============================================================================
  // 9. BIOLOGY - CLASS 9: OSMOSIS IN RAISINS / POTATO OSMOMETER
  // ============================================================================
  {
    id: 'exp-bio-9-osmosis',
    name: 'Osmosis & Water Absorption in Raisins',
    hindiName: 'Osmosis Lab — किशमिश में अंतःपरासरण द्वारा जल अवशोषण',
    subject: 'Biology',
    class: '9',
    chapter: 'The Fundamental Unit of Life',
    simulatorType: 'osmosis',
    objective:
      'किशमिश (सूखे अंगूर) में अंतःपरासरण (Endosmosis) द्वारा अवशोषित जल की प्रतिशत मात्रा ज्ञात करना।',
    equipment: [
      {
        id: 'eq-raisins',
        name: 'Dry Raisins with Intact Stalks',
        hindiName: 'डंठल युक्त सूखी किशमिश',
        purpose: 'अर्धपारगम्य कोशिका झिल्ली से जल अवशोषण का अध्ययन करने के लिए।',
      },
      {
        id: 'eq-balance',
        name: 'Digital Electronic Balance (0.01 g)',
        hindiName: 'डिजिटल इलेक्ट्रॉनिक तुला',
        purpose: 'किशमिश का प्रारंभिक (W₁) और अंतिम भार (W₂) मापने के लिए।',
      },
      {
        id: 'eq-petri',
        name: 'Petri Dish & Distilled Water',
        hindiName: 'पेट्री डिश एवं आसुत जल (अल्पपरासरी माध्यम)',
        purpose: 'किशमिश को भिगोने के लिए।',
      },
      {
        id: 'eq-blotting',
        name: 'Blotting / Filter Paper',
        hindiName: 'सोख्ता कागज (Blotting Paper)',
        purpose: 'फूली हुई किशमिश की बाहरी सतह से अतिरिक्त जल सुखाने के लिए।',
      },
    ],
    theory: [
      'जब सूखी किशमिश को शुद्ध जल (अल्पपरासरी विलयन / Hypotonic Solution) में रखा जाता है, तो बाहरी माध्यम में जल की सांद्रता किशमिश के भीतर के कोशिका रस से अधिक होती है।',
      'अतः जल के अणु अर्धपारगम्य कोशिका झिल्ली से होकर किशमिश के भीतर प्रवेश करते हैं। इस प्रक्रिया को अंतःपरासरण (Endosmosis) कहते हैं, जिससे किशमिश फूल जाती है और उसका भार बढ़ जाता है।',
    ],
    formula: 'जल अवशोषण % = [(W₂ - W₁) / W₁] × 100',
    formulaExplanation: 'W₁ = सूखी किशमिश का प्रारंभिक भार (g), W₂ = फूली हुई किशमिश का अंतिम भार (g)',
    connectionSteps: [
      'Weigh Dry Raisins (इलेक्ट्रॉनिक तुला पर सूखी किशमिश का प्रारंभिक भार W₁ मापें)',
      'Fill Petri Dish (पेट्री डिश में शुद्ध आसुत जल भरें)',
      'Soak Raisins (किशमिश को जल में पूर्णतः डुबोकर रख दें)',
      'Blot Surface Water (निर्धारित समय बाद निकालकर सोख्ता कागज से बाहरी नमी सुखाएँ)',
      'Final Weighing (फूली हुई किशमिश का अंतिम भार W₂ नोट करें)',
    ],
    controls: [
      {
        id: 'initialWeight',
        label: 'Initial Dry Weight W₁ (प्रारंभिक भार)',
        symbol: 'W₁',
        unit: 'g',
        min: 4,
        max: 10,
        step: 1,
        defaultValue: 5,
      },
      {
        id: 'soakHours',
        label: 'Soaking Duration (भिगोने का समय)',
        symbol: 't',
        unit: 'hr',
        min: 1,
        max: 4,
        step: 1,
        defaultValue: 2,
      },
    ],
    observationColumns: [
      { key: 'w1', label: 'Initial Weight (W₁)', unit: 'g' },
      { key: 'time', label: 'Soaking Time', unit: 'hr' },
      { key: 'w2', label: 'Final Weight (W₂)', unit: 'g' },
      { key: 'percent', label: 'Water Absorbed %', unit: '%' },
    ],
    defaultReferenceRows: [
      { w1: '5.0 g', time: '1 hr', w2: '6.5 g', percent: '30.0%' },
      { w1: '5.0 g', time: '2 hr', w2: '8.0 g', percent: '60.0%' },
      { w1: '5.0 g', time: '3 hr', w2: '8.5 g', percent: '70.0%' },
    ],
    calculationChallenge: {
      question:
        'प्रश्न: यदि सूखी किशमिश का प्रारंभिक भार W₁ = 5 g है और जल में रखने के बाद उसका अंतिम भार W₂ = 8 g हो जाता है, तो अवशोषित जल की प्रतिशत मात्रा कितनी होगी?',
      formulaUsed: '% Absorption = [(W₂ - W₁) / W₁] × 100',
      givenValues: 'W₁ = 5 g, W₂ = 8 g, अवशोषित जल = 8 - 5 = 3 g',
      expectedNumericAnswer: 60,
      tolerance: 0.5,
      unit: '%',
      stepByStepSolution: 'अवशोषित जल % = [(8 - 5) / 5] × 100 = (3 / 5) × 100 = 60%।',
    },
    resultStatement:
      'प्रयोग द्वारा सत्यापित हुआ कि अंतःपरासरण (Endosmosis) के कारण किशमिश द्वारा अवशोषित जल की प्रतिशत मात्रा 60% है।',
    precautions: [
      'अंतिम भार (W₂) लेने से पहले किशमिश को सोख्ता कागज से हल्के से सुखा लें ताकि बाहरी जल की बूँदें भार में न जुड़ें।',
      'केवल साबुत और डंठल युक्त किशमिश का ही चयन करें।',
    ],
  },

  // ============================================================================
  // 10. BIOLOGY - CLASS 10: STOMATA & PHOTOSYNTHESIS RATE (HYDRILLA O₂ BUBBLES)
  // ============================================================================
  {
    id: 'exp-bio-10-photosynthesis',
    name: 'Stomata & Photosynthesis Light Rate',
    hindiName: 'Photosynthesis & Stomata — प्रकाश संश्लेषण एवं रंध्र परीक्षण',
    subject: 'Biology',
    class: '10',
    chapter: 'Life Processes',
    simulatorType: 'stomata_photosynthesis',
    objective:
      'पत्ती की झिल्ली में रंध्रों (Stomata) का निरीक्षण करना तथा जलीय पौधे (Hydrilla) में प्रकाश की तीव्रता का प्रकाश संश्लेषण की दर (ऑक्सीजन बुलबुलों की संख्या) पर प्रभाव ज्ञात करना।',
    equipment: [
      {
        id: 'eq-hydrilla',
        name: 'Hydrilla / Elodea Aquatic Plant in Funnel',
        hindiName: 'हाइड्रिला जलीय पौधा एवं कीप',
        purpose: 'प्रकाश संश्लेषण के दौरान मुक्त ऑक्सीजन (O₂) के बुलबुले गिनने के लिए।',
      },
      {
        id: 'eq-lamp',
        name: 'Adjustable Light Source (100W Lamp)',
        hindiName: 'प्रकाश स्रोत (लैंप व स्केल)',
        purpose: 'प्रकाश की तीव्रता और दूरी बदलने के लिए।',
      },
      {
        id: 'eq-microscope',
        name: 'Compound Microscope & Safranin Stain',
        hindiName: 'संयुक्त सूक्ष्मदर्शी एवं सैफ्रानिन अभिरंजक',
        purpose: 'पत्ती की निचली अधिचर्म में द्वार कोशिकाएँ (Guard Cells) देखने के लिए।',
      },
      {
        id: 'eq-nahco3',
        name: 'Dilute NaHCO₃ Pond Water Beaker',
        hindiName: 'सोडियम बाइकार्बोनेट युक्त जल बीकर',
        purpose: 'पौधे को पर्याप्त CO₂ उपलब्ध कराने के लिए।',
      },
    ],
    theory: [
      'पौधों की पत्तियों में उपस्थित सूक्ष्म छिद्र रंध्र (Stomata) कहलाते हैं, जो दो वृक्काकार द्वार कोशिकाओं (Guard Cells) से घिरे होते हैं और गैसीय विनिमय (CO₂ व O₂) तथा वाष्पोत्सर्जन का नियंत्रण करते हैं।',
      'प्रकाश संश्लेषण: 6CO₂ + 12H₂O —(सूर्य का प्रकाश / क्लोरोफिल)→ C₆H₁₂O₆ + 6O₂↑ + 6H₂O। प्रकाश स्रोत नजदीक लाने पर तीव्रता बढ़ती है और प्रति मिनट निकलने वाले ऑक्सीजन बुलबुलों की संख्या बढ़ती है।',
    ],
    formula: 'Rate of Photosynthesis (R) = कुल O₂ बुलबुले (N) / समय (t मिनट)',
    formulaExplanation: 'N = मुक्त हुए ऑक्सीजन बुलबुलों की संख्या, t = समय (मिनट में)',
    connectionSteps: [
      'Beaker & Funnel (बीकर में हाइड्रिला की टहनियों पर उल्टी कीप रखें)',
      'Invert Test Tube (कीप के ऊपर जल से भरी परखनली उल्टी लगाएँ)',
      'Add NaHCO₃ (जल में चुटकी भर NaHCO₃ मिलाएँ ताकि CO₂ उपलब्ध रहे)',
      'Position Light Lamp (लैंप को निर्धारित दूरी पर रखकर स्विच ON करें)',
      'Count O₂ Bubbles (प्रति मिनट निकलने वाले O₂ बुलबुलों की गणना करें)',
    ],
    controls: [
      {
        id: 'lampDistance',
        label: 'Lamp Distance d (लैंप की दूरी)',
        symbol: 'd',
        unit: 'cm',
        min: 10,
        max: 50,
        step: 10,
        defaultValue: 20,
      },
      {
        id: 'timeMinutes',
        label: 'Observation Time t (प्रेक्षण समय)',
        symbol: 't',
        unit: 'min',
        min: 1,
        max: 5,
        step: 1,
        defaultValue: 3,
      },
    ],
    observationColumns: [
      { key: 'distance', label: 'Lamp Distance (d)', unit: 'cm' },
      { key: 'time', label: 'Time (t)', unit: 'min' },
      { key: 'bubbles', label: 'Total O₂ Bubbles (N)', unit: '' },
      { key: 'rate', label: 'Rate (N / t)', unit: 'bubbles/min' },
    ],
    defaultReferenceRows: [
      { distance: '40 cm', time: '3 min', bubbles: '30', rate: '10 bubbles/min' },
      { distance: '20 cm', time: '3 min', bubbles: '60', rate: '20 bubbles/min' },
      { distance: '10 cm', time: '3 min', bubbles: '90', rate: '30 bubbles/min' },
    ],
    calculationChallenge: {
      question:
        'प्रश्न: यदि हाइड्रिला प्रयोग में 20 cm दूरी पर 3 मिनट में कुल 60 ऑक्सीजन बुलबुले (N = 60) निकलते हैं, तो प्रति मिनट औसत दर (N / t) कितनी होगी?',
      formulaUsed: 'Rate = N / t',
      givenValues: 'N = 60 बुलबुले, t = 3 मिनट',
      expectedNumericAnswer: 20,
      tolerance: 0.5,
      unit: 'bubbles/min',
      stepByStepSolution: 'औसत प्रकाश संश्लेषण दर = 60 / 3 = 20 बुलबुले प्रति मिनट।',
    },
    resultStatement:
      'प्रयोग द्वारा स्पष्ट हुआ कि प्रकाश की तीव्रता बढ़ने (लैंप की दूरी घटने) पर रंध्र खुलते हैं और प्रकाश संश्लेषण की दर (20 O₂ बुलबुले/मिनट) बढ़ती है।',
    precautions: [
      'हाइड्रिला की टहनी का कटा हुआ सिरा कीप की नली की ओर ऊपर की तरफ होना चाहिए।',
      'स्लाइड बनाते समय पत्ती की निचली सतह (Lower Epidermis) की झिल्ली लें क्योंकि द्विबीजपत्री पत्ती में नीचे अधिक रंध्र होते हैं।',
    ],
  },

  // ============================================================================
  // 11. BIOLOGY - CLASS 11: TRANSPIRATION RATE BY GANONG'S POTOMETER
  // ============================================================================
  {
    id: 'exp-bio-11-transpiration',
    name: "Ganong's Potometer (Transpiration Rate)",
    hindiName: "Ganong's Potometer — पोटोमीटर द्वारा वाष्पोत्सर्जन दर",
    subject: 'Biology',
    class: '11',
    chapter: 'Transport in Plants & Plant Physiology',
    simulatorType: 'transpiration',
    objective:
      'गैनोंग के पोटोमीटर (Ganong’s Potometer) की सहायता से पत्तीदार टहनी में वाष्पोत्सर्जन की दर (Rate of Transpiration) और उस पर वायु/प्रकाश के प्रभाव का मापन करना।',
    equipment: [
      {
        id: 'eq-potometer',
        name: "Ganong's Potometer with Graduated Capillary",
        hindiName: 'गैनोंग पोटोमीटर (अंशांकित केशिका नली)',
        purpose: 'वायु के बुलबुले के विस्थापन से जल अवशोषण/वाष्पोत्सर्जन मापने के लिए।',
      },
      {
        id: 'eq-twig',
        name: 'Freshly Cut Leafy Twig (Coleus / Mango)',
        hindiName: 'ताजी कटी पत्तीदार टहनी',
        purpose: 'पर्णरंध्रों से वाष्पोत्सर्जन करने के लिए।',
      },
      {
        id: 'eq-reservoir',
        name: 'Water Reservoir with Stopcock',
        hindiName: 'स्टॉपकॉक युक्त जल रिज़र्वॉयर',
        purpose: 'वायु के बुलबुले को पुनः शून्य (0 mm) पर रीसेट करने के लिए।',
      },
      {
        id: 'eq-eosin',
        name: 'Eosin Coloured Water & Vaseline',
        hindiName: 'इओसिन रंगीन जल एवं वैसलीन',
        purpose: 'केशिका में बुलबुला स्पष्ट देखने और उपकरण को वायुरोधी बनाने के लिए।',
      },
    ],
    theory: [
      'पौधों के वायवीय भागों (मुख्यतः पत्तियों के रंध्रों) से जल का वाष्प के रूप में निष्कासन वाष्पोत्सर्जन (Transpiration) कहलाता है।',
      'पोटोमीटर में जैसे-जैसे टहनी वाष्पोत्सर्जन करती है, जाइलम में खिंचाव (Transpiration Pull) उत्पन्न होता है और क्षैतिज केशिका नली में वायु का बुलबुला आगे बढ़ता है।',
    ],
    formula: 'Transpiration Rate (v) = बुलबुले द्वारा तय दूरी (d) / समय (t)',
    formulaExplanation: 'd = वायु बुलबुले का विस्थापन (mm में), t = समय (मिनट में)',
    connectionSteps: [
      'Fill Potometer (पोटोमीटर को जल से पूर्णतः भरें ताकि कोई अतिरिक्त बुलबुला न रहे)',
      'Fix Leafy Twig (जल के भीतर तिरछी कटी टहनी को कॉर्क में लगाकर वैसलीन से सील करें)',
      'Introduce Air Bubble (केशिका नली के सिरे से एक छोटा वायु बुलबुला प्रवेश कराएँ)',
      'Zero Reset via Stopcock (रिज़र्वॉयर कॉक से बुलबुले को 0 mm निशान पर सेट करें)',
      'Record Bubble Movement (निर्धारित समय में बुलबुले द्वारा तय दूरी d मापें)',
    ],
    controls: [
      {
        id: 'windSpeed',
        label: 'Environment / Wind Condition (वायु गति स्तर)',
        symbol: 'W',
        unit: 'level',
        min: 1,
        max: 3,
        step: 1,
        defaultValue: 2,
      },
      {
        id: 'timePotometer',
        label: 'Observation Time t (समय)',
        symbol: 't',
        unit: 'min',
        min: 2,
        max: 10,
        step: 2,
        defaultValue: 5,
      },
    ],
    observationColumns: [
      { key: 'condition', label: 'Condition Level', unit: '' },
      { key: 'time', label: 'Time (t)', unit: 'min' },
      { key: 'distance', label: 'Bubble Distance (d)', unit: 'mm' },
      { key: 'rate', label: 'Rate (v = d/t)', unit: 'mm/min' },
    ],
    defaultReferenceRows: [
      { condition: 'Level 1 (शांत कक्ष / Shade)', time: '5 min', distance: '15 mm', rate: '3.0 mm/min' },
      { condition: 'Level 2 (सामान्य प्रकाश / Normal)', time: '5 min', distance: '30 mm', rate: '6.0 mm/min' },
      { condition: 'Level 3 (तेज धूप व पंखा / Windy)', time: '5 min', distance: '45 mm', rate: '9.0 mm/min' },
    ],
    calculationChallenge: {
      question:
        'प्रश्न: पोटोमीटर की केशिका नली में वायु का बुलबुला t = 5 मिनट में d = 30 mm दूरी तय करता है। वाष्पोत्सर्जन की दर (v = d / t) कितने mm/min होगी?',
      formulaUsed: 'v = d / t',
      givenValues: 'd = 30 mm, t = 5 min',
      expectedNumericAnswer: 6,
      tolerance: 0.2,
      unit: 'mm/min',
      stepByStepSolution: 'वाष्पोत्सर्जन दर v = d / t = 30 mm / 5 min = 6 mm/min।',
    },
    resultStatement:
      'गैनोंग पोटोमीटर द्वारा सामान्य अवस्था में वाष्पोत्सर्जन की दर 6.0 mm/min प्राप्त हुई तथा वायु गति बढ़ने पर यह दर बढ़ जाती है।',
    precautions: [
      'पौधे की टहनी को सदैव जल के अंदर ही तिरछा काटें ताकि जाइलम वाहिनियों में वायु न घुसे।',
      'पूरा उपकरण पूर्णतः वायुरोधी (Airtight) होना चाहिए।',
    ],
  },

  // ============================================================================
  // 12. BIOLOGY - CLASS 12: MITOSIS IN ONION ROOT TIP & MITOTIC INDEX
  // ============================================================================
  {
    id: 'exp-bio-12-mitosis',
    name: 'Mitosis in Onion Root Tip & Mitotic Index',
    hindiName: 'Mitosis Lab — प्याज के मूलाग्र में समसूत्री विभाजन',
    subject: 'Biology',
    class: '12',
    chapter: 'Cell Cycle, Genetics & Molecular Biology',
    simulatorType: 'mitosis_dna',
    objective:
      'प्याज के मूलाग्र (Onion Root Tip) की अस्थायी स्लाइड बनाकर समसूत्री कोशिका विभाजन (Mitosis: Prophase, Metaphase, Anaphase, Telophase) की अवस्थाओं का अध्ययन करना और माइटोटिक इंडेक्स (Mitotic Index) ज्ञात करना।',
    equipment: [
      {
        id: 'eq-roottip',
        name: 'Onion Bulb Root Tips (Allium cepa, 2n=16)',
        hindiName: 'प्याज की जड़ के अग्रभाग (Root Tips)',
        purpose: 'तेजी से विभाजित होती विभज्योतक (Meristematic) कोशिकाएँ प्राप्त करने के लिए।',
      },
      {
        id: 'eq-acetocarmine',
        name: 'Acetocarmine Stain & 1N HCl',
        hindiName: 'एसिटोकार्मिन अभिरंजक एवं 1N HCl',
        purpose: 'कोशिका भित्ति को मुलायम करने और गुणसूत्रों को गहरा गुलाबी-लाल रंगने के लिए।',
      },
      {
        id: 'eq-slide',
        name: 'Glass Slide, Coverslip & Spirit Lamp',
        hindiName: 'काँच की स्लाइड, कवरस्लिप व स्पिरिट लैंप',
        purpose: 'स्क्वैश (Squash) विधि से एक-कोशिकीय परत तैयार करने के लिए।',
      },
      {
        id: 'eq-comp-micro',
        name: 'Compound Microscope (10X & 45X Objective)',
        hindiName: 'संयुक्त सूक्ष्मदर्शी (450X आवर्धन)',
        purpose: 'विभाजन की विभिन्न अवस्थाओं और गुणसूत्रों को गिनने के लिए।',
      },
    ],
    theory: [
      'समसूत्री विभाजन (Mitosis) में एक मातृ कोशिका विभाजित होकर दो समान संतति कोशिकाएँ बनाती है जिनमें गुणसूत्रों की संख्या (प्याज में 2n = 16) समान रहती है।',
      'इसकी चार मुख्य अवस्थाएँ हैं: पूर्वावस्था (Prophase), मध्यावस्था (Metaphase - गुणसूत्र मध्य रेखा पर), पश्चावस्था (Anaphase - अर्धगुणसूत्र ध्रुवों की ओर V/J/L/I आकार में) और अंत्यावस्था (Telophase)।',
      'माइटोटिक इंडेक्स (Mitotic Index) = (विभाजित हो रही कोशिकाओं की संख्या / कुल निरीक्षित कोशिकाओं की संख्या) × 100।',
    ],
    formula: 'Mitotic Index (MI) = (N_dividing / N_total) × 100',
    formulaExplanation: 'N_dividing = विभाजन अवस्था (P+M+A+T) की कोशिकाएँ, N_total = कुल कोशिकाएँ',
    connectionSteps: [
      'Hydrolysis in 1N HCl (मूलाग्र को 1N HCl में डालकर हल्का गर्म करें ताकि मध्य पटलिका घुल जाए)',
      'Acetocarmine Staining (स्लाइड पर मूलाग्र रखकर एसिटोकार्मिन की बूँदें डालें)',
      'Squash Preparation (कवरस्लिप रखकर पेंसिल के रबर से हल्का दबाएँ ताकि कोशिकाएँ फैल जाएँ)',
      'Mount on Microscope (स्लाइड को सूक्ष्मदर्शी के स्टेज पर क्लिप से स्थिर करें)',
      'Focus High Power 45X (10X से 45X लेंस पर घुमाकर विभाजित कोशिकाओं की गणना करें)',
    ],
    controls: [
      {
        id: 'dividingCells',
        label: 'Dividing Cells Count N_d (विभाजित कोशिकाएँ)',
        symbol: 'N_d',
        unit: 'cells',
        min: 10,
        max: 40,
        step: 5,
        defaultValue: 25,
      },
      {
        id: 'totalCells',
        label: 'Total Cells in Field N_t (कुल कोशिकाएँ)',
        symbol: 'N_t',
        unit: 'cells',
        min: 50,
        max: 100,
        step: 50,
        defaultValue: 100,
      },
    ],
    observationColumns: [
      { key: 'total', label: 'Total Cells (N_t)', unit: '' },
      { key: 'interphase', label: 'Interphase Cells', unit: '' },
      { key: 'dividing', label: 'Dividing Cells (P+M+A+T)', unit: '' },
      { key: 'mi', label: 'Mitotic Index (%)', unit: '%' },
    ],
    defaultReferenceRows: [
      { total: '100', interphase: '80', dividing: '20', mi: '20.0%' },
      { total: '100', interphase: '75', dividing: '25', mi: '25.0%' },
      { total: '100', interphase: '70', dividing: '30', mi: '30.0%' },
    ],
    calculationChallenge: {
      question:
        'प्रश्न: सूक्ष्मदर्शी के दृश्य क्षेत्र में कुल N_total = 100 कोशिकाएँ दिखाई दे रही हैं जिनमें से 25 कोशिकाएँ समसूत्री विभाजन (N_dividing = 25) की अवस्था में हैं। माइटोटिक इंडेक्स (MI %) कितना होगा?',
      formulaUsed: 'MI = (N_dividing / N_total) × 100',
      givenValues: 'N_dividing = 25, N_total = 100',
      expectedNumericAnswer: 25,
      tolerance: 0.5,
      unit: '%',
      stepByStepSolution: 'माइटोटिक इंडेक्स (MI) = (25 / 100) × 100 = 25%।',
    },
    resultStatement:
      'प्याज के मूलाग्र में समसूत्री विभाजन की सभी चारों अवस्थाओं का स्पष्ट प्रेक्षण हुआ तथा माइटोटिक इंडेक्स 25% प्राप्त हुआ।',
    precautions: [
      'प्याज के मूलाग्र को सुबह के समय (प्रातः 7 से 9 बजे के बीच) काटना चाहिए जब कोशिका विभाजन सर्वाधिक सक्रिय होता है।',
      'स्लाइड को उबालें नहीं, केवल हल्का गर्म (Warm) करें।',
    ],
  },

  // ============================================================================
  // 13. GENERAL SCIENCE / PRACTICAL SKILLS: VERNIER CALLIPERS & PRECISION MEASUREMENT
  // ============================================================================
  {
    id: 'exp-gsc-10-vernier',
    name: 'Vernier Callipers & Screw Gauge Precision Lab',
    hindiName: 'Vernier Callipers — वर्नियर कैलिपर्स द्वारा सूक्ष्म मापन',
    subject: 'General Science',
    class: '10',
    chapter: 'Practical Skills & Laboratory Measurement',
    simulatorType: 'vernier_screw',
    objective:
      'वर्नियर कैलिपर्स का अल्पतमांक (Least Count = 0.01 cm) ज्ञात करना तथा उसकी सहायता से किसी गोले या बेलन का व्यास सटीकता से मापना।',
    equipment: [
      {
        id: 'eq-vernier',
        name: 'Standard Vernier Callipers (LC = 0.01 cm)',
        hindiName: 'वर्नियर कैलिपर्स (अल्पतमांक 0.01 cm)',
        purpose: 'मुख्य पैमाना (MSR) और वर्नियर संपाती चिह्न (VSC) से सूक्ष्म लंबाई/व्यास मापने के लिए।',
      },
      {
        id: 'eq-sphere',
        name: 'Metallic Sphere / Cylinder Specimen',
        hindiName: 'धातु का गोला / बेलन',
        purpose: 'बाह्य जबड़ों के बीच फँसाकर व्यास मापने के लिए।',
      },
      {
        id: 'eq-magnifier',
        name: 'Reading Magnifying Lens',
        hindiName: 'आवर्धक लेंस (Magnifier)',
        purpose: 'संपाती वर्नियर चिह्न को बिना लंबन त्रुटि (Parallax Error) के देखने के लिए।',
      },
    ],
    theory: [
      'वर्नियर कैलिपर्स का अल्पतमांक (Least Count) = 1 मुख्य पैमाना भाग (1 MSD) - 1 वर्नियर पैमाना भाग (1 VSD) = 0.1 cm / 10 = 0.01 cm (या 0.1 mm)।',
      'कुल पाठ्यांक (Total Reading) = मुख्य पैमाना पाठ्यांक (MSR) + [वर्नियर संपाती चिह्न (VSC) × अल्पतमांक (LC)]।',
    ],
    formula: 'Total Reading = MSR + (VSC × LC)',
    formulaExplanation: 'MSR = मुख्य स्केल पाठ्यांक (cm), VSC = वर्नियर संपाती भाग, LC = 0.01 cm',
    connectionSteps: [
      'Zero Error Check (दोनों बाह्य जबड़ों को मिलाकर शून्यांक त्रुटि की जाँच करें)',
      'Place Metallic Sphere (धातु के गोले को बाह्य जबड़ों J₁ व J₂ के बीच हल्के से कसें)',
      'Lock clamping screw (क्लैंपिंग पेंच को कसें ताकि जबड़ा हिले नहीं)',
      'Read Main Scale MSR (वर्नियर के शून्य से ठीक पहले मुख्य स्केल पाठ्यांक नोट करें)',
      'Read Vernier Coincidence VSC (मुख्य स्केल की रेखा से ठीक मिलने वाला वर्नियर चिह्न नोट करें)',
    ],
    controls: [
      {
        id: 'msr',
        label: 'Main Scale Reading MSR (मुख्य पैमाना)',
        symbol: 'MSR',
        unit: 'cm',
        min: 1.0,
        max: 3.0,
        step: 0.5,
        defaultValue: 2.0,
      },
      {
        id: 'vsc',
        label: 'Vernier Coincidence VSC (वर्नियर संपाती भाग)',
        symbol: 'n',
        unit: 'div',
        min: 0,
        max: 9,
        step: 1,
        defaultValue: 4,
      },
    ],
    observationColumns: [
      { key: 'msr', label: 'Main Scale (MSR)', unit: 'cm' },
      { key: 'vsc', label: 'Vernier Coincidence (n)', unit: 'div' },
      { key: 'vcValue', label: 'n × LC (0.01 cm)', unit: 'cm' },
      { key: 'totalD', label: 'Total Diameter (D)', unit: 'cm' },
    ],
    defaultReferenceRows: [
      { msr: '1.5 cm', vsc: '6 div', vcValue: '0.06 cm', totalD: '1.56 cm' },
      { msr: '2.0 cm', vsc: '4 div', vcValue: '0.04 cm', totalD: '2.04 cm' },
      { msr: '2.5 cm', vsc: '8 div', vcValue: '0.08 cm', totalD: '2.58 cm' },
    ],
    calculationChallenge: {
      question:
        'प्रश्न: वर्नियर कैलिपर्स (अल्पतमांक LC = 0.01 cm) में यदि मुख्य स्केल पाठ्यांक MSR = 2.0 cm है और वर्नियर का 4था चिह्न (n = 4) संपाती है, तो कुल व्यास कितना होगा?',
      formulaUsed: 'D = MSR + (n × LC)',
      givenValues: 'MSR = 2.0 cm, n = 4, LC = 0.01 cm',
      expectedNumericAnswer: 2.04,
      tolerance: 0.005,
      unit: 'cm',
      stepByStepSolution: 'कुल व्यास D = 2.0 + (4 × 0.01) = 2.0 + 0.04 = 2.04 cm।',
    },
    resultStatement:
      'वर्नियर कैलिपर्स (LC = 0.01 cm) द्वारा दिए गए धातु के गोले का व्यास D = 2.04 cm सटीकता से प्राप्त हुआ।',
    precautions: [
      'वस्तु को जबड़ों के बीच अत्यधिक बल लगाकर न दबाएँ।',
      'पाठ्यांक लेते समय दृष्टि रेखा को पैमाने के ठीक लंबवत रखें ताकि लंबन त्रुटि (Parallax Error) न हो।',
    ],
  },
];
