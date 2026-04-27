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

# Optional: Clean up old docker images
docker image prune -f

echo "Deployment completed successfully!"
