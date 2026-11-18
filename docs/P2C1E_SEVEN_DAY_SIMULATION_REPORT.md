# P2-C1.E — Simulación comercial integral (7 jornadas)

**Fecha ejecución:** 16–17 de noviembre de 2026 (UTC)  
**Sim ID:** `P2C1E-2026-11-17T00-13-50`  
**Entorno:** Docker `supertienda_dev` · API `127.0.0.1:5000` · FE `127.0.0.1:3000`  
**Evidencia JSON:** [`docs/P2C1E_SIMULATION_EVIDENCE.json`](./P2C1E_SIMULATION_EVIDENCE.json)  
**Runner:** `backend/tests/run-p2c1e-seven-day-simulation.ts` (`npm run test:p2c1e:sim`)

---

## 1. Resumen ejecutivo

Se ejecutaron **siete jornadas comerciales lógicas** (no siete días de calendario) contra el motor real `/sync/push` y PostgreSQL local, usando solo empresas DEMO Norte/Sur/Centro.

| Resultado | Valor |
|-----------|--------|
| Días PASS | **7 / 7** |
| Ventas DEMO confirmadas (SIM) | **15** (Norte 13 · Sur 1 · Centro 1) |
| Stock negativo | **0** |
| Cajas OPEN al final | **0** |
| Duplicados en reintento | Solo `duplicate` idempotente |
| Cross-tenant | Rechazado (`NOT_FOUND`) |

**GO condicionado** para la siguiente fase de endurecimiento (lease de caja / PWA). **NO-GO** producción.

---

## 2. Estado inicial

| Empresa | businessId | BP | Σ stock | Ventas previas | Seq COM | Cajas OPEN |
|---------|------------|----|---------|----------------|---------|------------|
| Norte | 3 | 110 | 3098 | 0 | 0 | 0 |
| Sur | 4 | 110 | 3346 | 0 | 0 | 0 |
| Centro | 5 | 110 | 3091 | 0 | 0 | 0 |

- Contenedores healthy: `supertienda-db`, `supertienda-backend`, `supertienda-frontend`.
- `DATABASE_URL` del backend Docker: `…@db:5432/supertienda_dev` (no remoto).
- Empresas técnicas `9000001016/2016` intactas.
- **Gap corregido antes de operar:** seed DEMO no creaba `COMMERCIAL_TICKET` → añadido a `seed.demo.ts` y re-ejecutado (idempotente, sin borrar ventas/técnicos).

---

## 3. Tabla de resultados por día

| Día | Jornada | Empresa / actores | PASS/FAIL | Hallazgo clave |
|-----|---------|-------------------|-----------|----------------|
| 1 | Ventas online | Norte `demo_admin_1` / `demo-device-norte-01` | **PASS** | 7 ventas · stock 3098→3091 · caja 200 abierta/cerrada |
| 2 | Inventario | Norte admin | **PASS** | STOCK_ADJUST +5/−2 · venta del BP ajustado |
| 3 | Offline→sync | Norte admin | **PASS** | 3 UUID provisionales · push · retry=`duplicate` · 1 venta c/u |
| 4 | Conflictos | Norte admin | **PASS** | `PRICE_MISMATCH` + `INSUFFICIENT_STOCK` · stock intacto |
| 5 | Dos usuarios | Admin + Emp · devices distintos | **PASS** | 2 cajas · stock 21→17 · COM distintos |
| 6 | Multiempresa | Sur + Centro | **PASS** | Ventas propias · cross-tenant rechazado |
| 7 | Conciliación | DEMO | **PASS** | open=0 · neg=0 · Δstock Norte=12 = ventas 15 − ajuste neto +3 |

---

## 4. Ventas ejecutadas (Norte, SIM)

| COM | Total Bs | Device |
|-----|----------|--------|
| COM-00000001 … 00000007 | Día 1 (7×) | demo-device-norte-01 |
| COM-00000008 | Día 2 | demo-device-norte-01 |
| COM-00000009 … 00000011 | Día 3 (3×) | demo-device-norte-01 |
| COM-00000012 | Día 5 admin qty2 | demo-device-norte-01 |
| COM-00000013 | Día 5 emp qty2 | demo-device-norte-emp-01 |

Sur: 1 venta · Centro: 1 venta. Totales Sur/Centro Bs 7.63 / 9.89.

ClientOperationIds y localSaleIds: ver JSON de evidencia.

---

## 5. Inventario inicial / final

| Empresa | Σ stock inicial | Σ stock final | Δ |
|---------|-----------------|---------------|---|
| Norte | 3098 | **3086** | **−12** |
| Sur | 3346 | 3345 | −1 |
| Centro | 3091 | 3090 | −1 |

**Conciliación Norte:** unidades vendidas SIM = **15**; ajuste neto Día 2 = **+3** (+5−2); 15 − 3 = **12** = Δ stock. Coherente.

---

## 6. Movimientos de caja

- Cada jornada con ventas abrió caja online (`CASH_OPEN`) y cerró (`CASH_CLOSE`) con `closingAmount = currentAmount` servidor.
- Día 5: dos cajas OPEN concurrentes (admin vs employee, devices distintos) → cerradas ambas.
- Final: **0** cajas OPEN en DEMO.
- Efectivo de caja incrementó exactamente con `totalAmount` servidor (incluye IVA) por cada `SALE_CREATE` applied.

---

## 7. Resultados offline

### Motor / outbox (ejecutado)

Día 3 simuló cola offline: UUID generados **antes** del push; luego sync; reintento mismo payload → `duplicate` sin segundo descuento de stock.

### Navegador

| Prueba | Resultado |
|--------|-----------|
| Venta offline en SPA ya cargada (P2-C1.D) | Validada previamente PASS |
| **Reload / cold start sin red** (`Network.offline` + navigate `/ventas`) | **FAIL de arranque** → `chrome-error://` |

**Limitación documentada:** sin Service Worker / PWA, Next.js **no** arranca ni recarga la shell sin red. El soporte offline actual es **post-carga** (IndexedDB + outbox), no arranque offline completo. No se implementó SW en esta fase.

Bloqueo de cierre con pendientes: validado en UI P2-C1.D; en simulación HTTP las provisionales se sincronizaron antes del close.

---

## 8. Conflictos

| Caso | Código | Stock tras reject |
|------|--------|-------------------|
| Precio manipulado | `PRICE_MISMATCH` | Sin cambio |
| Qty > available | `INSUFFICIENT_STOCK` | Sin cambio |
| Cross-tenant venta caja ajena | `NOT_FOUND` | N/A |
| GET open user Norte + device Sur | `open: null` | N/A |

---

## 9. Aislamiento multiempresa

- Sur y Centro operaron con catálogo/caja/COM propios.
- Token Norte no pudo vender usando `cashRegisterId` de Sur.
- Lectura de caja abierta es device+user scoped.

---

## 10. Correcciones realizadas

1. **`seed.demo.ts`:** crea `BusinessDocumentSequence` `COMMERCIAL_TICKET` por empresa DEMO (bloqueaba `SALE_CREATE`).
2. **Runner `test:p2c1e:sim`:** automatiza las 7 jornadas con asserts + SQL solo-lectura + evidencia JSON.

Sin migraciones, sin reinicio de secuencias, sin DELETE de datos técnicos.

---

## 11. Pruebas automatizadas (post-simulación)

| Suite | Resultado |
|-------|-----------|
| FE `tsc` | PASS |
| BE `tsc` | PASS |
| `test:p2c1e:sim` | **7/7 PASS** |
| `test:p2c1b2a:http` | **16/16 PASS** |
| `test:p2c1b2b:http` | **5/5 PASS** |
| `test:p2c1c:offline` | **8/8 PASS** |
| `test:offline` | **41/41 PASS** |

---

## 12. Riesgos pendientes

1. **Sin cash lease server-side** — TTL cliente 8 h sigue siendo la defensa offline.
2. **Sin PWA/SW** — no hay cold start offline.
3. **Estimación IVA UI 13%** vs taxRate por producto — servidor es autoridad.
4. Día 3 offline fue **equivalente de outbox vía HTTP**, no repetición completa del flujo IndexedDB en esta corrida (cubierto en C1.C/D).

---

## 13. GO / NO-GO

### **GO** para fase siguiente de producto (endurecimiento / UX / lease)

No se detectaron inconsistencias de dinero, stock negativo ni ventas duplicadas en la simulación SIM `P2C1E-2026-11-17T00-13-50`.

### **NO-GO** producción / SIAT / multi-caja LAN

---

**Sin commit / push / deploy / migraciones / restore.**
