import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { firebaseAuth } from "../middleware/authentication.middleware";

const router = Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", firebaseAuth, userController.logout);
// router.post("/settings", firebaseAuth, userController.settings);

router.get("/:id", firebaseAuth, userController.view);

export default router;
