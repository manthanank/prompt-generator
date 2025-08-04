# Postman Testing Guide for Prompt Generator Backend API

This guide provides comprehensive testing instructions for the Prompt Generator Backend API using Postman.

## 🚀 Quick Start

1. **Import the Collection**: Import `postman_collection.json` into Postman
2. **Set Environment Variables**:
   - `baseUrl`: `http://localhost:3000`
   - `authToken`: (will be auto-populated after login)
   - `sessionId`: `anon_test_session_123` (or any unique session ID)

## 📋 API Endpoints Overview

### Health Check

- **GET** `/health` - Check server status

### Authentication

- **POST** `/auth/register` - Register new user
- **POST** `/auth/login` - Login user
- **GET** `/auth/profile` - Get user profile (protected)

### Content Generation

- **POST** `/api/generate-content` - Generate AI content
- **GET** `/api/anonymous-status` - Check anonymous user status
- **GET** `/api/check-free-prompt` - Check free prompt usage

### Testing & Debug

- **POST** `/api/clear-sessions` - Clear all sessions
- **GET** `/api/test` - Test content routes

## 🧪 Testing Workflows

### 1. Health Check

```bash
GET {{baseUrl}}/health
```

**Expected Response:**

```json
{
  "status": "OK",
  "timestamp": "2025-08-04T13:05:48.911Z"
}
```

### 2. User Authentication Flow

#### Step 1: Register User

```bash
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Response:**

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f8b2c3d4e5f6a7b8c9d0e1",
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

#### Step 2: Login User

```bash
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

**Expected Response:** Same structure as register

#### Step 3: Get User Profile

```bash
GET {{baseUrl}}/auth/profile
Authorization: Bearer {{authToken}}
```

**Expected Response:**

```json
{
  "user": {
    "_id": "64f8b2c3d4e5f6a7b8c9d0e1",
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

### 3. Authenticated Content Generation

#### Generate Content (Authenticated User)

```bash
POST {{baseUrl}}/api/generate-content
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "userPrompt": "Write a creative story about a magical forest"
}
```

**Expected Response:**

```json
{
  "text": "Generated content here...",
  "userType": "authenticated",
  "username": "testuser"
}
```

### 4. Anonymous User Flow

#### Step 1: Check Initial Status

```bash
GET {{baseUrl}}/api/check-free-prompt
X-Session-ID: {{sessionId}}
```

**Expected Response:**

```json
{
  "hasUsedFreePrompt": false,
  "userType": "anonymous",
  "remainingPrompts": 1,
  "message": "You have 1 free prompt remaining"
}
```

#### Step 2: Generate Content (Anonymous)

```bash
POST {{baseUrl}}/api/generate-content
Content-Type: application/json
X-Session-ID: {{sessionId}}

{
  "userPrompt": "Write a short poem about nature"
}
```

**Expected Response (Success):**

```json
{
  "text": "Generated content here...",
  "userType": "anonymous",
  "remainingPrompts": 0,
  "message": "This was your free prompt. Register/login for unlimited access!"
}
```

#### Step 3: Check Status After Generation

```bash
GET {{baseUrl}}/api/check-free-prompt
X-Session-ID: {{sessionId}}
```

**Expected Response:**

```json
{
  "hasUsedFreePrompt": true,
  "userType": "anonymous",
  "remainingPrompts": 0,
  "message": "You have already used your free prompt. Please register or login for unlimited access."
}
```

#### Step 4: Try to Generate Again (Should Fail)

```bash
POST {{baseUrl}}/api/generate-content
Content-Type: application/json
X-Session-ID: {{sessionId}}

{
  "userPrompt": "Write another poem"
}
```

**Expected Response (429 Error):**

```json
{
  "error": "Anonymous users can only generate 1 prompt per IP address. Please register/login for unlimited access.",
  "userType": "anonymous",
  "requiresLogin": true,
  "message": "You have already used your free prompt. Please register or login for unlimited access."
}
```

### 5. Testing & Debug

#### Clear All Sessions

```bash
POST {{baseUrl}}/api/clear-sessions
```

**Expected Response:**

```json
{
  "message": "Sessions cleared"
}
```

#### Test Content Routes

```bash
GET {{baseUrl}}/api/test
```

**Expected Response:**

```json
{
  "message": "Content routes are working"
}
```

## 🔧 Testing Scenarios

### Scenario 1: New Anonymous User

1. Clear sessions
2. Check free prompt status (should show 1 remaining)
3. Generate content (should succeed)
4. Check status again (should show 0 remaining)
5. Try to generate again (should fail with 429)

### Scenario 2: Authenticated User

1. Register new user
2. Login user
3. Generate multiple prompts (should all succeed)
4. Check profile

### Scenario 3: Session Management

1. Use different session IDs
2. Test IP-based restrictions
3. Test session clearing

### Scenario 4: Error Handling

1. Try to register with existing username (should fail)
2. Try to login with wrong password (should fail)
3. Try to access protected route without token (should fail)
4. Try to generate content without proper headers (should fail)

## 📊 Response Status Codes

- **200**: Success
- **201**: Created (user registration)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (invalid credentials)
- **409**: Conflict (username/email already exists)
- **429**: Too Many Requests (anonymous user exceeded limit)
- **500**: Internal Server Error

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend is running on correct port
2. **Authentication Errors**: Check token format and expiration
3. **Session Issues**: Clear sessions and try with new session ID
4. **Rate Limiting**: Anonymous users limited to 1 prompt per session/IP

### Debug Steps

1. Check server health: `GET /health`
2. Verify authentication: `GET /auth/profile`
3. Clear sessions: `POST /api/clear-sessions`
4. Test content routes: `GET /api/test`

## 📝 Notes

- Anonymous sessions are tracked by both session ID and IP address
- Sessions expire after 24 hours automatically
- JWT tokens should be included in Authorization header
- Session IDs should be included in X-Session-ID header
- All timestamps are in ISO 8601 format
- Error responses include detailed messages for debugging
