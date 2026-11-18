# CURRENT_ARCHITECTURE — Arquitectura real de SuperTienda

**Versión:** 1.1 — 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Repo:** `supertiendaweb`

---

## Hechos verificados

### Forma del sistema

Monorepo de dos procesos:

```
Browser
  → frontend (Next.js App Router, mayormente "use client")
    → rewrite /api/* (next.config.js)
      → backend Express :5000 (default)
        → RegisterRoutes (TSOA)
        → Prisma Client
          → PostgreSQL
```

Evidencia: `backend/src/index.ts` → `server.ts` → `app.ts`; `frontend/app/layout.tsx`; proxy en `frontend/next.config.js` (fallback IP remota); `frontend/lib/api-client.ts`.

### Capas del backend

| Capa | Ubicación | Observación |
|------|-----------|-------------|
| Controllers TSOA | `*Controller.ts` PascalCase | Subconjunto en `routes.ts` |
| Controllers legacy | camelCase Express | Mounts comentados en `app.ts` |
| Services / Repositories / Mappers | `src/services`, `repositories`, `mappers` | Patrón mixto |
| DI | `DIContainer.ts` | Incompleto |
| OpenAPI | `swagger.json`, `/api-docs` | TSOA |

### Rutas TSOA activas

`/auth`, `/users`, `/businesses`, `/products`, `/business-products`, `/categories`, `/suppliers`, `/purchase-orders` (+ health).

### No registrado aún

POS, sales, cart, cash-register, customers, inventory, employees, roles/permissions runtime, audits.

### Frontend

Páginas operativas amplias; auth gate con bypasses; stubs `cash-registers/open`, `reports`, `debug`. Sin PWA.

### Infra ausente

Docker/CI, `prisma/migrations`, seed funcional, workspace root.

---

## Decisiones aprobadas

1. Conservar stack: Next.js, Express, TSOA/OpenAPI, Prisma, PostgreSQL.
2. Monolito modular dentro de SuperTienda; sin microservicios innecesarios.
3. Fronteras internas: identidad/empresas, catálogo, inventario, clientes, pedidos, ventas, POS, cajas, **integraciones externas (puertos)**, sincronización, reportes.
4. Productos Payments/FactuBo/Alicia/Analytics = repos independientes; aquí solo contratos.
5. No adoptar DB/frameworks nuevos sin justificación aprobada.
6. API versionada y documentada; aislamiento por empresa; idempotencia; auditoría.

---

## Recomendaciones técnicas

1. Completar migración a TSOA (no reactivar mounts legacy en paralelo).
2. Introducir `/api/v1` al cablear API comercial (P2).
3. Unificar repository+service en ventas/POS para offline (P5).
4. Separar UI Next / API comercial / **puertos** hacia productos CODEMEDIIA (sin SDKs Red Enlace).
5. CI mínimo después del POS E2E.
6. Eliminar bypass auth e IP remota por defecto antes de demos compartidas.

### Mapeo de dominios

| Dominio | Estado en repo |
|---------|----------------|
| Identidad, empresas, permisos | Parcial |
| Catálogo y precios | Parcial (sin variantes/promos) |
| Inventario / Clientes / Pedidos-ventas / POS-cajas | Código sí, API no |
| Integraciones externas | Ausente (correcto: contratos solo) |
| Sync offline / Reportes | Ausente / stub |

---

## Funcionalidades futuras

- Clientes HTTP a Payments/FactuBo; realtime auxiliar; servidor local multicaja.

---

## Decisiones pendientes

1. ¿BFF Next parcial o todo Express?
2. ¿Workspaces/Turborepo o dos apps?
3. ¿Prisma como única fuente vs `backups/public.sql`?
4. URL canónica local de API.
