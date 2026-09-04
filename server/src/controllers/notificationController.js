import Notification from "../models/Notification.js";

// GET /api/admin/notifications
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total] = await Promise.all([
      Notification.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(),
    ]);

    res.json({
      success: true,
      notifications: notifications.map((n) => ({
        id: n._id,
        type: n.type,
        message: n.message,
        userId: n.userId,
        userName: n.userName,
        orderId: n.orderId,
        orderNumber: n.orderNumber,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// PATCH /api/admin/notifications/:id/read
export const markAsRead = async (req, res) => {
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
    console.error("Mark notification read error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// PATCH /api/admin/notifications/read-all
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all notifications read error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Helper: create notification (used internally by order controller)
export async function createOrderNotification(order, user) {
  try {
    const userName = user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : user?.username || "A user";

    const message = `A new order has been placed by ${userName}.`;

    // Use upsert with unique index to prevent duplicates
    await Notification.findOneAndUpdate(
      { orderId: order._id, type: "new_order" },
      {
        type: "new_order",
        message,
        userId: user?._id || order.customer,
        userName,
        orderId: order._id,
        orderNumber: order.orderNumber || "",
      },
      { upsert: true, new: true, runValidators: true }
    );
  } catch (error) {
    // Log but don't fail the order creation
    console.error("Create order notification error:", error.message);
  }
}
