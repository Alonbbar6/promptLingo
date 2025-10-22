// Quick test script to verify content filtering works
// Run with: node test-content-filter.js

// Simulate the content filter functions
const profanityList = [
  'fuck', 'f*ck', 'f**k', 'fck', 'fuk', 'f***', 'f****',
  'fucking', 'f*cking', 'f**king', 'fcking', 'fuking',
  'shit', 'sh*t', 'sh1t', 'sht', 's**t', 'shite', 'shitty',
  'damn', 'd*mn', 'd**n', 'dang', 'darn',
  'hell', 'h*ll', 'h**l', 'heck',
  'crap', 'cr*p', 'cr**', 'crappy',
  'ass', 'a**', 'a$$', 'arse', 'asshole', 'a**hole',
  'bitch', 'b*tch', 'b1tch', 'btch', 'bitchy',
  'bastard', 'b*stard', 'b**tard',
  'dick', 'd*ck', 'd1ck',
  'piss', 'p*ss', 'p1ss', 'pissed', 'pissing',
  'wtf', 'what the f*ck', 'what the fuck', 'what the hell',
  'bullshit', 'bull shit', 'bs',
  'goddamn', 'god damn', 'goddam',
  'bloody', 'christ', 'jesus christ', 'motherfucker', 'son of a bitch'
];

const replacements = {
  'fuck': '', 'f*ck': '', 'f**k': '', 'fck': '', 'fuk': '', 'f***': '', 'f****': '',
  'fucking': 'extremely', 'f*cking': 'extremely', 'f**king': 'extremely', 'fcking': 'extremely', 'fuking': 'extremely',
  'shit': 'stuff', 'sh*t': 'stuff', 'sh1t': 'stuff', 'sht': 'stuff', 's**t': 'stuff', 'shite': 'stuff', 'shitty': 'poor quality',
  'damn': 'very', 'd*mn': 'very', 'd**n': 'very', 'dang': 'very', 'darn': 'very',
  'hell': '', 'h*ll': '', 'h**l': '', 'heck': '',
  'crap': 'nonsense', 'cr*p': 'nonsense', 'cr**': 'nonsense', 'crappy': 'poor quality',
  'wtf': 'what', 'what the f*ck': 'what', 'what the fuck': 'what', 'what the hell': 'what',
  'bullshit': 'nonsense', 'bull shit': 'nonsense', 'bs': 'nonsense'
};

const slangMap = {
  'yo': 'hello', 'sup': 'hello', 'wassup': 'hello', 'whats up': 'hello', 'what\'s up': 'hello',
  'whatsup': 'hello', 'sup yo': 'hello', 'yo sup': 'hello',
  'dawg': 'friend', 'bro': 'friend', 'bruh': 'friend', 'dude': 'friend', 'homie': 'friend',
  'gonna': 'going to', 'wanna': 'want to', 'gotta': 'have to', 'ain\'t': 'is not'
};

function filterProfanity(text) {
  let cleanedText = text;
  const detectedWords = [];
  let wasFiltered = false;

  const sortedProfanity = [...profanityList].sort((a, b) => b.length - a.length);

  sortedProfanity.forEach(word => {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '\\*');
    const hasSpaces = word.includes(' ');
    const regex = hasSpaces 
      ? new RegExp(`${escapedWord}`, 'gi')
      : new RegExp(`\\b${escapedWord}\\b`, 'gi');
    
    if (regex.test(cleanedText)) {
      wasFiltered = true;
      if (!detectedWords.includes(word)) {
        detectedWords.push(word);
      }
      
      const replacement = replacements[word.toLowerCase()] || '';
      cleanedText = cleanedText.replace(regex, replacement);
    }
  });

  cleanedText = cleanedText
    .replace(/\s+/g, ' ')  // Multiple spaces to single space
    .replace(/\s+([.!?])/g, '$1')  // Remove space before punctuation
    .replace(/([.!?])\s+/g, '$1 ')  // Ensure single space after punctuation
    .replace(/\s+(about|with|for|to|in|on|at)\s+/g, ' $1 ')  // Fix preposition spacing
    .trim();
  return { cleanedText, wasFiltered, detectedWords };
}

function normalizeSlang(text) {
  let normalizedText = text;
  const sortedSlang = Object.entries(slangMap).sort((a, b) => b[0].length - a[0].length);
  
  sortedSlang.forEach(([slang, formal]) => {
    const regex = new RegExp(`\\b${slang.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    normalizedText = normalizedText.replace(regex, formal);
  });

  return normalizedText;
}

function sanitizeInput(text) {
  const profanityResult = filterProfanity(text);
  const sanitizedText = normalizeSlang(profanityResult.cleanedText);
  
  return {
    filteredText: sanitizedText,
    wasFiltered: profanityResult.wasFiltered,
    detectedIssues: profanityResult.detectedWords
  };
}

// Test cases
const testCases = [
  "whats up yo what the fuck is going on?",
  "yo dawg this shit is crazy",
  "sup bro gonna hit you up later",
  "this is damn good stuff",
  "what the hell happened here",
  "you're being a dick about this"
];

console.log('🧪 Testing Content Filter...\n');

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: "${testCase}"`);
  const result = sanitizeInput(testCase);
  console.log(`Filtered: "${result.filteredText}"`);
  console.log(`Was Filtered: ${result.wasFiltered}`);
  console.log(`Issues: ${result.detectedIssues.join(', ')}`);
  console.log('---');
});

console.log('\n✅ Content filter test completed!');
