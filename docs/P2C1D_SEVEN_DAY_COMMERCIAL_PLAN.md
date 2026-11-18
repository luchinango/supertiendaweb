# P2-C1.D — Plan de siete días (pruebas comerciales)

**Estado:** preparado — **no ejecutado** como simulación completa.  
**Entorno:** Docker local `supertienda_dev` + seed DEMO (`npm run db:seed:demo`).  
**Usuarios:** `demo_admin_1..3` / `demo_emp_1..3` · password `SEED_DEV_PASSWORD` / `DevPass123!`  
**Dispositivos sugeridos:** `demo-device-norte-01`, `demo-device-sur-01`, `demo-device-centro-01`

Separar: (A) datos seed, (B) pruebas automáticas HTTP/Vitest, (C) operaciones de demostración manuales.

---

## Día 1 — Apertura, inventario, ventas online

1. Login `demo_admin_1` · device `demo-device-norte-01`.
2. Sync catálogo; verificar ~90 compartidos + privados de la empresa.
3. Abrir caja online (monto 200).
4. Vender 5–10 ítems online; anotar `COM-…`, stock y saldo caja.
5. Cerrar caja contando = esperado.

## Día 2 — Ingresos y ajustes de inventario

1. Abrir caja.
2. En `/inventario`: restock / ajuste `STOCK_ADJUST` (positivo y negativo controlado).
3. Sync; verificar version BP y stock.
4. Una venta online que use producto ajustado.

## Día 3 — Offline + sync

1. Abrir caja online; confirmar evidencia local.
2. Simular offline (`navigator` offline / DevTools).
3. 3 ventas provisionales; recargar; verificar persistencia IndexedDB.
4. Online → sincronizar una a una; verificar `COM-…` y stock −1 por unidad (no doble).
5. Intentar cerrar con pendientes → debe bloquearse; sync restante → cerrar.

## Día 4 — Conflictos stock/precio

1. Offline: encolar venta de producto con stock 2.
2. Online (otra sesión/device misma empresa si aplica, o sync inventario): agotar stock / cambiar `customPrice`.
3. Sync venta pendiente → `INSUFFICIENT_STOCK` o `PRICE_MISMATCH`.
4. Verificar liberación de stock visible local y outbox `rejected`.

## Día 5 — Dos usuarios misma empresa

1. `demo_admin_1` device norte · `demo_emp_1` device norte-alt (otro `deviceId`).
2. Cada uno abre su caja (Modalidad 2: una OPEN por user+device).
3. Ventas concurrentes del mismo SKU con stock limitado.
4. Verificar aislamiento de outbox por scope y numeración comercial por empresa.

## Día 6 — Aislamiento empresas/dispositivos

1. `demo_admin_2` / `demo_admin_3` en paralelo.
2. Confirmar que no ven productos/precios/cajas ajenas.
3. Cross-tenant `SALE_CREATE` / GET open → FORBIDDEN / null.

## Día 7 — Conciliación y cierre

1. Listar ventas confirmadas del día (DB o UI si disponible).
2. Cuadrar: Σ ventas CASH = Δ `currentAmount` caja.
3. Inventario: stock final = inicial − ventas + ajustes.
4. Cerrar todas las cajas OPEN; sin pendientes.
5. Exportar hallazgos al informe operativo.

---

## Checklist de no-regresión (cada día)

- [ ] Sin ventas duplicadas (mismo `clientOperationId`)
- [ ] Sin stock negativo confirmado
- [ ] Sin pérdida silenciosa de outbox
- [ ] Comprobante definitivo solo tras `applied`/`duplicate`
