# ✅ Netlify Deployment Checklist & Troubleshooting Guide

## 🎯 Complete Deployment Checklist

### Phase 1: Local Testing ✓

- [ ] **Test locally first**
  ```bash
  # Terminal 1: Start backend
  cd server
  npm install
  npm start
  
  # Terminal 2: Start frontend
  cd client
  npm install
  npm start
  ```

- [ ] **Verify all features work locally:**
  - [ ] Microphone recording
  - [ ] Audio transcription
  - [ ] Text translation
  - [ ] Text-to-speech playback
  - [ ] No console errors

### Phase 2: Environment Configuration ✓

- [ ] **Frontend environment files created:**
  - [ ] `client/.env.example` (template)
  - [ ] `client/.env.local` (local dev - points to localhost:3001)
  - [ ] `client/.env.production` (production - needs backend URL)

- [ ] **Environment variables configured:**
  ```bash
  # In client/.env.local
  REACT_APP_API_URL=http://localhost:3001/api
  
  # In client/.env.production (update after backend deployment)
  REACT_APP_API_URL=https://your-backend.onrender.com/api
  ```

### Phase 3: Code Updates ✓

- [ ] **All hardcoded localhost URLs removed:**
  - [x] `client/src/services/api.ts` - Uses `process.env.REACT_APP_API_URL`
  - [x] `client/src/components/VoiceSelector.tsx` - Uses environment variable
  - [x] `client/src/components/ErrorDisplay.tsx` - Dynamic error messages

- [ ] **netlify.toml configured:**
  - [x] Microphone permissions header added
  - [x] Security headers added
  - [x] WASM support headers present
  - [x] SPA redirect configured

### Phase 4: Backend Deployment 🚀

- [ ] **Choose backend hosting:**
  - [ ] Option A: Render (recommended for free tier)
  - [ ] Option B: Railway (requires credit card)
  - [ ] Option C: Heroku (paid only)
  - [ ] Option D: Fly.io (advanced)

- [ ] **Deploy backend** (see BACKEND_DEPLOYMENT_GUIDE.md)

- [ ] **Backend is accessible:**
  - [ ] Test health endpoint: `https://your-backend.com/api/health`
  - [ ] Returns 200 OK response

- [ ] **CORS configured in backend:**
  ```javascript
  app.use(cors({
    origin: [
      'http://localhost:3000',
      'https://your-site.netlify.app'
    ],
    credentials: true
  }));
  ```

- [ ] **Backend environment variables set:**
  - [ ] `PORT` (usually 3001 or auto-assigned)
  - [ ] `NODE_ENV=production`
  - [ ] `OPENAI_API_KEY` (if using OpenAI)
  - [ ] `ELEVENLABS_API_KEY` (if using ElevenLabs)

### Phase 5: Netlify Configuration 🌐

- [ ] **Update `client/.env.production`:**
  ```bash
  REACT_APP_API_URL=https://your-backend.onrender.com/api
  ```

- [ ] **Commit and push changes:**
  ```bash
  git add .
  git commit -m "Configure production environment variables"
  git push origin main
  ```

- [ ] **Set Netlify environment variables:**
  1. Go to Netlify Dashboard
  2. Select your site
  3. Go to Site Settings → Environment Variables
  4. Add: `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`
  5. Click Save

- [ ] **Trigger Netlify deployment:**
  - Go to Deploys tab
  - Click "Trigger deploy" → "Deploy site"
  - Wait for build to complete (2-5 minutes)

### Phase 6: Testing Production 🧪

- [ ] **Visit your Netlify site**

- [ ] **Test microphone permissions:**
  - [ ] Browser asks for microphone permission
  - [ ] Permission is granted
  - [ ] Audio level indicator shows activity

- [ ] **Test recording:**
  - [ ] Click record button
  - [ ] Speak for 3-5 seconds
  - [ ] Recording stops successfully
  - [ ] No errors in console

- [ ] **Test transcription:**
  - [ ] Audio is transcribed correctly
  - [ ] Text appears in transcription box
  - [ ] No "Cannot connect to server" errors

- [ ] **Test translation:**
  - [ ] Select target language
  - [ ] Translation appears
  - [ ] No errors

- [ ] **Test text-to-speech:**
  - [ ] Click play button
  - [ ] Audio plays correctly
  - [ ] No playback errors

- [ ] **Check browser console:**
  - [ ] No red errors
  - [ ] API calls going to correct backend URL
  - [ ] All features working

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot connect to server" Error

**Symptoms:**
- Red error box appears
- Says "Cannot reach the server at..."
- No API calls succeed

**Solutions:**

1. **Check backend is running:**
   ```bash
   curl https://your-backend.onrender.com/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Verify Netlify environment variable:**
   - Go to Site Settings → Environment Variables
   - Check `REACT_APP_API_URL` is set correctly
   - Should be: `https://your-backend.onrender.com/api` (with `/api`)

3. **Redeploy Netlify site:**
   - Environment variables only apply to new builds
   - Trigger a new deployment

4. **Check browser console:**
   - Look for the actual API URL being called
   - Should match your backend URL

---

### Issue 2: Microphone Permission Denied

**Symptoms:**
- "Microphone Permission: ❌ denied"
- No audio recording works
- Browser doesn't ask for permission

**Solutions:**

1. **Check HTTPS:**
   - Netlify serves over HTTPS ✓
   - Microphone requires HTTPS in production ✓

2. **Check browser permissions:**
   - Click lock icon in address bar
   - Check microphone permission
   - Reset if needed

3. **Verify headers in netlify.toml:**
   ```toml
   [[headers]]
     for = "/*"
     [headers.values]
       Permissions-Policy = "microphone=(self), camera=(self)"
   ```

4. **Test in different browser:**
   - Try Chrome, Firefox, Safari
   - Some browsers have stricter policies

5. **Check for errors in console:**
   - Look for "NotAllowedError" or "PermissionDenied"

---

### Issue 3: CORS Errors

**Symptoms:**
- Console shows: "Access to fetch... has been blocked by CORS policy"
- API calls fail with CORS error

**Solutions:**

1. **Update backend CORS configuration:**
   ```javascript
   const cors = require('cors');
   
   app.use(cors({
     origin: [
       'http://localhost:3000',
       'https://your-site.netlify.app',
       'https://*.netlify.app'  // For preview deploys
     ],
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```

2. **Redeploy backend** after CORS changes

3. **Check Netlify URL is correct:**
   - Make sure you're using the exact Netlify URL
   - Include both main site and preview URLs

---

### Issue 4: Backend Cold Starts (Render Free Tier)

**Symptoms:**
- First request takes 30-60 seconds
- Timeout errors on first use
- Works fine after first request

**Solutions:**

1. **Show loading message to users:**
   - "Backend is waking up, please wait..."
   - Increase timeout for first request

2. **Use UptimeRobot to ping backend:**
   - Keeps backend awake
   - Free service: https://uptimerobot.com

3. **Upgrade to paid tier:**
   - Render Starter: $7/month
   - No cold starts

---

### Issue 5: Environment Variables Not Working

**Symptoms:**
- Still connecting to localhost in production
- API calls going to wrong URL

**Solutions:**

1. **Check variable name:**
   - Must be `REACT_APP_API_URL` (not `VITE_API_URL`)
   - React requires `REACT_APP_` prefix

2. **Redeploy after setting variables:**
   - Variables only apply to new builds
   - Trigger new deployment in Netlify

3. **Check .env.production file:**
   - Should have correct backend URL
   - Commit and push this file

4. **Verify in build logs:**
   - Check Netlify build logs
   - Look for environment variable being set

---

### Issue 6: Audio Files Not Playing

**Symptoms:**
- TTS generates audio but doesn't play
- Audio player shows error

**Solutions:**

1. **Check audio format:**
   - Should be MP3 or WAV
   - Check backend response

2. **Check CORS for audio files:**
   - Audio files need CORS headers
   - Update backend to allow audio streaming

3. **Check browser console:**
   - Look for audio playback errors
   - Check network tab for failed requests

---

## 📊 Debugging Tools

### Check API Calls in Browser:

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Filter by "Fetch/XHR"**
4. **Look for API calls:**
   - Should go to your backend URL
   - Check status codes (200 = success)
   - Check response data

### Check Environment Variables:

```javascript
// Add this temporarily to your code to debug
console.log('API URL:', process.env.REACT_APP_API_URL);
```

### Check Backend Logs:

- **Render:** Dashboard → Logs tab
- **Railway:** Dashboard → Deployments → View Logs
- **Heroku:** `heroku logs --tail`

---

## 🎯 Quick Reference

### Netlify Environment Variables to Set:

```
REACT_APP_API_URL = https://your-backend.onrender.com/api
```

### Backend Environment Variables to Set:

```
PORT = 3001 (or auto-assigned)
NODE_ENV = production
OPENAI_API_KEY = your_key_here (optional)
ELEVENLABS_API_KEY = your_key_here (optional)
```

### Files That Need Backend URL:

- ✅ `client/.env.production` (committed to git)
- ✅ Netlify environment variables (set in dashboard)
- ✅ Backend CORS config (allow Netlify domain)

---

## 🚀 Deployment Commands

```bash
# 1. Commit all changes
git add .
git commit -m "Configure production deployment"
git push origin main

# 2. Deploy backend (if using Render)
# - Push to GitHub
# - Render auto-deploys

# 3. Deploy frontend (Netlify)
# - Netlify auto-deploys on push
# - Or trigger manual deploy in dashboard

# 4. Test production
# - Visit Netlify URL
# - Test all features
# - Check console for errors
```

---

## ✅ Final Verification

Before considering deployment complete:

- [ ] Frontend loads without errors
- [ ] Microphone permission works
- [ ] Audio recording works
- [ ] Transcription works
- [ ] Translation works
- [ ] Text-to-speech works
- [ ] No console errors
- [ ] API calls go to correct backend
- [ ] Backend responds successfully
- [ ] CORS is configured correctly
- [ ] All features tested in production

---

## 📞 Need Help?

If you're still having issues:

1. **Check browser console** for specific error messages
2. **Check Netlify build logs** for build errors
3. **Check backend logs** for server errors
4. **Review this checklist** step by step
5. **Test locally first** to isolate the issue

---

**Last Updated:** After fixing all localhost references and adding environment variable support
