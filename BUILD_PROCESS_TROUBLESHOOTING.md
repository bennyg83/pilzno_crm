# Docker Build Process Troubleshooting Guide

## 🚨 CRITICAL: When Frontend Changes Don't Appear

### The Problem
You've made changes to React/TypeScript files, rebuilt the frontend, and restarted Docker containers, but the old code is still running in the browser.

### Root Cause
**Build Context Synchronization Issue**: Docker containers are serving stale/old builds even after rebuilds due to build context conflicts between running containers and the build process.

### Symptoms
- ✅ Source files updated (your changes are in the code)
- ✅ `npm run build` completes successfully
- ✅ Docker containers restart without errors
- ❌ Browser still shows old behavior
- ❌ Console logs show old code
- ❌ New features/fixes don't work

### The Solution: Clean Build Sequence

**NEVER build while containers are running. Always use this sequence:**

```bash
# 1. STOP all containers first
docker --context desktop-linux compose down

# 2. Build frontend in clean environment
cd frontend
npm run build

# 3. Rebuild and start containers with fresh build
cd ..
docker --context desktop-linux compose up -d --build
```

### Why This Works
- **Clean shutdown** removes container interference with build context
- **Isolated build** runs without Docker file system conflicts
- **Fresh container rebuild** ensures clean image with latest build files

### Alternative Solutions (if clean sequence doesn't work)

#### Option 1: Force Clean Rebuild
```bash
# Nuclear option - completely clean everything
docker --context desktop-linux compose down --volumes --remove-orphans
docker --context desktop-linux system prune -f
npm run build
docker --context desktop-linux compose up -d --build
```

#### Option 2: Verify Build Contents
```bash
# Check if build actually includes your changes
grep -n "YOUR_DISTINCTIVE_TEXT" dist/assets/*.js

# Check if container has the right files
docker --context desktop-linux compose exec pilzno-synagogue-frontend ls -la /usr/share/nginx/html/assets/
```

### Debugging Steps

#### Step 1: Verify Source Files
```bash
# Check if your changes are in source
grep -n "YOUR_CHANGE" src/**/*.tsx
```

#### Step 2: Verify Build Output
```bash
# Check if build includes your changes
grep -n "YOUR_CHANGE" dist/assets/*.js
```

#### Step 3: Verify Container Contents
```bash
# Check if container has the right build
docker --context desktop-linux compose exec pilzno-synagogue-frontend grep -n "YOUR_CHANGE" /usr/share/nginx/html/assets/*.js
```

#### Step 4: Check Build Timestamps
```bash
# Compare build timestamps
ls -la frontend/dist/assets/
docker --context desktop-linux compose exec pilzno-synagogue-frontend ls -la /usr/share/nginx/html/assets/
```

### Common Mistakes

❌ **Building while containers run** - Causes build context conflicts
❌ **Just restarting containers** - Doesn't rebuild images with new code
❌ **Assuming `npm run build` is enough** - Docker needs fresh images
❌ **Not checking container contents** - Container might have old build

✅ **Always stop containers first**
✅ **Always use `--build` flag**
✅ **Always verify build contents**
✅ **Always check container timestamps**

### When to Use This Guide

- Frontend changes not appearing after rebuild
- Console logs showing old code
- New features not working despite code changes
- "The changes are there but not working" scenarios
- Docker containers seem to ignore rebuilds

### Prevention

1. **Always use the clean build sequence** for any frontend changes
2. **Add distinctive console.log statements** to verify builds are working
3. **Check build timestamps** to ensure fresh builds
4. **Document any build process changes** in this file

### Example Debugging Session

```bash
# 1. User reports: "My changes aren't working after rebuild"
# 2. Check symptoms against this guide
# 3. Run clean build sequence
docker --context desktop-linux compose down
cd frontend && npm run build && cd ..
docker --context desktop-linux compose up -d --build
# 4. Verify in browser
# 5. If still broken, check build contents and container timestamps
```

---

**Remember**: When in doubt, use the clean build sequence. It's the most reliable way to ensure Docker serves your latest frontend code.
