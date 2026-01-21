import { generate } from "rand-token";
import { admin } from "../../config/firebase-admin";
import Logger from "../../config/logger";

const bucket = admin.storage().bucket();

/**
 * Upload an image to Firebase Storage
 * @param imageBuffer The image buffer to upload
 * @param fileExt The file extension (e.g., ".jpeg", ".png")
 * @param folder The folder path in Firebase Storage (e.g., "profile-pictures")
 * @returns The filename of the uploaded image
 */
const uploadImage = async (
    imageBuffer: Buffer,
    fileExt: string,
    folder: string = "images",
): Promise<string> => {
    try {
        const filename = generate(32) + fileExt;
        const filePath = `${folder}/${filename}`;
        const file = bucket.file(filePath);

        await file.save(imageBuffer, {
            metadata: {
                contentType: getContentType(fileExt),
            },
        });

        // Make the file publicly accessible (optional - adjust based on your security requirements)
        await file.makePublic();

        Logger.info(`Image uploaded successfully: ${filePath}`);
        return filename;
    } catch (err) {
        Logger.error(`Error uploading image: ${err}`);
        throw err;
    }
};

/**
 * Download an image from Firebase Storage
 * @param filename The filename to download
 * @param folder The folder path in Firebase Storage
 * @returns A tuple of [Buffer, mimeType]
 */
const downloadImage = async (
    filename: string,
    folder: string = "images",
): Promise<[Buffer, string]> => {
    try {
        const filePath = `${folder}/${filename}`;
        const file = bucket.file(filePath);

        const [exists] = await file.exists();
        if (!exists) {
            throw new Error(`File not found: ${filePath}`);
        }

        const [buffer] = await file.download();
        const [metadata] = await file.getMetadata();
        const mimeType = metadata.contentType || "application/octet-stream";

        return [buffer, mimeType];
    } catch (err) {
        Logger.error(`Error downloading image: ${err}`);
        throw err;
    }
};

/**
 * Delete an image from Firebase Storage
 * @param filename The filename to delete
 * @param folder The folder path in Firebase Storage
 */
const deleteImage = async (
    filename: string,
    folder: string = "images",
): Promise<void> => {
    try {
        if (!filename) {
            return;
        }

        const filePath = `${folder}/${filename}`;
        const file = bucket.file(filePath);

        const [exists] = await file.exists();
        if (exists) {
            await file.delete();
            Logger.info(`Image deleted successfully: ${filePath}`);
        }
    } catch (err) {
        Logger.error(`Error deleting image: ${err}`);
        throw err;
    }
};

/**
 * Get the public URL for an image
 * @param filename The filename
 * @param folder The folder path in Firebase Storage
 * @returns The public URL of the image
 */
const getImageUrl = (filename: string, folder: string = "images"): string => {
    const filePath = `${folder}/${filename}`;
    const file = bucket.file(filePath);
    return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
};

/**
 * Get content type based on file extension
 * @param fileExt The file extension
 * @returns The content type
 */
const getContentType = (fileExt: string): string => {
    switch (fileExt.toLowerCase()) {
        case ".jpeg":
        case ".jpg":
            return "image/jpeg";
        case ".png":
            return "image/png";
        case ".gif":
            return "image/gif";
        case ".webp":
            return "image/webp";
        default:
            return "application/octet-stream";
    }
};

export { deleteImage, downloadImage, getImageUrl, uploadImage };
