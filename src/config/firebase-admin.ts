// --- 1. Import the Firebase Admin SDK ---
// Using standard ES import syntax for 'firebase-admin'
import * as admin from "firebase-admin";

// Import the service account JSON directly.
// TypeScript environments usually handle this path correctly.
import serviceAccount from "../../secrets/the-dj-society-firebase-adminsdk-fbsvc-806a7080c1.json";

// We assert the type of the imported JSON to satisfy the credential method
const serviceAccountCert = serviceAccount as admin.ServiceAccount;

/**
 * Initializes the Firebase Admin SDK globally.
 * Checks for existing initialization to support hot reloading environments.
 */
const initializeFirebaseAdmin = (): void => {
    // Check if the app has already been initialized to prevent errors
    if (admin.apps.length > 0) {
        return;
    }

    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountCert)
        });
    } catch (error) {
        throw error;
    }
};

// Export the initialization function and the initialized admin object
export { initializeFirebaseAdmin, admin };
