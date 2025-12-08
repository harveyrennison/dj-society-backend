import { ResultSetHeader } from "mysql2";
import { getPool } from "../../config/db";
import Logger from "../../config/logger";

const create = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
): Promise<ResultSetHeader> => {
    Logger.info("Registering user to the database.");
    const conn = await getPool().getConnection();
    try {
        let query: string;
        let values: Array<string | undefined>;

        const includeNames = !!firstName || !!lastName;

        if (includeNames) {
            query =
                "INSERT INTO Users (email, password, firstName, lastName) VALUES (?, ?, ?, ?);";
            values = [email, password, firstName, lastName];
        } else {
            query = "INSERT INTO Users (email, password) VALUES (?, ?);";
            values = [email, password];
        }
        const [rows] = await conn.query(query, values);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error registering user: ${err.message}`);
        throw new Error(`Failed to create user: ${err.message}`);
    } finally {
        await conn.release();
    }
};

// Add this new function to your model:
const getFromFirebaseUid = async (firebaseUid: string): Promise<User[]> => {
    Logger.info(
        `Retrieving user with Firebase UID ${firebaseUid} from the database`
    );
    const conn = await getPool().getConnection();
    try {
        const query = "SELECT * FROM Users WHERE firebaseUid = ?;";
        const [rows] = await conn.query(query, [firebaseUid]);
        return rows as User[];
    } catch (err) {
        Logger.error(`Error retrieving user by Firebase UID: ${err.message}`);
        throw new Error(
            `Failed to retrieve user by Firebase UID: ${err.message}`
        );
    } finally {
        await conn.release();
    }
};

const setFirebaseUid = async (
    userId: number,
    firebaseUid: string
): Promise<ResultSetHeader> => {
    Logger.info(`Setting Firebase UID for user ${userId}`);
    const conn = await getPool().getConnection();
    try {
        // Assume your users table has a column named 'firebaseUid'
        const query = "UPDATE Users SET firebaseUid = ? WHERE userId = ?;";
        const [rows] = await conn.query(query, [firebaseUid, userId]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error setting Firebase UID: ${err.message}`);
        throw new Error(`Failed to set Firebase UID: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const getFromId = async (userId: number): Promise<User[]> => {
    Logger.info(`Retrieving user ${userId} from the database`);
    const conn = await getPool().getConnection();
    try {
        const query = "SELECT * FROM Users WHERE userId = ?;";
        // Assuming rows is the first element of the result array
        const [rows] = await conn.query(query, [userId]);
        return rows as User[];
    } catch (err) {
        Logger.error(`Error retrieving user by ID: ${err.message}`);
        throw new Error(`Failed to retrieve user by ID: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const getFromEmail = async (email: string): Promise<User[]> => {
    Logger.info(`Retrieving user with email ${email} from the database`);
    const conn = await getPool().getConnection();
    try {
        const query = "SELECT * FROM Users WHERE email = ?;";
        // Assuming rows is the first element of the result array
        const [rows] = await conn.query(query, [email]);
        return rows as User[];
    } catch (err) {
        Logger.error(`Error retrieving user by email: ${err.message}`);
        throw new Error(`Failed to retrieve user by email: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const setEmail = async (
    userId: number,
    email: string
): Promise<ResultSetHeader> => {
    Logger.info(`Updating email for user with id: ${userId}`);
    const conn = await getPool().getConnection();
    try {
        const query = "UPDATE Users SET email = ? WHERE userId = ?;";
        const [rows] = await conn.query(query, [email, userId]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error updating email: ${err.message}`);
        throw new Error(`Failed to update email: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const setToken = async (
    userId: number,
    token: string
): Promise<ResultSetHeader> => {
    Logger.info(`Setting authentication token for user ${userId}`);
    const conn = await getPool().getConnection();
    try {
        const query = "UPDATE Users SET token = ? WHERE userId = ?;";
        const [rows] = await conn.query(query, [token, userId]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error setting authentication token: ${err.message}`);
        throw new Error(`Failed to set authentication token: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const getFromToken = async (token: string): Promise<User[]> => {
    Logger.info(`Retrieving id from authentication token`);
    const conn = await getPool().getConnection();
    try {
        const query = "SELECT * FROM Users WHERE token = ?;";
        const [rows] = await conn.query(query, [token]);
        return rows as User[];
    } catch (err) {
        Logger.error(`Error retrieving user by token: ${err.message}`);
        throw new Error(`Failed to retrieve user by token: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const removeToken = async (token: string): Promise<ResultSetHeader> => {
    Logger.info(`Removing authentication token`);
    const conn = await getPool().getConnection();
    try {
        const query = "UPDATE Users SET token = NULL WHERE token = ?;";
        const [rows] = await conn.query(query, [token]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error removing authentication token: ${err.message}`);
        throw new Error(
            `Failed to remove authentication token: ${err.message}`
        );
    } finally {
        await conn.release();
    }
};

const setFirstName = async (
    userId: number,
    firstName: string
): Promise<ResultSetHeader> => {
    Logger.info(`Updating first name for user with id: ${userId}`);
    const conn = await getPool().getConnection();
    try {
        const query = "UPDATE Users SET firstName = ? WHERE userId = ?;";
        const [rows] = await conn.query(query, [firstName, userId]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error updating first name: ${err.message}`);
        throw new Error(`Failed to update first name: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const setLastName = async (
    userId: number,
    lastName: string
): Promise<ResultSetHeader> => {
    Logger.info(`Updating last name for user with id: ${userId}`);
    const conn = await getPool().getConnection();
    try {
        const query = "UPDATE Users SET lastName = ? WHERE userId = ?;";
        const [rows] = await conn.query(query, [lastName, userId]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error updating last name: ${err.message}`);
        throw new Error(`Failed to update last name: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const setPassword = async (
    userId: number,
    password: string
): Promise<ResultSetHeader> => {
    Logger.info(`Updating password for user with id: ${userId}`);
    const conn = await getPool().getConnection();
    try {
        const query = "UPDATE Users SET password = ? WHERE userId = ?;";
        const [rows] = await conn.query(query, [password, userId]);
        return rows as ResultSetHeader;
    } catch (err) {
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
    getFromToken,
    removeToken,
    setEmail,
    setFirebaseUid,
    setFirstName,
    setLastName,
    setPassword,
    setToken,
};
