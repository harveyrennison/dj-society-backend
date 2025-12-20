import { ResultSetHeader } from "mysql2";
import { getPool } from "../../config/db";
import Logger from "../../config/logger";

const clearDjGenres = async (djId: string): Promise<ResultSetHeader> => {
    Logger.info(`Clearing all genre associations for DJ ID: ${djId}`);
    const conn = await getPool().getConnection();
    try {
        const query = "DELETE FROM DjGenres WHERE djId = ?;";
        const [rows] = await conn.query(query, [djId]);
        return rows as ResultSetHeader;
    } catch (err: any) {
        Logger.error(`Error clearing DJ genres for ID ${djId}: ${err.message}`);
        throw new Error(`Failed to clear DJ genres: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const createDjGenreAssociation = async (
    djId: string,
    genreId: string
): Promise<ResultSetHeader> => {
    Logger.info(`Associating user ${djId} with genre ${genreId}`);
    const conn = await getPool().getConnection();
    try {
        const query = "INSERT INTO DjGenres (djId, genreId) VALUES (?, ?);";
        // Use IGNORE to safely skip if the association already exists (due to composite key)
        const [rows] = await conn.query(query, [djId, genreId]);
        return rows as ResultSetHeader;
    } catch (err: any) {
        Logger.error(`Error creating user-genre association: ${err.message}`);
        throw new Error(`Failed to create association: ${err.message}`);
    } finally {
        await conn.release();
    }
};

const getGenresByDjId = async (djId: string): Promise<SimpleGenre[]> => {
    Logger.info(`Retrieving genres for DJ ID: ${djId}`);
    const conn = await getPool().getConnection();
    try {
        const query = `
            SELECT
                g.genreId,
                g.genreName
            FROM DjGenres dg      -- JOIN the DjGenres table
            JOIN Genres g ON dg.genre_id = g.genreId
            WHERE dg.djId = ?;   -- Filter by djId
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

const getAllGenresAndNest = async (): Promise<Genre[]> => {
    Logger.info("Retrieving all genres and nesting subgenres");
    const conn = await getPool().getConnection();

    try {
        const query = `
            SELECT genreId, name, parentId
            FROM Genres
            ORDER BY parentId NULLS FIRST, name ASC;
        `;
        const [rows] = await conn.query(query);
        const dbRows = rows as DbGenreRow[];

        const topLevelGenres: Genre[] = [];
        const subgenresMap = new Map<number, Subgenre[]>();

        for (const row of dbRows) {
            if (row.parentId === null) {
                topLevelGenres.push({
                    genreId: row.genreId,
                    genreName: row.genreName,
                    subgenres: null,
                });
            } else {
                const subgenre: Subgenre = {
                    subgenreId: row.genreId,
                    subgenreName: row.genreName,
                };
                const parentId = row.parentId;

                if (subgenresMap.has(parentId)) {
                    subgenresMap.get(parentId)!.push(subgenre);
                } else {
                    subgenresMap.set(parentId, [subgenre]);
                }
            }
        }

        const result: Genre[] = topLevelGenres.map((parentGenre) => ({
            ...parentGenre,
            subgenres: subgenresMap.get(parentGenre.genreId) || null,
        }));

        return result;
    } catch (err: any) {
        Logger.error(`Error retrieving and nesting genres: ${err.message}`);
        throw new Error(`Failed to retrieve genres: ${err.message}`);
    } finally {
        conn.release();
    }
};

export {
    clearDjGenres,
    createDjGenreAssociation,
    getAllGenresAndNest,
    getGenresByDjId,
};
