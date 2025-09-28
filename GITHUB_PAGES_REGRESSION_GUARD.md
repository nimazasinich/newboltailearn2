# GitHub Pages Regression Guard

This document describes the comprehensive regression guard system implemented to prevent GitHub Pages deployment issues, specifically base path configuration problems.

## 🛡️ Overview

The regression guard system consists of:
1. **CI/CD Pipeline Check** - Automated verification on every PR
2. **Manual Script** - Local verification before deployment
3. **Documentation** - Clear instructions for maintaining the system

## 🔧 Components

### 1. CI/CD Pipeline (`.github/workflows/gh-pages-regression-guard.yml`)

**Triggers:**
- Pull requests to `main` branch
- Pushes to `main` branch
- Only runs when relevant files are changed:
  - `package.json`
  - `vite.config.ts`
  - `scripts/make-404.js`
  - `.github/workflows/gh-pages-regression-guard.yml`

**Checks:**
- ✅ Build script has correct base path (`/newboltailearn2/`)
- ✅ Built `index.html` contains correct base path
- ✅ Built `404.html` has correct meta refresh
- ✅ `.nojekyll` file exists
- ✅ No incorrect base paths in built files
- ✅ Asset paths use correct base path
- ✅ Deep link fallback works correctly

### 2. Manual Script (`scripts/gh-pages-regression-guard.sh`)

**Usage:**
```bash
# Run the regression guard
./scripts/gh-pages-regression-guard.sh
```

**Features:**
- Comprehensive workspace validation
- Build verification
- Base path checking
- 404 fallback validation
- Jekyll configuration check
- Asset path verification
- Deep link testing
- Colored output for easy reading
- Detailed error messages

### 3. Build Configuration

**Current Configuration:**
```json
{
  "scripts": {
    "build:gh": "cross-env VITE_BASE_PATH=/newboltailearn2/ vite build --config vite.config.ts && node scripts/make-404.js"
  }
}
```

**Key Files:**
- `package.json` - Build script configuration
- `vite.config.ts` - Vite build configuration
- `scripts/make-404.js` - 404.html generation script

## 🚀 Quick Verification Commands

### Base Path Check
```bash
grep -o "/newboltailearn2/" docs/index.html | head -1
```

### 404 Fallback Check
```bash
grep -n 'meta http-equiv="refresh" content="0; url=/newboltailearn2/"' docs/404.html
```

### Jekyll Disabled Check
```bash
test -f docs/.nojekyll && echo OK
```

### Built Files Check
```bash
find docs -type f | head -10
```

## 🔍 Manual Testing Checklist

### Pre-Deployment
- [ ] Run `./scripts/gh-pages-regression-guard.sh`
- [ ] Verify all checks pass
- [ ] Check CI pipeline status

### Post-Deployment
- [ ] Visit main page: `https://nimazasinich.github.io/newboltailearn2/`
- [ ] Test deep link: `https://nimazasinich.github.io/newboltailearn2/anything`
- [ ] Verify assets load (check Network tab)
- [ ] Confirm fonts load correctly
- [ ] Check console for errors

### Network Verification
1. Open Developer Tools → Network tab
2. Reload the page
3. Verify:
   - `index.html` loads (200 OK)
   - Main JS/CSS files load (200 OK)
   - `Vazirmatn-Variable.woff2` loads with `Content-Type: font/woff2`
   - No 404 errors for assets

## 🚨 Common Issues & Solutions

### Issue: Base Path Mismatch
**Symptoms:** Assets fail to load, 404 errors
**Solution:** 
1. Check `package.json` build script
2. Verify `VITE_BASE_PATH=/newboltailearn2/`
3. Rebuild with `npm run build:gh`

### Issue: 404 Fallback Not Working
**Symptoms:** Deep links don't redirect to main app
**Solution:**
1. Check `scripts/make-404.js`
2. Verify `404.html` has correct meta refresh
3. Ensure `.nojekyll` exists

### Issue: Jekyll Processing
**Symptoms:** Site shows Jekyll error page
**Solution:**
1. Ensure `.nojekyll` file exists in `docs/`
2. Verify file is empty (0 bytes)

## 📋 Cursor Prompt for Manual Verification

Use this prompt in Cursor for comprehensive verification:

```
**GitHub Pages Guard (Branch `gh-pages`)**

* Inspect `gh-pages` branch. Confirm root contains: `index.html`, `assets/**`, `fonts/**`, `404.html`, `.nojekyll`.
* Open `index.html`: assert all asset URLs start with `/newboltailearn2/`.
* Open `404.html`: assert it includes `<meta http-equiv="refresh" content="0; url=/newboltailearn2/">`.
* Load live URL and report: status of index, main JS/CSS, WOFF2 font (HTTP 200 + correct MIME), Console (no TFJS WASM/basename errors).
* Try a deep link (any subpath) and confirm SPA fallback works.
* If any check fails, apply the **minimal** fix (base path or 404 meta refresh), rebuild with `npm run build:gh`, republish to `gh-pages`, and re-verify.
* Return exact diffs, commands, and live evidence (Network screenshots).
```

## 🔄 Maintenance

### Regular Tasks
1. **Monthly:** Run regression guard script
2. **After any build changes:** Verify CI passes
3. **Before major releases:** Full manual testing

### When Adding New Features
1. Ensure build process doesn't break base path
2. Test with regression guard script
3. Verify CI pipeline passes

### Emergency Procedures
1. **If site is broken:**
   - Run `./scripts/gh-pages-regression-guard.sh`
   - Fix any issues found
   - Rebuild and redeploy
   
2. **If CI is failing:**
   - Check the specific error in GitHub Actions
   - Fix the underlying issue
   - Re-run the pipeline

## 📊 Monitoring

### Key Metrics to Watch
- CI pipeline success rate
- Site availability (main page loads)
- Asset loading success rate
- Deep link redirect success rate

### Alerts to Set Up
- CI pipeline failures
- Site downtime
- Asset loading errors

## 🎯 Success Criteria

The regression guard system is working correctly when:
- ✅ All CI checks pass
- ✅ Manual script runs without errors
- ✅ Live site loads correctly
- ✅ Deep links redirect properly
- ✅ Assets load without 404 errors
- ✅ Fonts display correctly
- ✅ No console errors related to base path

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Base Path Configuration](https://vitejs.dev/config/shared-options.html#base)
- [SPA Fallback for GitHub Pages](https://github.com/rafgraph/spa-github-pages)

---

**Last Updated:** $(date)
**Version:** 1.0.0
**Maintainer:** Persian Legal AI Team