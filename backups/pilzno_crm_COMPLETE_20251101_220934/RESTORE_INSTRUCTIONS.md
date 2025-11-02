# Pilzno CRM - COMPLETE Backup Restore Instructions

## 📅 Backup Information
- **Backup Date**: Sat, Nov  1, 2025 10:10:15 PM
- **Source System**: BennyGDev
- **Source Path**: /c/Users/binya/Documents/Projects Shul/Pilzno/pilzno_crm
- **Type**: COMPLETE backup (includes node_modules, dist, .git, everything)

## 📦 What's Included
- ✅ Complete project source code
- ✅ ALL node_modules (frontend and backend)
- ✅ ALL dist/build folders
- ✅ .git repository (complete history)
- ✅ Database backup (database_backup.sql) - if available
- ✅ Everything else

## 🚀 Restore Steps on Mini-PC

### 1. Transfer Files to Mini-PC
```powershell
# Via SCP (from source system):
scp -r "pilzno_crm_COMPLETE_20251101_220934" cursors123@crm-mini:"C:\Users\cursors123\Documents\Projects_Shul\Pilzno\"

# Or copy via network share/USB drive to:
# C:\Users\cursors123\Documents\Projects_Shul\Pilzno\pilzno_crm
```

### 2. Extract/Restore Project Files
```powershell
# Navigate to backup location
cd "C:\Users\cursors123\Documents\Projects_Shul\Pilzno$BACKUP_NAME"

# Copy project files to destination
xcopy /E /I /Y /H project "C:\Users\cursors123\Documents\Projects_Shul\Pilzno\pilzno_crm"
```

### 3. Set Up Environment Variables (if needed)
```powershell
cd "C:\Users\cursors123\Documents\Projects_Shul\Pilzno\pilzno_crm"

# Create backend/.env if it doesn't exist
if (-not (Test-Path "backend\.env")) {
    @"
DB_NAME=pilzno_synagogue
DB_USER=synagogue_admin
DB_PASSWORD=synagogue_secure_pass
DB_PORT=5435
DB_HOST=pilzno-synagogue-db
JWT_SECRET=pilzno_synagogue_jwt_secret_key_2024
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3003
"@ | Out-File -Encoding utf8 backend\.env
}

# Create frontend/.env.production if it doesn't exist
if (-not (Test-Path "frontend\.env.production")) {
    @"
VITE_API_BASE_URL=https://crm-mini.tail34e202.ts.net
NODE_ENV=production
"@ | Out-File -Encoding utf8 frontend\.env.production
}
```

### 4. Start Docker Services
```powershell
cd "C:\Users\cursors123\Documents\Projects_Shul\Pilzno\pilzno_crm"

# Start all services
docker compose up -d

# Wait for database to be ready (check logs)
docker compose logs -f pilzno-synagogue-db
```

### 5. Restore Database
```powershell
# If database_backup.sql exists:
docker compose exec -T pilzno-synagogue-db psql -U synagogue_admin -d pilzno_synagogue < ..\pilzno_crm_COMPLETE_20251101_220934\database_backup.sql

# Or if using postgres user:
docker compose exec -T pilzno-synagogue-db psql -U postgres -d pilzno_synagogue < ..\pilzno_crm_COMPLETE_20251101_220934\database_backup.sql
```

### 6. Verify Installation
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

## ⚠️ Important Notes
- This is a COMPLETE backup with all dependencies - no need to run npm install
- If you need to rebuild frontend: docker compose down; cd frontend; npm run build; cd ..; docker compose up -d --build
- Database credentials should be changed in production
- JWT_SECRET should be changed from default
