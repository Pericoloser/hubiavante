$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
function Invoke-Checked { param([scriptblock]$Command)
    & $Command
    if ($LASTEXITCODE -ne 0) { throw "La operación ha fallado ($LASTEXITCODE)" }
}
Set-Location "$ScriptDir\backend"
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    throw "Configura backend/.env y crea la base PostgreSQL antes de repetir el setup."
}
Invoke-Checked { npm ci }
Invoke-Checked { npx prisma generate }
Invoke-Checked { npx prisma migrate deploy }
Invoke-Checked { node prisma/seed.js }
Set-Location "$ScriptDir\frontend"
Invoke-Checked { npm ci }
Set-Location $ScriptDir
Write-Host "HUBIAVANTE instalado. Ejecuta .\arrancar.ps1"
