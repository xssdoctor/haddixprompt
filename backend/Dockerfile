FROM golang:1.20 AS builder

WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code
COPY *.go ./

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o backend

# Create a minimal image for the final build
FROM alpine:latest

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/backend .

# Create directories for markdown files
RUN mkdir -p attack_evasions attack_intents attack_techniques

# Copy markdown files directories from the build context
COPY attack_evasions/ ./attack_evasions/
COPY attack_intents/ ./attack_intents/
COPY attack_techniques/ ./attack_techniques/

# Print directory contents for debugging
RUN ls -la && ls -la attack_intents

# Expose port 9001
EXPOSE 9001

# Run the app
CMD ["./backend"] 