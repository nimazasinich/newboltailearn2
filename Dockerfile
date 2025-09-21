# ===== BASE IMAGE =====
FROM node:18-alpine AS base
RUN apk add --no-cache python3 make g++ sqlite curl
WORKDIR /app

# ===== DEVELOPMENT STAGE =====
FROM base AS development
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173 8000
CMD ["npm", "run", "dev"]

# ===== BUILD FRONTEND =====
FROM base AS build-frontend
COPY package*.json ./
RUN npm ci --only=production
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
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY server/ ./server/
COPY .env* ./
RUN mkdir -p data && chmod 755 data
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "const http=require('http'); http.get('http://localhost:8000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1));"
CMD ["node", "server/index.js"]