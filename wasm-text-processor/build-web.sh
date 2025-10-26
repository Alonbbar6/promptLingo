#!/bin/bash

# Build WASM for Web (React) only

set -e

echo "🦀 Building WASM for Web target..."

wasm-pack build --target web --out-dir pkg-web --release --features web

REACT_WASM_DIR="../client/public/wasm"
mkdir -p "$REACT_WASM_DIR"

cp pkg-web/wasm_text_processor_bg.wasm "$REACT_WASM_DIR/"
cp pkg-web/wasm_text_processor.js "$REACT_WASM_DIR/"

echo "✅ Web build complete! Files copied to $REACT_WASM_DIR"
