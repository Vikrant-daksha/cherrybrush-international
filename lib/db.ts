import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.warn("⚠️ MONGO_URI is not defined in environment variables.");
}

/**
 * Global cache to prevent multiple connections in Next.js development (Hot Reloading).
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

// ── Eager Connection: Trigger DB connection immediately when module is loaded on server ──
if (MONGO_URI && !cached.promise) {
  cached.promise = mongoose
    .connect(MONGO_URI, { bufferCommands: false })
    .then((mongooseInstance) => {
      console.log("✅ MongoDB Eagerly Connected Successfully");
      cached.conn = mongooseInstance;
      return mongooseInstance;
    })
    .catch((err) => {
      cached.promise = null;
      console.error("❌ Eager MongoDB connection error:", err);
      throw err;
    });
}

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI environment variable is missing");
    }
    cached.promise = mongoose
      .connect(MONGO_URI, { bufferCommands: false })
      .then((mongooseInstance) => {
        console.log("✅ MongoDB Connected Successfully");
        cached.conn = mongooseInstance;
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }

  return cached.conn;
};

export const mongoDB = connectDB;
