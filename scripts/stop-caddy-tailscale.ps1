# Stop Caddy for Pilzno CRM Backend HTTPS

Write-Host "Stopping Caddy..." -ForegroundColor Yellow

$caddyProcess = Get-Process -Name "caddy" -ErrorAction SilentlyContinue

if ($caddyProcess) {
    Stop-Process -Name "caddy" -Force
    Write-Host "Caddy stopped successfully!" -ForegroundColor Green
} else {
    Write-Host "Caddy is not running." -ForegroundColor Yellow
}

