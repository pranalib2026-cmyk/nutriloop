import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole }  from '../middleware/requireRole.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/stats', async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const FoodListing = (await import('../models/FoodListing.js')).default;
    const Request = (await import('../models/Request.js')).default;

    const [
      totalUsers,
      totalListings,
      pendingListings,
      completedRequests,
      recentListings
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      FoodListing.countDocuments(),
      FoodListing.countDocuments({ status: 'pending' }),
      Request.countDocuments({ status: 'completed' }),
      FoodListing.find()
        .populate('restaurantId', 'name restaurantName')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const mealResult = await Request.aggregate([
      { $match: { status: 'completed', mealsDelivered: { $ne: null } } },
      { $group: { _id: null, total: { $sum: '$mealsDelivered' } } }
    ]);
    const totalMealsSaved = mealResult[0]?.total || 0;

    res.json({
      totalUsers,
      totalListings,
      pendingListings,
      completedRequests,
      totalMealsSaved,
      recentListings
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (role) filter.role = role;
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const users = await User.find(filter).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await User.countDocuments(filter);
    res.json({ users, total, page: Number(page) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/users/:id/verify', async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: req.body.isVerified }, { new: true });
    res.json({ user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'User deactivated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
