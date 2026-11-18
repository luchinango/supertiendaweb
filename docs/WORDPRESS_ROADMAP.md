# WORDPRESS_ROADMAP — Plugin CODEMEDIIA / SuperTienda

**Versión:** 1.1 — 16 de noviembre de 2026  
**Empresa:** CODEMEDIIA  
**Motor comercial:** SuperTienda

---

## Hechos verificados

- Cero código WordPress/WooCommerce/`wp-` en este repo.
- API actual no expone storefront estable de comprador final.
- Frontend Next = backoffice/POS, no canal público multi-tienda.

---

## Decisiones aprobadas

1. Plugin propio CODEMEDIIA usará SuperTienda como **motor comercial**.
2. WordPress = canal de presentación y ventas; no duplicar reglas de negocio.
3. El plugin podrá ofrecer catálogo, carrito, checkout, pedidos y conexión con **CODEMEDIIA Payments** y **FactuBo** (productos independientes).
4. **No** implementar el plugin en el MVP / Fase 1 de SuperTienda.
5. Pertenece a la expansión del ecosistema (Fase 7 del roadmap maestro).

---

## Recomendaciones técnicas

### Principio rector

```
WordPress → Plugin CODEMEDIIA → API SuperTienda → Payments / FactuBo
```

Precio, stock y pedido autoritativos viven en SuperTienda.

### Prerrequisitos en SuperTienda

1. OpenAPI `/api/v1` estable.
2. Credenciales por `businessId`.
3. Endpoints storefront (catálogo publicado, stock, checkout comprador, pedidos).
4. Canal `WORDPRESS` en pedidos/ventas.
5. Webhooks opcionales de catálogo/stock/pedido.

### Plugin (cuando corresponda)

| Pieza | Responsabilidad |
|-------|-----------------|
| Settings | URL API, credenciales, `businessId` |
| Blocks | Catálogo, producto, carrito |
| Checkout | UI WP; create order en SuperTienda |
| Pagos | Inicia cobro vía SuperTienda → Payments (**no** Red Enlace en PHP) |
| Factura | Solicitud vía SuperTienda → FactuBo |

### Qué no hacer

- No clonar inventario en MySQL de WP.
- No usar WooCommerce como motor.
- No empezar el plugin antes de POS online + API de pedidos online.

---

## Funcionalidades futuras

- Soft-launch en sitio demo CODEMEDIIA; migración desde WooCommerce si se valida comercialmente.

---

## Decisiones pendientes

1. ¿Primer canal online: storefront Next o WordPress directo?
2. ¿Migración desde WooCommerce de clientes?
3. Hosting WP objetivo.
4. Un plugin por comercio vs multisite.
5. Licenciamiento respecto a planes SuperTienda.
