# 📊 PromptLingo Project Summary

## 🎯 Project Overview

**PromptLingo** is a sophisticated multilingual speech-to-speech translation application with tone control, featuring:
- Real-time translation between English, Spanish, and Haitian Creole
- Professional tone enhancement
- High-performance WebAssembly text processing
- Multiple interface options (React Web App, Streamlit, API)

## 🏗️ Project Structure

```
promptLingo/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/             # UI components
│   │   ├── services/               # API and WASM services
│   │   ├── utils/                  # Utilities (content filter, etc.)
│   │   └── App.tsx                 # Main application
│   └── public/
│       └── wasm/                   # Compiled WASM modules
│
├── server/                          # Node.js/Express backend
│   ├── routes/                     # API endpoints
│   │   ├── translate.js           # Translation API
│   │   ├── synthesize.js          # Text-to-Speech API
│   │   ├── transcribe.js          # Speech-to-Text API
│   │   └── wasm.js                # WASM API
│   ├── services/                   # Backend services
│   │   └── wasmService.js         # WASM integration
│   └── index.js                    # Server entry point
│
├── wasm-text-processor/            # Rust WASM module
│   ├── src/
│   │   └── lib.rs                 # Main WASM code
│   ├── Cargo.toml                 # Rust dependencies
│   └── build.sh                   # Build script
│
├── streamlit_app.py                # Streamlit interface
├── requirements.txt                # Python dependencies
├── package.json                    # Root dependencies
└── .env                            # Environment variables

```

## 🔑 Key Files

### Essential Files for Running

1. **Backend Server** (Required)
   - `server/index.js` - Main server file
   - `server/routes/*.js` - API endpoints
   - `server/package.json` - Dependencies

2. **Frontend** (Choose one)
   - **React**: `client/src/App.tsx`
   - **Streamlit**: `streamlit_app.py`

3. **WASM Module** (Optional, for enhanced performance)
   - `client/public/wasm/wasm_text_processor.wasm`
   - `client/public/wasm/wasm_text_processor.js`
   - `wasm-text-processor/src/lib.rs` (source code)

4. **Configuration**
   - `.env` - API keys and configuration
   - `package.json` - Project metadata

### Documentation Files

- `README.md` - Main project documentation
- `README_STREAMLIT.md` - Streamlit-specific guide
- `WASM_DISTRIBUTION_README.md` - WASM module documentation
- `WASM_SHARING_GUIDE.md` - How to share the WASM module
- `TONE_ENHANCEMENT_FIX.md` - Tone enhancement implementation
- `WASM_INTEGRATION_GUIDE.md` - WASM integration guide

## 🚀 How to Run

### Option 1: Full Stack (React + Node.js)

```bash
# 1. Install dependencies
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# 2. Set up environment variables
cp env.example .env
# Edit .env with your API keys

# 3. Start development server
npm run dev
```

Access at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Option 2: Streamlit Interface

```bash
# 1. Install Python dependencies
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# 2. Start backend server (in separate terminal)
cd server && npm start

# 3. Start Streamlit
streamlit run streamlit_app.py
```

Access at: http://localhost:8501

### Option 3: API Only

```bash
# Start just the backend
cd server
npm install
npm start
```

API available at: http://localhost:3001/api

## 🔌 API Endpoints

### Translation
```
POST /api/translate
Body: {
  "text": "Hello world",
  "sourceLang": "en",
  "targetLang": "es",
  "tone": "professional"
}
```

### Text-to-Speech
```
POST /api/synthesize
Body: {
  "text": "Hello world",
  "voiceId": "voice_id_here",
  "stability": 0.5,
  "similarity_boost": 0.5
}
```

### Speech-to-Text
```
POST /api/transcribe
Body: FormData with audio file
```

### WASM Text Processing
```
POST /api/wasm/analyze
Body: {
  "text": "Text to analyze"
}
```

## 🛠️ Technologies Used

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide Icons** - Icons
- **WebAssembly** - High-performance text processing

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **OpenAI API** - Translation (GPT-4)
- **ElevenLabs API** - Text-to-Speech
- **Whisper API** - Speech-to-Text

### WASM Module
- **Rust** - Systems programming language
- **wasm-bindgen** - JavaScript interop
- **regex** - Pattern matching
- **serde** - Serialization

### Python (Streamlit)
- **Streamlit** - Web interface
- **Requests** - HTTP client
- **python-dotenv** - Environment variables

## 📦 Dependencies

### Node.js (Backend)
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.0.3",
  "multer": "^1.4.5-lts.1",
  "openai": "^4.20.0",
  "axios": "^1.6.0"
}
```

### React (Frontend)
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.3.0",
  "lucide-react": "^0.263.1"
}
```

### Python (Streamlit)
```
streamlit==1.31.0
openai==1.3.0
requests==2.31.0
python-dotenv==1.0.0
```

## 🔐 Environment Variables

Required in `.env` file:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# API Keys
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Optional
ENABLE_RATE_LIMITING=true
MAX_REQUEST_PER_WINDOW=100
```

## 🌟 Features

### Core Features
- ✅ Multi-language translation (EN, ES, HT)
- ✅ Tone control (Professional, Casual, Formal, Medical)
- ✅ Speech-to-text transcription
- ✅ Text-to-speech synthesis
- ✅ Real-time translation
- ✅ Translation history

### Advanced Features
- ✅ WebAssembly text processing
- ✅ Language detection
- ✅ Content filtering
- ✅ Sentiment analysis
- ✅ Batch processing
- ✅ Performance benchmarking

### UI Features
- ✅ Responsive design
- ✅ Dark/light mode support
- ✅ Audio playback controls
- ✅ Download translations
- ✅ Copy to clipboard
- ✅ Real-time feedback

## 📈 Performance

### WASM vs JavaScript
- **Text Analysis**: 10-16x faster
- **Language Detection**: 10x faster
- **Content Filtering**: 10x faster
- **Batch Processing**: 8-9x faster

### API Response Times
- Translation: 1-5 seconds
- Text-to-Speech: 1-2 seconds
- Speech-to-Text: 2-4 seconds

## 🔒 Security

- ✅ API key protection via environment variables
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input sanitization
- ✅ Content filtering
- ✅ WASM sandboxing

## 🚢 Deployment

### Recommended Stack
- **Frontend**: Vercel or Netlify
- **Backend**: Render or Heroku
- **Database**: (if needed) MongoDB Atlas or PostgreSQL

### Docker Deployment
```bash
docker build -t promptlingo .
docker run -p 3000:3000 -p 3001:3001 promptlingo
```

## 📝 Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Build WASM Module** (if modified)
   ```bash
   ./build-wasm.sh
   ```

3. **Run Tests**
   ```bash
   npm test
   ```

4. **Build for Production**
   ```bash
   cd client && npm run build
   ```

## 🐛 Known Issues

1. **WASM Build**: Requires network connection to download Rust crates
2. **API Rate Limits**: OpenAI and ElevenLabs have rate limits
3. **Browser Compatibility**: WASM requires modern browsers
4. **Audio Format**: Some browsers have limited audio format support

## 🔮 Future Enhancements

- [ ] Offline mode with local models
- [ ] More language support
- [ ] User authentication
- [ ] Translation memory
- [ ] Custom voice training
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron/Tauri)
- [ ] Browser extension

## 📚 Learning Resources

- [WebAssembly Documentation](https://webassembly.org/)
- [Rust WASM Book](https://rustwasm.github.io/docs/book/)
- [React Documentation](https://react.dev/)
- [Streamlit Documentation](https://docs.streamlit.io/)
- [OpenAI API Reference](https://platform.openai.com/docs/)
- [ElevenLabs API Docs](https://docs.elevenlabs.io/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 👥 Team

- **Developer**: Alon Bbar
- **Repository**: https://github.com/Alonbbar6/promptLingo

## 📞 Support

- **GitHub Issues**: https://github.com/Alonbbar6/promptLingo/issues
- **Email**: support@promptlingo.com

---

**Last Updated**: October 2025
**Version**: 1.0.0
