# ✅ Tailscale URL Verification

## URL Provided

**Tailscale URL**: `https://crm-mini.tail34e202.ts.net/`

## Is This a Funnel URL?

This URL format suggests it might be:
1. **Tailscale MagicDNS** (only works on Tailscale network) - Won't work from browsers
2. **Tailscale Funnel** (publicly accessible) - Will work from browsers

## Testing

### Test 1: Health Check
```powershell
Invoke-WebRequest -Uri "https://crm-mini.tail34e202.ts.net/health" -UseBasicParsing
```

### Test 2: API Health Check
```powershell
Invoke-WebRequest -Uri "https://crm-mini.tail34e202.ts.net/api/health" -UseBasicParsing
```

## If URL Works

If the URL is accessible (returns 200 OK), then:

1. **Update GitHub Secret**:
   - Go to: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions
   - Edit `BACKEND_API_URL`
   - Set to: `https://crm-mini.tail34e202.ts.net`
   - **Note**: Remove trailing slash if present
   - Save

2. **Deploy Frontend**:
   ```powershell
   git commit --allow-empty -m "Use Tailscale URL for backend"
   git push origin main
   ```

3. **Test Login**:
   - Visit: https://bennyg83.github.io/pilzno_crm/
   - Try to login

## If URL Doesn't Work

If you get `ERR_NAME_NOT_RESOLVED`:
- This is Tailscale MagicDNS (not Funnel)
- Browsers can't resolve it
- Need to set up Tailscale Funnel instead

---

**Last Updated**: November 9, 2025  
**Status**: Testing Tailscale URL

