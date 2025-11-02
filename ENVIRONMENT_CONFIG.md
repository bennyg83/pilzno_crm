# Environment Configuration Guide

This guide explains the dual environment setup for development and production.

## 🌿 Branch Strategy

### Branches

- **`main`**: Production/Live branch
  - Deploys to GitHub Pages automatically
  - Stable, tested code only
  - URL: https://bennyg83.github.io/pilzno_crm/

- **`dev`**: Development branch
  - Local development work
  - Testing new features
  - Collaboration between developers

### Workflow

```
dev branch (development)
    ↓
Test & Review
    ↓
Merge to main (production)
    ↓
Auto-deploy to GitHub Pages
```

## 🔧 Environment Configuration

### Local Development Environment

**Configuration**: Uses local backend API

- **Frontend**: http://localhost:3000 (Vite dev server)
- **Backend API**: http://localhost:3002
- **Database**: PostgreSQL on port 5435

**Setup**:
```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Start with Docker
docker-compose up -d

# Or run locally
cd frontend && npm run dev
cd backend && npm run dev
```

### GitHub Pages (Production) Environment

**Configuration**: Uses production backend API

- **Frontend**: https://bennyg83.github.io/pilzno_crm/
- **Backend API**: [Your public backend URL]
- **Base Path**: `/pilzno_crm/`

**Auto-deployment**: 
- Pushes to `main` branch automatically trigger deployment
- GitHub Actions builds and deploys

## 📁 Configuration Files

### Frontend Backend Configuration

**File**: `frontend/src/config/backend-config.ts`

```typescript
export const BACKEND_CONFIG = {
  // Local development (default)
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002',
  
  // GitHub Pages production
  // Set VITE_API_BASE_URL in GitHub Actions
  // Or update this file for production
};
```

### Environment Variables

**Local Development** (`.env`):
```bash
VITE_API_BASE_URL=http://localhost:3002
```

**GitHub Pages** (GitHub Actions):
```yaml
env:
  VITE_API_BASE_URL: 'https://your-backend-domain.com'
```

## 🚀 Development Workflow

### Working on Dev Branch

1. **Switch to dev branch:**
   ```bash
   git checkout dev
   ```

2. **Make changes:**
   ```bash
   # Edit code
   # Test locally
   ```

3. **Commit changes:**
   ```bash
   git add .
   git commit -m "Feature: Description"
   git push origin dev
   ```

4. **When ready for production:**
   ```bash
   # Switch to main
   git checkout main
   
   # Merge dev into main
   git merge dev
   
   # Push to deploy
   git push origin main
   ```

### Collaboration Workflow

**For Your Friend:**

1. **Clone repository:**
   ```bash
   git clone https://github.com/bennyg83/pilzno_crm.git
   cd pilzno_crm
   ```

2. **Work on dev branch:**
   ```bash
   git checkout dev
   # Make changes
   git add .
   git commit -m "Feature: Description"
   git push origin dev
   ```

3. **Pull latest changes:**
   ```bash
   git pull origin dev
   ```

## 🔄 Syncing Between Local and GitHub

### Local → GitHub

```bash
# Push dev branch
git push origin dev

# Push main branch (triggers deployment)
git push origin main
```

### GitHub → Local

```bash
# Pull latest from dev
git checkout dev
git pull origin dev

# Pull latest from main
git checkout main
git pull origin main
```

## 🎨 Tailwind CSS Setup

Tailwind CSS is now installed and configured:

- **Config**: `frontend/tailwind.config.js`
- **CSS Entry**: `frontend/src/index.css`
- **Integration**: Works alongside Material-UI

**Usage**: Use Tailwind classes alongside MUI components:
```tsx
<div className="flex items-center gap-4 bg-primary-dark">
  <MUIButton>Button</MUIButton>
</div>
```

## 📊 Dual Environment Summary

| Feature | Local Dev | GitHub Pages |
|---------|-----------|--------------|
| **Branch** | `dev` | `main` |
| **Frontend URL** | http://localhost:3000 | https://bennyg83.github.io/pilzno_crm/ |
| **Backend API** | http://localhost:3002 | [Public URL] |
| **Base Path** | `/` | `/pilzno_crm/` |
| **Build** | `npm run dev` | `npm run build:pages` |
| **Auto-deploy** | No | Yes (on push to main) |

---

**Last Updated**: November 2, 2025  
**Maintained by**: Pilzno CRM Development Team

