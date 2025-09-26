# Persian Legal AI Dashboard – Audit Report

## Executive Summary (Status: **Red**)
Production readiness remains **unverified**. The latest audit confirms:

1. **TypeScript compilation still fails** (six blocking errors in `src/services/training.ts`).
2. **Production server crashes on startup** because the Node ESM entrypoint attempts to call `require`.
3. **Health probes to all documented endpoints are refused**, so uptime guarantees cannot be met.

While `npm run build` does succeed, the combination of TypeScript failures and an inoperable server keeps the deployment posture at **Red** until these issues are resolved.

## Evidence Table

| Area | Result | Evidence |
| --- | --- | --- |
| Repo status | Clean working tree at commit `540de94bf9b9e10f6ca76af3c7c2d06259916c36` on branch `work` | `audit/artifacts/git-status.txt`, `audit/artifacts/commit.txt`, `audit/artifacts/branch.txt` |
| Install | `npm ci` succeeded (with deprecation warnings) | `audit/artifacts/npm-ci.log` |
| TypeScript | **Fail** – 6 errors in `src/services/training.ts` | `audit/artifacts/tsc.log` |
| ESLint | Pass – no output, exit code 0 | `audit/artifacts/lint.log` |
| Build | **Success** – `npm run build` completed, assets emitted to `docs/` | `audit/artifacts/build.log`, `audit/artifacts/docs-files.txt` |
| Prod server | **Down** – `npm start` aborts (`require` not allowed in ESM) | `audit/artifacts/server.log` |
| Health endpoints | **Fail** – all curls to port 3000 refused | `audit/artifacts/curl-errors.txt`, `audit/artifacts/health-probes.txt` |
| Dev server | Signal detected (`http://localhost:5173/`) | `audit/artifacts/dev.log`, `audit/artifacts/dev-signal.txt` |
| Sidebar mounts | Only `ModernSidebar` rendered in `EnhancedAppLayout` | `audit/artifacts/mount-modern.txt`, `audit/artifacts/mount-creative.txt`, `audit/artifacts/mount-enhanced.txt`, `audit/artifacts/mount-generic.txt` |
| Layout spacing | `<div className="flex-1 flex flex-col min-h-screen">` reserves content space | `audit/artifacts/layout-flex.txt`, `audit/artifacts/layout-main.txt` |
| Secret hints | Potential secret tokens detected in repo (needs review) | `audit/artifacts/secret-hints.txt` |
| Regression diff | Previous commit unavailable (no `origin/main`), diff empty | `audit/artifacts/prev-commit.txt`, `audit/artifacts/diff-prev.txt` |

## Sidebar & Layout Analysis

* **Available sidebars:**
  * `ModernSidebar` (`src/components/layout/ModernSidebar.tsx`).
  * `CreativeSidebar` (`src/components/layout/CreativeSidebar.tsx`).
  * Legacy `Sidebar` (`src/components/layout/Sidebar.tsx`).
* **Mount locations:** Only `EnhancedAppLayout` imports and renders `<ModernSidebar />` (see `audit/artifacts/import-modern.txt`, `audit/artifacts/mount-modern.txt`). No other sidebar variants are mounted in the audited tree; `audit/artifacts/mount-creative.txt`, `audit/artifacts/mount-enhanced.txt`, and `audit/artifacts/mount-generic.txt` are empty.
* **Layout spacing:** `EnhancedAppLayout` wraps the sidebar and content in a top-level flex container with `min-h-screen`, and the content container uses `flex-1 flex flex-col min-h-screen` ensuring main content grows without overlap (`audit/artifacts/layout-flex.txt`). `<main>` elements with `flex-1 min-w-0` were not detected (`audit/artifacts/layout-main.txt` empty), indicating content sections rely on div wrappers rather than semantic `<main>`.
* **RTL & stacking:** `ModernSidebar` sets `dir="rtl"`, applies `border-l` and `z-50` classes for layering (`audit/artifacts/sidebar-style-hints.txt`). Because only one sidebar mounts, overlapping risk is currently **Low**. If alternate layouts become active, review stacking contexts around `z-50` usage.

## Build & Runtime Verification

* `npm ci` installs all dependencies successfully despite multiple deprecation warnings (`audit/artifacts/npm-ci.log`).
* `npm run build` finishes with a full Vite bundle; chunk size warnings highlight very large TensorFlow assets (`audit/artifacts/build.log`).
* `npm start` fails: Node treats `server/main.js` as ESM and throws "require is not defined" before the server can listen, so no port is open (`audit/artifacts/server.log`).
* Health checks to `/health`, `/api/health`, and `/` on port 3000 all return connection refused because the server never bound to the port (`audit/artifacts/curl-errors.txt`).
* `npm run dev` launches a Vite dev server and prints the localhost banner before being terminated by `timeout` (`audit/artifacts/dev.log`).

## Regressions (File Deletions/Renames)

* Unable to compare against `origin/main` – remote ref missing in this environment (`audit/artifacts/prev-commit.txt`). Consequently, `audit/artifacts/diff-prev.txt` is empty. No evidence of deleted essential files within the current working tree.

## Security & CI Hygiene

* `audit/artifacts/secret-hints.txt` flags files containing token/secret keywords. Manual inspection recommended to ensure no hard-coded secrets remain.
* `.github/workflows/` directory appears absent (ripgrep found no YAML files), so CI safeguards could not be audited (`audit/artifacts/ci-hints.txt`).
* Dockerfiles do not copy `.env*` files according to `audit/artifacts/docker-env-copies.txt` (empty due to lack of matches).

## Actionable Fix List

| Priority | Issue | Recommended Action |
| --- | --- | --- |
| P0 | TypeScript compilation fails (`src/services/training.ts`) | Fix typings: ensure `TrainingConfig` receives required fields, refactor fetch wrappers to parse JSON before casting. Validate with `npx tsc --noEmit`. |
| P0 | Production server crash (`server/main.js`) | Update server entrypoint to use ESM-compatible imports or convert to `.cjs`; rerun `npm start` and confirm health checks. |
| P1 | Health endpoints unreachable | After server fix, ensure `/health` and `/api/health` respond with HTTP 200; update documentation if endpoints differ. |
| P1 | Large production bundles (`docs/assets/tensorflow-*.js`) | Consider code-splitting or lazy-loading ML libraries to improve load times. |
| P2 | Potential secret strings in repo | Review files listed in `audit/artifacts/secret-hints.txt`, scrub or secure as needed. |
| P2 | Missing semantic `<main>` flex container | Optionally wrap routed content in a `<main>` with `flex-1 min-w-0` to improve accessibility. |

