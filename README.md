# Persian Legal AI Training System

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/nimazasinich/newboltailearn)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.9.2-blue.svg)](https://www.typescriptlang.org/)

A comprehensive web application for training and managing AI models specifically designed for Persian legal document analysis. The system provides a complete pipeline from dataset management to model training, monitoring, and analytics.

## 🆕 **Latest Update: Unified Architecture Migration**

**Status: ✅ COMPLETED** - The project has been successfully migrated to a unified architecture where the backend serves both API endpoints and the frontend build, eliminating the need for proxy configurations in production.

### What Changed:
- **Backend Enhancement**: Express server now serves static frontend files from `/dist` directory
- **SPA Routing**: Implemented catch-all routing for React Router compatibility
- **Proxy Removal**: Eliminated Vite proxy configuration for cleaner development setup
- **Production Ready**: Single server deployment on port 3001
- **Development Preserved**: Development workflow remains unchanged with separate servers

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

# Set up environment
echo "HF_TOKEN_ENC=aGZfWk5MekFqY2FHYkJQQldFUlBhVHhpbklVZlFhWUFwd2JlZA==" > .env

# Compile backend (optional - server/index.js is already compiled)
npm run compile-server

# Development Mode (separate servers)
npm run dev     # Frontend (port 5173)
npm run server  # Backend (port 3001) - optional for dev

# Production Mode (unified server)
npm run build   # Build frontend
npm run server  # Unified server (port 3001) - serves both frontend and API
```

## ✨ Key Features

- 🤖 **AI Model Training**: Support for DoRA, QR-Adaptor, Persian BERT models
- 📊 **Dataset Management**: Integration with HuggingFace Persian legal datasets
- 🔒 **Secure Token Management**: Base64 encoded HuggingFace API tokens
- 📈 **Real-time Monitoring**: Live training progress and system metrics
- 🌐 **Persian RTL UI**: Right-to-left interface optimized for Persian language
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🔌 **WebSocket Integration**: Real-time updates for training progress
- 📊 **Analytics Dashboard**: Comprehensive reporting and visualization

## 🏗️ Architecture

### Development Mode
```
Frontend (React + TypeScript)  ←→  Backend (Node.js + Express)  ←→  Database (SQLite)
     ↓                                    ↓                              ↓
Dashboard Components              API Routes & WebSocket         Models, Datasets,
Training Management              HuggingFace Integration         Training Sessions,
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
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API and service layers
│   └── types/             # TypeScript definitions
├── server/                # Backend Node.js application
│   ├── index.ts           # Main server file
│   ├── utils/             # Server utilities
│   └── server/            # Compiled server files
├── public/                # Static assets
└── dist/                  # Built frontend files
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start frontend development server |
| `npm run server` | Start backend server |
| `npm run build` | Build frontend for production |
| `npm run compile-server` | Compile backend TypeScript |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |

## 🌐 API Endpoints

### Models
- `GET /api/models` - Get all models
- `POST /api/models` - Create new model
- `POST /api/models/:id/train` - Start training

### Datasets
- `GET /api/datasets` - Get all datasets
- `POST /api/datasets/:id/download` - Download from HuggingFace

### Monitoring
- `GET /api/monitoring` - Get system metrics
- `GET /api/analytics` - Get analytics data

## 🤗 HuggingFace Integration

The system integrates with several Persian legal datasets:

- **PerSets/iran-legal-persian-qa**: 10,247 Q&A pairs (15.2 MB)
- **QomSSLab/legal_laws_lite_chunk_v1**: 50,000 legal text chunks (125.8 MB)
- **mansoorhamidzadeh/Persian-NER-Dataset-500k**: 500,000 NER samples (890.5 MB)

## 🔒 Security

- **Token Security**: HuggingFace tokens are Base64 encoded
- **Environment Variables**: Sensitive data stored in `.env`
- **Input Validation**: All inputs validated and sanitized
- **CORS**: Properly configured for development and production

## 📊 Database Schema

The system uses SQLite with the following main tables:
- `models` - AI model definitions and status
- `datasets` - Dataset metadata and status
- `training_sessions` - Training session history
- `system_logs` - System event logging
- `team_members` - Team member management

## 🎨 UI/UX Features

- **Persian RTL Layout**: Right-to-left interface design
- **Responsive Design**: Mobile-first approach
- **Dark/Light Theme**: Theme switching support
- **Real-time Updates**: WebSocket-powered live updates
- **Interactive Charts**: Performance visualization
- **Accessibility**: WCAG compliant components

## 🚀 Deployment

### Production Build (Unified Server)
```bash
# Build frontend
npm run build

# Start unified server (serves both frontend and API)
npm run server
```

### Development Build
```bash
# Start frontend dev server
npm run dev

# Start backend server (optional for dev)
npm run server
```

### Environment Variables
```bash
HF_TOKEN_ENC=your_base64_encoded_token
NODE_ENV=production
PORT=3001
```

### Migration Notes
- **PostCSS Config**: Updated to ES module syntax for compatibility
- **Proxy Removed**: Vite proxy configuration eliminated for cleaner setup
- **SPA Routing**: Backend now handles React Router routes with catch-all handler
- **Static Assets**: Frontend build served from `/dist` directory
- **CORS Updated**: Supports both development and production origins

## 📚 Documentation

For complete documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md) which includes:

- Detailed installation instructions
- Complete API reference
- Database schema documentation
- Security guidelines
- Development workflow
- Troubleshooting guide
- Deployment instructions

## 🔧 Troubleshooting

### Common Issues

1. **Backend won't start**: Run `npm run compile-server` first
2. **Token errors**: Ensure `HF_TOKEN_ENC` is set in `.env`
3. **Build errors**: Check PostCSS configuration
4. **WebSocket issues**: Verify both frontend and backend are running

### Debug Mode
```bash
export DEBUG=persian-legal-ai:*
npm run server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- 📖 **Documentation**: [DOCUMENTATION.md](./DOCUMENTATION.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/nimazasinich/newboltailearn/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/nimazasinich/newboltailearn/discussions)

## 🎯 Roadmap

- [ ] Advanced model architectures
- [ ] Distributed training support
- [ ] Model versioning
- [ ] User authentication
- [ ] Docker deployment
- [ ] CI/CD pipeline

---

**Built with ❤️ for the Persian legal AI community**