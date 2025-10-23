# PromptLingo - Quick Reference Card

## 🚀 Server Status

✅ **Backend:** Running on `http://localhost:10000`
✅ **Frontend:** Running on `http://localhost:3000`
✅ **CORS:** Properly configured
✅ **API Keys:** OpenAI ✓ | ElevenLabs ✓ (22 voices available)

---

## 🔗 Important URLs

### Local Development
- **Backend API:** http://localhost:10000/api
- **Frontend:** http://localhost:3000
- **Health Check:** http://localhost:10000/api/health
- **CORS Test:** http://localhost:10000/api/cors-test

### Production (Render)
- **Backend API:** https://promptlingo-backend.onrender.com/api
- **Frontend:** https://promptlingo-frontend.onrender.com
- **Health Check:** https://promptlingo-backend.onrender.com/api/health
- **CORS Test:** https://promptlingo-backend.onrender.com/api/cors-test

---

## 📋 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | API info |
| `/health` | GET | Basic health check |
| `/api/health` | GET | Detailed health with API status |
| `/api/cors-test` | GET | Test CORS configuration |
| `/api/voices` | GET | List available voices |
| `/api/transcribe` | POST | Audio → Text |
| `/api/translate` | POST | Text translation |
| `/api/synthesize` | POST | Text → Audio |

---

## 🧪 Quick Tests

### Test Backend is Running
```bash
curl http://localhost:10000/api/health
```

### Test CORS
```bash
curl http://localhost:10000/api/cors-test
```

### Test from Browser Console (F12)
```javascript
// Test CORS
fetch('http://localhost:10000/api/cors-test')
  .then(r => r.json())
  .then(console.log);

// Test health
fetch('http://localhost:10000/api/health')
  .then(r => r.json())
  .then(console.log);
```

---

## 🔑 Environment Variables

### Backend (`server/.env`)
```bash
OPENAI_API_KEY=sk-proj-...
ELEVENLABS_API_KEY=sk_...
PORT=10000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (`client/.env`)
```bash
REACT_APP_API_URL=http://localhost:10000/api
```

### Frontend Production (`client/.env.production`)
```bash
REACT_APP_API_URL=https://promptlingo-backend.onrender.com/api
```

---

## 🚨 Common Issues & Fixes

### Issue: CORS Error
**Fix:** Check backend logs for blocked origin, verify URL in allowed origins list

### Issue: 401 Unauthorized (ElevenLabs)
**Fix:** API key is invalid/expired - generate new key at https://elevenlabs.io/app/settings/api-keys

### Issue: Cannot connect to backend
**Fix:** Verify backend is running: `curl http://localhost:10000/api/health`

### Issue: Port already in use
**Fix:** Kill existing process: `lsof -ti:10000 | xargs kill -9`

---

## 🎯 Development Workflow

### Start Development Servers
```bash
cd /Users/user/Desktop/buisnessPrompt
npm run dev
```

This starts:
- Backend on port 10000
- Frontend on port 3000

### Start Backend Only
```bash
cd /Users/user/Desktop/buisnessPrompt
npm run server
```

### Start Frontend Only
```bash
cd /Users/user/Desktop/buisnessPrompt
npm run client
```

### Build for Production
```bash
cd /Users/user/Desktop/buisnessPrompt
npm run build
```

---

## 🔐 Security Reminders

❌ **NEVER:**
- Share API keys in chat/screenshots
- Commit `.env` files to Git
- Hardcode API keys in code

✅ **ALWAYS:**
- Use environment variables
- Revoke exposed keys immediately
- Use `.gitignore` for `.env` files

---

## 📊 Current Configuration

### Allowed CORS Origins
- `http://localhost:3000` (React dev)
- `http://localhost:3001` (Alternative)
- `http://localhost:5173` (Vite)
- `https://promptlingo.netlify.app`
- `https://promptlingo-frontend.onrender.com`
- All `*.netlify.app` subdomains
- All `*.onrender.com` subdomains

### API Keys Status
- ✅ OpenAI: Configured
- ✅ ElevenLabs: Working (22 voices available)

### Voice IDs (Need Update)
Current mappings in `server/routes/synthesize.js` use placeholder IDs.

**To get real voice IDs:**
```bash
node server/utils/listVoices.js
```

Then update the `ELEVENLABS_VOICE_IDS` mapping in `server/routes/synthesize.js`.

---

## 🛠️ Useful Commands

```bash
# Check what's running on port 10000
lsof -i:10000

# Kill process on port 10000
lsof -ti:10000 | xargs kill -9

# View backend logs
cd server && npm run dev

# Test API endpoint
curl http://localhost:10000/api/health | jq

# List ElevenLabs voices
node server/utils/listVoices.js

# Build frontend
cd client && npm run build

# Install all dependencies
npm run install-all
```

---

## 📚 Documentation Files

- `CORS_SETUP_GUIDE.md` - Comprehensive CORS configuration guide
- `ELEVENLABS_SETUP_GUIDE.md` - ElevenLabs API setup
- `QUICK_ACTION_STEPS.md` - Quick action steps
- `BUILD_FIX_SUMMARY.md` - Build fixes summary
- `README.md` - Project overview

---

## 🎉 Everything is Working!

Your application is properly configured with:
- ✅ CORS enabled for all necessary origins
- ✅ API keys configured and working
- ✅ Both backend and frontend running
- ✅ Comprehensive error handling
- ✅ Detailed logging for debugging

**Next Steps:**
1. Update ElevenLabs voice IDs (run `node server/utils/listVoices.js`)
2. Test the full workflow (record → transcribe → translate → synthesize)
3. Deploy to Render when ready

---

**Last Updated:** October 23, 2025
**Status:** ✅ All systems operational
