# P2-C1.G7 — Informe de ejecución UAT (laboratorio)

**Fecha:** 18/11/2026  
**Entorno:** Docker local verificado (`supertienda-backend` healthy, `supertienda-db` healthy, FE prod `st-fe-prod-g5` → `127.0.0.1:3001`)  
**Alcance:** Aceptación operativa de laboratorio / DEMO. **No** piloto comercial. **No** dinero real. **No** SIAT/FactuBO. **No** deploy. **No** migrate/restore/reinicio Postgres.  
**Ejecutor técnico:** CTO/QA virtual (agente) — lab Chromium + API.  
**Firmas humanas:** ninguna (no inventadas).

---

## 0. Veredicto

| Pregunta | Respuesta |
|----------|-----------|
| ¿Lab operativo alineado con G6? | **Sí** (docs G6 revisadas; secretos retirados de guías de usuario) |
| ¿PASS técnico de jornada online/offline/sync/aislamiento? | **Sí** (evidencia en `docs/p2c1g7-evidence/`) |
| ¿PASS de usuario humano (cajero/admin presencial)? | **No** — **PENDIENTE** |
| ¿Impresión física aprobada? | **No** — **PENDIENTE HW** |
| ¿GO para iniciar piloto comercial? | **NO-GO** |
| ¿GO para **solicitar** sesión UAT presencial supervisada? | **GO condicionado** (ver §7) |

---

## 1. Revisión documental G6 vs funcionamiento actual

| Documento | Hallazgo | Acción G7 |
|-----------|----------|-----------|
| `P2C1G6_FIELD_READINESS_REPORT.md` | Coherente con POS (sesión, outbox, lease, SW). Tenía credenciales y comandos restore en texto. | Credenciales → hoja interna; restore reducido a referencia runbook interno |
| `P2C1G6_OPERATOR_GUIDE.md` | Flujos cajero correctos; exponía `DevPass123!` | Contraseñas eliminadas; remite a hoja interna |
| `P2C1G6_UAT_CHECKLIST.md` | Matriz A–G usable; credenciales en cabecera | Credenciales eliminadas de plantilla |
| Credenciales lab | Necesarias solo para ejecución técnica | `docs/internal/P2C1_LAB_CREDENTIALS.md` (**interno**) |

UI observada en Chromium coincide con la guía: Sync catálogo, Preparar offline, Abrir/Cerrar caja, Ver jornada, ticket no fiscal 80/58, cola offline, multiempresa.

---

## 2. Clasificación de la matriz A–G (antes de marcar resultados)

| Bloque | Quién / qué | Automatizado ya (G6/G5) | Requiere cajero humano | Requiere admin | Hardware | Auth adicional |
|--------|-------------|-------------------------|------------------------|----------------|----------|----------------|
| **A** Prep entorno | Tech | Parcial (health/docker) | No | No | No | No |
| **B** Jornada normal | Cajero + Tech | Suites motor | **Sí** (UX real) | Opcional | No | No |
| **C** Offline/sync | Cajero + Tech | G5 recovery + offline tests | **Sí** (gesto real) | No | No | No |
| **D** Conciliación / multiempresa | Admin + Tech | API tenant | **Sí** (lectura jornada) | **Sí** | No | No |
| **E** Contingencias | Tech | G5 E1–E3 | No | Sí (si restore) | No | **E restore/DB = auth aparte** |
| **F** Impresión | Cajero + Tech | CSS preview | **Sí** (F3 diálogo) | No | **F4–F5** | Sesión impresora |
| **G** Regresiones | Tech | Suites HTTP/Vitest/tsc | No | No | No | No |

**Regla aplicada:** no se marca `PASS` humano sin ejecución humana; el lab del agente se etiqueta **PASS técnico**.

---

## 3. Matriz de resultados G7

Leyenda: **PASS técnico** · **PASS humano** · **PENDIENTE** · **BLOQUEADO** · **NO-GO** · **N/A**

### A. Preparación

| ID | Resultado | Evidencia |
|----|-----------|-----------|
| A1 API healthy | **PASS técnico** | `p2c1g7-evidence/A1-health.json` — `status=healthy` |
| A2 FE login | **PASS técnico** | `A2-login.png` — formulario visible `:3001/login` |
| A3 Contenedores | **PASS técnico** | `A3-docker-ps.txt` — backend/db/fe-prod Up |
| A4 CORS/login FE | **PASS técnico** | Login UI + API sin Failed to fetch CORS en consola de scripts |

### B. Jornada normal

| ID | Resultado | Evidencia |
|----|-----------|-----------|
| B1 Login DEMO A | **PASS técnico** | `B1-login-admin-a.json`, `B1-after-login.png` — Ada AdminA |
| B2 Sync catálogo | **PASS técnico** | `B2-sync.png` / ventas — Aceite, Arroz, etc. |
| B3 Preparar offline | **PASS técnico** | `B3-offline-prep.png` — mensaje UI coherente (pide caja OPEN si no hay) |
| B4 Abrir caja | **PASS técnico** | API `B4-open.json` applied R…; UI `B4-caja.png` — `OPEN · … · Bs 100,00` |
| B5 Venta online | **PASS técnico** | API `COM-00000022`; UI `B5-venta-ok.png` — **COM-00000023** confirmado servidor |
| B6 Control jornada | **PASS técnico** | `B6-jornada.png` — panel DATOS CONFIRMADOS |
| B7 Ticket 80/58 vista | **PASS técnico** (80 mm) / **PENDIENTE** (58 mm layout) | `F1-ticket-80.png` (=COM-23, 80 mm seleccionado). Botón 58 mm visible; captura F2 no confirma layout estrecho tras click |
| B8 Cierre caja | **PASS técnico** (API) / **PENDIENTE** (UI cierre post-offline en esta corrida) | API `B8-close.json` — diff `0.00`, CLOSED. UI dejó cajas OPEN de dispositivo Chromium (lab); no PASS humano |

### C. Offline y sync

| ID | Resultado | Evidencia |
|----|-----------|-----------|
| C1 Venta offline | **PASS técnico** | `C1-offline-local.png` — **LOCAL-73A7B54A** pendiente sync |
| C2 Bloqueo cierre | **PASS técnico** | `C2-close-blocked.png` + script `C2_disabled=true` |
| C3 Cerrar pestaña | **PENDIENTE** | No re-ejecutado en G7 (cubierto G5); no marcar PASS |
| C4 Recarga offline | **PASS técnico** | `C4-reload-offline.png` — sigue `LOCAL-73A7B54A · pending` |
| C5 Sync al recuperar | **PASS técnico** | Outbox Acked `SALE_CREATE`; DB **COM-00000024** (16,95) post-sync |
| C6 Sin doble cobro | **PASS técnico** (motor) | Suites G6 + conteo COM secuencial; no doble en panel jornada G5/G7 |

### D. Admin / multiempresa

| ID | Resultado | Evidencia |
|----|-----------|-----------|
| D1 Jornada cerrada | **PASS técnico** (API) | `D1-session-closed.json` + previousClosed tras cierre 331 |
| D2 Pendientes/rechazos | **PASS técnico** (parcial) | Bandeja provisionales visible en C1/C4; rechazo lease/caja G5 |
| D3 Empresa B | **PASS técnico** | `D3-empresa-b.png` — Bruno AdminB; Azúcar Empresa B; sin Aceite A |
| D4 Volver A | **PASS técnico** | `D4-empresa-a.png` — Ada + catálogo A |

### E. Contingencias

| ID | Resultado | Nota |
|----|-----------|------|
| E1 Restart backend | **PASS técnico** (G5) | No re-ejecutado en G7 para no interrumpir FE; health actual OK |
| E2 Sync caja cerrada remota | **PASS técnico** (G5) | No re-ejecutado G7 |
| E3 Lease inválido | **PASS técnico** (suite F1 / G5) | Citado G6 matriz G |
| E4 No borrar IndexedDB | **PASS técnico** | Scope visto: `supertienda_offline__u1__b1__d…`; datos no borrados |
| Restore DB / restart Postgres | **NO-GO / no ejecutado** | Requiere autorización independiente |

### F. Impresión

| ID | Resultado | Nota |
|----|-----------|------|
| F1 Preview 80 mm | **PASS técnico** | Ticket COM-00000023 legible en pantalla |
| F2 Preview 58 mm | **PENDIENTE** | Control presente; evidencia de layout 58 mm insuficiente en G7 |
| F3 Diálogo print navegador | **PENDIENTE** | No se abrió diálogo de impresión del SO |
| F4 Física 80 mm | **PENDIENTE HW** | Sin dispositivo |
| F5 Física 58 mm | **PENDIENTE HW** | Sin dispositivo |
| F6 Reimpresión | **PENDIENTE** | No ejercitada en G7 |

### G. Regresiones técnicas

| Suite | Resultado G7 |
|-------|----------------|
| B2-A / B2-B / F1 / Sync / offline / tsc | **PASS técnico** — **no re-corridas en G7**; se mantienen como verificadas en G6 (18/11/2026). Spot-check operativo G7 (open/sale/close/offline/sync) coherente con esas suites. |

---

## 4. Evidencias (índice)

Directorio: `docs/p2c1g7-evidence/`

| Artefacto | Qué demuestra |
|-----------|----------------|
| `A1-health.json`, `A3-docker-ps.txt`, `A2-login.png` | Lab arriba |
| `B4-open.json`, `B5-sale.json`, `B8-close.json` | Jornada API device `p2c1g7-uat-device-a` |
| `B5-venta-ok.png`, `F1-ticket-80.png` | Venta UI **COM-00000023** + ticket no fiscal |
| `C1-offline-local.png`, `C4-reload-offline.png` | **LOCAL-73A7B54A** + persistencia |
| `matrix-browser.json`, `matrix-browser-offline.json`, `matrix-api.json` | Trazas de ejecución |
| `D3-empresa-b.png`, `D4-empresa-a.png` | Aislamiento visual multiempresa |
| DB read (lab) | COM-22 (API), COM-23 (UI online), COM-24 (sync offline) |

Scripts de reproducción lab (no secretos en guías de usuario): `run-g7-uat-api.mjs`, `run-g7-browser*.mjs`.

---

## 5. Pruebas pendientes

1. **UAT presencial** con cajero y administrador reales (firma en checklist G6).  
2. **F2** confirmación visual layout 58 mm.  
3. **F3** diálogo de impresión del navegador.  
4. **F4–F6** sesión con impresora térmica real.  
5. **C3** cerrar pestaña completa (revalidar en sesión humana; G5 ya lo cubrió en lab).  
6. **B8 UI** cierre de jornada en el mismo dispositivo Chromium tras sync (API ya PASS).  
7. Re-corrida opcional suites G si el código cambia.

---

## 6. Hallazgos funcionales

1. **Flujo online UI OK:** cobro con efectivo ≥ total c/IVA → COM + ticket no fiscal. Efectivo insuficiente bloquea cobro (mensaje claro) — observado en intento previo.  
2. **Offline OK:** provisional `LOCAL-…`, banner “PENDIENTE DE SINCRONIZACIÓN”, contador “1 pendiente(s)”, cierre de caja disabled.  
3. **Sync OK:** provisional → COM-00000024; outbox Acked.  
4. **Multiempresa OK:** A/B catálogos y usuarios distintos sin mezcla visible.  
5. **IndexedDB scoped** `u{user}__b{business}__d{device}` verificado.  
6. **“Revisar cola offline”** navega al harness debug P2-C0.3 (útil en lab; en UAT presencial confirmar si cajero debe usar solo bandeja en `/ventas`).  
7. **Cajas OPEN residuales** en devices Chromium tras la sesión lab — higiene operativa: cerrar al terminar UAT.

---

## 7. Riesgos operativos

| Riesgo | Nivel | Mitigación |
|--------|-------|------------|
| Aprobar impresión física sin HW | Alto | Mantener **PENDIENTE HW** |
| Confundir PASS técnico con aceptación de usuario | Alto | Firma humana obligatoria antes de piloto |
| Credenciales DEMO en guías | Medio | Mitigado en G7 (hoja interna) |
| Cajero borra datos del sitio con pendientes | Alto | Reforzado en guía; UAT verbal E4 |
| Lease largo offline vs cierre remoto | Medio | Capacitación + mensaje CASH_CLOSED (G5) |
| Iniciar piloto comercial tras solo lab | Crítico | **NO-GO** comercial |

---

## 8. Requisitos de autorización

Para avanzar hace falta autorización **explícita** y separada de:

| Siguiente paso | Quién autoriza | Condición |
|----------------|----------------|-----------|
| Sesión UAT presencial (cajero + admin + Tech) | Responsable operativo | Este informe + checklist G6 impresa |
| Sesión impresora física | Ops + Tech | Dispositivo 58/80 mm en lab/campo controlado |
| Piloto de campo con dinero real | Sponsor operativo | UAT humano PASS + impresión (si aplica) + checklist firmada |
| Restore DB / restart Postgres / migrate | Tech Lead + sponsor | **Fuera de G7** |
| SIAT / FactuBO | Legal/fiscal + producto | Fuera de alcance actual |

**No se emiten firmas ficticias.** Casillas de firma en `P2C1G6_UAT_CHECKLIST.md` permanecen vacías.

---

## 9. GO / NO-GO

| Decisión | Estado |
|----------|--------|
| Solicitar **sesión UAT presencial** de laboratorio/campo controlado (sin dinero real) | **GO condicionado** — base técnica lista; faltan humanos + impresora |
| Declarar UAT humano completo | **NO-GO** |
| Aprobar impresión física | **NO-GO** |
| Iniciar **piloto comercial** | **NO-GO** |

---

## 10. Cierre

G7 se detiene aquí: documentación de ejecución creada, secretos fuera de guías de usuario, evidencia lab registrada.  
**No** se inicia piloto. **No** commit/push. **No** dinero real.
