# Docker Deployment

Containerized deployment of CodeNotify server using Docker and Docker Compose.

## Overview

Docker provides a consistent, isolated environment for running CodeNotify across different platforms. This guide covers single-container and multi-container deployments.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Basic Docker knowledge

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/codenotify.git
cd codenotify/Server
```

### 2. Create Environment File

```bash
cp .env.example .env.production
# Edit .env.production with your configuration
```

### 3. Build and Run

```bash
docker-compose up -d
```

## Dockerfile

### Production Dockerfile

Create `Dockerfile` in server directory:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy built application from builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

### Development Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
```

## Docker Compose

### Production Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:6
    container_name: codenotify-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USER:-admin}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD:-changeme}
      MONGO_INITDB_DATABASE: codenotify
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    ports:
      - "27017:27017"
    networks:
      - codenotify-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  # CodeNotify API
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: codenotify-api
    restart: unless-stopped
    env_file:
      - .env.production
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://${MONGO_USER:-codenotify}:${MONGO_PASSWORD:-changeme}@mongodb:27017/codenotify?authSource=codenotify
    ports:
      - "3000:3000"
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - codenotify-network
    volumes:
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Nginx Reverse Proxy (Optional)
  nginx:
    image: nginx:alpine
    container_name: codenotify-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    networks:
      - codenotify-network

volumes:
  mongodb_data:
    driver: local

networks:
  codenotify-network:
    driver: bridge
```

### Development Setup

Create `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: codenotify-mongodb-dev
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin
    ports:
      - "27017:27017"
    volumes:
      - mongodb_dev_data:/data/db

  api:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: codenotify-api-dev
    env_file:
      - .env.development
    environment:
      NODE_ENV: development
      MONGODB_URI: mongodb://admin:admin@mongodb:27017/codenotify?authSource=admin
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run start:dev

volumes:
  mongodb_dev_data:
```

## MongoDB Initialization

Create `mongo-init.js`:

```javascript
// Create application database
db = db.getSiblingDB('codenotify');

// Create application user
db.createUser({
  user: 'codenotify',
  pwd: 'changeme', // Change this in production
  roles: [
    {
      role: 'readWrite',
      db: 'codenotify'
    }
  ]
});

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'name'],
      properties: {
        email: { bsonType: 'string' },
        password: { bsonType: 'string' },
        name: { bsonType: 'string' }
      }
    }
  }
});

db.createCollection('contests');
db.createCollection('notifications');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.contests.createIndex({ platformId: 1, platform: 1 }, { unique: true });
db.contests.createIndex({ startTime: 1 });
db.contests.createIndex({ platform: 1, phase: 1 });

print('Database initialized successfully');
```

## Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:3000;
    }

    server {
        listen 80;
        server_name localhost;

        client_max_body_size 10M;

        location / {
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Health check endpoint
        location /health {
            access_log off;
            proxy_pass http://api;
        }
    }
}
```

## Environment Variables

Create `.env.production`:

```bash
# Application
NODE_ENV=production
PORT=3000

# Database
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=your-secure-root-password
MONGO_USER=codenotify
MONGO_PASSWORD=your-secure-app-password

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://yourdomain.com

# Email
RESEND_API_KEY=re_xxxxxxxxxxxx

# WhatsApp (Optional)
WHATSAPP_API_KEY=your-whatsapp-key
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
```

## Docker Commands

### Build and Start

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
```

### Management

```bash
# Stop services
docker-compose stop

# Restart services
docker-compose restart

# Remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Scale API service
docker-compose up -d --scale api=3
```

### Debugging

```bash
# Execute command in container
docker-compose exec api sh

# View container stats
docker stats

# Inspect container
docker inspect codenotify-api

# View container processes
docker-compose top
```

## Multi-Stage Build Optimization

### Optimized Dockerfile

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Production
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

## Docker Secrets

### Using Docker Secrets

```yaml
version: '3.8'

services:
  api:
    image: codenotify-api
    secrets:
      - jwt_secret
      - db_password
    environment:
      JWT_SECRET_FILE: /run/secrets/jwt_secret
      DB_PASSWORD_FILE: /run/secrets/db_password

secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  db_password:
    file: ./secrets/db_password.txt
```

## Health Checks

### Application Health Check

```typescript
// health.controller.ts
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }
}
```

### Docker Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
```

## Monitoring

### Prometheus Metrics

Add to `docker-compose.yml`:

```yaml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

## Backup and Restore

### Backup MongoDB

```bash
# Backup
docker-compose exec mongodb mongodump \
  --username admin \
  --password changeme \
  --authenticationDatabase admin \
  --out /data/backup

# Copy backup to host
docker cp codenotify-mongodb:/data/backup ./backup
```

### Restore MongoDB

```bash
# Copy backup to container
docker cp ./backup codenotify-mongodb:/data/restore

# Restore
docker-compose exec mongodb mongorestore \
  --username admin \
  --password changeme \
  --authenticationDatabase admin \
  /data/restore
```

## Production Deployment

### 1. Build Production Image

```bash
docker build -t codenotify-api:latest .
```

### 2. Tag Image

```bash
docker tag codenotify-api:latest registry.example.com/codenotify-api:v1.0.0
```

### 3. Push to Registry

```bash
docker push registry.example.com/codenotify-api:v1.0.0
```

### 4. Deploy

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Container won't start | Check logs with `docker-compose logs` |
| Port already in use | Change port mapping in docker-compose.yml |
| MongoDB connection failed | Verify MONGODB_URI and network |
| Permission denied | Check file permissions and user |
| Out of memory | Increase Docker memory limit |

### Debug Mode

```bash
# Run with debug output
docker-compose up

# Attach to running container
docker attach codenotify-api

# Execute shell in container
docker-compose exec api sh
```

## Security Best Practices

1. **Use Non-Root User**: Always run as non-root user
2. **Scan Images**: Use `docker scan` to check for vulnerabilities
3. **Minimal Base Image**: Use Alpine Linux for smaller attack surface
4. **Secrets Management**: Use Docker secrets or environment files
5. **Network Isolation**: Use custom networks
6. **Read-Only Filesystem**: Mount volumes as read-only where possible
7. **Resource Limits**: Set memory and CPU limits

## Related Documentation

- [Deployment Guide](/server/deployment)
- [System Architecture](/server/architecture)
- [Environment Configuration](/guide/configuration)
- [Database Setup](/server/database)
