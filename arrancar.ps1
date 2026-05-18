# ============================================================
#  HUB IAVANTE — Arrancar plataforma en Windows
#  Ejecutar cada vez que quieras iniciar la plataforma
# ============================================================

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         HUB IAVANTE — Arrancando         ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# --- Verificar PostgreSQL activo ---
Write-Host "▸ Verificando PostgreSQL..." -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    if ($pgService.Status -ne "Running") {
        Write-Host "  Iniciando servicio PostgreSQL..." -ForegroundColor Yellow
        Start-Service $pgService.Name
        Start-Sleep -Seconds 2
    }
    Write-Host "  ✓ PostgreSQL activo" -ForegroundColor Green
} else {
    # Intentar conectar de todas formas (puede estar instalado de otra manera)
    $test = psql -U postgres -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ PostgreSQL no está corriendo." -ForegroundColor Red
        Write-Host "  Ábrelo desde: Menu Inicio > pgAdmin o servicios de Windows" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "  ✓ PostgreSQL activo" -ForegroundColor Green
}

# --- Backend ---
Write-Host "▸ Iniciando backend (puerto 3001)..." -ForegroundColor Yellow
$backend = Start-Process -FilePath "node" `
    -ArgumentList "src/server.js" `
    -WorkingDirectory "$ScriptDir\backend" `
    -PassThru `
    -WindowStyle Minimized

Start-Sleep -Seconds 3

$health = try { Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 5 } catch { $null }
if ($health -and $health.StatusCode -eq 200) {
    Write-Host "  ✓ Backend listo en http://localhost:3001" -ForegroundColor Green
} else {
    Write-Host "✗ El backend no arrancó correctamente." -ForegroundColor Red
    Write-Host "  Revisa que no haya otro proceso usando el puerto 3001." -ForegroundColor Yellow
    $backend | Stop-Process -ErrorAction SilentlyContinue
    exit 1
}

# --- Frontend ---
Write-Host "▸ Iniciando frontend (puerto 5173)..." -ForegroundColor Yellow
$frontend = Start-Process -FilePath "npm" `
    -ArgumentList "run", "dev" `
    -WorkingDirectory "$ScriptDir\frontend" `
    -PassThru `
    -WindowStyle Minimized

Start-Sleep -Seconds 5

$frontHealth = try { Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5 } catch { $null }
if ($frontHealth -and $frontHealth.StatusCode -eq 200) {
    Write-Host "  ✓ Frontend listo en http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "  ✓ Frontend iniciando en http://localhost:5173" -ForegroundColor Green
}

# Abrir el navegador automáticamente
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║       ✓ HUB IAVANTE en marcha            ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  🌐 Plataforma:  " -NoNewline; Write-Host "http://localhost:5173" -ForegroundColor Cyan
Write-Host "  🔌 API:         " -NoNewline; Write-Host "http://localhost:3001/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "  👤 Usuario:     " -NoNewline; Write-Host "admin@iavante.es" -ForegroundColor Cyan
Write-Host "  🔑 Contraseña:  " -NoNewline; Write-Host "iavante2024" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Backend PID:  $($backend.Id)" -ForegroundColor Gray
Write-Host "  Frontend PID: $($frontend.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "  Para detener: " -NoNewline
Write-Host ".\parar.ps1" -ForegroundColor Yellow
Write-Host ""

# Guardar PIDs para poder pararlos después
"$($backend.Id)" | Out-File "$ScriptDir\.backend.pid"
"$($frontend.Id)" | Out-File "$ScriptDir\.frontend.pid"

Write-Host "Pulsa cualquier tecla para cerrar esta ventana (los servidores seguirán corriendo)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
