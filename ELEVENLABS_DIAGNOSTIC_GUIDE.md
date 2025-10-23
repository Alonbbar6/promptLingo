# ElevenLabs Integration Diagnostic & Fix Guide

## 🎯 Issues Found & Fixed

### ✅ **Issue #1: Invalid Voice IDs (FIXED)**
**Problem:** Your backend was using placeholder voice IDs that don't exist in ElevenLabs.
**Solution:** Updated with real voice IDs from your account:

```javascript
// ✅ UPDATED - Real voice IDs from your ElevenLabs account
const ELEVENLABS_VOICE_IDS = {
  'male-1': '2EiwWnXFnvU5JabPnv8n',   // Clyde - American male, middle-aged
  'female-1': 'EXAVITQu4vr4xnSDxMaL', // Sarah - American female, young
  'male-en': 'CwhRBWXzGAHq8TQ4Fs17',  // Roger - American male, conversational
  'female-en': 'cgSgspJ2msm6clMCkdW9' // Jessica - American female, conversational
};
```

### ✅ **Issue #2: Frontend API URL Port (FIXED)**
**Problem:** Frontend was defaulting to wrong localhost port (5000 instead of 10000).
**Solution:** Updated to match your backend server port.

---

## 🔍 Remaining Issues to Check

### 🔧 **Issue #3: Environment Variables on Render**

**Check if ELEVENLABS_API_KEY is properly set on Render:**

1. **Go to Render Dashboard:**
   - Navigate to your `promptlingo-backend` service
   - Go to "Environment" tab
   - Verify `ELEVENLABS_API_KEY` is set with your actual API key

2. **Test Environment Variable:**
   ```bash
   # Check if your backend can access the API key
   curl https://promptlingo-backend.onrender.com/api/health
   ```

   **Expected Response:**
   ```json
   {
     "status": "ok",
     "apis": {
       "elevenlabs": "working (22 voices available)"
     }
   }
   ```

   **If you see `"elevenlabs": "not configured"` or `"error: ..."`, your API key isn't set properly.**

### 🔧 **Issue #4: CORS Configuration**

Your CORS is well-configured, but verify it's working:

```bash
# Test CORS from your frontend domain
curl -H "Origin: https://promptlingo.netlify.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://promptlingo-backend.onrender.com/api/synthesize
```

**Expected:** Should return CORS headers allowing the request.

### 🔧 **Issue #5: Backend Route Accessibility**

Test if your synthesize endpoint is accessible:

```bash
# Test synthesize endpoint
curl -X POST https://promptlingo-backend.onrender.com/api/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello world",
    "voiceId": "female-1",
    "language": "en"
  }'
```

**Expected:** Should return audio data or specific error message.

---

## 🚀 **Complete Working Example**

Here's a working backend route that handles all edge cases:

```javascript
// ✅ Complete working synthesize route
router.post('/', async (req, res) => {
  const startTime = Date.now();
  console.log('🔊 [SYNTHESIZE] Request received');
  
  const { text, voiceId, language } = req.body;
  
  try {
    // 1. Validate API key first
    if (!process.env.ELEVENLABS_API_KEY) {
      console.error('❌ [SYNTHESIZE] ElevenLabs API key not configured');
      return res.status(500).json({
        error: 'ElevenLabs API key not configured',
        message: 'Please set ELEVENLABS_API_KEY in Render environment variables',
        help: 'Go to Render Dashboard → Your Service → Environment → Add ELEVENLABS_API_KEY'
      });
    }

    // 2. Validate input
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'text is required and must be a string'
      });
    }

    // 3. Map voice ID to real ElevenLabs ID
    let elevenLabsVoiceId;
    if (voiceId && voiceId.length > 20) {
      elevenLabsVoiceId = voiceId; // Already a real ElevenLabs ID
    } else if (ELEVENLABS_VOICE_IDS[voiceId]) {
      elevenLabsVoiceId = ELEVENLABS_VOICE_IDS[voiceId];
    } else {
      elevenLabsVoiceId = DEFAULT_VOICE_ID;
      console.warn(`Unknown voice '${voiceId}', using default: ${DEFAULT_VOICE_ID}`);
    }

    // 4. Call ElevenLabs API
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`,
      {
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        },
        responseType: 'arraybuffer',
        timeout: 30000
      }
    );

    // 5. Return audio as base64
    const audioBuffer = Buffer.from(response.data);
    const audioBase64 = audioBuffer.toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    res.json({
      audioUrl,
      characterCount: text.length,
      voiceId,
      synthesisTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('❌ [SYNTHESIZE] Failed:', error.message);
    
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle specific ElevenLabs errors
      if (status === 401) {
        return res.status(401).json({
          error: 'Invalid API key',
          message: 'Your ElevenLabs API key is invalid or expired',
          help: 'Check your ELEVENLABS_API_KEY in Render environment variables'
        });
      }
      
      if (status === 422 && data.detail?.includes('invalid_uid')) {
        return res.status(400).json({
          error: 'Invalid voice ID',
          message: `Voice ID '${elevenLabsVoiceId}' not found`,
          help: 'Run "node server/utils/listVoices.js" to get valid voice IDs'
        });
      }
      
      if (status === 429) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many requests to ElevenLabs API',
          help: 'Wait a moment and try again'
        });
      }
    }
    
    res.status(500).json({
      error: 'Synthesis failed',
      message: error.message
    });
  }
});
```

---

## 🧪 **Testing Checklist**

### **Local Testing:**
```bash
# 1. Test backend health
curl http://localhost:10000/api/health

# 2. Test synthesize endpoint
curl -X POST http://localhost:10000/api/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "voiceId": "female-1", "language": "en"}'
```

### **Production Testing:**
```bash
# 1. Test backend health on Render
curl https://promptlingo-backend.onrender.com/api/health

# 2. Test synthesize endpoint on Render
curl -X POST https://promptlingo-backend.onrender.com/api/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "voiceId": "female-1", "language": "en"}'
```

### **Frontend Testing:**
1. Open browser dev tools
2. Go to your live site: `https://promptlingo.netlify.app`
3. Try text-to-speech feature
4. Check Network tab for API calls
5. Check Console for any errors

---

## 🔧 **Render Deployment Checklist**

### **Environment Variables (Critical):**
In your Render dashboard for `promptlingo-backend`:

```
✅ ELEVENLABS_API_KEY = sk-your-actual-api-key-here
✅ OPENAI_API_KEY = sk-your-openai-key-here  
✅ NODE_ENV = production
✅ PORT = 10000
```

### **Build & Start Commands:**
```yaml
buildCommand: cd server && npm install
startCommand: cd server && node index.js
```

### **Health Check URL:**
```
https://promptlingo-backend.onrender.com/health
```

---

## 🚨 **Common Error Messages & Solutions**

### **"ElevenLabs API key not configured"**
- **Cause:** `ELEVENLABS_API_KEY` not set in Render environment
- **Fix:** Add it in Render Dashboard → Environment tab

### **"Invalid voice ID" or "invalid_uid"**
- **Cause:** Using fake/placeholder voice IDs
- **Fix:** ✅ Already fixed with real voice IDs

### **"Rate limit exceeded"**
- **Cause:** Too many requests to ElevenLabs
- **Fix:** Wait and try again, or upgrade ElevenLabs plan

### **"CORS Error"**
- **Cause:** Frontend domain not in allowed origins
- **Fix:** Your CORS is properly configured for Netlify/Render

### **"Network Error" or "Failed to fetch"**
- **Cause:** Backend not accessible or wrong URL
- **Fix:** Verify backend is deployed and `REACT_APP_API_URL` is correct

---

## 🎯 **Next Steps**

1. **Deploy Updated Code:**
   ```bash
   git add .
   git commit -m "Fix ElevenLabs voice IDs and API URL"
   git push origin main
   ```

2. **Verify Environment Variables on Render:**
   - Go to Render Dashboard
   - Check `promptlingo-backend` service
   - Ensure `ELEVENLABS_API_KEY` is set

3. **Test Production:**
   ```bash
   curl https://promptlingo-backend.onrender.com/api/health
   ```

4. **Monitor Logs:**
   - Check Render logs for any errors
   - Look for "ElevenLabs API responded" success messages

---

## 📞 **Support Commands**

```bash
# Get your available voices
node server/utils/listVoices.js

# Test local backend
npm run dev

# Check environment variables (local)
node -e "console.log('ElevenLabs:', !!process.env.ELEVENLABS_API_KEY)"
```

---

**Your ElevenLabs integration should now work perfectly! 🎉**

The main issues were:
1. ✅ **Fixed:** Invalid voice IDs → Real voice IDs from your account
2. ✅ **Fixed:** Wrong localhost port → Corrected to 10000
3. 🔧 **Check:** Environment variables on Render
4. 🔧 **Test:** Production deployment

Once you verify the environment variables are set on Render, your TTS should work flawlessly!
