const Request = require('../models/Request');
const User = require('../models/User');
const FoodListing = require('../models/FoodListing');

const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers30d = await User.countDocuments({ updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
    const totalListings = await FoodListing.countDocuments();
    const pendingListings = await FoodListing.countDocuments({ status: 'pending' });
    const completedRequests = await Request.countDocuments({ status: 'completed' });
    
    const requests = await Request.find({ status: 'completed' });
    const totalMealsSaved = requests.reduce((acc, req) => acc + (req.mealsDelivered || 0), 0);
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const newListings = await FoodListing.countDocuments({ createdAt: { $gte: today } });
    const newRequests = await Request.countDocuments({ createdAt: { $gte: today } });
    const completedPickups = await Request.countDocuments({ completedAt: { $gte: today }, status: 'completed' });

    res.json({
      totalMealsSaved,
      totalUsers,
      activeUsers30d,
      totalListings,
      pendingListings,
      completedRequests,
      todayActivity: {
        newListings, newRequests, completedPickups
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { role, isVerified, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ users, total, page: parseInt(page) });
  } catch (error) {
    next(error);
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: req.body.isVerified }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User soft deleted' });
  } catch (error) {
    next(error);
  }
};

const getListings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await FoodListing.countDocuments(query);
    const listings = await FoodListing.find(query)
      .populate('restaurantId', 'name restaurantName')
      .populate('acceptedBy', 'name ngoName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ listings, total, page: parseInt(page) });
  } catch (error) {
    next(error);
  }
};

const getActivity = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    // Activity log: recent requests and listings combined (simplistic approach without dedicated Log model)
    const requests = await Request.find().populate('ngoId', 'name').populate('restaurantId', 'name').sort({ updatedAt: -1 }).limit(parseInt(limit));
    const listings = await FoodListing.find().populate('restaurantId', 'name').sort({ updatedAt: -1 }).limit(parseInt(limit));
    
    let activity = [];
    requests.forEach(r => activity.push({ type: 'request', data: r, time: r.updatedAt }));
    listings.forEach(l => activity.push({ type: 'listing', data: l, time: l.updatedAt }));
    
    activity.sort((a, b) => b.time - a.time);
    activity = activity.slice((page - 1) * limit, page * limit);

    res.json({ activity });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getUsers, verifyUser, deleteUser, getListings, getActivity };
