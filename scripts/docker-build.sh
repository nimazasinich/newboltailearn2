#!/bin/bash

# Docker Build Script for Persian Legal AI
# Builds and tests the Docker container

set -e

echo "🐳 Building Persian Legal AI Docker Container"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="persian-legal-ai"
TAG="latest"
CONTAINER_NAME="persian-legal-ai-test"

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

# Check if Docker is running
check_docker() {
    print_status "Checking Docker availability..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    print_success "Docker is running"
}

# Build the Docker image
build_image() {
    print_status "Building Docker image: ${IMAGE_NAME}:${TAG}"
    
    # Build with build arguments
    docker build \
        --tag "${IMAGE_NAME}:${TAG}" \
        --tag "${IMAGE_NAME}:$(date +%Y%m%d-%H%M%S)" \
        --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
        --build-arg VCS_REF="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')" \
        --build-arg VERSION="$(git describe --tags --always 2>/dev/null || echo 'dev')" \
        .
    
    print_success "Docker image built successfully"
}

# Test the Docker image
test_image() {
    print_status "Testing Docker image..."
    
    # Stop and remove existing test container
    docker stop "${CONTAINER_NAME}" 2>/dev/null || true
    docker rm "${CONTAINER_NAME}" 2>/dev/null || true
    
    # Run the container in background
    print_status "Starting test container..."
    docker run -d \
        --name "${CONTAINER_NAME}" \
        --publish 8080:8080 \
        --env NODE_ENV=production \
        --env DATABASE_PATH=/app/data/database.sqlite \
        "${IMAGE_NAME}:${TAG}"
    
    # Wait for container to start
    print_status "Waiting for container to start..."
    sleep 10
    
    # Check if container is running
    if ! docker ps | grep -q "${CONTAINER_NAME}"; then
        print_error "Container failed to start"
        docker logs "${CONTAINER_NAME}"
        exit 1
    fi
    
    # Test health endpoint
    print_status "Testing health endpoint..."
    for i in {1..30}; do
        if curl -f http://localhost:8080/health > /dev/null 2>&1; then
            print_success "Health check passed"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Health check failed after 30 attempts"
            docker logs "${CONTAINER_NAME}"
            exit 1
        fi
        sleep 2
    done
    
    # Test API endpoint
    print_status "Testing API endpoint..."
    if curl -f http://localhost:8080/api/health > /dev/null 2>&1; then
        print_success "API endpoint test passed"
    else
        print_warning "API endpoint test failed (this might be expected)"
    fi
    
    # Show container logs
    print_status "Container logs:"
    docker logs "${CONTAINER_NAME}" --tail 20
    
    # Stop test container
    print_status "Stopping test container..."
    docker stop "${CONTAINER_NAME}"
    docker rm "${CONTAINER_NAME}"
    
    print_success "Docker image test completed successfully"
}

# Show image information
show_image_info() {
    print_status "Docker image information:"
    docker images "${IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
    
    print_status "Image layers:"
    docker history "${IMAGE_NAME}:${TAG}" --format "table {{.CreatedBy}}\t{{.Size}}"
}

# Main execution
main() {
    echo "Starting Docker build process..."
    
    check_docker
    build_image
    test_image
    show_image_info
    
    echo ""
    print_success "Docker build completed successfully!"
    echo ""
    echo "To run the container:"
    echo "  docker run -d --name persian-legal-ai -p 8080:8080 ${IMAGE_NAME}:${TAG}"
    echo ""
    echo "To run with Docker Compose:"
    echo "  docker-compose up -d"
    echo ""
    echo "To view logs:"
    echo "  docker logs persian-legal-ai"
    echo ""
    echo "To stop the container:"
    echo "  docker stop persian-legal-ai"
}

# Run main function
main "$@"
