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
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force
COPY server/ ./server/
COPY .env* ./
RUN mkdir -p /app/data
COPY server/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
ENTRYPOINT ["docker-entrypoint.sh"]