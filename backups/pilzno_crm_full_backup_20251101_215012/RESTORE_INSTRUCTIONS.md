# Pilzno CRM - Restore Instructions for Mini-PC

## 📅 Backup Information
- **Backup Date**: Sat, Nov  1, 2025  9:50:21 PM
- **Source System**: BennyGDev
- **Source Path**: /c/Users/binya/Documents/Projects Shul/Pilzno/pilzno_crm

## 📦 What's Included
- ✅ Complete project source code (excluding node_modules, dist, .git)
- ✅ Database backup (database_backup.sql) - if available
- ✅ Environment variable templates
- ✅ Git remote information
- ✅ All documentation

## 🚀 Restore Steps on Mini-PC

### 1. Transfer Files to Mini-PC
```powershell
# Via SCP (from source system):
scp -r "pilzno_crm_full_backup_20251101_215012" cursors123@crm-mini:"C:\Users\cursors123\Documents\Projects_Shul\Pilzno\"

# Or copy via network share/USB drive
```

### 2. Extract/Restore Project Files
```powershell
# Navigate to backup location
cd "C:\Users\cursors123\Documents\Projects_Shul\Pilzno$BACKUP_NAME"

# Copy project files to destination
xcopy /E /I /Y project "C:\Users\cursors123\Documents\Projects_Shul\Pilzno\pilzno_crm"
```

### 3. Set Up Environment Variables
```powershell
cd "C:\Users\cursors123\Documents\Projects_Shul\Pilzno\pilzno_crm"

# Backend environment
copy env_templates\backend.env.template backend\.env
# Edit backend\.env with your values

# Frontend environment
copy env_templates\frontend.env.production.template frontend\.env.production
# Edit frontend\.env.production with your values
```

### 4. Install Dependencies
```powershell
# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

### 5. Start Docker Services
```powershell
# Start all services
docker compose up -d

# Wait for database to be ready (check logs)
docker compose logs -f pilzno-synagogue-db
```

### 6. Restore Database
```powershell
# If database_backup.sql exists:
docker compose exec -T pilzno-synagogue-db psql -U synagogue_admin -d pilzno_synagogue < ..\pilzno_crm_full_backup_20251101_215012\database_backup.sql

# Or if using postgres user:
docker compose exec -T pilzno-synagogue-db psql -U postgres -d pilzno_synagogue < ..\pilzno_crm_full_backup_20251101_215012\database_backup.sql
```

### 7. Set Up Git Remote (Optional)
```powershell
cd "C:\Users\cursors123\Documents\Projects_Shul\Pilzno\pilzno_crm"
git init
# Check git_info.txt for remote URL, then:
git remote add origin git@github.com:bennyg83/pilzno_crm.git
git fetch origin
git checkout -b main || git checkout main
git pull origin main
```

### 8. Rebuild Frontend (Required)
```powershell
# IMPORTANT: Stop containers first
docker compose down

# Build frontend
cd frontend
npm run build
cd ..

# Start services again
docker compose up -d --build
```

### 9. Verify Installation
```powershell
# Check container status
docker compose ps

# Check logs
docker compose logs backend
docker compose logs frontend

# Test backend health
curl http://localhost:3002/api/health
```

## 🌐 Access Application
- **Frontend**: http://localhost:3003
- **Backend API**: http://localhost:3002
- **Database**: localhost:5435

## 📚 Additional Documentation
See the following files in the project:
- `CONVERSATION_BACKUP.md` - Complete project context
- `PROJECT_MIGRATION_GUIDE.md` - Detailed migration guide
- `DEVELOPMENT_RULES_AND_POLICIES.md` - Coding standards
- `README.md` - Project overview

## ⚠️ Important Notes
- Database credentials should be changed in production
- JWT_SECRET should be changed from default
- Frontend must be rebuilt after setting environment variables
- Docker containers must be stopped before rebuilding frontend
