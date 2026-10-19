import React, { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {
  BookOpen,
  Sparkles,
  Printer,
  Copy,
  Check,
  Eye,
  EyeOff,
  Award,
  Flame,
  Lightbulb,
  Sigma,
  Layers,
  CheckCircle2,
  FunctionSquare,
  Hash,
  Divide,
  Boxes,
  Equal,
  Compass,
  Calculator,
  ArrowLeft,
  FileText,
} from 'lucide-react';

interface LatexFormulaProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const LatexFormula: React.FC<LatexFormulaProps> = ({
  math,
  block = false,
  className = '',
}) => {
  const html = React.useMemo(() => {
    try {
      return katex.renderToString(math, {
        throwOnError: false,
        displayMode: block,
        strict: false,
      });
    } catch {
      return math;
    }
  }, [math, block]);

  return (
    <span
      className={`inline-block select-all ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export interface FormulaCardData {
  id: string;
  number: string;
  hindiTitle: string;
  englishSubtitle: string;
  isVVI?: boolean;
  accentTheme: 'blue' | 'purple' | 'amber' | 'indigo';
  iconName: string;
  leadText?: string;
  formulas: {
    latex: string;
    plainText: string;
    label?: string;
  }[];
  footerNote?: string;
}

export const CH02_FORMULA_CARDS: FormulaCardData[] = [
  {
    id: 'card-01',
    number: '01',
    hindiTitle: 'द्विघात बहुपद',
    englishSubtitle: 'Quadratic Polynomial (Standard Form)',
    isVVI: false,
    accentTheme: 'blue',
    iconName: 'function',
    formulas: [
      {
        latex: 'p(x) = ax^2 + bx + c, \\quad a \\neq 0',
        plainText: 'p(x) = ax² + bx + c, a ≠ 0',
      },
    ],
    footerNote: 'यहाँ a, b, c वास्तविक संख्याएँ हैं तथा बहुपद का घात (Degree) = 2 है।',
  },
  {
    id: 'card-02',
    number: '02',
    hindiTitle: 'शून्यक',
    englishSubtitle: 'Zero of a Polynomial',
    isVVI: false,
    accentTheme: 'purple',
    iconName: 'target',
    leadText: 'यदि p(α) = 0, तो α बहुपद का शून्यक है।',
    formulas: [
      {
        latex: 'p(\\alpha) = 0 \\implies \\alpha \\text{ बहुपद का शून्यक है}',
        plainText: 'यदि p(α) = 0, तो α बहुपद का शून्यक है।',
      },
    ],
    footerNote: 'द्विघात बहुपद के अधिकतम 2 शून्यक (α और β) होते हैं।',
  },
  {
    id: 'card-03',
    number: '03',
    hindiTitle: 'शून्यकों और गुणांकों का संबंध',
    englishSubtitle: 'Relation Between Zeroes & Coefficients',
    isVVI: true,
    accentTheme: 'amber',
    iconName: 'sigma',
    formulas: [
      {
        label: 'शून्यकों का योगफल (Sum)',
        latex: '\\alpha + \\beta = -\\frac{b}{a}',
        plainText: 'α + β = −b/a',
      },
      {
        label: 'शून्यकों का गुणनफल (Product)',
        latex: '\\alpha\\beta = \\frac{c}{a}',
        plainText: 'αβ = c/a',
      },
    ],
    footerNote: 'जहाँ b = x का गुणांक, c = अचर पद, और a = x² का गुणांक है।',
  },
  {
    id: 'card-04',
    number: '04',
    hindiTitle: 'शून्यकों से बहुपद',
    englishSubtitle: 'Formation of Quadratic Polynomial',
    isVVI: true,
    accentTheme: 'blue',
    iconName: 'layers',
    formulas: [
      {
        latex: 'p(x) = x^2 - (\\alpha + \\beta)x + \\alpha\\beta',
        plainText: 'p(x) = x² − (α + β)x + αβ',
      },
    ],
    footerNote: 'सूत्र: x² − (शून्यकों का योगफल)x + (शून्यकों का गुणनफल)',
  },
  {
    id: 'card-05',
    number: '05',
    hindiTitle: 'शून्यकों का वर्ग',
    englishSubtitle: 'Sum of Squares of Zeroes',
    isVVI: true,
    accentTheme: 'purple',
    iconName: 'sparkles',
    formulas: [
      {
        latex: '\\alpha^2 + \\beta^2 = (\\alpha + \\beta)^2 - 2\\alpha\\beta',
        plainText: 'α² + β² = (α + β)² − 2αβ',
      },
    ],
    footerNote: 'बीजगणितीय सर्वसमिका a² + b² = (a + b)² − 2ab पर आधारित।',
  },
  {
    id: 'card-06',
    number: '06',
    hindiTitle: 'व्युत्क्रमों का योग',
    englishSubtitle: 'Sum of Reciprocals of Zeroes',
    isVVI: true,
    accentTheme: 'amber',
    iconName: 'divide',
    formulas: [
      {
        latex: '\\frac{1}{\\alpha} + \\frac{1}{\\beta} = \\frac{\\alpha + \\beta}{\\alpha\\beta}',
        plainText: '1/α + 1/β = (α + β)/αβ',
      },
    ],
    footerNote: 'शॉर्टकट ट्रिक: 1/α + 1/β = (−b/a) ÷ (c/a) = −b/c',
  },
  {
    id: 'card-07',
    number: '07',
    hindiTitle: 'व्युत्क्रमों का गुणनफल',
    englishSubtitle: 'Product of Reciprocals of Zeroes',
    isVVI: false,
    accentTheme: 'blue',
    iconName: 'hash',
    formulas: [
      {
        latex: '\\frac{1}{\\alpha} \\times \\frac{1}{\\beta} = \\frac{1}{\\alpha\\beta}',
        plainText: '1/α × 1/β = 1/αβ',
      },
    ],
    footerNote: 'मान रखने पर: 1 / (c/a) = a/c',
  },
  {
    id: 'card-08',
    number: '08',
    hindiTitle: 'घनों का योग',
    englishSubtitle: 'Sum of Cubes of Zeroes',
    isVVI: false,
    accentTheme: 'purple',
    iconName: 'boxes',
    formulas: [
      {
        latex: '\\alpha^3 + \\beta^3 = (\\alpha + \\beta)^3 - 3\\alpha\\beta(\\alpha + \\beta)',
        plainText: 'α³ + β³ = (α + β)³ − 3αβ(α + β)',
      },
    ],
    footerNote: 'दीर्घ उत्तरीय प्रश्नों में मान ज्ञात करने के लिए अत्यंत उपयोगी सूत्र।',
  },
  {
    id: 'card-09',
    number: '09',
    hindiTitle: 'समान शून्यक',
    englishSubtitle: 'Condition for Equal Zeroes',
    isVVI: true,
    accentTheme: 'amber',
    iconName: 'equal',
    leadText: 'समान शून्यक ⇒ D = 0',
    formulas: [
      {
        label: 'विविक्तकर सूत्र',
        latex: 'D = b^2 - 4ac',
        plainText: 'D = b² − 4ac',
      },
      {
        label: 'समान शून्यक की शर्त',
        latex: '\\text{समान शून्यक} \\implies D = 0 \\iff b^2 - 4ac = 0',
        plainText: 'समान शून्यक ⇒ D = 0',
      },
    ],
    footerNote: 'जब दोनों शून्यक बराबर हों (α = β), तब विविक्तकर D शून्य होता है।',
  },
  {
    id: 'card-10',
    number: '10',
    hindiTitle: 'विविक्तकर',
    englishSubtitle: 'Discriminant Formula',
    isVVI: true,
    accentTheme: 'blue',
    iconName: 'calculator',
    formulas: [
      {
        latex: 'D = b^2 - 4ac',
        plainText: 'D = b² − 4ac',
      },
    ],
    footerNote: 'शून्यकों की प्रकृति (वास्तविक, समान या काल्पनिक) निर्धारित करता है।',
  },
  {
    id: 'card-11',
    number: '11',
    hindiTitle: 'घन बहुपद',
    englishSubtitle: 'Cubic Polynomial & Zeroes Relation',
    isVVI: true,
    accentTheme: 'indigo',
    iconName: 'layers',
    leadText: 'यदि शून्यक α, β, γ हैं:',
    formulas: [
      {
        label: 'मानक रूप (Standard Form)',
        latex: 'p(x) = ax^3 + bx^2 + cx + d, \\quad a \\neq 0',
        plainText: 'p(x) = ax³ + bx² + cx + d',
      },
      {
        label: 'शून्यकों का योगफल',
        latex: '\\alpha + \\beta + \\gamma = -\\frac{b}{a}',
        plainText: 'α + β + γ = −b/a',
      },
      {
        label: 'दो-दो शून्यकों के गुणनफलों का योग',
        latex: '\\alpha\\beta + \\beta\\gamma + \\gamma\\alpha = \\frac{c}{a}',
        plainText: 'αβ + βγ + γα = c/a',
      },
      {
        label: 'तीनों शून्यकों का गुणनफल',
        latex: '\\alpha\\beta\\gamma = -\\frac{d}{a}',
        plainText: 'αβγ = −d/a',
      },
    ],
    footerNote: 'घन बहुपद का घात (Degree) = 3 तथा अधिकतम शून्यक = 3 (α, β, γ) होते हैं।',
  },
];

export const MOST_VVI_ITEMS = [
  {
    id: 'vvi-1',
    latex: '\\alpha + \\beta = -\\frac{b}{a}',
    plain: 'α + β = −b/a',
    hint: 'शून्यकों का योगफल',
  },
  {
    id: 'vvi-2',
    latex: '\\alpha\\beta = \\frac{c}{a}',
    plain: 'αβ = c/a',
    hint: 'शून्यकों का गुणनफल',
  },
  {
    id: 'vvi-3',
    latex: 'x^2 - (\\alpha + \\beta)x + \\alpha\\beta',
    plain: 'x² − (α + β)x + αβ',
    hint: 'द्विघात बहुपद सूत्र',
  },
  {
    id: 'vvi-4',
    latex: '\\alpha^2 + \\beta^2 = (\\alpha + \\beta)^2 - 2\\alpha\\beta',
    plain: 'α² + β² = (α + β)² − 2αβ',
    hint: 'शून्यकों के वर्गों का योग',
  },
  {
    id: 'vvi-5',
    latex: 'D = b^2 - 4ac',
    plain: 'D = b² − 4ac',
    hint: 'विविक्तकर (Discriminant)',
  },
  {
    id: 'vvi-6',
    latex: '\\text{समान शून्यक} \\implies D = 0',
    plain: 'समान शून्यक ⇒ D = 0',
    hint: 'समान शून्यक की शर्त',
  },
];

export const CH03_FORMULA_CARDS: FormulaCardData[] = [
  {
    id: 'ch03-card-01',
    number: '01',
    hindiTitle: 'रैखिक समीकरण युग्म का मानक रूप',
    englishSubtitle: 'Standard Form of Pair of Linear Equations',
    isVVI: true,
    accentTheme: 'blue',
    iconName: 'function',
    formulas: [
      {
        label: 'प्रथम एवं द्वितीय समीकरण',
        latex: 'a_1x + b_1y + c_1 = 0, \\quad a_2x + b_2y + c_2 = 0',
        plainText: 'a₁x + b₁y + c₁ = 0 तथा a₂x + b₂y + c₂ = 0',
      },
    ],
    footerNote: 'यहाँ a₁² + b₁² ≠ 0 तथा a₂² + b₂² ≠ 0; प्रत्येक समीकरण का घात = 1 और आलेख = एक सरल रेखा।',
  },
  {
    id: 'ch03-card-02',
    number: '02',
    hindiTitle: 'अद्वितीय हल (अविरोधी युग्म)',
    englishSubtitle: 'Condition for Unique Solution (Intersecting Lines)',
    isVVI: true,
    accentTheme: 'amber',
    iconName: 'target',
    leadText: 'केवल एक हल (अद्वितीय हल) • प्रतिच्छेदी रेखाएँ • संगत (अविरोधी)',
    formulas: [
      {
        latex: '\\frac{a_1}{a_2} \\neq \\frac{b_1}{b_2}',
        plainText: 'a₁ / a₂ ≠ b₁ / b₂',
      },
    ],
    footerNote: 'जब दोनों रेखाएँ एक बिंदु पर काटती हैं, तब केवल एक अद्वितीय हल प्राप्त होता है।',
  },
  {
    id: 'ch03-card-03',
    number: '03',
    hindiTitle: 'अनंततः अनेक हल (आश्रित युग्म)',
    englishSubtitle: 'Condition for Infinite Solutions (Coincident Lines)',
    isVVI: true,
    accentTheme: 'purple',
    iconName: 'layers',
    leadText: 'अनगिनत हल • संपाती रेखाएँ • संगत एवं आश्रित',
    formulas: [
      {
        latex: '\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2}',
        plainText: 'a₁ / a₂ = b₁ / b₂ = c₁ / c₂',
      },
    ],
    footerNote: 'तीनों अनुपात बराबर होने पर दोनों समीकरण एक ही रेखा (संपाती) को निरूपित करते हैं।',
  },
  {
    id: 'ch03-card-04',
    number: '04',
    hindiTitle: 'कोई हल नहीं (विरोधी / असंगत युग्म)',
    englishSubtitle: 'Condition for No Solution (Parallel Lines)',
    isVVI: true,
    accentTheme: 'amber',
    iconName: 'equal',
    leadText: 'कोई हल नहीं (शून्य हल) • समांतर रेखाएँ • असंगत (विरोधी)',
    formulas: [
      {
        latex: '\\frac{a_1}{a_2} = \\frac{b_1}{b_2} \\neq \\frac{c_1}{c_2}',
        plainText: 'a₁ / a₂ = b₁ / b₂ ≠ c₁ / c₂',
      },
    ],
    footerNote: 'समांतर रेखाएँ कभी प्रतिच्छेद नहीं करतीं, अतः समीकरण युग्म असंगत (विरोधी) होता है।',
  },
  {
    id: 'ch03-card-05',
    number: '05',
    hindiTitle: 'वज्र-गुणन सूत्र',
    englishSubtitle: 'Cross-Multiplication Formula',
    isVVI: true,
    accentTheme: 'blue',
    iconName: 'calculator',
    formulas: [
      {
        label: 'वज्र-गुणन अनुपात',
        latex: '\\frac{x}{b_1c_2 - b_2c_1} = \\frac{y}{c_1a_2 - c_2a_1} = \\frac{1}{a_1b_2 - a_2b_1}',
        plainText: 'x/(b₁c₂ − b₂c₁) = y/(c₁a₂ − c₂a₁) = 1/(a₁b₂ − a₂b₁)',
      },
    ],
    footerNote: 'जहाँ a₁b₂ − a₂b₁ ≠ 0। याद रखने की ट्रिक: b → c → a → b (2312 नियम)।',
  },
  {
    id: 'ch03-card-06',
    number: '06',
    hindiTitle: 'अक्षों एवं समांतर रेखाओं के समीकरण',
    englishSubtitle: 'Equations of Axes & Parallel Lines',
    isVVI: true,
    accentTheme: 'purple',
    iconName: 'sigma',
    formulas: [
      {
        label: 'x-अक्ष एवं y-अक्ष का समीकरण',
        latex: '\\text{x-अक्ष: } y = 0 \\quad | \\quad \\text{y-अक्ष: } x = 0',
        plainText: 'x-अक्ष का समीकरण: y = 0 | y-अक्ष का समीकरण: x = 0',
      },
      {
        label: 'अक्षों के समांतर रेखाएँ',
        latex: 'x = a \\text{ (y-अक्ष के समांतर)}, \\quad y = b \\text{ (x-अक्ष के समांतर)}',
        plainText: 'x = a (y-अक्ष के समांतर) | y = b (x-अक्ष के समांतर)',
      },
    ],
    footerNote: 'अचर पद शून्य होने पर रेखा ax + by = 0 मूल बिंदु (0, 0) से होकर गुजरती है।',
  },
  {
    id: 'ch03-card-07',
    number: '07',
    hindiTitle: 'दो अंकों वाली संख्या का सूत्र',
    englishSubtitle: 'Two-Digit Number & Reversed Digits Formula',
    isVVI: true,
    accentTheme: 'amber',
    iconName: 'hash',
    formulas: [
      {
        label: 'मूल संख्या एवं पलटने पर बनी संख्या',
        latex: '\\text{संख्या} = 10x + y, \\quad \\text{पलटने पर} = 10y + x',
        plainText: 'मूल संख्या = 10x + y | अंक पलटने पर संख्या = 10y + x',
      },
    ],
    footerNote: 'दोनों का योग = 11(x + y) [11 से विभाज्य] तथा अंतर = 9|x − y| [9 से विभाज्य]।',
  },
  {
    id: 'ch03-card-08',
    number: '08',
    hindiTitle: 'नाव एवं धारा की चाल का सूत्र',
    englishSubtitle: 'Downstream & Upstream Speed (Boat & Stream)',
    isVVI: true,
    accentTheme: 'blue',
    iconName: 'sparkles',
    formulas: [
      {
        label: 'धारा के अनुकूल (Downstream) एवं प्रतिकूल (Upstream) चाल',
        latex: 'v_{\\text{अनुकूल}} = (x + y)\\text{ km/h}, \\quad v_{\\text{प्रतिकूल}} = (x - y)\\text{ km/h}',
        plainText: 'अनुकूल चाल = (x + y) किमी/घंटा | प्रतिकूल चाल = (x − y) किमी/घंटा',
      },
    ],
    footerNote: 'जहाँ x = शांत जल में नाव की चाल तथा y = धारा की चाल (समय = दूरी / चाल)।',
  },
  {
    id: 'ch03-card-09',
    number: '09',
    hindiTitle: 'सममित समीकरण ट्रिक',
    englishSubtitle: 'Symmetric Linear Equations Shortcut',
    isVVI: false,
    accentTheme: 'purple',
    iconName: 'divide',
    formulas: [
      {
        label: 'px + qy = c₁ तथा qx + py = c₂ के लिए',
        latex: 'x + y = \\frac{c_1 + c_2}{p + q}, \\quad x - y = \\frac{c_1 - c_2}{p - q}',
        plainText: 'x + y = (c₁ + c₂)/(p + q) तथा x − y = (c₁ − c₂)/(p − q)',
      },
    ],
    footerNote: 'एक बार जोड़कर (x + y) और एक बार घटाकर (x − y) तुरंत ज्ञात करें।',
  },
  {
    id: 'ch03-card-10',
    number: '10',
    hindiTitle: 'रैखिक समीकरण में बदलने योग्य रूप',
    englishSubtitle: 'Equations Reducible to Linear Form',
    isVVI: false,
    accentTheme: 'blue',
    iconName: 'boxes',
    formulas: [
      {
        latex: '\\frac{a}{x} + \\frac{b}{y} = c \\implies \\text{मानें } \\frac{1}{x} = u, \\; \\frac{1}{y} = v',
        plainText: '1/x = u तथा 1/y = v रखकर au + bv = c बनाएँ',
      },
    ],
    footerNote: 'u और v का मान निकालने के बाद x = 1/u तथा y = 1/v से अंतिम उत्तर प्राप्त करें।',
  },
  {
    id: 'ch03-card-11',
    number: '11',
    hindiTitle: 'अनुपातों की मास्टर तुलना सारणी',
    englishSubtitle: 'Complete Ratio Comparison Summary',
    isVVI: true,
    accentTheme: 'indigo',
    iconName: 'layers',
    leadText: 'a₁x + b₁y + c₁ = 0 तथा a₂x + b₂y + c₂ = 0 की तीनों स्थितियाँ:',
    formulas: [
      {
        label: '1. अद्वितीय हल (अविरोधी / प्रतिच्छेदी रेखाएँ)',
        latex: '\\frac{a_1}{a_2} \\neq \\frac{b_1}{b_2} \\implies \\text{केवल 1 हल (संगत)}',
        plainText: 'a₁/a₂ ≠ b₁/b₂ ⇒ प्रतिच्छेदी रेखाएँ, केवल 1 हल (संगत / अविरोधी)',
      },
      {
        label: '2. अनंत हल (आश्रित / संपाती रेखाएँ)',
        latex: '\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2} \\implies \\text{अनगिनत हल}',
        plainText: 'a₁/a₂ = b₁/b₂ = c₁/c₂ ⇒ संपाती रेखाएँ, अनंत हल (संगत / आश्रित)',
      },
      {
        label: '3. कोई हल नहीं (विरोधी / समांतर रेखाएँ)',
        latex: '\\frac{a_1}{a_2} = \\frac{b_1}{b_2} \\neq \\frac{c_1}{c_2} \\implies \\text{शून्य हल}',
        plainText: 'a₁/a₂ = b₁/b₂ ≠ c₁/c₂ ⇒ समांतर रेखाएँ, कोई हल नहीं (असंगत / विरोधी)',
      },
      {
        label: '4. पूरक, संपूरक एवं चक्रीय चतुर्भुज कोण',
        latex: 'x + y = 90^\\circ \\text{ (पूरक)}, \\; x + y = 180^\\circ \\text{ (संपूरक)}, \\; \\angle A + \\angle C = 180^\\circ',
        plainText: 'पूरक: x+y=90° | संपूरक: x+y=180° | चक्रीय चतुर्भुज: ∠A+∠C=180°',
      },
    ],
    footerNote: 'बिहार बोर्ड मैट्रिक परीक्षा में इस मास्टर कार्ड से हर साल 5+ प्रश्न पूछे जाते हैं।',
  },
];

export const CH03_MOST_VVI_ITEMS = [
  {
    id: 'ch03-vvi-1',
    latex: '\\frac{a_1}{a_2} \\neq \\frac{b_1}{b_2}',
    plain: 'a₁/a₂ ≠ b₁/b₂ ⇒ अद्वितीय हल',
    hint: 'प्रतिच्छेदी रेखाएँ (अविरोधी / संगत)',
  },
  {
    id: 'ch03-vvi-2',
    latex: '\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2}',
    plain: 'a₁/a₂ = b₁/b₂ = c₁/c₂ ⇒ अनंत हल',
    hint: 'संपाती रेखाएँ (आश्रित / संगत)',
  },
  {
    id: 'ch03-vvi-3',
    latex: '\\frac{a_1}{a_2} = \\frac{b_1}{b_2} \\neq \\frac{c_1}{c_2}',
    plain: 'a₁/a₂ = b₁/b₂ ≠ c₁/c₂ ⇒ कोई हल नहीं',
    hint: 'समांतर रेखाएँ (विरोधी / असंगत)',
  },
  {
    id: 'ch03-vvi-4',
    latex: 'x = \\frac{b_1c_2 - b_2c_1}{a_1b_2 - a_2b_1}',
    plain: 'x = (b₁c₂ − b₂c₁)/(a₁b₂ − a₂b₁)',
    hint: 'वज्र-गुणन सूत्र (Cross-Multiplication)',
  },
  {
    id: 'ch03-vvi-5',
    latex: '\\text{संख्या} = 10x + y',
    plain: 'दो अंकों की संख्या = 10x + y',
    hint: 'अंक पलटने पर बनी संख्या = 10y + x',
  },
  {
    id: 'ch03-vvi-6',
    latex: 'v = (x \\pm y)\\text{ km/h}',
    plain: 'अनुकूल चाल = x+y, प्रतिकूल = x−y',
    hint: 'नाव एवं धारा के प्रश्न',
  },
];

interface Class10MathCh02FormulaNotesPageProps {
  onBack?: () => void;
  onOpenFullChapterNotes?: () => void;
  isEmbedded?: boolean;
  chapterNumber?: 2 | 3;
}

export const Class10MathCh02FormulaNotesPage: React.FC<Class10MathCh02FormulaNotesPageProps> = ({
  onBack,
  onOpenFullChapterNotes,
  isEmbedded = false,
  chapterNumber = 2,
}) => {
  const isCh03 = chapterNumber === 3;
  const activeFormulaCards = isCh03 ? CH03_FORMULA_CARDS : CH02_FORMULA_CARDS;
  const activeMostVviItems = isCh03 ? CH03_MOST_VVI_ITEMS : MOST_VVI_ITEMS;

  const [filterVVIOnly, setFilterVVIOnly] = useState(false);
  const [recallMode, setRecallMode] = useState(false);
  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const visibleCards = React.useMemo(() => {
    if (!filterVVIOnly) return activeFormulaCards;
    return activeFormulaCards.filter((c) => c.isVVI);
  }, [activeFormulaCards, filterVVIOnly]);

  const handleCopyCard = (card: FormulaCardData) => {
    const text = `Card ${card.number} — ${card.hindiTitle}\n${card.formulas
      .map((f) => f.plainText)
      .join('\n')}\n— RK STUDY CENTRE (Class 10 Maths Ch 2)`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(card.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handlePrintA4 = () => {
    window.print();
  };

  const renderCardIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'function':
        return <FunctionSquare className={className} />;
      case 'target':
        return <Compass className={className} />;
      case 'sigma':
        return <Sigma className={className} />;
      case 'layers':
        return <Layers className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'divide':
        return <Divide className={className} />;
      case 'hash':
        return <Hash className={className} />;
      case 'boxes':
        return <Boxes className={className} />;
      case 'equal':
        return <Equal className={className} />;
      case 'calculator':
        return <Calculator className={className} />;
      default:
        return <BookOpen className={className} />;
    }
  };

  const getThemeClasses = (theme: FormulaCardData['accentTheme']) => {
    switch (theme) {
      case 'blue':
        return {
          cardBorder: 'border-blue-200/80 hover:border-blue-400',
          topBar: 'from-blue-600 to-indigo-600',
          badgeBg: 'bg-blue-600 text-white',
          iconBox: 'bg-blue-50 text-blue-700 border-blue-200',
          formulaBox: 'bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/40 border-blue-200/90',
          subtitleText: 'text-blue-700',
        };
      case 'purple':
        return {
          cardBorder: 'border-purple-200/80 hover:border-purple-400',
          topBar: 'from-purple-600 to-indigo-600',
          badgeBg: 'bg-purple-600 text-white',
          iconBox: 'bg-purple-50 text-purple-700 border-purple-200',
          formulaBox: 'bg-gradient-to-br from-purple-50/70 via-white to-fuchsia-50/40 border-purple-200/90',
          subtitleText: 'text-purple-700',
        };
      case 'amber':
        return {
          cardBorder: 'border-amber-300/90 hover:border-amber-400',
          topBar: 'from-amber-500 via-yellow-500 to-orange-500',
          badgeBg: 'bg-amber-500 text-slate-950',
          iconBox: 'bg-amber-50 text-amber-800 border-amber-300',
          formulaBox: 'bg-gradient-to-br from-amber-50/80 via-white to-yellow-50/50 border-amber-300/90',
          subtitleText: 'text-amber-800',
        };
      case 'indigo':
        return {
          cardBorder: 'border-indigo-200/90 hover:border-indigo-400',
          topBar: 'from-indigo-600 via-blue-600 to-purple-600',
          badgeBg: 'bg-indigo-600 text-white',
          iconBox: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          formulaBox: 'bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 border-indigo-200/90',
          subtitleText: 'text-indigo-700',
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-28 print:bg-white print:pb-0">
      {/* =====================================================================
          TOP INTERACTIVE ACTION BAR (Hidden when printing A4 PDF)
         ===================================================================== */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>वापस</span>
              </button>
            )}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="text-blue-700 font-extrabold">RK STUDY CENTRE</span>
              <span aria-hidden="true">·</span>
              <span>CLASS 10 MATHS</span>
              <span aria-hidden="true">·</span>
              <span className="text-purple-700 font-extrabold">
                {isCh03 ? 'CH 03 FORMULA SHEET' : 'CH 02 FORMULA SHEET'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Segmented Filter: All vs VVI */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/70">
              <button
                type="button"
                onClick={() => setFilterVVIOnly(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  !filterVVIOnly
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                सभी सूत्र ({activeFormulaCards.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterVVIOnly(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                  filterVVIOnly
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
                <span>केवल VVI ({activeFormulaCards.filter((c) => c.isVVI).length})</span>
              </button>
            </div>

            {/* Active Recall Toggle */}
            <button
              type="button"
              onClick={() => {
                setRecallMode((prev) => !prev);
                setRevealedCards({});
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-all cursor-pointer ${
                recallMode
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200'
              }`}
              title="सूत्र छिपाकर अपनी याददाश्त की जाँच करें"
            >
              {recallMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{recallMode ? 'सूत्र दिखाएँ' : 'याददाश्त टेस्ट (Recall)'}</span>
            </button>

            {/* Switch to Full Chapter Q&A Notes if callback provided */}
            {onOpenFullChapterNotes && (
              <button
                type="button"
                onClick={onOpenFullChapterNotes}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>500 VVI प्रश्न बैंक व नोट्स</span>
              </button>
            )}

            {/* Print / A4 Export */}
            <button
              type="button"
              onClick={handlePrintA4}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>A4 प्रिंट / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          MAIN DIGITAL NOTES SHEET CONTAINER (A4 & Mobile Responsive)
         ===================================================================== */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-8 print:max-w-none print:px-4 print:pt-2 print:space-y-5">
        {/* Subtle Top Page & Chapter Label Bar */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
          <div className="flex items-center gap-2">
            <span className="text-blue-700 font-extrabold tracking-wider">RK STUDY CENTRE</span>
            <span aria-hidden="true">/</span>
            <span>DIGITAL FORMULA NOTES</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span>{isCh03 ? 'CH 03: LINEAR EQUATIONS' : 'CH 02: POLYNOMIALS'}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-800 font-extrabold">PAGE 01 / 01</span>
          </div>
        </div>

        {/* ===================================================================
            1. HEADER SECTION
           =================================================================== */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 text-white p-6 sm:p-9 shadow-xl border border-indigo-800/70 print:rounded-2xl print:p-6 print:shadow-none">
          {/* Subtle decorative ambient glow */}
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              {/* Top Kicker & VVI • BOARD EXAM Badge */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs sm:text-sm font-extrabold tracking-widest text-blue-300 uppercase">
                  CLASS 10 MATHS
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-400 text-slate-950 text-xs font-black tracking-wide uppercase shadow-sm">
                  <Award className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>VVI • BOARD EXAM</span>
                </span>
              </div>

              {/* Main Chapter Heading */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                {isCh03
                  ? 'CHAPTER 3 — दो चर वाले रैखिक समीकरण युग्म'
                  : 'CHAPTER 2 — बहुपद'}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-xl text-blue-100 font-bold tracking-wide flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
                <span>Formula &amp; Quick Revision Notes</span>
              </p>
            </div>

            {/* Right Summary Box */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 text-left md:min-w-[250px] space-y-2">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                {isCh03 ? 'अध्याय सारांश • LINEAR EQUATIONS' : 'अध्याय सारांश • POLYNOMIALS'}
              </div>
              <div className="text-sm sm:text-base font-extrabold text-white">
                {isCh03
                  ? 'अनुपात तुलना, वज्र-गुणन एवं शाब्दिक सूत्र'
                  : 'द्विघात एवं घन बहुपद के सभी सूत्र'}
              </div>
              <div className="text-xs text-blue-200 font-medium flex items-center gap-2 pt-1 border-t border-white/10">
                <span>11 मुख्य सूत्र कार्ड्स</span>
                <span aria-hidden="true">·</span>
                <span>100% बोर्ड परीक्षा केंद्रित</span>
              </div>
            </div>
          </div>
        </header>

        {/* ===================================================================
            2. FORMULA CARDS SECTION (CARDS 01 TO 11)
           =================================================================== */}
        <section aria-label="Formula Cards" className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                <Sigma className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  महत्वपूर्ण सूत्र कार्ड्स (Master Formula Cards)
                </h2>
                <p className="text-xs text-slate-500 font-semibold">
                  प्रत्येक सूत्र को स्पष्ट गणितीय रूप (LaTeX) में पढ़ें और याद करें
                </p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-slate-500 font-mono">
              Showing {visibleCards.length} / 11 Cards
            </span>
          </div>

          {/* Responsive Grid: Cards 01 to 10 in 2-col grid, Card 11 full-width */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 print:grid-cols-2 print:gap-4">
            {visibleCards.map((card) => {
              const theme = getThemeClasses(card.accentTheme);
              const isFullWidth = card.id === 'card-11' || card.id === 'ch03-card-11';
              const isHiddenInRecall = recallMode && !revealedCards[card.id];

              return (
                <article
                  key={card.id}
                  className={`group relative bg-white/95 backdrop-blur-md rounded-2xl border ${theme.cardBorder} shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between ${
                    isFullWidth ? 'md:col-span-2 print:col-span-2' : ''
                  }`}
                >
                  {/* Top Color Accent Strip */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${theme.topBar}`} />

                  <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                    {/* Card Header: Number Badge + Title + VVI Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`px-2.5 py-1 rounded-xl font-mono font-black text-xs sm:text-sm tracking-wider shadow-2xs shrink-0 flex items-center gap-1.5 ${theme.badgeBg}`}
                        >
                          {renderCardIcon(card.iconName, 'w-3.5 h-3.5')}
                          <span>Card {card.number}</span>
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                            {card.hindiTitle}
                          </h3>
                          <p className={`text-xs font-bold ${theme.subtitleText}`}>
                            {card.englishSubtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {card.isVVI && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-xs tracking-wide shadow-2xs">
                            <Flame className="w-3.5 h-3.5 text-orange-700 fill-orange-600" />
                            <span>VVI</span>
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopyCard(card)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer print:hidden"
                          title="सूत्र कॉपी करें"
                        >
                          {copiedId === card.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Optional Lead Text (e.g. Card 02, Card 09, Card 11) */}
                    {card.leadText && (
                      <div className="text-sm sm:text-base font-extrabold text-slate-800 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
                        {card.leadText}
                      </div>
                    )}

                    {/* Formula Visual Focus Area */}
                    {isHiddenInRecall ? (
                      <button
                        type="button"
                        onClick={() =>
                          setRevealedCards((prev) => ({ ...prev, [card.id]: true }))
                        }
                        className="w-full py-6 px-4 rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50/60 hover:bg-purple-100/70 text-purple-900 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-purple-700" />
                        <span>सूत्र देखने के लिए टैप करें (Tap to Reveal Formula)</span>
                      </button>
                    ) : (
                      <div
                        className={
                          isFullWidth
                            ? 'grid grid-cols-1 sm:grid-cols-2 gap-3.5'
                            : 'space-y-3'
                        }
                      >
                        {card.formulas.map((f, fIdx) => (
                          <div
                            key={fIdx}
                            className={`rounded-xl border p-4 sm:p-4 ${theme.formulaBox} flex flex-col justify-center ${
                              isFullWidth && fIdx === 0 ? 'sm:col-span-2' : ''
                            }`}
                          >
                            {f.label && (
                              <span className="text-xs font-extrabold text-slate-500 mb-1.5 block">
                                {f.label}:
                              </span>
                            )}
                            {/* High-Impact LaTeX Mathematical Typesetting */}
                            <div className="text-xl sm:text-2xl md:text-[26px] font-black text-slate-950 overflow-x-auto py-1">
                              <LatexFormula math={f.latex} block={false} />
                            </div>
                            {/* Clear Hindi/Unicode Readability Line */}
                            <div className="text-xs sm:text-sm font-bold text-slate-600 mt-1.5 pt-1.5 border-t border-slate-200/60 font-mono">
                              {f.plainText}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Subtle Explanatory Note */}
                    {card.footerNote && (
                      <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed pt-1">
                        {card.footerNote}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ===================================================================
            3. “याद रखने की Trick” SECTION (QUADRATIC vs CUBIC)
           =================================================================== */}
        <section
          aria-label="याद रखने की Trick"
          className="rounded-3xl bg-white border-2 border-purple-200/90 shadow-md overflow-hidden"
        >
          <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs">
                <Lightbulb className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  याद रखने की Trick (Memory Trick)
                </h2>
                <p className="text-xs sm:text-sm text-purple-100 font-semibold">
                  द्विघात (Quadratic) और घन (Cubic) बहुपद के सूत्रों की सीधी तुलना
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-lg bg-white/15 border border-white/20 text-amber-300 text-xs font-black tracking-wide">
              चिन्ह नियम: [ − , + , − ]
            </span>
          </div>

          <div className="p-6 sm:p-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QUADRATIC CARD */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/60 border-2 border-blue-300 p-5 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-blue-200 pb-3">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-blue-700 block">
                      द्विघात बहुपद (घात = 2)
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                      QUADRATIC:
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-mono text-xs font-black">
                    ax² + bx + c
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="bg-white rounded-xl p-4 border border-blue-200 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xl sm:text-2xl font-black text-slate-950">
                        <LatexFormula math="\alpha + \beta = -\frac{b}{a}" />
                      </div>
                      <div className="text-xs font-bold text-slate-500 font-mono mt-1">
                        α + β = −b/a
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black">
                      चिन्ह: (−)
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-blue-200 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xl sm:text-2xl font-black text-slate-950">
                        <LatexFormula math="\alpha\beta = \frac{c}{a}" />
                      </div>
                      <div className="text-xs font-bold text-slate-500 font-mono mt-1">
                        αβ = c/a
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
                      चिन्ह: (+)
                    </span>
                  </div>
                </div>
              </div>

              {/* CUBIC CARD */}
              <div className="rounded-2xl bg-gradient-to-br from-purple-50/90 via-white to-fuchsia-50/60 border-2 border-purple-300 p-5 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-purple-200 pb-3">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-purple-700 block">
                      घन बहुपद (घात = 3)
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                      CUBIC:
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-mono text-xs font-black">
                    ax³ + bx² + cx + d
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="bg-white rounded-xl p-3.5 border border-purple-200 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg sm:text-xl font-black text-slate-950">
                        <LatexFormula math="\alpha + \beta + \gamma = -\frac{b}{a}" />
                      </div>
                      <div className="text-xs font-bold text-slate-500 font-mono mt-0.5">
                        α + β + γ = −b/a
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black">
                      1st: (−)
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-3.5 border border-purple-200 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg sm:text-xl font-black text-slate-950">
                        <LatexFormula math="\alpha\beta + \beta\gamma + \gamma\alpha = \frac{c}{a}" />
                      </div>
                      <div className="text-xs font-bold text-slate-500 font-mono mt-0.5">
                        αβ + βγ + γα = c/a
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
                      2nd: (+)
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-3.5 border border-purple-200 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg sm:text-xl font-black text-slate-950">
                        <LatexFormula math="\alpha\beta\gamma = -\frac{d}{a}" />
                      </div>
                      <div className="text-xs font-bold text-slate-500 font-mono mt-0.5">
                        αβγ = −d/a
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black">
                      3rd: (−)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Golden Memory Tip Bar */}
            <div className="rounded-2xl bg-amber-50/90 border border-amber-300 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm font-bold text-amber-950">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Golden Trick:</strong> हर सूत्र के बटा (Denominator) में हमेशा{' '}
                  <code className="font-mono font-black text-blue-800">a</code> रहता है, और चिन्ह क्रमशः{' '}
                  <code className="font-mono font-black text-rose-700">−b/a</code>,{' '}
                  <code className="font-mono font-black text-emerald-700">+c/a</code>,{' '}
                  <code className="font-mono font-black text-rose-700">−d/a</code> चलता है!
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            4. “🔥 सबसे VVI” SECTION (Sticky-Looking Quick Revision Section)
           =================================================================== */}
        <section
          aria-label="सबसे VVI Quick Revision"
          className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-6 sm:p-8 shadow-2xl border-2 border-amber-400/80 ring-4 ring-amber-400/15"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-md">
                🔥
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    🔥 सबसे VVI — Quick Revision
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-xs font-black uppercase">
                    Must Remember
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-blue-200 font-semibold">
                  परीक्षा हॉल में जाने से पहले इन 6 सूत्रों को एक नज़र में ज़रूर दोहराएँ
                </p>
              </div>
            </div>

            <span className="text-xs font-extrabold text-amber-300 font-mono uppercase tracking-wider">
              6 Board Exam Sure-Shot Formulas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
            {activeMostVviItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 p-4 flex items-start gap-3 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-2xs">
                  ✓
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="text-lg sm:text-xl font-black text-white overflow-x-auto">
                    <LatexFormula math={item.latex} />
                  </div>
                  <div className="text-xs font-bold text-amber-300 font-mono">
                    ✓ {item.plain}
                  </div>
                  <div className="text-[11px] font-semibold text-blue-200">
                    {item.hint}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================================
            5. FOOTER SECTION
           =================================================================== */}
        <footer className="rounded-2xl bg-white border border-slate-200/90 px-6 py-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-purple-700 text-white flex items-center justify-center font-black text-base shadow-xs shrink-0">
              RK
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                RK STUDY CENTRE
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-600">
                Class 9–12 | Smart Learning • Better Results
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1 text-blue-700 font-extrabold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isCh03 ? 'CLASS 10 MATHS • CHAPTER 3' : 'CLASS 10 MATHS • CHAPTER 2'}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-800 font-extrabold">Page 01</span>
          </div>
        </footer>
      </main>

      {/* =====================================================================
          STICKY BOTTOM QUICK REVISION BAR (Mobile & Desktop Viewport Dock)
         ===================================================================== */}
      {!isEmbedded && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-slate-950/95 backdrop-blur-md border-t border-amber-400/40 text-white py-2.5 px-4 shadow-2xl print:hidden">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-xs">
                🔥 QUICK REVISION
              </span>
              <span className="text-xs font-extrabold text-amber-200 hidden sm:inline">
                सबसे VVI सूत्र:
              </span>
            </div>

            {isCh03 ? (
              <div className="flex items-center gap-4 text-xs sm:text-sm font-mono font-bold text-white shrink-0">
                <span className="text-amber-300">✓ a₁/a₂ ≠ b₁/b₂ (अद्वितीय)</span>
                <span className="text-slate-600">|</span>
                <span className="text-blue-300">✓ a₁/a₂ = b₁/b₂ = c₁/c₂ (अनंत)</span>
                <span className="text-slate-600">|</span>
                <span className="text-purple-300">✓ a₁/a₂ = b₁/b₂ ≠ c₁/c₂ (कोई हल नहीं)</span>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-300">✓ संख्या = 10x + y</span>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-xs sm:text-sm font-mono font-bold text-white shrink-0">
                <span className="text-amber-300">✓ α + β = −b/a</span>
                <span className="text-slate-600">|</span>
                <span className="text-blue-300">✓ αβ = c/a</span>
                <span className="text-slate-600">|</span>
                <span className="text-purple-300">✓ x² − (α + β)x + αβ</span>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-300">✓ α² + β² = (α + β)² − 2αβ</span>
                <span className="text-slate-600">|</span>
                <span className="text-amber-300">✓ समान शून्यक ⇒ D = 0</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const Class10MathCh03FormulaNotesPage: React.FC<Omit<Class10MathCh02FormulaNotesPageProps, 'chapterNumber'>> = (
  props
) => <Class10MathCh02FormulaNotesPage {...props} chapterNumber={3} />;
