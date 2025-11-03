# 🔐 GitHub Secret Setup - REQUIRED

## ⚠️ Build Will Fail Without This Secret

The frontend build **requires** the `BACKEND_API_URL` secret to be set, otherwise the build will fail.

## 📋 Step-by-Step Instructions

### Step 1: Go to GitHub Secrets

1. Navigate to: https://github.com/bennyg83/pilzno_crm
2. Click **Settings** (top right of repository)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**

### Step 2: Add BACKEND_API_URL Secret

**Name:**
```
BACKEND_API_URL
```

**Value (choose one):**

**Option A: HTTPS (Recommended - Fixes Mixed Content)**
```
https://crm-mini.tail34e202.ts.net:3002
```

**Option B: HTTP (Works but shows Mixed Content warning)**
```
http://100.74.73.107:3002
```

5. Click **Add secret**

### Step 3: Verify Secret is Set

You should see:
- ✅ `BACKEND_API_URL` in the list of secrets
- ✅ Value shows as `••••••••` (hidden)

### Step 4: Trigger New Build

The workflow will automatically trigger on the next push to `main`, or you can:

1. Go to: https://github.com/bennyg83/pilzno_crm/actions
2. Click **Deploy Frontend to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow** (manual trigger)

## ✅ Verification

After setting the secret, check:

1. **GitHub Actions**: https://github.com/bennyg83/pilzno_crm/actions
   - Should show a new workflow run
   - Build should succeed with the secret

2. **Build Logs**: Click on the workflow run
   - Look for `VITE_API_BASE_URL` in the build step
   - Should show your Tailscale URL (hidden)

3. **Deployment**: After build succeeds
   - Frontend will deploy to GitHub Pages
   - Should be accessible at: https://bennyg83.github.io/pilzno_crm/

## 🔍 Troubleshooting

### Build Still Fails

**Check:**
1. Secret name is exactly: `BACKEND_API_URL` (case-sensitive)
2. Secret value is correct (no extra spaces)
3. Secret is set in the correct repository

**Try:**
1. Delete and recreate the secret
2. Verify the secret name matches exactly
3. Check GitHub Actions logs for error messages

### Can't Find Secrets Section

**Check:**
1. You have admin/write access to the repository
2. You're logged into GitHub
3. You're on the correct repository

**If you don't have access:**
- Ask the repository owner to set the secret
- Or get admin access to the repository

## 📝 Quick Reference

**Secret Name**: `BACKEND_API_URL`  
**Secret Value**: `https://crm-mini.tail34e202.ts.net:3002` (HTTPS) or `http://100.74.73.107:3002` (HTTP)

**GitHub URL**: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions

---

**Last Updated**: November 2, 2025  
**Status**: Secret must be set for build to succeed

