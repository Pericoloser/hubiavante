# HUBIAVANTE

Plataforma interna de gestión formativa de IAVANTE: fichas técnicas, presupuestos, propuestas comerciales, guías, seguimiento, informes y bases de datos de clientes, alumnos y docentes.

Este es un único proyecto. La aplicación React/Express sustituye a la antigua web del proyecto retirado. No se incorporan su plataforma ni su copiloto IA. El historial anterior permanece en Git.

## Instalación local

Requisitos: Node.js 22 y PostgreSQL 16.

1. Crea una base de datos vacía y un usuario PostgreSQL con contraseña propia.
2. Copia `backend/.env.example` a `backend/.env` y configura `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (mínimo 16 caracteres) y `JWT_SECRET` (mínimo 32 caracteres aleatorios; puedes generarlo con `openssl rand -hex 32`). Codifica los caracteres especiales de la contraseña dentro de la URL PostgreSQL.
3. Ejecuta `./setup.sh` o `.\setup.ps1`. Aplica migraciones versionadas y crea el administrador solo si no existe; no cambia contraseñas de usuarios existentes.
4. Ejecuta `./arrancar.sh` o `.\arrancar.ps1` y abre http://localhost:5173.

En una instalación existente, haz una copia de seguridad y compara el esquema antes de aplicar la migración inicial. Si el esquema ya coincide, registra la migración con `npx prisma migrate resolve --applied 202610110001_initial` en lugar de volver a crear tablas. No ejecutes el setup sobre datos existentes sin esa revisión.

No hay contraseñas de acceso predeterminadas. Las instalaciones existentes deben cambiar las credenciales publicadas anteriormente y renovar el secreto JWT; los tokens antiguos dejan de ser válidos.

## Docker

Copia `.env.example` a `.env` y completa los valores. Usa una contraseña de base de datos de caracteres alfanuméricos para la URL de Compose.

```sh
docker compose up -d db
docker compose run --rm backend npx prisma migrate deploy
docker compose run --rm backend node prisma/seed.js
docker compose up -d --build
```

Los puertos están limitados al equipo local. Para publicar, configura HTTPS y un proxy, copias de seguridad y los secretos de la instalación. Ya no se usa la configuración estática ni el dominio del proyecto anterior.

## Permisos

La aplicación pertenece a una única organización (IAVANTE); los clientes no son organizaciones usuarias independientes.

| Perfil | Acceso |
|---|---|
| admin | Lectura, creación, edición y eliminación/desactivación |
| gestor | Lectura, creación y edición; sin operaciones DELETE |
| docente u otro | Solo consulta de su identidad; sin acceso a módulos de gestión |

El rol y estado activo se consultan en PostgreSQL en cada petición. No se habilita un portal docente hasta añadir permisos por curso. No se ha trasladado el modelo multiorganización de la plataforma retirada.

## Validación

```sh
cd backend
npm ci
npx prisma generate
npm test
npm run test:integration
cd ../frontend
npm ci
npm run build
```

Las pruebas de integración requieren una base vacía y exclusiva de pruebas en `DATABASE_URL` y `RUN_INTEGRATION_TESTS=1`; modifican datos de prueba. CI inicia PostgreSQL real, aplica migraciones y comprueba login, persistencia y permisos mediante HTTP. No sustituye la aceptación funcional en una instalación final.
