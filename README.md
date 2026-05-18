# HUB IAVANTE — Plataforma de Gestión Formativa

## Estado del proyecto

| Componente | Estado |
|---|---|
| Código fuente completo | ✅ Listo |
| Base de datos (esquema + seed) | ✅ Listo |
| Backend API (Node.js + Express) | ✅ Listo |
| Frontend (React + Vite) | ✅ Listo |
| Scripts Linux/Mac | ✅ Listos |
| Scripts Windows | ✅ Listos |

---

## Requisitos en tu PC

| Programa | Para qué sirve | Cómo verificar |
|---|---|---|
| Node.js v18+ | Ejecutar el servidor | `node --version` |
| npm | Instalar dependencias | `npm --version` |
| PostgreSQL 16 | Base de datos | `psql --version` |

---

## Instalación paso a paso en Windows

### 1 · Instalar PostgreSQL (si no lo tienes)

Descarga el instalador desde:
```
https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
```
- Versión: **16**, plataforma: **Windows x86-64**
- Durante la instalación, cuando pida contraseña escribe: `iavante2024`
- Puerto: `5432` (por defecto)
- Al terminar, reabre PowerShell y verifica con: `psql --version`

### 2 · Descargar el proyecto

```powershell
git clone https://github.com/Pericoloser/hubiavante.git
cd hubiavante
git checkout claude/hub-iavante-platform-4rS1M
```

O si ya lo tienes descargado, solo actualiza:
```powershell
cd hubiavante
git pull
```

### 3 · Setup inicial (solo una vez)

```powershell
.\setup.ps1
```

Esto instala dependencias, crea la base de datos y carga los datos iniciales.

### 4 · Arrancar la plataforma (cada vez)

```powershell
.\arrancar.ps1
```

Abre el navegador en **http://localhost:5173**

### 5 · Detener la plataforma

Pulsa `Ctrl+C` en la ventana de PowerShell, o ejecuta:
```powershell
.\parar.ps1
```

---

## Acceso

| Campo | Valor |
|---|---|
| URL | http://localhost:5173 |
| Usuario | admin@iavante.es |
| Contraseña | iavante2024 |

---

## Módulos disponibles

| Módulo | Ruta |
|---|---|
| Dashboard | /dashboard |
| Fichas Técnicas | /fichas |
| Presupuestos | /presupuestos |
| Propuestas Comerciales | /propuestas |
| Guía del Alumno | /fichas/:id/guia-alumno |
| Guía del Docente | /fichas/:id/guia-docente |
| Seguimiento | /fichas/:id/seguimiento |
| Informe Final | /fichas/:id/informe |
| Base de datos Clientes | /bbdd/clientes |
| Base de datos Alumnos | /bbdd/alumnos |
| Base de datos Docentes | /bbdd/docentes |
| Base de datos Tarifas | /bbdd/tarifas |

---

## Datos precargados

- **1 cliente**: Hospital Universitario Virgen del Rocío (Sevilla)
- **6 tarifas**: Docencia/hora, Coordinación/hora, Simulación clínica/hora, Material/sesión, Sala/día, Curso online
- **1 usuario admin**: admin@iavante.es / iavante2024

---

## Stack tecnológico

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express + Prisma ORM
- **Base de datos**: PostgreSQL 16
