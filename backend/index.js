import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', routes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on port ${PORT}`);
      console.log('📚 API Endpoints:');
      console.log('🔐 Authentication:');
      console.log('  - POST /auth/register - Register new user');
      console.log('  - POST /auth/login - Login user');
      console.log('  - GET /auth/profile - Get user profile (protected)');
      console.log('🤖 Content Generation:');
      console.log('  - POST /api/generate-content - Generate AI content');
      console.log('  - GET /api/anonymous-status - Check anonymous user status');
      console.log('  - GET /api/check-free-prompt - Check if free prompt used');
      console.log('🧪 Testing:');
      console.log('  - POST /api/clear-sessions - Clear all sessions');
      console.log('💚 Health:');
      console.log('  - GET /health - Server health check');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
