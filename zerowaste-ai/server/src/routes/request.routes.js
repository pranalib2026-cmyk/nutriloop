import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import Request from '../models/Request.js';
import FoodListing from '../models/FoodListing.js';

const router = express.Router();

router.post('/', authenticate, requireRole('ngo'), async (req, res) => {
  try {
    const { foodListingId, quantityRequested, notes } = req.body;
    
    if (!foodListingId) {
      return res.status(400).json({ error: 'foodListingId is required' });
    }

    // Atomic lock — only succeeds if status is still 'pending'
    const listing = await FoodListing.findOneAndUpdate(
      { _id: foodListingId, status: 'pending' },
      { 
        status: 'accepted', 
        acceptedBy: req.user._id, 
        acceptedAt: new Date() 
      },
      { new: true }
    );

    if (!listing) {
      return res.status(409).json({ 
        error: 'This listing has already been accepted by another NGO' 
      });
    }

    const request = await Request.create({
      foodListingId,
      ngoId: req.user._id,
      restaurantId: listing.restaurantId,
      quantityRequested: quantityRequested || listing.quantity,
      notes: notes || '',
      status: 'accepted',
      acceptedAt: new Date()
    });

    const populated = await Request.findById(request._id)
      .populate('foodListingId')
      .populate('ngoId', 'name ngoName')
      .populate('restaurantId', 'name restaurantName');

    res.status(201).json({ request: populated });
  } catch (err) {
    console.error('Request creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', authenticate, async (req, res) => {
  try {
    const filter = req.user.role === 'ngo' ? { ngoId: req.user._id } : { restaurantId: req.user._id };
    const requests = await Request.find(filter).populate('foodListingId').populate('ngoId', 'name ngoName').populate('restaurantId', 'name restaurantName').sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status, quantityReceived } = req.body;
    const update = { status };
    if (status === 'completed') {
      update.completedAt = new Date();
      update.quantityReceived = quantityReceived;
      update.mealsDelivered = (quantityReceived || 0) * 2.5;
      await FoodListing.findOneAndUpdate({ _id: (await Request.findById(req.params.id)).foodListingId }, { status: 'completed', completedAt: new Date() });
    }
    const request = await Request.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ request });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
