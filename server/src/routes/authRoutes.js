import { Router } from "express";
import { register, login, getMe, verifyEmail, resendOtp } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);
router.get("/me", authMiddleware, getMe);

export default router;
