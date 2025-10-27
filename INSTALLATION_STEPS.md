# PromptLingo Installation Steps

Quick installation guide for getting PromptLingo up and running.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins: `http://localhost:3000`, `http://localhost:3001`
6. Copy Client ID and Client Secret

### 3. Set Up Database

**Option A: Use Render.com (Free)**
1. Go to https://render.com
2. Create PostgreSQL database
3. Copy connection string

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL
brew install postgresql  # macOS
brew services start postgresql

# Create database
createdb promptlingo
```

### 4. Configure Environment Variables

**Backend** - Create `server/.env`:
```bash
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Your API keys
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...

# Google OAuth (from step 2)
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...

# Generate these with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# Database URL (from step 3)
DATABASE_URL=postgresql://...
```

**Frontend** - Create `client/.env`:
```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_GOOGLE_CLIENT_ID=...apps.googleusercontent.com
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

### 6. Test It

1. Open http://localhost:3000/login
2. Click "Sign in with Google"
3. You should be redirected to the main app after login

## ✅ Verification

Check that you see:
- ✅ Database connected successfully
- ✅ Database tables initialized successfully
- ✅ Server running on port 3001
- ✅ Google login button appears
- ✅ Can sign in with Google account

## 🔧 Troubleshooting

**"Cannot find module 'react-router-dom'"**
```bash
cd client
npm install react-router-dom
```

**"Database connection failed"**
- Check DATABASE_URL is correct
- Verify database is running
- Test connection: `psql $DATABASE_URL`

**"Google OAuth error"**
- Verify GOOGLE_CLIENT_ID matches in both frontend and backend
- Check authorized origins in Google Console

## 📚 Full Documentation

See [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md) for detailed setup instructions.
