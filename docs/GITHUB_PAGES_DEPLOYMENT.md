# GitHub Pages Deployment Guide for Pilzno CRM

## 🎯 **Using Your Existing Repository: `pilzno-crm`**

This guide will help you deploy your frontend to GitHub Pages using your existing `pilzno-crm` repository.

## 📋 **Prerequisites**
- ✅ GitHub account: `bennyg83`
- ✅ Existing repository: `pilzno-crm`
- ✅ Personal Access Token (PAT) with repository permissions
- ✅ Node.js 16+ installed locally
- ✅ Git installed locally

## 🚀 **Step-by-Step Deployment**

### **Step 1: Verify Repository Settings**
1. Go to [https://github.com/bennyg83/pilzno-crm](https://github.com/bennyg83/pilzno-crm)
2. Ensure the repository is **public** (required for GitHub Pages)
3. Go to **Settings** → **General** → **Danger Zone**
4. If private, click **Change repository visibility** → **Make public**

### **Step 2: Configure Environment**
1. Run the setup script:
   ```bash
   # Windows
   scripts\setup-github-pages.bat
   
   # Linux/Mac
   chmod +x scripts/setup-github-pages.sh
   ./scripts/setup-github-pages.sh
   ```

2. Edit `scripts/.env` with your GitHub credentials:
   ```env
   GITHUB_OWNER=bennyg83
   GITHUB_REPO=pilzno-crm
   GITHUB_BRANCH=main
   GITHUB_PAT=your-personal-access-token-here
   ```

### **Step 3: Get Personal Access Token**
1. Go to GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **Generate new token (classic)**
3. Set permissions:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
4. Copy the token and paste it in `scripts/.env`

### **Step 4: Configure Frontend for GitHub Pages**
1. Open `frontend/package.json`
2. Add the GitHub Pages build script:
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "build:pages": "vite build --base=/pilzno-crm/",
       "preview": "vite preview"
     }
   }
   ```

3. Update `frontend/vite.config.js` to handle the base path:
   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     base: process.env.NODE_ENV === 'production' ? '/pilzno-crm/' : '/',
     build: {
       outDir: 'dist',
       assetsDir: 'assets'
     }
   })
   ```

### **Step 5: Add GitHub Actions Workflow**
1. Create `.github/workflows/deploy-pages.yml` in your repository:
   ```yaml
   name: Deploy Frontend to GitHub Pages

   on:
     push:
       branches: [ main, develop ]
     pull_request:
       branches: [ main ]
     workflow_dispatch:

   permissions:
     contents: read
     pages: write
     id-token: write

   concurrency:
     group: "pages"
     cancel-in-progress: false

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
       - name: Checkout code
         uses: actions/checkout@v4
         
       - name: Setup Node.js
         uses: actions/setup-node@v4
         with:
           node-version: '18'
           cache: 'npm'
           
       - name: Install dependencies
         run: |
           cd frontend
           npm ci
           
       - name: Build frontend
         run: |
           cd frontend
           npm run build:pages
           
       - name: Upload build artifacts
         uses: actions/upload-artifact@v4
         with:
           name: frontend-build
           path: frontend/dist/
           retention-days: 1

     deploy:
       needs: build
       runs-on: ubuntu-latest
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
         
       steps:
       - name: Checkout code
         uses: actions/checkout@v4
         
       - name: Download build artifacts
         uses: actions/download-artifact@v4
         with:
           name: frontend-build
           path: frontend/dist/
           
       - name: Setup Pages
         uses: actions/configure-pages@v4
         
       - name: Upload to GitHub Pages
         id: deployment
         uses: actions/upload-pages-artifact@v3
         with:
           path: frontend/dist/
           
       - name: Deploy to GitHub Pages
         id: deployment
         uses: actions/deploy-pages@v4
   ```

### **Step 6: Configure GitHub Pages**
1. Go to repository **Settings** → **Pages**
2. Configure:
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/ (root)`
3. Click **Save**

### **Step 7: Deploy**
1. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

2. GitHub Actions will automatically:
   - Build your frontend
   - Deploy to GitHub Pages
   - Make it available at: `https://bennyg83.github.io/pilzno-crm/`

### **Step 8: Start IP Monitor**
1. Start the IP monitoring service:
   ```bash
   cd scripts
   npm start
   ```

2. The service will:
   - Check your IP every 5 minutes
   - Automatically update the frontend when IP changes
   - Keep frontend and backend in sync

## 🔧 **Configuration Files**

### **Backend Configuration**
The IP monitor automatically creates `frontend/src/config/backend-config.js`:
```javascript
// Auto-generated backend configuration
export const BACKEND_CONFIG = {
  API_BASE_URL: 'http://YOUR_CURRENT_IP:3000',
  WS_URL: 'ws://YOUR_CURRENT_IP:3000',
  HEALTH_CHECK_URL: 'http://YOUR_CURRENT_IP:3000/health',
  // ... other settings
};
```

### **Environment Variables**
```env
# scripts/.env
GITHUB_OWNER=bennyg83
GITHUB_REPO=pilzno-crm
GITHUB_BRANCH=main
GITHUB_PAT=your-pat-token
IP_CHECK_INTERVAL=300000
```

## 📊 **Monitoring & Logs**

- **Service logs**: `logs/ip-monitor.log`
- **Current IP**: `data/current-ip.txt`
- **Last update**: `data/last-update.txt`
- **Service status**: `npm run status`

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Build fails in GitHub Actions**
   - Check the Actions tab for error logs
   - Verify `npm run build:pages` works locally
   - Ensure all dependencies are in `package.json`

2. **GitHub Pages not accessible**
   - Verify repository is public
   - Check Pages settings in repository Settings
   - Wait a few minutes for deployment to complete

3. **IP monitor not updating**
   - Check `scripts/.env` configuration
   - Verify PAT has correct permissions
   - Check logs in `logs/ip-monitor.log`

4. **CORS errors**
   - Ensure backend allows requests from `https://bennyg83.github.io`
   - Update backend CORS configuration

### **Useful Commands**

```bash
# Check IP monitor status
cd scripts
npm run status

# View logs
tail -f ../logs/ip-monitor.log

# Test IP detection
node -e "const axios = require('axios'); (async () => { try { const response = await axios.get('https://api.ipify.org'); console.log('Current IP:', response.data); } catch (error) { console.log('Error:', error.message); } })();"

# Restart IP monitor
pkill -f "ip-monitor-service"
npm start
```

## 🎉 **Success!**

Once deployed, your Pilzno CRM will be available at:
**https://bennyg83.github.io/pilzno-crm/**

The IP monitor will automatically keep your frontend updated with the correct backend IP address, solving your dynamic IP problem permanently!

## 📞 **Need Help?**

- Check the logs: `logs/ip-monitor.log`
- Review GitHub Actions: Actions tab in your repository
- Verify configuration: `scripts/.env`
- Test locally: `npm run build:pages` in frontend directory
