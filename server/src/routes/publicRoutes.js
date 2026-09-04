import { Router } from "express";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Blog from "../models/Blog.js";
import BankDetails from "../models/BankDetails.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";
import { calculateDeliveryCharge, getPublicDeliverySettings } from "../controllers/deliverySettingsController.js";
import { createOrderNotification, createAdminNotification, createUserNotification } from "../controllers/notificationController.js";

const router = Router();

// ─── PUBLIC SETTINGS ──────────────────────────────────────

// GET /api/store/settings/delivery — public delivery charges for checkout
router.get("/settings/delivery", async (req, res) => {
  try {
    const settings = await getPublicDeliverySettings();
    res.json({ success: true, deliverySettings: settings });
  } catch (error) {
    console.error("Get public delivery settings error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// GET /api/store/settings/bank-details — public bank details for checkout
router.get("/settings/bank-details", async (req, res) => {
  try {
    const bankDoc = await BankDetails.findOne().lean();
    res.json({
      success: true,
      bankDetails: bankDoc
        ? { accountTitle: bankDoc.accountTitle, bankName: bankDoc.bankName, accountNumber: bankDoc.accountNumber, iban: bankDoc.iban }
        : null,
    });
  } catch (error) {
    console.error("Get public bank details error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── PRODUCTS ──────────────────────────────────────────────

router.get("/products", async (req, res) => {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Product.countDocuments(filter),
    ]);
    res.json({
      success: true,
      products: products.map((p) => ({
        id: p._id, name: p.name, description: p.description, category: p.category,
        subCategory: p.subCategory, sizes: p.sizes, price: p.price,
        discountedPrice: p.discountedPrice, images: p.images, isActive: p.isActive, createdAt: p.createdAt,
      })),
      total, page: Number(page), pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error("Get store products error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({
      success: true,
      product: {
        id: product._id, name: product.name, description: product.description,
        category: product.category, subCategory: product.subCategory, sizes: product.sizes,
        price: product.price, discountedPrice: product.discountedPrice, images: product.images,
        isActive: product.isActive, createdAt: product.createdAt,
      },
    });
  } catch (error) {
    console.error("Get store product error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── ORDERS ────────────────────────────────────────────────

// Generate order number: DT-XXXXX
async function generateOrderNumber() {
  const count = await Order.countDocuments();
  const num = 10001 + count;
  return `DT-${num}`;
}

// POST /api/store/orders — create order (auth required)
router.post("/orders", authMiddleware, async (req, res) => {
  try {
    const { items, customerName, customerEmail, notes, city, paymentMethod } = req.body;

    // Validate payment method
    const allowedMethods = ["manual_transfer"];
    const selectedMethod = allowedMethods.includes(paymentMethod) ? paymentMethod : "manual_transfer";

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items in order" });
    }

    // Validate and recalculate using actual product data from DB
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId).lean();
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} not found or unavailable`,
        });
      }
      const price = product.discountedPrice ?? product.price ?? 0;
      const qty = Number(item.quantity) || 1;
      orderItems.push({
        product: product._id, name: product.name, size: item.size || "",
        quantity: qty, price, total: price * qty,
      });
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);

    // Calculate delivery charge server-side
    const deliveryCharge = await calculateDeliveryCharge(city || "");
    const totalAmount = subtotal + deliveryCharge;

    // Snapshot current bank details
    const bankDoc = await BankDetails.findOne().lean();
    const bankSnapshot = bankDoc
      ? { accountTitle: bankDoc.accountTitle, bankName: bankDoc.bankName, accountNumber: bankDoc.accountNumber, iban: bankDoc.iban }
      : { accountTitle: "", bankName: "", accountNumber: "", iban: "" };

    const orderNumber = await generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      customerName: customerName || `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || req.user.username || "",
      customerEmail: customerEmail || req.user.email || "",
      items: orderItems,
      subtotal,
      deliveryCharge,
      totalAmount,
      city: (city || "").trim(),
      paymentMethod: selectedMethod,
      notes: notes || "",
      bankDetails: bankSnapshot,
      paymentStatus: "pending",
      orderStatus: "pending_payment",
      statusHistory: [{ status: "pending_payment", changedAt: new Date(), changedBy: "system" }],
    });

    console.log(`[Order] Order created: ${order._id}`);

    // Create admin notification (fire-and-forget, don't block response)
    createOrderNotification(order, req.user).catch((err) => {
      console.error("[Notification] Failed to create notification:", err.message);
    });

    res.status(201).json({ success: true, order: sanitizeOrder(order) });
  } catch (error) {
    console.error("Create store order error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});

// GET /api/store/orders/mine — user's own orders (auth required, with filtering)
router.get("/orders/mine", authMiddleware, async (req, res) => {
  try {
    const { orderId, orderStatus, paymentStatus, fromDate, toDate, isDeleted } = req.query;

    // ALWAYS scope to authenticated user — never trust frontend userId
    const filter = { customer: req.user._id };

    // Soft delete filter: by default exclude deleted orders
    if (isDeleted !== undefined) {
      filter.isDeleted = isDeleted === "true";
    } else {
      filter.isDeleted = { $ne: true };
    }

    // Order ID search
    if (orderId && orderId.trim()) {
      filter.orderNumber = { $regex: orderId.trim(), $options: "i" };
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

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    res.json({
      success: true,
      orders: orders.map((o) => ({
        id: o._id, orderNumber: o.orderNumber, customerName: o.customerName,
        items: o.items, subtotal: o.subtotal, deliveryCharge: o.deliveryCharge,
        totalAmount: o.totalAmount, paymentStatus: o.paymentStatus,
        orderStatus: o.orderStatus, isDeleted: o.isDeleted || false,
        deletedAt: o.deletedAt || null, createdAt: o.createdAt,
      })),
      total: orders.length,
    });
  } catch (error) {
    console.error("Get user orders error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// GET /api/store/orders/:id — single order (auth required, owner or admin)
router.get("/orders/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    // Only owner or admin can view
    const isOwner = String(order.customer) === String(req.user._id);
    const isAdmin = req.user.isAdmin;
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    res.json({ success: true, order: sanitizeOrder(order) });
  } catch (error) {
    console.error("Get order error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// POST /api/store/orders/:id/payment-proof — upload payment screenshot (auth required, owner only)
router.post("/orders/:id/payment-proof", authMiddleware, upload.single("screenshot"), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Only owner can submit proof
    if (String(order.customer) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Cannot submit if already verified or cancelled
    if (order.paymentStatus === "verified") {
      return res.status(400).json({ success: false, message: "Payment already verified" });
    }
    if (order.orderStatus === "cancelled") {
      return res.status(400).json({ success: false, message: "Order is cancelled" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided" });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "datatowel/payments", resource_type: "image", format: "webp", quality: "auto" },
        (error, result) => {
          if (error) return reject(error);
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );
      stream.end(req.file.buffer);
    });

    // Remove old proof from Cloudinary if exists
    if (order.paymentProof?.imagePublicId) {
      try { await cloudinary.uploader.destroy(order.paymentProof.imagePublicId); } catch {}
    }

    order.paymentProof = {
      imageUrl: uploadResult.url,
      imagePublicId: uploadResult.publicId,
      submittedAt: new Date(),
    };
    order.paymentStatus = "submitted";
    order.statusHistory.push({ status: "payment_submitted", changedAt: new Date(), changedBy: String(req.user._id) });

    await order.save();

    // Notify admin of payment screenshot upload
    createAdminNotification({
      type: "payment_screenshot_uploaded",
      title: "Payment Screenshot Received",
      message: `A customer has uploaded a payment screenshot for order ${order.orderNumber || order._id}.`,
      userId: req.user._id,
      orderId: order._id,
      link: `/admin/orders/${order._id}`,
    }).catch(() => {});

    res.json({ success: true, order: sanitizeOrder(order) });
  } catch (error) {
    console.error("Upload payment proof error:", error.message);
    res.status(500).json({ success: false, message: "Failed to upload payment proof." });
  }
});

// POST /api/store/orders/:id/cancel — cancel order (auth required, owner only)
router.post("/orders/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (String(order.customer) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    // Can only cancel before dispatched
    if (["dispatched", "delivered", "cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: "Order cannot be cancelled at this stage" });
    }
    const { reason } = req.body;
    const cancelReason = reason ? String(reason).trim() : "";
    if (!cancelReason) {
      return res.status(400).json({ success: false, message: "Cancellation reason is required" });
    }
    order.orderStatus = "cancelled";
    order.isActive = false;
    order.cancellationReason = cancelReason;
    order.statusHistory.push({ status: "cancelled", changedAt: new Date(), changedBy: String(req.user._id) });
    await order.save();

    // Notify admin of order cancellation
    const adminMessage = cancelReason
      ? `A customer has cancelled order ${order.orderNumber || order._id}. Reason: ${cancelReason}`
      : `A customer has cancelled order ${order.orderNumber || order._id}.`;
    createAdminNotification({
      type: "order_cancelled",
      title: "Order Cancelled",
      message: adminMessage,
      userId: req.user._id,
      orderId: order._id,
      reason: cancelReason,
      link: `/admin/orders/${order._id}`,
    }).catch(() => {});

    res.json({ success: true, order: sanitizeOrder(order) });
  } catch (error) {
    console.error("Cancel order error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// POST /api/store/orders/:id/restore — restore order from trash (auth required, owner only)
router.post("/orders/:id/restore", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (String(order.customer) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    order.isDeleted = false;
    order.deletedAt = null;
    order.deletedBy = "";
    await order.save();
    res.json({ success: true, order: sanitizeOrder(order) });
  } catch (error) {
    console.error("Restore order error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── BLOGS ─────────────────────────────────────────────────

router.get("/blogs", async (req, res) => {
  try {
    const { category, page = 1, limit = 50 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    const skip = (Number(page) - 1) * Number(limit);
    const [blogs, total] = await Promise.all([
      Blog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Blog.countDocuments(filter),
    ]);
    res.json({
      success: true,
      blogs: blogs.map((b) => ({
        id: b._id, title: b.title, excerpt: b.excerpt, category: b.category,
        images: b.images, createdAt: b.createdAt,
      })),
      total,
    });
  } catch (error) {
    console.error("Get public blogs error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.get("/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog || !blog.isActive) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    res.json({
      success: true,
      blog: {
        id: blog._id, title: blog.title, excerpt: blog.excerpt, content: blog.content,
        category: blog.category, images: blog.images, createdAt: blog.createdAt,
      },
    });
  } catch (error) {
    console.error("Get public blog error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── HELPERS ───────────────────────────────────────────────

function sanitizeOrder(order) {
  return {
    id: order._id, orderNumber: order.orderNumber, customer: order.customer,
    customerName: order.customerName, customerEmail: order.customerEmail,
    items: order.items, subtotal: order.subtotal, deliveryCharge: order.deliveryCharge,
    totalAmount: order.totalAmount, city: order.city, paymentMethod: order.paymentMethod,
    notes: order.notes,
    paymentStatus: order.paymentStatus, paymentProof: order.paymentProof,
    bankDetails: order.bankDetails, orderStatus: order.orderStatus,
    cancellationReason: order.cancellationReason || "",
    paymentRejectionReason: order.paymentRejectionReason || "",
    statusHistory: order.statusHistory, isActive: order.isActive,
    createdAt: order.createdAt, updatedAt: order.updatedAt,
  };
}

export default router;
