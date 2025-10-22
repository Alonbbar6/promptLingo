#!/bin/bash

# WASM Text Processor Build Script
# This script builds the Rust code to WebAssembly and copies it to the React app

set -e

echo "🦀 Building WASM Text Processor..."

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "❌ wasm-pack not found. Installing..."
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

# Build the WASM module
echo "📦 Building WASM module..."
wasm-pack build --target web --out-dir pkg --release

# Create the output directory in the React app
REACT_WASM_DIR="../client/public/wasm"
mkdir -p "$REACT_WASM_DIR"

# Copy the generated files
echo "📋 Copying files to React app..."
cp pkg/wasm_text_processor.wasm "$REACT_WASM_DIR/"
cp pkg/wasm_text_processor.js "$REACT_WASM_DIR/"
cp pkg/wasm_text_processor_bg.wasm "$REACT_WASM_DIR/"

# Create TypeScript definitions
echo "📝 Generating TypeScript definitions..."
cat > "$REACT_WASM_DIR/wasm_text_processor.d.ts" << 'EOF'
/* tslint:disable */
/* eslint-disable */
/**
* @returns {boolean}
*/
export function is_wasm_supported(): boolean;
/**
* @param {string} text
* @returns {number}
*/
export function word_count(text: string): number;
/**
* @param {string} text
* @returns {number}
*/
export function char_count(text: string): number;
/**
* @returns {any}
*/
export function get_memory_usage(): any;
/**
*/
export function main(): void;
/**
*/
export class TextProcessor {
  free(): void;
/**
*/
  constructor();
/**
* @param {string} text
* @returns {any}
*/
  analyze_text(text: string): any;
/**
* @param {string} text
* @param {boolean} filter_profanity
* @param {boolean} normalize_whitespace
* @returns {any}
*/
  process_text(text: string, filter_profanity: boolean, normalize_whitespace: boolean): any;
/**
* @param {any[]} texts
* @returns {any}
*/
  batch_process(texts: any[]): any;
/**
* @param {string} text
* @param {number} iterations
* @returns {any}
*/
  benchmark(text: string, iterations: number): any;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_textprocessor_free: (a: number) => void;
  readonly textprocessor_new: () => number;
  readonly textprocessor_analyze_text: (a: number, b: number, c: number) => number;
  readonly textprocessor_process_text: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly textprocessor_batch_process: (a: number, b: number) => number;
  readonly textprocessor_benchmark: (a: number, b: number, c: number, d: number) => number;
  readonly word_count: (a: number, b: number) => number;
  readonly char_count: (a: number, b: number) => number;
  readonly is_wasm_supported: () => number;
  readonly get_memory_usage: () => number;
  readonly main: () => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
EOF

echo "✅ WASM build complete!"
echo "📁 Files copied to: $REACT_WASM_DIR"
echo ""
echo "📊 Build Summary:"
echo "   - wasm_text_processor.wasm: $(du -h "$REACT_WASM_DIR/wasm_text_processor.wasm" | cut -f1)"
echo "   - wasm_text_processor.js: $(du -h "$REACT_WASM_DIR/wasm_text_processor.js" | cut -f1)"
echo ""
echo "🚀 Ready to use in React app!"
