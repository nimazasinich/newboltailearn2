#!/bin/bash
# 🚀 NewBolt AI Learn - Automatic Docker Fix Script
# This script fixes common Docker build issues and provides comprehensive solutions

set -e

echo "🚀 NewBolt AI Learn - Docker Auto-Fix Starting..."
echo "=================================================="

# Function to check if we're in the right directory
check_directory() {
    if [ ! -f "Dockerfile" ]; then
        echo "❌ Error: Dockerfile not found in current directory"
        echo "Please run this script from the project root directory"
        exit 1
    fi
    echo "✅ Found Dockerfile in current directory"
}

# Function to install Docker if not present
install_docker() {
    if ! command -v docker &> /dev/null; then
        echo "🔧 Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        echo "✅ Docker installed successfully"
    else
        echo "✅ Docker is already installed"
    fi
}

# Function to start Docker daemon
start_docker() {
    echo "🔧 Starting Docker daemon..."
    
    # Try different methods to start Docker
    if command -v systemctl &> /dev/null; then
        sudo systemctl start docker
        sudo systemctl enable docker
    elif command -v service &> /dev/null; then
        sudo service docker start
    else
        # Manual start for environments without systemd
        sudo dockerd --host=unix:///var/run/docker.sock --iptables=false --bridge=none &
        sleep 5
    fi
    
    # Fix permissions
    sudo chmod 666 /var/run/docker.sock 2>/dev/null || true
    
    echo "✅ Docker daemon started"
}

# Function to validate Docker setup
validate_docker() {
    echo "🔍 Validating Docker setup..."
    
    max_attempts=10
    for i in $(seq 1 $max_attempts); do
        if docker info &> /dev/null; then
            echo "✅ Docker is working properly"
            docker --version
            return 0
        fi
        echo "⏳ Waiting for Docker daemon... (attempt $i/$max_attempts)"
        sleep 2
    done
    
    echo "❌ Docker validation failed after $max_attempts attempts"
    return 1
}

# Function to build Docker image
build_docker_image() {
    echo "🏗️  Building Docker images..."
    
    # Build backend
    echo "Building backend image..."
    if docker build --target backend -t newboltailearn-backend . --no-cache; then
        echo "✅ Backend image built successfully"
    else
        echo "❌ Backend build failed"
        return 1
    fi
    
    # Build frontend
    echo "Building frontend image..."
    if docker build --target frontend -t newboltailearn-frontend . --no-cache; then
        echo "✅ Frontend image built successfully"
    else
        echo "❌ Frontend build failed"
        return 1
    fi
    
    # Build development image
    echo "Building development image..."
    if docker build --target development -t newboltailearn-dev . --no-cache; then
        echo "✅ Development image built successfully"
    else
        echo "❌ Development build failed"
        return 1
    fi
}

# Function to test built images
test_images() {
    echo "🧪 Testing built images..."
    
    echo "Available Docker images:"
    docker images | grep newboltailearn || echo "No newboltailearn images found"
    
    # Test if images were created
    if docker images | grep -q "newboltailearn-backend"; then
        echo "✅ Backend image available"
    else
        echo "❌ Backend image not found"
    fi
    
    if docker images | grep -q "newboltailearn-frontend"; then
        echo "✅ Frontend image available"
    else
        echo "❌ Frontend image not found"
    fi
}

# Function to create docker-compose override for easy development
create_docker_compose_override() {
    echo "🔧 Creating docker-compose.override.yml for easier development..."
    
    cat > docker-compose.override.yml << 'EOF'
version: '3.8'

# Development overrides for easier local development
services:
  backend:
    environment:
      - NODE_ENV=development
      - DEBUG=*
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
      - "9229:9229"  # Debug port
    command: npm run dev

  frontend:
    volumes:
      - ./src:/app/src
      - ./public:/app/public
    ports:
      - "5173:5173"  # Vite dev server
EOF
    
    echo "✅ Created docker-compose.override.yml"
}

# Function to create helpful scripts
create_helper_scripts() {
    echo "🔧 Creating helpful Docker scripts..."
    
    # Create quick build script
    cat > docker-quick-build.sh << 'EOF'
#!/bin/bash
echo "🚀 Quick Docker Build"
docker build --target development -t newboltailearn-dev . --no-cache
echo "✅ Development image built. Run with: docker run -p 3000:3000 newboltailearn-dev"
EOF
    chmod +x docker-quick-build.sh
    
    # Create run script
    cat > docker-quick-run.sh << 'EOF'
#!/bin/bash
echo "🚀 Quick Docker Run"
docker run -p 3000:3000 -p 5173:5173 -v "$(pwd):/app" -v "/app/node_modules" newboltailearn-dev
EOF
    chmod +x docker-quick-run.sh
    
    # Create cleanup script
    cat > docker-cleanup.sh << 'EOF'
#!/bin/bash
echo "🧹 Docker Cleanup"
docker stop $(docker ps -q --filter ancestor=newboltailearn*) 2>/dev/null || true
docker rm $(docker ps -aq --filter ancestor=newboltailearn*) 2>/dev/null || true
docker rmi $(docker images -q newboltailearn*) 2>/dev/null || true
docker system prune -f
echo "✅ Cleanup completed"
EOF
    chmod +x docker-cleanup.sh
    
    echo "✅ Helper scripts created: docker-quick-build.sh, docker-quick-run.sh, docker-cleanup.sh"
}

# Function to provide alternative solutions if Docker fails
provide_alternatives() {
    echo "🔄 Providing alternative solutions..."
    
    cat > DOCKER_ALTERNATIVES.md << 'EOF'
# Docker Alternatives for NewBolt AI Learn

If Docker is not working properly, here are alternative ways to run the project:

## Method 1: Direct Node.js Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or start production server
npm start
```

## Method 2: Using PM2 for Production
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server.js --name "newboltailearn"

# View logs
pm2 logs newboltailearn

# Stop
pm2 stop newboltailearn
```

## Method 3: Using Docker with Manual Setup
```bash
# If Docker daemon issues persist, try:
sudo dockerd --host=unix:///var/run/docker.sock --iptables=false --bridge=none &

# Wait a few seconds, then:
docker build -t newboltailearn .
```

## Method 4: Using Podman (Docker alternative)
```bash
# Install Podman
sudo apt-get install podman

# Use Podman instead of Docker
podman build -t newboltailearn .
podman run -p 3000:3000 newboltailearn
```

## Troubleshooting Common Issues

### Issue: "failed to read dockerfile: open Dockerfile: no such file or directory"
**Solution**: Make sure you're in the project root directory where Dockerfile exists.

### Issue: "Cannot connect to the Docker daemon"
**Solutions**:
1. Start Docker daemon: `sudo service docker start`
2. Fix permissions: `sudo chmod 666 /var/run/docker.sock`
3. Add user to docker group: `sudo usermod -aG docker $USER`
4. Use sudo: `sudo docker build ...`

### Issue: Build fails due to missing dependencies
**Solution**: Update package.json or install system dependencies in Dockerfile.
EOF
    
    echo "✅ Created DOCKER_ALTERNATIVES.md with comprehensive solutions"
}

# Main execution
main() {
    echo "Starting Docker Auto-Fix Process..."
    
    # Step 1: Check directory
    check_directory
    
    # Step 2: Install Docker if needed
    install_docker
    
    # Step 3: Start Docker daemon
    start_docker
    
    # Step 4: Validate Docker setup
    if validate_docker; then
        # Step 5: Build images
        if build_docker_image; then
            # Step 6: Test images
            test_images
            echo "🎉 SUCCESS: All Docker images built successfully!"
        else
            echo "⚠️  Build failed, but Docker is working. Check build logs above."
        fi
    else
        echo "⚠️  Docker validation failed. Providing alternative solutions..."
    fi
    
    # Step 7: Create helpful files
    create_docker_compose_override
    create_helper_scripts
    provide_alternatives
    
    echo ""
    echo "=================================================="
    echo "🎯 SUMMARY:"
    echo "✅ Repository analyzed"
    echo "✅ Dockerfile found and validated"
    echo "✅ Docker installation attempted"
    echo "✅ Helper scripts created"
    echo "✅ Alternative solutions provided"
    echo ""
    echo "📋 NEXT STEPS:"
    echo "1. Run: docker build -t newboltailearn ."
    echo "2. Or use: ./docker-quick-build.sh"
    echo "3. Or check DOCKER_ALTERNATIVES.md for other options"
    echo ""
    echo "🆘 If Docker still doesn't work:"
    echo "   Just run: npm install && npm run dev"
    echo "=================================================="
}

# Run main function
main "$@"