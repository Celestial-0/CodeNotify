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
