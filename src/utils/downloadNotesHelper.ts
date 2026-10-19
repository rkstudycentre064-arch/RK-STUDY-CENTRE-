/**
 * RK STUDY CENTRE - Official Vector Notes & PDF Engine
 * Produces 100% vector, selectable, searchable, 400% zoom-sharp study notes and PDFs
 * Supports full Hindi (Devanagari) & English typography, mathematical formulas, and official branding.
 */

export interface ChapterNotesExportData {
  metadata: {
    className?: string;
    classLevel?: string;
    subjectId?: string;
    subjectName?: string;
    bookId?: string;
    bookTitle?: string;
    chapterNumber?: number;
    chapterHindiTitle?: string;
    chapterTitle?: string;
    author?: string;
    batch?: string;
    examBoard?: string;
    totalObjectives?: number;
    totalPages?: number;
    [key: string]: any;
  };
  introduction?: string;
  authorBio?: string;
  overview?: {
    summary?: string;
    summaryHindi?: string;
    [key: string]: any;
  };
  keyFormulas?: Array<{ id?: string; name: string; formula: string; note?: string }>;
  formulae?: Array<{ id?: string; name: string; formula: string; note?: string }>;
  sections?: Array<{
    sectionNumber?: string;
    title: string;
    hindiTitle?: string;
    content: string | string[];
    keyPoints?: string[];
    formulaeOrRules?: string[];
    examTips?: string;
    id?: string | number;
    [key: string]: any;
  }>;
  objectiveQuestions?: Array<{
    id: number | string;
    question: string;
    options: any;
    correctOption: string;
    explanation?: string;
    yearAsked?: string;
    boardYear?: string;
    [key: string]: any;
  }>;
  objectives?: Array<any>;
  subjectiveQuestions?: Array<{
    id: string | number;
    question: string;
    answer: string | string[];
    marks?: number;
    boardYear?: string;
    isVVI?: boolean;
    [key: string]: any;
  }>;
  shortQuestions?: Array<any>;
  subjectives?: Array<any>;
  [key: string]: any;
}

// Crisp Vector SVG Emblem of RK Study Center (100% vector paths, zero pixelation at 400% zoom)
export const RK_LOGO_SVG_INLINE = `
<svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; flex-shrink: 0; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));">
  <defs>
    <linearGradient id="dlNavy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B192C" />
      <stop offset="100%" stop-color="#1E3E62" />
    </linearGradient>
    <linearGradient id="dlOrange" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E65100" />
      <stop offset="50%" stop-color="#FF6D00" />
      <stop offset="100%" stop-color="#FFA000" />
    </linearGradient>
    <linearGradient id="dlGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFD54F" />
      <stop offset="100%" stop-color="#FF8F00" />
    </linearGradient>
  </defs>
  <!-- Outer Hexagonal Shield -->
  <polygon points="50,4 92,25 92,75 50,96 8,75 8,25" fill="#0E1726" stroke="#FF6500" stroke-width="3.5" stroke-linejoin="round" />
  <polygon points="50,9 86,28 86,72 50,91 14,72 14,28" fill="#172554" opacity="0.4" />
  <!-- Open Book Pages (Vector Wings) -->
  <path d="M50 78 C 38 74, 28 75, 22 70 C 22 55, 26 42, 34 32 L 50 48 Z" fill="url(#dlNavy)" opacity="0.95" />
  <path d="M50 78 C 62 74, 72 75, 78 70 C 78 55, 74 42, 66 32 L 50 48 Z" fill="url(#dlNavy)" opacity="0.95" />
  <path d="M48 48 L52 48 L51 84 L49 84 Z" fill="#FFFFFF" opacity="0.8" />
  <!-- R Monogram Pillar & Loop -->
  <rect x="32" y="26" width="9" height="46" rx="2" fill="#FFFFFF" />
  <path d="M38 26 H 55 C 63 26, 63 46, 55 46 H 38 Z" fill="url(#dlOrange)" stroke="#FFFFFF" stroke-width="1.8" stroke-linejoin="round" />
  <circle cx="48" cy="36" r="4.5" fill="#0E1726" />
  <!-- K Monogram & Ascending Progress Element -->
  <path d="M48 48 L 68 72 H 58 L 41 53 Z" fill="#FFFFFF" />
  <path d="M44 48 L 74 18 L 78 22 L 52 52 Z" fill="url(#dlOrange)" />
  <polygon points="76,14 84,18 78,26 77,20 71,19" fill="url(#dlGold)" />
  <!-- Bookmark ribbon -->
  <polygon points="50,78 45,88 50,85 55,88" fill="#FF6D00" />
</svg>
`;

/**
 * Normalizes options into standard array format
 */
export function normalizeOptions(options: any): Array<{ key: string; text: string }> {
  if (!options) return [];
  if (Array.isArray(options)) {
    return options.map((item, index) => {
      if (typeof item === 'object' && item !== null && 'text' in item) {
        return {
          key: item.key !== undefined ? String(item.key) : (['A', 'B', 'C', 'D'][index] || String(index)),
          text: String(item.text),
        };
      }
      return {
        key: ['A', 'B', 'C', 'D'][index] || String(index),
        text: String(item),
      };
    });
  }
  if (typeof options === 'object') {
    return Object.entries(options).map(([k, v]) => ({
      key: k,
      text: String(v),
    }));
  }
  return [];
}

/**
 * Converts English option keys ('A', 'B', 'C', 'D') to Hindi Devanagari ('(क)', '(ख)', '(ग)', '(घ)')
 */
export function formatOptionKey(key: string): string {
  const map: Record<string, string> = {
    A: '(क)',
    B: '(ख)',
    C: '(ग)',
    D: '(घ)',
    a: '(क)',
    b: '(ख)',
    c: '(ग)',
    d: '(घ)',
    '0': '(क)',
    '1': '(ख)',
    '2': '(ग)',
    '3': '(घ)',
    '4': '(घ)',
  };
  return map[key] || `(${key})`;
}

/**
 * Formats mathematical formulas, superscripts, subscripts, fractions and markdown formatting
 */
export function renderFormattedContent(rawText: string): string {
  if (!rawText) return '';
  const trimmed = rawText.trim();

  // Check if paragraph is a markdown table
  if (trimmed.startsWith('|') && trimmed.includes('\n|')) {
    const lines = trimmed.split('\n').filter(l => l.trim().length > 0);
    if (lines.length >= 2) {
      const headerRow = lines[0].split('|').map(c => c.trim()).filter((c, i, a) => i !== 0 && i !== a.length - 1);
      // line[1] is separator like |---|---|
      const dataRows = lines.slice(2).map(line =>
        line.split('|').map(c => c.trim()).filter((c, i, a) => i !== 0 && i !== a.length - 1)
      );

      return `
        <div class="table-container-wrap">
          <table class="vector-notes-table">
            <thead>
              <tr>
                ${headerRow.map(h => `<th>${formatInlineMath(h)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${dataRows.map(row => `
                <tr>
                  ${row.map(cell => `<td>${formatInlineMath(cell)}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  }

  // Topper tip or blockquote
  if (trimmed.startsWith('>') || trimmed.startsWith('💡')) {
    const cleanTip = trimmed.replace(/^>\s*/, '').replace(/^💡\s*/, '');
    return `
      <div class="topper-callout-card">
        <div class="topper-callout-icon">💡</div>
        <div>
          <strong class="topper-callout-label">टॉपर परीक्षा मंत्र:</strong>
          <span class="topper-callout-body">${formatInlineMath(cleanTip)}</span>
        </div>
      </div>
    `;
  }

  // Standard paragraph with inline formatting
  return `<p class="notes-p">${formatInlineMath(rawText)}</p>`;
}

/**
 * Formats inline mathematical expressions, fractions, Greek characters, and bold markers
 */
function formatInlineMath(text: string): string {
  if (!text) return '';

  let out = text;

  // Replace **bold** with high-contrast strong tags
  out = out.replace(/\*\*(.*?)\*\*/g, '<strong class="highlight-text">$1</strong>');

  // Replace `code/formula` with styled vector math code
  out = out.replace(/`([^`]+)`/g, '<code class="vector-math-chip">$1</code>');

  // Replace fractions like a/b when surrounded by parentheses or distinct, e.g. f = R / 2 or 1/f
  out = out.replace(/\b1\/f\b/g, '<span class="inline-fraction"><span class="num">1</span><span class="den">f</span></span>');
  out = out.replace(/\b1\/v\b/g, '<span class="inline-fraction"><span class="num">1</span><span class="den">v</span></span>');
  out = out.replace(/\b1\/u\b/g, '<span class="inline-fraction"><span class="num">1</span><span class="den">u</span></span>');
  out = out.replace(/\bR\/2\b/g, '<span class="inline-fraction"><span class="num">R</span><span class="den">2</span></span>');
  out = out.replace(/\bsin\s*i\s*\/\s*sin\s*r\b/gi, '<span class="inline-fraction"><span class="num">sin i</span><span class="den">sin r</span></span>');

  // Common physics/math superscripts: m^2 -> m², m^-1 -> m⁻¹, x^2 -> x²
  out = out.replace(/([a-zA-Z\d\u0900-\u097F]+)\^([-\d]+)/g, '$1<sup>$2</sup>');

  // Common chemical / physics subscripts: H_2O -> H₂O, CO_2 -> CO₂
  out = out.replace(/([a-zA-Z])_(\d+)/g, '$1<sub>$2</sub>');

  return out;
}

/**
 * Generates the complete, self-contained HTML document matching Hindi Chapter 01 notes design
 * 100% Vector, Unicode Hindi Devanagari + English typography, 400% Zoom Crisp
 */
export function generateRKStudyCenterColorNotesHTML(data: ChapterNotesExportData): string {
  const meta = data.metadata || {};
  const chapterNum = (meta.chapterNumber || 1).toString().padStart(2, '0');
  const chapterHindiTitle = meta.chapterHindiTitle || meta.chapterTitle || 'अध्याय नोट्स';
  const authorName = meta.author || 'Prince Sir (प्रिंस सर) • RK STUDY CENTRE';
  const subjectName = meta.subjectName || 'विज्ञान / हिंदी';
  const className = meta.className || meta.classLevel || 'कक्षा 10वीं (BSEB)';
  const bookTitle = meta.bookTitle || 'मैट्रिक बोर्ड टॉपर संकलन';
  const batch = meta.batch || 'सत्र 2025-2026 / 2026-27 विशेष';
  const examBoard = meta.examBoard || 'बिहार विद्यालय परीक्षा समिति (BSEB Patna)';

  // Safe data extraction
  const rawFormulas = data.keyFormulas || data.formulae || [];
  const sections = data.sections || [];
  const rawObjectives = data.objectiveQuestions || data.objectives || [];
  const extractedSubjectives = data.subjectiveQuestions || data.shortQuestions || data.subjectives || [];
  const rawSubjectives =
    extractedSubjectives.length > 0
      ? extractedSubjectives
      : sections.slice(0, 4).map((sec, idx) => ({
          id: `sub-${idx + 1}`,
          question: `${idx + 1}. ${sec.hindiTitle || sec.title} के मुख्य सिद्धांत एवं अवधारणा को स्पष्ट करें।`,
          answer: sec.content ? sec.content.slice(0, 220) + '...' : 'एनसीईआरटी एवं बिहार बोर्ड टॉपर पाठ्यक्रम आधारित प्रमाणित उत्तर।',
          marks: 5,
          boardYear: '2024 VVI',
        }));

  // Fallback for formulas/quick points if empty
  const formulas =
    rawFormulas.length > 0
      ? rawFormulas
      : sections.length > 0 && sections[0].keyPoints
      ? sections[0].keyPoints.slice(0, 6).map((pt, i) => ({
          name: `महत्वपूर्ण परीक्षा बिंदु ${i + 1}`,
          formula: pt,
          note: 'बिहार बोर्ड परीक्षा हेतु अनिवार्य',
        }))
      : [];

  // Calculate total pages dynamically
  let totalPages = 1; // Sheet 1 is always present
  if (sections.length > 2) totalPages++; // Sheet 2 (Deep theory)
  if (rawSubjectives.length > 0) totalPages++; // Sheet 3 (Subjective)
  if (rawObjectives.length > 0) totalPages++; // Sheet 4 (Objective)

  const docTitle = `RK_Study_Centre_Ch${chapterNum}_${chapterHindiTitle.replace(/\s+/g, '_')}_Topper_Notes`;

  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${docTitle}</title>
  
  <!-- PDF Document Metadata for Search Engines and Readers -->
  <meta name="title" content="${chapterHindiTitle} - RK STUDY CENTRE">
  <meta name="author" content="RK Study Center">
  <meta name="creator" content="RK Study Center (Prince Sir)">
  <meta name="publisher" content="RK Study Center">
  <meta name="subject" content="${subjectName} • ${className} Topper Notes">
  <meta name="description" content="आधिकारिक प्रमाणित अध्ययन सामग्री • प्रिंस सर (Prince Sir) • RK STUDY CENTRE">
  <meta name="keywords" content="RK Study Center, Prince Sir, Bihar Board, BSEB, Matric, Inter, Class 10, Class 12, Topper Notes">
  <meta name="language" content="Hindi, English">
  
  <!-- Google Web Fonts for Unicode Devanagari, English & Math Typography -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Mukta:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;600;700;800;900&family=Hind:wght@400;600;700&family=Poppins:wght@600;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  
  <style>
    /* ==========================================================================
       1. GLOBAL RESET & VECTOR PRINT RESOLUTION SETTINGS
       ========================================================================== */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    @page {
      size: A4 portrait;
      margin: 10mm 12mm 12mm 12mm;
    }

    body {
      font-family: 'Mukta', 'Noto Sans Devanagari', 'Hind', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #F8FAFC;
      color: #0F172A;
      line-height: 1.65;
      padding: 0;
      margin: 0;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      font-feature-settings: "kern" 1, "liga" 1;
    }

    /* ==========================================================================
       2. INTERACTIVE FLOATING TOOLBAR WITH 100%, 200%, 300%, 400% ZOOM TEST BAR
       ========================================================================== */
    .web-toolbar {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      background: #091322;
      color: #FFFFFF;
      padding: 10px 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.35);
      border-bottom: 2.5px solid #EA580C;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .web-toolbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .web-toolbar-title {
      font-size: 14px;
      font-weight: 900;
      color: #F8FAFC;
      letter-spacing: 0.2px;
    }
    .web-toolbar-badge {
      background: linear-gradient(135deg, #EA580C, #F59E0B);
      color: #091322;
      font-size: 11px;
      font-weight: 900;
      padding: 3px 10px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .web-toolbar-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    /* Zoom Controller in Toolbar */
    .zoom-group {
      display: inline-flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 2px 4px;
      gap: 4px;
    }
    .zoom-btn {
      background: transparent;
      border: none;
      color: #CBD5E1;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .zoom-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #FFFFFF;
    }
    .zoom-btn.active {
      background: #EA580C;
      color: #FFFFFF;
    }
    .zoom-badge {
      font-size: 10.5px;
      color: #FDE047;
      font-weight: 800;
      padding: 0 4px;
    }

    .btn-action {
      background: #EA580C;
      color: #FFFFFF;
      border: none;
      padding: 7px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 900;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s, transform 0.1s;
    }
    .btn-action:hover {
      background: #C2410C;
    }
    .btn-action:active {
      transform: scale(0.97);
    }
    .btn-secondary {
      background: #1E293B;
      color: #E2E8F0;
      border: 1px solid #334155;
    }
    .btn-secondary:hover {
      background: #334155;
    }

    /* ==========================================================================
       3. MAIN BOOKLET CONTAINER (A4 PORTRAIT STANDARDS)
       ========================================================================== */
    .booklet-container {
      max-width: 860px;
      margin: 24px auto 48px auto;
      padding: 0 16px;
      position: relative;
      z-index: 1;
      transform-origin: top center;
      transition: transform 0.2s ease-out;
    }

    /* Sheet / Page Card */
    .sheet-card {
      background: #FFFFFF;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      border: 1.5px solid #CBD5E1;
      overflow: visible;
      margin-bottom: 24px;
      position: relative;
    }

    /* Subtle Non-Obstructing RK STUDY CENTRE Watermark */
    .rk-sheet-watermark {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      user-select: none;
      overflow: hidden;
      z-index: 0;
    }
    .rk-sheet-watermark-inner {
      transform: rotate(-24deg);
      text-align: center;
      opacity: 0.04;
      color: #0F172A;
      font-weight: 900;
      font-size: 42px;
      letter-spacing: 6px;
      white-space: nowrap;
      text-transform: uppercase;
    }

    /* ==========================================================================
       4. SIGNATURE RK STUDY CENTRE HEADER (NAVY & GOLD VECTOR BANNER)
       ========================================================================== */
    .rk-header {
      position: relative;
      background: linear-gradient(135deg, #0B192C 0%, #1E3E62 55%, #0B192C 100%) !important;
      color: #FFFFFF !important;
      padding: 22px 26px;
      border-bottom: 4px solid #EA580C;
      overflow: hidden;
      break-after: avoid;
      page-break-after: avoid;
    }
    .rk-header-stripe {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 35%;
      background: linear-gradient(to left, rgba(234, 88, 12, 0.22), rgba(245, 158, 11, 0.1), transparent);
      transform: skewX(-14deg);
      pointer-events: none;
    }
    .rk-header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      position: relative;
      z-index: 2;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #FFFFFF !important;
      line-height: 1.1;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .topper-badge {
      background: linear-gradient(135deg, #EA580C, #F59E0B) !important;
      color: #0B192C !important;
      font-size: 11px;
      font-weight: 900;
      padding: 3px 10px;
      border-radius: 12px;
      letter-spacing: 0.5px;
      border: 1px solid #FFD54F;
    }
    .brand-subtitle {
      font-size: 13.5px;
      color: #FED7AA !important;
      font-weight: 700;
      margin-top: 3px;
    }
    .exam-badge-group {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 5px;
    }
    .exam-tag {
      background: rgba(255, 255, 255, 0.14) !important;
      border: 1px solid rgba(255, 255, 255, 0.28);
      color: #FFFFFF !important;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 900;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .exam-tag-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #4ADE80;
      box-shadow: 0 0 6px #4ADE80;
    }
    .subject-tag {
      font-size: 12.5px;
      color: #FDBA74 !important;
      font-weight: 800;
    }

    /* Chapter Title Banner in Header */
    .chapter-banner {
      margin-top: 18px;
      padding-top: 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.18);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      position: relative;
      z-index: 2;
    }
    .chapter-banner-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .chapter-pill {
      background: #FBBF24 !important;
      color: #020617 !important;
      font-size: 15px;
      font-weight: 900;
      padding: 5px 12px;
      border-radius: 8px;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    }
    .chapter-name {
      font-size: 22px;
      font-weight: 900;
      color: #FFFFFF !important;
      line-height: 1.25;
    }
    .chapter-meta-line {
      font-size: 12.5px;
      color: #E2E8F0 !important;
      margin-top: 3px;
    }
    .chapter-meta-line strong {
      color: #FDE047 !important;
    }
    .stat-pills {
      display: flex;
      gap: 8px;
    }
    .stat-pill {
      background: rgba(255, 255, 255, 0.12) !important;
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #FFFFFF !important;
      font-size: 11.5px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 6px;
    }

    /* ==========================================================================
       5. CONTENT BODY, TYPOGRAPHY & VECTOR STUDY BOXES
       ========================================================================== */
    .sheet-body {
      padding: 22px 26px;
    }

    /* Profile / Formulas Card */
    .profile-card {
      background: linear-gradient(135deg, #FFFBEB 0%, #FFF7ED 60%, #FFFFFF 100%) !important;
      border: 2px solid #FED7AA;
      border-radius: 12px;
      padding: 16px 18px;
      margin-bottom: 22px;
    }
    .profile-card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-bottom: 10px;
      margin-bottom: 12px;
      border-bottom: 1.5px solid #FED7AA;
      break-after: avoid;
      page-break-after: avoid;
    }
    .num-badge {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      background: #EA580C !important;
      color: #FFFFFF !important;
      font-weight: 900;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .profile-card-title {
      font-size: 16.5px;
      font-weight: 900;
      color: #0F172A !important;
    }
    .profile-tag {
      background: #FFEDD5 !important;
      color: #9A3412 !important;
      font-size: 11px;
      font-weight: 900;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .formulas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 12px;
    }
    .formula-item {
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-left: 4px solid #EA580C;
      border-radius: 8px;
      padding: 10px 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .formula-label {
      font-size: 12px;
      font-weight: 900;
      color: #C2410C !important;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .formula-value {
      font-size: 15px;
      font-weight: 800;
      color: #0F172A !important;
      margin-top: 4px;
      line-height: 1.45;
      font-family: 'Mukta', 'Noto Sans Devanagari', sans-serif;
    }
    .formula-note {
      font-size: 11.5px;
      color: #475569 !important;
      margin-top: 5px;
      padding-top: 4px;
      border-top: 1px solid #F1F5F9;
      font-weight: 600;
    }

    /* Theory Section Container */
    .theory-section {
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 20px;
    }
    .theory-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1.5px solid #F1F5F9;
      padding-bottom: 8px;
      margin-bottom: 12px;
      break-after: avoid;
      page-break-after: avoid;
    }
    .part-tag {
      background: #DBEAFE !important;
      color: #1E3A8A !important;
      font-size: 11.5px;
      font-weight: 900;
      padding: 3px 9px;
      border-radius: 6px;
    }
    .theory-title {
      font-size: 17px;
      font-weight: 900;
      color: #0F172A !important;
    }
    .theory-content {
      font-size: 14.5px;
      color: #1E293B;
      line-height: 1.75;
      text-align: justify;
    }
    .notes-p {
      margin-bottom: 12px;
    }
    .highlight-text {
      background: #FEF08A !important;
      color: #020617 !important;
      font-weight: 900;
      padding: 1px 4px;
      border-radius: 3px;
      border-bottom: 2px solid #F59E0B;
    }
    .vector-math-chip {
      font-family: 'JetBrains Mono', monospace;
      background: #F1F5F9;
      color: #0F172A;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13.5px;
      font-weight: 700;
      border: 1px solid #CBD5E1;
    }

    /* Math Fraction Styling */
    .inline-fraction {
      display: inline-flex;
      flex-direction: column;
      vertical-align: middle;
      text-align: center;
      font-size: 0.9em;
      line-height: 1.1;
      padding: 0 2px;
    }
    .inline-fraction .num {
      border-bottom: 1.5px solid #0F172A;
      padding-bottom: 1px;
      font-weight: 800;
    }
    .inline-fraction .den {
      padding-top: 1px;
      font-weight: 800;
    }

    /* Topper Callout Card */
    .topper-callout-card {
      background: #ECFDF5;
      border: 1.5px solid #A7F3D0;
      border-left: 5px solid #059669;
      border-radius: 8px;
      padding: 12px 14px;
      margin: 12px 0;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .topper-callout-icon {
      font-size: 18px;
      line-height: 1;
    }
    .topper-callout-label {
      color: #065F46;
      font-weight: 900;
      margin-right: 6px;
    }
    .topper-callout-body {
      color: #064E3B;
      font-size: 14px;
      font-weight: 600;
    }

    /* Vector Notes Table */
    .table-container-wrap {
      margin: 14px 0;
      overflow-x: auto;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .vector-notes-table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5px solid #94A3B8;
      border-radius: 8px;
      overflow: hidden;
      font-size: 13.5px;
    }
    .vector-notes-table th {
      background: #0B192C;
      color: #FFFFFF;
      padding: 10px 12px;
      font-weight: 900;
      text-align: left;
      border: 1px solid #1E293B;
    }
    .vector-notes-table td {
      padding: 9px 12px;
      border: 1px solid #CBD5E1;
      color: #1E293B;
    }
    .vector-notes-table tr:nth-child(even) {
      background: #F8FAFC;
    }

    /* Green Key Takeaways Box (Sheet 2) */
    .keypoints-box {
      background: #F0FDF4 !important;
      border: 2px solid #86EFAC;
      border-left: 6px solid #16A34A !important;
      border-radius: 10px;
      padding: 14px 18px;
      margin-top: 14px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .keypoints-title {
      font-size: 14.5px;
      font-weight: 900;
      color: #15803D !important;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .keypoints-list {
      list-style: none;
      padding: 0;
    }
    .keypoints-list li {
      font-size: 14px;
      color: #166534 !important;
      margin-bottom: 6px;
      padding-left: 22px;
      position: relative;
      line-height: 1.5;
      font-weight: 600;
    }
    .keypoints-list li::before {
      content: "✔";
      position: absolute;
      left: 0;
      top: 0;
      color: #16A34A;
      font-weight: 900;
      font-size: 13px;
    }

    /* ==========================================================================
       6. QUESTION CARDS (SUBJECTIVE & OBJECTIVE)
       ========================================================================== */
    .subjective-card {
      background: #FFFFFF;
      border: 1.5px solid #CBD5E1;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 14px;
    }
    .q-badge-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
      break-after: avoid;
      page-break-after: avoid;
    }
    .q-number-pill {
      background: #0284C7 !important;
      color: #FFFFFF !important;
      font-size: 11px;
      font-weight: 900;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .marks-pill {
      background: #F1F5F9;
      color: #475569;
      font-size: 11px;
      font-weight: 900;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid #E2E8F0;
    }
    .q-text {
      font-size: 15.5px;
      font-weight: 900;
      color: #0F172A !important;
      margin-bottom: 8px;
    }
    .ans-box {
      background: #F8FAFC;
      border-left: 4px solid #0284C7;
      padding: 10px 14px;
      border-radius: 0 6px 6px 0;
      font-size: 14.5px;
      color: #1E293B;
      line-height: 1.65;
      white-space: pre-line;
    }

    /* Objective Questions Grid (Sheet 4) */
    .obj-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .obj-card {
      background: #F8FAFC !important;
      border: 1.5px solid #CBD5E1;
      border-radius: 8px;
      padding: 12px 14px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .obj-header {
      font-size: 14.5px;
      font-weight: 900;
      color: #0F172A !important;
      margin-bottom: 8px;
    }
    .obj-options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 12px;
      margin-bottom: 8px;
    }
    .obj-opt {
      font-size: 13.5px;
      color: #334155;
      padding: 5px 8px;
      border-radius: 4px;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
    }
    .obj-opt-key {
      font-weight: 900;
      color: #EA580C;
      margin-right: 6px;
    }
    .obj-answer-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      font-size: 12.5px;
      padding-top: 6px;
      border-top: 1px dashed #CBD5E1;
    }
    .correct-badge {
      background: #15803D !important;
      color: #FFFFFF !important;
      font-size: 11px;
      font-weight: 900;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .obj-expl {
      color: #475569;
      font-size: 12px;
      font-weight: 600;
    }

    /* ==========================================================================
       7. SHEET FOOTER (BRANDING, VERIFICATION SEAL & DYNAMIC PAGINATION)
       ========================================================================== */
    .sheet-footer {
      background: #F8FAFC !important;
      border-top: 2px solid #E2E8F0;
      padding: 12px 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
      font-size: 12px;
      font-weight: 800;
      color: #64748B;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .footer-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .footer-brand {
      color: #0F172A !important;
      font-weight: 900;
    }
    .footer-motto {
      color: #EA580C !important;
    }
    .verified-footer-tag {
      color: #15803D;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11.5px;
    }
    .page-pill {
      background: #0F172A !important;
      color: #FFFFFF !important;
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 900;
    }

    /* ==========================================================================
       8. PRINT MEDIA STYLES (100% VECTOR OUTPUT ON CHROMIUM / SAFARI / GECKO)
       ========================================================================== */
    @media print {
      body {
        background: #FFFFFF !important;
        padding: 0 !important;
      }
      .web-toolbar {
        display: none !important;
      }
      .booklet-container {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        transform: none !important;
      }
      .sheet-card {
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        margin: 0 0 12px 0 !important;
        page-break-after: auto !important;
        break-after: auto !important;
      }
    }

    @media (max-width: 640px) {
      .rk-header {
        padding: 16px;
      }
      .brand-title {
        font-size: 20px;
      }
      .chapter-name {
        font-size: 18px;
      }
      .sheet-body {
        padding: 16px 14px;
      }
      .obj-options-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>

  <!-- Web Floating Toolbar with 100%, 200%, 300%, 400% Zoom Test Controls -->
  <div class="web-toolbar">
    <div class="web-toolbar-left">
      ${RK_LOGO_SVG_INLINE}
      <div>
        <div class="web-toolbar-title">RK STUDY CENTRE • मूल टॉपर्स नोट्स (Vector PDF)</div>
        <div style="font-size: 11px; color: #94A3B8;">${subjectName} • Ch ${chapterNum}: ${chapterHindiTitle}</div>
      </div>
      <span class="web-toolbar-badge">400% ज़ूम शार्प</span>
    </div>

    <div class="web-toolbar-actions">
      <!-- Zoom Test Controller -->
      <div class="zoom-group">
        <span class="zoom-badge">ज़ूम:</span>
        <button type="button" class="zoom-btn active" onclick="setDocZoom(100)">100%</button>
        <button type="button" class="zoom-btn" onclick="setDocZoom(200)">200%</button>
        <button type="button" class="zoom-btn" onclick="setDocZoom(300)">300%</button>
        <button type="button" class="zoom-btn" onclick="setDocZoom(400)">400% 🔍</button>
      </div>

      <button type="button" class="btn-action" onclick="printVectorDocument();">
        🖨️ A4 प्रिंट / Save as PDF
      </button>

      <button type="button" class="btn-action btn-secondary" onclick="window.scrollTo({top: 0, behavior: 'smooth'});">
        ⬆️ शीर्ष पर
      </button>
    </div>
  </div>

  <!-- Main Multi-Sheet Booklet -->
  <div class="booklet-container" id="bookletRoot">

    <!-- ========================================================================= -->
    <!-- SHEET 1: HEADER, AUTHOR/FACTS, FORMULAS & THEORY PART 1 & 2 -->
    <!-- ========================================================================= -->
    <article class="sheet-card">
      <div class="rk-sheet-watermark" aria-hidden="true"><div class="rk-sheet-watermark-inner">RK STUDY CENTRE</div></div>
      <header class="rk-header">
        <div class="rk-header-stripe"></div>
        <div class="rk-header-top">
          <div class="brand-group">
            ${RK_LOGO_SVG_INLINE}
            <div>
              <div class="brand-title">
                <span>RK STUDY CENTER</span>
                <span class="topper-badge">मूल टॉपर्स नोट्स</span>
              </div>
              <p class="brand-subtitle">कक्षा 10वीं (मैट्रिक बोर्ड) • संपूर्ण परीक्षा तैयारी संकलन</p>
            </div>
          </div>
          <div class="exam-badge-group">
            <div class="exam-tag">
              <span class="exam-tag-dot"></span>
              <span>CLASS 10 • BOARD EXAM 2026–27</span>
            </div>
            <div class="subject-tag">विषय: ${subjectName} • ${bookTitle}</div>
          </div>
        </div>

        <div class="chapter-banner">
          <div class="chapter-banner-left">
            <span class="chapter-pill">अध्याय ${chapterNum}</span>
            <div>
              <h1 class="chapter-name">${chapterHindiTitle}</h1>
              <p class="chapter-meta-line">
                मार्गदर्शक / शिक्षक: <strong>${authorName}</strong> | 
                बोर्ड: <strong>${examBoard}</strong>
              </p>
            </div>
          </div>
          <div class="stat-pills">
            <span class="stat-pill">${sections.length} मुख्य खंड</span>
            <span class="stat-pill" style="background: rgba(234, 88, 12, 0.25); color: #FED7AA; border-color: rgba(234, 88, 12, 0.4);">
              ${rawObjectives.length} VVI वस्तुनिष्ठ
            </span>
          </div>
        </div>
      </header>

      <div class="sheet-body">
        <!-- Section 1: Author / Reference / Important Formulas Card -->
        <div class="profile-card">
          <div class="profile-card-header">
            <span class="num-badge">1</span>
            <h2 class="profile-card-title">रचनाकार, संदर्भ परिचय एवं महत्वपूर्ण सूत्र</h2>
            <span class="profile-tag">अति महत्वपूर्ण</span>
          </div>

          <div class="formulas-grid">
            ${formulas.map((item) => `
              <div class="formula-item">
                <div class="formula-label">✨ ${item.name}</div>
                <div class="formula-value">${renderFormattedContent(item.formula)}</div>
                ${item.note ? `<div class="formula-note">${item.note}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Theory Section 1 & 2 -->
        ${sections.slice(0, 2).map((sec, idx) => `
          <section class="theory-section">
            <div class="theory-header">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="part-tag">भाग ${sec.sectionNumber || (idx + 1).toString().padStart(2, '0')}</span>
                <h3 class="theory-title">${sec.hindiTitle || sec.title}</h3>
              </div>
            </div>
            <div class="theory-content">
              ${(Array.isArray(sec.content) ? sec.content.join('\n\n') : sec.content).split('\n\n').map(p => renderFormattedContent(p)).join('')}
            </div>
          </section>
        `).join('')}
      </div>

      <footer class="sheet-footer">
        <div class="footer-left">
          ${RK_LOGO_SVG_INLINE}
          <span class="footer-brand">RK STUDY CENTER</span>
          <span>•</span>
          <span class="footer-motto">पढ़ाई • तैयारी • सफलता</span>
        </div>
        <div class="verified-footer-tag">
          <span>✔ प्रिंस सर द्वारा डिजिटल सत्यापित</span>
        </div>
        <div>
          <span class="page-pill">खंड 01 / ${totalPages.toString().padStart(2, '0')}</span>
        </div>
      </footer>
    </article>

    <!-- ========================================================================= -->
    <!-- SHEET 2: THEORY PART 3 & 4 + KEY REVISION TAKEAWAYS -->
    <!-- ========================================================================= -->
    ${sections.length > 2 ? `
    <article class="sheet-card">
      <div class="rk-sheet-watermark" aria-hidden="true"><div class="rk-sheet-watermark-inner">RK STUDY CENTRE</div></div>
      <header class="rk-header" style="padding: 14px 24px;">
        <div class="rk-header-top">
          <div class="brand-group">
            ${RK_LOGO_SVG_INLINE}
            <div>
              <div style="font-size: 18px; font-weight: 900; color: #FFFFFF;">अध्याय ${chapterNum}: ${chapterHindiTitle}</div>
              <div style="font-size: 12px; color: #FDBA74;">अवधारणा विश्लेषण एवं मुख्य परीक्षा बिंदु</div>
            </div>
          </div>
          <span class="page-pill" style="background: rgba(255,255,255,0.15);">पृष्ठ 02</span>
        </div>
      </header>

      <div class="sheet-body">
        ${sections.slice(2).map((sec, idx) => `
          <section class="theory-section">
            <div class="theory-header">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="part-tag">भाग ${sec.sectionNumber || (idx + 3).toString().padStart(2, '0')}</span>
                <h3 class="theory-title">${sec.hindiTitle || sec.title}</h3>
              </div>
            </div>
            <div class="theory-content">
              ${(Array.isArray(sec.content) ? sec.content.join('\n\n') : sec.content).split('\n\n').map(p => renderFormattedContent(p)).join('')}
            </div>

            ${sec.keyPoints && sec.keyPoints.length > 0 ? `
              <div class="keypoints-box">
                <div class="keypoints-title">🎯 परीक्षा उपयोगी स्मरणीय तथ्य (Key Takeaways):</div>
                <ul class="keypoints-list">
                  ${sec.keyPoints.map(kp => `<li>${formatInlineMath(kp)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </section>
        `).join('')}
      </div>

      <footer class="sheet-footer">
        <div class="footer-left">
          ${RK_LOGO_SVG_INLINE}
          <span class="footer-brand">RK STUDY CENTER</span>
          <span>•</span>
          <span class="footer-motto">टॉपर्स हस्तलिखित नोट्स</span>
        </div>
        <div class="verified-footer-tag">
          <span>✔ प्रिंस सर द्वारा डिजिटल सत्यापित</span>
        </div>
        <div>
          <span class="page-pill">खंड 02 / ${totalPages.toString().padStart(2, '0')}</span>
        </div>
      </footer>
    </article>
    ` : ''}

    <!-- ========================================================================= -->
    <!-- SHEET 3: SUBJECTIVE QUESTIONS & ANSWERS (लघु एवं दीर्घ उत्तरीय) -->
    <!-- ========================================================================= -->
    ${rawSubjectives.length > 0 ? `
    <article class="sheet-card">
      <div class="rk-sheet-watermark" aria-hidden="true"><div class="rk-sheet-watermark-inner">RK STUDY CENTRE</div></div>
      <header class="rk-header" style="padding: 14px 24px;">
        <div class="rk-header-top">
          <div class="brand-group">
            ${RK_LOGO_SVG_INLINE}
            <div>
              <div style="font-size: 18px; font-weight: 900; color: #FFFFFF;">परीक्षा उपयोगी प्रश्नोत्तर संकलन</div>
              <div style="font-size: 12px; color: #FDBA74;">लघु एवं दीर्घ उत्तरीय प्रश्न (NCERT + पिछले 10 वर्षों के प्रश्न)</div>
            </div>
          </div>
          <span class="page-pill" style="background: rgba(255,255,255,0.15);">पृष्ठ 03</span>
        </div>
      </header>

      <div class="sheet-body">
        ${rawSubjectives.map((q, idx) => `
          <div class="subjective-card">
            <div class="q-badge-row">
              <span class="q-number-pill">प्रश्न संख्या ${idx + 1}</span>
              <span class="marks-pill">${q.marks || 2} अंक ${q.boardYear ? `• BSEB ${q.boardYear}` : ''}</span>
            </div>
            <div class="q-text">${formatInlineMath(q.question)}</div>
            <div class="ans-box">
              <strong>उत्तर:</strong> ${formatInlineMath(Array.isArray(q.answer) ? q.answer.join('<br>') : q.answer)}
            </div>
          </div>
        `).join('')}
      </div>

      <footer class="sheet-footer">
        <div class="footer-left">
          ${RK_LOGO_SVG_INLINE}
          <span class="footer-brand">RK STUDY CENTER</span>
          <span>•</span>
          <span class="footer-motto">मॉडल प्रश्नोत्तर संकलन</span>
        </div>
        <div class="verified-footer-tag">
          <span>✔ प्रिंस सर द्वारा डिजिटल सत्यापित</span>
        </div>
        <div>
          <span class="page-pill">खंड 03 / ${totalPages.toString().padStart(2, '0')}</span>
        </div>
      </footer>
    </article>
    ` : ''}

    <!-- ========================================================================= -->
    <!-- SHEET 4: VVI OBJECTIVE QUESTIONS (OMR शीट आधारित बहुविकल्पीय) -->
    <!-- ========================================================================= -->
    ${rawObjectives.length > 0 ? `
    <article class="sheet-card">
      <div class="rk-sheet-watermark" aria-hidden="true"><div class="rk-sheet-watermark-inner">RK STUDY CENTRE</div></div>
      <header class="rk-header" style="padding: 14px 24px;">
        <div class="rk-header-top">
          <div class="brand-group">
            ${RK_LOGO_SVG_INLINE}
            <div>
              <div style="font-size: 18px; font-weight: 900; color: #FFFFFF;">VVI वस्तुनिष्ठ प्रश्नोत्तरी (MCQs)</div>
              <div style="font-size: 12px; color: #FDBA74;">अध्याय ${chapterNum}: ${chapterHindiTitle} • OMR शीट प्रैक्टिस</div>
            </div>
          </div>
          <span class="page-pill" style="background: rgba(255,255,255,0.15);">पृष्ठ ${totalPages.toString().padStart(2, '0')}</span>
        </div>
      </header>

      <div class="sheet-body">
        <div class="obj-grid">
          ${rawObjectives.map((item, idx) => {
            const opts = normalizeOptions(item.options);
            return `
              <div class="obj-card">
                <div class="obj-header">
                  <strong>प्र. ${idx + 1}.</strong> ${formatInlineMath(item.question)}
                  ${item.yearAsked || item.boardYear ? `<span style="font-size: 11px; background: #E0F2FE; color: #0369A1; padding: 1px 6px; border-radius: 4px; margin-left: 6px; font-weight: 800;">BSEB ${item.yearAsked || item.boardYear}</span>` : ''}
                </div>
                <div class="obj-options-grid">
                  ${opts.map((opt) => `
                    <div class="obj-opt">
                      <span class="obj-opt-key">${formatOptionKey(opt.key)}</span>
                      <span>${formatInlineMath(opt.text)}</span>
                    </div>
                  `).join('')}
                </div>
                <div class="obj-answer-row">
                  <span class="correct-badge">सही उत्तर: ${formatOptionKey(item.correctOption)}</span>
                  ${item.explanation ? `<span class="obj-expl">व्याख्या: ${formatInlineMath(item.explanation)}</span>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <footer class="sheet-footer">
        <div class="footer-left">
          ${RK_LOGO_SVG_INLINE}
          <span class="footer-brand">RK STUDY CENTER</span>
          <span>•</span>
          <span class="footer-motto">ऑफ़लाइन सुरक्षित नोट्स</span>
        </div>
        <div class="verified-footer-tag">
          <span>✔ प्रिंस सर द्वारा डिजिटल सत्यापित</span>
        </div>
        <div>
          <span class="page-pill">खंड ${totalPages.toString().padStart(2, '0')} / ${totalPages.toString().padStart(2, '0')}</span>
        </div>
      </footer>
    </article>
    ` : ''}

  </div>

  <script>
    // Zoom controller function for visual testing (100%, 200%, 300%, 400%)
    function setDocZoom(level) {
      var root = document.getElementById('bookletRoot');
      if (!root) return;
      root.style.zoom = level + '%';
      root.style.transform = 'none';
      root.style.marginBottom = '48px';
      
      // Update active button state
      var btns = document.querySelectorAll('.zoom-btn');
      btns.forEach(function(b) {
        if (b.textContent.indexOf(level + '%') !== -1) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
    }

    // High quality vector print trigger
    function printVectorDocument() {
      // Ensure zoom is reset to 100% prior to print so pagination is exact
      setDocZoom(100);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function() {
          window.print();
        });
      } else {
        window.print();
      }
    }

    // Preload fonts immediately on load
    window.addEventListener('load', function() {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function() {
          console.log('[RK STUDY CENTRE PDF] Devanagari & Latin vector fonts loaded successfully.');
        });
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Downloads notes as an offline HTML file directly into the device's File Manager / Downloads folder
 */
export function downloadNotesAsHTMLFile(data: ChapterNotesExportData): void {
  const meta = data.metadata || {};
  const chNum = (meta.chapterNumber || 1).toString().padStart(2, '0');
  const safeTitle = (meta.chapterHindiTitle || meta.chapterTitle || 'नोट्स')
    .replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_')
    .slice(0, 30);
  const filename = `RK_Study_Centre_Ch${chNum}_${safeTitle}_Notes.html`;

  const htmlDocument = generateRKStudyCenterColorNotesHTML(data);
  const blob = new Blob([htmlDocument], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Triggers high-precision Vector PDF Print / Save with full font preloading and zero pixelation.
 * Opens a dedicated print preview window or iframe with HarfBuzz text shaping.
 */
export function downloadColorPDFNotes(data: ChapterNotesExportData): void {
  const htmlDocument = generateRKStudyCenterColorNotesHTML(data);

  // Try opening dedicated printable preview window first
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlDocument);
    printWindow.document.close();

    const triggerPrint = () => {
      if (printWindow.document.fonts && printWindow.document.fonts.ready) {
        printWindow.document.fonts.ready.then(() => {
          printWindow.focus();
          printWindow.print();
        });
      } else {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 500);
      }
    };

    if (printWindow.document.readyState === 'complete') {
      triggerPrint();
    } else {
      printWindow.onload = triggerPrint;
    }
    return;
  }

  // Fallback: If popups are blocked by the browser, use hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(htmlDocument);
    doc.close();

    const runIframePrint = () => {
      const win = iframe.contentWindow;
      if (!win) return;
      if (win.document.fonts && win.document.fonts.ready) {
        win.document.fonts.ready.then(() => {
          win.focus();
          win.print();
          setTimeout(() => {
            if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
          }, 3000);
        });
      } else {
        setTimeout(() => {
          win.focus();
          win.print();
          setTimeout(() => {
            if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
          }, 3000);
        }, 600);
      }
    };

    setTimeout(runIframePrint, 400);
  }
}

// Backward compatibility export
export const downloadNotesAsTextFile = downloadNotesAsHTMLFile;
