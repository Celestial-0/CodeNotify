# Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package and lock files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-alpine

WORKDIR /app

# Copy package and lock files
COPY package.json bun.lockb* ./

# Install production dependencies only
RUN bun install --production --frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy environment files (.env if it exists)
RUN true
COPY .env* ./

# Use the non-root bun user from the official image
USER bun

# Expose port
EXPOSE 4010

# Health check using bun to fetch
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD bun -e "fetch('http://localhost:4010/health').then(r => {if (r.status !== 200) throw r.status})"

# Start the application
CMD ["bun", "run", "dist/main.js"]
