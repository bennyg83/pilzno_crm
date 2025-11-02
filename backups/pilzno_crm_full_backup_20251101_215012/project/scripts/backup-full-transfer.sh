#!/bin/bash

# Pilzno Synagogue CRM - Full Project Backup for Transfer
# This script creates a complete backup including database for transfer to another system

set -e  # Exit on any error

echo "💾 Pilzno Synagogue CRM - Full Transfer Backup"
echo "=============================================="

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
DB_PORT="${DB_PORT:-5435}"

# Backup directory in current location
BACKUP_DIR="$(pwd)/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="pilzno_crm_full_backup_$TIMESTAMP"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

print_status "Starting full project backup..."
print_status "Backup destination: $BACKUP_PATH"

# Create backup directory
mkdir -p "$BACKUP_PATH"
print_success "Backup directory created"

# Step 1: Backup database
print_status "Step 1/5: Creating database backup..."
if docker compose ps | grep -q "$DB_CONTAINER.*Up"; then
    DB_BACKUP_FILE="$BACKUP_PATH/database_backup.sql"
    
    # Try to dump database
    if docker compose exec -T "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" > "$DB_BACKUP_FILE" 2>&1; then
        DB_SIZE=$(du -h "$DB_BACKUP_FILE" | cut -f1)
        print_success "Database backup created: $DB_BACKUP_FILE ($DB_SIZE)"
    else
        print_warning "Database backup failed - checking alternative methods..."
        # Try with postgres user as fallback
        if docker compose exec -T "$DB_CONTAINER" pg_dump -U postgres "$DB_NAME" > "$DB_BACKUP_FILE" 2>&1; then
            DB_SIZE=$(du -h "$DB_BACKUP_FILE" | cut -f1)
            print_success "Database backup created (using postgres user): $DB_BACKUP_FILE ($DB_SIZE)"
        else
            print_error "Database backup failed. Container may not be running or credentials incorrect."
            print_warning "Continuing without database backup..."
            rm -f "$DB_BACKUP_FILE"
        fi
    fi
else
    print_warning "Database container '$DB_CONTAINER' is not running. Skipping database backup."
    print_warning "You can start it with: docker compose up -d pilzno-synagogue-db"
fi

# Step 2: Copy project files (excluding unnecessary files)
print_status "Step 2/5: Copying project files..."

# Create temp directory for project copy
TEMP_PROJECT="$BACKUP_PATH/project"
mkdir -p "$TEMP_PROJECT"

# Copy project files, excluding unnecessary files
# Use PowerShell for better Windows compatibility
print_status "Copying files (this may take a moment)..."

# Use PowerShell's Copy-Item with exclusions (works well on Windows)
powershell.exe -Command "
\$exclude = @('node_modules', 'dist', '.git', 'logs', 'backups', '.vscode', '.idea', 'coverage', '.nyc_output', '__pycache__');
\$source = '$(cygpath -aw "$(pwd)")';
\$dest = '$(cygpath -aw "$TEMP_PROJECT")';
Get-ChildItem -Path \$source -Recurse -File | Where-Object {
    \$excluded = \$false;
    foreach (\$exc in \$exclude) {
        if (\$_.FullName -like \"*\`\\\$exc\`\\*\") { \$excluded = \$true; break; }
    }
    -not \$excluded -and
    -not (\$_.Name -match '\.log$|\.log\.|\.tar\.gz$|\.zip$|\.DS_Store$|Thumbs\.db$|\.pyc$') -and
    -not (\$_.Name -match '^\.env$|^\.env\.local$|^\.env\..*\.local$')
} | ForEach-Object {
    \$relativePath = \$_.FullName.Substring(\$source.Length + 1);
    \$targetPath = Join-Path \$dest \$relativePath;
    \$targetDir = Split-Path \$targetPath -Parent;
    if (-not (Test-Path \$targetDir)) { New-Item -ItemType Directory -Path \$targetDir -Force | Out-Null; }
    Copy-Item \$_.FullName \$targetPath -Force;
}
" 2>/dev/null || {
    # Fallback: simple copy if PowerShell fails
    print_warning "PowerShell copy failed, using simple copy (may include excluded files)..."
    # Copy everything first
    cp -r . "$TEMP_PROJECT/" 2>/dev/null || {
        print_error "Failed to copy project files"
        exit 1
    }
    # Remove excluded directories
    rm -rf "$TEMP_PROJECT"/node_modules "$TEMP_PROJECT"/dist "$TEMP_PROJECT"/.git \
           "$TEMP_PROJECT"/logs "$TEMP_PROJECT"/backups 2>/dev/null
}

print_success "Project files copied"

# Step 3: Save git information
print_status "Step 3/5: Saving git information..."
if [ -d ".git" ]; then
    echo "=== Git Remote Information ===" > "$BACKUP_PATH/git_info.txt"
    git remote -v >> "$BACKUP_PATH/git_info.txt" 2>&1 || echo "No remotes configured" >> "$BACKUP_PATH/git_info.txt"
    echo "" >> "$BACKUP_PATH/git_info.txt"
    echo "=== Current Branch ===" >> "$BACKUP_PATH/git_info.txt"
    git branch --show-current >> "$BACKUP_PATH/git_info.txt" 2>&1 || echo "Unable to determine branch" >> "$BACKUP_PATH/git_info.txt"
    echo "" >> "$BACKUP_PATH/git_info.txt"
    echo "=== Latest Commit ===" >> "$BACKUP_PATH/git_info.txt"
    git log -1 --oneline >> "$BACKUP_PATH/git_info.txt" 2>&1 || echo "Unable to get commit info" >> "$BACKUP_PATH/git_info.txt"
    print_success "Git information saved"
else
    print_warning "Not a git repository, skipping git info"
fi

# Step 4: Create environment template files
print_status "Step 4/5: Creating environment templates..."
mkdir -p "$BACKUP_PATH/env_templates"

# Backend .env template
cat > "$BACKUP_PATH/env_templates/backend.env.template" << 'EOF'
# Backend Environment Variables
# Copy this to backend/.env and fill in your values

# Database Configuration
DB_NAME=pilzno_synagogue
DB_USER=synagogue_admin
DB_PASSWORD=CHANGE_THIS_PASSWORD
DB_PORT=5435
DB_HOST=pilzno-synagogue-db

# JWT Configuration
JWT_SECRET=CHANGE_THIS_SECRET

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration (for production)
CORS_ORIGIN=http://localhost:3003
EOF

# Frontend .env.production template
cat > "$BACKUP_PATH/env_templates/frontend.env.production.template" << 'EOF'
# Frontend Production Environment Variables
# Copy this to frontend/.env.production

VITE_API_BASE_URL=https://crm-mini.tail34e202.ts.net
NODE_ENV=production
EOF

# Frontend .env.development template
cat > "$BACKUP_PATH/env_templates/frontend.env.development.template" << 'EOF'
# Frontend Development Environment Variables
# Copy this to frontend/.env.development

VITE_API_BASE_URL=http://localhost:3002
NODE_ENV=development
EOF

print_success "Environment templates created"

# Step 5: Create restore and transfer instructions
print_status "Step 5/5: Creating restore instructions..."

cat > "$BACKUP_PATH/RESTORE_INSTRUCTIONS.md" << EOF
# Pilzno CRM - Restore Instructions for Mini-PC

## 📅 Backup Information
- **Backup Date**: $(date)
- **Source System**: $(hostname)
- **Source Path**: $(pwd)

## 📦 What's Included
- ✅ Complete project source code (excluding node_modules, dist, .git)
- ✅ Database backup (database_backup.sql) - if available
- ✅ Environment variable templates
- ✅ Git remote information
- ✅ All documentation

## 🚀 Restore Steps on Mini-PC

### 1. Transfer Files to Mini-PC
\`\`\`powershell
# Via SCP (from source system):
scp -r "$BACKUP_NAME" cursors123@crm-mini:"C:\Users\cursors123\Documents\Projects_Shul\Pilzno\"

# Or copy via network share/USB drive
\`\`\`

### 2. Extract/Restore Project Files
\`\`\`powershell
# Navigate to backup location
cd "C:\Users\cursors123\Documents\Projects_Shul\Pilzno\$BACKUP_NAME"

# Copy project files to destination
xcopy /E /I /Y project "C:\Users\cursors123\Documents\Projects_Shul\Pilzno\pilzno_crm"
\`\`\`

### 3. Set Up Environment Variables
\`\`\`powershell
cd "C:\Users\cursors123\Documents\Projects_Shul\Pilzno\pilzno_crm"

# Backend environment
copy env_templates\backend.env.template backend\.env
# Edit backend\.env with your values

# Frontend environment
copy env_templates\frontend.env.production.template frontend\.env.production
# Edit frontend\.env.production with your values
\`\`\`

### 4. Install Dependencies
\`\`\`powershell
# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
\`\`\`

### 5. Start Docker Services
\`\`\`powershell
# Start all services
docker compose up -d

# Wait for database to be ready (check logs)
docker compose logs -f pilzno-synagogue-db
\`\`\`

### 6. Restore Database
\`\`\`powershell
# If database_backup.sql exists:
docker compose exec -T pilzno-synagogue-db psql -U synagogue_admin -d pilzno_synagogue < ..\\$BACKUP_NAME\\database_backup.sql

# Or if using postgres user:
docker compose exec -T pilzno-synagogue-db psql -U postgres -d pilzno_synagogue < ..\\$BACKUP_NAME\\database_backup.sql
\`\`\`

### 7. Set Up Git Remote (Optional)
\`\`\`powershell
cd "C:\Users\cursors123\Documents\Projects_Shul\Pilzno\pilzno_crm"
git init
# Check git_info.txt for remote URL, then:
git remote add origin git@github.com:bennyg83/pilzno_crm.git
git fetch origin
git checkout -b main || git checkout main
git pull origin main
\`\`\`

### 8. Rebuild Frontend (Required)
\`\`\`powershell
# IMPORTANT: Stop containers first
docker compose down

# Build frontend
cd frontend
npm run build
cd ..

# Start services again
docker compose up -d --build
\`\`\`

### 9. Verify Installation
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

## 📚 Additional Documentation
See the following files in the project:
- \`CONVERSATION_BACKUP.md\` - Complete project context
- \`PROJECT_MIGRATION_GUIDE.md\` - Detailed migration guide
- \`DEVELOPMENT_RULES_AND_POLICIES.md\` - Coding standards
- \`README.md\` - Project overview

## ⚠️ Important Notes
- Database credentials should be changed in production
- JWT_SECRET should be changed from default
- Frontend must be rebuilt after setting environment variables
- Docker containers must be stopped before rebuilding frontend
EOF

print_success "Restore instructions created"

# Create a compressed archive (optional, but useful for transfer)
print_status "Creating compressed archive..."
ARCHIVE_FILE="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"
cd "$BACKUP_DIR"
tar -czf "$ARCHIVE_FILE" "$BACKUP_NAME" 2>/dev/null || {
    print_warning "tar command not available, skipping archive creation"
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
echo "🎉 Full Backup Completed Successfully!"
echo "========================================"
echo ""
echo "📁 Backup location: $BACKUP_PATH"
echo "📊 Backup size: $BACKUP_SIZE"
if [ -n "$ARCHIVE_FILE" ]; then
    echo "📦 Archive: $ARCHIVE_FILE"
fi
echo ""
echo "📋 What's included:"
echo "  ✅ Complete project source code"
if [ -f "$BACKUP_PATH/database_backup.sql" ]; then
    DB_SIZE=$(du -h "$BACKUP_PATH/database_backup.sql" | cut -f1)
    echo "  ✅ Database backup ($DB_SIZE)"
else
    echo "  ⚠️  Database backup (skipped - container not running)"
fi
echo "  ✅ Environment variable templates"
echo "  ✅ Git information"
echo "  ✅ Restore instructions"
echo ""
echo "🚀 Next Steps:"
echo "  1. Transfer '$BACKUP_PATH' or '$ARCHIVE_FILE' to mini-PC"
echo "  2. Follow RESTORE_INSTRUCTIONS.md on the mini-PC"
echo ""
echo "📝 Transfer Methods:"
echo "  - SCP: scp -r '$BACKUP_NAME' cursors123@crm-mini:'C:\\Users\\cursors123\\Documents\\Projects_Shul\\Pilzno\\'"
if [ -n "$ARCHIVE_FILE" ]; then
    echo "  - SCP (archive): scp '${BACKUP_NAME}.tar.gz' cursors123@crm-mini:'C:\\Users\\cursors123\\Documents\\Projects_Shul\\Pilzno\\'"
fi
echo "  - Network share or USB drive"
echo ""

print_success "Backup process completed! 🎉"

