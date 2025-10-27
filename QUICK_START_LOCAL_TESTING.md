# 🚀 Quick Start - Local Testing Guide

Get your PromptLingo application running locally with Google OAuth and Render PostgreSQL database.

## ⚡ Quick Setup (5 Minutes)

### Step 1: Configure Environment Variables

#### Backend `.env` (`server/.env`)

```bash
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# API Keys (You already have these)
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...

# Google OAuth (From Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# JWT Secrets (Generated for you)
JWT_SECRET=94dc6ee6c14503b5cc7f91f3c5fcefa676e726c076ac5eb7ecd23b6d2c1420f9b45adb490e66729a909428cac59f31385ba88f6c49b16785de8cf8a142fb6461
JWT_REFRESH_SECRET=3784c0607c6005ac2ce967743b49fda400403d877056b796bfe6f71af14518e5f3c12dd6ff68724cee330d5feb61ca86c53353e31385f04d10f56c6a9ef2c04c

# Database (From Render Dashboard - "External Database URL")
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
```

#### Frontend `.env` (`client/.env`)

```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Step 2: Setup Database

```bash
cd server

# Create database tables
npm run db:migrate

# Test connection
npm run db:test

# (Optional) Add test users
npm run db:seed
```

### Step 3: Start Backend Server

```bash
# In server directory
npm run dev
```

Expected output:
```
🔗 Testing database connection...
✅ Database client connected
✅ Database connection successful
✅ Database ready

🚀 Server running on port 3001
```

### Step 4: Start Frontend

```bash
# In client directory (new terminal)
cd ../client
npm start
```

Expected output:
```
Compiled successfully!
Local: http://localhost:3000
```

### Step 5: Test Everything

Open browser to `http://localhost:3000`

1. ✅ Click "Sign in with Google"
2. ✅ Complete Google OAuth flow
3. ✅ See your profile in header
4. ✅ Use translation features
5. ✅ Check database has your user

## 🧪 Verify Database

### Check if user was created:

```bash
curl http://localhost:3001/api/health/stats
```

Should show:
```json
{
  "stats": {
    "totalUsers": 1,
    "activeUsers": 1,
    "activeSessions": 1
  }
}
```

### View database tables:

```bash
npm run db:test
```

## 🔍 Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend starts without errors
- [ ] Database connection successful
- [ ] Google login button appears
- [ ] Can sign in with Google
- [ ] User profile shows in header
- [ ] Translation features work
- [ ] User data saved to database
- [ ] Can logout successfully
- [ ] Health endpoints respond

## 🛠️ Common Issues & Solutions

### Issue: Port 3001 already in use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Restart server
npm run dev
```

### Issue: Database connection failed

1. Check `DATABASE_URL` in `server/.env`
2. Verify database is running in Render dashboard
3. Test connection: `npm run db:test`

### Issue: Google login fails

1. Check `GOOGLE_CLIENT_ID` matches in both `.env` files
2. Verify redirect URIs in Google Cloud Console include:
   - `http://localhost:3000`
   - `http://localhost:3001`
3. Check `GOOGLE_CLIENT_SECRET` in backend `.env`

### Issue: JWT errors

Make sure both JWT secrets are set in `server/.env`:
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

### Issue: CORS errors

Verify `FRONTEND_URL=http://localhost:3000` in `server/.env`

## 📊 Monitoring

### Backend Health Check
```bash
curl http://localhost:3001/api/health
```

### Database Status
```bash
curl http://localhost:3001/api/health/db-status
```

### User Stats
```bash
curl http://localhost:3001/api/health/stats
```

## 🎯 What's Working Now

✅ **Backend**
- Express server on port 3001
- PostgreSQL database connected
- Google OAuth authentication
- JWT token generation
- User management
- Session management
- Health monitoring

✅ **Frontend**
- React app on port 3000
- Google OAuth integration
- Protected routes
- User context
- Translation features
- WASM text processing

✅ **Database**
- Users table
- Sessions table
- Indexes for performance
- JSONB for preferences
- SSL connection to Render

## 🔐 Security Features

- ✅ API keys only on backend
- ✅ JWT tokens for authentication
- ✅ HTTP-only cookies (production)
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Helmet security headers
- ✅ SSL for database (Render)

## 📝 Development Workflow

1. **Make changes** to code
2. **Server auto-restarts** (nodemon)
3. **Frontend hot-reloads** (React)
4. **Test in browser** at localhost:3000
5. **Check logs** in terminal
6. **Verify database** with health endpoints

## 🚀 Ready for Production?

When ready to deploy:

1. Update environment variables for production
2. Set `NODE_ENV=production`
3. Use production DATABASE_URL
4. Update CORS origins
5. Enable HTTPS
6. Deploy frontend to Netlify
7. Deploy backend to Render

## 🆘 Getting Help

**Server won't start?**
- Check all environment variables are set
- Run `npm run db:test`
- Check server logs for errors

**Database issues?**
- Verify DATABASE_URL format
- Check Render dashboard
- Run migration again: `npm run db:migrate`

**Authentication not working?**
- Verify Google OAuth credentials
- Check JWT secrets are set
- Clear browser cookies and try again

---

**🎉 You're all set!** Your application is now running locally with full database integration.

**Next Steps:**
1. Test Google login flow
2. Create some translations
3. Check user data in database
4. Explore health endpoints
5. Start building new features!
