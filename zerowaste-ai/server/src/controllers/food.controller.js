const FoodListing = require('../models/FoodListing');
const axios = require('axios');
const logger = require('../utils/logger');

const createListing = async (req, res, next) => {
  try {
    const listingData = { ...req.body, restaurantId: req.userProfile._id };
    
    if (req.files && req.files.length > 0) {
      listingData.images = req.files.map(file => file.path);
    }
    
    // Auto-calculate isUrgent
    const expiresAt = new Date(listingData.expiresAt);
    const now = new Date();
    const diffHours = (expiresAt - now) / (1000 * 60 * 60);
    listingData.isUrgent = diffHours <= 2;

    const authStoreDate = new Date(); // To allow virtual calculation
    
    const newListing = new FoodListing(listingData);
    await newListing.save();

    // Async call to AI service for demand prediction
    setImmediate(async () => {
      try {
        const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';
        const dayOfWeek = authStoreDate.getDay();
        const month = authStoreDate.getMonth() + 1;
        
        let restType = 'other';
        const rawType = (req.userProfile.cuisineType || '').toLowerCase();
        if (rawType.includes('fast') || rawType.includes('burger')) restType = 'fast_food';
        else if (rawType.includes('fine')) restType = 'fine_dining';
        else if (rawType.includes('buffet')) restType = 'buffet';
        else if (rawType.includes('cafe') || rawType.includes('coffee')) restType = 'cafe';
        else if (rawType.includes('baker')) restType = 'bakery';

        const aiRes = await axios.post(`${aiUrl}/predict`, {
          day_of_week: dayOfWeek,
          month: month,
          restaurant_type: restType,
          is_weekend: [0, 6].includes(dayOfWeek),
          is_holiday: false
        });

        if (aiRes.data && aiRes.data.predicted_quantity) {
          // Calculate score based on demand vs quantity
          const demandVal = aiRes.data.predicted_quantity;
          let score = Math.min(demandVal / listingData.quantity, 1.0);
          newListing.demandScore = score;
          await newListing.save();
        }
      } catch (err) {
        logger.error(`AI Service Prediction failed for ${newListing._id}: ${err.message}`);
      }
    });

    return res.status(201).json({ listing: newListing });
  } catch (error) {
    next(error);
  }
};

const getListings = async (req, res, next) => {
  try {
    const { status, lat, lng, radius = 10, category, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000
        }
      };
    }

    const total = await FoodListing.countDocuments(query);
    const listings = await FoodListing.find(query)
      .populate('restaurantId', 'name profilePhoto address phone')
      .sort(lat && lng ? undefined : { expiresAt: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Calculate distance if coordinates provided and attached
    let enrichedListings = listings;
    if (lat && lng) {
      // Mongoose doesn't easily return the calculated distance from $near unless we use aggregation
      // We will rely on frontend or a subsequent calculation, or map over it.
      const { haversineDistanceKm } = require('../utils/haversine');
      enrichedListings = listings.map(l => {
        const obj = l.toObject();
        obj.distance_km = haversineDistanceKm(parseFloat(lat), parseFloat(lng), obj.location.coordinates[1], obj.location.coordinates[0]);
        return obj;
      });
    }

    res.json({ listings: enrichedListings, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

const getListingById = async (req, res, next) => {
  try {
    const listing = await FoodListing.findById(req.params.id)
      .populate('restaurantId', 'name profilePhoto phone city address')
      .populate('acceptedBy', 'name ngoName phone');
    if (!listing) return res.status(404).json({ message: 'Not found' });
    res.json({ listing });
  } catch (error) {
    next(error);
  }
};

const updateListing = async (req, res, next) => {
  try {
    const listing = await FoodListing.findOne({ _id: req.params.id, restaurantId: req.userProfile._id });
    if (!listing) return res.status(404).json({ message: 'Listing not found or unauthorized' });

    // Only allow specific updates (e.g. status should be managed separately in request)
    const updates = req.body;
    delete updates.status; 
    
    Object.assign(listing, updates);
    await listing.save();
    
    res.json({ listing });
  } catch (error) {
    next(error);
  }
};

const deleteListing = async (req, res, next) => {
  try {
    const condition = req.userProfile.role === 'admin' 
      ? { _id: req.params.id }
      : { _id: req.params.id, restaurantId: req.userProfile._id };

    const listing = await FoodListing.findOneAndUpdate(
      condition, 
      { status: 'cancelled' },
      { new: true }
    );
    
    if (!listing) return res.status(404).json({ message: 'Listing not found or unauthorized' });
    res.json({ message: 'Listing cancelled successfully', listing });
  } catch (error) {
    next(error);
  }
};

const getMyListings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { restaurantId: req.userProfile._id };
    if (status) query.status = status;

    const total = await FoodListing.countDocuments(query);
    const listings = await FoodListing.find(query)
      .populate('acceptedBy', 'name ngoName phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ listings, total, page: parseInt(page) });
  } catch (error) {
    next(error);
  }
};

module.exports = { createListing, getListings, getListingById, updateListing, deleteListing, getMyListings };
