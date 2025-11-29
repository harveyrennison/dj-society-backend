import { Request, Response } from "express";
import Logger from "../../config/logger";
import * as djProfilesModel from "../models/dj.model";
import * as usersModel from "../models/user.model"; // <--- NEW: Import users model for UID lookup
import * as schemas from "../resources/schemas.json";
import { AJVvalidate } from "../services/AJVvalidate";

const prepareClientProfile = (profile: any) => {
    let parsedGenres: string[] = [];
    try {
        if (profile.genres) {
            parsedGenres = JSON.parse(profile.genres);
        }
    } catch (e) {
        Logger.warn(`Failed to parse genres for profile ${profile.dj_id}: ${e.message}`);
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
            res.status(400).json({ error: "Bad Request: Content-Type must be application/json" });
            return;
        }

        // --- Authentication Mapping: Translate Firebase UID to local user_id ---

        // 1. Get the Firebase UID (set by firebaseAuth middleware)
        const firebaseUid = res.locals.userId as string;
        if (!firebaseUid) {
             // This check should technically be redundant if firebaseAuth passed, but good for safety
             res.status(401).json({ error: "Unauthorized: Missing authentication token." });
             return;
        }

        // 2. Look up the local user record using the Firebase UID
        const users = await usersModel.getFromFirebaseUid(firebaseUid);
        if (users.length === 0) {
            res.status(404).json({ error: "User record not found in local database." });
            return;
        }

        // 3. Extract the local numeric user_id
        const localUserId = users[0].user_id;

        Logger.http(`POST creating DJ profile for local user ID: ${localUserId} (Firebase UID: ${firebaseUid})`);

        // --- 4. Validate the Request Body ---
        const validation = await AJVvalidate(schemas.dj_profile_create, req.body);
        if (validation !== true) {
            res.status(400).json({ error: `Bad Request: ${validation.toString()}` });
            return;
        }

        // Extract data relevant to the profile
        // Note: The variable names here are camelCase, which is fine for JS variables.
        const { djName, bio, location, genres, equipment, soundcloudUrl, instagramUrl, avatarFile, bannerFile } = req.body;

        // --- 5. Check for Existing Profile ---
        // Use the local numeric ID for the database lookup
        const existingProfile = await djProfilesModel.getFromUserId(localUserId);
        if (existingProfile.length > 0) {
            res.status(403).json({ error: "Forbidden: A DJ profile already exists for this user." });
            return;
        }

        // --- 6. Save the Profile Data ---
        // Map the camelCase request data to the required snake_case database model fields (DjProfileData)
        const profileData = {
            user_id: localUserId, // Use the local numeric ID
            dj_name: djName,
            bio,
            location,
            genres: JSON.stringify(genres), // Store genres array as a JSON string
            equipment,
            soundcloud_url: soundcloudUrl,
            instagram_url: instagramUrl,
            avatar_url: avatarFile,
            banner_url: bannerFile,
        };

        const result = await djProfilesModel.create(profileData);
        // Assuming you updated the SQL schema to use 'dj_id', but the model still returns 'insertId'
        const djId = result.insertId;

        Logger.info(`Successfully created DJ profile ID: ${djId} for user ID: ${localUserId}`);

        // --- 7. Success Response ---
        res.status(201).json({
            djId, // Changed from profileId to djId for consistency
            message: `DJ profile '${djName}' successfully created.`
        });
        return;

    } catch (err) {
        Logger.error(`Error creating DJ profile: ${err.message}`); // Log the message property for better visibility
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
};

const viewProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const djId = parseInt(req.params.id as string, 10);

        if (isNaN(djId)) {
            res.status(400).json({ error: "Bad Request: DJ ID must be a number." });
            return;
        }

        Logger.http(`GET viewing DJ profile by DJ ID: ${djId}`);

        const profiles = await djProfilesModel.getFromProfileId(djId);

        if (profiles.length === 0) {
            res.status(404).json({ error: "Not Found: DJ profile not found." });
            return;
        }

        res.status(200).json(prepareClientProfile(profiles[0]));

    } catch (err) {
        Logger.error(`Error viewing DJ profile by ID: ${err.message}`);
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
};

// Other potential functions:
// const updateProfile = async (req: Request, res: Response): Promise<void> => { ... };

export { createProfile, viewProfile }; // <-- Export the new function
