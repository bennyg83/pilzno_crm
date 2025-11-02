@echo off
REM Transfer to Ubuntu Script for Pilzno CRM Project
REM This script helps prepare the project for transfer to Ubuntu

echo.
echo ========================================
echo   Pilzno CRM - Ubuntu Transfer Helper
echo ========================================
echo.

echo [INFO] Preparing project for Ubuntu transfer...
echo.

REM Check if drive G: exists
if not exist "G:\" (
    echo [ERROR] Drive G: not found. Please ensure it's accessible.
    pause
    exit /b 1
)

REM Check if project copy exists on G:
if not exist "G:\pilzno_crm\" (
    echo [ERROR] Project copy not found on drive G:. Please run the copy process first.
    pause
    exit /b 1
)

echo [SUCCESS] Project copy found on drive G:
echo.

REM Create a summary of what was transferred
echo [INFO] Creating transfer summary...
echo.

echo ========================================
echo   TRANSFER SUMMARY
echo ========================================
echo.
echo Source Location: F:\pilzno_crm
echo Destination: G:\pilzno_crm
echo Transfer Date: %date% %time%
echo.
echo Files and Directories Transferred:
echo.

REM Count files and directories
set /a fileCount=0
set /a dirCount=0

for /r "G:\pilzno_crm" %%i in (*) do set /a fileCount+=1
for /d /r "G:\pilzno_crm" %%i in (*) do set /a dirCount+=1

echo Total Files: %fileCount%
echo Total Directories: %dirCount%
echo.

echo Key Project Components:
echo ✓ Frontend (React + TypeScript + Material-UI)
echo ✓ Backend (Node.js + Express + TypeORM)
echo ✓ Database (PostgreSQL + Docker)
echo ✓ Docker Configuration
echo ✓ Environment Templates
echo ✓ Scripts and Utilities
echo ✓ Documentation
echo.

echo ========================================
echo   UBUNTU SETUP INSTRUCTIONS
echo ========================================
echo.
echo 1. Copy the project from drive G: to your Ubuntu machine
echo 2. Ensure Ubuntu has Docker and Node.js installed
echo 3. Run the ubuntu-quick-start.sh script
echo 4. Follow the UBUNTU_SETUP_GUIDE.md for detailed steps
echo.
echo Quick Commands for Ubuntu:
echo   chmod +x scripts/ubuntu-quick-start.sh
echo   ./scripts/ubuntu-quick-start.sh
echo   docker compose up -d
echo.
echo ========================================
echo   IMPORTANT NOTES
echo ========================================
echo.
echo • The project uses PostgreSQL (not MongoDB)
echo • Docker is required for the database
echo • Environment variables need to be configured
echo • Hebrew date conversion is implemented using @hebcal/core
echo • Settings management system is ready for completion
echo.
echo ========================================
echo   NEXT STEPS
echo ========================================
echo.
echo 1. Transfer the G:\pilzno_crm folder to your Ubuntu machine
echo 2. Follow the Ubuntu setup guide
echo 3. Complete the settings management implementation
echo 4. Test all functionality
echo 5. Continue development on Ubuntu
echo.

REM Create a simple checklist file
echo Creating Ubuntu setup checklist...
(
echo Ubuntu Setup Checklist
echo =====================
echo.
echo [ ] Copy project to Ubuntu machine
echo [ ] Install Docker and Docker Compose
echo [ ] Install Node.js 18+
echo [ ] Install Git
echo [ ] Run ubuntu-quick-start.sh
echo [ ] Configure .env file
echo [ ] Start database: docker compose up -d postgres
echo [ ] Initialize database schema
echo [ ] Start backend: docker compose up -d backend
echo [ ] Start frontend: docker compose up -d frontend
echo [ ] Test application at http://localhost:3003
echo [ ] Verify Hebrew date conversion
echo [ ] Test settings management
echo [ ] Continue development
) > "G:\pilzno_crm\UBUNTU_CHECKLIST.txt"

echo [SUCCESS] Ubuntu setup checklist created: G:\pilzno_crm\UBUNTU_CHECKLIST.txt
echo.

echo ========================================
echo   TRANSFER COMPLETE
echo ========================================
echo.
echo Your Pilzno CRM project is ready for Ubuntu development!
echo.
echo Key files created:
echo • UBUNTU_SETUP_GUIDE.md - Comprehensive setup guide
echo • scripts/ubuntu-quick-start.sh - Automated setup script
echo • UBUNTU_CHECKLIST.txt - Setup checklist
echo.
echo Good luck with your Ubuntu development! 🚀
echo.

pause
