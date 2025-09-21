#!/bin/bash
# NewBolt AI Learn - Docker Build Script
# Build Docker image for the project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
IMAGE_NAME="newboltailearn"
TAG="latest"
TARGET=""
CACHE_FROM=""
BUILD_ARGS=""

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

# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -t, --target TARGET     Build specific target (backend, frontend, development)"
    echo "  -n, --name NAME         Image name (default: newboltailearn)"
    echo "  --tag TAG              Image tag (default: latest)"
    echo "  --no-cache             Build without using cache"
    echo "  --build-arg ARG=VALUE  Pass build argument"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                          # Build default image"
    echo "  $0 -t backend               # Build backend only"
    echo "  $0 -t frontend              # Build frontend only"
    echo "  $0 -t development           # Build development image"
    echo "  $0 --no-cache               # Build without cache"
    echo "  $0 --build-arg NODE_ENV=production"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--target)
            TARGET="$2"
            shift 2
            ;;
        -n|--name)
            IMAGE_NAME="$2"
            shift 2
            ;;
        --tag)
            TAG="$2"
            shift 2
            ;;
        --no-cache)
            CACHE_FROM="--no-cache"
            shift
            ;;
        --build-arg)
            BUILD_ARGS="$BUILD_ARGS --build-arg $2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Build the image
print_status "Building Docker image: $IMAGE_NAME:$TAG"

if [ -n "$TARGET" ]; then
    print_status "Target: $TARGET"
    FULL_IMAGE_NAME="$IMAGE_NAME:$TAG-$TARGET"
    TARGET_ARG="--target $TARGET"
else
    FULL_IMAGE_NAME="$IMAGE_NAME:$TAG"
    TARGET_ARG=""
fi

print_status "Full image name: $FULL_IMAGE_NAME"

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
    print_error "Dockerfile not found in current directory"
    exit 1
fi

# Build command
BUILD_CMD="docker build -t $FULL_IMAGE_NAME $TARGET_ARG $CACHE_FROM $BUILD_ARGS ."

print_status "Executing: $BUILD_CMD"

# Execute build
if eval $BUILD_CMD; then
    print_success "Docker image built successfully: $FULL_IMAGE_NAME"
    
    # Show image info
    print_status "Image information:"
    docker images | grep "$IMAGE_NAME" | head -5
    
    print_status "To run the image:"
    if [ -n "$TARGET" ]; then
        echo "  docker run -p 3000:3000 $FULL_IMAGE_NAME"
    else
        echo "  docker run -p 3000:3000 $FULL_IMAGE_NAME"
    fi
    
    print_status "To run with docker-compose:"
    echo "  docker-compose up --build -d"
    
else
    print_error "Docker build failed"
    exit 1
fi