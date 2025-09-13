# Persian Legal AI Training System - Technical Architecture

## 🏗️ System Overview

The Persian Legal AI Training System is a full-stack web application designed for training and managing AI models for Persian legal document analysis. The system follows a modern microservices-inspired architecture with clear separation of concerns.

## 🎯 Architecture Principles

- **Separation of Concerns**: Clear boundaries between frontend, backend, and data layers
- **Real-time Communication**: WebSocket-based real-time updates
- **Security First**: Secure token management and input validation
- **Scalability**: Modular design for future scaling
- **Maintainability**: Clean code structure and comprehensive documentation
- **Performance**: Optimized for both development and production environments

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Browser (React SPA)                                           │
│  ├── Dashboard UI                                              │
│  ├── Training Management                                       │
│  ├── Monitoring & Analytics                                    │
│  └── Real-time Updates (WebSocket)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Express.js Server (Node.js)                                   │
│  ├── REST API Endpoints                                        │
│  ├── WebSocket Server                                          │
│  ├── Middleware (CORS, Auth, Validation)                      │
│  └── Business Logic                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ SQLite
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  SQLite Database                                               │
│  ├── Models & Training Sessions                                │
│  ├── Datasets & Metadata                                       │
│  ├── System Logs & Monitoring                                  │
│  └── User & Team Management                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                            │
├─────────────────────────────────────────────────────────────────┤
│  HuggingFace Hub                                               │
│  ├── Dataset Downloads                                         │
│  ├── Model Repository                                          │
│  └── API Authentication                                        │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Frontend Architecture

### Component Hierarchy

```
App
├── Router (React Router DOM)
├── ErrorBoundary
└── MainApp
    ├── Loading (Initial Load)
    └── AppRoutes
        └── Dashboard (Main Layout)
            ├── Header
            │   ├── Navigation
            │   ├── Search
            │   ├── Notifications
            │   └── User Menu
            ├── Sidebar
            │   └── Navigation Items
            └── Outlet (Page Content)
                ├── Overview
                ├── TrainingManagement
                ├── MonitoringPage
                ├── AnalyticsPage
                ├── ModelsPage
                ├── DataPage
                ├── LogsPage
                └── TeamPage
```

### State Management

The application uses React's built-in state management with custom hooks:

- **useAuth**: Authentication and user state
- **useTraining**: Training sessions and progress
- **useDocuments**: Document management
- **React Query**: Server state management and caching

### Routing Strategy

```typescript
// Nested routing under /app/*
/app
├── /dashboard (Overview)
├── /training (TrainingManagement)
├── /monitoring (MonitoringPage)
├── /analytics (AnalyticsPage)
├── /models (ModelsPage)
├── /data (DataPage)
├── /logs (LogsPage)
└── /team (TeamPage)
```

### UI/UX Design System

- **Design Language**: Persian RTL-first design
- **Component Library**: Custom components with Tailwind CSS
- **Theme System**: Dark/Light mode support
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance

## ⚙️ Backend Architecture

### Server Structure

```
server/
├── index.ts                 # Main server entry point
├── utils/
│   └── decode.ts           # Token management utilities
├── server/                 # Compiled JavaScript
│   ├── index.cjs          # Compiled server
│   └── utils/
│       └── decode.cjs     # Compiled utilities
└── src/                   # Source files
    ├── services/          # Business logic services
    └── types/            # TypeScript definitions
```

### API Design

#### RESTful Endpoints

```typescript
// Models API
GET    /api/models              // List all models
POST   /api/models              // Create new model
GET    /api/models/:id          // Get specific model
PUT    /api/models/:id          // Update model
DELETE /api/models/:id          // Delete model
POST   /api/models/:id/train    // Start training
POST   /api/models/:id/pause    // Pause training
POST   /api/models/:id/resume   // Resume training

// Datasets API
GET    /api/datasets            // List all datasets
POST   /api/datasets            // Create new dataset
GET    /api/datasets/:id        // Get specific dataset
POST   /api/datasets/:id/download // Download from HuggingFace
DELETE /api/datasets/:id        // Delete dataset

// Monitoring API
GET    /api/monitoring          // System metrics
GET    /api/analytics           // Analytics data
GET    /api/logs                // System logs

// Team API
GET    /api/team                // List team members
POST   /api/team                // Add team member
PUT    /api/team/:id            // Update team member
DELETE /api/team/:id            // Remove team member
```

#### WebSocket Events

```typescript
// Training Events
'training_progress'     // Real-time training progress
'training_completed'    // Training completion
'training_failed'       // Training failure
'training_paused'       // Training paused
'training_resumed'      // Training resumed

// System Events
'system_metrics'        // System performance metrics
'dataset_download_progress' // Dataset download progress
'log_update'            // New log entries
```

### Middleware Stack

```typescript
app.use(cors());                    // Cross-origin requests
app.use(bodyParser.json());         // JSON parsing
app.use(express.static('dist'));    // Static file serving
app.use('/api', apiRoutes);         // API routes
app.use(errorHandler);              // Error handling
```

## 🗄️ Database Architecture

### SQLite Schema Design

```sql
-- Models table
CREATE TABLE models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  dataset_id TEXT,
  config TEXT,                    -- JSON configuration
  accuracy REAL,
  current_epoch INTEGER DEFAULT 0,
  epochs INTEGER DEFAULT 10,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Datasets table
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

-- Training sessions table
CREATE TABLE training_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_id INTEGER,
  status TEXT DEFAULT 'pending',
  start_time DATETIME,
  end_time DATETIME,
  epochs_completed INTEGER DEFAULT 0,
  final_accuracy REAL,
  config TEXT,                    -- JSON configuration
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES models(id)
);

-- System logs table
CREATE TABLE system_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL,            -- info, warning, error
  component TEXT NOT NULL,        -- server, training, dataset
  message TEXT NOT NULL,
  metadata TEXT,                  -- JSON metadata
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Team members table
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

### Data Relationships

```
Models (1) ←→ (N) Training Sessions
Models (N) ←→ (1) Datasets
System Logs (standalone)
Team Members (standalone)
```

## 🔌 Integration Architecture

### HuggingFace Integration

```typescript
// Token Management Flow
1. Encode token: Buffer.from(token, 'utf8').toString('base64')
2. Store in .env: HF_TOKEN_ENC=encoded_token
3. Decode on use: Buffer.from(encoded, 'base64').toString('utf8')
4. Use in API calls: Authorization: Bearer ${token}

// Dataset Download Flow
1. Client requests download: POST /api/datasets/:id/download
2. Server validates token and dataset
3. Server starts download from HuggingFace API
4. Server streams progress via WebSocket
5. Server stores dataset locally
6. Server updates database status
```

### Real-time Communication

```typescript
// WebSocket Connection Flow
1. Client connects to WebSocket server
2. Server authenticates connection
3. Server sends initial state
4. Server streams updates:
   - Training progress
   - System metrics
   - Log updates
   - Dataset download progress
5. Client updates UI in real-time
```

## 🔒 Security Architecture

### Token Security

```typescript
// Secure Token Flow
1. Original token: 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
2. Base64 encode: aGZfWk5MekFqY2FHYkJQQldFUlBhVHhpbklVZlFhWUFwd2JlZA==
3. Store in .env (not committed to git)
4. Decode only when needed for API calls
5. Never log or expose original token
```

### Input Validation

```typescript
// Validation Layers
1. Frontend validation (immediate feedback)
2. API endpoint validation (request validation)
3. Database constraint validation (data integrity)
4. Business logic validation (domain rules)
```

### Error Handling

```typescript
// Error Handling Strategy
1. Catch errors at appropriate levels
2. Log errors with context
3. Return sanitized error messages
4. Never expose sensitive information
5. Provide helpful error messages to users
```

## 📊 Performance Architecture

### Frontend Performance

```typescript
// Optimization Strategies
1. Code Splitting: Dynamic imports for large components
2. Bundle Analysis: Monitor and optimize bundle size
3. Caching: React Query for server state caching
4. Lazy Loading: Load components on demand
5. Memoization: React.memo for expensive components
```

### Backend Performance

```typescript
// Optimization Strategies
1. Database Indexing: Optimize query performance
2. Connection Pooling: Efficient database connections
3. Caching: In-memory caching for frequent data
4. Rate Limiting: Prevent API abuse
5. Compression: Gzip compression for responses
```

### Real-time Performance

```typescript
// WebSocket Optimization
1. Connection Management: Efficient connection handling
2. Message Batching: Batch multiple updates
3. Selective Updates: Send only relevant updates
4. Connection Recovery: Automatic reconnection
5. Memory Management: Clean up old connections
```

## 🚀 Deployment Architecture

### Development Environment

```bash
# Development Setup
Frontend: Vite dev server (port 5173)
Backend: Node.js server (port 3001)
Database: SQLite file
WebSocket: Socket.IO server
```

### Production Environment

```bash
# Production Setup
Frontend: Built static files served by Express
Backend: Compiled Node.js server
Database: SQLite file (can be migrated to PostgreSQL)
WebSocket: Socket.IO server
Reverse Proxy: Nginx (optional)
```

### Scalability Considerations

```typescript
// Future Scaling Options
1. Database: Migrate to PostgreSQL for better performance
2. Caching: Add Redis for session and data caching
3. Load Balancing: Multiple server instances
4. CDN: Static asset delivery
5. Microservices: Split into smaller services
```

## 🔧 Development Architecture

### Build System

```typescript
// Frontend Build (Vite)
1. TypeScript compilation
2. React component bundling
3. CSS processing (Tailwind)
4. Asset optimization
5. Code splitting

// Backend Build (TypeScript)
1. TypeScript compilation to CommonJS
2. File renaming (.js → .cjs)
3. Dependency bundling
4. Source map generation
```

### Development Workflow

```bash
# Development Commands
npm run dev          # Start frontend dev server
npm run server       # Start backend server
npm run build        # Build frontend for production
npm run compile-server # Compile backend TypeScript
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checking
```

### Code Organization

```typescript
// Frontend Structure
src/
├── components/      # React components
├── hooks/          # Custom React hooks
├── services/       # API and business logic
├── types/          # TypeScript definitions
├── utils/          # Utility functions
└── styles/         # CSS and styling

// Backend Structure
server/
├── index.ts        # Main server file
├── routes/         # API route handlers
├── services/       # Business logic services
├── utils/          # Utility functions
├── types/          # TypeScript definitions
└── middleware/     # Express middleware
```

## 📈 Monitoring Architecture

### System Monitoring

```typescript
// Monitoring Metrics
1. System Resources: CPU, Memory, Disk
2. Application Metrics: Request count, Response time
3. Training Metrics: Progress, Accuracy, Loss
4. Database Metrics: Query performance, Connection count
5. WebSocket Metrics: Connection count, Message rate
```

### Logging Strategy

```typescript
// Log Levels
1. ERROR: System errors and failures
2. WARN: Warning conditions
3. INFO: General information
4. DEBUG: Detailed debugging information

// Log Components
1. server: Server startup and configuration
2. training: Training progress and results
3. dataset: Dataset operations
4. api: API requests and responses
5. websocket: WebSocket connections and events
```

## 🔮 Future Architecture Considerations

### Planned Enhancements

1. **Authentication System**: JWT-based user authentication
2. **Role-Based Access Control**: User roles and permissions
3. **Model Versioning**: Version control for trained models
4. **Distributed Training**: Multi-node training support
5. **Advanced Analytics**: Machine learning insights
6. **API Rate Limiting**: Request throttling and quotas
7. **Docker Support**: Containerized deployment
8. **CI/CD Pipeline**: Automated testing and deployment

### Scalability Roadmap

1. **Phase 1**: Current monolithic architecture
2. **Phase 2**: Add caching layer (Redis)
3. **Phase 3**: Database migration (PostgreSQL)
4. **Phase 4**: Microservices architecture
5. **Phase 5**: Kubernetes deployment
6. **Phase 6**: Multi-region deployment

---

*This architecture document is maintained by the Persian Legal AI development team. Last updated: January 2025*