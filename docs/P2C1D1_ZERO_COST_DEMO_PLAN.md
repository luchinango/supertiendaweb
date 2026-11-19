# P2-C1.D1 — Plan DEMO a costo cero (USD 0)

**Fecha:** 2026-11-19  
**Referencia:** `P2C1D1_FREE_INFRASTRUCTURE_EVALUATION.md`  
**Estado:** Plan únicamente. **No implementar** sin autorización CTO + aceptación de limitaciones free.  
**Presupuesto:** USD 0 · **Prohibido** añadir tarjetas / upgradear planes / trials con hold bancario.

---

## 0. Arquitectura recomendada bajo USD 0

### Primaria (calidad UAT): **C0 — Docker local**

```text
[UAT presencial]
   → FE http://127.0.0.1:3001 (next start / imagen g94)
   → API http://127.0.0.1:5000
   → Postgres compose (red interna)
```

Sin internet público. Cumple presupuesto. Alineado a matriz G9.4.

### Secundaria (preview remoto, opcional): **A0 — stack free**

```text
[UAT / demo remoto]
        │ HTTPS
        ▼
 Vercel Hobby (frontend Next)
        │ CORS + JWT + X-Device-Id
        ▼
 Render Free (Express + Prisma)   ← duerme a los 15 min
        │ DATABASE_URL (pooler)
        ▼
 Supabase Free  Ó  Neon Free      ← pause 7d  /  scale-to-zero 5 min
 (proyecto DEMO nuevo, seed ficticio)
```

**Condición de uso A0:** stakeholders aceptan por escrito cold start ~1 min, inestabilidad sync, y ToS Hobby non-commercial.

---

## 1. Requisitos previos (ambos caminos)

| Requisito | C0 | A0 |
|-----------|----|----|
| Acta CTO | UAT local | UAT local + “acepto límites free + cero tarjeta” |
| Datos ficticios | Sí | Sí |
| Secrets fuera de Git | Sí | Sí (vault del proveedor) |
| Sin SIAT / dinero real | Sí | Sí |
| Sin túneles al PC | N/A | Obligatorios de no usar |
| Hardening P0 (CORS, swagger, rate-limit, secrets) | Recomendado | **Obligatorio** antes de URL pública |

---

## 2. Plan C0 — UAT presencial (secuencia recomendada YA)

| Paso | Acción | Criterio PASS |
|------|--------|---------------|
| C0.1 | Levantar compose + FE prod lab (`st-fe-prod-g94` o rebuild) | `/health` 200; login seed |
| C0.2 | Confirmar seed DEMO / usuarios ficticios | Credenciales solo `docs/internal/` |
| C0.3 | Ejecutar matriz `P2C1G9_4_UAT_READINESS_MATRIX.md` | Firmas cajero/admin |
| C0.4 | Registrar FAIL/OK; no cerrar cajas ajenas | Acta UAT |
| C0.5 | Decisión producto | UAT aprobada o backlog |

**Rollback C0:** `docker compose down` (sin borrar volúmenes salvo wipe explícito DEMO).

**GO C0 ahora:** **Sí** (técnico G9.4 condicionado; falta firma humana).

---

## 3. Plan A0 — DEMO web gratuita (solo si se autoriza después)

### 3.1 Política anti-cargo (no negociable)

1. Crear cuentas **sin** payment method.  
2. Nunca upgradear a Pro / paid compute.  
3. Si el proveedor pide tarjeta para continuar → **detener** y retirar DEMO.  
4. Preferir DB **Supabase Free** o **Neon Free**; **evitar** Render Free Postgres (expira 30 días → presión a pagar).  
5. Monitorear emails de límite bandwidth; ante suspensión, no “arreglar” con tarjeta.

### 3.2 Etapas de implementación (futura)

#### Etapa 1 — Preparación local (0.5–1 d)

- Inventariar `.env` locales; **no** reutilizar secrets remotas existentes.  
- Branch opcional `demo/free-a0` (sin push hasta auth).  
- Checklist P0 seguridad (ver §4).

#### Etapa 2 — Hardening mínimo (código; requiere auth implementación)

| Cambio | Prioridad |
|--------|-----------|
| CORS allowlist origen Vercel | P0 |
| Swagger off en production DEMO | P0 |
| Rate-limit login | P0 |
| Secrets production obligatorios | P0 |
| `DATABASE_URL` + pooler documentado | P0 |
| Mitigar `process.exit(1)` en cold DB (opcional P1) | P1 |
| **No** serverless Express | — |

#### Etapa 3 — Base DEMO

1. Crear proyecto **nuevo** Supabase Free **o** Neon Free.  
2. Guardar connection string **solo** en env del API host.  
3. Migraciones: `prisma migrate deploy` desde **Linux/CI/Docker** (no Windows host).  
4. `db:seed:demo` → empresas/usuarios/productos ficticios.  
5. Verificar aislamiento; cero PII real.

#### Etapa 4 — API en Render Free

1. Web Service Free → repo `backend/` (Dockerfile production o Node build).  
2. Env: `NODE_ENV=production`, `PORT`, `DATABASE_URL`, `JWT_SECRET`, `CASH_LEASE_SECRET`, `CORS_ORIGIN=https://<proyecto>.vercel.app`.  
3. Health `GET /health`.  
4. **No** añadir tarjeta.  
5. Smoke: login + endpoint autenticado (aceptar cold start).

#### Etapa 5 — Frontend en Vercel Hobby

1. Proyecto → root `frontend/`.  
2. Env build: `NEXT_PUBLIC_API_URL=https://<api>.onrender.com`.  
3. Sin `NEXT_PUBLIC_OFFLINE_DEBUG`.  
4. Deploy; HTTPS `*.vercel.app`.  
5. Confirmar ToS Hobby: uso DEMO no comercial.

#### Etapa 6 — Dominios / HTTPS / CORS

- Preflight OPTIONS desde origen FE → 204/200.  
- Login desde navegador real (no solo curl).  
- Sin mixed content.

#### Etapa 7 — Validación PWA

| Test | PASS |
|------|------|
| Manifest + SW en HTTPS | Registrado |
| Add to Home Screen (Android) | Instalable |
| Shell offline | Rutas clave |
| SW no cachea `/api` | Confirmado |

#### Etapa 8 — Ventas online / offline / sync

| ID | Caso | PASS |
|----|------|------|
| F1 | Venta online (API ya caliente) | Ticket; stock −1 |
| F2 | Forzar idle API 15+ min → login | Wake ≤ ~2 min o FAIL documentado |
| F3 | Offline sale → online | **Una** venta (idempotencia) |
| F4 | Multiempresa | Sin leak |
| F5 | `/api-docs` | 404 o auth |

**Si F3 falla por timeout/duplicado:** **NO-GO** publicación; rollback; volver a C0.

#### Etapa 9 — UAT remota (acotada)

- Brief usuarios: “primera carga puede tardar ~1 minuto”.  
- Sesiones preferiblemente **continuas** (evitar idle).  
- No sustituye firmas de matriz G9.4 local si el objetivo es validar POS.

#### Etapa 10 — Rollback / retiro

| Acción | Orden |
|--------|-------|
| Suspender/borrar servicio Render | 1 |
| Unpublish / borrar proyecto Vercel | 2 |
| Pause/wipe proyecto Supabase/Neon | 3 |
| Rotar secrets (aunque se borren) | 4 |
| Notificar UAT | 5 |
| Postmortem sin secretos | 6 |

---

## 4. Seguridad — checklist pre-publicación A0

- [ ] DB DEMO aislada (proyecto nuevo)  
- [ ] Seed solo ficticio  
- [ ] `JWT_SECRET` / `CASH_LEASE_SECRET` nuevos (≥32 bytes aleatorios)  
- [ ] CORS estricto (un origen)  
- [ ] Swagger off  
- [ ] Rate-limit auth  
- [ ] HTTPS FE + API  
- [ ] Sin payment methods en ninguna cuenta  
- [ ] Logs sin Authorization / passwords  
- [ ] Plan de retiro con fecha (TTL, p. ej. 14 días)  
- [ ] Acta CTO firmada  

**Sin checklist completo → NO-GO publicar.**

---

## 5. Riesgos residuales A0 (aceptación explícita)

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Cold start API ~1 min | Alta UX | Brief UAT; no usar para demos en vivo “imprescindibles” |
| Neon/Supabase cold o pause | Media | Preferir sesión activa; resume manual |
| OOM 512 MB | Media | Smoke bajo carga; 1–2 usuarios UAT |
| Suspensión bandwidth | Media | Pocos testers; sin tarjeta |
| ToS Vercel Hobby | Media | Solo DEMO no comercial |
| Duplicación venta bajo reintento extremo | Baja–media* | No tocar motor; abortar si F3 falla |

\*Idempotencia mitiga; no garantiza UX perfecta bajo free sleep.

---

## 6. Criterios GO / NO-GO (dictámenes separados)

### 6.1 Arquitectura DEMO gratuita (A0)

| Dimensión | Dictamen |
|-----------|----------|
| Viabilidad técnica | **GO condicionado** (Express en Render Free + FE Vercel + DB free) |
| Disponibilidad gratuita verificada | **GO** Vercel Hobby + Render Free + Supabase/Neon Free (2026-11-19) |
| Seguridad | **GO solo tras P0 hardening** |
| Estabilidad | **NO-GO para UAT crítica**; **GO** para preview soft |
| Preparación operativa | **NO-GO ahora** (falta hardening + acta) |

**Dictamen global arquitectura free:** **GO CONDICIONADO / NO recomendada como camino principal.**

### 6.2 Iniciar hardening local (P0)

| | |
|--|--|
| **GO** | Sí, en lab, sin publicar — prepara C0 y eventual A0 |
| Alcance | CORS configurable, swagger gate, rate-limit, secrets docs |
| Restricción | Requiere autorización de **implementación** (D1 no implementa) |

### 6.3 Publicar DEMO remota (A0)

| | |
|--|--|
| **NO-GO inmediato** | Hasta: acta CTO + P0 + smoke F1–F5 + cero tarjetas |
| Tras eso | **GO DÉBIL** solo como DEMO soft |

### 6.4 UAT presencial (C0)

| | |
|--|--|
| **GO** | Sí — entorno G9.4; ejecutar matriz humana |

### 6.5 Producción comercial

| | |
|--|--|
| **NO-GO** | Absoluto (dinero real, SIAT, Hobby ToS, free sleep, sin always-on) |

---

## 7. Árbol de decisión CTO

```text
¿Hay presupuesto ≥ ~$7/mes API always-on?
  SÍ → Plan D0 opción A (pago) cuando se autorice
  NO → ¿Se necesita URL pública ya?
         NO → C0 UAT local (RECOMENDADO)
         SÍ → ¿Se acepta cold start + inestabilidad sync?
                NO → NO publicar; C0 únicamente
                SÍ → Hardening P0 → A0 free → smoke F1–F5
                     FAIL F3 → rollback → C0
```

---

## 8. Siguiente paso técnicamente seguro

1. **Autorizar UAT presencial C0** y completar firmas G9.4.  
2. Opcional: autorizar **hardening local P0** (sin deploy).  
3. **No** crear proyectos Vercel/Render/Supabase hasta nueva acta que acepte límites A0.  
4. Reevaluar si aparece presupuesto always-on (volver a D0).

---

## 9. Plantilla de acta (A0)

```text
Autorizo DEMO A0 a USD 0 según P2C1D1_ZERO_COST_DEMO_PLAN.md
Acepto: sleep API ~15 min, wake ~1 min, posible pause/cold DB.
Compromiso: NINGUNA tarjeta en cuentas cloud.
TTL DEMO: ____ días
Hardening P0 completado: [ ] Sí
Fecha / CTO: ________
```

---

*Fin plan D1. Detenerse. Sin implementación ni deploy.*
