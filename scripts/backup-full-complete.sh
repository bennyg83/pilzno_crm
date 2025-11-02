#!/bin/bash

# Pilzno Synagogue CRM - COMPLETE Full Backup (Including node_modules, dist, etc.)
# This script creates a complete backup including ALL files for transfer

set -e  # Exit on any error

echo "💾 Pilzno Synagogue CRM - COMPLETE Full Backup (Everything Included)"
echo "==================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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

# Configuration - Database credentials from docker-compose.yml
DB_CONTAINER="pilzno-synagogue-db"
DB_USER="${DB_USER:-synagogue_admin}"
DB_NAME="${DB_NAME:-pilzno_synagogue}"

# Backup directory
BACKUP_DIR="$(pwd)/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="pilzno_crm_COMPLETE_$TIMESTAMP"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

print_status "Starting COMPLETE project backup (including node_modules, dist, .git)..."
print_status "Backup destination: $BACKUP_PATH"

# Create backup directory
mkdir -p "$BACKUP_PATH"
print_success "Backup directory created"

# Step 1: Backup database
print_status "Step 1/4: Creating database backup..."
if docker compose ps | grep -q "$DB_CONTAINER.*Up"; then
    DB_BACKUP_FILE="$BACKUP_PATH/database_backup.sql"
    
    # Try to dump database
    if docker compose exec -T "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" > "$DB_BACKUP_FILE" 2>&1; then
        DB_SIZE=$(du -h "$DB_BACKUP_FILE" | cut -f1)
        print_success "Database backup created: $DB_BACKUP_FILE ($DB_SIZE)"
    else
        # Try with postgres user as fallback
        if docker compose exec -T "$DB_CONTAINER" pg_dump -U postgres "$DB_NAME" > "$DB_BACKUP_FILE" 2>&1; then
            DB_SIZE=$(du -h "$DB_BACKUP_FILE" | cut -f1)
            print_success "Database backup created (using postgres user): $DB_BACKUP_FILE ($DB_SIZE)"
        else
            print_warning "Database backup failed. Container may not be running or credentials incorrect."
            print_warning "Continuing without database backup..."
            rm -f "$DB_BACKUP_FILE"
        fi
    fi
else
    print_warning "Database container '$DB_CONTAINER' is not running. Skipping database backup."
    print_warning "You can start it with: docker compose up -d pilzno-synagogue-db"
fi

# Step 2: Copy EVERYTHING (including node_modules, dist, .git, etc.)
print_status "Step 2/4: Copying ALL project files (this will include node_modules - may take a while)..."

# Create destination directory first
mkdir -p "$BACKUP_PATH/project"

# Use tar to copy everything (works reliably on Windows/Git Bash)
# This preserves all file attributes and handles large directories well
print_status "Creating archive and extracting to backup location..."
tar -cf - --exclude='backups' --exclude='*.tar.gz' . | (cd "$BACKUP_PATH/project" && tar -xf -)

# Verify copy was successful
if [ -d "$BACKUP_PATH/project" ] && [ -d "$BACKUP_PATH/project/frontend" ] && [ -d "$BACKUP_PATH/project/backend" ]; then
    COPIED_SIZE=$(du -sh "$BACKUP_PATH/project" 2>/dev/null | cut -f1)
    print_success "Project files copied ($COPIED_SIZE)"
else
    print_error "Copy failed - destination structure incomplete"
    exit 1
fi

print_success "Project files copied (including node_modules, dist, .git)"

# Step 3: Create restore instructions
print_status "Step 3/4: Creating restore instructions..."

cat > "$BACKUP_PATH/RESTORE_INSTRUCTIONS.md" << EOF
# Pilzno CRM - COMPLETE Backup Restore Instructions

## 📅 Backup Information
- **Backup Date**: $(date)
- **Source System**: $(hostname)
- **Source Path**: $(pwd)
- **Type**: COMPLETE backup (includes node_modules, dist, .git, everything)

## 📦 What's Included
- ✅ Complete project source code
- ✅ ALL node_modules (frontend and backend)
- ✅ ALL dist/build folders
- ✅ .git repository (complete history)
- ✅ Database backup (database_backup.sql) - if available
- ✅ Everything else

## 🚀 Restore Steps on Mini-PC

### 1. Transfer Files to Mini-PC
\`\`\`powershell
# Via SCP (from source system):
scp -r "$BACKUP_NAME" cursors123@crm-mini:"C:\Users\cursors123\Documents\Projects_Shul\Pilzno\"

# Or copy via network share/USB drive to:
# C:\Users\cursors123\Documents\Projects_Shul\Pilzno\pilzno_crm
\`\`\`

### 2. Extract/Restore Project Files
\`\`\`powershell
# Navigate to backup location
cd "C:\Users\cursors123\Documents\Projects_Shul\Pilzno\$BACKUP_NAME"

# Copy project files to destination
xcopy /E /I /Y /H project "C:\Users\cursors123\Documents\Projects_Shul\Pilzno\pilzno_crm"
\`\`\`

### 3. Set Up Environment Variables (if needed)
\`\`\`powershell
cd "C:\Users\cursors123\Documents\Projects_Shul\Pilzno\pilzno_crm"

# Create backend/.env if it doesn't exist
if (-not (Test-Path "backend\.env")) {
    @"
DB_NAME=pilzno_synagogue
DB_USER=synagogue_admin
DB_PASSWORD=synagogue_secure_pass
DB_PORT=5435
DB_HOST=pilzno-synagogue-db
JWT_SECRET=pilzno_synagogue_jwt_secret_key_2024
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3003
"@ | Out-File -Encoding utf8 backend\.env
}

# Create frontend/.env.production if it doesn't exist
if (-not (Test-Path "frontend\.env.production")) {
    @"
VITE_API_BASE_URL=https://crm-mini.tail34e202.ts.net
NODE_ENV=production
"@ | Out-File -Encoding utf8 frontend\.env.production
}
\`\`\`

### 4. Start Docker Services
\`\`\`powershell
cd "C:\Users\cursors123\Documents\Projects_Shul\Pilzno\pilzno_crm"

# Start all services
docker compose up -d

# Wait for database to be ready (check logs)
docker compose logs -f pilzno-synagogue-db
\`\`\`

### 5. Restore Database
\`\`\`powershell
# If database_backup.sql exists:
docker compose exec -T pilzno-synagogue-db psql -U synagogue_admin -d pilzno_synagogue < ..\\$BACKUP_NAME\\database_backup.sql

# Or if using postgres user:
docker compose exec -T pilzno-synagogue-db psql -U postgres -d pilzno_synagogue < ..\\$BACKUP_NAME\\database_backup.sql
\`\`\`

### 6. Verify Installation
\`\`\`powershell
# Check container status
docker compose ps

# Check logs
docker compose logs backend
docker compose logs frontend

# Test backend health
curl http://localhost:3002/api/health
\`\`\`

## 🌐 Access Application
- **Frontend**: http://localhost:3003
- **Backend API**: http://localhost:3002
- **Database**: localhost:5435

## ⚠️ Important Notes
- This is a COMPLETE backup with all dependencies - no need to run npm install
- If you need to rebuild frontend: docker compose down; cd frontend; npm run build; cd ..; docker compose up -d --build
- Database credentials should be changed in production
- JWT_SECRET should be changed from default
EOF

print_success "Restore instructions created"

# Step 4: Create compressed archive
print_status "Step 4/4: Creating compressed archive (this may take a while due to size)..."
ARCHIVE_FILE="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"
cd "$BACKUP_DIR"
tar -czf "$ARCHIVE_FILE" "$BACKUP_NAME" 2>/dev/null || {
    print_warning "tar command not available or failed, skipping archive creation"
    ARCHIVE_FILE=""
}

if [ -n "$ARCHIVE_FILE" ] && [ -f "$ARCHIVE_FILE" ]; then
    ARCHIVE_SIZE=$(du -h "$ARCHIVE_FILE" | cut -f1)
    print_success "Archive created: $ARCHIVE_FILE ($ARCHIVE_SIZE)"
else
    ARCHIVE_FILE=""
fi

# Calculate backup size
BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)

# Final summary
echo ""
echo "🎉 COMPLETE Backup Finished Successfully!"
echo "=========================================="
echo ""
echo "📁 Backup location: $BACKUP_PATH"
echo "📊 Backup size: $BACKUP_SIZE"
if [ -n "$ARCHIVE_FILE" ]; then
    echo "📦 Archive: $ARCHIVE_FILE"
fi
echo ""
echo "📋 What's included:"
echo "  ✅ Complete project source code"
echo "  ✅ ALL node_modules (frontend + backend)"
echo "  ✅ ALL dist/build folders"
echo "  ✅ Complete .git repository"
if [ -f "$BACKUP_PATH/database_backup.sql" ]; then
    DB_SIZE=$(du -h "$BACKUP_PATH/database_backup.sql" | cut -f1)
    echo "  ✅ Database backup ($DB_SIZE)"
else
    echo "  ⚠️  Database backup (skipped - container not running)"
fi
echo ""
echo "🚀 Next Steps:"
echo "  1. Transfer '$BACKUP_PATH' or '$ARCHIVE_FILE' to mini-PC"
echo "  2. Follow RESTORE_INSTRUCTIONS.md on the mini-PC"
echo ""
echo "📝 Transfer Methods:"
echo "  - Network share or USB drive (recommended for large size)"
if [ -n "$ARCHIVE_FILE" ]; then
    echo "  - SCP (archive): scp '${BACKUP_NAME}.tar.gz' cursors123@crm-mini:'C:\\Users\\cursors123\\Documents\\Projects_Shul\\Pilzno\\'"
fi
echo "  - SCP (folder): scp -r '$BACKUP_NAME' cursors123@crm-mini:'C:\\Users\\cursors123\\Documents\\Projects_Shul\\Pilzno\\'"
echo ""

print_success "Complete backup process finished! 🎉"

