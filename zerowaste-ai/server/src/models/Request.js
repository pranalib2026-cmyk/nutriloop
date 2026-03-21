import mongoose from 'mongoose';

const RequestSchema = new mongoose.Schema({
  foodListingId:     { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true },
  ngoId:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:            { type: String, enum: ['pending','accepted','in_transit','completed','cancelled'], default: 'pending' },
  quantityRequested: { type: Number, required: true },
  quantityReceived:  { type: Number, default: null },
  requestedAt:       { type: Date, default: Date.now },
  acceptedAt:        { type: Date, default: null },
  completedAt:       { type: Date, default: null },
  mealsDelivered:    { type: Number, default: null },
  notes:             { type: String },
}, { timestamps: true });

export default mongoose.model('Request', RequestSchema);
