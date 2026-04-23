# =============================================================================
# Stage 1 — Builder (Vite production build)
# =============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# VITE_API_URL is baked into the bundle at build time.
# Default "/api/v1" is a relative URL — nginx in the runtime stage
# reverse-proxies /api/ to the backend, so there's no CORS and the
# frontend works on any host without rebuild.
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html ./
COPY public ./public
COPY src ./src

RUN npm run build

# =============================================================================
# Stage 2 — Runner (nginx serves the static bundle)
# =============================================================================
FROM nginx:1.27-alpine AS runner

# Remove default nginx site and drop our config
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static bundle
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Basic healthcheck — nginx serves index.html
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
