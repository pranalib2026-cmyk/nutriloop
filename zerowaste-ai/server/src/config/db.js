import mongoose from 'mongoose';

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
  setTimeout(connectDB, 3000);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅  MongoDB reconnected');
});

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌  MONGODB_URI is not set in server/.env');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log('✅  MongoDB connected:', mongoose.connection.host);
  } catch (err) {
    console.error('❌  MongoDB connection failed:', err.message);
    console.log('    Retrying in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};
