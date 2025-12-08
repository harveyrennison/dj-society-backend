import { Request, Response } from "express";
import { admin } from "../../config/firebase-admin";
import Logger from "../../config/logger";
import { createToken } from "../authentication/token";
import * as usersModel from "../models/user.model";
import * as schemas from "../resources/schemas.json";
import { AJVvalidate } from "../services/AJVvalidate";
import * as passwords from "../services/passwords";
import {
    CLIENT,
    GOOGLE_CLIENT_ID,
    GOOGLE_USER_PASSWORD_PLACEHOLDER,
} from "../types/constants";

const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const contentType = req.header("Content-Type");
        if (!contentType || contentType !== "application/json") {
            res.status(400).json({
                error: "Bad Request: Content-Type must be application/json",
            });
            return;
        }

        const { email, password } = req.body;
        Logger.http(`POST create a user with email: ${email}`);

        const validation = await AJVvalidate(schemas.user_register, req.body);
        if (validation !== true) {
            res.status(400).json({
                error: `Bad Request: ${validation.toString()}`,
            });
            return;
        }
        const existingEmail = await usersModel.getFromEmail(email);
        if (existingEmail.length > 0) {
            res.status(403).json({
                error: "There is already a user registered with the email you provided. Please log in.",
            });
            return;
        }

        const passwordHash = await passwords.hash(password);
        const result = await usersModel.create(email, passwordHash);
        const userId = result.insertId;

        const firebaseUID = userId.toString();
        await usersModel.setFirebaseUid(userId, firebaseUID);

        const token = createToken();
        await usersModel.setToken(userId, token);

        const firebaseCustomToken = await admin
            .auth()
            .createCustomToken(firebaseUID);

        res.status(201).json({
            firebaseToken: firebaseCustomToken, // Use a clear name
            token, // Return the local token
            userId,
            message: `Successfully registered and logged in user with email: ${email}`,
        });
        return;
    } catch (err) {
        Logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
};

const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const contentType = req.header("Content-Type");
        if (!contentType || contentType !== "application/json") {
            res.status(400).json({
                error: "Bad Request: Content-Type must be application/json",
            });
            return;
        }

        const { googleToken, email, password } = req.body;

        if (googleToken) {
            // =========================================================================
            // A. GOOGLE LOGIN FLOW
            // =========================================================================
            Logger.http(
                "POST Combined Login attempt: Executing Google Sign-In Flow."
            );

            // 👇 CHANGED: Verify using google-auth-library instead of admin.auth()
            let verifiedEmail: string | undefined;
            let name: string | undefined;

            try {
                const ticket = await CLIENT.verifyIdToken({
                    idToken: googleToken,
                    audience: GOOGLE_CLIENT_ID,
                });
                const payload = ticket.getPayload();

                if (!payload) {
                    throw new Error("Invalid token payload");
                }

                verifiedEmail = payload.email;
                name = payload.name;
            } catch (error) {
                Logger.error("Google Token Verification Failed:", error);
                res.status(401).json({ error: "Invalid Google Token" });
                return;
            }
            // 👆 END CHANGE

            if (!verifiedEmail) {
                Logger.warn("Google token verified but missing email.");
                res.status(401).json({
                    error: "Google token invalid: Missing required email.",
                });
                return;
            }

            // 2. CONTROLLER LOGIC: Perform name splitting here
            let firstName: string | undefined = undefined;
            let lastName: string | undefined = undefined;

            if (name) {
                const parts = name.split(" ");
                if (parts.length > 1) {
                    firstName = parts[0];
                    lastName = parts.slice(1).join(" ");
                } else {
                    firstName = name;
                }
            }

            let userId: number;
            let firebaseUID: string;

            // 3. Find or Create the user locally
            const existingUsers = await usersModel.getFromEmail(verifiedEmail);

            if (existingUsers.length > 0) {
                // User exists: Proceed with login
                const user = existingUsers[0];
                userId = user.userId;
                firebaseUID = userId.toString();
                Logger.info(`Google login: Existing user found, ID: ${userId}`);

                // Ensure the Firebase UID is set if it's somehow missing from an old entry
                if (user.firebaseUid !== firebaseUID) {
                    await usersModel.setFirebaseUid(userId, firebaseUID);
                }
            } else {
                // User does not exist: Create a new user entry
                Logger.info(
                    `Google login: Creating new user with email: ${verifiedEmail}`
                );

                // Hash the placeholder password for storage
                const passwordHash = await passwords.hash(
                    GOOGLE_USER_PASSWORD_PLACEHOLDER
                );

                // Call the model with separated first and last names
                const result = await usersModel.create(
                    verifiedEmail,
                    passwordHash,
                    firstName,
                    lastName
                );
                userId = result.insertId;
                firebaseUID = userId.toString();

                // Store the system-assigned firebaseUID (which is the local ID as a string)
                await usersModel.setFirebaseUid(userId, firebaseUID);
            }

            // 4. Create/Update local session token
            const token = createToken();
            await usersModel.setToken(userId, token);

            // 5. Mint a Firebase Custom Token
            const firebaseCustomToken = await admin
                .auth()
                .createCustomToken(firebaseUID);

            // 6. Success: Return tokens and IDs
            res.status(200).json({
                firebaseToken: firebaseCustomToken,
                token,
                userId,
                message: `Successfully logged in Google user with email: ${verifiedEmail}`,
            });
            return;
        } else {
            // =========================================================================
            // B. STANDARD EMAIL/PASSWORD LOGIN FLOW
            // =========================================================================
            Logger.http(
                "POST Combined Login attempt: Executing Standard Login Flow."
            );

            // Standard login requires email and password validation
            const validation = await AJVvalidate(schemas.user_login, req.body);
            if (validation !== true) {
                res.status(400).json({
                    error: `Bad Request: ${validation.toString()}`,
                });
                return;
            }

            // 1. Get user by email
            const users = await usersModel.getFromEmail(email);
            const user = users && users.length > 0 ? users[0] : null;

            if (!user) {
                Logger.warn(
                    `Standard Login attempt failed: user not found for email: ${email}`
                );
                res.status(401).send({ error: "Incorrect email or password." });
                return;
            }

            // 2. Compare Password - Check for correct password AND ensure it's not a Google placeholder user
            const hashedPassword = user.password;

            // We compare the placeholder string against the stored hash to check if the user is an external account.
            const isGooglePlaceholder = await passwords.compare(
                GOOGLE_USER_PASSWORD_PLACEHOLDER,
                hashedPassword
            );

            if (isGooglePlaceholder) {
                Logger.warn(
                    `Previously used Google to login, and now logging in normally with email: ${email}`
                );
                res.status(403).send({
                    error: "You have previously logged in with Google. Please try again.",
                });
                return;
            }

            if (!(await passwords.compare(password, hashedPassword))) {
                // If it's a Google placeholder OR the password is wrong
                Logger.warn(
                    `Standard Login attempt failed: incorrect credentials or attempt to use email/pass on external user for email: ${email}`
                );
                res.status(401).send({ error: "Incorrect email or password." });
                return;
            }

            // 3. Proceed with successful authentication
            const firebaseUID = user.userId.toString();
            const firebaseCustomToken = await admin
                .auth()
                .createCustomToken(firebaseUID);

            const token = createToken();
            await usersModel.setToken(user.userId, token);

            // 4. Success: Return the Custom Token
            res.status(200).json({
                firebaseToken: firebaseCustomToken,
                userId: user.userId,
                message: `Successfully logged in user with email: ${email}`,
            });
            return;
        }
    } catch (err: any) {
        // Handle potential errors from admin.auth().verifyIdToken() or other failures
        const status = err.code && err.code.startsWith("auth/") ? 401 : 500;
        const message =
            status === 401
                ? "Authentication failed. Invalid or expired token."
                : "Internal Server Error";
        Logger.error("Combined Login controller unexpected error:", err);
        res.status(status).json({ error: message });
        return;
    }
};

const logout = async (req: Request, res: Response): Promise<void> => {
    // 1. Check the value immediately upon entry
    Logger.info(`--- START LOGOUT CONTROLLER ---`);
    Logger.info(
        `res.locals object keys: ${Object.keys(res.locals).join(", ")}`
    ); // Should show 'userId'

    const firebaseUid = res.locals.userId as string;

    Logger.info(`Value of firebaseUid upon entry: [${firebaseUid}]`); // CRITICAL: What is the exact value?

    // The token is already verified by firebaseAuth, so we have a valid UID.
    if (!firebaseUid) {
        Logger.error(
            "Logout failure: firebaseUid is falsy despite passing auth middleware."
        );
        res.status(401).json({
            error: "Unauthorized: No valid session ID found.",
        });
        return;
    }

    try {
        // 2. Revoke all refresh tokens for the current user.
        await admin.auth().revokeRefreshTokens(firebaseUid);

        Logger.info(
            `Successfully revoked tokens for Firebase UID: ${firebaseUid}`
        );
        res.status(200).json({
            message: "Logged out successfully. All sessions revoked.",
        });
    } catch (err) {
        Logger.error(
            `Error during token revocation for UID ${firebaseUid}:`,
            err
        );
        // Note: If the token was already revoked, Firebase might throw an error here,
        // but it still means the user's sessions are terminated.
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const view = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId) || userId <= 0) {
            res.status(400).json({ error: "Invalid user ID" });
            return;
        }
        Logger.http(`GET single user with id: ${userId}`);

        const users = await usersModel.getFromId(userId);
        if (users.length === 0) {
            res.status(404).json({
                error: `User with id: ${userId} not found.`,
            });
            return;
        }

        const user = users[0];
        const authenticatedFirebaseUID = res.locals.userId as
            | string
            | undefined;

        const isOwner =
            authenticatedFirebaseUID &&
            user.firebaseUid === authenticatedFirebaseUID;

        if (isOwner) {
            res.status(200).json(user);
            return;
        } else {
            const publicUser = { user_id: user.userId };
            res.status(200).json(publicUser);
            return;
        }
    } catch (err) {
        Logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export { login, logout, register, view };
