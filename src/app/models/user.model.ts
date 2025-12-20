import { ResultSetHeader } from "mysql2";
import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import { User } from "../types/user_types";

const create = async (user: User): Promise<ResultSetHeader> => {
    const conn = await getPool().getConnection();
    try {
        const query = `
            INSERT INTO Users (userId, firebaseUid, email, password, firstName, lastName) 
            VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?);
        `;
        const values = [
            user.userId,
            user.firebaseUid,
            user.email,
            user.password ?? null,
            user.firstName ?? null,
            user.lastName ?? null,
        ];
        const [rows] = await conn.query(query, values);
        return rows as ResultSetHeader;
    } catch (err: any) {
        Logger.error(`Error creating user: ${err.message}`);
        throw new Error(`Failed to create user: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const getFromFirebaseUid = async (firebaseUid: string): Promise<User[]> => {
    const conn = await getPool().getConnection();
    try {
        const query = `
            SELECT BIN_TO_UUID(userId) as userId, email, firebaseUid, firstName, lastName 
            FROM Users 
            WHERE firebaseUid = ?;
        `;
        const [rows] = await conn.query(query, [firebaseUid]);
        return rows as User[];
    } catch (err: any) {
        Logger.error(`Error fetching user by Firebase UID: ${err.message}`);
        throw new Error(
            `Failed to retrieve user by Firebase UID: ${err.message}`
        );
    } finally {
        await conn.release();
    }
};

const getFromId = async (userId: string): Promise<User[]> => {
    const conn = await getPool().getConnection();
    try {
        const query = `
            SELECT BIN_TO_UUID(userId) as userId, email, firebaseUid, firstName, lastName 
            FROM Users 
            WHERE userId = UUID_TO_BIN(?);
        `;
        const [rows] = await conn.query(query, [userId]);
        return rows as User[];
    } catch (err: any) {
        Logger.error(`Error fetching user by ID: ${err.message}`);
        throw new Error(`Failed to retrieve user by ID: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const getFromEmail = async (email: string): Promise<User[]> => {
    const conn = await getPool().getConnection();
    try {
        const query = `
            SELECT BIN_TO_UUID(userId) as userId, email, firebaseUid, firstName, lastName 
            FROM Users 
            WHERE email = ?;
        `;
        const [rows] = await conn.query(query, [email]);
        return rows as User[];
    } catch (err: any) {
        Logger.error(`Error fetching user by email: ${err.message}`);
        throw new Error(`Failed to retrieve user by email: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const setEmail = async (
    userId: string,
    email: string
): Promise<ResultSetHeader> => {
    const conn = await getPool().getConnection();
    try {
        const query =
            "UPDATE Users SET email = ? WHERE userId = UUID_TO_BIN(?);";
        const [rows] = await conn.query(query, [email, userId]);
        return rows as ResultSetHeader;
    } catch (err: any) {
        Logger.error(`Error updating email: ${err.message}`);
        throw new Error(`Failed to update email: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const setFirstName = async (
    userId: string,
    firstName: string
): Promise<ResultSetHeader> => {
    const conn = await getPool().getConnection();
    try {
        const query =
            "UPDATE Users SET firstName = ? WHERE userId = UUID_TO_BIN(?);";
        const [rows] = await conn.query(query, [firstName, userId]);
        return rows as ResultSetHeader;
    } catch (err: any) {
        Logger.error(`Error updating first name: ${err.message}`);
        throw new Error(`Failed to update first name: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const setLastName = async (
    userId: string,
    lastName: string
): Promise<ResultSetHeader> => {
    const conn = await getPool().getConnection();
    try {
        const query =
            "UPDATE Users SET lastName = ? WHERE userId = UUID_TO_BIN(?);";
        const [rows] = await conn.query(query, [lastName, userId]);
        return rows as ResultSetHeader;
    } catch (err: any) {
        Logger.error(`Error updating last name: ${err.message}`);
        throw new Error(`Failed to update last name: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const setPassword = async (
    userId: string,
    passwordHash: string
): Promise<ResultSetHeader> => {
    const conn = await getPool().getConnection();
    try {
        const query =
            "UPDATE Users SET password = ? WHERE userId = UUID_TO_BIN(?);";
        const [rows] = await conn.query(query, [passwordHash, userId]);
        return rows as ResultSetHeader;
    } catch (err: any) {
        Logger.error(`Error updating password: ${err.message}`);
        throw new Error(`Failed to update password: ${err.message}`);
    } finally {
        await conn.release();
    }
};

export {
    create,
    getFromEmail,
    getFromFirebaseUid,
    getFromId,
    setEmail,
    setFirstName,
    setLastName,
    setPassword,
};
