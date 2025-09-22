# Multi-stage build for Persian Legal AI Server

# ===== Base Stage =====
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    curl \
    su-exec

# Create app user and group
RUN addgroup -g 1001 -S appgroup && \
    adduser -S -D -u 1001 -G appgroup appuser

# Set working directory
WORKDIR /app

# Create data directory with proper permissions
RUN mkdir -p /app/data && \
    chown -R appuser:appgroup /app && \
    chmod 755 /app/data

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --legacy-peer-deps && \
    npm cache clean --force

# Copy application code
COPY server/ ./server/
COPY .env* ./

# Set ownership
RUN chown -R appuser:appgroup /app

# Create proper entrypoint script
RUN cat > /usr/local/bin/docker-entrypoint.sh << 'EOF'
#!/bin/sh
set -e

# Ensure data directory exists and has correct permissions
mkdir -p /app/data
chown -R appuser:appgroup /app/data
chmod 755 /app/data

# Switch to app user and start the application
exec su-exec appuser:appgroup node server/index.js
EOF

# Make entrypoint executable
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/database.sqlite
ENV SERVER_PORT=8080

# Expose port
EXPOSE 8080

# Create volume for data persistence
VOLUME ["/app/data"]

# ===== Backend Stage =====
FROM base AS backend

# Use the entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# ===== Frontend Stage =====
FROM nginx:alpine AS frontend

# Copy the built frontend files
COPY docs/ /usr/share/nginx/html/

# Copy nginx configuration if it exists
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]