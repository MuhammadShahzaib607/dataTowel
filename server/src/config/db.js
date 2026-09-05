import mongoose from "mongoose";

let cached = null;

const connectDB = async () => {
  // Reuse existing connection in serverless environments (Vercel)
  // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  if (cached && mongoose.connection.readyState === 1) {
    return cached;
  }

  // Don't open a new connection if one is already connecting
  if (mongoose.connection.readyState === 2) {
    return cached;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    const msg = "MONGODB_URI environment variable is not set. Please configure your MongoDB connection string.";
    console.error("[DB]", msg);
    throw new Error(msg);
  }

  try {
    const conn = await mongoose.connect(uri);
    cached = conn;
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // Log a safe error message — never print the URI or credentials
    const safeMessage = error.message || String(error);
    console.error(`[DB] MongoDB connection failed: ${safeMessage}`);
    // Reset cached so next invocation retries
    cached = null;
    throw error;
  }
};

export default connectDB;