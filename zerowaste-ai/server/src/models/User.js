import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firebaseUid:       { type: String, required: true, unique: true },
  email:             { type: String, required: true, unique: true, lowercase: true },
  name:              { type: String, required: true, trim: true },
  role:              { type: String, enum: ['restaurant', 'ngo', 'admin'], required: true },
  phone:             { type: String },
  profilePhoto:      { type: String },
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  address:           { type: String },
  city:              { type: String },
  restaurantName:    { type: String },
  cuisineType:       { type: String },
  operatingHours:    { type: String },
  ngoName:           { type: String },
  registrationNumber:{ type: String },
  servingCapacity:   { type: Number },
  isActive:          { type: Boolean, default: true },
  isVerified:        { type: Boolean, default: false },
}, { timestamps: true });

UserSchema.index({ location: '2dsphere' });

export default mongoose.model('User', UserSchema);
