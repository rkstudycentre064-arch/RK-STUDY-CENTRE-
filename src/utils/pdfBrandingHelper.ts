/**
 * RK STUDY CENTRE - Automatic PDF Branding & Vector Engine
 * 
 * Automatically applies RK STUDY CENTRE official brand styling, headers,
 * footers, vector SVG logos, and verification badges to ANY uploaded PDF or study material.
 * Ensures that whenever a student or user views or downloads any PDF, it is 100% vector,
 * crystal clear up to 400% zoom, searchable, selectable, and fully branded under Prince Sir.
 */

import type { PDFDocumentData } from '../components/notes/InAppPDFViewerModal';
import { RK_LOGO_SVG_INLINE, renderFormattedContent } from './downloadNotesHelper';

export const RK_OFFICIAL_BRAND = {
  name: 'RK STUDY CENTRE',
  hindiName: 'आर. के. स्टडी सेन्टर',
  tagline: 'बिहार बोर्ड (BSEB) मैट्रिक एवं इंटरमीडिएट टॉपर संस्थान',
  founder: 'Prince Sir (प्रिंस सर)',
  founderRole: 'Founder, Director & Head Educator',
  contactNumber: '+91 91234 56789',
  contactEmail: 'rkstudycentre064@gmail.com',
  batchYear: 'सत्र 2025-2026 विशेष',
  board: 'बिहार विद्यालय परीक्षा समिति (BSEB), पटना',
};

/**
 * Generates an official RK STUDY CENTRE branded printable Vector PDF document for ANY uploaded file or note.
 */
export function downloadBrandedRKStudyCentrePDF(docData: PDFDocumentData): void {
  const htmlContent = generateBrandedHTML(docData);

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
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

  // If popup blocked, create hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const frameDoc = iframe.contentWindow?.document;
  if (frameDoc) {
    frameDoc.open();
    frameDoc.write(htmlContent);
    frameDoc.close();

    const runIframe = () => {
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

    setTimeout(runIframe, 400);
  }
}

/**
 * Builds standard full-bleed RK STUDY CENTRE branded booklet HTML for printing/saving as Vector PDF
 */
export function generateBrandedHTML(docData: PDFDocumentData): string {
  const title = docData.title || 'अध्ययन सामग्री एवं परीक्षा नोट्स';
  const hindiTitle = docData.hindiTitle || title;
  const className = docData.classLevel ? docData.classLevel.toUpperCase().replace('-', ' ') : 'कक्षा 10वीं / 12वीं';
  const subject = docData.subjectName || 'बिहार बोर्ड विशेष';
  const book = docData.bookTitle || 'RK Topper Series';
  const chapter = docData.chapterTitle || title;
  const content = docData.content || '';

  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${title} - RK STUDY CENTRE</title>
  
  <!-- Document Metadata for High Fidelity PDF -->
  <meta name="title" content="${hindiTitle} - RK STUDY CENTRE">
  <meta name="author" content="RK Study Center">
  <meta name="creator" content="RK Study Center (Prince Sir)">
  <meta name="subject" content="${subject} • ${className}">
  <meta name="description" content="RK STUDY CENTRE अधिकृत प्रमाणित अध्ययन सामग्री • प्रिंस सर">
  <meta name="language" content="Hindi, English">
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Mukta:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;600;700;800;900&family=Hind:wght@400;600;700&family=Poppins:wght@600;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">

  <style>
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
      margin: 10mm 14mm 14mm 14mm;
    }

    body {
      font-family: 'Mukta', 'Noto Sans Devanagari', 'Hind', system-ui, -apple-system, sans-serif;
      background: #FFFFFF;
      color: #0F172A;
      line-height: 1.65;
      font-size: 13pt;
      position: relative;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }

    /* Web Toolbar with Zoom Test Bar */
    .web-toolbar {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      background: #0B192C;
      color: #FFFFFF;
      padding: 10px 18px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      border-bottom: 3px solid #EA580C;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .web-toolbar-title {
      font-size: 13.5px;
      font-weight: 900;
      color: #F8FAFC;
    }
    .zoom-group {
      display: inline-flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.25);
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
    }
    .zoom-btn.active {
      background: #EA580C;
      color: #FFFFFF;
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
    }

    /* Printable Page Container */
    .printable-sheet {
      max-width: 820px;
      margin: 20px auto 40px auto;
      padding: 0 16px;
      transform-origin: top center;
      transition: transform 0.2s ease-out;
    }

    /* Branded Header Container */
    .header-card {
      border: 2.5px solid #1E3E62;
      border-radius: 14px;
      padding: 16px 20px;
      background: linear-gradient(135deg, #0B192C 0%, #1E3E62 60%, #000000 100%);
      color: #FFFFFF;
      margin-bottom: 20px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.12);
      position: relative;
      overflow: hidden;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .header-card::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4.5px;
      background: linear-gradient(90deg, #FF6500, #FFA000, #FF6500);
    }

    .header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .institute-title {
      font-family: 'Poppins', sans-serif;
      font-size: 23pt;
      font-weight: 900;
      color: #FFD54F;
      letter-spacing: 0.5px;
      line-height: 1.1;
      text-transform: uppercase;
    }

    .institute-sub {
      font-size: 11pt;
      font-weight: 700;
      color: #FFFFFF;
      margin-top: 2px;
    }

    .director-badge {
      font-size: 9.5pt;
      color: #FFB74D;
      font-weight: 600;
      margin-top: 3px;
    }

    .badge-pill {
      background: #E65100;
      color: #FFFFFF;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 9pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: inline-block;
      border: 1px solid #FF8F00;
    }

    /* Metadata Bar */
    .meta-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #F1F5F9;
      border: 1.5px solid #CBD5E1;
      border-radius: 8px;
      padding: 8px 14px;
      margin-bottom: 20px;
      font-size: 10pt;
      font-weight: 700;
      color: #1E293B;
      break-inside: avoid;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .meta-label {
      color: #64748B;
      font-weight: 600;
    }

    .doc-title-box {
      background: #FFF7ED;
      border-left: 5px solid #EA580C;
      border-right: 1.5px solid #FED7AA;
      border-top: 1.5px solid #FED7AA;
      border-bottom: 1.5px solid #FED7AA;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 22px;
      break-inside: avoid;
    }

    .doc-main-title {
      font-size: 18pt;
      font-weight: 900;
      color: #9A3412;
      line-height: 1.25;
    }

    .doc-sub-desc {
      font-size: 11pt;
      color: #431407;
      margin-top: 4px;
      font-weight: 700;
    }

    /* Content Area */
    .content-area {
      font-size: 13pt;
      line-height: 1.8;
      color: #1E293B;
      text-align: justify;
    }

    .content-area h2 {
      font-size: 15pt;
      color: #0F172A;
      border-bottom: 2px solid #E2E8F0;
      padding-bottom: 5px;
      margin-top: 20px;
      margin-bottom: 12px;
      break-after: avoid;
    }

    .content-area h3 {
      font-size: 13pt;
      color: #1E3E62;
      margin-top: 16px;
      margin-bottom: 10px;
      break-after: avoid;
    }

    .highlight-box {
      background: #F8FAFC;
      border: 1.5px solid #E2E8F0;
      border-left: 4.5px solid #0284C7;
      border-radius: 8px;
      padding: 14px 16px;
      margin: 16px 0;
      font-size: 11.5pt;
      break-inside: avoid;
    }

    .topper-tips-box {
      background: #ECFDF5;
      border: 1.5px solid #A7F3D0;
      border-left: 4.5px solid #059669;
      border-radius: 8px;
      padding: 14px 16px;
      margin: 16px 0;
      font-size: 11.5pt;
      color: #064E3B;
      break-inside: avoid;
    }

    /* Tables */
    .vector-notes-table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5px solid #94A3B8;
      border-radius: 8px;
      overflow: hidden;
      margin: 16px 0;
      font-size: 12pt;
      break-inside: avoid;
    }
    .vector-notes-table th {
      background: #0B192C;
      color: #FFFFFF;
      padding: 10px 14px;
      font-weight: 800;
      text-align: left;
    }
    .vector-notes-table td {
      padding: 9px 14px;
      border: 1px solid #CBD5E1;
    }
    .vector-notes-table tr:nth-child(even) {
      background: #F8FAFC;
    }

    /* Math code & fractions */
    .vector-math-chip {
      font-family: 'JetBrains Mono', monospace;
      background: #F1F5F9;
      color: #0F172A;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11.5pt;
      border: 1px solid #CBD5E1;
    }
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

    /* Footer Banner */
    .footer-banner {
      margin-top: 36px;
      border-top: 2px dashed #94A3B8;
      padding-top: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 9.5pt;
      color: #475569;
      font-weight: 700;
      break-inside: avoid;
    }

    .verified-seal {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #15803D;
      font-weight: 900;
    }

    @media print {
      body {
        background: #FFFFFF !important;
        padding: 0 !important;
      }
      .web-toolbar {
        display: none !important;
      }
      .printable-sheet {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        transform: none !important;
      }
    }
  </style>
</head>
<body>

  <!-- Web Toolbar with Zoom Testing (100%, 200%, 300%, 400%) -->
  <div class="web-toolbar">
    <div style="display: flex; align-items: center; gap: 10px;">
      ${RK_LOGO_SVG_INLINE}
      <span class="web-toolbar-title">RK STUDY CENTRE • अधिकृत स्टडी नोट्स (Vector PDF)</span>
    </div>

    <div style="display: flex; align-items: center; gap: 10px;">
      <div class="zoom-group">
        <span style="font-size: 11px; color: #FDE047; font-weight: 800; padding: 0 4px;">ज़ूम टेस्ट:</span>
        <button type="button" class="zoom-btn active" onclick="setDocZoom(100)">100%</button>
        <button type="button" class="zoom-btn" onclick="setDocZoom(200)">200%</button>
        <button type="button" class="zoom-btn" onclick="setDocZoom(300)">300%</button>
        <button type="button" class="zoom-btn" onclick="setDocZoom(400)">400% 🔍</button>
      </div>

      <button type="button" class="btn-action" onclick="printVector();">
        🖨️ A4 प्रिंट / Save as PDF
      </button>
    </div>
  </div>

  <div class="printable-sheet" id="sheetContainer">
    <!-- Official Header -->
    <div class="header-card">
      <div class="header-top">
        <div class="header-left">
          ${RK_LOGO_SVG_INLINE}
          <div>
            <div class="institute-title">RK STUDY CENTRE</div>
            <div class="institute-sub">${RK_OFFICIAL_BRAND.hindiName} • ${RK_OFFICIAL_BRAND.tagline}</div>
            <div class="director-badge">निदेशक एवं मुख्य मार्गदर्शक: <strong>${RK_OFFICIAL_BRAND.founder}</strong></div>
          </div>
        </div>
        <div style="text-align: right;">
          <span class="badge-pill">BSEB TOPPER 2026</span>
          <div style="font-size: 8.5pt; color: #E2E8F0; margin-top: 5px;">हेल्पलाइन: ${RK_OFFICIAL_BRAND.contactNumber}</div>
          <div style="font-size: 8pt; color: #CBD5E1;">${RK_OFFICIAL_BRAND.contactEmail}</div>
        </div>
      </div>
    </div>

    <!-- Metadata Sub-Bar -->
    <div class="meta-bar">
      <div class="meta-item">
        <span class="meta-label">कक्षा:</span>
        <span>${className}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">विषय:</span>
        <span>${subject}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">किताब:</span>
        <span>${book}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">बोर्ड:</span>
        <span>बिहार विद्यालय परीक्षा समिति (BSEB)</span>
      </div>
    </div>

    <!-- Document Title Box -->
    <div class="doc-title-box">
      <div class="doc-main-title">${hindiTitle}</div>
      <div class="doc-sub-desc">अध्याय / टॉपिक: ${chapter} • प्रमाणित अध्ययन सामग्री एवं परीक्षा नोट्स</div>
    </div>

    <!-- Main Content Body -->
    <div class="content-area">
      ${content ? `
        <div>
          ${content.split('\n\n').map(p => {
            if (p.startsWith('## ')) {
              return `<h2>${p.replace('## ', '')}</h2>`;
            }
            if (p.startsWith('### ')) {
              return `<h3>${p.replace('### ', '')}</h3>`;
            }
            return renderFormattedContent(p);
          }).join('')}
        </div>
      ` : `
        <div class="highlight-box">
          <p><strong>📋 आधिकारिक अध्ययन पुस्तिका (Official Study Booklet):</strong> यह अध्ययन सामग्री RK STUDY CENTRE के विद्यार्थियों के लिए प्रिंस सर (Prince Sir) के मार्गदर्शन में विशेष रूप से तैयार की गई है।</p>
          <p style="margin-top: 8px;">इस दस्तावेज़ में बिहार बोर्ड परीक्षा 2026 के नवीनतम पैटर्न पर आधारित महत्वपूर्ण प्रश्न, व्याख्या एवं सूत्र सम्मिलित हैं।</p>
        </div>
        <div class="topper-tips-box">
          <strong>🎯 प्रिंस सर का अध्ययन मंत्र:</strong> प्रतिदिन समयबद्ध रिवीज़न करें, पिछले 5 वर्षों के प्रश्नों का अभ्यास करें तथा मुख्य सूत्रों का संक्षिप्त चार्ट बनाकर प्रतिदिन दोहराएं।
        </div>
      `}
    </div>

    <!-- Official Footer -->
    <div class="footer-banner">
      <div>
        <span>© ${new Date().getFullYear()} ${RK_OFFICIAL_BRAND.name} (आर. के. स्टडी सेन्टर) • सर्वाधिकार सुरक्षित</span>
      </div>
      <div class="verified-seal">
        <span>✔ प्रिंस सर द्वारा डिजिटल रूप से सत्यापित</span>
      </div>
      <div>
        <span>पृष्ठ 01 / 01</span>
      </div>
    </div>
  </div>

  <script>
    function setDocZoom(level) {
      var sheet = document.getElementById('sheetContainer');
      if (!sheet) return;
      var scale = level / 100;
      sheet.style.transform = 'scale(' + scale + ')';
      if (scale > 1) {
        sheet.style.marginBottom = ((scale - 1) * 800) + 'px';
      } else {
        sheet.style.marginBottom = '40px';
      }
      var btns = document.querySelectorAll('.zoom-btn');
      btns.forEach(function(b) {
        if (b.textContent.indexOf(level + '%') !== -1) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
    }

    function printVector() {
      setDocZoom(100);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function() {
          window.print();
        });
      } else {
        window.print();
      }
    }
  </script>
</body>
</html>`;
}
