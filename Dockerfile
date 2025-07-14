# Build stage
FROM node:20.15.1-alpine3.20@sha256:7e1c8e7f6d4b1c7e1b2a4e6d7e1c8e7f6d4b1c7e1b2a4e6d7e1c8e7f6d4b1c7e AS builder

# Update and upgrade system packages
RUN apk update && apk upgrade --no-cache

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies with audit and fund disabled for CI
RUN npm ci --only=production --no-audit --no-fund

# Copy source files
COPY . .

# Runtime stage
FROM node:20.15.1-alpine3.20

# Update and upgrade system packages
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache sqlite tzdata && \
    rm -rf /var/cache/apk/* /tmp/*

WORKDIR /usr/src/app

# Create necessary directories with proper permissions
RUN mkdir -p /usr/src/app/database && \
    chown -R node:node /usr/src/app

# Copy built node modules and source code
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/api ./api
COPY --from=builder /usr/src/app/database/init.sql ./database/init.sql
COPY --from=builder /usr/src/app/config ./config

# Set proper permissions
RUN chown -R node:node /usr/src/app/database && \
    chmod 755 /usr/src/app/database

# Run as non-root user
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { if (res.statusCode !== 200) throw new Error() }).on('error', () => process.exit(1))"

# Expose the app port
EXPOSE 3000

# Command to run the application
CMD ["node", "api/server.js"]
