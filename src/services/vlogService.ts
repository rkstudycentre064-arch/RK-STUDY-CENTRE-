/**
 * RK STUDY CENTRE - Vlog & Educational Blog Service
 * 
 * Manages creation, publication, updating, retrieval, commenting, and offline fallback 
 * for Owner Vlogs, Video Lessons, Motivation, and Topper Strategy Blogs.
 * Persists to Firestore `vlogs` and syncs with localStorage for offline resilience.
 */

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db, withTimeout } from '../lib/firebase';
import type { ClassLevel, VlogPost, VlogComment, VlogCategory } from '../types';

const VLOGS_STORAGE_KEY = 'rk_study_centre_vlogs_cache';
const LIKED_VLOGS_KEY = 'rk_liked_vlogs_ids';

/**
 * Helper to extract YouTube Video ID from standard URLs, Shorts, and Share links
 */
export function extractYouTubeId(url: string | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex patterns for youtu.be, youtube.com/watch, youtube.com/shorts, youtube.com/embed
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  return match ? match[1] : null;
}

/**
 * Generate high-res YouTube thumbnail URL from YouTube Video ID
 */
export function getYouTubeThumbnailUrl(youtubeId: string, quality: 'hq' | 'maxres' = 'hq'): string {
  if (quality === 'maxres') {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  }
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

/**
 * Generate unique URL-friendly ID for vlogs
 */
export function generateVlogId(title: string): string {
  const ts = Date.now();
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 40);
  return slug ? `vlog-${slug}-${ts.toString(36)}` : `vlog-${ts}`;
}

/**
 * Default initial high-quality Vlogs & Blogs curated for RK STUDY CENTRE
 */
export const INITIAL_VLOGS: VlogPost[] = [
  {
    id: 'vlog-rk-digital-classroom-tour',
    slug: 'rk-study-centre-digital-classroom-tour-2026',
    title: 'RK STUDY CENTRE का नया स्मार्ट डिजिटल क्लासरूम टूर & प्रिंस सर का संदेश',
    hindiTitle: 'RK STUDY CENTRE स्मार्ट क्लासरूम टूर एवं दिशा-निर्देश',
    excerpt: 'देखिए RK STUDY CENTRE का अत्याधुनिक डिजिटल बोर्ड सेटअप, 4K लाइव स्ट्रीमिंग और 2026-27 बोर्ड टॉपर बैच की तैयारी कैसे होगी।',
    content: `## स्वागत है RK STUDY CENTRE के नए डिजिटल प्रांगण में! 🎓✨

प्रिय विद्यार्थियों एवं अभिभावकों,

बिहार बोर्ड के विद्यार्थियों को गुणवत्तापूर्ण, तकनीकी एवं व्यावहारिक शिक्षा प्रदान करने के उद्देश्य से RK STUDY CENTRE ने अपने डिजिटल क्लासरूम को नए स्वरूप में अपग्रेड किया है।

### 🌟 नई सुविधाएं एवं बदलाव:
1. **4K इंटरएक्टिव डिजिटल स्क्रीन**: अब हर वैज्ञानिक प्रयोग, आरेख एवं गणितीय समीकरण 3D एनीमेशन के साथ समझाए जाएंगे।
2. **बड़े अक्षर (Big Letter) नोट्स व्यूअर**: नोट्स को विशेष रूप से बड़े, स्पष्ट और आंखों के लिए आरामदायक हिंदी अक्षरों में तैयार किया गया है।
3. **ऑनलाइन टेस्ट व दैनिक मूल्यांकन**: हर अध्याय के बाद तुरंत 15 रैपिड व 30 VVI प्रश्नों का लाइव टेस्ट।
4. **ऑफ़लाइन अध्ययन हब (PWA)**: बिना इंटरनेट के भी हस्तलिखित नोट्स और महत्वपूर्ण सूत्र आपके फोन में उपलब्ध रहेंगे।

> "सफलता किसी संयोग का परिणाम नहीं होती, यह आपकी निरंतर मेहनत और सही मार्गदर्शन की देन होती है।" — **प्रिंस सर**

हमारे साथ जुड़ें और मैट्रिक व इंटर परीक्षा 2026 में 450+ अंकों के अपने लक्ष्य को साकार करें!`,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    coverImageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    category: 'vlog',
    classLevel: 'all',
    author: 'Prince Sir (प्रिंस सर)',
    authorRole: 'Founder & Head Educator, RK STUDY CENTRE',
    tags: ['ClassroomTour', 'RKStudyCentre', 'BiharBoard2026', 'TopperBatch', 'DigitalClass'],
    status: 'published',
    readTimeMinutes: 4,
    videoDuration: '14:20',
    viewsCount: 3420,
    likesCount: 512,
    commentsCount: 38,
    isPinned: true,
    isFeatured: true,
    hasPdfNotes: true,
    pdfTitle: 'डिजिटल क्लासरूम गाइड एवं 2026 टॉपर शेड्यूल (PDF)',
    pdfFileName: 'RK_Digital_Classroom_Schedule_2026.pdf',
    pdfFileSize: '1.8 MB',
    createdAt: '2026-09-20T10:00:00.000Z',
    publishedAt: '2026-09-20T10:30:00.000Z',
  },
  {
    id: 'vlog-bihar-board-450-strategy',
    slug: 'bihar-board-matric-2026-top-strategy-450-plus',
    title: 'बिहार बोर्ड मैट्रिक 2026 में 450+ अंक कैसे लाएं? टॉपर प्रिंस सर की 5 अचूक रणनीतियां',
    hindiTitle: 'मैट्रिक बोर्ड परीक्षा 2026 : टॉपर बनने की 5 अचूक रणनीतियां',
    excerpt: 'मैट्रिक परीक्षा में 90%+ स्कोर करने का रोडमैप। वस्तुनिष्ठ (MCQ) में 50 में 50 और लघु/दीर्घ उत्तरीय प्रश्नों में पूरे अंक कैसे प्राप्त करें।',
    content: `## बिहार बोर्ड मैट्रिक परीक्षा 2026 : 450+ स्कोरिंग मास्टरप्लान 🏆

मैट्रिक परीक्षा में 450+ अंक लाना कठिन नहीं है, यदि आप सही दिशा और सुनियोजित रणनीति के साथ अध्ययन करते हैं। 

### 🎯 5 स्वर्णिम नियम:

#### 1. वस्तुनिष्ठ प्रश्नों (50 Marks) पर 100% पकड़
* बिहार बोर्ड में 100 में से 50 वस्तुनिष्ठ प्रश्न हल करने होते हैं। 
* प्रतिदिन कम से कम 50 MCQs का अभ्यास ऑनलाइन टेस्ट पोर्टल पर करें।
* NCERT की हर पंक्ति और महत्वपूर्ण परिभाषाओं को ध्यानपूर्वक याद करें।

#### 2. स्वच्छ एवं स्पष्ट हस्तलेख (Handwriting)
* उत्तर पुस्तिका में उत्तर लिखते समय शीर्षकों (Headings) को रेखांकित (Underline) करें।
* मुख्य सूत्रों एवं वैज्ञानिक शब्दों को काले पेन से हाइलाइट करें।

#### 3. 5-वर्षीय विगत वर्ष प्रश्न (PYQ Bank)
* 2020 से 2025 तक पूछे गए सभी प्रश्नों का तीन बार लिखित अभ्यास करें।
* 70% प्रश्न प्रत्यक्ष अथवा अप्रत्यक्ष रूप से PYQ से ही दोहराए जाते हैं।

#### 4. भौतिकी व गणित में सूत्र चार्ट (Formula Sheet)
* प्रकाश का परावर्तन, अपवर्तन, विद्युत धारा एवं त्रिकोणमिति के सूत्र प्रतिदिन सुबह 10 मिनट दोहराएं।

#### 5. समय प्रबंधन और दैनिक 6 घंटे स्वाध्याय (Self-Study)
* कोचिंग व स्कूल के अतिरिक्त 4 से 6 घंटे का शांत वातावरण में स्व-अध्ययन अनिवार्य है।`,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    coverImageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    category: 'topper_talk',
    classLevel: 'class-10',
    author: 'Prince Sir (प्रिंस सर)',
    authorRole: 'Mentor & Board Specialist',
    tags: ['Matric2026', 'TopperStrategy', 'BiharBoard', 'StudyTips', 'PrinceSir'],
    status: 'published',
    readTimeMinutes: 6,
    videoDuration: '18:45',
    viewsCount: 5890,
    likesCount: 894,
    commentsCount: 64,
    isPinned: true,
    isFeatured: true,
    createdAt: '2026-09-18T08:30:00.000Z',
    publishedAt: '2026-09-18T09:00:00.000Z',
  },
  {
    id: 'vlog-physics-ray-optics-experiment',
    slug: 'class-10-physics-reflection-refraction-practical-vlog',
    title: 'कक्षा 10वीं भौतिकी - प्रकाश का परावर्तन व अपवर्तन | Live Demonstration Vlog',
    hindiTitle: 'भौतिकी अध्याय 1 & 2 : प्रिज्म, उत्तल-अवतल दर्पण व लेंस का लाइव प्रयोग',
    excerpt: 'कांच की सिल्ली, लेजर लाइट और प्रिज्म के साथ प्रकाश के अपवर्तन और परावर्तन के नियमों का साक्षात प्रदर्शन।',
    content: `## विज्ञान को रटना नहीं, समझना सीखें! 🔬⚡

इस विशेष व्लॉग में हमने प्रयोगशाला (Lab) के उपकरणों द्वारा प्रकाश के सभी महत्वपूर्ण नियमों को व्यावहारिक रूप से दर्शाया है:

### 💡 मुख्य प्रयोग बिंदु:
* **लेज़र बीम द्वारा परावर्तन कोण (i = r) का सत्यापन**
* **कांच की सिल्ली में पार्श्व विस्थापन (Lateral Displacement)**
* **प्रिज्म द्वारा श्वेत प्रकाश का वर्ण-विक्षेपण (VIBGYOR - बैजानीहपीनाला)**
* **उत्तल एवं अवतल दर्पण में वास्तविक और आभासी प्रतिबिंब की पहचान**

कक्षा 10 के विद्यार्थी इस वीडियो को देखकर अपने भौतिकी के दोनों अध्यायों के व्यावहारिक प्रश्नों में पूरे अंक सुनिश्चित कर सकते हैं।`,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    coverImageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
    category: 'class_update',
    classLevel: 'class-10',
    author: 'Prince Sir (प्रिंस सर)',
    authorRole: 'Science Faculty',
    tags: ['PhysicsClass10', 'OpticsExperiment', 'SciencePractical', 'BiharBoard', 'BigLetterNotes'],
    status: 'published',
    readTimeMinutes: 5,
    videoDuration: '22:10',
    viewsCount: 4210,
    likesCount: 645,
    commentsCount: 42,
    isPinned: false,
    isFeatured: false,
    createdAt: '2026-09-15T14:20:00.000Z',
    publishedAt: '2026-09-15T15:00:00.000Z',
  },
  {
    id: 'vlog-early-morning-study-motivation',
    slug: 'how-to-wake-up-early-study-routine-motivation',
    title: 'सुबह 4 बजे उठकर पढ़ने का वैज्ञानिक तरीका | How to Build a Powerful Study Habit',
    hindiTitle: 'ब्रह्म मुहूर्त में पढ़ाई : याददाश्त तेज करने और आलस्य दूर भगाने के नियम',
    excerpt: 'नींद और आलस्य को हराकर सुबह के शांत वातावरण में 3 घंटे की पढ़ाई को 6 घंटे के बराबर कैसे बनाएं।',
    content: `## सुबह की पढ़ाई आपकी सफलता का आधार है 🌅

जब पूरी दुनिया सो रही होती है, तब एक जागरूक विद्यार्थी अपने सपनों को साकार करने के लिए जागता है।

### 🧠 सुबह अध्ययन करने के वैज्ञानिक लाभ:
1. **मस्तिष्क की अल्फा तरंगें**: सुबह 4 से 7 बजे के बीच मन शांत और ग्रहणशील होता है।
2. **शून्य भटकाव (Zero Distraction)**: न कोई सोशल मीडिया का शोर, न कोई व्यवधान।
3. **दीर्घकालिक स्मृति (Long-term Retention)**: सुबह याद की गई परिभाषाएं और सूत्र कभी नहीं भूलते।

### ⚡ सुबह उठने के 3 नियम:
* रात 10 बजे तक सोने की आदत बनाएं।
* सोने से 30 मिनट पूर्व मोबाइल फोन को कमरे से दूर रखें।
* उठते ही 1 गिलास गुनगुना पानी पिएं और 5 मिनट गहरी सांस लें।`,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    coverImageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    category: 'motivation',
    classLevel: 'all',
    author: 'Prince Sir (प्रिंस सर)',
    authorRole: 'Motivational Speaker & Educator',
    tags: ['MorningRoutine', 'Motivation', 'StudyHabits', 'SelfDiscipline', 'StudentLife'],
    status: 'published',
    readTimeMinutes: 4,
    videoDuration: '11:15',
    viewsCount: 7120,
    likesCount: 1180,
    commentsCount: 95,
    isPinned: false,
    isFeatured: true,
    createdAt: '2026-09-12T06:00:00.000Z',
    publishedAt: '2026-09-12T06:30:00.000Z',
  },
];

/**
 * Read cached vlogs from localStorage
 */
function getCachedVlogs(): VlogPost[] {
  if (typeof window === 'undefined') return INITIAL_VLOGS;
  try {
    const raw = localStorage.getItem(VLOGS_STORAGE_KEY);
    if (!raw) return INITIAL_VLOGS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('[VlogService] Failed to parse cached vlogs:', e);
  }
  return INITIAL_VLOGS;
}

/**
 * Save vlogs to localStorage cache
 */
function saveCachedVlogs(vlogs: VlogPost[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VLOGS_STORAGE_KEY, JSON.stringify(vlogs));
  } catch (e) {
    console.warn('[VlogService] Failed to save cached vlogs:', e);
  }
}

/**
 * Fetch all Vlogs (merging Firestore live data with local storage & initial baseline)
 */
export async function getAllVlogs(
  includeDrafts = false,
  filterClass?: ClassLevel | 'all',
  filterCategory?: VlogCategory | 'all'
): Promise<VlogPost[]> {
  const cached = getCachedVlogs();
  const vlogsMap = new Map<string, VlogPost>();

  // Baseline cached items
  cached.forEach((item) => {
    vlogsMap.set(item.id, item);
  });

  // Try fetching live records from Firestore
  try {
    const colRef = collection(db, 'vlogs');
    const q = query(colRef);
    const snapshot = await withTimeout(getDocs(q), 3500, null);

    if (snapshot && !snapshot.empty) {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as VlogPost;
        const item: VlogPost = {
          ...data,
          id: docSnap.id,
          youtubeId: data.youtubeId || extractYouTubeId(data.videoUrl) || undefined,
        };
        vlogsMap.set(item.id, item);
      });
    }
  } catch (err) {
    console.warn('[VlogService] Firestore offline or unavailable, using local cache:', err);
  }

  let list = Array.from(vlogsMap.values());

  // Save merged state
  saveCachedVlogs(list);

  // Apply filters
  if (!includeDrafts) {
    list = list.filter((v) => v.status === 'published');
  }

  if (filterClass && filterClass !== 'all') {
    list = list.filter((v) => !v.classLevel || v.classLevel === 'all' || v.classLevel === filterClass);
  }

  if (filterCategory && filterCategory !== 'all') {
    list = list.filter((v) => v.category === filterCategory);
  }

  // Sort: Pinned first, then newest createdAt desc
  list.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const timeA = new Date(a.publishedAt || a.createdAt).getTime();
    const timeB = new Date(b.publishedAt || b.createdAt).getTime();
    return timeB - timeA;
  });

  return list;
}

/**
 * Get single Vlog by ID or Slug
 */
export async function getVlogByIdOrSlug(idOrSlug: string): Promise<VlogPost | null> {
  if (!idOrSlug) return null;
  const cached = getCachedVlogs();
  const foundInCache = cached.find((v) => v.id === idOrSlug || v.slug === idOrSlug);

  try {
    const docRef = doc(db, 'vlogs', idOrSlug);
    const snap = await withTimeout(getDoc(docRef), 2500, null);
    if (snap && snap.exists()) {
      const data = snap.data() as VlogPost;
      return {
        ...data,
        id: snap.id,
        youtubeId: data.youtubeId || extractYouTubeId(data.videoUrl) || undefined,
      };
    }
  } catch (err) {
    console.warn('[VlogService] Could not fetch single vlog from Firestore:', err);
  }

  return foundInCache || null;
}

/**
 * Create a new Vlog / Blog post (Owner only)
 */
export async function createVlog(
  data: Omit<VlogPost, 'id' | 'createdAt' | 'viewsCount' | 'likesCount'>
): Promise<VlogPost> {
  const newId = generateVlogId(data.title);
  const now = new Date().toISOString();
  const youtubeId = extractYouTubeId(data.videoUrl) || undefined;

  let coverImage = data.coverImageUrl;
  if (!coverImage && youtubeId) {
    coverImage = getYouTubeThumbnailUrl(youtubeId, 'maxres');
  } else if (!coverImage) {
    coverImage = 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80';
  }

  const newVlog: VlogPost = {
    ...data,
    id: newId,
    slug: data.slug || newId,
    youtubeId,
    coverImageUrl: coverImage,
    viewsCount: 0,
    likesCount: 0,
    commentsCount: 0,
    createdAt: now,
    updatedAt: now,
    publishedAt: data.status === 'published' ? now : undefined,
  };

  // 1. Update local cache immediately
  const cached = getCachedVlogs();
  const updatedList = [newVlog, ...cached.filter((v) => v.id !== newId)];
  saveCachedVlogs(updatedList);

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, 'vlogs', newId);
    await setDoc(docRef, {
      ...newVlog,
      createdServerTimestamp: serverTimestamp(),
      updatedServerTimestamp: serverTimestamp(),
    });
    console.log('[VlogService] Successfully created vlog in Firestore:', newId);
  } catch (err) {
    console.warn('[VlogService] Error writing vlog to Firestore, stored locally:', err);
  }

  return newVlog;
}

/**
 * Update an existing Vlog
 */
export async function updateVlog(id: string, updates: Partial<VlogPost>): Promise<void> {
  const now = new Date().toISOString();
  let youtubeId = updates.youtubeId;
  if (updates.videoUrl && !youtubeId) {
    youtubeId = extractYouTubeId(updates.videoUrl) || undefined;
  }

  let coverImage = updates.coverImageUrl;
  if (!coverImage && youtubeId) {
    coverImage = getYouTubeThumbnailUrl(youtubeId, 'maxres');
  }

  const patch: Partial<VlogPost> = {
    ...updates,
    youtubeId: youtubeId !== undefined ? youtubeId : updates.youtubeId,
    coverImageUrl: coverImage || updates.coverImageUrl,
    updatedAt: now,
  };

  if (updates.status === 'published' && !updates.publishedAt) {
    patch.publishedAt = now;
  }

  // 1. Update local cache
  const cached = getCachedVlogs();
  const updatedList = cached.map((item) => (item.id === id ? { ...item, ...patch } : item));
  saveCachedVlogs(updatedList);

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, 'vlogs', id);
    await updateDoc(docRef, {
      ...patch,
      updatedServerTimestamp: serverTimestamp(),
    });
    console.log('[VlogService] Successfully updated vlog in Firestore:', id);
  } catch (err) {
    console.warn('[VlogService] Error updating vlog in Firestore, updated locally:', err);
  }
}

/**
 * Delete a Vlog
 */
export async function deleteVlog(id: string): Promise<void> {
  // 1. Remove from local cache
  const cached = getCachedVlogs();
  const updatedList = cached.filter((item) => item.id !== id);
  saveCachedVlogs(updatedList);

  // 2. Remove from Firestore
  try {
    const docRef = doc(db, 'vlogs', id);
    await deleteDoc(docRef);
    console.log('[VlogService] Deleted vlog from Firestore:', id);
  } catch (err) {
    console.warn('[VlogService] Error deleting vlog from Firestore:', err);
  }
}

/**
 * Toggle Published / Draft status easily
 */
export async function toggleVlogPublishStatus(
  id: string,
  currentStatus: 'published' | 'draft'
): Promise<'published' | 'draft'> {
  const newStatus: 'published' | 'draft' = currentStatus === 'published' ? 'draft' : 'published';
  await updateVlog(id, {
    status: newStatus,
    publishedAt: newStatus === 'published' ? new Date().toISOString() : undefined,
  });
  return newStatus;
}

/**
 * Increment view count
 */
export async function incrementVlogView(id: string): Promise<void> {
  // Update local cache
  const cached = getCachedVlogs();
  saveCachedVlogs(
    cached.map((v) => (v.id === id ? { ...v, viewsCount: (v.viewsCount || 0) + 1 } : v))
  );

  try {
    const docRef = doc(db, 'vlogs', id);
    await updateDoc(docRef, {
      viewsCount: increment(1),
    });
  } catch {
    // Ignore offline errors
  }
}

/**
 * Check if a vlog is liked locally
 */
export function isVlogLiked(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(LIKED_VLOGS_KEY);
    if (!raw) return false;
    const list: string[] = JSON.parse(raw);
    return list.includes(id);
  } catch {
    return false;
  }
}

/**
 * Toggle like for a vlog
 */
export async function toggleVlogLike(id: string): Promise<{ isLiked: boolean; newCount: number }> {
  let likedList: string[] = [];
  try {
    const raw = localStorage.getItem(LIKED_VLOGS_KEY);
    if (raw) likedList = JSON.parse(raw);
  } catch {
    likedList = [];
  }

  const alreadyLiked = likedList.includes(id);
  let isLiked = false;
  let delta = 1;

  if (alreadyLiked) {
    likedList = likedList.filter((x) => x !== id);
    isLiked = false;
    delta = -1;
  } else {
    likedList.push(id);
    isLiked = true;
    delta = 1;
  }

  try {
    localStorage.setItem(LIKED_VLOGS_KEY, JSON.stringify(likedList));
  } catch {
    // ignore
  }

  const cached = getCachedVlogs();
  let currentCount = 0;
  saveCachedVlogs(
    cached.map((v) => {
      if (v.id === id) {
        const next = Math.max(0, (v.likesCount || 0) + delta);
        currentCount = next;
        return { ...v, likesCount: next };
      }
      return v;
    })
  );

  try {
    const docRef = doc(db, 'vlogs', id);
    await updateDoc(docRef, {
      likesCount: increment(delta),
    });
  } catch {
    // offline safe
  }

  return { isLiked, newCount: currentCount };
}

/**
 * Get sample comments for a vlog
 */
export async function getVlogComments(vlogId: string): Promise<VlogComment[]> {
  const localCommentsKey = `rk_vlog_comments_${vlogId}`;
  let localComments: VlogComment[] = [];

  try {
    const raw = localStorage.getItem(localCommentsKey);
    if (raw) localComments = JSON.parse(raw);
  } catch {
    localComments = [];
  }

  if (localComments.length === 0) {
    // Standard baseline sample comments
    localComments = [
      {
        id: `com-1-${vlogId}`,
        vlogId,
        userName: 'अमित कुमार (Class 10 Matric)',
        userRole: 'student',
        comment: 'सर आपके बताए अनुसार भौतिकी के नोट्स और दैनिक ऑनलाइन टेस्ट से मेरा आत्मविश्वास बहुत बढ़ गया है! धन्यवाद सर।',
        createdAt: '2 दिन पहले',
        likes: 12,
      },
      {
        id: `com-2-${vlogId}`,
        vlogId,
        userName: 'प्रिया कुमारी (Topper Batch)',
        userRole: 'student',
        comment: 'सर क्या आप रासायनिक अभिक्रिया एवं समीकरण का भी ऐसा ही प्रैक्टिकल व्लॉग अपलोड करेंगे? बहुत आसानी से समझ आया।',
        createdAt: '1 दिन पहले',
        likes: 8,
      },
      {
        id: `com-3-${vlogId}`,
        vlogId,
        userName: 'प्रिंस सर (RK STUDY CENTRE)',
        userRole: 'owner',
        comment: 'प्रिय विद्यार्थियों, रसायन शास्त्र का प्रैक्टिकल वीडियो भी इस सप्ताह अपलोड किया जा रहा है। आप सभी नियमित टेस्ट देते रहें। ऑल द बेस्ट! 🌟',
        createdAt: '12 घंटे पहले',
        likes: 24,
      },
    ];
    try {
      localStorage.setItem(localCommentsKey, JSON.stringify(localComments));
    } catch {
      // ignore
    }
  }

  return localComments;
}

/**
 * Add a new comment to a Vlog
 */
export async function addVlogComment(
  vlogId: string,
  userName: string,
  comment: string,
  userRole: 'student' | 'owner' | 'guest' = 'student',
  userId?: string
): Promise<VlogComment> {
  const localCommentsKey = `rk_vlog_comments_${vlogId}`;
  let list: VlogComment[] = [];
  try {
    const raw = localStorage.getItem(localCommentsKey);
    if (raw) list = JSON.parse(raw);
  } catch {
    list = [];
  }

  const newComment: VlogComment = {
    id: `com-${Date.now()}`,
    vlogId,
    userId,
    userName: userName.trim() || 'विद्यार्थी',
    userRole,
    comment: comment.trim(),
    createdAt: 'अभी-अभी',
    likes: 0,
  };

  list.unshift(newComment);
  try {
    localStorage.setItem(localCommentsKey, JSON.stringify(list));
  } catch {
    // ignore
  }

  // Update comment counter in vlog
  const cached = getCachedVlogs();
  saveCachedVlogs(
    cached.map((v) => (v.id === vlogId ? { ...v, commentsCount: (v.commentsCount || 0) + 1 } : v))
  );

  return newComment;
}

/**
 * Format bytes to readable format
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Upload or attach a PDF file to a Vlog post
 * Supports direct binary / base64 offline data URI or Firebase Storage URL
 */
export async function uploadVlogPdfFile(
  file: File,
  vlogTitle: string
): Promise<{ pdfUrl: string; fileName: string; fileSize: string; pdfTitle: string }> {
  if (!file) {
    throw new Error('कृपया अपलोड करने के लिए एक PDF फ़ाइल चुनें।');
  }

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    throw new Error('केवल PDF फ़ाइलें ही समर्थित हैं (.pdf format only).');
  }

  const formattedSize = formatBytes(file.size);
  const pdfTitle = `${vlogTitle} - PDF नोट्स`;

  // Create local blob / data URL for immediate and offline reliability
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      resolve({
        pdfUrl: resultStr,
        fileName: file.name,
        fileSize: formattedSize,
        pdfTitle,
      });
    };
    reader.onerror = () => {
      reject(new Error('PDF फ़ाइल पढ़ने में त्रुटि हुई।'));
    };
    reader.readAsDataURL(file);
  });
}

