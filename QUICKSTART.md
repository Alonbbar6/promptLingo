# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Prerequisites
- Node.js (v16 or higher)
- OpenAI API key
- ElevenLabs API key

### 2. Setup
```bash
# Run the setup script
./setup.sh

# Or manually:
npm run install-all
```

### 3. Configure API Keys
Edit the `.env` file and add your API keys:

```env
OPENAI_API_KEY=your_openai_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

**Get your API keys:**
- OpenAI: https://platform.openai.com/api-keys
- ElevenLabs: https://elevenlabs.io/app/settings

### 4. Start the Application
```bash
npm run dev
```

This starts:
- Backend server: http://localhost:3001
- Frontend app: http://localhost:3000

### 5. Use the App
1. Open http://localhost:3000
2. Select your languages (English ↔ Haitian Creole)
3. Choose a tone (Casual, Business, Formal, etc.)
4. Click "Start Recording" and speak
5. View your translation and listen to the audio

## 🎯 Key Features

- **Real-time Translation**: Speak in one language, get instant translation
- **Tone Control**: Choose from Casual, Business, Formal, Informal, or Medical tones
- **Audio Playback**: Listen to translated speech with voice options
- **History**: All translations are saved and can be replayed
- **Mobile Friendly**: Works on phones, tablets, and desktop

## 🔧 Troubleshooting

### Microphone Issues
- Check browser permissions
- Try refreshing the page
- Ensure you're using HTTPS in production

### Translation Not Working
- Verify API keys in `.env` file
- Check your internet connection
- Ensure you have sufficient API credits

### Audio Playback Issues
- Check browser audio permissions
- Try different voice options
- Verify ElevenLabs API key

## 📱 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🆘 Need Help?

1. Check the main README.md for detailed documentation
2. Review error messages in browser console
3. Verify API keys and network connection
4. Create an issue in the repository

Happy translating! 🌍
