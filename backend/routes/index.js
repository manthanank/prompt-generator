import express from 'express';
import authRoutes from './auth.js';
import contentRoutes from './content.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mount route modules with specific prefixes
router.use('/auth', authRoutes);
router.use('/api', contentRoutes);

export default router;
