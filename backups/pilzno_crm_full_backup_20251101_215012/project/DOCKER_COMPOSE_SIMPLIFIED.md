# Docker Compose Simplified Usage Guide

## **New Simplified Structure**

The Docker Compose files have been reorganized into just 2 files with no redundancy:

### **File Structure:**
- **`docker-compose.yml`** - Complete configuration with development defaults
- **`docker-compose.prod.yml`** - Production overrides only (extends main file)

## **Usage Commands**

### **1. Development (Default)**
```bash
# Simple development setup
docker-compose up -d
```

### **2. Production**
```bash
# Production with resource limits and production builds
docker-compose -f docker-compose.prod.yml up -d
```

## **What Each Configuration Provides**

### **Main Configuration (`docker-compose.yml`)**
- ✅ PostgreSQL database (port 5435)
- ✅ Node.js backend (port 3002)
- ✅ React frontend (port 3001)
- ✅ Health checks and networking
- ✅ Environment variable support
- ✅ Test credential fallbacks
- ✅ Development build targets
- ✅ Source code mounting for hot reload

### **Production Override (`docker-compose.prod.yml`)**
- ✅ Production build targets
- ✅ Resource limits (memory constraints)
- ✅ Always restart policy
- ✅ Production container names

## **Environment Variables**

### **Required Variables:**
```bash
DB_PASSWORD=your_password_here
JWT_SECRET=your_jwt_secret_here
```

### **Optional Variables (with defaults):**
```bash
DB_PORT=5435
BACKEND_PORT=3002
FRONTEND_PORT=3001
BUILD_TARGET=development
NODE_ENV=development
NETWORK_SUBNET=172.25.0.0/16
```

## **Migration from Old Structure**

### **Old Commands → New Commands:**
```bash
# Old: docker-compose up -d
# New: docker-compose up -d (same!)

# Old: docker-compose -f docker-compose.prod.yml up -d
# New: docker-compose -f docker-compose.prod.yml up -d (same!)

# Old: docker-compose -f docker-compose.simple.yml up -d
# New: docker-compose up -d (development mode)

# Old: docker-compose -f docker-compose.external.yml up -d
# New: docker-compose up -d (development mode)
```

## **Benefits of New Structure**

1. **Single Source of Truth** - All configurations in one main file
2. **Easier Maintenance** - Update once, applies everywhere
3. **Clearer Overrides** - Easy to see what changes in production
4. **No Redundancy** - No duplicate service definitions
5. **Simpler File Management** - Only 2 files to manage
6. **Easier Debugging** - Simpler to understand what's running

## **Port Assignments (Unchanged)**

- **Database**: 5435 (avoiding 5432, 5434)
- **Backend**: 3002 (avoiding 3000)
- **Frontend**: 3001 (avoiding 3000)

## **Troubleshooting**

### **Service Not Starting**
1. Verify environment variables are set in `.env`
2. Check for port conflicts with other services
3. Ensure Docker is running

### **Production Build Issues**
1. Ensure `docker-compose.prod.yml` is included
2. Check that `BUILD_TARGET=production` is set
3. Verify Dockerfile has production target

### **Adding Nginx Later (If Needed)**
If you need Nginx reverse proxy in the future, you can create a `docker-compose.nginx.yml` file that extends the main configuration and adds Nginx services.
