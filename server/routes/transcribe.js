const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs-extra');
const path = require('path');

const router = express.Router();

// OpenAI Whisper API integration
router.post('/', async (req, res) => {
  const startTime = Date.now();
  console.log('🎤 [TRANSCRIBE] Request received');
  
  try {
    if (!req.file) {
      const duration = Date.now() - startTime;
      console.error(`❌ [TRANSCRIBE] No file provided after ${duration}ms`);
      return res.status(400).json({
        error: 'No audio file provided',
        message: 'Please provide an audio file to transcribe'
      });
    }

    console.log(`   - Audio file: ${req.file.originalname}`);
    console.log(`   - File size: ${req.file.size} bytes (${(req.file.size / 1024 / 1024).toFixed(2)}MB)`);
    console.log(`   - MIME type: ${req.file.mimetype}`);
    
    // Check file size limit
    if (req.file.size > 25 * 1024 * 1024) {
      const duration = Date.now() - startTime;
      console.warn(`⚠️ [TRANSCRIBE] Large audio file: ${(req.file.size / 1024 / 1024).toFixed(2)}MB after ${duration}ms`);
      return res.status(413).json({
        error: 'Audio file too large',
        message: 'Audio file must be less than 25MB'
      });
    }

    const { language } = req.body;
    console.log(`   - Language hint: ${language || 'auto'}`);
    
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      const duration = Date.now() - startTime;
      console.error(`❌ [TRANSCRIBE] OpenAI API key not configured after ${duration}ms`);
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        message: 'Please configure OPENAI_API_KEY in environment variables'
      });
    }

    console.log('  → Calling Whisper API...');
    const whisperStart = Date.now();

    // Prepare form data for OpenAI API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));
    formData.append('model', 'whisper-1');
    
    // Only append language for supported languages
    // Whisper doesn't support 'ht' (Haitian Creole), so we let it auto-detect
    if (language && language === 'en') {
      formData.append('language', language);
      console.log(`   - Language parameter sent to Whisper: ${language}`);
    } else if (language === 'ht') {
      console.log(`   - Haitian Creole detected, using auto-detection (Whisper doesn't support 'ht')`);
      // Don't send language parameter, let Whisper auto-detect
    }

    // Call OpenAI Whisper API
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders()
        },
        timeout: 30000 // 30 second timeout
      }
    );

    const whisperDuration = Date.now() - whisperStart;
    console.log(`  ← Whisper API responded in ${whisperDuration}ms`);

    // Clean up uploaded file
    await fs.remove(req.file.path);

    const totalDuration = Date.now() - startTime;
    console.log(`✅ [TRANSCRIBE] Completed in ${totalDuration}ms`);
    console.log(`   - Whisper API: ${whisperDuration}ms`);
    console.log(`   - Result: ${response.data.text?.substring(0, 50)}...`);

    // Return transcription result
    res.json({
      transcription: response.data.text,
      language: language || 'auto',
      confidence: 0.95, // Whisper doesn't provide confidence scores
      model: 'whisper-1'
    });

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`❌ [TRANSCRIBE] Failed after ${totalDuration}ms:`, error.message);
    
    // Clean up uploaded file on error
    if (req.file) {
      await fs.remove(req.file.path).catch(console.error);
    }

    if (error.response) {
      const { status, data } = error.response;
      console.error(`   - API Error ${status}:`, data);
      return res.status(status).json({
        error: 'Transcription failed',
        message: data.error?.message || 'Failed to transcribe audio',
        details: data.error
      });
    }

    if (error.code === 'ECONNABORTED') {
      console.error('   - Request timeout');
      return res.status(408).json({
        error: 'Request timeout',
        message: 'Audio file too large or processing took too long'
      });
    }

    res.status(500).json({
      error: 'Transcription failed',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

module.exports = router;
