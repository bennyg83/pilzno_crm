#!/bin/bash

# Pilzno Synagogue CRM - Quick Fix Script for Other System
# This script attempts to fix common issues automatically

set -e

echo "🔧 Pilzno Synagogue CRM - Quick Fix Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Starting quick fix process..."

# 1. Check and start Docker Desktop
print_status "1. Checking Docker Desktop..."
if ! docker info > /dev/null 2>&1; then
    print_warning "Docker Desktop is not running. Please start Docker Desktop first."
    print_status "Waiting for Docker Desktop to start..."
    echo "Please start Docker Desktop and wait for it to fully load, then press Enter to continue..."
    read -r
fi

# Wait for Docker to be ready
print_status "Waiting for Docker to be ready..."
for i in {1..30}; do
    if docker info > /dev/null 2>&1; then
        print_success "Docker is ready"
        break
    fi
    echo -n "."
    sleep 2
done

if ! docker info > /dev/null 2>&1; then
    print_error "Docker is still not ready. Please check Docker Desktop."
    exit 1
fi

# 2. Create environment files if missing
print_status "2. Checking environment files..."

if [ ! -f "frontend/.env" ]; then
    print_status "Creating frontend .env file..."
    cat > frontend/.env << EOF
VITE_API_URL=http://localhost:3002
VITE_APP_NAME=Pilzno Synagogue CRM
EOF
    print_success "Frontend .env created"
fi

if [ ! -f "backend/.env" ]; then
    print_status "Creating backend .env file..."
    cat > backend/.env << EOF
NODE_ENV=development
PORT=3002
DB_HOST=pilzno-synagogue-db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=pilzno2024
DB_NAME=pilzno_synagogue
JWT_SECRET=pilzno_synagogue_jwt_secret_2024
EOF
    print_success "Backend .env created"
fi

# 3. Install dependencies
print_status "3. Installing dependencies..."

if [ ! -d "frontend/node_modules" ]; then
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    print_success "Frontend dependencies installed"
fi

if [ ! -d "backend/node_modules" ]; then
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_success "Backend dependencies installed"
fi

# 4. Build applications
print_status "4. Building applications..."

if [ ! -d "frontend/dist" ]; then
    print_status "Building frontend..."
    cd frontend
    npm run build
    cd ..
    print_success "Frontend built"
fi

if [ ! -d "backend/dist" ]; then
    print_status "Building backend..."
    cd backend
    npm run build
    cd ..
    print_success "Backend built"
fi

# 5. Stop any existing services
print_status "5. Stopping existing services..."
docker --context desktop-linux compose down 2>/dev/null || true
print_success "Existing services stopped"

# 6. Start services
print_status "6. Starting services..."
docker --context desktop-linux compose up -d
print_success "Services started"

# 7. Wait for services to be ready
print_status "7. Waiting for services to be ready..."
sleep 30

# 8. Check service status
print_status "8. Checking service status..."
docker --context desktop-linux compose ps

# 9. Test connectivity
print_status "9. Testing connectivity..."

# Test frontend
if curl -s --connect-timeout 10 http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is accessible at http://localhost:3000"
else
    print_warning "Frontend is not accessible yet, may need more time to start"
fi

# Test backend
if curl -s --connect-timeout 10 http://localhost:3002/health > /dev/null 2>&1; then
    print_success "Backend is accessible at http://localhost:3002"
else
    print_warning "Backend is not accessible yet, may need more time to start"
fi

# 10. Show logs if there are issues
print_status "10. Checking for errors..."

FRONTEND_ERRORS=$(docker --context desktop-linux compose logs pilzno-synagogue-frontend --tail=10 | grep -i error | wc -l)
BACKEND_ERRORS=$(docker --context desktop-linux compose logs pilzno-synagogue-backend --tail=10 | grep -i error | wc -l)
DB_ERRORS=$(docker --context desktop-linux compose logs pilzno-synagogue-db --tail=10 | grep -i error | wc -l)

if [ "$FRONTEND_ERRORS" -gt 0 ]; then
    print_warning "Frontend has $FRONTEND_ERRORS errors. Recent logs:"
    docker --context desktop-linux compose logs pilzno-synagogue-frontend --tail=5
fi

if [ "$BACKEND_ERRORS" -gt 0 ]; then
    print_warning "Backend has $BACKEND_ERRORS errors. Recent logs:"
    docker --context desktop-linux compose logs pilzno-synagogue-backend --tail=5
fi

if [ "$DB_ERRORS" -gt 0 ]; then
    print_warning "Database has $DB_ERRORS errors. Recent logs:"
    docker --context desktop-linux compose logs pilzno-synagogue-db --tail=5
fi

# Final summary
echo ""
echo "🎉 Quick fix completed!"
echo "======================"
echo ""
echo "🌐 Try accessing your application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:3002"
echo ""
echo "📊 Service status:"
docker --context desktop-linux compose ps
echo ""
echo "📝 If you still have issues:"
echo "  1. Run: chmod +x scripts/debug-other-system.sh"
echo "  2. Run: ./scripts/debug-other-system.sh"
echo "  3. Share the debug report for further assistance"
echo ""
print_success "Quick fix process completed! 🚀"



