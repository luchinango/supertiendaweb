# P0.2 — Informe entorno Docker local

**Fecha:** 16 de noviembre de 2026  
**Sin commit / push / deploy / migraciones**

## Archivos creados
- `compose.yaml`
- `backend/Dockerfile`, `backend/.dockerignore`
- `frontend/Dockerfile`, `frontend/.dockerignore`
- `env.docker.example` (copiar a `.env.docker`)
- `docs/LOCAL_DOCKER.md`
- `docs/P0_2_DOCKER_REPORT.md`

## Archivos modificados
- `backend/src/controllers/PurchaseOrderController.ts` — tenancy JWT
- `backend/src/services/purchaseOrderService.ts` — filtro `businessId`
- `backend/src/interfaces/services/IPurchaseOrderService.ts`
- `backend/src/routes/routes.ts` — regenerado TSOA
- `backend/tests/run-p0-tenant-tests.ts` — +2 pruebas PO
- `frontend/next.config.js` — `INTERNAL_API_URL` para rewrites Docker
- `frontend/app/api/debug/route.ts` — TS fix
- `frontend/components/features/products/ProductDetailPanel.tsx` — TS fix
- `.gitignore` — ignora `.env.docker`

## Servicios y puertos (127.0.0.1)
| Servicio | Puerto host |
|----------|-------------|
| Frontend | 3000 |
| Backend | 5000 |
| PostgreSQL | 55432 → 5432 contenedor |

## Variables
Ver `env.docker.example`. `DATABASE_URL` del backend apunta solo a `db` (Compose), no a remoto.

## Comandos
```bash
Copy-Item env.docker.example .env.docker
docker compose --env-file .env.docker up --build -d
docker compose --env-file .env.docker ps
docker compose --env-file .env.docker down
```

## Validación ejecutada
| Check | Resultado |
|-------|-----------|
| `docker compose config` | OK |
| Build imágenes | OK (backend requiere python3/g++/make por `iconv`) |
| Stack up | OK |
| DB health | OK |
| Backend `/health` | OK |
| Frontend HTTP | 200 |
| Tablas Prisma | **Vacía** — bloqueo |
| `npm run test:p0` | **9 passed** |
| Backend `tsc` | OK |
| Frontend `tsc` | OK |

## Bloqueo / autorización pendiente
Inicializar schema en DB Docker local con **una** opción autorizada:
- A) `prisma db push` solo contra contenedor `db`
- B) baseline migrate (P1) solo local

**No** se ejecutó ninguna de las dos.
