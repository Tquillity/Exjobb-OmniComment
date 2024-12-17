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
router.get('/', async (req, res) => {
  try {
    const { url } = req.query;
    const comments = await Comment.find({
      url,
      isDeleted: false
    }).sort('-createdAt');
    res.json(comments);
  } catch (error) {
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

// Fetch all comments for Main Comment Board
router.get('/all', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ isDeleted: false })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('walletAddress', 'username');

    const total = await Comment.countDocuments({ isDeleted: false });

    res.json({
      comments,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalComments: total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trending URLs
router.get('/trending', async (req, res) => {
  try {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    
    const trendingUrls = await Comment.aggregate([
      {
        $match: {
          createdAt: { $gte: sixHoursAgo },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$url',
          count: { $sum: 1 },
          lastComment: { $max: '$createdAt' }
        }
      },
      {
        $sort: { count: -1, lastComment: -1 }
      },
      {
        $limit: 20
      },
      {
        $project: {
          url: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json(trendingUrls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch user specific comments
router.get('/user/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { type } = req.query; // 'created', 'interactions', or 'bookmarked'
    
    let query = { isDeleted: false };
    
    switch (type) {
      case 'created':
        query.walletAddress = walletAddress;
        break;
      case 'interactions':
        query.$or = [
          { 'likes': walletAddress },
          { 'dislikes': walletAddress }
        ];
        break;
      case 'bookmarked':
        // ! To be implemented when bookmarking feature is added
        break;
      default:
        query.walletAddress = walletAddress;
    }

    const comments = await Comment.find(query)
      .sort('-createdAt')
      .populate('walletAddress', 'username');

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;