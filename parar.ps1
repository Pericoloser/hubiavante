# ============================================================
#  HUB IAVANTE — Detener plataforma en Windows
# ============================================================

Write-Host ""
Write-Host "Deteniendo HUB IAVANTE..." -ForegroundColor Yellow

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Parar por PIDs guardados
if (Test-Path "$ScriptDir\.backend.pid") {
    $pid = Get-Content "$ScriptDir\.backend.pid"
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Remove-Item "$ScriptDir\.backend.pid" -ErrorAction SilentlyContinue
    Write-Host "  ✓ Backend detenido" -ForegroundColor Green
}

if (Test-Path "$ScriptDir\.frontend.pid") {
    $pid = Get-Content "$ScriptDir\.frontend.pid"
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Remove-Item "$ScriptDir\.frontend.pid" -ErrorAction SilentlyContinue
    Write-Host "  ✓ Frontend detenido" -ForegroundColor Green
}

# Por si acaso, también matar por nombre de proceso
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*server.js*" -or $_.CommandLine -like "*vite*"
} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✓ Plataforma detenida." -ForegroundColor Green
Write-Host ""
