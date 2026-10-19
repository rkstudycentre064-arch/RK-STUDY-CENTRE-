import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, withTimeout } from '../lib/firebase';

export interface DoubtConversation {
  id: string;
  userId: string;
  title: string;
  subject: string;
  classLevel: string;
  topic: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  lastSnippet?: string;
  messageCount: number;
  isArchived: boolean;
}

export interface DoubtMessage {
  id: string;
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  contentType: 'text' | 'image' | 'voice';
  image?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

const LOCAL_STORAGE_CONVERSATIONS_KEY = 'rk_doubt_conversations_v3';
const LOCAL_STORAGE_MESSAGES_KEY = 'rk_doubt_messages_v3';

const memoryStore: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem(key);
    } catch {
      return memoryStore[key] || null;
    }
  }
  return memoryStore[key] || null;
}

function safeSetItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, value);
      return;
    } catch {
      memoryStore[key] = value;
      return;
    }
  }
  memoryStore[key] = value;
}

// Helper for local cache fallback
function getLocalConversations(userId: string): DoubtConversation[] {
  try {
    const raw = safeGetItem(`${LOCAL_STORAGE_CONVERSATIONS_KEY}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('[DoubtConvService] Error reading local conversations:', e);
  }
  return [];
}

function saveLocalConversations(userId: string, convs: DoubtConversation[]) {
  try {
    safeSetItem(`${LOCAL_STORAGE_CONVERSATIONS_KEY}_${userId}`, JSON.stringify(convs));
  } catch (e) {
    console.warn('[DoubtConvService] Error saving local conversations:', e);
  }
}

function getLocalMessages(conversationId: string): DoubtMessage[] {
  try {
    const raw = safeGetItem(`${LOCAL_STORAGE_MESSAGES_KEY}_${conversationId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('[DoubtConvService] Error reading local messages:', e);
  }
  return [];
}

function saveLocalMessages(conversationId: string, msgs: DoubtMessage[]) {
  try {
    safeSetItem(`${LOCAL_STORAGE_MESSAGES_KEY}_${conversationId}`, JSON.stringify(msgs));
  } catch (e) {
    console.warn('[DoubtConvService] Error saving local messages:', e);
  }
}

/**
 * Smart Deterministic Topic & Title Detection from initial student prompt
 */
export function detectTopicFromText(text: string, subject?: string): string {
  if (!text || !text.trim()) {
    return subject && subject !== 'auto' ? subject : 'General Doubt';
  }

  const clean = text.trim();

  const topicPatterns: [RegExp, string][] = [
    [/quadratic\s*eq/i, 'Quadratic Equation'],
    [/द्विघात\s*समीकरण/i, 'द्विघात समीकरण'],
    [/trigonometr/i, 'Trigonometry'],
    [/त्रिकोणमिति/i, 'त्रिकोणमिति'],
    [/differentiat|derivative|अवकलन|dy\/dx/i, 'Differentiation (अवकलन)'],
    [/integrat|समाकलन|∫/i, 'Integration (समाकलन)'],
    [/polynomial|बहुपद/i, 'Polynomials (बहुपद)'],
    [/matrix|matrices|आव्यूह/i, 'Matrices (आव्यूह)'],
    [/determinant|सारणिक/i, 'Determinants (सारणिक)'],
    [/boyle|charles|gas\s*law/i, "Gas Laws (Boyle's Law)"],
    [/newton|गति\s*के\s*नियम/i, "Newton's Laws of Motion"],
    [/ohm|प्रतिरोध|विद्युत/i, "Ohm's Law & Resistance"],
    [/optics|reflection|refraction|परावर्तन|अपवर्तन|दर्पण/i, 'Light & Optics'],
    [/photosynthesis|प्रकाश\s*संश्लेषण/i, 'Photosynthesis'],
    [/acid|base|अम्ल|क्षार/i, 'Acids & Bases'],
    [/periodic\s*table|आवर्त\s*सारणी/i, 'Periodic Table'],
    [/chemical\s*bond|रासायनिक\s*बंधन/i, 'Chemical Bonding'],
    [/1857|क्रांति|कुंवर\s*सिंह/i, '1857 की क्रांति'],
    [/democracy|लोकतंत्र/i, 'Democracy & Civics'],
    [/respiration|श्वसन/i, 'Respiration (श्वसन)'],
    [/surface\s*area|volume|क्षेत्रफल|आयतन/i, 'Surface Area & Volume'],
    [/probability|प्रायिकता/i, 'Probability (प्रायिकता)'],
    [/statistics|सांख्यिकी|माध्य|बहुलक/i, 'Statistics (सांख्यिकी)'],
  ];

  for (const [pattern, topicName] of topicPatterns) {
    if (pattern.test(clean)) {
      return topicName;
    }
  }

  // Fallback: take clean first 4-5 words
  const words = clean
    .replace(/^(कृपया|please|sir|सर|solve|हल\s*करें|बताएं|explain)\s+/i, '')
    .replace(/[?।!,;:'"()\[\]{}]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return subject && subject !== 'auto' ? subject : 'General Doubt';
  }

  if (words.length <= 4) {
    return words.join(' ');
  }

  return words.slice(0, 4).join(' ') + '...';
}

/**
 * Fetch all conversations for a student (User-isolated)
 */
export async function fetchUserConversations(userId: string): Promise<DoubtConversation[]> {
  const localList = getLocalConversations(userId);

  if (!userId || userId === 'guest') {
    return localList;
  }

  try {
    const q = query(
      collection(db, 'doubtConversations'),
      where('userId', '==', userId),
      limit(50)
    );

    const snapshot = await withTimeout(getDocs(q), 3000, null);
    if (snapshot && !snapshot.empty) {
      const serverList: DoubtConversation[] = [];
      snapshot.forEach((d) => {
        serverList.push(d.data() as DoubtConversation);
      });
      serverList.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      saveLocalConversations(userId, serverList);
      return serverList;
    }
  } catch (err) {
    console.warn('[DoubtConvService] Operating in resilient cached mode:', err);
  }

  return localList;
}

/**
 * Fetch all messages for a specific conversation
 */
export async function fetchConversationMessages(
  conversationId: string,
  userId: string
): Promise<DoubtMessage[]> {
  const localMsgs = getLocalMessages(conversationId);

  if (!userId || userId === 'guest') {
    return localMsgs;
  }

  try {
    const messagesRef = collection(db, 'doubtConversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(100));

    const snapshot = await withTimeout(getDocs(q), 3000, null);
    if (snapshot && !snapshot.empty) {
      const serverMsgs: DoubtMessage[] = [];
      snapshot.forEach((d) => {
        serverMsgs.push(d.data() as DoubtMessage);
      });
      saveLocalMessages(conversationId, serverMsgs);
      return serverMsgs;
    }
  } catch (err) {
    console.warn('[DoubtConvService] Resilient message load fallback:', err);
  }

  return localMsgs;
}

/**
 * Create a new Conversation
 */
export async function createConversation(
  data: Omit<DoubtConversation, 'createdAt' | 'updatedAt' | 'lastMessageAt' | 'messageCount' | 'isArchived'>
): Promise<DoubtConversation> {
  const now = new Date().toISOString();
  const newConv: DoubtConversation = {
    ...data,
    createdAt: now,
    updatedAt: now,
    lastMessageAt: now,
    messageCount: 0,
    isArchived: false,
  };

  // Update local
  const current = getLocalConversations(data.userId);
  const updated = [newConv, ...current.filter((c) => c.id !== newConv.id)];
  saveLocalConversations(data.userId, updated);

  if (data.userId && data.userId !== 'guest') {
    try {
      const docRef = doc(db, 'doubtConversations', newConv.id);
      await withTimeout(setDoc(docRef, newConv), 2500, null);
    } catch (e) {
      console.warn('[DoubtConvService] Async sync error creating conversation:', e);
    }
  }

  return newConv;
}

/**
 * Append a Message to a conversation and update metadata
 */
export async function appendMessageToConversation(
  conversationId: string,
  messageData: Omit<DoubtMessage, 'id' | 'conversationId' | 'createdAt'>,
  conversationMeta?: Partial<DoubtConversation>
): Promise<DoubtMessage> {
  const now = new Date().toISOString();
  const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  const newMsg: DoubtMessage = {
    id: msgId,
    conversationId,
    createdAt: now,
    ...messageData,
  };

  // 1. Update local messages
  const currentMsgs = getLocalMessages(conversationId);
  const updatedMsgs = [...currentMsgs, newMsg];
  saveLocalMessages(conversationId, updatedMsgs);

  // 2. Update local conversation
  const userId = messageData.userId;
  const currentConvs = getLocalConversations(userId);
  const snippet = newMsg.content.slice(0, 90).replace(/\n/g, ' ');

  const updatedConvs = currentConvs.map((c) => {
    if (c.id === conversationId) {
      return {
        ...c,
        ...conversationMeta,
        lastMessageAt: now,
        updatedAt: now,
        lastSnippet: snippet,
        messageCount: updatedMsgs.length,
      };
    }
    return c;
  });
  saveLocalConversations(userId, updatedConvs);

  // 3. Sync to Firestore if authenticated
  if (userId && userId !== 'guest') {
    try {
      const msgDocRef = doc(db, 'doubtConversations', conversationId, 'messages', msgId);
      const convDocRef = doc(db, 'doubtConversations', conversationId);

      await Promise.all([
        withTimeout(setDoc(msgDocRef, newMsg), 2500, null),
        withTimeout(
          updateDoc(convDocRef, {
            ...conversationMeta,
            userId,
            lastMessageAt: now,
            updatedAt: now,
            lastSnippet: snippet,
            messageCount: updatedMsgs.length,
          }),
          2500,
          null
        ),
      ]);
    } catch (e) {
      console.warn('[DoubtConvService] Async message persistence fallback:', e);
    }
  }

  return newMsg;
}

/**
 * Rename conversation title
 */
export async function renameConversation(
  conversationId: string,
  userId: string,
  newTitle: string
): Promise<void> {
  const now = new Date().toISOString();

  // Local
  const currentConvs = getLocalConversations(userId);
  const updated = currentConvs.map((c) => {
    if (c.id === conversationId) {
      return { ...c, title: newTitle.trim(), topic: newTitle.trim(), updatedAt: now };
    }
    return c;
  });
  saveLocalConversations(userId, updated);

  // Firestore
  if (userId && userId !== 'guest') {
    try {
      const convDocRef = doc(db, 'doubtConversations', conversationId);
      await withTimeout(
        updateDoc(convDocRef, {
          userId,
          title: newTitle.trim(),
          topic: newTitle.trim(),
          updatedAt: now,
        }),
        2500,
        null
      );
    } catch (e) {
      console.warn('[DoubtConvService] Error renaming in firestore:', e);
    }
  }
}

/**
 * Delete a conversation and local cache
 */
export async function deleteConversation(
  conversationId: string,
  userId: string
): Promise<void> {
  // Local
  const currentConvs = getLocalConversations(userId);
  const updated = currentConvs.filter((c) => c.id !== conversationId);
  saveLocalConversations(userId, updated);
  try {
    localStorage.removeItem(`${LOCAL_STORAGE_MESSAGES_KEY}_${conversationId}`);
  } catch {
    // ignore
  }

  // Firestore
  if (userId && userId !== 'guest') {
    try {
      const convDocRef = doc(db, 'doubtConversations', conversationId);
      await withTimeout(deleteDoc(convDocRef), 2500, null);
    } catch (e) {
      console.warn('[DoubtConvService] Error deleting in firestore:', e);
    }
  }
}

/**
 * Archive / Unarchive conversation
 */
export async function toggleArchiveConversation(
  conversationId: string,
  userId: string,
  isArchived: boolean
): Promise<void> {
  const now = new Date().toISOString();

  // Local
  const currentConvs = getLocalConversations(userId);
  const updated = currentConvs.map((c) => {
    if (c.id === conversationId) {
      return { ...c, isArchived, updatedAt: now };
    }
    return c;
  });
  saveLocalConversations(userId, updated);

  // Firestore
  if (userId && userId !== 'guest') {
    try {
      const convDocRef = doc(db, 'doubtConversations', conversationId);
      await withTimeout(updateDoc(convDocRef, { userId, isArchived, updatedAt: now }), 2500, null);
    } catch (e) {
      console.warn('[DoubtConvService] Error archiving in firestore:', e);
    }
  }
}
