#!/bin/bash
set -e

echo "Starting deployment..."

# Navigate to application directory
cd /opt/mohamy-smart

# Pull latest changes
git reset --hard
git pull origin main

# Restart the production stack with the latest changes
docker compose --env-file .env.docker.prod -f docker-compose.prod.yml up -d --build

# Clean up stale Docker data without discarding fresh build cache on every deploy.
echo "🧹 Cleaning stale docker images and build cache..."
docker image prune -f --filter "until=168h"
docker builder prune -f --filter "until=168h"

echo "Deployment completed successfully!"
