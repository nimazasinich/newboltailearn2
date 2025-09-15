<!-- ARCHIVED: moved from repo root on 2025-09-15 for cleanliness -->
# Operations Manual

## System Overview

The Persian Legal AI system is a production-ready application with comprehensive monitoring, backup, and operational capabilities.

## Deployment

### Prerequisites

- Node.js 18+ and npm 9+
- SQLite 3.35+
- Docker (optional)
- 4GB RAM minimum
- 10GB disk space

### Environment Setup

1. **Clone repository**:
```bash
git clone https://github.com/your-org/persian-legal-ai.git
cd persian-legal-ai
```

2. **Install dependencies**:
```bash
npm ci --production
```

3. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Generate secrets**:
```bash
# Generate JWT secret
openssl rand -base64 32

# Encode HuggingFace token
echo -n "your-hf-token" | base64
```

5. **Initialize database**:
```bash
npm run db:migrate
```

6. **Build application**:
```bash
npm run build
npm run compile-server
```

7. **Start server**:
```bash
npm start
```

### Docker Deployment

```bash
# Build image
docker build -t persian-legal-ai .

# Run container
docker run -d \
  -p 3001:3001 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/backups:/app/backups \
  --env-file .env \
  --name persian-legal-ai \
  persian-legal-ai

# Using Docker Compose
docker-compose up -d
```

## Database Management

### Backup Procedures

#### Automatic Backups

Backups are automatically created:
- Before migrations
- Daily at 2 AM (via cron)
- Before major operations

#### Manual Backup

```bash
# Create backup
npm run db:backup

# List backups
npm run db:list

# Clean old backups (keep last 10)
npm run db:clean 10

# Restore from backup
npm run db:restore persian_legal_ai_backup_2024-01-15.db
```

### Database Optimization

```bash
# Vacuum database (reclaim space)
sqlite3 persian_legal_ai.db "VACUUM;"

# Analyze database (update statistics)
sqlite3 persian_legal_ai.db "ANALYZE;"

# Check integrity
sqlite3 persian_legal_ai.db "PRAGMA integrity_check;"
```

### Migration Management

```bash
# Run migrations
npm run db:migrate

# Rollback last migration
npm run db:rollback

# Reset database (CAUTION: Data loss!)
npm run db:reset
```

## Monitoring

### Health Checks

**Endpoint**: `GET /health`

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600,
  "database": "connected",
  "version": "1.0.0"
}
```

### Metrics Endpoint

**Endpoint**: `GET /metrics` (Prometheus format)

Available metrics:
- HTTP request counts and latencies
- Memory usage
- CPU usage
- Active connections
- Training sessions
- Error rates

### Prometheus Configuration

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'persian-legal-ai'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

### Grafana Dashboard

Import dashboard from `monitoring/grafana-dashboard.json`

Key panels:
- Request rate
- Response time (p50, p95, p99)
- Error rate
- Memory/CPU usage
- Active training sessions
- WebSocket connections

## Log Management

### Log Locations

- **Application logs**: `logs/app.log`
- **Error logs**: `logs/error.log`
- **Access logs**: `logs/access.log`
- **Training logs**: Database table `training_logs`
- **System logs**: Database table `system_logs`

### Log Rotation

Configure with logrotate:

```bash
# /etc/logrotate.d/persian-legal-ai
/app/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload persian-legal-ai
    endscript
}
```

### Log Shipping (Optional)

Enable in `.env`:
```bash
ENABLE_LOG_SHIPPING=true
LOG_SHIPPING_URL=https://your-elk-stack.com
```

## Performance Tuning

### Node.js Optimization

```bash
# Increase memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start

# Enable clustering
PM2_INSTANCES=4 pm2 start ecosystem.config.js
```

### SQLite Optimization

```sql
-- Enable WAL mode
PRAGMA journal_mode=WAL;

-- Optimize cache
PRAGMA cache_size=10000;

-- Enable memory mapping
PRAGMA mmap_size=30000000000;
```

### Nginx Configuration

```nginx
upstream persian_legal_ai {
    least_conn;
    server localhost:3001;
    keepalive 64;
}

server {
    listen 80;
    server_name persian-legal-ai.com;

    location / {
        proxy_pass http://persian_legal_ai;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering off;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://persian_legal_ai;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Troubleshooting

### Common Issues

#### High Memory Usage

```bash
# Check memory usage
ps aux | grep node

# Analyze heap dump
node --inspect server/index.js
# Connect Chrome DevTools to chrome://inspect

# Force garbage collection
node --expose-gc server/index.js
```

#### Database Locked

```bash
# Check for locks
lsof | grep persian_legal_ai.db

# Kill blocking process
kill -9 <PID>

# Reset WAL mode
sqlite3 persian_legal_ai.db "PRAGMA journal_mode=DELETE;"
sqlite3 persian_legal_ai.db "PRAGMA journal_mode=WAL;"
```

#### WebSocket Connection Issues

```bash
# Check Socket.IO version compatibility
npm ls socket.io socket.io-client

# Test WebSocket connection
wscat -c ws://localhost:3001/socket.io/?transport=websocket

# Check CORS configuration
curl -H "Origin: http://example.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:3001
```

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm start

# Specific modules
DEBUG=express:*,socket.io:* npm start
```

## Maintenance Tasks

### Daily
- [ ] Check health endpoint
- [ ] Review error logs
- [ ] Monitor disk space
- [ ] Check backup completion

### Weekly
- [ ] Review security logs
- [ ] Check memory/CPU trends
- [ ] Test backup restoration
- [ ] Update dependencies (`npm outdated`)

### Monthly
- [ ] Full backup and off-site storage
- [ ] Database optimization (VACUUM, ANALYZE)
- [ ] Security audit (`npm audit`)
- [ ] Performance review
- [ ] Certificate renewal check

### Quarterly
- [ ] Disaster recovery drill
- [ ] Load testing
- [ ] Security assessment
- [ ] Documentation review

## Scaling

### Horizontal Scaling

Use PM2 for process management:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'persian-legal-ai',
    script: './server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

### Vertical Scaling

Recommended specifications by load:

| Load | CPU | RAM | Storage |
|------|-----|-----|---------|
| Low (<100 users) | 2 cores | 4GB | 20GB |
| Medium (<1000 users) | 4 cores | 8GB | 50GB |
| High (<10000 users) | 8 cores | 16GB | 100GB |
| Enterprise | 16+ cores | 32GB+ | 500GB+ |

## Disaster Recovery

### Backup Strategy

- **Database**: Daily automated backups, 30-day retention
- **Files**: Weekly full backup, monthly archives
- **Configuration**: Version controlled in Git
- **Secrets**: Stored in secure vault (HashiCorp Vault, AWS Secrets Manager)

### Recovery Procedures

1. **Service Failure**:
```bash
# Restart service
systemctl restart persian-legal-ai

# Check status
systemctl status persian-legal-ai

# View logs
journalctl -u persian-legal-ai -n 100
```

2. **Database Corruption**:
```bash
# Stop service
systemctl stop persian-legal-ai

# Restore from backup
npm run db:restore <backup-file>

# Verify integrity
sqlite3 persian_legal_ai.db "PRAGMA integrity_check;"

# Start service
systemctl start persian-legal-ai
```

3. **Complete System Failure**:
```bash
# Provision new server
# Install dependencies
# Restore from backups
# Update DNS
# Verify functionality
```

### RTO/RPO Targets

- **Recovery Time Objective (RTO)**: 4 hours
- **Recovery Point Objective (RPO)**: 24 hours

## Support

### Internal Support

- **Operations Team**: ops@persian-legal-ai.example
- **On-call Engineer**: +98-XXX-XXXX
- **Slack Channel**: #persian-legal-ai-ops

### Escalation Path

1. L1 Support (Response: 15 min)
2. L2 DevOps (Response: 30 min)
3. L3 Engineering (Response: 1 hour)
4. Management (Response: 2 hours)

---

*Last Updated: [Current Date]*
*Version: 1.0.0*