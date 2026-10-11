#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"
if [ ! -f .env ]; then
  cp .env.example .env
  echo 'Configura backend/.env y crea la base PostgreSQL antes de repetir el setup.'
  exit 1
fi
npm ci
npx prisma generate
npx prisma migrate deploy
node prisma/seed.js
cd "$SCRIPT_DIR/frontend"
npm ci
echo 'HUBIAVANTE instalado. Ejecuta ./arrancar.sh'
