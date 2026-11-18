# P2-C0.2 — Informe IndexedDB y Outbox Offline

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Ámbito:** Frontend local (Dexie/IndexedDB) + Docker local para regresiones backend  
**Precondiciones:** P2-C.B cerrado  
**Estado:** Completado — sin migraciones, sin POS/caja/facturación, sin PWA/SW, sin commit/push

---

## 0. Resumen ejecutivo

Se implementó la infraestructura offline-first en el frontend: **Dexie sobre IndexedDB**, outbox durable, worker de **push** hacia `POST /sync/push`, gate de sesión (refresh vencido bloquea mutaciones nuevas) y badge de estado. **No** se implementó pull de catálogo (P2-C0.3), POS ni service worker.

**Fase 0:** baselines seed BP 1–4 OK; residuos de tests documentados (no borrados automáticamente). Helpers SQL de prueba endurecidos.

---

## 1. Arquitectura IndexedDB

```text
UI / AuthContext / SyncStatusBadge
        │
        ▼
Local domain (lib/offline)
  enqueueMutation ──► Dexie TX (entity + outbox)
  runPushCycle    ──► POST /sync/push (máx. 50)
        │
        ▼
IndexedDB por scope:
  supertienda_offline__u{userId}__b{businessId}__d{deviceId}
```

- **Sin SSR:** `assertBrowser()` / hooks solo `'use client'`.
- **Tokens:** access/refresh siguen en `localStorage` (existente); **no** se guardan en IndexedDB. Solo epochs de expiración para el gate.
- **deviceId:** estable en `localStorage` (`supertienda_device_id`), no es secreto de auth.

### Dependencia

- `dexie@^4` — compatible con Next.js 15 / React 19 (API solo cliente).

---

## 2. Stores y tipos

| Store | Clave | Contenido |
|-------|-------|-----------|
| `products` | `localId` | Proyección producto privado local |
| `categories` | `localId` | Categorías privadas locales |
| `businessProducts` | `localId` | BP / precio / stock local |
| `outbox` | `clientOperationId` | Cola durable de ops |
| `idMap` | `entityType:localId` | UUID local → serverId |
| `syncState` | `stream` | cursor / lastPush / errores |
| `deviceMeta` | `key` | userId, businessId, deviceId, schemaVersion |

Tipos: `frontend/lib/offline/types.ts`  
Estados outbox: `pending` | `sending` | `acked` | `conflict` | `rejected` | `dead`

---

## 3. Flujo de operaciones

1. UI llama `enqueueMutation(scope, …)` tras `assertMutationsAllowed()`.
2. Transacción Dexie: escribe proyección local + fila outbox (`pending`) con UUID.
3. `runPushCycle`: lock por scope → recupera `sending` huérfanas → lote ≤50 con deps `acked` → marca `sending` → `POST /sync/push` con **mismo UUID**.
4. Resultados:
   - `applied` / `duplicate` → `acked` + `idMap` + version en entidad.
   - `conflict` / `rejected` → se **conservan** (nunca delete automático).
   - red/timeout → vuelve a `pending` (mismo UUID, backoff).
5. Errores definitivos (`SKU_COLLISION`, `FORBIDDEN_ROLE`, …) → `rejected` sin reintento infinito.

---

## 4. Seguridad por empresa y usuario

| Regla | Implementación |
|-------|----------------|
| Aislamiento multiempresa | DB name incluye `businessId` + `userId` + `deviceId` |
| JWT ≠ scope | Push aborta con `SCOPE_MISMATCH` |
| Logout | Limpia tokens + gate; **no** borra IndexedDB/outbox |
| Refresh vencido | Bloquea **nuevas** mutaciones y pausa push |
| Otra cuenta | No puede enviar cola de otro scope (DB distinta) |
| Badge | `OfflineStatusHost` muestra conexión, sesión y pendientes |

### Límites honestos del almacenamiento local

- IndexedDB es accesible a scripts del mismo origen (XSS = lectura del catálogo/outbox local).
- Varios perfiles/navegadores = distintos `deviceId` / DBs.
- Safari/iOS puede evictar storage; cuota → `QUOTA_EXCEEDED`.
- No sustituye cifrado at-rest ni httpOnly cookies; tokens siguen en localStorage (deuda previa).

---

## 5. Fase 0 — integridad (solo lectura)

**Incidente P2-C.B:** SQL multilínea en `cmd.exe -c "..."` truncaba el `WHERE` → soft-delete masivo.

**Mitigación en tests:** aplanar whitespace + **bloquear** `UPDATE`/`DELETE` sin `WHERE` en:

- `run-p2b-integrity.ts`
- `run-p2c01-sync-http.ts`
- `run-p2ca-pull-concurrency.ts`
- `run-p2cb-private-catalog-http.ts`
- `run-p2c02-bp-integrity-audit.ts` (nuevo)

**Baselines seed (verificados):**

| id | business | product | price | stock | soft |
|----|----------|---------|-------|-------|------|
| 1 | 1 | 1 | 8.50 | 100 | active |
| 2 | 2 | 1 | 9.00 | 40 | active |
| 3 | 1 | 2 | 15.00 | 25 | active |
| 4 | 2 | 3 | 7.00 | 60 | active |

**Residuos explicados (no eliminados automáticamente):**

- BP activo id **118** (producto test `P2CB-…-ViaSync`) — leftover de suite P2-C.B.
- Soft-deleted de tags P2CB en empresa 1 (ops de prueba).

Ninguna diferencia **no explicada** en baselines 1–4 → se continuó.

---

## 6. Pruebas ejecutadas

### Frontend `npm run test:offline` — 16/16

Cubre: save offline, recover tras “reload”, retry UUID, pérdida HTTP, dependsOn, idMappings, VERSION_CONFLICT, SKU_COLLISION, cambio empresa/usuario, sesión vencida, mutex dos pestañas, IDB unavailable/cuota, no borrado silencioso, SCOPE_MISMATCH, orphan sending.

### Backend / TypeScript

| Suite | Resultado |
|-------|-----------|
| `test:p2c02:audit` | Baselines OK |
| `test:p0` … `test:p2cb:http` | Todas verdes |
| `tsc` backend / frontend | OK |

---

## 7. Limitaciones

- **Sin pull** de catálogo (P2-C0.3).
- **Sin PWA / service worker**.
- **Sin POS / ventas / caja / fiscal**.
- Push requiere `NEXT_PUBLIC_API_URL` (o base vacía relativa según despliegue) y JWT válido.
- Mutex es **in-memory por pestaña**; BroadcastChannel cross-tab queda para endurecer en P2-C0.3 si hace falta.
- Residuo BP 118 permanece hasta limpieza manual autorizada.

---

## 8. Preparación para P2-C0.3 (sync catálogo)

Listo para:

1. `GET /sync/pull` → proyectar changes en stores `products` / `categories` / `businessProducts`.
2. Persistir `syncState.cursor` + `snapshotAt`.
3. Aplicar tombstones (`deleted`).
4. Orquestar pull+push en scheduler (online ∧ sesión OK).
5. UI de conciliación para `conflict` / `rejected`.

**P2-C0.2 cerrado.**
