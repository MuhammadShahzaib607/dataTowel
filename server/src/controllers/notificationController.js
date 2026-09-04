import Notification from "../models/Notification.js";

// ─── ADMIN APIs ──────────────────────────────────────────

// GET /api/admin/notifications
export const getAdminNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, isRead } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (userId && userId.trim()) {
      filter.userId = userId.trim();
    }
    if (isRead === "true") filter.isRead = true;
    else if (isRead === "false") filter.isRead = false;

    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Notification.countDocuments(filter),
    ]);

    res.json({
      success: true,
      notifications: notifications.map((n) => ({
        id: n._id, type: n.type, title: n.title, message: n.message,
        userId: n.userId, orderId: n.orderId, reason: n.reason || "",
        link: n.link || "", isRead: n.isRead, createdAt: n.createdAt,
      })),
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error("[Notification] Get admin notifications error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// GET /api/admin/notifications/unread-count
export const getAdminUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ isRead: false });
    res.json({ success: true, count });
  } catch (error) {
    console.error("[Notification] Get admin unread count error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// PATCH /api/admin/notifications/read-all
export const markAdminAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("[Notification] Mark all admin notifications read error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// PATCH /api/admin/notifications/:id/read
export const markAdminNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.json({ success: true, notification: { id: notification._id, isRead: notification.isRead } });
  } catch (error) {
    console.error("[Notification] Mark admin notification read error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── USER APIs ───────────────────────────────────────────

// GET /api/notifications
export const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = { userId: req.user._id };
    if (isRead === "true") filter.isRead = true;
    else if (isRead === "false") filter.isRead = false;

    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Notification.countDocuments(filter),
    ]);

    res.json({
      success: true,
      notifications: notifications.map((n) => ({
        id: n._id, type: n.type, title: n.title, message: n.message,
        userId: n.userId, orderId: n.orderId, reason: n.reason || "",
        link: n.link || "", isRead: n.isRead, createdAt: n.createdAt,
      })),
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error("[Notification] Get user notifications error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// GET /api/notifications/unread-count
export const getUserUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    res.json({ success: true, count });
  } catch (error) {
    console.error("[Notification] Get user unread count error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// PATCH /api/notifications/read-all
export const markUserAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("[Notification] Mark all user notifications read error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// PATCH /api/notifications/:id/read
export const markUserNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.json({ success: true, notification: { id: notification._id, isRead: notification.isRead } });
  } catch (error) {
    console.error("[Notification] Mark user notification read error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── HELPER: create admin notification ────────────────────

export async function createAdminNotification({ type, title, message, userId, orderId, reason, link }) {
  try {
    console.log(`[Notification] Creating admin notification for order: ${orderId}`);
    const notification = await Notification.create({
      type, title, message, userId, orderId,
      reason: reason || "",
      link: link || `/admin/orders/${orderId}`,
      isRead: false,
    });
    console.log(`[Notification] Created: ${notification._id}`);
    return notification;
  } catch (error) {
    console.error("[Notification] Failed to create admin notification:", error.message);
  }
}

// ─── HELPER: create user notification ─────────────────────

export async function createUserNotification({ type, title, message, userId, orderId, reason, link }) {
  try {
    console.log(`[Notification] Creating user notification for user: ${userId}, order: ${orderId}`);
    const notification = await Notification.create({
      type, title, message, userId, orderId,
      reason: reason || "",
      link: link || `/dashboard/orders/${orderId}`,
      isRead: false,
    });
    console.log(`[Notification] Created: ${notification._id}`);
    return notification;
  } catch (error) {
    console.error("[Notification] Failed to create user notification:", error.message);
  }
}

// ─── EXISTING: new order notification ─────────────────────

export async function createOrderNotification(order, user) {
  try {
    const orderId = order._id;
    console.log(`[Notification] Creating admin notification for order: ${orderId}`);

    const userName = user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : user?.username || "A customer";

    const userId = user?._id || order.customer;

    await createAdminNotification({
      type: "new_order",
      title: "New Order Received",
      message: `A new order has been placed by ${userName}.`,
      userId,
      orderId,
      link: `/admin/orders/${orderId}`,
    });
  } catch (error) {
    console.error("[Notification] Create order notification error:", error.message);
  }
}

// ─── HELPER: format status for display ────────────────────

export function formatStatus(status) {
  if (!status) return "Unknown";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
