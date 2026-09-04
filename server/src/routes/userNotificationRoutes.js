import { Router } from "express";
import { getUserNotifications, markUserAllAsRead, getUserUnreadCount } from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getUserNotifications);
router.get("/unread-count", getUserUnreadCount);
router.patch("/read-all", markUserAllAsRead);

export default router;
