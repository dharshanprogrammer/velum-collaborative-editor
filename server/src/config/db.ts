import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cowrite';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[DB] Connected successfully to MongoDB:', uri);
    return true;
  } catch (err: any) {
    console.error('[DB] MongoDB connection warning:', err.message);
    console.log('[DB] Running in-memory / hybrid recovery mode for document storage.');
    return false;
  }
}
