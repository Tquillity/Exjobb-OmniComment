// backend/src/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import routes from './routes/index.js';

dotenv.config();

// MongoDB debugging
mongoose.set('debug', true); // Enable mongoose debug mode

// Create the Express app
const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: 'chrome-extension://*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Accept'],
}));

// Middleware setup...
app.use(helmet());
app.use(express.json());

// MongoDB connection with better error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    // Log the current database name
    console.log('Database:', mongoose.connection.name);
    // Log collections
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
    console.error('Connection string used:', process.env.MONGODB_URI.replace(/:([^:@]{8})[^:@]*@/, ':****@'));
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

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});