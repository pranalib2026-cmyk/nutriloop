require('dotenv').config({ path: '../server/.env' });
const mongoose = require('mongoose');
const User = require('../server/src/models/User');
const FoodListing = require('../server/src/models/FoodListing');
const Request = require('../server/src/models/Request');
const admin = require('../server/src/config/firebase');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zerowaste-ai');
    console.log('MongoDB Connected');

    await User.deleteMany({});
    await FoodListing.deleteMany({});
    await Request.deleteMany({});

    console.log('Cleared existing data.');

    const usersToCreate = [
      {
        name: "Spice Garden Restaurant",
        email: "restaurant1@demo.com",
        password: "Demo@1234",
        role: "restaurant",
        restaurantName: "Spice Garden",
        cuisineType: "Indian",
        city: "Mumbai",
        location: { coordinates: [72.8777, 19.0760] }
      },
      {
        name: "Fresh Bakes Café",
        email: "restaurant2@demo.com",
        password: "Demo@1234",
        role: "restaurant",
        restaurantName: "Fresh Bakes Café",
        cuisineType: "bakery",
        city: "Mumbai",
        location: { coordinates: [72.8856, 19.0821] }
      },
      {
        name: "Feeding Hope Foundation",
        email: "ngo1@demo.com",
        password: "Demo@1234",
        role: "ngo",
        ngoName: "Feeding Hope Foundation",
        servingCapacity: 200,
        city: "Mumbai",
        location: { coordinates: [72.8650, 19.0700] }
      },
      {
        name: "AnnaDaan Trust",
        email: "ngo2@demo.com",
        password: "Demo@1234",
        role: "ngo",
        ngoName: "AnnaDaan Trust",
        servingCapacity: 150,
        city: "Mumbai",
        location: { coordinates: [72.8900, 19.0680] }
      },
      {
        name: "Admin",
        email: "admin@zerowaste.ai",
        password: "Admin@1234",
        role: "admin"
      }
    ];

    const createdUsers = [];

    for (const u of usersToCreate) {
      let firebaseUid = `mock-uid-${Date.now()}-${Math.random()}`;
      try {
        if (process.env.FIREBASE_PROJECT_ID) {
            let fbUser;
            try {
                fbUser = await admin.auth().getUserByEmail(u.email);
                await admin.auth().updateUser(fbUser.uid, { password: u.password });
            } catch(e) {
                fbUser = await admin.auth().createUser({
                    email: u.email,
                    password: u.password,
                    displayName: u.name
                });
            }
            firebaseUid = fbUser.uid;
        }
      } catch (err) {
        console.log(`Firebase auth creation failed for ${u.email}, using mock UID. Ensure firebase is configured if you want real auth.`);
      }

      const mongoUser = new User({
        firebaseUid,
        email: u.email,
        name: u.name,
        role: u.role,
        restaurantName: u.restaurantName,
        cuisineType: u.cuisineType,
        ngoName: u.ngoName,
        servingCapacity: u.servingCapacity,
        city: u.city,
        location: u.location,
        isVerified: true
      });
      await mongoUser.save();
      createdUsers.push(mongoUser);
      console.log(`Created user: ${u.email}`);
    }

    const res1 = createdUsers.find(u => u.email === 'restaurant1@demo.com');
    const res2 = createdUsers.find(u => u.email === 'restaurant2@demo.com');
    const ngo1 = createdUsers.find(u => u.email === 'ngo1@demo.com');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const listings = [
      {
        restaurantId: res1._id,
        title: "Leftover Veg Biryani",
        category: "cooked",
        quantity: 40,
        unit: "servings",
        expiresAt: tomorrow,
        pickupAddress: "123 Spice St, Mumbai",
        location: res1.location,
        status: "pending"
      },
      {
        restaurantId: res2._id,
        title: "Assorted Breads",
        category: "bakery",
        quantity: 20,
        unit: "boxes",
        expiresAt: tomorrow,
        pickupAddress: "45 Bakery Ln, Mumbai",
        location: res2.location,
        status: "pending"
      },
      {
        restaurantId: res1._id,
        title: "Dal Makhani",
        category: "cooked",
        quantity: 30,
        unit: "servings",
        expiresAt: tomorrow,
        pickupAddress: "123 Spice St, Mumbai",
        location: res1.location,
        status: "accepted",
        acceptedBy: ngo1._id,
        acceptedAt: new Date()
      },
      {
        restaurantId: res2._id,
        title: "Yesterday's Pastries",
        category: "bakery",
        quantity: 10,
        unit: "boxes",
        expiresAt: yesterday,
        pickupAddress: "45 Bakery Ln, Mumbai",
        location: res2.location,
        status: "expired"
      },
      {
        restaurantId: res1._id,
        title: "Rice & Curry Combo",
        category: "cooked",
        quantity: 100,
        unit: "servings",
        expiresAt: yesterday,
        pickupAddress: "123 Spice St, Mumbai",
        location: res1.location,
        status: "completed",
        acceptedBy: ngo1._id,
        completedAt: new Date()
      }
    ];

    const createdListings = await FoodListing.insertMany(listings);
    console.log(`Created ${createdListings.length} Food Listings`);

    const acceptedListing = createdListings.find(l => l.status === 'accepted');
    const completedListing = createdListings.find(l => l.status === 'completed');

    await Request.create({
      foodListingId: acceptedListing._id,
      ngoId: ngo1._id,
      restaurantId: res1._id,
      quantityRequested: 30,
      status: 'accepted'
    });

    await Request.create({
      foodListingId: completedListing._id,
      ngoId: ngo1._id,
      restaurantId: res1._id,
      quantityRequested: 100,
      quantityReceived: 100,
      mealsDelivered: 100,
      status: 'completed',
      completedAt: new Date()
    });

    console.log('Created Requests');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
