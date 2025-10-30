# 🏛️ Pilzno Synagogue CRM - New System Setup

## 🎯 Quick Start (5 Minutes)

### Prerequisites Check
```bash
# Run this in Git Bash to check if everything is installed
node --version    # Should be v18+
npm --version     # Should be 8+
docker --version  # Should be 20+
git --version     # Should be 2.30+
```

### One-Command Setup
```bash
# Clone the repository
git clone [repository-url] pilzno_crm
cd pilzno_crm

# Run the automated setup script
chmod +x scripts/setup-new-system.sh
./scripts/setup-new-system.sh
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3002
- **Default Login**: admin@pilzno.org / [check environment variables]

## 🏗️ What This System Does

### Core Features
- **👥 Family Management**: Complete family profiles with members and contact information
- **👤 Member Management**: Individual member details with Hebrew names and relationships
- **💰 Financial Tracking**: Pledges, donations, and annual financial reporting
- **📅 Important Dates**: Birthdays, anniversaries, and custom important dates
- **🔐 User Management**: Multi-user system with role-based access control
- **📊 Reports**: Financial summaries and family statistics
- **🌍 Hebrew Calendar**: Integrated Hebrew date calculations and conversions

### Technical Features
- **⚡ Modern Stack**: React 18, TypeScript, Node.js, PostgreSQL
- **🐳 Dockerized**: Complete containerized development environment
- **📱 Responsive**: Works on desktop, tablet, and mobile devices
- **🔒 Secure**: JWT authentication, role-based permissions
- **🎨 Professional UI**: Material-UI with custom synagogue theme

## 📋 System Requirements

### Minimum Requirements
- **OS**: Windows 10/11 (64-bit)
- **RAM**: 8GB (4GB for Docker)
- **Storage**: 10GB free space
- **Network**: Internet connection for initial setup

### Required Software
1. **Node.js v18+** - [Download here](https://nodejs.org/)
2. **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
3. **Git with Git Bash** - [Download here](https://git-scm.com/download/win)
4. **Cursor IDE** - [Download here](https://cursor.sh/)

## 🚀 Installation Steps

### Step 1: Install Prerequisites
```bash
# 1. Install Node.js (includes npm)
# Download from https://nodejs.org/ and install

# 2. Install Docker Desktop
# Download from https://www.docker.com/products/docker-desktop/
# Enable WSL2 backend during installation

# 3. Install Git
# Download from https://git-scm.com/download/win
# Make sure to install Git Bash

# 4. Install Cursor IDE
# Download from https://cursor.sh/
```

### Step 2: Clone and Setup
```bash
# Open Git Bash and navigate to your projects directory
cd /c/Users/[your-username]/Documents/Projects

# Clone the repository
git clone [repository-url] pilzno_crm
cd pilzno_crm

# Make setup script executable and run it
chmod +x scripts/setup-new-system.sh
./scripts/setup-new-system.sh
```

### Step 3: Verify Installation
```bash
# Check if all services are running
docker --context desktop-linux compose ps

# Test the application
curl http://localhost:3000  # Should return HTML
curl http://localhost:3002/health  # Should return JSON
```

## 🔧 Configuration

### Environment Variables
The setup script creates the necessary environment files, but you can customize them:

#### Backend (.env)
```env
NODE_ENV=development
PORT=3002
DB_HOST=pilzno-synagogue-db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=pilzno2024
DB_NAME=pilzno_synagogue
JWT_SECRET=pilzno_synagogue_jwt_secret_2024
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3002
VITE_APP_NAME=Pilzno Synagogue CRM
```

### Docker Configuration
The system uses Docker Compose with three services:
- **pilzno-synagogue-db**: PostgreSQL database
- **pilzno-synagogue-backend**: Node.js API server
- **pilzno-synagogue-frontend**: React frontend with Nginx

## 🎮 Usage

### Starting the Application
```bash
# Start all services
./start-app.sh

# Or manually
docker --context desktop-linux compose up -d
```

### Stopping the Application
```bash
# Stop all services
./stop-app.sh

# Or manually
docker --context desktop-linux compose down
```

### Viewing Logs
```bash
# View all logs
docker --context desktop-linux compose logs

# View specific service logs
docker --context desktop-linux compose logs pilzno-synagogue-frontend
docker --context desktop-linux compose logs pilzno-synagogue-backend
docker --context desktop-linux compose logs pilzno-synagogue-db
```

### Restarting Services
```bash
# Restart specific service
docker --context desktop-linux compose restart pilzno-synagogue-frontend
docker --context desktop-linux compose restart pilzno-synagogue-backend
docker --context desktop-linux compose restart pilzno-synagogue-db

# Restart all services
docker --context desktop-linux compose restart
```

## 🔍 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :3002

# Kill the process
taskkill /PID [process_id] /F
```

#### Docker Not Starting
```bash
# Check if Docker Desktop is running
docker info

# If not running, start Docker Desktop from Start Menu
# Then wait for it to fully start before running commands
```

#### Database Connection Issues
```bash
# Check if database is running
docker --context desktop-linux compose ps pilzno-synagogue-db

# Check database logs
docker --context desktop-linux compose logs pilzno-synagogue-db

# Restart database
docker --context desktop-linux compose restart pilzno-synagogue-db
```

#### Frontend Not Loading
```bash
# Check if frontend container is running
docker --context desktop-linux compose ps pilzno-synagogue-frontend

# Check frontend logs
docker --context desktop-linux compose logs pilzno-synagogue-frontend

# Rebuild frontend
docker --context desktop-linux compose up -d --build pilzno-synagogue-frontend
```

#### Backend API Not Responding
```bash
# Check if backend container is running
docker --context desktop-linux compose ps pilzno-synagogue-backend

# Check backend logs
docker --context desktop-linux compose logs pilzno-synagogue-backend

# Rebuild backend
docker --context desktop-linux compose up -d --build pilzno-synagogue-backend
```

### Reset Everything
```bash
# Stop all services
docker --context desktop-linux compose down

# Remove all containers and volumes
docker --context desktop-linux compose down -v
docker system prune -a

# Rebuild everything
docker --context desktop-linux compose up -d --build
```

## 📚 Documentation

### Available Documentation
- **PROJECT_MIGRATION_GUIDE.md** - Complete migration and setup guide
- **PROJECT_STRUCTURE.md** - Detailed project structure and architecture
- **ENVIRONMENT_SETUP.md** - Environment configuration details
- **BUG_TRACKING.md** - Known issues and bug tracking

### Key Files to Know
- **docker-compose.yml** - Main Docker configuration
- **frontend/package.json** - Frontend dependencies
- **backend/package.json** - Backend dependencies
- **scripts/setup-new-system.sh** - Automated setup script

## 🌐 External Access Setup

### For External Users
To allow external access to the application:

1. **Configure Port Forwarding**
   - Forward port 3000 to your external IP
   - Forward port 3002 to your external IP (for API)

2. **Set Up Domain Name**
   - Purchase a domain name
   - Point DNS to your server IP

3. **Configure SSL Certificate**
   - Use Let's Encrypt for free SSL
   - Or purchase a commercial certificate

4. **Update Environment Variables**
   - Change `VITE_API_URL` to your external domain
   - Update CORS settings in backend

5. **Configure Firewall**
   - Allow inbound connections on ports 80, 443, 3000, 3002
   - Block direct database access (port 5432)

### Production Deployment
```bash
# Use production Docker Compose
docker --context desktop-linux compose -f docker-compose.prod.yml up -d
```

## 🔐 Security Considerations

### Default Credentials
- **Database**: postgres / pilzno2024
- **JWT Secret**: pilzno_synagogue_jwt_secret_2024
- **Admin User**: admin@pilzno.org / [check database]

### Security Recommendations
1. **Change default passwords** before production use
2. **Generate new JWT secret** for production
3. **Use HTTPS** for external access
4. **Regular backups** of database
5. **Monitor logs** for suspicious activity
6. **Keep software updated** regularly

## 📞 Support

### Getting Help
1. **Check the logs** first for error messages
2. **Review the documentation** in the `/docs` folder
3. **Check the troubleshooting section** above
4. **Verify all prerequisites** are installed correctly

### Common Commands Reference
```bash
# Quick start
./start-app.sh

# Quick stop
./stop-app.sh

# View status
docker --context desktop-linux compose ps

# View logs
docker --context desktop-linux compose logs

# Rebuild everything
docker --context desktop-linux compose up -d --build

# Reset everything
docker --context desktop-linux compose down -v
docker system prune -a
```

## 🎉 Success!

If everything is working correctly, you should see:
- ✅ Frontend accessible at http://localhost:3000
- ✅ Backend API responding at http://localhost:3002
- ✅ Database running on port 5432
- ✅ All Docker containers showing "Up" status

You're now ready to use the Pilzno Synagogue CRM system! 🚀

---

**Last Updated**: January 2025  
**Version**: 2.0  
**Status**: Production Ready
