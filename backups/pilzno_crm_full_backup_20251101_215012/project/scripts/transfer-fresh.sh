#!/bin/bash

# Fresh Transfer Script for Pilzno CRM Project
# Target: 10.100.102.112 (cursors123)
# This script handles the complete transfer process

echo "🚀 Pilzno CRM - Fresh Transfer Script"
echo "===================================="
echo ""

# Configuration
TARGET_IP="10.100.102.112"
TARGET_USER="cursors123"
TARGET_PASS="zaq1@WSXce34rfv"
LOCAL_PROJECT_PATH="/c/Users/binya/Documents/Projects_Shul/Pilzno/pilzno_crm"
REMOTE_PROJECT_PATH="/home/cursors123/pilzno_crm"

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to run commands on remote system
run_remote_command() {
    local command="$1"
    echo "Running: $command"
    echo "----------------------------------------"
    
    # Use sshpass if available, otherwise use expect
    if command -v sshpass &> /dev/null; then
        sshpass -p "$TARGET_PASS" ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$TARGET_USER@$TARGET_IP" "$command"
    else
        # Create a temporary expect script
        cat > /tmp/ssh_connect.exp << EOF
#!/usr/bin/expect -f
set timeout 30
spawn ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no $TARGET_USER@$TARGET_IP
expect "password:"
send "$TARGET_PASS\r"
expect "$ "
send "$command\r"
expect "$ "
send "exit\r"
expect eof
EOF
        chmod +x /tmp/ssh_connect.exp
        /tmp/ssh_connect.exp
        rm -f /tmp/ssh_connect.exp
    fi
    echo "----------------------------------------"
    echo ""
}

# Check if local project exists
print_status "Checking local project path..."
if [ ! -d "$LOCAL_PROJECT_PATH" ]; then
    print_error "Local project path not found: $LOCAL_PROJECT_PATH"
    exit 1
fi
print_success "Local project found"

# Test SSH connection
print_status "Testing SSH connection..."
if ! run_remote_command "echo 'SSH connection successful' && whoami && hostname && pwd"; then
    print_error "SSH connection failed"
    exit 1
fi
print_success "SSH connection established"

# Clean up any existing project on remote system
print_status "Cleaning up any existing project on remote system..."
run_remote_command "rm -rf '$REMOTE_PROJECT_PATH'"

# Create remote directory
print_status "Creating remote project directory..."
run_remote_command "mkdir -p '$REMOTE_PROJECT_PATH'"

# Transfer project files using tar for reliable transfer
print_status "Creating project archive..."
cd "$(dirname "$LOCAL_PROJECT_PATH")"
tar -czf pilzno_crm_backup.tar.gz "$(basename "$LOCAL_PROJECT_PATH")"

# Transfer the archive
print_status "Transferring project archive..."
if command -v sshpass &> /dev/null; then
    sshpass -p "$TARGET_PASS" scp -o StrictHostKeyChecking=no pilzno_crm_backup.tar.gz "$TARGET_USER@$TARGET_IP:/tmp/"
else
    scp -o StrictHostKeyChecking=no pilzno_crm_backup.tar.gz "$TARGET_USER@$TARGET_IP:/tmp/"
fi

# Extract on remote system
print_status "Extracting project on remote system..."
run_remote_command "cd /tmp && tar -xzf pilzno_crm_backup.tar.gz -C '$REMOTE_PROJECT_PATH' --strip-components=1"

# Set up project on remote system
print_status "Setting up project on remote system..."
run_remote_command "cd '$REMOTE_PROJECT_PATH' && chmod +x scripts/*.sh"

# Verify transfer
print_status "Verifying transfer..."
run_remote_command "ls -la '$REMOTE_PROJECT_PATH' && echo 'Key files:' && find '$REMOTE_PROJECT_PATH' -name 'package.json' -o -name 'docker-compose.yml' -o -name 'README.md'"

# Check system requirements
print_status "Checking system requirements..."
run_remote_command "echo 'Docker:' && docker --version || echo 'Docker not found'"
run_remote_command "echo 'Node.js:' && node --version || echo 'Node.js not found'"
run_remote_command "echo 'Git:' && git --version || echo 'Git not found'"

# Clean up local archive
print_status "Cleaning up local archive..."
rm -f pilzno_crm_backup.tar.gz

# Clean up remote archive
run_remote_command "rm -f /tmp/pilzno_crm_backup.tar.gz"

print_success "Project transfer completed successfully!"
echo ""
echo "📋 Next steps on the remote system:"
echo "1. SSH to the remote system: ssh $TARGET_USER@$TARGET_IP"
echo "2. Navigate to project: cd '$REMOTE_PROJECT_PATH'"
echo "3. Run setup script: ./scripts/ubuntu-quick-start.sh"
echo "4. Start the project: docker compose up -d"
echo ""
echo "🔧 Remote project location: $REMOTE_PROJECT_PATH"
echo "🌐 Access the application at: http://$TARGET_IP:3003"
echo ""
echo "📁 Project includes:"
echo "✓ Frontend (React + TypeScript)"
echo "✓ Backend (Node.js + Express + TypeORM)"
echo "✓ Database (PostgreSQL + Docker)"
echo "✓ All configuration files"
echo "✓ Documentation and scripts"

