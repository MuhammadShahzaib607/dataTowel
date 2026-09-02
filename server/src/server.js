import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import bankDetailsRoutes from "./routes/bankDetailsRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

// Connect to MongoDB
await connectDB();

const app = express();

// Build allowed origins list from CLIENT_URL (comma-separated)
// e.g. CLIENT_URL="http://localhost:3000,https://datatowel.vercel.app"
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

console.log("[CORS] Allowed origins:", allowedOrigins);

// CORS
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("[CORS] Blocked origin:", origin);
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/admin/settings", bankDetailsRoutes);
app.use("/api/store", publicRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

const PORT = process.env.PORT || 5000;

// Global error handler — catches CORS errors and unhandled exceptions
app.use((err, _req, res, _next) => {
  if (err.message && err.message.startsWith("Not allowed by CORS")) {
    console.error("[CORS] Request blocked:", err.message);
    return res.status(403).json({ success: false, message: "CORS origin not allowed" });
  }
  console.error("[Server] Unhandled error:", err.message || err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Server] Allowed origins:`, allowedOrigins);
});
