# 🔧 Fixing Mixed Content and 404 Errors

## Problem
You're seeing:
- **Mixed Content warning**: HTTPS frontend trying to connect to HTTP backend
- **404 error**: Requests failing even though backend is running

## Root Cause
Modern browsers **block Mixed Content** by default. When GitHub Pages (HTTPS) tries to connect to your HTTP backend, the browser blocks the request, which can appear as a 404 error.

## ✅ Solutions

### Solution 1: Allow Mixed Content in Browser (Quick Fix - Testing Only)

**Chrome/Edge:**
1. Click the **lock icon** in the address bar
2. Click **"Site settings"**
3. Find **"Insecure content"**
4. Change from **"Block (default)"** to **"Allow"**
5. Refresh the page

**Firefox:**
1. Click the **lock icon** in the address bar
2. Click **"Connection"** tab
3. Click **"Disable protection for this page"**
4. Refresh the page

**⚠️ Warning**: This is only for testing. For production, you should use HTTPS.

### Solution 2: Set Up HTTPS on Backend (Recommended)

**Option A: Use Tailscale HTTPS MagicDNS**

1. **Enable HTTPS in Tailscale:**
   - Go to Tailscale admin console
   - Enable HTTPS for your device
   - Use MagicDNS: `https://crm-mini.tail34e202.ts.net:3002`

2. **Update GitHub Secret:**
   - Go to: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions
   - Update `BACKEND_API_URL` to: `https://crm-mini.tail34e202.ts.net:3002`
   - **Note**: Requires HTTPS to be enabled on Tailscale

**Option B: Use Reverse Proxy with SSL**

1. **Set up Nginx/Caddy with Let's Encrypt:**
   - Install reverse proxy (Nginx or Caddy)
   - Configure SSL certificate (Let's Encrypt)
   - Proxy HTTP backend to HTTPS frontend

2. **Update GitHub Secret:**
   - Use HTTPS URL: `https://your-domain.com/api`
   - Backend stays on HTTP internally

### Solution 3: Use HTTP for Both (Development Only)

**Not recommended for production**, but works for development:

1. **Deploy frontend to HTTP instead of HTTPS:**
   - Use a different hosting service (not GitHub Pages)
   - Or use local development server

2. **Both frontend and backend use HTTP:**
   - No Mixed Content issues
   - Less secure

## 🔍 Verification

### Check if Backend is Accessible

**From your local machine:**
```powershell
# Test health check
Invoke-WebRequest -Uri "http://100.74.73.107:3002/health" -UseBasicParsing

# Test login endpoint
$body = @{
    email = "admin@pilzno.org"
    password = "pilzno2024"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://100.74.73.107:3002/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -UseBasicParsing
```

**Expected output:**
- Health check: `{"status":"healthy",...}`
- Login: `{"message":"Login successful",...}`

### Check Browser Console

**After allowing Mixed Content:**
- Should see: `✅ Login successful`
- Should NOT see: Mixed Content warnings
- Should NOT see: 404 errors

### Check Backend Logs

```powershell
# View recent logs
docker logs pilzno-synagogue-backend --tail 50

# Look for:
# ✅ "REQUEST RECEIVED: POST /api/auth/login"
# ✅ "Login successful"
# ❌ "CORS blocked origin"
```

## 🚀 Quick Fix (Testing)

**For immediate testing:**

1. **Allow Mixed Content in Chrome:**
   - Click lock icon → Site settings → Allow insecure content
   - Refresh page
   - Try login again

2. **Verify backend is accessible:**
   ```powershell
   Invoke-WebRequest -Uri "http://100.74.73.107:3002/health" -UseBasicParsing
   ```

3. **Check browser console:**
   - Should show successful login
   - Should NOT show 404 errors

## 📝 Next Steps

**For production:**
1. Set up HTTPS on backend (recommended)
2. Use Tailscale HTTPS MagicDNS
3. Or use reverse proxy with SSL

**For development:**
1. Allow Mixed Content in browser (testing only)
2. Or use local development server

---

**Last Updated**: November 2, 2025  
**Status**: Mixed Content blocking HTTP requests from HTTPS frontend

