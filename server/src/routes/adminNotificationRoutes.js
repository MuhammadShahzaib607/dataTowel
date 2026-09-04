import { Router } from "express";
import { getAdminNotifications, markAdminAllAsRead, markAdminNotificationAsRead, getAdminUnreadCount } from "../controllers/notificationController.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = Router();

router.use(adminAuthMiddleware);

router.get("/", getAdminNotifications);
router.get("/unread-count", getAdminUnreadCount);
router.patch("/read-all", markAdminAllAsRead);
router.patch("/:id/read", markAdminNotificationAsRead);

export default router;
