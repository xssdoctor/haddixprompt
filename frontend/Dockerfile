FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Create a file to inject environment variables at runtime
RUN echo "window.RUNTIME_ENV = { REACT_APP_API_URL: \"\" };" > /app/public/env-config.js

# Create the entrypoint script directly
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'sed -i "s|window.RUNTIME_ENV = { REACT_APP_API_URL: \"\" };|window.RUNTIME_ENV = { REACT_APP_API_URL: \"$REACT_APP_API_URL\" };|g" /app/public/env-config.js' >> /app/entrypoint.sh && \
    echo 'exec "$@"' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Set correct permissions for the app directory
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose port 3000 (React default)
EXPOSE 3000

# Use entrypoint script to inject environment variables
ENTRYPOINT ["/app/entrypoint.sh"]

# Run the development server
CMD ["npm", "start"] 