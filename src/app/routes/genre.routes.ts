import { Router } from "express";
import * as genreController from "../controllers/genre.controller";

const router = Router();

router.get("/", genreController.getGenreTree);

export default router;
