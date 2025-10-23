# ElevenLabs Voice Setup Guide

## 🚨 CRITICAL: API Key Security

**Your API key was exposed in the chat. Take immediate action:**

1. **Revoke the exposed key:**
   - Go to https://elevenlabs.io/app/settings/api-keys
   - Find key: `sk_3ea13a0ba0d0cc78c53ffeac035f043176cf2e745a716681`
   - Click "Delete" or "Revoke"

2. **Generate a new API key:**
   - Click "Create API Key"
   - Copy the new key immediately (you won't see it again)
   - Store it securely

---

## 📋 Step-by-Step Setup

### 1. Get Valid ElevenLabs Voice IDs

The error `invalid_uid` means "male-en" is not a real ElevenLabs voice ID. Real voice IDs look like: `21m00Tcm4TlvDq8ikWAM`

**Run this command to list all available voices:**

```bash
cd /Users/user/Desktop/buisnessPrompt
node server/utils/listVoices.js
```

This will output all available voices with their IDs, names, and characteristics.

**Example output:**
```
✅ Found 30 voices:

1. Rachel
   ID: 21m00Tcm4TlvDq8ikWAM
   Category: premade
   Gender: female
   Age: young
   Accent: american

2. Antoni
   ID: ErXwobaYiN019PkySvjV
   Category: premade
   Gender: male
   Age: young
   Accent: american
```

### 2. Update Voice ID Mapping

Edit `/server/routes/synthesize.js` and replace the placeholder IDs:

```javascript
const ELEVENLABS_VOICE_IDS = {
  'male-1': 'YOUR_MALE_VOICE_ID_HERE',      // e.g., 'ErXwobaYiN019PkySvjV'
  'female-1': 'YOUR_FEMALE_VOICE_ID_HERE',  // e.g., '21m00Tcm4TlvDq8ikWAM'
  'male-en': 'YOUR_MALE_VOICE_ID_HERE',
  'female-en': 'YOUR_FEMALE_VOICE_ID_HERE'
};

const DEFAULT_VOICE_ID = 'YOUR_DEFAULT_VOICE_ID'; // Fallback voice
```

**Recommended voices for multilingual support:**
- Look for voices with `use_case: multilingual` or `language: multilingual`
- These work best for Haitian Creole and other languages

### 3. Set Up Environment Variables Locally

Create or update `/server/.env`:

```bash
# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_new_api_key_here

# Other environment variables
PORT=10000
NODE_ENV=production
```

**Test locally:**
```bash
cd /Users/user/Desktop/buisnessPrompt
npm run dev
```

### 4. Configure Render Environment Variables

**⚠️ NEVER commit API keys to Git!**

#### On Render Dashboard:

1. **Go to your service:**
   - Navigate to https://dashboard.render.com
   - Select your backend service (promptLingo-backend or similar)

2. **Add Environment Variable:**
   - Click "Environment" in the left sidebar
   - Click "Add Environment Variable"
   - Key: `ELEVENLABS_API_KEY`
   - Value: `your_new_api_key_here`
   - Click "Save Changes"

3. **Trigger Redeploy:**
   - Render will automatically redeploy with the new environment variable
   - Or click "Manual Deploy" → "Deploy latest commit"

#### Verify Environment Variable:

Check your Render logs for:
```
✅ ElevenLabs API key configured
```

If you see:
```
❌ ElevenLabs API key not configured
```
The environment variable is not set correctly.

### 5. Test the Fix

#### Test API Endpoint:

```bash
curl -X POST https://your-app.onrender.com/api/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test",
    "voiceId": "male-en",
    "language": "en"
  }'
```

**Expected response:**
```json
{
  "audioUrl": "data:audio/mpeg;base64,//uQx...",
  "characterCount": 22,
  "voiceId": "male-en",
  "originalLanguage": "en",
  "elevenLabsLanguage": "en",
  "synthesisTime": 1234
}
```

#### Test in Frontend:

1. Open your app in the browser
2. Enter some text
3. Click the speak button
4. Audio should play successfully

---

## 🔧 Troubleshooting

### Error: `invalid_uid`

**Cause:** The voice ID doesn't exist in your ElevenLabs account.

**Fix:**
1. Run `node server/utils/listVoices.js`
2. Copy a valid voice ID from the output
3. Update `ELEVENLABS_VOICE_IDS` in `server/routes/synthesize.js`
4. Redeploy

### Error: `Invalid API key` (401)

**Cause:** API key is wrong or not set.

**Fix:**
1. Check Render environment variables
2. Verify the key starts with `sk_`
3. Make sure there are no extra spaces or quotes
4. Regenerate the key if needed

### Error: `Rate limit exceeded` (429)

**Cause:** Too many requests to ElevenLabs API.

**Fix:**
- Wait a few minutes
- Upgrade your ElevenLabs plan for higher limits
- Implement caching for frequently used phrases

### Audio doesn't play in frontend

**Cause:** Frontend might not be handling the audio URL correctly.

**Fix:** Check that `textToSpeech.ts` service is using the `audioUrl` from the response:

```typescript
const audio = new Audio(data.audioUrl);
await audio.play();
```

---

## 📊 Current Setup Status

### ✅ Completed:
- [x] Backend route `/api/synthesize` with voice ID mapping
- [x] Intelligent voice ID fallback system
- [x] Better error handling with helpful messages
- [x] Utility script to list available voices
- [x] Voice endpoint `/api/voices` to fetch from ElevenLabs

### ⚠️ Action Required:
- [ ] **URGENT:** Revoke exposed API key
- [ ] Generate new API key
- [ ] Run `listVoices.js` to get valid voice IDs
- [ ] Update `ELEVENLABS_VOICE_IDS` mapping
- [ ] Set `ELEVENLABS_API_KEY` in Render environment variables
- [ ] Test the app on Render

---

## 🎯 Quick Fix Checklist

1. **Secure your API key:**
   ```bash
   # Revoke old key at: https://elevenlabs.io/app/settings/api-keys
   # Generate new key
   ```

2. **Get voice IDs:**
   ```bash
   node server/utils/listVoices.js
   ```

3. **Update code:**
   - Edit `server/routes/synthesize.js`
   - Replace voice IDs in `ELEVENLABS_VOICE_IDS`

4. **Set Render env var:**
   - Dashboard → Environment → Add `ELEVENLABS_API_KEY`

5. **Deploy:**
   ```bash
   git add .
   git commit -m "fix: update ElevenLabs voice IDs"
   git push origin main
   ```

6. **Test:**
   - Wait for Render deployment
   - Try speaking in your app

---

## 📚 Additional Resources

- **ElevenLabs API Docs:** https://elevenlabs.io/docs/api-reference
- **Voice Library:** https://elevenlabs.io/voice-library
- **Render Environment Variables:** https://render.com/docs/environment-variables
- **Your listVoices utility:** `/server/utils/listVoices.js`

---

## 💡 Pro Tips

1. **Use multilingual voices** for Haitian Creole - they handle French-based languages better
2. **Cache voice lists** - don't fetch from ElevenLabs API on every request
3. **Set up monitoring** - track API usage to avoid rate limits
4. **Test locally first** - always verify changes work before deploying to Render

---

**Need help?** Check the Render logs for detailed error messages:
```bash
# View logs in Render dashboard or via CLI
render logs -f
```
