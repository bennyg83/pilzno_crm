# 🚀 Quick Start: GitHub Pages ↔️ Local Backend via Tailscale

## Overview

Connect your GitHub Pages frontend to your local backend with local PostgreSQL using Tailscale.

## ✅ What's Already Configured

- ✅ Backend CORS allows GitHub Pages origin
- ✅ Backend listens on `0.0.0.0:3001` (accessible via Tailscale)
- ✅ Frontend detects GitHub Pages and uses environment variable for backend URL
- ✅ GitHub Actions configured to use `BACKEND_API_URL` secret

## 📋 Quick Setup Steps

### 1. Get Your Tailscale IP

```bash
# Windows PowerShell
tailscale ip

# Output example: 100.64.1.2
```

### 2. Configure Backend (.env file)

Create `backend/.env`:

```bash
# Tailscale URL (your actual Tailscale IP:port)
TAILSCALE_URL=http://100.x.x.x:3002

# CORS Origins (add GitHub Pages)
CORS_ORIGINS=http://localhost:3003,http://localhost:3000,https://bennyg83.github.io

# Other settings
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

**Replace `100.x.x.x` with your actual Tailscale IP!**

### 3. Set GitHub Secret

1. Go to: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions
2. Click **New repository secret**
3. Name: `BACKEND_API_URL`
4. Value: `http://your-tailscale-ip:3002` (e.g., `http://100.64.1.2:3002`)
5. Click **Add secret**

### 4. Configure Windows Firewall

```powershell
# Allow port 3002
New-NetFirewallRule -DisplayName "Pilzno Backend Tailscale" -Direction Inbound -LocalPort 3002 -Protocol TCP -Action Allow
```

### 5. Restart Backend

```bash
docker-compose restart pilzno-synagogue-backend
```

### 6. Test Connection

```bash
# Test from local
curl http://localhost:3002/health

# Test from Tailscale IP
curl http://your-tailscale-ip:3002/health
```

Both should return: `{"status":"healthy",...}`

### 7. Deploy to GitHub Pages

```bash
git add .
git commit -m "Configure Tailscale connection"
git push origin main
```

GitHub Actions will automatically deploy with your Tailscale backend URL!

## 🔍 Verify It Works

1. **Visit GitHub Pages**: https://bennyg83.github.io/pilzno_crm/
2. **Open Browser DevTools** → Network tab
3. **Try to login** or make any API call
4. **Check Network tab** - requests should go to: `http://your-tailscale-ip:3002/api/...`

## ❌ Troubleshooting

### CORS Errors

**Check backend logs:**
```bash
docker logs pilzno-synagogue-backend
```

Look for: `🚫 CORS blocked origin: ...`

**Solution:** Verify `TAILSCALE_URL` or `CORS_ORIGINS` in `backend/.env`

### Connection Refused

**Check:**
1. Tailscale is running: `tailscale status`
2. Backend is running: `docker ps`
3. Firewall allows port 3002

**Solution:** Restart backend: `docker-compose restart pilzno-synagogue-backend`

### GitHub Pages Can't Connect

**Check:**
1. GitHub secret `BACKEND_API_URL` is set correctly
2. Backend is accessible from Tailscale IP: `curl http://your-tailscale-ip:3002/health`
3. CORS allows GitHub Pages origin

**Solution:** Verify all steps above

## 📚 Full Documentation

See `TAILSCALE_SETUP.md` for detailed setup instructions.

---

**That's it!** Your GitHub Pages frontend is now connected to your local backend via Tailscale! 🎉

