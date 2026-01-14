import { Request, Response } from "express";
import Logger from "../../config/logger";
import * as genreModel from "../models/genre.model";

/**
 * GET /genres
 * Returns a nested list of all parent genres and their subgenres.
 */
const getGenreTree = async (req: Request, res: Response): Promise<void> => {
    try {
        Logger.http("GET fetching nested genre tree");

        const genres = await genreModel.getAllGenresAndNest();

        if (!genres || genres.length === 0) {
            res.status(200).json([]); // Return empty array if no genres seeded yet
            return;
        }

        res.status(200).json(genres);
    } catch (err: any) {
        Logger.error(
            `Controller Error: Failed to fetch genre tree: ${err.message}`
        );
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export { getGenreTree };
