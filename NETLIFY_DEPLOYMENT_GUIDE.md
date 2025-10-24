# Netlify Deployment Guide

## Quick Deploy Steps

### 1. Connect to Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub
4. Select repository: Alonbbar6/promptLingo
5. Branch: main

### 2. Build Settings (Auto-detected)

Netlify will automatically use these settings from netlify.toml:

- Base directory: (root)
- Build command: cd client && npm install && npm run build
- Publish directory: client/build

You don't need to change anything! Netlify reads from netlify.toml.

### 3. Add Environment Variable

Before deploying, add this environment variable:

Key:   REACT_APP_API_URL
Value: https://promptlingo-backend.onrender.com/api

### 4. Deploy

Click "Deploy site"

Netlify will:
- Clone your repo
- Navigate to client/ directory
- Run npm install and npm run build
- Publish client/build/ folder
- Give you a URL like: https://promptlingo.netlify.app

### 5. Test Your Deployment

Once deployed, test:
- Page loads correctly
- No 404 errors for /api/voices
- No 404 errors for /api/synthesize
- TTS functionality works

## Manual Settings (If Not Using netlify.toml)

If you need to configure manually in Netlify dashboard:

Base directory:    (leave empty)
Build command:     cd client && npm install && npm run build
Publish directory: client/build
Node version:      20

Environment Variables:
REACT_APP_API_URL = https://promptlingo-backend.onrender.com/api

## What netlify.toml Provides

Your netlify.toml already includes:
- Build configuration
- Node.js version 20
- Security headers
- CORS headers for microphone access
- SPA routing (redirects all routes to index.html)
- WASM file support
- CSP allowing connections to your Render backend

## Troubleshooting

### Build Fails
- Check that client/package.json exists
- Verify Node version compatibility
- Check build logs for specific errors

### API Calls Fail
- Verify REACT_APP_API_URL is set correctly
- Check browser console for CORS errors
- Verify backend is running on Render

### 404 on Routes
- netlify.toml already handles SPA routing
- All routes redirect to index.html

### CORS Errors
- Your backend already allows *.netlify.app domains
- Check server/index.js line 48-49 for Netlify CORS config

## After Deployment

Your site will be available at:
https://your-site-name.netlify.app

You can customize the subdomain in Netlify settings.
