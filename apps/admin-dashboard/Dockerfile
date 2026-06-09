# ── Monorepo-aware Dockerfile ─────────────────────────────
# Build context must be the repo root (see docker-compose.yml).
# ──────────────────────────────────────────────────────────

FROM node:22-slim AS development
WORKDIR /app
COPY package.json package-lock.json* turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/admin-dashboard/package.json ./apps/admin-dashboard/
COPY apps/lawyer-dashboard/package.json ./apps/lawyer-dashboard/
	COPY apps/landing/package.json ./apps/landing/
	RUN npm install --include=dev --include=optional \
		&& arch="$(node -p "process.arch")" \
		&& if [ "$arch" = "arm64" ]; then npm install --no-save lightningcss-linux-arm64-gnu@1.30.1; fi \
		&& if [ "$arch" = "x64" ]; then npm install --no-save lightningcss-linux-x64-gnu@1.30.1; fi \
		&& npm rebuild
COPY apps/admin-dashboard ./apps/admin-dashboard
WORKDIR /app/apps/admin-dashboard
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5079"]

FROM node:22-slim AS build
WORKDIR /app
ARG VITE_API_BASE_URL=http://localhost:8976/api
ARG VITE_SENTRY_DSN=
ARG VITE_SENTRY_ENVIRONMENT=production
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
ENV VITE_SENTRY_ENVIRONMENT=$VITE_SENTRY_ENVIRONMENT
COPY package.json package-lock.json* turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/admin-dashboard/package.json ./apps/admin-dashboard/
COPY apps/lawyer-dashboard/package.json ./apps/lawyer-dashboard/
	COPY apps/landing/package.json ./apps/landing/
	RUN npm ci --include=dev --include=optional \
		&& arch="$(node -p "process.arch")" \
		&& if [ "$arch" = "arm64" ]; then npm install --no-save --no-package-lock lightningcss-linux-arm64-gnu@1.30.1; fi \
		&& if [ "$arch" = "x64" ]; then npm install --no-save --no-package-lock lightningcss-linux-x64-gnu@1.30.1; fi
COPY apps/admin-dashboard ./apps/admin-dashboard
RUN npx vite build --filter=@mohamy/admin-dashboard 2>/dev/null || cd apps/admin-dashboard && npx vite build

FROM nginx:alpine AS production
COPY --from=build /app/apps/admin-dashboard/dist /usr/share/nginx/html
COPY apps/admin-dashboard/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
