import { AuthService } from '../services/authService.js';

// Register new user
export const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const result = await AuthService.registerUser({ username, password, email });

    res.status(201).json({
      message: 'User registered successfully',
      ...result
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error.message === 'Username or email already exists') {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await AuthService.loginUser({ username, password });

    res.json({
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    console.error('Login error:', error);

    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userProfile = await AuthService.getUserProfile(req.user._id);
    res.json({ user: userProfile });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: error.message });
  }
};
