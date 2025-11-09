# 🎉 Complete Setup Guide - How We Got It Live

**Date**: November 9, 2025  
**Status**: ✅ LIVE and WORKING  
**URL**: https://bennyg83.github.io/pilzno_crm/

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [Current Configuration](#current-configuration)
6. [How It Works](#how-it-works)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance](#maintenance)

---

## 🎯 Overview

This guide documents the complete setup process for deploying the Pilzno CRM system with:
- **Frontend**: GitHub Pages (free hosting)
- **Backend**: Local desktop computer
- **Connection**: Tailscale Funnel (secure, no port forwarding)
- **Database**: Local PostgreSQL

**Key Achievement**: Public HTTPS website accessible from anywhere, without exposing your home network (no port forwarding required).

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Browser                            │
│              (Anywhere in the world)                         │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              GitHub Pages (Frontend)                         │
│         https://bennyg83.github.io/pilzno_crm/               │
│                                                               │
│  - React Application                                          │
│  - Static files hosted by GitHub                             │
│  - Free HTTPS provided by GitHub                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS API Requests
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              Tailscale Funnel                                │
│         https://crm-mini.tail34e202.ts.net                   │
│                                                               │
│  - Public HTTPS endpoint                                      │
│  - Secure tunnel through Tailscale network                   │
│  - No port forwarding needed                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │ Secure Tunnel
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              Your Desktop Computer                           │
│                                                               │
│  ┌──────────────────────────────────────────────┐           │
│  │  Backend API (Node.js/Express)                │           │
│  │  Port: 3002 (HTTP)                            │           │
│  │  - Authentication                              │           │
│  │  - API endpoints                               │           │
│  └──────────────────┬───────────────────────────┘           │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────┐           │
│  │  PostgreSQL Database                           │           │
│  │  Port: 5432                                    │           │
│  │  - User data                                   │           │
│  │  - Family records                              │           │
│  │  - All application data                        │           │
│  └───────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Prerequisites

### 1. GitHub Account
- ✅ Repository: `bennyg83/pilzno_crm`
- ✅ GitHub Pages enabled
- ✅ GitHub Actions enabled

### 2. Tailscale Account
- ✅ Tailscale installed on desktop
- ✅ Device name: `crm-mini`
- ✅ Tailscale Funnel feature available

### 3. Local Setup
- ✅ Backend running on port 3002
- ✅ PostgreSQL database running
- ✅ Docker Compose setup

---

## 📝 Step-by-Step Setup

### Step 1: Set Up Tailscale Funnel

**Why Tailscale Funnel?**
- ✅ No port forwarding (secure)
- ✅ Automatic HTTPS
- ✅ Free for personal use
- ✅ Works behind NAT/firewall

**Commands:**
```powershell
# Check Tailscale status
tailscale status

# Start Tailscale Funnel (exposes port 3002)
tailscale funnel --bg 3002

# Check Funnel status
tailscale funnel status
```

**Expected Output:**
```
# Funnel on:
#     - https://crm-mini.tail34e202.ts.net

https://crm-mini.tail34e202.ts.net (Funnel on)
|-- / proxy http://127.0.0.1:3002
```

**Result**: Public HTTPS URL: `https://crm-mini.tail34e202.ts.net`

---

### Step 2: Configure GitHub Secret

**Purpose**: Tell GitHub Actions what backend URL to use when building the frontend.

**Steps:**
1. Go to: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions
2. Click **"New repository secret"** (or edit existing)
3. **Name**: `BACKEND_API_URL`
4. **Value**: `https://crm-mini.tail34e202.ts.net`
   - **Important**: Use `https://` (Tailscale provides HTTPS)
   - **Important**: No trailing slash
   - **Important**: No port needed
5. Click **"Add secret"** (or **"Update secret"**)

**Why this is needed:**
- Frontend needs to know where the backend is
- This URL is injected during build time
- Keeps sensitive URLs out of public code

---

### Step 3: Configure Frontend for GitHub Pages

**File**: `frontend/vite.config.ts`

**Configuration:**
```typescript
export default defineConfig(({ mode }) => {
  const base = mode === 'pages' || process.env.GITHUB_PAGES === 'true'
    ? '/pilzno_crm/'  // GitHub Pages base path
    : '/'              // Local development

  return {
    plugins: [react()],
    base: base,
    // ... rest of config
  }
})
```

**Why**: GitHub Pages serves from `/pilzno_crm/` subdirectory, not root.

---

### Step 4: Configure Backend CORS

**File**: `backend/src/index.ts`

**Configuration:**
```typescript
const allowedOrigins = [
  'http://localhost:3003',
  'http://localhost:3000',
  'https://bennyg83.github.io',  // GitHub Pages
  'https://bennyg83.github.io/pilzno_crm',
  // ... Tailscale URLs
]

app.use(cors({
  origin: (origin, callback) => {
    // Allow GitHub Pages origin
    if (allowedOrigins.some(allowed => 
      origin?.startsWith(allowed)
    )) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  // ...
}))
```

**Why**: Backend must explicitly allow GitHub Pages origin for CORS.

---

### Step 5: GitHub Actions Workflow

**File**: `.github/workflows/deploy-pages.yml`

**Key Configuration:**
```yaml
- name: Build frontend for GitHub Pages
  working-directory: ./frontend
  run: npm run build:pages
  env:
    NODE_ENV: production
    GITHUB_PAGES: true
    VITE_API_BASE_URL: ${{ secrets.BACKEND_API_URL }}
```

**What it does:**
1. Builds frontend with GitHub Pages base path
2. Injects backend URL from GitHub secret
3. Deploys to GitHub Pages
4. Automatic HTTPS provided by GitHub

---

### Step 6: Deploy

**Automatic Deployment:**
```powershell
# Any push to main branch triggers deployment
git add .
git commit -m "Your changes"
git push origin main
```

**Manual Deployment:**
1. Go to: https://github.com/bennyg83/pilzno_crm/actions
2. Click **"Deploy Frontend to GitHub Pages"**
3. Click **"Run workflow"** → **"Run workflow"**

**Deployment Time**: 2-3 minutes

---

## ⚙️ Current Configuration

### Frontend
- **URL**: https://bennyg83.github.io/pilzno_crm/
- **Hosting**: GitHub Pages (free)
- **HTTPS**: Automatic (provided by GitHub)
- **Build**: Vite with React
- **Base Path**: `/pilzno_crm/`

### Backend
- **Local URL**: `http://localhost:3002`
- **Public URL**: `https://crm-mini.tail34e202.ts.net`
- **Connection**: Tailscale Funnel
- **Port**: 3002 (HTTP internally, HTTPS externally)
- **Database**: PostgreSQL (local)

### Authentication
- **Email**: `admin@pilzno.org`
- **Password**: `pilzno2024`
- **Role**: `super_admin`

### Tailscale Funnel
- **Status**: Active
- **Public URL**: `https://crm-mini.tail34e202.ts.net`
- **Local Target**: `http://127.0.0.1:3002`
- **HTTPS**: Automatic (provided by Tailscale)

---

## 🔄 How It Works

### 1. User Visits Website

User goes to: `https://bennyg83.github.io/pilzno_crm/`

**What happens:**
- Browser requests static files from GitHub Pages
- GitHub serves React application
- Application loads in browser

### 2. User Logs In

User enters credentials and clicks "Sign In"

**What happens:**
1. Frontend sends login request to: `https://crm-mini.tail34e202.ts.net/api/auth/login`
2. Request goes through Tailscale Funnel
3. Tailscale routes request through secure tunnel
4. Request reaches your desktop: `localhost:3002`
5. Backend validates credentials
6. Backend returns JWT token
7. Frontend stores token and navigates to dashboard

### 3. API Requests

After login, all API requests follow the same path:
- Frontend → Tailscale Funnel → Your Desktop → Backend → Database

**Security:**
- ✅ All traffic encrypted (HTTPS)
- ✅ No port forwarding (secure tunnel)
- ✅ Home network stays private

---

## 🔧 Troubleshooting

### Issue: Login Fails

**Symptoms:**
- "Invalid credentials" error
- Network error in console

**Solutions:**
1. **Check Tailscale Funnel is running:**
   ```powershell
   tailscale funnel status
   ```

2. **Check backend is running:**
   ```powershell
   docker ps --filter "name=pilzno-synagogue-backend"
   ```

3. **Test backend directly:**
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing
   ```

4. **Verify GitHub Secret:**
   - Go to: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions
   - Verify `BACKEND_API_URL` is set to: `https://crm-mini.tail34e202.ts.net`

### Issue: Logo Missing

**Symptoms:**
- 404 error for `pilzno_logo.png`

**Solution:**
- Logo paths must use `BASE_URL` for GitHub Pages
- ✅ Fixed in `LoginPage.tsx`
- ✅ Fixed in `Layout.tsx`
- ✅ Fixed in `index.html`

**Verify:**
- Logo file exists: `frontend/public/pilzno_logo.png`
- Paths use: `${import.meta.env.BASE_URL || '/'}pilzno_logo.png`

### Issue: CORS Errors

**Symptoms:**
- "CORS policy" error in console
- Requests blocked

**Solutions:**
1. **Check backend CORS configuration:**
   - Verify `https://bennyg83.github.io` is in allowed origins
   - Restart backend: `docker-compose restart pilzno-synagogue-backend`

2. **Check GitHub Secret:**
   - Ensure URL is correct
   - Redeploy frontend

### Issue: Tailscale Funnel Not Working

**Symptoms:**
- `ERR_NAME_NOT_RESOLVED`
- Connection timeout

**Solutions:**
1. **Check Funnel status:**
   ```powershell
   tailscale funnel status
   ```

2. **Restart Funnel:**
   ```powershell
   tailscale funnel reset
   tailscale funnel --bg 3002
   ```

3. **Verify backend is running:**
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing
   ```

---

## 🔄 Maintenance

### Keep Tailscale Funnel Running

**Check Status:**
```powershell
tailscale funnel status
```

**Restart if Needed:**
```powershell
tailscale funnel reset
tailscale funnel --bg 3002
```

**Run on Startup (Optional):**
- Create a Windows scheduled task
- Or add to startup scripts

### Update Backend URL

If Tailscale Funnel URL changes:

1. **Get new URL:**
   ```powershell
   tailscale funnel status
   ```

2. **Update GitHub Secret:**
   - Go to: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions
   - Edit `BACKEND_API_URL`
   - Update to new URL
   - Save

3. **Redeploy:**
   ```powershell
   git commit --allow-empty -m "Update backend URL"
   git push origin main
   ```

### Update Frontend

**Normal Process:**
```powershell
# Make changes
git add .
git commit -m "Your changes"
git push origin main
# GitHub Actions automatically deploys
```

### Update Backend

**Process:**
```powershell
# Make changes
# Rebuild and restart
docker-compose restart pilzno-synagogue-backend
# Or rebuild:
docker-compose up -d --build pilzno-synagogue-backend
```

---

## 📊 Key Files and Their Roles

### Frontend Configuration

| File | Purpose |
|------|---------|
| `frontend/vite.config.ts` | Base path configuration for GitHub Pages |
| `frontend/src/config/backend-config.ts` | Backend URL resolution logic |
| `frontend/src/pages/LoginPage.tsx` | Login page with logo |
| `frontend/src/components/Layout.tsx` | Main layout with logo |
| `frontend/index.html` | HTML template with favicon |

### Backend Configuration

| File | Purpose |
|------|---------|
| `backend/src/index.ts` | CORS configuration, server setup |
| `backend/src/routes/auth.ts` | Authentication endpoints |
| `docker-compose.yml` | Docker services configuration |

### Deployment Configuration

| File | Purpose |
|------|---------|
| `.github/workflows/deploy-pages.yml` | GitHub Actions deployment workflow |
| `frontend/public/.nojekyll` | Prevents Jekyll processing on GitHub Pages |

### Documentation

| File | Purpose |
|------|---------|
| `COMPLETE_SETUP_GUIDE.md` | This file - complete setup documentation |
| `FUNNEL_READY_TO_USE.md` | Tailscale Funnel quick reference |
| `LOGIN_CREDENTIALS_VERIFIED.md` | Login credentials documentation |

---

## ✅ Checklist: Is Everything Working?

- [ ] **Tailscale Funnel**: `tailscale funnel status` shows active
- [ ] **Backend Running**: `docker ps` shows backend container
- [ ] **GitHub Secret**: `BACKEND_API_URL` set to Tailscale Funnel URL
- [ ] **Frontend Deployed**: https://bennyg83.github.io/pilzno_crm/ loads
- [ ] **Login Works**: Can login with `admin@pilzno.org` / `pilzno2024`
- [ ] **API Calls Work**: Dashboard loads data
- [ ] **Logo Displays**: Logo appears on login page and sidebar

---

## 🎯 Summary

### What We Achieved

✅ **Public HTTPS Website**: Accessible from anywhere  
✅ **No Port Forwarding**: Secure Tailscale Funnel  
✅ **Free Hosting**: GitHub Pages (frontend)  
✅ **Secure Connection**: HTTPS end-to-end  
✅ **Private Network**: Home network stays private  

### Technologies Used

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Hosting**: GitHub Pages
- **Tunnel**: Tailscale Funnel
- **Deployment**: GitHub Actions

### Key Decisions

1. **Tailscale Funnel over Port Forwarding**: Security (no network exposure)
2. **GitHub Pages over Custom Hosting**: Free, automatic HTTPS
3. **GitHub Secrets**: Keep sensitive URLs out of public code
4. **Docker Compose**: Easy local development and deployment

---

## 📚 Additional Resources

- **Tailscale Funnel Docs**: https://tailscale.com/kb/1247/funnel-serve-use-cases
- **GitHub Pages Docs**: https://docs.github.com/en/pages
- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Vite Docs**: https://vitejs.dev/

---

## 🔐 Security Notes

### What's Secure

✅ **HTTPS Everywhere**: All traffic encrypted  
✅ **No Port Forwarding**: Home network not exposed  
✅ **Tailscale Tunnel**: Secure encrypted connection  
✅ **CORS Protection**: Only allowed origins can access  
✅ **JWT Authentication**: Secure token-based auth  

### Best Practices

1. **Keep Tailscale Updated**: Regular updates for security
2. **Monitor Access**: Check Tailscale admin console
3. **Strong Passwords**: Use strong admin password
4. **Regular Backups**: Backup database regularly
5. **GitHub Secrets**: Never commit sensitive URLs

---

## 🎉 Success!

**Your Pilzno CRM is now live and accessible from anywhere!**

- **Frontend**: https://bennyg83.github.io/pilzno_crm/
- **Backend**: https://crm-mini.tail34e202.ts.net
- **Login**: `admin@pilzno.org` / `pilzno2024`

**No port forwarding needed. Secure. Free. Working!** ✅

---

**Last Updated**: November 9, 2025  
**Status**: Complete and working  
**Maintained By**: Development Team

