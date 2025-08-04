# Prompt Generator

A full-stack AI prompt generation application with user authentication, visitor tracking, and Google Gemini AI integration. Built with Angular 20+, Node.js/Express, MongoDB, and Tailwind CSS.

## ✨ Features

- **🤖 AI-Powered Prompts**: Generate creative, formal, funny, or concise prompts using Google Gemini AI
- **🔐 User Authentication**: JWT-based registration and login system
- **👤 Anonymous Access**: One free prompt for anonymous users with strict rate limiting
- **📊 Visitor Tracking**: Real-time visitor count and session management
- **💾 Local Storage**: Save prompt history and favorites (persisted locally)
- **📋 Copy to Clipboard**: One-click prompt copying
- **🌙 Dark Mode**: Toggle between light and dark themes
- **📱 Responsive Design**: Modern UI styled with Tailwind CSS
- **🛡️ Security**: Password hashing, input validation, rate limiting
- **⚡ Performance**: Optimized with Angular signals and OnPush change detection

## 🏗️ Tech Stack

### Frontend

- [Angular 20+](https://angular.io/) (standalone components, signals, OnPush, reactive forms)
- [Tailwind CSS 4+](https://tailwindcss.com/) (utility-first styling)
- [ngx-markdown](https://github.com/jfcere/ngx-markdown) (markdown rendering)
- [RxJS](https://rxjs.dev/) (reactive programming)

### Backend

- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) (REST API)
- [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) (database)
- [Google Gemini API](https://ai.google.dev/gemini-api/docs) (AI content generation)
- [JWT](https://jwt.io/) (authentication)
- [bcrypt](https://github.com/dcodeIO/bcrypt.js/) (password hashing)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local or MongoDB Atlas)

### Installation

#### **Clone the repository**

```bash
git clone <repository-url>
cd prompt-generator
```

#### **Install frontend dependencies**

```bash
npm install
```

#### **Install backend dependencies**

```bash
cd backend
npm install
```

### Environment Setup

#### Backend Configuration

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (change this in production)
JWT_SECRET=your-secret-key-change-in-production

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/prompt-generator
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prompt-generator

# Gemini API Key
GEMINI_API_KEY=your-gemini-api-key-here
```

#### Frontend Configuration

The frontend is preconfigured to use the backend API. No additional configuration needed.

### Development Server

#### **Start the backend server**

```bash
cd backend
npm start
```

#### **Start the frontend (in a new terminal)**

```bash
npm start
```

#### **Visit the application**

Open [http://localhost:4200](http://localhost:4200) in your browser.

## 📖 Usage

### For Anonymous Users

1. Visit the application
2. Select a prompt style (Creative, Formal, Funny, Concise)
3. Enter your prompt description
4. Click "Generate Prompt" (limited to 1 prompt)
5. Register for unlimited access

### For Registered Users

1. Register or login to your account
2. Generate unlimited prompts with any style
3. Save prompts as favorites
4. View your prompt history
5. Copy prompts to clipboard

## 🏛️ Project Structure

```text
prompt-generator/
├── src/                          # Angular frontend
│   ├── app/
│   │   ├── components/           # UI components
│   │   │   ├── home/            # Main prompt generator
│   │   │   ├── login/           # User login
│   │   │   └── register/        # User registration
│   │   ├── services/            # API services
│   │   │   ├── auth.ts          # Authentication service
│   │   │   ├── content.ts       # Content generation
│   │   │   └── gemini.ts        # Gemini API integration
│   │   └── models/              # TypeScript interfaces
│   └── environments/            # Environment configuration
├── backend/                      # Node.js/Express backend
│   ├── config/                  # Database configuration
│   ├── controllers/             # Request handlers
│   ├── middleware/              # Custom middleware
│   ├── models/                  # MongoDB schemas
│   ├── routes/                  # API route definitions
│   ├── services/                # Business logic
│   └── utils/                   # Utility functions
└── public/                      # Static assets
```

## 🔐 Authentication System

### Anonymous Users

- **Strict 1-prompt limit** per session/IP
- Sessions expire after 24 hours
- IP-based tracking prevents circumvention
- Clear prompts to register for unlimited access

### Registered Users

- JWT-based authentication
- Unlimited prompt generation
- Profile management
- Secure password hashing

## 📊 Database Models

### User Model

```javascript
{
  username: String (3-30 chars, unique),
  email: String (unique, lowercase),
  password: String (hashed, min 6 chars),
  createdAt: Date,
  lastLogin: Date
}
```

### AnonymousSession Model

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

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile (protected)

### Content Generation

- `POST /api/generate-content` - Generate AI content
- `GET /api/check-free-prompt` - Check anonymous status

### Visitor Tracking

- `POST /api/visit` - Track visitor count

## 🛡️ Security Features

- **Input Validation**: Username, email, password validation
- **Password Security**: bcrypt hashing with salt
- **Rate Limiting**: Strict one-prompt limit for anonymous users
- **JWT Authentication**: Secure token-based sessions
- **CORS Protection**: Cross-origin request handling
- **Error Handling**: Centralized error management

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Change `JWT_SECRET` to strong random string
- [ ] Use MongoDB Atlas or production MongoDB
- [ ] Configure proper CORS settings
- [ ] Set up SSL/TLS certificates
- [ ] Configure environment variables
- [ ] Set up monitoring and logging

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secure-jwt-secret
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/prompt-generator
GEMINI_API_KEY=your-gemini-api-key
```

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm run test-auth
node test-one-prompt-restriction.js
```

### Manual API Testing

```bash
# Test registration
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456","email":"test@example.com"}'

# Test login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'

# Test content generation
curl -X POST http://localhost:3000/api/generate-content \
  -H "Content-Type: application/json" \
  -d '{"userPrompt":"Generate a creative story"}'
```

## 📈 Performance Features

- **Angular Signals**: Reactive state management
- **OnPush Change Detection**: Optimized rendering
- **MongoDB Indexes**: Optimized database queries
- **Connection Pooling**: Efficient database connections
- **TTL Indexes**: Automatic session cleanup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[MIT](LICENSE)

## ⚠️ Important Notes

- **Anonymous users are limited to exactly 1 prompt**
- **Sessions expire after 24 hours**
- **IP-based tracking prevents circumvention**
- **Clear error messages guide users to register**
- **All passwords are securely hashed**
- **JWT tokens expire after 7 days**
