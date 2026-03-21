const Request = require('../models/Request');
const FoodListing = require('../models/FoodListing');
const { sendSMS } = require('../utils/notifier');

const createRequest = async (req, res, next) => {
  try {
    const { foodListingId, quantityRequested, notes } = req.body;
    const ngoId = req.userProfile._id;
    
    const listing = await FoodListing.findOneAndUpdate(
      { _id: foodListingId, status: 'pending' },
      { status: 'accepted', acceptedBy: ngoId, acceptedAt: new Date() },
      { new: true }
    ).populate('restaurantId');
    
    if (!listing) return res.status(409).json({ message: 'Listing is no longer pending or already accepted' });

    const newRequest = new Request({
      foodListingId, ngoId,
      restaurantId: listing.restaurantId._id,
      quantityRequested, notes,
      status: 'accepted'
    });
    
    await newRequest.save();

    if (listing.restaurantId.phone) {
      sendSMS(listing.restaurantId.phone, `Your food listing "${listing.title}" was accepted by ${req.userProfile.name}.`);
    }

    res.status(201).json({ request: newRequest });
  } catch (error) {
    next(error);
  }
};

const getMyRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const condition = {};
    if (status) condition.status = status;
    if (req.userProfile.role === 'ngo') {
      condition.ngoId = req.userProfile._id;
    } else {
      condition.restaurantId = req.userProfile._id;
    }

    const total = await Request.countDocuments(condition);
    const requests = await Request.find(condition)
      .populate('foodListingId', 'title quantity category pickupAddress pickupWindow images status expiresAt')
      .populate('ngoId', 'name ngoName phone profilePhoto')
      .populate('restaurantId', 'name restaurantName phone profilePhoto')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ requests, total, page: parseInt(page) });
  } catch (error) {
    next(error);
  }
};

const getRequestById = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('foodListingId')
      .populate('ngoId', 'name ngoName phone')
      .populate('restaurantId', 'name restaurantName phone');
      
    if (!request) return res.status(404).json({ message: 'Not found' });
    
    res.json({ request });
  } catch (error) {
    next(error);
  }
};

const updateRequestStatus = async (req, res, next) => {
  try {
    const { status, quantityReceived, notes } = req.body;
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Not found' });

    const role = req.userProfile.role;
    
    if (role === 'ngo') {
      if (status === 'cancelled' && request.status !== 'completed') {
        const listing = await FoodListing.findById(request.foodListingId);
        if (listing) {
          listing.status = 'pending';
          listing.acceptedBy = null;
          listing.acceptedAt = null;
          await listing.save();
        }
      }
    } else if (role === 'restaurant') {
      if (status === 'completed' && (request.status === 'in_transit' || request.status === 'accepted')) {
        request.quantityReceived = quantityReceived || request.quantityRequested;
        request.mealsDelivered = request.quantityReceived * 2.5; 
        request.completedAt = new Date();
        
        const listing = await FoodListing.findById(request.foodListingId);
        if (listing) {
          listing.status = 'completed';
          listing.completedAt = new Date();
          await listing.save();
        }
      }
    }

    if (['accepted', 'in_transit', 'completed', 'cancelled'].includes(status)) {
        request.status = status;
    }
    if (notes) request.notes = notes;
    await request.save();

    res.json({ request });
  } catch (error) {
    next(error);
  }
};

const cancelRequest = async (req, res, next) => {
  try {
    const request = await Request.findOne({ _id: req.params.id, ngoId: req.userProfile._id });
    if (!request) return res.status(404).json({ message: 'Not found or unauthorized' });
    
    request.status = 'cancelled';
    await request.save();

    const listing = await FoodListing.findById(request.foodListingId);
    if (listing) {
      listing.status = 'pending';
      listing.acceptedBy = null;
      listing.acceptedAt = null;
      await listing.save();
    }
    
    res.json({ message: 'Request cancelled' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRequest, getMyRequests, getRequestById, updateRequestStatus, cancelRequest };
