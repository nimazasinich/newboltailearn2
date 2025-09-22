#!/bin/bash

# Persian Legal AI - Docker Run Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
MODE="production"
ACTION="start"

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
    echo "Persian Legal AI - Docker Run Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -m, --mode MODE      Run mode: production (default) or development"
    echo "  --start              Start the containers (default)"
    echo "  --stop               Stop the containers"
    echo "  --restart            Restart the containers"
    echo "  --logs               Show container logs"
    echo "  --status             Show container status"
    echo "  --clean              Stop containers and remove volumes"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                   # Start production containers"
    echo "  $0 -m development    # Start development containers"
    echo "  $0 --logs            # Show logs"
    echo "  $0 --stop            # Stop containers"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--mode)
            MODE="$2"
            shift 2
            ;;
        --start)
            ACTION="start"
            shift
            ;;
        --stop)
            ACTION="stop"
            shift
            ;;
        --restart)
            ACTION="restart"
            shift
            ;;
        --logs)
            ACTION="logs"
            shift
            ;;
        --status)
            ACTION="status"
            shift
            ;;
        --clean)
            ACTION="clean"
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

# Set compose file based on mode
if [[ "$MODE" == "development" ]]; then
    COMPOSE_FILE="docker-compose-dev.yml"
    CONTAINER_PREFIX="persian-legal-ai-dev"
else
    COMPOSE_FILE="docker-compose.yml"
    CONTAINER_PREFIX="persian-legal-ai"
fi

print_status "Persian Legal AI - Docker Management"
print_status "Mode: $MODE"
print_status "Action: $ACTION"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Execute action
case $ACTION in
    "start")
        print_status "Starting containers..."
        docker-compose -f "$COMPOSE_FILE" up -d
        
        if [[ $? -eq 0 ]]; then
            print_success "Containers started successfully!"
            print_status "Application will be available at: http://localhost:8080"
            print_status "Health check: http://localhost:8080/health"
            
            if [[ "$MODE" == "development" ]]; then
                print_status "Database admin (if enabled): http://localhost:8081"
            fi
            
            print_status ""
            print_status "To view logs: $0 --logs"
            print_status "To stop: $0 --stop"
        else
            print_error "Failed to start containers"
            exit 1
        fi
        ;;
        
    "stop")
        print_status "Stopping containers..."
        docker-compose -f "$COMPOSE_FILE" down
        
        if [[ $? -eq 0 ]]; then
            print_success "Containers stopped successfully!"
        else
            print_error "Failed to stop containers"
            exit 1
        fi
        ;;
        
    "restart")
        print_status "Restarting containers..."
        docker-compose -f "$COMPOSE_FILE" restart
        
        if [[ $? -eq 0 ]]; then
            print_success "Containers restarted successfully!"
        else
            print_error "Failed to restart containers"
            exit 1
        fi
        ;;
        
    "logs")
        print_status "Showing container logs (Press Ctrl+C to exit)..."
        docker-compose -f "$COMPOSE_FILE" logs -f
        ;;
        
    "status")
        print_status "Container status:"
        docker-compose -f "$COMPOSE_FILE" ps
        
        print_status ""
        print_status "Docker images:"
        docker images | grep -E "(persian-legal|REPOSITORY)"
        
        print_status ""
        print_status "Volume information:"
        docker volume ls | grep -E "(persian-legal|DRIVER)"
        ;;
        
    "clean")
        print_warning "This will stop containers and remove volumes. Data will be lost!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Stopping containers and removing volumes..."
            docker-compose -f "$COMPOSE_FILE" down -v
            
            # Remove any orphaned volumes
            docker volume prune -f
            
            print_success "Cleanup completed!"
        else
            print_status "Cleanup cancelled."
        fi
        ;;
esac