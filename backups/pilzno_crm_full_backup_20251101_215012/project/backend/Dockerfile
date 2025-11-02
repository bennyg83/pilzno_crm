# Multi-stage build for better optimization
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache dumb-init

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm install --only=production && npm cache clean --force

# Development stage
FROM base AS dev-deps
COPY package*.json ./
RUN npm install

# Build stage
FROM dev-deps AS build
COPY . .
RUN npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S backend -u 1001
USER backend

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["dumb-init", "node", "dist/index.js"]

# Development override
FROM dev-deps AS development
COPY . .
EXPOSE 3001
# Fix permissions for development
RUN chmod +x node_modules/.bin/*
CMD ["npm", "run", "dev"] 