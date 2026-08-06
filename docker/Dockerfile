# ============================================
# Build stage
# ============================================
FROM node:22-alpine AS build

WORKDIR /app

# Install deps first for better layer caching
COPY package.json package-lock.json* .npmrc ./
RUN npm ci --legacy-peer-deps && npm cache clean --force

# Copy source and build
COPY . .
RUN npm run build

# ============================================
# Production stage
# ============================================
FROM node:22-alpine AS production

# Install dumb-init for proper PID 1 signal handling
RUN apk --no-cache add dumb-init curl && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nuxt && \
    adduser --system --uid 1001 nuxt

# Copy build output
COPY --from=build --chown=nuxt:nuxt /app/.output /app/.output

# Switch to non-root user
USER nuxt

# Runtime configuration
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", ".output/server/index.mjs"]
