# WASM Quick Start Guide

Get up and running with WebAssembly in 5 minutes!

## 🚀 Quick Setup

### 1. Install Prerequisites

```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Verify installation
rustc --version
wasm-pack --version
```

### 2. Build WASM Modules

```bash
# From project root
npm run build:wasm

# Or manually
cd wasm-text-processor
./build-all.sh
```

This compiles Rust to WebAssembly for both web and Node.js targets.

### 3. Test in Frontend (React)

Create a test component:

```tsx
// client/src/components/WasmTest.tsx
import { useWasmTextProcessor } from '../hooks/useWasmTextProcessor';

export const WasmTest = () => {
  const { analyzeText, isInitialized } = useWasmTextProcessor();

  const test = async () => {
    const result = await analyzeText("Hello WASM!");
    console.log(result);
  };

  return (
    <div>
      <button onClick={test} disabled={!isInitialized}>
        Test WASM
      </button>
    </div>
  );
};
```

### 4. Test in Backend (Node.js)

Create a test script:

```javascript
// server/test-wasm.js
const { wasmTextProcessor } = require('./services/wasmTextProcessor');

async function test() {
  await wasmTextProcessor.initialize();
  
  const analysis = await wasmTextProcessor.analyzeText("Hello WASM!");
  console.log('Analysis:', analysis);
  
  const benchmark = await wasmTextProcessor.benchmark("Test", 1000);
  console.log('Performance:', benchmark.operations_per_second, 'ops/sec');
}

test().catch(console.error);
```

Run it:
```bash
cd server
node test-wasm.js
```

### 5. Test API Endpoints

```bash
# Start the server
npm run server

# In another terminal, test the API
curl -X POST http://localhost:10000/api/wasm/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello WASM!"}'

# Check status
curl http://localhost:10000/api/wasm/status
```

## 📝 Common Commands

```bash
# Build WASM (both targets)
npm run build:wasm

# Build web target only
npm run build:wasm:web

# Build Node.js target only
npm run build:wasm:nodejs

# Check Rust code without building
npm run wasm:check

# Run dev environment (includes WASM)
npm run dev
```

## 🎯 Example Usage

### Frontend Hook

```tsx
const { 
  analyzeText,
  processText,
  benchmark,
  isInitialized,
  error 
} = useWasmTextProcessor();

// Analyze text
const analysis = await analyzeText("Sample text");

// Process text
const result = await processText("Text", true, true);

// Run benchmark
const perf = await benchmark("Test", 1000);
```

### Backend Service

```javascript
const { wasmTextProcessor } = require('./services/wasmTextProcessor');

// Analyze
const analysis = await wasmTextProcessor.analyzeText("Sample");

// Process
const result = await wasmTextProcessor.processText("Text", true, true);

// Benchmark
const perf = await wasmTextProcessor.benchmark("Test", 1000);
```

### API Call

```javascript
// From frontend
const response = await fetch('/api/wasm/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: "Hello WASM!" })
});

const data = await response.json();
console.log(data.data); // Analysis results
```

## 🔍 Verify Installation

Run this checklist:

- [ ] `rustc --version` shows Rust version
- [ ] `wasm-pack --version` shows wasm-pack version
- [ ] `npm run build:wasm` completes successfully
- [ ] `client/public/wasm/` contains `.wasm` and `.js` files
- [ ] `server/wasm/` contains `.wasm` and `.js` files
- [ ] Frontend demo component loads without errors
- [ ] Backend test script runs successfully
- [ ] API endpoints return valid responses

## 🐛 Troubleshooting

**Build fails:**
- Ensure Rust and wasm-pack are installed
- Run `rustup update` to update Rust

**WASM not loading in browser:**
- Check browser console for errors
- Verify files exist in `client/public/wasm/`
- Clear browser cache

**Node.js can't find WASM:**
- Verify files exist in `server/wasm/`
- Check file permissions
- Rebuild with `npm run build:wasm:nodejs`

**TypeScript errors:**
- Rebuild WASM modules
- Restart TypeScript server in your IDE

## 📚 Next Steps

1. Read the full [WASM Integration Guide](./WASM_INTEGRATION_GUIDE.md)
2. Explore the demo component at `client/src/components/WasmDemo.tsx`
3. Check out the API routes at `server/routes/wasm.js`
4. Add your own Rust functions in `wasm-text-processor/src/lib.rs`

## 🎉 Success!

If you've made it here, you now have:
- ✅ Rust compiled to WebAssembly
- ✅ WASM running in React frontend
- ✅ WASM running in Node.js backend
- ✅ API endpoints for WASM operations
- ✅ TypeScript support with full type safety

Happy coding! 🦀⚡
