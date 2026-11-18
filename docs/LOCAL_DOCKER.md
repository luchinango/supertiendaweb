# Entorno local Docker — SuperTienda (P0.2)

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Estado:** Compose y Dockerfiles listos — **sin migraciones aplicadas**

---

## Requisitos

- Docker Desktop (Windows) en ejecución
- Docker Compose v2
- Puertos libres en localhost: `3000`, `5000`, `55432`
- Imágenes base: `node:22-bookworm-slim` (con `apt-get upgrade` en build)

## Servicios

| Servicio | Contenedor | Puerto host (solo 127.0.0.1) | Red interna |
|----------|------------|------------------------------|-------------|
| PostgreSQL 16 | `supertienda-db` | `55432` (default; evita choque con PG local) | `db:5432` |
| Backend Express | `supertienda-backend` | `5000` | `backend:5000` |
| Frontend Next.js | `supertienda-frontend` | `3000` | `frontend:3000` |

No se usan hosts ni APIs remotas en este compose.

## Variables

Plantilla: `env.docker.example` → copiar a `.env.docker` (gitignored).

Claves principales:

- `POSTGRES_*` — credenciales **solo desarrollo**
- `DATABASE_URL` — se construye en compose hacia `db` (no remoto)
- `JWT_SECRET` — secreto de desarrollo independiente
- `NEXT_PUBLIC_API_URL` — URL que usa el **navegador** (`http://127.0.0.1:5000`)
- `INTERNAL_API_URL` — URL de rewrites del contenedor Next (`http://backend:5000`)

## Comandos

```bash
# Desde la raíz del repo
copy env.docker.example .env.docker   # PowerShell: Copy-Item

docker compose --env-file .env.docker config
docker compose --env-file .env.docker up --build
docker compose --env-file .env.docker ps
docker compose --env-file .env.docker logs -f backend
docker compose --env-file .env.docker down
# Borrar volumen de datos locales (destructivo solo para el volumen Docker local):
docker compose --env-file .env.docker down -v
```

Healthchecks:

- DB: `pg_isready`
- Backend: `GET /health`

## Prisma — estrategia (sin ejecutar aún)

**Problema:** no existe `prisma/migrations` ni seed útil. El schema puede no coincidir con la DB remota histórica.

**Para la DB Docker local (vacía):**

1. Levantar solo `db` y verificar health.
2. **Con autorización explícita**, aplicar **una** de estas opciones en sandbox local:
   - **Opción A (provisional):** `npx prisma db push` solo con `DATABASE_URL` apuntando al contenedor `db`.
   - **Opción B (preferida P1):** crear baseline migrate desde `schema.prisma` y `migrate deploy` solo en local.
3. Luego seed mínimo (aún por crear).

**Prohibido:**

- `migrate reset` / `db push` / `migrate deploy` contra la DB remota
- Copiar dumps productivos sin aprobación
- Baseline definitivo sin revisión

Hasta que se autorice la inicialización, el backend local arrancará pero las consultas fallarán por **falta de tablas** (bloqueo esperado).

**Estado verificado (16 nov 2026):** stack levantado; `pg_isready` OK; backend `/health` OK; frontend HTTP 200; `\dt` → *Did not find any relations* → **bloqueo: DB vacía sin schema**.

## Hot reload (Windows)

- Volúmenes bind del código fuente
- `WATCHPACK_POLLING` / `CHOKIDAR_USEPOLLING` en frontend
- Backend: `ts-node-dev` vía `npm run dev`

## Seguridad

- Puertos publicados solo en `127.0.0.1`
- Credenciales de ejemplo no productivas
- Claves RSA JWT se generan en volumen `backend_keys` al primer arranque (código existente)
- No incluir `.env` reales ni PEM en imágenes

## Pruebas E2E (tras tablas + seed)

1. Login en `http://127.0.0.1:3000/login`
2. `/auth/me` con token
3. Listar proveedores/órdenes de la empresa propia
4. Intentar `?businessId=` ajeno → 403
5. `npm run test:p0` en backend
