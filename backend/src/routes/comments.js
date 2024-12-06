// backend/src/routes/comments.js
import { Router } from 'express';
import Comment from '../models/Comment.js';
import { body, validationResult } from 'express-validator';

const router = Router();

router.get('/test', async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json({
      message: 'Database connection successful',
      count: comments.length,
      comments: comments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get comments from a URL
router.get('/', async (req,res) => {
  try {
    const { url } = req.query;
    const comments = await Comment.find({
      url,
      isDeleted:false
    }).sort('-createdAt');
    res.json(comments);
  }catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new comment
router.post('/',
  body('content').trim().isLength({ min: 1 }),
  body('url').isURL(),
  body('walletAddress').isLength({ min: 42, max: 42 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const comment = new Comment(req.body);
      await comment.save();
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;