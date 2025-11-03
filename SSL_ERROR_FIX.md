# 🔧 Fixing SSL Protocol Error

## Problem
You're seeing `net::ERR_SSL_PROTOCOL_ERROR` when trying to connect to the backend.

## Root Cause
The backend server is **HTTP-only**, but the GitHub secret `BACKEND_API_URL` is likely set to an HTTPS URL.

## ✅ Solution

### 1. Update GitHub Secret to Use HTTP

**Go to**: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions

**Update `BACKEND_API_URL` secret:**

**Current (WRONG - HTTPS doesn't work):**
```
https://crm-mini.tail34e202.ts.net:3002
```

**Correct (HTTP - Backend is HTTP-only):**
```
http://100.74.73.107:3002
```

### 2. Verify Backend is HTTP-Only

The backend runs on HTTP port 3002, not HTTPS. To verify:

```bash
# Test backend health check (HTTP)
curl http://100.74.73.107:3002/health

# Should return: {"status":"healthy",...}
```

### 3. Mixed Content Warning

**Note**: Using HTTP with GitHub Pages (HTTPS) will show a "Mixed Content" warning in the browser console. This is expected and the app will still work, but you'll see warnings like:

```
Mixed Content: The page at 'https://bennyg83.github.io/pilzno_crm/' was loaded over HTTPS, but requested an insecure resource 'http://100.74.73.107:3002/api/auth/login'. This request has been blocked; the content must be served over HTTPS.
```

**To Fix Mixed Content** (Optional - requires HTTPS on backend):
1. Set up HTTPS on the backend (requires SSL certificate)
2. Or use Tailscale HTTPS MagicDNS (requires Tailscale HTTPS setup)

**For now, HTTP works fine** - the Mixed Content warning is just a browser security notice.

### 4. After Updating Secret

1. **Trigger new deployment**:
   - Go to: https://github.com/bennyg83/pilzno_crm/actions
   - Click "Deploy Frontend to GitHub Pages"
   - Click "Run workflow" → "Run workflow"

2. **Wait for deployment** (2-3 minutes)

3. **Test login**:
   - Go to: https://bennyg83.github.io/pilzno_crm/
   - Email: `admin@pilzno.org`
   - Password: `pilzno2024`

## 🔍 Troubleshooting

### Still Seeing SSL Error?

1. **Check browser console** - should show requests going to `http://100.74.73.107:3002`
2. **Check Network tab** - verify URL is HTTP, not HTTPS
3. **Verify secret is set correctly** - should be `http://100.74.73.107:3002` (no `https://`)

### Mixed Content Blocked?

Some browsers may block Mixed Content. To allow:

**Chrome/Edge:**
1. Click the lock icon in address bar
2. Click "Site settings"
3. Allow "Insecure content"

**Or use browser flag** (for testing only):
- Chrome: `--disable-web-security` (not recommended for production)

**Better solution**: Set up HTTPS on backend (see below)

## 🔐 Setting Up HTTPS on Backend (Optional)

If you want to eliminate Mixed Content warnings:

1. **Use Tailscale HTTPS MagicDNS**:
   - Enable HTTPS in Tailscale admin console
   - Use: `https://crm-mini.tail34e202.ts.net:3002`
   - Requires Tailscale HTTPS certificate setup

2. **Or use a reverse proxy with SSL**:
   - Set up Nginx/Caddy with Let's Encrypt
   - Proxy HTTP backend to HTTPS frontend

**For now, HTTP is fine** - the app works with Mixed Content warnings.

---

**Last Updated**: November 2, 2025  
**Status**: Backend is HTTP-only, use HTTP URL in GitHub secret

