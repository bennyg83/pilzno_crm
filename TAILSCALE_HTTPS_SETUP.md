# 🚀 Tailscale HTTPS Setup - Simplest Solution

## Why Tailscale + Caddy?

You already have:
- ✅ Tailscale installed and running
- ✅ MagicDNS domain: `crm-mini.tail34e202.ts.net`
- ✅ Tailscale IP: `100.74.73.107`

**Just add Caddy** (reverse proxy) to get HTTPS automatically!

**Benefits:**
- ✅ Uses your existing Tailscale setup
- ✅ No need for DuckDNS or static IP configuration
- ✅ Automatic HTTPS/SSL certificates
- ✅ Works from anywhere (Tailscale network)
- ✅ Minimal setup (~10 minutes)

---

## Step 1: Install Caddy (2 minutes)

**Caddy** is a reverse proxy that automatically:
- Gets SSL certificates from Let's Encrypt (free)
- Handles HTTPS
- Proxies to your HTTP backend

### Install on Windows:

**Option A: Download (Recommended)**
1. Download: https://caddyserver.com/download
2. Choose: Windows 64-bit
3. Extract `caddy.exe` to a folder (e.g., `C:\caddy\`)

**Option B: Using Chocolatey**
```powershell
choco install caddy
```

---

## Step 2: Configure Caddy (3 minutes)

### Create Caddyfile

Create a file: `C:\caddy\Caddyfile` (or wherever you put caddy.exe)

```caddy
crm-mini.tail34e202.ts.net:443 {
    reverse_proxy localhost:3002
    
    # CORS headers for GitHub Pages
    header {
        Access-Control-Allow-Origin "https://bennyg83.github.io"
        Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
        Access-Control-Allow-Credentials "true"
    }
    
    # Handle preflight requests
    @options {
        method OPTIONS
    }
    handle @options {
        respond 204
    }
}
```

**Note:**
- `crm-mini.tail34e202.ts.net` is your Tailscale MagicDNS domain
- `localhost:3002` is your backend (already running)
- Port 443 is HTTPS

---

## Step 3: Configure Windows Firewall (1 minute)

Allow port 443 (HTTPS):

```powershell
# Allow HTTPS (port 443)
New-NetFirewallRule -DisplayName "Pilzno Backend HTTPS Tailscale" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow
```

Or manually:
1. Windows Security → Firewall & network protection
2. Advanced settings → Inbound Rules → New Rule
3. Port → TCP → Specific local ports: `443`
4. Allow the connection
5. Apply to all profiles

**Note:** Since you're using Tailscale, you don't need router port forwarding! Tailscale handles the networking.

---

## Step 4: Start Caddy (1 minute)

### Run Caddy:

```powershell
# Navigate to Caddy folder
cd C:\caddy

# Run Caddy (it will automatically get SSL certificate)
.\caddy.exe run
```

**First run:**
- Caddy will automatically get SSL certificate from Let's Encrypt
- Takes 30-60 seconds
- You'll see: `certificate obtained successfully`

**Keep this terminal open** - Caddy needs to stay running.

### Run as Windows Service (Optional - Recommended):

To run Caddy automatically on startup:

1. **Download NSSM** (Non-Sucking Service Manager):
   - https://nssm.cc/download
   - Extract `nssm.exe`

2. **Install as service:**
   ```powershell
   # Run as Administrator
   .\nssm.exe install Caddy "C:\caddy\caddy.exe" "run"
   .\nssm.exe set Caddy AppDirectory "C:\caddy"
   .\nssm.exe start Caddy
   ```

Now Caddy will start automatically on Windows boot.

---

## Step 5: Update GitHub Secret (1 minute)

1. **Go to:** https://github.com/bennyg83/pilzno_crm/settings/secrets/actions
2. **Edit `BACKEND_API_URL` secret:**
   - Value: `https://crm-mini.tail34e202.ts.net`
   - **Note:** Use `https://` (not `http://`)
   - **Note:** No port needed (Caddy handles HTTPS on port 443)
3. **Save**

---

## Step 6: Test (2 minutes)

### Test 1: Local HTTPS
```powershell
# Test HTTPS health check
Invoke-WebRequest -Uri "https://crm-mini.tail34e202.ts.net/health" -UseBasicParsing
```

Should return: `{"status":"healthy",...}`

### Test 2: GitHub Pages
1. Wait for GitHub Actions to redeploy (2-3 minutes)
2. Visit: https://bennyg83.github.io/pilzno_crm/
3. Try to login
4. Should work from anywhere! ✅

---

## ✅ Done!

Your setup:
- ✅ **Frontend:** GitHub Pages (free) - `https://bennyg83.github.io/pilzno_crm/`
- ✅ **Backend:** Tailscale HTTPS - `https://crm-mini.tail34e202.ts.net`
- ✅ **No router configuration needed** - Tailscale handles networking
- ✅ **Automatic HTTPS** - Caddy handles SSL certificates automatically
- ✅ **Works from anywhere** - No browser security issues
- ✅ **Minimal setup** - Just Caddy added to existing Tailscale

---

## 🔧 Maintenance

### Keep Caddy Running:

- **Option A:** Keep terminal open
- **Option B:** Run as Windows service (recommended - see Step 4)

### Check Caddy Status:

```powershell
# If running as service
Get-Service Caddy

# Check logs
# Caddy logs to console, or check Windows Event Viewer if running as service
```

### Restart Caddy:

```powershell
# If running as service
Restart-Service Caddy

# If running in terminal
# Stop with Ctrl+C, then start again: .\caddy.exe run
```

---

## 🐛 Troubleshooting

### Issue: "Certificate not obtained"

**Solution:**
- Ensure Tailscale MagicDNS is working: `ping crm-mini.tail34e202.ts.net`
- Check Caddy logs for errors
- Wait 1-2 minutes and try again
- Verify Caddyfile syntax is correct

### Issue: "Connection refused"

**Solution:**
- Check Windows Firewall allows port 443
- Verify backend is running on port 3002
- Check Caddy is running: `Get-Service Caddy` or check terminal
- Verify Caddyfile path is correct

### Issue: "DNS not resolving"

**Solution:**
- Verify Tailscale is running: `tailscale status`
- Check MagicDNS is enabled: https://login.tailscale.com/admin/dns
- Test: `ping crm-mini.tail34e202.ts.net`
- Restart Tailscale if needed

### Issue: "CORS errors"

**Solution:**
- Verify Caddyfile has CORS headers (see Step 2)
- Restart Caddy after changing Caddyfile
- Check backend CORS configuration allows `https://bennyg83.github.io`

### Issue: "Certificate warning in browser"

**Solution:**
- This is normal for Tailscale domains - Let's Encrypt may not recognize `.ts.net` domains
- You can accept the certificate warning (it's still encrypted)
- Or use Tailscale's built-in HTTPS (see Alternative below)

---

## 🔄 Alternative: Tailscale Built-in HTTPS

If you want to avoid Caddy, Tailscale has a built-in HTTPS feature:

### Option A: Tailscale HTTPS (if available)

1. **Check if available:**
   ```powershell
   tailscale cert crm-mini.tail34e202.ts.net
   ```

2. **If it works:**
   - Tailscale will provide SSL certificate
   - Update backend to use HTTPS directly
   - No Caddy needed!

**Note:** This feature may require Tailscale Pro or may not be available for all domains.

### Option B: Use Caddy (Recommended)

Caddy is more reliable and works with any domain, including Tailscale MagicDNS.

---

## 📋 Comparison: Tailscale vs Static IP

| Feature | Tailscale + Caddy | Static IP + DuckDNS + Caddy |
|---------|------------------|----------------------------|
| **Setup Time** | ~10 minutes | ~15 minutes |
| **Router Config** | ❌ Not needed | ✅ Required (port forwarding) |
| **Domain** | ✅ Automatic (MagicDNS) | ✅ Free (DuckDNS) |
| **HTTPS** | ✅ Automatic (Caddy) | ✅ Automatic (Caddy) |
| **Network** | ✅ Tailscale VPN | ✅ Public Internet |
| **Security** | ✅ Encrypted VPN | ✅ HTTPS only |
| **Access** | ✅ Tailscale network | ✅ Public access |

**Recommendation:** Use Tailscale + Caddy (simpler, no router config needed!)

---

## 📋 Summary

**What you installed:**
1. Caddy (free) - Reverse proxy with auto HTTPS

**What you configured:**
1. Caddyfile for Tailscale domain
2. Windows Firewall (port 443)
3. GitHub Secret (HTTPS URL)
4. Caddy as Windows service (optional)

**Total time:** ~10 minutes  
**Cost:** $0 (all free)  
**Services:** Minimal (just Caddy added to existing Tailscale)

---

**Last Updated:** November 3, 2025  
**Status:** Tailscale HTTPS setup with Caddy  
**Tailscale Domain:** `crm-mini.tail34e202.ts.net`

