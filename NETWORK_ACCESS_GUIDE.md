# Network Access Guide - PromptLingo

## 🎯 Problem Solved
Your app now supports access from other devices (phones, tablets) on the same WiFi network!

## 📱 How to Access from Another Device

### Step 1: Start Both Servers

**Backend Server:**
```bash
cd /Users/user/Desktop/buisnessPrompt/server
npm start
```
✅ Should show: `🚀 Server running on port 10000`

**Frontend Server:**
```bash
cd /Users/user/Desktop/buisnessPrompt/client
npm start
```
✅ Should show: `webpack compiled successfully`

### Step 2: Create `.env.local` File

In the `client` folder, create a file named `.env.local` with this content:

```env
REACT_APP_API_URL=http://192.168.1.96:10000
```

**Important:** Replace `192.168.1.96` with your actual computer's IP address if it changes.

### Step 3: Restart Frontend Server

After creating `.env.local`, restart your frontend:
```bash
# Press Ctrl+C to stop, then:
npm start
```

### Step 4: Access from Other Devices

On your phone or other device (connected to the same WiFi):

1. Open browser
2. Go to: `http://192.168.1.96:3000`
3. The app should load and work perfectly!

## 🔧 Troubleshooting

### Error: "Failed to fetch" or "Connection Refused"

**Check 1:** Is the backend server running?
```bash
lsof -i :10000
```
Should show a node process. If not, start it with `npm start` in the server folder.

**Check 2:** Is your firewall blocking connections?
- On Mac: System Preferences → Security & Privacy → Firewall → Allow incoming connections for Node

**Check 3:** Are you on the same WiFi network?
- Both devices must be on the same network

**Check 4:** Did you create the `.env.local` file?
- Must be in `client` folder
- Must contain `REACT_APP_API_URL=http://192.168.1.96:10000`

### Error: "CORS blocked"

This should be fixed now! The server accepts requests from:
- `http://192.168.1.96:3000`
- `http://192.168.1.96:3001`
- Any local network IP matching pattern `192.168.x.x`

## 🌐 For Production Deployment

When deploying to Render, Netlify, or other hosting:

1. **Backend:** Deploy to Render/Railway/Heroku
2. **Frontend:** Deploy to Netlify/Vercel
3. **Set Environment Variable:**
   ```env
   REACT_APP_API_URL=https://your-backend.onrender.com
   ```

## 📝 Quick Reference

| Scenario | REACT_APP_API_URL Value |
|----------|------------------------|
| Local development (same machine) | Leave empty (uses proxy) |
| Network access (other devices) | `http://192.168.1.96:10000` |
| Production (Render backend) | `https://your-app.onrender.com` |

## ✅ What Was Changed

1. **Server CORS Configuration** (`server/index.js`):
   - Added `http://192.168.1.96:3000` and `http://192.168.1.96:3001`
   - Added regex pattern to allow all local network IPs

2. **Frontend API Service** (`client/src/services/textToSpeech.ts`):
   - Updated to use `REACT_APP_API_URL` environment variable
   - Falls back to relative URL `/api` if not set

3. **Proxy Configuration** (`client/package.json`):
   - Set to `http://localhost:10000` for local development

## 🎉 Success Indicators

When everything is working:
- ✅ Backend shows: `🚀 Server running on port 10000`
- ✅ Frontend loads without errors
- ✅ No "Failed to fetch" errors in console
- ✅ Text-to-speech works from other devices
- ✅ All features functional (recording, translation, synthesis)
