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
      enum: ['light', 'dark'],
      default: 'light'
    },
    commentPopup: {
      type: String,
      enum: ['sidebar', 'overlay', 'minimal'],
      default: 'sidebar'
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);