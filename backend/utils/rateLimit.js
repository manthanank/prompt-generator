import rateLimit from 'express-rate-limit';

// Rate limiting for anonymous users (1 request per session)
export const anonymousRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1, // 1 request per session
  message: { error: 'Anonymous users can only generate 1 prompt. Please register/login for unlimited access.' },
  keyGenerator: (req) => {
    // Use session ID for anonymous users
    return req.sessionId || req.ip;
  }
});
