# GitHub Pages Deployment - Quick Start

## ✅ Setup Complete!

All configuration files are ready. Here's what to do next:

## 🚀 Deployment Steps

### Step 1: Enable GitHub Pages (One-time setup)

1. Go to: https://github.com/bennyg83/pilzno_crm
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select: **GitHub Actions**
4. Click **Save**

### Step 2: Commit and Push

```bash
cd "C:\Users\cursors123\Documents\Projects Shul\Projects Shul\Pilzno\pilzno_crm"

# Add all new files
git add .github/workflows/deploy-pages.yml
git add frontend/vite.config.ts
git add frontend/package.json
git add .nojekyll
git add GITHUB_PAGES_SETUP.md
git add GITHUB_PAGES_DEPLOYMENT_STEPS.md

# Commit
git commit -m "Configure GitHub Pages deployment"

# Push to GitHub
git push origin main
```

### Step 3: Monitor Deployment

1. Go to: https://github.com/bennyg83/pilzno_crm/actions
2. Click on "Deploy Frontend to GitHub Pages" workflow
3. Wait for it to complete (2-3 minutes)
4. Once green ✅, your site is live!

## 🌐 Access Your Site

Once deployed, your site will be available at:

**https://bennyg83.github.io/pilzno_crm/**

## 📝 What Was Configured

1. ✅ **GitHub Actions Workflow** (`.github/workflows/deploy-pages.yml`)
   - Automatically builds on push to `main`
   - Builds frontend for GitHub Pages
   - Deploys to GitHub Pages

2. ✅ **Vite Configuration** (`frontend/vite.config.ts`)
   - Base path: `/pilzno_crm/` for GitHub Pages
   - Root path for local development

3. ✅ **Build Script** (`frontend/package.json`)
   - `npm run build:pages` builds with correct base path

4. ✅ **.nojekyll file**
   - Required for React Router to work on GitHub Pages

## 🔄 Automatic Deployments

After the initial setup, **every push to `main` will automatically deploy**!

You don't need to do anything - just:
1. Make changes
2. Commit and push
3. GitHub Actions builds and deploys automatically

## ⚠️ Important Notes

### Backend API Configuration

Your GitHub Pages frontend needs to connect to your backend API. Update:

`frontend/src/config/backend-config.ts`:

```typescript
export const BACKEND_CONFIG = {
  // For GitHub Pages, use your public backend URL
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://your-backend-domain.com',
  // ...
};
```

Or set environment variable in GitHub Actions workflow.

### CORS Settings

Make sure your backend allows requests from:
- `https://bennyg83.github.io`

Update backend CORS settings accordingly.

## 🐛 Troubleshooting

**Workflow fails?**
- Check Actions tab for error logs
- Ensure `npm run build:pages` works locally

**Site shows 404?**
- Ensure `.nojekyll` file exists
- Check base path matches repository name (`pilzno_crm`)

**Assets not loading?**
- Verify base path in `vite.config.ts`
- Check browser console for errors

---

**Ready to deploy?** Follow Step 2 above! 🚀

