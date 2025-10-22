const express = require('express');
const axios = require('axios');

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

    // Validate languages
    if (!LANGUAGE_CONFIGS[sourceLang] || !LANGUAGE_CONFIGS[targetLang]) {
      const supportedLanguages = Object.keys(LANGUAGE_CONFIGS).map(code => 
        `${LANGUAGE_CONFIGS[code].name} (${code})`
      ).join(', ');
      
      return res.status(400).json({
        error: 'Invalid language',
        message: `Supported languages: ${supportedLanguages}`
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

    console.log('  → Calling ChatGPT API...');
    const chatgptStart = Date.now();

    // Create content-policy safe system prompt with enhanced slang recognition
    const systemPrompt = `You are a professional translator specializing in ${LANGUAGE_CONFIGS[sourceLang].name} to ${LANGUAGE_CONFIGS[targetLang].name} translation with advanced language recognition capabilities.

CRITICAL INSTRUCTIONS:

1. SLANG & COLLOQUIALISM HANDLING:
   - Recognize ALL slang terms, colloquialisms, and informal expressions
   - Do NOT treat slang terms as proper names or leave them untranslated
   - Translate slang into appropriate professional equivalents
   - Examples of common patterns:
     * Greeting slang → formal greetings
     * Friend references → appropriate terms
     * Informal contractions → proper grammar
     * Casual expressions → professional language

2. TONE APPLICATION:
   - Apply ${toneConfig.name} tone: ${toneConfig.description}
   - Preserve the emotional intensity while maintaining professionalism
   - Use proper grammar, punctuation, and sentence structure
   - Maintain natural flow and readability

3. LANGUAGE PROCESSING:
   - Convert informal language to professional ${LANGUAGE_CONFIGS[targetLang].name}
   - Apply appropriate cultural context and idioms
   - Ensure grammatical correctness and clarity

4. OUTPUT REQUIREMENTS:
   - Provide ONLY the translated and formatted text
   - No explanations, notes, or metadata
   - Use complete sentences with proper punctuation

Translate the following text:`;

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
      tone: toneConfig.name
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
