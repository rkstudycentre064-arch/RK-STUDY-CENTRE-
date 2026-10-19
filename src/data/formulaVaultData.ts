export type FormulaClassId = 'class-10' | 'class-12';

export interface FormulaVariable {
  symbol: string;
  meaning: string;
  unit?: string;
}

export interface FormulaItem {
  id: string;
  classId: FormulaClassId;
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterName: string;
  chapterNumber: number;
  title: string;
  formula: string;
  latex?: string;
  explanation: string;
  variables: FormulaVariable[];
  derivationSummary?: string;
  isVVI?: boolean;
  calculatorType?: 'ohms_law' | 'coulombs_law' | 'quadratic' | 'lens_formula' | 'kinetic_energy' | 'density';
  practiceHint?: string;
}

export interface FormulaChapter {
  id: string;
  name: string;
  englishName: string;
  chapterNumber: number;
  description: string;
}

export interface FormulaSubject {
  id: string;
  name: string;
  englishName: string;
  classId: FormulaClassId;
  iconName: string;
  accentColor: string;
  chapters: FormulaChapter[];
}

export interface FormulaClass {
  id: FormulaClassId;
  name: string;
  hindiName: string;
  tagline: string;
  badge: string;
}

export const FORMULA_CLASSES: FormulaClass[] = [
  {
    id: 'class-10',
    name: 'Class 10',
    hindiName: 'कक्षा 10वीं (मैट्रिक बोर्ड)',
    tagline: 'गणित एवं विज्ञान के सभी अध्यायों के प्रामाणिक सूत्र व सर्वसमिकाएँ',
    badge: 'BSEB 10th Matric',
  },
  {
    id: 'class-12',
    name: 'Class 12',
    hindiName: 'कक्षा 12वीं (इंटरमीडिएट साइंस)',
    tagline: 'भौतिकी, रसायन, गणित व जीव विज्ञान के संपूर्ण बोर्ड सूत्र बैंक',
    badge: 'BSEB 12th Inter',
  },
];

export const FORMULA_SUBJECTS: FormulaSubject[] = [
  // --- Class 10 Subjects ---
  {
    id: 'c10-math',
    classId: 'class-10',
    name: 'गणित',
    englishName: 'Mathematics',
    iconName: 'Calculator',
    accentColor: 'indigo',
    chapters: [
      { id: 'c10-m-ch01', chapterNumber: 1, name: 'वास्तविक संख्याएं', englishName: 'Real Numbers', description: 'यूक्लिड विभाजन प्रमेयिका, HCF × LCM = a × b, अभाज्य गुणनखंड' },
      { id: 'c10-m-ch02', chapterNumber: 2, name: 'बहुपद', englishName: 'Polynomials', description: 'शून्यकों का योग व गुणनफल, द्विघात व त्रिघात बहुपद' },
      { id: 'c10-m-ch03', chapterNumber: 3, name: 'दो चर वाले रैखिक समीकरण', englishName: 'Pair of Linear Equations', description: 'प्रतिच्छेदी, संपाती व समांतर रेखाओं के प्रतिबंध' },
      { id: 'c10-m-ch04', chapterNumber: 4, name: 'द्विघात समीकरण', englishName: 'Quadratic Equations', description: 'विविक्तकर D = b² - 4ac, श्रीधराचार्य द्विघाती सूत्र' },
      { id: 'c10-m-ch05', chapterNumber: 5, name: 'समांतर श्रेढ़ी (A.P.)', englishName: 'Arithmetic Progressions', description: 'nवाँ पद aₙ = a+(n-1)d, n पदों का योग Sₙ' },
      { id: 'c10-m-ch08', chapterNumber: 6, name: 'त्रिकोणमिति का परिचय एवं सर्वसमिकाएँ', englishName: 'Trigonometry & Identities', description: 'sin²θ + cos²θ = 1, पूरक कोण सूत्र, त्रिकोणमितीय अनुपात' },
      { id: 'c10-m-ch07', chapterNumber: 7, name: 'निर्देशांक ज्यामिति', englishName: 'Coordinate Geometry', description: 'दूरी सूत्र, विभाजन सूत्र, त्रिभुज का क्षेत्रफल' },
      { id: 'c10-m-ch10', chapterNumber: 8, name: 'वृत्त एवं संबंधित क्षेत्रफल', englishName: 'Circles & Areas Related to Circles', description: 'त्रिज्यखंड का क्षेत्रफल, चाप की लंबाई, वृत्त की परिधि व क्षेत्रफल' },
      { id: 'c10-m-ch13', chapterNumber: 9, name: 'पृष्ठीय क्षेत्रफल और आयतन', englishName: 'Surface Areas & Volumes', description: 'बेलन, शंकु, गोला व अर्धगोले के आयतन व वक्र पृष्ठ' },
      { id: 'c10-m-ch14', chapterNumber: 10, name: 'सांख्यिकी', englishName: 'Statistics', description: 'माध्य, माध्यक, बहुलक एवं आनुभविक संबंध' },
      { id: 'c10-m-ch15', chapterNumber: 11, name: 'प्रायिकता', englishName: 'Probability', description: 'घटना की प्रायिकता P(E) = n(E)/n(S), 0 ≤ P(E) ≤ 1' },
    ],
  },
  {
    id: 'c10-sci',
    classId: 'class-10',
    name: 'विज्ञान',
    englishName: 'Science',
    iconName: 'FlaskConical',
    accentColor: 'blue',
    chapters: [
      { id: 'c10-s-ch01', chapterNumber: 1, name: 'प्रकाश का परावर्तन एवं गोलीय दर्पण', englishName: 'Reflection of Light & Mirrors', description: 'दर्पण सूत्र 1/f = 1/v + 1/u, आवर्धन m = -v/u, f = R/2' },
      { id: 'c10-s-ch02', chapterNumber: 2, name: 'प्रकाश का अपवर्तन एवं लेंस', englishName: 'Refraction & Lens Formula', description: 'स्नेल का नियम, लेंस सूत्र 1/f = 1/v - 1/u, लेंस की क्षमता P = 1/f' },
      { id: 'c10-s-ch03', chapterNumber: 3, name: 'मानव नेत्र तथा रंगबिरंगा संसार', englishName: 'Human Eye & Colorful World', description: 'प्रिज्म अपवर्तन, विचलन कोण, प्रकीर्णन नियम ∝ 1/λ⁴' },
      { id: 'c10-s-ch04', chapterNumber: 4, name: 'विद्युत एवं धारा के प्रभाव', englishName: 'Electricity & Heating Effect', description: 'ओम का नियम V = IR, प्रतिरोध R = ρl/A, जूल का तापन नियम H = I²Rt' },
      { id: 'c10-s-ch05', chapterNumber: 5, name: 'विद्युत धारा के चुंबकीय प्रभाव', englishName: 'Magnetic Effects of Current', description: 'फ्लेमिंग का वामहस्त नियम, चुंबकीय क्षेत्र B, बल F = I·L·B sinθ' },
      { id: 'c10-s-ch06', chapterNumber: 6, name: 'अम्ल, क्षारक एवं लवण', englishName: 'Acids, Bases & Salts', description: 'pH मान गणना सूत्र pH = -log₁₀[H⁺], लवणों के रासायनिक सूत्र' },
    ],
  },

  // --- Class 12 Subjects ---
  {
    id: 'c12-phy',
    classId: 'class-12',
    name: 'भौतिकी',
    englishName: 'Physics',
    iconName: 'Atom',
    accentColor: 'blue',
    chapters: [
      { id: 'c12-p-ch01', chapterNumber: 1, name: 'वैद्युत आवेश तथा क्षेत्र', englishName: 'Electric Charges & Fields', description: 'कूलॉम नियम F = k|q₁q₂|/r², गाउस का प्रमेय, विद्युत द्विध्रुव आघूर्ण p = 2aq' },
      { id: 'c12-p-ch02', chapterNumber: 2, name: 'स्थिरवैद्युत विभव तथा धारिता', englishName: 'Electrostatic Potential & Capacitance', description: 'विभव V = kq/r, समांतर पट्टिका संधारित्र C = ε₀A/d, ऊर्जा U = ½CV²' },
      { id: 'c12-p-ch03', chapterNumber: 3, name: 'विद्युत धारा', englishName: 'Current Electricity', description: 'अनुगमन वेग v_d = eEτ/m, किरचॉफ के नियम, व्हीटस्टोन सेतु P/Q = R/S' },
      { id: 'c12-p-ch04', chapterNumber: 4, name: 'गतिमान आवेश और चुंबकत्व', englishName: 'Moving Charges & Magnetism', description: 'लॉरेंट्ज़ बल F = q(v×B), बायो-सावर्ट नियम, ऐम्पियर का परिपथीय नियम' },
      { id: 'c12-p-ch05', chapterNumber: 5, name: 'वैद्युतचुंबकीय प्रेरण', englishName: 'Electromagnetic Induction', description: 'फैराडे का विद्युतचुंबकीय प्रेरण नियम e = -dΦ/dt, स्वप्रेरकत्व e = -L di/dt' },
      { id: 'c12-p-ch06', chapterNumber: 6, name: 'प्रत्यावर्ती धारा (A.C.)', englishName: 'Alternating Current', description: 'वर्ग माध्य मूल मान I_rms = I₀/√2, LCR परिपथ प्रतिबाधा Z, अनुनाद आवृत्ति' },
      { id: 'c12-p-ch07', chapterNumber: 7, name: 'किरण प्रकाशिकी एवं प्रकाशिक यंत्र', englishName: 'Ray Optics & Optical Instruments', description: 'लेंस मेकर सूत्र 1/f = (μ-1)(1/R₁ - 1/R₂), सूक्ष्मदर्शी व दूरदर्शी आवर्धन' },
      { id: 'c12-p-ch08', chapterNumber: 8, name: 'तरंग प्रकाशिकी', englishName: 'Wave Optics', description: 'हाइगेंस सिद्धांत, यंग फ्रिंज चौड़ाई β = λD/d, ब्रूस्टर का नियम μ = tan i_p' },
      { id: 'c12-p-ch09', chapterNumber: 9, name: 'आधुनिक भौतिकी (प्रकाश विद्युत प्रभाव व परमाणु)', englishName: 'Modern Physics (Dual Nature & Atoms)', description: 'आइंस्टीन समीकरण hν = Φ₀ + K_max, डी-ब्रोग्ली λ = h/p, बोर ऊर्जा स्तर' },
    ],
  },
  {
    id: 'c12-chem',
    classId: 'class-12',
    name: 'रसायन शास्त्र',
    englishName: 'Chemistry',
    iconName: 'Flame',
    accentColor: 'amber',
    chapters: [
      { id: 'c12-c-ch01', chapterNumber: 1, name: 'विलयन (Solutions)', englishName: 'Solutions', description: 'राउल्ट का नियम, क्वथनांक उन्नयन ΔT_b = K_b·m, परासरण दाब π = CRT' },
      { id: 'c12-c-ch02', chapterNumber: 2, name: 'विद्युत रसायन (Electrochemistry)', englishName: 'Electrochemistry', description: 'नेर्न्स्ट समीकरण, कोलराउश का नियम, फैराडे का विद्युत अपघटन नियम' },
      { id: 'c12-c-ch03', chapterNumber: 3, name: 'रासायनिक बलगतिकी (Chemical Kinetics)', englishName: 'Chemical Kinetics', description: 'प्रथम कोटि वेग स्थिरांक k = (2.303/t)log(a/(a-x)), अर्ध-आयु t_½ = 0.693/k' },
      { id: 'c12-c-ch04', chapterNumber: 4, name: 'उपसहसंयोजन यौगिक', englishName: 'Coordination Compounds', description: 'वर्नर सिद्धांत, प्रभावी परमाणु क्रमांक (EAN), क्रिस्टल क्षेत्र विपाटन ऊर्जा (CFSE)' },
      { id: 'c12-c-ch05', chapterNumber: 5, name: 'कार्बनिक यौगिक (Organic Reactions & Tests)', englishName: 'Organic Named Reactions & Tests', description: 'मार्कोनीकॉफ नियम, सैत्जेफ नियम, ऐल्डोल संघनन, कैनिजारो व ल्यूकास परीक्षण' },
    ],
  },
  {
    id: 'c12-math',
    classId: 'class-12',
    name: 'गणित',
    englishName: 'Mathematics',
    iconName: 'Sigma',
    accentColor: 'indigo',
    chapters: [
      { id: 'c12-m-ch01', chapterNumber: 1, name: 'संबंध एवं फलन', englishName: 'Relations & Functions', description: 'स्वतुल्य, सममित, संक्रामक, एकैकी (Injective) एवं आच्छादक (Surjective)' },
      { id: 'c12-m-ch02', chapterNumber: 2, name: 'प्रतिलोम त्रिकोणमितीय फलन (ITF)', englishName: 'Inverse Trig Functions', description: 'मुख्य मान शाखा, sin⁻¹x + cos⁻¹x = π/2, tan⁻¹x + tan⁻¹y सूत्र' },
      { id: 'c12-m-ch03', chapterNumber: 3, name: 'आव्यूह (Matrices)', englishName: 'Matrices', description: 'परिवर्त (Transpose), सममित व विषम-सममित आव्यूह, आव्यूह गुणन नियम' },
      { id: 'c12-m-ch04', chapterNumber: 4, name: 'सारणिक (Determinants)', englishName: 'Determinants', description: 'सारणिक के गुणधर्म, सहखंडज adj(A), व्युत्क्रम A⁻¹ = (1/|A|) adj(A)' },
      { id: 'c12-m-ch05', chapterNumber: 5, name: 'सांतत्य तथा अवकलनीयता', englishName: 'Continuity & Differentiability', description: 'श्रृंखला नियम (Chain Rule), अस्पष्ट फलनों का अवकलन, रोले का प्रमेय' },
      { id: 'c12-m-ch07', chapterNumber: 6, name: 'समाकलन (Integrals)', englishName: 'Integrals (Calculus)', description: 'मानक समाकलन, खंडशः समाकलन (By Parts) ∫ u·v dx, निश्चित समाकलन गुणधर्म' },
      { id: 'c12-m-ch09', chapterNumber: 7, name: 'अवकल समीकरण', englishName: 'Differential Equations', description: 'कोटि एवं घात, पृथक्करणीय चर, प्रथम कोटि रैखिक समीकरण व समाकलन गुणक (I.F.)' },
      { id: 'c12-m-ch10', chapterNumber: 8, name: 'सदिश बीजगणित (Vector Algebra)', englishName: 'Vector Algebra', description: 'अदिश गुणनफल (Dot Product) a·b, सदिश गुणनफल (Cross Product) a×b, प्रक्षेप' },
      { id: 'c12-m-ch11', chapterNumber: 9, name: 'त्रिविमीय ज्यामिति (3D Geometry)', englishName: 'Three Dimensional Geometry', description: 'दिक्-कोज्याएँ l²+m²+n² = 1, रेखा का समीकरण, दो विषमतलीय रेखाओं के बीच न्यूनतम दूरी' },
      { id: 'c12-m-ch13', chapterNumber: 10, name: 'प्रायिकता (Probability)', englishName: 'Probability', description: 'सप्रतिबंध प्रायिकता P(A|B), बेज़ प्रमेय (Bayes Theorem), बर्नौली परीक्षण' },
    ],
  },
  {
    id: 'c12-bio',
    classId: 'class-12',
    name: 'जीव विज्ञान',
    englishName: 'Biology',
    iconName: 'Dna',
    accentColor: 'emerald',
    chapters: [
      { id: 'c12-b-ch01', chapterNumber: 1, name: 'वंशागति तथा विविधता के सिद्धांत', englishName: 'Principles of Inheritance & Genetics', description: 'मेन्डेलियन द्विसंकर क्रॉस अनुपात (9:3:3:1), हार्डी-वेनबर्ग साम्यावस्था सूत्र' },
      { id: 'c12-b-ch02', chapterNumber: 2, name: 'पारिस्थितिकी एवं जीव संख्या वृद्धि', englishName: 'Ecology & Population Dynamics', description: 'चरघातांकी वृद्धि N_t = N₀ e^(rt), लॉजिस्टिक वृद्धि dN/dt = rN((K-N)/K)' },
    ],
  },
];

export const FORMULA_ITEMS: FormulaItem[] = [
  // =========================================================================
  // CLASS 10 MATHEMATICS
  // =========================================================================
  {
    id: 'c10-m-01-01',
    classId: 'class-10',
    subjectId: 'c10-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c10-m-ch01',
    chapterName: 'वास्तविक संख्याएं (Real Numbers)',
    chapterNumber: 1,
    title: 'यूक्लिड विभाजन प्रमेयिका (Euclid\'s Division Lemma)',
    formula: 'a = bq + r ,   जहाँ 0 ≤ r < b',
    explanation: 'दो धनात्मक पूर्णांक a और b दिए रहने पर ऐसी अद्वितीय पूर्ण संख्याएँ q (भागफल) और r (शेषफल) विद्यमान हैं कि a = bq + r होता है। इसका उपयोग महत्तम समापवर्तक (HCF) ज्ञात करने में होता है।',
    variables: [
      { symbol: 'a', meaning: 'भाज्य (Dividend)' },
      { symbol: 'b', meaning: 'भाजक (Divisor)' },
      { symbol: 'q', meaning: 'भागफल (Quotient)' },
      { symbol: 'r', meaning: 'शेषफल (Remainder)' }
    ],
    derivationSummary: 'भाज्य = भाजक × भागफल + शेषफल। जब r = 0 हो जाता है, उस चरण का भाजक b ही HCF कहलाता है।',
    isVVI: true,
  },
  {
    id: 'c10-m-01-02',
    classId: 'class-10',
    subjectId: 'c10-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c10-m-ch01',
    chapterName: 'वास्तविक संख्याएं (Real Numbers)',
    chapterNumber: 1,
    title: 'HCF एवं LCM का गुणनफल संबंध',
    formula: 'HCF(a, b) × LCM(a, b) = a × b',
    explanation: 'किन्हीं दो धनात्मक पूर्णांकों a तथा b के लिए उनके महत्तम समापवर्तक (HCF) और लघुत्तम समापवर्त्य (LCM) का गुणनफल दोनों संख्याओं के गुणनफल के बराबर होता है।',
    variables: [
      { symbol: 'HCF(a, b)', meaning: 'संख्या a और b का महत्तम समापवर्तक' },
      { symbol: 'LCM(a, b)', meaning: 'संख्या a और b का लघुत्तम समापवर्त्य' },
      { symbol: 'a, b', meaning: 'दी गई दो धनात्मक पूर्णांक संख्याएँ' }
    ],
    derivationSummary: 'अभाज्य गुणनखंडन विधि द्वारा प्रत्येक उभयनिष्ठ अभाज्य गुणनखंड की सबसे छोटी घात का गुणनफल HCF तथा सबसे बड़ी घात का गुणनफल LCM होता है।',
    isVVI: true,
  },
  {
    id: 'c10-m-02-01',
    classId: 'class-10',
    subjectId: 'c10-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c10-m-ch02',
    chapterName: 'बहुपद (Polynomials)',
    chapterNumber: 2,
    title: 'द्विघात बहुपद के शून्यक और गुणांकों में संबंध',
    formula: 'α + β = -b / a ,   α · β = c / a',
    explanation: 'यदि α और β किसी द्विघात बहुपद ax² + bx + c (a ≠ 0) के शून्यक हों, तो शून्यकों का योगफल -b/a तथा शून्यकों का गुणनफल c/a के बराबर होता है।',
    variables: [
      { symbol: 'a', meaning: 'x² का गुणांक' },
      { symbol: 'b', meaning: 'x का गुणांक' },
      { symbol: 'c', meaning: 'अचर पद' },
      { symbol: 'α, β', meaning: 'द्विघात बहुपद के दो शून्यक' }
    ],
    derivationSummary: 'द्विघात बहुपद k(x - α)(x - β) = k[x² - (α+β)x + αβ] की तुलना ax² + bx + c से करने पर यह संबंध प्राप्त होता है।',
    isVVI: true,
  },
  {
    id: 'c10-m-02-02',
    classId: 'class-10',
    subjectId: 'c10-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c10-m-ch02',
    chapterName: 'बहुपद (Polynomials)',
    chapterNumber: 2,
    title: 'त्रिघात बहुपद के शून्यक और गुणांक संबंध',
    formula: 'α + β + γ = -b/a ,   αβ + βγ + γα = c/a ,   αβγ = -d/a',
    explanation: 'त्रिघात बहुपद p(x) = ax³ + bx² + cx + d (a ≠ 0) के तीन शून्यकों α, β, γ के लिए यह महत्वपूर्ण संबंध बिहार बोर्ड परीक्षा में बार-बार पूछा जाता है।',
    variables: [
      { symbol: 'a, b, c, d', meaning: 'क्रमशः x³, x², x के गुणांक तथा अचर पद' },
      { symbol: 'α, β, γ', meaning: 'त्रिघात बहुपद के तीन शून्यक' }
    ],
    isVVI: true,
  },
  {
    id: 'c10-m-03-01',
    classId: 'class-10',
    subjectId: 'c10-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c10-m-ch03',
    chapterName: 'दो चर वाले रैखिक समीकरण (Pair of Linear Equations)',
    chapterNumber: 3,
    title: 'रैखिक समीकरण युग्म की संगतता एवं हल की शर्तें',
    formula: '1. a₁/a₂ ≠ b₁/b₂ (अद्वितीय हल) | 2. a₁/a₂ = b₁/b₂ = c₁/c₂ (अनंत हल) | 3. a₁/a₂ = b₁/b₂ ≠ c₁/c₂ (कोई हल नहीं)',
    explanation: 'दो चर वाले रैखिक समीकरण युग्म a₁x + b₁y + c₁ = 0 तथा a₂x + b₂y + c₂ = 0 की प्रकृति गुणांकों के अनुपात से तुरंत निर्धारित होती है।',
    variables: [
      { symbol: 'a₁/a₂ ≠ b₁/b₂', meaning: 'रेखाएं प्रतिच्छेदी, केवल एक अद्वितीय हल, संगत युग्म' },
      { symbol: 'a₁/a₂ = b₁/b₂ = c₁/c₂', meaning: 'रेखाएं संपाती, अपरिमित रूप से अनेक हल, आश्रित/संगत युग्म' },
      { symbol: 'a₁/a₂ = b₁/b₂ ≠ c₁/c₂', meaning: 'रेखाएं समांतर, कोई हल नहीं, असंगत युग्म' }
    ],
    isVVI: true,
  },
  {
    id: 'c10-m-04-01',
    classId: 'class-10',
    subjectId: 'c10-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c10-m-ch04',
    chapterName: 'द्विघात समीकरण (Quadratic Equations)',
    chapterNumber: 4,
    title: 'श्रीधराचार्य द्विघाती सूत्र (Quadratic Formula)',
    formula: 'x = (-b ± √(b² - 4ac)) / (2a)',
    explanation: 'मानक रूप ax² + bx + c = 0 के मूल ज्ञात करने का सार्वभौमिक सूत्र। विविक्तकर (Discriminant) D = b² - 4ac होता है। यदि D > 0 तो दो भिन्न वास्तविक मूल, D = 0 तो दो बराबर मूल, D < 0 तो कोई वास्तविक मूल नहीं।',
    variables: [
      { symbol: 'a', meaning: 'x² का गुणांक (a ≠ 0)' },
      { symbol: 'b', meaning: 'x का गुणांक' },
      { symbol: 'c', meaning: 'अचर पद' },
      { symbol: 'D', meaning: 'विविक्तकर = b² - 4ac' }
    ],
    derivationSummary: 'पूर्ण वर्ग बनाने की विधि (Completing the Square) से व्युत्पन्न।',
    calculatorType: 'quadratic',
    isVVI: true,
  },
  {
    id: 'c10-m-05-01',
    classId: 'class-10',
    subjectId: 'c10-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c10-m-ch05',
    chapterName: 'समांतर श्रेढ़ी (Arithmetic Progressions)',
    chapterNumber: 5,
    title: 'A.P. का nवाँ पद (General Term)',
    formula: 'aₙ = a + (n - 1)d',
    explanation: 'समांतर श्रेढ़ी का प्रथम पद a और सार्व अंतर d हो, तो nवाँ पद aₙ इस सूत्र से निकलता है। यदि अंतिम पद l दिया हो तो l = a + (n - 1)d।',
    variables: [
      { symbol: 'aₙ', meaning: 'nवाँ पद' },
      { symbol: 'a', meaning: 'प्रथम पद (First term)' },
      { symbol: 'n', meaning: 'पदों की कुल संख्या (Positive Integer)' },
      { symbol: 'd', meaning: 'सार्व अंतर (d = a₂ - a₁)' }
    ],
    isVVI: true,
  },
  {
    id: 'c10-m-05-02',
    classId: 'class-10',
    subjectId: 'c10-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c10-m-ch05',
    chapterName: 'समांतर श्रेढ़ी (Arithmetic Progressions)',
    chapterNumber: 5,
    title: 'A.P. के प्रथम n पदों का योगफल',
    formula: 'Sₙ = n/2 [2a + (n - 1)d]   या   Sₙ = n/2 [a + l]',
    explanation: 'समांतर श्रेढ़ी के पहले n पदों का कुल योग ज्ञात करने का सूत्र। यदि पहला और अंतिम पद (l) ज्ञात हो तो Sₙ = n/2(a + l) त्वरित हल देता है।',
    variables: [
      { symbol: 'Sₙ', meaning: 'प्रथम n पदों का योगफल' },
      { symbol: 'a', meaning: 'प्रथम पद' },
      { symbol: 'l', meaning: 'अंतिम पद (aₙ)' },
      { symbol: 'd', meaning: 'सार्व अंतर' }
    ],
    isVVI: true,
  },
  {
    id: 'c10-m-08-01',
    classId: 'class-10',
    subjectId: 'c10-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c10-m-ch08',
    chapterName: 'त्रिकोणमिति का परिचय एवं सर्वसमिकाएँ (Trigonometry)',
    chapterNumber: 6,
    title: 'मौलिक त्रिकोणमितीय सर्वसमिकाएँ (Trig Identities)',
    formula: 'sin²θ + cos²θ = 1 ,   1 + tan²θ = sec²θ ,   1 + cot²θ = cosec²θ',
    explanation: 'समकोण त्रिभुज में पाइथागोरस प्रमेय (कर्ण² = लंब² + आधार²) से प्राप्त तीनों मौलिक सर्वसमिकाएं जो सभी कोणों 0° ≤ θ ≤ 90° के लिए सत्य हैं।',
    variables: [
      { symbol: 'θ', meaning: 'कोण (Angle)' },
      { symbol: 'sin θ', meaning: 'लंब / कर्ण (p/h)' },
      { symbol: 'cos θ', meaning: 'आधार / कर्ण (b/h)' },
      { symbol: 'tan θ', meaning: 'लंब / आधार (p/b)' }
    ],
    derivationSummary: 'p² + b² = h² में h² से भाग देने पर: (p/h)² + (b/h)² = 1 ⇒ sin²θ + cos²θ = 1।',
    isVVI: true,
  },
  {
    id: 'c10-m-08-02',
    classId: 'class-10',
    subjectId: 'c10-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c10-m-ch08',
    chapterName: 'त्रिकोणमिति का परिचय एवं सर्वसमिकाएँ (Trigonometry)',
    chapterNumber: 6,
    title: 'पूरक कोणों के त्रिकोणमितीय अनुपात (Complementary Angles)',
    formula: 'sin(90° - θ) = cos θ | cos(90° - θ) = sin θ | tan(90° - θ) = cot θ',
    explanation: 'जब दो कोणों का योग 90° होता है, तो वे एक-दूसरे के पूरक कहलाते हैं। sec(90° - θ) = cosec θ तथा cosec(90° - θ) = sec θ भी लागू होते हैं।',
    variables: [
      { symbol: '90° - θ', meaning: 'कोण θ का पूरक कोण' }
    ],
    isVVI: true,
  },
  {
    id: 'c10-m-07-01',
    classId: 'class-10',
    subjectId: 'c10-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c10-m-ch07',
    chapterName: 'निर्देशांक ज्यामिति (Coordinate Geometry)',
    chapterNumber: 7,
    title: 'दो बिंदुओं के बीच दूरी सूत्र (Distance Formula)',
    formula: 'd = √[(x₂ - x₁)² + (y₂ - y₁)²]',
    explanation: 'कार्तीय तल पर स्थित दो बिंदुओं P(x₁, y₁) तथा Q(x₂, y₂) के बीच की सीधी दूरी ज्ञात करने का सूत्र। मूल बिंदु (0, 0) से दूरी √(x² + y²) होती है।',
    variables: [
      { symbol: 'x₁, y₁', meaning: 'पहले बिंदु के निर्देशांक' },
      { symbol: 'x₂, y₂', meaning: 'दूसरे बिंदु के निर्देशांक' },
      { symbol: 'd', meaning: 'दोनों बिंदुओं के बीच की अभीष्ट दूरी' }
    ],
    isVVI: true,
  },
  {
    id: 'c10-m-07-02',
    classId: 'class-10',
    subjectId: 'c10-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c10-m-ch07',
    chapterName: 'निर्देशांक ज्यामिति (Coordinate Geometry)',
    chapterNumber: 7,
    title: 'विभाजन सूत्र एवं मध्य बिंदु (Section & Midpoint Formula)',
    formula: 'x = (m₁x₂ + m₂x₁) / (m₁ + m₂) ,   y = (m₁y₂ + m₂y₁) / (m₁ + m₂) | मध्य बिंदु = ((x₁+x₂)/2, (y₁+y₂)/2)',
    explanation: 'बिंदुओं A(x₁, y₁) और B(x₂, y₂) को मिलाने वाले रेखाखंड को आंतरिक रूप से m₁ : m₂ के अनुपात में विभाजित करने वाले बिंदु के निर्देशांक।',
    variables: [
      { symbol: 'm₁ : m₂', meaning: 'विभाजन अनुपात' },
      { symbol: 'x, y', meaning: 'विभाजन बिंदु के अभीष्ट निर्देशांक' }
    ],
    isVVI: true,
  },
  {
    id: 'c10-m-10-01',
    classId: 'class-10',
    subjectId: 'c10-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c10-m-ch10',
    chapterName: 'वृत्त एवं संबंधित क्षेत्रफल (Circles)',
    chapterNumber: 8,
    title: 'त्रिज्यखंड का क्षेत्रफल एवं चाप की लंबाई',
    formula: 'क्षेत्रफल = (θ / 360°) × πr² ,   चाप की लंबाई l = (θ / 360°) × 2πr',
    explanation: 'r त्रिज्या वाले वृत्त के उस त्रिज्यखंड का क्षेत्रफल और उसके संगत चाप की लंबाई, जिसका केंद्र पर अंतरित कोण θ अंश है।',
    variables: [
      { symbol: 'r', meaning: 'वृत्त की त्रिज्या', unit: 'cm / m' },
      { symbol: 'θ', meaning: 'त्रिज्यखंड का केंद्रीय कोण (डिग्री में)' },
      { symbol: 'π', meaning: 'स्थिरांक ≈ 22/7 या 3.14' }
    ],
    isVVI: true,
  },
  {
    id: 'c10-m-13-01',
    classId: 'class-10',
    subjectId: 'c10-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c10-m-ch13',
    chapterName: 'पृष्ठीय क्षेत्रफल और आयतन (Surface Areas & Volumes)',
    chapterNumber: 9,
    title: 'बेलन, शंकु और गोला: महत्वपूर्ण आयतन व पृष्ठ सूत्र',
    formula: 'बेलन V = πr²h (CSA = 2πrh) | शंकु V = ⅓πr²h (CSA = πrl) | गोला V = ⁴⁄₃πr³ (SA = 4πr²)',
    explanation: 'ठोस आकृतियों के संपूर्ण आयतन और वक्र पृष्ठीय क्षेत्रफल। शंकु की तिर्यक ऊँचाई l = √(r² + h²) होती है।',
    variables: [
      { symbol: 'r', meaning: 'त्रिज्या' },
      { symbol: 'h', meaning: 'ऊँचाई' },
      { symbol: 'l', meaning: 'तिर्यक ऊँचाई (Slant Height)' }
    ],
    isVVI: true,
  },
  {
    id: 'c10-m-14-01',
    classId: 'class-10',
    subjectId: 'c10-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c10-m-ch14',
    chapterName: 'सांख्यिकी (Statistics)',
    chapterNumber: 10,
    title: 'माध्य, बहुलक, माध्यक एवं आनुभविक संबंध',
    formula: 'बहुलक = 3 × माध्यक - 2 × माध्य   तथा   माध्य x̄ = (Σ fᵢxᵢ) / (Σ fᵢ)',
    explanation: 'केंद्रीय प्रवृत्ति के तीनों मापकों (Mean, Median, Mode) के मध्य स्थापित यह आनुभविक संबंध (Empirical Formula) बिहार बोर्ड ऑब्जेक्टिव में हर वर्ष 100% पूछा जाता है।',
    variables: [
      { symbol: 'x̄', meaning: 'समांतर माध्य (Mean)' },
      { symbol: 'माध्यक (M)', meaning: 'Median' },
      { symbol: 'बहुलक (Z)', meaning: 'Mode' },
      { symbol: 'fᵢ', meaning: 'बारंबारता (Frequency)' }
    ],
    isVVI: true,
  },
  {
    id: 'c10-m-15-01',
    classId: 'class-10',
    subjectId: 'c10-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c10-m-ch15',
    chapterName: 'प्रायिकता (Probability)',
    chapterNumber: 11,
    title: 'सैद्धांतिक प्रायिकता एवं पूरक घटना',
    formula: 'P(E) = n(E) / n(S) ,   P(E) + P(Ē) = 1 ,   0 ≤ P(E) ≤ 1',
    explanation: 'किसी घटना E की प्रायिकता अनुकूल परिणामों की संख्या तथा कुल संभव परिणामों की संख्या का अनुपात होती है। निश्चित घटना की प्रायिकता 1 और असंभव घटना की प्रायिकता 0 होती है।',
    variables: [
      { symbol: 'P(E)', meaning: 'घटना E घटित होने की प्रायिकता' },
      { symbol: 'P(Ē)', meaning: 'घटना E न घटित होने की प्रायिकता' },
      { symbol: 'n(E)', meaning: 'E के अनुकूल परिणामों की संख्या' },
      { symbol: 'n(S)', meaning: 'प्रयोग के सभी संभव परिणामों की संख्या (प्रतिदर्श समष्टि)' }
    ],
    isVVI: true,
  },

  // =========================================================================
  // CLASS 10 SCIENCE (PHYSICS, CHEMISTRY, BIOLOGY)
  // =========================================================================
  {
    id: 'c10-s-01-01',
    classId: 'class-10',
    subjectId: 'c10-sci',
    subjectName: 'विज्ञान (Science)',
    chapterId: 'c10-s-ch01',
    chapterName: 'प्रकाश का परावर्तन एवं गोलीय दर्पण',
    chapterNumber: 1,
    title: 'गोलीय दर्पण सूत्र एवं रेखीय आवर्धन',
    formula: '1/f = 1/v + 1/u   तथा   m = -v/u = h\'/h',
    explanation: 'गोलीय दर्पण (अवतल एवं उत्तल) की फोकस दूरी f, प्रतिबिंब की दूरी v तथा वस्तु की दूरी u के बीच मौलिक संबंध। अवतल दर्पण के लिए f ऋणात्मक तथा उत्तल के लिए धनात्मक होती है।',
    variables: [
      { symbol: 'f', meaning: 'फोकस दूरी (f = R/2)', unit: 'cm / m' },
      { symbol: 'v', meaning: 'प्रतिबिंब की दूरी', unit: 'cm / m' },
      { symbol: 'u', meaning: 'वस्तु की दूरी (हमेशा ऋणात्मक)', unit: 'cm / m' },
      { symbol: 'm', meaning: 'रेखीय आवर्धन (ऋणात्मक = वास्तविक, धनात्मक = आभासी)' }
    ],
    derivationSummary: 'ज्यामितीय परावर्तन और समरूप त्रिभुज नियम से 1/f = 1/v + 1/u प्राप्त होता है।',
    isVVI: true,
  },
  {
    id: 'c10-s-02-01',
    classId: 'class-10',
    subjectId: 'c10-sci',
    subjectName: 'विज्ञान (Science)',
    chapterId: 'c10-s-ch02',
    chapterName: 'प्रकाश का अपवर्तन एवं लेंस',
    chapterNumber: 2,
    title: 'लेंस सूत्र, आवर्धन एवं लेंस की क्षमता',
    formula: '1/f = 1/v - 1/u ,   m = v/u ,   P = 1 / f (मीटर में) डायोप्टर (D)',
    explanation: 'लेंस की फोकस दूरी (f), प्रतिबिंब दूरी (v) और वस्तु दूरी (u) का संबंध। उत्तल लेंस के लिए f और क्षमता P धनात्मक, अवतल लेंस के लिए ऋणात्मक होती है।',
    variables: [
      { symbol: 'f', meaning: 'लेंस की फोकस दूरी', unit: 'मीटर (m) या सेमी' },
      { symbol: 'v', meaning: 'प्रतिबिंब दूरी', unit: 'cm / m' },
      { symbol: 'u', meaning: 'वस्तु दूरी', unit: 'cm / m' },
      { symbol: 'P', meaning: 'लेंस की क्षमता (Power of Lens)', unit: 'डायोप्टर (D)' }
    ],
    calculatorType: 'lens_formula',
    isVVI: true,
  },
  {
    id: 'c10-s-02-02',
    classId: 'class-10',
    subjectId: 'c10-sci',
    subjectName: 'विज्ञान (Science)',
    chapterId: 'c10-s-ch02',
    chapterName: 'प्रकाश का अपवर्तन एवं लेंस',
    chapterNumber: 2,
    title: 'स्नेल का नियम (Snell\'s Law of Refraction)',
    formula: 'sin i / sin r = n₂₁ = n₂ / n₁ = μ',
    explanation: 'किन्हीं दो माध्यमों और एक ही रंग के प्रकाश के लिए आपतन कोण की ज्या (sin i) तथा अपवर्तन कोण की ज्या (sin r) का अनुपात एक स्थिरांक होता है, जिसे दूसरे माध्यम का पहले माध्यम के सापेक्ष अपवर्तनांक कहते हैं।',
    variables: [
      { symbol: 'i', meaning: 'आपतन कोण (Angle of Incidence)' },
      { symbol: 'r', meaning: 'अपवर्तन कोण (Angle of Refraction)' },
      { symbol: 'n₂₁ / μ', meaning: 'सापेक्ष अपवर्तनांक (Refractive Index)' }
    ],
    isVVI: true,
  },
  {
    id: 'c10-s-04-01',
    classId: 'class-10',
    subjectId: 'c10-sci',
    subjectName: 'विज्ञान (Science)',
    chapterId: 'c10-s-ch04',
    chapterName: 'विद्युत एवं धारा के प्रभाव (Electricity)',
    chapterNumber: 4,
    title: 'ओम का नियम (Ohm\'s Law)',
    formula: 'V = I · R   ⇒   I = V / R   ⇒   R = V / I',
    explanation: 'यदि किसी चालक की भौतिक अवस्थाएं (जैसे ताप, अनुप्रस्थ काट क्षेत्रफल) स्थिर रहें, तो चालक के सिरों पर लगाया गया विभवांतर (V) उसमें प्रवाहित विद्युत धारा (I) के समानुपाती होता है।',
    variables: [
      { symbol: 'V', meaning: 'विभवांतर (Voltage)', unit: 'वोल्ट (V)' },
      { symbol: 'I', meaning: 'विद्युत धारा (Current)', unit: 'एम्पीयर (A)' },
      { symbol: 'R', meaning: 'चालक का प्रतिरोध (Resistance)', unit: 'ओम (Ω)' }
    ],
    calculatorType: 'ohms_law',
    isVVI: true,
  },
  {
    id: 'c10-s-04-02',
    classId: 'class-10',
    subjectId: 'c10-sci',
    subjectName: 'विज्ञान (Science)',
    chapterId: 'c10-s-ch04',
    chapterName: 'विद्युत एवं धारा के प्रभाव (Electricity)',
    chapterNumber: 4,
    title: 'प्रतिरोधों का श्रेणीक्रम एवं समांतरक्रम संयोजन',
    formula: 'श्रेणीक्रम: R_s = R₁ + R₂ + R₃ | समांतरक्रम: 1/R_p = 1/R₁ + 1/R₂ + 1/R₃',
    explanation: 'श्रेणीक्रम में प्रत्येक प्रतिरोध से समान धारा बहती है और कुल प्रतिरोध अधिकतम होता है। समांतरक्रम में प्रत्येक प्रतिरोध के सिरों पर विभवांतर समान रहता है और कुल प्रतिरोध न्यूनतम होता है।',
    variables: [
      { symbol: 'R_s', meaning: 'श्रेणीक्रम में तुल्य प्रतिरोध' },
      { symbol: 'R_p', meaning: 'समांतरक्रम में तुल्य प्रतिरोध' }
    ],
    isVVI: true,
  },
  {
    id: 'c10-s-04-03',
    classId: 'class-10',
    subjectId: 'c10-sci',
    subjectName: 'विज्ञान (Science)',
    chapterId: 'c10-s-ch04',
    chapterName: 'विद्युत एवं धारा के प्रभाव (Electricity)',
    chapterNumber: 4,
    title: 'जूल का तापन नियम एवं विद्युत शक्ति',
    formula: 'H = I² · R · t   तथा   P = V · I = I²R = V² / R',
    explanation: 'किसी प्रतिरोध R में t समय तक धारा I प्रवाहित होने पर उत्पन्न ऊष्मा धारा के वर्ग के समानुपाती होती है। 1 यूनिट विद्युत ऊर्जा = 1 kWh = 3.6 × 10⁶ जूल।',
    variables: [
      { symbol: 'H', meaning: 'उत्पन्न ऊष्मा', unit: 'जूल (J)' },
      { symbol: 'P', meaning: 'विद्युत शक्ति (Power)', unit: 'वाट (W)' },
      { symbol: 't', meaning: 'समय', unit: 'सेकंड (s)' }
    ],
    isVVI: true,
  },
  {
    id: 'c10-s-06-01',
    classId: 'class-10',
    subjectId: 'c10-sci',
    subjectName: 'विज्ञान (Science)',
    chapterId: 'c10-s-ch06',
    chapterName: 'अम्ल, क्षारक एवं लवण (Acids, Bases & Salts)',
    chapterNumber: 6,
    title: 'pH मान गणना सूत्र एवं स्केल',
    formula: 'pH = -log₁₀[H⁺]   तथा   pH + pOH = 14 (25°C पर)',
    explanation: 'विलयन में उपस्थित हाइड्रोजन आयनों की सांद्रता का ऋणात्मक लघुगणक pH कहलाता है। pH < 7 अम्लीय, pH = 7 उदासीन, pH > 7 क्षारीय। मानव रक्त का pH लगभग 7.4 होता है।',
    variables: [
      { symbol: '[H⁺]', meaning: 'हाइड्रोजन आयन सांद्रता', unit: 'mol/L' },
      { symbol: 'pH', meaning: 'अम्लता/क्षारकता सूचकांक' }
    ],
    isVVI: true,
  },

  // =========================================================================
  // CLASS 12 PHYSICS
  // =========================================================================
  {
    id: 'c12-p-01-01',
    classId: 'class-12',
    subjectId: 'c12-phy',
    subjectName: 'भौतिकी (Physics)',
    chapterId: 'c12-p-ch01',
    chapterName: 'वैद्युत आवेश तथा क्षेत्र (Electric Charges & Fields)',
    chapterNumber: 1,
    title: 'कूलॉम का नियम (Coulomb\'s Law of Electrostatics)',
    formula: 'F = k · (|q₁ · q₂|) / r² = (1 / 4πε₀) · (|q₁ · q₂|) / r²',
    explanation: 'दो स्थिर बिंदु आवेशों के बीच लगने वाला आकर्षण या प्रतिकर्षण बल दोनों आवेशों के परिमाण के गुणनफल के समानुपाती तथा उनके बीच की दूरी के वर्ग के व्युत्क्रमानुपाती होता है।',
    variables: [
      { symbol: 'F', meaning: 'विद्युत बल', unit: 'न्यूटन (N)' },
      { symbol: 'k', meaning: 'स्थिरांक = 1/(4πε₀) = 9 × 10⁹', unit: 'N·m²/C²' },
      { symbol: 'q₁, q₂', meaning: 'बिंदु आवेश', unit: 'कूलॉम (C)' },
      { symbol: 'r', meaning: 'आवेशों के बीच की दूरी', unit: 'मीटर (m)' },
      { symbol: 'ε₀', meaning: 'निर्वात की विद्युतशीलता = 8.854 × 10⁻¹²', unit: 'C²/(N·m²)' }
    ],
    derivationSummary: 'F ∝ |q₁q₂| तथा F ∝ 1/r² ⇒ F = k·|q₁q₂|/r²।',
    calculatorType: 'coulombs_law',
    isVVI: true,
  },
  {
    id: 'c12-p-01-02',
    classId: 'class-12',
    subjectId: 'c12-phy',
    subjectName: 'भौतिकी (Physics)',
    chapterId: 'c12-p-ch01',
    chapterName: 'वैद्युत आवेश तथा क्षेत्र (Electric Charges & Fields)',
    chapterNumber: 1,
    title: 'गाउस का नियम (Gauss\'s Law)',
    formula: 'Φ_E = ∮ E · dA = q_enclosed / ε₀',
    explanation: 'किसी बंद काल्पनिक पृष्ठ (गाउसीय पृष्ठ) से गुजरने वाला कुल विद्युत फ्लक्स उस पृष्ठ द्वारा परिबद्ध कुल नेट आवेश का 1/ε₀ गुना होता है।',
    variables: [
      { symbol: 'Φ_E', meaning: 'कुल विद्युत फ्लक्स', unit: 'N·m²/C या V·m' },
      { symbol: 'E', meaning: 'विद्युत क्षेत्र की तीव्रता सदिश', unit: 'N/C' },
      { symbol: 'dA', meaning: 'अल्पांश क्षेत्रफल सदिश', unit: 'm²' },
      { symbol: 'q_enclosed', meaning: 'बंद सतह द्वारा परिबद्ध कुल आवेश', unit: 'C' }
    ],
    derivationSummary: 'गोलीय पृष्ठ के लिए Φ = E(4πr²) = (1/4πε₀ · q/r²)(4πr²) = q/ε₀।',
    isVVI: true,
  },
  {
    id: 'c12-p-01-03',
    classId: 'class-12',
    subjectId: 'c12-phy',
    subjectName: 'भौतिकी (Physics)',
    chapterId: 'c12-p-ch01',
    chapterName: 'वैद्युत आवेश तथा क्षेत्र (Electric Charges & Fields)',
    chapterNumber: 1,
    title: 'विद्युत द्विध्रुव आघूर्ण एवं बल आघूर्ण',
    formula: 'p = q · (2a)   तथा   τ = p × E = p E sin θ',
    explanation: 'विद्युत द्विध्रुव आघूर्ण (p) एक सदिश राशि है जिसकी दिशा ऋणावेश से धनावेश की ओर होती है। एकसमान विद्युत क्षेत्र E में रखे द्विध्रुव पर लगने वाला बल आघूर्ण τ = p × E होता है।',
    variables: [
      { symbol: 'p', meaning: 'विद्युत द्विध्रुव आघूर्ण', unit: 'कूलॉम-मीटर (C·m)' },
      { symbol: '2a', meaning: 'दोनों आवेशों के बीच की दूरी', unit: 'm' },
      { symbol: 'τ', meaning: 'बल आघूर्ण (Torque)', unit: 'N·m' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-p-02-01',
    classId: 'class-12',
    subjectId: 'c12-phy',
    subjectName: 'भौतिकी (Physics)',
    chapterId: 'c12-p-ch02',
    chapterName: 'स्थिरवैद्युत विभव तथा धारिता',
    chapterNumber: 2,
    title: 'समांतर पट्टिका संधारित्र की धारिता एवं स्थितिज ऊर्जा',
    formula: 'C = (ε₀ · A) / d   तथा   U = ½ C V² = ½ Q V = Q² / (2C)',
    explanation: 'निर्वात में d दूरी पर स्थित A क्षेत्रफल वाली दो समांतर प्लेटों की धारिता। यदि प्लेटों के बीच K परावैद्युतांक का माध्यम भरा जाए तो धारिता K गुना बढ़कर C\' = K·C हो जाती है।',
    variables: [
      { symbol: 'C', meaning: 'धारिता (Capacitance)', unit: 'फैराड (F)' },
      { symbol: 'A', meaning: 'पट्टिका का क्षेत्रफल', unit: 'm²' },
      { symbol: 'd', meaning: 'पट्टिकाओं के बीच पृथकन दूरी', unit: 'm' },
      { symbol: 'U', meaning: 'संग्रहीत स्थिर वैद्युत ऊर्जा', unit: 'जूल (J)' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-p-03-01',
    classId: 'class-12',
    subjectId: 'c12-phy',
    subjectName: 'भौतिकी (Physics)',
    chapterId: 'c12-p-ch03',
    chapterName: 'विद्युत धारा (Current Electricity)',
    chapterNumber: 3,
    title: 'अपवाह वेग (Drift Velocity) एवं धारा में संबंध',
    formula: 'v_d = (e · E · τ) / m   तथा   I = n · e · A · v_d',
    explanation: 'विद्युत क्षेत्र E की उपस्थिति में मुक्त इलेक्ट्रॉन एक सूक्ष्म औसत वेग (v_d) से धन सिरे की ओर गति करते हैं। धारा घनत्व j = I/A = n e v_d = σ E होता है।',
    variables: [
      { symbol: 'v_d', meaning: 'अपवाह वेग', unit: 'm/s' },
      { symbol: 'e', meaning: 'इलेक्ट्रॉन आवेश = 1.6 × 10⁻¹⁹ C' },
      { symbol: 'τ', meaning: 'विश्रांति काल (Relaxation Time)', unit: 's' },
      { symbol: 'n', meaning: 'प्रति एकांक आयतन में मुक्त इलेक्ट्रॉन संख्या' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-p-03-02',
    classId: 'class-12',
    subjectId: 'c12-phy',
    subjectName: 'भौतिकी (Physics)',
    chapterId: 'c12-p-ch03',
    chapterName: 'विद्युत धारा (Current Electricity)',
    chapterNumber: 3,
    title: 'किरचॉफ के नियम एवं व्हीटस्टोन सेतु संतुलन शर्त',
    formula: 'संधि नियम: Σ I = 0 (आवेश संरक्षण) | लूप नियम: Σ ΔV = 0 (ऊर्जा संरक्षण) | सेतु संतुलन: P / Q = R / S',
    explanation: 'जटिल विद्युत परिपथों को हल करने हेतु किरचॉफ के दो मौलिक नियम। जब धारामापी में कोई विक्षेप न हो (I_g = 0), तो व्हीटस्टोन सेतु संतुलित होता है।',
    variables: [
      { symbol: 'P, Q, R, S', meaning: 'व्हीटस्टोन सेतु की चारों भुजाओं के प्रतिरोध', unit: 'Ω' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-p-04-01',
    classId: 'class-12',
    subjectId: 'c12-phy',
    subjectName: 'भौतिकी (Physics)',
    chapterId: 'c12-p-ch04',
    chapterName: 'गतिमान आवेश और चुंबकत्व (Moving Charges & Magnetism)',
    chapterNumber: 4,
    title: 'बायो-सावर्ट नियम एवं लॉरेंट्ज़ बल',
    formula: 'dB = (μ₀ / 4π) · (I dl sin θ) / r²   तथा   F = q (v × B)',
    explanation: 'धारावाही चालक के अल्पांश dl द्वारा दूरी r पर उत्पन्न चुंबकीय क्षेत्र। चुंबकीय क्षेत्र B में v वेग से गतिमान q आवेश पर कार्य करने वाला बल F = qvB sinθ होता है।',
    variables: [
      { symbol: 'μ₀/4π', meaning: 'चुंबकीय स्थिरांक = 10⁻⁷', unit: 'T·m/A' },
      { symbol: 'B', meaning: 'चुंबकीय क्षेत्र की तीव्रता', unit: 'टेस्ला (T)' },
      { symbol: 'v', meaning: 'आवेशित कण का वेग', unit: 'm/s' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-p-06-01',
    classId: 'class-12',
    subjectId: 'c12-phy',
    subjectName: 'भौतिकी (Physics)',
    chapterId: 'c12-p-ch06',
    chapterName: 'प्रत्यावर्ती धारा (A.C.)',
    chapterNumber: 6,
    title: 'वर्ग माध्य मूल मान एवं श्रेणी LCR परिपथ प्रतिबाधा',
    formula: 'I_rms = I₀ / √2 ≈ 0.707 I₀   तथा   Z = √[R² + (X_L - X_C)²]',
    explanation: 'जहाँ प्रेरणिक प्रतिघात X_L = ωL तथा धारितीय प्रतिघात X_C = 1/(ωC)। अनुनाद (Resonance) की दशा में X_L = X_C होने पर प्रतिबाधा न्यूनतम (Z = R) एवं धारा अधिकतम होती है।',
    variables: [
      { symbol: 'I_rms, V_rms', meaning: 'प्रत्यावर्ती धारा एवं वोल्टता का वर्ग माध्य मूल मान' },
      { symbol: 'Z', meaning: 'परिपथ की कुल प्रतिबाधा (Impedance)', unit: 'ओम (Ω)' },
      { symbol: 'f₀', meaning: 'अनुनादी आवृत्ति = 1 / (2π√LC)', unit: 'Hz' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-p-07-01',
    classId: 'class-12',
    subjectId: 'c12-phy',
    subjectName: 'भौतिकी (Physics)',
    chapterId: 'c12-p-ch07',
    chapterName: 'किरण प्रकाशिकी एवं प्रकाशिक यंत्र (Ray Optics)',
    chapterNumber: 7,
    title: 'लेंस निर्माता सूत्र (Lens Maker\'s Formula)',
    formula: '1 / f = (μ - 1) · (1 / R₁ - 1 / R₂)',
    explanation: 'लेंस के पदार्थ के अपवर्तनांक (μ) तथा उसके दोनों पृष्ठों की वक्रता त्रिज्याओं (R₁ एवं R₂) के आधार पर फोकस दूरी f निर्धारित करने वाला सर्वोच्च बोर्ड सूत्र।',
    variables: [
      { symbol: 'μ', meaning: 'लेंस के माध्यम का अपवर्तनांक' },
      { symbol: 'R₁, R₂', meaning: 'प्रथम व द्वितीय गोलीय पृष्ठ की वक्रता त्रिज्याएं', unit: 'm या cm' },
      { symbol: 'f', meaning: 'निर्मित लेंस की फोकस दूरी' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-p-08-01',
    classId: 'class-12',
    subjectId: 'c12-phy',
    subjectName: 'भौतिकी (Physics)',
    chapterId: 'c12-p-ch08',
    chapterName: 'तरंग प्रकाशिकी (Wave Optics)',
    chapterNumber: 8,
    title: 'यंग द्विक-झिरी फ्रिंज चौड़ाई एवं ब्रूस्टर नियम',
    formula: 'β = (λ · D) / d   तथा   ब्रूस्टर नियम: μ = tan i_p',
    explanation: 'व्यतिकरण में सभी दीप्त एवं अदीप्त फ्रिंजों की चौड़ाई एकसमान होती है। ध्रुवण कोण i_p पर परावर्तित प्रकाश पूर्णतः समतल ध्रुवित होता है।',
    variables: [
      { symbol: 'β', meaning: 'फ्रिंज की चौड़ाई (Fringe Width)', unit: 'm या mm' },
      { symbol: 'λ', meaning: 'प्रयुक्त प्रकाश का तरंगदैर्घ्य', unit: 'm या Å' },
      { symbol: 'D', meaning: 'स्लिट से पर्दे की दूरी', unit: 'm' },
      { symbol: 'd', meaning: 'दोनों स्लिटों के बीच की दूरी', unit: 'm' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-p-09-01',
    classId: 'class-12',
    subjectId: 'c12-phy',
    subjectName: 'भौतिकी (Physics)',
    chapterId: 'c12-p-ch09',
    chapterName: 'आधुनिक भौतिकी (Modern Physics)',
    chapterNumber: 9,
    title: 'आइंस्टीन का प्रकाश विद्युत समीकरण एवं डी-ब्रोग्ली तरंगदैर्घ्य',
    formula: 'K_max = hν - Φ₀ = eV₀   तथा   λ = h / p = h / (m v)',
    explanation: 'आपतित फोटॉन की ऊर्जा hν धातु की कार्यफलन ऊर्जा Φ₀ तथा उत्सर्जित प्रकाश इलेक्ट्रॉन की अधिकतम गतिज ऊर्जा K_max में विभाजित होती है। V₀ निरोधी विभव है।',
    variables: [
      { symbol: 'h', meaning: 'प्लांक नियतांक = 6.63 × 10⁻³⁴ J·s' },
      { symbol: 'Φ₀', meaning: 'कार्यफलन (Work Function = hν₀)', unit: 'eV' },
      { symbol: 'V₀', meaning: 'निरोधी विभव (Stopping Potential)', unit: 'V' },
      { symbol: 'λ', meaning: 'डी-ब्रोग्ली द्रव्य तरंगदैर्घ्य', unit: 'm' }
    ],
    isVVI: true,
  },

  // =========================================================================
  // CLASS 12 CHEMISTRY
  // =========================================================================
  {
    id: 'c12-c-01-01',
    classId: 'class-12',
    subjectId: 'c12-chem',
    subjectName: 'रसायन शास्त्र (Chemistry)',
    chapterId: 'c12-c-ch01',
    chapterName: 'विलयन (Solutions)',
    chapterNumber: 1,
    title: 'राउल्ट का नियम एवं वाष्प दाब का आपेक्षिक अवनमन',
    formula: '(P° - P_s) / P° = X_B = n_B / (n_A + n_B)',
    explanation: 'अवाष्पशील विलेय युक्त तनु विलयन के वाष्प दाब का आपेक्षिक अवनमन विलेय के मोल प्रभाज (X_B) के बराबर होता है।',
    variables: [
      { symbol: 'P°', meaning: 'शुद्ध विलायक का वाष्प दाब' },
      { symbol: 'P_s', meaning: 'विलयन का वाष्प दाब' },
      { symbol: 'X_B', meaning: 'विलेय का मोल प्रभाज (Mole Fraction)' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-c-01-02',
    classId: 'class-12',
    subjectId: 'c12-chem',
    subjectName: 'रसायन शास्त्र (Chemistry)',
    chapterId: 'c12-c-ch01',
    chapterName: 'विलयन (Solutions)',
    chapterNumber: 1,
    title: 'अणुसंख्य गुणधर्म (क्वथनांक उन्नयन एवं परासरण दाब)',
    formula: 'ΔT_b = K_b · m ,   ΔT_f = K_f · m ,   π = C R T = (n/V) R T',
    explanation: 'तनु विलयनों के वे गुण जो केवल विलेय कणों की संख्या पर निर्भर करते हैं, अणुसंख्य गुणधर्म कहलाते हैं। वान्ट हॉफ गुणांक i जोड़ने पर ΔT_b = i·K_b·m हो जाता है।',
    variables: [
      { symbol: 'K_b', meaning: 'मोलल उन्नयन स्थिरांक (Ebullioscopic constant)', unit: 'K·kg/mol' },
      { symbol: 'm', meaning: 'मोललता (Molality)', unit: 'mol/kg' },
      { symbol: 'π', meaning: 'परासरण दाब (Osmotic Pressure)', unit: 'atm / bar' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-c-02-01',
    classId: 'class-12',
    subjectId: 'c12-chem',
    subjectName: 'रसायन शास्त्र (Chemistry)',
    chapterId: 'c12-c-ch02',
    chapterName: 'विद्युत रसायन (Electrochemistry)',
    chapterNumber: 2,
    title: 'नेर्न्स्ट समीकरण (Nernst Equation) एवं सेल विभव',
    formula: 'E_cell = E°_cell - (0.0591 / n) · log₁₀([Anode] / [Cathode])   (298 K पर)',
    explanation: 'मानक अवस्थाओं से भिन्न सांद्रताओं पर किसी विद्युत रासायनिक सेल का विद्युत वाहक बल (emf) ज्ञात करने हेतु नेर्न्स्ट समीकरण का उपयोग होता है।',
    variables: [
      { symbol: 'E_cell', meaning: 'सेल का ई.एम.एफ. (Electromotive Force)', unit: 'V' },
      { symbol: 'E°_cell', meaning: 'मानक सेल विभव (E°_cathode - E°_anode)', unit: 'V' },
      { symbol: 'n', meaning: 'रेडॉक्स अभिक्रिया में स्थानांतरित इलेक्ट्रॉनों की संख्या' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-c-02-02',
    classId: 'class-12',
    subjectId: 'c12-chem',
    subjectName: 'रसायन शास्त्र (Chemistry)',
    chapterId: 'c12-c-ch02',
    chapterName: 'विद्युत रसायन (Electrochemistry)',
    chapterNumber: 2,
    title: 'फैराडे का विद्युत अपघटन नियम एवं गिब्स ऊर्जा',
    formula: 'm = Z · I · t = (E / 96500) · I · t   तथा   ΔG° = -n F E°_cell',
    explanation: 'विद्युत अपघट्य में प्रवाहित विद्युत आवेश की मात्रा के समानुपाती इलेक्ट्रोड पर पदार्थ मुक्त होता है। 1 फैराडे (F) ≈ 96500 C/mol इलेक्ट्रॉन।',
    variables: [
      { symbol: 'm', meaning: 'मुक्त पदार्थ का द्रव्यमान', unit: 'ग्राम (g)' },
      { symbol: 'Z', meaning: 'विद्युत रासायनिक तुल्यांक (ECE)', unit: 'g/C' },
      { symbol: 'ΔG°', meaning: 'मानक मुक्त गिब्स ऊर्जा परिवर्तन', unit: 'J / kJ' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-c-03-01',
    classId: 'class-12',
    subjectId: 'c12-chem',
    subjectName: 'रसायन शास्त्र (Chemistry)',
    chapterId: 'c12-c-ch03',
    chapterName: 'रासायनिक बलगतिकी (Chemical Kinetics)',
    chapterNumber: 3,
    title: 'प्रथम कोटि अभिक्रिया वेग स्थिरांक एवं अर्ध-आयु काल',
    formula: 'k = (2.303 / t) · log₁₀(a / (a - x))   तथा   t_½ = 0.693 / k',
    explanation: 'प्रथम कोटि की अभिक्रिया का वेग केवल एक अभिकारक की सांद्रता के समानुपाती होता है। प्रथम कोटि की अर्ध-आयु प्रारंभिक सांद्रता (a) पर निर्भर नहीं करती।',
    variables: [
      { symbol: 'k', meaning: 'वेग स्थिरांक (Rate Constant)', unit: 's⁻¹ या min⁻¹' },
      { symbol: 'a', meaning: 'अभिकारक की प्रारंभिक सांद्रता' },
      { symbol: 'a - x', meaning: 'समय t पर बची हुई सांद्रता' },
      { symbol: 't_½', meaning: 'अर्ध-आयु काल (Half-life Period)' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-c-03-02',
    classId: 'class-12',
    subjectId: 'c12-chem',
    subjectName: 'रसायन शास्त्र (Chemistry)',
    chapterId: 'c12-c-ch03',
    chapterName: 'रासायनिक बलगतिकी (Chemical Kinetics)',
    chapterNumber: 3,
    title: 'आर्रेनियस समीकरण (Arrhenius Equation)',
    formula: 'k = A · e^(-E_a / RT)   या   log₁₀(k₂ / k₁) = (E_a / 2.303R) · [(T₂ - T₁) / (T₁T₂)]',
    explanation: 'ताप बढ़ने पर अभिक्रिया वेग स्थिरांक में होने वाली चरघातांकी वृद्धि को दर्शाता है। तापमान 10°C बढ़ाने पर वेग लगभग दोगुना हो जाता है।',
    variables: [
      { symbol: 'E_a', meaning: 'सक्रियण ऊर्जा (Activation Energy)', unit: 'J/mol' },
      { symbol: 'A', meaning: 'आर्रेनियस आवृत्ति कारक (Pre-exponential factor)' },
      { symbol: 'R', meaning: 'सार्वत्रिक गैस नियतांक = 8.314 J/(mol·K)' },
      { symbol: 'T', meaning: 'परम ताप (Absolute Temperature)', unit: 'Kelvin (K)' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-c-05-01',
    classId: 'class-12',
    subjectId: 'c12-chem',
    subjectName: 'रसायन शास्त्र (Chemistry)',
    chapterId: 'c12-c-ch05',
    chapterName: 'कार्बनिक यौगिक (Organic Reactions & Tests)',
    chapterNumber: 5,
    title: 'मार्कोनीकॉफ नियम एवं प्रमुख विभेद परीक्षण',
    formula: 'R-CH=CH₂ + HBr → R-CH(Br)-CH₃ (मुख्य) | ल्यूकास परीक्षण: 3° तुरंत धुंधलापन, 2° 5 मिनट, 1° सामान्य ताप पर नहीं',
    explanation: 'असममित एल्कीन पर हैलोजन अम्ल के योग में ऋणात्मक भाग उस द्विबंधित कार्बन से जुड़ता है जिस पर हाइड्रोजन की संख्या न्यूनतम होती है।',
    variables: [
      { symbol: 'ल्यूकास अभिकर्मक', meaning: 'निर्जल ZnCl₂ + सांद्र HCl' },
      { symbol: 'टॉलेन अभिकर्मक', meaning: 'अमोनिकल सिल्वर नाइट्रेट विलयन [Ag(NH₃)₂]⁺' }
    ],
    isVVI: true,
  },

  // =========================================================================
  // CLASS 12 MATHEMATICS
  // =========================================================================
  {
    id: 'c12-m-02-01',
    classId: 'class-12',
    subjectId: 'c12-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c12-m-ch02',
    chapterName: 'प्रतिलोम त्रिकोणमितीय फलन (ITF)',
    chapterNumber: 2,
    title: 'ITF महत्वपूर्ण सर्वसमिकाएं एवं योग सूत्र',
    formula: 'sin⁻¹x + cos⁻¹x = π/2 ,   tan⁻¹x + cot⁻¹x = π/2 | tan⁻¹x + tan⁻¹y = tan⁻¹[(x+y)/(1-xy)] (xy < 1)',
    explanation: 'प्रतिलोम त्रिकोणमितीय फलनों के मुख्य मान परिसर (Principal Value Branches) में यह संबंध हर बार बोर्ड परीक्षा में ऑब्जेक्टिव व 2 अंक प्रश्नों में आता है।',
    variables: [
      { symbol: 'x, y', meaning: 'फलन के प्रांत (Domain) में वास्तविक मान' },
      { symbol: '2tan⁻¹x', meaning: 'sin⁻¹(2x/(1+x²)) = cos⁻¹((1-x²)/(1+x²))' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-m-03-01',
    classId: 'class-12',
    subjectId: 'c12-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c12-m-ch03',
    chapterName: 'आव्यूह (Matrices)',
    chapterNumber: 3,
    title: 'आव्यूह परिवर्त के गुणधर्म एवं सममितता',
    formula: '(A\')\' = A ,   (A + B)\' = A\' + B\' ,   (AB)\' = B\'A\' | सममित: A\' = A ,   विषम-सममित: A\' = -A',
    explanation: 'किसी भी वर्ग आव्यूह A को एक सममित एवं एक विषम-सममित आव्यूह के योग के रूप में लिखा जा सकता है: A = ½(A + A\') + ½(A - A\')।',
    variables: [
      { symbol: 'A\' / Aᵀ', meaning: 'आव्यूह A का परिवर्त (Transpose Matrix)' },
      { symbol: 'AB', meaning: 'आव्यूह गुणन केवल तभी संभव है जब A के स्तंभ = B की पंक्तियाँ हों' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-m-04-01',
    classId: 'class-12',
    subjectId: 'c12-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c12-m-ch04',
    chapterName: 'सारणिक (Determinants)',
    chapterNumber: 4,
    title: 'सहखंडज एवं व्युत्क्रम आव्यूह सूत्र (Inverse Matrix)',
    formula: 'A · (adj A) = (adj A) · A = |A| · I   तथा   A⁻¹ = (1 / |A|) · adj A  (|A| ≠ 0)',
    explanation: 'व्युत्क्रम आव्यूह केवल व्युत्क्रमणीय (Non-singular) आव्यूहों के लिए ही विद्यमान होता है, जहाँ सारणिक का मान |A| ≠ 0 हो।',
    variables: [
      { symbol: '|A|', meaning: 'आव्यूह A का सारणिक मान' },
      { symbol: 'adj A', meaning: 'सहखंडज आव्यूह (Adjoint of A)' },
      { symbol: 'I', meaning: 'तत्समक आव्यूह (Identity Matrix)' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-m-05-01',
    classId: 'class-12',
    subjectId: 'c12-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c12-m-ch05',
    chapterName: 'सांतत्य तथा अवकलनीयता (Calculus - Derivatives)',
    chapterNumber: 5,
    title: 'मानक अवकलन सूत्र एवं गुणन/भाग नियम',
    formula: 'd/dx(xⁿ) = n xⁿ⁻¹ | d/dx(sin x) = cos x | d/dx(eˣ) = eˣ | गुणन: d/dx(uv) = u v\' + v u\' | भाग: d/dx(u/v) = (v u\' - u v\') / v²',
    explanation: 'श्रृंखला नियम (Chain Rule): dy/dx = (dy/du) · (du/dx)। प्रतिलोम फलनों के अवकलज: d/dx(sin⁻¹x) = 1/√(1-x²), d/dx(tan⁻¹x) = 1/(1+x²)।',
    variables: [
      { symbol: 'u, v', meaning: 'x के अवकलनीय फलन' },
      { symbol: 'u\', v\'', meaning: 'क्रमशः du/dx तथा dv/dx' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-m-07-01',
    classId: 'class-12',
    subjectId: 'c12-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c12-m-ch07',
    chapterName: 'समाकलन (Integrals)',
    chapterNumber: 6,
    title: 'मानक समाकलन सूत्र एवं खंडशः समाकलन (By Parts)',
    formula: '∫ xⁿ dx = (xⁿ⁺¹)/(n+1) + C | ∫ (1/x) dx = ln|x| + C | खंडशः: ∫ u · v dx = u ∫ v dx - ∫ [u\' · (∫ v dx)] dx',
    explanation: 'खंडशः समाकलन में प्रथम फलन चुनने हेतु ILATE नियम (Inverse, Logarithmic, Algebraic, Trigonometric, Exponential) का प्रयोग होता है।',
    variables: [
      { symbol: 'C', meaning: 'समाकलन अचर (Constant of Integration)' },
      { symbol: 'u, v', meaning: 'ILATE वरीयता क्रम में चुने गए फलन' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-m-07-02',
    classId: 'class-12',
    subjectId: 'c12-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c12-m-ch07',
    chapterName: 'समाकलन (Integrals)',
    chapterNumber: 6,
    title: 'विशिष्ट समाकलन एवं निश्चित समाकलन गुणधर्म (P₄ Property)',
    formula: '∫ 1/(x² + a²) dx = (1/a) tan⁻¹(x/a) + C | किंग गुणधर्म: ∫₀ᵃ f(x) dx = ∫₀ᵃ f(a - x) dx',
    explanation: 'बिहार बोर्ड 5-अंकों के प्रश्नों में ∫₀^(π/2) log(sin x) dx = - (π/2) ln 2 हल करने में P₄ गुणधर्म (King\'s rule) अनिवार्य रूप से प्रयुक्त होता है।',
    variables: [
      { symbol: 'P₄', meaning: 'निश्चित समाकलन का सबसे महत्वपूर्ण सममित गुणधर्म' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-m-09-01',
    classId: 'class-12',
    subjectId: 'c12-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c12-m-ch09',
    chapterName: 'अवकल समीकरण (Differential Equations)',
    chapterNumber: 7,
    title: 'प्रथम कोटि रैखिक अवकल समीकरण एवं समाकलन गुणक',
    formula: 'dy/dx + P(x) y = Q(x)   ⇒   I.F. = e^(∫ P dx)   ⇒   y · (I.F.) = ∫ [Q · (I.F.)] dx + C',
    explanation: 'रैखिक अवकल समीकरण को समाकलन गुणक (Integrating Factor, I.F.) से गुणा करके सीधे समाकलनीय रूप में परिवर्तित किया जाता है।',
    variables: [
      { symbol: 'P(x), Q(x)', meaning: 'केवल x के फलन या अचर' },
      { symbol: 'I.F.', meaning: 'समाकलन गुणक = e^(∫ P dx)' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-m-10-01',
    classId: 'class-12',
    subjectId: 'c12-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c12-m-ch10',
    chapterName: 'सदिश बीजगणित (Vector Algebra)',
    chapterNumber: 8,
    title: 'अदिश (Dot) एवं सदिश (Cross) गुणनफल',
    formula: 'a · b = |a||b| cos θ | a × b = |a||b| sin θ n̂ | a का b पर प्रक्षेप = (a · b) / |b|',
    explanation: 'दो सदिश परस्पर लंबवत होने की शर्त a · b = 0 होती है। दो सदिश समांतर होने की शर्त a × b = 0 होती है। त्रिभुज का क्षेत्रफल = ½ |a × b|।',
    variables: [
      { symbol: 'a, b', meaning: 'दिए गए सदिश' },
      { symbol: 'θ', meaning: 'दोनों सदिशों के बीच का कोण' },
      { symbol: 'n̂', meaning: 'दोनों सदिशों के तल के लंबवत एकांक सदिश' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-m-11-01',
    classId: 'class-12',
    subjectId: 'c12-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c12-m-ch11',
    chapterName: 'त्रिविमीय ज्यामिति (Three Dimensional Geometry)',
    chapterNumber: 9,
    title: 'दिक्-कोज्याएँ एवं विषमतलीय रेखाओं के बीच न्यूनतम दूरी',
    formula: 'l² + m² + n² = 1   तथा   d = | (b₁ × b₂) · (a₂ - a₁) | / | b₁ × b₂ |',
    explanation: 'अंतरिक्ष में दो विषमतलीय (Skew) रेखाओं r = a₁ + λ b₁ तथा r = a₂ + μ b₂ के मध्य न्यूनतम दूरी (Shortest Distance) ज्ञात करने का प्रामाणिक सूत्र।',
    variables: [
      { symbol: 'l, m, n', meaning: 'रेखा की दिक्-कोज्याएँ (cos α, cos β, cos γ)' },
      { symbol: 'a₁, a₂', meaning: 'रेखाओं पर स्थित बिंदुओं के स्थिति सदिश' },
      { symbol: 'b₁, b₂', meaning: 'रेखाओं के समांतर सदिश' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-m-13-01',
    classId: 'class-12',
    subjectId: 'c12-math',
    subjectName: 'गणित (Mathematics)',
    chapterId: 'c12-m-ch13',
    chapterName: 'प्रायिकता (Probability)',
    chapterNumber: 10,
    title: 'सप्रतिबंध प्रायिकता एवं बेज़ प्रमेय (Bayes\' Theorem)',
    formula: 'P(A|B) = P(A ∩ B) / P(B) | बेज़ प्रमेय: P(E_i | A) = [P(E_i) · P(A | E_i)] / [Σ P(E_k) · P(A | E_k)]',
    explanation: 'जब घटना B पहले ही घटित हो चुकी हो, तो A के घटित होने की प्रायिकता P(A|B) होती है। स्वतंत्र घटनाओं के लिए P(A ∩ B) = P(A) · P(B)।',
    variables: [
      { symbol: 'P(A|B)', meaning: 'B के दिए रहने पर A की सप्रतिबंध प्रायिकता' },
      { symbol: 'E_i', meaning: 'परस्पर अपवर्जी एवं संपूर्ण घटनाएं' }
    ],
    isVVI: true,
  },

  // =========================================================================
  // CLASS 12 BIOLOGY
  // =========================================================================
  {
    id: 'c12-b-01-01',
    classId: 'class-12',
    subjectId: 'c12-bio',
    subjectName: 'जीव विज्ञान (Biology)',
    chapterId: 'c12-b-ch01',
    chapterName: 'वंशागति तथा विविधता के सिद्धांत (Genetics)',
    chapterNumber: 1,
    title: 'हार्डी-वेनबर्ग साम्यावस्था एवं मेन्डेलियन अनुपात',
    formula: 'p² + 2pq + q² = 1   तथा   p + q = 1 | द्विसंकर लक्षणप्ररूपी अनुपात = 9 : 3 : 3 : 1',
    explanation: 'एक बड़े यादृच्छिक मैथुन करने वाले समष्टि में जब तक उत्परिवर्तन, चयन या प्रवाह न हो, युग्मविकल्पी आवृत्तियाँ पीढ़ी दर पीढ़ी स्थिर रहती हैं।',
    variables: [
      { symbol: 'p', meaning: 'प्रभावी युग्मविकल्पी (A) की आवृत्ति' },
      { symbol: 'q', meaning: 'अप्रभावी युग्मविकल्पी (a) की आवृत्ति' },
      { symbol: 'p²', meaning: 'समयुग्मजी प्रभावी (AA) की आवृत्ति' },
      { symbol: '2pq', meaning: 'विषमयुग्मजी (Aa) की आवृत्ति' },
      { symbol: 'q²', meaning: 'समयुग्मजी अप्रभावी (aa) की आवृत्ति' }
    ],
    isVVI: true,
  },
  {
    id: 'c12-b-02-01',
    classId: 'class-12',
    subjectId: 'c12-bio',
    subjectName: 'जीव विज्ञान (Biology)',
    chapterId: 'c12-b-ch02',
    chapterName: 'पारिस्थितिकी एवं जीव संख्या वृद्धि (Ecology)',
    chapterNumber: 2,
    title: 'जनसंख्या वृद्धि मॉडल (चरघातांकी एवं लॉजिस्टिक वृद्धि)',
    formula: 'चरघातांकी: dN/dt = rN ⇒ N_t = N₀ e^(rt) | लॉजिस्टिक: dN/dt = rN · [(K - N) / K]',
    explanation: 'सीमित संसाधनों वाली प्रकृति में समष्टि वृद्धि लॉजिस्टिक (सिगमॉइड वक्र) दर्शाती है, जहाँ K पर्यावरण की वहन क्षमता (Carrying Capacity) है।',
    variables: [
      { symbol: 'N', meaning: 'समय t पर समष्टि घनत्व (Population Density)' },
      { symbol: 'r', meaning: 'प्राकृतिक वृद्धि की आंतरिक दर' },
      { symbol: 'K', meaning: 'परिवेश की वहन क्षमता (Carrying Capacity)' }
    ],
    isVVI: true,
  }
];
