# ECOSYSTEM_BOUNDARIES — Fronteras del ecosistema CODEMEDIIA

**Versión:** 1.0 — 16 de noviembre de 2026  
**Producto en este repo:** SuperTienda  
**Empresa:** CODEMEDIIA ([codemediia.com](https://www.codemediia.com))

---

## Hechos verificados

- El repositorio `supertiendaweb` contiene únicamente el stack SuperTienda (Next.js + Express/TSOA/Prisma).
- No existen módulos ejecutables de Payments, FactuBo, Alicia, Analytics, menús digitales ni Red Enlace.
- La documentación Fase 0/1.1 describe el estado parcial del núcleo comercial.

---

## Decisiones aprobadas

1. Los demás productos se desarrollan en **proyectos y repositorios independientes**.
2. SuperTienda opera como producto independiente y se integra solo vía **APIs/eventos/contratos**.
3. CODEMEDIIA no implementa Red Enlace, FactuBo, Alicia ni menús digitales completos **dentro** de SuperTienda.
4. Modelo inicial de cobros: CODEMEDIIA como **integrador tecnológico**; cada comercio hace onboarding con Red Enlace; CODEMEDIIA **no recibe ni custodia fondos**.
5. Pasarela propia CODEMEDIIA = evaluación regulatoria futura, no alcance actual.

---

## Mapa de responsabilidades

| Responsabilidad | SuperTienda | CODEMEDIIA Payments | FactuBo | Alicia | Analytics | Menús digitales |
|-----------------|:-----------:|:-------------------:|:-------:|:------:|:---------:|:---------------:|
| Catálogo / precios / stock | Sí | — | — | Lectura API | Lectura eventos | Propio futuro |
| Variantes, import CSV, fotos | Sí | — | — | — | — | Propio futuro |
| Clientes / proveedores | Sí | — | — | Lectura/acciones acotadas | — | — |
| POS / cajas / ventas | Sí | — | — | — | Eventos | Pedidos mesa futuro |
| Pedidos online | Sí | Cobro asociado | Factura | Seguimiento | Eventos | Canal propio |
| Offline individual POS | Sí | No (QR online) | Evaluar SIN | — | — | — |
| Generación QR / cobro | Solicita | **Sí** | — | — | — | Puede solicitar |
| Conciliación de cobros | Refs | **Sí** | — | — | Reportes | — |
| Confirmación verificable de pago | Recibe estado | **Sí** | — | — | — | — |
| Emisión fiscal boliviana | Solicita / guarda refs | — | **Sí** | — | — | — |
| Chat / agentes | Expone API | — | — | **Sí** | — | Integración futura |
| Dashboards MLOps | Reportes operativos | Liquidaciones | — | — | **Sí** | — |
| Plugin WordPress | Motor API | Cobros | Facturas | — | — | — |

---

## SuperTienda — Dentro de alcance

- Catálogo de productos y servicios; categorías; variantes/atributos (planificados).
- Inventario, precios, impuestos comerciales locales.
- Clientes, proveedores, órdenes de compra.
- POS, cajas, ventas presenciales, pedidos/ventas online.
- Importación masiva, fotografías, descuentos/promociones (planificados).
- Administración PC y celular; reportes comerciales.
- Offline individual; preparación multiempresa (sucursales futuras).
- Almacenar referencias externas de cobro/factura y actualizar estados comerciales.
- Contratos de integración versionados (documentados; clientes HTTP cuando existan los productos).

## SuperTienda — Fuera de alcance (prohibido en este repo)

- SDK o flujos de **Red Enlace** (u otros proveedores de pago).
- Lógica completa de **CODEMEDIIA Payments** (QR provider, conciliación avanzada, liquidaciones).
- Lógica fiscal completa de **FactuBo** / SIAT como producto.
- **Alicia** (chatbot/agentes).
- **CODEMEDIIA Analytics** / MLOps.
- Menús digitales de restaurante (mesas, comandas, divisores de cuenta, NFC de mesa) como producto completo.
- Custodia de fondos / pasarela propia sin autorización.
- Confirmar pagos por foto de comprobante o por solo mostrar QR.

---

## CODEMEDIIA Payments — Fuera de este repo

Responsabilidades futuras:

- Generación de QR; cobros con o sin pedido previo.
- Conciliación automática y asistida; pagos no asociados.
- Confirmación verificable; reportes de cobros y liquidaciones.
- Integración Red Enlace y futuros proveedores; evaluación NFC pago.

SuperTienda solo: solicitar cobro + recibir estados + guardar refs.

---

## FactuBo / Alicia / Analytics / Menús / NFC

| Producto | Rol | Relación con SuperTienda |
|----------|-----|--------------------------|
| FactuBo | Facturación computarizada boliviana | API solicitud/resultado |
| Alicia | Atención y agentes | APIs autorizadas de consulta/acción |
| Analytics | Control y MLOps | Eventos/datos autorizados |
| Menús digitales | Vertical restaurantes | Producto/módulo separado |
| NFC | Enlace / iniciador / (futuro) pago | Solo puntos de extensión en ST |

### NFC — diferencias obligatorias

1. **Enlace o identificador** (abre URL/menú/mesa).
2. **Iniciador de operación comercial** (abre pedido o solicita cobro).
3. **Pago bancario contactless** (requiere integración y habilitación; no asumir que el teléfono es terminal bancaria).

---

## Recomendaciones técnicas

1. Mantener este documento como checklist de PR: ¿el cambio invade otro producto?
2. Cualquier pantalla de “cobro QR” en SuperTienda debe orquestar contra el **contrato Payments**, no contra Red Enlace directo.
3. Numeración y detalle de contratos: [`EXTERNAL_INTEGRATION_CONTRACTS.md`](./EXTERNAL_INTEGRATION_CONTRACTS.md).

---

## Funcionalidades futuras

- Repos independientes, auth entre servicios, webhooks, feature flags por plan comercial.

---

## Decisiones pendientes

1. Nombres canónicos de repositorios Git de cada producto.
2. Ownership de equipos por producto.
3. Catálogo comercial de paquetes integrados (precios/límites).
4. Criterios regulatorios para eventual pasarela propia.
