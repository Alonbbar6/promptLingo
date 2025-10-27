#!/bin/bash

# PromptLingo Deployment Script
# This script builds WASM and prepares the app for deployment

set -e  # Exit on error

echo "🚀 Starting PromptLingo deployment process..."
echo ""

# Step 1: Build WASM for web
echo "📦 Step 1/3: Building WASM for web target..."
npm run build:wasm:web
echo "✅ WASM build complete!"
echo ""

# Step 2: Build React app
echo "⚛️  Step 2/3: Building React application..."
cd client
npm run build
cd ..
echo "✅ React build complete!"
echo ""

# Step 3: Git commit and push
echo "📤 Step 3/3: Committing and pushing to GitHub..."
git add .
git commit -m "build: Deploy with WASM integration" || echo "No changes to commit"
git push origin main
echo "✅ Pushed to GitHub!"
echo ""

echo "🎉 Deployment complete!"
echo ""
echo "📊 Next steps:"
echo "  1. Netlify will auto-deploy from GitHub"
echo "  2. Check deployment status at: https://app.netlify.com"
echo "  3. Visit your site at: https://promptmylingo.netlify.app"
echo ""
echo "🧪 To test locally first:"
echo "  npm start"
echo ""
