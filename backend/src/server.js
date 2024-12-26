// Backend/src/server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { rateLimit } from 'express-rate-limit';
import routes from './routes/index.js';
import BlockchainService from './services/blockchainService.js';

// Log the env variables to see which ones are set
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('POLYGON_RPC_URL:', process.env.POLYGON_RPC_URL);
console.log('OMNI_COMMENT_CONTRACT_ADDRESS:', process.env.OMNI_COMMENT_CONTRACT_ADDRESS);

// Verify required environment variables
const requiredEnvVars = [
  'MONGODB_URI', 
  'JWT_SECRET',
  'POLYGON_RPC_URL',
  'OMNI_COMMENT_CONTRACT_ADDRESS'
];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Create a singleton instance
let blockchainServiceInstance = null;

// Initialize blockchain service
async function initializeBlockchainService() {
  try {
    blockchainServiceInstance = await BlockchainService.initialize();
    console.log('Blockchain service initialized!');
    return blockchainServiceInstance;
  } catch (error) {
    console.error('Failed to initialize BlockchainService:', error);
    process.exit(1);
  }
}

// Export the instance getter
export function getBlockchainService() {
  if (!blockchainServiceInstance) {
    throw new Error('BlockchainService not initialized');
  }
  return blockchainServiceInstance;
}

// MongoDB debugging
mongoose.set('debug', true); // Enable mongoose debug mode

// Create the Express app
const app = express();

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',  // Frontend dev server
    'http://localhost:3000',  // Backend server
    /^chrome-extension:\/\/.*$/ // Chrome extensions
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});

// Middleware setup...
app.use(helmet());
app.use(express.json());
app.use(limiter); // Apply rate limiting to all routes

// MongoDB connection with better error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    console.log('Database:', mongoose.connection.name);
    mongoose.connection.db.listCollections().toArray((err, collections) => {
      if (err) {
        console.error('Error listing collections:', err);
      } else {
        console.log('Available collections:', collections.map(c => c.name));
      }
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.error(
      'Connection string used:',
      process.env.MONGODB_URI.replace(/:([^:@]{8})[^:@]*@/, ':****@')
    );
    process.exit(1);
  });

// Monitor MongoDB connection
mongoose.connection.on('error', err => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', routes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err.stack);

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.errors
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'Your session has expired. Please login again.'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong!',
    path: req.path
  });
});

// Initialize before starting server
async function startServer() {
  await initializeBlockchainService();
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Performing graceful shutdown...');
  mongoose.connection.close(false, () => {
    console.log('MongoDb connection closed.');
    process.exit(0);
  });
});