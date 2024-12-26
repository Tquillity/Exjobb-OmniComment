// Backend/src/routes/blockchain.js
import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import blockchainService from '../services/blockchainService.js';
import User from '../models/User.js';

const router = Router();

// Get user's blockchain info
router.get('/user-info', verifyToken, async (req, res) => {
  try {
    const { walletAddress } = req.user;
    const blockchainInfo = await blockchainService.getUserInfo(walletAddress);
    res.json(blockchainInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check comment eligibility
router.get('/can-comment', verifyToken, async (req, res) => {
  try {
    const { walletAddress } = req.user;
    const canComment = await blockchainService.canComment(walletAddress);
    res.json({ canComment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/deposit', verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;

    // Add request validation
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount'
      });
    }

    const result = await blockchainService.deposit(
      req.user.walletAddress,
      amount
    );

    // Update user's deposit balance in MongoDB
    await User.findOneAndUpdate(
      { walletAddress: req.user.walletAddress },
      { $inc: { depositBalance: parseFloat(amount) } }
    );

    res.json(result);
  } catch (error) {
    console.error('Deposit endpoint error:', error);
    res.status(500).json({
      error: error.message,
      code: error.code
    });
  }
});

router.post('/purchase-subscription', verifyToken, async (req, res) => {
  try {
    const { duration, referrer } = req.body;
    const result = await blockchainService.purchaseSubscription(
      req.user.walletAddress,
      duration,
      referrer
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/purchase-daily-passes', verifyToken, async (req, res) => {
  try {
    const { count } = req.body;
    const result = await blockchainService.purchaseDailyPasses(
      req.user.walletAddress,
      count
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;