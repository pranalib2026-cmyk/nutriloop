import 'dotenv/config';
import admin from '../src/config/firebase.js';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ MongoDB connected');

const users = [
  {
    email: 'restaurant1@demo.com',
    password: 'Demo@1234',
    role: 'restaurant',
    name: 'Spice Garden',
    restaurantName: 'Spice Garden Restaurant',
    city: 'Mumbai',
    location: { type: 'Point', coordinates: [72.8777, 19.0760] }
  },
  {
    email: 'ngo1@demo.com',
    password: 'Demo@1234',
    role: 'ngo',
    name: 'Feeding Hope',
    ngoName: 'Feeding Hope Foundation',
    city: 'Mumbai',
    location: { type: 'Point', coordinates: [72.8650, 19.0700] }
  },
  {
    email: 'admin@zerowaste.ai',
    password: 'Admin@1234',
    role: 'admin',
    name: 'Admin',
    city: 'Mumbai',
    location: { type: 'Point', coordinates: [72.8777, 19.0760] }
  }
];

for (const u of users) {
  try {
    let fbUser;
    try {
      fbUser = await admin.auth().getUserByEmail(u.email);
      console.log(`ℹ️  Firebase user already exists: ${u.email}`);
    } catch {
      fbUser = await admin.auth().createUser({ email: u.email, password: u.password });
      console.log(`✅ Created Firebase user: ${u.email}`);
    }
    const exists = await User.findOne({ firebaseUid: fbUser.uid });
    if (!exists) {
      await User.create({ ...u, firebaseUid: fbUser.uid });
      console.log(`✅ Created MongoDB user: ${u.email}`);
    } else {
      console.log(`ℹ️  MongoDB user already exists: ${u.email}`);
    }
  } catch (err) {
    console.error(`❌ Failed for ${u.email}:`, err.message);
  }
}

await mongoose.disconnect();
console.log('✅ All demo users created!');
process.exit(0);
