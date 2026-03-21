const User = require('../models/User');

const register = async (req, res, next) => {
  try {
    const { firebaseUid, email, name, role, phone, restaurantName, ngoName } = req.body;
    
    const newUser = new User({
      firebaseUid, email, name, role, phone,
      restaurantName: role === 'restaurant' ? restaurantName : undefined,
      ngoName: role === 'ngo' ? ngoName : undefined
    });
    
    await newUser.save();
    return res.status(201).json({ user: newUser, message: 'User registered successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'User already exists' });
    }
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    const user = await User.findOneAndUpdate({ firebaseUid: req.user.uid }, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, getProfile, updateProfile };
