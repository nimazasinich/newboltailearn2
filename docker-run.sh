#!/bin/bash
# NewBolt AI Learn - Docker Run Script
# Run Docker containers with different configurations

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
MODE="production"
DETACHED=false
PORT_BACKEND=3000
PORT_FRONTEND=80
ENV_FILE=""

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
    echo "  -m, --mode MODE         Run mode (production, development, backend-only, frontend-only)"
    echo "  -d, --detached          Run in detached mode"
    echo "  -p, --port PORT         Backend port (default: 3000)"
    echo "  --frontend-port PORT    Frontend port (default: 80)"
    echo "  --env-file FILE         Environment file to use"
    echo "  -n, --name NAME         Image name (default: newboltailearn)"
    echo "  --tag TAG              Image tag (default: latest)"
    echo "  --stop                 Stop running containers"
    echo "  --logs                 Show container logs"
    echo "  --status               Show container status"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Run Modes:"
    echo "  production     - Full stack with backend and frontend (default)"
    echo "  development    - Development mode with hot reload"
    echo "  backend-only   - Backend API server only"
    echo "  frontend-only  - Frontend static server only"
    echo ""
    echo "Examples:"
    echo "  $0                          # Run in production mode"
    echo "  $0 -m development -d        # Run in development mode (detached)"
    echo "  $0 -m backend-only -p 8000  # Run backend only on port 8000"
    echo "  $0 --stop                   # Stop all containers"
    echo "  $0 --logs                   # Show container logs"
}

# Function to stop containers
stop_containers() {
    print_status "Stopping NewBolt AI Learn containers..."
    
    # Stop docker-compose services
    if [ -f "docker-compose.yml" ]; then
        docker-compose down
    fi
    
    # Stop individual containers
    for container in newboltailearn-backend newboltailearn-frontend newboltailearn-dev; do
        if docker ps -q -f name=$container | grep -q .; then
            print_status "Stopping container: $container"
            docker stop $container
            docker rm $container
        fi
    done
    
    print_success "Containers stopped"
}

# Function to show logs
show_logs() {
    print_status "Container logs:"
    
    if [ -f "docker-compose.yml" ]; then
        docker-compose logs -f --tail=50
    else
        for container in newboltailearn-backend newboltailearn-frontend newboltailearn-dev; do
            if docker ps -q -f name=$container | grep -q .; then
                print_status "Logs for $container:"
                docker logs --tail=20 $container
                echo ""
            fi
        done
    fi
}

# Function to show status
show_status() {
    print_status "Container status:"
    
    if [ -f "docker-compose.yml" ]; then
        docker-compose ps
    fi
    
    echo ""
    print_status "All NewBolt AI Learn containers:"
    docker ps -a --filter "label=app=newboltailearn" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--mode)
            MODE="$2"
            shift 2
            ;;
        -d|--detached)
            DETACHED=true
            shift
            ;;
        -p|--port)
            PORT_BACKEND="$2"
            shift 2
            ;;
        --frontend-port)
            PORT_FRONTEND="$2"
            shift 2
            ;;
        --env-file)
            ENV_FILE="$2"
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
        --stop)
            stop_containers
            exit 0
            ;;
        --logs)
            show_logs
            exit 0
            ;;
        --status)
            show_status
            exit 0
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

# Set environment file based on mode if not specified
if [ -z "$ENV_FILE" ]; then
    case $MODE in
        development)
            ENV_FILE=".env.development"
            ;;
        production)
            ENV_FILE=".env.production"
            ;;
        *)
            ENV_FILE=".env"
            ;;
    esac
fi

# Check if environment file exists
if [ -n "$ENV_FILE" ] && [ ! -f "$ENV_FILE" ]; then
    print_warning "Environment file not found: $ENV_FILE"
    print_status "Using default environment variables"
    ENV_FILE=""
fi

# Set detached flag
DETACH_FLAG=""
if [ "$DETACHED" = true ]; then
    DETACH_FLAG="-d"
fi

# Set environment file flag
ENV_FLAG=""
if [ -n "$ENV_FILE" ]; then
    ENV_FLAG="--env-file $ENV_FILE"
fi

print_status "Running NewBolt AI Learn in $MODE mode"

# Run based on mode
case $MODE in
    production)
        print_status "Starting full production stack..."
        if [ -f "docker-compose.yml" ]; then
            docker-compose $ENV_FLAG up --build $DETACH_FLAG backend frontend
        else
            print_error "docker-compose.yml not found"
            exit 1
        fi
        ;;
    
    development)
        print_status "Starting development environment..."
        if [ -f "docker-compose.yml" ]; then
            docker-compose $ENV_FLAG --profile development up --build $DETACH_FLAG dev
        else
            print_error "docker-compose.yml not found"
            exit 1
        fi
        ;;
    
    backend-only)
        print_status "Starting backend only on port $PORT_BACKEND..."
        docker run --rm $DETACH_FLAG \
            --name newboltailearn-backend \
            -p $PORT_BACKEND:3000 \
            $([ -n "$ENV_FILE" ] && echo "--env-file $ENV_FILE") \
            -v $(pwd)/data:/app/data \
            -v $(pwd)/datasets:/app/datasets \
            -v $(pwd)/models:/app/models \
            -v $(pwd)/checkpoints:/app/checkpoints \
            -v $(pwd)/exports:/app/exports \
            -v $(pwd)/logs:/app/logs \
            $IMAGE_NAME:$TAG-backend
        ;;
    
    frontend-only)
        print_status "Starting frontend only on port $PORT_FRONTEND..."
        docker run --rm $DETACH_FLAG \
            --name newboltailearn-frontend \
            -p $PORT_FRONTEND:80 \
            $IMAGE_NAME:$TAG-frontend
        ;;
    
    *)
        print_error "Unknown mode: $MODE"
        usage
        exit 1
        ;;
esac

if [ "$DETACHED" = true ]; then
    print_success "Containers started in detached mode"
    print_status "To view logs: $0 --logs"
    print_status "To check status: $0 --status"
    print_status "To stop: $0 --stop"
else
    print_success "Containers started"
fi

# Show access information
case $MODE in
    production)
        echo ""
        print_status "Application Access:"
        echo "  Frontend: http://localhost:$PORT_FRONTEND"
        echo "  Backend API: http://localhost:$PORT_BACKEND/api"
        echo "  Health Check: http://localhost:$PORT_BACKEND/health"
        ;;
    development)
        echo ""
        print_status "Development Access:"
        echo "  Frontend (Dev): http://localhost:5173"
        echo "  Backend API: http://localhost:$PORT_BACKEND/api"
        echo "  Health Check: http://localhost:$PORT_BACKEND/health"
        ;;
    backend-only)
        echo ""
        print_status "Backend Access:"
        echo "  API: http://localhost:$PORT_BACKEND/api"
        echo "  Health Check: http://localhost:$PORT_BACKEND/health"
        ;;
    frontend-only)
        echo ""
        print_status "Frontend Access:"
        echo "  Application: http://localhost:$PORT_FRONTEND"
        ;;
esac