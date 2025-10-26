#!/bin/bash

# Build WASM for Node.js (Backend) only

set -e

echo "🦀 Building WASM for Node.js target..."

wasm-pack build --target nodejs --out-dir pkg-nodejs --release

NODE_WASM_DIR="../server/wasm"
mkdir -p "$NODE_WASM_DIR"

cp pkg-nodejs/wasm_text_processor_bg.wasm "$NODE_WASM_DIR/"
cp pkg-nodejs/wasm_text_processor.js "$NODE_WASM_DIR/"
cp pkg-nodejs/package.json "$NODE_WASM_DIR/"

echo "✅ Node.js build complete! Files copied to $NODE_WASM_DIR"
