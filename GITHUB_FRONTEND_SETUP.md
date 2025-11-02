# GitHub Frontend Setup Guide

This guide explains how the frontend is connected to GitHub and how to sync with the remote repository.

## 🔗 Current GitHub Connection

**Repository**: https://github.com/bennyg83/pilzno_crm.git  
**Remote Name**: `origin`  
**Current Branch**: `main`  
**Status**: ✅ Connected and configured

## 📋 Current Setup

### Git Configuration

- **Remote URL**: `https://github.com/bennyg83/pilzno_crm.git`
- **Default Branch**: `main`
- **Safe Directory**: Configured for Windows user permissions

### Frontend Location

- **Local Path**: `Pilzno/pilzno_crm/frontend/`
- **GitHub Path**: `https://github.com/bennyg83/pilzno_crm/tree/main/frontend`

## 🔄 Syncing with GitHub

### Pull Updates from GitHub

```bash
cd "Pilzno/pilzno_crm"

# Fetch latest changes from GitHub
git fetch origin

# Check what's different
git log HEAD..origin/main --oneline

# Pull updates (merge with local changes)
git pull origin main
```

### Push Local Changes to GitHub

```bash
cd "Pilzno/pilzno_crm"

# Check current status
git status

# Add changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push origin main
```

### Handle Conflicts

If there are conflicts when pulling:

```bash
# See conflicting files
git status

# Resolve conflicts in files
# Then:
git add <resolved-files>
git commit -m "Merge with GitHub main branch"
```

## 🚀 Setting Up Frontend from GitHub (Fresh Install)

If you want to set up the frontend from scratch using the GitHub version:

### Option 1: Pull Updates

```bash
cd "Pilzno/pilzno_crm"

# Stash local changes
git stash

# Pull from GitHub
git pull origin main

# Apply stashed changes (if needed)
git stash pop
```

### Option 2: Reset to GitHub Version

**⚠️ WARNING**: This will lose local changes!

```bash
cd "Pilzno/pilzno_crm/frontend"

# Backup current version
cd ..
cp -r frontend frontend.backup

# Reset frontend to GitHub version
cd frontend
git checkout origin/main -- frontend/

# Reinstall dependencies
npm install
```

## 📦 Frontend Installation

### Install Dependencies

```bash
cd "Pilzno/pilzno_crm/frontend"

# Install dependencies
npm install
```

### Development Mode

```bash
# Run development server
npm run dev

# Frontend will be available at: http://localhost:3000
# Backend API proxy: http://localhost:3000/api → http://pilzno-synagogue-backend:3001
```

### Build for Production

```bash
# Build for production
npm run build

# Build output: frontend/dist/
```

## 🔧 Frontend Configuration

### Backend API Configuration

The frontend connects to the backend via:

**Development (`vite.config.ts`):**
```typescript
proxy: {
  '/api': {
    target: 'http://pilzno-synagogue-backend:3001',
    changeOrigin: true
  }
}
```

**Production (`src/config/backend-config.ts`):**
```typescript
API_BASE_URL: 'http://localhost:3002'
```

### Environment Variables

Create `frontend/.env` if needed:
```bash
VITE_API_BASE_URL=http://localhost:3002
```

## 📊 Current Local Enhancements

Your local frontend has these enhancements not yet in GitHub:

- ✅ `src/utils/datePersistence.ts` - Date persistence utility
- ✅ Enhanced `FamilyMemberFormDialog.tsx` - Uses stored Hebrew dates
- ✅ Backup scripts for data persistence
- ✅ Documentation guides

## 🔄 Syncing Strategy

### Recommended Workflow

1. **Before pulling from GitHub:**
   ```bash
   # Check what you'll lose
   git diff origin/main frontend/
   
   # Commit local changes
   git add .
   git commit -m "Local enhancements"
   ```

2. **Pull updates:**
   ```bash
   git pull origin main
   ```

3. **Resolve any conflicts:**
   ```bash
   # Edit conflicted files
   # Then:
   git add <resolved-files>
   git commit -m "Merged with GitHub updates"
   ```

4. **Push your enhancements:**
   ```bash
   git push origin main
   ```

## 🐳 Docker Frontend Setup

### Using Docker Compose

The frontend is already configured in `docker-compose.yml`:

```yaml
pilzno-synagogue-frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile.build
  ports:
    - "3003:80"
```

### Rebuild Frontend Container

```bash
cd "Pilzno/pilzno_crm"

# Stop containers
docker-compose down

# Rebuild frontend
cd frontend
npm run build
cd ..

# Rebuild and start
docker-compose up -d --build
```

## 🔍 Checking Frontend Status

### Verify GitHub Connection

```bash
cd "Pilzno/pilzno_crm"
git remote -v
git status
```

### Compare with GitHub

```bash
# See what's different
git diff origin/main frontend/

# See commit history
git log origin/main..HEAD --oneline frontend/
```

## 📝 Next Steps

1. **Review local changes**: Check what enhancements you have
2. **Commit enhancements**: Save your local improvements
3. **Pull updates**: Get latest from GitHub if needed
4. **Resolve conflicts**: Merge any differences
5. **Push enhancements**: Share improvements back to GitHub

## ⚠️ Important Notes

- **Always backup** before major git operations
- **Test locally** after pulling updates
- **Commit frequently** to preserve your work
- **Use branches** for experimental changes

---

**Last Updated**: November 2, 2025  
**GitHub Repo**: https://github.com/bennyg83/pilzno_crm.git  
**Maintained by**: Pilzno CRM Development Team

