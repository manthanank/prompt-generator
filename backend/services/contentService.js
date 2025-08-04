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
  // Create a device fingerprint for better device identification
  static createDeviceFingerprint(sessionId, userAgent, ipAddress) {
    // Extract key browser/device info from user agent
    const browserInfo = userAgent.match(/\(([^)]+)\)/)?.[1] || '';
    const platformInfo = userAgent.match(/(Windows|Mac|Linux|Android|iPhone|iPad)/)?.[1] || '';

    return {
      sessionId,
      browserFingerprint: `${platformInfo}_${browserInfo}`.substring(0, 100),
      ipAddress
    };
  }

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

  // Generate AI content for anonymous user - ONE PROMPT PER DEVICE/SESSION
  static async generateContentForAnonymous(sessionId, userPrompt, req) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';

    // Create a device fingerprint combining session ID, user agent, and IP
    const deviceFingerprint = this.createDeviceFingerprint(sessionId, userAgent, ipAddress);

    // Check if this device fingerprint has already made a request in the last 24 hours
    const existingSession = await AnonymousSession.findOne({
      sessionId: sessionId, // Primary check by session ID (device-specific)
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    if (existingSession) {
      throw new Error('Anonymous users can only generate 1 prompt per device per day. Please register/login for unlimited access.');
    }

    // Create new anonymous session (store by session ID, device fingerprint, and IP for tracking)
    const anonymousSession = new AnonymousSession({
      sessionId,
      prompt: userPrompt,
      ipAddress: ipAddress,
      userAgent: userAgent,
      deviceFingerprint: deviceFingerprint.browserFingerprint
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
    // If no session ID provided, can't check device-specific status
    if (!sessionId) {
      return {
        hasUsedFreePrompt: false,
        userType: 'anonymous',
        remainingPrompts: 1,
        message: 'You have 1 free prompt remaining for this device today'
      };
    }

    // Check if this session or similar device has used their free prompt in the last 24 hours
    const existingSession = await AnonymousSession.findOne({
      sessionId: sessionId, // Primary check by session ID (device-specific)
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    return {
      hasUsedFreePrompt: !!existingSession,
      userType: 'anonymous',
      remainingPrompts: existingSession ? 0 : 1,
      message: existingSession
        ? 'You have used your free prompt for this device today. Try again tomorrow or register/login for unlimited access!'
        : 'You have 1 free prompt remaining for this device today'
    };
  }

  // Check if anonymous user has used their free prompt
  static async checkFreePromptUsed(sessionId, ipAddress) {
    // Check by session ID (primary) and IP address as fallback (last 24 hours)
    const existingSession = await AnonymousSession.findOne({
      sessionId: sessionId, // Primary check by session ID (device-specific)
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const hasUsedFreePrompt = !!existingSession;

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
