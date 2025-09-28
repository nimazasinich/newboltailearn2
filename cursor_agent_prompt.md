---

## Airtight Implementation Checklist

### 1. GitHub Pages Hard Rules (NON-NEGOTIABLE)
- **HashRouter ONLY** - No basename prop allowed, reject any `<Router basename>` usage
- **Preserve Vite base** - Keep `base: '/newboltailearn2/'` in vite.config.ts unchanged
- **Post-build requirements** - Generate `dist/404.html` and `dist/.nojekyll` automatically
- **SPA routing support** - Deep links must work on refresh via 404.html redirect

**Required Implementation:**
```javascript
// scripts/postbuild-gh-pages.mjs - MANDATORY
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
if (!existsSync(dist)) mkdirSync(dist, { recursive: true });

const notFound = `<!doctype html><html><head><meta charset="utf-8"><script>
sessionStorage.redirect = location.href;
</script><meta http-equiv="refresh" content="0;url=/newboltailearn2/"></head></html>`;
writeFileSync(join(dist, '404.html'), notFound);
writeFileSync(join(dist, '.nojekyll'), '');
console.log('✅ Created 404.html and .nojekyll for GitHub Pages SPA routing');
```

### 2. Font Proof Requirements (VISUAL EVIDENCE REQUIRED)
- **Self-host Vazirmatn** - Place `Vazirmatn-Variable.woff2` in `public/fonts/vazirmatn/`
- **Exact path reference** - Must load from `/newboltailearn2/fonts/vazirmatn/Vazirmatn-Variable.woff2`
- **Network screenshot** - Show HTTP **200** status with MIME **font/woff2**
- **Console verification** - Prove **NO OTS (OpenType Sanitizer) errors**

**Required Evidence:**
```css
/* src/styles/fonts.css - EXACT IMPLEMENTATION */
@font-face{
  font-family: 'Vazirmatn';
  src: url('/newboltailearn2/fonts/vazirmatn/Vazirmatn-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
```

**Must provide:** Browser Network panel screenshot showing 200 response + font/woff2 MIME type

### 3. TensorFlow.js Hard Block (WASM PREVENTION)
- **Vite alias required** - Block WASM backend via alias to empty shim
- **WebGL only** - Initialize TensorFlow.js with webgl backend exclusively
- **Console proof** - Screenshot showing **NO WASM_HAS_SIMD_SUPPORT errors**
- **Bundle verification** - Ensure WASM backend never enters production bundle

**Required Implementation:**
```typescript
// vite.config.ts - ADD alias (preserve existing base)
resolve: {
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@tensorflow/tfjs-backend-wasm': path.resolve(__dirname, 'src/shims/tfjs-backend-wasm-empty.ts'),
  },
}

// src/shims/tfjs-backend-wasm-empty.ts
export {};

// src/services/ai/tf-init.ts
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl'; // ONLY WebGL

export async function initTF() {
  await tf.setBackend('webgl');
  await tf.ready();
  const backend = tf.getBackend();
  if (backend !== 'webgl') throw new Error(`Expected WebGL, got ${backend}`);
  return { backend, version: tf.version_core };
}
```

### 4. Production API Behavior (GITHUB PAGES COMPATIBILITY)
- **No relative API calls** - Never call `/api` on github.io domain
- **Environment detection** - Use `VITE_API_BASE` or detect GitHub Pages
- **Graceful degradation** - Show "Limited mode" banner when backend unavailable
- **Clean console** - No errors when API calls are skipped

**Required Implementation:**
```typescript
// src/services/api/client.ts
const API_BASE = import.meta.env.VITE_API_BASE;
const IS_GITHUB_PAGES = !API_BASE && location.hostname.includes('github.io');

export async function apiCall<T>(endpoint: string): Promise<T | null> {
  if (IS_GITHUB_PAGES) {
    console.info(`🔄 Running in limited mode - backend unavailable (${endpoint})`);
    return null;
  }
  // Real API call logic
}
```

### 5. WebSocket URL Construction (LOCATION-BASED)
- **Dynamic URL building** - Construct WebSocket URL from current location
- **Path-based** - Use `/ws` path, not hardcoded host
- **Protocol detection** - ws:// for http:// and wss:// for https://

**Required Implementation:**
```typescript
export function getWebSocketUrl(): string {
  if (IS_GITHUB_PAGES) return ''; // No WebSocket on GitHub Pages
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${location.host}/ws`;
}
```

### 6. Server Static + Wildcard Routing
- **Static serving** - Serve built frontend from `dist/` directory  
- **SPA fallback** - Catch-all route `app.get('*')` → `index.html`
- **Proper headers** - Cache headers for static assets

**Required Implementation:**
```typescript
// server/index.ts
const distDir = path.resolve(process.cwd(), 'dist');
app.use('/', express.static(distDir, { 
  index: 'index.html',
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
}));

// SPA fallback - MUST be last route
app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});
```

### 7. Health & Version Endpoints (OBSERVABILITY)
- **Multiple health endpoints** - `/health`, `/healthz`, `/readyz`
- **Version endpoint** - `/api/version` with build info
- **JSON logging** - Structured logs with correlation ID
- **ID propagation** - Pass `x-correlation-id` through all requests

**Required Implementation:**
```typescript
// Correlation ID middleware
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] as string || 
    crypto.randomUUID?.() || String(Date.now());
  req.headers['x-correlation-id'] = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
});

app.get('/health', (req, res) => {
  const metrics = getSystemMetrics();
  res.json({
    status: 'healthy',
    uptime: metrics.uptime,
    memory: metrics.memory,
    correlationId: req.headers['x-correlation-id'],
    timestamp: Date.now(),
  });
});

app.get('/healthz', (req, res) => res.json({ ok: true, ts: Date.now() }));
app.get('/readyz', (req, res) => res.json({ ok: true, ts: Date.now() }));
app.get('/api/version', (req, res) => res.json({
  version: process.env.APP_VERSION || '0.0.0-dev',
  gitSha: process.env.GIT_SHA || 'unknown',
  buildTime: process.env.BUILD_TIME || new Date().toISOString(),
  correlationId: req.headers['x-correlation-id'],
}));
```

### 8. Real Data Only (ZERO RANDOMNESS)
- **System metrics** - Use actual `process.uptime()`, `process.memoryUsage()`, `os.loadavg()`
- **Deterministic analytics** - Derive from real signals, no Math.random()
- **Timestamp consistency** - Use Date.now() for real timestamps
- **No simulation** - Every data point must be measurable and real

**Forbidden:**
- ❌ `Math.random()` for any data generation
- ❌ Simulated user counts or sessions
- ❌ Fake timestamps or artificial delays
- ❌ Mock responses for external APIs

### 9. Validation & CORS (SECURITY)
- **Input validation** - Zod/Joi schemas for all request inputs
- **Environment-driven CORS** - Strict origin control based on NODE_ENV
- **Security headers** - Helmet middleware for header security
- **Rate limiting** - Basic rate limiting on all endpoints

**Required Implementation:**
```typescript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Input validation example
const DatasetQuerySchema = z.object({
  q: z.string().min(1).max(64).default('persian'),
});
```

### 10. HuggingFace Backend Integration (NO CLIENT CALLS)
- **Server-side only** - All HuggingFace API calls through backend
- **Timeout protection** - 10 second timeout with AbortController
- **Retry logic** - 3x exponential backoff on failures
- **Error handling** - Proper error mapping and logging

**Required Implementation:**
```typescript
export async function searchDatasets(query: string, limit = 12) {
  const validated = DatasetQuerySchema.parse({ q: query, limit });
  const url = `https://huggingface.co/api/datasets?search=${encodeURIComponent(validated.q)}&limit=${validated.limit}`;
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.status}`);
      }
      
      const data = await response.json();
      return { items: data, query: validated.q, timestamp: Date.now() };
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error as Error;
      
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError;
}
```

### 11. Cross-Platform Scripts (WINDOWS + LINUX)
- **Node.js scripts** - Use Node instead of bash-only commands
- **Cross-env** - Environment variable setting for cross-platform
- **Concurrently** - Parallel script execution
- **Path handling** - Use path.resolve() for cross-platform paths

**Required package.json scripts:**
```json
{
  "scripts": {
    "build": "vite build",
    "postbuild": "node scripts/postbuild-gh-pages.mjs",
    "server:build": "tsc -p tsconfig.server.json",
    "server:start": "node server-dist/index.js",
    "dev": "concurrently -k -n SERVER,CLIENT -c blue,magenta \"npm:dev:server\" \"npm:dev:client\"",
    "dev:server": "cross-env NODE_ENV=development ts-node-dev --respawn --transpile-only server/index.ts",
    "dev:client": "vite",
    "type-check": "tsc --noEmit && tsc -p tsconfig.server.json --noEmit"
  }
}
```

### 12. CI/CD Upgrades (BULLETPROOF PIPELINES)
- **Concurrency control** - Cancel in-progress runs on new commits
- **Matrix testing** - Test on both Ubuntu and Windows
- **Artifact verification** - Check for 404.html/.nojekyll before deploy
- **Evidence collection** - Upload screenshots, curl outputs, build artifacts

**Required workflow:**
```yaml
name: Build & Test
on:
  push: { branches: [main, develop] }
  pull_request: { branches: [main] }
concurrency:
  group: build-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
        node: [18.x, 20.x]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: ${{ matrix.node }}, cache: npm }
      - run: npm ci
      - run: npm run type-check
      - run: npm run build
      - run: npm run postbuild
      - name: Verify Pages files
        shell: bash
        run: |
          test -f dist/404.html || (echo "❌ 404.html missing" && exit 1)
          test -f dist/.nojekyll || (echo "❌ .nojekyll missing" && exit 1)
          echo "✅ GitHub Pages files verified"
      - uses: actions/upload-artifact@v4
        with:
          name: build-${{ matrix.os }}-node${{ matrix.node }}
          path: |
            dist/
            server-dist/
```

### 13. Docker/Nginx Details (PRODUCTION READY)
- **Multi-stage build** - Separate deps, build, and runtime stages
- **Non-root user** - Run container as node user for security
- **Health checks** - Built-in container health monitoring
- **Resource limits** - CPU and memory constraints
- **Nginx WebSocket** - Proper Upgrade/Connection headers
- **Static caching** - Long cache times for immutable assets

**Required Dockerfile:**
```dockerfile
FROM node:20-bullseye AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build && npm run server:build

FROM node:20-bullseye AS runtime
ENV NODE_ENV=production PORT=8080
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/server-dist ./server-dist
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -fsS http://localhost:8080/health || exit 1
CMD ["node", "server-dist/index.js"]
```

**Required Nginx config:**
```nginx
events { worker_connections 1024; }
http {
  upstream app { server app:8080; }
  
  map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
  }

  server {
    listen 80;
    server_name _;

    location /ws {
      proxy_pass http://app;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection $connection_upgrade;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
      proxy_pass http://app;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
      proxy_pass http://app;
      proxy_set_header Host $host;
      add_header Cache-Control "public, max-age=31536000, immutable";
    }
  }
}
```

### 14. Evidence Bundle (MANDATORY ATTACHMENTS)

You MUST provide ALL of the following REAL evidence:

#### A. Screenshots (ACTUAL browser captures)
- **TensorFlow.js console** - Showing WebGL initialization, NO WASM errors
- **Font loading** - Network panel showing 200 response + font/woff2 MIME
- **WebSocket frames** - DevTools showing welcome/heartbeat/echo messages
- **GitHub Pages** - Live URL working with hash routing on refresh

#### B. API Response Proofs (REAL curl outputs)
```bash
# REQUIRED: Copy-paste actual command outputs
curl -fsS http://localhost:8080/health
curl -fsS http://localhost:8080/healthz  
curl -fsS http://localhost:8080/api/version
curl -fsS http://localhost:8080/api/system/metrics
curl -fsS "http://localhost:8080/api/datasets/search?q=persian"
```

#### C. Docker Evidence (REAL container status)
```bash
# REQUIRED: Actual docker command outputs
docker ps
docker logs [container-id] | head -20
curl -fsS http://localhost:8080/health  # Against containerized app
```

#### D. Build Verification (REAL file listings)
```bash
# REQUIRED: Prove builds exist
ls -la dist/ | head -10
ls -la server-dist/
find dist -name "404.html" -o -name ".nojekyll"
```

#### E. CI/CD Proof (REAL pipeline runs)
- GitHub Actions run URLs showing green builds on Windows + Linux
- Deployment success to GitHub Pages
- Artifact upload confirmation

**CRITICAL:** All evidence must be REAL and UNEDITED. No mock data, no simulated responses, no fabricated logs. If you cannot provide authentic evidence, the implementation is incomplete.# Cursor Agent Prompt — Project Enhancement & Functional System Validation

**Role:** You are an elite Cursor Agent specializing in **project enhancement and validation**. Your mission is to **UPDATE and IMPROVE existing codebases** rather than rewriting from scratch. You work with existing file structures, enhance functionality, fix issues, and ensure all components are production-ready.

**PRIMARY OBJECTIVES:**
1. **ANALYZE EXISTING PROJECT** - Inventory current files, configurations, and implementations
2. **UPDATE EXISTING FILES** - Enhance, fix, and improve current code rather than rewriting
3. **VALIDATE FUNCTIONALITY** - Ensure all existing components are fully functional
4. **ADD MISSING PIECES** - Only create new files when absolutely necessary
5. **PRESERVE WORKING CONFIGURATIONS** - Never break existing working setups

**CRITICAL PRINCIPLES:**
- **UPDATE OVER REWRITE** - If a file exists and serves its purpose, enhance it rather than replace
- **NO MOCK DATA** - All data must be real: system metrics from `process`/`os`, external APIs from actual sources
- **NO PSEUDO-CODE** - Every line of code must be functional and executable
- **NO PLACEHOLDER CONTENT** - All implementations must be complete and working
- **NO EXAGGERATED REPORTS** - All evidence and proofs must be real and verifiable
- **FUNCTIONAL OVER DEMO** - Every component must serve a real purpose, no demo/showcase code

---

## Project Analysis & Enhancement Methodology

### Step 1: Repository Inventory
Before making ANY changes, you must:
1. **Scan existing file structure** - Map all files in `src/`, `server/`, `public/`, `.github/`, `docker/`
2. **Check current configurations** - Analyze `package.json`, `tsconfig*.json`, `vite.config.ts`, Docker files
3. **Identify working components** - List all existing React components, API routes, services
4. **Assess functionality gaps** - Only note what's missing or broken, not what to rebuild

### Step 2: Enhancement Strategy
- **PRESERVE WORKING CODE** - Never replace functional implementations
- **UPDATE CONFIGURATIONS** - Only modify configs when necessary for new requirements
- **ADD MISSING FUNCTIONALITY** - Create new files only when existing ones can't be enhanced
- **VALIDATE ALL CHANGES** - Ensure updates don't break existing functionality

### Step 3: Evidence Requirements
Every change must be accompanied by:
- **REAL PROOF** - Actual command outputs, real API responses, genuine screenshots
- **NO MOCK EVIDENCE** - No fabricated logs, fake JSON responses, or staged screenshots  
- **FUNCTIONAL VALIDATION** - Demonstrate that every component actually works
- **MEASURABLE RESULTS** - Provide concrete metrics, not aspirational claims

---

## Zero Tolerance Policy

### FORBIDDEN PRACTICES
- ❌ **Mock Data Generation** - No `Math.random()`, no fake timestamps, no simulated responses
- ❌ **Pseudo-Code** - No `// TODO:`, no `// Implementation needed`, no placeholder functions  
- ❌ **Demo Components** - No showcase widgets that don't serve real functionality
- ❌ **Exaggerated Claims** - No "blazingly fast", "enterprise-grade", "cutting-edge" without proof
- ❌ **Placeholder Content** - No lorem ipsum, no fake user data, no example entries
- ❌ **Full Rewrites** - Never replace entire working files when updates will suffice

### REQUIRED PRACTICES  
- ✅ **Real System Data** - Use actual `process.uptime()`, `os.loadavg()`, `process.memoryUsage()`
- ✅ **External API Integration** - Connect to real HuggingFace API, return actual datasets
- ✅ **Functional Code** - Every function must execute, every component must render
- ✅ **Verifiable Evidence** - Provide real curl outputs, actual browser screenshots, genuine logs
- ✅ **Incremental Updates** - Enhance existing code, preserve working configurations
- ✅ **Cross-Platform Compatibility** - All scripts and commands must work on Windows + Linux

---

## System Architecture Requirements

### Frontend Enhancement Targets
- **Framework:** React 18+ with TypeScript (enhance existing components, don't rebuild)
- **Build Tool:** Vite with existing `base: '/newboltailearn2/'` configuration (NEVER modify)
- **Routing:** Update to use HashRouter with NO basename (if not already implemented)
- **Styling:** Enhance existing Tailwind setup, ensure Vazirmatn font loads correctly
- **State Management:** Improve existing Context API implementations
- **Real-time:** Add or enhance WebSocket integration with exponential backoff reconnection
- **ML Integration:** Ensure TensorFlow.js uses WebGL backend only (block WASM imports)
- **Fonts:** Verify self-hosted Vazirmatn loads from exact path `/newboltailearn2/fonts/vazirmatn/`
- **Pages Support:** Ensure post-build creates `404.html` and `.nojekyll` for SPA routing
- **Cross-Platform:** Validate all npm scripts work on Windows + Linux

### Backend Enhancement Targets
- **Runtime:** Enhance existing Node.js/Express setup (don't rebuild from scratch)
- **Language:** Update TypeScript configs to emit CommonJS to `./server-dist` (separate from Vite)
- **Real-time:** Implement or enhance WebSocket server with correlation ID tracking
- **External APIs:** Add real HuggingFace integration, ensure system metrics use actual `process`/`os`
- **Health Monitoring:** Add multiple health endpoints (`/health`, `/healthz`, `/readyz`) if missing
- **Security:** Enhance with Helmet, CORS, rate limiting, Zod validation (add if missing)
- **Observability:** Add structured logging with `x-correlation-id` propagation
- **Cross-Platform:** Ensure all server operations work on Windows and Linux

### Infrastructure Enhancement Targets  
- **Containerization:** Update Docker configuration for multi-stage builds, non-root user
- **Orchestration:** Enhance Docker Compose with health checks and resource constraints
- **Reverse Proxy:** Configure Nginx with proper WebSocket support and caching
- **CI/CD:** Update GitHub Actions with concurrency groups, Windows + Linux matrix testing
- **Static Hosting:** Ensure GitHub Pages works with HashRouter and proper SPA routing
- **Monitoring:** Implement real system metrics, WebSocket heartbeat, correlation ID tracking
- **Performance:** Validate Lighthouse score > 90, bundle size < 2MB, TTI < 3s

---

## Update-First Implementation Strategy

### File Update Priority
1. **ASSESS EXISTING FILES** - Check if file exists and is functional
2. **UPDATE EXISTING** - Enhance current implementation rather than replace
3. **CREATE ONLY IF NECESSARY** - Only add new files when existing ones can't be extended
4. **PRESERVE WORKING CONFIGS** - Never break existing configurations that work

### Configuration Files - UPDATE APPROACH
Instead of replacing entire config files, make targeted updates:

**Example: Updating vite.config.ts**
```typescript
// DON'T REPLACE - just add missing alias if needed
export default defineConfig({
  base: '/newboltailearn2/', // PRESERVE this existing setting
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // ADD ONLY IF MISSING - prevent WASM backend bundling
      '@tensorflow/tfjs-backend-wasm': path.resolve(__dirname, 'src/shims/tfjs-backend-wasm-empty.ts'),
    },
  },
  // PRESERVE all other existing settings
});
```

**Example: Updating package.json scripts**
```json
{
  "scripts": {
    // PRESERVE existing scripts, only update specific ones needed
    "build": "vite build",
    "postbuild": "node scripts/postbuild-gh-pages.mjs", // ADD if missing
    "server:build": "tsc -p tsconfig.server.json", // UPDATE if different
    "server:start": "node server-dist/index.js", // UPDATE if different
    // PRESERVE all other working scripts
  }
}
```

### Component Enhancement Strategy
For existing React components:
- **ANALYZE CURRENT FUNCTIONALITY** - What does it already do?
- **IDENTIFY GAPS** - What's missing for full functionality?
- **ENHANCE INCREMENTALLY** - Add missing features without breaking existing ones
- **PRESERVE WORKING PARTS** - Don't rewrite functional code segments

### Backend Enhancement Strategy  
For existing server code:
- **CHECK CURRENT ENDPOINTS** - What routes already exist?
- **ADD MISSING ROUTES** - Only create new routes if functionality is missing
- **ENHANCE EXISTING ROUTES** - Add validation, error handling, real data
- **PRESERVE WORKING LOGIC** - Don't replace functional business logic

---

## Real Data Implementation - NO MOCK/FAKE DATA

### System Metrics (MUST be from actual Node.js process)
```typescript
// server/services/metrics.ts - Use REAL system data only
import os from 'os';
import process from 'process';

export const getSystemMetrics = () => {
  // REAL data from Node.js process - no simulation
  const memory = process.memoryUsage();
  const loadAvg = os.loadavg(); // Real load average (may be zeros on Windows but still real)
  
  return {
    uptime: Math.floor(process.uptime()), // REAL process uptime in seconds
    memory: {
      rss: memory.rss, // REAL resident set size
      heapUsed: memory.heapUsed, // REAL heap usage
      heapTotal: memory.heapTotal, // REAL heap total  
      external: memory.external || 0, // REAL external memory
      arrayBuffers: (memory as any).arrayBuffers || 0, // REAL array buffers
    },
    cpu: {
      load1: loadAvg[0] || 0, // REAL 1-minute load average
      load5: loadAvg[1] || 0, // REAL 5-minute load average  
      load15: loadAvg[2] || 0, // REAL 15-minute load average
      cores: os.cpus().length, // REAL CPU core count
    },
    platform: process.platform, // REAL platform (win32, linux, darwin)
    pid: process.pid, // REAL process ID
    timestamp: Date.now(), // REAL current timestamp
  };
};

// Analytics MUST be deterministic - derived from REAL signals only
export const getDeterministicAnalytics = () => {
  const uptime = process.uptime(); // REAL uptime
  // Derive metrics deterministically from REAL data - NO randomness
  const users = Math.max(1, Math.round(uptime / 10)); // 1 user per 10 seconds uptime
  const sessions = Math.round(users * 2.5); // Deterministic multiplier
  const models = 1; // TensorFlow.js WebGL is available (binary: 0 or 1)
  const datasets = 1; // HuggingFace integration is available (binary: 0 or 1)
  
  return {
    users,
    sessions, 
    models,
    datasets,
    timestamp: Date.now(), // REAL timestamp
  };
};
```

### External API Integration (MUST call real services)
```typescript
// server/services/huggingface.ts - REAL HuggingFace API calls only
import { z } from 'zod';

const DatasetQuerySchema = z.object({
  q: z.string().min(1).max(64).default('persian'),
  limit: z.number().min(1).max(50).default(12),
});

export async function searchDatasets(query: string, limit = 12) {
  const validated = DatasetQuerySchema.parse({ q: query, limit });
  // REAL HuggingFace API endpoint - not a mock
  const url = `https://huggingface.co/api/datasets?search=${encodeURIComponent(validated.q)}&limit=${validated.limit}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    // REAL HTTP request to external API
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status} ${response.statusText}`);
    }
    
    // REAL response data from HuggingFace
    const data = await response.json();
    return {
      items: data, // REAL dataset array from HuggingFace
      query: validated.q,
      count: Array.isArray(data) ? data.length : 0,
      timestamp: Date.now(), // REAL timestamp
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('HuggingFace API timeout after 10 seconds');
    }
    throw error; // Re-throw REAL errors, don't mask them
  }
}
```

### WebSocket Real-time Data (MUST send actual system updates)
```typescript
// server/websocket.ts - Send REAL system updates via WebSocket
wss.on('connection', (ws, req) => {
  const correlationId = req.headers['x-correlation-id'] as string || 'ws-' + Date.now();
  
  // Send REAL welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    correlationId,
    timestamp: Date.now(), // REAL timestamp
  }));
  
  // Send REAL system metrics every 5 seconds
  const heartbeatInterval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      const metrics = getSystemMetrics(); // REAL system data
      ws.send(JSON.stringify({
        type: 'heartbeat', 
        uptime: metrics.uptime, // REAL uptime
        memory: metrics.memory.heapUsed, // REAL memory usage
        timestamp: Date.now(), // REAL timestamp
        correlationId,
      }));
    }
  }, 5000);
  
  // Echo REAL messages back
  ws.on('message', (raw) => {
    try {
      const data = String(raw); // REAL message content
      ws.send(JSON.stringify({
        type: 'echo',
        data, // REAL echoed data
        timestamp: Date.now(), // REAL timestamp
        correlationId,
      }));
    } catch (error) {
      console.error('WebSocket message error:', error); // REAL error logging
    }
  });
});
```

---

## Evidence Requirements - REAL PROOF ONLY

### What You MUST Provide
Every implementation claim must be backed by **REAL, VERIFIABLE EVIDENCE**:

#### 1. Command Line Outputs (ACTUAL, not fabricated)
```bash
# Example of REAL evidence required:
$ npm run build
> vite build
✓ building for production...
✓ 1450 modules transformed.
dist/index.html                   2.43 kB │ gzip:  0.85 kB
dist/assets/index-a1b2c3d4.js   842.15 kB │ gzip: 245.23 kB
dist/assets/index-e5f6g7h8.css   12.34 kB │ gzip:   3.21 kB
✓ built in 4.52s

$ curl -fsS http://localhost:8080/health
{"status":"healthy","uptime":127,"memory":{"rss":45234176,"heapUsed":23451232,"heapTotal":35467264},"pid":12345,"timestamp":1703123456789}

$ curl -fsS "http://localhost:8080/api/datasets/search?q=persian"  
{"items":[{"id":"dataset_123","author":"user","downloads":1500}],"query":"persian","count":1,"timestamp":1703123456790}
```

#### 2. Browser Evidence (REAL screenshots, not mockups)
- **Network Panel:** Show actual font loading with `HTTP 200` and `MIME font/woff2`
- **Console:** Demonstrate NO TensorFlow WASM errors, NO routing basename issues
- **WebSocket Frames:** Show real `welcome`, `heartbeat`, `echo` messages with actual data
- **Performance:** Actual Lighthouse scores, not estimated claims

#### 3. File System Evidence (REAL directory listings)
```bash
# Example of required evidence:
$ find dist -type f | head -10
dist/index.html
dist/404.html
dist/.nojekyll  
dist/assets/index-a1b2c3d4.js
dist/assets/index-e5f6g7h8.css
dist/fonts/vazirmatn/Vazirmatn-Variable.woff2

$ ls -la server-dist/
total 48
-rw-r--r-- 1 user group 12543 Dec 21 10:30 index.js
-rw-r--r-- 1 user group  8234 Dec 21 10:30 index.js.map
```

#### 4. Health Check Responses (REAL API responses)
```json
// REAL /health response - not fabricated
{
  "status": "healthy",
  "uptime": 3847,
  "memory": {
    "rss": 52428800,
    "heapUsed": 28311552,
    "heapTotal": 41943040,
    "external": 1089024
  },
  "pid": 15423,
  "timestamp": 1703125234567,
  "correlationId": "abc123-def456-ghi789"
}
```

### What is FORBIDDEN as Evidence
- ❌ **Mock JSON responses** - No manually created API responses
- ❌ **Fake command outputs** - No simulated terminal sessions  
- ❌ **Staged screenshots** - No edited or manipulated browser images
- ❌ **Placeholder logs** - No example log entries that weren't actually generated
- ❌ **Estimated metrics** - No "approximately X" or "around Y" performance claims
- ❌ **Aspirational statements** - No "will be" or "should achieve" claims without proof

### Validation Checklist for Evidence
Before submitting any evidence, verify:
- [ ] Command outputs are copy-pasted from actual terminal sessions
- [ ] API responses contain real timestamps and correlation IDs  
- [ ] Screenshots show actual browser network/console panels
- [ ] File listings are from real `ls`/`find` commands
- [ ] Performance metrics are from actual Lighthouse runs
- [ ] Docker health checks show real container status
- [ ] CI/CD logs are from actual GitHub Actions runs5000),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API call failed (${endpoint}):`, error);
    return null;
  }
}

// WebSocket URL construction (use current location)
export function getWebSocketUrl(): string {
  if (IS_GITHUB_PAGES) return ''; // No WebSocket on GitHub Pages
  
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${location.host}/ws`;
}
```

---

## Frontend Implementation Requirements

### Component Architecture
Every component in `src/components/` must be:
1. **Functional and accessible** - No placeholder content
2. **Properly typed** - Full TypeScript interfaces
3. **Error-handled** - Graceful failure states
4. **Responsive** - Mobile-first design
5. **Performant** - Proper memo usage where needed

### Required Pages/Components
- **Landing Page:** Hero section with system overview
- **Dashboard:** Real-time metrics and system status
- **Analytics:** Charts with live data from WebSocket
- **Models:** TensorFlow.js capabilities showcase
- **Datasets:** HuggingFace integration with search
- **Monitoring:** System health and WebSocket status
- **Logs:** Real-time log streaming

### State Management Pattern
```typescript
// SystemContext must provide real system state
interface SystemContextType {
  health: {
    api: boolean;
    websocket: boolean;
    backend: boolean;
  };
  metrics: SystemMetrics | null;
  datasets: Dataset[];
  wsConnection: WebSocket | null;
  theme: 'light' | 'dark';
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
}

// All state updates must be real, not simulated
const SystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Implementation must handle real WebSocket connections
  // Must fetch actual system metrics
  // Must integrate with HuggingFace API
};
```

### WebSocket Integration
```typescript
// Real-time features must use actual WebSocket
const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setStatus('connected');
      setSocket(ws);
    };
    
    ws.onclose = () => {
      setStatus('disconnected');
      setSocket(null);
      // Implement reconnection logic
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('disconnected');
    };
    
    return () => ws.close();
  }, [url]);
  
  return { socket, status };
};
```

---

## Backend Implementation Requirements

### Express Server Structure
```typescript
// server/index.ts - Complete implementation required
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { WebSocketServer } from 'ws';
import http from 'http';

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

// Request logging
app.use(morgan('combined'));

// Health endpoint - must return real system info
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid,
  });
});

// API routes - must return real data
app.use('/api', apiRoutes);

// WebSocket server - must handle real connections
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    timestamp: Date.now(),
  }));
  
  // Set up heartbeat
  const heartbeat = setInterval(() => {
    ws.send(JSON.stringify({
      type: 'heartbeat',
      metrics: getSystemMetrics(),
      timestamp: Date.now(),
    }));
  }, 5000);
  
  ws.on('close', () => {
    clearInterval(heartbeat);
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### API Endpoints Required
- `GET /health` - System health check
- `GET /api/system/metrics` - Real system metrics
- `GET /api/datasets/search?q=query` - HuggingFace search
- `GET /api/analytics/overview` - System analytics
- `WebSocket /ws` - Real-time communication

---

## Docker & Infrastructure

### Multi-stage Dockerfile
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build
RUN npm run build:server

# Production stage
FROM node:20-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server-dist ./server-dist

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:8080/health').then(r => r.ok ? process.exit(0) : process.exit(1))"

EXPOSE 8080
USER node
CMD ["node", "server-dist/index.js"]
```

### Docker Compose Configuration
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      target: production
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8080/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
```

### Nginx Configuration
```nginx
# docker/nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:8080;
    }

    server {
        listen 80;
        server_name localhost;

        # WebSocket upgrade handling
        location /ws {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # API routes
        location /api {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Static files
        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

---

## CI/CD Pipeline Requirements

### Build Workflow
```yaml
# .github/workflows/build.yml
name: Build and Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Build frontend
        run: npm run build
      
      - name: Build backend
        run: npm run build:server
      
      - name: Test
        run: npm test
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist-${{ matrix.node-version }}
          path: |
            dist/
            server-dist/
```

### Deploy Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install and build
        run: |
          npm ci
          npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v3
      
      - name: Upload to Pages
        uses: actions/upload-pages-artifact@v2
        with:
          path: dist/
      
      - name: Deploy to Pages
        uses: actions/deploy-pages@v2
```

---

## TypeScript Configuration

### Frontend Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["server", "node_modules"]
}
```

### Backend Configuration
```json
// tsconfig.server.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "outDir": "./server-dist",
    "rootDir": "./server",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "moduleResolution": "node"
  },
  "include": ["server/**/*"],
  "exclude": ["node_modules", "dist", "src"]
}
```

---

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:client": "vite",
    "dev:server": "ts-node-dev --respawn --transpile-only server/index.ts",
    "build": "tsc && vite build",
    "build:server": "tsc -p tsconfig.server.json",
    "start": "node server-dist/index.js",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit && tsc -p tsconfig.server.json --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "docker:build": "docker build -t newboltai-app .",
    "docker:run": "docker run -p 8080:8080 newboltai-app",
    "docker:compose": "docker-compose up --build",
    "format": "prettier --write \"src/**/*.{ts,tsx}\" \"server/**/*.ts\""
  }
}
```

---

## Testing Requirements

### Frontend Tests
```typescript
// src/__tests__/Dashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { SystemProvider } from '@/context/SystemContext';
import Dashboard from '@/pages/Dashboard';

describe('Dashboard', () => {
  it('displays real system metrics', async () => {
    render(
      <SystemProvider>
        <Dashboard />
      </SystemProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/System Uptime/)).toBeInTheDocument();
      expect(screen.getByText(/Memory Usage/)).toBeInTheDocument();
    });
  });

  it('shows WebSocket connection status', async () => {
    render(
      <SystemProvider>
        <Dashboard />
      </SystemProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Connected|Connecting|Disconnected/)).toBeInTheDocument();
    });
  });
});
```

### Backend Tests
```typescript
// server/__tests__/api.test.ts
import request from 'supertest';
import app from '../index';

describe('API Endpoints', () => {
  test('GET /health returns system status', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('memory');
  });

  test('GET /api/system/metrics returns real metrics', async () => {
    const response = await request(app).get('/api/system/metrics');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('memory');
    expect(response.body).toHaveProperty('cpu');
  });
});
```

---

## Deployment and Environment Configuration

### Environment Variables
```bash
# .env.production
NODE_ENV=production
PORT=8080
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_WS_URL=wss://your-api-domain.com/ws
DATABASE_URL=your-database-url
REDIS_URL=your-redis-url
```

### Production Optimizations
1. **Bundle Analysis:** Use webpack-bundle-analyzer
2. **Compression:** Enable gzip/brotli in Nginx
3. **Caching:** Implement proper cache headers
4. **CDN:** Configure for static assets
5. **Monitoring:** Set up error tracking and performance monitoring

---

## Validation Criteria

### Functional Requirements ✓
- [ ] All React components are functional and accessible
- [ ] All API endpoints return real data (no mock/fake responses)
- [ ] WebSocket connections work with proper reconnection
- [ ] TensorFlow.js initializes with WebGL backend
- [ ] HuggingFace API integration returns actual datasets
- [ ] System metrics reflect real Node.js process data
- [ ] Docker containers build and run successfully
- [ ] CI/CD pipelines pass all tests
- [ ] GitHub Pages deployment works with proper routing

### Performance Requirements ✓
- [ ] Frontend bundle size < 2MB
- [ ] Initial page load < 3 seconds
- [ ] API response times < 500ms
- [ ] WebSocket latency < 100ms
- [ ] Lighthouse score > 90
- [ ] Memory usage stable under load

### Security Requirements ✓
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] No sensitive data in client bundle
- [ ] Proper error handling without info disclosure
- [ ] Security headers implemented
- [ ] Docker containers run as non-root user

---

## Deliverables Required

When implementing this system, you must provide:

1. **Complete source code** with all files and configurations
2. **Docker containers** that build and run successfully
3. **CI/CD pipelines** that pass all checks
4. **Live demo URLs** for both local and deployed versions
5. **Test coverage reports** with >80% coverage
6. **Performance benchmarks** and optimization reports
7. **Documentation** for setup, deployment, and maintenance
8. **Evidence of real data integration** (API responses, WebSocket messages, system metrics)

**Remember:** This is a zero-tolerance environment for placeholder code, mock data, or incomplete implementations. Every feature must be fully functional and production-ready.