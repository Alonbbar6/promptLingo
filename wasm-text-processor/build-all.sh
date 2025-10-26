#!/bin/bash

# WASM Text Processor - Dual Target Build Script
# Builds WASM for both Web (React) and Node.js (Backend)

set -e

echo "🦀 Building WASM Text Processor for Multiple Targets..."
echo ""

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "❌ wasm-pack not found. Installing..."
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

# Check if cargo is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust/Cargo not found. Please install from https://rustup.rs/"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Build for Web (React Frontend)
echo "📦 Building for Web target (React)..."
wasm-pack build --target web --out-dir pkg-web --release --features web

# Build for Node.js (Backend)
echo "📦 Building for Node.js target (Backend)..."
wasm-pack build --target nodejs --out-dir pkg-nodejs --release

echo ""
echo "✅ Build completed successfully!"
echo ""

# Copy files to appropriate locations
echo "📋 Copying files to project directories..."

# Copy to React frontend
REACT_WASM_DIR="../client/public/wasm"
mkdir -p "$REACT_WASM_DIR"
cp pkg-web/wasm_text_processor_bg.wasm "$REACT_WASM_DIR/"
cp pkg-web/wasm_text_processor.js "$REACT_WASM_DIR/"

# Copy to Node.js backend
NODE_WASM_DIR="../server/wasm"
mkdir -p "$NODE_WASM_DIR"
cp pkg-nodejs/wasm_text_processor_bg.wasm "$NODE_WASM_DIR/"
cp pkg-nodejs/wasm_text_processor.js "$NODE_WASM_DIR/"
cp pkg-nodejs/package.json "$NODE_WASM_DIR/"

# Create TypeScript definitions for React
echo "📝 Generating TypeScript definitions..."
cat > "$REACT_WASM_DIR/wasm_text_processor.d.ts" << 'EOF'
/* tslint:disable */
/* eslint-disable */
/**
 * WASM Text Processor - TypeScript Definitions
 * Auto-generated type definitions for Rust WASM module
 */

export interface TextAnalysis {
  word_count: number;
  char_count: number;
  sentence_count: number;
  language_confidence: number;
  detected_language: string;
  profanity_score: number;
  sentiment_score: number;
  reading_time_minutes: number;
}

export interface ProcessingResult {
  original_text: string;
  processed_text: string;
  analysis: TextAnalysis;
  processing_time_ms: number;
}

export interface BenchmarkResult {
  iterations: number;
  total_time_ms: number;
  average_time_ms: number;
  operations_per_second: number;
}

/**
 * Main text processor class
 */
export class TextProcessor {
  free(): void;
  constructor();
  
  /**
   * Analyze text and return metrics
   * @param text - Text to analyze
   */
  analyze_text(text: string): TextAnalysis;
  
  /**
   * Process text with filtering and normalization
   * @param text - Text to process
   * @param filter_profanity - Whether to filter profanity
   * @param normalize_whitespace - Whether to normalize whitespace
   */
  process_text(
    text: string,
    filter_profanity: boolean,
    normalize_whitespace: boolean
  ): ProcessingResult;
  
  /**
   * Batch process multiple texts
   * @param texts - Array of texts to process
   */
  batch_process(texts: string[]): ProcessingResult[];
  
  /**
   * Run performance benchmark
   * @param text - Text to use for benchmark
   * @param iterations - Number of iterations
   */
  benchmark(text: string, iterations: number): BenchmarkResult;
}

/**
 * Utility functions
 */
export function word_count(text: string): number;
export function char_count(text: string): number;
export function is_wasm_supported(): boolean;
export function get_memory_usage(): { buffer_size: number; pages: number };
export function main(): void;

/**
 * Initialize the WASM module
 */
export default function init(input?: string | URL | Request | Response | BufferSource | WebAssembly.Module): Promise<void>;
EOF

# Create Node.js wrapper with better error handling
cat > "$NODE_WASM_DIR/index.js" << 'EOF'
/**
 * WASM Text Processor - Node.js Wrapper
 * Provides a clean interface for using WASM in Node.js
 */

const wasm = require('./wasm_text_processor.js');
const fs = require('fs');
const path = require('path');

let wasmModule = null;
let isInitialized = false;

/**
 * Initialize the WASM module
 */
async function initialize() {
  if (isInitialized) {
    return wasmModule;
  }

  try {
    const wasmPath = path.join(__dirname, 'wasm_text_processor_bg.wasm');
    const wasmBuffer = fs.readFileSync(wasmPath);
    wasmModule = await wasm(wasmBuffer);
    isInitialized = true;
    console.log('🦀 WASM Text Processor initialized for Node.js');
    return wasmModule;
  } catch (error) {
    console.error('Failed to initialize WASM module:', error);
    throw error;
  }
}

/**
 * Get the initialized WASM module
 */
function getModule() {
  if (!isInitialized) {
    throw new Error('WASM module not initialized. Call initialize() first.');
  }
  return wasmModule;
}

/**
 * Create a new TextProcessor instance
 */
async function createTextProcessor() {
  await initialize();
  const module = getModule();
  return new module.TextProcessor();
}

/**
 * Utility function: Count words
 */
async function wordCount(text) {
  await initialize();
  return getModule().word_count(text);
}

/**
 * Utility function: Count characters
 */
async function charCount(text) {
  await initialize();
  return getModule().char_count(text);
}

/**
 * Check if WASM is supported
 */
async function isWasmSupported() {
  try {
    await initialize();
    return getModule().is_wasm_supported();
  } catch {
    return false;
  }
}

/**
 * Get memory usage statistics
 */
async function getMemoryUsage() {
  await initialize();
  return getModule().get_memory_usage();
}

module.exports = {
  initialize,
  getModule,
  createTextProcessor,
  wordCount,
  charCount,
  isWasmSupported,
  getMemoryUsage,
  TextProcessor: null, // Will be set after initialization
};

// Auto-initialize on first require (optional)
// Uncomment if you want automatic initialization
// initialize().catch(console.error);
EOF

echo "✅ Files copied successfully!"
echo ""
echo "📊 Build Summary:"
echo ""
echo "Web Target (React):"
echo "   Location: $REACT_WASM_DIR"
echo "   - wasm_text_processor_bg.wasm: $(du -h "$REACT_WASM_DIR/wasm_text_processor_bg.wasm" 2>/dev/null | cut -f1 || echo 'N/A')"
echo "   - wasm_text_processor.js: $(du -h "$REACT_WASM_DIR/wasm_text_processor.js" 2>/dev/null | cut -f1 || echo 'N/A')"
echo "   - TypeScript definitions: ✅"
echo ""
echo "Node.js Target (Backend):"
echo "   Location: $NODE_WASM_DIR"
echo "   - wasm_text_processor_bg.wasm: $(du -h "$NODE_WASM_DIR/wasm_text_processor_bg.wasm" 2>/dev/null | cut -f1 || echo 'N/A')"
echo "   - wasm_text_processor.js: $(du -h "$NODE_WASM_DIR/wasm_text_processor.js" 2>/dev/null | cut -f1 || echo 'N/A')"
echo "   - Node.js wrapper: ✅"
echo ""
echo "🚀 Ready to use in both React and Node.js!"
echo ""
echo "Next steps:"
echo "  1. Import in React: import init, { TextProcessor } from '/wasm/wasm_text_processor.js'"
echo "  2. Import in Node.js: const { createTextProcessor } = require('./server/wasm')"
