import { Request, Response } from "express";
import Logger from "../../config/logger";
import * as tokens from "../authentication/token";
import * as users from "../models/user.model";
import * as schemas from "../resources/schemas.json";
import {AJVvalidate} from "../services/AJVvalidate";
import * as passwords from "../services/passwords";
import {returnUserData} from "../transformers/user.transformer";

const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const contentType = req.header("Content-Type");
        if (!contentType || contentType !== "application/json") {
            res.status(400).json({ error: "Bad Request: Content-Type must be application/json" });
            return;
        }

        const { firstName, lastName, username, email, password } = req.body;
        Logger.http(`POST create a user with name: ${firstName} ${lastName}`);

        const validation = await AJVvalidate(schemas.user_register, req.body);
        if (validation !== true) {
            res.status(400).json({ error: `Bad Request: ${validation.toString()}` });
            return;
        }
        const existingEmail = await users.getFromEmail(email);
        if (existingEmail.length !== 0) {
            res.status(403).json({ error: "There is already a user registered with the email you provided. Please log in." });
            return;
        }

        const existingUsername = await users.getFromUsername(username);
        if (existingUsername.length !== 0) {
            res.status(403).json({ error: "There is already a user registered with the username you provided. Please log in." });
            return;
        }
        const passwordHash = await passwords.hash(password);
        const result = await users.create(firstName, lastName, username, email, passwordHash);
        const userId = result.insertId;
        res.status(201).json({ userId, message:`Successfully registered new user with name: ${firstName} ${lastName}.` });
    } catch (err) {
        Logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const contentType = req.header("Content-Type");
        if (!contentType || contentType !== "application/json") {
            res.status(400).json({ error: "Bad Request: Content-Type must be application/json" });
            return;
        }

        const validation = await AJVvalidate(schemas.user_login, req.body);
        if (validation !== true) {
            res.status(400).json({ error: `Bad Request: ${validation.toString()}` });
            return;
        }
        const { email, password } = req.body;
        Logger.http(`POST login with email: ${email}.`);
        const user = await users.getFromEmail(email);
        if (user.length === 0) {
            res.status(401).json({ error: "Incorrect email or password." });
            return;
        }
        const hashedPassword = user[0].password;
        const comparePasswordAndHash = await passwords.compare(password, hashedPassword);
        if (comparePasswordAndHash === true) {
            const token = tokens.createToken();
            await users.setToken(user[0].id, token);
            res.status(200).json({
                userId: user[0].id,
                token,
                message: "Logged in successfully. Created authentication token for user."
            });
        } else {
            res.status(401).json({ error: "Incorrect email or password." });
        }
    } catch (err) {
        Logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.header("X-Authorization");
        if (!token) {
            res.status(401).json({ error: "Unauthorized: Cannot log out if you are not authenticated." });
            return;
        }
        await users.removeToken(token);
        res.status(200).json({ message: "Logged out successfully." });
    } catch (err) {
        Logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const view = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId) || userId <= 0) {
            res.status(400).json({ error: "Invalid user ID" });
            return;
        }
        Logger.http(`GET single user with id: ${userId}`);

        const validation = await AJVvalidate(schemas.user_search, { id: userId.toString() });
        if (validation !== true) {
            res.status(400).json({ error: `Bad Request: ${validation.toString()}` });
            return;
        }
        const user = await users.getFromId(userId);
        if (user.length === 0) {
            res.status(404).json({ error: `User with id: ${userId} not found.` });
            return;
        }
        
        const token = req.header("X-Authorization");
        let isAuthenticated = false;
        if (token) {
            const userToken = await users.getFromToken(token);
            if (user[0].id === userToken[0].id) {
                isAuthenticated = true;
            }
        }

        const userData = returnUserData(user[0], isAuthenticated);
        res.status(200).json(userData);
    } catch (err) {
        Logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const update = async (req: Request, res: Response): Promise<void> => {
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

        Logger.http(`PATCH updating user with id: ${userId}`);
        const validation = await AJVvalidate(schemas.user_edit, req.body);
        if (validation !== true) {
            res.status(400).json({ error: `Bad Request: ${validation.toString()}` });
            return;
        }

        const user = await users.getFromId(userId);
        if (user.length === 0) {
            res.status(404).json({ error: `User with id: ${userId} not found.` });
            return;
        }

        if (("password" in req.body) !== ("currentPassword" in req.body)) {
            res.status(400).json({ error: "Bad Request: You must provide your current and new password." });
            return;
        }

        const token = req.header("X-Authorization");
        const userToken = await users.getFromToken(token);
        if (!token || userToken.length === 0 ) {
            res.status(401).json({ error: "Unauthorized: You must log in first." });
            return;
        }
        if (userToken[0].id !== userId) {
            res.status(403).json({ error: "Forbidden: You can only edit your own information." });
            return;
        }

        try {
            if ("firstName" in req.body) { await users.setFirstName(userId, req.body.firstName); }
            if ("lastName" in req.body) { await users.setLastName(userId, req.body.lastName); }
            
            if ("username" in req.body) { 
                const existingUsername = await users.getFromEmail(req.body.username);
                if (existingUsername.length !== 0) {
                    res.status(403).json({ error: "Forbidden: There is already a user registered with the email you provided." });
                    return;
                }
                await users.setUsername(userId, req.body.username);
            }

            if ("email" in req.body) {
                const existingEmail = await users.getFromEmail(req.body.email);
                if (existingEmail.length !== 0) {
                    res.status(403).json({ error: "Forbidden: There is already a user registered with the email you provided." });
                    return;
                }
                await users.setEmail(userId, req.body.email);
            }

            const currentHashedPassword = user[0].password;
            if ("password" in req.body && "currentPassword" in req.body) {
                const currPassword = req.body.currentPassword;
                const comparePasswordAndHash = await passwords.compare(req.body.password, currentHashedPassword);
                if (comparePasswordAndHash === true) {
                    res.status(403).json({ error: "Forbidden: You must choose a new password different from your original." });
                    return;
                }
                if (currPassword !== user[0].password) {
                    res.status(401).json({ error: "Unauthorized: Invalid current password." });
                    return;
                }
                const hashNewPassword = await passwords.hash(req.body.password);
                await users.setPassword(userId, hashNewPassword);
            }

            res.status(200).json({ data: req.body });
        } catch (dbErr) {
            Logger.error(dbErr);
            res.status(500).json({ error: "Failed to update user information in database" });
        }
    } catch (err) {
        Logger.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export {register, login, logout, view, update};
