export interface User {
  _id: string;
  username: string;
  email: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ProfileResponse {
  user: User;
}

export interface AnonymousSession {
  sessionId: string;
  prompt: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface GenerateResponse {
  text: string;
  userType: 'authenticated' | 'anonymous';
  username?: string;
  remainingPrompts?: number;
  message?: string;
}

export interface AnonymousStatusResponse {
  hasUsedFreePrompt: boolean;
  userType: 'anonymous';
  remainingPrompts: number;
  message: string;
}

export interface FreePromptCheckResponse {
  hasUsedFreePrompt: boolean;
  userType: 'anonymous';
  remainingPrompts: number;
  message: string;
}
