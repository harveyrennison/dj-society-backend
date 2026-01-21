import { NextFunction, Request, Response } from "express";
import admin from "firebase-admin";
import Logger from "../../config/logger";

export const firebaseAuth = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    // Allow OPTIONS requests (CORS preflight)
    if (req.method === "OPTIONS") {
        return next();
    }

    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ error: "Unauthorized: Missing or invalid token" });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        Logger.info(
            `Firebase token successfully decoded for UID: ${decodedToken.uid}`,
        );
        res.locals.firebaseUid = decodedToken.uid; // Firebase UID
        next();
    } catch (err) {
        // Log the exact error that Firebase is throwing
        Logger.error("Firebase token verification failed:", err);
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
};
