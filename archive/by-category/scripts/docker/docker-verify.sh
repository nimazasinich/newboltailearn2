#!/bin/bash
# docker-verify.sh - Quick verification script for Docker setup

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Docker Setup Verification Script     ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check Docker installation
echo -e "${BLUE}Checking Docker installation...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker installed: $(docker --version)"
else
    echo -e "${RED}✗${NC} Docker not installed"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check Docker Compose
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker Compose installed: $(docker compose version)"
else
    echo -e "${RED}✗${NC} Docker Compose not installed"
    exit 1
fi

# Check required files
echo ""
echo -e "${BLUE}Checking required files...${NC}"

FILES=(
    "Dockerfile"
    "Dockerfile.backend"
    "docker-compose.yml"
    "docker-compose.dev.yml"
    ".dockerignore"
    ".env.example"
    "docker/nginx/nginx.conf"
    "docker/scripts/wait-for-it.sh"
    "docker/scripts/health-check.sh"
    "docker/scripts/init-db.sh"
    "docker/scripts/db-smoke-test.sh"
)

ALL_GOOD=true
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file missing"
        ALL_GOOD=false
    fi
done

if [ "$ALL_GOOD" = false ]; then
    echo -e "\n${RED}Some files are missing. Please ensure all Docker files are present.${NC}"
    exit 1
fi

# Check if .env exists
echo ""
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠${NC} .env file not found. Creating from template..."
    cp .env.example .env
    echo -e "${GREEN}✓${NC} Created .env from .env.example"
    echo -e "${YELLOW}  Please edit .env with your configuration${NC}"
fi

# Validate Docker Compose configuration
echo ""
echo -e "${BLUE}Validating Docker Compose configuration...${NC}"
if docker compose config > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Docker Compose configuration is valid"
else
    echo -e "${RED}✗${NC} Docker Compose configuration has errors"
    docker compose config
    exit 1
fi

# List available profiles
echo ""
echo -e "${BLUE}Available Docker Compose profiles:${NC}"
echo "  • dev   - Development environment with hot reload"
echo "  • prod  - Production environment"
echo "  • nginx - Production with Nginx reverse proxy"
echo "  • gpu   - Production with GPU support"

# Show quick start commands
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}         Quick Start Commands          ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Development:"
echo -e "  ${GREEN}docker compose --profile dev up -d${NC}"
echo ""
echo "Production:"
echo -e "  ${GREEN}docker compose --profile prod up -d${NC}"
echo ""
echo "Production with Nginx:"
echo -e "  ${GREEN}docker compose --profile prod --profile nginx up -d${NC}"
echo ""
echo "View logs:"
echo -e "  ${GREEN}docker compose logs -f${NC}"
echo ""
echo "Stop all services:"
echo -e "  ${GREEN}docker compose down${NC}"
echo ""
echo "Initialize database:"
echo -e "  ${GREEN}docker exec persian-legal-backend /app/docker/scripts/init-db.sh${NC}"
echo ""
echo "Run database tests:"
echo -e "  ${GREEN}docker exec persian-legal-backend /app/docker/scripts/db-smoke-test.sh${NC}"
echo ""

echo -e "${GREEN}✅ Docker setup verification complete!${NC}"
echo -e "${BLUE}Your Docker environment is ready for deployment.${NC}"