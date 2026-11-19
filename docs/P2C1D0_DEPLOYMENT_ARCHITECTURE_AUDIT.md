# P2-C1.D0 — Auditoría de infraestructura y despliegue DEMO

**Fecha:** 2026-11-18  
**Repositorio:** `C:\Proyectos\supertiendaweb` · GitHub `luchinango/supertiendaweb`  
**Alcance:** **Solo auditoría.** Sin código, migraciones, cloud create, commit/push/deploy ni uso de bases remotas no autorizadas.  
**Contexto:** G9.4 = GO condicionado UAT humana supervisada (lab DEMO).

Precios citados: verificación pública nov-2026 (Vercel / Supabase / Render / Railway). **Revalidar en consola antes de contratar.**

---

## 0. Veredicto ejecutivo

| Pregunta | Respuesta |
|----------|-----------|
| ¿Arquitectura actual lista para “solo Vercel”? | **No** — el API es Express de proceso larga + Prisma |
| ¿Mejor camino DEMO remota (sin VPS propio)? | **Opción A:** Vercel (FE) + backend contenedor/always-on (p. ej. Render) + Postgres DEMO aislado (Supabase u otro) |
| ¿Serverless Express en Vercel (opción B)? | **NO recomendado** para POS/sync/idempotencia en esta fase |
| ¿UAT inmediata? | **Opción C** (Docker local) — ya validada G1–G9.4 |
| **GO implementar infra DEMO remota** | **GO condicionado** (plan en `P2C1D0_DEMO_DEPLOYMENT_PLAN.md`) |
| **GO producción / dinero real / SIAT** | **NO-GO** |

---

## 1. Arquitectura actual verificada (código)

### 1.1 Diagrama actual (lab)

```text
┌──────────── PC / móvil lab ────────────┐
│  Chromium / PWA → http://127.0.0.1:3001 │
└───────────────┬────────────────────────┘
                │ /api/* rewrite (Next)
                ▼
┌─ FE Next 15 (next start / Docker) ─────┐
│  React 19 · SWR · Dexie · SW/PWA       │
│  NEXT_PUBLIC_API_URL → host:5000       │
│  INTERNAL_API_URL → backend:5000       │
└───────────────┬────────────────────────┘
                │ HTTP JSON + JWT + X-Device-Id
                ▼
┌─ BE Express 5 + TSOA + Prisma ─────────┐
│  listen(PORT) · /health · /api-docs    │
│  Auth JWT access/refresh · sync outbox │
│  Caja / leases / ventas idempotentes   │
└───────────────┬────────────────────────┘
                │ DATABASE_URL
                ▼
┌─ PostgreSQL 16 (compose `db`) ─────────┐
│  Solo red Docker (sin publish default) │
│  DB: supertienda_dev (lab)             │
└────────────────────────────────────────┘
```

Fuente: `compose.yaml`, `frontend/next.config.js` (rewrites), `backend/src/server.ts`, `backend/src/app.ts`.

### 1.2 Frontend (Next.js)

| Ítem | Evidencia |
|------|-----------|
| Stack | Next `^15.3.4`, React `^19.1.0` (`frontend/package.json`) |
| API browser | `NEXT_PUBLIC_API_URL`; rewrite `/api/:path*` → `INTERNAL_API_URL` \|\| `NEXT_PUBLIC_API_URL` |
| Producción FE | `Dockerfile` target `production` → `next build` + `next start` (imagen lab `g94`) |
| PWA | `public/manifest.webmanifest`, `public/sw.js` (`st-pwa-v2`), headers SW en `next.config.js` |
| Offline | Dexie + outbox (`frontend/lib/offline/*`, `posSaleOfflineService`) |
| Debug | `/debug-offline` gateado por `development` o `NEXT_PUBLIC_OFFLINE_DEBUG=1` |
| vercel.json | **No existe** |

### 1.3 Backend (Express / TSOA / Prisma)

| Ítem | Evidencia |
|------|-----------|
| Runtime | Express `^5.1.0`, proceso Node `app.listen` (`server.ts`) |
| Rutas | TSOA `RegisterRoutes` + `employeeRoutes` legacy bajo `/api` |
| ORM | Prisma client + `pg` |
| Auth | JWT access/refresh (`AuthController`, `authService`); headers `Authorization`, `X-Device-Id`, `Idempotency-Key` |
| CORS | Allowlist **localhost/127.0.0.1 :3000/:3001** + `CORS_ORIGIN` (`app.ts`) |
| Swagger | `/api-docs` montado sin gate de auth observado |
| Health | `GET /`, `GET /health` |
| WebSockets | **No encontrados** |
| Cron / jobs | `node-cron` en deps; schedules de mermas en `server.ts` **comentados** (no activos) |
| Fiscal | **Sin** FactuBO/SIAT en código de producto; tickets “no fiscal” |
| Rate limit | Config en `config/app.ts`; **no** middleware de rate-limit aplicado a rutas (solo logging helper) |
| Seed DEMO | script `db:seed:demo` → `prisma/seed.demo.ts` |

### 1.4 Base de datos

| Ítem | Evidencia |
|------|-----------|
| Motor lab | Postgres 16 Alpine en Compose |
| Exposición | Sin `ports` por defecto (solo red interna) |
| URL lab documentada | `…@db:5432/supertienda_dev` (informes P2-C1) |
| Remota | **No inspeccionada ni usada** en esta auditoría (restricción D0) |

### 1.5 Autenticación / sesiones (FE)

- Tokens en **localStorage** (`auth_token` / `token` / `refresh_token`) + cookie `auth_token` en flujos de lab (scripts UAT).
- No hay sesión server-side Next Auth verificada como fuente de verdad.
- Implicación cloud: cualquier origen FE público debe estar en CORS; HTTPS obligatorio para PWA.

### 1.6 Sincronización e idempotencia

- Outbox IndexedDB → API sync con idempotencia / leases de caja (suites B2-A, F1 PASS en G9.4).
- Riesgo cloud: cold start, timeouts o sleep del backend → reintentos; el diseño idempotente **mitiga** duplicados si se preservan `clientOperationId` / leases (no modificar motor en D0).

### 1.7 Docker / build

- `compose.yaml` → `supertienda-dev` (db + backend + frontend), puertos **solo 127.0.0.1**.
- FE prod local: build args `NEXT_PUBLIC_API_URL` + `INTERNAL_API_URL` (congelados en `next build`).

---

## 2. Comparación de alternativas cloud

### A. Vercel FE + backend alojado aparte + Supabase DEMO

| Criterio | Evaluación |
|----------|------------|
| Compatibilidad | **Alta** — FE Next encaja en Vercel; BE Express como servicio Node/Docker continuo |
| Cambios código | Medios: CORS orígenes públicos; env FE/BE; posiblemente proxy `/api` o llamadas directas a API URL; secrets; desactivar/proteger `/api-docs` |
| Costo orientativo* | Vercel Hobby **$0**; Supabase Free **$0** (pausa 7d inactividad) o Pro **~$25/mes**; Render always-on API **~$7/mes** (o free con sleep) / Railway Hobby **~$5/mes** + uso |
| Límites free | Supabase pause; Render free spin-down ~15 min; Railway free sleep + crédito bajo |
| Seguridad | Buena si DEMO aislada + HTTPS + JWT rotados; riesgo Swagger abierto |
| Latencia | Aceptable región cercana; cold start solo si API duerme |
| Offline/PWA | **Compatible** si API HTTPS estable (sleep rompe sync UAT) |
| Riesgo ventas | Bajo si API always-on + idempotencia; alto si sleep mid-sync |
| UAT remota | **Idónea** con API always-on |
| Mantenimiento | Medio (3 piezas: FE/API/DB) |

\*Revalidar precios actuales en consolas.

### B. Vercel FE + Express “serverless” + Supabase DEMO

| Criterio | Evaluación |
|----------|------------|
| Compatibilidad | **Baja–media** — Express monolítico + Prisma + TSOA no es Functions-first |
| Cambios | **Altos**: adapter serverless, pooling (p. ej. Prisma accelerate / PgBouncer), cold starts, timeouts, rutas, build |
| Costo | Hobby $0 dentro de cuotas Functions; riesgo pausa cuenta si se excede |
| Offline/POS | **Riesgo alto** — invocaciones largas, conexiones DB, reintentos outbox |
| UAT remota | No recomendable sin rediseño backend |
| Veredicto | **Descartar para DEMO UAT en esta fase** |

### C. Laboratorio local (Docker) — UAT presencial

| Criterio | Evaluación |
|----------|------------|
| Compatibilidad | **Ya demostrada** G1–G9.4 (`st-fe-prod-g94`) |
| Cambios | Ninguno de infra cloud |
| Costo | $0 cloud |
| UAT remota | No (salvo túnel — **no** recomendado sin hardening) |
| Offline/PWA | Lab `next start` validado; HTTPS local limitado (PWA install plena prefiere HTTPS público) |
| Veredicto | **Mejor para UAT inmediata firmada** |

### Tabla resumen

| | A remoto | B serverless | C local |
|--|----------|--------------|---------|
| Esfuerzo | Medio | Alto | Bajo |
| Riesgo POS/sync | Medio (si API duerme → alto) | Alto | Bajo (lab) |
| Costo DEMO estable | ~$7–30/mes tip. | $0–? + riesgo | $0 |
| Recomendación | **Sí (remoto)** | No | **Sí (presencial)** |

---

## 3. Aislamiento DEMO (diseño)

Entorno **nuevo**, nunca reutilizar `supertienda_dev` lab ni DB remota existente sin autorización:

| Recurso | Regla |
|---------|-------|
| Postgres | Proyecto/DB `supertienda_demo` dedicado (Supabase Free DEMO u otro) |
| Datos | Solo seed ficticio (`db:seed:demo` / seed controlado) — sin PII real |
| Secrets | `JWT_SECRET`, `CASH_LEASE_SECRET`, `DATABASE_URL` en vault del proveedor — **nunca Git** |
| CORS | Solo dominio(s) Vercel DEMO |
| FE env | `NEXT_PUBLIC_API_URL=https://api-demo…` en build |
| Acceso | HTTPS; usuarios UAT de prueba; rotar al cerrar DEMO |
| Logs | Sin tokens/passwords; nivel info |

**Prohibido en D0/implementación posterior sin acta:** apuntar a DB remota ya configurada en máquinas locales sin identificarla.

---

## 4. Seguridad — clasificación

### Críticos (bloquean DEMO pública si no se mitigan)

| ID | Riesgo | Mitigación requerida |
|----|--------|----------------------|
| C1 | Usar DB/secrets de producción o lab compartido | Proyecto DEMO aislado + secrets nuevos |
| C2 | CORS abierto o mal configurado | Allowlist estricta del FE DEMO |
| C3 | JWT débiles / defaults `dev-only-change-me` | Secrets fuertes solo en env cloud |

### Altos

| ID | Riesgo | Mitigación |
|----|--------|------------|
| A1 | `/api-docs` expuesto en Internet | Deshabilitar o proteger basic-auth / IP allow |
| A2 | Sin rate-limit efectivo en login/sync | Añadir límite (fase implementación) |
| A3 | Tokens en localStorage (XSS) | CSP endurecida; sin debug en DEMO; higiene XSS |
| A4 | Backend free que duerme mid-UAT | Preferir always-on mínimo pago |

### Medios

| ID | Riesgo | Mitigación |
|----|--------|------------|
| M1 | Swagger `tryItOut` + persistAuthorization | Off en DEMO |
| M2 | Multi-tenant bugs residuales | Mantener suites B2; cuentas solo DEMO |
| M3 | Supabase Free pause 7d | Ping programado o Pro si UAT larga |
| M4 | Logs con PII | Redacción; no loguear Authorization |

### Bajos

| ID | Riesgo | Mitigación |
|----|--------|------------|
| B1 | Dependabot advisory noise en GitHub | Triage separado |
| B2 | Cron comentado | N/A DEMO corto |
| B3 | Fiscal no integrado | Mantener NO-GO SIAT explícito |

---

## 5. PWA y offline en URL pública

| Requisito | Estado |
|-----------|--------|
| Manifest | Presente (`start_url: /ventas`) |
| Service worker | Presente; no cachea `/api` ni JWT |
| HTTPS | **Obligatorio** para install en móviles reales |
| IndexedDB/Dexie | Client-side; sobrevive por origen (dominio DEMO) |
| Sync post-conexión | Depende de API alcanzable (no sleep) |
| Navegación offline | Shell PWA + rutas operativas cacheadas (lab verificado) |
| Updates SW | Versión `st-pwa-v2`; cliente decide con outbox |
| Dispositivos compartidos | Riesgo: mismo origen = mismo IDB si mismo perfil browser — política UAT: un deviceId / usuario |

**Conclusión:** Instalable desde URL pública **si** FE+API van por HTTPS y el origen DEMO es estable. No modificar sync en D0.

---

## 6. Requisitos de infraestructura (DEMO remota A)

1. Cuenta GitHub (ya).  
2. Proyecto Vercel → FE `frontend/`, env build.  
3. Host Node always-on (Render ≥ ~$7/mes tip. o Railway Hobby) → `backend/` Docker o Node.  
4. Postgres DEMO (Supabase Free/Pro) — connection string solo Prisma.  
5. Dominios: `*.vercel.app` + `*.onrender.com` (o custom).  
6. Checklist secrets + CORS + seed DEMO + smoke (login, venta, offline, multiempresa).

---

## 7. Recomendación técnica justificada

1. **Corto plazo (esta semana):** ejecutar UAT humana con **opción C** (Docker local `g94`) + matriz G9.4.  
2. **DEMO remota (cuando CTO autorice implementación):** **opción A** con API **always-on** (no free sleep) + Postgres DEMO aislado + Vercel Hobby FE.  
3. **No** opción B en esta fase.  
4. Fiscal / dinero real / prod: **NO-GO**.

---

## 8. GO / NO-GO infra

| | |
|--|--|
| **GO** planificar e **implementar** infra DEMO remota (opción A) tras autorización CTO | Condicionado a secrets nuevos, DB aislada, API always-on, Swagger off, sin SIAT |
| **GO** UAT presencial ya | Opción C |
| **NO-GO** serverless Express (B) como atajo | |
| **NO-GO** publicar usando DB remota actual sin identificación + acta | |

---

*Fin auditoría D0. Plan operativo: `P2C1D0_DEMO_DEPLOYMENT_PLAN.md`.*
