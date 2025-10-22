/**
 * WASM API Routes
 * Provides REST endpoints for WebAssembly text processing
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const wasmService = require('../services/wasmService');

const router = express.Router();

// Rate limiting for WASM endpoints
const wasmRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many WASM requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all WASM routes
router.use(wasmRateLimit);

/**
 * GET /api/wasm/health
 * Health check for WASM service
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await wasmService.healthCheck();
    
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json({
      success: healthStatus.status === 'healthy',
      ...healthStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('WASM health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/wasm/analyze
 * Analyze text using WASM
 */
router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;

    // Validation
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required and must be a string',
        code: 'INVALID_INPUT'
      });
    }

    if (text.length > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Text is too long (max 10,000 characters)',
        code: 'TEXT_TOO_LONG'
      });
    }

    const startTime = Date.now();
    const analysis = await wasmService.analyzeText(text);
    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        ...analysis,
        server_processing_time_ms: processingTime
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('WASM text analysis failed:', error);
    res.status(500).json({
      success: false,
      error: 'Text analysis failed',
      details: error.message,
      code: 'ANALYSIS_FAILED',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/wasm/process
 * Process text with filtering options
 */
router.post('/process', async (req, res) => {
  try {
    const { 
      text, 
      options = {} 
    } = req.body;

    // Validation
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required and must be a string',
        code: 'INVALID_INPUT'
      });
    }

    if (text.length > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Text is too long (max 10,000 characters)',
        code: 'TEXT_TOO_LONG'
      });
    }

    // Validate options
    const {
      filterProfanity = false,
      normalizeWhitespace = true
    } = options;

    if (typeof filterProfanity !== 'boolean' || typeof normalizeWhitespace !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Options must be boolean values',
        code: 'INVALID_OPTIONS'
      });
    }

    const startTime = Date.now();
    const result = await wasmService.processText(text, {
      filterProfanity,
      normalizeWhitespace
    });
    const serverProcessingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        ...result,
        server_processing_time_ms: serverProcessingTime
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('WASM text processing failed:', error);
    res.status(500).json({
      success: false,
      error: 'Text processing failed',
      details: error.message,
      code: 'PROCESSING_FAILED',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/wasm/batch
 * Batch process multiple texts
 */
router.post('/batch', async (req, res) => {
  try {
    const { 
      texts, 
      options = {} 
    } = req.body;

    // Validation
    if (!Array.isArray(texts)) {
      return res.status(400).json({
        success: false,
        error: 'Texts must be an array',
        code: 'INVALID_INPUT'
      });
    }

    if (texts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one text is required',
        code: 'EMPTY_BATCH'
      });
    }

    if (texts.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Too many texts (max 100 per batch)',
        code: 'BATCH_TOO_LARGE'
      });
    }

    // Validate each text
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      if (typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          error: `Text at index ${i} must be a string`,
          code: 'INVALID_TEXT_TYPE'
        });
      }
      if (text.length > 5000) {
        return res.status(400).json({
          success: false,
          error: `Text at index ${i} is too long (max 5,000 characters for batch)`,
          code: 'TEXT_TOO_LONG'
        });
      }
    }

    const startTime = Date.now();
    const results = await wasmService.batchProcess(texts, options);
    const serverProcessingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        results,
        batch_size: texts.length,
        processed_count: results.length,
        server_processing_time_ms: serverProcessingTime
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('WASM batch processing failed:', error);
    res.status(500).json({
      success: false,
      error: 'Batch processing failed',
      details: error.message,
      code: 'BATCH_FAILED',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/wasm/benchmark
 * Run performance benchmark
 */
router.post('/benchmark', async (req, res) => {
  try {
    const { 
      text, 
      iterations = 1000 
    } = req.body;

    // Validation
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required and must be a string',
        code: 'INVALID_INPUT'
      });
    }

    if (typeof iterations !== 'number' || iterations < 1 || iterations > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Iterations must be a number between 1 and 10,000',
        code: 'INVALID_ITERATIONS'
      });
    }

    if (text.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Text is too long for benchmark (max 1,000 characters)',
        code: 'TEXT_TOO_LONG'
      });
    }

    const result = await wasmService.benchmark(text, iterations);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('WASM benchmark failed:', error);
    res.status(500).json({
      success: false,
      error: 'Benchmark failed',
      details: error.message,
      code: 'BENCHMARK_FAILED',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/wasm/memory
 * Get memory usage statistics
 */
router.get('/memory', (req, res) => {
  try {
    const memoryUsage = wasmService.getMemoryUsage();
    
    res.json({
      success: true,
      data: memoryUsage,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to get memory usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get memory usage',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/wasm/stats
 * Get WASM service statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const memoryUsage = wasmService.getMemoryUsage();
    const healthStatus = await wasmService.healthCheck();
    
    res.json({
      success: true,
      data: {
        service_status: healthStatus.status,
        initialized: healthStatus.initialized,
        memory_usage: memoryUsage,
        capabilities: {
          text_analysis: true,
          text_processing: true,
          batch_processing: true,
          benchmarking: true,
          language_detection: true,
          sentiment_analysis: true,
          profanity_filtering: true
        },
        limits: {
          max_text_length: 10000,
          max_batch_size: 100,
          max_batch_text_length: 5000,
          max_benchmark_iterations: 10000
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to get WASM stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/wasm/cleanup
 * Cleanup WASM resources (admin endpoint)
 */
router.post('/cleanup', (req, res) => {
  try {
    wasmService.cleanup();
    
    res.json({
      success: true,
      message: 'WASM resources cleaned up successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('WASM cleanup failed:', error);
    res.status(500).json({
      success: false,
      error: 'Cleanup failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware for WASM routes
router.use((error, req, res, next) => {
  console.error('WASM route error:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error in WASM service',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
