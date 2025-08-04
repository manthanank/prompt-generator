import { GoogleGenAI } from '@google/genai';
import User from '../models/User.js';
import AnonymousSession from '../models/AnonymousSession.js';

// Initialize AI with API key, or use a mock for testing
let ai;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here') {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} else {
  console.log('⚠️  GEMINI_API_KEY not set. Using mock responses for testing.');
  ai = null;
}

export class ContentService {
  // Generate AI content for authenticated user
  static async generateContentForUser(userId, userPrompt) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Invalid user');
    }

    if (!ai) {
      // Mock response for testing
      return {
        text: `Mock response for: ${userPrompt}`,
        userType: 'authenticated',
        username: user.username
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
    });

    return {
      text: response.text,
      userType: 'authenticated',
      username: user.username
    };
  }

  // Generate AI content for anonymous user - STRICTLY ONE PROMPT ONLY
  static async generateContentForAnonymous(sessionId, userPrompt, req) {
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Check if this session has already made a request
    const existingSession = await AnonymousSession.findOne({ sessionId });
    if (existingSession) {
      throw new Error('Anonymous users can only generate 1 prompt. Please register/login for unlimited access.');
    }

    // Additional check: prevent multiple requests from same IP within short time
    const recentSessionFromIP = await AnonymousSession.findOne({
      ipAddress,
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    if (recentSessionFromIP) {
      throw new Error('Anonymous users can only generate 1 prompt per IP address. Please register/login for unlimited access.');
    }

    // Create new anonymous session
    const anonymousSession = new AnonymousSession({
      sessionId,
      prompt: userPrompt,
      ipAddress: ipAddress,
      userAgent: req.get('User-Agent')
    });
    await anonymousSession.save();

    if (!ai) {
      // Mock response for testing
      return {
        text: `Mock response for: ${userPrompt}`,
        userType: 'anonymous',
        remainingPrompts: 0,
        message: 'This was your free prompt. Register/login for unlimited access!'
      };
    }

    // Generate content
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
    });

    return {
      text: response.text,
      userType: 'anonymous',
      remainingPrompts: 0,
      message: 'This was your free prompt. Register/login for unlimited access!'
    };
  }

  // Get anonymous user status
  static async getAnonymousStatus(sessionId) {
    if (!sessionId) {
      return {
        hasUsedFreePrompt: false,
        userType: 'anonymous',
        remainingPrompts: 1,
        message: 'You have 1 free prompt remaining'
      };
    }

    const existingSession = await AnonymousSession.findOne({ sessionId });

    return {
      hasUsedFreePrompt: !!existingSession,
      userType: 'anonymous',
      remainingPrompts: existingSession ? 0 : 1,
      message: existingSession
        ? 'You have used your free prompt. Register/login for unlimited access!'
        : 'You have 1 free prompt remaining'
    };
  }

  // Check if anonymous user has used their free prompt
  static async checkFreePromptUsed(sessionId, ipAddress) {
    // Check by session ID
    const sessionCheck = sessionId ? await AnonymousSession.findOne({ sessionId }) : null;

    // Check by IP address (last 24 hours)
    const ipCheck = await AnonymousSession.findOne({
      ipAddress,
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const hasUsedFreePrompt = sessionCheck || ipCheck;

    return {
      hasUsedFreePrompt,
      userType: 'anonymous',
      remainingPrompts: hasUsedFreePrompt ? 0 : 1,
      message: hasUsedFreePrompt
        ? 'You have already used your free prompt. Please register or login for unlimited access.'
        : 'You have 1 free prompt remaining'
    };
  }

  // Clear all sessions (for testing)
  static async clearAllSessions() {
    await AnonymousSession.deleteMany({});
    return { message: 'Sessions cleared' };
  }
}
