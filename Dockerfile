# Frontend Multi-Stage Build Dockerfile
# Production-ready React/Vite application with optimized build

# Stage 1: Dependencies
FROM node:20-bullseye-slim AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean install
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Build
FROM node:20-bullseye-slim AS builder
WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package*.json ./
RUN npm ci && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application
ENV NODE_ENV=production
ENV VITE_API_URL=/api
ENV VITE_WS_URL=/
RUN npm run build

# Stage 3: Production Runtime with Node serve
FROM node:20-bullseye-slim AS runtime
WORKDIR /app

# Create non-root user
RUN groupadd -r appuser && \
    useradd -r -g appuser -s /bin/false appuser && \
    mkdir -p /app && \
    chown -R appuser:appuser /app

# Install serve globally
RUN npm install -g serve@14.2.1 && \
    npm cache clean --force

# Copy built assets from builder
COPY --from=builder --chown=appuser:appuser /app/dist ./dist

# Health check script
COPY --chown=appuser:appuser docker/scripts/health-check.sh /usr/local/bin/health-check
RUN chmod +x /usr/local/bin/health-check

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD ["/usr/local/bin/health-check"]

# Start serve
CMD ["serve", "-s", "dist", "-l", "3000", "--no-clipboard", "--no-port-switching"]