# Pilzno Synagogue CRM - Project Migration Guide

## 🎯 Project Overview
This is a comprehensive synagogue management system built with React/TypeScript frontend and Node.js/TypeScript backend, using PostgreSQL database and Docker for containerization.

## 📋 System Requirements

### Required Software
- **Windows 10/11** (64-bit)
- **Docker Desktop** (Latest version with WSL2 backend)
- **Git** (with Git Bash)
- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Cursor IDE** (Latest version)

### Optional but Recommended
- **PostgreSQL** (for local development, though Docker is preferred)
- **GitHub Desktop** (for easier Git management)

## 🏗️ Project Architecture

```
pilzno_crm/
├── frontend/                 # React/TypeScript frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Main application pages
│   │   ├── services/        # API service layer
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   └── contexts/        # React contexts (Auth, etc.)
│   ├── package.json
│   └── Dockerfile
├── backend/                  # Node.js/TypeScript backend
│   ├── src/
│   │   ├── entities/        # TypeORM database entities
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Express middleware
│   │   └── migrations/      # Database migrations
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml       # Main Docker Compose configuration
├── docker-compose.prod.yml  # Production configuration
└── scripts/                 # Setup and utility scripts
```

## 🚀 Initial Setup Instructions

### 1. Prerequisites Installation

#### Install Node.js
```bash
# Download from https://nodejs.org/
# Install Node.js v18+ (includes npm)
# Verify installation:
node --version
npm --version
```

#### Install Docker Desktop
```bash
# Download from https://www.docker.com/products/docker-desktop/
# Install Docker Desktop for Windows
# Enable WSL2 backend during installation
# Verify installation:
docker --version
docker-compose --version
```

#### Install Git
```bash
# Download from https://git-scm.com/download/win
# Install Git for Windows (includes Git Bash)
# Verify installation:
git --version
```

### 2. Project Setup

#### Clone the Repository
```bash
# Open Git Bash and navigate to desired directory
cd /c/Users/[username]/Documents/Projects
git clone [repository-url] pilzno_crm
cd pilzno_crm
```

#### Install Dependencies
```bash
# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

## 🐳 Docker Configuration

### Docker Desktop Settings
- **Use WSL2 backend** (required for performance)
- **Enable Kubernetes** (optional)
- **Allocate at least 4GB RAM** to Docker
- **Enable file sharing** for the project directory

### Docker Compose Services
The project uses the following services:
- **pilzno-synagogue-db**: PostgreSQL database
- **pilzno-synagogue-backend**: Node.js API server
- **pilzno-synagogue-frontend**: React frontend (Nginx)

## 🔧 Development Workflow

### Starting the Application
```bash
# Start all services
docker --context desktop-linux compose up -d

# Start specific service
docker --context desktop-linux compose up -d pilzno-synagogue-frontend
docker --context desktop-linux compose up -d pilzno-synagogue-backend
```

### Building Services
```bash
# Build and start frontend
docker --context desktop-linux compose up -d --build pilzno-synagogue-frontend

# Build and start backend
docker --context desktop-linux compose up -d --build pilzno-synagogue-backend
```

### Stopping Services
```bash
# Stop all services
docker --context desktop-linux compose down

# Stop specific service
docker --context desktop-linux compose stop pilzno-synagogue-frontend
```

## 🗄️ Database Management

### Database Migrations
```bash
# Run migrations (if needed)
docker --context desktop-linux compose exec pilzno-synagogue-backend npm run migration:run
```

### Database Access
```bash
# Connect to database
docker --context desktop-linux compose exec pilzno-synagogue-db psql -U postgres -d pilzno_synagogue
```

## 🌐 Application Access

### Local Development
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3002
- **Database**: localhost:5432

### Default Credentials
- **Admin User**: admin@pilzno.org
- **Password**: [Check environment variables or database]

## 🔐 Environment Configuration

### Required Environment Variables
Create `.env` files in both frontend and backend directories:

#### Backend (.env)
```env
NODE_ENV=development
PORT=3002
DB_HOST=pilzno-synagogue-db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=pilzno_synagogue
JWT_SECRET=your_jwt_secret
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3002
VITE_APP_NAME=Pilzno Synagogue CRM
```

## 📁 Key Files and Their Purposes

### Frontend Key Files
- `src/App.tsx` - Main application routing
- `src/components/Layout.tsx` - Main layout with navigation
- `src/pages/FamiliesPage.tsx` - Family management (main feature)
- `src/pages/MembersPage.tsx` - Member management
- `src/pages/DonationsPage.tsx` - Donations tracking
- `src/services/apiService.ts` - API communication layer
- `src/types/index.ts` - TypeScript type definitions

### Backend Key Files
- `src/index.ts` - Main server entry point
- `src/data-source.ts` - TypeORM database configuration
- `src/entities/` - Database entity definitions
- `src/routes/` - API route handlers
- `src/middleware/auth.ts` - Authentication middleware

### Docker Files
- `docker-compose.yml` - Main development configuration
- `docker-compose.prod.yml` - Production configuration
- `frontend/Dockerfile` - Frontend container configuration
- `backend/Dockerfile` - Backend container configuration

## 🚨 Important Rules and Policies

### Development Rules
1. **Always use Git Bash** for terminal commands
2. **Use Docker Desktop context** (`--context desktop-linux`) for all Docker commands
3. **Never use MongoDB** - This project uses PostgreSQL only
4. **Follow TypeScript strict mode** - All code must be properly typed
5. **Use Material-UI** for all UI components
6. **Follow the established color scheme** - Purple theme (#6A1B9A, #4A148C)

### Code Standards
1. **JSDoc comments** for all functions and components
2. **Consistent naming** - camelCase for variables, PascalCase for components
3. **Error handling** - Always include try-catch blocks for async operations
4. **Loading states** - Show loading indicators for all async operations
5. **Form validation** - Client-side validation for all forms

### Database Rules
1. **Use TypeORM migrations** for all schema changes
2. **Never modify entities directly** - Always create migrations
3. **Backup database** before major changes
4. **Use proper foreign key relationships**

## 🔧 Troubleshooting

### Common Issues

#### Docker Issues
```bash
# Reset Docker Desktop
# Go to Docker Desktop > Troubleshoot > Reset to factory defaults

# Clean up Docker resources
docker system prune -a
docker volume prune
```

#### Port Conflicts
```bash
# Check what's using ports
netstat -ano | findstr :3000
netstat -ano | findstr :3002
netstat -ano | findstr :5432

# Kill process using port
taskkill /PID [process_id] /F
```

#### Database Connection Issues
```bash
# Check if database is running
docker --context desktop-linux compose ps

# Restart database
docker --context desktop-linux compose restart pilzno-synagogue-db
```

#### Build Issues
```bash
# Clean and rebuild
docker --context desktop-linux compose down
docker --context desktop-linux compose build --no-cache
docker --context desktop-linux compose up -d
```

## 📊 Project Status

### Completed Features
- ✅ User authentication and authorization
- ✅ Family management with detailed views
- ✅ Member management with view/edit capabilities
- ✅ Financial tracking (pledges and donations)
- ✅ Hebrew calendar integration
- ✅ Additional important dates management
- ✅ Settings and user management
- ✅ Responsive design and professional UI

### Current Phase
- **Phase 2 Complete** - Core functionality implemented
- **Phase 3 Ready** - Events and advanced features

## 🌐 External Access Setup

### For External User Access
1. **Configure reverse proxy** (Nginx or similar)
2. **Set up SSL certificates** for HTTPS
3. **Configure domain name** and DNS
4. **Update environment variables** for production URLs
5. **Set up proper firewall rules**
6. **Configure database security** for external access

### Production Deployment
```bash
# Use production Docker Compose
docker --context desktop-linux compose -f docker-compose.prod.yml up -d
```

## 📞 Support and Maintenance

### Logs
```bash
# View application logs
docker --context desktop-linux compose logs pilzno-synagogue-frontend
docker --context desktop-linux compose logs pilzno-synagogue-backend
docker --context desktop-linux compose logs pilzno-synagogue-db
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker --context desktop-linux compose up -d --build
```

## 🎯 Quick Start Checklist

- [ ] Install Node.js v18+
- [ ] Install Docker Desktop with WSL2
- [ ] Install Git with Git Bash
- [ ] Clone repository
- [ ] Install dependencies (frontend and backend)
- [ ] Configure environment variables
- [ ] Start Docker services
- [ ] Access application at http://localhost:3000
- [ ] Login with admin credentials
- [ ] Verify all features are working

## 📝 Notes for Cursor Agent

When working on this project:
1. **Always use the terminal in Git Bash mode**
2. **Use Docker Desktop context for all Docker commands**
3. **Follow the established patterns** in existing code
4. **Test changes thoroughly** before committing
5. **Update this guide** if you make significant changes
6. **Maintain the purple theme** and Material-UI consistency
7. **Add JSDoc comments** to new functions and components
8. **Use TypeScript strictly** - no `any` types without good reason

---

**Last Updated**: January 2025
**Version**: 2.0
**Status**: Production Ready
