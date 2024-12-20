// Backend/src/routes/auth.js
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authLimiter, verifyToken } from '../middleware/auth.js';
import { ethers } from 'ethers';

const router = Router();

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { walletAddress: user.walletAddress },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Validate wallet signature
const validateSignature = async (walletAddress, message, signature) => {
  try {
    console.log('Validating signature for:', {
      walletAddress,
      message,
      signature: signature.substring(0, 20) + '...' // Log only start of signature for security
    });
    
    const signerAddress = ethers.verifyMessage(message, signature);
    console.log('Recovered signer address:', signerAddress);
    
    const isValid = signerAddress.toLowerCase() === walletAddress.toLowerCase();
    console.log('Signature validation result:', isValid);
    
    return isValid;
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
};

// Connect wallet and verify ownership
router.post('/connect-wallet', [
  body('walletAddress').matches(/^0x[a-fA-F0-9]{40}$/),
  body('signature').exists(),
  body('message').exists(),
], async (req, res) => {
  try {
    console.log('Received wallet connection request:', {
      ...req.body,
      signature: req.body.signature ? req.body.signature.substring(0, 20) + '...' : undefined
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { walletAddress, signature, message } = req.body;

    // Verify signature
    const isValid = await validateSignature(walletAddress, message, signature);
    if (!isValid) {
      console.log('Invalid signature for wallet:', walletAddress);
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Find or create user
    let user = await User.findOne({ walletAddress });
    if (!user) {
      console.log('Creating new user for wallet:', walletAddress);
      user = new User({ walletAddress });
      await user.save();
    }

    const token = generateToken(user);
    console.log('Successfully authenticated wallet:', walletAddress);
    
    res.json({ 
      token,
      user: user.toSafeObject(),
      requiresPasswordSetup: !user.hasSetPassword
    });
  } catch (error) {
    console.error('Wallet connection error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Setup password and username
router.post('/setup-credentials', [
  verifyToken,
  body('password').isString().isLength({ min: 8 }),
  body('username').optional().isString().isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_-]+$/)
], async (req, res) => {
  try {
    console.log('Received credential setup request for user:', req.user.walletAddress);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { password, username } = req.body;
    const user = await User.findOne({ walletAddress: req.user.walletAddress });

    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        console.log('Username already taken:', username);
        return res.status(400).json({ error: 'Username already taken' });
      }
      user.username = username;
    }

    user.password = password;
    await user.save();
    console.log('Credentials setup successful for:', req.user.walletAddress);

    res.json({ 
      message: 'Credentials setup successful',
      user: user.toSafeObject()
    });
  } catch (error) {
    console.error('Credential setup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login with password
router.post('/login', authLimiter, [
  body('identifier').exists(),
  body('password').exists()
], async (req, res) => {
  try {
    console.log('Received login request for identifier:', req.body.identifier);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, password } = req.body;

    // Find user by wallet address or username
    const user = await User.findOne({
      $or: [
        { walletAddress: identifier },
        { username: identifier }
      ]
    }).select('+password');

    if (!user || !user.hasSetPassword) {
      console.log('Login failed: User not found or password not set');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      console.log('Login failed: Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    console.log('Login successful for:', identifier);
    
    res.json({ 
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update display preference
router.put('/display-preference', verifyToken, [
  body('preference').isIn(['username', 'wallet'])
], async (req, res) => {
  try {
    console.log('Updating display preference for:', req.user.walletAddress);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.user;
    user.displayPreference = req.body.preference;
    await user.save();

    console.log('Display preference updated for:', req.user.walletAddress);
    res.json({ user: user.toSafeObject() });
  } catch (error) {
    console.error('Display preference update error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;