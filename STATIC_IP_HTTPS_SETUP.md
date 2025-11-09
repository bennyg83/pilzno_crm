# 🏠 Static IP HTTPS Setup - Minimal Integration

## Goal
- ✅ GitHub Pages (free) - already set up
- ✅ Backend on home desktop with static IP
- ✅ HTTPS backend (required for GitHub Pages)
- ✅ No additional web services (minimal setup)
- ✅ No excessive integrations

## Solution: Caddy + DuckDNS (Free Dynamic DNS)

**What you need:**
1. **DuckDNS** (free) - Just DNS pointing to your static IP
2. **Caddy** (free) - Reverse proxy with automatic HTTPS/SSL

**Total setup time:** ~15 minutes

---

## Step 1: Get Free Domain from DuckDNS (2 minutes)

1. **Sign up (free):**
   - Go to: https://www.duckdns.org/
   - Sign in with Google/GitHub (free)
   - Create account

2. **Create subdomain:**
   - Choose a subdomain: `pilzno-backend` (or any available name)
   - You'll get: `pilzno-backend.duckdns.org`
   - **Note your static IP:** `89.138.168.239` (from your router setup)

3. **Point to your static IP:**
   - In DuckDNS dashboard, add your static IP: `89.138.168.239`
   - Click "Update IP"
   - Wait 1-2 minutes for DNS to propagate

**Result:** `pilzno-backend.duckdns.org` → `89.138.168.239`

---

## Step 2: Install Caddy (2 minutes)

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

## Step 3: Configure Caddy (5 minutes)

### Create Caddyfile

Create a file: `C:\caddy\Caddyfile` (or wherever you put caddy.exe)

```caddy
pilzno-backend.duckdns.org {
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

**Replace:**
- `pilzno-backend.duckdns.org` with your DuckDNS domain
- `localhost:3002` is your backend (already running on port 3002)

---

## Step 4: Configure Router Port Forwarding (5 minutes)

You need to forward port **443 (HTTPS)** to your computer.

### Router Configuration:

1. **Access router:** `http://10.100.102.1`
2. **Add port forwarding rule:**

| Setting | Value |
|---------|-------|
| **Service Name** | Pilzno Backend HTTPS |
| **External Port** | 443 |
| **Internal IP** | 10.100.102.4 |
| **Internal Port** | 443 |
| **Protocol** | TCP |

3. **Also forward port 80 (for Let's Encrypt):**

| Setting | Value |
|---------|-------|
| **Service Name** | Pilzno Backend HTTP |
| **External Port** | 80 |
| **Internal IP** | 10.100.102.4 |
| **Internal Port** | 80 |
| **Protocol** | TCP |

4. **Save and apply**

---

## Step 5: Configure Windows Firewall (2 minutes)

Allow ports 80 and 443:

```powershell
# Allow HTTPS (port 443)
New-NetFirewallRule -DisplayName "Pilzno Backend HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow

# Allow HTTP (port 80 - for Let's Encrypt)
New-NetFirewallRule -DisplayName "Pilzno Backend HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow
```

Or manually:
1. Windows Security → Firewall & network protection
2. Advanced settings → Inbound Rules → New Rule
3. Port → TCP → Specific local ports: `443,80`
4. Allow the connection
5. Apply to all profiles

---

## Step 6: Start Caddy (1 minute)

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

## Step 7: Update GitHub Secret (1 minute)

1. **Go to:** https://github.com/bennyg83/pilzno_crm/settings/secrets/actions
2. **Edit `BACKEND_API_URL` secret:**
   - Value: `https://pilzno-backend.duckdns.org`
   - **Note:** Use `https://` (not `http://`)
3. **Save**

---

## Step 8: Test (2 minutes)

### Test 1: Local HTTPS
```powershell
# Test HTTPS health check
Invoke-WebRequest -Uri "https://pilzno-backend.duckdns.org/health" -UseBasicParsing
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
- ✅ **Backend:** Your static IP with HTTPS - `https://pilzno-backend.duckdns.org`
- ✅ **No additional services** - Just DuckDNS (DNS) and Caddy (reverse proxy)
- ✅ **Automatic HTTPS** - Caddy handles SSL certificates automatically
- ✅ **Works from anywhere** - No browser security issues

---

## 🔧 Maintenance

### Update DuckDNS IP (if your static IP changes):

1. Go to: https://www.duckdns.org/
2. Update IP to new static IP
3. Click "Update IP"

### Keep Caddy Running:

- **Option A:** Keep terminal open
- **Option B:** Run as Windows service (recommended - see Step 6)

### Check Caddy Status:

```powershell
# If running as service
Get-Service Caddy

# Check logs
# Caddy logs to console, or check Windows Event Viewer if running as service
```

---

## 🐛 Troubleshooting

### Issue: "Certificate not obtained"

**Solution:**
- Ensure port 80 is forwarded (required for Let's Encrypt)
- Check Windows Firewall allows port 80
- Wait 1-2 minutes and try again

### Issue: "Connection refused"

**Solution:**
- Check router port forwarding (ports 80 and 443)
- Check Windows Firewall rules
- Verify backend is running on port 3002
- Check Caddy is running

### Issue: "DNS not resolving"

**Solution:**
- Wait 5-10 minutes for DNS propagation
- Verify DuckDNS IP is correct
- Check: `nslookup pilzno-backend.duckdns.org`

### Issue: "CORS errors"

**Solution:**
- Verify Caddyfile has CORS headers (see Step 3)
- Restart Caddy after changing Caddyfile
- Check backend CORS configuration allows `https://bennyg83.github.io`

---

## 📋 Summary

**What you installed:**
1. DuckDNS account (free) - DNS pointing
2. Caddy (free) - Reverse proxy with auto HTTPS

**What you configured:**
1. DuckDNS domain → Static IP
2. Router port forwarding (80, 443)
3. Windows Firewall (80, 443)
4. Caddy reverse proxy
5. GitHub Secret

**Total time:** ~15 minutes  
**Cost:** $0 (all free)  
**Services:** Minimal (just DNS + reverse proxy)

---

**Last Updated:** November 3, 2025  
**Status:** Minimal static IP HTTPS setup

