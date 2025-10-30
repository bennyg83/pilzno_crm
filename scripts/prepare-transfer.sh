#!/bin/bash

# Prepare Transfer Script for Pilzno CRM Project
# This script creates a clean archive for transfer

echo "📦 Preparing Pilzno CRM for transfer..."
echo "====================================="
echo ""

# Create archive excluding unnecessary files
echo "Creating project archive..."
tar -czf pilzno_crm_backup.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=dist \
    --exclude=logs \
    --exclude=*.log \
    --exclude=frontend;C \
    .

if [ $? -eq 0 ]; then
    echo "✅ Archive created successfully: pilzno_crm_backup.tar.gz"
    echo ""
    echo "📊 Archive size:"
    ls -lh pilzno_crm_backup.tar.gz
    echo ""
    echo "📋 Next steps:"
    echo "1. Transfer the archive to remote server:"
    echo "   scp pilzno_crm_backup.tar.gz cursors123@10.100.102.112:/tmp/"
    echo ""
    echo "2. SSH to remote server:"
    echo "   ssh cursors123@10.100.102.112"
    echo ""
    echo "3. Extract the project:"
    echo "   cd /home/cursors123"
    echo "   tar -xzf /tmp/pilzno_crm_backup.tar.gz -C pilzno_crm --strip-components=1"
    echo "   chmod +x pilzno_crm/scripts/*.sh"
    echo ""
    echo "4. Clean up:"
    echo "   rm /tmp/pilzno_crm_backup.tar.gz"
else
    echo "❌ Failed to create archive"
    exit 1
fi

