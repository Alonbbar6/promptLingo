#!/bin/bash

# Check environment configuration for ElevenLabs integration

echo "🔍 Environment Configuration Check"
echo "=================================="
echo ""

# Check server .env
echo "📁 Checking server/.env file..."
if [ -f "server/.env" ]; then
    echo "✅ server/.env exists"
    
    if grep -q "ELEVENLABS_API_KEY=sk_" server/.env; then
        echo "✅ ELEVENLABS_API_KEY is set"
    else
        echo "❌ ELEVENLABS_API_KEY is missing or invalid"
    fi
    
    if grep -q "OPENAI_API_KEY=sk-" server/.env; then
        echo "✅ OPENAI_API_KEY is set"
    else
        echo "❌ OPENAI_API_KEY is missing or invalid"
    fi
else
    echo "❌ server/.env not found"
    echo "   Create it from .env file in root"
fi
echo ""

# Check root .env
echo "📁 Checking root .env file..."
if [ -f ".env" ]; then
    echo "✅ .env exists"
    
    if grep -q "ELEVENLABS_API_KEY=sk_" .env; then
        echo "✅ ELEVENLABS_API_KEY is set"
    else
        echo "❌ ELEVENLABS_API_KEY is missing or invalid"
    fi
else
    echo "⚠️  Root .env not found (optional)"
fi
echo ""

# Check client .env files
echo "📁 Checking client environment files..."
if [ -f "client/.env.production" ]; then
    echo "✅ client/.env.production exists"
    PROD_URL=$(grep "REACT_APP_API_URL" client/.env.production | cut -d'=' -f2)
    echo "   Backend URL: $PROD_URL"
    
    if [[ "$PROD_URL" == *"promptlingo-backend.onrender.com"* ]]; then
        echo "✅ Backend URL matches render.yaml"
    else
        echo "⚠️  Backend URL might not match render.yaml"
    fi
else
    echo "❌ client/.env.production not found"
fi
echo ""

# Check render.yaml
echo "📁 Checking render.yaml..."
if [ -f "render.yaml" ]; then
    echo "✅ render.yaml exists"
    
    if grep -q "https://api.elevenlabs.io" render.yaml; then
        echo "✅ ElevenLabs API in CSP connect-src"
    else
        echo "❌ ElevenLabs API NOT in CSP - audio will be blocked!"
    fi
    
    if grep -q "ELEVENLABS_API_KEY" render.yaml; then
        echo "✅ ELEVENLABS_API_KEY configured in render.yaml"
    else
        echo "❌ ELEVENLABS_API_KEY not in render.yaml"
    fi
else
    echo "❌ render.yaml not found"
fi
echo ""

# Check .gitignore
echo "📁 Checking .gitignore..."
if [ -f ".gitignore" ]; then
    if grep -q "^\.env$" .gitignore; then
        echo "✅ .env files are gitignored (secure)"
    else
        echo "⚠️  .env might not be gitignored - security risk!"
    fi
else
    echo "⚠️  .gitignore not found"
fi
echo ""

# Summary
echo "=================================="
echo "📊 Summary"
echo ""
echo "Local Development:"
echo "  - Ensure server/.env has ELEVENLABS_API_KEY"
echo "  - Run: cd server && npm start"
echo ""
echo "Render Deployment:"
echo "  1. Push code changes (render.yaml, .env.production)"
echo "  2. Add ELEVENLABS_API_KEY in Render Dashboard"
echo "  3. Wait for redeploy"
echo "  4. Test with: ./test-elevenlabs.sh"
echo ""
