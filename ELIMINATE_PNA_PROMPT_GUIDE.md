# 🎯 Eliminate PNA Prompt - Complete Guide

## The Goal

Make your CRM accessible from anywhere **without** the Private Network Access (PNA) prompt.

---

## ✅ Best Solution: DuckDNS + Caddy (You Already Have This!)

You already have:
- ✅ DuckDNS domain: `pilznocrm.duckdns.org`
- ✅ Caddy configured
- ✅ Static IP: `46.116.149.41`

**Just need to:**
1. Start Caddy
2. Configure port forwarding (one-time setup)
3. Update GitHub secret
4. Done! ✅

---

## 🚀 Step-by-Step Setup

### Step 1: Start Caddy

```powershell
cd C:\caddy
.\caddy.exe run
```

**Keep this terminal open** - Caddy needs to stay running.

**Or run as Windows service** (recommended):
```powershell
# If you have NSSM installed
.\nssm.exe start Caddy
```

### Step 2: Configure Router Port Forwarding

**This is a one-time setup** that allows external access:

1. **Access router:** `http://10.100.102.1` (or your router IP)

2. **Add port forwarding rule for HTTPS (443):**

| Setting | Value |
|---------|-------|
| **Service Name** | Pilzno Backend HTTPS |
| **External Port** | 443 |
| **Internal IP** | 10.100.102.4 (your computer's local IP) |
| **Internal Port** | 443 |
| **Protocol** | TCP |

3. **Add port forwarding rule for HTTP (80) - for Let's Encrypt:**

| Setting | Value |
|---------|-------|
| **Service Name** | Pilzno Backend HTTP |
| **External Port** | 80 |
| **Internal IP** | 10.100.102.4 |
| **Internal Port** | 80 |
| **Protocol** | TCP |

4. **Save and apply**

**Why port forwarding?**
- Allows external users to reach your computer
- Only ports 80 and 443 are exposed (standard web ports)
- Caddy handles all security
- Your database is still protected (not exposed)

### Step 3: Configure Windows Firewall

Allow ports 80 and 443:

```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Pilzno Backend HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Pilzno Backend HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow
```

**Or manually:**
1. Windows Security → Firewall & network protection
2. Advanced settings → Inbound Rules → New Rule
3. Port → TCP → Specific local ports: `443,80`
4. Allow the connection
5. Apply to all profiles

### Step 4: Verify Caddy Configuration

Check `C:\caddy\Caddyfile`:

```caddy
pilznocrm.duckdns.org {
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

**If it's different, update it to match above.**

### Step 5: Wait for SSL Certificate (1-2 minutes)

Caddy automatically gets SSL certificate from Let's Encrypt.

**Check Caddy logs** - you should see:
```
certificate obtained successfully
```

### Step 6: Test HTTPS Connection

```powershell
# Test from your computer
Invoke-WebRequest -Uri "https://pilznocrm.duckdns.org/health" -UseBasicParsing
```

**Should return:** `{"status":"healthy",...}`

**If it works locally, test from external network:**
- Use your phone (on mobile data, not WiFi)
- Or ask someone else to test
- Visit: `https://pilznocrm.duckdns.org/health`

### Step 7: Update GitHub Secret

1. **Go to:** https://github.com/bennyg83/pilzno_crm/settings/secrets/actions
2. **Edit `BACKEND_API_URL` secret**
3. **Update value to:** `https://pilznocrm.duckdns.org`
   - **Important**: Use `https://` (Caddy provides HTTPS)
   - **Important**: No port needed
4. **Save**

### Step 8: Deploy Frontend

```powershell
cd "C:\Users\cursors123\Documents\Projects Shul\Projects Shul\Pilzno\pilzno_crm"
git commit --allow-empty -m "Use DuckDNS HTTPS endpoint - eliminate PNA prompt"
git push origin main
```

**Or manually trigger:**
1. Go to: https://github.com/bennyg83/pilzno_crm/actions
2. Click "Deploy Frontend to GitHub Pages"
3. Click "Run workflow"

### Step 9: Test from External Network

1. **Wait for deployment** (2-3 minutes)
2. **Visit from external network** (not your WiFi):
   - Use phone on mobile data
   - Or ask someone else to test
   - URL: `https://bennyg83.github.io/pilzno_crm/`
3. **Try to login:**
   - Email: `admin@pilzno.org`
   - Password: `pilzno2024`
4. **Should work without PNA prompt!** ✅

---

## ✅ What This Achieves

- ✅ **No PNA prompt** - True public endpoint
- ✅ **Works from anywhere** - No browser restrictions
- ✅ **Automatic HTTPS** - Caddy handles SSL
- ✅ **Secure** - Only web ports exposed, database protected
- ✅ **Professional** - Standard web setup

---

## 🔒 Security Notes

### What's Exposed

- ✅ **Port 443 (HTTPS)** - Standard web port, secure
- ✅ **Port 80 (HTTP)** - Only for Let's Encrypt, redirects to HTTPS
- ❌ **Database port** - NOT exposed (still local only)
- ❌ **Backend port 3002** - NOT exposed (only accessible via Caddy)

### Security Measures

- ✅ **Caddy reverse proxy** - Handles all security
- ✅ **Automatic HTTPS** - Encrypted connections
- ✅ **CORS protection** - Only GitHub Pages can access
- ✅ **Database isolation** - Never exposed
- ✅ **Backend protection** - Only API endpoints accessible

---

## 🐛 Troubleshooting

### SSL Certificate Not Obtained

**Check:**
1. Port 80 is forwarded (required for Let's Encrypt)
2. Windows Firewall allows port 80
3. DuckDNS IP is correct: `46.116.149.41`
4. Wait 1-2 minutes for certificate

**Verify DNS:**
```powershell
nslookup pilznocrm.duckdns.org
# Should return: 46.116.149.41
```

### Connection Refused from External Network

**Check:**
1. Router port forwarding is configured (ports 80 and 443)
2. Windows Firewall allows ports 80 and 443
3. Caddy is running
4. Backend is running on port 3002

**Test locally first:**
```powershell
Invoke-WebRequest -Uri "https://pilznocrm.duckdns.org/health" -UseBasicParsing
```

If this works locally but not externally, it's a port forwarding issue.

### CORS Errors

**Check:**
1. Caddyfile has CORS headers (see Step 4)
2. Backend CORS allows `https://bennyg83.github.io`
3. Restart Caddy after changing Caddyfile

---

## 📋 Summary

**What you're doing:**
1. Using DuckDNS for public DNS
2. Using Caddy for HTTPS reverse proxy
3. Forwarding ports 80 and 443 (standard web ports)
4. Creating a true public endpoint

**Result:**
- ✅ No PNA prompt
- ✅ Works from anywhere
- ✅ Professional setup
- ✅ Secure

---

**Last Updated**: November 9, 2025  
**Status**: Complete guide to eliminate PNA prompt using DuckDNS + Caddy

