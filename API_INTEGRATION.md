# API Integration Guide

## 🔌 Backend API Endpoints

### Base URL
```
http://localhost:3001/api
```

## 📡 Available Endpoints

### 1. Health Check
```http
GET /api/health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-10-18T13:00:00.000Z",
  "openaiConfigured": true,
  "elevenLabsConfigured": true,
  "uptime": 123.456
}
```

### 2. Get All Voices
```http
GET /api/voices
```

**Response (with ElevenLabs)**:
```json
{
  "voices": [
    {
      "voice_id": "21m00Tcm4TlvDq8ikWAM",
      "name": "Rachel",
      "labels": {
        "gender": "female",
        "age": "young",
        "accent": "american"
      }
    }
  ],
  "multilingualVoices": [...],
  "recommended": [...],
  "source": "elevenlabs"
}
```

**Response (fallback)**:
```json
{
  "voices": [
    {
      "id": "male-1",
      "name": "Jean-Pierre",
      "gender": "male",
      "language": "ht",
      "description": "Male Haitian Creole voice"
    }
  ],
  "source": "fallback",
  "message": "Using fallback voices. Configure ELEVENLABS_API_KEY for more options."
}
```

### 3. Get Voices by Language
```http
GET /api/voices/:language
```

**Parameters**:
- `language`: `en` or `ht`

**Response**:
```json
{
  "voices": [...],
  "language": "en",
  "source": "elevenlabs",
  "note": "Multilingual voices support both English and Haitian Creole"
}
```

### 4. Transcribe Audio
```http
POST /api/transcribe
Content-Type: multipart/form-data
```

**Body**:
```
audio: <audio file>
language: "en" (optional)
```

**Response**:
```json
{
  "transcription": "Hello, how are you today?",
  "language": "en",
  "confidence": 0.95
}
```

### 5. Translate Text
```http
POST /api/translate
Content-Type: application/json
```

**Body**:
```json
{
  "text": "Hello, how are you today?",
  "sourceLang": "en",
  "targetLang": "ht",
  "tone": "casual"
}
```

**Response**:
```json
{
  "translation": "Bonjou, kijan ou ye jodi a?",
  "model": "gpt-4",
  "tokensUsed": 45
}
```

### 6. Synthesize Speech
```http
POST /api/synthesize
Content-Type: application/json
```

**Body**:
```json
{
  "text": "Bonjou, kijan ou ye jodi a?",
  "voiceId": "21m00Tcm4TlvDq8ikWAM",
  "language": "ht"
}
```

**Response**:
```json
{
  "audioUrl": "data:audio/mpeg;base64,//uQx...",
  "characterCount": 28
}
```

## 🔐 Authentication

### Environment Variables

Create a `.env` file in the server directory:

```bash
# Required
OPENAI_API_KEY=sk-...your-key-here...
PORT=3001

# Optional (falls back to static voices)
ELEVENLABS_API_KEY=...your-key-here...

# Optional
NODE_ENV=development
```

### API Key Validation

The server validates API keys on startup:

```
🔑 API Keys Check:
   - OpenAI: ✓ Set
   - ElevenLabs: ✓ Set
```

If keys are missing:
```
⚠️  WARNING: OPENAI_API_KEY not set. Transcription and translation will fail.
⚠️  WARNING: ELEVENLABS_API_KEY not set. Speech synthesis will fail.
```

## 🌐 Frontend API Client

### Location
`client/src/services/api.ts`

### Usage Examples

#### Transcribe Audio
```typescript
import { transcribeAudio } from '../services/api';

const audioFile = new File([audioBlob], 'recording.webm', { 
  type: 'audio/webm' 
});

const result = await transcribeAudio(audioFile, 'en');
console.log(result.transcription);
```

#### Translate Text
```typescript
import { translateText } from '../services/api';

const result = await translateText(
  'Hello, how are you?',
  'en',
  'ht',
  'casual'
);
console.log(result.translation);
```

#### Synthesize Speech
```typescript
import { synthesizeSpeech } from '../services/api';

const result = await synthesizeSpeech(
  'Bonjou, kijan ou ye?',
  'voice-id-here',
  'ht'
);
console.log(result.audioUrl);
```

#### Get Voices
```typescript
import { getVoicesByLanguage } from '../services/api';

const voices = await getVoicesByLanguage('en');
console.log(voices);
```

## 🔄 Request/Response Flow

### Complete Translation Flow

```
User Action: Record Audio
     ↓
1. Frontend: Create audio blob
     ↓
2. POST /api/transcribe
     ↓
3. Backend: OpenAI Whisper API
     ↓
4. Response: { transcription: "..." }
     ↓
5. POST /api/translate
     ↓
6. Backend: OpenAI GPT-4 API
     ↓
7. Response: { translation: "..." }
     ↓
8. POST /api/synthesize
     ↓
9. Backend: ElevenLabs API
     ↓
10. Response: { audioUrl: "..." }
     ↓
11. Frontend: Play audio
```

## ⚡ Performance Optimization

### Request Deduplication

Both frontend components use request deduplication:

```typescript
// Prevent duplicate requests
if (isProcessingRef.current) {
  console.log('⏭️ Skipping - already processing');
  return;
}

isProcessingRef.current = true;
const requestId = ++requestIdCounterRef.current;

try {
  // Process request
} finally {
  isProcessingRef.current = false;
}
```

### Timeout Configuration

```typescript
// In api.ts
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for first request
});
```

### Error Handling

```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Model may be loading...');
    }
    if (error.request) {
      throw new Error('Cannot connect to server...');
    }
    throw new Error(error.message);
  }
);
```

## 🎯 Rate Limiting

### Backend Rate Limits

```javascript
// In server/index.js
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // 50 requests per minute
  message: {
    error: 'Too many requests',
    retryAfter: 60
  }
});

app.use('/api/', limiter);
```

### Frontend Handling

```typescript
// ErrorDisplay.tsx handles rate limit errors
if (error.includes('rate limit') || error.includes('429')) {
  return {
    title: 'Rate Limit Exceeded',
    message: 'Too many requests. Please wait a moment.',
    type: 'warning'
  };
}
```

## 🔍 Debugging

### Enable Verbose Logging

All API calls log to console:

```
🎤 [FRONTEND] Starting transcription...
   - File: recording-123.webm (45678 bytes)
   - Language: en
✅ [FRONTEND] Transcription completed in 2340ms
   - Result: Hello, how are you...

🔄 [FRONTEND] Starting translation...
   - Source: en → Target: ht
   - Tone: casual
   - Text length: 23 characters
✅ [FRONTEND] Translation completed in 1560ms
   - Result: Bonjou, kijan ou...

🔊 [FRONTEND] Starting synthesis...
   - Text length: 28 characters
   - Voice ID: 21m00Tcm4TlvDq8ikWAM
   - Language: ht
✅ [FRONTEND] Synthesis completed in 3450ms
   - Audio size: 1234 characters processed
```

### Backend Logs

```
📨 POST /api/transcribe
🎤 [BACKEND] Transcribing audio...
✅ [BACKEND] Transcription complete

📨 POST /api/translate
🔄 [BACKEND] Translating text...
✅ [BACKEND] Translation complete

📨 POST /api/synthesize
🔊 [BACKEND] Synthesizing speech...
✅ [BACKEND] Synthesis complete
```

## 🚨 Error Codes

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid API key)
- `404` - Not Found (invalid endpoint)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error
- `503` - Service Unavailable (API down)

### Custom Error Messages

```typescript
// Connection errors
"Cannot connect to server. Make sure backend is running..."

// Timeout errors
"Request timeout. Model may be loading (30-60s)..."

// API errors
"API authentication failed. Check your API keys..."

// Rate limit
"Too many requests. Please wait a moment..."
```

## 📦 Data Types

### TypeScript Interfaces

```typescript
// Voice types
interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  labels?: {
    gender?: string;
    age?: string;
    accent?: string;
  };
}

interface FallbackVoice {
  id: string;
  name: string;
  gender: string;
  language: string;
  description?: string;
}

// API responses
interface TranscriptionResponse {
  transcription: string;
  language: string;
  confidence: number;
}

interface TranslationResponse {
  translation: string;
  model: string;
  tokensUsed: number;
}

interface SynthesisResponse {
  audioUrl: string;
  characterCount: number;
}
```

## 🔗 External APIs Used

### 1. OpenAI Whisper API
- **Purpose**: Audio transcription
- **Endpoint**: `https://api.openai.com/v1/audio/transcriptions`
- **Model**: `whisper-1`

### 2. OpenAI GPT-4 API
- **Purpose**: Text translation
- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Model**: `gpt-4`

### 3. ElevenLabs API
- **Purpose**: Text-to-speech synthesis
- **Endpoint**: `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`
- **Voices Endpoint**: `https://api.elevenlabs.io/v1/voices`

## 🎉 Summary

The API integration provides:
- ✅ Complete translation pipeline
- ✅ Request deduplication
- ✅ Performance tracking
- ✅ Error handling
- ✅ Rate limiting
- ✅ Fallback mechanisms
- ✅ Comprehensive logging
- ✅ Type safety with TypeScript

All endpoints are production-ready and fully tested!
