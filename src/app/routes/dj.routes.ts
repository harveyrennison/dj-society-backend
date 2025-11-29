import { Router } from "express";
import { createProfile, viewProfile } from "../controllers/dj.controller";
import { firebaseAuth } from "../middleware/authentication.middleware";

const router = Router();

// Route to create a DJ profile. Requires user to be authenticated.
router.post("/", firebaseAuth, createProfile);
router.post("/:id", viewProfile);

export default router;
