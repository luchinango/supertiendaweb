# OFFLINE_STRATEGY — Estrategia online/offline

**Versión:** 1.1 — 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA  
**Prioridad de implementación:** P5 ([`PHASE_1_IMPLEMENTATION_PLAN.md`](./PHASE_1_IMPLEMENTATION_PLAN.md))

---

## Hechos verificados

- El sistema actual es **online-only** en la práctica.
- No se encontró en el frontend:
  - Service Worker / Workbox
  - `manifest.json` PWA
  - IndexedDB / OPFS / Dexie
  - Cola de sincronización
  - Manejo de `navigator.onLine` / indicadores de sync
- Persistencia cliente observada: `localStorage` (tokens, preferencias) y caché SWR (efímera).
- Backend sin endpoints de sync, outbox, idempotency keys ni versionado de conflictos.
- Schema sin tablas de cola offline / dispositivos / sync state.
- Comentario de riesgo del propio plan maestro aplicable: no todos los navegadores garantizan almacenamiento local permanente.

---

## Decisiones aprobadas

### Modalidad 1 — Online

Uso del backend central, sincronización y servicios externos. Es el modo actual pretendido (aún incompleto funcionalmente).

### Modalidad 2 — Offline individual (1ª versión comercial)

Incluida en el objetivo comercial inicial. Un PC o celular debe poder:

- Tener catálogo local
- Consultar precios
- Registrar ventas
- Descontar inventario local
- Mantener cola persistente de operaciones pendientes
- Usar identificadores únicos anti-duplicación
- Sincronizar al recuperar conexión
- Mostrar indicadores de conexión/sincronización
- Recuperarse ante cierres inesperados
- Informar ventas pendientes y posibles conflictos

### Modalidad 3 — Offline multicaja en red local

Segunda etapa. Varias cajas coordinadas vía servidor local compartido (ventas, inventario, cajas, usuarios) y sync posterior a la nube. **No implementar en MVP inicial**, pero no tomar decisiones que la impidan.

### Limitaciones offline aprobadas

No asumir offline para:

- Cobros QR externos / confirmación de pagos electrónicos
- Publicación de catálogos en internet
- Sync con dispositivos remotos
- Operaciones fiscales que exijan conectividad SIN

Facturación offline: evaluar aparte según modalidad tributaria y requisitos SIN (FactuBo es producto independiente).

Cobros QR / confirmaciones CODEMEDIIA Payments: **siempre online**; no simular confirmación offline.

---

## Recomendaciones técnicas

### Principios

1. **API online primero con idempotencia**: cada mutación acepta `Idempotency-Key` / `clientOperationId` único (UUID v4/v7).
2. **Outbox local**: operaciones POS se escriben primero en storage local; un worker las envía al recuperar red.
3. **Snapshot de catálogo**: descarga periódica de productos/precios/stock relevante por `businessId`.
4. **Reloj de versiones**: `updatedAt` + `version` (o hash) por entidad para detectar conflictos.
5. **UI honesta**: badges “Sin conexión”, “N pendientes de sync”, “Conflicto en producto X”.
6. **No confirmar pagos QR offline**; permitir venta en efectivo/crédito local según reglas de negocio.

### Stack sugerido (cliente)

| Pieza | Opción recomendada |
|-------|--------------------|
| Storage | IndexedDB (p. ej. Dexie) con fallback y aviso si falla |
| PWA | Evaluar en Fase 3; no asumir que resuelve offline POS completo |
| Cola | Tabla `outbox` local: tipo, payload, status, retries, lastError |
| Auth offline | Sesión previa válida + política de expiración; sin refresh remoto |
| Recuperación | Rehidratar cola al arrancar; no borrar hasta ACK servidor |

### Sync servidor

- Endpoint batch `POST /sync/push` (operaciones) + `GET /sync/pull` (cambios desde cursor).
- Respuestas por ítem: `applied` | `duplicate` | `conflict` | `rejected`.
- Política de conflicto inicial recomendada para stock: **servidor gana en catálogo**; ventas offline se aceptan si `clientOperationId` es nuevo y se recalcula stock con auditoría de ajuste.
- Diseñar `terminalId` / `deviceId` aunque Modalidad 3 no se implemente aún.

### No bloquear Modalidad 3

Evitar:

- Estado global de inventario solo en memoria de un browser
- IDs no namespaced por dispositivo
- Lógica de caja que asuma un único cliente conectado sin `cashRegisterId` servidor

Preparar:

- Concepto de terminal
- Servidor local futuro como otro “sync peer” compatible con el mismo protocolo

### Relación con PWA

Evaluar PWA para celular autónomo (instalabilidad, caché de assets). Medir límites reales de storage (Safari/iOS, partición de storage, evicción). Si PWA no alcanza para POS offline robusto, considerar wrapper (Capacitor) en etapa posterior sin reescribir el núcleo.

---

## Decisiones pendientes

1. ¿Offline individual es bloqueante del primer cobro a clientes o solo del “lanzamiento comercial” declarado?
2. Política exacta de conflictos de stock (rechazar venta offline vs aceptar y ajustar).
3. ¿PWA pura vs Capacitor/TWA para Modalidad 2?
4. ¿Qué operaciones mínimas offline además de venta: apertura de caja, altas de cliente, ajustes de inventario?
5. Retención máxima de cola local y cifrado at-rest del IndexedDB.
6. Alcance de facturación offline frente a SIN (asesoría tributaria).
