// backend/src/routes/users.js
import { Router } from 'express';
import User from '../models/User.js';

const router = Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    console.log('Registration attempt - Wallet Address:', walletAddress);

    let user = await User.findOne({ walletAddress });
    console.log('Existing user check result:', user);
    
    if (!user) {
      console.log('Creating new user...');
      user = new User({ walletAddress });
      const savedUser = await user.save();
      console.log('New user saved:', savedUser);
    } else {
      console.log('User already exists');
    }
    
    res.json(user);
  } catch (error) {
    console.error('Registration error details:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user by wallet address
router.get('/:walletAddress', async (req, res) => {
  try {
    const walletAddress = req.params.walletAddress.toLowerCase();
    console.log('GET request for wallet:', walletAddress);
    
    const user = await User.findOne({ 
      walletAddress: { $regex: new RegExp(walletAddress, 'i') }
    });
    
    console.log('GET request result:', user);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    res.json(user);
  } catch (error) {
    console.error('GET request error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;