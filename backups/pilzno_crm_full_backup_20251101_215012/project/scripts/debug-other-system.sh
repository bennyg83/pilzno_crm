#!/bin/bash

# Pilzno Synagogue CRM - Debug Script for Other System
# This script helps diagnose issues on the target system

set -e

echo "🔍 Pilzno Synagogue CRM - System Debug Script"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

print_debug() {
    echo -e "${CYAN}[DEBUG]${NC} $1"
}

# Create debug report file
DEBUG_REPORT="debug_report_$(date +%Y%m%d_%H%M%S).txt"
echo "Creating debug report: $DEBUG_REPORT"

# Function to log debug information
log_debug() {
    echo "$1" | tee -a "$DEBUG_REPORT"
}

log_debug "Pilzno Synagogue CRM - Debug Report"
log_debug "===================================="
log_debug "Date: $(date)"
log_debug "System: $(hostname)"
log_debug "User: $(whoami)"
log_debug ""

# 1. System Information
print_status "1. Collecting system information..."
log_debug "=== SYSTEM INFORMATION ==="
log_debug "OS: $(uname -a)"
log_debug "Node.js: $(node --version 2>/dev/null || echo 'NOT INSTALLED')"
log_debug "npm: $(npm --version 2>/dev/null || echo 'NOT INSTALLED')"
log_debug "Docker: $(docker --version 2>/dev/null || echo 'NOT INSTALLED')"
log_debug "Docker Compose: $(docker-compose --version 2>/dev/null || echo 'NOT INSTALLED')"
log_debug "Git: $(git --version 2>/dev/null || echo 'NOT INSTALLED')"
log_debug ""

# 2. Check if we're in the right directory
print_status "2. Checking project directory..."
if [ -f "docker-compose.yml" ]; then
    print_success "Found docker-compose.yml - in correct directory"
    log_debug "Current directory: $(pwd)"
    log_debug "Directory contents:"
    ls -la | head -20 | while read line; do log_debug "  $line"; done
else
    print_error "docker-compose.yml not found - wrong directory"
    log_debug "Current directory: $(pwd)"
    log_debug "Directory contents:"
    ls -la | while read line; do log_debug "  $line"; done
    exit 1
fi
log_debug ""

# 3. Check Docker Desktop status
print_status "3. Checking Docker Desktop status..."
if docker info > /dev/null 2>&1; then
    print_success "Docker Desktop is running"
    log_debug "Docker info:"
    docker info | head -20 | while read line; do log_debug "  $line"; done
else
    print_error "Docker Desktop is not running or not accessible"
    log_debug "Docker info error:"
    docker info 2>&1 | while read line; do log_debug "  $line"; done
fi
log_debug ""

# 4. Check Docker Compose services
print_status "4. Checking Docker Compose services..."
log_debug "=== DOCKER COMPOSE STATUS ==="
docker --context desktop-linux compose ps | while read line; do log_debug "  $line"; done
log_debug ""

# 5. Check service logs
print_status "5. Checking service logs..."
log_debug "=== FRONTEND LOGS ==="
docker --context desktop-linux compose logs pilzno-synagogue-frontend --tail=20 | while read line; do log_debug "  $line"; done
log_debug ""

log_debug "=== BACKEND LOGS ==="
docker --context desktop-linux compose logs pilzno-synagogue-backend --tail=20 | while read line; do log_debug "  $line"; done
log_debug ""

log_debug "=== DATABASE LOGS ==="
docker --context desktop-linux compose logs pilzno-synagogue-db --tail=20 | while read line; do log_debug "  $line"; done
log_debug ""

# 6. Check network connectivity
print_status "6. Checking network connectivity..."
log_debug "=== NETWORK CONNECTIVITY ==="

# Check if ports are accessible
for port in 3000 3002 5432; do
    if netstat -ano | grep -q ":$port "; then
        print_success "Port $port is in use"
        log_debug "Port $port usage:"
        netstat -ano | grep ":$port " | while read line; do log_debug "  $line"; done
    else
        print_warning "Port $port is not in use"
    fi
done
log_debug ""

# 7. Check if services are accessible
print_status "7. Checking service accessibility..."
log_debug "=== SERVICE ACCESSIBILITY ==="

# Check frontend
if curl -s --connect-timeout 5 http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is accessible at http://localhost:3000"
    log_debug "Frontend response: OK"
else
    print_error "Frontend is not accessible at http://localhost:3000"
    log_debug "Frontend curl error:"
    curl -s --connect-timeout 5 http://localhost:3000 2>&1 | while read line; do log_debug "  $line"; done
fi

# Check backend
if curl -s --connect-timeout 5 http://localhost:3002/health > /dev/null 2>&1; then
    print_success "Backend is accessible at http://localhost:3002"
    log_debug "Backend response: OK"
else
    print_error "Backend is not accessible at http://localhost:3002"
    log_debug "Backend curl error:"
    curl -s --connect-timeout 5 http://localhost:3002/health 2>&1 | while read line; do log_debug "  $line"; done
fi
log_debug ""

# 8. Check environment files
print_status "8. Checking environment files..."
log_debug "=== ENVIRONMENT FILES ==="

if [ -f "frontend/.env" ]; then
    print_success "Frontend .env exists"
    log_debug "Frontend .env contents:"
    cat frontend/.env | while read line; do log_debug "  $line"; done
else
    print_error "Frontend .env missing"
fi

if [ -f "backend/.env" ]; then
    print_success "Backend .env exists"
    log_debug "Backend .env contents:"
    cat backend/.env | while read line; do log_debug "  $line"; done
else
    print_error "Backend .env missing"
fi
log_debug ""

# 9. Check dependencies
print_status "9. Checking dependencies..."
log_debug "=== DEPENDENCIES ==="

if [ -d "frontend/node_modules" ]; then
    print_success "Frontend dependencies installed"
    log_debug "Frontend node_modules size: $(du -sh frontend/node_modules | cut -f1)"
else
    print_error "Frontend dependencies not installed"
fi

if [ -d "backend/node_modules" ]; then
    print_success "Backend dependencies installed"
    log_debug "Backend node_modules size: $(du -sh backend/node_modules | cut -f1)"
else
    print_error "Backend dependencies not installed"
fi
log_debug ""

# 10. Check build status
print_status "10. Checking build status..."
log_debug "=== BUILD STATUS ==="

if [ -d "frontend/dist" ]; then
    print_success "Frontend is built"
    log_debug "Frontend dist size: $(du -sh frontend/dist | cut -f1)"
else
    print_error "Frontend not built"
fi

if [ -d "backend/dist" ]; then
    print_success "Backend is built"
    log_debug "Backend dist size: $(du -sh backend/dist | cut -f1)"
else
    print_error "Backend not built"
fi
log_debug ""

# 11. Check database connectivity
print_status "11. Checking database connectivity..."
log_debug "=== DATABASE CONNECTIVITY ==="

if docker --context desktop-linux compose exec pilzno-synagogue-db pg_isready -U postgres > /dev/null 2>&1; then
    print_success "Database is ready"
    log_debug "Database connection: OK"
    
    # Check if database has tables
    TABLE_COUNT=$(docker --context desktop-linux compose exec pilzno-synagogue-db psql -U postgres -d pilzno_synagogue -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' \n' || echo "0")
    if [ "$TABLE_COUNT" -gt 0 ]; then
        print_success "Database has $TABLE_COUNT tables"
        log_debug "Table count: $TABLE_COUNT"
    else
        print_warning "Database has no tables"
        log_debug "Table count: $TABLE_COUNT"
    fi
else
    print_error "Database is not ready"
    log_debug "Database connection: FAILED"
fi
log_debug ""

# 12. Generate recommendations
print_status "12. Generating recommendations..."
log_debug "=== RECOMMENDATIONS ==="

# Check for common issues
if ! docker info > /dev/null 2>&1; then
    log_debug "ISSUE: Docker Desktop not running"
    log_debug "FIX: Start Docker Desktop and wait for it to fully load"
fi

if ! curl -s --connect-timeout 5 http://localhost:3000 > /dev/null 2>&1; then
    log_debug "ISSUE: Frontend not accessible"
    log_debug "FIX: Check if frontend container is running and built"
fi

if ! curl -s --connect-timeout 5 http://localhost:3002/health > /dev/null 2>&1; then
    log_debug "ISSUE: Backend not accessible"
    log_debug "FIX: Check if backend container is running and built"
fi

if [ ! -f "frontend/.env" ] || [ ! -f "backend/.env" ]; then
    log_debug "ISSUE: Environment files missing"
    log_debug "FIX: Create .env files from .env.example or run setup script"
fi

if [ ! -d "frontend/node_modules" ] || [ ! -d "backend/node_modules" ]; then
    log_debug "ISSUE: Dependencies not installed"
    log_debug "FIX: Run 'npm install' in frontend and backend directories"
fi

if [ ! -d "frontend/dist" ] || [ ! -d "backend/dist" ]; then
    log_debug "ISSUE: Application not built"
    log_debug "FIX: Run 'npm run build' in frontend and backend directories"
fi

log_debug ""

# Final summary
echo ""
echo "🎯 Debug Report Complete!"
echo "========================"
echo ""
echo "📄 Debug report saved to: $DEBUG_REPORT"
echo ""
echo "📋 Next steps:"
echo "1. Share the debug report with the support team"
echo "2. Check the recommendations above"
echo "3. Try the suggested fixes"
echo "4. Run this script again to verify fixes"
echo ""
echo "🔧 Quick fixes to try:"
echo "  - Start Docker Desktop: Open Docker Desktop and wait for it to load"
echo "  - Restart services: docker --context desktop-linux compose restart"
echo "  - Rebuild services: docker --context desktop-linux compose up -d --build"
echo "  - Install dependencies: npm install in frontend and backend"
echo "  - Build applications: npm run build in frontend and backend"
echo ""
print_success "Debug script completed! 🎉"



