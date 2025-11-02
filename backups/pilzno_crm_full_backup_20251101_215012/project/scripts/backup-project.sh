#!/bin/bash

# Pilzno Synagogue CRM - Complete Project Backup Script
# This script creates a complete backup including database data

set -e  # Exit on any error

echo "💾 Pilzno Synagogue CRM - Complete Project Backup"
echo "================================================"

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

# Configuration
BACKUP_DIR="E:/September 14"
PROJECT_NAME="pilzno_crm"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="$BACKUP_DIR/${PROJECT_NAME}_backup_$TIMESTAMP"

print_status "Starting complete project backup..."
print_status "Backup destination: $BACKUP_PATH"

# Create backup directory
print_status "Creating backup directory..."
mkdir -p "$BACKUP_PATH"
print_success "Backup directory created"

# Copy entire project directory
print_status "Copying project files..."
cp -r . "$BACKUP_PATH/"
print_success "Project files copied"

# Create database backup
print_status "Creating database backup..."
DB_BACKUP_FILE="$BACKUP_PATH/database_backup.sql"
docker --context desktop-linux compose exec -T pilzno-synagogue-db pg_dump -U postgres pilzno_synagogue > "$DB_BACKUP_FILE"
print_success "Database backup created: $DB_BACKUP_FILE"

# Create Docker volumes backup
print_status "Backing up Docker volumes..."
VOLUMES_BACKUP_DIR="$BACKUP_PATH/docker_volumes"
mkdir -p "$VOLUMES_BACKUP_DIR"

# Backup postgres data volume
print_status "Backing up PostgreSQL data volume..."
docker --context desktop-linux run --rm -v pilzno_crm_postgres_data:/data -v "$VOLUMES_BACKUP_DIR":/backup alpine tar czf /backup/postgres_data.tar.gz -C /data .
print_success "PostgreSQL volume backed up"

# Create environment backup
print_status "Creating environment backup..."
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

# Create system information file
print_status "Creating system information file..."
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
- Backup File: database_backup.sql
- Volume Backup: postgres_data.tar.gz

Environment Files:
- Frontend: frontend.env
- Backend: backend.env

Restore Instructions:
1. Copy this entire backup to the new system
2. Install prerequisites (Node.js, Docker Desktop, Git)
3. Run: chmod +x scripts/setup-new-system.sh
4. Run: ./scripts/setup-new-system.sh
5. Restore database: docker --context desktop-linux compose exec -T pilzno-synagogue-db psql -U postgres pilzno_synagogue < database_backup.sql
6. Restore volumes: docker --context desktop-linux run --rm -v pilzno_crm_postgres_data:/data -v $(pwd)/docker_volumes:/backup alpine tar xzf /backup/postgres_data.tar.gz -C /data

EOF
print_success "System information file created"

# Create restore script
print_status "Creating restore script..."
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

# Restore database
if [ -f "database_backup.sql" ]; then
    echo "📊 Restoring database..."
    docker --context desktop-linux compose exec -T pilzno-synagogue-db psql -U postgres pilzno_synagogue < database_backup.sql
    echo "✅ Database restored successfully"
else
    echo "⚠️  Warning: database_backup.sql not found"
fi

# Restore volumes
if [ -d "docker_volumes" ] && [ -f "docker_volumes/postgres_data.tar.gz" ]; then
    echo "💾 Restoring Docker volumes..."
    docker --context desktop-linux run --rm -v pilzno_crm_postgres_data:/data -v $(pwd)/docker_volumes:/backup alpine tar xzf /backup/postgres_data.tar.gz -C /data
    echo "✅ Docker volumes restored successfully"
else
    echo "⚠️  Warning: Docker volumes backup not found"
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
print_success "Restore script created"

# Create quick start script for new system
print_status "Creating quick start script for new system..."
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
    docker --context desktop-linux compose exec -T pilzno-synagogue-db psql -U postgres pilzno_synagogue < database_backup.sql
    echo "✅ Database restored"
fi

# Restore volumes if backup exists
if [ -d "docker_volumes" ] && [ -f "docker_volumes/postgres_data.tar.gz" ]; then
    echo "💾 Restoring Docker volumes..."
    docker --context desktop-linux run --rm -v pilzno_crm_postgres_data:/data -v $(pwd)/docker_volumes:/backup alpine tar xzf /backup/postgres_data.tar.gz -C /data
    echo "✅ Volumes restored"
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
print_success "Quick start script created"

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
- ✅ Database backup (database_backup.sql)
- ✅ Docker volumes backup (postgres_data.tar.gz)
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
4. Restore database: \`docker --context desktop-linux compose exec -T pilzno-synagogue-db psql -U postgres pilzno_synagogue < database_backup.sql\`
5. Restore volumes: \`docker --context desktop-linux run --rm -v pilzno_crm_postgres_data:/data -v \$(pwd)/docker_volumes:/backup alpine tar xzf /backup/postgres_data.tar.gz -C /data\`

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
echo "  ✅ Database backup (database_backup.sql)"
echo "  ✅ Docker volumes backup (postgres_data.tar.gz)"
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
