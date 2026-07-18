import mongoose from 'mongoose';

// Cache connection in global scope for serverless/cold starts
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('Database connection failed: MONGODB_URI environment variable is missing in project settings.');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    console.log('🔌 Connecting to MongoDB Atlas...');
    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose;
    }).catch((err) => {
      console.error(`❌ MongoDB Connection Error: ${err.message}`);
      cached.promise = null; // Reset promise so we can retry on subsequent requests
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;
