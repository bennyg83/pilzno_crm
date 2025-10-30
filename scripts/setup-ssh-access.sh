#!/bin/bash

# Pilzno Synagogue CRM - SSH Access Setup Script
# This script helps set up SSH access for remote troubleshooting

echo "🔐 Pilzno Synagogue CRM - SSH Access Setup"
echo "=========================================="

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

echo ""
echo "📋 SSH Setup Instructions for Target System:"
echo "============================================="
echo ""
echo "1. On the TARGET system (the one with issues), run these commands in PowerShell as Administrator:"
echo ""
echo "   # Install OpenSSH Server"
echo "   Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0"
echo ""
echo "   # Start and enable SSH service"
echo "   Start-Service sshd"
echo "   Set-Service -Name sshd -StartupType 'Automatic'"
echo ""
echo "   # Configure firewall"
echo "   New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22"
echo ""
echo "2. Find the target system's IP address:"
echo "   ipconfig"
echo ""
echo "3. Note down the IPv4 address (e.g., 192.168.1.100)"
echo ""
echo "4. Create a user account for SSH access (if needed):"
echo "   net user sshuser /add"
echo "   net localgroup administrators sshuser /add"
echo ""
echo "5. Share the following information:"
echo "   - IP Address: [TARGET_IP]"
echo "   - Username: [TARGET_USERNAME]"
echo "   - Password: [TARGET_PASSWORD]"
echo ""

# Check if SSH client is available
print_status "Checking SSH client availability..."
if command -v ssh &> /dev/null; then
    print_success "SSH client is available"
else
    print_error "SSH client not found. Please install OpenSSH Client:"
    echo "   Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0"
fi

echo ""
echo "🔧 Once SSH is set up, you can connect using:"
echo "   ssh [username]@[target_ip]"
echo ""
echo "📁 After connecting, navigate to the project directory:"
echo "   cd /c/path/to/pilzno_crm"
echo ""
echo "🚀 Then run the troubleshooting scripts:"
echo "   chmod +x scripts/quick-fix-other-system.sh"
echo "   ./scripts/quick-fix-other-system.sh"
echo ""
echo "   # Or for detailed debugging:"
echo "   chmod +x scripts/debug-other-system.sh"
echo "   ./scripts/debug-other-system.sh"
echo ""

# Create a connection test script
print_status "Creating SSH connection test script..."
cat > test-ssh-connection.sh << 'EOF'
#!/bin/bash

# Test SSH connection to target system
echo "🔍 Testing SSH connection..."

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./test-ssh-connection.sh [username] [target_ip]"
    echo "Example: ./test-ssh-connection.sh administrator 192.168.1.100"
    exit 1
fi

USERNAME=$1
TARGET_IP=$2

echo "Testing connection to $USERNAME@$TARGET_IP..."

if ssh -o ConnectTimeout=10 -o BatchMode=yes $USERNAME@$TARGET_IP "echo 'SSH connection successful'" 2>/dev/null; then
    echo "✅ SSH connection successful!"
    echo ""
    echo "You can now connect using:"
    echo "ssh $USERNAME@$TARGET_IP"
    echo ""
    echo "Once connected, run:"
    echo "cd /c/path/to/pilzno_crm"
    echo "chmod +x scripts/quick-fix-other-system.sh"
    echo "./scripts/quick-fix-other-system.sh"
else
    echo "❌ SSH connection failed"
    echo ""
    echo "Please check:"
    echo "1. OpenSSH Server is installed and running on target system"
    echo "2. Firewall allows SSH (port 22)"
    echo "3. Username and IP address are correct"
    echo "4. Target system is on the same network"
fi
EOF

chmod +x test-ssh-connection.sh
print_success "SSH connection test script created"

echo ""
echo "🧪 To test the connection, run:"
echo "   ./test-ssh-connection.sh [username] [target_ip]"
echo ""
print_success "SSH setup instructions complete! 🎉"



