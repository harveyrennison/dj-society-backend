import { Router } from "express";
import { createProfile, viewProfile } from "../controllers/dj.controller";
import { firebaseAuth } from "../middleware/authentication.middleware";

const router = Router();

// Route to create a DJ profile. Requires user to be authenticated.
router.post("", firebaseAuth, createProfile);
router.get("/:id", viewProfile);
router.get("/me", firebaseAuth, viewProfile);

export default router;
