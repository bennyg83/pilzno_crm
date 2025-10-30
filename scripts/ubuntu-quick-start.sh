#!/bin/bash

# Ubuntu Quick Start Script for Pilzno CRM
# This script sets up the development environment on Ubuntu

set -e  # Exit on any error

echo "🚀 Starting Pilzno CRM Ubuntu Setup..."

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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root. Use a regular user with sudo privileges."
    exit 1
fi

# Check Ubuntu version
UBUNTU_VERSION=$(lsb_release -rs)
print_status "Detected Ubuntu version: $UBUNTU_VERSION"

if [[ "$UBUNTU_VERSION" != "20.04" && "$UBUNTU_VERSION" != "22.04" && "$UBUNTU_VERSION" != "24.04" ]]; then
    print_warning "This script is tested on Ubuntu 20.04, 22.04, and 24.04. Other versions may work but are not guaranteed."
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update

# Install required packages
print_status "Installing required packages..."
sudo apt install -y curl wget git software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    # Start and enable Docker service
    sudo systemctl start docker
    sudo systemctl enable docker
    
    print_success "Docker installed successfully"
else
    print_status "Docker is already installed"
fi

# Install Node.js
print_status "Installing Node.js..."
if ! command -v node &> /dev/null; then
    # Using NodeSource repository for Node.js 18
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    print_success "Node.js installed successfully"
else
    print_status "Node.js is already installed: $(node --version)"
fi

# Install Git if not present
if ! command -v git &> /dev/null; then
    print_status "Installing Git..."
    sudo apt install -y git
    print_success "Git installed successfully"
else
    print_status "Git is already installed: $(git --version)"
fi

# Verify installations
print_status "Verifying installations..."
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker compose version)"
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo "Git version: $(git --version)"

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating .env file from template..."
    if [ -f "scripts/environment-template.env" ]; then
        cp scripts/environment-template.env .env
        print_success ".env file created from template"
        print_warning "Please edit .env file with your specific configuration"
    else
        print_warning "Environment template not found. Please create .env file manually."
    fi
else
    print_status ".env file already exists"
fi

# Install project dependencies
print_status "Installing project dependencies..."

# Backend dependencies
if [ -d "backend" ]; then
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_success "Backend dependencies installed"
else
    print_warning "Backend directory not found"
fi

# Frontend dependencies
if [ -d "frontend" ]; then
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    print_success "Frontend dependencies installed"
else
    print_warning "Frontend directory not found"
fi

# Set up database
print_status "Setting up database..."
if command -v docker &> /dev/null; then
    # Start PostgreSQL container
    docker compose up -d postgres
    
    # Wait for database to be ready
    print_status "Waiting for PostgreSQL to be ready..."
    sleep 10
    
    # Check if database is ready
    if docker compose exec postgres pg_isready -U postgres; then
        print_success "PostgreSQL is ready"
        
        # Initialize database if init script exists
        if [ -f "scripts/init-db.sql" ]; then
            print_status "Initializing database schema..."
            docker compose exec postgres psql -U postgres -d pilzno_crm -f /docker-entrypoint-initdb.d/init-db.sql || print_warning "Database initialization may have failed. Check logs for details."
        fi
    else
        print_warning "PostgreSQL may not be ready yet. You may need to wait and manually initialize the database."
    fi
else
    print_error "Docker not available. Cannot start database."
fi

# Set proper permissions for scripts
print_status "Setting script permissions..."
chmod +x scripts/*.sh 2>/dev/null || true

print_success "🎉 Ubuntu setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start the development environment: docker compose up -d"
echo "3. Access the application at http://localhost:3003"
echo "4. Check the UBUNTU_SETUP_GUIDE.md for detailed information"
echo ""
echo "If you encounter any issues, check the troubleshooting section in the setup guide."
echo ""
echo "Happy coding! 🚀"
