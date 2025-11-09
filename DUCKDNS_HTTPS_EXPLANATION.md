# 🔐 DuckDNS + HTTPS Explanation

## How It Works

### DuckDNS Role (DNS Only)
- **DuckDNS provides**: Domain name resolution (DNS)
- **What it does**: Points `pilzno-backend.duckdns.org` → Your IP (`89.138.168.239`)
- **Protocol**: DNS is protocol-agnostic (works with both HTTP and HTTPS)

### Caddy Role (HTTPS/SSL)
- **Caddy provides**: HTTPS/SSL encryption
- **What it does**: 
  - Automatically gets SSL certificate from Let's Encrypt (free)
  - Provides HTTPS on port 443
  - Proxies to your HTTP backend on port 3002

## The Setup Flow

```
1. DuckDNS: pilzno-backend.duckdns.org → 89.138.168.239 (DNS resolution)
                    ↓
2. Browser: Requests https://pilzno-backend.duckdns.org
                    ↓
3. Router: Forwards port 443 to your computer (10.100.102.4:443)
                    ↓
4. Caddy: Receives HTTPS request, decrypts it
                    ↓
5. Caddy: Forwards to localhost:3002 (your HTTP backend)
                    ↓
6. Backend: Processes request and returns response
                    ↓
7. Caddy: Encrypts response with HTTPS
                    ↓
8. Browser: Receives encrypted HTTPS response ✅
```

## Why DuckDNS Shows HTTP

**DuckDNS website shows HTTP** because:
- DuckDNS only provides DNS (domain name → IP mapping)
- It doesn't provide HTTPS/SSL
- The website example uses HTTP as a simple example
- **This is normal and expected!**

**HTTPS comes from Caddy**, which we already have installed and configured.

## What You Need to Do

### Step 1: Set Up DuckDNS (Just DNS)

1. Go to: https://www.duckdns.org/
2. Sign in (free)
3. Create subdomain: `pilzno-backend`
4. Point to your static IP: `89.138.168.239`
5. Click "Update IP"

**Result**: `pilzno-backend.duckdns.org` now resolves to `89.138.168.239`

### Step 2: Update Caddy (Already Installed)

Update `C:\caddy\Caddyfile`:

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

**Change**: Replace `crm-mini.tail34e202.ts.net` with `pilzno-backend.duckdns.org`

### Step 3: Restart Caddy

```powershell
# Stop Caddy
.\scripts\stop-caddy-tailscale.ps1

# Start Caddy (it will automatically get SSL certificate)
.\scripts\start-caddy-tailscale.ps1
```

**What happens:**
- Caddy sees the DuckDNS domain
- Caddy automatically requests SSL certificate from Let's Encrypt
- Takes 30-60 seconds
- You'll see: "certificate obtained successfully"
- HTTPS is now working! ✅

### Step 4: Configure Router (Port Forwarding)

Forward port 443 (HTTPS) to your computer:

1. Access router: `http://10.100.102.1`
2. Add port forwarding:
   - **External Port**: 443
   - **Internal IP**: 10.100.102.4
   - **Internal Port**: 443
   - **Protocol**: TCP

### Step 5: Update GitHub Secret

1. Go to: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions
2. Edit `BACKEND_API_URL`
3. Set to: `https://pilzno-backend.duckdns.org`
   - **Note**: Use `https://` (Caddy provides HTTPS)
   - **Note**: No port needed (HTTPS uses 443 by default)
4. Save

## Testing

### Test DNS Resolution
```powershell
nslookup pilzno-backend.duckdns.org
# Should return: 89.138.168.239
```

### Test HTTPS
```powershell
Invoke-WebRequest -Uri "https://pilzno-backend.duckdns.org/health" -UseBasicParsing
# Should return: {"status":"healthy",...}
```

## Summary

| Component | Provides | Protocol |
|-----------|----------|----------|
| **DuckDNS** | DNS (domain → IP) | N/A (DNS) |
| **Caddy** | HTTPS/SSL | HTTPS (port 443) |
| **Your Backend** | API | HTTP (port 3002) |

**Result**: 
- DuckDNS: `pilzno-backend.duckdns.org` → `89.138.168.239` (DNS)
- Caddy: Provides HTTPS encryption automatically
- GitHub Secret: `https://pilzno-backend.duckdns.org` ✅

---

**Last Updated**: November 9, 2025  
**Status**: DuckDNS provides DNS, Caddy provides HTTPS

