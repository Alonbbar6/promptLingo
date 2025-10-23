# 🔧 ElevenLabs Audio Fix for Render Deployment

## 🔍 Problems Identified

### 1. **Content Security Policy (CSP) Blocking ElevenLabs**
Your `render.yaml` CSP only allows connections to:
- `'self'` (your own domain)
- `https://*.onrender.com`

But ElevenLabs API is at `https://api.elevenlabs.io` - **BLOCKED!**

### 2. **Backend URL Mismatch**
- `render.yaml` → `https://promptlingo-backend.onrender.com/api`
- `.env.production` → `https://promptlingo-1.onrender.com/api`

### 3. **Missing Environment Variables on Render**
Your API keys are marked as `sync: false` in render.yaml, meaning they need to be manually added in Render dashboard.

### 4. **Architecture Issue**
Your frontend has TWO ways to call ElevenLabs:
- ✅ **Backend route** (`/api/synthesize`) - WORKS, goes through your server
- ❌ **Direct client calls** (`elevenLabsService.ts`) - BLOCKED by CSP

---

## ✅ Solution

### Step 1: Fix Content Security Policy in render.yaml

Update the CSP to allow ElevenLabs API:

```yaml
- path: /*
  name: Content-Security-Policy
  value: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.onrender.com https://api.elevenlabs.io; media-src 'self' blob: data:;
```

**Change:** Added `https://api.elevenlabs.io` to `connect-src`

### Step 2: Fix Backend URL Consistency

Update `.env.production` to match render.yaml:

```env
REACT_APP_API_URL=https://promptlingo-backend.onrender.com/api
```

### Step 3: Add Environment Variables on Render

**CRITICAL:** You must add these in Render Dashboard:

1. Go to https://dashboard.render.com
2. Select your `promptlingo-backend` service
3. Go to **Environment** tab
4. Add these variables:

```
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
PORT=10000
```

4. Click **Save Changes** - this will trigger a redeploy

### Step 4: Update CORS Configuration

Your backend needs to allow your frontend domain. Check `server/index.js` line 45:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://promptlingo.netlify.app',
  /https:\/\/.*\.netlify\.app$/,
  'https://promptlingo-frontend.onrender.com', // ✅ Add this
  /https:\/\/.*\.onrender\.com$/,
];
```

---

## 🧪 Testing the Fix

### Test 1: Check Backend Health
```bash
curl https://promptlingo-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "apis": {
    "elevenlabs": "working (XX voices available)"
  }
}
```

### Test 2: Test Synthesis Endpoint
```bash
curl -X POST https://promptlingo-backend.onrender.com/api/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello world",
    "voiceId": "pNInz6obpgDQGcFmaJgB",
    "language": "en"
  }'
```

Should return audio data in base64 format.

### Test 3: Check Frontend Console
Open browser DevTools → Console and look for:
- ✅ `Making POST request to /synthesize`
- ✅ `✅ [FRONTEND] Synthesis completed`
- ❌ No CORS errors
- ❌ No CSP violations

---

## 🚀 Deployment Steps

1. **Update render.yaml** (CSP fix)
2. **Update client/.env.production** (backend URL)
3. **Commit and push changes**
4. **Add environment variables in Render Dashboard**
5. **Trigger manual deploy or wait for auto-deploy**
6. **Test using the commands above**

---

## 🔒 Security Best Practices

✅ **DO:**
- Keep API keys in Render environment variables (not in code)
- Use backend proxy for API calls (your current setup)
- Keep `.env` files in `.gitignore`

❌ **DON'T:**
- Commit API keys to Git
- Expose API keys in frontend code
- Call ElevenLabs directly from frontend (CSP will block)

---

## 📊 Architecture Flow

```
User Browser
    ↓
Frontend (Render Static Site)
    ↓ POST /api/synthesize
Backend (Render Web Service)
    ↓ Uses ELEVENLABS_API_KEY
ElevenLabs API
    ↓ Returns audio
Backend
    ↓ Converts to base64
Frontend
    ↓ Plays audio
User hears voice ✅
```

---

## 🐛 Common Issues

### Issue: "ElevenLabs API key not configured"
**Solution:** Add `ELEVENLABS_API_KEY` in Render Dashboard → Environment

### Issue: CORS error
**Solution:** Check backend `allowedOrigins` includes your frontend URL

### Issue: CSP violation
**Solution:** Verify `connect-src` includes `https://api.elevenlabs.io`

### Issue: Audio doesn't play
**Solution:** Check browser console for errors, verify audio format is supported

---

## 📝 Files Modified

1. ✏️ `render.yaml` - Updated CSP
2. ✏️ `client/.env.production` - Fixed backend URL
3. ⚙️ Render Dashboard - Added environment variables
