# P2-C1.G9.4 — Matriz de aceptación UAT (cajero / administrador)

**Versión:** 2026-11-18  
**Entorno autorizado:** Docker DEMO local · FE `http://127.0.0.1:3001` (`st-fe-prod-g94`) · API `:5000`  
**Prohibido:** dinero real · producción · FactuBO/SIAT · cerrar cajas residuales ajenas sin autorización  

**Estado del gate técnico G9.4:** GO condicionado (ver `P2C1G9_4_UX_CONSOLIDATION_REPORT.md`).  
**Esta matriz NO constituye UAT aprobada** hasta firmas humanas y evidencias completas.

Credenciales: solo `docs/internal/` (no reproducir passwords aquí).

---

## Cómo usar

1. Ejecutar cada caso en sesión supervisada.  
2. Marcar **OK / FAIL / N/A / BLOQUEADO**.  
3. Adjuntar captura o nota en **Evidencia**.  
4. Firmar al cierre de rol.  
5. Cualquier FAIL bloqueante → no declarar UAT aprobada.

| Campo | Uso |
|-------|-----|
| ID | Identificador estable |
| Rol | Cajero / Admin / Ambos / Tech |
| Caso | Acción a realizar |
| Esperado | Resultado observable |
| Evidencia | Captura / nº COM / nota |
| Resultado | OK / FAIL / N/A / BLOQUEADO |
| Observaciones | Libre |
| Responsable | Nombre |

---

## A. Autenticación y navegación

| ID | Rol | Caso | Esperado | Evidencia | Resultado | Observaciones | Responsable |
|----|-----|------|----------|-----------|-----------|---------------|-------------|
| A1 | Ambos | Login válido | Redirección a Inicio/Ventas; sin sidebar en login | | | | |
| A2 | Ambos | Logout | Vuelve a `/login` | | | | |
| A3 | Admin | Sidebar agrupado | Ve Gestión (Config, etc.) | | | | |
| A4 | Cajero | Sidebar reducido | Sin Config/Empleados/Estadísticas; sí Ventas/Catálogo/Inventario/Clientes | | | | |
| A5 | Admin B | Multiempresa | Solo datos empresa B; `businessId` distinto | | | | |

---

## B. Dashboard

| ID | Rol | Caso | Esperado | Evidencia | Resultado | Observaciones | Responsable |
|----|-----|------|----------|-----------|-----------|---------------|-------------|
| B1 | Ambos | Abrir Inicio | Texto en español; CTA Ir a Ventas | | | | |
| B2 | Ambos | Sin caja/logout duplicados | Operación de caja solo vía Ventas | | | | |

---

## C. POS — caja y ventas (cajero)

| ID | Rol | Caso | Esperado | Evidencia | Resultado | Observaciones | Responsable |
|----|-----|------|----------|-----------|-----------|---------------|-------------|
| C1 | Cajero | Abrir caja (device de prueba) | OPEN; saldo inicial visible | | | | |
| C2 | Cajero | Venta online efectivo ≥ total | COM-…; ticket no fiscal | | | | |
| C3 | Cajero | Efectivo insuficiente | Cobro bloqueado; mensaje claro | | | | |
| C4 | Cajero | Venta offline | LOCAL-… provisional; pendiente visible | | | | |
| C5 | Cajero | Sync pendiente | COM definitivo; pendiente limpia | | | | |
| C6 | Cajero | Cerrar **esta** caja tras sync | CLOSED; sin forzar residuales ajenas | | | | |
| C7 | Cajero | Control de jornada | Conciliación / cola / rechazos legibles | | | | |
| C8 | Cajero | Header offline | Conexión + pendientes + Jornada/cola; **sin** badge flotante sobre caja | | | | |
| C9 | Cajero | Móvil: Sheet carrito | Total/Cobrar; Escape cierra | | | | |
| C10 | Cajero | Persistencia perfil | Cerrar Chromium con `--session`/mismo perfil; IDB intacta (no one-shot) | | | | |

---

## D. Catálogo e inventario

| ID | Rol | Caso | Esperado | Evidencia | Resultado | Observaciones | Responsable |
|----|-----|------|----------|-----------|-----------|---------------|-------------|
| D1 | Admin | Listado / búsqueda | Tabla desktop; cards móvil | | | | |
| D2 | Admin | Nuevo / Editar / Adoptar | Acciones visibles y funcionales | | | | |
| D3 | Cajero | Catálogo | Sin Nuevo/Editar; lectura OK | | | | |
| D4 | Cajero | Inventario Ajustar | Visible si política EMPLOYEE | | | | |
| D5 | Ambos | Stock badges | OK / Bajo / Agotado coherentes | | | | |
| D6 | Ambos | Link POS | Navega a Ventas | | | | |

---

## E. Offline / sync / ticket

| ID | Rol | Caso | Esperado | Evidencia | Resultado | Observaciones | Responsable |
|----|-----|------|----------|-----------|-----------|---------------|-------------|
| E1 | Cajero | Cortar red en POS | Pill/header “Sin conexión”; cobro offline | | | | |
| E2 | Cajero | Restaurar red + sync | Sin duplicar COM | | | | |
| E3 | Cajero | Ticket 80 mm preview | COMPROBANTE NO FISCAL | | | | |
| E4 | Cajero | Ticket 58 mm preview | Layout estrecho | | | | |
| E5 | Tech | Imprimir | Diálogo OS / impresora | | | | **PENDIENTE HW** |

---

## F. Responsive y a11y (muestra)

| ID | Rol | Caso | Esperado | Evidencia | Resultado | Observaciones | Responsable |
|----|-----|------|----------|-----------|-----------|---------------|-------------|
| F1 | Ambos | 320 / 390 / 768 / 1024 / 1440 | Sin scroll horizontal inesperado | | | | |
| F2 | Ambos | Focus teclado CTAs | Anillo visible | | | | |
| F3 | Cajero | Targets táctiles cobro/qty | ≥ ~40px | | | | |
| F4 | Ambos | Errores legibles | `role=alert` / mensajes claros | | | | |

---

## Comprobado automáticamente en G9.4 (lab) vs humano

| Ámbito | Automático G9.4 | Requiere humano |
|--------|-----------------|-----------------|
| Login / nav roles / multiempresa | Sí | Confirmación visual |
| Header offline sin solape | Sí | — |
| Venta online + ticket UI | Sí | Lectura ticket en impresora |
| Venta offline + IDB persistente (mismo perfil) | Sí | Ritual operativo “no cerrar one-shot” |
| Sync pendiente UI | Parcial (WARN botón) | Ejecutar sync desde bandeja |
| Cierre caja sesión prueba | Parcial (WARN si pendientes) | Cerrar tras sync limpio |
| B2-A/B2-B/F1/offline unit | Sí | — |
| Print OS / térmica | No | **Sesión HW** |
| Firmas UAT | No | **Obligatorio** |

---

## Riesgos pendientes (declarar en acta)

1. Impresión física no validada.  
2. Cajas OPEN históricas de otros devices — no cerrar sin orden.  
3. Perfil Chromium one-shot aparenta “pérdida” IndexedDB (G8.1) — usar perfil persistente en UAT.  
4. No dinero real / no SIAT.

---

## Firmas

| Rol | Nombre | Fecha | Firma | Dictamen (GO/NO-GO UAT) |
|-----|--------|-------|-------|-------------------------|
| Cajero | | | | |
| Administrador | | | | |
| Tech / QA | | | | |
| CTO / Producto | | | | |

**Acta:** UAT humana ☐ aprobada · ☐ condicionada · ☐ rechazada  

Notas de cierre: _______________________________________________
