const FoodListing = require('../models/FoodListing');
const User = require('../models/User');
const { haversineDistanceKm } = require('../utils/haversine');

const getNearbyFood = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10, limit = 20 } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });

    const listings = await FoodListing.find({
      status: 'pending',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000
        }
      }
    }).populate('restaurantId', 'name profilePhoto cuisineType phone').limit(parseInt(limit));
    
    const enriched = listings
      .filter(l => !l.isExpired)
      .map(l => {
        const obj = l.toObject();
        obj.distance_km = Math.round(haversineDistanceKm(parseFloat(lat), parseFloat(lng), obj.location.coordinates[1], obj.location.coordinates[0]) * 100) / 100;
        return obj;
    });

    enriched.sort((a, b) => b.isUrgent - a.isUrgent || a.distance_km - b.distance_km);

    res.json({ listings: enriched });
  } catch (error) {
    next(error);
  }
};

const getNearbyNGOs = async (req, res, next) => {
  try {
    const listing = await FoodListing.findById(req.params.listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    const ngos = await User.find({
      role: 'ngo',
      isActive: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [listing.location.coordinates[0], listing.location.coordinates[1]] },
          $maxDistance: 10000
        }
      }
    });

    const enriched = ngos.map(n => {
      const obj = n.toObject();
      obj.distance_km = Math.round(haversineDistanceKm(listing.location.coordinates[1], listing.location.coordinates[0], obj.location.coordinates[1], obj.location.coordinates[0]) * 100) / 100;
      return obj;
    });

    res.json({ ngos: enriched });
  } catch (error) {
    next(error);
  }
};

const suggestMatch = async (req, res, next) => {
  try {
    const { listingId } = req.body;
    const listing = await FoodListing.findById(listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    
    const ngos = await User.find({
      role: 'ngo',
      isActive: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [listing.location.coordinates[0], listing.location.coordinates[1]] },
          $maxDistance: 10000 
        }
      }
    });

    const enriched = ngos.map(n => {
      const obj = n.toObject();
      const dist = haversineDistanceKm(listing.location.coordinates[1], listing.location.coordinates[0], obj.location.coordinates[1], obj.location.coordinates[0]);
      obj.distance_km = Math.round(dist * 100) / 100;
      obj.matchScore = (obj.servingCapacity || 50) / (dist + 1);
      return obj;
    });

    enriched.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ suggestedNGOs: enriched });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNearbyFood, getNearbyNGOs, suggestMatch };
