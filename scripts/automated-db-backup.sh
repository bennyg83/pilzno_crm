#!/bin/bash

# Pilzno Synagogue CRM - Automated Database Backup Script
# This script creates automated database backups to ensure data persistence
# Run this script periodically (via cron or scheduled task) to prevent data loss

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/backups/database"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="database_backup_${TIMESTAMP}.sql"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

print_status "Starting automated database backup..."
print_status "Backup file: $BACKUP_PATH"

# Check if database container is running
if ! docker ps --format '{{.Names}}' | grep -q "^pilzno-synagogue-db$"; then
    print_error "Database container 'pilzno-synagogue-db' is not running!"
    print_status "Attempting to start containers..."
    cd "$PROJECT_DIR"
    docker-compose up -d pilzno-synagogue-db
    sleep 10
fi

# Wait for database to be ready
print_status "Waiting for database to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker exec pilzno-synagogue-db pg_isready -U synagogue_admin -d pilzno_synagogue > /dev/null 2>&1; then
        print_success "Database is ready"
        break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    sleep 1
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    print_error "Database is not ready after $MAX_ATTEMPTS attempts"
    exit 1
fi

# Create database backup
print_status "Creating database backup..."
if docker exec pilzno-synagogue-db pg_dump -U synagogue_admin -d pilzno_synagogue > "$BACKUP_PATH"; then
    print_success "Database backup created successfully"
else
    print_error "Failed to create database backup"
    exit 1
fi

# Compress backup to save space
print_status "Compressing backup..."
if command -v gzip &> /dev/null; then
    gzip "$BACKUP_PATH"
    BACKUP_PATH="${BACKUP_PATH}.gz"
    print_success "Backup compressed: $BACKUP_PATH"
fi

# Calculate backup size
BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
print_success "Backup size: $BACKUP_SIZE"

# Keep only last 30 backups to prevent disk space issues
print_status "Cleaning up old backups (keeping last 30)..."
cd "$BACKUP_DIR"
ls -t database_backup_*.sql* 2>/dev/null | tail -n +31 | xargs -r rm -f
print_success "Old backups cleaned up"

# Create latest backup symlink for easy access
LATEST_BACKUP="$BACKUP_DIR/database_backup_latest.sql"
if [ -f "$BACKUP_PATH" ]; then
    rm -f "$LATEST_BACKUP" "$LATEST_BACKUP.gz" 2>/dev/null || true
    ln -sf "$(basename "$BACKUP_PATH")" "$LATEST_BACKUP"
    print_success "Latest backup link created"
fi

print_success "Automated backup completed successfully! 🎉"
print_status "Backup location: $BACKUP_PATH"

