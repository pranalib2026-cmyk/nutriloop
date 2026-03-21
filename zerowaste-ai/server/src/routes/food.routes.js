import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import FoodListing from '../models/FoodListing.js';

const router = express.Router();

router.post('/', authenticate, requireRole('restaurant'), async (req, res) => {
  try {
    const {
      title, category, quantity, unit, description,
      pickupAddress, expiresAt, pickupWindow, location
    } = req.body;

    if (!title || !category || !quantity || !pickupAddress || !expiresAt) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, category, quantity, pickupAddress, expiresAt' 
      });
    }

    const listing = await FoodListing.create({
      restaurantId: req.user._id,
      title,
      category: category.toLowerCase(),
      quantity: Number(quantity),
      unit: (unit || 'servings').toLowerCase(),
      description: description || '',
      pickupAddress,
      expiresAt: new Date(expiresAt),
      pickupWindow: pickupWindow || {},
      location: location || { type: 'Point', coordinates: [72.8777, 19.0760] },
      status: 'pending',
      isUrgent: new Date(expiresAt) < new Date(Date.now() + 2 * 60 * 60 * 1000)
    });

    console.log('✅ New food listing created:', listing._id, listing.title);
    res.status(201).json({ listing });
  } catch (err) {
    console.error('Create listing error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category && category !== 'all') filter.category = category;
    
    const listings = await FoodListing.find(filter)
      .populate('restaurantId', 'name restaurantName profilePhoto phone cuisineType')
      .sort({ expiresAt: 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    
    const total = await FoodListing.countDocuments(filter);
    res.json({ listings, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my/listings', authenticate, requireRole('restaurant'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { restaurantId: req.user._id };
    if (status) filter.status = status;
    const listings = await FoodListing.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await FoodListing.countDocuments(filter);
    res.json({ listings, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const listing = await FoodListing.findById(req.params.id).populate('restaurantId', 'name profilePhoto cuisineType phone restaurantName');
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json({ listing });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, requireRole('restaurant'), async (req, res) => {
  try {
    const listing = await FoodListing.findOneAndUpdate({ _id: req.params.id, restaurantId: req.user._id }, req.body, { new: true });
    if (!listing) return res.status(404).json({ error: 'Not found or unauthorized' });
    res.json({ listing });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    await FoodListing.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    res.json({ message: 'Listing cancelled' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
