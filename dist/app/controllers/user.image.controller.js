"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.setImage = exports.getImage = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("../../config/logger"));
const images = __importStar(require("../models/user.image.model"));
const users = __importStar(require("../models/user.model"));
const getImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId) || userId <= 0) {
            res.status(400).json({ error: "Invalid user ID" });
            return;
        }
        logger_1.default.http(`GET image for user ${userId}`);
        const user = yield users.getFromId(userId);
        if (user.length === 0) {
            res.status(404).json({ error: `User with id: ${userId} not found.` });
            return;
        }
        const image = yield images.getImage(userId);
        if (image === null || image === undefined) {
            res.status(404).json({ error: `Image for user ${userId} not found.` });
            return;
        }
        const imagePath = path_1.default.join(__dirname, "../../../storage/images", image);
        const storageDir = path_1.default.dirname(imagePath);
        if (!fs_1.default.existsSync(storageDir)) {
            res.status(404).json({ error: "Storage directory not found" });
            return;
        }
        if (!fs_1.default.existsSync(imagePath)) {
            res.status(404).json({ error: `Image file not found for user ${userId}` });
            return;
        }
        let extension = (_a = image.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        if (extension === "jpg") {
            extension = "jpeg";
        }
        res.setHeader("Content-Type", `image/${extension}`);
        res.status(200).sendFile(imagePath);
    }
    catch (err) {
        logger_1.default.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getImage = getImage;
const setImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId) || userId <= 0) {
            res.status(400).json({ error: "Invalid user ID" });
            return;
        }
        const user = yield users.getFromId(userId);
        if (user.length === 0) {
            res.status(404).json({ error: `User with id: ${userId} not found.` });
            return;
        }
        const token = req.header("X-Authorization");
        if (!token) {
            res.status(401).json({ error: "Unauthorized: You must be logged in to update your profile image" });
            return;
        }
        const userToken = yield users.getFromToken(token);
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
        const imagePath = path_1.default.join(__dirname, "../../../storage/images", filename);
        // Ensure the storage directory exists
        const storageDir = path_1.default.dirname(imagePath);
        if (!fs_1.default.existsSync(storageDir)) {
            fs_1.default.mkdirSync(storageDir, { recursive: true });
        }
        try {
            fs_1.default.writeFileSync(imagePath, req.body);
        }
        catch (writeErr) {
            logger_1.default.error(writeErr);
            res.status(500).json({ error: "Failed to save image file" });
            return;
        }
        const isNull = user[0].image_filename === null;
        logger_1.default.http(`PATCH image for user ${userId}, user image is null? ${isNull}`);
        try {
            yield images.setImage(userId, filename);
            res.status(isNull ? 201 : 200).send();
        }
        catch (dbErr) {
            // If database update fails, try to clean up the file
            try {
                fs_1.default.unlinkSync(imagePath);
            }
            catch (unlinkErr) {
                logger_1.default.error(unlinkErr);
            }
            logger_1.default.error(dbErr);
            res.status(500).json({ error: "Failed to update user image in database" });
        }
    }
    catch (err) {
        logger_1.default.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.setImage = setImage;
const deleteImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId) || userId <= 0) {
            res.status(400).json({ error: "Invalid user ID" });
            return;
        }
        const user = yield users.getFromId(userId);
        if (user.length === 0) {
            res.status(404).json({ error: `User with id: ${userId} not found.` });
            return;
        }
        const token = req.header("X-Authorization");
        const userToken = yield users.getFromToken(token);
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
            yield images.deleteImage(userId);
            res.status(200).send();
        }
        catch (dbErr) {
            logger_1.default.error(dbErr);
            res.status(500).json({ error: "Failed to delete user image from database" });
        }
    }
    catch (err) {
        logger_1.default.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.deleteImage = deleteImage;
//# sourceMappingURL=user.image.controller.js.map