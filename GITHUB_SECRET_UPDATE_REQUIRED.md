# ⚠️ GitHub Secret Update Required

## Current Issue

The GitHub Pages frontend is trying to connect to:
```
https://crm-mini.tail34e202.ts.net/api
```

But getting: `ERR_NAME_NOT_RESOLVED`

## Root Cause

The GitHub secret `BACKEND_API_URL` may be set incorrectly, or the frontend needs to be redeployed after fixing Tailscale login.

## Solution

### Step 1: Verify Tailscale Funnel is Running

✅ **Status**: Tailscale Funnel is ACTIVE
- **URL**: `https://crm-mini.tail34e202.ts.net`
- **Proxying to**: `http://127.0.0.1:3002`

### Step 2: Update GitHub Secret

1. **Go to**: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions

2. **Check/Edit** `BACKEND_API_URL` secret:
   - **Should be**: `https://crm-mini.tail34e202.ts.net`
   - **Important**: Use `https://` (Tailscale Funnel provides HTTPS)
   - **Important**: No trailing slash
   - **Important**: No port number

3. **Save** the secret

### Step 3: Redeploy Frontend

After updating the secret, trigger a new deployment:

**Option A: Empty commit (recommended)**
```powershell
cd "C:\Users\cursors123\Documents\Projects Shul\Projects Shul\Pilzno\pilzno_crm"
git commit --allow-empty -m "Redeploy with Tailscale Funnel backend URL"
git push origin main
```

**Option B: Manual trigger**
1. Go to: https://github.com/bennyg83/pilzno_crm/actions
2. Click "Deploy Frontend to GitHub Pages"
3. Click "Run workflow" → "Run workflow"

### Step 4: Wait and Test

1. **Wait 2-3 minutes** for deployment to complete
2. **Visit**: https://bennyg83.github.io/pilzno_crm/
3. **Try to login**:
   - Email: `admin@pilzno.org`
   - Password: `pilzno2024`

## Verification

After deployment, check the browser console. You should see:
```
🔧 ApiService: Initializing with base URL: https://crm-mini.tail34e202.ts.net/api
```

Instead of the error, you should see successful API calls.

## Current Configuration

- **Tailscale Funnel URL**: `https://crm-mini.tail34e202.ts.net`
- **Backend Port**: `3002` (proxied by Funnel)
- **Status**: ✅ Active and running

---

**Last Updated**: December 16, 2024  
**Status**: Tailscale Funnel active - update GitHub secret and redeploy

