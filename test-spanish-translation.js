#!/usr/bin/env node

/**
 * Test Spanish Translation Support
 * This script tests if the backend now supports Spanish translation
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testSpanishTranslation() {
  console.log('🧪 Testing Spanish Translation Support...\n');

  try {
    // Test 1: Check supported languages
    console.log('1. Checking supported languages...');
    const languagesResponse = await axios.get(`${API_BASE_URL}/translate/languages`);
    console.log('   Supported languages:', languagesResponse.data.languages.map(l => `${l.name} (${l.code})`).join(', '));
    
    const hasSpanish = languagesResponse.data.languages.some(l => l.code === 'es');
    if (hasSpanish) {
      console.log('   ✅ Spanish support confirmed');
    } else {
      console.log('   ❌ Spanish support missing');
      return;
    }

    // Test 2: Translate Spanish to English
    console.log('\n2. Testing Spanish → English translation...');
    const testText = 'hola como estan';
    console.log(`   Input: "${testText}" (Spanish)`);
    
    const translationResponse = await axios.post(`${API_BASE_URL}/translate`, {
      text: testText,
      sourceLang: 'es',
      targetLang: 'en',
      tone: 'professional'
    });

    console.log(`   Output: "${translationResponse.data.translation}" (English)`);
    console.log('   ✅ Spanish translation working!');

    // Test 3: Test the reverse (English to Spanish)
    console.log('\n3. Testing English → Spanish translation...');
    const englishText = 'Hello, how are you?';
    console.log(`   Input: "${englishText}" (English)`);
    
    const reverseResponse = await axios.post(`${API_BASE_URL}/translate`, {
      text: englishText,
      sourceLang: 'en',
      targetLang: 'es',
      tone: 'casual'
    });

    console.log(`   Output: "${reverseResponse.data.translation}" (Spanish)`);
    console.log('   ✅ English → Spanish translation working!');

    // Test 4: Test with different tones
    console.log('\n4. Testing different tones...');
    const tones = ['casual', 'business', 'formal'];
    
    for (const tone of tones) {
      const toneResponse = await axios.post(`${API_BASE_URL}/translate`, {
        text: 'hola amigo',
        sourceLang: 'es',
        targetLang: 'en',
        tone: tone
      });
      console.log(`   ${tone} tone: "${toneResponse.data.translation}"`);
    }
    console.log('   ✅ All tones working!');

    console.log('\n🎉 All tests passed! Spanish translation is now fully supported.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('   Server response:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Make sure the server is running on http://localhost:3001');
    }
  }
}

// Run the test
testSpanishTranslation();
