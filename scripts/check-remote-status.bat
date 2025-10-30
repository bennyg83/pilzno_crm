@echo off
REM Simple status check script for remote server
echo ========================================
echo   Pilzno CRM - Remote Status Check
echo ========================================
echo.

echo [INFO] Checking project directory...
cd C:\Users\cursors123\pilzno_crm
if not exist "package.json" (
    echo [ERROR] Project not found in expected location
    pause
    exit /b 1
)
echo [SUCCESS] Project found

echo.
echo [INFO] Checking backend build...
if exist "backend\dist\index.js" (
    echo [SUCCESS] Backend is built
) else (
    echo [WARNING] Backend needs to be built
)

echo.
echo [INFO] Checking frontend build...
if exist "frontend\dist" (
    echo [SUCCESS] Frontend is built
) else (
    echo [WARNING] Frontend needs to be built
)

echo.
echo [INFO] Checking Docker status...
docker --version
if %errorlevel% neq 0 (
    echo [ERROR] Docker not available
) else (
    echo [SUCCESS] Docker is available
)

echo.
echo [INFO] Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not available
) else (
    echo [SUCCESS] Node.js is available
)

echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo 1. To start backend: cd backend && npm start
echo 2. To start frontend: cd frontend && npm run dev
echo 3. To use Docker: Run Command Prompt as Administrator
echo    then: docker compose up -d
echo.
echo Project location: C:\Users\cursors123\pilzno_crm
echo Access URLs:
echo - Frontend: http://10.100.102.112:3003
echo - Backend: http://10.100.102.112:3001
echo.
pause

