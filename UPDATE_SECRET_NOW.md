# ⚠️ URGENT: Update GitHub Secret NOW

## Problem
The frontend is still trying to connect to HTTPS, but your backend is HTTP-only.

## Immediate Action Required

### Step 1: Update GitHub Secret

**Go to**: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions

1. Click on **`BACKEND_API_URL`** secret
2. **Update the value to:**
   ```
   http://100.74.73.107:3002
   ```
   **IMPORTANT**: 
   - Must start with `http://` (NOT `https://`)
   - Must be exactly: `http://100.74.73.107:3002`
   - No trailing slash
   - No extra spaces

3. Click **"Update secret"**

### Step 2: Trigger New Deployment

**Option A: Automatic (Recommended)**
- The workflow will automatically trigger on the next push
- Or wait for the next code push

**Option B: Manual Trigger**
1. Go to: https://github.com/bennyg83/pilzno_crm/actions
2. Click **"Deploy Frontend to GitHub Pages"**
3. Click **"Run workflow"** → **"Run workflow"**

### Step 3: Wait for Deployment

- Deployment takes 2-3 minutes
- Watch the Actions tab for progress
- Look for green checkmark when done

### Step 4: Test Login

1. Go to: https://bennyg83.github.io/pilzno_crm/
2. Clear browser cache (Ctrl+Shift+Delete)
3. Hard refresh (Ctrl+F5)
4. Try login:
   - Email: `admin@pilzno.org`
   - Password: `pilzno2024`

## Verification

### Check Secret is Correct

**Current Secret Value Should Be:**
```
http://100.74.73.107:3002
```

**NOT:**
- ❌ `https://crm-mini.tail34e202.ts.net:3002` (HTTPS doesn't work)
- ❌ `http://crm-mini.tail34e202.ts.net:3002` (DNS might not work)
- ❌ `100.74.73.107:3002` (missing protocol)
- ❌ `http://100.74.73.107:3002/` (trailing slash)

### Check Deployment Logs

1. Go to: https://github.com/bennyg83/pilzno_crm/actions
2. Click on the latest workflow run
3. Click on "Build frontend for GitHub Pages"
4. Look for `VITE_API_BASE_URL` in the logs
5. Should show: `http://100.74.73.107:3002`

### Check Browser Console

After deployment, open browser console:
- Should see: `🔧 ApiService: Initializing with base URL: http://100.74.73.107:3002/api`
- Should NOT see: SSL errors
- Should NOT see: `crm-mini.tail34e202.ts.net` (old HTTPS URL)

## Troubleshooting

### Still Seeing SSL Error?

1. **Secret might not be updated** - Verify it's set to HTTP
2. **Old deployment cached** - Clear browser cache and hard refresh
3. **Workflow didn't run** - Manually trigger the workflow

### Still Seeing Wrong URL?

1. Check browser console for the actual URL being used
2. Verify the secret value is exactly `http://100.74.73.107:3002`
3. Check GitHub Actions logs to see what URL was used during build

### Mixed Content Warning?

This is expected when using HTTP backend with HTTPS frontend. The app will still work, but you'll see warnings in the console. To fix:
- Set up HTTPS on backend (see `SSL_ERROR_FIX.md`)
- Or ignore the warnings (app still works)

---

**Last Updated**: November 2, 2025  
**Status**: ⚠️ ACTION REQUIRED - Update GitHub secret to HTTP

