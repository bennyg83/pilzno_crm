# Docker Compose Port Rules and Configuration Management

## Port Restrictions (DO NOT USE)

The following ports are reserved by other builds on this computer and should **NEVER** be used:

- **3000** - Reserved by other build
- **5173** - Reserved by other build  
- **5432** - Reserved by other build (PostgreSQL default)
- **5434** - Reserved by other build
- **11434** - Reserved by other build
- **11435** - Reserved by other build

## Current Port Assignments

### Base Configuration
- **Database**: `5435` (avoiding 5432, 5434)
- **Backend**: `3002` (avoiding 3000)
- **Frontend**: `3001` (avoiding 3000)
- **Nginx HTTP**: `8080` (avoiding 80)
- **Nginx HTTPS**: `8443` (avoiding 443)

### Environment Variables Required

All Docker Compose files now require the following environment variables to be set:

```bash
# Required - No defaults (must be set)
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_jwt_secret_here

# Optional - Have sensible defaults
DB_PORT=5435
DB_USER=synagogue_admin
DB_NAME=pilzno_synagogue
BACKEND_PORT=3002
FRONTEND_PORT=3001
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:3002
```

## Configuration Files Updated

### ✅ Updated Files
1. **`docker-compose.yml`** - Base configuration with environment variables
2. **`docker-compose.prod.yml`** - Production with proper port assignments
3. **`docker-compose.simple.yml`** - Simple setup without hardcoded IPs
4. **`docker-compose.external.yml`** - External access with proper ports
5. **`scripts/environment-template.env`** - Template for environment variables

### 🔧 Override Files (Unchanged)
- **`docker-compose.override.yml`** - Local HTTPS overrides
- **`docker-compose.https.yml`** - HTTPS extension

## Usage Instructions

### 1. Set Up Environment Variables
```bash
# Copy the template
cp scripts/environment-template.env .env

# Edit the file with your values
# IMPORTANT: Set DB_PASSWORD and JWT_SECRET
```

### 2. Run Different Configurations

#### Development (Base)
```bash
docker-compose up -d
```

#### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### Simple with Nginx
```bash
docker-compose -f docker-compose.simple.yml up -d
```

#### External Access
```bash
docker-compose -f docker-compose.external.yml up -d
```

#### HTTPS with Override
```bash
docker-compose -f docker-compose.simple.yml -f docker-compose.override.yml up -d
```

## Security Improvements

### ✅ Implemented
- All database passwords now use environment variables
- JWT secrets are configurable
- No hardcoded credentials in files
- Port conflicts eliminated

### 🔒 Security Notes
- **Never commit `.env` files** to version control
- Use strong, unique passwords for production
- Rotate JWT secrets regularly
- Consider using Docker secrets for production

## Network Configuration

Each configuration uses a unique subnet to avoid conflicts:
- **Base/Production**: `172.21.0.0/16`
- **External**: `172.22.0.0/16`  
- **Simple**: `172.24.0.0/16`
- **New Default**: `172.25.0.0/16`

## Troubleshooting

### Port Already in Use
If you get port conflicts:
1. Check the port restrictions list above
2. Verify no other services are using the assigned ports
3. Modify the `.env` file to use different ports

### Environment Variables Not Loading
1. Ensure `.env` file exists in the project root
2. Check that required variables are set
3. Restart Docker Compose after changing `.env`

### Database Connection Issues
1. Verify `DB_PASSWORD` is set correctly
2. Check that `DB_PORT` doesn't conflict with other services
3. Ensure database container is healthy before starting backend
