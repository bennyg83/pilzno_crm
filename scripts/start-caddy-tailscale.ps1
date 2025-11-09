# Start Caddy for Pilzno CRM Backend HTTPS (Tailscale)
# This script starts Caddy to provide HTTPS for the Tailscale backend

$caddyPath = "C:\caddy\caddy.exe"
$caddyfilePath = "C:\caddy\Caddyfile"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Pilzno CRM - Start Caddy HTTPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Caddy exists
if (-not (Test-Path $caddyPath)) {
    Write-Host "ERROR: Caddy not found at $caddyPath" -ForegroundColor Red
    Write-Host "Please install Caddy first. See TAILSCALE_HTTPS_SETUP.md" -ForegroundColor Yellow
    exit 1
}

# Check if Caddyfile exists
if (-not (Test-Path $caddyfilePath)) {
    Write-Host "ERROR: Caddyfile not found at $caddyfilePath" -ForegroundColor Red
    Write-Host "Please create Caddyfile. See TAILSCALE_HTTPS_SETUP.md" -ForegroundColor Yellow
    exit 1
}

# Check if backend is running
Write-Host "Checking backend status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✓ Backend is running on port 3002" -ForegroundColor Green
} catch {
    Write-Host "⚠ Backend may not be running on port 3002" -ForegroundColor Yellow
    Write-Host "  Start backend with: docker-compose up -d" -ForegroundColor Cyan
}

# Check if Caddy is already running
$caddyProcess = Get-Process -Name "caddy" -ErrorAction SilentlyContinue
if ($caddyProcess) {
    Write-Host ""
    Write-Host "⚠ Caddy is already running!" -ForegroundColor Yellow
    Write-Host "  PID: $($caddyProcess.Id)" -ForegroundColor Cyan
    Write-Host "  To restart, stop first: .\scripts\stop-caddy-tailscale.ps1" -ForegroundColor Cyan
    exit 0
}

# Start Caddy
Write-Host ""
Write-Host "Starting Caddy..." -ForegroundColor Yellow
Write-Host "  Domain: crm-mini.tail34e202.ts.net" -ForegroundColor Cyan
Write-Host "  Backend: localhost:3002" -ForegroundColor Cyan
Write-Host ""

Start-Process -FilePath $caddyPath -ArgumentList "run", "--config", $caddyfilePath

Write-Host ""
Write-Host "✓ Caddy started!" -ForegroundColor Green
Write-Host ""
Write-Host "Caddy is running in a new window." -ForegroundColor Cyan
Write-Host "To stop Caddy, run: .\scripts\stop-caddy-tailscale.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test HTTPS: Invoke-WebRequest -Uri 'https://crm-mini.tail34e202.ts.net/health' -UseBasicParsing" -ForegroundColor Yellow

