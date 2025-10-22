#!/bin/bash

# Haitian Creole Translator Setup Script
echo "🚀 Setting up Haitian Creole Speech-to-Speech Translator..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file and add your API keys:"
    echo "   - OPENAI_API_KEY=your_openai_api_key_here"
    echo "   - ELEVENLABS_API_KEY=your_elevenlabs_api_key_here"
else
    echo "✅ .env file already exists"
fi

# Create server uploads directory
echo "📁 Creating server uploads directory..."
mkdir -p server/uploads

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file and add your API keys"
echo "2. Run 'npm run dev' to start both servers"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "API Keys needed:"
echo "- OpenAI API Key: https://platform.openai.com/api-keys"
echo "- ElevenLabs API Key: https://elevenlabs.io/app/settings"
echo ""
echo "Happy translating! 🌍"
