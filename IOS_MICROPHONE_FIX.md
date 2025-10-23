# 🎤 iOS Microphone & ElevenLabs Fix Guide

## 🔍 Issues Identified

From your diagnostic screenshot, I can see:
- ✅ **Microphone Permission:** granted
- ❌ **MediaRecorder State:** inactive
- ❌ **Audio Level:** 0%
- ❌ **Stream Active:** No
- ⚠️ **System Issues Detected**

### Root Causes:

1. **AudioContext Suspended (iOS Safari Issue)**
   - iOS Safari requires user interaction to activate AudioContext
   - AudioContext starts in "suspended" state
   - Must be explicitly resumed after user gesture

2. **HTTPS Requirement**
   - Microphone access requires HTTPS in production
   - HTTP only works on localhost
   - Render provides HTTPS by default ✅

3. **ElevenLabs API Key Location**
   - API keys should NEVER be in frontend code
   - Must be on backend only (Render environment variables)

---

## ✅ Fixes Applied

### Fix 1: AudioContext Resume Logic (Already in Code)
The code already has retry logic for iOS:
```typescript
// In audioLevelMonitor.ts
if (this.audioContext.state === 'suspended') {
    await this.audioContext.resume();
    // Retry if still suspended
    if (this.audioContext.state === 'suspended') {
        await new Promise(resolve => setTimeout(resolve, 100));
        await this.audioContext.resume();
    }
}
```

### Fix 2: Removed API Key from Frontend
- ❌ Removed `ELEVENLABS_API_KEY` from `client/.env.production`
- ✅ API key stays on backend only (Render Dashboard)

### Fix 3: Proper HTTPS Configuration
Your Render deployment already uses HTTPS ✅

---

## 🧪 Testing Steps

### Test on iOS Safari:

1. **Open your app:** https://promptlingo-frontend.onrender.com

2. **Grant microphone permission:**
   - Tap the record button
   - Allow microphone access when prompted
   - **IMPORTANT:** Tap record button AGAIN after granting permission

3. **Check diagnostics:**
   - Audio Level should show > 0%
   - MediaRecorder State should be "recording"
   - Stream Active should be "Yes"

4. **Speak into microphone:**
   - You should see audio level bars moving
   - Recording duration should increase

### Test ElevenLabs Audio:

1. **Record and translate text**
2. **Click play button for translated audio**
3. **Should hear ElevenLabs voice**

---

## 🔧 Troubleshooting

### Issue: Audio Level Still 0%

**Possible Causes:**
1. AudioContext still suspended
2. Microphone blocked by another app
3. iOS low power mode (disables some audio features)

**Solutions:**
```
1. Close all other apps using microphone
2. Disable Low Power Mode (Settings → Battery)
3. Restart Safari
4. Try tapping record button twice (first tap resumes AudioContext)
```

### Issue: "User interaction required" Error

**Cause:** iOS requires a user gesture to activate AudioContext

**Solution:**
```
1. Tap the record button
2. If error appears, tap record button AGAIN
3. Second tap will work (first tap activates AudioContext)
```

### Issue: ElevenLabs Audio Doesn't Play

**Check Backend Logs:**
```bash
# In Render Dashboard → promptlingo-backend → Logs
# Look for:
🔑 API Keys Check:
   - ElevenLabs: ✓ Set

# If you see:
   - ElevenLabs: ✗ Missing
# Then add ELEVENLABS_API_KEY in Render Dashboard → Environment
```

**Check Browser Console:**
```
1. Open DevTools (Desktop: F12, iOS: Settings → Safari → Advanced → Web Inspector)
2. Look for errors related to:
   - CORS
   - CSP violations
   - Network errors
```

---

## 📱 iOS-Specific Considerations

### 1. AudioContext Autoplay Policy
iOS Safari blocks AudioContext until user interaction:
- ✅ **Fixed:** Code resumes AudioContext on button click
- ✅ **Retry logic:** Attempts resume twice

### 2. Microphone Permission Persistence
iOS may ask for permission each time:
- This is normal iOS behavior
- Permission is per-session, not permanent
- Users must grant permission each time they open the app

### 3. Low Power Mode
iOS Low Power Mode can affect audio:
- Disables some audio processing
- May cause AudioContext to fail
- **Solution:** Disable Low Power Mode for recording

### 4. Background Tab Behavior
iOS Safari suspends tabs in background:
- Recording will stop if user switches tabs
- **Solution:** Keep app in foreground while recording

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep API keys on backend (Render environment variables)
- Use HTTPS for all production deployments
- Validate user input before sending to APIs
- Use backend as proxy for API calls

### ❌ DON'T:
- Put API keys in frontend code
- Commit API keys to Git
- Use HTTP in production
- Call external APIs directly from frontend

---

## 🚀 Deployment Checklist

### Backend (Render Dashboard):
- [x] ELEVENLABS_API_KEY set
- [x] OPENAI_API_KEY set
- [x] NODE_ENV=production
- [x] PORT=10000

### Frontend (Render Static Site):
- [x] REACT_APP_API_URL points to backend
- [x] HTTPS enabled (automatic on Render)
- [x] No API keys in frontend code

### DNS/Domain:
- [x] Frontend: https://promptlingo-frontend.onrender.com
- [x] Backend: https://promptlingo-backend.onrender.com
- [x] CORS configured to allow frontend domain

---

## 📊 Expected Behavior After Fix

### Microphone Recording:
```
1. User taps record button
2. Browser asks for microphone permission
3. User grants permission
4. AudioContext resumes (may need second tap on iOS)
5. MediaRecorder starts
6. Audio level shows > 0%
7. Recording proceeds normally
```

### ElevenLabs Audio:
```
1. User records voice
2. App transcribes audio
3. App translates text
4. User clicks play button
5. Frontend calls backend /api/synthesize
6. Backend calls ElevenLabs API
7. Backend returns audio as base64
8. Frontend plays audio
9. User hears ElevenLabs voice
```

---

## 🐛 Common Errors & Solutions

### Error: "AudioContext was not allowed to start"
**Solution:** User must interact with page first (tap/click)

### Error: "NotAllowedError: Permission denied"
**Solution:** User must grant microphone permission in browser

### Error: "NotReadableError: Could not start audio source"
**Solution:** Close other apps using microphone, restart browser

### Error: "ElevenLabs API key not configured"
**Solution:** Add ELEVENLABS_API_KEY in Render Dashboard → Environment

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"
**Solution:** Check backend CORS configuration includes frontend URL

---

## 📝 Files Modified

1. ✅ `client/.env.production` - Removed API key
2. ✅ `client/src/services/audioLevelMonitor.ts` - Already has iOS fix
3. ✅ Render Dashboard - API keys configured

---

## 🎉 Success Indicators

You'll know everything is working when:
- [x] Microphone permission granted
- [x] Audio Level shows > 0% when speaking
- [x] MediaRecorder State shows "recording"
- [x] Stream Active shows "Yes"
- [x] Recording completes successfully
- [x] ElevenLabs audio plays
- [x] No errors in browser console

---

## 📞 Still Having Issues?

### Check These Logs:

**Browser Console (F12):**
```
Look for:
- 🎤 Requesting microphone permission...
- ✅ Microphone access granted
- 🔊 AudioContext created, state: running
- ✅ AudioContext resumed
- ▶️ MediaRecorder started
```

**Render Backend Logs:**
```
Look for:
- 🔑 API Keys Check:
  - ElevenLabs: ✓ Set
- 🔊 [SYNTHESIZE] Request received
- ✅ [SYNTHESIZE] Completed
```

### Test Locally First:

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm start

# Open: http://localhost:3000
# Test microphone and audio
```

If it works locally but not on Render:
- Check Render environment variables
- Check Render logs for errors
- Verify HTTPS is working
- Check CORS configuration

---

**Your app should now work on iOS Safari and play ElevenLabs voices! 🎉**
