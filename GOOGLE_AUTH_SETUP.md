# Google Authentication Setup Guide

This guide will help you set up Google OAuth authentication for PromptLingo.

## 📋 Prerequisites

- Google Cloud Console account
- PostgreSQL database (local or hosted)
- Node.js and npm installed

## 🔧 Step 1: Install Dependencies

### Backend Dependencies
```bash
cd server
npm install
```

This will install:
- `google-auth-library` - Google OAuth verification
- `jsonwebtoken` - JWT token generation
- `pg` - PostgreSQL client
- `cookie-parser` - Cookie handling
- `bcryptjs` - Password hashing (future use)
- `uuid` - UUID generation

### Frontend Dependencies
```bash
cd client
npm install
```

This will install:
- `@react-oauth/google` - Google OAuth for React
- `react-router-dom` - Routing

## 🌐 Step 2: Set Up Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name it "PromptLingo" or similar
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure OAuth consent screen:
     - User Type: External
     - App name: PromptLingo
     - User support email: your email
     - Developer contact: your email
     - Save and Continue

5. **Configure OAuth Client**
   - Application type: **Web application**
   - Name: PromptLingo Web Client
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   http://localhost:3001
   https://your-production-domain.com
   ```
   
   **Authorized redirect URIs:**
   ```
   http://localhost:3000
   http://localhost:3000/auth/callback
   https://your-production-domain.com
   https://your-production-domain.com/auth/callback
   ```

6. **Save Credentials**
   - Copy the **Client ID** (ends with `.apps.googleusercontent.com`)
   - Copy the **Client Secret**

## 🗄️ Step 3: Set Up PostgreSQL Database

### Option A: Local PostgreSQL

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql
   sudo service postgresql start
   ```

2. **Create Database**
   ```bash
   psql postgres
   CREATE DATABASE promptlingo;
   CREATE USER promptlingo_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE promptlingo TO promptlingo_user;
   \q
   ```

3. **Database URL**
   ```
   postgresql://promptlingo_user:your_password@localhost:5432/promptlingo
   ```

### Option B: Hosted Database (Recommended for Production)

**Render.com (Free Tier)**
1. Go to https://render.com
2. Create new PostgreSQL database
3. Copy the "External Database URL"

**Supabase (Free Tier)**
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy "Connection string"

**Neon.tech (Free Tier)**
1. Go to https://neon.tech
2. Create new project
3. Copy connection string

## 🔐 Step 4: Configure Environment Variables

### Backend (.env)

Create `/server/.env`:
```bash
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# API Keys
OPENAI_API_KEY=sk-your-openai-key
ELEVENLABS_API_KEY=your-elevenlabs-key

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# JWT Secrets (Generate random strings!)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

# Database
DATABASE_URL=postgresql://user:password@host:5432/database
```

**Generate Secure JWT Secrets:**
```bash
# In terminal, run:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Run twice to get two different secrets
```

### Frontend (.env)

Create `/client/.env`:
```bash
# API URL
REACT_APP_API_URL=http://localhost:3001

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## 🚀 Step 5: Start the Application

### Terminal 1 - Backend
```bash
cd server
npm install
npm run dev
```

You should see:
```
✅ Database connected successfully
✅ Database tables initialized successfully
🚀 Server running on port 3001
```

### Terminal 2 - Frontend
```bash
cd client
npm install
npm start
```

Browser should open at `http://localhost:3000`

## ✅ Step 6: Test Authentication

1. **Navigate to Login Page**
   - Go to `http://localhost:3000/login`

2. **Click "Sign in with Google"**
   - Google popup should appear
   - Select your Google account
   - Grant permissions

3. **Verify Success**
   - You should be redirected to the main app
   - Your name/avatar should appear in the header
   - Check browser console for any errors

4. **Test Backend**
   - Open browser DevTools → Network tab
   - Look for successful API calls to `/api/auth/google/login`
   - Response should include `accessToken` and `user` data

## 🔍 Troubleshooting

### "Google Client ID not set"
- Check that `REACT_APP_GOOGLE_CLIENT_ID` is in `/client/.env`
- Restart the React dev server after adding env variables

### "Database connection failed"
- Verify `DATABASE_URL` is correct in `/server/.env`
- Check database is running: `psql $DATABASE_URL`
- Check firewall/network settings for hosted databases

### "CORS Error"
- Verify `FRONTEND_URL` in server `.env` matches your frontend URL
- Check Google Console authorized origins include your frontend URL

### "Invalid Google token"
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` match Google Console
- Check that the Client ID in frontend matches backend

### Database tables not created
- Check server logs for database initialization errors
- Manually run: `psql $DATABASE_URL -f server/config/database.js`

## 📊 Verify Database Tables

```bash
# Connect to database
psql $DATABASE_URL

# List tables
\dt

# Should see:
# - users
# - user_sessions
# - user_preferences
# - translation_history

# View users
SELECT * FROM users;

# Exit
\q
```

## 🔒 Security Checklist

- [ ] JWT secrets are random and secure (not default values)
- [ ] `.env` files are in `.gitignore`
- [ ] Google OAuth restricted to your domains only
- [ ] Database uses strong password
- [ ] HTTPS enabled in production
- [ ] CORS configured for production domains only

## 🌐 Production Deployment

### Update Google OAuth
1. Add production URLs to Google Console:
   - Authorized origins: `https://your-domain.com`
   - Redirect URIs: `https://your-domain.com`, `https://your-domain.com/auth/callback`

### Update Environment Variables
```bash
# Backend
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
DATABASE_URL=your-production-database-url

# Frontend
REACT_APP_API_URL=https://your-backend-domain.com
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## 📚 Next Steps

1. **Customize Login Page** - Edit `/client/src/pages/LoginPage.tsx`
2. **Add User Profile Page** - Create profile management
3. **Implement Subscription Logic** - Add payment integration
4. **Add Translation History** - View past translations
5. **User Preferences** - Save language/tone preferences

## 🆘 Getting Help

- Check server logs for detailed error messages
- Check browser console for frontend errors
- Verify all environment variables are set correctly
- Test database connection independently

## 📝 API Endpoints

Once running, these endpoints are available:

**Authentication:**
- `POST /api/auth/google/login` - Login with Google
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/refresh` - Refresh access token

**User:**
- `GET /api/user/profile` - Get user profile
- `GET /api/user/preferences` - Get preferences
- `POST /api/user/preferences` - Update preferences
- `GET /api/user/history` - Get translation history
- `POST /api/user/history` - Save translation

All user endpoints require `Authorization: Bearer <token>` header.
