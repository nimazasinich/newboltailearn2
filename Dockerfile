# Persian Legal AI - Unified Docker Container
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    curl \
    su-exec

# Create app user and group for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S -D -u 1001 -G appgroup appuser

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --legacy-peer-deps && \
    npm cache clean --force

# Copy application code
COPY server/ ./server/
COPY docs/ ./docs/
COPY .env* ./

# Create data directory with proper permissions
RUN mkdir -p /app/data && \
    chown -R appuser:appgroup /app && \
    chmod 755 /app/data

# Create entrypoint script
RUN cat > /usr/local/bin/docker-entrypoint.sh << 'EOF'
#!/bin/sh
set -e

echo "Starting Persian Legal AI Server..."

# Ensure data directory exists and has correct permissions
mkdir -p /app/data
chown -R appuser:appgroup /app/data
chmod 755 /app/data

# Health check
echo "Performing health checks..."
node -e "console.log('Node.js version:', process.version)"

# Switch to app user and start the application
echo "Starting server as appuser on port 8080..."
exec su-exec appuser:appgroup node server/index.js
EOF

# Make entrypoint executable
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/database.sqlite
ENV SERVER_PORT=8080
ENV PORT=8080

# Expose port
EXPOSE 8080

# Create volume for data persistence
VOLUME ["/app/data"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl --fail http://localhost:8080/health || exit 1

# Use the entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]