# P2-C1.G6 — Preparación operativa del piloto de campo

**Fecha:** 18 de noviembre de 2026  
**Proyecto:** `C:\Proyectos\supertiendaweb`  
**Entorno verificado:** Docker `supertienda_dev` + FE `supertienda-fe-prod-local:g5` (`127.0.0.1:3001`) + API `:5000`  
**Dinero real / deploy / commit / push / FactuBO / SIAT / migraciones destructivas / restore ejecutado:** **no**

Documentos complementarios:

- [P2C1G6_OPERATOR_GUIDE.md](./P2C1G6_OPERATOR_GUIDE.md)
- [P2C1G6_UAT_CHECKLIST.md](./P2C1G6_UAT_CHECKLIST.md)

Herencia validada: G3 (cierre/estabilidad), G4 (jornada/conciliación), G5 (resiliencia).

---

## 1. Estado de preparación

| Área | Estado | Base |
|------|--------|------|
| Motor ventas / caja / inventario / sync | **Listo lab** | G3–G5 + regresiones G6 |
| POS offline + PWA shell | **Listo lab** | G1/G5 |
| Control de jornada / conciliación | **Listo lab** | G4 + auto-refresh G5 |
| Multiempresa | **Listo lab** | G3/G4 |
| Idempotencia / lease / cierre remoto | **Listo lab** | G5 + F1 |
| Documentación operador + UAT | **Entregada** | Este paquete G6 |
| Impresión física térmica | **PENDIENTE HW** | G5 §7 |
| Fiscal (FactuBO/SIAT) | **NO-GO** | Fuera de alcance |
| Piloto con dinero real | **No iniciado** | Requiere autorización aparte |

**Lab smoke 18/11/2026:** backend healthy; FE `:3001/login` HTTP 200; contenedores Up.

---

## 2. Requisitos técnicos (checklist de instalación)

### 2.1 Computadora y navegador
- PC + Chromium/Chrome actualizado; un perfil por caja.
- No borrar datos del sitio (IndexedDB).

### 2.2 Conectividad y offline
- FE y API alcanzables en lab.
- Antes de cortes: Sync catálogo + Preparar offline.
- Ventas offline en outbox; sync al recuperar red.

### 2.3 Base de datos y servicios
| Pieza | Referencia lab |
|-------|----------------|
| Postgres | `supertienda-db` / `supertienda_dev` |
| API | `supertienda-backend` → `127.0.0.1:5000` |
| FE prod | `st-fe-prod-g5` → `127.0.0.1:3001` |
| FE dev | `:3000` (no para UAT de campo) |

Sin Prisma CLI desde Windows; sin migrate reset / DROP / borrar volúmenes sin autorización.

### 2.4 Usuarios y permisos
- Cuentas DEMO A/B (empresas distintas). Contraseñas **solo** en documentación interna del lab.
- Cerrar sesión al cambiar empresa.

### 2.5 Configuración de caja
- Apertura online; una OPEN por dispositivo+usuario; lease F1.
- Cierre online con contado; bloqueado si hay provisionales.

### 2.6 Impresora térmica 58/80 mm
- Ver §5. Física: no declarar PASS sin hardware.

### 2.7 Actualización (lab)
1. Rebuild FE prod con tag nuevo y build-arg `INTERNAL_API_URL=http://supertienda-backend:5000`.
2. Recrear solo el contenedor FE en `:3001`.
3. Smoke: login, Ventas, apertura caja DEMO.
4. Si hace falta reiniciar API: únicamente el contenedor `supertienda-backend` (probado en G5). No reiniciar Postgres sin autorización.

### 2.8 Backup y restauración

- Procedimiento detallado de `pg_dump` / restore: **solo en runbook interno técnico**; no en guías de cajero.
- Restore de base: **prohibido** sin autorización independiente (G6/G7 no lo ejecutan).
- Operación diaria: no borrar datos del navegador de caja hasta sync confirmado; anotar COM del día.
- Scope IndexedDB: `supertienda_offline__u{userId}__b{businessId}__d{deviceId}`.

---

## 3. Procedimientos operativos

Resumen ejecutivo; detalle cajero en `P2C1G6_OPERATOR_GUIDE.md`.

| Proceso | Resumen |
|---------|---------|
| Login | Usuario DEMO → Ventas; verificar En línea / Sin red |
| Apertura | Online; monto inicial; estado OPEN |
| Venta online | Cobrar efectivo → COM confirmado |
| Venta offline | Cobrar offline → LOCAL provisional; no cierra caja |
| Sync | Automática al reconectar o botón Sincronizar |
| Rechazos | Leer motivo en jornada; no reintento ciego |
| Conciliación | Ver jornada: servidor vs locales |
| Cierre | Sync primero; contado; Cerrar caja |
| Comprobantes | Ver ticket; 58/80 mm vista previa |

---

## 4. Plan de contingencias

| Evento | Respuesta | Verificado en lab |
|--------|-----------|-------------------|
| Cierre de navegador con pendiente | Reabrir mismo perfil; pendiente en IndexedDB | G5 PASS |
| Internet prolongado ausente | Seguir offline si PWA/catálogo/caja listos; sync después | G5 PASS |
| Reinicio API | Esperar healthy; reintentar sync | G5 PASS |
| Fallo sync / timeout | Reintento mismo clientOperationId → duplicate; sin doble cobro | G5 PASS |
| Caja cerrada remotamente | Rechazo CASH_CLOSED; no nueva venta | G5 PASS |
| Lease inválido/vencido | LEASE_*; no aplicar venta | G5 + F1 PASS |
| Datos locales | No borrar sitio; DB por u/b/d; SW sin API | G5 PASS |
| Restore DB | Solo con autorización aparte | **No ejecutado** |

---

## 5. Pruebas realizadas (G6)

| Tipo | Resultado 18/11/2026 |
|------|----------------------|
| Smoke lab FE/API/contenedores | PASS |
| B2-A | 16/16 PASS |
| B2-B | 5/5 PASS |
| F1 | 11/11 PASS |
| Sync | 25/25 PASS |
| FE offline | 56/56 PASS |
| tsc FE/BE | PASS |
| Evidencia G3–G5 (no re-auditoría completa) | Heredada PASS |

No se modificaron datos DEMO para forzar resultados de suites.

---

## 6. Pruebas pendientes

| Ítem | Estado |
|------|--------|
| UAT firmado con cajero/admin humanos en sitio | Pendiente de sesión UAT |
| Impresión física 58/80 mm, corte, reimpresión | PENDIENTE HW |
| Backup real + restore en ventana autorizada | Pendiente autorización |
| Piloto supervisado con dinero real | No autorizado |
| FactuBO / SIAT | Fuera de alcance |

---

## 7. Riesgos y bloqueantes

| ID | Riesgo | Bloquea ¿qué? | Mitigación |
|----|--------|---------------|------------|
| R1 | Sin impresora validada | Ticket físico de campo | Completar matriz F del UAT en sitio |
| R2 | Uso con dinero real sin autorización | Cumplimiento | Mantener solo DEMO hasta GO escrito |
| R3 | Borrado de datos del navegador | Pérdida de provisionales | Capacitación; no “limpiar sitio” |
| R4 | Cierre remoto vs cola offline | Ventas no confirmables | Procedimiento CASH_CLOSED en guía |
| R5 | Fiscal no integrado | Facturación legal | NO-GO fiscal explícito |
| R6 | Confundir FE `:3000` dev con `:3001` prod | UAT inválido | Usar solo g5 `:3001` para aceptación |

**Bloqueantes duros para dinero real:** R1 (si el local exige ticket impreso) + autorización formal + R2.

---

## 8. GO/NO-GO para solicitar autorización de piloto de campo

| Criterio | Estado |
|----------|--------|
| Software lab estable (G3–G5 + regresiones G6) | **PASS** |
| Procedimientos operador documentados | **PASS** |
| Matriz UAT lista para ejecutar/firmar | **PASS** |
| Contingencias lab verificadas | **PASS** (G5) |
| Impresión física | **PENDIENTE** |
| Fiscal | **NO-GO** |
| Dinero real / deploy | **NO** |

### Veredicto

**GO CONDICIONADO** para **solicitar** autorización de un piloto de campo **supervisado, comercial no fiscal, sin dinero real hasta checklist de impresora y acta UAT firmada**.

**NO-GO** para: despliegue productivo, FactuBO/SIAT, procesamiento de dinero real, o inicio de piloto sin firma sponsor.

Este entregable **no inicia** el piloto: solo deja el paquete operativo listo para la decisión de negocio.
