# P2-C1.F1 — Cash Lease (autorización de caja offline)

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Entorno:** Docker local `supertienda_dev`  
**Estado:** **COMPLETADO — GO para P2-C1.F2**  
**Esquema PostgreSQL:** sin cambios (sin migraciones)

---

## 1. Arquitectura implementada

Autorización offline de caja emitida **solo por el servidor**, firmada con HMAC-SHA256 (`CashLeaseService`).

Claims vinculados:

| Campo | Origen |
|-------|--------|
| `businessId` | Caja OPEN real |
| `userId` | Caja OPEN real |
| `deviceId` | Caja OPEN real |
| `cashRegisterId` | Caja OPEN real |
| `leaseId` | `cl_{cashRegisterId}_{openingMs}` |
| `issuedAt` | `openingDate` de la caja (no “ahora” del cliente) |
| `expiresAt` | `openingDate + 8h` (TTL fijo) |

Token: `base64url(JSON claims).base64url(HMAC(canonicalPayload))`.  
Secreto: `CASH_LEASE_SECRET` → `JWT_SECRET` → `SYNC_HMAC_SECRET` (fallback solo en non-prod). **Nunca expuesto al frontend.**

Flujo:

```
CASH_OPEN / GET /cash-registers/open
        → issueCashLease(openingDate) → token + metadatos públicos
        → FE guarda en IndexedDB (cashRegisters)

Venta offline
        → evaluateOfflineCashAuth (scope + expiresAt + token presente)
        → outbox SALE_CREATE con cashLeaseToken

Reconexión /sync/push
        → valida caja OPEN real + tenant/user/device
        → si hay cashLeaseToken → verifyCashLeaseToken
        → precio/stock/idempotencia sin cambios
```

**Limitación documentada:** un lease **no** detecta un cierre remoto mientras el dispositivo está desconectado. Al sincronizar, `SALE_CREATE` sigue rechazando con `CASH_CLOSED` / `FORBIDDEN` / lease inválido; la venta provisional permanece en outbox para revisión.

---

## 2. Cambios de backend

| Archivo | Cambio |
|---------|--------|
| `backend/src/services/CashLeaseService.ts` | **Nuevo** — emit / verify / `publicLeaseFields`, TTL 8h, skew 60s |
| `backend/src/services/PosCashSyncService.ts` | `CASH_OPEN` incluye lease; `SALE_CREATE` verifica token si viene |
| `backend/src/controllers/PosCashRegisterController.ts` | `GET open` devuelve lease (mismo `expiresAt` desde `openingDate`) |
| `backend/src/routes/routes.ts` | Regenerado TSOA (DTO con campos lease) |
| `backend/tests/run-p2c1f1-cash-lease-http.ts` | Suite HTTP + unitaria F1 |
| `backend/package.json` | Script `test:p2c1f1:http` |

Compatibilidad: ventas online **sin** `cashLeaseToken` siguen válidas (B2-A). Ausencia de token no sustituye validaciones de caja/tenant/precio/stock.

---

## 3. Cambios de frontend

| Archivo | Cambio |
|---------|--------|
| `frontend/lib/offline/types.ts` | Campos lease en `LocalCashRegister` |
| `frontend/lib/pos/posCashAuth.ts` | Auth por lease; GET **no** extiende `leaseExpiresAt` |
| `frontend/lib/pos/posOnlineService.ts` | Tipo `OpenCashRegister` con lease |
| `frontend/lib/pos/posSaleOfflineService.ts` | Exige token; lo adjunta al payload outbox |
| `frontend/app/ventas/page.tsx` | `applyCashOpenLease` tras `CASH_OPEN` applied |
| `frontend/tests/offline/sales-cash.test.ts` | Casos lease / scope / sesión / reloj |

Bloqueos offline: sin lease, vencido, usuario/empresa/dispositivo distintos, caja cerrada, sesión vencida.  
`CASH_OPEN` / `CASH_CLOSE` siguen **solo online**.

---

## 4. Validación del lease

**Servidor (`verifyCashLeaseToken`):**

1. Formato y parseo de claims  
2. Firma HMAC timing-safe → `LEASE_TAMPERED`  
3. Scope `businessId` / `userId` / `deviceId` / `cashRegisterId` → `LEASE_SCOPE`  
4. Expiración (+ skew 60s) → `LEASE_EXPIRED`  
5. Luego validaciones existentes de caja OPEN, precio, stock, idempotencia

**Cliente (`evaluateOfflineCashAuth`):** presencia de token/leaseId/expiresAt, scope local, `now > expiresAt` → bloqueo (sin skew de firma; la firma se valida al push).

---

## 5. Expiración y renovación

- TTL: **8 horas** desde `openingDate` (no desde GET).  
- `GET /cash-registers/open` **re-emite el mismo** `expiresAt` (determinista).  
- Frontend **rechaza** cualquier extensión silenciosa de `leaseExpiresAt` vía GET.  
- Renovación real: nueva apertura online (`CASH_OPEN`) tras cierre o fin de lease.  
- Reloj local adelantado: FE bloquea al cruzar `expiresAt`; servidor usa skew de 60s al verificar.

---

## 6. Seguridad multiempresa

- Lease firmado con scope de empresa/usuario/dispositivo/caja.  
- Cross-tenant: token de empresa B en venta A → `LEASE_SCOPE`.  
- `GET open` filtrado por actor + `X-Device-Id` → no filtra cajas ajenas.  
- Lease **no** omite `FORBIDDEN` / aislamiento de caja / `PRICE_MISMATCH` / stock.

---

## 7. Pruebas ejecutadas

### F1 HTTP (`npm run test:p2c1f1:http` desde host)

| Caso | Resultado |
|------|-----------|
| Lease válido | PASS |
| Lease manipulado | PASS |
| Empresa / usuario / dispositivo / caja incorrectos (unit) | PASS |
| Lease expirado | PASS |
| Reloj verificador adelantado | PASS |
| CASH_OPEN emite; GET no extiende | PASS |
| SALE_CREATE con lease válido | PASS |
| SALE_CREATE token manipulado | PASS |
| SALE_CREATE lease otra empresa | PASS |
| Cross-tenant GET | PASS |
| Caja cerrada (lease previo) → `CASH_CLOSED` | PASS |

**11/11 PASS**

### Offline FE (`test:p2c1c:offline` / sales-cash)

Incluye: sin caja, lease vencido, sin token, GET no extiende, venta provisional + outbox, scope incorrecto, reloj local, sesión vencida, rechazo stock, validaciones. **12/12 PASS**

---

## 8. Regresiones

| Suite | Resultado |
|-------|-----------|
| B2-A POS/caja HTTP | 16/16 PASS |
| B2-B cash read HTTP | 5/5 PASS |
| P2-C0.1 sync HTTP | 25/25 PASS |
| FE `test:offline` (outbox+catalog+stock+sales) | 45/45 PASS |
| `tsc --noEmit` backend | PASS |
| `tsc --noEmit` frontend | PASS |

Simulación 7 días (P2-C1.E): **no reejecutada** sobre datos existentes (evitar efectos colaterales); coberta por regresiones HTTP/offline anteriores.

---

## 9. Riesgos pendientes

1. **Cierre remoto offline:** ventas provisionales pueden encolarse tras un close remoto hasta el push; rechazo seguro al sincronizar (esperado).  
2. **Token opcional online:** un cliente online malicioso podría omitir el token; las validaciones de caja OPEN + actor siguen siendo la autoridad. F2 puede exigir token siempre si se desea.  
3. **Skew de reloj FE:** el cliente no verifica firma HMAC (sin secreto); un atacante local puede fabricar evidencia IDB, pero el servidor rechaza al sync.  
4. **Rotación de `CASH_LEASE_SECRET`:** invalida leases activos; documentar procedimiento operativo.  
5. **Sesión de caja vs leaseId:** leaseId es determinista por apertura; no hay tabla de revocación — la revocación operativa es `CASH_CLOSE` + estado OPEN.

---

## 10. GO/NO-GO para P2-C1.F2

| Criterio | Estado |
|----------|--------|
| Servidor emite lease en CASH_OPEN / GET open | OK |
| Servidor valida autorización en SALE_CREATE con token | OK |
| FE bloquea offline sin lease válido / scope / expiración | OK |
| GET no renueva autorización | OK |
| Sin migración de esquema | OK |
| Regresiones B2-A / B2-B / C1.C / sync / tsc | OK |
| Lease no sustituye tenant/precio/stock/caja real | OK |

### Veredicto: **GO → P2-C1.F2**

El servidor valida correctamente la autorización firmada cuando el cliente envía `cashLeaseToken`. La fase F1 queda cerrada sin commit/push/deploy.
