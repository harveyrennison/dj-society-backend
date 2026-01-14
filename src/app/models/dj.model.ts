import { ResultSetHeader } from "mysql2";
import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import { DjProfile } from "../types/dj_types";

// --- CREATE ---
const create = async (profile: DjProfile): Promise<ResultSetHeader> => {
    Logger.info(`Creating DJ profile for user UUID: ${profile.userId}`);
    const conn = await getPool().getConnection();
    try {
        const query = `
            INSERT INTO DjProfile (
                djId, userId, djName, bio, location, genres, equipment, soundcloudUrl, instagramUrl, avatarUrl, bannerUrl
            ) VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const [rows] = await conn.query(query, [
            profile.djId,
            profile.userId,
            profile.djName,
            profile.bio,
            profile.location,
            profile.genres,
            profile.equipment,
            profile.soundcloudUrl,
            profile.instagramUrl,
            profile.avatarUrl,
            profile.bannerUrl,
        ]);
        return rows as ResultSetHeader;
    } finally {
        await conn.release();
    }
};

// --- GETTERS ---
const getFromUserId = async (userId: string): Promise<DjProfile[]> => {
    const conn = await getPool().getConnection();
    try {
        const query = `
            SELECT BIN_TO_UUID(djId) as djId, BIN_TO_UUID(userId) as userId,
            djName, bio, location, genres, equipment, soundcloudUrl, instagramUrl, avatarUrl, bannerUrl
            FROM DjProfile WHERE userId = UUID_TO_BIN(?);
        `;
        const [rows] = await conn.query(query, [userId]);
        return rows as DjProfile[];
    } finally {
        await conn.release();
    }
};

const getFromProfileId = async (djId: string): Promise<DjProfile[]> => {
    const conn = await getPool().getConnection();
    try {
        const query = `
            SELECT BIN_TO_UUID(djId) as djId, BIN_TO_UUID(userId) as userId,
            djName, bio, location, genres, equipment, soundcloudUrl, instagramUrl, avatarUrl, bannerUrl
            FROM DjProfile WHERE djId = UUID_TO_BIN(?);
        `;
        const [rows] = await conn.query(query, [djId]);
        return rows as DjProfile[];
    } finally {
        await conn.release();
    }
};

// --- INDIVIDUAL GETTERS ---
const getDjName = async (djId: string): Promise<string | null> => {
    return getField(djId, "djName");
};
const getDjBio = async (djId: string): Promise<string | null> => {
    return getField(djId, "bio");
};
const getDjLocation = async (djId: string): Promise<string | null> => {
    return getField(djId, "location");
};
const getGenres = async (djId: string): Promise<string | null> => {
    return getField(djId, "genres");
};
const getDjEquipment = async (djId: string): Promise<string | null> => {
    return getField(djId, "equipment");
};
const getSoundcloudUrl = async (djId: string): Promise<string | null> => {
    return getField(djId, "soundcloudUrl");
};
const getInstagramUrl = async (djId: string): Promise<string | null> => {
    return getField(djId, "instagramUrl");
};
const getAvatarUrl = async (djId: string): Promise<string | null> => {
    return getField(djId, "avatarUrl");
};
const getBannerUrl = async (djId: string): Promise<string | null> => {
    return getField(djId, "bannerUrl");
};

// --- HELPER ---
const getField = async (
    djId: string,
    field: string
): Promise<string | null> => {
    const conn = await getPool().getConnection();
    try {
        const query = `SELECT ${field} FROM DjProfile WHERE djId = UUID_TO_BIN(?);`;
        const [rows] = await conn.query(query, [djId]);
        const result = rows as any[];
        return result.length > 0 ? result[0][field] : null;
    } finally {
        await conn.release();
    }
};

// --- SETTERS ---
const setDjName = (id: string, val: string) => updateField(id, "djName", val);
const setDjBio = (id: string, val: string) => updateField(id, "bio", val);
const setDjLocation = (id: string, val: string) =>
    updateField(id, "location", val);
const setGenres = (id: string, val: string) => updateField(id, "genres", val);
const setDjEquipment = (id: string, val: string) =>
    updateField(id, "equipment", val);
const setSoundcloudUrl = (id: string, val: string) =>
    updateField(id, "soundcloudUrl", val);
const setInstagramUrl = (id: string, val: string) =>
    updateField(id, "instagramUrl", val);
const setAvatarUrl = (id: string, val: string) =>
    updateField(id, "avatarUrl", val);
const setBannerUrl = (id: string, val: string) =>
    updateField(id, "bannerUrl", val);

// --- HELPER ---
const updateField = async (
    djId: string,
    field: string,
    value: string | null
): Promise<ResultSetHeader> => {
    const conn = await getPool().getConnection();
    try {
        const query = `UPDATE DjProfile SET ${field} = ? WHERE djId = UUID_TO_BIN(?);`;
        const [rows] = await conn.query(query, [value, djId]);
        return rows as ResultSetHeader;
    } finally {
        await conn.release();
    }
};

export {
    create,
    getAvatarUrl,
    getBannerUrl,
    getDjBio,
    getDjEquipment,
    getDjLocation,
    getDjName,
    getFromProfileId,
    getFromUserId,
    getGenres,
    getInstagramUrl,
    getSoundcloudUrl,
    setAvatarUrl,
    setBannerUrl,
    setDjBio,
    setDjEquipment,
    setDjLocation,
    setDjName,
    setGenres,
    setInstagramUrl,
    setSoundcloudUrl,
};
