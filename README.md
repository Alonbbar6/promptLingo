# 🌐 PromptLingo - Multilingual Speech-to-Speech Translator

A sophisticated web application that provides real-time speech-to-speech translation between multiple languages with tone control. Specializing in English, Haitian Creole, and Spanish translations with professional, casual, and formal tone options.

## 🚀 Key Features

### 🌍 Multi-Language Support
- **English** ↔ **Haitian Creole** with specialized dialect handling
- **English** ↔ **Spanish** with regional variations
- **Spanish** ↔ **Haitian Creole** (via English)

### 🎙️ Speech Capabilities
- High-accuracy speech recognition
- Natural-sounding text-to-speech output
- Real-time translation with tone preservation
- Support for different speaking styles and formality levels

### 🎭 Tone Enhancement
- Professional tone for business communications
- Casual tone for friendly conversations
- Formal tone for official contexts
- Medical terminology support
- Customizable tone parameters

### 🛠️ Developer Friendly
- Modern React/TypeScript frontend
- Node.js/Express backend
- Comprehensive API documentation
- Easy deployment options

## 🛠️ Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher) or yarn
- API keys for translation and speech services

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/promptlingo.git
   cd promptlingo
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   cd ..
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # API Keys (get these from respective services)
   OPENAI_API_KEY=your_openai_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   
   # Optional: Enable/disable features
   ENABLE_RATE_LIMITING=true
   MAX_REQUEST_PER_WINDOW=100
   ```

4. **Start the development server**
   ```bash
   # Start both client and server with hot-reload
   npm run dev
   ```
   - Frontend will be available at: http://localhost:3000
   - Backend API will be available at: http://localhost:3001

## 🚀 Deployment

### Production Build
```bash
# Build the React app for production
cd client
npm run build

# Start production server
cd ../server
npm start
```

### Deployment Options

1. **Heroku**
   ```bash
   # Set up Heroku CLI
   heroku create your-app-name
   
   # Deploy to Heroku
   git push heroku main
   ```

2. **Vercel (Frontend) + Render (Backend)**
   - Connect your GitHub repository to Vercel for frontend
   - Deploy the server to Render with the same environment variables

3. **Docker (All-in-one)**
   ```bash
   # Build the Docker image
   docker build -t promptlingo .
   
   # Run the container
   docker run -p 3000:3000 -p 3001:3001 promptlingo
   ```

## 📚 Documentation

### API Endpoints

- `POST /api/translate` - Translate text with tone control
  ```json
  {
    "text": "Hello, how are you?",
    "sourceLang": "en",
    "targetLang": "es",
    "tone": "professional"
  }
  ```

- `GET /api/voices` - List available TTS voices
- `POST /api/synthesize` - Convert text to speech

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3001) |
| `OPENAI_API_KEY` | Yes | OpenAI API key for translations |
| `ELEVENLABS_API_KEY` | Yes | ElevenLabs API key for TTS |
| `NODE_ENV` | No | Environment (development/production) |
| `ENABLE_RATE_LIMITING` | No | Enable API rate limiting |
| `MAX_REQUEST_PER_WINDOW` | No | Max requests per minute per IP |

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: React Context API + Zustand
- **Styling**: Tailwind CSS with custom theming
- **UI Components**: Headless UI, Lucide Icons
- **Audio Processing**: Web Audio API, MediaRecorder API

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **API Documentation**: Swagger/OpenAPI
- **Authentication**: JWT (optional)
- **Rate Limiting**: express-rate-limit
- **Security**: Helmet, CORS, CSRF protection

### AI/ML Services
- **Translation**: OpenAI GPT-4
- **Text-to-Speech**: ElevenLabs
- **Speech Recognition**: Web Speech API
- **Language Detection**: Custom WASM module

### Development Tools
- **Build**: Webpack 5
- **Linting**: ESLint + Prettier
- **Testing**: Jest, React Testing Library
- **Type Checking**: TypeScript 5
- **CI/CD**: GitHub Actions
  - OpenAI Whisper API (speech-to-text)
  - OpenAI ChatGPT API (translation with GPT-4o-mini)
  - ElevenLabs API (text-to-speech)

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key
- ElevenLabs API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd haitian-creole-translator
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:3001
   - Frontend development server on http://localhost:3000

### API Key Setup

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Add the key to your `.env` file

#### ElevenLabs API Key
1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Create an account or sign in
3. Navigate to your profile settings
4. Copy your API key
5. Add the key to your `.env` file

## Usage

1. **Open the application** in your browser at http://localhost:3000
2. **Select languages** - Choose source and target languages
3. **Choose tone** - Select the appropriate tone for your translation
4. **Record audio** - Click the microphone button and speak
5. **Review translation** - View the transcribed and translated text
6. **Play audio** - Listen to the translated audio
7. **View history** - Access your previous translations

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React Context for state management
│   │   ├── services/       # API services and utilities
│   │   ├── types/         # TypeScript type definitions
│   │   └── App.tsx        # Main application component
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── routes/           # API route handlers
│   └── index.js          # Main server file
├── package.json          # Root package.json
└── README.md            # This file
```

## API Endpoints

### Backend API Routes

- `POST /api/transcribe` - Transcribe audio to text
- `POST /api/translate` - Translate text between languages
- `POST /api/synthesize` - Convert text to speech
- `GET /api/voices` - Get available voices
- `GET /health` - Health check endpoint

## Error Handling

The application includes comprehensive error handling for:
- Microphone permission denied
- No audio detected during recording
- API rate limits exceeded
- Network connectivity issues
- Invalid API keys
- Unsupported audio format
- Translation failures
- Audio playback errors

## Performance Optimization

- Debounced API calls
- Cached voice options
- Compressed audio before sending to APIs
- Lazy loaded conversation history
- Request cancellation for interrupted actions
- Optimistic UI updates

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Security Considerations

- API keys are never exposed to the frontend
- Rate limiting implemented (50 requests per minute per IP)
- Request validation and sanitization
- CORS properly configured
- Basic error logging

## Troubleshooting

### Common Issues

1. **Microphone not working**
   - Check browser permissions
   - Ensure HTTPS in production
   - Try refreshing the page

2. **Translation not working**
   - Verify API keys are correct
   - Check network connection
   - Ensure sufficient API credits

3. **Audio playback issues**
   - Check browser audio permissions
   - Verify ElevenLabs API key
   - Try different voice options

### Debug Mode

Set `NODE_ENV=development` in your `.env` file to enable detailed error messages and logging.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the error messages in the browser console
3. Verify your API keys and network connection
4. Create an issue in the repository

## Roadmap

- [ ] Offline mode support
- [ ] Additional language pairs
- [ ] Voice cloning capabilities
- [ ] Mobile app version
- [ ] Batch translation features
- [ ] Advanced audio processing
