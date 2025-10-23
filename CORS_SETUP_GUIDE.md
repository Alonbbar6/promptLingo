# CORS Setup Guide for PromptLingo

## ✅ Current Status

Your CORS configuration is **already properly set up**! The backend has been enhanced with:

1. ✅ Comprehensive CORS middleware with origin validation
2. ✅ Support for localhost (development) and Render/Netlify (production)
3. ✅ Detailed logging for debugging
4. ✅ CORS test endpoint for verification
5. ✅ Proper error handling for blocked origins

---

## 🧪 Testing CORS

### 1. Test CORS Endpoint (Recommended)

Open your browser and navigate to:
```
http://localhost:10000/api/cors-test
```

Or from your deployed frontend:
```
https://promptlingo-backend.onrender.com/api/cors-test
```

**Expected Response:**
```json
{
  "message": "✅ CORS is working!",
  "requestOrigin": "https://promptlingo-frontend.onrender.com",
  "allowedOrigins": [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "https://promptlingo.netlify.app",
    "https://promptlingo-frontend.onrender.com"
  ],
  "regexPatterns": ["Netlify subdomains", "Render subdomains"],
  "timestamp": "2025-10-23T20:00:00.000Z"
}
```

### 2. Test from Browser Console

Open your frontend in the browser, press F12, and run:

```javascript
// Test CORS
fetch('http://localhost:10000/api/cors-test')
  .then(r => r.json())
  .then(data => console.log('✅ CORS Test:', data))
  .catch(err => console.error('❌ CORS Error:', err));

// Test health endpoint
fetch('http://localhost:10000/api/health')
  .then(r => r.json())
  .then(data => console.log('✅ Health:', data))
  .catch(err => console.error('❌ Error:', err));
```

### 3. Check Backend Logs

When you make a request, you should see in the backend console:

```
✅ CORS: Allowed origin: https://promptlingo-frontend.onrender.com
📨 GET /api/cors-test from https://promptlingo-frontend.onrender.com
```

If CORS is blocked, you'll see:
```
❌ CORS: Blocked origin: https://unknown-domain.com
```

---

## 🌐 Allowed Origins

Your backend currently allows requests from:

### Development (Localhost)
- `http://localhost:3000` - React dev server
- `http://localhost:3001` - Alternative port
- `http://localhost:5173` - Vite dev server

### Production
- `https://promptlingo.netlify.app` - Netlify production
- All `*.netlify.app` subdomains (preview deployments)
- `https://promptlingo-frontend.onrender.com` - Render frontend
- All `*.onrender.com` subdomains (preview deployments)
- Any URL set in `FRONTEND_URL` environment variable

---

## 🔧 Configuration Files

### Backend Environment Variables (Render)

In your Render backend dashboard, set:

```bash
# Required
OPENAI_API_KEY=your_openai_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here
PORT=10000
NODE_ENV=production

# Optional - for specific frontend URL
FRONTEND_URL=https://your-custom-frontend.onrender.com
```

### Frontend Environment Variables (Render)

In your Render frontend dashboard, set:

```bash
# Points to your backend
REACT_APP_API_URL=https://promptlingo-backend.onrender.com/api
```

---

## 🚨 Troubleshooting CORS Errors

### Error: "No 'Access-Control-Allow-Origin' header"

**Cause:** Frontend URL is not in the allowed origins list.

**Solution:**
1. Check backend logs to see which origin was blocked
2. Add the origin to `allowedOrigins` in `server/index.js`, OR
3. Set `FRONTEND_URL` environment variable in Render

### Error: "Preflight request failed"

**Cause:** OPTIONS request not handled properly.

**Solution:** Already fixed! The backend has:
```javascript
app.options('*', cors(corsOptions));
```

### Error: "Origin not allowed by CORS"

**Cause:** Your frontend is running on a URL that's not in the allowed list.

**Solution:**
1. Check the exact URL your frontend is using
2. Add it to the `allowedOrigins` array in `server/index.js`
3. Or use the `FRONTEND_URL` environment variable

### Error: "Cannot connect to backend"

**Cause:** Backend is not running or URL is incorrect.

**Solution:**
1. Verify backend is running: `curl http://localhost:10000/api/health`
2. Check `REACT_APP_API_URL` in frontend `.env` file
3. Ensure no typos in the URL

---

## 📝 Adding New Origins

If you need to add a new origin (e.g., a custom domain):

### Option 1: Edit Code (Permanent)

Edit `server/index.js`:

```javascript
const allowedOrigins = [
  // ... existing origins ...
  'https://your-custom-domain.com', // Add your domain here
].filter(Boolean);
```

### Option 2: Environment Variable (Flexible)

Set in Render backend:
```bash
FRONTEND_URL=https://your-custom-domain.com
```

This is automatically added to allowed origins!

---

## 🔍 CORS Headers Explained

Your backend sends these CORS headers:

```
Access-Control-Allow-Origin: https://promptlingo-frontend.onrender.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Accept
Access-Control-Expose-Headers: Content-Length, Content-Type
Access-Control-Max-Age: 86400
```

**What they mean:**
- **Allow-Origin:** Which domain can access the API
- **Allow-Credentials:** Allows cookies/auth headers
- **Allow-Methods:** Which HTTP methods are allowed
- **Allow-Headers:** Which request headers are allowed
- **Expose-Headers:** Which response headers frontend can read
- **Max-Age:** How long to cache preflight requests (24 hours)

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] Backend starts without errors
- [ ] `http://localhost:10000/api/cors-test` returns success
- [ ] Frontend can fetch from `http://localhost:10000/api/health`
- [ ] Backend logs show `✅ CORS: Allowed origin: ...`
- [ ] No CORS errors in browser console (F12)
- [ ] `REACT_APP_API_URL` points to correct backend URL
- [ ] Environment variables are set in Render dashboard

---

## 🎯 Quick Test Commands

```bash
# Test backend is running
curl http://localhost:10000/api/health

# Test CORS endpoint
curl http://localhost:10000/api/cors-test

# Test from frontend origin (replace with your frontend URL)
curl -H "Origin: https://promptlingo-frontend.onrender.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:10000/api/health -v
```

---

## 📚 Additional Resources

- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS Package](https://www.npmjs.com/package/cors)
- [Render Environment Variables](https://render.com/docs/environment-variables)

---

## 🆘 Still Having Issues?

1. **Check backend logs** in Render dashboard for CORS errors
2. **Check browser console** (F12) for detailed error messages
3. **Verify URLs** - ensure no typos in environment variables
4. **Test locally first** - make sure it works on localhost before deploying
5. **Use the CORS test endpoint** - `/api/cors-test` shows exactly what's allowed

---

## Summary

✅ Your CORS is already properly configured!
✅ Backend allows localhost and Render/Netlify domains
✅ Detailed logging helps debug any issues
✅ Test endpoint available at `/api/cors-test`
✅ Environment variable support for custom domains

**No additional CORS configuration needed!** 🎉
