# 🚨 RENDER DEPLOYMENT FIX - Monorepo Structure

## Problem Identified ✅

Your logs show:
```
==> Running build command 'npm install'...
up to date, audited 1 package in 955ms
```

**Only 1 package installed!** This is because:
- Render is running `npm install` in the **root directory**
- Your root `package.json` only has 2 devDependencies (concurrently, netlify-cli)
- Your actual backend dependencies (express, cors, etc.) are in `/server/package.json`
- Render doesn't know to look in the `server` folder

---

## ✅ Solution: Configure Render Root Directory

### Step 1: Update Render Settings

1. **Go to:** [dashboard.render.com](https://dashboard.render.com)
2. **Click** on your `promptLingo-1` service
3. **Click** "Settings" tab (left sidebar)
4. **Scroll down** to "Build & Deploy" section
5. **Set these values:**

   | Setting | Value |
   |---------|-------|
   | **Root Directory** | `server` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node index.js` |

6. **Click "Save Changes"**
7. **Go to "Manual Deploy"** → Click "Deploy latest commit"

---

## 📁 Your Current Project Structure

```
promptLingo/
├── package.json              ← Root (only has concurrently, netlify-cli)
├── server/
│   ├── package.json          ← Backend dependencies (express, cors, etc.)
│   ├── index.js              ← Your server entry point
│   ├── routes/
│   └── ...
├── client/
│   ├── package.json          ← Frontend dependencies (React, etc.)
│   └── ...
└── ...
```

**The Issue:**
- Render runs `npm install` in root
- Root `package.json` doesn't have Express
- Server can't start without dependencies

**The Fix:**
- Tell Render to use `server` as root directory
- Now `npm install` runs in `/server` folder
- All backend dependencies get installed

---

## 🎯 Exact Render Configuration

### In Render Dashboard → Settings:

```
Root Directory:    server
Build Command:     npm install
Start Command:     node index.js
Environment:       Node
Branch:            main
Auto-Deploy:       Yes
```

### Environment Variables:

```
OPENAI_API_KEY = your_key_here
ELEVENLABS_API_KEY = your_key_here
NODE_ENV = production
PORT = (automatically set by Render)
```

---

## 🔍 Why This Happens

### Monorepo Structure:
Your project is a **monorepo** with separate client and server:
- `/client` → React frontend (deployed to Netlify)
- `/server` → Express backend (deployed to Render)
- `/` (root) → Workspace configuration

### Render's Default Behavior:
- Render clones your entire repo
- Runs build command in the root directory
- Looks for `package.json` in root
- Installs only what's in root `package.json`

### The Problem:
- Root `package.json` only has dev tools (concurrently, netlify-cli)
- Backend dependencies are in `server/package.json`
- Render installs root dependencies (1 package)
- Then tries to run `node server/index.js`
- Server code requires Express
- Express not installed → ERROR

---

## 📊 Before vs After

### Before (BROKEN):
```bash
# Render runs:
/opt/render/project/src$ npm install
# Installs: concurrently, netlify-cli (1 package)

# Then runs:
/opt/render/project/src$ node server/index.js
# Error: Cannot find module 'express'
```

### After (FIXED):
```bash
# Render runs:
/opt/render/project/src/server$ npm install
# Installs: express, cors, helmet, etc. (11 packages)

# Then runs:
/opt/render/project/src/server$ node index.js
# ✅ Server starts successfully!
```

---

## 🚀 Step-by-Step Fix

### 1. Update Render Settings (2 min)

1. Go to Render dashboard
2. Click your service
3. Click "Settings"
4. Find "Build & Deploy" section
5. Change **Root Directory** to: `server`
6. Verify **Build Command** is: `npm install`
7. Verify **Start Command** is: `node index.js`
8. Click "Save Changes"

### 2. Trigger Manual Deploy (1 min)

1. Click "Manual Deploy" (top right)
2. Click "Deploy latest commit"
3. Wait 2-3 minutes
4. Watch the logs

### 3. Verify Success (1 min)

**Expected logs:**
```
==> Running build command 'npm install'...
added 150 packages, and audited 151 packages in 15s
✅ Build successful

==> Running 'node index.js'
✅ Server running on port 10000
```

**Test the URL:**
```
https://promptlingo-1.onrender.com
```

Should return JSON, not 502!

---

## ✅ Success Checklist

After deploying:

- [ ] Render logs show "added 150+ packages" (not just 1)
- [ ] Render logs show "Server running on port..."
- [ ] Service status shows "Live" (green dot)
- [ ] URL `https://promptlingo-1.onrender.com` returns JSON
- [ ] URL `https://promptlingo-1.onrender.com/api/health` returns JSON
- [ ] No "Cannot find module" errors
- [ ] Frontend can connect to backend

---

## 🐛 Alternative Fix (If Root Directory Doesn't Work)

If your Render plan doesn't support setting Root Directory, use these commands instead:

**Build Command:**
```bash
cd server && npm install
```

**Start Command:**
```bash
cd server && node index.js
```

This achieves the same result by changing directory before running commands.

---

## 📝 Summary

**Problem:** Render installing root dependencies, not server dependencies  
**Cause:** Monorepo structure with separate client/server folders  
**Solution:** Set Render Root Directory to `server`  
**Result:** Backend dependencies installed correctly, server starts successfully  

**Time to fix:** 3 minutes  
**Difficulty:** Easy  

---

## 🆘 If Still Having Issues

### Check These:

1. **Root Directory is set to `server`** (not `./server` or `/server`)
2. **Build Command is `npm install`** (not `npm ci` or `yarn install`)
3. **Start Command is `node index.js`** (not `node server/index.js`)
4. **Environment variables are set** (OPENAI_API_KEY, ELEVENLABS_API_KEY)

### Share These:

1. Screenshot of Render Settings showing Root Directory
2. Full build logs from latest deploy
3. Environment variables list (hide actual keys)

---

**Fix this now and your backend will be live in 3 minutes!** 🚀
