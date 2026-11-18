# INTEGRATION_STRATEGY — Estrategia de integración (SuperTienda)

**Versión:** 1.1 — 16 de noviembre de 2026  
**Empresa:** CODEMEDIIA  
**Alcance:** Solo lo que ocurre **dentro** del repo SuperTienda y sus contratos hacia afuera.

Documentos complementarios:

- [`ECOSYSTEM_BOUNDARIES.md`](./ECOSYSTEM_BOUNDARIES.md)
- [`EXTERNAL_INTEGRATION_CONTRACTS.md`](./EXTERNAL_INTEGRATION_CONTRACTS.md)

---

## Hechos verificados

| Tema | Evidencia en repo |
|------|-------------------|
| Red Enlace | Sin SDK/cliente; solo `PaymentMethod.QR_PAYMENT` y UI |
| FactuBo | Sin referencias; hay `FiscalSettings` y campos factura en `Sale` |
| Alicia / Payments / Analytics | Ausentes |
| PIX / Binance / NFC | No implementados |
| OpenAPI | `/api-docs` vía TSOA — base para contratos |

Onboarding Red Enlace (comunicado de negocio, no en código): sandbox con acceso previo; onboarding comercial no concluido. La integración de proveedor corresponde a **CODEMEDIIA Payments**, no a este repo.

---

## Decisiones aprobadas

1. Productos externos en **repositorios independientes**.
2. **No** implementar Red Enlace, FactuBo, Alicia ni Payments dentro de SuperTienda.
3. SuperTienda define contratos para **solicitar cobros** y **recibir estados de pago**; Payments usa el proveedor.
4. Separar pedido, venta, solicitud de cobro, referencia de transacción, asignación de pagos y factura.
5. No confirmar pagos por visualizar QR ni por fotografía de comprobante.
6. FactuBo emite facturas; SuperTienda solicita y almacena resultados/referencias.
7. Alicia consume APIs autorizadas; no JWT de empleados humanos.
8. Integraciones reales = etapas posteriores a P0–P5 del núcleo (ver [`PHASE_1_IMPLEMENTATION_PLAN.md`](./PHASE_1_IMPLEMENTATION_PLAN.md)).

---

## Recomendaciones técnicas

### Qué sí preparar en SuperTienda (sin SDKs de proveedor)

```
domain comercial
  → ports (interfaces de integración)
    → httpClient hacia CODEMEDIIA Payments   [futuro]
    → httpClient hacia FactuBo               [futuro]
    → webhooks entrantes autenticados        [futuro]
```

**Prohibido en este repo:** `adapters/redenlace` con SDK del banco/proveedor, lógica de conciliación avanzada, custodia de fondos.

### Modelo comercial de cobros (referencia)

1. SuperTienda registra venta (posible `paymentStatus=PENDING`).
2. Solicita cobro a CODEMEDIIA Payments (idempotent `paymentRequestId`).
3. Payments usa Red Enlace u otro proveedor.
4. Se genera QR / referencia.
5. Cliente paga.
6. Payments verifica.
7. SuperTienda recibe resultado (webhook/evento autenticado).
8. Se actualiza estado comercial de la venta.

Offline: **no** QR ni confirmaciones bancarias.

### FactuBo

- SuperTienda envía solicitud de factura con datos de venta/negocio.
- FactuBo responde estado/folio/CUF/refs.
- Numeración fiscal autoritativa: FactuBo (transición local solo si se aprueba).

### Alicia / Analytics / WordPress

- Ver contratos en [`EXTERNAL_INTEGRATION_CONTRACTS.md`](./EXTERNAL_INTEGRATION_CONTRACTS.md).
- Reportes operativos iniciales viven en SuperTienda; Analytics consume eventos después.

### Versionado

- Publicar OpenAPI estable antes de onboarding de partners.
- Ambientes: local / sandbox / production por producto externo.

---

## Funcionalidades futuras

- Cliente HTTP Payments/FactuBo, webhooks, pairing auxiliar con estados de cobro en vivo.
- PIX/Binance/NFC pago tras verificación de condiciones.
- Outbox de eventos hacia Alicia/Analytics.

---

## Decisiones pendientes

1. Fechas y credenciales reales del sandbox Red Enlace (equipo Payments).
2. ¿FactuBo ya tiene API o se diseña en paralelo?
3. Modalidad tributaria del piloto.
4. Esquema de auth servicio-servicio CODEMEDIIA.
5. Ubicación del trabajo previo de APIs Red Enlace (otro repo).
