# SuperTienda — Guía del operador (cajero / administrador DEMO)

**Versión:** P2-C1.G6  
**Ámbito:** Piloto supervisado, entorno local / DEMO, **comprobantes no fiscales**  
**No usar con dinero real** hasta autorización explícita de piloto de campo con checklist de impresora.

---

## 1. Antes de empezar

| Qué | Valor típico en lab DEMO |
|-----|--------------------------|
| Pantalla de ventas | URL del POS indicada por el responsable técnico (lab: puerto de FE prod local) |
| Usuario | Cuenta DEMO asignada por el administrador (empresas A y B no se mezclan) |
| Contraseña | **No se publica en esta guía.** Solo en hoja interna del lab / responsable técnico |
| Navegador | Chromium / Chrome actualizado |
| Impresión | Vista previa 58/80 mm; física **solo si hay impresora configurada** |

**Reglas de oro**

1. Una caja abierta por dispositivo y usuario.
2. Las ventas **offline** no tienen número comercial definitivo hasta sincronizar.
3. **No cierres caja** si hay ventas provisionales pendientes.
4. Nunca reintentes a mano una venta **rechazada** sin leer el motivo (riesgo de confusión; el sistema ya evita duplicar por `clientOperationId`).
5. Los tickets dicen **COMPROBANTE NO FISCAL** — no son factura SIAT.
6. El outbox vive en el **perfil del navegador** (IndexedDB). Si borrás datos del sitio, usás modo incógnito o un perfil de prueba desechable, las ventas `LOCAL-…` no estarán al reabrir. En caja real: mismo navegador/perfil hasta sincronizar.

---

## 2. Inicio de sesión

1. Abre la URL de SuperTienda.
2. Ingresa **Usuario** y **Contraseña**.
3. Pulsa **Iniciar sesión**.
4. Ve a **Ventas**.
5. Comprueba el indicador: **En línea** o **Sin red**.

Si cambias de empresa/usuario: usa **Cerrar sesión**, luego entra con la otra cuenta. No compartas la misma sesión entre empresas.

---

## 3. Preparar el dispositivo (recomendado al inicio del día)

Con red disponible:

1. Pulsa **Sync catálogo** (actualiza precios y stock de referencia).
2. Pulsa **Preparar offline** (cachea la app para trabajar sin internet).
3. Confirma que aparece estado PWA listo / sin error.

Sin esto, el cobro offline puede fallar o mostrar catálogo vacío.

---

## 4. Apertura de caja

1. Requiere **conexión**.
2. Revisa **Monto inicial** (ej. 100,00).
3. Pulsa **Abrir caja**.
4. Debe mostrar algo como: `OPEN · R… · saldo ref. Bs … · v1`.

Si dice que ya hay caja abierta: no abras otra; usa la actual o cierra la anterior con supervisión.

---

## 5. Venta online (con internet)

1. Elige productos del catálogo (solo con stock).
2. Revisa carrito, IVA y total.
3. Ingresa **Efectivo recibido** (≥ total).
4. Pulsa **Cobrar efectivo**.
5. Espera confirmación: número **COM-…** y ticket **Confirmado por servidor**.
6. Opcional: **80 mm** / **58 mm** → **Imprimir** → **Cerrar** / **Nueva venta**.

El total definitivo lo confirma el servidor (puede diferir levemente del provisional mostrado).

---

## 6. Venta offline (sin internet)

1. Verás avisos de **Sin red**.
2. Cobra igual: **Cobrar offline (provisional)**.
3. El ticket mostrará **PENDIENTE DE SINCRONIZACIÓN** y un id **LOCAL-…**.
4. Esa venta **no** suma aún a la caja del servidor.

Al recuperar red:

- El sistema intenta sincronizar la cola, **o**
- Pulsa **Sincronizar** en la venta pendiente, **o**
- Usa **Revisar cola offline** (abre **Control de jornada** — no es una pantalla de depuración).

Cuando pase a **COM-…**, ya está confirmada.

---

## 7. Sincronización

| Situación | Qué hacer |
|-----------|-----------|
| Vuelve internet | Espera mensaje de cola sincronizada; revisa **Últimas confirmadas**. |
| Quedan pendientes | Botón **Sincronizar** en cada venta o desde **Control de jornada**. |
| Error de stock/precio | **Sync catálogo** y consulta a un supervisor. |
| `CASH_CLOSED` | La caja se cerró en servidor: no se puede confirmar esa venta sobre esa caja. |

No inventes una segunda venta “para corregir”: primero lee el motivo.

---

## 8. Operaciones rechazadas

En **Ver jornada** → sección **Rechazadas / conflicto**:

- Anota **LOCAL-…**, código y mensaje.
- **No** pulses reintentos a ciegas.
- Casos frecuentes: stock insuficiente, precio desactualizado, caja cerrada, lease inválido.
- Supervisor decide: sync catálogo, abrir nueva caja, o anular el intento local según procedimiento interno.

---

## 9. Conciliación (Control de jornada)

1. Pulsa **Ver jornada**.
2. Revisa **Datos confirmados (servidor)**:
   - Saldo inicial, ventas efectivo, esperado, contado (si cerrada), diferencia.
3. Revisa **Datos provisionales / locales**: pendientes y rechazos.
4. Si el panel estaba abierto durante ventas, se actualiza solo; si dudas, pulsa **Actualizar**.

Valores **—** significan “aún no aplica” (ej. diferencia con caja abierta), no “cero”.

---

## 10. Cierre de caja

1. Sincroniza **todas** las provisionales.
2. Cuenta el efectivo físico.
3. Ingresa **Efectivo contado**.
4. Pulsa **Cerrar caja** (requiere red).
5. Anota esperado, contado y diferencia del mensaje / jornada.

Si el botón está deshabilitado: hay pendientes — no fuerces el cierre.

---

## 11. Consultar comprobantes

- Tras una venta: **Ver ticket**.
- Lista **Últimas confirmadas** (COM).
- Lista **Ventas provisionales** (LOCAL, hasta sync).

Siempre verifica la leyenda **no fiscal**.

---

## 12. Fin de turno / cambio de cajero

1. Sync pendientes.
2. Cierra caja si corresponde al procedimiento del local.
3. **Cerrar sesión**.
4. No dejes la sesión abierta en un PC compartido.

---

## 13. Qué hacer si…

| Problema | Acción |
|----------|--------|
| Se cerró la pestaña con venta offline | Reabre SuperTienda (mismo navegador/perfil). La venta debe seguir en pendientes. |
| Sin internet largo rato | Sigue cobrando offline solo si el catálogo y la caja estaban preparados; sincroniza al recuperar. |
| La app no carga offline | Usa **Preparar offline** con red; no borres datos del sitio. |
| Totales de jornada “viejos” | **Actualizar** en Control de jornada. |
| Dudas de dinero / diferencia | No alteres movimientos históricos; reporta a supervisor con COM/LOCAL. |
