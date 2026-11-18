# POS_MULTIDEVICE — POS, móvil autónomo y celular auxiliar QR

**Versión:** 1.1 — 16 de noviembre de 2026  
**Producto:** SuperTienda by CODEMEDIIA

---

## Hechos verificados

### Capacidad POS existente

- Schema: `Cart`, `CartItem`, `Sale`, `SaleItem`, `CashRegister`, `AuditCashRegister`, enums de pago/estado.
- Backend: `backend/src/services/posService.ts` (inicio de venta con caja abierta, operaciones de carrito, completar venta), más `saleService`, `cashRegisterService`, `cartService`.
- Controllers Express-style: `posController`, `saleController`, `cartController`, `cashRegisterController` — **no registrados en TSOA** (`routes.ts` / `app.ts`).
- Frontend:
  - Página `frontend/app/ventas/page.tsx` (catálogo + layout POS).
  - `CartContext` in-memory.
  - `PaymentPanel`: completar transacción es stub (`console.log` + clear).
  - Componentes de caja bajo `frontend/components/features/cash-register/`.
  - Apertura de caja con `userId` hardcodeado en formularios; `businessId = 1` en paths backend legacy.
- Responsive Tailwind presente; layout general desktop-first (sidebar). No hay modo “solo cobro QR”.
- No hay WebSockets/SSE/Socket.IO para empujar QR a un segundo dispositivo.
- Impresión: `printService` con muestra ESC/POS a IP fija; no integrado al flujo de venta.

### Lo que no existe

- Pairing seguro de celular auxiliar
- Pantalla dedicada de cobro QR remoto
- Confirmación de pago por proveedor
- App móvil nativa / PWA instalable para POS autónomo

---

## Decisiones aprobadas

### A. Computadora

Administración, inventario, ventas POS, pedidos, reportes y operaciones.

### B. Celular autónomo

Administrar y vender desde el teléfono sin PC. Evaluar PWA y sus límites (storage, offline, compatibilidad).

### C. Celular auxiliar de cobro

Cuando hay POS en PC, un celular autorizado actúa **solo** como pantalla secundaria del QR / estado de cobro:

1. Vendedor registra compra en PC  
2. SuperTienda solicita cobro a **CODEMEDIIA Payments** (futuro)  
3. QR/estado llega al celular vinculado (permisos limitados)  
4. Cliente paga  
5. Payments verifica con el proveedor (p. ej. Red Enlace)  
6. SuperTienda actualiza y ambos dispositivos muestran estado  

Regla crítica: **no** marcar pagos como confirmados solo por generar o visualizar el QR. **No** implementar el proveedor ni Payments dentro de este repo.

Planes: Emprendedor (móvil), Negocios (PC + auxiliar), Empresarial (multicaja). Un solo producto software. No implementar cobros reales en Fase 1 P0–P3.

---

## Recomendaciones técnicas

### Fase inmediata (POS online cableado)

1. Exponer TSOA:
   - `CashRegister` open/close/status
   - `POS` start/add/update/remove/complete
   - `Sales` read/cancel (según reglas)
2. Conectar `ventas` y `PaymentPanel` a esas APIs.
3. Exigir caja abierta y `businessId`/`userId` desde JWT.
4. Persistir venta antes de iniciar cobro electrónico; estado `paymentStatus=PENDING`.

### Celular autónomo

1. Optimizar rutas críticas (`/ventas`, productos, caja) a layout touch (una columna, CTA grandes).
2. Evaluar PWA (manifest + SW de assets) sin prometer offline completo hasta Fase 3.
3. Reutilizar la misma API; no crear app paralela.

### Celular auxiliar QR (post núcleo; depende de Payments)

1. Modelo `DevicePairing`: código de un solo uso; rol `PAYMENT_DISPLAY` con scopes mínimos.
2. Canal realtime por `businessId` + `saleId` / `paymentRequestId`.
3. Estados: `QR_REQUESTED` → `QR_DISPLAYED` → `PAYMENT_PENDING` → `PAID|FAILED|EXPIRED`.
4. Transición a `PAID` solo tras evento autenticado desde **CODEMEDIIA Payments** (no por render del QR).
5. PC = fuente de verdad del estado comercial si el auxiliar pierde red.
6. Ver contratos en [`EXTERNAL_INTEGRATION_CONTRACTS.md`](./EXTERNAL_INTEGRATION_CONTRACTS.md).

### Seguridad

- Scope mínimo en token del auxiliar (solo lectura de intentos de pago asignados).
- Revocación de pairing desde administración.
- Auditoría de quién solicitó cobro y en qué terminal.

### Hardware

- Escáner de códigos: priorizar entrada teclado/HID en POS web antes de SDKs propietarios.
- Impresoras: abstraer `printService` detrás de interfaz; no hardcodear IP.

---

## Decisiones pendientes

1. ¿El auxiliar QR es requisito del plan Negocios en el primer piloto o solo demo posterior?
2. Tecnología realtime: WebSocket propio vs servicio managed (Ably/Pusher) vs SSE + polling fallback.
3. ¿Un celular puede ser a la vez autónomo POS y auxiliar, o roles excluyentes por sesión?
4. ¿Impresión de ticket es MVP del POS PC?
5. Criterios de aceptación PWA (instalable Android/iOS, almacenamiento mínimo garantizado).
