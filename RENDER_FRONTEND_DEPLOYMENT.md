# Render Deployment Guide for PromptLingo Frontend

## 🚀 Overview

This guide will help you migrate your React frontend from Netlify to Render. Your backend is already deployed on Render, so we'll create a new static site service for the frontend.

## 📋 Prerequisites

- ✅ Backend already deployed on Render (promptlingo-backend)
- ✅ GitHub repository with your code
- ✅ Render account (free tier available)

## 🔧 Step 1: Create New Static Site on Render

### Option A: Using Render Dashboard (Recommended)

1. **Go to:** [dashboard.render.com](https://dashboard.render.com)
2. **Click:** "New +" → "Static Site"
3. **Connect your repository:**
   - Select your GitHub repository
   - Choose the branch (usually `main`)

4. **Configure the service:**
   ```
   Name: promptlingo-frontend
   Branch: main
   Root Directory: (leave empty)
   Build Command: cd client && npm install && npm run build
   Publish Directory: client/build
   ```

5. **Add Environment Variables:**
   ```
   REACT_APP_API_URL = https://your-backend-name.onrender.com/api
   ```
   ⚠️ **Important:** Replace `your-backend-name` with your actual backend service name

6. **Click:** "Create Static Site"

### Option B: Using render.yaml (Advanced)

If you prefer infrastructure as code, use the `render.yaml` file I created. This will deploy both frontend and backend services.

1. **Commit the render.yaml file:**
   ```bash
   git add render.yaml
   git commit -m "Add Render configuration"
   git push origin main
   ```

2. **In Render Dashboard:**
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Render will automatically detect and use the `render.yaml` file

## 🔧 Step 2: Configure Custom Headers

Render will automatically apply the headers defined in `render.yaml`, but you can also configure them manually:

### Security Headers
- `Permissions-Policy: microphone=(self), camera=(self)`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`

### WASM Support Headers
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`
- `Content-Type: application/wasm` (for .wasm files)

### Caching Headers
- `Cache-Control: public, max-age=31536000, immutable` (for static assets)

## 🔧 Step 3: Update Backend CORS (if needed)

Your backend should already allow your new Render frontend URL. If not, update the CORS configuration in `server/index.js`:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://promptlingo.netlify.app', // Keep old Netlify URL temporarily
    'https://promptlingo-frontend.onrender.com', // Add new Render URL
    /^https:\/\/.*\.onrender\.com$/ // Allow all Render preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

## 🔧 Step 4: Test Your Deployment

### 1. Check Frontend Deployment
- Visit your new Render frontend URL
- Should load without errors
- Check browser console for any issues

### 2. Test API Connection
- Open browser console (F12)
- Try using the app (record audio or input text)
- Check Network tab - API calls should go to your Render backend

### 3. Test WASM Loading
- Check if WASM files load correctly
- Look for CORS errors in console

## 🔧 Step 5: Update DNS (if using custom domain)

If you're using a custom domain:

1. **In Render Dashboard:**
   - Go to your frontend service
   - Click "Settings" → "Custom Domains"
   - Add your domain

2. **Update DNS:**
   - Point your domain to Render's IP
   - Render will provide the exact DNS settings

## 🔧 Step 6: Clean Up Netlify (Optional)

Once everything is working on Render:

1. **Test thoroughly** on Render
2. **Update any documentation** with new URLs
3. **Delete Netlify site** (if no longer needed)

## 📊 Comparison: Netlify vs Render

| Feature | Netlify | Render |
|---------|---------|--------|
| **Free Tier** | ✅ Generous | ✅ Good |
| **Build Time** | 300 min/month | 750 hours/month |
| **Bandwidth** | 100 GB/month | 100 GB/month |
| **Custom Headers** | ✅ Easy | ✅ Easy |
| **Environment Variables** | ✅ Easy | ✅ Easy |
| **Preview Deployments** | ✅ Automatic | ✅ Automatic |
| **WASM Support** | ✅ Good | ✅ Good |
| **CORS Handling** | ✅ Good | ✅ Good |

## 🐛 Troubleshooting

### Issue: Build fails with "Cannot find module"
**Solution:** Ensure `cd client &&` is in the build command

### Issue: 404 on routes
**Solution:** Ensure SPA redirect is configured (included in render.yaml)

### Issue: WASM files not loading
**Solution:** Check CORS headers are properly set

### Issue: API calls failing
**Solution:** 
1. Verify `REACT_APP_API_URL` environment variable
2. Check backend CORS allows your frontend URL
3. Ensure backend is running

### Issue: Slow first load
**Solution:** This is normal for Render free tier (cold starts)

## 📝 Environment Variables Reference

### Frontend (Render Static Site)
```
REACT_APP_API_URL = https://your-backend-name.onrender.com/api
```

### Backend (Render Web Service)
```
NODE_ENV = production
PORT = 10000
OPENAI_API_KEY = your_key_here
ELEVENLABS_API_KEY = your_key_here
```

## 🎯 Success Checklist

- [ ] Frontend builds successfully on Render
- [ ] Frontend loads without errors
- [ ] API calls work (check Network tab)
- [ ] Audio recording works
- [ ] Translation works
- [ ] WASM files load correctly
- [ ] No CORS errors in console
- [ ] Custom headers are applied
- [ ] SPA routing works (no 404s)

## 🚀 Next Steps

1. **Deploy frontend to Render**
2. **Test all functionality**
3. **Update any hardcoded URLs**
4. **Consider custom domain**
5. **Monitor performance**
6. **Clean up Netlify** (when ready)

## 💡 Pro Tips

### Performance Optimization
- Enable gzip compression (automatic on Render)
- Use CDN for static assets (automatic on Render)
- Optimize images and assets

### Monitoring
- Check Render logs for errors
- Monitor build times
- Watch for cold start issues

### Development
- Use preview deployments for testing
- Keep local development setup unchanged
- Use environment variables for different environments

---

**Need Help?** Check Render's documentation or contact support if you encounter issues.
