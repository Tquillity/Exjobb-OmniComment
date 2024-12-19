// backend/src/routes/users.js
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = Router();

// Register user with optional fields
router.post('/register', [
  body('walletAddress').isLength({ min: 42, max: 42 }),
  body('username').optional().trim().isLength({ min: 2, max: 50 }),
  body('age').optional().isInt({ min: 13, max: 120 }),
  body('nationality').optional().trim().isLength({ max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { walletAddress, username, age, nationality } = req.body;
    console.log('Registration attempt:', { walletAddress, username, age, nationality });

    let user = await User.findOne({ walletAddress });
    
    if (!user) {
      user = new User({
        walletAddress,
        username,
        age,
        nationality
      });
      await user.save();
    } else {
      // Update existing user with any new information
      if (username) user.username = username;
      if (age) user.age = age;
      if (nationality) user.nationality = nationality;
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user by wallet address
router.get('/:walletAddress', async (req, res) => {
  try {
    const walletAddress = req.params.walletAddress;
    console.log('GET request for wallet:', walletAddress);
    
    const user = await User.findOne({ 
      walletAddress: walletAddress
    });
    
    console.log('GET request result:', user);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        requestedAddress: walletAddress 
      });
    }
    
    res.json(user);
  } catch (error) {
    console.error('GET request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/:walletAddress', [
  body('username').optional().trim().isLength({ min: 2, max: 50 }),
  body('age').optional().isInt({ min: 13, max: 120 }),
  body('nationality').optional().trim().isLength({ max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, age, nationality } = req.body;
    const walletAddress = req.params.walletAddress;

    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username !== undefined) user.username = username;
    if (age !== undefined) user.age = age;
    if (nationality !== undefined) user.nationality = nationality;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:walletAddress/settings', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { settings } = req.body;

    // Validate settings structure
    if (!settings || !settings.comments) {
      return res.status(400).json({ 
        error: 'Invalid settings format. Expected settings.comments object.' 
      });
    }

    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update only the settings field
    user.settings = settings;
    await user.save();

    res.json({ settings: user.settings });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;