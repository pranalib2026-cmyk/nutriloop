import mongoose from 'mongoose';

const FoodListingSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:        { type: String, required: true, trim: true },
  description:  { type: String },
  category:     { type: String, enum: ['cooked','raw','packaged','bakery','beverages','other'], required: true },
  quantity:     { type: Number, required: true, min: 1 },
  unit:         { type: String, enum: ['servings','kg','litres','boxes'], default: 'servings' },
  images:       [{ type: String }],
  preparedAt:   { type: Date, default: Date.now },
  expiresAt:    { type: Date, required: true },
  pickupAddress:{ type: String, required: true },
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  pickupWindow: { start: String, end: String },
  status:       { type: String, enum: ['pending','accepted','completed','expired','cancelled'], default: 'pending' },
  acceptedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  acceptedAt:   { type: Date, default: null },
  completedAt:  { type: Date, default: null },
  mealsDelivered:{ type: Number, default: null },
  isUrgent:     { type: Boolean, default: false },
}, { timestamps: true });

FoodListingSchema.index({ location: '2dsphere' });
FoodListingSchema.index({ status: 1, expiresAt: 1 });

export default mongoose.model('FoodListing', FoodListingSchema);
