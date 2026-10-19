/**
 * RK STUDY CENTRE - PDF Subject & Chapter Identification Engine
 * 
 * Pipeline:
 * Current PDF -> Identify Subject -> Show Subject Tab -> Load Subject Chapters -> Display Chapter Number + Chapter Name
 */

import { SUBJECTS, BOOKS, CHAPTERS } from '../lib/constants';

export interface IdentifiedPDFSubjectResult {
  classLevel: string;
  subjectId: string;
  subjectSlug: string;
  subjectName: string;
  subjectHindiName: string;
  matchedBookId?: string;
  matchedChapterId?: string;
  matchedChapterNumber?: number;
  matchedChapterName?: string;
  chapters: Array<{
    id: string;
    chapterNumber: number;
    title: string;
    hindiTitle?: string;
    bookId: string;
    slug: string;
  }>;
  confidence: 'high' | 'medium' | 'fallback';
}

/**
 * Automatically identifies the subject and chapters for any given PDF title, filename, or content keywords.
 */
export function identifySubjectAndChaptersForPDF(
  pdfInput: { title?: string; fileName?: string; content?: string; subjectName?: string; classLevel?: string },
  targetClass: string = 'class-10'
): IdentifiedPDFSubjectResult {
  const text = `${pdfInput.title || ''} ${pdfInput.fileName || ''} ${pdfInput.content || ''} ${pdfInput.subjectName || ''}`.toLowerCase();
  
  const classSubjects = SUBJECTS.filter((s) => s.classLevel === targetClass);

  let matchedSubject = classSubjects[0];
  let confidence: 'high' | 'medium' | 'fallback' = 'fallback';

  // Keyword mapping for Bihar Board Subjects
  if (text.includes('भौतिकी') || text.includes('physics') || text.includes('प्रकाश') || text.includes('विद्युत') || text.includes('चुंबक') || text.includes('lens') || text.includes('light')) {
    matchedSubject = classSubjects.find(s => s.slug === 'sci' || s.id.includes('phy') || s.name.toLowerCase().includes('science')) || classSubjects[0];
    confidence = 'high';
  } else if (text.includes('रसायन') || text.includes('chemistry') || text.includes('अम्ल') || text.includes('क्षारक') || text.includes('धातु') || text.includes('कार्बन') || text.includes('acid') || text.includes('metal')) {
    matchedSubject = classSubjects.find(s => s.slug === 'sci' || s.id.includes('chem') || s.name.toLowerCase().includes('science')) || classSubjects[0];
    confidence = 'high';
  } else if (text.includes('जीवविज्ञान') || text.includes('biology') || text.includes('जैव') || text.includes('कोशिका') || text.includes('प्रजनन') || text.includes('आनुवंशिकी') || text.includes('life') || text.includes('bio')) {
    matchedSubject = classSubjects.find(s => s.slug === 'sci' || s.id.includes('bio') || s.name.toLowerCase().includes('science')) || classSubjects[0];
    confidence = 'high';
  } else if (text.includes('गणित') || text.includes('math') || text.includes('संख्या') || text.includes('त्रिकोणमिति') || text.includes('बीजगणित') || text.includes('प्रायिकता') || text.includes('polynomial') || text.includes('triangle')) {
    matchedSubject = classSubjects.find(s => s.slug === 'math' || s.name.toLowerCase().includes('math')) || classSubjects[1] || classSubjects[0];
    confidence = 'high';
  } else if (text.includes('इतिहास') || text.includes('history') || text.includes('राष्ट्रवाद') || text.includes('यूरोप') || text.includes('समाजवाद') || text.includes('revolution')) {
    matchedSubject = classSubjects.find(s => s.slug === 'soc' || s.name.toLowerCase().includes('social')) || classSubjects[2] || classSubjects[0];
    confidence = 'high';
  } else if (text.includes('भूगोल') || text.includes('geography') || text.includes('संसाधन') || text.includes('मानचित्र') || text.includes('कृषि') || text.includes('वन') || text.includes('resource')) {
    matchedSubject = classSubjects.find(s => s.slug === 'soc' || s.name.toLowerCase().includes('social')) || classSubjects[2] || classSubjects[0];
    confidence = 'high';
  } else if (text.includes('राजनीति') || text.includes('civics') || text.includes('लोकतंत्र') || text.includes('सत्ता') || text.includes('democracy')) {
    matchedSubject = classSubjects.find(s => s.slug === 'soc' || s.name.toLowerCase().includes('social')) || classSubjects[2] || classSubjects[0];
    confidence = 'high';
  } else if (text.includes('अर्थशास्त्र') || text.includes('economics') || text.includes('विकास') || text.includes('मुद्रा') || text.includes('व्यापार') || text.includes('bank')) {
    matchedSubject = classSubjects.find(s => s.slug === 'soc' || s.name.toLowerCase().includes('social')) || classSubjects[2] || classSubjects[0];
    confidence = 'high';
  } else if (text.includes('हिन्दी') || text.includes('hindi') || text.includes('गोतमी') || text.includes('वर्णिका') || text.includes('श्रम विभाजन') || text.includes('विष के दाँत')) {
    matchedSubject = classSubjects.find(s => s.slug === 'hin' || s.name.toLowerCase().includes('hindi')) || classSubjects[0];
    confidence = 'high';
  } else if (text.includes('संस्कृत') || text.includes('sanskrit') || text.includes('पीयूषम्') || text.includes('मंगलम्') || text.includes('पाटलिपुत्र')) {
    matchedSubject = classSubjects.find(s => s.slug === 'san' || s.name.toLowerCase().includes('sanskrit')) || classSubjects[0];
    confidence = 'high';
  } else if (text.includes('अंग्रेजी') || text.includes('english') || text.includes('panorama') || text.includes('prose') || text.includes('poetry')) {
    matchedSubject = classSubjects.find(s => s.slug === 'eng' || s.name.toLowerCase().includes('english')) || classSubjects[0];
    confidence = 'high';
  }

  // Load subject chapters
  const subjectChapters = CHAPTERS.filter(c => c.subjectId === matchedSubject.id);
  const subjectBooks = BOOKS.filter(b => b.subjectId === matchedSubject.id);

  // Attempt to match specific chapter number or keyword in chapter title
  let matchedChapterNumber: number | undefined;
  let matchedChapterName: string | undefined;
  let matchedChapterId: string | undefined;
  let matchedBookId: string | undefined;

  const chapterRegex = /(?:अध्याय|chapter|ch\.?)\s*([0-9]+)/i;
  const matchNum = text.match(chapterRegex);
  if (matchNum && matchNum[1]) {
    const chNum = parseInt(matchNum[1], 10);
    matchedChapterNumber = chNum;
    const foundChap = subjectChapters.find(c => c.chapterNumber === chNum);
    if (foundChap) {
      matchedChapterId = foundChap.id;
      matchedChapterName = foundChap.hindiTitle || foundChap.title;
      matchedBookId = foundChap.bookId;
      confidence = 'high';
    }
  }

  // If no chapter number matched, try matching title keywords
  if (!matchedChapterId && subjectChapters.length > 0) {
    const foundByKeyword = subjectChapters.find(c => 
      text.includes(c.title.toLowerCase()) || 
      (c.hindiTitle && text.includes(c.hindiTitle.toLowerCase()))
    );
    if (foundByKeyword) {
      matchedChapterId = foundByKeyword.id;
      matchedChapterNumber = foundByKeyword.chapterNumber;
      matchedChapterName = foundByKeyword.hindiTitle || foundByKeyword.title;
      matchedBookId = foundByKeyword.bookId;
      confidence = 'medium';
    } else {
      // Default to first chapter of the subject
      matchedChapterId = subjectChapters[0].id;
      matchedChapterNumber = subjectChapters[0].chapterNumber;
      matchedChapterName = subjectChapters[0].hindiTitle || subjectChapters[0].title;
      matchedBookId = subjectChapters[0].bookId;
    }
  }

  return {
    classLevel: targetClass,
    subjectId: matchedSubject.id,
    subjectSlug: matchedSubject.slug,
    subjectName: matchedSubject.name,
    subjectHindiName: matchedSubject.hindiName,
    matchedBookId,
    matchedChapterId,
    matchedChapterNumber,
    matchedChapterName,
    chapters: subjectChapters.map(c => ({
      id: c.id,
      chapterNumber: c.chapterNumber,
      title: c.title,
      hindiTitle: c.hindiTitle,
      bookId: c.bookId,
      slug: c.slug,
    })),
    confidence,
  };
}
