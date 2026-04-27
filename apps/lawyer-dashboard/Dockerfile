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
	    && npm rebuild
COPY apps/lawyer-dashboard ./apps/lawyer-dashboard
WORKDIR /app/apps/lawyer-dashboard
CMD ["npm", "run", "dev:docker"]

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
	RUN npm install --include=dev
COPY apps/lawyer-dashboard ./apps/lawyer-dashboard
RUN npm run build --workspace=@mohamy/lawyer-dashboard

FROM nginx:alpine AS production
COPY --from=build /app/apps/lawyer-dashboard/dist /usr/share/nginx/html
COPY apps/lawyer-dashboard/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
