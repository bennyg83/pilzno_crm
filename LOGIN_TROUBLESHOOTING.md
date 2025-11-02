# 🔐 Login Troubleshooting Guide

## Current Status

**Database Users**: 1 user found
- **Email**: `admin@pilzno.org`

## ✅ What's Working

1. **Backend**: ✅ Running and accessible via Tailscale
2. **CORS**: ✅ Configured for GitHub Pages origin
3. **Database**: ✅ Connected with 1 user
4. **Login Endpoint**: ✅ Receiving requests

## 🔍 Common Login Issues

### Issue 1: "Invalid credentials"

**Symptoms:**
- Login form shows "Invalid email or password"
- Backend logs show: `❌ User not found or not active` or `❌ Password verification failed`

**Solutions:**

1. **Check if user exists:**
   ```bash
   docker exec pilzno-synagogue-db psql -U synagogue_admin -d pilzno_synagogue -t -c "SELECT email FROM users;"
   ```

2. **Reset password (if needed):**
   - Use the backend API to create/reset user
   - Or check existing password in database

3. **Verify user is active:**
   ```bash
   docker exec pilzno-synagogue-db psql -U synagogue_admin -d pilzno_synagogue -c "SELECT email, \"isActive\" FROM users;"
   ```

### Issue 2: CORS Errors

**Symptoms:**
- Browser console shows: `Access to XMLHttpRequest has been blocked by CORS policy`
- Network tab shows: `CORS error` or `OPTIONS request failed`

**Solutions:**

1. **Check backend logs for blocked origins:**
   ```bash
   docker logs pilzno-synagogue-backend | Select-String "CORS blocked"
   ```

2. **Verify CORS configuration:**
   - Backend `index.ts` should include `https://bennyg83.github.io` in allowed origins
   - ✅ Already configured

3. **Restart backend after CORS changes:**
   ```bash
   docker-compose restart pilzno-synagogue-backend
   ```

### Issue 3: Network/Connection Errors

**Symptoms:**
- Browser console shows: `Network Error` or `Failed to fetch`
- Network tab shows: `ERR_CONNECTION_REFUSED` or timeout

**Solutions:**

1. **Check backend is running:**
   ```bash
   docker ps | findstr pilzno-synagogue-backend
   ```

2. **Test backend accessibility:**
   ```bash
   curl http://100.74.73.107:3002/health
   ```

3. **Check Tailscale is connected:**
   ```bash
   tailscale status
   ```

4. **Verify GitHub secret:**
   - Go to: https://github.com/bennyg83/pilzno_crm/settings/secrets/actions
   - Check `BACKEND_API_URL` = `http://100.74.73.107:3002`

### Issue 4: Frontend Not Using Correct Backend URL

**Symptoms:**
- Network tab shows requests going to `localhost:3002` instead of Tailscale IP
- Console shows: `⚠️ GitHub Pages detected but no VITE_API_BASE_URL`

**Solutions:**

1. **Check GitHub Actions build logs:**
   - Go to: https://github.com/bennyg83/pilzno_crm/actions
   - Check if `VITE_API_BASE_URL` was set during build

2. **Verify secret is set:**
   - GitHub Settings → Secrets → Actions → `BACKEND_API_URL`
   - Should be: `http://100.74.73.107:3002`

3. **Rebuild and redeploy:**
   ```bash
   git commit --allow-empty -m "Trigger rebuild with Tailscale URL"
   git push origin main
   ```

## 🔧 Debugging Steps

### Step 1: Check Browser Console

1. Open GitHub Pages: https://bennyg83.github.io/pilzno_crm/
2. Open DevTools (F12) → Console tab
3. Try to login
4. Check for:
   - CORS errors
   - Network errors
   - Authentication errors
   - Console logs: `🔐 Attempting login`, `✅ Login successful`, or `❌ Login failed`

### Step 2: Check Network Tab

1. Open DevTools → Network tab
2. Try to login
3. Look for:
   - Request to: `http://100.74.73.107:3002/api/auth/login`
   - Status: 200 (success) or 401/403/500 (error)
   - Response body: Check error message

### Step 3: Check Backend Logs

```bash
docker logs pilzno-synagogue-backend --tail 50 | Select-String "login|Login|CORS"
```

Look for:
- `🔐 Login attempt:`
- `❌ User not found`
- `❌ Password verification failed`
- `✅ Password verified successfully`
- `🚫 CORS blocked origin:`

### Step 4: Test Login Directly

```powershell
$headers = @{
    'Content-Type' = 'application/json'
    'Origin' = 'https://bennyg83.github.io'
}
$body = @{
    email = 'admin@pilzno.org'
    password = 'your_password_here'
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://100.74.73.107:3002/api/auth/login" -Method POST -Headers $headers -Body $body -UseBasicParsing
    $response.Content
} catch {
    $_.Exception.Response.StatusCode
    $_.ErrorDetails.Message
}
```

## 🎯 Quick Fixes

### Fix 1: Update CORS Headers (Already Done ✅)

CORS configuration has been updated to include:
- `X-Requested-With` header
- `PATCH` method
- `Authorization` exposed header

**Restart backend:**
```bash
docker-compose restart pilzno-synagogue-backend
```

### Fix 2: Create/Reset User Password

If you don't know the password, you can:
1. Create a new user via the register endpoint
2. Or reset the existing user's password in the database

### Fix 3: Verify Frontend Build

If the frontend isn't using the Tailscale URL:
1. Check GitHub Actions build used the secret
2. Rebuild and redeploy if needed

## 📋 Checklist

Before reporting login issues, verify:

- [ ] Backend is running: `docker ps | findstr backend`
- [ ] Tailscale is connected: `tailscale status`
- [ ] Backend is accessible: `curl http://100.74.73.107:3002/health`
- [ ] Users exist in database: `docker exec ... psql -c "SELECT COUNT(*) FROM users;"`
- [ ] CORS allows GitHub Pages: Check backend logs for blocked origins
- [ ] GitHub secret is set: `BACKEND_API_URL` = `http://100.74.73.107:3002`
- [ ] Frontend was built with secret: Check GitHub Actions build logs
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows requests going to Tailscale IP (not localhost)

## 📞 Need Help?

If login still doesn't work after these checks:

1. **Check browser console** for specific error messages
2. **Check network tab** for request/response details
3. **Check backend logs** for authentication/CORS issues
4. **Share error messages** for specific troubleshooting

---

**Last Updated**: November 2, 2025  
**User Email**: admin@pilzno.org  
**Backend URL**: http://100.74.73.107:3002

