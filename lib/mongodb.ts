import mongoose from 'mongoose';

// Resolve MongoDB URI with sensible fallbacks and ignore unresolved Vercel secret refs
function resolveMongoUri(): string {
  // Highest priority: custom project var that won't collide with Vercel secrets
  const custom = process.env.MARAKSH_MONGODB_URI;
  if (custom && custom.trim()) return custom.trim();

  // Next: standard var if it's a real value (not a Vercel secret reference like "@mongodb_uri")
  const std = process.env.MONGODB_URI;
  if (std && std.trim() && !std.trim().startsWith('@')) return std.trim();

  // Fallback: hardcoded Atlas URI (user-provided)
  return 'mongodb+srv://eslamabdaltif:oneone2@cluster0marakshv2.ltf0bnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0marakshv2';
}

const MONGODB_URI = resolveMongoUri();

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
