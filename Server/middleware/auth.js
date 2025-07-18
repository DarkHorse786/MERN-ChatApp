// auth middleware for protecting routes
import jwt from 'jsonwebtoken';
import userModel from '../models/User.js';

export const protectedRoute = async (req, res, next) => {
  const token = req.cookies.token; // || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.json({ success: false, message: 'Unauthorized access' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    req.user = user; // Attach user to request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: 'Invalid token' });
  }
};
