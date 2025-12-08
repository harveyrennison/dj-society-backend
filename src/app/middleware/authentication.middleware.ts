import { NextFunction, Request, Response } from "express";
import admin from "firebase-admin";
import Logger from "../../config/logger";

export const firebaseAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.header("X-Authorization");
    if (!token) {
        return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        Logger.info(
            `Firebase token successfully decoded for UID: ${decodedToken.uid}`
        ); // <-- NEW LOG
        res.locals.userId = decodedToken.uid; // Firebase UID
        next();
    } catch (err) {
        // Log the exact error that Firebase is throwing
        Logger.error("Firebase token verification failed:", err); // <-- CRITICAL DEBUG
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
};
