const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const transcribeRoute = require('./routes/transcribe');
const translateRoute = require('./routes/translate');
const synthesizeRoute = require('./routes/synthesize');
const voicesRoute = require('./routes/voices');
const wasmRoute = require('./routes/wasm');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const healthRoute = require('./routes/health');
const { testConnection } = require('./db/connection');
const { requestLogger, errorLogger } = require('./middleware/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const validateEnv = require('./utils/validateEnv');

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
  'http://192.168.1.96:3000', // Local network access
  'http://192.168.1.96:3001', // Local network access
  /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // Allow all local network IPs
  'https://promptlingo.netlify.app', // Your Netlify production domain
  /https:\/\/.*\.netlify\.app$/, // All Netlify preview deployments
  'https://promptlingo-frontend.onrender.com', // Your Render frontend domain
  /https:\/\/.*\.onrender\.com$/, // All Render preview deployments
  process.env.FRONTEND_URL, // Dynamic frontend URL from environment
].filter(Boolean); // Remove undefined values

console.log('🌐 CORS Configuration:');
console.log('   - Allowed Origins:', allowedOrigins.filter(o => typeof o === 'string').join(', '));
console.log('   - Regex Patterns: Netlify and Render subdomains');

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      console.log('✅ CORS: Request with no origin allowed');
      return callback(null, true);
    }
    
    // Check if origin is in allowed list or matches regex pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      console.log(`✅ CORS: Allowed origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`❌ CORS: Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400, // 24 hours - cache preflight requests
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Logging
app.use(morgan('combined'));

// Request logging middleware
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

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
      corsTest: '/api/cors-test',
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

// CORS test endpoint for debugging
app.get('/api/cors-test', (req, res) => {
  console.log('🧪 CORS Test Request');
  console.log('   Origin:', req.headers.origin);
  console.log('   Method:', req.method);
  console.log('   User-Agent:', req.headers['user-agent']);

  res.json({
    message: '✅ CORS is working!',
    requestOrigin: req.headers.origin,
    allowedOrigins: allowedOrigins.filter(o => typeof o === 'string'),
    regexPatterns: ['Netlify subdomains', 'Render subdomains'],
    timestamp: new Date().toISOString(),
    headers: {
      'access-control-allow-origin': res.getHeader('access-control-allow-origin'),
      'access-control-allow-credentials': res.getHeader('access-control-allow-credentials'),
    }
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
          'xi-api-key': process.env.ELEVENLABS_API_KEY.trim(), // Trim whitespace
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
app.use('/api/health', healthRoute);
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/transcribe', upload.single('audio'), transcribeRoute);
app.use('/api/translate', translateRoute);
app.use('/api/synthesize', synthesizeRoute);
app.use('/api/voices', voicesRoute);
app.use('/api/wasm', wasmRoute);

// Error logging middleware
app.use(errorLogger);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use(notFoundHandler);

// API Keys validation
console.log('🔑 API Keys Check:');
console.log(`   - OpenAI: ${process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Missing'}`);
console.log(`   - ElevenLabs: ${process.env.ELEVENLABS_API_KEY ? '✓ Set' : '✗ Missing'}`);
console.log(`   - Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing'}`);
console.log(`   - Database: ${process.env.DATABASE_URL ? '✓ Set' : '✗ Missing'}`);
console.log(`   - JWT Secret: ${process.env.JWT_SECRET ? '✓ Set' : '✗ Missing'}`);

if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  WARNING: OPENAI_API_KEY not set. Transcription and translation will fail.');
}

if (!process.env.ELEVENLABS_API_KEY) {
  console.warn('⚠️  WARNING: ELEVENLABS_API_KEY not set. Speech synthesis will fail.');
}

if (!process.env.GOOGLE_CLIENT_ID) {
  console.warn('⚠️  WARNING: GOOGLE_CLIENT_ID not set. Google authentication will fail.');
}

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  WARNING: DATABASE_URL not set. User authentication and data persistence will fail.');
}

// Initialize database and start server
const startServer = async () => {
  try {
    // Validate environment variables (only for required ones)
    console.log('\n🔍 Validating environment variables...');
    try {
      validateEnv();
    } catch (error) {
      console.error('❌ Environment validation failed:', error.message);
      console.error('   Please check your .env file and ensure all required variables are set.');
      process.exit(1);
    }

    // Test database connection
    if (process.env.DATABASE_URL) {
      console.log('🔗 Testing database connection...');
      const connected = await testConnection();
      if (connected) {
        console.log('✅ Database ready\n');
      } else {
        console.warn('⚠️  Database connection failed, but server will continue\n');
      }
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📁 Uploads directory: ${uploadsDir}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`\n✅ Google OAuth Authentication System Ready!`);
      console.log(`   - Login: POST /api/auth/google/login`);
      console.log(`   - Logout: POST /api/auth/logout`);
      console.log(`   - Verify: GET /api/auth/verify`);
      console.log(`   - Refresh: POST /api/auth/refresh`);
      console.log(`   - Current User: GET /api/auth/user`);
      console.log(`   - Auth Status: GET /api/auth/status\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

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
