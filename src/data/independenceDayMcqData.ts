export interface PatrioticMcqQuestion {
  id: string;
  category: 'freedom-struggle' | 'bihar-veers' | 'national-symbols' | 'board-science-gk';
  categoryName: string;
  questionHindi: string;
  questionEnglish?: string;
  options: [string, string, string, string];
  correctIndex: number; // 0 to 3
  explanation: string;
  hint: string;
  patrioticFact: string;
  badge: string;
}

export const INDEPENDENCE_DAY_QUESTIONS: PatrioticMcqQuestion[] = [
  // 1. National Symbols & Tricolor
  {
    id: 'id-001',
    category: 'national-symbols',
    categoryName: 'राष्ट्रीय ध्वज व प्रतीक',
    questionHindi: 'भारतीय राष्ट्रीय ध्वज (तिरंगा) के चक्र में कुल कितनी तीलियाँ (Spokes) होती हैं और यह किस रंग का होता है?',
    questionEnglish: 'How many spokes are in the Ashoka Chakra of the Indian National Flag, and what color is it?',
    options: [
      '20 तीलियाँ, आसमानी नीला',
      '24 तीलियाँ, गहरा नेवी ब्लू (Navy Blue)',
      '22 तीलियाँ, गहरा काला',
      '28 तीलियाँ, गहरा हरा'
    ],
    correctIndex: 1,
    explanation: 'राष्ट्रीय ध्वज के बीच में स्थित अशोक चक्र में 24 तीलियाँ होती हैं, जो 24 घंटों और राष्ट्र की निरंतर प्रगति का प्रतीक हैं। इसका रंग गहरा नीला (Navy Blue) होता है।',
    hint: 'यह सारनाथ के अशोक स्तंभ से लिया गया है और इसमें 24 घंटे का प्रतीक है।',
    patrioticFact: 'भारतीय राष्ट्रीय ध्वज के वर्तमान प्रारूप को 22 जुलाई 1947 को संविधान सभा द्वारा अपनाया गया था।',
    badge: '🇮🇳 तिरंगा रक्षक'
  },
  {
    id: 'id-002',
    category: 'national-symbols',
    categoryName: 'राष्ट्रीय ध्वज व प्रतीक',
    questionHindi: 'भारत के राष्ट्रीय ध्वज (Tricolour) का मूल डिजाइन किस महान देशभक्त द्वारा तैयार किया गया था?',
    questionEnglish: 'Who designed the primary layout of the Indian National Flag?',
    options: [
      'पिंगली वेंकैया (Pingali Venkayya)',
      'बंकिम चंद्र चट्टोपाध्याय',
      'रवीन्द्रनाथ टैगोर',
      'लाला लाजपत राय'
    ],
    correctIndex: 0,
    explanation: 'भारत के राष्ट्रीय ध्वज का मूल रूप महान स्वतंत्रता सेनानी एवं कृषि वैज्ञानिक पिंगली वेंकैया जी द्वारा तैयार किया गया था।',
    hint: 'वे आंध्र प्रदेश के महान स्वतंत्रता सेनानी और विद्वान थे।',
    patrioticFact: 'भारत के राष्ट्रीय ध्वज की लंबाई और चौड़ाई का अनुपात 3:2 होता है।',
    badge: '🇮🇳 ध्वज शिल्पी'
  },
  {
    id: 'id-003',
    category: 'national-symbols',
    categoryName: 'राष्ट्रीय ध्वज व प्रतीक',
    questionHindi: 'भारत का राष्ट्रीय गान "जन गण मन" मूल रूप से किस भाषा में रचा गया था और इसके रचयिता कौन हैं?',
    questionEnglish: 'In which language was "Jana Gana Mana" originally composed and who wrote it?',
    options: [
      'हिन्दी में, मैथिलीशरण गुप्त',
      'संस्कृत में, महर्षि वाल्मीकि',
      'बांग्ला में, गुरुदेव रवीन्द्रनाथ टैगोर',
      'उर्दू में, अल्लामा इक़बाल'
    ],
    correctIndex: 2,
    explanation: 'राष्ट्रगान "जन गण मन" की रचना गुरुदेव रवीन्द्रनाथ टैगोर ने मूलतः बांग्ला (साधु भाषा) में की थी। इसे गाने में आधिकारिक तौर पर 52 सेकंड का समय लगता है।',
    hint: 'रचयिता को 1913 में साहित्य का नोबेल पुरस्कार प्राप्त हुआ था।',
    patrioticFact: '24 जनवरी 1950 को संविधान सभा ने "जन गण मन" को भारत के राष्ट्रगान के रूप में स्वीकार किया था।',
    badge: '🎵 राष्ट्रगान गौरव'
  },
  {
    id: 'id-004',
    category: 'national-symbols',
    categoryName: 'राष्ट्रीय ध्वज व प्रतीक',
    questionHindi: 'भारत के राष्ट्रीय प्रतीक के नीचे लिखा सूत्र "सत्यमेव जयते" किस प्राचीन ग्रंथ से लिया गया है?',
    questionEnglish: 'From which ancient text is the motto "Satyameva Jayate" taken?',
    options: [
      'ऋग्वेद',
      'मुण्डक उपनिषद (Mundaka Upanishad)',
      'भगवद्गीता',
      'सामवेद'
    ],
    correctIndex: 1,
    explanation: '"सत्यमेव जयते" (सत्य की ही विजय होती है) मुण्डक उपनिषद के मंत्र 3.1.6 से लिया गया है और यह देवनागरी लिपि में अंकित है।',
    hint: 'यह एक प्रमुख उपनिषद है।',
    patrioticFact: 'भारत का राष्ट्रीय प्रतीक सारनाथ स्थित अशोक के सिंह स्तम्भ की अनुकृति है।',
    badge: '⚖️ सत्यमेव जयते'
  },

  // 2. Freedom Struggle & Independence Day
  {
    id: 'id-005',
    category: 'freedom-struggle',
    categoryName: 'स्वतंत्रता संग्राम',
    questionHindi: '15 अगस्त 1947 को भारत की आज़ादी के समय देश के प्रथम प्रधानमंत्री पंडित जवाहरलाल नेहरू ने अपना ऐतिहासिक भाषण "Tryst with Destiny" कहाँ दिया था?',
    questionEnglish: 'Where was the famous "Tryst with Destiny" speech delivered on the eve of Independence?',
    options: [
      'लाल किला मैदान, दिल्ली',
      'भारतीय संसद भवन का सेंट्रल हॉल (संविधान सभा)',
      'इंडिया गेट, नई दिल्ली',
      'गेटवे ऑफ इंडिया, मुम्बई'
    ],
    correctIndex: 1,
    explanation: '14-15 अगस्त 1947 की मध्यरात्रि को पंडित नेहरू ने नई दिल्ली स्थित संसद भवन (संविधान सभा कक्ष) में अपना प्रसिद्ध "Tryst with Destiny" (भाग्य से साक्षात्कार) भाषण दिया था।',
    hint: 'यह उस समय संविधान सभा (Constituent Assembly) का मुख्य कक्ष था।',
    patrioticFact: '15 अगस्त 1947 को लाल किले पर पहली बार तिरंगा 16 अगस्त की सुबह फहराया गया था।',
    badge: '🏛️ आज़ादी का शंखनाद'
  },
  {
    id: 'id-006',
    category: 'freedom-struggle',
    categoryName: 'स्वतंत्रता संग्राम',
    questionHindi: 'महात्मा गांधी जी ने "करो या मरो" (Do or Die) का अमर नारा किस ऐतिहासिक आंदोलन के दौरान दिया था?',
    questionEnglish: 'During which movement did Mahatma Gandhi give the slogan "Do or Die"?',
    options: [
      'असहयोग आंदोलन (1920)',
      'सविनय अवज्ञा आंदोलन (1930)',
      'भारत छोड़ो आंदोलन (Quit India Movement, 1942)',
      'चंपारण सत्याग्रह (1917)'
    ],
    correctIndex: 2,
    explanation: '8 अगस्त 1942 को बॉम्बे के ग्वालिया टैंक मैदान (अगस्त क्रांति मैदान) से शुरू हुए "भारत छोड़ो आंदोलन" में गांधीजी ने देशवासियों को "करो या मरो" का आह्वान किया था।',
    hint: 'यह आंदोलन अगस्त 1942 में शुरू हुआ था।',
    patrioticFact: 'अरुणा आसफ अली ने 1942 के भारत छोड़ो आंदोलन के दौरान ग्वालिया टैंक मैदान पर तिरंगा फहराया था।',
    badge: '🔥 अगस्त क्रांति'
  },
  {
    id: 'id-007',
    category: 'freedom-struggle',
    categoryName: 'स्वतंत्रता संग्राम',
    questionHindi: '"तुम मुझे खून दो, मैं तुम्हें आज़ादी दूंगा" और "दिल्ली चलो" का ओजस्वी नारा किसने दिया था?',
    questionEnglish: 'Who gave the slogan "Give me blood, and I will give you freedom"?',
    options: [
      'नेताजी सुभाष चंद्र बोस',
      'शहीद भगत सिंह',
      'चंद्रशेखर आज़ाद',
      'सरदार वल्लभभाई पटेल'
    ],
    correctIndex: 0,
    explanation: 'नेताजी सुभाष चंद्र बोस ने आजाद हिन्द फौज (INA) के सैनिकों और भारतीय जनता में देशप्रेम का संचार करने के लिए बर्मा में यह ऐतिहासिक नारा दिया था।',
    hint: 'इन्होंने आज़ाद हिन्द फौज का नेतृत्व किया और "जय हिन्द" का राष्ट्रीय नारा दिया।',
    patrioticFact: 'नेताजी ने 21 अक्टूबर 1943 को सिंगापुर में स्वतंत्र भारत की पहली अस्थायी सरकार (आरजी हुकूमत-ए-आजाद हिन्द) बनाई थी।',
    badge: '⚔️ नेताजी शौर्य'
  },
  {
    id: 'id-008',
    category: 'freedom-struggle',
    categoryName: 'स्वतंत्रता संग्राम',
    questionHindi: '1930 में महात्मा गांधी जी ने नमक कानून तोड़ने के लिए ऐतिहासिक "दांडी यात्रा" कहाँ से शुरू की थी?',
    questionEnglish: 'From where did Mahatma Gandhi start the historic Dandi March in 1930?',
    options: [
      'साबरमती आश्रम (अहमदाबाद)',
      'सेवाग्राम आश्रम (वर्धा)',
      'चंपारण (बिहार)',
      'पोरबंदर (गुजरात)'
    ],
    correctIndex: 0,
    explanation: '12 मार्च 1930 को गांधीजी ने अपने 78 स्वयंसेवकों के साथ साबरमती आश्रम से दांडी समुद्र तट तक 240 मील की ऐतिहासिक पदयात्रा शुरू की और 6 अप्रैल 1930 को नमक बनाकर कानून तोड़ा।',
    hint: 'यह अहमदाबाद स्थित गांधी जी का प्रसिद्ध आश्रम है।',
    patrioticFact: 'इस यात्रा से देशव्यापी सविनय अवज्ञा आंदोलन (Civil Disobedience Movement) की शुरुआत हुई।',
    badge: '🧂 दांडी सत्याग्रह'
  },

  // 3. Bihar Freedom Fighters Special
  {
    id: 'id-009',
    category: 'bihar-veers',
    categoryName: 'बिहार के वीर सपूत',
    questionHindi: '1857 के प्रथम स्वतंत्रता संग्राम में 80 वर्ष की उम्र में बिहार के किस वीर योद्धा ने अंग्रेजों के छक्के छुड़ा दिए थे?',
    questionEnglish: 'Which legendary warrior of Bihar led the 1857 revolt at the age of 80?',
    options: [
      'वीर कुंवर सिंह (जगदीशपुर, भोजपुर)',
      'अमर सिंह',
      'पीर अली खान',
      'बाबू दीप नारायण सिंह'
    ],
    correctIndex: 0,
    explanation: 'भोजपुर जिले के जगदीशपुर के 80 वर्षीय वीर बांकुड़े बाबू वीर कुंवर सिंह ने 1857 की क्रांति में बिहार और पूर्वी उत्तर प्रदेश में ब्रिटिश सेना को बार-बार परास्त किया।',
    hint: 'इन्होंने गंगा नदी पार करते समय गोली लगने पर अपना हाथ काटकर गंगा मैया को समर्पित कर दिया था।',
    patrioticFact: '23 अप्रैल को वीर कुंवर सिंह विजयोत्सव के रूप में पूरे बिहार में धूमधाम से मनाया जाता है।',
    badge: '🦁 वीर कुंवर सिंह शौर्य'
  },
  {
    id: 'id-010',
    category: 'bihar-veers',
    categoryName: 'बिहार के वीर सपूत',
    questionHindi: 'महात्मा गांधी जी को 1917 में बिहार के चंपारण आने का निमंत्रण किस स्वाभिमानी किसान नेता ने दिया था?',
    questionEnglish: 'Which farmer leader invited Mahatma Gandhi to Champaran in 1917?',
    options: [
      'पंडित राजकुमार शुक्ल',
      'स्वामी सहजानंद सरस्वती',
      'डॉ. श्रीकृष्ण सिंह',
      'अनुग्रह नारायण सिंह'
    ],
    correctIndex: 0,
    explanation: 'चंपारण के किसानों पर अंग्रेजों द्वारा थोपी गई तीनकठिया नील की खेती की पीड़ा को दूर करने के लिए पंडित राजकुमार शुक्ल ने 1916 के लखनऊ कांग्रेस में गांधीजी से व्यक्तिगत आग्रह कर चंपारण बुलाया था।',
    hint: 'वे चंपारण के मुरली भरहवा गांव के कर्मठ किसान नेता थे।',
    patrioticFact: 'चंपारण सत्याग्रह (1917) भारत की धरती पर महात्मा गांधी का पहला सफल सत्याग्रह प्रयोग था।',
    badge: '🌾 चंपारण सत्याग्रह'
  },
  {
    id: 'id-011',
    category: 'bihar-veers',
    categoryName: 'बिहार के वीर सपूत',
    questionHindi: '1917 के चंपारण सत्याग्रह के दौरान महात्मा गांधी जी को दूध में जहर देकर मारने की ब्रिटिश साजिश को अपनी जान पर खेलकर किसने नाकाम किया था?',
    questionEnglish: 'Who foiled the British plot to poison Mahatma Gandhi in Champaran in 1917?',
    options: [
      'बत्तख मियां अंसारी (Batak Mian)',
      'पीर अली खान',
      'मौलाना मजहरुल हक',
      'शेख भिखारी'
    ],
    correctIndex: 0,
    explanation: 'मोतिहारी के नील कोठी में बावर्ची बत्तख मियां को अंग्रेज मैनेजर इरविन ने गांधीजी के दूध में जहर मिलाने को कहा, किंतु बत्तख मियां ने अपनी जान की परवाह न कर गांधीजी को सचेत कर बापू की प्राण रक्षा की।',
    hint: 'बिहार सरकार ने मोतिहारी में इनके सम्मान में स्मारक एवं उद्यान बनाया है।',
    patrioticFact: 'डॉ. राजेन्द्र प्रसाद जब राष्ट्रपति बने तो उन्होंने 1950 में बत्तख मियां को राष्ट्रपति भवन बुलाकर सम्मानित किया था।',
    badge: '🛡️ अमर बत्तख मियां'
  },
  {
    id: 'id-012',
    category: 'bihar-veers',
    categoryName: 'बिहार के वीर सपूत',
    questionHindi: 'भारत के संविधान का निर्माण करने वाली संविधान सभा (Constituent Assembly) के स्थायी अध्यक्ष कौन चुने गए थे?',
    questionEnglish: 'Who was the permanent President of the Constituent Assembly of India?',
    options: [
      'डॉ. राजेन्द्र प्रसाद (बिहार के जीरादेई निवासी)',
      'डॉ. भीमराव अंबेडकर',
      'पंडित जवाहरलाल नेहरू',
      'सरदार वल्लभभाई पटेल'
    ],
    correctIndex: 0,
    explanation: 'बिहार के सीवान जिले के जीरादेई गांव में जन्मे भारत रत्न डॉ. राजेन्द्र प्रसाद 11 दिसंबर 1946 को संविधान सभा के स्थायी अध्यक्ष बने और बाद में स्वतंत्र भारत के प्रथम राष्ट्रपति बने।',
    hint: 'वे सादगी के प्रतीक एवं भारत के प्रथम राष्ट्रपति थे।',
    patrioticFact: 'डॉ. राजेन्द्र प्रसाद एकमात्र ऐसे व्यक्ति हैं जो लगातार दो कार्यकाल (1950-1962) तक भारत के राष्ट्रपति रहे।',
    badge: '👑 देशरत्न गौरव'
  },
  {
    id: 'id-013',
    category: 'bihar-veers',
    categoryName: 'बिहार के वीर सपूत',
    questionHindi: '11 अगस्त 1942 को भारत छोड़ो आंदोलन के दौरान पटना सचिवालय के पूर्वी द्वार पर तिरंगा फहराते हुए कितने वीर छात्र शहीद हुए थे?',
    questionEnglish: 'How many brave student martyrs sacrificed their lives hoisting the tricolor at Patna Secretariat on 11 August 1942?',
    options: [
      '5 छात्र',
      '7 अमर छात्र शहीद (सात शहीद)',
      '11 छात्र',
      '9 छात्र'
    ],
    correctIndex: 1,
    explanation: '11 अगस्त 1942 को पटना सचिवालय पर तिरंगा फहराने के प्रयास में ब्रिटिश कलेक्टर आर्चर के आदेश पर पुलिस फायरिंग में उमाकांत, रामानंद, सतीश चंद्र, जगपति, देवीपद, राजेंद्र और रामगोविंद — ये 7 वीर छात्र शहीद हुए।',
    hint: 'पटना विधानसभा के सामने इनका प्रसिद्ध "शहीद स्मारक" बना हुआ है।',
    patrioticFact: 'गोली लगने के बावजूद इन छात्रों ने तिरंगे को जमीन पर नहीं गिरने दिया और दूसरे साथी के हाथ में थमा दिया।',
    badge: '⭐ सात शहीद नमन'
  },
  {
    id: 'id-014',
    category: 'bihar-veers',
    categoryName: 'बिहार के वीर सपूत',
    questionHindi: '1942 के भारत छोड़ो आंदोलन के दौरान हजारीबाग जेल की दीवार फांदकर किसने "आज़ाद दस्ता" (Guerrilla Warfare Unit) का गठन किया था?',
    questionEnglish: 'Who escaped Hazaribagh jail in 1942 and formed the underground Azad Dasta?',
    options: [
      'लोकनायक जयप्रकाश नारायण (JP)',
      'रामवृक्ष बेनीपुरी',
      'योगेंद्र शुक्ल',
      'कर्पूरी ठाकुर'
    ],
    correctIndex: 0,
    explanation: 'लोकनायक जयप्रकाश नारायण ने दीपावली की रात हजारीबाग जेल से निकलकर नेपाल की तराई में युवाओं को गुरिल्ला युद्ध का प्रशिक्षण देने के लिए "आज़ाद दस्ता" बनाया था।',
    hint: 'इन्होंने 1974 में "संपूर्ण क्रांति" का ऐतिहासिक आह्वान किया था।',
    patrioticFact: 'जयप्रकाश नारायण जी को 1999 में मरणोपरांत भारत रत्न से सम्मानित किया गया।',
    badge: '✊ लोकनायक संकल्प'
  },

  // 4. Board Science, Tech & ISRO GK
  {
    id: 'id-015',
    category: 'board-science-gk',
    categoryName: 'विज्ञान व बोर्ड ज्ञान',
    questionHindi: 'भारत के चंद्रयान-3 मिशन ने 23 अगस्त 2023 को चंद्रमा के किस हिस्से पर ऐतिहासिक सफल लैंडिंग की थी?',
    questionEnglish: 'On which part of the Moon did Chandrayaan-3 achieve its historic soft landing?',
    options: [
      'चंद्रमा के दक्षिणी ध्रुव (South Pole) के निकट',
      'चंद्रमा के उत्तरी ध्रुव पर',
      'चंद्रमा के भूमध्य रेखा क्षेत्र में',
      'सी ऑफ ट्रैंक्विलिटी (Sea of Tranquility)'
    ],
    correctIndex: 0,
    explanation: 'भारत चंद्रमा के दक्षिणी ध्रुव के निकट सॉफ्ट लैंडिंग करने वाला विश्व का पहला देश बना। जिस बिंदु पर विक्रम लैंडर उतरा, उसे "शिव शक्ति बिंदु" (Shiv Shakti Point) नाम दिया गया।',
    hint: 'यह भाग अत्यधिक ठंडा व छायादार है जहाँ जल-बर्फ की खोज की जा रही है।',
    patrioticFact: 'भारत सरकार ने 23 अगस्त को प्रतिवर्ष "राष्ट्रीय अंतरिक्ष दिवस" (National Space Day) घोषित किया है।',
    badge: '🚀 शिव शक्ति प्वाइंट'
  },
  {
    id: 'id-016',
    category: 'board-science-gk',
    categoryName: 'विज्ञान व बोर्ड ज्ञान',
    questionHindi: 'बिहार बोर्ड विज्ञान (कक्षा 10वीं): समतल दर्पण (Plane Mirror) द्वारा बने प्रतिबिम्ब की प्रकृति कैसी होती है?',
    questionEnglish: 'What is the nature of an image formed by a plane mirror?',
    options: [
      'वास्तविक और उल्टा (Real & Inverted)',
      'काल्पनिक (आभासी) और सीधा (Virtual & Erect) तथा वस्तु के बराबर',
      'वास्तविक और बड़ा',
      'काल्पनिक और उल्टा'
    ],
    correctIndex: 1,
    explanation: 'समतल दर्पण में बना प्रतिबिम्ब हमेशा आभासी (काल्पनिक), सीधा, पाश्र्व रूप से उल्टा (Laterally Inverted) और वस्तु के ठीक बराबर आकार का होता है। दर्पण से वस्तु की दूरी = दर्पण से प्रतिबिम्ब की दूरी।',
    hint: 'जो आप रोज़ सुबह शीशे में अपना चेहरा देखते हैं, वह सीधा दिखता है।',
    patrioticFact: 'भारतीय भौतिक विज्ञानी सर सी.वी. रमन को "रमन प्रभाव" की खोज के लिए 1930 में भौतिकी का नोबेल पुरस्कार मिला था।',
    badge: '🔬 दर्पण व प्रकाश ज्ञान'
  },
  {
    id: 'id-017',
    category: 'board-science-gk',
    categoryName: 'विज्ञान व बोर्ड ज्ञान',
    questionHindi: 'मानव नेत्र के किस भाग पर किसी वस्तु का वास्तविक और उल्टा प्रतिबिम्ब बनता है?',
    questionEnglish: 'On which part of the human eye is a real and inverted image formed?',
    options: [
      'कॉर्निया (Cornea)',
      'परितारिका (Iris)',
      'दृष्टिपटल या रेटिना (Retina)',
      'पुतली (Pupil)'
    ],
    correctIndex: 2,
    explanation: 'मानव नेत्र के दृष्टिपटल (Retina) पर प्रकाश संवेदनशील कोशिकाएं (Rods & Cones) होती हैं जहाँ वस्तु का वास्तविक और उल्टा प्रतिबिम्ब बनता है, जिसे तंत्रिकाएं मस्तिष्क तक भेजती हैं।',
    hint: 'यह आँख का पिछला पर्दा होता है।',
    patrioticFact: 'प्राचीन भारतीय शल्य चिकित्सक महर्षि सुश्रुत को विश्व में मोतियाबिंद शल्य चिकित्सा (Cataract Surgery) का जनक माना जाता है।',
    badge: '👁️ नेत्र विज्ञान'
  },
  {
    id: 'id-018',
    category: 'board-science-gk',
    categoryName: 'विज्ञान व बोर्ड ज्ञान',
    questionHindi: 'पौधों में प्रकाश-संश्लेषण (Photosynthesis) क्रिया के दौरान कौन-सी गैस उत्सर्जित होकर वायुमंडल को शुद्ध करती है?',
    questionEnglish: 'Which gas is released by plants during photosynthesis?',
    options: [
      'कार्बन डाइऑक्साइड (CO2)',
      'ऑक्सीजन (O2)',
      'नाइट्रोजन (N2)',
      'मीथेन (CH4)'
    ],
    correctIndex: 1,
    explanation: 'प्रकाश-संश्लेषण में पौधे सूर्य के प्रकाश और क्लोरोफिल की उपस्थिति में CO2 और जल का उपयोग कर ग्लूकोज बनाते हैं और प्राणवायु ऑक्सीजन (O2) गैस मुक्त करते हैं। 6CO2 + 6H2O → C6H12O6 + 6O2',
    hint: 'यह सभी जीवों के श्वसन के लिए जीवनदायिनी गैस है।',
    patrioticFact: 'भारतीय महान वैज्ञानिक जगदीश चंद्र बसु ने "क्रेस्कोग्राफ" का आविष्कार कर सिद्ध किया था कि पौधों में भी जीवन और संवेदनशीलता होती है।',
    badge: '🌱 हरित प्राणवायु'
  },
  {
    id: 'id-019',
    category: 'freedom-struggle',
    categoryName: 'स्वतंत्रता संग्राम',
    questionHindi: '"सारे जहाँ से अच्छा हिन्दोस्तां हमारा" गीत की प्रसिद्ध पंक्ति के मूल रचयिता कौन थे?',
    questionEnglish: 'Who originally composed the patriotic song "Saare Jahan Se Achha"?',
    options: [
      'मुहम्मद इक़बाल (Allama Iqbal)',
      'मिर्ज़ा ग़ालिब',
      'साहिर लुधियानवी',
      'कैफ़ी आज़मी'
    ],
    correctIndex: 0,
    explanation: '1904 में रचित "तराना-ए-हिन्दी" (सारे जहाँ से अच्छा हिन्दोस्तां हमारा) मुहम्मद इक़बाल द्वारा लिखा गया था। 1984 में भारत के पहले अंतरिक्ष यात्री राकेश शर्मा ने अंतरिक्ष से प्रधानमंत्री इंदिरा गांधी को इसी पंक्ति से भारत की सुंदरता का वर्णन किया था।',
    hint: 'अंतरिक्ष यात्री राकेश शर्मा ने अंतरिक्ष से पूछा जाने पर यही कहा था।',
    patrioticFact: 'जब राकेश शर्मा से पूछा गया कि ऊपर से भारत कैसा दिखता है, तो उन्होंने कहा: "सारे जहाँ से अच्छा हिन्दोस्तां हमारा!"',
    badge: '🚀 हिन्दोस्तां हमारा'
  },
  {
    id: 'id-020',
    category: 'bihar-veers',
    categoryName: 'बिहार के वीर सपूत',
    questionHindi: 'मात्र 18 वर्ष की आयु में मुजफ्फरपुर बम कांड के बाद हँसते-हँसते फांसी के फंदे को चूमने वाले अमर क्रांतिकारी कौन थे?',
    questionEnglish: 'Which young revolutionary was martyred at age 18 following the Muzaffarpur incident?',
    options: [
      'खुदीराम बोस (Khudiram Bose)',
      'प्रफुल्ल चाकी',
      'बटुकेश्वर दत्त',
      'अशफाक उल्ला खां'
    ],
    correctIndex: 0,
    explanation: '11 अगस्त 1908 को मुजफ्फरपुर जेल में अमर शहीद खुदीराम बोस को हाथ में गीता लेकर हँसते-हँसते फांसी दी गई थी। वे भारतीय स्वतंत्रता संग्राम के सबसे युवा अमर शहीदों में से एक हैं।',
    hint: 'मुजफ्फरपुर रेलवे स्टेशन का नाम इन्हीं अमर शहीद के नाम पर रखा गया है।',
    patrioticFact: 'उनके सम्मान में बिहार और बंगाल के बुनकरों ने "खुदीराम" नाम की धोती बुनी थी जिसके किनारे पर उनका नाम लिखा होता था।',
    badge: '🎖️ अमर खुदीराम बोस'
  }
];

export interface QuizState {
  currentQuestionIndex: number;
  selectedOption: number | null;
  isAnswered: boolean;
  score: number;
  streak: number;
  highestStreak: number;
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  lifelines: {
    fiftyFiftyUsed: boolean;
    hintUsed: boolean;
    skipUsed: boolean;
  };
  eliminatedOptions: number[];
  showHint: boolean;
  isCompleted: boolean;
  userAnswers: {
    questionId: string;
    selectedIdx: number;
    isCorrect: boolean;
  }[];
}
