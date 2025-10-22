# Netlify Deployment Guide for PromptLingo

## 🚀 Quick Start

Your application is now configured for Netlify deployment. The Python version mismatch issue has been resolved.

## ✅ What Was Fixed

1. **Created `netlify.toml`** - Main configuration file that:
   - Specifies Node.js version 18.17.0
   - Disables Python builds
   - Sets correct build directory (`client/build`)
   - Configures WASM headers for proper loading
   - Sets up SPA routing

2. **Created `.nvmrc` and `.node-version`** - Ensures consistent Node.js version

3. **Created `.netlify-ignore`** - Tells Netlify to ignore Python files

4. **Created `client/public/_headers`** - Additional headers for WASM support

5. **Updated `.gitignore`** - Allows `client/public` directory

6. **Updated `package.json`** - Added `build:netlify` script

## 📋 Deployment Steps

### Option 1: Deploy via Netlify CLI (Recommended)

1. **Install Netlify CLI** (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize your site** (first time only):
   ```bash
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Select your team
   - Enter a site name (or leave blank for auto-generated)
   - The build command and publish directory are already configured in `netlify.toml`

4. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

### Option 2: Deploy via Netlify Dashboard

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add Netlify deployment configuration"
   git push origin main
   ```

2. **Go to Netlify Dashboard**:
   - Visit https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect to your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository

3. **Configure build settings** (should auto-detect from `netlify.toml`):
   - Build command: `cd client && npm install && npm run build`
   - Publish directory: `client/build`
   - Node version: 18.17.0

4. **Add Environment Variables** (if needed):
   - Go to Site settings → Environment variables
   - Add any required variables (e.g., `REACT_APP_API_URL`)

5. **Deploy**:
   - Click "Deploy site"

## 🔧 Important Notes

### Backend Deployment

This configuration deploys **only the frontend React app**. Your backend (`server/` directory) needs to be deployed separately. Options:

1. **Heroku** - Good for Node.js backends
2. **Railway** - Modern alternative to Heroku
3. **Render** - Free tier available
4. **AWS/Google Cloud/Azure** - More control, requires more setup

After deploying your backend, update the API URL in your React app:
- Set `REACT_APP_API_URL` environment variable in Netlify
- Or update the proxy in `client/package.json`

### Environment Variables

If your app uses environment variables, add them in Netlify:
1. Go to Site settings → Environment variables
2. Add each variable (e.g., `REACT_APP_API_URL`, `REACT_APP_ENABLE_WASM`)

### Python Files

The `requirements.txt` and `streamlit_app.py` files are for local development/testing only. They are now ignored during Netlify deployment and won't cause version conflicts.

## 🐛 Troubleshooting

### Build Fails with Python Errors
- Ensure `netlify.toml` is in the root directory
- Check that `PYTHON_VERSION = ""` is set in `netlify.toml`
- Verify `.netlify-ignore` exists

### Build Fails with Node Errors
- Check Node version matches `.nvmrc` (18.17.0)
- Clear build cache in Netlify: Site settings → Build & deploy → Clear cache and deploy

### WASM Files Not Loading
- Verify `_headers` file exists in `client/public/`
- Check browser console for CORS errors
- Ensure WASM files are in `client/public/wasm/` directory

### 404 on Routes
- The `netlify.toml` includes SPA redirect rules
- If still getting 404s, check the `[[redirects]]` section in `netlify.toml`

## 📊 Build Configuration Summary

```toml
Build command: cd client && npm install && npm run build
Publish directory: client/build
Node version: 18.17.0
Python: Disabled
```

## 🔗 Useful Links

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify CLI Documentation](https://cli.netlify.com/)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)

## ✨ Next Steps

1. Deploy your backend to a hosting service
2. Update `REACT_APP_API_URL` in Netlify environment variables
3. Test your deployed application
4. Set up custom domain (optional)
5. Enable HTTPS (automatic with Netlify)

---

**Need Help?** Check the Netlify build logs for specific error messages.
