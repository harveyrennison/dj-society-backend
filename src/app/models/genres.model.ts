import { ResultSetHeader } from "mysql2";
import { getPool } from "../../config/db";
import Logger from "../../config/logger";

// Retrieve all genres
const getAll = async (): Promise<Genre[]> => {
    Logger.info("Retrieving all genres");
    const conn = await getPool().getConnection();
    try {
        const query = "SELECT * FROM genres ORDER BY parent_id, name;";
        const [rows] = await conn.query(query);
        return rows as Genre[];
    } catch (err: any) {
        Logger.error(`Error retrieving genres: ${err.message}`);
        throw new Error(`Failed to retrieve genres: ${err.message}`);
    } finally {
        conn.release();
    }
};

// Retrieve genre from id
const getFromId = async (id: number): Promise<Genre[]> => {
    Logger.info(`Retrieving genre with ID: ${id}`);
    const conn = await getPool().getConnection();
    try {
        const query = "SELECT * FROM genres WHERE id = ?;";
        const [rows] = await conn.query(query, [id]);
        return rows as Genre[];
    } catch (err: any) {
        Logger.error(`Error retrieving genre by ID: ${err.message}`);
        throw new Error(`Failed to retrieve genre by ID: ${err.message}`);
    } finally {
        conn.release();
    }
};

// Retrieve all subgenres under a given parent genre
const getSubgenres = async (parentId: number): Promise<Genre[]> => {
    Logger.info(`Retrieving subgenres for parent genre ID: ${parentId}`);
    const conn = await getPool().getConnection();
    try {
        const query = "SELECT * FROM genres WHERE parent_id = ? ORDER BY name;";
        const [rows] = await conn.query(query, [parentId]);
        return rows as Genre[];
    } catch (err: any) {
        Logger.error(`Error retrieving subgenres: ${err.message}`);
        throw new Error(`Failed to retrieve subgenres: ${err.message}`);
    } finally {
        conn.release();
    }
};

export { getAll, getFromId, getSubgenres };