# ===== BASE IMAGE =====
FROM node:20-alpine AS base
RUN apk add --no-cache python3 make g++ sqlite curl
WORKDIR /app

# ===== DEVELOPMENT STAGE =====
FROM base AS development
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 5173 3000
CMD ["npm", "run", "dev"]

# ===== BUILD FRONTEND STAGE =====
FROM base AS build-frontend
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# ===== FRONTEND STAGE (NGINX) =====
FROM nginx:alpine AS frontend
COPY --from=build-frontend /app/docs /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ===== BACKEND STAGE =====
FROM base AS backend
RUN apk add --no-cache su-exec

# Create app user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S -D -H -u 1001 -s /sbin/nologin -G appgroup appuser

# Create data directory with proper permissions
RUN mkdir -p /app/data && \
    chown -R appuser:appgroup /app/data && \
    chmod 755 /app/data

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Copy application code
COPY server/ ./server/
COPY .env* ./

# Set proper ownership
RUN chown -R appuser:appgroup /app

# Container environment variables for SQLite
ENV DATABASE_PATH=/app/data/database.sqlite
ENV NODE_ENV=production
ENV SERVER_PORT=3000
ENV PORT=3000

# Create docker entrypoint script
RUN cat > /usr/local/bin/docker-entrypoint.sh << 'EOF'
#!/bin/sh
set -e

echo "🐳 Starting Persian Legal AI container..."
echo "📍 Database path: ${DATABASE_PATH}"
echo "🌐 Server port: ${SERVER_PORT}"

# Ensure data directory exists and has proper permissions
mkdir -p /app/data
chown appuser:appgroup /app/data
chmod 755 /app/data

# Test database directory permissions
if [ -w /app/data ]; then
    echo "✅ Database directory is writable"
else
    echo "❌ Database directory is not writable"
    exit 1
fi

# Switch to app user and start server
exec su-exec appuser:appgroup node server/index.js
EOF

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

# Health check with proper timeout for container startup
HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=3 \
  CMD curl -fsS http://localhost:3000/health || exit 1

# Add volume for data persistence
VOLUME ["/app/data"]

# Use custom entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]