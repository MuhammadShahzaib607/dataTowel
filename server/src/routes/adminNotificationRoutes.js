import { Router } from "express";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = Router();

router.use(adminAuthMiddleware);

router.get("/", getNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

export default router;
