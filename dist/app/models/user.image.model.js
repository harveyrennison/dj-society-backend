"use strict";
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
const db_1 = require("../../config/db");
const logger_1 = __importDefault(require("../../config/logger"));
const getImage = (id) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`Retrieving image for user ${id}`);
    const conn = yield (0, db_1.getPool)().getConnection();
    try {
        const query = "SELECT image_filename FROM users WHERE id = ?;";
        const [rows] = yield conn.query(query, [id]);
        if (!rows || rows.length === 0) {
            return null;
        }
        return rows[0].image_filename;
    }
    catch (err) {
        logger_1.default.error(`Error retrieving image for user ${id}: ${err.message}`);
        throw new Error(`Failed to retrieve user image: ${err.message}`);
    }
    finally {
        yield conn.release();
    }
});
exports.getImage = getImage;
const setImage = (id, image) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`Setting image for user ${id}`);
    const conn = yield (0, db_1.getPool)().getConnection();
    try {
        const query = "UPDATE users SET image_filename = ? WHERE id = ?;";
        const [rows] = yield conn.query(query, [image, id]);
        return rows;
    }
    catch (err) {
        logger_1.default.error(`Error setting image for user ${id}: ${err.message}`);
        throw new Error(`Failed to set user image: ${err.message}`);
    }
    finally {
        yield conn.release();
    }
});
exports.setImage = setImage;
const deleteImage = (id) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`Deleting image for user ${id}`);
    const conn = yield (0, db_1.getPool)().getConnection();
    try {
        const query = "UPDATE users SET image_filename = NULL WHERE id = ?;";
        const [rows] = yield conn.query(query, [id]);
        return rows;
    }
    catch (err) {
        logger_1.default.error(`Error deleting image for user ${id}: ${err.message}`);
        throw new Error(`Failed to delete user image: ${err.message}`);
    }
    finally {
        yield conn.release();
    }
});
exports.deleteImage = deleteImage;
//# sourceMappingURL=user.image.model.js.map