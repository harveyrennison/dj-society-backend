import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import { ResultSetHeader } from 'mysql2';

const create = async (firstName: string, lastName: string, email: string, password: string): Promise<ResultSetHeader> => {
    Logger.info('Registering user to the database.');
    const conn = await getPool().getConnection();
    try {
        const query = 'INSERT INTO user (first_name, last_name, email, password) VALUES (?, ?, ?, ?);';
        const [rows] = await conn.query(query, [firstName, lastName, email, password]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error registering user: ${err.message}`);
        throw new Error(`Failed to create user: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const getFromEmail = async (email: string): Promise<User[]> => {
    Logger.info(`Retrieving user with email ${email} from the database`);
    const conn = await getPool().getConnection();
    try {
        const query = 'SELECT * FROM user WHERE email = ?;';
        const [rows] = await conn.query(query, [email]);
        return rows as User[];
    } catch (err) {
        Logger.error(`Error retrieving user by email: ${err.message}`);
        throw new Error(`Failed to retrieve user by email: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const getFromId = async (id: number): Promise<User[]> => {
    Logger.info(`Retrieving user ${id} from the database`);
    const conn = await getPool().getConnection();
    try {
        const query = 'SELECT * FROM user WHERE id = ?;';
        const [rows] = await conn.query(query, [id]);
        return rows as User[];
    } catch (err) {
        Logger.error(`Error retrieving user by ID: ${err.message}`);
        throw new Error(`Failed to retrieve user by ID: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const setToken = async (id: number, token: string): Promise<ResultSetHeader> => {
    Logger.info(`Setting authentication token for user ${id}`);
    const conn = await getPool().getConnection();
    try {
        const query = 'UPDATE user SET auth_token = ? WHERE id = ?;';
        const [rows] = await conn.query(query, [token, id]);
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
        const query = 'SELECT * FROM user WHERE auth_token = ?;';
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
        const query = 'UPDATE user SET auth_token = NULL WHERE auth_token = ?;';
        const [rows] = await conn.query(query, [token]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error removing authentication token: ${err.message}`);
        throw new Error(`Failed to remove authentication token: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const setFirstName = async (id: number, firstName: string): Promise<ResultSetHeader> => {
    Logger.info(`Updating first name for user with id: ${id}`);
    const conn = await getPool().getConnection();
    try {
        const query = 'UPDATE user SET first_name = ? WHERE id = ?;';
        const [rows] = await conn.query(query, [firstName, id]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error updating first name: ${err.message}`);
        throw new Error(`Failed to update first name: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const setLastName = async (id: number, lastName: string): Promise<ResultSetHeader> => {
    Logger.info(`Updating last name for user with id: ${id}`);
    const conn = await getPool().getConnection();
    try {
        const query = 'UPDATE user SET last_name = ? WHERE id = ?;';
        const [rows] = await conn.query(query, [lastName, id]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error updating last name: ${err.message}`);
        throw new Error(`Failed to update last name: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const setEmail = async (id: number, email: string): Promise<ResultSetHeader> => {
    Logger.info(`Updating email for user with id: ${id}`);
    const conn = await getPool().getConnection();
    try {
        const query = 'UPDATE user SET email = ? WHERE id = ?;';
        const [rows] = await conn.query(query, [email, id]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error updating email: ${err.message}`);
        throw new Error(`Failed to update email: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const setPassword = async (id: number, password: string): Promise<ResultSetHeader> => {
    Logger.info(`Updating password for user with id: ${id}`);
    const conn = await getPool().getConnection();
    try {
        const query = 'UPDATE user SET password = ? WHERE id = ?;';
        const [rows] = await conn.query(query, [password, id]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error updating password: ${err.message}`);
        throw new Error(`Failed to update password: ${err.message}`);
    } finally {
        await conn.release();
    }
};

export { create, getFromEmail, getFromId, setToken, getFromToken, removeToken, setFirstName, setLastName, setEmail, setPassword };