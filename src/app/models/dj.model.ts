import { ResultSetHeader } from "mysql2";
import { getPool } from "../../config/db";
import Logger from "../../config/logger";

const create = async (profileData: DjProfileData): Promise<ResultSetHeader> => {
    Logger.info(`Creating DJ profile for user ID: ${profileData.user_id}`);
    const conn = await getPool().getConnection();
    try {
        const query = `
            INSERT INTO dj_profiles (
                user_id, dj_name, bio, location, genres, equipment, soundcloud_url, instagram_url, avatar_url, banner_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const [rows] = await conn.query(query, [
            profileData.user_id,
            profileData.dj_name,
            profileData.bio,
            profileData.location,
            profileData.genres, // Stored as JSON string
            profileData.equipment,
            profileData.soundcloud_url,
            profileData.instagram_url,
            profileData.avatar_url,
            profileData.banner_url,
        ]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error creating DJ profile: ${err.message}`);
        throw new Error(`Failed to create DJ profile: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const getFromUserId = async (userId: number): Promise<DjProfile[]> => {
    Logger.info(`Retrieving DJ profile for user ID: ${userId}`);
    const conn = await getPool().getConnection();
    try {
        const query = "SELECT * FROM dj_profiles WHERE user_id = ?;";
        const [rows] = await conn.query(query, [userId]);
        return rows as DjProfile[];
    } catch (err) {
        Logger.error(`Error retrieving DJ profile by user ID: ${err.message}`);
        throw new Error(`Failed to retrieve DJ profile by user ID: ${err.message}`);
    } finally {
        await conn.release();
    }
};

// You might also want a function to view the profile by its own ID:
const getFromProfileId = async (djId: number): Promise<DjProfile[]> => {
    Logger.info(`Retrieving DJ profile ID: ${djId}`);
    const conn = await getPool().getConnection();
    try {
        const query = "SELECT * FROM dj_profiles WHERE dj_id = ?;";
        const [rows] = await conn.query(query, [djId]);
        return rows as DjProfile[];
    } catch (err) {
        Logger.error(`Error retrieving DJ profile by profile ID: ${err.message}`);
        throw new Error(`Failed to retrieve DJ profile by profile ID: ${err.message}`);
    } finally {
        await conn.release();
    }
};

export { create, getFromUserId, getFromProfileId };
