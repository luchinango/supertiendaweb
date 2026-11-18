# P2-C1.G0 — Preparación del piloto comercial (readiness)

**Fecha:** 17 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Entorno objetivo:** Docker local `supertienda_dev`  
**Dinero real / SIAT / deploy:** **no**  
**Estado:** **GO condicionado** (lab DEMO, no fiscal, no dinero real) — build FE producción local **PASS** tras fix Dockerfile/postcss

Informe complementario: [`P2C1G0_FACTO_INTEGRATION_ASSESSMENT.md`](./P2C1G0_FACTO_INTEGRATION_ASSESSMENT.md)

---

## 1. Matriz de funcionalidades

Clasificación: **IT** = implementada y probada (suites/browser fase) · **IP** = implementada, falta prueba real de campo · **P** = parcial · **N** = no implementada

| Funcionalidad | Estado | Evidencia | Bloqueante piloto |
|---------------|--------|-----------|-------------------|
| Login / roles | **IT** | JWT; DEMO `admin_a`; ADMIN vs EMPLOYEE en sync | No (lab) |
| Catálogo / inventario | **IT** | Pull + STOCK_ADJUST; Vitest offline; P2C1E | Conflictos VERSION → pull/retry |
| Apertura / cierre caja | **IT** | B2-A; bloqueo cierre con provisionales | Cierre remoto offline |
| Ventas online | **IT** | SALE_CREATE + sync; P2C1D/E | No |
| Ventas offline | **IT** | Dexie/outbox; F2 browser | Preparar offline obligatorio |
| Cash lease | **IT** | F1 HTTP 11/11 | TTL 8h; sin revocación aparte de close |
| PWA (arranque offline) | **IP** | F2 PASS en **`next dev`** | **Falta validar `next start`** |
| Outbox / conflictos | **IT** | duplicate vs VERSION_CONFLICT (F3) | Revisión manual de conflicts |
| Cálculos comerciales | **IT** | F3 fórmula alineada FE/BE | Redondeo &lt;0.01 → aviso |
| Comprobantes no fiscales | **IT** | PosReceipt COMPROBANTE NO FISCAL | No confundir con factura |
| Impresión térmica | **IP** | `window.print` + CSS 80/58 mm | Sin impresora real probada |
| Aislamiento multiempresa | **IT** | P2C1E día 6; scope IDB | No |
| SIAT / Facto | **N** | Fuera de alcance POS | N/A piloto no fiscal |
| Build FE producción | **IT** | `docker build …:g0` **PASS** (17/11/2026); smoke `:3001` | No (revalidar PWA offline en `next start` en campo) |

Fuentes: informes P2C1E, F1, F2, F3 y auditoría de código G0.

---

## 2. Pruebas de build local (producción)

### 2.1 Intentos ejecutados

| Intento | Resultado | Error |
|---------|-----------|--------|
| A. `npm run build` dentro de `supertienda-frontend` (volumen `.next` de `next dev`) | **FAIL** | `Cannot find module './548.js'` — `.next` corrupto/mezclado con HMR |
| B. `docker build --target production` (Dockerfile viejo) | **FAIL** | `Cannot find module '@tailwindcss/postcss'` + fallos de resolución de módulos |
| C. Build en `/tmp` (copia incompleta) | **FAIL** | Copias truncadas / faltó `utils` en un intento |
| D. `docker build --target production` (Dockerfile + postcss fix) | **PASS** | Imagen `supertienda-fe-prod-local:g0`; compile OK (~12s) |
| E. Smoke `next start` `:3001` | **PASS** | `/login` `/ventas` `/manifest.webmanifest` `/sw.js` → 200 |

### 2.2 Causas raíz (diagnóstico)

1. **`NODE_ENV=production` antes de `npm ci` en Dockerfile**  
   `@tailwindcss/postcss`, `typescript`, `tailwindcss`, etc. están en **`devDependencies`**. Con `NODE_ENV=production`, `npm ci` **omite** devDeps → Next no puede cargar PostCSS/Tailwind v4.

2. **Dos `postcss.config.*` divergentes**  
   - `postcss.config.js` → `@tailwindcss/postcss` (Tailwind 4)  
   - `postcss.config.ts` (antes) → `tailwindcss` + `autoprefixer` (legado)  
   En build limpio gana el plugin que no está instalado.

3. **Volumen `frontend_next` + `next dev`**  
   Ejecutar `next build` sobre el mismo `.next` que usa el contenedor de desarrollo produce chunks rotos (`548.js`).

4. **Compose no usa imagen `production`**  
   Solo `target: development` → nunca se validó PWA bajo `next start` en informes F2.

### 2.3 Remedios aplicados en repo (G0)

- `frontend/Dockerfile` production-build: `npm ci` **sin** forzar production primero; luego `NODE_ENV=production` + `npm run build` + `npm prune --omit=dev`.
- `postcss.config.ts` alineado a `@tailwindcss/postcss` (igual que `.js`).

### 2.4 Revalidación (completada 17/11/2026)

```bash
docker build -f frontend/Dockerfile --target production \
  --build-arg NEXT_PUBLIC_API_URL=http://127.0.0.1:5000 \
  -t supertienda-fe-prod-local:g0 ./frontend

docker run --rm -d --name st-fe-prod-g0 -p 127.0.0.1:3001:3000 \
  -e NEXT_PUBLIC_API_URL=http://127.0.0.1:5000 \
  --network supertienda-dev_supertienda_net \
  supertienda-fe-prod-local:g0
```

HTTP smoke PASS. Pendiente de campo (no bloquea GO condicionado): flujo PWA offline completo sobre `:3001` (Preparar offline → offline → venta → sync).

**Backend:** compose usa `ts-node-dev`; suites HTTP contra API `:5000` en desarrollo siguen PASS (F1/F3).

---

## 3. Riesgos críticos

| ID | Riesgo | Severidad | Mitigación |
|----|--------|-----------|------------|
| R1 | FE no compilaba en producción (NODE_ENV+devDeps) | Mitigada | Dockerfile: `npm ci` → luego `NODE_ENV=production`; postcss unificado |
| R2 | PWA solo probada en `next dev` | Alta | Escenarios F2 sobre `next start` |
| R3 | Impresión térmica no verificada en hardware | Media | Probar 80 mm antes del piloto |
| R4 | Outbox `VERSION_CONFLICT` huérfano | Media | Capacitar: sync catálogo, no asumir doble cobro |
| R5 | Cierre de caja remoto mientras offline | Media | Procedimiento: no cerrar con pendientes; revisar rechazos |
| R6 | JWT/middleware débil si se expone fuera de lab | Alta si red abierta | Solo 127.0.0.1; usuarios DEMO |
| R7 | Confundir ticket COM con factura | Alta (negocio) | UI “COMPROBANTE NO FISCAL”; sin Facto en piloto |

---

## 4. Requisitos de hardware / entorno (piloto controlado)

| Ítem | Mínimo |
|------|--------|
| PC / tablet | Windows 10+ o Chromebook; 4 GB RAM |
| Navegador | Chrome/Edge reciente (PWA + SW) |
| Red | Wi‑Fi estable para sync; offline solo tras “Preparar offline” |
| Impresora | Térmica USB/Bluetooth 80 mm (preferida); 58 mm opcional |
| Backend | Docker `supertienda_dev` en el mismo host o LAN de lab |
| Usuarios | Solo DEMO (`seed.demo`); **sin dinero real** |

---

## 5. Checklist del piloto (no fiscal)

1. [ ] `docker compose up` saludable (db/backend/frontend)  
2. [x] **Build FE production PASS** + smoke HTTP `/login` `/ventas` manifest/SW en `:3001`  
3. [ ] `db:seed:demo` (solo contenedor backend)  
4. [ ] Login DEMO → sync catálogo → abrir caja → anotar hora (lease 8 h)  
5. [ ] Venta online → ticket `COM-…` no fiscal  
6. [ ] Preparar offline → desconectar → reload `/ventas` → venta provisional → reconectar → sync  
7. [ ] No cerrar caja con ventas pending  
8. [ ] Imprimir un ticket (si hay impresora)  
9. [ ] Registrar conflictos outbox si aparecen  
10. [ ] **No** emitir Facto/SIAT  

---

## 6. GO/NO-GO

| Criterio | Resultado |
|----------|-----------|
| Ventas / caja / stock / multiempresa (dev + suites) | OK |
| Recuperación offline documentada (F2 en next dev) | OK en dev |
| Build + assets PWA en `next start` | **PASS** (HTTP smoke) |
| Flujo offline completo en prod | Pendiente campo (no crítico si se sigue checklist) |
| Fallas críticas abiertas | Ninguna de build |

### Veredicto: **GO condicionado**

- Lab Docker local, usuarios DEMO, **sin dinero real**, **sin Facto/SIAT**.
- Impresión térmica y offline PWA en `:3001` recomendados antes del primer día de piloto.
- Sin commit/push/deploy salvo que se pida explícitamente.
