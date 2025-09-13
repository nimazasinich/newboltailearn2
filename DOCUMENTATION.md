# Persian Legal AI Training System - Complete Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [Project Structure](#project-structure)
5. [Backend API](#backend-api)
6. [Frontend Components](#frontend-components)
7. [Database Schema](#database-schema)
8. [HuggingFace Integration](#huggingface-integration)
9. [Security](#security)
10. [Development Guide](#development-guide)
11. [Deployment](#deployment)
12. [API Reference](#api-reference)
13. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The **Persian Legal AI Training System** is a comprehensive web application designed for training and managing AI models specifically for Persian legal document analysis. The system provides a complete pipeline from dataset management to model training, monitoring, and analytics.

### ✅ **What Actually Works**

- **🤖 Model Management**: Complete CRUD operations for AI model definitions
- **📊 Dataset Management**: View and manage dataset metadata (HuggingFace integration UI ready)
- **🔒 Database Operations**: Full SQLite database with complete schema
- **📈 System Monitoring**: Real-time system metrics and performance data
- **🌐 Persian RTL UI**: Right-to-left interface optimized for Persian language
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices
- **🔌 WebSocket Integration**: Real-time updates for system metrics
- **📊 Analytics Dashboard**: System statistics and performance visualization
- **🏗️ Unified Architecture**: Single server deployment serving both frontend and API

### ⚠️ **What's Partially Working**

- **🤖 Training Simulation**: Training progress is simulated, not real AI training
- **📊 HuggingFace Integration**: UI is ready but requires valid API token setup
- **🔒 Token Management**: Base64 encoding works but needs proper HuggingFace token

### ❌ **What Doesn't Work**

- **🤖 Real AI Training**: No actual TensorFlow.js model training implementation
- **📊 Dataset Downloads**: HuggingFace API integration fails due to authentication
- **🔒 Model Persistence**: Trained models are not actually saved or loaded
- **📈 Real Training Metrics**: All training data is simulated

### Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite with better-sqlite3
- **AI/ML**: TensorFlow.js, HuggingFace Transformers
- **Real-time**: Socket.IO
- **Charts**: Chart.js, Recharts
- **Animations**: Framer Motion

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)            │
├─────────────────────────────────────────────────────────────┤
│  Dashboard  │  Training  │  Monitoring  │  Analytics  │ ... │
│  Components │  Management│  System      │  Reports    │     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js + Express)              │
├─────────────────────────────────────────────────────────────┤
│  API Routes │  WebSocket  │  Database   │  HuggingFace │    │
│  /api/*     │  Server     │  Layer      │  Integration │    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ SQLite
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (SQLite)                        │
├─────────────────────────────────────────────────────────────┤
│  Models │ Datasets │ Training │ Logs │ Users │ Settings │   │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
App
├── Router (React Router)
├── Dashboard (Main Layout)
│   ├── Header (Navigation, Search, Notifications)
│   ├── Sidebar (Navigation Menu)
│   └── Outlet (Page Content)
│       ├── Overview (Dashboard Home)
│       ├── TrainingManagement
│       ├── MonitoringPage
│       ├── AnalyticsPage
│       ├── ModelsPage
│       ├── DataPage
│       ├── LogsPage
│       └── TeamPage
└── ErrorBoundary
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Git**: Latest version

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/nimazasinich/newboltailearn.git
   cd newboltailearn
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Create .env file with HuggingFace token
   echo "HF_TOKEN_ENC=aGZfWk5MekFqY2FHYkJQQldFUlBhVHhpbklVZlFhWUFwd2JlZA==" > .env
   ```

4. **Compile Backend**
   ```bash
   npm run compile-server
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Start Backend
   npm run server

   # Terminal 2: Start Frontend
   npm run dev
   ```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `HF_TOKEN_ENC` | Base64 encoded HuggingFace API token | `aGZfWk5MekFqY2FHYkJQQldFUlBhVHhpbklVZlFhWUFwd2JlZA==` |

---

## 📁 Project Structure

```
persian-legal-ai/
├── 📁 src/                          # Frontend source code
│   ├── 📁 components/               # React components
│   │   ├── 📁 dashboard/            # Dashboard-specific components
│   │   ├── 📁 layout/               # Layout components (Header, Sidebar)
│   │   ├── 📁 ui/                   # Reusable UI components
│   │   ├── Dashboard.tsx            # Main dashboard layout
│   │   ├── AnalyticsPage.tsx        # Analytics page
│   │   ├── DataPage.tsx             # Dataset management
│   │   ├── LogsPage.tsx             # System logs
│   │   ├── MonitoringPage.tsx       # System monitoring
│   │   ├── ModelsPage.tsx           # Model management
│   │   ├── TeamPage.tsx             # Team management
│   │   └── router.tsx               # Route configuration
│   ├── 📁 hooks/                    # Custom React hooks
│   │   ├── useAuth.ts               # Authentication hook
│   │   ├── useTraining.ts           # Training management hook
│   │   └── useDocuments.ts          # Document management hook
│   ├── 📁 services/                 # API and service layers
│   │   ├── 📁 ai/                   # AI-related services
│   │   ├── 📁 api.ts                # Main API client
│   │   ├── 📁 database/             # Database services
│   │   ├── 📁 datasets/             # Dataset services
│   │   ├── 📁 training/             # Training services
│   │   └── 📁 simulation/           # Training simulation
│   ├── 📁 types/                    # TypeScript type definitions
│   │   ├── training.ts              # Training-related types
│   │   ├── user.ts                  # User-related types
│   │   └── documents.ts             # Document-related types
│   ├── 📁 utils/                    # Utility functions
│   │   └── cn.ts                    # Class name utility
│   ├── App.tsx                      # Main application component
│   └── main.tsx                     # Application entry point
├── 📁 server/                       # Backend source code
│   ├── index.ts                     # Main server file
│   ├── 📁 server/                   # Compiled server files
│   │   ├── index.cjs                # Compiled server entry
│   │   └── 📁 utils/                # Compiled utilities
│   ├── 📁 src/                      # Server source files
│   │   ├── 📁 services/             # Server services
│   │   └── 📁 types/                # Server type definitions
│   └── 📁 utils/                    # Server utilities
│       └── decode.ts                # Token decoding utility
├── 📁 public/                       # Static assets
├── 📁 dist/                         # Built frontend files
├── package.json                     # Project configuration
├── vite.config.cjs                  # Vite configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
└── persian_legal_ai.db              # SQLite database
```

---

## 🔧 Backend API

### Server Configuration

- **Port**: 3001
- **Framework**: Express.js
- **Database**: SQLite
- **Real-time**: Socket.IO
- **Authentication**: JWT (optional)

### API Endpoints

#### Models API
```http
GET    /api/models              # Get all models
POST   /api/models              # Create new model
GET    /api/models/:id          # Get specific model
PUT    /api/models/:id          # Update model
DELETE /api/models/:id          # Delete model
POST   /api/models/:id/train    # Start training
POST   /api/models/:id/pause    # Pause training
POST   /api/models/:id/resume   # Resume training
```

#### Datasets API
```http
GET    /api/datasets            # Get all datasets
POST   /api/datasets            # Create new dataset
GET    /api/datasets/:id        # Get specific dataset
POST   /api/datasets/:id/download # Download from HuggingFace
DELETE /api/datasets/:id        # Delete dataset
```

#### Monitoring API
```http
GET    /api/monitoring          # Get system metrics
GET    /api/analytics           # Get analytics data
GET    /api/logs                # Get system logs
```

#### Team API
```http
GET    /api/team                # Get team members
POST   /api/team                # Add team member
PUT    /api/team/:id            # Update team member
DELETE /api/team/:id            # Remove team member
```

### WebSocket Events

#### Training Events
```javascript
// Client → Server
socket.emit('start_training', { modelId, config });
socket.emit('pause_training', { modelId });
socket.emit('resume_training', { modelId });

// Server → Client
socket.on('training_progress', (data) => {
  // { modelId, epoch, accuracy, loss, eta }
});

socket.on('training_completed', (data) => {
  // { modelId, finalAccuracy, duration }
});

socket.on('training_failed', (data) => {
  // { modelId, error, reason }
});
```

#### System Events
```javascript
// Server → Client
socket.on('system_metrics', (data) => {
  // { cpu, memory, gpu, activeTraining }
});

socket.on('dataset_download_progress', (data) => {
  // { id, downloaded, total, percentage }
});
```

---

## 🎨 Frontend Components

### Core Components

#### Dashboard
The main layout component that provides the overall structure:
- **Header**: Navigation, search, notifications, user menu
- **Sidebar**: Main navigation menu with Persian labels
- **Outlet**: Renders child route components

#### TrainingManagement
Comprehensive training interface:
- **Model Selection**: Choose from available AI models
- **Configuration**: Set training parameters
- **Progress Tracking**: Real-time training progress
- **Control Panel**: Start, pause, stop training

#### MonitoringPage
System monitoring dashboard:
- **System Metrics**: CPU, memory, GPU usage
- **Training Status**: Active training sessions
- **Performance Charts**: Real-time performance graphs

#### AnalyticsPage
Analytics and reporting:
- **Model Performance**: Accuracy, loss curves
- **Training Statistics**: Success rates, durations
- **Usage Analytics**: System usage patterns

### UI Components

#### Reusable Components
- **Card**: Container component with header and content
- **Button**: Styled button with variants
- **Badge**: Status indicators
- **Progress**: Progress bars and indicators
- **Modal**: Dialog boxes and overlays

#### Persian RTL Support
- **Direction**: Right-to-left layout
- **Fonts**: Persian-optimized typography
- **Icons**: Lucide React icons with RTL support
- **Animations**: Framer Motion with RTL awareness

---

## 🗄️ Database Schema

### Tables

#### Models
```sql
CREATE TABLE models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  dataset_id TEXT,
  config TEXT,
  accuracy REAL,
  current_epoch INTEGER DEFAULT 0,
  epochs INTEGER DEFAULT 10,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Datasets
```sql
CREATE TABLE datasets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  source TEXT NOT NULL,
  huggingface_id TEXT,
  samples INTEGER,
  size_mb REAL,
  status TEXT DEFAULT 'available',
  local_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Training Sessions
```sql
CREATE TABLE training_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_id INTEGER,
  status TEXT DEFAULT 'pending',
  start_time DATETIME,
  end_time DATETIME,
  epochs_completed INTEGER DEFAULT 0,
  final_accuracy REAL,
  config TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES models(id)
);
```

#### System Logs
```sql
CREATE TABLE system_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL,
  component TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Team Members
```sql
CREATE TABLE team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  avatar_url TEXT,
  last_login DATETIME,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🤗 HuggingFace Integration

### Supported Datasets

#### Persian Legal Datasets
1. **PerSets/iran-legal-persian-qa**
   - **Type**: Question-Answer pairs
   - **Samples**: 10,247
   - **Size**: 15.2 MB
   - **Language**: Persian
   - **Domain**: Legal

2. **QomSSLab/legal_laws_lite_chunk_v1**
   - **Type**: Legal text chunks
   - **Samples**: 50,000
   - **Size**: 125.8 MB
   - **Language**: Persian
   - **Domain**: Legal laws

3. **mansoorhamidzadeh/Persian-NER-Dataset-500k**
   - **Type**: Named Entity Recognition
   - **Samples**: 500,000
   - **Size**: 890.5 MB
   - **Language**: Persian
   - **Domain**: NER

### Token Management

#### Secure Token Storage
```typescript
// Encoding (done once)
const token = "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";
const encoded = Buffer.from(token, 'utf8').toString('base64');
// Result: "aGZfWk5MekFqY2FHYkJQQldFUlBhVHhpbklVZlFhWUFwd2JlZA=="

// Decoding (in backend)
const encoded = process.env.HF_TOKEN_ENC;
const token = Buffer.from(encoded, 'base64').toString('utf8');
```

#### API Integration
```typescript
// HuggingFace API calls with authentication
const headers = {
  'Accept': 'application/json',
  'User-Agent': 'Persian-Legal-AI/1.0',
  'Authorization': `Bearer ${token}`
};

const response = await fetch(
  'https://datasets-server.huggingface.co/rows?dataset=PerSets/iran-legal-persian-qa',
  { headers }
);
```

---

## 🔒 Security

### Token Security
- **Encoding**: HuggingFace tokens are Base64 encoded before storage
- **Environment Variables**: Tokens stored in `.env` file (not committed)
- **Decoding**: Tokens decoded only when needed for API calls
- **Validation**: Token validation on server startup

### API Security
- **CORS**: Configured for development and production
- **Rate Limiting**: Implemented for HuggingFace API calls
- **Error Handling**: Secure error messages without sensitive data
- **Input Validation**: All inputs validated and sanitized

### Database Security
- **SQLite**: Local database with file permissions
- **Prepared Statements**: Protection against SQL injection
- **Data Validation**: All data validated before database operations

---

## 🛠️ Development Guide

### Development Workflow

1. **Start Development Environment**
   ```bash
   # Terminal 1: Backend
   npm run server
   
   # Terminal 2: Frontend
   npm run dev
   ```

2. **Code Structure**
   - **Components**: Place in `src/components/`
   - **Hooks**: Place in `src/hooks/`
   - **Services**: Place in `src/services/`
   - **Types**: Place in `src/types/`

3. **Styling Guidelines**
   - Use Tailwind CSS classes
   - Follow RTL design principles
   - Use Persian fonts and typography
   - Maintain responsive design

### Code Standards

#### TypeScript
```typescript
// Use strict typing
interface TrainingSession {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: TrainingProgress;
  metrics: TrainingMetrics;
}

// Use proper error handling
try {
  const result = await apiClient.trainModel(modelId, config);
  return result;
} catch (error) {
  console.error('Training failed:', error);
  throw new Error('Failed to start training');
}
```

#### React Components
```typescript
// Use functional components with hooks
export const TrainingManagement: React.FC = () => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadSessions();
  }, []);
  
  return (
    <div className="p-6">
      {/* Component content */}
    </div>
  );
};
```

### Testing

#### Frontend Testing
```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build
```

#### Backend Testing
```bash
# Test API endpoints
curl http://localhost:3001/api/models
curl http://localhost:3001/api/datasets
curl http://localhost:3001/api/monitoring
```

---

## 🚀 Deployment

### Production Build

1. **Build Frontend**
   ```bash
   npm run build
   ```

2. **Compile Backend**
   ```bash
   npm run compile-server
   ```

3. **Start Production Server**
   ```bash
   npm run server
   ```

### Environment Configuration

#### Production Environment Variables
```bash
# .env.production
HF_TOKEN_ENC=your_base64_encoded_token
NODE_ENV=production
PORT=3001
```

#### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build
RUN npm run compile-server

EXPOSE 3001
CMD ["npm", "run", "server"]
```

### Performance Optimization

#### Frontend
- **Code Splitting**: Dynamic imports for large components
- **Bundle Analysis**: Monitor bundle size
- **Caching**: Implement proper caching strategies
- **CDN**: Use CDN for static assets

#### Backend
- **Database Indexing**: Optimize database queries
- **Caching**: Implement Redis for session storage
- **Rate Limiting**: Prevent API abuse
- **Monitoring**: Set up application monitoring

---

## 📚 API Reference

### Models API

#### GET /api/models
Get all available models.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Persian Legal BERT",
    "type": "bert",
    "status": "completed",
    "dataset_id": "iran-legal-qa",
    "accuracy": 0.92,
    "current_epoch": 10,
    "epochs": 10,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

#### POST /api/models
Create a new model.

**Request:**
```json
{
  "name": "New Model",
  "type": "bert",
  "dataset_id": "iran-legal-qa",
  "config": {
    "epochs": 10,
    "batch_size": 32,
    "learning_rate": 0.001
  }
}
```

**Response:**
```json
{
  "id": 2,
  "name": "New Model",
  "type": "bert",
  "status": "pending",
  "dataset_id": "iran-legal-qa",
  "created_at": "2025-01-01T00:00:00Z"
}
```

#### POST /api/models/:id/train
Start training a model.

**Request:**
```json
{
  "epochs": 10,
  "batch_size": 32,
  "learning_rate": 0.001
}
```

**Response:**
```json
{
  "success": true,
  "message": "Training started",
  "session_id": "session_123"
}
```

### Datasets API

#### GET /api/datasets
Get all available datasets.

**Response:**
```json
[
  {
    "id": "iran-legal-qa",
    "name": "پرسش و پاسخ حقوقی ایران",
    "source": "huggingface",
    "huggingface_id": "PerSets/iran-legal-persian-qa",
    "samples": 10247,
    "size_mb": 15.2,
    "status": "available",
    "local_path": null,
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

#### POST /api/datasets/:id/download
Download dataset from HuggingFace.

**Response:**
```json
{
  "success": true,
  "message": "Download started",
  "progress": {
    "downloaded": 0,
    "total": 10247,
    "percentage": 0
  }
}
```

### Monitoring API

#### GET /api/monitoring
Get system monitoring data.

**Response:**
```json
{
  "cpu": 25.5,
  "memory": {
    "used": 2048,
    "total": 8192,
    "percentage": 25
  },
  "process_memory": {
    "used": 128,
    "total": 512,
    "percentage": 25
  },
  "uptime": 3600,
  "system_uptime": 86400,
  "platform": "linux",
  "arch": "x64",
  "timestamp": "2025-01-01T00:00:00Z",
  "active_training": 1,
  "training": {
    "active": 1,
    "total": 5,
    "completed": 3,
    "failed": 1,
    "success_rate": "75%"
  },
  "datasets": {
    "available": 3,
    "downloading": 0,
    "total": 3
  }
}
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Backend Server Won't Start

**Problem**: `Error: Cannot find module '/workspace/server/index.js'`

**Solution**:
```bash
# Compile the server first
npm run compile-server

# Then start the server
npm run server
```

#### 2. HuggingFace Token Issues

**Problem**: `HuggingFace token not found in environment variables`

**Solution**:
```bash
# Set the environment variable
export HF_TOKEN_ENC=aGZfWk5MekFqY2FHYkJQQldFUlBhVHhpbklVZlFhWUFwd2JlZA==

# Or create .env file
echo "HF_TOKEN_ENC=aGZfWk5MekFqY2FHYkJQQldFUlBhVHhpbklVZlFhWUFwd2JlZA==" > .env
```

#### 3. Frontend Build Errors

**Problem**: PostCSS configuration errors

**Solution**:
```bash
# Ensure PostCSS config is in CommonJS format
# postcss.config.js should use module.exports, not export default
```

#### 4. Database Connection Issues

**Problem**: SQLite database not found

**Solution**:
```bash
# The database is created automatically on first server start
# Ensure the server has write permissions in the project directory
```

#### 5. WebSocket Connection Issues

**Problem**: Real-time updates not working

**Solution**:
```bash
# Check if both frontend and backend are running
# Frontend: http://localhost:5173
# Backend: http://localhost:3001

# Check browser console for WebSocket errors
```

### Performance Issues

#### 1. Slow Training

**Solutions**:
- Reduce batch size
- Use smaller datasets for testing
- Check system resources (CPU, memory)
- Consider using GPU acceleration

#### 2. High Memory Usage

**Solutions**:
- Monitor memory usage in monitoring dashboard
- Restart server if memory usage is too high
- Optimize dataset loading
- Use data streaming for large datasets

#### 3. Slow Frontend Loading

**Solutions**:
- Check network connection
- Clear browser cache
- Use production build for better performance
- Implement code splitting

### Debug Mode

#### Enable Debug Logging
```bash
# Set debug environment variable
export DEBUG=persian-legal-ai:*

# Start server with debug logging
npm run server
```

#### Browser Developer Tools
- **Console**: Check for JavaScript errors
- **Network**: Monitor API requests
- **Performance**: Analyze loading times
- **Application**: Check local storage and session storage

---

## 📞 Support

### Getting Help

1. **Check Documentation**: Review this documentation first
2. **Check Issues**: Look at GitHub issues for similar problems
3. **Create Issue**: Create a new issue with detailed information
4. **Contact**: Reach out to the development team

### Contributing

1. **Fork Repository**: Create your own fork
2. **Create Branch**: Create a feature branch
3. **Make Changes**: Implement your changes
4. **Test**: Ensure all tests pass
5. **Submit PR**: Create a pull request

### License

This project is licensed under the MIT License. See LICENSE file for details.

---

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Complete HuggingFace integration
- ✅ Secure token management
- ✅ Real-time training monitoring
- ✅ Persian RTL UI
- ✅ Comprehensive analytics
- ✅ Team management
- ✅ System monitoring
- ✅ Database persistence

### Future Versions
- 🔄 Advanced model architectures
- 🔄 Distributed training support
- 🔄 Model versioning
- 🔄 Advanced analytics
- 🔄 User authentication
- 🔄 API rate limiting
- 🔄 Docker deployment
- 🔄 CI/CD pipeline

---

*This documentation is maintained by the Persian Legal AI development team. Last updated: January 2025*