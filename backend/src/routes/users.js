// backend/src/routes/users.js
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

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

router.get('/bookmarks', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.user.walletAddress })
      .populate({
        path: 'bookmarkedComments',
        select: '-__v',
        match: { isDeleted: false }
      });
      
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user.bookmarkedComments || []);
  } catch (error) {
    console.error('Fetching bookmarks error:', error);
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
  body('nationality').optional().trim().isLength({ max: 100 }),
  body('displayPreference').optional().isIn(['wallet', 'username'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, age, nationality, displayPreference } = req.body;
    const walletAddress = req.params.walletAddress;

    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username !== undefined) user.username = username;
    if (age !== undefined) user.age = age;
    if (nationality !== undefined) user.nationality = nationality;
    if (displayPreference !== undefined) user.displayPreference = displayPreference;

    await user.save();
    
    console.log('Updated user:', user); // For debugging
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

    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Merge settings properly
    user.settings = {
      ...user.settings,
      ...settings.settings
    };

    await user.save();
    res.json({ settings: user.settings });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Toggle/Set bookmark
router.post('/bookmark', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.body;
    if (!commentId) {
      return res.status(400).json({ error: 'commentId is required' });
    }

    // Grab user from req.user (already populated by verifyToken)
    const user = await User.findOne({ walletAddress: req.user.walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if this is already bookmarked
    const isBookmarked = user.bookmarkedComments.some(
      (bookmarkId) => bookmarkId.toString() === commentId
    );

    if (!isBookmarked) {
      user.bookmarkedComments.push(commentId);
      await user.save();
    }

    return res.json({ message: 'Comment bookmarked successfully' });
  } catch (error) {
    console.error('Bookmark error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove bookmark
router.post('/unbookmark', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.body;
    if (!commentId) {
      return res.status(400).json({ error: 'commentId is required' });
    }

    const user = await User.findOne({ walletAddress: req.user.walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.bookmarkedComments = user.bookmarkedComments.filter(
      (bm) => bm.toString() !== commentId
    );
    await user.save();

    return res.json({ message: 'Comment unbookmarked successfully' });
  } catch (error) {
    console.error('Unbookmark error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;