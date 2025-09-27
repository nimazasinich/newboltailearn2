# 🚀 Enhanced Liara Deployment Guide

This document provides comprehensive instructions for deploying the `newboltailearn` project to Liara using Docker with full validation, testing, and monitoring.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Manual Deployment](#manual-deployment)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### Required Environment Variables

```bash
# Required
export LIARA_API_TOKEN="your-liara-api-token"
export LIARA_APP_ID="newboltailearn"

# Optional but recommended
export LIARA_TEAM_ID="your-team-id"  # If deploying under a team
export PORT="8000"
export DATABASE_URL="./database.sqlite"
export JWT_SECRET="your-jwt-secret"
export SESSION_SECRET="your-session-secret"
```

### Tools Required

- Node.js 20+
- npm
- Git
- Liara CLI (`@liara/cli`)

## 🚀 Quick Start

### Option 1: Enhanced Deployment Script

```bash
# Set your API token
export LIARA_API_TOKEN="your-liara-api-token"

# Run the enhanced deployment script
./deploy-enhanced.sh
```

### Option 2: GitHub Actions (Recommended)

1. **Set up repository secrets** in GitHub:
   - `LIARA_API_TOKEN` (required)
   - `LIARA_TEAM_ID` (optional)
   - `DATABASE_URL` (optional)
   - `JWT_SECRET` (recommended)
   - `SESSION_SECRET` (recommended)

2. **Push to main branch** or **manually trigger** the workflow

3. **Monitor deployment** in the Actions tab

## 📖 Manual Deployment

If you prefer to run the deployment steps manually:

### 1. Prepare Environment

```bash
# Create deployment branch
git checkout -b deploy/liara

# Install Liara CLI
npm install -g @liara/cli

# Install project dependencies
npm ci
```

### 2. Run Validations

```bash
# Database schema validation and migration
node scripts/migrate-db-schema.js
node scripts/validate-db-schema.js

# Code quality checks
npm run lint
npm run type-check  # if TypeScript
npm run build
npm test
```

### 3. Configure Liara

```bash
# Authenticate
liara account:add --api-token "$LIARA_API_TOKEN"

# Create app (if doesn't exist)
liara create "$LIARA_APP_ID" --platform docker

# Set environment variables
liara env:set --app "$LIARA_APP_ID" NODE_ENV=production
liara env:set --app "$LIARA_APP_ID" PORT=8000
# ... add other environment variables
```

### 4. Deploy

```bash
# Deploy using Docker
liara deploy --app "$LIARA_APP_ID" --dockerfile ./Dockerfile --port 8000

# Monitor logs
liara logs --app "$LIARA_APP_ID" --follow
```

### 5. Health Check

```bash
# Test the deployment
curl -fsS "https://$LIARA_APP_ID.liara.run/health"
```

### 6. Merge to Main

```bash
# Commit changes
git add .
git commit -m "feat: Deploy to Liara with enhanced validation"

# Merge to main
git push origin deploy/liara
git checkout main
git merge --no-ff deploy/liara
git push origin main

# Cleanup
git branch -d deploy/liara
git push origin --delete deploy/liara
```

## ⚙️ Environment Variables

### Core Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LIARA_API_TOKEN` | ✅ | - | Liara API authentication token |
| `LIARA_APP_ID` | ✅ | `newboltailearn` | Liara application identifier |
| `LIARA_TEAM_ID` | ❌ | - | Team ID if deploying under a team |
| `PORT` | ❌ | `8000` | Application port |

### Application Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | ❌ | `production` | Node.js environment |
| `DATABASE_URL` | ❌ | `./database.sqlite` | Database connection string |
| `DB_PATH` | ❌ | `./database.sqlite` | Alternative database path |
| `HOST` | ❌ | `0.0.0.0` | Application host binding |

### Security Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | 🔶 | - | JWT token signing secret |
| `SESSION_SECRET` | 🔶 | - | Session encryption secret |

### Feature Flags

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SERVE_FRONTEND` | ❌ | `false` | Whether to serve frontend assets |
| `ENABLE_HF_STARTUP_CHECK` | ❌ | `false` | HuggingFace connectivity check |
| `ENABLE_WORKERS` | ❌ | `true` | Enable worker threads |

## 🗄️ Database Schema

### Schema Validation

The deployment process includes automatic database schema validation:

```bash
node scripts/validate-db-schema.js
```

**Required Tables:**
- `users` - User management
- `models` - ML model metadata
- `training_sessions` - Training session tracking
- `datasets` - Dataset information
- `analytics` - Usage analytics

**Critical Columns Validated:**
- `training_sessions.dataset_id`
- `training_sessions.parameters`
- `training_sessions.created_at`
- `models.status`
- `users.password_hash`

### Schema Migration

If schema issues are detected, run the migration script:

```bash
node scripts/migrate-db-schema.js
```

This will:
- Add missing columns with appropriate defaults
- Create recommended indexes
- Update existing data to match new schema
- Validate data integrity

## 🏥 Monitoring & Health Checks

### Health Endpoints

- **Health Check**: `https://newboltailearn.liara.run/health`
- **Root Endpoint**: `https://newboltailearn.liara.run/`

### Monitoring Commands

```bash
# View real-time logs
liara logs --app newboltailearn --follow

# View recent logs
liara logs --app newboltailearn --since "10m"

# Check app status
curl -fsS "https://newboltailearn.liara.run/health"
```

### Performance Monitoring

The deployment includes automatic performance monitoring:
- Response time tracking
- Memory usage validation
- Database connection health
- Worker thread status

## 🔍 GitHub Actions CI/CD

### Workflow Triggers

- **Push to main**: Automatic deployment
- **Pull Request**: Validation only
- **Manual trigger**: On-demand deployment with options

### Workflow Jobs

1. **Validate** - Code quality, tests, schema validation
2. **Deploy** - Full deployment to Liara
3. **Post-Deploy** - Extended health checks and validation

### Secrets Configuration

In your GitHub repository settings, add these secrets:

```
LIARA_API_TOKEN=your-liara-api-token
LIARA_TEAM_ID=your-team-id (optional)
DATABASE_URL=your-database-url (optional)
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Authentication Failed
```
Error: Liara authentication failed
```
**Solution**: Verify `LIARA_API_TOKEN` is set correctly

#### 2. Database Schema Validation Failed
```
Error: Missing column 'dataset_id' in table 'training_sessions'
```
**Solution**: Run the migration script:
```bash
node scripts/migrate-db-schema.js
```

#### 3. Health Check Failed
```
Error: Application health check failed
```
**Solutions**:
- Check application logs: `liara logs --app newboltailearn`
- Verify PORT configuration
- Check database connectivity
- Verify all required environment variables are set

#### 4. Deployment Timeout
```
Error: Deployment timed out
```
**Solutions**:
- Check Docker build process
- Verify dependencies install correctly
- Check for resource limits
- Review application startup logs

#### 5. Tests Failed
```
Error: Tests failed - deployment stopped
```
**Solutions**:
- Fix failing tests
- Set `ALLOW_TEST_FAILURES=true` for non-critical test failures
- Use manual deployment with `force_deploy` option

### Debug Commands

```bash
# Check app status in Liara
liara app:list

# Get detailed logs
liara logs --app newboltailearn --since "30m" --timestamps

# Check environment variables
liara env:list --app newboltailearn

# Restart application
liara app:restart --app newboltailearn

# Check deployment history
liara deploy:list --app newboltailearn
```

### Log Analysis

Common log patterns to look for:

```bash
# Application started successfully
grep "Server running on port" deployment-logs.txt

# Database connection issues
grep -i "database\|sqlite\|connection" deployment-logs.txt

# Memory or performance issues
grep -i "memory\|heap\|performance" deployment-logs.txt

# Authentication/security issues
grep -i "auth\|token\|jwt" deployment-logs.txt
```

## 📚 Additional Resources

- [Liara Documentation](https://docs.liara.ir/)
- [Liara CLI Reference](https://docs.liara.ir/references/cli/)
- [Docker Deployment Guide](https://docs.liara.ir/platforms/docker/)
- [Environment Variables](https://docs.liara.ir/references/cli/environment-variables/)

## 🆘 Support

If you encounter issues not covered in this guide:

1. Check the deployment logs in `deploy-reports/`
2. Review the GitHub Actions workflow output
3. Consult the Liara documentation
4. Check the project's issue tracker

---

**Last Updated**: $(date)
**Version**: Enhanced Deployment v2.0