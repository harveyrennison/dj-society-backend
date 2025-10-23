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
exports.update = exports.view = exports.logout = exports.login = exports.register = void 0;
const logger_1 = __importDefault(require("../../config/logger"));
const tokens = __importStar(require("../authentication/token"));
const users = __importStar(require("../models/user.model"));
const schemas = __importStar(require("../resources/schemas.json"));
const AJVvalidate_1 = require("../services/AJVvalidate");
const passwords = __importStar(require("../services/passwords"));
const user_transformer_1 = require("../transformers/user.transformer");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contentType = req.header("Content-Type");
        if (!contentType || contentType !== "application/json") {
            res.status(400).json({ error: "Bad Request: Content-Type must be application/json" });
            return;
        }
        const { firstName, lastName, email, password } = req.body;
        logger_1.default.http(`POST create a user with name: ${firstName} ${lastName}`);
        const validation = yield (0, AJVvalidate_1.AJVvalidate)(schemas.user_register, req.body);
        if (validation !== true) {
            res.status(400).json({ error: `Bad Request: ${validation.toString()}` });
            return;
        }
        const existingUser = yield users.getFromEmail(email);
        if (existingUser.length !== 0) {
            res.status(403).json({ error: "There is already a user registered with the email you provided. Please log in." });
            return;
        }
        const passwordHash = yield passwords.hash(password);
        const result = yield users.create(firstName, lastName, email, passwordHash);
        const userId = result.insertId;
        res.status(201).json({
            userId,
            message: `Successfully registered new user with name: ${firstName} ${lastName}.`
        });
    }
    catch (err) {
        logger_1.default.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contentType = req.header("Content-Type");
        if (!contentType || contentType !== "application/json") {
            res.status(400).json({ error: "Bad Request: Content-Type must be application/json" });
            return;
        }
        const validation = yield (0, AJVvalidate_1.AJVvalidate)(schemas.user_login, req.body);
        if (validation !== true) {
            res.status(400).json({ error: `Bad Request: ${validation.toString()}` });
            return;
        }
        const { email, password } = req.body;
        logger_1.default.http(`POST login with email: ${email}.`);
        const user = yield users.getFromEmail(email);
        if (user.length === 0) {
            res.status(401).json({ error: "Incorrect email or password." });
            return;
        }
        const hashedPassword = user[0].password;
        const comparePasswordAndHash = yield passwords.compare(password, hashedPassword);
        if (comparePasswordAndHash === true) {
            const token = tokens.createToken();
            yield users.setToken(user[0].id, token);
            res.status(200).json({
                userId: user[0].id,
                token,
                message: "Logged in successfully. Created authentication token for user."
            });
        }
        else {
            res.status(401).json({ error: "Incorrect email or password." });
        }
    }
    catch (err) {
        logger_1.default.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.header("X-Authorization");
        if (!token) {
            res.status(401).json({ error: "Unauthorized: Cannot log out if you are not authenticated." });
            return;
        }
        yield users.removeToken(token);
        res.status(200).json({ message: "Logged out successfully." });
    }
    catch (err) {
        logger_1.default.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.logout = logout;
const view = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId) || userId <= 0) {
            res.status(400).json({ error: "Invalid user ID" });
            return;
        }
        logger_1.default.http(`GET single user with id: ${userId}`);
        const validation = yield (0, AJVvalidate_1.AJVvalidate)(schemas.user_search, { id: userId.toString() });
        if (validation !== true) {
            res.status(400).json({ error: `Bad Request: ${validation.toString()}` });
            return;
        }
        const user = yield users.getFromId(userId);
        if (user.length === 0) {
            res.status(404).json({ error: `User with id: ${userId} not found.` });
            return;
        }
        const token = req.header("X-Authorization");
        let isAuthenticated = false;
        if (token) {
            const userToken = yield users.getFromToken(token);
            if (user[0].id === userToken[0].id) {
                isAuthenticated = true;
            }
        }
        const userData = (0, user_transformer_1.returnUserData)(user[0], isAuthenticated);
        res.status(200).json(userData);
    }
    catch (err) {
        logger_1.default.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.view = view;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contentType = req.header("Content-Type");
        if (!contentType || contentType !== "application/json") {
            res.status(400).json({ error: "Bad Request: Content-Type must be application/json" });
            return;
        }
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId) || userId <= 0) {
            res.status(400).json({ error: "Invalid user ID" });
            return;
        }
        logger_1.default.http(`PATCH updating user with id: ${userId}`);
        const validation = yield (0, AJVvalidate_1.AJVvalidate)(schemas.user_edit, req.body);
        if (validation !== true) {
            res.status(400).json({ error: `Bad Request: ${validation.toString()}` });
            return;
        }
        const user = yield users.getFromId(userId);
        if (user.length === 0) {
            res.status(404).json({ error: `User with id: ${userId} not found.` });
            return;
        }
        if (("password" in req.body) !== ("currentPassword" in req.body)) {
            res.status(400).json({ error: "Bad Request: You must provide your current and new password." });
            return;
        }
        const token = req.header("X-Authorization");
        const userToken = yield users.getFromToken(token);
        if (!token || userToken.length === 0) {
            res.status(401).json({ error: "Unauthorized: You must log in first." });
            return;
        }
        if (userToken[0].id !== userId) {
            res.status(403).json({ error: "Forbidden: You can only edit your own information." });
            return;
        }
        try {
            if ("firstName" in req.body) {
                yield users.setFirstName(userId, req.body.firstName);
            }
            if ("lastName" in req.body) {
                yield users.setLastName(userId, req.body.lastName);
            }
            if ("email" in req.body) {
                const existingUser = yield users.getFromEmail(req.body.email);
                if (existingUser.length !== 0) {
                    res.status(403).json({ error: "Forbidden: There is already a user registered with the email you provided." });
                    return;
                }
                yield users.setEmail(userId, req.body.email);
            }
            const currentHashedPassword = user[0].password;
            if ("password" in req.body && "currentPassword" in req.body) {
                const currPassword = req.body.currentPassword;
                const comparePasswordAndHash = yield passwords.compare(req.body.password, currentHashedPassword);
                if (comparePasswordAndHash === true) {
                    res.status(403).json({ error: "Forbidden: You must choose a new password different from your original." });
                    return;
                }
                if (currPassword !== user[0].password) {
                    res.status(401).json({ error: "Unauthorized: Invalid current password." });
                    return;
                }
                const hashNewPassword = yield passwords.hash(req.body.password);
                yield users.setPassword(userId, hashNewPassword);
            }
            res.status(200).json({ data: req.body });
        }
        catch (dbErr) {
            logger_1.default.error(dbErr);
            res.status(500).json({ error: "Failed to update user information in database" });
        }
    }
    catch (err) {
        logger_1.default.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.update = update;
//# sourceMappingURL=user.controller.js.map