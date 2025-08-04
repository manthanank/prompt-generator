# Backend - Prompt Generator

A well-structured Node.js/Express backend with MongoDB for the Prompt Generator application.

## 🏗️ Architecture

```tree
backend/
├── config/           # Database configuration
├── controllers/      # Request handlers
├── middleware/       # Custom middleware
├── models/          # MongoDB schemas
├── routes/          # API route definitions
├── services/        # Business logic layer
├── utils/           # Utility functions
└── index.js         # Main server file
```

## 🚀 Features

- **🔐 Authentication**: JWT-based user registration and login
- **🤖 AI Integration**: Google Gemini content generation
- **📊 Database**: MongoDB with Mongoose ODM
- **🛡️ Security**: Password hashing, input validation, rate limiting
- **📝 Session Management**: Anonymous user tracking with TTL
- **⚡ Performance**: Optimized queries with indexes
- **🧪 Testing**: Comprehensive error handling and validation
- **🚫 Strict Limits**: Anonymous users limited to exactly 1 prompt before login

## 🛠️ Setup

### Prerequisites

1. **MongoDB**: Install locally or use MongoDB Atlas
2. **Node.js**: Version 16 or higher
3. **Environment Variables**: Create a `.env` file

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (change this in production)
JWT_SECRET=your-secret-key-change-in-production

# MongoDB Connection
MONGODB_URI=your-mongodb-connection-string-here

# Gemini API Key
GEMINI_API_KEY=your-gemini-api-key-here
```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Test authentication
npm run test-auth

# Test one-prompt restriction
node test-one-prompt-restriction.js
```

## 📁 Project Structure

### **Config** (`/config`)

- `database.js` - MongoDB connection configuration

### **Controllers** (`/controllers`)

- `authController.js` - User registration, login, profile
- `contentController.js` - AI content generation and session management

### **Middleware** (`/middleware`)

- `auth.js` - JWT authentication and session tracking
- `validation.js` - Request validation
- `errorHandler.js` - Global error handling

### **Models** (`/models`)

- `User.js` - User schema with validation
- `AnonymousSession.js` - Session tracking with TTL

### **Routes** (`/routes`)

- `auth.js` - Authentication endpoints
- `content.js` - Content generation endpoints
- `index.js` - Main route aggregator

### **Services** (`/services`)

- `authService.js` - Authentication business logic
- `contentService.js` - AI content generation logic

### **Utils** (`/utils`)

- `rateLimit.js` - Rate limiting configuration

## 🔐 Authentication Flow

### **Anonymous Users** ⚠️ **STRICT ONE-PROMPT LIMIT**

1. Generate session ID automatically
2. **Limited to exactly 1 prompt per session/IP**
3. Sessions expire after 24 hours (TTL)
4. **Must register/login for unlimited access**
5. IP-based tracking prevents circumvention
6. Clear error messages guide users to login

### **Authenticated Users**

1. Register/login to get JWT token
2. Unlimited content generation
3. Token expires after 7 days
4. Profile management available

## 📊 Database Models

### **User Model**

```javascript
{
  username: String (3-30 chars, unique),
  email: String (unique, lowercase),
  password: String (hashed, min 6 chars),
  createdAt: Date,
  lastLogin: Date,
  timestamps: true
}
```

### **AnonymousSession Model**

```javascript
{
  sessionId: String (unique),
  prompt: String,
  timestamp: Date (TTL: 24h),
  ipAddress: String,
  userAgent: String
}
```

## 🔌 API Endpoints

### **Authentication**

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user  
- `GET /auth/profile` - Get user profile (protected)

### **Content Generation**

- `POST /api/generate-content` - Generate AI content
- `GET /api/anonymous-status` - Check anonymous status
- `GET /api/check-free-prompt` - Check if free prompt was used

### **Testing & Health**

- `POST /clear-sessions` - Clear all sessions
- `GET /health` - Server health check

## 🛡️ Security Features

### **Input Validation**

- Username: 3-30 characters
- Password: Minimum 6 characters
- Email: Valid email format
- Content: Non-empty prompts

### **Authentication & Authorization**

- JWT tokens with 7-day expiry
- Password hashing with bcrypt
- Token verification middleware

### **Rate Limiting** 🚫 **STRICT ONE-PROMPT POLICY**

- **Anonymous users: Exactly 1 prompt per session/IP**
- Session-based tracking with IP validation
- Automatic cleanup after 24 hours
- **No exceptions or workarounds**
- Clear error messages with login prompts

### **Error Handling**

- Centralized error management
- Proper HTTP status codes
- Production-safe error messages
- Detailed logging for limit violations

## 🚀 Performance Features

### **Database Optimization**

- Indexes on username, email, sessionId
- **IP + timestamp index for session validation**
- TTL indexes for automatic cleanup
- Optimized queries with Mongoose

### **Caching & Sessions**

- In-memory session tracking
- MongoDB persistence
- Automatic session expiration
- **IP-based duplicate prevention**

## 🧪 Testing

### **One-Prompt Restriction Test**

```bash
# Run the automated test
node test-one-prompt-restriction.js
```

### **Manual Testing**

```bash
# Test user registration
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456","email":"test@example.com"}'

# Test login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'

# Test content generation (anonymous) - FIRST TIME
curl -X POST http://localhost:3000/api/generate-content \
  -H "Content-Type: application/json" \
  -d '{"userPrompt":"Generate a creative story"}'

# Test content generation (anonymous) - SECOND TIME (should fail)
curl -X POST http://localhost:3000/api/generate-content \
  -H "Content-Type: application/json" \
  -d '{"userPrompt":"Generate another story"}'

# Check free prompt status
curl -X GET http://localhost:3000/api/check-free-prompt

# Clear sessions (testing)
curl -X POST http://localhost:3000/api/clear-sessions
```

## 🔧 Development

### **Local MongoDB Setup**

1. Install MongoDB Community Edition
2. Start MongoDB service
3. Create database: `use prompt-generator`

### **MongoDB Atlas Setup**

1. Create MongoDB Atlas account
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### **Environment Variables**

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `JWT_SECRET`: JWT signing secret
- `MONGODB_URI`: MongoDB connection string
- `GEMINI_API_KEY`: Google Gemini API key

## 📈 Scalability

### **Database**

- MongoDB Atlas for cloud deployment
- Connection pooling
- Read replicas for high availability

### **Application**

- Stateless design
- Horizontal scaling ready
- Environment-based configuration

### **Security**

- Environment-based secrets
- Input sanitization
- **Strict one-prompt rate limiting**

## 🚀 Deployment

### **Production Checklist**

- [ ] Change `JWT_SECRET` to strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas or production MongoDB
- [ ] Configure proper CORS settings
- [ ] Set up monitoring and logging
- [ ] Remove testing endpoints
- [ ] Configure SSL/TLS
- [ ] Set up backup strategy
- [ ] **Verify one-prompt restriction is enforced**

### **Environment Variables (Production)**

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secure-jwt-secret
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/prompt-generator
GEMINI_API_KEY=your-gemini-api-key
```

## ⚠️ Important Notes

### **One-Prompt Restriction**

- **Anonymous users can generate exactly 1 prompt**
- **No exceptions or workarounds**
- **IP-based tracking prevents circumvention**
- **Clear error messages guide users to login**
- **Sessions expire after 24 hours**
- **Testing endpoints available for development**

### **Error Responses**

When anonymous users exceed their limit:

```json
{
  "error": "Anonymous users can only generate 1 prompt. Please register/login for unlimited access.",
  "userType": "anonymous",
  "requiresLogin": true,
  "message": "You have already used your free prompt. Please register or login for unlimited access."
}
```
