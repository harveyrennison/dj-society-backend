import { Request, Response } from "express";
import { v7 as uuidv7 } from "uuid";
import Logger from "../../config/logger";
import * as djProfilesModel from "../models/dj.model";
import * as usersModel from "../models/user.model";
import * as schemas from "../resources/schemas.json";
import { AJVvalidate } from "../services/AJVvalidate";
import { DjProfile } from "../types/dj_types";

/**
 * Transforms a raw DjProfile from the database into a clean response object
 * by parsing the genres JSON string back into an array.
 */
const prepareDjProfile = (profile: DjProfile) => {
    let parsedGenres: string[] = [];
    try {
        parsedGenres =
            typeof profile.genres === "string"
                ? JSON.parse(profile.genres)
                : profile.genres;
    } catch (e) {
        Logger.warn(`Failed to parse genres for DJ profile ${profile.djId}`);
    }

    return {
        ...profile,
        genres: parsedGenres,
    };
};

const createProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const firebaseUid = res.locals.firebaseUid;
        const users = await usersModel.getFromFirebaseUid(firebaseUid);
        if (users.length === 0) {
            res.status(404).json({ error: "User not found in database." });
            return;
        }
        const userId = users[0].userId;

        const existing = await djProfilesModel.getFromUserId(userId);
        if (existing.length > 0) {
            res.status(403).json({
                error: "A DJ profile already exists for this user.",
            });
            return;
        }

        const validation = await AJVvalidate(
            schemas.dj_profile_create,
            req.body
        );
        if (validation !== true) {
            res.status(400).json({ error: `Validation Error: ${validation}` });
            return;
        }

        const djId = uuidv7();
        const profileData: DjProfile = {
            djId,
            userId,
            djName: req.body.djName,
            bio: req.body.bio || "",
            location: req.body.location || "",
            genres: JSON.stringify(req.body.genres || []), // Convert array to string for DB
            equipment: req.body.equipment || "",
            soundcloudUrl: req.body.soundcloudUrl || "",
            instagramUrl: req.body.instagramUrl || "",
            avatarUrl: req.body.avatarUrl || "",
            bannerUrl: req.body.bannerUrl || "",
        };

        await djProfilesModel.create(profileData);

        res.status(201).json({
            djId,
            message: "DJ Profile successfully created.",
        });
    } catch (err) {
        Logger.error(`Error in createProfile: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const viewProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const djId = req.params.id;

        const profiles = await djProfilesModel.getFromProfileId(djId);
        if (profiles.length === 0) {
            res.status(404).json({ error: "DJ Profile not found." });
            return;
        }

        const cleanProfile = prepareDjProfile(profiles[0]);
        res.status(200).json(cleanProfile);
    } catch (err) {
        Logger.error(`Error in viewProfile: ${err}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export { createProfile, viewProfile };
