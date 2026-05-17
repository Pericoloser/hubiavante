#!/usr/bin/env bash
# ============================================================
#  HUB IAVANTE — Script de instalación inicial
#  Ejecutar UNA SOLA VEZ antes del primer arranque
# ============================================================

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       HUB IAVANTE — Setup inicial        ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# --- Verificar requisitos ---
echo -e "${YELLOW}▸ Verificando requisitos...${NC}"

if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js no encontrado. Instálalo desde https://nodejs.org (versión 18 o superior)${NC}"
  exit 1
fi
NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo -e "${RED}✗ Node.js ${NODE_VER} es demasiado antiguo. Se requiere v18+${NC}"
  exit 1
fi
echo -e "${GREEN}  ✓ Node.js $(node -v)${NC}"

if ! command -v npm &> /dev/null; then
  echo -e "${RED}✗ npm no encontrado${NC}"; exit 1
fi
echo -e "${GREEN}  ✓ npm $(npm -v)${NC}"

if ! command -v psql &> /dev/null; then
  echo -e "${RED}✗ PostgreSQL no encontrado.${NC}"
  echo "  Instálalo desde https://www.postgresql.org/download/"
  echo "  O usa Docker: docker run -d -p 5432:5432 -e POSTGRES_USER=iavante -e POSTGRES_PASSWORD=iavante2024 -e POSTGRES_DB=hubiavante postgres:16"
  exit 1
fi
echo -e "${GREEN}  ✓ PostgreSQL $(psql --version | head -1)${NC}"

# --- Crear base de datos ---
echo ""
echo -e "${YELLOW}▸ Configurando base de datos...${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

psql -U postgres -c "CREATE USER iavante WITH PASSWORD 'iavante2024';" 2>/dev/null && \
  echo -e "${GREEN}  ✓ Usuario 'iavante' creado${NC}" || \
  echo -e "${YELLOW}  ~ Usuario 'iavante' ya existe${NC}"

psql -U postgres -c "CREATE DATABASE hubiavante OWNER iavante;" 2>/dev/null && \
  echo -e "${GREEN}  ✓ Base de datos 'hubiavante' creada${NC}" || \
  echo -e "${YELLOW}  ~ Base de datos 'hubiavante' ya existe${NC}"

psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE hubiavante TO iavante;" 2>/dev/null

# --- Backend ---
echo ""
echo -e "${YELLOW}▸ Instalando dependencias del backend...${NC}"
cd "$SCRIPT_DIR/backend"

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${GREEN}  ✓ Archivo .env creado desde .env.example${NC}"
else
  echo -e "${YELLOW}  ~ .env ya existe, no se sobreescribe${NC}"
fi

npm install --silent
echo -e "${GREEN}  ✓ Dependencias backend instaladas${NC}"

npx prisma db push --skip-generate 2>&1 | grep -E "(sync|error|Error)" || true
npx prisma generate --silent 2>/dev/null
echo -e "${GREEN}  ✓ Base de datos sincronizada con Prisma${NC}"

node prisma/seed.js
echo -e "${GREEN}  ✓ Datos iniciales cargados${NC}"

# --- Frontend ---
echo ""
echo -e "${YELLOW}▸ Instalando dependencias del frontend...${NC}"
cd "$SCRIPT_DIR/frontend"
npm install --silent
echo -e "${GREEN}  ✓ Dependencias frontend instaladas${NC}"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ Setup completado correctamente       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Ahora ejecuta: ${CYAN}./arrancar.sh${NC}"
echo ""
