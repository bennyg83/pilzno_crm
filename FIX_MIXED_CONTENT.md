# 🔧 Fix Mixed Content Error

## 🚨 Problem

The deployed GitHub Pages frontend is showing:
- **Mixed Content Error**: HTTPS page trying to connect to HTTP backend
- **Wrong Backend URL**: `http://46.116.147.64:3000` (old/dead IP)
- **Correct Backend URL**: `http://100.74.73.107:3002` (your Tailscale IP)

## ✅ Solution

### Issue 1: Frontend Using Wrong Backend URL

The frontend build didn't use the GitHub secret. The fallback in `backend-config.ts` now uses the correct Tailscale IP.

**Fix Applied:**
- Updated `frontend/src/config/backend-config.ts` to use `http://100.74.73.107:3002` as fallback
- This ensures even if GitHub Actions secret isn't used, it will use the correct IP

### Issue 2: Mixed Content (HTTPS → HTTP)

**Browsers block HTTPS pages from making HTTP requests for security.**

**Options:**

#### Option A: Use HTTP Frontend (Quick Fix)
- **Not Recommended**: Less secure

#### Option B: Enable Tailscale HTTPS (Recommended)
1. **Enable Tailscale HTTPS** on your machine:
   ```bash
   # Tailscale MagicDNS with HTTPS
   tailscale cert --domain your-machine-name.tailscale.ts.net
   ```

2. **Update backend to use HTTPS**:
   - Configure backend with SSL certificate
   - Update GitHub secret to use `https://your-machine.tailscale.ts.net:3002`

#### Option C: Use HTTPS Proxy (Best for Production)
- Use a service like Cloudflare Tunnel, ngrok with HTTPS, or Tailscale HTTPS
- Proxy HTTP backend through HTTPS endpoint

#### Option D: Disable Mixed Content Blocking (Temporary Testing Only)
- **Only for testing**: Not recommended for production
- Browsers: Chrome flags → `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
- Add your backend URL to the exception list

## 🚀 Quick Fix (Deploy Updated Frontend)

The code has been updated. Now redeploy:

```bash
git add .
git commit -m "Fix: Update backend URL to Tailscale IP for GitHub Pages"
git push origin main
```

**This will:**
1. Build frontend with correct Tailscale IP (`100.74.73.107:3002`)
2. Deploy to GitHub Pages
3. Frontend will try to connect (may still have Mixed Content warning)

## 📋 Next Steps

### Step 1: Redeploy Frontend
```bash
git add frontend/src/config/backend-config.ts
git commit -m "Fix: Use Tailscale IP as fallback for GitHub Pages"
git push origin main
```

### Step 2: Test Connection
After deployment:
1. Visit: https://bennyg83.github.io/pilzno_crm/
2. Open DevTools → Console
3. Check if URL is now `http://100.74.73.107:3002`
4. If Mixed Content error persists, proceed to Step 3

### Step 3: Enable Tailscale HTTPS (Recommended)

**On Windows with Tailscale:**

1. **Enable Tailscale HTTPS:**
   - Tailscale admin console: https://login.tailscale.com/admin/machines
   - Enable HTTPS for your machine

2. **Or use Tailscale MagicDNS:**
   ```bash
   # Get your Tailscale domain
   tailscale status
   
   # Enable HTTPS certificate
   # This is usually automatic with MagicDNS
   ```

3. **Update Backend URL to HTTPS:**
   - Update GitHub secret `BACKEND_API_URL` to use HTTPS URL
   - Or update `backend-config.ts` to use HTTPS

## 🔍 Verify GitHub Secret

Check that the secret is set correctly:
1. Go to: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions
2. Verify `BACKEND_API_URL` = `http://100.74.73.107:3002`
3. If not set, add it now

## ⚠️ Temporary Workaround

If you need to test immediately:

**Chrome:**
1. Visit: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
2. Add: `http://100.74.73.107:3002`
3. Enable and restart Chrome
4. **WARNING**: Only for testing! Disable after testing.

**Firefox:**
1. Visit: `about:config`
2. Set: `security.mixed_content.block_active_content` to `false`
3. **WARNING**: Only for testing! Re-enable after testing.

## 📝 Summary

**Current Status:**
- ✅ Backend URL updated to Tailscale IP in code
- ⏳ Need to redeploy frontend
- ⏳ Mixed Content issue needs HTTPS solution

**Next Actions:**
1. Commit and push the fix
2. Test with updated frontend
3. If Mixed Content persists, enable Tailscale HTTPS

---

**Last Updated**: November 2, 2025  
**Backend IP**: 100.74.73.107:3002  
**Issue**: Mixed Content (HTTPS → HTTP)

