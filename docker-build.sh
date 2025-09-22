#!/bin/bash

# Persian Legal AI - Docker Build Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
MODE="production"
REBUILD=false
NO_CACHE=false

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

# Help function
show_help() {
    echo "Persian Legal AI - Docker Build Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -m, --mode MODE      Build mode: production (default) or development"
    echo "  -r, --rebuild        Force rebuild (remove existing container/image)"
    echo "  -n, --no-cache       Build without cache"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                   # Build production image"
    echo "  $0 -m development    # Build development image"
    echo "  $0 -r -n             # Force rebuild without cache"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--mode)
            MODE="$2"
            shift 2
            ;;
        -r|--rebuild)
            REBUILD=true
            shift
            ;;
        -n|--no-cache)
            NO_CACHE=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate mode
if [[ "$MODE" != "production" && "$MODE" != "development" ]]; then
    print_error "Invalid mode: $MODE. Must be 'production' or 'development'"
    exit 1
fi

print_status "Starting Persian Legal AI build process..."
print_status "Mode: $MODE"

# Set container and image names based on mode
if [[ "$MODE" == "development" ]]; then
    CONTAINER_NAME="persian-legal-ai-dev"
    IMAGE_NAME="persian-legal-ai:dev"
    COMPOSE_FILE="docker-compose-dev.yml"
else
    CONTAINER_NAME="persian-legal-ai"
    IMAGE_NAME="persian-legal-ai:latest"
    COMPOSE_FILE="docker-compose.yml"
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop and remove existing container if rebuild is requested
if [[ "$REBUILD" == true ]]; then
    print_warning "Rebuild requested. Stopping and removing existing containers..."
    
    if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
        print_status "Stopping container: $CONTAINER_NAME"
        docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
    fi
    
    if docker ps -aq -f name="$CONTAINER_NAME" | grep -q .; then
        print_status "Removing container: $CONTAINER_NAME"
        docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || true
    fi
    
    if docker images -q "$IMAGE_NAME" | grep -q .; then
        print_status "Removing image: $IMAGE_NAME"
        docker rmi "$IMAGE_NAME" >/dev/null 2>&1 || true
    fi
fi

# Build frontend if not in development mode
if [[ "$MODE" == "production" ]]; then
    print_status "Building frontend assets..."
    if command -v npm >/dev/null 2>&1; then
        npm run build
        print_success "Frontend build completed"
    else
        print_warning "npm not found. Assuming frontend is already built."
    fi
fi

# Prepare build arguments
BUILD_ARGS=""
if [[ "$NO_CACHE" == true ]]; then
    BUILD_ARGS="--no-cache"
    print_status "Building without cache"
fi

# Build the Docker image
print_status "Building Docker image: $IMAGE_NAME"
docker build $BUILD_ARGS -t "$IMAGE_NAME" .

if [[ $? -eq 0 ]]; then
    print_success "Docker image built successfully: $IMAGE_NAME"
else
    print_error "Failed to build Docker image"
    exit 1
fi

# Show image info
print_status "Image information:"
docker images "$IMAGE_NAME" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

print_success "Build process completed!"
print_status "To run the container:"
print_status "  docker-compose -f $COMPOSE_FILE up -d"
print_status ""
print_status "To view logs:"
print_status "  docker-compose -f $COMPOSE_FILE logs -f"