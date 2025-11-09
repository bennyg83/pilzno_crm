# 🚀 Quick Start: HTTPS Backend WITHOUT Domain

## Problem
You need HTTPS backend accessible from anywhere, but **don't have a domain name**.

## ✅ Solution: ngrok (5 Minutes Setup)

### Step 1: Sign Up (1 minute)
1. Go to: https://dashboard.ngrok.com/signup
2. Create free account
3. Copy your **authtoken** from dashboard

### Step 2: Install ngrok (1 minute)
```powershell
# Option A: Download from https://ngrok.com/download
# Option B: Use Chocolatey
choco install ngrok
```

### Step 3: Authenticate (30 seconds)
```powershell
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

### Step 4: Start Tunnel (30 seconds)
```powershell
ngrok http 3002
```

**You'll see output like:**
```
Forwarding  https://abc123-def456.ngrok-free.app -> http://localhost:3002
```

**Copy the HTTPS URL** (e.g., `https://abc123-def456.ngrok-free.app`)

### Step 5: Reserve Free Domain (Optional - 2 minutes)
For a **permanent URL** that doesn't change:

1. Go to: https://dashboard.ngrok.com/cloud-edge/domains
2. Click "Reserve Domain"
3. Choose a name: `pilzno-backend` (or any available name)
4. You'll get: `pilzno-backend.ngrok-free.app`
5. Run: `ngrok http 3002 --domain=pilzno-backend.ngrok-free.app`

### Step 6: Update GitHub Secret (1 minute)
1. Go to: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions
2. Edit `BACKEND_API_URL`
3. Set to: `https://your-ngrok-url.ngrok-free.app`
4. Save

### Step 7: Keep ngrok Running
**Important**: ngrok must stay running for the backend to be accessible.

**Option A: Keep Terminal Open**
- Just leave the terminal with `ngrok http 3002` running

**Option B: Run as Windows Service** (Advanced)
- Use NSSM (Non-Sucking Service Manager) to run ngrok as a service
- Or use Task Scheduler to run on startup

### Step 8: Test
1. Wait for GitHub Actions to redeploy (2-3 minutes)
2. Visit: https://bennyg83.github.io/pilzno_crm/
3. Try to login
4. Should work from anywhere! ✅

---

## 🔄 Alternative: Cloudflare Tunnel (Even Faster - 2 Minutes)

### Step 1: Install (1 minute)
```powershell
choco install cloudflared
```

### Step 2: Start Tunnel (30 seconds)
```powershell
cloudflared tunnel --url http://localhost:3002
```

**You'll see:**
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at:                                         |
|  https://abc123-def456-ghi789.trycloudflare.com                                            |
+--------------------------------------------------------------------------------------------+
```

**Copy the HTTPS URL**

### Step 3: Update GitHub Secret
- Same as Step 6 above, but use the trycloudflare.com URL

### Step 4: Keep Running
- Leave the terminal open with cloudflared running

**Note**: URL changes every restart. For permanent URL, you need a domain (see Option 3C in main guide).

---

## ✅ Done!

Your backend is now accessible via HTTPS from anywhere, **no domain needed**!

**Next**: Test login from any browser/device. No browser security workarounds needed!

---

**Last Updated**: November 3, 2025  
**Status**: Domain-free HTTPS solution

