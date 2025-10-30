#!/bin/bash

# Pilzno Synagogue CRM - Complete Project Backup Script with Progress
# This script creates a complete backup including database data with progress indicators

set -e  # Exit on any error

echo "💾 Pilzno Synagogue CRM - Complete Project Backup with Progress"
echo "=============================================================="

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

print_progress() {
    echo -e "${CYAN}[PROGRESS]${NC} $1"
}

# Function to show progress bar
show_progress() {
    local current=$1
    local total=$2
    local description=$3
    local percent=$((current * 100 / total))
    local filled=$((percent / 2))
    local empty=$((50 - filled))
    
    printf "\r${CYAN}[PROGRESS]${NC} %s [%s%s] %d%% (%d/%d)" \
        "$description" \
        "$(printf "%*s" $filled | tr ' ' '=')" \
        "$(printf "%*s" $empty | tr ' ' ' ')" \
        "$percent" \
        "$current" \
        "$total"
}

# Function to check if database is accessible
check_database() {
    print_status "Checking database connectivity..."
    
    # Try different port configurations
    if docker --context desktop-linux compose exec pilzno-synagogue-db pg_isready -U postgres > /dev/null 2>&1; then
        print_success "Database is accessible"
        return 0
    else
        print_warning "Database not accessible, will skip database backup"
        return 1
    fi
}

# Configuration
BACKUP_DIR="E:/September 14"
PROJECT_NAME="pilzno_crm"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="$BACKUP_DIR/${PROJECT_NAME}_backup_$TIMESTAMP"

print_status "Starting complete project backup..."
print_status "Backup destination: $BACKUP_PATH"

# Progress tracking
TOTAL_STEPS=8
CURRENT_STEP=0

# Step 1: Create backup directory
CURRENT_STEP=$((CURRENT_STEP + 1))
show_progress $CURRENT_STEP $TOTAL_STEPS "Creating backup directory..."
mkdir -p "$BACKUP_PATH"
print_success "Backup directory created"

# Step 2: Copy project files
CURRENT_STEP=$((CURRENT_STEP + 1))
show_progress $CURRENT_STEP $TOTAL_STEPS "Copying project files..."
cp -r . "$BACKUP_PATH/"
print_success "Project files copied"

# Step 3: Check database connectivity
CURRENT_STEP=$((CURRENT_STEP + 1))
show_progress $CURRENT_STEP $TOTAL_STEPS "Checking database connectivity..."
if check_database; then
    # Step 4: Create database backup
    CURRENT_STEP=$((CURRENT_STEP + 1))
    show_progress $CURRENT_STEP $TOTAL_STEPS "Creating database backup..."
    DB_BACKUP_FILE="$BACKUP_PATH/database_backup.sql"
    
    # Try to create database backup
    if docker --context desktop-linux compose exec -T pilzno-synagogue-db pg_dump -U postgres pilzno_synagogue > "$DB_BACKUP_FILE" 2>/dev/null; then
        print_success "Database backup created: $DB_BACKUP_FILE"
    else
        print_warning "Database backup failed, but continuing..."
        echo "Database backup failed - this is common if the database is not fully initialized" > "$BACKUP_PATH/database_backup_failed.txt"
    fi
else
    CURRENT_STEP=$((CURRENT_STEP + 1))
    show_progress $CURRENT_STEP $TOTAL_STEPS "Skipping database backup (not accessible)..."
    print_warning "Skipping database backup - database not accessible"
fi

# Step 5: Create Docker volumes backup
CURRENT_STEP=$((CURRENT_STEP + 1))
show_progress $CURRENT_STEP $TOTAL_STEPS "Backing up Docker volumes..."
VOLUMES_BACKUP_DIR="$BACKUP_PATH/docker_volumes"
mkdir -p "$VOLUMES_BACKUP_DIR"

# Try to backup postgres data volume
if docker --context desktop-linux run --rm -v pilzno_crm_postgres_data:/data -v "$VOLUMES_BACKUP_DIR":/backup alpine tar czf /backup/postgres_data.tar.gz -C /data . 2>/dev/null; then
    print_success "PostgreSQL volume backed up"
else
    print_warning "PostgreSQL volume backup failed, but continuing..."
    echo "Volume backup failed - this is common if the volume doesn't exist yet" > "$VOLUMES_BACKUP_DIR/volume_backup_failed.txt"
fi

# Step 6: Create environment backup
CURRENT_STEP=$((CURRENT_STEP + 1))
show_progress $CURRENT_STEP $TOTAL_STEPS "Creating environment backup..."
ENV_BACKUP_DIR="$BACKUP_PATH/environment"
mkdir -p "$ENV_BACKUP_DIR"

# Copy environment files
if [ -f "frontend/.env" ]; then
    cp frontend/.env "$ENV_BACKUP_DIR/frontend.env"
    print_success "Frontend environment backed up"
fi

if [ -f "backend/.env" ]; then
    cp backend/.env "$ENV_BACKUP_DIR/backend.env"
    print_success "Backend environment backed up"
fi

# Step 7: Create system information file
CURRENT_STEP=$((CURRENT_STEP + 1))
show_progress $CURRENT_STEP $TOTAL_STEPS "Creating system information file..."
SYSTEM_INFO_FILE="$BACKUP_PATH/system_info.txt"
cat > "$SYSTEM_INFO_FILE" << EOF
Pilzno Synagogue CRM - System Backup Information
===============================================

Backup Date: $(date)
Source System: $(hostname)
Source Path: $(pwd)
Backup Path: $BACKUP_PATH

System Information:
- OS: $(uname -a)
- Node.js: $(node --version)
- npm: $(npm --version)
- Docker: $(docker --version)
- Docker Compose: $(docker-compose --version)
- Git: $(git --version)

Docker Services Status:
$(docker --context desktop-linux compose ps)

Database Information:
- Database: pilzno_synagogue
- User: postgres
- Backup File: database_backup.sql (if successful)
- Volume Backup: postgres_data.tar.gz (if successful)

Environment Files:
- Frontend: frontend.env
- Backend: backend.env

Restore Instructions:
1. Copy this entire backup to the new system
2. Install prerequisites (Node.js, Docker Desktop, Git)
3. Run: chmod +x scripts/setup-new-system.sh
4. Run: ./scripts/setup-new-system.sh
5. If database backup exists, restore it:
   docker --context desktop-linux compose exec -T pilzno-synagogue-db psql -U postgres pilzno_synagogue < database_backup.sql
6. If volume backup exists, restore it:
   docker --context desktop-linux run --rm -v pilzno_crm_postgres_data:/data -v \$(pwd)/docker_volumes:/backup alpine tar xzf /backup/postgres_data.tar.gz -C /data

EOF
print_success "System information file created"

# Step 8: Create restore and quick start scripts
CURRENT_STEP=$((CURRENT_STEP + 1))
show_progress $CURRENT_STEP $TOTAL_STEPS "Creating restore scripts..."

# Create restore script
RESTORE_SCRIPT="$BACKUP_PATH/restore.sh"
cat > "$RESTORE_SCRIPT" << 'EOF'
#!/bin/bash

# Pilzno Synagogue CRM - Restore Script
# This script restores the project from backup

set -e

echo "🔄 Pilzno Synagogue CRM - Restore from Backup"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Start services
echo "🚀 Starting Docker services..."
docker --context desktop-linux compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 30

# Restore database if backup exists
if [ -f "database_backup.sql" ]; then
    echo "📊 Restoring database..."
    if docker --context desktop-linux compose exec -T pilzno-synagogue-db psql -U postgres pilzno_synagogue < database_backup.sql; then
        echo "✅ Database restored successfully"
    else
        echo "⚠️  Warning: Database restore failed, but continuing..."
    fi
else
    echo "⚠️  Warning: database_backup.sql not found, skipping database restore"
fi

# Restore volumes if backup exists
if [ -d "docker_volumes" ] && [ -f "docker_volumes/postgres_data.tar.gz" ]; then
    echo "💾 Restoring Docker volumes..."
    if docker --context desktop-linux run --rm -v pilzno_crm_postgres_data:/data -v $(pwd)/docker_volumes:/backup alpine tar xzf /backup/postgres_data.tar.gz -C /data; then
        echo "✅ Docker volumes restored successfully"
    else
        echo "⚠️  Warning: Volume restore failed, but continuing..."
    fi
else
    echo "⚠️  Warning: Docker volumes backup not found, skipping volume restore"
fi

# Restart services
echo "🔄 Restarting services..."
docker --context desktop-linux compose restart

echo "✅ Restore completed successfully!"
echo "🌐 Access your application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:3002"

EOF
chmod +x "$RESTORE_SCRIPT"

# Create quick start script for new system
QUICK_START_SCRIPT="$BACKUP_PATH/quick-start-new-system.sh"
cat > "$QUICK_START_SCRIPT" << 'EOF'
#!/bin/bash

# Pilzno Synagogue CRM - Quick Start for New System
# This script sets up the project on a new system

set -e

echo "🚀 Pilzno Synagogue CRM - Quick Start for New System"
echo "==================================================="

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ from https://nodejs.org/"
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop from https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Check Git
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git from https://git-scm.com/download/win"
    exit 1
fi

echo "✅ All prerequisites are installed"

# Install dependencies
echo "📦 Installing dependencies..."
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# Start services
echo "🐳 Starting Docker services..."
docker --context desktop-linux compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Restore database if backup exists
if [ -f "database_backup.sql" ]; then
    echo "📊 Restoring database..."
    if docker --context desktop-linux compose exec -T pilzno-synagogue-db psql -U postgres pilzno_synagogue < database_backup.sql; then
        echo "✅ Database restored"
    else
        echo "⚠️  Warning: Database restore failed, but continuing..."
    fi
else
    echo "⚠️  Warning: No database backup found, starting with fresh database"
fi

# Restore volumes if backup exists
if [ -d "docker_volumes" ] && [ -f "docker_volumes/postgres_data.tar.gz" ]; then
    echo "💾 Restoring Docker volumes..."
    if docker --context desktop-linux run --rm -v pilzno_crm_postgres_data:/data -v $(pwd)/docker_volumes:/backup alpine tar xzf /backup/postgres_data.tar.gz -C /data; then
        echo "✅ Volumes restored"
    else
        echo "⚠️  Warning: Volume restore failed, but continuing..."
    fi
else
    echo "⚠️  Warning: No volume backup found, starting with fresh volumes"
fi

# Restart services
echo "🔄 Restarting services..."
docker --context desktop-linux compose restart

echo "✅ Setup completed successfully!"
echo "🌐 Access your application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:3002"
echo ""
echo "📚 For more information, see:"
echo "  - PROJECT_MIGRATION_GUIDE.md"
echo "  - README_NEW_SYSTEM.md"
echo "  - MIGRATION_SUMMARY.md"

EOF
chmod +x "$QUICK_START_SCRIPT"
print_success "Restore scripts created"

# Create backup summary
print_status "Creating backup summary..."
BACKUP_SUMMARY_FILE="$BACKUP_PATH/BACKUP_SUMMARY.md"
cat > "$BACKUP_SUMMARY_FILE" << EOF
# Pilzno Synagogue CRM - Backup Summary

## 📅 Backup Information
- **Backup Date**: $(date)
- **Source System**: $(hostname)
- **Source Path**: $(pwd)
- **Backup Path**: $BACKUP_PATH

## 📁 What's Included
- ✅ Complete project source code
- ✅ Database backup (database_backup.sql) - if successful
- ✅ Docker volumes backup (postgres_data.tar.gz) - if successful
- ✅ Environment files (frontend.env, backend.env)
- ✅ System information (system_info.txt)
- ✅ Restore script (restore.sh)
- ✅ Quick start script (quick-start-new-system.sh)
- ✅ All documentation files

## 🚀 Quick Start on New System
1. Copy this entire backup to the new system
2. Install prerequisites:
   - Node.js v18+ from https://nodejs.org/
   - Docker Desktop from https://www.docker.com/products/docker-desktop/
   - Git from https://git-scm.com/download/win
3. Run: \`chmod +x quick-start-new-system.sh\`
4. Run: \`./quick-start-new-system.sh\`
5. Access: http://localhost:3000

## 🔧 Manual Restore (if needed)
1. Copy project files to new system
2. Install dependencies: \`npm install\` in frontend and backend
3. Start services: \`docker --context desktop-linux compose up -d\`
4. If database backup exists: \`docker --context desktop-linux compose exec -T pilzno-synagogue-db psql -U postgres pilzno_synagogue < database_backup.sql\`
5. If volume backup exists: \`docker --context desktop-linux run --rm -v pilzno_crm_postgres_data:/data -v \$(pwd)/docker_volumes:/backup alpine tar xzf /backup/postgres_data.tar.gz -C /data\`

## 📚 Documentation
- PROJECT_MIGRATION_GUIDE.md - Complete migration guide
- PROJECT_STRUCTURE.md - Project architecture
- ENVIRONMENT_SETUP.md - Environment configuration
- DEVELOPMENT_RULES_AND_POLICIES.md - Coding standards
- README_NEW_SYSTEM.md - Quick start guide
- MIGRATION_SUMMARY.md - Migration overview

## 🔍 Validation
Run the validation script to ensure everything is working:
\`chmod +x scripts/validate-setup.sh && ./scripts/validate-setup.sh\`

---
**Backup created on**: $(date)
**Source**: $(hostname)
**Status**: Complete and ready for transfer
EOF
print_success "Backup summary created"

# Calculate backup size
print_status "Calculating backup size..."
BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
print_success "Backup size: $BACKUP_SIZE"

# Final summary
echo ""
echo "🎉 Backup completed successfully!"
echo "================================"
echo ""
echo "📁 Backup location: $BACKUP_PATH"
echo "📊 Backup size: $BACKUP_SIZE"
echo ""
echo "📋 What's included:"
echo "  ✅ Complete project source code"
echo "  ✅ Database backup (if successful)"
echo "  ✅ Docker volumes backup (if successful)"
echo "  ✅ Environment files"
echo "  ✅ System information"
echo "  ✅ Restore scripts"
echo "  ✅ All documentation"
echo ""
echo "🚀 To restore on new system:"
echo "  1. Copy entire backup to new system"
echo "  2. Install prerequisites (Node.js, Docker Desktop, Git)"
echo "  3. Run: chmod +x quick-start-new-system.sh"
echo "  4. Run: ./quick-start-new-system.sh"
echo "  5. Access: http://localhost:3000"
echo ""
echo "📚 For detailed instructions, see BACKUP_SUMMARY.md"
print_success "Backup process completed! 🎉"
