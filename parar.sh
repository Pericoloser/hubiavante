#!/usr/bin/env bash
# ============================================================
#  HUB IAVANTE — Script para detener todos los procesos
# ============================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${YELLOW}Deteniendo HUB IAVANTE...${NC}"

pkill -f "node src/server.js" 2>/dev/null && echo -e "${GREEN}  ✓ Backend detenido${NC}" || echo "  ~ Backend no estaba corriendo"
pkill -f "vite"               2>/dev/null && echo -e "${GREEN}  ✓ Frontend detenido${NC}" || echo "  ~ Frontend no estaba corriendo"

echo ""
