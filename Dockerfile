# Build stage
FROM node:20.15.1-alpine3.20 AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source files
COPY . .

# Runtime stage
FROM node:20.15.1-alpine3.20

WORKDIR /usr/src/app

# Copy built node modules and source code
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/api ./api
COPY --from=builder /usr/src/app/database ./database

# Create necessary directories
RUN mkdir -p /usr/src/app/config

# Expose the app port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "api/server.js"]
