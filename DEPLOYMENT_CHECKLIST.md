# ✅ Render Deployment Checklist - ElevenLabs Audio Fix

## 🎯 Quick Fix Summary
Your audio doesn't work on Render because:
1. ❌ Content Security Policy blocks ElevenLabs API
2. ❌ Environment variables not set on Render
3. ❌ Backend URL mismatch

---

## 📝 Step-by-Step Fix

### ✅ Step 1: Update Code (DONE)
- [x] Fixed `render.yaml` - Added ElevenLabs to CSP
- [x] Fixed `client/.env.production` - Corrected backend URL
- [ ] Commit and push changes:
```bash
git add render.yaml client/.env.production
git commit -m "Fix ElevenLabs audio on Render - CSP and URL updates"
git push origin main
```

### ✅ Step 2: Configure Render Environment Variables (CRITICAL!)

Go to: https://dashboard.render.com

#### Backend Service (`promptlingo-backend`):
1. Click on your backend service
2. Go to **Environment** tab
3. Click **Add Environment Variable**
4. Add these variables:

| Key | Value |
|-----|-------|
| `ELEVENLABS_API_KEY` | `your_elevenlabs_api_key_here` |
| `OPENAI_API_KEY` | `your_openai_api_key_here` |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |

5. Click **Save Changes** (this triggers auto-redeploy)

#### Frontend Service (`promptlingo-frontend`):
- Already configured in `render.yaml` ✅
- No action needed

### ✅ Step 3: Wait for Deployment
- Backend will redeploy automatically (2-5 minutes)
- Frontend will redeploy after you push code (2-5 minutes)
- Watch the logs in Render Dashboard

### ✅ Step 4: Verify Deployment

Run the test script:
```bash
./test-elevenlabs.sh
```

Or manually test:
```bash
# Test backend health
curl https://promptlingo-backend.onrender.com/api/health

# Should show:
# "elevenlabs": "working (XX voices available)"
```

### ✅ Step 5: Test in Browser
1. Open: https://promptlingo-frontend.onrender.com
2. Open DevTools → Console (F12)
3. Try to play audio
4. Check for:
   - ✅ No CORS errors
   - ✅ No CSP violations
   - ✅ Audio plays successfully

---

## 🔍 Troubleshooting

### Problem: "ElevenLabs API key not configured"
**Solution:** 
- Check Render Dashboard → Backend → Environment
- Verify `ELEVENLABS_API_KEY` is set
- Redeploy if needed

### Problem: CORS Error
**Solution:**
- Check `server/index.js` line 45
- Ensure `allowedOrigins` includes your frontend URL
- Should already be fixed with regex pattern

### Problem: CSP Violation
**Solution:**
- Verify `render.yaml` was pushed
- Check browser console for exact CSP error
- Ensure `https://api.elevenlabs.io` is in `connect-src`

### Problem: Audio doesn't play
**Solution:**
1. Open browser DevTools → Network tab
2. Look for `/api/synthesize` request
3. Check response:
   - Status should be 200
   - Response should contain `audioUrl`
4. Check Console for playback errors

---

## 📊 Expected Behavior

### Before Fix:
```
❌ CSP blocks ElevenLabs API
❌ "ElevenLabs API key not configured"
❌ Audio doesn't play
```

### After Fix:
```
✅ Backend calls ElevenLabs API
✅ Returns audio as base64
✅ Frontend plays audio
✅ User hears voice
```

---

## 🔒 Security Notes

- ✅ API keys stored in Render environment (not in code)
- ✅ API keys not committed to Git
- ✅ Backend proxies API calls (secure)
- ✅ Frontend never exposes API keys

---

## 📞 Need Help?

Check these logs:
1. **Render Dashboard** → Backend Service → Logs
2. **Browser Console** → DevTools (F12)
3. **Network Tab** → Check API requests

Look for:
- `🔑 API Keys Check:` in backend logs
- `✓ Set` next to ElevenLabs
- No errors in browser console

---

## 🎉 Success Indicators

You'll know it's working when:
- [x] Backend health shows: `"elevenlabs": "working"`
- [x] No CSP errors in browser console
- [x] Audio plays when you click the button
- [x] You hear the ElevenLabs voice

---

## 📝 Files Changed

- `render.yaml` - Updated CSP
- `client/.env.production` - Fixed backend URL
- Render Dashboard - Added environment variables

**Total time to fix: ~10 minutes**
