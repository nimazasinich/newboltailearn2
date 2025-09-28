# Persian Legal AI - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- Git

### 1. Clone and Install
```bash
git clone <repository-url>
cd newboltailearn2
npm install
```

### 2. Start Backend
```bash
npm start
```
Backend runs on `http://localhost:8080`

### 3. Start Frontend (Development)
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```
Builds to `docs/` directory

## 🗄️ Database Setup

### SQLite Database
The application uses SQLite with the following schema:

**Tables:**
- `documents` - Persian legal documents
- `models` - AI models and training data
- `datasets` - Training datasets
- `training_sessions` - Training session history
- `categories` - Document categories
- `users` - User authentication

### Seed Data
The database is automatically seeded with:
- 5 sample Persian legal documents
- 6 legal categories (Civil, Criminal, Commercial, Family, Labor, Administrative)
- Sample training data

## 🌐 API Endpoints

### Health Check
```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/health
```

### Documents
```bash
# Get all documents
curl http://localhost:8080/api/documents

# Get documents by category
curl http://localhost:8080/api/documents?category=civil

# Get specific document
curl http://localhost:8080/api/documents/doc_001
```

### Categories
```bash
curl http://localhost:8080/api/categories
```

### Analytics
```bash
curl http://localhost:8080/api/analytics
```

### Models
```bash
# Get all models
curl http://localhost:8080/api/models

# Create new model
curl -X POST http://localhost:8080/api/models \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Model", "type": "persian-legal-classifier"}'
```

## 🎨 Frontend Architecture

### Tech Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** with HashRouter for GitHub Pages

### Key Components
- `EnhancedOverview` - Main dashboard with real API data
- `DataPage` - Dataset management with real API integration
- `LoadingScreen` - Modern loading component with Persian text
- `EnhancedAppLayout` - Main layout with glassmorphism design

### Design System
- **Glassmorphism** with backdrop blur effects
- **RTL Support** for Persian text
- **Vazirmatn Font** for Persian typography
- **Unified Color Palette** with emerald, blue, and purple gradients

## 🚀 Deployment

### GitHub Pages
1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to gh-pages branch:
   ```bash
   git checkout --orphan gh-pages
   cp -r docs/* .
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

3. Enable GitHub Pages in repository settings
4. Site will be available at: `https://<username>.github.io/newboltailearn2/`

### Production Backend
The backend can be deployed to any Node.js hosting service:

```bash
# Set environment variables
export NODE_ENV=production
export PORT=8080

# Start production server
npm start
```

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Test Coverage
- Unit tests for API endpoints
- Integration tests for database operations
- E2E tests for user workflows

## 🔧 Configuration

### Environment Variables
```bash
NODE_ENV=production
PORT=8080
DATABASE_PATH=./data/persian_legal_ai.db
CORS_ORIGIN=*
```

### Vite Configuration
- Base path: `/newboltailearn2/` for GitHub Pages
- Proxy configuration for API calls
- Code splitting for optimal performance

## 📊 Performance

### Bundle Analysis
- **Vendor Bundle**: 140KB (React, React-DOM)
- **UI Bundle**: 132KB (Components, Icons)
- **Charts Bundle**: 341KB (Chart.js, Recharts)
- **TensorFlow Bundle**: 1.4MB (AI/ML libraries)

### Optimization
- Code splitting by feature
- Lazy loading for routes
- Image optimization
- Gzip compression

## 🔒 Security

### Implemented Security Features
- **Rate Limiting**: 100 requests per 15 minutes
- **Input Sanitization**: XSS protection
- **CORS Configuration**: Restricted origins
- **SQL Injection Protection**: Parameterized queries
- **Helmet.js**: Security headers

### Authentication
- JWT token-based authentication
- Password hashing with bcrypt
- Session management
- Role-based access control

## 🐛 Troubleshooting

### Common Issues

**Build Fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Database Connection Issues**
```bash
# Check database file permissions
ls -la data/persian_legal_ai.db

# Recreate database
rm data/persian_legal_ai.db
npm start
```

**API Not Responding**
```bash
# Check if backend is running
curl http://localhost:8080/health

# Check logs
npm start 2>&1 | tee server.log
```

### Logs
- Backend logs: Console output
- Frontend logs: Browser DevTools
- Error tracking: Built-in error boundaries

## 📈 Monitoring

### Health Checks
- `/health` - Basic health status
- `/api/health` - Detailed system status
- `/api/analytics` - System metrics

### Metrics
- CPU usage
- Memory consumption
- Database connections
- API response times
- Training session status

## 🔄 Updates

### Updating the Application
1. Pull latest changes: `git pull origin main`
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Restart services: `npm start`

### Database Migrations
Database schema is automatically created on first run. For schema updates, modify the initialization code in `server/main.js`.

## 📞 Support

### Documentation
- API documentation: Available in code comments
- Component documentation: JSDoc comments
- Deployment guide: This file

### Issues
- Check logs for error messages
- Verify environment variables
- Test API endpoints individually
- Check database connectivity

---

**Last Updated**: September 27, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅