# Persian Legal AI - Enterprise Docker Container
FROM node:20-alpine

# Install system dependencies for native modules and utilities
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    curl \
    su-exec \
    bash

# Create app user and group for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S -D -u 1001 -G appgroup appuser

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with production optimizations
RUN npm ci --only=production --legacy-peer-deps && \
    npm cache clean --force

# Copy application code
COPY server/ ./server/
COPY docs/ ./docs/
COPY .env* ./

# Create necessary directories with proper permissions
RUN mkdir -p /app/data /app/logs && \
    chown -R appuser:appgroup /app && \
    chmod 755 /app/data /app/logs

# Create entrypoint script
RUN echo '#!/bin/bash' > /usr/local/bin/docker-entrypoint.sh && \
    echo 'set -e' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'echo "Starting Persian Legal AI Server..."' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'mkdir -p /app/data' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'chown -R appuser:appgroup /app/data' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'chmod 755 /app/data' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'echo "Performing health checks..."' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'node -e "console.log(\"Node.js version:\", process.version)"' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'echo "Starting server as appuser on port 8080..."' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'exec su-exec appuser:appgroup node server/main.js' >> /usr/local/bin/docker-entrypoint.sh

# Make entrypoint executable
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/database.sqlite
ENV SERVER_PORT=8080
ENV PORT=8080
ENV LOG_LEVEL=info

# Expose port
EXPOSE 8080

# Create volume for data persistence
VOLUME ["/app/data", "/app/logs"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl --fail http://localhost:8080/health || exit 1

# Use the entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]