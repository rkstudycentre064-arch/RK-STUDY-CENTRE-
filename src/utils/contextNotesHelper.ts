import { CHAPTERS } from '../lib/constants';
import type { ChapterNotesExportData } from './downloadNotesHelper';
import type { PDFDocumentData } from '../components/notes/InAppPDFViewerModal';

export interface SubjectContext {
  id: string;
  name: string; // e.g. "भौतिक विज्ञान (Physics)"
  shortName: string; // e.g. "भौतिकी"
  badgeColor: string;
  iconType: 'physics' | 'chemistry' | 'biology' | 'history' | 'geography' | 'civics' | 'economics' | 'hindi' | 'sanskrit' | 'math' | 'urdu' | 'general';
}

export interface ContextChapter {
  id: string;
  chapterNumber: number;
  chapterNumberFormatted: string; // "Ch 01"
  displayTitle: string;
  tabLabel: string; // "भौतिकी Ch 01 — प्रकाश - परावर्तन"
  bookId?: string;
  subjectId?: string;
  bookTitle?: string;
}

/**
 * Clean chapter title to avoid clutter in tab buttons
 */
export function cleanChapterTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/^अध्याय\s*\d+[\s:–—-]*/, '')
    .replace(/^Chapter\s*\d+[\s:–—-]*/i, '')
    .replace(/\s*\(Reflection of Light\)/i, '')
    .replace(/\s*\(Refraction of Light\)/i, '')
    .replace(/\s*\(Electricity\)/i, '')
    .replace(/\s*\(Life Processes\)/i, '')
    .replace(/\s*\(Real Numbers\)/i, '')
    .trim();
}

/**
 * Identifies the context-aware subject for a given document and exportData
 */
export function identifySubjectContext(
  document: PDFDocumentData,
  exportData?: ChapterNotesExportData | null
): SubjectContext | null {
  const metadata = exportData?.metadata || {};
  const haystack = [
    document.title,
    document.subjectName,
    document.subjectId,
    document.bookTitle,
    document.chapterTitle,
    document.fileName,
    metadata.subject,
    metadata.subjectName,
    metadata.subjectHindiName,
    metadata.bookTitle,
    metadata.bookId,
    metadata.chapterTitleHindi,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // 1. History (इतिहास)
  if (
    haystack.includes('his') ||
    haystack.includes('इतिहास') ||
    haystack.includes('history') ||
    haystack.includes('राष्ट्रवाद') ||
    haystack.includes('nationalism') ||
    haystack.includes('b-c10-soc-history') ||
    haystack.includes('समाजवाद') ||
    haystack.includes('मेजिनी') ||
    haystack.includes('बिस्मार्क')
  ) {
    return {
      id: 'history',
      name: 'इतिहास (History)',
      shortName: 'इतिहास',
      badgeColor: 'bg-amber-600 dark:bg-amber-500',
      iconType: 'history',
    };
  }

  // 2. Geography & Disaster Management (भूगोल)
  if (
    haystack.includes('geo') ||
    haystack.includes('भूगोल') ||
    haystack.includes('geography') ||
    haystack.includes('संसाधन') ||
    haystack.includes('कृषि') ||
    haystack.includes('उद्योग') ||
    haystack.includes('परिवहन') ||
    haystack.includes('आपदा') ||
    haystack.includes('disaster') ||
    haystack.includes('b-c10-soc-geography')
  ) {
    return {
      id: 'geography',
      name: 'भूगोल (Geography)',
      shortName: 'भूगोल',
      badgeColor: 'bg-emerald-600 dark:bg-emerald-500',
      iconType: 'geography',
    };
  }

  // 3. Civics (लोकतांत्रिक राजनीति / नागरिक शास्त्र)
  if (
    haystack.includes('civ') ||
    haystack.includes('नागरिक') ||
    haystack.includes('राजनीति') ||
    haystack.includes('civics') ||
    haystack.includes('लोकतंत्र में सत्ता') ||
    haystack.includes('b-c10-soc-civics')
  ) {
    return {
      id: 'civics',
      name: 'लोकतांत्रिक राजनीति (Civics)',
      shortName: 'नागरिक शास्त्र',
      badgeColor: 'bg-indigo-600 dark:bg-indigo-500',
      iconType: 'civics',
    };
  }

  // 4. Economics (हमारी अर्थव्यवस्था)
  if (
    haystack.includes('eco') ||
    haystack.includes('अर्थव्यवस्था') ||
    haystack.includes('अर्थशास्त्र') ||
    haystack.includes('economics') ||
    haystack.includes('b-c10-soc-economics')
  ) {
    return {
      id: 'economics',
      name: 'अर्थशास्त्र (Economics)',
      shortName: 'अर्थशास्त्र',
      badgeColor: 'bg-teal-600 dark:bg-teal-500',
      iconType: 'economics',
    };
  }

  // 5. Biology (जीव विज्ञान)
  if (
    haystack.includes('bio') ||
    haystack.includes('जीव विज्ञान') ||
    haystack.includes('biology') ||
    haystack.includes('जैव प्रक्रम') ||
    haystack.includes('नियंत्रण एवं समन्वय') ||
    haystack.includes('जनन') ||
    haystack.includes('आनुवंशिकता') ||
    haystack.includes('b-c10-sci-biology')
  ) {
    return {
      id: 'biology',
      name: 'जीव विज्ञान (Biology)',
      shortName: 'जीव विज्ञान',
      badgeColor: 'bg-green-600 dark:bg-green-500',
      iconType: 'biology',
    };
  }

  // 6. Chemistry (रसायन विज्ञान)
  if (
    haystack.includes('chem') ||
    haystack.includes('रसायन') ||
    haystack.includes('chemistry') ||
    haystack.includes('अभिक्रिया') ||
    haystack.includes('अम्ल') ||
    haystack.includes('क्षारक') ||
    haystack.includes('धातु') ||
    haystack.includes('कार्बन') ||
    haystack.includes('तत्वों का आवर्त') ||
    haystack.includes('b-c10-sci-chemistry')
  ) {
    return {
      id: 'chemistry',
      name: 'रसायन विज्ञान (Chemistry)',
      shortName: 'रसायन',
      badgeColor: 'bg-purple-600 dark:bg-purple-500',
      iconType: 'chemistry',
    };
  }

  // 7. Physics (भौतिक विज्ञान)
  if (
    haystack.includes('phy') ||
    haystack.includes('भौतिक') ||
    haystack.includes('physics') ||
    haystack.includes('प्रकाश') ||
    haystack.includes('परावर्तन') ||
    haystack.includes('अपवर्तन') ||
    haystack.includes('नेत्र') ||
    haystack.includes('विद्युत') ||
    haystack.includes('ऊर्जा के स्रोत') ||
    haystack.includes('b-c10-sci-physics')
  ) {
    return {
      id: 'physics',
      name: 'भौतिक विज्ञान (Physics)',
      shortName: 'भौतिकी',
      badgeColor: 'bg-blue-600 dark:bg-blue-500',
      iconType: 'physics',
    };
  }

  // 8. Hindi (हिंदी)
  if (
    haystack.includes('godhuli') ||
    haystack.includes('varnika') ||
    haystack.includes('गोधूलि') ||
    haystack.includes('वर्णिका') ||
    haystack.includes('श्रम विभाजन') ||
    haystack.includes('विष के दाँत') ||
    haystack.includes('मंगम्मा') ||
    haystack.includes('कवि') ||
    haystack.includes('रसखान') ||
    (haystack.includes('हिंदी') && !haystack.includes('अहिन्दी') && !haystack.includes('non-hin')) ||
    (haystack.includes('hindi') && !haystack.includes('non-hindi'))
  ) {
    return {
      id: 'hindi',
      name: 'हिंदी (Hindi)',
      shortName: 'हिंदी',
      badgeColor: 'bg-rose-600 dark:bg-rose-500',
      iconType: 'hindi',
    };
  }

  // 9. Sanskrit (संस्कृत)
  if (
    haystack.includes('san') ||
    haystack.includes('संस्कृत') ||
    haystack.includes('sanskrit') ||
    haystack.includes('piyusham') ||
    haystack.includes('पीयूषम्') ||
    haystack.includes('मंगलम्')
  ) {
    return {
      id: 'sanskrit',
      name: 'संस्कृत (Sanskrit)',
      shortName: 'संस्कृत',
      badgeColor: 'bg-orange-600 dark:bg-orange-500',
      iconType: 'sanskrit',
    };
  }

  // 10. Mathematics (गणित)
  if (
    haystack.includes('math') ||
    haystack.includes('गणित') ||
    haystack.includes('वास्तविक संख्या') ||
    haystack.includes('त्रिकोणमिति')
  ) {
    return {
      id: 'math',
      name: 'गणित (Mathematics)',
      shortName: 'गणित',
      badgeColor: 'bg-cyan-600 dark:bg-cyan-500',
      iconType: 'math',
    };
  }

  // 11. Urdu (उर्दू)
  if (haystack.includes('urdu') || haystack.includes('उर्दू')) {
    return {
      id: 'urdu',
      name: 'उर्दू (Urdu)',
      shortName: 'उर्दू',
      badgeColor: 'bg-emerald-700',
      iconType: 'urdu',
    };
  }

  // 12. Non-Hindi (अहिन्दी)
  if (haystack.includes('non-hin') || haystack.includes('अहिन्दी') || haystack.includes('किसलय')) {
    return {
      id: 'non-hindi',
      name: 'अहिन्दी किसलय (Non-Hindi)',
      shortName: 'अहिंदी',
      badgeColor: 'bg-rose-700',
      iconType: 'general',
    };
  }

  // If there's an explicit subjectName from document or metadata, use it
  if (document.subjectName || metadata.subject) {
    const rawName = document.subjectName || metadata.subject || 'अध्ययन नोट्स';
    return {
      id: 'general',
      name: rawName,
      shortName: rawName.split(' ')[0],
      badgeColor: 'bg-blue-600',
      iconType: 'general',
    };
  }

  return null;
}

/**
 * Gets the strictly filtered chapters list belonging ONLY to the identified subject
 */
export function getSubjectChapters(
  subject: SubjectContext,
  classLevel: string = 'class-10'
): ContextChapter[] {
  const normClass = classLevel || 'class-10';

  // Specific high-fidelity chapter manifests matching syllabus and user's requested numbering
  if (subject.id === 'physics') {
    return [
      {
        id: 'ch-c10-sci-phy-01',
        chapterNumber: 1,
        chapterNumberFormatted: 'Ch 01',
        displayTitle: 'प्रकाश - परावर्तन',
        tabLabel: 'भौतिकी Ch 01 — प्रकाश - परावर्तन',
        bookId: 'b-c10-sci-physics',
        bookTitle: 'भौतिकी (Physics)',
      },
      {
        id: 'ch-c10-sci-phy-02',
        chapterNumber: 2,
        chapterNumberFormatted: 'Ch 02',
        displayTitle: 'प्रकाश - अपवर्तन',
        tabLabel: 'भौतिकी Ch 02 — प्रकाश - अपवर्तन',
        bookId: 'b-c10-sci-physics',
        bookTitle: 'भौतिकी (Physics)',
      },
      {
        id: 'ch-c10-sci-phy-03',
        chapterNumber: 3,
        chapterNumberFormatted: 'Ch 03',
        displayTitle: 'मानव नेत्र एवं रंगबिरंगा संसार',
        tabLabel: 'भौतिकी Ch 03 — मानव नेत्र एवं रंगबिरंगा संसार',
        bookId: 'b-c10-sci-physics',
        bookTitle: 'भौतिकी (Physics)',
      },
      {
        id: 'ch-c10-sci-phy-04',
        chapterNumber: 4,
        chapterNumberFormatted: 'Ch 04',
        displayTitle: 'विद्युत धारा',
        tabLabel: 'भौतिकी Ch 04 — विद्युत धारा',
        bookId: 'b-c10-sci-physics',
        bookTitle: 'भौतिकी (Physics)',
      },
      {
        id: 'ch-c10-sci-phy-05',
        chapterNumber: 5,
        chapterNumberFormatted: 'Ch 05',
        displayTitle: 'विद्युत धारा के चुंबकीय प्रभाव',
        tabLabel: 'भौतिकी Ch 05 — विद्युत धारा के चुंबकीय प्रभाव',
        bookId: 'b-c10-sci-physics',
        bookTitle: 'भौतिकी (Physics)',
      },
      {
        id: 'ch-c10-sci-phy-06',
        chapterNumber: 6,
        chapterNumberFormatted: 'Ch 06',
        displayTitle: 'ऊर्जा के स्रोत',
        tabLabel: 'भौतिकी Ch 06 — ऊर्जा के स्रोत',
        bookId: 'b-c10-sci-physics',
        bookTitle: 'भौतिकी (Physics)',
      },
    ];
  }

  if (subject.id === 'history') {
    return [
      {
        id: 'ch-c10-soc-his-01',
        chapterNumber: 1,
        chapterNumberFormatted: 'Ch 01',
        displayTitle: 'यूरोप में राष्ट्रवाद',
        tabLabel: 'इतिहास Ch 01 — यूरोप में राष्ट्रवाद',
        bookId: 'b-c10-soc-history',
        bookTitle: 'इतिहास की दुनिया (भाग-2)',
      },
      {
        id: 'ch-c10-soc-his-02',
        chapterNumber: 2,
        chapterNumberFormatted: 'Ch 02',
        displayTitle: 'समाजवाद एवं साम्यवाद',
        tabLabel: 'इतिहास Ch 02 — समाजवाद एवं साम्यवाद',
        bookId: 'b-c10-soc-history',
        bookTitle: 'इतिहास की दुनिया (भाग-2)',
      },
      {
        id: 'ch-c10-soc-his-03',
        chapterNumber: 3,
        chapterNumberFormatted: 'Ch 03',
        displayTitle: 'हिन्द-चीन में राष्ट्रवादी आंदोलन',
        tabLabel: 'इतिहास Ch 03 — हिन्द-चीन में राष्ट्रवादी आंदोलन',
        bookId: 'b-c10-soc-history',
        bookTitle: 'इतिहास की दुनिया (भाग-2)',
      },
      {
        id: 'ch-c10-soc-his-04',
        chapterNumber: 4,
        chapterNumberFormatted: 'Ch 04',
        displayTitle: 'भारत में राष्ट्रवाद',
        tabLabel: 'इतिहास Ch 04 — भारत में राष्ट्रवाद',
        bookId: 'b-c10-soc-history',
        bookTitle: 'इतिहास की दुनिया (भाग-2)',
      },
      {
        id: 'ch-c10-soc-his-05',
        chapterNumber: 5,
        chapterNumberFormatted: 'Ch 05',
        displayTitle: 'अर्थव्यवस्था और आजीविका',
        tabLabel: 'इतिहास Ch 05 — अर्थव्यवस्था और आजीविका',
        bookId: 'b-c10-soc-history',
        bookTitle: 'इतिहास की दुनिया (भाग-2)',
      },
      {
        id: 'ch-c10-soc-his-06',
        chapterNumber: 6,
        chapterNumberFormatted: 'Ch 06',
        displayTitle: 'शहरीकरण एवं शहरी जीवन',
        tabLabel: 'इतिहास Ch 06 — शहरीकरण एवं शहरी जीवन',
        bookId: 'b-c10-soc-history',
        bookTitle: 'इतिहास की दुनिया (भाग-2)',
      },
      {
        id: 'ch-c10-soc-his-07',
        chapterNumber: 7,
        chapterNumberFormatted: 'Ch 07',
        displayTitle: 'व्यापार और भूमंडलीकरण',
        tabLabel: 'इतिहास Ch 07 — व्यापार और भूमंडलीकरण',
        bookId: 'b-c10-soc-history',
        bookTitle: 'इतिहास की दुनिया (भाग-2)',
      },
      {
        id: 'ch-c10-soc-his-08',
        chapterNumber: 8,
        chapterNumberFormatted: 'Ch 08',
        displayTitle: 'प्रेस-संस्कृति एवं राष्ट्रवाद',
        tabLabel: 'इतिहास Ch 08 — प्रेस-संस्कृति एवं राष्ट्रवाद',
        bookId: 'b-c10-soc-history',
        bookTitle: 'इतिहास की दुनिया (भाग-2)',
      },
    ];
  }

  if (subject.id === 'geography') {
    return [
      {
        id: 'ch-c10-soc-geo-01',
        chapterNumber: 1,
        chapterNumberFormatted: 'Ch 01',
        displayTitle: 'भारत: संसाधन एवं उपयोग',
        tabLabel: 'भूगोल Ch 01 — भारत: संसाधन एवं उपयोग',
        bookId: 'b-c10-soc-geography',
        bookTitle: 'भारत: संसाधन एवं उपयोग (भूगोल)',
      },
      {
        id: 'ch-c10-soc-geo-02',
        chapterNumber: 2,
        chapterNumberFormatted: 'Ch 02',
        displayTitle: 'कृषि (Agriculture)',
        tabLabel: 'भूगोल Ch 02 — कृषि',
        bookId: 'b-c10-soc-geography',
        bookTitle: 'भारत: संसाधन एवं उपयोग (भूगोल)',
      },
      {
        id: 'ch-c10-soc-geo-03',
        chapterNumber: 3,
        chapterNumberFormatted: 'Ch 03',
        displayTitle: 'निर्माण उद्योग एवं विनिर्माण',
        tabLabel: 'भूगोल Ch 03 — निर्माण उद्योग',
        bookId: 'b-c10-soc-geography',
        bookTitle: 'भारत: संसाधन एवं उपयोग (भूगोल)',
      },
      {
        id: 'ch-c10-soc-geo-04',
        chapterNumber: 4,
        chapterNumberFormatted: 'Ch 04',
        displayTitle: 'परिवहन, संचार एवं व्यापार',
        tabLabel: 'भूगोल Ch 04 — परिवहन, संचार एवं व्यापार',
        bookId: 'b-c10-soc-geography',
        bookTitle: 'भारत: संसाधन एवं उपयोग (भूगोल)',
      },
      {
        id: 'ch-c10-soc-geo-05',
        chapterNumber: 5,
        chapterNumberFormatted: 'Ch 05',
        displayTitle: 'बिहार: कृषि, संसाधन एवं जनसंख्या',
        tabLabel: 'भूगोल Ch 05 — बिहार: संसाधन व जनसंख्या',
        bookId: 'b-c10-soc-geography',
        bookTitle: 'भारत: संसाधन एवं उपयोग (भूगोल)',
      },
      {
        id: 'ch-c10-soc-geo-06',
        chapterNumber: 6,
        chapterNumberFormatted: 'Ch 06',
        displayTitle: 'मानचित्र अध्ययन (आपदा प्रबंधन)',
        tabLabel: 'भूगोल Ch 06 — मानचित्र अध्ययन',
        bookId: 'b-c10-soc-geography',
        bookTitle: 'भारत: संसाधन एवं उपयोग (भूगोल)',
      },
    ];
  }

  if (subject.id === 'hindi') {
    return [
      {
        id: 'ch-c10-hin-g-01',
        chapterNumber: 1,
        chapterNumberFormatted: 'Ch 01',
        displayTitle: 'श्रम विभाजन और जाति प्रथा',
        tabLabel: 'हिंदी Ch 01 — श्रम विभाजन और जाति प्रथा',
        bookId: 'b-c10-hin-godhuli',
        bookTitle: 'गोधूलि (भाग-2)',
      },
      {
        id: 'ch-c10-hin-g-02',
        chapterNumber: 2,
        chapterNumberFormatted: 'Ch 02',
        displayTitle: 'विष के दाँत',
        tabLabel: 'हिंदी Ch 02 — विष के दाँत',
        bookId: 'b-c10-hin-godhuli',
        bookTitle: 'गोधूलि (भाग-2)',
      },
      {
        id: 'ch-c10-hin-g-03',
        chapterNumber: 3,
        chapterNumberFormatted: 'Ch 03',
        displayTitle: 'भारत से हम क्या सीखें',
        tabLabel: 'हिंदी Ch 03 — भारत से हम क्या सीखें',
        bookId: 'b-c10-hin-godhuli',
        bookTitle: 'गोधूलि (भाग-2)',
      },
      {
        id: 'ch-c10-hin-k-03',
        chapterNumber: 3,
        chapterNumberFormatted: 'Ch K03',
        displayTitle: 'अति सूधो सनेह को मारग है (काव्य)',
        tabLabel: 'हिंदी Ch K03 — अति सूधो सनेह को मारग है',
        bookId: 'b-c10-hin-godhuli',
        bookTitle: 'गोधूलि काव्य खंड (भाग-2)',
      },
      {
        id: 'ch-c10-hin-v-01',
        chapterNumber: 1,
        chapterNumberFormatted: 'Ch V01',
        displayTitle: 'दही वाली मंगम्मा (वर्णिका)',
        tabLabel: 'हिंदी Ch V01 — दही वाली मंगम्मा',
        bookId: 'b-c10-hin-varnika',
        bookTitle: 'वर्णिका (भाग-2)',
      },
    ];
  }

  if (subject.id === 'biology') {
    return [
      {
        id: 'ch-c10-sci-bio-01',
        chapterNumber: 1,
        chapterNumberFormatted: 'Ch 01',
        displayTitle: 'जैव प्रक्रम (Life Processes)',
        tabLabel: 'जीव विज्ञान Ch 01 — जैव प्रक्रम',
        bookId: 'b-c10-sci-biology',
        bookTitle: 'जीव विज्ञान (Biology)',
      },
      {
        id: 'ch-c10-sci-bio-02',
        chapterNumber: 2,
        chapterNumberFormatted: 'Ch 02',
        displayTitle: 'नियंत्रण एवं समन्वय',
        tabLabel: 'जीव विज्ञान Ch 02 — नियंत्रण एवं समन्वय',
        bookId: 'b-c10-sci-biology',
        bookTitle: 'जीव विज्ञान (Biology)',
      },
      {
        id: 'ch-c10-sci-bio-03',
        chapterNumber: 3,
        chapterNumberFormatted: 'Ch 03',
        displayTitle: 'जीव जनन कैसे करते हैं?',
        tabLabel: 'जीव विज्ञान Ch 03 — जीव जनन कैसे करते हैं',
        bookId: 'b-c10-sci-biology',
        bookTitle: 'जीव विज्ञान (Biology)',
      },
      {
        id: 'ch-c10-sci-bio-04',
        chapterNumber: 4,
        chapterNumberFormatted: 'Ch 04',
        displayTitle: 'आनुवंशिकता एवं जैव विकास',
        tabLabel: 'जीव विज्ञान Ch 04 — आनुवंशिकता एवं जैव विकास',
        bookId: 'b-c10-sci-biology',
        bookTitle: 'जीव विज्ञान (Biology)',
      },
      {
        id: 'ch-c10-sci-bio-05',
        chapterNumber: 5,
        chapterNumberFormatted: 'Ch 05',
        displayTitle: 'हमारा पर्यावरण',
        tabLabel: 'जीव विज्ञान Ch 05 — हमारा पर्यावरण',
        bookId: 'b-c10-sci-biology',
        bookTitle: 'जीव विज्ञान (Biology)',
      },
      {
        id: 'ch-c10-sci-bio-06',
        chapterNumber: 6,
        chapterNumberFormatted: 'Ch 06',
        displayTitle: 'प्राकृतिक संसाधनों का संपोषित प्रबंधन',
        tabLabel: 'जीव विज्ञान Ch 06 — प्राकृतिक संसाधन प्रबंधन',
        bookId: 'b-c10-sci-biology',
        bookTitle: 'जीव विज्ञान (Biology)',
      },
    ];
  }

  if (subject.id === 'chemistry') {
    return [
      {
        id: 'ch-c10-sci-ch-01',
        chapterNumber: 1,
        chapterNumberFormatted: 'Ch 01',
        displayTitle: 'रासायनिक अभिक्रियाएँ एवं समीकरण',
        tabLabel: 'रसायन Ch 01 — रासायनिक अभिक्रियाएँ एवं समीकरण',
        bookId: 'b-c10-sci-chemistry',
        bookTitle: 'रसायन शास्त्र (Chemistry)',
      },
      {
        id: 'ch-c10-sci-ch-02',
        chapterNumber: 2,
        chapterNumberFormatted: 'Ch 02',
        displayTitle: 'अम्ल, क्षारक एवं लवण',
        tabLabel: 'रसायन Ch 02 — अम्ल, क्षारक एवं लवण',
        bookId: 'b-c10-sci-chemistry',
        bookTitle: 'रसायन शास्त्र (Chemistry)',
      },
      {
        id: 'ch-c10-sci-ch-03',
        chapterNumber: 3,
        chapterNumberFormatted: 'Ch 03',
        displayTitle: 'धातु एवं अधातु',
        tabLabel: 'रसायन Ch 03 — धातु एवं अधातु',
        bookId: 'b-c10-sci-chemistry',
        bookTitle: 'रसायन शास्त्र (Chemistry)',
      },
      {
        id: 'ch-c10-sci-ch-04',
        chapterNumber: 4,
        chapterNumberFormatted: 'Ch 04',
        displayTitle: 'कार्बन एवं उसके यौगिक',
        tabLabel: 'रसायन Ch 04 — कार्बन एवं उसके यौगिक',
        bookId: 'b-c10-sci-chemistry',
        bookTitle: 'रसायन शास्त्र (Chemistry)',
      },
      {
        id: 'ch-c10-sci-ch-05',
        chapterNumber: 5,
        chapterNumberFormatted: 'Ch 05',
        displayTitle: 'तत्वों का आवर्त वर्गीकरण',
        tabLabel: 'रसायन Ch 05 — तत्वों का आवर्त वर्गीकरण',
        bookId: 'b-c10-sci-chemistry',
        bookTitle: 'रसायन शास्त्र (Chemistry)',
      },
    ];
  }

  // Fallback to filtering from CHAPTERS array for any other subject
  const candidateChapters = CHAPTERS.filter((ch) => {
    if (ch.classLevel !== normClass && ch.classId !== normClass) return false;

    if (subject.id === 'math') {
      return ch.bookId?.includes('math') || ch.subjectId === 'c10-math';
    }
    if (subject.id === 'sanskrit') {
      return ch.bookId?.includes('san') || ch.subjectId === 'c10-san';
    }
    if (subject.id === 'civics') {
      return ch.bookId?.includes('civics');
    }
    if (subject.id === 'economics') {
      return ch.bookId?.includes('economics');
    }
    if (subject.id === 'urdu') {
      return ch.bookId?.includes('urdu');
    }
    return false;
  });

  if (candidateChapters.length > 0) {
    return candidateChapters.map((ch) => {
      const chNum = ch.chapterNumber || 1;
      const padNum = `Ch ${String(chNum).padStart(2, '0')}`;
      const title = cleanChapterTitle(ch.hindiTitle || ch.title);
      return {
        id: ch.id,
        chapterNumber: chNum,
        chapterNumberFormatted: padNum,
        displayTitle: title,
        tabLabel: `${subject.shortName} ${padNum} — ${title}`,
        bookId: ch.bookId,
        subjectId: ch.subjectId,
        bookTitle: ch.title,
      };
    });
  }

  // If no predefined list found, return an empty array (respects rule: never show unrelated chapters)
  return [];
}
