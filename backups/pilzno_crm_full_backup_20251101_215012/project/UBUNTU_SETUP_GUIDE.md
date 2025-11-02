# Ubuntu Cursor Setup Guide for Pilzno CRM Project

## Project Overview
This is a comprehensive CRM system for synagogue management, built with:
- **Frontend**: React + TypeScript + Material-UI + Vite
- **Backend**: Node.js + Express + TypeORM + PostgreSQL
- **Infrastructure**: Docker + Docker Compose
- **Authentication**: JWT-based with role-based access control

## Prerequisites
- Ubuntu 20.04+ (recommended: 22.04 LTS)
- Docker and Docker Compose installed
- Git
- Cursor IDE (or VS Code)
- Node.js 18+ (for local development)

## Initial Setup Steps

### 1. Install Docker and Docker Compose
```bash
# Update package list
sudo apt update

# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add your user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
docker --version
docker compose version
```

### 2. Install Node.js (for local development)
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install Git
```bash
sudo apt install -y git
git --version
```

## Project Setup

### 1. Navigate to Project Directory
```bash
cd /path/to/your/project  # Replace with actual path where you copied the project
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```bash
cp scripts/environment-template.env .env
```

Edit `.env` with your local settings:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_DATABASE=pilzno_crm

# Backend Configuration
BACKEND_PORT=3001
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development

# Frontend Configuration
FRONTEND_PORT=3003
VITE_API_BASE_URL=http://localhost:3001

# Docker Configuration
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=pilzno_crm
```

### 3. Database Setup
```bash
# Start PostgreSQL container
docker compose up -d postgres

# Wait for database to be ready (check logs)
docker compose logs postgres

# Initialize database schema
docker compose exec postgres psql -U postgres -d pilzno_crm -f /docker-entrypoint-initdb.d/init-db.sql
```

### 4. Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### 5. Start Development Environment
```bash
# Start all services
docker compose up -d

# Or start individual services
docker compose up -d postgres
docker compose up -d backend
docker compose up -d frontend
```

## Development Workflow

### 1. Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

### 2. Frontend Development
```bash
cd frontend
npm run dev  # Starts Vite dev server
```

### 3. Database Management
```bash
# Access PostgreSQL
docker compose exec postgres psql -U postgres -d pilzno_crm

# Run SQL scripts
docker compose exec postgres psql -U postgres -d pilzno_crm -f /path/to/script.sql

# Backup database
docker compose exec postgres pg_dump -U postgres pilzno_crm > backup.sql
```

## Project Structure

```
pilzno_crm/
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── entities/       # TypeORM entities
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   └── data-source.ts  # Database connection
│   ├── package.json
│   └── Dockerfile
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── contexts/       # React contexts
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml       # Development environment
├── docker-compose.prod.yml  # Production environment
└── scripts/                 # Utility scripts
```

## Key Features Implemented

### 1. Authentication System
- JWT-based authentication
- Role-based access control (Super Admin, Admin, Manager, User, Viewer)
- User permissions system

### 2. Family Management
- Family creation and management
- Family member management
- Important dates tracking (birthdays, anniversaries, etc.)
- Hebrew date conversion using @hebcal/core

### 3. Settings Management
- User management with roles and permissions
- Email template management
- System settings configuration
- User invitation system

### 4. Additional Important Dates
- Custom date types (wedding anniversary, aliyah, etc.)
- English to Hebrew date conversion
- Date management per family

## Common Development Tasks

### 1. Adding New Entities
1. Create entity in `backend/src/entities/`
2. Add to `data-source.ts`
3. Create API routes in `backend/src/routes/`
4. Add frontend types in `frontend/src/types/`
5. Create frontend components/pages

### 2. Database Migrations
```bash
# Generate migration
cd backend
npm run typeorm migration:generate -- -n MigrationName

# Run migrations
npm run typeorm migration:run

# Revert migration
npm run typeorm migration:revert
```

### 3. API Testing
```bash
# Test API endpoints
curl -X GET http://localhost:3001/api/families
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

## Troubleshooting

### 1. Docker Issues
```bash
# Check container status
docker compose ps

# View logs
docker compose logs [service_name]

# Restart services
docker compose restart

# Clean up containers
docker compose down -v
```

### 2. Database Connection Issues
```bash
# Check if PostgreSQL is running
docker compose exec postgres pg_isready -U postgres

# Reset database
docker compose down -v
docker compose up -d postgres
# Re-run initialization scripts
```

### 3. Port Conflicts
```bash
# Check what's using ports
sudo netstat -tulpn | grep :3001
sudo netstat -tulpn | grep :3003

# Kill processes if needed
sudo kill -9 [PID]
```

### 4. Permission Issues
```bash
# Fix Docker permissions
sudo chown $USER:$USER ~/.docker
sudo chmod 666 /var/run/docker.sock
```

## Production Deployment

### 1. Build Production Images
```bash
# Build all services
docker compose -f docker-compose.prod.yml build

# Push to registry (if using one)
docker tag pilzno_crm_backend:latest your-registry/pilzno_crm_backend:latest
docker push your-registry/pilzno_crm_backend:latest
```

### 2. Environment Variables for Production
```env
NODE_ENV=production
JWT_SECRET=very_secure_production_secret
DB_HOST=production_db_host
DB_PASSWORD=production_db_password
```

### 3. SSL/HTTPS Setup
The project includes nginx configurations for HTTPS:
- `nginx/simple-https.conf` - Basic HTTPS setup
- `nginx/https.conf` - Advanced HTTPS with SSL

## Development Best Practices

### 1. Code Organization
- Keep components small and focused
- Use TypeScript interfaces for all data structures
- Implement proper error handling
- Add JSDoc comments for complex functions

### 2. Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "feat: add new feature description"

# Push and create PR
git push origin feature/new-feature
```

### 3. Testing
- Test API endpoints with tools like Postman or curl
- Test frontend components manually
- Validate Hebrew date conversions
- Test user permissions and role access

## Useful Commands Reference

```bash
# Development
npm run dev          # Start backend dev server
npm run build        # Build backend
npm run start        # Start backend production

# Frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Docker
docker compose up -d     # Start all services
docker compose down      # Stop all services
docker compose logs      # View all logs
docker compose restart   # Restart all services

# Database
docker compose exec postgres psql -U postgres -d pilzno_crm
docker compose exec postgres pg_dump -U postgres pilzno_crm > backup.sql
```

## Next Steps for Development

1. **Complete Settings Management**: Finish implementing the settings management system
2. **Email System**: Implement email sending functionality for templates
3. **Reporting**: Add comprehensive reporting features
4. **Event Management**: Complete the events system
5. **Donation Management**: Implement donation tracking
6. **Mobile Responsiveness**: Ensure all components work on mobile devices
7. **Testing**: Add unit and integration tests
8. **Documentation**: Complete API documentation

## Support and Resources

- **TypeORM Documentation**: https://typeorm.io/
- **Material-UI Documentation**: https://mui.com/
- **React Documentation**: https://reactjs.org/
- **Docker Documentation**: https://docs.docker.com/
- **Hebrew Calendar Library**: https://github.com/hebcal/hebcal

## Notes for Ubuntu Development

- Use Git Bash or WSL if you prefer Unix-like commands
- File paths use forward slashes (/) not backslashes (\)
- Environment variables are case-sensitive
- Docker commands work the same as on Windows
- Consider using `sudo` for system-level operations

---

**Last Updated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Project Version**: 1.0.0
**Setup Guide Version**: 1.0
