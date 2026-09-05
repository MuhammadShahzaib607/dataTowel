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
import adminUserRoutes from "./routes/adminUserRoutes.js";
import adminNotificationRoutes from "./routes/adminNotificationRoutes.js";
import userNotificationRoutes from "./routes/userNotificationRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import dns from 'node:dns';

dotenv.config();

// Use public DNS resolvers to fix MongoDB SRV record resolution.
// Some Windows/network configurations fail to resolve _mongodb._tcp SRV
// records using the default system resolver. Google (8.8.8.8) and
// Cloudflare (1.1.1.1) handle SRV queries reliably.
// On Vercel, this is harmless — the platform DNS handles it either way.
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Connect to MongoDB (serverless-safe with connection caching)
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
      if (!origin) {
        callback(null, true);
        return;
      }

      // Allow any localhost origin in development (any port)
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        callback(null, true);
        return;
      }

      // Check against configured allowed origins (for production)
      if (allowedOrigins.includes(origin)) {
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
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/admin/settings", bankDetailsRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/notifications", adminNotificationRoutes);
app.use("/api/notifications", userNotificationRoutes);
app.use("/api/store", publicRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "DataTowel API is running" });
});

app.get("/", ()=> {
  res.json({ success: true, message: "ok" })
})

// Global error handler — catches CORS errors and unhandled exceptions
app.use((err, _req, res, _next) => {
  if (err.message && err.message.startsWith("Not allowed by CORS")) {
    console.error("[CORS] Request blocked:", err.message);
    return res.status(403).json({ success: false, message: "CORS origin not allowed" });
  }
  console.error("[Server] Unhandled error:", err.message || err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// Always start HTTP server for local development.
// On Vercel, the exported app is used as the serverless handler instead.
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 8000;
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

export default app;