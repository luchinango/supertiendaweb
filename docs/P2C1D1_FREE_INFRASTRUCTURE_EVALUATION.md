# P2-C1.D1 — Evaluación de infraestructura DEMO gratuita (USD 0)

**Fecha:** 2026-11-19  
**Repositorio:** `C:\Proyectos\supertiendaweb` · GitHub `luchinango/supertiendaweb`  
**Alcance:** Solo auditoría y planificación. Sin código, cloud create, migraciones, Prisma CLI Windows, commit/push/deploy ni tarjetas.  
**Presupuesto:** **USD 0** (sin planes de pago, sin trials que exijan tarjeta, sin créditos que deriven en cargo).  
**Referencias:** `P2C1D0_DEPLOYMENT_ARCHITECTURE_AUDIT.md`, `P2C1D0_DEMO_DEPLOYMENT_PLAN.md`, `P2C1G9_4_UX_CONSOLIDATION_REPORT.md`, `P2C1G9_4_UAT_READINESS_MATRIX.md`.

Fuentes de precios/límites: documentación pública consultada **2026-11-19** (Vercel, Supabase, Render, Neon, Koyeb, Oracle, Fly.io). Donde el vendor no aclara tarjeta en la página de pricing, se marca **parcialmente verificado**.

---

## 0. Respuestas directas (resultado esperado)

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 1 | ¿Podemos publicar SuperTienda en internet por USD 0? | **Sí, con limitaciones fuertes** (API free que duerme + DB free que pausa/escala a cero). Viable como DEMO de humo / preview, **no** como UAT remota fiable de POS offline. |
| 2 | ¿Qué proveedores gratuitos concretos lo permiten? | **Vercel Hobby** (FE) + **Render Free** (API Express) + **Supabase Free** o **Neon Free** (Postgres). |
| 3 | ¿Exigen tarjeta bancaria? | Vercel Hobby / Render Free / Neon Free: **no** para iniciar. Supabase Free: **no** para plan Free (tarjeta solo planes pagos). Oracle / Koyeb nuevos / Fly post-trial: **sí o riesgo de cargo → descartados**. |
| 4 | ¿Qué limita al POS y sync? | Cold start API ~**1 min** (Render Free), sleep 15 min idle; Neon scale-to-zero ~5 min; Supabase pause ~7 días inactividad; RAM API **512 MB**; timeouts/reintentos outbox; riesgo UX de “venta colgada”. |
| 5 | ¿Cambios mínimos de código? | CORS origen Vercel; secrets fuertes; Swagger off/protegido; rate-limit login; `DATABASE_URL` con pooler; env FE `NEXT_PUBLIC_API_URL`; **no** convertir a serverless. |
| 6 | ¿DEMO web gratis o UAT local? | **Preferible UAT local (C0)** para integridad de ventas/sync. DEMO web gratis solo si se acepta inestabilidad explícita. |
| 7 | ¿Siguiente paso seguro? | Completar **UAT presencial G9.4** en Docker; opcional **hardening local P0** antes de cualquier publicación free; **no** publicar sin acta + aceptación de límites. |

---

## 1. Fase 1 — Requisitos técnicos verificados en código

### 1.1 Backend Express

| Requisito | Evidencia | Implicación free hosting |
|-----------|-----------|--------------------------|
| Proceso Node persistente | `server.ts` → `app.listen(PORT)` | Necesita **web service** Node/Docker, no Functions |
| Express 5 + TSOA | `app.ts`, `RegisterRoutes` | Compatible Render Free Node/Docker |
| Build | `npm run build` / `build:full` (tsoa + prisma generate + tsc) | Build en CI del host; minutos de pipeline limitados |
| Start prod | `node dist/src/index.js` (Dockerfile production) | OK |
| Cron / jobs | Schedules de mermas **comentados** en `server.ts` | No requiere worker 24/7 para DEMO corta |
| WebSockets | No encontrados | No depende de WS para mantener vivo el servicio |
| Memoria | Sin medición formal en repo; Express+Prisma tip. >200–400 MB | **512 MB** Render Free es justo; riesgo OOM bajo carga |
| CPU | Sin métricas en repo | Free ~0.1 CPU → sync concurrente lento |

### 1.2 Prisma + PostgreSQL remoto

| Ítem | Evidencia | Nota |
|------|-----------|------|
| Cliente | `PrismaClient` en `config/prisma.ts` | Compatible con Postgres remoto vía `DATABASE_URL` |
| Connect | `connectDB()` en **cada request** (`app.ts` middleware) + `$connect` | En cold DB (Neon) añade latencia; fallo → `process.exit(1)` (**peligroso** en free) |
| Pool config | `DB_MAX_CONNECTIONS` en `config/app.ts` | **No** se pasa automáticamente al PrismaClient; hay que poner `connection_limit` / usar **pooler** en URL |
| Migraciones | Scripts `db:migrate:deploy` | Remoto: solo desde Linux/CI/Docker (política: no Prisma CLI Windows) |

### 1.3 Auth, CORS, dominios cruzados

| Ítem | Evidencia |
|------|-----------|
| CORS | Allowlist localhost + `CORS_ORIGIN` (`app.ts`) — **hay que ampliar** al origen Vercel |
| JWT | `JWT_SECRET` obligatorio en production (`validateConfig`) |
| Cash lease | `CASH_LEASE_SECRET` o `JWT_SECRET` en production |
| FE API | `api-client` usa `baseURL: '/api'` (rewrite same-origin); POS/sync usa `NEXT_PUBLIC_API_URL` absoluto |
| Dominios distintos | **Sí, posible:** FE en `*.vercel.app`, API en `*.onrender.com`, con CORS + HTTPS |

### 1.4 PWA / offline / idempotencia

| Ítem | Estado |
|------|--------|
| Manifest + `sw.js` | Presentes; HTTPS público requerido para install móvil |
| Dexie outbox | Client-side; sync depende de API alcanzable |
| Idempotencia | Diseñada para reintentos; **mitiga** duplicados si API vuelve, pero no elimina UX de espera/cold start |
| No modificar motor sync | Restricción D1 respetada en evaluación |

### 1.5 Conclusión técnica previa a cloud

El stack **puede** vivir en free tiers **si** se acepta servicio API intermitente. **No** es equivalente al always-on de D0 opción A de pago. Serverless Express sigue **fuera de alcance**.

---

## 2. Fase 2 — Proveedores gratuitos (verificación 2026-11-19)

### 2.1 Matriz de proveedores

| Proveedor | Rol posible | Costo mensual | Tarjeta | Riesgo de cargo | Limitación crítica | Veredicto USD 0 |
|-----------|-------------|---------------|---------|-----------------|--------------------|-----------------|
| **Vercel Hobby** | Frontend Next | $0 | No requerida para Hobby | Bajo si no se pasa a Pro | ToS: uso **personal/non-commercial**; límites de uso; pause features al exceder | **Aceptable** para DEMO no comercial |
| **Supabase Free** | Postgres DEMO | $0 | No para Free; sí para pagos | Bajo si se permanece en Free | Pause ~**1 semana** inactividad; 500 MB; 2 proyectos; Shared CPU / 500 MB RAM | **Aceptable** con keep-alive ligero o UAT corta |
| **Neon Free** | Postgres DEMO | $0 | No | Bajo (sin overage; suspende compute) | Scale-to-zero **5 min**; 100 CU-h/mes; cold query | **Aceptable**; cold DB + cold API = peor UX |
| **Render Free** | API Express | $0 | No para iniciar | **Si hay tarjeta** y se excede bandwidth → factura; **sin tarjeta** → suspende | Sleep **15 min**; wake ~**1 min**; 512 MB RAM; 750 h/mes; Free Postgres **expira 30 días** | **Único API free viable** encontrado sin tarjeta |
| **Render Free Postgres** | DB | $0 | No | Upgrade o pérdida a 30 días | Expira 30d → presión a pagar | **No preferido** (usar Supabase/Neon) |
| **Koyeb** | API | Pro ~$29+ | **Sí** (nuevos) | Sí | Free cerrado a nuevos / exige pago | **Descartado** |
| **Oracle Always Free** | VM API+DB | $0 Always Free | **Sí** (mayoría) | Hold autorización; trial $300 30d | Exige tarjeta → viola restricción proyecto | **Descartado** |
| **Fly.io** | API | Trial $1 / luego payg | Trial sin; luego **sí** | Waiver <$5 tras tarjeta; no es $0 garantizado | No free durable sin tarjeta | **Descartado** |
| **Railway** | API | Créditos/sleep | Típicamente sí | Créditos → pago | (D0) always-on de pago | **Descartado** bajo USD 0 |

### 2.2 Detalle Render Free (API) — impacto POS

Fuente: [render.com/docs/free](https://render.com/docs/free) (consultado 2026-11-19).

- Spin-down tras **15 minutos** sin HTTP.
- Spin-up ~**1 minuto** (página de carga del proveedor).
- 750 instance-hours/mes (suficiente para 1 servicio si no corre 24/7 idle-burn; spun-down no consume horas).
- Bandwidth: exceso **sin** payment method → **suspensión** (cumple USD 0); **con** tarjeta → **cargo** → **prohibido añadir tarjeta**.
- Free web service puede ser suspendido por alto tráfico **saliente** (p. ej. mucho tráfico a DB externa).
- Reinicios arbitrarios posibles.

**Efecto en SuperTienda:** primer login / sync tras idle = espera larga; outbox reintenta (idempotencia ayuda); UAT remota “en frío” se percibe rota.

### 2.3 Detalle DB free

| | Supabase Free | Neon Free |
|--|---------------|-----------|
| Pause proyecto | ~7 días poca actividad | No pause proyecto |
| Compute idle | Sigue “activo” hasta pause | Scale-to-zero 5 min |
| Cold start | Tras pause manual resume | ~cientos de ms–segundos al despertar |
| Storage | 500 MB | 1 GB/proyecto |
| Pooling | Pooler disponible (recomendado Prisma) | Pooler / serverless driver tip. |
| Tarjeta Free | No para Free | No |

**Preferencia DB DEMO free:** Supabase Free **si** hay actividad diaria UAT; Neon Free **si** se tolera cold DB y se quiere evitar pause semanal. En ambos casos: **proyecto nuevo**, seed ficticio, secrets nuevos.

### 2.4 Vercel Hobby — ToS

Hobby: uso **personal o non-commercial** ([vercel.com/legal/terms](https://vercel.com/legal/terms)). Una DEMO interna de producto comercial es zona gris: para UAT técnica no comercial puede ser defendible; **venta/producción comercial en Hobby = NO-GO**.

### 2.5 NO VERIFICADO / fuera de alcance

- Cuota exacta de outbound bandwidth incluido en workspace Render Hobby (existe; cifra exacta del workspace: **verificar en dashboard** al crear cuenta — no inventada aquí).
- Disponibilidad regional concreta LatAm de cada free tier al momento del alta.
- Si GitHub Student Pack u otros créditos aplican (no usados; suelen exigir cuenta y pueden convertir a pago).

---

## 3. Fase 3 — Comparación de arquitecturas a USD 0

### A0 — Vercel Free + API Free + Postgres Free

```text
UAT remoto
   │ HTTPS
   ▼
Vercel Hobby (Next 15) ──CORS──► Render Free (Express+Prisma)
                                      │
                                      ▼
                              Supabase Free  o  Neon Free
                              (Postgres DEMO aislado)
```

| Criterio | Evaluación |
|----------|------------|
| Compatibilidad código | Alta con cambios CORS/env/swagger; **sin** serverless |
| Cambios | Medios (seguridad P0 + env); build FE con API URL pública |
| Costo | **USD 0** si **nunca** se añade tarjeta ni se upgradéa |
| Estabilidad | **Baja–media** (sleep API + posible cold DB) |
| UX UAT | Fría al despertar; OK en sesión continua |
| PWA install | Sí (HTTPS) |
| Offline + sync | Funcional **si** API despierta a tiempo; riesgo timeouts/UX |
| UAT remota fiable | **Débil** |
| Riesgo integridad ventas | Mitigado por idempotencia; **no** eliminado (reintentos + leases bajo latencia) |

**Veredicto A0:** Técnicamente **posible**. Operativamente **GO solo como DEMO soft / preview**, con aceptación escrita de sleep. **NO-GO** como sustituto de UAT G9.4 presencial.

### C0 — Docker local, sin publicación

| Criterio | Evaluación |
|----------|------------|
| Compatibilidad | Ya validada G1–G9.4 (`st-fe-prod-g94`) |
| Costo | USD 0 |
| Estabilidad | Alta en lab |
| PWA | Limitada sin HTTPS público (install móvil plena débil en HTTP local) |
| Offline/sync | **Mejor entorno** para validar integridad |
| UAT remota | No |
| Túneles (ngrok etc.) | **Prohibidos** por brief (exposición PC) |

**Veredicto C0:** **Recomendado** para cumplir UAT humana supervisada bajo presupuesto 0.

### H0 — Híbrida gratuita adicional

Opciones consideradas:

| Variante | ¿Viable? | Motivo |
|----------|----------|--------|
| FE Vercel + API local vía túnel | **No** | Expone PC; prohibido |
| Solo FE estático sin API | **No** | POS/sync inutilizable |
| FE+API+DB todos en Oracle Always Free | **No** | Exige tarjeta |
| FE Vercel + API Render Free + DB Neon (sin Render Postgres) | **Sí** | Es **A0** con Neon; evita expiry 30d de Render Postgres |

**H0 útil = A0 con Neon o Supabase** (misma arquitectura; elección de DB). No hay híbrida gratuita más segura sin presupuesto.

---

## 4. Fase 4 — Seguridad DEMO (bloqueantes P0)

Antes de cualquier URL pública free:

| ID | Bloqueante P0 | Acción |
|----|---------------|--------|
| P0-1 | DB/secrets de lab o prod | Proyecto DB **nuevo**; `JWT_SECRET` / `CASH_LEASE_SECRET` nuevos |
| P0-2 | CORS abierto o solo localhost | `CORS_ORIGIN` = origen Vercel exacto |
| P0-3 | `/api-docs` público | Deshabilitar o autenticar |
| P0-4 | Sin rate-limit login | Middleware mínimo en auth |
| P0-5 | Datos reales | Solo `seed.demo` / ficticios |
| P0-6 | Tarjeta en cuentas free | **Nunca** añadir payment method (Render/Vercel/Supabase/Neon) |
| P0-7 | Logs con tokens | Redacción; no loguear Authorization |
| P0-8 | Multiempresa | Mantener aislamiento; smoke S5 |

Riesgos residuales free: scraping API dormida al despertar; abuso bandwidth → suspensión; ToS Hobby.

---

## 5. Impacto en POS / sync / PWA (detalle)

| Escenario | Comportamiento esperado |
|-----------|-------------------------|
| Usuario abre DEMO tras 20 min idle | Espera ~1 min wake Render; posible timeout cliente; reintento |
| Venta offline → online tras idle | Outbox reintenta; idempotencia debe impedir duplicado; UX “sincronizando…” prolongada |
| Neon dormido + API dormida | Doble cold start; primer request peor |
| Sesión UAT continua >15 min con tráfico | API permanece up; experiencia cercana a lab |
| Supabase sin tráfico 7 días | Pause; DEMO “muerta” hasta resume manual |
| PWA install Android | OK con HTTPS Vercel; sync sigue dependiendo de API free |

**Conclusión:** free hosting **rompe la premisa de D0** (“API always-on”) que protegía la calidad UAT remota. Con USD 0, la calidad se degrada de forma estructural.

---

## 6. Cambios mínimos de código (solo listado; no implementar en D1)

1. `CORS_ORIGIN` / allowlist dominio Vercel.  
2. Flag desactivar Swagger en production DEMO.  
3. Rate-limit en `/auth/login` (y opcional sync).  
4. Documentar `DATABASE_URL` con connection pooler (Supabase/Neon).  
5. Evitar `process.exit(1)` agresivo en fallos transient de DB en cold start (**deseable**).  
6. Env FE: `NEXT_PUBLIC_API_URL=https://…onrender.com` en build Vercel; `NEXT_PUBLIC_OFFLINE_DEBUG` ausente.  
7. Rewrites Vercel: o bien proxy `/api` → API (timeout 120s) o confiar en llamadas absolutas ya usadas por sync.

**Fuera de alcance D1/D0:** adaptar Express a serverless.

---

## 7. Dictamen económico

| Arquitectura | USD 0 realista | Calidad UAT | Recomendación |
|--------------|----------------|-------------|----------------|
| A0 free stack | Sí, sin tarjeta | Baja–media | Solo DEMO soft |
| C0 Docker | Sí | Alta (lab) | **Preferida** |
| A always-on pago (D0) | No (presupuesto) | Alta remota | Bloqueada por presupuesto |
| B serverless | N/A | Riesgo alto | Descartada |

---

## 8. Recomendación CTO (evaluación)

1. **No** comprometer integridad de ventas para “hacer caber” free hosting.  
2. **Priorizar C0** + matriz G9.4 firmada.  
3. Tratar A0 como **experimento opcional** post-hardening, con acta de aceptación de sleep/cold start y política **cero tarjetas**.  
4. Si en el futuro hay ≥ ~$7/mes: volver al plan D0 always-on.

Plan operativo: `P2C1D1_ZERO_COST_DEMO_PLAN.md`.

---

*Fin evaluación D1. Sin implementación.*
