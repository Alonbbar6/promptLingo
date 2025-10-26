# WASM Text Processor

High-performance text processing library written in Rust, compiled to WebAssembly for use in both web browsers and Node.js.

## Features

- 📊 **Text Analysis**: Word count, character count, sentence detection
- 🌍 **Language Detection**: Detect English, Haitian Creole, Spanish
- 🔍 **Content Filtering**: Profanity detection and filtering
- 💭 **Sentiment Analysis**: Basic positive/negative sentiment scoring
- ⚡ **High Performance**: 10-100x faster than JavaScript
- 🎯 **Dual Target**: Compiles for both web and Node.js

## Building

### Prerequisites

- Rust 1.70+
- wasm-pack

### Build Commands

```bash
# Build for both web and Node.js
./build-all.sh

# Build for web only
./build-web.sh

# Build for Node.js only
./build-nodejs.sh
```

### Manual Build

```bash
# Web target
wasm-pack build --target web --out-dir pkg-web --release --features web

# Node.js target
wasm-pack build --target nodejs --out-dir pkg-nodejs --release
```

## API Reference

### TextProcessor Class

Main class for text processing operations.

```rust
let processor = TextProcessor::new();
```

#### Methods

**`analyze_text(text: &str) -> TextAnalysis`**

Analyzes text and returns comprehensive metrics.

```javascript
const analysis = processor.analyze_text("Hello world!");
// {
//   word_count: 2,
//   char_count: 12,
//   sentence_count: 1,
//   detected_language: "english",
//   language_confidence: 1.0,
//   profanity_score: 0.0,
//   sentiment_score: 0.0,
//   reading_time_minutes: 0.01
// }
```

**`process_text(text: &str, filter_profanity: bool, normalize_whitespace: bool) -> ProcessingResult`**

Processes text with optional filtering and normalization.

```javascript
const result = processor.process_text(
  "Text   with   spaces",
  true,  // filter profanity
  true   // normalize whitespace
);
// {
//   original_text: "Text   with   spaces",
//   processed_text: "Text with spaces",
//   analysis: { ... },
//   processing_time_ms: 0.42
// }
```

**`batch_process(texts: Array) -> Array<ProcessingResult>`**

Process multiple texts in one call for better performance.

```javascript
const results = processor.batch_process([
  "Text 1",
  "Text 2",
  "Text 3"
]);
```

**`benchmark(text: &str, iterations: u32) -> BenchmarkResult`**

Run performance benchmark.

```javascript
const result = processor.benchmark("Test text", 1000);
// {
//   iterations: 1000,
//   total_time_ms: 42.5,
//   average_time_ms: 0.0425,
//   operations_per_second: 23529.41
// }
```

### Utility Functions

**`word_count(text: &str) -> usize`**

Fast word counting.

```javascript
const count = word_count("Hello world");
// 2
```

**`char_count(text: &str) -> usize`**

Fast character counting.

```javascript
const count = char_count("Hello");
// 5
```

**`is_wasm_supported() -> bool`**

Check if WASM is supported.

```javascript
const supported = is_wasm_supported();
// true
```

**`get_memory_usage() -> MemoryUsage`**

Get WASM memory statistics.

```javascript
const usage = get_memory_usage();
// { buffer_size: 1114112, pages: 17 }
```

## Data Structures

### TextAnalysis

```typescript
interface TextAnalysis {
  word_count: number;
  char_count: number;
  sentence_count: number;
  language_confidence: number;
  detected_language: string;
  profanity_score: number;
  sentiment_score: number;
  reading_time_minutes: number;
}
```

### ProcessingResult

```typescript
interface ProcessingResult {
  original_text: string;
  processed_text: string;
  analysis: TextAnalysis;
  processing_time_ms: number;
}
```

### BenchmarkResult

```typescript
interface BenchmarkResult {
  iterations: number;
  total_time_ms: number;
  average_time_ms: number;
  operations_per_second: number;
}
```

## Adding New Functions

1. **Add Rust function** in `src/lib.rs`:

```rust
#[wasm_bindgen]
pub fn reverse_text(text: &str) -> String {
    text.chars().rev().collect()
}
```

2. **Rebuild**:

```bash
./build-all.sh
```

3. **Use in JavaScript**:

```javascript
const reversed = reverse_text("Hello");
// "olleH"
```

## Performance Tips

1. **Use batch operations** when processing multiple items
2. **Minimize data serialization** between JS and WASM
3. **Reuse TextProcessor instances** instead of creating new ones
4. **Use release builds** for production (automatic with build scripts)

## Optimization Settings

The module is optimized for size and speed:

```toml
[profile.release]
opt-level = "s"        # Optimize for size
lto = true             # Link-time optimization
debug = false          # No debug info
panic = "abort"        # Smaller panic handler
codegen-units = 1      # Better optimization
```

## Dependencies

- `wasm-bindgen`: JavaScript interop
- `js-sys`: JavaScript standard library bindings
- `serde`: Serialization/deserialization
- `regex`: Regular expressions
- `unicode-segmentation`: Unicode text handling

## Browser Support

- Chrome 57+
- Firefox 52+
- Safari 11+
- Edge 16+

## Node.js Support

- Node.js 16+

## License

MIT

## Contributing

1. Make changes to `src/lib.rs`
2. Run `cargo test` to test
3. Run `cargo fmt` to format
4. Run `cargo clippy` to lint
5. Build with `./build-all.sh`

## Benchmarks

Typical performance on modern hardware:

| Operation | Time | Throughput |
|-----------|------|------------|
| Text Analysis | ~0.04ms | 25,000 ops/sec |
| Text Processing | ~0.05ms | 20,000 ops/sec |
| Word Count | ~0.01ms | 100,000 ops/sec |
| Language Detection | ~0.03ms | 33,000 ops/sec |

*Results may vary based on text length and hardware.*

## Troubleshooting

**Build fails:**
```bash
# Update Rust
rustup update

# Clean and rebuild
cargo clean
./build-all.sh
```

**Out of memory:**
Increase WASM memory limit in your JavaScript initialization code.

**Slow performance:**
Ensure you're using release builds, not debug builds.

---

Built with 🦀 Rust + WebAssembly
