# HUB IAVANTE — Plataforma de Gestión Formativa

Sistema integral para la gestión de actividades formativas en simulación clínica y formación sanitaria.

## Módulos

| Módulo | Descripción |
|---|---|
| **Ficha Técnica** | Registro completo de la actividad formativa |
| **Presupuestos** | Gestión económica con líneas y tarifas |
| **Propuesta Comercial** | Documentos de oferta para clientes |
| **Guía del Alumno** | Documento orientativo para participantes |
| **Guía del Docente** | Instrucciones para el equipo docente |
| **Seguimiento** | Control de sesiones y asistencia |
| **Informe Final** | Memoria y resultados de la actividad |
| **BBDD Clientes** | Entidades contratantes |
| **BBDD Alumnos** | Participantes formados |
| **BBDD Docentes** | Equipo docente con tarifas |
| **BBDD Tarifas** | Catálogo de precios |

## Stack tecnológico

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express + Prisma ORM
- **Base de datos**: PostgreSQL 16

## Inicio rápido (desarrollo local)

### 1. Levantar PostgreSQL

```bash
docker compose up db -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Accede en: **http://localhost:5173**

Credenciales por defecto: `admin@iavante.es` / `iavante2024`

## Despliegue completo con Docker

```bash
docker compose up --build
```

## Estructura del proyecto

```
hubiavante/
├── backend/
│   ├── prisma/schema.prisma    # Modelos de base de datos
│   ├── src/
│   │   ├── controllers/        # Lógica de negocio
│   │   ├── routes/             # Endpoints API REST
│   │   └── middleware/         # Auth JWT
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/              # Módulos UI
│   │   ├── components/         # Componentes reutilizables
│   │   ├── services/api.js     # Cliente HTTP
│   │   └── context/            # Estado global (auth)
│   └── package.json
└── docker-compose.yml
```
