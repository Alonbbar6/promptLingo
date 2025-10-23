# 🚀 Quick Start Guide - Fix ElevenLabs on Render

## ⚡ TL;DR - Do This Now

### 1️⃣ Push Code Changes (2 minutes)
```bash
cd /Users/user/Desktop/buisnessPrompt
git add render.yaml client/.env.production
git commit -m "Fix: ElevenLabs audio on Render - CSP and backend URL"
git push origin main
```

### 2️⃣ Add Environment Variables on Render (3 minutes)

**Go to:** https://dashboard.render.com

**Select:** `promptlingo-backend` service

**Add these variables:**

```
ELEVENLABS_API_KEY = your_elevenlabs_api_key_here
OPENAI_API_KEY = your_openai_api_key_here
NODE_ENV = production
PORT = 10000
```

**Click:** "Save Changes"

### 3️⃣ Wait for Deploy (5 minutes)
- Watch the deploy logs in Render Dashboard
- Both frontend and backend will redeploy

### 4️⃣ Test It (1 minute)
```bash
./test-elevenlabs.sh
```

**Or test in browser:**
- Open: https://promptlingo-frontend.onrender.com
- Try playing audio
- Should work! 🎉

---

## 🔧 What Was Fixed

### Problem 1: CSP Blocking ElevenLabs ❌ → ✅
**Before:**
```yaml
connect-src 'self' https://*.onrender.com;
```

**After:**
```yaml
connect-src 'self' https://*.onrender.com https://api.elevenlabs.io;
```

### Problem 2: Wrong Backend URL ❌ → ✅
**Before:**
```
REACT_APP_API_URL=https://promptlingo-1.onrender.com/api
```

**After:**
```
REACT_APP_API_URL=https://promptlingo-backend.onrender.com/api
```

### Problem 3: Missing Environment Variables ❌ → ✅
**Before:** Not set on Render

**After:** Added in Render Dashboard

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────┐
│ User Browser                                            │
│  ↓ Clicks "Play Audio"                                  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Frontend (Render Static)                                │
│  - https://promptlingo-frontend.onrender.com            │
│  - Sends: POST /api/synthesize                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Backend (Render Web Service)                            │
│  - https://promptlingo-backend.onrender.com             │
│  - Uses: ELEVENLABS_API_KEY from environment            │
│  - Calls: https://api.elevenlabs.io                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ ElevenLabs API                                          │
│  - Generates audio                                      │
│  - Returns: MP3 audio stream                            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Backend                                                 │
│  - Converts to base64                                   │
│  - Returns: { audioUrl: "data:audio/mpeg;base64,..." } │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Frontend                                                │
│  - Creates Audio element                                │
│  - Plays audio                                          │
└─────────────────────────────────────────────────────────┘
                        ↓
                  🔊 User hears voice!
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Backend health check shows ElevenLabs working
  ```bash
  curl https://promptlingo-backend.onrender.com/api/health
  # Should show: "elevenlabs": "working (XX voices available)"
  ```

- [ ] No CORS errors in browser console
  - Open DevTools (F12) → Console
  - Should see: `Making POST request to /synthesize`

- [ ] No CSP violations
  - Console should NOT show: "Refused to connect to..."

- [ ] Audio plays successfully
  - Click play button
  - Hear ElevenLabs voice

---

## 🐛 Still Not Working?

### Check Backend Logs
1. Go to Render Dashboard
2. Click `promptlingo-backend`
3. Click "Logs" tab
4. Look for:
   ```
   🔑 API Keys Check:
      - ElevenLabs: ✓ Set
   ```

### Check Browser Console
1. Open your site
2. Press F12 (DevTools)
3. Go to Console tab
4. Look for errors

### Check Network Tab
1. DevTools → Network tab
2. Try playing audio
3. Look for `/api/synthesize` request
4. Check response status (should be 200)

### Common Issues

| Issue | Solution |
|-------|----------|
| "API key not configured" | Add `ELEVENLABS_API_KEY` in Render Dashboard |
| CORS error | Check backend `allowedOrigins` includes frontend URL |
| CSP violation | Verify `render.yaml` includes `https://api.elevenlabs.io` |
| 404 on API calls | Check `REACT_APP_API_URL` matches backend URL |

---

## 📞 Support

**Render Dashboard:** https://dashboard.render.com

**Backend Logs:** Dashboard → promptlingo-backend → Logs

**Frontend URL:** https://promptlingo-frontend.onrender.com

**Backend URL:** https://promptlingo-backend.onrender.com

---

## 🎉 Success!

When everything works, you'll see:
- ✅ No errors in console
- ✅ Audio plays immediately
- ✅ Clear ElevenLabs voice quality
- ✅ Fast response time

**Enjoy your working ElevenLabs integration! 🚀**
