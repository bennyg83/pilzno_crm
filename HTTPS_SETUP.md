# 🔒 HTTPS Setup for Tailscale Backend

## Current Configuration

**Tailscale MagicDNS**: `crm-mini.tail34e202.ts.net`  
**Tailscale IP**: `100.74.73.107`  
**Backend Port**: `3002`

## ✅ Configuration Updated

The frontend has been updated to use:
- **HTTPS URL**: `https://crm-mini.tail34e202.ts.net:3002` (fixes Mixed Content)
- **HTTP Fallback**: `http://100.74.73.107:3002` (if HTTPS unavailable)

## 📋 GitHub Secret Update

### Option 1: Use HTTPS (Recommended - Fixes Mixed Content)

Update GitHub secret `BACKEND_API_URL` to:
```
https://crm-mini.tail34e202.ts.net:3002
```

**Steps:**
1. Go to: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions
2. Edit `BACKEND_API_URL` secret
3. Update value to: `https://crm-mini.tail34e202.ts.net:3002`
4. Save

### Option 2: Use HTTP (Works but has Mixed Content warning)

If HTTPS doesn't work, use HTTP:
```
http://100.74.73.107:3002
```

## 🔧 Enabling Tailscale HTTPS

### Method 1: Tailscale MagicDNS (Automatic)

Tailscale MagicDNS should provide HTTPS automatically. However, you may need to:

1. **Enable MagicDNS** (if not already enabled):
   - Go to: https://login.tailscale.com/admin/dns
   - Enable MagicDNS for your network
   - Your domain: `crm-mini.tail34e202.ts.net`

2. **Get HTTPS Certificate**:
   ```bash
   # Tailscale should handle this automatically
   # If not, you may need to use Tailscale HTTPS certificate feature
   ```

### Method 2: Manual SSL Certificate

If Tailscale MagicDNS HTTPS doesn't work automatically:

1. **Generate Certificate** (using Let's Encrypt or Tailscale):
   ```bash
   # Option A: Use Tailscale's built-in HTTPS
   # Tailscale should provide this via MagicDNS
   
   # Option B: Use reverse proxy (nginx/Caddy) with Let's Encrypt
   ```

2. **Configure Backend for HTTPS**:
   - Update backend to accept HTTPS connections
   - Or use reverse proxy in front of backend

## 🧪 Testing HTTPS Connection

### Test from Local Machine

```bash
# Test HTTPS connection
curl -k https://crm-mini.tail34e202.ts.net:3002/health

# If certificate warning appears, that's normal - use -k flag to test
```

### Test from GitHub Pages

1. Deploy frontend with HTTPS URL
2. Visit: https://bennyg83.github.io/pilzno_crm/
3. Open DevTools → Network tab
4. Try to login
5. Check if requests go to `https://crm-mini.tail34e202.ts.net:3002`
6. No Mixed Content error should appear

## ⚠️ Troubleshooting

### Issue: HTTPS Certificate Error

**Symptoms:**
- Browser shows "Your connection is not private"
- Certificate warning

**Solutions:**
1. **Accept certificate** (if self-signed): Click "Advanced" → "Proceed"
2. **Use HTTP instead**: Switch GitHub secret to HTTP URL
3. **Get proper certificate**: Set up Let's Encrypt or Tailscale certificate

### Issue: HTTPS Connection Refused

**Symptoms:**
- Connection refused on HTTPS
- HTTP works but HTTPS doesn't

**Solutions:**
1. **Backend might not support HTTPS**: Use HTTP instead
2. **Port might be wrong**: Verify port 3002 is accessible
3. **Use reverse proxy**: Set up nginx/Caddy for HTTPS termination

### Issue: Mixed Content Still Appears

**Symptoms:**
- Still getting Mixed Content errors with HTTPS URL

**Solutions:**
1. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
2. **Verify URL in build**: Check GitHub Actions build logs for `VITE_API_BASE_URL`
3. **Check certificate**: Ensure Tailscale provides valid HTTPS certificate
4. **Fallback to HTTP**: Use HTTP and configure browser to allow Mixed Content (testing only)

## 📊 Current Status

- ✅ **Code Updated**: Frontend configured to use HTTPS URL
- ✅ **GitHub Actions Updated**: Defaults to HTTPS URL
- ⏳ **GitHub Secret**: Should be updated to HTTPS URL
- ⏳ **HTTPS Testing**: Need to verify Tailscale HTTPS works

## 🚀 Next Steps

1. **Update GitHub Secret**:
   - Go to GitHub Settings → Secrets → Actions
   - Update `BACKEND_API_URL` to `https://crm-mini.tail34e202.ts.net:3002`

2. **Deploy Frontend**:
   ```bash
   git push origin main
   ```

3. **Test HTTPS Connection**:
   ```bash
   curl -k https://crm-mini.tail34e202.ts.net:3002/health
   ```

4. **Test from GitHub Pages**:
   - Visit deployed site
   - Check browser console for Mixed Content errors
   - Try to login

---

**Last Updated**: November 2, 2025  
**Tailscale Domain**: crm-mini.tail34e202.ts.net  
**Backend Port**: 3002

