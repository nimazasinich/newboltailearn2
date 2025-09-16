# Persian Legal AI Dashboard

🚀 *Project is now production-ready: frontend deployed on GitHub Pages, backend on Render; router fixed with HashRouter; security and cross-origin configuration completed.*

A comprehensive Persian legal document analysis system with AI classification and real-time training capabilities.

## 🚀 Features

- **Persian Legal Document Processing** - Advanced NLP processing for Persian legal texts
- **AI Model Training** - Real-time training with DoRA (Dynamic Rank Adaptation) and Persian BERT
- **Interactive Dashboard** - Real-time monitoring and analytics
- **WebSocket Integration** - Live updates for training progress and system metrics
- **RTL Support** - Full right-to-left language support for Persian content
- **GitHub Pages Ready** - Optimized for deployment on GitHub Pages

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript (strict mode disabled for faster development)
- **Vite** for build tooling and development
- **React Router** for navigation (BrowserRouter in dev, HashRouter in production)
- **Framer Motion** for animations
- **Chart.js** for data visualization
- **Tailwind CSS** for styling
- **Vazirmatn** font for Persian typography

### Backend
- **Node.js** with Express
- **SQLite** for data storage
- **WebSocket** for real-time communication
- **Better-SQLite3** for database operations

### AI/ML
- **TensorFlow.js** for model training and inference
- **Persian BERT** for text processing
- **DoRA (Dynamic Rank Adaptation)** for efficient model fine-tuning
- **QR-Adaptor** for model optimization

## 📦 Installation & Development

### Prerequisites
- Node.js ≥ 18
- npm or yarn

### Quick Setup (Development)

```bash
git clone https://github.com/nimazasinich/newboltailearn.git
cd newboltailearn
npm install
npm run dev
```

* Frontend: `http://localhost:5173`
* Backend API: `http://localhost:3001`

### Detailed Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/nimazasinich/newboltailearn.git
   cd newboltailearn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development servers**
   
   **Frontend (port 5173):**
   ```bash
   npm run dev
   ```
   
   **Backend (port 3001):**
   ```bash
   cd server
   npm install
   npm start
   ```

4. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint

## 🌐 API Endpoints

### Health & Monitoring
- `GET /api/health` - System health check
- `GET /api/monitoring` - System metrics (CPU, memory, disk, network)

### Models & Training
- `GET /api/models/:id` - Get specific model details
- `POST /api/models/:id/start` - Start model training
- `POST /api/models/:id/pause` - Pause model training
- `POST /api/models/:id/stop` - Stop model training

### Data Management
- `GET /api/datasets/:id` - Get dataset details
- `GET /api/logs` - Retrieve system logs

### WebSocket Events
- `system_metrics` - Real-time system performance data
- `training_progress` - Model training progress updates
- `training_complete` - Training completion notifications

## 🚀 Production Deployment

### Frontend: GitHub Pages
- **Hosting**: GitHub Pages with static deployment
- **Build folder**: `docs/` directory
- **Router**: HashRouter for SPA compatibility
- **Base path**: `/newboltailearn/` for asset loading
- **Fallback**: `404.html` and `.nojekyll` for SPA routing

### Backend: Render.com
- **Hosting**: Render.com web service
- **Environment**: Node.js with Express server
- **Database**: SQLite with persistent storage
- **Required Environment Variables**:
  - `NODE_ENV=production`
  - `SESSION_SECRET` (secure session management)
  - `JWT_SECRET` (JWT token signing)
  - `DB_PATH=./persian_legal_ai.db`
  - `RENDER_EXTERNAL_URL` (backend URL)
  - `VITE_API_URL` (API endpoint for frontend)
  - `VITE_WS_URL` (WebSocket endpoint)
  - `VITE_BASE_PATH=/newboltailearn/`

### API Endpoints
- **Root endpoint** (`/`): Returns JSON status
- **Health check** (`/health`): System health monitoring
- **Ping** (`/ping`): Simple connectivity test

### Manual Deployment to GitHub Pages

1. **Build for GitHub Pages**
   ```bash
   npm run build:gh
   ```

2. **Commit and push**
   ```bash
   git add .
   git commit -m "docs: publish to GitHub Pages"
   git push
   ```

3. **Configure GitHub Pages**
   - Go to repository Settings → Pages
   - Set source to "Deploy from a branch"
   - Select branch: `main` and folder: `/docs`

## 🔧 Configuration

### Environment Variables

**Development (.env.local):**
```env
VITE_API_BASE=/api
VITE_WS_PATH=/ws
```

**Production:**
- Set `GHPAGES=true` for GitHub Pages deployment
- Base path automatically configured as `/newboltailearn/`

### Proxy Configuration

Development server proxies API calls:
- `/api/*` → `http://localhost:3001`
- `/ws` → `ws://localhost:3001`

## 🔍 Troubleshooting

### Common Issues

1. **Router Context Error**
   - **Error**: "useRoutes() may be used only in the context of a <Router> component"
   - **Solution**: Ensure `main.tsx` is wrapped with `HashRouter` and `App.tsx` doesn't include extra Router wrappers
   - **Fix applied**: Project now uses HashRouter in production for GitHub Pages compatibility

2. **Asset Loading Issues**
   - **Error**: 404 errors or missing CSS/assets
   - **Solution**: Check `docs/index.html` asset paths begin with `/newboltailearn/`
   - **Fix applied**: Proper base path configuration in build process

3. **TypeScript Errors**
   - TypeScript strict mode is intentionally disabled in `tsconfig.app.json`
   - This allows faster development while maintaining runtime functionality
   - Build process works correctly despite TypeScript warnings

4. **Environment Variables**
   - Development: Uses `/api` and `/ws` with Vite proxy
   - Production: Update `VITE_API_BASE` and `VITE_WS_URL` in `.env.production` to point to your actual backend

5. **Framer Motion Easing Errors**
   - Use `cubicBezier(0.34, 1.56, 0.64, 1)` instead of `easeOutBack`
   - Import: `import { cubicBezier } from 'framer-motion'`

6. **Persian Font Issues**
   - Fonts are locally hosted in `src/assets/fonts/`
   - No external font imports to avoid PostCSS issues

7. **CORS/Proxy Issues**
   - Ensure backend is running on port 3001
   - Check Vite proxy configuration in `vite.config.ts`
   - Production: CORS allowlist configured for GitHub Pages domain

8. **GitHub Pages Deep Link Issues**
   - Uses HashRouter in production for SPA compatibility
   - 404.html redirects to index for fallback

9. **Static Deployment Notes**
   - GitHub Pages is static hosting - backend APIs won't work
   - Update `.env.production` with your actual backend domain
   - For full functionality, deploy backend separately

### Performance Optimization

- **Code Splitting**: Components are lazy-loaded
- **Tree Shaking**: Unused code automatically removed
- **Asset Optimization**: Images and fonts optimized for web
- **Caching**: Proper cache headers for static assets

## 📊 Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── layout/         # Layout components (Sidebar, Header, etc.)
│   │   └── ui/             # Reusable UI components
│   ├── services/           # API and business logic
│   │   ├── ai/             # AI/ML services
│   │   ├── api.ts          # API client
│   │   └── wsClient.ts     # WebSocket client
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   └── assets/             # Static assets (fonts, images)
├── server/                 # Backend server code
├── public/                 # Public static files
└── archive/                # Archived documentation and backups
```

## 🔐 Security & Routing Fixes

### Security Features
- **Secure cookies**: `sameSite: 'none'`, `secure: true` for cross-origin requests
- **CORS strict allowlist**: Only approved origins allowed
- **CSRF protection**: Cross-site request forgery prevention
- **Rate limiting**: API request throttling
- **Input validation**: Sanitization and validation of all inputs
- **Secure WebSocket connections**: Encrypted real-time communication
- **Environment-based configuration**: Secure credential management

### Routing Fixes
- **HashRouter usage**: Fixes `useRoutes()` context errors on GitHub Pages
- **SPA fallback**: `404.html` redirects and `.nojekyll` configuration
- **Asset path correction**: Proper base path handling for static assets
- **Cross-origin compatibility**: CORS configuration for frontend-backend communication

## 📈 Performance Metrics

- **Bundle Size**: ~400KB (gzipped: ~126KB)
- **First Load**: Optimized with code splitting
- **Runtime Performance**: 60fps animations with Framer Motion
- **Memory Usage**: Efficient WebSocket connection management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 🧪 Testing & Verification Steps

Verify the deployment and functionality with these commands:

```bash
# Build for production
npm run build:gh

# Serve locally to test
npx serve -s docs -l 5174

# Test frontend
# Navigate to: http://localhost:5174/newboltailearn/
# Test routes: #/overview, #/models, #/datasets, etc.
# Verify: No router context errors, all assets load correctly

# Test backend endpoints
curl http://localhost:3001/health
curl http://localhost:3001/ping
curl http://localhost:3001/
```

### Verification Checklist
- ✅ Frontend builds without errors
- ✅ HashRouter prevents routing errors
- ✅ Assets load with correct base path
- ✅ Backend health endpoints respond
- ✅ CORS configuration allows frontend requests
- ✅ WebSocket connections establish properly
- ✅ Persian fonts and RTL layout work correctly

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Persian Legal AI Dashboard** - Empowering legal professionals with advanced AI-powered document analysis and training capabilities.