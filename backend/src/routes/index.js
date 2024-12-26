// Backend/src/routes/index.js
import { Router } from 'express';
import commentRoutes from './comments.js';
import userRoutes from './users.js';
import authRoutes from './auth.js';
import blockchainRoutes from './blockchain.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/comments', commentRoutes);
router.use('/users', userRoutes);
router.use('/blockchain', blockchainRoutes);

export default router;