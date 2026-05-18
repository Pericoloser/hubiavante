# ============================================================
#  HUB IAVANTE — Setup inicial para Windows
#  Ejecutar UNA SOLA VEZ antes del primer arranque
# ============================================================

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       HUB IAVANTE — Setup inicial        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# --- Verificar Node.js ---
Write-Host "▸ Verificando requisitos..." -ForegroundColor Yellow
try {
    $nodeVer = (node --version 2>&1).ToString().Replace("v","").Split(".")[0]
    if ([int]$nodeVer -lt 18) {
        Write-Host "✗ Node.js $nodeVer es demasiado antiguo. Se requiere v18+." -ForegroundColor Red
        Write-Host "  Descarga desde: https://nodejs.org" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✓ Node.js $(node --version)" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js no encontrado. Descarga desde: https://nodejs.org" -ForegroundColor Red
    exit 1
}

# --- Verificar PostgreSQL ---
try {
    $psqlVer = (psql --version 2>&1).ToString()
    Write-Host "  ✓ $psqlVer" -ForegroundColor Green
} catch {
    Write-Host "✗ PostgreSQL no encontrado." -ForegroundColor Red
    Write-Host "  Descarga desde: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads" -ForegroundColor Red
    Write-Host "  Durante la instalacion usa la contrasena: iavante2024" -ForegroundColor Yellow
    exit 1
}

# --- Crear base de datos ---
Write-Host ""
Write-Host "▸ Configurando base de datos..." -ForegroundColor Yellow

$env:PGPASSWORD = "iavante2024"

psql -U postgres -c "CREATE USER iavante WITH PASSWORD 'iavante2024';" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Usuario 'iavante' creado" -ForegroundColor Green
} else {
    Write-Host "  ~ Usuario 'iavante' ya existe" -ForegroundColor Yellow
}

psql -U postgres -c "CREATE DATABASE hubiavante OWNER iavante;" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Base de datos 'hubiavante' creada" -ForegroundColor Green
} else {
    Write-Host "  ~ Base de datos 'hubiavante' ya existe" -ForegroundColor Yellow
}

psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE hubiavante TO iavante;" 2>$null

# --- Backend ---
Write-Host ""
Write-Host "▸ Instalando dependencias del backend..." -ForegroundColor Yellow
Set-Location "$ScriptDir\backend"

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "  ✓ Archivo .env creado" -ForegroundColor Green
} else {
    Write-Host "  ~ .env ya existe" -ForegroundColor Yellow
}

npm install --silent
Write-Host "  ✓ Dependencias backend instaladas" -ForegroundColor Green

npx prisma db push --skip-generate 2>&1 | Out-Null
npx prisma generate --silent 2>&1 | Out-Null
Write-Host "  ✓ Base de datos sincronizada" -ForegroundColor Green

node prisma/seed.js
Write-Host "  ✓ Datos iniciales cargados" -ForegroundColor Green

# --- Frontend ---
Write-Host ""
Write-Host "▸ Instalando dependencias del frontend..." -ForegroundColor Yellow
Set-Location "$ScriptDir\frontend"
npm install --silent
Write-Host "  ✓ Dependencias frontend instaladas" -ForegroundColor Green

Set-Location $ScriptDir

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✓ Setup completado correctamente       ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  Ahora ejecuta: " -NoNewline
Write-Host ".\arrancar.ps1" -ForegroundColor Cyan
Write-Host ""
