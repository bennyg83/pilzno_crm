#!/bin/bash

# Pilzno Synagogue CRM - Setup Validation Script
# This script validates that the system is properly set up and running

set -e  # Exit on any error

echo "🔍 Pilzno Synagogue CRM - Setup Validation"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED_CHECKS++))
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED_CHECKS++))
}

# Function to run a check
run_check() {
    local check_name="$1"
    local check_command="$2"
    local expected_result="$3"
    
    ((TOTAL_CHECKS++))
    print_status "Checking: $check_name"
    
    if eval "$check_command" > /dev/null 2>&1; then
        if [ "$expected_result" = "success" ]; then
            print_success "$check_name"
        else
            print_error "$check_name (unexpected success)"
        fi
    else
        if [ "$expected_result" = "failure" ]; then
            print_success "$check_name"
        else
            print_error "$check_name"
        fi
    fi
}

# Function to check if a command exists
check_command() {
    local command_name="$1"
    local command_path="$2"
    
    ((TOTAL_CHECKS++))
    print_status "Checking: $command_name installation"
    
    if command -v "$command_path" &> /dev/null; then
        local version=$($command_path --version 2>/dev/null | head -n1)
        print_success "$command_name is installed ($version)"
    else
        print_error "$command_name is not installed"
    fi
}

# Function to check if a port is in use
check_port() {
    local port="$1"
    local service_name="$2"
    
    ((TOTAL_CHECKS++))
    print_status "Checking: $service_name port $port"
    
    if netstat -ano | grep -q ":$port "; then
        print_success "$service_name is using port $port"
    else
        print_error "$service_name is not using port $port"
    fi
}

# Function to check if a URL is accessible
check_url() {
    local url="$1"
    local service_name="$2"
    
    ((TOTAL_CHECKS++))
    print_status "Checking: $service_name accessibility"
    
    if curl -s --connect-timeout 5 "$url" > /dev/null 2>&1; then
        print_success "$service_name is accessible at $url"
    else
        print_error "$service_name is not accessible at $url"
    fi
}

# Function to check Docker container status
check_container() {
    local container_name="$1"
    local expected_status="$2"
    
    ((TOTAL_CHECKS++))
    print_status "Checking: $container_name container status"
    
    local status=$(docker --context desktop-linux compose ps --format "table {{.Name}}\t{{.Status}}" | grep "$container_name" | awk '{print $2}')
    
    if [ "$status" = "$expected_status" ]; then
        print_success "$container_name container is $expected_status"
    else
        print_error "$container_name container is $status (expected: $expected_status)"
    fi
}

# Function to check file existence
check_file() {
    local file_path="$1"
    local file_description="$2"
    
    ((TOTAL_CHECKS++))
    print_status "Checking: $file_description"
    
    if [ -f "$file_path" ]; then
        print_success "$file_description exists"
    else
        print_error "$file_description is missing"
    fi
}

# Function to check environment variable
check_env_var() {
    local env_file="$1"
    local var_name="$2"
    local var_description="$3"
    
    ((TOTAL_CHECKS++))
    print_status "Checking: $var_description"
    
    if grep -q "^$var_name=" "$env_file" 2>/dev/null; then
        print_success "$var_description is set"
    else
        print_error "$var_description is not set"
    fi
}

echo ""
echo "🔧 Prerequisites Check"
echo "======================"

# Check required commands
check_command "Node.js" "node"
check_command "npm" "npm"
check_command "Docker" "docker"
check_command "Docker Compose" "docker-compose"
check_command "Git" "git"
check_command "curl" "curl"

# Check Node.js version
((TOTAL_CHECKS++))
print_status "Checking: Node.js version"
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    print_success "Node.js version is $NODE_VERSION (>= 18)"
else
    print_error "Node.js version is $NODE_VERSION (requires >= 18)"
fi

# Check Docker Desktop is running
((TOTAL_CHECKS++))
print_status "Checking: Docker Desktop is running"
if docker info &> /dev/null; then
    print_success "Docker Desktop is running"
else
    print_error "Docker Desktop is not running"
fi

echo ""
echo "📁 Project Structure Check"
echo "=========================="

# Check project structure
check_file "docker-compose.yml" "Docker Compose configuration"
check_file "frontend/package.json" "Frontend package.json"
check_file "backend/package.json" "Backend package.json"
check_file "frontend/src/App.tsx" "Frontend App component"
check_file "backend/src/index.ts" "Backend entry point"
check_file "scripts/setup-new-system.sh" "Setup script"

echo ""
echo "🔧 Environment Configuration Check"
echo "=================================="

# Check environment files
check_file "frontend/.env" "Frontend environment file"
check_file "backend/.env" "Backend environment file"

# Check frontend environment variables
if [ -f "frontend/.env" ]; then
    check_env_var "frontend/.env" "VITE_API_URL" "Frontend API URL"
    check_env_var "frontend/.env" "VITE_APP_NAME" "Frontend app name"
fi

# Check backend environment variables
if [ -f "backend/.env" ]; then
    check_env_var "backend/.env" "NODE_ENV" "Node environment"
    check_env_var "backend/.env" "PORT" "Backend port"
    check_env_var "backend/.env" "DB_HOST" "Database host"
    check_env_var "backend/.env" "DB_PASSWORD" "Database password"
    check_env_var "backend/.env" "JWT_SECRET" "JWT secret"
fi

echo ""
echo "🐳 Docker Services Check"
echo "========================"

# Check if Docker Compose is running
((TOTAL_CHECKS++))
print_status "Checking: Docker Compose services"
if docker --context desktop-linux compose ps | grep -q "Up"; then
    print_success "Docker Compose services are running"
else
    print_error "Docker Compose services are not running"
fi

# Check individual containers
check_container "pilzno-synagogue-db" "Up"
check_container "pilzno-synagogue-backend" "Up"
check_container "pilzno-synagogue-frontend" "Up"

echo ""
echo "🌐 Service Accessibility Check"
echo "=============================="

# Check if services are accessible
check_url "http://localhost:3000" "Frontend"
check_url "http://localhost:3002/health" "Backend API"

# Check ports
check_port "3000" "Frontend"
check_port "3002" "Backend"
check_port "5432" "Database"

echo ""
echo "📊 Database Check"
echo "================="

# Check database connectivity
((TOTAL_CHECKS++))
print_status "Checking: Database connectivity"
if docker --context desktop-linux compose exec pilzno-synagogue-db pg_isready -U postgres > /dev/null 2>&1; then
    print_success "Database is ready and accepting connections"
else
    print_error "Database is not ready or not accepting connections"
fi

# Check if database has data
((TOTAL_CHECKS++))
print_status "Checking: Database has tables"
TABLE_COUNT=$(docker --context desktop-linux compose exec pilzno-synagogue-db psql -U postgres -d pilzno_synagogue -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' \n' || echo "0")
if [ "$TABLE_COUNT" -gt 0 ]; then
    print_success "Database has $TABLE_COUNT tables"
else
    print_error "Database has no tables or is not accessible"
fi

echo ""
echo "🔍 Application Health Check"
echo "==========================="

# Check frontend build
((TOTAL_CHECKS++))
print_status "Checking: Frontend build"
if [ -d "frontend/dist" ] && [ -f "frontend/dist/index.html" ]; then
    print_success "Frontend is built successfully"
else
    print_error "Frontend build is missing or incomplete"
fi

# Check backend compilation
((TOTAL_CHECKS++))
print_status "Checking: Backend compilation"
if [ -d "backend/dist" ] && [ -f "backend/dist/index.js" ]; then
    print_success "Backend is compiled successfully"
else
    print_error "Backend compilation is missing or incomplete"
fi

echo ""
echo "📈 Summary"
echo "=========="

echo "Total checks: $TOTAL_CHECKS"
echo "Passed: $PASSED_CHECKS"
echo "Failed: $FAILED_CHECKS"

if [ $FAILED_CHECKS -eq 0 ]; then
    echo ""
    print_success "🎉 All checks passed! The system is properly set up and running."
    echo ""
    echo "🌐 Access your application:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:3002"
    echo ""
    echo "🔧 Useful commands:"
    echo "  Start: ./start-app.sh"
    echo "  Stop:  ./stop-app.sh"
    echo "  Logs:  docker --context desktop-linux compose logs"
    echo ""
    exit 0
else
    echo ""
    print_error "❌ Some checks failed. Please review the errors above and fix them."
    echo ""
    echo "🔧 Common fixes:"
    echo "  1. Start Docker Desktop if it's not running"
    echo "  2. Run: docker --context desktop-linux compose up -d"
    echo "  3. Wait for services to start (30-60 seconds)"
    echo "  4. Run this validation script again"
    echo ""
    exit 1
fi
