#!/bin/bash

# Pilzno Synagogue CRM - New System Setup Script
# This script sets up the project on a new Windows system with Git Bash

set -e  # Exit on any error

echo "🏗️  Pilzno Synagogue CRM - New System Setup"
echo "=============================================="

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

# Check if running on Windows with Git Bash
if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "cygwin" ]]; then
    print_error "This script is designed for Windows with Git Bash. Please run it in Git Bash."
    exit 1
fi

print_status "Starting setup process..."

# Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi
print_success "Node.js $(node --version) is installed"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi
print_success "npm $(npm --version) is installed"

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker Desktop from https://www.docker.com/products/docker-desktop/"
    exit 1
fi
print_success "Docker $(docker --version) is installed"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi
print_success "Docker Compose $(docker-compose --version) is installed"

# Check if Docker Desktop is running
if ! docker info &> /dev/null; then
    print_error "Docker Desktop is not running. Please start Docker Desktop and try again."
    exit 1
fi
print_success "Docker Desktop is running"

# Check Git
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git from https://git-scm.com/download/win"
    exit 1
fi
print_success "Git $(git --version) is installed"

print_success "All prerequisites are met!"

# Create project directory structure
print_status "Setting up project structure..."

# Get current directory
PROJECT_DIR=$(pwd)
print_status "Project directory: $PROJECT_DIR"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Please run this script from the project root directory."
    exit 1
fi

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
if [ ! -f "package.json" ]; then
    print_error "frontend/package.json not found. Please check the project structure."
    exit 1
fi

npm install
if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed successfully"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

cd ..

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
if [ ! -f "package.json" ]; then
    print_error "backend/package.json not found. Please check the project structure."
    exit 1
fi

npm install
if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed successfully"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

cd ..

# Create environment files if they don't exist
print_status "Setting up environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    print_status "Creating backend/.env file..."
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
    print_success "Backend .env file created"
else
    print_warning "Backend .env file already exists, skipping creation"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    print_status "Creating frontend/.env file..."
    cat > frontend/.env << EOF
VITE_API_URL=http://localhost:3002
VITE_APP_NAME=Pilzno Synagogue CRM
EOF
    print_success "Frontend .env file created"
else
    print_warning "Frontend .env file already exists, skipping creation"
fi

# Build Docker images
print_status "Building Docker images..."

# Build frontend
print_status "Building frontend Docker image..."
docker --context desktop-linux compose build pilzno-synagogue-frontend
if [ $? -eq 0 ]; then
    print_success "Frontend Docker image built successfully"
else
    print_error "Failed to build frontend Docker image"
    exit 1
fi

# Build backend
print_status "Building backend Docker image..."
docker --context desktop-linux compose build pilzno-synagogue-backend
if [ $? -eq 0 ]; then
    print_success "Backend Docker image built successfully"
else
    print_error "Failed to build backend Docker image"
    exit 1
fi

# Start services
print_status "Starting Docker services..."

# Start database first
print_status "Starting database..."
docker --context desktop-linux compose up -d pilzno-synagogue-db
sleep 10  # Wait for database to be ready

# Start backend
print_status "Starting backend..."
docker --context desktop-linux compose up -d pilzno-synagogue-backend
sleep 5  # Wait for backend to be ready

# Start frontend
print_status "Starting frontend..."
docker --context desktop-linux compose up -d pilzno-synagogue-frontend

# Wait for all services to be ready
print_status "Waiting for all services to be ready..."
sleep 15

# Check if services are running
print_status "Checking service status..."
docker --context desktop-linux compose ps

# Test if services are accessible
print_status "Testing service accessibility..."

# Test backend
if curl -s http://localhost:3002/health > /dev/null 2>&1; then
    print_success "Backend is accessible at http://localhost:3002"
else
    print_warning "Backend health check failed, but service may still be starting"
fi

# Test frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is accessible at http://localhost:3000"
else
    print_warning "Frontend may still be starting up"
fi

# Create a quick start script
print_status "Creating quick start script..."
cat > start-app.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Pilzno Synagogue CRM..."
docker --context desktop-linux compose up -d
echo "✅ Application started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3002"
echo "📊 Database: localhost:5432"
EOF

chmod +x start-app.sh
print_success "Quick start script created: ./start-app.sh"

# Create a stop script
print_status "Creating stop script..."
cat > stop-app.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping Pilzno Synagogue CRM..."
docker --context desktop-linux compose down
echo "✅ Application stopped!"
EOF

chmod +x stop-app.sh
print_success "Stop script created: ./stop-app.sh"

# Final instructions
echo ""
echo "🎉 Setup completed successfully!"
echo "================================"
echo ""
echo "📋 Next steps:"
echo "1. Open your browser and go to http://localhost:3000"
echo "2. Login with the default admin credentials"
echo "3. Start exploring the application!"
echo ""
echo "🔧 Useful commands:"
echo "  Start app: ./start-app.sh"
echo "  Stop app:  ./stop-app.sh"
echo "  View logs: docker --context desktop-linux compose logs [service-name]"
echo "  Restart:   docker --context desktop-linux compose restart [service-name]"
echo ""
echo "📚 For more information, see PROJECT_MIGRATION_GUIDE.md"
echo ""
print_success "Setup complete! Happy coding! 🚀"
