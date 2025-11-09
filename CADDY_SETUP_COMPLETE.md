# ✅ Caddy HTTPS Setup Complete

## What Was Installed

1. **Caddy** - Reverse proxy with automatic HTTPS
   - Location: `C:\caddy\caddy.exe`
   - Config: `C:\caddy\Caddyfile`

2. **Windows Firewall Rule** - Port 443 (HTTPS) allowed

3. **Helper Scripts** - Start/stop Caddy easily
   - `scripts/start-caddy-tailscale.ps1`
   - `scripts/stop-caddy-tailscale.ps1`

## Current Configuration

- **Tailscale Domain**: `crm-mini.tail34e202.ts.net`
- **Backend**: `localhost:3002` (HTTP)
- **HTTPS Endpoint**: `https://crm-mini.tail34e202.ts.net` (via Caddy)
- **Frontend**: `https://bennyg83.github.io/pilzno_crm/`

## Next Steps

### 1. Update GitHub Secret (REQUIRED)

1. Go to: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions
2. Edit `BACKEND_API_URL` secret
3. Update value to: `https://crm-mini.tail34e202.ts.net`
   - **Note**: Use `https://` (not `http://`)
   - **Note**: No port needed (Caddy handles HTTPS on port 443)
4. Save

### 2. Test HTTPS Connection

```powershell
# Test HTTPS health check
Invoke-WebRequest -Uri "https://crm-mini.tail34e202.ts.net/health" -UseBasicParsing
```

Should return: `{"status":"healthy",...}`

### 3. Deploy Frontend

After updating the GitHub secret, the next push will automatically deploy with the HTTPS backend URL:

```powershell
git push origin main
```

Or trigger manually:
1. Go to: https://github.com/bennyg83/pilzno_crm/actions
2. Click "Deploy Frontend to GitHub Pages"
3. Click "Run workflow" → "Run workflow"

### 4. Test from GitHub Pages

1. Wait for deployment (2-3 minutes)
2. Visit: https://bennyg83.github.io/pilzno_crm/
3. Try to login
4. Should work from anywhere! ✅

## Managing Caddy

### Start Caddy

```powershell
# Option 1: Use helper script (recommended)
.\scripts\start-caddy-tailscale.ps1

# Option 2: Direct command
C:\caddy\caddy.exe run --config C:\caddy\Caddyfile
```

### Stop Caddy

```powershell
# Option 1: Use helper script (recommended)
.\scripts\stop-caddy-tailscale.ps1

# Option 2: Direct command
Stop-Process -Name "caddy"
```

### Check Caddy Status

```powershell
Get-Process -Name "caddy" -ErrorAction SilentlyContinue
```

### View Caddy Logs

Caddy logs appear in the window where it's running. If you started it with the script, check the Caddy window.

## Running Caddy as Windows Service (Optional)

To run Caddy automatically on Windows startup:

1. **Download NSSM** (Non-Sucking Service Manager):
   - https://nssm.cc/download
   - Extract `nssm.exe`

2. **Install as service** (run as Administrator):
   ```powershell
   .\nssm.exe install Caddy "C:\caddy\caddy.exe" "run --config C:\caddy\Caddyfile"
   .\nssm.exe set Caddy AppDirectory "C:\caddy"
   .\nssm.exe start Caddy
   ```

3. **Manage service**:
   ```powershell
   # Start
   Start-Service Caddy
   
   # Stop
   Stop-Service Caddy
   
   # Status
   Get-Service Caddy
   ```

## Troubleshooting

### Caddy Not Starting

1. Check if port 443 is available:
   ```powershell
   netstat -an | findstr 443
   ```

2. Check Windows Firewall:
   ```powershell
   Get-NetFirewallRule -DisplayName "*Caddy*" | Format-Table DisplayName, Enabled, Direction
   ```

3. Check Caddyfile syntax:
   ```powershell
   C:\caddy\caddy.exe validate --config C:\caddy\Caddyfile
   ```

### Certificate Not Obtained

1. Ensure Tailscale MagicDNS is working:
   ```powershell
   ping crm-mini.tail34e202.ts.net
   ```

2. Check Tailscale status:
   ```powershell
   tailscale status
   ```

3. Verify MagicDNS is enabled:
   - Go to: https://login.tailscale.com/admin/dns
   - Ensure MagicDNS is enabled

### Connection Refused

1. Verify backend is running:
   ```powershell
   docker ps --filter "name=pilzno-synagogue-backend"
   ```

2. Test backend directly:
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing
   ```

3. Check Caddy is running:
   ```powershell
   Get-Process -Name "caddy"
   ```

## Files Created

- `C:\caddy\caddy.exe` - Caddy binary
- `C:\caddy\Caddyfile` - Caddy configuration
- `C:\caddy\start-caddy.ps1` - Start script
- `C:\caddy\stop-caddy.ps1` - Stop script
- `scripts/start-caddy-tailscale.ps1` - Project start script
- `scripts/stop-caddy-tailscale.ps1` - Project stop script

## Summary

✅ **Caddy installed and configured**  
✅ **Windows Firewall configured**  
✅ **Helper scripts created**  
⏳ **GitHub Secret needs update** (see Step 1 above)  
⏳ **Frontend needs redeploy** (after secret update)

---

**Last Updated**: November 9, 2025  
**Status**: Caddy setup complete, ready for GitHub secret update

