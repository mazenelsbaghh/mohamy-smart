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
COPY apps/landing ./apps/landing
WORKDIR /app/apps/landing
CMD ["npm", "run", "dev"]

FROM node:22-slim AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_BASE_URL=https://localhost:8976/api
ARG NEXT_PUBLIC_DASHBOARD_URL=https://localhost:5078
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_DASHBOARD_URL=$NEXT_PUBLIC_DASHBOARD_URL
COPY package.json package-lock.json* turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/admin-dashboard/package.json ./apps/admin-dashboard/
COPY apps/lawyer-dashboard/package.json ./apps/lawyer-dashboard/
	COPY apps/landing/package.json ./apps/landing/
	RUN rm -rf node_modules package-lock.json \
		&& npm install --include=optional \
		&& arch="$(node -p "process.arch")" \
		&& if [ "$arch" = "arm64" ]; then npm install --no-save lightningcss-linux-arm64-gnu@1.30.1; fi \
		&& if [ "$arch" = "x64" ]; then npm install --no-save lightningcss-linux-x64-gnu@1.30.1; fi
COPY apps/landing ./apps/landing
RUN npm run build --workspace=@mohamy/landing

FROM nginx:alpine AS production
COPY --from=build /app/apps/landing/out /usr/share/nginx/html
COPY apps/landing/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
