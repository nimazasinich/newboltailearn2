# 🔧 SURGICAL FIX: Make TypeScript Project Fully Functional

## Context
Project has complete architecture (Vite frontend + Express backend) but **8 broken relative imports** prevent functionality. All target files exist as `.ts` but imports reference `.js` or wrong filenames.

## Mission: Zero-Downtime Import Surgery

### PHASE 1: Fix Broken Import Paths (EXACT CHANGES ONLY)

**File: `server/index.ts`**
```diff
- import datasetRoutes from './routes/datasets.ts';
+ import datasetRoutes from './routes/datasets.routes';
```

**File: `server/routes/export.routes.ts`**  
```diff
- import { exportController } from '../modules/controllers/export.controller.js';
+ import { exportController } from '../modules/controllers/export.controller';
```

**File: `server/routes/index.ts`**
```diff
- import exportRoutes from './export.routes.js';
+ import exportRoutes from './export.routes';
- import { exportController } from '../modules/controllers/export.controller.js';
+ import { exportController } from '../modules/controllers/export.controller';
```

**File: `tests/integration/workerIntegration.test.ts`**
```diff
- import { errorHandler } from '../../server/modules/workers/errorHandler.js';
+ import { errorHandler } from '../../server/modules/workers/errorHandler';
- import { workerMetrics } from '../../server/modules/monitoring/workerMetrics.js';
+ import { workerMetrics } from '../../server/modules/monitoring/workerMetrics';
```

**File: `tests/unit/workers/trainingWorker.test.ts`**
```diff
- import { errorHandler } from '../../../server/modules/workers/errorHandler.js';
+ import { errorHandler } from '../../../server/modules/workers/errorHandler';
- import { workerMetrics } from '../../../server/modules/monitoring/workerMetrics.js';
+ import { workerMetrics } from '../../../server/modules/monitoring/workerMetrics';
```

### PHASE 2: Ensure Essential Scripts Exist

**Check `package.json` scripts section - ADD ONLY IF MISSING:**
```json
{
  "scripts": {
    "typecheck": "tsc -p tsconfig.json --noEmit"
  }
}
```

### PHASE 3: Verification Protocol

**Execute in sequence (must ALL pass):**
```bash
# 1. Clean install
npm ci

# 2. TypeScript compilation check
npm run typecheck

# 3. Frontend build
npm run build  

# 4. Backend startup (Terminal 1)
npm run start:dev

# 5. Frontend dev server (Terminal 2) 
npm run dev

# 6. Test suite
npm run test

# 7. End-to-end validation
curl http://localhost:5173/api/health
# Should return 200 OK via Vite proxy
```

### PHASE 4: Acceptance Criteria

✅ **All 8 import paths resolved**  
✅ **`npm run typecheck` = 0 errors**  
✅ **Vite dev server loads at :5173**  
✅ **Express backend runs at :8080**  
✅ **Proxy `/api/*` → `:8080` works**  
✅ **Tests pass with Vitest**  
✅ **No architectural changes made**  

---

## 🚨 CONSTRAINTS (CRITICAL)

- **NO file renames or moves**
- **NO package.json dependency changes** 
- **NO architecture modifications**
- **NO tech stack changes**
- **KEEP existing ports (5173, 8080)**
- **PRESERVE Vite proxy configuration**
- **Git history stays clean**

## 🎯 Expected Outcome

**Before:** 8 broken imports → TypeScript compilation fails  
**After:** Clean compilation → Full-stack dev environment functional  

**Timeline:** 5 minutes maximum for experienced developer

---

## Emergency Rollback Plan
```bash
git stash
git checkout main
npm ci
# Project returns to previous state
```

## Success Validation
- Frontend loads without console errors
- `/api/health` endpoint accessible via proxy
- Hot reload works on both frontend/backend
- Test suite runs completely
- TypeScript IntelliSense functions properly