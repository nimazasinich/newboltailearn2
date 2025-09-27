# Persian Legal AI - Docker Guide

This guide covers the complete Docker setup for the Persian Legal AI application.

## 🏗️ Architecture Overview

The application runs as a **unified container** that serves both:
- **Frontend**: React application (Persian Legal AI Dashboard)
- **Backend**: Node.js API server with SQLite database
- **Monitoring**: Health checks and system metrics (beacon functionality)

## 📁 Files Overview

### Core Docker Files
- **`Dockerfile`**: Main container definition
- **`docker-compose.yml`**: Production deployment
- **`docker-compose-dev.yml`**: Development environment
- **`docker-build.sh`**: Build automation script
- **`docker-run.sh`**: Container management script

## 🚀 Quick Start

### Production Deployment
```bash
# Build and start
./docker-build.sh
./docker-run.sh

# Or using docker-compose directly
docker-compose up -d
```

### Development Environment
```bash
# Build and start development environment
./docker-build.sh -m development
./docker-run.sh -m development

# Or using docker-compose directly
docker-compose -f docker-compose-dev.yml up -d
```

## 🛠️ Build Script Usage

The `docker-build.sh` script provides automated building with various options:

```bash
# Basic production build
./docker-build.sh

# Development build
./docker-build.sh -m development

# Force rebuild without cache
./docker-build.sh -r -n

# Show help
./docker-build.sh -h
```

### Build Script Options
- `-m, --mode`: Build mode (production/development)
- `-r, --rebuild`: Force rebuild (removes existing containers/images)
- `-n, --no-cache`: Build without Docker cache
- `-h, --help`: Show help message

## 🎮 Run Script Usage

The `docker-run.sh` script manages container lifecycle:

```bash
# Start containers
./docker-run.sh

# Start development environment
./docker-run.sh -m development

# Stop containers
./docker-run.sh --stop

# View logs
./docker-run.sh --logs

# Show status
./docker-run.sh --status

# Clean up (removes volumes - DATA LOSS!)
./docker-run.sh --clean
```

### Run Script Options
- `-m, --mode`: Run mode (production/development)
- `--start`: Start containers (default)
- `--stop`: Stop containers
- `--restart`: Restart containers
- `--logs`: Show container logs
- `--status`: Show container status
- `--clean`: Stop and remove volumes (⚠️ DATA LOSS)

## 🔧 Configuration

### Environment Variables
```bash
NODE_ENV=production          # Environment mode
DATABASE_PATH=/app/data/database.sqlite  # SQLite database path
SERVER_PORT=8080            # Server port
PORT=8080                   # Alternative port variable
```

### Ports
- **8080**: Main application (frontend + API)
- **8081**: Database admin interface (development only)

### Volumes
- **`persian-legal-data`**: Production database storage
- **`persian-legal-data-dev`**: Development database storage

## 📊 Monitoring & Health Checks

### Health Check Endpoints
- **`/health`**: Comprehensive health status with beacon info
- **`/api/system/metrics`**: Real-time system metrics

### Health Check Response Example
```json
{
  "status": "ok",
  "database": "connected",
  "uptime": 3600,
  "memory": {
    "used": 45,
    "total": 128,
    "percentage": 35
  },
  "cpu": 25,
  "timestamp": "2025-09-22T00:00:00.000Z",
  "beacon": "active"
}
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Container Won't Start
```bash
# Check logs
./docker-run.sh --logs

# Check status
./docker-run.sh --status

# Rebuild if needed
./docker-build.sh -r
```

#### 2. Frontend Shows Blank Page
- Ensure frontend is built: `npm run build`
- Check if static files are served: `curl http://localhost:8080/`
- Verify container logs for errors

#### 3. Database Issues
```bash
# Check database permissions
docker exec -it persian-legal-ai ls -la /app/data/

# Access container shell
docker exec -it persian-legal-ai sh

# View database logs
./docker-run.sh --logs | grep -i database
```

#### 4. Port Conflicts
```bash
# Check what's using port 8080
netstat -tlnp | grep 8080

# Stop conflicting services
sudo systemctl stop <service-name>
```

### Debug Commands

```bash
# Container shell access
docker exec -it persian-legal-ai sh

# View container processes
docker exec -it persian-legal-ai ps aux

# Check container resources
docker stats persian-legal-ai

# Inspect container configuration
docker inspect persian-legal-ai
```

## 🔐 Security Features

- **Non-root user**: Runs as `appuser` (UID 1001)
- **Minimal base image**: Alpine Linux
- **Volume permissions**: Proper ownership and permissions
- **Health checks**: Automatic container health monitoring

## 📈 Performance Optimization

### Production Optimizations
- Multi-stage build process
- Minimal Alpine base image
- Efficient layer caching
- Production dependencies only

### Resource Limits (Optional)
Add to docker-compose.yml:
```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 512M
    reservations:
      cpus: '0.5'
      memory: 256M
```

## 🔄 Backup & Recovery

### Database Backup
```bash
# Create backup
docker exec persian-legal-ai sqlite3 /app/data/database.sqlite ".backup /app/data/backup.sqlite"

# Copy to host
docker cp persian-legal-ai:/app/data/backup.sqlite ./backup.sqlite
```

### Volume Backup
```bash
# Backup volume
docker run --rm -v persian-legal-data:/data -v $(pwd):/backup alpine tar czf /backup/persian-legal-backup.tar.gz -C /data .

# Restore volume
docker run --rm -v persian-legal-data:/data -v $(pwd):/backup alpine tar xzf /backup/persian-legal-backup.tar.gz -C /data
```

## 🚀 Deployment Strategies

### Single Server Deployment
```bash
# Production deployment
./docker-build.sh
./docker-run.sh
```

### Docker Swarm (Optional)
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml persian-legal-stack
```

### Kubernetes (Advanced)
See `k8s/` directory for Kubernetes manifests (if available).

## 📝 Logs & Monitoring

### Log Management
```bash
# View logs
./docker-run.sh --logs

# Filter logs
docker logs persian-legal-ai 2>&1 | grep ERROR

# Log rotation (production)
docker-compose.yml:
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "3"
```

### Monitoring Integration
The application exposes metrics at `/api/system/metrics` for integration with:
- Prometheus
- Grafana
- Custom monitoring solutions

## 🆘 Support

For issues:
1. Check this guide
2. Review container logs: `./docker-run.sh --logs`
3. Check system resources: `docker stats`
4. Verify configuration: `./docker-run.sh --status`

## 📋 Checklist

Before deployment:
- [ ] Docker and Docker Compose installed
- [ ] Frontend built (`npm run build`)
- [ ] Environment variables configured
- [ ] Ports 8080 available
- [ ] Sufficient disk space for volumes
- [ ] Network connectivity for health checks