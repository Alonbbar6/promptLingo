# 🚀 Quick Reference: Netlify → Render Migration

## ⚡ Quick Start (5 minutes)

### 1. Deploy to Render
```bash
# Go to Render Dashboard
https://dashboard.render.com

# Create Static Site
Name: promptlingo-frontend
Build Command: cd client && npm install && npm run build
Publish Directory: client/build

# Add Environment Variable
REACT_APP_API_URL = https://your-backend-name.onrender.com/api
```

### 2. Test Everything
- ✅ Frontend loads
- ✅ API calls work
- ✅ Audio recording works
- ✅ Translation works
- ✅ No console errors

## 📁 Files Created/Modified

| File | Purpose |
|------|---------|
| `render.yaml` | Render deployment configuration |
| `RENDER_FRONTEND_DEPLOYMENT.md` | Detailed deployment guide |
| `migrate-to-render.sh` | Migration script |
| `MIGRATION_SUMMARY.md` | Complete migration summary |
| `package.json` | Added Render build scripts |
| `server/index.js` | Updated CORS for Render |

## 🔧 Key Configuration

### Render Static Site
```yaml
Build Command: cd client && npm install && npm run build
Publish Directory: client/build
Environment Variables:
  REACT_APP_API_URL: https://your-backend-name.onrender.com/api
```

### Backend CORS (Updated)
```javascript
// Now allows both Netlify and Render
const allowedOrigins = [
  'https://promptlingo.netlify.app',        // Old Netlify
  'https://promptlingo-frontend.onrender.com', // New Render
  /https:\/\/.*\.onrender\.com$/,          // Render previews
];
```

## 🛠️ Available Commands

```bash
# Test migration locally
npm run migrate:render

# Build for Render
npm run build:render

# Build for Netlify (still available)
npm run build:netlify
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Ensure `cd client &&` in build command |
| 404 on routes | SPA redirect configured in render.yaml |
| API calls fail | Check REACT_APP_API_URL environment variable |
| CORS errors | Backend CORS updated to allow Render URLs |
| WASM not loading | Headers configured in render.yaml |

## 📊 Migration Benefits

- ✅ **Same Platform:** Frontend and backend on Render
- ✅ **Better Integration:** Easier management
- ✅ **Cost Effective:** Free tier with good limits
- ✅ **WASM Support:** Full WebAssembly support
- ✅ **Custom Headers:** Easy configuration
- ✅ **Preview Deployments:** Automatic for PRs

## 🎯 Success Checklist

- [ ] Frontend builds successfully on Render
- [ ] Frontend loads without errors
- [ ] API calls work (check Network tab)
- [ ] Audio recording works
- [ ] Translation works
- [ ] WASM files load correctly
- [ ] No CORS errors in console
- [ ] SPA routing works (no 404s)

## 📚 Documentation

- **`RENDER_FRONTEND_DEPLOYMENT.md`** - Complete deployment guide
- **`MIGRATION_SUMMARY.md`** - Detailed migration summary
- **`migrate-to-render.sh`** - Automated migration script

## 🔄 Rollback Plan

If needed, you can easily rollback to Netlify:
1. Your Netlify configuration is still intact
2. Simply redeploy from Netlify dashboard
3. Update environment variables back

---

**Ready to deploy!** 🚀 Follow the steps in `RENDER_FRONTEND_DEPLOYMENT.md` for detailed instructions.
