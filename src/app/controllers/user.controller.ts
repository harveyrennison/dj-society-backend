import { Request, Response } from "express";
import { v7 as uuidv7 } from "uuid";
import { admin } from "../../config/firebase-admin";
import Logger from "../../config/logger";
import * as usersModel from "../models/user.model";
import * as schemas from "../resources/schemas.json";
import { AJVvalidate } from "../services/AJVvalidate";
import * as passwords from "../services/passwords";
import { GOOGLE_USER_PASSWORD_PLACEHOLDER } from "../types/constants";
import { User } from "../types/user_types";

const register = async (req: Request, res: Response): Promise<void> => {
    console.log("Register request body:", req.body);
    try {
        const { email, password, firstName, lastName, dateOfBirth } = req.body;

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
            email,
            password: passwordHash,
            firstName: firstName || null,
            lastName: lastName || null,
            dateOfBirth: dateOfBirth || null,
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
    console.log("Login request body:", req.body);
    try {
        const { email, password } = req.body;

        // Validate input
        const validation = await AJVvalidate(schemas.user_login, req.body);
        if (validation !== true) {
            res.status(400).json({
                error: `Bad Request: ${validation.toString()}`,
            });
            return;
        }

        // Check user exists and password is correct
        const users = await usersModel.getFromEmail(email);
        const user = users?.[0];

        if (
            !user ||
            !(await passwords.compare(password, user.password || ""))
        ) {
            res.status(401).json({ error: "Incorrect email or password." });
            return;
        }

        // Generate Firebase custom token
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

const googleLogin = async (req: Request, res: Response): Promise<void> => {
    console.log("Google login request body:", req.body);
    try {
        const { idToken } = req.body;

        if (!idToken) {
            res.status(400).json({ error: "idToken is required" });
            return;
        }
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        // Firebase decoded token contains the same info as Google's payload
        const verifiedEmail = decodedToken.email;
        if (!verifiedEmail) {
            res.status(400).json({ error: "Invalid token: Email missing" });
            return;
        }
        // --- CHANGE END ---

        let userRecord = (await usersModel.getFromEmail(verifiedEmail))[0];

        if (!userRecord) {
            // Use decodedToken properties (name, picture, etc.)
            let firstName: string | null = null;
            let lastName: string | null = null;

            if (decodedToken.name) {
                const parts = decodedToken.name.split(" ");
                firstName = parts[0] || null;
                lastName = parts.length > 1 ? parts.slice(1).join(" ") : null;
            }

            // The rest of your registration logic remains the same...
            const fUid = decodedToken.uid; // Use the UID directly from the verified token

            const placeholderHash = await passwords.hash(
                GOOGLE_USER_PASSWORD_PLACEHOLDER,
            );

            const newUser: User = {
                userId: uuidv7(),
                firebaseUid: fUid,
                email: verifiedEmail,
                password: placeholderHash,
                firstName,
                lastName,
                dateOfBirth: null,
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
    } catch (err: any) {
        Logger.error("Google Login Error:", err);
        res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
        });
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
        const targetUserId = req.params.id;

        const users = await usersModel.getFromId(targetUserId);
        if (users.length === 0) {
            res.status(404).json({ error: "User not found." });
            return;
        }

        const user = users[0];
        const authenticatedFirebaseUID = res.locals.firebaseUid;

        if (user.firebaseUid === authenticatedFirebaseUID) {
            const { password, ...userWithoutPassword } = user;
            res.status(200).json(userWithoutPassword);
        } else {
            res.status(403).json({
                error: "Forbidden: can only view your own profile.",
            });
        }
    } catch (err) {
        Logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
const update = async (req: Request, res: Response): Promise<void> => {
    try {
        const targetUserId = req.params.id;
        const { firstName, lastName, email, dateOfBirth, profilePicture } =
            req.body;

        const users = await usersModel.getFromId(targetUserId);
        if (users.length === 0) {
            res.status(404).json({ error: "User not found." });
            return;
        }

        const user = users[0];
        const authenticatedFirebaseUID = res.locals.firebaseUid;

        if (user.firebaseUid !== authenticatedFirebaseUID) {
            res.status(403).json({
                error: "Forbidden: can only update your own profile.",
            });
            return;
        }

        const validation = await AJVvalidate(schemas.user_update, req.body);
        if (validation !== true) {
            res.status(400).json({
                error: `Bad Request: ${validation.toString()}`,
            });
            return;
        }

        const updateData: any = {};
        if (firstName !== undefined) {
            updateData.firstName = firstName || null;
        }
        if (lastName !== undefined) {
            updateData.lastName = lastName || null;
        }
        if (email !== undefined) {
            updateData.email = email || null;
        }
        if (dateOfBirth !== undefined) {
            updateData.dateOfBirth = dateOfBirth || null;
        }

        await usersModel.update(targetUserId, updateData);

        res.status(200).json({ message: "User updated successfully." });
    } catch (err) {
        Logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export { googleLogin, login, logout, register, update, view };
