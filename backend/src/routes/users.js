// backend/src/routes/users.js
import { Router } from 'express';
import User from '../models/User.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    let user = await User.findOne({ walletAddress });
    
    if (!user) {
      user = new User({ walletAddress });
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
