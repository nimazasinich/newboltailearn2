# syntax=docker/dockerfile:1.6
# NewBolt AI Learn - Persian Legal AI System
# Multi-stage Docker build for production deployment

# ===== Build Stage for Frontend =====
FROM node:20-alpine AS frontend-builder
LABEL stage=frontend-builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --verbose

# Copy source code
COPY . .

# Build the frontend for production
RUN npm run build

# Verify build output
RUN ls -la docs/ || ls -la dist/ || echo "Build output location check"

# ===== Production Frontend Stage =====
FROM nginx:alpine AS frontend
LABEL app=newboltailearn
LABEL component=frontend

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/docs /usr/share/nginx/html

# Create optimized nginx config for SPA
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA fallback
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # API proxy (if needed)
    location /api/ {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

# ===== Production Backend Stage =====
FROM node:20-alpine AS backend
LABEL app=newboltailearn
LABEL component=backend

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Install system dependencies for better-sqlite3
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    curl \
    dumb-init

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev --verbose && \
    npm cache clean --force

# Copy application code
COPY --chown=nextjs:nodejs . .

# Create necessary directories with proper permissions
RUN mkdir -p /app/data /app/datasets /app/models /app/checkpoints /app/exports /app/logs && \
    chown -R nextjs:nodejs /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV DB_PATH=/app/data/persian_legal_ai.db

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Switch to non-root user
USER nextjs

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the backend server
CMD ["node", "server/index.js"]

# ===== Development Stage =====
FROM node:20-alpine AS development
LABEL app=newboltailearn
LABEL component=development

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    curl \
    git

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci --verbose

# Copy source code
COPY . .

# Create directories
RUN mkdir -p /app/data /app/datasets /app/models /app/checkpoints /app/exports /app/logs

# Set environment
ENV NODE_ENV=development
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000 5173

# Start development server
CMD ["npm", "run", "dev"]