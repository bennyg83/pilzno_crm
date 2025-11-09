# ✅ Tailscale HTTPS Setup - Complete

## What Was Done

### 1. Installed Caddy ✅
- **Location**: `C:\caddy\caddy.exe`
- **Config**: `C:\caddy\Caddyfile`
- **Purpose**: Reverse proxy with automatic HTTPS/SSL

### 2. Configured Caddy ✅
- **Domain**: `crm-mini.tail34e202.ts.net`
- **Backend**: `localhost:3002` (your existing HTTP backend)
- **HTTPS Port**: 443
- **CORS**: Configured for GitHub Pages (`https://bennyg83.github.io`)

### 3. Windows Firewall ✅
- Port 443 (HTTPS) allowed for inbound connections

### 4. Helper Scripts ✅
- `scripts/start-caddy-tailscale.ps1` - Start Caddy
- `scripts/stop-caddy-tailscale.ps1` - Stop Caddy

### 5. Documentation ✅
- `TAILSCALE_HTTPS_SETUP.md` - Complete setup guide
- `CADDY_SETUP_COMPLETE.md` - Next steps and troubleshooting

## Current Status

✅ **Caddy installed and configured**  
✅ **Windows Firewall configured**  
✅ **Backend running** (verified on port 3002)  
✅ **Scripts created**  
⏳ **Caddy needs to be started** (see below)  
⏳ **GitHub Secret needs update** (see below)

## Next Steps (REQUIRED)

### Step 1: Start Caddy

```powershell
# Option 1: Use helper script (recommended)
.\scripts\start-caddy-tailscale.ps1

# Option 2: Direct command
C:\caddy\caddy.exe run --config C:\caddy\Caddyfile
```

**Note**: Keep Caddy running. It needs to stay active for HTTPS to work.

### Step 2: Update GitHub Secret (CRITICAL)

1. Go to: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions
2. Edit `BACKEND_API_URL` secret
3. Update value to: `https://crm-mini.tail34e202.ts.net`
   - **Important**: Use `https://` (not `http://`)
   - **Important**: No port needed (Caddy handles HTTPS on port 443)
4. Save

### Step 3: Test HTTPS Connection

After starting Caddy, test the connection:

```powershell
# Test HTTPS health check
$response = Invoke-WebRequest -Uri "https://crm-mini.tail34e202.ts.net/health" -UseBasicParsing
$response.Content
```

Should return: `{"status":"healthy",...}`

### Step 4: Deploy Frontend

After updating the GitHub secret, trigger a new deployment:

**Option A: Push to trigger automatic deployment**
```powershell
git commit --allow-empty -m "Trigger deployment with HTTPS backend"
git push origin main
```

**Option B: Manual trigger**
1. Go to: https://github.com/bennyg83/pilzno_crm/actions
2. Click "Deploy Frontend to GitHub Pages"
3. Click "Run workflow" → "Run workflow"

### Step 5: Test from GitHub Pages

1. Wait for deployment (2-3 minutes)
2. Visit: https://bennyg83.github.io/pilzno_crm/
3. Try to login
4. Should work from anywhere! ✅

## Managing Caddy

### Start Caddy
```powershell
.\scripts\start-caddy-tailscale.ps1
```

### Stop Caddy
```powershell
.\scripts\stop-caddy-tailscale.ps1
```

### Check if Caddy is Running
```powershell
Get-Process -Name "caddy" -ErrorAction SilentlyContinue
```

### Run Caddy as Windows Service (Optional)

To run Caddy automatically on startup:

1. Download NSSM: https://nssm.cc/download
2. Install as service (run as Administrator):
   ```powershell
   .\nssm.exe install Caddy "C:\caddy\caddy.exe" "run --config C:\caddy\Caddyfile"
   .\nssm.exe set Caddy AppDirectory "C:\caddy"
   .\nssm.exe start Caddy
   ```

## Troubleshooting

### Caddy Not Starting
- Check if port 443 is in use: `netstat -an | findstr ":443"`
- Verify Caddyfile: `C:\caddy\caddy.exe validate --config C:\caddy\Caddyfile`
- Check Windows Firewall: `Get-NetFirewallRule -DisplayName "*Caddy*"`

### Certificate Not Obtained
- Verify Tailscale MagicDNS: `ping crm-mini.tail34e202.ts.net`
- Check Tailscale status: `tailscale status`
- Ensure MagicDNS is enabled: https://login.tailscale.com/admin/dns

### Connection Refused
- Verify backend is running: `docker ps --filter "name=pilzno-synagogue-backend"`
- Test backend directly: `Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing`
- Check Caddy is running: `Get-Process -Name "caddy"`

## Files Created

### On Your System
- `C:\caddy\caddy.exe` - Caddy binary
- `C:\caddy\Caddyfile` - Caddy configuration
- `C:\caddy\start-caddy.ps1` - Start script
- `C:\caddy\stop-caddy.ps1` - Stop script

### In Repository
- `scripts/start-caddy-tailscale.ps1` - Project start script
- `scripts/stop-caddy-tailscale.ps1` - Project stop script
- `TAILSCALE_HTTPS_SETUP.md` - Complete setup guide
- `CADDY_SETUP_COMPLETE.md` - Next steps guide
- `SETUP_SUMMARY.md` - This file

## Architecture

```
GitHub Pages (HTTPS)
    ↓
https://bennyg83.github.io/pilzno_crm/
    ↓
HTTPS Request
    ↓
Caddy Reverse Proxy (HTTPS → HTTP)
    ↓
https://crm-mini.tail34e202.ts.net
    ↓
Tailscale Network
    ↓
Your Desktop (localhost:3002)
    ↓
Backend API (HTTP)
```

## Summary

✅ **Setup Complete**: Caddy installed, configured, and ready  
⏳ **Action Required**: Start Caddy and update GitHub secret  
🎯 **Goal**: HTTPS backend accessible from GitHub Pages without browser security issues

---

**Last Updated**: November 9, 2025  
**Status**: Setup complete, ready for Caddy start and GitHub secret update

