const express = require('express');
const axios = require('axios');
const { getTranslationPrompt, isLanguageSupported, getLanguageConfig } = require('../config/languages.config');

const router = express.Router();

// Tone configurations
const TONE_CONFIGS = {
  casual: {
    name: 'Casual',
    description: 'Everyday conversation, contractions welcome, relaxed vocabulary',
    prompt: 'Use everyday language, contractions welcome, relaxed vocabulary'
  },
  business: {
    name: 'Business',
    description: 'Professional but approachable, industry-appropriate terminology',
    prompt: 'Professional but approachable, industry-appropriate terminology'
  },
  formal: {
    name: 'Formal',
    description: 'Respectful address, no slang, proper grammatical structures',
    prompt: 'Respectful address, no slang, proper grammatical structures'
  },
  informal: {
    name: 'Informal',
    description: 'Very relaxed, friendly, conversational style',
    prompt: 'Very relaxed, friendly, conversational style'
  },
  medical: {
    name: 'Medical',
    description: 'Use precise medical terminology, clear and professional',
    prompt: 'Use precise medical terminology, clear and professional'
  }
};

// Language configurations
const LANGUAGE_CONFIGS = {
  en: { name: 'English', nativeName: 'English' },
  ht: { name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen' },
  es: { name: 'Spanish', nativeName: 'Español' }
};

router.post('/', async (req, res) => {
  const startTime = Date.now();
  console.log('🔄 [TRANSLATE] Request received');
  
  try {
    const { text, sourceLang, targetLang, tone } = req.body;
    
    console.log(`   - Source: ${sourceLang} → Target: ${targetLang}`);
    console.log(`   - Tone: ${tone}`);
    console.log(`   - Text length: ${text?.length} characters`);

    // Validate required fields
    if (!text || !sourceLang || !targetLang) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'text, sourceLang, and targetLang are required'
      });
    }

    // Validate languages using new config
    if (!isLanguageSupported(sourceLang) || !isLanguageSupported(targetLang)) {
      return res.status(400).json({
        error: 'Invalid language',
        message: `Unsupported language. Source: ${sourceLang}, Target: ${targetLang}`
      });
    }

    // Validate tone
    const toneConfig = TONE_CONFIGS[tone] || TONE_CONFIGS.casual;

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      const duration = Date.now() - startTime;
      console.error(`❌ [TRANSLATE] OpenAI API key not configured after ${duration}ms`);
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        message: 'Please configure OPENAI_API_KEY in environment variables'
      });
    }

    // Get language configs
    const sourceConfig = getLanguageConfig(sourceLang);
    const targetConfig = getLanguageConfig(targetLang);
    
    console.log('  → Calling ChatGPT API...');
    const chatgptStart = Date.now();

    // Get language-specific translation prompt
    const systemPrompt = getTranslationPrompt(sourceLang, targetLang, tone || 'neutral');
    
    console.log(`  → Translating from ${sourceConfig.nativeName} to ${targetConfig.nativeName}`);
    console.log(`  → Using tone: ${tone || 'neutral'}`);

    // Call OpenAI ChatGPT API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    const chatgptDuration = Date.now() - chatgptStart;
    console.log(`  ← ChatGPT API responded in ${chatgptDuration}ms`);

    const translation = response.data.choices[0].message.content.trim();
    const usage = response.data.usage;

    const totalDuration = Date.now() - startTime;
    console.log(`✅ [TRANSLATE] Completed in ${totalDuration}ms`);
    console.log(`   - ChatGPT API: ${chatgptDuration}ms`);
    console.log(`   - Translation: ${translation?.substring(0, 50)}...`);
    
    res.json({
      translation,
      model: 'gpt-4o-mini',
      tokensUsed: usage.total_tokens,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      sourceLanguageName: sourceConfig.nativeName,
      targetLanguageName: targetConfig.nativeName,
      tone: tone || 'neutral'
    });

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`❌ [TRANSLATE] Failed after ${totalDuration}ms:`, error.message);

    if (error.response) {
      const { status, data } = error.response;
      console.error(`   - API Error ${status}:`, data);
      return res.status(status).json({
        error: 'Translation failed',
        message: data.error?.message || 'Failed to translate text',
        details: data.error
      });
    }

    if (error.code === 'ECONNABORTED') {
      console.error('   - Request timeout');
      return res.status(408).json({
        error: 'Request timeout',
        message: 'Translation request timed out'
      });
    }

    res.status(500).json({
      error: 'Translation failed',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

// Get available tones
router.get('/tones', (req, res) => {
  res.json({
    tones: Object.entries(TONE_CONFIGS).map(([id, config]) => ({
      id,
      ...config
    }))
  });
});

// Get available languages
router.get('/languages', (req, res) => {
  res.json({
    languages: Object.entries(LANGUAGE_CONFIGS).map(([code, config]) => ({
      code,
      ...config
    }))
  });
});

module.exports = router;
