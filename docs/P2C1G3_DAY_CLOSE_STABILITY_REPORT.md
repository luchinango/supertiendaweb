# P2-C1.G3 — Cierre de jornada y estabilidad del piloto DEMO

**Fecha:** 17–18 de noviembre de 2026  
**Entorno:** Docker `supertienda_dev` + FE prod `supertienda-fe-prod-local:g2` en `127.0.0.1:3001`  
**Dinero real / FactuBO / SIAT / commit / deploy / re-seed:** **no**

---

## Veredicto

### **GO** para continuidad del piloto DEMO supervisado

Sync **25/25** tras aislar S25. Jornada DEMO (abrir → ventas online/offline → sync → cerrar → reabrir) **PASS real**. Multiempresa con logout de UI: deviceId persistente; aislamiento A/B OK. Conciliación SQL de solo lectura cuadra (3 COM × 16,95 = 50,85; caja 100→150,85; 3 movimientos de inventario).

---

## 1. Sync S25 (regresión)

| Ítem | Detalle |
|------|---------|
| Aserción antigua | `BP seed precios/stocks intactos (ids 1-4)` → snapshot fijo `1:8.50:100,…` |
| Causa del FAIL | Stocks DEMO ids 1–4 mutados legítimamente por ventas del piloto G1/G2 |
| Fix | Crear sentinela `P2C01-SENTINEL-{runTag}` al inicio de la suite; S25 afirma `custom_price:current_stock` del sentinela |
| Regla | No tocar existencias DEMO ni re-seed |
| Resultado | **25/25 PASS** (`S25 Sentinel BP de suite intacto (no seed DEMO)`) |

Archivo: `backend/tests/run-p2c01-sync-http.ts`

---

## 2. Persistencia multiempresa (Chromium + `next start`)

Logout **solo UI** (sin `localStorage.clear` / sin borrar IDB).

| Paso | Resultado | Evidencia |
|------|-----------|-----------|
| Login A | **PASS real** | Ada AdminA |
| Logout UI → login | **PASS real** | URL `/login` |
| Login B, sin Aceite A | **PASS real** | Bruno; catálogo sin SKU-A |
| Volver a A | **PASS real** | Ada |
| `supertienda_device_id` estable A→B→A | **PASS real** | `4de3fef4-…` = mismo valor |
| Lista COM al volver (antes de ventas del día) | **N/A dispositivo fresco** | Perfil Playwright nuevo sin ventas previas en ese device |
| Tras jornada + (misma sesión) lista COM | **PASS real** | `COM-00000009…11` en «Últimas confirmadas» |

**Nota:** un segundo perfil Playwright genera otro `deviceId` (esperado). La persistencia válida es **mismo perfil / UI logout**.

---

## 3. Jornada comercial DEMO (`:3001`)

| Paso | Resultado | Evidencia |
|------|-----------|-----------|
| Abrir caja | **PASS real** | OPEN |
| 2 ventas online | **PASS real** | `COM-00000009`, `COM-00000010` |
| Preparar offline + venta provisional | **PASS real** | LOCAL / provisionales |
| Reload sin red | **PASS real** | `/ventas` + Sin conexión + provisional |
| Reconectar + sync | **PASS real** | `COM-00000011` (+ 09/10 en lista) |
| Sin pendientes | **PASS real** | pending panel ausente |
| Cerrar caja | **PASS real** | `Caja cerrada. Esperado Bs 150.85; contado…` |
| Nueva apertura | **PASS real** | nuevo OPEN 100,00 |
| Doble cobro / doble stock | **No observado** | ver §4 |

---

## 4. Conciliación (SQL solo lectura)

Dispositivo jornada: `4de3fef4-f198-4127-826f-a14488600324` · `business_id=1`

| Magnitud | Valor | Cuadra |
|----------|-------|--------|
| Ventas COM 09/10/11 (biz 1, device) | **3** filas | Sí |
| Total comercial | **50.85** (= 3×16.95) | Sí |
| `SALE_CASH` asociados | 16.95×3; balances 116.95→133.90→150.85 | Sí |
| `inventory_transactions` por esas sales | **3** | Sí (1:1) |
| Caja device | 1 CLOSED (apertura 100, cierre 150.85) + 1 OPEN (100) | Sí |
| Numeración | COM único **por empresa**; mismos dígitos en biz 3 (seed norte) ≠ duplicado en biz 1 | OK diseño |

Aceite `SKU-A-001` stock actual **22** (consumo coherente con ventas DEMO del dispositivo).

Operaciones rechazadas en outbox UI: no aparecieron en la corrida (sin panel de rechazo).

---

## 5. Regresiones

| Suite | Resultado |
|-------|-----------|
| Sync P2-C0.1 | **25/25 PASS** |
| B2-A | **16/16 PASS** |
| F1 | **11/11 PASS** |
| FE `test:offline` | **56/56 PASS** |
| `tsc` FE/BE | **PASS** |

---

## 6. Brechas / pendientes

| Ítem | Estado |
|------|--------|
| Pantalla dedicada de «cierre de día / conciliación» (reporte formal) | **Brecha** — hoy solo mensaje de cierre de caja en POS |
| Listado global de rechazos outbox en UI de cierre | **Brecha / parcial** — conflictos visibles al fallar sync; sin bandeja de jornada |
| Impresora térmica física | **PENDIENTE** |
| FactuBO / SIAT | Fuera de alcance |

---

## 7. GO/NO-GO

| Criterio | Estado |
|----------|--------|
| S25 estable sin tocar DEMO | **PASS** |
| Multiempresa + device persistente (UI logout) | **PASS** |
| Jornada completa + cierre + reapertura | **PASS** |
| Conciliación sin doble cobro/stock | **PASS** |
| Suites motor | **PASS** |

### Veredicto: **GO**

Siguiente etapa sugerida: impresión física + (opcional) pantalla de conciliación de jornada; fiscal sigue NO-GO.

Sin commit, push ni deploy.
