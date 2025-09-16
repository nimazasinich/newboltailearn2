# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS base
WORKDIR /app

# Install only prod deps (server runs JS directly)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy runtime sources (backend-only runtime)
# A .dockerignore will keep context clean
COPY . .

# Security best practices
ENV NODE_ENV=production
USER node

# Configure port (Render/other PaaS reads PORT)
ENV PORT=8000
EXPOSE 8000

# Start backend (no /app/dist expected)
# Adjust if your entry changes (kept as-is per repo)
CMD ["node", "server/index.js"]