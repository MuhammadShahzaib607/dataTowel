import Order from "../models/Order.js";

function sanitizeOrder(order) {
  return {
    id: order._id,
    customer: order.customer,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    items: order.items,
    totalAmount: order.totalAmount,
    notes: order.notes,
    isActive: order.isActive,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

// POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const { customer, customerName, customerEmail, items, notes } = req.body;

    const orderItems = Array.isArray(items)
      ? items.map((item) => ({
          product: item.product || undefined,
          name: item.name || "",
          size: item.size || "",
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
          total: (Number(item.quantity) || 1) * (Number(item.price) || 0),
        }))
      : [];

    const totalAmount = orderItems.reduce((sum, item) => sum + item.total, 0);

    const order = await Order.create({
      customer: customer || undefined,
      customerName: customerName || "",
      customerEmail: customerEmail || "",
      items: orderItems,
      totalAmount,
      notes: notes || "",
    });

    res.status(201).json({ success: true, order: sanitizeOrder(order) });
  } catch (error) {
    console.error("Create order error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// GET /api/orders
export const getOrders = async (req, res) => {
  try {
    const { isActive, search } = req.query;
    const filter = {};

    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("customer", "username email")
      .lean();

    res.json({
      success: true,
      orders: orders.map((o) => ({ ...o, id: o._id })),
    });
  } catch (error) {
    console.error("Get orders error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// GET /api/orders/:id
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "username email")
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, order: { ...order, id: order._id } });
  } catch (error) {
    console.error("Get order error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// PUT /api/orders/:id
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const { customerName, customerEmail, items, notes, isActive } = req.body;

    if (customerName !== undefined) order.customerName = String(customerName).trim();
    if (customerEmail !== undefined) order.customerEmail = String(customerEmail).trim();
    if (notes !== undefined) order.notes = String(notes).trim();
    if (isActive !== undefined) order.isActive = Boolean(isActive);

    if (items !== undefined && Array.isArray(items)) {
      order.items = items.map((item) => ({
        product: item.product || undefined,
        name: item.name || "",
        size: item.size || "",
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
        total: (Number(item.quantity) || 1) * (Number(item.price) || 0),
      }));
      order.totalAmount = order.items.reduce((sum, item) => sum + item.total, 0);
    }

    await order.save();
    res.json({ success: true, order: sanitizeOrder(order) });
  } catch (error) {
    console.error("Update order error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// DELETE /api/orders/:id
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete order error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// PATCH /api/orders/:id/status
export const toggleOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.isActive = !order.isActive;
    await order.save();
    res.json({ success: true, order: sanitizeOrder(order) });
  } catch (error) {
    console.error("Toggle order status error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// PATCH /api/orders/:id/verify-payment
export const verifyPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.paymentStatus !== "submitted") {
      return res.status(400).json({ success: false, message: "No payment proof to verify" });
    }
    order.paymentStatus = "verified";
    if (order.orderStatus === "pending_payment") {
      order.orderStatus = "processing";
    }
    order.statusHistory.push({
      status: "payment_verified",
      changedAt: new Date(),
      changedBy: String(req.user._id),
    });
    await order.save();
    res.json({ success: true, order: sanitizeOrder(order) });
  } catch (error) {
    console.error("Verify payment error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// PATCH /api/orders/:id/reject-payment
export const rejectPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.paymentStatus !== "submitted") {
      return res.status(400).json({ success: false, message: "No payment proof to reject" });
    }
    order.paymentStatus = "rejected";
    order.statusHistory.push({
      status: "payment_rejected",
      changedAt: new Date(),
      changedBy: String(req.user._id),
    });
    await order.save();
    res.json({ success: true, order: sanitizeOrder(order) });
  } catch (error) {
    console.error("Reject payment error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// PATCH /api/orders/:id/order-status
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    const { orderStatus } = req.body;
    const validStatuses = ["pending_payment", "processing", "dispatched", "delivered", "cancelled"];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: "Invalid order status" });
    }
    // Enforce: cannot move to processing/dispatched/delivered without verified payment
    if (["processing", "dispatched", "delivered"].includes(orderStatus) && order.paymentStatus !== "verified") {
      return res.status(400).json({ success: false, message: "Payment must be verified before changing to this status" });
    }
    // Enforce: cannot cancel after dispatched
    if (orderStatus === "cancelled" && ["dispatched", "delivered"].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: "Cannot cancel after dispatch" });
    }
    order.orderStatus = orderStatus;
    if (orderStatus === "cancelled") order.isActive = false;
    else order.isActive = true;
    order.statusHistory.push({
      status: orderStatus,
      changedAt: new Date(),
      changedBy: String(req.user._id),
    });
    await order.save();
    res.json({ success: true, order: sanitizeOrder(order) });
  } catch (error) {
    console.error("Update order status error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/orders/stats
export const getOrderStats = async (req, res) => {
  try {
    const [totalOrders, activeOrders, totalRevenue] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ isActive: true }),
      Order.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        activeOrders,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      },
    });
  } catch (error) {
    console.error("Get order stats error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};
