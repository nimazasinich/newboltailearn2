# NewBolt AI Learn - Docker Setup Guide

This comprehensive guide provides professional Docker setup instructions for the **NewBolt AI Learn** Persian Legal AI system. This setup allows you to properly prepare and execute the project locally and with Docker in various environments.

## 🚀 Quick Start

### 1. Build Docker Image

To build the Docker image for the project, execute the following command in the root directory:

```bash
docker build -t newboltailearn .
```

**Options:**
- `docker build`: Command to build a Docker image
- `-t newboltailearn`: Tags the Docker image with the name `newboltailearn`
- `.`: Indicates the current directory as the context for Docker to use

### 2. Run with Docker Compose

To run the services (both backend and frontend) using **docker-compose.yml**:

```bash
docker-compose up --build -d
```

**Explanation:**
- `docker-compose up`: Starts the services defined in `docker-compose.yml`
- `--build`: Rebuilds the images if necessary
- `-d`: Runs the services in detached mode (in the background)

## 📋 Environment Setup

### 3. Setting Environment Variables

Environment-specific files are automatically loaded:

- **Development**: `.env.development`
- **Production**: `.env.production`
- **Default**: `.env`

#### Using Custom Environment File

```bash
docker-compose --env-file .env.production up --build -d
```

**Explanation:**
- `--env-file .env.production`: Specifies the environment file to load

#### Required Environment Variables

Create your `.env.production` file with:

```env
# Security (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-secure-jwt-secret-key
SESSION_SECRET=your-secure-session-secret-key
CSRF_SECRET=your-secure-csrf-secret-key

# HuggingFace (Optional)
HF_TOKEN_B64=your-base64-encoded-token
HF_TOKEN_ENC=your-encrypted-token
```

## 🔧 Development Environment

### 4. Running Development Server

#### Local Development (without Docker)

Backend server:
```bash
NODE_ENV=development node server/index.js
```

Frontend (Vite dev server):
```bash
npm run dev
```

#### Docker Development Environment

```bash
docker-compose -f docker-compose-dev.yml up --build -d
```

This provides:
- Hot reload for both frontend and backend
- Debug port (9229) for Node.js debugging
- Volume mounting for real-time code changes

## 🏗️ Advanced Docker Commands

### 5. Building Specific Targets

Build backend only:
```bash
docker build -t newboltailearn:backend --target backend .
```

Build frontend only:
```bash
docker build -t newboltailearn:frontend --target frontend .
```

Build development image:
```bash
docker build -t newboltailearn:development --target development .
```

### 6. Using Convenience Scripts

We provide convenient scripts for common operations:

#### Build Scripts
```bash
# Build all targets
npm run docker:build:all

# Build specific targets
npm run docker:build:backend
npm run docker:build:frontend
npm run docker:build:dev
```

#### Run Scripts
```bash
# Production mode
npm run docker:run

# Development mode
npm run docker:run:dev

# Backend only
npm run docker:run:backend

# Frontend only
npm run docker:run:frontend
```

#### Management Scripts
```bash
# Stop all containers
npm run docker:stop

# View logs
npm run docker:logs

# Check status
npm run docker:status
```

## 🧪 Testing

### 7. Running Tests

Run the test suite:
```bash
npm run test
```

Run specific test types:
```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 📊 Monitoring and Logs

### 8. Container Management

#### Check Running Containers
```bash
docker ps
```

#### View Container Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker logs newboltailearn-backend

# Follow logs
docker logs -f newboltailearn-backend
```

#### Container Health Checks
```bash
# Backend health
curl http://localhost:3000/health

# Frontend health
curl http://localhost:80/
```

## 🚀 Production Deployment

### 9. Production Docker Setup

#### Single Container Deployment

Build for production:
```bash
docker build -t newboltailearn:production .
```

Run in production:
```bash
docker run -d -p 3000:3000 \
  --env-file .env.production \
  --name newboltailearn-production \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/datasets:/app/datasets \
  -v $(pwd)/models:/app/models \
  -v $(pwd)/checkpoints:/app/checkpoints \
  -v $(pwd)/exports:/app/exports \
  -v $(pwd)/logs:/app/logs \
  newboltailearn:production
```

#### Full Stack with Reverse Proxy

```bash
# Start with nginx reverse proxy
docker-compose --profile production up --build -d
```

This includes:
- Backend service
- Frontend service  
- Nginx reverse proxy
- SSL termination (when configured)
- Load balancing
- Static file serving

## 🔒 Security Considerations

### 10. Production Security

#### Environment Variables
- Always use strong, unique secrets in production
- Never commit `.env.production` to version control
- Use environment variable injection in CI/CD

#### Container Security
- Containers run as non-root user
- Security headers enabled
- Rate limiting configured
- CORS properly configured

#### SSL/TLS Setup

For production with SSL, update `nginx/conf.d/newboltailearn.conf`:

```nginx
# Uncomment and configure SSL sections
ssl_certificate /etc/nginx/ssl/cert.pem;
ssl_certificate_key /etc/nginx/ssl/key.pem;
```

Mount SSL certificates:
```bash
docker-compose -v ./ssl:/etc/nginx/ssl:ro --profile production up -d
```

## 🔧 Troubleshooting

### 11. Common Issues

#### Port Conflicts
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Use different port
docker run -p 8000:3000 newboltailearn
```

#### Database Issues
```bash
# Check database health
curl http://localhost:3000/api/health

# View database logs
docker logs newboltailearn-backend | grep -i database
```

#### Build Issues
```bash
# Clean build (no cache)
docker build --no-cache -t newboltailearn .

# Clean docker system
docker system prune -f
```

#### Permission Issues
```bash
# Fix data directory permissions
sudo chown -R $USER:$USER ./data
chmod 755 ./data
```

## 📈 Performance Optimization

### 12. Production Optimization

#### Multi-stage Build Benefits
- Smaller production images
- Separate build and runtime dependencies
- Optimized for each environment

#### Resource Limits
```yaml
# In docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

#### Caching Strategy
```bash
# Enable Redis cache
docker-compose --profile cache up -d
```

## 🔄 Backup and Maintenance

### 13. Database Backup

Automated backup service:
```bash
# Enable backup service
docker-compose --profile backup up -d
```

Manual backup:
```bash
# Create backup
docker exec newboltailearn-backend cp /app/data/persian_legal_ai.db /app/data/backup_$(date +%Y%m%d).db
```

### 14. Updates and Maintenance

#### Update Images
```bash
# Rebuild and restart
docker-compose up --build -d

# Pull latest base images
docker-compose pull
```

#### Clean Up
```bash
# Remove unused images
docker image prune -f

# Remove unused volumes
docker volume prune -f
```

## 📚 Service Profiles

The Docker Compose setup includes several profiles for different use cases:

- **Default**: Backend + Frontend (production)
- **development**: Development environment with hot reload
- **cache**: Includes Redis caching
- **production**: Full production stack with Nginx
- **backup**: Automated database backups
- **admin**: Database administration interface

## 🌐 Access Points

After successful deployment:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost | Main application |
| Backend API | http://localhost:3000/api | REST API |
| Health Check | http://localhost:3000/health | Service status |
| Development | http://localhost:5173 | Dev server (dev mode) |
| Database Admin | http://localhost:8080 | DB interface (admin profile) |

## 🆘 Support

For issues and questions:

1. Check container logs: `docker-compose logs -f`
2. Verify health endpoints: `curl http://localhost:3000/health`
3. Review environment configuration
4. Check Docker system resources: `docker system df`

---

**NewBolt AI Learn** - Professional Docker setup for Persian Legal AI System