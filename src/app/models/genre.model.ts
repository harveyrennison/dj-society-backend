import { ResultSetHeader } from "mysql2";
import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import { DbGenreRow, Genre, SimpleGenre, Subgenre } from "../types/genre_types"; // Adjust import path as needed

/**
 * Deletes all genre associations for a specific DJ.
 */
const clearDjGenres = async (djId: string): Promise<ResultSetHeader> => {
    Logger.info(`Clearing all genre associations for DJ ID: ${djId}`);
    const conn = await getPool().getConnection();
    try {
        const query = "DELETE FROM DjGenres WHERE djId = UUID_TO_BIN(?);";
        const [rows] = await conn.query(query, [djId]);
        return rows as ResultSetHeader;
    } catch (err: any) {
        Logger.error(`Error clearing DJ genres for ID ${djId}: ${err.message}`);
        throw new Error(`Failed to clear DJ genres: ${err.message}`);
    } finally {
        await conn.release();
    }
};

/**
 * Creates a single link between a DJ and a Genre.
 */
const createDjGenreAssociation = async (
    djId: string,
    genreId: string
): Promise<ResultSetHeader> => {
    Logger.info(`Associating DJ ${djId} with genre ${genreId}`);
    const conn = await getPool().getConnection();
    try {
        const query =
            "INSERT INTO DjGenres (djId, genreId) VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?));";
        const [rows] = await conn.query(query, [djId, genreId]);
        return rows as ResultSetHeader;
    } catch (err: any) {
        Logger.error(`Error creating DJ-genre association: ${err.message}`);
        throw new Error(`Failed to create association: ${err.message}`);
    } finally {
        await conn.release();
    }
};

/**
 * Retrieves all genres associated with a specific DJ ID.
 */
const getGenresByDjId = async (djId: string): Promise<SimpleGenre[]> => {
    Logger.info(`Retrieving genres for DJ ID: ${djId}`);
    const conn = await getPool().getConnection();
    try {
        const query = `
            SELECT
                BIN_TO_UUID(g.genreId) as genreId,
                g.name
            FROM DjGenres dg
            JOIN Genres g ON dg.genreId = g.genreId
            WHERE dg.djId = UUID_TO_BIN(?);
        `;
        const [rows] = await conn.query(query, [djId]);
        return rows as SimpleGenre[];
    } catch (err: any) {
        Logger.error(`Error retrieving DJ genres: ${err.message}`);
        throw new Error(`Failed to retrieve DJ genres: ${err.message}`);
    } finally {
        await conn.release();
    }
};

/**
 * Retrieves all available genres and nests them into a Parent -> Subgenres tree.
 */
const getAllGenresAndNest = async (): Promise<Genre[]> => {
    Logger.info("Retrieving all genres and nesting subgenres");
    const conn = await getPool().getConnection();

    try {
        // MySQL uses (parentId IS NULL) DESC to sort NULLs to the top (parents first)
        const query = `
            SELECT BIN_TO_UUID(genreId) as genreId, name, BIN_TO_UUID(parentId) as parentId
            FROM Genres
            ORDER BY (parentId IS NULL) DESC, name ASC;
        `;
        const [rows] = await conn.query(query);
        const dbRows = rows as DbGenreRow[];

        const topLevelGenres: Genre[] = [];
        const subgenresMap = new Map<string, Subgenre[]>();

        for (const row of dbRows) {
            if (row.parentId === null) {
                topLevelGenres.push({
                    genreId: row.genreId,
                    name: row.name,
                    subgenres: null,
                });
            } else {
                const subgenre: Subgenre = {
                    genreId: row.genreId,
                    name: row.name,
                };

                const parentId = row.parentId;
                const existingSubgenres = subgenresMap.get(parentId) || [];
                existingSubgenres.push(subgenre);
                subgenresMap.set(parentId, existingSubgenres);
            }
        }

        // Map the top level genres and attach their children from the Map
        return topLevelGenres.map((parent) => ({
            ...parent,
            subgenres: subgenresMap.get(parent.genreId) || null,
        }));
    } catch (err: any) {
        Logger.error(`Error retrieving and nesting genres: ${err.message}`);
        throw new Error(`Failed to retrieve genres: ${err.message}`);
    } finally {
        await conn.release();
    }
};

export {
    clearDjGenres,
    createDjGenreAssociation,
    getAllGenresAndNest,
    getGenresByDjId,
};
