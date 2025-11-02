@echo off
REM Pilzno Synagogue CRM - Automated Database Backup Script (Windows)
REM This script creates automated database backups for Windows systems
REM Run this script periodically (via Task Scheduler) to prevent data loss

setlocal enabledelayedexpansion

echo [INFO] Starting automated database backup...
echo.

REM Configuration
set SCRIPT_DIR=%~dp0
set PROJECT_DIR=%SCRIPT_DIR%..
set BACKUP_DIR=%PROJECT_DIR%\backups\database
set TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=database_backup_%TIMESTAMP%.sql
set BACKUP_PATH=%BACKUP_DIR%\%BACKUP_FILE%

REM Ensure backup directory exists
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo [INFO] Backup file: %BACKUP_PATH%

REM Check if database container is running
docker ps --format "{{.Names}}" | findstr /C:"pilzno-synagogue-db" >nul
if errorlevel 1 (
    echo [ERROR] Database container 'pilzno-synagogue-db' is not running!
    echo [INFO] Attempting to start containers...
    cd /d "%PROJECT_DIR%"
    docker-compose up -d pilzno-synagogue-db
    timeout /t 10 /nobreak >nul
)

REM Wait for database to be ready
echo [INFO] Waiting for database to be ready...
set MAX_ATTEMPTS=30
set ATTEMPT=0

:wait_loop
docker exec pilzno-synagogue-db pg_isready -U synagogue_admin -d pilzno_synagogue >nul 2>&1
if not errorlevel 1 (
    echo [SUCCESS] Database is ready
    goto backup
)
set /a ATTEMPT+=1
if !ATTEMPT! geq %MAX_ATTEMPTS% (
    echo [ERROR] Database is not ready after %MAX_ATTEMPTS% attempts
    exit /b 1
)
timeout /t 1 /nobreak >nul
goto wait_loop

:backup
REM Create database backup
echo [INFO] Creating database backup...
docker exec pilzno-synagogue-db pg_dump -U synagogue_admin -d pilzno_synagogue > "%BACKUP_PATH%"
if errorlevel 1 (
    echo [ERROR] Failed to create database backup
    exit /b 1
)

echo [SUCCESS] Database backup created successfully

REM Keep only last 30 backups
echo [INFO] Cleaning up old backups (keeping last 30)...
cd /d "%BACKUP_DIR%"
for /f "skip=30 delims=" %%f in ('dir /b /o-d database_backup_*.sql 2^>nul') do del "%%f"

REM Create latest backup copy for easy access
if exist "%BACKUP_PATH%" (
    copy /y "%BACKUP_PATH%" "%BACKUP_DIR%\database_backup_latest.sql" >nul
    echo [SUCCESS] Latest backup copy created
)

echo [SUCCESS] Automated backup completed successfully!
echo [INFO] Backup location: %BACKUP_PATH%

endlocal

