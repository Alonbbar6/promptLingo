const express = require('express');
const axios = require('axios');
const { validateSynthesize } = require('../middleware/validation');

const router = express.Router();

// OpenAI TTS voice options
// All voices are multilingual and auto-detect language from input text
const OPENAI_VOICES = {
  'male-en': 'onyx',
  'female-en': 'nova',
  'male-es': 'onyx',
  'female-es': 'nova',
  'male-ht': 'onyx',
  'female-ht': 'nova',
};

const DEFAULT_VOICE = 'nova';

// Available voices configuration - 2 per language
const VOICES = {
  'male-en': {
    id: 'male-en',
    name: 'David',
    gender: 'male',
    language: 'en',
    description: 'Male English voice - clear and professional'
  },
  'female-en': {
    id: 'female-en',
    name: 'Sarah',
    gender: 'female',
    language: 'en',
    description: 'Female English voice - warm and articulate'
  },
  'male-es': {
    id: 'male-es',
    name: 'Carlos',
    gender: 'male',
    language: 'es',
    description: 'Male Spanish voice - clear and natural'
  },
  'female-es': {
    id: 'female-es',
    name: 'Maria',
    gender: 'female',
    language: 'es',
    description: 'Female Spanish voice - warm and expressive'
  },
  'male-ht': {
    id: 'male-ht',
    name: 'Jean-Pierre',
    gender: 'male',
    language: 'ht',
    description: 'Male Haitian Creole voice - warm and professional'
  },
  'female-ht': {
    id: 'female-ht',
    name: 'Marie-Claire',
    gender: 'female',
    language: 'ht',
    description: 'Female Haitian Creole voice - clear and friendly'
  }
};

router.post('/', validateSynthesize, async (req, res) => {
  const startTime = Date.now();
  console.log('🔊 [SYNTHESIZE] Request received (OpenAI TTS)');

  const { text, voiceId, language } = req.body;

  try {
    console.log(`   - Text length: ${text?.length} characters`);
    console.log(`   - Voice ID: ${voiceId}`);
    console.log(`   - Language: ${language}`);

    if (!text || !voiceId) {
      console.error('❌ [SYNTHESIZE] Missing required fields');
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'text and voiceId are required'
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ [SYNTHESIZE] OpenAI API key not configured');
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        message: 'Please configure OPENAI_API_KEY in environment variables'
      });
    }

    // Map voiceId to OpenAI voice name
    const openaiVoice = OPENAI_VOICES[voiceId] || DEFAULT_VOICE;
    console.log(`   - OpenAI voice: ${openaiVoice}`);

    console.log('  → Calling OpenAI TTS API (tts-1-hd)...');
    const ttsStart = Date.now();

    const response = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      {
        model: 'tts-1-hd',
        input: text,
        voice: openaiVoice,
        response_format: 'mp3',
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
        timeout: 30000,
      }
    );

    const ttsDuration = Date.now() - ttsStart;
    console.log(`  ← OpenAI TTS responded in ${ttsDuration}ms`);

    const audioBuffer = Buffer.from(response.data);
    const audioBase64 = audioBuffer.toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    const totalDuration = Date.now() - startTime;
    console.log(`✅ [SYNTHESIZE] Completed in ${totalDuration}ms`);
    console.log(`   - Audio size: ${audioBuffer.length} bytes`);

    res.json({
      audioUrl,
      characterCount: text.length,
      voiceId,
      language,
      synthesisTime: totalDuration
    });

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`❌ [SYNTHESIZE] Failed after ${totalDuration}ms:`, error.message);

    if (error.response) {
      const { status, data } = error.response;
      let errorData = data;
      if (Buffer.isBuffer(data)) {
        try { errorData = JSON.parse(data.toString()); } catch(e) { errorData = data.toString(); }
      }
      console.error(`   - API Error ${status}:`, errorData);

      let errorMessage = errorData?.error?.message || 'Failed to synthesize speech';

      if (status === 401) {
        errorMessage = 'Invalid OpenAI API key';
      } else if (status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      }

      return res.status(status).json({
        error: 'Synthesis failed',
        message: errorMessage,
        voiceId,
        details: errorData
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        error: 'Request timeout',
        message: 'Synthesis request timed out'
      });
    }

    res.status(500).json({
      error: 'Synthesis failed',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

// Get available voices
router.get('/', (req, res) => {
  res.json({
    voices: Object.values(VOICES)
  });
});

module.exports = router;
