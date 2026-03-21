import mongoose from 'mongoose';
import admin from '../server/src/config/firebase.js';
import User from '../server/src/models/User.js';
import dotenv from 'dotenv';
// Running from root or server, robust approach:
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const usersToCreate = [
  { email: "restaurant1@demo.com", password: "Demo@1234", role: "restaurant", name: "Spice Garden", restaurantName: "Spice Garden", cuisineType: "Indian" },
  { email: "ngo1@demo.com", password: "Demo@1234", role: "ngo", name: "Feeding Hope Foundation", ngoName: "Feeding Hope Foundation" },
  { email: "admin@zerowaste.ai", password: "Admin@1234", role: "admin", name: "Admin" }
];

const createDemoUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zerowaste-ai');
    console.log('✅ MongoDB connected');

    for (const u of usersToCreate) {
      let firebaseUid;
      try {
        let fbUser;
        try {
          fbUser = await admin.auth().getUserByEmail(u.email);
          await admin.auth().updateUser(fbUser.uid, { password: u.password });
        } catch(e) {
          fbUser = await admin.auth().createUser({ email: u.email, password: u.password, displayName: u.name });
        }
        firebaseUid = fbUser.uid;
        console.log(`✅ Firebase User created/verified: ${u.email}`);
      } catch (err) {
        console.error(`Firebase auth failed for ${u.email}:`, err.message);
        continue;
      }

      const existingMongoUser = await User.findOne({ email: u.email });
      if (!existingMongoUser) {
        await User.create({
          firebaseUid,
          email: u.email,
          name: u.name,
          role: u.role,
          restaurantName: u.restaurantName,
          ngoName: u.ngoName,
          cuisineType: u.cuisineType,
          isVerified: true,
          location: { type: 'Point', coordinates: [72.8777, 19.0760] }
        });
        console.log(`✅ MongoDB User created: ${u.email}`);
      } else {
        existingMongoUser.firebaseUid = firebaseUid;
        existingMongoUser.role = u.role;
        await existingMongoUser.save();
        console.log(`✅ MongoDB User updated: ${u.email}`);
      }
    }
    console.log('✅ All Demo Users Ready!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createDemoUsers();
