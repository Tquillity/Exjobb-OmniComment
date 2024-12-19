// backend/src/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    trim: true,
    maxLength: 50,
    default: null
  },
  age: {
    type: Number,
    min: 13,
    max: 120,
    default: null
  },
  nationality: {
    type: String,
    trim: true,
    maxLength: 100,
    default: null
  },
  subscription: {
    type: {
      type: String,
      enum: ['none', 'basic', 'premium'],
      default: 'none'
    },
    expiresAt: Date
  },
  reputation: {
    type: Number,
    default: 0
  },
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    commentPopup: {
      type: String,
      enum: ['sidebar', 'overlay', 'minimal'],
      default: 'sidebar'
    },
    comments: {
      sortOrder: {
        type: String,
        enum: ['newest', 'oldest', 'mostLiked', 'mostDiscussed'],
        default: 'newest'
      },
      threadDepth: {
        type: Number,
        min: 3,
        max: 8,
        default: 5
      },
      autoExpand: {
        type: Boolean,
        default: true
      },
      showPreview: {
        type: Boolean,
        default: true
      },
      richTextEnabled: {
        type: Boolean,
        default: true
      },
      collapseThreads: {
        type: Boolean,
        default: false
      },
      showTimestamp: {
        type: String,
        enum: ['relative', 'absolute', 'both'],
        default: 'relative'
      }
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);