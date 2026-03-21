import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { firebaseUid, email, name, role, phone, restaurantName, ngoName } = req.body;
    const existing = await User.findOne({ firebaseUid });
    if (existing) return res.json({ user: existing });
    const user = await User.create({ firebaseUid, email, name, role, phone, restaurantName, ngoName });
    res.status(201).json({ user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
    res.json({ user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
