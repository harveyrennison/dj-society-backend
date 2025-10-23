import { ResultSetHeader } from "mysql2";
import { getPool } from "../../config/db";
import Logger from "../../config/logger";

const getImage = async (id: number): Promise<string | null> => {
    Logger.info(`Retrieving image for user ${id}`);
    const conn = await getPool().getConnection();
    try {
        const query = "SELECT image_filename FROM user WHERE id = ?;";
        const [rows] = await conn.query(query, [id]);

        if (!rows || rows.length === 0) {
            return null;
        }

        return rows[0].image_filename;
    } catch (err) {
        Logger.error(`Error retrieving image for user ${id}: ${err.message}`);
        throw new Error(`Failed to retrieve user image: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const setImage = async (id: number, image: string): Promise<ResultSetHeader> => {
    Logger.info(`Setting image for user ${id}`);
    const conn = await getPool().getConnection();
    try {
        const query = "UPDATE user SET image_filename = ? WHERE id = ?;";
        const [rows] = await conn.query(query, [image, id]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error setting image for user ${id}: ${err.message}`);
        throw new Error(`Failed to set user image: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const deleteImage = async (id: number): Promise<ResultSetHeader> => {
    Logger.info(`Deleting image for user ${id}`);
    const conn = await getPool().getConnection();
    try {
        const query = "UPDATE user SET image_filename = NULL WHERE id = ?;";
        const [rows] = await conn.query(query, [id]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error deleting image for user ${id}: ${err.message}`);
        throw new Error(`Failed to delete user image: ${err.message}`);
    } finally {
        await conn.release();
    }
};

export { getImage, setImage, deleteImage };
