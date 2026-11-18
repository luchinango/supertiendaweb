# P2-C1.G4 — Control de jornada, conciliación y operaciones pendientes

**Fecha:** 18 de noviembre de 2026  
**Entorno:** Docker `supertienda_dev` + FE prod `supertienda-fe-prod-local:g4` en `127.0.0.1:3001`  
**Dinero real / FactuBO / SIAT / commit / deploy / migraciones / re-seed:** **no**

---

## Veredicto

### **GO** para piloto DEMO ampliado (supervisado)

Pantalla de control de jornada en POS (`next start`), API de sesión de solo lectura sobre tablas existentes, conciliación autoritativa del servidor, bandeja de pendientes/rechazos locales, bloqueo de cierre con provisionales, y aislamiento multiempresa verificados en Chromium. Motor de ventas/inventario/sync intacto (regresiones PASS).

---

## 1. Arquitectura utilizada

| Capa | Pieza | Rol |
|------|--------|-----|
| Backend | `CashSessionService` | Resumen de jornada **solo lectura**: `CashRegister` + `CashMovement` + `Sale` |
| Backend | `GET /cash-registers/session` | Envelope `{ session, previousClosed? }`; requiere JWT + `X-Device-Id` |
| Frontend | `fetchCashSession` | Cliente HTTP al endpoint de sesión |
| Frontend | `PosDayControlPanel` | UI en `/ventas`: confirmados (servidor) vs provisionales (IndexedDB) |
| Frontend | `listPendingLocalSales` / `listProblemLocalSales` | Pendientes y rechazos/conflictos/dead |
| Existente | Cierre POS + lease F1 | `CASH_CLOSE`; bloqueo UI si hay provisionales |

**Sin migraciones.** No se crearon tablas nuevas. `previousClosed` reutiliza el mismo resumen sobre la última caja `CLOSED` del mismo `businessId`/`userId`/`deviceId`.

**Cálculos (servidor):**

- `saleCashTotal` = suma `SALE_CASH`
- `expectedFromMovements` = `opening + SALE_CASH + CASH_IN − CASH_OUT`
- `expectedAmount` = `currentAmount` del registro (autoritativo)
- `countedAmount` / `difference` = solo si `CLOSED` (si no → `null`, UI muestra **—**)

---

## 2. Pantalla implementada

- Acceso: botón **Ver jornada** en `/ventas` (`data-testid="pos-day-control"`).
- Muestra: caja/responsable, apertura/cierre, saldo inicial, ventas efectivo, otros movimientos, esperado, contado, diferencia, listados de ventas y movimientos.
- Badges: **Caja abierta** / **Caja cerrada**.
- Sección local: pendientes (con sync manual), rechazos (motivo + LOCAL-id, sin reintento automático).
- Responsive: grid 1→2→3 columnas; tipografía/colores alineados al POS SuperTienda.
- Comprobante visual 80/58 mm: **sin cambio**; impresión física **no validada**.

---

## 3. Datos confirmados y provisionales

| Origen | Qué cuenta | Qué no |
|--------|------------|--------|
| Servidor (`session`) | Movimientos y ventas de la caja | Provisionales IndexedDB |
| Local (Dexie) | Pendientes / rejected / conflict / dead | No incrementan `expectedAmount` |
| Tras sync | COM definitivo + `SALE_CASH` una vez | No doble cobro (idempotencia clientOperationId) |

Valores desconocidos (**contado/diferencia en OPEN**) se muestran como **—**, no como cero inventado.

---

## 4. Conciliación

Evidencia jornada DEMO G4 (dispositivo browser `deb7c781-…`, caja `R1a5da62741ac4111a06`):

| Paso | Resultado |
|------|-----------|
| Apertura 100,00 | OPEN v1 |
| Venta online | `COM-00000012` · 16,95 → saldo 116,95 |
| Venta offline provisional | `LOCAL-8BB78E44` · pending; cierre UI deshabilitado |
| Sync | `COM-00000013` · 16,95 → saldo **133,90** v3 |
| Panel post-sync | 2 ventas · SALE_CASH 33,90 · esperado 133,90 · **sin doble contabilización** |
| Cierre contado 133,90 | CLOSED · diferencia **0,00** · movimiento `CLOSING_COUNT` |
| Consulta cerrada | Badge **Caja cerrada**; contado/diferencia visibles |

API previa (caja 265 CLOSED del dispositivo G3): 3 ventas, esperado/contado 150,85, diff 0,00.

---

## 5. Pendientes y rechazos

- Pendientes: LOCAL-id, total provisional, estado, botón **Sincronizar** (solo online; no auto-retry de rechazos).
- Rechazos/conflicto/dead: código/mensaje `lastError*`; aviso de no reintento automático.
- Cierre: `listPendingLocalSales` bloquea **Cerrar caja** (disabled + mensaje) mientras existan provisionales de esa caja/dispositivo.
- Tras sync exitoso, IndexedDB marca `confirmed`; panel deja de listar el LOCAL.

---

## 6. Seguridad multiempresa

| Check | Resultado |
|-------|-----------|
| Sesión filtrada por `businessId` + `userId` + `deviceId` | Sí |
| `cashRegisterId` de otra empresa | **404** (no filtra existencia) |
| Misma empresa, otro user/device | **403** |
| Logout → login `admin_b` | Catálogo Empresa B; jornada **sin** COM-12/13 ni caja de Ada |

---

## 7. Pruebas reales (Chromium + `next start` :3001)

Imagen: `supertienda-fe-prod-local:g4` (`INTERNAL_API_URL=http://supertienda-backend:5000`).

| # | Escenario | Resultado |
|---|-----------|-----------|
| 1 | Apertura caja DEMO | **PASS real** |
| 2 | Venta online | **PASS real** COM-00000012 |
| 3 | Venta offline provisional | **PASS real** LOCAL-8BB78E44 |
| 4 | Conciliación antes del sync | **PASS real** (esperado 116,95; pendiente local; cierre bloqueado) |
| 5 | Sincronización | **PASS real** COM-00000013 |
| 6 | Vista sin doble contabilización | **PASS real** 133,90 / 2 ventas |
| 7 | Cierre de caja | **PASS real** diff 0,00 |
| 8 | Consulta jornada cerrada | **PASS real** |
| 9 | Logout + empresa B sin filtración | **PASS real** |

---

## 8. Regresiones

| Suite | Resultado |
|-------|-----------|
| B2-A POS/caja | **16/16 PASS** |
| B2-B cash read | **5/5 PASS** |
| F1 cash lease | **11/11 PASS** |
| Sync P2-C0.1 | **25/25 PASS** |
| FE `test:offline` | **56/56 PASS** |
| `tsc` FE / BE | **PASS** |

---

## 9. Brechas restantes

| Ítem | Estado |
|------|--------|
| Auto-refresh del panel al confirmar venta/sync (hoy requiere **Actualizar**) | Mejora UX menor |
| Impresora térmica física | **PENDIENTE** (sin hardware) |
| FactuBO / SIAT | Fuera de alcance / NO-GO fiscal |
| Histórico multi-jornada / reportes PDF | No pedido; necesitaría contrato/UI adicional (posible migración futura → **no implementado**) |
| Migraciones nuevas | **No requeridas** para G4; ninguna propuesta pendiente autorizable |

---

## 10. GO/NO-GO para piloto DEMO ampliado

| Criterio | Estado |
|----------|--------|
| Vista de jornada/conciliación usable por cajero | **PASS** |
| Servidor autoritativo; sin inventar ceros | **PASS** |
| Provisionales visibles; no doblan caja | **PASS** |
| Bloqueo cierre con pendientes | **PASS** |
| Multiempresa | **PASS** |
| Suites motor | **PASS** |
| Impresión física / fiscal | **NO** (no bloquea DEMO comercial no fiscal) |

### Veredicto: **GO**

Piloto DEMO ampliado supervisado autorizado con la misma disciplina G0–G3 (solo lab local, sin Facto/SIAT, sin dinero real).
