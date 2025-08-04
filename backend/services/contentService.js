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

  // Generate AI content for anonymous user - ONE PROMPT PER DEVICE/IP
  static async generateContentForAnonymous(sessionId, userPrompt, req) {
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Check if this IP has already made a request in the last 24 hours (one prompt per device/day)
    const existingIPSession = await AnonymousSession.findOne({
      ipAddress,
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    if (existingIPSession) {
      throw new Error('Anonymous users can only generate 1 prompt per device per day. Please register/login for unlimited access.');
    }

    // Create new anonymous session (store by IP and session for tracking)
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
        message: 'This was your free prompt for this device. You can generate another prompt tomorrow or register/login for unlimited access!'
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
      message: 'This was your free prompt for this device. You can generate another prompt tomorrow or register/login for unlimited access!'
    };
  }

  // Get anonymous user status
  static async getAnonymousStatus(sessionId, ipAddress = null) {
    // If no IP provided, can't check device-specific status
    if (!ipAddress) {
      return {
        hasUsedFreePrompt: false,
        userType: 'anonymous',
        remainingPrompts: 1,
        message: 'You have 1 free prompt remaining for this device today'
      };
    }

    // Check if this IP has used their free prompt in the last 24 hours
    const existingIPSession = await AnonymousSession.findOne({
      ipAddress,
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    return {
      hasUsedFreePrompt: !!existingIPSession,
      userType: 'anonymous',
      remainingPrompts: existingIPSession ? 0 : 1,
      message: existingIPSession
        ? 'You have used your free prompt for this device today. Try again tomorrow or register/login for unlimited access!'
        : 'You have 1 free prompt remaining for this device today'
    };
  }

  // Check if anonymous user has used their free prompt
  static async checkFreePromptUsed(sessionId, ipAddress) {
    // Check by IP address (last 24 hours) - device-based limiting
    const ipCheck = await AnonymousSession.findOne({
      ipAddress,
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const hasUsedFreePrompt = !!ipCheck;

    return {
      hasUsedFreePrompt,
      userType: 'anonymous',
      remainingPrompts: hasUsedFreePrompt ? 0 : 1,
      message: hasUsedFreePrompt
        ? 'You have already used your free prompt for this device today. Please try again tomorrow or register/login for unlimited access.'
        : 'You have 1 free prompt remaining for this device today'
    };
  }

  // Clear all sessions (for testing)
  static async clearAllSessions() {
    await AnonymousSession.deleteMany({});
    return { message: 'Sessions cleared' };
  }
}
