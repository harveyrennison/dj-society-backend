import { admin } from "../config/firebase-admin";

// Define the expected return type for the client
interface AuthResponse {
    firebaseToken: string;
    userId: string;
    token: string; // Your app-specific session token (if used)
}

/**
 * Handles the Google Sign-In flow: verifies the Google ID token,
 * provisions the user in Firebase Auth, and mints a Firebase Custom Token.
 * * @param googleToken The ID Token received from the Google client.
 * @returns A promise that resolves to the Firebase Custom Token and user ID.
 */
export async function handleGoogleAuth(googleToken: string): Promise<AuthResponse> {
    if (!googleToken) {
        throw new Error("Missing Google ID Token from client request.");
    }

    let decodedToken: admin.auth.DecodedIdToken;
    let firebaseUser: admin.auth.UserRecord;

    try {
        // 1. Verify the Google ID Token using Firebase Admin SDK
        // This implicitly checks the token's signature, expiry, and issuer.
        decodedToken = await admin.auth().verifyIdToken(googleToken);
        const email = decodedToken.email;

        if (!email) {
            throw new Error("Google ID Token is missing an email address.");
        }

        // 2. Find or Create the user in Firebase Authentication
        try {
            // Try to find the user by their email
            firebaseUser = await admin.auth().getUserByEmail(email);
        } catch (error: any) {
            // If the user doesn't exist, create them
            if (error.code === "auth/user-not-found") {
                firebaseUser = await admin.auth().createUser({
                    // Use a unique UID prefix for Google users (optional but helpful)
                    uid: `google:${decodedToken.sub}`,
                    email,
                    displayName: decodedToken.name,
                    photoURL: decodedToken.picture,
                    emailVerified: decodedToken.email_verified,
                });
                console.log(`[SERVER]: New Google user created: ${firebaseUser.uid}`);
            } else {
                // Re-throw other unexpected errors
                throw error;
            }
        }

        // 3. Mint a Firebase Custom Token for the authenticated user
        const uid = firebaseUser.uid;

        // Optional: Add custom claims for security rules or application logic
        const customClaims = {
            isGoogleUser: true
        };
        const firebaseCustomToken = await admin.auth().createCustomToken(uid, customClaims);

        // 4. Return the required data to the client
        return {
            firebaseToken: firebaseCustomToken,
            userId: uid,
            token: "server-session-token-if-you-use-it" // Use actual session token or empty string
        };

    } catch (error) {
        console.error("[SERVER]: Authentication Error during Google flow:", error);
        // Throw a specific error that your API layer can translate to a 401 Unauthorized response
        throw new Error("Failed to authenticate with Google token. Please try again.");
    }
}
