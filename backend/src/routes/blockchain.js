// Backend/src/routes/blockchain.js
import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getBlockchainService } from '../server.js';
import User from '../models/User.js';

const router = Router();

// Get user's blockchain info
router.get('/user-info', verifyToken, async (req, res) => {
  try {
    const blockchainService = getBlockchainService();
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
    const blockchainService = getBlockchainService();
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
    const blockchainService = getBlockchainService();
    
    console.log('Deposit request received:', {
      amount,
      walletAddress: req.user.walletAddress
    });

    // Add request validation
    if (!amount || isNaN(amount) || amount <= 0) {
      console.log('Invalid amount:', amount);
      return res.status(400).json({
        error: 'Invalid amount'
      });
    }

    // First verify the deposit on blockchain
    const verificationResult = await blockchainService.deposit(
      req.user.walletAddress,
      parseFloat(amount)
    );

    if (!verificationResult.success) {
      throw new Error('Blockchain verification failed');
    }

    // Then update the user's balance in MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { walletAddress: req.user.walletAddress },
      { $inc: { depositBalance: parseFloat(amount) } },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    console.log('Updated user balance:', updatedUser.depositBalance);

    res.json({ 
      success: true,
      newBalance: updatedUser.depositBalance,
      blockchainVerification: verificationResult
    });
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
    const blockchainService = getBlockchainService();
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
    const blockchainService = getBlockchainService();
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