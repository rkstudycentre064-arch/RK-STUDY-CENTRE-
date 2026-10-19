import type {
  DifficultyLevel,
  LabClassLevel,
  LabSubject,
  QuestionType,
  VirtualLabQuestion,
} from './virtualLabExperimentsData';

const QUESTION_TYPES_CYCLE: QuestionType[] = [
  'MCQ',
  'True/False',
  'Fill in the Blank',
  'Numerical',
  'Observation Based',
  'Conceptual',
  'Practical Situation',
  'Experiment Prediction',
];

const DIFFICULTY_CYCLE: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];

function pad3(n: number): string {
  return String(n).padStart(3, '0');
}

// ============================================================================
// 1. PHYSICS — 300 QUESTIONS (Class 9: 75, Class 10: 75, Class 11: 75, Class 12: 75)
// ============================================================================
function buildPhysics300Questions(): VirtualLabQuestion[] {
  const list: VirtualLabQuestion[] = [];
  let seq = 1;

  const pushQ = (q: Omit<VirtualLabQuestion, 'id' | 'subject'>) => {
    list.push({
      id: `PHY-${pad3(seq++)}`,
      subject: 'Physics',
      ...q,
    });
  };

  // --- CLASS 10 PHYSICS: 75 QUESTIONS (Starts with exact PHY-001 from specification) ---
  // 1. Exact PHY-001
  pushQ({
    class: '10',
    chapter: 'Electricity',
    experiment: "Ohm's Law",
    type: 'MCQ',
    difficulty: 'Easy',
    question: 'ओम के नियम के अनुसार V और I के बीच क्या संबंध है?',
    options: ['V = IR', 'V = I/R', 'V = R/I', 'V = I + R'],
    answer: 'V = IR',
    explanation: 'ओम के नियम के अनुसार नियत तापमान पर V = IR होता है।',
    hint: 'विभवांतर (V) विद्युत धारा (I) और प्रतिरोध (R) के गुणनफल के बराबर होता है।',
    marks: 1,
  });

  // 2. Exact Conceptual example from prompt
  pushQ({
    class: '10',
    chapter: 'Electricity',
    experiment: "Ohm's Law",
    type: 'Conceptual',
    difficulty: 'Easy',
    question: 'ओम के नियम के प्रयोग में यदि प्रतिरोध नियत रखकर voltage (V) बढ़ाया जाए तो current (I) पर क्या प्रभाव पड़ेगा?',
    options: [
      'विद्युत धारा (Current) समानुपाती रूप से बढ़ेगी',
      'विद्युत धारा घट जाएगी',
      'विद्युत धारा शून्य हो जाएगी',
      'विद्युत धारा अपरिवर्तित रहेगी',
    ],
    answer: 'विद्युत धारा (Current) समानुपाती रूप से बढ़ेगी',
    explanation: 'नियत तापमान और प्रतिरोध पर I = V/R होता है, अतः V बढ़ाने पर धारा (I) समानुपाती रूप से बढ़ती है।',
    hint: 'ओम के नियम में V ∝ I होता है।',
    marks: 1,
  });

  // 3. Exact Experiment Prediction example from prompt
  pushQ({
    class: '10',
    chapter: 'Electricity',
    experiment: "Ohm's Law",
    type: 'Experiment Prediction',
    difficulty: 'Medium',
    question:
      'ओम के नियम के परिपथ में 5 V बैटरी और 10 Ω प्रतिरोधक जुड़ा है। Switch ON करने से पहले बताइए स्विच बंद (ON) करते ही एमीटर (Ammeter) में क्या reading आएगी?',
    options: ['0.50 A', '2.00 A', '50.0 A', '0.05 A'],
    answer: '0.50 A',
    explanation: 'स्विच ON करने पर परिपथ पूर्ण होगा और I = V / R = 5 V / 10 Ω = 0.50 A धारा प्रवाहित होगी।',
    hint: 'सूत्र I = V / R में V = 5 और R = 10 रखें।',
    marks: 1,
  });

  // 4–28: 25 Ohm's Law Observation/Numerical/Practical/True-False/Fill-in-the-blank variations for Class 10
  const c10OhmsPairs: [number, number][] = [
    [1, 10],
    [2, 10],
    [3, 10],
    [4, 10],
    [6, 10],
    [8, 10],
    [9, 10],
    [10, 10],
    [2, 5],
    [4, 5],
    [6, 5],
    [8, 5],
    [10, 5],
    [3, 15],
    [6, 15],
    [9, 15],
    [12, 15],
    [4, 20],
    [8, 20],
    [12, 20],
    [16, 20],
    [5, 25],
    [10, 25],
    [15, 25],
    [20, 25],
  ];

  c10OhmsPairs.forEach(([v, r], idx) => {
    const iVal = (v / r).toFixed(2);
    const qType = QUESTION_TYPES_CYCLE[idx % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[idx % 3];

    if (qType === 'True/False') {
      pushQ({
        class: '10',
        chapter: 'Electricity',
        experiment: "Ohm's Law",
        type: 'True/False',
        difficulty: diff,
        question: `सत्य या असत्य: ओम के नियम के वर्चुअल लैब प्रयोग में यदि विभवांतर V = ${v} V और प्रतिरोध R = ${r} Ω हो, तो एमीटर का पाठ्यांक ${iVal} A होगा।`,
        options: ['सत्य (True)', 'असत्य (False)'],
        answer: 'सत्य (True)',
        explanation: `सूत्र I = V/R के अनुसार ${v} V / ${r} Ω = ${iVal} A होता है, अतः कथन सत्य है।`,
        hint: `विभवांतर ${v} को प्रतिरोध ${r} से भाग देकर जाँच करें।`,
        marks: 1,
      });
    } else if (qType === 'Fill in the Blank') {
      pushQ({
        class: '10',
        chapter: 'Electricity',
        experiment: "Ohm's Law",
        type: 'Fill in the Blank',
        difficulty: diff,
        question: `रिक्त स्थान भरें: जब ${r} Ω के प्रतिरोधक के सिरों पर ${v} V विभवांतर लगाया जाता है, तो परिपथ में प्रवाहित धारा ________ होती है।`,
        options: [`${iVal} A`, `${(v * r).toFixed(1)} A`, `${(r / v).toFixed(2)} A`, `0.00 A`],
        answer: `${iVal} A`,
        explanation: `I = V / R = ${v} / ${r} = ${iVal} A।`,
        hint: `धारा का मान निकालने के लिए V को R से विभाजित करें।`,
        marks: 1,
      });
    } else if (qType === 'Observation Based') {
      pushQ({
        class: '10',
        chapter: 'Electricity',
        experiment: "Ohm's Law",
        type: 'Observation Based',
        difficulty: diff,
        question: `वर्चुअल लैब प्रेक्षण तालिका में एक विद्यार्थी ने वोल्टमीटर में V = ${v} V और एमीटर में I = ${iVal} A नोट किया। तार का प्रतिरोध (R = V/I) कितना है?`,
        options: [`${r} Ω`, `${r * 2} Ω`, `${(r / 2).toFixed(1)} Ω`, `${v + r} Ω`],
        answer: `${r} Ω`,
        explanation: `प्रेक्षण से R = V / I = ${v} V / ${iVal} A = ${r} Ω प्राप्त होता है।`,
        hint: `वोल्टमीटर के पाठ्यांक को एमीटर के पाठ्यांक से भाग दें।`,
        marks: 1,
      });
    } else {
      pushQ({
        class: '10',
        chapter: 'Electricity',
        experiment: "Ohm's Law",
        type: qType,
        difficulty: diff,
        question: `ओम के नियम प्रयोग (प्रेक्षण #${idx + 1}): यदि बैटरी स्लाइडर V = ${v} V और प्रतिरोध R = ${r} Ω पर सेट है, तो विद्युत धारा (I) और विद्युत शक्ति (P = V×I) का सही युग्म क्या होगा?`,
        options: [
          `I = ${iVal} A, P = ${(v * Number(iVal)).toFixed(2)} W`,
          `I = ${(v * r).toFixed(1)} A, P = ${v} W`,
          `I = ${(r / v).toFixed(2)} A, P = ${r} W`,
          `I = 0.00 A, P = ${(v + r).toFixed(2)} W`,
        ],
        answer: `I = ${iVal} A, P = ${(v * Number(iVal)).toFixed(2)} W`,
        explanation: `I = V/R = ${v}/${r} = ${iVal} A तथा शक्ति P = V × I = ${v} × ${iVal} = ${(v * Number(iVal)).toFixed(2)} W।`,
        hint: `पहले I = V/R निकालें और फिर P = V×I से गुणा करें।`,
        marks: 1,
      });
    }
  });

  // 29–55: 27 Class 10 Optics (Convex Lens & Concave Mirror Focal Length) Lab Questions
  const c10OpticsCases: [number, number, string][] = [
    [30, 15, 'वास्तविक, उल्टा और समान आकार का (v = +30 cm)'],
    [20, 10, 'वास्तविक, उल्टा और समान आकार का (v = +20 cm)'],
    [40, 20, 'वास्तविक, उल्टा और समान आकार का (v = +40 cm)'],
    [30, 10, 'वास्तविक, उल्टा और छोटा (v = +15 cm)'],
    [60, 15, 'वास्तविक, उल्टा और छोटा (v = +20 cm)'],
    [45, 15, 'वास्तविक, उल्टा और छोटा (v = +22.5 cm)'],
    [20, 15, 'वास्तविक, उल्टा और आवर्धित (v = +60 cm)'],
    [25, 15, 'वास्तविक, उल्टा और आवर्धित (v = +37.5 cm)'],
    [15, 10, 'वास्तविक, उल्टा और आवर्धित (v = +30 cm)'],
    [12, 10, 'वास्तविक, उल्टा और आवर्धित (v = +60 cm)'],
    [24, 12, 'वास्तविक, उल्टा और समान आकार का (v = +24 cm)'],
    [36, 12, 'वास्तविक, उल्टा और छोटा (v = +18 cm)'],
    [18, 12, 'वास्तविक, उल्टा और आवर्धित (v = +36 cm)'],
    [50, 25, 'वास्तविक, उल्टा और समान आकार का (v = +50 cm)'],
    [16, 8, 'वास्तविक, उल्टा और समान आकार का (v = +16 cm)'],
    [24, 8, 'वास्तविक, उल्टा और छोटा (v = +12 cm)'],
    [12, 8, 'वास्तविक, उल्टा और आवर्धित (v = +24 cm)'],
    [28, 14, 'वास्तविक, उल्टा और समान आकार का (v = +28 cm)'],
    [42, 14, 'वास्तविक, उल्टा और छोटा (v = +21 cm)'],
    [21, 14, 'वास्तविक, उल्टा और आवर्धित (v = +42 cm)'],
    [32, 16, 'वास्तविक, उल्टा और समान आकार का (v = +32 cm)'],
    [48, 16, 'वास्तविक, उल्टा और छोटा (v = +24 cm)'],
    [24, 16, 'वास्तविक, उल्टा और आवर्धित (v = +48 cm)'],
    [35, 10, 'वास्तविक, उल्टा और छोटा (v = +14 cm)'],
    [40, 10, 'वास्तविक, उल्टा और छोटा (v = +13.3 cm)'],
    [50, 10, 'वास्तविक, उल्टा और छोटा (v = +12.5 cm)'],
    [60, 20, 'वास्तविक, उल्टा और छोटा (v = +30 cm)'],
  ];

  c10OpticsCases.forEach(([uAbs, fVal, expectedDesc], idx) => {
    const vVal = ((uAbs * fVal) / (uAbs - fVal)).toFixed(1).replace(/\.0$/, '');
    const qType = QUESTION_TYPES_CYCLE[(idx + 2) % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[idx % 3];

    pushQ({
      class: '10',
      chapter: 'Light - Reflection and Refraction',
      experiment: 'Focal Length of Convex Lens',
      type: qType,
      difficulty: diff,
      question: `प्रकाशिकी प्रयोगशाला में ${fVal} cm फोकस दूरी वाले उत्तल लेंस के सामने वस्तु u = -${uAbs} cm दूरी पर रखी है। पर्दे पर स्पष्ट प्रतिबिंब की स्थिति और प्रकृति क्या होगी?`,
      options: [
        expectedDesc,
        `आभासी, सीधा और छोटा (v = -${vVal} cm)`,
        `लेंस के प्रकाशिक केंद्र पर (v = 0 cm)`,
        `पर्दे पर कभी प्राप्त नहीं किया जा सकता (v = -${fVal} cm)`,
      ],
      answer: expectedDesc,
      explanation: `लेंस सूत्र 1/v - 1/u = 1/f से: 1/v = 1/${fVal} - 1/${uAbs} = (${uAbs} - ${fVal})/(${uAbs * fVal}), अतः v = +${vVal} cm (${expectedDesc})।`,
      hint: `लेंस सूत्र 1/v = 1/f + 1/u में u = -${uAbs} cm और f = +${fVal} cm रखें।`,
      marks: 1,
    });
  });

  // 56–75: 20 Class 10 Series/Parallel Resistors, Magnetic Effect & Prism Refraction Lab Questions
  for (let k = 1; k <= 20; k++) {
    const r1 = k + 2;
    const r2 = (k + 2) * 2;
    const rSeries = r1 + r2;
    const rParallel = ((r1 * r2) / (r1 + r2)).toFixed(2);
    const qType = QUESTION_TYPES_CYCLE[k % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[k % 3];

    pushQ({
      class: '10',
      chapter: 'Electricity & Magnetic Effects',
      experiment: 'Series and Parallel Combination of Resistors',
      type: qType,
      difficulty: diff,
      question: `प्रतिरोध संयोजन प्रयोग #${k}: यदि दो प्रतिरोधक R₁ = ${r1} Ω और R₂ = ${r2} Ω को पहले श्रेणीक्रम (R_s) और फिर समांतर क्रम (R_p) में जोड़ा जाए, तो तुल्य प्रतिरोध के मान क्या होंगे?`,
      options: [
        `R_s = ${rSeries} Ω तथा R_p = ${rParallel} Ω`,
        `R_s = ${rParallel} Ω तथा R_p = ${rSeries} Ω`,
        `R_s = ${r1 * r2} Ω तथा R_p = ${r2 - r1} Ω`,
        `R_s = ${r1} Ω तथा R_p = ${r2} Ω`,
      ],
      answer: `R_s = ${rSeries} Ω तथा R_p = ${rParallel} Ω`,
      explanation: `श्रेणीक्रम में R_s = R₁ + R₂ = ${r1} + ${r2} = ${rSeries} Ω तथा समांतर क्रम में R_p = (R₁×R₂)/(R₁+R₂) = ${rParallel} Ω होता है।`,
      hint: `श्रेणीक्रम के लिए सीधा योग करें और समांतर क्रम के लिए (R₁R₂)/(R₁+R₂) सूत्र लगाएँ।`,
      marks: 1,
    });
  }

  // --- CLASS 9 PHYSICS: 75 QUESTIONS (Archimedes' Principle, Density, Sound Reflection, Force & Work) ---
  for (let i = 1; i <= 40; i++) {
    const wAir = 120 + i * 10;
    const dispVol = 20 + i * 2;
    const wWater = wAir - dispVol;
    const qType = QUESTION_TYPES_CYCLE[i % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];

    pushQ({
      class: '9',
      chapter: 'Floatation & Gravitation',
      experiment: "Archimedes' Principle",
      type: qType,
      difficulty: diff,
      question: `आर्किमिडीज सिद्धांत प्रेक्षण #${i}: कमानीदार तुला पर किसी ठोस गुटके का वायु में भार W₁ = ${wAir} gwt है। इसे शुद्ध जल (घनत्व = 1 g/cm³) में पूर्णतः डुबोने पर ${dispVol} mL जल विस्थापित होता है। जल में गुटके का आभासी भार (W₂) और उत्प्लावन बल क्या होगा?`,
      options: [
        `आभासी भार W₂ = ${wWater} gwt, उत्प्लावन बल = ${dispVol} gwt`,
        `आभासी भार W₂ = ${wAir + dispVol} gwt, उत्प्लावन बल = ${wAir} gwt`,
        `आभासी भार W₂ = ${dispVol} gwt, उत्प्लावन बल = ${wWater} gwt`,
        `आभासी भार W₂ = ${wAir} gwt, उत्प्लावन बल = 0 gwt`,
      ],
      answer: `आभासी भार W₂ = ${wWater} gwt, उत्प्लावन बल = ${dispVol} gwt`,
      explanation: `1 g/cm³ घनत्व वाले जल के ${dispVol} mL का भार = ${dispVol} gwt = उत्प्लावन बल। अतः जल में आभासी भार W₂ = W₁ - ΔW = ${wAir} - ${dispVol} = ${wWater} gwt।`,
      hint: `वायु के भार W₁ में से विस्थापित जल का भार (${dispVol} gwt) घटाएँ।`,
      marks: 1,
    });
  }

  for (let i = 1; i <= 35; i++) {
    const angleInc = 15 + i;
    const speedSound = 330 + (i % 15);
    const qType = QUESTION_TYPES_CYCLE[(i + 3) % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];

    if (i <= 20) {
      pushQ({
        class: '9',
        chapter: 'Sound',
        experiment: 'Laws of Reflection of Sound',
        type: qType,
        difficulty: diff,
        question: `ध्वनि परावर्तन नलिका प्रयोग #${i}: यदि ध्वनि स्रोत वाली नलिका अभिलंब के साथ आपतन कोण ∠i = ${angleInc}° बनाती है, तो स्टॉपवॉच की अधिकतम टिक-टिक ध्वनि सुनने के लिए दूसरी नलिका को किस परावर्तन कोण (∠r) पर रखना होगा?`,
        options: [
          `∠r = ${angleInc}° (अभिलंब के दूसरी ओर उसी तल में)`,
          `∠r = ${90 - angleInc}°`,
          `∠r = ${angleInc * 2}°`,
          `∠r = 0° (अभिलंब के अनुदिश)`,
        ],
        answer: `∠r = ${angleInc}° (अभिलंब के दूसरी ओर उसी तल में)`,
        explanation: `ध्वनि के परावर्तन के नियम के अनुसार आपतन कोण सदैव परावर्तन कोण के बराबर होता है (∠i = ∠r = ${angleInc}°)।`,
        hint: `ध्वनि परावर्तन में ∠i = ∠r होता है।`,
        marks: 1,
      });
    } else {
      const massG = (i - 15) * 25;
      const volCm3 = (i - 15) * 10;
      const density = (massG / volCm3).toFixed(2);
      pushQ({
        class: '9',
        chapter: 'Motion, Force and Density',
        experiment: 'Determination of Density of Solid',
        type: qType,
        difficulty: diff,
        question: `ठोस का घनत्व प्रयोग #${i - 20}: एक धातु के टुकड़े का द्रव्यमान m = ${massG} g है और मापक बेलन में डुबोने पर जल का स्तर ${volCm3} mL बढ़ जाता है। ठोस का घनत्व (ρ = m/V) और आपेक्षिक घनत्व क्या है?`,
        options: [
          `घनत्व = ${density} g/cm³, आपेक्षिक घनत्व = ${density}`,
          `घनत्व = ${(volCm3 / massG).toFixed(2)} g/cm³, आपेक्षिक घनत्व = 1.0`,
          `घनत्व = ${massG + volCm3} g/cm³, आपेक्षिक घनत्व = ${massG}`,
          `घनत्व = ${massG * volCm3} g/cm³, आपेक्षिक घनत्व = ${volCm3}`,
        ],
        answer: `घनत्व = ${density} g/cm³, आपेक्षिक घनत्व = ${density}`,
        explanation: `घनत्व ρ = द्रव्यमान / आयतन = ${massG} g / ${volCm3} cm³ = ${density} g/cm³। जल के सापेक्ष आपेक्षिक घनत्व = ${density} (मात्रकहीन)।`,
        hint: `द्रव्यमान (m) को विस्थापित आयतन (V) से भाग दें।`,
        marks: 1,
      });
    }
  }

  // --- CLASS 11 PHYSICS: 75 QUESTIONS (Simple Pendulum, Vernier Callipers, Screw Gauge, Hooke's Law, Spherometer) ---
  for (let i = 1; i <= 38; i++) {
    const lengthCm = 35 + i * 3;
    const lengthM = lengthCm / 100;
    const periodT = (2 * Math.PI * Math.sqrt(lengthM / 9.8)).toFixed(2);
    const time20 = (Number(periodT) * 20).toFixed(1);
    const qType = QUESTION_TYPES_CYCLE[i % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];

    pushQ({
      class: '11',
      chapter: 'Oscillations',
      experiment: 'Simple Pendulum (L-T² Graph)',
      type: qType,
      difficulty: diff,
      question: `सरल लोलक प्रयोग #${i}: जब लोलक की प्रभावी लंबाई L = ${lengthCm} cm (${lengthM.toFixed(2)} m) रखी जाती है, तो g = 9.8 m/s² पर 20 दोलनों का समय (t) लगभग ${time20} s आता है। इस लंबाई पर लोलक का आवर्तकाल (T) कितना होगा?`,
      options: [
        `T = ${periodT} s`,
        `T = ${(Number(periodT) * 2).toFixed(2)} s`,
        `T = ${(Number(periodT) / 2).toFixed(2)} s`,
        `T = ${time20} s`,
      ],
      answer: `T = ${periodT} s`,
      explanation: `T = 2π√(L/g) = t / 20 = ${time20} / 20 = ${periodT} s।`,
      hint: `20 दोलनों के कुल समय (${time20} s) को 20 से भाग दें।`,
      marks: 1,
    });
  }

  for (let i = 1; i <= 37; i++) {
    const msrMm = 2 + Math.floor(i / 4);
    const csrDiv = (i * 7) % 100;
    const totalMm = (msrMm + csrDiv * 0.01).toFixed(2);
    const qType = QUESTION_TYPES_CYCLE[(i + 4) % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];

    pushQ({
      class: '11',
      chapter: 'Units and Measurements',
      experiment: 'Screw Gauge & Vernier Callipers',
      type: qType,
      difficulty: diff,
      question: `स्क्रू गेज (अल्पतमांक LC = 0.01 mm) प्रेक्षण #${i}: किसी तार का व्यास मापते समय मुख्य पैमाना पाठ्यांक MSR = ${msrMm} mm और वृत्तीय पैमाने का संपाती भाग CSR = ${csrDiv} है (शून्यांक त्रुटि = 0)। तार का सही व्यास क्या है?`,
      options: [
        `${totalMm} mm`,
        `${(msrMm + csrDiv * 0.1).toFixed(2)} mm`,
        `${msrMm}.00 mm`,
        `${(msrMm - csrDiv * 0.01).toFixed(2)} mm`,
      ],
      answer: `${totalMm} mm`,
      explanation: `कुल पाठ्यांक = MSR + (CSR × LC) = ${msrMm} mm + (${csrDiv} × 0.01 mm) = ${totalMm} mm।`,
      hint: `MSR में (CSR × 0.01) जोड़ें।`,
      marks: 1,
    });
  }

  // --- CLASS 12 PHYSICS: 75 QUESTIONS (Meter Bridge / Wheatstone Bridge, Potentiometer, Galvano Figure of Merit, PN Junction) ---
  for (let i = 1; i <= 40; i++) {
    const knownR = 2 + (i % 10);
    const balL = 20 + i * 1.5;
    const remL = 100 - balL;
    const unknownX = ((knownR * remL) / balL).toFixed(2);
    const qType = QUESTION_TYPES_CYCLE[i % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];

    pushQ({
      class: '12',
      chapter: 'Current Electricity',
      experiment: 'Meter Bridge (Wheatstone Principle)',
      type: qType,
      difficulty: diff,
      question: `मीटर सेतु प्रयोग #${i}: प्रतिरोध बॉक्स से R = ${knownR} Ω निकालने पर गैल्वेनोमीटर में शून्य विक्षेप (Null Point) सिरे A से l = ${balL} cm की दूरी पर प्राप्त होता है। दाएँ अंतराल में जुड़े अज्ञात प्रतिरोध X = R(100 - l)/l का मान क्या है?`,
      options: [
        `X = ${unknownX} Ω`,
        `X = ${((knownR * balL) / remL).toFixed(2)} Ω`,
        `X = ${(knownR + balL).toFixed(2)} Ω`,
        `X = ${(knownR * 2).toFixed(2)} Ω`,
      ],
      answer: `X = ${unknownX} Ω`,
      explanation: `व्हीटस्टोन सेतु सिद्धांत से X = R × (100 - l) / l = ${knownR} × (${remL} / ${balL}) = ${unknownX} Ω।`,
      hint: `सूत्र X = R × (100 - ${balL}) / ${balL} का प्रयोग करें।`,
      marks: 1,
    });
  }

  for (let i = 1; i <= 35; i++) {
    const l1 = 120 + i * 5;
    const l2 = 100 + i * 3;
    const ratio = (l1 / l2).toFixed(2);
    const qType = QUESTION_TYPES_CYCLE[(i + 1) % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];

    pushQ({
      class: '12',
      chapter: 'Current Electricity & Semiconductors',
      experiment: 'Potentiometer EMF Comparison',
      type: qType,
      difficulty: diff,
      question: `विभवमापी (Potentiometer) प्रयोग #${i}: लेक्लांशी सेल (E₁) के लिए संतुलन लंबाई l₁ = ${l1} cm और डेनियल सेल (E₂) के लिए संतुलन लंबाई l₂ = ${l2} cm प्राप्त होती है। दोनों सेलों के विद्युत वाहक बलों का अनुपात (E₁ / E₂) क्या होगा?`,
      options: [
        `E₁ / E₂ = ${ratio}`,
        `E₁ / E₂ = ${(l2 / l1).toFixed(2)}`,
        `E₁ / E₂ = ${l1 - l2}`,
        `E₁ / E₂ = 1.00`,
      ],
      answer: `E₁ / E₂ = ${ratio}`,
      explanation: `विभवमापी सिद्धांत से E₁ / E₂ = l₁ / l₂ = ${l1} / ${l2} = ${ratio}।`,
      hint: `पहली संतुलन लंबाई l₁ को दूसरी संतुलन लंबाई l₂ से विभाजित करें।`,
      marks: 1,
    });
  }

  return list;
}

// ============================================================================
// 2. CHEMISTRY — 300 QUESTIONS (Class 9: 75, Class 10: 75, Class 11: 75, Class 12: 75)
// ============================================================================
function buildChemistry300Questions(): VirtualLabQuestion[] {
  const list: VirtualLabQuestion[] = [];
  let seq = 1;

  const pushQ = (q: Omit<VirtualLabQuestion, 'id' | 'subject'>) => {
    list.push({
      id: `CHE-${pad3(seq++)}`,
      subject: 'Chemistry',
      ...q,
    });
  };

  // --- CLASS 9 CHEMISTRY: 75 QUESTIONS (Latent Heat, Boiling/Melting Point, Mixture vs Compound, Law of Conservation of Mass) ---
  for (let i = 1; i <= 40; i++) {
    const tempC = -10 + i * 3;
    const tempK = (tempC + 273.15).toFixed(2);
    const stateDesc =
      tempC < 0
        ? 'ठोस अवस्था (बर्फ)'
        : tempC === 0
        ? 'ठोस-द्रव साम्यावस्था (गलनांक 0°C)'
        : tempC < 100
        ? 'द्रव अवस्था (जल)'
        : tempC === 100
        ? 'द्रव-वाष्प साम्यावस्था (क्वथनांक 100°C)'
        : 'गैसीय/वाष्प अवस्था (भाप)';
    const qType = QUESTION_TYPES_CYCLE[i % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];

    pushQ({
      class: '9',
      chapter: 'Matter in Our Surroundings',
      experiment: 'Latent Heat & Boiling Point of Water',
      type: qType,
      difficulty: diff,
      question: `तापमान एवं अवस्था परिवर्तन प्रयोग #${i}: प्रयोगशाला थर्मामीटर में जल के नमूने का तापमान ${tempC}°C दर्ज किया गया। केल्विन पैमाने पर यह तापमान और 1 atm दाब पर जल की भौतिक अवस्था क्या होगी?`,
      options: [
        `${tempK} K — ${stateDesc}`,
        `${(tempC - 273.15).toFixed(2)} K — प्लाज्मा अवस्था`,
        `${tempC * 2} K — अतिशीतित ठोस`,
        `273.15 K — केवल शुष्क बर्फ`,
      ],
      answer: `${tempK} K — ${stateDesc}`,
      explanation: `केल्विन तापमान T(K) = T(°C) + 273.15 = ${tempC} + 273.15 = ${tempK} K। 1 atm पर ${tempC}°C पर जल '${stateDesc}' में रहता है।`,
      hint: `सेल्सियस तापमान में 273.15 जोड़ें और 0°C गलनांक व 100°C क्वथनांक से तुलना करें।`,
      marks: 1,
    });
  }

  for (let i = 1; i <= 35; i++) {
    const baCl2 = (2.0 + i * 0.2).toFixed(1);
    const na2so4 = (1.5 + i * 0.15).toFixed(2);
    const flaskMass = 50.0;
    const totalMass = (flaskMass + Number(baCl2) + Number(na2so4)).toFixed(2);
    const qType = QUESTION_TYPES_CYCLE[(i + 2) % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];

    pushQ({
      class: '9',
      chapter: 'Atoms and Molecules',
      experiment: 'Verification of Law of Conservation of Mass',
      type: qType,
      difficulty: diff,
      question: `द्रव्यमान संरक्षण नियम प्रयोग #${i}: ${flaskMass} g भार वाले शंक्वाकार फ्लास्क में ${baCl2} g बेरियम क्लोराइड (BaCl₂) और इग्निशन ट्यूब में ${na2so4} g सोडियम सल्फेट (Na₂SO₄) लेकर अभिक्रिया कराई गई (श्वेत अवक्षेप BaSO₄ बना)। अभिक्रिया के पश्चात संपूर्ण उपकरण का कुल द्रव्यमान क्या होगा?`,
      options: [
        `${totalMass} g (द्रव्यमान संरक्षित रहता है)`,
        `${(Number(totalMass) - 1.5).toFixed(2)} g (अवक्षेप बनने से भार घटता है)`,
        `${(Number(totalMass) + 2.0).toFixed(2)} g (नया उत्पाद बनने से भार बढ़ता है)`,
        `${baCl2} g`,
      ],
      answer: `${totalMass} g (द्रव्यमान संरक्षित रहता है)`,
      explanation: `द्रव्यमान संरक्षण के नियम (लवाइजिए) के अनुसार बंद तंत्र में अभिक्रिया से पूर्व और पश्चात कुल द्रव्यमान (${flaskMass} + ${baCl2} + ${na2so4} = ${totalMass} g) अपरिवर्तित रहता है।`,
      hint: `बंद फ्लास्क में अभिक्रिया से पहले और बाद का कुल द्रव्यमान बराबर होता है।`,
      marks: 1,
    });
  }

  // --- CLASS 10 CHEMISTRY: 75 QUESTIONS (pH Scale, Universal Indicator, Chemical Reactions, Reactivity Series, Saponification) ---
  const phSamples: [string, number, string, string][] = [
    ['तनु हाइड्रोक्लोरिक अम्ल (Dilute HCl 0.1M)', 1.0, 'गहरा लाल (Dark Red)', 'प्रबल अम्ल (Strong Acid)'],
    ['जठर रस (Gastric Juice)', 1.4, 'लाल (Red)', 'प्रबल अम्ल (Strong Acid)'],
    ['नींबू का रस (Lemon Juice)', 2.2, 'नारंगी-लाल (Orange-Red)', 'अम्लीय (Acidic)'],
    ['सिरका / एसिटिक अम्ल (Vinegar)', 3.0, 'नारंगी (Orange)', 'दुर्बल अम्ल (Weak Acid)'],
    ['टमाटर का रस (Tomato Juice)', 4.2, 'पीला-नारंगी (Orange-Yellow)', 'दुर्बल अम्ल (Weak Acid)'],
    ['काली कॉफी (Black Coffee)', 5.0, 'पीला (Yellow)', 'दुर्बल अम्ल (Weak Acid)'],
    ['ताजा दूध (Fresh Milk)', 6.5, 'हल्का हरा-पीला (Yellowish Green)', 'हल्का अम्लीय (Slightly Acidic)'],
    ['शुद्ध आसुत जल (Pure Distilled Water)', 7.0, 'हरा (Emerald Green)', 'उदासीन (Neutral)'],
    ['मानव रक्त (Human Blood)', 7.4, 'हरा-नीला (Bluish Green)', 'हल्का क्षारीय (Slightly Alkaline)'],
    ['बेकिंग सोडा विलयन (NaHCO₃ Solution)', 8.5, 'नीला (Cyan Blue)', 'दुर्बल क्षार (Weak Base)'],
    ['मिल्क ऑफ मैग्नीशिया Mg(OH)₂', 10.5, 'गहरा नीला (Navy Blue)', 'क्षारीय एंटासिड (Basic Antacid)'],
    ['अमोनिया विलयन (Household Ammonia)', 11.5, 'नीला-बैंगनी (Indigo)', 'क्षारीय (Alkaline)'],
    ['चूने का पानी Ca(OH)₂', 12.4, 'बैंगनी (Violet)', 'क्षार (Base)'],
    ['तनु सोडियम हाइड्रॉक्साइड (0.1M NaOH)', 13.0, 'गहरा बैंगनी (Deep Violet)', 'प्रबल क्षार (Strong Base)'],
    ['सांद्र सोडियम हाइड्रॉक्साइड (1M NaOH)', 14.0, 'गहरा बैंगनी (Dark Violet)', 'प्रबलतम क्षार (Strongest Base)'],
  ];

  for (let i = 0; i < 45; i++) {
    const sample = phSamples[i % phSamples.length];
    const [name, phVal, color, nature] = sample;
    const pOH = (14 - phVal).toFixed(1);
    const variantGroup = Math.floor(i / 15);
    const qType = QUESTION_TYPES_CYCLE[i % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];

    if (variantGroup === 0) {
      pushQ({
        class: '10',
        chapter: 'Acids, Bases and Salts',
        experiment: 'pH Determination by Universal Indicator',
        type: qType,
        difficulty: diff,
        question: `pH प्रयोगशाला परीक्षण #${i + 1}: जब '${name}' की बूँद सार्वत्रिक सूचक पत्र (pH Paper) पर डाली जाती है, तो ${color} रंग प्राप्त होता है। इसका अनुमानित pH मान और रासायनिक प्रकृति क्या है?`,
        options: [
          `pH = ${phVal} — ${nature}`,
          `pH = ${pOH} — पूर्णतः उदासीन लवण`,
          `pH = 7.0 — उभयधर्मी ऑक्साइड`,
          `pH = 0.0 — अक्रिय गैस विलयन`,
        ],
        answer: `pH = ${phVal} — ${nature}`,
        explanation: `'${name}' का pH मान ${phVal} होता है, जो सार्वत्रिक सूचक पर ${color} रंग देता है और प्रकृति में ${nature} है।`,
        hint: `pH < 7 अम्लीय (लाल/नारंगी), pH = 7 उदासीन (हरा) और pH > 7 क्षारीय (नीला/बैंगनी) होता है।`,
        marks: 1,
      });
    } else if (variantGroup === 1) {
      pushQ({
        class: '10',
        chapter: 'Acids, Bases and Salts',
        experiment: 'pH Determination by Universal Indicator',
        type: 'Numerical',
        difficulty: diff,
        question: `pH-pOH गणना (नमूना: ${name}): 25°C पर वर्चुअल लैब pH मीटर में इस विलयन का पाठ्यांक pH = ${phVal} प्राप्त हुआ। सूत्र pH + pOH = 14 के अनुसार इस विलयन का pOH मान क्या होगा?`,
        options: [`pOH = ${pOH}`, `pOH = ${phVal.toFixed(1)}`, `pOH = ${(phVal + 7).toFixed(1)}`, `pOH = 0.0`],
        answer: `pOH = ${pOH}`,
        explanation: `25°C पर pH + pOH = 14 होता है, अतः pOH = 14 - ${phVal} = ${pOH}।`,
        hint: `14 में से दिए गए pH मान (${phVal}) को घटाएँ।`,
        marks: 1,
      });
    } else {
      pushQ({
        class: '10',
        chapter: 'Acids, Bases and Salts',
        experiment: 'pH Determination by Universal Indicator',
        type: 'Observation Based',
        difficulty: diff,
        question: `लिटमस एवं pH सहसंबंध (${name}, pH = ${phVal}): यदि विद्यार्थी इस विलयन में लाल और नीले लिटमस पत्र को डुबोता है, तो क्या प्रेक्षण प्राप्त होगा?`,
        options: [
          phVal < 6.8
            ? 'नीला लिटमस लाल हो जाएगा (अम्लीय प्रभाव)'
            : phVal > 7.2
            ? 'लाल लिटमस नीला हो जाएगा (क्षारीय प्रभाव)'
            : 'दोनों लिटमस पत्रों के रंग में कोई परिवर्तन नहीं होगा (उदासीन)',
          'दोनों लिटमस पत्र जलकर काले हो जाएंगे',
          phVal < 6.8 ? 'लाल लिटमस नीला हो जाएगा' : 'नीला लिटमस गहरा लाल हो जाएगा',
          'लिटमस पत्र चाँदी जैसा चमकने लगेगा',
        ],
        answer:
          phVal < 6.8
            ? 'नीला लिटमस लाल हो जाएगा (अम्लीय प्रभाव)'
            : phVal > 7.2
            ? 'लाल लिटमस नीला हो जाएगा (क्षारीय प्रभाव)'
            : 'दोनों लिटमस पत्रों के रंग में कोई परिवर्तन नहीं होगा (उदासीन)',
        explanation: `pH = ${phVal} होने के कारण यह '${nature}' है। अम्ल नीले लिटमस को लाल और क्षार लाल लिटमस को नीला करते हैं।`,
        hint: `इस विलयन के pH (${phVal}) को 7 से तुलना करके अम्ल/क्षार पहचानें।`,
        marks: 1,
      });
    }
  }

  for (let i = 1; i <= 30; i++) {
    const qType = QUESTION_TYPES_CYCLE[(i + 5) % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];
    const znMoles = (i * 0.05).toFixed(2);
    const h2VolL = (Number(znMoles) * 22.4).toFixed(2);

    pushQ({
      class: '10',
      chapter: 'Chemical Reactions and Metals',
      experiment: 'Reactivity of Metals (Zn, Fe, Cu, Al) with Acids & Salt Solutions',
      type: qType,
      difficulty: diff,
      question: `धातु क्रियाशीलता एवं गैस उत्सर्जन प्रयोग #${i}: परखनली में ${znMoles} मोल दानेदार जिंक (Zn) पर तनु H₂SO₄ डालने पर पॉप ध्वनि के साथ जलने वाली हाइड्रोजन गैस (Zn + H₂SO₄ → ZnSO₄ + H₂↑) निकलती है। STP पर उत्पन्न H₂ गैस का आयतन और विस्थापन नियम क्या है?`,
      options: [
        `H₂ आयतन = ${h2VolL} L (Zn हाइड्रोजन से अधिक क्रियाशील है)`,
        `H₂ आयतन = 0.00 L (Zn अम्ल से क्रिया नहीं करता)`,
        `CO₂ आयतन = ${h2VolL} L (चूने का पानी दूधिया होता है)`,
        `Cl₂ आयतन = ${(Number(znMoles) * 11.2).toFixed(2)} L`,
      ],
      answer: `H₂ आयतन = ${h2VolL} L (Zn हाइड्रोजन से अधिक क्रियाशील है)`,
      explanation: `1 मोल Zn से 1 मोल H₂ गैस बनती है। अतः ${znMoles} मोल Zn से STP पर ${znMoles} × 22.4 L = ${h2VolL} L हाइड्रोजन गैस मुक्त होती है।`,
      hint: `STP पर 1 मोल गैस का आयतन 22.4 L होता है; मोल संख्या को 22.4 से गुणा करें।`,
      marks: 1,
    });
  }

  // --- CLASS 11 CHEMISTRY: 75 QUESTIONS (Volumetric Acid-Base Titration, Salt Analysis, Crystallization, Lassaigne's Test) ---
  for (let i = 1; i <= 45; i++) {
    const m1 = Number((0.05 + (i % 4) * 0.05).toFixed(2));
    const v1 = 10 + (i % 3) * 5;
    const v2 = 8 + i * 0.5;
    const m2 = ((m1 * v1) / v2).toFixed(3);
    const strengthNaOH = (Number(m2) * 40).toFixed(2);
    const qType = QUESTION_TYPES_CYCLE[i % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];

    pushQ({
      class: '11',
      chapter: 'Some Basic Concepts of Chemistry & Equilibrium',
      experiment: 'Acid-Base Titration (NaOH vs Oxalic Acid)',
      type: qType,
      difficulty: diff,
      question: `अनुमापन (Titration) प्रेक्षण #${i}: ${m1} M एकक्षारीय मानक अम्ल के V₁ = ${v1} mL को उदासीन करने में ब्यूरेट से NaOH का सुसंगत आयतन V₂ = ${v2} mL लगा। NaOH विलयन की मोलरता (M₂) और ग्राम/लीटर में सांद्रता (M₂ × 40) क्या है?`,
      options: [
        `M₂ = ${m2} M, सांद्रता = ${strengthNaOH} g/L`,
        `M₂ = ${((m1 * v2) / v1).toFixed(3)} M, सांद्रता = 40.00 g/L`,
        `M₂ = ${(m1 + v1).toFixed(3)} M, सांद्रता = 10.00 g/L`,
        `M₂ = 1.000 M, सांद्रता = 0.40 g/L`,
      ],
      answer: `M₂ = ${m2} M, सांद्रता = ${strengthNaOH} g/L`,
      explanation: `मोलरता समीकरण M₁V₁ = M₂V₂ से M₂ = (${m1} × ${v1}) / ${v2} = ${m2} M। NaOH का मोलर द्रव्यमान 40 g/mol है, अतः सांद्रता = ${m2} × 40 = ${strengthNaOH} g/L।`,
      hint: `सूत्र M₂ = (M₁ × V₁) / V₂ लगाएँ और सांद्रता के लिए 40 से गुणा करें।`,
      marks: 1,
    });
  }

  const saltRadicals: [string, string, string][] = [
    ['CO₃²⁻ (कार्बोनेट)', 'तनु H₂SO₄ मिलाने पर तीव्र बुदबुदाहट के साथ CO₂ गैस निकलती है जो चूने के पानी को दूधिया करती है', 'समूह-I तनु अम्ल समूह'],
    ['S²⁻ (सल्फाइड)', 'तनु H₂SO₄ मिलाने पर सड़े अंडे जैसी गंध वाली H₂S गैस निकलती है जो लेड एसीटेट पत्र को काला करती है', 'समूह-I तनु अम्ल समूह'],
    ['Cl⁻ (क्लोराइड)', 'AgNO₃ विलयन मिलाने पर AgCl का दही जैसा श्वेत अवक्षेप बनता है जो NH₄OH में पूर्णतः विलेय है', 'सांद्र H₂SO₄ समूह'],
    ['Br⁻ (ब्रोमाइड)', 'AgNO₃ मिलाने पर हल्का पीला अवक्षेप (AgBr) बनता है जो NH₄OH में आंशिक विलेय है', 'सांद्र H₂SO₄ समूह'],
    ['I⁻ (आयोडाइड)', 'AgNO₃ मिलाने पर पीला अवक्षेप (AgI) बनता है जो NH₄OH में अविलेय है', 'सांद्र H₂SO₄ समूह'],
    ['NO₃⁻ (नाइट्रेट)', 'फेरस सल्फेट (FeSO₄) और सांद्र H₂SO₄ के साथ परखनली की दीवार पर भूरी वलय (Brown Ring: [Fe(H₂O)₅NO]²⁺) बनती है', 'भूरी वलय परीक्षण'],
    ['SO₄²⁻ (सल्फेट)', 'BaCl₂ विलयन मिलाने पर BaSO₄ का श्वेत अवक्षेप बनता है जो सांद्र HCl या HNO₃ में अविलेय रहता है', 'विशेष अम्लीय मूलक समूह'],
    ['NH₄⁺ (अमोनियम)', 'नेसलर अभिकर्मक (K₂HgI₄ + KOH) के साथ भूरा अवक्षेप (आयोडाइड ऑफ मिलन्स बेस) देता है', 'शून्य समूह धनायन'],
    ['Pb²⁺ (लेड)', 'पोटैशियम आयोडाइड (KI) विलयन मिलाने पर लेड आयोडाइड (PbI₂) का चमकीला पीला अवक्षेप बनता है', 'प्रथम समूह धनायन'],
    ['Cu²⁺ (कॉपर)', 'पोटैशियम फेरोसायनाइड K₄[Fe(CN)₆] मिलाने पर चॉकलेट भूरा अवक्षेप (Cu₂[Fe(CN)₆]) प्राप्त होता है', 'द्वितीय समूह धनायन'],
  ];

  for (let i = 0; i < 30; i++) {
    const [radical, testObs, groupName] = saltRadicals[i % saltRadicals.length];
    const qType = QUESTION_TYPES_CYCLE[(i + 3) % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];

    pushQ({
      class: '11',
      chapter: 'Qualitative Salt Analysis',
      experiment: `Qualitative Salt Analysis (Sample #${i + 1})`,
      type: qType,
      difficulty: diff,
      question: `लवण विश्लेषण प्रयोग (नमूना #${i + 1}, ${groupName}): अज्ञात अकार्बनिक लवण के जलीय विलयन का परीक्षण करने पर प्रेक्षण मिलता है कि "${testObs}"। लवण में उपस्थित मूलक (Radical/Ion) कौन-सा है?`,
      options: [
        radical,
        i % 2 === 0 ? 'PO₄³⁻ (फॉस्फेट)' : 'Al³⁺ (एलुमिनियम)',
        i % 2 === 0 ? 'CH₃COO⁻ (एसीटेट)' : 'Zn²⁺ (जिंक)',
        'कोई आयन उपस्थित नहीं (आसुत जल)',
      ],
      answer: radical,
      explanation: `Qualitative Salt Analysis में "${testObs}" होना ${radical} मूलक (${groupName}) का निश्चयात्मक परीक्षण (Confirmatory Test) है।`,
      hint: `अवक्षेप के रंग और गैस की प्रकृति को ${groupName} के मानक परीक्षण से मिलाएँ।`,
      marks: 1,
    });
  }

  // --- CLASS 12 CHEMISTRY: 75 QUESTIONS (Chemical Kinetics, Redox KMnO4 Titration, Organic Functional Groups, Electrochemistry) ---
  for (let i = 1; i <= 40; i++) {
    const timeSec = 10 + i * 2;
    const rateInv = (1 / timeSec).toFixed(4);
    const concM = (0.1 * (50 / timeSec)).toFixed(3);
    const qType = QUESTION_TYPES_CYCLE[i % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];

    pushQ({
      class: '12',
      chapter: 'Chemical Kinetics',
      experiment: 'Chemical Kinetics (Thiosulphate + HCl Rate)',
      type: qType,
      difficulty: diff,
      question: `रासायनिक बलगतिकी प्रयोग #${i}: सोडियम थायोसल्फेट (Na₂S₂O₃, सांद्रता ≈ ${concM} M) और HCl की अभिक्रिया में सल्फर के कोलाइडी अवक्षेप के कारण फ्लास्क के नीचे बना क्रॉस (X) चिह्न ठीक t = ${timeSec} सेकंड में अदृश्य हो जाता है। अभिक्रिया की सापेक्ष दर (1 / t) कितनी है?`,
      options: [
        `${rateInv} s⁻¹`,
        `${timeSec}.00 s⁻¹`,
        `${(timeSec / 2).toFixed(2)} s⁻¹`,
        `0.0000 s⁻¹`,
      ],
      answer: `${rateInv} s⁻¹`,
      explanation: `अभिक्रिया का सापेक्ष वेग क्रॉस के अदृश्य होने में लगे समय के व्युत्क्रमानुपाती होता है: Rate = 1 / t = 1 / ${timeSec} = ${rateInv} s⁻¹।`,
      hint: `1 को समय t (${timeSec} s) से भाग दें।`,
      marks: 1,
    });
  }

  const organicTests: [string, string, string][] = [
    ['फिनॉलिक समूह (Phenolic -OH)', 'उदासीन फेरिक क्लोराइड (Neutral FeCl₃) विलयन मिलाने पर बैंगनी (Violet) रंग का संकुल बनता है', 'FeCl₃ परीक्षण'],
    ['एल्डिहाइड समूह (-CHO)', 'टॉलेन अभिकर्मक (अमोनियामय AgNO₃) के साथ गर्म करने पर परखनली की दीवार पर रजत दर्पण (Silver Mirror) बनता है', 'टॉलेन रजत दर्पण परीक्षण'],
    ['कार्बोक्सिलिक अम्ल (-COOH)', 'सोडियम बाइकार्बोनेट (NaHCO₃) मिलाने पर CO₂ गैस की तीव्र बुदबुदाहट (Brisk Effervescence) निकलती है', 'NaHCO₃ बुदबुदाहट परीक्षण'],
    ['प्राथमिक एमीन (-NH₂)', 'क्लोरोफॉर्म और अल्कोहलीय KOH के साथ गर्म करने पर आइसोसायनाइड (कार्बिलएमीन) की अत्यंत दुर्गंध आती है', 'कार्बिलएमीन परीक्षण'],
    ['कीटोनिक समूह (-CO-)', 'सोडियम नाइट्रोप्रुसाइड और NaOH मिलाने पर वाइन जैसा लाल (Wine Red) रंग प्राप्त होता है', 'सोडियम नाइट्रोप्रुसाइड परीक्षण'],
  ];

  for (let i = 0; i < 35; i++) {
    const [funcGroup, obsText, testTitle] = organicTests[i % organicTests.length];
    const qType = QUESTION_TYPES_CYCLE[(i + 2) % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];

    pushQ({
      class: '12',
      chapter: 'Organic Chemistry & Functional Groups',
      experiment: `Identification of Functional Groups (${testTitle} #${i + 1})`,
      type: qType,
      difficulty: diff,
      question: `कार्बनिक क्रियात्मक समूह परीक्षण #${i + 1} (${testTitle}): एक कार्बनिक यौगिक के नमूने में जब यह परीक्षण किया गया, तो प्रेक्षण मिला कि "${obsText}"। यौगिक में कौन-सा क्रियात्मक समूह (Functional Group) उपस्थित है?`,
      options: [
        funcGroup,
        'ईथर समूह (R-O-R)',
        'संतृप्त एल्केन (C-C Single Bond)',
        'नाइट्रो समूह (-NO₂)',
      ],
      answer: funcGroup,
      explanation: `कार्बनिक रसायन प्रयोगशाला में '${testTitle}' द्वारा "${obsText}" मिलना ${funcGroup} की उपस्थिति सिद्ध करता है।`,
      hint: `अभिकर्मक और रंग/गंध परिवर्तन से क्रियात्मक समूह की पहचान करें।`,
      marks: 1,
    });
  }

  return list;
}

// ============================================================================
// 3. BIOLOGY — 300 QUESTIONS (Class 9: 75, Class 10: 75, Class 11: 75, Class 12: 75)
// ============================================================================
function buildBiology300Questions(): VirtualLabQuestion[] {
  const list: VirtualLabQuestion[] = [];
  let seq = 1;

  const pushQ = (q: Omit<VirtualLabQuestion, 'id' | 'subject'>) => {
    list.push({
      id: `BIO-${pad3(seq++)}`,
      subject: 'Biology',
      ...q,
    });
  };

  // --- CLASS 9 BIOLOGY: 75 QUESTIONS (Osmosis in Raisins, Onion Peel & Cheek Cell Slides, Plant/Animal Tissues, Food Adulteration) ---
  for (let i = 1; i <= 45; i++) {
    const w1 = Number((3.0 + (i % 10) * 0.5).toFixed(1));
    const absorbedG = Number((1.2 + i * 0.15).toFixed(2));
    const w2 = Number((w1 + absorbedG).toFixed(2));
    const pct = ((absorbedG / w1) * 100).toFixed(1);
    const qType = QUESTION_TYPES_CYCLE[i % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];

    pushQ({
      class: '9',
      chapter: 'The Fundamental Unit of Life',
      experiment: 'Osmosis & Water Absorption in Raisins',
      type: qType,
      difficulty: diff,
      question: `किशमिश में अंतःपरासरण प्रयोग #${i}: एक विद्यार्थी ने सूखी किशमिश का प्रारंभिक भार W₁ = ${w1} g मापा। उन्हें शुद्ध जल में भिगोने के बाद फूली हुई किशमिश का अंतिम भार W₂ = ${w2} g प्राप्त हुआ। किशमिश द्वारा अवशोषित जल की प्रतिशत मात्रा क्या है?`,
      options: [
        `${pct}% (अंतःपरासरण / Endosmosis द्वारा)`,
        `${((w1 / w2) * 100).toFixed(1)}% (बहिःपरासरण द्वारा)`,
        `${absorbedG}%`,
        `100.0%`,
      ],
      answer: `${pct}% (अंतःपरासरण / Endosmosis द्वारा)`,
      explanation: `अवशोषित जल का भार = W₂ - W₁ = ${w2} - ${w1} = ${absorbedG} g। प्रतिशत अवशोषण = [(W₂ - W₁) / W₁] × 100 = (${absorbedG} / ${w1}) × 100 = ${pct}%।`,
      hint: `सूत्र [(W₂ - W₁) / W₁] × 100 में W₁ = ${w1} और W₂ = ${w2} रखें।`,
      marks: 1,
    });
  }

  for (let i = 1; i <= 30; i++) {
    const isOnion = i % 2 === 1;
    const qType = QUESTION_TYPES_CYCLE[(i + 3) % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];

    pushQ({
      class: '9',
      chapter: 'Cell & Tissues',
      experiment: isOnion ? 'Temporary Mount of Onion Peel' : 'Temporary Mount of Human Cheek Cells',
      type: qType,
      difficulty: diff,
      question: isOnion
        ? `प्याज की झिल्ली की अस्थायी स्लाइड (प्रेक्षण #${i}): सूक्ष्मदर्शी (आवर्धन ${10 * (10 + (i % 4) * 5)}X) में सैफ्रानिन से अभिरंजित प्याज की झिल्ली देखने पर कौन-सी विशिष्ट संरचनाएँ दिखाई देती हैं?`
        : `मानव कपोल कोशिका स्लाइड (प्रेक्षण #${i}): मेथिलीन ब्लू (Methylene Blue) से अभिरंजित मानव गाल की उपकला कोशिकाओं को सूक्ष्मदर्शी में देखने पर कौन-सा लक्षण स्पष्ट दिखता है?`,
      options: isOnion
        ? [
            'स्पष्ट दृढ़ कोशिका भित्ति (Cell Wall), बड़ी केंद्रीय रसधानी और परिधि पर स्थित केंद्रक',
            'कोशिका भित्ति का पूर्ण अभाव और तारककाय (Centriole) की उपस्थिति',
            'केवल गोलाकार लाल रक्त कणिकाएँ',
            'कशाभिका युक्त एककोशिकीय जीवाणु',
          ]
        : [
            'कोशिका भित्ति अनुपस्थित, बहुभुजीय/अनियमित कोशिका झिल्ली और मध्य में गहरा नीला केंद्रक',
            'मोटी सेलुलोज कोशिका भित्ति और हरितलवक (Chloroplast)',
            'बड़ी केंद्रीय रिक्तिका जो पूरे कोशिकाद्रव्य को किनारे धकेलती है',
            'लिग्निन युक्त दृढ़ोतक रेशे',
          ],
      answer: isOnion
        ? 'स्पष्ट दृढ़ कोशिका भित्ति (Cell Wall), बड़ी केंद्रीय रसधानी और परिधि पर स्थित केंद्रक'
        : 'कोशिका भित्ति अनुपस्थित, बहुभुजीय/अनियमित कोशिका झिल्ली और मध्य में गहरा नीला केंद्रक',
      explanation: isOnion
        ? 'पादप कोशिका (प्याज की झिल्ली) में सैफ्रानिन अभिरंजन से आयताकार कोशिका भित्ति, केंद्रक और बड़ी रसधानी स्पष्ट दिखाई देती है।'
        : 'जंतु कोशिका (मानव कपोल कोशिका) में मेथिलीन ब्लू अभिरंजन से कोशिका झिल्ली और मध्य में स्थित केंद्रक दिखता है, जबकि कोशिका भित्ति नहीं होती।',
      hint: isOnion ? 'पादप कोशिका में कोशिका भित्ति और बड़ी रसधानी होती है।' : 'जंतु कोशिका में कोशिका भित्ति नहीं होती।',
      marks: 1,
    });
  }

  // --- CLASS 10 BIOLOGY: 75 QUESTIONS (Stomata Peel, Photosynthesis Hydrilla Rate, Starch Iodine Test, CO2 in Respiration, Binary Fission) ---
  for (let i = 1; i <= 45; i++) {
    const timeMin = 2 + (i % 4);
    const bubblesPerMin = 8 + i;
    const totalBubbles = timeMin * bubblesPerMin;
    const qType = QUESTION_TYPES_CYCLE[i % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];

    pushQ({
      class: '10',
      chapter: 'Life Processes',
      experiment: 'Stomata & Photosynthesis Light Rate',
      type: qType,
      difficulty: diff,
      question: `प्रकाश संश्लेषण एवं रंध्र प्रयोग #${i}: जलीय पौधे हाइड्रिला (Hydrilla) पर प्रकाश लैंप डालने पर ${timeMin} मिनट में कुल ${totalBubbles} ऑक्सीजन (O₂) बुलबुले परखनली में एकत्र होते हैं। प्रकाश संश्लेषण की प्रति मिनट दर (बुलबुले/मिनट) क्या है?`,
      options: [
        `${bubblesPerMin} बुलबुले/मिनट (O₂ गैस मुक्त होती है)`,
        `${totalBubbles * timeMin} बुलबुले/मिनट (CO₂ गैस मुक्त होती है)`,
        `${(timeMin / totalBubbles).toFixed(2)} बुलबुले/मिनट`,
        `0 बुलबुले/मिनट`,
      ],
      answer: `${bubblesPerMin} बुलबुले/मिनट (O₂ गैस मुक्त होती है)`,
      explanation: `प्रति मिनट दर = कुल O₂ बुलबुले / समय = ${totalBubbles} / ${timeMin} = ${bubblesPerMin} बुलबुले/मिनट।`,
      hint: `कुल बुलबुलों (${totalBubbles}) को समय (${timeMin} मिनट) से भाग दें।`,
      marks: 1,
    });
  }

  for (let i = 1; i <= 30; i++) {
    const stomataCount = 12 + i;
    const epidermalCount = 48 + i * 2;
    const totalCount = stomataCount + epidermalCount;
    const stomatalIndex = ((stomataCount / totalCount) * 100).toFixed(1);
    const qType = QUESTION_TYPES_CYCLE[(i + 1) % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];

    pushQ({
      class: '10',
      chapter: 'Life Processes & Reproduction',
      experiment: 'Leaf Peel Stomata & Respiration Lab',
      type: qType,
      difficulty: diff,
      question: `रंध्र सूचकांक एवं पत्ती झिल्ली प्रेक्षण #${i}: पत्ती की निचली अधिचर्म (Lower Epidermis) की स्लाइड में सूक्ष्मदर्शी के एक दृश्य क्षेत्र में रंध्रों की संख्या S = ${stomataCount} और अधिचर्म कोशिकाओं की संख्या E = ${epidermalCount} है। रंध्र सूचकांक [SI = S / (S + E) × 100] कितना होगा?`,
      options: [
        `${stomatalIndex}%`,
        `${((stomataCount / epidermalCount) * 100).toFixed(1)}%`,
        `${stomataCount}%`,
        `100.0%`,
      ],
      answer: `${stomatalIndex}%`,
      explanation: `रंध्र सूचकांक (Stomatal Index) = [S / (S + E)] × 100 = [${stomataCount} / (${stomataCount} + ${epidermalCount})] × 100 = (${stomataCount} / ${totalCount}) × 100 = ${stomatalIndex}%।`,
      hint: `S को कुल संख्या (S + E = ${totalCount}) से भाग देकर 100 से गुणा करें।`,
      marks: 1,
    });
  }

  // --- CLASS 11 BIOLOGY: 75 QUESTIONS (Ganong's Potometer Transpiration, Paper Chromatography, Plasmolysis, Biochemical Tests) ---
  for (let i = 1; i <= 45; i++) {
    const timeMin = 3 + (i % 5);
    const distMm = timeMin * (2 + (i % 9) + i * 0.5);
    const rateMmMin = (distMm / timeMin).toFixed(1);
    const qType = QUESTION_TYPES_CYCLE[i % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];

    pushQ({
      class: '11',
      chapter: 'Transport in Plants & Plant Physiology',
      experiment: "Ganong's Potometer (Transpiration Rate)",
      type: qType,
      difficulty: diff,
      question: `गैनोंग पोटोमीटर प्रयोग #${i}: पत्तीदार टहनी द्वारा वाष्पोत्सर्जन के दौरान क्षैतिज केशिका नली में वायु का बुलबुला t = ${timeMin} मिनट में d = ${distMm.toFixed(1)} mm दूरी तय करता है। वाष्पोत्सर्जन की दर (v = d / t) क्या है?`,
      options: [
        `${rateMmMin} mm/min`,
        `${(distMm * timeMin).toFixed(1)} mm/min`,
        `${(timeMin / distMm).toFixed(2)} mm/min`,
        `0.0 mm/min`,
      ],
      answer: `${rateMmMin} mm/min`,
      explanation: `वाष्पोत्सर्जन की दर v = बुलबुले द्वारा तय दूरी (d) / समय (t) = ${distMm.toFixed(1)} mm / ${timeMin} min = ${rateMmMin} mm/min।`,
      hint: `तय दूरी (${distMm.toFixed(1)} mm) को समय (${timeMin} min) से विभाजित करें।`,
      marks: 1,
    });
  }

  for (let i = 1; i <= 30; i++) {
    const solventDist = 10.0;
    const pigmentDist = Number((2.5 + i * 0.22).toFixed(2));
    const rfVal = (pigmentDist / solventDist).toFixed(3);
    const qType = QUESTION_TYPES_CYCLE[(i + 4) % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];

    pushQ({
      class: '11',
      chapter: 'Photosynthesis in Higher Plants & Biomolecules',
      experiment: 'Paper Chromatography of Leaf Pigments',
      type: qType,
      difficulty: diff,
      question: `पेपर क्रोमैटोग्राफी प्रयोग #${i}: पालक की पत्तियों के वर्णक पृथक्करण में विलायक अग्र (Solvent Front) आधार रेखा से ${solventDist} cm ऊपर चढ़ता है और एक प्रकाश-संश्लेषी वर्णक बिंदु ${pigmentDist} cm दूरी तय करता है। इस वर्णक का मंदन गुणांक (Rf Value) क्या होगा?`,
      options: [
        `Rf = ${rfVal}`,
        `Rf = ${(solventDist / pigmentDist).toFixed(3)} (Rf > 1)`,
        `Rf = ${(solventDist + pigmentDist).toFixed(2)}`,
        `Rf = 0.000`,
      ],
      answer: `Rf = ${rfVal}`,
      explanation: `Rf (Retardation Factor) = (वर्णक द्वारा तय दूरी) / (विलायक अग्र द्वारा तय दूरी) = ${pigmentDist} / ${solventDist} = ${rfVal} (Rf सदैव 1 से कम होता है)।`,
      hint: `वर्णक की दूरी (${pigmentDist} cm) को विलायक की दूरी (${solventDist} cm) से भाग दें।`,
      marks: 1,
    });
  }

  // --- CLASS 12 BIOLOGY: 75 QUESTIONS (Mitosis in Onion Root Tip & Mitotic Index, Quadrat Plant Density, DNA Isolation, Pollen Germination) ---
  for (let i = 1; i <= 45; i++) {
    const totalCells = 80 + (i % 5) * 20;
    const divCells = 8 + i;
    const miPercent = ((divCells / totalCells) * 100).toFixed(2);
    const qType = QUESTION_TYPES_CYCLE[i % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];

    pushQ({
      class: '12',
      chapter: 'Cell Cycle, Genetics & Molecular Biology',
      experiment: 'Mitosis in Onion Root Tip & Mitotic Index',
      type: qType,
      difficulty: diff,
      question: `समसूत्री विभाजन (Mitosis) स्लाइड प्रेक्षण #${i}: प्याज के मूलाग्र की एसिटोकार्मिन अभिरंजित स्लाइड में कुल N_total = ${totalCells} कोशिकाएँ गिनी गईं, जिनमें से N_dividing = ${divCells} कोशिकाएँ सक्रिय विभाजन (Prophase, Metaphase, Anaphase, Telophase) में हैं। माइटोटिक इंडेक्स (Mitotic Index) कितना है?`,
      options: [
        `${miPercent}%`,
        `${(((totalCells - divCells) / totalCells) * 100).toFixed(2)}%`,
        `${divCells}.00%`,
        `100.00%`,
      ],
      answer: `${miPercent}%`,
      explanation: `माइटोटिक इंडेक्स (MI) = (विभाजित कोशिकाओं की संख्या / कुल कोशिकाओं की संख्या) × 100 = (${divCells} / ${totalCells}) × 100 = ${miPercent}%।`,
      hint: `विभाजित कोशिकाओं (${divCells}) को कुल कोशिकाओं (${totalCells}) से भाग देकर 100 से गुणा करें।`,
      marks: 1,
    });
  }

  for (let i = 1; i <= 30; i++) {
    const totalIndividuals = 15 + i * 3;
    const totalQuadrats = 5;
    const density = (totalIndividuals / totalQuadrats).toFixed(1);
    const occupiedQuadrats = (i % 4) + 2;
    const freqPercent = ((occupiedQuadrats / totalQuadrats) * 100).toFixed(0);
    const qType = QUESTION_TYPES_CYCLE[(i + 2) % QUESTION_TYPES_CYCLE.length];
    const diff = DIFFICULTY_CYCLE[i % 3];

    pushQ({
      class: '12',
      chapter: 'Organisms and Populations (Ecology)',
      experiment: 'Plant Population Density & Frequency by Quadrat Method',
      type: qType,
      difficulty: diff,
      question: `क्वाड्रेट पारिस्थितिकी प्रयोग #${i}: 1m × 1m के ${totalQuadrats} क्वाड्रेटों में किसी पादप प्रजाति के कुल पौधों की संख्या N = ${totalIndividuals} मिली और यह प्रजाति ${occupiedQuadrats} क्वाड्रेटों में उपस्थित पाई गई। इस प्रजाति का समष्टि घनत्व (Density) और आवृत्ति प्रतिशत (Frequency %) क्या है?`,
      options: [
        `घनत्व = ${density} पौधे/क्वाड्रेट, आवृत्ति = ${freqPercent}%`,
        `घनत्व = ${totalIndividuals} पौधे/क्वाड्रेट, आवृत्ति = 100%`,
        `घनत्व = ${occupiedQuadrats} पौधे/क्वाड्रेट, आवृत्ति = ${density}%`,
        `घनत्व = 1.0 पौधे/क्वाड्रेट, आवृत्ति = 10%`,
      ],
      answer: `घनत्व = ${density} पौधे/क्वाड्रेट, आवृत्ति = ${freqPercent}%`,
      explanation: `समष्टि घनत्व (D) = कुल पौधों की संख्या / कुल अध्ययन किए गए क्वाड्रेट = ${totalIndividuals} / ${totalQuadrats} = ${density}। आवृत्ति % = (${occupiedQuadrats} / ${totalQuadrats}) × 100 = ${freqPercent}%।`,
      hint: `घनत्व के लिए कुल पौधों (${totalIndividuals}) को ${totalQuadrats} से भाग दें।`,
      marks: 1,
    });
  }

  return list;
}

// ============================================================================
// 4. GENERAL SCIENCE / PRACTICAL SKILLS — 100 QUESTIONS (25 per Class: 9, 10, 11, 12)
// ============================================================================
function buildGeneralScience100Questions(): VirtualLabQuestion[] {
  const list: VirtualLabQuestion[] = [];
  let seq = 1;

  const classes: LabClassLevel[] = ['9', '10', '11', '12'];

  classes.forEach((cls) => {
    for (let i = 1; i <= 25; i++) {
      const msrCm = Number((1.0 + i * 0.1).toFixed(1));
      const vscDiv = i % 10;
      const totalCm = (msrCm + vscDiv * 0.01).toFixed(2);
      const qType = QUESTION_TYPES_CYCLE[(i + Number(cls)) % QUESTION_TYPES_CYCLE.length];
      const diff = DIFFICULTY_CYCLE[i % 3];

      list.push({
        id: `GSC-${pad3(seq++)}`,
        subject: 'General Science',
        class: cls,
        chapter: 'Practical Skills & Laboratory Measurement',
        experiment: 'Vernier Callipers & Screw Gauge Precision Lab',
        type: qType,
        difficulty: diff,
        question: `प्रायोगिक कौशल एवं सूक्ष्म मापन (Class ${cls} सेट #${i}): वर्नियर कैलिपर्स (अल्पतमांक LC = 0.01 cm) से किसी बेलन का व्यास मापते समय मुख्य पैमाना पाठ्यांक MSR = ${msrCm.toFixed(1)} cm और वर्नियर संपाती चिह्न VSC = ${vscDiv} प्राप्त होता है। बेलन का सटीक व्यास और त्रिज्या (r = D/2) क्या है?`,
        options: [
          `व्यास D = ${totalCm} cm, त्रिज्या r = ${(Number(totalCm) / 2).toFixed(3)} cm`,
          `व्यास D = ${(msrCm + vscDiv * 0.1).toFixed(2)} cm, त्रिज्या r = ${msrCm.toFixed(2)} cm`,
          `व्यास D = ${msrCm.toFixed(2)} cm, त्रिज्या r = ${totalCm} cm`,
          `व्यास D = 0.01 cm, त्रिज्या r = 0.005 cm`,
        ],
        answer: `व्यास D = ${totalCm} cm, त्रिज्या r = ${(Number(totalCm) / 2).toFixed(3)} cm`,
        explanation: `वर्नियर कैलिपर्स का सूत्र: D = MSR + (VSC × LC) = ${msrCm.toFixed(1)} + (${vscDiv} × 0.01) = ${totalCm} cm तथा त्रिज्या r = D / 2 = ${(Number(totalCm) / 2).toFixed(3)} cm।`,
        hint: `मुख्य स्केल पाठ्यांक (${msrCm.toFixed(1)} cm) में (${vscDiv} × 0.01 cm) जोड़ें और त्रिज्या के लिए आधा करें।`,
        marks: 1,
      });
    }
  });

  return list;
}

export const VIRTUAL_LAB_1000_QUESTIONS: VirtualLabQuestion[] = [
  ...buildPhysics300Questions(),
  ...buildChemistry300Questions(),
  ...buildBiology300Questions(),
  ...buildGeneralScience100Questions(),
];

export interface QuestionBankValidationSummary {
  totalQuestions: number;
  bySubject: Record<LabSubject, number>;
  bySubjectAndClass: Record<string, number>;
  uniqueIds: number;
  uniqueQuestions: number;
  validAnswersMatchingOptions: number;
  isValid: boolean;
}

export function getQuestionBankValidationSummary(): QuestionBankValidationSummary {
  const bySubject: Record<LabSubject, number> = {
    Physics: 0,
    Chemistry: 0,
    Biology: 0,
    'General Science': 0,
  };
  const bySubjectAndClass: Record<string, number> = {};
  const idSet = new Set<string>();
  const qTextSet = new Set<string>();
  let validAnswersMatchingOptions = 0;

  for (const q of VIRTUAL_LAB_1000_QUESTIONS) {
    bySubject[q.subject] = (bySubject[q.subject] || 0) + 1;
    const key = `${q.subject}-${q.class}`;
    bySubjectAndClass[key] = (bySubjectAndClass[key] || 0) + 1;
    idSet.add(q.id);
    qTextSet.add(q.question);
    if (q.options.includes(q.answer)) {
      validAnswersMatchingOptions++;
    }
  }

  const isValid =
    VIRTUAL_LAB_1000_QUESTIONS.length === 1000 &&
    bySubject.Physics === 300 &&
    bySubject.Chemistry === 300 &&
    bySubject.Biology === 300 &&
    bySubject['General Science'] === 100 &&
    idSet.size === 1000 &&
    qTextSet.size === 1000 &&
    validAnswersMatchingOptions === 1000;

  return {
    totalQuestions: VIRTUAL_LAB_1000_QUESTIONS.length,
    bySubject,
    bySubjectAndClass,
    uniqueIds: idSet.size,
    uniqueQuestions: qTextSet.size,
    validAnswersMatchingOptions,
    isValid,
  };
}
