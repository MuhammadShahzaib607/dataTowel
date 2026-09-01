import { Router } from "express";
import { getProfile, updateProfile, uploadProfileImage } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/profile/image", authMiddleware, upload.single("profileImage"), uploadProfileImage);

export default router;
