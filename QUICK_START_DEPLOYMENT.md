# 🚀 Quick Start: Deploy Your App in 30 Minutes

## 📍 Current Status

✅ **Frontend:** Deployed on Netlify  
❌ **Backend:** Not deployed yet (needs to be done)  
❌ **Connection:** Frontend can't reach backend  

---

## 🎯 3 Simple Steps to Fix

### Step 1: Deploy Backend (15 min) 🖥️

**Go to:** [render.com](https://render.com)

1. Click **"Sign Up"** (use GitHub)
2. Click **"New +"** → **"Web Service"**
3. Select your **promptLingo** repository
4. Fill in:
   ```
   Name: promptlingo-backend
   Environment: Node
   Root Directory: server
   Build Command: npm install
   Start Command: npm start
   ```
5. Click **"Advanced"** → Add these variables:
   ```
   PORT = 3001
   NODE_ENV = production
   ```
6. Click **"Create Web Service"**
7. Wait 3-5 minutes for deployment
8. **COPY YOUR URL:** `https://promptlingo-backend-xxxx.onrender.com`

---

### Step 2: Configure Netlify (2 min) ⚙️

**Go to:** [app.netlify.com](https://app.netlify.com)

1. Click on your **promptLingo** site
2. Go to **Site settings** → **Environment variables**
3. Click **"Add a variable"**
4. Enter:
   ```
   Key: REACT_APP_API_URL
   Value: https://promptlingo-backend-xxxx.onrender.com/api
   ```
   ⚠️ **Don't forget `/api` at the end!**
5. Click **"Save"**

---

### Step 3: Redeploy & Test (5 min) ✅

**In Netlify:**

1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait 2-3 minutes

**Test Your Site:**

1. Visit your Netlify URL
2. Click **"Allow"** when asked for microphone
3. Click **Record** button
4. Speak for 3-5 seconds
5. Check if transcription appears

**✅ If it works:** Congratulations! 🎉  
**❌ If it doesn't:** See troubleshooting below

---

## 🐛 Quick Troubleshooting

### Problem: "Cannot connect to server"

**Check these:**
1. Is backend deployed? Visit `https://your-backend.onrender.com/api/health`
2. Is `REACT_APP_API_URL` set in Netlify?
3. Did you redeploy Netlify after setting the variable?
4. Does the URL end with `/api`?

**Fix:**
- Go back to Step 2 and verify the environment variable
- Make sure to redeploy in Step 3

---

### Problem: Microphone permission denied

**Check these:**
1. Did you click "Allow" when browser asked?
2. Check browser permissions (click lock icon in address bar)

**Fix:**
- Click lock icon → Site settings → Reset permissions
- Refresh page and allow microphone again

---

### Problem: Backend is slow (30-60 seconds)

**This is normal for Render free tier!**
- First request wakes up the backend (cold start)
- Subsequent requests are fast
- Upgrade to paid ($7/month) to eliminate cold starts

---

## 📊 Visual Guide

```
┌─────────────────────────────────────────────────────────┐
│                    YOUR DEPLOYMENT                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (Netlify)                                      │
│  https://your-site.netlify.app                          │
│         │                                                │
│         │ REACT_APP_API_URL                             │
│         │                                                │
│         ▼                                                │
│  Backend (Render)                                        │
│  https://promptlingo-backend.onrender.com/api           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist

- [ ] Backend deployed to Render
- [ ] Backend URL copied
- [ ] `REACT_APP_API_URL` set in Netlify
- [ ] Netlify site redeployed
- [ ] Microphone permission granted
- [ ] Audio recording works
- [ ] Transcription works
- [ ] Translation works

---

## 🎉 Success Indicators

You'll know it's working when:

1. ✅ No "Cannot connect to server" errors
2. ✅ Microphone permission granted
3. ✅ Audio recording shows waveform
4. ✅ Transcription appears after recording
5. ✅ Translation works
6. ✅ No red errors in browser console

---

## 📚 Need More Help?

- **Backend deployment:** See `BACKEND_DEPLOYMENT_GUIDE.md`
- **Detailed checklist:** See `NETLIFY_DEPLOYMENT_CHECKLIST.md`
- **Complete summary:** See `DEPLOYMENT_FIXES_SUMMARY.md`

---

## 💡 Pro Tip

**Test locally first:**
```bash
# Terminal 1: Start backend
cd server
npm start

# Terminal 2: Start frontend
cd client
npm start
```

If it works locally but not in production, the issue is with environment variables.

---

**Ready? Let's deploy!** 🚀

Start with Step 1 above and you'll be done in 30 minutes!
