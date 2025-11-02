#!/bin/bash

# Frontend Deployment Script for Pilzno Synagogue CRM
# This script ensures the correct build sequence to avoid Docker build context conflicts

set -e  # Exit on any error

echo "🚀 Starting frontend deployment with clean build sequence..."
echo ""

# Step 1: Stop all containers
echo "📦 Step 1: Stopping all Docker containers..."
docker --context desktop-linux compose down
echo "✅ Containers stopped successfully"
echo ""

# Step 2: Build frontend
echo "🔨 Step 2: Building frontend in clean environment..."
cd frontend
npm run build
echo "✅ Frontend build completed successfully"
cd ..
echo ""

# Step 3: Rebuild and start containers
echo "🐳 Step 3: Rebuilding and starting Docker containers..."
docker --context desktop-linux compose up -d --build
echo "✅ Containers started successfully"
echo ""

# Step 4: Verify deployment
echo "🔍 Step 4: Verifying deployment..."
sleep 5  # Wait for containers to fully start

# Check if containers are running
if docker --context desktop-linux compose ps | grep -q "Up"; then
    echo "✅ All containers are running"
else
    echo "❌ Some containers failed to start"
    docker --context desktop-linux compose ps
    exit 1
fi

# Check build timestamps
echo ""
echo "📅 Checking build timestamps..."
echo "Local build:"
ls -la frontend/dist/assets/ | head -3

echo ""
echo "Container build:"
docker --context desktop-linux compose exec pilzno-synagogue-frontend ls -la /usr/share/nginx/html/assets/ | head -3

echo ""
echo "🎉 Frontend deployment completed successfully!"
echo "🌐 Access your application at: http://localhost:3003"
echo ""
echo "💡 If you still see old code in the browser:"
echo "   - Hard refresh (Ctrl+F5 or Cmd+Shift+R)"
echo "   - Clear browser cache completely"
echo "   - Check browser console for new logs"
echo ""
echo "📚 For troubleshooting, see: BUILD_PROCESS_TROUBLESHOOTING.md"
