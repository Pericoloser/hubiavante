#!/usr/bin/env bash
# ============================================================
#  HUB IAVANTE — Script de arranque
#  Ejecutar cada vez que quieras iniciar la plataforma
# ============================================================

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
  echo ""
  echo -e "${YELLOW}Deteniendo servidores...${NC}"
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  echo -e "${GREEN}✓ Servidores detenidos. ¡Hasta pronto!${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         HUB IAVANTE — Arrancando         ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# --- Verificar PostgreSQL ---
echo -e "${YELLOW}▸ Verificando PostgreSQL...${NC}"
if ! pg_isready -q 2>/dev/null; then
  echo -e "${RED}✗ PostgreSQL no está corriendo.${NC}"
  echo "  Inícialo manualmente o con: sudo service postgresql start"
  exit 1
fi
echo -e "${GREEN}  ✓ PostgreSQL activo${NC}"

# --- Backend ---
echo -e "${YELLOW}▸ Iniciando backend (puerto 3001)...${NC}"
cd "$SCRIPT_DIR/backend"
if [ ! -f ".env" ]; then
  echo -e "${RED}✗ Falta el archivo .env en backend/. Ejecuta primero ./setup.sh${NC}"
  exit 1
fi
node src/server.js > /tmp/hubiavante_backend.log 2>&1 &
BACKEND_PID=$!

# Esperar a que el backend responda
for i in {1..10}; do
  sleep 1
  if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Backend listo en http://localhost:3001${NC}"
    break
  fi
  if [ $i -eq 10 ]; then
    echo -e "${RED}✗ El backend no arrancó. Log:${NC}"
    cat /tmp/hubiavante_backend.log
    exit 1
  fi
done

# --- Frontend ---
echo -e "${YELLOW}▸ Iniciando frontend (puerto 5173)...${NC}"
cd "$SCRIPT_DIR/frontend"
npm run dev > /tmp/hubiavante_frontend.log 2>&1 &
FRONTEND_PID=$!

for i in {1..10}; do
  sleep 1
  if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Frontend listo en http://localhost:5173${NC}"
    break
  fi
  if [ $i -eq 10 ]; then
    echo -e "${RED}✗ El frontend no arrancó. Log:${NC}"
    cat /tmp/hubiavante_frontend.log
    exit 1
  fi
done

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       ✓ HUB IAVANTE en marcha            ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  🌐 Plataforma:  ${CYAN}http://localhost:5173${NC}"
echo -e "  🔌 API:         ${CYAN}http://localhost:3001/api/health${NC}"
echo ""
echo -e "  👤 Usuario:     ${CYAN}admin@iavante.es${NC}"
echo -e "  🔑 Contraseña:  ${CYAN}iavante2024${NC}"
echo ""
echo -e "  ${YELLOW}Pulsa Ctrl+C para detener ambos servidores${NC}"
echo ""

# Mantener vivo el script mientras corren los servidores
wait "$BACKEND_PID" "$FRONTEND_PID"
