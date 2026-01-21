import { Request, Response } from "express";
import Logger from "../../config/logger";
import * as imagesModel from "../models/images.model";
import * as usersModel from "../models/user.model";
import { downloadImage } from "../services/firebase-storage.service";
import { getImageExtension } from "../tools/image.tools";
import { PROFILE_PICTURE_FOLDER } from "../types/constants";

const getImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const targetUserId = req.params.id;
        console.log(`[DEBUG] Fetching image for user: ${targetUserId}`);

        const filename = await usersModel.getImageFilename(targetUserId);
        console.log(`[DEBUG] Filename from DB: "${filename}"`);

        if (!filename) {
            console.error(
                `[DEBUG] Retrieval Failed: No filename stored in DB for user ${targetUserId}`,
            );
            res.status(404).json({ error: "No image associated with user" });
            return;
        }

        const [image, mimetype] = await downloadImage(
            filename,
            PROFILE_PICTURE_FOLDER,
        );

        console.log(
            `[DEBUG] Successfully read file. Mime: ${mimetype}, Size: ${image.length} bytes`,
        );
        res.status(200).contentType(mimetype).send(image);
    } catch (err: any) {
        console.error(`[DEBUG] Critical Error: ${err.message}`);
        if (err.message.includes("not found")) {
            res.status(404).json({ error: "Image not found" });
        } else {
            res.status(500).send();
        }
    }
};

const handleProfileUpload = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const targetUserId = req.params.id;
        console.log(`[DEBUG] Upload request for user: ${targetUserId}`);
        console.log(`[DEBUG] File present:`, !!req.file);
        console.log(
            `[DEBUG] File details:`,
            req.file
                ? {
                      fieldname: req.file.fieldname,
                      originalname: req.file.originalname,
                      mimetype: req.file.mimetype,
                      size: req.file.size,
                  }
                : "No file",
        );

        const users = await usersModel.getFromId(targetUserId);
        if (users.length === 0) {
            res.status(404).json({ error: "User not found." });
            return;
        }

        if (!req.file) {
            res.status(400).json({ error: "No file uploaded" });
            return;
        }

        const extension = getImageExtension(req.file.mimetype);
        if (!extension) {
            res.status(400).json({
                error: "Invalid file type. Only JPEG and PNG are supported.",
            });
            return;
        }

        const existingFilename =
            await usersModel.getImageFilename(targetUserId);
        if (existingFilename) {
            console.log(`[DEBUG] Deleting existing image: ${existingFilename}`);
            await imagesModel.removeProfilePictureImage(existingFilename);
        }

        console.log(`[DEBUG] Uploading new image with extension: ${extension}`);
        const filename = await imagesModel.addProfilePictureImage(
            req.file.buffer,
            extension,
        );

        console.log(`[DEBUG] Updating user record with filename: ${filename}`);
        await usersModel.update(targetUserId, {
            profilePictureFilename: filename,
        });

        console.log(`[DEBUG] Upload successful!`);
        res.status(201).json({ filename });
    } catch (err) {
        console.error(`[DEBUG] Upload error:`, err);
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).json({ error: err.message || "Upload failed" });
    }
};

const deleteProfilePicture = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const targetUserId = req.params.id;

        const users = await usersModel.getFromId(targetUserId);
        if (users.length === 0) {
            res.status(404).json({ error: "User not found." });
            return;
        }

        const filename = await usersModel.getImageFilename(targetUserId);
        if (!filename) {
            res.status(404).json({ error: "Profile picture not found." });
            return;
        }

        await imagesModel.removeProfilePictureImage(filename);
        await usersModel.update(targetUserId, { profilePictureFilename: null });

        res.status(200).json({ message: "Profile picture deleted." });
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
};

export { deleteProfilePicture, getImage, handleProfileUpload };
