// Quick test script to verify the voices API is working
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Testing Voices API...\n');

  // Test 1: English voices
  console.log('📍 Test 1: GET /api/voices/en');
  try {
    const response = await fetch(`${API_URL}/api/voices/en`);
    const data = await response.json();
    console.log('   Status:', response.status);
    console.log('   Source:', data.source);
    console.log('   Voices:', data.voices?.map(v => `${v.name} (${v.id})`));
    console.log('   ✅ English API works!\n');
  } catch (error) {
    console.error('   ❌ Failed:', error.message, '\n');
  }

  // Test 2: Spanish voices
  console.log('📍 Test 2: GET /api/voices/es');
  try {
    const response = await fetch(`${API_URL}/api/voices/es`);
    const data = await response.json();
    console.log('   Status:', response.status);
    console.log('   Source:', data.source);
    console.log('   Voices:', data.voices?.map(v => `${v.name} (${v.id})`));
    console.log('   ✅ Spanish API works!\n');
  } catch (error) {
    console.error('   ❌ Failed:', error.message, '\n');
  }

  // Test 3: Haitian Creole voices
  console.log('📍 Test 3: GET /api/voices/ht');
  try {
    const response = await fetch(`${API_URL}/api/voices/ht`);
    const data = await response.json();
    console.log('   Status:', response.status);
    console.log('   Source:', data.source);
    console.log('   Voices:', data.voices?.map(v => `${v.name} (${v.id})`));
    console.log('   ✅ Haitian Creole API works!\n');
  } catch (error) {
    console.error('   ❌ Failed:', error.message, '\n');
  }
}

testAPI().catch(console.error);
