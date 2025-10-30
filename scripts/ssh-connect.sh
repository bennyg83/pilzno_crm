#!/bin/bash

# SSH Connection Script for Target System
# This script connects to the target system and runs commands

echo "🔗 Connecting to target system at 10.100.102.112..."
echo "Username: cursors123"
echo ""

# Function to run commands on remote system
run_remote_command() {
    local command="$1"
    echo "Running: $command"
    echo "----------------------------------------"
    
    # Use sshpass if available, otherwise use expect
    if command -v sshpass &> /dev/null; then
        sshpass -p 'zaq1@WSXcde34rfv' ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no cursors123@10.100.102.112 "$command"
    else
        # Create a temporary expect script
        cat > /tmp/ssh_connect.exp << EOF
#!/usr/bin/expect -f
set timeout 10
spawn ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no cursors123@10.100.102.112
expect "password:"
send "zaq1@WSXcde34rfv\r"
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

# Test basic connection
echo "🧪 Testing basic connection..."
run_remote_command "echo 'Connection successful!' && whoami && hostname && pwd"

# Check system info
echo "📊 Getting system information..."
run_remote_command "uname -a && df -h"

# Check if Docker is installed
echo "🐳 Checking Docker installation..."
run_remote_command "docker --version || echo 'Docker not found'"

# Check if Node.js is installed
echo "📦 Checking Node.js installation..."
run_remote_command "node --version || echo 'Node.js not found'"

# Check if Git is installed
echo "🔧 Checking Git installation..."
run_remote_command "git --version || echo 'Git not found'"

echo "✅ Connection test completed!"
echo ""
echo "To connect manually, run:"
echo "ssh cursors123@10.100.102.112"
echo "Password: zaq1@WSXcde34rfv"
