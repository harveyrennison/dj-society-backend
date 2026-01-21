import { Router } from "express";
import {
    deleteProfilePicture,
    getImage,
    handleProfileUpload,
} from "../controllers/image.controller";
import * as userController from "../controllers/user.controller";
import { firebaseAuth } from "../middleware/authentication.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/google-login", userController.googleLogin);
router.post("/logout", firebaseAuth, userController.logout);
router.get("/:id", firebaseAuth, userController.view);
router.patch("/:id", firebaseAuth, userController.update);

router.get("/:id/profile-picture", getImage); // Public - no auth needed for viewing images

router.post(
    "/:id/profile-picture",
    firebaseAuth,
    upload.single("file"),
    handleProfileUpload,
);

router.delete("/:id/profile-picture", firebaseAuth, deleteProfilePicture);

export default router;
