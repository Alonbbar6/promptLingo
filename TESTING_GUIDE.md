# Testing Guide - Translation App

## 🚀 Quick Start

### 1. Start the Backend
```bash
cd server
npm install
npm start
```

Expected output:
```
🔑 API Keys Check:
   - OpenAI: ✓ Set
   - ElevenLabs: ✓ Set (or ✗ Missing)
🚀 Server running on port 3001
```

### 2. Start the Frontend
```bash
cd client
npm install
npm start
```

The app should open at `http://localhost:3000`

## 📋 Testing Scenarios

### Scenario 1: Complete Translation Flow
**Goal**: Test the entire translation pipeline

1. Click "Start Recording" or press **Space**
2. Speak in English: "Hello, how are you today?"
3. Click "Stop" or press **Space** again
4. **Expected**:
   - Progress bar appears showing 3 stages
   - Stage 1: "Transcribing audio..." (33%)
   - Stage 2: "Translating text..." (66%)
   - Stage 3: "Finalizing..." (90%)
   - Stage 4: "Complete!" (100%)
   - Translation appears in both panels
   - Audio automatically plays (if auto-play enabled)
   - Performance metrics logged to console

**Console Output**:
```
🚀 [FRONTEND] Starting translation request #1...
✅ Step 1 (Request #1): Transcription complete in 2.34s
✅ Step 2 (Request #1): Translation complete in 1.56s
⏱️ Performance Metrics:
   Transcription: 2.34s
   Translation: 1.56s
   Total: 3.90s
```

### Scenario 2: Request Deduplication
**Goal**: Verify only one request processes at a time

1. Start recording
2. Stop recording
3. **Immediately** start and stop recording again (before first completes)
4. **Expected**:
   - First request processes normally
   - Second request is skipped with console message:
   ```
   ⏭️ Skipping translation - already processing
   ```
   - Only ONE translation appears
   - No duplicate audio generation

### Scenario 3: ElevenLabs Voice Selection
**Goal**: Test voice integration

**With ElevenLabs API Key**:
1. Open Settings in Audio Player
2. Check Voice Selection dropdown
3. **Expected**:
   - Shows "(ElevenLabs)" label
   - Lists multilingual voices
   - Voice names like "Rachel", "Drew", etc.

**Without ElevenLabs API Key**:
1. Open Settings in Audio Player
2. Check Voice Selection dropdown
3. **Expected**:
   - Shows fallback voices
   - Message: "Configure ELEVENLABS_API_KEY for more voice options"
   - Voices: Jean-Pierre, Marie-Claire, David, Sarah

### Scenario 4: Error Handling
**Goal**: Test user-friendly error messages

**Test 4a: Backend Disconnected**
1. Stop the backend server
2. Try to record and translate
3. **Expected**:
   - Red error box appears
   - Title: "Connection Error"
   - Message: "Cannot reach the server. Make sure the backend is running on http://localhost:3001"
   - Dismissible with X button

**Test 4b: First Request (Model Loading)**
1. Restart backend (fresh start)
2. Record and translate
3. **Expected**:
   - Progress shows: "First request may take 30-60 seconds (model loading)"
   - Request completes in 30-60 seconds
   - Subsequent requests are faster (4-9 seconds)

**Test 4c: Microphone Permission Denied**
1. Deny microphone permissions in browser
2. Click "Start Recording"
3. **Expected**:
   - Error message about microphone access
   - Instructions to check browser permissions

### Scenario 5: Keyboard Shortcuts
**Goal**: Test keyboard controls

1. Press **Space** (not in input field)
   - **Expected**: Recording starts
2. Press **Space** again
   - **Expected**: Recording stops
3. Press **Space** to start recording
4. Press **Escape**
   - **Expected**: Recording stops/cancels
5. Type in a text input field and press **Space**
   - **Expected**: Space character typed, no recording

### Scenario 6: Different Tones
**Goal**: Test tone variations

1. Select "Casual" tone
2. Record: "I need help with my medication"
3. Note the translation
4. Select "Medical" tone
5. Record the same phrase
6. **Expected**:
   - Medical tone uses more formal/technical language
   - Different vocabulary choices
   - Both translations are accurate but styled differently

### Scenario 7: Language Switching
**Goal**: Test bidirectional translation

**English → Haitian Creole**:
1. Source: English, Target: Haitian Creole
2. Record in English
3. **Expected**: Translation in Haitian Creole

**Haitian Creole → English**:
1. Click swap languages button
2. Source: Haitian Creole, Target: English
3. Record in Haitian Creole
4. **Expected**: Translation in English

### Scenario 8: Performance Metrics
**Goal**: Verify accurate timing

1. Open browser console (F12)
2. Record and translate
3. **Expected Console Output**:
```
🚀 [FRONTEND] Starting translation request #1...
   - Source lang: en
   - Target lang: ht
   - Audio size: 45678 bytes
🎤 [FRONTEND] Starting transcription...
✅ [FRONTEND] Transcription completed in 2340ms
🔄 [FRONTEND] Starting translation...
✅ [FRONTEND] Translation completed in 1560ms
🎵 Starting audio generation request #1
✅ Audio generation request #1 completed in 3.45s
⏱️ Performance Metrics:
   Transcription: 2.34s
   Translation: 1.56s
   Total: 3.90s
```

### Scenario 9: Memory Management
**Goal**: Verify no memory leaks

1. Record and translate 5 times in a row
2. Open browser DevTools → Memory tab
3. Take heap snapshot
4. **Expected**:
   - Console shows cleanup messages:
   ```
   🧹 Cleaned up old recording audio URL
   🧹 Cleaned up old audio URL
   ```
   - No excessive blob URLs in memory
   - Memory usage stays reasonable

### Scenario 10: Audio Playback Controls
**Goal**: Test audio player features

1. Complete a translation
2. Click "Play" button
   - **Expected**: Audio plays
3. Click "Pause" button
   - **Expected**: Audio pauses
4. Click "Download" button
   - **Expected**: Audio file downloads
5. Open Settings:
   - Adjust volume slider
   - Change playback speed (0.5x, 1x, 1.5x, 2x)
   - Toggle auto-play
   - **Expected**: All controls work smoothly

## 🐛 Common Issues & Solutions

### Issue: "Model is loading" message
**Solution**: Wait 30-60 seconds on first request. This is normal for cold start.

### Issue: No voices showing
**Solution**: 
1. Check backend is running
2. Check console for errors
3. Verify API endpoint: `http://localhost:3001/api/voices`

### Issue: Microphone not working
**Solution**:
1. Check browser permissions
2. Use HTTPS or localhost (required for microphone access)
3. Try different browser

### Issue: Translation fails
**Solution**:
1. Check OPENAI_API_KEY is set in `.env`
2. Check backend logs for errors
3. Verify audio file is valid format

### Issue: Audio synthesis fails
**Solution**:
1. Check ELEVENLABS_API_KEY is set (or use fallback)
2. Check backend logs
3. Verify voice ID is valid

## ✅ Success Criteria

### All Tests Pass When:
- ✅ Translation completes in 4-9 seconds (after first request)
- ✅ Progress indicator shows all 3 stages
- ✅ Only one request processes at a time
- ✅ Errors are user-friendly and dismissible
- ✅ Keyboard shortcuts work correctly
- ✅ Voice selection works (ElevenLabs or fallback)
- ✅ Performance metrics are logged
- ✅ Memory is cleaned up properly
- ✅ Audio plays automatically (if enabled)
- ✅ All tones produce different results

## 📊 Performance Benchmarks

### Expected Timings (After Model Loading)
- **Transcription**: 1-3 seconds
- **Translation**: 1-2 seconds  
- **Audio Synthesis**: 2-4 seconds
- **Total**: 4-9 seconds

### First Request (Cold Start)
- **Total**: 30-60 seconds (one-time delay)

### Acceptable Ranges
- ✅ Good: < 10 seconds total
- ⚠️ Acceptable: 10-15 seconds
- ❌ Slow: > 15 seconds (investigate)

## 🎯 Final Checklist

Before considering testing complete:

- [ ] Full translation flow works end-to-end
- [ ] Request deduplication prevents duplicates
- [ ] Progress indicator shows correctly
- [ ] Performance metrics are accurate
- [ ] Error messages are user-friendly
- [ ] Keyboard shortcuts work
- [ ] Voice selection works (both modes)
- [ ] Different tones produce different results
- [ ] Language switching works both ways
- [ ] Audio playback controls work
- [ ] Memory cleanup happens
- [ ] Console logs are informative
- [ ] No errors in browser console (except expected ones)
- [ ] App works on first request (model loading)
- [ ] App is faster on subsequent requests

## 🚀 Ready for Production

Once all tests pass, the app is ready for:
- User acceptance testing
- Deployment to staging
- Production release

**Happy Testing! 🎉**
