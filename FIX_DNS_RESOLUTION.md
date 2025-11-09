# 🔧 Fix DNS Resolution Error

## Problem

**Error**: `ERR_NAME_NOT_RESOLVED` when trying to connect to `https://crm-mini.tail34e202.ts.net`

**Root Cause**: Tailscale MagicDNS (`crm-mini.tail34e202.ts.net`) only resolves on devices connected to your Tailscale network. Browsers accessing GitHub Pages are NOT on Tailscale, so they can't resolve this domain.

## Solution: Use DuckDNS (Free Public DNS)

We need a publicly resolvable domain. Let's set up DuckDNS with your static IP.

### Step 1: Get DuckDNS Domain (2 minutes)

1. **Sign up** (free): https://www.duckdns.org/
   - Sign in with Google/GitHub
   
2. **Create subdomain**:
   - Choose: `pilzno-backend` (or any available name)
   - You'll get: `pilzno-backend.duckdns.org`
   
3. **Point to your static IP**:
   - Your static IP: `89.138.168.239` (from router setup)
   - In DuckDNS dashboard, add IP: `89.138.168.239`
   - Click "Update IP"
   - Wait 1-2 minutes for DNS propagation

### Step 2: Update Caddy Configuration

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

### Step 3: Restart Caddy

```powershell
# Stop Caddy
.\scripts\stop-caddy-tailscale.ps1

# Update Caddyfile (edit C:\caddy\Caddyfile with new domain)

# Start Caddy
.\scripts\start-caddy-tailscale.ps1
```

### Step 4: Configure Router Port Forwarding

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
3. Update to: `https://pilzno-backend.duckdns.org`
   - **Note**: Use `https://` (Caddy provides HTTPS)
   - **Note**: No port needed (HTTPS uses port 443 by default)
4. Save

### Step 6: Deploy Frontend

Trigger new deployment:
```powershell
git commit --allow-empty -m "Trigger deployment with DuckDNS backend"
git push origin main
```

Or manually trigger at: https://github.com/bennyg83/pilzno_crm/actions

## Quick Fix (Temporary - Use Tailscale IP)

If you need it working NOW while setting up DuckDNS:

1. **Update GitHub Secret** to: `http://100.74.73.107:3002`
   - **Note**: This is HTTP (not HTTPS), so browsers will show Mixed Content warning
   - **Note**: Users will need to allow Mixed Content in browser (not ideal for production)

2. **Deploy frontend** (will work but with security warnings)

3. **Then set up DuckDNS** for proper HTTPS solution

---

**Last Updated**: November 9, 2025  
**Status**: DNS resolution fix required

