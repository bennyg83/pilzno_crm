# ✅ Your Tailscale Configuration

## 🎯 Your Tailscale IP

**Your Tailscale IP**: `100.74.73.107`  
**Backend URL**: `http://100.74.73.107:3002`

## 📋 Setup Steps

### Step 1: Set GitHub Secret (Required)

1. **Go to GitHub Settings:**
   - Navigate to: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions

2. **Add New Secret:**
   - Click **New repository secret**
   - **Name**: `BACKEND_API_URL`
   - **Value**: `http://100.74.73.107:3002`
   - Click **Add secret**

### Step 2: Update Backend .env (Optional, Recommended)

Create or update `backend/.env`:

```bash
# Your Tailscale Configuration
TAILSCALE_URL=http://100.74.73.107:3002

# CORS Origins - allows GitHub Pages to connect
CORS_ORIGINS=http://localhost:3003,http://localhost:3000,https://bennyg83.github.io

# Other required settings
DB_PASSWORD=your_password_here
JWT_SECRET=your_jwt_secret_here
```

### Step 3: Configure Windows Firewall

```powershell
# Allow incoming connections on port 3002
New-NetFirewallRule -DisplayName "Pilzno Backend Tailscale" -Direction Inbound -LocalPort 3002 -Protocol TCP -Action Allow
```

Or manually:
1. Windows Security → Firewall & network protection
2. Advanced settings → Inbound Rules → New Rule
3. Port → TCP → Specific local ports: `3002`
4. Allow the connection
5. Apply to all profiles
6. Name: "Pilzno Backend Tailscale"

### Step 4: Restart Backend

```bash
cd "C:\Users\cursors123\Documents\Projects Shul\Projects Shul\Pilzno\pilzno_crm"
docker-compose restart pilzno-synagogue-backend
```

### Step 5: Test Connection

```bash
# Test from local
curl http://localhost:3002/health

# Test from Tailscale IP
curl http://100.74.73.107:3002/health
```

Both should return: `{"status":"healthy",...}`

### Step 6: Deploy to GitHub Pages

```bash
git add .
git commit -m "Configure Tailscale connection with IP 100.74.73.107"
git push origin main
```

GitHub Actions will automatically:
1. Build the frontend
2. Use `BACKEND_API_URL` secret (http://100.74.73.107:3002)
3. Deploy to GitHub Pages

## ✅ Verification

Once deployed:

1. **Visit**: https://bennyg83.github.io/pilzno_crm/
2. **Open DevTools** → Network tab
3. **Try to login** or make an API call
4. **Check Network tab** - requests should go to: `http://100.74.73.107:3002/api/...`

## 🔍 Troubleshooting

### If CORS Errors Appear

Check backend logs:
```bash
docker logs pilzno-synagogue-backend
```

Look for: `🚫 CORS blocked origin: ...`

**Solution:**
1. Verify `TAILSCALE_URL` or `CORS_ORIGINS` in `backend/.env`
2. Restart backend: `docker-compose restart pilzno-synagogue-backend`

### If Connection Refused

**Check:**
1. Tailscale is running: `tailscale status` (should show `crm-mini` connected)
2. Backend is running: `docker ps` (should show `pilzno-synagogue-backend`)
3. Firewall allows port 3002

**Solution:**
1. Ensure Tailscale is running
2. Check firewall rules
3. Restart backend

### If GitHub Pages Can't Connect

**Check:**
1. GitHub secret `BACKEND_API_URL` is set: `http://100.74.73.107:3002`
2. Backend is accessible: `curl http://100.74.73.107:3002/health`
3. CORS allows GitHub Pages origin

**Solution:**
1. Verify secret in GitHub Settings → Secrets → Actions
2. Test backend health endpoint
3. Check CORS configuration

## 📊 Current Status

- ✅ **Tailscale IP**: `100.74.73.107`
- ✅ **Device Name**: `crm-mini`
- ✅ **Backend Port**: `3002`
- ✅ **Backend URL**: `http://100.74.73.107:3002`
- ⏳ **GitHub Secret**: Needs to be set (`BACKEND_API_URL`)
- ⏳ **Firewall**: Needs to be configured (port 3002)
- ⏳ **Backend .env**: Optional, but recommended

## 🚀 Quick Checklist

- [ ] Set GitHub secret `BACKEND_API_URL` = `http://100.74.73.107:3002`
- [ ] (Optional) Update `backend/.env` with Tailscale URL
- [ ] Configure Windows Firewall to allow port 3002
- [ ] Restart backend: `docker-compose restart pilzno-synagogue-backend`
- [ ] Test local: `curl http://localhost:3002/health`
- [ ] Test Tailscale: `curl http://100.74.73.107:3002/health`
- [ ] Deploy: `git push origin main`
- [ ] Verify: Visit GitHub Pages and check Network tab

---

**Your Tailscale Setup**: Complete! Just need to set the GitHub secret and configure firewall. 🎉

