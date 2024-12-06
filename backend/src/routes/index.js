// backend/src/routes/index.js
import { Router } from 'express';
import commentRoutes from './comments.js';
import userRoutes from './users.js';

const router = Router();

router.use('/comments', commentRoutes);
router.use('/users', userRoutes);

export default router;