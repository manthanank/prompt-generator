import express from 'express';
import authRoutes from './auth.js';
import contentRoutes from './content.js';

const router = express.Router();

// Root endpoint (empty path)
router.get('/', (req, res) => {
  res.json({
    message: 'Prompt Generator API',
    version: process.env.npm_package_version || '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    documentation: {
      health: 'GET /health - Server health check',
      status: 'GET /api/status - Detailed API status',
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        profile: 'GET /auth/profile'
      },
      content: {
        generate: 'POST /api/generate-content',
        anonymousStatus: 'GET /api/anonymous-status',
        checkFreePrompt: 'GET /api/check-free-prompt'
      }
    }
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API status endpoint with detailed information
router.get('/api/status', (req, res) => {
  const status = {
    status: 'running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        profile: 'GET /auth/profile'
      },
      content: {
        generate: 'POST /api/generate-content',
        anonymousStatus: 'GET /api/anonymous-status',
        checkFreePrompt: 'GET /api/check-free-prompt'
      },
      health: {
        status: 'GET /health',
        apiStatus: 'GET /api/status'
      }
    },
    database: {
      status: 'connected' // This would be dynamic in a real implementation
    }
  };

  res.json(status);
});

// Mount route modules with specific prefixes
router.use('/auth', authRoutes);
router.use('/api', contentRoutes);

export default router;
