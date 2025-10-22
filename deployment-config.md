# WebAssembly Deployment Configuration

## 🚀 Production Deployment Guide

### 1. Server Configuration

#### Express.js Headers (already configured in server/index.js)
```javascript
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// For WASM with SharedArrayBuffer (if using threading)
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});
```

#### MIME Types for WASM files
Add to your server configuration:
```
application/wasm wasm
```

### 2. Netlify Deployment

Create `client/public/_headers`:
```
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp

/*.wasm
  Content-Type: application/wasm
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000, immutable
```

Create `netlify.toml`:
```toml
[build]
  publish = "client/build"
  command = "npm run build:all"

[[headers]]
  for = "*.wasm"
  [headers.values]
    Content-Type = "application/wasm"
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/wasm/*"
  [headers.values]
    Cross-Origin-Resource-Policy = "cross-origin"

[functions]
  directory = "server"
```

### 3. Vercel Deployment

Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    },
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*\\.wasm)",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/wasm"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 4. AWS S3 + CloudFront

Configure CloudFront behaviors:
```
Path Pattern: *.wasm
- Origin: Your S3 bucket
- Cache Policy: CachingOptimized
- Response Headers Policy: Custom (add CORS headers)
- Compress Objects: Yes
```

S3 Bucket CORS configuration:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["Content-Length", "Content-Type"],
    "MaxAgeSeconds": 3000
  }
]
```

### 5. Docker Deployment

Create `Dockerfile`:
```dockerfile
# Build stage for WASM
FROM rust:1.70 as wasm-builder
WORKDIR /app
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
COPY wasm-text-processor/ ./wasm-text-processor/
WORKDIR /app/wasm-text-processor
RUN wasm-pack build --target web --release

# Build stage for React
FROM node:18-alpine as client-builder
WORKDIR /app
COPY client/package*.json ./client/
RUN cd client && npm ci
COPY client/ ./client/
COPY --from=wasm-builder /app/wasm-text-processor/pkg ./client/public/wasm/
RUN cd client && npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./
COPY --from=wasm-builder /app/wasm-text-processor/pkg/wasm_text_processor_bg.wasm ./wasm/
COPY --from=client-builder /app/client/build ./public
EXPOSE 3001
CMD ["npm", "start"]
```

### 6. Performance Optimization

#### Compression
Enable Brotli/Gzip compression for WASM files:
```javascript
// Express.js
const compression = require('compression');
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));
```

#### Preloading
Add to your HTML head:
```html
<link rel="preload" href="/wasm/wasm_text_processor.wasm" as="fetch" type="application/wasm" crossorigin>
```

#### Service Worker Caching
```javascript
// service-worker.js
const WASM_CACHE = 'wasm-cache-v1';
const wasmFiles = [
  '/wasm/wasm_text_processor.wasm',
  '/wasm/wasm_text_processor.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(WASM_CACHE).then(cache => {
      return cache.addAll(wasmFiles);
    })
  );
});
```

### 7. Environment Variables

Required environment variables:
```bash
# Server
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=your_key_here
ELEVENLABS_API_KEY=your_key_here

# Client (build time)
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_ENABLE_WASM=true
```

### 8. Build Scripts

Update `package.json`:
```json
{
  "scripts": {
    "build:wasm": "./build-wasm.sh",
    "build:client": "cd client && npm run build",
    "build:server": "cd server && npm install --production",
    "build:all": "npm run build:wasm && npm run build:client",
    "deploy:netlify": "npm run build:all && netlify deploy --prod",
    "deploy:vercel": "npm run build:all && vercel --prod"
  }
}
```

### 9. Monitoring & Analytics

#### Performance Monitoring
```javascript
// Track WASM load times
const wasmLoadStart = performance.now();
await wasmService.initialize();
const wasmLoadTime = performance.now() - wasmLoadStart;

// Send to analytics
analytics.track('wasm_load_time', { duration: wasmLoadTime });
```

#### Error Tracking
```javascript
// WASM error boundary
class WasmErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    if (error.message.includes('wasm')) {
      // Track WASM-specific errors
      errorTracker.captureException(error, {
        tags: { component: 'wasm' },
        extra: errorInfo
      });
    }
  }
}
```

### 10. Browser Compatibility

#### Feature Detection
```javascript
function isWasmSupported() {
  return (
    typeof WebAssembly === 'object' &&
    typeof WebAssembly.instantiate === 'function' &&
    typeof WebAssembly.compile === 'function'
  );
}

// Graceful degradation
if (!isWasmSupported()) {
  // Fall back to JavaScript implementation
  console.warn('WASM not supported, using JavaScript fallback');
}
```

#### Polyfills
For older browsers, consider:
- WebAssembly polyfill for very old browsers
- Fetch polyfill for IE
- Promise polyfill for IE

### 11. Security Considerations

#### Content Security Policy
```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-eval';
  worker-src 'self' blob:;
  connect-src 'self' https://api.openai.com https://api.elevenlabs.io;
```

#### WASM Security
- WASM runs in a sandboxed environment
- No direct DOM access from WASM
- All external calls go through JavaScript bridge
- Memory is isolated and managed

### 12. Troubleshooting

#### Common Issues
1. **MIME type errors**: Ensure server serves .wasm files with correct MIME type
2. **CORS errors**: Configure proper CORS headers for cross-origin requests
3. **Loading failures**: Check network tab for 404s or loading errors
4. **Memory errors**: Monitor WASM memory usage and implement cleanup
5. **Performance issues**: Use Web Workers for heavy computations

#### Debug Tools
- Chrome DevTools WASM debugging
- Performance profiler
- Memory inspector
- Network analysis

This configuration ensures optimal WASM deployment across different platforms while maintaining security and performance.
