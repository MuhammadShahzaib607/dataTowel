import { Router } from "express";
import { getUserNotifications, markUserAllAsRead, markUserNotificationAsRead, getUserUnreadCount } from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getUserNotifications);
router.get("/unread-count", getUserUnreadCount);
router.patch("/read-all", markUserAllAsRead);
router.patch("/:id/read", markUserNotificationAsRead);

export default router;
