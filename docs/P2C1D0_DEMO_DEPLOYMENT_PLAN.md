# P2-C1.D0 — Plan de despliegue DEMO (aislada)

**Fecha:** 2026-11-18  
**Referencia:** `P2C1D0_DEPLOYMENT_ARCHITECTURE_AUDIT.md`  
**Estado:** **Plan únicamente.** No ejecutar hasta autorización CTO.  
**Arquitectura objetivo:** **Opción A** — Vercel (frontend) + backend Node always-on + PostgreSQL DEMO aislado (p. ej. Supabase).  
**Alternativa inmediata UAT:** **Opción C** — Docker local (sin cloud).

---

## 0. Principios

1. Cero datos personales/comerciales reales.  
2. Secrets fuera de Git; rotación al cerrar DEMO.  
3. HTTPS en FE y API.  
4. Sin FactuBO/SIAT.  
5. Sin tocar DB remota existente sin identificación + acta.  
6. No modificar motor de sync/idempotencia salvo bugs bloqueantes aprobados.  
7. Rollback = apagar/destruir stack DEMO, no “arreglar prod”.

---

## 1. Diagrama propuesto (opción A)

```text
        [UAT PC/móvil]
              │ HTTPS
              ▼
   ┌── Vercel Hobby ──┐
   │ Next 15 (frontend)│
   │ origen: *.vercel.app
   └───┬──────────────┘
       │ NEXT_PUBLIC_API_URL / rewrite /api
       │ HTTPS + JWT + X-Device-Id
       ▼
   ┌── Render / Railway (always-on) ──┐
   │ Express + TSOA + Prisma          │
   │ CORS → solo origen Vercel DEMO   │
   │ /api-docs OFF o protegido        │
   └───┬──────────────────────────────┘
       │ DATABASE_URL (TLS)
       ▼
   ┌── Supabase (proyecto DEMO) ──────┐
   │ Postgres aislado · seed ficticio │
   │ sin mirror de prod               │
   └──────────────────────────────────┘
```

---

## 2. Pre-requisitos (checklist CTO)

- [ ] Acta: “autorizo crear proyecto cloud DEMO (Vercel + API host + DB)”.  
- [ ] Confirmación de **no** usar connection strings existentes en `.env` locales sin inventario.  
- [ ] Presupuesto: tip. **$7–30 USD/mes** (API always-on + DB free/pro).  
- [ ] Lista usuarios UAT (emails ficticios / cuentas seed).  
- [ ] Fecha de retiro DEMO (TTL, p. ej. 14–30 días).

---

## 3. Etapas de implementación

### Etapa 0 — Inventario y naming (0.5 d)

| Acción | Detalle | Owner |
|--------|---------|-------|
| Nombrar recursos | `supertienda-demo-fe`, `supertienda-demo-api`, `supertienda-demo-db` | DevOps |
| Inventariar secrets locales | Listar qué `.env` existen; **no** reutilizar valores prod | CTO+Dev |
| Branch | `demo/infra` desde `master` (opcional; sin push hasta auth) | Dev |

**GO etapa:** naming + acta firmada.

---

### Etapa 1 — Base PostgreSQL DEMO (0.5–1 d)

| Paso | Acción | No hacer |
|------|--------|----------|
| 1.1 | Crear **proyecto nuevo** Supabase (u otro) región cercana | No clonar dump prod |
| 1.2 | Crear DB / schema vacío | No importar CSV reales |
| 1.3 | Guardar `DATABASE_URL` solo en vault del host API | No commit |
| 1.4 | Desde CI/Linux o contenedor: `prisma migrate deploy` (o pipeline aprobado) | **No** Prisma CLI desde Windows (política P2-C1) |
| 1.5 | `db:seed:demo` (o seed controlado) → empresas/usuarios/productos ficticios | No seed prod |

**Validación:** `SELECT count(*)` tablas clave; usuarios demo listados en runbook UAT.  
**Rollback:** borrar proyecto Supabase DEMO.

---

### Etapa 2 — Backend DEMO (1–1.5 d)

| Paso | Acción |
|------|--------|
| 2.1 | Servicio Render/Railway **always-on** (evitar free sleep) |
| 2.2 | Build: Docker backend o `npm ci && tsoa + tsc` según Dockerfile BE |
| 2.3 | Env: `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET` (nuevo), `CASH_LEASE_SECRET` (nuevo), `CORS_ORIGIN=https://…vercel.app`, `PORT` |
| 2.4 | Desactivar o proteger `/api-docs` en build DEMO |
| 2.5 | Health: `GET /health` 200 público |
| 2.6 | Smoke API: login seed → token → `GET` protegido |

**Cambios de código esperados (fase implementación, no D0):** CORS allowlist; flag swagger; posiblemente rate-limit login; headers seguridad.  
**Rollback:** suspender servicio API; invalidar secrets.

---

### Etapa 3 — Frontend Vercel (0.5–1 d)

| Paso | Acción |
|------|--------|
| 3.1 | Proyecto Vercel → root `frontend/` |
| 3.2 | Env build: `NEXT_PUBLIC_API_URL=https://api-demo…` ; `INTERNAL_API_URL` coherente con rewrites serverless Vercel (o llamadas directas al API) |
| 3.3 | **Importante:** `NEXT_PUBLIC_*` se congela en `next build` — redeploy si cambia API URL |
| 3.4 | `NEXT_PUBLIC_OFFLINE_DEBUG` **ausente** / `0` |
| 3.5 | Dominio `*.vercel.app` HTTPS automático |

**Validación:** carga `/login`, assets, manifest, SW registrado.  
**Rollback:** unpublish / eliminar proyecto Vercel DEMO.

---

### Etapa 4 — HTTPS, CORS y dominios (0.5 d)

| Paso | Acción |
|------|--------|
| 4.1 | Verificar certificado FE y API |
| 4.2 | CORS solo origen FE exacto (incl. preview si se usa) |
| 4.3 | Cookies/tokens: flujo localStorage existente; no mezclar dominios |
| 4.4 | Opcional custom domain `demo.supertienda…` con DNS |

**GO:** preflight OPTIONS OK; login desde origen FE.

---

### Etapa 5 — Validación PWA (0.5 d)

| Test | Criterio PASS |
|------|----------------|
| Manifest | Instalable / “Add to Home Screen” en Android Chrome |
| SW | Activo; no cachea `/api` |
| Offline shell | Abre rutas clave sin red (según alcance G9) |
| Sync | Tras offline venta → online: 1 sola venta (idempotencia) |
| Update | Nueva versión SW no borra outbox sin política |

**NO-GO PWA:** si API duerme o HTTP mixed content.

---

### Etapa 6 — Smoke tests (1 d) — matriz mínima

| ID | Caso | PASS |
|----|------|------|
| S1 | Login ADMIN / CAJERO seed | 200 + token |
| S2 | Catálogo + stock visible | Datos seed |
| S3 | Venta online | Ticket no fiscal; stock −1 |
| S4 | Offline → online | Sin duplicado |
| S5 | Multiempresa | Sin leak cross-tenant |
| S6 | Caja open/close | Lease coherente |
| S7 | `/api-docs` | 404 o auth |
| S8 | Logout / otro deviceId | Aislamiento razonable |

Registrar evidencia (screenshots + timestamps) en anexo UAT DEMO.

---

### Etapa 7 — Entrega acceso UAT remoto

| Paso | Acción |
|------|--------|
| 7.1 | URL FE + usuarios seed + contraseñas temporales (canal seguro) |
| 7.2 | Brief: “datos ficticios; no SIAT; reportar bugs a …” |
| 7.3 | Ventana horaria + canal soporte |
| 7.4 | Recordatorio: un navegador/perfil por cajero en dispositivo compartido |

---

### Etapa 8 — Retiro / recuperación DEMO

| Escenario | Acción |
|-----------|--------|
| UAT OK / TTL cumplido | Export logs (sin secretos) → borrar Vercel + API + Supabase DEMO → rotar secrets |
| Falla grave (fuga datos / costo) | **Kill switch:** pausar API + Vercel inmediatamente; wipe DB |
| Necesidad reabrir | Recrear desde seed; **nunca** restaurar dump prod |

---

## 4. Plan paralelo — Opción C (UAT presencial, ya viable)

1. `docker compose` lab + imagen FE `st-fe-prod-g94` (o rebuild).  
2. Seed DEMO local si aplica.  
3. Ejecutar matriz G9.4 + firmas humanas.  
4. Sin publicación cloud.

**Criterio:** suficiente si no hay requisito de acceso remoto esta semana.

---

## 5. Cambios de código previstos (implementación futura)

| Área | Cambio | Prioridad |
|------|--------|-----------|
| CORS | Orígenes Vercel DEMO | P0 |
| Swagger | Off en `NODE_ENV=production` DEMO | P0 |
| Rate limit | Login / sync | P1 |
| Headers seguridad | Helmet/CSP FE | P1 |
| Health extendido | DB ping opcional | P2 |
| Serverless adapter | **No** (opción B) | — |

Ninguno de estos se aplica en D0.

---

## 6. Costos orientativos (revalidar)

| Componente | Free | Recomendado DEMO estable |
|------------|------|---------------------------|
| Vercel FE | Hobby $0 | Hobby $0 |
| API | Free (sleep) — **evitar** | Render ~$7/mes o Railway Hobby ~$5+ |
| Postgres | Supabase Free (pause 7d) | Free + keep-alive o Pro ~$25 si UAT larga |
| **Total tip.** | $0 inestable | **~$7–30/mes** |

---

## 7. Criterios GO / NO-GO (implementación)

### GO implementar infra DEMO (opción A)

- Acta CTO firmada.  
- Presupuesto always-on aceptado.  
- Seed ficticio listo.  
- Plan de retiro con fecha.  
- Compromiso: no SIAT / no dinero real.

### NO-GO implementar

- Intención de reutilizar DB remota no inventariada.  
- Solo plan free con sleep para UAT remota crítica.  
- Exigencia fiscal/SIAT en DEMO.  
- Falta owner de secrets/rotación.

### GO UAT (opción C) ahora

- Lab local operativo (G9.4).  
- Sin necesidad de URL pública.

### Tras smoke S1–S8

| Resultado | Decisión |
|-----------|----------|
| PASS ≥ S1–S6 + S7 | **GO UAT remota** |
| FAIL sync/duplicados o CORS/auth | **NO-GO**; rollback Etapa 8 |
| Fuga cross-tenant | **NO-GO crítico**; wipe inmediato |

---

## 8. Rollback rápido (runbook 15 min)

1. Pausar/suspender servicio API.  
2. Unpublish / password-protect Vercel.  
3. Rotar `JWT_SECRET` / `CASH_LEASE_SECRET` (invalida sesiones).  
4. Si sospecha compromiso DB: wipe proyecto DEMO.  
5. Notificar UAT: “DEMO retirada”.  
6. Postmortem en issue GitHub (sin pegar secrets).

---

## 9. Secuencia resumida (timeline sugerido)

| Día | Trabajo |
|-----|---------|
| D0 | Esta auditoría + plan (hecho) — **STOP** |
| D1 | Acta CTO → Etapa 0–1 DB |
| D2 | Etapa 2 API |
| D3 | Etapa 3–4 FE + CORS |
| D4 | Etapa 5–6 PWA + smoke |
| D5 | Etapa 7 entrega UAT |
| D+TTL | Etapa 8 retiro |

---

## 10. Autorización requerida

> **No crear proyectos cloud, no migrar, no publicar en Vercel, no modificar Supabase, no commit/push/deploy** hasta autorización expresa del CTO.

**Firma / acta (plantilla):**

```text
Autorizo implementación DEMO opción A según P2C1D0_DEMO_DEPLOYMENT_PLAN.md
Presupuesto máximo mensual: USD ____
TTL DEMO: ____ días
Uso DB remota existente: [ ] No  [ ] Sí (ID proyecto: ______)
Fecha / CTO: ________
```

---

*Fin plan D0. Detenerse aquí hasta autorización.*
