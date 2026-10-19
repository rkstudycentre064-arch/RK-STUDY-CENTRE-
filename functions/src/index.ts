/**
 * RK STUDY CENTRE — Firebase Cloud Functions Backend
 * 
 * Secure Server-Side Environment for Administrative Operations & Custom Claims
 * 
 * SECURITY RULES:
 * 1. Admin SDK initialized using Google Cloud / Firebase Application Default Credentials.
 * 2. No private keys or service account secrets are hardcoded or exposed to the client.
 * 3. Arbitrary role setting is strictly prohibited.
 * 4. Step 1: Foundation created; Owner Custom Claim assignment is NOT executed yet.
 */

import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import * as logger from "firebase-functions/logger";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

// Initialize Firebase Admin SDK safely with environment credentials
if (getApps().length === 0) {
  initializeApp();
}

export const adminAuth = getAuth();

/**
 * Designated Owner account constant
 */
export const DESIGNATED_OWNER_EMAIL = "rkstudycentre064@gmail.com";

/**
 * Server-Side Cloud Function: stampPdfWithBranding
 * Uses 'pdf-lib' to automatically stamp the 'RK STUDY CENTRE' watermark,
 * official branding header banner, and footer onto every PDF file uploaded
 * through the Owner Portal, guaranteeing consistent branding for student downloads.
 */
export const stampPdfWithBranding = onCall(
  {
    cors: true,
    maxInstances: 10,
    memory: "512MiB",
    timeoutSeconds: 60,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Authentication is required to stamp PDF documents."
      );
    }

    const { base64Pdf, title, classLevel, subjectName } = request.data || {};

    if (!base64Pdf || typeof base64Pdf !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "A valid base64-encoded PDF string is required for processing."
      );
    }

    try {
      // Extract raw base64 if data URI scheme is present
      const cleanBase64 = base64Pdf.includes("base64,")
        ? base64Pdf.split("base64,")[1]
        : base64Pdf;

      const pdfBuffer = Buffer.from(cleanBase64, "base64");
      const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

      const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      const docTitle = (title || "Official Study Notes").slice(0, 45);
      const docSubtitle = `RK STUDY CENTRE • BSEB 2026 • Mentor: Prince Sir`;

      for (let i = 0; i < totalPages; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();

        // 1. Top RK STUDY CENTRE Branding Header Bar
        const headerHeight = 28;
        page.drawRectangle({
          x: 0,
          y: height - headerHeight,
          width: width,
          height: headerHeight,
          color: rgb(0.043, 0.098, 0.173), // Navy #0B192C
          opacity: 0.95,
        });

        // Gold accent bottom line for header
        page.drawRectangle({
          x: 0,
          y: height - headerHeight,
          width: width,
          height: 2,
          color: rgb(1.0, 0.396, 0.0), // Amber #FF6500
        });

        // Brand Title in Header
        page.drawText("RK STUDY CENTRE", {
          x: 14,
          y: height - 19,
          size: 11,
          font: fontHelveticaBold,
          color: rgb(1.0, 0.835, 0.31), // Golden
        });

        // Subtitle / Notes info in Header
        page.drawText(docSubtitle, {
          x: 130,
          y: height - 18,
          size: 8.5,
          font: fontHelvetica,
          color: rgb(0.9, 0.93, 0.98),
        });

        // 2. Center Security Diagonal Watermark
        const watermarkText = "RK STUDY CENTRE • PRINCE SIR";
        const textWidth = fontHelveticaBold.widthOfTextAtSize(watermarkText, 32);
        
        page.drawText(watermarkText, {
          x: Math.max(20, (width - textWidth) / 2),
          y: height / 2 - 20,
          size: 32,
          font: fontHelveticaBold,
          color: rgb(0.12, 0.24, 0.38),
          opacity: 0.08,
          rotate: degrees(38),
        });

        // Second watermark line
        const subWatermark = "BIHAR BOARD SPECIAL 2026";
        const subWidth = fontHelveticaBold.widthOfTextAtSize(subWatermark, 24);
        page.drawText(subWatermark, {
          x: Math.max(30, (width - subWidth) / 2),
          y: height / 2 - 60,
          size: 24,
          font: fontHelveticaBold,
          color: rgb(0.12, 0.24, 0.38),
          opacity: 0.07,
          rotate: degrees(38),
        });

        // 3. Bottom Footer Bar
        const footerHeight = 20;
        page.drawRectangle({
          x: 0,
          y: 0,
          width: width,
          height: footerHeight,
          color: rgb(0.95, 0.96, 0.98),
          opacity: 0.92,
        });

        page.drawLine({
          start: { x: 0, y: footerHeight },
          end: { x: width, y: footerHeight },
          thickness: 1,
          color: rgb(0.8, 0.84, 0.88),
        });

        const footerText = "© RK STUDY CENTRE • Helpline: +91 91234 56789 • rkstudycentre064@gmail.com";
        page.drawText(footerText, {
          x: 14,
          y: 6,
          size: 7.5,
          font: fontHelvetica,
          color: rgb(0.3, 0.35, 0.42),
        });

        const pageIndicator = `Page ${i + 1} of ${totalPages}`;
        const pageIndWidth = fontHelvetica.widthOfTextAtSize(pageIndicator, 7.5);
        page.drawText(pageIndicator, {
          x: width - pageIndWidth - 14,
          y: 6,
          size: 7.5,
          font: fontHelveticaBold,
          color: rgb(0.2, 0.25, 0.3),
        });
      }

      const modifiedPdfBytes = await pdfDoc.save();
      const modifiedBase64 = Buffer.from(modifiedPdfBytes).toString("base64");
      const stampedDataUrl = `data:application/pdf;base64,${modifiedBase64}`;

      logger.info(
        `Successfully branded and stamped PDF with ${totalPages} pages for title: ${docTitle}`
      );

      return {
        success: true,
        stampedPdfDataUrl: stampedDataUrl,
        totalPages,
        message: "PDF successfully branded with RK STUDY CENTRE header and watermark.",
      };
    } catch (err: any) {
      logger.error("Error stamping PDF with branding:", err);
      throw new HttpsError("internal", err.message || "Failed to process and stamp PDF.");
    }
  }
);

/**
 * Assign Owner Custom Claim
 * Callable strictly by the authenticated Owner account (rkstudycentre064@gmail.com).
 * Prohibits arbitrary users from setting claims or assigning roles.
 */
export const assignOwnerCustomClaim = onCall(
  {
    cors: false,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Authentication is required to perform administrative authorization."
      );
    }

    const callerEmail = request.auth.token.email;
    const callerUid = request.auth.uid;

    if (!callerEmail || callerEmail.toLowerCase() !== DESIGNATED_OWNER_EMAIL.toLowerCase()) {
      logger.warn(
        "Unauthorized attempt to invoke assignOwnerCustomClaim by:",
        callerEmail,
        callerUid
      );
      throw new HttpsError(
        "permission-denied",
        "Unauthorized: Only the designated Owner account may initialize Owner claims."
      );
    }

    try {
      await adminAuth.setCustomUserClaims(callerUid, { role: "owner" });
      logger.info("Successfully assigned { role: 'owner' } to UID:", callerUid);

      return {
        success: true,
        message: "Owner custom claim successfully assigned.",
        claim: { role: "owner" },
      };
    } catch (err: any) {
      logger.error("Error setting custom claim:", err);
      throw new HttpsError("internal", err.message || "Failed to set custom claim.");
    }
  }
);

/**
 * Foundation Health Check (Callable by authenticated users)
 * Confirms that the Cloud Functions backend is responsive and securely initialized.
 */
export const checkBackendStatus = onCall(
  {
    cors: false, // Prevents cross-origin arbitrary invocation
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Authentication is required to query backend foundation status."
      );
    }

    logger.info("Backend status checked by UID:", request.auth.uid);

    return {
      status: "ready",
      backendInitialized: true,
      service: "RK STUDY CENTRE Functions Foundation",
      timestamp: new Date().toISOString(),
    };
  }
);

/**
 * Firebase Storage Background Trigger: brandPdfOnStorageUpload
 * Automatically intercepts any PDF uploaded to Firebase Storage, loads it using pdf-lib,
 * injects the 'RK STUDY CENTRE' branding header, watermark, and footer, and overwrites
 * or saves a securely branded version in Storage, ensuring all student downloads are consistently branded.
 */
export const brandPdfOnStorageUpload = onObjectFinalized(
  {
    cpu: 1,
    memory: "512MiB",
    timeoutSeconds: 120,
  },
  async (event) => {
    const object = event.data;
    const filePath = object.name;
    const contentType = object.contentType;

    if (!filePath || !contentType || !contentType.includes("application/pdf")) {
      logger.info("Not a PDF file or missing path. Skipping branding:", filePath);
      return;
    }

    // Prevent infinite loops if file is already branded or in a branded folder
    if (filePath.includes("branded/") || filePath.includes("stamped_")) {
      logger.info("File already branded or skipped:", filePath);
      return;
    }

    try {
      const bucket = getStorage().bucket(object.bucket);
      const file = bucket.file(filePath);

      const [buffer] = await file.download();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      for (let i = 0; i < totalPages; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();

        // 1. Header
        const headerHeight = 28;
        page.drawRectangle({
          x: 0,
          y: height - headerHeight,
          width: width,
          height: headerHeight,
          color: rgb(0.043, 0.098, 0.173),
          opacity: 0.95,
        });
        page.drawRectangle({
          x: 0,
          y: height - headerHeight,
          width: width,
          height: 2,
          color: rgb(1.0, 0.396, 0.0),
        });
        page.drawText("RK STUDY CENTRE", {
          x: 14,
          y: height - 19,
          size: 11,
          font: fontHelveticaBold,
          color: rgb(1.0, 0.835, 0.31),
        });
        page.drawText("RK STUDY CENTRE • BSEB 2026 • Mentor: Prince Sir", {
          x: 130,
          y: height - 18,
          size: 8.5,
          font: fontHelvetica,
          color: rgb(0.9, 0.93, 0.98),
        });

        // 2. Watermark
        const watermarkText = "RK STUDY CENTRE • PRINCE SIR";
        const textWidth = fontHelveticaBold.widthOfTextAtSize(watermarkText, 32);
        page.drawText(watermarkText, {
          x: Math.max(20, (width - textWidth) / 2),
          y: height / 2 - 20,
          size: 32,
          font: fontHelveticaBold,
          color: rgb(0.12, 0.24, 0.38),
          opacity: 0.08,
          rotate: degrees(38),
        });

        // 3. Footer
        const footerHeight = 20;
        page.drawRectangle({
          x: 0,
          y: 0,
          width: width,
          height: footerHeight,
          color: rgb(0.95, 0.96, 0.98),
          opacity: 0.92,
        });
        page.drawLine({
          start: { x: 0, y: footerHeight },
          end: { x: width, y: footerHeight },
          thickness: 1,
          color: rgb(0.8, 0.84, 0.88),
        });
        page.drawText("© RK STUDY CENTRE • Helpline: +91 91234 56789 • rkstudycentre064@gmail.com", {
          x: 14,
          y: 6,
          size: 7.5,
          font: fontHelvetica,
          color: rgb(0.3, 0.35, 0.42),
        });
        const pageIndicator = `Page ${i + 1} of ${totalPages}`;
        const pageIndWidth = fontHelvetica.widthOfTextAtSize(pageIndicator, 7.5);
        page.drawText(pageIndicator, {
          x: width - pageIndWidth - 14,
          y: 6,
          size: 7.5,
          font: fontHelveticaBold,
          color: rgb(0.2, 0.25, 0.3),
        });
      }

      const brandedBytes = await pdfDoc.save();

      const brandedFilePath = filePath.startsWith("uploads/") 
        ? filePath.replace("uploads/", "branded/") 
        : `branded/${filePath}`;

      const brandedFile = bucket.file(brandedFilePath);
      await brandedFile.save(Buffer.from(brandedBytes), {
        contentType: "application/pdf",
        metadata: {
          metadata: {
            brandedBy: "RK Study Centre Cloud Functions",
            timestamp: new Date().toISOString(),
          },
        },
      });

      logger.info(`Successfully auto-branded storage PDF: ${filePath} -> ${brandedFilePath}`);
    } catch (error: any) {
      logger.error("Error auto-branding PDF from storage upload:", error);
    }
  }
);
