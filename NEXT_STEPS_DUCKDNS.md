# ✅ DuckDNS Configuration Complete - Next Steps

## ✅ What's Done

1. ✅ **DuckDNS Domain**: `pilznocrm.duckdns.org` → `46.116.149.41` (DNS verified)
2. ✅ **Caddyfile Updated**: Now using DuckDNS domain
3. ✅ **Caddy Restarted**: Running with new configuration
4. ✅ **SSL Certificate**: Caddy is requesting certificate from Let's Encrypt (takes 1-2 minutes)

## ⏳ What's Needed

### Step 1: Configure Router Port Forwarding (REQUIRED)

Forward port 443 (HTTPS) to your computer:

1. **Access router**: `http://10.100.102.1`
2. **Add port forwarding rule**:

| Setting | Value |
|---------|-------|
| **Service Name** | Pilzno Backend HTTPS |
| **External Port** | 443 |
| **Internal IP** | 10.100.102.4 |
| **Internal Port** | 443 |
| **Protocol** | TCP |

3. **Save and apply**

**Why this is needed**: External requests to `https://pilznocrm.duckdns.org` need to reach your computer on port 443 where Caddy is listening.

### Step 2: Wait for SSL Certificate (1-2 minutes)

Caddy is automatically requesting an SSL certificate from Let's Encrypt. This requires:
- Port 443 accessible from internet (Step 1 above)
- Port 80 accessible for Let's Encrypt validation (also needs forwarding)

**Check Caddy window** for:
- "certificate obtained successfully" ✅

### Step 3: Update GitHub Secret (REQUIRED)

1. **Go to**: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions
2. **Edit** `BACKEND_API_URL` secret
3. **Update value to**: `https://pilznocrm.duckdns.org`
   - **Important**: Use `https://` (Caddy provides HTTPS)
   - **Important**: No port needed (HTTPS uses 443 by default)
4. **Save**

### Step 4: Test HTTPS Connection

After router is configured and SSL certificate is obtained:

```powershell
# Test HTTPS health check
Invoke-WebRequest -Uri "https://pilznocrm.duckdns.org/health" -UseBasicParsing
```

Should return: `{"status":"healthy",...}`

### Step 5: Deploy Frontend

After updating GitHub secret:

**Option A: Automatic**
```powershell
git commit --allow-empty -m "Trigger deployment with DuckDNS HTTPS"
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

## Current Status

✅ **DuckDNS**: Configured and verified  
✅ **Caddy**: Updated and running  
⏳ **Router**: Needs port 443 forwarding  
⏳ **SSL Certificate**: Being obtained (requires port forwarding)  
⏳ **GitHub Secret**: Needs update  
⏳ **Frontend**: Needs redeploy after secret update

## Troubleshooting

### SSL Certificate Not Obtained

**Check:**
1. Port 443 is forwarded in router ✅
2. Port 80 is forwarded (for Let's Encrypt validation)
3. Windows Firewall allows ports 80 and 443
4. Wait 1-2 minutes after port forwarding

### Connection Timeout

**Check:**
1. Router port forwarding is configured
2. Windows Firewall allows port 443
3. Caddy is running: `Get-Process -Name "caddy"`
4. Backend is running: `docker ps --filter "name=pilzno-synagogue-backend"`

---

**Last Updated**: November 9, 2025  
**Status**: DuckDNS configured, waiting for router port forwarding

