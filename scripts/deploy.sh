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

# Clean up old unused docker images and build caches to free up disk space
echo "🧹 Deep cleaning unused docker images and build cache..."
docker image prune -af
docker builder prune -af

echo "Deployment completed successfully!"
