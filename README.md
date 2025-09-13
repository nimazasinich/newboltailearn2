# Persian Legal AI Training System

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/nimazasinich/newboltailearn)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.9.2-blue.svg)](https://www.typescriptlang.org/)

A comprehensive web application for training and managing AI models specifically designed for Persian legal document analysis. The system provides a complete pipeline from dataset management to model training, monitoring, and analytics.

## 🆕 **Latest Update: Unified Architecture Implementation**

**Status: ✅ COMPLETED** - The project has been successfully migrated to a unified architecture where the backend serves both API endpoints and the frontend build, eliminating the need for proxy configurations in production.

### What Actually Works:
- ✅ **Unified Server**: Express server successfully serves both frontend and API on port 3001
- ✅ **Static File Serving**: Frontend build files are served correctly from `/dist` directory
- ✅ **SPA Routing**: React Router works with Express catch-all fallback
- ✅ **API Endpoints**: All REST API endpoints are functional and tested
- ✅ **Database**: SQLite database with complete schema and default data
- ✅ **WebSocket**: Real-time updates for training progress and system metrics
- ✅ **Development Workflow**: Separate frontend (5173) and backend (3001) servers work correctly
- ✅ **Production Build**: Frontend builds successfully and is served by unified server

### What Doesn't Work (Known Issues):
- ❌ **HuggingFace Integration**: Token configuration is not properly set up (requires valid HF_TOKEN_ENC)
- ❌ **Actual AI Training**: Training engine is simulated, not real TensorFlow.js implementation
- ❌ **Dataset Downloads**: HuggingFace dataset downloads fail due to authentication issues
- ❌ **Model Persistence**: Trained models are not actually saved or loaded
- ❌ **Real-time Training**: Training progress is simulated, not actual model training

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Clone the repository
git clone https://github.com/nimazasinich/newboltailearn.git
cd newboltailearn

# Install dependencies
npm install

# Set up environment (optional - for HuggingFace integration)
echo "HF_TOKEN_ENC=your_base64_encoded_token_here" > .env

# Compile backend (required for server to work)
npm run compile-server

# Development Mode (separate servers)
npm run dev     # Frontend (port 5173)
npm run server  # Backend (port 3001)

# Production Mode (unified server)
npm run build   # Build frontend
npm run server  # Unified server (port 3001) - serves both frontend and API
```

## ✨ What Actually Works

### ✅ **Fully Functional Features**
- 🤖 **Model Management**: Create, update, delete AI model definitions
- 📊 **Dataset Management**: View and manage dataset metadata
- 🔒 **Database Operations**: Complete CRUD operations on all entities
- 📈 **System Monitoring**: Real-time system metrics and performance data
- 🌐 **Persian RTL UI**: Right-to-left interface optimized for Persian language
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🔌 **WebSocket Integration**: Real-time updates for system metrics
- 📊 **Analytics Dashboard**: System statistics and performance visualization
- 🏗️ **Unified Architecture**: Single server deployment serving both frontend and API

### ⚠️ **Partially Functional Features**
- 🤖 **Training Simulation**: Training progress is simulated, not real AI training
- 📊 **Dataset Integration**: HuggingFace datasets are listed but not downloadable
- 🔒 **Token Management**: Base64 encoding works but requires valid HuggingFace token

### ❌ **Non-Functional Features**
- 🤖 **Real AI Training**: No actual TensorFlow.js model training implementation
- 📊 **Dataset Downloads**: HuggingFace API integration fails due to authentication
- 🔒 **Model Persistence**: Trained models are not actually saved or loaded
- 📈 **Real Training Metrics**: All training data is simulated

## 🏗️ Architecture

### Development Mode
```
Frontend (React + TypeScript)  ←→  Backend (Node.js + Express)  ←→  Database (SQLite)
     ↓                                    ↓                              ↓
Dashboard Components              API Routes & WebSocket         Models, Datasets,
Training Management              Simulated Training             Training Sessions,
Monitoring & Analytics          Real-time Updates               System Logs
     ↓                                    ↓
Port 5173 (Vite Dev)            Port 3001 (Express API)
```

### Production Mode (Unified)
```
Unified Server (Node.js + Express)  ←→  Database (SQLite)
     ↓                                        ↓
Frontend (Static Files) + API Routes    Models, Datasets,
SPA Routing + WebSocket                Training Sessions,
Real-time Updates                      System Logs
     ↓
Port 3001 (Everything)
```

## 📁 Project Structure

```
persian-legal-ai/
├── src/                    # Frontend React application
│   ├── components/         # React components (fully functional)
│   ├── hooks/             # Custom React hooks (working)
│   ├── services/          # API and service layers (working)
│   └── types/             # TypeScript definitions (complete)
├── server/                # Backend Node.js application
│   ├── index.ts           # Main server file (working)
│   ├── utils/             # Server utilities (working)
│   └── server/            # Compiled server files (working)
├── public/                # Static assets
├── dist/                  # Built frontend files (generated)
└── persian_legal_ai.db    # SQLite database (working)
```

## 🔧 Available Scripts

| Script | Description | Status |
|--------|-------------|---------|
| `npm run dev` | Start frontend development server | ✅ Working |
| `npm run server` | Start backend server | ✅ Working |
| `npm run build` | Build frontend for production | ✅ Working |
| `npm run compile-server` | Compile backend TypeScript | ✅ Working |
| `npm run lint` | Run ESLint | ✅ Working |
| `npm run type-check` | Run TypeScript type checking | ✅ Working |

## 🌐 API Endpoints (All Tested and Working)

### Models
- `GET /api/models` - Get all models ✅
- `POST /api/models` - Create new model ✅
- `PUT /api/models/:id` - Update model ✅
- `DELETE /api/models/:id` - Delete model ✅
- `POST /api/models/:id/train` - Start training (simulated) ⚠️
- `POST /api/models/:id/pause` - Pause training (simulated) ⚠️
- `POST /api/models/:id/resume` - Resume training (simulated) ⚠️

### Datasets
- `GET /api/datasets` - Get all datasets ✅
- `POST /api/datasets/:id/download` - Download from HuggingFace ❌

### Monitoring & Analytics
- `GET /api/monitoring` - Get system metrics ✅
- `GET /api/analytics` - Get analytics data ✅
- `GET /api/logs` - Get system logs ✅
- `GET /api/settings` - Get system settings ✅
- `PUT /api/settings` - Update system settings ✅

### Team & Export
- `GET /api/team` - Get team data ✅
- `GET /api/analytics/export` - Export analytics ✅
- `GET /api/monitoring/export` - Export monitoring data ✅

## 🤗 HuggingFace Integration (Status: ❌ Not Working)

The system is configured to integrate with Persian legal datasets but **requires proper HuggingFace token setup**:

- **PerSets/iran-legal-persian-qa**: 10,247 Q&A pairs (15.2 MB) - Listed but not downloadable
- **QomSSLab/legal_laws_lite_chunk_v1**: 50,000 legal text chunks (125.8 MB) - Listed but not downloadable  
- **mansoorhamidzadeh/Persian-NER-Dataset-500k**: 500,000 NER samples (890.5 MB) - Listed but not downloadable

**To fix HuggingFace integration:**
1. Get a valid HuggingFace API token
2. Base64 encode it: `echo -n "your_token" | base64`
3. Set `HF_TOKEN_ENC=your_base64_encoded_token` in `.env`

## 🔒 Security

- **Token Security**: HuggingFace tokens are Base64 encoded ✅
- **Environment Variables**: Sensitive data stored in `.env` ✅
- **Input Validation**: All inputs validated and sanitized ✅
- **CORS**: Properly configured for development and production ✅

## 📊 Database Schema (Fully Implemented)

The system uses SQLite with the following tables (all working):
- `models` - AI model definitions and status ✅
- `datasets` - Dataset metadata and status ✅
- `training_sessions` - Training session history ✅
- `training_logs` - Training progress logs ✅
- `system_logs` - System event logging ✅
- `users` - User management ✅
- `system_settings` - System configuration ✅
- `checkpoints` - Model checkpoints ✅
- `rankings` - Model performance rankings ✅
- `model_categories` - Model categorization ✅
- `model_exports` - Model export records ✅

## 🎨 UI/UX Features (All Working)

- **Persian RTL Layout**: Right-to-left interface design ✅
- **Responsive Design**: Mobile-first approach ✅
- **Dark/Light Theme**: Theme switching support ✅
- **Real-time Updates**: WebSocket-powered live updates ✅
- **Interactive Charts**: Performance visualization ✅
- **Accessibility**: WCAG compliant components ✅

## 🚀 Deployment

### Production Build (Unified Server) - ✅ Working
```bash
# Build frontend
npm run build

# Start unified server (serves both frontend and API)
npm run server
```

### Development Build - ✅ Working
```bash
# Start frontend dev server
npm run dev

# Start backend server
npm run server
```

### Environment Variables
```bash
HF_TOKEN_ENC=your_base64_encoded_token  # Optional - for HuggingFace integration
NODE_ENV=production                      # Optional
PORT=3001                               # Optional - defaults to 3001
```

## 🔧 Troubleshooting

### Common Issues

1. **Backend won't start**: 
   - Run `npm run compile-server` first ✅
   - Check if port 3001 is available

2. **Token errors**: 
   - HuggingFace integration requires valid `HF_TOKEN_ENC` in `.env`
   - System works without it, but dataset downloads will fail

3. **Build errors**: 
   - Check TypeScript compilation: `npm run type-check`
   - Ensure all dependencies are installed: `npm install`

4. **WebSocket issues**: 
   - Verify both frontend and backend are running
   - Check browser console for connection errors

### Debug Mode
```bash
export DEBUG=persian-legal-ai:*
npm run server
```

## 🎯 Implementation Status

### ✅ **Completed Features**
- [x] Unified architecture implementation
- [x] Frontend React application with Persian RTL support
- [x] Backend Express server with complete API
- [x] SQLite database with full schema
- [x] WebSocket real-time updates
- [x] System monitoring and analytics
- [x] Responsive UI with dark/light themes
- [x] Model and dataset management UI
- [x] Training simulation system
- [x] Export functionality (CSV/JSON)
- [x] Team management interface
- [x] Complete documentation

### ⚠️ **Partially Implemented**
- [ ] HuggingFace dataset integration (UI ready, needs token setup)
- [ ] Training progress simulation (works but not real training)
- [ ] Model export/import (structure ready, needs implementation)

### ❌ **Not Implemented**
- [ ] Real AI model training with TensorFlow.js
- [ ] Actual model persistence and loading
- [ ] HuggingFace dataset downloads (authentication issues)
- [ ] User authentication system
- [ ] Docker deployment
- [ ] CI/CD pipeline

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (especially the unified architecture)
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- 📖 **Documentation**: This README and [DOCUMENTATION.md](./DOCUMENTATION.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/nimazasinich/newboltailearn/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/nimazasinich/newboltailearn/discussions)

## 🎯 Roadmap

### Short Term (Next Release)
- [ ] Fix HuggingFace token configuration
- [ ] Implement real TensorFlow.js training
- [ ] Add model persistence
- [ ] Improve error handling

### Long Term
- [ ] Advanced model architectures
- [ ] Distributed training support
- [ ] Model versioning
- [ ] User authentication
- [ ] Docker deployment
- [ ] CI/CD pipeline

---

**Built with ❤️ for the Persian legal AI community**

**Note**: This is a working prototype with simulated AI training. For production use, implement real TensorFlow.js training and fix HuggingFace integration.