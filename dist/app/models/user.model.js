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
exports.setPassword = exports.setEmail = exports.setLastName = exports.setFirstName = exports.removeToken = exports.getFromToken = exports.setToken = exports.getFromId = exports.getFromEmail = exports.create = void 0;
const db_1 = require("../../config/db");
const logger_1 = __importDefault(require("../../config/logger"));
const create = (firstName, lastName, email, password) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info("Registering user to the database.");
    const conn = yield (0, db_1.getPool)().getConnection();
    try {
        const query = "INSERT INTO user (first_name, last_name, email, password) VALUES (?, ?, ?, ?);";
        const [rows] = yield conn.query(query, [firstName, lastName, email, password]);
        return rows;
    }
    catch (err) {
        logger_1.default.error(`Error registering user: ${err.message}`);
        throw new Error(`Failed to create user: ${err.message}`);
    }
    finally {
        yield conn.release();
    }
});
exports.create = create;
const getFromEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`Retrieving user with email ${email} from the database`);
    const conn = yield (0, db_1.getPool)().getConnection();
    try {
        const query = "SELECT * FROM user WHERE email = ?;";
        const [rows] = yield conn.query(query, [email]);
        return rows;
    }
    catch (err) {
        logger_1.default.error(`Error retrieving user by email: ${err.message}`);
        throw new Error(`Failed to retrieve user by email: ${err.message}`);
    }
    finally {
        yield conn.release();
    }
});
exports.getFromEmail = getFromEmail;
const getFromId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`Retrieving user ${id} from the database`);
    const conn = yield (0, db_1.getPool)().getConnection();
    try {
        const query = "SELECT * FROM user WHERE id = ?;";
        const [rows] = yield conn.query(query, [id]);
        return rows;
    }
    catch (err) {
        logger_1.default.error(`Error retrieving user by ID: ${err.message}`);
        throw new Error(`Failed to retrieve user by ID: ${err.message}`);
    }
    finally {
        yield conn.release();
    }
});
exports.getFromId = getFromId;
const setToken = (id, token) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`Setting authentication token for user ${id}`);
    const conn = yield (0, db_1.getPool)().getConnection();
    try {
        const query = "UPDATE user SET auth_token = ? WHERE id = ?;";
        const [rows] = yield conn.query(query, [token, id]);
        return rows;
    }
    catch (err) {
        logger_1.default.error(`Error setting authentication token: ${err.message}`);
        throw new Error(`Failed to set authentication token: ${err.message}`);
    }
    finally {
        yield conn.release();
    }
});
exports.setToken = setToken;
const getFromToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`Retrieving id from authentication token`);
    const conn = yield (0, db_1.getPool)().getConnection();
    try {
        const query = "SELECT * FROM user WHERE auth_token = ?;";
        const [rows] = yield conn.query(query, [token]);
        return rows;
    }
    catch (err) {
        logger_1.default.error(`Error retrieving user by token: ${err.message}`);
        throw new Error(`Failed to retrieve user by token: ${err.message}`);
    }
    finally {
        yield conn.release();
    }
});
exports.getFromToken = getFromToken;
const removeToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`Removing authentication token`);
    const conn = yield (0, db_1.getPool)().getConnection();
    try {
        const query = "UPDATE user SET auth_token = NULL WHERE auth_token = ?;";
        const [rows] = yield conn.query(query, [token]);
        return rows;
    }
    catch (err) {
        logger_1.default.error(`Error removing authentication token: ${err.message}`);
        throw new Error(`Failed to remove authentication token: ${err.message}`);
    }
    finally {
        yield conn.release();
    }
});
exports.removeToken = removeToken;
const setFirstName = (id, firstName) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`Updating first name for user with id: ${id}`);
    const conn = yield (0, db_1.getPool)().getConnection();
    try {
        const query = "UPDATE user SET first_name = ? WHERE id = ?;";
        const [rows] = yield conn.query(query, [firstName, id]);
        return rows;
    }
    catch (err) {
        logger_1.default.error(`Error updating first name: ${err.message}`);
        throw new Error(`Failed to update first name: ${err.message}`);
    }
    finally {
        yield conn.release();
    }
});
exports.setFirstName = setFirstName;
const setLastName = (id, lastName) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`Updating last name for user with id: ${id}`);
    const conn = yield (0, db_1.getPool)().getConnection();
    try {
        const query = "UPDATE user SET last_name = ? WHERE id = ?;";
        const [rows] = yield conn.query(query, [lastName, id]);
        return rows;
    }
    catch (err) {
        logger_1.default.error(`Error updating last name: ${err.message}`);
        throw new Error(`Failed to update last name: ${err.message}`);
    }
    finally {
        yield conn.release();
    }
});
exports.setLastName = setLastName;
const setEmail = (id, email) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`Updating email for user with id: ${id}`);
    const conn = yield (0, db_1.getPool)().getConnection();
    try {
        const query = "UPDATE user SET email = ? WHERE id = ?;";
        const [rows] = yield conn.query(query, [email, id]);
        return rows;
    }
    catch (err) {
        logger_1.default.error(`Error updating email: ${err.message}`);
        throw new Error(`Failed to update email: ${err.message}`);
    }
    finally {
        yield conn.release();
    }
});
exports.setEmail = setEmail;
const setPassword = (id, password) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info(`Updating password for user with id: ${id}`);
    const conn = yield (0, db_1.getPool)().getConnection();
    try {
        const query = "UPDATE user SET password = ? WHERE id = ?;";
        const [rows] = yield conn.query(query, [password, id]);
        return rows;
    }
    catch (err) {
        logger_1.default.error(`Error updating password: ${err.message}`);
        throw new Error(`Failed to update password: ${err.message}`);
    }
    finally {
        yield conn.release();
    }
});
exports.setPassword = setPassword;
//# sourceMappingURL=user.model.js.map