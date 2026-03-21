import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import FoodListing from '../models/FoodListing.js';

const router = express.Router();

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

router.get('/nearby-food', authenticate, requireRole('ngo'), async (req, res) => {
  try {
    const { lat, lng, radius = 10, limit = 20 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' });
    const listings = await FoodListing.find({ status: 'pending', expiresAt: { $gt: new Date() } })
      .populate('restaurantId', 'name profilePhoto cuisineType phone restaurantName')
      .limit(100);
    const withDistance = listings
      .map(l => ({ ...l.toObject(), distance_km: haversine(Number(lat), Number(lng), l.location.coordinates[1], l.location.coordinates[0]) }))
      .filter(l => l.distance_km <= Number(radius))
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, Number(limit));
    res.json({ listings: withDistance });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
