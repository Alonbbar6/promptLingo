const express = require('express');
const axios = require('axios');

const router = express.Router();

/**
 * Maps language codes to ElevenLabs-supported languages
 * Haitian Creole (ht) → French (fr) since they're linguistically similar
 * and ElevenLabs doesn't directly support Haitian Creole
 */
function getElevenLabsLanguageCode(languageCode) {
  const languageMap = {
    'ht': 'fr',  // Haitian Creole → French
    'en': 'en',  // English
    'es': 'es',  // Spanish
    'fr': 'fr',  // French
    'de': 'de',  // German
    'it': 'it',  // Italian
    'pt': 'pt',  // Portuguese
    'pl': 'pl',  // Polish
    'nl': 'nl',  // Dutch
    'sv': 'sv',  // Swedish
    'hi': 'hi',  // Hindi
    'ja': 'ja',  // Japanese
    'ko': 'ko',  // Korean
    'zh': 'zh',  // Chinese
    'ar': 'ar',  // Arabic
  };

  const mappedLanguage = languageMap[languageCode] || 'en';
  
  if (languageCode !== mappedLanguage) {
    console.log(`🗣️ Language mapping: ${languageCode} → ${mappedLanguage}`);
  }
  
  return mappedLanguage;
}

// Available voices configuration
const VOICES = {
  'male-1': {
    id: 'male-1',
    name: 'Jean-Pierre',
    gender: 'male',
    language: 'ht',
    description: 'Male Haitian Creole voice - warm and professional'
  },
  'female-1': {
    id: 'female-1',
    name: 'Marie-Claire',
    gender: 'female',
    language: 'ht',
    description: 'Female Haitian Creole voice - clear and friendly'
  },
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
  }
};

// ElevenLabs voice mapping (you'll need to replace these with actual voice IDs)
const ELEVENLABS_VOICE_IDS = {
  'male-1': 'pNInz6obpgDQGcFmaJgB', // Replace with actual voice ID
  'female-1': 'EXAVITQu4vr4xnSDxMaL', // Replace with actual voice ID
  'male-en': 'pNInz6obpgDQGcFmaJgB', // Replace with actual voice ID
  'female-en': 'EXAVITQu4vr4xnSDxMaL' // Replace with actual voice ID
};

router.post('/', async (req, res) => {
  const startTime = Date.now();
  console.log('🔊 [SYNTHESIZE] Request received');
  
  try {
    const { text, voiceId, language } = req.body;
    
    // Map Haitian Creole to French for ElevenLabs compatibility
    const elevenLabsLanguage = getElevenLabsLanguageCode(language);
    
    console.log(`   - Text length: ${text?.length} characters`);
    console.log(`   - Voice ID: ${voiceId}`);
    console.log(`   - Original language: ${language}`);
    console.log(`   - ElevenLabs language: ${elevenLabsLanguage}`);
    console.log(`   - Text preview: ${text?.substring(0, 50)}${text?.length > 50 ? '...' : ''}`);

    // Validate required fields
    if (!text || !voiceId) {
      console.error('❌ [SYNTHESIZE] Missing required fields');
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'text and voiceId are required'
      });
    }

    // Validate API key
    if (!process.env.ELEVENLABS_API_KEY) {
      const duration = Date.now() - startTime;
      console.error(`❌ [SYNTHESIZE] ElevenLabs API key not configured after ${duration}ms`);
      return res.status(500).json({
        error: 'ElevenLabs API key not configured',
        message: 'Please configure ELEVENLABS_API_KEY in environment variables'
      });
    }

    // Use the voiceId directly - it's already an ElevenLabs voice ID
    const elevenLabsVoiceId = voiceId;

    console.log('  → Calling ElevenLabs API...');
    const elevenLabsStart = Date.now();

    // Call ElevenLabs API with language mapping
    const requestBody = {
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    };

    // Add language code for better pronunciation if it's not English
    if (elevenLabsLanguage !== 'en') {
      requestBody.language_code = elevenLabsLanguage;
      console.log(`   - Added language_code: ${elevenLabsLanguage}`);
    }

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`,
      requestBody,
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        },
        responseType: 'arraybuffer',
        timeout: 30000 // 30 second timeout
      }
    );

    const elevenLabsDuration = Date.now() - elevenLabsStart;
    console.log(`  ← ElevenLabs API responded in ${elevenLabsDuration}ms`);

    // Convert audio buffer to base64 for transmission
    const audioBuffer = Buffer.from(response.data);
    const audioBase64 = audioBuffer.toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    const totalDuration = Date.now() - startTime;
    console.log(`✅ [SYNTHESIZE] Completed in ${totalDuration}ms`);
    console.log(`   - ElevenLabs API: ${elevenLabsDuration}ms`);
    console.log(`   - Audio size: ${audioBuffer.length} bytes`);

    res.json({
      audioUrl,
      characterCount: text.length,
      voiceId,
      originalLanguage: language,
      elevenLabsLanguage: elevenLabsLanguage,
      synthesisTime: totalDuration
    });

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`❌ [SYNTHESIZE] Failed after ${totalDuration}ms:`, error.message);

    if (error.response) {
      const { status, data } = error.response;
      console.error(`   - API Error ${status}:`, data);
      
      // Provide specific error message for language issues
      let errorMessage = data.detail || 'Failed to synthesize speech';
      if (typeof data === 'string' && data.includes('not supported')) {
        errorMessage = `Language issue: ${errorMessage}. Note: Haitian Creole uses French voice models.`;
      }
      
      return res.status(status).json({
        error: 'Synthesis failed',
        message: errorMessage,
        originalLanguage: language,
        mappedLanguage: getElevenLabsLanguageCode(language),
        details: data
      });
    }

    if (error.code === 'ECONNABORTED') {
      console.error('   - Request timeout');
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
