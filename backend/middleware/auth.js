import { AuthService } from '../services/authService.js';

// Authentication middleware
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = await AuthService.verifyToken(token);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Session tracking middleware for anonymous users
export const trackAnonymousSession = (req, res, next) => {
  if (!req.headers.authorization) {
    // Use the session ID from frontend if provided, otherwise generate one
    const frontendSessionId = req.headers['x-session-id'];
    if (frontendSessionId) {
      req.sessionId = frontendSessionId;
    } else {
      req.sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  next();
};
