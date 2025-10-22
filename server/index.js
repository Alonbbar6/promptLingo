const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

const transcribeRoute = require('./routes/transcribe');
const translateRoute = require('./routes/translate');
const synthesizeRoute = require('./routes/synthesize');
const voicesRoute = require('./routes/voices');
const wasmRoute = require('./routes/wasm');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS configuration - must be before routes
// Allow both local development and production domains
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173', // Vite dev server
  'https://promptlingo.netlify.app', // Your Netlify production domain
  /https:\/\/.*\.netlify\.app$/, // All Netlify preview deployments
  'https://promptlingo-frontend.onrender.com', // Your Render frontend domain
  /https:\/\/.*\.onrender\.com$/, // All Render preview deployments
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches regex pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// Logging
app.use(morgan('combined'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/mp4',
      'audio/mpeg',
      'audio/mpga',
      'audio/m4a',
      'audio/wav',
      'audio/webm'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'), false);
    }
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'PromptLingo API is running',
    status: 'ok',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      apiHealth: '/api/health',
      transcribe: '/api/transcribe',
      translate: '/api/translate',
      synthesize: '/api/synthesize',
      voices: '/api/voices'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API health check endpoint with ElevenLabs status
app.get('/api/health', async (req, res) => {
  const hasElevenLabs = !!process.env.ELEVENLABS_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;

  // Test ElevenLabs connection if key exists
  let elevenLabsStatus = 'not configured';
  let voicesCount = 0;
  
  if (hasElevenLabs) {
    try {
      const axios = require('axios');
      const testResponse = await axios.get('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        timeout: 5000,
      });
      
      if (testResponse.data && testResponse.data.voices) {
        voicesCount = testResponse.data.voices.length;
        elevenLabsStatus = `working (${voicesCount} voices available)`;
      } else {
        elevenLabsStatus = 'error: no voices returned';
      }
    } catch (error) {
      elevenLabsStatus = `error: ${error.message}`;
    }
  }

  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    apis: {
      openai: hasOpenAI ? 'configured' : 'missing',
      elevenlabs: elevenLabsStatus,
      elevenLabsVoicesCount: voicesCount,
    },
    browserTTSAvailable: true, // Always available as fallback
  });
});

// API routes
app.use('/api/transcribe', upload.single('audio'), transcribeRoute);
app.use('/api/translate', translateRoute);
app.use('/api/synthesize', synthesizeRoute);
app.use('/api/voices', voicesRoute);
app.use('/api/wasm', wasmRoute);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Audio file must be less than 25MB'
      });
    }
  }
  
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// API Keys validation
console.log('🔑 API Keys Check:');
console.log(`   - OpenAI: ${process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Missing'}`);
console.log(`   - ElevenLabs: ${process.env.ELEVENLABS_API_KEY ? '✓ Set' : '✗ Missing'}`);

if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  WARNING: OPENAI_API_KEY not set. Transcription and translation will fail.');
}

if (!process.env.ELEVENLABS_API_KEY) {
  console.warn('⚠️  WARNING: ELEVENLABS_API_KEY not set. Speech synthesis will fail.');
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
