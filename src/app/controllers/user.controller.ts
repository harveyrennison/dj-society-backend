import { Request, Response } from "express";
import { admin } from "../../config/firebase-admin";
import Logger from "../../config/logger";
import { createToken } from "../authentication/token";
import * as usersModel from "../models/user.model";
import * as schemas from "../resources/schemas.json";
import { AJVvalidate } from "../services/AJVvalidate";
import * as passwords from "../services/passwords";

const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const contentType = req.header("Content-Type");
        if (!contentType || contentType !== "application/json") {
            res.status(400).json({ error: "Bad Request: Content-Type must be application/json" });
            return;
        }

        const { email, password } = req.body;
        Logger.http(`POST create a user with email: ${email}`);

        const validation = await AJVvalidate(schemas.user_register, req.body);
        if (validation !== true) {
            res.status(400).json({ error: `Bad Request: ${validation.toString()}` });
            return;
        }
        const existingEmail = await usersModel.getFromEmail(email);
        if (existingEmail.length > 0) {
            res.status(403).json({ error: "There is already a user registered with the email you provided. Please log in." });
            return;
        }

        const passwordHash = await passwords.hash(password);
        const result = await usersModel.create(email, passwordHash);
        const userId = result.insertId;

        const firebaseUID = userId.toString();
        await usersModel.setFirebaseUid(userId, firebaseUID);

        const token = createToken();
        await usersModel.setToken(userId, token);

        const firebaseCustomToken = await admin.auth().createCustomToken(firebaseUID);

        res.status(201).json({
            firebaseToken: firebaseCustomToken, // Use a clear name
            token,           // Return the local token
            userId,
            message: `Successfully registered and logged in user with email: ${email}`
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
            res.status(400).json({ error: "Bad Request: Content-Type must be application/json" });
            return;
        }

        const validation = await AJVvalidate(schemas.user_login, req.body);
        if (validation !== true) {
            res.status(400).json({ error: `Bad Request: ${validation.toString()}` });
            return;
        }

        const { email, password } = req.body;

        // 1. Get user by email
        const users = await usersModel.getFromEmail(email);
        const user = users && users.length > 0 ? users[0] : null;

        // 2. CRITICAL FIX: Check if user was found BEFORE accessing properties
        if (!user) {
            // Log this specific failure type for debugging
            Logger.warn(`Login attempt failed: user not found for email: ${email}`);
            res.status(401).send({ error: "Incorrect email or password." });
            return;
        }

        // 3. Compare Password
        const hashedPassword = user.password;
        if (!await passwords.compare(password, hashedPassword)) {
            // Log the failed comparison
            Logger.warn(`Login attempt failed: incorrect password for email: ${email}`);
            res.status(401).send({ error: "Incorrect email or password." });
            return;
        }

        // 4. Proceed with successful authentication
        const firebaseUID = user.user_id.toString();
        const firebaseCustomToken = await admin.auth().createCustomToken(firebaseUID);

        const token = createToken();
        await usersModel.setToken(user.user_id, token);

        // 5. Success: Return the Custom Token
        res.status(200).json({
            firebaseToken: firebaseCustomToken,
            userId: user.user_id,
            message: `Successfully logged in user with email: ${email}`
        });
        return;

    } catch (err) {
        // Log the severe error so you can see it in your backend console
        Logger.error("Login controller unexpected error:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
};

// Assuming your server uses cookies for session management (the best practice for logout)

const logout = async (req: Request, res: Response): Promise<void> => {
    // 1. Check the value immediately upon entry
    Logger.info(`--- START LOGOUT CONTROLLER ---`);
    Logger.info(`res.locals object keys: ${Object.keys(res.locals).join(", ")}`); // Should show 'userId'

    const firebaseUid = res.locals.userId as string;

    Logger.info(`Value of firebaseUid upon entry: [${firebaseUid}]`); // CRITICAL: What is the exact value?

    // The token is already verified by firebaseAuth, so we have a valid UID.
    if (!firebaseUid) {
        Logger.error("Logout failure: firebaseUid is falsy despite passing auth middleware.");
        res.status(401).json({ error: "Unauthorized: No valid session ID found." });
        return;
    }

    try {
        // 2. Revoke all refresh tokens for the current user.
        await admin.auth().revokeRefreshTokens(firebaseUid);

        Logger.info(`Successfully revoked tokens for Firebase UID: ${firebaseUid}`);
        res.status(200).json({ message: "Logged out successfully. All sessions revoked." });

    } catch (err) {
        Logger.error(`Error during token revocation for UID ${firebaseUid}:`, err);
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
            res.status(404).json({ error: `User with id: ${userId} not found.` });
            return;
        }

        const user = users[0];
        const authenticatedFirebaseUID = res.locals.userId as string | undefined;

        const isOwner = authenticatedFirebaseUID && (user.firebase_uid === authenticatedFirebaseUID);

        if (isOwner) {
            res.status(200).json(user);
            return;
        } else {
            const publicUser = {
                user_id: user.user_id
            };
            res.status(200).json(publicUser);
            return;
        }
    } catch (err) {
        Logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export { login, logout, register, view };

// // const update = async (req: Request, res: Response): Promise<void> => {
// //     try {
// //         const contentType = req.header("Content-Type");
// //         if (!contentType || contentType !== "application/json") {
// //             res.status(400).json({ error: "Bad Request: Content-Type must be application/json" });
// //             return;
// //         }

// //         const userId = parseInt(req.params.id, 10);
// //         if (isNaN(userId) || userId <= 0) {
// //             res.status(400).json({ error: "Invalid user ID" });
// //             return;
// //         }

// //         Logger.http(`PATCH updating user with id: ${userId}`);
// //         const validation = await AJVvalidate(schemas.user_edit, req.body);
// //         if (validation !== true) {
// //             res.status(400).json({ error: `Bad Request: ${validation.toString()}` });
// //             return;
// //         }

// //         const user = await users.getFromId(userId);
// //         if (user.length === 0) {
// //             res.status(404).json({ error: `User with id: ${userId} not found.` });
// //             return;
// //         }

// //         if (("password" in req.body) !== ("currentPassword" in req.body)) {
// //             res.status(400).json({ error: "Bad Request: You must provide your current and new password." });
// //             return;
// //         }

// //         const token = req.header("X-Authorization");
// //         if (!token) {
// //             res.status(401).json({ error: "Unauthorized: You must log in first." });
// //             return;
// //         }

// //         const userToken = await users.getFromToken(token);
// //         if (userToken[0].id !== userId) {
// //             res.status(403).json({ error: "Forbidden: You can only edit your own information." });
// //             return;
// //         }

// //         if ("firstName" in req.body) { await users.setFirstName(userId, req.body.firstName); }
// //         if ("lastName" in req.body) { await users.setLastName(userId, req.body.lastName); }

// //         if ("username" in req.body) {
// //             const existingUsername = await users.getFromUsername(req.body.username);
// //             if (existingUsername.length !== 0) {
// //                 res.status(403).json({ error: "Forbidden: There is already a user registered with the username you provided." });
// //                 return;
// //             }
// //             await users.setUsername(userId, req.body.username);
// //         }

// //         if ("email" in req.body) {
// //             const existingEmail = await users.getFromEmail(req.body.email);
// //             if (existingEmail.length !== 0) {
// //                 res.status(403).json({ error: "Forbidden: There is already a user registered with the email you provided." });
// //                 return;
// //             }
// //             await users.setEmail(userId, req.body.email);
// //         }

// //         if ("password" in req.body && "currentPassword" in req.body) {
// //             const { currentPassword, password } = req.body;
// //             const currentHashed = user[0].password;

// //             const correctCurrent = await passwords.compare(currentPassword, currentHashed);
// //             if (!correctCurrent) {
// //                 res.status(401).json({ error: "Unauthorized: Invalid current password." });
// //                 return;
// //             }

// //             const sameAsOld = await passwords.compare(password, currentHashed);
// //             if (sameAsOld) {
// //                 res.status(403).json({ error: "Forbidden: You must choose a new password different from your original." });
// //                 return;
// //             }

// //             const newHash = await passwords.hash(password);
// //             await users.setPassword(userId, newHash);
// //         }

// //         const updatedUser = await users.getFromId(userId);
// //         res.status(200).json(returnUserData(updatedUser[0], true));
// //     } catch (dbErr) {
// //         Logger.error(dbErr);
// //         res.status(500).json({ error: "Failed to update user information in database" });
// //     }
// // };

// export {register, login, logout, view};
