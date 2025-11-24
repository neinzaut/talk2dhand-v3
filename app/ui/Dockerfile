# Use Node.js 20 LTS
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install additional libraries needed for onnxruntime
RUN apk add --no-cache \
    gcompat \
    libstdc++

COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED 1

# Build Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Install runtime libraries for onnxruntime
RUN apk add --no-cache \
    gcompat \
    libstdc++

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy prevent-ort script to block native ONNX bindings
COPY --chown=nextjs:nodejs prevent-ort.js ./prevent-ort.js

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Preload prevent-ort.js to stub ONNX modules before Next.js starts
ENV NODE_OPTIONS="--require /app/prevent-ort.js"

CMD ["node", "server.js"]

