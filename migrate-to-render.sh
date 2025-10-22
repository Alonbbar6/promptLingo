#!/bin/bash

# Render Frontend Migration Script
# This script helps migrate from Netlify to Render

echo "🚀 PromptLingo Frontend Migration to Render"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "client" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure detected"

# Check if client directory has package.json
if [ ! -f "client/package.json" ]; then
    echo "❌ Error: client/package.json not found"
    exit 1
fi

echo "✅ Client package.json found"

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please ensure it was created."
    exit 1
fi

echo "✅ render.yaml configuration found"

# Test build locally
echo ""
echo "🔨 Testing local build..."
cd client

if ! npm install; then
    echo "❌ Error: npm install failed"
    exit 1
fi

echo "✅ Dependencies installed"

if ! npm run build; then
    echo "❌ Error: npm run build failed"
    exit 1
fi

echo "✅ Build successful"

# Check if build directory exists
if [ ! -d "build" ]; then
    echo "❌ Error: build directory not created"
    exit 1
fi

echo "✅ Build directory created"

# Go back to root
cd ..

echo ""
echo "🎯 Migration Checklist:"
echo "======================="
echo ""
echo "1. ✅ Project structure verified"
echo "2. ✅ Dependencies installed"
echo "3. ✅ Build tested successfully"
echo "4. ✅ render.yaml configuration ready"
echo ""
echo "📋 Next Steps:"
echo "============="
echo ""
echo "1. Go to: https://dashboard.render.com"
echo "2. Click 'New +' → 'Static Site'"
echo "3. Connect your GitHub repository"
echo "4. Configure:"
echo "   - Name: promptlingo-frontend"
echo "   - Build Command: cd client && npm install && npm run build"
echo "   - Publish Directory: client/build"
echo "5. Add Environment Variable:"
echo "   - Key: REACT_APP_API_URL"
echo "   - Value: https://your-backend-name.onrender.com/api"
echo "6. Click 'Create Static Site'"
echo ""
echo "🔧 Backend CORS Update:"
echo "======================"
echo ""
echo "Make sure your backend CORS allows the new Render frontend URL:"
echo "Add to server/index.js CORS origins:"
echo "  'https://promptlingo-frontend.onrender.com'"
echo ""
echo "📚 Documentation:"
echo "================="
echo "See RENDER_FRONTEND_DEPLOYMENT.md for detailed instructions"
echo ""
echo "🎉 Ready to deploy to Render!"
