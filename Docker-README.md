# Prompt Injection Generator - Docker Setup

This project includes a Docker setup for running both the backend and frontend of the Prompt Injection Generator.

## Requirements

- Docker
- Docker Compose

## Getting Started

### Standard Setup (Two-Container Approach)

1. Clone this repository
2. Build and start the containers:

```bash
docker-compose up --build
```

3. Access the application:
   - Frontend: http://localhost:9002
   - Backend API: http://localhost:9001

### Alternative Setup (Single-Container Approach)

If you're experiencing issues with the standard setup, try the simplified approach:

1. Clone this repository
2. Build and start the single container:

```bash
docker-compose -f docker-compose.simple.yml up --build
```

3. Access the application:
   - Frontend: http://localhost:9002
   - Backend API: http://localhost:9001

### Helper Script

For convenience, a setup script is provided that handles common issues:

```bash
chmod +x docker-setup.sh
./docker-setup.sh
```

## Services

### Backend (Go)

- Runs on port 9001
- Provides APIs for intents, techniques, evasions, and prompt generation
- Built using Golang 1.22-alpine image

### Frontend (React)

- Runs on port 9002
- Provides a web interface for selecting prompt parameters and generating prompts
- Built using Node.js 18-alpine image

## Environment Variables

You can customize the application by modifying the following environment variables in the docker-compose.yml file:

- **Backend**:

  - `PORT`: The port on which the backend server runs (default: 9001)

- **Frontend**:
  - `REACT_APP_API_URL`: The URL where the backend API is accessible (default: http://backend:9001 inside the Docker network)

## Development

To make changes to the application:

1. Stop the running containers with `docker-compose down`
2. Make your changes to the code
3. Rebuild and start the containers with `docker-compose up --build`

## Troubleshooting

### Common Issues and Solutions

- **CORS Issues**:

  - The frontend is configured to connect to the backend using the Docker service name (`backend:9001`). This works within the Docker network.
  - When developing locally, you might need to update the `REACT_APP_API_URL` to point to `http://localhost:9001`.

- **Port Conflicts**:

  - If ports 9001 or 9002 are already in use on your system, you can change them in the docker-compose.yml file.
  - Modify the left side of the port mapping (e.g., change `"9001:9001"` to `"9003:9001"` to use port 9003 externally).

- **Docker Pull Errors**:

  - If you encounter issues pulling Docker images, ensure you have a stable internet connection.
  - Try to authenticate with Docker Hub using `docker login` if you're having credential issues.
  - If you're behind a corporate firewall or VPN, ensure they're not blocking Docker Hub connections.
  - Try running Docker without sudo: `docker-compose up --build` instead of `sudo docker-compose up --build`.
  - Check if Docker daemon is running: `docker info`.
  - Reset Docker credentials with: `docker logout` followed by `docker login`.
  - If persisting, try manually pulling the images first:
    ```bash
    docker pull golang:alpine
    docker pull node:18-alpine
    docker pull alpine:latest
    ```
  - Consider adding a registry-mirrors configuration if Docker Hub is slow in your region.

- **Container Startup Issues**:

  - Check container logs with `docker-compose logs [service_name]` (e.g., `docker-compose logs backend`).
  - Ensure all required directories and files exist in your project.

- **Frontend Not Connecting to Backend**:

  - Verify that both containers are running with `docker-compose ps`.
  - Check if the backend container is exposing its API correctly with `docker-compose logs backend`.
  - Ensure the `REACT_APP_API_URL` environment variable is correctly set in the docker-compose.yml file.

- **Permission Issues with Docker BuildX**:
  - If you encounter errors like `open /Users/<username>/.docker/buildx/current: permission denied`, this is typically a permission issue with the Docker buildx directory.
  - Fix with: `sudo chmod -R 755 ~/.docker/buildx`
  - If you've previously run Docker commands with sudo, you might need to continue using sudo for consistency.
  - Try using the updated docker-setup.sh script which handles these permission issues automatically.
  - Alternatively, you can manually fix permissions: `sudo chown -R $(whoami) ~/.docker`
