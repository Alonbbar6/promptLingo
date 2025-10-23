#!/bin/bash

# Test script for ElevenLabs integration on Render
# Run this after deploying to verify everything works

echo "🧪 Testing ElevenLabs Integration on Render"
echo "==========================================="
echo ""

BACKEND_URL="https://promptlingo-backend.onrender.com"

# Test 1: Health Check
echo "📋 Test 1: Backend Health Check"
echo "Testing: $BACKEND_URL/api/health"
echo ""
HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/api/health")
echo "$HEALTH_RESPONSE" | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE"
echo ""

# Check if ElevenLabs is configured
if echo "$HEALTH_RESPONSE" | grep -q "working"; then
    echo "✅ ElevenLabs API is configured and working!"
else
    echo "❌ ElevenLabs API is NOT configured properly"
    echo "   → Go to Render Dashboard and add ELEVENLABS_API_KEY"
fi
echo ""
echo "---"
echo ""

# Test 2: Voices Endpoint
echo "📋 Test 2: Available Voices"
echo "Testing: $BACKEND_URL/api/voices"
echo ""
VOICES_RESPONSE=$(curl -s "$BACKEND_URL/api/voices")
echo "$VOICES_RESPONSE" | jq '.' 2>/dev/null || echo "$VOICES_RESPONSE"
echo ""
echo "---"
echo ""

# Test 3: Synthesis Endpoint
echo "📋 Test 3: Speech Synthesis"
echo "Testing: $BACKEND_URL/api/synthesize"
echo ""
SYNTH_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/synthesize" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test.",
    "voiceId": "pNInz6obpgDQGcFmaJgB",
    "language": "en"
  }')

if echo "$SYNTH_RESPONSE" | grep -q "audioUrl"; then
    echo "✅ Speech synthesis successful!"
    AUDIO_SIZE=$(echo "$SYNTH_RESPONSE" | jq -r '.audioUrl' | wc -c)
    echo "   → Audio data size: $AUDIO_SIZE bytes (base64)"
else
    echo "❌ Speech synthesis failed"
    echo "$SYNTH_RESPONSE" | jq '.' 2>/dev/null || echo "$SYNTH_RESPONSE"
fi
echo ""
echo "---"
echo ""

# Test 4: CORS Check
echo "📋 Test 4: CORS Configuration"
echo "Testing CORS headers..."
echo ""
CORS_RESPONSE=$(curl -s -I -X OPTIONS "$BACKEND_URL/api/health" \
  -H "Origin: https://promptlingo-frontend.onrender.com" \
  -H "Access-Control-Request-Method: POST")

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo "✅ CORS is configured correctly"
else
    echo "⚠️  CORS headers not found (might be OK for GET requests)"
fi
echo ""

# Summary
echo "==========================================="
echo "🏁 Test Complete!"
echo ""
echo "Next steps:"
echo "1. If tests fail, check Render Dashboard → Environment Variables"
echo "2. Ensure ELEVENLABS_API_KEY is set"
echo "3. Check backend logs in Render Dashboard"
echo "4. Test frontend at: https://promptlingo-frontend.onrender.com"
echo ""
