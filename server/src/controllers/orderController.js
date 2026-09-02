import Order from "../models/Order.js";

function sanitizeOrder(order) {
  return {
    id: order._id,
    orderNumber: order.orderNumber,
    customer: order.customer,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    items: order.items,
    subtotal: order.subtotal,
    deliveryCharge: order.deliveryCharge,
    totalAmount: order.totalAmount,
    city: order.city,
    paymentMethod: order.paymentMethod,
    notes: order.notes,
    paymentStatus: order.paymentStatus,
    paymentProof: order.paymentProof,
    bankDetails: order.bankDetails,
    orderStatus: order.orderStatus,
    statusHistory: order.statusHistory,
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
    const {
      isActive, search, orderId, customerName, customerEmail,
      customerPhone, orderStatus, paymentStatus,
      fromDate, toDate, minAmount, maxAmount,
    } = req.query;
    const filter = {};

    if (isActive !== undefined) filter.isActive = isActive === "true";

    // Order ID search (orderNumber field)
    if (orderId && orderId.trim()) {
      filter.orderNumber = { $regex: orderId.trim(), $options: "i" };
    }

    // Customer name search
    if (customerName && customerName.trim()) {
      filter.customerName = { $regex: customerName.trim(), $options: "i" };
    }

    // Customer email search
    if (customerEmail && customerEmail.trim()) {
      filter.customerEmail = { $regex: customerEmail.trim(), $options: "i" };
    }

    // Customer phone search (phone is on the user model, not on order — search via populated customer)
    // We handle this after the initial query if needed

    // Legacy search parameter (searches name + email)
    if (search && search.trim()) {
      filter.$or = [
        { customerName: { $regex: search.trim(), $options: "i" } },
        { customerEmail: { $regex: search.trim(), $options: "i" } },
        { orderNumber: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // Order status filter
    if (orderStatus && orderStatus.trim() && orderStatus !== "all") {
      filter.orderStatus = orderStatus.trim();
    }

    // Payment status filter
    if (paymentStatus && paymentStatus.trim() && paymentStatus !== "all") {
      filter.paymentStatus = paymentStatus.trim();
    }

    // Date range filter
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = from;
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = to;
      }
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      filter.totalAmount = {};
      if (minAmount) filter.totalAmount.$gte = Number(minAmount);
      if (maxAmount) filter.totalAmount.$lte = Number(maxAmount);
    }

    // Limit support for overview compact view
    const limit = req.query.limit ? Math.min(Number(req.query.limit), 100) : 0;

    let query = Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("customer", "username email phone")
      .lean();

    if (limit > 0) query = query.limit(limit);

    const orders = await query;

    // If customerPhone filter was requested, do a post-query filter
    // since phone is on the User model
    let filteredOrders = orders;
    if (customerPhone && customerPhone.trim()) {
      const phoneRegex = new RegExp(customerPhone.trim(), "i");
      filteredOrders = orders.filter((o) =>
        o.customer && phoneRegex.test(o.customer.phone || "")
      );
    }

    res.json({
      success: true,
      orders: filteredOrders.map((o) => ({ ...o, id: o._id })),
      total: filteredOrders.length,
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
    const [totalOrders, activeOrders, deliveredRevenueResult, latestOrders] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ isActive: true }),
      Order.aggregate([
        { $match: { orderStatus: "delivered" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate("customer", "username email")
        .lean(),
    ]);

    const deliveredRevenue = deliveredRevenueResult.length > 0 ? deliveredRevenueResult[0].total : 0;

    res.json({
      success: true,
      stats: {
        totalOrders,
        activeOrders,
        deliveredRevenue,
        latestOrders: latestOrders.map((o) => ({ ...o, id: o._id })),
      },
    });
  } catch (error) {
    console.error("Get order stats error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};
