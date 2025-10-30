# Environment Setup Configuration

## 🔧 Environment Variables

### Backend Environment (.env)
```env
# Application Configuration
NODE_ENV=development
PORT=3002

# Database Configuration
DB_HOST=pilzno-synagogue-db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=pilzno2024
DB_NAME=pilzno_synagogue

# JWT Configuration
JWT_SECRET=pilzno_synagogue_jwt_secret_2024

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Frontend Environment (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:3002
VITE_APP_NAME=Pilzno Synagogue CRM

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true

# External Services (Optional)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
VITE_STRIPE_PUBLIC_KEY=your-stripe-key
```

### Production Environment (.env.production)
```env
# Backend Production
NODE_ENV=production
PORT=3002
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USERNAME=your-production-db-user
DB_PASSWORD=your-secure-production-password
DB_NAME=pilzno_synagogue_prod
JWT_SECRET=your-very-secure-jwt-secret

# Frontend Production
VITE_API_URL=https://your-api-domain.com
VITE_APP_NAME=Pilzno Synagogue CRM
```

## 🐳 Docker Configuration

### Docker Compose Environment Variables
```yaml
# docker-compose.yml
version: '3.8'
services:
  pilzno-synagogue-db:
    image: postgres:15
    environment:
      POSTGRES_DB: pilzno_synagogue
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: pilzno2024
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  pilzno-synagogue-backend:
    build: ./backend
    environment:
      NODE_ENV: development
      DB_HOST: pilzno-synagogue-db
      DB_PORT: 5432
      DB_USERNAME: postgres
      DB_PASSWORD: pilzno2024
      DB_NAME: pilzno_synagogue
      JWT_SECRET: pilzno_synagogue_jwt_secret_2024
    ports:
      - "3002:3002"
    depends_on:
      - pilzno-synagogue-db

  pilzno-synagogue-frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - pilzno-synagogue-backend

volumes:
  postgres_data:
```

## 🔐 Security Configuration

### JWT Secret Generation
```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Database Password Security
```bash
# Generate a secure database password
openssl rand -base64 32
```

### SSL Certificate Setup (for production)
```bash
# Using Let's Encrypt (recommended)
certbot --nginx -d your-domain.com

# Or using self-signed certificates
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

## 🌐 Network Configuration

### Port Configuration
- **Frontend**: 3000 (HTTP)
- **Backend API**: 3002 (HTTP)
- **Database**: 5432 (PostgreSQL)
- **Production Frontend**: 80/443 (HTTP/HTTPS)
- **Production Backend**: 3002 (internal)

### Firewall Rules (Windows)
```powershell
# Allow inbound connections
New-NetFirewallRule -DisplayName "Pilzno Frontend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
New-NetFirewallRule -DisplayName "Pilzno Backend" -Direction Inbound -Protocol TCP -LocalPort 3002 -Action Allow
New-NetFirewallRule -DisplayName "PostgreSQL" -Direction Inbound -Protocol TCP -LocalPort 5432 -Action Allow
```

## 📊 Database Configuration

### PostgreSQL Settings
```sql
-- Create database
CREATE DATABASE pilzno_synagogue;

-- Create user (if needed)
CREATE USER pilzno_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE pilzno_synagogue TO pilzno_user;

-- Enable extensions
\c pilzno_synagogue
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Database Backup
```bash
# Create backup
docker --context desktop-linux compose exec pilzno-synagogue-db pg_dump -U postgres pilzno_synagogue > backup.sql

# Restore backup
docker --context desktop-linux compose exec -T pilzno-synagogue-db psql -U postgres pilzno_synagogue < backup.sql
```

## 🔄 Development Workflow

### Hot Reload Configuration
```javascript
// frontend/vite.config.ts
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      usePolling: true
    }
  }
});
```

### Backend Development
```javascript
// backend/src/index.ts
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 📱 Mobile/External Access

### CORS Configuration
```javascript
// backend/src/index.ts
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-domain.com',
    'https://mobile-app-domain.com'
  ],
  credentials: true
}));
```

### Reverse Proxy (Nginx)
```nginx
# nginx.conf
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Update environment variables for production
- [ ] Generate secure JWT secret
- [ ] Set up SSL certificates
- [ ] Configure domain name and DNS
- [ ] Set up database backups
- [ ] Configure monitoring and logging

### Post-deployment
- [ ] Test all functionality
- [ ] Verify SSL certificate
- [ ] Check database connectivity
- [ ] Monitor application logs
- [ ] Set up automated backups
- [ ] Configure error reporting

## 🔍 Troubleshooting

### Common Environment Issues

#### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :3000
netstat -ano | findstr :3002

# Kill process
taskkill /PID [process_id] /F
```

#### Database Connection Failed
```bash
# Check if database is running
docker --context desktop-linux compose ps pilzno-synagogue-db

# Check database logs
docker --context desktop-linux compose logs pilzno-synagogue-db

# Restart database
docker --context desktop-linux compose restart pilzno-synagogue-db
```

#### Environment Variables Not Loading
```bash
# Check if .env files exist
ls -la frontend/.env
ls -la backend/.env

# Verify environment variables
docker --context desktop-linux compose exec pilzno-synagogue-backend env | grep DB_
```

## 📝 Environment Validation

### Validation Script
```bash
#!/bin/bash
# validate-environment.sh

echo "🔍 Validating environment setup..."

# Check required files
if [ ! -f "frontend/.env" ]; then
    echo "❌ Frontend .env file missing"
    exit 1
fi

if [ ! -f "backend/.env" ]; then
    echo "❌ Backend .env file missing"
    exit 1
fi

# Check Docker services
if ! docker --context desktop-linux compose ps | grep -q "Up"; then
    echo "❌ Docker services not running"
    exit 1
fi

# Check API connectivity
if ! curl -s http://localhost:3002/health > /dev/null; then
    echo "❌ Backend API not accessible"
    exit 1
fi

# Check frontend
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Frontend not accessible"
    exit 1
fi

echo "✅ Environment validation passed!"
```

---

**Note**: Always keep your environment files secure and never commit them to version control. Use `.env.example` files for reference instead.
