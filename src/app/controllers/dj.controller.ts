import { Request, Response } from "express";
import Logger from "../../config/logger";
import * as djProfilesModel from "../models/dj.model";
import * as usersModel from "../models/user.model"; // <--- NEW: Import users model for UID lookup
import * as schemas from "../resources/schemas.json";
import { AJVvalidate } from "../services/AJVvalidate";

const prepareDjProfile = (profile: any) => {
    let parsedGenres: string[] = [];
    try {
        if (profile.genres) {
            parsedGenres = JSON.parse(profile.genres);
        }
    } catch (e) {
        Logger.warn(
            `Failed to parse genres for profile ${profile.dj_id}: ${e.message}`
        );
    }

    return {
        djId: profile.dj_id,
        userId: profile.user_id,
        djName: profile.dj_name,
        bio: profile.bio,
        location: profile.location,
        genres: parsedGenres,
        equipment: profile.equipment,
        soundcloudUrl: profile.soundcloud_url,
        instagramUrl: profile.instagram_url,
        avatarUrl: profile.avatar_url,
        bannerUrl: profile.banner_url,
    };
};

const createProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const contentType = req.header("Content-Type");
        if (!contentType || contentType !== "application/json") {
            res.status(400).json({
                error: "Bad Request: Content-Type must be application/json",
            });
            return;
        }

        // --- Authentication Mapping: Translate Firebase UID to local user_id ---

        // 1. Get the Firebase UID (set by firebaseAuth middleware)
        const firebaseUid = res.locals.userId as string;
        if (!firebaseUid) {
            // This check should technically be redundant if firebaseAuth passed, but good for safety
            res.status(401).json({
                error: "Unauthorized: Missing authentication token.",
            });
            return;
        }

        // 2. Look up the local user record using the Firebase UID
        const users = await usersModel.getFromFirebaseUid(firebaseUid);
        if (users.length === 0) {
            res.status(404).json({
                error: "User record not found in local database. Please ensure user is registered.",
            });
            return;
        }

        const userId = users[0].userId;
        Logger.info(
            `Local user ID found: ${userId}. Checking for existing profile.`
        );

        // --- 3. EARLY CHECK FOR EXISTING PROFILE (Optimized Check) ---
        // We moved this check up immediately after getting the necessary local ID
        const existingProfile = await djProfilesModel.getFromUserId(userId);
        if (existingProfile.length > 0) {
            res.status(403).json({
                error: "Forbidden: A DJ profile already exists for this user.",
            });
            return;
        }

        // --- 4. Validate the Request Body ---
        const validation = await AJVvalidate(
            schemas.dj_profile_create,
            req.body
        );
        if (validation !== true) {
            res.status(400).json({
                error: `Bad Request: ${validation.toString()}`,
            });
            return;
        }

        // Extract data relevant to the profile
        const {
            djName,
            bio,
            location,
            genres,
            equipment,
            soundcloudUrl,
            instagramUrl,
            avatarUrl,
            bannerUrl,
        } = req.body;

        // --- 5. Save the Profile Data ---
        const profileData = {
            userId,
            djName,
            bio,
            location,
            genres: JSON.stringify(genres),
            equipment,
            soundcloudUrl,
            instagramUrl,
            avatarUrl,
            bannerUrl,
        };

        const result = await djProfilesModel.create(profileData);
        const djId = result.insertId;

        Logger.info(
            `Successfully created DJ profile ID: ${djId} for user ID: ${userId}`
        );

        // --- 6. Success Response ---
        res.status(201).json({
            djId,
            message: `DJ profile '${djName}' successfully created.`,
        });
        return;
    } catch (err) {
        Logger.error(
            `Error creating DJ profile for user ${res.locals.userId}: ${err.message}`
        );
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
};

const viewProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const djId = parseInt(req.params.id as string, 10);

        if (isNaN(djId)) {
            res.status(400).json({
                error: "Bad Request: DJ ID must be a number.",
            });
            return;
        }

        Logger.http(`GET viewing DJ profile by DJ ID: ${djId}`);

        const profiles = await djProfilesModel.getFromProfileId(djId);

        if (profiles.length === 0) {
            res.status(404).json({ error: "Not Found: DJ profile not found." });
            return;
        }

        res.status(200).json(prepareDjProfile(profiles[0]));
    } catch (err) {
        Logger.error(`Error viewing DJ profile by ID: ${err.message}`);
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
};

const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const djId = parseInt(req.params.id, 10);
        if (isNaN(djId) || djId <= 0) {
            res.status(400).json({ error: "Invalid DJ ID" });
            return;
        }

        const djs = await djProfilesModel.getFromProfileId(djId);
        if (djs.length === 0) {
            res.status(404).json({ error: `DJ with id: ${djId} not found.` });
        }

        if ("password" in req.body !== "currentPassword" in req.body) {
            res.status(400).json({
                error: "Bad Request: You must provide your current and new password.",
            });
            return;
        }

        try {
            if ("djName" in req.body) {
                await djProfilesModel.setDjName(djId, req.body.djName);
            }

            res.status(200).json({ data: req.body });
        } catch (dbErr) {
            Logger.error(dbErr);
            res.status(500).json({
                error: "Failed to update user information in database",
            });
        }
    } catch (err) {
        Logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export { createProfile, updateProfile, viewProfile };
