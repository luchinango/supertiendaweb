# SuperTienda — Matriz UAT (cajero / administrador) — P2-C1.G6

**Entorno:** solo Docker local `supertienda_dev` + FE prod local `:3001`  
**Datos:** cuentas DEMO del lab (credenciales en hoja interna, no en esta matriz)  
**Dinero real / SIAT / FactuBO:** prohibido  
**Fecha de plantilla:** 18/11/2026  

Leyenda de resultado: `PASS` · `FAIL` · `BLOQUEADO` · `N/A` · `PENDIENTE HW`

---

## A. Preparación del entorno (admin / Tech)

| ID | Caso | Pasos | Esperado | Evidencia | Resultado |
|----|------|-------|----------|-----------|-----------|
| A1 | API healthy | Abrir `http://127.0.0.1:5000/health` | JSON healthy | Screenshot / texto | |
| A2 | FE prod login | Abrir `:3001/login` | Formulario visible | Screenshot | |
| A3 | Contenedores | `docker ps` backend, db, fe-prod | Up (healthy) | Log | |
| A4 | CORS / API desde FE | Login desde `:3001` | Sin Failed to fetch | Consola limpia de CORS | |

---

## B. Cajero — jornada normal

| ID | Caso | Pasos | Esperado | Evidencia | Resultado |
|----|------|-------|----------|-----------|-----------|
| B1 | Login cajero/admin DEMO | Login cuenta DEMO A → Ventas | Sesión del admin A visible | Screenshot cabecera | |
| B2 | Sync catálogo | Sync catálogo | Productos con precio/stock | Lista visible | |
| B3 | Preparar offline | Preparar offline | Sin error; PWA lista | Mensaje UI | |
| B4 | Abrir caja | Monto 100 → Abrir caja | OPEN + saldo ref. | Texto OPEN · R… | |
| B5 | Venta online | Aceite + efectivo → Cobrar | COM-… confirmada | Ticket + COM | |
| B6 | Control de jornada | Ver jornada | Venta en confirmados; esperado coherente | Screenshot panel | |
| B7 | Ticket 80/58 vista | Ver ticket → 80 mm / 58 mm | Layout cambia; no fiscal | Screenshot | |
| B8 | Cierre caja | Contado = esperado → Cerrar | Diff 0,00; CLOSED | Mensaje cierre + jornada | |

---

## C. Cajero — offline y sync

| ID | Caso | Pasos | Esperado | Evidencia | Resultado |
|----|------|-------|----------|-----------|-----------|
| C1 | Venta offline | Sin red → Cobrar offline | LOCAL-… provisional | Ticket pendiente | |
| C2 | Bloqueo cierre | Con pendiente → Cerrar caja | Botón disabled / mensaje | Screenshot | |
| C3 | Cerrar pestaña | Cerrar tab → reabrir sin red | Pendiente sigue | Lista provisionales | |
| C4 | Recarga offline | F5 sin red | App usable + pendiente | Screenshot | |
| C5 | Sync al recuperar | Online → Sincronizar | COM-…; pendiente limpia | COM + panel | |
| C6 | Sin doble cobro | Revisar jornada / saldo | Una sola SALE_CASH por venta | Totales | |

---

## D. Admin — conciliación y multiempresa

| ID | Caso | Pasos | Esperado | Evidencia | Resultado |
|----|------|-------|----------|-----------|-----------|
| D1 | Jornada cerrada | Ver jornada tras cierre | Badge cerrada; contado/diff | Screenshot | |
| D2 | Pendientes/rechazos | Provocar o revisar bandeja | Motivo + LOCAL; sin auto-retry ciego | UI | |
| D3 | Logout → empresa B | Cerrar sesión → cuenta DEMO B | Catálogo B; sin COM de A | Screenshot | |
| D4 | Volver a A | Logout → cuenta DEMO A | Datos A sin mezcla | Screenshot | |

---

## E. Contingencias (lab)

| ID | Caso | Pasos | Esperado | Evidencia | Resultado |
|----|------|-------|----------|-----------|-----------|
| E1 | Reinicio backend | `docker restart supertienda-backend` (solo ese) | Health OK; login/caja legible | Health + UI | |
| E2 | Sync con caja cerrada remota | Cerrar caja en servidor; sync venta vieja | Rechazo CASH_CLOSED; sin venta nueva | Código/mensaje | |
| E3 | Lease inválido | (suite F1 / lab) | LEASE_* rejected | Log suite | |
| E4 | No borrar IndexedDB | Tras fallos, no “borrar datos del sitio” | Datos locales intactos | Confirmación verbal/foto | |

**Prohibido en UAT sin autorización aparte:** restore DB, restart Postgres, `migrate reset`, borrar volúmenes.

---

## F. Impresión térmica

| ID | Caso | Tipo | Esperado | Resultado |
|----|------|------|----------|-----------|
| F1 | Vista previa 80 mm | CSS | Legible en pantalla | |
| F2 | Vista previa 58 mm | CSS | Legible; más estrecho | |
| F3 | Print diálogo navegador | Soft | Diálogo abre; sin crash | |
| F4 | Impresora física 80 mm | HW | Texto alineado, corte OK | **PENDIENTE HW** |
| F5 | Impresora física 58 mm | HW | Idem | **PENDIENTE HW** |
| F6 | Reimpresión mismo COM | HW/CSS | Segundo ticket igual datos | |

---

## G. Regresiones técnicas (Tech)

Ejecutar desde host Windows contra API `:5000` (sin Prisma CLI):

| Suite | Comando | Esperado | Resultado G6 (18/11/2026) |
|-------|---------|----------|---------------------------|
| B2-A | `npm run test:p2c1b2a:http` (backend) | 16/16 | **PASS** |
| B2-B | `npm run test:p2c1b2b:http` | 5/5 | **PASS** |
| F1 | `npm run test:p2c1f1:http` | 11/11 | **PASS** |
| Sync | `npm run test:p2c01:http` | 25/25 | **PASS** |
| Offline | `npm run test:offline` (frontend) | 56/56 | **PASS** |
| tsc FE | `npm run type-check` | OK | **PASS** |
| tsc BE | `npx tsc --noEmit` | OK | **PASS** |

---

## Firma UAT

| Rol | Nombre | Fecha | Firma / OK |
|-----|--------|-------|------------|
| Cajero DEMO | | | |
| Administrador DEMO | | | |
| Tech / QA | | | |
| Sponsor operativo | | | |

**Decisión:** ☐ Listo para solicitar autorización de piloto de campo · ☐ No listo (bloquear por: ________)
