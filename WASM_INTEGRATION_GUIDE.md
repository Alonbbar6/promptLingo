# WASM Integration Guide

Complete guide for using WebAssembly (Rust + wasm-pack) in both React frontend and Node.js backend.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Building WASM Modules](#building-wasm-modules)
- [Frontend Usage (React)](#frontend-usage-react)
- [Backend Usage (Node.js)](#backend-usage-nodejs)
- [API Endpoints](#api-endpoints)
- [Adding New WASM Functions](#adding-new-wasm-functions)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This project uses Rust compiled to WebAssembly for high-performance text processing operations. The same Rust code is compiled to two different targets:

- **Web Target**: For use in React frontend (browser)
- **Node.js Target**: For use in Express backend (server)

### Benefits

- ⚡ **Performance**: 10-100x faster than JavaScript for CPU-intensive tasks
- 🔄 **Code Reuse**: Write once in Rust, use in both frontend and backend
- 🛡️ **Type Safety**: Rust's type system prevents many runtime errors
- 📦 **Small Bundle Size**: Optimized WASM binaries are compact

## 🔧 Prerequisites

### Required Tools

1. **Rust & Cargo**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **wasm-pack**
   ```bash
   curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
   ```

3. **Node.js** (v16 or higher)
   ```bash
   node --version
   ```

### Verify Installation

```bash
rustc --version
cargo --version
wasm-pack --version
```

## 📁 Project Structure

```
buisnessPrompt/
├── wasm-text-processor/          # Rust WASM module
│   ├── src/
│   │   └── lib.rs                # Rust source code
│   ├── Cargo.toml                # Rust dependencies
│   ├── build-all.sh              # Build for both targets
│   ├── build-web.sh              # Build for web only
│   └── build-nodejs.sh           # Build for Node.js only
│
├── client/                       # React frontend
│   ├── public/wasm/              # Compiled WASM for web
│   │   ├── wasm_text_processor_bg.wasm
│   │   ├── wasm_text_processor.js
│   │   └── wasm_text_processor.d.ts
│   └── src/
│       ├── services/
│       │   └── wasmTextProcessor.ts    # WASM service
│       ├── hooks/
│       │   └── useWasmTextProcessor.ts # React hook
│       ├── components/
│       │   └── WasmDemo.tsx            # Example component
│       └── types/
│           └── wasm.ts                 # TypeScript types
│
└── server/                       # Node.js backend
    ├── wasm/                     # Compiled WASM for Node.js
    │   ├── wasm_text_processor_bg.wasm
    │   ├── wasm_text_processor.js
    │   └── index.js              # Node.js wrapper
    ├── services/
    │   └── wasmTextProcessor.js  # WASM service
    └── routes/
        └── wasm.js               # API endpoints
```

## 🔨 Building WASM Modules

### Build for Both Targets (Recommended)

```bash
cd wasm-text-processor
./build-all.sh
```

This script:
1. Compiles Rust to WASM for web target
2. Compiles Rust to WASM for Node.js target
3. Copies files to appropriate directories
4. Generates TypeScript definitions
5. Creates Node.js wrapper

### Build for Specific Target

**Web only:**
```bash
cd wasm-text-processor
./build-web.sh
```

**Node.js only:**
```bash
cd wasm-text-processor
./build-nodejs.sh
```

### Manual Build

```bash
cd wasm-text-processor

# For web
wasm-pack build --target web --out-dir pkg-web --release --features web

# For Node.js
wasm-pack build --target nodejs --out-dir pkg-nodejs --release
```

## 🌐 Frontend Usage (React)

### Using the Hook (Recommended)

```tsx
import { useWasmTextProcessor } from '../hooks/useWasmTextProcessor';

function MyComponent() {
  const { 
    analyzeText, 
    processText, 
    isInitialized, 
    error 
  } = useWasmTextProcessor();

  const handleAnalyze = async () => {
    const analysis = await analyzeText("Hello world!");
    console.log(analysis);
    // {
    //   word_count: 2,
    //   char_count: 12,
    //   detected_language: "english",
    //   ...
    // }
  };

  const handleProcess = async () => {
    const result = await processText(
      "Some text with   extra   spaces",
      true,  // filter profanity
      true   // normalize whitespace
    );
    console.log(result.processed_text);
    // "Some text with extra spaces"
  };

  return (
    <div>
      {error && <p>Error: {error}</p>}
      <button onClick={handleAnalyze} disabled={!isInitialized}>
        Analyze
      </button>
    </div>
  );
}
```

### Using the Service Directly

```tsx
import { wasmTextProcessor } from '../services/wasmTextProcessor';

async function processData() {
  // Initialize (only needed once)
  await wasmTextProcessor.initialize();

  // Analyze text
  const analysis = await wasmTextProcessor.analyzeText("Sample text");

  // Process text
  const result = await wasmTextProcessor.processText(
    "Text to process",
    true,  // filterProfanity
    true   // normalizeWhitespace
  );

  // Batch process
  const results = await wasmTextProcessor.batchProcess([
    "Text 1",
    "Text 2",
    "Text 3"
  ]);

  // Benchmark
  const benchmark = await wasmTextProcessor.benchmark("Test", 1000);
  console.log(`${benchmark.operations_per_second} ops/sec`);

  // Utilities
  const wordCount = await wasmTextProcessor.wordCount("Hello world");
  const charCount = await wasmTextProcessor.charCount("Hello world");
  const memoryUsage = await wasmTextProcessor.getMemoryUsage();
}
```

### Available Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `analyzeText(text)` | Analyze text metrics | `TextAnalysis` |
| `processText(text, filterProfanity, normalizeWhitespace)` | Process and clean text | `ProcessingResult` |
| `batchProcess(texts)` | Process multiple texts | `ProcessingResult[]` |
| `benchmark(text, iterations)` | Run performance benchmark | `BenchmarkResult` |
| `wordCount(text)` | Count words | `number` |
| `charCount(text)` | Count characters | `number` |
| `getMemoryUsage()` | Get WASM memory stats | `MemoryUsage` |

## 🖥️ Backend Usage (Node.js)

### Using the Service

```javascript
const { wasmTextProcessor } = require('./services/wasmTextProcessor');

async function processText() {
  // Initialize (only needed once)
  await wasmTextProcessor.initialize();

  // Analyze text
  const analysis = await wasmTextProcessor.analyzeText("Sample text");
  console.log(analysis);

  // Process text
  const result = await wasmTextProcessor.processText(
    "Text to process",
    true,  // filterProfanity
    true   // normalizeWhitespace
  );

  // Batch process
  const results = await wasmTextProcessor.batchProcess([
    "Text 1",
    "Text 2",
    "Text 3"
  ]);

  // Benchmark
  const benchmark = await wasmTextProcessor.benchmark("Test", 1000);
  console.log(`Performance: ${benchmark.operations_per_second} ops/sec`);
}
```

### In Express Routes

```javascript
const { wasmTextProcessor } = require('../services/wasmTextProcessor');

router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    const analysis = await wasmTextProcessor.analyzeText(text);
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## 🔌 API Endpoints

All endpoints are prefixed with `/api/wasm`

### POST /api/wasm/analyze

Analyze text and return metrics.

**Request:**
```json
{
  "text": "Hello world! This is a test."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "word_count": 6,
    "char_count": 28,
    "sentence_count": 2,
    "detected_language": "english",
    "language_confidence": 0.83,
    "profanity_score": 0.0,
    "sentiment_score": 0.0,
    "reading_time_minutes": 0.03
  }
}
```

### POST /api/wasm/process

Process text with filtering and normalization.

**Request:**
```json
{
  "text": "Some   text   with   spaces",
  "filterProfanity": true,
  "normalizeWhitespace": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "original_text": "Some   text   with   spaces",
    "processed_text": "Some text with spaces",
    "analysis": { /* TextAnalysis object */ },
    "processing_time_ms": 0.42
  }
}
```

### POST /api/wasm/batch

Batch process multiple texts.

**Request:**
```json
{
  "texts": ["Text 1", "Text 2", "Text 3"]
}
```

### POST /api/wasm/benchmark

Run performance benchmark.

**Request:**
```json
{
  "text": "Sample text",
  "iterations": 1000
}
```

### POST /api/wasm/word-count

Count words in text.

**Request:**
```json
{
  "text": "Hello world"
}
```

### GET /api/wasm/status

Check WASM module status.

**Response:**
```json
{
  "success": true,
  "data": {
    "supported": true,
    "initialized": true,
    "memory": {
      "buffer_size": 1114112,
      "pages": 17
    }
  }
}
```

## ➕ Adding New WASM Functions

### 1. Add Rust Function

Edit `wasm-text-processor/src/lib.rs`:

```rust
#[wasm_bindgen]
pub fn reverse_text(text: &str) -> String {
    text.chars().rev().collect()
}
```

### 2. Rebuild WASM

```bash
cd wasm-text-processor
./build-all.sh
```

### 3. Use in Frontend

```typescript
// TypeScript will auto-complete after rebuild
const reversed = await wasmModule.reverse_text("Hello");
```

### 4. Use in Backend

```javascript
const reversed = await wasmModule.reverse_text("Hello");
```

### 5. Add API Endpoint (Optional)

```javascript
router.post('/reverse', async (req, res) => {
  const { text } = req.body;
  const reversed = await wasmTextProcessor.reverseText(text);
  res.json({ success: true, data: { reversed } });
});
```

## 🐛 Troubleshooting

### WASM Module Not Found

**Error:** `WASM file not found`

**Solution:**
```bash
cd wasm-text-processor
./build-all.sh
```

### TypeScript Errors

**Error:** `Cannot find module '/wasm/wasm_text_processor.js'`

**Solution:** This is expected before building. Run the build script and restart your TypeScript server.

### MIME Type Errors (Frontend)

**Error:** `Failed to load WASM: MIME type mismatch`

**Solution:** Ensure files are served from `/public/wasm/` directory and your dev server is configured to serve `.wasm` files with correct MIME type.

### Memory Issues

**Error:** `Out of memory`

**Solution:** WASM has a default memory limit. Increase it in `Cargo.toml`:

```toml
[profile.release]
opt-level = "s"
```

### Build Failures

**Error:** `wasm-pack command not found`

**Solution:**
```bash
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

### Performance Not as Expected

1. Ensure you're using `--release` flag when building
2. Check that you're not serializing/deserializing too much data
3. Use batch operations for multiple items
4. Profile with the benchmark function

## 📚 Additional Resources

- [Rust and WebAssembly Book](https://rustwasm.github.io/docs/book/)
- [wasm-bindgen Guide](https://rustwasm.github.io/wasm-bindgen/)
- [WebAssembly MDN Docs](https://developer.mozilla.org/en-US/docs/WebAssembly)

## 🎉 Example Use Cases

### Text Analysis Dashboard
```tsx
const { analyzeText } = useWasmTextProcessor();
const [stats, setStats] = useState(null);

useEffect(() => {
  analyzeText(document.body.innerText).then(setStats);
}, []);
```

### Real-time Content Filtering
```tsx
const { processText } = useWasmTextProcessor();

const handleInput = async (e) => {
  const cleaned = await processText(e.target.value, true, true);
  setCleanText(cleaned.processed_text);
};
```

### Batch Processing
```javascript
const texts = await fetchTextsFromDatabase();
const results = await wasmTextProcessor.batchProcess(texts);
await saveResults(results);
```

---

**Built with 🦀 Rust + ⚛️ React + 🟢 Node.js**
