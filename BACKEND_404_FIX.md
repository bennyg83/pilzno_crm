# 🔧 Fixing Backend 404 Error

## Problem
You're seeing a **404 error** when trying to connect to the backend:
```
Failed to load resource: the server responded with a status of 404
http://100.74.73.107:3002/api/auth/login
```

## Possible Causes

1. **Backend not running** - The backend container might be stopped
2. **Backend not accessible via Tailscale** - Port might not be forwarded
3. **Wrong endpoint** - The route might not be configured correctly
4. **Backend crashed** - The container might have errors

## ✅ Solutions

### Step 1: Check if Backend is Running

```bash
# Check if backend container is running
docker ps --filter "name=pilzno-synagogue-backend"

# Check backend logs for errors
docker logs pilzno-synagogue-backend --tail 50

# Check backend health
curl http://localhost:3002/health
```

**Expected output:**
```json
{"status":"healthy","service":"Pilzno Synagogue Management System API","timestamp":"..."}
```

### Step 2: Verify Backend is Accessible via Tailscale

**Test from your local machine:**
```bash
# Test backend health check
curl http://100.74.73.107:3002/health

# Test login endpoint (should return method not allowed or 400, not 404)
curl -X POST http://100.74.73.107:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pilzno.org","password":"pilzno2024"}'
```

**If you get connection refused:**
- Backend might not be running
- Port 3002 might not be exposed on Tailscale
- Firewall might be blocking the port

### Step 3: Check Backend Logs

```bash
# View recent logs
docker logs pilzno-synagogue-backend --tail 100

# Follow logs in real-time
docker logs pilzno-synagogue-backend -f
```

**Look for:**
- ✅ `🚀 Pilzno Synagogue Management System API running on port 3001`
- ✅ `✅ Database connection established successfully`
- ❌ Any error messages
- ❌ `ECONNREFUSED` or database connection errors

### Step 4: Restart Backend if Needed

```bash
# Restart backend container
docker restart pilzno-synagogue-backend

# Or restart all services
docker-compose restart pilzno-synagogue-backend

# Or rebuild and restart
docker-compose up -d --build pilzno-synagogue-backend
```

### Step 5: Verify Port Mapping

The backend should be mapped as:
- **Container port**: 3001 (internal)
- **Host port**: 3002 (external)
- **Docker mapping**: `3002:3001`

**Check docker-compose.yml:**
```yaml
ports:
  - "${BACKEND_PORT:-3002}:3001"
```

**Verify with:**
```bash
docker port pilzno-synagogue-backend
# Should show: 0.0.0.0:3002->3001/tcp
```

### Step 6: Test Backend Endpoint Locally

**From your local machine (not GitHub Pages):**

```bash
# Test health endpoint
curl http://localhost:3002/health

# Test login endpoint
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pilzno.org","password":"pilzno2024"}'
```

**If localhost works but Tailscale doesn't:**
- Tailscale might not be forwarding port 3002
- Firewall might be blocking external access
- Backend might only be listening on localhost

### Step 7: Check Backend Route Configuration

The backend should have these routes:
- ✅ `/health` - Health check
- ✅ `/api/auth/login` - Login endpoint
- ✅ `/api/auth/register` - Registration endpoint

**Verify in `backend/src/index.ts`:**
```typescript
app.use('/api/auth', authRouter);
```

## 🔍 Troubleshooting

### Backend Container Not Running?

**Start it:**
```bash
docker-compose up -d pilzno-synagogue-backend
```

**Check why it stopped:**
```bash
docker logs pilzno-synagogue-backend --tail 100
```

### Port 3002 Not Accessible?

**Check if port is open:**
```bash
# Windows PowerShell
Test-NetConnection -ComputerName 100.74.73.107 -Port 3002

# Or check if backend is listening
netstat -an | findstr :3002
```

**Check Tailscale status:**
```bash
# Ensure Tailscale is connected
tailscale status

# Should show your device with IP 100.74.73.107
```

### Database Connection Errors?

**Check database is running:**
```bash
docker ps --filter "name=pilzno-synagogue-db"
```

**Check backend logs for database errors:**
```bash
docker logs pilzno-synagogue-backend | findstr -i "database\|error\|fail"
```

### CORS Errors?

**Check backend logs for CORS blocking:**
```bash
docker logs pilzno-synagogue-backend | findstr -i "cors\|blocked"
```

**Verify CORS origins include GitHub Pages:**
```typescript
const allowedOrigins = [
  'https://bennyg83.github.io',
  // ... other origins
];
```

## ✅ Verification Checklist

- [ ] Backend container is running (`docker ps`)
- [ ] Backend health check works locally (`curl http://localhost:3002/health`)
- [ ] Backend health check works via Tailscale (`curl http://100.74.73.107:3002/health`)
- [ ] Backend logs show no errors (`docker logs pilzno-synagogue-backend`)
- [ ] Port 3002 is accessible (`Test-NetConnection -ComputerName 100.74.73.107 -Port 3002`)
- [ ] Tailscale is connected (`tailscale status`)
- [ ] Database is running (`docker ps --filter "name=pilzno-synagogue-db"`)

## 🚀 Quick Fix Commands

**If backend is not running:**
```bash
cd "C:\Users\cursors123\Documents\Projects Shul\Projects Shul\Pilzno\pilzno_crm"
docker-compose up -d pilzno-synagogue-backend
```

**If backend needs restart:**
```bash
docker restart pilzno-synagogue-backend
```

**If backend needs rebuild:**
```bash
docker-compose up -d --build pilzno-synagogue-backend
```

**Check backend status:**
```bash
docker ps --filter "name=pilzno-synagogue-backend"
docker logs pilzno-synagogue-backend --tail 20
```

---

**Last Updated**: November 2, 2025  
**Status**: Backend 404 - Check if backend is running and accessible

