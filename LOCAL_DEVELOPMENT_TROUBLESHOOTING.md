# 🔧 Local Development Troubleshooting Guide

## Common Issues When Running Locally

### 1. Browser Extension Errors (Harmless)

**Error:**
```
background-redux-new.js:1 Uncaught (in promise) Error: Cannot access contents of the page. Extension manifest must request permission to access the respective host.
```

**Solution:** 
These errors are from browser extensions (like Redux DevTools) trying to inject into the page. They are **completely harmless** and can be ignored. They don't affect your application.

**To suppress:** Disable the Redux DevTools extension or ignore the console errors.

---

### 2. "Not authenticated, redirecting to login"

**Error:**
```
❌ PrivateRoute: Not authenticated, redirecting to login
```

**This is expected behavior** if:
- You haven't logged in yet
- Your session expired
- The backend is not running

**Solution:**

#### Step 1: Ensure Backend is Running

Check if the backend is accessible:

```powershell
# Test backend health endpoint
curl http://localhost:3002/health

# Or in browser, visit:
# http://localhost:3002/health
```

If the backend is not running, start it:

```powershell
cd "C:\Users\cursors123\Documents\Projects Shul\Projects Shul\Pilzno\pilzno_crm"

# Start all services (database + backend)
docker-compose up -d

# Or start just the backend (if database is already running)
docker-compose up -d backend
```

#### Step 2: Check Backend Logs

```powershell
docker-compose logs backend
```

Look for:
- ✅ `Server running on port 3002`
- ✅ `Database connected successfully`
- ❌ Any error messages

#### Step 3: Log In

1. Navigate to the login page (should redirect automatically)
2. Use your admin credentials:
   - **Email**: `admin@pilzno.org`
   - **Password**: Check your environment variables or reset it

#### Step 4: Check Console Logs

Open browser DevTools (F12) and check the Console tab. You should see:

```
🔍 AuthContext: Initializing authentication state...
ℹ️ No stored token found, user needs to log in
✅ AuthContext: Initialization complete
```

If you see token verification errors:
```
❌ Token verification failed: ...
```

This means:
- Backend is not accessible at `http://localhost:3002`
- Backend is running but not responding
- Network/CORS issue

---

### 3. Backend Not Accessible

**Symptoms:**
- Frontend shows "Not authenticated"
- Console shows connection errors
- `http://localhost:3002/health` doesn't respond

**Check:**

1. **Is Docker running?**
   ```powershell
   docker ps
   ```
   Should show `pilzno-synagogue-backend` container

2. **Is the backend container running?**
   ```powershell
   docker-compose ps
   ```
   Status should be "Up", not "Exited"

3. **Check backend logs:**
   ```powershell
   docker-compose logs backend
   ```

4. **Check port conflicts:**
   ```powershell
   netstat -ano | findstr :3002
   ```
   Should show the Docker container using port 3002

5. **Restart backend:**
   ```powershell
   docker-compose restart backend
   ```

---

### 4. Frontend Configuration

**Check API Base URL:**

The frontend should use `http://localhost:3002` for local development.

Check console for:
```
🔧 ApiService: Initializing with base URL: http://localhost:3002/api
```

If you see a different URL (like a Tailscale URL), check:
- `.env` file in `frontend/` directory
- Environment variables
- `frontend/src/config/backend-config.ts` logic

**For local development, ensure:**
- No `VITE_API_BASE_URL` environment variable is set (or it's set to `http://localhost:3002`)
- You're not accessing via `bennyg83.github.io` (that's for production)

---

### 5. Database Connection Issues

**Symptoms:**
- Backend logs show database connection errors
- Backend starts but can't verify tokens

**Check:**

1. **Is database running?**
   ```powershell
   docker-compose ps
   ```
   Should show `pilzno-synagogue-db` container

2. **Check database logs:**
   ```powershell
   docker-compose logs db
   ```

3. **Test database connection:**
   ```powershell
   docker-compose exec db psql -U postgres -d pilzno_synagogue -c "SELECT 1;"
   ```

4. **Restart database:**
   ```powershell
   docker-compose restart db
   ```

---

### 6. Authentication Flow Debugging

**Enhanced Logging:**

The code now includes detailed console logging. Check your browser console for:

```
🔍 AuthContext: Initializing authentication state...
🔑 Found stored token, verifying with backend...
✅ Token verified successfully: { userId: '...', email: '...' }
✅ AuthContext: Initialization complete
🛡️ PrivateRoute check: { isAuthenticated: true, isLoading: false, ... }
✅ PrivateRoute: Authenticated, rendering children
```

**If token verification fails:**
```
❌ Token verification failed: ...
   Error details: { message: '...', status: 401, url: '...' }
🧹 Clearing invalid token from localStorage
```

This means:
- Token expired
- Backend rejected the token
- Backend is not accessible

**Solution:** Log in again to get a new token.

---

## Quick Checklist

Before reporting issues, verify:

- [ ] Docker Desktop is running
- [ ] Backend container is running (`docker-compose ps`)
- [ ] Backend is accessible (`curl http://localhost:3002/health`)
- [ ] Database container is running
- [ ] Frontend is using `http://localhost:3002` (check console)
- [ ] You're accessing frontend at `http://localhost:3003` (not GitHub Pages)
- [ ] Browser console shows no critical errors (extension errors are OK)
- [ ] You've logged in with valid credentials

---

## Still Having Issues?

1. **Check all logs:**
   ```powershell
   docker-compose logs
   ```

2. **Restart everything:**
   ```powershell
   docker-compose down
   docker-compose up -d
   ```

3. **Check environment variables:**
   ```powershell
   # Backend .env
   cat backend/.env
   
   # Frontend .env (if exists)
   cat frontend/.env
   ```

4. **Verify network:**
   ```powershell
   # Test backend
   curl http://localhost:3002/health
   
   # Test database
   docker-compose exec db pg_isready -U postgres
   ```

---

## Development vs Production

**Local Development:**
- Frontend: `http://localhost:3003`
- Backend: `http://localhost:3002`
- Database: `localhost:5435`

**Production (GitHub Pages):**
- Frontend: `https://bennyg83.github.io/pilzno_crm`
- Backend: Tailscale Funnel or DuckDNS
- Database: Production database

**Make sure you're using the correct URLs for your environment!**

