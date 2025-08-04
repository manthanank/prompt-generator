import express from 'express';
import { generateContent, getAnonymousStatus, clearSessions, checkFreePromptUsed } from '../controllers/contentController.js';
import { trackAnonymousSession } from '../middleware/auth.js';
import { validateContentGeneration } from '../middleware/validation.js';

const router = express.Router();

// Apply session tracking middleware to all content routes
router.use(trackAnonymousSession);

// Test route for debugging
router.get('/test', (req, res) => {
  res.json({ message: 'Content routes are working' });
});

// Content generation routes
router.post('/generate-content', validateContentGeneration, generateContent);
router.get('/anonymous-status', getAnonymousStatus);
router.get('/check-free-prompt', checkFreePromptUsed);

// Testing route (remove in production)
router.post('/clear-sessions', clearSessions);

export default router;
