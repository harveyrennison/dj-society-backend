import { Request, Response } from "express";
import { v7 as uuidv7 } from "uuid";
import { admin } from "../../config/firebase-admin";
import Logger from "../../config/logger";
import * as usersModel from "../models/user.model";
import * as schemas from "../resources/schemas.json";
import { AJVvalidate } from "../services/AJVvalidate";
import * as passwords from "../services/passwords";
import {
    CLIENT,
    GOOGLE_CLIENT_ID,
    GOOGLE_USER_PASSWORD_PLACEHOLDER,
} from "../types/constants";
import { User } from "../types/user_types";

const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // 1. Validation
        const validation = await AJVvalidate(schemas.user_register, req.body);
        if (validation !== true) {
            res.status(400).json({
                error: `Bad Request: ${validation.toString()}`,
            });
            return;
        }

        // 2. Check Local DB
        const existingEmail = await usersModel.getFromEmail(email);
        if (existingEmail.length > 0) {
            res.status(403).json({
                error: "Email already exists. Please log in.",
            });
            return;
        }

        // 3. Create in Firebase 
        const displayName = [firstName, lastName].filter(Boolean).join(" ");
        const firebaseUser = await admin.auth().createUser({
            email,
            password,
            ...(displayName && { displayName }),
        });

        // 4. Prepare User Object for Model
        const passwordHash = await passwords.hash(password);
        const newUser: User = {
            userId: uuidv7(),
            firebaseUid: firebaseUser.uid,
            email: email,
            password: passwordHash,
            firstName: firstName || null,
            lastName: lastName || null,
        };

        // 5. Save to MySQL using the object-based create function
        await usersModel.create(newUser);

        // 6. Generate Custom Token for the frontend
        const firebaseCustomToken = await admin
            .auth()
            .createCustomToken(firebaseUser.uid);

        res.status(201).json({
            userId: newUser.userId,
            firebaseToken: firebaseCustomToken,
            message: "User registered successfully",
        });
    } catch (err: any) {
        Logger.error(`Registration Error: ${err.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { googleToken, email, password } = req.body;

        if (googleToken) {
            // --- GOOGLE LOGIN FLOW ---
            const ticket = await CLIENT.verifyIdToken({
                idToken: googleToken,
                audience: GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email)
                throw new Error("Invalid Google Payload");

            const verifiedEmail = payload.email;
            let userRecord = (await usersModel.getFromEmail(verifiedEmail))[0];

            if (!userRecord) {
                // Split Google name into first/last
                let firstName: string | null = null;
                let lastName: string | null = null;
                if (payload.name) {
                    const parts = payload.name.split(" ");
                    firstName = parts[0] || null;
                    lastName =
                        parts.length > 1 ? parts.slice(1).join(" ") : null;
                }

                // Ensure they have a Firebase account
                let fUid: string;
                try {
                    const fUser = await admin
                        .auth()
                        .getUserByEmail(verifiedEmail);
                    fUid = fUser.uid;
                } catch {
                    const fUser = await admin
                        .auth()
                        .createUser({ email: verifiedEmail });
                    fUid = fUser.uid;
                }

                const placeholderHash = await passwords.hash(
                    GOOGLE_USER_PASSWORD_PLACEHOLDER
                );

                const newUser: User = {
                    userId: uuidv7(),
                    firebaseUid: fUid,
                    email: verifiedEmail,
                    password: placeholderHash,
                    firstName,
                    lastName,
                };

                await usersModel.create(newUser);
                userRecord = newUser;
            }

            const firebaseCustomToken = await admin
                .auth()
                .createCustomToken(userRecord.firebaseUid);

            res.status(200).json({
                firebaseToken: firebaseCustomToken,
                userId: userRecord.userId,
                message: "Google login successful",
            });
            return;
        }

        // --- STANDARD EMAIL/PASSWORD FLOW ---
        const users = await usersModel.getFromEmail(email);
        const user = users?.[0];

        if (
            !user ||
            !(await passwords.compare(password, user.password || ""))
        ) {
            res.status(401).json({ error: "Incorrect email or password." });
            return;
        }

        const firebaseCustomToken = await admin
            .auth()
            .createCustomToken(user.firebaseUid);

        res.status(200).json({
            firebaseToken: firebaseCustomToken,
            userId: user.userId,
            message: "Login successful",
        });
    } catch (err: any) {
        Logger.error("Login Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const logout = async (req: Request, res: Response): Promise<void> => {
    const firebaseUid = res.locals.firebaseUid as string;

    if (!firebaseUid) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        await admin.auth().revokeRefreshTokens(firebaseUid);
        res.status(200).json({ message: "Logged out successfully." });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const view = async (req: Request, res: Response): Promise<void> => {
    try {
        const targetUserId = req.params.id; // This is a UUID string

        const users = await usersModel.getFromId(targetUserId);
        if (users.length === 0) {
            res.status(404).json({ error: "User not found." });
            return;
        }

        const user = users[0];
        const authenticatedFirebaseUID = res.locals.firebaseUid as string;

        // If the logged-in user is viewing their own profile
        if (user.firebaseUid === authenticatedFirebaseUID) {
            res.status(200).json(user);
        } else {
            // Public view: Only return the public UUID
            res.status(200).json({ userId: user.userId });
        }
    } catch (err) {
        Logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export { login, logout, register, view };
