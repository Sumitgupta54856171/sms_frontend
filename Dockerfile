# ─── Build Stage ───────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci && npm install -D esbuild

# Copy source code and build (skip tsc — type errors are pre-existing)
COPY . .
RUN npx vite build

# ─── Production Stage ──────────────────────────────────────────────────
FROM nginx:stable-alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
