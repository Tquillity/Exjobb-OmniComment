// Backend/src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: [true, 'Wallet address is required'],
    unique: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address format'],
    index: true
  },
  username: {
    type: String,
    trim: true,
    maxLength: 50,
    default: null,
    sparse: true,
    validate: {
      validator: function(v) {
        // Only validate if username is being set
        if (!v) return true;
        return /^[a-zA-Z0-9_-]{3,50}$/.test(v);
      },
      message: 'Username can only contain letters, numbers, underscores and dashes'
    }
  },
  password: {
    type: String,
    select: false,
    validate: {
      validator: function(password) {
        // Only validate if password is being set
        if (!password) return true;
        return (
          password.length >= 8 &&
          /[A-Z]/.test(password) &&
          /[a-z]/.test(password) &&
          /[0-9]/.test(password) &&
          /[!@#$%^&*(),.?":{}|<>]/.test(password)
        );
      },
      message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number and special characters'
    }
  },
  hasSetPassword: {
    type: Boolean,
    default: false
  },
  displayPreference: {
    type: String,
    enum: ['username', 'wallet'],
    default: 'wallet'
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
  bookmarkedComments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
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

// Index for username uniqueness (only if username is set)
userSchema.index({ username: 1 }, { 
  unique: true,
  partialFilterExpression: { username: { $type: "string" } }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified or is new
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    if (this.password) this.hasSetPassword = true;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // If no password is set, always return false
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to safely return user data without sensitive fields
userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);