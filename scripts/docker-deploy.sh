#!/bin/bash

# Docker Deployment Script for Persian Legal AI
# Deploys the application using Docker Compose

set -e

echo "🚀 Deploying Persian Legal AI with Docker"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
DEV_COMPOSE_FILE="docker-compose.dev.yml"
PROJECT_NAME="persian-legal-ai"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker Compose is available
check_docker_compose() {
    print_status "Checking Docker Compose availability..."
    if ! command -v docker-compose > /dev/null 2>&1 && ! docker compose version > /dev/null 2>&1; then
        print_error "Docker Compose is not available"
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Check if Docker is running
check_docker() {
    print_status "Checking Docker availability..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    print_success "Docker is running"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    mkdir -p data logs
    chmod 755 data logs
    print_success "Directories created"
}

# Deploy production environment
deploy_production() {
    print_status "Deploying production environment..."
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" down 2>/dev/null || true
    
    # Build and start services
    print_status "Building and starting services..."
    docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" up -d --build
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 15
    
    # Check service status
    print_status "Checking service status..."
    docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" ps
    
    # Test health endpoint
    print_status "Testing health endpoint..."
    for i in {1..30}; do
        if curl -f http://localhost:8080/health > /dev/null 2>&1; then
            print_success "Application is healthy and running"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Application failed to start properly"
            docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" logs
            exit 1
        fi
        sleep 2
    done
    
    print_success "Production deployment completed"
}

# Deploy development environment
deploy_development() {
    print_status "Deploying development environment..."
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose -f "${DEV_COMPOSE_FILE}" -p "${PROJECT_NAME}-dev" down 2>/dev/null || true
    
    # Build and start services
    print_status "Building and starting development services..."
    docker-compose -f "${DEV_COMPOSE_FILE}" -p "${PROJECT_NAME}-dev" up -d --build
    
    # Wait for services to be ready
    print_status "Waiting for development services to be ready..."
    sleep 20
    
    # Check service status
    print_status "Checking development service status..."
    docker-compose -f "${DEV_COMPOSE_FILE}" -p "${PROJECT_NAME}-dev" ps
    
    print_success "Development deployment completed"
}

# Deploy with Redis
deploy_with_redis() {
    print_status "Deploying with Redis cache..."
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" down 2>/dev/null || true
    
    # Build and start services with Redis profile
    print_status "Building and starting services with Redis..."
    docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" --profile with-redis up -d --build
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 20
    
    # Check service status
    print_status "Checking service status..."
    docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" ps
    
    # Test Redis connection
    print_status "Testing Redis connection..."
    if docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" exec redis redis-cli ping | grep -q "PONG"; then
        print_success "Redis is running and accessible"
    else
        print_warning "Redis connection test failed"
    fi
    
    print_success "Deployment with Redis completed"
}

# Show deployment status
show_status() {
    print_status "Deployment status:"
    docker-compose -f "${COMPOSE_FILE}" -p "${PROJECT_NAME}" ps
    
    echo ""
    print_status "Application URLs:"
    echo "  Main Application: http://localhost:8080"
    echo "  Health Check: http://localhost:8080/health"
    echo "  API Health: http://localhost:8080/api/health"
    
    echo ""
    print_status "Useful commands:"
    echo "  View logs: docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} logs -f"
    echo "  Stop services: docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} down"
    echo "  Restart services: docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} restart"
    echo "  Scale services: docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} up -d --scale persian-legal-ai=2"
}

# Clean up old containers and images
cleanup() {
    print_status "Cleaning up old containers and images..."
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    print_success "Cleanup completed"
}

# Main execution
main() {
    local environment="production"
    local with_redis=false
    local cleanup_flag=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dev)
                environment="development"
                shift
                ;;
            --with-redis)
                with_redis=true
                shift
                ;;
            --cleanup)
                cleanup_flag=true
                shift
                ;;
            --help)
                echo "Usage: $0 [--dev] [--with-redis] [--cleanup]"
                echo "  --dev        Deploy development environment"
                echo "  --with-redis Deploy with Redis cache"
                echo "  --cleanup    Clean up old containers and images"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    echo "Starting deployment process..."
    echo "Environment: ${environment}"
    echo "With Redis: ${with_redis}"
    
    check_docker
    check_docker_compose
    create_directories
    
    if [ "$cleanup_flag" = true ]; then
        cleanup
    fi
    
    if [ "$environment" = "development" ]; then
        deploy_development
    elif [ "$with_redis" = true ]; then
        deploy_with_redis
    else
        deploy_production
    fi
    
    show_status
    
    echo ""
    print_success "Deployment completed successfully!"
}

# Run main function
main "$@"
