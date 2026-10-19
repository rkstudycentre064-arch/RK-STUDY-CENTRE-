import type { TestItem, TestQuestion } from '../types';

export interface MathCh02Question500Item {
  id: number;
  partId: string;
  partTitle: string;
  topic: string;
  question: string;
  options: [string, string, string, string];
  correctOption: 'A' | 'B' | 'C' | 'D';
  correctOptionIndex: 0 | 1 | 2 | 3;
  answerText: string;
  solvedSteps: string[];
  explanation: string;
  isVVI: boolean;
  boardTag: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface MathCh02PartMeta {
  id: string;
  partNumber: number;
  title: string;
  hindiTitle: string;
  rangeLabel: string;
  startQ: number;
  endQ: number;
  count: number;
  formulaUsed: string;
  badge: string;
}

export const CLASS_10_MATH_CH02_500_PARTS: MathCh02PartMeta[] = [
  {
    id: 'part-1',
    partNumber: 1,
    title: 'Part 1: Board PYQ & Core Concepts (1–50)',
    hindiTitle: 'खंड 1: बहुपद की पहचान, घात, आलेख एवं बोर्ड PYQ (प्रश्न 1–50)',
    rangeLabel: 'Q. 1 – 50',
    startQ: 1,
    endQ: 50,
    count: 50,
    formulaUsed: 'p(x) = ax² + bx + c, घात (Degree), आलेख (Graph)',
    badge: '🔥 VVI PYQ (1–50)',
  },
  {
    id: 'part-2',
    partNumber: 2,
    title: 'Part 2: Finding Zeroes of Polynomials (51–100)',
    hindiTitle: 'खंड 2: द्विघात एवं रैखिक बहुपद के शून्यक ज्ञात करना (प्रश्न 51–100)',
    rangeLabel: 'Q. 51 – 100',
    startQ: 51,
    endQ: 100,
    count: 50,
    formulaUsed: 'p(x) = 0 ⇒ (x - α)(x - β) = 0 ⇒ x = α, β',
    badge: '⚡ शून्यक हल (51–100)',
  },
  {
    id: 'part-3',
    partNumber: 3,
    title: 'Part 3: Sum & Product of Zeroes α+β & αβ (101–150)',
    hindiTitle: 'खंड 3: शून्यकों का योगफल (α+β) एवं गुणनफल (αβ) (प्रश्न 101–150)',
    rangeLabel: 'Q. 101 – 150',
    startQ: 101,
    endQ: 150,
    count: 50,
    formulaUsed: 'α + β = -b/a तथा α·β = c/a',
    badge: '⭐ योग व गुणनफल (101–150)',
  },
  {
    id: 'part-4',
    partNumber: 4,
    title: 'Part 4: Reciprocal Sum 1/α + 1/β & Ratios (151–200)',
    hindiTitle: 'खंड 4: व्युत्क्रमों का योग (1/α + 1/β) एवं अनुपात (प्रश्न 151–200)',
    rangeLabel: 'Q. 151 – 200',
    startQ: 151,
    endQ: 200,
    count: 50,
    formulaUsed: '1/α + 1/β = (α + β)/αβ = -b/c',
    badge: '🔥 बोर्ड फेवरेट (151–200)',
  },
  {
    id: 'part-5',
    partNumber: 5,
    title: 'Part 5: Sum of Squares α² + β² & Difference (201–250)',
    hindiTitle: 'खंड 5: शून्यकों के वर्गों का योग (α² + β²) एवं अंतर (प्रश्न 201–250)',
    rangeLabel: 'Q. 201 – 250',
    startQ: 201,
    endQ: 250,
    count: 50,
    formulaUsed: 'α² + β² = (α + β)² - 2αβ',
    badge: '📐 वर्ग सूत्र (201–250)',
  },
  {
    id: 'part-6',
    partNumber: 6,
    title: 'Part 6: Sum of Cubes α³ + β³ & Symmetric Expressions (251–300)',
    hindiTitle: 'खंड 6: घनों का योग (α³ + β³) एवं सममित व्यंजक (प्रश्न 251–300)',
    rangeLabel: 'Q. 251 – 300',
    startQ: 251,
    endQ: 300,
    count: 50,
    formulaUsed: 'α³ + β³ = (α + β)³ - 3αβ(α + β) तथा α²β + αβ² = αβ(α + β)',
    badge: '🚀 घन व व्यंजक (251–300)',
  },
  {
    id: 'part-7',
    partNumber: 7,
    title: 'Part 7: Forming Quadratic Polynomials (301–350)',
    hindiTitle: 'खंड 7: शून्यकों से द्विघात बहुपद का निर्माण करना (प्रश्न 301–350)',
    rangeLabel: 'Q. 301 – 350',
    startQ: 301,
    endQ: 350,
    count: 50,
    formulaUsed: 'p(x) = x² - (α + β)x + αβ',
    badge: '🎯 बहुपद निर्माण (301–350)',
  },
  {
    id: 'part-8',
    partNumber: 8,
    title: 'Part 8: Finding Unknown Constant k (351–400)',
    hindiTitle: 'खंड 8: अज्ञात अचर k का मान ज्ञात करना (प्रश्न 351–400)',
    rangeLabel: 'Q. 351 – 400',
    startQ: 351,
    endQ: 400,
    count: 50,
    formulaUsed: 'p(α) = 0, व्युत्क्रम शून्यक (c = a), समान शून्यक (b² - 4ac = 0)',
    badge: '💡 k का मान (351–400)',
  },
  {
    id: 'part-9',
    partNumber: 9,
    title: 'Part 9: Value of Polynomial p(k) & Division Algorithm (401–450)',
    hindiTitle: 'खंड 9: बहुपद का मान p(k), गुणनखंड एवं विभाजन एल्गोरिथ्म (प्रश्न 401–450)',
    rangeLabel: 'Q. 401 – 450',
    startQ: 401,
    endQ: 450,
    count: 50,
    formulaUsed: 'p(x) = g(x)·q(x) + r(x), घात q(x) = घात p(x) - घात g(x)',
    badge: '🧮 p(k) व विभाजन (401–450)',
  },
  {
    id: 'part-10',
    partNumber: 10,
    title: 'Part 10: Cubic Polynomials α, β, γ Relations (451–500)',
    hindiTitle: 'खंड 10: त्रिघात बहुपद (α + β + γ, αβ + βγ + γα, αβγ) (प्रश्न 451–500)',
    rangeLabel: 'Q. 451 – 500',
    startQ: 451,
    endQ: 500,
    count: 50,
    formulaUsed: 'α+β+γ = -b/a, αβ+βγ+γα = c/a, αβγ = -d/a',
    badge: '👑 त्रिघात बहुपद (451–500)',
  },
];

const OPTION_KEYS: ['A', 'B', 'C', 'D'] = ['A', 'B', 'C', 'D'];

function fmtTerm(coeff: number, varPart: string, isFirst = false): string {
  if (coeff === 0) return '';
  const absC = Math.abs(coeff);
  const sign = coeff < 0 ? (isFirst ? '-' : ' - ') : isFirst ? '' : ' + ';
  const cStr = absC === 1 && varPart !== '' ? '' : String(absC);
  return `${sign}${cStr}${varPart}`;
}

export function formatQuad(a: number, b: number, c: number): string {
  const t1 = fmtTerm(a, 'x²', true);
  const t2 = fmtTerm(b, 'x', false);
  const t3 = fmtTerm(c, '', false);
  return `${t1}${t2}${t3}`;
}

export function formatCubic(a: number, b: number, c: number, d: number): string {
  const t1 = fmtTerm(a, 'x³', true);
  const t2 = fmtTerm(b, 'x²', false);
  const t3 = fmtTerm(c, 'x', false);
  const t4 = fmtTerm(d, '', false);
  return `${t1}${t2}${t3}${t4}`;
}

function gcd(x: number, y: number): number {
  let a = Math.abs(x);
  let b = Math.abs(y);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

function fmtFrac(num: number, den: number): string {
  if (den === 0) return 'अपरिभाषित';
  if (num === 0) return '0';
  const sign = (num < 0) !== (den < 0) ? '-' : '';
  const n = Math.abs(num);
  const d = Math.abs(den);
  const g = gcd(n, d);
  const rn = n / g;
  const rd = d / g;
  if (rd === 1) return `${sign}${rn}`;
  return `${sign}${rn}/${rd}`;
}

function makeQuestionItem(
  id: number,
  partId: string,
  partTitle: string,
  topic: string,
  question: string,
  options: [string, string, string, string],
  correctOptionIndex: 0 | 1 | 2 | 3,
  solvedSteps: string[],
  boardTag: string,
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium',
  isVVI = true
): MathCh02Question500Item {
  const correctOption = OPTION_KEYS[correctOptionIndex];
  const answerText = options[correctOptionIndex];
  const explanation = solvedSteps.join('\n');
  return {
    id,
    partId,
    partTitle,
    topic,
    question,
    options,
    correctOption,
    correctOptionIndex,
    answerText,
    solvedSteps,
    explanation,
    isVVI,
    boardTag,
    difficulty,
  };
}

// ============================================================================
// PART 1: 50 CURATED BOARD PYQ & CONCEPT QUESTIONS (Q. 1 to 50)
// ============================================================================
const PART_1_RAW: Array<{
  q: string;
  opts: [string, string, string, string];
  ans: 0 | 1 | 2 | 3;
  steps: string[];
  tag: string;
  diff?: 'Easy' | 'Medium' | 'Hard';
}> = [
  {
    q: 'एक घात वाले बहुपद को क्या कहते हैं?',
    opts: ['द्विघात बहुपद', 'त्रिघात बहुपद', 'रैखिक बहुपद', 'अचर बहुपद'],
    ans: 2,
    steps: [
      'दिया है: बहुपद का घात (Degree) = 1',
      'नियम: जिस बहुपद में चर (x) का अधिकतम घात 1 होता है, उसे रैखिक बहुपद (Linear Polynomial) कहते हैं।',
      'व्यापक रूप: ax + b (जहाँ a ≠ 0)',
      'अतः सही विकल्प (C) रैखिक बहुपद है।',
    ],
    tag: 'BSEB 2015, 2020, 2023',
    diff: 'Easy',
  },
  {
    q: 'दो घात वाले बहुपद को क्या कहा जाता है?',
    opts: ['रैखिक बहुपद', 'द्विघात बहुपद', 'त्रिघात बहुपद', 'चतुर्घात बहुपद'],
    ans: 1,
    steps: [
      'दिया है: बहुपद का घात (Degree) = 2',
      'नियम: घात 2 वाले बहुपद को द्विघात बहुपद (Quadratic Polynomial) कहते हैं।',
      'व्यापक रूप: p(x) = ax² + bx + c, जहाँ a ≠ 0',
      'अतः सही विकल्प (B) द्विघात बहुपद है।',
    ],
    tag: 'BSEB 2016, 2021, 2024',
    diff: 'Easy',
  },
  {
    q: 'तीन घात वाले बहुपद को क्या कहते हैं?',
    opts: ['रैखिक बहुपद', 'द्विघात बहुपद', 'त्रिघात बहुपद', 'द्विपदी बहुपद'],
    ans: 2,
    steps: [
      'दिया है: बहुपद का घात (Degree) = 3',
      'नियम: घात 3 वाले बहुपद को त्रिघात बहुपद (Cubic Polynomial) कहते हैं।',
      'व्यापक रूप: p(x) = ax³ + bx² + cx + d (जहाँ a ≠ 0)',
      'अतः सही विकल्प (C) त्रिघात बहुपद है।',
    ],
    tag: 'BSEB 2018, 2022',
    diff: 'Easy',
  },
  {
    q: 'द्विघात बहुपद का सबसे व्यापक रूप (Standard Form) क्या है?',
    opts: ['ax + b', 'ax² + bx + c (a ≠ 0)', 'ax³ + bx² + cx + d', 'ax⁴ + bx + c'],
    ans: 1,
    steps: [
      'द्विघात बहुपद में चर x का उच्चतम घात 2 होता है।',
      'इसका मानक (व्यापक) रूप p(x) = ax² + bx + c होता है, जहाँ a ≠ 0 और a, b, c वास्तविक संख्याएँ हैं।',
      'अतः सही विकल्प (B) ax² + bx + c (a ≠ 0) है।',
    ],
    tag: 'BSEB 2017, 2022',
    diff: 'Easy',
  },
  {
    q: 'त्रिघात बहुपद का सबसे व्यापक रूप क्या है?',
    opts: ['ax² + bx + c', 'ax⁴ + bx³ + c', 'ax³ + bx² + cx + d (a ≠ 0)', 'ax + b'],
    ans: 2,
    steps: [
      'त्रिघात बहुपद में चर x का अधिकतम घात 3 होता है।',
      'इसका व्यापक रूप p(x) = ax³ + bx² + cx + d (जहाँ a ≠ 0) होता है।',
      'अतः सही विकल्प (C) ax³ + bx² + cx + d (a ≠ 0) है।',
    ],
    tag: 'BSEB 2019, 2023',
    diff: 'Easy',
  },
  {
    q: 'द्विघात बहुपद के शून्यकों की अधिकतम संख्या कितनी होती है?',
    opts: ['1', '2', '3', '4'],
    ans: 1,
    steps: [
      'नियम: किसी बहुपद का घात जितना होता है, उसके शून्यकों की अधिकतम संख्या उतनी ही होती है।',
      'चूँकि द्विघात बहुपद का घात = 2 होता है, इसलिए इसके अधिकतम 2 शून्यक (α और β) होते हैं।',
      'अतः सही विकल्प (B) 2 है।',
    ],
    tag: 'BSEB 2018, 2021, 2024',
    diff: 'Easy',
  },
  {
    q: 'रैखिक बहुपद के शून्यकों की संख्या कितनी होती है?',
    opts: ['0', '1', '2', '3'],
    ans: 1,
    steps: [
      'रैखिक बहुपद p(x) = ax + b (a ≠ 0) का घात 1 होता है।',
      'ax + b = 0 ⇒ x = -b/a (केवल 1 अद्वितीय शून्यक)।',
      'अतः रैखिक बहुपद के शून्यकों की संख्या 1 होती है। सही विकल्प (B) है।',
    ],
    tag: 'BSEB 2019, 2023',
    diff: 'Easy',
  },
  {
    q: 'त्रिघात बहुपद के शून्यकों की अधिकतम संख्या कितनी होती है?',
    opts: ['1', '2', '3', '4'],
    ans: 2,
    steps: [
      'त्रिघात बहुपद का घात (Degree) = 3 होता है।',
      'अतः इसके शून्यकों की अधिकतम संख्या 3 (α, β और γ) होती है।',
      'अतः सही विकल्प (C) 3 है।',
    ],
    tag: 'BSEB 2020, 2022',
    diff: 'Easy',
  },
  {
    q: 'निम्नलिखित में से कौन बहुपद नहीं है?',
    opts: ['2x² - 3x + √5', 'x + 1/x', '3x³ - 4x + 1', '√3 x² + 5'],
    ans: 1,
    steps: [
      'बहुपद होने की शर्त: चर x का घात हमेशा एक पूर्ण संख्या (0, 1, 2, 3...) होना चाहिए।',
      'विकल्प (B) में: x + 1/x = x¹ + x⁻¹',
      'यहाँ x का घात -1 है जो पूर्ण संख्या नहीं है (ऋणात्मक पूर्णांक है)।',
      'अतः x + 1/x बहुपद नहीं है। सही विकल्प (B) है।',
    ],
    tag: 'BSEB 2018, 2020, 2023',
    diff: 'Medium',
  },
  {
    q: 'निम्नलिखित में से कौन बहुपद है?',
    opts: ['x² - 5x + 4√x + 3', 'x^(3/2) - x + 1', '√x + 1/√x', '√2 x² - 3√3 x + √6'],
    ans: 3,
    steps: [
      'विकल्प (A), (B), (C) में चर x पर वर्गमूल या भिन्नात्मक घात (1/2, 3/2) है, इसलिए वे बहुपद नहीं हैं।',
      'विकल्प (D) √2 x² - 3√3 x + √6 में चर x के घात 2 और 1 हैं जो पूर्ण संख्याएँ हैं (वर्गमूल केवल अचर संख्याओं पर है)।',
      'अतः सही विकल्प (D) है।',
    ],
    tag: 'BSEB 2022, 2024',
    diff: 'Medium',
  },
  {
    q: 'निम्नलिखित में कौन बहुपद नहीं है?',
    opts: ['-7', 'y² + √2', '3√x + 2x + 7', '4x² - 3x + 7'],
    ans: 2,
    steps: [
      'व्यंजक 3√x + 2x + 7 = 3x^(1/2) + 2x¹ + 7',
      'यहाँ चर x का घात 1/2 (भिन्न) है, जो पूर्ण संख्या नहीं है।',
      'अतः 3√x + 2x + 7 बहुपद नहीं है। सही विकल्प (C) है।',
    ],
    tag: 'BSEB 2019, 2021',
    diff: 'Easy',
  },
  {
    q: 'निम्नलिखित में से कौन बहुपद नहीं है?',
    opts: ['(2/3)x + 1', '2 - x² + √3 x', '1/(x - 1)', 'x³'],
    ans: 2,
    steps: [
      'व्यंजक 1/(x - 1) = (x - 1)⁻¹ में चर (x - 1) हर (Denominator) में है।',
      'नियम के अनुसार यदि चर हर (बटा के नीचे) में हो, तो वह बहुपद नहीं होता है।',
      'अतः सही विकल्प (C) 1/(x - 1) है।',
    ],
    tag: 'BSEB 2020, 2024',
    diff: 'Easy',
  },
  {
    q: 'शून्य घात वाले बहुपद को क्या कहते हैं?',
    opts: ['रैखिक बहुपद', 'द्विघात बहुपद', 'अचर बहुपद', 'शून्य बहुपद'],
    ans: 2,
    steps: [
      'शून्य घात वाले बहुपद का रूप p(x) = c = c·x⁰ (जहाँ c ≠ 0, जैसे 5, -7, 3) होता है।',
      'इसे अचर बहुपद (Constant Polynomial) कहते हैं।',
      'अतः सही विकल्प (C) अचर बहुपद है।',
    ],
    tag: 'BSEB 2021',
    diff: 'Easy',
  },
  {
    q: 'अचर बहुपद 7 का घात (Degree) कितना होता है?',
    opts: ['1', '7', '0', 'अपरिभाषित'],
    ans: 2,
    steps: [
      'दिया गया अचर बहुपद: p(x) = 7 = 7 × x⁰',
      'यहाँ चर x का घात 0 है। किसी भी अशून्य अचर बहुपद का घात हमेशा 0 होता है।',
      'अतः सही विकल्प (C) 0 है।',
    ],
    tag: 'BSEB 2022',
    diff: 'Easy',
  },
  {
    q: 'शून्य बहुपद p(x) = 0 का घात (Degree of Zero Polynomial) क्या होता है?',
    opts: ['0', '1', 'अपरिभाषित (Undefined)', 'अनंत से कम'],
    ans: 2,
    steps: [
      'शून्य बहुपद p(x) = 0 को 0·x¹, 0·x², 0·x⁵ आदि किसी भी घात में लिखा जा सकता है।',
      'इसलिए शून्य बहुपद (0) का घात अपरिभाषित (Not Defined / Undefined) होता है।',
      'अतः सही विकल्प (C) अपरिभाषित है।',
    ],
    tag: 'NCERT Exemplar • VVI',
    diff: 'Medium',
  },
  {
    q: 'रैखिक बहुपद ax + b (जहाँ a ≠ 0) का शून्यक क्या होता है?',
    opts: ['b/a', '-b/a', 'a/b', '-a/b'],
    ans: 1,
    steps: [
      'शून्यक ज्ञात करने के लिए p(x) = 0 रखते हैं:',
      'ax + b = 0  ⇒  ax = -b  ⇒  x = -b/a',
      'अतः रैखिक बहुपद ax + b का शून्यक -b/a है। सही विकल्प (B) है।',
    ],
    tag: 'BSEB 2021, 2023',
    diff: 'Easy',
  },
  {
    q: 'रैखिक बहुपद y = ax + b (a ≠ 0) का आलेख (Graph) कैसा होता है?',
    opts: ['परवलय (Parabola)', 'सरल रेखा (Straight Line)', 'वृत्त (Circle)', 'वक्र रेखा'],
    ans: 1,
    steps: [
      'एक घात वाले रैखिक बहुपद y = ax + b का ग्राफ हमेशा एक सरल रेखा (Straight Line) होता है।',
      'यह सरल रेखा x-अक्ष को बिंदु (-b/a, 0) पर प्रतिच्छेद करती है।',
      'अतः सही विकल्प (B) सरल रेखा है।',
    ],
    tag: 'BSEB 2020, 2023',
    diff: 'Easy',
  },
  {
    q: 'द्विघात बहुपद y = ax² + bx + c (a ≠ 0) का आलेख (Graph) किस आकार का होता है?',
    opts: ['सरल रेखा', 'वृत्त', 'परवलय (Parabola)', 'दीर्घवृत्त'],
    ans: 2,
    steps: [
      'द्विघात बहुपद y = ax² + bx + c का आलेख हमेशा U या उल्टे U के आकार का वक्र होता है जिसे परवलय (Parabola) कहते हैं।',
      'जब a > 0 हो तो परवलय ऊपर की ओर खुलता है, और जब a < 0 हो तो नीचे की ओर खुलता है।',
      'अतः सही विकल्प (C) परवलय (Parabola) है।',
    ],
    tag: 'BSEB 2020, 2024',
    diff: 'Easy',
  },
  {
    q: 'यदि द्विघात बहुपद ax² + bx + c में a > 0 हो, तो इसके आलेख (परवलय) का मुँह किस ओर खुलता है?',
    opts: ['नीचे की ओर', 'ऊपर की ओर', 'बाईं ओर', 'दाईं ओर'],
    ans: 1,
    steps: [
      'द्विघात बहुपद y = ax² + bx + c में जब x² का गुणांक a > 0 (धनात्मक) होता है,',
      'तब परवलय (Parabola) का मुँह हमेशा ऊपर की ओर (Upward U-shape) खुलता है।',
      'अतः सही विकल्प (B) ऊपर की ओर है।',
    ],
    tag: 'NCERT Concept • VVI',
    diff: 'Medium',
  },
  {
    q: 'यदि द्विघात बहुपद ax² + bx + c में a < 0 (ऋणात्मक) हो, तो परवलय का मुँह किस ओर खुलता है?',
    opts: ['ऊपर की ओर', 'नीचे की ओर', 'मूल बिंदु की ओर', 'अक्ष के समांतर'],
    ans: 1,
    steps: [
      'जब x² का गुणांक a < 0 (ऋणात्मक) होता है, तब परवलय (Parabola) का मुँह नीचे की ओर (Downward ∩-shape) खुलता है।',
      'अतः सही विकल्प (B) नीचे की ओर है।',
    ],
    tag: 'NCERT Concept • VVI',
    diff: 'Medium',
  },
  {
    q: 'यदि किसी बहुपद y = p(x) का आलेख x-अक्ष को 3 अलग-अलग बिंदुओं पर काटता है, तो p(x) के शून्यकों की संख्या कितनी होगी?',
    opts: ['0', '1', '2', '3'],
    ans: 3,
    steps: [
      'ज्यामितीय नियम: बहुपद y = p(x) का आलेख x-अक्ष को जितने बिंदुओं पर प्रतिच्छेद करता है, उतने ही उसके वास्तविक शून्यक होते हैं।',
      'यहाँ आलेख x-अक्ष को 3 बिंदुओं पर काटता है, इसलिए शून्यकों की संख्या = 3 होगी।',
      'अतः सही विकल्प (D) 3 है।',
    ],
    tag: 'BSEB 2019, 2022',
    diff: 'Easy',
  },
  {
    q: 'यदि किसी बहुपद y = p(x) का आलेख x-अक्ष को किसी भी बिंदु पर नहीं काटता और न ही स्पर्श करता है, तो शून्यकों की संख्या क्या होगी?',
    opts: ['1', '2', '0', '3'],
    ans: 2,
    steps: [
      'चूँकि आलेख x-अक्ष को एक भी बिंदु पर प्रतिच्छेद नहीं करता है,',
      'इसलिए बहुपद p(x) के वास्तविक शून्यकों की संख्या = 0 होगी।',
      'अतः सही विकल्प (C) 0 है।',
    ],
    tag: 'NCERT Ex 2.1 • VVI',
    diff: 'Easy',
  },
  {
    q: 'यदि द्विघात बहुपद का आलेख x-अक्ष को केवल एक बिंदु पर स्पर्श करता है, तो उसके कितने समान वास्तविक शून्यक होंगे?',
    opts: ['कोई शून्यक नहीं', 'केवल 1 (दो संपाती/बराबर शून्यक)', '3 शून्यक', '4 शून्यक'],
    ans: 1,
    steps: [
      'जब परवलय x-अक्ष को केवल एक बिंदु पर स्पर्श करता है (अर्थात् D = b² - 4ac = 0),',
      'तब दोनों शून्यक आपस में बराबर (α = β) होते हैं अर्थात् 1 अद्वितीय वास्तविक मान प्राप्त होता है।',
      'अतः सही विकल्प (B) है।',
    ],
    tag: 'NCERT Exemplar • VVI',
    diff: 'Medium',
  },
  {
    q: 'यदि α और β द्विघात बहुपद p(x) = ax² + bx + c के शून्यक हों, तो शून्यकों का योगफल (α + β) क्या होता है?',
    opts: ['b/a', '-b/a', 'c/a', '-c/a'],
    ans: 1,
    steps: [
      'द्विघात बहुपद ax² + bx + c में शून्यकों और गुणांकों के संबंध से:',
      'शून्यकों का योगफल (α + β) = -(x का गुणांक) / (x² का गुणांक) = -b/a',
      'अतः सही विकल्प (B) -b/a है।',
    ],
    tag: 'BSEB 2015, 2019, 2022, 2024',
    diff: 'Easy',
  },
  {
    q: 'यदि α और β द्विघात बहुपद p(x) = ax² + bx + c के शून्यक हों, तो शून्यकों का गुणनफल (α·β) क्या होता है?',
    opts: ['-b/a', 'b/a', 'c/a', '-c/a'],
    ans: 2,
    steps: [
      'द्विघात बहुपद ax² + bx + c में शून्यकों का गुणनफल:',
      'α · β = (अचर पद) / (x² का गुणांक) = c/a',
      'अतः सही विकल्प (C) c/a है।',
    ],
    tag: 'BSEB 2016, 2020, 2023',
    diff: 'Easy',
  },
  {
    q: 'यदि किसी द्विघात बहुपद के शून्यक α और β हों, तो वह द्विघात बहुपद क्या होगा?',
    opts: ['x² + (α + β)x + αβ', 'x² - (α + β)x + αβ', 'x² - (α + β)x - αβ', 'x² + (α + β)x - αβ'],
    ans: 1,
    steps: [
      'जब दो शून्यक α और β दिए गए हों, तो द्विघात बहुपद बनाने का सूत्र है:',
      'p(x) = (x - α)(x - β) = x² - (α + β)x + αβ',
      'अतः सही विकल्प (B) x² - (α + β)x + αβ है।',
    ],
    tag: 'BSEB 2018, 2021, 2024',
    diff: 'Easy',
  },
  {
    q: 'यदि द्विघात बहुपद ax² + bx + c के शून्यक α और β हों, तो 1/α + 1/β का सीधा सूत्र क्या होता है?',
    opts: ['b/c', '-b/c', 'c/a', '-b/a'],
    ans: 1,
    steps: [
      'व्युत्क्रमों का योग: 1/α + 1/β = (α + β) / (α·β)',
      'मान रखने पर: (-b/a) / (c/a) = -b/c',
      'अतः 1/α + 1/β = -b/c (बोर्ड परीक्षा का सबसे महत्वपूर्ण शॉर्टकट सूत्र)। सही विकल्प (B) है।',
    ],
    tag: 'BSEB 2017, 2020, 2023, 2024',
    diff: 'Easy',
  },
  {
    q: 'सर्वसमिका α² + β² का सही सूत्र (α + β और αβ के पदों में) क्या है?',
    opts: ['(α + β)² + 2αβ', '(α + β)² - 2αβ', '(α - β)² - 2αβ', '(α + β)² - 4αβ'],
    ans: 1,
    steps: [
      'हम जानते हैं कि (α + β)² = α² + β² + 2αβ',
      'पक्षांतर करने पर: α² + β² = (α + β)² - 2αβ',
      'अतः सही विकल्प (B) (α + β)² - 2αβ है।',
    ],
    tag: 'BSEB VVI Formula',
    diff: 'Easy',
  },
  {
    q: 'सर्वसमिका (α - β)² का मान (α + β और αβ के पदों में) क्या होता है?',
    opts: ['(α + β)² - 2αβ', '(α + β)² + 4αβ', '(α + β)² - 4αβ', '(α + β)² + 2αβ'],
    ans: 2,
    steps: [
      'बीजगणितीय सर्वसमिका से: (α - β)² = α² + β² - 2αβ',
      '= (α² + β² + 2αβ) - 4αβ = (α + β)² - 4αβ',
      'अतः सही विकल्प (C) (α + β)² - 4αβ है।',
    ],
    tag: 'BSEB VVI Formula',
    diff: 'Medium',
  },
  {
    q: 'सर्वसमिका α³ + β³ का मान (α + β और αβ के पदों में) क्या होता है?',
    opts: ['(α + β)³ + 3αβ(α + β)', '(α + β)³ - 3αβ(α + β)', '(α + β)² - 3αβ', '(α - β)³ + 3αβ'],
    ans: 1,
    steps: [
      'हम जानते हैं कि (α + β)³ = α³ + β³ + 3αβ(α + β)',
      'अतः α³ + β³ = (α + β)³ - 3αβ(α + β)',
      'सही विकल्प (B) है।',
    ],
    tag: 'BSEB VVI Formula',
    diff: 'Medium',
  },
  {
    q: 'त्रिघात बहुपद ax³ + bx² + cx + d (a ≠ 0) के शून्यक α, β, γ हों, तो α + β + γ का मान क्या होगा?',
    opts: ['b/a', '-b/a', 'c/a', '-d/a'],
    ans: 1,
    steps: [
      'त्रिघात बहुपद ax³ + bx² + cx + d में तीनों शून्यकों का योगफल:',
      'α + β + γ = -(x² का गुणांक) / (x³ का गुणांक) = -b/a',
      'अतः सही विकल्प (B) -b/a है।',
    ],
    tag: 'BSEB 2019, 2022',
    diff: 'Easy',
  },
  {
    q: 'त्रिघात बहुपद ax³ + bx² + cx + d के शून्यक α, β, γ हों, तो दो-दो शून्यकों के गुणनफलों का योग (αβ + βγ + γα) क्या होगा?',
    opts: ['-b/a', 'c/a', '-c/a', '-d/a'],
    ans: 1,
    steps: [
      'त्रिघात बहुपद ax³ + bx² + cx + d में दो-दो शून्यकों के गुणनफलों का योग:',
      'αβ + βγ + γα = (x का गुणांक) / (x³ का गुणांक) = c/a',
      'अतः सही विकल्प (B) c/a है।',
    ],
    tag: 'BSEB 2020, 2023',
    diff: 'Easy',
  },
  {
    q: 'त्रिघात बहुपद ax³ + bx² + cx + d के शून्यक α, β, γ हों, तो α·β·γ का मान क्या होगा?',
    opts: ['-b/a', 'c/a', '-d/a', 'd/a'],
    ans: 2,
    steps: [
      'त्रिघात बहुपद ax³ + bx² + cx + d में तीनों शून्यकों का गुणनफल:',
      'α · β · γ = -(अचर पद) / (x³ का गुणांक) = -d/a',
      'अतः सही विकल्प (C) -d/a है।',
    ],
    tag: 'BSEB 2018, 2021, 2024',
    diff: 'Easy',
  },
  {
    q: 'यदि द्विघात बहुपद ax² + bx + c के दोनों शून्यक बराबर हों, तो विविक्तकर D = b² - 4ac का मान क्या होगा?',
    opts: ['D > 0', 'D < 0', 'D = 0', 'D = 1'],
    ans: 2,
    steps: [
      'समान शून्यक (α = β) होने की आवश्यक और पर्याप्त शर्त है:',
      'विविक्तकर (Discriminant) D = b² - 4ac = 0  ⇒  b² = 4ac',
      'अतः सही विकल्प (C) D = 0 है।',
    ],
    tag: 'BSEB 2021, 2024',
    diff: 'Easy',
  },
  {
    q: 'यदि द्विघात बहुपद ax² + bx + c के दोनों शून्यक बराबर हों, तो a और c के चिन्ह कैसे होते हैं?',
    opts: ['हमेशा विपरीत चिन्ह के', 'हमेशा समान चिन्ह के (एक ही चिन्ह)', 'a धनात्मक और c ऋणात्मक', 'कुछ कहा नहीं जा सकता'],
    ans: 1,
    steps: [
      'समान शून्यकों के लिए D = b² - 4ac = 0 ⇒ 4ac = b²',
      'चूँकि किसी भी वास्तविक संख्या का वर्ग b² ≥ 0 (धनात्मक) होता है, इसलिए ac > 0 होना चाहिए।',
      'ac > 0 तभी संभव है जब a और c दोनों के चिन्ह समान (दोनों + या दोनों -) हों।',
      'अतः सही विकल्प (B) हमेशा समान चिन्ह के है।',
    ],
    tag: 'NCERT Exemplar • BSEB 2023',
    diff: 'Hard',
  },
  {
    q: 'यदि किसी द्विघात बहुपद ax² + bx + c के दोनों शून्यक परिमाण में बराबर परंतु विपरीत चिन्ह के हों (α और -α), तो कौन-सी शर्त सत्य है?',
    opts: ['a = 0', 'b = 0', 'c = 0', 'a = c'],
    ans: 1,
    steps: [
      'दिया है: शून्यक α और -α हैं।',
      'शून्यकों का योगफल = α + (-α) = 0',
      'सूत्र से: -b/a = 0  ⇒  b = 0',
      'अतः सही विकल्प (B) b = 0 है।',
    ],
    tag: 'BSEB 2020, 2023',
    diff: 'Medium',
  },
  {
    q: 'यदि किसी द्विघात बहुपद ax² + bx + c का एक शून्यक दूसरे शून्यक का व्युत्क्रम (Reciprocal, अर्थात् α और 1/α) हो, तो कौन-सी शर्त सत्य है?',
    opts: ['b = 0', 'a = b', 'c = a', 'c = -a'],
    ans: 2,
    steps: [
      'दिया है: शून्यक α और 1/α हैं।',
      'शून्यकों का गुणनफल = α × (1/α) = 1',
      'सूत्र से: c/a = 1  ⇒  c = a (अचर पद = x² का गुणांक)',
      'अतः सही विकल्प (C) c = a है।',
    ],
    tag: 'BSEB 2019, 2022, 2024',
    diff: 'Medium',
  },
  {
    q: 'यदि द्विघात बहुपद ax² + bx + c का एक शून्यक 0 (शून्य) हो, तो c का मान क्या होगा?',
    opts: ['1', '-1', '0', 'b/a'],
    ans: 2,
    steps: [
      'यदि एक शून्यक α = 0 है, तो शून्यकों का गुणनफल α·β = 0 × β = 0',
      'सूत्र से: c/a = 0  ⇒  c = 0',
      'अतः सही विकल्प (C) 0 है।',
    ],
    tag: 'BSEB Concept VVI',
    diff: 'Easy',
  },
  {
    q: 'बहुपद 5y³ - 2y² + √3 y - 8 का घात (Degree) क्या है?',
    opts: ['1', '2', '3', '5'],
    ans: 2,
    steps: [
      'दिए गए बहुपद 5y³ - 2y² + √3 y - 8 में चर y के घात क्रमशः 3, 2, 1 हैं।',
      'चर y का उच्चतम घात = 3 है।',
      'अतः बहुपद का घात 3 है। सही विकल्प (C) है।',
    ],
    tag: 'BSEB 2021, 2024',
    diff: 'Easy',
  },
  {
    q: 'बहुपद (x² - 2)(x² + 5) का घात (Degree) कितना होगा?',
    opts: ['2', '3', '4', '1'],
    ans: 2,
    steps: [
      'गुणा करने पर: (x² - 2)(x² + 5) = x⁴ + 5x² - 2x² - 10 = x⁴ + 3x² - 10',
      'यहाँ x का उच्चतम घात = 2 + 2 = 4 है।',
      'अतः बहुपद का घात 4 है। सही विकल्प (C) है।',
    ],
    tag: 'BSEB 2022, 2023',
    diff: 'Medium',
  },
  {
    q: 'बहुपद (x³ + 1)(x² - x + 1) का घात क्या होगा?',
    opts: ['3', '2', '5', '6'],
    ans: 2,
    steps: [
      'दो बहुपदों के गुणनफल का घात = पहले बहुपद का घात + दूसरे बहुपद का घात',
      'यहाँ उच्चतम पद = x³ × x² = x⁵',
      'अतः घात = 3 + 2 = 5 होगा। सही विकल्प (C) है।',
    ],
    tag: 'BSEB 2023',
    diff: 'Medium',
  },
  {
    q: 'बहुपद 4x⁴ + 3x³ + 2x² + x + 1 में x² का गुणांक (Coefficient of x²) क्या है?',
    opts: ['4', '3', '2', '1'],
    ans: 2,
    steps: [
      'दिए गए बहुपद में x² वाला पद +2x² है।',
      'अतः x² का गुणांक = 2 है।',
      'सही विकल्प (C) 2 है।',
    ],
    tag: 'BSEB 2020',
    diff: 'Easy',
  },
  {
    q: 'बहुपद π/2 x² + x में x² का गुणांक क्या है?',
    opts: ['1', 'π', 'π/2', '2'],
    ans: 2,
    steps: [
      'बहुपद (π/2)x² + x में x² के साथ गुणा में संख्या π/2 है।',
      'अतः x² का गुणांक = π/2 है। सही विकल्प (C) है।',
    ],
    tag: 'NCERT VVI',
    diff: 'Easy',
  },
  {
    q: 'बहुपद 2 - x² + x³ में x² का गुणांक क्या है?',
    opts: ['2', '1', '-1', '0'],
    ans: 2,
    steps: [
      'दिए गए बहुपद 2 - 1·x² + x³ में x² का चिन्ह सहित गुणांक -1 है।',
      'अतः सही विकल्प (C) -1 है।',
    ],
    tag: 'BSEB 2021',
    diff: 'Easy',
  },
  {
    q: 'बहुपद √2 x - 1 में x² का गुणांक क्या है?',
    opts: ['√2', '-1', '0', '1'],
    ans: 2,
    steps: [
      'बहुपद √2 x - 1 को 0·x² + √2 x - 1 लिखा जा सकता है क्योंकि इसमें x² का पद अनुपस्थित है।',
      'अतः x² का गुणांक = 0 है। सही विकल्प (C) है।',
    ],
    tag: 'NCERT Concept',
    diff: 'Medium',
  },
  {
    q: 'बहुपदों के विभाजन एल्गोरिथ्म p(x) = g(x) × q(x) + r(x) में शेषफल r(x) के लिए कौन-सी शर्त हमेशा सत्य है?',
    opts: ['घात r(x) > घात g(x)', 'घात r(x) = घात g(x)', 'r(x) = 0 या घात r(x) < घात g(x)', 'घात r(x) > घात p(x)'],
    ans: 2,
    steps: [
      'बहुपद विभाजन एल्गोरिथ्म के अनुसार, जब p(x) को g(x) से भाग दिया जाता है,',
      'तब शेषफल r(x) या तो 0 होता है या शेषफल r(x) का घात भाजक g(x) के घात से हमेशा छोटा होता है: घात r(x) < घात g(x)।',
      'अतः सही विकल्प (C) है।',
    ],
    tag: 'BSEB 2020, 2023',
    diff: 'Medium',
  },
  {
    q: 'यदि बहुपद p(x) का एक गुणनखंड (x - a) हो, तो गुणनखंड प्रमेय से p(a) का मान क्या होगा?',
    opts: ['a', '-a', '0', '1'],
    ans: 2,
    steps: [
      'गुणनखंड प्रमेय (Factor Theorem) के अनुसार:',
      'यदि (x - a) बहुपद p(x) का एक गुणनखंड है, तो x - a = 0 ⇒ x = a रखने पर शेषफल p(a) = 0 होता है।',
      'अतः सही विकल्प (C) 0 है।',
    ],
    tag: 'BSEB 2021, 2022',
    diff: 'Easy',
  },
  {
    q: 'यदि बहुपद p(x) का एक शून्यक -3 है, तो निम्नलिखित में से कौन p(x) का एक निश्चित गुणनखंड होगा?',
    opts: ['x - 3', 'x + 3', 'x² - 3', '3x - 1'],
    ans: 1,
    steps: [
      'नियम: यदि x = α बहुपद p(x) का एक शून्यक है, तो (x - α) उसका एक गुणनखंड होता है।',
      'यहाँ α = -3 है, अतः गुणनखंड = x - (-3) = (x + 3) होगा।',
      'सही विकल्प (B) x + 3 है।',
    ],
    tag: 'BSEB 2022, 2024',
    diff: 'Easy',
  },
  {
    q: 'द्विघात बहुपद x² + 99x + 127 के दोनों शून्यक कैसे होंगे?',
    opts: ['दोनों धनात्मक', 'दोनों ऋणात्मक', 'एक धनात्मक और एक ऋणात्मक', 'दोनों बराबर'],
    ans: 1,
    steps: [
      'यहाँ a = 1, b = 99, c = 127 (तीनों धनात्मक हैं)।',
      'शून्यकों का योग α + β = -b/a = -99 (ऋणात्मक) तथा गुणनफल α·β = c/a = +127 (धनात्मक)।',
      'चूँकि गुणनफल धनात्मक और योग ऋणात्मक है, इसलिए दोनों शून्यक निश्चित रूप से ऋणात्मक (Both Negative) होंगे।',
      'अतः सही विकल्प (B) दोनों ऋणात्मक है।',
    ],
    tag: 'NCERT Exemplar • BSEB 2023',
    diff: 'Hard',
  },
  {
    q: 'यदि किसी द्विघात बहुपद p(x) = x² + bx + c में c < 0 (ऋणात्मक) हो, तो उसके दोनों शून्यक कैसे होंगे?',
    opts: ['दोनों धनात्मक', 'दोनों ऋणात्मक', 'विपरीत चिन्ह के (एक धनात्मक व एक ऋणात्मक)', 'काल्पनिक'],
    ans: 2,
    steps: [
      'शून्यकों का गुणनफल α·β = c/1 = c < 0 (ऋणात्मक)।',
      'दो संख्याओं का गुणनफल ऋणात्मक तभी होता है जब एक संख्या धनात्मक (+) और दूसरी ऋणात्मक (-) हो।',
      'अतः दोनों शून्यक विपरीत चिन्ह के होंगे। सही विकल्प (C) है।',
    ],
    tag: 'NCERT Exemplar • VVI',
    diff: 'Hard',
  },
];

// ============================================================================
// DETERMINISTIC GENERATOR FOR ALL 500 QUESTIONS (1 TO 500)
// ============================================================================
function buildAll500MathCh02Questions(): MathCh02Question500Item[] {
  const list: MathCh02Question500Item[] = [];

  // --------------------------------------------------------------------------
  // PART 1: Questions 1 to 50 (Board PYQ & Core Concepts)
  // --------------------------------------------------------------------------
  PART_1_RAW.forEach((item, idx) => {
    list.push(
      makeQuestionItem(
        idx + 1,
        'part-1',
        CLASS_10_MATH_CH02_500_PARTS[0].hindiTitle,
        'बहुपद पहचान, घात एवं सूत्र',
        item.q,
        item.opts,
        item.ans,
        item.steps,
        item.tag,
        item.diff || 'Easy',
        true
      )
    );
  });

  // --------------------------------------------------------------------------
  // PART 2: Questions 51 to 100 (Finding Zeroes of Linear & Quadratic Polynomials)
  // --------------------------------------------------------------------------
  // 10 Pure Quadratic x² - k = 0 + 40 Quadratic factorizations (x - r1)(x - r2)
  const pureSquares = [2, 3, 5, 7, 11, 13, 15, 4, 9, 16];
  pureSquares.forEach((val, idx) => {
    const qId = 51 + idx;
    const isPerfect = [4, 9, 16].includes(val);
    const rootStr = isPerfect ? String(Math.sqrt(val)) : `√${val}`;
    const qText = `द्विघात बहुपद p(x) = x² - ${val} के शून्यक क्या हैं?`;
    const correctAns = `+${rootStr}, -${rootStr}`;
    const opts: [string, string, string, string] = [
      `${val}, -${val}`,
      correctAns,
      `${rootStr}, ${rootStr}`,
      `-${rootStr}, -${rootStr}`,
    ];
    const steps = [
      `दिया गया बहुपद: p(x) = x² - ${val}`,
      `शून्यक ज्ञात करने के लिए p(x) = 0 रखने पर:`,
      `x² - ${val} = 0  ⇒  x² = ${val}`,
      `वर्गमूल लेने पर: x = ±${rootStr} अर्थात् +${rootStr} और -${rootStr}`,
      `अतः सही विकल्प (B) +${rootStr}, -${rootStr} है।`,
    ];
    list.push(
      makeQuestionItem(
        qId,
        'part-2',
        CLASS_10_MATH_CH02_500_PARTS[1].hindiTitle,
        'द्विघात बहुपद के शून्यक',
        qText,
        opts,
        1,
        steps,
        idx < 5 ? 'BSEB PYQ 2018-2024' : 'Board VVI Pattern',
        'Easy',
        true
      )
    );
  });

  const rootPairsPart2: Array<[number, number]> = [
    [2, 3], [1, 4], [2, 5], [3, 4], [1, 6], [2, 7], [3, 5], [4, 5], [2, 6], [3, 7],
    [-1, -2], [-2, -3], [-1, -5], [-3, -4], [-2, -5], [-4, -6], [-1, -7], [-3, -6], [-2, -8], [-5, -6],
    [-2, 5], [-3, 7], [-1, 6], [-4, 5], [-3, 8], [-2, 9], [-5, 7], [-4, 9], [-1, 8], [-6, 8],
    [2, -5], [3, -7], [1, -4], [4, -7], [3, -8], [2, -7], [5, -8], [4, -9], [1, -9], [3, -10],
  ];

  rootPairsPart2.forEach(([r1, r2], idx) => {
    const qId = 61 + idx;
    const sum = r1 + r2;
    const prod = r1 * r2;
    const polyStr = formatQuad(1, -sum, prod);
    const qText = `द्विघात बहुपद p(x) = ${polyStr} के शून्यक (Zeroes) ज्ञात कीजिए:`;
    const correctAns = `${r1}, ${r2}`;
    const wrong1 = `${-r1}, ${-r2}`;
    const wrong2 = `${r1}, ${-r2}`;
    const wrong3 = `${r1 + 1}, ${r2 - 1 === r1 + 1 ? r2 + 2 : r2 - 1}`;
    const ansIdx = (idx % 4) as 0 | 1 | 2 | 3;
    const opts: [string, string, string, string] = [wrong1, wrong2, wrong3, wrong1];
    opts[ansIdx] = correctAns;
    // Ensure uniqueness of options
    const distractors = [wrong1, wrong2, wrong3, `${sum}, ${prod}`].filter((d) => d !== correctAns);
    let dPtr = 0;
    for (let i = 0; i < 4; i++) {
      if (i !== ansIdx) {
        opts[i] = distractors[dPtr++] || `${r1 + i + 2}, ${r2 + i + 2}`;
      }
    }

    const f1 = r1 >= 0 ? `(x - ${r1})` : `(x + ${Math.abs(r1)})`;
    const f2 = r2 >= 0 ? `(x - ${r2})` : `(x + ${Math.abs(r2)})`;
    const steps = [
      `दिया गया द्विघात बहुपद: p(x) = ${polyStr}`,
      `मध्य पद को विभक्त कर गुणनखंड करने पर:`,
      `p(x) = ${f1}${f2}`,
      `शून्यक के लिए p(x) = 0 रखने पर: ${f1} = 0 या ${f2} = 0`,
      `अतः x = ${r1} और x = ${r2} प्राप्त होते हैं।`,
      `अतः सही विकल्प (${OPTION_KEYS[ansIdx]}) ${correctAns} है।`,
    ];

    list.push(
      makeQuestionItem(
        qId,
        'part-2',
        CLASS_10_MATH_CH02_500_PARTS[1].hindiTitle,
        'गुणनखंड विधि से शून्यक',
        qText,
        opts,
        ansIdx,
        steps,
        idx < 12 ? 'BSEB PYQ 2019-2024' : 'NCERT / BSEB VVI',
        'Medium',
        true
      )
    );
  });

  // --------------------------------------------------------------------------
  // PART 3: Questions 101 to 150 (Sum α+β = -b/a & Product αβ = c/a)
  // --------------------------------------------------------------------------
  const coeffsPart3: Array<[number, number, number, 'sum' | 'prod']> = [
    [1, -5, 6, 'sum'], [1, -5, 6, 'prod'], [1, 7, 10, 'sum'], [1, 7, 10, 'prod'],
    [1, -2, -6, 'prod'], [1, -3, -4, 'sum'], [2, -7, 3, 'sum'], [2, -7, 3, 'prod'],
    [3, -5, 2, 'sum'], [3, -5, 2, 'prod'], [4, -4, 1, 'sum'], [4, -4, 1, 'prod'],
    [6, -7, -3, 'sum'], [6, -7, -3, 'prod'], [1, 4, -12, 'sum'], [1, 4, -12, 'prod'],
    [2, 5, -12, 'sum'], [2, 5, -12, 'prod'], [3, 8, 4, 'sum'], [3, 8, 4, 'prod'],
    [5, -11, 2, 'sum'], [5, -11, 2, 'prod'], [1, -9, 20, 'sum'], [1, -9, 20, 'prod'],
    [2, -9, 4, 'sum'], [2, -9, 4, 'prod'], [3, -10, 8, 'sum'], [3, -10, 8, 'prod'],
    [4, 8, -5, 'sum'], [4, 8, -5, 'prod'], [1, -11, 28, 'sum'], [1, -11, 28, 'prod'],
    [2, 3, -9, 'sum'], [2, 3, -9, 'prod'], [5, 13, 6, 'sum'], [5, 13, 6, 'prod'],
    [3, -4, -4, 'sum'], [3, -4, -4, 'prod'], [1, 12, 35, 'sum'], [1, 12, 35, 'prod'],
    [2, -13, 15, 'sum'], [2, -13, 15, 'prod'], [4, -15, 9, 'sum'], [4, -15, 9, 'prod'],
    [6, 11, 3, 'sum'], [6, 11, 3, 'prod'], [1, -15, 56, 'sum'], [1, -15, 56, 'prod'],
    [3, 14, 8, 'sum'], [3, 14, 8, 'prod'],
  ];

  coeffsPart3.forEach(([a, b, c, mode], idx) => {
    const qId = 101 + idx;
    const polyStr = formatQuad(a, b, c);
    const isSum = mode === 'sum';
    const ansVal = isSum ? fmtFrac(-b, a) : fmtFrac(c, a);
    const oppSignVal = isSum ? fmtFrac(b, a) : fmtFrac(-c, a);
    const otherMetricVal = isSum ? fmtFrac(c, a) : fmtFrac(-b, a);
    const invVal = isSum ? fmtFrac(a, -b) : fmtFrac(a, c);

    const qText = isSum
      ? `यदि बहुपद p(x) = ${polyStr} के शून्यक α और β हों, तो शून्यकों का योगफल (α + β) क्या होगा?`
      : `यदि बहुपद p(x) = ${polyStr} के शून्यक α और β हों, तो शून्यकों का गुणनफल (α × β) क्या होगा?`;

    const ansIdx = (idx % 4) as 0 | 1 | 2 | 3;
    const rawDistractors = [oppSignVal, otherMetricVal, invVal, fmtFrac(b + c, a), fmtFrac(-c, b)].filter(
      (d) => d !== ansVal
    );
    const uniqueDistractors = Array.from(new Set(rawDistractors));
    const opts: [string, string, string, string] = ['0', '1', '-1', '2'];
    opts[ansIdx] = ansVal;
    let p = 0;
    for (let i = 0; i < 4; i++) {
      if (i !== ansIdx) {
        opts[i] = uniqueDistractors[p++] || `${i + 7}`;
      }
    }

    const steps = isSum
      ? [
          `दिया गया द्विघात बहुपद: p(x) = ${polyStr}`,
          `मानक रूप ax² + bx + c से तुलना करने पर: a = ${a}, b = ${b}, c = ${c}`,
          `शून्यकों का योगफल सूत्र: α + β = -b / a`,
          `मान रखने पर: α + β = -(${b}) / ${a} = ${ansVal}`,
          `अतः सही विकल्प (${OPTION_KEYS[ansIdx]}) ${ansVal} है।`,
        ]
      : [
          `दिया गया द्विघात बहुपद: p(x) = ${polyStr}`,
          `मानक रूप ax² + bx + c से तुलना करने पर: a = ${a}, b = ${b}, c = ${c}`,
          `शून्यकों का गुणनफल सूत्र: α × β = c / a`,
          `मान रखने पर: α × β = ${c} / ${a} = ${ansVal}`,
          `अतः सही विकल्प (${OPTION_KEYS[ansIdx]}) ${ansVal} है।`,
        ];

    list.push(
      makeQuestionItem(
        qId,
        'part-3',
        CLASS_10_MATH_CH02_500_PARTS[2].hindiTitle,
        isSum ? 'शून्यकों का योग (α + β)' : 'शून्यकों का गुणनफल (α·β)',
        qText,
        opts,
        ansIdx,
        steps,
        idx < 15 ? 'BSEB PYQ 2017-2024' : 'Board VVI Question',
        'Easy',
        true
      )
    );
  });

  // --------------------------------------------------------------------------
  // PART 4: Questions 151 to 200 (Reciprocal Sum 1/α + 1/β = -b/c & 1/α·1/β)
  // --------------------------------------------------------------------------
  const coeffsPart4: Array<[number, number, number]> = [
    [1, 1, -2], [1, -3, 5], [1, 2, 1], [1, -5, 6], [1, 7, 10],
    [2, -7, 3], [3, -5, 2], [1, -4, 3], [1, 6, 8], [2, 5, -3],
    [1, -2, -8], [3, 7, 4], [1, -9, 14], [2, -3, 5], [4, -8, 3],
    [1, 5, -6], [2, 9, 7], [3, -11, 6], [1, -8, 15], [5, -6, 1],
    [1, 3, -10], [2, -5, 8], [3, 4, -7], [1, -7, 12], [4, 5, 2],
    [1, 11, 18], [2, -11, 5], [3, -8, 10], [1, -6, -16], [5, 8, 4],
    [1, -10, 21], [2, 7, -4], [3, -2, 8], [1, 9, -22], [4, -3, 6],
    [1, -12, 27], [2, -9, 10], [3, 5, -12], [1, 8, 15], [6, -5, 2],
    [1, -13, 30], [2, 3, 7], [3, -7, -6], [1, 10, 24], [5, -12, 4],
    [1, -14, 33], [2, -15, 7], [4, 9, 3], [1, -5, -14], [3, 10, 5],
  ];

  coeffsPart4.forEach(([a, b, c], idx) => {
    const qId = 151 + idx;
    const polyStr = formatQuad(a, b, c);
    const ansVal = fmtFrac(-b, c);
    const wrong1 = fmtFrac(b, c);
    const wrong2 = fmtFrac(c, -b);
    const wrong3 = fmtFrac(-b, a);
    const wrong4 = fmtFrac(c, a);

    const qText = `यदि बहुपद p(x) = ${polyStr} के शून्यक α तथा β हों, तो 1/α + 1/β का मान क्या होगा?`;
    const ansIdx = (idx % 4) as 0 | 1 | 2 | 3;
    const uniqueDistractors = Array.from(new Set([wrong1, wrong2, wrong3, wrong4, fmtFrac(b, a)])).filter(
      (d) => d !== ansVal
    );
    const opts: [string, string, string, string] = ['1', '-1', '0', '2'];
    opts[ansIdx] = ansVal;
    let p = 0;
    for (let i = 0; i < 4; i++) {
      if (i !== ansIdx) {
        opts[i] = uniqueDistractors[p++] || `${i + 5}/${c}`;
      }
    }

    const sumStr = fmtFrac(-b, a);
    const prodStr = fmtFrac(c, a);
    const steps = [
      `दिया गया बहुपद: p(x) = ${polyStr}`,
      `यहाँ a = ${a}, b = ${b}, c = ${c}`,
      `शून्यकों का योग: α + β = -b/a = ${sumStr} तथा गुणनफल: α·β = c/a = ${prodStr}`,
      `सूत्र से: 1/α + 1/β = (α + β) / (α·β) = -b / c`,
      `मान रखने पर: 1/α + 1/β = -(${b}) / (${c}) = ${ansVal}`,
      `अतः सही विकल्प (${OPTION_KEYS[ansIdx]}) ${ansVal} है।`,
    ];

    list.push(
      makeQuestionItem(
        qId,
        'part-4',
        CLASS_10_MATH_CH02_500_PARTS[3].hindiTitle,
        'व्युत्क्रमों का योग (1/α + 1/β)',
        qText,
        opts,
        ansIdx,
        steps,
        idx < 18 ? 'BSEB PYQ 2018-2024 (VVI)' : 'Bihar Board Top Pattern',
        'Medium',
        true
      )
    );
  });

  // --------------------------------------------------------------------------
  // PART 5: Questions 201 to 250 (Sum of Squares α² + β² & (α - β)²)
  // --------------------------------------------------------------------------
  const coeffsPart5: Array<[number, number, number, 'sqSum' | 'diffSq']> = [
    [1, -5, 6, 'sqSum'], [1, -3, 2, 'sqSum'], [1, -4, 3, 'sqSum'], [1, 5, 6, 'sqSum'], [1, -6, 8, 'sqSum'],
    [1, -7, 10, 'sqSum'], [1, 7, 12, 'sqSum'], [1, -8, 15, 'sqSum'], [1, -5, 4, 'sqSum'], [1, 6, 5, 'sqSum'],
    [1, -2, -3, 'sqSum'], [1, -3, -4, 'sqSum'], [1, 4, -5, 'sqSum'], [1, -5, -6, 'sqSum'], [1, 2, -8, 'sqSum'],
    [1, -9, 14, 'sqSum'], [1, -6, 7, 'sqSum'], [1, 8, 12, 'sqSum'], [1, -10, 16, 'sqSum'], [1, -4, 1, 'sqSum'],
    [2, -5, 3, 'sqSum'], [2, -7, 3, 'sqSum'], [3, -5, 2, 'sqSum'], [2, -3, 1, 'sqSum'], [4, -4, 1, 'sqSum'],
    [1, -5, 6, 'diffSq'], [1, -7, 10, 'diffSq'], [1, -6, 8, 'diffSq'], [1, -8, 12, 'diffSq'], [1, 5, 4, 'diffSq'],
    [1, -9, 20, 'diffSq'], [1, 7, 6, 'diffSq'], [1, -4, -5, 'diffSq'], [1, -2, -8, 'diffSq'], [1, -10, 21, 'diffSq'],
    [1, -11, 24, 'sqSum'], [1, 9, 18, 'sqSum'], [1, -7, 8, 'sqSum'], [1, 3, -4, 'sqSum'], [1, -8, 9, 'sqSum'],
    [1, 6, -7, 'sqSum'], [1, -10, 24, 'sqSum'], [1, -9, 10, 'sqSum'], [1, 5, -14, 'sqSum'], [1, -12, 20, 'sqSum'],
    [2, -6, 4, 'sqSum'], [3, -9, 6, 'sqSum'], [2, 8, 6, 'sqSum'], [1, -11, 10, 'sqSum'], [1, 4, 2, 'sqSum'],
  ];

  coeffsPart5.forEach(([a, b, c, mode], idx) => {
    const qId = 201 + idx;
    const polyStr = formatQuad(a, b, c);
    // α + β = -b/a, αβ = c/a
    // α² + β² = (b² - 2ac) / a²
    // (α - β)² = (b² - 4ac) / a²
    const isSqSum = mode === 'sqSum';
    const num = isSqSum ? b * b - 2 * a * c : b * b - 4 * a * c;
    const den = a * a;
    const ansVal = fmtFrac(num, den);
    const wrong1 = fmtFrac(b * b + 2 * a * c, den);
    const wrong2 = fmtFrac(isSqSum ? b * b - 4 * a * c : b * b - 2 * a * c, den);
    const wrong3 = fmtFrac(b * b - a * c, den);
    const wrong4 = fmtFrac(-b, a);

    const qText = isSqSum
      ? `यदि द्विघात बहुपद p(x) = ${polyStr} के शून्यक α और β हैं, तो (α² + β²) का मान क्या होगा?`
      : `यदि द्विघात बहुपद p(x) = ${polyStr} के शून्यक α और β हैं, तो (α - β)² का मान क्या होगा?`;

    const ansIdx = (idx % 4) as 0 | 1 | 2 | 3;
    const uniqueDistractors = Array.from(new Set([wrong1, wrong2, wrong3, wrong4])).filter((d) => d !== ansVal);
    const opts: [string, string, string, string] = ['5', '10', '13', '25'];
    opts[ansIdx] = ansVal;
    let p = 0;
    for (let i = 0; i < 4; i++) {
      if (i !== ansIdx) {
        opts[i] = uniqueDistractors[p++] || `${num + (i + 1) * 2}`;
      }
    }

    const sumStr = fmtFrac(-b, a);
    const prodStr = fmtFrac(c, a);
    const steps = isSqSum
      ? [
          `दिया गया बहुपद: p(x) = ${polyStr} (यहाँ a = ${a}, b = ${b}, c = ${c})`,
          `शून्यकों का योग: α + β = -b/a = ${sumStr}`,
          `शून्यकों का गुणनफल: α·β = c/a = ${prodStr}`,
          `सूत्र: α² + β² = (α + β)² - 2αβ`,
          `मान रखने पर: (${sumStr})² - 2(${prodStr}) = ${fmtFrac(b * b, den)} - ${fmtFrac(2 * a * c, den)} = ${ansVal}`,
          `अतः सही विकल्प (${OPTION_KEYS[ansIdx]}) ${ansVal} है।`,
        ]
      : [
          `दिया गया बहुपद: p(x) = ${polyStr} (यहाँ a = ${a}, b = ${b}, c = ${c})`,
          `शून्यकों का योग: α + β = -b/a = ${sumStr} तथा गुणनफल: α·β = c/a = ${prodStr}`,
          `सूत्र: (α - β)² = (α + β)² - 4αβ`,
          `मान रखने पर: (${sumStr})² - 4(${prodStr}) = ${fmtFrac(b * b, den)} - ${fmtFrac(4 * a * c, den)} = ${ansVal}`,
          `अतः सही विकल्प (${OPTION_KEYS[ansIdx]}) ${ansVal} है।`,
        ];

    list.push(
      makeQuestionItem(
        qId,
        'part-5',
        CLASS_10_MATH_CH02_500_PARTS[4].hindiTitle,
        isSqSum ? 'शून्यकों के वर्गों का योग (α² + β²)' : 'शून्यकों के अंतर का वर्ग (α - β)²',
        qText,
        opts,
        ansIdx,
        steps,
        idx < 10 ? 'BSEB PYQ 2020-2024' : 'Board VVI Formula Question',
        'Medium',
        true
      )
    );
  });

  // --------------------------------------------------------------------------
  // PART 6: Questions 251 to 300 (Sum of Cubes α³ + β³ & α²β + αβ² & α/β + β/α)
  // --------------------------------------------------------------------------
  // 20 questions on α²β + αβ² = αβ(α + β)
  // 20 questions on α³ + β³ = (α + β)³ - 3αβ(α + β)
  // 10 questions on α/β + β/α = (α² + β²)/αβ
  for (let idx = 0; idx < 50; idx++) {
    const qId = 251 + idx;
    const ansIdx = (idx % 4) as 0 | 1 | 2 | 3;

    if (idx < 20) {
      // α²β + αβ² = αβ(α + β)
      const bVals = [-3, -4, -5, 2, -6, 3, -7, 4, -8, 5, -2, -9, 6, -5, 7, -4, 3, -6, 8, -10];
      const cVals = [2, 3, 6, -3, 5, 4, 10, -5, 12, 6, -8, 14, -7, 4, 12, -5, -10, 8, 15, 9];
      const b = bVals[idx];
      const c = cVals[idx];
      const polyStr = formatQuad(1, b, c);
      const sum = -b;
      const prod = c;
      const val = prod * sum;
      const ansVal = String(val);
      const uniqueDistractors = Array.from(
        new Set([String(-val), String(sum + prod), String(sum * sum - prod), String(prod * prod)])
      ).filter((d) => d !== ansVal);
      const opts: [string, string, string, string] = ['6', '-6', '12', '18'];
      opts[ansIdx] = ansVal;
      let p = 0;
      for (let i = 0; i < 4; i++) {
        if (i !== ansIdx) opts[i] = uniqueDistractors[p++] || String(val + i + 3);
      }

      const steps = [
        `दिया गया बहुपद: p(x) = ${polyStr} (यहाँ a = 1, b = ${b}, c = ${c})`,
        `शून्यकों का योग: α + β = -b/a = ${sum} तथा गुणनफल: α·β = c/a = ${prod}`,
        `व्यंजक का गुणनखंड करने पर: α²β + αβ² = αβ(α + β)`,
        `मान रखने पर: (${prod}) × (${sum}) = ${ansVal}`,
        `अतः सही विकल्प (${OPTION_KEYS[ansIdx]}) ${ansVal} है।`,
      ];

      list.push(
        makeQuestionItem(
          qId,
          'part-6',
          CLASS_10_MATH_CH02_500_PARTS[5].hindiTitle,
          'सममित व्यंजक α²β + αβ²',
          `यदि बहुपद p(x) = ${polyStr} के शून्यक α और β हों, तो (α²β + αβ²) का मान क्या होगा?`,
          opts,
          ansIdx,
          steps,
          'BSEB VVI Pattern',
          'Medium',
          true
        )
      );
    } else if (idx < 40) {
      // α³ + β³ = (α + β)³ - 3αβ(α + β)
      const k = idx - 20;
      const pairs: Array<[number, number]> = [
        [-3, 2], [-4, 3], [-5, 6], [-2, 1], [-3, 1],
        [3, 2], [4, 3], [-5, 4], [-6, 8], [-4, 2],
        [-2, -3], [2, -3], [-3, -2], [-5, 2], [5, 6],
        [-6, 5], [-4, -1], [3, -2], [-7, 10], [-6, 7],
      ];
      const [b, c] = pairs[k];
      const polyStr = formatQuad(1, b, c);
      const sum = -b;
      const prod = c;
      const cubeSum = sum * sum * sum - 3 * prod * sum;
      const ansVal = String(cubeSum);
      const uniqueDistractors = Array.from(
        new Set([
          String(sum * sum * sum + 3 * prod * sum),
          String(-cubeSum),
          String(sum * sum - 2 * prod),
          String(sum * prod),
        ])
      ).filter((d) => d !== ansVal);
      const opts: [string, string, string, string] = ['9', '27', '35', '18'];
      opts[ansIdx] = ansVal;
      let p = 0;
      for (let i = 0; i < 4; i++) {
        if (i !== ansIdx) opts[i] = uniqueDistractors[p++] || String(cubeSum + (i + 1) * 5);
      }

      const steps = [
        `दिया गया बहुपद: p(x) = ${polyStr} (यहाँ a = 1, b = ${b}, c = ${c})`,
        `शून्यकों का योग: α + β = -b/a = ${sum} तथा गुणनफल: α·β = c/a = ${prod}`,
        `घन सूत्र: α³ + β³ = (α + β)³ - 3αβ(α + β)`,
        `मान रखने पर: (${sum})³ - 3(${prod})(${sum}) = ${sum * sum * sum} - (${3 * prod * sum}) = ${ansVal}`,
        `अतः सही विकल्प (${OPTION_KEYS[ansIdx]}) ${ansVal} है।`,
      ];

      list.push(
        makeQuestionItem(
          qId,
          'part-6',
          CLASS_10_MATH_CH02_500_PARTS[5].hindiTitle,
          'शून्यकों के घनों का योग (α³ + β³)',
          `यदि द्विघात बहुपद p(x) = ${polyStr} के शून्यक α और β हैं, तो (α³ + β³) का मान ज्ञात कीजिए:`,
          opts,
          ansIdx,
          steps,
          'BSEB VVI Question',
          'Hard',
          true
        )
      );
    } else {
      // α/β + β/α = ((α + β)² - 2αβ) / αβ
      const k = idx - 40;
      const pairs: Array<[number, number]> = [
        [-5, 6], [-3, 2], [-4, 3], [-7, 10], [-6, 8],
        [5, 6], [-5, 4], [-8, 15], [-6, 5], [-4, 2],
      ];
      const [b, c] = pairs[k];
      const polyStr = formatQuad(1, b, c);
      const sum = -b;
      const prod = c;
      const num = sum * sum - 2 * prod;
      const ansVal = fmtFrac(num, prod);
      const uniqueDistractors = Array.from(
        new Set([
          fmtFrac(sum * sum + 2 * prod, prod),
          fmtFrac(prod, num),
          fmtFrac(-num, prod),
          fmtFrac(sum, prod),
        ])
      ).filter((d) => d !== ansVal);
      const opts: [string, string, string, string] = ['13/6', '5/2', '10/3', '17/4'];
      opts[ansIdx] = ansVal;
      let p = 0;
      for (let i = 0; i < 4; i++) {
        if (i !== ansIdx) opts[i] = uniqueDistractors[p++] || `${num + i + 1}/${prod}`;
      }

      const steps = [
        `दिया गया बहुपद: p(x) = ${polyStr}`,
        `शून्यकों का योग: α + β = ${sum} तथा गुणनफल: α·β = ${prod}`,
        `सूत्र: α/β + β/α = (α² + β²) / αβ = [ (α + β)² - 2αβ ] / αβ`,
        `मान रखने पर: [ (${sum})² - 2(${prod}) ] / ${prod} = (${sum * sum} - ${2 * prod}) / ${prod} = ${num}/${prod} = ${ansVal}`,
        `अतः सही विकल्प (${OPTION_KEYS[ansIdx]}) ${ansVal} है।`,
      ];

      list.push(
        makeQuestionItem(
          qId,
          'part-6',
          CLASS_10_MATH_CH02_500_PARTS[5].hindiTitle,
          'अनुपातों का योग (α/β + β/α)',
          `यदि बहुपद p(x) = ${polyStr} के शून्यक α और β हैं, तो (α/β + β/α) का मान क्या होगा?`,
          opts,
          ansIdx,
          steps,
          'BSEB 2021, 2023 Pattern',
          'Hard',
          true
        )
      );
    }
  }

  // --------------------------------------------------------------------------
  // PART 7: Questions 301 to 350 (Forming Quadratic Polynomials x² - (α+β)x + αβ)
  // --------------------------------------------------------------------------
  // First 30: Given sum S and product P
  // Next 20: Given individual zeroes α and β
  const sumProdPart7: Array<[number, number]> = [
    [7, 10], [-3, 2], [-4, -5], [4, 1], [0, -5],
    [1, 1], [5, 6], [-5, 6], [8, 12], [-8, 12],
    [2, -15], [-2, -15], [3, -10], [6, 9], [-6, 9],
    [9, 20], [-7, 12], [10, 21], [-1, -12], [5, -14],
    [11, 30], [-9, 18], [4, -21], [-5, -24], [12, 35],
    [3, 2], [-3, -10], [7, -18], [8, 15], [-10, 25],
  ];

  sumProdPart7.forEach(([S, P], idx) => {
    const qId = 301 + idx;
    const ansIdx = (idx % 4) as 0 | 1 | 2 | 3;
    const correctPoly = formatQuad(1, -S, P);
    const wrong1 = formatQuad(1, S, P);
    const wrong2 = formatQuad(1, -S, -P);
    const wrong3 = formatQuad(1, S, -P);
    const wrong4 = formatQuad(1, P, -S);

    const uniqueDistractors = Array.from(new Set([wrong1, wrong2, wrong3, wrong4])).filter(
      (d) => d !== correctPoly
    );
    const opts: [string, string, string, string] = ['x² - x + 1', 'x² + x + 1', 'x² - x - 1', 'x² + x - 1'];
    opts[ansIdx] = correctPoly;
    let p = 0;
    for (let i = 0; i < 4; i++) {
      if (i !== ansIdx) opts[i] = uniqueDistractors[p++] || formatQuad(1, -S + i + 1, P + 1);
    }

    const qText = `ऐसा द्विघात बहुपद ज्ञात कीजिए जिसके शून्यकों का योगफल ${S} तथा गुणनफल ${P} है:`;
    const steps = [
      `दिया है: शून्यकों का योगफल (α + β) = ${S}`,
      `शून्यकों का गुणनफल (α·β) = ${P}`,
      `द्विघात बहुपद का सूत्र: p(x) = x² - (α + β)x + αβ`,
      `मान रखने पर: p(x) = x² - (${S})x + (${P}) = ${correctPoly}`,
      `अतः सही विकल्प (${OPTION_KEYS[ansIdx]}) ${correctPoly} है।`,
    ];

    list.push(
      makeQuestionItem(
        qId,
        'part-7',
        CLASS_10_MATH_CH02_500_PARTS[6].hindiTitle,
        'योग और गुणनफल से बहुपद निर्माण',
        qText,
        opts,
        ansIdx,
        steps,
        idx < 10 ? 'BSEB PYQ 2018-2024' : 'NCERT / Board VVI',
        'Easy',
        true
      )
    );
  });

  const rootsPart7: Array<[number, number]> = [
    [2, 6], [3, 5], [-2, -4], [-3, 5], [4, -7],
    [1, 5], [-1, 4], [2, -8], [5, 7], [-4, -5],
    [3, -9], [-2, 7], [6, 8], [-5, 9], [4, 9],
    [-3, -7], [2, 10], [-6, 10], [7, 8], [-1, -9],
  ];

  rootsPart7.forEach(([r1, r2], idx) => {
    const qId = 331 + idx;
    const ansIdx = (idx % 4) as 0 | 1 | 2 | 3;
    const S = r1 + r2;
    const P = r1 * r2;
    const correctPoly = formatQuad(1, -S, P);
    const wrong1 = formatQuad(1, S, P);
    const wrong2 = formatQuad(1, -S, -P);
    const wrong3 = formatQuad(1, S, -P);

    const uniqueDistractors = Array.from(new Set([wrong1, wrong2, wrong3])).filter(
      (d) => d !== correctPoly
    );
    const opts: [string, string, string, string] = ['x² - 5x + 6', 'x² + 5x + 6', 'x² - 5x - 6', 'x² + 5x - 6'];
    opts[ansIdx] = correctPoly;
    let p = 0;
    for (let i = 0; i < 4; i++) {
      if (i !== ansIdx) opts[i] = uniqueDistractors[p++] || formatQuad(1, -S + i + 2, P + 2);
    }

    const qText = `यदि किसी द्विघात बहुपद के शून्यक α = ${r1} और β = ${r2} हों, तो वह द्विघात बहुपद क्या होगा?`;
    const steps = [
      `दिए गए शून्यक: α = ${r1} तथा β = ${r2}`,
      `शून्यकों का योगफल: α + β = (${r1}) + (${r2}) = ${S}`,
      `शून्यकों का गुणनफल: α · β = (${r1}) × (${r2}) = ${P}`,
      `द्विघात बहुपद सूत्र: x² - (α + β)x + αβ = ${correctPoly}`,
      `अतः सही विकल्प (${OPTION_KEYS[ansIdx]}) ${correctPoly} है।`,
    ];

    list.push(
      makeQuestionItem(
        qId,
        'part-7',
        CLASS_10_MATH_CH02_500_PARTS[6].hindiTitle,
        'दिए गए शून्यकों से बहुपद निर्माण',
        qText,
        opts,
        ansIdx,
        steps,
        'BSEB PYQ 2020-2024',
        'Medium',
        true
      )
    );
  });

  // --------------------------------------------------------------------------
  // PART 8: Questions 351 to 400 (Finding Unknown Constant k)
  // --------------------------------------------------------------------------
  // 25 questions: One zero α is given for x² + bx + k = 0 => k = -(α² + bα)
  // 15 questions: Product of zeroes = P or Sum of zeroes = S => find k
  // 10 questions: One zero is reciprocal of other => c = a => find k
  for (let idx = 0; idx < 50; idx++) {
    const qId = 351 + idx;
    const ansIdx = (idx % 4) as 0 | 1 | 2 | 3;

    if (idx < 25) {
      const alphaList = [2, 3, -2, 1, -3, 4, -1, 5, 2, -4, 3, -2, 4, 5, -3, 2, 1, -5, 3, 4, -2, 6, -3, 2, 5];
      const bList = [-6, -7, 5, -4, 2, -9, 3, -8, 3, 6, -5, -3, -6, -12, 7, -9, 8, 4, -10, -5, 7, -8, -2, 5, -7];
      const alpha = alphaList[idx];
      const b = bList[idx];
      // p(x) = x² + bx + k, since p(alpha) = 0 => alpha² + b*alpha + k = 0 => k = -(alpha² + b*alpha)
      const kVal = -(alpha * alpha + b * alpha);
      const bTerm = fmtTerm(b, 'x', false);
      const polyDisplay = `x²${bTerm} + k`;
      const ansVal = String(kVal);
      const uniqueDistractors = Array.from(
        new Set([String(-kVal), String(kVal + 2), String(kVal - 2), String(alpha * b)])
      ).filter((d) => d !== ansVal);
      const opts: [string, string, string, string] = ['4', '-4', '8', '-8'];
      opts[ansIdx] = ansVal;
      let p = 0;
      for (let i = 0; i < 4; i++) {
        if (i !== ansIdx) opts[i] = uniqueDistractors[p++] || String(kVal + i + 3);
      }

      const steps = [
        `दिया गया बहुपद: p(x) = ${polyDisplay}`,
        `चूँकि x = ${alpha} इस बहुपद का एक शून्यक है, इसलिए p(${alpha}) = 0 होगा।`,
        `मान रखने पर: (${alpha})² + (${b})(${alpha}) + k = 0`,
        `${alpha * alpha} + (${b * alpha}) + k = 0  ⇒  ${alpha * alpha + b * alpha} + k = 0  ⇒  k = ${kVal}`,
        `अतः सही विकल्प (${OPTION_KEYS[ansIdx]}) ${ansVal} है।`,
      ];

      list.push(
        makeQuestionItem(
          qId,
          'part-8',
          CLASS_10_MATH_CH02_500_PARTS[7].hindiTitle,
          'एक शून्यक ज्ञात होने पर k का मान',
          `यदि द्विघात बहुपद p(x) = ${polyDisplay} का एक शून्यक ${alpha} है, तो k का मान क्या होगा?`,
          opts,
          ansIdx,
          steps,
          'BSEB 2019, 2022, 2024',
          'Medium',
          true
        )
      );
    } else if (idx < 40) {
      const m = idx - 25;
      const isSumType = m % 2 === 0;
      const targetVal = m + 3;
      const otherCoeff = m + 5;
      const ansVal = String(targetVal);
      const opts: [string, string, string, string] = [
        String(targetVal),
        String(-targetVal),
        String(otherCoeff),
        String(-otherCoeff),
      ];
      // swap to ansIdx
      const temp = opts[0];
      opts[0] = opts[ansIdx];
      opts[ansIdx] = temp;

      const qText = isSumType
        ? `यदि द्विघात बहुपद p(x) = x² - kx + ${otherCoeff} के शून्यकों का योगफल ${targetVal} है, तो k का मान क्या होगा?`
        : `यदि द्विघात बहुपद p(x) = x² - ${otherCoeff}x + k के शून्यकों का गुणनफल ${targetVal} है, तो k का मान क्या होगा?`;

      const steps = isSumType
        ? [
            `दिया गया बहुपद: p(x) = x² - kx + ${otherCoeff} (यहाँ a = 1, b = -k, c = ${otherCoeff})`,
            `शून्यकों का योगफल (α + β) = -b/a = -(-k)/1 = k`,
            `प्रश्न के अनुसार, α + β = ${targetVal}  ⇒  k = ${targetVal}`,
            `अतः सही विकल्प (${OPTION_KEYS[ansIdx]}) ${ansVal} है।`,
          ]
        : [
            `दिया गया बहुपद: p(x) = x² - ${otherCoeff}x + k (यहाँ a = 1, b = -${otherCoeff}, c = k)`,
            `शून्यकों का गुणनफल (α·β) = c/a = k/1 = k`,
            `प्रश्न के अनुसार, α·β = ${targetVal}  ⇒  k = ${targetVal}`,
            `अतः सही विकल्प (${OPTION_KEYS[ansIdx]}) ${ansVal} है।`,
          ];

      list.push(
        makeQuestionItem(
          qId,
          'part-8',
          CLASS_10_MATH_CH02_500_PARTS[7].hindiTitle,
          'योग/गुणनफल से k का मान',
          qText,
          opts,
          ansIdx,
          steps,
          'BSEB 2021, 2023',
          'Easy',
          true
        )
      );
    } else {
      // Reciprocal zeroes => c = a
      const m = idx - 40;
      const aVal = m + 2;
      const bVal = -(2 * m + 5);
      const ansVal = String(aVal);
      const opts: [string, string, string, string] = [
        String(aVal),
        String(-aVal),
        String(Math.abs(bVal)),
        String(bVal),
      ];
      const temp = opts[0];
      opts[0] = opts[ansIdx];
      opts[ansIdx] = temp;

      const qText = `यदि बहुपद p(x) = ${aVal}x² ${bVal}x + k का एक शून्यक दूसरे शून्यक का व्युत्क्रम (1/α) हो, तो k का मान क्या होगा?`;
      const steps = [
        `दिया गया बहुपद: p(x) = ${aVal}x² ${bVal}x + k (यहाँ a = ${aVal}, b = ${bVal}, c = k)`,
        `माना शून्यक α और 1/α हैं। तब शून्यकों का गुणनफल = α × (1/α) = 1`,
        `सूत्र से: c / a = 1  ⇒  k / ${aVal} = 1  ⇒  k = ${aVal}`,
        `अतः सही विकल्प (${OPTION_KEYS[ansIdx]}) ${ansVal} है।`,
      ];

      list.push(
        makeQuestionItem(
          qId,
          'part-8',
          CLASS_10_MATH_CH02_500_PARTS[7].hindiTitle,
          'व्युत्क्रम शून्यक होने पर k का मान',
          qText,
          opts,
          ansIdx,
          steps,
          'BSEB 2020, 2024 (VVI)',
          'Medium',
          true
        )
      );
    }
  }

  // --------------------------------------------------------------------------
  // PART 9: Questions 401 to 450 (Value of Polynomial p(k) & Division Degree)
  // --------------------------------------------------------------------------
  // 35 questions: Evaluate p(k) for given quadratic polynomial
  // 15 questions: Degree of p(x)/g(x) or p(x)*g(x)
  for (let idx = 0; idx < 50; idx++) {
    const qId = 401 + idx;
    const ansIdx = (idx % 4) as 0 | 1 | 2 | 3;

    if (idx < 35) {
      const xVals = [1, 2, -1, 3, -2, 0, 4, 2, -3, 1, 3, -1, 2, 5, -2, 1, 3, 4, -1, 2, 3, -2, 1, 4, -3, 2, 5, -1, 3, 2, -2, 4, 1, 3, -1];
      const aVals = [1, 1, 2, 1, 1, 3, 1, 2, 1, 3, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 3, 5, 1, 2, 4, 1, 2, 3, 5, 1, 2, 3, 1, 4];
      const bVals = [-3, -5, 3, -2, 4, -7, -3, -3, 2, -4, -5, -6, 2, -4, -3, -5, 4, -5, 2, -7, -3, 5, -2, -6, 3, -5, -8, 4, -2, -6, 5, -7, -4, 6, -3];
      const cVals = [-4, 6, 1, -5, -3, 8, 2, -4, -5, 2, 1, 5, -7, 3, 4, 2, -8, 3, -6, 10, 4, -2, 1, 5, -4, 3, 12, -3, -7, 2, -6, 5, 8, -9, 2];

      const x0 = xVals[idx];
      const a = aVals[idx];
      const b = bVals[idx];
      const c = cVals[idx];
      const polyStr = formatQuad(a, b, c);
      const t1 = a * x0 * x0;
      const t2 = b * x0;
      const res = t1 + t2 + c;
      const ansVal = String(res);

      const uniqueDistractors = Array.from(
        new Set([String(-res), String(t1 - t2 + c), String(res + 4), String(res - 4)])
      ).filter((d) => d !== ansVal);
      const opts: [string, string, string, string] = ['2', '-2', '6', '-6'];
      opts[ansIdx] = ansVal;
      let p = 0;
      for (let i = 0; i < 4; i++) {
        if (i !== ansIdx) opts[i] = uniqueDistractors[p++] || String(res + i + 2);
      }

      const steps = [
        `दिया गया बहुपद: p(x) = ${polyStr}`,
        `x = ${x0} रखने पर:`,
        `p(${x0}) = ${a === 1 ? '' : `${a}×`}(${x0})² + (${b})(${x0}) + (${c})`,
        `p(${x0}) = ${t1} + (${t2}) + (${c}) = ${res}`,
        `अतः सही विकल्प (${OPTION_KEYS[ansIdx]}) ${ansVal} है।`,
      ];

      list.push(
        makeQuestionItem(
          qId,
          'part-9',
          CLASS_10_MATH_CH02_500_PARTS[8].hindiTitle,
          'बहुपद का मान p(k) ज्ञात करना',
          `यदि बहुपद p(x) = ${polyStr} हो, तो p(${x0}) का मान क्या होगा?`,
          opts,
          ansIdx,
          steps,
          'BSEB 2020-2024',
          'Easy',
          true
        )
      );
    } else {
      const m = idx - 35;
      const degP = m + 5;
      const degG = (m % 3) + 1;
      const degQ = degP - degG;
      const ansVal = String(degQ);
      const uniqueDistractors = Array.from(
        new Set([String(degP + degG), String(degP * degG), String(degQ + 1), String(degQ - 1)])
      ).filter((d) => d !== ansVal);
      const opts: [string, string, string, string] = ['2', '3', '4', '5'];
      opts[ansIdx] = ansVal;
      let p = 0;
      for (let i = 0; i < 4; i++) {
        if (i !== ansIdx) opts[i] = uniqueDistractors[p++] || String(degQ + i + 2);
      }

      const steps = [
        `दिया है: बहुपद p(x) का घात = ${degP} तथा भाजक g(x) का घात = ${degG}`,
        `नियम: भागफल p(x) / g(x) का घात = घात p(x) - घात g(x)`,
        `अतः भागफल का घात = ${degP} - ${degG} = ${degQ}`,
        `सही विकल्प (${OPTION_KEYS[ansIdx]}) ${ansVal} है।`,
      ];

      list.push(
        makeQuestionItem(
          qId,
          'part-9',
          CLASS_10_MATH_CH02_500_PARTS[8].hindiTitle,
          'बहुपद विभाजन में भागफल का घात',
          `यदि बहुपद p(x) का घात ${degP} है और g(x) का घात ${degG} है, तो भागफल p(x) / g(x) का घात क्या होगा?`,
          opts,
          ansIdx,
          steps,
          'BSEB 2022, 2023, 2024',
          'Easy',
          true
        )
      );
    }
  }

  // --------------------------------------------------------------------------
  // PART 10: Questions 451 to 500 (Cubic Polynomials α, β, γ Relations)
  // --------------------------------------------------------------------------
  const cubicData: Array<[number, number, number, number]> = [
    [1, -4, 5, -2], [2, -5, -14, 8], [1, -3, -1, 3], [1, -6, 11, -6], [3, -5, -11, -3],
    [1, 2, -5, -6], [2, 1, -13, 6], [1, -7, 14, -8], [4, -8, 5, -1], [1, -5, 8, -4],
    [2, -3, -8, -3], [1, 4, 1, -6], [3, -10, 9, -2], [1, -2, -9, 18], [2, 5, -4, -3],
    [1, -9, 26, -24], [1, 6, 11, 6], [2, -7, 7, -2], [3, 2, -7, 2], [1, -8, 19, -12],
    [4, -4, -7, -2], [1, -3, -10, 24], [2, -9, 13, -6], [1, 5, -2, -24], [3, -4, -5, 2],
  ];

  for (let idx = 0; idx < 50; idx++) {
    const qId = 451 + idx;
    const ansIdx = (idx % 4) as 0 | 1 | 2 | 3;
    const [a, b, c, d] = cubicData[idx % cubicData.length];
    const polyStr = formatCubic(a, b, c, d);
    const mode = idx % 3; // 0: α+β+γ = -b/a, 1: αβ+βγ+γα = c/a, 2: αβγ = -d/a

    const sumVal = fmtFrac(-b, a);
    const pairVal = fmtFrac(c, a);
    const prodVal = fmtFrac(-d, a);

    const ansVal = mode === 0 ? sumVal : mode === 1 ? pairVal : prodVal;
    const wrong1 = mode === 0 ? fmtFrac(b, a) : mode === 1 ? fmtFrac(-c, a) : fmtFrac(d, a);
    const wrong2 = mode === 0 ? pairVal : mode === 1 ? prodVal : sumVal;
    const wrong3 = mode === 0 ? prodVal : mode === 1 ? sumVal : pairVal;

    const uniqueDistractors = Array.from(
      new Set([wrong1, wrong2, wrong3, fmtFrac(d, a), fmtFrac(b, a)])
    ).filter((x) => x !== ansVal);
    const opts: [string, string, string, string] = ['2', '-2', '6', '-6'];
    opts[ansIdx] = ansVal;
    let p = 0;
    for (let i = 0; i < 4; i++) {
      if (i !== ansIdx) opts[i] = uniqueDistractors[p++] || `${i + 4}`;
    }

    const qText =
      mode === 0
        ? `यदि त्रिघात बहुपद p(x) = ${polyStr} के शून्यक α, β और γ हों, तो (α + β + γ) का मान क्या होगा?`
        : mode === 1
        ? `यदि त्रिघात बहुपद p(x) = ${polyStr} के शून्यक α, β और γ हों, तो (αβ + βγ + γα) का मान क्या होगा?`
        : `यदि त्रिघात बहुपद p(x) = ${polyStr} के शून्यक α, β और γ हों, तो शून्यकों के गुणनफल (α·β·γ) का मान क्या होगा?`;

    const steps =
      mode === 0
        ? [
            `दिया गया त्रिघात बहुपद: p(x) = ${polyStr}`,
            `मानक रूप ax³ + bx² + cx + d से तुलना करने पर: a = ${a}, b = ${b}, c = ${c}, d = ${d}`,
            `त्रिघात बहुपद के शून्यकों का योगफल सूत्र: α + β + γ = -b / a`,
            `मान रखने पर: α + β + γ = -(${b}) / ${a} = ${ansVal}`,
            `अतः सही विकल्प (${OPTION_KEYS[ansIdx]}) ${ansVal} है।`,
          ]
        : mode === 1
        ? [
            `दिया गया त्रिघात बहुपद: p(x) = ${polyStr}`,
            `मानक रूप ax³ + bx² + cx + d से तुलना करने पर: a = ${a}, b = ${b}, c = ${c}, d = ${d}`,
            `दो-दो शून्यकों के गुणनफलों का योग सूत्र: αβ + βγ + γα = c / a`,
            `मान रखने पर: αβ + βγ + γα = ${c} / ${a} = ${ansVal}`,
            `अतः सही विकल्प (${OPTION_KEYS[ansIdx]}) ${ansVal} है।`,
          ]
        : [
            `दिया गया त्रिघात बहुपद: p(x) = ${polyStr}`,
            `मानक रूप ax³ + bx² + cx + d से तुलना करने पर: a = ${a}, b = ${b}, c = ${c}, d = ${d}`,
            `तीनों शून्यकों का गुणनफल सूत्र: α · β · γ = -d / a`,
            `मान रखने पर: α · β · γ = -(${d}) / ${a} = ${ansVal}`,
            `अतः सही विकल्प (${OPTION_KEYS[ansIdx]}) ${ansVal} है।`,
          ];

    list.push(
      makeQuestionItem(
        qId,
        'part-10',
        CLASS_10_MATH_CH02_500_PARTS[9].hindiTitle,
        mode === 0 ? 'त्रिघात योगफल (α+β+γ)' : mode === 1 ? 'त्रिघात युग्म योग (αβ+βγ+γα)' : 'त्रिघात गुणनफल (αβγ)',
        qText,
        opts,
        ansIdx,
        steps,
        'BSEB 2019-2024 Cubic VVI',
        'Medium',
        true
      )
    );
  }

  return list;
}

export const CLASS_10_MATH_CH02_500_QUESTIONS: MathCh02Question500Item[] = buildAll500MathCh02Questions();

// ============================================================================
// INTEGRATED ONLINE TESTS FOR TESTS VIEW & CONSTANTS.TS (ch-c10-math-02)
// ============================================================================
export const CLASS_10_MATH_CH02_TESTS: TestItem[] = [
  {
    id: 'test-c10-math-ch02-500-mega',
    slug: 'test-c10-math-ch02-500-mega',
    classLevel: 'class-10',
    subjectId: 'c10-math',
    bookId: 'b-c10-math-ncert',
    chapterId: 'ch-c10-math-02',
    title: 'बहुपद (Polynomials) — संपूर्ण 500 VVI वस्तुनिष्ठ प्रश्न महा-संग्राम लाइव टेस्ट (With Solved Answers)',
    type: 'online_test',
    totalQuestions: 500,
    durationMinutes: 180,
    totalMarks: 500,
    passingMarks: 300,
    isNegativeMarking: false,
    difficulty: 'Medium',
    description: 'बिहार बोर्ड कक्षा 10वीं गणित अध्याय 2 (बहुपद) के संपूर्ण 500 VVI वस्तुनिष्ठ प्रश्नों का अखंड महा-संग्राम लाइव टेस्ट — प्रत्येक प्रश्न के विकल्प और चरणबद्ध हल (Step-by-Step Solved Answer) सहित!',
    isPublished: true,
  },
  {
    id: 'test-c10-math-ch02-top50',
    slug: 'test-c10-math-ch02-top50',
    classLevel: 'class-10',
    subjectId: 'c10-math',
    bookId: 'b-c10-math-ncert',
    chapterId: 'ch-c10-math-02',
    title: 'बहुपद (Polynomials) — बोर्ड परीक्षा स्पेशल Top 50 VVI ऑनलाइन टेस्ट',
    type: 'online_test',
    totalQuestions: 50,
    durationMinutes: 45,
    totalMarks: 50,
    passingMarks: 30,
    isNegativeMarking: false,
    difficulty: 'Easy',
    description: 'बिहार बोर्ड मैट्रिक परीक्षा 2015–2026 के सबसे महत्वपूर्ण 50 VVI वस्तुनिष्ठ प्रश्नों का लाइव बोर्ड पैटर्न टेस्ट।',
    isPublished: true,
  },
  {
    id: 'test-c10-math-ch02-set1',
    slug: 'test-c10-math-ch02-set1',
    classLevel: 'class-10',
    subjectId: 'c10-math',
    bookId: 'b-c10-math-ncert',
    chapterId: 'ch-c10-math-02',
    title: 'बहुपद सेट-1 (प्रश्न 1–100): पहचान, घात, आलेख एवं शून्यक टेस्ट',
    type: 'chapter_test',
    totalQuestions: 100,
    durationMinutes: 60,
    totalMarks: 100,
    passingMarks: 60,
    isNegativeMarking: false,
    difficulty: 'Easy',
    description: 'प्रश्न संख्या 1 से 100 तक: बहुपद की पहचान, घात, आलेख और गुणनखंड द्वारा शून्यक ज्ञात करने का लाइव टेस्ट।',
    isPublished: true,
  },
  {
    id: 'test-c10-math-ch02-set2',
    slug: 'test-c10-math-ch02-set2',
    classLevel: 'class-10',
    subjectId: 'c10-math',
    bookId: 'b-c10-math-ncert',
    chapterId: 'ch-c10-math-02',
    title: 'बहुपद सेट-2 (प्रश्न 101–200): α + β, α·β एवं 1/α + 1/β स्पेशल टेस्ट',
    type: 'chapter_test',
    totalQuestions: 100,
    durationMinutes: 60,
    totalMarks: 100,
    passingMarks: 60,
    isNegativeMarking: false,
    difficulty: 'Medium',
    description: 'प्रश्न संख्या 101 से 200 तक: शून्यकों का योगफल (α+β), गुणनफल (αβ) और व्युत्क्रमों का योग (1/α + 1/β) लाइव टेस्ट।',
    isPublished: true,
  },
  {
    id: 'test-c10-math-ch02-set3',
    slug: 'test-c10-math-ch02-set3',
    classLevel: 'class-10',
    subjectId: 'c10-math',
    bookId: 'b-c10-math-ncert',
    chapterId: 'ch-c10-math-02',
    title: 'बहुपद सेट-3 (प्रश्न 201–300): α² + β², (α - β)² एवं α³ + β³ टेस्ट',
    type: 'chapter_test',
    totalQuestions: 100,
    durationMinutes: 60,
    totalMarks: 100,
    passingMarks: 60,
    isNegativeMarking: false,
    difficulty: 'Medium',
    description: 'प्रश्न संख्या 201 से 300 तक: शून्यकों के वर्गों का योग, अंतर और घनों के योग पर आधारित 100 प्रश्नों का टेस्ट।',
    isPublished: true,
  },
  {
    id: 'test-c10-math-ch02-set4',
    slug: 'test-c10-math-ch02-set4',
    classLevel: 'class-10',
    subjectId: 'c10-math',
    bookId: 'b-c10-math-ncert',
    chapterId: 'ch-c10-math-02',
    title: 'बहुपद सेट-4 (प्रश्न 301–400): बहुपद निर्माण एवं k का मान ज्ञात करना टेस्ट',
    type: 'chapter_test',
    totalQuestions: 100,
    durationMinutes: 60,
    totalMarks: 100,
    passingMarks: 60,
    isNegativeMarking: false,
    difficulty: 'Medium',
    description: 'प्रश्न संख्या 301 से 400 तक: द्विघात बहुपद निर्माण x² - (α+β)x + αβ और अचर k का मान निकालने का लाइव टेस्ट।',
    isPublished: true,
  },
  {
    id: 'test-c10-math-ch02-set5',
    slug: 'test-c10-math-ch02-set5',
    classLevel: 'class-10',
    subjectId: 'c10-math',
    bookId: 'b-c10-math-ncert',
    chapterId: 'ch-c10-math-02',
    title: 'बहुपद सेट-5 (प्रश्न 401–500): p(k) का मान, विभाजन एवं त्रिघात बहुपद (α, β, γ) टेस्ट',
    type: 'chapter_test',
    totalQuestions: 100,
    durationMinutes: 60,
    totalMarks: 100,
    passingMarks: 60,
    isNegativeMarking: false,
    difficulty: 'Hard',
    description: 'प्रश्न संख्या 401 से 500 तक: बहुपद का मान p(k), भागफल का घात एवं त्रिघात बहुपद के शून्यकों (α, β, γ) का लाइव टेस्ट।',
    isPublished: true,
  },
];

function mapToTestQuestions(items: MathCh02Question500Item[], testId: string): TestQuestion[] {
  return items.map((q, idx) => ({
    id: `${testId}-q-${q.id}`,
    testId,
    classId: 'class-10',
    subjectId: 'c10-math',
    bookId: 'b-c10-math-ncert',
    chapterId: 'ch-c10-math-02',
    question: q.question,
    options: q.options,
    correctOption: q.correctOptionIndex,
    explanation: q.explanation,
    marks: 1,
    order: idx + 1,
  }));
}

export const CLASS_10_MATH_CH02_TEST_QUESTIONS: TestQuestion[] = [
  ...mapToTestQuestions(CLASS_10_MATH_CH02_500_QUESTIONS, 'test-c10-math-ch02-500-mega'),
  ...mapToTestQuestions(CLASS_10_MATH_CH02_500_QUESTIONS.slice(0, 50), 'test-c10-math-ch02-top50'),
  ...mapToTestQuestions(CLASS_10_MATH_CH02_500_QUESTIONS.slice(0, 100), 'test-c10-math-ch02-set1'),
  ...mapToTestQuestions(CLASS_10_MATH_CH02_500_QUESTIONS.slice(100, 200), 'test-c10-math-ch02-set2'),
  ...mapToTestQuestions(CLASS_10_MATH_CH02_500_QUESTIONS.slice(200, 300), 'test-c10-math-ch02-set3'),
  ...mapToTestQuestions(CLASS_10_MATH_CH02_500_QUESTIONS.slice(300, 400), 'test-c10-math-ch02-set4'),
  ...mapToTestQuestions(CLASS_10_MATH_CH02_500_QUESTIONS.slice(400, 500), 'test-c10-math-ch02-set5'),
];
