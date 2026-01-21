import { ResultSetHeader } from "mysql2";
import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import { User } from "../types/user_types";

const create = async (user: User): Promise<ResultSetHeader> => {
    const conn = await getPool().getConnection();
    try {
        const query = `
            INSERT INTO Users (userId, firebaseUid, email, password, firstName, lastName, dateOfBirth, profilePictureFilename)
            VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?, ?);
        `;
        const values = [
            user.userId,
            user.firebaseUid,
            user.email,
            user.password ?? null,
            user.firstName ?? null,
            user.lastName ?? null,
            user.dateOfBirth ?? null,
            user.profilePictureFilename ?? null,
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
            SELECT BIN_TO_UUID(userId) as userId, email, firebaseUid, firstName, lastName, dateOfBirth, profilePictureFilename
            FROM Users
            WHERE firebaseUid = ?;
        `;
        const [rows] = await conn.query(query, [firebaseUid]);
        return rows as User[];
    } catch (err: any) {
        Logger.error(`Error fetching user by Firebase UID: ${err.message}`);
        throw new Error(
            `Failed to retrieve user by Firebase UID: ${err.message}`,
        );
    } finally {
        await conn.release();
    }
};

const getFromId = async (userId: string): Promise<User[]> => {
    const conn = await getPool().getConnection();
    try {
        const query = `
            SELECT BIN_TO_UUID(userId) as userId, email, firebaseUid, firstName, lastName, dateOfBirth, profilePictureFilename
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
            SELECT BIN_TO_UUID(userId) as userId, email, firebaseUid, firstName, lastName, dateOfBirth, profilePictureFilename
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
    email: string,
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
    firstName: string,
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
    lastName: string,
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
    passwordHash: string,
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

const setDateOfBirth = async (
    userId: string,
    dateOfBirth: string,
): Promise<ResultSetHeader> => {
    const conn = await getPool().getConnection();
    try {
        const query =
            "UPDATE Users SET dateOfBirth = ? WHERE userId = UUID_TO_BIN(?);";
        const [rows] = await conn.query(query, [dateOfBirth, userId]);
        return rows as ResultSetHeader;
    } catch (err: any) {
        Logger.error(`Error updating date of birth: ${err.message}`);
        throw new Error(`Failed to update date of birth: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const getDateOfBirth = async (userId: string): Promise<string | null> => {
    const conn = await getPool().getConnection();
    try {
        const query = `
            SELECT dateOfBirth
            FROM Users
            WHERE userId = UUID_TO_BIN(?);
        `;
        const [rows] = await conn.query(query, [userId]);
        const result = rows as any[];
        return result.length > 0 ? result[0].dateOfBirth : null;
    } catch (err: any) {
        Logger.error(`Error fetching date of birth: ${err.message}`);
        throw new Error(`Failed to retrieve date of birth: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const getFullName = async (userId: string): Promise<string | null> => {
    const conn = await getPool().getConnection();
    try {
        const query = `
            SELECT firstName, lastName
            FROM Users
            WHERE userId = UUID_TO_BIN(?);
        `;
        const [rows] = await conn.query(query, [userId]);
        const result = rows as any[];
        if (result.length > 0) {
            const { firstName, lastName } = result[0];
            return firstName && lastName ? `${firstName} ${lastName}` : null;
        }
        return null;
    } catch (err: any) {
        Logger.error(`Error fetching full name: ${err.message}`);
        throw new Error(`Failed to retrieve full name: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const getFirstName = async (userId: string): Promise<string | null> => {
    const conn = await getPool().getConnection();
    try {
        const query = `
            SELECT firstName
            FROM Users
            WHERE userId = UUID_TO_BIN(?);
        `;
        const [rows] = await conn.query(query, [userId]);
        const result = rows as any[];
        return result.length > 0 ? result[0].firstName : null;
    } catch (err: any) {
        Logger.error(`Error fetching first name: ${err.message}`);
        throw new Error(`Failed to retrieve first name: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const getLastName = async (userId: string): Promise<string | null> => {
    const conn = await getPool().getConnection();
    try {
        const query = `
            SELECT lastName
            FROM Users
            WHERE userId = UUID_TO_BIN(?);
        `;
        const [rows] = await conn.query(query, [userId]);
        const result = rows as any[];
        return result.length > 0 ? result[0].lastName : null;
    } catch (err: any) {
        Logger.error(`Error fetching last name: ${err.message}`);
        throw new Error(`Failed to retrieve last name: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const update = async (
    userId: string,
    updates: Partial<
        Pick<
            User,
            | "firstName"
            | "lastName"
            | "email"
            | "password"
            | "dateOfBirth"
            | "profilePictureFilename"
        >
    >,
): Promise<ResultSetHeader> => {
    const conn = await getPool().getConnection();
    try {
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field) => `${field} = ?`).join(", ");
        const query = `UPDATE Users SET ${setClause} WHERE userId = UUID_TO_BIN(?);`;
        values.push(userId);
        const [rows] = await conn.query(query, values);
        return rows as ResultSetHeader;
    } catch (err: any) {
        Logger.error(`Error updating user: ${err.message}`);
        throw new Error(`Failed to update user: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const getImageFilename = async (userId: string): Promise<string> => {
    const conn = await getPool().getConnection();
    try {
        const query = `SELECT profilePictureFilename FROM Users WHERE userId = UUID_TO_BIN(?)`;
        const [rows] = await conn.query(query, [userId]);
        const result = rows as any[];
        return result.length > 0 ? result[0].profilePictureFilename : null;
    } catch (err: any) {
        Logger.error(`Error fetching profile picture: ${err.message}`);
        throw new Error(`Failed to retrieve profile picture: ${err.message}`);
    } finally {
        await conn.release();
    }
};

export {
    create,
    getDateOfBirth,
    getFirstName,
    getFromEmail,
    getFromFirebaseUid,
    getFromId,
    getFullName,
    getImageFilename,
    getLastName,
    setDateOfBirth,
    setEmail,
    setFirstName,
    setLastName,
    setPassword,
    update,
};
