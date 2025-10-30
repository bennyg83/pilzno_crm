#!/bin/bash

# Pilzno Synagogue CRM - Remote Troubleshooting Script
# This script runs comprehensive troubleshooting on the remote system

set -e

echo "🔧 Pilzno Synagogue CRM - Remote Troubleshooting"
echo "==============================================="

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

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Starting comprehensive remote troubleshooting..."

# Create comprehensive report
REPORT_FILE="remote_troubleshoot_report_$(date +%Y%m%d_%H%M%S).txt"
echo "Creating comprehensive report: $REPORT_FILE"

# Function to log everything
log_info() {
    echo "$1" | tee -a "$REPORT_FILE"
}

log_info "Pilzno Synagogue CRM - Remote Troubleshooting Report"
log_info "===================================================="
log_info "Date: $(date)"
log_info "System: $(hostname)"
log_info "User: $(whoami)"
log_info "Directory: $(pwd)"
log_info ""

# 1. System Information
print_status "1. Collecting system information..."
log_info "=== SYSTEM INFORMATION ==="
log_info "OS: $(uname -a)"
log_info "Node.js: $(node --version 2>/dev/null || echo 'NOT INSTALLED')"
log_info "npm: $(npm --version 2>/dev/null || echo 'NOT INSTALLED')"
log_info "Docker: $(docker --version 2>/dev/null || echo 'NOT INSTALLED')"
log_info "Docker Compose: $(docker-compose --version 2>/dev/null || echo 'NOT INSTALLED')"
log_info "Git: $(git --version 2>/dev/null || echo 'NOT INSTALLED')"
log_info ""

# 2. Check Docker Desktop
print_status "2. Checking Docker Desktop..."
log_info "=== DOCKER DESKTOP STATUS ==="
if docker info > /dev/null 2>&1; then
    print_success "Docker Desktop is running"
    log_info "Docker info:"
    docker info | head -20 | while read line; do log_info "  $line"; done
else
    print_error "Docker Desktop is not running"
    log_info "Docker info error:"
    docker info 2>&1 | while read line; do log_info "  $line"; done
fi
log_info ""

# 3. Check project structure
print_status "3. Checking project structure..."
log_info "=== PROJECT STRUCTURE ==="
log_info "Current directory: $(pwd)"
log_info "Directory contents:"
ls -la | while read line; do log_info "  $line"; done
log_info ""

# Check for key files
for file in "docker-compose.yml" "frontend/package.json" "backend/package.json" "frontend/.env" "backend/.env"; do
    if [ -f "$file" ]; then
        print_success "Found $file"
        log_info "Found: $file"
    else
        print_error "Missing $file"
        log_info "Missing: $file"
    fi
done
log_info ""

# 4. Check dependencies
print_status "4. Checking dependencies..."
log_info "=== DEPENDENCIES ==="

# Frontend dependencies
if [ -d "frontend/node_modules" ]; then
    print_success "Frontend dependencies installed"
    log_info "Frontend node_modules: $(du -sh frontend/node_modules | cut -f1)"
else
    print_error "Frontend dependencies not installed"
    log_info "Frontend node_modules: NOT FOUND"
fi

# Backend dependencies
if [ -d "backend/node_modules" ]; then
    print_success "Backend dependencies installed"
    log_info "Backend node_modules: $(du -sh backend/node_modules | cut -f1)"
else
    print_error "Backend dependencies not installed"
    log_info "Backend node_modules: NOT FOUND"
fi
log_info ""

# 5. Check build status
print_status "5. Checking build status..."
log_info "=== BUILD STATUS ==="

# Frontend build
if [ -d "frontend/dist" ]; then
    print_success "Frontend is built"
    log_info "Frontend dist: $(du -sh frontend/dist | cut -f1)"
else
    print_error "Frontend not built"
    log_info "Frontend dist: NOT FOUND"
fi

# Backend build
if [ -d "backend/dist" ]; then
    print_success "Backend is built"
    log_info "Backend dist: $(du -sh backend/dist | cut -f1)"
else
    print_error "Backend not built"
    log_info "Backend dist: NOT FOUND"
fi
log_info ""

# 6. Check Docker services
print_status "6. Checking Docker services..."
log_info "=== DOCKER SERVICES ==="
docker --context desktop-linux compose ps | while read line; do log_info "  $line"; done
log_info ""

# 7. Check service logs
print_status "7. Checking service logs..."
log_info "=== SERVICE LOGS ==="

log_info "--- Frontend Logs (last 20 lines) ---"
docker --context desktop-linux compose logs pilzno-synagogue-frontend --tail=20 | while read line; do log_info "  $line"; done
log_info ""

log_info "--- Backend Logs (last 20 lines) ---"
docker --context desktop-linux compose logs pilzno-synagogue-backend --tail=20 | while read line; do log_info "  $line"; done
log_info ""

log_info "--- Database Logs (last 20 lines) ---"
docker --context desktop-linux compose logs pilzno-synagogue-db --tail=20 | while read line; do log_info "  $line"; done
log_info ""

# 8. Check network connectivity
print_status "8. Checking network connectivity..."
log_info "=== NETWORK CONNECTIVITY ==="

# Check ports
for port in 3000 3002 5432; do
    if netstat -ano | grep -q ":$port "; then
        print_success "Port $port is in use"
        log_info "Port $port: IN USE"
        netstat -ano | grep ":$port " | while read line; do log_info "  $line"; done
    else
        print_warning "Port $port is not in use"
        log_info "Port $port: NOT IN USE"
    fi
done
log_info ""

# 9. Test service accessibility
print_status "9. Testing service accessibility..."
log_info "=== SERVICE ACCESSIBILITY ==="

# Test frontend
if curl -s --connect-timeout 10 http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is accessible"
    log_info "Frontend: ACCESSIBLE"
else
    print_error "Frontend is not accessible"
    log_info "Frontend: NOT ACCESSIBLE"
    log_info "Frontend curl error:"
    curl -s --connect-timeout 10 http://localhost:3000 2>&1 | while read line; do log_info "  $line"; done
fi

# Test backend
if curl -s --connect-timeout 10 http://localhost:3002/health > /dev/null 2>&1; then
    print_success "Backend is accessible"
    log_info "Backend: ACCESSIBLE"
else
    print_error "Backend is not accessible"
    log_info "Backend: NOT ACCESSIBLE"
    log_info "Backend curl error:"
    curl -s --connect-timeout 10 http://localhost:3002/health 2>&1 | while read line; do log_info "  $line"; done
fi
log_info ""

# 10. Check database connectivity
print_status "10. Checking database connectivity..."
log_info "=== DATABASE CONNECTIVITY ==="

if docker --context desktop-linux compose exec pilzno-synagogue-db pg_isready -U postgres > /dev/null 2>&1; then
    print_success "Database is ready"
    log_info "Database: READY"
    
    # Check tables
    TABLE_COUNT=$(docker --context desktop-linux compose exec pilzno-synagogue-db psql -U postgres -d pilzno_synagogue -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' \n' || echo "0")
    if [ "$TABLE_COUNT" -gt 0 ]; then
        print_success "Database has $TABLE_COUNT tables"
        log_info "Database tables: $TABLE_COUNT"
    else
        print_warning "Database has no tables"
        log_info "Database tables: 0"
    fi
else
    print_error "Database is not ready"
    log_info "Database: NOT READY"
fi
log_info ""

# 11. Generate fixes
print_status "11. Generating automatic fixes..."
log_info "=== AUTOMATIC FIXES ==="

# Create fix script
FIX_SCRIPT="auto_fix_$(date +%Y%m%d_%H%M%S).sh"
cat > "$FIX_SCRIPT" << 'EOF'
#!/bin/bash

echo "🔧 Pilzno Synagogue CRM - Automatic Fix Script"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "🚀 Starting automatic fixes..."

# 1. Create environment files if missing
echo "📝 Creating environment files..."
if [ ! -f "frontend/.env" ]; then
    echo "VITE_API_URL=http://localhost:3002
VITE_APP_NAME=Pilzno Synagogue CRM" > frontend/.env
    echo "✅ Frontend .env created"
fi

if [ ! -f "backend/.env" ]; then
    echo "NODE_ENV=development
PORT=3002
DB_HOST=pilzno-synagogue-db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=pilzno2024
DB_NAME=pilzno_synagogue
JWT_SECRET=pilzno_synagogue_jwt_secret_2024" > backend/.env
    echo "✅ Backend .env created"
fi

# 2. Install dependencies
echo "📦 Installing dependencies..."
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    echo "✅ Frontend dependencies installed"
fi

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
    echo "✅ Backend dependencies installed"
fi

# 3. Build applications
echo "🔨 Building applications..."
if [ ! -d "frontend/dist" ]; then
    echo "Building frontend..."
    cd frontend && npm run build && cd ..
    echo "✅ Frontend built"
fi

if [ ! -d "backend/dist" ]; then
    echo "Building backend..."
    cd backend && npm run build && cd ..
    echo "✅ Backend built"
fi

# 4. Stop and restart services
echo "🔄 Restarting services..."
docker --context desktop-linux compose down
docker --context desktop-linux compose up -d

echo "⏳ Waiting for services to start..."
sleep 30

# 5. Check status
echo "📊 Checking service status..."
docker --context desktop-linux compose ps

echo "✅ Automatic fixes completed!"
echo "🌐 Try accessing: http://localhost:3000"
EOF

chmod +x "$FIX_SCRIPT"
log_info "Created automatic fix script: $FIX_SCRIPT"

# 12. Generate recommendations
print_status "12. Generating recommendations..."
log_info "=== RECOMMENDATIONS ==="

# Analyze issues and provide recommendations
ISSUES_FOUND=0

if ! docker info > /dev/null 2>&1; then
    log_info "ISSUE: Docker Desktop not running"
    log_info "FIX: Start Docker Desktop and wait for it to fully load"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ ! -f "frontend/.env" ] || [ ! -f "backend/.env" ]; then
    log_info "ISSUE: Environment files missing"
    log_info "FIX: Run the automatic fix script or create .env files manually"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ ! -d "frontend/node_modules" ] || [ ! -d "backend/node_modules" ]; then
    log_info "ISSUE: Dependencies not installed"
    log_info "FIX: Run 'npm install' in frontend and backend directories"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ ! -d "frontend/dist" ] || [ ! -d "backend/dist" ]; then
    log_info "ISSUE: Applications not built"
    log_info "FIX: Run 'npm run build' in frontend and backend directories"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if ! curl -s --connect-timeout 10 http://localhost:3000 > /dev/null 2>&1; then
    log_info "ISSUE: Frontend not accessible"
    log_info "FIX: Check if frontend container is running and built"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if ! curl -s --connect-timeout 10 http://localhost:3002/health > /dev/null 2>&1; then
    log_info "ISSUE: Backend not accessible"
    log_info "FIX: Check if backend container is running and built"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

log_info "Total issues found: $ISSUES_FOUND"
log_info ""

# Final summary
echo ""
echo "🎯 Remote Troubleshooting Complete!"
echo "=================================="
echo ""
echo "📄 Comprehensive report saved to: $REPORT_FILE"
echo "🔧 Automatic fix script created: $FIX_SCRIPT"
echo ""
echo "📋 Next steps:"
echo "1. Review the report: cat $REPORT_FILE"
echo "2. Run automatic fixes: chmod +x $FIX_SCRIPT && ./$FIX_SCRIPT"
echo "3. If issues persist, share the report for further assistance"
echo ""
echo "🚀 Quick commands:"
echo "  - View report: cat $REPORT_FILE"
echo "  - Run fixes: ./$FIX_SCRIPT"
echo "  - Check status: docker --context desktop-linux compose ps"
echo "  - View logs: docker --context desktop-linux compose logs"
echo ""

if [ $ISSUES_FOUND -eq 0 ]; then
    print_success "No issues found! System appears to be working correctly. 🎉"
else
    print_warning "$ISSUES_FOUND issues found. Please run the automatic fix script. 🔧"
fi

print_success "Remote troubleshooting completed! 🚀"



