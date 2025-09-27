# Multi-stage Dockerfile for Persian Legal AI Application
# Stage 1: Builder - Build frontend assets
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++ git

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Ensure vite builds to docs directory
RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner

# Install runtime dependencies
RUN apk add --no-cache curl tini

# Create non-root user
RUN addgroup -g 1001 appuser && \
    adduser -D -u 1001 -G appuser appuser

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy server code and built frontend
COPY --from=builder /app/docs ./docs
COPY server ./server
COPY scripts ./scripts
COPY public ./public
COPY src ./src

# Create data and logs directories
RUN mkdir -p /data /logs && \
    chown -R appuser:appuser /app /data /logs

# Environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_PATH=/data/persian_legal_ai.sqlite \
    SQLITE_PATH=/data/persian_legal_ai.sqlite

# Health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD curl -fsS --max-time 5 http://localhost:3000/health || exit 1

# Expose port
EXPOSE 3000

# Switch to non-root user
USER appuser

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the server
CMD ["node", "server/main.js"]