# 🚀 Quick Action Steps to Fix ElevenLabs Voice Error

## ⚠️ URGENT: Security First (Do This NOW!)

Your API key was exposed: `sk_3ea13a0ba0d0cc78c53ffeac035f043176cf2e745a716681`

**Revoke it immediately:**
1. Go to: https://elevenlabs.io/app/settings/api-keys
2. Find and delete the exposed key
3. Generate a new API key
4. **DO NOT share it again!**

---

## 📝 Follow These Steps in Order

### Step 1: Get Your New API Key Ready
- Generate new key at: https://elevenlabs.io/app/settings/api-keys
- Copy it to your clipboard

### Step 2: Get Valid Voice IDs

```bash
cd /Users/user/Desktop/buisnessPrompt

# Set your NEW API key temporarily for this command
export ELEVENLABS_API_KEY="your_new_key_here"

# Run the voice listing script
node server/utils/listVoices.js
```

**You'll see output like:**
```
1. Rachel
   ID: 21m00Tcm4TlvDq8ikWAM
   Gender: female

2. Antoni  
   ID: ErXwobaYiN019PkySvjV
   Gender: male
```

**Copy 2-4 voice IDs** that you want to use.

### Step 3: Update Voice Mapping in Code

Edit: `/Users/user/Desktop/buisnessPrompt/server/routes/synthesize.js`

Find this section (around line 74):
```javascript
const ELEVENLABS_VOICE_IDS = {
  'male-1': '21m00Tcm4TlvDq8ikWAM',   // Replace with your chosen male voice ID
  'female-1': 'EXAVITQu4vr4xnSDxMaL', // Replace with your chosen female voice ID
  'male-en': '21m00Tcm4TlvDq8ikWAM',  // Replace with your chosen male voice ID
  'female-en': 'EXAVITQu4vr4xnSDxMaL' // Replace with your chosen female voice ID
};

const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Replace with a default voice ID
```

**Replace the IDs** with the ones you copied from Step 2.

### Step 4: Set Environment Variable on Render

1. **Go to Render Dashboard:**
   - https://dashboard.render.com
   - Select your backend service

2. **Add Environment Variable:**
   - Click "Environment" (left sidebar)
   - Click "Add Environment Variable"
   - **Key:** `ELEVENLABS_API_KEY`
   - **Value:** Your new API key (paste it)
   - Click "Save Changes"

3. **Render will automatically redeploy** (wait 2-3 minutes)

### Step 5: Commit and Push Your Code Changes

```bash
cd /Users/user/Desktop/buisnessPrompt

# Add your changes
git add server/routes/synthesize.js

# Commit
git commit -m "fix: update ElevenLabs voice IDs with valid ones"

# Push to GitHub
git push origin main
```

Render will automatically deploy the new code.

### Step 6: Test Your App

1. **Wait for Render deployment** to complete (check dashboard)

2. **Open your app** in the browser

3. **Try the text-to-speech feature:**
   - Enter some text
   - Click the speak button
   - Audio should play! 🎉

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ No more `invalid_uid` errors in Render logs
- ✅ Audio plays in your browser
- ✅ Render logs show: `✅ [SYNTHESIZE] Completed in XXXms`

---

## 🆘 If It Still Doesn't Work

### Check Render Logs:

1. Go to Render dashboard
2. Click "Logs" tab
3. Look for errors

### Common Issues:

**Still seeing `invalid_uid`?**
- Double-check the voice IDs you entered match exactly what `listVoices.js` showed
- Make sure there are no extra spaces or quotes

**Seeing `Invalid API key`?**
- Verify the environment variable in Render is set correctly
- Make sure there are no extra spaces
- Try regenerating the API key

**Audio not playing?**
- Check browser console for errors
- Make sure your browser allows audio playback
- Try a different browser

---

## 📞 Need More Help?

See the full guide: `ELEVENLABS_SETUP_GUIDE.md`

Or check:
- ElevenLabs API Docs: https://elevenlabs.io/docs/api-reference
- Render Docs: https://render.com/docs/environment-variables
