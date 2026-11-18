# P2-C0 — Arquitectura offline-first

**Fecha:** 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Modo:** auditoría y diseño (**sin código, sin schema, sin migraciones, sin datos**)  
**Precondiciones:** P2-B cerrado en Docker local (`supertienda_dev`)  
**Documentos relacionados:** [`OFFLINE_STRATEGY.md`](./OFFLINE_STRATEGY.md), [`P2A_HYBRID_CATALOG_DESIGN.md`](./P2A_HYBRID_CATALOG_DESIGN.md), [`P2B_HYBRID_MIGRATION_REPORT.md`](./P2B_HYBRID_MIGRATION_REPORT.md)

**Estado:** propuesto — **requiere aprobación explícita** antes de implementar.

---

## 0. Resumen ejecutivo

SuperTienda es hoy **online-only**. No hay PWA, Service Worker, IndexedDB, cola de sincronización ni API de sync. Los IDs son `Int` autoincrement; no hay idempotencia ni versionado de conflictos. El POS frontend no persiste ventas; las rutas backend de venta/caja/POS están **desmontadas**.

Esta fase propone una arquitectura **offline-first compatible** con Next.js 15, Express/TSOA, Prisma y PostgreSQL, alineada a la **Modalidad 2** de `OFFLINE_STRATEGY.md` (caja individual) y sin cerrar la puerta a Modalidad 3 (multicaja LAN).

**Principio rector:** escribir localmente primero (outbox durable); sincronizar cuando haya red **y** sesión válida; **nunca** asumir que “reconectó = sync inmediato”; nunca perder en silencio una operación rechazada.

---

## 1. Estado actual del proyecto

### 1.1 Stack verificado

| Capa | Realidad |
|------|----------|
| Frontend | Next.js `^15.3.4`, React 19, SWR, axios, App Router (`frontend/`) |
| Backend | Express + TSOA + Prisma 6, PostgreSQL Docker |
| Catálogo | Híbrido P2-B: `PLATFORM_SHARED` / `BUSINESS_PRIVATE` + índices parciales |
| Auth | JWT RS256 access ~1h / refresh ~7d; sin revocación server-side |

### 1.2 Offline / PWA / almacenamiento local

| Capacidad | Presente | Evidencia |
|-----------|----------|-----------|
| Service Worker / Workbox / `next-pwa` | **No** | `frontend/package.json`, sin SW |
| `manifest` PWA | **No** | `frontend/public/` sin webmanifest |
| IndexedDB / Dexie / `idb` | **No** | — |
| Cola sync / Background Sync | **No** | — |
| `navigator.onLine` / UI offline | **No** | — |
| `localStorage` | **Sí** | tokens, `businessId` (`frontend/lib/auth-utils.ts`) |
| Caché SWR | **Sí** (efímera) | hooks `useCatalog`, `useProducts`; `revalidateOnReconnect` |
| Estrategia documentada | **Sí** | `docs/OFFLINE_STRATEGY.md` (plan, no código) |

### 1.3 Autenticación y multi-empresa

- Tokens en **localStorage** + cookie no-httpOnly `auth_token` (middleware Next).
- Refresh token se guarda en login; **flujo de refresh no cableado** en el cliente.
- Logout **solo local** (no endpoint de revocación).
- `businessId` fijado en login desde `employee.businessId`; **sin switcher real** (mock en configuraciones).
- Varias pantallas hacen fallback `businessId \|\| "1"` — riesgo de contaminación cruzada si se introduce offline sin aislar stores.

### 1.4 Dominios funcionales

| Dominio | Frontend | Backend expuesto |
|---------|----------|------------------|
| Catálogo POS | SWR → `GET /business-products/catalog` | Sí (TSOA) |
| Inventario / productos | SWR → `/products` (lecturas); mutaciones UI limitadas | Lecturas sí; mutaciones tenant **403** (P1-F); plataforma `/platform/*` |
| Productos privados | No | **No** (P2-C pendiente) |
| BusinessProduct precio/stock | Parcial vía catalog/BP | Sí (create/update/adjust/restock) |
| Carrito / venta | Context en memoria; checkout = `console.log` | Rutas `sale`/`pos`/`cart` **comentadas** en `app.ts` |
| Caja | Open vía API; close stub | Controllers legacy **no montados** en TSOA app |
| Inventario transacciones | UI órdenes compra online | Legacy no montado de forma uniforme |

### 1.5 Identificadores y unicidad

| Entidad | PK actual | Unicidad relevante |
|---------|-----------|-------------------|
| Product / Category / BusinessProduct / Sale / CashRegister / InventoryTransaction | `Int` autoincrement | Sin UUID cliente |
| Product SKU/barcode | Índices **parciales** por ámbito (P2-B) | Shared vs private; D2 permite barcode cruzado |
| Category name | Parcial por ámbito | Shared global / private por empresa |
| BusinessProduct | `@@unique(businessId, productId)` | — |
| Sale | `invoiceNumber` **global** unique; `cartId` unique | Bloqueante para numeración offline |
| CashRegister | `registerNumber` **global** unique | Idem |
| Payment | No hay modelo aparte | Campos en `Sale` |

**Implicación:** un cliente offline **no puede** inventar el PK server. Debe usar UUID local + mapeo post-sync.

### 1.6 Idempotencia y versionado hoy

| Mecanismo | Estado |
|-----------|--------|
| `Idempotency-Key` / `clientOperationId` | Ausente |
| Tabla `sync_operations` / outbox server | Ausente |
| `version` / ETag / `If-Match` | Ausente |
| `updatedAt` | Presente en entidades principales (base para pull) |
| Soft-delete `deletedAt` | Product/Category/Sale/…; **no** en BusinessProduct (hard delete) |
| Endpoints `/sync/*` | Ausentes |

### 1.7 Clasificación offline vs online (realidad actual → objetivo)

| Operación | Hoy | Objetivo Modalidad 2 |
|-----------|-----|----------------------|
| Lectura catálogo / precios BP | Online | Offline (snapshot IndexedDB) |
| Crear producto privado + BP | N/A (API inexistente) | Offline → outbox (P2-C debe nacer idempotente) |
| Mutar maestro plataforma | Online-only | **Siempre online** |
| Ajuste stock BP | Online | Offline con política de conflicto explícita |
| Venta efectivo / crédito local | No implementada | Offline (outbox) |
| Cobro QR / pasarela | N/A | **Siempre online** (`OFFLINE_STRATEGY`) |
| Apertura/cierre caja | Parcial / no montado | Offline limitado + sync; numeración por tenant |
| Login / refresh JWT | Online | Online; offline solo con sesión previa válida |
| Sync con dispositivos remotos | N/A | Online (pull/push) |
| Publicación catálogo plataforma | Online | Online |

---

## 2. Arquitectura propuesta

### 2.1 Vista lógica

```text
┌─────────────────────────────────────────────────────────────┐
│  Next.js PWA (shell + UI)                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ Auth gate    │  │ Sync status  │  │ Feature screens   │ │
│  │ (sesión loc) │  │ banner/badge │  │ POS / productos   │ │
│  └──────┬───────┘  └──────▲───────┘  └─────────┬─────────┘ │
│         │                 │                     │           │
│  ┌──────▼─────────────────┴─────────────────────▼─────────┐ │
│  │ Local Domain Layer (TypeScript)                        │ │
│  │  - repositories locales (Dexie)                        │ │
│  │  - outbox enqueue (única vía de mutación offline)      │ │
│  │  - proyección local (stock/precios/ventas pendientes)  │ │
│  └──────────────────────────┬─────────────────────────────┘ │
│                             │                               │
│  ┌──────────────────────────▼─────────────────────────────┐ │
│  │ IndexedDB (aislado por userId+businessId+deviceId)     │ │
│  │  entities | outbox | sync_state | id_map | secrets*    │ │
│  └──────────────────────────┬─────────────────────────────┘ │
│                             │ Sync Worker (foreground+idle) │
└─────────────────────────────┼───────────────────────────────┘
                              │ HTTPS cuando online + sesión OK
┌─────────────────────────────▼───────────────────────────────┐
│  Express / TSOA                                             │
│  POST /sync/push  ·  GET /sync/pull  ·  mutaciones idempot. │
│  tabla sync_operations (server) · versionado · stock locks  │
│  Prisma → PostgreSQL                                        │
└─────────────────────────────────────────────────────────────┘
```

\*Tokens: ver §7 (no mezclar JWT en claro con catálogo si se cifra el store).

### 2.2 PWA y estrategia de caché

| Capa | Política |
|------|----------|
| App shell (HTML/JS/CSS críticos) | Precache Workbox / Serwist; `NetworkFirst` o `StaleWhileRevalidate` para chunks |
| Rutas de app POS/inventario | Fallback a shell offline |
| API JSON | **No** cachear mutaciones en SW; lecturas opcionalmente `NetworkFirst` con TTL corto **solo** como red de seguridad — la fuente de verdad offline es IndexedDB |
| Imágenes de producto | `CacheFirst` con cuota y purga |
| Auth endpoints | NetworkOnly |

**Límites honestos:** Safari/iOS puede evictar storage; avisar al usuario si `navigator.storage.estimate()` baja de umbral. PWA no sustituye outbox durable ni sync API.

**Evaluación posterior (decisión pendiente):** Capacitor/TWA si la retención de IndexedDB en kioscos es insuficiente.

### 2.3 Flujo de escritura (write-behind)

1. UI llama repositorio local.  
2. Se asignan `localEntityId` (UUID) y `clientOperationId` (UUID).  
3. Se escribe proyección optimista en `entities`.  
4. Se encola fila en `outbox` (`pending`).  
5. Sync Worker (cuando `online` ∧ sesión usable ∧ no pausado) hace `POST /sync/push`.  
6. Por ítem: `applied` → mapear IDs server; `duplicate` → tratar como éxito; `conflict`/`rejected` → UI + estado no silencioso.  
7. Pull periódico/`visibilitychange`/`online` event → `GET /sync/pull?cursor=`.

**No** sincronizar solo por evento `online`: también backoff exponencial, retry jitter, y ventana de mantenimiento de sesión.

### 2.4 Componentes nuevos (cliente)

| Módulo | Responsabilidad |
|--------|-----------------|
| `OfflineStore` (Dexie) | Schema IndexedDB versionado |
| `OutboxService` | Encolar, reintentar, ACK |
| `SyncScheduler` | Orquestar push/pull; pausar en conflict storm |
| `IdMapper` | `localEntityId` ↔ `serverId` |
| `ConnectivityService` | `online` + health ping liviano (no confiar solo en `navigator.onLine`) |
| `SyncStatusStore` | Contadores para UI |
| `TenantScopeGuard` | Bloquear cross-tenant en storage |

### 2.5 Componentes nuevos (servidor — fases posteriores)

| Pieza | Rol |
|-------|-----|
| `sync_operations` | Idempotencia durable por `(businessId, clientOperationId)` |
| `POST /sync/push` | Batch de operaciones |
| `GET /sync/pull` | Delta paginado + tombstones |
| `entity.version` (o `rowVersion`) | Conflictos |
| `devices` / `terminals` | `deviceId`, última sync, opcional |
| Numeración por tenant | Facturas / cajas (reemplazar uniques globales) |

---

## 3. Modelo de datos local (IndexedDB)

**Aislamiento de DB name:**

```text
supertienda_offline__u{userId}__b{businessId}__d{deviceId}
```

Al logout o cambio de empresa: **cerrar** conexiones; no reutilizar la misma DB entre scopes. Operaciones pendientes del scope anterior permanecen en su DB hasta sync o decisión de usuario (§6.F).

### 3.1 Tablas locales propuestas

#### `meta`

| Campo | Tipo | Notas |
|-------|------|-------|
| key | string PK | p.ej. `schemaVersion`, `businessId`, `userId` |
| value | string/json | |

#### `entities`

Proyección materializada por tipo.

| Campo | Tipo | Notas |
|-------|------|-------|
| entityType | enum | `product`, `category`, `businessProduct`, `customer`, `sale`, … |
| localId | UUID | PK compuesto con type |
| serverId | int? | null si solo local |
| businessId | int | denormalizado |
| payload | json | snapshot de campos de negocio |
| version | int | versión server conocida; 0 si solo local |
| updatedAtLocal | ISO | |
| updatedAtServer | ISO? | |
| syncStatus | enum | `synced` \| `pending` \| `conflict` \| `tombstone` |
| deleted | bool | soft local |

#### `outbox`

| Campo | Tipo | Notas |
|-------|------|-------|
| clientOperationId | UUID PK | **idempotencia** |
| entityType | enum | |
| localEntityId | UUID | |
| opType | enum | `CREATE` \| `UPDATE` \| `DELETE` \| `SALE_COMPLETE` \| `STOCK_ADJUST` \| … |
| payload | json | cuerpo canónico a enviar |
| dependsOn | UUID[] | ops que deben aplicarse antes |
| status | enum | `pending` \| `sending` \| `acked` \| `conflict` \| `rejected` \| `dead` |
| attempts | int | |
| nextAttemptAt | ISO | backoff |
| lastError | string? | código + mensaje |
| createdAt | ISO | |
| ackedAt | ISO? | |
| serverResult | json? | ids mapeados, version |

#### `id_map`

| Campo | Tipo |
|-------|------|
| entityType + localId | PK |
| serverId | int |
| mappedAt | ISO |

#### `sync_state`

| Campo | Tipo |
|-------|------|
| stream | string PK | p.ej. `catalog`, `sales`, `stock` |
| cursor | string | opaque server cursor |
| lastPullAt | ISO? |
| lastPushAt | ISO? |
| lastError | string? |

#### `session_cache` (mínimo, sensible)

| Campo | Notas |
|-------|-------|
| accessExp | epoch |
| refreshExp | epoch |
| role | |
| displayName | |
| **no** password | |

Tokens: preferir **sessionStorage** o cookie httpOnly futura; si deben vivir offline, cifrar con clave derivada de unlock de dispositivo (decisión pendiente §11).

### 3.2 Reglas de proyección local de stock

- Stock mostrado = `serverSnapshot.stock` + Σ ajustes locales pending/acked-not-pulled − Σ ventas locales pending.  
- Nunca mostrar stock “confirmado servidor” si hay ops `conflict`/`rejected` sin resolver sobre esa entidad.

---

## 4. Contrato API de sincronización

### 4.1 Identidad de dispositivo

Header o body en toda sync:

```http
X-Device-Id: <uuid estable del terminal>
X-Client-App: supertienda-web/<version>
```

Registro opcional: `POST /devices/register` (fase posterior).

### 4.2 `POST /sync/push`

```json
{
  "businessId": 1,
  "deviceId": "…",
  "operations": [
    {
      "clientOperationId": "018f…",
      "opType": "PRODUCT_PRIVATE_CREATE",
      "localEntityId": "018f…",
      "baseVersion": null,
      "payload": {
        "name": "Aceite 1L",
        "sku": "ACE-1L",
        "categoryLocalId": "…",
        "categoryServerId": 1,
        "customPrice": 15.5,
        "initialStock": 10
      },
      "createdAt": "2026-11-16T20:00:00.000Z"
    }
  ]
}
```

**Respuesta (por ítem, orden preservado):**

```json
{
  "results": [
    {
      "clientOperationId": "018f…",
      "status": "applied",
      "serverEntityId": 42,
      "version": 1,
      "idMappings": [{ "localEntityId": "018f…", "serverId": 42, "entityType": "product" }]
    },
    {
      "clientOperationId": "018f…",
      "status": "duplicate",
      "serverEntityId": 42,
      "version": 1
    },
    {
      "clientOperationId": "018f…",
      "status": "conflict",
      "code": "VERSION_CONFLICT",
      "server": { "serverEntityId": 7, "version": 5, "payload": { } },
      "hint": "SERVER_WINS_CATALOG"
    },
    {
      "clientOperationId": "018f…",
      "status": "rejected",
      "code": "SKU_COLLISION",
      "message": "SKU ya existe en ámbito privado de la empresa",
      "retryable": false
    }
  ],
  "serverTime": "…"
}
```

**Reglas batch:**

- Máx. N ops (p.ej. 50) o tamaño payload.  
- Procesar en orden; si `dependsOn` no resuelto → `rejected`/`retryable` sin marcar dead.  
- Toda mutación idempotente también acepta header `Idempotency-Key: <clientOperationId>` en endpoints unitarios.

### 4.3 `GET /sync/pull`

```http
GET /sync/pull?businessId=1&cursor=<opaque>&limit=100&streams=catalog,stock,sales
```

```json
{
  "cursor": "next-opaque",
  "hasMore": true,
  "changes": [
    {
      "entityType": "businessProduct",
      "serverId": 3,
      "version": 12,
      "updatedAt": "…",
      "deleted": false,
      "payload": { "productId": 2, "customPrice": 15, "currentStock": 8 }
    },
    {
      "entityType": "product",
      "serverId": 9,
      "version": 3,
      "deleted": true,
      "deletedAt": "…"
    }
  ],
  "serverTime": "…"
}
```

**Paginación obligatoria.** Cliente no asume “un pull = mundo completo”.

### 4.4 Endpoints unitarios que deben volverse idempotentes

Prioridad alta (cuando se reactiven / creen):

| Endpoint (futuro / existente) | Clave |
|-------------------------------|-------|
| `POST /products/private` (P2-C) | `clientOperationId` |
| `POST /business-products` | idempotency |
| `PUT …/adjust-stock` | idempotency + `baseVersion` |
| `POST /sales` o `POST /pos/complete` | `clientOperationId` = id venta local |
| `POST /cash-registers/open\|close` | idempotency |
| Pagos embebidos en sale | misma clave que la venta |

### 4.5 Op types canónicos (inicial)

`PRODUCT_PRIVATE_CREATE`, `PRODUCT_UPDATE`, `CATEGORY_PRIVATE_CREATE`,  
`BP_UPSERT`, `STOCK_ADJUST`, `SALE_COMPLETE`, `SALE_CANCEL`,  
`CUSTOMER_CREATE`, `CASH_OPEN`, `CASH_CLOSE`

---

## 5. Idempotencia y versionado

### 5.1 Idempotencia

- **Cliente:** genera `clientOperationId` (UUID v7 preferido) **antes** de cualquier side-effect local.  
- **Servidor:** tabla `sync_operations`:

| Columna | Notas |
|---------|-------|
| `business_id` | tenant |
| `client_operation_id` | unique compuesto con business |
| `device_id` | auditoría |
| `op_type` | |
| `request_hash` | detectar same-key different-body → error |
| `status` | applied/rejected |
| `response_json` | para re-entregar si se perdió la respuesta (caso E) |
| `created_at` | |

**Caso E (ACK perdido):** reenvío con mismo `clientOperationId` → `duplicate` + mismo `response_json` → cliente marca `acked` sin duplicar venta/pago.

### 5.2 Versionado

- Columna `version Int @default(1)` (o `row_version`) en entidades syncables: Product, Category, BusinessProduct, Sale (cabecera), Customer.  
- Update exige `baseVersion` = versión leída; si no coincide → `VERSION_CONFLICT`.  
- `updatedAt` sigue existiendo; **no** usarlo solo como lock (relojes).

### 5.3 IDs híbridos

| Espacio | Uso |
|---------|-----|
| `localEntityId` UUID | UI y FKs locales |
| `serverId` Int | compatibilidad schema actual |
| Futuro opcional | `publicId UUID` en server (migración aparte, **no** en P2-C0) |

P2-C0 **no** obliga a migrar PKs a UUID ahora; exige **mapa** durable.

---

## 6. Reglas de conflicto y casos A–J

### 6.1 Política por dominio (propuesta inicial)

| Dominio | Política | Notas |
|---------|----------|-------|
| Catálogo maestro plataforma | Server wins; cliente no muta offline | |
| Producto/categoría **privada** | Last-write-wins con `version`; conflicto → UI merge manual de campos | SKU collision → rejected no retry |
| Precio `customPrice` | Server wins en conflicto de versión; cola muestra valor server | |
| Stock | **No LWW ciego**; ver §6.2 | |
| Ventas | Append-only: si op nueva → apply; nunca “merge” de dos ventas | |
| Pagos | Ligados a `clientOperationId` de venta; no duplicar | |

### 6.2 Stock multi-dispositivo

1. Cada venta/ajuste lleva `expectedStock` opcional y cantidad delta.  
2. Servidor aplica `UPDATE … SET stock = stock - :qty WHERE id=:id AND stock >= :qty` (o política de sobregiro).  
3. Si no hay stock suficiente:  
   - **Opción recomendada MVP:** `rejected` `INSUFFICIENT_STOCK` con stock actual → caja debe corregir (no silenciar).  
   - **Alternativa (decisión pendiente):** aceptar venta y generar `STOCK_ADJUST` de auditoría negativo (oversell) — solo con flag de negocio.  
4. Pull posterior actualiza proyección; dispositivos no “negocian” stock P2P en Modalidad 2.

### 6.3 Ventas y pagos offline

**Permitido offline (propuesto):** efectivo, crédito tienda (cuenta cliente local), “pago mixto” sin pasarela.  
**Prohibido offline:** QR / tarjeta / pasarela CODEMEDIIA Payments (confirmación online).

Reglas:

- `invoiceNumber` **no** se inventa localmente como número fiscal final; usar `localSaleNumber` + asignar invoice server-side en apply (requiere numeración **por businessId**, no unique global).  
- Ticket local puede mostrar `LOCAL-…` hasta sync.  
- Cancelación offline solo de ventas aún `pending`/`acked` según reglas; cancelar venta ya sync → nueva op `SALE_CANCEL` idempotente.

### 6.4 Casos obligatorios

#### A — Crear producto offline y sincronizar una sola vez

1. `PRODUCT_PRIVATE_CREATE` + `BP_UPSERT` (o una op atómica `PRODUCT_PRIVATE_CREATE_WITH_BP`) con un `clientOperationId`.  
2. Push → `applied` + mappings.  
3. Re-push → `duplicate`, mismo `serverEntityId`.  
**Requisito P2-C:** API privada nace con idempotencia.

#### B — Dos productos offline con el mismo SKU

1. Dos ops locales (mismos o distintos devices) con SKU igual en ámbito privado.  
2. Primera `applied`; segunda `rejected` `SKU_COLLISION`.  
3. UI: estado `rejected`, no borrar payload; usuario renombra SKU → **nueva** op (o `RETRY_WITH_PATCH` explícito); la original queda en historial `dead`/`rejected` visible.

#### C — Modificar producto offline vs otro dispositivo online

1. Cliente A `baseVersion=3` offline; servidor ya en v4 por B.  
2. Push A → `conflict` + payload server.  
3. UI: diff campo a campo; resolver genera nueva op con `baseVersion=4` (no reutilizar el mismo `clientOperationId` con body distinto).

#### D — Vender offline desde dos cajas con stock central limitado

1. Stock server 5; caja1 vende 4 (pending); caja2 vende 4 (pending).  
2. Sync caja1 → apply stock=1; caja2 → `INSUFFICIENT_STOCK` o oversell según política.  
3. Indicador de ventas `rejected` obligatorio; no marcar como cobrada en servidor.

#### E — Servidor OK, respuesta perdida

1. Reintento mismo `clientOperationId` → `duplicate` + body original.  
2. Cliente ACK sin segunda venta ni segundo pago.

#### F — Cambio de usuario o empresa con ops pendientes

1. Bloquear switch si `outbox` tiene `pending|sending|conflict` **o**  
2. Flujo guiado: “Sincronizar ahora” / “Quedar en este dispositivo (no borrar)” / cancelar switch.  
3. Nunca mezclar outbox de `businessId=1` en sesión `businessId=2`.  
4. Logout: advertencia; DB de scope se conserva cifrada/aislada hasta sync o purge explícito.

#### G — Reinicio de navegador

1. Outbox en IndexedDB; al boot `OutboxService.recover()`: `sending` → `pending` si no hay ACK.  
2. Rehidratar proyecciones; no depender de SWR ni de Context React.

#### H — Varios días sin internet

1. Cola crece; TTL de retención configurable (p.ej. 30–90 días) con alerta.  
2. Access JWT expira: permitir **consulta y nuevas ventas locales** bajo “modo degradado” si refresh aún no venció → intentar refresh al reconectar **antes** de push.  
3. Si refresh venció: **freeze push**; UI “Reautenticar para sincronizar”; **no** borrar outbox.  
4. Pull al reauth con cursor guardado; si cursor inválido → full snapshot + reconcile.

#### I — Evitar duplicación de pagos y ventas

1. Una venta = un `clientOperationId`.  
2. Pagos no son ops independientes en MVP; van en payload de `SALE_COMPLETE`.  
3. Server unique `(business_id, client_operation_id)`.

#### J — Evitar pérdida silenciosa de rechazos

1. `rejected`/`conflict` nunca pasan a `acked` automáticamente.  
2. Badge persistente + bandeja “Problemas de sync”.  
3. Telemetría local de conteo; opcionalmente `POST /sync/client-errors` cuando online.  
4. Purge de `rejected` solo con confirmación de usuario tras export/ack manual.

---

## 7. Seguridad

### 7.1 Aislamiento

- DB IndexedDB namespaced por `userId + businessId + deviceId`.  
- Guard en cada query local.  
- Sync API valida JWT `businessId` ≡ body (como P0.3).

### 7.2 Datos sensibles

| Dato | Tratamiento |
|------|-------------|
| Password | Nunca local |
| Access/Refresh JWT | Minimizar lifetime en disco; preferir memoria + refresh al volver online; si offline largo, cifrar at-rest (decisión) |
| Catálogo / precios / stock | IndexedDB; no compartir entre orígenes |
| Ventas pendientes | IndexedDB; export solo autenticado |
| PII clientes | Minimizar campos offline; soft-purge al logout si política lo exige |

### 7.3 Sesión vencida sin internet

| Estado | Lectura local | Nueva venta local | Push |
|--------|---------------|-------------------|------|
| Access OK | Sí | Sí | Sí |
| Access expirado, refresh OK | Sí | Sí (degradado) | Tras refresh online |
| Refresh expirado | Sí (solo lectura ops ya locales) | **Política pendiente** (recomendada: bloquear nuevas mutaciones o permitir con watermark “no sync hasta login”) | Bloqueado |
| Logout explícito | Según purge | No | No |

### 7.4 Amenazas POS kiosk

- XSS → robo de outbox/JWT: CSP estricta, sin tokens en logs.  
- Dispositivo robado: PIN de app / logout remoto futuro (Modalidad 3+).  
- Reloj local manipulado: serverTime en pull; no confiar en createdAt cliente para autorización, solo ordenación.

---

## 8. Impacto sobre P2-C

P2-C (API productos privados + adopción) **no debe implementarse como CRUD online clásico** si se quiere offline-first coherente.

| Decisión P2-C | Impacto offline |
|---------------|-----------------|
| `POST /products/private` | **Obligatorio** aceptar `clientOperationId` / Idempotency-Key desde v1 |
| Transacción Product+BP | Una op atómica o dos con `dependsOn` |
| Uniques parciales SKU | Mapear errores a `SKU_COLLISION` estable |
| Adoptar shared → BP | Online preferente; si offline, op `BP_UPSERT` idempotente |
| Mutaciones tenant legacy `/products` | Seguir 403; no usarlas como canal offline |
| Snapshot nombre en SaleItem (D5) | Útil para tickets offline; puede ir con ventas, no bloquea P2-C0 |
| Numeración factura | Debe volverse **por empresa** antes de ventas offline reales |

**Orden sugerido:** aprobar P2-C0 → implementar cimientos sync/idempotencia mínimos en backend → P2-C API privada ya idempotente → luego POS offline (P2-C1/P5).

---

## 9. Plan de implementación por etapas

| Etapa | Nombre | Entrega | Schema DB |
|-------|--------|---------|-----------|
| **P2-C0** | Diseño (este doc) | Aprobación | No |
| **P2-C0.1** | Cimientos sync server | `sync_operations`, `version` en entidades clave, push/pull stub, tests HTTP idempotencia | Sí (migración local autorizada) |
| **P2-C0.2** | Cliente store + outbox | Dexie, aislamiento tenant, recovery boot, UI status | No |
| **P2-C0.3** | Snapshot catálogo | Pull catalog/BP; POS lee IndexedDB | No |
| **P2-C** | API privada idempotente | `POST /products/private` + tests | Mínimo o ninguno |
| **P2-C1** | Ventas offline MVP | Remount TSOA sales; numeración por tenant; casos A,E,G,I | Sí |
| **P2-C2** | Conflictos stock/SKU + bandeja | Casos B,C,D,J | Posible |
| **P2-C3** | PWA shell + hardening sesión | Casos F,H; storage estimate | No |
| **P5 / Mod. 3** | Multicaja LAN | Peer local | Diseño aparte |

Cada etapa: autorización explícita; solo Docker local hasta nueva orden.

---

## 10. Pruebas HTTP y de navegador

### 10.1 HTTP (backend)

| ID | Prueba |
|----|--------|
| H1 | Mismo `clientOperationId` dos veces → segunda `duplicate`, un solo row negocio |
| H2 | Mismo key, body distinto → 409 `IDEMPOTENCY_PAYLOAD_MISMATCH` |
| H3 | `baseVersion` vieja → `conflict` |
| H4 | Push batch con dependencia rota → no marca dead silencioso |
| H5 | Pull cursor paginado `hasMore` |
| H6 | Pull incluye tombstones |
| H7 | Cross-tenant push → 403 |
| H8 | Venta duplicada no duplica stock decrement |
| H9 | SKU privado duplicado → `rejected` estable |
| H10 | Refresh expirado → push 401; ops no se borran en cliente (contrato) |

### 10.2 Navegador (Playwright / manual kiosk)

| ID | Prueba |
|----|--------|
| B1 | Offline: crear producto; online: una sola vez en server (A) |
| B2 | Dos SKU iguales offline → rechazo visible (B) |
| B3 | Edit concurrente → pantalla conflicto (C) |
| B4 | Dos perfiles/browsers stock (D) |
| B5 | Kill tab tras 200 server antes de ACK → no duplica (E) |
| B6 | Switch empresa bloqueado con pending (F) |
| B7 | Restart browser; cola intacta (G) |
| B8 | Clock + expiry refresh; reauth; sync (H) |
| B9 | Doble click pagar → una venta (I) |
| B10 | Rejected permanece en bandeja tras reload (J) |
| B11 | Application tab: DB name aislada por tenant |
| B12 | SW: app abre sin red (shell); API mutación no “fake success” |

---

## 11. Riesgos y decisiones pendientes

### 11.1 Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Evicción IndexedDB (móvil) | Alertas cuota; evaluar Capacitor |
| Unique global `invoiceNumber` / `registerNumber` | Migrar a unique `(businessId, number)` antes de POS offline |
| Stock race sin transacciones | `$transaction` + `WHERE stock >=` en apply |
| JWT en localStorage | Plan de endurecimiento; CSP; eventual httpOnly |
| POS actual incompleto | No fingir offline sobre `console.log`; cablear venta server primero o junto a outbox |
| Partial indexes solo en SQL | Seguir `migrate deploy`; nunca `db push` |
| Ambigüedad barcode D2 | Búsqueda local con detector de ambigüedad |
| Sync “cuando haya wifi” saturado | Backoff, batch limits, prioridad ventas > catálogo |
| Modalidad 3 prematura | Mantener `deviceId` y protocolo sync peer-compatible |

### 11.2 Decisiones pendientes (requieren aprobación)

1. **Política stock insuficiente en sync:** ¿rechazar venta offline o aceptar oversell auditado?  
2. **¿PWA pura vs Capacitor** para Modalidad 2 comercial?  
3. **Mutaciones offline mínimas además de venta:** ¿alta cliente, ajuste inventario, apertura caja?  
4. **Retención máxima** de outbox y purge post-logout.  
5. **Cifrado at-rest** de IndexedDB: ¿obligatorio en MVP?  
6. **¿Bloquear nuevas ventas** con refresh JWT vencido o permitir watermark?  
7. **¿Introducir `version` en misma migración que `sync_operations` o por entidad gradual?**  
8. **¿UUID `publicId` en server a medio plazo** o mapa local permanente?  
9. Relación fiscal SIN / FactuBo con tickets `LOCAL-*` (asesoría).  
10. ¿P2-C0.1 (cimientos sync) **antes** o **en paralelo controlado** con P2-C API privada?

### 11.3 Fuera de alcance de esta aprobación

- Implementar sync, PWA, Dexie, POS offline.  
- Cambiar `schema.prisma` o datos.  
- Modalidad 3 multicaja.  
- Confirmar pagos QR offline.

---

## 12. Criterio de aceptación de este diseño

Se considera P2-C0 listo para cerrar cuando el sponsor confirme:

- [ ] Arquitectura general (PWA + IndexedDB + outbox + push/pull)  
- [ ] Política de conflictos (catálogo / stock / ventas)  
- [ ] Orden de etapas (§9)  
- [ ] Decisiones §11.2 (al menos 1, 2, 3, 6)  

**Sin esa aprobación no se escribe código de sincronización.**

---

## Apéndice A — Mapa rápido de archivos auditados

| Área | Paths |
|------|-------|
| Frontend auth | `frontend/lib/auth-utils.ts`, `frontend/contexts/AuthContext.tsx`, `frontend/middleware.ts` |
| Catalog/POS | `frontend/hooks/useCatalog.ts`, `frontend/app/ventas/page.tsx`, `frontend/components/features/sales/PaymentPanel.tsx` |
| API client | `frontend/lib/api-client.ts`, `frontend/next.config.js` |
| Backend mount | `backend/src/app.ts` |
| Auth JWT | `backend/src/services/authService.ts` |
| Schema / hybrid | `backend/prisma/schema.prisma`, `…/20261116184500_hybrid_catalog/migration.sql` |
| Contención catálogo | `backend/src/helpers/catalogContainment.ts` |
| Estrategia previa | `docs/OFFLINE_STRATEGY.md` |

## Apéndice B — Relación con OFFLINE_STRATEGY.md

Este documento **detalla y operacionaliza** la Modalidad 2 ya aprobada en `OFFLINE_STRATEGY.md`, sin contradecir:

- Offline individual comercial  
- Sin QR offline  
- Preparar `deviceId` para Modalidad 3  
- UI honesta de sync  

Cualquier divergencia futura debe actualizar **ambos** docs en la misma autorización.
