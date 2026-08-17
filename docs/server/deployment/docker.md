# Docker & GHCR Deployment

Containerized deployment of CodeNotify Server using **Bun**, **Docker**, **Docker Compose**, and **GitHub Container Registry (GHCR)**.

## Overview

CodeNotify Server is packaged into an optimized, multi-stage Alpine Linux image using the native **Bun** runtime. It runs with non-root security privileges on port `3999` and is published automatically to GHCR via GitHub Actions.

## Prerequisites

- Docker 24+ & Docker Compose v2+
- GitHub Container Registry access (for prebuilt images) or local Docker build environment

## Quick Start (with Docker Compose)

### 1. Navigate to Server Directory
```bash
cd server
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, and bot credentials
```

### 3. Start Container
```bash
# Pull and start the pre-built GHCR image (or build locally)
docker compose up -d

# View logs
docker compose logs -f

# Check health status
docker compose ps
```

---

## Production Multi-Stage Dockerfile

CodeNotify uses a 3-stage `Dockerfile` to produce a minimal, secure production image:

```dockerfile
# ==============================================================================
# Stage 1: Build & Verification Stage
# ==============================================================================
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package.json bun.lock ./

# Install all dependencies (including devDependencies for build verification)
RUN bun install --frozen-lockfile

# Copy source code and TypeScript config files
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src

# Run build verification
RUN bun run build

# ==============================================================================
# Stage 2: Production Dependencies Stage
# ==============================================================================
FROM oven/bun:1-alpine AS deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

# ==============================================================================
# Stage 3: Minimal Production Runtime
# ==============================================================================
FROM oven/bun:1-alpine AS runner

WORKDIR /app

# Set production environment defaults
ENV NODE_ENV=production \
    PORT=3999

# Copy production dependencies and source files with non-root ownership
COPY --from=deps --chown=bun:bun /app/node_modules ./node_modules
COPY --from=builder --chown=bun:bun /app/package.json ./package.json
COPY --from=builder --chown=bun:bun /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=bun:bun /app/src ./src

# Use the non-root bun user (UID/GID 1000)
USER bun

# Expose the configured production port
EXPOSE 3999

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD bun -e "fetch('http://localhost:3999/health').then(r => {if (r.status !== 200) process.exit(1)}).catch(() => process.exit(1))"

# Start production server
CMD ["bun", "src/main.ts"]
```

---

## Production `docker-compose.yml`

Located at `server/docker-compose.yml`:

```yaml
name: codenotify-server

services:
  server:
    build:
      context: .
      dockerfile: Dockerfile
    image: ghcr.io/${GHCR_REPO_OWNER:-celestial-0}/codenotify-server:${IMAGE_TAG:-latest}
    container_name: codenotify-server
    restart: unless-stopped
    ports:
      - "${PORT:-3999}:3999"
    env_file:
      - .env
    environment:
      - PORT=3999
      - NODE_ENV=production
    healthcheck:
      test:
        [
          "CMD",
          "bun",
          "-e",
          "fetch('http://localhost:3999/health').then(r => {if (r.status !== 200) process.exit(1)}).catch(() => process.exit(1))",
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s
    networks:
      - codenotify
    labels:
      - "app=codenotify"
      - "component=server"
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  codenotify:
    driver: bridge
```

---

## GitHub Actions CI/CD Pipeline

The workflow `.github/workflows/docker-publish.yml` automatically builds and pushes multi-stage images to GitHub Container Registry upon push to `main` and semver tags (`v*.*.*`):

- **Image URL**: `ghcr.io/celestial-0/codenotify-server:latest`
- **Cache**: GitHub Actions Cache backend (`type=gha,scope=codenotify-build`)
- **Tags Generated**: `latest`, `v1.0.0`, `1.0`, `1`, `sha-<short>`

---

## Coolify Deployment

1. In Coolify, create a **New Resource** &rarr; **Docker Image**.
2. **Image**: `ghcr.io/celestial-0/codenotify-server:latest`
3. **Port**: `3999`
4. **Healthcheck Path**: `/health`
5. Add required environment variables from `.env`.
