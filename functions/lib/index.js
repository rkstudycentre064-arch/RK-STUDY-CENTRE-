"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBackendStatus = exports.assignOwnerCustomClaim = exports.DESIGNATED_OWNER_EMAIL = exports.adminAuth = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const https_1 = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
// Initialize Firebase Admin SDK safely with environment credentials
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
exports.adminAuth = (0, auth_1.getAuth)();
/**
 * Designated Owner account constant
 */
exports.DESIGNATED_OWNER_EMAIL = "rkstudycentre064@gmail.com";
/**
 * Assign Owner Custom Claim
 * Callable strictly by the authenticated Owner account (rkstudycentre064@gmail.com).
 * Prohibits arbitrary users from setting claims or assigning roles.
 */
exports.assignOwnerCustomClaim = (0, https_1.onCall)({
    cors: false,
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Authentication is required to perform administrative authorization.");
    }
    const callerEmail = request.auth.token.email;
    const callerUid = request.auth.uid;
    if (!callerEmail || callerEmail.toLowerCase() !== exports.DESIGNATED_OWNER_EMAIL.toLowerCase()) {
        logger.warn("Unauthorized attempt to invoke assignOwnerCustomClaim by:", callerEmail, callerUid);
        throw new https_1.HttpsError("permission-denied", "Unauthorized: Only the designated Owner account may initialize Owner claims.");
    }
    try {
        await exports.adminAuth.setCustomUserClaims(callerUid, { role: "owner" });
        logger.info("Successfully assigned { role: 'owner' } to UID:", callerUid);
        return {
            success: true,
            message: "Owner custom claim successfully assigned.",
            claim: { role: "owner" },
        };
    }
    catch (err) {
        logger.error("Error setting custom claim:", err);
        throw new https_1.HttpsError("internal", err.message || "Failed to set custom claim.");
    }
});
/**
 * Foundation Health Check (Callable by authenticated users)
 * Confirms that the Cloud Functions backend is responsive and securely initialized.
 */
exports.checkBackendStatus = (0, https_1.onCall)({
    cors: false, // Prevents cross-origin arbitrary invocation
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Authentication is required to query backend foundation status.");
    }
    logger.info("Backend status checked by UID:", request.auth.uid);
    return {
        status: "ready",
        backendInitialized: true,
        service: "RK STUDY CENTRE Functions Foundation",
        timestamp: new Date().toISOString(),
    };
});
//# sourceMappingURL=index.js.map