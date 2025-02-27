#!/bin/bash
# Script to fix Docker permission issues

echo "Fixing Docker permission issues..."

# Create Docker directory if it doesn't exist
mkdir -p ~/.docker 2>/dev/null || sudo mkdir -p ~/.docker

# Fix permissions for all Docker-related directories
echo "Fixing docker config directory permissions..."
sudo chown -R $(whoami) ~/.docker 2>/dev/null || true

# Fix buildx permissions specifically 
if [ -d ~/.docker/buildx ]; then
    echo "Fixing buildx permissions..."
    sudo chmod -R 755 ~/.docker/buildx 2>/dev/null || true
    
    if [ -f ~/.docker/buildx/current ]; then
        sudo chmod 644 ~/.docker/buildx/current 2>/dev/null || true
    fi
fi

# Fix Docker Desktop context if it exists
if [ -d ~/Library/Containers/com.docker.docker ]; then
    echo "Fixing Docker Desktop permissions..."
    sudo chown -R $(whoami) ~/Library/Containers/com.docker.docker 2>/dev/null || true
fi

echo "Permissions fixed. You should now be able to run Docker commands without sudo."
echo "Try running: docker-compose up --build"
echo ""
echo "If you still encounter issues, run: sudo docker-compose up --build" 