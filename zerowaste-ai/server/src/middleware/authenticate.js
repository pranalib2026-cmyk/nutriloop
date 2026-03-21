import admin from '../config/firebase.js';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    console.log('Auth middleware: verifying token for', req.method, req.path);
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Find user in MongoDB using firebaseUid
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found in DB' });
    }

    // Attach user to req
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
  }
};
