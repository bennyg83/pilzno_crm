# GitHub Pages Deployment Setup

This guide explains how to deploy the Pilzno CRM frontend to GitHub Pages.

## ✅ Setup Complete

The following has been configured:

1. ✅ GitHub Actions workflow (`.github/workflows/deploy-pages.yml`)
2. ✅ Vite configuration for GitHub Pages base path (`/pilzno_crm/`)
3. ✅ Build script for GitHub Pages (`npm run build:pages`)
4. ✅ `.nojekyll` file (required for React Router on GitHub Pages)

## 🚀 Deployment Steps

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/bennyg83/pilzno_crm
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - **Deploy from a branch**: `gh-pages` (will be created automatically)
   - OR **GitHub Actions** (recommended - automatic)
4. Click **Save**

### Step 2: Commit and Push

Commit the workflow and configuration files:

```bash
cd "C:\Users\cursors123\Documents\Projects Shul\Projects Shul\Pilzno\pilzno_crm"

# Add all new files
git add .github/workflows/deploy-pages.yml
git add frontend/vite.config.ts
git add frontend/package.json
git add .nojekyll

# Commit
git commit -m "Configure GitHub Pages deployment"

# Push to GitHub
git push origin main
```

### Step 3: Monitor Deployment

1. Go to your repository → **Actions** tab
2. You should see "Deploy Frontend to GitHub Pages" workflow running
3. Wait for it to complete (usually 2-3 minutes)
4. Once complete, your site will be at: **https://bennyg83.github.io/pilzno_crm/**

## 📝 Configuration Details

### Build Configuration

**Base Path**: `/pilzno_crm/` (matches repository name)

**Build Command**: `npm run build:pages`

**Output Directory**: `frontend/dist/`

### GitHub Actions Workflow

The workflow automatically:
1. ✅ Checks out code
2. ✅ Sets up Node.js 18
3. ✅ Installs dependencies
4. ✅ Builds frontend for GitHub Pages
5. ✅ Deploys to GitHub Pages

### Backend API Configuration

**Important**: The GitHub Pages frontend will need to connect to your backend API.

You have two options:

**Option 1: Use Environment Variable (Recommended)**

Update `frontend/src/config/backend-config.ts` to use environment variables:

```typescript
export const BACKEND_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002',
  // ...
};
```

Then in GitHub Actions, add:
```yaml
env:
  VITE_API_BASE_URL: 'https://your-backend-domain.com'
```

**Option 2: Use Your Public IP**

If your backend is accessible via public IP, update the config to use it.

## 🧪 Testing Locally

Before pushing, test the build locally:

```bash
cd frontend

# Test GitHub Pages build
npm run build:pages

# Preview the build
npm run preview
```

The build should create files in `frontend/dist/` with the correct base path.

## 🔧 Manual Deployment

If you want to deploy manually:

```bash
cd frontend

# Build for GitHub Pages
npm run build:pages

# The dist/ folder is ready for deployment
# You can manually upload it to GitHub Pages
```

## 📊 Deployment URL

Once deployed, your application will be available at:

**https://bennyg83.github.io/pilzno_crm/**

Note the base path: `/pilzno_crm/` (matches your repository name)

## ⚠️ Important Notes

### Backend API Access

- GitHub Pages runs on HTTPS
- Your backend must be accessible via HTTPS or allow CORS
- Update backend CORS to allow: `https://bennyg83.github.io`

### Base Path

- All routes must account for the `/pilzno_crm/` base path
- React Router should use `<BrowserRouter basename="/pilzno_crm">`
- API calls should use absolute URLs or proxy through GitHub Pages

### React Router Configuration

Check your `App.tsx` or router configuration:

```typescript
import { BrowserRouter } from 'react-router-dom'

// For GitHub Pages
<BrowserRouter basename="/pilzno_crm">
  {/* routes */}
</BrowserRouter>
```

## 🐛 Troubleshooting

### Build Fails

1. Check GitHub Actions logs
2. Test build locally: `cd frontend && npm run build:pages`
3. Verify all dependencies are in `package.json`

### 404 Errors on GitHub Pages

1. Ensure `.nojekyll` file exists in root
2. Check React Router `basename` is set correctly
3. Verify base path in `vite.config.ts` matches repository name

### Backend API Not Accessible

1. Update backend CORS settings
2. Ensure backend is publicly accessible
3. Use HTTPS URLs for API calls

### Assets Not Loading

1. Check `vite.config.ts` base path
2. Verify assets are in `dist/assets/`
3. Check browser console for 404 errors

## 📈 Monitoring

### Check Deployment Status

1. Repository → **Actions** tab
2. Click on latest workflow run
3. View build logs

### View Deployment

1. Repository → **Settings** → **Pages**
2. See deployment URL and status
3. View deployment history

---

**Repository**: https://github.com/bennyg83/pilzno_crm  
**Pages URL**: https://bennyg83.github.io/pilzno_crm/  
**Last Updated**: November 2, 2025

