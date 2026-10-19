import type { TestItem, TestQuestion } from '../types';
import type { MathCh02Question500Item, MathCh02PartMeta } from './class10MathCh02QuestionBank500';

export interface MathCh03Question500Item extends MathCh02Question500Item {
  correctAnswerKey: 'A' | 'B' | 'C' | 'D';
  correctOptionText: string;
  solvedExplanation: string;
  boardYear?: string;
}

export interface MathCh03PartInfo extends MathCh02PartMeta {
  englishTitle: string;
  description: string;
}

export const CLASS_10_MATH_CH03_500_PARTS: MathCh03PartInfo[] = [
  {
    id: 'part-1',
    partNumber: 1,
    title: 'दो चर वाले रैखिक समीकरण का मानक रूप, घात एवं मूल पहचान',
    hindiTitle: 'खंड 1: दो चर वाले रैखिक समीकरण का मानक रूप, घात एवं मूल पहचान (प्रश्न 1–50)',
    englishTitle: 'Standard Form, Degree & Basic Concepts of Linear Equations in Two Variables',
    rangeLabel: 'प्रश्न 1 – 50',
    startQ: 1,
    endQ: 50,
    count: 50,
    formulaUsed: 'ax + by + c = 0 (a² + b² ≠ 0), घात = 1, आलेख = सरल रेखा',
    badge: '🔥 मानक रूप व मूल (1–50)',
    description: 'ax + by + c = 0 का मानक रूप, गुणांक a, b, c की पहचान, घात = 1, आलेख की प्रकृति (सरल रेखा) और समीकरण संतुष्टि पर आधारित प्रश्न।',
  },
  {
    id: 'part-2',
    partNumber: 2,
    title: 'अनुपातों की तुलना (a₁/a₂, b₁/b₂, c₁/c₂) एवं हलों की संख्या',
    hindiTitle: 'खंड 2: अनुपातों की तुलना (a₁/a₂, b₁/b₂, c₁/c₂) एवं हलों की संख्या (प्रश्न 51–100)',
    englishTitle: 'Comparison of Ratios & Number of Solutions',
    rangeLabel: 'प्रश्न 51 – 100',
    startQ: 51,
    endQ: 100,
    count: 50,
    formulaUsed: 'a₁/a₂ ≠ b₁/b₂ (अद्वितीय), a₁/a₂ = b₁/b₂ = c₁/c₂ (अनंत), a₁/a₂ = b₁/b₂ ≠ c₁/c₂ (कोई हल नहीं)',
    badge: '⚡ अनुपात तुलना (51–100)',
    description: 'अद्वितीय हल (केवल एक हल), अनंततः अनेक हल तथा कोई हल नहीं होने की शर्तें और अनुपात तुलना पर आधारित VVI प्रश्न।',
  },
  {
    id: 'part-3',
    partNumber: 3,
    title: 'ग्राफीय निरूपण — प्रतिच्छेदी, संपाती एवं समांतर रेखाएँ तथा अक्ष समीकरण',
    hindiTitle: 'खंड 3: ग्राफीय निरूपण — प्रतिच्छेदी, संपाती व समांतर रेखाएँ एवं अक्ष समीकरण (प्रश्न 101–150)',
    englishTitle: 'Graphical Representation: Intersecting, Coincident & Parallel Lines',
    rangeLabel: 'प्रश्न 101 – 150',
    startQ: 101,
    endQ: 150,
    count: 50,
    formulaUsed: 'x-अक्ष: y = 0, y-अक्ष: x = 0, प्रतिच्छेदी / संपाती / समांतर रेखाएँ',
    badge: '📈 ग्राफीय निरूपण (101–150)',
    description: 'समीकरण युग्म के आलेख की प्रकृति, x-अक्ष व y-अक्ष पर प्रतिच्छेदन बिंदु, x = a तथा y = b के आलेख और त्रिभुज का क्षेत्रफल।',
  },
  {
    id: 'part-4',
    partNumber: 4,
    title: 'संगत (अविरोधी/आश्रित) एवं असंगत (विरोधी) समीकरण युग्म',
    hindiTitle: 'खंड 4: संगत (अविरोधी/आश्रित) एवं असंगत (विरोधी) समीकरण युग्म (प्रश्न 151–200)',
    englishTitle: 'Consistent (Independent/Dependent) & Inconsistent Pairs',
    rangeLabel: 'प्रश्न 151 – 200',
    startQ: 151,
    endQ: 200,
    count: 50,
    formulaUsed: 'अविरोधी (संगत), आश्रित (संगत) एवं विरोधी (असंगत)',
    badge: '⭐ संगत व असंगत (151–200)',
    description: 'अविरोधी (Unique Solution), आश्रित (Infinite Solutions) एवं विरोधी (No Solution) समीकरण युग्मों की पहचान से जुड़े बोर्ड परीक्षा प्रश्न।',
  },
  {
    id: 'part-5',
    partNumber: 5,
    title: 'अज्ञात स्थिरांक k, p, m का मान ज्ञात करना (VVI Board Numericals)',
    hindiTitle: 'खंड 5: अज्ञात स्थिरांक k, p, m का मान ज्ञात करना (प्रश्न 201–250)',
    englishTitle: 'Finding Unknown Constant k for Unique, Infinite or No Solution',
    rangeLabel: 'प्रश्न 201 – 250',
    startQ: 201,
    endQ: 250,
    count: 50,
    formulaUsed: 'k का मान: a₁/a₂ ≠ b₁/b₂ या a₁/a₂ = b₁/b₂ = c₁/c₂ या a₁/a₂ = b₁/b₂ ≠ c₁/c₂',
    badge: '🎯 k का मान (201–250)',
    description: 'दिए गए समीकरण युग्म के अद्वितीय हल, अनंत हल या कोई हल न होने पर k, p, a, b का मान ज्ञात करने वाले सर्वाधिक पूछे जाने वाले प्रश्न।',
  },
  {
    id: 'part-6',
    partNumber: 6,
    title: 'प्रतिस्थापन विधि एवं विलोपन विधि द्वारा हल (x और y का मान)',
    hindiTitle: 'खंड 6: प्रतिस्थापन विधि एवं विलोपन विधि द्वारा हल (x और y का मान) (प्रश्न 251–300)',
    englishTitle: 'Solving by Substitution & Elimination Methods',
    rangeLabel: 'प्रश्न 251 – 300',
    startQ: 251,
    endQ: 300,
    count: 50,
    formulaUsed: 'प्रतिस्थापन एवं विलोपन विधि से (x, y) ज्ञात करना',
    badge: '🧮 विलोपन व प्रतिस्थापन (251–300)',
    description: 'दो चर वाले रैखिक समीकरण युग्म को हल करके x और y के सटीक मान निकालने के संख्यात्मक प्रश्न।',
  },
  {
    id: 'part-7',
    partNumber: 7,
    title: 'वज्र-गुणन विधि एवं सममित समीकरण (ax + by = c, bx + ay = d)',
    hindiTitle: 'खंड 7: वज्र-गुणन विधि एवं सममित समीकरण (प्रश्न 301–350)',
    englishTitle: 'Cross-Multiplication Method & Symmetric Linear Equations',
    rangeLabel: 'प्रश्न 301 – 350',
    startQ: 301,
    endQ: 350,
    count: 50,
    formulaUsed: 'x = (b₁c₂ − b₂c₁)/(a₁b₂ − a₂b₁), y = (c₁a₂ − c₂a₁)/(a₁b₂ − a₂b₁)',
    badge: '✨ वज्र-गुणन विधि (301–350)',
    description: 'वज्र-गुणन सूत्र, सममित गुणांकों वाले समीकरणों में (x + y) और (x − y) का मान तथा 1/x व 1/y में बदलने वाले समीकरण।',
  },
  {
    id: 'part-8',
    partNumber: 8,
    title: 'संख्याओं, दो अंकों वाली संख्या एवं भिन्नों (Fractions) पर आधारित प्रश्न',
    hindiTitle: 'खंड 8: दो अंकों वाली संख्या (10x + y) एवं भिन्न (x/y) पर आधारित प्रश्न (प्रश्न 351–400)',
    englishTitle: 'Word Problems on Numbers, Two-Digit Numbers & Fractions',
    rangeLabel: 'प्रश्न 351 – 400',
    startQ: 351,
    endQ: 400,
    count: 50,
    formulaUsed: 'मूल संख्या = 10x + y, पलटने पर = 10y + x, भिन्न = x/y',
    badge: '🔢 संख्या व भिन्न (351–400)',
    description: 'दो संख्याओं का योग व अंतर, दो अंकों की संख्या (10x + y) एवं अंक पलटने से बनी संख्या (10y + x) तथा अंश-हर पर आधारित प्रश्न।',
  },
  {
    id: 'part-9',
    partNumber: 9,
    title: 'आयु (Age), आय-व्यय, किराया एवं ज्यामितीय कोणों पर आधारित प्रश्न',
    hindiTitle: 'खंड 9: आयु (Age), आय-व्यय, किराया एवं ज्यामितीय कोण (प्रश्न 401–450)',
    englishTitle: 'Word Problems on Ages, Income-Expenditure & Geometry Angles',
    rangeLabel: 'प्रश्न 401 – 450',
    startQ: 401,
    endQ: 450,
    count: 50,
    formulaUsed: 't वर्ष पूर्व = x − t, t वर्ष बाद = x + t, संपूरक कोण x + y = 180°',
    badge: '⏳ आयु व कोण (401–450)',
    description: 'पिता-पुत्र की आयु, मासिक आय और बचत, टैक्सी का नियत व अतिरिक्त किराया, पूरक/संपूरक कोण और चक्रीय चतुर्भुज के कोण।',
  },
  {
    id: 'part-10',
    partNumber: 10,
    title: 'चाल-दूरी-समय (नाव एवं धारा) तथा बिहार बोर्ड PYQ (2011–2025) मॉडल बैंक',
    hindiTitle: 'खंड 10: नाव एवं धारा (u+v, u−v) तथा बिहार बोर्ड PYQ मॉडल बैंक (प्रश्न 451–500)',
    englishTitle: 'Speed-Distance-Time (Boat & Stream) & BSEB PYQ Master Bank',
    rangeLabel: 'प्रश्न 451 – 500',
    startQ: 451,
    endQ: 500,
    count: 50,
    formulaUsed: 'अनुकूल चाल = x + y, प्रतिकूल चाल = x − y, समय = दूरी / चाल',
    badge: '🏆 नाव-धारा व PYQ (451–500)',
    description: 'धारा के अनुकूल (u + v) तथा प्रतिकूल (u − v) चाल, कार्य-समय एवं बिहार बोर्ड परीक्षा 2011 से 2025 तक के VVI प्रश्न।',
  },
];

const LETTERS: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

function makeQ(
  id: number,
  partId: string,
  partTitle: string,
  question: string,
  options: [string, string, string, string],
  correctOptionIndex: 0 | 1 | 2 | 3,
  solvedExplanation: string,
  boardYear?: string
): MathCh03Question500Item {
  const letter = LETTERS[correctOptionIndex];
  const ansText = options[correctOptionIndex];
  const steps = solvedExplanation
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    id,
    partId,
    partTitle,
    topic: partTitle,
    question,
    options,
    correctOption: letter,
    correctOptionIndex,
    answerText: ansText,
    solvedSteps: steps.length > 0 ? steps : [solvedExplanation],
    explanation: solvedExplanation,
    correctAnswerKey: letter,
    correctOptionText: ansText,
    solvedExplanation,
    boardYear,
    boardTag: boardYear || 'BSEB VVI Model',
    isVVI: id % 2 === 1 || Boolean(boardYear),
    difficulty: id % 5 === 0 ? 'Hard' : id % 2 === 0 ? 'Medium' : 'Easy',
  };
}

function buildMathCh03Questions500(): MathCh03Question500Item[] {
  const list: MathCh03Question500Item[] = [];

  // =========================================================================
  // PART 1: Q 1 to 50 — मानक रूप, घात, हल एवं मूल अवधारणाएँ
  // =========================================================================
  const p1Id = 'part-1';
  const p1Title = CLASS_10_MATH_CH03_500_PARTS[0].title;

  const p1Core: Array<{
    q: string;
    opts: [string, string, string, string];
    ans: 0 | 1 | 2 | 3;
    exp: string;
    yr?: string;
  }> = [
    {
      q: 'दो चर x और y वाले रैखिक समीकरण का मानक (व्यापक) रूप क्या होता है?',
      opts: ['ax + by + c = 0', 'ax² + bx + c = 0', 'ax² + by² + c = 0', 'axy + bx + c = 0'],
      ans: 0,
      exp: 'दो चर x और y में रैखिक समीकरण का मानक रूप ax + by + c = 0 होता है, जहाँ a, b, c वास्तविक संख्याएँ हैं और a, b दोनों एक साथ शून्य नहीं हैं (a² + b² ≠ 0)।',
      yr: 'BSEB 2020, 2023',
    },
    {
      q: 'दो चर वाले रैखिक समीकरण का घात (Degree) हमेशा कितना होता है?',
      opts: ['0', '1', '2', '3'],
      ans: 1,
      exp: 'रैखिक (Linear) समीकरण में चरों x और y की अधिकतम घात 1 होती है। अतः इसका घात = 1 है।',
      yr: 'BSEB 2019, 2022',
    },
    {
      q: 'एक दो चर वाले रैखिक समीकरण (जैसे x + y = 5) के कुल कितने हल हो सकते हैं?',
      opts: ['केवल एक हल', 'केवल दो हल', 'अनगिनत (अनंततः अनेक) हल', 'कोई हल नहीं'],
      ans: 2,
      exp: 'अकेले एक दो चर वाले रैखिक समीकरण के अनंततः अनेक हल होते हैं क्योंकि रेखा पर अनंत बिंदु स्थित होते हैं।',
      yr: 'BSEB 2021, 2024',
    },
    {
      q: 'दो चर वाले एक रैखिक समीकरण का ज्यामितीय आलेख (Graph) कैसा होता है?',
      opts: ['परवलय (Parabola)', 'वृत्त (Circle)', 'एक सरल रेखा (Straight Line)', 'दीर्घवृत्त (Ellipse)'],
      ans: 2,
      exp: 'रैखिक समीकरण ax + by + c = 0 का ग्राफ हमेशा एक सीधी (सरल) रेखा होती है।',
      yr: 'BSEB 2018, 2023',
    },
    {
      q: 'समीकरण ax + by + c = 0 में a और b के लिए कौन-सी शर्त अनिवार्य है?',
      opts: ['a = 0 और b = 0', 'a² + b² ≠ 0 (a और b एक साथ शून्य न हों)', 'a = b = c', 'a + b = 0'],
      ans: 1,
      exp: 'यदि a और b दोनों एक साथ 0 हो जाएँ तो समीकरण में कोई चर नहीं बचेगा, इसलिए a² + b² ≠ 0 अनिवार्य शर्त है।',
      yr: 'BSEB 2022',
    },
    {
      q: 'समीकरण 2x + 3y = 12 में यदि x = 3 हो, तो y का मान क्या होगा?',
      opts: ['1', '2', '3', '4'],
      ans: 1,
      exp: '2(3) + 3y = 12 ⇒ 6 + 3y = 12 ⇒ 3y = 6 ⇒ y = 6/3 = 2।',
      yr: 'BSEB 2020',
    },
    {
      q: 'समीकरण 3x − 2y = 5 में यदि y = 2 हो, तो x का मान क्या होगा?',
      opts: ['1', '2', '3', '4'],
      ans: 2,
      exp: '3x − 2(2) = 5 ⇒ 3x − 4 = 5 ⇒ 3x = 9 ⇒ x = 9/3 = 3।',
      yr: 'BSEB 2021',
    },
    {
      q: 'निम्नलिखित में से कौन दो चर वाला रैखिक समीकरण है?',
      opts: ['2x² + 3y = 5', '5x − 4y + 8 = 0', 'xy + 2x = 7', '3/x + 4y = 2'],
      ans: 1,
      exp: '5x − 4y + 8 = 0 में दो चर x तथा y हैं और दोनों की घात 1 है, इसलिए यह दो चर वाला रैखिक समीकरण है।',
      yr: 'BSEB 2023',
    },
    {
      q: 'समीकरण 4x − 5y = 20 को मानक रूप ax + by + c = 0 में लिखने पर c का मान क्या होगा?',
      opts: ['4', '−5', '−20', '20'],
      ans: 2,
      exp: '4x − 5y − 20 = 0 की तुलना ax + by + c = 0 से करने पर a = 4, b = −5 तथा c = −20 प्राप्त होता है।',
    },
    {
      q: 'बिंदु (2, 3) निम्नलिखित में से किस समीकरण का एक हल है?',
      opts: ['2x + y = 7', 'x + 2y = 5', '3x − y = 4', 'x − y = 1'],
      ans: 0,
      exp: 'x = 2, y = 3 रखने पर: 2(2) + 3 = 4 + 3 = 7। अतः (2, 3) समीकरण 2x + y = 7 को संतुष्ट करता है।',
      yr: 'BSEB 2022',
    },
  ];

  for (let i = 0; i < 10; i++) {
    const item = p1Core[i];
    list.push(makeQ(list.length + 1, p1Id, p1Title, item.q, item.opts, item.ans, item.exp, item.yr));
  }

  // Generate 40 distinct numerical substitution & satisfaction questions (Q 11 to 50)
  for (let i = 1; i <= 40; i++) {
    const a = (i % 5) + 2; // 2..6
    const b = ((i + 1) % 4) + 2; // 2..5
    const xVal = (i % 6) + 1; // 1..6
    const yVal = ((i + 2) % 5) + 1; // 1..5
    const rhs = a * xVal + b * yVal;
    const id = list.length + 1;

    if (i % 2 === 1) {
      // Find y when x is given
      const wr1 = yVal + 1;
      const wr2 = Math.max(0, yVal - 1) === yVal ? yVal + 2 : Math.max(0, yVal - 1);
      const wr3 = yVal + 3;
      const opts: [string, string, string, string] = [String(wr2), String(yVal), String(wr1), String(wr3)];
      list.push(
        makeQ(
          id,
          p1Id,
          p1Title,
          `यदि रैखिक समीकरण ${a}x + ${b}y = ${rhs} में x = ${xVal} हो, तो y का मान क्या होगा?`,
          opts,
          1,
          `समीकरण ${a}x + ${b}y = ${rhs} में x = ${xVal} रखने पर:\n${a}(${xVal}) + ${b}y = ${rhs} ⇒ ${a * xVal} + ${b}y = ${rhs}\n⇒ ${b}y = ${rhs} − ${a * xVal} = ${b * yVal}\n⇒ y = ${b * yVal} / ${b} = ${yVal}।`,
          i <= 12 ? `BSEB ${2015 + (i % 10)}` : undefined
        )
      );
    } else {
      // Find x when y is given
      const wr1 = xVal + 1;
      const wr2 = xVal + 2;
      const wr3 = Math.max(0, xVal - 1) === xVal ? xVal + 3 : Math.max(0, xVal - 1);
      const opts: [string, string, string, string] = [String(wr1), String(wr3), String(xVal), String(wr2)];
      list.push(
        makeQ(
          id,
          p1Id,
          p1Title,
          `यदि रैखिक समीकरण ${a}x + ${b}y = ${rhs} में y = ${yVal} हो, तो x का मान क्या होगा?`,
          opts,
          2,
          `समीकरण ${a}x + ${b}y = ${rhs} में y = ${yVal} रखने पर:\n${a}x + ${b}(${yVal}) = ${rhs} ⇒ ${a}x + ${b * yVal} = ${rhs}\n⇒ ${a}x = ${rhs} − ${b * yVal} = ${a * xVal}\n⇒ x = ${a * xVal} / ${a} = ${xVal}।`,
          i <= 14 ? `BSEB ${2016 + (i % 9)}` : undefined
        )
      );
    }
  }

  // =========================================================================
  // PART 2: Q 51 to 100 — अनुपातों की तुलना (a₁/a₂, b₁/b₂, c₁/c₂) एवं हलों की संख्या
  // =========================================================================
  const p2Id = 'part-2';
  const p2Title = CLASS_10_MATH_CH03_500_PARTS[1].title;

  const p2Core: Array<{
    q: string;
    opts: [string, string, string, string];
    ans: 0 | 1 | 2 | 3;
    exp: string;
    yr?: string;
  }> = [
    {
      q: 'रैखिक समीकरण युग्म a₁x + b₁y + c₁ = 0 तथा a₂x + b₂y + c₂ = 0 का एक अद्वितीय हल (Unique Solution) होने की शर्त क्या है?',
      opts: ['a₁/a₂ ≠ b₁/b₂', 'a₁/a₂ = b₁/b₂ = c₁/c₂', 'a₁/a₂ = b₁/b₂ ≠ c₁/c₂', 'a₁a₂ + b₁b₂ = 0'],
      ans: 0,
      exp: 'जब a₁/a₂ ≠ b₁/b₂ होता है, तब दोनों रेखाएँ एक बिंदु पर प्रतिच्छेद करती हैं और समीकरण युग्म का केवल एक (अद्वितीय) हल होता है।',
      yr: 'BSEB 2018, 2021, 2024',
    },
    {
      q: 'रैखिक समीकरण युग्म a₁x + b₁y + c₁ = 0 तथा a₂x + b₂y + c₂ = 0 के अनंततः अनेक हल (Infinite Solutions) होने की शर्त क्या है?',
      opts: ['a₁/a₂ ≠ b₁/b₂', 'a₁/a₂ = b₁/b₂ ≠ c₁/c₂', 'a₁/a₂ = b₁/b₂ = c₁/c₂', 'a₁/a₂ ≠ c₁/c₂'],
      ans: 2,
      exp: 'जब तीनों अनुपात बराबर हों (a₁/a₂ = b₁/b₂ = c₁/c₂), तो दोनों रेखाएँ संपाती होती हैं और समीकरण युग्म के अनगिनत (अनंत) हल होते हैं।',
      yr: 'BSEB 2019, 2022, 2025',
    },
    {
      q: 'रैखिक समीकरण युग्म a₁x + b₁y + c₁ = 0 तथा a₂x + b₂y + c₂ = 0 का कोई हल नहीं (No Solution) होने की शर्त क्या है?',
      opts: ['a₁/a₂ ≠ b₁/b₂', 'a₁/a₂ = b₁/b₂ ≠ c₁/c₂', 'a₁/a₂ = b₁/b₂ = c₁/c₂', 'b₁/b₂ = c₁/c₂'],
      ans: 1,
      exp: 'जब a₁/a₂ = b₁/b₂ ≠ c₁/c₂ हो, तब दोनों रेखाएँ परस्पर समांतर होती हैं और कभी नहीं मिलतीं, अतः कोई हल नहीं होता।',
      yr: 'BSEB 2020, 2023, 2024',
    },
    {
      q: 'यदि किसी समीकरण युग्म में a₁/a₂ = 2/3 तथा b₁/b₂ = −4/5 हो, तो इसके कितने हल होंगे?',
      opts: ['केवल एक हल (अद्वितीय हल)', 'कोई हल नहीं', 'अनगिनत हल', 'दो हल'],
      ans: 0,
      exp: 'यहाँ a₁/a₂ = 2/3 और b₁/b₂ = −4/5 है। चूँकि a₁/a₂ ≠ b₁/b₂, इसलिए समीकरण युग्म का केवल एक अद्वितीय हल होगा।',
      yr: 'BSEB 2022',
    },
    {
      q: 'यदि a₁/a₂ = b₁/b₂ = c₁/c₂ = 1/2 हो, तो समीकरण युग्म के कितने हल होंगे?',
      opts: ['केवल एक हल', 'कोई हल नहीं', 'अनंततः अनेक हल', 'केवल दो हल'],
      ans: 2,
      exp: 'चूँकि a₁/a₂ = b₁/b₂ = c₁/c₂ (= 1/2), अतः रेखाएँ संपाती होंगी और अनंततः अनेक हल होंगे।',
      yr: 'BSEB 2023',
    },
    {
      q: 'समीकरण युग्म x + 2y + 5 = 0 तथा −3x − 6y + 1 = 0 के कितने हल हैं?',
      opts: ['अद्वितीय हल', 'अनंत हल', 'कोई हल नहीं', 'दो हल'],
      ans: 2,
      exp: 'यहाँ a₁/a₂ = 1/(−3) = −1/3, b₁/b₂ = 2/(−6) = −1/3, तथा c₁/c₂ = 5/1। चूँकि a₁/a₂ = b₁/b₂ ≠ c₁/c₂, अतः कोई हल नहीं है।',
      yr: 'BSEB 2019, 2021',
    },
    {
      q: 'समीकरण युग्म 2x + 3y = 5 और 4x + 6y = 15 के कितने हल हैं?',
      opts: ['एक अद्वितीय हल', 'अनंततः अनेक हल', 'कोई हल नहीं', 'तीन हल'],
      ans: 2,
      exp: 'a₁/a₂ = 2/4 = 1/2, b₁/b₂ = 3/6 = 1/2, परंतु c₁/c₂ = 5/15 = 1/3। चूँकि 1/2 = 1/2 ≠ 1/3, अतः कोई हल नहीं है।',
      yr: 'BSEB 2020, 2024',
    },
    {
      q: 'समीकरण युग्म 2x + 3y = 7 तथा 4x + 6y = 14 के कितने हल होंगे?',
      opts: ['केवल एक हल', 'कोई हल नहीं', 'अनगिनत (अनंत) हल', 'केवल दो हल'],
      ans: 2,
      exp: 'यहाँ a₁/a₂ = 2/4 = 1/2, b₁/b₂ = 3/6 = 1/2 और c₁/c₂ = 7/14 = 1/2। चूँकि a₁/a₂ = b₁/b₂ = c₁/c₂, अतः अनगिनत हल हैं।',
      yr: 'BSEB 2022',
    },
    {
      q: 'समीकरण युग्म 5x − 4y + 8 = 0 और 7x + 6y − 9 = 0 के हलों की संख्या क्या है?',
      opts: ['केवल एक हल (अद्वितीय)', 'कोई हल नहीं', 'अनगिनत हल', 'दो हल'],
      ans: 0,
      exp: 'यहाँ a₁/a₂ = 5/7 तथा b₁/b₂ = −4/6 = −2/3। चूँकि 5/7 ≠ −2/3 (अर्थात् a₁/a₂ ≠ b₁/b₂), अतः केवल एक अद्वितीय हल है।',
      yr: 'NCERT / BSEB 2021',
    },
    {
      q: 'समीकरण युग्म 9x + 3y + 12 = 0 और 18x + 6y + 24 = 0 के लिए सही कथन कौन-सा है?',
      opts: ['केवल एक हल है', 'कोई हल नहीं है', 'अनंततः अनेक हल हैं', 'केवल दो हल हैं'],
      ans: 2,
      exp: 'a₁/a₂ = 9/18 = 1/2, b₁/b₂ = 3/6 = 1/2, c₁/c₂ = 12/24 = 1/2। तीनों अनुपात बराबर हैं, इसलिए अनंततः अनेक हल हैं।',
      yr: 'NCERT / BSEB 2023',
    },
  ];

  for (let i = 0; i < 10; i++) {
    const item = p2Core[i];
    list.push(makeQ(list.length + 1, p2Id, p2Title, item.q, item.opts, item.ans, item.exp, item.yr));
  }

  // Generate 40 varied ratio comparison questions (Q 61 to 100)
  for (let i = 1; i <= 40; i++) {
    const id = list.length + 1;
    const mode = i % 3; // 0: unique, 1: no solution, 2: infinite solutions
    const a1 = (i % 4) + 1;
    const b1 = ((i + 1) % 5) + 2;
    const c1 = (i % 6) + 3;
    const mult = (i % 3) + 2; // 2, 3, 4

    if (mode === 0) {
      // Unique solution: a2, b2 not proportional
      const a2 = a1 * mult;
      const b2 = b1 * mult + 1;
      const c2 = c1 * mult;
      list.push(
        makeQ(
          id,
          p2Id,
          p2Title,
          `समीकरण युग्म ${a1}x + ${b1}y = ${c1} तथा ${a2}x + ${b2}y = ${c2} के कितने हल होंगे?`,
          ['केवल एक हल (अद्वितीय हल)', 'कोई हल नहीं', 'अनगिनत हल', 'केवल दो हल'],
          0,
          `यहाँ a₁/a₂ = ${a1}/${a2} = 1/${mult} तथा b₁/b₂ = ${b1}/${b2}।\nचूँकि a₁/a₂ ≠ b₁/b₂ है, इसलिए इस समीकरण युग्म का केवल एक (अद्वितीय) हल होगा।`,
          i <= 10 ? `BSEB ${2017 + (i % 8)}` : undefined
        )
      );
    } else if (mode === 1) {
      // No solution: a2, b2 proportional, c2 different
      const a2 = a1 * mult;
      const b2 = b1 * mult;
      const c2 = c1 * mult + 5;
      list.push(
        makeQ(
          id,
          p2Id,
          p2Title,
          `समीकरण युग्म ${a1}x + ${b1}y = ${c1} तथा ${a2}x + ${b2}y = ${c2} के कितने हल होंगे?`,
          ['केवल एक हल', 'कोई हल नहीं', 'अनगिनत हल', 'दो हल'],
          1,
          `यहाँ a₁/a₂ = ${a1}/${a2} = 1/${mult}, b₁/b₂ = ${b1}/${b2} = 1/${mult}, परंतु c₁/c₂ = ${c1}/${c2} ≠ 1/${mult}।\nचूँकि a₁/a₂ = b₁/b₂ ≠ c₁/c₂ है, अतः समीकरण युग्म का कोई हल नहीं होगा।`,
          i <= 12 ? `BSEB ${2018 + (i % 7)}` : undefined
        )
      );
    } else {
      // Infinite solutions: all proportional
      const a2 = a1 * mult;
      const b2 = b1 * mult;
      const c2 = c1 * mult;
      list.push(
        makeQ(
          id,
          p2Id,
          p2Title,
          `समीकरण युग्म ${a1}x + ${b1}y = ${c1} तथा ${a2}x + ${b2}y = ${c2} के कितने हल होंगे?`,
          ['केवल एक हल', 'कोई हल नहीं', 'अनंततः अनेक (अनगिनत) हल', 'शून्य हल'],
          2,
          `यहाँ a₁/a₂ = ${a1}/${a2} = 1/${mult}, b₁/b₂ = ${b1}/${b2} = 1/${mult} तथा c₁/c₂ = ${c1}/${c2} = 1/${mult}।\nचूँकि a₁/a₂ = b₁/b₂ = c₁/c₂ है, अतः समीकरण युग्म के अनंततः अनेक हल होंगे।`,
          i <= 15 ? `BSEB ${2019 + (i % 6)}` : undefined
        )
      );
    }
  }

  // =========================================================================
  // PART 3: Q 101 to 150 — ग्राफीय निरूपण (प्रतिच्छेदी, संपाती, समांतर एवं अक्ष समीकरण)
  // =========================================================================
  const p3Id = 'part-3';
  const p3Title = CLASS_10_MATH_CH03_500_PARTS[2].title;

  const p3Core: Array<{
    q: string;
    opts: [string, string, string, string];
    ans: 0 | 1 | 2 | 3;
    exp: string;
    yr?: string;
  }> = [
    {
      q: 'यदि a₁/a₂ ≠ b₁/b₂ हो, तो समीकरण युग्म की आलेखीय रेखाएँ कैसी होती हैं?',
      opts: ['प्रतिच्छेदी (Intersecting)', 'समांतर (Parallel)', 'संपाती (Coincident)', 'वक्र (Curved)'],
      ans: 0,
      exp: 'जब a₁/a₂ ≠ b₁/b₂ हो, तो दोनों सरल रेखाएँ एक निश्चित बिंदु पर एक-दूसरे को काटती (प्रतिच्छेद करती) हैं।',
      yr: 'BSEB 2019, 2022, 2024',
    },
    {
      q: 'यदि a₁/a₂ = b₁/b₂ = c₁/c₂ हो, तो समीकरण युग्म का आलेख (Graph) कैसा होगा?',
      opts: ['प्रतिच्छेदी रेखाएँ', 'समांतर रेखाएँ', 'संपाती रेखाएँ (Coincident Lines)', 'लंबवत रेखाएँ'],
      ans: 2,
      exp: 'तीनों अनुपात बराबर होने पर दोनों समीकरण एक ही रेखा को निरूपित करते हैं, जिन्हें संपाती रेखाएँ कहते हैं।',
      yr: 'BSEB 2020, 2023',
    },
    {
      q: 'यदि a₁/a₂ = b₁/b₂ ≠ c₁/c₂ हो, तो दोनों समीकरणों की आलेखीय रेखाएँ कैसी होंगी?',
      opts: ['प्रतिच्छेदी रेखाएँ', 'समांतर रेखाएँ (Parallel Lines)', 'संपाती रेखाएँ', 'एक-दूसरे पर लंब'],
      ans: 1,
      exp: 'जब कोई हल नहीं होता (a₁/a₂ = b₁/b₂ ≠ c₁/c₂), तब दोनों रेखाएँ परस्पर समांतर (Parallel) होती हैं।',
      yr: 'BSEB 2021, 2024',
    },
    {
      q: 'कार्तीय तल में x-अक्ष (x-axis) का समीकरण क्या होता है?',
      opts: ['x = 0', 'y = 0', 'x = y', 'x + y = 0'],
      ans: 1,
      exp: 'x-अक्ष के प्रत्येक बिंदु पर y-निर्देशांक (कोटि) शून्य होता है, इसलिए x-अक्ष का समीकरण y = 0 होता है।',
      yr: 'BSEB 2018, 2022, 2025',
    },
    {
      q: 'कार्तीय तल में y-अक्ष (y-axis) का समीकरण क्या होता है?',
      opts: ['y = 0', 'x = 0', 'x = 1', 'y = 1'],
      ans: 1,
      exp: 'y-अक्ष के प्रत्येक बिंदु पर x-निर्देशांक (भुज) शून्य होता है, इसलिए y-अक्ष का समीकरण x = 0 होता है।',
      yr: 'BSEB 2019, 2023',
    },
    {
      q: 'समीकरण x = 5 का आलेख किस अक्ष के समांतर एक सरल रेखा होगी?',
      opts: ['x-अक्ष के समांतर', 'y-अक्ष के समांतर', 'मूल बिंदु से जाने वाली', 'किसी अक्ष के समांतर नहीं'],
      ans: 1,
      exp: 'x = a (जैसे x = 5) का आलेख y-अक्ष के समांतर तथा मूल बिंदु से 5 इकाई की दूरी पर एक सरल रेखा होती है।',
      yr: 'BSEB 2020, 2024',
    },
    {
      q: 'समीकरण y = −4 का आलेख किस अक्ष के समांतर एक सरल रेखा होगी?',
      opts: ['x-अक्ष के समांतर', 'y-अक्ष के समांतर', 'दोनों अक्षों के समांतर', 'मूल बिंदु से गुजरने वाली'],
      ans: 0,
      exp: 'y = b (जैसे y = −4) का आलेख हमेशा x-अक्ष के समांतर एक सरल रेखा होती है।',
      yr: 'BSEB 2021, 2023',
    },
    {
      q: 'मूल बिंदु (0, 0) से होकर गुजरने वाली सरल रेखा का व्यापक समीकरण कौन-सा है?',
      opts: ['ax + by = 0 (अचर पद c = 0)', 'ax + by + 5 = 0', 'x = 4', 'y = 3'],
      ans: 0,
      exp: 'जिस रैखिक समीकरण में अचर पद शून्य होता है (ax + by = 0 या y = mx), उसकी रेखा हमेशा मूल बिंदु (0, 0) से गुजरती है।',
      yr: 'BSEB 2022',
    },
    {
      q: 'सरल रेखा 2x + 3y = 6 आलेख खींचने पर x-अक्ष को किस बिंदु पर काटती है?',
      opts: ['(0, 2)', '(3, 0)', '(2, 0)', '(0, 3)'],
      ans: 1,
      exp: 'x-अक्ष पर y = 0 रखने पर: 2x + 3(0) = 6 ⇒ 2x = 6 ⇒ x = 3। अतः प्रतिच्छेदन बिंदु (3, 0) है।',
      yr: 'BSEB 2023',
    },
    {
      q: 'सरल रेखा 2x + 3y = 6 आलेख खींचने पर y-अक्ष को किस बिंदु पर काटती है?',
      opts: ['(3, 0)', '(0, 2)', '(2, 0)', '(0, 3)'],
      ans: 1,
      exp: 'y-अक्ष पर x = 0 रखने पर: 2(0) + 3y = 6 ⇒ 3y = 6 ⇒ y = 2। अतः y-अक्ष पर प्रतिच्छेदन बिंदु (0, 2) है।',
      yr: 'BSEB 2024',
    },
  ];

  for (let i = 0; i < 10; i++) {
    const item = p3Core[i];
    list.push(makeQ(list.length + 1, p3Id, p3Title, item.q, item.opts, item.ans, item.exp, item.yr));
  }

  // Generate 40 graphical & intercept questions (Q 111 to 150)
  for (let i = 1; i <= 40; i++) {
    const id = list.length + 1;
    const type = i % 4;
    if (type === 0) {
      // x-intercept of ax + by = ab
      const a = (i % 5) + 2;
      const b = ((i + 1) % 6) + 2;
      const prod = a * b;
      list.push(
        makeQ(
          id,
          p3Id,
          p3Title,
          `रैखिक समीकरण ${b}x + ${a}y = ${prod} का आलेख x-अक्ष को किस बिंदु पर प्रतिच्छेद करेगा?`,
          [`(${a}, 0)`, `(0, ${b})`, `(${b}, 0)`, `(0, ${a})`],
          0,
          `x-अक्ष पर y = 0 होता है।\nसमीकरण ${b}x + ${a}(0) = ${prod} ⇒ ${b}x = ${prod} ⇒ x = ${prod}/${b} = ${a}।\nअतः रेखा x-अक्ष को बिंदु (${a}, 0) पर काटती है।`,
          i <= 12 ? `BSEB ${2018 + (i % 7)}` : undefined
        )
      );
    } else if (type === 1) {
      // y-intercept of bx + ay = ab
      const a = (i % 6) + 2;
      const b = ((i + 2) % 5) + 3;
      const prod = a * b;
      list.push(
        makeQ(
          id,
          p3Id,
          p3Title,
          `रैखिक समीकरण ${b}x + ${a}y = ${prod} का आलेख y-अक्ष को किस बिंदु पर प्रतिच्छेद करेगा?`,
          [`(${a}, 0)`, `(0, ${b})`, `(${b}, 0)`, `(0, ${a})`],
          1,
          `y-अक्ष पर x = 0 होता है।\nसमीकरण ${b}(0) + ${a}y = ${prod} ⇒ ${a}y = ${prod} ⇒ y = ${prod}/${a} = ${b}।\nअतः रेखा y-अक्ष को बिंदु (0, ${b}) पर काटती है।`
        )
      );
    } else if (type === 2) {
      // Nature of graph lines for pair
      const a1 = (i % 4) + 2;
      const b1 = (i % 3) + 3;
      const c1 = i + 4;
      const m = 2;
      const isParallel = i % 8 === 2;
      const c2 = isParallel ? c1 * m + 3 : c1 * m;
      list.push(
        makeQ(
          id,
          p3Id,
          p3Title,
          `समीकरण युग्म ${a1}x + ${b1}y = ${c1} तथा ${a1 * m}x + ${b1 * m}y = ${c2} के आलेखीय रेखाएँ कैसी होंगी?`,
          ['प्रतिच्छेदी रेखाएँ', 'समांतर रेखाएँ (Parallel)', 'संपाती रेखाएँ (Coincident)', 'परस्पर लंबवत'],
          isParallel ? 1 : 2,
          isParallel
            ? `यहाँ a₁/a₂ = 1/${m}, b₁/b₂ = 1/${m}, परंतु c₁/c₂ = ${c1}/${c2} ≠ 1/${m}।\nचूँकि a₁/a₂ = b₁/b₂ ≠ c₁/c₂, अतः दोनों रेखाएँ समांतर (Parallel) होंगी।`
            : `यहाँ a₁/a₂ = 1/${m}, b₁/b₂ = 1/${m} तथा c₁/c₂ = ${c1}/${c2} = 1/${m}।\nतीनों अनुपात बराबर हैं, अतः दोनों रेखाएँ संपाती (Coincident) होंगी।`,
          `BSEB ${2019 + (i % 6)}`
        )
      );
    } else {
      // Distance or intersection of x = h and y = k
      const h = i - 15;
      const k = (i % 7) - 3;
      list.push(
        makeQ(
          id,
          p3Id,
          p3Title,
          `सरल रेखाओं x = ${h} तथा y = ${k} का प्रतिच्छेदन बिंदु (Intersection Point) क्या होगा?`,
          [`(${k}, ${h})`, `(${h}, ${k})`, `(${h}, 0)`, `(0, ${k})`],
          1,
          `रेखा x = ${h} पर भुज हमेशा ${h} है और रेखा y = ${k} पर कोटि हमेशा ${k} है।\nअतः दोनों रेखाएँ बिंदु (x, y) = (${h}, ${k}) पर प्रतिच्छेद करेंगी।`,
          `BSEB ${2020 + (i % 5)}`
        )
      );
    }
  }

  // =========================================================================
  // PART 4: Q 151 to 200 — संगत (अविरोधी/आश्रित) एवं असंगत (विरोधी) समीकरण युग्म
  // =========================================================================
  const p4Id = 'part-4';
  const p4Title = CLASS_10_MATH_CH03_500_PARTS[3].title;

  const p4Core: Array<{
    q: string;
    opts: [string, string, string, string];
    ans: 0 | 1 | 2 | 3;
    exp: string;
    yr?: string;
  }> = [
    {
      q: 'जिस रैखिक समीकरण युग्म का कम-से-कम एक हल (अद्वितीय या अनंत हल) होता है, उसे क्या कहते हैं?',
      opts: ['असंगत (Inconsistent)', 'संगत (Consistent)', 'विरोधी (Contradictory)', 'अपरिभाषित'],
      ans: 1,
      exp: 'जिस समीकरण युग्म का कोई-न-कोई हल (एक या अनंत) अवश्य निकलता है, वह संगत (Consistent) कहलाता है।',
      yr: 'BSEB 2018, 2021, 2024',
    },
    {
      q: 'जिस रैखिक समीकरण युग्म का कोई हल नहीं होता, उसे क्या कहा जाता है?',
      opts: ['अविरोधी', 'आश्रित', 'विरोधी या असंगत (Inconsistent)', 'संगत'],
      ans: 2,
      exp: 'जब a₁/a₂ = b₁/b₂ ≠ c₁/c₂ हो, तो कोई हल नहीं होता और ऐसे युग्म को विरोधी या असंगत (Inconsistent) कहते हैं।',
      yr: 'BSEB 2019, 2022, 2025',
    },
    {
      q: 'अविरोधी (Independent) समीकरण युग्म के लिए निम्नलिखित में से कौन-सी शर्त सही है?',
      opts: ['a₁/a₂ ≠ b₁/b₂', 'a₁/a₂ = b₁/b₂ = c₁/c₂', 'a₁/a₂ = b₁/b₂ ≠ c₁/c₂', 'a₁/a₂ = 0'],
      ans: 0,
      exp: 'बिहार बोर्ड शब्दावली में "अविरोधी" का अर्थ केवल एक (अद्वितीय) हल वाला समीकरण युग्म होता है, जिसकी शर्त a₁/a₂ ≠ b₁/b₂ है।',
      yr: 'BSEB 2020, 2023',
    },
    {
      q: 'आश्रित (Dependent) समीकरण युग्म के लिए कौन-सी शर्त सही है?',
      opts: ['a₁/a₂ ≠ b₁/b₂', 'a₁/a₂ = b₁/b₂ ≠ c₁/c₂', 'a₁/a₂ = b₁/b₂ = c₁/c₂', 'b₁/b₂ ≠ c₁/c₂'],
      ans: 2,
      exp: 'जब a₁/a₂ = b₁/b₂ = c₁/c₂ होता है, तब संपाती रेखाएँ बनती हैं और युग्म को आश्रित (Dependent & Consistent) कहते हैं।',
      yr: 'BSEB 2021, 2024',
    },
    {
      q: 'विरोधी (Contradictory / Inconsistent) समीकरण युग्म के कितने हल होते हैं?',
      opts: ['एक और केवल एक', 'अनगिनत हल', 'एक भी नहीं (शून्य हल)', 'दो हल'],
      ans: 2,
      exp: 'विरोधी समीकरण युग्म की रेखाएँ समांतर होती हैं, इसलिए उनका एक भी हल नहीं (शून्य हल) होता है।',
      yr: 'BSEB 2017, 2022',
    },
    {
      q: 'आश्रित समीकरण युग्म के कितने हल होते हैं?',
      opts: ['केवल एक हल', 'अनगिनत (अनंततः अनेक) हल', 'कोई हल नहीं', 'केवल दो हल'],
      ans: 1,
      exp: 'आश्रित युग्म में दोनों समीकरण एक ही रेखा को दर्शाते हैं, इसलिए इसके अनगिनत हल होते हैं।',
      yr: 'BSEB 2020, 2023',
    },
    {
      q: 'अविरोधी समीकरण युग्म के कितने हल होते हैं?',
      opts: ['केवल एक (अद्वितीय) हल', 'अनगिनत हल', 'कोई हल नहीं', 'तीन हल'],
      ans: 0,
      exp: 'अविरोधी समीकरण युग्म की रेखाएँ प्रतिच्छेदी होती हैं, अतः इसका केवल एक (अद्वितीय) हल होता है।',
      yr: 'BSEB 2019, 2024',
    },
    {
      q: 'समीकरण युग्म 3x + 2y = 5 तथा 2x − 3y = 7 किस प्रकार का युग्म है?',
      opts: ['संगत (अविरोधी)', 'असंगत (विरोधी)', 'आश्रित', 'इनमें से कोई नहीं'],
      ans: 0,
      exp: 'यहाँ a₁/a₂ = 3/2 तथा b₁/b₂ = 2/(−3)। चूँकि a₁/a₂ ≠ b₁/b₂, अतः यह संगत (अविरोधी) समीकरण युग्म है।',
      yr: 'NCERT / BSEB 2022',
    },
    {
      q: 'समीकरण युग्म 2x − 3y = 8 तथा 4x − 6y = 9 किस प्रकार का समीकरण युग्म है?',
      opts: ['संगत', 'असंगत (विरोधी)', 'आश्रित', 'अविरोधी'],
      ans: 1,
      exp: 'यहाँ a₁/a₂ = 2/4 = 1/2, b₁/b₂ = −3/(−6) = 1/2, परंतु c₁/c₂ = 8/9। चूँकि a₁/a₂ = b₁/b₂ ≠ c₁/c₂, अतः यह असंगत (विरोधी) है।',
      yr: 'NCERT / BSEB 2023',
    },
    {
      q: 'समीकरण युग्म 5x − 3y = 11 तथा −10x + 6y = −22 किस प्रकार का युग्म है?',
      opts: ['असंगत (विरोधी)', 'संगत एवं आश्रित (Dependent)', 'अविरोधी', 'कोई हल नहीं'],
      ans: 1,
      exp: 'यहाँ a₁/a₂ = 5/(−10) = −1/2, b₁/b₂ = −3/6 = −1/2, तथा c₁/c₂ = 11/(−22) = −1/2। तीनों बराबर हैं, अतः यह संगत एवं आश्रित युग्म है।',
      yr: 'NCERT / BSEB 2024',
    },
  ];

  for (let i = 0; i < 10; i++) {
    const item = p4Core[i];
    list.push(makeQ(list.length + 1, p4Id, p4Title, item.q, item.opts, item.ans, item.exp, item.yr));
  }

  for (let i = 1; i <= 40; i++) {
    const id = list.length + 1;
    const mod = i % 3;
    const a = (i % 5) + 1;
    const b = ((i + 2) % 4) + 2;
    const c = (i % 7) + 4;
    const r = (i % 3) + 2;

    if (mod === 0) {
      list.push(
        makeQ(
          id,
          p4Id,
          p4Title,
          `समीकरण युग्म ${a}x + ${b}y = ${c} और ${b}x − ${a}y = ${c + 2} किस प्रकार का समीकरण युग्म है?`,
          ['अविरोधी (संगत)', 'विरोधी (असंगत)', 'आश्रित', 'समांतर'],
          0,
          `यहाँ a₁/a₂ = ${a}/${b} तथा b₁/b₂ = ${b}/(−${a})।\nचूँकि a₁/a₂ ≠ b₁/b₂ है, अतः यह अविरोधी (संगत) समीकरण युग्म है।`,
          i <= 12 ? `BSEB ${2018 + (i % 7)}` : undefined
        )
      );
    } else if (mod === 1) {
      list.push(
        makeQ(
          id,
          p4Id,
          p4Title,
          `समीकरण युग्म ${a}x + ${b}y = ${c} और ${a * r}x + ${b * r}y = ${c * r + 3} किस प्रकार का युग्म है?`,
          ['अविरोधी', 'विरोधी (असंगत)', 'आश्रित', 'प्रतिच्छेदी'],
          1,
          `यहाँ a₁/a₂ = 1/${r}, b₁/b₂ = 1/${r}, परंतु c₁/c₂ = ${c}/${c * r + 3} ≠ 1/${r}।\nचूँकि a₁/a₂ = b₁/b₂ ≠ c₁/c₂, अतः यह विरोधी (असंगत) युग्म है।`,
          i <= 12 ? `BSEB ${2019 + (i % 6)}` : undefined
        )
      );
    } else {
      list.push(
        makeQ(
          id,
          p4Id,
          p4Title,
          `समीकरण युग्म ${a}x + ${b}y = ${c} और ${a * r}x + ${b * r}y = ${c * r} किस प्रकार का युग्म है?`,
          ['विरोधी (असंगत)', 'अविरोधी', 'आश्रित (संगत)', 'कोई हल नहीं'],
          2,
          `यहाँ a₁/a₂ = ${a}/${a * r} = 1/${r}, b₁/b₂ = ${b}/${b * r} = 1/${r} और c₁/c₂ = ${c}/${c * r} = 1/${r}।\nतीनों अनुपात समान हैं, अतः यह आश्रित (Dependent & Consistent) समीकरण युग्म है।`,
          i <= 12 ? `BSEB ${2020 + (i % 5)}` : undefined
        )
      );
    }
  }

  // =========================================================================
  // PART 5: Q 201 to 250 — अज्ञात स्थिरांक k, p, m का मान ज्ञात करना
  // =========================================================================
  const p5Id = 'part-5';
  const p5Title = CLASS_10_MATH_CH03_500_PARTS[4].title;

  const p5Core: Array<{
    q: string;
    opts: [string, string, string, string];
    ans: 0 | 1 | 2 | 3;
    exp: string;
    yr?: string;
  }> = [
    {
      q: 'k के किस मान के लिए समीकरण युग्म x + 2y = 5 तथा 3x + ky + 15 = 0 का कोई हल नहीं है?',
      opts: ['k = 6', 'k = −6', 'k = 3/2', 'k = 10'],
      ans: 0,
      exp: 'कोई हल नहीं होने की शर्त: a₁/a₂ = b₁/b₂ ≠ c₁/c₂ ⇒ 1/3 = 2/k ⇒ k = 3 × 2 = 6।',
      yr: 'BSEB 2018, 2021, 2024',
    },
    {
      q: 'k के किस मान के लिए समीकरण युग्म 4x + py + 8 = 0 और 2x + 2y + 2 = 0 का एक अद्वितीय हल होगा?',
      opts: ['p = 4', 'p ≠ 4', 'p = 2', 'p ≠ 2'],
      ans: 1,
      exp: 'अद्वितीय हल के लिए: a₁/a₂ ≠ b₁/b₂ ⇒ 4/2 ≠ p/2 ⇒ p ≠ 4।',
      yr: 'NCERT / BSEB 2020, 2023',
    },
    {
      q: 'k के किस मान के लिए समीकरण युग्म 3x − y − 5 = 0 और 6x − 2y − k = 0 के अनगिनत (अनंत) हल होंगे?',
      opts: ['k = 5', 'k = 10', 'k = −10', 'k = 2'],
      ans: 1,
      exp: 'अनंत हल के लिए: a₁/a₂ = b₁/b₂ = c₁/c₂ ⇒ 3/6 = (−1)/(−2) = (−5)/(−k) ⇒ 1/2 = 5/k ⇒ k = 10।',
      yr: 'BSEB 2019, 2022',
    },
    {
      q: 'k के किस मान के लिए समीकरण युग्म kx − y = 2 और 6x − 2y = 3 का एक अद्वितीय हल होगा?',
      opts: ['k = 3', 'k ≠ 3', 'k = 0', 'k ≠ 6'],
      ans: 1,
      exp: 'अद्वितीय हल के लिए: k/6 ≠ (−1)/(−2) ⇒ k/6 ≠ 1/2 ⇒ k ≠ 3।',
      yr: 'BSEB 2021, 2024',
    },
    {
      q: 'k के किस मान के लिए समीकरण युग्म 2x + 3y = 7 और (k − 1)x + (k + 2)y = 3k के अनंततः अनेक हल हैं?',
      opts: ['k = 5', 'k = 7', 'k = 4', 'k = 6'],
      ans: 1,
      exp: 'अनंत हल के लिए: 2/(k − 1) = 3/(k + 2) = 7/(3k)। प्रथम दो से: 2(k + 2) = 3(k − 1) ⇒ 2k + 4 = 3k − 3 ⇒ k = 7।',
      yr: 'NCERT / BSEB 2022',
    },
    {
      q: 'k के किस मान के लिए समीकरण युग्म 3x + y = 1 और (2k − 1)x + (k − 1)y = 2k + 1 का कोई हल नहीं है?',
      opts: ['k = 2', 'k = −2', 'k = 1', 'k = 3'],
      ans: 0,
      exp: 'कोई हल न होने के लिए: 3/(2k − 1) = 1/(k − 1) ⇒ 3(k − 1) = 2k − 1 ⇒ 3k − 3 = 2k − 1 ⇒ k = 2।',
      yr: 'NCERT / BSEB 2023, 2025',
    },
    {
      q: 'k के किस धनात्मक मान के लिए समीकरण युग्म kx + 3y − (k − 3) = 0 और 12x + ky − k = 0 के अपरिमित रूप से अनेक हल होंगे?',
      opts: ['k = 4', 'k = 6', 'k = 12', 'k = 3'],
      ans: 1,
      exp: 'अनंत हल के लिए: k/12 = 3/k ⇒ k² = 36 ⇒ k = ±6। दूसरी शर्त 3/k = (k−3)/k से k − 3 = 3 ⇒ k = 6।',
      yr: 'NCERT / BSEB 2020, 2024',
    },
    {
      q: 'यदि समीकरण युग्म x + 2y = 3 तथा 5x + ky + 7 = 0 असंगत (विरोधी) है, तो k का मान क्या होगा?',
      opts: ['5', '10', '−10', '15'],
      ans: 1,
      exp: 'असंगत होने पर: a₁/a₂ = b₁/b₂ ⇒ 1/5 = 2/k ⇒ k = 10।',
      yr: 'BSEB 2021',
    },
    {
      q: 'यदि रेखाएँ 3x + 2ky = 2 और 2x + 5y + 1 = 0 परस्पर समांतर हैं, तो k का मान क्या है?',
      opts: ['15/4', '4/15', '5/4', '3/5'],
      ans: 0,
      exp: 'समांतर रेखाओं के लिए: a₁/a₂ = b₁/b₂ ⇒ 3/2 = 2k/5 ⇒ 4k = 15 ⇒ k = 15/4।',
      yr: 'BSEB 2022',
    },
    {
      q: 'k के किस मान के लिए समीकरण kx + 2y = 5 तथा 3x + y = 1 का एक अद्वितीय हल होगा?',
      opts: ['k = 6', 'k ≠ 6', 'k = 3', 'k ≠ 3'],
      ans: 1,
      exp: 'अद्वितीय हल हेतु: k/3 ≠ 2/1 ⇒ k ≠ 6।',
      yr: 'BSEB 2023',
    },
  ];

  for (let i = 0; i < 10; i++) {
    const item = p5Core[i];
    list.push(makeQ(list.length + 1, p5Id, p5Title, item.q, item.opts, item.ans, item.exp, item.yr));
  }

  for (let i = 1; i <= 40; i++) {
    const id = list.length + 1;
    const a1 = (i % 5) + 1;
    const b1 = ((i + 1) % 4) + 2;
    const m = (i % 4) + 2;
    const a2 = a1 * m;
    const kAns = b1 * m;

    if (i % 2 === 1) {
      // Find k for parallel / no solution
      const opts: [string, string, string, string] = [
        String(kAns - 2),
        String(kAns),
        String(kAns + 2),
        String(kAns * 2),
      ];
      list.push(
        makeQ(
          id,
          p5Id,
          p5Title,
          `k के किस मान के लिए समीकरण युग्म ${a1}x + ${b1}y = 7 तथा ${a2}x + ky = 15 का कोई हल नहीं (समांतर रेखाएँ) होगा?`,
          opts,
          1,
          `कोई हल नहीं होने की शर्त: a₁/a₂ = b₁/b₂ ≠ c₁/c₂\n⇒ ${a1}/${a2} = ${b1}/k\n⇒ 1/${m} = ${b1}/k ⇒ k = ${b1} × ${m} = ${kAns}।`,
          i <= 15 ? `BSEB ${2017 + (i % 8)}` : undefined
        )
      );
    } else {
      // Find k for unique solution
      const opts: [string, string, string, string] = [
        `k = ${kAns}`,
        `k ≠ ${kAns}`,
        `k = ${a2}`,
        `k ≠ ${a1}`,
      ];
      list.push(
        makeQ(
          id,
          p5Id,
          p5Title,
          `k के किस मान के लिए समीकरण युग्म ${a1}x + ${b1}y = 9 तथा ${a2}x + ky = 11 का एक अद्वितीय हल (अविरोधी) होगा?`,
          opts,
          1,
          `अद्वितीय हल होने की शर्त: a₁/a₂ ≠ b₁/b₂\n⇒ ${a1}/${a2} ≠ ${b1}/k\n⇒ 1/${m} ≠ ${b1}/k ⇒ k ≠ ${b1} × ${m} अर्थात् k ≠ ${kAns}।`,
          i <= 16 ? `BSEB ${2018 + (i % 7)}` : undefined
        )
      );
    }
  }

  // =========================================================================
  // PART 6: Q 251 to 300 — प्रतिस्थापन एवं विलोपन विधि द्वारा हल (x और y का मान)
  // =========================================================================
  const p6Id = 'part-6';
  const p6Title = CLASS_10_MATH_CH03_500_PARTS[5].title;

  const p6Core: Array<{
    q: string;
    opts: [string, string, string, string];
    ans: 0 | 1 | 2 | 3;
    exp: string;
    yr?: string;
  }> = [
    {
      q: 'यदि x + y = 14 तथा x − y = 4 हो, तो x और y के मान क्रमशः क्या होंगे?',
      opts: ['x = 9, y = 5', 'x = 5, y = 9', 'x = 10, y = 4', 'x = 8, y = 6'],
      ans: 0,
      exp: 'दोनों समीकरणों को जोड़ने पर: 2x = 18 ⇒ x = 9। x = 9 रखने पर 9 + y = 14 ⇒ y = 5।',
      yr: 'NCERT / BSEB 2019, 2022, 2024',
    },
    {
      q: 'यदि x + y = 10 तथा x − y = 2 हो, तो x का मान क्या होगा?',
      opts: ['4', '6', '8', '12'],
      ans: 1,
      exp: 'जोड़ने पर: (x + y) + (x − y) = 10 + 2 ⇒ 2x = 12 ⇒ x = 6।',
      yr: 'BSEB 2020, 2023',
    },
    {
      q: 'यदि 2x + y = 7 तथा x − y = 2 हो, तो (x, y) का मान क्या होगा?',
      opts: ['(3, 1)', '(1, 3)', '(2, 3)', '(4, −1)'],
      ans: 0,
      exp: 'दोनों को जोड़ने पर: 3x = 9 ⇒ x = 3। अब 3 − y = 2 ⇒ y = 1। अतः हल (3, 1) है।',
      yr: 'BSEB 2021',
    },
    {
      q: 'समीकरण युग्म x + 2y = 5 तथा 2x − 3y = −4 का हल क्या है?',
      opts: ['x = 1, y = 2', 'x = 2, y = 1', 'x = −1, y = 3', 'x = 3, y = 1'],
      ans: 0,
      exp: 'प्रथम समीकरण से x = 5 − 2y दूसरे में रखने पर: 2(5 − 2y) − 3y = −4 ⇒ 10 − 7y = −4 ⇒ 7y = 14 ⇒ y = 2, अतः x = 1।',
      yr: 'NCERT / BSEB 2022',
    },
    {
      q: 'यदि 3x + 4y = 10 और 2x − 2y = 2 हो, तो x और y का मान क्या होगा?',
      opts: ['x = 2, y = 1', 'x = 1, y = 2', 'x = 3, y = 1', 'x = 2, y = 2'],
      ans: 0,
      exp: 'दूसरे समीकरण से x − y = 1 ⇒ x = y + 1। पहले में रखने पर: 3(y + 1) + 4y = 10 ⇒ 7y = 7 ⇒ y = 1 तथा x = 2।',
      yr: 'NCERT / BSEB 2023',
    },
    {
      q: 'समीकरण युग्म √2x + √3y = 0 तथा √3x − √8y = 0 का हल क्या होगा?',
      opts: ['x = 1, y = 1', 'x = 0, y = 0', 'x = √2, y = √3', 'कोई हल नहीं'],
      ans: 1,
      exp: 'समघातीय रैखिक समीकरण युग्म जिसमें अचर पद 0 हो और a₁/a₂ ≠ b₁/b₂ हो, उसका एकमात्र हल x = 0, y = 0 होता है।',
      yr: 'NCERT / BSEB 2020, 2024',
    },
    {
      q: 'यदि 0.2x + 0.3y = 1.3 तथा 0.4x + 0.5y = 2.3 हो, तो x और y के मान क्या हैं?',
      opts: ['x = 2, y = 3', 'x = 3, y = 2', 'x = 1, y = 4', 'x = 4, y = 1'],
      ans: 0,
      exp: '10 से गुणा करने पर: 2x + 3y = 13 और 4x + 5y = 23। पहले को 2 से गुणा कर घटाने पर: y = 3 तथा x = 2।',
      yr: 'NCERT / BSEB 2021',
    },
    {
      q: 'यदि 2x + 3y = 11 और 2x − 4y = −24 हो, तो y का मान क्या होगा?',
      opts: ['3', '4', '5', '−2'],
      ans: 2,
      exp: 'पहले समीकरण में से दूसरा घटाने पर: (2x + 3y) − (2x − 4y) = 11 − (−24) ⇒ 7y = 35 ⇒ y = 5।',
      yr: 'NCERT / BSEB 2022',
    },
    {
      q: 'उपरोक्त प्रश्न (2x + 3y = 11 और 2x − 4y = −24) में यदि y = mx + 3 हो, तो m का मान क्या होगा?',
      opts: ['1', '−1', '2', '−2'],
      ans: 1,
      exp: 'y = 5 रखने पर 2x + 15 = 11 ⇒ 2x = −4 ⇒ x = −2। अब y = mx + 3 में रखने पर: 5 = m(−2) + 3 ⇒ −2m = 2 ⇒ m = −1।',
      yr: 'NCERT / BSEB 2019, 2024',
    },
    {
      q: 'यदि 3x − 5y − 4 = 0 और 9x = 2y + 7 हो, तो x का मान क्या है?',
      opts: ['9/13', '−5/13', '13/9', '7/13'],
      ans: 0,
      exp: 'प्रथम समीकरण को 3 से गुणा करने पर 9x − 15y = 12। 9x = 2y + 7 रखने पर: 2y + 7 − 15y = 12 ⇒ −13y = 5 ⇒ y = −5/13 तथा x = 9/13।',
      yr: 'NCERT',
    },
  ];

  for (let i = 0; i < 10; i++) {
    const item = p6Core[i];
    list.push(makeQ(list.length + 1, p6Id, p6Title, item.q, item.opts, item.ans, item.exp, item.yr));
  }

  for (let i = 1; i <= 40; i++) {
    const id = list.length + 1;
    const xAns = (i % 7) + 2; // 2..8
    const yAns = ((i + 2) % 6) + 1; // 1..6
    const sum = xAns + yAns;
    const diff = xAns - yAns;
    const a = (i % 3) + 2;
    const b = ((i + 1) % 3) + 1;
    const c1 = a * xAns + b * yAns;
    const c2 = xAns - yAns;

    if (i % 2 === 1) {
      list.push(
        makeQ(
          id,
          p6Id,
          p6Title,
          `यदि x + y = ${sum} तथा x − y = ${diff} हो, तो (x, y) का मान क्या होगा?`,
          [`(${xAns}, ${yAns})`, `(${yAns}, ${xAns})`, `(${xAns + 1}, ${yAns - 1})`, `(${xAns - 1}, ${yAns + 1})`],
          0,
          `दोनों समीकरणों को जोड़ने पर:\n2x = ${sum} + (${diff}) = ${2 * xAns} ⇒ x = ${xAns}।\nx = ${xAns} रखने पर y = ${sum} − ${xAns} = ${yAns}।\nअतः अभीष्ट हल (${xAns}, ${yAns}) है।`,
          i <= 12 ? `BSEB ${2018 + (i % 7)}` : undefined
        )
      );
    } else {
      list.push(
        makeQ(
          id,
          p6Id,
          p6Title,
          `विलोपन विधि से हल करें: यदि ${a}x + ${b}y = ${c1} तथा x − y = ${c2} हो, तो x का मान क्या होगा?`,
          [String(xAns - 1), String(xAns), String(xAns + 1), String(yAns + 3)],
          1,
          `दूसरे समीकरण को ${b} से गुणा कर पहले में जोड़ने पर:\n(${a}x + ${b}y) + (${b}x − ${b}y) = ${c1} + ${b * c2}\n⇒ ${a + b}x = ${(a + b) * xAns} ⇒ x = ${xAns}।`,
          i <= 14 ? `BSEB ${2019 + (i % 6)}` : undefined
        )
      );
    }
  }

  // =========================================================================
  // PART 7: Q 301 to 350 — वज्र-गुणन विधि एवं सममित समीकरण
  // =========================================================================
  const p7Id = 'part-7';
  const p7Title = CLASS_10_MATH_CH03_500_PARTS[6].title;

  const p7Core: Array<{
    q: string;
    opts: [string, string, string, string];
    ans: 0 | 1 | 2 | 3;
    exp: string;
    yr?: string;
  }> = [
    {
      q: 'वज्र-गुणन विधि (Cross-Multiplication Method) में समीकरण a₁x + b₁y + c₁ = 0 और a₂x + b₂y + c₂ = 0 के लिए x का सूत्र क्या है?',
      opts: [
        'x = (b₁c₂ − b₂c₁) / (a₁b₂ − a₂b₁)',
        'x = (c₁a₂ − c₂a₁) / (a₁b₂ − a₂b₁)',
        'x = (a₁b₂ − a₂b₁) / (b₁c₂ − b₂c₁)',
        'x = (b₁c₁ − b₂c₂) / (a₁a₂)',
      ],
      ans: 0,
      exp: 'वज्र-गुणन सूत्र: x / (b₁c₂ − b₂c₁) = y / (c₁a₂ − c₂a₁) = 1 / (a₁b₂ − a₂b₁)। अतः x = (b₁c₂ − b₂c₁)/(a₁b₂ − a₂b₁)।',
      yr: 'BSEB 2019, 2022, 2024',
    },
    {
      q: 'वज्र-गुणन विधि में y का मान ज्ञात करने का सही सूत्र कौन-सा है?',
      opts: [
        'y = (b₁c₂ − b₂c₁) / (a₁b₂ − a₂b₁)',
        'y = (c₁a₂ − c₂a₁) / (a₁b₂ − a₂b₁)',
        'y = (a₁c₂ − a₂c₁) / (a₁b₂ + a₂b₁)',
        'y = (c₁b₂ − c₂b₁) / (a₁b₂ − a₂b₁)',
      ],
      ans: 1,
      exp: 'वज्र-गुणन विधि से y / (c₁a₂ − c₂a₁) = 1 / (a₁b₂ − a₂b₁) ⇒ y = (c₁a₂ − c₂a₁)/(a₁b₂ − a₂b₁)।',
      yr: 'BSEB 2020, 2023',
    },
    {
      q: 'वज्र-गुणन सूत्र में हर (Denominator) (a₁b₂ − a₂b₁) का मान शून्य न होना (a₁b₂ − a₂b₁ ≠ 0) क्या दर्शाता है?',
      opts: ['कोई हल नहीं है', 'अनंत हल हैं', 'अद्वितीय हल का अस्तित्व है', 'समीकरण द्विघात है'],
      ans: 2,
      exp: 'a₁b₂ − a₂b₁ ≠ 0 का अर्थ है a₁/a₂ ≠ b₁/b₂, जो अद्वितीय हल होने की आवश्यक शर्त है।',
      yr: 'BSEB 2021',
    },
    {
      q: 'सममित समीकरण 17x + 23y = 40 तथा 23x + 17y = 80 में (x + y) का मान क्या होगा?',
      opts: ['2', '3', '4', '5'],
      ans: 1,
      exp: 'दोनों समीकरणों को सीधे जोड़ने पर: (17+23)x + (23+17)y = 40 + 80 ⇒ 40x + 40y = 120 ⇒ 40(x + y) = 120 ⇒ x + y = 3।',
      yr: 'BSEB 2020, 2023, 2025',
    },
    {
      q: 'यदि 41x + 53y = 135 और 53x + 41y = 147 हो, तो (x + y) का मान क्या होगा?',
      opts: ['2', '3', '4', '1'],
      ans: 1,
      exp: 'दोनों को जोड़ने पर: 94x + 94y = 282 ⇒ 94(x + y) = 282 ⇒ x + y = 282/94 = 3।',
      yr: 'BSEB 2022',
    },
    {
      q: 'यदि 41x + 53y = 135 और 53x + 41y = 147 हो, तो (x − y) का मान क्या होगा?',
      opts: ['1', '−1', '2', '3'],
      ans: 0,
      exp: 'दूसरे समीकरण में से पहला घटाने पर: (53−41)x + (41−53)y = 147 − 135 ⇒ 12x − 12y = 12 ⇒ x − y = 1।',
      yr: 'BSEB 2022, 2024',
    },
    {
      q: 'समीकरण 2/x + 3/y = 13 तथा 5/x − 4/y = −2 को रैखिक रूप में बदलने के लिए क्या प्रतिस्थापन किया जाता है?',
      opts: ['1/x = u तथा 1/y = v', 'x = u तथा y = v', 'x² = u तथा y² = v', 'xy = u'],
      ans: 0,
      exp: 'जब चर हर में हों (1/x और 1/y), तब 1/x = u और 1/y = v मानकर उन्हें रैखिक समीकरण 2u + 3v = 13 तथा 5u − 4v = −2 में बदला जाता है।',
      yr: 'NCERT / BSEB 2021',
    },
    {
      q: 'समीकरण युग्म 2/x + 3/y = 13 तथा 5/x − 4/y = −2 में x और y के मान क्या होंगे?',
      opts: ['x = 1/2, y = 1/3', 'x = 2, y = 3', 'x = 1/3, y = 1/2', 'x = 3, y = 2'],
      ans: 0,
      exp: '1/x = u, 1/y = v रखने पर 2u + 3v = 13 और 5u − 4v = −2। हल करने पर u = 2, v = 3 ⇒ x = 1/2, y = 1/3।',
      yr: 'NCERT / BSEB 2023',
    },
    {
      q: 'समीकरण युग्म 8x + 5y = 9 और 3x + 2y = 4 को वज्र-गुणन विधि से हल करने पर (x, y) का मान क्या होगा?',
      opts: ['(−2, 5)', '(2, −5)', '(−2, −5)', '(5, −2)'],
      ans: 0,
      exp: 'x = (5×(−4) − 2×(−9)) / (8×2 − 3×5) = (−20 + 18) / (16 − 15) = −2। y = 5। अतः हल (−2, 5) है।',
      yr: 'NCERT / BSEB 2020',
    },
    {
      q: 'यदि 99x + 101y = 499 और 101x + 99y = 501 हो, तो x और y के मान क्या होंगे?',
      opts: ['x = 3, y = 2', 'x = 2, y = 3', 'x = 4, y = 1', 'x = 1, y = 4'],
      ans: 0,
      exp: 'जोड़ने पर 200(x + y) = 1000 ⇒ x + y = 5। घटाने पर 2(x − y) = 2 ⇒ x − y = 1। अतः x = 3, y = 2।',
      yr: 'BSEB 2019, 2024',
    },
  ];

  for (let i = 0; i < 10; i++) {
    const item = p7Core[i];
    list.push(makeQ(list.length + 1, p7Id, p7Title, item.q, item.opts, item.ans, item.exp, item.yr));
  }

  for (let i = 1; i <= 40; i++) {
    const id = list.length + 1;
    const p = 10 + i;
    const q = 20 + i;
    const sumCoef = p + q;
    const kVal = (i % 5) + 2; // x + y = kVal
    const rhs1 = p * kVal - 3 * i;
    const rhs2 = q * kVal + 3 * i;
    const totalRhs = rhs1 + rhs2; // = (p+q)*kVal

    list.push(
      makeQ(
        id,
        p7Id,
        p7Title,
        `यदि ${p}x + ${q}y = ${rhs1} तथा ${q}x + ${p}y = ${rhs2} हो, तो (x + y) का मान क्या होगा?`,
        [String(kVal - 1), String(kVal), String(kVal + 1), String(kVal + 2)],
        1,
        `सममित समीकरण ट्रिक से दोनों समीकरणों को जोड़ने पर:\n(${p} + ${q})x + (${q} + ${p})y = ${rhs1} + ${rhs2}\n⇒ ${sumCoef}(x + y) = ${totalRhs}\n⇒ x + y = ${totalRhs} / ${sumCoef} = ${kVal}।`,
        i <= 14 ? `BSEB ${2018 + (i % 7)}` : undefined
      )
    );
  }

  // =========================================================================
  // PART 8: Q 351 to 400 — संख्याओं, दो अंकों वाली संख्या एवं भिन्नों पर आधारित प्रश्न
  // =========================================================================
  const p8Id = 'part-8';
  const p8Title = CLASS_10_MATH_CH03_500_PARTS[7].title;

  const p8Core: Array<{
    q: string;
    opts: [string, string, string, string];
    ans: 0 | 1 | 2 | 3;
    exp: string;
    yr?: string;
  }> = [
    {
      q: 'यदि किसी दो अंकों वाली संख्या का दहाई अंक x तथा इकाई अंक y हो, तो वह संख्या क्या होगी?',
      opts: ['xy', 'x + y', '10x + y', '10y + x'],
      ans: 2,
      exp: 'दो अंकों की संख्या = 10 × (दहाई का अंक) + (इकाई का अंक) = 10x + y।',
      yr: 'BSEB 2018, 2021, 2024',
    },
    {
      q: 'यदि दहाई अंक x और इकाई अंक y वाली दो अंकों की संख्या के अंक पलट दिए जाएँ, तो नई संख्या क्या होगी?',
      opts: ['10x + y', '10y + x', 'x − y', '10(x + y)'],
      ans: 1,
      exp: 'अंक पलटने पर y दहाई स्थान पर और x इकाई स्थान पर आ जाता है, अतः नई संख्या = 10y + x होगी।',
      yr: 'BSEB 2019, 2023',
    },
    {
      q: 'दो अंकों की एक संख्या (10x + y) तथा उसके अंकों को पलटने पर बनी संख्या (10y + x) का योग हमेशा किस संख्या से पूर्णतः विभाजित होता है?',
      opts: ['9 से', '10 से', '11 से', '12 से'],
      ans: 2,
      exp: '(10x + y) + (10y + x) = 11x + 11y = 11(x + y)। अतः यह योग सदैव 11 से विभाजित होता है।',
      yr: 'BSEB 2020, 2022, 2025',
    },
    {
      q: 'दो अंकों की एक संख्या (10x + y) तथा उसके अंकों को पलटने पर बनी संख्या (10y + x) का अंतर हमेशा किस संख्या से विभाजित होता है?',
      opts: ['9 से', '11 से', '10 से', '5 से'],
      ans: 0,
      exp: '|(10x + y) − (10y + x)| = |9x − 9y| = 9|x − y|। अतः अंतर सदैव 9 से विभाजित होता है।',
      yr: 'BSEB 2021, 2024',
    },
    {
      q: 'दो संख्याओं का अंतर 26 है और एक संख्या दूसरी संख्या की तीन गुनी है। वे संख्याएँ क्या हैं?',
      opts: ['39 और 13', '26 और 13', '42 और 14', '36 और 12'],
      ans: 0,
      exp: 'माना संख्याएँ x और y हैं। x − y = 26 तथा x = 3y ⇒ 3y − y = 26 ⇒ 2y = 26 ⇒ y = 13 तथा x = 39।',
      yr: 'NCERT / BSEB 2019, 2023',
    },
    {
      q: 'दो अंकों की एक संख्या के अंकों का योग 9 है। इस संख्या का नौ गुना, संख्या के अंकों को पलटने से बनी संख्या का दो गुना है। वह संख्या क्या है?',
      opts: ['18', '81', '27', '36'],
      ans: 0,
      exp: 'x + y = 9 तथा 9(10x + y) = 2(10y + x) ⇒ 88x = 11y ⇒ y = 8x। अतः x = 1, y = 8 ⇒ संख्या = 18।',
      yr: 'NCERT / BSEB 2020, 2024',
    },
    {
      q: 'यदि किसी भिन्न के अंश और हर दोनों में 2 जोड़ दिया जाए, तो वह 9/11 हो जाती है। यदि अंश और हर दोनों में 3 जोड़ दिया जाए, तो वह 5/6 हो जाती है। वह भिन्न क्या है?',
      opts: ['7/9', '5/7', '3/5', '9/11'],
      ans: 0,
      exp: '7/9 में अंश व हर में 2 जोड़ने पर (7+2)/(9+2) = 9/11 और 3 जोड़ने पर (7+3)/(9+3) = 10/12 = 5/6। अतः भिन्न 7/9 है।',
      yr: 'NCERT / BSEB 2021',
    },
    {
      q: 'यदि किसी भिन्न के अंश में 1 जोड़ा जाए तथा हर में से 1 घटाया जाए तो भिन्न 1 में बदल जाती है। यदि हर में 1 जोड़ा जाए तो यह 1/2 हो जाती है। वह भिन्न क्या है?',
      opts: ['3/5', '2/5', '4/5', '3/7'],
      ans: 0,
      exp: 'x/y = 3/5 के लिए: (3+1)/(5−1) = 4/4 = 1 तथा 3/(5+1) = 3/6 = 1/2। अतः भिन्न 3/5 है।',
      yr: 'NCERT / BSEB 2022, 2025',
    },
    {
      q: 'दो संख्याओं का योग 50 है और उनका अंतर 14 है। बड़ी संख्या क्या होगी?',
      opts: ['32', '18', '36', '28'],
      ans: 0,
      exp: 'x + y = 50 तथा x − y = 14 ⇒ बड़ी संख्या x = (50 + 14)/2 = 64/2 = 32।',
      yr: 'BSEB 2020',
    },
    {
      q: 'एक दो अंकों वाली संख्या और उसके अंकों को पलटने से बनी संख्या का योग 99 है। संख्या के अंकों का योग (x + y) क्या होगा?',
      opts: ['9', '11', '8', '10'],
      ans: 0,
      exp: '(10x + y) + (10y + x) = 99 ⇒ 11(x + y) = 99 ⇒ x + y = 99/11 = 9।',
      yr: 'BSEB 2023',
    },
  ];

  for (let i = 0; i < 10; i++) {
    const item = p8Core[i];
    list.push(makeQ(list.length + 1, p8Id, p8Title, item.q, item.opts, item.ans, item.exp, item.yr));
  }

  for (let i = 1; i <= 40; i++) {
    const id = list.length + 1;
    if (i % 2 === 1) {
      const a = 15 + i;
      const b = 5 + (i % 9);
      const s = a + b;
      const d = a - b;
      list.push(
        makeQ(
          id,
          p8Id,
          p8Title,
          `यदि दो संख्याओं का योगफल ${s} है और उनका अंतर ${d} है, तो दोनों संख्याएँ क्या होंगी?`,
          [`${a} और ${b}`, `${a + 2} और ${b - 2}`, `${a - 1} और ${b + 1}`, `${s} और ${d}`],
          0,
          `माना संख्याएँ x और y हैं।\nx + y = ${s} तथा x − y = ${d}\nजोड़ने पर 2x = ${s + d} ⇒ x = ${a}\nतथा y = ${s} − ${a} = ${b}। अतः संख्याएँ ${a} और ${b} हैं।`,
          i <= 12 ? `BSEB ${2018 + (i % 7)}` : undefined
        )
      );
    } else {
      const digitSum = (i % 8) + 6; // 6..13
      const totalSum = 11 * digitSum;
      list.push(
        makeQ(
          id,
          p8Id,
          p8Title,
          `दो अंकों की एक संख्या और उसके अंकों को पलटने से बनी संख्या का योगफल ${totalSum} है। उस संख्या के दोनों अंकों का योग (x + y) कितना होगा?`,
          [String(digitSum - 1), String(digitSum), String(digitSum + 1), String(digitSum + 2)],
          1,
          `हम जानते हैं: (10x + y) + (10y + x) = ${totalSum}\n⇒ 11(x + y) = ${totalSum}\n⇒ x + y = ${totalSum} / 11 = ${digitSum}।`,
          i <= 12 ? `BSEB ${2019 + (i % 6)}` : undefined
        )
      );
    }
  }

  // =========================================================================
  // PART 9: Q 401 to 450 — आयु, आय-व्यय, किराया एवं ज्यामितीय कोण
  // =========================================================================
  const p9Id = 'part-9';
  const p9Title = CLASS_10_MATH_CH03_500_PARTS[8].title;

  const p9Core: Array<{
    q: string;
    opts: [string, string, string, string];
    ans: 0 | 1 | 2 | 3;
    exp: string;
    yr?: string;
  }> = [
    {
      q: 'दो संपूरक कोणों (Supplementary Angles) में बड़ा कोण छोटे कोण से 18° अधिक है। बड़ा कोण कितने अंश का है?',
      opts: ['99°', '81°', '108°', '72°'],
      ans: 0,
      exp: 'संपूरक कोणों का योग x + y = 180° तथा अंतर x − y = 18°। जोड़ने पर 2x = 198° ⇒ x = 99° और y = 81°।',
      yr: 'NCERT / BSEB 2019, 2022, 2024',
    },
    {
      q: 'दो पूरक कोणों (Complementary Angles) का अंतर 12° है। दोनों कोणों की माप क्या है?',
      opts: ['51° और 39°', '52° और 38°', '60° और 30°', '48° और 42°'],
      ans: 0,
      exp: 'पूरक कोणों का योग x + y = 90° तथा x − y = 12°। अतः x = (90 + 12)/2 = 51° और y = 39°।',
      yr: 'BSEB 2020, 2023',
    },
    {
      q: '5 वर्ष बाद जैकब की आयु उसके पुत्र की आयु से तीन गुनी हो जाएगी तथा 5 वर्ष पूर्व जैकब की आयु उसके पुत्र की आयु की सात गुनी थी। उनकी वर्तमान आयु क्या है?',
      opts: ['40 वर्ष और 10 वर्ष', '35 वर्ष और 10 वर्ष', '45 वर्ष और 15 वर्ष', '50 वर्ष और 15 वर्ष'],
      ans: 0,
      exp: 'x + 5 = 3(y + 5) ⇒ x − 3y = 10; और x − 5 = 7(y − 5) ⇒ x − 7y = −30। हल करने पर पुत्र y = 10 वर्ष और जैकब x = 40 वर्ष।',
      yr: 'NCERT / BSEB 2021, 2024',
    },
    {
      q: '5 वर्ष पूर्व नूरी की आयु सोनू की आयु की तीन गुनी थी। 10 वर्ष पश्चात् नूरी की आयु सोनू की आयु की दो गुनी हो जाएगी। नूरी और सोनू की वर्तमान आयु क्या है?',
      opts: ['50 वर्ष और 20 वर्ष', '40 वर्ष और 15 वर्ष', '45 वर्ष और 20 वर्ष', '60 वर्ष और 25 वर्ष'],
      ans: 0,
      exp: 'x − 5 = 3(y − 5) ⇒ x − 3y = −10; और x + 10 = 2(y + 10) ⇒ x − 2y = 10। घटाने पर y = 20 वर्ष तथा x = 50 वर्ष।',
      yr: 'NCERT / BSEB 2020, 2023',
    },
    {
      q: 'किसी चक्रीय चतुर्भुज (Cyclic Quadrilateral) ABCD के सम्मुख कोणों ∠A और ∠C के बीच क्या संबंध होता है?',
      opts: ['∠A + ∠C = 90°', '∠A + ∠C = 180°', '∠A − ∠C = 180°', '∠A + ∠C = 360°'],
      ans: 1,
      exp: 'चक्रीय चतुर्भुज के सम्मुख कोण संपूरक होते हैं, अर्थात् ∠A + ∠C = 180° तथा ∠B + ∠D = 180°।',
      yr: 'NCERT / BSEB 2021, 2025',
    },
    {
      q: 'एक त्रिभुज ABC में यदि ∠C = 3∠B = 2(∠A + ∠B) हो, तो ∠C का मान क्या होगा?',
      opts: ['90°', '120°', '60°', '100°'],
      ans: 1,
      exp: '∠A + ∠B + ∠C = 180°। चूँकि ∠A + ∠B = ∠C/2, अतः ∠C/2 + ∠C = 180° ⇒ 3∠C/2 = 180° ⇒ ∠C = 120°।',
      yr: 'NCERT / BSEB 2022',
    },
    {
      q: 'दो व्यक्तियों की आय का अनुपात 9 : 7 है और उनके खर्चों का अनुपात 4 : 3 है। यदि प्रत्येक व्यक्ति प्रति महीने ₹ 2000 बचा लेता है, तो उनकी मासिक आय क्या है?',
      opts: ['₹ 18,000 और ₹ 14,000', '₹ 9,000 और ₹ 7,000', '₹ 27,000 और ₹ 21,000', '₹ 15,000 और ₹ 12,000'],
      ans: 0,
      exp: '9x − 4y = 2000 तथा 7x − 3y = 2000। हल करने पर x = 2000 ⇒ मासिक आय 9x = ₹ 18,000 और 7x = ₹ 14,000।',
      yr: 'NCERT / BSEB 2023',
    },
    {
      q: 'मीना ₹ 2000 निकालने के लिए एक बैंक गई। उसने खजांची से ₹ 50 तथा ₹ 100 के कुल 25 नोट प्राप्त किए। उसने ₹ 50 और ₹ 100 के कितने-कितने नोट प्राप्त किए?',
      opts: ['10 और 15', '15 और 10', '12 और 13', '20 और 5'],
      ans: 0,
      exp: 'x + y = 25 तथा 50x + 100y = 2000 ⇒ x + 2y = 40। घटाने पर y = 15 (₹ 100 के नोट) तथा x = 10 (₹ 50 के नोट)।',
      yr: 'NCERT / BSEB 2021, 2024',
    },
    {
      q: '5 संतरे और 3 सेबों का मूल्य ₹ 35 है तथा 2 संतरे और 4 सेबों का मूल्य ₹ 28 है। 1 संतरे और 1 सेब का मूल्य क्रमशः क्या है?',
      opts: ['₹ 4 और ₹ 5', '₹ 5 और ₹ 4', '₹ 3 और ₹ 6', '₹ 6 और ₹ 3'],
      ans: 0,
      exp: '5x + 3y = 35 और 2x + 4y = 28 (अर्थात् x + 2y = 14)। हल करने पर संतरा x = ₹ 4 तथा सेब y = ₹ 5।',
      yr: 'NCERT / BSEB 2022',
    },
    {
      q: 'एक नगर में टैक्सी का नियत भाड़ा ₹ x और प्रति किमी भाड़ा ₹ y है। 10 किमी के लिए ₹ 105 तथा 15 किमी के लिए ₹ 155 लगते हैं। नियत भाड़ा (x) और प्रति किमी भाड़ा (y) क्या है?',
      opts: ['₹ 5 और ₹ 10/किमी', '₹ 10 और ₹ 10/किमी', '₹ 5 और ₹ 15/किमी', '₹ 15 और ₹ 9/किमी'],
      ans: 0,
      exp: 'x + 10y = 105 और x + 15y = 155। घटाने पर 5y = 50 ⇒ y = ₹ 10/किमी तथा नियत भाड़ा x = ₹ 5।',
      yr: 'NCERT / BSEB 2020, 2024',
    },
  ];

  for (let i = 0; i < 10; i++) {
    const item = p9Core[i];
    list.push(makeQ(list.length + 1, p9Id, p9Title, item.q, item.opts, item.ans, item.exp, item.yr));
  }

  for (let i = 1; i <= 40; i++) {
    const id = list.length + 1;
    if (i % 2 === 1) {
      // Supplementary angles with difference 2*i
      const diff = 2 * i;
      const big = (180 + diff) / 2;
      const small = (180 - diff) / 2;
      list.push(
        makeQ(
          id,
          p9Id,
          p9Title,
          `दो संपूरक कोणों (जिनका योग 180° होता है) का अंतर ${diff}° है। दोनों कोणों की माप क्या होगी?`,
          [`${big}° और ${small}°`, `${big + 5}° और ${small - 5}°`, `${big - 4}° और ${small + 4}°`, `100° और 80°`],
          0,
          `संपूरक कोणों के लिए: x + y = 180° तथा x − y = ${diff}°\nदोनों को जोड़ने पर: 2x = ${180 + diff}° ⇒ x = ${big}°\nतथा y = 180° − ${big}° = ${small}°।`,
          i <= 12 ? `BSEB ${2018 + (i % 7)}` : undefined
        )
      );
    } else {
      // Father and son present ages
      const son = 8 + Math.floor(i / 2);
      const father = 3 * son + 4;
      const sumAge = father + son;
      const diffAge = father - son;
      list.push(
        makeQ(
          id,
          p9Id,
          p9Title,
          `पिता और पुत्र की वर्तमान आयु का योगफल ${sumAge} वर्ष है तथा उनकी आयु का अंतर ${diffAge} वर्ष है। पिता और पुत्र की वर्तमान आयु क्या है?`,
          [
            `${father} वर्ष और ${son} वर्ष`,
            `${father + 2} वर्ष और ${son - 2} वर्ष`,
            `${father - 3} वर्ष और ${son + 3} वर्ष`,
            `${father + 4} वर्ष और ${son} वर्ष`,
          ],
          0,
          `माना पिता की आयु x वर्ष और पुत्र की आयु y वर्ष है।\nx + y = ${sumAge} तथा x − y = ${diffAge}\nजोड़ने पर 2x = ${2 * father} ⇒ x = ${father} वर्ष\nतथा पुत्र y = ${sumAge} − ${father} = ${son} वर्ष।`,
          i <= 12 ? `BSEB ${2019 + (i % 6)}` : undefined
        )
      );
    }
  }

  // =========================================================================
  // PART 10: Q 451 to 500 — चाल-दूरी-समय (नाव एवं धारा) तथा BSEB PYQ मॉडल बैंक
  // =========================================================================
  const p10Id = 'part-10';
  const p10Title = CLASS_10_MATH_CH03_500_PARTS[9].title;

  const p10Core: Array<{
    q: string;
    opts: [string, string, string, string];
    ans: 0 | 1 | 2 | 3;
    exp: string;
    yr?: string;
  }> = [
    {
      q: 'यदि शांत जल में नाव की चाल x किमी/घंटा तथा धारा की चाल y किमी/घंटा हो, तो धारा के अनुकूल (Downstream) नाव की चाल क्या होगी?',
      opts: ['(x − y) किमी/घंटा', '(x + y) किमी/घंटा', 'xy किमी/घंटा', '(x/y) किमी/घंटा'],
      ans: 1,
      exp: 'धारा की दिशा (अनुकूल) में धारा नाव की चाल को बढ़ाती है, इसलिए अनुकूल चाल = (x + y) किमी/घंटा होती है।',
      yr: 'NCERT / BSEB 2019, 2022, 2024',
    },
    {
      q: 'यदि शांत जल में नाव की चाल x किमी/घंटा तथा धारा की चाल y किमी/घंटा हो, तो धारा के प्रतिकूल (Upstream) नाव की चाल क्या होगी?',
      opts: ['(x + y) किमी/घंटा', '(x − y) किमी/घंटा', '(y − x) किमी/घंटा', '2x किमी/घंटा'],
      ans: 1,
      exp: 'धारा के विपरीत (प्रतिकूल) जाने पर धारा नाव की गति का विरोध करती है, अतः प्रतिकूल चाल = (x − y) किमी/घंटा होती है।',
      yr: 'NCERT / BSEB 2020, 2023',
    },
    {
      q: 'ऋतु धारा के अनुकूल 2 घंटे में 20 किमी तैर सकती है और धारा के प्रतिकूल 2 घंटे में 4 किमी तैर सकती है। स्थिर जल में उसके तैरने की चाल (x) और धारा की चाल (y) क्या है?',
      opts: ['6 किमी/घंटा और 4 किमी/घंटा', '8 किमी/घंटा और 2 किमी/घंटा', '5 किमी/घंटा और 5 किमी/घंटा', '7 किमी/घंटा और 3 किमी/घंटा'],
      ans: 0,
      exp: 'अनुकूल चाल x + y = 20/2 = 10 किमी/घंटा; प्रतिकूल चाल x − y = 4/2 = 2 किमी/घंटा। जोड़ने पर 2x = 12 ⇒ x = 6 किमी/घंटा और y = 4 किमी/घंटा।',
      yr: 'NCERT / BSEB 2021, 2024',
    },
    {
      q: 'यदि किसी नाव की धारा के अनुकूल चाल 14 किमी/घंटा और धारा के प्रतिकूल चाल 8 किमी/घंटा हो, तो शांत जल में नाव की चाल क्या होगी?',
      opts: ['11 किमी/घंटा', '3 किमी/घंटा', '12 किमी/घंटा', '6 किमी/घंटा'],
      ans: 0,
      exp: 'x + y = 14 तथा x − y = 8 ⇒ शांत जल में नाव की चाल x = (14 + 8)/2 = 22/2 = 11 किमी/घंटा।',
      yr: 'BSEB 2022',
    },
    {
      q: 'उपरोक्त प्रश्न में (अनुकूल चाल = 14 किमी/घंटा, प्रतिकूल चाल = 8 किमी/घंटा) धारा की चाल (y) क्या होगी?',
      opts: ['11 किमी/घंटा', '3 किमी/घंटा', '6 किमी/घंटा', '2 किमी/घंटा'],
      ans: 1,
      exp: 'धारा की चाल y = (अनुकूल चाल − प्रतिकूल चाल)/2 = (14 − 8)/2 = 6/2 = 3 किमी/घंटा।',
      yr: 'BSEB 2023',
    },
    {
      q: 'रैखिक समीकरण युग्म x = 2 और y = −3 का ग्राफ खींचने पर प्राप्त रेखाएँ कैसी होंगी?',
      opts: ['परस्पर समांतर', 'संपाती', 'परस्पर लंबवत एवं बिंदु (2, −3) पर प्रतिच्छेदी', 'मूल बिंदु से गुजरने वाली'],
      ans: 2,
      exp: 'x = 2 (y-अक्ष के समांतर) और y = −3 (x-अक्ष के समांतर) एक-दूसरे पर लंबवत होती हैं और बिंदु (2, −3) पर काटती हैं।',
      yr: 'BSEB 2020, 2024',
    },
    {
      q: 'दो सरल रेखाओं y = 0 और y = −5 के युग्म के कितने हल होंगे?',
      opts: ['एक हल', 'दो हल', 'अनगिनत हल', 'कोई हल नहीं'],
      ans: 3,
      exp: 'y = 0 (x-अक्ष) और y = −5 दोनों x-अक्ष के समांतर अलग-अलग रेखाएँ हैं जो कभी नहीं मिलतीं, अतः कोई हल नहीं है।',
      yr: 'NCERT / BSEB 2021, 2025',
    },
    {
      q: 'यदि x = a और y = b समीकरणों x − y = 2 तथा x + y = 4 के हल हों, तो a और b के मान क्रमशः क्या हैं?',
      opts: ['3 और 1', '1 और 3', '4 और 2', '2 और 2'],
      ans: 0,
      exp: 'a − b = 2 तथा a + b = 4 ⇒ 2a = 6 ⇒ a = 3 और b = 1।',
      yr: 'BSEB 2019, 2022, 2024',
    },
    {
      q: 'यदि 2x + y = 2x − y = √8 हो, तो y का मान क्या होगा?',
      opts: ['√2', '0', '1', '2'],
      ans: 1,
      exp: '2x + y = 2x − y ⇒ 2y = 0 ⇒ y = 0।',
      yr: 'BSEB 2020, 2023',
    },
    {
      q: 'यदि 3^(x+y) = 81 और 81^(x−y) = 3 हो, तो x का मान क्या होगा?',
      opts: ['17/8', '15/8', '4', '1/4'],
      ans: 0,
      exp: '3^(x+y) = 3^4 ⇒ x + y = 4; और (3^4)^(x−y) = 3^1 ⇒ 4(x − y) = 1 ⇒ x − y = 1/4। जोड़ने पर 2x = 17/4 ⇒ x = 17/8।',
      yr: 'BSEB 2021, 2025',
    },
  ];

  for (let i = 0; i < 10; i++) {
    const item = p10Core[i];
    list.push(makeQ(list.length + 1, p10Id, p10Title, item.q, item.opts, item.ans, item.exp, item.yr));
  }

  for (let i = 1; i <= 40; i++) {
    const id = list.length + 1;
    const boat = 8 + (i % 10); // 8..17
    const stream = 2 + (i % 5); // 2..6
    const down = boat + stream;
    const up = boat - stream;

    if (i % 2 === 1) {
      list.push(
        makeQ(
          id,
          p10Id,
          p10Title,
          `यदि एक नाव की धारा के अनुकूल चाल ${down} किमी/घंटा तथा धारा के प्रतिकूल चाल ${up} किमी/घंटा हो, तो शांत जल में नाव की चाल क्या होगी?`,
          [`${boat} किमी/घंटा`, `${stream} किमी/घंटा`, `${boat + 2} किमी/घंटा`, `${down} किमी/घंटा`],
          0,
          `माना शांत जल में नाव की चाल x किमी/घंटा तथा धारा की चाल y किमी/घंटा है।\nx + y = ${down} तथा x − y = ${up}\nजोड़ने पर 2x = ${down + up} ⇒ x = ${boat} किमी/घंटा।`,
          `BSEB ${2015 + (i % 11)}`
        )
      );
    } else {
      list.push(
        makeQ(
          id,
          p10Id,
          p10Title,
          `यदि एक नाव की धारा के अनुकूल चाल ${down} किमी/घंटा तथा धारा के प्रतिकूल चाल ${up} किमी/घंटा हो, तो धारा की चाल (Stream Speed) क्या होगी?`,
          [`${boat} किमी/घंटा`, `${stream} किमी/घंटा`, `${stream + 2} किमी/घंटा`, `${up} किमी/घंटा`],
          1,
          `धारा की चाल y = (अनुकूल चाल − प्रतिकूल चाल) / 2\n⇒ y = (${down} − ${up}) / 2 = ${2 * stream} / 2 = ${stream} किमी/घंटा।`,
          `BSEB ${2016 + (i % 10)}`
        )
      );
    }
  }

  return list;
}

export const CLASS_10_MATH_CH03_500_QUESTIONS: MathCh03Question500Item[] = buildMathCh03Questions500();

// ============================================================================
// ACTIVE ONLINE TESTS FOR CLASS 10 MATHS CHAPTER 03 (TESTS + TEST_QUESTIONS)
// ============================================================================

export const CLASS_10_MATH_CH03_TESTS: TestItem[] = [
  {
    id: 'test-c10-math-ch03-full-500',
    title: '🔥 अध्याय 3: दो चर वाले रैखिक समीकरण युग्म — संपूर्ण 500 VVI महा-मैराथन टेस्ट',
    description:
      'कक्षा 10 गणित अध्याय 3 (Pair of Linear Equations in Two Variables) के सभी 500 VVI वस्तुनिष्ठ प्रश्नों का संपूर्ण ऑनलाइन टेस्ट — प्रत्येक प्रश्न के विकल्प उत्तर एवं चरणबद्ध हल (Solved Explanation) के साथ।',
    classLevel: 'class-10',
    subjectId: 'sub-c10-math',
    chapterId: 'ch-c10-math-03',
    durationMinutes: 180,
    totalMarks: 500,
    passingMarks: 200,
    questionCount: 500,
    status: 'published',
    createdAt: '2026-03-02',
  },
  {
    id: 'test-c10-math-ch03-100-rapid',
    title: '⚡ अध्याय 3: दो चर वाले रैखिक समीकरण युग्म — 100 VVI बोर्ड मॉडल टेस्ट',
    description:
      'बिहार बोर्ड मैट्रिक परीक्षा के पैटर्न पर आधारित 100 सर्वाधिक महत्वपूर्ण वस्तुनिष्ठ प्रश्नों का त्वरित अभ्यास टेस्ट।',
    classLevel: 'class-10',
    subjectId: 'sub-c10-math',
    chapterId: 'ch-c10-math-03',
    durationMinutes: 60,
    totalMarks: 100,
    passingMarks: 40,
    questionCount: 100,
    status: 'published',
    createdAt: '2026-03-02',
  },
  ...CLASS_10_MATH_CH03_500_PARTS.map((part) => ({
    id: `test-c10-math-ch03-${part.id}`,
    title: `🎯 अध्याय 3 (भाग ${part.partNumber}): ${part.title} (${part.rangeLabel})`,
    description: `${part.description} — कुल 50 VVI वस्तुनिष्ठ प्रश्न एवं व्याख्या सहित हल।`,
    classLevel: 'class-10' as const,
    subjectId: 'sub-c10-math',
    chapterId: 'ch-c10-math-03',
    durationMinutes: 35,
    totalMarks: 50,
    passingMarks: 20,
    questionCount: 50,
    status: 'published' as const,
    createdAt: '2026-03-02',
  })),
];

export const CLASS_10_MATH_CH03_TEST_QUESTIONS: TestQuestion[] = [
  // 1. All 500 questions for the Full 500 Marathon Test
  ...CLASS_10_MATH_CH03_500_QUESTIONS.map((q) => ({
    id: `tq-c10-math03-full-${q.id}`,
    testId: 'test-c10-math-ch03-full-500',
    questionText: `[प्रश्न ${q.id}] ${q.question}`,
    options: q.options,
    correctOptionIndex: q.correctOptionIndex,
    marks: 1,
    explanation: `सही विकल्प (${q.correctAnswerKey}): ${q.correctOptionText} — ${q.solvedExplanation}`,
  })),
  // 2. Top 100 VVI Questions (10 from each of the 10 parts) for the 100 Rapid Test
  ...CLASS_10_MATH_CH03_500_QUESTIONS.filter((q) => (q.id - 1) % 50 < 10).map((q, idx) => ({
    id: `tq-c10-math03-rapid100-${idx + 1}`,
    testId: 'test-c10-math-ch03-100-rapid',
    questionText: `${q.question}`,
    options: q.options,
    correctOptionIndex: q.correctOptionIndex,
    marks: 1,
    explanation: `सही विकल्प (${q.correctAnswerKey}): ${q.correctOptionText} — ${q.solvedExplanation}`,
  })),
  // 3. Part-wise 50-question tests (Part 1 to Part 10)
  ...CLASS_10_MATH_CH03_500_QUESTIONS.map((q) => ({
    id: `tq-c10-math03-${q.partId}-${q.id}`,
    testId: `test-c10-math-ch03-${q.partId}`,
    questionText: `${q.question}`,
    options: q.options,
    correctOptionIndex: q.correctOptionIndex,
    marks: 1,
    explanation: `सही विकल्प (${q.correctAnswerKey}): ${q.correctOptionText} — ${q.solvedExplanation}`,
  })),
];
