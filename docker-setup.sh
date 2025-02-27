#!/bin/bash
# Docker setup script for Prompt Injection Generator

echo "Starting Docker setup for Prompt Injection Generator..."

# Determine if we need to use sudo based on Docker daemon access
DOCKER_CMD="docker"
COMPOSE_CMD="docker-compose"

# Check if running docker requires sudo
if ! docker info &> /dev/null && sudo docker info &> /dev/null; then
    echo "Docker requires sudo privileges. Using sudo for all Docker commands."
    DOCKER_CMD="sudo docker"
    COMPOSE_CMD="sudo docker-compose"
fi

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! $DOCKER_CMD info &> /dev/null; then
    echo "Docker daemon is not running. Please start Docker."
    exit 1
fi

# Check for required directories and files
echo "Checking for required directories and files..."

# Check for markdown directories
if [ ! -d "backend/attack_intents" ] || [ ! -d "backend/attack_techniques" ] || [ ! -d "backend/attack_evasions" ]; then
    echo "❌ Missing one or more required markdown directories!"
    echo "Expected locations:"
    echo "  - backend/attack_intents"
    echo "  - backend/attack_techniques"
    echo "  - backend/attack_evasions"
    echo "Please ensure these directories exist and contain markdown files."
    exit 1
else
    echo "✅ All required markdown directories found."
    # Count MD files in each directory
    INTENTS_COUNT=$(find backend/attack_intents -name "*.md" | wc -l)
    TECHNIQUES_COUNT=$(find backend/attack_techniques -name "*.md" | wc -l)
    EVASIONS_COUNT=$(find backend/attack_evasions -name "*.md" | wc -l)
    echo "  - attack_intents: $INTENTS_COUNT markdown files"
    echo "  - attack_techniques: $TECHNIQUES_COUNT markdown files"
    echo "  - attack_evasions: $EVASIONS_COUNT markdown files"
    
    if [ $INTENTS_COUNT -eq 0 ] || [ $TECHNIQUES_COUNT -eq 0 ] || [ $EVASIONS_COUNT -eq 0 ]; then
        echo "❌ One or more directories have no markdown files! The API needs these files to function."
        exit 1
    fi
fi

# Check and fix go.mod file (crucial step)
echo "Checking go.mod file..."
if grep -q "go 1.23.3" backend/go.mod; then
    echo "Found invalid Go version in go.mod file. Fixing..."
    sed -i.bak 's/go 1.23.3/go 1.20/' backend/go.mod
    echo "✅ Fixed go.mod file - changed version from 1.23.3 to 1.20"
fi

# Fix potential permission issues with buildx
if [ -f "$HOME/.docker/buildx/current" ]; then
    echo "Fixing Docker buildx permissions..."
    chmod 644 $HOME/.docker/buildx/current 2>/dev/null || sudo chmod 644 $HOME/.docker/buildx/current 2>/dev/null
    chmod -R 755 $HOME/.docker/buildx 2>/dev/null || sudo chmod -R 755 $HOME/.docker/buildx 2>/dev/null
fi

# Try to pull required images manually to verify connectivity
echo "Attempting to pull required Docker images..."
$DOCKER_CMD pull golang:1.20 || {
    echo "Failed to pull golang:1.20 image. Trying to log in to Docker Hub..."
    $DOCKER_CMD login
    $DOCKER_CMD pull golang:1.20 || {
        echo "Still failed to pull the image. Please check your internet connection and Docker Hub access."
        exit 1
    }
}

$DOCKER_CMD pull node:18-alpine || {
    echo "Failed to pull node:18-alpine image. Please check your internet connection."
    exit 1
}

$DOCKER_CMD pull alpine:latest || {
    echo "Failed to pull alpine:latest image. Please check your internet connection."
    exit 1
}

echo "All required images pulled successfully."

# Reset Docker compose cache
echo "Resetting Docker Compose cache..."
$COMPOSE_CMD down 2>/dev/null
$COMPOSE_CMD rm -f 2>/dev/null

# Set UID/GID environment variables for proper permissions
export UID=$(id -u)
export GID=$(id -g)

# Try standard approach first
echo "Building and starting containers..."
if ! $COMPOSE_CMD up -d --build; then
    echo "Encountered issues with standard Docker setup. Trying the simplified approach..."
    
    # If standard approach fails, try the simplified approach
    if ! $COMPOSE_CMD -f docker-compose.simple.yml up -d --build; then
        echo -e "\n❌ Both standard and simplified Docker setups failed."
        echo "Let's try one more approach with explicit sudo:"
        
        sudo UID=$(id -u) GID=$(id -g) docker-compose down 2>/dev/null
        if ! sudo UID=$(id -u) GID=$(id -g) docker-compose up -d --build; then
            echo -e "\n❌ All Docker setup attempts failed."
            echo "Please check the logs for more details:"
            echo "  - Backend logs: $COMPOSE_CMD logs backend"
            echo "  - Frontend logs: $COMPOSE_CMD logs frontend"
            exit 1
        fi
    fi
fi

# Wait a moment for services to fully start
echo "Waiting for services to start..."
sleep 5

# Check if containers are running
if $COMPOSE_CMD ps | grep -q "Up"; then
    echo -e "\n✅ Setup completed successfully!"
    echo "Frontend is available at: http://localhost:9002"
    echo "Backend API is available at: http://localhost:9001"
    
    # Check if backend API is responding
    echo "Verifying backend API connectivity..."
    if curl -s http://localhost:9001/api/intents > /dev/null; then
        echo "✅ Backend API is responding correctly!"
    else
        echo "⚠️ Backend API may not be responding correctly. Check the backend logs:"
        echo "  $COMPOSE_CMD logs backend"
    fi
    
    echo "To view logs: $COMPOSE_CMD logs -f"
    echo "To stop: $COMPOSE_CMD down"
else
    echo -e "\n❌ Something went wrong. Containers are not running."
    echo "Please check the logs with: $COMPOSE_CMD logs"
    exit 1
fi 