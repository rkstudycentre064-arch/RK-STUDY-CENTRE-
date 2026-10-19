import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { mountStorageRoutes } from './src/server/storageProvider.js';
import {
  DEFAULT_BASE_URL,
  generateSitemapXml,
  injectSeoIntoHtml,
  resolveSeoMetadata,
} from './src/utils/seoManager.js';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

function getRequestBaseUrl(req: express.Request): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  const host = req.get('x-forwarded-host') || req.get('host') || '';
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1') && !host.includes('0.0.0.0')) {
    const proto = req.get('x-forwarded-proto') || req.protocol || 'https';
    return `${proto}://${host}`.replace(/\/$/, '');
  }
  return DEFAULT_BASE_URL;
}

// Trailing slash canonical redirect (prevents duplicate URLs)
app.use((req, res, next) => {
  if (
    req.method === 'GET' &&
    req.path.length > 1 &&
    req.path.endsWith('/') &&
    !req.path.startsWith('/api/')
  ) {
    const query = req.url.slice(req.path.length);
    const cleanPath = req.path.slice(0, -1);
    return res.redirect(301, cleanPath + query);
  }
  next();
});

// Dynamic robots.txt for Googlebot & crawlers
app.get('/robots.txt', (req, res) => {
  const baseUrl = getRequestBaseUrl(req);
  const robotsTxt = [
    '# RK STUDY CENTRE - Official Robots.txt',
    'User-agent: *',
    'Allow: /',
    'Allow: /classes',
    'Allow: /study-material',
    'Allow: /tests',
    'Allow: /courses',
    'Allow: /vlogs',
    'Allow: /solve-doubt',
    'Allow: /formula-bank',
    'Allow: /omr-simulator',
    'Allow: /science-lab',
    'Allow: /study-tracker',
    'Allow: /about-us',
    'Allow: /faq',
    'Allow: /contact-support',
    'Allow: /policies',
    'Allow: /terms-and-conditions',
    'Allow: /privacy-policy',
    'Allow: /refund-cancellation',
    'Allow: /data-privacy',
    'Allow: /class-10-maths-notes',
    'Allow: /class-10-science-notes',
    'Allow: /class-10-social-science-notes',
    'Allow: /bihar-board-class-10-notes',
    'Allow: /bseb-matric-notes',
    'Allow: /class-10-vvi-questions',
    'Allow: /class-10-online-study',
    'Allow: /class-9-to-12-online-study',
    'Allow: /class-12-physics-notes',
    '',
    '# Disallow private, account, and administrative areas',
    'Disallow: /owner',
    'Disallow: /owner/',
    'Disallow: /admin-access-check',
    'Disallow: /admin-check',
    'Disallow: /my-progress',
    'Disallow: /my-progress/',
    'Disallow: /login',
    'Disallow: /register',
    'Disallow: /api/',
    '',
    `Sitemap: ${baseUrl}/sitemap.xml`,
  ].join('\n');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(robotsTxt);
});

// Dynamic XML Sitemap with all public pages, classes, subjects & chapters
app.get('/sitemap.xml', (req, res) => {
  const baseUrl = getRequestBaseUrl(req);
  const xml = generateSitemapXml(baseUrl);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(xml);
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Mount reliable local PDF storage provider for uploaded materials
mountStorageRoutes(app);

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Multi-model resilient runner: tries primary models with backoff and seamless fallback
async function generateGeminiContentWithFallback(params: {
  contents: any;
  config?: any;
}) {
  if (!ai) {
    throw new Error('AI सर्वर कॉन्फ़िगर नहीं है (Missing API Key)।');
  }

  // Modern Gemini 3 models per SKILL.md
  const modelsToTry = [
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: params.config,
        });

        if (response) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        console.warn(`Model ${modelName} attempt ${attempt} failed:`, errMsg.slice(0, 150));
        if (attempt === 1) {
          // brief pause before retry or fallback
          await new Promise((r) => setTimeout(r, 600));
        }
      }
    }
  }

  throw lastError || new Error('सभी AI मॉडल प्रतिक्रिया देने में असमर्थ रहे। कृपया पुनः प्रयास करें।');
}

// Multi-model resilient streaming runner
async function generateGeminiContentStreamWithFallback(params: {
  contents: any;
  config?: any;
}) {
  if (!ai) {
    throw new Error('AI सर्वर कॉन्फ़िगर नहीं है (Missing API Key)।');
  }

  const modelsToTry = [
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const stream = await ai.models.generateContentStream({
          model: modelName,
          contents: params.contents,
          config: params.config,
        });

        if (stream) {
          return stream;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        console.warn(`Model ${modelName} stream attempt ${attempt} failed:`, errMsg.slice(0, 150));
        if (attempt === 1) {
          await new Promise((r) => setTimeout(r, 600));
        }
      }
    }
  }

  throw lastError || new Error('सभी AI मॉडल प्रतिक्रिया देने में असमर्थ रहे। कृपया पुनः प्रयास करें।');
}

// Doubt Solver AI Endpoint
app.post('/api/solve-doubt', async (req, res) => {
  try {
    const {
      question,
      image,
      classLevel,
      subject,
      difficulty,
      boardName,
      streamName,
      chapterName,
      languagePreference,
      isTestMode,
      simulateError,
      stream,
      topic,
      conversationHistory,
    } = req.body;

    // Empty validation
    if ((!question || !question.trim()) && !image) {
      return res.status(400).json({
        error: 'कृपया अपना प्रश्न लिखें या एक प्रश्न की तस्वीर अपलोड करें।',
      });
    }

    // Dev test error simulation
    if (isTestMode && simulateError) {
      return res.status(500).json({
        error: 'अभी समाधान तैयार नहीं हो पाया। कृपया कुछ सेकंड बाद फिर प्रयास करें।',
      });
    }

    if (!ai) {
      return res.status(500).json({
        error: 'AI सेवा वर्तमान में उपलब्ध नहीं है। कृपया व्यवस्थापक से संपर्क करें।',
      });
    }

    const effectiveClass = classLevel || 'auto';
    const effectiveSubject = subject || 'auto';
    const effectiveDifficulty = difficulty || 'medium';
    const effectiveBoard = boardName || 'BSEB (बिहार बोर्ड) / CBSE';
    const effectiveStream = streamName || 'General';
    const effectiveChapter = chapterName || 'सामान्य';

    // Map class or competitive exam level to deep context
    let pedagogicalStyle = '';
    if (effectiveClass === 'graduation') {
      pedagogicalStyle = `Graduation/Higher Education Level: Explain with university-level rigor, advanced theories, scholarly terminology, or industrial engineering-level detail where applicable.`;
    } else if (effectiveClass === 'polytechnic') {
      pedagogicalStyle = `Polytechnic & Diploma Level: Explain with high practical/engineering application focus, clear step-by-step vocational clarity, and standard engineering formulas.`;
    } else if (['neet', 'jee', 'upsc', 'bpsc', 'ssc', 'banking', 'railway'].includes(effectiveClass)) {
      pedagogicalStyle = `Competitive Exam Prep Level (${effectiveClass.toUpperCase()}): Deliver highly optimized, logically bulletproof answers, pointing out common student traps, high-yield shortcuts, standard competitive test patterns, and factual accuracy.`;
    } else {
      const classNum = parseInt(effectiveClass.replace(/\D/g, ''), 10) || 10;
      if (classNum <= 5) {
        pedagogicalStyle = `Primary School Level (Class ${classNum}): Explain like a very friendly and encouraging teacher for a young child. Use very simple language, short sentences, everyday life analogies, and cheerful explanations.`;
      } else if (classNum <= 8) {
        pedagogicalStyle = `Middle School Level (Class ${classNum}): Clear foundational explanations. Explain concepts step-by-step with basic mathematical formulas and clear definitions.`;
      } else if (classNum <= 10) {
        pedagogicalStyle = `Secondary Matric Board Level (Class ${classNum}): Board-exam oriented, rigorous, precise formulas, clear SI units, theorems, and structured exam-ready answers.`;
      } else {
        pedagogicalStyle = `Senior Secondary / Intermediate Level (Class ${classNum}): In-depth academic explanations, rigorous derivations, chemical mechanisms, advanced calculus/algebra, precise scientific terminology.`;
      }
    }

    // Difficulty instructions
    let difficultyInstruction = '';
    if (effectiveDifficulty === 'hard' || effectiveDifficulty === 'very_hard') {
      difficultyInstruction = `
[STRICT PROTOCOL FOR HARD / VERY HARD QUESTIONS]:
1. Deeply analyze the question and its conditions.
2. Clearly list "दिया है (Given)" and "ज्ञात करना है (To Find)".
3. State the exact governing law, theorem or formula with symbol explanations.
4. Solve step-by-step with intermediate calculation checks. Verify signs (+/-), fractions, and equation balance.
5. Highlight the verified final answer clearly with proper units.
6. Provide an alternative method (वैकल्पिक विधि) or a pro-tip (परीक्षा टिप्स) where helpful.
7. INSUFFICIENT INFO CHECK: If the question is incomplete, missing values, contradictory, or lacks a required diagram, DO NOT GUESS OR HALLUCINATE! Clearly state:
   "इस प्रश्न को सही तरीके से हल करने के लिए यह जानकारी चाहिए: [list missing parameters]"
      `;
    } else if (effectiveDifficulty === 'easy') {
      difficultyInstruction = `Keep the answer concise, intuitive, and crystal clear without unnecessary academic bloat.`;
    } else {
      difficultyInstruction = `Provide a balanced, step-by-step, clean textbook-style solution with concept summary and verified final answer.`;
    }

    // Language handling
    const userLang = (languagePreference || '').toString().trim().toLowerCase();
    let langInstruction = '';
    if (userLang === 'hindi' || userLang === 'hi') {
      langInstruction = 'उत्तर पूरी तरह शुद्ध, सरल एवं स्पष्ट हिंदी में दें। तकनीकी पदों को हिंदी व कोष्ठक में अंग्रेजी में लिखें।';
    } else if (userLang === 'english' || userLang === 'en') {
      langInstruction = 'Provide the complete solution in clean, clear English.';
    } else if (userLang === 'hinglish') {
      langInstruction = 'Provide the solution in clean, natural Hinglish (Hindi written in Roman or conversational mixed Hindi-English) suitable for students.';
    } else if (userLang === 'urdu') {
      langInstruction = 'Provide the complete solution in elegant, clear Urdu (اردو) script.';
    } else if (userLang === 'sanskrit') {
      langInstruction = 'Provide the solution or explanation in Sanskrit (संस्कृत) with clear Devanagari script and translation where helpful.';
    } else {
      langInstruction = 'Detect the language of the student\'s question. If asked in Hindi, reply in Hindi. If asked in Urdu, reply in Urdu. If asked in Sanskrit, reply in Sanskrit. If asked in English, reply in English. If mixed, use student-friendly Hindi-English/Hinglish.';
    }

    const systemInstruction = `
आप RK STUDY CENTRE के आधिकारिक AI Doubt Solver (प्रिंस सर शैक्षणिक प्रणाली) हैं।
आपका उद्देश्य विद्यार्थियों के किसी भी शैक्षणिक, प्रतियोगी (NEET, JEE, UPSC, BPSC, SSC, Banking, Railway, Polytechnic आदि) एवं उच्चतर शिक्षा स्तर के प्रश्नों का शत-प्रतिशत सटीक, सरल और चरणबद्ध समाधान प्रस्तुत करना है।

[STRICT MARKDOWN CONSTRAINTS - FORMATTING LAWS]:
1. NEVER USE '#' CHARACTER IN ANY FORM. Do not write "# Step 1" or "## Concept".
2. NEVER USE '*' CHARACTER IN ANY FORM. Do not use them for bolding, bullet points, or list formatting.
3. For bolding, use raw HTML <strong> tags directly (e.g., <strong>मुख्य बिंदु:</strong>).
4. For headings, use direct uppercase lines, spacing, or numbered steps (e.g. STEP 1: GIVEN VALUES).
5. For bullets/lists, use numbers (1., 2., 3.) or clean hyphens (-).
6. Always use '×' (multiplication symbol) instead of '*' for math multiplication.
7. Keep mathematical expressions highly readable with standard symbols (e.g., √, x², a/b, ±, °, π, θ, λ, μ, Σ, ∫, Δ, →).

[विद्यार्थी संदर्भ]:
- स्तर / परीक्षा: ${effectiveClass.toUpperCase()}
- विषय: ${effectiveSubject}
- कठिनाई स्तर: ${effectiveDifficulty}
- बोर्ड / परीक्षा संदर्भ: ${effectiveBoard}
- शैक्षणिक स्तर: ${pedagogicalStyle}

[निर्देश व नियम]:
1. भाषा व शैली: ${langInstruction}
2. गणितीय एवं वैज्ञानिक प्रस्तुति: कच्चे LaTeX सिंटैक्स ($$, $, \\frac, \\sqrt) का प्रयोग न करें! इसके स्थान पर साफ, पठनीय यूनिकोड प्रतीकों का प्रयोग करें।
3. ${difficultyInstruction}
4. विषय-विशिष्ट नियम:
   - गणित (Mathematics):
     * पहले प्रश्न को सरल भाषा में समझाएँ।
     * दिए गए मानों/सूचनाओं को अलग-अलग स्पष्ट करें (Given values).
     * कौन-सा सिद्धांत/सूत्र प्रयुक्त होगा बताएं (Concept/Formula).
     * फिर चरण-दर-चरण समाधान निकालें (Step-by-step).
     * अंतिम उत्तर को विशेष रूप से स्पष्ट रूप से चिह्नित करें।
     * वैकल्पिक विधि या सत्यापन (Verification) प्रस्तुत करें।
   - विज्ञान व इंजीनियरिंग (Science/Physics/Chemistry/Biology/Technical):
     * भौतिकी/सांख्यिकी/आंकिक: दिया है, सूत्र, मान प्रतिस्थापन, गणना, SI मात्रक।
     * रसायन शास्त्र: संतुलित समीकरण, अभिक्रिया प्रकार, उत्पाद।
     * जीव विज्ञान: स्पष्ट परिभाषा, प्रक्रम, महत्वपूर्ण बिंदु।
   - सामाजिक विज्ञान व सामान्य ज्ञान (History/Geography/Civics/Economics/GK):
     * बिंदुवार (point-wise), परीक्षा-केंद्रित, पूर्णतः प्रामाणिक ऐतिहासिक तथ्य (बिना मनगढ़ंत दावों के)।
   - तर्कशक्ति (Reasoning):
     * पैटर्न या नियम की पहचान करें, तार्किक चरण दिखाएं, सभी संभावनाओं को स्पष्ट करें।
5. फोटो/चित्र आधारित प्रश्न:
   - संलग्न तस्वीर में दिए गए प्रश्न को पहचानें और पूर्ण हल दें। यदि तस्वीर धुंधली है, तो कहें: "फोटो स्पष्ट नहीं है। कृपया साफ फोटो अपलोड करें।"
6. उत्तर संरचना (जहाँ उपयुक्त हो):
   📌 समझिए (Problem Understanding)
   🧠 मुख्य सिद्धांत / सूत्र (Concept & Formula)
   📝 चरण-दर-चरण समाधान (Step-by-Step Solution)
   ✅ अंतिम उत्तर (Final Answer with Units)
   💡 याद रखने योग्य बात / परीक्षा टिप्स (Key Tip)
    `.trim();

    const parts: any[] = [];

    // Multimodal image support
    if (image) {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const mimeType = image.match(/^data:(image\/\w+);base64,/)?. [1] || 'image/png';

      parts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    let conversationContext = '';
    if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      const recentTurns = conversationHistory.slice(-8);
      conversationContext = `\n--- PREVIOUS CONVERSATION CONTEXT ON TOPIC "${topic || 'General Topic'}" ---\n`;
      for (const turn of recentTurns) {
        const roleLabel = turn.role === 'user' ? 'Student' : 'AI Teacher (Prince Sir)';
        const textContent = (turn.content || '').slice(0, 1500);
        conversationContext += `${roleLabel}: ${textContent}\n\n`;
      }
      conversationContext += `--- END OF PREVIOUS CONTEXT ---\n`;
    }

    let userPromptText = `Class/Exam Level: ${effectiveClass.toUpperCase()}\nSubject: ${effectiveSubject}\nTopic: ${topic || 'General Doubt'}\nDifficulty: ${effectiveDifficulty}\n`;
    
    if (conversationContext) {
      userPromptText += `${conversationContext}\nIMPORTANT INSTRUCTION: The student is continuing a discussion on the topic above. Use previous context, equations, and steps to answer follow-up questions, alternative methods, and clarifications with seamless continuity.\n`;
    }

    if (question && question.trim()) {
      userPromptText += `\nCurrent Student Question:\n${question.trim()}`;
    } else {
      userPromptText += `\nकृपया संलग्न तस्वीर में दिए गए प्रश्न को पहचानकर उसका सटीक व चरण-दर-चरण हल प्रदान करें।`;
    }

    parts.push({ text: userPromptText });

    if (stream) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('X-Content-Type-Options', 'nosniff');

      try {
        const streamResponse = await generateGeminiContentStreamWithFallback({
          contents: { parts },
          config: {
            systemInstruction,
            temperature: 0.15,
          },
        });

        for await (const chunk of streamResponse) {
          const text = chunk.text;
          if (text) {
            res.write(text);
          }
        }
        res.end();
        return;
      } catch (err: any) {
        console.error('Streaming doubt solver error:', err);
        const errMsg = err?.message || String(err);
        
        if (!res.headersSent) {
          if (errMsg.includes('quota') || errMsg.includes('resource_exhausted')) {
            return res.status(429).json({
              error: 'अभी सर्वर पर अनुरोधों की संख्या अधिक है। कृपया 10-15 सेकंड बाद फिर प्रयास करें।',
            });
          }
          return res.status(500).json({
            error: 'अभी समाधान तैयार नहीं हो पाया। कृपया कुछ सेकंड बाद फिर प्रयास करें।',
          });
        } else {
          res.write('\n\n[ERROR]: अभी समाधान तैयार नहीं हो पाया। कृपया कुछ सेकंड बाद फिर प्रयास करें।');
          res.end();
          return;
        }
      }
    }

    const response = await generateGeminiContentWithFallback({
      contents: { parts },
      config: {
        systemInstruction,
        temperature: 0.15,
      },
    });

    let solution = '';
    if (response && typeof response.text === 'string' && response.text.trim()) {
      solution = response.text;
    } else if (
      response &&
      (response as any).candidates &&
      (response as any).candidates[0]?.content?.parts?.[0]?.text
    ) {
      solution = (response as any).candidates[0].content.parts[0].text;
    }

    if (!solution) {
      solution = 'अभी समाधान तैयार नहीं हो पाया। कृपया कुछ सेकंड बाद फिर प्रयास करें।';
    }

    return res.json({
      solution,
      classLevel: effectiveClass,
      subject: effectiveSubject,
      difficulty: effectiveDifficulty,
    });
  } catch (error: any) {
    console.error('Doubt solver error:', error);
    const msg = error?.message || '';

    if (msg.includes('quota') || msg.includes('resource_exhausted')) {
      return res.status(429).json({
        error: 'अभी सर्वर पर अनुरोधों की संख्या अधिक है। कृपया 10-15 सेकंड बाद फिर प्रयास करें।',
      });
    }

    return res.status(500).json({
      error: 'अभी समाधान तैयार नहीं हो पाया। कृपया कुछ सेकंड बाद फिर प्रयास करें।',
    });
  }
});

// Setup dev server or serve build files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting Express server in development mode...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    // Fallback page serving for Vite router in dev with route-aware SEO & HTTP status codes
    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const baseUrl = getRequestBaseUrl(req);
        const templateHtml = fs.readFileSync(path.resolve('index.html'), 'utf-8');
        const seoResult = injectSeoIntoHtml(templateHtml, url, baseUrl);
        const seoMeta = resolveSeoMetadata(url, baseUrl);
        const html = await vite.transformIndexHtml(url, seoResult.html);
        if (seoMeta.robots.includes('noindex')) {
          res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        } else {
          res.setHeader('X-Robots-Tag', 'index, follow');
        }
        res.status(seoResult.statusCode).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    console.log('Starting Express server in production mode...');
    const distPath = path.resolve('dist');
    app.use(express.static(distPath, { index: false }));

    app.use('*', (req, res) => {
      const url = req.originalUrl;
      const baseUrl = getRequestBaseUrl(req);
      const templateHtml = fs.readFileSync(path.resolve(distPath, 'index.html'), 'utf-8');
      const seoResult = injectSeoIntoHtml(templateHtml, url, baseUrl);
      const seoMeta = resolveSeoMetadata(url, baseUrl);
      if (seoMeta.robots.includes('noindex')) {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      } else {
        res.setHeader('X-Robots-Tag', 'index, follow');
      }
      res.status(seoResult.statusCode).set({ 'Content-Type': 'text/html; charset=utf-8' }).send(seoResult.html);
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`RK STUDY CENTRE Doubt Solve AI active on http://0.0.0.0:${port}`);
  });
}

startServer().catch(console.error);
