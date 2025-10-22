# 🚀 Backend Deployment Guide

Your frontend is deployed on Netlify, but you need to deploy the backend separately. Here are your options:

---

## 📊 Backend Deployment Options Comparison

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| **Render** | Free tier, auto-deploy from Git, easy setup | Cold starts on free tier | Most users |
| **Railway** | Fast, modern UI, generous free tier | Requires credit card | Power users |
| **Heroku** | Well-documented, mature platform | No free tier anymore | Paid deployments |
| **Fly.io** | Edge deployment, fast | More complex setup | Advanced users |

---

## ⭐ RECOMMENDED: Deploy to Render (Free)

### Step 1: Prepare Your Backend

1. **Ensure your `server/` directory has these files:**
   ```
   server/
   ├── index.js (or app.js)
   ├── package.json
   └── .env.example
   ```

2. **Update `server/package.json` to include start script:**
   ```json
   {
     "scripts": {
       "start": "node index.js",
       "dev": "nodemon index.js"
     }
   }
   ```

3. **Update CORS in `server/index.js`:**
   ```javascript
   const cors = require('cors');
   
   app.use(cors({
     origin: [
       'http://localhost:3000',
       'https://your-netlify-site.netlify.app'  // Add your Netlify URL
     ],
     credentials: true
   }));
   ```

### Step 2: Deploy to Render

1. **Go to [Render.com](https://render.com)** and sign up/login

2. **Click "New +" → "Web Service"**

3. **Connect your GitHub repository**

4. **Configure the service:**
   ```
   Name: promptlingo-backend (or your choice)
   Environment: Node
   Region: Choose closest to your users
   Branch: main
   Root Directory: server
   Build Command: npm install
   Start Command: npm start
   ```

5. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"
   ```
   PORT=3001
   NODE_ENV=production
   OPENAI_API_KEY=your_key_here (if needed)
   ELEVENLABS_API_KEY=your_key_here (if needed)
   ```

6. **Click "Create Web Service"**

7. **Wait for deployment** (usually 2-5 minutes)

8. **Copy your Render URL** (e.g., `https://promptlingo-backend.onrender.com`)

### Step 3: Update Netlify Environment Variables

1. **Go to Netlify Dashboard** → Your Site → Site Settings → Environment Variables

2. **Add this variable:**
   ```
   Key: REACT_APP_API_URL
   Value: https://promptlingo-backend.onrender.com/api
   ```

3. **Click "Save"**

4. **Trigger a new deploy:**
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"

### Step 4: Test Your Deployment

1. Visit your Netlify site
2. Try recording audio
3. Check browser console for any errors
4. Verify API calls are going to your Render backend

---

## 🔄 Alternative: Deploy to Railway

### Quick Setup:

1. **Go to [Railway.app](https://railway.app)**

2. **Click "Start a New Project" → "Deploy from GitHub repo"**

3. **Select your repository**

4. **Configure:**
   ```
   Root Directory: server
   Start Command: npm start
   ```

5. **Add Environment Variables** in Railway dashboard

6. **Get your Railway URL** and update Netlify env vars

---

## 🔧 Alternative: Deploy to Fly.io

### Quick Setup:

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Navigate to server directory
cd server

# Launch app
flyctl launch

# Deploy
flyctl deploy

# Get your URL
flyctl info
```

Update Netlify environment variables with your Fly.io URL.

---

## 🎯 After Backend Deployment Checklist

- [ ] Backend is deployed and accessible
- [ ] CORS is configured to allow your Netlify domain
- [ ] Environment variables are set in backend
- [ ] `REACT_APP_API_URL` is set in Netlify
- [ ] Netlify site has been redeployed
- [ ] Test audio recording functionality
- [ ] Test translation functionality
- [ ] Check browser console for errors

---

## 🐛 Troubleshooting

### Issue: CORS Errors

**Solution:** Update your backend CORS configuration:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-site.netlify.app',
    'https://*.netlify.app'  // Allow all Netlify preview deploys
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Issue: Backend Cold Starts (Render Free Tier)

**Problem:** Backend sleeps after 15 minutes of inactivity

**Solutions:**
1. Upgrade to paid tier ($7/month)
2. Use a ping service like [UptimeRobot](https://uptimerobot.com) to keep it awake
3. Show a loading message to users on first request

### Issue: Environment Variables Not Working

**Check:**
1. Variables are set in Render/Railway dashboard
2. Variables don't have quotes around them
3. Backend has been redeployed after adding variables
4. Frontend has been redeployed after updating `REACT_APP_API_URL`

### Issue: 502 Bad Gateway

**Causes:**
- Backend crashed (check Render logs)
- Wrong port configuration
- Build failed

**Solution:** Check backend logs in Render dashboard

---

## 📝 Important Notes

### Free Tier Limitations:

**Render Free Tier:**
- ✅ 750 hours/month
- ✅ Auto-deploy from Git
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Cold start: 30-60 seconds

**Railway Free Tier:**
- ✅ $5 free credit/month
- ✅ No sleep/cold starts
- ⚠️ Requires credit card
- ⚠️ Limited to ~500 hours

### Production Recommendations:

For production use, consider:
1. **Paid hosting** ($7-10/month) to avoid cold starts
2. **Database** if you need to store user data
3. **CDN** for faster global access
4. **Monitoring** (e.g., Sentry, LogRocket)
5. **Rate limiting** to prevent abuse

---

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Fly.io Documentation](https://fly.io/docs)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

---

## ✅ Quick Start Commands

```bash
# Test backend locally first
cd server
npm install
npm start

# Should see: Server running on port 3001

# Test API endpoint
curl http://localhost:3001/api/health

# If working, proceed with deployment
```

---

**Need help?** Check the troubleshooting section or create an issue in your repository.
