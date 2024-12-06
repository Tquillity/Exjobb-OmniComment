// backend/src/models/Comment.js
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  walletAddress: {
    type: String,
    required: true,
    index: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  likes: [{
    type: String // wallet addresses
  }],
  dislikes: [{
    type: String // wallet addresses
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Comment', commentSchema);