// Validation middleware for common request patterns
export const validateRegistration = (req, res, next) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Username, password, and email are required' });
  }

  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  next();
};

export const validateContentGeneration = (req, res, next) => {
  const { userPrompt } = req.body;

  if (!userPrompt) {
    return res.status(400).json({ error: 'userPrompt is required in the request body.' });
  }

  if (userPrompt.trim().length === 0) {
    return res.status(400).json({ error: 'userPrompt cannot be empty.' });
  }

  next();
};
