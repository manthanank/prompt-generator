import jwt from 'jsonwebtoken';
import { AuthService } from '../services/authService.js';
import { ContentService } from '../services/contentService.js';

// Generate AI content - STRICTLY ONE PROMPT ONLY for anonymous users
export const generateContent = async (req, res) => {
  try {
    const { userPrompt } = req.body;
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Authenticated user - unlimited access
      try {
        const user = await AuthService.verifyToken(token);
        const result = await ContentService.generateContentForUser(user._id, userPrompt);
        res.json(result);
      } catch (jwtError) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    } else {
      // Anonymous user - STRICTLY ONE PROMPT ONLY
      const sessionId = req.sessionId;

      try {
        const result = await ContentService.generateContentForAnonymous(sessionId, userPrompt, req);
        res.json(result);
      } catch (error) {
        if (error.message.includes('Anonymous users can only generate 1 prompt')) {
          return res.status(429).json({
            error: error.message,
            userType: 'anonymous',
            requiresLogin: true,
            message: 'You have already used your free prompt. Please register or login for unlimited access.'
          });
        }
        throw error;
      }
    }
  } catch (error) {
    console.error('Generate content error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Check if anonymous user has used their free prompt
export const checkFreePromptUsed = async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await ContentService.checkFreePromptUsed(sessionId, ipAddress);
    res.json(result);
  } catch (error) {
    console.error('Check free prompt error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get anonymous user status
export const getAnonymousStatus = async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    const result = await ContentService.getAnonymousStatus(sessionId);
    res.json(result);
  } catch (error) {
    console.error('Anonymous status error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Clear all sessions (for testing)
export const clearSessions = async (req, res) => {
  try {
    const result = await ContentService.clearAllSessions();
    res.json(result);
  } catch (error) {
    console.error('Clear sessions error:', error);
    res.status(500).json({ error: error.message });
  }
};
