# ✅ DuckDNS Setup Complete

## Configuration

**DuckDNS Domain**: `pilznocrm.duckdns.org`  
**IP Address**: `46.116.149.41`  
**HTTPS Endpoint**: `https://pilznocrm.duckdns.org`  
**Backend**: `localhost:3002` (via Caddy reverse proxy)

## What Was Done

1. ✅ **Caddyfile Updated**: Changed from Tailscale domain to DuckDNS domain
2. ✅ **Caddy Restarted**: Now using `pilznocrm.duckdns.org`
3. ✅ **SSL Certificate**: Caddy will automatically get certificate from Let's Encrypt

## Next Steps

### Step 1: Wait for SSL Certificate (1-2 minutes)

Caddy is automatically requesting an SSL certificate from Let's Encrypt. This takes 30-60 seconds.

**Check Caddy logs** to see:
- "certificate obtained successfully" ✅

### Step 2: Configure Router Port Forwarding

Forward port 443 (HTTPS) to your computer:

1. Access router: `http://10.100.102.1`
2. Add port forwarding rule:

| Setting | Value |
|---------|-------|
| **Service Name** | Pilzno Backend HTTPS |
| **External Port** | 443 |
| **Internal IP** | 10.100.102.4 |
| **Internal Port** | 443 |
| **Protocol** | TCP |

3. Save and apply

### Step 3: Update GitHub Secret (REQUIRED)

1. Go to: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions
2. Edit `BACKEND_API_URL` secret
3. Update value to: `https://pilznocrm.duckdns.org`
   - **Important**: Use `https://` (Caddy provides HTTPS)
   - **Important**: No port needed (HTTPS uses 443 by default)
4. Save

### Step 4: Test HTTPS Connection

After SSL certificate is obtained (1-2 minutes):

```powershell
# Test HTTPS health check
Invoke-WebRequest -Uri "https://pilznocrm.duckdns.org/health" -UseBasicParsing
```

Should return: `{"status":"healthy",...}`

### Step 5: Deploy Frontend

After updating GitHub secret, trigger new deployment:

**Option A: Automatic**
```powershell
git commit --allow-empty -m "Trigger deployment with DuckDNS HTTPS backend"
git push origin main
```

**Option B: Manual**
1. Go to: https://github.com/bennyg83/pilzno_crm/actions
2. Click "Deploy Frontend to GitHub Pages"
3. Click "Run workflow" → "Run workflow"

### Step 6: Test Login

1. Wait for deployment (2-3 minutes)
2. Visit: https://bennyg83.github.io/pilzno_crm/
3. Try to login:
   - Email: `admin@pilzno.org`
   - Password: `pilzno2024`
4. Should work perfectly! ✅

## Troubleshooting

### SSL Certificate Not Obtained

**Check:**
1. Port 443 is forwarded in router
2. Windows Firewall allows port 443
3. DuckDNS IP is correct: `46.116.149.41`
4. Wait 1-2 minutes for certificate

**Verify DNS:**
```powershell
nslookup pilznocrm.duckdns.org
# Should return: 46.116.149.41
```

### Connection Refused

**Check:**
1. Caddy is running: `Get-Process -Name "caddy"`
2. Backend is running: `docker ps --filter "name=pilzno-synagogue-backend"`
3. Router port forwarding is configured
4. Windows Firewall allows port 443

### DNS Not Resolving

**Check:**
1. DuckDNS IP is set correctly: `46.116.149.41`
2. Wait 5-10 minutes for DNS propagation
3. Test: `nslookup pilznocrm.duckdns.org`

## Current Status

✅ **DuckDNS**: Configured (`pilznocrm.duckdns.org` → `46.116.149.41`)  
✅ **Caddy**: Updated and restarted  
⏳ **SSL Certificate**: Being obtained (1-2 minutes)  
⏳ **Router**: Needs port 443 forwarding  
⏳ **GitHub Secret**: Needs update to `https://pilznocrm.duckdns.org`  
⏳ **Frontend**: Needs redeploy after secret update

---

**Last Updated**: November 9, 2025  
**Status**: DuckDNS configured, waiting for SSL certificate and GitHub secret update

