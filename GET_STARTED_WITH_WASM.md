# 🚀 Get Started with WASM

Your complete WebAssembly infrastructure is ready! Follow these steps to start using it.

## ⚡ Quick Start (5 minutes)

### 1. Install Prerequisites

```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Verify
rustc --version
wasm-pack --version
```

### 2. Build WASM Modules

```bash
# From project root
npm run build:wasm
```

This will:
- Compile Rust to WebAssembly
- Generate files for both web and Node.js
- Copy files to correct directories
- Create TypeScript definitions

### 3. Test Backend

```bash
cd server
node test-wasm.js
```

Expected output:
```
🦀 Testing WASM Text Processor...
✅ WASM initialized successfully
✅ Text analysis passed
✅ Text processing passed
...
🎉 All tests passed successfully!
```

### 4. Test Frontend

Start the dev server:
```bash
npm run dev
```

Then either:
- **Option A:** Import the test component in your app
- **Option B:** Use the full demo component

### 5. Test API Endpoints

```bash
# Start server (if not already running)
npm run server

# Test in another terminal
curl http://localhost:10000/api/wasm/status

curl -X POST http://localhost:10000/api/wasm/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello WASM!"}'
```

## 📖 Usage Examples

### Frontend (React Hook)

```tsx
import { useWasmTextProcessor } from './hooks/useWasmTextProcessor';

function MyComponent() {
  const { analyzeText, isInitialized } = useWasmTextProcessor();

  const handleClick = async () => {
    const result = await analyzeText("Hello WASM!");
    console.log(result);
    // {
    //   word_count: 2,
    //   char_count: 11,
    //   detected_language: "english",
    //   ...
    // }
  };

  return (
    <button onClick={handleClick} disabled={!isInitialized}>
      Analyze Text
    </button>
  );
}
```

### Backend (Node.js Service)

```javascript
const { wasmTextProcessor } = require('./services/wasmTextProcessor');

async function processText() {
  await wasmTextProcessor.initialize();
  
  const analysis = await wasmTextProcessor.analyzeText("Sample text");
  console.log(analysis);
}
```

### API Call (Fetch)

```javascript
const response = await fetch('/api/wasm/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: "Hello WASM!" })
});

const data = await response.json();
console.log(data.data); // Analysis results
```

## 🎯 What You Can Do

### Text Analysis
```typescript
const analysis = await analyzeText("Your text here");
// Returns: word_count, char_count, language, sentiment, etc.
```

### Content Filtering
```typescript
const result = await processText(
  "Text with   spaces",
  true,  // filter profanity
  true   // normalize whitespace
);
// Returns: cleaned text + analysis
```

### Batch Processing
```typescript
const results = await batchProcess([
  "Text 1",
  "Text 2",
  "Text 3"
]);
// Process multiple texts efficiently
```

### Performance Benchmarking
```typescript
const benchmark = await benchmark("Sample", 1000);
// Returns: operations_per_second, average_time_ms, etc.
```

## 📁 Key Files

### Frontend
- `client/src/hooks/useWasmTextProcessor.ts` - React hook
- `client/src/services/wasmTextProcessor.ts` - Service
- `client/src/components/WasmDemo.tsx` - Full demo
- `client/src/components/WasmTest.tsx` - Simple test

### Backend
- `server/services/wasmTextProcessor.js` - Service
- `server/routes/wasm.js` - API endpoints
- `server/test-wasm.js` - Test script

### WASM Module
- `wasm-text-processor/src/lib.rs` - Rust source
- `wasm-text-processor/build-all.sh` - Build script

## 🔧 Common Commands

```bash
# Build WASM (both targets)
npm run build:wasm

# Build web only
npm run build:wasm:web

# Build Node.js only
npm run build:wasm:nodejs

# Check Rust code
npm run wasm:check

# Test backend
cd server && node test-wasm.js

# Run dev environment
npm run dev
```

## 📚 Documentation

1. **[WASM_QUICK_START.md](./WASM_QUICK_START.md)** - Quick start guide
2. **[WASM_INTEGRATION_GUIDE.md](./WASM_INTEGRATION_GUIDE.md)** - Complete guide
3. **[WASM_SETUP_COMPLETE.md](./WASM_SETUP_COMPLETE.md)** - Setup summary
4. **[wasm-text-processor/README.md](./wasm-text-processor/README.md)** - Module docs

## 🐛 Troubleshooting

### "WASM file not found"
```bash
npm run build:wasm
```

### "wasm-pack command not found"
```bash
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

### TypeScript errors
- Rebuild WASM: `npm run build:wasm`
- Restart TypeScript server in your IDE

### Build fails
```bash
# Update Rust
rustup update

# Clean and rebuild
cd wasm-text-processor
cargo clean
./build-all.sh
```

## ✅ Verification Checklist

Run through this checklist to ensure everything works:

- [ ] Rust installed: `rustc --version`
- [ ] wasm-pack installed: `wasm-pack --version`
- [ ] WASM built: `npm run build:wasm`
- [ ] Files exist: `client/public/wasm/` and `server/wasm/`
- [ ] Backend test passes: `cd server && node test-wasm.js`
- [ ] API responds: `curl http://localhost:10000/api/wasm/status`
- [ ] Frontend loads without errors
- [ ] Hook works in React component

## 🎉 Next Steps

1. ✅ **Integrate into your app**
   - Use the hook in your components
   - Call API endpoints from frontend
   - Use service in backend routes

2. ✅ **Add custom functions**
   - Edit `wasm-text-processor/src/lib.rs`
   - Add your Rust functions
   - Rebuild with `npm run build:wasm`

3. ✅ **Optimize performance**
   - Use batch processing for multiple items
   - Minimize data serialization
   - Profile with benchmark function

4. ✅ **Deploy**
   - WASM builds are included in `npm run build`
   - Deploy as normal
   - WASM files are served statically

## 💡 Tips

- **Performance**: WASM is 10-100x faster for CPU-intensive tasks
- **Memory**: WASM has its own memory space, check with `getMemoryUsage()`
- **Debugging**: Use `console.log` in Rust (it works!)
- **Type Safety**: Full TypeScript support with auto-completion
- **Reusability**: Same Rust code runs in browser and Node.js

## 🎓 Learning Resources

- [Rust Book](https://doc.rust-lang.org/book/)
- [WASM Book](https://rustwasm.github.io/docs/book/)
- [wasm-bindgen Guide](https://rustwasm.github.io/wasm-bindgen/)

## 🤝 Need Help?

1. Check [WASM_INTEGRATION_GUIDE.md](./WASM_INTEGRATION_GUIDE.md) troubleshooting section
2. Review example code in demo components
3. Test with provided test scripts
4. Check console for error messages

---

**Ready to build high-performance web applications with Rust + WebAssembly! 🦀⚡**

Start coding and enjoy the speed! 🚀
