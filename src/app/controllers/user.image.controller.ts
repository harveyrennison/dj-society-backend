import {Request, Response} from "express";
import fs from "fs";
import path from "path";
import Logger from "../../config/logger";
import * as images from "../models/user.image.model";
import * as users from "../models/user.model";

const getImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId) || userId <= 0) {
            res.status(400).json({ error: "Invalid user ID" });
            return;
        }
        Logger.http(`GET image for user ${userId}`);
        const user = await users.getFromId(userId);
        if (user.length === 0) {
            res.status(404).json({ error: `User with id: ${userId} not found.` });
            return;
        }
        const image = await images.getImage(userId);
        if (image === null || image === undefined) {
            res.status(404).json({ error: `Image for user ${userId} not found.` });
            return;
        }
        const imagePath = path.join(__dirname, "../../../storage/images", image);
        const storageDir = path.dirname(imagePath);
        if (!fs.existsSync(storageDir)) {
            res.status(404).json({ error: "Storage directory not found" });
            return;
        }
        if (!fs.existsSync(imagePath)) {
            res.status(404).json({ error: `Image file not found for user ${userId}` });
            return;
        }
        let extension = image.split(".").pop()?.toLowerCase();
        if (extension === "jpg") { extension = "jpeg"; }
        res.setHeader("Content-Type", `image/${extension}`);
        res.status(200).sendFile(imagePath);
    } catch (err) {
        Logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const setImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId) || userId <= 0) {
            res.status(400).json({ error: "Invalid user ID" });
            return;
        }
        const user = await users.getFromId(userId);
        if (user.length === 0) {
            res.status(404).json({ error: `User with id: ${userId} not found.` });
            return;
        }
        const token = req.header("X-Authorization");
        if (!token) {
            res.status(401).json({ error: "Unauthorized: You must be logged in to update your profile image" });
            return;
        }
        const userToken = await users.getFromToken(token);
        if (userToken.length === 0 || userToken[0].id !== userId) {
            res.status(403).json({ error: "FORBIDDEN: You can only edit your own information" });
            return;
        }

        const contentType = req.header("Content-Type");
        if (!contentType || !["image/png", "image/jpeg", "image/gif"].includes(contentType)) {
            res.status(400).json({ error: "Bad Request: Content-Type must be image/png, image/jpeg, or image/gif" });
            return;
        }

        if (!req.body || req.body.length === 0) {
            res.status(400).json({ error: "Bad Request: No image data provided" });
            return;
        }

        const fileExtension = contentType.split("/")[1];
        const validExtensions = ["png", "jpg", "jpeg", "gif"];
        if (!validExtensions.includes(fileExtension)) {
            res.status(400).json({ error: "Bad Request: Invalid file extension" });
            return;
        }

        const timestamp = Date.now();
        const filename = `user_${userId}_${timestamp}.${fileExtension}`;
        const imagePath = path.join(__dirname, "../../../storage/images", filename);

        // Ensure the storage directory exists
        const storageDir = path.dirname(imagePath);
        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }

        try {
            fs.writeFileSync(imagePath, req.body);
        } catch (writeErr) {
            Logger.error(writeErr);
            res.status(500).json({ error: "Failed to save image file" });
            return;
        }

        const isNull = user[0].image_filename === null;
        Logger.http(`PATCH image for user ${userId}, user image is null? ${isNull}`);

        try {
            await images.setImage(userId, filename);
            res.status(isNull ? 201 : 200).send();
        } catch (dbErr) {
            // If database update fails, try to clean up the file
            try {
                fs.unlinkSync(imagePath);
            } catch (unlinkErr) {
                Logger.error(unlinkErr);
            }
            Logger.error(dbErr);
            res.status(500).json({ error: "Failed to update user image in database" });
        }
    } catch (err) {
        Logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const deleteImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId) || userId <= 0) {
            res.status(400).json({ error: "Invalid user ID" });
            return;
        }
        const user = await users.getFromId(userId);
        if (user.length === 0) {
            res.status(404).json({ error: `User with id: ${userId} not found.` });
            return;
        }
        const token = req.header("X-Authorization");
        const userToken = await users.getFromToken(token);
        if (!token || userToken.length === 0) {
            res.status(401).json({ error: "Unauthorized: You must be logged in to delete your profile image" });
            return;
        }
        if (userToken[0].id !== userId) {
            res.status(403).json({ error: "FORBIDDEN: You can only delete your own profile image" });
            return;
        }
        if (user[0].image_filename === null) {
            res.status(404).json({ error: `No profile image for user ${userId} has been found.` });
            return;
        }

        try {
            await images.deleteImage(userId);
            res.status(200).send();
        } catch (dbErr) {
            Logger.error(dbErr);
            res.status(500).json({ error: "Failed to delete user image from database" });
        }
    } catch (err) {
        Logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export {getImage, setImage, deleteImage};
