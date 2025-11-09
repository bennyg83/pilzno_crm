# 🎉 Tailscale Funnel Setup - No Port Forwarding Needed!

## ✅ Perfect Solution!

**Tailscale Funnel** is exactly what you need:
- ✅ **No port forwarding** - Service stays private
- ✅ **Automatic HTTPS** - Provided by Tailscale
- ✅ **Free** - For personal use
- ✅ **Secure** - Uses Tailscale infrastructure
- ✅ **Public URL** - Accessible from anywhere

## How It Works

```
Browser (anywhere)
    ↓
HTTPS Request
    ↓
Tailscale Funnel (public HTTPS URL)
    ↓
Tailscale Network (secure tunnel)
    ↓
Your Computer (localhost:3002)
    ↓
Backend API ✅
```

**No port forwarding needed!** Traffic goes through Tailscale's secure network.

## Setup

### Step 1: Start Tailscale Funnel

```powershell
# Expose backend on port 3002
tailscale funnel --bg 3002
```

**Output will show:**
```
Available on the internet:
https://abc123-def456-ghi789.ts.net
```

**Copy this HTTPS URL!**

### Step 2: Update GitHub Secret

1. Go to: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions
2. Edit `BACKEND_API_URL` secret
3. Update to: `https://your-funnel-url.ts.net`
   - Use the URL from Step 1
   - **Note**: Use `https://` (Tailscale provides HTTPS)
   - **Note**: No port needed
4. Save

### Step 3: Check Funnel Status

```powershell
tailscale funnel status
```

Shows:
- Current funnel configuration
- Public URL
- Status

### Step 4: Deploy Frontend

After updating GitHub secret:

```powershell
git commit --allow-empty -m "Trigger deployment with Tailscale Funnel"
git push origin main
```

Or manually trigger at: https://github.com/bennyg83/pilzno_crm/actions

### Step 5: Test Login

1. Wait for deployment (2-3 minutes)
2. Visit: https://bennyg83.github.io/pilzno_crm/
3. Try to login:
   - Email: `admin@pilzno.org`
   - Password: `pilzno2024`
4. Should work perfectly! ✅

## Managing Funnel

### Check Status
```powershell
tailscale funnel status
```

### Stop Funnel
```powershell
tailscale funnel reset
```

### Restart Funnel
```powershell
tailscale funnel --bg 3002
```

## Benefits vs Port Forwarding

| Feature | Port Forwarding | Tailscale Funnel |
|---------|----------------|------------------|
| **Security** | ⚠️ Exposes network | ✅ Secure tunnel |
| **Setup** | ⚠️ Router config | ✅ One command |
| **HTTPS** | ⚠️ Manual setup | ✅ Automatic |
| **Firewall** | ⚠️ Complex rules | ✅ Not needed |
| **Cost** | Free | Free |

## Troubleshooting

### Funnel Not Starting

**Check:**
1. Tailscale is running: `tailscale status`
2. Backend is running: `docker ps --filter "name=pilzno-synagogue-backend"`
3. Port 3002 is available: `netstat -an | findstr ":3002"`

### URL Not Working

**Check:**
1. Funnel status: `tailscale funnel status`
2. Verify URL is correct
3. Wait 30-60 seconds for propagation

### Connection Refused

**Check:**
1. Backend is running on port 3002
2. Test locally: `Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing`
3. Funnel is active: `tailscale funnel status`

## Notes

- **Funnel URL may change** if you restart Funnel
- **Free tier**: May have usage limits
- **HTTPS**: Automatically provided by Tailscale
- **No Caddy needed**: Tailscale Funnel handles HTTPS

---

**Last Updated**: November 9, 2025  
**Status**: Tailscale Funnel - No port forwarding needed!

