import { ResultSetHeader } from "mysql2";
import { getPool } from "../../config/db";
import Logger from "../../config/logger";

const create = async (profileData: DjProfileData): Promise<ResultSetHeader> => {
    Logger.info(`Creating DJ profile for user ID: ${profileData.userId}`);
    const conn = await getPool().getConnection();
    try {
        const query = `
            INSERT INTO DjProfile (
                userId, djName, bio, location, genres, equipment, soundcloudUrl, instagramUrl, avatarUrl, bannerUrl
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const [rows] = await conn.query(query, [
            profileData.userId,
            profileData.djName,
            profileData.bio,
            profileData.location,
            profileData.genres, // Stored as JSON string
            profileData.equipment,
            profileData.soundcloudUrl,
            profileData.instagramUrl,
            profileData.avatarUrl,
            profileData.bannerUrl,
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
        const query = "SELECT * FROM DjProfile WHERE userId = ?;";
        const [rows] = await conn.query(query, [userId]);
        return rows as DjProfile[];
    } catch (err) {
        Logger.error(`Error retrieving DJ profile by user ID: ${err.message}`);
        throw new Error(
            `Failed to retrieve DJ profile by user ID: ${err.message}`
        );
    } finally {
        await conn.release();
    }
};

// You might also want a function to view the profile by its own ID:
const getFromProfileId = async (djId: number): Promise<DjProfile[]> => {
    Logger.info(`Retrieving DJ profile ID: ${djId}`);
    const conn = await getPool().getConnection();
    try {
        const query = "SELECT * FROM DjProfiles WHERE djId = ?;";
        const [rows] = await conn.query(query, [djId]);
        return rows as DjProfile[];
    } catch (err) {
        Logger.error(
            `Error retrieving DJ profile by profile ID: ${err.message}`
        );
        throw new Error(
            `Failed to retrieve DJ profile by profile ID: ${err.message}`
        );
    } finally {
        await conn.release();
    }
};

const setDjName = async (
    djId: number,
    djName: string
): Promise<ResultSetHeader> => {
    Logger.info(`Retrieving DJ profile ID: ${djId}`);
    const conn = await getPool().getConnection();
    try {
        const query = "UPDATE DjProfiles SET djName = ? WHERE djId = ?;";
        const [rows] = await conn.query(query, [djName, djId]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error updating DJ name: ${err.message}`);
        throw new Error(`Failed to update DJ name: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const setDjBio = async (
    djId: number,
    bio: string
): Promise<ResultSetHeader> => {
    Logger.info(`Retrieving DJ profile ID: ${djId}`);
    const conn = await getPool().getConnection();
    try {
        const query = "UPDATE DjProfiles SET bio = ? WHERE djId = ?;";
        const [rows] = await conn.query(query, [bio, djId]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error updating DJ name: ${err.message}`);
        throw new Error(`Failed to update DJ name: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const setDjEquipment = async (
    djId: number,
    equipment: string
): Promise<ResultSetHeader> => {
    Logger.info(`Retrieving DJ profile ID: ${djId}`);
    const conn = await getPool().getConnection();
    try {
        const query = "UPDATE DjProfiles SET equipment = ? WHERE djId = ?;";
        const [rows] = await conn.query(query, [equipment, djId]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error updating DJ name: ${err.message}`);
        throw new Error(`Failed to update DJ name: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const setSoundcloudUrl = async (
    djId: number,
    soundcloudUrl: string
): Promise<ResultSetHeader> => {
    Logger.info(`Retrieving DJ profile ID: ${djId}`);
    const conn = await getPool().getConnection();
    try {
        const query = "UPDATE DjProfiles SET soundcloudUrl = ? WHERE djId = ?;";
        const [rows] = await conn.query(query, [soundcloudUrl, djId]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error updating DJ name: ${err.message}`);
        throw new Error(`Failed to update DJ name: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const setInstagramUrl = async (
    djId: number,
    instagramUrl: string
): Promise<ResultSetHeader> => {
    Logger.info(`Retrieving DJ profile ID: ${djId}`);
    const conn = await getPool().getConnection();
    try {
        const query = "UPDATE DjProfiles SET instagramUrl = ? WHERE djId = ?;";
        const [rows] = await conn.query(query, [instagramUrl, djId]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error updating DJ name: ${err.message}`);
        throw new Error(`Failed to update DJ name: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const setAvatarUrl = async (
    djId: number,
    avatarUrl: string
): Promise<ResultSetHeader> => {
    Logger.info(`Setting image for user ${djId}`);
    const conn = await getPool().getConnection();
    try {
        const query = "UPDATE Users SET avatarUrl = ? WHERE djId = ?;";
        const [rows] = await conn.query(query, [avatarUrl, djId]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error setting image for user ${djId}: ${err.message}`);
        throw new Error(`Failed to set user image: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const setBannerUrl = async (
    djId: number,
    bannerUrl: string
): Promise<ResultSetHeader> => {
    Logger.info(`Setting image for user ${djId}`);
    const conn = await getPool().getConnection();
    try {
        const query = "UPDATE Users SET bannerUrl = ? WHERE djId = ?;";
        const [rows] = await conn.query(query, [bannerUrl, djId]);
        return rows as ResultSetHeader;
    } catch (err) {
        Logger.error(`Error setting image for user ${djId}: ${err.message}`);
        throw new Error(`Failed to set user image: ${err.message}`);
    } finally {
        await conn.release();
    }
};

export {
    create,
    getFromProfileId,
    getFromUserId,
    setAvatarUrl,
    setBannerUrl,
    setDjBio,
    setDjEquipment,
    setDjName,
    setInstagramUrl,
    setSoundcloudUrl,
};
