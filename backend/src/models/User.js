// backend/src/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
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
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);