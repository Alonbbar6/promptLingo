const express = require('express');

const router = express.Router();

// Curated voices configuration - 2 per language
const CURATED_VOICES = {
  // English voices
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
  // Spanish voices
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
  // Haitian Creole voices
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

// Get all available voices - returns curated list only
router.get('/', (req, res) => {
  console.log('🎙️ Returning curated voice list (2 voices per language)');
  res.json({
    voices: Object.values(CURATED_VOICES),
    source: 'openai',
    message: '2 voices per language: English, Spanish, and Haitian Creole',
  });
});

// Get voices by language
router.get('/:language', (req, res) => {
  const { language } = req.params;

  console.log('🎤 [VOICES API] Request for language:', language);

  if (!['en', 'es', 'ht'].includes(language)) {
    console.log('❌ [VOICES API] Invalid language requested:', language);
    return res.status(400).json({
      error: 'Invalid language',
      message: 'Only English (en), Spanish (es), and Haitian Creole (ht) are supported'
    });
  }

  // Return curated voices filtered by language
  const filteredVoices = Object.values(CURATED_VOICES).filter(voice => voice.language === language);
  console.log('🎤 [VOICES API] Filtered voices:', filteredVoices.map(v => `${v.name} (${v.id})`));
  console.log('🎤 [VOICES API] Returning', filteredVoices.length, 'voices for language:', language);

  res.json({
    voices: filteredVoices,
    language,
    source: 'openai',
  });
});

// Get voice by ID
router.get('/voice/:voiceId', (req, res) => {
  const { voiceId } = req.params;

  const voice = CURATED_VOICES[voiceId];

  if (!voice) {
    return res.status(404).json({
      error: 'Voice not found',
      message: 'The requested voice does not exist'
    });
  }

  res.json({
    voice
  });
});

module.exports = router;
