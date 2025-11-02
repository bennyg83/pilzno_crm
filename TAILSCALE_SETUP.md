# Tailscale Setup Guide

This guide explains how to connect your GitHub Pages frontend to your local backend using Tailscale.

## 🌐 Overview

**Architecture:**
- **Frontend**: Deployed on GitHub Pages (https://bennyg83.github.io/pilzno_crm/)
- **Backend**: Running locally with local PostgreSQL database
- **Connection**: Via Tailscale VPN (secure, encrypted)

## 🔧 Step 1: Install and Configure Tailscale

### On Your Local Machine (Where Backend Runs)

1. **Install Tailscale:**
   - Download from: https://tailscale.com/download
   - Install and sign in with your account

2. **Get Your Tailscale IP:**
   ```bash
   # Windows PowerShell
   tailscale ip

   # Or check in Tailscale admin console
   # https://login.tailscale.com/admin/machines
   ```
   - Example output: `100.x.x.x` (Tailscale IP)

3. **Verify Tailscale is Running:**
   ```bash
   tailscale status
   ```

## 🚀 Step 2: Configure Backend to Accept Tailscale Connections

### Update Docker Compose

The backend is already configured to listen on `0.0.0.0:3001` (inside container), which maps to port `3002` on your host.

### Set Environment Variables

Create or update `.env` file:

```bash
# Tailscale Configuration
TAILSCALE_URL=http://your-tailscale-ip:3002
# Example: TAILSCALE_URL=http://100.64.1.2:3002

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3003,http://localhost:3000,https://bennyg83.github.io
```

### Update Backend CORS (Already Done ✅)

The backend CORS configuration has been updated to:
- Allow GitHub Pages origin: `https://bennyg83.github.io`
- Allow Tailscale URL from environment variable
- Allow local development origins

## 🎯 Step 3: Configure Frontend for Tailscale

### Option A: Set in GitHub Actions (Recommended)

1. **Go to GitHub Repository Settings:**
   - Navigate to: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions

2. **Add Secret:**
   - Name: `BACKEND_API_URL`
   - Value: `http://your-tailscale-ip:3002`
   - Example: `http://100.64.1.2:3002`

3. **GitHub Actions will automatically use this** (already configured ✅)

### Option B: Update Code Directly

Edit `frontend/src/config/backend-config.ts`:

```typescript
// Line 21: Replace with your Tailscale IP
const tailscaleUrl = 'http://100.x.x.x:3002' // Your actual Tailscale IP
```

## 🔒 Step 4: Firewall Configuration

### Windows Firewall

Your backend needs to accept connections on port 3002:

```powershell
# Allow incoming connections on port 3002
New-NetFirewallRule -DisplayName "Pilzno Backend Tailscale" -Direction Inbound -LocalPort 3002 -Protocol TCP -Action Allow
```

Or manually:
1. Windows Security → Firewall & network protection
2. Advanced settings → Inbound Rules → New Rule
3. Port → TCP → 3002 → Allow connection

### Verify Port is Open

```bash
# Test from another device on Tailscale network
curl http://your-tailscale-ip:3002/health

# Should return: {"status":"healthy",...}
```

## 📝 Step 5: Update GitHub Actions

The GitHub Actions workflow is already configured to use `BACKEND_API_URL` secret:

```yaml
env:
  VITE_API_BASE_URL: ${{ secrets.BACKEND_API_URL || 'http://localhost:3002' }}
```

**Just add the secret in GitHub** (Step 3, Option A) and it will work!

## ✅ Step 6: Test the Connection

### Test 1: Local Backend Access

```bash
# Should work from your local machine
curl http://localhost:3002/health

# Should also work from Tailscale IP
curl http://your-tailscale-ip:3002/health
```

### Test 2: From GitHub Pages

1. Deploy to GitHub Pages:
   ```bash
   git push origin main
   # GitHub Actions will build and deploy
   ```

2. Visit: https://bennyg83.github.io/pilzno_crm/

3. Open browser DevTools → Network tab
4. Try to login or make an API call
5. Check if requests go to: `http://your-tailscale-ip:3002/api/...`

### Test 3: From Another Device (Optional)

If you have another device on the same Tailscale network:
```bash
curl http://your-tailscale-ip:3002/health
```

## 🔍 Troubleshooting

### Issue: CORS Errors

**Symptoms:**
```
Access to XMLHttpRequest at 'http://...' from origin 'https://bennyg83.github.io' has been blocked by CORS policy
```

**Solution:**
1. Check backend logs for blocked origins
2. Verify `TAILSCALE_URL` or `CORS_ORIGINS` in `.env`
3. Restart backend container:
   ```bash
   docker-compose restart pilzno-synagogue-backend
   ```

### Issue: Connection Refused

**Symptoms:**
```
Failed to fetch
net::ERR_CONNECTION_REFUSED
```

**Solution:**
1. Verify Tailscale is running:
   ```bash
   tailscale status
   ```

2. Check backend is listening:
   ```bash
   # Should show port 3002 in use
   netstat -an | findstr 3002
   ```

3. Check firewall rules (Step 4)

4. Verify Docker port mapping:
   ```bash
   docker ps
   # Should show: 0.0.0.0:3002->3001/tcp
   ```

### Issue: Backend Not Accessible

**Symptoms:**
- Health check fails from Tailscale IP

**Solution:**
1. Verify backend listens on `0.0.0.0` (not just `localhost`)
   - ✅ Already configured in `backend/src/index.ts`

2. Check Docker network:
   ```bash
   docker-compose ps
   # Backend should be running
   ```

3. Test directly:
   ```bash
   # From local machine
   curl http://localhost:3002/health
   
   # From Tailscale IP (should also work)
   curl http://your-tailscale-ip:3002/health
   ```

## 📊 Configuration Summary

### Backend Configuration

**File**: `backend/src/index.ts`
- ✅ Listens on `0.0.0.0:3001` (inside container)
- ✅ Maps to host port `3002`
- ✅ CORS allows GitHub Pages and Tailscale URLs

**Environment Variables** (`.env`):
```bash
TAILSCALE_URL=http://your-tailscale-ip:3002
CORS_ORIGINS=https://bennyg83.github.io,http://localhost:3003
```

### Frontend Configuration

**File**: `frontend/src/config/backend-config.ts`
- ✅ Auto-detects GitHub Pages
- ✅ Uses `VITE_API_BASE_URL` from GitHub Actions secrets
- ✅ Falls back to localhost for local development

**GitHub Actions** (`.github/workflows/deploy-pages.yml`):
- ✅ Uses `BACKEND_API_URL` secret
- ✅ Sets `VITE_API_BASE_URL` environment variable

## 🔐 Security Notes

### Tailscale Security

- ✅ **Encrypted**: All traffic is encrypted by Tailscale
- ✅ **Private**: Only devices on your Tailscale network can access
- ✅ **No Public Exposure**: Your backend is not publicly accessible

### Best Practices

1. **Use HTTPS in Production**: Consider using Tailscale HTTPS or a reverse proxy
2. **Keep Tailscale Updated**: Regularly update Tailscale client
3. **Monitor Access**: Use Tailscale admin console to see connected devices
4. **Use Secrets**: Never commit Tailscale IPs or credentials to git

## 🚀 Quick Start Checklist

- [ ] Install Tailscale and get your IP
- [ ] Update `.env` with `TAILSCALE_URL`
- [ ] Add `BACKEND_API_URL` secret in GitHub (your Tailscale URL)
- [ ] Configure Windows Firewall to allow port 3002
- [ ] Restart backend: `docker-compose restart pilzno-synagogue-backend`
- [ ] Test local: `curl http://localhost:3002/health`
- [ ] Test Tailscale: `curl http://your-tailscale-ip:3002/health`
- [ ] Deploy to GitHub Pages: `git push origin main`
- [ ] Test from GitHub Pages site

## 📚 Additional Resources

- **Tailscale Docs**: https://tailscale.com/kb/
- **Tailscale Admin Console**: https://login.tailscale.com/admin
- **GitHub Actions Secrets**: https://docs.github.com/en/actions/security-guides/encrypted-secrets

---

**Last Updated**: November 2, 2025  
**Project**: Pilzno CRM  
**Connection Type**: Tailscale VPN

