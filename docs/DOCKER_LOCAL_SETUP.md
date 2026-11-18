# SuperTienda — Docker local (P0.2)

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Alcance:** entorno local aislado con Docker Compose + cierre de hueco PurchaseOrder + TS  
**Restricciones respetadas:** sin migraciones, sin DB remota, sin commit/push/deploy, sin tocar proyectos ajenos, sin borrar volúmenes

---

## 1. Archivos creados y modificados

| Archivo | Acción |
|---------|--------|
| `compose.yaml` | Adaptado: Postgres **sin** puerto publicado en host; FE/BE solo `127.0.0.1` |
| `backend/Dockerfile` | Ya existía (multi-stage development/production) — sin cambios estructurales |
| `frontend/Dockerfile` | Ya existía (multi-stage development/production) — sin cambios estructurales |
| `backend/.dockerignore` | Ya existía |
| `frontend/.dockerignore` | Ya existía |
| `.env.docker` | Local (gitignored) — variables solo localhost / servicio `db` |
| `.env.docker.example` | **Creado** — plantilla sin secretos reales |
| `backend/src/controllers/PurchaseOrderController.ts` | Listados ya no aceptan `businessId` por query; tenancy solo JWT |
| `backend/tests/run-p0-tenant-tests.ts` | Casos adicionales purchase-orders |
| `docs/DOCKER_LOCAL_SETUP.md` | **Este informe** |

TypeScript frontend (`debug/route.ts`, `ProductDetailPanel.tsx`) ya estaba corregido; `tsc` limpio.

---

## 2. Puertos elegidos

| Servicio | Puerto contenedor | Puerto host | Binding |
|----------|-------------------|-------------|---------|
| Frontend | 3000 | **3000** | `127.0.0.1` |
| Backend | 5000 | **5000** | `127.0.0.1` |
| PostgreSQL | 5432 | **ninguno** | solo red Docker `supertienda_net` |

**Nota:** En esta máquina, PostgreSQL nativo de Windows ocupa 5432 y 5433. Por eso el Postgres de SuperTienda **no** se publica al host (evita conflictos y reduce superficie). Si hace falta `psql` desde Windows, descomentar `ports` en `compose.yaml` y usar un puerto libre (p. ej. `55432`).

---

## 3. Servicios configurados

Stack `supertienda-dev`:

1. **db** — `postgres:16-alpine`, volumen `pgdata_dev`, healthcheck `pg_isready`, credenciales de desarrollo.
2. **backend** — build `target: development`, `DATABASE_URL` → `db:5432`, JWT_SECRET de desarrollo, hot reload vía volumen `./backend`.
3. **frontend** — build `target: development`, `NEXT_PUBLIC_API_URL=http://127.0.0.1:5000`, `INTERNAL_API_URL=http://backend:5000`, hot reload con polling.

---

## 4. Estado de Docker

| Ítem | Valor |
|------|-------|
| Docker Desktop | 4.49.0 |
| Engine | 28.5.1 |
| OSType | **linux** (WSL2 backend de Desktop) |
| Compose | v2.40.3-desktop.1 |
| Daemon | **Respondiendo** |
| Contenedores ajenos | No modificados / no detenidos |

Se puede continuar **sin instalar WSL 2** (ya presente vía Docker Desktop).

---

## 5. Estado del frontend

| Check | Resultado |
|-------|-----------|
| Contenedor | `supertienda-frontend` Up |
| URL | http://127.0.0.1:3000 |
| HTTP | **307** (redirect típico a login / middleware) — accesible desde Windows |
| API env | `NEXT_PUBLIC_API_URL=http://127.0.0.1:5000` (local) |
| TypeScript | `npx tsc --noEmit` → **0 errores** |

**No** se afirma que el POS funcione: no hay esquema ni datos.

---

## 6. Estado del backend

| Check | Resultado |
|-------|-----------|
| Contenedor | `supertienda-backend` Up **(healthy)** |
| Health | `GET http://127.0.0.1:5000/health` → **200** |
| DATABASE_URL | `postgresql://***@db:5432/supertienda_dev` (servicio Docker, no remoto) |
| TypeScript | `npm run type-check` → **OK** |
| Resolución DNS | `db` → IP de red compose |

---

## 7. Estado de PostgreSQL

| Check | Resultado |
|-------|-----------|
| Contenedor | `supertienda-db` Up, `pg_isready` OK |
| Puerto host | **No publicado** |
| Relaciones / tablas | **25 tablas** (migración `20261116153000_init_local`) |
| Datos demo | users=3, businesses=2, products=3, roles=2 |
| Datos remotos / prod | **No copiados** |

### Esquema local

El Postgres Docker local ya tiene esquema y datos mínimos de desarrollo.
E2E completo / P1 siguen pendientes de autorización explícita.

---

## 8. Resultado de pruebas

| Prueba | Resultado |
|--------|-----------|
| `docker compose config` | OK |
| Health backend | 200 |
| Frontend reachable | 307 |
| `npm run test:p0` | **11 passed, 0 failed** |
| TS frontend / backend | OK |
| Variables activas remotas | **No** (solo `db` / `127.0.0.1`) |
| E2E login/POS | **Pendiente** (esquema listo; falta corrida autorizada) |

---

## 9. Correcciones de seguridad (PurchaseOrder)

- Listados (`GET /`, `status/...`, `supplier/...`) ya **no** toman `businessId` de query.
- `businessId` efectivo = JWT vía `resolveBusinessId` / `getBusinessId`.
- Create: si el body trae `businessId` de otra empresa → **Forbidden**.
- Path `business/{businessId}`: solo si coincide con el JWT.
- get/update/delete/approve por id: filtran por empresa del token.
- Pruebas P0 ampliadas para purchase-orders.

Impacto API: clientes que enviaban `?businessId=` en listados dejan de necesitarlo (se ignora / ya no está en contrato TSOA). Si enviaban un id ajeno en create/path, siguen recibiendo 403.

---

## 10. Problemas pendientes

1. E2E login/POS aún no ejecutado de punta a punta en esta sesión.
2. Sin seed / usuarios de prueba.
3. `prisma/migrations/` ausente; `InventoryTransaction` con relaciones comentadas (deuda P1).
4. Otros ítems de `docs/P0_VALIDATION_AND_P1_PREP.md` (R2–R9) fuera de este alcance.
5. Los `.env` de host (`backend/.env`, `frontend/.env`) **aún pueden apuntar a remoto** si se corre fuera de Docker; el stack Compose usa `.env.docker` y está aislado.

---

## 11. Comandos para iniciar y detener

```bash
# Requisitos: Docker Desktop encendido (daemon respondiendo)

# Primera vez / rebuild
copy .env.docker.example .env.docker
docker compose --env-file .env.docker up --build -d

# Arrancar
docker compose --env-file .env.docker up -d

# Ver estado
docker compose --env-file .env.docker ps
curl http://127.0.0.1:5000/health

# Logs
docker compose --env-file .env.docker logs -f backend
docker compose --env-file .env.docker logs -f frontend

# Detener (conserva volúmenes / datos del volumen pgdata_dev)
docker compose --env-file .env.docker stop

# Bajar servicios (NO usa -v → no borra volúmenes)
docker compose --env-file .env.docker down
```

URLs Windows:

- Frontend: http://127.0.0.1:3000  
- Backend: http://127.0.0.1:5000  

---

## 12. Qué falta para autorizar P1

1. Autorizar **creación de esquema** solo en Postgres Docker local (`supertienda_dev`).
2. Definir estrategia: baseline migrate vs `db push` + política de seed.
3. Confirmar que **no** se usará la DB remota `206.183…` para ensayos.
4. Tras esquema: E2E login/logout, aislamiento HTTP multiempresa, smoke POS/inventario.
5. Plan P1 de `docs/P0_VALIDATION_AND_P1_PREP.md` (FKs InventoryTransaction, quitar defaults `businessId=1`, etc.).

---

## Veredicto P0.2

Entorno Docker local **reproducible y aislado** de API/PostgreSQL remotos.  
Frontend y backend responden en localhost.  
Postgres local con esquema y datos mínimos. Security PurchaseOrder + BusinessProduct tenancy parcial endurecida. `test:p0` verde.
Security PurchaseOrder endurecida + `test:p0` verde.  
Esquema local listo. Siguiente: autorizar E2E / P1.
