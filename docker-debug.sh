#!/bin/bash
# Docker debugging script

echo "Docker Container Debugging Tool"
echo "==============================="

# Check Docker status
echo "1. Docker Status:"
if docker info &> /dev/null; then
    echo "✅ Docker is running"
else
    echo "❌ Docker is not running or you don't have permission"
    exit 1
fi

# List running containers
echo -e "\n2. Running Containers:"
docker ps
if [ $? -ne 0 ]; then
    echo "❌ Failed to list containers - permission issue?"
    exit 1
fi

# Check if our containers are running
echo -e "\n3. Checking for our application containers:"
if docker ps | grep -q "backend"; then
    echo "✅ Backend container is running"
    BACKEND_CONTAINER=$(docker ps | grep "backend" | awk '{print $1}')
    BACKEND_UPTIME=$(docker inspect --format='{{.State.StartedAt}}' $BACKEND_CONTAINER)
    echo "   Started at: $BACKEND_UPTIME"
else
    echo "❌ Backend container is not running"
fi

if docker ps | grep -q "frontend"; then
    echo "✅ Frontend container is running"
    FRONTEND_CONTAINER=$(docker ps | grep "frontend" | awk '{print $1}')
    FRONTEND_UPTIME=$(docker inspect --format='{{.State.StartedAt}}' $FRONTEND_CONTAINER)
    echo "   Started at: $FRONTEND_UPTIME"
    
    # Check if frontend is potentially starting before backend
    if [[ $FRONTEND_UPTIME < $BACKEND_UPTIME ]]; then
        echo "⚠️ WARNING: Frontend container appears to have started BEFORE backend container! This can cause API connection failures."
    fi
else
    echo "❌ Frontend container is not running"
fi

# Check for the simplified setup container
if docker ps | grep -q "arc_pi_taxonomy"; then
    echo "✅ Combined app container is running"
    APP_CONTAINER=$(docker ps | grep "arc_pi_taxonomy" | awk '{print $1}')
    APP_UPTIME=$(docker inspect --format='{{.State.StartedAt}}' $APP_CONTAINER)
    echo "   Started at: $APP_UPTIME"
fi

# Test backend API availability
echo -e "\n4. Testing backend API availability:"
if curl -s http://localhost:9001/api/intents > /dev/null; then
    echo "✅ Backend API is available at http://localhost:9001/api/intents"
    
    # Get response time
    RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}\n" http://localhost:9001/api/intents)
    echo "   Response time: ${RESPONSE_TIME}s"
    
    # Check if response contains data
    RESPONSE_SIZE=$(curl -s http://localhost:9001/api/intents | wc -c)
    echo "   Response size: $RESPONSE_SIZE bytes"
    
    if [ $RESPONSE_SIZE -lt 10 ]; then
        echo "⚠️ WARNING: API response seems very small, might indicate missing data"
    fi
else
    echo "❌ Backend API is NOT available at http://localhost:9001/api/intents"
    echo "   This indicates the backend is not fully operational!"
fi

# Inspect volume mounts
echo -e "\n5. Checking volume mounts for backend container:"
if docker ps | grep -q "backend"; then
    CONTAINER_ID=$(docker ps | grep "backend" | awk '{print $1}')
    echo "Container ID: $CONTAINER_ID"
    docker inspect $CONTAINER_ID | grep -A 10 "Mounts"
    
    # Check for markdown files inside container
    echo -e "\n6. Checking for markdown files inside backend container:"
    docker exec $CONTAINER_ID ls -la /app/attack_intents || echo "❌ Could not list files in /app/attack_intents"
    MARKDOWN_COUNT=$(docker exec $CONTAINER_ID find /app/attack_intents -name "*.md" | wc -l)
    echo "Number of markdown files in attack_intents: $MARKDOWN_COUNT"
    
    # Check API endpoints
    echo -e "\n7. Testing backend API endpoints:"
    echo "Testing /api/intents endpoint:"
    docker exec $CONTAINER_ID curl -s http://localhost:9001/api/intents || echo "❌ Could not access /api/intents"
else
    echo "❌ Backend container not running - can't check volumes or files"
fi

# Check logs
echo -e "\n8. Backend container logs (last 20 lines):"
if docker ps | grep -q "backend"; then
    docker logs $(docker ps | grep "backend" | awk '{print $1}') --tail 20
else
    echo "❌ Backend container not running - no logs to show"
fi

echo -e "\n9. Frontend container logs (last 20 lines):"
if docker ps | grep -q "frontend"; then
    docker logs $(docker ps | grep "frontend" | awk '{print $1}') --tail 20
else
    echo "❌ Frontend container not running - no logs to show"
fi

echo -e "\n10. Checking for network-related issues:"
if docker ps | grep -q "backend" && docker ps | grep -q "frontend"; then
    # Check if backend is exposing its port properly
    BACKEND_PORTS=$(docker port $(docker ps | grep "backend" | awk '{print $1}'))
    echo "Backend port mapping: $BACKEND_PORTS"
    
    # Get frontend network settings
    FRONTEND_NETWORK=$(docker inspect --format='{{json .NetworkSettings.Networks}}' $(docker ps | grep "frontend" | awk '{print $1}'))
    echo "Frontend network settings: $FRONTEND_NETWORK"
    
    # Check DNS resolution from frontend to backend
    echo "Testing DNS resolution from frontend to backend:"
    docker exec $(docker ps | grep "frontend" | awk '{print $1}') ping -c 1 backend || echo "❌ Frontend cannot resolve backend hostname"
fi

echo -e "\nDebugging complete. If you identified issues, try:"
echo "1. Fix any file or volume issues"
echo "2. Run 'docker-compose down' to clean up"
echo "3. Run './docker-setup.sh' to rebuild and start"
echo ""
echo "If the frontend is starting before the backend is ready, the solution has been implemented:"
echo "1. docker-compose.yml has been updated with healthchecks"
echo "2. Dockerfile.simple has been updated with a wait script"
echo "Please rebuild and restart the containers to apply these changes." 