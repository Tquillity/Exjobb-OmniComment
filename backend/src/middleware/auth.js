// Backend/src/middleware/auth.js
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import User from '../models/User.js';

// Rate limiting for auth attempts
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window per IP
  message: { error: 'Too many login attempts, please try again later.' }
});

// Verify JWT token middleware
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ walletAddress: decoded.walletAddress });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Require password setup middleware
export const requirePasswordSetup = async (req, res, next) => {
  try {
    const user = await User.findOne({ walletAddress: req.user.walletAddress })
                          .select('+password');
    
    if (!user.hasSetPassword) {
      return res.status(403).json({ 
        error: 'Password setup required.',
        requiresPasswordSetup: true 
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};