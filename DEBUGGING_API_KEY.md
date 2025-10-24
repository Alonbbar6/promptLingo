# Debugging "Invalid API Key" Error - Step-by-Step Guide

## Problem
Getting "Invalid API key" error when frontend calls backend on Render.

## Root Cause Analysis

Based on code review, your implementation is **CORRECT**:
- ✅ Backend reads `process.env.ELEVENLABS_API_KEY` correctly
- ✅ Backend forwards key with correct header `xi-api-key`
- ✅ Frontend doesn't expose or handle the API key (security ✓)
- ✅ Route mounting is correct: `/api/synthesize`

**Most Likely Issue**: Environment variable not properly set on Render or has whitespace.

---

## Step-by-Step Debugging Process

### **Step 1: Verify Environment Variable on Render**

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your backend service: `promptlingo-backend`
3. Click on **"Environment"** tab
4. Look for `ELEVENLABS_API_KEY`

**Check for these issues:**
- ❌ Variable doesn't exist
- ❌ Variable name is misspelled (e.g., `ELEVEN_LABS_API_KEY`)
- ❌ Value has leading/trailing spaces
- ❌ Value is wrapped in quotes (remove quotes!)
- ❌ Value was copied incorrectly

**How to fix:**
```
Key: ELEVENLABS_API_KEY
Value: sk_1234567890abcdef... (no quotes, no spaces)
```

4. Click **"Save Changes"**
5. Wait for Render to redeploy (this can take 2-5 minutes)

---

### **Step 2: Test API Key Directly on Render**

I've created a test script for you. Run this on Render to verify the API key:

**Option A: Via Render Shell**
1. Go to your Render dashboard
2. Select your backend service
3. Click **"Shell"** tab
4. Run:
   ```bash
   node server/utils/testApiKey.js
   ```

**Option B: Add as a temporary endpoint**
Add this to your `server/index.js` temporarily:
```javascript
app.get('/api/test-key', async (req, res) => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    return res.json({
      status: 'error',
      message: 'ELEVENLABS_API_KEY not set',
      hasKey: false
    });
  }
  
  try {
    const axios = require('axios');
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey.trim() },
      timeout: 5000,
    });
    
    res.json({
      status: 'success',
      message: 'API key is valid!',
      hasKey: true,
      keyLength: apiKey.length,
      keyPreview: apiKey.substring(0, 8) + '...',
      voicesCount: response.data.voices?.length || 0
    });
  } catch (error) {
    res.json({
      status: 'error',
      message: error.response?.data || error.message,
      hasKey: true,
      keyLength: apiKey.length,
      statusCode: error.response?.status
    });
  }
});
```

Then visit: `https://promptlingo-backend.onrender.com/api/test-key`

---

### **Step 3: Check Render Logs**

1. Go to your Render dashboard
2. Select your backend service
3. Click **"Logs"** tab
4. Look for these startup messages:
   ```
   🔑 API Keys Check:
      - OpenAI: ✓ Set
      - ElevenLabs: ✓ Set  <-- Should say "✓ Set"
   ```

If it says `✗ Missing`, the environment variable isn't loading.

---

### **Step 4: Test the Health Endpoint**

Visit this URL in your browser:
```
https://promptlingo-backend.onrender.com/api/health
```

Look for the `apis.elevenlabs` field:
- ✅ `"working (X voices available)"` = API key is valid
- ❌ `"not configured"` = Environment variable not set
- ❌ `"error: ..."` = API key is invalid or has issues

---

### **Step 5: Test from Frontend**

Once the backend is working, test from your frontend:

**Check the browser console:**
```javascript
// Open browser console and run:
fetch('https://promptlingo-backend.onrender.com/api/health')
  .then(r => r.json())
  .then(d => console.log(d));
```

**Expected output:**
```json
{
  "status": "ok",
  "apis": {
    "elevenlabs": "working (X voices available)"
  }
}
```

---

### **Step 6: Check Your Frontend Environment Variable**

Your frontend `.env.production` should be:
```env
REACT_APP_API_URL=https://promptlingo-backend.onrender.com/api
```

**NOT:**
```env
REACT_APP_API_URL=https://promptlingo-backend.onrender.com/api/synthesize
```

The `/synthesize` is added automatically by the code.

---

## Common Issues & Solutions

### Issue 1: "API key not configured"
**Cause**: Environment variable not set on Render
**Solution**: 
1. Add `ELEVENLABS_API_KEY` in Render environment variables
2. Save and wait for redeploy
3. Check logs to confirm it's loaded

### Issue 2: "Invalid API key" (401 error)
**Cause**: API key is incorrect or has whitespace
**Solution**:
1. Go to https://elevenlabs.io/app/settings/api-keys
2. Copy your API key (or create a new one)
3. Update in Render (remove any quotes or spaces)
4. Save and redeploy

### Issue 3: "Cannot POST /api/synthesize/synthesize"
**Cause**: Frontend URL has duplicate `/synthesize`
**Solution**: 
- Set `REACT_APP_API_URL=https://promptlingo-backend.onrender.com/api`
- The code will append `/synthesize` automatically

### Issue 4: CORS errors
**Cause**: Frontend origin not allowed
**Solution**: Your backend already allows all Render and Netlify domains, so this shouldn't be an issue.

---

## Verification Checklist

- [ ] Environment variable `ELEVENLABS_API_KEY` is set on Render
- [ ] No quotes around the API key value
- [ ] No leading/trailing spaces in the API key
- [ ] Render service has been redeployed after setting the variable
- [ ] `/api/health` endpoint shows ElevenLabs as "working"
- [ ] Test script (`testApiKey.js`) passes all tests
- [ ] Frontend `REACT_APP_API_URL` ends with `/api` (not `/api/synthesize`)
- [ ] Browser console shows no CORS errors

---

## Quick Test Commands

**Test backend health:**
```bash
curl https://promptlingo-backend.onrender.com/api/health
```

**Test synthesize endpoint:**
```bash
curl -X POST https://promptlingo-backend.onrender.com/api/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","voiceId":"male-1","language":"en"}'
```

---

## Enhanced Logging

I've added enhanced logging to your backend. After deploying, you'll see:
```
🔊 [SYNTHESIZE] Request received
   - Text length: 11 characters
   - Voice ID: male-1
   - Original language: en
   - ElevenLabs language: en
   - API Key status: ✓ Present
   - API Key length: 32 characters
   - API Key preview: sk_12345...
   - Has whitespace: No
```

This will help identify if the API key is being read correctly.

---

## Final Recommendation

**Most likely fix:**
1. Double-check your ElevenLabs API key on https://elevenlabs.io/app/settings/api-keys
2. Copy it fresh (don't copy from Render, get it from ElevenLabs)
3. Go to Render → Environment → Update `ELEVENLABS_API_KEY`
4. Paste the key (no quotes, no spaces)
5. Save and wait for redeploy
6. Test with `/api/health` endpoint

If the issue persists after this, run the test script and share the output with me.
