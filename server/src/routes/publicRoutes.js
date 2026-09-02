import { Router } from "express";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Blog from "../models/Blog.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// GET /api/store/products — public, active products only
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
        id: p._id,
        name: p.name,
        description: p.description,
        category: p.category,
        subCategory: p.subCategory,
        sizes: p.sizes,
        price: p.price,
        discountedPrice: p.discountedPrice,
        images: p.images,
        isActive: p.isActive,
        createdAt: p.createdAt,
      })),
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error("Get store products error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// GET /api/store/products/:id — public, single product
router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({
      success: true,
      product: {
        id: product._id,
        name: product.name,
        description: product.description,
        category: product.category,
        subCategory: product.subCategory,
        sizes: product.sizes,
        price: product.price,
        discountedPrice: product.discountedPrice,
        images: product.images,
        isActive: product.isActive,
        createdAt: product.createdAt,
      },
    });
  } catch (error) {
    console.error("Get store product error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// POST /api/store/orders — requires user auth
router.post("/orders", authMiddleware, async (req, res) => {
  try {
    const { items, customerName, customerEmail, notes } = req.body;

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
        product: product._id,
        name: product.name,
        size: item.size || "",
        quantity: qty,
        price,
        total: price * qty,
      });
    }

    const totalAmount = orderItems.reduce((sum, item) => sum + item.total, 0);

    const order = await Order.create({
      customer: req.user._id,
      customerName: customerName || req.user.firstName
        ? `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim()
        : req.user.username || "",
      customerEmail: customerEmail || req.user.email || "",
      items: orderItems,
      totalAmount,
      notes: notes || "",
    });

    res.status(201).json({
      success: true,
      order: {
        id: order._id,
        customer: order.customer,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: order.items,
        totalAmount: order.totalAmount,
        notes: order.notes,
        isActive: order.isActive,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("Create store order error:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});

// GET /api/store/blogs — public, active blogs
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
        id: b._id,
        title: b.title,
        excerpt: b.excerpt,
        category: b.category,
        images: b.images,
        createdAt: b.createdAt,
      })),
      total,
    });
  } catch (error) {
    console.error("Get public blogs error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// GET /api/store/blogs/:id — public, single active blog
router.get("/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog || !blog.isActive) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    res.json({
      success: true,
      blog: {
        id: blog._id,
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        category: blog.category,
        images: blog.images,
        createdAt: blog.createdAt,
      },
    });
  } catch (error) {
    console.error("Get public blog error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

export default router;
