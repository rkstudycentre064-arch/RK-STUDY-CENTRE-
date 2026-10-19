import type { TestItem, TestQuestion } from '../types';

export interface Full100ObjectiveQuestion {
  id: number;
  question: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  yearAsked: string;
}

export const CLASS_12_PHYSICS_CH01_100_OBJECTIVES: Full100ObjectiveQuestion[] = [
  // 1-15: Basic Electrostatics, Charge Properties & Quantization
  {
    id: 1,
    question: 'वैद्युत आवेश (Electric Charge) का SI मात्रक क्या होता है?',
    options: [
      { key: 'A', text: 'कूलॉम (Coulomb - C)' },
      { key: 'B', text: 'फैराडे (Faraday)' },
      { key: 'C', text: 'एम्पीयर (Ampere)' },
      { key: 'D', text: 'वोल्ट (Volt)' }
    ],
    correctOption: 'A',
    explanation: 'वैद्युत आवेश का SI मात्रक कूलॉम (C = A·s) होता है।',
    yearAsked: 'BSEB 2024A, 2021A, 2018A'
  },
  {
    id: 2,
    question: 'मूल आवेश (Elementary Charge, e) का परिमाण कितना होता है?',
    options: [
      { key: 'A', text: '1.6 × 10⁻¹⁹ C' },
      { key: 'B', text: '1.6 × 10⁻¹⁸ C' },
      { key: 'C', text: '9.1 × 10⁻³¹ C' },
      { key: 'D', text: '4.8 × 10⁻¹⁰ C' }
    ],
    correctOption: 'A',
    explanation: 'एक इलेक्ट्रॉन या प्रोटॉन पर आवेश का परिमाण e = 1.6 × 10⁻¹⁹ C होता है।',
    yearAsked: 'BSEB 2023A, 2019A, 2016A'
  },
  {
    id: 3,
    question: 'आवेश का परिमाणीकरण (Quantization of Charge) किस सूत्र द्वारा व्यक्त किया जाता है?',
    options: [
      { key: 'A', text: 'q = ± n·e' },
      { key: 'B', text: 'q = n / e' },
      { key: 'C', text: 'q = e / n' },
      { key: 'D', text: 'q = n²·e' }
    ],
    correctOption: 'A',
    explanation: 'प्रकृति में किसी वस्तु पर कुल आवेश मूल आवेश e का पूर्ण गुणज होता है: q = ± ne (n = 1, 2, 3...)।',
    yearAsked: 'BSEB 2024A, 2020A, 2017A'
  },
  {
    id: 4,
    question: 'निम्नलिखित में से कौन-सा आवेश किसी वस्तु पर संभव नहीं है?',
    options: [
      { key: 'A', text: '2.4 × 10⁻¹⁹ C' },
      { key: 'B', text: '4.8 × 10⁻¹⁹ C' },
      { key: 'C', text: '6.4 × 10⁻¹⁹ C' },
      { key: 'D', text: '3.2 × 10⁻¹⁹ C' }
    ],
    correctOption: 'A',
    explanation: 'n = q/e = (2.4 × 10⁻¹⁹)/(1.6 × 10⁻¹⁹) = 1.5, जो पूर्णांक नहीं है। अतः यह मान संभव नहीं है।',
    yearAsked: 'BSEB 2024A, 2021A, 2018A'
  },
  {
    id: 5,
    question: '1 कूलॉम (1 C) ऋणावेश में कितने इलेक्ट्रॉनों की अधिकता होती है?',
    options: [
      { key: 'A', text: '6.25 × 10¹⁸ इलेक्ट्रॉन' },
      { key: 'B', text: '1.6 × 10⁻¹⁹ इलेक्ट्रॉन' },
      { key: 'C', text: '6.25 × 10¹⁹ इलेक्ट्रॉन' },
      { key: 'D', text: '9.1 × 10³¹ इलेक्ट्रॉन' }
    ],
    correctOption: 'A',
    explanation: 'n = q / e = 1 / (1.6 × 10⁻¹⁹) = 6.25 × 10¹⁸ इलेक्ट्रॉन।',
    yearAsked: 'BSEB 2023A, 2020A, 2015A'
  },
  {
    id: 6,
    question: 'आवेश का CGS स्थिरवैद्युत मात्रक (e.s.u. या statC) में 1 कूलॉम का मान कितना होता है?',
    options: [
      { key: 'A', text: '3 × 10⁹ statC' },
      { key: 'B', text: '1/3 × 10⁻⁹ statC' },
      { key: 'C', text: '3 × 10¹⁰ statC' },
      { key: 'D', text: '9 × 10⁹ statC' }
    ],
    correctOption: 'A',
    explanation: '1 C = 3 × 10⁹ e.s.u. (स्टेटकूलॉम)।',
    yearAsked: 'BSEB 2022A, 2019A, 2017A'
  },
  {
    id: 7,
    question: 'आवेश की विमा (Dimensional Formula of Charge) क्या होती है?',
    options: [
      { key: 'A', text: '[A T] या [I T]' },
      { key: 'B', text: '[A T⁻¹]' },
      { key: 'C', text: '[A⁻¹ T]' },
      { key: 'D', text: '[M L T A]' }
    ],
    correctOption: 'A',
    explanation: 'q = I × t ⟹ [q] = [A T]।',
    yearAsked: 'BSEB 2024A, 2021A, 2019A'
  },
  {
    id: 8,
    question: 'आवेश का सबसे बड़ा व्यावहारिक मात्रक कौन-सा है?',
    options: [
      { key: 'A', text: 'फैराडे (Faraday)' },
      { key: 'B', text: 'कूलॉम (Coulomb)' },
      { key: 'C', text: 'स्टेटकूलॉम (statC)' },
      { key: 'D', text: 'एब्कूलॉम (abC)' }
    ],
    correctOption: 'A',
    explanation: '1 फैराडे (F) ≈ 96500 C होता है, जो 1 मोल इलेक्ट्रॉनों का आवेश है।',
    yearAsked: 'BSEB 2023A, 2018A'
  },
  {
    id: 9,
    question: 'किसी अनावेशित वस्तु को धनावेशित करने पर उसका द्रव्यमान (Mass):',
    options: [
      { key: 'A', text: 'घटता है (Decreases)' },
      { key: 'B', text: 'बढ़ता है (Increases)' },
      { key: 'C', text: 'अपरिवर्तित रहता है' },
      { key: 'D', text: 'दोगुना हो जाता है' }
    ],
    correctOption: 'A',
    explanation: 'धनावेशित होने पर वस्तु से इलेक्ट्रॉन बाहर निकलते हैं, अतः द्रव्यमान में अत्यंत सूक्ष्म कमी आती है।',
    yearAsked: 'BSEB 2022A, 2018A, 2016A'
  },
  {
    id: 10,
    question: 'किसी वस्तु को ऋणावेशित करने पर उसका द्रव्यमान:',
    options: [
      { key: 'A', text: 'बढ़ता है (Increases)' },
      { key: 'B', text: 'घटता है' },
      { key: 'C', text: 'समान रहता है' },
      { key: 'D', text: 'शून्य हो जाता है' }
    ],
    correctOption: 'A',
    explanation: 'ऋणावेशित होने पर वस्तु अतिरिक्त इलेक्ट्रॉन ग्रहण करती है, जिससे उसका द्रव्यमान थोड़ा बढ़ जाता है।',
    yearAsked: 'BSEB 2024A, 2020A'
  },
  {
    id: 11,
    question: 'इलेक्ट्रॉन के विशिष्ट आवेश (Specific Charge of Electron, e/m) का मान कितना होता है?',
    options: [
      { key: 'A', text: '1.76 × 10¹¹ C/kg' },
      { key: 'B', text: '1.6 × 10⁻¹⁹ C/kg' },
      { key: 'C', text: '9.1 × 10⁻³¹ C/kg' },
      { key: 'D', text: '1.76 × 10⁻¹¹ C/kg' }
    ],
    correctOption: 'A',
    explanation: 'विशिष्ट आवेश e/m = (1.6 × 10⁻¹⁹) / (9.1 × 10⁻³¹) = 1.76 × 10¹¹ C/kg।',
    yearAsked: 'BSEB 2023A, 2019A, 2017A'
  },
  {
    id: 12,
    question: 'काँच की छड़ को रेशम के कपड़े से रगड़ने पर काँच की छड़ पर कौन-सा आवेश आता है?',
    options: [
      { key: 'A', text: 'धनावेश (+ve charge)' },
      { key: 'B', text: 'ऋणावेश (-ve charge)' },
      { key: 'C', text: 'कोई आवेश नहीं' },
      { key: 'D', text: 'दोनों प्रकार का आवेश' }
    ],
    correctOption: 'A',
    explanation: 'काँच की छड़ से इलेक्ट्रॉन रेशम के कपड़े पर चले जाते हैं, इसलिए काँच धनावेशित हो जाता है।',
    yearAsked: 'BSEB 2021A, 2017A'
  },
  {
    id: 13,
    question: 'एबोनाइट की छड़ को बिल्ली की खाल (फर) से रगड़ने पर एबोनाइट छड़ पर कौन-सा आवेश आता है?',
    options: [
      { key: 'A', text: 'ऋणावेश (-ve charge)' },
      { key: 'B', text: 'धनावेश (+ve charge)' },
      { key: 'C', text: 'शून्य' },
      { key: 'D', text: 'उदासीन' }
    ],
    correctOption: 'A',
    explanation: 'एबोनाइट छड़ बिल्ली की खाल से इलेक्ट्रॉन ग्रहण कर ऋणावेशित हो जाती है।',
    yearAsked: 'BSEB 2020A, 2016A'
  },
  {
    id: 14,
    question: 'स्थिर वैद्युत प्रेरण (Electrostatic Induction) द्वारा किसी चालक पर आवेश उत्पन्न करने में:',
    options: [
      { key: 'A', text: 'चालक का कोई आवेश क्षय नहीं होता' },
      { key: 'B', text: 'प्रेरक वस्तु का आवेश समाप्त हो जाता है' },
      { key: 'C', text: 'केवल समान प्रकृति का आवेश उत्पन्न होता है' },
      { key: 'D', text: 'द्रव्यमान में भारी कमी आती है' }
    ],
    correctOption: 'A',
    explanation: 'प्रेरण में संपर्क किए बिना विपरीत प्रकृति का आवेश उत्पन्न होता है तथा प्रेरक वस्तु का आवेश सुरक्षित रहता है।',
    yearAsked: 'BSEB 2022A, 2018A'
  },
  {
    id: 15,
    question: 'विद्युत आवेश के योज्यता के गुण (Additivity of Charge) का क्या अर्थ है?',
    options: [
      { key: 'A', text: 'निकाय का कुल आवेश सभी आवेशों का बीजगणितीय योग (Algebraic Sum) होता है' },
      { key: 'B', text: 'आवेश का सदिश योग होता है' },
      { key: 'C', text: 'आवेश का केवल गुणनफल होता है' },
      { key: 'D', text: 'आवेश कभी जुड़ नहीं सकते' }
    ],
    correctOption: 'A',
    explanation: 'आवेश एक अदिश राशि है, अतः कुल आवेश Q = q₁ + q₂ + q₃ + ... (बीजगणितीय योग) होता है।',
    yearAsked: 'BSEB 2023A, 2019A'
  },

  // 16-30: Coulomb's Law, Dielectric Constant & Superposition Principle
  {
    id: 16,
    question: 'स्थिरवैद्युत बल के कूलॉम के नियम का सूत्र क्या है?',
    options: [
      { key: 'A', text: 'F = (1 / 4πε₀) · (|q₁q₂| / r²)' },
      { key: 'B', text: 'F = (1 / 4πε₀) · (|q₁q₂| / r)' },
      { key: 'C', text: 'F = (1 / 4πε₀) · (|q₁q₂| / r³)' },
      { key: 'D', text: 'F = q₁q₂ / r²' }
    ],
    correctOption: 'A',
    explanation: 'दो स्थिर बिंदु आवेशों के बीच बल F = (1/4πε₀) · (q₁q₂/r²) होता है।',
    yearAsked: 'BSEB 2024A, 2021A, 2017A'
  },
  {
    id: 17,
    question: 'मुक्त आकाश (निर्वात) की विद्युतशीलता (Permittivity of Free Space, ε₀) का SI मान क्या है?',
    options: [
      { key: 'A', text: '8.854 × 10⁻¹² C²/N·m² (या F/m)' },
      { key: 'B', text: '9 × 10⁹ N·m²/C²' },
      { key: 'C', text: '8.854 × 10⁻⁹ C²/N·m²' },
      { key: 'D', text: '1.6 × 10⁻¹⁹ C²/N·m²' }
    ],
    correctOption: 'A',
    explanation: 'ε₀ = 8.854 × 10⁻¹² C²/(N·m²) या F/m।',
    yearAsked: 'BSEB 2024A, 2022A, 2019A'
  },
  {
    id: 18,
    question: '1 / (4πε₀) का मान कितना होता है?',
    options: [
      { key: 'A', text: '9 × 10⁹ N·m²/C²' },
      { key: 'B', text: '9 × 10⁻⁹ N·m²/C²' },
      { key: 'C', text: '8.854 × 10⁻¹² N·m²/C²' },
      { key: 'D', text: '1.6 × 10⁻¹⁹ N·m²/C²' }
    ],
    correctOption: 'A',
    explanation: '1/(4πε₀) = 9 × 10⁹ N·m²/C²।',
    yearAsked: 'BSEB 2023A, 2020A, 2016A'
  },
  {
    id: 19,
    question: 'ε₀ की विमा (Dimensional Formula of ε₀) क्या होती है?',
    options: [
      { key: 'A', text: '[M⁻¹ L⁻³ T⁴ A²]' },
      { key: 'B', text: '[M L³ T⁻⁴ A⁻²]' },
      { key: 'C', text: '[M⁻¹ L³ T⁻⁴ A²]' },
      { key: 'D', text: '[M L² T⁻³ A⁻¹]' }
    ],
    correctOption: 'A',
    explanation: 'ε₀ = q² / (4π F r²) ⟹ [A² T²] / ([M L T⁻²] [L²]) = [M⁻¹ L⁻³ T⁴ A²]।',
    yearAsked: 'BSEB 2024A, 2022A, 2018A'
  },
  {
    id: 20,
    question: 'धातुओं (Conductors / Metals) का परावैद्युतांक (Dielectric Constant, K) कितना होता है?',
    options: [
      { key: 'A', text: 'अनंत (Infinity, ∞)' },
      { key: 'B', text: '1' },
      { key: 'C', text: '0' },
      { key: 'D', text: '80' }
    ],
    correctOption: 'A',
    explanation: 'शुद्ध चालक धातुओं के लिए आपेक्षिक विद्युतशीलता K = ∞ होती है।',
    yearAsked: 'BSEB 2024A, 2021A, 2018A, 2015A'
  },
  {
    id: 21,
    question: 'शुद्ध जल का परावैद्युतांक (Dielectric Constant of Water, K) लगभग कितना होता है?',
    options: [
      { key: 'A', text: '80 या 81' },
      { key: 'B', text: '1' },
      { key: 'C', text: 'अनंत (∞)' },
      { key: 'D', text: '0' }
    ],
    correctOption: 'A',
    explanation: 'कमरे के ताप पर शुद्ध जल का परावैद्युतांक K ≈ 80 (या 81) होता है।',
    yearAsked: 'BSEB 2023A, 2020A, 2016A'
  },
  {
    id: 22,
    question: 'यदि दो आवेशों के बीच माध्यम का परावैद्युतांक K हो, तो उनके बीच बल (F_med):',
    options: [
      { key: 'A', text: 'F_vac / K (घट जाता है)' },
      { key: 'B', text: 'K · F_vac (बढ़ जाता है)' },
      { key: 'C', text: 'अपरिवर्तित रहता है' },
      { key: 'D', text: 'K² गुना हो जाता है' }
    ],
    correctOption: 'A',
    explanation: 'F_med = F_vac / K। माध्यम रखने पर स्थिरवैद्युत बल K गुना कम हो जाता है।',
    yearAsked: 'BSEB 2024A, 2021A, 2017A'
  },
  {
    id: 23,
    question: 'यदि दो बिंदु आवेशों के बीच की दूरी आधी (r → r/2) कर दी जाए, तो उनके बीच बल कितना हो जाएगा?',
    options: [
      { key: 'A', text: '4 गुना (4 F)' },
      { key: 'B', text: '2 गुना (2 F)' },
      { key: 'C', text: 'आधा (F/2)' },
      { key: 'D', text: 'चौथाई (F/4)' }
    ],
    correctOption: 'A',
    explanation: 'F ∝ 1/r²। अतः F\' = F / (1/2)² = 4F।',
    yearAsked: 'BSEB 2024A, 2022A, 2019A'
  },
  {
    id: 24,
    question: 'यदि दो बिंदु आवेशों के परिमाण को दोगुना तथा दूरी को दोगुना कर दिया जाए, तो बल:',
    options: [
      { key: 'A', text: 'समान रहेगा (Unchanged)' },
      { key: 'B', text: '4 गुना हो जाएगा' },
      { key: 'C', text: 'दोगुना हो जाएगा' },
      { key: 'D', text: 'आधा हो जाएगा' }
    ],
    correctOption: 'A',
    explanation: 'F\' = k · (2q₁)(2q₂) / (2r)² = 4k q₁q₂ / 4r² = F।',
    yearAsked: 'BSEB 2023A, 2020A'
  },
  {
    id: 25,
    question: 'कूलॉम बल (Coulomb Force) किस प्रकार का बल है?',
    options: [
      { key: 'A', text: 'केंद्रीय बल एवं विद्युत बल दोनों' },
      { key: 'B', text: 'केवल केंद्रीय बल' },
      { key: 'C', text: 'केवल विद्युत बल' },
      { key: 'D', text: 'गैर-संरक्षी बल' }
    ],
    correctOption: 'A',
    explanation: 'कूलॉम बल दोनों आवेशों को मिलाने वाली रेखा के अनुदिश कार्य करता है (केंद्रीय बल) तथा संरक्षी विद्युत बल है।',
    yearAsked: 'BSEB 2024A, 2021A, 2018A'
  },
  {
    id: 26,
    question: 'कूलॉम के नियम की सदिश अभिव्यक्ति (Vector Form) में F₁₂ का सही रूप क्या है?',
    options: [
      { key: 'A', text: 'F₁₂ = (1 / 4πε₀) · (q₁q₂ / r₁₂²) · r̂₁₂' },
      { key: 'B', text: 'F₁₂ = (1 / 4πε₀) · (q₁q₂ / r₁₂³) · r̂₁₂' },
      { key: 'C', text: 'F₁₂ = q₁q₂ · r₁₂' },
      { key: 'D', text: 'F₁₂ = (1 / 4πε₀) · (q₁q₂ / r₁₂)' }
    ],
    correctOption: 'A',
    explanation: 'सदिश रूप में F₁₂ = (1/4πε₀) · (q₁q₂/r²) · r̂ = (1/4πε₀) · (q₁q₂/r³) · r⃗।',
    yearAsked: 'BSEB 2023A, 2019A'
  },
  {
    id: 27,
    question: 'कूलॉम का नियम न्यूटन के किस गति नियम का पालन करता है?',
    options: [
      { key: 'A', text: 'तृतीय गति नियम (F₁₂ = - F₂₁)' },
      { key: 'B', text: 'प्रथम गति नियम' },
      { key: 'C', text: 'द्वितीय गति नियम' },
      { key: 'D', text: 'गुरुत्वाकर्षण नियम' }
    ],
    correctOption: 'A',
    explanation: 'दो आवेशों पर लगने वाले बल परिमाण में बराबर तथा दिशा में विपरीत होते हैं (F₁₂ = -F₂₁)।',
    yearAsked: 'BSEB 2022A, 2017A'
  },
  {
    id: 28,
    question: 'दो प्रोटॉनों के बीच स्थिरवैद्युत बल तथा गुरुत्वाकर्षण बल का अनुपात (Fe / Fg) लगभग कितना होता है?',
    options: [
      { key: 'A', text: '10³⁶' },
      { key: 'B', text: '10⁴²' },
      { key: 'C', text: '10²⁴' },
      { key: 'D', text: '1' }
    ],
    correctOption: 'A',
    explanation: 'दो प्रोटॉनों के लिए Fe/Fg ≈ 10³⁶ तथा दो इलेक्ट्रॉनों के लिए Fe/Fg ≈ 10⁴² होता है।',
    yearAsked: 'BSEB 2024A, 2020A'
  },
  {
    id: 29,
    question: 'अध्यारोपण का सिद्धांत (Principle of Superposition) क्या व्यक्त करता है?',
    options: [
      { key: 'A', text: 'किसी आवेश पर कुल बल सभी आवेशों द्वारा लगाए गए अलग-अलग बलों का सदिश योग होता है' },
      { key: 'B', text: 'सभी बलों का गुणनफल' },
      { key: 'C', text: 'केवल दो आवेशों का बल' },
      { key: 'D', text: 'कुल बल हमेशा शून्य होता है' }
    ],
    correctOption: 'A',
    explanation: 'F_total = F₁ + F₂ + F₃ + ... (बलों का सदिश योग)।',
    yearAsked: 'BSEB 2023A, 2019A'
  },
  {
    id: 30,
    question: 'दो आवेश +q तथा +4q एक-दूसरे से r दूरी पर हैं। तीसरे आवेश को कहाँ रखें ताकि वह संतुलन में रहे?',
    options: [
      { key: 'A', text: '+q से r/3 दूरी पर' },
      { key: 'B', text: '+q से r/2 दूरी पर' },
      { key: 'C', text: '+q से 2r/3 दूरी पर' },
      { key: 'D', text: '+4q से r/4 दूरी पर' }
    ],
    correctOption: 'A',
    explanation: 'x = r / (√(q₂/q₁) + 1) = r / (√(4/1) + 1) = r / (2+1) = r/3।',
    yearAsked: 'BSEB 2024A, 2021A'
  },

  // 31-45: Electric Field Intensity & Properties
  {
    id: 31,
    question: 'वैद्युत क्षेत्र की तीव्रता (Electric Field Intensity, E) का SI मात्रक क्या है?',
    options: [
      { key: 'A', text: 'N/C या V/m (न्यूटन/कूलॉम या वोल्ट/मीटर)' },
      { key: 'B', text: 'J/C' },
      { key: 'C', text: 'C/N' },
      { key: 'D', text: 'V·m' }
    ],
    correctOption: 'A',
    explanation: 'E = F/q₀ ⟹ N/C तथा E = -dV/dr ⟹ V/m।',
    yearAsked: 'BSEB 2024A, 2021A, 2018A'
  },
  {
    id: 32,
    question: 'वैद्युत क्षेत्र की तीव्रता की विमा (Dimensional Formula of E) क्या है?',
    options: [
      { key: 'A', text: '[M L T⁻³ A⁻¹]' },
      { key: 'B', text: '[M L T⁻² A⁻¹]' },
      { key: 'C', text: '[M L² T⁻³ A⁻¹]' },
      { key: 'D', text: '[M L T⁻³ A]' }
    ],
    correctOption: 'A',
    explanation: '[E] = [F]/[q] = [M L T⁻²] / [A T] = [M L T⁻³ A⁻¹]।',
    yearAsked: 'BSEB 2024A, 2022A, 2019A'
  },
  {
    id: 33,
    question: 'बिंदु आवेश q से r दूरी पर उत्पन्न वैद्युत क्षेत्र की तीव्रता E किसके समानुपाती होती है?',
    options: [
      { key: 'A', text: '1 / r²' },
      { key: 'B', text: '1 / r' },
      { key: 'C', text: '1 / r³' },
      { key: 'D', text: 'r²' }
    ],
    correctOption: 'A',
    explanation: 'बिंदु आवेश के कारण E = (1/4πε₀) · (q/r²) ⟹ E ∝ 1/r²।',
    yearAsked: 'BSEB 2023A, 2020A, 2016A'
  },
  {
    id: 34,
    question: 'वैद्युत क्षेत्र की तीव्रता एक कैसी भौतिक राशि है?',
    options: [
      { key: 'A', text: 'सदिश राशि (Vector Quantity)' },
      { key: 'B', text: 'अदिश राशि (Scalar Quantity)' },
      { key: 'C', text: 'प्रदेश (Tensor)' },
      { key: 'D', text: 'विमाहीन राशि' }
    ],
    correctOption: 'A',
    explanation: 'वैद्युत क्षेत्र की तीव्रता में परिमाण व दिशा दोनों होते हैं, अतः यह सदिश राशि है।',
    yearAsked: 'BSEB 2022A, 2018A'
  },
  {
    id: 35,
    question: 'एक धनावेशित कण पर वैद्युत क्षेत्र के कारण लगने वाले बल की दिशा क्या होती है?',
    options: [
      { key: 'A', text: 'वैद्युत क्षेत्र की दिशा में (Along E)' },
      { key: 'B', text: 'वैद्युत क्षेत्र के विपरीत' },
      { key: 'C', text: 'क्षेत्र के लंबवत' },
      { key: 'D', text: 'अनिश्चित' }
    ],
    correctOption: 'A',
    explanation: 'F⃗ = q E⃗। धनावेश (+q) पर बल क्षेत्र की दिशा में तथा ऋणावेश (-q) पर विपरीत दिशा में लगता है।',
    yearAsked: 'BSEB 2023A, 2019A'
  },
  {
    id: 36,
    question: 'एक इलेक्ट्रॉन पर 10⁴ N/C के वैद्युत क्षेत्र में कितना बल लगेगा?',
    options: [
      { key: 'A', text: '1.6 × 10⁻¹⁵ N' },
      { key: 'B', text: '1.6 × 10⁻²³ N' },
      { key: 'C', text: '1.6 × 10⁻¹⁹ N' },
      { key: 'D', text: '9.1 × 10⁻³¹ N' }
    ],
    correctOption: 'A',
    explanation: 'F = qE = (1.6 × 10⁻¹⁹ C) × (10⁴ N/C) = 1.6 × 10⁻¹⁵ N।',
    yearAsked: 'BSEB 2024A, 2021A'
  },
  {
    id: 37,
    question: 'एकसमान वैद्युत क्षेत्र (Uniform Electric Field) में रखे आवेशित कण का त्वरण (Acceleration) कितना होता है?',
    options: [
      { key: 'A', text: 'a = qE / m' },
      { key: 'B', text: 'a = m / qE' },
      { key: 'C', text: 'a = q / mE' },
      { key: 'D', text: 'a = E / qm' }
    ],
    correctOption: 'A',
    explanation: 'F = ma = qE ⟹ a = qE / m (नियत त्वरण)।',
    yearAsked: 'BSEB 2023A, 2020A'
  },
  {
    id: 38,
    question: 'एकसमान वैद्युत क्षेत्र में लंबवत प्रवेश करने वाले आवेशित कण का प्रक्षेप्य पथ (Trajectory) कैसा होता है?',
    options: [
      { key: 'A', text: 'परवलयाकार (Parabolic)' },
      { key: 'B', text: 'सरल रेखीय (Straight Line)' },
      { key: 'C', text: 'वृत्ताकार (Circular)' },
      { key: 'D', text: 'दीर्घवृत्ताकार' }
    ],
    correctOption: 'A',
    explanation: 'लंबवत दिशा में नियत त्वरण के कारण कण का पथ परवलयाकार (y ∝ x²) होता है।',
    yearAsked: 'BSEB 2024A, 2021A, 2017A'
  },
  {
    id: 39,
    question: 'एक प्रोटॉन और एक अल्फा कण समान वैद्युत क्षेत्र में रखे गए हैं। उनके त्वरणों का अनुपात (ap / aα) क्या होगा?',
    options: [
      { key: 'A', text: '2 : 1' },
      { key: 'B', text: '1 : 2' },
      { key: 'C', text: '4 : 1' },
      { key: 'D', text: '1 : 4' }
    ],
    correctOption: 'A',
    explanation: 'a = qE/m। ap = eE/m, aα = (2e)E/(4m) = eE/(2m) ⟹ ap/aα = 2/1 = 2:1।',
    yearAsked: 'BSEB 2023A, 2019A'
  },
  {
    id: 40,
    question: 'एक स्थिर इलेक्ट्रॉन उत्पन्न करता है:',
    options: [
      { key: 'A', text: 'केवल वैद्युत क्षेत्र (Only Electric Field)' },
      { key: 'B', text: 'केवल चुंबकीय क्षेत्र' },
      { key: 'C', text: 'वैद्युत एवं चुंबकीय क्षेत्र दोनों' },
      { key: 'D', text: 'विद्युतचुंबकीय तरंगें' }
    ],
    correctOption: 'A',
    explanation: 'स्थिर आवेश केवल वैद्युत क्षेत्र उत्पन्न करता है; नियत वेग से गतिमान आवेश वैद्युत व चुंबकीय क्षेत्र दोनों; तथा त्वरित आवेश विद्युतचुंबकीय तरंगें उत्सर्जित करता है।',
    yearAsked: 'BSEB 2024A, 2022A, 2018A'
  },
  {
    id: 41,
    question: 'एकसमान वेग से गतिमान आवेश क्या उत्पन्न करता है?',
    options: [
      { key: 'A', text: 'वैद्युत तथा चुंबकीय क्षेत्र दोनों' },
      { key: 'B', text: 'केवल वैद्युत क्षेत्र' },
      { key: 'C', text: 'केवल चुंबकीय क्षेत्र' },
      { key: 'D', text: 'विद्युतचुंबकीय तरंगें' }
    ],
    correctOption: 'A',
    explanation: 'एकसमान वेग से गतिशील आवेश वैद्युत तथा चुंबकीय क्षेत्र दोनों उत्पन्न करता है।',
    yearAsked: 'BSEB 2023A, 2020A'
  },
  {
    id: 42,
    question: 'त्वरित आवेश (Accelerated Charge) क्या उत्पन्न करता है?',
    options: [
      { key: 'A', text: 'विद्युतचुंबकीय तरंगें (Electromagnetic Waves)' },
      { key: 'B', text: 'केवल स्थिरवैद्युत क्षेत्र' },
      { key: 'C', text: 'केवल चुंबकीय क्षेत्र' },
      { key: 'D', text: 'अल्फा किरणें' }
    ],
    correctOption: 'A',
    explanation: 'त्वरित आवेश ऊर्जा का विकिरण विद्युतचुंबकीय तरंगों (EM Waves) के रूप में करता है।',
    yearAsked: 'BSEB 2024A, 2019A'
  },
  {
    id: 43,
    question: 'साबुन के बुलबुले को आवेशित करने पर उसकी त्रिज्या (Radius):',
    options: [
      { key: 'A', text: 'बढ़ती है (Increases)' },
      { key: 'B', text: 'घटती है (Decreases)' },
      { key: 'C', text: 'अपरिवर्तित रहती है' },
      { key: 'D', text: 'शून्य हो जाती है' }
    ],
    correctOption: 'A',
    explanation: 'समान आवेशों के बीच प्रतिकर्षण बल के कारण बुलबुले की सतह बाहर की ओर फैलती है, जिससे त्रिज्या बढ़ती है।',
    yearAsked: 'BSEB 2024A, 2021A, 2018A, 2015A'
  },
  {
    id: 44,
    question: 'एक पृथक्कृत चालक गोले को धनावेशित किया गया है। इसके केंद्र पर वैद्युत क्षेत्र का मान क्या होगा?',
    options: [
      { key: 'A', text: 'शून्य (Zero)' },
      { key: 'B', text: 'अनंत' },
      { key: 'C', text: 'पृष्ठ के बराबर' },
      { key: 'D', text: 'पृष्ठ से अधिक' }
    ],
    correctOption: 'A',
    explanation: 'चालक के अंदर कोई नेट आवेश नहीं होता, अतः केंद्र व समस्त आंतरिक भाग में E = 0 होता है।',
    yearAsked: 'BSEB 2023A, 2020A'
  },
  {
    id: 45,
    question: 'वैद्युत विभव प्रवणता (Potential Gradient, dV/dr) और वैद्युत क्षेत्र E में क्या संबंध है?',
    options: [
      { key: 'A', text: 'E = - dV / dr' },
      { key: 'B', text: 'E = dV / dr' },
      { key: 'C', text: 'E = V · r' },
      { key: 'D', text: 'E = - r · dV' }
    ],
    correctOption: 'A',
    explanation: 'वैद्युत क्षेत्र की तीव्रता विभव प्रवणता के ऋणात्मक मान के बराबर होती है: E = -dV/dr।',
    yearAsked: 'BSEB 2024A, 2022A, 2019A'
  },

  // 46-55: Electric Field Lines
  {
    id: 46,
    question: 'वैद्युत क्षेत्र रेखाएं (Electric Field Lines) सदैव कहाँ से प्रारंभ और समाप्त होती हैं?',
    options: [
      { key: 'A', text: 'धनावेश से प्रारंभ होकर ऋणावेश पर समाप्त होती हैं' },
      { key: 'B', text: 'ऋणावेश से प्रारंभ होकर धनावेश पर समाप्त होती हैं' },
      { key: 'C', text: 'बंद लूप बनाती हैं' },
      { key: 'D', text: 'अनंत से अनंत तक जाती हैं' }
    ],
    correctOption: 'A',
    explanation: 'स्थिरवैद्युत क्षेत्र रेखाएं खुले वक्र बनाती हैं जो +q से निकलकर -q पर समाप्त होती हैं।',
    yearAsked: 'BSEB 2024A, 2021A, 2017A'
  },
  {
    id: 47,
    question: 'दो वैद्युत बल रेखाएं एक-दूसरे को किस कोण पर काटती हैं?',
    options: [
      { key: 'A', text: 'कभी नहीं काटतीं (Never Intersect)' },
      { key: 'B', text: '90° पर' },
      { key: 'C', text: '45° पर' },
      { key: 'D', text: '180° पर' }
    ],
    correctOption: 'A',
    explanation: 'यदि वे काटेंगी तो कटान बिंदु पर दो स्पर्श रेखाएं खींची जा सकेंगी, जिससे वैद्युत क्षेत्र की दो दिशाएं होंगी जो असंभव है।',
    yearAsked: 'BSEB 2024A, 2022A, 2019A, 2016A'
  },
  {
    id: 48,
    question: 'वैद्युत बल रेखा के किसी बिंदु पर खींची गई स्पर्श रेखा (Tangent) क्या दर्शाती है?',
    options: [
      { key: 'A', text: 'उस बिंदु पर परिणामी वैद्युत क्षेत्र की दिशा' },
      { key: 'B', text: 'आवेश की गति की चाल' },
      { key: 'C', text: 'वैद्युत फ्लक्स का परिमाण' },
      { key: 'D', text: 'चुंबकीय क्षेत्र की दिशा' }
    ],
    correctOption: 'A',
    explanation: 'स्पर्श रेखा उस बिंदु पर एकांक धनावेश पर लगने वाले बल अर्थात वैद्युत क्षेत्र E⃗ की दिशा बताती है।',
    yearAsked: 'BSEB 2023A, 2020A'
  },
  {
    id: 49,
    question: 'एकसमान वैद्युत क्षेत्र (Uniform Electric Field) को कैसे प्रदर्शित किया जाता है?',
    options: [
      { key: 'A', text: 'समान दूरी पर स्थित समानांतर सीधी रेखाओं द्वारा' },
      { key: 'B', text: 'अभिसारी रेखाओं द्वारा' },
      { key: 'C', text: 'अपसारी रेखाओं द्वारा' },
      { key: 'D', text: 'सकेंद्रीय वृत्तों द्वारा' }
    ],
    correctOption: 'A',
    explanation: 'समान दूरी वाली समानांतर बल रेखाएं एकसमान वैद्युत क्षेत्र को निरूपित करती हैं।',
    yearAsked: 'BSEB 2022A, 2018A'
  },
  {
    id: 50,
    question: 'किसी चालक की सतह से वैद्युत बल रेखाएं किस कोण पर निकलती हैं?',
    options: [
      { key: 'A', text: 'हमेशा लंबवत (90° पर)' },
      { key: 'B', text: 'स्पर्शरेखीय (0° पर)' },
      { key: 'C', text: '45° पर' },
      { key: 'D', text: 'किसी भी कोण पर' }
    ],
    correctOption: 'A',
    explanation: 'चालक की सतह समविभव पृष्ठ होती है, अतः बल रेखाएं सदैव सतह के लंबवत (Normal) होती हैं।',
    yearAsked: 'BSEB 2024A, 2021A, 2019A'
  },
  {
    id: 51,
    question: 'स्थिरवैद्युत क्षेत्र रेखाएं बंद लूप (Closed Loops) क्यों नहीं बनाती हैं?',
    options: [
      { key: 'A', text: 'क्योंकि स्थिरवैद्युत क्षेत्र संरक्षी (Conservative) होता है' },
      { key: 'B', text: 'क्योंकि आवेश अदिश है' },
      { key: 'C', text: 'क्योंकि हवा कुचालक है' },
      { key: 'D', text: 'क्योंकि बल दूरी के वर्ग के व्युत्क्रमानुपाती है' }
    ],
    correctOption: 'A',
    explanation: 'संरक्षी क्षेत्र में ∮ E⃗·dr⃗ = 0 होता है, इसलिए स्थिरवैद्युत रेखाएं बंद लूप नहीं बनातीं (चुंबकीय रेखाएं बंद लूप बनाती हैं)।',
    yearAsked: 'BSEB 2023A, 2020A'
  },
  {
    id: 52,
    question: 'जहाँ वैद्युत बल रेखाएं पास-पास (Dense) होती हैं, वहाँ वैद्युत क्षेत्र:',
    options: [
      { key: 'A', text: 'प्रबल (Strong) होता है' },
      { key: 'B', text: 'दुर्बल (Weak) होता है' },
      { key: 'C', text: 'शून्य होता है' },
      { key: 'D', text: 'ऋणात्मक होता है' }
    ],
    correctOption: 'A',
    explanation: 'बल रेखाओं का घनत्व वैद्युत क्षेत्र की तीव्रता के समानुपाती होता है।',
    yearAsked: 'BSEB 2022A, 2017A'
  },
  {
    id: 53,
    question: 'एक एकल धनावेश (+q) से निकलने वाली वैद्युत क्षेत्र रेखाओं की प्रकृति कैसी होती है?',
    options: [
      { key: 'A', text: 'त्रिज्यीय रूप से बाहर की ओर (Radially Outward)' },
      { key: 'B', text: 'त्रिज्यीय रूप से अंदर की ओर' },
      { key: 'C', text: 'वृत्ताकार' },
      { key: 'D', text: 'सर्पिलाकार' }
    ],
    correctOption: 'A',
    explanation: '+q से रेखाएं त्रिज्यतः बाहर की ओर अनंत तक जाती हैं।',
    yearAsked: 'BSEB 2024A, 2018A'
  },
  {
    id: 54,
    question: 'एक एकल ऋणावेश (-q) के लिए वैद्युत क्षेत्र रेखाएं कैसी होती हैं?',
    options: [
      { key: 'A', text: 'अनंत से त्रिज्यीय रूप से अंदर की ओर (Radially Inward)' },
      { key: 'B', text: 'त्रिज्यीय रूप से बाहर की ओर' },
      { key: 'C', text: 'समानांतर' },
      { key: 'D', text: 'बंद पाश' }
    ],
    correctOption: 'A',
    explanation: '-q के लिए रेखाएं अनंत से प्रारंभ होकर आवेश पर समाप्त होती हैं।',
    yearAsked: 'BSEB 2023A, 2019A'
  },
  {
    id: 55,
    question: 'किसी आवेशित खोखले चालक के भीतर वैद्युत क्षेत्र रेखाओं की संख्या कितनी होती है?',
    options: [
      { key: 'A', text: 'शून्य (Zero)' },
      { key: 'B', text: 'अनंत' },
      { key: 'C', text: 'q / ε₀' },
      { key: 'D', text: '100' }
    ],
    correctOption: 'A',
    explanation: 'चालक के भीतर वैद्युत क्षेत्र शून्य होता है, अतः भीतर कोई बल रेखा नहीं गुजरती (इलेक्ट्रोस्टेटिक शील्डिंग)।',
    yearAsked: 'BSEB 2024A, 2020A'
  },

  // 56-75: Electric Dipole, Torque, Potential Energy & Derivations
  {
    id: 56,
    question: 'वैद्युत द्विध्रुव आघूर्ण (Electric Dipole Moment, p) का SI मात्रक क्या होता है?',
    options: [
      { key: 'A', text: 'कूलॉम-मीटर (C·m)' },
      { key: 'B', text: 'कूलॉम/मीटर (C/m)' },
      { key: 'C', text: 'न्यूटन-मीटर (N·m)' },
      { key: 'D', text: 'फैराड-मीटर (F·m)' }
    ],
    correctOption: 'A',
    explanation: 'p = q · 2a ⟹ मात्रक C × m = C·m (कूलॉम-मीटर) या डिबाई (Debye)।',
    yearAsked: 'BSEB 2024A, 2021A, 2018A, 2016A'
  },
  {
    id: 57,
    question: 'वैद्युत द्विध्रुव आघूर्ण (p⃗) की दिशा क्या होती है?',
    options: [
      { key: 'A', text: 'ऋणावेश (-q) से धनावेश (+q) की ओर' },
      { key: 'B', text: 'धनावेश (+q) से ऋणावेश (-q) की ओर' },
      { key: 'C', text: 'अक्ष के लंबवत' },
      { key: 'D', text: 'कोई निश्चित दिशा नहीं' }
    ],
    correctOption: 'A',
    explanation: 'भौतिकी परिपाटी के अनुसार p⃗ की दिशा सदैव -q से +q की ओर होती है।',
    yearAsked: 'BSEB 2024A, 2022A, 2019A'
  },
  {
    id: 58,
    question: 'वैद्युत द्विध्रुव आघूर्ण की विमा (Dimensional Formula of p) क्या है?',
    options: [
      { key: 'A', text: '[L T A] या [M⁰ L T A]' },
      { key: 'B', text: '[L T⁻¹ A]' },
      { key: 'C', text: '[M L T A]' },
      { key: 'D', text: '[L² T A]' }
    ],
    correctOption: 'A',
    explanation: '[p] = [q] · [2a] = [A T] · [L] = [L T A]।',
    yearAsked: 'BSEB 2023A, 2020A'
  },
  {
    id: 59,
    question: 'एक डिबाई (1 Debye) का मान कितने C·m के बराबर होता है?',
    options: [
      { key: 'A', text: '3.33 × 10⁻³⁰ C·m' },
      { key: 'B', text: '1.6 × 10⁻¹⁹ C·m' },
      { key: 'C', text: '3 × 10⁹ C·m' },
      { key: 'D', text: '9 × 10⁹ C·m' }
    ],
    correctOption: 'A',
    explanation: '1 Debye = 10⁻¹⁸ e.s.u.·cm = 3.33564 × 10⁻³⁰ C·m।',
    yearAsked: 'BSEB 2022A, 2018A'
  },
  {
    id: 60,
    question: 'छोटे वैद्युत द्विध्रुव के कारण अक्षीय स्थिति (Axial Position) में r दूरी पर वैद्युत क्षेत्र E_axial कितना होता है?',
    options: [
      { key: 'A', text: '(1 / 4πε₀) · (2p / r³)' },
      { key: 'B', text: '(1 / 4πε₀) · (p / r³)' },
      { key: 'C', text: '(1 / 4πε₀) · (2p / r²)' },
      { key: 'D', text: '(1 / 4πε₀) · (p / r²)' }
    ],
    correctOption: 'A',
    explanation: 'अक्षीय (End-on) स्थिति में E_axial = (1/4πε₀) · (2p / r³)।',
    yearAsked: 'BSEB 2024A, 2021A, 2018A'
  },
  {
    id: 61,
    question: 'छोटे वैद्युत द्विध्रुव के कारण निरक्षीय स्थिति (Equatorial Position) में r दूरी पर वैद्युत क्षेत्र E_eq कितना होता है?',
    options: [
      { key: 'A', text: '(1 / 4πε₀) · (p / r³)' },
      { key: 'B', text: '(1 / 4πε₀) · (2p / r³)' },
      { key: 'C', text: '(1 / 4πε₀) · (p / r²)' },
      { key: 'D', text: 'शून्य' }
    ],
    correctOption: 'A',
    explanation: 'निरक्षीय (Broadside-on) स्थिति में E_eq = (1/4πε₀) · (p / r³)।',
    yearAsked: 'BSEB 2023A, 2020A, 2017A'
  },
  {
    id: 62,
    question: 'समान दूरी r पर अक्षीय तथा निरक्षीय स्थिति में वैद्युत क्षेत्रों का अनुपात (E_axial / E_equatorial) कितना होता है?',
    options: [
      { key: 'A', text: '2 : 1' },
      { key: 'B', text: '1 : 2' },
      { key: 'C', text: '1 : 1' },
      { key: 'D', text: '4 : 1' }
    ],
    correctOption: 'A',
    explanation: 'E_axial = 2 · E_eq ⟹ E_axial / E_eq = 2 / 1 = 2:1।',
    yearAsked: 'BSEB 2024A, 2022A, 2019A, 2016A'
  },
  {
    id: 63,
    question: 'वैद्युत द्विध्रुव के कारण दूरी r पर वैद्युत क्षेत्र E किसके समानुपाती होता है?',
    options: [
      { key: 'A', text: '1 / r³' },
      { key: 'B', text: '1 / r²' },
      { key: 'C', text: '1 / r' },
      { key: 'D', text: 'r³' }
    ],
    correctOption: 'A',
    explanation: 'द्विध्रुव के लिए E ∝ 1/r³ (बिंदु आवेश के लिए E ∝ 1/r²)।',
    yearAsked: 'BSEB 2024A, 2021A, 2017A'
  },
  {
    id: 64,
    question: 'एकसमान वैद्युत क्षेत्र E⃗ में रखे द्विध्रुव p⃗ पर लगने वाला बल आघूर्ण (Torque, τ⃗) का सूत्र क्या है?',
    options: [
      { key: 'A', text: 'τ⃗ = p⃗ × E⃗ (τ = pE sinθ)' },
      { key: 'B', text: 'τ⃗ = p⃗ · E⃗ (τ = pE cosθ)' },
      { key: 'C', text: 'τ⃗ = E⃗ × p⃗' },
      { key: 'D', text: 'τ⃗ = p⃗ / E⃗' }
    ],
    correctOption: 'A',
    explanation: 'बल आघूर्ण τ⃗ = p⃗ × E⃗ जिसका परिमाण τ = pE sinθ होता है।',
    yearAsked: 'BSEB 2024A, 2020A, 2018A'
  },
  {
    id: 65,
    question: 'एकसमान वैद्युत क्षेत्र में रखे वैद्युत द्विध्रुव पर लगने वाला परिणामी बल (Net Force) कितना होता है?',
    options: [
      { key: 'A', text: 'शून्य (Zero)' },
      { key: 'B', text: 'pE' },
      { key: 'C', text: 'qE' },
      { key: 'D', text: '2qE' }
    ],
    correctOption: 'A',
    explanation: '+q पर +qE बल तथा -q पर -qE बल लगता है, अतः कुल नेट बल F_net = 0 होता है (केवल बल आघूर्ण कार्य करता है)।',
    yearAsked: 'BSEB 2023A, 2019A, 2016A'
  },
  {
    id: 66,
    question: 'असमान (Non-uniform) वैद्युत क्षेत्र में रखे वैद्युत द्विध्रुव पर क्या कार्य करता है?',
    options: [
      { key: 'A', text: 'बल तथा बल-आघूर्ण दोनों (Force and Torque both)' },
      { key: 'B', text: 'केवल बल' },
      { key: 'C', text: 'केवल बल-आघूर्ण' },
      { key: 'D', text: 'कुछ नहीं' }
    ],
    correctOption: 'A',
    explanation: 'असमान क्षेत्र में दोनों आवेशों पर बल असमान होते हैं, अतः एक परिणामी रेखीय बल और बल आघूर्ण दोनों कार्य करते हैं।',
    yearAsked: 'BSEB 2024A, 2021A'
  },
  {
    id: 67,
    question: 'द्विध्रुव पर अधिकतम बल आघूर्ण (τ_max = pE) कब लगता है?',
    options: [
      { key: 'A', text: 'जब θ = 90° (द्विध्रुव क्षेत्र के लंबवत हो)' },
      { key: 'B', text: 'जब θ = 0°' },
      { key: 'C', text: 'जब θ = 180°' },
      { key: 'D', text: 'जब θ = 45°' }
    ],
    correctOption: 'A',
    explanation: 'τ = pE sinθ। sin 90° = 1 अधिकतम मान है, अतः τ_max = pE।',
    yearAsked: 'BSEB 2023A, 2020A'
  },
  {
    id: 68,
    question: 'वैद्युत द्विध्रुव की स्थायी साम्यावस्था (Stable Equilibrium) के लिए θ का मान क्या होता है?',
    options: [
      { key: 'A', text: 'θ = 0° (p⃗ और E⃗ एक ही दिशा में)' },
      { key: 'B', text: 'θ = 180°' },
      { key: 'C', text: 'θ = 90°' },
      { key: 'D', text: 'θ = 270°' }
    ],
    correctOption: 'A',
    explanation: 'θ = 0° पर τ = 0 तथा स्थितिज ऊर्जा U = -pE (न्यूनतम), जो स्थायी साम्यावस्था है।',
    yearAsked: 'BSEB 2024A, 2022A'
  },
  {
    id: 69,
    question: 'वैद्युत द्विध्रुव की अस्थायी साम्यावस्था (Unstable Equilibrium) के लिए θ का मान क्या होता है?',
    options: [
      { key: 'A', text: 'θ = 180° (p⃗ और E⃗ विपरीत दिशा में)' },
      { key: 'B', text: 'θ = 0°' },
      { key: 'C', text: 'θ = 90°' },
      { key: 'D', text: 'θ = 45°' }
    ],
    correctOption: 'A',
    explanation: 'θ = 180° पर τ = 0 तथा स्थितिज ऊर्जा U = +pE (अधिकतम), जो अस्थायी साम्यावस्था है।',
    yearAsked: 'BSEB 2023A, 2019A'
  },
  {
    id: 70,
    question: 'एकसमान वैद्युत क्षेत्र में द्विध्रुव की स्थितिज ऊर्जा (Potential Energy, U) का सूत्र क्या है?',
    options: [
      { key: 'A', text: 'U = - p⃗ · E⃗ = - pE cosθ' },
      { key: 'B', text: 'U = p⃗ × E⃗ = pE sinθ' },
      { key: 'C', text: 'U = pE (1 - cosθ)' },
      { key: 'D', text: 'U = + pE cosθ' }
    ],
    correctOption: 'A',
    explanation: 'U = - p⃗ · E⃗ = - pE cosθ।',
    yearAsked: 'BSEB 2024A, 2021A, 2018A'
  },
  {
    id: 71,
    question: 'द्विध्रुव को 0° से θ कोण तक घुमाने में किया गया कार्य (Work Done, W) कितना होता है?',
    options: [
      { key: 'A', text: 'W = pE (1 - cosθ)' },
      { key: 'B', text: 'W = pE cosθ' },
      { key: 'C', text: 'W = pE sinθ' },
      { key: 'D', text: 'W = pE (1 + cosθ)' }
    ],
    correctOption: 'A',
    explanation: 'W = ∫₀^θ pE sinθ dθ = pE [-cosθ]₀^θ = pE (1 - cosθ)।',
    yearAsked: 'BSEB 2024A, 2022A, 2018A'
  },
  {
    id: 72,
    question: 'द्विध्रुव को साम्यावस्था (0°) से 90° घुमाने में किया गया कार्य कितना होता है?',
    options: [
      { key: 'A', text: 'pE' },
      { key: 'B', text: '2 pE' },
      { key: 'C', text: '0' },
      { key: 'D', text: 'pE / 2' }
    ],
    correctOption: 'A',
    explanation: 'W = pE (1 - cos 90°) = pE (1 - 0) = pE।',
    yearAsked: 'BSEB 2023A, 2020A'
  },
  {
    id: 73,
    question: 'द्विध्रुव को 0° से 180° (विपरीत दिशा में) घुमाने में किया गया कार्य कितना होगा?',
    options: [
      { key: 'A', text: '2 pE' },
      { key: 'B', text: 'pE' },
      { key: 'C', text: '0' },
      { key: 'D', text: '- pE' }
    ],
    correctOption: 'A',
    explanation: 'W = pE (1 - cos 180°) = pE (1 - (-1)) = 2pE।',
    yearAsked: 'BSEB 2024A, 2021A, 2017A'
  },
  {
    id: 74,
    question: '+5 µC तथा -5 µC के दो बिंदु आवेश 1 सेमी की दूरी पर हैं। द्विध्रुव आघूर्ण p का मान क्या होगा?',
    options: [
      { key: 'A', text: '5 × 10⁻⁸ C·m' },
      { key: 'B', text: '5 × 10⁻⁶ C·m' },
      { key: 'C', text: '2.5 × 10⁻⁸ C·m' },
      { key: 'D', text: '10⁻⁷ C·m' }
    ],
    correctOption: 'A',
    explanation: 'p = q · 2a = (5 × 10⁻⁶ C) × (0.01 m) = 5 × 10⁻⁸ C·m।',
    yearAsked: 'BSEB 2024A, 2020A'
  },
  {
    id: 75,
    question: 'HCl अणु में H⁺ व Cl⁻ आयनों के बीच की दूरी 1.28 Å है। HCl का द्विध्रुव आघूर्ण क्या होगा?',
    options: [
      { key: 'A', text: '2.05 × 10⁻²⁹ C·m' },
      { key: 'B', text: '1.6 × 10⁻¹⁹ C·m' },
      { key: 'C', text: '3.33 × 10⁻³⁰ C·m' },
      { key: 'D', text: '1.28 × 10⁻¹⁰ C·m' }
    ],
    correctOption: 'A',
    explanation: 'p = e · 2a = (1.6 × 10⁻¹⁹ C) × (1.28 × 10⁻¹⁰ m) = 2.048 × 10⁻²⁹ C·m।',
    yearAsked: 'BSEB 2023A, 2019A'
  },

  // 76-90: Electric Flux & Gauss's Law Applications
  {
    id: 76,
    question: 'वैद्युत फ्लक्स (Electric Flux, Φ) का SI मात्रक क्या होता है?',
    options: [
      { key: 'A', text: 'N·m²/C या V·m (वोल्ट-मीटर)' },
      { key: 'B', text: 'N/C' },
      { key: 'C', text: 'V/m' },
      { key: 'D', text: 'J/C' }
    ],
    correctOption: 'A',
    explanation: 'Φ = E·A ⟹ (N/C)·m² = N·m²/C या (V/m)·m² = V·m।',
    yearAsked: 'BSEB 2024A, 2022A, 2019A, 2016A'
  },
  {
    id: 77,
    question: 'वैद्युत फ्लक्स (Φ) की विमा (Dimensional Formula of Electric Flux) क्या है?',
    options: [
      { key: 'A', text: '[M L³ T⁻³ A⁻¹]' },
      { key: 'B', text: '[M L² T⁻³ A⁻¹]' },
      { key: 'C', text: '[M L T⁻³ A⁻¹]' },
      { key: 'D', text: '[M L³ T⁻² A⁻¹]' }
    ],
    correctOption: 'A',
    explanation: '[Φ] = [E]·[A] = [M L T⁻³ A⁻¹] · [L²] = [M L³ T⁻³ A⁻¹]।',
    yearAsked: 'BSEB 2024A, 2021A, 2018A'
  },
  {
    id: 78,
    question: 'वैद्युत फ्लक्स कैसी भौतिक राशि है?',
    options: [
      { key: 'A', text: 'अदिश राशि (Scalar Quantity)' },
      { key: 'B', text: 'सदिश राशि (Vector Quantity)' },
      { key: 'C', text: 'प्रदेश (Tensor)' },
      { key: 'D', text: 'विमाहीन राशि' }
    ],
    correctOption: 'A',
    explanation: 'Φ = E⃗ · A⃗ (दो सदिशों का बिंदु/अदिश गुणनफल), अतः यह अदिश राशि है।',
    yearAsked: 'BSEB 2023A, 2020A'
  },
  {
    id: 79,
    question: 'गॉस की प्रमेय (Gauss\'s Theorem) का गणितीय रूप क्या है?',
    options: [
      { key: 'A', text: 'Φ = ∮ E⃗ · dA⃗ = q_in / ε₀' },
      { key: 'B', text: 'Φ = ∮ E⃗ · dA⃗ = ε₀ / q' },
      { key: 'C', text: 'Φ = q · ε₀' },
      { key: 'D', text: 'Φ = E / ε₀' }
    ],
    correctOption: 'A',
    explanation: 'किसी बंद पृष्ठ से गुजरने वाला कुल वैद्युत फ्लक्स उसके भीतर उपस्थित कुल आवेश का 1/ε₀ गुना होता है।',
    yearAsked: 'BSEB 2024A, 2021A, 2018A, 2015A'
  },
  {
    id: 80,
    question: 'यदि किसी बंद गॉसियन पृष्ठ के अंदर कोई आवेश न हो (q_in = 0), तो उससे निर्गत कुल फ्लक्स कितना होगा?',
    options: [
      { key: 'A', text: 'शून्य (Zero)' },
      { key: 'B', text: 'अनंत' },
      { key: 'C', text: 'E · A' },
      { key: 'D', text: '1' }
    ],
    correctOption: 'A',
    explanation: 'Φ = q_in / ε₀ = 0 / ε₀ = 0।',
    yearAsked: 'BSEB 2023A, 2020A'
  },
  {
    id: 81,
    question: 'एक बंद घन (Cube) के केंद्र पर q आवेश रखा है। घन के किसी एक फलक (Face) से निर्गत फ्लक्स कितना होगा?',
    options: [
      { key: 'A', text: 'q / (6ε₀)' },
      { key: 'B', text: 'q / ε₀' },
      { key: 'C', text: 'q / (8ε₀)' },
      { key: 'D', text: '6q / ε₀' }
    ],
    correctOption: 'A',
    explanation: 'घन के 6 फलक होते हैं, सममिति से 1 फलक का फ्लक्स = (1/6) · (q/ε₀) = q / (6ε₀)।',
    yearAsked: 'BSEB 2024A, 2022A, 2019A, 2017A'
  },
  {
    id: 82,
    question: 'यदि आवेश q को घन के एक कोने (Corner / Vertex) पर रखा जाए, तो घन से निर्गत कुल फ्लक्स कितना होगा?',
    options: [
      { key: 'A', text: 'q / (8ε₀)' },
      { key: 'B', text: 'q / (6ε₀)' },
      { key: 'C', text: 'q / (24ε₀)' },
      { key: 'D', text: 'q / ε₀' }
    ],
    correctOption: 'A',
    explanation: 'कोने पर स्थित आवेश को 8 घनों में सममित रूप से साझा किया जाता है, अतः 1 घन से फ्लक्स = q / (8ε₀)।',
    yearAsked: 'BSEB 2023A, 2020A, 2016A'
  },
  {
    id: 83,
    question: 'अनंत लंबाई के एकसमान आवेशित सीधे तार से r दूरी पर वैद्युत क्षेत्र की तीव्रता E का मान क्या होता है?',
    options: [
      { key: 'A', text: 'E = λ / (2πε₀ r)' },
      { key: 'B', text: 'E = λ / (4πε₀ r²)' },
      { key: 'C', text: 'E = σ / (2ε₀)' },
      { key: 'D', text: 'E = λ / ε₀' }
    ],
    correctOption: 'A',
    explanation: 'गॉस नियम से अनंत रेखीय आवेश का वैद्युत क्षेत्र E = λ / (2πε₀ r) ⟹ E ∝ 1/r।',
    yearAsked: 'BSEB 2024A, 2021A, 2018A'
  },
  {
    id: 84,
    question: 'अनंत विस्तार की समतल अचालक आवेशित चादर (Non-conducting Plane Sheet) के निकट वैद्युत क्षेत्र E कितना होता है?',
    options: [
      { key: 'A', text: 'E = σ / (2ε₀)' },
      { key: 'B', text: 'E = σ / ε₀' },
      { key: 'C', text: 'E = 2σ / ε₀' },
      { key: 'D', text: 'E = λ / (2πε₀ r)' }
    ],
    correctOption: 'A',
    explanation: 'अचालक समतल चादर के निकट E = σ / (2ε₀) होता है, जो चादर से दूरी r पर निर्भर नहीं करता।',
    yearAsked: 'BSEB 2024A, 2022A, 2019A'
  },
  {
    id: 85,
    question: 'आवेशित चालक प्लेट (Conducting Plate) की सतह के ठीक बाहर वैद्युत क्षेत्र E का मान क्या होता है?',
    options: [
      { key: 'A', text: 'E = σ / ε₀' },
      { key: 'B', text: 'E = σ / (2ε₀)' },
      { key: 'C', text: 'E = 0' },
      { key: 'D', text: 'E = 2σ / ε₀' }
    ],
    correctOption: 'A',
    explanation: 'चालक की दो सतहें होने के कारण बाहर E = σ/(2ε₀) + σ/(2ε₀) = σ / ε₀ (कूलॉम की प्रमेय)।',
    yearAsked: 'BSEB 2023A, 2020A, 2017A'
  },
  {
    id: 86,
    question: 'आवेशित गोलीय खोल (Thin Spherical Shell) के अंदर वैद्युत क्षेत्र E_in कितना होता है?',
    options: [
      { key: 'A', text: 'शून्य (Zero)' },
      { key: 'B', text: 'σ / ε₀' },
      { key: 'C', text: '(1 / 4πε₀) · (q / R²)' },
      { key: 'D', text: 'अनंत' }
    ],
    correctOption: 'A',
    explanation: 'गोलीय खोल के अंदर आवेश नहीं होता (q_in = 0), अतः गॉस नियम से E_in = 0।',
    yearAsked: 'BSEB 2024A, 2021A, 2018A, 2016A'
  },
  {
    id: 87,
    question: 'आवेशित गोलीय खोल की सतह पर (r = R) वैद्युत क्षेत्र E कितना होता है?',
    options: [
      { key: 'A', text: 'E = (1 / 4πε₀) · (q / R²) = σ / ε₀' },
      { key: 'B', text: 'E = 0' },
      { key: 'C', text: 'E = σ / (2ε₀)' },
      { key: 'D', text: 'अनंत' }
    ],
    correctOption: 'A',
    explanation: 'सतह पर वैद्युत क्षेत्र अधिकतम होता है: E_surface = q / (4πε₀ R²) = σ / ε₀।',
    yearAsked: 'BSEB 2023A, 2019A'
  },
  {
    id: 88,
    question: 'आवेशित गोलीय खोल के बाहर r दूरी (r > R) पर वैद्युत क्षेत्र E किसके समानुपाती होता है?',
    options: [
      { key: 'A', text: '1 / r²' },
      { key: 'B', text: '1 / r' },
      { key: 'C', text: '1 / r³' },
      { key: 'D', text: 'r' }
    ],
    correctOption: 'A',
    explanation: 'बाहरी बिंदु के लिए समस्त आवेश केंद्र पर केंद्रित माना जाता है, अतः E = (1/4πε₀) · (q/r²) ⟹ E ∝ 1/r²।',
    yearAsked: 'BSEB 2024A, 2020A'
  },
  {
    id: 89,
    question: 'यदि किसी गॉसियन सतह की त्रिज्या दोगुनी कर दी जाए, तो उससे निर्गत वैद्युत फ्लक्स पर क्या प्रभाव पड़ेगा?',
    options: [
      { key: 'A', text: 'अपरिवर्तित रहेगा (Remains Same)' },
      { key: 'B', text: '4 गुना हो जाएगा' },
      { key: 'C', text: 'दोगुना हो जाएगा' },
      { key: 'D', text: 'आधा हो जाएगा' }
    ],
    correctOption: 'A',
    explanation: 'गॉस के नियम Φ = q_in / ε₀ के अनुसार फ्लक्स केवल परिबद्ध आवेश पर निर्भर करता है, सतह के आकार या त्रिज्या पर नहीं।',
    yearAsked: 'BSEB 2024A, 2022A, 2018A'
  },
  {
    id: 90,
    question: 'एक विद्युत द्विध्रुव एक बंद पृष्ठ के अंदर स्थित है। बंद पृष्ठ से कुल निर्गत वैद्युत फ्लक्स कितना होगा?',
    options: [
      { key: 'A', text: 'शून्य (Zero)' },
      { key: 'B', text: 'q / ε₀' },
      { key: 'C', text: '2q / ε₀' },
      { key: 'D', text: 'p / ε₀' }
    ],
    correctOption: 'A',
    explanation: 'द्विध्रुव का कुल नेट आवेश q_net = (+q) + (-q) = 0, अतः Φ = 0 / ε₀ = 0।',
    yearAsked: 'BSEB 2024A, 2021A, 2019A, 2015A'
  },

  // 91-100: Charge Densities, High-Yield Formulas & Exam-Special Questions
  {
    id: 91,
    question: 'रेखीय आवेश घनत्व (Linear Charge Density, λ) का SI मात्रक क्या होता है?',
    options: [
      { key: 'A', text: 'कूलॉम/मीटर (C/m)' },
      { key: 'B', text: 'कूलॉम/मीटर² (C/m²)' },
      { key: 'C', text: 'कूलॉम/मीटर³ (C/m³)' },
      { key: 'D', text: 'कूलॉम-मीटर (C·m)' }
    ],
    correctOption: 'A',
    explanation: 'λ = q / L ⟹ मात्रक C/m (कूलॉम प्रति मीटर) तथा विमा [L⁻¹ T A]।',
    yearAsked: 'BSEB 2024A, 2021A, 2018A'
  },
  {
    id: 92,
    question: 'पृष्ठीय आवेश घनत्व (Surface Charge Density, σ) का SI मात्रक क्या होता है?',
    options: [
      { key: 'A', text: 'कूलॉम/मीटर² (C/m²)' },
      { key: 'B', text: 'कूलॉम/मीटर (C/m)' },
      { key: 'C', text: 'कूलॉम/मीटर³ (C/m³)' },
      { key: 'D', text: 'न्यूटन/मीटर' }
    ],
    correctOption: 'A',
    explanation: 'σ = q / A ⟹ मात्रक C/m² (कूलॉम प्रति वर्ग मीटर) तथा विमा [L⁻² T A]।',
    yearAsked: 'BSEB 2024A, 2022A, 2019A, 2016A'
  },
  {
    id: 93,
    question: 'आयतन आवेश घनत्व (Volume Charge Density, ρ) का SI मात्रक क्या होता है?',
    options: [
      { key: 'A', text: 'कूलॉम/मीटर³ (C/m³)' },
      { key: 'B', text: 'कूलॉम/मीटर² (C/m²)' },
      { key: 'C', text: 'कूलॉम/मीटर (C/m)' },
      { key: 'D', text: 'फैराड/मीटर' }
    ],
    correctOption: 'A',
    explanation: 'ρ = q / V ⟹ मात्रक C/m³ (कूलॉम प्रति घन मीटर) तथा विमा [L⁻³ T A]।',
    yearAsked: 'BSEB 2023A, 2020A, 2017A'
  },
  {
    id: 94,
    question: 'R त्रिज्या के एकसमान आवेशित वलय (Ring) के केंद्र पर वैद्युत क्षेत्र की तीव्रता E कितनी होती है?',
    options: [
      { key: 'A', text: 'शून्य (Zero)' },
      { key: 'B', text: '(1 / 4πε₀) · (q / R²)' },
      { key: 'C', text: 'अनंत' },
      { key: 'D', text: 'q / (2πε₀ R)' }
    ],
    correctOption: 'A',
    explanation: 'सममिति के कारण वलय के सभी सम्मुख अल्पांशों का वैद्युत क्षेत्र एक-दूसरे को निरस्त कर देता है, अतः केंद्र पर E = 0।',
    yearAsked: 'BSEB 2024A, 2020A, 2018A'
  },
  {
    id: 95,
    question: 'R त्रिज्या के आवेशित वलय की अक्ष पर केंद्र से x दूरी पर वैद्युत क्षेत्र अधिकतम किस दूरी पर होता है?',
    options: [
      { key: 'A', text: 'x = ± R / √2' },
      { key: 'B', text: 'x = ± R' },
      { key: 'C', text: 'x = ± R / 2' },
      { key: 'D', text: 'x = ± 2R' }
    ],
    correctOption: 'A',
    explanation: 'dE/dx = 0 हल करने पर वलय के अक्ष पर x = ± R/√2 दूरी पर वैद्युत क्षेत्र अधिकतम होता है।',
    yearAsked: 'BSEB 2023A, 2019A'
  },
  {
    id: 96,
    question: 'हवा में स्थित 1 कूलॉम धनावेश से निकलने वाला कुल वैद्युत फ्लक्स कितना होता है?',
    options: [
      { key: 'A', text: '1.13 × 10¹¹ N·m²/C' },
      { key: 'B', text: '8.854 × 10⁻¹² N·m²/C' },
      { key: 'C', text: '9 × 10⁹ N·m²/C' },
      { key: 'D', text: '1.6 × 10⁻¹⁹ N·m²/C' }
    ],
    correctOption: 'A',
    explanation: 'Φ = q / ε₀ = 1 / (8.854 × 10⁻¹²) = 1.129 × 10¹¹ ≈ 1.13 × 10¹¹ N·m²/C।',
    yearAsked: 'BSEB 2024A, 2022A, 2018A'
  },
  {
    id: 97,
    question: 'आवेशित चालक के नुकीले सिरों (Sharp Points) पर पृष्ठीय आवेश घनत्व σ क्या होता है?',
    options: [
      { key: 'A', text: 'सर्वाधिक (Maximum)' },
      { key: 'B', text: 'शून्य' },
      { key: 'C', text: 'न्यूनतम' },
      { key: 'D', text: 'समान' }
    ],
    correctOption: 'A',
    explanation: 'σ ∝ 1/r (जहाँ r वक्रता त्रिज्या है)। नुकीले सिरे पर r बहुत छोटा होने से σ अत्यधिक उच्च होता है (कोरोना डिस्चार्ज)।',
    yearAsked: 'BSEB 2023A, 2020A'
  },
  {
    id: 98,
    question: 'दो विपरीत आवेशित समानांतर चालक प्लेटों (पृष्ठीय घनत्व +σ व -σ) के बीच वैद्युत क्षेत्र E कितना होता है?',
    options: [
      { key: 'A', text: 'E = σ / ε₀' },
      { key: 'B', text: 'E = σ / (2ε₀)' },
      { key: 'C', text: 'E = 0' },
      { key: 'D', text: 'E = 2σ / ε₀' }
    ],
    correctOption: 'A',
    explanation: 'प्लेटों के बीच E = σ/(2ε₀) + σ/(2ε₀) = σ/ε₀ तथा प्लेटों के बाहर E = 0 होता है।',
    yearAsked: 'BSEB 2024A, 2021A, 2017A'
  },
  {
    id: 99,
    question: 'एक खोखले धात्विक गोले को +10 µC आवेश दिया गया है। गोले के केंद्र पर वैद्युत विभव क्या होगा यदि पृष्ठ पर विभव V है?',
    options: [
      { key: 'A', text: 'V (पृष्ठ के विभव के बराबर)' },
      { key: 'B', text: 'शून्य' },
      { key: 'C', text: '2V' },
      { key: 'D', text: 'V / 2' }
    ],
    correctOption: 'A',
    explanation: 'चालक के भीतर प्रत्येक बिंदु पर वैद्युत विभव पृष्ठ के विभव के बराबर और नियत (Constant) होता है।',
    yearAsked: 'BSEB 2024A, 2022A, 2019A'
  },
  {
    id: 100,
    question: 'विद्युत क्षेत्र रेखाएं और समविभव पृष्ठ (Equipotential Surface) आपस में किस कोण पर होते हैं?',
    options: [
      { key: 'A', text: 'सदैव 90° पर (परस्पर लंबवत)' },
      { key: 'B', text: '0° पर (समानांतर)' },
      { key: 'C', text: '45° पर' },
      { key: 'D', text: '180° पर' }
    ],
    correctOption: 'A',
    explanation: 'समविभव पृष्ठ पर आवेश को ले जाने में कार्य dW = q E dl cosθ = 0 ⟹ cosθ = 0 ⟹ θ = 90° (लंबवत)।',
    yearAsked: 'BSEB 2024A, 2022A, 2020A, 2016A'
  }
];

// Test Definition for 100 Objectives (1 Hour 15 Minutes = 75 Minutes)
export const CLASS_12_PHYSICS_CH01_100_TEST: TestItem = {
  id: 'test-c12-phy-ch01-100',
  slug: 'test-c12-phy-ch01-100',
  classLevel: 'class-12',
  subjectId: 'c12-phy',
  subjectName: 'भौतिक विज्ञान (Physics 12th)',
  bookId: 'b-c12-phy-vol1',
  bookTitle: 'भौतिकी भाग-1 (Physics Vol 1)',
  chapterId: 'ch-c12-p-1',
  chapterTitle: 'Electric Charges and Fields (वैद्युत आवेश तथा क्षेत्र)',
  title: 'वैद्युत आवेश तथा क्षेत्र - 100 VVI वस्तुनिष्ठ प्रश्न महा-संग्राम ऑनलाइन टेस्ट (Target Board 2026-27)',
  type: 'online_test',
  totalQuestions: 100,
  durationMinutes: 75, // 1 Hour 15 Minutes (75 Minutes)
  totalMarks: 100,
  passingMarks: 60, // 60% First Division
  isNegativeMarking: false,
  difficulty: 'Medium',
  description: 'बिहार बोर्ड 12वीं इंटर एवं CBSE/ICSE बोर्ड परीक्षा 2026-27 के लिए भौतिकी अध्याय 1: वैद्युत आवेश तथा क्षेत्र के संपूर्ण 100 VVI वस्तुनिष्ठ प्रश्नों का लाइव ऑनलाइन टेस्ट। समय: 1 घंटा 15 मिनट (75 मिनट)। वास्तविक OMR लेआउट, त्वरित परिणाम, विषयवार विश्लेषण एवं व्याख्या सहित।',
  instructions: '1. इस ऑनलाइन टेस्ट में भौतिकी अध्याय 1 के कुल 100 वस्तुनिष्ठ (MCQ) प्रश्न हैं।\n2. कुल समय 1 घंटा 15 मिनट (75 मिनट) निर्धारित है।\n3. प्रत्येक सही उत्तर के लिए 1 अंक निर्धारित है। कोई नकारात्मक अंकन (Negative Marking) नहीं है।\n4. परीक्षा में उत्तीर्ण होने के लिए न्यूनतम 60 अंक आवश्यक हैं।\n5. समय समाप्त होने से पूर्व सभी 100 प्रश्नों को हल करके सबमिट करें।',
  isPublished: true,
};

// Map into TestQuestion format
export const CLASS_12_PHYSICS_CH01_100_TEST_QUESTIONS: TestQuestion[] = CLASS_12_PHYSICS_CH01_100_OBJECTIVES.map((q, idx) => ({
  id: `q-c12-phy-ch01-100-${q.id}`,
  testId: 'test-c12-phy-ch01-100',
  classId: 'class-12',
  subjectId: 'c12-phy',
  bookId: 'b-c12-phy-vol1',
  chapterId: 'ch-c12-p-1',
  question: q.question,
  options: q.options.map(o => o.text),
  correctOption: q.correctOption === 'A' ? 0 : q.correctOption === 'B' ? 1 : q.correctOption === 'C' ? 2 : 3,
  explanation: `${q.explanation} [विगत प्रश्न वर्ष: ${q.yearAsked}]`,
  marks: 1,
  order: idx + 1,
}));

// Alias Test for alternative chapter ID 'ch-c12-sci-phy-01'
export const CLASS_12_PHYSICS_CH01_100_TEST_ALIAS: TestItem = {
  ...CLASS_12_PHYSICS_CH01_100_TEST,
  id: 'test-c12-sci-phy-01-100',
  slug: 'test-c12-sci-phy-01-100',
  chapterId: 'ch-c12-sci-phy-01',
};

export const CLASS_12_PHYSICS_CH01_100_TEST_ALIAS_QUESTIONS: TestQuestion[] = CLASS_12_PHYSICS_CH01_100_OBJECTIVES.map((q, idx) => ({
  id: `q-c12-sci-phy-01-100-${q.id}`,
  testId: 'test-c12-sci-phy-01-100',
  classId: 'class-12',
  subjectId: 'c12-phy',
  bookId: 'b-c12-phy-vol1',
  chapterId: 'ch-c12-sci-phy-01',
  question: q.question,
  options: q.options.map(o => o.text),
  correctOption: q.correctOption === 'A' ? 0 : q.correctOption === 'B' ? 1 : q.correctOption === 'C' ? 2 : 3,
  explanation: `${q.explanation} [विगत प्रश्न वर्ष: ${q.yearAsked}]`,
  marks: 1,
  order: idx + 1,
}));

